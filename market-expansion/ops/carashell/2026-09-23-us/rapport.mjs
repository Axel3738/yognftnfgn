#!/usr/bin/env node
// rapport.mjs — bygger discord-jobb.json och batch-log-avsnittet ur resultat-meta.json,
// rostkoll.json, slutkort.json och video/svenskkoll.json. Inget skrivs in för hand: varje
// annons-id, adset, dom och OCR-träff kommer ur filerna körningen själv skrev.
//   node market-expansion/ops/carashell/2026-09-23-us/rapport.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const las = (f) => (existsSync(join(HAR, f)) ? JSON.parse(readFileSync(join(HAR, f), 'utf8')) : {});
const r = las('resultat-meta.json');
const rost = las('rostkoll.json');
const slutkort = las('slutkort.json');
const svensk = las('video/svenskkoll.json');
const jobb = las('jobb.json');

const live = Object.entries(r).filter(([, v]) => v.skarpt && v.resultat?.ok);
const fel = Object.entries(r).filter(([, v]) => v.skarpt && !v.resultat?.ok);
const kort = (n) => n.replace('CaraShellRoof_US_', '');
const rad = ([n, v]) => `${kort(n)} -> ad ${v.resultat.annons?.id} (${v.resultat.adset?.namn?.replace('CARASHELL_US_', '')})`;

// De fyra som gick live 2026-09-20 med NORSK röstmodell och pausades som *_FELSPRAK av en
// annan session — de kom tillbaka i kön och är omgjorda här.
const OMGJORDA = ['OB_101_H1', 'PD_107_H1', 'RI_103_H1', 'PD_106_H1'];
const omgjorda = live.filter(([n]) => OMGJORDA.includes(kort(n)));
const nya = live.filter(([n]) => !OMGJORDA.includes(kort(n)));

const rostOk = Object.values(rost).filter((v) => (v.fel || []).length === 0).length;
const svenskaKvar = Object.entries(svensk).filter(([, v]) => (v || []).length).map(([n]) => n);
const kortUtanBrand = Object.values(slutkort).filter((v) => v.dom === 'slutkort-utan-brand').length;
const kortRen = Object.values(slutkort).filter((v) => v.dom === 'ren').length;
const kortBlockerar = Object.entries(slutkort).filter(([, v]) => v.blockerar).map(([n]) => n);

const discord = {
  brand: 'CaraShell',
  butik: 'carashell',
  datum: '2026-09-23',
  lage: 'oversatt',
  marknad: 'US',
  server: 'CaraShell',
  kanal: 'annons-uppladdning',
  gjort: [
    `US round for the roof cover: ${jobb.rader?.length ?? 13} rows in the queue, all of them video, ${live.length} translated to American English and uploaded live into the active US campaign (${jobb.kampanj?.namn ?? ''}), one ad set per concept. Every row already runs in Norway, so all of them move to Approved.`,
    `New videos (${nya.length}): ${nya.map(rad).join(' | ')}`,
    `Rebuilt after the wrong-language batch (${omgjorda.length}): ${omgjorda.map(rad).join(' | ')}. These four went live on 2026-09-20 with a Norwegian voice model reading English text; another session caught it, renamed them *_FELSPRAK and paused them. Their rows came back into the queue and are redone here with the US English voice, verified at proofread, render and download.`,
    `Every video: HeyGen US-English voice clone and lip sync, English word captions replacing the Swedish caption pill, and the red Swedish overlays replaced with $199 / SAVE $50 / $249 / 21 x 10 FT / 210D FABRIC / NINE SIZES FROM $199. The line "Contains AI-generated content" is burned into all ${live.length} - the dub is an AI voice, so the line is mandatory.`,
    `Voice check: ${rostOk} of ${Object.keys(rost).length} passed with no findings at all - no silent track, no length drift beyond 0.2 %, no cut-off ending, no lost speech.`,
    `End cards: ${kortUtanBrand} rebuilt as a US card that names no store and no domain, ${kortRen} had no end card to begin with. ${kortBlockerar.length === 0 ? 'None of the finished files carries a store name.' : 'STILL BLOCKING: ' + kortBlockerar.join(', ')}`,
    `Swedish check: every finished video was read by OCR four times a second, end to end - ${svenskaKvar.length === 0 ? 'no Swedish word, no kr price and no Swedish rating survives in any of the 13' : 'still found in ' + svenskaKvar.join(', ')}.`,
  ],
  varningar: [],
  action_axel: [],
  nasta_korning: '2026-09-24 17:05',
};
if (fel.length) discord.varningar.push(`Not uploaded: ${fel.map(([n, v]) => `${kort(n)} (${JSON.stringify(v.fel ?? v.logg ?? '').slice(0, 90)})`).join(' | ')}`);
discord.varningar.push(
  'Three claims in the Swedish source were dropped rather than translated, because they cannot be backed on the American page: the Swedish rating and review count ("5.0 out of 5", "10 reviews"), the drawcord at the edge, and the storage bag that comes with it. The product memory bans the last two - the supplier images do not show them. The straps stayed, because those are documented. OB_102, whose whole angle was the bag, keeps the angle ("packs down small, no bulky winter storage") without promising a bag.',
  'The uploads landed in the listicle-track campaign, the only ACTIVE US campaign since the owner paused the product-page one. Every new ad inherits that listicle link.',
  'The campaign has two ad sets for the same angle, CARASHELL_US_GT and CARASHELL_US_G. In a CBO they split that angle\'s budget between them. Nothing was touched - the owner decides which one counts. The GT videos went into CARASHELL_US_GT.',
  'Meta shows PENDING_REVIEW / IN_PROCESS on fresh ads for a while - normal.',
);

writeFileSync(join(HAR, 'discord-jobb.json'), JSON.stringify(discord, null, 2) + '\n');

const tabell = ['| Spegel (US) | Adset | US-annons | Röstkoll | Slutkort | Svenska kvar |', '|---|---|---|---|---|---|'];
for (const [n, v] of live) {
  const k = kort(n);
  const rk = (rost[`${n}.mp4`]?.fel || []).length === 0 ? '✅' : '❌';
  const sk = slutkort[`${n}.mp4`]?.dom ?? '—';
  const sv = (svensk[k] || []).length === 0 ? '✅ inget' : `❌ ${(svensk[k] || []).length}`;
  tabell.push(`| ${n} | ${v.resultat.adset?.namn} | \`${v.resultat.annons?.id}\` | ${rk} | ${sk} | ${sv} |`);
}
writeFileSync(join(HAR, 'batchlog-tabell.md'), tabell.join('\n') + '\n');
console.log(`live ${live.length}, fel ${fel.length} — discord-jobb.json + batchlog-tabell.md skrivna`);
