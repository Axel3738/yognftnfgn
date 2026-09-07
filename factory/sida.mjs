// Återanvändbar mall för one-product-sidan.
//
// All text kommer ur produktfilen — inget hittas på (regel 3 i CLAUDE.md).
// Ad copy skrivs fortfarande i de befintliga annonsflödena; det här är
// produktsidans struktur.
//
// Strukturen är fast (Axels beslut 2026-09-05) och speglar tema-sektionerna:
//   hero (temats main-product) → 1 problem/emotion → 2 gif → 3 lösningen →
//   4 gif/bild → 5 funktioner → 6 bild → 7 garanti → Judge.me-widget → FAQ.
// Recensioner renderas ALDRIG här — de ägs av Judge.me. Förhandsvisningen
// markerar widgetens plats.
//
// Stilen speglar CRO-temats designtokens (ms-cro.css) så förhandsvisningen
// ser ut som riktiga sidan, inte som en skiss.
//
// Två utdata:
//   byggSidaHtml(p)        — innehållssektionerna för lokal granskning
//   byggForhandsvisning(p) — komplett fristående HTML-sida inkl. sticky ATC

export function eskapa(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function formatPris(belopp, valuta) {
  const symboler = { SEK: 'kr', NOK: 'kr', DKK: 'kr', EUR: '€', USD: '$', GBP: '£' };
  const symbol = symboler[valuta] ?? valuta;
  const tal = Number.isInteger(belopp) ? String(belopp) : belopp.toFixed(2);
  return symbol === 'kr' ? `${tal} kr` : `${symbol}${tal}`;
}

import { hamtaTokens } from './branding.mjs';

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

// --- Sektionerna (ordningen på sidan) ---

// huvudvinkel är ett INTERNT fält och bär sin källhänvisning (regeln om att ett
// koncept aldrig får födas ur tomma intet). Den texten får aldrig ut till kund.
// Sidan använder vinkel.underrubrik; saknas den strippas källparentesen bort.
export function kundUnderrubrik(vinkel = {}) {
  if (typeof vinkel.underrubrik === 'string' && vinkel.underrubrik.trim() !== '') {
    return vinkel.underrubrik.trim();
  }
  return String(vinkel.huvudvinkel ?? '')
    .replace(/\s*\((?:källa|source|ref)\b[^)]*\)\s*/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Hero = temats main-product: bild, titel, pris, köpknapp, trustrad.
function hero(p) {
  const pris = formatPris(p.ekonomi.pris, p.ekonomi.valuta);
  const jamfor =
    p.ekonomi.jamforpris > 0
      ? `<s class="opf-jamfor">${eskapa(formatPris(p.ekonomi.jamforpris, p.ekonomi.valuta))}</s> `
      : '';
  const bild = lista(p.media?.bilder)[0];
  const trust = [lista(p.garantier)[0], ...lista(p.fraktrader).slice(0, 2)].filter(Boolean);
  const bundle = text(p.offer?.bundle);
  return `<section class="opf-hero" id="opf-hero">
  ${bild ? `<img src="${eskapa(bild)}" alt="${eskapa(p.produkt.namn)}" loading="eager">` : ''}
  <p class="opf-brand">${eskapa(p.brand?.namn ?? '')}</p>
  <h1>${eskapa(p.produkt.namn)}</h1>
  <p class="opf-vinkel">${eskapa(kundUnderrubrik(p.vinkel))}</p>
  <p class="opf-pris">${jamfor}<strong>${eskapa(pris)}</strong></p>
  ${bundle ? `<p class="opf-paket">${eskapa(bundle)}</p>` : ''}
  <a class="opf-cta" href="#opf-kop">Köp nu</a>
  ${
    trust.length > 0
      ? `<div class="opf-trust">${trust.map((t) => `<span>✓ ${eskapa(t)}</span>`).join('')}</div>`
      : ''
  }
</section>`;
}

// Block 1 + 2: emotion/problem och gif.
function problem(p) {
  const b = p.beskrivning ?? {};
  if (!text(b.problem_rubrik) && !text(b.problem_text)) return '';
  const gif = text(p.media?.gif_problem);
  return `<section class="opf-problem" id="opf-problem">
  <span class="opf-eyebrow">Känner du igen det?</span>
  ${text(b.problem_rubrik) ? `<h2>${eskapa(b.problem_rubrik)}</h2>` : ''}
  ${text(b.problem_text) ? `<p class="opf-lede">${eskapa(b.problem_text)}</p>` : ''}
  ${gif ? `<img class="opf-media" src="${eskapa(gif)}" alt="${eskapa(p.produkt.namn)}" loading="lazy">` : ''}
</section>`;
}

// Block 3 + 4: lösningen och gif/bild.
function losning(p) {
  const b = p.beskrivning ?? {};
  if (!text(b.losning_rubrik) && !text(b.losning_text)) return '';
  const media = text(p.media?.media_losning);
  return `<section class="opf-losning" id="opf-losning">
  <span class="opf-eyebrow">Lösningen</span>
  ${text(b.losning_rubrik) ? `<h2>${eskapa(b.losning_rubrik)}</h2>` : ''}
  ${text(b.losning_text) ? `<p class="opf-lede">${eskapa(b.losning_text)}</p>` : ''}
  ${media ? `<img class="opf-media" src="${eskapa(media)}" alt="${eskapa(p.produkt.namn)}" loading="lazy">` : ''}
</section>`;
}

// Block 5: benefits som kort, features som lista.
function funktioner(p) {
  const benefits = lista(p.benefits);
  const features = lista(p.features);
  if (benefits.length === 0 && features.length === 0) return '';
  const kort = benefits
    .map((x) => `<div class="opf-funk-kort"><span class="opf-bock">✓</span><span>${eskapa(x)}</span></div>`)
    .join('\n    ');
  const rader = features.map((x) => `<li>${eskapa(x)}</li>`).join('\n    ');
  return `<section class="opf-funktioner" id="opf-funktioner">
  <h2>Det här får du</h2>
  ${kort ? `<div class="opf-funk-grid">\n    ${kort}\n  </div>` : ''}
  ${rader ? `<ul class="opf-funk-lista">\n    ${rader}\n  </ul>` : ''}
</section>`;
}

// Block 6: stark produkt-/lifestylebild. Döljs helt utan media.
function lifestyle(p) {
  const bild = text(p.media?.bild_lifestyle);
  if (!bild) return '';
  return `<section class="opf-lifestyle" id="opf-lifestyle">
  <img class="opf-media" src="${eskapa(bild)}" alt="${eskapa(p.produkt.namn)}" loading="lazy">
</section>`;
}

// Block 7: garantikort i temats ms-guarantee-språk.
function garanti(p) {
  const garantier = lista(p.garantier);
  if (garantier.length === 0) return '';
  const rest = garantier.slice(1).map((g) => `<li>${eskapa(g)}</li>`).join('\n      ');
  const frakt = lista(p.fraktrader).join(' · ');
  return `<section class="opf-garanti" id="opf-garanti">
  <div class="opf-garanti-kort">
    <span class="opf-garanti-sigill" aria-hidden="true">🛡</span>
    <div>
      <p class="opf-garanti-rubrik">${eskapa(garantier[0])}</p>
      ${rest ? `<ul class="opf-garanti-lista">\n      ${rest}\n    </ul>` : ''}
      ${frakt ? `<p class="opf-garanti-frakt">${eskapa(frakt)}</p>` : ''}
    </div>
  </div>
</section>`;
}

// Judge.me-widgetens plats. Fabriken renderar ALDRIG recensionerna själv —
// markören visar var appblocket hamnar i riktiga temat.
function judgemePlats(p) {
  const antal = lista(p.reviews).length;
  return `<section class="opf-judgeme" id="opf-judgeme" aria-label="Judge.me">
  <div class="opf-judgeme-ram">Judge.me-widgeten renderas här av appen${
    antal > 0 ? ` (${antal} recensioner i importunderlaget)` : ''
  }</div>
</section>`;
}

function faq(p) {
  const fragor = lista(p.faq);
  if (fragor.length === 0) return '';
  const rader = fragor
    .map(
      (f) => `<details class="opf-faq-rad">
    <summary>${eskapa(f.fraga)}</summary>
    <p>${eskapa(f.svar)}</p>
  </details>`
    )
    .join('\n  ');
  return `<section class="opf-faq" id="opf-faq">
  <h2>Vanliga frågor</h2>
  ${rader}
</section>`;
}

function stickyAtc(p) {
  const pris = formatPris(p.ekonomi.pris, p.ekonomi.valuta);
  return `<div class="opf-sticky" id="opf-kop">
  <span class="opf-sticky-namn">${eskapa(p.produkt.namn)}</span>
  <span class="opf-sticky-pris">${eskapa(pris)}</span>
  <a class="opf-cta" href="#opf-hero">Köp nu</a>
</div>`;
}

// Designtokens ur butikens BRAND-CONFIG (factory/branding.mjs) — varje butik
// brandas från noll, förhandsvisningen ska se ut som just den butiken.
// Utan branding blir tokens neutrala och avsiktligt trista.
function stil(branding) {
  const t = hamtaTokens(branding);
  const f = t.farger;
  return `<style>
:root {
  --ms-accent: ${f.accent}; --ms-accent-ink: ${f.accent_text};
  --ms-ink: ${f.text}; --ms-ink-soft: color-mix(in srgb, ${f.text} 66%, ${f.bakgrund});
  --ms-ink-faint: color-mix(in srgb, ${f.text} 44%, ${f.bakgrund});
  --ms-surface: ${f.bakgrund}; --ms-surface-2: ${f.yta}; --ms-line: ${f.linje};
  --ms-good: ${f.god}; --ms-radius: ${t.form.kort_radius}px;
  --ms-shadow: 0 1px 2px rgba(18,18,18,.06), 0 8px 24px -12px rgba(18,18,18,.18);
}
.opf { max-width: 720px; margin: 0 auto; font-family: system-ui, sans-serif;
  line-height: 1.55; color: var(--ms-ink); }
.opf section { padding: clamp(32px, 6vw, 64px) clamp(16px, 4vw, 32px); }
.opf h1 { font-size: 1.9rem; line-height: 1.15; margin: 0 0 .4rem; }
.opf h2 { font-size: clamp(1.5rem, 1.1rem + 1.8vw, 2.1rem); line-height: 1.15;
  margin: 0 0 .35em; text-wrap: balance; }
.opf .opf-eyebrow { display: inline-block; font-size: .78rem; letter-spacing: .12em;
  text-transform: uppercase; color: var(--ms-accent); margin-bottom: .6em; }
.opf .opf-lede { margin: 0; color: var(--ms-ink-soft); max-width: 62ch; }
.opf .opf-media { display: block; width: 100%; height: auto; margin-top: 1.5rem;
  border-radius: var(--ms-radius); box-shadow: var(--ms-shadow); }
.opf .opf-hero { padding-top: 16px; }
.opf .opf-hero img { display: block; width: 100%; border-radius: var(--ms-radius);
  margin-bottom: 1rem; }
.opf .opf-brand { margin: 0; font-size: .78rem; letter-spacing: .12em;
  text-transform: uppercase; color: var(--ms-ink-faint); }
.opf .opf-vinkel { margin: .2rem 0 .6rem; color: var(--ms-ink-soft); }
.opf .opf-pris strong { font-size: 1.5rem; }
.opf .opf-jamfor { color: var(--ms-ink-faint); margin-right: .5rem; }
.opf .opf-paket { margin: .3rem 0 .8rem; font-size: .9rem; color: var(--ms-ink-soft); }
.opf .opf-cta { display: inline-block; background: var(--ms-accent); color: var(--ms-accent-ink);
  padding: .85rem 2.2rem; border-radius: var(--ms-radius); text-decoration: none;
  font-weight: 700; box-shadow: var(--ms-shadow); }
.opf .opf-trust { display: flex; flex-wrap: wrap; gap: .5rem 1.5rem; margin-top: 1rem;
  padding: 14px; border: 1px solid var(--ms-line); border-radius: var(--ms-radius);
  background: var(--ms-surface-2); font-size: .85rem; }
.opf .opf-losning { background: var(--ms-surface-2); }
.opf .opf-funk-grid { display: grid; gap: 12px; margin-top: 1.25rem; }
@media (min-width: 750px) { .opf .opf-funk-grid { grid-template-columns: 1fr 1fr; } }
.opf .opf-funk-kort { display: flex; gap: 10px; align-items: flex-start; padding: 14px 16px;
  border: 1px solid var(--ms-line); border-radius: var(--ms-radius);
  background: var(--ms-surface); box-shadow: var(--ms-shadow); }
.opf .opf-bock { flex: none; color: var(--ms-good); font-weight: 700; }
.opf .opf-funk-lista { margin: 1.5rem 0 0; padding-left: 1.2em; display: grid; gap: .55rem;
  font-size: .9rem; color: var(--ms-ink-soft); }
.opf .opf-lifestyle { padding-block: 0; }
.opf .opf-lifestyle .opf-media { margin-top: 0; }
.opf .opf-garanti-kort { display: flex; gap: 16px; align-items: flex-start; padding: 20px;
  border: 1px solid var(--ms-line); border-radius: var(--ms-radius); background: var(--ms-surface-2); }
.opf .opf-garanti-sigill { flex: none; display: grid; place-items: center; width: 48px; height: 48px;
  border-radius: 50%; background: var(--ms-surface); border: 1px solid var(--ms-line); font-size: 1.3rem; }
.opf .opf-garanti-rubrik { margin: 0 0 .3em; font-size: 1.1rem; font-weight: 700; }
.opf .opf-garanti-lista { margin: 0; padding-left: 1.1em; display: grid; gap: .35rem;
  color: var(--ms-ink-soft); font-size: .9rem; }
.opf .opf-garanti-frakt { margin: .6em 0 0; font-size: .78rem; color: var(--ms-ink-faint); }
.opf .opf-judgeme-ram { border: 2px dashed var(--ms-line); border-radius: var(--ms-radius);
  padding: 2rem; text-align: center; color: var(--ms-ink-faint); font-size: .9rem; }
.opf .opf-faq-rad { border-bottom: 1px solid var(--ms-line); }
.opf .opf-faq-rad summary { cursor: pointer; font-weight: 600; padding: 1rem 0; }
.opf .opf-faq-rad p { margin: 0 0 1rem; color: var(--ms-ink-soft); }
.opf-sticky { position: fixed; bottom: 0; left: 0; right: 0; display: flex; gap: 1rem;
  align-items: center; justify-content: space-between; background: var(--ms-surface, #fff);
  padding: .6rem 1rem; border-top: 1px solid var(--ms-line, #ddd);
  box-shadow: 0 -2px 8px rgba(0,0,0,.08); }
.opf-sticky .opf-sticky-namn { font-weight: 600; }
.opf-sticky .opf-cta { display: inline-block; background: var(--ms-accent, #111);
  color: var(--ms-accent-ink, #fff); padding: .7rem 1.6rem; border-radius: ${t.form.knapp_radius}px;
  text-decoration: none; font-weight: 700; }
</style>`;
}

// Beskrivningsstrukturens fasta ordning — hero först (temats main-product),
// sedan blocken 1–7, Judge.me-widgetens plats och FAQ:n sist.
export const SEKTIONSORDNING = [
  'hero',
  'problem',
  'losning',
  'funktioner',
  'lifestyle',
  'garanti',
  'judgeme',
  'faq',
];

const SEKTIONER = {
  hero,
  problem,
  losning,
  funktioner,
  lifestyle,
  garanti,
  judgeme: judgemePlats,
  faq,
};

export function byggSektioner(p) {
  const resultat = {};
  for (const namn of SEKTIONSORDNING) resultat[namn] = SEKTIONER[namn](p);
  resultat['sticky-atc'] = stickyAtc(p);
  return resultat;
}

// Innehållet för lokal granskning (utan sticky ATC).
export function byggSidaHtml(p) {
  const delar = SEKTIONSORDNING.map((namn) => SEKTIONER[namn](p)).filter(Boolean);
  return `${stil(p.branding)}\n<div class="opf">\n${delar.join('\n')}\n</div>`;
}

// Kort beskrivning för produktsidan i temat: BARA säljraden. Benefits låg här
// förut också, men de renderas redan av opf-funktioner — kunden fick samma
// punkter två gånger på samma sida (Axels anmärkning 2026-09-07).
export function byggKortBeskrivning(p) {
  return `<p>${eskapa(kundUnderrubrik(p.vinkel))}</p>`;
}

// Komplett lokal förhandsvisning med alla sektioner inkl. sticky add-to-cart.
export function byggForhandsvisning(p) {
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${eskapa(p.produkt.namn)} — förhandsvisning</title>
</head>
<body style="margin:0; padding-bottom:5rem; background:#fff; color:#111;">
${byggSidaHtml(p)}
${stickyAtc(p)}
</body>
</html>`;
}
