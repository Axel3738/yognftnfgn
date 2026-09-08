#!/usr/bin/env node
// kampanjkoll.mjs — trippelkollen för en OPS-kampanj (steg 9 i /ny-annonser).
//
//   node factory/kampanjkoll.mjs pipeline/waves/se-<butik>-video.config.mjs [--vantat 38]
//
// Läser TILLBAKA hela strukturen ur Meta och jämför mot vågkonfigen: konto,
// sida, pixel, budget, länk, geo och status på alla tre nivåer. Läser bara.
//
// ⚠️ Varför `--vantat` finns: en TOM kampanj klarar varje annonskontroll utan
// att någonsin köra den, och rapporten blir grön på noll annonser. Det höll på
// att hända 2026-09-08 när sidbehörigheten stoppade annonsskapandet men
// kampanj och adset redan fanns. Antalet kollas därför FÖRST.
// Utan flaggan räknas det ur konfigen.

import { säkerställProxy } from '../tools/meta-lib.mjs';
säkerställProxy();
import path from 'node:path';

const API = 'https://graph.facebook.com/v23.0';
const TOKEN = process.env.META_ACCESS_TOKEN;
if (!TOKEN) { console.error('✗ META_ACCESS_TOKEN saknas.'); process.exit(1); }

const argv = process.argv.slice(2);
const konfigar = argv.filter(a => !a.startsWith('--'));
if (!konfigar.length) { console.error('Ange minst en vågkonfig.'); process.exit(1); }
const iVantat = argv.indexOf('--vantat');
const vantatFlagga = iVantat >= 0 ? Number(argv[iVantat + 1]) : null;

async function hamta(p, params = {}) {
  const u = new URL(`${API}/${p}`);
  u.searchParams.set('access_token', TOKEN);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  let ut = [], r = await fetch(u), res = await r.json();
  if (res.error) { console.error('  FEL', p, res.error.message); return null; }
  if (!res.data) return res;
  ut.push(...res.data);
  while (res.paging?.next) {
    const rr = await fetch(res.paging.next); res = await rr.json();
    if (res.error) break; ut.push(...(res.data || []));
  }
  return ut;
}

// Alla konfigar ska peka på SAMMA kampanj — video och bild bygger i samma struktur.
const cfgs = [];
for (const f of konfigar) cfgs.push((await import(path.resolve(f))).default);
const c = cfgs[0];
for (const x of cfgs.slice(1)) {
  if (x.campaignName !== c.campaignName || x.act !== c.act) {
    console.error('✗ Konfigarna pekar på olika kampanjer/konton — de ska bygga i samma struktur.');
    process.exit(1);
  }
}
const vantatAnnonser = vantatFlagga ?? cfgs.reduce((s, x) => s + x.adsets.reduce((n, a) => n + (a.ads?.length ?? 1), 0), 0);
const vantatAdsets = new Set(cfgs.flatMap(x => x.adsets.map(a => a.name))).size;

let fel = 0;
const ok = (b, txt) => { console.log((b ? '  ✅ ' : '  ❌ ') + txt); if (!b) fel++; };

const kampanjer = await hamta(`${c.act}/campaigns`, { fields: 'id,name,status,daily_budget,objective', limit: 200 });
const k = kampanjer?.find(x => x.name === c.campaignName);
console.log(`\n=== 1. KAMPANJEN — ${c.campaignName} ===`);
if (!k) { console.log('  ❌ hittades inte i kontot'); process.exit(1); }
ok(k.status === c.campaignStatus, `status ${c.campaignStatus} (är: ${k.status})`);
ok(k.daily_budget === c.dailyBudget, `budget ${Number(c.dailyBudget) / 100} kr/dag (är: ${Number(k.daily_budget) / 100})`);

const adsets = await hamta(`${k.id}/adsets`, { fields: 'id,name,status,promoted_object,targeting', limit: 100 }) || [];
console.log(`\n=== 2. ADSETS ===`);
ok(adsets.length === vantatAdsets, `${vantatAdsets} adsets (är: ${adsets.length})`);
for (const a of adsets) {
  const geo = a.targeting?.geo_locations?.countries?.join(',') || '(ingen)';
  const brister = [];
  if (a.status !== c.adsetStatus) brister.push('status ' + a.status);
  if (a.promoted_object?.pixel_id !== c.pixel) brister.push('pixel ' + a.promoted_object?.pixel_id);
  if (geo !== c.country) brister.push('geo ' + geo);
  ok(brister.length === 0, `${a.name}${brister.length ? ' → ' + brister.join(', ') : ''}`);
}

const ads = await hamta(`${k.id}/ads`, { fields: 'id,name,status,creative{object_story_spec}', limit: 300 }) || [];
console.log(`\n=== 3. ANNONSER ===`);
ok(ads.length === vantatAnnonser, `${vantatAnnonser} annonser (är: ${ads.length})`);
let sidfel = 0, lankfel = 0, statusfel = 0;
const sidor = new Set(), lankar = new Set();
for (const a of ads) {
  const oss = a.creative?.object_story_spec || {};
  const dd = oss.video_data || oss.link_data || {};
  const lank = dd.call_to_action?.value?.link || dd.link || '';
  sidor.add(oss.page_id); lankar.add(lank);
  if (a.status !== c.adStatus) statusfel++;
  if (oss.page_id !== c.page) sidfel++;
  if (lank !== c.link) lankfel++;
}
if (ads.length) {
  ok(statusfel === 0, `alla ${c.adStatus} (avvikande: ${statusfel})`);
  ok(sidfel === 0, `alla på sida ${c.page} (sedda: ${[...sidor].join(', ')})`);
  ok(lankfel === 0, `alla länkar till ${c.link} (avvikande: ${lankfel})`);
}

console.log(`\n=== 4. RÖRDE KÖRNINGEN NÅGON ANNAN VERKSAMHET? ===`);
const andra = kampanjer.filter(x => x.name !== c.campaignName);
const vackta = andra.filter(x => x.status === 'ACTIVE');
ok(vackta.length === 0, `kontots övriga ${andra.length} kampanjer orörda${vackta.length ? ' → VÄCKTA: ' + vackta.map(x => x.name).join(', ') : ''}`);

console.log(fel === 0 ? '\n✅ TRIPPELKOLLEN GRÖN.' : `\n❌ ${fel} avvikelse(r) — delvis klart heter delvis klart.`);
process.exit(fel === 0 ? 0 : 1);
