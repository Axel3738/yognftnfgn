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

  function productForm(el) {
    // Temats eget köpformulär. Först inom sektionen, annars första på sidan.
    var scope = el.closest('[id^="shopify-section"]') || document;
    return scope.querySelector('form[action*="/cart/add"]') ||
           document.querySelector('form[action*="/cart/add"]');
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

      var cutEl = this.querySelector('[data-ms-delivery-cut]');
      if (cutEl && cutoff !== null && !isNaN(cutoff)) {
        if (missedCutoff) {
          cutEl.textContent = 'Beställningar efter ' + pad(cutoff) + ':00 packas nästa arbetsdag.';
        } else {
          var mins = (cutoff * 60) - (now.getHours() * 60 + now.getMinutes());
          var h = Math.floor(mins / 60), m = mins % 60;
          cutEl.textContent = 'Beställ inom ' + (h > 0 ? h + ' tim ' : '') + m + ' min så packas den idag.';
        }
        cutEl.hidden = false;
      }
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


  /* --- registrering ----------------------------------------------------- */

  function define(name, ctor) {
    if (!customElements.get(name)) customElements.define(name, ctor);
  }

  define('ms-sticky-atc', MsStickyAtc);
  define('ms-bundle', MsBundle);
  define('ms-delivery', MsDelivery);
  define('ms-countdown', MsCountdown);

  // Exponera hjälparna för A/B-motorn och för felsökning i konsolen.
  window.MS = window.MS || {};
  window.MS.money = money;
  window.MS.productForm = productForm;
})();
