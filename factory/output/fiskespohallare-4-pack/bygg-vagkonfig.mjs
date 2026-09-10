#!/usr/bin/env node
// bygg-vagkonfig.mjs — TackleBay: källannonser + domar + ny copy → två
// vågkonfigar (video + bild) i den LÅSTA strukturen (/ny-annonser steg 8):
// EN CBO-kampanj per marknad, ett adset per källkoncept (PD/CS/SO/GT/SP),
// annonserna i sitt koncepts adset, allt PAUSED.
//
//   node factory/output/fiskespohallare-4-pack/bygg-vagkonfig.mjs                # SE
//   node factory/output/fiskespohallare-4-pack/bygg-vagkonfig.mjs --marknad NO   # NO
//
// Läser:  kallannonser.json (marknadens block, bara `med`),
//         brand-detektor.json / brand-detektor-no.json (domar),
//         se-/no-copy-kallor.json + se-/no-copy-ny.json (subagentens copy per
//         variant, nyckel = variantnr).
// Skriver: pipeline/waves/<se|no>-tacklebay-video.config.mjs,
//          pipeline/waves/<se|no>-tacklebay-image.config.mjs,
//          factory/output/fiskespohallare-4-pack/vagplan[-no].json (+ tabellen i chatten).
//
// Bara `ren` och `bara-copy` läggs i konfigen. Allt annat står NAMNGIVET i
// vågplanen med orsak — räkningen (rakning.mjs) läser den listan.
//
// ⚠️ Marknaderna hålls isär hela vägen: SE-källor → SE-kampanjen mot `/`,
// NO-källor → NO-kampanjen mot `/nb`. Den norska butiksmarknaden betalar i
// SEK (butiker/tacklebay.yaml marknader[NO].valuta), så priset i norsk copy
// är butikens 289 kr — samma tal kunden ser på /nb (mätt 2026-09-10).
import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, resolve } from 'node:path';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = resolve(HAR, '..', '..', '..');

const arg = process.argv.slice(2);
const iM = arg.indexOf('--marknad');
const M = (iM >= 0 && arg[iM + 1] ? arg[iM + 1] : 'SE').toUpperCase();
if (!['SE', 'NO'].includes(M)) { console.error(`--marknad ${M}: bara SE eller NO`); process.exit(1); }
const m = M.toLowerCase();
const svans = M === 'NO' ? '-no' : '';

// Media: SE-källorna ligger i Rodholder/media, NO-källorna i Rodholder-NO/media
// (brand-detektorn --marknad NO). Bildannonserna: de brand-/villkorsfixade
// filerna (pipeline/oversatt-bild.py, QA-bild bredvid varje) ligger i BILD; en
// fixad fil gör annonsen körbar oavsett vad källbilden dömdes till. Rena
// källbilder kopieras dit av generatorn så bildlaunchern får EN imgdir.
const MEDIA = join(ROT, '.scratch', 'brand-detektor', M === 'NO' ? 'Rodholder-NO' : 'Rodholder', 'media');
const BILD = join(ROT, '.scratch', 'tacklebay', m, 'bild');

const KAMPANJ = `TACKLEBAY_${M}_Spöhållaren | BE-ROAS 1,67 | 2026-09-10`;
const BRANDPREFIX = 'TackleBayRod';
const LINK = M === 'NO'
  ? 'https://tacklebay.se/nb/products/fiskespohallare-4-pack'
  : 'https://tacklebay.se/products/fiskespohallare-4-pack';
const PAGE = '1283919631474370';
const PIXEL = '1079980541064515';
const ACT = 'act_915422744950975';

const kall = JSON.parse(readFileSync(join(HAR, 'kallannonser.json'), 'utf8'));
const detFil = join(HAR, `brand-detektor${svans}.json`);
const det = existsSync(detFil) ? JSON.parse(readFileSync(detFil, 'utf8')) : { annonser: [] };
const varianter = JSON.parse(readFileSync(join(HAR, `${m}-copy-kallor.json`), 'utf8'));
const nyFil = join(HAR, `${m}-copy-ny.json`);
const nyCopy = existsSync(nyFil) ? JSON.parse(readFileSync(nyFil, 'utf8')) : [];

const domAv = new Map();
for (const a of det.annonser ?? []) domAv.set(String(a.id ?? a.annons), a);
// Manuella domar (ögat): manuella-domar-<m>.json — bara för att FÄLLA en annons
// detektorn friat (whisper hörde talorden fel på NO_GT_1_H2). Aldrig för att fria.
const manFil = join(HAR, `manuella-domar${svans}.json`);
const manuella = existsSync(manFil) ? JSON.parse(readFileSync(manFil, 'utf8')) : {};
const copyAv = new Map(nyCopy.map((c) => [Number(c.variant), c]));
const variantAv = new Map();
for (const v of varianter) for (const namn of v.annonser) variantAv.set(namn, v.variant);

