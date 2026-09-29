// Tester för domantema.mjs — utan nät. Fixturerna är de exakta raderna ur MAIN-temat 2026-09-29.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  MARK, LOGGA_FIL, PRESENTKORT_SV, PRESENTKORT_HANDLE, patchaLayout, patchaLayoutV1, patchaLayoutV2, patchaLayoutV3, patchaLayoutV4, patchaLayoutV5, patchaFiLocale, FI_FEL, FI_RATT, patchaMetaTags, patchaHeader, patchaFooter, patchaMsHead,
  patchaProduktMall, omdomenJson, bytNamn, SEKTION_OMDOMEN, SNIPPET_BADGE, FAQ_EPOST, FAQ_KONTAKT,
  patchaProduktMoms, patchaKorgMoms, MOMS_MARK, PRODUKT_MOMS_VILLKOR, PATCHAR,
} from '../domantema.mjs';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));

const SIDAN = `    {% sections 'header-group' %}

    <main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
      {{ content_for_layout }}
    </main>

    {% sections 'footer-group' %}
`;
const LAYOUT = `<!doctype html>
<html class="js" lang="{{ request.locale.iso_code }}">
  <head>
    <title>
      {{ page_title }}
      {%- if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif -%}
      {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}
      {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}
    </title>

    {% if page_description %}
      <meta name="description" content="{{ page_description | escape }}">
    {% endif %}
  </head>
  <body>
${SIDAN}  </body>
</html>
`;

test('layouten: Sverige får exakt den gamla sidan i else-grenen, egen domän får namnbytet', () => {
  const r = patchaLayout(LAYOUT);
  assert.ok(r.kod.includes(MARK));
  assert.deepEqual(r.byten, ['villkor', 'titel', 'titelsuffix', 'sidan', 'utland_v6']);
  // Axel 2026-09-29 kväll: "vi borde bara ha Matstrumpor" — alla länder utom Sverige, även på matstrumpor.se/<språk>.
  assert.match(r.kod, /request\.host contains 'matstrumpor\.com' or localization\.country\.iso_code != 'SE'\n        assign ms_egen = true/);
  // Beskrivningen rörs inte: replace + escape dubbelkodar Shopifys text ("don&amp;#39;t", mätt på .com).
  assert.ok(r.kod.includes('<meta name="description" content="{{ page_description | escape }}">'));
  // Den gamla sidan står oförändrad i else-grenen — .se ritas som förut.
  assert.ok(r.kod.includes(`{%- else -%}\n${SIDAN}    {%- endif -%}`));
  // Villkoren: bara de tre egna domänerna, Norge för sig.
  assert.match(r.kod, /if request\.host contains 'matstrumpor\.no'\n/);
  assert.match(r.kod, /request\.host contains 'matstrumpor\.no' or request\.host contains 'matstrumpor\.eu' or request\.host contains 'matstrumpor\.com'/);
  // Descriptorn skyddas före namnbytet och återställs efter.
  assert.match(r.kod, /replace: 'SP Matstrumpor\.se', 'MS-DESCRIPTOR-SKYDD' \| replace: 'Matstrumpor\.se', 'Matstrumpor' \| replace: 'MS-DESCRIPTOR-SKYDD', 'SP Matstrumpor\.se'/);
  // FAQ-meningen byts bara på .no.
  assert.ok(r.kod.includes(`{%- if ms_no -%}\n        {%- assign ms_sida = ms_sida | replace: '${FAQ_EPOST}', '${FAQ_KONTAKT}' -%}`));
  // content_for_layout finns kvar i båda grenarna.
  assert.equal(r.kod.split('{{ content_for_layout }}').length - 1, 2);
});

test('layouten: idempotent, och fel mall stoppar i stället för att patcha halvt', () => {
  const en = patchaLayout(LAYOUT).kod;
  const tva = patchaLayout(en);
  assert.equal(tva.kod, en);
  assert.deepEqual(tva.byten, []);
  assert.throws(() => patchaLayout(LAYOUT.replace('role="main"', 'role="huvud"')), /hittades 0 gånger/);
});

