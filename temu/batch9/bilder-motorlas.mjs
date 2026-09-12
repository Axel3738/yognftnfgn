// Motorlås för utombordare (TEMU-B10-MOTORLAS) — bygger produktbilderna.
//
// Källa: /tmp/b9/b/bilder/image10.png (449×461, leverantörens foto: rostfri
// låsbalk, två nycklar och en gul flytande nyckelring på ett vitt bord, med
// en hamn i bakgrunden).
//
// Beskuret bort: den gula vattenstämpeln "Move Time Store" sitter på bordet
// strax ovanför låsbalken (x 133–312, y 224–239). Låsbalkens överkant ligger
// på y ≈ 246, så allt ovanför y = 245 klipps bort — därmed försvinner även
// hamnen i bakgrunden. Inget målas över.
// Bordet i fotot är ljusgrått (~225–235), inte vitt. Utsnitten tonas därför
// mjukt ut mot den vita bakgrunden i sidorna och nederkanten (alfa-ramp), så
// ingen hård grå rektangel syns. Överkanten tonas INTE — där ligger låsbalkens
// blanka kant direkt i snittet och skulle annars försvinna i vitt.
//
// LÅSTA FAKTA (temu/batch9/fakta.mjs): rostfritt stål · 2 nycklar · flytande
// nyckelring · låser utombordarens fästskruvar. Inga mått.
//
// Kör:  node temu/batch9/bilder-motorlas.mjs   # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA = '/tmp/b9/b/bilder/image10.png';
const UT = { sv: '/tmp/b9/ut/motorlas', no: '/tmp/b9/ut-no/motorlas' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt ur källbilden (x, y, bredd, höjd i 449×461-koordinater) --------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  allt:     [0, 245, 449, 216],     // hela nedre delen: låsbalk + nycklar + nyckelring, precis under vattenstämpeln (y ≤ 239)
  balk:     [15, 246, 210, 75],     // låsbalkens vänstra halva: borstat stål och ändstycket, inga nycklar (de börjar x 260)
  nycklar:  [248, 298, 145, 90],    // de två nycklarna (bbox 260–378 × 308–378)
  ring:     [98, 320, 195, 100],    // den gula flytande nyckelringen med kedjan (bbox 110–280 × 330–414)
  cylinder: [205, 248, 120, 58],    // nyckelcylindern på balken, närbild (cylindern ≈ 255–290 × 262–290)
  nedre:    [90, 292, 320, 135],    // nycklar + nyckelring tillsammans = detaljbilden
};

// Tonar ut kanterna mot vitt: alfa 0 → 1 över angivet antal px från varje kant (0 = ingen toning).
async function tona(buf, { top = 0, right = 0, bottom = 0, left = 0 }) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let a = 1;
    if (left && x + 1 < left) a = Math.min(a, (x + 1) / left);
    if (right && w - x < right) a = Math.min(a, (w - x) / right);
    if (top && y + 1 < top) a = Math.min(a, (y + 1) / top);
    if (bottom && h - y < bottom) a = Math.min(a, (h - y) / bottom);
    if (a < 1) data[(y * w + x) * 4 + 3] = Math.round(255 * a);
  }
  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function utsnitt(namn) {
  const [left, top, width, height] = UTSNITT[namn];
  return sharp(KÄLLA).extract({ left, top, width, height }).flatten({ background: '#ffffff' }).png().toBuffer();
}

// Skalar in en bild i en ruta, tonar kanterna och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH, toning = null) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  let ut = await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer();
  if (toning) ut = await tona(ut, toning);
  return { buf: ut, w, h };
}

/* ---------- 1. hero — låset, nycklarna och nyckelringen på bordet ---------- */
async function hero() {
  const p = await passa(await utsnitt('allt'), 1520, 1520, { right: 70, bottom: 70, left: 70 });
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/motorlas-hero.jpg`);
  console.log('✔ motorlas-hero.jpg (sv + no)');
}

/* ---------- 2. detalj — de två nycklarna och den flytande nyckelringen ---------- */
async function detalj() {
  const p = await passa(await utsnitt('nedre'), 1400, 1440, { top: 60, right: 60, bottom: 60, left: 60 });
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/motorlas-detalj.jpg`);
  console.log('✔ motorlas-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara fakta ur fakta.mjs (inga mått finns) ---------- */
const ORD = {
  sv: {
    rubrik: 'LÅSET I KORTHET',
    rader: [
      { ruta: 'ROSTFRITT',   titel: 'MATERIAL',   under: 'Låsbalk i rostfritt stål', bild: 'balk' },
      { ruta: '2 ST',        titel: 'NYCKLAR',    under: 'Två nycklar ingår', bild: 'nycklar' },
      { ruta: 'FLYTANDE',    titel: 'NYCKELRING', under: 'Gul nyckelring som flyter om den tappas i sjön', bild: 'ring' },
      { ruta: 'UTOMBORDARE', titel: 'ANVÄNDNING', under: 'Låser motorns fästskruvar mot båten', bild: 'cylinder' },
    ],
  },
  no: {
    rubrik: 'LÅSEN KORT FORTALT',
    rader: [
      { ruta: 'RUSTFRITT',    titel: 'MATERIALE',  under: 'Låsebjelke i rustfritt stål', bild: 'balk' },
      { ruta: '2 STK',        titel: 'NØKLER',     under: 'To nøkler følger med', bild: 'nycklar' },
      { ruta: 'FLYTENDE',     titel: 'NØKKELRING', under: 'Gul nøkkelring som flyter om den mistes i sjøen', bild: 'ring' },
      { ruta: 'PÅHENGSMOTOR', titel: 'BRUK',       under: 'Låser motorens festeskruer til båten', bild: 'cylinder' },
    ],
  },
};

async function fakta(språk) {
  const O = ORD[språk];
  const bandH = 120, radH = Math.floor((S - bandH) / O.rader.length);   // 370
  const lager = [];
  const svg = [
    `<rect x="0" y="0" width="${S}" height="${bandH}" fill="${BLÅ}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#ffffff" letter-spacing="3">${esc(O.rubrik)}</text>`,
  ];
  for (let g = 0; g < O.rader.length; g++) {
    const r = O.rader[g], y = bandH + g * radH;
    if (g) svg.push(`<rect x="90" y="${y}" width="${S - 180}" height="2" fill="#e4e8ea"/>`);
    svg.push(`<text x="96" y="${y + 120}" font-family="DejaVu Sans" font-weight="bold" font-size="42" fill="${BLÅ}" letter-spacing="1">${esc(r.titel)}</text>`);
    svg.push(`<text x="96" y="${y + 164}" font-family="DejaVu Sans" font-size="27" fill="${GRÅ}">${esc(r.under)}</text>`);
    const rw = Math.max(130, r.ruta.length * 27 + 44);          // 27 px/tecken: rutorna här är långa versalord (UTOMBORDARE, PÅHENGSMOTOR)
    svg.push(`<rect x="96" y="${y + 190}" width="${rw}" height="58" rx="10" fill="${GUL}"/>`);
    svg.push(`<text x="${96 + rw / 2}" y="${y + 232}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="36" fill="#12212b">${esc(r.ruta)}</text>`);
    const p = await passa(await utsnitt(r.bild), 480, radH - 56, { top: 24, right: 24, bottom: 24, left: 24 });
    lager.push({ input: p.buf, top: y + Math.floor((radH - p.h) / 2), left: 1510 - p.w });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/motorlas-fakta.jpg`);
  console.log(`✔ motorlas-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
