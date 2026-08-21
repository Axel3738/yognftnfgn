/* ==========================================================================
   ms-paket.js — paketnivåerna i köprutan
   --------------------------------------------------------------------------
   Ligger separat från ms-cro.js med flit: den här filen är den enda som rör
   pengar. Ett fel här betyder att sidan visar ett pris kassan inte ger, och
   då ska den vara lätt att läsa, testa och byta ut för sig.

   Tre saker skiljer den från en vanlig antalsväljare, och alla tre finns för
   att priset på sidan MÅSTE vara priset kassan tar:

     1. Rabatten är ett BELOPP, inte en procent — precis som Shopifys
        rabattkod fungerar. Därför blir priset rätt även när kunden byter
        variant (3-par kostar mindre än 5-par, men avdraget är detsamma).
     2. Varje nivå bär med sig sin rabattkod. Saknas koden visar Liquid
        fullpris, och då finns inget att dra av här heller.
     3. Vid köp läggs varorna i kundvagnen och koden appliceras via
        /discount/<kod> — Shopifys egen väg. Ingen app, ingen funktion.
     4. Temats direktkassa ("Köp nu"/Shop Pay) göms så länge ett rabatterat
        paket är valt — den vägen går förbi både koden och gratisprodukten.
   ========================================================================== */

