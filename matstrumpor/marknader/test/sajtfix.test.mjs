// Tester för sajtfix.mjs — utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  flyttMal, webblasarSprak, SNIPPET_FLYTT, UTLANDET, CRO_HJALP_NY,
  patchaKnapp, patchaPaketLiquid, patchaPaketJs, patchaAb, patchaHead, patchaCro, patchaDela, patchaShare,
  patchaLayout, patchaTillbehor, patchaEs, patchaPt, MARK,
} from '../sajtfix.mjs';

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const bas = (o) => ({
  vard: 'matstrumpor.se', sprak: 'sv', rot: '/', land: 'SE', verkligt: 'SE', roll: 'main', typ: 'product', sida: '',
  sok: '', hash: '', vag: '/products/sushi-strumpor', ua: UA, sprakLista: ['sv-SE'], referrer: '', nu: 1e12, senast: 0, ...o,
});

test('svenskar och svenska webbläsare stannar på .se', () => {
  assert.equal(flyttMal(bas({})), null);
  assert.equal(flyttMal(bas({ land: 'US', verkligt: 'US', sprakLista: ['en-US', 'sv-SE'] })), null);
  // Shopify ger Europa-marknaden landet Sverige på .se — men en svensk i Sverige är fortfarande SE.
  assert.equal(flyttMal(bas({ land: 'SE', verkligt: 'SE', sprakLista: ['de-DE'] })), null);
});

test('S-002: Spoks norska länk, efter Shopifys 302 till svenska sidan, går till .com/nb med landet', () => {
  const mal = flyttMal(bas({ land: 'NO', verkligt: 'NO', sok: '?utm_source=spoks&utm_medium=email', sprakLista: ['nb-NO', 'nb', 'en'] }));
  assert.equal(mal, 'https://matstrumpor.com/nb/products/sushi-strumpor?utm_source=spoks&utm_medium=email&country=NO');
  // Japan får de engelska Spoks-mejlen; en japansk webbläsare får japanska.
  assert.equal(flyttMal(bas({ land: 'JP', verkligt: 'JP', sprakLista: ['ja-JP'] })), 'https://matstrumpor.com/ja/products/sushi-strumpor?country=JP');
  assert.equal(flyttMal(bas({ land: 'US', verkligt: 'US', sprakLista: ['en-US'] })), 'https://matstrumpor.com/products/sushi-strumpor?country=US');
});

test('S-003/S-014: språkmappen på .se med Shopifys "Sverige" går till .com med besökarens riktiga land', () => {
  assert.equal(flyttMal(bas({ sprak: 'de', rot: '/de', vag: '/de/products/sushi-strumpor', land: 'SE', verkligt: 'DE', sprakLista: ['de-DE'] })),
    'https://matstrumpor.com/de/products/sushi-strumpor?country=DE');
  assert.equal(flyttMal(bas({ sprak: 'de', rot: '/de', vag: '/de/products/sushi-strumpor', land: 'SE', verkligt: 'AT', sprakLista: ['de-AT'] })),
    'https://matstrumpor.com/de/products/sushi-strumpor?country=AT');
  // På .se heter portugisiskan /pt och kinesiskan /zh, på .com /pt-pt och /zh-tw.
  assert.equal(flyttMal(bas({ sprak: 'pt-PT', rot: '/pt', vag: '/pt/collections/alla-produkter', verkligt: 'PT', sprakLista: ['pt-PT'] })),
    'https://matstrumpor.com/pt-pt/collections/alla-produkter?country=PT');
  assert.equal(flyttMal(bas({ sprak: 'zh-TW', rot: '/zh', vag: '/zh', verkligt: 'TW', sprakLista: ['zh-TW'] })),
    'https://matstrumpor.com/zh-tw?country=TW');
  // Roten på .se från Tyskland: tyska ur webbläsaren, annars landets språk, annars engelska.
  assert.equal(flyttMal(bas({ vag: '/', verkligt: 'DE', sprakLista: ['de-DE', 'en'] })), 'https://matstrumpor.com/de?country=DE');
  assert.equal(flyttMal(bas({ vag: '/', verkligt: 'BE', sprakLista: ['nl-BE'] })), 'https://matstrumpor.com/nl?country=BE');
  assert.equal(flyttMal(bas({ vag: '/', verkligt: 'BE', sprakLista: ['ko-KR'] })), 'https://matstrumpor.com/fr?country=BE');
  assert.equal(flyttMal(bas({ vag: '/', verkligt: 'CZ', sprakLista: ['cs-CZ'] })), 'https://matstrumpor.com/?country=CZ');
});

