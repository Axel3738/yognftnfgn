#!/usr/bin/env node
// Batchdrivare för US-videorna, CaraShell takskyddet 2026-09-16.
// Kör tools/ops-till-meta.mjs en video i taget mot den pausade US-kampanjen
// (--kampanj ur jobb.json). Utan --skarpt bara torrkörning.
//   node market-expansion/ops/carashell/2026-09-16-us/ladda-upp-video.mjs [--bara <mal_namn>] [--skarpt]
// Skriver resultat-video.json.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const NYCKEL = 'carashell/takskyddet';
const args = process.argv.slice(2);
const flagga = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const bara = flagga('--bara');
const skarpt = args.includes('--skarpt');

const jobb = JSON.parse(readFileSync(join(HAR, 'jobb.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(HAR, 'adcopy-US-video.json'), 'utf8'));
const rostkoll = existsSync(join(HAR, 'rostkoll.json')) ? JSON.parse(readFileSync(join(HAR, 'rostkoll.json'), 'utf8')) : null;
const resultatFil = join(HAR, 'resultat-video.json');
const resultat = existsSync(resultatFil) ? JSON.parse(readFileSync(resultatFil, 'utf8')) : {};

const namn = Object.keys(copy).filter((n) => !bara || n === bara);
for (const n of namn) {
  const fil = join(HAR, 'us', `${n}.mp4`);
  if (!existsSync(fil)) { resultat[n] = { fel: 'filen saknas' }; console.log(n, 'FIL SAKNAS'); continue; }
  if (rostkoll && rostkoll[n] && rostkoll[n].ok === false) { resultat[n] = { fel: 'röstkoll ❌ — laddas inte upp' }; console.log(n, 'RÖSTKOLL ❌ — hoppas'); continue; }
  const c = copy[n];
  const argv = [join(ROT, 'tools', 'ops-till-meta.mjs'), NYCKEL, '--marknad', 'US', '--kampanj', jobb.kampanj.id,
    '--namn', n, '--fil', fil, '--primar', c.message, '--rubrik', c.headline, '--beskrivning', c.description, skarpt ? '--json' : '--torr'];
  const p = spawnSync('node', argv, { encoding: 'utf8', cwd: ROT });
  const rader = (p.stdout + p.stderr).split('\n').filter((l) => !/UNDICI|trace-warnings/.test(l));
  let js = null;
  for (const l of rader) { try { const o = JSON.parse(l); if (o && typeof o === 'object' && ('ok' in o || 'ad_id' in o)) js = o; } catch {} }
  resultat[n] = { exit: p.status, skarpt, resultat: js, logg: js ? undefined : rader.slice(-8) };
  console.log(`=== ${n} exit ${p.status} → ${js ? JSON.stringify({ ad_id: js.ad_id ?? js.annons?.id, adset: js.adset?.namn }) : rader.slice(-4).join(' | ')}`);
}
writeFileSync(resultatFil, JSON.stringify(resultat, null, 2));
