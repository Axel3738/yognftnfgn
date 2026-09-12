// Hönsgårdsduk (TEMU-B10-HONSGARDSDUK) — bygger produktbilderna deterministiskt med sharp.
//
// Källor:
//   A = /tmp/b9/b/bilder/image25.jpg (800×800). Överst: den plana svarta duken med S-krokar
//       i hörnen, omgiven av leverantörens måttsättning — lodrät pil x 120–121, texten
//       "110cm / 43in" t.v., vågrät pil y 477–478 och texten "145cm/57in" under.
//       Duken själv ligger på x 145–721, y 69–456 (uppmätt pixel för pixel). Nedre
//       krokarna (y 458–487) sitter ihop med pilens ändstreck och går inte att skilja ut,
//       så duken beskärs som ren rektangel utan krokar. Krokdetaljen tas ur ÖVRE vänstra
//       hörnet (x ≥ 135 — den lodräta pilens övre ändstreck når x 130 på y 70–72). Nedre högra delen (y ≥ 545): duken på ett
//       burtak — textfri, blir detaljbilden.
//   B = /tmp/b9/ali/b-S837e7b7074fd4b70b5f34d5874f536b3D.jpg (800×800, duken draperad
//       över en takform med krokar i hörnen, ingen text). Blir hero.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): 145 × 109 cm, svart, öljetter i hörnen.
// Leverantörsbilden säger 145×110 — vi skriver 145 × 109 (offerten). Ingen siffra ur
// bilden får följa med. Inget om material, vattentäthet eller UV.
//
// Kör:  node temu/batch9/bilder-honsgardsduk.mjs   # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA_A = '/tmp/b9/b/bilder/image25.jpg';
const KÄLLA_B = '/tmp/b9/ali/b-S837e7b7074fd4b70b5f34d5874f536b3D.jpg';
const ID = 'honsgardsduk';
const UT = { sv: `/tmp/b9/ut/${ID}`, no: `/tmp/b9/ut-no/${ID}` };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt (fil, x, y, bredd, höjd i källbildens egna pixlar) ----------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.
   Måttpilen i A ligger på x 120–121 och y 477–478 — inget A-utsnitt får nå dit.   */
const UTSNITT = {
  hero:   [KÄLLA_B, 13, 164, 780, 472],    // hela den draperade duken med krokar (bbox 33–773 × 184–616 + marginal)
  plan:   [KÄLLA_A, 145, 69, 577, 388],    // den plana duken, exakt rektangeln, utan pilar och krokar
  krok:   [KÄLLA_A, 135, 30, 105, 110],    // övre vänstra hörnet: S-kroken i hörnfästet (pilens ändstreck slutar på x 130)
  bur:    [KÄLLA_A, 290, 545, 510, 255],   // duken på burtaket — detaljbilden
  tyg:    [KÄLLA_B, 250, 250, 420, 300],   // draperat svart tyg, närbild
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

/* ---------- 1. hero — den draperade duken (B), 40 px vit marginal ---------- */
async function hero() {
  const jpg = await vitKvadrat(await passa(await utsnitt('hero'), S - 80, S - 80));
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/${ID}-hero.jpg`);
  console.log(`✔ ${ID}-hero.jpg (sv + no)`);
}

/* ---------- 2. detalj — duken lagd över ett burtak (A, nedre delen) ---------- */
async function detalj() {
  const jpg = await vitKvadrat(await passa(await utsnitt('bur'), 1520, 1440));
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/${ID}-detalj.jpg`);
  console.log(`✔ ${ID}-detalj.jpg (sv + no)`);
}

/* ---------- 3. faktabild — bara siffror ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'DUKEN I SIFFROR',
    rader: [
      { ruta: '145 CM',   titel: 'LÄNGD',    under: 'Dukens långsida', bild: 'plan' },
      { ruta: '109 CM',   titel: 'BREDD',    under: 'Dukens kortsida', bild: 'hero' },
      { ruta: 'ÖLJETTER', titel: 'I HÖRNEN', under: 'Fäste i varje hörn', bild: 'krok' },
      { ruta: 'SVART',    titel: 'FÄRG',     under: 'Dukens färg', bild: 'bur' },
    ],
  },
  no: {
    rubrik: 'DUKEN I TALL',
    rader: [
      { ruta: '145 CM', titel: 'LENGDE',     under: 'Dukens langside', bild: 'plan' },
      { ruta: '109 CM', titel: 'BREDDE',     under: 'Dukens kortside', bild: 'hero' },
      { ruta: 'MALJER', titel: 'I HJØRNENE', under: 'Feste i hvert hjørne', bild: 'krok' },
      { ruta: 'SVART',  titel: 'FARGE',      under: 'Dukens farge', bild: 'bur' },
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
