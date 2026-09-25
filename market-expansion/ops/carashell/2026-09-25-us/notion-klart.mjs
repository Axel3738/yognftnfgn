#!/usr/bin/env node
// Notion-steget för US-rundan 2026-09-25 (13 videor): kommentar + Translated url på varje uppladdad rad,
// --status Approved BARA när radens flytta_till_approved är sant (regel 8: alla annonsmarknader
// bär annonsen). Läser resultat-meta.json. Idempotent: rader med notion_klart hoppas över.
//   node market-expansion/ops/carashell/2026-09-25-us/notion-klart.mjs [--torr]
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const torr = process.argv.includes('--torr');
const fil = join(HAR, 'resultat-meta.json');
const r = JSON.parse(readFileSync(fil, 'utf8'));
const jobb = JSON.parse(readFileSync(join(HAR, 'jobb.json'), 'utf8'));
const KONTO = jobb.konto, KAMPANJ = jobb.kampanj.namn;
for (const [n, v] of Object.entries(r)) {
  if (!v.resultat?.ok || v.notion_klart) continue;
  const ad = v.resultat.annons?.id ?? v.resultat.ad_id, adset = v.resultat.adset?.namn;
  const url = `https://www.facebook.com/adsmanager/manage/ads?act=${KONTO}&selected_ad_ids=${ad}`;
  const kom = `US ✅ ${n} live in ${KAMPANJ} (adset ${adset}), ad ${ad} — account Magiborsten UK ${KONTO}. ` +
    (v.typ === 'video' ? 'Dubbed with HeyGen (US English voice clone + lip sync), English word captions and a US end card; voice check passed. ' : 'US text layer, $199 / reg. $249, 90-day guarantee. ') +
    (v.flytta_till_approved ? 'Norway already carries this ad → all markets done → Approved. ' : 'Norway does not carry this ad yet → row stays in the queue for the NO round. ') + url;
  const argv = [join(ROT, 'tools', 'notion-aterkoppling.mjs'), v.page_id, '--kommentar', kom, '--egenskap', `Translated url=${url}`];
  if (v.flytta_till_approved) argv.push('--status', 'Approved');
  if (torr) argv.push('--torr');
  const p = spawnSync('node', argv, { encoding: 'utf8', cwd: ROT });
  const ut = (p.stdout + p.stderr).split('\n').filter((l) => l && !/UNDICI|trace-warn/.test(l));
  console.log(n, 'exit', p.status, ut.slice(-2).join(' | '));
  if (p.status === 0 && !torr) { v.notion_klart = true; writeFileSync(fil, JSON.stringify(r, null, 2)); }
}
