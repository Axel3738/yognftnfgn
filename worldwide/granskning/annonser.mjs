// annonser.mjs — alla BEAVERSTORE_WW_-annonser i Magiborsten UK, läs-bart.
//
//   node worldwide/granskning/annonser.mjs [--ut fil.json] [--utan-lankar]
//
// Per annons: status, effektiv status, granskning (ad_review_feedback), länken, texten,
// rubriken, adsetets länder, dagens spend/köp — och regler: länken går till en av urvalets
// produkter på beaverstoreco.com, texten är engelska, utan butiksnamn, utan kronor, utan
// påhittad brådska. Länken läses som kund i två av adsetets länder (200 + rätt produkt).
// ⛔ Rör aldrig något i kontot: bara GET.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { alla, api } from '../../tools/meta-lib.mjs';
import { vy } from './matris.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const K = JSON.parse(readFileSync(join(ROT, '..', 'annonser', 'konto.json'), 'utf8'));
const U = JSON.parse(readFileSync(join(ROT, '..', 'urval.json'), 'utf8'));
const a = process.argv.slice(2);
const arg = (n, d = null) => (a.includes(n) ? a[a.indexOf(n) + 1] : d);

const HANDLES = new Set(U.produkter.filter((p) => !p.under).map((p) => p.handle));
const SVENSKA = /(?<![\p{L}])(och|för|med|inte|köp|frakt|dagar|varför|som|att|är|på|av|din|ditt|dina)(?![\p{L}])|[åäöÅÄÖ]/u;
const BRADSKA = /\b(today only|last chance|only \d+ left|ends (tonight|today|soon)|limited time|hurry|selling out|almost gone|while (stocks|supplies) last|sale ends|final hours|don'?t miss out|act now|before it'?s gone|countdown)\b/i;
const BUTIK = /b[äa]verbutik|beaver\s*store|beavershop|carashell|\.se\b|baverbutiken/i;
const KRONOR = /(?<![\p{L}])(kr|sek|kronor)(?![\p{L}])|\d\s?:-/iu;

export function domText({ text, rubrik, beskrivning }) {
  const fel = [];
  const alla = [text, rubrik, beskrivning].filter(Boolean).join('\n');
  if (!alla.trim()) fel.push('ingen text');
  if (SVENSKA.test(alla.replace(/Göteborg|Gothenburg/g, ''))) fel.push(`svenska? "${(alla.match(SVENSKA) ?? [''])[0]}"`);
  if (BUTIK.test(alla)) fel.push(`butiksnamn/domän: "${alla.match(BUTIK)[0]}"`);
  if (KRONOR.test(alla)) fel.push(`kronor: "${alla.match(KRONOR)[0]}"`);
  if (BRADSKA.test(alla)) fel.push(`brådska: "${alla.match(BRADSKA)[0]}"`);
  if (/\b30[- ]day|30 days\b/i.test(alla)) fel.push('30 dagar (butiken lovar 14)');
  if (/klarna|swish/i.test(alla)) fel.push('Klarna/Swish');
  if (/[—–]/.test(alla)) fel.push('tankstreck');
  return fel;
}

