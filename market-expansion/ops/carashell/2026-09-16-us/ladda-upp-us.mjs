#!/usr/bin/env node
// ladda-upp-us.mjs — laddar upp de 12 amerikanska videoannonserna (CaraShell
// takskyddet) i US-kampanjen i Magiborsten UK via tools/ops-till-meta.mjs,
// en i taget, med copyn per koncept ur adcopy-US-video.json.
//   node market-expansion/ops/carashell/2026-09-16-us/ladda-upp-us.mjs --torr
//   node market-expansion/ops/carashell/2026-09-16-us/ladda-upp-us.mjs
//   node market-expansion/ops/carashell/2026-09-16-us/ladda-upp-us.mjs --bilder [--torr]   # de 4 batch #1-bilderna
// Kör bara de videor som klarat röstkollen (rostkoll-us.json: ok=true) och som
// inte redan står i resultat-meta-video.json. Skriver resultatet dit efter varje
// annons så en avbruten körning kan fortsätta.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const TORR = process.argv.includes('--torr');
const BARA = (process.argv.find((a) => a.startsWith('--bara=')) || '').slice(7).split(',').filter(Boolean);   // --bara=CS_1_H1,CS_2_H1
const KAMPANJ = '120251436741400435';                       // CARASHELL_US_Taköverdrag … (Magiborsten UK)
const LANK = 'https://carashell.com/products/takskyddet?country=US';   // opsmarknader.marknadslank, egen US-domän
const NYCKEL = 'carashell/takskyddet';

const copy = JSON.parse(readFileSync(join(HAR, 'adcopy-US-video.json'), 'utf8'));
const rost = existsSync(join(HAR, 'rostkoll-us.json')) ? JSON.parse(readFileSync(join(HAR, 'rostkoll-us.json'), 'utf8')) : {};
const resFil = join(HAR, 'resultat-meta-video.json');
const resultat = existsSync(resFil) ? JSON.parse(readFileSync(resFil, 'utf8')) : {};

// Videorna (12, kräver grön röstkoll) + batch #1-bilderna (4, ritade av rendera-batch1.py).
const BILDER = process.argv.includes('--bilder');
const namn = BILDER
  ? ['CS_2_1', 'GT_2_1', 'PD_2_1', 'SP_2_1']
  : ['CS_1_H1', 'CS_2_H1', 'CS_3_H1', 'GT_1_H1', 'GT_2_H1', 'GT_3_H1', 'PD_1_H1', 'PD_2_H1', 'PD_3_H1', 'SP_1_H1', 'SP_2_H1', 'SP_3_H1'];
for (const n of namn) {
  if (BARA.length && !BARA.includes(n)) continue;
  const mal = `CaraShellRoof_US_${n}`;
  const koncept = n.split('_')[0];
  if (resultat[mal]?.resultat?.ok && !TORR) { console.log(`— ${mal}: redan uppladdad (${resultat[mal].resultat.annons?.id})`); continue; }
  if (!BILDER && rost[mal]?.ok !== true) { console.log(`✗ ${mal}: röstkollen inte grön — hoppar`); resultat[mal] = { hoppad: 'röstkoll' }; continue; }
  const fil = BILDER ? join(HAR, 'us', `CaraShellRoof_${n}_US.png`) : join(HAR, 'us', `${mal}.mp4`);
  if (!existsSync(fil)) { console.log(`✗ ${mal}: filen saknas ${fil}`); continue; }
  const c = copy[koncept];
  if (!c?.message || !c?.headline) { console.log(`✗ ${mal}: copy saknas för ${koncept}`); continue; }
  const args = ['tools/ops-till-meta.mjs', NYCKEL, '--marknad', 'US', '--kampanj', KAMPANJ, '--namn', mal, '--fil', fil,
    '--primar', c.message, '--rubrik', c.headline, '--lank', LANK, '--json'];
  if (c.description) args.push('--beskrivning', c.description);
  if (TORR) args.push('--torr');
  console.log(`\n=== ${mal} (${TORR ? 'torr' : 'SKARP'})`);
  const r = spawnSync(process.execPath, args, { cwd: ROT, encoding: 'utf8', env: process.env, maxBuffer: 1 << 26 });
  process.stderr.write(r.stderr.split('\n').filter((l) => !/UNDICI|trace-warnings/.test(l)).join('\n'));
  const sista = r.stdout.trim().split('\n').pop();
  let json = null;
  try { json = JSON.parse(sista); } catch { /* ingen json-rad */ }
  resultat[mal] = { exit: r.status, resultat: json };
  // Flera processer kan köra parallellt (en per koncept): läs om filen och slå
  // ihop före varje skrivning, annars skriver den ena över den andras rader.
  if (!TORR) {
    const nu = existsSync(resFil) ? JSON.parse(readFileSync(resFil, 'utf8')) : {};
    nu[mal] = resultat[mal];
    writeFileSync(resFil, JSON.stringify(nu, null, 2));
  }
  console.log(json ? `→ ${json.ok ? 'OK' : 'FEL'} ${json.annons?.id ?? ''} ${json.annons?.status ?? ''}/${json.annons?.effective_status ?? ''} adset ${json.adset?.namn ?? ''}${json.fel ? ` — ${json.fel}` : ''}` : `→ ingen json (exit ${r.status})`);
  if (!TORR) await new Promise((res) => setTimeout(res, 3000));
}
if (TORR) console.log('\n[torr] inget skrevs');
