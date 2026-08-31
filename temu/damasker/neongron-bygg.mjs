import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
const src = '/tmp/fix/dam-live/NG.img';
// 1. Klipp bort textkolumnen (0-239) — produkten ligger 263-699
const del = await sharp(src).extract({ left: 240, top: 0, width: 560, height: 800 }).png().toBuffer();
// 2. Hitta produktens bbox i den biten
const { data, info } = await sharp(del).greyscale().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
let minX = W, maxX = 0, minY = H, maxY = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (data[y * W + x] < 235) { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; }
}
console.log('produktens bbox i utsnittet:', minX, minY, maxX, maxY);
const bw = maxX - minX + 1, bh = maxY - minY + 1;
const produkt = await sharp(del).extract({ left: minX, top: minY, width: bw, height: bh }).png().toBuffer();
// 3. Centrera på vit 800x800 med 6 % marginal (samma känsla som syskonbilderna)
const mal = 800, inner = Math.round(mal * 0.88);
const skalad = await sharp(produkt).resize(inner, inner, { fit: 'inside' }).png().toBuffer();
const m = await sharp(skalad).metadata();
const ut = await sharp({ create: { width: mal, height: mal, channels: 3, background: '#ffffff' } })
  .composite([{ input: skalad, left: Math.round((mal - m.width) / 2), top: Math.round((mal - m.height) / 2) }])
  .jpeg({ quality: 92 }).toBuffer();
const fs = await import('node:fs');
fs.writeFileSync('/tmp/fix/dam-kie-ut/neongron.jpg', ut);
console.log('klar → dam-kie-ut/neongron.jpg', ut.length, 'byte');
