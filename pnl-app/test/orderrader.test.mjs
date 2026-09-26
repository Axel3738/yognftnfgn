// Orderrader → dagsaggregat, och sidbläddringen för korta fönster.
// Körs med `npm test`.
//
// Varenda intäktssiffra i appen går genom parseOrderLines, och fram till nu
// hade den inga tester alls. Fixturerna nedan LÅSER dagens räkning (delvis
// återbetalning, avbruten order, testorder, debiterad frakt) så att en senare
// ändring av moms, returer eller rabatter syns här först — inte i en vinst
// som tyst flyttat sig.
import { test } from "node:test";
import assert from "node:assert/strict";

const { paginera, parseOrderLines, summeraAvgifter, mergeProductRows } = await import("../app/lib/orderrader.ts");

const pengar = (n) => ({ shopMoney: { amount: String(n) } });

/* ---------------------------------------------------------- sidbläddring */

const sidor = (antal, perSida = 2) =>
  Array.from({ length: antal }, (_, i) => ({
    nodes: Array.from({ length: perSida }, (_, j) => ({
      id: `gid://shopify/Order/${i * perSida + j}`,
      lineItems: { pageInfo: { hasNextPage: false }, nodes: [{ title: "Borste", quantity: 1 }] },
    })),
    pageInfo: { hasNextPage: i < antal - 1, endCursor: `c${i}` },
  }));

test("21 sidor med tak 20: trunkerad, och alla 20 sidorna kommer med", async () => {
  const svar = sidor(21);
  const efterfragade = [];
  const r = await paginera(async (after) => {
    efterfragade.push(after);
    return svar[efterfragade.length - 1];
  }, 20);
  assert.equal(r.trunkerad, true);
  assert.equal(efterfragade.length, 20);
  // 20 sidor × 2 ordrar × (order + en radartikel)
  assert.equal(r.lines.filter((l) => !l.__parentId).length, 40);
  assert.equal(r.lines.filter((l) => l.__parentId).length, 40);
  // Markören följer med mellan sidorna.
  assert.deepEqual(efterfragade.slice(0, 3), [null, "c0", "c1"]);
});

test("exakt 20 sidor: inte trunkerad", async () => {
  const svar = sidor(20);
  let i = 0;
  const r = await paginera(async () => svar[i++], 20);
  assert.equal(r.trunkerad, false);
  assert.equal(r.lines.filter((l) => !l.__parentId).length, 40);
});

test("en order med fler radartiklar än frågan tog ger trunkerad", async () => {
  const r = await paginera(async () => ({
    nodes: [
      { id: "o1", lineItems: { pageInfo: { hasNextPage: true }, nodes: [{ title: "A", quantity: 1 }] } },
    ],
    pageInfo: { hasNextPage: false, endCursor: null },
  }));
  assert.equal(r.trunkerad, true);
});

test("radartiklarna får orderns id som __parentId och ordern tappar lineItems", async () => {
  const r = await paginera(async () => sidor(1, 1)[0]);
  assert.equal(r.trunkerad, false);
  assert.equal(r.lines[0].lineItems, undefined);
  assert.equal(r.lines[1].__parentId, r.lines[0].id);
});

test("ett fel i sidhämtningen kastas vidare — blir aldrig en tom lista", async () => {
  await assert.rejects(
    paginera(async () => {
      throw new Error("Order query failed: ACCESS_DENIED");
    }),
    /ACCESS_DENIED/,
  );
});

/* ---------------------------------------------------------------- parsern */

const TZ = "Europe/Stockholm";

/* 2026-09-10 12:00 i Stockholm. Delvis återbetald, med frakt och avgifter. */
const orderA = {
  id: "A",
  createdAt: "2026-09-10T10:00:00Z",
  cancelledAt: null,
  test: false,
  customer: { id: "gid://shopify/Customer/7" },
  shippingAddress: { countryCodeV2: "se" },
  totalPriceSet: pengar(549),
  subtotalPriceSet: pengar(500),
  totalDiscountsSet: pengar(50),
  totalShippingPriceSet: pengar(49),
  totalRefundedSet: pengar(100),
  transactions: [
    { status: "SUCCESS", fees: [{ amount: { amount: "15.50" } }] },
    { status: "FAILURE", fees: [{ amount: { amount: "99" } }] },
  ],
};
const raderA = [
  { __parentId: "A", title: "Borste", variantTitle: "Default Title", quantity: 2, discountedTotalSet: pengar(300), product: { id: "P1" }, variant: { id: "V1" } },
  { __parentId: "A", title: "Mössa", variantTitle: "Röd", quantity: 1, discountedTotalSet: pengar(200), product: { id: "P2" }, variant: { id: "V2" } },
];
/* Avbruten: ska inte räknas, och inte dess rader heller. */
const avbruten = {
  ...orderA, id: "B", cancelledAt: "2026-09-10T11:00:00Z", totalRefundedSet: pengar(0),
};
const raderB = [{ ...raderA[0], __parentId: "B" }];
/* Testorder: ska inte räknas. */
const testorder = { ...orderA, id: "C", test: true, totalRefundedSet: pengar(0) };
/* Norsk order dagen efter, utan återbetalning, utan frakt. */
const orderD = {
  id: "D",
  createdAt: "2026-09-11T06:30:00Z",
  cancelledAt: null,
  test: false,
  shippingAddress: null,
  billingAddress: { countryCodeV2: "NO" },
  totalPriceSet: pengar(300),
  subtotalPriceSet: pengar(300),
  totalDiscountsSet: pengar(0),
  totalShippingPriceSet: pengar(0),
  totalRefundedSet: pengar(0),
  transactions: { nodes: [{ status: "SUCCESS", fees: [{ amount: { amount: "9" } }] }] },
};
const raderD = [{ __parentId: "D", title: "Borste", variantTitle: null, quantity: 1, discountedTotalSet: pengar(300), product: { id: "P1" }, variant: { id: "V1" } }];
/* Utanför fönstret (marginaldagen före): ska inte räknas. */
const utanfor = { ...orderD, id: "E", createdAt: "2026-09-08T12:00:00Z" };

