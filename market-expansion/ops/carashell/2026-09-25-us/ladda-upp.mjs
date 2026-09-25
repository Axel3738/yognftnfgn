#!/usr/bin/env node
// Batchdrivare för US-annonserna, CaraShell takskyddet 2026-09-25 (1 bild live, 5 videor blockerade av HeyGen-saldot).
// Kör tools/ops-till-meta.mjs en rad i taget mot den kampanj kön dömde (--kampanj ur
// jobb.json). Utan --skarpt bara torrkörning.
//   node market-expansion/ops/carashell/2026-09-25-us/ladda-upp.mjs [--bara <mal_namn>] [--skarpt]
// Skriver resultat-meta.json (fylls på per körning).
//
// ⚠️ Videofilen som laddas upp är `-ai.mp4` — versionen med raden "Contains AI-generated
// content" (tools/ai-rad.mjs, Axels beslut 2026-09-21). HeyGen-dubbningen ÄR en AI-röst,
// så raden är obligatorisk på varje engelsk fil. Laddas filen utan suffix upp saknar
// annonsen raden, och det syns inte i något felmeddelande.
//
// ⚠️ Röstkollen läses ur rostkoll.json i rotformatet (nyckel "<mal_namn>.mp4", fältet
// `fel` som lista). En rad med fel laddas inte upp.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const NYCKEL = 'carashell/takskyddet';
// Instagram-kontot: kopiekampanjens eget id avvisas av API:t, och originalets också
// (mätt 2026-09-18) — kontot har inget IG-konto via API. Se tools/ops-till-meta.mjs --ig.
const IG = 'ingen';
const args = process.argv.slice(2);
const flagga = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const bara = flagga('--bara');
const skarpt = args.includes('--skarpt');

const jobb = JSON.parse(readFileSync(join(HAR, 'jobb.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(HAR, 'adcopy-US.json'), 'utf8'));
const rostkoll = existsSync(join(HAR, 'rostkoll.json')) ? JSON.parse(readFileSync(join(HAR, 'rostkoll.json'), 'utf8')) : {};
const resultatFil = join(HAR, 'resultat-meta.json');
const resultat = existsSync(resultatFil) ? JSON.parse(readFileSync(resultatFil, 'utf8')) : {};

const rader = jobb.rader.filter((r) => !bara || r.mal_namn === bara);
for (const r of rader) {
  const n = r.mal_namn;
  if (r.finns_i_meta) { resultat[n] = { hoppad: 'finns redan i kontot', page_id: r.page_id, koncept: r.koncept, flytta_till_approved: r.flytta_till_approved }; console.log(n, 'FINNS REDAN'); continue; }
  const fil = join(HAR, 'us', r.typ === 'video' ? `${n}-ai.mp4` : `${n}.jpg`);
  if (!existsSync(fil)) { resultat[n] = { fel: 'ingen färdig fil i us/', page_id: r.page_id }; console.log(n, 'FIL SAKNAS'); continue; }
  const rk = rostkoll[`${n}.mp4`];
  if (r.typ === 'video' && rk && (rk.fel || []).length) { resultat[n] = { fel: `röstkoll ❌ ${rk.fel.join('; ')}`, page_id: r.page_id }; console.log(n, 'RÖSTKOLL ❌ — hoppas'); continue; }
  const c = copy[n];
  if (!c) { resultat[n] = { fel: 'saknar copy', page_id: r.page_id }; console.log(n, 'SAKNAR COPY'); continue; }
  const argv = [join(ROT, 'tools', 'ops-till-meta.mjs'), NYCKEL, '--marknad', 'US', '--kampanj', jobb.kampanj.id, '--ig', IG,
    '--namn', n, '--fil', fil, '--primar', c.message, '--rubrik', c.headline, ...(c.description ? ['--beskrivning', c.description] : []), skarpt ? '--json' : '--torr'];
  const p = spawnSync('node', argv, { encoding: 'utf8', cwd: ROT });
  const logg = (p.stdout + p.stderr).split('\n').filter((l) => l && !/UNDICI|trace-warnings/.test(l));
  let js = null;
  for (const l of logg) { try { const o = JSON.parse(l); if (o && typeof o === 'object' && ('ok' in o || 'ad_id' in o || 'annons' in o)) js = o; } catch {} }
  resultat[n] = { page_id: r.page_id, koncept: r.koncept, typ: r.typ, flytta_till_approved: r.flytta_till_approved, exit: p.status, skarpt, resultat: js, logg: js ? undefined : logg.slice(-10) };
  console.log(`=== ${n} exit ${p.status} → ${js ? JSON.stringify({ ok: js.ok, ad: js.ad_id, adset: js.adset?.namn }) : logg.slice(-6).join(' | ')}`);
  writeFileSync(resultatFil, JSON.stringify(resultat, null, 2));
}
writeFileSync(resultatFil, JSON.stringify(resultat, null, 2));
