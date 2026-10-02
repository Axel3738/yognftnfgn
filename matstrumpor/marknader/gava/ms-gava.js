/* ==========================================================================
   ms-gava.js — gåvan följer varje låda (Matstrumpor)
   --------------------------------------------------------------------------
   Axel 2026-10-02: "ätpinnar ska alltid vara en gratis gåva som följer med
   varje enskild box" — också när kunden ändrar antalet i varukorgen.

   Paketväljaren (ms-paket.js) lägger lika många par ätpinnar som lådor och en
   rabattkod. Men korgen lät kunden ändra antalet fritt, och då blev det fel
   (mätt i ordrarna och i Shopifys egen prisräkning, matstrumpor/marknader/gava.mjs):
     - fler lådor: ätpinnarna följde inte med;
     - samma paket två gånger: koden gällde en gång per order, och ätpinnarna
       åt upp den gratis lådan — 4 lådor + 4 par kostade 1 646 kr, inte 798;
     - ätpinnarna borttagna: köp-X-få-Y kräver hela sin "få"-mängd, så hela
       paketrabatten försvann.

   Efter varje ändring i vagnen håller den här filen den i takt:
     1. Ätpinnarna blir lika många som lådorna (sorterna som har en gåva).
     2. Koderna som hör ihop ligger i vagnen tillsammans. Shopify räknar själv
        fram den som ger lägst pris, och kassan visar bara den som används:
          - köp-X-få-Y (variant A, utlandet, donut/pizza/hamburgare): EN av
            paketkoderna (alla är "köp 1, få 3 av alla sorter + ätpinnar", utan
            gräns per order) och hjälpkoderna för udda antal lådor;
          - fastpris (variant B i Sverige): alla tre nivåernas koder.
        Shopify räknar högst fem koder per vagn, så andra koder (vännens) läggs
        först och hjälpkoderna sist.
     3. Lådan och korgsidan ritas om ur Shopifys sektions-API.
   Gåvoraden går inte att ändra eller ta bort i korgen (cart-drawer.liquid,
   main-cart-items.liquid). Allt annat i vagnen rörs aldrig.
   ========================================================================== */

