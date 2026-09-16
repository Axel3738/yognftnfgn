#!/usr/bin/env node
// verify-srt.mjs — regexgrinden för de amerikanska SRT:erna (CaraShell US 2026-09-16).
// Jämför varje video/srt-us/<key>.srt mot video/srt-orig/<key>.srt: samma blockantal,
// byte-identiska timecodes, inga svenska tecken/ord, inga kronor, inget "Bäverbutiken",
// inga 14-dagars-/Klarna-/Sverige-claims. Exit 1 vid fel — inget renderas då.
//   node market-expansion/ops/carashell/2026-09-16-us/verify-srt.mjs
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const ORIG = join(HAR, 'video', 'srt-orig');
const US = join(HAR, 'video', 'srt-us');

const FORBJUDET = [
  [/[åäöÅÄÖ]/, 'svenskt tecken'],
  [/\b(kr|kronor|SEK)\b/i, 'kronor'],
  [/\b(1[ .]?129|1[ .]?469)\b/, 'svenskt pris'],
  [/\b23\s?%|twenty[- ]three percent/i, '23 % (svensk rabatt)'],
  [/b[aä]ver|beaver|spavebutiken|bawebutiken/i, 'Bäverbutiken'],
  [/\b(14|fourteen)[- ]day/i, '14 dagar (USA har 90-dagars garanti)'],
  [/swedish law|in sweden|sweden|swedish/i, 'Sverige-claim'],
  [/klarna/i, 'Klarna (overifierat i USA)'],
  [/\b(husvagn|taköverdrag|överdrag|ångerrätt|frakt|vintern)\b/i, 'svenskt ord'],
  [/\b(colour|tyre|metres?|centimetres?)\b/i, 'brittisk stavning'],
  [/\b6[.,]5\s?(x|×|by)\s?3\b|\b30[–-]40\s?cm\b/i, 'metriska mått i talet'],
];

function block(srt) {
  return srt.replace(/\r/g, '').trim().split(/\n\n+/).map((b) => {
    const r = b.split('\n');
    return { nr: r[0], tid: r[1], text: r.slice(2).join(' ').trim() };
  });
}

let fel = 0;
const filer = existsSync(US) ? readdirSync(US).filter((f) => f.endsWith('.srt')) : [];
if (!filer.length) { console.error('inga SRT:er i', US); process.exit(1); }
for (const f of filer.sort()) {
  const o = block(readFileSync(join(ORIG, f), 'utf8'));
  const u = block(readFileSync(join(US, f), 'utf8'));
  const problem = [];
  if (o.length !== u.length) problem.push(`blockantal ${u.length} ≠ orig ${o.length}`);
  for (let i = 0; i < Math.min(o.length, u.length); i += 1) {
    if (o[i].tid !== u[i].tid) problem.push(`block ${i + 1}: timecode "${u[i].tid}" ≠ "${o[i].tid}"`);
    if (!u[i].text) problem.push(`block ${i + 1}: tom text`);
    for (const [re, namn] of FORBJUDET) if (re.test(u[i].text)) problem.push(`block ${i + 1}: ${namn} — "${u[i].text}"`);
    // Tempo: tecken per sekund i cue-tiden. Den svenska transkriptionen skriver
    // tal som sammansatta ord ("entusenfyrahundrasextionio"), så en ren
    // längdkvot mot källan ljuger — tiden ljuger inte. > 17 tecken/s rusar rösten.
    const [a, b] = u[i].tid.split(' --> ').map((t) => { const [h, m, s] = t.replace(',', '.').split(':'); return (+h) * 3600 + (+m) * 60 + (+s); });
    // Mätt 2026-09-16 på takskyddets 12 källor: den svenska talaren ligger själv på
    // 14–19 tecken/s (GT 19). Absolut tak ljuger därför — måttet är RELATIVT källblocket:
    // mer än 30 % tätare än svenskan i samma cue, och över 17, får rösten rusa.
    const cps = u[i].text.length / Math.max(0.3, b - a);
    const cpsOrig = o[i].text.length / Math.max(0.3, b - a);
    if (cps > 17 && cps > cpsOrig * 1.3) problem.push(`block ${i + 1}: ${u[i].text.length} tecken på ${(b - a).toFixed(1)} s = ${cps.toFixed(1)} tecken/s mot källans ${cpsOrig.toFixed(1)} — rösten rusar`);
    const kvot = u[i].text.length / Math.max(1, o[i].text.length);
    if (kvot > 2.2 || kvot < 0.4) problem.push(`block ${i + 1}: längd ${u[i].text.length} mot orig ${o[i].text.length} (kvot ${kvot.toFixed(2)}) — läppsynk`);
  }
  if (problem.length) { fel += 1; console.log(`❌ ${f}\n   ${problem.join('\n   ')}`); }
  else console.log(`✅ ${f} (${u.length} block)`);
}
console.log(fel ? `\n${fel} fil(er) med fel` : '\nalla gröna');
process.exit(fel ? 1 : 0);
