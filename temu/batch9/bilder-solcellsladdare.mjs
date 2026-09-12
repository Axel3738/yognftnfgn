// Solcellsladdare 10 W / 12 V (TEMU-B9-SOLCELLSLADDARE) — bygger produktbilderna.
//
// Två källor:
//   KIT  = /tmp/b9/a/bilder/image1.jpg (1000×1000): panel + panelkabel + cigguttags-
//          kabel + klämkabel + 4 sugkoppar + manual på rent vit bakgrund.
//          Manualen bär engelsk text ("User Manual / Guide to the use of solar
//          panels"). Ytan runt den är uppmätt till exakt #ffffff (10 samplade
//          pixlar) — därför TÄCKS manualen med exakt vitt (regeln tillåter det på
//          enfärgad bakgrund). Manualen ingår fortfarande, den syns bara inte.
//   BÅT  = /tmp/b9/ali/a-Sbf7d8a030fee4a34b489f30b34986ef6b.jpg (1600×1600, webp):
//          leverantörens renderade bild med "Solar battery charger", "For 12V
//          battery system", "10W" och batteritexten "Power 12V Batteries".
//          Bara två textfria utsnitt används: panelen på båtens räcke och
//          klämmorna på batteripolerna (ovanför batteritexten, y ≤ 880).
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): 10 W, 12 V-system, MPPT-underhållsladdare.
// Ingår: solpanel, kabel med cigguttagskontakt, kabel med batteriklämmor,
// 4 sugkoppar, manual. Panelens mått, laddtid och batterityper står INTE i
// offerten och får inte påstås. Sugkopps-raden illustreras med ett utsnitt där
// man kan räkna till exakt fyra.
//
// Kör: node temu/batch9/bilder-solcellsladdare.mjs   # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KIT = process.env.SOLCELL_KIT || '/tmp/b9/a/bilder/image1.jpg';
const BÅT = process.env.SOLCELL_BAT || '/tmp/b9/ali/a-Sbf7d8a030fee4a34b489f30b34986ef6b.jpg';
const UT = { sv: '/tmp/b9/ut/solcellsladdare', no: '/tmp/b9/ut-no/solcellsladdare' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Manualen i kitbilden: x 798–965, y 635–810 uppmätt i zoom. Rutan tar marginal.
const MANUAL = { left: 785, top: 622, width: 195, height: 200 };
let kitRen;   // kitbilden med manualen täckt av exakt vitt — byggs en gång
async function kit() {
  if (!kitRen) {
    const vit = await sharp({ create: { ...MANUAL, width: MANUAL.width, height: MANUAL.height, channels: 3, background: '#ffffff' } }).png().toBuffer();
    kitRen = await sharp(KIT).composite([{ input: vit, left: MANUAL.left, top: MANUAL.top }]).png().toBuffer();
  }
  return kitRen;
}

/* ---------- utsnitt (x, y, bredd, höjd) — KIT i 1000×1000, BÅT i 1600×1600 ---------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  hero:      ['kit', 0, 45, 1000, 940],     // hela kitet (manualen vit), utan tomma kanten upptill
  panel:     ['kit', 100, 50, 740, 600],    // hela panelen med fyra genomföringar (10 W-raden)
  horn:      ['kit', 110, 60, 330, 330],    // panelhörn med genomföring och celler (MPPT-raden)
  sugkoppar: ['kit', 8, 868, 268, 108],     // exakt FYRA sugkoppar, kontakten till höger utesluten
  kablar:    ['kit', 285, 765, 715, 210],   // cigguttagskabeln + klämkabeln = två kablar (2 kablar-raden)
  bat:       ['båt', 770, 630, 800, 690],   // panelen på båtens räcke, ingen text (detaljbilden)
  klammor:   ['båt', 320, 640, 430, 240],   // klämmorna på polerna, ovanför batteritexten (12 V-raden)
};

async function utsnitt(namn) {
  const [kalla, left, top, width, height] = UTSNITT[namn];
  const src = kalla === 'kit' ? sharp(await kit()) : sharp(BÅT);
  return src.extract({ left, top, width, height }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

/* ---------- 1. hero — hela kitet på vitt ---------- */
async function hero() {
  const p = await passa(await utsnitt('hero'), S - 80, S - 80);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/solcellsladdare-hero.jpg`);
  console.log('✔ solcellsladdare-hero.jpg (sv + no)');
}

/* ---------- 2. detalj — panelen monterad på båtens räcke ---------- */
async function detalj() {
  const p = await passa(await utsnitt('bat'), 1400, 1440);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/solcellsladdare-detalj.jpg`);
  console.log('✔ solcellsladdare-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara fakta ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'LADDAREN I SIFFROR',
    rader: [
      { ruta: '10 W',     titel: 'EFFEKT',            under: 'Panelens effekt', bild: 'panel' },
      { ruta: '12 V',     titel: 'SYSTEM',            under: 'För 12 V-batterisystem', bild: 'klammor' },
      { ruta: 'MPPT',     titel: 'UNDERHÅLLSLADDARE', under: 'Laddartyp', bild: 'horn' },
      { ruta: '4 ST',     titel: 'SUGKOPPAR',         under: 'Fyra sugkoppar ingår', bild: 'sugkoppar' },
      { ruta: '2 KABLAR', titel: 'TVÅ ANSLUTNINGAR',  under: 'Cigguttagskontakt och batteriklämmor', bild: 'kablar' },
    ],
  },
  no: {
    rubrik: 'LADEREN I TALL',
    rader: [
      { ruta: '10 W',     titel: 'EFFEKT',            under: 'Panelets effekt', bild: 'panel' },
      { ruta: '12 V',     titel: 'SYSTEM',            under: 'For 12 V-batterisystem', bild: 'klammor' },
      { ruta: 'MPPT',     titel: 'VEDLIKEHOLDSLADER', under: 'Ladertype', bild: 'horn' },
      { ruta: '4 STK',    titel: 'SUGEKOPPER',        under: 'Fire sugekopper følger med', bild: 'sugkoppar' },
      { ruta: '2 KABLER', titel: 'TO TILKOBLINGER',   under: 'Sigarettennerplugg og batteriklemmer', bild: 'kablar' },
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
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/solcellsladdare-fakta.jpg`);
  console.log(`✔ solcellsladdare-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
