// Fiskekalendern — bygger galleriet ur leverantörsbilden (offertens image10).
//
// Leverantörsbilden har en kinesisk vattenstämpel tvärs över mittraden.
// KIE/Google vägrar ta bort vattenstämplar, så den rensas deterministiskt:
// varje drag plockas ut som en egen sammanhängande komponent (färgad eller
// mörk pixel), hålen inuti fylls så silverskedarnas ljusa kroppar följer med,
// och allt utanför komponenten vitmålas. Vattenstämpeln ligger på bakgrunden
// och försvinner därmed på köpet. Rester som ligger PÅ ett drag går inte att
// ta bort utan att hitta på pixlar — de får sitta kvar.
//
// Kör:  node temu/batch6/fiskekalender-bilder.mjs <källbild> <utmapp> [sv|no]
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';

const SRC = process.argv[2] || '/tmp/fix/b6/bilder/image10.png';
const UT = process.argv[3] || '/tmp/fisk/ut';
const SPRÅK = process.argv[4] || 'sv';
mkdirSync(UT, { recursive: true });

// Bildtexterna måste följa butikens språk — svensk text på en norsk produktsida
// är samma fel som kinesisk text på en svensk.
const ORD = {
  sv: {
    badge: ['24 DRAG', 'BAKOM 24 LUCKOR'], badgeBredd: 366,
    allaRubrik: 'ALLA 24 DRAGEN',
    allaFot: '8 skeddrag · 7 wobblers · 6 mjukbeten · 3 vibrationsdrag',
    sorterRubrik: 'FYRA SORTER I LÅDAN', styck: 'ST',
    grupper: [
      ['WOBBLERS', 'flytande och sjunkande'],
      ['SKEDDRAG', 'guld, silver och hammarslag'],
      ['MJUKBETEN', 'räkor, kräfta och grodor'],
      ['VIBRATIONSDRAG', 'blad som vibrerar i draget'],
    ],
  },
  no: {
    badge: ['24 SLUK', 'BAK 24 LUKER'], badgeBredd: 340,
    allaRubrik: 'ALLE 24 SLUKENE',
    allaFot: '8 blinker · 7 wobblere · 6 myke agn · 3 vibrasjonssluk',
    sorterRubrik: 'FIRE SLAG I KASSEN', styck: 'STK',
    grupper: [
      ['WOBBLERE', 'flytende og synkende'],
      ['BLINKER', 'gull, sølv og hammerslag'],
      ['MYKE AGN', 'reker, kreps og frosker'],
      ['VIBRASJONSSLUK', 'blad som vibrerer i draget'],
    ],
  },
}[SPRÅK];
if (!ORD) throw new Error(`okänt språk: ${SPRÅK}`);

const BLA = '#0b2a3d', GUL = '#ffd24a', GRA = '#5b6b76';

