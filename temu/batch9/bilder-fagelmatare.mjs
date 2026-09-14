// Fågelmatare med kamera (TEMU-B10-FAGELMATARE) — bygger produktbilderna.
//
// Källa: /tmp/b9/b/bilder/image24.png (800×800) = CWD:s OFFERTBILD, dvs den produkt som
// faktiskt skickas. Axels AliExpress-länk (image23, JOOAN 5MP) är en ANNAN modell och
// används inte — CWD skrev "similar". Bilden är granskad: ingen text, ingen vattenstämpel.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): kamera (5 MP enligt Axels rad), solcellspanel på
// taket, antenn, app med instruktioner, foderboll, vattenkopp, sittramp, grön. Inget ur
// JOOAN-bilden får hamna här (AI-igenkänning, tvåvägsljud, IP66, molnlagring …).
//
// Kör:  node temu/batch9/bilder-fagelmatare.mjs
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const KÄLLA = '/tmp/b9/b/bilder/image24.png';
const UT = { sv: '/tmp/b9/ut/fagelmatare', no: '/tmp/b9/ut-no/fagelmatare' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });
const S = 1600, BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* utsnitt i 800×800-koordinater — kontrollerade mot originalet */
const UTSNITT = {
  kamera:   [255, 250, 190, 230],   // kamerahuset bakom den genomskinliga luckan
  tak:      [100, 130, 540, 150],   // taket med solcellspanelen + antennfoten
  boll:     [600, 360, 190, 170],   // den genomskinliga foderbollen
  kopp:     [560, 560, 190, 150],   // vattenkoppen med den röda blomman i rampen
  ramp:     [240, 470, 560, 260],   // sittrampen med koppen
  detalj:   [200, 130, 460, 400],   // kamera + tak + antenn = detaljbilden
};
const utsnitt = ([left, top, width, height]) => sharp(KÄLLA).extract({ left, top, width, height }).png().toBuffer();
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata(), s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}
const vit = () => sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } });

async function hero() {
  const bild = await sharp(KÄLLA).resize(1520, 1520, { kernel: 'lanczos3' }).sharpen({ sigma: 0.7 }).png().toBuffer();
  const jpg = await vit().composite([{ input: bild, top: 40, left: 40 }]).jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/fagelmatare-hero.jpg`);
  console.log('✔ fagelmatare-hero.jpg (sv + no)');
}
async function detalj() {
  const p = await passa(await utsnitt(UTSNITT.detalj), 1440, 1440);
  const jpg = await vit().composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }]).jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/fagelmatare-detalj.jpg`);
  console.log('✔ fagelmatare-detalj.jpg (sv + no)');
}
const ORD = {
  sv: { rubrik: 'MATAREN I KORTHET', rader: [
    { ruta: '5 MP',    titel: 'KAMERA',      under: 'Sitter där fåglarna landar – ses i appen', bild: 'kamera' },
    { ruta: 'PÅ TAKET', titel: 'SOLCELLSPANEL', under: 'Laddar kameran med dagsljus', bild: 'tak' },
    { ruta: 'INGÅR',   titel: 'FODERBOLL',   under: 'Genomskinlig, fylls med frön', bild: 'boll' },
    { ruta: 'INGÅR',   titel: 'VATTENKOPP',  under: 'Liten kopp i sittrampen', bild: 'kopp' },
    { ruta: 'APP',     titel: 'I MOBILEN',   under: 'Instruktioner följer med i förpackningen', bild: 'ramp' },
  ] },
  no: { rubrik: 'MATEREN KORT FORTALT', rader: [
    { ruta: '5 MP',    titel: 'KAMERA',      under: 'Sitter der fuglene lander – ses i appen', bild: 'kamera' },
    { ruta: 'PÅ TAKET', titel: 'SOLCELLEPANEL', under: 'Lader kameraet med dagslys', bild: 'tak' },
    { ruta: 'FØLGER MED', titel: 'FÔRKULE',  under: 'Gjennomsiktig, fylles med frø', bild: 'boll' },
    { ruta: 'FØLGER MED', titel: 'VANNKOPP', under: 'Liten kopp i sitterampen', bild: 'kopp' },
    { ruta: 'APP',     titel: 'I MOBILEN',   under: 'Instruksjoner følger med i pakken', bild: 'ramp' },
  ] },
};
async function fakta(språk) {
  const O = ORD[språk], bandH = 120, radH = Math.floor((S - bandH) / O.rader.length), lager = [];
  const svg = [`<rect x="0" y="0" width="${S}" height="${bandH}" fill="${BLÅ}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#ffffff" letter-spacing="3">${esc(O.rubrik)}</text>`];
  for (let g = 0; g < O.rader.length; g++) {
    const r = O.rader[g], y = bandH + g * radH;
    if (g) svg.push(`<rect x="90" y="${y}" width="${S - 180}" height="2" fill="#e4e8ea"/>`);
    svg.push(`<text x="96" y="${y + 100}" font-family="DejaVu Sans" font-weight="bold" font-size="42" fill="${BLÅ}" letter-spacing="1">${esc(r.titel)}</text>`);
    svg.push(`<text x="96" y="${y + 144}" font-family="DejaVu Sans" font-size="27" fill="${GRÅ}">${esc(r.under)}</text>`);
    const rw = Math.max(130, r.ruta.length * 23 + 44);
    svg.push(`<rect x="96" y="${y + 170}" width="${rw}" height="58" rx="10" fill="${GUL}"/>`);
    svg.push(`<text x="${96 + rw / 2}" y="${y + 212}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="36" fill="#12212b">${esc(r.ruta)}</text>`);
    const p = await passa(await utsnitt(UTSNITT[r.bild]), 480, radH - 56);
    lager.push({ input: p.buf, top: y + Math.floor((radH - p.h) / 2), left: 1510 - p.w });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await vit().composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/fagelmatare-fakta.jpg`);
  console.log(`✔ fagelmatare-fakta.jpg (${språk})`);
}
await hero(); await detalj(); await fakta('sv'); await fakta('no');
