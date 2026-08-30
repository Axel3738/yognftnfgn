#!/usr/bin/env node
// no-video-launch.mjs — launchar en batch lokaliserade VIDEOannonser som ny kampanj
// i ett marknadskonto (Temu-flödets NO/DK/FI/UK-skalning, docs/temu-launch-flow.md).
//
//   node no-video-launch.mjs waves/no-<produkt>-video.config.mjs [--dry]
//
// Struktur = exakt samma som förebilden "Fiskespöhållaren NO | BE-ROAS 1,36 | 2026-08-20":
//   kampanj  OUTCOME_SALES, CBO daily_budget ur konfigen, LOWEST_COST_WITHOUT_CAP
//   adsets   ett per koncept (PD/SP/GT/CS), ingen egen budget, OFFSITE_CONVERSIONS→PURCHASE
//   annonser video_data + thumbnail, ALLA creative enhancements OPT_OUT
//
// Konfigen MÅSTE sätta campaignStatus/adsetStatus/adStatus explicit (CLAUDE.md-regeln:
// ingen default — saknas något fält vägrar skriptet köra).
// Idempotent: kampanj/adsets/videor återanvänds på namn, annonser hoppar över dubbletter.

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
if (!TOKEN) { console.error('✗ META_ACCESS_TOKEN saknas i miljön.'); process.exit(1); }

// Samma OPT_OUT-lista som multi-batch.mjs — aldrig creative enhancements.
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
if (!configPath) { console.error('Ange en vågkonfig: node no-video-launch.mjs waves/no-<produkt>-video.config.mjs'); process.exit(1); }
const cfg = (await import(path.resolve(configPath))).default;

for (const f of ['act', 'page', 'pixel', 'campaignName', 'link', 'dailyBudget', 'campaignStatus', 'adsetStatus', 'adStatus', 'videoDir', 'adsets']) {
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

async function uploadVideo(file, title) {
  const buf = readFileSync(file);
  const fd = new FormData();
  fd.set('access_token', TOKEN);
  fd.set('title', title);
  fd.set('source', new Blob([buf], { type: 'video/mp4' }), path.basename(file));
  const res = await fetch(`${API}/${cfg.act}/advideos`, { method: 'POST', body: fd });
  const json = await res.json();
  if (json.error) throw new Error(`advideos: ${json.error.message}`);
  return json.id;
}

async function thumbnailFor(videoId) {
  for (let i = 0; i < 30; i++) {
    const t = await api(`${videoId}/thumbnails`).catch(() => null);
    const th = t?.data?.find(x => x.is_preferred) || t?.data?.[0];
    if (th) return th.uri;
    await sleep(10000);
  }
  throw new Error(`Ingen thumbnail för ${videoId} — videon är inte klarprocessad.`);
}

// ── 1. Videor: återanvänd på titel, ladda annars upp ──
const vids = new Map();
for (const v of (await api(`${cfg.act}/advideos`, { params: { fields: 'title,id,status', limit: '500' } })).data || [])
  vids.set((v.title || '').replace(/\.\w+$/, '').trim(), { id: v.id, ready: v.status?.video_status === 'ready' });

const wanted = [];
for (const adset of cfg.adsets) for (const ad of adset.ads) wanted.push(ad);

console.log(`\n=== ${cfg.campaignName} → ${cfg.act} (${DRY ? 'DRY RUN' : 'SKARPT'}) ===`);
for (const ad of wanted) {
  const file = path.join(cfg.videoDir, ad.file);
  if (!existsSync(file)) { console.error(`✗ videofil saknas: ${file}`); process.exit(1); }
  if (!vids.has(ad.name)) {
    if (DRY) { console.log(`  [dry] skulle ladda upp ${ad.file} som "${ad.name}"`); continue; }
    const id = await uploadVideo(file, ad.name);
    vids.set(ad.name, { id, ready: false });
    console.log(`  ✓ video uppladdad: ${ad.name} (${id})`);
  } else console.log(`  · video finns redan: ${ad.name}`);
}
if (DRY) { console.log('\nDry run — inget skapat i kontot.'); process.exit(0); }

// ── 2. Kampanj (CBO) ──
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

// ── 3. Adsets per koncept ──
const priorAdsets = (await api(`${campaignId}/adsets`, { params: { fields: 'name', limit: '100' } })).data || [];
const targeting = JSON.stringify(cfg.targeting ?? {
  age_min: 18, age_max: 65,
  geo_locations: { countries: [cfg.country || 'NO'], location_types: ['home', 'recent'] },
  targeting_automation: { advantage_audience: 1 },
});

for (const adsetCfg of cfg.adsets) {
  let adsetId = priorAdsets.find(a => a.name === adsetCfg.name)?.id;
  if (adsetId) console.log(`· återanvänder adset ${adsetCfg.name}`);
  else {
    const a = await api(`${cfg.act}/adsets`, { method: 'POST', form: {
      name: adsetCfg.name, campaign_id: campaignId, status: cfg.adsetStatus,
      billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS',
      promoted_object: JSON.stringify({ pixel_id: cfg.pixel, custom_event_type: 'PURCHASE' }),
      targeting,
    } });
    adsetId = a.id;
    console.log(`✓ adset (${cfg.adsetStatus}): ${adsetCfg.name} (${adsetId})`);
  }

  const priorAds = new Set(((await api(`${adsetId}/ads`, { params: { fields: 'name', limit: '100' } })).data || []).map(x => x.name));
  for (const ad of adsetCfg.ads) {
    if (priorAds.has(ad.name)) { console.log(`  · annons finns redan: ${ad.name}`); continue; }
    const vid = vids.get(ad.name);
    const thumb = await thumbnailFor(vid.id);
    const creative = await api(`${cfg.act}/adcreatives`, { method: 'POST', form: {
      name: ad.name,
      object_story_spec: JSON.stringify({ page_id: cfg.page, video_data: {
        video_id: vid.id, title: adsetCfg.copy.headline, message: adsetCfg.copy.message,
        link_description: adsetCfg.copy.description, image_url: thumb,
        call_to_action: { type: 'SHOP_NOW', value: { link: cfg.link } },
      } }),
      degrees_of_freedom_spec: NO_ENHANCEMENTS,
    } });
    await api(`${cfg.act}/ads`, { method: 'POST', form: {
      name: ad.name, adset_id: adsetId,
      creative: JSON.stringify({ creative_id: creative.id }), status: cfg.adStatus,
    } });
    console.log(`  ✓ annons (${cfg.adStatus}): ${ad.name}`);
  }
}
console.log('\nKLART. Verifiera i Ads Manager att kampanj/adsets/annonser har avsedd status.');
