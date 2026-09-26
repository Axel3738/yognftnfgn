// Produktens intäkt efter alla rabatter, break-even per produkt i panelens
// tabell och butikens MER som Kostnader färgar mot. Körs med `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";

const { fordelaProdukter, merUrDagar, beTon, radIntakt, radLinjer, MIN_RADER_BE } = await import("../app/lib/produktintakt.ts");

const rad = (x) => ({ units: 1, netSales: 0, cogs: 0, lines: { 1: 1 }, ...x });

test("radIntakt: efter alla rabatter när den finns, annars netSales", () => {
  assert.equal(radIntakt({ netSales: 100, netRevenue: 90 }), 90);
  assert.equal(radIntakt({ netSales: 100 }), 100);
  assert.equal(radLinjer({ units: 7, lines: { 1: 2, 3: 1 } }), 3);
  assert.equal(radLinjer({ units: 7 }), 7);
});

test("fordelaProdukter: tull efter orderrader, avgift efter intäkt, produkter + oallokerat = omsättningen", () => {
  const rows = [
    rad({ netSales: 1000, netRevenue: 900, cogs: 300, lines: { 1: 6 } }),
    rad({ netSales: 500, cogs: 150, lines: { 1: 3, 2: 1 } }),
  ];
  const f = fordelaProdukter(rows, { tariff: 100, effFeeRate: 0.02, totalSales: 1500 });
  // 10 orderrader: 6 och 4.
  assert.equal(f.rader[0].tull, 60);
  assert.equal(f.rader[1].tull, 40);
  assert.equal(f.rader[0].avgifter, 18);
  const tb0 = 900 - 300 - 60 - 18;
  assert.ok(Math.abs(f.rader[0].beRoas - 900 / tb0) < 1e-12);
  assert.equal(f.rader[0].status, "ok");
  assert.equal(f.intakt, 1400);
  assert.equal(f.oallokerat, 100);
  assert.equal(f.intakt + f.oallokerat, 1500);
});

test("fordelaProdukter: '—' utan kostnad, på misstänkt nolla och under tre orderrader", () => {
  const f = fordelaProdukter(
    [
      rad({ netSales: 500, cogs: null, lines: { 1: 10 } }),
      rad({ netSales: 500, cogs: 0, zeroCost: true, lines: { 1: 10 } }),
      rad({ netSales: 500, cogs: 100, lines: { 1: MIN_RADER_BE - 1 } }),
      rad({ netSales: 100, cogs: 200, lines: { 1: 5 } }),
    ],
    { tariff: 0, effFeeRate: 0, totalSales: 1600 },
  );
  assert.deepEqual(f.rader.map((r) => r.status), ["saknas", "saknas", "tunn", "olonsam"]);
  assert.ok(f.rader.every((r) => r.beRoas == null));
});

test("merUrDagar: omsättning / spend, null på tunt eller ofullständigt underlag", () => {
  const dagar = Array.from({ length: 10 }, (_, i) => ({ day: `2026-09-${String(i + 1).padStart(2, "0")}`, totalSales: 1000, orders: 5 }));
  const spend = dagar.map((d) => ({ day: d.day, spend: 400 }));
  assert.equal(merUrDagar(dagar, spend), 2.5);
  // En säljdag utan spendrad: MER hade blivit för hög — ingen färg.
  assert.equal(merUrDagar(dagar, spend.slice(1)), null);
  // Två konton samma dag summeras.
  assert.equal(merUrDagar(dagar, [...spend, ...spend]), 1.25);
  // Färre än 7 säljdagar, eller för få ordrar, eller ingen spend.
  assert.equal(merUrDagar(dagar.slice(0, 6), spend), null);
  assert.equal(merUrDagar(dagar.map((d) => ({ ...d, orders: 0 })), spend), null);
  assert.equal(merUrDagar(dagar, spend.map((s) => ({ ...s, spend: 0 }))), null);
  // Dagar utan försäljning behöver ingen spendrad.
  assert.equal(merUrDagar([...dagar, { day: "2026-09-20", totalSales: 0, orders: 0 }], spend), 2.5);
});

test("beTon: grönt minst 10 % under MER, gult strax under, rött över, ingen färg på tunt", () => {
  assert.equal(beTon(1.8, 2.0, 10), "success");
  assert.equal(beTon(1.95, 2.0, 10), "caution");
  assert.equal(beTon(2.0, 2.0, 10), "caution");
  assert.equal(beTon(2.1, 2.0, 10), "critical");
  assert.equal(beTon(1.5, null, 10), undefined);
  assert.equal(beTon(1.5, 2.0, 2), undefined);
  assert.equal(beTon(null, 2.0, 10), undefined);
});
