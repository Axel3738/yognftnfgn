#!/usr/bin/env node
// trippelkoll-kampanj.mjs — steg 10 i /ny-annonser för TackleBay SE: läs
// TILLBAKA hela kampanjen ur Meta och jämför mot butikens konfig.
//
//   NODE_USE_ENV_PROXY=1 node factory/output/fiskespohallare-4-pack/trippelkoll-kampanj.mjs
//
// Kontrollerar sida, pixel, budget/CBO, länk, status på tre nivåer, och att
// varje annons i vagplan.json (med: true) finns. Skriver inget i kontot.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { api, alla } from '../../../tools/meta-lib.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const plan = JSON.parse(readFileSync(join(HAR, 'vagplan.json'), 'utf8'));
const ACT = 'act_915422744950975';
const PAGE = '1283919631474370';
const PIXEL = '1079980541064515';
const LINK = 'https://tacklebay.se/products/fiskespohallare-4-pack';
const BUDGET = '100000';

const fel = [];
const ok = [];
const k = (await alla(`${ACT}/campaigns`, { fields: 'id,name,status,daily_budget,bid_strategy,objective' })).find((c) => c.name === plan.kampanj);
if (!k) { console.log(`❌ kampanjen "${plan.kampanj}" finns inte i kontot`); process.exit(1); }
(k.status === 'PAUSED' ? ok : fel).push(`kampanj status ${k.status}`);
(k.daily_budget === BUDGET ? ok : fel).push(`kampanj daily_budget ${k.daily_budget} (CBO, ska vara ${BUDGET})`);
(k.objective === 'OUTCOME_SALES' ? ok : fel).push(`objective ${k.objective}`);

const adsets = await alla(`${k.id}/adsets`, { fields: 'id,name,status,daily_budget,promoted_object,targeting,optimization_goal' });
for (const a of adsets) {
  const geo = a.targeting?.geo_locations?.countries?.join(',');
  (a.status === 'PAUSED' ? ok : fel).push(`adset ${a.name}: status ${a.status}`);
  (!a.daily_budget ? ok : fel).push(`adset ${a.name}: ${a.daily_budget ? `egen budget ${a.daily_budget} — FÖRBJUDET (CBO)` : 'ingen egen budget'}`);
  (String(a.promoted_object?.pixel_id) === PIXEL ? ok : fel).push(`adset ${a.name}: pixel ${a.promoted_object?.pixel_id}`);
  (geo === 'SE' ? ok : fel).push(`adset ${a.name}: geo ${geo}`);
  (a.optimization_goal === 'OFFSITE_CONVERSIONS' ? ok : fel).push(`adset ${a.name}: mål ${a.optimization_goal}`);
}

const ads = [];
for (const a of adsets) ads.push(...(await alla(`${a.id}/ads`, { fields: 'id,name,status,adset{name},creative{object_story_spec}' }, 25)));
const namnUppe = new Set(ads.map((x) => x.name));
let lankFel = 0, sidFel = 0, statusFel = 0;
for (const x of ads) {
  const s = x.creative?.object_story_spec ?? {};
  const d = s.link_data ?? s.video_data ?? {};
  const lank = d.link ?? d.call_to_action?.value?.link;
  if (lank !== LINK) { lankFel++; fel.push(`annons ${x.name}: länk ${lank}`); }
  if (String(s.page_id) !== PAGE) { sidFel++; fel.push(`annons ${x.name}: sida ${s.page_id}`); }
  if (x.status !== 'PAUSED') { statusFel++; fel.push(`annons ${x.name}: status ${x.status}`); }
}
ok.push(`${ads.length} annonser uppe · länk rätt på ${ads.length - lankFel} · sida rätt på ${ads.length - sidFel} · PAUSED på ${ads.length - statusFel}`);
const saknas = plan.plan.filter((r) => r.med && !namnUppe.has(r.malnamn)).map((r) => r.malnamn);
(saknas.length === 0 ? ok : fel).push(saknas.length === 0 ? `alla ${plan.plan.filter((r) => r.med).length} planerade annonser finns i kontot` : `saknas i kontot: ${saknas.join(', ')}`);
const extra = ads.filter((x) => !plan.plan.some((r) => r.malnamn === x.name)).map((x) => x.name);
if (extra.length) fel.push(`annonser i kampanjen som inte står i planen: ${extra.join(', ')}`);

console.log(`\nTRIPPELKOLL — ${plan.kampanj} (${k.id})`);
console.log(`  adsets: ${adsets.map((a) => `${a.name.split(' - ')[1]} (${ads.filter((x) => x.adset?.name === a.name).length})`).join(' · ')}`);
for (const r of ok) console.log(`  ✅ ${r}`);
for (const r of fel) console.log(`  ❌ ${r}`);
console.log(fel.length === 0 ? '\nALLT STÄMMER MOT KONFIGEN.' : `\n${fel.length} AVVIKELSER.`);
process.exit(fel.length === 0 ? 0 : 1);
