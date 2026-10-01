// patch.mjs — Bäverbutikens tema får ett VÄRLDSLÄGE: Beaver Store för engelska besökare.
//
//   node worldwide/tema/patch.mjs --lage                       # vilka filer som är patchade i MAIN
//   node worldwide/tema/patch.mjs --prov                       # kopia av MAIN + provmallar (torrt: säger bara vad)
//   node worldwide/tema/patch.mjs --prov --skarpt              # skriv kopian "WORLDWIDE PROV <datum>"
//   node worldwide/tema/patch.mjs --tema <gid> --skarpt        # patcha ett givet tema (MAIN = det publicerade)
//
// Världsläget (snippets/bw-lage.liquid) är på när sidan visas på engelska eller på
// beaverstoreco.com. Då byts loggan mot "BEAVER STORE" (samma bäver och svenska flagga),
// annonsraden blir "🇺🇸 Free shipping to the United States" + "🇸🇪 A Swedish brand",
// produktsidans lastbilsrad blir fri frakt till kundens land, förtroenderaden och
// recensionsbandet får engelska, och butiksnamnet i titel/og/sidfot blir "Beaver Store".
// Fri frakt-raden visas bara när kundens land ligger i marknaden "worldwide" — där är
// frakten fri (worldwide/bygg.mjs --steg frakt). Utan den marknaden syns aldrig raden.
//
// ⛔ Den svenska sidan ritas exakt som förut: varje patch ligger i en gren som bara tar när
// bw-lage säger "ww", och Sverige på baverbutiken.se har svenska. Testet
// worldwide/test/worldwide.test.mjs bevisar att svenska grenen är ordagrant originalet.
// Varje patch bär markören `bw-worldwide` och görs bara en gång (idempotent).
// themeFilesUpsert är INTE atomär (Matstrumpor 2026-09-27) — originalen sparas i
// worldwide/tema/original/<tema-id>/ innan något skrivs.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = dirname(fileURLToPath(import.meta.url));
export const MARKOR = 'bw-worldwide';
// v2 (2026-09-30): texterna kommer ur snippets/bw-t.liquid på åtta språk (tema/sprak.json).
export const VERSION = 'v5'; // v5 2026-09-30 kväll: Kachings och Judge.me:s svenska texter byts i sidan (bw-appord) · v3 2026-09-30: startsidans titel Beaver Store · v4: og/twitter-titeln och den dolda h1:an
// Apptexternas egen version (snippets/bw-appord.liquid skrivs om varje körning; de nio patchade
// filerna rörs inte när bara appord ändras — då behövs ingen ny VERSION).
// a2 2026-10-01: Kachings paketnamn, Judge.me:s hela widget som hela meningar (appord.json → exakt; jdgm är källan), korgens rabattrader, Trust Badges dold, platshållarprodukter dolda, bara besökarens språk skickas.
// a3 2026-10-01: färgvärden kopplade till Shopifys färgkategori (appord.json → varden) i produktens väljare och korgens rad, och "Recently viewed" hämtar produkterna på besökarens språk.
// a4 2026-10-01: texterna jämförs med enkla mellanslag (Kachings "1x  MC-Kapell 218×118 cm" stod kvar på svenska).
// a5 2026-10-01: länkar till butikens sidor får besökarens språkprefix, "Customer support from Sweden", "Sätesöverdrag" i korgen.
// a6 2026-10-01: kollektionssidans svenska reabanner dold, Bäverlampans bild med svensk text byts mot produktens andra bild.
// a7 2026-10-01: galleribilder med svensk text tas bort ur produktsidornas bildspel (GALLERI).
// a8 2026-10-01: färgkategorins engelska rester (Pink, Purple, Khaki) på es/it/pt-PT, de och fr.
// a9 2026-10-01: samma tre färger på alla sju språk (tyskan visade fortfarande "Pink" i Kaching).
// a10 2026-10-01: Impressum-länk i sidfoten, bara på tyska (tysk lag, § 5 DDG; sidan är AGB:s tyska översättning).
export const APPORD_VERSION = 'a10';
const CAP = `{%- capture bw -%}{%- render 'bw-lage' -%}{%- endcapture -%}{%- comment -%}${MARKOR} ${VERSION}{%- endcomment -%}`;
/** Världslägets text på besökarens språk. */
// Utan bindestreck: mellanslaget före och efter texten ska stå kvar ("4,8 von 5").
const T = (k) => `{% render 'bw-t', k: '${k}' %}`;
/** Samma, med [[flagga]]/[[land]] ersatta av kundens land. */
const TL = (k) => `{%- capture bw_s -%}${T(k)}{%- endcapture -%}{%- render 'bw-land', text: bw_s -%}`;
/** Betyget: punkt på engelska (4.8), komma på de andra språken (4,8). */
const BETYG = `{%- if request.locale.iso_code == 'en' -%}{{ betyg_text | replace: ',', '.' }}{%- else -%}{{ betyg_text }}{%- endif %}`;

