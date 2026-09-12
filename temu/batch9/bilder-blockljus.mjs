// LED-blockljus i grått glas, 3-pack med fjärrkontroll (TEMU-B10-BLOCKLJUS) —
// bygger produktbilderna.
//
// Källor:
//   /tmp/b9/b/bilder/image9.png (800×800, offertens bild: tre ljus + fjärren).
//     GRANSKAD: ingen marknadsföringstext, ingen vattenstämpel, ingen logotyp.
//     Fjärrkontrollen INGÅR och får synas. Dess knappar bär tryckt text
//     (ON / OFF / TIMER / 2H 4H 6H 8H / MODE / Candle / Light / DIM) — det är
//     produktens egen märkning som kunden får hem, inte leverantörsreklam, och
//     den beskärs därför INTE bort.
//   /tmp/b9/b/bilder/image16.jpg (1200×1200, tända på ett bord). Bilden visar FEM
//     ljus — två i bakgrunden som INTE ingår (ett med ljusslinga) — och en extra
//     svart fjärr som inte ingår. BESKURET BORT: allt utom det höga ljuset
//     (x 105–445, y 250–823): utsnittet slutar ovanför den vita fjärren (y ≥ 825),
//     vänster om mittljuset (x ≥ 453) och långt från bakgrundsljusen (x ≥ 700).
//   /tmp/b9/b/t-pillar.jpg (800×800) — samma bild som image9.png → används inte.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): 3 st, höjd 10 / 12,5 / 15 cm, diameter
// 7,8 cm, grått glas, fjärrkontroll, timer 2/4/6/8 h, 3 × AA per ljus INGÅR INTE.
// "Äkta vax" står bara i Temu-titeln och påstås inte.
//
// Kör:
//   node temu/batch9/bilder-blockljus.mjs      # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const K9  = process.env.BLOCKLJUS_KALLA || '/tmp/b9/b/bilder/image9.png';    // offertens bild
const K16 = process.env.BLOCKLJUS_BORD  || '/tmp/b9/b/bilder/image16.jpg';   // tända på bord
const ID = 'blockljus';
const UT = { sv: `/tmp/b9/ut/${ID}`, no: `/tmp/b9/ut-no/${ID}` };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt (fil + x, y, bredd, höjd i källbildens egna pixlar) --------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  hela:    { fil: K9,  box: [0, 0, 800, 800] },       // tre ljus + fjärren (ingår) — räknebart: 3
  toppar:  { fil: K9,  box: [0, 0, 800, 338] },       // de tre kanterna på tre olika höjder, ovanför fjärren
  kant:    { fil: K9,  box: [145, 235, 330, 235] },   // mittljusets glaskant uppifrån + flamman — diametern
  fjarr:   { fil: K9,  box: [615, 335, 180, 380] },   // fjärrkontrollen med timerknapparna
  fot:     { fil: K9,  box: [145, 630, 330, 170] },   // mittljusets fot — batteriraden
  hogt:    { fil: K16, box: [105, 250, 340, 573] },   // det höga ljuset tänt på bordet, inget annat i rutan
};

