// Snöskyffel, batteridriven — BARA maskinen (TEMU-B10-SNOSKYFFEL) — bygger produktbilderna.
//
// Källor (båda granskade i Read-verktyget innan utsnitten låstes):
//   /tmp/b9/b/bilder/image13.jpg (800×800) — den bara maskinen på vit botten. Överst
//     kinesisk rubrik 锂电池除雪机 (y 40–120) och badgen 裸机 (y 136–175) — BESKÄRS BORT,
//     maskinen börjar först vid y 201 så allt under y 185 är rent.
//   /tmp/b9/b/bilder/image12.png (600×575) — ONEVAN-marknadsbild. Logotyp + ikoner
//     överst, engelska badgar till vänster (12 INCH / 6 INCH / 26FT/8M / BL, x ≤ 215),
//     inset "60° adjustable" till höger (x ≥ 440), TVÅ BATTERIER nere till höger
//     (x ≥ 425) och ett batteri på handtaget överst (y ≤ 110). Batterier INGÅR INTE
//     och får inte synas — därför används bara det smala mittfältet x 222–420,
//     y 115–560 där maskinen står i snön. Allt annat beskärs bort.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): röjbredd 30 cm, röjdjup 15 cm, kastlängd 8 m
// (leverantörens siffror), BARA maskinen ingår — batteri och laddare köps separat,
// batterier av Makita-typ (Axels uppgift, inte offertens → skriv "Makita-typ").
// Faktabilden bär en egen rad som säger att batteri och laddare inte ingår.
// fakta.mjs säger "Bara SE — Norge oversize" — ut-no byggs ändå enligt bildbriefen
// men kan lämnas oanvänd.
//
// Kör:
//   node temu/batch9/bilder-snoskyffel.mjs        # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const K = {
  maskin: '/tmp/b9/b/bilder/image13.jpg',   // bar maskin, vit botten
  snö:    '/tmp/b9/b/bilder/image12.png',   // i bruk, PNG med alfa → plattas mot vitt
};
const UT = { sv: '/tmp/b9/ut/snoskyffel', no: '/tmp/b9/ut-no/snoskyffel' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt: [källa, x, y, bredd, höjd] i källbildens egna pixlar ----------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.               */
const UTSNITT = {
  maskin: ['maskin', 150, 185, 365, 590],   // hela maskinen (bbox 199–467 × 201–758), badgen slutar y 175
  huvud:  ['maskin', 190, 596, 235, 172],   // skyffelhuvudet framifrån: blad + skrapa, inget skaft
  faste:  ['maskin', 370, 190, 120, 155],   // toppgreppet med tom batteriskena — så syns "utan batteri"
  ibruk:  ['snö',    222, 115, 198, 430],   // skaft + ben + huvud i snön; x ≤ 420 håller batterierna utanför
  kast:   ['snö',    222, 330, 198, 215],   // nedre skaftet + huvudet, snön sprutar åt vänster
  isnon:  ['snö',    100, 393, 320, 167],   // huvudet nedgrävt i snön; y ≥ 393 håller BL-inseten utanför
};

async function utsnitt(namn) {
  const [k, left, top, width, height] = UTSNITT[namn];
  return sharp(K[k]).flatten({ background: '#ffffff' }).extract({ left, top, width, height }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

async function kvadrat(lager) {
  return sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toBuffer();
}

/* ---------- 1. hero — den bara maskinen, kinesisk text bortskuren ---------- */
async function hero() {
  const p = await passa(await utsnitt('maskin'), S - 80, S - 80);
  const jpg = await kvadrat([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }]);
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/snoskyffel-hero.jpg`);
  console.log('✔ snoskyffel-hero.jpg (sv + no)');
}

/* ---------- 2. detalj — maskinen i bruk, utan batterier och utan text ---------- */
async function detalj() {
  const p = await passa(await utsnitt('ibruk'), S - 80, S - 80);
  const jpg = await kvadrat([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }]);
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/snoskyffel-detalj.jpg`);
  console.log('✔ snoskyffel-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara siffror ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'MASKINEN I SIFFROR',
    rader: [
      { ruta: '30 CM',      titel: 'RÖJBREDD',            under: 'Så bred remsa tar den per drag', bild: 'huvud' },
      { ruta: '15 CM',      titel: 'RÖJDJUP',             under: 'Snödjup den tar i ett drag', bild: 'isnon' },
      { ruta: '8 M',        titel: 'KASTLÄNGD',           under: 'Upp till 8 m enligt leverantören', bild: 'kast' },
      { ruta: 'MAKITA-TYP', titel: 'BATTERIFÄSTE',        under: 'Passar batterier av Makita-typ', bild: 'faste' },
      { ruta: 'INGÅR EJ',   titel: 'BATTERI OCH LADDARE', under: 'Bara maskinen ingår – köps separat', bild: 'maskin' },
    ],
  },
  no: {
    rubrik: 'MASKINEN I TALL',
    rader: [
      { ruta: '30 CM',           titel: 'RYDDEBREDDE',      under: 'Så bred stripe tar den per drag', bild: 'huvud' },
      { ruta: '15 CM',           titel: 'RYDDEDYBDE',       under: 'Snødybde den tar i ett drag', bild: 'isnon' },
      { ruta: '8 M',             titel: 'KASTELENGDE',      under: 'Opptil 8 m ifølge leverandøren', bild: 'kast' },
      { ruta: 'MAKITA-TYPE',     titel: 'BATTERIFESTE',     under: 'Passer batterier av Makita-type', bild: 'faste' },
      { ruta: 'FØLGER IKKE MED', titel: 'BATTERI OG LADER', under: 'Bare maskinen følger med – kjøpes separat', bild: 'maskin' },
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
  await sharp(await kvadrat(lager)).toFile(`${UT[språk]}/snoskyffel-fakta.jpg`);
  console.log(`✔ snoskyffel-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
