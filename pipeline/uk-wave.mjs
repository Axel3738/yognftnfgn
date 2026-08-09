#!/usr/bin/env node
// uk-wave.mjs — generisk kampanj-uppladdare för Magiborsten UK.
// Media hämtas från annonskontots mediabibliotek (redan uppladdat som UK_*).
//
//   node uk-wave.mjs waves/uk-motorholje.config.mjs [--dry]
//
// Konfigfilen beskriver kampanjen: namn, länk, produkt-filter, copy per koncept.
// Skapar: CBO-kampanj (PAUSAD) → adsets per koncept (UK broad) → creatives med
// ALLA enhancements OPT_OUT → annonser döpta efter filnamnen. Idempotent:
// befintlig kampanj/adsets/annonser återanvänds — bara det som saknas skapas.

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;

const CONCEPT_RE = /(?:^|[_\s])(SO|SP|PD|SF)(?:[_\s.]|$)/i;

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
       'text_optimizations',
       'text_translation', 'translate_voiceover', 'video_auto_crop', 'video_filtering',
       'video_highlight', 'video_highlights', 'video_to_image', 'video_uncrop',
       'wa_mm_image_filtering'].map(f => [f, { enroll_status: 'OPT_OUT' }])
    ),
    inline_comment: { enroll_status: 'OPT_IN' },
  },
});

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const configPath = args.find(a => !a.startsWith('--'));
if (!TOKEN) die('META_ACCESS_TOKEN saknas.');
if (!configPath) die('Ange konfig: node uk-wave.mjs waves/<kampanj>.config.mjs [--dry]');

const cfg = (await import(new URL(configPath, `file://${process.cwd()}/`))).default;
// cfg: { campaignName, link, dailyBudget (öre), productRe, concepts: {SO/SP/PD: {adset, message, headline, description}},
//        aliases?: {SF:'SP'}, forceConcept?: {filnamn: kod},
//        act?, page?, pixel?, country?, prefix?, adsetStatus?, adStatus? } — default: Magiborsten UK

