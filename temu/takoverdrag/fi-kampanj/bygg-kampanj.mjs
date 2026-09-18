#!/usr/bin/env node
// Bygger den finska Meta-kampanjen för taköverdraget i Magiborsten FI — ALLT PAUSED.
//
//   node temu/takoverdrag/fi-kampanj/bygg-kampanj.mjs --manifest <fil.json> [--torr] [--verifiera]
//
// Manifestet (skrivs av sessionen, inga hemligheter):
//   { konto: 'act_…', page_id, pixel_id, link, kampanjnamn, dagsbudget_ore, adsets: [{ se_namn, fi_namn }],
//     annonser: [{ se_namn, fi_namn, adset: <se_namn>, typ: 'bild'|'video', fil, rubrik, text, lankbeskrivning }] }
// Spärrar: kontot måste vara Magiborsten FI (namn + id läses tillbaka), SE-kontot rörs aldrig, inget
// skapas med annan status än PAUSED, och en kampanj med samma namn får inte redan finnas (idempotens
// via state-filen <manifest>.state.json — körs skriptet om fortsätter det där det slutade).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const API = 'https://graph.facebook.com/v23.0';
const T = process.env.META_ACCESS_TOKEN;
if (!T) throw new Error('Saknar META_ACCESS_TOKEN.');
const args = process.argv.slice(2);
const val = (f, d = null) => { const i = args.indexOf(f); return i !== -1 ? args[i + 1] : d; };
const TORR = args.includes('--torr');
const M = JSON.parse(readFileSync(val('--manifest'), 'utf8'));
const stateFil = val('--manifest') + '.state.json';
const st = existsSync(stateFil) ? JSON.parse(readFileSync(stateFil, 'utf8')) : { adsets: {}, bilder: {}, videor: {}, creatives: {}, annonser: {} };
const spara = () => writeFileSync(stateFil, JSON.stringify(st, null, 1));

