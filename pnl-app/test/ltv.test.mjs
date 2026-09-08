// Tester för LTV-motorn. Körs med `npm test` (Node ≥ 22.6, strip-types).
import { test } from "node:test";
import assert from "node:assert/strict";

const { computeLtv, wilson, konfidensAv } = await import("../app/lib/ltv.server.ts");
const { MIN_KOHORT, MIN_POOL_KUNDER } = await import("../app/lib/ltv-konstanter.ts");

/** n kunder med första order dag `d0`, andel `share` köper igen `after` dagar senare. */
function kohort(prefix, d0, n, first, share, repeat, after, tb = true) {
  const out = [];
  const plus = (dag, k) => { const d = new Date(dag + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + k); return d.toISOString().slice(0, 10); };
  for (let i = 0; i < n; i++) {
    const id = `${prefix}-${i}`;
    out.push({ kundHash: id, dag: d0, netto: first, tb: tb ? first * 0.5 : null });
    if (i < Math.round(n * share)) out.push({ kundHash: id, dag: plus(d0, after), netto: repeat, tb: tb ? repeat * 0.5 : null });
  }
  return out;
}

test("wilson: känt värde p=0,1 n=100 ⇒ ca 0,055–0,176", () => {
  const w = wilson(10, 100);
  assert.ok(Math.abs(w.low - 0.0552) < 0.002, `low ${w.low}`);
  assert.ok(Math.abs(w.high - 0.1744) < 0.002, `high ${w.high}`);
  assert.equal(wilson(0, 0), null);
});

test("konfidens: spann ≤ 40 % good, ≤ 80 % low, annars hidden", () => {
  assert.equal(konfidensAv({ mid: 100, low: 90, high: 110 }), "good");
  assert.equal(konfidensAv({ mid: 100, low: 70, high: 130 }), "low");
  assert.equal(konfidensAv({ mid: 100, low: 20, high: 180 }), "hidden");
});

test("kohorter per första köpmånad, R/n/AOVr observerade för mogen kohort", () => {
  const orders = kohort("a", "2026-01-10", 100, 500, 0.2, 300, 20);
  const r = computeLtv({ orders, today: "2026-09-08", targetMargin: 0.25 });
  assert.equal(r.kohorter.length, 1);
  const c = r.kohorter[0];
  assert.equal(c.manad, "2026-01");
  assert.equal(c.n, 100);
  assert.equal(c.aov1, 500);
  const h30 = c.perH[30];
  assert.equal(h30.observed, true);
  assert.equal(h30.est, false);
  assert.equal(h30.R.mid, 0.2);
  assert.equal(h30.n, 1);
  assert.equal(h30.aovR, 300);
  assert.equal(h30.ltv.mid, 500 + 0.2 * 1 * 300);
  assert.equal(r.aterkopsgrad, 0.2);
});

test("återköp efter horisonten räknas inte i den horisonten", () => {
  const orders = kohort("a", "2026-01-10", 100, 500, 0.2, 300, 45);
  const r = computeLtv({ orders, today: "2026-09-08", targetMargin: 0.25 });
  const c = r.kohorter[0];
  assert.equal(c.perH[30].R.mid, 0);
  assert.equal(c.perH[60].R.mid, 0.2);
});

test("omogen kohort: observed=false, ingen siffra utan pool", () => {
  const orders = kohort("a", "2026-08-20", 100, 500, 0.2, 300, 5);
  const r = computeLtv({ orders, today: "2026-09-08", targetMargin: 0.25 });
  const c = r.kohorter[0];
  assert.equal(c.perH[30].observed, false);
  assert.equal(c.perH[30].est, false);
  assert.equal(c.perH[30].ltv, null);
  assert.equal(r.pool[30].ok, false);
  assert.equal(r.maxCpa[30], undefined);
});

