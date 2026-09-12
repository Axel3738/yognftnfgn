// Vedställskapell (TEMU-B9-VEDSTALLSKAPELL) — bygger produktbilderna.
//
// Källa: /tmp/b9/ali/a-S46593c3e6999493c8eb24fb3f94888afz.jpg (1600×1600, webp
// trots ändelsen). Bilden är GRANSKAD i zoom (gavel, framflik, högerkant, botten):
// ingen leverantörstext, ingen vattenstämpel, ingen kinesisk text. Den beskärs
// därför bara för komposition, inget målas över. Veden och vedstället syns i
// bilden som miljö — de INGÅR INTE, och det står på faktabildens första rad.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): 122 × 61 × 106 cm, versionen med
// fönster (luftventil + uttag), svart. Ingen ventil syns på bilden — därför
// illustreras fönster-raden med den upprullade framfliken (uttaget), inte med
// något som ser ut som en ventil. Inget om material, vattentäthet eller UV.
//
// Kör: node temu/batch9/bilder-vedstallskapell.mjs   # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA = process.env.VEDSTALLSKAPELL_KALLA || '/tmp/b9/ali/a-S46593c3e6999493c8eb24fb3f94888afz.jpg';
const UT = { sv: '/tmp/b9/ut/vedstallskapell', no: '/tmp/b9/ut-no/vedstallskapell' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt ur källbilden (x, y, bredd, höjd i 1600×1600-koordinater) -----
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  front:  [30, 750, 1420, 780],   // hela kapellet framifrån, gavel till gavel (längd-raden)
  gavel:  [30, 770, 620, 520],    // vänster gavel + främre hörnet med kantförstärkning (djup-raden)
  hojd:   [700, 760, 800, 740],   // högra halvan uppifrån och ned till fötterna (höjd-raden)
  flik:   [520, 762, 760, 300],   // upprullad framflik med remmarna = uttaget (fönster-raden)
  tyg:    [60, 900, 420, 320],    // gaveltyget, svart (färg-raden)
  detalj: [40, 755, 760, 440],    // gaveln, hörnförstärkningen, flikänden och första remmen = detaljbilden
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

/* ---------- 1. hero — hela leverantörsbilden, kapellet i snön ---------- */
async function hero() {
  const bild = await sharp(KÄLLA).resize(S - 80, S - 80, { kernel: 'lanczos3' }).sharpen({ sigma: 0.7 }).png().toBuffer();
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: bild, top: 40, left: 40 }]).jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/vedstallskapell-hero.jpg`);
  console.log('✔ vedstallskapell-hero.jpg (sv + no)');
}

/* ---------- 2. detalj — remmarna och den upprullade fliken ---------- */
async function detalj() {
  const p = await passa(await utsnitt('detalj'), 1400, 1440);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/vedstallskapell-detalj.jpg`);
  console.log('✔ vedstallskapell-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara fakta ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'KAPELLET I SIFFROR',
    rader: [
      { ruta: '122 CM',  titel: 'LÄNGD',              under: 'Kapellets längd – vedstället ingår inte', bild: 'front' },
      { ruta: '61 CM',   titel: 'DJUP',               under: 'Kapellets djup', bild: 'gavel' },
      { ruta: '106 CM',  titel: 'HÖJD',               under: 'Kapellets höjd', bild: 'hojd' },
      { ruta: 'FÖNSTER', titel: 'LUFTVENTIL + UTTAG', under: 'Versionen med fönster', bild: 'flik' },
      { ruta: 'SVART',   titel: 'FÄRG',               under: 'Levereras i svart', bild: 'tyg' },
    ],
  },
  no: {
    rubrik: 'TREKKET I TALL',
    rader: [
      { ruta: '122 CM', titel: 'LENGDE',              under: 'Trekkets lengde – vedstativet følger ikke med', bild: 'front' },
      { ruta: '61 CM',  titel: 'DYBDE',               under: 'Trekkets dybde', bild: 'gavel' },
      { ruta: '106 CM', titel: 'HØYDE',               under: 'Trekkets høyde', bild: 'hojd' },
      { ruta: 'VINDU',  titel: 'LUFTEVENTIL + UTTAK', under: 'Versjonen med vindu', bild: 'flik' },
      { ruta: 'SVART',  titel: 'FARGE',               under: 'Leveres i svart', bild: 'tyg' },
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
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/vedstallskapell-fakta.jpg`);
  console.log(`✔ vedstallskapell-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
