#!/usr/bin/env node
// uk-wave.mjs — Motorhöljet UK: ny kampanj på Magiborsten UK-kontot.
// Media hämtas från kontots mediabibliotek (redan uppladdat som UK_*).
//
//   node uk-wave.mjs [--dry]
//
// CBO-kampanj 1000 kr/dag (PAUSAD) → 3 adsets per koncept (SO/SP/PD, UK broad)
// → creatives med copy per koncept, ALLA enhancements OPT_OUT → annonser döpta
// efter filnamnen. Kampanjen skapas PAUSAD — slå på manuellt i Ads Manager.

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
const ACT = 'act_1107817401910319'; // Magiborsten UK (SEK)

const PAGE_ID = '678639638662543';   // Bäverbutiken.se (enda page på tokenen)
const PIXEL_ID = '1554276343018184'; // Bäverbutiken.se-pixeln (finns på UK-kontot)
const LINK = 'https://beavershop.co.uk/products/marine-motor-cover-420d-universal-protection?_pos=1&_psq=420d&_psid=f0d02e612&_ss=e';
const CAMPAIGN_NAME = 'Motorhöljet UK';
const DAILY_BUDGET = '100000'; // öre = 1000 kr/dag (CBO på kampanjnivå)

// Bara motorhöljes-media (biblioteket innehåller även andra produkter)
const PRODUCT_RE = /enginecover|motorholje|motorhölje|marin/i;
const CONCEPT_RE = /(?:^|[_\s])(SO|SP|PD)(?:[_\s.]|$)/i;

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

// "Inga jävla bs meta tillägg": exakt samma OPT_OUT-lista som kontots SE-creatives
// (avläst från creative 1035280906146910), inkl. inline_comment på OPT_IN.
const NO_ENHANCEMENTS = JSON.stringify({
  creative_features_spec: {
    ...Object.fromEntries(
      ['adapt_to_placement', 'add_text_overlay', 'ads_with_benefits', 'advantage_plus_creative',
       'app_highlights', 'audio', 'biz_ai', 'carousel_to_video', 'catalog_feed_tag',
       'creative_stickers', 'cv_transformation', 'description_automation', 'dha_optimization',
       'dynamic_partner_content', 'enable_ncs_testimonials', 'enhance_cta',
       'feed_caption_optimization', 'generate_cta', 'hide_price', 'ig_glados_feed',
       'ig_video_native_subtitle', 'image_animation', 'image_auto_crop', 'image_background_gen',
       'image_brightness_and_contrast', 'image_enhancement', 'image_templates',
       'image_text_translation', 'image_touchups', 'image_uncrop', 'local_store_extension',
       'media_liquidity_animated_image', 'media_order', 'media_type_automation',
       'multi_photo_to_video', 'pac_relaxation', 'product_browsing', 'product_extensions',
       'product_metadata_automation', 'profile_card', 'replace_media_text',
       'reveal_details_over_time', 'show_destination_blurbs', 'show_summary', 'site_extensions',
       'standard_enhancements', 'standard_enhancements_catalog', 'text_optimizations',
       'text_translation', 'translate_voiceover', 'video_auto_crop', 'video_filtering',
       'video_highlight', 'video_highlights', 'video_to_image', 'video_uncrop',
       'wa_mm_image_filtering'].map(f => [f, { enroll_status: 'OPT_OUT' }])
    ),
    inline_comment: { enroll_status: 'OPT_IN' },
  },
});

const DRY = process.argv.includes('--dry');
if (!TOKEN) die('META_ACCESS_TOKEN saknas.');

