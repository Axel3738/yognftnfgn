// Typografilager v2 — Poppins i stället för systemtypsnitt, med mjuka skuggor och djup.
// Scenerna kommer från kie.ai; texten sätts här så svenska diakriter alltid blir rätt.
import sharp from '/home/user/yognftnfgn/pipeline/node_modules/sharp/lib/index.js';

export const FONT = 'Poppins';
const AVG = 0.575;   // Poppins Bold är något smalare än DejaVu

export const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const bredd = (t, size) => t.length * size * AVG;

export function wrap(text, size, maxBredd, maxRader = 3) {
  const rader = []; let cur = '';
  for (const o of text.split(/\s+/)) {
    const test = cur ? cur + ' ' + o : o;
    if (bredd(test, size) <= maxBredd || !cur) cur = test;
    else { rader.push(cur); cur = o; }
  }
  if (cur) rader.push(cur);
  return rader.length <= maxRader ? rader : null;
}

export function passa(text, maxBredd, maxSize, maxRader = 2, minSize = 20) {
  for (let s = maxSize; s >= minSize; s--) {
    const r = wrap(text, s, maxBredd, maxRader);
    if (r) return { size: s, rader: r };
  }
  return { size: minSize, rader: wrap(text, minSize, maxBredd, 99) || [text] };
}

// Mjuk skugga — det som skiljer "pålagd text" från "designad text"
export const DEFS = `<defs>
  <filter id="mjuk" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="3" stdDeviation="7" flood-color="#000000" flood-opacity="0.18"/>
  </filter>
  <filter id="pill" x="-30%" y="-40%" width="160%" height="200%">
    <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.26"/>
  </filter>
</defs>`;

// "|" i texten tvingar radbrytning där — så meningar bryts vid punkt, inte mitt i.
function fastRader(text, maxBredd, maxSize, minSize = 20) {
  const delar = text.split('|').map(d => d.trim());
  for (let s = maxSize; s >= minSize; s--) {
    if (delar.every(d => bredd(d, s) <= maxBredd)) return { size: s, rader: delar };
  }
  return { size: minSize, rader: delar };
}

export function rubrik({ text, x, y, maxBredd, maxSize, maxRader = 2, fill = '#14100E',
                         anchor = 'middle', radAvstand = 1.12, skugga = false, spacing = -0.5 }) {
  const { size, rader } = text.includes('|')
    ? fastRader(text, maxBredd, maxSize)
    : passa(text, maxBredd, maxSize, maxRader);
  const filter = skugga ? ' filter="url(#mjuk)"' : '';
  const svg = rader.map((r, i) =>
    `<text x="${x}" y="${y + i * size * radAvstand}" text-anchor="${anchor}" font-family="${FONT}" ` +
    `font-weight="700" font-size="${size}" letter-spacing="${spacing}" fill="${fill}"${filter}>${esc(r)}</text>`
  ).join('\n');
  return { svg, size, hojd: rader.length * size * radAvstand };
}

// Erbjudandebadge som pill, med skugga så den lyfter från bakgrunden
export function pill({ cx, cy, bredd: b, hojd: h, text, fill = '#B01F1F', textFill = '#fff', maxSize = 54 }) {
  const { size, rader } = passa(text, b - 72, maxSize, 1);
  return `<rect x="${cx - b / 2}" y="${cy - h / 2}" width="${b}" height="${h}" rx="${h / 2}" ` +
    `fill="${fill}" filter="url(#pill)"/>` +
    `<text x="${cx}" y="${cy + size * 0.34}" text-anchor="middle" font-family="${FONT}" font-weight="700" ` +
    `font-size="${size}" letter-spacing="0.5" fill="${textFill}">${esc(rader[0])}</text>`;
}

// Rund stämpel, tre rader — mittenraden är den stora
export function stampel({ cx, cy, r, rader, fill = '#B01F1F', textFill = '#fff', bas = 58 }) {
  const inner = r * 1.5;
  const storlekar = rader.map(rad => Math.min(bas, Math.floor(inner / (rad.length * AVG))));
  const total = storlekar.reduce((a, s) => a + s * 1.18, 0);
  let y = cy - total / 2 + storlekar[0] * 0.9;
  const txt = rader.map((rad, i) => {
    const t = `<text x="${cx}" y="${y}" text-anchor="middle" font-family="${FONT}" font-weight="700" ` +
      `font-size="${storlekar[i]}" letter-spacing="0.5" fill="${textFill}">${esc(rad)}</text>`;
    y += storlekar[i] * 1.18;
    return t;
  }).join('\n');
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" filter="url(#pill)"/>\n${txt}`;
}

export const doc = (w, h, inner) =>
  Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${DEFS}${inner}</svg>`);

export { sharp };
