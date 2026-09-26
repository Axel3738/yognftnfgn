// Tester för skalningsbeslutet (skalning.ts via pnl.server.ts), de nya
// Totals-fälten och tipsens bidragsmarginal. Körs med `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";

const { compute, skalningsBeslut, skalningsKvoter, bidragsBand, beslutsText } = await import("../app/lib/pnl.server.ts");
const { evaluateTips } = await import("../app/lib/tips.server.ts");

/** Underlag med break-even 2,0× och mål 4,0× (bruttovinst 50 %, mål 25 %). */
function underlag(mer, extra = {}) {
  const totalSales = 100_000;
  const kv = skalningsKvoter({ totalSales, spend: totalSales / mer, grossProfit: 50_000, targetMargin: 0.25 });
  return { spendComplete: true, spend: totalSales / mer, orders: 100, ...kv, ...extra };
}
const flaggor = (extra = {}) => ({ kostnadOsaker: false, tullOkvitterad: false, dagar: 30, ...extra });

test("kvoterna: break-even = oms/bruttovinst, mål = oms/(bruttovinst − mål × oms), Evolve = BE + 1", () => {
  const kv = skalningsKvoter({ totalSales: 100_000, spend: 40_000, grossProfit: 50_000, targetMargin: 0.25 });
  assert.equal(kv.breakEvenMer, 2);
  assert.equal(kv.targetMer, 4);
  assert.equal(kv.evolveScaling, 3);
  assert.equal(kv.mer, 2.5);
  // Målet går inte att nå: bruttovinsten under målmarginalen.
  const ingen = skalningsKvoter({ totalSales: 100_000, spend: 1, grossProfit: 20_000, targetMargin: 0.25 });
  assert.equal(ingen.targetMer, null);
  assert.equal(ingen.breakEvenMer, 5);
});

test("gränserna: strax under break-even ⇒ pull, exakt break-even ⇒ hold, exakt målet ⇒ push", () => {
  assert.equal(skalningsBeslut(underlag(1.9999), flaggor()).niva, "pull");
  assert.equal(skalningsBeslut(underlag(2), flaggor()).niva, "hold");
  assert.equal(skalningsBeslut(underlag(3.9999), flaggor()).niva, "hold");
  assert.equal(skalningsBeslut(underlag(4), flaggor()).niva, "push");
  assert.equal(skalningsBeslut(underlag(6), flaggor()).niva, "push");
});

test("panelexemplet: MER 1,95 mot break-even 1,81 med fasta kostnader ⇒ håll, inte dra ner", () => {
  const kv = skalningsKvoter({ totalSales: 300_000, spend: 153_800, grossProfit: 165_700, targetMargin: 0.25 });
  const b = skalningsBeslut({ spendComplete: true, spend: 153_800, orders: 1000, ...kv }, flaggor());
  assert.equal(b.niva, "hold");
  assert.ok(Math.abs(kv.targetMer - 3.31) < 0.01, `mål ${kv.targetMer}`);
});

test("inget beslut: ofullständig annonskostnad, 2 ordrar, osäker kostnad, ingen spend, ingen break-even", () => {
  assert.equal(skalningsBeslut(underlag(3, { spendComplete: false }), flaggor()), null);
  assert.equal(skalningsBeslut(underlag(3, { orders: 2 }), flaggor()), null);
  assert.notEqual(skalningsBeslut(underlag(3, { orders: 3 }), flaggor()), null);
  assert.equal(skalningsBeslut(underlag(3), flaggor({ kostnadOsaker: true })), null);
  assert.equal(skalningsBeslut({ ...underlag(3), spend: 0, mer: null }, flaggor()), null);
  assert.equal(skalningsBeslut({ ...underlag(3), breakEvenMer: null }, flaggor()), null);
});

test("en dag säger aldrig push — kort period markeras", () => {
  const b = skalningsBeslut(underlag(10), flaggor({ dagar: 1 }));
  assert.equal(b.niva, "hold");
  assert.equal(b.kortPeriod, true);
  // Texten får aldrig vara hold-texten "under målet" — MER är ju över målet.
  assert.equal(beslutsText(b), "holdShort");
  assert.equal(beslutsText(skalningsBeslut(underlag(3), flaggor({ dagar: 1 }))), "hold");
  assert.equal(skalningsBeslut(underlag(10), flaggor({ dagar: 6 })).niva, "hold");
  assert.equal(skalningsBeslut(underlag(10), flaggor({ dagar: 7 })).niva, "push");
  // Dra ner på en dag är fortfarande dra ner — det är ingen skalning.
  const pull = skalningsBeslut(underlag(1.5), flaggor({ dagar: 1 }));
  assert.equal(pull.niva, "pull");
  assert.equal(pull.kortPeriod, false);
  assert.equal(beslutsText(pull), "pull");
});

