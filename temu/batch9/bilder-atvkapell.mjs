// ATV-kapell (TEMU-B10-ATVKAPELL) — bygger produktbilderna deterministiskt med sharp.
//
// Källa: /tmp/b9/b/bilder/image11.png (488×481, enda bilden). ATV under svart kapell,
// omgiven av leverantörens layout: ordet "size" uppe t.v., storlekstabell M–XXXL uppe
// t.h. (x ≥ 307, y ≤ 150), måttlinjer L/W/H med bokstäver, en ATV-förarsiluett nere t.h.,
// ramlinjer på y 15 och 476–478 samt en svart list längs vänsterkanten (x 0–5).
// ATV:n själv ligger på x 53–349, y 117–373 (uppmätt pixel för pixel).
//
// Så här rensas den:
//   1. Beskärning till x 44–360, y 108–378 tar bort "size", H-linjen, H, W, siluetten,
//      ramlinjerna och listen.
//   2. Tre rester ligger kvar INNE i rutan, alla på helt vit bakgrund (255,255,255):
//      tabellens nedre vänstra hörn, L-linjen med bokstaven L och W-linjens vänstra del.
//      De målas över med exakt bakgrundsfärgen (vitt) — tillåtet enligt bildbriefen
//      eftersom ytan runt dem är enfärgad. Polygonerna ligger ≥ 3 px från linjerna och
//      ≥ 5 px från däcken (kontrollerat i 6× zoom efter körning).
//
// ⚠️ Källan är bara 488 px — hero blir uppskalad ~4,8× (lanczos3 + lätt skärpa). Det
// duger enligt briefen men är mjukt. Ingen annan bild finns i skörden.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): storlek 3XL (XXXL) = 256 × 110 × 120 cm, svart.
// Bara den storleken säljs — tabellen med M–XXL får inte synas.
//
// Kör:  node temu/batch9/bilder-atvkapell.mjs   # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA = '/tmp/b9/b/bilder/image11.png';
const ID = 'atvkapell';
const UT = { sv: `/tmp/b9/ut/${ID}`, no: `/tmp/b9/ut-no/${ID}` };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- 0. den rensade källan: beskuren + vitmålade rester ----------
   Koordinaterna nedan är i ORIGINALETS pixlar (488×481) och räknas om till rutan.  */
const RUTA = { left: 44, top: 108, width: 316, height: 270 };
const VITT = [
  // tabellens nedre vänstra hörn (ram + "XXL"/"XXXL"-celler). Kapellet når x ≤ 297 på y ≤ 153.
  { typ: 'rect', x: 303, y: 100, w: 70, h: 53 },
  // L-linjen (40,297)→(152,378) + bokstaven L (58–63, 328–337): allt nedanför en linje 3 px
  // ovanför måttlinjen. Framdäckets underkant ligger på y ≈ 358 vid x 140 → 5 px marginal.
  { typ: 'poly', p: [[44, 297], [165, 383], [165, 400], [44, 400]] },
  // W-linjen (180,383)→(343,346) + bokstaven W (243–253, 383–392). Bakhjulets underkant
  // ligger på y ≈ 342 vid x 310 → polygonens kant på 353 där.
  { typ: 'poly', p: [[150, 387], [350, 342], [360, 342], [360, 400], [150, 400]] },
];

let REN;   // buffert med den rensade rutan (PNG, 316×270)
async function ren() {
  if (REN) return REN;
  const former = VITT.map((v) => v.typ === 'rect'
    ? `<rect x="${v.x - RUTA.left}" y="${v.y - RUTA.top}" width="${v.w}" height="${v.h}" fill="#ffffff"/>`
    : `<polygon points="${v.p.map(([x, y]) => `${x - RUTA.left},${y - RUTA.top}`).join(' ')}" fill="#ffffff"/>`);
  const svg = `<svg width="${RUTA.width}" height="${RUTA.height}" xmlns="http://www.w3.org/2000/svg">${former.join('')}</svg>`;
  REN = await sharp(KÄLLA).extract(RUTA).flatten({ background: '#ffffff' })
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toBuffer();
  return REN;
}

/* ---------- utsnitt ur den RENSADE rutan (x, y, bredd, höjd i rutans 316×270) ----------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.               */
const UTSNITT = {
  hel:    [0, 0, 316, 270],      // hela ATV:n under kapellet
  sida:   [0, 0, 226, 270],      // vänster/bak: kapellet längs hela sidan
  front:  [90, 30, 226, 240],    // fram: grillen under kapellets framkant + framhjul
  hojd:   [60, 0, 200, 270],     // kapellets topp ner till marken
  tyg:    [40, 8, 250, 130],     // kapellets överdel, tyget
  detalj: [90, 30, 226, 240],    // detaljbilden = fronten
};

async function utsnitt(namn) {
  const [left, top, width, height] = UTSNITT[namn];
  return sharp(await ren()).extract({ left, top, width, height }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

async function vitKvadrat(p) {
  return sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
}

/* ---------- 1. hero — hela ATV:n under kapellet, 40 px vit marginal ---------- */
async function hero() {
  const jpg = await vitKvadrat(await passa(await utsnitt('hel'), S - 80, S - 80));
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/${ID}-hero.jpg`);
  console.log(`✔ ${ID}-hero.jpg (sv + no)`);
}

/* ---------- 2. detalj — fronten: grillen under kapellets framkant ---------- */
async function detalj() {
  const jpg = await vitKvadrat(await passa(await utsnitt('detalj'), 1400, 1440));
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/${ID}-detalj.jpg`);
  console.log(`✔ ${ID}-detalj.jpg (sv + no)`);
}

/* ---------- 3. faktabild — bara siffror ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'KAPELLET I SIFFROR',
    rader: [
      { ruta: '3XL',    titel: 'STORLEK', under: 'Enda storleken vi säljer', bild: 'hel' },
      { ruta: '256 CM', titel: 'LÄNGD',   under: 'Kapellets längd', bild: 'sida' },
      { ruta: '110 CM', titel: 'BREDD',   under: 'Kapellets bredd', bild: 'front' },
      { ruta: '120 CM', titel: 'HÖJD',    under: 'Kapellets höjd', bild: 'hojd' },
      { ruta: 'SVART',  titel: 'FÄRG',    under: 'Kapellets färg', bild: 'tyg' },
    ],
  },
  no: {
    rubrik: 'TREKKET I TALL',
    rader: [
      { ruta: '3XL',    titel: 'STØRRELSE', under: 'Eneste størrelsen vi selger', bild: 'hel' },
      { ruta: '256 CM', titel: 'LENGDE',    under: 'Trekkets lengde', bild: 'sida' },
      { ruta: '110 CM', titel: 'BREDDE',    under: 'Trekkets bredde', bild: 'front' },
      { ruta: '120 CM', titel: 'HØYDE',     under: 'Trekkets høyde', bild: 'hojd' },
      { ruta: 'SVART',  titel: 'FARGE',     under: 'Trekkets farge', bild: 'tyg' },
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
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/${ID}-fakta.jpg`);
  console.log(`✔ ${ID}-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
const arg = process.argv.slice(2);
if (arg[0] === '--ren') {                        // felsökning: spara den rensade rutan uppskalad 6×
  await sharp(await ren()).resize(RUTA.width * 6, RUTA.height * 6, { kernel: 'nearest' }).png().toFile(arg[1] || '/tmp/b9/atv-ren-6x.png');
  console.log('✔ rensad ruta sparad');
} else { await hero(); await detalj(); await fakta('sv'); await fakta('no'); }
