// Ersättning och vinnaranalys.
//
// Varje redigerare får 0,4% av adspenden på de annonser hen gjort. Eftersom
// Meta ger spend per DAG går det att svara på "hur mycket har jag tjänat
// hittills den här månaden" mitt i månaden — inte bara efteråt. Det är hela
// poängen: en siffra som rör sig varje dag är något att jobba mot.
//
// Kopplingen annons → redigerare går via namnet. Allt som inte matchar
// redovisas separat och skrivs ALDRIG ut på någon. Hellre en synlig lucka än
// en utbetalning byggd på en gissning.

import { normaliseAdName } from './ingest/meta.mjs';

/** ISO-datum → 'YYYY-MM'. */
const monthOf = date => String(date).slice(0, 7);

/**
 * @param metaRows  rader från Meta: {date, adName, spend, purchases, revenue, ...}
 * @param tasks     Notion-tasks (behöver .title och .editor)
 * @param rate      andel av spend, t.ex. 0.004 för 0,4%
 */
export function computePayout({ metaRows, tasks, rate, editors = [] }) {
  const owner = new Map();
  for (const t of tasks) {
    if (!t.editor) continue;
    const key = normaliseAdName(t.title);
    // Samma namn kan förekomma flera gånger; första ägaren vinner, men vi
    // noterar krockar så de går att reda ut i stället för att gömmas.
    if (!owner.has(key)) owner.set(key, { editor: t.editor, taskId: t.id, url: t.url });
  }

  const nameOf = id => editors.find(e => e.id === id)?.name || id;

  const perEditor = new Map();
  const perAd = new Map();
  const months = new Set();
  let matchedSpend = 0, unmatchedSpend = 0;
  const unmatchedAds = new Map();

  for (const r of metaRows) {
    const key = normaliseAdName(r.adName);
    const hit = owner.get(key);
    const month = monthOf(r.date);
    months.add(month);

    // Annonsnivå — oberoende av vem som gjort den.
    const ad = perAd.get(key) || {
      adName: r.adName, editor: hit?.editor || null, url: hit?.url || null,
      spend: 0, purchases: 0, revenue: 0, impressions: 0, clicks: 0,
      accounts: new Set(), campaigns: new Set(), firstDate: r.date, lastDate: r.date,
    };
    ad.spend += r.spend;
    ad.purchases += r.purchases;
    ad.revenue += r.revenue;
    ad.impressions += r.impressions;
    ad.clicks += r.clicks;
    if (r.accountName) ad.accounts.add(r.accountName);
    if (r.campaign) ad.campaigns.add(r.campaign);
    if (r.date < ad.firstDate) ad.firstDate = r.date;
    if (r.date > ad.lastDate) ad.lastDate = r.date;
    perAd.set(key, ad);

    if (!hit) {
      unmatchedSpend += r.spend;
      unmatchedAds.set(key, (unmatchedAds.get(key) || 0) + r.spend);
      continue;
    }
    matchedSpend += r.spend;

    const e = perEditor.get(hit.editor) || { id: hit.editor, name: nameOf(hit.editor), byMonth: {}, spend: 0, ads: new Set() };
    e.byMonth[month] = e.byMonth[month] || { spend: 0, purchases: 0, revenue: 0, days: new Set() };
    e.byMonth[month].spend += r.spend;
    e.byMonth[month].purchases += r.purchases;
    e.byMonth[month].revenue += r.revenue;
    e.byMonth[month].days.add(r.date);
    e.spend += r.spend;
    e.ads.add(key);
    perEditor.set(hit.editor, e);
  }

  const editorList = [...perEditor.values()].map(e => ({
    id: e.id,
    name: e.name,
    totalSpend: Math.round(e.spend),
    totalPayout: Math.round(e.spend * rate * 100) / 100,
    ads: e.ads.size,
    byMonth: Object.fromEntries(Object.entries(e.byMonth).map(([m, v]) => [m, {
      spend: Math.round(v.spend),
      payout: Math.round(v.spend * rate * 100) / 100,
      purchases: v.purchases,
      revenue: Math.round(v.revenue),
      activeDays: v.days.size,
    }])),
  })).sort((a, b) => b.totalPayout - a.totalPayout);

  const ads = [...perAd.values()].map(a => ({
    adName: a.adName,
    editor: a.editor,
    editorName: a.editor ? nameOf(a.editor) : null,
    url: a.url,
    spend: Math.round(a.spend),
    purchases: a.purchases,
    revenue: Math.round(a.revenue),
    // ROAS = intäkt per spenderad krona. Under 1 betyder att annonsen går back.
    roas: a.spend > 0 ? Math.round((a.revenue / a.spend) * 100) / 100 : null,
    cpa: a.purchases > 0 ? Math.round(a.spend / a.purchases) : null,
    impressions: a.impressions,
    clicks: a.clicks,
    account: [...a.accounts][0] || null,
    campaign: [...a.campaigns][0] || null,
    firstDate: a.firstDate,
    lastDate: a.lastDate,
  })).sort((a, b) => b.spend - a.spend);

  const totalSpend = matchedSpend + unmatchedSpend;
  return {
    rate,
    months: [...months].sort(),
    editors: editorList,
    ads,
    totals: {
      spend: Math.round(totalSpend),
      revenue: Math.round(ads.reduce((s, a) => s + a.revenue, 0)),
      purchases: ads.reduce((s, a) => s + a.purchases, 0),
      payout: Math.round(matchedSpend * rate * 100) / 100,
    },
    // Hur stor del av spenden som gick att knyta till en redigerare. Är den låg
    // är utbetalningssiffrorna för låga, och det ska synas — inte döljas.
    coverage: {
      matchedSpend: Math.round(matchedSpend),
      unmatchedSpend: Math.round(unmatchedSpend),
      share: totalSpend > 0 ? matchedSpend / totalSpend : null,
      topUnmatched: [...unmatchedAds.entries()]
        .sort((a, b) => b[1] - a[1]).slice(0, 20)
        .map(([name, spend]) => ({ adName: name, spend: Math.round(spend) })),
    },
  };
}

/**
 * Prognos för innevarande månad: så här mycket blir det om resten av månaden
 * går som de senaste dagarna. Tydligt märkt som prognos — ingen ska tro att
 * det är en utbetalning som är beslutad.
 */
export function projectMonth(monthStats, today, daysInMonth) {
  if (!monthStats || !monthStats.spend) return null;
  const dayOfMonth = Number(String(today).slice(8, 10));
  if (!dayOfMonth || dayOfMonth >= daysInMonth) return null;
  const factor = daysInMonth / dayOfMonth;
  return {
    spend: Math.round(monthStats.spend * factor),
    payout: Math.round(monthStats.payout * factor * 100) / 100,
    basedOnDays: dayOfMonth,
    ofDays: daysInMonth,
  };
}
