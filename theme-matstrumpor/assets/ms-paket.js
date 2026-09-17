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
     3. Koden läggs på FÖRE varorna, via /discount/<kod>. Shopifys egen väg,
        ingen app. Ordningen gör att kundvagnen är rabatterad redan när den
        ritas — tvärtom hinner kunden se fullpris.
     4. Köpet fångas i fångstfasen, så temats egen köplyssnare aldrig kör.
        Kör båda hamnar varorna i vagnen två gånger.
     5. Direktkassan ("Köp nu"/Shop Pay) är avstängd i produktmallen, för den
        går förbi både koden och gratisprodukten. direktkop() nedan är kvar
        som skyddsnät om någon slår på inställningen igen.
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
      // Sidans egna varianter — de lådor som får ätpinnar i mixläget.
      this.egna = {};
      (this.dataset.egna || '').split(',').forEach(function (id) { if (id) this.egna[String(id)] = true; }, this);

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

      // Mixläget: byter kunden sort i en låda räknas kortet om, och kortet
      // vars låda rördes blir det valda.
      var self = this;
      Array.prototype.forEach.call(this.querySelectorAll('.ms-paket__sort'), function (sel) {
        sel.addEventListener('change', function () {
          // Raden visar det valda: namn (och pris) + sortens bild.
          var rad = sel.closest('.ms-paket__lada');
          var opt = sel.options[sel.selectedIndex];
          if (rad && opt) {
            var val = rad.querySelector('[data-ms-lada-val]');
            if (val) val.textContent = opt.textContent.trim();
            var bild = rad.querySelector('[data-ms-lada-bild]');
            if (bild && opt.dataset.bild) bild.src = opt.dataset.bild;
          }
          var label = sel.closest('.ms-paket__opt');
          var input = label && label.querySelector('.ms-paket__input');
          if (input && !input.checked) input.checked = true;
          if (input) self.onChange({ target: input }); else self.rita();
        });
      });

      var vald = this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      vald.checked = true;
      this.onChange({ target: vald });
    }

    variantId() {
      // Sortvalet (test "sortval"): en paketnivå för en ANNAN produkt än
      // sidans egen bär sitt variant-id själv — formulärets fält tillhör
      // sidans produkt och vore fel vara att lägga i vagnen.
      if (this.dataset.variantId) return String(this.dataset.variantId);
      var f = this.form && this.form.querySelector('select[name="id"], input[name="id"]');
      return f && f.value ? String(f.value) : Object.keys(this.priser)[0];
    }

    /* Ligger elementet gömt — i en A/B-variant kunden inte fick, eller i en
       sort som inte är vald — får det varken skriva i formuläret, skicka
       prishändelser eller lägga i vagnen. Annars kör fyra paketväljare på
       samma köpknapp och kunden får fyra sorter i vagnen. */
    inaktiv() {
      return this.hidden || this.closest('[hidden]') !== null;
    }

    /* Anropas när sortvalet visar den här paketväljaren: skriv antalet i
       formuläret och berätta för sticky-knappen vad som gäller nu. */
    aktivera() {
      var vald = this.vald || this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      if (vald) this.onChange({ target: vald });
    }

    /* --- mixläget (test "sortval") ------------------------------------
       Varje låda i ett paket har en egen sort. Kassan tar betalt för de
       dyraste lådorna och ger de billigaste gratis (så räknar Shopifys
       köp-X-få-Y), så det är exakt så vi räknar här. Ätpinnar följer
       bara med sushilådor — 1 par per låda. */
    mix() { return this.dataset.mix === '1'; }

    formVariantId() {
      var f = this.form && this.form.querySelector('select[name="id"], input[name="id"]');
      return f && f.value ? String(f.value) : Object.keys(this.priser)[0];
    }

    lador(i) {
      var label = i.closest('.ms-paket__opt');
      var val = label ? label.querySelectorAll('.ms-paket__sort') : [];
      var egen = this.formVariantId();
      var ut = [];
      for (var k = 0; k < val.length; k++) ut.push(val[k].value === 'egen' ? egen : String(val[k].value));
      return ut;
    }

    mixRakna(i) {
      var self = this;
      var ids = this.lador(i);
      var priser = ids.map(function (id) { return Number(self.priser[id] || 0); })
        .sort(function (a, b) { return b - a; });
      var antal = ids.length;
      var bogo = Number(i.dataset.bogo || 0);
      var betala = priser.slice(0, Math.max(0, antal - bogo)).reduce(function (a, b) { return a + b; }, 0);
      var brutto = priser.reduce(function (a, b) { return a + b; }, 0);
      var sushi = ids.filter(function (id) { return self.egna[id]; }).length;
      var pinnar = sushi * Number(i.dataset.pinnarPer || 0);
      var gvarde = pinnar * Number(i.dataset.pinnePris || 0);
      return { ids: ids, nu: betala, ordinarie: brutto + gvarde, rabatt: brutto + gvarde - betala, pinnar: pinnar, gvarde: gvarde };
    }

    ritaMix(i, format) {
      var r = this.mixRakna(i);
      var label = i.closest('.ms-paket__opt');
      function satt(sel, v) { var el = label && label.querySelector(sel); if (el) el.textContent = v; }
      satt('[data-ms-paket-nu]', money(r.nu, format));
      satt('[data-ms-paket-forr]', money(r.ordinarie, format));
      satt('[data-ms-paket-gava-antal]', String(r.pinnar));
      satt('[data-ms-paket-gava-varde]', money(r.gvarde, format));
      var spar = label && label.querySelector('[data-ms-paket-spar]');
      if (spar && r.rabatt > 0) spar.textContent = 'Du sparar ' + money(r.rabatt, format);
      var gava = label && label.querySelector('.ms-paket__gava');
      if (gava) gava.classList.toggle('ms-paket__gava--tom', r.pinnar === 0);
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
      return Number(i.dataset.rabatt || 0);
    }

    /* Räknar om alla kort mot den variant som är vald just nu.

       Utan variantpriser räknar vi INTE om. Liquid har redan skrivit rätt
       priser i korten, och ett tomt prisregister skulle ersätta dem med
       0 kr — ett fel som ser ut som en rea och inte som en krasch. Hellre
       priser som står stilla vid variantbyte än priser som är påhittade. */
    rita() {
      var format = this.dataset.moneyFormat;
      var self = this;
      if (this.mix()) {
        this.inputs.forEach(function (i) { self.ritaMix(i, format); });
        return;
      }
      var styck = this.styckpris();
      if (!styck) return;
      this.inputs.forEach(function (i) {
        var antal = Number(i.dataset.antal || 1);
        var rabatt = self.rabattFor(i, styck);
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
      if (this.inaktiv()) return;

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

      var antal = Number(this.vald.dataset.antal || 1);
      var pris, forr;
      if (this.mix()) {
        var m = this.mixRakna(this.vald);
        pris = m.nu; forr = m.ordinarie;
      } else {
        var styck = this.styckpris();
        var gvarde = Number(this.vald.dataset.gratisVarde || 0);
        var rabatt = this.rabattFor(this.vald, styck);
        pris = Math.max(0, styck * antal + gvarde - rabatt); forr = styck * antal + gvarde;
      }
      document.dispatchEvent(new CustomEvent('ms:variant', {
        detail: { id: this.variantId(), quantity: antal, price: pris, compareAtPrice: forr }
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
      // når oss innan händelsen hunnit fram till formuläret, så stopPropagation
      // i kop() gör att bara vår kod kör.
      //
      // Att det inte redan smällt beror på att temats lyssnare råkar krascha
      // på en spinner som saknas i markupen. Det är tur, inte konstruktion,
      // och tur duger inte i den kod som rör pengar.
      document.addEventListener('submit', this.kop.bind(this), true);
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

       Ordningen är inte valfri. Rabattkoden läggs på FÖRST, med en vanlig
       fetch mot /discount/<kod>. Shopify sätter koden på sessionen, och den
       kundvagn vi hämtar direkt efteråt är därför redan rabatterad. Görs det
       tvärtom ritas lådan med fullpris och rättar sig först vid nästa
       sidladdning — kunden hinner se fel siffra.

       `?redirect=/cart.js` gör att omdirigeringen landar på kundvagnen som
       JSON i stället för på startsidan. Några hundra byte i stället för en
       hel sida, på mobil.

       Lådan ritas om med temats egen renderContents(), samma väg som temats
       vanliga köpknapp går. Finns ingen låda (butiken kan vara inställd på
       kundvagnssida) laddar vi om till /cart som förr. */
    kop(ev) {
      if (ev.target !== this.form || !this.vald || this.inaktiv()) return;
      ev.preventDefault();
      ev.stopPropagation();

      var rutt = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
      var antal = Number(this.vald.dataset.antal || 1);
      var kod = this.vald.dataset.kod || '';
      // Mixläget: koden bär antalet ätpinnar (-P0 … -P4). Shopify ger de
      // billigaste varorna gratis först, så gratisantalet i koden måste vara
      // exakt vagnen minus det som ska betalas — annars äter gratisdelen upp
      // de betalda lådorna och koden blir "ej tillämplig".
      if (this.mix() && kod) kod = kod + '-P' + this.mixRakna(this.vald).pinnar;
      var gvariant = this.vald.dataset.gratisVariant;
      var gantal = Number(this.vald.dataset.gratisAntal || 0);

      var varor;
      if (this.mix()) {
        // En rad per sort, ätpinnar bara för sushilådorna.
        var m = this.mixRakna(this.vald);
        var grupp = {};
        m.ids.forEach(function (id) { grupp[id] = (grupp[id] || 0) + 1; });
        varor = Object.keys(grupp).map(function (id) { return { id: Number(id), quantity: grupp[id] }; });
        if (gvariant && m.pinnar > 0) varor.push({ id: Number(gvariant), quantity: m.pinnar });
      } else {
        varor = [{ id: Number(this.variantId()), quantity: antal }];
        if (gvariant && gantal > 0) varor.push({ id: Number(gvariant), quantity: gantal });
      }

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

      var koden = kod
        ? fetch(rutt + 'discount/' + encodeURIComponent(kod) + '?redirect=' + encodeURIComponent('/cart.js'),
                { credentials: 'same-origin' })
        : Promise.resolve();

      koden.then(function () {
        var lada = document.querySelector('cart-drawer');
        var kropp = { items: varor };
        if (lada && lada.getSectionsToRender) {
          kropp.sections = lada.getSectionsToRender().map(function (s) { return s.id; }).join(',');
          kropp.sections_url = window.location.pathname;
        }
        return fetch(rutt + 'cart/add.js', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(kropp)
        }).then(function (svar) {
          if (!svar.ok) {
            return svar.json().then(function (d) {
              throw new Error(d.description || d.message || 'Kunde inte lägga i varukorgen.');
            });
          }
          return svar.json();
        }).then(function (data) {
          aterstall();
          if (lada && lada.renderContents && data.sections) {
            try {
              lada.renderContents(data);
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
        });
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
