// Engångsbygge: 5 statics för Sushi-Strumporna (swipe av svenskhusman_socks)
// Baser = riktiga produktfoton från matstrumpor.se. Text = skarp SVG via sharp.
import sharp from '/home/user/yognftnfgn/pipeline/node_modules/sharp/lib/index.js';
import { mkdirSync } from 'node:fs';

const SRC = new URL('./sushi-src/', import.meta.url).pathname;
const OUT = new URL('./sushi-out/', import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const W = 1080, H = 1350;
const FONT = 'DejaVu Sans';

async function coverCrop(src, out) {
  await sharp(SRC + src)
    .resize(W, H, { fit: 'cover', position: sharp.strategy.attention, kernel: 'lanczos3' })
    .jpeg({ quality: 92 })
    .toFile(OUT + out);
  console.log('✓', out);
}

async function containWhite(src, out) {
  await sharp(SRC + src)
    .resize(W, H, { fit: 'contain', background: '#ffffff', kernel: 'lanczos3' })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 92 })
    .toFile(OUT + out);
  console.log('✓', out);
}

// A1–A4: rena produktfoton i 4:5, som originalens statics
await coverCrop('img2.jpg', 'A1-sushiboxen-stamning.jpg');       // box + croissant, ljus lifestyle
await coverCrop('img4.jpg', 'A2-narbild-bitar.jpg');             // bitar på fat, pastell
await containWhite('img0.jpg', 'A3-hela-kollektionen.jpg');      // box + 5 par, vit bg
await coverCrop('img6.png', 'A4-bambubricka-illusion.jpg');      // ser mest ut som riktig sushi

// A5: kampanjgrafik i originalets "Sommarkampanj"-stil — pristext som vektor
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="#FFC93C"/>
  <circle cx="60" cy="80" r="140" fill="#FFD96B"/>
  <circle cx="1040" cy="1300" r="180" fill="#FFD96B"/>

  <text x="${W/2}" y="150" text-anchor="middle" font-family="${FONT}" font-weight="bold"
        font-size="60" letter-spacing="4" fill="#B3261E">SUSHI-STRUMPOR</text>

  <text x="${W/2}" y="290" text-anchor="middle" font-family="${FONT}" font-weight="bold"
        font-size="112" fill="#1F1F1F">2 PAR TILL</text>
  <text x="${W/2}" y="415" text-anchor="middle" font-family="${FONT}" font-weight="bold"
        font-size="112" fill="#1F1F1F">${esc('FÖR 30 KR')}</text>

  <rect x="90" y="480" width="900" height="640" rx="32" fill="#ffffff"/>

  <text x="${W/2}" y="1195" text-anchor="middle" font-family="${FONT}" font-weight="bold"
        font-size="52" fill="#1F1F1F">3 par 369 kr &#183; 5 par 399 kr</text>

  <rect x="${W/2 - 220}" y="1235" width="440" height="86" rx="43" fill="#B3261E"/>
  <text x="${W/2}" y="1292" text-anchor="middle" font-family="${FONT}" font-weight="bold"
        font-size="42" fill="#ffffff">Shoppa nu</text>
</svg>`;

const product = await sharp(SRC + 'img0.jpg')
  .resize(840, 580, { fit: 'contain', background: '#ffffff', kernel: 'lanczos3' })
  .toBuffer();

await sharp(Buffer.from(svg))
  .composite([{ input: product, left: 120, top: 510 }])
  .jpeg({ quality: 92 })
  .toFile(OUT + 'A5-kampanjgrafik.jpg');
console.log('✓ A5-kampanjgrafik.jpg');