async function huvud() {
  const act = `act_${K.konto}`;
  const kampanjer = (await alla(`${act}/campaigns`, { fields: 'id,name,status,effective_status,daily_budget', filtering: [{ field: 'name', operator: 'CONTAIN', value: 'BEAVERSTORE_WW' }] })).filter((c) => c.name.startsWith('BEAVERSTORE_WW'));
  const ut = [];
  for (const c of kampanjer) {
    const adsets = await alla(`${c.id}/adsets`, { fields: 'id,name,status,effective_status,targeting{geo_locations},issues_info,learning_stage_info' });
    const ads = await alla(`${c.id}/ads`, { fields: 'id,name,status,effective_status,configured_status,adset_id,ad_review_feedback,issues_info,creative{id,object_story_spec,asset_feed_spec,effective_object_story_id,call_to_action_type,title,body,link_url,object_type}' }, 50);
    const ins = await alla(`${c.id}/insights`, { level: 'ad', fields: 'ad_id,spend,actions,purchase_roas,impressions,clicks', date_preset: 'today' }).catch(() => []);
    const insMap = new Map(ins.map((x) => [x.ad_id, x]));
    for (const ad of ads) {
      const oss = ad.creative?.object_story_spec ?? {};
      const ld = oss.link_data ?? {}, vd = oss.video_data ?? {};
      const lank = ld.link ?? vd.call_to_action?.value?.link ?? ld.call_to_action?.value?.link ?? ad.creative?.link_url ?? null;
      const text = ld.message ?? vd.message ?? ad.creative?.body ?? '';
      const rubrik = ld.name ?? vd.title ?? ad.creative?.title ?? '';
      const beskrivning = ld.description ?? vd.link_description ?? '';
      const as = adsets.find((x) => x.id === ad.adset_id);
      const lander = as?.targeting?.geo_locations?.countries ?? [];
      const fel = domText({ text, rubrik, beskrivning });
      let handle = null;
      try { const u = new URL(lank); if (u.host !== 'beaverstoreco.com') fel.push(`fel domän ${u.host}`); handle = /\/products\/([^/?#]+)/.exec(u.pathname)?.[1] ?? null; if (!HANDLES.has(handle)) fel.push(`länken går inte till en urvalsprodukt: ${u.pathname}`); } catch { fel.push(`ingen länk: ${lank}`); }
      if (ad.effective_status !== 'ACTIVE') fel.push(`effective_status ${ad.effective_status}`);
      if (ad.ad_review_feedback && Object.keys(ad.ad_review_feedback).length) fel.push(`granskning: ${JSON.stringify(ad.ad_review_feedback).slice(0, 300)}`);
      if (ad.issues_info?.length) fel.push(`issues: ${ad.issues_info.map((i) => `${i.error_code} ${i.error_summary}`).join('; ')}`);
      const i = insMap.get(ad.id);
      const kop = Number(i?.actions?.find((x) => x.action_type === 'omni_purchase' || x.action_type === 'purchase')?.value ?? 0);
      ut.push({ kampanj: c.name, kampanj_status: c.effective_status, adset: as?.name, adset_status: as?.effective_status, lander, id: ad.id, namn: ad.name, status: ad.status, effective_status: ad.effective_status, typ: vd.video_id ? 'video' : 'bild', lank, handle, rubrik, text, beskrivning, spend_idag: Number(i?.spend ?? 0), kop_idag: kop, visningar_idag: Number(i?.impressions ?? 0), fel });
    }
  }
  // Länkarna som kund: varje unik länk i två av annonsernas länder.
  if (!a.includes('--utan-lankar')) {
    const unika = new Map();
    for (const x of ut) if (x.handle) unika.set(x.handle, [...new Set([...(unika.get(x.handle) ?? []), ...x.lander])]);
    const lankdom = new Map();
    for (const [h, lander] of unika) {
      const prov = [lander[0], lander[Math.floor(lander.length / 2)], lander[lander.length - 1]].filter((v, i, s) => v && s.indexOf(v) === i).slice(0, 3);
      const res = [];
      for (const land of prov) { const v = await vy(land, 'en', `/products/${h}`); res.push({ land, status: v.status, valuta: v.valuta, pris: v.pris, titel: v.produkttitel, fel: v.fel }); }
      lankdom.set(h, res);
    }
    for (const x of ut) {
      x.lankkoll = lankdom.get(x.handle) ?? [];
      for (const r of x.lankkoll) if (r.status !== 200 || !r.titel) x.fel.push(`länken som kund i ${r.land}: ${r.status}`);
    }
  }
  const fel = ut.filter((x) => x.fel.length);
  for (const x of ut) console.log(`${x.fel.length ? '❌' : '✅'} ${x.kampanj.slice(15, 45).padEnd(30)} ${x.namn.slice(0, 40).padEnd(40)} ${x.effective_status.padEnd(14)} ${x.spend_idag.toFixed(0).padStart(5)} kr ${x.kop_idag} köp${x.fel.length ? ` · ${x.fel.join(' · ')}` : ''}`);
  console.log(`\n${kampanjer.length} kampanjer · ${ut.length} annonser · ${fel.length} med anmärkning · spend i dag ${ut.reduce((s, x) => s + x.spend_idag, 0).toFixed(0)} kr, ${ut.reduce((s, x) => s + x.kop_idag, 0)} köp`);
  for (const c of kampanjer) console.log(`  ${c.effective_status.padEnd(8)} ${c.name} ${Number(c.daily_budget ?? 0) / 100} kr/dag`);
  if (arg('--ut')) writeFileSync(arg('--ut'), JSON.stringify({ kampanjer, annonser: ut }, null, 1));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
