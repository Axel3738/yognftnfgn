// Uppvärmd vattenskål (TEMU-B10-VATTENSKAL) — bygger produktbilderna.
//
// Källa: /tmp/b9/b/bilder/image18.jpg (1600×1600, leverantörens bild).
// image8.png (459 px) är SAMMA motiv i lägre upplösning och används inte.
//
// Beskuret bort: hela nedre textbandet "EU (欧规)" (kinesiskt tecken + engelsk
// rubrik, y 1276–1423). Kvar och använt: skålen med sladden (y 215–1103),
// pluggcirkeln nere till vänster och uttagsikonen nere till höger — inga av
// dem bär text.
// ⚠ På själva skålen sitter leverantörens etikett "HEATED PET BOWL" (och
// samma ord på den svarta toppen). Den är en del av den fysiska produkten
// (fakta.mjs: etikett) och går inte att beskära bort utan att ta bort skålen.
// Ordet "MAX" inuti skålen är gjutet i plasten. Inget av detta är vår text.
//
// LÅSTA FAKTA (temu/batch9/fakta.mjs): 2,2 liter · 220–230 V · EU-kontakt ·
// grön/svart · sladd med metallspiral. Inget om effekt, temperatur eller
// minusgrader — bilden får bara påstå att skålen är uppvärmd.
//
// Kör:  node temu/batch9/bilder-vattenskal.mjs   # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA = '/tmp/b9/b/bilder/image18.jpg';
const UT = { sv: '/tmp/b9/ut/vattenskal', no: '/tmp/b9/ut-no/vattenskal' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt ur källbilden (x, y, bredd, höjd i 1600×1600-koordinater) --------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  skal:  [184, 175, 1364, 968],    // hela skålen + sladdslingan, 40 px luft runt om; slutar y 1143, ovanför textbandet
  sladd: [1180, 300, 360, 420],    // sladdslingorna med metallspiralen där de går in i skålens högra sida
  plugg: [96, 1184, 334, 334],     // den grå cirkeln med EU-stickproppen (ingen text)
  uttag: [1160, 1265, 175, 175],   // linjeikonen av ett EU-uttag (ingen text)
  sida:  [1130, 560, 330, 420],    // skålens gröna högervägg + svart sladd, fri från etiketten
};

async function utsnitt(namn) {
  const [left, top, width, height] = UTSNITT[namn];
  return sharp(KÄLLA).extract({ left, top, width, height }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

/* ---------- 1. hero — skålen med sladden, utan leverantörens textband ---------- */
async function hero() {
  const p = await passa(await utsnitt('skal'), 1520, 1520);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/vattenskal-hero.jpg`);
  console.log('✔ vattenskal-hero.jpg (sv + no)');
}

/* ---------- 2. detalj — sladden med metallspiralen ---------- */
async function detalj() {
  const p = await passa(await utsnitt('sladd'), 1400, 1440);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/vattenskal-detalj.jpg`);
  console.log('✔ vattenskal-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara fakta ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'VATTENSKÅLEN I SIFFROR',
    rader: [
      { ruta: '2,2 L',      titel: 'VOLYM',       under: 'Skålen rymmer 2,2 liter vatten', bild: 'skal' },
      { ruta: '220–230 V',  titel: 'NÄTDRIFT',    under: 'Drivs från ett vanligt vägguttag', bild: 'uttag' },
      { ruta: 'EU',         titel: 'STICKPROPP',  under: 'Kontakt av EU-typ', bild: 'plugg' },
      { ruta: 'METALL',     titel: 'SLADDSPIRAL', under: 'Sladden har en spiral av metall', bild: 'sladd' },
      { ruta: 'GRÖN/SVART', titel: 'FÄRG',        under: 'Grön skål med svarta detaljer', bild: 'sida' },
    ],
  },
  no: {
    rubrik: 'VANNSKÅLEN I TALL',
    rader: [
      { ruta: '2,2 L',      titel: 'VOLUM',          under: 'Skålen rommer 2,2 liter vann', bild: 'skal' },
      { ruta: '220–230 V',  titel: 'NETTDRIFT',      under: 'Drives fra en vanlig stikkontakt', bild: 'uttag' },
      { ruta: 'EU',         titel: 'STØPSEL',        under: 'Støpsel av EU-type', bild: 'plugg' },
      { ruta: 'METALL',     titel: 'LEDNINGSSPIRAL', under: 'Ledningen har en spiral av metall', bild: 'sladd' },
      { ruta: 'GRØNN/SVART', titel: 'FARGE',         under: 'Grønn skål med svarte detaljer', bild: 'sida' },
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
    const rw = Math.max(130, r.ruta.length * 23 + 44);
    svg.push(`<rect x="96" y="${y + 170}" width="${rw}" height="58" rx="10" fill="${GUL}"/>`);
    svg.push(`<text x="${96 + rw / 2}" y="${y + 212}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="36" fill="#12212b">${esc(r.ruta)}</text>`);
    const p = await passa(await utsnitt(r.bild), 480, radH - 56);
    lager.push({ input: p.buf, top: y + Math.floor((radH - p.h) / 2), left: 1510 - p.w });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/vattenskal-fakta.jpg`);
  console.log(`✔ vattenskal-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