/* ---------- 1. segmentering ---------- */
const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
const mask = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * C, r = data[i], g = data[i + 1], b = data[i + 2];
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  mask[y * W + x] = (mx - mn > 22 || mx < 175) ? 1 : 0;   // färgad eller mörk
}
const R = 8;                                   // sammanfogar kropp + tunna krokar
const lbl = new Int32Array(W * H).fill(-1), komp = [], stack = [];
for (let s = 0; s < W * H; s++) {
  if (!mask[s] || lbl[s] !== -1) continue;
  const id = komp.length; lbl[s] = id; stack.push(s);
  let x0 = W, y0 = H, x1 = 0, y1 = 0, n = 0;
  while (stack.length) {
    const p = stack.pop(), px = p % W, py = (p - px) / W; n++;
    if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const nx = px + dx, ny = py + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const q = ny * W + nx;
      if (mask[q] && lbl[q] === -1) { lbl[q] = id; stack.push(q); }
    }
  }
  komp.push({ id, x0, y0, x1, y1, n, w: x1 - x0 + 1, h: y1 - y0 + 1 });
}
const dilatera = (bm, w, h, r) => {
  const tmp = new Uint8Array(w * h), ut = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    let c = 0; for (let x = 0; x < w + r; x++) { if (x < w && bm[y * w + x]) c = r * 2 + 1; else if (c > 0) c--; const px = x - r; if (px >= 0 && px < w && c > 0) tmp[y * w + px] = 1; }
    let d = 0; for (let x = w - 1; x >= -r; x--) { if (x >= 0 && bm[y * w + x]) d = r * 2 + 1; else if (d > 0) d--; const px = x + r; if (px >= 0 && px < w && d > 0) tmp[y * w + px] = 1; }
  }
  for (let x = 0; x < w; x++) {
    let c = 0; for (let y = 0; y < h + r; y++) { if (y < h && tmp[y * w + x]) c = r * 2 + 1; else if (c > 0) c--; const py = y - r; if (py >= 0 && py < h && c > 0) ut[py * w + x] = 1; }
    let d = 0; for (let y = h - 1; y >= -r; y--) { if (y >= 0 && tmp[y * w + x]) d = r * 2 + 1; else if (d > 0) d--; const py = y + r; if (py >= 0 && py < h && d > 0) ut[py * w + x] = 1; }
  }
  return ut;
};
const fyllHal = (bm, w, h) => {
  const bak = new Uint8Array(w * h), st = [];
  const tryck = (x, y) => { const q = y * w + x; if (!bm[q] && !bak[q]) { bak[q] = 1; st.push(q); } };
  for (let x = 0; x < w; x++) { tryck(x, 0); tryck(x, h - 1); }
  for (let y = 0; y < h; y++) { tryck(0, y); tryck(w - 1, y); }
  while (st.length) { const p = st.pop(), px = p % w, py = (p - px) / w;
    if (px > 0) tryck(px - 1, py); if (px < w - 1) tryck(px + 1, py);
    if (py > 0) tryck(px, py - 1); if (py < h - 1) tryck(px, py + 1); }
  const ut = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) ut[i] = bak[i] ? 0 : 1; return ut;
};

// Integralbild över rentvitt — används för att skilja vattenstämpelns streck
// (ligger i en nästan helvit omgivning) från ljus metall på ett drag.
const vit = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * C, mx = Math.max(data[i], data[i + 1], data[i + 2]), mn = Math.min(data[i], data[i + 1], data[i + 2]);
  vit[y * W + x] = (mx > 246 && mx - mn < 8) ? 1 : 0;
}
const II = new Int32Array((W + 1) * (H + 1));
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
  II[(y + 1) * (W + 1) + (x + 1)] = vit[y * W + x] + II[y * (W + 1) + (x + 1)] + II[(y + 1) * (W + 1) + x] - II[y * (W + 1) + x];
const andelVit = (x, y, r) => {
  const a = Math.max(0, x - r), b2 = Math.max(0, y - r), c = Math.min(W - 1, x + r), d2 = Math.min(H - 1, y + r);
  const s2 = II[(d2 + 1) * (W + 1) + (c + 1)] - II[b2 * (W + 1) + (c + 1)] - II[(d2 + 1) * (W + 1) + a] + II[b2 * (W + 1) + a];
  return s2 / ((c - a + 1) * (d2 - b2 + 1));
};

const stora = komp.filter(k => k.n > 2500 && k.w > 30 && k.h > 40).sort((a, b) => (a.y0 - b.y0) || (a.x0 - b.x0));
const bitar = [];
for (const k of stora) {
  const pad = 10;
  const x0 = Math.max(0, k.x0 - pad), y0 = Math.max(0, k.y0 - pad);
  const w = Math.min(W - x0, k.w + pad * 2), h = Math.min(H - y0, k.h + pad * 2);
  const bm = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (lbl[(y0 + y) * W + (x0 + x)] === k.id) bm[y * w + x] = 1;
  const region = fyllHal(dilatera(bm, w, h, 6), w, h);
  const px = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const s = ((y0 + y) * W + (x0 + x)) * C, d = (y * w + x) * 4;
    let inne = region[y * w + x];
    // Håligenfyllningen sluter också in fickor mellan kropp, lina och krok.
    // Ligger en ljusgrå pixel där i en nästan helvit omgivning är det stämpel.
    if (inne && !bm[y * w + x]) {
      const r2 = data[s], g2 = data[s + 1], b2 = data[s + 2];
      const mx = Math.max(r2, g2, b2), mn = Math.min(r2, g2, b2);
      if (mx - mn < 32 && mx > 145 && mx < 252 && andelVit(x0 + x, y0 + y, 30) > 0.45) inne = 0;
    }
    px[d] = inne ? data[s] : 255; px[d + 1] = inne ? data[s + 1] : 255;
    px[d + 2] = inne ? data[s + 2] : 255; px[d + 3] = inne ? 255 : 0;
  }
  bitar.push({ png: await sharp(px, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer(), w, h });
}
if (bitar.length !== 25) throw new Error(`väntade 25 bitar (24 drag + asken), fick ${bitar.length}`);

