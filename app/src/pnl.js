import { getShopify } from './shopify.js';
import { getMeta } from './meta.js';
import { getGoogleAds } from './googleads.js';
import { loadSettings } from './settings.js';
import { demoSources } from './demo.js';
import { loadCogs } from './cogs.js';

const round = n => Math.round(n * 100) / 100;

// Mastern står för ~99 % av annonseringen → intäktsestimatet räknar med
// Masterns pris och inpris tills riktig Shopify-data finns.
const EST_AOV = 999;
const EST_HANDLE = 'elektrisk-grillborste';

/**
 * Estimerar Shopify-utfall från Meta-snapshotens dagliga spend × ROAS
 * (attribuerad intäkt). Används ENBART när Shopify inte är kopplad och
 * flaggas `estimated:true` hela vägen ut i UI:t.
 */
async function estimateShopifyFromMeta(meta) {
  const cogsData = await loadCogs();
  const unitCost = cogsData.byHandle.get(EST_HANDLE) ?? 231;
  const daily = {};
  let revenue = 0, orders = 0, cogs = 0;
  for (const [d, spend] of Object.entries(meta.daily || {})) {
    const roas = meta.roasDaily?.[d] ?? 0;
    const rev = spend * roas;
    const ord = Math.round(rev / EST_AOV);
    const dayCogs = ord * unitCost;
    daily[d] = { revenue: rev, cogs: dayCogs, fees: 0, refunds: 0, orders: ord };
    revenue += rev; orders += ord; cogs += dayCogs;
  }
  return {
    available: true, estimated: true, revenue, cogs, fees: 0, refunds: 0, orders, daily,
    unknownCogsItems: 0,
    reason: `estimat: Meta-spend × ROAS (AOV ${EST_AOV} kr, inpris ${round(unitCost)} kr)`,
  };
}

/** Alla datum (YYYY-MM-DD) i intervallet, inklusive ändarna. */
function enumerateDays(from, to) {
  const days = [];
  const end = new Date(to + 'T00:00:00Z');
  for (let d = new Date(from + 'T00:00:00Z'); d <= end; d = new Date(d.getTime() + 864e5)) {
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

/**
 * Bygger en komplett period-P&L med ALLA kostnadskategorier:
 *   COGS · betalavgifter · returer · Meta · Google · Shopify-plan ·
 *   fasta kostnader (appar/verktyg m.m.) · per-order-kostnader (emballage).
 * `demo=true` ger deterministisk exempeldata i stället för live-källor.
 */
export async function buildPnl(from, to, { demo = false } = {}) {
  const days = enumerateDays(from, to);
  const settings = await loadSettings();

  const sources = demo
    ? demoSources(days)
    : Object.fromEntries(
        (await Promise.all([
          getShopify(from, to).then(v => ['shopify', v]),
          getMeta(from, to).then(v => ['meta', v]),
          getGoogleAds(from, to).then(v => ['google', v]),
        ])),
      );
  let { shopify, meta, google } = sources;

  // Ingen Shopify men riktig Meta-spend med ROAS → estimera intäktssidan
  // (tydligt flaggat; ersätts automatiskt när butiken kopplas).
  if (!demo && !shopify.available && meta.available && meta.roasDaily) {
    shopify = await estimateShopifyFromMeta(meta);
  }

  const revenue = shopify.revenue || 0;
  const orders = shopify.orders || 0;

  // Betalavgifter: riktiga API-avgifter om de finns, annars uppskattning
  // enligt inställd procentsats + fast avgift per order.
  const apiFees = shopify.fees || 0;
  const useApi = settings.payment.useApiFeesIfAvailable && apiFees > 0;
  const paymentFees = useApi
    ? apiFees
    : revenue * (settings.payment.pct / 100) + orders * settings.payment.fixedPerOrder;

  // Fasta kostnader prorateras per dag (månadsbelopp / 30).
  const fixedTools = settings.fixedMonthly.reduce((a, x) => a + x.amount, 0);
  const planCost = (settings.shopifyPlanMonthly / 30) * days.length;
  const toolsCost = (fixedTools / 30) * days.length;
  const perOrderUnit = settings.perOrder.reduce((a, x) => a + x.amount, 0);
  const perOrderCost = perOrderUnit * orders;

  const cogs = shopify.cogs || 0;
  const refunds = shopify.refunds || 0;
  const metaSpend = meta.spend || 0;
  const googleSpend = google.spend || 0;
  const adSpend = metaSpend + googleSpend;

  // Donut-underlag: varje kostnadskategori + vinsten som "resten av intäkten".
  const breakdown = [
    { key: 'cogs', label: 'COGS (inpris varor)', amount: cogs },
    { key: 'meta', label: 'Meta Ads', amount: metaSpend },
    { key: 'google', label: 'Google Ads', amount: googleSpend },
    { key: 'fees', label: useApi ? 'Betalavgifter' : 'Betalavgifter (uppskattade)', amount: paymentFees, estimated: !useApi },
    { key: 'refunds', label: 'Returer & refunds', amount: refunds },
    { key: 'plan', label: 'Shopify-plan', amount: planCost },
    { key: 'tools', label: 'Appar & verktyg', amount: toolsCost, items: settings.fixedMonthly },
    { key: 'perorder', label: 'Emballage & pack', amount: perOrderCost, items: settings.perOrder },
  ].map(x => ({ ...x, amount: round(x.amount) }));

  const totalCost = breakdown.reduce((a, x) => a + x.amount, 0);
  const netProfit = round(revenue - totalCost);

  // Daglig serie för grafen: intäkt, total kostnad, vinst.
  const fixedPerDay = (settings.shopifyPlanMonthly + fixedTools) / 30;
  const daily = days.map(d => {
    const s = shopify.daily?.[d] || { revenue: 0, cogs: 0, fees: 0, refunds: 0, orders: 0 };
    const dayFees = useApi ? s.fees : s.revenue * (settings.payment.pct / 100) + s.orders * settings.payment.fixedPerOrder;
    const cost = s.cogs + dayFees + s.refunds + (meta.daily?.[d] || 0) + (google.daily?.[d] || 0)
      + fixedPerDay + s.orders * perOrderUnit;
    return { date: d, revenue: round(s.revenue), cost: round(cost), profit: round(s.revenue - cost), orders: s.orders };
  });

  return {
    period: { from, to, days: days.length },
    demo,
    revenue: round(revenue),
    orders,
    aov: orders ? round(revenue / orders) : null,
    breakdown,
    totalCost: round(totalCost),
    netProfit,
    netMarginPct: revenue ? round((netProfit / revenue) * 100) : null,
    mer: adSpend ? round(revenue / adSpend) : null,
    adSpend: round(adSpend),
    daily,
    settings,
    revenueEstimated: Boolean(shopify.estimated),
    sources: {
      shopify: { available: shopify.available, demo: shopify.demo, estimated: shopify.estimated, reason: shopify.reason, error: shopify.error, unknownCogsItems: shopify.unknownCogsItems || 0 },
      meta: { available: meta.available, demo: meta.demo, snapshot: meta.snapshot, fetchedAt: meta.fetchedAt, reason: meta.reason, error: meta.error },
      google: { available: google.available, demo: google.demo, reason: google.reason, error: google.error },
    },
  };
}
