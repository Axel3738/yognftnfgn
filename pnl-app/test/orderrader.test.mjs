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
  assert.equal(summeraAvgifter([t("SUCCESS", 2), t("ERROR", 5)]).avgift, 2);
  assert.equal(summeraAvgifter({ nodes: [t("SUCCESS", 3)] }).avgift, 3);
  assert.equal(summeraAvgifter({ edges: [{ node: t("SUCCESS", 4) }] }).avgift, 4);
  assert.deepEqual(summeraAvgifter(null), { avgift: 0, sp: false, gateway: "" });
});

/* ---- Betalväxeln: bara Shopify Payments täcker omsättningen ---- */

const spSale = (fee) => ({ status: "SUCCESS", kind: "SALE", gateway: "shopify_payments", fees: [{ amount: { amount: String(fee) } }] });
const paypalSale = { status: "SUCCESS", kind: "SALE", gateway: "paypal", fees: [] };

test("summeraAvgifter: Shopify Payments med avgift 12 ⇒ {12, sp}", () => {
  const b = summeraAvgifter([spSale(12)]);
  assert.equal(b.avgift, 12);
  assert.equal(b.sp, true);
  assert.equal(b.gateway, "shopify_payments");
});

test("summeraAvgifter: PayPal utan fees ⇒ {0, inte sp} — ingen avgift att läsa, inte noll avgift", () => {
  const b = summeraAvgifter([paypalSale]);
  assert.equal(b.avgift, 0);
  assert.equal(b.sp, false);
  assert.equal(b.gateway, "paypal");
});

test("summeraAvgifter: misslyckade transaktioner ignoreras, även en misslyckad Shopify Payments", () => {
  const nekad = { ...spSale(40), status: "FAILURE" };
  const b = summeraAvgifter([nekad, paypalSale]);
  assert.equal(b.avgift, 0);
  assert.equal(b.sp, false);
  assert.equal(b.gateway, "paypal");
});

test("summeraAvgifter: en reservation (AUTHORIZATION) täcker inte — avgiften kommer först vid capture", () => {
  const auth = { status: "SUCCESS", kind: "AUTHORIZATION", gateway: "shopify_payments", fees: [] };
  const b = summeraAvgifter([auth]);
  assert.equal(b.sp, false);
  assert.equal(b.gateway, "shopify_payments");
  const fangad = summeraAvgifter([auth, { ...spSale(8), kind: "CAPTURE" }]);
  assert.equal(fangad.sp, true);
  assert.equal(fangad.avgift, 8);
});

test("summeraAvgifter: fees bevisar Shopify Payments även om gatewaynamnet skulle skilja sig", () => {
  const b = summeraAvgifter([{ status: "SUCCESS", kind: "SALE", gateway: "Shopify Payments", fees: [{ amount: { amount: "5" } }] }]);
  assert.equal(b.sp, true);
});

test("dagen bär täckt omsättning och omsättning per betalväxel", () => {
  const sp = { ...orderD, id: "SP", transactions: [spSale(9)] };
  const pp = { ...orderD, id: "PP", totalPriceSet: pengar(200), subtotalPriceSet: pengar(200), transactions: [paypalSale] };
  const d = parseOrderLines([sp, pp], "2026-09-11", "2026-09-11", TZ, true, true);
  const s = d.sales[0];
  assert.equal(s.totalSales, 500);
  assert.equal(s.fees, 9);
  assert.equal(s.feesCoveredSales, 300);
  assert.deepEqual(s.gatewaySales, { shopify_payments: 300, paypal: 200 });
  /* Marknaden och timmen får samma uppdelning — samma `fyll`. */
  assert.equal(d.marketsByDay["2026-09-11"].NO.feesCoveredSales, 300);
  const timme = Object.values(d.hoursByDay["2026-09-11"])[0][""];
  assert.equal(timme.feesCoveredSales, 300);
});

test("utan avgiftsfältet är även den täckta omsättningen okänd (null)", () => {
  const utan = parseOrderLines(jsonl, "2026-09-10", "2026-09-12", TZ, true, false);
  assert.equal(utan.sales[0].feesCoveredSales, null);
  assert.equal(utan.sales[0].gatewaySales, null);
});

