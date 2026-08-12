// Meta Ads → spend och resultat per annons och dag.
//
// Kopplingen till Notion går via annonsnamnet: annonserna heter samma sak i
// ad-kontot som tasken heter i Notion ("049", "128 b2", "Enginecover_PD_23_H1").
// Det är inte en gissning — det är hur teamet faktiskt döper dem.
//
// Hämtas per DAG (time_increment=1), inte som en klumpsumma. Det är dagsdatan
// som gör det möjligt att visa "så här mycket har du tjänat hittills i månaden"
// mitt i en pågående månad i stället för först när den är slut.

const API = 'https://graph.facebook.com';
const VERSION = 'v21.0';

async function graph(path, params, token, attempt = 0) {
  const qs = new URLSearchParams({ ...params, access_token: token });
  const res = await fetch(`${API}/${VERSION}/${path}?${qs}`);
  const json = await res.json();

  if (json.error) {
    const code = json.error.code;
    // 4/17/32 = takt-/kvotgräns, 1/2 = tillfälligt fel. Backa av och försök igen.
    const retryable = [1, 2, 4, 17, 32, 613].includes(code);
    if (retryable && attempt < 4) {
      await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt)));
      return graph(path, params, token, attempt + 1);
    }
    throw new Error(`Meta ${code}: ${json.error.message}`);
  }
  return json;
}

async function paged(path, params, token, onPage) {
  let url = null;
  let first = true;
  let guard = 0;
  while ((first || url) && guard++ < 200) {
    const json = first
      ? await graph(path, params, token)
      : await (await fetch(url)).json();
    first = false;
    if (json.error) throw new Error(`Meta ${json.error.code}: ${json.error.message}`);
    onPage(json.data || []);
    url = json.paging?.next || null;
  }
}

/** Alla ad-konton token:en når. */
export async function fetchAccounts(token) {
  const out = [];
  await paged('me/adaccounts', {
    fields: 'account_id,name,currency,account_status',
    limit: '100',
  }, token, rows => out.push(...rows));
  return out;
}

/** Plockar ut ett actions-värde ur Metas listformat. */
function actionValue(list, types) {
  if (!Array.isArray(list)) return 0;
  for (const type of types) {
    const hit = list.find(a => a.action_type === type);
    if (hit) return Number(hit.value) || 0;
  }
  return 0;
}

const PURCHASE = ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase'];

/**
 * Dagliga siffror per annons för ett konto.
 * Returnerar en rad per (annons, dag) — grunden för både ersättning och
 * vinnaranalys.
 */
export async function fetchAdDays({ token, accountId, since, until }) {
  const rows = [];
  await paged(`act_${accountId}/insights`, {
    level: 'ad',
    time_increment: '1',
    fields: 'ad_id,ad_name,campaign_name,adset_name,spend,impressions,clicks,actions,action_values',
    time_range: JSON.stringify({ since, until }),
    limit: '500',
  }, token, page => {
    for (const r of page) {
      const purchases = actionValue(r.actions, PURCHASE);
      const revenue = actionValue(r.action_values, PURCHASE);
      rows.push({
        date: r.date_start,
        accountId,
        adId: r.ad_id,
        adName: r.ad_name,
        campaign: r.campaign_name || null,
        adset: r.adset_name || null,
        spend: Number(r.spend) || 0,
        impressions: Number(r.impressions) || 0,
        clicks: Number(r.clicks) || 0,
        purchases,
        revenue,
      });
    }
  });
  return rows;
}

/**
 * Normaliserar ett annonsnamn för matchning.
 *
 * Namnen skrivs för hand på båda hållen, så små skillnader är regel snarare än
 * undantag: "133 to  norwegian" med dubbelt mellanslag, "128 B2" mot "128 b2".
 * Utan normalisering tappar man matchningar som uppenbart hör ihop — och varje
 * tappad matchning är pengar som inte tillskrivs någon.
 */
export function normaliseAdName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[_–—]/g, '-')
    .trim();
}

/** Hämtar allt för de konton som anges i config. */
export async function fetchAllAccounts({ token, accounts, since, until, onProgress = () => {} }) {
  const all = [];
  for (const acc of accounts) {
    onProgress(`Meta: hämtar ${acc.name || acc.id} …`);
    const rows = await fetchAdDays({ token, accountId: acc.id, since, until });
    onProgress(`  ${rows.length} annons-dagar, ${new Set(rows.map(r => r.adName)).size} unika annonser`);
    all.push(...rows.map(r => ({ ...r, accountName: acc.name || acc.id, brand: acc.brand || null })));
  }
  return all;
}
