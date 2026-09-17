// Summering av annonskostnad över flera annonskonton. Körs med `npm test`.
//
// Varför de här testerna finns: en butik kan köra annonser från två eller tre
// annonskonton till samma butik. Tappas ett konto bort i summeringen blir
// annonskostnaden för låg och vinsten för hög — utan att något ser trasigt ut.
import { test } from "node:test";
import assert from "node:assert/strict";

const { summeraDagar } = await import("../app/lib/spend-summa.ts");

const rad = (day, account, spend, impressions = 0, clicks = 0) => ({
  day,
  account,
  spend,
  impressions,
  clicks,
});

test("två konton samma dag läggs ihop till en rad", () => {
  const ut = summeraDagar([
    rad("2026-09-01", "111", 100, 1000, 10),
    rad("2026-09-01", "222", 50, 400, 4),
  ]);
  assert.equal(ut.length, 1);
  assert.equal(ut[0].day, "2026-09-01");
  assert.equal(ut[0].spend, 150);
  assert.equal(ut[0].impressions, 1400);
  assert.equal(ut[0].clicks, 14);
});

test("dagarna kommer i stigande ordning oavsett radernas ordning", () => {
  const ut = summeraDagar([
    rad("2026-09-03", "222", 5),
    rad("2026-09-01", "111", 1),
    rad("2026-09-02", "222", 3),
    rad("2026-09-01", "222", 2),
  ]);
  assert.deepEqual(
    ut.map((d) => d.day),
    ["2026-09-01", "2026-09-02", "2026-09-03"],
  );
  assert.equal(ut[0].spend, 3);
});

test("ett konto ensamt påverkas inte — befintliga butiker ser samma siffra", () => {
  const ut = summeraDagar([rad("2026-09-01", "111", 42.5, 99, 9)]);
  assert.deepEqual(ut, [{ day: "2026-09-01", spend: 42.5, impressions: 99, clicks: 9 }]);
});

test("en dold dag försvinner HELT, inte bara det trasiga kontots del", () => {
  // Konto 111 har död nyckel för idag; 222 hämtades. Att servera 50 kr vore
  // att visa en halv annonskostnad som om den vore hel.
  const ut = summeraDagar(
    [
      rad("2026-09-01", "111", 100),
      rad("2026-09-02", "111", 100),
      rad("2026-09-02", "222", 50),
    ],
    new Set(["2026-09-02"]),
  );
  assert.deepEqual(
    ut.map((d) => d.day),
    ["2026-09-01"],
  );
});

test("inga rader ger tom lista, inte en nolldag", () => {
  assert.deepEqual(summeraDagar([]), []);
  assert.deepEqual(summeraDagar([rad("2026-09-01", "111", 10)], new Set(["2026-09-01"])), []);
});

test("saknade tal räknas som noll i stället för NaN", () => {
  // Decimal-kolumner kommer som objekt ur Prisma; en rad som inte går att
  // tolka får inte förstöra HELA dagens summa med NaN.
  const ut = summeraDagar([
    rad("2026-09-01", "111", Number.NaN, undefined, null),
    rad("2026-09-01", "222", 25, 10, 1),
  ]);
  assert.equal(ut[0].spend, 25);
  assert.equal(ut[0].impressions, 10);
  assert.equal(ut[0].clicks, 1);
});
