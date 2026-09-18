#!/usr/bin/env node
// Batchdrivare för NO-bildannonserna, CaraShell termoskyddet batch #2, 2026-09-17.
// Kör tools/ops-till-meta.mjs en bild i taget mot NO-kampanjen kön dömde
// (--kampanj ur jobb.json). Utan --skarpt bara torrkörning.
//   node market-expansion/ops/carashell/2026-09-17-no-termoskyddet/ladda-upp.mjs [--bara <mal_namn>] [--skarpt]
// Skriver resultat-meta.json (torrkörningens rader skrivs över av den skarpa).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const NYCKEL = 'carashell/termoskyddet';
const MARKNAD = 'NO';
const args = process.argv.slice(2);
const flagga = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const bara = flagga('--bara');
const skarpt = args.includes('--skarpt');

const jobb = JSON.parse(readFileSync(join(HAR, 'jobb.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(HAR, `adcopy-${MARKNAD}.json`), 'utf8'));
const render = JSON.parse(readFileSync(join(HAR, 'resultat-render.json'), 'utf8'));
const resultatFil = join(HAR, 'resultat-meta.json');
const resultat = existsSync(resultatFil) ? JSON.parse(readFileSync(resultatFil, 'utf8')) : {};

const rader = jobb.rader.filter((r) => !bara || r.mal_namn === bara);
for (const r of rader) {
  const n = r.mal_namn;
  const fil = join(HAR, 'no', `${n}.png`);
  const ren = render[r.namn];
  if (!ren || ren.status !== 'OK' || !existsSync(fil)) { resultat[n] = { fel: 'ingen godkänd rendering' }; console.log(n, 'INGEN RENDERING'); continue; }
  if (r.finns_i_meta) { resultat[n] = { hoppad: 'finns redan i kontot' }; console.log(n, 'FINNS REDAN'); continue; }
  const c = copy[n];
  if (!c) { resultat[n] = { fel: 'saknar copy' }; console.log(n, 'SAKNAR COPY'); continue; }
  const argv = [join(ROT, 'tools', 'ops-till-meta.mjs'), NYCKEL, '--marknad', MARKNAD, '--kampanj', jobb.kampanj.id,
    '--namn', n, '--fil', fil, '--primar', c.message, '--rubrik', c.headline, '--beskrivning', c.description, skarpt ? '--json' : '--torr'];
  const p = spawnSync('node', argv, { encoding: 'utf8', cwd: ROT });
  const logg = (p.stdout + p.stderr).split('\n').filter((l) => l && !/UNDICI|trace-warnings/.test(l));
  let js = null;
  for (const l of logg) { try { const o = JSON.parse(l); if (o && typeof o === 'object' && ('ok' in o || 'ad_id' in o || 'annons' in o)) js = o; } catch {} }
  resultat[n] = { page_id: r.page_id, koncept: r.koncept, exit: p.status, skarpt, resultat: js, logg: js ? undefined : logg.slice(-12) };
  console.log(`=== ${n} exit ${p.status} → ${js ? JSON.stringify(js) : logg.slice(-8).join(' | ')}`);
}
writeFileSync(resultatFil, JSON.stringify(resultat, null, 2));
