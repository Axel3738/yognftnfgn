// Hittar summakolumnen i en prislista med namnlösa talkolumner. `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";

const { hittaSummaspalt, fingeravtryck } = await import("../app/lib/prisspalter.ts");

/** Bygger en kolumn ur [styckpris, 2-pack, 3-pack] per storlek. */
const spalt = (tal) => ({
  rows: tal.map(([namn, ett, tva, tre]) => ({
    product: "Taköverdrag",
    variant: namn,
    market: "US",
    unit_cost: ett,
    tiers: [
      { units: 2, total: tva },
      { units: 3, total: tre },
    ],
  })),
});

/* Axels amerikanska prislista, 2026-09-18. Vara | frakt | totalt. */
const vara = spalt([
  ["5,5 × 3 m", 14.46, 28.92, 43.38],
  ["6,5 × 3 m", 17.42, 34.85, 52.27],
  ["7,5 × 3 m", 20.46, 40.92, 61.38],
]);
const frakt = spalt([
  ["5,5 × 3 m", 26.39, 47.25, 68.85],
  ["6,5 × 3 m", 28.79, 54.74, 81.1],
  ["7,5 × 3 m", 33.05, 63.25, 93.45],
]);
const totalt = spalt([
  ["5,5 × 3 m", 40.85, 76.17, 112.23],
  ["6,5 × 3 m", 46.21, 89.59, 133.37],
  ["7,5 × 3 m", 53.51, 104.17, 154.83],
]);

test("Axels prislista: tredje kolumnen är de två andra ihopräknade", () => {
  const svar = hittaSummaspalt([vara, frakt, totalt]);
  assert.ok(svar, "summakolumnen ska hittas");
  assert.equal(svar.index, 2);
  assert.deepEqual(svar.delar, [14.46, 26.39]);
  assert.equal(svar.summa, 40.85);
});

test("ordningen spelar ingen roll — summan hittas var den än står", () => {
  assert.equal(hittaSummaspalt([totalt, vara, frakt])?.index, 0);
  assert.equal(hittaSummaspalt([vara, totalt, frakt])?.index, 1);
});

test("tre orelaterade prisspalter ger inget svar", () => {
  const a = spalt([["S", 10, 19, 27], ["M", 12, 23, 33], ["L", 14, 27, 39]]);
  const b = spalt([["S", 20, 38, 54], ["M", 24, 46, 66], ["L", 28, 54, 78]]);
  const c = spalt([["S", 31, 59, 84], ["M", 37, 70, 100], ["L", 43, 82, 118]]);
  assert.equal(hittaSummaspalt([a, b, c]), null);
});

test("två kolumner räcker aldrig — då går summan inte att peka ut", () => {
  assert.equal(hittaSummaspalt([vara, totalt]), null);
});

test("en kolumn med nollor räknas inte som en del", () => {
  const noll = spalt([
    ["5,5 × 3 m", 0, 0, 0],
    ["6,5 × 3 m", 0, 0, 0],
    ["7,5 × 3 m", 0, 0, 0],
  ]);
  assert.equal(hittaSummaspalt([vara, noll, vara]), null);
});

test("olika rader i kolumnerna ger inget svar", () => {
  const annan = spalt([
    ["5,5 × 3 m", 40.85, 76.17, 112.23],
    ["6,5 × 3 m", 46.21, 89.59, 133.37],
    ["9 × 3 m", 53.51, 104.17, 154.83],
  ]);
  assert.equal(hittaSummaspalt([vara, frakt, annan]), null);
});

test("olika packstorlekar i kolumnerna ger inget svar", () => {
  const utanTrePack = {
    rows: totalt.rows.map((r) => ({ ...r, tiers: [r.tiers[0]] })),
  };
  assert.equal(hittaSummaspalt([vara, frakt, utanTrePack]), null);
});

