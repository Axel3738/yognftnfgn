/* ==========================================================================
   ms-varva.js — värva en vän (Matstrumpor)
   --------------------------------------------------------------------------
   KÄLLAN ligger i repot: matstrumpor/varva/ms-varva.js. Temats kopia byggs
   av `node matstrumpor/varva.mjs --tema --skarpt` med datan inbakad — ändra
   aldrig i temat, då skriver nästa körning över det.

   En vän landar på butiken via kundens länk (…/?van=<bekräftelsenummer>).
   Tre saker händer, och inget annat:

     1. Numret sparas i webbläsaren i 30 dagar, så vännen kan komma tillbaka
        senare och ändå få sin rabatt.
     2. Vännens rabattkod läggs på via /discount/<kod> — Shopifys egen väg,
        samma som paketväljaren (ms-paket.js). Den vägen LÄGGER TILL en kod,
        så paketkoden och vännens kod ligger i varukorgen samtidigt (mätt
        2026-09-30), och de får kombineras (matstrumpor/varva.mjs --kod).
     3. Varukorgen märks med attributet van=<numret>. Det följer med till
        ordern, och så vet varva.mjs vem som ska ha krediten.

   Rutan "Din vän har gett dig …" visas bara om beloppet finns i kundens
   valuta. Koden och märkningen läggs på ändå.
   ========================================================================== */

(function () {
  'use strict';
  var DATA = /*__DATA__*/null;
  var TEXT = /*__TEXT__*/null;
  if (!DATA || !window.fetch) return;

  var NYCKEL = 'ms_van';
  var DAGAR = 30;
  var rutt = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';

  function giltig(ref) {
    var s = String(ref || '').trim().toUpperCase();
    return /^[A-Z0-9]{6,16}$/.test(s) ? s : null;
  }
  function las() {
    try {
      var v = JSON.parse(window.localStorage.getItem(NYCKEL) || 'null');
      if (v && giltig(v.ref) && Date.now() - v.t < DAGAR * 864e5) return v;
    } catch (e) { /* privat läge — då gäller bara besöket */ }
    return null;
  }
  function spara(ref) {
    try { window.localStorage.setItem(NYCKEL, JSON.stringify({ ref: ref, t: Date.now() })); } catch (e) { /* se ovan */ }
  }

  var ny = null;
  try { ny = giltig(new URLSearchParams(window.location.search).get('van')); } catch (e) { ny = null; }
  if (ny) spara(ny);
  var post = ny ? { ref: ny } : las();
  if (!post) return;

  // En gång per besök (och alltid när länken just klickats): koden + märkningen.
  var sessNyckel = 'ms_van_satt_' + post.ref;
  var klar = false;
  try { klar = window.sessionStorage.getItem(sessNyckel) === '1'; } catch (e) { klar = false; }
  if (!klar || ny) {
    var attribut = {};
    attribut[DATA.attribut] = post.ref;
    fetch(rutt + 'discount/' + encodeURIComponent(DATA.kod) + '?redirect=' + encodeURIComponent(rutt + 'cart.js'), { credentials: 'same-origin' })
      .then(function () {
        return fetch(rutt + 'cart/update.js', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ attributes: attribut })
        });
      })
      .then(function (svar) {
        if (svar && svar.ok) { try { window.sessionStorage.setItem(sessNyckel, '1'); } catch (e) { /* nästa sida försöker igen */ } }
      })
      .catch(function () { /* nästa sida försöker igen */ });
  }

  // Rutan: bara när länken just klickats, eller tidigare i samma besök och inte stängd.
  var STANGD = 'ms_van_stangd';
  var visad = false;
  try { visad = window.sessionStorage.getItem('ms_van_visa') === '1'; if (window.sessionStorage.getItem(STANGD) === '1') return; } catch (e) { visad = false; }
  if (!ny && !visad) return;
  try { window.sessionStorage.setItem('ms_van_visa', '1'); } catch (e) { /* bara den här sidan */ }

  var sprak = document.documentElement.lang || 'sv';
  function textFor(l) {
    if (!TEXT) return null;
    if (TEXT[l]) return TEXT[l];
    var k = Object.keys(TEXT);
    for (var i = 0; i < k.length; i++) if (k[i].toLowerCase() === l.toLowerCase()) return TEXT[k[i]];
    var grund = l.split('-')[0].toLowerCase();
    for (var j = 0; j < k.length; j++) if (k[j].toLowerCase() === grund) return TEXT[k[j]];
    return null;
  }
  var t = textFor(sprak);
  var valuta = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || '';
  var belopp = DATA.valutor[valuta];
  if (!t || !belopp) return;
  var d = belopp % 1 ? 2 : 0;
  var summa;
  try {
    summa = new Intl.NumberFormat(sprak, { style: 'currency', currency: valuta, minimumFractionDigits: d, maximumFractionDigits: d }).format(belopp);
  } catch (e) { summa = belopp + ' ' + valuta; }

  function visa() {
    if (document.getElementById('ms-varva-ruta')) return;
    var ruta = document.createElement('div');
    ruta.id = 'ms-varva-ruta';
    ruta.setAttribute('role', 'status');
    // z-index under temats lådor (varukorgen 1000), så en öppnad låda täcker rutan.
    ruta.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:999;' +
      'box-sizing:border-box;width:calc(100% - 32px);max-width:480px;display:flex;gap:12px;align-items:flex-start;' +
      'padding:14px 16px;border-radius:12px;background:#1f1b16;color:#fff;font:inherit;font-size:15px;line-height:1.45;' +
      'box-shadow:0 8px 24px rgba(0,0,0,.25);border-left:6px solid #dd821d';
    var text = document.createElement('span');
    text.style.flex = '1';
    text.textContent = String(t.valkommen).replace('{van}', summa);
    var stang = document.createElement('button');
    stang.type = 'button';
    stang.setAttribute('aria-label', t.stang || 'Stäng');
    stang.textContent = '×';
    stang.style.cssText = 'all:unset;cursor:pointer;font-size:22px;line-height:1;padding:0 4px;color:#fff';
    stang.addEventListener('click', function () {
      ruta.remove();
      try { window.sessionStorage.setItem(STANGD, '1'); } catch (e) { /* bara den här sidan */ }
    });
    ruta.appendChild(text);
    ruta.appendChild(stang);
    document.body.appendChild(ruta);

    // Produktsidans fasta köpknapp (.ms-sticky) glider upp längst ner när
    // kunden skrollar förbi den vanliga knappen. Rutan lägger sig ovanför den,
    // så köpknappen aldrig täcks (mätt 2026-09-30 på 390 px: annars överlappade de).
    function lyft() {
      var fast = document.querySelector('.ms-sticky');
      var r = fast ? fast.getBoundingClientRect() : null;
      var syns = r && r.height > 0 && r.top < window.innerHeight && r.bottom > 0;
      ruta.style.bottom = (syns ? Math.round(window.innerHeight - r.top + 12) : 16) + 'px';
    }
    // Knappen glider in med en animation EFTER skrollhändelsen, så läget
    // kontrolleras också med jämna mellanrum så länge rutan finns.
    lyft();
    window.addEventListener('scroll', lyft, { passive: true });
    window.addEventListener('resize', lyft, { passive: true });
    var klocka = window.setInterval(function () {
      if (!document.body.contains(ruta)) { window.clearInterval(klocka); return; }
      lyft();
    }, 400);
  }
  if (document.body) visa();
  else document.addEventListener('DOMContentLoaded', visa);
})();
