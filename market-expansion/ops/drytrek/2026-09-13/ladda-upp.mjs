#!/usr/bin/env node
// Batchdrivare för /ops-oversatt drytrek 2026-09-13.
// Kör tools/ops-till-meta.mjs en rad i taget: först torrt, sedan skarpt.
// Skriver resultatet i resultat.json. Inget annat rörs.
//
//   node ladda-upp.mjs --typ bild|video [--bara <mal_namn>] [--skarpt]
//
// Utan --skarpt görs BARA torrkörningen.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, '..', '..', '..', '..');
const NYCKEL = 'drytrek/damasker';

const args = process.argv.slice(2);
const flagga = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const typ = flagga('--typ') || 'bild';
const bara = flagga('--bara');
const skarpt = args.includes('--skarpt');

const jobb = JSON.parse(readFileSync(join(HÄR, 'jobb.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(HÄR, 'adcopy-NO.json'), 'utf8'));
const resultatFil = join(HÄR, 'resultat.json');
const resultat = existsSync(resultatFil) ? JSON.parse(readFileSync(resultatFil, 'utf8')) : {};

const rader = jobb.rader.filter((r) => r.typ === typ && (!bara || r.mal_namn === bara));

function kör(rad, torr) {
  const c = copy[rad.mal_namn];
  if (!c) return { fel: `ingen copy för ${rad.mal_namn} i adcopy-NO.json` };
  const fil = typ === 'bild'
    ? join(HÄR, 'no', `${rad.mal_namn}.png`)
    : join(HÄR, 'no', `${rad.mal_namn}.mp4`);
  if (!existsSync(fil)) return { fel: `filen saknas: ${fil}` };
  const argv = [
    join(ROT, 'tools', 'ops-till-meta.mjs'), NYCKEL,
    '--marknad', 'NO', '--namn', rad.mal_namn, '--fil', fil,
    '--primar', c.message, '--rubrik', c.headline,
  ];
  if (c.description) argv.push('--beskrivning', c.description);
  argv.push(torr ? '--torr' : '--json');
  const r = spawnSync(process.execPath, argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, cwd: ROT });
  const ut = (r.stdout || '').trim();
  if (torr) return { torr_ok: r.status === 0, kod: r.status, ut: ut.split('\n').slice(-3).join('\n'), fel_ut: (r.stderr || '').split('\n').slice(-4).join('\n') };
  if (r.status !== 0) return { fel: `exit ${r.status}`, fel_ut: (r.stderr || '').split('\n').slice(-6).join('\n'), ut: ut.split('\n').slice(-4).join('\n') };
  const sista = ut.split('\n').filter(Boolean).pop();
  try { return { ok: true, svar: JSON.parse(sista) }; } catch { return { ok: true, ut: sista }; }
}

console.log(`${rader.length} rader (${typ})${skarpt ? ' — SKARPT' : ' — torrkörning'}\n`);
for (const rad of rader) {
  const namn = rad.mal_namn;
  if (resultat[namn]?.ok) { console.log(`⏭  ${namn} redan uppladdad (${resultat[namn].svar?.ad_id ?? ''})`); continue; }
  const torr = kör(rad, true);
  if (torr.fel) { console.log(`❌ ${namn}: ${torr.fel}`); resultat[namn] = torr; continue; }
  if (!torr.torr_ok) { console.log(`❌ ${namn}: torrkörning exit ${torr.kod}\n${torr.fel_ut}`); resultat[namn] = torr; continue; }
  console.log(`✅ torr ${namn}`);
  if (!skarpt) { resultat[namn] = torr; continue; }
  const skarp = kör(rad, false);
  resultat[namn] = skarp;
  if (skarp.fel) console.log(`❌ SKARP ${namn}: ${skarp.fel}\n${skarp.fel_ut}`);
  else console.log(`🚀 ${namn} → ad ${skarp.svar?.ad_id ?? '?'} adset ${skarp.svar?.adset?.name ?? skarp.svar?.adset_id ?? '?'} status ${skarp.svar?.status ?? '?'}`);
  writeFileSync(resultatFil, JSON.stringify(resultat, null, 1));
}
writeFileSync(resultatFil, JSON.stringify(resultat, null, 1));
const ok = Object.values(resultat).filter((v) => v.ok).length;
console.log(`\n${ok} uppladdade · ${Object.values(resultat).filter((v) => v.fel).length} fel`);
