// Betalavgifterna: faktiska bara för Shopify Payments, satsen för resten.
// Körs med `npm test`.
//
// Shopify skriver `fees` bara på Shopify Payments-transaktioner. Förut
// räknades hela dagens omsättning som "faktisk" så fort fältet frågats efter,
// så PayPal- och Klarna-ordrar fick avgift 0 och break-even blev för lågt.
import { test } from "node:test";
import assert from "node:assert/strict";

const { compute } = await import("../app/lib/pnl.server.ts");
const { raknaAvgifter, uppmattAvgift, blandadSats, betalvagar, betalvagNamn, tacktOms, kandExtern } =
  await import("../app/lib/avgifter.ts");

const nara = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≠ ${b}`);

const dag = (extra = {}) => ({
  day: "2026-09-20", orders: 10, grossSales: 1000, discounts: 0, returns: 0,
  netSales: 1000, totalSales: 1000, shippingCharges: 0, ...extra,
});

const bas = (sales, settings = {}) =>
  compute({
    from: "2026-09-20", to: "2026-09-20",
    sales, sessions: [], spend: [], products: [], costChanges: [], costTiers: [],
    settings: { tariffPerOrder: 0, feeRate: 0.03, targetMargin: 0.25, ...settings },
  });

test("compute: 1000 i omsättning, 600 täckt med avgift 18, sats 3 % ⇒ 18 + 400 × 0,03 = 30", () => {
  const r = bas([dag({ fees: 18, feesCoveredSales: 600 })]);
  nara(r.totals.fees, 30);
  nara(r.totals.feesActualShare, 0.6);
  assert.equal(r.totals.feesKnownDays, 1);
});

test("compute: en dag utan feesCoveredSales beter sig som förut (hela dagen faktisk)", () => {
  const r = bas([dag({ fees: 18 })]);
  nara(r.totals.fees, 18);
  nara(r.totals.feesActualShare, 1);
});

test("compute: en dag utan kända avgifter räknas helt med satsen", () => {
  const r = bas([dag({ fees: null })]);
  nara(r.totals.fees, 30);
  assert.equal(r.totals.feesKnownDays, 0);
  nara(r.totals.feesActualShare, 0);
});

test("compute: butik helt utan Shopify Payments får satsen, inte 0", () => {
  const r = bas([dag({ fees: 0, feesCoveredSales: 0, gatewaySales: { paypal: 700, klarna: 300 } })]);
  nara(r.totals.fees, 30);
  assert.deepEqual(r.totals.feesOtherGateways, ["paypal", "klarna"]);
});

test("compute: planens exempel — pris 400, COGS 150, tull 27,50, verklig avgift 3,5 % ⇒ BE 1,92×, inte 1,80×", () => {
  const produkt = [{ productGid: "P", variantGid: "V", title: "T", variantTitle: null, units: 1, netSales: 400, unitCost: 150 }];
  const kor = (s) =>
    compute({
      from: "2026-09-20", to: "2026-09-20",
      sales: [s], sessions: [], spend: [], products: produkt, costChanges: [], costTiers: [],
      settings: { tariffPerOrder: 27.5, feeRate: 0.035, targetMargin: 0.25 },
    }).totals;
  const pp = { day: "2026-09-20", orders: 1, grossSales: 400, discounts: 0, returns: 0, netSales: 400, totalSales: 400, shippingCharges: 0, fees: 0 };
  // Förut: fees 0 räknades som faktiskt ⇒ break-even 400 / 222,5 = 1,80.
  nara(kor(pp).breakEvenMer, 400 / 222.5);
  // Nu: PayPal-ordern är inte täckt ⇒ 3,5 % ⇒ 400 / 208,5 = 1,918.
  nara(kor({ ...pp, feesCoveredSales: 0 }).breakEvenMer, 400 / 208.5);
});

test("compute: satsen per marknad gäller den otäckta delen", () => {
  const r = compute({
    from: "2026-09-20", to: "2026-09-20",
    sales: [dag({ fees: 0, feesCoveredSales: 0 })], sessions: [], spend: [], products: [], costChanges: [], costTiers: [],
    settings: { tariffPerOrder: 0, feeRate: 0.03, targetMargin: 0.25, marketFees: { US: { feeRate: 0.05 } } },
    salesByMarket: { SE: 500, US: 500 },
  });
  nara(r.totals.fees, 500 * 0.03 + 500 * 0.05);
});

test("compute: tredjepartsavgiften tas bara på omsättning som bevisligen gick externt", () => {
  // 400 externt × 2 % = 8, ovanpå satsen på de 400.
  const r = bas([dag({ fees: 18, feesCoveredSales: 600 })], { thirdPartyFeeRate: 0.02 });
  nara(r.totals.fees, 30 + 8);
  nara(r.totals.feesThirdParty, 8);
  // En äldre dag (ingen uppdelning) eller en dag utan avgiftsdata får ingen.
  nara(bas([dag({ fees: 18 })], { thirdPartyFeeRate: 0.02 }).totals.feesThirdParty, 0);
  nara(bas([dag({ fees: null })], { thirdPartyFeeRate: 0.02 }).totals.feesThirdParty, 0);
});

test("raknaAvgifter: Shopify Payments och tom betalväxel listas aldrig som 'andra'", () => {
  const r = raknaAvgifter({
    sales: [dag({ fees: 5, feesCoveredSales: 500, gatewaySales: { shopify_payments: 500, "": 0, manual: 100, paypal: 400 } })],
    totalSales: 1000,
    satsBaserat: 30,
  });
  assert.deepEqual(r.andraBetalvagar, ["paypal", "manual"]);
});

test("tacktOms och kandExtern", () => {
  assert.equal(tacktOms({ totalSales: 100, fees: null, feesCoveredSales: 100 }), 0);
  assert.equal(tacktOms({ totalSales: 100, fees: 2 }), 100);
  assert.equal(tacktOms({ totalSales: 100, fees: 2, feesCoveredSales: 60 }), 60);
  assert.equal(kandExtern({ totalSales: 100, fees: 2 }), 0);
  assert.equal(kandExtern({ totalSales: 100, fees: 2, feesCoveredSales: 60 }), 40);
});

test("uppmattAvgift delar med täckt omsättning — PayPal-dagarnas nollor drar inte ner satsen", () => {
  const rader = [
    { fees: 29, totalSales: 1000, feesCoveredSales: 1000 },
    { fees: 0, totalSales: 1000, feesCoveredSales: 0 },
  ];
  const u = uppmattAvgift(rader);
  // Förut: 29 / 2000 = 1,45 %. Nu: 29 / 1000 = 2,9 %.
  nara(u[""].rate, 0.029);
  assert.equal(u[""].sales, 1000);
  assert.equal(u[""].totalSales, 2000);
  assert.equal(u[""].extern, 1000);
  assert.equal(u[""].days, 2);
});

test("uppmattAvgift: marknad utan täckt omsättning har ingen sats (sales 0), dagar utan avgifter hoppas över", () => {
  const rader = [
    {
      fees: 10, totalSales: 1000, feesCoveredSales: 500,
      markets: {
        SE: { fees: 10, totalSales: 500, feesCoveredSales: 500 },
        US: { fees: 0, totalSales: 500, feesCoveredSales: 0 },
        "": { fees: 0, totalSales: 0 },
      },
    },
    { fees: null, totalSales: 5000 },
  ];
  const u = uppmattAvgift(rader);
  nara(u.SE.rate, 0.02);
  assert.equal(u.US.sales, 0);
  assert.equal(u.US.rate, 0);
  nara(u[""].rate, 0.02);
  assert.equal(u[""].totalSales, 1000); // dagen utan avgifter räknas inte
});

test("uppmattAvgift: äldre rader utan feesCoveredSales räknas som helt täckta (som förut)", () => {
  const u = uppmattAvgift([{ fees: 30, totalSales: 1000 }]);
  nara(u[""].rate, 0.03);
});

test("blandadSats: Shopify Payments-satsen på täckt del, satsen + tredjepart på resten", () => {
  // 60 % täckt à 2,9 %, 40 % externt à 3,4 % + 2 % ⇒ 0,6·2,9 + 0,4·5,4 = 3,9 %.
  nara(blandadSats({ rate: 0.029, sales: 600, totalSales: 1000, extern: 400 }, 0.034, 0.02), 0.039);
  // Allt täckt ⇒ bara den uppmätta satsen.
  nara(blandadSats({ rate: 0.029, sales: 1000, totalSales: 1000, extern: 0 }, 0.05), 0.029);
  // Ingen omsättning ⇒ satsen.
  assert.equal(blandadSats({ rate: 0, sales: 0, totalSales: 0, extern: 0 }, 0.03), 0.03);
});

test("betalvagar: andelar, störst först, nollor och negativa bort", () => {
  const b = betalvagar([
    { gatewaySales: { shopify_payments: 600, paypal: 300 } },
    { gatewaySales: { paypal: 100, klarna: 0, manual: -5 } },
    { gatewaySales: null },
  ]);
  assert.deepEqual(b.map((x) => x.gateway), ["shopify_payments", "paypal"]);
  nara(b[0].share, 0.6);
  nara(b[1].share, 0.4);
  assert.deepEqual(betalvagar([]), []);
});

test("betalvagNamn", () => {
  assert.equal(betalvagNamn("shopify_payments", "—"), "Shopify Payments");
  assert.equal(betalvagNamn("", "Ingen betalning"), "Ingen betalning");
  assert.equal(betalvagNamn("cash_on_delivery", "—"), "cash on delivery");
});
