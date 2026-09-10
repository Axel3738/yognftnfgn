#!/usr/bin/env node
// bygg-vagkonfig.mjs — TackleBay SE: källannonser + domar + ny copy → två
// vågkonfigar (video + bild) i den LÅSTA strukturen (/ny-annonser steg 8):
// EN CBO-kampanj, ett adset per källkoncept (PD/CS/SO/GT/SP), annonserna i
// sitt koncepts adset, allt PAUSED.
//
//   node factory/output/fiskespohallare-4-pack/bygg-vagkonfig.mjs
//
// Läser:  kallannonser.json (SE, bara `med`), brand-detektor.json (domar),
//         se-copy-ny.json (subagentens copy per variant, nyckel = variantnr
//         ur se-copy-kallor.json).
// Skriver: pipeline/waves/se-tacklebay-video.config.mjs,
//          pipeline/waves/se-tacklebay-image.config.mjs,
//          factory/output/fiskespohallare-4-pack/vagplan.json (+ tabellen i chatten).
//
// Bara `ren` och `bara-copy` läggs i konfigen. Allt annat står NAMNGIVET i
// vagplan.json med orsak — räkningen (rakning.mjs) läser den listan.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = resolve(HAR, '..', '..', '..');
const MEDIA = join(ROT, '.scratch', 'brand-detektor', 'Rodholder', 'media');

const KAMPANJ = 'TACKLEBAY_SE_Spöhållaren | BE-ROAS 1,67 | 2026-09-10';
const BRANDPREFIX = 'TackleBayRod';
const LINK = 'https://tacklebay.se/products/fiskespohallare-4-pack';
const PAGE = '1283919631474370';
const PIXEL = '1079980541064515';
const ACT = 'act_915422744950975';

const kall = JSON.parse(readFileSync(join(HAR, 'kallannonser.json'), 'utf8'));
const det = existsSync(join(HAR, 'brand-detektor.json')) ? JSON.parse(readFileSync(join(HAR, 'brand-detektor.json'), 'utf8')) : { annonser: [] };
const varianter = JSON.parse(readFileSync(join(HAR, 'se-copy-kallor.json'), 'utf8'));
const nyCopy = existsSync(join(HAR, 'se-copy-ny.json')) ? JSON.parse(readFileSync(join(HAR, 'se-copy-ny.json'), 'utf8')) : [];

const domAv = new Map();
for (const a of det.annonser ?? []) domAv.set(a.annons, a);
const copyAv = new Map(nyCopy.map((c) => [Number(c.variant), c]));
const variantAv = new Map();
for (const v of varianter) for (const namn of v.annonser) variantAv.set(namn, v.variant);

// Konceptet ur ADSETNAMNET i källan ("Fiskespöhållare PD Batch 4" → PD).
const koncept = (adsetNamn) => (String(adsetNamn).match(/\b(PD|CS|SO|GT|SP)\b/) ?? [])[1] ?? null;
const rest = (namn) => namn.replace(/^(Rodholder|Fiskespöhållare)_/, '');

const se = kall.SE.annonser.filter((a) => a.med);
const sedda = new Map();
const plan = [];
for (const a of se) {
  const k = koncept(a.adset.namn);
  const d = domAv.get(a.namn);
  const dom = d?.dom ?? 'odömd';
  const v = variantAv.get(a.namn);
  const copyNy = v != null ? copyAv.get(v) : null;
  const n = (sedda.get(a.namn) ?? 0) + 1;
  sedda.set(a.namn, n);
  const malnamn = n === 1 ? `${BRANDPREFIX}_${rest(a.namn)}` : `${BRANDPREFIX}_B_${rest(a.namn)}`;
  const fil = a.typ === 'video' ? `${a.namn}.mp4` : `${a.namn}.jpg`;
  const rad = {
    kalla: a.namn, id: a.id, typ: a.typ, koncept: k, spend: Math.round(a.utfall.spend), kop: a.utfall.kop,
    dom, malnamn, fil, variant: v, med: false, orsak: null,
  };
  if (!k) rad.orsak = `okänt koncept i adsetnamnet "${a.adset.namn}"`;
  else if (n > 1) rad.orsak = 'dubblettnamn i källan — OCR läste tvillingens fil; ögonkoll krävs innan uppladdning';
  else if (dom === 'ren' || dom === 'bara-copy') {
    if (!copyNy) rad.orsak = `copy saknas för variant ${v}`;
    else if (!existsSync(join(MEDIA, fil))) rad.orsak = `mediafilen saknas: ${fil}`;
    else rad.med = true;
  } else rad.orsak = `dom ${dom}` + (d?.masteAtgardas ? ` — ${JSON.stringify(d.masteAtgardas).slice(0, 120)}` : '');
  plan.push(rad);
}

