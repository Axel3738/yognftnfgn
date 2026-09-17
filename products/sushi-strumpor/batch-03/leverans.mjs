#!/usr/bin/env node
// leverans.mjs — leveransrundan för Sushi-Strumpors batch #3: lägger de färdiga
// bildannonserna i den kampanj som REDAN KÖR i nya kungen, i ETT adset utan egen
// budget (Axels beslut 2026-09-17: "inte en ny kampanj, inga adsetbudgetar, alla
// bildannonser i ett adset" — uttryckligt undantag från regel 11, samma slags
// undantag som /notionkorning har för Bäverbutiken).
//
//   node products/sushi-strumpor/batch-03/leverans.mjs --bilder <mapp> [--torr] [--bara 029,030]
//
// Steg: 1 adset (idempotent på namn) → 2 bild upp (adimages) → 3 creative →
// 4 annons ACTIVE → 5 LÄS TILLBAKA. Copy läses ur varje BRIEF.md (Primary text A,
// första Meta-rubriken, beskrivningen). Kräver META_ACCESS_TOKEN.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const KONTO = 'act_730973156224390';                 // nya kungen
const KAMPANJ = '120251217860260023';                // MATSTRUMP_SALES_20260826 (CBO, ACTIVE)
const MALL_ADSET = '120251218829760023';             // broad_advplus_purchase_bilder — inställningarna kopieras
const MALL_ANNONS = '120251218963520023';            // d3 — degrees_of_freedom_spec kopieras
const ADSET_NAMN = 'broad_advplus_purchase_batch03_bilder';
const SIDA = '820358954504320';
const LANK = 'https://matstrumpor.se/products/sushi-strumpor';
const API = 'https://graph.facebook.com/v21.0';
const T = process.env.META_ACCESS_TOKEN;
if (!T) { console.error('META_ACCESS_TOKEN saknas'); process.exit(1); }

const arg = (f) => { const i = process.argv.indexOf(f); return i === -1 ? null : process.argv[i + 1]; };
const torr = process.argv.includes('--torr');
const bilder = arg('--bilder'); if (!bilder) { console.error('Ange --bilder <mapp>'); process.exit(1); }
const bara = arg('--bara')?.split(',');
const ROT = new URL('.', import.meta.url).pathname;

async function get(path, params = {}) {
  const u = new URL(`${API}/${path}`); for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v); u.searchParams.set('access_token', T);
  const r = await fetch(u); const d = await r.json(); if (d.error) throw new Error(`GET ${path}: ${d.error.message}`); return d;
}
async function post(path, body) {
  const fd = new FormData(); for (const [k, v] of Object.entries(body)) fd.append(k, typeof v === 'string' || v instanceof Blob ? v : JSON.stringify(v)); fd.append('access_token', T);
  const r = await fetch(`${API}/${path}`, { method: 'POST', body: fd }); const d = await r.json(); if (d.error) throw new Error(`POST ${path}: ${d.error.message} (${d.error.error_user_msg || ''})`); return d;
}