// Konceptet ur ADSETNAMNET i källan ("Fiskespöhållare PD Batch 4" → PD).
const koncept = (adsetNamn) => (String(adsetNamn).match(/\b(PD|CS|SO|GT|SP)\b/) ?? [])[1] ?? null;
// Resten efter källprefixet. NO-källorna heter NO_PD_1_H3 (video) och
// Fiskespöhållare_SO_2_1_NO (bild) — målnamnet bär alltid marknadskoden så
// commission-filtret och räkningen ser landet: TackleBayRod_NO_PD_1_H3 resp.
// TackleBayRod_SO_2_1_NO.
const rest = (namn) => namn.replace(/^(Rodholder|Fiskespöhållare|NO)_/, '');
const malrest = (namn) => {
  const r = rest(namn);
  if (M !== 'NO') return r;
  return /(^NO_|_NO$)/.test(r) ? r : `NO_${r}`;
};

const block = kall[M];
if (!block) { console.error(`kallannonser.json saknar blocket ${M} — marknaden är inte läst.`); process.exit(1); }
if (block.undantag) console.log(`⚠️ ${M}-källorna räknas på ägarens undantag: "${block.undantag}"`);
const kallor = block.annonser.filter((a) => a.med);
const sedda = new Map();
const plan = [];
for (const a of kallor) {
  const k = koncept(a.adset.namn);
  let d = domAv.get(String(a.id)) ?? domAv.get(a.namn);
  const man = manuella[a.namn];
  if (man && man.dom && !['ren', 'bara-copy'].includes(man.dom)) d = { ...(d ?? {}), dom: man.dom, attgöra: [`ögat: ${man.orsak}`] };
  const dom = d?.dom ?? 'odömd';
  const v = variantAv.get(a.namn);
  const copyNy = v != null ? copyAv.get(v) : null;
  const n = (sedda.get(a.namn) ?? 0) + 1;
  sedda.set(a.namn, n);
  const malnamn = n === 1 ? `${BRANDPREFIX}_${malrest(a.namn)}` : `${BRANDPREFIX}_B_${malrest(a.namn)}`;
  const fil = a.typ === 'video' ? `${a.namn}.mp4` : `${a.namn}.jpg`;
  const rad = {
    marknad: M, kalla: a.namn, id: a.id, typ: a.typ, koncept: k, spend: Math.round(a.utfall.spend), kop: a.utfall.kop,
    dom, malnamn, fil, variant: v, med: false, orsak: null,
  };
  // Tvillingar (samma namn, olika video) har sedan körning 2 egna filer och
  // egna transkript (`namn__id`), så de döms var för sig.
  const ocrNyckel = n === 1 ? a.namn : `${a.namn}__${a.id}`;
  const bildFixad = a.typ === 'bild' && existsSync(join(BILD, `${ocrNyckel}.jpg`));
  if (a.typ === 'video') rad.fil = `${ocrNyckel}.mp4`;
  if (!k) rad.orsak = `okänt koncept i adsetnamnet "${a.adset.namn}"`;
  else if (!copyNy) rad.orsak = `copy saknas för variant ${v}`;
  else if (a.typ === 'bild') {
    // `bara-copy` på en bild = bara Meta-texten bär felet, själva bilden är
    // OCR-läst ren — och copyn byts ändå (Fiskespöhållare_SO_2_1_NO, 595 NOK,
    // 6 köp, bästa norska bilden, 2026-09-10).
    if (bildFixad || dom === 'ren' || dom === 'bara-copy') {
      mkdirSync(BILD, { recursive: true });
      if (!bildFixad) copyFileSync(join(MEDIA, `${ocrNyckel}.jpg`), join(BILD, `${ocrNyckel}.jpg`));
      rad.fil = `${ocrNyckel}.jpg`;
      rad.med = true;
      rad.fixad = bildFixad;
    } else rad.orsak = `dom ${dom} — bilden inte fixad (${(d?.attgöra || []).join('; ').slice(0, 100)})`;
  } else if (dom === 'ren' || dom === 'bara-copy') {
    if (!existsSync(join(MEDIA, rad.fil))) rad.orsak = `mediafilen saknas: ${rad.fil}`;
    else rad.med = true;
  } else rad.orsak = `dom ${dom} — ${(d?.attgöra || []).join('; ').slice(0, 140)}`;
  plan.push(rad);
}

const adsets = {};
for (const r of plan.filter((x) => x.med)) {
  const namn = `TACKLEBAY_${M}_Spöhållaren - ${r.koncept}`;
  adsets[namn] ??= { video: [], bild: [] };
  const c = copyAv.get(r.variant);
  const copy = { message: c.message, headline: c.headline ?? '', description: c.description ?? '' };
  if (r.typ === 'video') adsets[namn].video.push({ name: r.malnamn, file: r.fil, copy });
  else adsets[namn].bild.push({ adName: r.malnamn, img: r.fil, copy });
}

