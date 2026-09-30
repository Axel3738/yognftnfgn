// Scratch: 05-tillbehor-i-bruk — de fyra fotorutorna ur amazon-B0FVSM4YZC-06 (rubrikbandet bort) sätts om som ett
// symmetriskt 2×2-rutnät: varje ruta mittbeskärs till kvadrat, samma hörnradie, lika bred grön ram runt om.
import { createRequire } from 'node:module';
const sharp = createRequire('/home/user/yognftnfgn/temu/kalendrar/bild.mjs')('sharp');
const S = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent';
const src = `${S}/kallor/golf/amazon-B0FVSM4YZC-06.jpg`;
const PW = 725, PH = 640, IN = 4, R = 28, RAM = 22, GAP = 16;   // IN: kant som skärs bort (källans ram + snöflingor)
const rutor = [[18, 167], [758, 167], [18, 833], [758, 833]];
const mask = Buffer.from(`<svg width="${PH}" height="${PH}"><rect width="${PH}" height="${PH}" rx="${R}" ry="${R}" fill="#fff"/></svg>`);
const C = RAM * 2 + PH * 2 + GAP;
const lager = [];
for (const [i, [x, y]] of rutor.entries()) {
  const buf = await sharp(src).extract({ left: x + Math.floor((PW - PH) / 2), top: y + IN, width: PH, height: PH }).ensureAlpha()
    .composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  lager.push({ input: buf, left: RAM + (i % 2) * (PH + GAP), top: RAM + Math.floor(i / 2) * (PH + GAP) });
}
await sharp({ create: { width: C, height: C, channels: 3, background: { r: 3, g: 93, b: 57 } } }).composite(lager)
  .jpeg({ quality: 90 }).toFile(`${S}/galleri/golf/02-tillbehor-i-bruk.jpg`);
console.log('✔ 02-tillbehor-i-bruk.jpg', C);