// Komponent 01 är kartongen. Dilationen drar in en lös krokbit i högerkanten —
// den kapas bort så huvudbilden inte får ett svävande streck bredvid asken.
const rå = bitar[1];
// Kartongen är den enda breda kolumnen i utklippet — kanterna bortom den är
// lösa krokbitar som dilationen dragit med. Beskär till kartongens egen bredd.
{
  const { data: ad, info: ai } = await sharp(rå.png).flatten({ background: '#ffffff' }).raw().toBuffer({ resolveWithObject: true });
  const bred = [];
  for (let x = 0; x < ai.width; x++) {
    let n = 0;
    for (let y = 0; y < ai.height; y++) {
      const i = (y * ai.width + x) * ai.channels;
      if (Math.max(ad[i], ad[i + 1], ad[i + 2]) < 244) n++;
    }
    if (n > ai.height * 0.35) bred.push(x);
  }
  if (!bred.length) throw new Error('hittar inte kartongens kolumner');
  const v = Math.max(0, bred[0] - 6), h2 = Math.min(ai.width - v, bred[bred.length - 1] - v + 7);
  var ASK = { png: await sharp(rå.png).extract({ left: v, top: 0, width: h2, height: rå.h }).png().toBuffer(), w: h2, h: rå.h };
}
const DRAG = bitar.filter((_, i) => i !== 1);           // 24 drag
if (DRAG.length !== 24) throw new Error('drag ≠ 24');
const d = (i) => DRAG[i];

/* ---------- hjälpare ---------- */
async function placera(bit, maxW, maxH) {
  const s = Math.min(maxW / bit.w, maxH / bit.h);
  const w = Math.round(bit.w * s), h = Math.round(bit.h * s);
  return { buf: await sharp(bit.png).resize(w, h).png().toBuffer(), w, h };
}
const text = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- 2. huvudbild ---------- */
{
  const S = 1600, lager = [];
  const ask = await placera(ASK, 1080, 900);
  lager.push({ input: ask.buf, top: 190, left: Math.round((S - ask.w) / 2) });

  // sex drag i en solfjäder under asken: popper, minnow, guldsked, grön grodа, räka, vib
  const rad = [3 - 1, 4 - 1, 15 - 1, 14 - 1, 0, 20 - 1].map((i) => DRAG[i]);
  const bredd = Math.floor((S - 160) / rad.length);
  for (let i = 0; i < rad.length; i++) {
    const p = await placera(rad[i], bredd - 18, 420);
    lager.push({ input: p.buf, top: 1560 - p.h, left: 80 + i * bredd + Math.floor((bredd - p.w) / 2) });
  }
  const bw = ORD.badgeBredd, bx = 54 + bw / 2;
  const svg = `<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
    <rect x="54" y="54" width="${bw}" height="150" rx="16" fill="#12212b" opacity="0.94"/>
    <text x="${bx}" y="122" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="66" fill="#ffffff">${ORD.badge[0]}</text>
    <text x="${bx}" y="172" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="31" fill="${GUL}" letter-spacing="2">${ORD.badge[1]}</text>
  </svg>`;
  lager.push({ input: Buffer.from(svg), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT}/fiskekalender-hero.jpg`);
  console.log('✔ fiskekalender-hero.jpg');
}

/* ---------- 3. alla 24 dragen ---------- */
{
  const S = 1600, top = 150, cols = 6, radH = Math.floor((S - top - 60) / 4);
  const cellW = Math.floor(S / cols), lager = [];
  const ordning = [2, 3, 4, 5, 6, 9, 12,      // wobblers (7)
    14, 15, 16, 17, 18, 20, 21, 22,           // skeddrag (8)
    0, 1, 7, 10, 11, 13,                      // mjukbeten (6)
    8, 19, 23];                               // vibbar/blad (3)
  for (let i = 0; i < 24; i++) {
    const p = await placera(d(ordning[i]), cellW - 34, radH - 34);
    const r = Math.floor(i / cols), c = i % cols;
    lager.push({ input: p.buf, top: top + r * radH + Math.floor((radH - p.h) / 2), left: c * cellW + Math.floor((cellW - p.w) / 2) });
  }
  const svg = `<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="${S}" height="112" fill="${BLA}"/>
    <text x="${S / 2}" y="74" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="54" fill="#ffffff" letter-spacing="3">${ORD.allaRubrik}</text>
    <text x="${S / 2}" y="1566" text-anchor="middle" font-family="DejaVu Sans" font-size="30" fill="${GRA}">${ORD.allaFot}</text>
  </svg>`;
  lager.push({ input: Buffer.from(svg), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT}/fiskekalender-alla.jpg`);
  console.log('✔ fiskekalender-alla.jpg');
}

