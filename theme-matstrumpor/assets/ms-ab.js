/* ==========================================================================
   ms-ab.js — A/B-testmotorn för Matstrumpor.se
   --------------------------------------------------------------------------
   Egen kod. Inga bibliotek, inga externa anrop, ingen tredjepartsapp.
   Laddas TIDIGT i <head> (utan defer) så rätt variant hinner visas innan
   sidan målas upp.

   Så funkar det, i tre steg:

   1. TILLDELNING  Varje ny besökare slantsinglas till A eller B och beslutet
                   sparas i en förstapartskaka i 30 dagar. Samma besökare ser
                   alltid samma variant, även vid återbesök.

   2. VISNING      Sidan renderar BÅDA varianterna, där B ligger dold med
                   attributet hidden. Motorn tar bort hidden från rätt variant.
                   Stängs JavaScript av ser man variant A — aldrig en trasig
                   sida, aldrig två varianter samtidigt.

   3. MÄTNING      Varianten skrivs in som ett cart attribute innan varan
                   läggs i kundvagnen. Attributet följer med hela vägen till
                   ordern, så utfallet går att läsa ur Shopify i efterhand
                   utan att vi behöver spara något själva.

   Läsning av resultatet: ab/analys.mjs i det här repot.
   ========================================================================== */