const ACT = cfg.act || 'act_1107817401910319';           // Magiborsten UK (SEK)
const PAGE_ID = cfg.page || '1305042582683792';          // BeaverShop (ingen IG-koppling)
const PIXEL_ID = cfg.pixel || '1554276343018184';        // Bäverbutiken.se-pixeln
const COUNTRY = cfg.country || 'GB';
const PREFIX = cfg.prefix || 'UK';

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
    const rateLimited = e.code === 17 || /request limit/i.test(e.message || '');
    const transient = e.is_transient || e.code === 2 || res.status >= 500;
    if (rateLimited && attempt < 8) {
      console.log(`  … rate limit på ${path} (försök ${attempt}), väntar 60s`);
      await sleep(60_000);
      continue;
    }
    if (transient && attempt < 5) {
      console.log(`  … transient fel på ${path} (försök ${attempt}), väntar ${2 ** attempt}s`);
      await sleep(2 ** attempt * 1000);
      continue;
    }
    throw new Error(`${path} → ${e.type || res.status}: ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
}

function conceptFor(name) {
  const base = name.replace(/\.\w+$/, '');
  if (cfg.forceConcept?.[base]) return cfg.forceConcept[base];
  const m = name.match(CONCEPT_RE);
  if (!m) return null;
  const code = m[1].toUpperCase();
  return cfg.aliases?.[code] || (cfg.concepts[code] ? code : null);
}

// ---- hämta media ur biblioteket och gruppera per koncept ----
const images = (await api(`${ACT}/adimages`, { params: { fields: 'name,hash', limit: '500' } })).data || [];
const videos = (await api(`${ACT}/advideos`, { params: { fields: 'title,id,status', limit: '500' } })).data || [];

const plan = Object.fromEntries(Object.keys(cfg.concepts).map(k => [k, []]));
const skipped = [];
for (const i of images) {
  if (!i.name?.startsWith(PREFIX) || !cfg.productRe.test(i.name)) continue;
  const c = conceptFor(i.name);
  if (c) plan[c].push({ type: 'image', name: i.name.replace(/\.\w+$/, ''), hash: i.hash });
  else skipped.push(i.name);
}
for (const v of videos) {
  const t = v.title || '';
  if (!t.startsWith(PREFIX) || !cfg.productRe.test(t)) continue;
  const c = conceptFor(t);
  if (!c) { skipped.push(t); continue; }
  if (v.status?.video_status !== 'ready') { console.log(`⚠️ ${t} är inte ready (${v.status?.video_status}) — hoppas över`); continue; }
  plan[c].push({ type: 'video', name: t.replace(/\.\w+$/, ''), videoId: v.id });
}

console.log(`Plan — ${cfg.campaignName}:`);
let total = 0;
for (const [c, list] of Object.entries(plan)) {
  console.log(`  ${c} — ${cfg.concepts[c].adset}: ${list.length} st`);
  for (const it of list) console.log(`     · [${it.type}] ${it.name}`);
  total += list.length;
}
if (skipped.length) console.log(`  ⚠️ Utan känt koncept (hoppas över): ${skipped.join(', ')}`);
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

// ---- kampanj + adsets (idempotent) ----
const existing = await api(`${ACT}/campaigns`, { params: { fields: 'name,status', limit: '200' } });
let campaign = existing.data?.find(c => c.name === cfg.campaignName);
if (campaign) {
  console.log(`\n· Återanvänder kampanj: ${cfg.campaignName} (${campaign.id}, ${campaign.status})`);
} else {
  campaign = await api(`${ACT}/campaigns`, { method: 'POST', form: {
    name: cfg.campaignName, objective: 'OUTCOME_SALES', status: 'PAUSED',
    special_ad_categories: '[]',
    daily_budget: cfg.dailyBudget, bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
  }});
  console.log(`\n✓ Kampanj (PAUSED, CBO ${cfg.dailyBudget / 100} kr/dag): ${cfg.campaignName} (${campaign.id})`);
}

const priorAdsets = (await api(`${campaign.id}/adsets`, { params: { fields: 'name', limit: '50' } })).data || [];
const priorAds = (await api(`${campaign.id}/ads`, { params: { fields: 'name', limit: '200' } })).data || [];
const priorAdNames = new Set(priorAds.map(a => a.name));

const adsetIds = {};
for (const [code, c] of Object.entries(cfg.concepts)) {
  if (!plan[code].length) continue;
  const prior = priorAdsets.find(a => a.name === c.adset);
  if (prior) { adsetIds[code] = prior.id; console.log(`· Återanvänder adset: ${c.adset} (${prior.id})`); continue; }
  const adset = await api(`${ACT}/adsets`, { method: 'POST', form: {
    name: c.adset, campaign_id: campaign.id, status: cfg.adsetStatus || 'ACTIVE',
    billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS',
    destination_type: 'WEBSITE',
    promoted_object: JSON.stringify({ pixel_id: PIXEL_ID, custom_event_type: 'PURCHASE' }),
    targeting: JSON.stringify({
      age_min: 18, age_max: 65,
      geo_locations: { countries: [COUNTRY], location_types: ['home', 'recent'] },
      targeting_automation: { advantage_audience: 0 },
    }),
  }});
  adsetIds[code] = adset.id;
  console.log(`✓ Adset: ${c.adset} (${adset.id}) — ${COUNTRY} broad, Advantage+ audience AV`);
}

// ---- creatives + ads ----
let ok = 0, failed = 0;
for (const [code, list] of Object.entries(plan)) {
  const c = cfg.concepts[code];
  for (const it of list) {
    if (priorAdNames.has(it.name)) { console.log(`· [${code}] ${it.name} finns redan — hoppar`); continue; }
    try {
      let spec;
      if (it.type === 'video') {
        const thumb = await videoThumb(it.videoId, it.name);
        spec = { page_id: PAGE_ID, video_data: {
          video_id: it.videoId, image_url: thumb,
          message: c.message, title: c.headline, link_description: c.description,
          call_to_action: { type: 'SHOP_NOW', value: { link: cfg.link } },
        }};
      } else {
        spec = { page_id: PAGE_ID, link_data: {
          image_hash: it.hash, link: cfg.link,
          message: c.message, name: c.headline, description: c.description,
          call_to_action: { type: 'SHOP_NOW', value: { link: cfg.link } },
        }};
      }
      const creative = await api(`${ACT}/adcreatives`, { method: 'POST', form: {
        name: `${it.name}_creative`,
        object_story_spec: JSON.stringify(spec),
        degrees_of_freedom_spec: NO_ENHANCEMENTS,
      }});
      const ad = await api(`${ACT}/ads`, { method: 'POST', form: {
        name: it.name, adset_id: adsetIds[code],
        creative: JSON.stringify({ creative_id: creative.id }), status: cfg.adStatus || 'ACTIVE',
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