const adsets = {};
for (const r of plan.filter((x) => x.med)) {
  const namn = `TACKLEBAY_SE_Spöhållaren - ${r.koncept}`;
  adsets[namn] ??= { video: [], bild: [] };
  const c = copyAv.get(r.variant);
  const copy = { message: c.message, headline: c.headline ?? '', description: c.description ?? '' };
  if (r.typ === 'video') adsets[namn].video.push({ name: r.malnamn, file: r.fil, copy });
  else adsets[namn].bild.push({ adName: r.malnamn, img: r.fil, copy });
}

const huvud = (typ) => `// se-tacklebay-${typ}.config.mjs — TackleBay SE, byggd av /ny-annonser 2026-09-10.
//
// Källa: Bäverbutikens ACTIVE-annonser i "Fiskespöhållaren | BE ROAS 1.50 |
// Launch 2026-08-18" (MagiBorsten 1867947880635861, 89 aktiva). Samma bevisade
// creatives, ompekade till TackleBay: egen sida, egen pixel, egen produktsida.
// ⚠️ MÅLET är MagiBorsten DK 915422744950975 — OPS Factorys gemensamma konto (SEK).
// Priset 289 kr är IDENTISKT i källan och hos TackleBay — inga pristal ändrade.
// Det som ändrats i copyn: fraktgränsen "över 300 kr" (TackleBay: fri frakt),
// "30 dagars nöjd-kund-garanti" (TackleBay: 14 dagars ångerrätt enligt lag),
// "40 % RABATT IDAG ENDAST" (finns inte), brådska och påhittade citat →
// butikens sju riktiga femstjärniga recensioner. Copy av subagent (sonnet).
// BE-ROAS 1,67 = 289 / (289 − 116) — utan moms (Axels besked 2026-09-09).
// Genererad av factory/output/fiskespohallare-4-pack/bygg-vagkonfig.mjs.
// Allt föds PAUSED — Axel skriver "Launch: TackleBay".
export default {
  act: '${ACT}',
  page: '${PAGE}',   // TackleBay (me/accounts: ADVERTISE, mätt 2026-09-10)
  pixel: '${PIXEL}', // TackleBay-pixeln, avfyrad 2026-09-10 18:07
  country: 'SE',
  campaignName: ${JSON.stringify(KAMPANJ)},
  link: '${LINK}',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
`;

const j = (x) => JSON.stringify(x);
const videoCfg = `${huvud('video')}  videoDir: '../.scratch/brand-detektor/Rodholder/media',
  adsets: [
${Object.entries(adsets).filter(([, v]) => v.video.length > 0).map(([namn, v]) => `    {
      name: ${j(namn)},
      ads: [
${v.video.map((ad) => `        { name: ${j(ad.name)}, file: ${j(ad.file)},\n          copy: ${j(ad.copy)} },`).join('\n')}
      ],
    },`).join('\n')}
  ],
};
`;
const bildCfg = `${huvud('image')}  adsets: [
${Object.entries(adsets).filter(([, v]) => v.bild.length > 0).map(([namn, v]) => `    {
      name: ${j(namn)},
      ads: [
${v.bild.map((ad) => `        { adName: ${j(ad.adName)}, img: ${j(ad.img)},\n          copy: ${j(ad.copy)} },`).join('\n')}
      ],
    },`).join('\n')}
  ],
};
`;
writeFileSync(join(ROT, 'pipeline', 'waves', 'se-tacklebay-video.config.mjs'), videoCfg);
writeFileSync(join(ROT, 'pipeline', 'waves', 'se-tacklebay-image.config.mjs'), bildCfg);
writeFileSync(join(HAR, 'vagplan.json'), JSON.stringify({ kampanj: KAMPANJ, datum: new Date().toISOString().slice(0, 10), plan }, null, 2));

// Tabellen: kampanj → adsets → antal annonser per adset.
console.log(`\n${KAMPANJ}  (CBO 1 000 kr/dag, PAUSED)`);
for (const [namn, v] of Object.entries(adsets)) console.log(`  ${namn.padEnd(36)} video ${String(v.video.length).padStart(2)}  bild ${String(v.bild.length).padStart(2)}`);
const med = plan.filter((x) => x.med);
console.log(`\n${med.length} av ${plan.length} källannonser i konfigen. Utanför, namngivna:`);
const perOrsak = {};
for (const r of plan.filter((x) => !x.med)) (perOrsak[r.orsak.split(' — ')[0]] ??= []).push(`${r.kalla} (${r.spend} kr)`);
for (const [orsak, lista] of Object.entries(perOrsak)) console.log(`  ${orsak}: ${lista.length} — ${lista.slice(0, 8).join(', ')}${lista.length > 8 ? ' …' : ''}`);
