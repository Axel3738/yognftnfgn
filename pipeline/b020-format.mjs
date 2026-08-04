// B020-formatet — kontots bästa vinkel-static (ROAS 2,53, lägst CTR).
// Struktur: svart topp-band med rubrik → 50/50 split-foto → kursiv footer → vit pris-pill.
// Ingen rabatt. Öppet pris. Vinkeln gör jobbet.
//
// Kör:  node b020-format.mjs --left=assets/rost.png [--right=assets/mastern.png] --out=output/namn.png
// Utan --right klipps höger panel ur den befintliga B020-annonsen (egen, bevisad asset).

import sharp from 'sharp';

const arg = (k, d = null) => {
  const a = process.argv.find(x => x.startsWith(`--${k}=`));
  return a ? a.split('=').slice(1).join('=') : d;
};

const W = 1080, H = 1350;
const COL = { black: '#000000', cream: '#FFFFFF' };
const FONT = "'DejaVu Sans','Liberation Sans',sans-serif";
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function wrap(t, max) {
  const w = t.split(/\s+/); const L = []; let l = '';
  for (const x of w) {
    if ((l + ' ' + x).trim().length > max && l) { L.push(l.trim()); l = x; }
    else l = (l + ' ' + x).trim();
  }
  if (l) L.push(l.trim());
  return L;
}

// --- Innehåll (byt här för nya varianter) ---
const headline = arg('headline', 'Dom flesta tror att det är gallret som blir gammalt');
const footer   = arg('footer',   'Inbränt fett är frätande. Det äter gallret underifrån.');
const pill     = arg('pill',     '999 kr · Grillkliniken.se');
const outFile  = arg('out', 'output/GRILL_mastern_pain_split_rost_v1.png');

// --- Layoutmått (speglar B020) ---
const headSize = 46, headLead = 56, headMax = 40;
const headLines = wrap(headline, headMax);
const topBandH = 40 + headLines.length * headLead + 24;

const footSize = 40, footLead = 50, footMax = 42;
const footLines = wrap(footer, footMax);
const pillH = 84;
const botBandH = 34 + footLines.length * footLead + 28 + pillH + 34;

const splitTop = topBandH;
const splitH = H - topBandH - botBandH;
const panelW = Math.floor(W / 2) - 3; // 6px mittdelare

// --- Panelbilder ---
async function panel(src, side) {
  const img = sharp(src);
  const meta = await img.metadata();
  // om källan är hela B020-annonsen: klipp ut rätt halva av dess bildzon
  if (side === 'right' && meta.width && meta.height && meta.height > meta.width) {
    const zoneTop = Math.round(meta.height * 0.145);
    const zoneH = Math.round(meta.height * 0.645);
    const halfW = Math.floor(meta.width / 2);
    return img
      .extract({ left: halfW, top: zoneTop, width: meta.width - halfW, height: zoneH })
      .resize(panelW, splitH, { fit: 'cover', position: 'centre' })
      .png().toBuffer();
  }
  return img.resize(panelW, splitH, { fit: 'cover', position: 'centre' }).png().toBuffer();
}

const leftSrc  = arg('left');
const rightSrc = arg('right', 'output/ad_B020_roas2.53.jpg');
if (!leftSrc) {
  console.error('Saknar --left=<bild på rostigt/flagat galler>. Se README för Higgsfield-prompt.');
  process.exit(1);
}

const leftBuf  = await panel(leftSrc, 'left');
const rightBuf = await panel(rightSrc, 'right');

// --- Text ---
const headTs = headLines.map((l, i) =>
  `<tspan x="${W / 2}" y="${44 + i * headLead}">${esc(l)}</tspan>`).join('');
const footBase = H - botBandH + 46;
const footTs = footLines.map((l, i) =>
  `<tspan x="${W / 2}" y="${footBase + i * footLead}">${esc(l)}</tspan>`).join('');
const pillY = footBase + footLines.length * footLead + 18;
const pillW = Math.min(W - 160, 40 + pill.length * 22);

const svg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" xml:space="preserve">
  <rect width="${W}" height="${H}" fill="${COL.black}"/>
  <text text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${headSize}"
        fill="${COL.cream}">${headTs}</text>
  <text text-anchor="middle" font-family="${FONT}" font-weight="700" font-style="italic"
        font-size="${footSize}" fill="${COL.cream}">${footTs}</text>
  <g>
    <rect x="${(W - pillW) / 2}" y="${pillY}" rx="${pillH / 2}" ry="${pillH / 2}"
          width="${pillW}" height="${pillH}" fill="${COL.cream}"/>
    <text text-anchor="middle" x="${W / 2}" y="${pillY + pillH / 2 + 13}" font-family="${FONT}"
          font-weight="700" font-size="36" fill="${COL.black}">${esc(pill)}</text>
  </g>
</svg>`);

const base = await sharp({ create: { width: W, height: H, channels: 3, background: COL.black } })
  .png().toBuffer();

await sharp(base).composite([
  { input: leftBuf,  left: 0,             top: splitTop },
  { input: rightBuf, left: panelW + 6,    top: splitTop },
  { input: svg,      left: 0,             top: 0 },
]).png().toFile(outFile);

console.log(`klar → ${outFile}  (split ${panelW}×${splitH}, topp ${topBandH}, botten ${botBandH})`);
