#!/usr/bin/env node
// update-copy.mjs — synkar primärtexten på alla annonser i en våg mot konfigen.
//
//   node update-copy.mjs waves/<kampanj>.config.mjs
//
// Läser varje annons i kampanjen, jämför message mot konfigens per koncept
// (matchat via adset-namn) och byter creative där texten skiljer sig.
// Media, headline, description, CTA, länk och enhancement-avstängningar behålls.

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
const ACT = 'act_1107817401910319'; // Magiborsten UK

const configPath = process.argv[2];
if (!TOKEN) die('META_ACCESS_TOKEN saknas.');
if (!configPath) die('Ange konfig: node update-copy.mjs waves/<kampanj>.config.mjs');
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
    if ((rateLimited || e.is_transient || res.status >= 500) && attempt < 10) {
      console.log(`  … väntar 60s (${e.code}, försök ${attempt})`);
      await sleep(60_000);
      continue;
    }
    throw new Error(`${path} → ${e.message || res.statusText}${e.error_user_msg ? ` — ${e.error_user_msg}` : ''}`);
  }
}

const adsetToMessage = Object.fromEntries(
  Object.values(cfg.concepts).map(c => [c.adset, c.message])
);

const campaigns = await api(`${ACT}/campaigns`, { params: { fields: 'name', limit: '200' } });
const campaign = campaigns.data?.find(c => c.name === cfg.campaignName);
if (!campaign) die(`Kampanjen "${cfg.campaignName}" hittades inte.`);

const ads = (await api(`${campaign.id}/ads`, { params: {
  fields: 'name,adset{name},creative{id,object_story_spec,degrees_of_freedom_spec}', limit: '200',
} })).data || [];
console.log(`${cfg.campaignName}: ${ads.length} annonser`);

let updated = 0, skipped = 0, failed = 0;
for (const ad of ads) {
  const target = adsetToMessage[ad.adset?.name];
  if (!target) { console.log(`· ${ad.name}: okänt adset "${ad.adset?.name}" — hoppar`); skipped++; continue; }
  try {
    const spec = ad.creative.object_story_spec;
    const data = spec.video_data || spec.link_data;
    if (data.message === target) { console.log(`· ${ad.name}: redan rätt text`); skipped++; continue; }
    data.message = target;
    const dof = ad.creative.degrees_of_freedom_spec || {};
    for (const dead of ['standard_enhancements', 'standard_enhancements_catalog'])
      delete dof.creative_features_spec?.[dead];
    const creative = await api(`${ACT}/adcreatives`, { method: 'POST', form: {
      name: `${ad.name}_creative_r1`,
      object_story_spec: JSON.stringify(spec),
      degrees_of_freedom_spec: JSON.stringify(dof),
    }});
    await api(ad.id, { method: 'POST', form: { creative: JSON.stringify({ creative_id: creative.id }) } });
    console.log(`✓ ${ad.name} → ny creative ${creative.id}`);
    updated++;
  } catch (e) {
    console.error(`✗ ${ad.name}: ${e.message}`);
    failed++;
  }
}
console.log(`\nKlart: ${updated} uppdaterade, ${skipped} hoppade, ${failed} fel.`);