test("okvitterad tull följer med som förbehåll", () => {
  assert.equal(skalningsBeslut(underlag(3), flaggor({ tullOkvitterad: true })).standardTull, true);
  assert.equal(skalningsBeslut(underlag(3), flaggor()).standardTull, false);
});

test("bidragsbanden: < 0 förlust, [0,10 %) tunt, [10 %, 20 %] sunt, > 20 % starkt", () => {
  assert.equal(bidragsBand(-0.001), "forlust");
  assert.equal(bidragsBand(0), "tunt");
  assert.equal(bidragsBand(0.0999), "tunt");
  assert.equal(bidragsBand(0.1), "sunt");
  assert.equal(bidragsBand(0.2), "sunt");
  assert.equal(bidragsBand(0.2001), "starkt");
});

/* ------------------------------------------------------------------------ */

let seed = 20260926;
const slump = () => {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
};
const avrunda = (x) => Math.round(x * 100) / 100;

function slumpPeriod() {
  const orders = 3 + Math.floor(slump() * 400);
  const aov = 150 + slump() * 700;
  const totalSales = avrunda(orders * aov);
  const unitCost = avrunda(aov * (0.15 + slump() * 0.6));
  return compute({
    from: "2026-09-01",
    to: "2026-09-01",
    spendReliable: true,
    sales: [{ day: "2026-09-01", orders, grossSales: totalSales, discounts: 0, returns: 0, netSales: totalSales, totalSales, shippingCharges: 0 }],
    sessions: [],
    spend: [{ day: "2026-09-01", spend: avrunda(totalSales * (0.05 + slump() * 0.9)), impressions: 0, clicks: 0 }],
    products: [{ productGid: "p", variantGid: "v", title: "T", variantTitle: null, units: orders, netSales: totalSales, unitCost }],
    costChanges: [],
    settings: { tariffPerOrder: avrunda(slump() * 40), feeRate: 0.02 + slump() * 0.03, targetMargin: 0.1 + slump() * 0.3 },
  }).totals;
}

test("egenskap: CPA ≤ max-CPA exakt när MER ≥ målet, CPA < break-even-CPA exakt när MER > break-even", () => {
  let prov = 0;
  for (let i = 0; i < 2000; i++) {
    const t = slumpPeriod();
    if (t.targetMer != null && t.maxCpaAtTarget != null) {
      assert.equal(t.cpa <= t.maxCpaAtTarget, t.mer >= t.targetMer, JSON.stringify(t));
      prov++;
    }
    if (t.breakEvenCpa != null && t.breakEvenMer != null) {
      assert.equal(t.cpa < t.breakEvenCpa, t.mer > t.breakEvenMer, JSON.stringify(t));
    }
    // Break-even-CPA finns precis när break-even-MER finns.
    assert.equal(t.breakEvenCpa == null, t.breakEvenMer == null);
    // Bidrag efter annonser är bruttovinst − annonser.
    assert.ok(Math.abs(t.netContribution - (t.grossProfit - t.spend)) < 1e-6);
  }
  assert.ok(prov > 500, `för få prov med nåbart mål: ${prov}`);
});

test("compute: evolveScaling = break-even + 1, max-CPA delar täljare med målet", () => {
  const t = compute({
    from: "2026-09-01", to: "2026-09-01", spendReliable: true,
    sales: [{ day: "2026-09-01", orders: 10, grossSales: 10_000, discounts: 0, returns: 0, netSales: 10_000, totalSales: 10_000, shippingCharges: 0 }],
    sessions: [],
    spend: [{ day: "2026-09-01", spend: 3_000, impressions: 0, clicks: 0 }],
    products: [{ productGid: "p", variantGid: "v", title: "T", variantTitle: null, units: 10, netSales: 10_000, unitCost: 300 }],
    costChanges: [],
    settings: { tariffPerOrder: 0, feeRate: 0, targetMargin: 0.25 },
  }).totals;
  // Bruttovinst 7 000: break-even 10 000/7 000, mål 10 000/4 500.
  assert.equal(t.evolveScaling, t.breakEvenMer + 1);
  assert.ok(Math.abs(t.targetMer - 10_000 / 4_500) < 1e-12);
  assert.equal(t.maxCpaAtTarget, 450);
  assert.equal(t.breakEvenCpa, 700);
});