test("för liten kohort märks och räknas inte i poolen", () => {
  const orders = [
    ...kohort("a", "2026-01-10", MIN_KOHORT - 1, 500, 0.5, 300, 10),
    ...kohort("b", "2026-02-10", 200, 500, 0.1, 300, 10),
    ...kohort("c", "2026-03-10", 200, 500, 0.1, 300, 10),
  ];
  const r = computeLtv({ orders, today: "2026-09-08", targetMargin: 0.25 });
  const a = r.kohorter.find((k) => k.manad === "2026-01");
  assert.equal(a.tooSmall, true);
  assert.equal(r.pool[30].kohorter, 2);
  assert.equal(r.pool[30].kunder, 400);
  assert.ok(Math.abs(r.pool[30].R.mid - 0.1) < 1e-9);
});

test("pool ok kräver 2 kohorter, 300 kunder och 30 återköp — då finns prognos och max-CPA", () => {
  const orders = [
    ...kohort("a", "2026-01-10", 200, 500, 0.1, 300, 10),
    ...kohort("b", "2026-02-10", 200, 500, 0.1, 300, 10),
    ...kohort("ny", "2026-08-25", 100, 1000, 0, 0, 0),
  ];
  const r = computeLtv({ orders, today: "2026-09-08", targetMargin: 0.25 });
  const p = r.pool[30];
  assert.equal(p.ok, true, JSON.stringify(p.saknas));
  assert.equal(p.aterkopsOrdrar, 40);
  const ny = r.kohorter.find((k) => k.manad === "2026-08");
  // Prognos: eget AOV1 (1000), lånad återköpsdel (0,1 × 1 × 300 = 30).
  assert.equal(ny.perH[30].est, true);
  assert.ok(Math.abs(ny.perH[30].ltv.mid - 1030) < 1e-9);
  // Max-CPA ur poolen: tb1 = 250, tbR = 150 ⇒ LTVtb = 250 + 0,1×150 = 265; LTV = 530.
  const mc = r.maxCpa[30];
  assert.ok(Math.abs(mc.breakEven.mid - 265) < 1e-9);
  assert.ok(Math.abs(mc.maxCpa.mid - (265 - 0.25 * 530)) < 1e-9);
  assert.ok(Math.abs(mc.firstOrderMaxCpa - (250 - 0.25 * 500)) < 1e-9);
  assert.ok(mc.maxCpa.low < mc.maxCpa.mid && mc.maxCpa.mid < mc.maxCpa.high);
});

test("för få kunder i poolen ⇒ ok=false med tal på vad som saknas", () => {
  const orders = [
    ...kohort("a", "2026-01-10", 60, 500, 0.1, 300, 10),
    ...kohort("b", "2026-02-10", 60, 500, 0.1, 300, 10),
  ];
  const r = computeLtv({ orders, today: "2026-09-08", targetMargin: 0.25 });
  assert.equal(r.pool[30].ok, false);
  assert.deepEqual(r.pool[30].saknas.kunder, [120, MIN_POOL_KUNDER]);
});

test("gästordrar räknas i guestShare, aldrig i kohorter", () => {
  const orders = [...kohort("a", "2026-01-10", 60, 500, 0, 0, 0), { kundHash: null, dag: "2026-01-11", netto: 100, tb: 10 }, { kundHash: null, dag: "2026-01-12", netto: 100, tb: 10 }];
  const r = computeLtv({ orders, today: "2026-09-08", targetMargin: 0.25 });
  assert.equal(r.totalKunder, 60);
  assert.equal(r.totalOrdrar, 62);
  assert.ok(Math.abs(r.guestShare - 2 / 62) < 1e-9);
});

test("tb saknas på första ordern ⇒ tb1 räknas på de som har, andelen rapporteras", () => {
  const med = kohort("a", "2026-01-10", 50, 500, 0, 0, 0, true);
  const utan = kohort("b", "2026-01-10", 50, 500, 0, 0, 0, false);
  const r = computeLtv({ orders: [...med, ...utan], today: "2026-09-08", targetMargin: 0.25 });
  const c = r.kohorter[0];
  assert.equal(c.n, 100);
  assert.equal(c.tb1, 250);
  assert.equal(c.tb1Saknas, 0.5);
});

test("tom indata ger tomt resultat utan krasch", () => {
  const r = computeLtv({ orders: [], today: "2026-09-08", targetMargin: 0.25 });
  assert.equal(r.kohorter.length, 0);
  assert.equal(r.aterkopsgrad, null);
  assert.equal(r.dataFrom, null);
});
