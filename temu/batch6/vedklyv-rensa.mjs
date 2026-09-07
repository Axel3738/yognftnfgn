import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { writeFileSync } from 'node:fs';
// Textkolumnen ligger till höger; produkten + måttpilarna till vänster.
const del = await sharp('/tmp/fix/b6/bilder/image6.png').extract({ left: 0, top: 0, width: 470, height: 800 }).png().toBuffer();
const { data, info } = await sharp(del).greyscale().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
let minX=W, maxX=0, minY=H, maxY=0;
for (let y=0;y<H;y++) for (let x=0;x<W;x++) if (data[y*W+x] < 235) { if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
console.log('bbox i utsnittet:', minX, minY, maxX, maxY);
// Måttpilarna och de kinesiska etiketterna ligger ytterst — klipp in på själva verktyget
const L = 112, R = 452, T = 48, B = 742;
const produkt = await sharp('/tmp/fix/b6/bilder/image6.png').extract({ left: L, top: T, width: R-L, height: B-T }).png().toBuffer();
const mal = 1000, inner = Math.round(mal*0.86);
const skalad = await sharp(produkt).resize(inner, inner, { fit: 'inside' }).png().toBuffer();
const m = await sharp(skalad).metadata();
writeFileSync('/tmp/fix/b6/hamtat/tandvedsklyv-i-gjutjarn-ring-kil.jpg',
  await sharp({ create: { width: mal, height: mal, channels: 3, background: '#ffffff' } })
    .composite([{ input: skalad, left: Math.round((mal-m.width)/2), top: Math.round((mal-m.height)/2) }])
    .jpeg({ quality: 92 }).toBuffer());
console.log('klar');