(function () {
  'use strict';

  var PREFIX = 'ms_ab_';
  var ATTR_PREFIX = 'AB ';       // syns som "AB buybox: b" på ordern
  var cfg = readConfig();
  var assigned = {};

  /* --- konfiguration ---------------------------------------------------- */

  function readConfig() {
    var el = document.getElementById('ms-ab-config');
    if (!el) return { tests: [], cookieDays: 30 };
    try {
      var parsed = JSON.parse(el.textContent);
      if (!parsed || !Array.isArray(parsed.tests)) return { tests: [], cookieDays: 30 };
      if (!parsed.cookieDays) parsed.cookieDays = 30;
      return parsed;
    } catch (e) {
      return { tests: [], cookieDays: 30 };
    }
  }

  /* --- kakor ------------------------------------------------------------ */

  function getCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? decodeURIComponent(m[2]) : null;
  }

  function setCookie(name, value, days) {
    var d = new Date();
    d.setTime(d.getTime() + days * 864e5);
    document.cookie = name + '=' + encodeURIComponent(value) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax';
  }

  /* --- tilldelning ------------------------------------------------------ */

  function pick(test) {
    // Vikter, default 50/50. Summan behöver inte vara 100.
    var variants = test.variants && test.variants.length ? test.variants : ['a', 'b'];
    var weights = test.weights && test.weights.length === variants.length
      ? test.weights
      : variants.map(function () { return 1; });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < variants.length; i++) {
      r -= weights[i];
      if (r <= 0) return variants[i];
    }
    return variants[variants.length - 1];
  }

  function assign(test) {
    var key = PREFIX + test.id;

    // Med ?ms_ab=buybox:b går det att tvinga fram en variant för granskning.
    // Tvingade besök markeras så att de går att räkna bort ur resultatet.
    var forced = new URLSearchParams(window.location.search).get('ms_ab');
    if (forced) {
      var bits = forced.split(':');
      if (bits[0] === test.id && bits[1]) {
        setCookie(key, bits[1], cfg.cookieDays);
        setCookie(key + '_forced', '1', cfg.cookieDays);
        return bits[1];
      }
    }

    var existing = getCookie(key);
    if (existing) return existing;

    var chosen = pick(test);
    setCookie(key, chosen, cfg.cookieDays);
    return chosen;
  }

  /* --- visning ---------------------------------------------------------- */

  function applyVisibility(root) {
    var nodes = (root || document).querySelectorAll('[data-ms-ab]');
    Array.prototype.forEach.call(nodes, function (el) {
      var spec = el.getAttribute('data-ms-ab').split(':');
      var testId = spec[0], variant = spec[1];
      if (!(testId in assigned)) return;          // testet är avstängt: lämna orört
      if (assigned[testId] === variant) el.removeAttribute('hidden');
      else el.setAttribute('hidden', '');
    });
  }

  /* --- mätning ---------------------------------------------------------- */

  function attributesPayload() {
    var attrs = {};
    Object.keys(assigned).forEach(function (id) {
      attrs[ATTR_PREFIX + id] = assigned[id];
      if (getCookie(PREFIX + id + '_forced')) attrs[ATTR_PREFIX + id + ' forced'] = 'ja';
    });
    return attrs;
  }

  var stamped = false;

  function stampCart() {
    // Skriver varianten till kundvagnen. Körs en gång per sidvisning, precis
    // innan varan läggs i kundvagnen, och returnerar ett löfte så att
    // anropande kod kan invänta det.
    if (stamped || !Object.keys(assigned).length) return Promise.resolve();
    stamped = true;
    return fetch(window.Shopify && window.Shopify.routes && window.Shopify.routes.root
        ? window.Shopify.routes.root + 'cart/update.js'
        : '/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ attributes: attributesPayload() })
    }).catch(function () { stamped = false; });
  }

  function beaconStamp() {
    // Reservväg för teman som gör en vanlig formulärpost i stället för fetch.
    // Bäst möjliga försök: sidan hinner lämnas, men beacon skickas ändå.
    if (!Object.keys(assigned).length || !navigator.sendBeacon) return;
    try {
      var blob = new Blob([JSON.stringify({ attributes: attributesPayload() })],
        { type: 'application/json' });
      navigator.sendBeacon('/cart/update.js', blob);
    } catch (e) { /* strunt samma */ }
  }

  function hookCartAdd() {
    // Fångar temats anrop till /cart/add och stämplar kundvagnen först.
    var origFetch = window.fetch;
    if (typeof origFetch === 'function') {
      window.fetch = function (input, init) {
        var url = typeof input === 'string' ? input : (input && input.url) || '';
        if (url.indexOf('/cart/add') !== -1) {
          var args = arguments;
          return stampCart().then(function () { return origFetch.apply(window, args); });
        }
        return origFetch.apply(window, arguments);
      };
    }

    // Klick på köpknappen: stämpla direkt, utan att blockera.
    document.addEventListener('click', function (ev) {
      var btn = ev.target && ev.target.closest &&
        ev.target.closest('form[action*="/cart/add"] [type="submit"], form[action*="/cart/add"] [name="add"]');
      if (btn) stampCart();
    }, true);

    // Klassisk formulärpost utan JavaScript-kundvagn.
    document.addEventListener('submit', function (ev) {
      var form = ev.target;
      if (form && form.action && form.action.indexOf('/cart/add') !== -1) beaconStamp();
    }, true);
  }

  function pushToAnalytics() {
    Object.keys(assigned).forEach(function (id) {
      var payload = { test_id: id, variant: assigned[id] };
      if (typeof window.gtag === 'function') window.gtag('event', 'ms_ab_exposure', payload);
      if (typeof window.fbq === 'function') window.fbq('trackCustom', 'MsAbExposure', payload);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: 'ms_ab_exposure' }, payload));
    });
  }

  /* --- start ------------------------------------------------------------ */

  cfg.tests.forEach(function (test) {
    if (!test || !test.id || test.active === false) return;
    assigned[test.id] = assign(test);
    document.documentElement.setAttribute('data-ms-ab-' + test.id, assigned[test.id]);
  });

  applyVisibility();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      applyVisibility();
      hookCartAdd();
      pushToAnalytics();
    });
  } else {
    hookCartAdd();
    pushToAnalytics();
  }

  // Sektioner som laddas om i temaredigeraren måste få varianten applicerad igen.
  document.addEventListener('shopify:section:load', function (e) { applyVisibility(e.target); });

  window.MS = window.MS || {};
  window.MS.ab = {
    variants: assigned,
    of: function (id) { return assigned[id] || null; },
    apply: applyVisibility
  };
})();
