// Tull per marknad. Körs med `npm test`.
//
// Samma butik säljer till EU och till Nordamerika, och tullen är helt olika
// tal. Räknas alla ordrar på ett enda tal blir vinsten fel åt båda hållen —
// för hög på den dyra marknaden och för låg på den billiga.
import { test } from "node:test";
import assert from "node:assert/strict";

const { compute, tariffFor } = await import("../app/lib/pnl.server.ts");
const { stadaAvgifter } = await import("../app/lib/marknad.ts");

const dag = (day, netSales, orders) => ({
  day, orders, grossSales: netSales, discounts: 0, returns: 0, netSales,
  totalSales: netSales, shippingCharges: 0,
});

const settings = {
  tariffPerOrder: 10,
  feeRate: 0,
  targetMargin: 0.25,
  marketFees: { US: { feeRate: null, fxFeeRate: null, tariffPerOrder: 60 } },
};

test("tariffFor: marknadens eget tal när det finns, annars butikens", () => {
  assert.equal(tariffFor(settings, "US"), 60);
  assert.equal(tariffFor(settings, "SE"), 10);
  assert.equal(tariffFor(settings, ""), 10);
});

test("noll är ett giltigt tal, inte 'inget angivet'", () => {
  const s = { ...settings, marketFees: { GB: { feeRate: null, fxFeeRate: null, tariffPerOrder: 0 } } };
  assert.equal(tariffFor(s, "GB"), 0);
});

test("en post utan egen tull faller tillbaka på butikens", () => {
  const s = { ...settings, marketFees: { NO: { feeRate: 0.03, fxFeeRate: null, tariffPerOrder: null } } };
  assert.equal(tariffFor(s, "NO"), 10);
});

test("compute: varje marknads ordrar bär sin egen tull", () => {
  const r = compute({
    from: "2026-09-01", to: "2026-09-01",
    sales: [dag("2026-09-01", 10000, 10)],
    sessions: [], spend: [], products: [], costChanges: [], costTiers: [],
    settings,
    ordersByMarket: { SE: 6, US: 4 },
  });
  // 6 × 10 + 4 × 60 = 300
  assert.equal(r.totals.tariff, 300);
});

test("ordrar utan marknad tar butikens standardtull", () => {
  const r = compute({
    from: "2026-09-01", to: "2026-09-01",
    sales: [dag("2026-09-01", 10000, 10)],
    sessions: [], spend: [], products: [], costChanges: [], costTiers: [],
    settings,
    ordersByMarket: { US: 4 },
  });
  // 4 × 60 + 6 × 10 = 300
  assert.equal(r.totals.tariff, 300);
});

test("utan uppdelning räknas allt på butikens tal, som förut", () => {
  const r = compute({
    from: "2026-09-01", to: "2026-09-01",
    sales: [dag("2026-09-01", 10000, 10)],
    sessions: [], spend: [], products: [], costChanges: [], costTiers: [],
    settings,
  });
  assert.equal(r.totals.tariff, 100);
});

test("fler fördelade ordrar än totalt ger aldrig en negativ restpost", () => {
  const r = compute({
    from: "2026-09-01", to: "2026-09-01",
    sales: [dag("2026-09-01", 10000, 3)],
    sessions: [], spend: [], products: [], costChanges: [], costTiers: [],
    settings,
    ordersByMarket: { US: 4 },
  });
  assert.equal(r.totals.tariff, 240);
});

/* Tullen är ett BELOPP och avgiften en ANDEL. Valideras de med samma regel
   blir 27,50 kr i tull antingen bortkastat eller tolkat som 2750 %. */
test("stadaAvgifter tar tullen som belopp och avgifterna som andel", () => {
  const ut = stadaAvgifter({
    us: { feeRate: 0.039, fxFeeRate: 0.015, tariffPerOrder: 27.5 },
    SE: { feeRate: 0.019, fxFeeRate: null, tariffPerOrder: null },
  });
  assert.deepEqual(ut.US, { feeRate: 0.039, fxFeeRate: 0.015, tariffPerOrder: 27.5 });
  assert.deepEqual(ut.SE, { feeRate: 0.019, fxFeeRate: null, tariffPerOrder: null });
});

test("en avgift på 34 (procent skrivet som tal) kastas, en tull på 34 behålls", () => {
  const ut = stadaAvgifter({ US: { feeRate: 34, fxFeeRate: null, tariffPerOrder: 34 } });
  assert.equal(ut.US.feeRate, null);
  assert.equal(ut.US.tariffPerOrder, 34);
});

test("gamla poster utan tull läses in och får null", () => {
  const ut = stadaAvgifter({ US: { feeRate: 0.039, fxFeeRate: 0.015 } });
  assert.deepEqual(ut.US, { feeRate: 0.039, fxFeeRate: 0.015, tariffPerOrder: null });
});

test("negativ tull och skräp kastas, och en post utan något kvar tas bort", () => {
  const ut = stadaAvgifter({
    US: { feeRate: null, fxFeeRate: null, tariffPerOrder: -5 },
    GB: { feeRate: null, fxFeeRate: null, tariffPerOrder: "hej" },
    NO: { feeRate: null, fxFeeRate: null, tariffPerOrder: "12,50" },
  });
  assert.equal(ut.US, undefined);
  assert.equal(ut.GB, undefined);
  assert.equal(ut.NO.tariffPerOrder, 12.5);
});
