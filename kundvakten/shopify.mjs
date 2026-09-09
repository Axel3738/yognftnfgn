// Shopify-kopplingen för kundvakten. Läs-bara — den ändrar aldrig något i
// butiken, den räknar bara.
//
// Noll beroenden (inbyggda fetch). Token läses ur miljön, aldrig hårdkodad.

import { SHOPIFY, FONSTER } from './konfig.mjs';

export function harToken() {
  return Boolean(SHOPIFY.doman() && SHOPIFY.token());
}

export async function graphql(query, variables = {}) {
  const doman = SHOPIFY.doman();
  const token = SHOPIFY.token();
  if (!doman || !token) {
    throw new Error(
      'Saknar Shopify-koppling. Sätt SHOPIFY_SHOP_SE och SHOPIFY_TOKEN_SE ' +
        '(eller SHOPIFY_STORE_DOMAIN och SHOPIFY_ADMIN_TOKEN) i miljön.'
    );
  }
  const svar = await fetch(
    `https://${doman}/admin/api/${SHOPIFY.version()}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!svar.ok) {
    const kropp = (await svar.text()).slice(0, 300);
    if (svar.status === 401) {
      throw new Error(
        `Shopify svarade 401 — token är utgången eller fel. Skapa en ny ` +
          `Admin API-token i butikens custom app och lägg den som ` +
          `SHOPIFY_TOKEN_SE. (${kropp})`
      );
    }
    throw new Error(`Shopify svarade ${svar.status}: ${kropp}`);
  }
  const data = await svar.json();
  if (data.errors) {
    throw new Error(`GraphQL-fel: ${JSON.stringify(data.errors).slice(0, 400)}`);
  }
  return data.data;
}

const ORDERFALT = `
  name
  createdAt
  displayFinancialStatus
  displayFulfillmentStatus
  totalPriceSet { shopMoney { amount currencyCode } }
  disputes { id status initiatedAs }
  lineItems(first: 20) { edges { node { title quantity } } }
  fulfillments(first: 5) { createdAt displayStatus trackingInfo { number } }
`;

// Hämtar alla ordrar som har eller har haft en tvist. Paginerar tills slut —
// en trunkerad lista skulle göra hela raten fel.
export async function hamtaDisputes() {
  const alla = [];
  let after = null;
  for (let sida = 0; sida < 20; sida += 1) {
    const data = await graphql(
      `query kundvaktenTvister($after: String) {
        orders(first: 50, query: "chargeback_status:*", reverse: true, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges { node { ${ORDERFALT} } }
        }
      }`,
      { after }
    );
    const { edges, pageInfo } = data.orders;
    for (const { node } of edges) {
      const produkter = node.lineItems.edges.map((e) => e.node.title);
      const belopp = Number(node.totalPriceSet?.shopMoney?.amount) || 0;
      // En order kan bära flera tvister. Var och en är ett eget ärende.
      for (const d of node.disputes) {
        alla.push({
          id: d.id,
          status: d.status,
          typ: d.initiatedAs,
          order: node.name,
          orderSkapad: node.createdAt,
          belopp,
          valuta: node.totalPriceSet?.shopMoney?.currencyCode || 'SEK',
          produkter,
          // Order.disputes bär ingen svarsfrist. Den ligger på
          // ShopifyPaymentsDispute, som kräver read_shopify_payments — en
          // scope butikens token inte har (mätt 2026-09-09). Hellre tomt än
          // påhittat.
          svarsfrist: null,
        });
      }
    }
    if (!pageInfo.hasNextPage) break;
    after = pageInfo.endCursor;
  }
  return alla;
}

// Ordrar i fönstret, för förvarningarna. Bara det som behövs för att avgöra
// om en order riskerar att bli en tvist.
export async function hamtaOrdrar(dagar = FONSTER.jamforelse_dagar) {
  const fran = new Date(Date.now() - dagar * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const alla = [];
  let after = null;
  for (let sida = 0; sida < 60; sida += 1) {
    const data = await graphql(
      `query kundvaktenOrdrar($q: String!, $after: String) {
        orders(first: 100, query: $q, reverse: true, after: $after) {
          pageInfo { hasNextPage endCursor }
          edges { node { ${ORDERFALT} } }
        }
      }`,
      { q: `created_at:>=${fran}`, after }
    );
    const { edges, pageInfo } = data.orders;
    for (const { node } of edges) {
      const skickad = node.fulfillments.length > 0;
      alla.push({
        namn: node.name,
        skapad: node.createdAt,
        financialStatus: node.displayFinancialStatus,
        fulfillmentStatus: node.displayFulfillmentStatus,
        belopp: Number(node.totalPriceSet?.shopMoney?.amount) || 0,
        produkter: node.lineItems.edges.map((e) => e.node.title),
        skickad,
        harTracking: node.fulfillments.some((f) =>
          (f.trackingInfo || []).some((t) => t.number)
        ),
      });
    }
    if (!pageInfo.hasNextPage) break;
    after = pageInfo.endCursor;
  }
  return alla;
}

// Ordervolym per produkt — nämnaren i chargeback-raten. Utan den går det inte
// att säga något om rate alls, bara om antal.
export async function hamtaOrdervolym(dagar = FONSTER.jamforelse_dagar) {
  const data = await graphql(
    `query kundvaktenVolym($q: String!) {
      shopifyqlQuery(query: $q) {
        __typename
        ... on TableResponse {
          tableData {
            rowData
            columns { name dataType }
          }
        }
        parseErrors { code message }
      }
    }`,
    {
      q:
        `FROM sales SHOW orders, net_sales, average_order_value ` +
        `GROUP BY product_title ORDER BY orders DESC LIMIT 100 ` +
        `SINCE -${dagar}d UNTIL today`,
    }
  );
  const svar = data.shopifyqlQuery;
  if (svar?.parseErrors?.length) {
    throw new Error(
      `ShopifyQL-fel: ${svar.parseErrors.map((e) => e.message).join('; ')}`
    );
  }
  const rader = svar?.tableData?.rowData || [];
  return rader.map((r) => ({
    produkt: r[0],
    ordrar: Number(r[1]) || 0,
    netto: Number(r[2]) || 0,
    aov: Number(r[3]) || 0,
  }));
}

// Butikens totala antal ordrar i fönstret — nämnaren i den samlade raten.
export async function hamtaTotaltAntalOrdrar(dagar = FONSTER.jamforelse_dagar) {
  const data = await graphql(
    `query kundvaktenTotal($q: String!) {
      shopifyqlQuery(query: $q) {
        ... on TableResponse { tableData { rowData } }
        parseErrors { code message }
      }
    }`,
    { q: `FROM sales SHOW orders SINCE -${dagar}d UNTIL today` }
  );
  const rader = data.shopifyqlQuery?.tableData?.rowData || [];
  return Number(rader[0]?.[0]) || 0;
}