async function utsnitt(namn) {
  const { fil, box: [left, top, width, height] } = UTSNITT[namn];
  return sharp(fil).extract({ left, top, width, height }).flatten({ background: '#ffffff' }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

/* ---------- flerpack-badge (temu/batch6/antalsbadge.mjs, skalad 1000 → 1600) ---------- */
const BADGE = { sv: ['3 ST', 'INGÅR'], no: ['3 STK', 'FØLGER MED'] };
function badge(språk) {
  const [rad1, rad2] = BADGE[språk], bw = språk === 'sv' ? 480 : 608, bh = 211;
  return Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
    <rect x="54" y="54" width="${bw}" height="${bh}" rx="22" fill="#1c1c1c" opacity="0.93"/>
    <text x="${54 + bw / 2}" y="150" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="96" fill="#ffffff">${esc(rad1)}</text>
    <text x="${54 + bw / 2}" y="222" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="54" fill="${GUL}" letter-spacing="3">${esc(rad2)}</text>
  </svg>`);
}

/* ---------- 1. hero — offertens bild, nedskalad till 1290 och lagd nere till höger
   så att badgen får fri vit yta uppe till vänster (annars täcker den det höga ljuset) ---------- */
async function hero() {
  const p = await passa(await utsnitt('hela'), 1290, 1290);
  for (const [språk, d] of Object.entries(UT)) {
    await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
      .composite([
        { input: p.buf, top: S - 40 - p.h, left: S - 40 - p.w },
        { input: badge(språk), top: 0, left: 0 },
      ]).jpeg({ quality: 92 }).toFile(`${d}/${ID}-hero.jpg`);
  }
  console.log(`✔ ${ID}-hero.jpg (sv + no, badge per språk)`);
}

/* ---------- 2. detalj — det höga ljuset tänt på bordet ---------- */
async function detalj() {
  const p = await passa(await utsnitt('hogt'), 1520, 1440);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/${ID}-detalj.jpg`);
  console.log(`✔ ${ID}-detalj.jpg (sv + no)`);
}

/* ---------- 3. faktabild — bara fakta ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'SETET I SIFFROR',
    rader: [
      { ruta: '3 ST',              titel: 'BLOCKLJUS I SETET',      under: 'Tre höjder i grått glas', bild: 'hela' },
      { ruta: '10 · 12,5 · 15 CM', titel: 'HÖJDERNA',               under: 'Ett ljus i varje höjd', bild: 'toppar' },
      { ruta: '7,8 CM',            titel: 'DIAMETER',               under: 'Samma bredd på alla tre', bild: 'kant' },
      { ruta: 'TIMER',             titel: '2, 4, 6 ELLER 8 TIMMAR', under: 'Ställs in på fjärrkontrollen som ingår', bild: 'fjarr' },
      { ruta: '3 × AA',            titel: 'BATTERIER PER LJUS',     under: 'Ingår inte – köps separat', bild: 'fot' },
    ],
  },
  no: {
    rubrik: 'SETTET I TALL',
    rader: [
      { ruta: '3 STK',             titel: 'KUBBELYS I SETTET',      under: 'Tre høyder i grått glass', bild: 'hela' },
      { ruta: '10 · 12,5 · 15 CM', titel: 'HØYDENE',                under: 'Ett lys i hver høyde', bild: 'toppar' },
      { ruta: '7,8 CM',            titel: 'DIAMETER',               under: 'Samme bredde på alle tre', bild: 'kant' },
      { ruta: 'TIMER',             titel: '2, 4, 6 ELLER 8 TIMER',  under: 'Stilles inn på fjernkontrollen som følger med', bild: 'fjarr' },
      { ruta: '3 × AA',            titel: 'BATTERIER PER LYS',      under: 'Følger ikke med – kjøpes separat', bild: 'fot' },
    ],
  },
};

async function fakta(språk) {
  const O = ORD[språk];
  const bandH = 120, radH = Math.floor((S - bandH) / O.rader.length);   // 296
  const lager = [];
  const svg = [
    `<rect x="0" y="0" width="${S}" height="${bandH}" fill="${BLÅ}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#ffffff" letter-spacing="3">${esc(O.rubrik)}</text>`,
  ];
  for (let g = 0; g < O.rader.length; g++) {
    const r = O.rader[g], y = bandH + g * radH;
    if (g) svg.push(`<rect x="90" y="${y}" width="${S - 180}" height="2" fill="#e4e8ea"/>`);
    svg.push(`<text x="96" y="${y + 100}" font-family="DejaVu Sans" font-weight="bold" font-size="42" fill="${BLÅ}" letter-spacing="1">${esc(r.titel)}</text>`);
    svg.push(`<text x="96" y="${y + 144}" font-family="DejaVu Sans" font-size="27" fill="${GRÅ}">${esc(r.under)}</text>`);
    const rw = Math.max(130, r.ruta.length * 24 + 56);
    svg.push(`<rect x="96" y="${y + 170}" width="${rw}" height="58" rx="10" fill="${GUL}"/>`);
    svg.push(`<text x="${96 + rw / 2}" y="${y + 212}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="36" fill="#12212b">${esc(r.ruta)}</text>`);
    const p = await passa(await utsnitt(r.bild), 480, radH - 56);
    lager.push({ input: p.buf, top: y + Math.floor((radH - p.h) / 2), left: 1510 - p.w });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/${ID}-fakta.jpg`);
  console.log(`✔ ${ID}-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
