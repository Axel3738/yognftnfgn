#!/usr/bin/env node
// no-image-ads.mjs — lägger in produktens 4 norska BILDannonser i BEFINTLIGA
// koncept-adsets (skapade av no-video-launch.mjs). Rutinen /translate-no Fas 3.2.
//
//   node no-image-ads.mjs waves/no-<produkt>-video.config.mjs --imgdir=<mapp> --slug=<slug> [--dry]
//
// Bilder: <imgdir>/<slug>_<K>_2_1_NO.png per koncept K (PD/SP/CS/G/GT).
// Annonsnamn: <Produkt>_NO_<K>_2_1 (produktprefixet tas ur adsetets videonamn).
// link_data + image_hash, samma copy som konceptets videoannonser, enhancements
// OPT_OUT, status = cfg.adStatus. Idempotent på annonsnamn.

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
if (!configPath || !opt.imgdir || !opt.slug) {
  console.error('Användning: node no-image-ads.mjs waves/no-<produkt>-video.config.mjs --imgdir=<mapp> --slug=<slug> [--dry]');
  process.exit(1);
}
const cfg = (await import(path.resolve(configPath))).default;

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

const campaigns = (await api(`${cfg.act}/campaigns`, { params: { fields: 'name', limit: '200' } })).data || [];
const campaignId = campaigns.find(c => c.name === cfg.campaignName)?.id;
if (!campaignId) { console.error(`✗ kampanjen "${cfg.campaignName}" finns inte — kör no-video-launch.mjs först.`); process.exit(1); }
const adsets = (await api(`${campaignId}/adsets`, { params: { fields: 'name', limit: '100' } })).data || [];

console.log(`\n=== bildannonser → ${cfg.campaignName} (${DRY ? 'DRY RUN' : 'SKARPT'}) ===`);
for (const adsetCfg of cfg.adsets) {
  const K = adsetCfg.name.split(' - ').pop();               // "Gamasjer NO - PD" → PD
  const img = path.join(opt.imgdir, `${opt.slug}_${K}_2_1_NO.png`);
  if (!existsSync(img)) { console.log(`  · ingen bild för ${K} (${img}) — hoppar`); continue; }
  const adName = adsetCfg.ads[0].name.replace(/_\d+$/, '_2_1'); // Gamasjer_NO_PD_1 → Gamasjer_NO_PD_2_1
  const adsetId = adsets.find(a => a.name === adsetCfg.name)?.id;
  if (!adsetId) { console.error(`✗ adset saknas: ${adsetCfg.name}`); process.exit(1); }
  const prior = new Set(((await api(`${adsetId}/ads`, { params: { fields: 'name', limit: '100' } })).data || []).map(x => x.name));
  if (prior.has(adName)) { console.log(`  · finns redan: ${adName}`); continue; }
  if (DRY) { console.log(`  [dry] skulle skapa ${adName} i ${adsetCfg.name}`); continue; }
  const hash = await uploadImage(img);
  const creative = await api(`${cfg.act}/adcreatives`, { method: 'POST', form: {
    name: adName,
    object_story_spec: JSON.stringify({ page_id: cfg.page, link_data: {
      image_hash: hash, link: cfg.link, message: adsetCfg.copy.message,
      name: adsetCfg.copy.headline, description: adsetCfg.copy.description,
      call_to_action: { type: 'SHOP_NOW', value: { link: cfg.link } },
    } }),
    degrees_of_freedom_spec: NO_ENHANCEMENTS,
  } });
  await api(`${cfg.act}/ads`, { method: 'POST', form: {
    name: adName, adset_id: adsetId,
    creative: JSON.stringify({ creative_id: creative.id }), status: cfg.adStatus,
  } });
  console.log(`  ✓ bildannons (${cfg.adStatus}): ${adName}`);
}
console.log('KLART.');
