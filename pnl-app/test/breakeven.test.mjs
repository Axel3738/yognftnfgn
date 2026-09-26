// Break-even ROAS på den faktiska flerpacksmixen. Körs med `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";

const { mixBreakEven, radUtfall, mixText } = await import("../app/lib/breakeven.server.ts");

const bas = {
  price: 100,
  unitCost: 40,
  tiers: [{ variantGid: "v", units: 2, totalCost: 60 }],
  tariffPerOrder: 10,
  feeRate: 0.03,
};

test("en rad med 1 st: TB = pris − kostnad − tull − avgift", () => {
  const r = radUtfall(1, bas);
  // 100 − 40 − 10 − 3 = 47 → BE 100/47
  assert.equal(r.tb, 47);
  assert.ok(Math.abs(r.beRoas - 100 / 47) < 1e-9);
});

test("tvåpack betalar tullen EN gång och får packpriset", () => {
  const r = radUtfall(2, bas);
  // 200 − 60 − 10 − 6 = 124 → BE 200/124 ≈ 1,61 (styckräkningen hade gett 2,13)
  assert.equal(r.tb, 124);
  assert.ok(r.beRoas < radUtfall(1, bas).beRoas);
});

test("utan försäljning antas 1 st och det märks", () => {
  const m = mixBreakEven({ ...bas, lines: null });
  assert.equal(m.antagen, true);
  assert.equal(m.lines, 0);
  assert.equal(m.mix.length, 1);
  assert.equal(m.mix[0].qty, 1);
});

test("mixen viktar raderna efter antal orderrader", () => {
  const m = mixBreakEven({ ...bas, lines: { "1": 3, "2": 1 } });
  assert.equal(m.antagen, false);
  assert.equal(m.lines, 4);
  // 75 % 1 st (TB 47, oms 100) + 25 % 2 st (TB 124, oms 200)
  const tb = 0.75 * 47 + 0.25 * 124;
  const oms = 0.75 * 100 + 0.25 * 200;
  assert.ok(Math.abs(m.tb - tb) < 1e-9);
  assert.ok(Math.abs(m.beRoas - oms / tb) < 1e-9);
  assert.equal(m.mix[0].qty, 1); // störst andel först
  assert.equal(mixText(m.mix, "st"), "75 % 1 st · 25 % 2 st");
});

test("saknad kostnad ger null överallt, ingen gissning", () => {
  const m = mixBreakEven({ ...bas, unitCost: null, lines: { "1": 5 } });
  assert.equal(m.beRoas, null);
  assert.equal(m.tb, null);
  assert.deepEqual(m.mix, []);
});

test("olönsam packstorlek flaggas även när mixen som helhet är lönsam", () => {
  // 1 st: 100 − 95 − 10 − 3 < 0 → olönsam. 2 st: 200 − 120 − 10 − 6 = 64 → lönsam.
  const m = mixBreakEven({ ...bas, unitCost: 95, tiers: [{ variantGid: "v", units: 2, totalCost: 120 }], lines: { "1": 1, "2": 9 } });
  assert.equal(m.olonsamNagon, true);
  assert.ok(m.beRoas != null && m.beRoas > 0);
});

/* ------------------------------------------- realiserat pris per packstorlek */

/* Planens exempel: 299 kr styck sålt som "2 för 499", COGS 134 för två,
   tull 27,50, avgift 2 %. Listpriset gav 598 i omsättning och 1,41×. */
const tvaFor499 = {
  price: 299,
  unitCost: 80,
  tiers: [{ variantGid: "v", units: 2, totalCost: 134 }],
  tariffPerOrder: 27.5,
  feeRate: 0.02,
};

test("tvåpack sålt som 2 för 499: omsättning 499 och break-even 1,52×, inte 1,41×", () => {
  const d = { ...tvaFor499, lines: { "2": 1 }, linesRevenue: { "2": 499 } };
  const r = radUtfall(2, d);
  assert.equal(r.revenue, 499);
  assert.equal(r.listpris, false);
  // 499 − 134 − 27,5 − 9,98 = 327,52
  assert.ok(Math.abs(r.tb - 327.52) < 1e-9);
  assert.equal(r.beRoas.toFixed(2), "1.52");
  // Listpriset hade gett 598 och 1,41× — exakt felet som fixas.
  const lista = radUtfall(2, { ...tvaFor499, lines: { "2": 1 } });
  assert.equal(lista.revenue, 598);
  assert.equal(lista.listpris, true);
  assert.equal(lista.beRoas.toFixed(2), "1.41");
});

test("en storlek utan sålda rader med pris faller tillbaka på listpris och flaggas", () => {
  const m = mixBreakEven({ ...tvaFor499, lines: { "1": 4, "2": 1 }, linesRevenue: { "2": 499 }, linesPriced: { "2": 1 } });
  const en = m.mix.find((r) => r.qty === 1);
  const tva = m.mix.find((r) => r.qty === 2);
  assert.equal(en.listpris, true);
  assert.equal(en.revenue, 299);
  assert.equal(tva.listpris, false);
  assert.equal(tva.revenue, 499);
  assert.equal(m.delvisListpris, true);
  assert.equal(m.antagen, false);
});

test("mixBreakEven viktar storlekarna på det kunderna betalade", () => {
  // 3 rader à 1 st för 270 (10 %-kod) och 1 rad à 2 st för 499.
  const m = mixBreakEven({
    ...tvaFor499,
    lines: { "1": 3, "2": 1 },
    linesRevenue: { "1": 810, "2": 499 },
    linesPriced: { "1": 3, "2": 1 },
  });
  assert.equal(m.delvisListpris, false);
  const tb1 = 270 - 80 - 27.5 - 270 * 0.02;
  const tb2 = 499 - 134 - 27.5 - 499 * 0.02;
  const oms = 0.75 * 270 + 0.25 * 499;
  const tb = 0.75 * tb1 + 0.25 * tb2;
  assert.ok(Math.abs(m.revenue - oms) < 1e-9);
  assert.ok(Math.abs(m.beRoas - oms / tb) < 1e-9);
});

test("priset delas med raderna som BÄR det, inte med alla rader (äldre dagar utan pris)", () => {
  // 5 tvåpacksrader, men bara 2 från dagar med pris (998 kr). Delat med 5
  // hade gett 199,60 per rad — break-even skyhögt och fel.
  const m = mixBreakEven({ ...tvaFor499, lines: { "2": 5 }, linesRevenue: { "2": 998 }, linesPriced: { "2": 2 } });
  assert.equal(m.mix[0].revenue, 499);
  assert.equal(m.mix[0].share, 1);
});

test("utan försäljning: listpris, antagen — och delvisListpris sätts inte", () => {
  const m = mixBreakEven({ ...tvaFor499, lines: null, linesRevenue: null });
  assert.equal(m.antagen, true);
  assert.equal(m.delvisListpris, false);
  assert.equal(m.mix[0].listpris, true);
});
