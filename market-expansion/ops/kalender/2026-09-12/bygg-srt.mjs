#!/usr/bin/env node
// bygg-srt.mjs — skriver de norska SRT:erna (samma blockantal + tidkoder som
// HeyGens original) ur subagentens texter i srt-no.json, och kör regexgrinden.
//
//   node market-expansion/ops/kalender/2026-09-12/bygg-srt.mjs
//
// srt-no.json: { "PD_8_H1": ["block 1", "block 2", …], … } — en text per block.
// Grinden: inga svenska tecken (ä/ö), inga svenska tal (499/649/150/640/250),
// inget "Sverige". Tidkodsrader undantas. Exit 1 vid rött — då skrivs inget upp.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const texter = JSON.parse(readFileSync(join(HÄR, 'srt-no.json'), 'utf8'));
mkdirSync(join(HÄR, 'srt-fix'), { recursive: true });
const FÖRBJUDET = [/[äöÄÖ]/, /\b(499|649|150|640|250)\b/, /sverige/i, /\bkronor\b/i, /\bjämför/i];
let röd = 0;
for (const [namn, rader] of Object.entries(texter)) {
  const nyckel = `adventlane_AdventLaneRacing_${namn}`;
  const orig = readFileSync(join(HÄR, 'srt-orig', `${nyckel}.orig.srt`), 'utf8').trim();
  const block = orig.split(/\n\s*\n/);
  if (block.length !== rader.length) { console.error(`✗ ${namn}: ${block.length} block i originalet, ${rader.length} texter`); röd++; continue; }
  const ut = block.map((b, i) => {
    const [nr, tid] = b.split('\n');
    return `${nr}\n${tid}\n${rader[i].replace(/\s*\n\s*/g, ' ').trim()}`;
  }).join('\n\n') + '\n';
  for (const [i, r] of rader.entries()) {
    for (const re of FÖRBJUDET) if (re.test(r)) { console.error(`✗ ${namn} block ${i + 1}: matchar ${re} — "${r}"`); röd++; }
    const svLen = block[i].split('\n').slice(2).join(' ').length;
    const kvot = r.length / Math.max(1, svLen);
    if (kvot < 0.7 || kvot > 1.35) console.error(`  ⚠ ${namn} block ${i + 1}: längd ${r.length} mot sv ${svLen} (${kvot.toFixed(2)})`);
  }
  writeFileSync(join(HÄR, 'srt-fix', `${nyckel}.srt`), ut);
  console.log(`✓ ${namn}: ${rader.length} block → srt-fix/${nyckel}.srt`);
}
if (röd) { console.error(`${röd} röda — rätta srt-no.json och kör om.`); process.exit(1); }
console.log('Regexgrinden grön.');
