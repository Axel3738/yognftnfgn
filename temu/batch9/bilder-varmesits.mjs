// Värmesits 45 × 90 cm (TEMU-B10-VARMESITS) — bygger produktbilderna.
//
// Källor:
//   /tmp/b9/b/bilder/image17.jpg (900×900) — leverantörens måttbild med TVÅ
//     dynor: 90×45 till vänster och 45×45 till höger. Vi säljer BARA 45×90-
//     versionen, så den högra dynan beskärs bort helt, liksom alla måttpilar
//     och texterna "90cm/35.43inch", "45cm/17.71inch" och "45 cm/17.71 inch".
//     Måtten sätts i stället som skarp text på detaljbilden (SVG).
//   /tmp/b9/b/bilder/image4.png (574×579) — marknadsbild med engelska rubriker
//     ("4 Heated Areas", "Electric Heating Pad", "45*45cm", "45*90cm",
//     "No Power Bank!!!") och ritade eldsflammor. Bara utsnittet med de tre
//     färgade knapparna används (y 170–234, fritt från text). Dynorna med
//     glödande värmezoner går INTE att använda: flammorna är ritade över de
//     nedre zonerna, och ett utsnitt utan flammor visar färre än fyra zoner.
//     Ingen powerbank syns på någon bild.
//
// LÅSTA FAKTA (temu/batch9/fakta.mjs): 45 × 90 cm · 4 värmezoner · 3 lägen
// (tre färgade knappar) · USB · powerbank ingår INTE. Inget om temperatur,
// watt eller tid.
//
// Kör:  node temu/batch9/bilder-varmesits.mjs   # hero + detalj + fakta (sv & no)
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';

const MÅTT = '/tmp/b9/b/bilder/image17.jpg';
const MARK = '/tmp/b9/b/bilder/image4.png';
const UT = { sv: '/tmp/b9/ut/varmesits', no: '/tmp/b9/ut-no/varmesits' };
for (const d of Object.values(UT)) mkdirSync(d, { recursive: true });

const S = 1600;                                  // alla leveranser är 1600×1600
const BLÅ = '#0b2a3d', GUL = '#ffd24a', GRÅ = '#5b6b76';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- utsnitt (fil, x, y, bredd, höjd i källbildens egna pixlar) --------
   Varje ruta är visuellt kontrollerad mot originalet innan den låstes.        */
const UTSNITT = {
  dyna:    [MÅTT, 88, 18, 340, 647],    // hela 45×90-dynan (kant 103–411 × 33–650) med luft; slutar ovanför den vågräta måttpilen (y 673) och innanför den lodräta (x 61)
  mitt:    [MÅTT, 120, 220, 270, 300],  // quiltmönstret mitt på dynan, ingen text
  knapp:   [MÅTT, 96, 370, 150, 260],   // dynans nedre vänstra del: den vita USB-fliken och den svarta strömknappen
  knappar: [MARK, 383, 170, 190, 64],   // de tre knapparna (röd/blå/grön) — enda utsnittet ur marknadsbilden, fritt från text och flammor
};

async function utsnitt(namn) {
  const [fil, left, top, width, height] = UTSNITT[namn];
  return sharp(fil).extract({ left, top, width, height }).flatten({ background: '#ffffff' }).png().toBuffer();
}

// Skalar in en bild i en ruta och returnerar buffert + verklig storlek.
async function passa(buf, maxW, maxH) {
  const m = await sharp(buf).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(buf).resize(w, h, { kernel: 'lanczos3' }).sharpen({ sigma: 0.8 }).png().toBuffer(), w, h };
}

