#!/usr/bin/env node
// Bygger Bruces vecko-SOP som A4-PDF ur markdown-filen bredvid (Axels beställning
// 2026-10-03: "en liten SOP pdf väldigt simpel om vad han ska göra för att
// utvärdera sig själv varje vecka"). Samma Chromium-väg som
// products/matstrumpor/ugc/pdf/bygg.mjs: playwright ur /opt/node-tools när repot
// saknar paketet, Chromium i /opt/pw-browsers. Ingen markdown-modul i repot, så
// en liten egen omvandlare räcker: rubriker, listor, fetstil, stycken, citat.
//
//   node matstrumpor/sop/bygg.mjs                      # BRUCE-WEEKLY-SELF-REVIEW.md → .pdf
//   node matstrumpor/sop/bygg.mjs <fil.md> [--html]    # valfri fil; --html lämnar kvar HTML:en bredvid
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const HAR = dirname(fileURLToPath(import.meta.url));
const arg = process.argv.slice(2);
const mdFil = arg.find((a) => !a.startsWith('--')) ?? join(HAR, 'BRUCE-WEEKLY-SELF-REVIEW.md');
const behallHtml = arg.includes('--html');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\[ \]/g, '<span class="box"></span>');

/** Markdown (det lilla vi använder) → HTML-kropp. */
export function tillHtml(md) {
  const rader = md.replace(/\r/g, '').split('\n');
  const ut = [];
  let lista = null; // 'ul' | 'ol'
  let stycke = [];
  const stangStycke = () => { if (stycke.length) { ut.push(`<p>${stycke.map(inline).join('<br>')}</p>`); stycke = []; } };
  const stangLista = () => { if (lista) { ut.push(`</${lista}>`); lista = null; } };
  for (const rad of rader) {
    const h = rad.match(/^(#{1,4})\s+(.*)$/);
    if (h) { stangStycke(); stangLista(); ut.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); continue; }
    const li = rad.match(/^\s*(?:[-*]|(\d+)[.)])\s+(.*)$/);
    if (li) {
      stangStycke();
      const typ = li[1] ? 'ol' : 'ul';
      if (lista !== typ) { stangLista(); ut.push(`<${typ}>`); lista = typ; }
      ut.push(`<li>${inline(li[2])}</li>`);
      continue;
    }
    if (/^\s*>\s?/.test(rad)) { stangStycke(); stangLista(); ut.push(`<blockquote>${inline(rad.replace(/^\s*>\s?/, ''))}</blockquote>`); continue; }
    if (/^\s*---+\s*$/.test(rad)) { stangStycke(); stangLista(); ut.push('<hr>'); continue; }
    if (!rad.trim()) { stangStycke(); stangLista(); continue; }
    stangLista();
    stycke.push(rad.trim());
  }
  stangStycke(); stangLista();
  return ut.join('\n');
}

const CSS = `
  @page { size: A4; margin: 11mm 15mm 10mm 15mm; }
  * { box-sizing: border-box; }
  body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1a1f26; font-size: 10.3pt; line-height: 1.34; margin: 0; }
  h1 { font-size: 20pt; margin: 0 0 3pt; letter-spacing: -0.2pt; }
  h2 { font-size: 12pt; margin: 8pt 0 3pt; padding-bottom: 2pt; border-bottom: 1.5pt solid #dd821d; }
  h3 { font-size: 11.5pt; margin: 8pt 0 3pt; }
  p { margin: 0 0 5.5pt; }
  p:first-of-type { color: #5b6570; }
  ul, ol { margin: 0 0 6pt; padding-left: 19pt; }
  li { margin: 0 0 3pt; }
  li::marker { color: #dd821d; font-weight: 700; }
  strong { font-weight: 700; }
  code { font-family: Menlo, Consolas, monospace; font-size: 10.5pt; background: #f3f1ec; padding: 0 3pt; border-radius: 3pt; }
  blockquote { margin: 6pt 0 8pt; padding: 6pt 10pt; border-left: 3pt solid #dd821d; background: #fff7ee; }
  hr { border: 0; border-top: 1pt solid #d5dad2; margin: 10pt 0; }
  .box { display: inline-block; width: 11pt; height: 11pt; border: 1.2pt solid #1a1f26; border-radius: 2pt; vertical-align: -2pt; margin-right: 4pt; }
  .fot { margin-top: 8pt; font-size: 9pt; color: #5b6570; border-top: 1pt solid #d5dad2; padding-top: 5pt; }
`;

const md = readFileSync(mdFil, 'utf8');
const titel = (md.match(/^#\s+(.*)$/m) ?? [, 'SOP'])[1];
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(titel)}</title><style>${CSS}</style></head><body>${tillHtml(md)}<div class="fot">Matstrumpor · ${esc(basename(mdFil))} · built ${new Date().toISOString().slice(0, 10)}</div></body></html>`;
const pdfFil = mdFil.replace(/\.md$/i, '.pdf');
if (behallHtml) writeFileSync(mdFil.replace(/\.md$/i, '.html'), html);

const { chromium } = await import('playwright').catch(() => import('/opt/node-tools/node_modules/playwright/index.mjs'));
const b = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
const p = await b.newPage();
await p.setContent(html, { waitUntil: 'load' });
await p.emulateMedia({ media: 'print', colorScheme: 'light' });
await p.pdf({ path: pdfFil, format: 'A4', printBackground: true, preferCSSPageSize: true });
await b.close();
console.log('pdf', pdfFil);