test("ören får avvika, kronor får inte", () => {
  const nastan = {
    rows: totalt.rows.map((r) => ({
      ...r,
      unit_cost: r.unit_cost + 0.02,
      tiers: r.tiers.map((t) => ({ ...t, total: t.total - 0.02 })),
    })),
  };
  assert.equal(hittaSummaspalt([vara, frakt, nastan])?.index, 2);

  const fel = {
    rows: totalt.rows.map((r) => ({ ...r, unit_cost: r.unit_cost + 1 })),
  };
  assert.equal(hittaSummaspalt([vara, frakt, fel]), null);
});

test("en enda cell räcker inte som bevis", () => {
  const en = (v) => ({ rows: [{ product: "P", variant: "", market: "", unit_cost: v, tiers: [] }] });
  assert.equal(hittaSummaspalt([en(3), en(4), en(7)]), null);
});

/* Fällan: 1 st | 2 st | 3 st uppfyller k + 2k = 3k i varje cell. Skrevs
   3-packspriset som styckpris blev kostnaden tre gånger för hög. */
test("antalskolumner (1 st / 2 st / 3 st) får ALDRIG tolkas som en summa", () => {
  const ett = spalt([
    ["5,5 × 3 m", 14.46, 28.92, 43.38],
    ["6,5 × 3 m", 17.42, 34.85, 52.27],
    ["7,5 × 3 m", 20.46, 40.92, 61.38],
  ]);
  const tva = { rows: ett.rows.map((r) => ({ ...r, unit_cost: r.unit_cost * 2, tiers: r.tiers.map((t) => ({ ...t, total: t.total * 2 })) })) };
  const tre = { rows: ett.rows.map((r) => ({ ...r, unit_cost: r.unit_cost * 3, tiers: r.tiers.map((t) => ({ ...t, total: t.total * 3 })) })) };
  assert.equal(hittaSummaspalt([ett, tva, tre]), null);
});

test("delar med konstant förhållande räknas inte som en uppdelning", () => {
  const a = spalt([["S", 10, 20, 30], ["M", 20, 40, 60], ["L", 30, 60, 90]]);
  const b = spalt([["S", 5, 10, 15], ["M", 10, 20, 30], ["L", 15, 30, 45]]);
  const c = spalt([["S", 15, 30, 45], ["M", 30, 60, 90], ["L", 45, 90, 135]]);
  assert.equal(hittaSummaspalt([a, b, c]), null);
});

test("en enda produktrad räcker inte, hur många packstorlekar den än har", () => {
  const rad = (v) => ({
    rows: [{ product: "P", variant: "", market: "", unit_cost: v, tiers: [{ units: 2, total: v * 2 }, { units: 3, total: v * 3 }] }],
  });
  assert.equal(hittaSummaspalt([rad(3), rad(4), rad(7)]), null);
});

test("fingeravtrycket är lika för samma läsning, olika för olika", () => {
  assert.equal(fingeravtryck(vara.rows), fingeravtryck(vara.rows.slice().reverse()));
  assert.notEqual(fingeravtryck(vara.rows), fingeravtryck(frakt.rows));
});

test("fyra kolumner: summan av de tre andra hittas ändå", () => {
  const tull = spalt([
    ["5,5 × 3 m", 2, 4, 6],
    ["6,5 × 3 m", 3, 6, 9],
    ["7,5 × 3 m", 4, 8, 12],
  ]);
  const medTull = spalt([
    ["5,5 × 3 m", 42.85, 80.17, 118.23],
    ["6,5 × 3 m", 49.21, 95.59, 142.37],
    ["7,5 × 3 m", 57.51, 112.17, 166.83],
  ]);
  assert.equal(hittaSummaspalt([vara, frakt, tull, medTull])?.index, 3);
});

test("rader utan flerpack fungerar också", () => {
  const bar = (v) => ({
    rows: ["S", "M", "L"].map((namn, i) => ({
      product: "P",
      variant: namn,
      market: "",
      unit_cost: v[i],
      tiers: [],
    })),
  });
  assert.equal(hittaSummaspalt([bar([1, 2, 3]), bar([4, 5, 6]), bar([5, 7, 9])])?.index, 2);
});
