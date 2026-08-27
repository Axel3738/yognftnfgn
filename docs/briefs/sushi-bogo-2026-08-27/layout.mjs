// Delad layout-modul för sushistrumpe-annonserna.
// Text renderas som skarp SVG-vektor ovanpå bilderna (husmetoden från pipeline/).
import sharp from '/home/user/yognftnfgn/pipeline/node_modules/sharp/lib/index.js';

export const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// DejaVu Sans Bold: ~0.60 × font-size i snittbredd för svensk blandtext.
const AVG = 0.60;
export const textWidth = (text, size) => text.length * size * AVG;

// Bryter text till max `maxRader` rader som var för sig får plats inom maxBredd vid given size.
export function wrap(text, size, maxBredd, maxRader = 3) {
  const ord = text.split(/\s+/);
  const rader = [];
  let cur = '';
  for (const o of ord) {
    const test = cur ? cur + ' ' + o : o;
    if (textWidth(test, size) <= maxBredd || !cur) cur = test;
    else { rader.push(cur); cur = o; }
  }
  if (cur) rader.push(cur);
  return rader.length <= maxRader ? rader : null;
}

// Hittar största font-size där texten får plats på högst maxRader rader.
export function passa(text, maxBredd, maxSize, maxRader = 2, minSize = 24) {
  for (let size = maxSize; size >= minSize; size -= 1) {
    const rader = wrap(text, size, maxBredd, maxRader);
    if (rader) return { size, rader };
  }
  return { size: minSize, rader: wrap(text, minSize, maxBredd, 99) || [text] };
}

// Ett textblock centrerat kring x, med första radens baslinje på y.
export function textBlock({ text, x, y, maxBredd, maxSize, maxRader = 2, fill = '#111111',
                            weight = 'bold', anchor = 'middle', radAvstand = 1.14, font = 'DejaVu Sans' }) {
  const { size, rader } = passa(text, maxBredd, maxSize, maxRader);
  const linjer = rader.map((r, i) =>
    `<text x="${x}" y="${y + i * size * radAvstand}" text-anchor="${anchor}" font-family="${font}" ` +
    `font-weight="${weight}" font-size="${size}" fill="${fill}">${esc(r)}</text>`).join('\n');
  return { svg: linjer, size, antalRader: rader.length, hojd: rader.length * size * radAvstand };
}

// Rund "stämpel"-badge (ersätter originalens hjärt-/rea-badge — hjärta = tema, och tema är bannlyst).
export function badge({ cx, cy, r, rader, fill = '#D42A2A', textFill = '#ffffff', maxSize = 46 }) {
  const inner = r * 1.55;
  let y = cy - (rader.length - 1) * (maxSize * 0.58);
  const linjer = rader.map((rad, i) => {
    const size = i === 0 ? maxSize : Math.round(maxSize * 0.52);
    const t = `<text x="${cx}" y="${y}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" ` +
              `font-size="${Math.min(size, Math.floor(inner / (rad.length * AVG)))}" fill="${textFill}">${esc(rad)}</text>`;
    y += size * 1.2;
    return t;
  }).join('\n');
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>\n${linjer}`;
}

// Bred pillerformad banner (som "50% RABATT"-bandet i referensannonsen).
export function pillBanner({ cx, cy, bredd, hojd, text, fill = '#D42A2A', textFill = '#ffffff', maxSize = 60 }) {
  const { size, rader } = passa(text, bredd - 60, maxSize, 1);
  return `<rect x="${cx - bredd / 2}" y="${cy - hojd / 2}" width="${bredd}" height="${hojd}" rx="${hojd / 2}" fill="${fill}"/>\n` +
    `<text x="${cx}" y="${cy + size * 0.35}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" ` +
    `font-size="${size}" fill="${textFill}">${esc(rader[0])}</text>`;
}

export { sharp };
