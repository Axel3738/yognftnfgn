// ROAS under dagen: ackumulerad och per timme. Körs med `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";

const { roasUnderDagen, jamntBeloppstak } = await import("../app/lib/roas-under-dagen.ts");

const noll = () => Array(24).fill(0);

test("ROAS hittills är ackumulerad försäljning delat med ackumulerad kostnad", () => {
  const sales = noll(), spend = noll(), orders = noll();
  sales[1] = 300; spend[0] = 100; spend[1] = 100; orders[1] = 1;
  sales[2] = 500; spend[2] = 100; orders[2] = 2;
  const p = roasUnderDagen({ day: "2026-09-28", sales, spend, orders });
  assert.equal(p.length, 24);
  assert.equal(p[0].hittills, 0); // kostnad men ingen försäljning = 0, ett riktigt svar
  assert.equal(p[1].hittills, 1.5);
  assert.equal(p[2].hittills, 800 / 300);
  assert.equal(p[2].timme, 5);
  assert.equal(p[2].ordersHittills, 3);
});

test("ingen kostnad än = ingen ROAS, aldrig 0 eller oändligt", () => {
  const sales = noll(); sales[0] = 200;
  const p = roasUnderDagen({ day: "d", sales, spend: noll(), orders: noll() });
  assert.equal(p[0].hittills, null);
  assert.equal(p[0].timme, null);
  const utan = roasUnderDagen({ day: "d", sales, spend: null, orders: noll() });
  assert.equal(utan[0].hittills, null);
  assert.equal(utan[0].salesHittills, 200);
});

test("i dag slutar kurvan vid nuvarande timme", () => {
  assert.equal(roasUnderDagen({ day: "d", sales: noll(), spend: noll(), orders: noll() }, 13).length, 14);
});

test("utan ROAS bär varje timme sin EGEN försäljning, inte summan hittills", () => {
  const sales = noll(), orders = noll();
  sales[2] = 300; orders[2] = 1;
  sales[5] = 500; orders[5] = 2;
  sales[6] = 200; orders[6] = 1;
  const p = roasUnderDagen({ day: "2026-10-03", sales, spend: null, orders }, 10);
  // staplarna: timmens egna tal
  assert.deepEqual(p.map((x) => x.salesTimme), [0, 0, 300, 0, 0, 500, 200, 0, 0, 0, 0]);
  assert.deepEqual(p.map((x) => x.ordersTimme), [0, 0, 1, 0, 0, 2, 1, 0, 0, 0, 0]);
  // summan under grafen: hittills
  assert.equal(p[10].salesHittills, 1000);
  assert.equal(p[10].ordersHittills, 4);
  // och en stapel får aldrig vara summan: timme 6 är 200, inte 1000
  assert.notEqual(p[6].salesTimme, p[6].salesHittills);
});

test("staplarnas tak är jämnt och rymmer alltid maxvärdet", () => {
  assert.equal(jamntBeloppstak(3791 * 1.1), 5000);
  assert.equal(jamntBeloppstak(180), 200);
  assert.equal(jamntBeloppstak(2400), 2500);
  assert.equal(jamntBeloppstak(1000), 1000);
  assert.equal(jamntBeloppstak(0), 1);
  assert.equal(jamntBeloppstak(NaN), 1);
  for (const v of [1, 7, 42, 999, 12345, 98765]) assert.ok(jamntBeloppstak(v) >= v, `${v}`);
});