(function () {
  'use strict';

  // Samma prisformatering som resten av temat. ms-cro.js exponerar den, men vi
  // klarar oss utan om den filen skulle utebli.
  function money(cents, format) {
    if (window.MS && window.MS.money) return window.MS.money(cents, format);
    return (cents / 100).toLocaleString('sv-SE') + ' kr';
  }

  // Köpformuläret letas upp här, inte via ms-cro.js. Den här filen rör pengar
  // och ska inte kunna ärva ett fel från en annan fil.
  //
  // Regeln: rätt formulär är det som HAR en köpknapp. Dawn renderar ett dolt
  // formulär FÖRE det riktiga — det saknar knapp och bär bara variantdata.
  // Binder man till det hamnar antalet och köplyssnaren i tomma intet, och
  // kunden får en vara till fullpris fast sidan lovat ett paket.
  function productForm(el) {
    var scope = el.closest('[id^="shopify-section"]') || document;
    var formar = scope.querySelectorAll('form[action*="/cart/add"]');
    if (!formar.length) formar = document.querySelectorAll('form[action*="/cart/add"]');
    for (var i = 0; i < formar.length; i++) {
      if (formar[i].querySelector('[type="submit"], [name="add"]')) return formar[i];
    }
    return formar[0] || null;
  }

  class MsPaket extends HTMLElement {
    connectedCallback() {
      this.inputs = Array.prototype.slice.call(this.querySelectorAll('.ms-paket__input'));
      if (!this.inputs.length) return;

      this.form = productForm(this);
      this.fel = this.querySelector('[data-ms-paket-fel]');
      try { this.priser = JSON.parse(this.dataset.varianter || '{}'); }
      catch (e) { this.priser = {}; }

      this.onChange = this.onChange.bind(this);
      this.rita = this.rita.bind(this);
      this.inputs.forEach(function (i) { i.addEventListener('change', this.onChange); }, this);

      // Byter kunden variant ändras grundpriset — då måste korten räknas om.
      if (this.form) {
        var idFalt = this.form.querySelector('select[name="id"], input[name="id"]');
        if (idFalt) idFalt.addEventListener('change', this.rita);
        this.form.addEventListener('change', this.rita);
      }

      this.kopplaKnapp();
      var vald = this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      vald.checked = true;
      this.onChange({ target: vald });
    }

    variantId() {
      var f = this.form && this.form.querySelector('select[name="id"], input[name="id"]');
      return f && f.value ? String(f.value) : Object.keys(this.priser)[0];
    }

    styckpris() {
      var p = this.priser[this.variantId()];
      if (typeof p === 'number') return p;
      var forsta = Object.keys(this.priser)[0];
      return forsta ? this.priser[forsta] : 0;
    }

    /* Räknar om alla kort mot den variant som är vald just nu.

       Utan variantpriser räknar vi INTE om. Liquid har redan skrivit rätt
       priser i korten, och ett tomt prisregister skulle ersätta dem med
       0 kr — ett fel som ser ut som en rea och inte som en krasch. Hellre
       priser som står stilla vid variantbyte än priser som är påhittade. */
    rita() {
      var styck = this.styckpris();
      if (!styck) return;
      var format = this.dataset.moneyFormat;
      this.inputs.forEach(function (i) {
        var antal = Number(i.dataset.antal || 1);
        var rabatt = Number(i.dataset.rabatt || 0);
        var gvarde = Number(i.dataset.gratisVarde || 0);
        var ordinarie = styck * antal + gvarde;
        var nu = Math.max(0, ordinarie - rabatt);
        var kort = i.nextElementSibling;
        function satt(sel, v) {
          var el = kort && kort.querySelector(sel);
          if (el) el.textContent = v;
        }
        satt('[data-ms-paket-nu]', money(nu, format));
        satt('[data-ms-paket-forr]', money(ordinarie, format));
        satt('[data-ms-paket-styck]', money(Math.round(nu / antal), format) + ' / st');
        var spar = i.parentElement.querySelector('[data-ms-paket-spar]');
        if (spar && rabatt > 0) spar.textContent = 'Du sparar ' + money(rabatt, format);
      });
    }

    onChange(ev) {
      this.vald = ev.target;

      // Antalet skrivs in i temats EGET formulär, så temats köpknapp fungerar
      // som vanligt även om vår egen kod skulle utebli.
      if (this.form) {
        var q = this.form.querySelector('input[name="quantity"]');
        if (!q) {
          q = document.createElement('input');
          q.type = 'hidden';
          q.name = 'quantity';
          this.form.appendChild(q);
        }
        q.value = this.vald.dataset.antal || '1';
      }
      this.rita();
      this.direktkop(!this.vald.dataset.kod);

      var styck = this.styckpris();
      var antal = Number(this.vald.dataset.antal || 1);
      var gvarde = Number(this.vald.dataset.gratisVarde || 0);
      var rabatt = Number(this.vald.dataset.rabatt || 0);
      document.dispatchEvent(new CustomEvent('ms:variant', {
        detail: {
          id: this.variantId(),
          quantity: antal,
          price: Math.max(0, styck * antal + gvarde - rabatt),
          compareAtPrice: styck * antal + gvarde
        }
      }));
    }

    kopplaKnapp() {
      if (!this.form) return;
      this.knapp = this.form.querySelector('[type="submit"], [name="add"]');
      if (!this.knapp) return;
      this.form.addEventListener('submit', this.kop.bind(this));
    }

    /* Direktkassan ("Köp nu" / Shop Pay) skickar formuläret förbi vår kod:
       ingen rabattkod, ingen gratisprodukt. Kunden skulle då se 399 kr på
       sidan och betala 798 kr i kassan. Så länge ett rabatterat paket är
       valt gömmer vi den därför. På 1-pack finns ingen rabatt att tappa,
       och då får den vara kvar. */
    direktkop(visa) {
      var rot = this.form || document;
      var knappar = rot.querySelectorAll('.shopify-payment-button, [data-shopify="payment-button"]');
      Array.prototype.forEach.call(knappar, function (el) {
        el.style.display = visa ? '' : 'none';
      });
    }

    kop(ev) {
      if (!this.vald) return;
      ev.preventDefault();

      var rutt = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      var antal = Number(this.vald.dataset.antal || 1);
      var kod = this.vald.dataset.kod || '';
      var gvariant = this.vald.dataset.gratisVariant;
      var gantal = Number(this.vald.dataset.gratisAntal || 0);

      var varor = [{ id: Number(this.variantId()), quantity: antal }];
      if (gvariant && gantal > 0) varor.push({ id: Number(gvariant), quantity: gantal });

      var text = this.knapp.textContent;
      var knapp = this.knapp;
      var fel = this.fel;
      knapp.disabled = true;
      knapp.textContent = 'Lägger i…';
      if (fel) fel.hidden = true;

      fetch(rutt + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ items: varor })
      }).then(function (svar) {
        if (!svar.ok) {
          return svar.json().then(function (d) {
            throw new Error(d.description || d.message || 'Kunde inte lägga i varukorgen.');
          });
        }
        // /discount/<kod> lägger på koden och skickar vidare. Utan kod går vi
        // rakt till kundvagnen — då finns ingen rabatt att applicera.
        window.location.href = kod
          ? rutt + 'discount/' + encodeURIComponent(kod) + '?redirect=' + encodeURIComponent('/cart')
          : rutt + 'cart';
      }).catch(function (e) {
        knapp.disabled = false;
        knapp.textContent = text;
        if (fel) {
          fel.textContent = e.message || 'Det gick inte att lägga i varukorgen. Försök igen.';
          fel.hidden = false;
        }
      });
    }
  }

  if (!customElements.get('ms-paket')) customElements.define('ms-paket', MsPaket);
})();