test('layouten: presentkortets bild byts på alla språk utom svenska, med filernas egna adresser', () => {
  const r = patchaLayout(LAYOUT);
  assert.match(r.kod, /if request\.locale\.iso_code != 'sv'\n        assign ms_lokal = true/);
  assert.match(r.kod, /\{%- if ms_egen or ms_lokal -%\}/);
  // Båda adresserna läses ur Shopify med sin egen ?v= (CDN:en väljer filversion efter v, mätt).
  assert.ok(r.kod.includes("assign ms_pk_ny = images[ms_pk_fil] | image_url | split: 'files/' | last"));
  assert.ok(r.kod.includes(`assign ms_pk_gammal = all_products['${PRESENTKORT_HANDLE}'].featured_image | image_url | split: 'files/' | last`));
  // Gardering mot tomt sökord (replace '' skriver in texten mellan varje tecken).
  assert.ok(r.kod.includes("{%- if ms_pk_ny contains '?v=' and ms_pk_gammal contains '?v=' -%}"));
  assert.ok(!r.kod.includes(`replace: '${PRESENTKORT_SV}'`), 'inget fast filnamn kvar');
  // Utan egen domän skrivs den fångade sidan ut orörd (inget namnbyte på matstrumpor.se/<språk>).
  assert.match(r.kod, /\{%- else -%\}\n        \{\{ ms_sida \}\}/);
});

test('layouten: v1–v5 (live 2026-09-29) uppgraderas till exakt samma som en ny patch', () => {
  const ny = patchaLayout(LAYOUT).kod;
  for (const [namn, fn] of [['v1', patchaLayoutV1], ['v2', patchaLayoutV2], ['v3', patchaLayoutV3], ['v4', patchaLayoutV4], ['v5', patchaLayoutV5]]) {
    const gammal = fn(LAYOUT);
    assert.notEqual(gammal, ny, namn);
    const r = patchaLayout(gammal);
    assert.deepEqual(r.byten, namn === 'v5' ? ['utland_v6'] : ['uppgradering_v5', 'utland_v6'], namn);
    assert.equal(r.kod, ny, namn);
  }
  assert.ok(!patchaLayoutV5(LAYOUT).includes("localization.country.iso_code != 'SE'"), 'v5 hade bara värden');
  assert.ok(patchaLayoutV3(LAYOUT).includes('?pk=2&v='));
});

test('meta-taggarna: namnet byts bara på egen domän och bara när värdet ÄR butiksnamnet', () => {
  const META = `{%- liquid
  assign og_title = page_title | default: shop.name
  assign og_url = canonical_url | default: request.origin
  assign og_type = 'website'
  assign og_description = page_description | default: shop.description | default: shop.name
%}

<meta property="og:site_name" content="{{ shop.name }}">
`;
  const r = patchaMetaTags(META);
  assert.match(r.kod, /assign ms_namn = shop\.name\n  if request\.host contains 'matstrumpor\.no' or/);
  assert.match(r.kod, /assign ms_namn = 'Matstrumpor'/);
  // Originalraderna står kvar orörda; bytet ligger i ett block som hoppas på .se.
  assert.ok(r.kod.includes('  assign og_title = page_title | default: shop.name\n'));
  assert.match(r.kod, /if ms_namn != shop\.name\n    if og_title == shop\.name\n      assign og_title = ms_namn/);
  assert.doesNotMatch(r.kod, /\| replace:/, 'ingen replace på Shopifys färdiga text');
  assert.ok(r.kod.includes('<meta property="og:site_name" content="{{ ms_namn }}">'));
  assert.match(r.kod, /or localization\.country\.iso_code != 'SE'\n    assign ms_namn = 'Matstrumpor'/);
  assert.equal(patchaMetaTags(r.kod).kod, r.kod);
  // v1 (live 2026-09-29 eftermiddag, bara egen domän) uppgraderas till samma som en ny patch.
  const v1 = r.kod.replace(" or localization.country.iso_code != 'SE'\n    assign ms_namn", "\n    assign ms_namn").replace('egen domän och alla länder utom Sverige ⇒', 'egen domän ⇒');
  assert.notEqual(v1, r.kod);
  const upp = patchaMetaTags(v1);
  assert.deepEqual(upp.byten, ['utland_v2']);
  assert.equal(upp.kod, r.kod);
  assert.throws(() => patchaMetaTags(`{%- liquid\n  # ${MARK}: något annat\n`), /okänd version/);
});

