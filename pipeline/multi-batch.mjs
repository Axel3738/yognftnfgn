#!/usr/bin/env node
// multi-batch.mjs — ny batch i befintliga kampanjer där varje MOTIV blir EN annons:
// formatvarianter (_1x1/_4x5/_9x16) kombineras med placeringsanpassning
// (4x5 → feed, 9x16 → stories/reels, 1x1 → allt övrigt). Copy hämtas live från
// ett käll-adset ("samma copy som innan på sagt koncept").
//
//   node multi-batch.mjs waves/<batch>.config.mjs [--dry]
//
// Konfig: { act, page, pixel, targeting, adsetStatus?, adStatus?, campaigns: [
//   { campaignName, adsets: [ { name, copyFrom, motifs: ['Enginecover_PD_16_1', ...] } ] } ] }

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
if (!configPath) die('Ange konfig.');
const cfg = (await import(new URL(configPath, `file://${process.cwd()}/`))).default;

function die(msg) { console.error(`✗ ${msg}`); process.exit(1); }
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function api(path, { method = 'GET', form, params } = {}) {
  const url = new URL(`${API}/${path}`);
  let body;
  if (method === 'GET') {
    url.searchParams.set('access_token', TOKEN);
    for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  } else { body = new URLSearchParams(form); body.append('access_token', TOKEN); }
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, { method, body });
    const json = await res.json().catch(() => ({}));
    if (res.ok && !json.error) return json;
    const e = json.error || {};
    const rateLimited = e.code === 17 || /request limit/i.test(e.message || '');
    if ((rateLimited || e.is_transient || e.code === 2 || res.status >= 500) && attempt < 10) {
      console.log(`  … väntar 60s (${e.code}, försök ${attempt})`);
      await sleep(60_000); continue;
    }
    throw new Error(`${path} → ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
}

// ---- bibliotek ----
const imgs = new Map(), vids = new Map();
for (const i of (await api(`${cfg.act}/adimages`, { params: { fields: 'name,hash', limit: '500' } })).data || [])
  imgs.set(i.name.replace(/\.\w+$/, '').trim(), i.hash);
for (const v of (await api(`${cfg.act}/advideos`, { params: { fields: 'title,id,status', limit: '500' } })).data || [])
  if (v.status?.video_status === 'ready') vids.set((v.title || '').replace(/\.\w+$/, '').trim(), v.id);

function resolveMotif(motif) {
  if (vids.has(motif)) return { kind: 'video', videoId: vids.get(motif) };
  const variants = {};
  for (const suffix of ['1x1', '4x5', '9x16'])
    if (imgs.has(`${motif}_${suffix}`)) variants[suffix] = imgs.get(`${motif}_${suffix}`);
  if (imgs.has(motif)) variants['1x1'] ??= imgs.get(motif);
  if (!Object.keys(variants).length) return null;
  return { kind: 'image', variants };
}

async function copyFrom(adsetId, adsetName) {
  const ads = (await api(`${adsetId}/ads`, { params: { fields: 'name,creative{object_story_spec}', limit: '5' } })).data || [];
  for (const ad of ads) {
    const spec = ad.creative?.object_story_spec || {};
    const data = spec.video_data || spec.link_data;
    if (!data?.message) continue;
    return {
      message: data.message,
      headline: data.title || data.name || '',
      description: data.link_description || data.description || '',
      link: data.call_to_action?.value?.link || data.link || '',
      fromAd: ad.name,
    };
  }
  die(`Hittade ingen copy i käll-adsetet ${adsetName}.`);
}

async function videoThumb(videoId, name) {
  for (let i = 0; i < 12; i++) {
    const t = await api(`${videoId}/thumbnails`);
    const best = t.data?.find(x => x.is_preferred) || t.data?.[0];
    if (best?.uri) return best.uri;
    await sleep(5000);
  }
  throw new Error(`Ingen thumbnail för ${name}.`);
}

const FEED_SPEC = { publisher_platforms: ['facebook', 'instagram'],
  facebook_positions: ['feed', 'video_feeds', 'profile_feed'],
  instagram_positions: ['stream', 'explore', 'explore_home', 'profile_feed'] };
const STORY_SPEC = { publisher_platforms: ['facebook', 'instagram'],
  facebook_positions: ['story', 'facebook_reels'],
  instagram_positions: ['story', 'reels'] };
const ALL_SPEC = { publisher_platforms: ['facebook', 'instagram', 'audience_network', 'messenger'] };

function assetFeedFor(variants, copy) {
  const images = [], rules = [];
  let prio = 1;
  const label = s => ({ name: s });
  if (variants['4x5']) {
    images.push({ hash: variants['4x5'], adlabels: [label('tall')] });
    rules.push({ customization_spec: FEED_SPEC, image_label: label('tall'), priority: prio++ });
  }
  if (variants['9x16']) {
    images.push({ hash: variants['9x16'], adlabels: [label('story')] });
    rules.push({ customization_spec: STORY_SPEC, image_label: label('story'), priority: prio++ });
  }
  const fallback = variants['1x1'] || variants['4x5'] || variants['9x16'];
  const fbLabel = variants['1x1'] ? 'sq' : (variants['4x5'] ? 'tall' : 'story');
  if (variants['1x1']) images.push({ hash: variants['1x1'], adlabels: [label('sq')] });
  rules.push({ customization_spec: ALL_SPEC, image_label: label(fbLabel), priority: prio++ });
  return {
    images, asset_customization_rules: rules,
    bodies: [{ text: copy.message }], titles: [{ text: copy.headline }],
    ...(copy.description ? { descriptions: [{ text: copy.description }] } : {}),
    ad_formats: ['SINGLE_IMAGE'], call_to_action_types: ['SHOP_NOW'],
    link_urls: [{ website_url: copy.link }],
  };
}

// ---- kör ----
const campaigns = (await api(`${cfg.act}/campaigns`, { params: { fields: 'name', limit: '200' } })).data || [];
let ok = 0, failed = 0;

for (const camp of cfg.campaigns) {
  const c = campaigns.find(x => x.name === camp.campaignName);
  if (!c) { console.log(`✗ Kampanjen "${camp.campaignName}" saknas — hoppar`); continue; }
  const priorAdsets = (await api(`${c.id}/adsets`, { params: { fields: 'name', limit: '100' } })).data || [];
  const priorAds = new Set(((await api(`${c.id}/ads`, { params: { fields: 'name', limit: '500' } })).data || []).map(a => a.name));
  console.log(`\n### ${camp.campaignName} (${c.id})`);

  for (const adsetCfg of camp.adsets) {
    const src = priorAdsets.find(a => a.name === adsetCfg.copyFrom);
    if (!src) { console.log(`✗ käll-adset "${adsetCfg.copyFrom}" saknas — hoppar ${adsetCfg.name}`); continue; }
    const copy = await copyFrom(src.id, adsetCfg.copyFrom);
    console.log(`  copy från ${adsetCfg.copyFrom} / ${copy.fromAd}`);

    if (DRY) {
      for (const m of adsetCfg.motifs) {
        const r = resolveMotif(m);
        console.log(`  · ${m}: ${r ? (r.kind === 'video' ? 'video' : 'bild [' + Object.keys(r.variants).join('+') + ']') : 'SAKNAS'}`);
      }
      continue;
    }

    let adsetId = priorAdsets.find(a => a.name === adsetCfg.name)?.id;
    if (adsetId) console.log(`  · återanvänder adset ${adsetCfg.name}`);
    else {
      const adset = await api(`${cfg.act}/adsets`, { method: 'POST', form: {
        name: adsetCfg.name, campaign_id: c.id, status: cfg.adsetStatus || 'PAUSED',
        billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS',
        destination_type: 'WEBSITE',
        promoted_object: JSON.stringify({ pixel_id: cfg.pixel, custom_event_type: 'PURCHASE' }),
        targeting: JSON.stringify(cfg.targeting),
      }});
      adsetId = adset.id;
      console.log(`  ✓ adset (${cfg.adsetStatus || 'PAUSED'}): ${adsetCfg.name} (${adsetId})`);
    }

    for (const motif of adsetCfg.motifs) {
      if (priorAds.has(motif)) { console.log(`  · ${motif} finns redan — hoppar`); continue; }
      try {
        const r = resolveMotif(motif);
        if (!r) throw new Error('media saknas i biblioteket');
        const form = { name: `${motif}_creative`, degrees_of_freedom_spec: NO_ENHANCEMENTS };
        if (r.kind === 'video') {
          const thumb = await videoThumb(r.videoId, motif);
          form.object_story_spec = JSON.stringify({ page_id: cfg.page, video_data: {
            video_id: r.videoId, image_url: thumb,
            message: copy.message, title: copy.headline,
            ...(copy.description ? { link_description: copy.description } : {}),
            call_to_action: { type: 'SHOP_NOW', value: { link: copy.link } },
          }});
        } else if (Object.keys(r.variants).length === 1) {
          const hash = Object.values(r.variants)[0];
          form.object_story_spec = JSON.stringify({ page_id: cfg.page, link_data: {
            image_hash: hash, link: copy.link,
            message: copy.message, name: copy.headline,
            ...(copy.description ? { description: copy.description } : {}),
            call_to_action: { type: 'SHOP_NOW', value: { link: copy.link } },
          }});
        } else {
          form.object_story_spec = JSON.stringify({ page_id: cfg.page,
            ...(cfg.instagram ? { instagram_user_id: cfg.instagram } : {}) });
          form.asset_feed_spec = JSON.stringify(assetFeedFor(r.variants, copy));
        }
        const creative = await api(`${cfg.act}/adcreatives`, { method: 'POST', form });
        const ad = await api(`${cfg.act}/ads`, { method: 'POST', form: {
          name: motif, adset_id: adsetId,
          creative: JSON.stringify({ creative_id: creative.id }), status: cfg.adStatus || 'ACTIVE',
        }});
        console.log(`  ✓ ${motif} (${ad.id})`);
        ok++;
      } catch (e) { console.error(`  ✗ ${motif}: ${e.message}`); failed++; }
    }
  }
}
console.log(`\nKlart: ${ok} annonser skapade${failed ? `, ${failed} fel` : ''}.`);
