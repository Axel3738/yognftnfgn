#!/usr/bin/env node
// notion-aterkoppling.mjs — en kommentar per rad om vad som gick live, och
// `Translated url` till Ads Manager. Ingen status ändras: ingen av raderna bär
// annonsen i ALLA annonsmarknader än (NO saknas på alla sju), så
// `flytta_till_approved` är falskt — regel 8 i kommandofilen.
//
//   node notion-aterkoppling.mjs            # visar vad som skulle skrivas
//   node notion-aterkoppling.mjs --ja       # skriver
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = resolve(HÄR, '..', '..', '..', '..');
const JA = process.argv.includes('--ja');
const KONTO = '1107817401910319';

const jobb = JSON.parse(readFileSync(join(HÄR, 'jobb.json'), 'utf8'));
const annonser = JSON.parse(readFileSync(join(HÄR, 'annonser.json'), 'utf8'));

for (const rad of jobb.rader) {
  const kort = rad.namn.replace(/^CaraShellRoof_/, '').replace(/_H1$/, '');
  const mina = annonser.filter((a) => a.kort === kort && a.ad_id);
  if (!mina.length) { console.log(`${rad.namn}: inget annons-id — hoppad`); continue; }
  const delar = mina.map((a) => `${a.land} ✅ ${a.namn} live in ${a.kampanj_namn} (adset ${a.adset_namn}), ad ${a.ad_id}`);
  const saknas = (rad.ocksa ?? []).filter((o) => !mina.some((a) => a.land === o.land));
  if (saknas.length) delar.push(`⚠️ not uploaded to ${saknas.map((o) => o.land).join('/')} yet — the row stays out of Approved until it is`);
  // ⚠️ `annonsmarknader` är fortfarande NO,US medan `spegling.ladda_upp` är tom
  //    sedan 2026-10-03, så ingen körning laddar upp i CaraShells NO-kampanj —
  //    raden kan därför aldrig nå Approved av sig själv. Det är ett registerbeslut
  //    (ägarens), inte något den här körningen ändrar; det står som fråga i rapporten.
  delar.push('Status unchanged: NO is still listed as an ad market for this product, and nothing uploads to the NO campaign any more, so the row waits for the owner.');
  const url = `https://www.facebook.com/adsmanager/manage/ads?act=${KONTO}&selected_ad_ids=${mina.map((a) => a.ad_id).join(',')}`;
  const args = [join(ROT, 'tools', 'notion-aterkoppling.mjs'), rad.page_id,
    '--kommentar', delar.join('\n'), '--egenskap', `Translated url=${url}`];
  console.log(`\n${rad.namn}\n  ${delar.join('\n  ')}\n  ${url}`);
  if (!JA) continue;
  const r = spawnSync('node', args, { encoding: 'utf8', cwd: ROT });
  console.log(`  → ${r.status === 0 ? 'skrivet' : `FEL: ${(r.stderr || r.stdout).trim().split('\n').slice(-2).join(' ')}`}`);
}
