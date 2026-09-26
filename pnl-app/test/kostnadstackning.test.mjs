// Kostnadstäckning och tullens startvärde. Körs med `npm test`.
//
// En variant utan inköpspris — eller med ett 0,00 som ingen kvitterat —
// lägger 0 till COGS. Vinsten blir för hög och break-even för låg, utan att
// något ser trasigt ut. De här testerna låser att motorn mäter hålet i
// FÖRSÄLJNING (inte i antal enheter), att en kvitterad gåva inte flaggas,
// att 2 %-gränsen sitter där den ska, att gruppsumman bär med sig hålet
// genom valutaomräkningen, och att tullen bara kvitteras av en riktig
// granskning.
import { test } from "node:test";
import assert from "node:assert/strict";

const { compute, slaIhopMarknader } = await import("../app/lib/pnl.server.ts");
const { convertTotalsPerDay } = await import("../app/lib/gruppvaluta.ts");
const {
  KOSTNAD_TROSKEL, arKostnadOsaker, andelUtan, startTull, tullKvitterad, tackningEfterOmsattning, JUICY_TACKNING,
} = await import("../app/lib/kostnadstackning.ts");

const DAG = "2026-09-20";
const dag = (day, netSales, orders = 10) => ({
  day, orders, grossSales: netSales, discounts: 0, returns: 0, netSales,
  totalSales: netSales, shippingCharges: 0,
});
const settings = { tariffPerOrder: 0, feeRate: 0, targetMargin: 0.25 };
const rad = (variantGid, netSales, unitCost, units = 1) => ({
  productGid: `p-${variantGid}`, variantGid, title: variantGid, variantTitle: null, units, netSales, unitCost,
});
const kor = (products, extra = {}) => {
  const oms = products.reduce((a, p) => a + p.netSales, 0);
  return compute({
    from: DAG, to: DAG, spendReliable: true,
    sales: [dag(DAG, oms)], sessions: [], spend: [], products, costChanges: [], costTiers: [],
    settings, ...extra,
  });
};

test("en rad utan kostnad: hela dess nettoförsäljning räknas som utan kostnad", () => {
  const r = kor([rad("a", 700, 300), rad("b", 300, null, 3)]);
  assert.equal(r.totals.netSalesWithoutCost, 300);
  assert.equal(r.totals.unitsWithoutCost, 3);
  assert.equal(r.totals.productNetSales, 1000);
  assert.ok(r.totals.cogsCoverage < 1);
  assert.equal(Math.round(r.totals.cogsCoverage * 1000), 700);
  assert.equal(r.totals.kostnadOsaker, true);
  // COGS saknar raden helt — det är just därför vinsten är för hög.
  assert.equal(r.totals.cogs, 300);
});

test("en rad med kostnad 0: räknas i netSalesZeroCost, COGS 0, märkt zeroCost", () => {
  const r = kor([rad("a", 900, 300), rad("gava", 100, 0, 2)]);
  assert.equal(r.totals.netSalesZeroCost, 100);
  assert.equal(r.totals.unitsZeroCost, 2);
  assert.equal(r.totals.netSalesWithoutCost, 0);
  assert.equal(r.totals.unitsWithoutCost, 0);
  assert.equal(r.totals.cogs, 300);
  assert.equal(r.totals.kostnadOsaker, true);
  const gava = r.products.find((p) => p.variantGid === "gava");
  assert.equal(gava.cogs, 0);
  assert.equal(gava.zeroCost, true);
  assert.equal(r.products.find((p) => p.variantGid === "a").zeroCost, false);
});

test("samma nolla kvitterad i freeVariants: inte flaggad", () => {
  const r = kor([rad("a", 900, 300), rad("gava", 100, 0, 2)], { freeVariants: ["gava"] });
  assert.equal(r.totals.netSalesZeroCost, 0);
  assert.equal(r.totals.unitsZeroCost, 0);
  assert.equal(r.totals.cogsCoverage, 1);
  assert.equal(r.totals.kostnadOsaker, false);
  assert.equal(r.products.find((p) => p.variantGid === "gava").zeroCost, false);
});

test("styckpris 0 med riktiga flerpackspriser är ingen misstänkt nolla", () => {
  const r = kor([{ ...rad("a", 500, 0, 2), lines: { 2: 1 } }], {
    costTiers: [{ variantGid: "a", units: 2, totalCost: 120 }],
  });
  assert.equal(r.totals.cogs, 120);
  assert.equal(r.totals.netSalesZeroCost, 0);
});

test("2 %-gränsen: exakt 2 % är inte osäkert, strax över är det", () => {
  assert.equal(KOSTNAD_TROSKEL, 0.02);
  const exakt = kor([rad("a", 98, 40), rad("b", 2, null)]);
  assert.equal(exakt.totals.kostnadOsaker, false, "1 − 0,98 får inte bli 0,0200…01 och slå om");
  const over = kor([rad("a", 97.9, 40), rad("b", 2.1, null)]);
  assert.equal(over.totals.kostnadOsaker, true);
  assert.equal(arKostnadOsaker(0.02), false);
  assert.equal(arKostnadOsaker(0.0201), true);
  assert.equal(arKostnadOsaker(null), false);
});

