// app.js — det enda skriptet på sidan. Allt annat renderas på servern.
//
// Uppgift: låta besökaren välja ljust eller mörkt, och komma ihåg valet.
// Utan skriptet fungerar sidan ändå — då följer den datorns eget läge.

(function () {
  var NYCKEL = 'stonebite-tema';

  function nuvarande() {
    var stampel = document.documentElement.getAttribute('data-tema');
    if (stampel) return stampel;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'mork' : 'ljus';
  }

  function satt(tema) {
    document.documentElement.setAttribute('data-tema', tema);
    try { localStorage.setItem(NYCKEL, tema); } catch (e) { /* privat läge */ }
    knappar().forEach(function (k) {
      k.setAttribute('aria-label', tema === 'mork' ? 'Byt till ljust läge' : 'Byt till mörkt läge');
    });
  }

  function knappar() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-tema-knapp]'));
  }

  document.addEventListener('click', function (e) {
    var knapp = e.target.closest ? e.target.closest('[data-tema-knapp]') : null;
    if (!knapp) return;
    satt(nuvarande() === 'mork' ? 'ljus' : 'mork');
  });

  knappar().forEach(function (k) {
    k.setAttribute('aria-label', nuvarande() === 'mork' ? 'Byt till ljust läge' : 'Byt till mörkt läge');
  });

  // Kopiera-knappen: mallen VA:n skickar till kunden för att få sitt namn i
  // recensionen. Utan den skriver ingen den — och då betalas inga pengar ut.
  document.addEventListener('click', function (e) {
    var knapp = e.target.closest ? e.target.closest('[data-kopiera]') : null;
    if (!knapp) return;
    var kalla = document.getElementById(knapp.getAttribute('data-kopiera'));
    if (!kalla) return;
    var text = kalla.textContent.trim();
    var klart = function () {
      var gammal = knapp.textContent;
      knapp.textContent = knapp.getAttribute('data-klar') || 'Kopierat!';
      setTimeout(function () { knapp.textContent = gammal; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(klart, function () { /* tyst */ });
    } else {
      var ruta = document.createElement('textarea');
      ruta.value = text;
      document.body.appendChild(ruta);
      ruta.select();
      try { document.execCommand('copy'); klart(); } catch (err) { /* tyst */ }
      document.body.removeChild(ruta);
    }
  });
})();
