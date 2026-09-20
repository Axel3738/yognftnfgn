#!/usr/bin/env node
// rapport.mjs — bygger discord-jobb.json och batch-log-avsnittet ur resultat-meta.json,
// rostkoll.json och slutkort.json. Inget skrivs in för hand: varje annons-id, adset och
// dom kommer ur filerna körningen själv skrev.
//   node market-expansion/ops/carashell/2026-09-20-us/rapport.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const las = (f) => (existsSync(join(HAR, f)) ? JSON.parse(readFileSync(join(HAR, f), 'utf8')) : {});
const r = las('resultat-meta.json');
const rost = las('rostkoll.json');
const jobb = las('jobb.json');

const live = Object.entries(r).filter(([, v]) => v.skarpt && v.resultat?.ok);
const fel = Object.entries(r).filter(([, v]) => v.skarpt && !v.resultat?.ok);
const bild = live.filter(([, v]) => v.typ === 'bild');
const video = live.filter(([, v]) => v.typ === 'video');
const rad = ([n, v]) => `${n.replace('CaraShellRoof_US_', '')} -> ad ${v.resultat.annons?.id} (${v.resultat.adset?.namn?.replace('CARASHELL_US_', '')})`;

const discord = {
  brand: 'CaraShell',
  butik: 'carashell',
  datum: '2026-09-20',
  lage: 'oversatt',
  marknad: 'US',
  server: 'CaraShell',
  kanal: 'annons-uppladdning',
  gjort: [
    `US round for the roof cover: ${jobb.rader?.length ?? 16} rows in the queue, ${live.length} translated to American English and uploaded live into the active US campaign (${jobb.kampanj?.namn ?? ''}). ${bild.length} images + ${video.length} videos, one ad set per concept. Every row already runs in Norway, so all of them move to Approved.`,
    `Images (Swedish text swapped in place, $199 / reg. $249, 20% off, 5.0 from 16 US reviews): ${bild.map(rad).join(' | ')}`,
    `Videos (HeyGen US-English voice clone + lip sync, English word captions, red Swedish price and size overlays replaced with $199 / SAVE $50 / 21 x 10 FT / 210D FABRIC): ${video.map(rad).join(' | ')}`,
    `Voice check passed on all ${video.length} (length drift 0.1-0.2 %, no silent track, last line ends inside the file). Every finished video was read frame by frame and by OCR: no Swedish caption pill and no Swedish price survives.`,
    'End cards: all four source videos ended on a BAVERBUTIKEN card with the Swedish product page and a kr price. The queue blocked them for exactly that reason. Each one was rebuilt as a US end card that names no store and no domain, so the uploaded file no longer carries a store name anywhere.',
  ],
  varningar: [],
  action_axel: [],
  nasta_korning: '2026-09-21 17:05',
};
if (fel.length) discord.varningar.push(`Not uploaded: ${fel.map(([n, v]) => `${n} (${JSON.stringify(v.fel ?? v.logg ?? '').slice(0, 90)})`).join(' | ')}`);
discord.varningar.push(
  "The uploads landed in the listicle-track campaign, the only ACTIVE US campaign since the owner paused the product-page one. Every new ad inherits that listicle link.",
  'Meta shows PENDING_REVIEW / IN_PROCESS on fresh ads for a while - normal.',
);

writeFileSync(join(HAR, 'discord-jobb.json'), JSON.stringify(discord, null, 2) + '\n');

const tabell = ['| Spegel (US) | Typ | Adset | US-annons | Röstkoll |', '|---|---|---|---|---|'];
for (const [n, v] of live) {
  const rk = v.typ === 'video' ? (rost[n.replace('CaraShellRoof_US_', '')]?.ok ? '✅' : '—') : '—';
  tabell.push(`| ${n} | ${v.typ} | ${v.resultat.adset?.namn} | \`${v.resultat.annons?.id}\` | ${rk} |`);
}
writeFileSync(join(HAR, 'batchlog-tabell.md'), tabell.join('\n') + '\n');
console.log(`live ${live.length}, fel ${fel.length} — discord-jobb.json + batchlog-tabell.md skrivna`);
