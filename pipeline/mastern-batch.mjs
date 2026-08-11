#!/usr/bin/env node
// mastern-batch.mjs — ny batch i SnarkLös "Mastern".
//
//   node mastern-batch.mjs waves/<batch>.config.mjs [--dry]
//
// Kampanjens struktur: varje koncept får ett BASE-adset (produktsidan) och ett
// LISTICLE-adset (landningssida). Identiska annonser i båda — enda variabeln är
// destinationen. Hookarna (H1/H2/H3…) är olika videor med samma copy.
// Adset- och annonsinställningar klonas från ett befintligt adset i kampanjen så
// nya batchar blir exakt jämförbara med gamla.

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const configPath = args.find(a => !a.startsWith('--'));
if (!TOKEN) die('META_ACCESS_TOKEN saknas.');
if (!configPath) die('Ange konfig: node mastern-batch.mjs waves/<batch>.config.mjs [--dry]');
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
    if ((rateLimited || e.is_transient || e.code === 2 || res.status >= 500) && attempt < 12) {
      console.log(`  … väntar 60s (${e.code}, försök ${attempt})`);
      await sleep(60_000); continue;
    }
    throw new Error(`${path} → ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
}

// ---- klona inställningar från mall-adsetet ----
const mall = await api(cfg.templateAdsetId, { params: {
  fields: 'name,targeting,promoted_object,optimization_goal,billing_event,destination_type,dsa_beneficiary,dsa_payor,attribution_spec',
} });
const mallAd = (await api(`${cfg.templateAdsetId}/ads`, { params: { fields: 'creative{object_story_spec,degrees_of_freedom_spec}', limit: '1' } })).data[0];
const PAGE = mallAd.creative.object_story_spec.page_id;
const DOF = structuredClone(mallAd.creative.degrees_of_freedom_spec || {});
for (const dead of ['standard_enhancements', 'standard_enhancements_catalog'])
  delete DOF.creative_features_spec?.[dead];
const optIn = Object.entries(DOF.creative_features_spec || {}).filter(([, v]) => v.enroll_status === 'OPT_IN').map(([k]) => k);
console.log(`Mall: ${mall.name} · sida ${PAGE} · pixel ${mall.promoted_object.pixel_id} · enhancements OPT_IN: ${optIn.length ? optIn.join(', ') : 'inga'}`);

// ---- videobibliotek ----
const vids = new Map();
let r = await api(`${cfg.act}/advideos`, { params: { fields: 'title,id,status', limit: '200' } });
for (;;) {
  for (const v of r.data || []) {
    if (v.status?.video_status !== 'ready') continue;
    const t = (v.title || '').replace(/\.\w+$/, '').trim();
    if (!vids.has(t)) vids.set(t, v.id);
  }
  const next = r.paging?.next;
  if (!next || vids.size > 3000) break;
  const res = await fetch(next); r = await res.json();
  if (r.error) break;
}

// ---- bygg plan ----
const idag = cfg.dateSuffix;
const plan = [];
for (const k of cfg.concepts) {
  const grupper = {};
  for (const [hook, dest] of Object.entries(k.hooks)) {
    (grupper[dest] ??= []).push(hook);
  }
  // ett LISTICLE-adset per destination konceptet använder
  for (const [dest, hooks] of Object.entries(grupper)) {
    const flera = Object.keys(grupper).length > 1;
    plan.push({
      adset: `${k.name}${flera ? ` ${cfg.destLabels[dest] || dest}` : ''} LISTICLE ${idag}`,
      link: cfg.destinations[dest], hooks, koncept: k,
    });
  }
  // ett BASE-adset med alla hookar mot produktsidan
  plan.push({
    adset: `${k.name} BASE ${idag}`,
    link: cfg.destinations.PRODUKT, hooks: Object.keys(k.hooks), koncept: k,
  });
}

console.log(`\nPLAN — ${plan.length} adsets, ${plan.reduce((s, p) => s + p.hooks.length, 0)} annonser:`);
let saknas = [];
for (const p of plan) {
  const rader = p.hooks.map(h => {
    const fil = p.koncept.videos[h];
    const id = vids.get(fil);
    if (!id) saknas.push(fil);
    return `${h}${id ? '' : ' ⚠️SAKNAS'}`;
  });
  console.log(`  ${p.adset.padEnd(30)} → ${p.link.slice(0, 62)}  [${rader.join(', ')}]`);
}
if (saknas.length) die(`Video saknas i biblioteket: ${saknas.join(', ')}`);
if (DRY) { console.log('\n--dry: inget skapas.'); process.exit(0); }

async function videoThumb(videoId, namn) {
  for (let i = 0; i < 12; i++) {
    const t = await api(`${videoId}/thumbnails`);
    const best = t.data?.find(x => x.is_preferred) || t.data?.[0];
    if (best?.uri) return best.uri;
    await sleep(5000);
  }
  throw new Error(`Ingen thumbnail för ${namn}.`);
}

// ---- skapa ----
const priorAdsets = (await api(`${cfg.campaignId}/adsets`, { params: { fields: 'name', limit: '200' } })).data || [];
const priorAds = new Set(((await api(`${cfg.campaignId}/ads`, { params: { fields: 'name', limit: '500' } })).data || []).map(a => a.name));

let ok = 0, fel = 0;
for (const p of plan) {
  let adsetId = priorAdsets.find(a => a.name === p.adset)?.id;
  if (adsetId) console.log(`\n· återanvänder adset ${p.adset}`);
  else {
    const a = await api(`${cfg.act}/adsets`, { method: 'POST', form: {
      name: p.adset, campaign_id: cfg.campaignId, status: cfg.adsetStatus,
      billing_event: mall.billing_event, optimization_goal: mall.optimization_goal,
      destination_type: mall.destination_type,
      promoted_object: JSON.stringify({ pixel_id: mall.promoted_object.pixel_id, custom_event_type: mall.promoted_object.custom_event_type }),
      targeting: JSON.stringify(mall.targeting),
      attribution_spec: JSON.stringify(mall.attribution_spec),
      dsa_beneficiary: mall.dsa_beneficiary, dsa_payor: mall.dsa_payor,
    }});
    adsetId = a.id;
    console.log(`\n✓ adset (${cfg.adsetStatus}): ${p.adset} (${adsetId})`);
  }

  for (const hook of p.hooks) {
    // samma annonsnamn i BASE och LISTICLE är avsiktligt — det är A/B-paret
    const adNamn = `${p.koncept.name} ${hook} ${idag}`;
    try {
      const videoId = vids.get(p.koncept.videos[hook]);
      const thumb = await videoThumb(videoId, adNamn);
      const creative = await api(`${cfg.act}/adcreatives`, { method: 'POST', form: {
        name: `${adNamn} ${p.adset.includes('BASE') ? 'BASE' : 'LP'}_creative`,
        object_story_spec: JSON.stringify({ page_id: PAGE, video_data: {
          video_id: videoId, image_url: thumb,
          message: cfg.copy.message, title: cfg.copy.headline,
          call_to_action: { type: 'SHOP_NOW', value: { link: p.link } },
        }}),
        degrees_of_freedom_spec: JSON.stringify(DOF),
      }});
      const ad = await api(`${cfg.act}/ads`, { method: 'POST', form: {
        name: adNamn, adset_id: adsetId,
        creative: JSON.stringify({ creative_id: creative.id }), status: cfg.adStatus,
      }});
      console.log(`  ✓ ${adNamn} (${ad.id})`);
      ok++;
    } catch (e) { console.error(`  ✗ ${adNamn}: ${e.message}`); fel++; }
  }
}
console.log(`\nKlart: ${ok} annonser skapade${fel ? `, ${fel} fel` : ''}.`);
