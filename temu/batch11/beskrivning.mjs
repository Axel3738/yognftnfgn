// Beskrivningens struktur (CLAUDE.md, Axels regel 2026-08-29), delad av skapa.mjs och galleri-bygg.mjs:
//   problem → GIF/bild A → lösning → bild B → funktioner → bild C → (varning) → garanti
import { GARANTI4, RUBRIKER4 } from '../utrullning/texter4.mjs';
export const SPRÅK = { se: 'sv', no: 'no' };
export const esc = (s) => String(s).replace(/&(?!(amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const bildHtml = (m, t) => m?.url ? `<p><img src="${m.url}" alt="${esc(m.alt || t.titel)}" loading="lazy" style="max-width:100%;height:auto${m.gif ? ';border-radius:8px' : ''}"></p>` : '';
/** t = copy (sv/no), bilder = { a, b, c } där varje är { url, alt, gif? } eller null, land = 'se'|'no' */
export function beskrivning(t, bilder, land) {
  const r = RUBRIKER4[SPRÅK[land]];
  return `<h3>${esc(t.problemH)}</h3><p>${esc(t.problemP)}</p>` + bildHtml(bilder.a, t) +
    `<h3>${esc(t.losningH)}</h3><p>${esc(t.losningP)}</p>` + bildHtml(bilder.b, t) +
    `<h3>${r.funktioner}</h3><ul>\n` + t.bullets.map((x) => `<li>${x}</li>`).join('\n') + `\n</ul>` + bildHtml(bilder.c, t) +
    (t.varning ? `<p><em>${esc(t.varning)}</em></p>` : '') +
    `<h3>${r.garanti}</h3><p>${GARANTI4[SPRÅK[land]]}</p>`;
}
