#!/usr/bin/env node
// ads.mjs — Meta Ads Manager-uppladdare för ad-pipelinen.
//
//   node ads.mjs verify [--account MAGI]        koll: token, konto, behörigheter, pages
//   node ads.mjs campaigns [--account MAGI]     lista kampanjer på kontot
//   node ads.mjs upload <bild...> [--account MAGI]
//                                               ladda upp bilder till kontots bildbibliotek
//   node ads.mjs launch <bild> --name GRILL_mastern_..._v1 --page <PAGE_ID>
//         [--campaign MAGI_SALES_YYYYMMDD] [--link https://grillkliniken.se/...]
//         [--body "..."] [--title "..."] [--daily 20000]
//                                               skapa kampanj+adset+creative+ad (ALLT PAUSAT)
//
// Kräver META_ACCESS_TOKEN i miljön. Allt som skapas sätts PAUSED — publicering
// är alltid ett aktivt beslut i Ads Manager, aldrig en bieffekt av scriptet.

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;

// Konton från README — kontonamn ≠ brandnamn.
const ACCOUNTS = {
  MAGI:      { id: '1867947880635861', label: 'MagiBorsten' },
  SNARK:     { id: '1346450049878358', label: 'SnarkLös' },
  MATSTRUMP: { id: '730973156224390',  label: 'Matstrumpor.se (⚠️ UNSETTLED)' },
};

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
};
// allt efter kommandot som inte är en flagga eller ett flaggvärde
function getPositionals() {
  const out = [];
  for (let i = 1; i < args.length; i++) {
    if (args[i].startsWith('--')) { i++; continue; }
    out.push(args[i]);
  }
  return out;
}

const accountKey = (flag('account', 'MAGI') || 'MAGI').toUpperCase();
const account = ACCOUNTS[accountKey];
if (!account) die(`Okänt konto "${accountKey}". Välj: ${Object.keys(ACCOUNTS).join(', ')}`);
const ACT = `act_${account.id}`;

function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }

async function api(path, { method = 'GET', form } = {}) {
  const url = new URL(`${API}/${path}`);
  let body;
  if (method === 'GET') {
    url.searchParams.set('access_token', TOKEN);
  } else {
    body = form instanceof FormData ? form : new URLSearchParams(form);
    (body instanceof FormData ? body : body).append('access_token', TOKEN);
  }
  const res = await fetch(url, { method, body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    throw new Error(`${e.type || res.status}: ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
  return json;
}

const ACCOUNT_STATUS = { 1: '🟢 ACTIVE', 2: '🔴 DISABLED', 3: '🟡 UNSETTLED', 7: '🟡 PENDING_RISK_REVIEW', 9: '🟡 IN_GRACE_PERIOD', 101: '🔴 CLOSED' };

async function verify() {
  if (!TOKEN) die('META_ACCESS_TOKEN saknas i miljön.');
  console.log(`Verifierar mot ${account.label} (${ACT})\n`);

  const me = await api('me?fields=id,name');
  console.log(`✓ Token OK — inloggad som: ${me.name || me.id}`);

  try {
    const perms = await api('me/permissions');
    const granted = (perms.data || []).filter(p => p.status === 'granted').map(p => p.permission);
    const need = ['ads_management', 'ads_read'];
    for (const p of need) {
      console.log(`${granted.includes(p) ? '✓' : '✗'} behörighet: ${p}`);
    }
  } catch { console.log('· kunde inte läsa behörigheter (ok för systemanvändar-token)'); }

  const acct = await api(`${ACT}?fields=name,account_status,currency,timezone_name,amount_spent,spend_cap`);
  console.log(`\n✓ Konto: ${acct.name}`);
  console.log(`  status:   ${ACCOUNT_STATUS[acct.account_status] || acct.account_status}`);
  console.log(`  valuta:   ${acct.currency} · tidszon: ${acct.timezone_name}`);
  console.log(`  spenderat: ${(acct.amount_spent / 100).toFixed(2)} ${acct.currency}`);

  try {
    const pages = await api('me/accounts?fields=id,name');
    if (pages.data?.length) {
      console.log('\n✓ Pages (för --page vid launch):');
      for (const p of pages.data) console.log(`  ${p.id}  ${p.name}`);
    } else {
      console.log('\n· Inga pages på token — hämta page-id manuellt inför launch.');
    }
  } catch { console.log('\n· Kunde inte lista pages med denna token.'); }

  console.log('\nAllt klart — kontot går att ladda upp till. Nästa: `node ads.mjs upload <bild>`');
}

async function campaigns() {
  const res = await api(`${ACT}/campaigns?fields=name,status,objective,created_time&limit=50`);
  if (!res.data?.length) return console.log(`Inga kampanjer på ${account.label}.`);
  for (const c of res.data) console.log(`${c.status.padEnd(8)} ${c.name}  (${c.objective}, ${c.created_time.slice(0, 10)})`);
}

async function uploadImages(files) {
  if (!files.length) die('Ange minst en bildfil: node ads.mjs upload output/wave-01/*.png');
  const out = [];
  for (const f of files) {
    const form = new FormData();
    form.append('filename', new Blob([readFileSync(f)]), basename(f));
    const res = await api(`${ACT}/adimages`, { method: 'POST', form });
    const img = Object.values(res.images)[0];
    console.log(`✓ ${basename(f)} → hash ${img.hash}`);
    out.push({ file: f, hash: img.hash });
  }
  return out;
}

async function launch(files) {
  const file = files[0];
  const adName = flag('name');
  const pageId = flag('page');
  if (!file || !adName || !pageId) die('launch kräver: <bild> --name <ad-namn enligt naming-convention> --page <PAGE_ID>');

  const today = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const campaignName = flag('campaign', `${accountKey}_SALES_${today}`);
  const link = flag('link', 'https://grillkliniken.se');
  const daily = Number(flag('daily', '20000')); // öre → 200 kr/dag default

  const [{ hash }] = await uploadImages([file]);

  const existing = await api(`${ACT}/campaigns?fields=name&limit=100`);
  let campaignId = existing.data?.find(c => c.name === campaignName)?.id;
  if (!campaignId) {
    const c = await api(`${ACT}/campaigns`, { method: 'POST', form: {
      name: campaignName, objective: 'OUTCOME_SALES', status: 'PAUSED',
      special_ad_categories: '[]',
    }});
    campaignId = c.id;
    console.log(`✓ Kampanj skapad (PAUSED): ${campaignName} (${campaignId})`);
  } else {
    console.log(`· Återanvänder kampanj: ${campaignName} (${campaignId})`);
  }

  const adset = await api(`${ACT}/adsets`, { method: 'POST', form: {
    name: 'broad_advplus_purchase', campaign_id: campaignId, status: 'PAUSED',
    daily_budget: String(daily), billing_event: 'IMPRESSIONS',
    optimization_goal: 'OFFSITE_CONVERSIONS', bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    promoted_object: JSON.stringify({ custom_event_type: 'PURCHASE' }),
    targeting: JSON.stringify({ geo_locations: { countries: ['SE'] } }),
  }});
  console.log(`✓ Adset skapat (PAUSED): broad_advplus_purchase (${adset.id})`);

  const creative = await api(`${ACT}/adcreatives`, { method: 'POST', form: {
    name: `${adName}_creative`,
    object_story_spec: JSON.stringify({
      page_id: pageId,
      link_data: {
        image_hash: hash, link,
        message: flag('body', ''), name: flag('title', ''),
        call_to_action: { type: 'SHOP_NOW', value: { link } },
      },
    }),
  }});
  console.log(`✓ Creative skapad: ${creative.id}`);

  const ad = await api(`${ACT}/ads`, { method: 'POST', form: {
    name: adName, adset_id: adset.id, creative: JSON.stringify({ creative_id: creative.id }),
    status: 'PAUSED',
  }});
  console.log(`✓ Annons skapad (PAUSED): ${adName} (${ad.id})`);
  console.log('\nAllt ligger PAUSAT i Ads Manager — granska och slå på manuellt. Glöm inte trackern.');
}

try {
  const files = getPositionals();
  if (cmd === 'verify') await verify();
  else if (cmd === 'campaigns') await campaigns();
  else if (cmd === 'upload') await uploadImages(files);
  else if (cmd === 'launch') await launch(files);
  else die('Kommandon: verify · campaigns · upload <bild...> · launch <bild> --name ... --page ...');
} catch (e) {
  die(e.message);
}