const jsonl = [orderA, ...raderA, avbruten, ...raderB, testorder, orderD, ...raderD, utanfor];
const data = parseOrderLines(jsonl, "2026-09-10", "2026-09-12", TZ, true, true);
const dag = (d) => data.sales.find((s) => s.day === d);

test("varje dag i fönstret finns, även utan ordrar", () => {
  assert.deepEqual(data.sales.map((s) => s.day), ["2026-09-10", "2026-09-11", "2026-09-12"]);
  assert.equal(dag("2026-09-12").orders, 0);
  assert.equal(dag("2026-09-12").fees, 0);
});

test("delvis återbetald order med frakt: dagens räkning låst", () => {
  const s = dag("2026-09-10");
  assert.equal(s.orders, 1); // avbruten + testorder räknas inte
  assert.equal(s.grossSales, 550); // subtotal + rabatter
  assert.equal(s.discounts, -50);
  assert.equal(s.returns, -100);
  assert.equal(s.netSales, 400); // subtotal − återbetalt
  assert.equal(s.totalSales, 449); // totalpris − återbetalt (frakt ingår)
  assert.equal(s.shippingCharges, 49);
  assert.equal(s.fees, 15.5); // bara den lyckade transaktionen
});

test("avbrutna ordrars och testordrars rader hamnar inte i produktmixen", () => {
  const mix = data.productsByDay["2026-09-10"];
  const borste = mix.find((p) => p.variantGid === "V1");
  assert.equal(borste.units, 2);
  assert.equal(borste.netSales, 300);
  assert.deepEqual(borste.lines, { 2: 1 });
  assert.equal(borste.variantTitle, null); // "Default Title" blir null
});

test("marknaden tas ur leveransadressen, annars fakturans", () => {
  assert.equal(data.marketsByDay["2026-09-10"].SE.orders, 1);
  assert.equal(data.marketsByDay["2026-09-10"].SE.totalSales, 449);
  assert.equal(data.marketsByDay["2026-09-11"].NO.orders, 1);
  assert.deepEqual(data.marketsByDay["2026-09-12"], {});
});

test("timmen är butikens klocka och summerar till dagen", () => {
  const timmar = data.hoursByDay["2026-09-10"];
  assert.deepEqual(Object.keys(timmar), ["12"]);
  assert.equal(timmar["12"][""].totalSales, dag("2026-09-10").totalSales);
  assert.equal(timmar["12"].SE.orders, 1);
});

test("kundordern bär netto och totalpris efter återbetalning", () => {
  const a = data.kundOrdrar.find((o) => o.orderId === "A");
  assert.equal(a.netto, 400);
  assert.equal(a.totalPrice, 449);
  assert.equal(a.customerGid, "gid://shopify/Customer/7");
  assert.equal(a.lines.length, 2);
  assert.equal(data.kundOrdrar.length, 2); // A och D
});

test("utan landsbehörighet: ingen uppdelning, men timmarna finns", () => {
  const utan = parseOrderLines(jsonl, "2026-09-10", "2026-09-12", TZ, false, true);
  assert.equal(utan.marketsByDay, null);
  assert.equal(utan.hoursByDay["2026-09-10"]["12"][""].orders, 1);
});

test("utan avgiftsfältet är avgiften okänd (null), inte noll", () => {
  const utan = parseOrderLines(jsonl, "2026-09-10", "2026-09-12", TZ, true, false);
  assert.equal(utan.sales[0].fees, null);
});

test("summeraAvgifter läser lista, nodes och edges, och hoppar över misslyckade", () => {
  const t = (status, n) => ({ status, fees: [{ amount: { amount: String(n) } }] });
  assert.equal(summeraAvgifter([t("SUCCESS", 2), t("ERROR", 5)]), 2);
  assert.equal(summeraAvgifter({ nodes: [t("SUCCESS", 3)] }), 3);
  assert.equal(summeraAvgifter({ edges: [{ node: t("SUCCESS", 4) }] }), 4);
  assert.equal(summeraAvgifter(null), 0);
});

test("mergeProductRows håller isär marknader men slår ihop dagar", () => {
  const rad = (market, units) => ({ productGid: "P", variantGid: "V", title: "T", variantTitle: null, units, netSales: units * 10, unitCost: null, market, lines: { 1: units } });
  const ut = mergeProductRows([rad("SE", 1), rad("SE", 2), rad("NO", 5)]);
  assert.equal(ut.length, 2);
  const se = ut.find((r) => r.market === "SE");
  assert.equal(se.units, 3);
  assert.deepEqual(se.lines, { 1: 3 });
});
