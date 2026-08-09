#!/usr/bin/env node
// batch.mjs — lägger en ny batch annonser i en BEFINTLIG kampanj, med NYA adsets
// per koncept (mönstret: varje ny batch = nya adsets, utspritt på koncept).
//
//   node batch.mjs waves/<batch>.config.mjs [--dry]
//
// Konfig: { act, campaignName, page, pixel, link, media: { KONCEPT: [videonamn...] },
//           adsets: { KONCEPT: 'adset-namn' }, copy: { KONCEPT: {message, headline, description} },
//           adsetStatus?, adStatus?, targeting? }
// Adsets skapas PAUSADE (default) — aktivering är alltid ett manuellt beslut.
// Creatives: alla enhancements OPT_OUT, inline_comment (relevanta kommentarer) OPT_IN.

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;

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
       'text_optimizations', 'text_translation', 'translate_voiceover', 'video_auto_crop',
       'video_filtering', 'video_highlight', 'video_highlights', 'video_to_image',
       'video_uncrop', 'wa_mm_image_filtering'].map(f => [f, { enroll_status: 'OPT_OUT' }])
    ),
    inline_comment: { enroll_status: 'OPT_IN' },
  },
});

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const configPath = args.find(a => !a.startsWith('--'));
if (!TOKEN) die('META_ACCESS_TOKEN saknas.');
if (!configPath) die('Ange konfig: node batch.mjs waves/<batch>.config.mjs [--dry]');
const cfg = (await import(new URL(configPath, `file://${process.cwd()}/`))).default;

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
    if ((rateLimited || e.is_transient || e.code === 2 || res.status >= 500) && attempt < 10) {
      console.log(`  … väntar 60s (${e.code}, försök ${attempt})`);
      await sleep(60_000);
      continue;
    }
    throw new Error(`${path} → ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
}

// ---- slå upp kampanj + media ----
const campaigns = await api(`${cfg.act}/campaigns`, { params: { fields: 'name,status', limit: '200' } });
const campaign = campaigns.data?.find(c => c.name === cfg.campaignName);
if (!campaign) die(`Kampanjen "${cfg.campaignName}" hittades inte på ${cfg.act}.`);
console.log(`Kampanj: ${cfg.campaignName} (${campaign.id}, ${campaign.status})`);

const videos = (await api(`${cfg.act}/advideos`, { params: { fields: 'title,id,status', limit: '500' } })).data || [];
const images = (await api(`${cfg.act}/adimages`, { params: { fields: 'name,hash', limit: '500' } })).data || [];
const byName = new Map();
for (const v of videos) byName.set((v.title || '').replace(/\.\w+$/, '').trim(), { type: 'video', videoId: v.id, ready: v.status?.video_status === 'ready' });
for (const i of images) if (!byName.has(i.name.replace(/\.\w+$/, ''))) byName.set(i.name.replace(/\.\w+$/, '').trim(), { type: 'image', hash: i.hash, ready: true });

const plan = {};
for (const [concept, names] of Object.entries(cfg.media)) {
  plan[concept] = [];
  for (const n of names) {
    const m = byName.get(n);
    if (!m) { console.log(`⚠️ "${n}" hittades inte i biblioteket — hoppar`); continue; }
    if (!m.ready) { console.log(`⚠️ "${n}" är inte ready — hoppar`); continue; }
    plan[concept].push({ name: n, ...m });
  }
  console.log(`${concept} → ${cfg.adsets[concept]}: ${plan[concept].length}/${names.length} media`);
}
if (DRY) { console.log('--dry: inget skapas.'); process.exit(0); }

async function videoThumb(videoId, name) {
  for (let i = 0; i < 12; i++) {
    const t = await api(`${videoId}/thumbnails`);
    const best = t.data?.find(x => x.is_preferred) || t.data?.[0];
    if (best?.uri) return best.uri;
    await sleep(5000);
  }
  throw new Error(`Ingen thumbnail för ${name}.`);
}

// ---- nya adsets (idempotent: återanvänd om namnet redan finns) ----
const priorAdsets = (await api(`${campaign.id}/adsets`, { params: { fields: 'name', limit: '100' } })).data || [];
const priorAds = new Set(((await api(`${campaign.id}/ads`, { params: { fields: 'name', limit: '500' } })).data || []).map(a => a.name));

const adsetIds = {};
for (const [concept, adsetName] of Object.entries(cfg.adsets)) {
  if (!plan[concept]?.length) continue;
  const prior = priorAdsets.find(a => a.name === adsetName);
  if (prior) { adsetIds[concept] = prior.id; console.log(`· Återanvänder adset: ${adsetName} (${prior.id})`); continue; }
  const adset = await api(`${cfg.act}/adsets`, { method: 'POST', form: {
    name: adsetName, campaign_id: campaign.id, status: cfg.adsetStatus || 'PAUSED',
    billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS',
    destination_type: 'WEBSITE',
    promoted_object: JSON.stringify({ pixel_id: cfg.pixel, custom_event_type: 'PURCHASE' }),
    targeting: JSON.stringify(cfg.targeting),
  }});
  adsetIds[concept] = adset.id;
  console.log(`✓ Adset (${cfg.adsetStatus || 'PAUSED'}): ${adsetName} (${adset.id})`);
}

// ---- annonser ----
let ok = 0, failed = 0;
for (const [concept, list] of Object.entries(plan)) {
  const c = cfg.copy[concept];
  for (const it of list) {
    if (priorAds.has(it.name)) { console.log(`· ${it.name} finns redan — hoppar`); continue; }
    try {
      let spec;
      if (it.type === 'video') {
        const thumb = await videoThumb(it.videoId, it.name);
        spec = { page_id: cfg.page, video_data: {
          video_id: it.videoId, image_url: thumb,
          message: c.message, title: c.headline, link_description: c.description,
          call_to_action: { type: 'SHOP_NOW', value: { link: cfg.link } },
        }};
      } else {
        spec = { page_id: cfg.page, link_data: {
          image_hash: it.hash, link: cfg.link,
          message: c.message, name: c.headline, description: c.description,
          call_to_action: { type: 'SHOP_NOW', value: { link: cfg.link } },
        }};
      }
      const creative = await api(`${cfg.act}/adcreatives`, { method: 'POST', form: {
        name: `${it.name}_creative`,
        object_story_spec: JSON.stringify(spec),
        degrees_of_freedom_spec: NO_ENHANCEMENTS,
      }});
      const ad = await api(`${cfg.act}/ads`, { method: 'POST', form: {
        name: it.name, adset_id: adsetIds[concept],
        creative: JSON.stringify({ creative_id: creative.id }), status: cfg.adStatus || 'ACTIVE',
      }});
      console.log(`✓ [${concept}] ${it.name} (${ad.id})`);
      ok++;
    } catch (e) {
      console.error(`✗ [${concept}] ${it.name}: ${e.message}`);
      failed++;
    }
  }
}
console.log(`\nKlart: ${ok} annonser skapade${failed ? `, ${failed} fel` : ''}.`);
