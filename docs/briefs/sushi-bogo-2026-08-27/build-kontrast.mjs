// F: swipe av Ristals kontrastannons ("Detta är dekoration." / "Detta är motivation.")
// Vår kategoriomdefiniering: vanliga strumpor = dammsamlare, sushiboxen = reaktion.
import { sharp, textBlock, esc } from './layout.mjs';

const W = 1080, H = 1350;
const BG = '#EFE9E1';      // varm off-white vägg, som originalet
const INK = '#141414';
const MINT = '#7CE8A8';    // grön CTA-pill

const svgDoc = inner => Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`);

// Vänster: den tråkiga presenten, i tunn svart ram (speglar originalets inramade poster)
const LW = 348, LH = 470, LX = 44, LY = 476;
const vanster = await sharp('kie-out/F-vanliga-strumpor.png')
  .extract({ left: 120, top: 300, width: 780, height: 620 })
  .resize(LW - 16, LH - 16, { fit: 'cover', kernel: 'lanczos3' }).toBuffer();

// Höger: produkten med varm glow — hjälten, större
const RW = 552, RH = 700, RX = 484, RY = 300;
const hoger = await sharp('kie-out/F-box-glow.png')
  .resize(RW, RH, { fit: 'cover', position: 'centre', kernel: 'lanczos3' }).toBuffer();

const rubV = textBlock({ text: 'Detta är en dammsamlare.', x: LX + LW / 2, y: 388,
  maxBredd: LW + 120, maxSize: 34, maxRader: 2, fill: INK });
const rubH = textBlock({ text: 'Detta är en reaktion.', x: RX + RW / 2, y: 250,
  maxBredd: RW + 40, maxSize: 44, maxRader: 2, fill: INK });
const tag = textBlock({ text: 'Gör present till reaktion.', x: W / 2, y: 1090,
  maxBredd: W - 200, maxSize: 40, maxRader: 2, fill: '#3A3A3A', weight: 'normal' });

const knappB = 330, knappH = 78, knappY = 1150;
const knapp =
  `<rect x="${W / 2 - knappB / 2}" y="${knappY}" width="${knappB}" height="${knappH}" rx="18" fill="${MINT}"/>` +
  `<text x="${W / 2}" y="${knappY + 52}" text-anchor="middle" font-family="DejaVu Sans" ` +
  `font-weight="bold" font-size="36" fill="${INK}">${esc('Fixa presenten')}</text>`;

const wordmark =
  `<text x="${W / 2}" y="1300" text-anchor="middle" font-family="DejaVu Sans" font-weight="normal" ` +
  `font-size="30" letter-spacing="7" fill="#6E6E6E">MATSTRUMPOR.SE</text>`;

// Svart ram runt vänsterbilden
const ram = `<rect x="${LX}" y="${LY}" width="${LW}" height="${LH}" fill="#111111"/>`;

await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
  .composite([
    { input: svgDoc(ram), left: 0, top: 0 },
    { input: vanster, left: LX + 8, top: LY + 8 },
    { input: hoger, left: RX, top: RY },
    { input: svgDoc(rubV.svg + rubH.svg + tag.svg + knapp + wordmark), left: 0, top: 0 },
  ])
  .jpeg({ quality: 92 })
  .toFile('ads-out/F-dammsamlare-reaktion.jpg');
console.log('✓ F-dammsamlare-reaktion.jpg');
