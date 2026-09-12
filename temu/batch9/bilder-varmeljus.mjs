// LED-värmeljus 24-pack (TEMU-B10-VARMELJUS) — bygger produktbilderna.
//
// Källor:
//   /tmp/b9/b/bilder/image22.jpg (800×800, offertens bild: 24 ljus i 6×4 på mörk
//     bakgrund). BESKURET BORT: den vita cirkeln "24只" (y 10–175, vänster) och den
//     gula rutan "暖白色" (y 690–785) — kinesisk text. Ljusen ligger mellan, y 185–615,
//     så utsnittet y 183–650 tar med alla 24 och ingen text. Inget målas över.
//   /tmp/b9/b/t-tealight.jpg (1697×1697, Temu-listningen, svart bakgrund).
//     BESKURET BORT: gula badgen "24 PCS" (y 125–210) och FJÄRRKONTROLLEN
//     (x 275–470, y 690–1110) som INTE ingår i vår variant. Alla utsnitt ligger
//     till höger om x 500 och under y 215 — fjärren och badgen kan inte komma med.
//   /tmp/b9/b/bilder/image6.png — visar en fjärr som inte ingår → används INTE.
//
// ⚠️ LÅST FAKTA (temu/batch9/fakta.mjs): 24 st, varmvitt LED-ljus, batteridrivna.
// INGEN fjärrkontroll, INGEN timer får synas eller påstås. Batterityp står inte
// i offerten och nämns därför inte.
//
// Kör:
//   node temu/batch9/bilder-varmeljus.mjs      # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const K22 = process.env.VARMELJUS_KALLA || '/tmp/b9/b/bilder/image22.jpg';   // offertens bild
const KT  = process.env.VARMELJUS_TEMU  || '/tmp/b9/b/t-tealight.jpg';       // Temu-bilden
const ID = 'varmeljus';
const UT = { sv: `/tmp/b9/ut/${ID}`, no: `/tmp/b9/ut-no/${ID}` };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt (fil + x, y, bredd, höjd i källbildens egna pixlar) --------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  rutnat:  { fil: K22, box: [0, 183, 800, 467] },    // alla 24 ljusen — cirkeln ovanför och gula rutan under är utanför
  trerad:  { fil: KT,  box: [520, 235, 460, 377] },  // tre ljus i översta raden med spegling (kolumn 1–3), ingen fjärr
  ettljus: { fil: KT,  box: [525, 235, 150, 377] },  // ett ljus med spegling
  flamma:  { fil: KT,  box: [540, 245, 120, 180] },  // LED-flamman och koppens kant
  kopp:    { fil: K22, box: [520, 455, 280, 190] },  // två ljus snett från sidan (nedre högra hörnet)
};

async function utsnitt(namn) {
  const { fil, box: [left, top, width, height] } = UTSNITT[namn];
  return sharp(fil).extract({ left, top, width, height }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

/* ---------- flerpack-badge (temu/batch6/antalsbadge.mjs, skalad 1000 → 1600) ---------- */
const BADGE = { sv: ['24 ST', 'INGÅR'], no: ['24 STK', 'FØLGER MED'] };
function badge(språk) {
  const [rad1, rad2] = BADGE[språk], bw = språk === 'sv' ? 480 : 608, bh = 211;
  return Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
    <rect x="54" y="54" width="${bw}" height="${bh}" rx="22" fill="#1c1c1c" opacity="0.93"/>
    <text x="${54 + bw / 2}" y="150" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="96" fill="#ffffff">${esc(rad1)}</text>
    <text x="${54 + bw / 2}" y="222" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="54" fill="${GUL}" letter-spacing="3">${esc(rad2)}</text>
  </svg>`);
}

/* ---------- 1. hero — offertens 24 ljus (räknebara), utan kinesisk text, + badge ---------- */
async function hero() {
  const p = await passa(await utsnitt('rutnat'), 1520, 1520);          // 1520×887, hamnar under badgen
  for (const [språk, d] of Object.entries(UT)) {
    await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
      .composite([
        { input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) },
        { input: badge(språk), top: 0, left: 0 },
      ]).jpeg({ quality: 92 }).toFile(`${d}/${ID}-hero.jpg`);
  }
  console.log(`✔ ${ID}-hero.jpg (sv + no, badge per språk)`);
}

/* ---------- 2. detalj — tre ljus med spegling ur Temu-bilden (ingen fjärr, ingen badge) ---------- */
async function detalj() {
  const p = await passa(await utsnitt('trerad'), 1520, 1440);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/${ID}-detalj.jpg`);
  console.log(`✔ ${ID}-detalj.jpg (sv + no)`);
}

/* ---------- 3. faktabild — bara fakta ur fakta.mjs ---------- */
const ORD = {
  sv: {
    rubrik: 'PAKETET I SIFFROR',
    rader: [
      { ruta: '24 ST',   titel: 'VÄRMELJUS I PAKETET', under: 'Alla med samma varmvita sken', bild: 'rutnat' },
      { ruta: 'VARMVIT', titel: 'LJUSFÄRGEN',          under: 'Gult, varmt sken – inte kallvitt', bild: 'ettljus' },
      { ruta: 'LED',     titel: 'FLAMMA UTAN ELD',     under: 'Lyser utan öppen låga', bild: 'flamma' },
      { ruta: 'BATTERI', titel: 'DRIVS AV BATTERI',    under: 'Utan sladd och uttag', bild: 'kopp' },
    ],
  },
  no: {
    rubrik: 'PAKKEN I TALL',
    rader: [
      { ruta: '24 STK',   titel: 'TELYS I PAKKEN',     under: 'Alle med samme varmhvite lys', bild: 'rutnat' },
      { ruta: 'VARMHVIT', titel: 'LYSFARGEN',          under: 'Gult, varmt lys – ikke kaldhvitt', bild: 'ettljus' },
      { ruta: 'LED',      titel: 'FLAMME UTEN ILD',    under: 'Lyser uten åpen flamme', bild: 'flamma' },
      { ruta: 'BATTERI',  titel: 'DRIVES AV BATTERI',  under: 'Uten ledning og stikkontakt', bild: 'kopp' },
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
