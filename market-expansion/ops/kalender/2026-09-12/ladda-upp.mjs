#!/usr/bin/env node
// ladda-upp.mjs — laddar upp batchens norska videor LIVE i AdventLanes NO-kampanj,
// en rad i taget via tools/ops-till-meta.mjs, med tidsgräns per rad och resultat
// skrivet till resultat.json EFTER VARJE RAD (lärdom ur leveransrundan 2026-09-12:
// två uppladdningar hängde på proxyn och de klara raderna försvann med hängningen).
//
//   node market-expansion/ops/kalender/2026-09-12/ladda-upp.mjs [--torr] [NAMN …]
//
// Läser jobb.json (raderna), adcopy-NO.json (copyn) och no/<mal_namn>.mp4 (filen).
// En rad som redan har ad_id i resultat.json hoppas över (idempotent omkörning).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, '..', '..', '..', '..');
const args = process.argv.slice(2);
const torr = args.includes('--torr');
const valda = args.filter((a) => !a.startsWith('--'));
const NYCKEL = 'kalender/adventskalender-racingbilar';
const TIDSGRÄNS_MS = 12 * 60 * 1000;

const jobb = JSON.parse(readFileSync(join(HÄR, 'jobb.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(HÄR, 'adcopy-NO.json'), 'utf8'));
const resFil = join(HÄR, 'resultat.json');
const resultat = existsSync(resFil) ? JSON.parse(readFileSync(resFil, 'utf8')) : {};
const spara = () => writeFileSync(resFil, JSON.stringify(resultat, null, 1));

for (const r of jobb.rader) {
  const n = r.mal_namn;
  if (valda.length && !valda.some((v) => n.endsWith(v))) continue;
  if (resultat[n]?.annons?.id && !torr) { console.log(`⏭ ${n}: redan uppladdad (${resultat[n].annons.id})`); continue; }
  const fil = join(HÄR, 'no', `${n}.mp4`);
  const c = copy[n];
  if (!existsSync(fil)) { console.error(`✗ ${n}: saknar ${fil}`); resultat[n] = { fel: 'fil saknas' }; spara(); continue; }
  if (!c) { console.error(`✗ ${n}: saknar copy`); resultat[n] = { fel: 'copy saknas' }; spara(); continue; }
  const argv = [join(ROT, 'tools', 'ops-till-meta.mjs'), NYCKEL, '--marknad', 'NO', '--namn', n, '--fil', fil,
    '--primar', c.message, '--rubrik', c.headline, '--beskrivning', c.description, '--json'];
  if (torr) argv.push('--torr');
  console.log(`▶ ${n} ${torr ? '(torr)' : ''}`);
  const t0 = Date.now();
  const p = spawnSync(process.execPath, argv, { encoding: 'utf8', timeout: TIDSGRÄNS_MS, maxBuffer: 64 * 1024 * 1024 });
  const sek = Math.round((Date.now() - t0) / 1000);
  const sista = (p.stdout || '').trim().split('\n').filter(Boolean).pop() || '';
  let ut = null;
  try { ut = JSON.parse(sista); } catch { /* ingen JSON */ }
  if (p.error?.code === 'ETIMEDOUT' || p.signal) {
    console.error(`✗ ${n}: tidsgräns ${sek}s — dödad. Kolla dubblett i kontot innan omkörning.`);
    resultat[n] = { fel: `tidsgräns efter ${sek}s`, stderr: (p.stderr || '').slice(-1500) };
  } else if (p.status !== 0 || !ut?.ok) {
    console.error(`✗ ${n}: exit ${p.status} efter ${sek}s\n${(p.stderr || '').slice(-1500)}`);
    resultat[n] = { fel: `exit ${p.status}`, stderr: (p.stderr || '').slice(-1500), ut };
  } else {
    console.log(`✓ ${n}: ad ${ut.annons?.id ?? 'TORR'} i adset "${ut.adset?.namn}"${ut.adset?.skapad ? ' (nytt)' : ''} · ${ut.annons?.status}/${ut.annons?.effective_status ?? '-'} · ${sek}s`);
    if (!torr) resultat[n] = { ...ut, sek, tid: new Date().toISOString() };
  }
  if (!torr) spara();
}
console.log(torr ? 'Torrkörning klar — inget skrevs.' : `Klart. Resultat i ${resFil}`);
