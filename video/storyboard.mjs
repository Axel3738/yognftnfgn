// Bygger de granskningsbara artefakterna för ett video-koncept UTAN att generera något:
//   - en läsbar storyboard (markdown)
//   - en brännbar caption-fil (.ass)
//   - shot-prompts (json) att mata till Higgsfield
// Det här är kärnan i "creative strat"-steget: vi granskar kreativet innan vi spenderar.
import { VIDEO, CAPTION, COLOR, LOGO_WORDMARK, hexToAss } from './brand.mjs';

const pad = (n) => String(Math.floor(n)).padStart(2, '0');
// sekunder → ASS-tid H:MM:SS.cs
function assTime(sec) {
  const cs = Math.round((sec - Math.floor(sec)) * 100);
  const s = Math.floor(sec) % 60;
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600);
  return `${h}:${pad(m)}:${pad(s)}.${String(cs).padStart(2, '0')}`;
}

// Totala längden = sista shotens slut (endcard läggs till separat i compose).
export function totalDuration(concept) {
  return concept.shots.reduce((max, s) => Math.max(max, s.endSec), 0);
}

// .ass-undertext med brand-stil. Captions kommer från shots[].caption + timing.
export function buildAss(concept) {
  const primary = hexToAss(COLOR.cream);
  const outline = hexToAss(COLOR.charcoal);
  const cues = concept.shots.filter((s) => s.caption);
  const dialogue = cues.map((s) =>
    `Dialogue: 0,${assTime(s.startSec)},${assTime(s.endSec)},Main,,0,0,0,,${s.caption.replace(/\n/g, '\\N')}`
  ).join('\n');

  return `[Script Info]
Title: ${concept.name}
ScriptType: v4.00+
PlayResX: ${VIDEO.w}
PlayResY: ${VIDEO.h}
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV
Style: Main,${CAPTION.fontName},${CAPTION.fontSize},${primary},${outline},&H64000000,1,0,1,${CAPTION.outline},${CAPTION.shadow},2,80,80,${CAPTION.marginV}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
${dialogue}
`;
}

// Läsbar storyboard som du granskar innan generering.
export function buildStoryboard(concept) {
  const dur = totalDuration(concept);
  const rows = concept.shots.map((s) =>
    `| ${s.id} | ${s.startSec}–${s.endSec}s | ${s.beat || ''} | ${(s.caption || '—').replace(/\n/g, ' ')} | ${s.motion || ''} |`
  ).join('\n');

  const shotPrompts = concept.shots.map((s) =>
    `### ${s.id} · ${s.startSec}–${s.endSec}s${s.beat ? ` · ${s.beat}` : ''}\n` +
    `**Prompt:** ${s.prompt}\n\n` +
    (s.motion ? `**Rörelse:** ${s.motion}\n\n` : '') +
    (s.caption ? `**Caption:** "${s.caption.replace(/\n/g, ' ')}"\n` : '')
  ).join('\n');

  return `# Storyboard — ${concept.name}

> ${concept.premise}

- **Källa:** ${concept.source || '—'}
- **Vinkel:** ${concept.angle || '—'}
- **Format:** ${VIDEO.w}×${VIDEO.h} (9:16) · ${dur}s + endcard · ${VIDEO.fps}fps
- **Endcard:** ${concept.endcard ? `${concept.endcard.headline} — ${concept.endcard.sub} — [${concept.endcard.cta}]` : '—'}

## Timeline
| Shot | Tid | Beat | Caption | Rörelse |
|------|-----|------|---------|---------|
${rows}

## Shot-prompts (till Higgsfield)
${shotPrompts}
`;
}

// Endcard som ett enkelt fyllt kort (byggs till still av compose, sen till klipp).
export function endcardSvg(concept) {
  const { w, h } = VIDEO;
  const ec = concept.endcard || {};
  const cx = w / 2;
  return Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${COLOR.charcoal}"/>
    <text x="${cx}" y="140" text-anchor="middle" font-family="DejaVu Sans" font-weight="700"
          font-size="26" letter-spacing="4" fill="${COLOR.cream}" opacity="0.85">${LOGO_WORDMARK}</text>
    <text x="${cx}" y="${h / 2 - 40}" text-anchor="middle" font-family="DejaVu Sans" font-weight="800"
          font-size="92" fill="${COLOR.cream}">${ec.headline || 'Mastern'}</text>
    <text x="${cx}" y="${h / 2 + 60}" text-anchor="middle" font-family="DejaVu Sans" font-weight="700"
          font-size="44" fill="${COLOR.smoke}">${ec.sub || ''}</text>
    <rect x="${cx - 240}" y="${h / 2 + 140}" rx="44" ry="44" width="480" height="112" fill="${COLOR.ember}"/>
    <text x="${cx}" y="${h / 2 + 214}" text-anchor="middle" font-family="DejaVu Sans" font-weight="800"
          font-size="48" fill="${COLOR.charcoal}">${ec.cta || 'Handla nu'}</text>
  </svg>`);
}