/* ---------- 4. sorterna ---------- */
{
  const S = 1600, lager = [];
  const antal = [7, 8, 6, 3], exempel = [[3, 4, 5], [14, 16, 18], [0, 10, 13], [8, 19, 23]];
  const grupper = ORD.grupper.map(([rubrik, under], i) => ({ rubrik, under, antal: antal[i], drag: exempel[i] }));
  const radH = Math.floor((S - 120) / 4);
  const svgDelar = [`<rect x="0" y="0" width="${S}" height="120" fill="${BLA}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#ffffff" letter-spacing="3">${ORD.sorterRubrik}</text>`];
  for (let g = 0; g < grupper.length; g++) {
    const y = 120 + g * radH;
    if (g) svgDelar.push(`<rect x="90" y="${y}" width="${S - 180}" height="2" fill="#e4e8ea"/>`);
    svgDelar.push(`<text x="96" y="${y + 78}" font-family="DejaVu Sans" font-weight="bold" font-size="44" fill="${BLA}">${text(grupper[g].rubrik)}</text>`);
    svgDelar.push(`<text x="96" y="${y + 126}" font-family="DejaVu Sans" font-size="29" fill="${GRA}">${text(grupper[g].under)}</text>`);
    const kw = ORD.styck === 'STK' ? 156 : 132;
    svgDelar.push(`<rect x="96" y="${y + 158}" width="${kw}" height="58" rx="10" fill="${GUL}"/>`);
    svgDelar.push(`<text x="${96 + kw / 2}" y="${y + 200}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="38" fill="#12212b">${grupper[g].antal} ${ORD.styck}</text>`);
    const cellW = 300;
    for (let i = 0; i < grupper[g].drag.length; i++) {
      const p = await placera(d(grupper[g].drag[i]), 230, radH - 70);
      lager.push({ input: p.buf, top: y + Math.floor((radH - p.h) / 2), left: 680 + i * cellW + Math.floor((cellW - p.w) / 2) });
    }
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svgDelar.join('')}</svg>`), top: 0, left: 0 });
  await sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite(lager).jpeg({ quality: 92 }).toFile(`${UT}/fiskekalender-sorter.jpg`);
  console.log('✔ fiskekalender-sorter.jpg');
}

/* ---------- 5. lös ask + lösa drag för AI-referens ---------- */
await sharp(ASK.png).flatten({ background: '#ffffff' }).jpeg({ quality: 95 }).toFile(`${UT}/fiskekalender-ask.jpg`);
writeFileSync(`${UT}/bitar.json`, JSON.stringify({ ask: [ASK.w, ASK.h], drag: DRAG.map((b) => [b.w, b.h]) }, null, 1));
console.log('✔ fiskekalender-ask.jpg + bitar.json');
