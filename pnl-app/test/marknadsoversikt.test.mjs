// Marknadsöversikten på panelen: break-even och bidrag per land. Körs med `npm test`.
//
// Det farliga felet här är tyst: ett land utan märkta kampanjer som visar
// annonskostnad 0 och ett bidrag som ser fantastiskt ut, eller USA räknat på
// Sveriges inköpspris. Båda ska synas som okänt/märkt, aldrig som ett tal.
import { test } from "node:test";
import assert from "node:assert/strict";

const { delaPaMarknader, raknaMarknader } = await import("../app/lib/marknadsoversikt.ts");

const rad = (units, netSales, unitCost = null) => ({
  productGid: "gid://shopify/Product/1",
  variantGid: "gid://shopify/ProductVariant/1",
  title: "Takskydd",
  variantTitle: null,
  units,
  netSales,
  unitCost,
  lines: { "1": units },
});
const del = (orders, sales, products) => ({
  orders, grossSales: sales, discounts: 0, returns: 0, netSales: sales, totalSales: sales, shippingCharges: 0, products,
});
const settings = { tariffPerOrder: 0, feeRate: 0, targetMargin: 0.25, marketFees: {} };

const dagar = [
  { day: "2026-09-20", markets: { SE: del(2, 2000, [rad(2, 2000)]), US: del(1, 2000, [rad(1, 2000)]) } },
  { day: "2026-09-21", markets: { SE: del(1, 1000, [rad(1, 1000)]) } },
  { day: "2026-09-22", markets: null },
];

test("delaPaMarknader: alla länder får samma dagar, dagar utan uppdelning räknas", () => {
  const { delar, dagarUtan } = delaPaMarknader(dagar);
  assert.deepEqual(Object.keys(delar).sort(), ["SE", "US"]);
  assert.equal(dagarUtan, 1);
  // USA sålde inte den 21:a men har ändå en (tom) rad den dagen
  assert.deepEqual(delar.US.sales.map((s) => s.day), ["2026-09-20", "2026-09-21"]);
  assert.equal(delar.US.sales[1].totalSales, 0);
  assert.equal(delar.SE.products[0].units, 3);
  assert.equal(delar.SE.products[0].market, "SE");
});

const bas = (over = {}) => {
  const { delar } = delaPaMarknader(dagar);
  return {
    delar,
    from: "2026-09-20",
    to: "2026-09-22",
    dagar: 3,
    spendPerMarknad: {
      SE: [{ day: "2026-09-20", spend: 600, impressions: 0, clicks: 0 }],
      US: [{ day: "2026-09-20", spend: 500, impressions: 0, clicks: 0 }],
    },
    spendOk: true,
    markta: new Set(["SE", "US"]),
    egnaKostnader: new Set(["US"]),
    egenTull: new Set(),
    // SE kostar 400/st, USA 1000/st (frakten)
    forbered: (rader) => rader.map((p) => ({ ...p, unitCost: p.market === "US" ? 1000 : 400 })),
    bas: { costChanges: [], costTiers: [], settings, freeVariants: [] },
    ...over,
  };
};

test("raknaMarknader: break-even, MER och bidrag per dag per land, största först", () => {
  const [se, us] = raknaMarknader(bas());
  assert.equal(se.market, "SE");
  assert.equal(se.totalSales, 3000);
  assert.equal(se.aov, 1000);
  // bruttovinst 3000 − 1200 = 1800 → break-even 3000/1800
  assert.ok(Math.abs(se.breakEvenMer - 3000 / 1800) < 1e-9);
  assert.equal(se.mer, 5);
  assert.equal(se.bidrag, 1200);
  assert.equal(se.bidragPerDag, 400);
  assert.equal(se.egenKostnad, false);

  assert.equal(us.market, "US");
  // USA: 2000 − 1000 = 1000 → break-even 2,0, MER 4,0
  assert.ok(Math.abs(us.breakEvenMer - 2) < 1e-9);
  assert.equal(us.mer, 4);
  assert.equal(us.bidrag, 500);
  assert.equal(us.egenKostnad, true);
});

test("raknaMarknader: omärkt land ger okänd annonskostnad, men break-even står kvar", () => {
  const us = raknaMarknader(bas({ markta: new Set(["SE"]) })).find((r) => r.market === "US");
  assert.equal(us.spend, null);
  assert.equal(us.mer, null);
  assert.equal(us.bidrag, null);
  assert.equal(us.bidragPerDag, null);
  assert.ok(Math.abs(us.breakEvenMer - 2) < 1e-9);
});

test("raknaMarknader: fel från annonskällan gör all annonskostnad okänd", () => {
  for (const r of raknaMarknader(bas({ spendOk: false }))) {
    assert.equal(r.spend, null);
    assert.equal(r.bidrag, null);
    assert.ok(r.breakEvenMer > 1);
  }
});

test("raknaMarknader: saknad kostnad märks osäker, inte som full marginal", () => {
  const us = raknaMarknader(
    bas({ forbered: (rader) => rader.map((p) => ({ ...p, unitCost: p.market === "US" ? null : 400 })) }),
  ).find((r) => r.market === "US");
  assert.equal(us.kostnadOsaker, true);
  assert.equal(us.andelUtanKostnad, 1);
});