/* ------------------------------------------------------------------------ */

test("tips: mer_over_margin tänds vid bidragsmarginal 0,44 med annonsandel 0,50 och fasta 0,03", () => {
  const m = { gross_margin: 0.55, contribution_margin: 0.44, mer: 0.5, fixed_share: 0.03, days: 30, orders: 100 };
  assert.ok(evaluateTips(m, "sv").some((t) => t.id === "mer_over_margin"));
  // Utan bidragsmarginalen (bara bruttomarginalen 0,55) tiger regeln — det
  // var felet: 0,50 > 0,55 − 0,03 är falskt.
  const { contribution_margin: _bort, ...utan } = m;
  assert.ok(!evaluateTips(utan, "sv").some((t) => t.id === "mer_over_margin"));
});

test("tips: håll-läget (annonserna går plus, de fasta saknas) ger inget kritiskt annonstips", () => {
  // Panelexemplet i CLAUDE.md: oms 300 000, bruttovinst 165 700, annonser 153 800, fasta 20 000, 30 dagar.
  const kv = skalningsKvoter({ totalSales: 300_000, spend: 153_800, grossProfit: 165_700, targetMargin: 0.25 });
  const beslut = skalningsBeslut({ spendComplete: true, spend: 153_800, orders: 100, ...kv }, flaggor());
  assert.equal(beslut.niva, "hold");
  const m = {
    contribution_margin: 165_700 / 300_000,
    mer: 153_800 / 300_000,
    fixed_share: 20_000 / 300_000,
    days: 30,
    orders: 100,
  };
  const tips = evaluateTips(m, "sv", 10);
  assert.ok(!tips.some((t) => t.id === "mer_over_margin"), "annonserna kostar 153 800 < bidraget 165 700");
  assert.ok(!tips.some((t) => t.severity === "critical" && t.metric === "mer"));
  // Gapet mot de fasta kostnaderna syns ändå: under 10 % kvar efter annons och fasta.
  assert.ok(tips.some((t) => t.id === "margin_squeeze"));
  // Komplementet: annonsandelen 51 % är över 40 % och under bidragsmarginalen.
  assert.ok(tips.some((t) => t.id === "mer_above_median"));
});

test("tips: mer_over_margin följer dra ner-linjen exakt (MER under break-even)", () => {
  const cm = 0.5;
  const ovan = evaluateTips({ contribution_margin: cm, mer: 0.5001, days: 30 }, "sv", 10);
  assert.ok(ovan.some((t) => t.id === "mer_over_margin"));
  const exakt = evaluateTips({ contribution_margin: cm, mer: 0.5, days: 30 }, "sv", 10);
  assert.ok(!exakt.some((t) => t.id === "mer_over_margin"));
  // Tänds utan fasta kostnader inmatade — fixed_share saknas i påsen ovan.
});

test("tips: margin_squeeze räknar på bidragsmarginalen, margin_low behåller bruttomarginalen", () => {
  // 0,40 − 0,25 − 0,06 = 0,09 < 0,10 ⇒ klämman. På bruttomarginalen 0,55 hade det varit 0,24.
  const klamd = evaluateTips({ gross_margin: 0.55, contribution_margin: 0.40, mer: 0.25, fixed_share: 0.06, days: 30 }, "en", 10);
  assert.ok(klamd.some((t) => t.id === "margin_squeeze"));
  // Bidragsmarginal 0,50 ⇒ 0,19 kvar, ingen klämma — även om bruttomarginalen är låg.
  const luft = evaluateTips({ gross_margin: 0.45, contribution_margin: 0.50, mer: 0.25, fixed_share: 0.06, days: 30, orders: 100 }, "en", 10);
  assert.ok(!luft.some((t) => t.id === "margin_squeeze"));
  // margin_low läser fortfarande bruttomarginalen.
  assert.ok(luft.some((t) => t.id === "margin_low"));
});