function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(path, { method = 'GET', form, params } = {}) {
  const url = new URL(`${API}/${path}`);
  let body;
  if (method === 'GET') {
    url.searchParams.set('access_token', TOKEN);
    for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  } else {
    body = new URLSearchParams(form);
    body.append('access_token', TOKEN);
  }
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { method, body });
    const json = await res.json().catch(() => ({}));
    if (res.ok && !json.error) return json;
    const e = json.error || {};
    const transient = e.is_transient || e.code === 2 || res.status >= 500;
    if (transient && attempt < 5) {
      console.log(`  … transient fel på ${path} (försök ${attempt}), väntar ${2 ** attempt}s`);
      await sleep(2 ** attempt * 1000);
      continue;
    }
    throw new Error(`${path} → ${e.type || res.status}: ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
}

// ---- hämta media ur biblioteket och gruppera per koncept ----
const images = (await api(`${ACT}/adimages`, { params: { fields: 'name,hash', limit: '500' } })).data || [];
const videos = (await api(`${ACT}/advideos`, { params: { fields: 'title,id,status', limit: '500' } })).data || [];

const plan = { SO: [], SP: [], PD: [] };
for (const i of images) {
  if (!i.name?.startsWith('UK') || !PRODUCT_RE.test(i.name)) continue;
  const m = i.name.match(CONCEPT_RE);
  if (m) plan[m[1].toUpperCase()].push({ type: 'image', name: i.name.replace(/\.\w+$/, ''), hash: i.hash });
}
for (const v of videos) {
  const t = v.title || '';
  if (!t.startsWith('UK') || !PRODUCT_RE.test(t)) continue;
  const m = t.match(CONCEPT_RE);
  if (!m) continue;
  if (v.status?.video_status !== 'ready') { console.log(`⚠️ ${t} är inte ready (${v.status?.video_status}) — hoppas över`); continue; }
  plan[m[1].toUpperCase()].push({ type: 'video', name: t.replace(/\.\w+$/, ''), videoId: v.id });
}

console.log('Plan (från mediabiblioteket):');
let total = 0;
for (const [c, list] of Object.entries(plan)) {
  console.log(`  ${c} — ${CONCEPTS[c].adset}: ${list.length} st`);
  for (const it of list) console.log(`     · [${it.type}] ${it.name}`);
  total += list.length;
}
if (!total) die('Hittade ingen matchande media i biblioteket.');
if (DRY) { console.log('\n--dry: inget skapas.'); process.exit(0); }

async function videoThumb(videoId, name) {
  for (let i = 0; i < 12; i++) {
    const t = await api(`${videoId}/thumbnails`);
    const best = t.data?.find(x => x.is_preferred) || t.data?.[0];
    if (best?.uri) return best.uri;
    await sleep(5000);
  }
  throw new Error(`Ingen thumbnail för ${name}.`);
}

// ---- kampanj + adsets ----
const existing = await api(`${ACT}/campaigns`, { params: { fields: 'name,status', limit: '200' } });
let campaign = existing.data?.find(c => c.name === CAMPAIGN_NAME);
if (campaign) {
  console.log(`\n· Återanvänder kampanj: ${CAMPAIGN_NAME} (${campaign.id}, ${campaign.status})`);
} else {
  campaign = await api(`${ACT}/campaigns`, { method: 'POST', form: {
    name: CAMPAIGN_NAME, objective: 'OUTCOME_SALES', status: 'PAUSED',
    special_ad_categories: '[]',
    daily_budget: DAILY_BUDGET, bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  }});
  console.log(`\n✓ Kampanj (PAUSED, CBO 1000 kr/dag): ${CAMPAIGN_NAME} (${campaign.id})`);
}

const priorAdsets = (await api(`${campaign.id}/adsets`, { params: { fields: 'name', limit: '50' } })).data || [];
const priorAds = (await api(`${campaign.id}/ads`, { params: { fields: 'name', limit: '200' } })).data || [];
const priorAdNames = new Set(priorAds.map(a => a.name));

const adsetIds = {};
for (const [code, c] of Object.entries(CONCEPTS)) {
  if (!plan[code].length) continue;
  const prior = priorAdsets.find(a => a.name === c.adset);
  if (prior) { adsetIds[code] = prior.id; console.log(`· Återanvänder adset: ${c.adset} (${prior.id})`); continue; }
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
  for (const it of list) {
    if (priorAdNames.has(it.name)) { console.log(`· [${code}] ${it.name} finns redan — hoppar`); continue; }
    try {
      let spec;
      if (it.type === 'video') {
        const thumb = await videoThumb(it.videoId, it.name);
        spec = { page_id: PAGE_ID, video_data: {
          video_id: it.videoId, image_url: thumb,
          message: c.message, title: c.headline, link_description: c.description,
          call_to_action: { type: 'SHOP_NOW', value: { link: LINK } },
        }};
      } else {
        spec = { page_id: PAGE_ID, link_data: {
          image_hash: it.hash, link: LINK,
          message: c.message, name: c.headline, description: c.description,
          call_to_action: { type: 'SHOP_NOW', value: { link: LINK } },
        }};
      }
      const creative = await api(`${ACT}/adcreatives`, { method: 'POST', form: {
        name: `${it.name}_creative`,
        object_story_spec: JSON.stringify(spec),
        degrees_of_freedom_spec: NO_ENHANCEMENTS,
        // UK-kontot saknar tillgång till pagens IG-konto → kör IG under pagens identitet
        use_page_actor_override: 'true',
      }});
      const ad = await api(`${ACT}/ads`, { method: 'POST', form: {
        name: it.name, adset_id: adsetIds[code],
        creative: JSON.stringify({ creative_id: creative.id }), status: 'ACTIVE',
      }});
      console.log(`✓ [${code}] ${it.name} (${ad.id})`);
      ok++;
    } catch (e) {
      console.error(`✗ [${code}] ${it.name}: ${e.message}`);
      failed++;
    }
  }
}

console.log(`\nKlart: ${ok} annonser skapade${failed ? `, ${failed} misslyckades` : ''}.`);
console.log('Kampanjen är PAUSAD — granska i Ads Manager och slå på när du är nöjd.');