test('utan server-timing: Shopifys land, och ett land utanför marknaderna stannar', () => {
  assert.equal(flyttMal(bas({ verkligt: null, land: 'NO', sprakLista: ['nb'] })), 'https://matstrumpor.com/nb/products/sushi-strumpor?country=NO');
  assert.equal(flyttMal(bas({ verkligt: 'BR', land: 'BR', sprakLista: ['pt-BR'] })), null);
  assert.ok(!UTLANDET.includes('SE') && UTLANDET.includes('NO') && UTLANDET.includes('JP') && UTLANDET.includes('TW') && UTLANDET.includes('IE'));
});

test('kunden som själv valde Sverige på .com stannar (och kakan minns det), utom på "Dina integritetsval"', () => {
  const fran = { land: 'US', verkligt: 'US', sprakLista: ['en-US'], referrer: 'https://matstrumpor.com/' };
  assert.equal(flyttMal(bas(fran)), 'stanna');
  assert.equal(flyttMal(bas({ ...fran, referrer: 'https://matstrumpor.se/collections/all', stannaKaka: true })), null);
  // Navigering inom .se utan kakan (första sidan var t.ex. korgen) flyttas.
  assert.equal(flyttMal(bas({ ...fran, referrer: 'https://matstrumpor.se/cart' })), 'https://matstrumpor.com/products/sushi-strumpor?country=US');
  // S-006: Shopifys integritetspolicy länkar alltid opt-out-sidan på .se.
  assert.equal(flyttMal(bas({ ...fran, typ: 'page', sida: 'data-sharing-opt-out', vag: '/pages/data-sharing-opt-out', stannaKaka: true })),
    'https://matstrumpor.com/pages/data-sharing-opt-out?country=US');
  assert.equal(flyttMal(bas({ ...fran, sok: '?ms_stanna=1' })), 'stanna');
});

