#!/usr/bin/env node
// uk-wave.mjs — Motorhöljet UK: ny kampanj på MagiBorsten-kontot.
//
//   node uk-wave.mjs <mapp-med-filer> [--dry]
//
// Gör: CBO-kampanj 1000 kr/dag (PAUSAD) → 3 adsets per koncept (SO/SP/PD, UK broad)
// → laddar upp png/mp4 → creatives med copy per koncept, ALLA enhancements OPT_OUT
// → annonser döpta efter filnamn. Kampanjen skapas PAUSAD — slå på manuellt.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
const ACT = 'act_1867947880635861'; // MagiBorsten

const PAGE_ID = '678639638662543';
const PIXEL_ID = '1554276343018184';
const LINK = 'https://beavershop.co.uk/products/marine-motor-cover-420d-universal-protection?_pos=1&_psq=420d&_psid=f0d02e612&_ss=e';
const CAMPAIGN_NAME = 'Motorhöljet UK';
const DAILY_BUDGET = '100000'; // öre = 1000 kr/dag (CBO på kampanjnivå)

// Copy per koncept (från copy_1.docx)
const CONCEPTS = {
  PD: {
    adset: 'Motorhölje UK - PD',
    message: 'Rain, sun and salt wear down your engine every day ⛵ This cover protects it from weather and rust. Universal fit — works with most outboards. Easy to put on and take off. Protect your engine today 👇',
    headline: 'Protect Your Engine — Year After Year',
    description: 'Heavy-duty 420D fabric against rain, sun and salt.',
  },
  SP: {
    adset: 'Motorhölje UK - SP',
    message: 'Boat owners are talking about this cover right now 🌊 Stays put even in storms and heavy wind. Keeps your engine completely dry and protected. Hundreds of happy customers already. See why for yourself 👇',
    headline: 'The Engine Cover Boat Owners Trust',
    description: 'Rated 5 out of 5 by verified customers.',
  },
  SO: {
    adset: 'Motorhölje UK - SO',
    message: 'Your engine is worth too much to leave unprotected ⚓ Shield it from rain, sun, salt and rust. Universal fit, easy to put on. On sale right now. Order before stock runs out 👇',
    headline: 'Protect Your Engine — Before Winter',
    description: 'Limited-time sale price — now.',
  },
};

// "Inga jävla bs meta tillägg": alla standard enhancements av.
const NO_ENHANCEMENTS = JSON.stringify({
  creative_features_spec: Object.fromEntries(
    ['standard_enhancements', 'image_touchups', 'image_brightness_and_contrast', 'enhance_cta',
     'text_generation', 'text_optimizations', 'inline_comment', 'image_templates',
     'media_order', 'product_extensions', 'add_text_overlay', 'site_extensions',
     'video_auto_crop', 'image_uncrop', 'image_background_gen', 'adapt_to_placement',
     'media_type_automation', 'pac_relaxation'].map(f => [f, { enroll_status: 'OPT_OUT' }])
  ),
});

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const dir = args.find(a => !a.startsWith('--'));
if (!TOKEN) die('META_ACCESS_TOKEN saknas.');
if (!dir) die('Ange mapp: node uk-wave.mjs <mapp> [--dry]');

function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }

async function api(path, { method = 'GET', form } = {}) {
  const url = new URL(`${API}/${path}`);
  let body;
  if (method === 'GET') url.searchParams.set('access_token', TOKEN);
  else { body = form instanceof FormData ? form : new URLSearchParams(form); body.append('access_token', TOKEN); }
  const res = await fetch(url, { method, body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const e = json.error || {};
    throw new Error(`${path} → ${e.type || res.status}: ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
  return json;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- samla filer och gruppera per koncept ----
const files = readdirSync(dir)
  .filter(f => ['.png', '.jpg', '.jpeg', '.mp4', '.mov'].includes(extname(f).toLowerCase()))
  .map(f => join(dir, f));
if (!files.length) die(`Inga bild/videofiler i ${dir}`);

const plan = { SO: [], SP: [], PD: [] };
const unmatched = [];
for (const f of files) {
  const m = basename(f).match(/(?:^|[_\s])(SO|SP|PD)(?:[_\s.]|$)/i);
  if (m) plan[m[1].toUpperCase()].push(f);
  else unmatched.push(f);
}
console.log('Plan:');
for (const [c, list] of Object.entries(plan)) {
  console.log(`  ${c} (${CONCEPTS[c].adset}): ${list.length} filer`);
  for (const f of list) console.log(`     · ${basename(f)}`);
}
if (unmatched.length) {
  console.log(`  ⚠️ Matchar inget koncept (hoppas över): ${unmatched.map(basename).join(', ')}`);
}
if (DRY) { console.log('\n--dry: inget skapas.'); process.exit(0); }

// ---- media-uppladdning ----
async function uploadImage(file) {
  const form = new FormData();
  form.append('filename', new Blob([readFileSync(file)]), basename(file));
  const res = await api(`${ACT}/adimages`, { method: 'POST', form });
  return Object.values(res.images)[0].hash;
}

function extractThumb(file) {
  const out = join(tmpdir(), basename(file).replace(/\.\w+$/, '_thumb.jpg'));
  execFileSync('ffmpeg', ['-y', '-i', file, '-vf', 'select=eq(n\\,0)', '-frames:v', '1', '-q:v', '2', out], { stdio: 'pipe' });
  return out;
}

// Miniatyr: ffmpeg om det finns, annars Metas egna genererade thumbnails.
async function thumbFor(file, videoId) {
  try { return { image_hash: await uploadImage(extractThumb(file)) }; }
  catch {
    for (let i = 0; i < 24; i++) {
      const t = await api(`${videoId}/thumbnails`);
      const best = t.data?.find(x => x.is_preferred) || t.data?.[0];
      if (best?.uri) return { image_url: best.uri };
      await sleep(5000);
    }
    throw new Error('Ingen thumbnail tillgänglig för videon.');
  }
}

async function uploadVideo(file) {
  const form = new FormData();
  form.append('source', new Blob([readFileSync(file)]), basename(file));
  const res = await api(`${ACT}/advideos`, { method: 'POST', form });
  return res.id;
}

async function waitVideoReady(id, name) {
  for (let i = 0; i < 60; i++) {
    const v = await api(`${id}?fields=status`);
    const s = v.status?.video_status;
    if (s === 'ready') return;
    if (s === 'error') throw new Error(`Video ${name} fick status error hos Meta.`);
    await sleep(5000);
  }
  throw new Error(`Video ${name} blev inte klar i tid.`);
}

// ---- kampanj + adsets ----
const existing = await api(`${ACT}/campaigns?fields=name&limit=200`);
if (existing.data?.some(c => c.name === CAMPAIGN_NAME))
  die(`Kampanjen "${CAMPAIGN_NAME}" finns redan — döp om eller ta bort den först.`);

const campaign = await api(`${ACT}/campaigns`, { method: 'POST', form: {
  name: CAMPAIGN_NAME, objective: 'OUTCOME_SALES', status: 'PAUSED',
  special_ad_categories: '[]',
  daily_budget: DAILY_BUDGET, bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
}});
console.log(`\n✓ Kampanj (PAUSED, CBO 1000 kr/dag): ${CAMPAIGN_NAME} (${campaign.id})`);

const adsetIds = {};
for (const [code, c] of Object.entries(CONCEPTS)) {
  if (!plan[code].length) continue;
  const adset = await api(`${ACT}/adsets`, { method: 'POST', form: {
    name: c.adset, campaign_id: campaign.id, status: 'ACTIVE',
    billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS',
    destination_type: 'WEBSITE',
    promoted_object: JSON.stringify({ pixel_id: PIXEL_ID, custom_event_type: 'PURCHASE' }),
    targeting: JSON.stringify({
      age_min: 18, age_max: 65,
      geo_locations: { countries: ['GB'], location_types: ['home', 'recent'] },
      targeting_automation: { advantage_audience: 0 },
    }),
  }});
  adsetIds[code] = adset.id;
  console.log(`✓ Adset: ${c.adset} (${adset.id}) — UK broad, Advantage+ audience AV`);
}

// ---- creatives + ads ----
let ok = 0, failed = 0;
for (const [code, list] of Object.entries(plan)) {
  const c = CONCEPTS[code];
  for (const file of list) {
    const adName = basename(file).replace(/\.\w+$/, '');
    try {
      const isVideo = ['.mp4', '.mov'].includes(extname(file).toLowerCase());
      let spec;
      if (isVideo) {
        const videoId = await uploadVideo(file);
        console.log(`  ↑ video ${basename(file)} (${videoId}) — väntar på processing…`);
        await waitVideoReady(videoId, basename(file));
        const thumb = await thumbFor(file, videoId);
        spec = { page_id: PAGE_ID, video_data: {
          video_id: videoId, ...thumb,
          message: c.message, title: c.headline, link_description: c.description,
          call_to_action: { type: 'SHOP_NOW', value: { link: LINK } },
        }};
      } else {
        const hash = await uploadImage(file);
        spec = { page_id: PAGE_ID, link_data: {
          image_hash: hash, link: LINK,
          message: c.message, name: c.headline, description: c.description,
          call_to_action: { type: 'SHOP_NOW', value: { link: LINK } },
        }};
      }
      const creative = await api(`${ACT}/adcreatives`, { method: 'POST', form: {
        name: `${adName}_creative`,
        object_story_spec: JSON.stringify(spec),
        degrees_of_freedom_spec: NO_ENHANCEMENTS,
      }});
      const ad = await api(`${ACT}/ads`, { method: 'POST', form: {
        name: adName, adset_id: adsetIds[code],
        creative: JSON.stringify({ creative_id: creative.id }), status: 'ACTIVE',
      }});
      console.log(`✓ [${code}] ${adName} (${ad.id})`);
      ok++;
    } catch (e) {
      console.error(`✗ [${code}] ${adName}: ${e.message}`);
      failed++;
    }
  }
}

console.log(`\nKlart: ${ok} annonser skapade${failed ? `, ${failed} misslyckades` : ''}.`);
console.log('Kampanjen är PAUSAD — granska i Ads Manager och slå på när du är nöjd.');
