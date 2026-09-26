// COGS per marknad i räknemotorn. Körs med `npm test`.
//
// En butik säljer samma produkt till Sverige och USA med olika frakt. Räknas
// USA-ordrarna på Sveriges kostnad blir vinsten där för hög — och det är
// exakt det slaget av tyst fel som ska fångas här.
import { test } from "node:test";
import assert from "node:assert/strict";

const { compute, resolveChange, tiersFor, slaIhopMarknader } = await import("../app/lib/pnl.server.ts");
const { marknadskod, sorteraMarknader, marknadsnamn } = await import("../app/lib/marknad.ts");

const dag = (day, netSales, orders = 1) => ({
  day, orders, grossSales: netSales, discounts: 0, returns: 0, netSales, totalSales: netSales, shippingCharges: 0,
});
const rad = (market, units, netSales, unitCost = 50) => ({
  productGid: "gid://shopify/Product/1",
  variantGid: "gid://shopify/ProductVariant/1",
  title: "Motorhölje",
  variantTitle: null,
  units,
  netSales,
  unitCost,
  market,
  lines: { "1": units },
});
const settings = { tariffPerOrder: 0, feeRate: 0, targetMargin: 0.25 };

test("marknadskod normaliserar och avvisar skräp", () => {
  assert.equal(marknadskod(" se "), "SE");
  assert.equal(marknadskod("no"), "NO");
  assert.equal(marknadskod("Sweden"), "");
  assert.equal(marknadskod(null), "");
  assert.equal(marknadskod("1"), "");
});

test("sorteraMarknader: hemlandet först, sedan alfabetiskt, utan dubbletter", () => {
  assert.deepEqual(sorteraMarknader(["US", "no", "SE", "NO", ""], "SE"), ["SE", "NO", "US"]);
});

test("marknadsnamn ger landsnamn på rätt språk och faller tillbaka på koden", () => {
  assert.equal(marknadsnamn("", "sv", "Alla"), "Alla");
  assert.ok(["Sverige", "SE"].includes(marknadsnamn("SE", "sv", "Alla")));
  assert.ok(["Norway", "NO"].includes(marknadsnamn("NO", "en", "All")));
});

test("resolveChange: marknadens egen post vinner över en nyare standardpost", () => {
  const changes = [
    { productGid: "gid://shopify/Product/1", variantGid: null, unitCost: 60, effectiveFrom: "2026-09-10", market: "" },
    { productGid: "gid://shopify/Product/1", variantGid: null, unitCost: 140, effectiveFrom: "2026-08-01", market: "US" },
  ];
  assert.equal(resolveChange(changes, rad("US", 1, 500), "2026-09-30").unitCost, 140);
  assert.equal(resolveChange(changes, rad("SE", 1, 500), "2026-09-30").unitCost, 60);
  assert.equal(resolveChange(changes, rad("", 1, 500), "2026-09-30").unitCost, 60);
});

test("resolveChange: en annan marknads post gäller aldrig", () => {
  const changes = [
    { productGid: "gid://shopify/Product/1", variantGid: null, unitCost: 140, effectiveFrom: "2026-08-01", market: "US" },
  ];
  assert.equal(resolveChange(changes, rad("NO", 1, 500), "2026-09-30"), null);
});

test("tiersFor: marknadens steg om de finns, annars standardens — aldrig blandat", () => {
  const tiers = [
    { variantGid: "v", units: 2, totalCost: 90, market: "" },
    { variantGid: "v", units: 3, totalCost: 120, market: "" },
    { variantGid: "v", units: 2, totalCost: 200, market: "US" },
  ];
  assert.deepEqual(tiersFor(tiers, "v", "US").map((t) => t.totalCost), [200]);
  assert.deepEqual(tiersFor(tiers, "v", "NO").map((t) => t.totalCost), [90, 120]);
  assert.deepEqual(tiersFor(tiers, "v", "").map((t) => t.totalCost), [90, 120]);
});

