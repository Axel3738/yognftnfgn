// sammanfoga.mjs — slår ihop översättningsdelarna (<locale>-A1.json, -A2, -B, -C, -D, -A3 …)
// till output/underlag-<locale>.json och kontrollerar mot det svenska underlaget.
//
//   node matstrumpor/marknader/sammanfoga.mjs <locale> <mapp-med-delarna>
//
// Stoppar (exit 1) om en nyckel i svenskan saknas i delarna, om en nyckel finns i två
// delar med olika text, eller om granska.mjs hittar fel. Skriver aldrig en halv fil.

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { underlagsfil, OUTPUT } from './underlag.mjs';
import { granska, skrivUt } from './granska.mjs';

export function sammanfoga(sv, delar) {
  const ut = {};
  const dubbletter = [];
  for (const [namn, d] of delar) {
    for (const [k, v] of Object.entries(d)) {
      if (k.startsWith('_')) continue;
      if (k in ut && ut[k] !== v) dubbletter.push({ nyckel: k, del: namn });
      ut[k] = v;
    }
  }
  const svNycklar = Object.keys(sv).filter((k) => !k.startsWith('_'));
  const saknas = svNycklar.filter((k) => !(k in ut));
  const extra = Object.keys(ut).filter((k) => !(k in sv));
  return { ut, saknas, extra, dubbletter };
}

async function huvud() {
  const [locale, mapp] = process.argv.slice(2);
  if (!locale || !mapp) { console.error('Användning: node matstrumpor/marknader/sammanfoga.mjs <locale> <mapp>'); process.exit(2); }
  const sv = JSON.parse(readFileSync(underlagsfil('sv'), 'utf8'));
  const filer = readdirSync(mapp).filter((f) => new RegExp(`^${locale}-[A-Z]\\d?\\.json$`).test(f)).sort();
  if (filer.length === 0) { console.error(`Inga ${locale}-*.json i ${mapp}`); process.exit(1); }
  const delar = filer.map((f) => [f, JSON.parse(readFileSync(join(mapp, f), 'utf8'))]);
  const { ut, saknas, extra, dubbletter } = sammanfoga(sv, delar);
  console.log(`${locale}: ${filer.length} delar (${filer.join(', ')}), ${Object.keys(ut).length} nycklar`);
  if (dubbletter.length) { console.log(`❌ nycklar i flera delar med olika text: ${dubbletter.map((d) => `${d.nyckel} (${d.del})`).join(', ')}`); process.exit(1); }
  if (extra.length) { console.log(`❌ nycklar som inte finns i svenskan: ${extra.join(', ')}`); process.exit(1); }
  if (saknas.length) { console.log(`❌ ${saknas.length} svenska nycklar saknas: ${saknas.slice(0, 10).join(', ')}${saknas.length > 10 ? ' …' : ''}`); process.exit(1); }
  const r = granska(sv, ut, locale);
  skrivUt(r);
  if (r.fel.length) process.exit(1);
  mkdirSync(OUTPUT, { recursive: true });
  const fil = underlagsfil(locale);
  writeFileSync(fil, JSON.stringify({ _om: `Översättning ${locale} av underlag-sv.json — sonnet-subagenter mot REGLER.md, granskade adversariellt, sammanfogade ${new Date().toISOString().slice(0, 10)}. Registreras av bygg.mjs --steg oversattningar.`, ...ut }, null, 1) + '\n');
  console.log(`✅ skrev ${fil}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) huvud().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
