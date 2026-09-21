// vy/layout.mjs — sidans skal: huvud, meny, fot. Två skal finns: det publika
// (vem som helst) och appens (inloggad). De delar CSS och märke, inget annat.

import { esc, attr, marke, t } from './delar.mjs';
import { menyFor } from '../roller.mjs';

const TEMA_SKRIPT = `
(function(){
  try{
    var t = localStorage.getItem('stonebite-tema');
    if (t) document.documentElement.setAttribute('data-tema', t);
  }catch(e){}
})();`;

function huvudTaggar({ titel, beskrivning, nonce = '' }) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titel)}</title>
<meta name="description" content="${attr(beskrivning ?? '')}">
<meta name="color-scheme" content="light dark">
<meta name="robots" content="${attr(beskrivning === null ? 'noindex, nofollow' : 'index, follow')}">
<link rel="icon" href="/webb/marke.svg" type="image/svg+xml">
<link rel="stylesheet" href="/webb/stil.css">
<script${nonce ? ` nonce="${nonce}"` : ''}>${TEMA_SKRIPT}</script>`;
}

function temaknapp() {
  return `<button class="temaknapp" type="button" data-tema-knapp aria-label="Byt mellan ljust och mörkt">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>
    </svg>
  </button>`;
}

/** Publika sidan: allt som inte kräver inloggning. */
export function publiktSkal({ titel, beskrivning, innehall, fot = '', inloggad = false, nonce = '' }) {
  return `<!doctype html>
<html lang="sv">
<head>${huvudTaggar({ titel, beskrivning, nonce })}</head>
<body>
<header class="topp"><div class="omslag topp-inner">
  <a class="marke" href="/">${marke(20)} Stonebite</a>
  <nav class="navlankar" aria-label="Meny">
    <a class="navlank" href="/#vad-vi-gor">Vad vi gör</a>
    <a class="navlank" href="/#varumarken">Varumärken</a>
    ${temaknapp()}
    <a class="knapp liten" href="${inloggad ? '/app' : '/logga-in'}" style="margin-left:8px">${inloggad ? 'Till dashboarden' : 'Logga in'}</a>
  </nav>
</div></header>
<main>${innehall}</main>
<footer class="fot"><div class="omslag fot-rader">
  <span>${esc(fot)}</span>
  <span><a href="/logga-in">Intern inloggning</a></span>
</div></footer>
<script src="/webb/app.js" defer></script>
</body>
</html>`;
}

/** Inloggade sidan. Menyn speglar rollen — servern avgör, inte menyn. */
export function appSkal({ titel, anvandare, aktivSida, innehall, huvud = '', nonce = '' }) {
  const meny = menyFor(anvandare).map((s) => (
    `<a class="navlank" href="${attr(s.url)}"${s.nyckel === aktivSida ? ' aria-current="page"' : ''}>${esc(t(s.titel))}</a>`
  )).join('');

  return `<!doctype html>
<html lang="sv">
<head>${huvudTaggar({ titel: `${titel} · Stonebite`, beskrivning: null, nonce })}</head>
<body>
<header class="topp"><div class="omslag topp-inner">
  <a class="marke" href="/app">${marke(20)} Stonebite</a>
  <nav class="navlankar" aria-label="${attr(t('Meny'))}">
    ${meny}
    ${temaknapp()}
    <a class="navlank" href="/app/mig" title="${attr(anvandare.namn)}" style="font-weight:600">${esc(fornamn(anvandare.namn))}</a>
    <a class="navlank" href="/logga-ut">${esc(t('Logga ut'))}</a>
  </nav>
</div></header>
<main class="app"><div class="omslag">
  ${huvud}
  ${innehall}
</div></main>
<script src="/webb/app.js" defer></script>
</body>
</html>`;
}

export function fornamn(namn) {
  return String(namn ?? '').trim().split(/\s+/)[0] || 'Du';
}

/** Sidhuvudet inne i appen: rubrik, en mening, och när datan hämtades. */
export function sidhuvud({ rubrik, under = '', farsk = '' }) {
  return `<div class="sidhuvud">
    <div>
      <h1>${esc(t(rubrik))}</h1>
      ${under ? `<p class="under">${esc(t(under))}</p>` : ''}
    </div>
    ${farsk ? `<span class="farsk">${farsk}</span>` : ''}
  </div>`;
}
