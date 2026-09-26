// Orderhistorikens horisont. Körs med `npm test`.
//
// Utan read_all_orders svarar Shopify TOMT för ordrar äldre än 60 dagar. Det
// som måste hålla: ingen hämtning före horisonten (den hade skrivit nollor
// över riktiga dagar), en rad hämtad när dagen redan var osynlig räknas inte
// som försäljning, och annonskostnaden täcker samma dagar som omsättningen.
// Går något av det fel syns det inte som ett fel — bara som en förlust.
import { test } from "node:test";
import assert from "node:assert/strict";

const { historikHorisont, klampaFonster, klassaDag, harAllaOrdrar, resyncFonster, RESYNC_DAGAR } = await import("../app/lib/historik.ts");
const { compute } = await import("../app/lib/pnl.server.ts");

const IDAG = "2026-09-26";
const HORISONT = "2026-07-29"; // idag − 59

/* -------------------------------------------------------------- horisonten */

test("utan read_all_orders och utan sondsvar är horisonten idag − 59", () => {
  assert.equal(historikHorisont({ scope: "read_orders,read_products", fullHistory: null, today: IDAG }), HORISONT);
  assert.equal(historikHorisont({ scope: null, fullHistory: undefined, today: IDAG }), HORISONT);
});

test("sonden sa nej: horisonten gäller fortfarande", () => {
  assert.equal(historikHorisont({ scope: "read_orders", fullHistory: false, today: IDAG }), HORISONT);
});

test("read_all_orders i scopen tar bort gränsen", () => {
  assert.equal(historikHorisont({ scope: "read_orders, read_all_orders", fullHistory: null, today: IDAG }), null);
  assert.equal(harAllaOrdrar("read_orders,read_all_orders"), true);
  assert.equal(harAllaOrdrar("read_orders,read_all_ordersX"), false);
});

test("sonden såg en gammal order: ingen gräns", () => {
  assert.equal(historikHorisont({ scope: "read_orders", fullHistory: true, today: IDAG }), null);
});

test("horisonten går över månadsskiftet", () => {
  assert.equal(historikHorisont({ scope: "", fullHistory: null, today: "2026-03-01" }), "2026-01-01");
});

/* ------------------------------------------------------------- klämningen */

test("ett fönster helt före horisonten ger null — inget hämtas, inget skrivs", () => {
  assert.equal(klampaFonster("2026-06-01", "2026-07-28", HORISONT), null);
});

test("ett fönster som korsar horisonten kläms i början", () => {
  assert.deepEqual(klampaFonster("2026-06-29", IDAG, HORISONT), [HORISONT, IDAG]);
});

test("ett fönster innanför horisonten lämnas i fred", () => {
  assert.deepEqual(klampaFonster("2026-09-20", IDAG, HORISONT), ["2026-09-20", IDAG]);
});

test("fönstret som slutar PÅ horisonten får just den dagen", () => {
  assert.deepEqual(klampaFonster("2026-07-01", HORISONT, HORISONT), [HORISONT, HORISONT]);
});

test("utan horisont kläms ingenting", () => {
  assert.deepEqual(klampaFonster("2025-10-01", IDAG, null), ["2025-10-01", IDAG]);
});

/* ------------------------------------------------------- dagarnas klasser */

const hamtad = (iso) => ({ fetchedAt: new Date(iso) });

test("en rad hämtad 62 dagar efter sin dag är utanför historiken", () => {
  // Dagen 2026-07-01, hämtad 2026-09-01: Shopify visade bara ordrar efter 2026-07-03.
  assert.equal(klassaDag("2026-07-01", hamtad("2026-09-01T10:00:00Z"), HORISONT, "Europe/Stockholm"), "outsideHistory");
});

test("en färsk rad är försäljning", () => {
  assert.equal(klassaDag("2026-09-25", hamtad("2026-09-26T08:00:00Z"), HORISONT, "Europe/Stockholm"), "sales");
});

test("en gammal rad som hämtades medan dagen syntes är riktig försäljning", () => {
  // Dagen 2026-07-01 hämtad 2026-07-02: skriven när den låg innanför 60 dygn.
  assert.equal(klassaDag("2026-07-01", hamtad("2026-07-02T08:00:00Z"), HORISONT, "Europe/Stockholm"), "sales");
});