test("ingen försäljning: täckningen är null, inte 100 %, och inget flaggas", () => {
  const r = kor([]);
  assert.equal(r.totals.cogsCoverage, null);
  assert.equal(r.totals.kostnadOsaker, false);
  assert.equal(andelUtan(5, 0), null);
});

test("negativa rader drar inte upp täckningen över 100 %", () => {
  const r = kor([rad("a", 1000, 400), rad("kredit", -200, null)]);
  assert.equal(r.totals.productNetSales, 1000);
  assert.equal(r.totals.netSalesWithoutCost, 0);
  assert.equal(r.totals.cogsCoverage, 1);
});

test("hopslagning per variant behåller märkningarna zeroCost och estimated", () => {
  const r = kor([
    { ...rad("a", 100, 0), market: "SE" },
    { ...rad("a", 50, 20), market: "NO" },
    { ...rad("b", 80, 30), market: "SE", estimated: true },
    { ...rad("b", 20, 30), market: "NO" },
  ]);
  const ihop = slaIhopMarknader(r.products);
  assert.equal(ihop.find((p) => p.variantGid === "a").zeroCost, true);
  assert.equal(ihop.find((p) => p.variantGid === "b").estimated, true);
});

test("convertTotalsPerDay: försäljning utan kostnad räknas om med försäljningens dagsvägda kurs", () => {
  const sales = [dag("2026-09-01", 1000, 1), dag("2026-09-02", 3000, 1)];
  const kurser = new Map([["2026-09-01", 1], ["2026-09-02", 2]]);
  const tt = {
    totalSales: 4000, orders: 2, cogs: 0, tariff: 0, fees: 0, spend: 0, fixedCosts: 0, netProfit: 4000,
    netSalesWithoutCost: 400, netSalesZeroCost: 100, productNetSales: 4000,
  };
  const ut = convertTotalsPerDay(tt, sales, [], kurser, "2026-09-01", "2026-09-02");
  // Vägd kurs = (1000·1 + 3000·2) / 4000 = 1,75
  assert.equal(ut.totalSales, 7000);
  assert.equal(ut.netSalesWithoutCost, 700);
  assert.equal(ut.netSalesZeroCost, 175);
  assert.equal(ut.productNetSales, 7000);
  // Andelen är densamma i båda valutorna — det är den som dömer.
  assert.equal(andelUtan(ut.netSalesWithoutCost + ut.netSalesZeroCost, ut.productNetSales), 0.125);
});

test("täckning på Kostnader vägs efter försäljning, inte antal varianter", () => {
  const rader = [
    ...Array.from({ length: 197 }, (_, i) => ({ variantGid: `v${i}`, saknas: false, noll: false })),
    { variantGid: "bast1", saknas: true, noll: false },
    { variantGid: "bast2", saknas: true, noll: false },
    { variantGid: "bast3", saknas: false, noll: true },
  ];
  const oms = new Map([["v0", 4000], ["bast1", 3000], ["bast2", 2000], ["bast3", 1000]]);
  const t = tackningEfterOmsattning(rader, oms);
  // 197/200 varianter = 98,5 % "täckt" — men bara 40 % av försäljningen.
  assert.equal(t.andel, 0.4);
  assert.ok(t.andel < JUICY_TACKNING);
  assert.equal(tackningEfterOmsattning(rader, new Map()).andel, null);
});

test("startTull: 27,50 bara för SEK, annars 0", () => {
  assert.equal(startTull("SEK"), 27.5);
  assert.equal(startTull("USD"), 0);
  assert.equal(startTull("NOK"), 0);
  assert.equal(startTull(undefined), 0);
});

test("tullKvitterad: bara ändrat belopp eller ikryssad ruta kvitterar", () => {
  const lagrat = { tariffPerOrder: 27.5, perMarknad: { US: 60, NO: null } };
  // Språkbyte / inklistrad Meta-nyckel: samma tullbelopp postas tillbaka.
  assert.equal(tullKvitterad(lagrat, { tariffPerOrder: 27.5, perMarknad: { US: 60 } }, false), false);
  // "27.50" och 27,5 är samma belopp.
  assert.equal(tullKvitterad(lagrat, { tariffPerOrder: 27.5000001, perMarknad: { US: 60 } }, false), false);
  assert.equal(tullKvitterad(lagrat, { tariffPerOrder: 0, perMarknad: { US: 60 } }, false), true);
  assert.equal(tullKvitterad(lagrat, { tariffPerOrder: 27.5, perMarknad: { US: 45 } }, false), true);
  // En marknadstull som töms räknas som ändrad.
  assert.equal(tullKvitterad(lagrat, { tariffPerOrder: 27.5, perMarknad: {} }, false), true);
  assert.equal(tullKvitterad(lagrat, { tariffPerOrder: 27.5, perMarknad: { US: 60 } }, true), true);
  // Ett ogiltigt huvudbelopp (tomt fält) är ingen granskning.
  assert.equal(tullKvitterad(lagrat, { tariffPerOrder: NaN, perMarknad: { US: 60 } }, false), false);
});
