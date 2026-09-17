#!/usr/bin/env node
// Notion-återkoppling för US-bildannonserna, CaraShell termoskyddet batch #2, 2026-09-17.
// Läser resultat-meta.json (ad-id per annons) + jobb.json (page_id, flytta_till_approved)
// och kör tools/notion-aterkoppling.mjs per rad: kommentar + Translated url, och
// --status Approved BARA när kön sa flytta_till_approved (regel 8).
//   node market-expansion/ops/carashell/2026-09-17-us-termoskyddet/notion-aterkoppling.mjs [--skarpt]
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const skarpt = process.argv.includes('--skarpt');
const jobb = JSON.parse(readFileSync(join(HAR, 'jobb.json'), 'utf8'));
const meta = JSON.parse(readFileSync(join(HAR, 'resultat-meta.json'), 'utf8'));
const ut = {};
for (const r of jobb.rader) {
  const m = meta[r.mal_namn]?.resultat;
  if (!m?.ok || !m.annons?.id) { ut[r.mal_namn] = { hoppad: 'ingen uppladdning' }; console.log(r.mal_namn, 'HOPPAD'); continue; }
  const url = `https://www.facebook.com/adsmanager/manage/ads?act=${jobb.konto}&selected_ad_ids=${m.annons.id}`;
  const kommentar = `US ✅ ${r.mal_namn} live in ${jobb.kampanj.namn} (adset ${m.adset.namn}), ad ${m.annons.id}. US image re-rendered from the base photo with the English text layer ($99 / $124 / −20%, 83 × 67 in, 90-day guarantee); the US file is not attached here — check it in Ads Manager: ${url}`;
  const argv = [join(ROT, 'tools', 'notion-aterkoppling.mjs'), r.page_id, '--kommentar', kommentar, '--egenskap', `Translated url=${url}`];
  if (r.flytta_till_approved) argv.push('--status', 'Approved');
  if (!skarpt) argv.push('--torr');
  const p = spawnSync('node', argv, { encoding: 'utf8', cwd: ROT });
  const logg = (p.stdout + p.stderr).split('\n').filter((l) => l && !/UNDICI|trace-warnings/.test(l));
  ut[r.mal_namn] = { page_id: r.page_id, ad_id: m.annons.id, status: r.flytta_till_approved ? 'Approved' : '(orörd)', exit: p.status, skarpt, logg: logg.slice(-4) };
  console.log(`=== ${r.mal_namn} exit ${p.status} → ${logg.slice(-3).join(' | ')}`);
}
writeFileSync(join(HAR, skarpt ? 'resultat-notion.json' : 'resultat-notion-torr.json'), JSON.stringify(ut, null, 2));
if (Object.values(ut).some((v) => v.exit && v.exit !== 0)) process.exit(1);
