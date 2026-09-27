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

const TAGG = /<\/?[a-zA-Z][^>]*>|\{\{[^}]*\}\}|\{%[^%]*%\}/g;

/**
 * Återställer hårda blanksteg (U+00A0) där svenskan har dem och översättningen fått
 * vanliga. Översättarna normaliserar dem tyst (mätt 2026-09-27: 7 av 7 i da-B och en-B),
 * och ett `<p> </p>` med vanligt blanksteg kollapsar i webbläsaren medan `<p>&nbsp;</p>`
 * ger en blankrad — sidan hade alltså fått annat radavstånd än den svenska.
 * Segment mellan taggar som bara är blanksteg tas rakt ur svenskan; ett inledande eller
 * avslutande hårt blanksteg i ett svenskt textsegment sätts tillbaka. Skiljer sig
 * taggföljden (då har granska.mjs redan ett FEL) lämnas texten orörd.
 */
export function aterstallHardaBlanksteg(sv, mal) {
  if (typeof sv !== 'string' || typeof mal !== 'string' || !sv.includes(' ') || mal.includes(' ')) return mal;
  const sSeg = sv.split(TAGG), mSeg = mal.split(TAGG);
  const mTag = mal.match(TAGG) ?? [];
  if (sSeg.length !== mSeg.length) return mal;
  const ut = mSeg.map((seg, i) => {
    const s = sSeg[i];
    if (!/\S/.test(s) && s.includes(' ') && !/\S/.test(seg)) return s;
    let r = seg;
    if (s.startsWith(' ') && r.startsWith(' ')) r = ` ${r.slice(1)}`;
    if (s.endsWith(' ') && r.endsWith(' ')) r = `${r.slice(0, -1)} `;
    return r;
  });
  let res = '';
  for (let i = 0; i < ut.length; i++) { res += ut[i]; if (i < mTag.length) res += mTag[i]; }
  return res;
}

export function sammanfoga(sv, delar) {
  const ut = {};
  const dubbletter = [];
  for (const [namn, d] of delar) {
    for (const [k, v] of Object.entries(d)) {
      if (k.startsWith('_')) continue;
      const varde = aterstallHardaBlanksteg(sv[k], v);
      if (k in ut && ut[k] !== varde) dubbletter.push({ nyckel: k, del: namn });
      ut[k] = varde;
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