async function get(p, params = {}) {
  const u = new URL(`${API}/${p}`); u.searchParams.set('access_token', T);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  const r = await fetch(u); const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`GET ${p}: ${JSON.stringify(j.error || j).replace(T, '<token>')}`);
  return j;
}
async function post(p, body, form = null) {
  if (TORR) { console.log(`  (torr) POST ${p}`, JSON.stringify(body).slice(0, 160)); return { id: `torr_${Math.random().toString(36).slice(2, 8)}` }; }
  let init;
  if (form) { form.append('access_token', T); for (const [k, v] of Object.entries(body)) form.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v)); init = { method: 'POST', body: form }; }
  else { const f = new URLSearchParams(); f.append('access_token', T); for (const [k, v] of Object.entries(body)) f.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v)); init = { method: 'POST', body: f }; }
  const r = await fetch(`${API}/${p}`, init); const j = await r.json().catch(() => ({}));
  if (!r.ok || j.error) throw new Error(`POST ${p}: ${JSON.stringify(j.error || j).replace(T, '<token>')}`);
  return j;
}
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  // ---- spärr 1: rätt konto
  const acct = await get(M.konto, { fields: 'name,account_id,currency,account_status' });
  // Spärr: kontot måste vara exakt det manifestet pekar på (id + namn) och aldrig SE-kontot. Två armar sedan
  // A/B-testet 2026-09-18: Magiborsten FI (Bäver-armen) och MagiBorsten DK = OPS-kontot (CaraShell-armen).
  const vantat = M.kontonamn || 'Magiborsten FI';
  if (acct.account_id === '1867947880635861' || M.konto !== `act_${acct.account_id}` || acct.name.toLowerCase() !== vantat.toLowerCase()) throw new Error(`STOPP: fel konto ${acct.name} (${acct.account_id}) — manifestet väntar ${vantat} (${M.konto}).`);
  console.log(`Konto: ${acct.name} (${acct.account_id}) ${acct.currency} status ${acct.account_status}`);
  // ---- spärr 2: pixel och sida finns på kontot/token
  const pix = await get(`${M.konto}/adspixels`, { fields: 'id,name' });
  if (!pix.data.some((p) => p.id === M.pixel_id)) throw new Error(`STOPP: pixeln ${M.pixel_id} finns inte på ${acct.name}.`);
  const pages = await get('me/accounts', { fields: 'id,name', limit: 200 });
  const page = pages.data.find((p) => p.id === M.page_id);
  if (!page) throw new Error(`STOPP: sidan ${M.page_id} finns inte på token.`);
  console.log(`Pixel ${M.pixel_id} (${pix.data.find((p) => p.id === M.pixel_id).name}), sida ${page.name} (${page.id})`);

  // ---- kampanj (idempotent på namn)
  if (!st.kampanj) {
    const fanns = await get(`${M.konto}/campaigns`, { fields: 'id,name,status', limit: 200 });
    const dubb = fanns.data.find((c) => c.name === M.kampanjnamn);
    if (dubb) { st.kampanj = dubb.id; console.log(`· Kampanjen finns redan: ${dubb.name} (${dubb.id}, ${dubb.status})`); }
    else {
      const c = await post(`${M.konto}/campaigns`, {
        name: M.kampanjnamn, objective: 'OUTCOME_SALES', status: 'PAUSED', special_ad_categories: [],
        daily_budget: M.dagsbudget_ore, bid_strategy: 'LOWEST_COST_WITHOUT_CAP', is_adset_budget_sharing_enabled: false,
      });
      st.kampanj = c.id; console.log(`✓ Kampanj PAUSED: ${M.kampanjnamn} (${c.id})`);
    }
    spara();
  }
  // ---- adsets
  for (const a of M.adsets) {
    if (st.adsets[a.se_namn]) continue;
    const r = await post(`${M.konto}/adsets`, {
      name: a.fi_namn, campaign_id: st.kampanj, status: 'PAUSED',
      billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS',
      promoted_object: { pixel_id: M.pixel_id, custom_event_type: 'PURCHASE' },
      attribution_spec: [{ event_type: 'CLICK_THROUGH', window_days: 7 }],
      targeting: { geo_locations: { countries: ['FI'], location_types: ['home', 'recent'] }, age_min: 18, age_max: 65, targeting_automation: { advantage_audience: 1 } },
      // EU:s DSA kräver annonsör + betalare på varje adset (Meta-fel 3858081 utan dem, mätt 2026-09-18).
      // Värdena läses ur manifestet — samma som SE-kampanjens 10 och FI-kontots 19 befintliga adsets.
      dsa_beneficiary: M.dsa.beneficiary, dsa_payor: M.dsa.payor,
    });
    st.adsets[a.se_namn] = r.id; spara(); console.log(`✓ Adset PAUSED: ${a.fi_namn} (${r.id})`);
  }
  // ---- media
  for (const ad of M.annonser) {
    if (ad.typ === 'bild' && !st.bilder[ad.fil]) {
      const form = new FormData();
      form.append('filename', new Blob([readFileSync(ad.fil)]), path.basename(ad.fil));
      const r = await post(`${M.konto}/adimages`, {}, form);
      const img = Object.values(r.images || {})[0];
      st.bilder[ad.fil] = TORR ? 'torr' : img.hash; spara(); console.log(`✓ Bild: ${path.basename(ad.fil)} → ${st.bilder[ad.fil]}`);
    }
    if (ad.typ === 'video' && !st.videor[ad.fil]) {
      const form = new FormData();
      form.append('source', new Blob([readFileSync(ad.fil)], { type: 'video/mp4' }), path.basename(ad.fil));
      const r = await post(`${M.konto}/advideos`, { title: path.basename(ad.fil), name: path.basename(ad.fil) }, form);
      st.videor[ad.fil] = r.id; spara(); console.log(`✓ Video: ${path.basename(ad.fil)} → ${r.id}`);
    }
    if (ad.typ === 'video' && ad.thumb && !st.bilder[ad.thumb]) {
      const form = new FormData();
      form.append('filename', new Blob([readFileSync(ad.thumb)]), path.basename(ad.thumb));
      const r = await post(`${M.konto}/adimages`, {}, form);
      const img = Object.values(r.images || {})[0];
      st.bilder[ad.thumb] = TORR ? 'torr' : img.hash; spara(); console.log(`✓ Miniatyr: ${path.basename(ad.thumb)} → ${st.bilder[ad.thumb]}`);
    }
  }
  // vänta in videobearbetningen
  if (!TORR) for (const [fil, id] of Object.entries(st.videor)) {
    for (let i = 0; i < 60; i++) {
      const s = await get(id, { fields: 'status' });
      if (s.status?.video_status === 'ready') break;
      if (s.status?.video_status === 'error') throw new Error(`Video ${fil} fick status error hos Meta.`);
      await sov(5000);
    }
  }
  // ---- creatives + annonser
  for (const ad of M.annonser) {
    if (st.annonser[ad.se_namn]) continue;
    const adsetId = st.adsets[ad.adset];
    if (!adsetId) throw new Error(`Adset saknas för ${ad.se_namn}: ${ad.adset}`);
    let spec;
    const cta = { type: 'SHOP_NOW', value: { link: M.link } };
    if (ad.typ === 'bild') {
      spec = { page_id: M.page_id, link_data: { image_hash: st.bilder[ad.fil], link: M.link, message: ad.text, name: ad.rubrik, description: ad.lankbeskrivning, call_to_action: cta } };
    } else {
      spec = { page_id: M.page_id, video_data: { video_id: st.videor[ad.fil], image_hash: st.bilder[ad.thumb], message: ad.text, title: ad.rubrik, link_description: ad.lankbeskrivning, call_to_action: cta } };
    }
    if (M.instagram_user_id) spec.instagram_user_id = M.instagram_user_id;
    if (!st.creatives[ad.se_namn]) {
      const c = await post(`${M.konto}/adcreatives`, {
        name: `${ad.fi_namn} ${new Date().toISOString().slice(0, 10)}`, object_story_spec: spec,
        ...(M.degrees_of_freedom_spec ? { degrees_of_freedom_spec: M.degrees_of_freedom_spec } : {}),
      });
      st.creatives[ad.se_namn] = c.id; spara();
    }
    const r = await post(`${M.konto}/ads`, { name: ad.fi_namn, adset_id: adsetId, creative: { creative_id: st.creatives[ad.se_namn] }, status: 'PAUSED' });
    st.annonser[ad.se_namn] = r.id; spara(); console.log(`✓ Annons PAUSED: ${ad.fi_namn} (${r.id})`);
  }
  // ---- verifiering: effective_status på alla tre nivåer
  if (!TORR) {
    const c = await get(st.kampanj, { fields: 'name,status,effective_status,daily_budget' });
    const as = await get(`${st.kampanj}/adsets`, { fields: 'name,status,effective_status', limit: 100 });
    const ads = await get(`${st.kampanj}/ads`, { fields: 'name,status,effective_status', limit: 200 });
    const ej = [c, ...as.data, ...ads.data].filter((x) => x.effective_status !== 'PAUSED' && x.status !== 'PAUSED');
    console.log(`\nVerifiering: kampanj ${c.effective_status} (budget ${c.daily_budget} öre/dag) · ${as.data.length} adsets · ${ads.data.length} annonser · ej PAUSED: ${ej.length}`);
    st.verifiering = { kampanj: c, adsets: as.data.map((x) => [x.name, x.effective_status]), annonser: ads.data.map((x) => [x.name, x.effective_status, x.id]) };
    spara();
    if (ej.length) { console.log('⚠️ EJ PAUSED:', ej.map((x) => x.name)); process.exitCode = 2; }
  }
}
main().catch((e) => { console.error('✗', e.message); process.exitCode = 1; });