(function () {
  'use strict';

  var cfg;
  try { cfg = JSON.parse(document.getElementById('ms-gava-config').textContent); } catch (e) { cfg = null; }
  if (!cfg || !cfg.nivaer || !cfg.nivaer.length) return;

  var MAX_KODER = 5; // mätt 2026-10-02: en sjätte kod i vagnen räknas inte alls
  var rutt = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  function STOR(s) { return String(s || '').trim().toUpperCase(); }
  function noop() {}
  function unik(lista) {
    var sett = {}, ut = [];
    lista.forEach(function (x) { var k = STOR(x); if (x && !sett[k]) { sett[k] = true; ut.push(x); } });
    return ut;
  }

  var nivaer = cfg.nivaer.filter(function (n) { return n && n.kod && n.produkt && n.gava; });
  var udda = (cfg.udda || []).filter(Boolean);
  var gavaFor = {};
  nivaer.forEach(function (n) { gavaFor[String(n.produkt)] = String(n.gava); });
  var gavor = unik(nivaer.map(function (n) { return String(n.gava); }));
  // Köp-X-få-Y-nivåerna. Testnivåer (ab "b", mixtestet) sist, så en riktig paketkod väljs först.
  var bogo = nivaer.filter(function (n) { return Number(n.bogo) > 0; })
    .sort(function (a, b) { return (a.ab === 'b') - (b.ab === 'b'); });
  var bogoKoder = unik(bogo.map(function (n) { return n.kod; })).map(STOR);
  var uddaKoder = udda.map(STOR);
  var fast = {};
  nivaer.filter(function (n) { return !(Number(n.bogo) > 0); }).forEach(function (n) {
    var g = String(n.produkt) + '|' + (n.ab || '');
    if (!fast[g]) fast[g] = { produkt: String(n.produkt), koder: [] };
    fast[g].koder.push(n.kod);
  });
  var fastGrupper = Object.keys(fast).map(function (g) { return fast[g]; });
  var paketkod = {};
  bogoKoder.concat(uddaKoder).forEach(function (c) { paketkod[c] = true; });
  fastGrupper.forEach(function (g) { g.koder.forEach(function (c) { paketkod[STOR(c)] = true; }); });

  /* Ren: vad ska ändras i den här vagnen? behall = koden paketväljaren just lade på. */
  function plan(vagn, behall) {
    var items = (vagn && vagn.items) || [];
    var koder = ((vagn && vagn.discount_codes) || []).map(function (d) { return d.code; });
    var har = koder.map(STOR);
    var b = STOR(behall);
    var harBogo = har.some(function (c) { return bogoKoder.indexOf(c) !== -1 || uddaKoder.indexOf(c) !== -1; })
      || (b && bogoKoder.indexOf(b) !== -1);
    var fastHar = fastGrupper.filter(function (g) {
      return g.koder.some(function (c) { var s = STOR(c); return har.indexOf(s) !== -1 || s === b; });
    });

    var ovriga = koder.filter(function (c) { return !paketkod[STOR(c)]; });
    var onskade = ovriga.slice();
    var sorter = null; // de sorter vars lådor får en gåva var

    if (harBogo) {
      var e = (b && bogoKoder.indexOf(b) !== -1) ? behall
        : koder.filter(function (c) { return bogoKoder.indexOf(STOR(c)) !== -1; })[0];
      if (!e) {
        // Bara hjälpkoder kvar: paketkoden för en sort som ligger i vagnen.
        var iVagn = bogo.filter(function (n) {
          return items.some(function (i) { return String(i.product_id) === String(n.produkt); });
        })[0] || bogo[0];
        e = iVagn && iVagn.kod;
      }
      // En fastpriskod som just lades på får ligga kvar, så paketväljarens kontroll hittar den.
      if (b && bogoKoder.indexOf(b) === -1 && paketkod[b]) onskade.push(behall);
      if (e) onskade.push(e);
      udda.forEach(function (c) { onskade.push(c); });
      sorter = {};
      bogo.forEach(function (n) { sorter[String(n.produkt)] = true; });
    } else if (fastHar.length) {
      sorter = {};
      fastHar.forEach(function (g) {
        g.koder.forEach(function (c) { onskade.push(c); });
        sorter[g.produkt] = true;
      });
    }
    onskade = unik(onskade).slice(0, MAX_KODER);

    var updates = {};
    gavor.forEach(function (g) {
      var lador = 0, laderAllaSorter = 0;
      var gavorader = [];
      items.forEach(function (i) {
        var p = String(i.product_id);
        if (String(i.variant_id) === g) { gavorader.push(i); return; }
        if (gavaFor[p] !== g) return;
        laderAllaSorter += i.quantity;
        if (sorter && sorter[p]) lador += i.quantity;
      });
      var par = gavorader.reduce(function (s, i) { return s + i.quantity; }, 0);
      var mal = sorter ? lador : (par > 0 && laderAllaSorter === 0 ? 0 : par); // utan paketkod: bara ensamma ätpinnar bort
      if (mal === par) return;
      // Shopify delar gåvan på flera rader när en rabatt bara gäller en del av den (mätt 2026-10-02:
      // 1 låda + 2 par = en gratis rad och en betald). Varianten som nyckel ändrar bara den första
      // raden, så med flera rader sätts den första till målet och de andra till noll, med radnycklar.
      if (gavorader.length <= 1 || !gavorader.every(function (i) { return i.key; })) { updates[g] = mal; return; }
      updates[gavorader[0].key] = mal;
      gavorader.slice(1).forEach(function (i) { updates[i.key] = 0; });
    });

    var koderAndras = !!sorter && (onskade.length !== koder.length
      || onskade.some(function (c, i) { return STOR(c) !== STOR(koder[i]); }));
    return {
      updates: updates,
      discount: koderAndras ? onskade.join(',') : null,
      andras: koderAndras || Object.keys(updates).length > 0
    };
  }

  function hamta() {
    return fetch(rutt + 'cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  /* Skrivningen. Lådan och korgsidan beställs i SAMMA anrop (Shopifys sections-parameter), så bilden
     kunden ser är exakt vagnen efter just den här skrivningen. Mätt 2026-10-02: en separat hämtning
     direkt efter en skrivning kunde visa vagnen från före den, och då pekade nästa klick på fel rad. */
  function skriv(p, delar) {
    var body = {};
    if (Object.keys(p.updates).length) body.updates = p.updates;
    if (p.discount !== null) body.discount = p.discount;
    if (delar && delar.length) {
      body.sections = unik(delar.map(function (d) { return d.section; })).join(',');
      body.sections_url = document.getElementById('main-cart-items') ? window.location.pathname : rutt;
    }
    return fetch(rutt + 'cart/update.js', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }

  var LASTA = ['main-cart-items', 'CartDrawer-CartItems'];
  function las(pa) {
    LASTA.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('ms-gava-pagar', pa);
    });
  }

  /* Delarna som ritas om — samma som temats egen cart.js (getSectionsToRender), utan att öppna lådan. */
  function delarAttRita() {
    var delar = [];
    if (document.getElementById('CartDrawer')) delar.push({ id: 'CartDrawer', section: 'cart-drawer', selector: '.drawer__inner' });
    if (document.getElementById('cart-icon-bubble')) delar.push({ id: 'cart-icon-bubble', section: 'cart-icon-bubble', selector: '.shopify-section' });
    var poster = document.getElementById('main-cart-items');
    if (poster && poster.dataset.id) delar.push({ id: 'main-cart-items', section: poster.dataset.id, selector: '.js-contents' });
    var fot = document.getElementById('main-cart-footer');
    if (fot && fot.dataset.id) delar.push({ id: 'main-cart-footer', section: fot.dataset.id, selector: '.js-contents' });
    return delar;
  }

  function rita(delar, sektioner, vagn) {
    if (!sektioner) return false;
    var ritat = false;
    delar.forEach(function (d) {
      var html = sektioner[d.section];
      var mal = document.getElementById(d.id);
      if (!html || !mal) return;
      var nytt = new DOMParser().parseFromString(html, 'text/html').querySelector(d.selector);
      if (!nytt) return;
      (mal.querySelector(d.selector) || mal).innerHTML = nytt.innerHTML;
      ritat = true;
    });
    var tom = !!vagn && vagn.item_count === 0;
    var lada = document.querySelector('cart-drawer');
    if (lada) lada.classList.toggle('is-empty', tom);
    var fot = document.getElementById('main-cart-footer');
    if (fot) fot.classList.toggle('is-empty', tom);
    var korg = document.querySelector('cart-items');
    if (korg) korg.classList.toggle('is-empty', tom);
    return ritat;
  }

  /* Reserv när svaret saknade sektionerna: hämta dem. Lådan via butikens rot — mätt 2026-10-02:
     produktsidans adress (/products/…?sections=cart-drawer) ritar lådan tom. */
  function ritaOm(vagn) {
    var delar = delarAttRita();
    var rot = delar.filter(function (d) { return d.id === 'CartDrawer' || d.id === 'cart-icon-bubble'; });
    var sida = delar.filter(function (d) { return rot.indexOf(d) === -1; });
    function hamtaRita(bas, del) {
      if (!del.length) return Promise.resolve();
      return fetch(bas + '?sections=' + unik(del.map(function (d) { return d.section; })).join(','), { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (s) { rita(del, s, vagn); })
        .catch(noop);
    }
    return Promise.all([hamtaRita(rutt, rot), hamtaRita(window.location.pathname, sida)]);
  }

  function vanta(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* Ett varv: läs → planera → skriv (med lådan i samma svar) → läs tillbaka. Fastnade inte ändringen
     (en annan skrivning mot samma vagn i samma stund) görs ETT försök till. */
  function ettVarv(opts, forsok) {
    return hamta().then(function (vagn) {
      if (!vagn) return { andrat: false, ritat: false, vagn: null };
      var p = plan(vagn, opts.behall);
      if (!p.andras) return { andrat: false, ritat: false, vagn: vagn };
      las(true);
      var delar = opts.tyst ? [] : delarAttRita();
      return skriv(p, delar).then(function (svar) {
        var ritat = !!svar && rita(delar, svar.sections, svar);
        return hamta().then(function (efter) {
          var kvar = efter ? plan(efter, opts.behall) : null;
          if (kvar && kvar.andras && forsok < 1) {
            return vanta(600).then(function () { return ettVarv(opts, forsok + 1); })
              .then(function (r) { return { andrat: true, ritat: r.andrat ? r.ritat : ritat, vagn: r.vagn || efter }; });
          }
          return { andrat: true, ritat: ritat, vagn: efter };
        });
      });
    });
  }

  var kedja = Promise.resolve();
  function synka(opts) {
    opts = opts || {};
    var jobb = kedja.then(function () {
      return ettVarv(opts, 0).then(function (r) {
        if (r.andrat && !opts.tyst && !r.ritat) return ritaOm(r.vagn).then(function () { return r; });
        return r;
      });
    }).then(function (r) { las(false); return r; }, function (e) { las(false); throw e; });
    kedja = jobb.catch(noop);
    return jobb;
  }

  window.MS = window.MS || {};
  window.MS.gava = { synka: synka, plan: plan };

  function start() {
    // Efter varje ändring i korgen (temats egen cart.js och produktformulär publicerar cartUpdate).
    if (typeof subscribe === 'function' && typeof PUB_SUB_EVENTS !== 'undefined') {
      var t = null;
      subscribe(PUB_SUB_EVENTS.cartUpdate, function (ev) {
        if (ev && ev.source === 'ms-gava') return;
        // Låst direkt: ett nytt klick innan lådan ritats om hade pekat på en rad som flyttat sig.
        las(true);
        clearTimeout(t);
        t = setTimeout(function () { synka({}); }, 150);
      });
    }
    // En vagn som ändrats någon annanstans (en annan flik, utan JavaScript, tillbaka från kassan).
    // Väntar in A/B-motorns efterstämpling, så två skrivningar inte möts.
    var bubbla = document.querySelector('#cart-icon-bubble .cart-count-bubble');
    if (bubbla || document.getElementById('main-cart-items')) setTimeout(function () { synka({}); }, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
