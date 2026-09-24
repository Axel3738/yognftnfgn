// Batch 11–13: hero/detalj-bilder ur CWD:s QC-foton (temu/qc/2026-09-18) — tillfälliga tills Axels
// skörd (BILDSKORD-BATCH11.md) ger riktiga galleribilder. Sharp, ingen AI. Antalsbadge på flerpack
// ritas med sharp-text (SE/NO), aldrig AI. Kör: node temu/batch11/bilder.mjs
import sharp from '../node_modules/sharp/dist/index.mjs';
import { FAKTA } from './fakta.mjs';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const UT = { se: '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/b11/ut', no: '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/b11/ut-no' };
const S = 1000, PAD = 36;
// beskärning i andelar av källbilden (left, top, width, height) där QC-bilden har skräp
const CROP = { vedklyvshuv: [0, 0.35, 1, 0.65], highlandcow: [0, 0, 1, 0.44], takachuv: [0, 0.07, 1, 0.9], lovsilar: [0, 0, 1, 0.955],
  adelstenskalender: [0.05, 0.02, 0.87, 0.92], cykelhallarskydd: [0, 0, 1, 0.985] };
// Beskärning av DETALJ-bilden (qc[1]) — husbilskalendern: tummen nere till vänster bort
const CROP2 = { husbilskalender: [0.1, 0, 0.9, 0.95] };
const BADGE = { se: (n) => [`${n} ST`, 'INGÅR'], no: (n) => [`${n} STK`, 'FØLGER MED'] };

async function ruta(fil, crop) {
  let img = sharp(fil); const m = await img.metadata();
  if (crop) img = img.extract({ left: Math.round(crop[0] * m.width), top: Math.round(crop[1] * m.height), width: Math.round(crop[2] * m.width), height: Math.round(crop[3] * m.height) });
  const inre = await img.resize(S - 2 * PAD, S - 2 * PAD, { fit: 'inside', withoutEnlargement: false, kernel: 'lanczos3' }).toBuffer();
  const mi = await sharp(inre).metadata();
  return sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } })
    .composite([{ input: inre, left: Math.round((S - mi.width) / 2), top: Math.round((S - mi.height) / 2) }]).jpeg({ quality: 92 }).toBuffer();
}
function badge(land, n) {
  const [r1, r2] = BADGE[land](n); const bw = land === 'se' ? 300 : 380, bh = 132;
  return Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg"><rect x="34" y="34" width="${bw}" height="${bh}" rx="14" fill="#1c1c1c" opacity="0.93"/>
    <text x="${34 + bw / 2}" y="94" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="60" fill="#ffffff">${r1}</text>
    <text x="${34 + bw / 2}" y="139" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="34" fill="#ffd24a" letter-spacing="2">${r2}</text></svg>`);
}
for (const [id, f] of Object.entries(FAKTA)) {
  if (f.status !== 'bygg' || !f.qc?.length) continue;
  const hero = await ruta(f.qc[0], CROP[id]);
  const detalj = f.qc[1] ? await ruta(f.qc[1], CROP2[id]) : null;
  for (const land of ['se', 'no']) {
    const d = path.join(UT[land], id); mkdirSync(d, { recursive: true });
    const h = f.flerpack ? await sharp(hero).composite([{ input: badge(land, f.flerpack), top: 0, left: 0 }]).jpeg({ quality: 92 }).toBuffer() : hero;
    await sharp(h).toFile(path.join(d, `${id}-hero.jpg`));
    if (detalj) await sharp(detalj).toFile(path.join(d, `${id}-detalj.jpg`));
  }
  console.log(`✔ ${id}${f.flerpack ? ' (badge ' + f.flerpack + ')' : ''}${detalj ? ' + detalj' : ''}`);
}
