// Deterministisk demo-data så dashboarden kan förhandsvisas innan källorna
// är kopplade. Samma datum → samma siffror (seedad PRNG, ingen slump mellan körningar).

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = s => [...s].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7);

/**
 * Genererar ett demo-utfall per dag i intervallet. Nivåerna är valda för att
 * likna en liten men växande grillbutik: AOV ~650 kr, COGS ~31 %, Meta ~22 %,
 * Google ~6 %, returer ~1.5 %.
 */
export function demoSources(days) {
  const shopifyDaily = {}, metaDaily = {}, googleDaily = {};
  let revenue = 0, cogs = 0, fees = 0, refunds = 0, orders = 0, metaSpend = 0, googleSpend = 0;

  for (const d of days) {
    const rnd = mulberry32(hash(d));
    const dow = new Date(d + 'T12:00:00Z').getUTCDay(); // 0=sön
    const weekend = dow === 0 || dow === 6 ? 1.35 : 1;
    const rev = Math.round((3200 + rnd() * 5200) * weekend);
    const ord = Math.max(1, Math.round(rev / (560 + rnd() * 180)));
    const dayCogs = Math.round(rev * (0.29 + rnd() * 0.05));
    const dayFees = Math.round(rev * 0.029 + ord * 3);
    const dayRefunds = rnd() < 0.25 ? Math.round(rev * 0.06 * rnd()) : 0;
    const dayMeta = Math.round(rev * (0.19 + rnd() * 0.07));
    const dayGoogle = Math.round(rev * (0.04 + rnd() * 0.04));

    shopifyDaily[d] = { revenue: rev, cogs: dayCogs, fees: dayFees, refunds: dayRefunds, orders: ord };
    metaDaily[d] = dayMeta;
    googleDaily[d] = dayGoogle;

    revenue += rev; cogs += dayCogs; fees += dayFees; refunds += dayRefunds; orders += ord;
    metaSpend += dayMeta; googleSpend += dayGoogle;
  }

  return {
    shopify: { available: true, demo: true, revenue, cogs, fees, refunds, orders, daily: shopifyDaily, unknownCogsItems: 0 },
    meta: { available: true, demo: true, spend: metaSpend, impressions: Math.round(metaSpend * 90), clicks: Math.round(metaSpend * 1.4), daily: metaDaily },
    google: { available: true, demo: true, spend: googleSpend, daily: googleDaily },
  };
}
