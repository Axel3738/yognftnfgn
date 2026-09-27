/**
 * Google Ads: de två räknefel som kostar riktiga pengar (miljondelarna och
 * kontoprefixet), plus de tysta bortfallen (andra batchen, timme utan timme).
 */

import test from "node:test";
import assert from "node:assert/strict";

import { arGoogle, felText, kontoUrRad, platta, PREFIX, slaIhopKonton, somKonto, tolkaSpend } from "../app/lib/google-ads.ts";

const rad = (day, cost, extra = {}) => ({
  segments: { date: day, ...(extra.hour != null ? { hour: extra.hour } : {}) },
  metrics: { costMicros: String(cost), impressions: extra.imp ?? "0", clicks: extra.klick ?? "0" },
});

test("cost_micros räknas om till hela valutaenheter", () => {
  const [d] = tolkaSpend([rad("2026-09-20", 1_234_560_000)]);
  assert.equal(d.spend, 1234.56);
});

test("en miljon micros är EN krona, inte en miljon", () => {
  const [d] = tolkaSpend([rad("2026-09-20", 1_000_000)]);
  assert.equal(d.spend, 1);
});

test("flera rader samma dag summeras", () => {
  const rader = [rad("2026-09-20", 500_000, { imp: "10", klick: "2" }), rad("2026-09-20", 500_000, { imp: "5", klick: "1" })];
  const ut = tolkaSpend(rader);
  assert.equal(ut.length, 1);
  assert.equal(ut[0].spend, 1);
  assert.equal(ut[0].impressions, 15);
  assert.equal(ut[0].clicks, 3);
});

test("dagar kommer i datumordning", () => {
  const ut = tolkaSpend([rad("2026-09-22", 0), rad("2026-09-20", 0), rad("2026-09-21", 0)]);
  assert.deepEqual(ut.map((d) => d.day), ["2026-09-20", "2026-09-21", "2026-09-22"]);
});

test("rader utan giltigt datum hoppas över", () => {
  assert.equal(tolkaSpend([{ metrics: { costMicros: "9000000" } }]).length, 0);
  assert.equal(tolkaSpend([rad("inte ett datum", 9_000_000)]).length, 0);
});

test("timvis: varje timme blir sin egen hink", () => {
  const ut = tolkaSpend([rad("2026-09-20", 1_000_000, { hour: 9 }), rad("2026-09-20", 2_000_000, { hour: 10 })], true);
  assert.equal(ut.length, 2);
  assert.deepEqual(ut.map((r) => r.hour), [9, 10]);
  assert.equal(ut[1].spend, 2);
});

test("timme 0 är en riktig timme, inte ett saknat värde", () => {
  const ut = tolkaSpend([rad("2026-09-20", 3_000_000, { hour: 0 })], true);
  assert.equal(ut.length, 1);
  assert.equal(ut[0].hour, 0);
});

test("timvis svar UTAN timme räknas aldrig som en dagsrad", () => {
  /* Annars hade samma kostnad legat både som dag och som timme, och
     timgrafens summa sagt emot dagssiffran. */
  const ut = tolkaSpend([rad("2026-09-20", 5_000_000), rad("2026-09-20", 1_000_000, { hour: 7 })], true);
  assert.equal(ut.length, 1);
  assert.equal(ut[0].spend, 1);
});

test("dagsläge ignorerar timfältet helt", () => {
  const ut = tolkaSpend([rad("2026-09-20", 1_000_000, { hour: 7 }), rad("2026-09-20", 1_000_000, { hour: 8 })]);
  assert.equal(ut.length, 1);
  assert.equal(ut[0].hour, null);
  assert.equal(ut[0].spend, 2);
});

test("snake_case-stavningen av cost_micros läses också", () => {
  const ut = tolkaSpend([{ segments: { date: "2026-09-20" }, metrics: { cost_micros: "2500000" } }]);
  assert.equal(ut[0].spend, 2.5);
});

test("kontonamnet prefixas så Googles kundnummer aldrig krockar med Metas", () => {
  assert.equal(somKonto("1234567890"), "g:1234567890");
  assert.equal(somKonto("123-456-7890"), "g:1234567890");
  assert.ok(arGoogle(somKonto("1234567890")));
  assert.ok(!arGoogle("1234567890"));
  assert.equal(PREFIX, "g:");
});

test("searchStream: ALLA batchar läses, inte bara den första", () => {
  const body = [{ results: [rad("2026-09-20", 1_000_000)] }, { results: [rad("2026-09-21", 1_000_000)] }];
  assert.equal(platta(body).length, 2);
});

test("searchStream: ett vanligt objekt fungerar också", () => {
  assert.equal(platta({ results: [rad("2026-09-20", 0)] }).length, 1);
  assert.deepEqual(platta(null), []);
});

test("felmeddelandet hittas oavsett var Google lagt det", () => {
  assert.equal(felText({ error: { message: "ytligt" } }), "ytligt");
  assert.equal(felText([{ error: { message: "i en ström" } }]), "i en ström");
  assert.equal(
    felText({ error: { message: "ytligt", details: [{ errors: [{ message: "det riktiga skälet" }] }] } }),
    "det riktiga skälet",
  );
  assert.equal(felText({}), "");
});

test("chefskonton blir aldrig valbara — de har ingen egen kostnad", () => {
  assert.equal(kontoUrRad({ id: "111", manager: true }, "111", null), null);
});

test("underkonto via chefskonto bär chefens nummer som loginCustomerId", () => {
  const k = kontoUrRad(
    { id: "2223334444", descriptiveName: "Butiken", currencyCode: "SEK", timeZone: "Europe/Stockholm", manager: false },
    "",
    "999-888-7777",
  );
  assert.deepEqual(k, {
    customerId: "2223334444",
    name: "Butiken",
    currency: "SEK",
    timezone: "Europe/Stockholm",
    loginCustomerId: "9998887777",
  });
});

test("direkt åtkomst vinner över samma konto via chefskonto", () => {
  const viaChef = { customerId: "1", name: "A", currency: "SEK", timezone: "", loginCustomerId: "9" };
  const direkt = { ...viaChef, loginCustomerId: null };
  assert.deepEqual(slaIhopKonton([viaChef, direkt]), [direkt]);
  assert.deepEqual(slaIhopKonton([direkt, viaChef]), [direkt]);
});
