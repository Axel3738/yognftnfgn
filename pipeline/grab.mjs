import sharp from 'sharp';
import { writeFile, mkdir } from 'node:fs/promises';
await mkdir('assets', { recursive: true });
const B = 'https://cdn.shopify.com/s/files/1/0947/0174/8548/files/';
const urls = {
  a: B + 'hf_20260423_053932_274855d0-6200-477e-b94d-9253bb51021a.png?v=1776924348',
  b: B + 'hf_20260423_053920_89553003-6fbe-4990-ac4a-75b8cfe135b2.png?v=1776924358',
  c: B + 'hf_20260423_062233_5b01b9d2-7444-4824-b577-a781dd3f0193.png?v=1776925823',
  d: B + 'WhatsAppImage2026-04-13at10.08.29.jpg?v=1776862220',
  e: B + 'CharBreaker_Accessories_3_4.jpg?v=1779438702',
  f: B + 'hf_20260511_034602_3ce2d7ec-70ac-47a7-a49d-d5a7e53f8c79.png?v=1778471437',
};
const tiles = [];
const keys = [];
for (const [k, u] of Object.entries(urls)) {
  try {
    const r = await fetch(u);
    if (!r.ok) { console.log('FAIL', k, r.status); continue; }
    const b = Buffer.from(await r.arrayBuffer());
    await writeFile(`assets/src_${k}.png`, b);
    tiles.push(await sharp(b).resize(360, 360, { fit: 'cover' }).png().toBuffer());
    keys.push(k);
    console.log('OK', k, b.length);
  } catch (e) { console.log('ERR', k, e.message.slice(0, 50)); }
}
const W = 360 * 3, H = 360 * Math.ceil(tiles.length / 3);
const labels = keys.map((k, i) =>
  `<text x="${(i % 3) * 360 + 14}" y="${Math.floor(i / 3) * 360 + 40}" font-family="sans-serif" font-size="34" font-weight="800" fill="#FF2D2D" stroke="#000" stroke-width="1">${k}</text>`).join('');
const base = await sharp({ create: { width: W, height: H, channels: 3, background: '#111' } }).png().toBuffer();
const comp = tiles.map((t, i) => ({ input: t, left: (i % 3) * 360, top: Math.floor(i / 3) * 360 }));
comp.push({ input: Buffer.from(`<svg width="${W}" height="${H}">${labels}</svg>`), left: 0, top: 0 });
await sharp(base).composite(comp).png().toFile('output/kontaktkarta.png');
console.log('kontaktkarta klar');