/* ---------- 1. hero — dynan ensam, utan måttpilar och utan 45×45-dynan ---------- */
async function hero() {
  const p = await passa(await utsnitt('dyna'), 1520, 1520);
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top: Math.round((S - p.h) / 2), left: Math.round((S - p.w) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/varmesits-hero.jpg`);
  console.log('✔ varmesits-hero.jpg (sv + no)');
}

/* ---------- 2. detalj — storleksguide: dynan med måtten som skarp text ----------
   Siffrorna är språkneutrala ("90 cm", "45 cm"), så bilden är identisk sv/no. */
async function detalj() {
  const p = await passa(await utsnitt('dyna'), 700, 1190);
  const top = 130, left = Math.round((S - p.w) / 2) + 90;      // skjuts åt höger så måttlinjen får plats till vänster
  const right = left + p.w, bottom = top + p.h;
  const lx = left - 110, ly = bottom + 110;                    // lodrät resp. vågrät måttlinje
  const pil = (x, y, rot) => `<polygon points="0,0 -12,26 12,26" fill="${BLÅ}" transform="translate(${x} ${y}) rotate(${rot})"/>`;
  const svg = `<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
    <g stroke="${BLÅ}" stroke-width="4" fill="none">
      <line x1="${lx}" y1="${top + 24}" x2="${lx}" y2="${bottom - 24}"/>
      <line x1="${lx - 30}" y1="${top}" x2="${left - 16}" y2="${top}"/>
      <line x1="${lx - 30}" y1="${bottom}" x2="${left - 16}" y2="${bottom}"/>
      <line x1="${left + 24}" y1="${ly}" x2="${right - 24}" y2="${ly}"/>
      <line x1="${left}" y1="${bottom + 16}" x2="${left}" y2="${ly + 30}"/>
      <line x1="${right}" y1="${bottom + 16}" x2="${right}" y2="${ly + 30}"/>
    </g>
    ${pil(lx, top, 0)}${pil(lx, bottom, 180)}${pil(left, ly, -90)}${pil(right, ly, 90)}
    <text transform="rotate(-90 ${lx - 46} ${(top + bottom) / 2})" x="${lx - 46}" y="${(top + bottom) / 2}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="68" fill="${BLÅ}">90 cm</text>
    <text x="${(left + right) / 2}" y="${ly + 96}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="68" fill="${BLÅ}">45 cm</text>
  </svg>`;
  const jpg = await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: p.buf, top, left }, { input: Buffer.from(svg), top: 0, left: 0 }])
    .jpeg({ quality: 92 }).toBuffer();
  for (const d of Object.values(UT)) await sharp(jpg).toFile(`${d}/varmesits-detalj.jpg`);
  console.log('✔ varmesits-detalj.jpg (sv + no)');
}

/* ---------- 3. faktabild — bara fakta ur fakta.mjs ----------
   Raden om fyra värmezoner illustreras med ett NEUTRALT utsnitt (quiltmönstret),
   inte med marknadsbildens glödande zoner — där går de inte att beskära fria
   från flammorna utan att man räknar till färre än fyra.                       */
const ORD = {
  sv: {
    rubrik: 'VÄRMESITSEN I SIFFROR',
    rader: [
      { ruta: '45 × 90 CM', titel: 'STORLEK',      under: 'Dynan är 45 cm bred och 90 cm lång', bild: 'dyna' },
      { ruta: '4 ST',       titel: 'VÄRMEZONER',   under: 'Fyra värmezoner i dynan', bild: 'mitt' },
      { ruta: '3 LÄGEN',    titel: 'VÄRMENIVÅER',  under: 'Knappen visar läget med tre färger', bild: 'knappar' },
      { ruta: 'USB',        titel: 'DRIFT',        under: 'Drivs via USB – powerbank ingår inte', bild: 'knapp' },
    ],
  },
  no: {
    rubrik: 'VARMESETET I TALL',
    rader: [
      { ruta: '45 × 90 CM', titel: 'STØRRELSE',    under: 'Puten er 45 cm bred og 90 cm lang', bild: 'dyna' },
      { ruta: '4 STK',      titel: 'VARMESONER',   under: 'Fire varmesoner i puten', bild: 'mitt' },
      { ruta: '3 TRINN',    titel: 'VARMENIVÅER',  under: 'Knappen viser trinnet med tre farger', bild: 'knappar' },
      { ruta: 'USB',        titel: 'DRIFT',        under: 'Drives via USB – powerbank følger ikke med', bild: 'knapp' },
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
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT[språk]}/varmesits-fakta.jpg`);
  console.log(`✔ varmesits-fakta.jpg (${språk})`);
}

/* ---------- körning ---------- */
await hero(); await detalj(); await fakta('sv'); await fakta('no');
