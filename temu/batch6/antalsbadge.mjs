// Lägger en tydlig "2 ST INGÅR"-etikett på huvudbilden. Sharp, inte AI —
// texten blir skarp och siffran kan inte hallucineras.
import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { writeFileSync } from 'node:fs';

const TEXT = { se: ['2 ST', 'INGÅR'], no: ['2 STK', 'FØLGER MED'] };
for (const [land, rader] of Object.entries(TEXT)) {
  const W = 1000, bh = 132, bw = land === 'se' ? 300 : 380;
  const svg = `<svg width="${W}" height="${W}" xmlns="http://www.w3.org/2000/svg">
    <g>
      <rect x="34" y="34" width="${bw}" height="${bh}" rx="14" fill="#1c1c1c" opacity="0.93"/>
      <text x="${34 + bw / 2}" y="94" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="60" fill="#ffffff">${rader[0]}</text>
      <text x="${34 + bw / 2}" y="139" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="34" fill="#ffd24a" letter-spacing="2">${rader[1]}</text>
    </g>
  </svg>`;
  writeFileSync(`hero-${land}.jpg`, await sharp('hero.jpg').composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).jpeg({ quality: 93 }).toBuffer());
  console.log('✔', land);
}
await sharp('hero-se.jpg').resize(620).png().toFile('v-badge.png');
