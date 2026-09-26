// Returkollen: vilka butiker som står på tur, hur tiden visas, och hur
// KundOrder-raderna i ett fönster ersätts. Körs med `npm test`.
//
// Det som måste hålla: aldrig kollade butiker först och sedan äldst först,
// högst tre per tick, och en order som avbokats efter att den cachades
// försvinner ur KundOrder när fönstret hämtas om. Går något av det fel syns
// det inte som ett fel — bara som en vinst och ett kundvärde som är för höga.
import { test } from "node:test";
import assert from "node:assert/strict";

const { valjResyncButiker, klockslag, aldstaKoll, sqlTid, kundOrderErsattning, RESYNC_INTERVALL_MS, RESYNC_PER_TICK } =
  await import("../app/lib/returkoll.ts");
const { parseOrderLines } = await import("../app/lib/orderrader.ts");

const NU = Date.parse("2026-09-26T12:00:00Z");
const timmarSedan = (h) => new Date(NU - h * 60 * 60 * 1000);

/* --------------------------------------------------------- butiksvalet */

test("aldrig kollade först, sedan äldst först, och högst tre", () => {
  const rader = [
    { shop: "d.myshopify.com", refundResyncAt: timmarSedan(7) },
    { shop: "b.myshopify.com", refundResyncAt: null },
    { shop: "e.myshopify.com", refundResyncAt: timmarSedan(30) },
    { shop: "a.myshopify.com", refundResyncAt: null },
    { shop: "c.myshopify.com", refundResyncAt: timmarSedan(9) },
  ];
  const tur = valjResyncButiker(rader, NU);
  assert.equal(RESYNC_PER_TICK, 3);
  assert.deepEqual(tur.map((r) => r.shop), ["a.myshopify.com", "b.myshopify.com", "e.myshopify.com"]);
});

test("en butik kollad för mindre än 6 h sedan står inte på tur", () => {
  assert.equal(RESYNC_INTERVALL_MS, 6 * 60 * 60 * 1000);
  const tur = valjResyncButiker(
    [
      { shop: "farsk", refundResyncAt: timmarSedan(5.9) },
      { shop: "gammal", refundResyncAt: timmarSedan(6.1) },
    ],
    NU,
  );
  assert.deepEqual(tur.map((r) => r.shop), ["gammal"]);
});

test("max styr antalet, och noll ger ingenting", () => {
  const rader = Array.from({ length: 10 }, (_, i) => ({ shop: `s${i}`, refundResyncAt: timmarSedan(10 + i) }));
  assert.equal(valjResyncButiker(rader, NU, 5).length, 5);
  assert.equal(valjResyncButiker(rader, NU, 0).length, 0);
  // Äldst först: s9 (19 h) före s8 (18 h).
  assert.deepEqual(valjResyncButiker(rader, NU, 2).map((r) => r.shop), ["s9", "s8"]);
});

test("en butik den här tjänsten nyss misslyckades med tar ingen plats", () => {
  // Utan pausen hade tre butiker med döda nycklar (stämpeln rullas tillbaka
  // vid fel, så de förblir äldst) tagit alla tre platser på varje tick.
  const rader = [
    { shop: "dod1", refundResyncAt: null },
    { shop: "dod2", refundResyncAt: null },
    { shop: "dod3", refundResyncAt: null },
    { shop: "levande", refundResyncAt: timmarSedan(8) },
  ];
  const tur = valjResyncButiker(rader, NU, 3, new Set(["dod1", "dod2", "dod3"]));
  assert.deepEqual(tur.map((r) => r.shop), ["levande"]);
});

test("valet ändrar inte indatan", () => {
  const rader = [
    { shop: "b", refundResyncAt: timmarSedan(8) },
    { shop: "a", refundResyncAt: null },
  ];
  valjResyncButiker(rader, NU);
  assert.deepEqual(rader.map((r) => r.shop), ["b", "a"]);
});

/* ------------------------------------------------------------ tiderna */

test("klockslaget visas i butikens tid, med datum när kollen inte var i dag", () => {
  const d = new Date("2026-09-26T10:05:00Z");
  assert.equal(klockslag(d, "Europe/Stockholm", "2026-09-26"), "12:05");
  assert.equal(klockslag(d, "Europe/Stockholm", "2026-09-27"), "2026-09-26 12:05");
  // Samma ögonblick är redan nästa dag i Auckland.
  assert.equal(klockslag(new Date("2026-09-26T13:00:00Z"), "Pacific/Auckland", "2026-09-27"), "01:00");
});

test("gruppens koll är den äldsta, och aldrig kollade räknas", () => {
  const r = aldstaKoll([
    { refundResyncAt: timmarSedan(2) },
    { refundResyncAt: null },
    { refundResyncAt: timmarSedan(5) },
  ]);
  assert.equal(r.aldsta.getTime(), timmarSedan(5).getTime());
  assert.equal(r.saknas, 1);
  assert.deepEqual(aldstaKoll([]), { aldsta: null, saknas: 0 });
});

test("SQL-tiden är UTC med millisekunder, och null förblir null", () => {
  assert.equal(sqlTid(new Date("2026-09-26T10:05:03.042Z")), "2026-09-26 10:05:03.042");
  assert.equal(sqlTid(null), null);
});

