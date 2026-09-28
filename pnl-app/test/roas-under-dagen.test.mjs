// ROAS under dagen: ackumulerad och per timme. Körs med `npm test`.
import { test } from "node:test";
import assert from "node:assert/strict";

const { roasUnderDagen } = await import("../app/lib/roas-under-dagen.ts");

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
