// Timgrafen: timmen på dygnet, Metas timhinkar och tidszonsskillnaden.
// Körs med `npm test`.
//
// Det som måste hålla: 24 hinkar alltid, midnatt är 0 och inte 24, och
// annonskontots klocka läggs på butikens innan ROAS räknas. Går någon av dem
// fel syns det inte som ett fel — bara som en graf med toppen på fel timme.
import { test } from "node:test";
import assert from "node:assert/strict";

const { hourInTz, timmeUrBreakdown, tidszonsOffset, laggPaButikensKlocka } = await import(
  "../app/lib/timmar.ts"
);

/* ---------------------------------------------------------------- timmen */

test("midnatt är timme 0, aldrig 24", () => {
  // 2026-09-23 00:30 i Stockholm = 22:30 UTC dagen före.
  assert.equal(hourInTz(new Date("2026-09-22T22:30:00Z"), "Europe/Stockholm"), 0);
});

test("timmen räknas i butikens tidszon, inte i UTC", () => {
  const t = new Date("2026-09-23T10:15:00Z");
  assert.equal(hourInTz(t, "UTC"), 10);
  assert.equal(hourInTz(t, "Europe/Stockholm"), 12); // sommartid, +2
  assert.equal(hourInTz(t, "America/New_York"), 6); // −4
});

test("sista timmen på dygnet är 23", () => {
  assert.equal(hourInTz(new Date("2026-09-23T21:59:00Z"), "Europe/Stockholm"), 23);
});

/* En okänd zon får inte fälla orderhämtningen, och får inte heller lägga
   alla ordrar i timme 0 — då hade grafen visat en falsk nattopp. UTC är det
   enda ärliga fallet: grafen blir förskjuten, inte påhittad. */
test("en okänd tidszon faller tillbaka på UTC, inte på timme 0", () => {
  assert.equal(hourInTz(new Date("2026-09-23T10:00:00Z"), "Mars/Olympus"), 10);
  assert.equal(hourInTz(new Date("2026-09-23T23:00:00Z"), "Mars/Olympus"), 23);
});

/* ------------------------------------------------------- Metas timhinkar */

test("Metas timsträng blir ett timnummer", () => {
  assert.equal(timmeUrBreakdown("00:00:00 - 00:59:59"), 0);
  assert.equal(timmeUrBreakdown("13:00:00 - 13:59:59"), 13);
  assert.equal(timmeUrBreakdown("23:00:00 - 23:59:59"), 23);
});

test("skräp från Meta ger null, inte timme 0", () => {
  assert.equal(timmeUrBreakdown(""), null);
  assert.equal(timmeUrBreakdown(undefined), null);
  assert.equal(timmeUrBreakdown("hela dagen"), null);
  assert.equal(timmeUrBreakdown("24:00:00 - 24:59:59"), null);
});

/* --------------------------------------------------------- tidszonsparet */

/* Mätt 2026-09-23 mot Axels riktiga konton: MagiBorsten DK ligger på
   Europe/Copenhagen, MagiBorsten på Europe/Stockholm. Olika namn, samma tid.
   En namnjämförelse hade nekat ROAS per timme på varenda SE- och NO-butik. */
test("Copenhagen och Stockholm går i takt — namnen skiljer sig, tiden inte", () => {
  assert.equal(tidszonsOffset("Europe/Copenhagen", "Europe/Stockholm", "2026-09-23"), 0);
  assert.equal(tidszonsOffset("Europe/Oslo", "Europe/Stockholm", "2026-01-15"), 0);
});

test("en verklig skillnad räknas i hela timmar", () => {
  assert.equal(tidszonsOffset("Europe/Helsinki", "Europe/Stockholm", "2026-09-23"), 1);
  assert.equal(tidszonsOffset("Europe/London", "Europe/Stockholm", "2026-09-23"), -1);
});

test("över dygnsgränsen blir det inte 23 timmar fel", () => {
  const o = tidszonsOffset("America/New_York", "Europe/Stockholm", "2026-09-23");
  assert.equal(o, -6);
});

test("halvtimmeszoner går inte att lägga på butikens klocka", () => {
  assert.equal(tidszonsOffset("Asia/Kolkata", "Europe/Stockholm", "2026-09-23"), null);
});

test("okänd zon ger null, aldrig en gissad nolla", () => {
  assert.equal(tidszonsOffset(null, "Europe/Stockholm", "2026-09-23"), null);
  assert.equal(tidszonsOffset("", "Europe/Stockholm", "2026-09-23"), null);
  assert.equal(tidszonsOffset("Mars/Olympus", "Europe/Stockholm", "2026-09-23"), null);
});

/* Förskjutningen som timvisSpend gör, isolerad: kontots timme 14 ska hamna
   på butikens timme 13 när kontot ligger en timme före. */
test("förskjutningen lägger kontots timme på butikens klocka", () => {
  const lagg = laggPaButikensKlocka;
  assert.equal(lagg(14, 1), 13);
  assert.equal(lagg(0, 1), 23, "midnatt hos kontot är 23 kvällen före hos butiken");
  assert.equal(lagg(23, -1), 0);
  assert.equal(lagg(14, 0), 14);
});