test('stannar: botar, ?country=, korgen och kontot, opublicerat tema, nyss flyttad', () => {
  const u = { land: 'NO', verkligt: 'NO', sprakLista: ['nb'] };
  assert.equal(flyttMal(bas({ ...u, ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' })), null);
  assert.equal(flyttMal(bas({ ...u, ua: 'facebookexternalhit/1.1' })), null);
  assert.equal(flyttMal(bas({ ...u, ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0 Safari/537.36' })), null);
  assert.equal(flyttMal(bas({ ...u, sok: '?country=NO' })), null);
  for (const typ of ['cart', 'customers/account', 'customers/login', 'password', 'gift_card', 'captcha']) assert.equal(flyttMal(bas({ ...u, typ })), null, typ);
  assert.equal(flyttMal(bas({ ...u, roll: 'unpublished' })), null);
  assert.ok(flyttMal(bas({ ...u, roll: 'unpublished', sok: '?ms_flytt_prov=1' })).startsWith('https://matstrumpor.com/nb/'));
  assert.equal(flyttMal(bas({ ...u, senast: 1e12 - 5000 })), null);
  // .com och .no rörs aldrig.
  assert.equal(flyttMal(bas({ ...u, vard: 'matstrumpor.com' })), null);
  assert.equal(flyttMal(bas({ ...u, vard: 'matstrumpor.no', sprak: 'nb' })), null);
});

test('S-012/S-013/S-016: .eu och myshopify-adressen är aldrig ett mål', () => {
  assert.equal(flyttMal(bas({ vard: 'matstrumpor.eu', sprak: 'en', vag: '/', land: 'AT', verkligt: 'DK', sprakLista: ['da-DK'] })), 'https://matstrumpor.com/da?country=DK');
  assert.equal(flyttMal(bas({ vard: 'matstrumpor.eu', sprak: 'de', rot: '/de', vag: '/de/products/sushi-strumpor', land: 'AT', verkligt: 'DE' })), 'https://matstrumpor.com/de/products/sushi-strumpor?country=DE');
  assert.equal(flyttMal(bas({ vard: 'matstrumpor.eu', sprak: 'en', vag: '/', land: 'AT', verkligt: 'SE' })), 'https://matstrumpor.se/');
  const block = { vard: '1r46tp-qx.myshopify.com', sok: '?utm_source=spoks' };
  assert.equal(flyttMal(bas({ ...block, land: 'US', verkligt: 'US', sprakLista: ['en-US'] })), 'https://matstrumpor.com/products/sushi-strumpor?utm_source=spoks&country=US');
  assert.equal(flyttMal(bas({ ...block, land: 'SE', verkligt: 'SE' })), 'https://matstrumpor.se/products/sushi-strumpor?utm_source=spoks');
  // Även med en svensk webbläsare och en referens från .com: myshopify-adressen ska bort (landets språk).
  assert.equal(flyttMal(bas({ ...block, land: 'DE', verkligt: 'DE', sprakLista: ['sv'], referrer: 'https://matstrumpor.com/' })), 'https://matstrumpor.com/de/products/sushi-strumpor?utm_source=spoks&country=DE');
  // Land utanför marknaderna: .com utan land, Shopify väljer.
  assert.equal(flyttMal(bas({ ...block, land: 'BR', verkligt: 'BR' })), 'https://matstrumpor.com/products/sushi-strumpor?utm_source=spoks');
  assert.equal(flyttMal(bas({ ...block, hash: '#recensioner', land: 'FI', verkligt: 'FI', sprakLista: ['fi'] })), 'https://matstrumpor.com/fi/products/sushi-strumpor?utm_source=spoks&country=FI#recensioner');
});

test('webbläsarens språk', () => {
  assert.equal(webblasarSprak(['de-AT', 'en']), 'de');
  assert.equal(webblasarSprak(['en-US', 'sv-SE']), 'sv');
  assert.equal(webblasarSprak(['no']), 'nb');
  assert.equal(webblasarSprak(['nn-NO']), 'nb');
  assert.equal(webblasarSprak(['zh-CN', 'zh-TW']), 'zh-TW');
  assert.equal(webblasarSprak(['zh-Hant-TW']), 'zh-TW');
  assert.equal(webblasarSprak(['pt-BR']), 'pt-PT');
  assert.equal(webblasarSprak(['ko', 'cs']), null);
});

test('snippeten: bara de avsedda Liquid-taggarna, JS-reglerna byggda ur flyttMal', () => {
  const liquid = SNIPPET_FLYTT.match(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g);
  assert.deepEqual(liquid.filter((t) => t.startsWith('{{')).map((t) => t.replace(/\s+/g, ' ')), [
    '{{ request.locale.iso_code | json }}', '{{ routes.root_url | json }}', '{{ localization.country.iso_code | json }}',
    '{{ theme.role | json }}', '{{ request.page_type | json }}', "{{ page.handle | default: '' | json }}",
  ]);
  assert.ok(SNIPPET_FLYTT.includes('function flyttMal(s)') && SNIPPET_FLYTT.includes('function webblasarSprak(lista)'));
  // Skriptet kör i webbläsaren: inga ES-moduler.
  assert.ok(!/\bexport\b|\bimport\b/.test(SNIPPET_FLYTT.replace(/\{%- comment -%}[\s\S]*?\{%- endcomment -%}/, '')));
  // Och det går att köra: plocka ut skriptet och kör flyttMal på ett riktigt fall.
  const js = SNIPPET_FLYTT.split('<script>')[1].split('</script>')[0];
  const kropp = js.slice(js.indexOf('var COM_MAPP'), js.indexOf('var verkligt'));
  const fm = new Function(`${kropp}; return flyttMal;`)();
  assert.equal(fm(bas({ land: 'NO', verkligt: 'NO', sprakLista: ['nb'] })), 'https://matstrumpor.com/nb/products/sushi-strumpor?country=NO');
});

// --- patcharna, på minsta möjliga indata med exakt de ankare temat har ---------------------------

const KNAPP = `          >
            <span>x</span>
            {%- render 'loading-spinner' -%}
          </button>
          {%- if show_dynamic_checkout -%}
            {{ form | payment_button }}`;
const KNAPP_HEL = `          <button
            id="ProductSubmitButton-{{ section_id }}"
            type="submit"
            name="add"
${KNAPP}`;
test('S-001: knappen är låst från första stund (data-ms-las i HTML:en, aldrig disabled), bara med paketnivåer', () => {
  const r = patchaKnapp(KNAPP_HEL);
  assert.deepEqual(r.byten, ['knapplås']);
  assert.ok(r.kod.includes('{% if ms_las %}data-ms-las aria-disabled="true"{% endif %}'));
  assert.ok(r.kod.indexOf('shop.metaobjects.ms_paketniva.values') < r.kod.indexOf('<button'), 'ms_las räknas före knappen');
  assert.ok(!/\n\s*disabled\s*\n/.test(r.kod.split('<button')[1].split('>')[0]), 'aldrig disabled i taggen');
  assert.ok(r.kod.indexOf('</button>') < r.kod.indexOf('<script>'));
  assert.ok(r.kod.includes("addEventListener('DOMContentLoaded'"));
  assert.deepEqual(patchaKnapp(r.kod).byten, []);
});

test('S-001: v1 (bara skriptet efter knappen) uppgraderas till v2', () => {
  const v1 = KNAPP_HEL.replace(`            {%- render 'loading-spinner' -%}
          </button>
          {%- if show_dynamic_checkout -%}`, `            {%- render 'loading-spinner' -%}
          </button>
          {%- comment -%}
            ${MARK} (S-001): köpknappen låses tills paketväljaren (assets/ms-paket.js) lyssnar på den.
            Innan dess gick den att trycka, och korgen fick EN låda till fullpris fast "Köp 2 – få 2"
            stod vald. Låset sitter i ett skript och inte som disabled i HTML:en: Dawn läser knappens
            attribut ur den hämtade sektionen vid variantbyte och hade låst den för gott.
            DOMContentLoaded låser upp som reserv (kommer efter alla defer-skript, även om ett uteblev).
          {%- endcomment -%}
          {%- liquid
            assign ms_las = false
            if product.selected_or_first_available_variant.available and request.design_mode == false
              for ms_niva in shop.metaobjects.ms_paketniva.values
                if ms_niva.produkt.value.id == product.id
                  assign ms_las = true
                  break
                endif
              endfor
            endif
          -%}
          {%- if ms_las -%}
            <script>(function(){var b=document.getElementById('ProductSubmitButton-{{ section_id }}');if(!b||b.disabled)return;b.disabled=true;b.setAttribute('data-ms-las','');b.setAttribute('aria-busy','true');document.addEventListener('DOMContentLoaded',function(){if(b.hasAttribute('data-ms-las')){b.removeAttribute('data-ms-las');b.removeAttribute('aria-busy');b.disabled=false;}});})();</script>
          {%- endif -%}
          {%- if show_dynamic_checkout -%}`);
  const r = patchaKnapp(v1);
  assert.deepEqual(r.byten, ['v1 bort', 'knapplås']);
  assert.equal(r.kod, patchaKnapp(KNAPP_HEL).kod);
});

test('S-001: varje kortgrupp får eget radionamn', () => {
  const r = patchaPaketLiquid(`            <input
              class="ms-paket__input"
              type="radio"
              name="ms-paket-{{ uid }}"
              value="x">`);
  assert.ok(r.kod.includes(`name="ms-paket-{{ uid }}-{{ ab | default: 'x' }}{% if mix %}-mix{% endif %}"`));
  assert.deepEqual(patchaPaketLiquid(r.kod).byten, []);
});

const PAKET_JS = `  function money(cents, format) {
    if (window.MS && window.MS.money) return window.MS.money(cents, format);
    return (cents / 100).toLocaleString('sv-SE') + ' kr';
  }
      var vald = this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      vald.checked = true;
      this.onChange({ target: vald });
      var vald = this.vald || this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      if (vald) this.onChange({ target: vald });
      document.addEventListener('submit', this.kop.bind(this), true);
    }
          fel.textContent = e.message || msPaketText('fel_forsok_igen', 'Det gick inte att lägga i varukorgen. Försök igen.');`;
test('S-001/S-008/S-009: ms-paket.js', () => {
  const r = patchaPaketJs(PAKET_JS);
  assert.equal(r.byten.length, 5);
  assert.ok(r.kod.includes('if (!this.inaktiv()) vald.checked = true;'));
  assert.ok(r.kod.includes("this.knapp.removeAttribute('data-ms-las')") && r.kod.includes("this.knapp.removeAttribute('aria-disabled')"));
  assert.ok(r.kod.includes("new Intl.NumberFormat(sprak, { style: 'currency', currency: valuta })") && !r.kod.includes("+ ' kr'"));
  assert.ok(r.kod.includes("(e && e.name !== 'TypeError' && e.message) ||"));
  assert.deepEqual(patchaPaketJs(r.kod).byten, []);
});

test('S-007: ms-ab.js och CSS:en i ms-head', () => {
  const ab = patchaAb(`  applyVisibility();
  if (document.readyState === 'loading') {
    x();`);
  assert.ok(ab.kod.includes('new MutationObserver') && ab.kod.includes('bevakare.disconnect()'));
  const head = `{{ 'ms-cro.css' | asset_url | stylesheet_tag }}
<script src="{{ 'ms-ab.js' | asset_url }}"></script>
<style>
  /* Bara Norge och norska på .no: inga land- eller språkväljare. */
  localization-form { display: none !important; }
  /* Judge.me visar recensionerna på svenska på norska sidor; de norska ritas av ms-omdomen-no. */
  .jdgm-widget { display: none !important; }
  /* "Nå i hele verden" säger internationellt, B-sidan ska kännas norsk. */
  .ms-varlden { display: none !important; }
</style>`;
  const h = patchaHead(head);
  assert.ok(h.kod.indexOf(MARK) < h.kod.indexOf("'ms-ab.js'"));
  assert.ok(h.kod.includes('[data-ms-ab="{{ ms_id }}:b"]') && h.kod.includes('jdgm--done-setup') && h.kod.includes('M+PLUS+Rounded+1c'));
  assert.ok(h.kod.includes('{{ 123456789 | money | json }}'));
  assert.ok(h.kod.includes('button[data-ms-las] { pointer-events: none;'));
  assert.ok(!/\/\*/.test(h.kod.split('<style>').slice(1).join('')), 'inga CSS-kommentarer kvar i källan (S-029)');
  assert.deepEqual(patchaHead(h.kod).byten, []);
});

test('S-024/S-023: priset formateras som Shopifys prov i kundens valuta, TWD som NT$', () => {
  const kropp = CRO_HJALP_NY.slice(CRO_HJALP_NY.indexOf('function pengarSomShopify'), CRO_HJALP_NY.indexOf('  // ms-sajtfix: Shopify skriver TWD'));
  const fake = (text, valuta) => ({
    window: { MS: { pengaprov: { text, valuta } } },
    document: { createElement: () => { const o = {}; Object.defineProperty(o, 'innerHTML', { set(v) { o.value = v.replace(/&euro;/g, '€').replace(/&amp;/g, '&'); } }); return o; } },
  });
  const kor = (text, valuta, cents, aktiv = valuta) => { const f = fake(text, valuta); return new Function('window', 'document', `${kropp}; return pengarSomShopify;`)(f.window, f.document)(cents, aktiv); };
  assert.equal(kor('€1.234.567,89', 'EUR', 4490), '€44,90');
  assert.equal(kor('&euro;1.234.567,89', 'EUR', 10160), '€101,60');
  assert.equal(kor('1.234.567,89 kr', 'NOK', 211200), '2.112,00 kr');
  assert.equal(kor('1.234.567,89 kr', 'DKK', 34300), '343,00 kr');
  assert.equal(kor('$1,234,567.89', 'NZD', 12600), '$126.00');
  assert.equal(kor('¥1,234,568', 'JPY', 798000), '¥7,980');
  assert.equal(kor('$1,234,567.89', 'TWD', 169000), 'NT$1,690.00');
  assert.equal(kor('1 234 567,89 zł', 'PLN', 40200), '402,00 zł');
  assert.equal(kor('€1.234.567,89', 'EUR', 100, 'NOK'), null, 'provet gäller en annan valuta');
});

test('S-028: italienskt datum, och S-023/S-024 i ms-cro.js', () => {
  const r = patchaCro(`  function kopformular(rot) {
    if (aktiv && aktiv !== 'SEK' && aktiv !== butikens) {
      try {
  function datumIntervall(from, to) {
    var vanlig = svDate(from, false) + ' – ' + svDate(to, false);`);
  assert.equal(r.byten.length, 3);
  assert.ok(r.kod.includes("return from.getDate() + '–' + svDate(to, false);"));
  assert.ok(r.kod.includes("'$1NT$$$2'"));
  assert.deepEqual(patchaCro(r.kod).byten, []);
});

test('S-004: delningslänken bär landet utanför Sverige', () => {
  const r = patchaDela(`                  assign share_url = product.selected_variant.url | default: product.url | prepend: request.origin
                  render 'share-button', block: block, share_link: share_url
`);
  assert.ok(r.kod.includes("append: '?country=' | append: localization.country.iso_code"));
  assert.deepEqual(patchaDela(r.kod).byten, []);
  const s = patchaShare(`      updateUrl(url) {
        this.urlToShare = url;`);
  assert.ok(s.kod.includes("'country=' + land"));
});

test('layouten: ms-flytt direkt efter <meta charset>', () => {
  const r = patchaLayout(`<head>\n    <meta charset="utf-8">\n    <meta http-equiv="X-UA-Compatible" content="IE=edge">\n`);
  assert.ok(r.kod.indexOf("render 'ms-flytt'") < r.kod.indexOf('http-equiv'));
  assert.deepEqual(patchaLayout(r.kod).byten, []);
});

test('S-022: ätpinnarnas trust- och leveransrad blir strumpsidornas', () => {
  const huvud = '/*\n * IMPORTANT: auto-generated.\n */\n';
  const mall = (trust, lev) => huvud + JSON.stringify({ sections: { main: { blocks: { ms_trust: { settings: { custom_liquid: trust } }, ms_delivery: { settings: { custom_liquid: lev } } } } } });
  const r = patchaTillbehor(mall('da:30 dages fortrydelsesret', 'utan ja'), mall('da:30 dages returret', "{% when 'ja' %}お届け予定"));
  assert.deepEqual(r.byten, ['ms_trust', 'ms_delivery']);
  assert.ok(r.kod.startsWith(huvud) && r.kod.includes('30 dages returret') && r.kod.includes('お届け予定'));
});

test('S-028: es och pt-PT', () => {
  assert.ok(patchaEs('"empty": "Tu carrito esta vacío",').kod.includes('"empty": "Tu carrito está vacío"'));
  const pt = '/* x */\n' + JSON.stringify({ sections: { cart: { title: 'O seu carrinho', empty: 'O seu carrinho está vazio' } } });
  const r = patchaPt(pt, { 'sections.cart.title': 'O teu carrinho', 'sections.cart.empty': 'O teu carrinho está vazio' });
  assert.ok(r.kod.startsWith('/* x */\n') && r.kod.includes('"title": "O teu carrinho"'));
  assert.throws(() => patchaPt(pt, { 'finns.inte': 'x' }), /finns inte/);
});

test('snippetens kakregel behåller sitt \\s (mallsträngen åt det en gång)', () => {
  assert.ok(SNIPPET_FLYTT.includes('/(^|;\\s*)ms_stanna=1(;|$)/'));
});
