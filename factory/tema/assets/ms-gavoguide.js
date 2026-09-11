/* ms-gavoguide.js — gåvoguiden: några frågor om mottagaren, ett svar ur
   butikens egen kollektion.

   Varför den finns (Axels beslut 2026-09-11): en nischbutik med tolv
   adventskalendrar ställer kunden inför ett val hon inte kan göra. Hon vet
   inte vilken kalender som passar hennes brorson — hon vet bara att han är
   sju och gillar dinosaurier. Guiden översätter det hon vet till en produkt.

   TRE REGLER SOM KODEN VILAR PÅ
   1. Produkterna kommer ur KOLLEKTIONEN, aldrig ur en lista här.
      Sektionen renderar varje produkt med sitt `opf.quiz`-metafält. En ny
      kalender som får metafältet är med i guiden samma sekund — ingen kod
      rörs. En kalender UTAN metafältet är osynlig för guiden men syns i
      butiken som vanligt (ingen tyst halv match).
   2. Uteslutningar går före poäng. En alkoholtemakalender får ALDRIG
      rekommenderas till ett barn, oavsett hur många intressetaggar som
      råkar matcha. Poängmodeller är mjuka; det här får inte vara mjukt.
   3. Guiden svarar ALLTID. Filtrerar svaren bort allt (barnbudget 399 kr
      mot ett sortiment som börjar på 449) släpps det mjukaste filtret och
      svaret märks med varför. Ett tomt resultat är ett trasigt löfte.

   Ingen bygg-kedja, inga beroenden. Vanilla, för temat har ingen.
*/
(function () {
  'use strict';

  /* POÄNGMODELLEN bakas in här av factory/tema.mjs ur factory/gavoguide.mjs
     (samma källkod, `export` strippat). Enda källan — spärrarna testas i
     factory/test/gavoguide.test.mjs och kan inte glida isär från temat. */
  /*{{ poangmodell }}*/

  /* ---------------------------------------------------------------- DOM */

  function Guide(rot) {
    this.rot = rot;
    this.produkter = this.lasProdukter();
    this.fragor = Array.prototype.slice.call(rot.querySelectorAll('[data-guide-fraga]'));
    this.resultat = rot.querySelector('[data-guide-resultat]');
    this.progress = rot.querySelector('[data-guide-progress]');
    this.raknare = rot.querySelector('[data-guide-raknare]');
    this.tidigare = rot.querySelector('[data-guide-tidigare]');
    this.steg = 0;
    this.matchade = [];
    if (this.produkter.length === 0 || this.fragor.length === 0) return;
    this.rot.hidden = false;
    var fallback = this.rot.querySelector('[data-guide-fallback]');
    if (fallback) fallback.hidden = true;
    this.koppla();
    this.visa(0);
  }

  Guide.prototype.lasProdukter = function () {
    var ut = [];
    var noder = this.rot.querySelectorAll('[data-guide-produkt]');
    for (var i = 0; i < noder.length; i++) {
      var n = noder[i];
      var q;
      try {
        q = JSON.parse(n.getAttribute('data-guide-produkt'));
      } catch (e) {
        continue; // trasigt metafält gör produkten osynlig för guiden, inte sidan
      }
      if (!q || !q.taggar || !q.taggar.length) continue;
      ut.push({
        handle: n.dataset.handle,
        titel: n.dataset.titel,
        url: n.dataset.url,
        bild: n.dataset.bild || '',
        pris: Number(n.dataset.pris || 0),
        prisText: n.dataset.prisText || '',
        jamforText: n.dataset.jamforText || '',
        variant: n.dataset.variant || '',
        quiz: q,
      });
    }
    return ut;
  };

  Guide.prototype.koppla = function () {
    var self = this;
    this.rot.addEventListener('change', function (e) {
      if (!e.target.matches('input[type="radio"]')) return;
      var kort = e.target.closest('[data-guide-fraga]');
      if (!kort) return;
      // Lite fördröjning så markeringen hinner synas innan nästa fråga.
      window.setTimeout(function () {
        self.nasta(kort);
      }, 180);
    });
    this.rot.addEventListener('click', function (e) {
      var b = e.target.closest('[data-guide-tillbaka]');
      if (b) {
        e.preventDefault();
        self.visa(Math.max(0, self.foregaende()));
        return;
      }
      var om = e.target.closest('[data-guide-om]');
      if (om) {
        e.preventDefault();
        self.gorOm();
        return;
      }
      var kop = e.target.closest('[data-guide-kop]');
      if (kop) {
        e.preventDefault();
        self.laggIKorg(kop);
      }
    });
  };

  /** Frågor kan vara villkorade: `visa_om` listar taggar där minst en måste
   *  vara vald. En fråga som inte gäller mottagaren hoppas över — det är
   *  skillnaden mellan sju frågor och fem för samma kund. */
  Guide.prototype.galler = function (kort) {
    var villkor = (kort.dataset.visaOm || '').split(',').map(function (s) {
      return s.trim();
    }).filter(Boolean);
    if (villkor.length === 0) return true;
    var valda = this.valda();
    var taggar = new Set();
    valda.forEach(function (v) {
      v.taggar.forEach(function (t) {
        taggar.add(t);
      });
    });
    for (var i = 0; i < villkor.length; i++) {
      if (taggar.has(villkor[i])) return true;
    }
    return false;
  };

  Guide.prototype.valda = function () {
    var ut = [];
    for (var i = 0; i < this.fragor.length; i++) {
      var vald = this.fragor[i].querySelector('input[type="radio"]:checked');
      if (!vald) continue;
      ut.push({
        taggar: (vald.dataset.taggar || '').split(',').map(function (s) {
          return s.trim();
        }).filter(Boolean),
        vikt: Number(this.fragor[i].dataset.vikt || 2),
        etikett: vald.dataset.etikett || '',
      });
    }
    return ut;
  };

  Guide.prototype.nasta = function (kort) {
    var i = this.fragor.indexOf(kort);
    for (var j = i + 1; j < this.fragor.length; j++) {
      if (this.galler(this.fragor[j])) return this.visa(j);
    }
    this.visaResultat();
  };

  Guide.prototype.foregaende = function () {
    for (var j = this.steg - 1; j >= 0; j--) {
      if (this.galler(this.fragor[j])) return j;
    }
    return 0;
  };

  Guide.prototype.visa = function (i) {
    this.steg = i;
    for (var j = 0; j < this.fragor.length; j++) {
      this.fragor[j].hidden = j !== i;
    }
    if (this.resultat) this.resultat.hidden = true;
    this.uppdateraProgress(i);
    var rubrik = this.fragor[i].querySelector('legend');
    if (rubrik && this.steg > 0) rubrik.setAttribute('tabindex', '-1');
  };

  Guide.prototype.uppdateraProgress = function (i) {
    var relevanta = [];
    for (var j = 0; j < this.fragor.length; j++) {
      if (j <= i || this.galler(this.fragor[j])) relevanta.push(j);
    }
    var nu = relevanta.indexOf(i) + 1;
    var av = relevanta.length;
    if (this.progress) this.progress.style.setProperty('--ms-guide-andel', av ? (nu / av) * 100 + '%' : '0%');
    if (this.raknare) this.raknare.textContent = nu + ' / ' + av;
  };

  Guide.prototype.visaResultat = function () {
    var valda = this.valda();
    var svar = rangordna(this.produkter, valda);
    for (var j = 0; j < this.fragor.length; j++) this.fragor[j].hidden = true;
    if (this.progress) this.progress.style.setProperty('--ms-guide-andel', '100%');
    if (this.raknare) this.raknare.textContent = '';
    if (!this.resultat) return;
    this.resultat.hidden = false;
    this.resultat.innerHTML = this.htmlResultat(svar, valda);
    this.resultat.setAttribute('tabindex', '-1');
    this.resultat.focus({ preventScroll: true });
    this.resultat.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (svar.rankade[0]) this.matchade.push(svar.rankade[0].produkt);
    this.ritaTidigare();
  };

  Guide.prototype.htmlResultat = function (svar, valda) {
    var t = this.rot.dataset;
    if (svar.rankade.length === 0) {
      return (
        '<p class="ms-guide__tom">' +
        esc(t.textIngen || 'Ingen kalender matchade allt du valde.') +
        ' <a href="' + esc(t.kollektionUrl || '/collections/all') + '">' +
        esc(t.textAlla || 'Se alla kalendrar') + '</a></p>' +
        knappOm(t)
      );
    }
    var basta = svar.rankade[0].produkt;
    var andra = svar.rankade.slice(1, RESULTAT_ANTAL);
    var svarsrad = valda
      .map(function (v) {
        return esc(v.etikett);
      })
      .filter(Boolean)
      .join(' · ');

    var h = '';
    h += '<p class="ms-guide__svarsrad">' + svarsrad + '</p>';
    h += '<div class="ms-guide__traff">';
    if (basta.bild) {
      h += '<a class="ms-guide__traffbild" href="' + esc(basta.url) + '">' +
        '<img src="' + esc(basta.bild) + '" alt="" loading="lazy" width="320" height="320"></a>';
    }
    h += '<div class="ms-guide__trafftext">';
    h += '<p class="ms-guide__etikett">' + esc(t.textMatch || 'Din match') + '</p>';
    h += '<h3 class="ms-guide__namn"><a href="' + esc(basta.url) + '">' + esc(basta.titel) + '</a></h3>';
    if (basta.quiz.mening) h += '<p class="ms-guide__mening">' + esc(basta.quiz.mening) + '</p>';
    h += '<p class="ms-guide__pris">' + esc(basta.prisText);
    if (basta.jamforText) h += ' <s>' + esc(basta.jamforText) + '</s>';
    h += '</p>';
    if (svar.not === 'budget') {
      h += '<p class="ms-guide__not">' + esc(t.textBudget || 'Ingen kalender låg under din budget — det här är den som passar bäst i övrigt.') + '</p>';
    }
    h += '<div class="ms-guide__knappar">';
    if (basta.variant) {
      h += '<button type="button" class="ms-guide__kop" data-guide-kop data-variant="' + esc(basta.variant) + '" data-titel="' + esc(basta.titel) + '">' +
        esc(t.textKop || 'Lägg i varukorgen') + '</button>';
    }
    h += '<a class="ms-guide__lank" href="' + esc(basta.url) + '">' + esc(t.textLas || 'Läs mer') + '</a>';
    h += '</div>';
    h += '</div></div>';

    if (andra.length) {
      h += '<p class="ms-guide__ocksa">' + esc(t.textOcksa || 'Passar också') + '</p><ul class="ms-guide__alt">';
      andra.forEach(function (r) {
        var p = r.produkt;
        h += '<li><a href="' + esc(p.url) + '">';
        if (p.bild) h += '<img src="' + esc(p.bild) + '" alt="" loading="lazy" width="96" height="96">';
        h += '<span class="ms-guide__altnamn">' + esc(p.titel) + '</span>';
        h += '<span class="ms-guide__altpris">' + esc(p.prisText) + '</span>';
        h += '</a></li>';
      });
      h += '</ul>';
    }
    h += knappOm(t);
    return h;
  };

  function knappOm(t) {
    return '<button type="button" class="ms-guide__om" data-guide-om>' +
      esc(t.textOm || 'Gör om för en annan person') + '</button>';
  }

  Guide.prototype.gorOm = function () {
    var radio = this.rot.querySelectorAll('input[type="radio"]');
    for (var i = 0; i < radio.length; i++) radio[i].checked = false;
    if (this.resultat) {
      this.resultat.hidden = true;
      this.resultat.innerHTML = '';
    }
    this.visa(0);
    this.rot.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /** De som redan matchats ligger kvar som en rad under guiden. Den som
   *  köper till fyra personer ska slippa hålla dem i huvudet. */
  Guide.prototype.ritaTidigare = function () {
    if (!this.tidigare) return;
    var unika = [];
    var sedda = {};
    for (var i = 0; i < this.matchade.length; i++) {
      var p = this.matchade[i];
      if (sedda[p.handle]) continue;
      sedda[p.handle] = true;
      unika.push(p);
    }
    if (unika.length < 2) {
      this.tidigare.hidden = true;
      return;
    }
    var t = this.rot.dataset;
    this.tidigare.hidden = false;
    this.tidigare.innerHTML =
      '<span class="ms-guide__tidigaretext">' + esc(t.textTidigare || 'Dina matchningar hittills') + ':</span> ' +
      unika
        .map(function (p) {
          return '<a href="' + esc(p.url) + '">' + esc(p.titel) + '</a>';
        })
        .join(' · ');
  };

  Guide.prototype.laggIKorg = function (knapp) {
    var self = this;
    var t = this.rot.dataset;
    var original = knapp.textContent;
    knapp.disabled = true;
    knapp.textContent = t.textLagger || 'Lägger i varukorgen …';
    fetch(window.Shopify && window.Shopify.routes && window.Shopify.routes.root
      ? window.Shopify.routes.root + 'cart/add.js'
      : '/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/javascript' },
      body: JSON.stringify({ items: [{ id: Number(knapp.dataset.variant), quantity: 1 }] }),
    })
      .then(function (r) {
        if (!r.ok) throw new Error('cart/add ' + r.status);
        return r.json();
      })
      .then(function () {
        knapp.textContent = t.textLagd || 'Lagd i varukorgen ✓';
        self.uppdateraKorg();
      })
      .catch(function () {
        // Går AJAX-vägen inte fram tar vi den vanliga: formuläret i kassan.
        knapp.disabled = false;
        knapp.textContent = original;
        window.location.href = '/cart/' + knapp.dataset.variant + ':1';
      });
  };

  /** Dawns korgbubbla och korglåda uppdateras genom att hämta om deras
   *  sektioner. Utan det står siffran kvar på noll och kunden tror att
   *  knappen inte gjorde något. */
  Guide.prototype.uppdateraKorg = function () {
    fetch('/?sections=cart-icon-bubble,cart-drawer')
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        Object.keys(data).forEach(function (namn) {
          var mal = document.getElementById('shopify-section-' + namn);
          if (!mal) return;
          var tmp = document.createElement('div');
          tmp.innerHTML = data[namn];
          var ny = tmp.querySelector('#shopify-section-' + namn);
          mal.innerHTML = ny ? ny.innerHTML : data[namn];
        });
        document.dispatchEvent(new CustomEvent('ms:cart-updated'));
      })
      .catch(function () {
        /* korgen uppdateras vid nästa sidladdning — inget att säga till om */
      });
  };

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function start() {
    var rotar = document.querySelectorAll('[data-ms-gavoguide]');
    for (var i = 0; i < rotar.length; i++) {
      if (rotar[i].dataset.msGuideStartad) continue;
      rotar[i].dataset.msGuideStartad = '1';
      new Guide(rotar[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  // Temaredigeraren river och bygger om sektionen vid varje ändring.
  document.addEventListener('shopify:section:load', start);
})();