function byt(innehall, fran, till, fil) {
  const n = innehall.split(fran).length - 1;
  if (n !== 1) throw new Error(`${fil}: väntade EN träff på ${JSON.stringify(fran.slice(0, 70))}, fick ${n}`);
  return innehall.replace(fran, till);
}

/** En patch per fil: ren funktion originaltext → ny text. Kastar om temat inte ser ut som väntat. */
export const PATCHAR = {
  'snippets/header-logo-block.liquid': (t, f) => byt(byt(t,
    // Startsidans dolda h1 (skärmläsare, sökmotorer) — utan bindestreck, så svenska grenen renderas som förut.
    `        <span class="visually-hidden">{{ shop.name }}</span>`,
    `        <span class="visually-hidden">{% capture bw_h %}{% render 'bw-lage' %}{% endcapture %}{% if bw_h contains 'ww' %}Beaver Store{% else %}{{ shop.name }}{% endif %}</span>`, f),
    `    {%- if block.settings.logo -%}\n      {% comment %}`,
    `    ${CAP}\n    {%- if bw contains 'ww' -%}\n      <a href="{{ routes.root_url }}" itemprop="url" class="site-header__logo-link">\n        <img src="{{ 'beaver-store-logga.png' | asset_url }}" alt="Beaver Store" itemprop="logo" width="1920" height="1080" style="height:auto">\n      </a>\n    {%- elsif block.settings.logo -%}\n      {% comment %}`, f),

  'snippets/footer-logo.liquid': (t, f) => byt(t,
    `      <img src="{{ block.settings.logo | img_url: footer_logo_size, scale: 2 }}" alt="{{ block.settings.logo.alt | default: shop.name }}">`,
    `      ${CAP}\n      {%- if bw contains 'ww' -%}\n      <img src="{{ 'beaver-store-logga.png' | asset_url }}" alt="Beaver Store">\n      {%- else -%}\n      <img src="{{ block.settings.logo | img_url: footer_logo_size, scale: 2 }}" alt="{{ block.settings.logo.alt | default: shop.name }}">\n      {%- endif -%}`, f),

  'snippets/announcement-bar.liquid': (t, f) => {
    t = byt(t, `{% if show_announcement %}`,
      `${CAP}\n{%- if bw contains 'ww' -%}\n  {%- assign show_announcement = true -%}\n  {%- if bw contains 'frakt' -%}{%- assign announcement_block_count = 2 -%}{%- else -%}{%- assign announcement_block_count = 1 -%}{%- endif -%}\n{%- endif -%}\n\n{% if show_announcement %}`, f);
    t = byt(t, `          {%- assign slide_index = 0 -%}\n`,
      `          {%- if bw contains 'ww' -%}\n            {%- if bw contains 'frakt' -%}\n              <div id="AnnouncementSlide-bw-frakt" class="announcement-slider__slide" data-index="0">\n                <span class="announcement-text">${TL('frakt_till')}</span>\n                <span class="announcement-link-text">${T('sparad')}</span>\n              </div>\n            {%- endif -%}\n            <div id="AnnouncementSlide-bw-svenskt" class="announcement-slider__slide" data-index="{% if bw contains 'frakt' %}1{% else %}0{% endif %}">\n              <span class="announcement-text">${T('svenskt')}</span>\n              <span class="announcement-link-text">${T('goteborg')}</span>\n            </div>\n          {%- else -%}\n          {%- assign slide_index = 0 -%}\n`, f);
    return byt(t, `          {%- endfor -%}\n        </div>`, `          {%- endfor -%}\n          {%- endif -%}\n        </div>`, f);
  },

  'snippets/product-template.liquid': (t, f) => byt(t,
    `                            <span>{{ block.settings.text }}</span>\n                          </span>\n                        </li>`,
    `                            ${CAP}\n                            {%- if bw contains 'ww' and block.settings.icon == 'truck' -%}\n                            <span>{%- if bw contains 'frakt' -%}${TL('produkt_frakt')}{%- else -%}${T('produkt_sparad')}{%- endif -%}</span>\n                            {%- else -%}\n                            <span>{{ block.settings.text }}</span>\n                            {%- endif -%}\n                          </span>\n                        </li>\n                        {%- if bw contains 'ww' and block.settings.icon == 'truck' -%}\n                        <li class="sales-point"><span class="icon-and-text"><span aria-hidden="true" style="font-size:18px;line-height:1">🇸🇪</span> <span>${T('produkt_svenskt')}</span></span></li>\n                        {%- endif -%}`, f),

  'sections/bb-fortroende.liquid': (t, f) => {
    t = byt(t, `<div class="bb-fortroende" data-section-id`, `${CAP}\n<div class="bb-fortroende" data-section-id`, f);
    t = byt(t, `      {%- for block in section.blocks -%}\n        <li class="bb-fortroende__punkt"`,
      `      {%- for block in section.blocks -%}\n        {%- assign bw_titel = '' -%}{%- assign bw_rad = '' -%}{%- assign bw_dold = false -%}\n        {%- if bw contains 'ww' -%}\n          {%- case block.settings.ikon -%}\n            {%- when 'paket' -%}\n              {%- if bw contains 'frakt' -%}{%- capture bw_titel -%}${T('f_frakt_titel')}{%- endcapture -%}{%- capture bw_rad -%}${TL('f_frakt_rad')}{%- endcapture -%}{%- else -%}{%- assign bw_dold = true -%}{%- endif -%}\n            {%- when 'kort' -%}{%- capture bw_titel -%}${T('f_sparad_titel')}{%- endcapture -%}{%- capture bw_rad -%}${T('f_sparad_rad')}{%- endcapture -%}\n            {%- when 'flagga' -%}{%- capture bw_titel -%}${T('f_svenskt_titel')}{%- endcapture -%}{%- capture bw_rad -%}${T('f_svenskt_rad')}{%- endcapture -%}\n          {%- endcase -%}\n        {%- endif -%}\n        {%- if bw_dold -%}{%- continue -%}{%- endif -%}\n        <li class="bb-fortroende__punkt"`, f);
    t = byt(t, `{{ betyg_text }} av 5 <span`, `{%- if bw contains 'ww' -%}${BETYG} ${T('av5')}{%- else -%}{{ betyg_text }} av 5{%- endif %} <span`, f);
    t = byt(t, `{{ antal }} {{ block.settings.rad | default: 'recensioner från kunder' }}`, `{{ antal }} {% if bw contains 'ww' %}${T('kundrec')}{% else %}{{ block.settings.rad | default: 'recensioner från kunder' }}{% endif %}`, f);
    t = byt(t, `{{ block.settings.titel_reserv | default: 'Recensioner' }}`, `{% if bw contains 'ww' %}${T('rec')}{% else %}{{ block.settings.titel_reserv | default: 'Recensioner' }}{% endif %}`, f);
    t = byt(t, `{{ block.settings.rad_reserv | default: 'från riktiga kunder' }}`, `{% if bw contains 'ww' %}${T('riktiga')}{% else %}{{ block.settings.rad_reserv | default: 'från riktiga kunder' }}{% endif %}`, f);
    t = byt(t, `<span class="bb-fortroende__titel">{{ block.settings.titel }}</span>`, `<span class="bb-fortroende__titel">{% if bw_titel != '' %}{{ bw_titel }}{% else %}{{ block.settings.titel }}{% endif %}</span>`, f);
    return byt(t, `{%- if block.settings.rad != blank -%}<span class="bb-fortroende__rad">{{ block.settings.rad }}</span>{%- endif -%}`,
      `{%- if bw_rad != '' -%}<span class="bb-fortroende__rad">{{ bw_rad }}</span>{%- elsif block.settings.rad != blank -%}<span class="bb-fortroende__rad">{{ block.settings.rad }}</span>{%- endif -%}`, f);
  },

  'sections/bb-recensioner.liquid': (t, f) => {
    t = byt(t, `<div class="bb-rec" id="kunderna-sager"`, `${CAP}\n<div class="bb-rec" id="kunderna-sager"`, f);
    t = byt(t, `{{ betyg_text }} av 5 i snitt, baserat på {{ antal }} recensioner.</p>`,
      `{%- if bw contains 'ww' -%}{%- capture bw_s -%}${T('snitt')}{%- endcapture -%}${BETYG} {{ bw_s | replace: '[[antal]]', antal }}{%- else -%}{{ betyg_text }} av 5 i snitt, baserat på {{ antal }} recensioner.{%- endif -%}</p>\n      {%- endif -%}\n      {%- if bw contains 'ww' -%}\n        <p class="bb-rec__ingress" style="opacity:.75;font-size:14px">${T('rec_sverige')}</p>`, f);
    t = byt(t, `aria-label="Recensioner från kunder"`, `aria-label="{% if bw contains 'ww' %}${T('aria_kundrec')}{% else %}Recensioner från kunder{% endif %}"`, f);
    t = byt(t, `aria-label="{{ block.settings.betyg }} av 5 stjärnor"`, `aria-label="{{ block.settings.betyg }} {% if bw contains 'ww' %}${T('stjarnor')}{% else %}av 5 stjärnor{% endif %}"`, f);
    t = byt(t, `</svg>Verifierat köp</span>`, `</svg>{% if bw contains 'ww' %}${T('verifierat')}{% else %}Verifierat köp{% endif %}</span>`, f);
    t = byt(t, `aria-label="Föregående recensioner"`, `aria-label="{% if bw contains 'ww' %}${T('foreg')}{% else %}Föregående recensioner{% endif %}"`, f);
    return byt(t, `aria-label="Fler recensioner"`, `aria-label="{% if bw contains 'ww' %}${T('fler')}{% else %}Fler recensioner{% endif %}"`, f);
  },

  'sections/footer.liquid': (t, f) => byt(t,
    `    <p class="footer__small-text">&copy; {{ 'now' | date: '%Y' }} Bäverbutiken. Alla rättigheter förbehållna.</p>`,
    `    ${CAP}\n    {%- if bw contains 'ww' -%}\n    {%- render 'bw-appord' -%}\n    <p class="footer__small-text">&copy; {{ 'now' | date: '%Y' }} Beaver Store · STONEBITE ECOM AB, ${T('copyright')}</p>\n    {%- else -%}\n    <p class="footer__small-text">&copy; {{ 'now' | date: '%Y' }} Bäverbutiken. Alla rättigheter förbehållna.</p>\n    {%- endif -%}`, f),

  'snippets/seo-title.liquid': (t, f) => {
    // Startsidan har ingen egen SEO-titel, så page_title är butiksnamnet "Bäverbutiken.se" — i världsläget Beaver Store.
    t = `${CAP}\n{%- assign bw_namn = shop.name -%}{%- if bw contains 'ww' -%}{%- assign bw_namn = 'Beaver Store' -%}{%- if page_title == shop.name -%}{%- assign page_title = 'Beaver Store' -%}{%- endif -%}{%- endif -%}\n` + t;
    t = byt(t, `    {{ shop.name }}\n  {%- else -%}`, `    {{ bw_namn }}\n  {%- else -%}`, f);
    t = byt(t, `{%- unless page_title contains shop.name -%}\n      &ndash; {{ shop.name }}`, `{%- unless page_title contains bw_namn -%}\n      &ndash; {{ bw_namn }}`, f);
    return t;
  },

  'snippets/social-meta-tags.liquid': (t, f) => {
    t = `${CAP}\n{%- assign bw_namn = shop.name -%}{%- if bw contains 'ww' -%}{%- assign bw_namn = 'Beaver Store' -%}{%- endif -%}\n` + t;
    // Startsidans og/twitter-titel och beskrivning faller tillbaka på butiksnamnet "Bäverbutiken.se".
    t = byt(t, `  assign og_description = page_description | default: shop.description | default: shop.name\n-%}`,
      `  assign og_description = page_description | default: shop.description | default: shop.name\n  if bw contains 'ww'\n    if og_title == shop.name\n      assign og_title = 'Beaver Store'\n    endif\n    if og_description == shop.name\n      capture og_description\n        echo 'Beaver Store · '\n        render 'bw-t', k: 'produkt_svenskt'\n      endcapture\n    endif\n  endif\n-%}`, f);
    return byt(t, `<meta property="og:site_name" content="{{ shop.name }}">`, `<meta property="og:site_name" content="{{ bw_namn }}">`, f);
  },
};

