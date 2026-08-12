// Tunn wrapper runt Meta Marketing API (Graph API). Styr Ads Manager härifrån:
// ladda upp bilder, skapa kampanj/adset/annons (PAUSED), pausa/återuppta, hämta insights.
// Kräver env: META_ACCESS_TOKEN — system user-token med ads_management + ads_read.
// För push av annonser krävs även META_PAGE_ID (sidan annonsen postas som).

const VERSION = process.env.META_API_VERSION || 'v23.0';
const API = `https://graph.facebook.com/${VERSION}`;

// Kontona från README. Matstrumpor.se är UNSETTLED och medvetet inte med.
export const ACCOUNTS = {
  snarklos:    { id: 'act_1346450049878358', label: 'SnarkLös' },
  magiborsten: { id: 'act_1867947880635861', label: 'MagiBorsten' },
};

// Accepterar prefix: "magi" → magiborsten, "snark" → snarklos.
export function resolveAccount(name) {
  const key = (name || process.env.META_ACCOUNT || 'snarklos').toLowerCase().replace(/[^a-z]/g, '');
  const found = Object.entries(ACCOUNTS).find(([k]) => k.startsWith(key));
  if (!found) throw new Error(`Okänt konto "${name}". Välj: ${Object.keys(ACCOUNTS).join(', ')}`);
  return { key: found[0], ...found[1] };
}

function token() {
  const t = process.env.META_ACCESS_TOKEN;
  if (!t) throw new Error('Saknar META_ACCESS_TOKEN i miljön. Se pipeline/README.md → "Koppla Meta".');
  return t;
}

export async function api(path, { method = 'GET', params = {}, body = null } = {}) {
  const url = new URL(`${API}/${path}`);
  url.searchParams.set('access_token', token());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  const init = { method: body ? 'POST' : method };
  if (body) {
    init.headers = { 'content-type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(url, init);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    const hint = e.error_user_msg ? ` — ${e.error_user_msg}` : '';
    throw new Error(`Meta API ${res.status}: ${e.message || 'okänt fel'}${hint}`);
  }
  return json;
}

export const verify = () => api('me', { params: { fields: 'id,name' } });

export const adAccount = (acct) =>
  api(acct.id, { params: { fields: 'name,account_status,currency,amount_spent' } });

export const listCampaigns = (acct) =>
  api(`${acct.id}/campaigns`, { params: { fields: 'name,status,objective,daily_budget,created_time', limit: 50 } });

export const listAdSets = (acct, campaignId = null) =>
  api(`${campaignId || acct.id}/adsets`, { params: { fields: 'name,status,campaign_id,daily_budget,optimization_goal', limit: 50 } });

export const listAds = (acct, adsetId = null) =>
  api(`${adsetId || acct.id}/ads`, { params: { fields: 'name,status,adset_id,effective_status', limit: 100 } });

// Laddar upp en bild till kontots bildbibliotek, returnerar image_hash.
export async function uploadImage(acct, buffer) {
  const json = await api(`${acct.id}/adimages`, { body: { bytes: buffer.toString('base64') } });
  const img = Object.values(json.images || {})[0];
  if (!img?.hash) throw new Error('Ingen image hash i svaret från adimages.');
  return img.hash;
}

export const createCampaign = (acct, { name, objective = 'OUTCOME_SALES' }) =>
  api(`${acct.id}/campaigns`, {
    body: { name, objective, status: 'PAUSED', special_ad_categories: [] },
  });

export const createAdSet = (acct, { name, campaignId, dailyBudget, countries = ['SE'], optimizationGoal = 'LINK_CLICKS' }) =>
  api(`${acct.id}/adsets`, {
    body: {
      name, campaign_id: campaignId, status: 'PAUSED',
      daily_budget: dailyBudget, billing_event: 'IMPRESSIONS',
      optimization_goal: optimizationGoal, bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      targeting: { geo_locations: { countries } },
    },
  });

export function createCreative(acct, { name, imageHash, link, message, headline, cta = 'SHOP_NOW' }) {
  const pageId = process.env.META_PAGE_ID;
  if (!pageId) throw new Error('Saknar META_PAGE_ID i miljön (Facebook-sidan annonsen postas som).');
  const spec = {
    page_id: pageId,
    link_data: {
      image_hash: imageHash, link, message, name: headline,
      call_to_action: { type: cta, value: { link } },
    },
  };
  if (process.env.META_IG_ID) spec.instagram_actor_id = process.env.META_IG_ID;
  return api(`${acct.id}/adcreatives`, { body: { name, object_story_spec: spec } });
}

export const createAd = (acct, { name, adsetId, creativeId }) =>
  api(`${acct.id}/ads`, {
    body: { name, adset_id: adsetId, creative: { creative_id: creativeId }, status: 'PAUSED' },
  });

export const setStatus = (id, status) => api(id, { body: { status } });

export const insights = (acct, { level = 'ad', datePreset = 'last_7d' } = {}) =>
  api(`${acct.id}/insights`, {
    params: {
      level, date_preset: datePreset, limit: 200,
      fields: 'ad_name,adset_name,campaign_name,spend,impressions,clicks,ctr,cpc,actions,purchase_roas',
    },
  });
