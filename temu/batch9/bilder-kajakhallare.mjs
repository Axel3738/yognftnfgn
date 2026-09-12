// Kajakhållare, 2-pack väggkrokar (TEMU-B10-KAJAKHALLARE) — bygger produktbilderna.
//
// Källa: /tmp/b9/b/bilder/image26.png (1500×1500, leverantörens produktbild, vit botten).
// Bilden är FULL av text — allt nedan beskärs bort:
//   · engelska rubriker överst ("Multipurpose 15.1 inch Heavy Storage Hooks", "2 PACK", y ≤ 227)
//   · "Bear Weight: 100Lbs" (x 652–1382, y 290–379)
//   · kinesisk vattenstämpel 1 (y 335–381) som korsar krokarnas ÖVRE del → allt ovanför
//     y 392 lämnas utanför, inklusive krokarnas rundade toppar
//   · kinesisk vattenstämpel 2 (y ≈ 1080–1140, från x ≈ 710) som korsar armarna OCH de
//     gula ändskydden → inget utsnitt går till höger om x 692 i det bandet, och ändskydden
//     visas inte alls (ingen ren yta finns)
//   · "Net Weight / Gross Weight / Pack Size" nere till vänster (y ≥ 1240)
// Ingenting målas över — vattenstämplarna ligger på fotoytan (svart krok, gul kapsel)
// och kan bara undvikas genom beskärning. Priset är att heron visar krokarna beskurna
// upptill och till höger.
//
// /tmp/b9/b/bilder/image5.png (576 px, kajaker på vägg) används INTE: dess inset visar
// krokar med RÖDA ändskydd, fakta.mjs säger gula.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): 2 krokar, armlängd 38 cm, last 45 kg
// (100 lbs enligt leverantören), svart med gula ändskydd. fakta.mjs säger "8 skruvar,
// 8 pluggar" men källbilden visar 4 skruvar + 4 pluggar — därför skrivs INGET antal
// för fästmaterialet på bilden (rutan säger bara "INGÅR"). Avvikelsen rapporteras.
// 2-PACK → badge "2 ST / INGÅR" (sv) resp. "2 STK / FØLGER MED" (no) uppe till
// vänster på heron enligt temu/batch6/antalsbadge.mjs, uppskalad ×1,6 till 1600 px.
//
// Kör:
//   node temu/batch9/bilder-kajakhallare.mjs        # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA = '/tmp/b9/b/bilder/image26.png';
const UT = { sv: '/tmp/b9/ut/kajakhallare', no: '/tmp/b9/ut-no/kajakhallare' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt ur källbilden (x, y, bredd, höjd i 1500×1500-koordinater) --------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.          */
const UTSNITT = {
  krokar:  [150, 392, 542, 853],    // båda krokarna: stolpar, böjar, skumklädda armar — under vattenstämpel 1, vänster om vattenstämpel 2
  tva:     [180, 392, 420, 500],    // de två stolparna med skruvhål — går att räkna till 2
  arm:     [280, 860, 412, 385],    // de skumklädda armarna, slutar vid x 692 före vattenstämpeln
  bojen:   [150, 700, 500, 320],    // böjarna där lasten sitter
  skruvar: [835, 462, 382, 156],    // 4 skruvar + 4 pluggar (inget antal skrivs på bilden)
  montage: [150, 392, 1080, 500],   // stolpar + skruvar + pluggar = detaljbilden (montaget)
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

async function kvadrat(lager) {
  return sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toBuffer();
}

/* ---------- flerpack-badge (temu/batch6/antalsbadge.mjs × 1,6) ---------- */
const BADGE = { sv: ['2 ST', 'INGÅR'], no: ['2 STK', 'FØLGER MED'] };
function badge(språk) {
  const [rad1, rad2] = BADGE[språk];
  const bh = 211, bw = språk === 'sv' ? 480 : 608;
  return Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
    <rect x="54" y="54" width="${bw}" height="${bh}" rx="22" fill="#1c1c1c" opacity="0.93"/>
    <text x="${54 + bw / 2}" y="150" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="96" fill="#ffffff">${esc(rad1)}</text>
    <text x="${54 + bw / 2}" y="222" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="54" fill="${GUL}" letter-spacing="3">${esc(rad2)}</text>
  </svg>`);
}

/* ---------- 1. hero — båda krokarna, högerställda så badgen får fri yta till vänster ---------- */
async function hero() {
  const p = await passa(await utsnitt('krokar'), S - 80, S - 80);
  for (const [språk, d] of Object.entries(UT)) {
    const jpg = await kvadrat([
      { input: p.buf, top: Math.round((S - p.h) / 2), left: S - 40 - p.w },
      { input: badge(språk), top: 0, left: 0 },
    ]);
    await sharp(jpg).toFile(`${d}/kajakhallare-hero.jpg`);
  }
  console.log('✔ kajakhallare-hero.jpg (sv + no, egen badge per språk)');
}

/* ---------- 2. detalj — montaget: stolpar med skruvhål + skruvar och pluggar ---------- */
async function detalj() {
  const p = await passa(await utsnitt('montage'), S - 80, S - 80);
  const jpg = await kvadrat([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }]);
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/kajakhallare-detalj.jpg`);
  console.log('✔ kajakhallare-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara siffror ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'KROKARNA I SIFFROR',
    rader: [
      { ruta: '2 ST',  titel: 'KROKAR I PAKETET',    under: 'Levereras som ett par', bild: 'tva' },
      { ruta: '38 CM', titel: 'ARMLÄNGD',            under: 'Den vågräta armen på varje krok', bild: 'arm' },
      { ruta: '45 KG', titel: 'MAXLAST',             under: 'Enligt leverantören (100 lbs)', bild: 'bojen' },
      { ruta: 'INGÅR', titel: 'SKRUVAR OCH PLUGGAR', under: 'Fästmaterial följer med i paketet', bild: 'skruvar' },
    ],
  },
  no: {
    rubrik: 'KROKENE I TALL',
    rader: [
      { ruta: '2 STK',      titel: 'KROKER I PAKKEN',   under: 'Leveres som et par', bild: 'tva' },
      { ruta: '38 CM',      titel: 'ARMLENGDE',         under: 'Den vannrette armen på hver krok', bild: 'arm' },
      { ruta: '45 KG',      titel: 'MAKS LAST',         under: 'Ifølge leverandøren (100 lbs)', bild: 'bojen' },
      { ruta: 'FØLGER MED', titel: 'SKRUER OG PLUGGER', under: 'Festemateriell følger med i pakken', bild: 'skruvar' },
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
    svg.push(`<text x="96" y="${y + 100}" font-family="DejaVu Sans" font-weight="bold" font-size="42" fill="${BLÅ}" letter-spacing="1">${esc(r.titel)}</text>`);
    svg.push(`<text x="96" y="${y + 144}" font-family="DejaVu Sans" font-size="27" fill="${GRÅ}">${esc(r.under)}</text>`);
    const rw = Math.max(130, r.ruta.length * 23 + 44);
    svg.push(`<rect x="96" y="${y + 170}" width="${rw}" height="58" rx="10" fill="${GUL}"/>`);
    svg.push(`<text x="${96 + rw / 2}" y="${y + 212}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="36" fill="#12212b">${esc(r.ruta)}</text>`);
    const p = await passa(await utsnitt(r.bild), 480, radH - 56);
    lager.push({ input: p.buf, top: y + Math.floor((radH - p.h) / 2), left: 1510 - p.w });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await sharp(await kvadrat(lager)).toFile(`${UT[språk]}/kajakhallare-fakta.jpg`);
  console.log(`✔ kajakhallare-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
