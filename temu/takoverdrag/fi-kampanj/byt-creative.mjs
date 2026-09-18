#!/usr/bin/env node
// Byter creative på befintliga annonser i en redan byggd kampanj (t.ex. nya videofiler eller rätt sida/länk),
// utan paus, namnbyte eller nytt adset. Annonsen förblir PAUSED. Meta-creatives är oföränderliga, så en ny
// skapas ur manifestets copy och annonsen pekas om.
//
//   node temu/takoverdrag/fi-kampanj/byt-creative.mjs --manifest <manifest.json> --annonser SE_NAMN,SE_NAMN [--torr]
//
// Nya videor laddas upp (state.videor nyckel = filväg) och miniatyrer likaså; state uppdateras så loggen stämmer.
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const API = 'https://graph.facebook.com/v23.0';
const T = process.env.META_ACCESS_TOKEN;
const args = process.argv.slice(2);
const val = (f, d = null) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : d; };
const TORR = args.includes('--torr');
const M = JSON.parse(readFileSync(val('--manifest'), 'utf8'));
const stateFil = val('--manifest') + '.state.json';
const st = JSON.parse(readFileSync(stateFil, 'utf8'));
const spara = () => writeFileSync(stateFil, JSON.stringify(st, null, 1));
const vill = val('--annonser').split(',');
async function get(p, params = {}) { const u = new URL(`${API}/${p}`); u.searchParams.set('access_token', T); for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v)); const r = await fetch(u); const j = await r.json().catch(() => ({})); if (!r.ok || j.error) throw new Error(`GET ${p}: ${JSON.stringify(j.error || j).replace(T, '<token>')}`); return j; }
async function post(p, body, form = null) {
  if (TORR) { console.log(`  (torr) POST ${p}`, JSON.stringify(body).slice(0, 140)); return { id: 'torr' }; }
  let init; if (form) { form.append('access_token', T); for (const [k, v] of Object.entries(body)) form.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v)); init = { method: 'POST', body: form }; }
  else { const f = new URLSearchParams(); f.append('access_token', T); for (const [k, v] of Object.entries(body)) f.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v)); init = { method: 'POST', body: f }; }
  const r = await fetch(`${API}/${p}`, init); const j = await r.json().catch(() => ({})); if (!r.ok || j.error) throw new Error(`POST ${p}: ${JSON.stringify(j.error || j).replace(T, '<token>')}`); return j;
}
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const acct = await get(M.konto, { fields: 'name,account_id' });
if (acct.account_id === '1867947880635861' || M.konto !== `act_${acct.account_id}`) throw new Error(`STOPP: fel konto ${acct.name}`);
for (const namn of vill) {
  const ad = M.annonser.find((a) => a.se_namn === namn); const adId = st.annonser[namn];
  if (!ad || !adId) { console.log('✗ okänd annons', namn); continue; }
  if (ad.typ === 'video') {
    if (!st.videor[ad.fil]) { const form = new FormData(); form.append('source', new Blob([readFileSync(ad.fil)], { type: 'video/mp4' }), path.basename(ad.fil)); const r = await post(`${M.konto}/advideos`, { title: path.basename(ad.fil), name: path.basename(ad.fil) }, form); st.videor[ad.fil] = r.id; spara(); console.log(`✓ Video: ${path.basename(ad.fil)} → ${r.id}`); }
    if (!st.bilder[ad.thumb]) { const form = new FormData(); form.append('filename', new Blob([readFileSync(ad.thumb)]), path.basename(ad.thumb)); const r = await post(`${M.konto}/adimages`, {}, form); st.bilder[ad.thumb] = TORR ? 'torr' : Object.values(r.images)[0].hash; spara(); }
    if (!TORR) for (let i = 0; i < 60; i++) { const s = await get(st.videor[ad.fil], { fields: 'status' }); if (s.status?.video_status === 'ready') break; await sov(5000); }
  } else if (!st.bilder[ad.fil]) { const form = new FormData(); form.append('filename', new Blob([readFileSync(ad.fil)]), path.basename(ad.fil)); const r = await post(`${M.konto}/adimages`, {}, form); st.bilder[ad.fil] = Object.values(r.images)[0].hash; spara(); }
  const cta = { type: 'SHOP_NOW', value: { link: M.link } };
  const spec = ad.typ === 'bild'
    ? { page_id: M.page_id, link_data: { image_hash: st.bilder[ad.fil], link: M.link, message: ad.text, name: ad.rubrik, description: ad.lankbeskrivning, call_to_action: cta } }
    : { page_id: M.page_id, video_data: { video_id: st.videor[ad.fil], image_hash: st.bilder[ad.thumb], message: ad.text, title: ad.rubrik, link_description: ad.lankbeskrivning, call_to_action: cta } };
  const c = await post(`${M.konto}/adcreatives`, { name: `${ad.fi_namn} ${new Date().toISOString().slice(0, 10)} v2`, object_story_spec: spec, ...(M.degrees_of_freedom_spec ? { degrees_of_freedom_spec: M.degrees_of_freedom_spec } : {}) });
  await post(adId, { creative: { creative_id: c.id } });
  st.creatives[namn] = c.id; spara();
  const efter = TORR ? { status: 'torr' } : await get(adId, { fields: 'status,effective_status,creative{object_story_spec{page_id}}' });
  console.log(`✓ ${ad.fi_namn}: ny creative ${c.id} · ${efter.status}/${efter.effective_status} · sida ${efter.creative?.object_story_spec?.page_id}`);
}
