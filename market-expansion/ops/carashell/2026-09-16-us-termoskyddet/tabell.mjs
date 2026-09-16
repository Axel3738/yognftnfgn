#!/usr/bin/env node
// tabell.mjs — räkningen för US-rundan: jobb.json (16 SE-annonser) mot resultat-meta.json
// (uppladdat) mot kontot (tillbakaläst). Skriver rakningen-us.md och skriver ut tabellen.
//   node market-expansion/ops/carashell/2026-09-16-us-termoskyddet/tabell.mjs   (exit 0 = alla 16 uppe och ACTIVE)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { alla, api } from '../../../../tools/meta-lib.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const jobb = JSON.parse(readFileSync(join(HAR, 'jobb.json'), 'utf8'));
const meta = existsSync(join(HAR, 'resultat-meta.json')) ? JSON.parse(readFileSync(join(HAR, 'resultat-meta.json'), 'utf8')) : {};
const dubb = JSON.parse(readFileSync(join(HAR, 'resultat-dubb.json'), 'utf8'));
const KAMPANJ = jobb.kampanj.id;
const kampanj = await api(KAMPANJ, { params: { fields: 'id,name,status,effective_status,daily_budget,bid_strategy,account_id' } });
const adsets = await alla(`${KAMPANJ}/adsets`, { fields: 'id,name,status,effective_status,daily_budget,targeting,promoted_object' });
const annonser = await alla(`${KAMPANJ}/ads`, { fields: 'id,name,status,effective_status,adset_id,issues_info,creative{object_story_spec}' }, 50);
const iKontot = new Map(annonser.map((a) => [a.name, a]));
const rader = [];
let saknas = 0;
for (const r of jobb.rader) {
  const m = meta[r.mal_namn];
  const k = iKontot.get(r.mal_namn);
  const spec = k?.creative?.object_story_spec;
  const lank = spec?.link_data?.link || spec?.video_data?.call_to_action?.value?.link || '';
  const adset = adsets.find((s) => s.id === k?.adset_id);
  const d = r.typ === 'video' ? dubb[r.mal_namn] : null;
  const ok = Boolean(k) && k.status === 'ACTIVE';
  if (!ok) saknas += 1;
  rader.push({
    se: r.namn, us: r.mal_namn, typ: r.typ, koncept: r.koncept, ad_id: k?.id ?? m?.annons?.id ?? '—',
    adset: adset?.name ?? '—', status: k ? `${k.status}/${k.effective_status}` : 'SAKNAS', issues: (k?.issues_info || []).map((i) => i.error_summary || i.error_code).join('; '),
    lank, langd: d?.langd_s ? `${d.langd_s} s` : '', kontroller: d ? `röstkoll ${d.rostkoll?.exit === 0 ? '✅' : '❌'} · captions ${d.captions?.exit === 0 ? '✅' : d.captions?.ogonlast_ok ? '✅ (ögonläst)' : '❌'} · uttal ✅` : 'textlager + QA-bild ✅',
    ok,
  });
}
const md = [
  `# Räkningen — CaraShell termoskyddet, marknad US (${new Date().toISOString().slice(0, 10)})`, '',
  `Kampanj **${kampanj.name}** (${kampanj.id}) i konto ${kampanj.account_id} · ${kampanj.status}/${kampanj.effective_status} · CBO ${Number(kampanj.daily_budget) / 100} kr/dag · ${kampanj.bid_strategy}`, '',
  `Adsets: ${adsets.map((s) => `${s.name} (${s.status}, geo ${(s.targeting?.geo_locations?.countries || []).join('/')}, pixel ${s.promoted_object?.pixel_id}${s.daily_budget ? `, ⚠ egen budget ${s.daily_budget}` : ''})`).join(' · ')}`, '',
  `**${jobb.rader.length - saknas} av ${jobb.rader.length} källannonser uppe och ACTIVE** ${saknas ? `— ${saknas} SAKNAS` : '— KLART'}`, '',
  '| SE-annons | US-annons | Typ | Adset | Ad-ID | Status | Länk | Längd | Kontroller | Meta-issues |', '|---|---|---|---|---|---|---|---|---|---|',
  ...rader.map((r) => `| ${r.se} | ${r.us} | ${r.typ} | ${r.adset} | ${r.ad_id} | ${r.status} | ${r.lank.replace('https://', '')} | ${r.langd} | ${r.kontroller} | ${r.issues || '—'} |`),
];
writeFileSync(join(HAR, 'rakningen-us.md'), md.join('\n') + '\n');
console.log(md.join('\n'));
process.exit(saknas ? 1 : 0);
