// Lägger skarp vektortext (SVG) ovanpå en bas-bild och exporterar färdig 4:5-static.
import sharp from 'sharp';
import { CANVAS, COLOR, FONT, LOGO_WORDMARK } from './brand.mjs';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Enkel ordbrytning: dela texten i rader på max ~chars tecken.
function wrap(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

// position: 'top' | 'bottom' — var rubriken (och scrim) sitter.
function buildSvg({ headline, badge, footer, position = 'bottom' }) {
  const { w, h } = CANVAS;
  const headSize = 76, headLead = 88, maxChars = 20;
  const lines = wrap(headline, maxChars);
  const blockH = lines.length * headLead;

  // scrim-gradient för läsbarhet i den halva där texten sitter
  const scrim = position === 'bottom'
    ? `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="${COLOR.charcoal}" stop-opacity="0"/>
         <stop offset="0.55" stop-color="${COLOR.charcoal}" stop-opacity="0.82"/>
         <stop offset="1" stop-color="${COLOR.charcoal}" stop-opacity="0.96"/>
       </linearGradient>`
    : `<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="${COLOR.charcoal}" stop-opacity="0.96"/>
         <stop offset="0.45" stop-color="${COLOR.charcoal}" stop-opacity="0.82"/>
         <stop offset="1" stop-color="${COLOR.charcoal}" stop-opacity="0"/>
       </linearGradient>`;

  const headBaseY = position === 'bottom'
    ? h - 150 - blockH + headLead
    : 210;

  const headTspans = lines.map((l, i) =>
    `<tspan x="72" y="${headBaseY + i * headLead}">${esc(l)}</tspan>`).join('');

  const badgeSvg = badge ? (() => {
    const by = position === 'bottom' ? headBaseY - blockH - 40 : headBaseY - 96;
    const bw = Math.min(w - 144, 40 + badge.length * 17);
    return `<g>
      <rect x="72" y="${by - 44}" rx="26" ry="26" width="${bw}" height="52" fill="${COLOR.ember}"/>
      <text x="${72 + 26}" y="${by - 8}" font-family="${FONT.body}" font-weight="${FONT.weightBold}"
            font-size="24" letter-spacing="1.5" fill="${COLOR.charcoal}">${esc(badge.toUpperCase())}</text>
    </g>`;
  })() : '';

  const footerSvg = footer
    ? `<text x="72" y="${h - 60}" font-family="${FONT.body}" font-weight="${FONT.weightBold}"
             font-size="30" fill="${COLOR.ember}">${esc(footer)}</text>`
    : '';

  const wordmark = `<text x="${w - 72}" y="72" text-anchor="end" font-family="${FONT.body}"
      font-weight="${FONT.weightBold}" font-size="22" letter-spacing="3" fill="${COLOR.cream}"
      opacity="0.85">${esc(LOGO_WORDMARK)}</text>`;

  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>${scrim}</defs>
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#g)"/>
    ${wordmark}
    ${badgeSvg}
    <text font-family="${FONT.display}" font-weight="${FONT.weightHeavy}" font-size="${headSize}"
          fill="${COLOR.cream}">${headTspans}</text>
    ${footerSvg}
  </svg>`);
}

// baseInput: filväg eller Buffer på Higgsfield-bilden (eller null i dry-mode → charcoal-platta)
export async function compose({ baseInput, headline, badge, footer, position, out }) {
  const { w, h } = CANVAS;
  let base;
  if (baseInput) {
    base = sharp(baseInput).resize(w, h, { fit: 'cover', position: 'attention' });
  } else {
    base = sharp({ create: { width: w, height: h, channels: 3, background: COLOR.charcoal } });
  }
  const baseBuf = await base.png().toBuffer();
  const svg = buildSvg({ headline, badge, footer, position });
  await sharp(baseBuf)
    .composite([{ input: svg, top: 0, left: 0 }])
    .png()
    .toFile(out);
  return out;
}
