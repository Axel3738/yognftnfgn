// Snöflingor till garageporten, 25-pack (TEMU-B10-SNOFLINGOR) — bygger produktbilderna.
//
// Källa: /tmp/b9/b/bilder/image20.png (597×573, leverantörens bild: överst ett
// rutnät med alla flingorna, underst en garageport med flingorna uppsatta).
// Bilden är GRANSKAD i zoom (×2,5): ingen text, ingen vattenstämpel, ingen logotyp.
// Rutnätet (y 0–320) och porten (y 322–573) beskärs isär för komposition —
// inget målas över. Portens yttersta högerkant (x > 590) tas bort: där sticker
// ett orange föremål in från bildkanten.
//
// INTE använda (och varför):
//   image27.jpg — måttbilden "4.1cm/1.6inch · 5.0cm/2.0inch". Texten sitter på en
//                 fotoyta och kan inte täckas; det som blir kvar när texten beskärs
//                 bort är en hand med ett MÖRKT galax-klistermärke som inte finns i
//                 25-packet → visas inte ("visa aldrig något som inte ingår").
//                 Måtten sätts i stället som skarp text på faktabilden.
//   image15.jpg — collage med ~50 andra klistermärken, inte förpackningen → visas inte.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): 25 st, 4,1 × 5,0 cm, vitt/blått/silver,
// till garageport/fönster/dörr. Inget om hur de fäster — påstås inte.
// Rutnätet är räknat rad för rad: 6 + 6 + 6 + 7 = 25 (fjärde raden har sju).
// Badgen säger därför 25, och hero visar HELA rutnätet så att kunden räknar till
// samma tal. Faktaraden "25 ST" illustreras också med hela rutnätet — aldrig
// med ett utsnitt där man kan räkna till något annat.
//
// Kör:
//   node temu/batch9/bilder-snoflingor.mjs      # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA = process.env.SNOFLINGOR_KALLA || '/tmp/b9/b/bilder/image20.png';
const ID = 'snoflingor';
const UT = { sv: `/tmp/b9/ut/${ID}`, no: `/tmp/b9/ut-no/${ID}` };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt ur källbilden (x, y, bredd, höjd i 597×573-koordinater) --------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  rutnat:  [0, 0, 597, 320],      // hela rutnätet: 6+6+6+7 = 25 flingor, vit bakgrund
  port:    [0, 322, 582, 251],    // garageporten med flingorna uppsatta (orange föremål vid x>585 bortklippt)
  flinga:  [110, 0, 94, 82],      // en mörkblå flinga (rad 1, kolumn 2), stannar ovanför rad 2 — storleksraden
  farger:  [10, 80, 385, 160],    // rad 2–3, kolumn 1–4: silver, mörkblå, blå, ljusblå — hela flingor, ingen klippt
  portmitt:[150, 330, 300, 243],  // mitten av porten — "där de sitter"
};

async function utsnitt(namn) {
  const [left, top, width, height] = UTSNITT[namn];
  return sharp(KÄLLA).extract({ left, top, width, height }).flatten({ background: '#ffffff' }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

/* ---------- flerpack-badge (temu/batch6/antalsbadge.mjs, skalad 1000 → 1600) ---------- */
const BADGE = { sv: ['25 ST', 'INGÅR'], no: ['25 STK', 'FØLGER MED'] };
function badge(språk) {
  const [rad1, rad2] = BADGE[språk], bw = språk === 'sv' ? 480 : 608, bh = 211;
  return Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
    <rect x="54" y="54" width="${bw}" height="${bh}" rx="22" fill="#1c1c1c" opacity="0.93"/>
    <text x="${54 + bw / 2}" y="150" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="96" fill="#ffffff">${esc(rad1)}</text>
    <text x="${54 + bw / 2}" y="222" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="54" fill="${GUL}" letter-spacing="3">${esc(rad2)}</text>
  </svg>`);
}

/* ---------- 1. hero — hela rutnätet (25 räknebara flingor) + badge ---------- */
async function hero() {
  const p = await passa(await utsnitt('rutnat'), 1520, 1520);          // 1520×815
  for (const [språk, d] of Object.entries(UT)) {
    await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
      .composite([
        { input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) },
        { input: badge(språk), top: 0, left: 0 },
      ]).jpeg({ quality: 92 }).toFile(`${d}/${ID}-hero.jpg`);
  }
  console.log(`✔ ${ID}-hero.jpg (sv + no, badge per språk)`);
}

/* ---------- 2. detalj — garageporten med flingorna uppsatta ---------- */
async function detalj() {
  const p = await passa(await utsnitt('port'), 1520, 1440);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/${ID}-detalj.jpg`);
  console.log(`✔ ${ID}-detalj.jpg (sv + no)`);
}

/* ---------- 3. faktabild — bara siffror ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'PAKETET I SIFFROR',
    rader: [
      { ruta: '25 ST',                 titel: 'SNÖFLINGOR I PAKETET', under: 'Blandade mönster och färger', bild: 'rutnat' },
      { ruta: '4,1 × 5,0 CM',          titel: 'STORLEK PER FLINGA',   under: '4,1 cm bred, 5,0 cm hög', bild: 'flinga' },
      { ruta: 'VITT / BLÅTT / SILVER', titel: 'FÄRGERNA',             under: 'Ljusa och mörka nyanser blandat', bild: 'farger' },
      { ruta: 'PORT · FÖNSTER · DÖRR', titel: 'DÄR DE PASSAR',        under: 'Garageport, fönster eller dörr', bild: 'portmitt' },
    ],
  },
  no: {
    rubrik: 'PAKKEN I TALL',
    rader: [
      { ruta: '25 STK',                titel: 'SNØFLAK I PAKKEN',     under: 'Blandede mønstre og farger', bild: 'rutnat' },
      { ruta: '4,1 × 5,0 CM',          titel: 'STØRRELSE PER FLAK',   under: '4,1 cm bredt, 5,0 cm høyt', bild: 'flinga' },
      { ruta: 'HVITT / BLÅTT / SØLV',  titel: 'FARGENE',              under: 'Lyse og mørke nyanser blandet', bild: 'farger' },
      { ruta: 'PORT · VINDU · DØR',    titel: 'DER DE PASSER',        under: 'Garasjeport, vindu eller dør', bild: 'portmitt' },
    ],
  },
};

async function fakta(språk) {
  const O = ORD[språk];
  const bandH = 120, radH = Math.floor((S - bandH) / O.rader.length);
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
