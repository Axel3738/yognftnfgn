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