test('sidhuvudet: loggan byts i båda loggblocken, faller tillbaka på temats logga om filen saknas', () => {
  const block = `        {%- if settings.logo != blank -%}
          <div class="header__heading-logo-wrapper">
            {%- assign logo_alt = settings.logo.alt | default: shop.name | escape -%}
            {%- assign logo_height = settings.logo_width | divided_by: settings.logo.aspect_ratio -%}
            {{
              settings.logo
              | image_url: width: 600
              | image_tag:
                class: 'header__heading-logo',
            }}
          </div>
        {%- else -%}
`;
  const r = patchaHeader(`<link rel="stylesheet">\n${block}\n${block}`);
  assert.ok(r.kod.startsWith(`{%- comment -%} ${MARK}`));
  assert.ok(r.kod.includes(`if images['${LOGGA_FIL}'] != blank`));
  assert.equal(r.kod.split('{%- if ms_logga != blank -%}').length - 1, 2);
  assert.equal(r.kod.split('settings.logo != blank').length - 1, 0);
  assert.equal(r.kod.split('ms_logga\n              | image_url: width: 600').length - 1, 2);
  assert.throws(() => patchaHeader(`<link>\n${block}`), /hittades 1 gånger, väntade 2/);
  // Alla länder utom Sverige får loggan utan .SE (Axel 2026-09-29 kväll), och v1 uppgraderas på plats.
  assert.match(r.kod, /or localization\.country\.iso_code != 'SE'\n    if images\[/);
  assert.deepEqual(patchaHeader(r.kod).byten, []);
  const v1 = r.kod.replace(" or localization.country.iso_code != 'SE'\n    if images[", '\n    if images[').replace(' och i alla länder utom Sverige, bilden', ', bilden');
  const upp = patchaHeader(v1);
  assert.deepEqual(upp.byten, ['utland_v2']);
  assert.equal(upp.kod, r.kod);
});

test('sidfoten: bara menyrader med @ hoppas, och bara på .no', () => {
  const FOT = `                        {%- for link in block.settings.menu.links -%}
                          <li>
                            <a href="{{ link.url }}">{{ link.title | escape }}</a>
                          </li>
                        {%- endfor -%}`;
  const r = patchaFooter(FOT);
  assert.match(r.kod, /\{%- if link\.title contains '@' and request\.host contains 'matstrumpor\.no' -%\}\{%- continue -%\}\{%- endif -%\}/);
  assert.equal(patchaFooter(r.kod).kod, r.kod);
});

test('ms-head: CSS:en för .no ligger bakom värdvillkoret', () => {
  const r = patchaMsHead('<script src="x"></script>\n');
  const css = r.kod.slice(r.kod.indexOf(MARK));
  assert.match(css, /\{%- if request\.host contains 'matstrumpor\.no' -%\}\n<style>/);
  assert.match(css, /localization-form/);
  assert.match(css, /\.jdgm-widget/);
  assert.match(css, /\.ms-varlden/);
  assert.equal(patchaMsHead(r.kod).kod, r.kod);
});

test('produktmallen: norska recensionerna efter Judge.me, märket efter Judge.me-märket, kommentarshuvudet kvar', () => {
  const mall = `/*\n * Shopifys huvud\n */\n${JSON.stringify({
    sections: { main: { type: 'main-product', blocks: { title: { type: 'title' }, judgeme_stjarnor: { type: 'x' }, ms_storlek: { type: 'custom_liquid' } }, block_order: ['title', 'judgeme_stjarnor', 'ms_storlek'] }, judgeme_widget: { type: 'apps' }, ms_faq_section: { type: 'ms-faq-section' } },
    order: ['main', 'judgeme_widget', 'ms_faq_section'],
  })}`;
  const r = patchaProduktMall(mall);
  assert.ok(r.text.startsWith('/*\n * Shopifys huvud\n */\n'));
  const d = JSON.parse(r.text.slice(r.text.indexOf('{')));
  assert.deepEqual(d.order, ['main', 'judgeme_widget', 'ms_omdomen_no', 'ms_faq_section']);
  assert.deepEqual(d.sections.main.block_order, ['title', 'judgeme_stjarnor', 'ms_stjarnor_no', 'ms_storlek']);
  assert.equal(d.sections.ms_omdomen_no.type, 'ms-omdomen-no');
  assert.deepEqual(patchaProduktMall(r.text).byten, []);
});

test('recensionerna: snittet ur de riktiga betygen, alla elva med, treorna kvar', () => {
  const fil = JSON.parse(readFileSync(join(ROT, 'domantema', 'omdomen-nb.json'), 'utf8'));
  const j = omdomenJson(fil.rader);
  assert.equal(j.antal, 11);
  assert.equal(j.antal, fil.antal_judgeme);
  assert.equal(j.snitt, fil.snitt_judgeme);
  assert.equal(j.snitt_text, '4,4');
  assert.equal(j.omdomen.filter((r) => r.stjerner === 3).length, 2);
  assert.ok(j.omdomen.some((r) => /Lang leveringstid/.test(r.tekst)), 'kritiken om leveranstiden står kvar');
  assert.ok(j.omdomen.every((r) => r.verifisert === true));
  // Ingen svenska kvar i de norska texterna — bara ord som INTE också är norska ("kvalitet", "gave"
  // och "morsom" finns i båda språken, CLAUDE.md → marknadsvakten).
  for (const r of j.omdomen) assert.doesNotMatch(r.tekst, /\b(strumpor|och|är|jätte\w*|mycket|inte|uppskatta\w*|snabb|förpackning|leveranstid)\b/i, r.tekst);
});

test('namnbytet skyddar kortets descriptor', () => {
  assert.equal(bytNamn('Matstrumpor.se drives av STONEBITE ECOM AB. På kontoutskriften: SP Matstrumpor.se'), 'Matstrumpor drives av STONEBITE ECOM AB. På kontoutskriften: SP Matstrumpor.se');
  assert.equal(bytNamn('kundsupport@matstrumpor.se'), 'kundsupport@matstrumpor.se');
});

test('sektionen och märket ritar bara på matstrumpor.no, på norska, aldrig ett ursprungspåstående', () => {
  for (const kod of [SEKTION_OMDOMEN, SNIPPET_BADGE]) {
    assert.match(kod, /\{%- if request\.host contains 'matstrumpor\.no' -%\}/);
    const kund = kod.replace(/\{%- comment -%\}[\s\S]*?\{%- endcomment -%\}/g, '').replace(/\{% schema %\}[\s\S]*$/, '');
    assert.doesNotMatch(kund, /\b(norsk|Norge|svensk|Sverige)\b/i);
  }
  assert.match(SEKTION_OMDOMEN, /Hva kundene sier/);
  assert.match(SEKTION_OMDOMEN, /Verifisert kjøp/);
  assert.match(SNIPPET_BADGE, /anmeldelser/);
});

test('layouten v5: gamla loggan byts mot loggan utan .SE i hela sidan, bara på egen domän och bara med ?v=', () => {
  const r = patchaLayout(LAYOUT).kod;
  const egen = r.slice(r.indexOf("      {%- if ms_egen -%}\n        {%- assign ms_logga_ny"), r.indexOf('      {%- else -%}\n        {{ ms_sida }}'));
  assert.ok(egen.includes(`images['${LOGGA_FIL}'] | image_url | split: 'files/' | last`));
  assert.ok(egen.includes("settings.brand_image | image_url | split: 'files/' | last"), 'sidfotens bild');
  assert.ok(egen.includes("settings.logo | image_url | split: 'files/' | last"), 'JSON-LD:ns logo');
  assert.ok(egen.includes("{%- if ms_logga_ny contains '?v=' -%}"));
  assert.ok(egen.includes("{%- if ms_logga_fot contains '?v=' -%}"));
  // Bytet står före namnkedjan och gäller bara egen domän: svenska sidor på .se/<språk> skrivs ut orörda.
  assert.ok(egen.indexOf('ms_logga_ny') < egen.indexOf("replace: 'Matstrumpor.se', 'Matstrumpor'"));
  assert.equal((r.match(/ms_logga_ny/g) ?? []).length, 4);
});

test('finska locale-filen: namnfältet får sin egen etikett, idempotent', () => {
  const fil = `{\n  "recipient": {\n    "form": {\n      "email_label": "Vastaanottajan sähköpostiosoite",\n      ${FI_FEL}\n      "name": "Nimi",\n      "email_label_optional_for_no_js_behavior": "Vastaanottajan sähköpostiosoite (valinnainen)"\n    }\n  }\n}`;
  const r = patchaFiLocale(fil);
  assert.deepEqual(r.byten, ['mottagarens_namn']);
  assert.ok(r.kod.includes(FI_RATT));
  assert.ok(r.kod.includes('"email_label_optional_for_no_js_behavior": "Vastaanottajan sähköpostiosoite (valinnainen)"'), 'e-postfältet orört');
  assert.doesNotThrow(() => JSON.parse(r.kod));
  assert.deepEqual(patchaFiLocale(r.kod).byten, []);
});

// De exakta blocken ur MAIN-temat 2026-09-29 (sections/main-product.liquid och snippets/cart-drawer.liquid).
const PRODUKT_MOMS_BLOCK = `                {%- endif -%}
                {%- if cart.taxes_included or cart.duties_included or shop.shipping_policy.body != blank -%}
                  <div class="product__tax caption rte">
                    {%- if cart.duties_included and cart.taxes_included -%}
                      {{ 'products.product.duties_and_taxes_included' | t }}
                    {%- elsif cart.taxes_included -%}
                      {{ 'products.product.taxes_included' | t }}
                    {%- elsif cart.duties_included -%}
                      {{ 'products.product.duties_included' | t }}
                    {%- endif -%}
                    {%- if shop.shipping_policy.body != blank -%}
                      {{ 'products.product.shipping_policy_html' | t: link: shop.shipping_policy.url }}
                    {%- endif -%}
                  </div>
                {%- endif -%}
                <div {{ block.shopify_attributes }}>
{% schema %}
{ "name": "t:sections.main-product.name" }
{% endschema %}
`;
const KORG_MOMS_BLOCK = `          <div class="totals" role="status">
            <h2 class="totals__total">{{ 'sections.cart.estimated_total' | t }}</h2>
            <p class="totals__total-value">{{ cart.total_price | money_with_currency }}</p>
          </div>

          <small class="tax-note caption-large rte">
            {%- if cart.duties_included and cart.taxes_included -%}
              {%- if shop.shipping_policy.body == blank -%}
                {{ 'sections.cart.duties_and_taxes_included_shipping_at_checkout_without_policy' | t }}
              {%- else -%}
                {{
                  'sections.cart.duties_and_taxes_included_shipping_at_checkout_with_policy_html'
                  | t: link: shop.shipping_policy.url
                }}
              {%- endif -%}
            {%- elsif cart.duties_included == false and cart.taxes_included -%}
              {%- if shop.shipping_policy.body == blank -%}
                {{ 'sections.cart.taxes_included_shipping_at_checkout_without_policy' | t }}
              {%- else -%}
                {{
                  'sections.cart.taxes_included_shipping_at_checkout_with_policy_html'
                  | t: link: shop.shipping_policy.url
                }}
              {%- endif -%}
            {%- elsif cart.duties_included == false and cart.taxes_included == false -%}
              {%- if shop.shipping_policy.body == blank -%}
                {{ 'sections.cart.taxes_at_checkout_shipping_at_checkout_without_policy' | t }}
              {%- endif -%}
            {%- endif -%}
          </small>
        </div>

        {% render 'ms-trustpilot-rad', kompakt: true %}
        <!-- CTAs -->
`;

test('momsraden: borta under priset på alla språk, fraktpolicyns länk ritas som förut, idempotent', () => {
  const r = patchaProduktMoms(PRODUKT_MOMS_BLOCK);
  assert.deepEqual(r.byten, ['momsraden_under_priset']);
  assert.ok(!/taxes_included|duties_included/.test(r.kod), 'ingen skatte- eller tullnyckel kvar');
  assert.ok(!r.kod.includes(PRODUKT_MOMS_VILLKOR), 'diven ritas bara när fraktpolicyn finns');
  assert.ok(r.kod.includes("{%- if shop.shipping_policy.body != blank -%}\n                  <div class=\"product__tax caption rte\">"));
  assert.ok(r.kod.includes("{{ 'products.product.shipping_policy_html' | t: link: shop.shipping_policy.url }}"));
  assert.ok(r.kod.includes(MOMS_MARK));
  assert.ok(r.kod.endsWith('{% schema %}\n{ "name": "t:sections.main-product.name" }\n{% endschema %}\n'), 'schemat orört');
  // Liquid-taggarna går jämnt upp (fixturens första rad är ett endif från blocket före).
  assert.equal((r.kod.match(/\{%- if /g) ?? []).length, (r.kod.match(/\{%- endif -%\}/g) ?? []).length - 1);
  assert.ok(!/\{%- elsif/.test(r.kod), 'inga lösa elsif kvar');
  assert.deepEqual(patchaProduktMoms(r.kod).byten, []);
  assert.throws(() => patchaProduktMoms('<div class="product__tax">Skatter ingår.</div>'), /hittades 0 gånger/);
});

test('momsraden: korgens rad är tom, elementet och Trustpilot-raden står kvar, idempotent', () => {
  const r = patchaKorgMoms(KORG_MOMS_BLOCK);
  assert.deepEqual(r.byten, ['momsraden_i_varukorgen']);
  assert.ok(!/taxes|duties|shipping_at_checkout/.test(r.kod), 'ingen text om skatt, tull, rabatter eller frakt kvar');
  assert.ok(r.kod.includes(`          <small class="tax-note caption-large rte">\n            {%- comment -%} ${MOMS_MARK}`));
  assert.ok(r.kod.includes('{%- endcomment -%}\n          </small>\n        </div>'), 'elementet stängs på samma rad som förut');
  assert.ok(r.kod.includes("{% render 'ms-trustpilot-rad', kompakt: true %}"), 'den andra sessionens Trustpilot-rad orörd');
  assert.ok(r.kod.includes("{{ cart.total_price | money_with_currency }}"), 'totalsumman orörd');
  assert.deepEqual(patchaKorgMoms(r.kod).byten, []);
  assert.throws(() => patchaKorgMoms('<small class="tax-note">x</small>'), /hittades 0 gånger/);
});

test('momsraden: alla fem Dawn-filer som ritar raden patchas', () => {
  for (const f of ['sections/main-product.liquid', 'sections/featured-product.liquid']) assert.equal(PATCHAR[f], patchaProduktMoms, f);
  for (const f of ['sections/main-cart-footer.liquid', 'snippets/cart-drawer.liquid', 'snippets/quick-order-list.liquid']) assert.equal(PATCHAR[f], patchaKorgMoms, f);
});