test("mergeProductRows håller isär marknader men slår ihop dagar", () => {
  const rad = (market, units) => ({ productGid: "P", variantGid: "V", title: "T", variantTitle: null, units, netSales: units * 10, unitCost: null, market, lines: { 1: units } });
  const ut = mergeProductRows([rad("SE", 1), rad("SE", 2), rad("NO", 5)]);
  assert.equal(ut.length, 2);
  const se = ut.find((r) => r.market === "SE");
  assert.equal(se.units, 3);
  assert.deepEqual(se.lines, { 1: 3 });
});

/* ---------------------------------------- intäkt efter ALLA rabatter per rad */

test("laggPaMix: en 10 %-kod på ordernivå ger netRevenue 10 % under netSales", () => {
  const order = {
    id: "R", createdAt: "2026-09-10T10:00:00Z", cancelledAt: null, test: false,
    totalPriceSet: pengar(807.3), subtotalPriceSet: pengar(807.3), totalDiscountsSet: pengar(89.7),
    totalShippingPriceSet: pengar(0), totalRefundedSet: pengar(0), transactions: [],
  };
  const rader = [
    // Radens discountedTotal (598) vet inget om koden; styckpriset efter alla rabatter gör det.
    { __parentId: "R", title: "Borste", variantTitle: null, quantity: 2, discountedTotalSet: pengar(598),
      discountedUnitPriceAfterAllDiscountsSet: pengar(269.1), product: { id: "P1" }, variant: { id: "V1" } },
    { __parentId: "R", title: "Borste", variantTitle: null, quantity: 1, discountedTotalSet: pengar(299),
      discountedUnitPriceAfterAllDiscountsSet: pengar(269.1), product: { id: "P1" }, variant: { id: "V1" } },
  ];
  const d = parseOrderLines([order, ...rader], "2026-09-10", "2026-09-10", TZ, true, true);
  const [p] = d.productsByDay["2026-09-10"];
  assert.equal(p.netSales, 897);
  assert.ok(Math.abs(p.netRevenue - 897 * 0.9) < 1e-9);
  assert.deepEqual(p.lines, { 1: 1, 2: 1 }); // formen orörd — rowCost räknar på den
  assert.ok(Math.abs(p.linesRevenue["2"] - 538.2) < 1e-9);
  assert.ok(Math.abs(p.linesRevenue["1"] - 269.1) < 1e-9);
  assert.deepEqual(p.linesPriced, { 1: 1, 2: 1 });
  assert.equal("utanPris" in p, false); // hjälpflaggan följer inte med ut
  // Marknadsdelen bär samma fält.
  assert.ok(Math.abs(d.marketsByDay["2026-09-10"][""].products[0].netRevenue - 807.3) < 1e-9);
});

test("utan fältet (äldre fixtur/export) finns ingen netRevenue — läsarna faller tillbaka på netSales", () => {
  const borste = data.productsByDay["2026-09-10"].find((p) => p.variantGid === "V1");
  assert.equal(borste.netRevenue, undefined);
  assert.equal(borste.linesRevenue, undefined);
});

test("mergeProductRows: gammal dag utan pris + ny dag med pris — linesPriced räknar bara den nya", () => {
  const gammal = { productGid: "P", variantGid: "V", title: "T", variantTitle: null, units: 6, netSales: 1794, unitCost: null, lines: { 2: 3 } };
  const ny = { ...gammal, units: 4, netSales: 1196, lines: { 2: 2 }, netRevenue: 998, linesRevenue: { 2: 998 }, linesPriced: { 2: 2 } };
  const [ut] = mergeProductRows([ny, gammal]);
  assert.deepEqual(ut.lines, { 2: 5 });
  assert.deepEqual(ut.linesRevenue, { 2: 998 });
  assert.deepEqual(ut.linesPriced, { 2: 2 });
  assert.equal(ut.netRevenue, undefined); // inte hel — tabellen tar netSales
  assert.deepEqual(ny.linesRevenue, { 2: 998 }); // källraden orörd
});
