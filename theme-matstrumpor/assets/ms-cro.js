/* ==========================================================================
   ms-cro.js — beteendet bakom konverteringsblocken på Matstrumpor.se
   --------------------------------------------------------------------------
   Egen kod. Inga bibliotek, inga externa anrop. Laddas med defer.

   Allt är web components: <ms-sticky-atc>, <ms-bundle>, <ms-delivery>,
   <ms-countdown>. Saknas elementet på sidan körs ingen kod alls.

   Grundprincip: blocken pratar med temats EGET produktformulär i stället för
   att bygga ett eget. Vi letar upp <form action="/cart/add">, sätter variant
   och antal där, och låter temat sköta resten. Det gör att bundle-väljaren
   fungerar även om temat byts ut.
   ========================================================================== */

(function () {
  'use strict';

  var TZ = 'Europe/Stockholm';

  /* --- små hjälpare ---------------------------------------------------- */

  function money(cents, format) {
    // Shopify anger pris i ören. format t.ex. "{{amount_no_decimals}} kr".
    var kr = cents / 100;
    var hasDecimals = Math.round(cents) % 100 !== 0;
    var text = kr.toLocaleString('sv-SE', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0
    });
    return (format || '{{amount}} kr').replace(/\{\{\s*amount[a-z_]*\s*\}\}/gi, text);
  }

  function kopformular(rot) {
    // Det formulär som faktiskt kan skicka en beställning är det som har en
    // köpknapp. Sista utvägen: första formuläret, som förr.
    var formar = rot.querySelectorAll('form[action*="/cart/add"]');
    for (var i = 0; i < formar.length; i++) {
      if (formar[i].querySelector('[type="submit"], [name="add"]')) return formar[i];
    }
    return formar[0] || null;
  }

  function productForm(el) {
    // Temats eget köpformulär. Först inom sektionen, annars första på sidan.
    // Dawn renderar ETT DOLT formulär före det riktiga — det saknar köpknapp
    // och används bara för variantdata. Tar man det första hamnar antalet
    // och köplyssnaren i tomma intet, och kunden får en vara till fullpris
    // fast sidan lovat ett paket. Därför väljs formuläret på knappen.
    var scope = el.closest('[id^="shopify-section"]') || document;
    return kopformular(scope) || kopformular(document);
  }

  function stockholmNow() {
    // Butiken är svensk: räkna brytpunkter i svensk tid, inte i besökarens.
    var parts = new Intl.DateTimeFormat('sv-SE', {
      timeZone: TZ, hour12: false,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).formatToParts(new Date()).reduce(function (acc, p) {
      acc[p.type] = p.value; return acc;
    }, {});
    return new Date(
      Number(parts.year), Number(parts.month) - 1, Number(parts.day),
      Number(parts.hour), Number(parts.minute), Number(parts.second)
    );
  }

  function addBusinessDays(from, days) {
    var d = new Date(from.getTime());
    var left = days;
    while (left > 0) {
      d.setDate(d.getDate() + 1);
      var wd = d.getDay();          // 0 = söndag, 6 = lördag
      if (wd !== 0 && wd !== 6) left--;
    }
    return d;
  }

  function svDate(date, withWeekday) {
    return new Intl.DateTimeFormat('sv-SE', withWeekday
      ? { weekday: 'long', day: 'numeric', month: 'long' }
      : { day: 'numeric', month: 'long' }
    ).format(date);
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }


  /* --- <ms-sticky-atc> -------------------------------------------------- */
  /* Visar en fast köpknapp när temats riktiga knapp scrollats förbi.
     Klick vidarebefordras till den riktiga knappen, så all temalogik
     (varianter, felmeddelanden, cart drawer) fungerar oförändrat.        */

  class MsStickyAtc extends HTMLElement {
    connectedCallback() {
      this.bar = this.querySelector('.ms-sticky');
      this.button = this.querySelector('.ms-sticky__btn');
      this.priceEl = this.querySelector('[data-ms-sticky-price]');
      this.wasEl = this.querySelector('[data-ms-sticky-was]');
      if (!this.bar || !this.button) return;

      this.form = productForm(this);
      this.target = this.form && this.form.querySelector('[type="submit"], [name="add"]');
      if (!this.target) { this.remove(); return; }

      this.button.addEventListener('click', this.forward.bind(this));

      // Visas när den riktiga knappen är utanför vyn.
      this.observer = new IntersectionObserver(this.onIntersect.bind(this), {
        rootMargin: '-10px 0px -10px 0px'
      });
      this.observer.observe(this.target);

      // Håll pris och tillgänglighet i takt med temats knapp.
      this.sync = this.sync.bind(this);
      this.mo = new MutationObserver(this.sync);
      this.mo.observe(this.target, { attributes: true, attributeFilter: ['disabled', 'aria-disabled'] });
      document.addEventListener('ms:variant', this.sync);
      this.sync();
    }

    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
      if (this.mo) this.mo.disconnect();
      document.removeEventListener('ms:variant', this.sync);
    }

    onIntersect(entries) {
      // Visas så fort temats riktiga köpknapp inte syns — oavsett om kunden
      // är ovanför eller nedanför den. Syns knappen är stickyn bara i vägen.
      this.bar.dataset.shown = String(!entries[0].isIntersecting);
    }

    sync(ev) {
      var off = this.target.disabled || this.target.getAttribute('aria-disabled') === 'true';
      this.button.disabled = off;
      var d = ev && ev.detail;
      if (d && this.priceEl) {
        this.priceEl.textContent = money(d.price, this.dataset.moneyFormat);
        if (this.wasEl) {
          var show = d.compareAtPrice && d.compareAtPrice > d.price;
          this.wasEl.hidden = !show;
          if (show) this.wasEl.textContent = money(d.compareAtPrice, this.dataset.moneyFormat);
        }
      }
    }

    forward(ev) {
      ev.preventDefault();
      // Scrolla fram köpblocket först, så kunden ser vad som händer.
      if (this.dataset.scrollTo !== 'false') {
        var box = this.target.closest('form');
        if (box) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      this.target.click();
    }
  }


  /* --- <ms-bundle> ------------------------------------------------------ */
  /* Paketväljaren. Två lägen:
       data-mode="variant"  → varje kort är en variant (t.ex. 3-par / 5-par)
       data-mode="quantity" → varje kort är ett antal av samma variant
     Båda skriver in i temats eget formulär.                               */

  class MsBundle extends HTMLElement {
    connectedCallback() {
      this.mode = this.dataset.mode === 'quantity' ? 'quantity' : 'variant';
      this.inputs = Array.prototype.slice.call(this.querySelectorAll('.ms-bundle__input'));
      if (!this.inputs.length) return;

      this.form = productForm(this);
      if (!this.form) return;

      this.onChange = this.onChange.bind(this);
      this.inputs.forEach(function (i) { i.addEventListener('change', this.onChange); }, this);

      var checked = this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      checked.checked = true;
      this.apply(checked, true);
    }

    onChange(ev) { this.apply(ev.target, false); }

    apply(input, initial) {
      var variantId = input.dataset.variantId;
      var qty = input.dataset.quantity || '1';

      if (this.mode === 'variant' && variantId) {
        this.setVariant(variantId);
        if (!initial) this.updateUrl(variantId);
      }
      this.setQuantity(qty);

      // Berätta för resten av sidan (sticky-knappen, prisrutor).
      document.dispatchEvent(new CustomEvent('ms:variant', {
        detail: {
          id: variantId,
          quantity: Number(qty),
          price: Number(input.dataset.price || 0),
          compareAtPrice: Number(input.dataset.compareAt || 0)
        }
      }));
    }

    setVariant(id) {
      // 1. Temats egen variantväljare, om den finns — då följer allt annat med.
      var native = this.form.querySelector('select[name="id"], input[name="id"]');
      if (native) {
        native.value = id;
        native.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      // 2. Annars lägger vi ett eget dolt fält.
      var hidden = this.form.querySelector('input[name="id"][data-ms-owned]');
      if (!hidden) {
        hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'id';
        hidden.setAttribute('data-ms-owned', '');
        this.form.appendChild(hidden);
      }
      hidden.value = id;
    }

    setQuantity(qty) {
      var q = this.form.querySelector('input[name="quantity"]');
      if (!q) {
        q = document.createElement('input');
        q.type = 'hidden';
        q.name = 'quantity';
        this.form.appendChild(q);
      }
      q.value = qty;
      q.dispatchEvent(new Event('change', { bubbles: true }));
    }

    updateUrl(id) {
      try {
        var u = new URL(window.location.href);
        u.searchParams.set('variant', id);
        window.history.replaceState({}, '', u);
      } catch (e) { /* gammal webbläsare: strunt samma */ }
    }
  }


  /* --- <ms-delivery> ---------------------------------------------------- */
  /* Räknar ut ett ärligt leveransfönster i arbetsdagar och skriver ut det
     på svenska. Har butiken en brytpunkt (t.ex. 14:00) räknas dagens order
     med bara om klockan är före den.                                      */

  class MsDelivery extends HTMLElement {
    connectedCallback() {
      var min = parseInt(this.dataset.minDays, 10);
      var max = parseInt(this.dataset.maxDays, 10);
      if (isNaN(min)) min = 5;
      if (isNaN(max)) max = 10;
      if (max < min) max = min;

      var now = stockholmNow();
      var cutoff = this.dataset.cutoffHour ? parseInt(this.dataset.cutoffHour, 10) : null;
      var start = new Date(now.getTime());
      var missedCutoff = false;

      if (cutoff !== null && !isNaN(cutoff)) {
        if (now.getHours() >= cutoff) { start = addBusinessDays(now, 1); missedCutoff = true; }
      }
      // Helg: packning startar först på måndag.
      var wd = start.getDay();
      if (wd === 0 || wd === 6) start = addBusinessDays(start, 1);

      var from = addBusinessDays(start, min);
      var to = addBusinessDays(start, max);

      var out = this.querySelector('[data-ms-delivery-range]');
      if (out) {
        out.textContent = (min === max)
          ? svDate(from, true)
          : svDate(from, false) + ' – ' + svDate(to, false);
      }

      this.cutEl = this.querySelector('[data-ms-delivery-cut]');
      this.cutoff = cutoff;
      if (this.cutEl && cutoff !== null && !isNaN(cutoff)) {
        // Nedräkningen tickar. En siffra som står still säger "ungefär",
        // en som räknar ner säger "nu" — det är hela poängen med den.
        this.tickCut = this.tickCut.bind(this);
        this.tickCut();
        this.timer = setInterval(this.tickCut, 1000);
        this.cutEl.hidden = false;
      }
    }

    disconnectedCallback() { clearInterval(this.timer); }

    tickCut() {
      var now = stockholmNow();
      var kvar = (this.cutoff * 3600) - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
      if (kvar <= 0) {
        this.cutEl.textContent = 'Beställningar efter ' + pad(this.cutoff) + ':00 packas nästa arbetsdag.';
        clearInterval(this.timer);
        return;
      }
      var h = Math.floor(kvar / 3600), m = Math.floor((kvar % 3600) / 60), sek = kvar % 60;
      this.cutEl.innerHTML = 'Beställ inom <strong>' +
        (h > 0 ? h + ' tim ' : '') + m + ' min ' + pad(sek) + ' s</strong> så packas den idag.';
    }
  }


  /* --- <ms-countdown> --------------------------------------------------- */
  /* Två lägen:
       data-until="2026-12-20T23:59"  → nedräkning till ett verkligt datum
       data-daily-hour="14"           → nedräkning till dagens brytpunkt
     Ingen falsk "återstartar varje besök"-timer. Är tiden ute göms blocket. */

  class MsCountdown extends HTMLElement {
    connectedCallback() {
      this.cells = {
        d: this.querySelector('[data-ms-cd="d"]'),
        h: this.querySelector('[data-ms-cd="h"]'),
        m: this.querySelector('[data-ms-cd="m"]'),
        s: this.querySelector('[data-ms-cd="s"]')
      };
      this.tick = this.tick.bind(this);
      this.tick();
      this.timer = setInterval(this.tick, 1000);
    }

    disconnectedCallback() { clearInterval(this.timer); }

    target() {
      var now = stockholmNow();
      if (this.dataset.until) {
        var t = new Date(this.dataset.until);
        return isNaN(t.getTime()) ? null : t;
      }
      var hour = parseInt(this.dataset.dailyHour, 10);
      if (isNaN(hour)) return null;
      var t2 = new Date(now.getTime());
      t2.setHours(hour, 0, 0, 0);
      if (t2 <= now) t2.setDate(t2.getDate() + 1);
      return t2;
    }

    tick() {
      var t = this.target();
      if (!t) { this.hidden = true; clearInterval(this.timer); return; }
      var ms = t.getTime() - stockholmNow().getTime();
      if (ms <= 0) {
        if (this.dataset.until) { this.hidden = true; clearInterval(this.timer); }
        return;
      }
      var s = Math.floor(ms / 1000);
      var d = Math.floor(s / 86400); s -= d * 86400;
      var h = Math.floor(s / 3600);  s -= h * 3600;
      var m = Math.floor(s / 60);    s -= m * 60;

      if (this.cells.d) {
        if (d > 0) { this.cells.d.textContent = pad(d); }
        else { var cell = this.cells.d.closest('.ms-countdown__cell'); if (cell) cell.hidden = true; }
      }
      if (this.cells.h) this.cells.h.textContent = pad(h);
      if (this.cells.m) this.cells.m.textContent = pad(m);
      if (this.cells.s) this.cells.s.textContent = pad(s);
    }
  }


  /* --- <ms-video> ------------------------------------------------------- */
  /* En mp4 som beter sig som en gif. Filen har preload="none" i HTML:en, så
     ingenting hämtas förrän rutan scrollas in i bild. Utanför bild pausas den
     igen — en video som spelar osynligt kostar batteri och data utan att
     någon ser den.                                                          */

  class MsVideo extends HTMLElement {
    connectedCallback() {
      this.el = this.querySelector('video');
      if (!this.el) return;

      // Safari på iOS kräver båda för att alls tillåta autoplay.
      this.el.muted = true;
      this.el.playsInline = true;
      this.el.setAttribute('playsinline', '');

      this.el.addEventListener('playing', function () {
        this.dataset.igang = 'true';
      }.bind(this), { once: true });

      this.observer = new IntersectionObserver(this.onSyns.bind(this), { threshold: 0.25 });
      this.observer.observe(this);

      var ljud = this.querySelector('.ms-video__ljud');
      if (ljud) ljud.addEventListener('click', this.toggleLjud.bind(this, ljud));
    }

    disconnectedCallback() { if (this.observer) this.observer.disconnect(); }

    onSyns(entries) {
      if (entries[0].isIntersecting) {
        // play() avvisas om webbläsaren ändå säger nej. Då låter vi det vara.
        var p = this.el.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        this.el.pause();
      }
    }

    toggleLjud(knapp) {
      this.el.muted = !this.el.muted;
      knapp.setAttribute('aria-pressed', String(!this.el.muted));
      knapp.setAttribute('aria-label', this.el.muted ? 'Slå på ljudet' : 'Stäng av ljudet');
      this.dataset.ljudPa = this.el.muted ? 'false' : 'true';
    }
  }


  /* --- <ms-multibundle> ------------------------------------------------- */
  /* "Köp alla fyra". Totalen räknas på de verkliga priserna i markeringarna —
     vi hittar aldrig på ett pris. Finns en rabatt är den en RIKTIG automatisk
     rabatt i Shopify, och då dras den i kassan, inte av oss.                */

  class MsMultibundle extends HTMLElement {
    connectedCallback() {
      this.kryss = Array.prototype.slice.call(this.querySelectorAll('.ms-mb__kryss'));
      this.knapp = this.querySelector('.ms-mb__knapp');
      this.netto = this.querySelector('[data-ms-mb-netto]');
      this.brutto = this.querySelector('[data-ms-mb-brutto]');
      this.fel = this.querySelector('[data-ms-mb-fel]');
      if (!this.kryss.length || !this.knapp) return;

      this.rabatt = Number(this.dataset.rabatt || 0);
      this.rakna = this.rakna.bind(this);
      this.kryss.forEach(function (k) { k.addEventListener('change', this.rakna); }, this);
      this.knapp.addEventListener('click', this.lagg.bind(this));
      this.rakna();
    }

    valda() {
      return this.kryss.filter(function (k) { return k.checked; });
    }

    rakna() {
      var valda = this.valda();
      var brutto = valda.reduce(function (a, k) { return a + Number(k.dataset.price || 0); }, 0);
      var netto = this.rabatt > 0 ? Math.round(brutto * (100 - this.rabatt) / 100) : brutto;
      var format = this.dataset.moneyFormat;
      if (this.netto) this.netto.textContent = money(netto, format);
      if (this.brutto) this.brutto.textContent = money(brutto, format);
      this.knapp.disabled = valda.length === 0;
    }

    lagg(ev) {
      ev.preventDefault();
      var valda = this.valda();
      if (!valda.length) return;

      var rutt = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      var text = this.knapp.textContent;
      this.knapp.disabled = true;
      this.knapp.textContent = 'Lägger i…';
      if (this.fel) this.fel.hidden = true;

      fetch(rutt + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          items: valda.map(function (k) {
            return { id: Number(k.dataset.variantId), quantity: 1 };
          })
        })
      }).then(function (svar) {
        if (!svar.ok) return svar.json().then(function (d) { throw new Error(d.description || d.message); });
        window.location.href = this.dataset.tillKassan ? rutt + 'checkout' : rutt + 'cart';
      }.bind(this)).catch(function (e) {
        this.knapp.disabled = false;
        this.knapp.textContent = text;
        if (this.fel) {
          this.fel.textContent = e.message || 'Det gick inte att lägga i varukorgen. Försök igen.';
          this.fel.hidden = false;
        }
      }.bind(this));
    }
  }


  /* --- <ms-slider> ------------------------------------------------------ */
  /* Spåret är ren CSS (scroll-snap) och fungerar utan den här koden. Det enda
     JavaScript gör är att lägga till prickar och hålla dem i takt — därför
     ligger de dolda i HTML:en tills vi vet att koden kört.                  */

  class MsSlider extends HTMLElement {
    connectedCallback() {
      this.spar = this.querySelector('.ms-rs__spar');
      this.prickar = this.querySelector('[data-ms-slider-dots]');
      if (!this.spar || !this.prickar) return;

      this.kort = Array.prototype.slice.call(this.spar.children);
      if (this.kort.length < 2) return;

      this.kort.forEach(function (kort, i) {
        var p = document.createElement('button');
        p.type = 'button';
        p.className = 'ms-rs__prick';
        p.setAttribute('aria-label', 'Visa omdöme ' + (i + 1));
        p.addEventListener('click', function () {
          kort.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        this.prickar.appendChild(p);
      }, this);
      this.prickar.hidden = false;

      this.observer = new IntersectionObserver(this.markera.bind(this), {
        root: this.spar, threshold: 0.6
      });
      this.kort.forEach(function (k) { this.observer.observe(k); }, this);
    }

    disconnectedCallback() { if (this.observer) this.observer.disconnect(); }

    markera(entries) {
      entries.forEach(function (e) {
        var i = this.kort.indexOf(e.target);
        var prick = this.prickar.children[i];
        if (prick) prick.dataset.aktiv = String(e.isIntersecting);
      }, this);
    }
  }


  /* --- storleksguiden --------------------------------------------------- */
  /* <dialog> sköter escape, fokusfälla och bakgrund själv. Vi kopplar bara
     knapparna, plus klick utanför rutan.                                    */

  document.addEventListener('click', function (ev) {
    var oppna = ev.target.closest && ev.target.closest('[data-ms-size-open]');
    if (oppna) {
      var ruta = document.getElementById(oppna.getAttribute('data-ms-size-open'));
      if (ruta && ruta.showModal) { ev.preventDefault(); ruta.showModal(); }
      return;
    }
    var stang = ev.target.closest && ev.target.closest('[data-ms-size-close]');
    if (stang) {
      var d = stang.closest('dialog');
      if (d) d.close();
      return;
    }
    // Klick på själva <dialog> är klick på bakgrunden — innehållet ligger i barnen.
    if (ev.target.tagName === 'DIALOG' && ev.target.classList.contains('ms-size__ruta')) {
      ev.target.close();
    }
  });


  /* --- registrering ----------------------------------------------------- */

  function define(name, ctor) {
    if (!customElements.get(name)) customElements.define(name, ctor);
  }

  define('ms-sticky-atc', MsStickyAtc);
  define('ms-bundle', MsBundle);
  define('ms-delivery', MsDelivery);
  define('ms-countdown', MsCountdown);
  define('ms-video', MsVideo);
  define('ms-multibundle', MsMultibundle);
  define('ms-slider', MsSlider);

  // Exponera hjälparna för A/B-motorn och för felsökning i konsolen.
  window.MS = window.MS || {};
  window.MS.money = money;
  window.MS.productForm = productForm;
})();
