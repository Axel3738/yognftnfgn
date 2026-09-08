import { test } from "node:test";
import assert from "node:assert/strict";

const { computeLtv, MIN_KUNDER } = await import("../app/lib/ltv.server.ts");

/** Bygger en kohort: n kunder som köper för `first` i månad m0, och en andel
 *  som köper igen för `repeat` i månad m0+1. */
function kohort(m0, n, first, repeatShare, repeat) {
  const out = [];
  const [y, m] = m0.split("-").map(Number);
  const next = `${m === 12 ? y + 1 : y}-${String(m === 12 ? 1 : m + 1).padStart(2, "0")}`;
  for (let i = 0; i < n; i++) {
    const id = `${m0}-${i}`;
    out.push({ customerId: id, day: `${m0}-10`, net: first });
    if (i < Math.round(n * repeatShare)) out.push({ customerId: id, day: `${next}-12`, net: repeat });
  }
  return out;
}

test("kohorter grupperas på första köpmånad och räknar per kund", () => {
  const orders = [...kohort("2026-05", 100, 500, 0.2, 400), ...kohort("2026-06", 50, 600, 0, 0)];
  const r = computeLtv(orders, "2026-09-08");
  assert.equal(r.totalKunder, 150);
  const maj = r.kohorter.find((k) => k.manad === "2026-05");
  assert.equal(maj.kunder, 100);
  assert.equal(maj.perKund[0], 500);
  assert.equal(maj.perKund[1], 500 + 0.2 * 400); // 580
  assert.equal(maj.aterkop, 0.2);
  assert.equal(maj.forLiteData, false);
});

test("för liten kohort märks och bidrar inte till prognosen", () => {
  const orders = [...kohort("2026-05", MIN_KUNDER - 1, 500, 0.5, 500), ...kohort("2026-07", 40, 500, 0, 0)];
  const r = computeLtv(orders, "2026-09-08");
  const maj = r.kohorter.find((k) => k.manad === "2026-05");
  assert.equal(maj.forLiteData, true);
  // Juli har observerat månad 0 och 1 (aug), men maj (för liten) får inte
  // lyfta tillväxtfaktorn för månad 1 — juli ensam ger faktor 1,0.
  assert.equal(r.tillvaxt[1], 1);
  assert.equal(r.tillvaxtUnderlag[1], 1);
});

test("prognosen fyller månader en yngre kohort inte observerat med äldre kohorters tillväxt", () => {
  // Gammal kohort: +16 % i månad 1, sedan platt. Ny kohort: bara månad 0.
  const orders = [...kohort("2026-01", 100, 500, 0.2, 400), ...kohort("2026-08", 100, 1000, 0, 0)];
  const r = computeLtv(orders, "2026-09-08");
  const aug = r.kohorter.find((k) => k.manad === "2026-08");
  assert.equal(aug.observerade, 1);
  assert.equal(aug.prognos[0], null);
  assert.ok(Math.abs(aug.prognos[1] - 1000 * 1.16) < 1e-9);
  // Månad 2: januari observerade 2 med faktor 1,0 → oförändrat.
  assert.ok(Math.abs(aug.prognos[2] - 1000 * 1.16) < 1e-9);
});

test("utan äldre kohorter finns ingen prognos — hellre tomt än påhittat", () => {
  const r = computeLtv(kohort("2026-08", 100, 500, 0, 0), "2026-09-08");
  assert.equal(r.kurva[0].varde, 500);
  assert.equal(r.kurva[1].varde, null);
  assert.equal(r.ltv12, null);
});

test("kurvan sjunker aldrig", () => {
  // Två kohorter: en gammal med lågt första köp och lång historik, en ny med högt.
  const orders = [...kohort("2025-06", 100, 200, 0, 0), ...kohort("2026-08", 100, 1000, 0, 0)];
  const r = computeLtv(orders, "2026-09-08");
  for (let k = 1; k < r.kurva.length; k++) {
    if (r.kurva[k].varde != null && r.kurva[k - 1].varde != null) {
      assert.ok(r.kurva[k].varde >= r.kurva[k - 1].varde);
    }
  }
});

test("ordrar utan kund-ID ignoreras", () => {
  const r = computeLtv([{ customerId: "", day: "2026-08-01", net: 100 }], "2026-09-08");
  assert.equal(r.totalKunder, 0);
  assert.equal(r.ltv12, null);
});