/** snippets/bw-appord.liquid ur tema/appord.json: byter Kachings och Judge.me:s svenska texter på besökarens språk.
 * Renderas bara i världsläget (sidfotens ww-gren). Rör bara textnoder inne i apparnas egna element. */
export function byggAppord(ord = JSON.parse(readFileSync(join(ROT, 'appord.json'), 'utf8'))) {
  // Bara besökarens språk skickas till sidan (en gren per språk i Liquid, ~1/8 av datan), och datan
  // ligger i {% raw %}: Judge.me:s texter bär {{ n }}, som Liquid annars hade ritat som tomt.
  const SPRAK = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt-PT'];
  const valj = (v, l) => (v && typeof v === 'object' ? v[l] ?? v[l.split('-')[0]] ?? v.en : v) ?? null;
  const forSprak = (l) => {
    const exakt = {}; for (const [k, v] of Object.entries(ord.exakt)) { const t = valj(v, l); if (t) exakt[k] = t; }
    const monster = ord.monster.map((m) => ({ sv: m.sv, t: valj(m, l) })).filter((m) => m.t);
    const varden = {}; for (const [k, v] of Object.entries(ord.varden ?? {})) { const t = valj(v, l); if (t) varden[k] = t; }
    const j = JSON.stringify({ exakt, monster, varden }).replace(/</g, '\\u003c');
    if (/\{%-?\s*endraw/.test(j)) throw new Error('appord.json innehåller endraw');
    return j;
  };
  const grenar = SPRAK.filter((l) => l !== 'en').map((l) => `  {%- when '${l}' -%}{% raw %}O = ${forSprak(l)};{% endraw %}`).join('\n');
  const data = `{%- case request.locale.iso_code -%}\n${grenar}\n  {%- else -%}{% raw %}O = ${forSprak('en')};{% endraw %}\n  {%- endcase -%}`;
  return `{%- comment -%}${MARKOR} ${VERSION} appord ${APPORD_VERSION} — genererad av worldwide/tema/patch.mjs ur tema/appord.json. Ändra där, inte här.{%- endcomment -%}
{%- comment -%}Ultimate Trust Badges ritar "Betala säkert med våra samarbetspartners." + Klarna- och Swish-logor
under köpknappen, bara på svenska (worldwide-granskningen 2026-10-01, samma som Matstrumpor 2026-09-30).
I världsläget döljs raden.{%- endcomment -%}
{%- comment -%}Tysk lag (§ 5 DDG) kräver ett Impressum som går att hitta från varje sida. Det står överst i AGB:s
tyska översättning (#impressum). Länken ritas bara på tyska; inget annat språk och inte Sverige får den.{%- endcomment -%}
{%- if request.locale.iso_code == 'de' -%}<p class="footer__small-text bw-impressum"><a href="{{ routes.root_url | append: '/pages/anvandarvillkor#impressum' | replace: '//', '/' }}">Impressum</a></p>{%- endif -%}
<style>#ultimateTrustBadgeswidgetDiv{display:none!important}.shopify-section:has(.grid-product .placeholder-svg){display:none!important}body.template-collection .shopify-section[id$="__promo-grid"]{display:none!important}</style>
{%- comment -%}Andra regeln: korgsidans "Popular picks" har ingen kollektion vald och visade fyra "Example product
$29" (mätt 2026-10-01). En produktsektion med Shopifys platshållare döljs i världsläget.
Tredje regeln: kollektionssidans banner (promo-grid, bilden hf_20260622_143757…) är en svensk reabild
(mätt 2026-10-01). Den döljs i världsläget; den svenska sidan visar den som förut.{%- endcomment -%}
<script>
(function () {
  var O;
  ${data}
  function tr(v) { return v || null; }
  // Temats "Recently viewed" hämtar /products/<handle>.js utan språkprefix, så /de, /fr … fick engelska
  // titlar (mätt 2026-10-01). Bara den sortens adress får prefixet; allt annat går orört.
  function medRot(u, rot) { return typeof u === 'string' && rot && rot !== '/' && u.slice(0, 10) === '/products/' && u.split('?')[0].slice(-3) === '.js' && u.indexOf('/', 10) < 0 ? rot.slice(0, -1) + u : u; }
  var rot = window.Shopify && Shopify.routes && Shopify.routes.root;
  if (rot && rot !== '/' && window.fetch) { var f0 = window.fetch; window.fetch = function (u, o) { return f0.call(this, medRot(u, rot), o); }; }
  // Sektionernas länkar är sparade utan språkprefix ("Mehr über uns" → /pages/om-oss gav den engelska
  // sidan på /de, mätt 2026-10-01). Länkar till butikens egna sidor får besökarens prefix.
  function medPrefix(h, rot, dom) {
    if (!h || !rot || rot === '/') return h;
    var p = h.indexOf(dom + '/') === 0 ? h.slice(dom.length) : h;
    if (p.charAt(0) !== '/' || p.charAt(1) === '/' || p.indexOf(rot) === 0 || p + '/' === rot) return h;
    var del = p.split('/')[1].split('?')[0];
    if (['pages', 'products', 'collections', 'policies', 'blogs', 'search'].indexOf(del) < 0) return h;
    return (p === h ? '' : dom) + rot.slice(0, -1) + p;
  }
  function lankar(dom) { if (!rot || rot === '/' || !dom.querySelectorAll) return; dom.querySelectorAll('a[href]').forEach(function (a) { var h = a.getAttribute('href'), ny = medPrefix(h, rot, location.origin); if (ny !== h) a.setAttribute('href', ny); }); }
  // Bäverlampans första bild bär svensk text ("3X kraftfullt LED-ljus", OCR 2026-10-01) och visas på
  // startsidans steg och produktsidan. I världsläget får den produktens andra bild, som saknar text.
  // Galleribilder med inbränd svensk text (OCR på alla 103 galleribilder i de 16 annonsprodukterna,
  // 2026-10-01): "Effektiv fixering", "Fyra färgalternativ", "Multifunktionell spöhållare", "Före/Efter",
  // "Setet i siffror", "Måttskiss", "Justerbart spänne", "Andas och leder bort fukt", "Storlek 41–46",
  // "Storleksguide", "Storlek på utombordsmotorkåpa". Ingen av dem är en variantbild. Bilden och dess
  // miniatyr tas bort INNAN temats bildspel startar (theme.min.js är defer, det här skriptet körs medan
  // sidan läses in), och resten numreras om så att miniatyr, bildspel och zoom pekar på samma bild.
  // Måtten i två av dem står i produkttexten i stället (granskning/svenska-bilder.mjs).
  var GALLERI = /\\/files\\/(?:hf_20260817_0533(?:07|29|44)|hf_20260817_053401|klart-forefter-tankoverdrag-sv|b8-sotarset-fakta-se|mc-matt-sv|klart-(?:spanne|matt|karborre)-benskydd-sv|b10-taljset-fakta-se|15-sv|batmotor-tabell-sv|Namnlosdesign)[._]/;
  function galleri(dom) {
    if (!dom.querySelectorAll) return;
    dom.querySelectorAll('[data-product-images]').forEach(function (g) {
      var bort = [];
      g.querySelectorAll('.product-main-slide').forEach(function (s) {
        var i = s.querySelector('img[data-src], img[src]'), u = i && (i.getAttribute('data-src') || i.getAttribute('src'));
        if (u && GALLERI.test(u)) { bort.push(s.getAttribute('data-index')); s.remove(); }
      });
      if (!bort.length) return;
      g.querySelectorAll('.product__thumb-item').forEach(function (t) { if (bort.indexOf(t.getAttribute('data-index')) >= 0) t.remove(); });
      var sl = g.querySelectorAll('.product-main-slide');
      sl.forEach(function (s, n) { s.setAttribute('data-index', n); s.querySelectorAll('.photoswipe__image').forEach(function (p) { p.setAttribute('data-index', n + 1); }); });
      g.querySelectorAll('.product__thumb-item').forEach(function (t, n) { t.setAttribute('data-index', n); t.querySelectorAll('[data-product-thumb]').forEach(function (a) { a.setAttribute('data-index', n); }); });
      if (sl.length <= 1) { g.setAttribute('data-has-slideshow', 'false'); var th = g.querySelector('[data-product-thumbs]'); if (th) th.classList.add('medium-up--hide'); }
    });
  }
  galleri(document);
  var BILDBYTE = [[/3XKraftfulltLEDLjus((?:_[0-9x]+)?)\\.png/g, 'WhatsAppImage2026-03-02at09.54.06_1$1.jpg']];
  function bytBild(v) { for (var i = 0; i < BILDBYTE.length; i++) v = v.replace(BILDBYTE[i][0], BILDBYTE[i][1]); return v; }
  function bilder(dom) {
    if (!dom.querySelectorAll) return;
    dom.querySelectorAll('img, source').forEach(function (e) {
      ['src', 'srcset', 'data-src', 'data-srcset', 'data-bgset'].forEach(function (a) { var v = e.getAttribute(a); if (v && v.indexOf('3XKraftfulltLEDLjus') >= 0) e.setAttribute(a, bytBild(v)); });
    });
  }
  // ⚠️ window.jdgmSettings skrivs INTE om. Prövat 2026-10-01: Judge.me:s nya widget (jm-*) blandade då
  // ihop språken ("Write a recension", "Reviews på andra språk", recensionsrubriken "Great skydd!").
  // Texterna byts i stället i sidan, som hela meningar, och aldrig inne i kundernas egna recensioner.
  var M = O.monster.map(function (m) { return { re: new RegExp(m.sv), m: m.t }; });
  var SEL = 'kaching-bundle, kaching-bundles-block, [class*="jdgm"]';
  // Varukorgen (lådan och korgsidan) bär Kachings rabattnamn per rad: "2x Skyddshölje (-€6,10)".
  // Där byts BARA sådana rader — namnet före parentesen måste stå i appord.json.
  // Kundernas egna ord (rubrik, text, namn, butikens svar) byts aldrig: "Bra" i en recensionsrubrik är kundens.
  var EGNA = '.jm-review-content, [class*="review-content"], .jm-review-author, [class*="reviewer-name"], .jdgm-rev__title, .jdgm-rev__body, .jdgm-rev__author, .jdgm-rev__reply, .jdgm-rev__content, .jdgm-carousel-item__review, .jdgm-carousel-item__reviewer-name';
  var KORG = '#CartDrawer, .drawer, [data-section-type="cart"], .cart__page, form[action*="/cart"]';
  // Färgvärden kopplade till Shopifys färgkategori ("Color: Grön") går inte att översätta som vanliga
  // alternativvärden. De byts i produktens väljare och korgens rad — bara textnoden, aldrig inputens value.
  var VARDEN = '.cart__item--variants, .variant-input-wrap, .variant__label-info';
  function bytVarde(n) {
    var t = n.nodeValue; if (!t || !t.trim()) return;
    var ra = t.trim(), k = ra.replace(/\\s+/g, ' '); if (O.varden[k] && O.varden[k] !== k) n.nodeValue = t.replace(ra, O.varden[k]);
  }
  function byt(n, baraRabatt) {
    var t = n.nodeValue; if (!t || !t.trim()) return;
    // Kaching sparar ibland två mellanslag ("1x  MC-Kapell 218×118 cm"): nyckeln jämförs med enkla mellanslag.
    var ra = t.trim(), k = ra.replace(/\\s+/g, ' '), ny = null;
    var par = /^(.+?)( \\(.+\\))$/.exec(k);
    if (par && O.exakt[par[1]]) ny = tr(O.exakt[par[1]]) + par[2];
    else if (baraRabatt) ny = O.exakt[k] && /^\\d+x |^\\d+ ?-? ?Par$/.test(k) ? tr(O.exakt[k]) : null;
    else if (O.exakt[k]) ny = tr(O.exakt[k]);
    else if (O.varden[k]) ny = O.varden[k];
    else for (var i = 0; i < M.length; i++) { var r = M[i].re.exec(k); if (r) { var x = tr(M[i].m); if (x) ny = x.replace('[[n]]', r[1] || ''); break; } }
    if (ny && ny !== k) n.nodeValue = t.replace(ra, ny);
  }
  function gå(rot) {
    var w = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT, null), n;
    while ((n = w.nextNode())) { var p = n.parentElement; if (!p || !p.closest || p.closest(EGNA)) continue; if (p.closest(SEL)) byt(n, false); else if (p.closest(VARDEN)) bytVarde(n); else if (p.closest(KORG)) byt(n, true); }
    if (rot.querySelectorAll) rot.querySelectorAll('[placeholder]').forEach(function (e) { if (e.closest(SEL) && O.exakt[e.placeholder]) e.placeholder = tr(O.exakt[e.placeholder]); });
    // Skärmläsarens texter (aria-label="Se alla recensioner" på stjärnorna) byts också.
    if (rot.querySelectorAll) rot.querySelectorAll('[aria-label]').forEach(function (e) { var a = e.getAttribute('aria-label'); if (a && e.closest(SEL) && O.exakt[a.trim()]) e.setAttribute('aria-label', tr(O.exakt[a.trim()])); });
  }
  var väntar = false;
  function kör() { väntar = false; gå(document.body); lankar(document); bilder(document); }
  new MutationObserver(function () { if (!väntar) { väntar = true; requestAnimationFrame(kör); } }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  if (document.readyState !== 'loading') kör(); else document.addEventListener('DOMContentLoaded', kör);
})();
</script>
`;
}

/** snippets/bw-t.liquid ur tema/sprak.json: {% render 'bw-t', k: 'nyckel' %} → texten på besökarens språk. */
export function byggBwT(sprak = JSON.parse(readFileSync(join(ROT, 'sprak.json'), 'utf8'))) {
  const rader = ["{%- comment -%}bw-t — världslägets texter per språk. GENERERAD av worldwide/tema/patch.mjs ur tema/sprak.json, redigera inte här.{%- endcomment -%}", '{%- liquid', '  assign l = request.locale.iso_code', '  case k'];
  for (const [k, v] of Object.entries(sprak)) {
    if (k.startsWith('_')) continue;
    rader.push(`    when '${k}'`, '      case l');
    for (const [l, t] of Object.entries(v)) {
      if (l === 'en') continue;
      if (/["']/.test(t)) throw new Error(`sprak.json ${k}.${l}: raka citattecken går inte i Liquid-strängen`);
      rader.push(`        when '${l}'`, `          echo "${t}"`);
    }
    rader.push('        else', `          echo "${v.en}"`, '      endcase');
  }
  rader.push('  endcase', '-%}');
  return rader.join('\n') + '\n';
}

/** Nya filer (skrivs rakt av, ägs av worldwide/tema). */
export function nyaFiler() {
  return {
    'snippets/bw-t.liquid': { text: byggBwT() },
    'snippets/bw-appord.liquid': { text: byggAppord() },
    'snippets/bw-lage.liquid': { text: readFileSync(join(ROT, 'snippets', 'bw-lage.liquid'), 'utf8') },
    'snippets/bw-land.liquid': { text: readFileSync(join(ROT, 'snippets', 'bw-land.liquid'), 'utf8') },
    'assets/beaver-store-logga.png': { base64: readFileSync(join(ROT, 'logga', 'beaver-store-logga-q.png')).toString('base64') },
  };
}

/** Patcha en fil om den inte redan bär markören. */
export function patchaFil(fil, innehall) {
  if (innehall.includes(`${MARKOR} ${VERSION}`)) return { fil, lage: 'redan', text: innehall };
  if (innehall.includes(MARKOR)) throw new Error(`${fil} bär en äldre världspatch — patcha originalet (tema/original/<tema-id>/)`);
  const p = PATCHAR[fil];
  if (!p) throw new Error(`Ingen patch för ${fil}`);
  return { fil, lage: 'patchad', text: p(innehall, fil) };
}

// ---------------------------------------------------------------- Shopify

async function klient() {
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  // Bäverbutikens app "Bäver uppladdare" (write_themes) — nycklarna heter _SE.
  const butik = { ...lasButik('baverbutiken'), env_suffix: 'SE' };
  return skapaKlient(butik);
}

const FILFRAGA = `query($t:ID!,$f:[String!]){ theme(id:$t){ id name role files(filenames:$f, first:50){ nodes{ filename body{ ... on OnlineStoreThemeFileBodyText { content } } } } } }`;

export async function lasFiler(k, tema, filer) {
  const d = await k.graphql(FILFRAGA, { t: tema, f: filer });
  const ut = {};
  for (const n of d.theme.files.nodes) ut[n.filename] = n.body?.content ?? null;
  return { tema: d.theme, filer: ut };
}

export async function skrivFiler(k, tema, filer) {
  const files = Object.entries(filer).map(([filename, v]) => ({
    filename,
    body: v.base64 != null ? { type: 'BASE64', value: v.base64 } : { type: 'TEXT', value: v.text },
  }));
  for (let i = 0; i < files.length; i += 10) {
    const d = await k.graphql(`mutation($t:ID!,$f:[OnlineStoreThemeFilesUpsertFileInput!]!){ themeFilesUpsert(themeId:$t, files:$f){ upsertedThemeFiles{ filename } userErrors{ field message } } }`, { t: tema, f: files.slice(i, i + 10) });
    const fel = d.themeFilesUpsert.userErrors;
    if (fel?.length) throw new Error(`themeFilesUpsert: ${JSON.stringify(fel)}`);
  }
}

async function mainTema(k) {
  const d = await k.graphql(`{ themes(first:30){ nodes{ id name role } } }`);
  return d.themes.nodes.find((t) => t.role === 'MAIN');
}

async function huvud() {
  const a = process.argv.slice(2);
  const skarpt = a.includes('--skarpt');
  const k = await klient();
  const main = await mainTema(k);
  const filer = Object.keys(PATCHAR);

  if (a.includes('--lage')) {
    const { filer: inne } = await lasFiler(k, main.id, [...filer, ...Object.keys(nyaFiler())]);
    console.log(`MAIN: ${main.name} (${main.id})`);
    for (const f of [...filer, 'snippets/bw-lage.liquid', 'snippets/bw-land.liquid']) console.log(`  ${inne[f]?.includes(MARKOR) || (f.startsWith('snippets/bw-') && inne[f]) ? '✅' : '—'} ${f}`);
    return;
  }

  let mal = a.includes('--tema') ? a[a.indexOf('--tema') + 1] : null;
  const prov = a.includes('--prov');
  if (!mal && !prov) { console.error('Ange --prov eller --tema <gid> (MAIN: ' + main.id + ').'); process.exit(2); }

  // Källan är alltid MAIN (den publicerade svenska sidan).
  const { filer: original } = await lasFiler(k, main.id, filer);
  const sparat = join(ROT, 'original', main.id.split('/').pop());
  for (const f of filer) {
    // Bär MAIN en äldre version av patchen utgår den nya från det sparade originalet.
    if (original[f]?.includes(MARKOR) && !original[f].includes(`${MARKOR} ${VERSION}`)) {
      const p = join(sparat, f.replace(/\//g, '__'));
      if (!existsSync(p)) throw new Error(`${f}: äldre patch i MAIN men inget sparat original i ${sparat}`);
      original[f] = readFileSync(p, 'utf8');
    }
  }
  const plan = {};
  for (const f of filer) {
    if (original[f] == null) throw new Error(`${f} finns inte i MAIN`);
    const r = patchaFil(f, original[f]);
    plan[f] = r;
    console.log(`  ${r.lage === 'redan' ? '·' : '✎'} ${f} (${r.lage})`);
  }

  if (prov) {
    const namn = `WORLDWIDE PROV ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
    if (!skarpt) { console.log(`\nTorrt: skulle kopiera MAIN till "${namn}", patcha ${filer.length} filer, lägga ${Object.keys(nyaFiler()).length} nya filer och provmallarna product.wwtest.json + index.wwtest.json.`); return; }
    const d = await k.graphql(`mutation($id:ID!,$n:String){ themeDuplicate(id:$id, name:$n){ newTheme{ id name } userErrors{ field message } } }`, { id: main.id, n: namn });
    if (d.themeDuplicate.userErrors?.length) throw new Error(JSON.stringify(d.themeDuplicate.userErrors));
    mal = d.themeDuplicate.newTheme.id;
    console.log(`Kopia: ${namn} ${mal}`);
    // Vänta tills kopian är klar (filerna finns).
    for (let i = 0; i < 30; i++) {
      const { filer: f } = await lasFiler(k, mal, ['templates/product.claudeprodukter.json', 'templates/index.json']).catch(() => ({ filer: {} }));
      if (f['templates/product.claudeprodukter.json'] && f['templates/index.json']) {
        await skrivFiler(k, mal, { 'templates/product.wwtest.json': { text: f['templates/product.claudeprodukter.json'] }, 'templates/index.wwtest.json': { text: f['templates/index.json'] } });
        break;
      }
      await new Promise((r) => setTimeout(r, 4000));
    }
  } else if (skarpt) {
    const spar = join(ROT, 'original', mal.split('/').pop());
    mkdirSync(spar, { recursive: true });
    for (const f of filer) {
      const p = join(spar, f.replace(/\//g, '__'));
      if (!existsSync(p) && !original[f].includes(MARKOR)) writeFileSync(p, original[f]);
    }
    console.log(`Originalen sparade i ${spar}`);
  }

  if (!skarpt) { console.log(`\nTorrt: ${Object.values(plan).filter((r) => r.lage === 'patchad').length} filer skulle patchas i ${mal}.`); return; }
  const skriv = { ...nyaFiler() };
  for (const [f, r] of Object.entries(plan)) if (r.lage === 'patchad') skriv[f] = { text: r.text };
  await skrivFiler(k, mal, skriv);
  // Tillbakaläsning
  const { filer: tillbaka } = await lasFiler(k, mal, [...filer, 'snippets/bw-lage.liquid', 'snippets/bw-land.liquid', 'snippets/bw-t.liquid', 'snippets/bw-appord.liquid']);
  const saknas = [...filer].filter((f) => !tillbaka[f]?.includes(`${MARKOR} ${VERSION}`));
  for (const f of ['snippets/bw-lage.liquid', 'snippets/bw-land.liquid', 'snippets/bw-t.liquid', 'snippets/bw-appord.liquid']) if (tillbaka[f] !== skriv[f].text) saknas.push(f);
  if (saknas.length) { console.error(`✗ Tillbakaläsningen saknar: ${saknas.join(', ')}`); process.exit(1); }
  console.log(`✅ ${Object.keys(skriv).length} filer skrivna och tillbakalästa i ${mal}.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
