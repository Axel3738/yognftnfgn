// Faktakort (sharp + SVG): produktbilden + de låsta fakta som redan står i copyn.
// Inga siffror som inte är belagda. Kör: node temu/batch6/faktakort.mjs <utmapp>
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HÄR = path.dirname(fileURLToPath(import.meta.url));
const S = process.argv[2] || '/tmp/b6';
const F = 'DejaVu Sans, sans-serif';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
async function bygg({ bild, ut, rubrik, rader, W = 1200, H = 1000 }) {
  const box = { x: 40, y: 130, w: 480, h: 820 };
  const img = await sharp(bild).resize(box.w, box.h, { fit: 'contain', background: '#ffffff' }).png().toBuffer();
  const tx = box.x + box.w + 40; let y = 160;
  const linjer = rader.map((r) => { const s = `<text x="${tx}" y="${y}" font-family="${F}" font-size="34" font-weight="bold" fill="#1a1a1a">${esc(r.v)}</text><text x="${tx}" y="${y + 38}" font-family="${F}" font-size="24" fill="#555">${esc(r.l)}</text>`; y += 120; return s; }).join('');
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#ffffff"/>
    <text x="60" y="80" font-family="${F}" font-size="44" font-weight="bold" fill="#1a1a1a">${esc(rubrik)}</text>
    <line x1="60" y1="100" x2="${W - 60}" y2="100" stroke="#ddd" stroke-width="2"/>${linjer}</svg>`;
  await sharp(Buffer.from(svg)).composite([{ input: img, left: box.x, top: box.y }]).jpeg({ quality: 92 }).toFile(ut);
  console.log('skrev', ut);
}
const B = (f) => path.join(HÄR, 'bilder', f);
const T = {
  sv: {
    kattkoja: { rubrik: 'Isolerad utekattkoja', rader: [{ v: 'Står på ben', l: 'marken drar inte upp kyla' }, { v: 'Isolerade väggar', l: 'behåller kattens egen värme' }, { v: 'Tak i Oxford-tyg', l: 'skjuter ut över ingången' }, { v: 'Löstagbar dyna', l: 'går att ta ur och skaka' }, { v: 'Hopfällbar', l: 'tar ingen plats över sommaren' }, { v: 'Grå · Gräsgrön · Svart', l: 'tre färger' }] },
    solpanel: { rubrik: 'Solpanel till åtelkamera', rader: [{ v: 'Laddar där kameran hänger', l: 'inget batteribyte i området' }, { v: 'Ledat fäste', l: 'vinklas mot solen oavsett träd' }, { v: 'Väggfäste ingår', l: 'stam, stolpe eller vägg' }, { v: 'Byggd för att lämnas ute', l: 'sitter uppe hela säsongen' }] },
  },
  no: {
    kattkoja: { rubrik: 'Isolert utekattehus', rader: [{ v: 'Står på ben', l: 'bakken leder ikke kulde opp' }, { v: 'Isolerte vegger', l: 'holder på kattens egen varme' }, { v: 'Tak i Oxford-stoff', l: 'stikker ut over inngangen' }, { v: 'Avtakbar pute', l: 'kan tas ut og ristes' }, { v: 'Sammenleggbar', l: 'tar ingen plass om sommeren' }, { v: 'Grå · Gressgrønn · Svart', l: 'tre farger' }] },
    solpanel: { rubrik: 'Solpanel til viltkamera', rader: [{ v: 'Lader der kameraet henger', l: 'ingen batteribytte i området' }, { v: 'Leddet feste', l: 'vinkles mot solen uansett tre' }, { v: 'Veggfeste følger med', l: 'stamme, stolpe eller vegg' }, { v: 'Bygd for å bli stående ute', l: 'sitter oppe hele sesongen' }] },
  },
};
for (const sp of ['sv', 'no']) {
  await bygg({ bild: B('isolerad-utekattkoja-i-oxford-tyg-hopfal.jpg'), ut: `${S}/galleri/kattkoja-fakta-${sp}.jpg`, ...T[sp].kattkoja });
  await bygg({ bild: B('solpanel-till-atelkamera-viltkamera.jpg'), ut: `${S}/galleri/solpanel-fakta-${sp}.jpg`, ...T[sp].solpanel });
}
