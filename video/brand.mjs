// Brand kit för video (9:16 Reels). Återanvänder färger/typsnitt från static-pipelinen
// så det är EN sanning. Ändra färger i ../pipeline/brand.mjs → slår igenom här också.
import { COLOR, FONT, LOGO_WORDMARK } from '../pipeline/brand.mjs';

export { COLOR, FONT, LOGO_WORDMARK };

export const VIDEO = {
  w: 1080,
  h: 1920,            // 9:16 Reels/Stories
  fps: 30,
  safeTop: 0.12,      // håll captions/endcard-text innanför mittersta 76 %
  safeBottom: 0.12,
};

// Caption-stil (bränns in som .ass-undertext med ffmpeg).
export const CAPTION = {
  fontName: 'DejaVu Sans',   // systemfont; byt mot brandfont om .ttf finns installerad
  fontSize: 64,
  marginV: 320,              // avstånd från botten (px) — sitter i nedre tredjedelen, ovanför UI
  outline: 4,
  shadow: 0,
};

// #RRGGBB → ASS-färg &HAABBGGRR (alpha 00 = ogenomskinlig).
export function hexToAss(hex, alpha = 0) {
  const h = hex.replace('#', '');
  const r = h.slice(0, 2), g = h.slice(2, 4), b = h.slice(4, 6);
  const a = alpha.toString(16).padStart(2, '0').toUpperCase();
  return `&H${a}${b}${g}${r}`.toUpperCase();
}