// ---- copy ur briefen
function cell(md, rubrik) {
  const i = md.indexOf(rubrik); if (i === -1) throw new Error(`hittar inte "${rubrik}"`);
  const rader = md.slice(i).split('\n'); const data = rader.find((r, k) => k > 0 && r.startsWith('|') && !/^\|\s*Swedish/.test(r) && !/^\|---/.test(r));
  return data.split('|')[1].trim().replace(/<br>/g, '\n');
}
const mappar = readdirSync(join(ROT, 'image-ads')).filter((m) => /^\d{3}-/.test(m));
const annonser = mappar.map((m) => {
  const md = readFileSync(join(ROT, 'image-ads', m, 'BRIEF.md'), 'utf8');
  const namn = md.match(/^# (MATSTRUMP_\S+)/m)[1];
  return { n: m.slice(0, 3), namn, text: cell(md, '**Primary text A (use this):**'), rubrik: cell(md, '**Headline (first = use this):**'), beskrivning: cell(md, '**Description:**'), fil: join(bilder, `${namn}_4x5.png`) };
}).filter((a) => !bara || bara.includes(a.n));

// ---- 1. adset (idempotent)
const mall = await get(MALL_ADSET, { fields: 'targeting,promoted_object,optimization_goal,billing_event,attribution_spec,destination_type,dsa_beneficiary,dsa_payor' });
const dof = (await get(MALL_ANNONS, { fields: 'creative{degrees_of_freedom_spec}' })).creative.degrees_of_freedom_spec;
const befintliga = (await get(`${KAMPANJ}/adsets`, { fields: 'id,name,status', limit: 100 })).data;
let adset = befintliga.find((a) => a.name === ADSET_NAMN);
console.log(`Kampanj ${KAMPANJ}, ${befintliga.length} adsets. ${adset ? 'Adset finns: ' + adset.id : 'Adset saknas — skapas.'}`);
if (!adset && !torr) {
  adset = await post(`${KONTO}/adsets`, { name: ADSET_NAMN, campaign_id: KAMPANJ, status: 'ACTIVE', targeting: mall.targeting, promoted_object: mall.promoted_object,
    optimization_goal: mall.optimization_goal, billing_event: mall.billing_event, attribution_spec: mall.attribution_spec, destination_type: mall.destination_type,
    dsa_beneficiary: mall.dsa_beneficiary, dsa_payor: mall.dsa_payor });
  console.log('✓ adset skapat', adset.id);
}
const redan = adset ? (await get(`${adset.id}/ads`, { fields: 'id,name,status', limit: 100 })).data : [];

// ---- 2–4. per annons
const utfall = [];
for (const a of annonser) {
  if (redan.find((r) => r.name === a.namn)) { console.log('finns redan', a.namn); utfall.push({ ...a, lage: 'fanns' }); continue; }
  console.log(`\n${a.namn}\n  rubrik: ${a.rubrik}\n  besk:   ${a.beskrivning}\n  text:   ${a.text.split('\n')[0]} …`);
  if (torr) { utfall.push({ ...a, lage: 'torr' }); continue; }
  const bild = new File([readFileSync(a.fil)], `${a.namn}_4x5.png`, { type: 'image/png' });
  const up = await post(`${KONTO}/adimages`, { filename: bild });
  const hash = Object.values(up.images)[0].hash;
  const cr = await post(`${KONTO}/adcreatives`, { name: `${a.namn} 2026-09-17`, degrees_of_freedom_spec: dof,
    object_story_spec: { page_id: SIDA, link_data: { link: LANK, message: a.text, name: a.rubrik, description: a.beskrivning, image_hash: hash, call_to_action: { type: 'SHOP_NOW', value: { link: LANK } } } } });
  const ad = await post(`${KONTO}/ads`, { name: a.namn, adset_id: adset.id, creative: { creative_id: cr.id }, status: 'ACTIVE' });
  console.log(`  ✓ bild ${hash.slice(0, 8)} · creative ${cr.id} · annons ${ad.id}`);
  utfall.push({ ...a, lage: 'skapad', hash, creative_id: cr.id, ad_id: ad.id });
}

// ---- 5. tillbakaläsning
if (!torr && adset) {
  const tillbaka = (await get(`${adset.id}/ads`, { fields: 'id,name,status,effective_status,creative{id}', limit: 100 })).data;
  console.log(`\nTillbakaläsning: adset ${adset.id} har ${tillbaka.length} annonser`);
  for (const t of tillbaka) console.log(`  ${t.effective_status.padEnd(16)} ${t.id} ${t.name}`);
  writeFileSync(join(ROT, 'leverans-2026-09-17.json'), JSON.stringify({ adset, utfall, tillbaka }, null, 2) + '\n');
}
