// vy/login.mjs — inloggningen och förstagångsuppsättningen.
//
// Felmeddelandet säger ALDRIG om det var adressen eller lösenordet som var
// fel ("Fel e-post eller lösenord"). Allt annat är en gratis lista över vilka
// adresser som finns.

import { esc, attr, marke } from './delar.mjs';

function skal({ titel, innehall, nonce = '' }) {
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titel)}</title>
<meta name="robots" content="noindex, nofollow">
<meta name="color-scheme" content="light dark">
<link rel="icon" href="/webb/marke.svg" type="image/svg+xml">
<link rel="stylesheet" href="/webb/stil.css">
<script${nonce ? ` nonce="${nonce}"` : ''}>(function(){try{var t=localStorage.getItem('stonebite-tema');if(t)document.documentElement.setAttribute('data-tema',t);}catch(e){}})();</script>
</head>
<body><div class="login-skarm">${innehall}</div>
<script src="/webb/app.js" defer></script>
</body></html>`;
}

export function loginSida({ fel = '', meddelande = '', epost = '', csrf, nasta = '', nonce = '' }) {
  return skal({
    nonce,
    titel: 'Logga in · Stonebite',
    innehall: `<div class="login-kort">
      <a class="marke" href="/" style="margin-bottom:22px">${marke(20)} Stonebite</a>
      <h1>Logga in</h1>
      <p class="under">Interna dashboards för Stonebite Ecom AB.</p>
      ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
      ${meddelande ? `<div class="ok-ruta">${esc(meddelande)}</div>` : ''}
      <form method="post" action="/logga-in" autocomplete="on">
        <input type="hidden" name="csrf" value="${attr(csrf)}">
        <input type="hidden" name="nasta" value="${attr(nasta)}">
        <label class="falt">
          <span>E-post</span>
          <input type="email" name="epost" value="${attr(epost)}" required autocomplete="username" autofocus inputmode="email">
        </label>
        <label class="falt">
          <span>Lösenord</span>
          <input type="password" name="losenord" required autocomplete="current-password">
        </label>
        <button class="knapp bred" type="submit" style="margin-top:8px">Logga in</button>
      </form>
      <p class="mini" style="margin-top:20px">Glömt lösenordet? Be Axel skapa ett nytt åt dig.</p>
    </div>`,
  });
}

/**
 * Första gången: det finns inget konto alls. Sidan finns BARA så länge
 * användarfilen är tom — servern stänger den i samma sekund som ägaren finns.
 */
export function uppstartSida({ fel = '', csrf, nonce = '' }) {
  return skal({
    nonce,
    titel: 'Kom igång · Stonebite',
    innehall: `<div class="login-kort">
      <a class="marke" href="/" style="margin-bottom:22px">${marke(20)} Stonebite</a>
      <h1>Skapa ägarkontot</h1>
      <p class="under">Det finns inget konto än. Det första kontot blir ägare och kan lägga till alla andra.</p>
      ${fel ? `<div class="fel-ruta">${esc(fel)}</div>` : ''}
      <form method="post" action="/kom-igang">
        <input type="hidden" name="csrf" value="${attr(csrf)}">
        <label class="falt"><span>Ditt namn</span><input name="namn" required autocomplete="name" autofocus></label>
        <label class="falt"><span>E-post</span><input type="email" name="epost" required autocomplete="username" inputmode="email"></label>
        <label class="falt"><span>Lösenord (minst 8 tecken)</span><input type="password" name="losenord" required minlength="8" autocomplete="new-password"></label>
        <label class="falt"><span>Lösenordet en gång till</span><input type="password" name="losenord2" required minlength="8" autocomplete="new-password"></label>
        <button class="knapp bred" type="submit" style="margin-top:8px">Skapa kontot</button>
      </form>
      <p class="mini" style="margin-top:20px">Den här sidan försvinner när kontot är skapat.</p>
    </div>`,
  });
}