test("compute: COGS räknas med marknadens kostnad per rad, och summan blir rätt", () => {
  const r = compute({
    from: "2026-09-01",
    to: "2026-09-01",
    spendReliable: true,
    sales: [dag("2026-09-01", 1500, 3)],
    sessions: [],
    spend: [],
    products: [rad("SE", 2, 1000), rad("US", 1, 500)],
    costChanges: [
      { productGid: "gid://shopify/Product/1", variantGid: null, unitCost: 140, effectiveFrom: "2026-01-01", market: "US" },
    ],
    costTiers: [],
    settings,
  });
  // SE: 2 × 50 (Shopifys standardkostnad) · US: 1 × 140 (marknadens post)
  assert.equal(r.totals.cogs, 240);
  assert.equal(r.totals.unitsWithoutCost, 0);
});

test("compute utan marknad på raderna räknar som förut", () => {
  const r = compute({
    from: "2026-09-01",
    to: "2026-09-01",
    spendReliable: true,
    sales: [dag("2026-09-01", 1500, 3)],
    sessions: [],
    spend: [],
    products: [{ ...rad("", 3, 1500), market: undefined }],
    costChanges: [
      { productGid: "gid://shopify/Product/1", variantGid: null, unitCost: 140, effectiveFrom: "2026-01-01", market: "US" },
    ],
    costTiers: [],
    settings,
  });
  assert.equal(r.totals.cogs, 150);
});

test("slaIhopMarknader: en rad per variant, COGS summerad, kostnad per styck omräknad", () => {
  const r = compute({
    from: "2026-09-01",
    to: "2026-09-01",
    spendReliable: true,
    sales: [dag("2026-09-01", 1500, 3)],
    sessions: [],
    spend: [],
    products: [rad("SE", 2, 1000), rad("US", 1, 500)],
    costChanges: [
      { productGid: "gid://shopify/Product/1", variantGid: null, unitCost: 140, effectiveFrom: "2026-01-01", market: "US" },
    ],
    costTiers: [],
    settings,
  });
  const ihop = slaIhopMarknader(r.products);
  assert.equal(ihop.length, 1);
  assert.equal(ihop[0].units, 3);
  assert.equal(ihop[0].netSales, 1500);
  assert.equal(ihop[0].cogs, 240);
  assert.equal(ihop[0].effectiveCost, 80);
  assert.equal(ihop[0].contribution, 1260);
});

test("slaIhopMarknader summerar intäkten efter rabatter över marknader utan att röra lines", () => {
  const r = compute({
    from: "2026-09-01",
    to: "2026-09-01",
    spendReliable: true,
    sales: [dag("2026-09-01", 1500, 3)],
    sessions: [],
    spend: [],
    products: [
      { ...rad("SE", 2, 1000), lines: { "2": 1 }, netRevenue: 900, linesRevenue: { "2": 900 }, linesPriced: { "2": 1 } },
      { ...rad("NO", 1, 500), netRevenue: 450, linesRevenue: { "1": 450 }, linesPriced: { "1": 1 } },
    ],
    costChanges: [],
    costTiers: [],
    settings,
  });
  const [ihop] = slaIhopMarknader(r.products);
  assert.deepEqual(ihop.lines, { "1": 1, "2": 1 });
  assert.deepEqual(ihop.linesRevenue, { "1": 450, "2": 900 });
  assert.deepEqual(ihop.linesPriced, { "1": 1, "2": 1 });
  assert.equal(ihop.netRevenue, 1350);
  assert.equal(ihop.netSales, 1500);
  // Bruttovinsten räknas på det kunderna betalade: 1350 − 3 × 50.
  assert.equal(ihop.contribution, 1200);
  // Källraderna muterades inte.
  assert.deepEqual(r.products.find((p) => p.market === "SE").linesRevenue, { "2": 900 });
});

test("slaIhopMarknader: saknar en marknad intäkten efter rabatter faller raden tillbaka på netSales", () => {
  const r = compute({
    from: "2026-09-01",
    to: "2026-09-01",
    spendReliable: true,
    sales: [dag("2026-09-01", 1500, 3)],
    sessions: [],
    spend: [],
    products: [{ ...rad("SE", 2, 1000), netRevenue: 900 }, rad("NO", 1, 500)],
    costChanges: [],
    costTiers: [],
    settings,
  });
  const [ihop] = slaIhopMarknader(r.products);
  assert.equal(ihop.netRevenue, undefined);
  assert.equal(ihop.contribution, 1500 - 150);
});