/* ------------------------------------------------- KundOrder-ersättningen */

const pengar = (n) => ({ shopMoney: { amount: String(n) } });
const TZ = "Europe/Stockholm";
const order = (id, createdAt, extra = {}) => ({
  id,
  createdAt,
  cancelledAt: null,
  test: false,
  customer: { id: `gid://shopify/Customer/${id}` },
  totalPriceSet: pengar(500),
  subtotalPriceSet: pengar(500),
  totalDiscountsSet: pengar(0),
  totalShippingPriceSet: pengar(0),
  totalRefundedSet: pengar(0),
  ...extra,
});

/** Samma form som tillKundOrderRader ger — kundHash ersatt av GID:t här. */
const tillRader = (data) =>
  data.kundOrdrar.map((o) => ({ orderId: o.orderId, kundHash: o.customerGid, dag: o.dag, netto: o.netto, tb: null }));

/** Kör planen mot en tabell i minnet, i samma ordning som transaktionen. */
function tillampa(tabell, plan) {
  const idn = new Set(plan.orderIdBitar.flat());
  const kvar = tabell.filter((r) => !(r.dag >= plan.fran && r.dag <= plan.till) && !idn.has(r.orderId));
  return [...kvar, ...plan.bitar.flat()];
}

test("en order avbokad inne i fönstret försvinner ur KundOrder", () => {
  const fran = "2026-09-10";
  const till = "2026-09-12";
  // Förra hämtningen: X och Y sålda, plus en gammal order utanför fönstret.
  const forst = parseOrderLines(
    [order("X", "2026-09-10T10:00:00Z"), order("Y", "2026-09-11T10:00:00Z")],
    fran, till, TZ,
  );
  let tabell = [{ shop: "s", orderId: "Z", kundHash: "k", dag: "2026-08-01", netto: 300, tb: null }];
  tabell = tillampa(tabell, kundOrderErsattning("s", fran, till, tillRader(forst)));
  assert.deepEqual(tabell.map((r) => r.orderId).sort(), ["X", "Y", "Z"]);

  // Returkollen: X har avbokats sedan dess, och Y har fått en delretur.
  const sedan = parseOrderLines(
    [
      order("X", "2026-09-10T10:00:00Z", { cancelledAt: "2026-09-20T08:00:00Z" }),
      order("Y", "2026-09-11T10:00:00Z", { totalRefundedSet: pengar(200) }),
    ],
    fran, till, TZ,
  );
  const plan = kundOrderErsattning("s", fran, till, tillRader(sedan));
  // Den avbokade ordern finns inte i det som skrivs …
  assert.equal(plan.bitar.flat().some((r) => r.orderId === "X"), false);
  tabell = tillampa(tabell, plan);
  // … och inte heller kvar i tabellen efteråt.
  assert.deepEqual(tabell.map((r) => r.orderId).sort(), ["Y", "Z"]);
  // Delreturen har nått nettot.
  assert.equal(tabell.find((r) => r.orderId === "Y").netto, 300);
  // Ordern utanför fönstret rördes inte.
  assert.equal(tabell.find((r) => r.orderId === "Z").netto, 300);
});

test("en lyckad hämtning utan ordrar tömmer fönstret — bara fönstret", () => {
  const tabell = [
    { shop: "s", orderId: "X", kundHash: "k", dag: "2026-09-10", netto: 500, tb: null },
    { shop: "s", orderId: "Z", kundHash: "k", dag: "2026-08-01", netto: 300, tb: null },
  ];
  const tom = parseOrderLines([], "2026-09-10", "2026-09-12", TZ);
  const efter = tillampa(tabell, kundOrderErsattning("s", "2026-09-10", "2026-09-12", tillRader(tom)));
  assert.deepEqual(efter.map((r) => r.orderId), ["Z"]);
});

test("en order vars dag flyttats ut ur fönstret krockar inte med nyckeln", () => {
  // Raden ligger på 2026-09-09 (gammal tidszon); den nya hämtningen säger 09-10.
  const tabell = [{ shop: "s", orderId: "X", kundHash: "k", dag: "2026-09-09", netto: 500, tb: null }];
  const plan = kundOrderErsattning("s", "2026-09-10", "2026-09-12", [
    { orderId: "X", kundHash: "k", dag: "2026-09-10", netto: 500, tb: null },
  ]);
  const efter = tillampa(tabell, plan);
  assert.equal(efter.filter((r) => r.orderId === "X").length, 1);
  assert.equal(efter[0].dag, "2026-09-10");
});

test("skrivningen delas i bitar under Postgres parametertak", () => {
  const rader = Array.from({ length: 4500 }, (_, i) => ({ orderId: `o${i}`, kundHash: null, dag: "2026-09-10", netto: 1, tb: null }));
  const plan = kundOrderErsattning("s", "2026-09-10", "2026-09-10", rader);
  assert.deepEqual(plan.bitar.map((b) => b.length), [2000, 2000, 500]);
  assert.deepEqual(plan.orderIdBitar.map((b) => b.length), [2000, 2000, 500]);
  assert.ok(plan.bitar.flat().every((r) => r.shop === "s"));
  assert.deepEqual(kundOrderErsattning("s", "2026-09-10", "2026-09-10", []).bitar, []);
});
