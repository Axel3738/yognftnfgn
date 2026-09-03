#!/usr/bin/env node
// no-image-launch.mjs — launchar en REN bildkampanj (ingen video finns för
// produkten) i ett marknadskonto. Samma struktur/enhancements/idempotens som
// no-video-launch.mjs + no-image-ads.mjs, men utan videostegets beroenden.
//
//   node no-image-launch.mjs waves/no-<produkt>-image.config.mjs --imgdir=<mapp> [--dry]

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
if (!TOKEN) { console.error('✗ META_ACCESS_TOKEN saknas i miljön.'); process.exit(1); }

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
const opt = Object.fromEntries(args.filter(a => a.startsWith('--') && a.includes('=')).map(a => a.slice(2).split('=')));
const configPath = args.find(a => !a.startsWith('--'));
if (!configPath || !opt.imgdir) {
  console.error('Användning: node no-image-launch.mjs waves/no-<produkt>-image.config.mjs --imgdir=<mapp> [--dry]');
  process.exit(1);
}
const cfg = (await import(path.resolve(configPath))).default;
for (const f of ['act', 'page', 'pixel', 'campaignName', 'link', 'dailyBudget', 'campaignStatus', 'adsetStatus', 'adStatus', 'adsets']) {
  if (cfg[f] === undefined) { console.error(`✗ Konfigen saknar "${f}" — alla statusfält ska sättas EXPLICIT.`); process.exit(1); }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function api(p, { method = 'GET', params = {}, form = null } = {}) {
  for (let attempt = 1; ; attempt++) {
    const url = new URL(`${API}/${p}`);
    url.searchParams.set('access_token', TOKEN);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    let body;
    if (form) { body = new URLSearchParams(); for (const [k, v] of Object.entries(form)) body.set(k, v); }
    const res = await fetch(url, { method, body });
    const json = await res.json().catch(() => ({}));
    if (res.ok && !json.error) return json;
    const e = json.error || {};
    if ((e.is_transient || e.code === 2 || res.status >= 500 || e.code === 17) && attempt < 8) {
      console.log(`  … Meta-fel (${e.code ?? res.status}), försök ${attempt}, väntar ${attempt * 15}s`);
      await sleep(attempt * 15000); continue;
    }
    throw new Error(`${p} → ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
}

async function uploadImage(file) {
  const fd = new FormData();
  fd.set('access_token', TOKEN);
  fd.set('source', new Blob([readFileSync(file)], { type: 'image/png' }), path.basename(file));
  const res = await fetch(`${API}/${cfg.act}/adimages`, { method: 'POST', body: fd });
  const json = await res.json();
  if (json.error) throw new Error(`adimages: ${json.error.message}`);
  return Object.values(json.images)[0].hash;
}

for (const a of cfg.adsets) {
  const img = path.join(opt.imgdir, a.img);
  if (!existsSync(img)) { console.error(`✗ bildfil saknas: ${img}`); process.exit(1); }
}

console.log(`\n=== ${cfg.campaignName} → ${cfg.act} (${DRY ? 'DRY RUN' : 'SKARPT'}) ===`);
if (DRY) {
  for (const a of cfg.adsets) console.log(`  [dry] skulle skapa adset "${a.name}" + annons "${a.adName}" (${a.img})`);
  console.log('\nDry run — inget skapat i kontot.');
  process.exit(0);
}

// ── 1. Kampanj (CBO) ──
const campaigns = (await api(`${cfg.act}/campaigns`, { params: { fields: 'name', limit: '200' } })).data || [];
let campaignId = campaigns.find(c => c.name === cfg.campaignName)?.id;
if (campaignId) console.log(`· återanvänder kampanj ${cfg.campaignName} (${campaignId})`);
else {
  const c = await api(`${cfg.act}/campaigns`, { method: 'POST', form: {
    name: cfg.campaignName, objective: 'OUTCOME_SALES', status: cfg.campaignStatus,
    daily_budget: cfg.dailyBudget, bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    special_ad_categories: '[]',
  } });
  campaignId = c.id;
  console.log(`✓ kampanj (${cfg.campaignStatus}, ${Number(cfg.dailyBudget) / 100} kr/dag CBO): ${campaignId}`);
}

// ── 2. Adsets per koncept, en bildannons vardera ──
const priorAdsets = (await api(`${campaignId}/adsets`, { params: { fields: 'name', limit: '100' } })).data || [];
const targeting = JSON.stringify(cfg.targeting ?? {
  age_min: 18, age_max: 65,
  geo_locations: { countries: [cfg.country || 'NO'], location_types: ['home', 'recent'] },
  targeting_automation: { advantage_audience: 1 },
});

for (const a of cfg.adsets) {
  let adsetId = priorAdsets.find(x => x.name === a.name)?.id;
  if (adsetId) console.log(`· återanvänder adset ${a.name}`);
  else {
    const created = await api(`${cfg.act}/adsets`, { method: 'POST', form: {
      name: a.name, campaign_id: campaignId, status: cfg.adsetStatus,
      billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS',
      promoted_object: JSON.stringify({ pixel_id: cfg.pixel, custom_event_type: 'PURCHASE' }),
      targeting,
    } });
    adsetId = created.id;
    console.log(`✓ adset (${cfg.adsetStatus}): ${a.name} (${adsetId})`);
  }

  const priorAds = new Set(((await api(`${adsetId}/ads`, { params: { fields: 'name', limit: '100' } })).data || []).map(x => x.name));
  if (priorAds.has(a.adName)) { console.log(`  · annons finns redan: ${a.adName}`); continue; }
  const hash = await uploadImage(path.join(opt.imgdir, a.img));
  const creative = await api(`${cfg.act}/adcreatives`, { method: 'POST', form: {
    name: a.adName,
    object_story_spec: JSON.stringify({ page_id: cfg.page, link_data: {
      image_hash: hash, link: cfg.link, message: a.copy.message,
      name: a.copy.headline, description: a.copy.description,
      call_to_action: { type: 'SHOP_NOW', value: { link: cfg.link } },
    } }),
    degrees_of_freedom_spec: NO_ENHANCEMENTS,
  } });
  await api(`${cfg.act}/ads`, { method: 'POST', form: {
    name: a.adName, adset_id: adsetId,
    creative: JSON.stringify({ creative_id: creative.id }), status: cfg.adStatus,
  } });
  console.log(`  ✓ annons (${cfg.adStatus}): ${a.adName}`);
}
console.log('\nKLART. Verifiera i Ads Manager att kampanj/adsets/annonser har avsedd status.');
