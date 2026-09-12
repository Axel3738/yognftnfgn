// Täljset 30 delar (TEMU-B10-TALJSET) — bygger produktbilderna.
//
// Källor (båda granskade i Read-verktyget innan utsnitten låstes):
//   /tmp/b9/b/bilder/image3.png (577×605, PNG med alfa) — hela setet utlagt + i rullväskan.
//     Ingen text, ingen vattenstämpel. Används som HERO (skalas ×2,5 med lanczos3).
//   /tmp/b9/b/bilder/image21.jpg (1543×1147, foto på blåvit botten) — setet utlagt.
//     Innehåller TEXT som måste bort: slippappret "ABRASIVE PAPER / SKY Lark / DP22"
//     (x 555–713, y 799–1011) och handskens etikett "CE / CUT LEVEL 5 / L" (x 1254–1298,
//     y 943–1022). Inget utsnitt går in i de rutorna: järnen slutar vid x 548,
//     handsken beskärs ovanför y 935. Väskan, stroppen, knivarna och järnen är rena.
//     Bakgrunden är blåaktig (≈ 236,254,255) — vitbalanseras med en per-kanal
//     linjär justering så utsnitten ligger vitt mot den vita kvadraten. Ingen retusch.
//   Knivutsnittet: stroppen ligger dikt an under kniv 6 (strop x ≥ 567, y ≥ 570; kniv 1:s
//     skaft slutar först y 592). Utsnittet görs därför L-format — hörnet x ≥ 567 ∧ y ≥ 566
//     lämnas utanför så att alla sex knivarna är hela och stroppen inte sticker in.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): 30 delar totalt, 6 knivar med träskaft, 6 små
// järn, läderstrop, slippapper, polermedel, träbit, skärskyddade handskar, väska med
// dragkedja. Vassa verktyg. "6 knivar"/"6 järn" illustreras bara med utsnitt där man
// räknar till exakt 6; "30 delar" illustreras med väskan (inget att räkna).
//
// Kör:
//   node temu/batch9/bilder-taljset.mjs        # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const K = {
  set:  '/tmp/b9/b/bilder/image3.png',    // helheten, ren
  foto: '/tmp/b9/b/bilder/image21.jpg',   // fotot, textytor undviks
};
const UT = { sv: '/tmp/b9/ut/taljset', no: '/tmp/b9/ut-no/taljset' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Fotots bakgrund (236,254,255) → vit. Per-kanal linjär förstärkning, inget annat.
const VITBALANS = [255 / 236, 255 / 254, 1];
const foto = () => sharp(K.foto).linear(VITBALANS, [0, 0, 0]);

/* ---------- utsnitt: [källa, x, y, bredd, höjd] i källbildens egna pixlar ----------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.               */
const UTSNITT = {
  knivar:  ['foto', 55, 195, 591, 405],     // 6 täljknivar (L-format, se knivar())
  jarn:    ['foto', 125, 612, 423, 390],    // 6 små järn, slutar x 548 före slippapprets text
  strop:   ['foto', 560, 560, 405, 128],    // läderstroppen, hel
  handske: ['foto', 1082, 562, 388, 373],   // handskens fingrar + handflata, ovanför etiketten
  vaska:   ['foto', 640, 85, 665, 475],     // väskan med dragkedja, hel
};

async function utsnitt(namn) {
  if (namn === 'knivar') return knivar();
  const [k, left, top, width, height] = UTSNITT[namn];
  return foto().extract({ left, top, width, height }).png().toBuffer();
}

// L-format utsnitt: hela knivrutan utom hörnet där stroppen börjar.
async function knivar() {
  const [, left, top, width, height] = UTSNITT.knivar;
  const hörnX = 567 - left, hörnY = 566 - top;                     // stroppens hörn i utsnittets koordinater
  const övre = await foto().extract({ left, top, width, height: hörnY }).png().toBuffer();
  const nedre = await foto().extract({ left, top: top + hörnY, width: hörnX, height: height - hörnY }).png().toBuffer();
  return sharp({ create: { width, height, channels: 3, background: '#ffffff' } })
    .composite([{ input: övre, top: 0, left: 0 }, { input: nedre, top: hörnY, left: 0 }]).png().toBuffer();
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

/* ---------- 1. hero — hela setet (image3), plattad mot vitt och uppskalad ---------- */
async function hero() {
  const bild = await sharp(K.set).flatten({ background: '#ffffff' }).png().toBuffer();
  const p = await passa(bild, S - 80, S - 80);
  const jpg = await kvadrat([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }]);
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/taljset-hero.jpg`);
  console.log('✔ taljset-hero.jpg (sv + no)');
}

/* ---------- 2. detalj — de sex täljknivarna i närbild ---------- */
async function detalj() {
  const p = await passa(await utsnitt('knivar'), S - 80, S - 80);
  const jpg = await kvadrat([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }]);
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/taljset-detalj.jpg`);
  console.log('✔ taljset-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara siffror ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'SETET I SIFFROR',
    rader: [
      { ruta: '6 ST',     titel: 'TÄLJKNIVAR',     under: 'Träskaft, olika bladformer', bild: 'knivar' },
      { ruta: '6 ST',     titel: 'SMÅ JÄRN',       under: 'Smala blad med träskaft', bild: 'jarn' },
      { ruta: 'LÄDER',    titel: 'STROP',          under: 'Slippapper och polermedel ingår också', bild: 'strop' },
      { ruta: 'INGÅR',    titel: 'SKYDDSHANDSKAR', under: 'Skärskyddade – verktygen är vassa', bild: 'handske' },
      { ruta: '30 DELAR', titel: 'HELA SETET',     under: 'Väska med dragkedja ingår', bild: 'vaska' },
    ],
  },
  no: {
    rubrik: 'SETTET I TALL',
    rader: [
      { ruta: '6 STK',      titel: 'SPIKKEKNIVER', under: 'Treskaft, ulike bladformer', bild: 'knivar' },
      { ruta: '6 STK',      titel: 'SMÅ JERN',     under: 'Smale blad med treskaft', bild: 'jarn' },
      { ruta: 'LÆR',        titel: 'STROPP',       under: 'Slipepapir og polermiddel følger også med', bild: 'strop' },
      { ruta: 'FØLGER MED', titel: 'VERNEHANSKER', under: 'Kuttsikre – verktøyene er skarpe', bild: 'handske' },
      { ruta: '30 DELER',   titel: 'HELE SETTET',  under: 'Veske med glidelås følger med', bild: 'vaska' },
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
  await sharp(await kvadrat(lager)).toFile(`${UT[språk]}/taljset-fakta.jpg`);
  console.log(`✔ taljset-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
