// Snöslungekapell (TEMU-B10-SNOBLASARKAPELL) — bygger produktbilderna deterministiskt med sharp.
//
// Källor:
//   A = /tmp/b9/b/bilder/image14.jpg (800×800, svart kapell över röd snöslunga på vitt).
//       ⚠️ På snöslungans röda kåpa sitter en SPEGELVÄND "POWER…"-logotyp (x 321–396,
//       y 425–442). Den ligger mitt i bilden på fotoyta — kan varken beskäras bort utan
//       att halva produkten försvinner eller täckas (regel: aldrig låda över foto).
//       Därför används A BARA i utsnitt som ligger helt till höger om (x ≥ 415) eller
//       ovanför (y ≤ 420) logotypen. Hela bilden används INTE som hero.
//   B = /tmp/b9/ali/b-Sf218a2ceb718407d900b0f1387ae3db6g.png (1200×1200, snölandskap).
//       Engelsk text "Heavy Duty Snow Blower Cover / UV-Resistant, Waterproof…" uppe till
//       vänster (y 60–250) och "Waterproof mateiral" i cirkeln (y 120–200) — beskärs bort.
//       Cirkeln med vattendroppar används INTE alls (skulle påstå vattentäthet i bild).
//       Nedre högra delen (kapellet över slungan i snö, från y 520) är textfri och blir hero.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): 120 × 82 × 60 cm, färg svart/silver.
// "Vattentät" och "UV" är leverantörens ord — får inte stå på bilden.
//
// Kör:  node temu/batch9/bilder-snoblasarkapell.mjs   # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA_A = '/tmp/b9/b/bilder/image14.jpg';
const KÄLLA_B = '/tmp/b9/ali/b-Sf218a2ceb718407d900b0f1387ae3db6g.png';
const ID = 'snoblasarkapell';
const UT = { sv: `/tmp/b9/ut/${ID}`, no: `/tmp/b9/ut-no/${ID}` };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt (fil, x, y, bredd, höjd i källbildens egna pixlar) ----------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.
   Logotypen i A ligger på x 321–396 / y 425–442 — inget A-utsnitt får täcka den.  */
const UTSNITT = {
  hero:   [KÄLLA_B, 480, 520, 720, 680],   // kapellet över slungan i snö, stugans hörn t.v. — ingen text
  front:  [KÄLLA_B, 540, 560, 620, 440],   // kapellets framkant + slungans röda kåpa i snö
  sida:   [KÄLLA_A, 415, 113, 285, 527],   // högra sidan: kapellets topp → fåll → hjul (x ≥ 415 = fri från logon)
  topp:   [KÄLLA_A, 120, 113, 570, 307],   // hela kapellets överdel, tyg + söm (y ≤ 420 = ovanför logon)
  tyg:    [KÄLLA_A, 250, 150, 350, 250],   // närbild på vecken i tyget
  detalj: [KÄLLA_A, 415, 370, 285, 270],   // fållen över hjulet och kåpans högra sida
};

async function utsnitt(namn) {
  const [fil, left, top, width, height] = UTSNITT[namn];
  return sharp(fil).extract({ left, top, width, height }).png().toBuffer();
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

/* ---------- 1. hero — kapellet över snöslungan i snö (B), 40 px vit marginal ---------- */
async function hero() {
  const jpg = await vitKvadrat(await passa(await utsnitt('hero'), S - 80, S - 80));
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/${ID}-hero.jpg`);
  console.log(`✔ ${ID}-hero.jpg (sv + no)`);
}

/* ---------- 2. detalj — fållen över hjulet (A, höger om logon) ---------- */
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
      { ruta: '120 CM',       titel: 'LÄNGD', under: 'Kapellets längd', bild: 'topp' },
      { ruta: '82 CM',        titel: 'BREDD', under: 'Kapellets bredd', bild: 'front' },
      { ruta: '60 CM',        titel: 'HÖJD',  under: 'Kapellets höjd', bild: 'sida' },
      { ruta: 'SVART/SILVER', titel: 'FÄRG',  under: 'Kapellets färg', bild: 'tyg' },
    ],
  },
  no: {
    rubrik: 'TREKKET I TALL',
    rader: [
      { ruta: '120 CM',     titel: 'LENGDE', under: 'Trekkets lengde', bild: 'topp' },
      { ruta: '82 CM',      titel: 'BREDDE', under: 'Trekkets bredde', bild: 'front' },
      { ruta: '60 CM',      titel: 'HØYDE',  under: 'Trekkets høyde', bild: 'sida' },
      { ruta: 'SVART/SØLV', titel: 'FARGE',  under: 'Trekkets farge', bild: 'tyg' },
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
    const rw = Math.max(130, r.ruta.length * 23 + 44);
    svg.push(`<rect x="96" y="${y + 190}" width="${rw}" height="58" rx="10" fill="${GUL}"/>`);
    svg.push(`<text x="${96 + rw / 2}" y="${y + 232}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="36" fill="#12212b">${esc(r.ruta)}</text>`);
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
