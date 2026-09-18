// Storlekstabell till taköverdraget — de nio längderna som skarp vektortext.
// Ingen AI: siffrorna kommer ur fakta.mjs och kan därför inte hallucineras.
//   node temu/takoverdrag/bilder-storlekstabell.mjs        # svenska → tak-storlekar.jpg
//   node temu/takoverdrag/bilder-storlekstabell.mjs fi     # finska  → tak-storlekar-fi.jpg
// Den finska texten läses ur copy-fi.json (nyckeln `tabell`, skriven av copy-subagenten),
// så bilden och sidan aldrig säger olika saker.
import sharp from '../node_modules/sharp/dist/index.mjs';
import { STORLEKAR } from './fakta.mjs';
import { mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const UT = process.env.TAK_UT || '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/tak';
mkdirSync(UT, { recursive: true });
const sprak = process.argv[2] === 'fi' ? 'fi' : 'sv';
const TEXT = {
  sv: { rubrik: 'NIO LÄNGDER', underrubrik: 'Alla är 3 meter breda – välj efter takets längd',
        fot1: '210D SILVERBELAGD OXFORDVÄV', fot2: 'Remmar på fyra sidor · två förstärkta 10,5 m-remmar ingår' },
  fi: JSON.parse(readFileSync(path.join(HÄR, 'copy-fi.json'), 'utf8')).tabell,
}[sprak];
for (const k of ['rubrik', 'underrubrik', 'fot1', 'fot2']) if (!TEXT?.[k]) throw new Error(`tabelltext saknas: ${sprak}.${k}`);

const S = 1600, BLÅ = '#0b2a3d', GRÅ = '#5b6b76', LJUS = '#f4f6f7';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

const bandH = 190, fotH = 120;
const radH = Math.floor((S - bandH - fotH) / STORLEKAR.length);   // 9 rader
const svg = [
  `<rect x="0" y="0" width="${S}" height="${S}" fill="#ffffff"/>`,
  `<rect x="0" y="0" width="${S}" height="${bandH}" fill="${BLÅ}"/>`,
  `<text x="${S / 2}" y="86" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="54" fill="#ffffff" letter-spacing="3">${esc(TEXT.rubrik)}</text>`,
  `<text x="${S / 2}" y="140" text-anchor="middle" font-family="DejaVu Sans" font-size="32" fill="#c8d4dc">${esc(TEXT.underrubrik)}</text>`,
];
for (let i = 0; i < STORLEKAR.length; i++) {
  const s = STORLEKAR[i], y = bandH + i * radH;
  if (i % 2 === 0) svg.push(`<rect x="0" y="${y}" width="${S}" height="${radH}" fill="${LJUS}"/>`);
  // måttstock som visar längden i skala mot den längsta
  const maxL = STORLEKAR[STORLEKAR.length - 1].langd_m;
  const stapelMax = 700, w = Math.round((s.langd_m / maxL) * stapelMax);
  // Alla staplar har samma färg. En markerad storlek skulle läsas som "rekommenderad"
  // av kunden, och det är inte vad `offererad` betyder (det är vår inköpsstatus).
  svg.push(`<rect x="620" y="${y + radH / 2 - 17}" width="${w}" height="34" rx="6" fill="#7d97a8"/>`);
  svg.push(`<text x="96" y="${y + radH / 2 + 17}" font-family="DejaVu Sans" font-weight="bold" font-size="46" fill="${BLÅ}">${esc(s.namn)}</text>`);
  svg.push(`<text x="${630 + w + 18}" y="${y + radH / 2 + 13}" font-family="DejaVu Sans" font-size="30" fill="${GRÅ}">${esc(String(s.yta_m2).replace('.', ','))} m²</text>`);
}
svg.push(`<rect x="0" y="${S - fotH}" width="${S}" height="${fotH}" fill="${BLÅ}"/>`);
svg.push(`<text x="${S / 2}" y="${S - fotH + 52}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="36" fill="#ffffff">${esc(TEXT.fot1)}</text>`);
svg.push(`<text x="${S / 2}" y="${S - fotH + 96}" text-anchor="middle" font-family="DejaVu Sans" font-size="28" fill="#c8d4dc">${esc(TEXT.fot2)}</text>`);

const fil = `${UT}/tak-storlekar${sprak === 'fi' ? '-fi' : ''}.jpg`;
await sharp(Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`))
  .jpeg({ quality: 93 }).toFile(fil);
console.log(`✔ ${fil} — ${STORLEKAR.length} längder (${sprak})`);