const kallText = M === 'NO'
  ? `// Källa: de 20 ACTIVE-annonserna i "Fiskespöhållaren NO | BE-ROAS 1,36 |
// 2026-08-20" (Magiborsten NO 1050941584152547). ⚠️ Källkampanjen är PAUSED —
// den används på ägarens skrivna undantag (produktfilens
// kalla.no_pausad_kalla_ok: Axel 2026-09-10 "Fixa norge också"). Källan rörs inte.
// Samma bevisade creatives, ompekade till TackleBay /nb: egen sida, egen pixel.
// ⚠️ MÅLET är MagiBorsten DK 915422744950975 — OPS Factorys gemensamma konto (SEK).
// Priset: källan sa 269 kr (NOK). TackleBays norska marknad betalar i SEK och
// /nb visar 289,00 kr — copyn säger 289 kr, samma tal som kunden ser.
// Det som ändrats i copyn: priset, "30 dagers åpent kjøp"/"fornøyd-kunde-garanti"
// (TackleBay: 14 dagers angrerett enligt lag), "LAGERRENSING"/"begrenset antall"
// (finns inte) och påhittat kundcitat → butikens riktiga recensioner.
// Copy på bokmål av subagent (sonnet), aldrig rakt översatt ur svenskan.`
  : `// Källa: Bäverbutikens ACTIVE-annonser i "Fiskespöhållaren | BE ROAS 1.50 |
// Launch 2026-08-18" (MagiBorsten 1867947880635861, 89 aktiva). Samma bevisade
// creatives, ompekade till TackleBay: egen sida, egen pixel, egen produktsida.
// ⚠️ MÅLET är MagiBorsten DK 915422744950975 — OPS Factorys gemensamma konto (SEK).
// Priset 289 kr är IDENTISKT i källan och hos TackleBay — inga pristal ändrade.
// Det som ändrats i copyn: fraktgränsen "över 300 kr" (TackleBay: fri frakt),
// "30 dagars nöjd-kund-garanti" (TackleBay: 14 dagars ångerrätt enligt lag),
// "40 % RABATT IDAG ENDAST" (finns inte), brådska och påhittade citat →
// butikens sju riktiga femstjärniga recensioner. Copy av subagent (sonnet).`;

const huvud = (typ) => `// ${m}-tacklebay-${typ}.config.mjs — TackleBay ${M}, byggd av /ny-annonser 2026-09-10.
//
${kallText}
// BE-ROAS 1,67 = 289 / (289 − 116) — utan moms (Axels besked 2026-09-09).
// Genererad av factory/output/fiskespohallare-4-pack/bygg-vagkonfig.mjs${M === 'NO' ? ' --marknad NO' : ''}.
// Allt föds PAUSED — Axel skriver "Launch: TackleBay".
export default {
  act: '${ACT}',
  page: '${PAGE}',   // TackleBay (me/accounts: ADVERTISE, mätt 2026-09-10)
  pixel: '${PIXEL}', // TackleBay-pixeln, avfyrad 2026-09-10 18:07
  country: '${M}',
  campaignName: ${JSON.stringify(KAMPANJ)},
  link: '${LINK}',
  dailyBudget: '100000', // öre SEK = 1000 kr/dag, CBO
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
`;

const j = (x) => JSON.stringify(x);
const videoCfg = `${huvud('video')}  videoDir: '../.scratch/brand-detektor/${M === 'NO' ? 'Rodholder-NO' : 'Rodholder'}/media',
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
writeFileSync(join(ROT, 'pipeline', 'waves', `${m}-tacklebay-video.config.mjs`), videoCfg);
writeFileSync(join(ROT, 'pipeline', 'waves', `${m}-tacklebay-image.config.mjs`), bildCfg);
writeFileSync(join(HAR, `vagplan${svans}.json`), JSON.stringify({ marknad: M, kampanj: KAMPANJ, datum: new Date().toISOString().slice(0, 10), plan }, null, 2));

// Tabellen: kampanj → adsets → antal annonser per adset.
console.log(`\n${KAMPANJ}  (CBO 1 000 kr/dag, PAUSED, geo ${M}, länk ${LINK})`);
for (const [namn, v] of Object.entries(adsets)) console.log(`  ${namn.padEnd(36)} video ${String(v.video.length).padStart(2)}  bild ${String(v.bild.length).padStart(2)}`);
const med = plan.filter((x) => x.med);
console.log(`\n${med.length} av ${plan.length} källannonser i konfigen. Utanför, namngivna:`);
const perOrsak = {};
for (const r of plan.filter((x) => !x.med)) (perOrsak[r.orsak.split(' — ')[0]] ??= []).push(`${r.kalla} (${r.spend} kr)`);
for (const [orsak, lista] of Object.entries(perOrsak)) console.log(`  ${orsak}: ${lista.length} — ${lista.slice(0, 8).join(', ')}${lista.length > 8 ? ' …' : ''}`);
