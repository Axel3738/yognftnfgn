import { getShopify } from './shopify.js';
import { getMeta } from './meta.js';
import { getGoogleAds } from './googleads.js';

const round = n => Math.round(n * 100) / 100;

/**
 * Bygger en period-P&L: intäkt − COGS − avgifter − annonskostnad = nettovinst.
 * Alla källor hämtas parallellt; en källa som inte är kopplad räknas som 0
 * men flaggas i `sources`.
 */
export async function buildPnl(from, to) {
  const [shopify, meta, google] = await Promise.all([
    getShopify(from, to),
    getMeta(from, to),
    getGoogleAds(from, to),
  ]);

  const revenue = shopify.revenue || 0;
  const cogs = shopify.cogs || 0;
  const fees = shopify.fees || 0;
  const adSpend = (meta.spend || 0) + (google.spend || 0);
  const totalCost = cogs + fees + adSpend;
  const netProfit = revenue - totalCost;

  return {
    period: { from, to },
    revenue: round(revenue),
    costs: {
      cogs: round(cogs),
      fees: round(fees),
      meta: round(meta.spend || 0),
      google: round(google.spend || 0),
      adSpendTotal: round(adSpend),
      total: round(totalCost),
    },
    netProfit: round(netProfit),
    netMarginPct: revenue ? round((netProfit / revenue) * 100) : null,
    mer: adSpend ? round(revenue / adSpend) : null, // Marketing Efficiency Ratio
    orders: shopify.orders || 0,
    aov: shopify.orders ? round(revenue / shopify.orders) : null,
    sources: {
      shopify: { available: shopify.available, reason: shopify.reason, error: shopify.error, unknownCogsItems: shopify.unknownCogsItems || 0 },
      meta: { available: meta.available, reason: meta.reason, error: meta.error },
      google: { available: google.available, reason: google.reason, error: google.error },
    },
  };
}
