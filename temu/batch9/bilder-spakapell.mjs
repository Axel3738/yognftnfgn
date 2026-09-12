// Spakapell / kapell till rund badtunna (TEMU-B9-SPAKAPELL) — bygger produktbilderna.
//
// Källa: /tmp/b9/ali/a-S2b98ac777d4a4ae5b0a681efb7e7081fT.jpg (800×800, webp trots
// ändelsen — sharp läser den ändå). Leverantörsbilden bär engelsk marknadstext
// som BESKÄRS BORT, inget målas över:
//   • rubriken "Dustproof and Rianproof Cover" (y 60–130) — hero börjar på y 135
//   • tre cirklar "waterproof / adjustable / Sun protection" (y 615–780) — bara
//     snörlåset i "adjustable"-cirkeln används, klippt OVANFÖR ordet (y ≤ 732)
//   • "FOUR COLORS" + fyra färgprover (x 520–760, y 600–720) — vi säljer BARA
//     svart, så färgproverna får aldrig synas; hero slutar på y 596
// "Waterproof"-cirkeln används inte alls: vattentäthet är inte ett låst faktum.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): runt kapell, 215 cm diameter, 70 cm höjd,
// tyg 210D, svart, dragsko i kanten. Inget om vattentäthet, UV eller sol.
// Källbilden är liten (800 px) — allt skalas upp med lanczos3 + lätt sharpen.
//
// Kör: node temu/batch9/bilder-spakapell.mjs      # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA = process.env.SPAKAPELL_KALLA || '/tmp/b9/ali/a-S2b98ac777d4a4ae5b0a681efb7e7081fT.jpg';
const UT = { sv: '/tmp/b9/ut/spakapell', no: '/tmp/b9/ut-no/spakapell' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt ur källbilden (x, y, bredd, höjd i 800×800-koordinater) --------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  hero:    [0, 135, 720, 461],    // tunnan med svart huv, under rubriken, ovanför cirklar/"FOUR COLORS"
  huv:     [25, 190, 645, 320],   // bara den svarta huven ovanifrån (diameter-raden)
  sida:    [30, 300, 430, 300],   // huvens nedre del över träpanelen (höjd-raden)
  tyg:     [230, 240, 300, 220],  // tygytan mitt på huven, ingen kant (210D-raden)
  dragsko: [212, 636, 84, 96],    // snörlås + snöre ur "adjustable"-cirkeln, helt inuti cirkeln och ovanför ordet
  kant:    [60, 395, 360, 190],   // huvens kant mot träet (svart-raden)
  detalj:  [70, 345, 555, 250],   // kanten runt tunnan, utan bakgrundsresterna i sidorna = detaljbilden
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

/* ---------- 1. hero — tunnan med huven, beskuren fri från all text ---------- */
async function hero() {
  const p = await passa(await utsnitt('hero'), S - 80, S - 80);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/spakapell-hero.jpg`);
  console.log('✔ spakapell-hero.jpg (sv + no)');
}

/* ---------- 2. detalj — huvens kant runt tunnan ---------- */
async function detalj() {
  const p = await passa(await utsnitt('detalj'), 1400, 1440);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/spakapell-detalj.jpg`);
  console.log('✔ spakapell-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara fakta ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'KAPELLET I SIFFROR',
    rader: [
      { ruta: '215 CM',  titel: 'DIAMETER', under: 'Kapellets diameter', bild: 'huv' },
      { ruta: '70 CM',   titel: 'HÖJD',     under: 'Kapellets höjd ned över kanten', bild: 'sida' },
      { ruta: '210D',    titel: 'TYG',      under: 'Tygets täthet', bild: 'tyg' },
      { ruta: 'DRAGSKO', titel: 'I KANTEN', under: 'Dras åt runt tunnans kant', bild: 'dragsko' },
      { ruta: 'SVART',   titel: 'FÄRG',     under: 'Levereras i svart', bild: 'kant' },
    ],
  },
  no: {
    rubrik: 'TREKKET I TALL',
    rader: [
      { ruta: '215 CM',  titel: 'DIAMETER', under: 'Trekkets diameter', bild: 'huv' },
      { ruta: '70 CM',   titel: 'HØYDE',    under: 'Trekkets høyde ned over kanten', bild: 'sida' },
      { ruta: '210D',    titel: 'STOFF',    under: 'Stoffets tetthet', bild: 'tyg' },
      { ruta: 'SNØRING', titel: 'I KANTEN', under: 'Strammes rundt kanten på stampen', bild: 'dragsko' },
      { ruta: 'SVART',   titel: 'FARGE',    under: 'Leveres i svart', bild: 'kant' },
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
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/spakapell-fakta.jpg`);
  console.log(`✔ spakapell-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
