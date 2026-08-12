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
import { buildMatcher, PAYABLE_TIERS } from './match.mjs';

/** ISO-datum → 'YYYY-MM'. */
const monthOf = date => String(date).slice(0, 7);

/**
 * @param metaRows  rader från Meta: {date, adName, spend, purchases, revenue, ...}
 * @param tasks     Notion-tasks (behöver .title och .editor)
 * @param rate      andel av spend, t.ex. 0.004 för 0,4%
 */
/**
 * Handpålagda ägare: regler som en människa skrivit för annonser Notion inte
 * kan knyta till någon. Första träffen vinner, '*' matchar allt som blir över.
 * Skilt från namnmatchningen på ett sätt som syns i panelen — en uppgift någon
 * påstått är inte samma sak som en koppling systemet kunnat bevisa.
 */
function manualOwnerOf(adName, rules, adStarted) {
  const name = String(adName || '').toLowerCase();
  for (const r of rules) {
    if (!r || !r.editor) continue;
    // `until` binder regeln till det man faktiskt visste när man skrev den.
    //
    // Utan det blir ett "resten är mina" en stående order som betalar samma
    // person för varenda framtida annons som råkar sakna Notion-task — även
    // när det är någon annan som gjort den. Regeln gäller därför bara
    // annonser som redan fanns den dagen påståendet gjordes; nya annonser
    // måste förtjäna sin koppling på nytt.
    if (r.until && (!adStarted || adStarted > r.until)) continue;
    if (r.match === '*' || name.includes(String(r.match).toLowerCase())) {
      return { editor: r.editor, tier: 'manual', note: r.note || null };
    }
  }
  return null;
}

/** Första dagen varje annons syns i Meta-datan. */
function firstSeenByAd(metaRows) {
  const first = new Map();
  for (const r of metaRows) {
    const key = normaliseAdName(r.adName);
    const prev = first.get(key);
    if (!prev || r.date < prev) first.set(key, r.date);
  }
  return first;
}

export function computePayout({ metaRows, tasks, rate, editors = [], manualOwners = null }) {
  const manualRules = manualOwners?.rules || [];
  const firstSeen = manualRules.length ? firstSeenByAd(metaRows) : new Map();
  // Namnen är "samma" för ögat men inte för en sträng-jämförelse: Meta bär
  // marknadsprefix och hook-suffix (NO 101 H1) där Notion bara har numret.
  // Exakt matchning ensam träffar 7% av spenden; nivåerna i match.mjs träffar
  // knappt hälften. Bara nivåer med känd säkerhet får bli pengar.
  const matcher = buildMatcher(tasks);
  const ownerOf = adName => {
    const hit = matcher.match(adName);
    if (hit && hit.task && PAYABLE_TIERS.has(hit.tier) && hit.task.editor) {
      return { editor: hit.task.editor, taskId: hit.task.id, url: hit.task.url, tier: hit.tier };
    }
    // Notion vet inte — men Axel gjorde det, och sa det.
    return manualOwnerOf(adName, manualRules, firstSeen.get(normaliseAdName(adName)));
  };

  const nameOf = id => editors.find(e => e.id === id)?.name || id;

  const perEditor = new Map();
  const perAd = new Map();
  const months = new Set();
  let matchedSpend = 0, unmatchedSpend = 0, manualSpend = 0;
  const unmatchedAds = new Map();

  for (const r of metaRows) {
    const key = normaliseAdName(r.adName);
    const hit = ownerOf(r.adName);
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
      const u = unmatchedAds.get(key) || {
        adName: r.adName, spend: 0, purchases: 0, revenue: 0,
        account: r.accountName || null, campaign: r.campaign || null,
        firstDate: r.date, lastDate: r.date,
      };
      u.spend += r.spend;
      u.purchases += r.purchases;
      u.revenue += r.revenue;
      if (r.date < u.firstDate) u.firstDate = r.date;
      if (r.date > u.lastDate) u.lastDate = r.date;
      unmatchedAds.set(key, u);
      continue;
    }
    matchedSpend += r.spend;
    if (hit.tier === 'manual') manualSpend += r.spend;

    const e = perEditor.get(hit.editor) || { id: hit.editor, name: nameOf(hit.editor), byMonth: {}, spend: 0, manual: 0, ads: new Set() };
    if (hit.tier === 'manual') e.manual += r.spend;
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
    // Hur mycket av summan som vilar på ett påstående i stället för på en
    // koppling systemet kunnat bevisa. Ska gå att se, inte gömmas i totalen.
    manualSpend: Math.round(e.manual || 0),
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
      manualSpend: Math.round(manualSpend),
      statedBy: manualOwners?.statedBy || null,
      statedAt: manualOwners?.statedAt || null,
      unmatchedSpend: Math.round(unmatchedSpend),
      share: totalSpend > 0 ? matchedSpend / totalSpend : null,
      // Vilka annonser pengarna ligger i. Namnet + kontot räcker för att en
      // människa ska kunna säga "den där gjorde X" — vilket är enda sättet att
      // få dem betalda, eftersom panelen aldrig gissar.
      topUnmatched: [...unmatchedAds.values()]
        .sort((a, b) => b.spend - a.spend).slice(0, 25)
        .map(u => ({
          adName: u.adName,
          spend: Math.round(u.spend),
          payout: Math.round(u.spend * rate * 100) / 100,
          purchases: u.purchases,
          roas: u.spend > 0 ? Math.round((u.revenue / u.spend) * 100) / 100 : null,
          account: u.account,
          campaign: u.campaign,
          firstDate: u.firstDate,
          lastDate: u.lastDate,
        })),
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
