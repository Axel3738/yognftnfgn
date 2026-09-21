// vy/delar.mjs — byggklossarna varje sida sätts ihop av.
//
// Allt som kommer utifrån (kampanjnamn ur Meta, butiksnamn ur Shopify, namn
// någon skrivit in) går genom esc(). En apostrof i ett kampanjnamn ska inte
// kunna knäcka sidan, och ett skript i ett fält ska aldrig köras.
//
// Designreglerna som sitter i koden här:
//   • en hjältesiffra per vy, aldrig två
//   • etikett litet och tyst, siffran stor, en mening som förklarar på svenska
//   • status = prick + ORD (aldrig bara färg)
//   • saknas datan skrivs det ut med orsak — aldrig en nolla

import { sparkline as raknaSparkline, tal, pengar, forandring } from '../berakna.mjs';

export function esc(v) {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function attr(v) {
  return esc(v);
}

/** Bara de bitar som inte är null/false/undefined. */
export function hop(...delar) {
  return delar.filter(Boolean).join('');
}

// ------------------------------------------------------------- märket

/** Stonebite-märket: en sten med ett bett ur. Ren SVG, ingen bildfil. */
export function marke(storlek = 20) {
  return `<svg width="${storlek}" height="${storlek}" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4.2 7.4 11.1 3a1.7 1.7 0 0 1 1.8 0l6.9 4.4c.5.3.8.9.8 1.5v6.2c0 .6-.3 1.2-.8 1.5l-6.9 4.4a1.7 1.7 0 0 1-1.8 0L4.2 16.6a1.8 1.8 0 0 1-.8-1.5V8.9c0-.6.3-1.2.8-1.5Z" fill="currentColor"/>
    <circle cx="19.4" cy="6.6" r="4.1" fill="var(--papper)"/>
  </svg>`;
}

// ------------------------------------------------------------ sparkline

/**
 * En serie som liten kurva. Enfärgad enskild serie ⇒ ingen legend behövs,
 * sista punkten får en prick med 2px ring i ytans färg.
 */
export function spark(varden, { bredd = 108, hojd = 34, titel = '' } = {}) {
  const s = raknaSparkline(varden, { bredd, hojd });
  if (!s) return '';
  const prick = s.sistaPunkt ? `<circle cx="${s.sistaPunkt[0]}" cy="${s.sistaPunkt[1]}" r="3.2"/>` : '';
  return `<svg class="spark" width="${bredd}" height="${hojd}" viewBox="0 0 ${bredd} ${hojd}" role="img" aria-label="${attr(titel || 'utveckling över tid')}"><path d="${s.d}"/>${prick}</svg>`;
}

// --------------------------------------------------------------- status

const TON_ORD = { bra: 'bra', varning: 'varning', allvar: 'allvar', kritisk: 'kritisk', neutral: '' };

/** Prick + ord. Ordet är det som bär betydelsen, färgen är bara stöd. */
export function status(ton, ord) {
  return `<span class="status ${TON_ORD[ton] ?? ''}"><span class="prick" aria-hidden="true"></span>${esc(ord)}</span>`;
}

export function delta(f, { bra = 'upp' } = {}) {
  if (!f) return '';
  const ikon = f.riktning === 'upp' ? '↑' : f.riktning === 'ner' ? '↓' : '→';
  const klass = f.riktning === 'stilla' ? '' : (f.riktning === bra ? 'upp' : 'ner');
  return `<span class="delta ${klass}">${ikon} ${esc(f.text)}</span>`;
}

// ---------------------------------------------------------------- kort

/**
 * Ett nyckeltal. `forklaring` är meningen på svenska som gör talet begripligt
 * utan förkunskap — den är inte dekoration, den är halva poängen.
 */
export function kort({ etikett, varde, forklaring = '', serie = null, jamfor = null, jamforBra = 'upp', status: st = null, fot = '', text = false }) {
  const f = jamfor ? delta(jamfor, { bra: jamforBra }) : '';
  return `<article class="kort">
    <div class="etikett">${esc(etikett)}</div>
    <div class="varde${text ? ' text' : ''}">${varde}</div>
    ${forklaring ? `<p class="forklaring">${esc(forklaring)}</p>` : ''}
    <div class="botten">
      <div>${f || (st ?? '')}</div>
      ${serie ? spark(serie, { titel: `${etikett} över tid` }) : ''}
    </div>
    ${fot ? `<p class="mini mellan">${esc(fot)}</p>` : ''}
  </article>`;
}

/** Hjältesiffran. EXAKT en per sida. */
export function hjalte({ etikett, varde, forklaring = '', serie = null, jamfor = null, jamforBra = 'upp', sida = '' }) {
  return `<section class="hjalte">
    <div>
      <div class="etikett">${esc(etikett)}</div>
      <div class="varde">${varde}</div>
      ${forklaring ? `<p class="forklaring">${esc(forklaring)}</p>` : ''}
      ${jamfor ? `<p class="mellan">${delta(jamfor, { bra: jamforBra })}</p>` : ''}
    </div>
    <div>${serie ? spark(serie, { bredd: 220, hojd: 72, titel: `${etikett} över tid` }) : ''}${sida}</div>
  </section>`;
}

// --------------------------------------------------------------- paneler

export function panel({ titel, under = '', innehall, fot = '', verktyg = '' }) {
  return `<section class="panel">
    ${titel ? `<header class="panel-huvud"><div><h3>${esc(titel)}</h3>${under ? `<p class="under">${esc(under)}</p>` : ''}</div>${verktyg}</header>` : ''}
    ${innehall}
    ${fot ? `<footer class="panel-fot">${esc(fot)}</footer>` : ''}
  </section>`;
}

/**
 * Tabell. `kolumner`: [{ titel, tal?, bredd? }]. `rader`: färdiga <td>-listor.
 * Tomma tabeller visas aldrig som en tom ruta — anropa tomt() i stället.
 */
export function tabell(kolumner, rader) {
  const huvud = kolumner.map((k) => `<th${k.tal ? ' class="tal"' : ''}${k.bredd ? ` style="width:${k.bredd}"` : ''}>${esc(k.titel)}</th>`).join('');
  return `<div class="tabellsvep"><table>
    <thead><tr>${huvud}</tr></thead>
    <tbody>${rader.join('')}</tbody>
  </table></div>`;
}

/** Saknad data — alltid med orsak. Aldrig en nolla, aldrig tomt. */
export function tomt(rubrik, orsak = '') {
  return `<div class="tomt"><b>${esc(rubrik)}</b>${orsak ? esc(orsak) : ''}</div>`;
}

export function block({ titel, under = '', innehall }) {
  return `<section class="block">
    ${titel ? `<h2>${esc(titel)}</h2>` : ''}
    ${under ? `<p class="under">${esc(under)}</p>` : ''}
    ${innehall}
  </section>`;
}

/** Liten stapel i en tabellcell — andel av radens max. */
export function stapel(andel) {
  const a = Math.max(0, Math.min(100, Number(andel) || 0));
  return `<span class="stapel-spar" aria-hidden="true"><span class="stapel" style="width:${a.toFixed(1)}%"></span></span>`;
}

export function taggar(lista) {
  if (!lista?.length) return '';
  return `<div class="etiketter">${lista.map((t) => `<span class="tagg">${esc(t)}</span>`).join('')}</div>`;
}

// ------------------------------------------------------- små formatterare

export { tal, pengar, forandring };
