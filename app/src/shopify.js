import { config } from './config.js';
import { loadCogs, costForLineItem } from './cogs.js';

const ORDERS_QUERY = `
query Orders($q: String!, $cursor: String) {
  orders(first: 100, query: $q, after: $cursor, sortKey: CREATED_AT) {
    pageInfo { hasNextPage endCursor }
    nodes {
      name
      createdAt
      currentSubtotalPriceSet { shopMoney { amount } }
      lineItems(first: 100) {
        nodes {
          quantity
          sku
          product { handle }
          discountedTotalSet { shopMoney { amount } }
        }
      }
      transactions { fees { amount { amount } } }
    }
  }
}`;

/**
 * Hämtar Shopify-utfall för perioden: intäkt, sålda-varors inpris (COGS),
 * betal-/transaktionsavgifter och antal ordrar.
 * Returnerar {available, revenue, cogs, fees, orders, unknownCogsItems, error?}.
 */
export async function getShopify(from, to) {
  const base = { available: false, revenue: 0, cogs: 0, fees: 0, orders: 0, unknownCogsItems: 0 };
  if (!config.shopify.enabled) return { ...base, reason: 'ej kopplad' };

  try {
    const cogs = await loadCogs();
    const url = `https://${config.shopify.store}/admin/api/${config.shopify.apiVersion}/graphql.json`;
    const q = `created_at:>=${from} created_at:<=${to} financial_status:paid`;
    let cursor = null, revenue = 0, cogsTotal = 0, fees = 0, orders = 0, unknown = 0;

    do {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': config.shopify.token },
        body: JSON.stringify({ query: ORDERS_QUERY, variables: { q, cursor } }),
      });
      if (!res.ok) throw new Error(`Shopify HTTP ${res.status}`);
      const json = await res.json();
      if (json.errors) throw new Error(json.errors.map(e => e.message).join('; '));
      const conn = json.data.orders;
      for (const o of conn.nodes) {
        orders++;
        revenue += Number(o.currentSubtotalPriceSet?.shopMoney?.amount || 0);
        for (const t of o.transactions || []) {
          for (const f of t.fees || []) fees += Number(f.amount?.amount || 0);
        }
        for (const li of o.lineItems.nodes) {
          const unit = costForLineItem(cogs, { sku: li.sku, handle: li.product?.handle });
          if (unit == null) { unknown += li.quantity; continue; }
          cogsTotal += unit * li.quantity;
        }
      }
      cursor = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
    } while (cursor);

    return { available: true, revenue, cogs: cogsTotal, fees, orders, unknownCogsItems: unknown };
  } catch (err) {
    return { ...base, error: String(err.message || err) };
  }
}
