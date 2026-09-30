// Scratch: måttbild för golfkalendern — asken ur amazon-04 friläggs på vitt, måtten ritas med sharp (bara cm).
import { createRequire } from 'node:module';
const sharp = createRequire('/home/user/yognftnfgn/temu/kalendrar/bild.mjs')('sharp');
const S = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad/advent';
const src = `${S}/kallor/golf/amazon-04.jpg`;
// askens hörn i källbilden (rygg + framsida)
const P = [[253, 374], [326, 371], [1336, 401], [1336, 1179], [326, 1214], [253, 1209]];
const bx = 253, by = 371, bw = 1336 - 253, bh = 1214 - 371;
const poly = P.map(([x, y]) => `${x - bx},${y - by}`).join(' ');
const mask = Buffer.from(`<svg width="${bw}" height="${bh}"><polygon points="${poly}" fill="#fff"/></svg>`);
const k = 0.9;                                    // askens skala på duken
const ask = await sharp(await sharp(src).extract({ left: bx, top: by, width: bw, height: bh }).ensureAlpha()
  .composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()).resize(Math.round(bw * k)).png().toBuffer();
const C = 1500, ox = 140, oy = 300;              // askens placering på duken
const X = (x) => Math.round((x - bx) * k + ox), Y = (y) => Math.round((y - by) * k + oy);
const ink = '#2b2b2b', f = 'DejaVu Sans', fs = 58;
const lineY = Y(1214) + 75;                       // bredd + djup under asken
const hx = X(1336) + 65;                          // höjd till höger
const tick = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="4"/>`;
const pil = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ink}" stroke-width="4" marker-start="url(#a)" marker-end="url(#a)"/>`;
const svg = `<svg width="${C}" height="${C}" xmlns="http://www.w3.org/2000/svg">
<defs><marker id="a" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${ink}"/></marker>
<filter id="b"><feGaussianBlur stdDeviation="9"/></filter></defs>
<polygon points="${X(256)},${Y(1200)} ${X(1333)},${Y(1168)} ${X(1333)},${Y(1179) + 14} ${X(256)},${Y(1209) + 14}" fill="#000" opacity="0.28" filter="url(#b)"/>
${tick(X(253), lineY - 22, X(253), lineY + 22)}${tick(X(326), lineY - 22, X(326), lineY + 22)}${tick(X(1336), lineY - 22, X(1336), lineY + 22)}
${pil(X(326) + 6, lineY, X(1336) - 6, lineY)}
<line x1="${X(253) + 4}" y1="${lineY}" x2="${X(326) - 4}" y2="${lineY}" stroke="${ink}" stroke-width="4"/>
<text x="${(X(326) + X(1336)) / 2}" y="${lineY + 80}" font-family="${f}" font-weight="bold" font-size="${fs}" fill="${ink}" text-anchor="middle">30 cm</text>
<text x="${(X(253) + X(326)) / 2}" y="${lineY + 80}" font-family="${f}" font-weight="bold" font-size="${fs}" fill="${ink}" text-anchor="middle">6 cm</text>
${tick(hx - 22, Y(401), hx + 22, Y(401))}${tick(hx - 22, Y(1179), hx + 22, Y(1179))}
${pil(hx, Y(401) + 6, hx, Y(1179) - 6)}
<text x="${hx + 34}" y="${(Y(401) + Y(1179)) / 2 + 20}" font-family="${f}" font-weight="bold" font-size="${fs}" fill="${ink}">28 cm</text>
</svg>`;
await sharp({ create: { width: C, height: C, channels: 3, background: '#ffffff' } })
  .composite([{ input: Buffer.from(svg), left: 0, top: 0 }, { input: ask, left: ox, top: oy }])
  .jpeg({ quality: 90 }).toFile(`${S}/galleri/golf/03-matt.jpg`);
console.log('✔ 03-matt.jpg', hx + 34 + 190, lineY + 80);
