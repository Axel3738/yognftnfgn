#!/usr/bin/env node
// rapportsida.mjs — kundtjänstens hemsida: bakar in datan och skriver den
// publicerbara filen.
//
// Sidan är ett ARBETSVERKTYG för VA:n, inte en rapport: läget, vad som ska
// göras, arbetskön, tvisterna med deadline. Datan kommer ur
// `korningar/<brand>/<vecka>.json` som run.mjs skriver vid varje körning
// (dashboard.mjs) — sidan räknar aldrig om något, så den och rapporten kan
// inte säga olika saker.
//
//   node kundtjanst/rapportsida.mjs               bygg kundtjanst/rapport-publicerad.html
//   node kundtjanst/rapportsida.mjs --url <länk>  spara sidans fasta länk (en gång)
//
// Publiceringen görs av rutinen med Artifact-verktyget mot SAMMA url varje
// gång (länken står i kundtjanst/rapportsida.json) — utan url blir det en ny
// sida med en ny länk, och den Axel har sparad slutar uppdateras.
//
// Ingen runtime-capability på sidan (samma regel som topplistan): datan ligger
// inbakad, så länken funkar för den som inte har ett Claude-konto.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { samlaDashboard } from './dashboard.mjs';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const MALL = join(ROT, 'kundtjanst', 'rapport-sida.html');
export const UT = join(ROT, 'kundtjanst', 'rapport-publicerad.html');
export const URLFIL = join(ROT, 'kundtjanst', 'rapportsida.json');

/** Bakar in datan i mallen. `</script` i datan bryts så sidan inte kan gå sönder. */
export function byggSida({ mall = MALL, ut = UT, data } = {}) {
  const html = readFileSync(mall, 'utf8');
  if (!html.includes('__DATA__')) throw new Error('Mallen saknar platshållaren __DATA__.');
  const json = JSON.stringify(data ?? samlaDashboard()).replace(/<\//g, '<\\/');
  writeFileSync(ut, html.replace('__DATA__', () => json));
  return ut;
}

export function lasUrl(fil = URLFIL) {
  if (!existsSync(fil)) return null;
  try { return JSON.parse(readFileSync(fil, 'utf8')).url ?? null; } catch { return null; }
}

export function sparaUrl(url, fil = URLFIL) {
  writeFileSync(fil, `${JSON.stringify({ url, sparad: new Date().toISOString().slice(0, 10) }, null, 2)}\n`);
}

// -------------------------------------------------------------------- CLI

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--url');
  if (i !== -1 && args[i + 1]) { sparaUrl(args[i + 1]); console.log(`Länk sparad i kundtjanst/rapportsida.json: ${args[i + 1]}`); }
  const data = samlaDashboard();
  const fil = byggSida({ data });
  console.log(`Sida: ${fil.replace(`${ROT}/`, '')}`);
  if (!data.brands.length) {
    console.log('⚠️ Inga körningar med dashboard-data ännu (korningar/<brand>/<vecka>.json). Kör `node kundtjanst/run.mjs --brand <id>` utan --torr först.');
  }
  for (const b of data.brands) {
    const k = b.nyckeltal;
    console.log(`  ${b.namn.padEnd(16)} ${b.vecka}  risk ${String(k.risk).padStart(3)}/100 · ${k.arenden} ärenden · ${k.larmObesvarade} obesvarade > gräns · ${b.plan.length} åtgärder · ${b.veckor.length} vecka/-or`);
  }
  const url = lasUrl();
  console.log(url
    ? `\nPublicera mot samma länk:\n  Artifact  file_path: ${fil}\n            url:       ${url}`
    : '\n⚠️ Ingen länk sparad än. Publicera med Artifact (favicon 📬) och kör sedan:\n  node kundtjanst/rapportsida.mjs --url <länken>');
}
