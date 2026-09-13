/* ==========================================================================
   ms-paket.js — paketnivåerna i köprutan
   --------------------------------------------------------------------------
   Ligger separat från ms-cro.js med flit: den här filen är den enda som rör
   pengar. Ett fel här betyder att sidan visar ett pris kassan inte ger, och
   då ska den vara lätt att läsa, testa och byta ut för sig.

   Fem saker skiljer den från en vanlig antalsväljare, och alla fem finns för
   att priset på sidan MÅSTE vara priset kassan tar:

     1. Rabatten är ett BELOPP, inte en procent — precis som Shopifys
        rabattkod fungerar. Därför blir priset rätt även när kunden byter
        variant (3-par kostar mindre än 5-par, men avdraget är detsamma).
     2. Varje nivå bär med sig sin rabattkod. Saknas koden visar Liquid
        fullpris, och då finns inget att dra av här heller.
     3. Koden läggs på EFTER varorna, via /discount/<kod>. Shopifys egen väg,
        ingen app. Ordningen är mätt, inte vald — se kop() längre ner.
     4. Köpet fångas i fångstfasen, så temats egen köplyssnare aldrig kör.
        Kör båda hamnar varorna i vagnen två gånger.
     5. Direktkassan ("Köp nu"/Shop Pay) är avstängd i produktmallen, för den
        går förbi både koden och gratisprodukten. direktkop() nedan är kvar
        som skyddsnät om någon slår på inställningen igen.

   Den här filen ägs av OPS Factory (factory/tema/assets/ms-paket.js) och
   skrivs till varje butik av fabriken. Ändra den HÄR, aldrig i en enskild
   butiks tema — annars lever butikerna isär.

   VARIANTVAL PER ENHET (Axels beslut 2026-09-10): varje nivå har lika många
   rullgardiner som antalet (data-ms-val-enhet). Kunden kan välja olika färger
   per enhet, så köpet lägger EN rad per vald variant (grupperat på id) i
   stället för en rad med quantity = antal. Priset räknas på summan av de
   valda varianternas priser — inte styckpris × antal — så det stämmer även
   om varianterna skulle kosta olika.
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

      this.kopplaVal();
      this.kopplaKnapp();
      var vald = this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      vald.checked = true;
      this.onChange({ target: vald });
    }

    /* Rullgardinerna. En knapp öppnar listan, ett klick på ett alternativ
       skriver bild + namn + id i knappen och räknar om korten. Bara den valda
       nivåns rutor visas. Temats egen pill-väljare göms när vi har egna
       rutor — två färgväljare på samma sida är en garanterad felklick. */
    kopplaVal() {
      var self = this;
      this.egenVal = this.dataset.egenVal === '1' && !!this.querySelector('[data-ms-val]');
      if (!this.egenVal) return;

      var scope = this.closest('[id^="shopify-section"]') || document;
      Array.prototype.forEach.call(scope.querySelectorAll('variant-selects, .product-form__input--pill, .product-form__input--swatch'), function (el) {
        el.hidden = true;
      });

      this.addEventListener('click', function (ev) {
        var knapp = ev.target.closest('[data-ms-val-knapp]');
        var alt = ev.target.closest('.ms-val__alt');
        if (knapp && self.contains(knapp)) {
          ev.preventDefault();
          var oppen = knapp.getAttribute('aria-expanded') === 'true';
          self.stangAlla();
          if (!oppen) {
            knapp.setAttribute('aria-expanded', 'true');
            knapp.nextElementSibling.hidden = false;
          }
          return;
        }
        if (alt && self.contains(alt)) {
          ev.preventDefault();
          self.valj(alt);
        }
      });
      document.addEventListener('click', function (ev) {
        if (!self.contains(ev.target)) self.stangAlla();
      });
      this.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') self.stangAlla();
      });
    }

    stangAlla() {
      Array.prototype.forEach.call(this.querySelectorAll('[data-ms-val-knapp][aria-expanded="true"]'), function (k) {
        k.setAttribute('aria-expanded', 'false');
        k.nextElementSibling.hidden = true;
      });
    }

    valj(alt) {
      var ruta = alt.closest('.ms-val');
      var knapp = ruta.querySelector('[data-ms-val-knapp]');
      knapp.dataset.id = alt.dataset.id;
      var namn = knapp.querySelector('[data-ms-val-namn]');
      if (namn) namn.textContent = alt.dataset.namn;
      var bild = knapp.querySelector('[data-ms-val-bild]');
      if (bild && bild.tagName === 'IMG' && alt.dataset.bild) bild.src = alt.dataset.bild;
      Array.prototype.forEach.call(ruta.querySelectorAll('.ms-val__alt'), function (li) {
        var ar = li === alt;
        li.classList.toggle('is-vald', ar);
        li.setAttribute('aria-selected', ar ? 'true' : 'false');
      });
      this.stangAlla();

      // Första enheten styr temats formulär (bild i galleriet, sticky-raden),
      // så att sidan följer med när kunden byter färg i ruta 1.
      if (ruta.dataset.msValEnhet === '1' && this.form) {
        var idFalt = this.form.querySelector('select[name="id"], input[name="id"]');
        if (idFalt && idFalt.value !== alt.dataset.id) {
          idFalt.value = alt.dataset.id;
          idFalt.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      this.rita();
      if (this.vald) this.onChange({ target: this.vald });
    }

    /* Variant-id per enhet för ett kort. Utan egna rutor: samma variant
       antal gånger — exakt som förr. */
    enheterFor(i) {
      var antal = Number(i.dataset.antal || 1);
      var opt = i.closest('.ms-paket__opt');
      var knappar = opt ? opt.querySelectorAll('[data-ms-val-knapp]') : [];
      if (this.egenVal && knappar.length === antal) {
        return Array.prototype.map.call(knappar, function (k) { return String(k.dataset.id); });
      }
      var id = this.variantId(), ut = [];
      for (var n = 0; n < antal; n++) ut.push(id);
      return ut;
    }

    /* Ordinarie pris för kortet = summan av de valda varianternas priser. */
    ordinarieFor(i) {
      var self = this, summa = 0, styck = this.styckpris();
      this.enheterFor(i).forEach(function (id) {
        var p = self.priser[id];
        summa += typeof p === 'number' ? p : styck;
      });
      return summa;
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

    /* Rabatten för ett kort. BOGO-nivåer (data-bogo > 0) skalar med
       variantpriset — gratisdelarna är X stycken av det man valt, inte ett
       fast belopp. Övriga nivåer använder det fasta beloppet från Liquid. */
    rabattFor(i, styck) {
      var bogo = Number(i.dataset.bogo || 0);
      var gvarde = Number(i.dataset.gratisVarde || 0);
      if (bogo > 0) return bogo * styck + gvarde;
      /* Procentnivåer skalar med priset, precis som procentrabattkoden i
         kassan. Ett fast belopp här hade visat svenska kronor på den norska
         sidan. */
      var procent = Number(i.dataset.procent || 0);
      if (procent > 0 && !gvarde) {
        return Math.round((this.ordinarieFor(i) * procent) / 100);
      }
      return Number(i.dataset.rabatt || 0);
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
      var self = this;
      var enhet = this.dataset.enhet || 'st';
      this.inputs.forEach(function (i) {
        var antal = Number(i.dataset.antal || 1);
        var rabatt = self.rabattFor(i, styck);
        var gvarde = Number(i.dataset.gratisVarde || 0);
        var ordinarie = self.ordinarieFor(i) + gvarde;
        var nu = Math.max(0, ordinarie - rabatt);
        var kort = i.nextElementSibling;
        function satt(sel, v) {
          var el = kort && kort.querySelector(sel);
          if (el) el.textContent = v;
        }
        satt('[data-ms-paket-nu]', money(nu, format));
        satt('[data-ms-paket-forr]', money(ordinarie, format));
        satt('[data-ms-paket-styck]', money(Math.round(nu / antal), format) + ' per ' + enhet);
        var spar = i.parentElement.querySelector('[data-ms-paket-spar]');
        if (spar && rabatt > 0) spar.textContent = 'Du sparar ' + money(rabatt, format);
      });
    }

    onChange(ev) {
      this.vald = ev.target;

      // Antalet skrivs in i temats EGET formulär, så temats köpknapp fungerar
      // som vanligt även om vår egen kod skulle utebli. Ett gömt kort
      // (A/B-förloraren) skriver aldrig — annars bestämmer kortet kunden inte
      // ser hur många varor temats egen köpknapp lägger i.
      if (this.form && !this.doljd()) {
        var q = this.form.querySelector('input[name="quantity"]');
        if (!q) {
          q = document.createElement('input');
          q.type = 'hidden';
          q.name = 'quantity';
          this.form.appendChild(q);
        }
        q.value = this.vald.dataset.antal || '1';
      }
      if (this.egenVal) {
        var valdOpt = this.vald.closest('.ms-paket__opt');
        Array.prototype.forEach.call(this.querySelectorAll('[data-ms-val]'), function (el) {
          el.hidden = el.closest('.ms-paket__opt') !== valdOpt;
        });
        this.stangAlla();
      }
      this.rita();
      this.direktkop(!this.vald.dataset.kod);

      var styck = this.styckpris();
      var antal = Number(this.vald.dataset.antal || 1);
      var gvarde = Number(this.vald.dataset.gratisVarde || 0);
      var rabatt = this.rabattFor(this.vald, styck);
      var ordinarie = this.ordinarieFor(this.vald) + gvarde;
      document.dispatchEvent(new CustomEvent('ms:variant', {
        detail: {
          id: this.variantId(),
          quantity: antal,
          price: Math.max(0, ordinarie - rabatt),
          compareAtPrice: ordinarie
        }
      }));
    }

    kopplaKnapp() {
      if (!this.form) return;
      this.knapp = this.form.querySelector('[type="submit"], [name="add"]');
      if (!this.knapp) return;

      // Lyssnar i FÅNGSTFASEN på document, inte på formuläret självt.
      //
      // Temat har en egen köplyssnare på samma formulär. Ligger vår bredvid
      // körs båda, och kunden får varorna i vagnen två gånger. Fångstfasen
      // når oss innan händelsen hunnit fram till formuläret, så
      // stopImmediatePropagation i kop() gör att bara vår kod kör.
      //
      // Att det inte redan smällt beror på att temats lyssnare råkar krascha
      // på en spinner som saknas i markupen. Det är tur, inte konstruktion,
      // och tur duger inte i den kod som rör pengar.
      document.addEventListener('submit', this.kop.bind(this), true);
    }

    /* Är det HÄR kortet gömt?

       A/B-motorn (ms-ab.js) tar aldrig bort den förlorande varianten — den
       sätter bara `hidden` på omslaget. Elementet finns alltså kvar, dess
       connectedCallback har kört, och dess köplyssnare sitter på samma
       document och samma formulär som vinnarens. Gömd är inte borttagen. */
    doljd() {
      var el = this;
      while (el && el.nodeType === 1) {
        if (el.hasAttribute('hidden')) return true;
        el = el.parentElement;
      }
      return !this.getClientRects().length;
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

    /* Lägger i kundvagnen och öppnar temats egen kundvagnslåda.

       ORDNINGEN ÄR MÄTT, INTE VALD (2026-09-09, mot heimguard.se och
       tankguard.se live). Varorna läggs i FÖRST, rabattkoden EFTER.

       Förut låg koden först, med motiveringen att vagnen då skulle vara
       rabatterad redan när lådan ritas. Det stämmer inte: /discount/<kod>
       fäster INTE på en tom kundvagn. Koden föll bort, kontrollera() nedan
       hittade den inte, och reservvägen laddaOm() kastade kunden till /cart.
       Det var precis vad kunden såg vid sitt FÖRSTA köp — det köp som annars
       skulle ha öppnat lådan.

       Mätt på heimguard.se, 2-pack med PAKET2 i en tom vagn:
         koden först  → discount_codes [] · 0 kr rabatt · 1 598 kr · redirect
         varorna först → PAKET2 applicable · 405 kr rabatt · 1 193 kr · låda

       Lådan hämtas därför i ett EGET sektionsanrop efter att koden fästs, så
       att siffran kunden ser i lådan är den kassan tar. Ett extra anrop är
       billigare än ett pris som inte håller.

       `?redirect=/cart.js` gör att omdirigeringen landar på kundvagnen som
       JSON i stället för på startsidan. Några hundra byte i stället för en
       hel sida, på mobil.

       Lådan ritas om med temats egen renderContents(), samma väg som temats
       vanliga köpknapp går. Finns ingen låda (butiken kan vara inställd på
       kundvagnssida) laddar vi om till /cart som förr. */
    kop(ev) {
      if (ev.target !== this.form || !this.vald) return;

      // Ett gömt kort (A/B-förloraren) köper aldrig något. Utan den här raden
      // kör båda korten samma submit: varorna hamnar i vagnen två gånger och
      // två rabattkoder tävlar om samma session.
      if (this.doljd()) return;

      // Och samma submit hanteras bara en gång, hur många kort som än finns.
      if (ev.msPaketHanterad) return;
      ev.msPaketHanterad = true;

      ev.preventDefault();
      // stopPropagation räcker inte: syskonkortet lyssnar på SAMMA nod
      // (document) och nås ändå. Bara stopImmediatePropagation stoppar det.
      ev.stopImmediatePropagation();

      var rutt = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      var antal = Number(this.vald.dataset.antal || 1);
      var kod = this.vald.dataset.kod || '';
      var gvariant = this.vald.dataset.gratisVariant;
      var gantal = Number(this.vald.dataset.gratisAntal || 0);

      // En rad per vald variant, grupperat: två gånger "Svart" blir
      // { id: svart, quantity: 2 }, aldrig två rader med samma id.
      var grupper = {};
      this.enheterFor(this.vald).forEach(function (id) { grupper[id] = (grupper[id] || 0) + 1; });
      var varor = Object.keys(grupper).map(function (id) { return { id: Number(id), quantity: grupper[id] }; });
      if (!varor.length) varor = [{ id: Number(this.variantId()), quantity: antal }];
      if (gvariant && gantal > 0) varor.push({ id: Number(gvariant), quantity: gantal });

      var self = this;
      var knapp = this.knapp;
      var text = knapp.textContent;
      var fel = this.fel;
      knapp.disabled = true;
      knapp.textContent = 'Lägger i…';
      if (fel) fel.hidden = true;

      function aterstall() {
        knapp.disabled = false;
        knapp.textContent = text;
      }

      // Reservvägen. Den laddar om sidan, men den fungerar alltid.
      function laddaOm() {
        window.location.href = kod
          ? rutt + 'discount/' + encodeURIComponent(kod) + '?redirect=' + encodeURIComponent('/cart')
          : rutt + 'cart';
      }

      var lada = document.querySelector('cart-drawer');

      // 1. Varorna i vagnen.
      fetch(rutt + 'cart/add.js', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ items: varor })
      }).then(function (svar) {
        if (!svar.ok) {
          return svar.json().then(function (d) {
            throw new Error(d.description || d.message || 'Kunde inte lägga i varukorgen.');
          });
        }
        return svar.json();
      }).then(function () {
        // 2. Rabattkoden — NU, när vagnen har varor och koden kan fästa.
        //    Går den fel fortsätter vi ändå: kontrollera() nedan fångar det.
        if (!kod) return null;
        return fetch(
          rutt + 'discount/' + encodeURIComponent(kod) + '?redirect=' + encodeURIComponent('/cart.js'),
          { credentials: 'same-origin' }
        ).catch(function () { return null; });
      }).then(function () {
        // 3. Lådan hämtas färsk, med det rabatterade priset i sig.
        if (!lada || !lada.renderContents || !lada.getSectionsToRender) return null;
        var idn = lada.getSectionsToRender().map(function (s) { return s.id; }).join(',');
        return fetch(rutt + '?sections=' + idn, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' }
        }).then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      }).then(function (sektioner) {
        aterstall();
        if (lada && sektioner && sektioner['cart-drawer']) {
          try {
            lada.renderContents({ sections: sektioner });
            // Var kundvagnen tom när sidan laddades är lådan märkt is-empty
            // på själva <cart-drawer>. Temats omritning tar bara bort märket
            // från insidan, och CSS:en gömmer då hela produktlistan
            // (.is-empty .cart__contents { display: none }) — kunden ser
            // summan men inte varorna. Drabbar exakt första köpet i en tom
            // vagn, därför städas märket här.
            lada.classList.remove('is-empty');
            var inre = lada.querySelector('.drawer__inner');
            if (inre) inre.classList.remove('is-empty');
            self.kontrollera(rutt, kod, laddaOm);
            return;
          } catch (e) { /* lådan gick inte att rita — ta reservvägen */ }
        }
        laddaOm();
      }).catch(function (e) {
        aterstall();
        if (fel) {
          fel.textContent = e.message || 'Det gick inte att lägga i varukorgen. Försök igen.';
          fel.hidden = false;
        }
      });
    }

    /* Sista kontrollen: fastnade koden verkligen?

       Saknas den helt i kundvagnen gick /discount-anropet fel, och då tar vi
       reservvägen — hellre en extra sidladdning än ett pris vi lovat men inte
       ger. Ligger koden där men är oanvändbar (för låg summa) hjälper ingen
       omladdning; då visar lådan redan den sanna siffran, och det är rätt. */
    kontrollera(rutt, kod, atgard) {
      if (!kod) return;
      fetch(rutt + 'cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (vagn) {
          var finns = (vagn.discount_codes || []).some(function (d) { return d.code === kod; });
          if (!finns) atgard();
        })
        .catch(function () { /* kunde inte kontrollera — låt lådan stå */ });
    }
  }

  if (!customElements.get('ms-paket')) customElements.define('ms-paket', MsPaket);
})();