test("en rad vars hämtning bara såg halva dagen räknas inte som hel", () => {
  // Hämtad 60 dygn + 6 h efter midnatt: gränsen låg mitt i dagen.
  // 2026-07-01 00:00 i Stockholm = 2026-06-30 22:00 UTC.
  const halv = new Date(Date.parse("2026-06-30T22:00:00Z") + 60 * 86_400_000 + 6 * 3_600_000);
  assert.equal(klassaDag("2026-07-01", { fetchedAt: halv }, HORISONT, "Europe/Stockholm"), "outsideHistory");
  // Hämtad en timme innan gränsen nådde dagen: hela dagen syntes.
  const hel = new Date(Date.parse("2026-06-30T22:00:00Z") + 60 * 86_400_000 - 3_600_000);
  assert.equal(klassaDag("2026-07-01", { fetchedAt: hel }, HORISONT, "Europe/Stockholm"), "sales");
});

test("en saknad dag före horisonten är utanför, efter horisonten saknad", () => {
  assert.equal(klassaDag("2026-07-28", null, HORISONT), "outsideHistory");
  assert.equal(klassaDag(HORISONT, null, HORISONT), "missing");
});

test("med full historik är allt antingen försäljning eller saknat", () => {
  assert.equal(klassaDag("2025-12-01", null, null), "missing");
  assert.equal(klassaDag("2025-12-01", hamtad("2026-09-01T00:00:00Z"), null), "sales");
});

/* ----------------------------------- annonskostnaden följer omsättningen */

test("spend filtrerad till täckta dagar ger samma MER som en period från horisonten", () => {
  const dagar = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(Date.parse("2026-06-29T12:00:00Z") + i * 86_400_000).toISOString().slice(0, 10);
    dagar.push(d);
  }
  const tackta = dagar.filter((d) => d >= HORISONT);
  const utanfor = new Set(dagar.filter((d) => d < HORISONT));
  const salj = (d) => ({
    day: d, orders: 10, grossSales: 9000, discounts: 0, returns: 0, netSales: 9000, totalSales: 9000, shippingCharges: 0, fees: 0,
  });
  const spend = dagar.map((d) => ({ day: d, spend: 3000, impressions: 0, clicks: 0 }));
  const bas = {
    to: IDAG, spendReliable: true, fixedMonthlyTotal: 3000, sessions: [], products: [], costChanges: [],
    settings: { tariffPerOrder: 0, feeRate: 0, targetMargin: 0.25 },
  };

  // Panelen: hela 90-dagarsperioden, men försäljningen har bara de täckta
  // dagarna (readDaily lägger resten i outsideHistory) och spend filtreras.
  const filtrerad = compute({
    ...bas, from: dagar[0], sales: tackta.map(salj), spend: spend.filter((s) => !utanfor.has(s.day)),
  });
  // Facit: en period som börjar på horisonten.
  const facit = compute({ ...bas, from: HORISONT, sales: tackta.map(salj), spend });

  assert.equal(filtrerad.totals.mer, facit.totals.mer);
  assert.equal(filtrerad.totals.spend, facit.totals.spend);
  assert.equal(filtrerad.totals.fixedCosts, facit.totals.fixedCosts);
  assert.equal(filtrerad.totals.netProfit, facit.totals.netProfit);

  // Och det här är felet spärren finns för: hela periodens spend mot de
  // täckta dagarnas omsättning ger en MER som ser dubbelt så dålig ut.
  const ofiltrerad = compute({ ...bas, from: dagar[0], sales: tackta.map(salj), spend });
  assert.ok(ofiltrerad.totals.mer < facit.totals.mer);
  assert.ok(ofiltrerad.totals.netProfit < facit.totals.netProfit);
});

/* ------------------------------------------------------------ returkollen */

test("returkollens fönster är idag − 44 … idag — 45 dagar", () => {
  assert.equal(RESYNC_DAGAR, 45);
  assert.deepEqual(resyncFonster(IDAG, HORISONT), ["2026-08-13", IDAG]);
  assert.deepEqual(resyncFonster(IDAG, null), ["2026-08-13", IDAG]);
});

test("returkollens fönster kläms mot horisonten", () => {
  // En horisont närmare än 45 dagar (tänkt fall) får aldrig passeras — en
  // export bortom den hade skrivit nollor över riktiga dagar.
  assert.deepEqual(resyncFonster(IDAG, "2026-09-01"), ["2026-09-01", IDAG]);
  // Den vanliga horisonten (idag − 59) ligger bortom fönstret och ändrar inget.
  assert.deepEqual(resyncFonster(IDAG, historikHorisont({ scope: "", fullHistory: null, today: IDAG })), ["2026-08-13", IDAG]);
});

test("returkollens fönster går över månads- och årsskiftet", () => {
  assert.deepEqual(resyncFonster("2026-01-10", null), ["2025-11-27", "2026-01-10"]);
});
