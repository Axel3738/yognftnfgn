// Egna datum i panelen. Körs med `npm test`.
//
// Datumen kommer ur adressfältet och går rakt in i en databasfråga. Ett
// ogiltigt datum blev `new Date("abc")` och tog ner hela sidan — därför
// städas de här, och därför är det här testat.
import { test } from "node:test";
import assert from "node:assert/strict";

const { egnaDatum, rangeWindow } = await import("../app/lib/pnl.server.ts");

const shift = (iso, days) => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const IDAG = "2026-09-22";
const kor = (from, to) => egnaDatum({ from, to }, IDAG, shift);

test("en enda dag är ett giltigt spann", () => {
  assert.deepEqual(kor("2026-09-20", "2026-09-20"), ["2026-09-20", "2026-09-20"]);
});

test("ett vanligt spann lämnas i fred", () => {
  assert.deepEqual(kor("2026-09-01", "2026-09-20"), ["2026-09-01", "2026-09-20"]);
});

test("bakvända datum vänds rätt", () => {
  assert.deepEqual(kor("2026-09-20", "2026-09-01"), ["2026-09-01", "2026-09-20"]);
});

test("framtiden klipps vid idag", () => {
  assert.deepEqual(kor("2026-09-20", "2027-01-01"), ["2026-09-20", IDAG]);
});

test("ett helt framtida spann blir idag", () => {
  assert.deepEqual(kor("2027-01-01", "2027-02-01"), [IDAG, IDAG]);
});

test("skräp faller tillbaka på idag i stället för att krascha", () => {
  assert.deepEqual(kor("abc", "2026-09-20"), ["2026-09-20", IDAG]);
  assert.deepEqual(kor("2026-09-20", "hej"), ["2026-09-20", IDAG]);
  assert.deepEqual(kor("", ""), [IDAG, IDAG]);
  assert.deepEqual(egnaDatum(undefined, IDAG, shift), [IDAG, IDAG]);
});

test("ett datum som ser rätt ut men inte finns avvisas", () => {
  assert.deepEqual(kor("2026-02-31", "2026-09-20"), ["2026-09-20", IDAG]);
  assert.deepEqual(kor("2026-13-01", "2026-09-20"), ["2026-09-20", IDAG]);
});

test("spannet begränsas till ett år bakåt", () => {
  const [from, to] = kor("2020-01-01", "2026-09-20");
  assert.equal(to, "2026-09-20");
  assert.equal(from, shift("2026-09-20", -364));
});

test("rangeWindow skickar custom genom städningen", () => {
  assert.deepEqual(rangeWindow("custom", IDAG, { from: "2026-09-20", to: "2026-09-20" }), [
    "2026-09-20",
    "2026-09-20",
  ]);
  assert.deepEqual(rangeWindow("custom", IDAG, { from: "x", to: "y" }), [IDAG, IDAG]);
});

test("de färdiga spannen är oförändrade", () => {
  assert.deepEqual(rangeWindow("today", IDAG), [IDAG, IDAG]);
  assert.deepEqual(rangeWindow("yesterday", IDAG), ["2026-09-21", "2026-09-21"]);
  assert.deepEqual(rangeWindow("7d", IDAG), ["2026-09-16", IDAG]);
  assert.deepEqual(rangeWindow("30d", IDAG), ["2026-08-24", IDAG]);
  assert.deepEqual(rangeWindow("90d", IDAG), ["2026-06-25", IDAG]);
});
