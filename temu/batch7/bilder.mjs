// Gör hero-bilder av offertens inbäddade bilder: beskär bort kinesiska rubriker,
// centrera på vit kvadrat. Ingen AI — deterministiskt.
import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { writeFileSync } from 'node:fs';

const kvadrat = async (buf, mal = 1400) => {
  const { data, info } = await sharp(buf).greyscale().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height;
  let minX = W, maxX = 0, minY = H, maxY = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[y * W + x] < 240) {
    if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  const beskuren = await sharp(buf).extract({ left: minX, top: minY, width: bw, height: bh }).png().toBuffer();
  const inner = Math.round(mal * 0.88);
  const skalad = await sharp(beskuren).resize(inner, inner, { fit: 'inside' }).png().toBuffer();
  const m = await sharp(skalad).metadata();
  return sharp({ create: { width: mal, height: mal, channels: 3, background: '#ffffff' } })
    .composite([{ input: skalad, left: Math.round((mal - m.width) / 2), top: Math.round((mal - m.height) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
};

const B = '/tmp/fix/b7/bilder', K = '/tmp/fix/b7/klar';
// Rena bilder — bara bbox + kvadrat
for (const [namn, fil] of [['grindhjul', 'image3'], ['solcellslarm', 'image1'], ['stegstod', 'image2'], ['infartslarm', 'image7']]) {
  writeFileSync(`${K}/${namn}.jpg`, await kvadrat(await sharp(`${B}/${fil}.jpg`).png().toBuffer()));
  console.log('✔', namn);
}
// Sittkäppen: klipp bort den kinesiska rubriken 产品信息 högst upp (y 0–200 av 800)
writeFileSync(`${K}/sittkapp.jpg`, await kvadrat(await sharp(`${B}/image4.jpg`).extract({ left: 0, top: 200, width: 800, height: 600 }).png().toBuffer()));
console.log('✔ sittkapp (kinesisk rubrik bortklippt)');
// Termoskyddet: bara måttskisser finns — den stora (211 cm) är den offerten gäller
writeFileSync(`${K}/termoskydd-matt.jpg`, await kvadrat(await sharp(`${B}/image6.jpg`).png().toBuffer()));
console.log('✔ termoskydd-matt');
