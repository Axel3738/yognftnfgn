// KIE vägrar ta bort vattenstämplar (Googles policy). Deterministisk väg i stället:
// stämpeln ligger i ett vågrätt band mitt i bilden — klipp ut övre delen (asken +
// första raden drag) som huvudbild och nedre delen (skeddragen) som galleribild.
import sharp from '/home/user/yognftnfgn/temu/node_modules/sharp/dist/index.mjs';
import { writeFileSync } from 'node:fs';
const SRC = '/tmp/fix/b6/bilder/image10.png';
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, C = info.channels;
// Radprofil: andel pixlar som är "grå halvgenomskinlig text" (ljusgrå, låg mättnad)
const prof = [];
for (let y = 0; y < H; y++) {
  let n = 0;
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * C, r = data[i], g = data[i + 1], b = data[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max > 150 && max < 235 && max - min < 18) n++;   // grått, varken vitt eller färg
  }
  prof.push(n / W);
}
// Hitta det tätaste bandet i mittregionen
let bästa = { y: 0, s: 0 };
for (let y = Math.floor(H * 0.3); y < H * 0.7; y++) {
  const s = prof.slice(y, y + 120).reduce((a, b) => a + b, 0);
  if (s > bästa.s) bästa = { y, s };
}
console.log(`grått band tätast vid y ${bästa.y}–${bästa.y + 120} av ${H}`);
const topp = 760, botten = 1250; // stämpeln ligger y 900–1040; mittraden drag offras
const kvadrat = async (buf, namn) => {
  const m = await sharp(buf).metadata();
  const sida = Math.max(m.width, m.height);
  const ut = await sharp({ create: { width: sida, height: sida, channels: 3, background: '#ffffff' } })
    .composite([{ input: buf, left: Math.round((sida - m.width) / 2), top: Math.round((sida - m.height) / 2) }])
    .jpeg({ quality: 92 }).toBuffer();
  writeFileSync(namn, ut);
};
await kvadrat(await sharp(SRC).extract({ left: 0, top: 0, width: W, height: topp }).png().toBuffer(), '/tmp/fix/b6/hamtat/fiskekalender.jpg');
await kvadrat(await sharp(SRC).extract({ left: 0, top: botten, width: W, height: H - botten }).png().toBuffer(), '/tmp/fix/b6/hamtat/fiskekalender-2.jpg');
// Förhandsvisning av båda + bandet som klipptes bort
const p1 = await sharp('/tmp/fix/b6/hamtat/fiskekalender.jpg').resize(500, 500).png().toBuffer();
const p2 = await sharp('/tmp/fix/b6/hamtat/fiskekalender-2.jpg').resize(500, 500).png().toBuffer();
const band = await sharp(SRC).extract({ left: 0, top: topp, width: W, height: botten - topp }).resize(500).png().toBuffer();
const bm = await sharp(band).metadata();
writeFileSync('/tmp/fix/b6/fisk-prev.png', await sharp({ create: { width: 1000, height: 500 + bm.height + 10, channels: 3, background: '#ddd' } })
  .composite([{ input: p1, left: 0, top: 0 }, { input: p2, left: 500, top: 0 }, { input: band, left: 0, top: 510 }]).png().toBuffer());
console.log('klart: fiskekalender.jpg + fiskekalender-2.jpg');
