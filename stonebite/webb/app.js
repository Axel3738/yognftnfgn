// app.js — det enda skriptet på sidan. Allt annat renderas på servern.
//
// Tre uppgifter: låta besökaren välja ljust eller mörkt (och komma ihåg det),
// kopiera-knappen på Min sida, och den publika sidans rörelse (block som
// scrollas fram, bilder som lutar sig mot pekaren). Utan skriptet fungerar
// sidan ändå — då följer den datorns eget läge och allt syns direkt.

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

  // ------------------------------------------------ publika sidans rörelse
  // `.avslojas` är gömt av CSS:en så länge <html class="js"> finns. Här får
  // varje block klassen `synlig` när det kommer in i vyn — en gång, sedan
  // slutar vi titta. Saknas IntersectionObserver visas allt på en gång.
  var block = Array.prototype.slice.call(document.querySelectorAll('.avslojas'));
  var stilla = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (block.length) {
    if (!('IntersectionObserver' in window) || stilla) {
      block.forEach(function (b) { b.classList.add('synlig'); });
    } else {
      var ogat = new IntersectionObserver(function (poster) {
        poster.forEach(function (p) {
          if (!p.isIntersecting) return;
          p.target.classList.add('synlig');
          ogat.unobserve(p.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      block.forEach(function (b) { ogat.observe(b); });
    }
  }

  // Bilderna lutar sig svagt mot pekaren (bara med mus, aldrig på touch,
  // aldrig när besökaren bett om mindre rörelse). Max ~4 grader.
  var harMus = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (harMus && !stilla) {
    Array.prototype.slice.call(document.querySelectorAll('[data-tilt]')).forEach(function (ram) {
      var ruta = null;
      ram.addEventListener('pointerenter', function () { ruta = ram.getBoundingClientRect(); });
      ram.addEventListener('pointermove', function (e) {
        if (!ruta) ruta = ram.getBoundingClientRect();
        var x = (e.clientX - ruta.left) / ruta.width - 0.5;
        var y = (e.clientY - ruta.top) / ruta.height - 0.5;
        ram.style.transform = 'perspective(1100px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg)';
      });
      ram.addEventListener('pointerleave', function () {
        ruta = null;
        ram.style.transform = '';
      });
    });
  }
})();
