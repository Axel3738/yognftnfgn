// Front end: OPS Factorys sektioner för produktsidan.
//
// Visuell bas sedan 2026-09-05: CRO-temat (Dawn + ms-komponenterna från
// matstrumpor-cro-v5). Sektionerna renderas med temats ms-klasser och
// designtokens (ms-cro.css) — allt innehåll läses ur produktens opf-metafält,
// så samma tema fungerar för varje ny produkt utan att någon rör Liquid-koden.
// Saknas ett metafält renderas sektionen inte alls.
//
// Beskrivningsstrukturen är fast och alltid i samma ordning (Axels beslut
// 2026-09-05): 1 problem/emotion → 2 gif → 3 lösningen → 4 gif/bild →
// 5 funktioner → 6 bild → 7 garanti. Recensioner ägs av Judge.me (appblock i
// templaten), aldrig av en egen sektion. Sticky ATC och köpblocket ägs av
// temat (ms-sticky-atc, ms-paket).
//
// Tokens: var(--ms-*) med neutrala fallbacks — på CRO-temat tar ms-cro.css
// över, på ett naket tema ser sektionerna fortfarande rätt ut.

import { readFileSync } from 'node:fs';
import { arKalltext } from './kallskanning.mjs';

const BAS_CSS = `
  .opf-block { padding-block: var(--ms-section-y, clamp(32px, 6vw, 64px)); }
  .opf-wrap { max-width: 760px; margin-inline: auto; padding-inline: clamp(16px, 4vw, 32px); }
  .opf-eyebrow { display: inline-block; font-size: .78em; letter-spacing: .12em;
    text-transform: uppercase; color: var(--ms-accent, currentColor); margin-bottom: .6em; }
  .opf-h2 { font-size: clamp(1.7em, 1.2em + 2.2vw, 2.6em); line-height: 1.15;
    margin: 0 0 .35em; text-wrap: balance; }
  .opf-lede { font-size: 1em; color: var(--ms-ink-soft, inherit); line-height: 1.55;
    margin: 0; max-width: 62ch; }
  .opf-media { display: block; width: 100%; height: auto; margin-top: 1.5rem;
    border-radius: var(--ms-radius, 14px); box-shadow: var(--ms-shadow, 0 8px 24px rgba(18,18,18,.12)); }
  video.opf-media { background: var(--ms-surface-2, #f4f4f4); object-fit: cover; }
`;

/** Beskrivningsblockens media: en loopad MP4 när filen är video, annars bild.
 *
 *  Axels beslut 2026-09-09: demot i produktbeskrivningen ska vara en MP4 som
 *  loopar — inte en GIF och inte en WebP. En GIF på samma sekvens är ofta
 *  10–20× större och begränsad till 256 färger; en MP4 är mindre, skarpare och
 *  hårdvaruavkodad på mobilen. Kunden ser ingen skillnad i beteendet: den
 *  startar själv, är ljudlös och rullar om.
 *
 *  MetafältsNAMNEN ändras inte (`gif_problem`, `media_losning`,
 *  `bild_lifestyle`). De ligger live på heimguard.se och tankguard.se — byter
 *  vi nyckel tappar båda butikerna sitt innehåll tyst. Fälten är av typen
 *  `url` och bär redan vad som helst; det är RENDERINGEN som väljer.
 *
 *  Attributen är inte utbytbara:
 *    muted + playsinline  utan dem vägrar iOS och Chrome starta uppspelningen,
 *                         och kunden ser en svart ruta i stället för demot.
 *    preload="metadata"   första bildrutan ritas utan att hela filen laddas.
 *    disablepictureinpicture + inga controls  gör den till ett demo, inte en
 *                         spelare kunden ska pilla på.
 *
 *  Respekterar `prefers-reduced-motion`: den som stängt av rörelse i sitt
 *  system får första bildrutan stillastående i stället för en loop.
 */
export function opfMedia(uttryck) {
  return `{%- assign opf_url = ${uttryck} -%}
{%- assign opf_ext = opf_url | split: '?' | first | split: '.' | last | downcase -%}
{%- if opf_ext == 'mp4' or opf_ext == 'webm' or opf_ext == 'mov' -%}
  {%- if opf_ext == 'webm' -%}{%- assign opf_typ = 'video/webm' -%}
  {%- elsif opf_ext == 'mov' -%}{%- assign opf_typ = 'video/quicktime' -%}
  {%- else -%}{%- assign opf_typ = 'video/mp4' -%}{%- endif -%}
  <video class="opf-media" autoplay muted loop playsinline preload="metadata"
         disablepictureinpicture aria-label="{{ product.title | escape }}">
    <source src="{{ opf_url }}" type="{{ opf_typ }}">
  </video>
{%- else -%}
  <img class="opf-media" src="{{ opf_url }}" alt="{{ product.title | escape }}" loading="lazy">
{%- endif -%}`;
}

/** Pausar de loopande demona för den som bett systemet om mindre rörelse.
 *  Körs en gång per sida, oavsett hur många sektioner som ritat en video. */
export const OPF_MEDIA_SKRIPT = `<script>
  (function () {
    if (window.opfMediaRedan) return;
    window.opfMediaRedan = true;
    if (!window.matchMedia || !matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    addEventListener('DOMContentLoaded', function () {
      document.querySelectorAll('video.opf-media').forEach(function (v) {
        v.autoplay = false; v.removeAttribute('loop'); v.pause();
      });
    });
  })();
</script>`;

// --- 1 + 2. Problem/emotion och gif ---
const PROBLEM = `{%- assign rubrik = product.metafields.opf.problem_rubrik.value -%}
{%- assign text = product.metafields.opf.problem_text.value -%}
{%- assign eyebrow = section.settings.eyebrow -%}
{%- if eyebrow == blank -%}{%- if request.locale.iso_code == 'nb' -%}{%- assign eyebrow = 'Kjenner du deg igjen?' -%}{%- else -%}{%- assign eyebrow = 'Känner du igen det?' -%}{%- endif -%}{%- endif -%}
{%- if rubrik != blank or text != blank -%}
<div class="ms-scope opf-block opf-problem">
  <div class="opf-wrap">
    <span class="opf-eyebrow">{{ eyebrow }}</span>
    {%- if rubrik != blank -%}<h2 class="opf-h2">{{ rubrik }}</h2>{%- endif -%}
    {%- if text != blank -%}<p class="opf-lede">{{ text | newline_to_br }}</p>{%- endif -%}
    {%- if product.metafields.opf.gif_problem.value != blank -%}
${opfMedia('product.metafields.opf.gif_problem.value')}
    {%- endif -%}
  </div>
</div>
{%- endif -%}
${OPF_MEDIA_SKRIPT}
<style>
  {{ bas_css }}
</style>
{% schema %}
{
  "name": "OPF 1. Problem",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Liten rubrik ovanför (tom = per språk)" }
  ],
  "presets": [{ "name": "OPF 1. Problem" }]
}
{% endschema %}`;

// --- 3 + 4. Lösningen och gif/bild ---
const LOSNING = `{%- assign rubrik = product.metafields.opf.losning_rubrik.value -%}
{%- assign text = product.metafields.opf.losning_text.value -%}
{%- assign eyebrow = section.settings.eyebrow -%}
{%- if eyebrow == blank -%}{%- if request.locale.iso_code == 'nb' -%}{%- assign eyebrow = 'Løsningen' -%}{%- else -%}{%- assign eyebrow = 'Lösningen' -%}{%- endif -%}{%- endif -%}
{%- if rubrik != blank or text != blank -%}
<div class="ms-scope opf-block opf-losning" style="background: var(--ms-surface-2, transparent);">
  <div class="opf-wrap">
    <span class="opf-eyebrow">{{ eyebrow }}</span>
    {%- if rubrik != blank -%}<h2 class="opf-h2">{{ rubrik }}</h2>{%- endif -%}
    {%- if text != blank -%}<p class="opf-lede">{{ text | newline_to_br }}</p>{%- endif -%}
    {%- if product.metafields.opf.media_losning.value != blank -%}
${opfMedia('product.metafields.opf.media_losning.value')}
    {%- endif -%}
  </div>
</div>
{%- endif -%}
${OPF_MEDIA_SKRIPT}
<style>
  {{ bas_css }}
</style>
{% schema %}
{
  "name": "OPF 3. Lösningen",
  "settings": [
    { "type": "text", "id": "eyebrow", "label": "Liten rubrik ovanför (tom = per språk)" }
  ],
  "presets": [{ "name": "OPF 3. Lösningen" }]
}
{% endschema %}`;

// --- 5. Funktioner: benefits som kort, features som lista ---
const FUNKTIONER = `{%- assign benefits = product.metafields.opf.benefits.value -%}
{%- assign features = product.metafields.opf.features.value -%}
{%- assign rubrik = section.settings.rubrik -%}
{%- if rubrik == blank -%}{%- if request.locale.iso_code == 'nb' -%}{%- assign rubrik = 'Dette får du' -%}{%- else -%}{%- assign rubrik = 'Det här får du' -%}{%- endif -%}{%- endif -%}
{%- if benefits.size > 0 or features.size > 0 -%}
<div class="ms-scope opf-block opf-funktioner">
  <div class="opf-wrap">
    <h2 class="opf-h2">{{ rubrik }}</h2>
    {%- if benefits.size > 0 -%}
      <div class="opf-funk-grid">
        {%- for rad in benefits -%}
          <div class="opf-funk-kort">
            <span class="opf-funk-bock" aria-hidden="true">&#10003;</span>
            <span>{{ rad }}</span>
          </div>
        {%- endfor -%}
      </div>
    {%- endif -%}
    {%- if features.size > 0 -%}
      <ul class="opf-funk-lista">
        {%- for rad in features -%}
          <li>{{ rad }}</li>
        {%- endfor -%}
      </ul>
    {%- endif -%}
  </div>
</div>
{%- endif -%}
<style>
  {{ bas_css }}
  .opf-funk-grid { display: grid; gap: 12px; margin-top: 1.25rem; }
  @media (min-width: 750px) { .opf-funk-grid { grid-template-columns: 1fr 1fr; } }
  .opf-funk-kort { display: flex; gap: 10px; align-items: flex-start; padding: 14px 16px;
    border: 1px solid var(--ms-line, rgba(128,128,128,.35)); border-radius: var(--ms-radius, 14px);
    background: var(--ms-surface, transparent); box-shadow: var(--ms-shadow, none); line-height: 1.4; }
  .opf-funk-bock { flex: none; color: var(--ms-good, currentColor); font-weight: 700; }
  .opf-funk-lista { margin: 1.5rem 0 0; padding: 0 0 0 1.2em; display: grid; gap: .55rem;
    font-size: .9em; color: var(--ms-ink-soft, inherit); }
</style>
{% schema %}
{
  "name": "OPF 5. Funktioner",
  "settings": [
    { "type": "text", "id": "rubrik", "label": "Rubrik (tom = per språk)" }
  ],
  "presets": [{ "name": "OPF 5. Funktioner" }]
}
{% endschema %}`;

// --- 6. Stark produkt-/lifestylebild ---
const LIFESTYLE = `{%- if product.metafields.opf.bild_lifestyle.value != blank -%}
<div class="ms-scope opf-block opf-lifestyle" style="padding-block: 0;">
  <div class="opf-wrap opf-lifestyle__media">
${opfMedia('product.metafields.opf.bild_lifestyle.value')}
  </div>
</div>
{%- endif -%}
${OPF_MEDIA_SKRIPT}
<style>
  .opf-lifestyle__media .opf-media { margin-top: 0; }
  {{ bas_css }}
</style>
{% schema %}
{
  "name": "OPF 6. Bild",
  "settings": [],
  "presets": [{ "name": "OPF 6. Bild" }]
}
{% endschema %}`;

// --- 7. Garanti/trust — samma kortspråk som temats ms-guarantee ---
const GARANTI = `{%- assign garantier = product.metafields.opf.garantier.value -%}
{%- if garantier.size > 0 -%}
<div class="ms-scope opf-block opf-garanti">
  <div class="opf-wrap">
    <div class="opf-garanti-kort">
      <span class="opf-garanti-sigill" aria-hidden="true">
        <svg class="opf-garanti-ikon" viewBox="0 0 24 24" width="26" height="26" fill="none"
             stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 3l7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-3z"></path>
          <path d="M9 12l2 2 4-4"></path>
        </svg>
      </span>
      <div>
        <p class="opf-garanti-rubrik">{{ garantier.first }}</p>
        {%- if garantier.size > 1 -%}
          <ul class="opf-garanti-lista">
            {%- for rad in garantier offset: 1 -%}
              <li>{{ rad }}</li>
            {%- endfor -%}
          </ul>
        {%- endif -%}
        {%- assign frakt = product.metafields.opf.frakt.value -%}
        {%- if frakt.size > 0 -%}
          <p class="opf-garanti-frakt">{{ frakt | join: ' · ' }}</p>
        {%- endif -%}
      </div>
    </div>
  </div>
</div>
{%- endif -%}
<style>
  {{ bas_css }}
  .opf-garanti-kort { display: flex; gap: 16px; align-items: flex-start; padding: 20px;
    border: 1px solid var(--ms-line, rgba(128,128,128,.35)); border-radius: var(--ms-radius, 14px);
    background: var(--ms-surface-2, transparent); }
  .opf-garanti-sigill { flex: none; display: grid; place-items: center; width: 48px; height: 48px;
    border-radius: 50%; color: var(--ms-accent, currentColor);
    background: var(--ms-surface, transparent); border: 1px solid var(--ms-line, rgba(128,128,128,.35)); }
  .opf-garanti-rubrik { margin: 0 0 .3em; font-size: 1.15em; font-weight: 700; line-height: 1.25; }
  .opf-garanti-lista { margin: 0; padding: 0 0 0 1.1em; display: grid; gap: .35rem;
    color: var(--ms-ink-soft, inherit); font-size: .9em; }
  .opf-garanti-frakt { margin: .6em 0 0; font-size: .78em; color: var(--ms-ink-faint, inherit); }
</style>
{% schema %}
{
  "name": "OPF 7. Garanti",
  "settings": [],
  "presets": [{ "name": "OPF 7. Garanti" }]
}
{% endschema %}`;

// --- FAQ — samma dragspelsspråk som temats ms-faq (details, ingen JS) ---
const FAQ = `{%- assign faq = product.metafields.opf.faq.value -%}
{%- assign rubrik = section.settings.rubrik -%}
{%- if rubrik == blank -%}{%- if request.locale.iso_code == 'nb' -%}{%- assign rubrik = 'Vanlige spørsmål' -%}{%- else -%}{%- assign rubrik = 'Vanliga frågor' -%}{%- endif -%}{%- endif -%}
{%- if faq and faq.size > 0 -%}
<div class="ms-scope opf-block opf-faq">
  <div class="opf-wrap">
    <h2 class="opf-h2">{{ rubrik }}</h2>
    {%- for rad in faq -%}
      <details class="opf-faq-rad">
        <summary>{{ rad.fraga }}</summary>
        <p>{{ rad.svar }}</p>
      </details>
    {%- endfor -%}
  </div>
</div>
{%- endif -%}
<style>
  {{ bas_css }}
  .opf-faq-rad { border-bottom: 1px solid var(--ms-line, rgba(128,128,128,.35)); }
  .opf-faq-rad summary { cursor: pointer; padding: 1rem 0; font-weight: 600; list-style: none;
    display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; }
  .opf-faq-rad summary::-webkit-details-marker { display: none; }
  .opf-faq-rad summary::after { content: "+"; font-weight: 400; opacity: .6; }
  /* Literalt minustecken. CSS-escaper överlever inte vägen genom JSON
     till Shopifys API — de dubbleras och renderas som text. */
  .opf-faq-rad[open] summary::after { content: "−"; }
  .opf-faq-rad p { margin: 0 0 1rem; color: var(--ms-ink-soft, inherit); }
</style>
{% schema %}
{
  "name": "OPF FAQ",
  "settings": [
    { "type": "text", "id": "rubrik", "label": "Rubrik (tom = per språk)" }
  ],
  "presets": [{ "name": "OPF FAQ" }]
}
{% endschema %}`;

// Bygger filerna med den delade CSS:en inbakad (Liquid har ingen include för
// rena strängar, så den skrivs in i varje sektion vid generering i stället).
function medBasCss(mall) {
  return mall.replace('{{ bas_css }}', BAS_CSS.trim());
}

export const SEKTIONER = {
  'sections/opf-problem.liquid': medBasCss(PROBLEM),
  'sections/opf-losning.liquid': medBasCss(LOSNING),
  'sections/opf-funktioner.liquid': medBasCss(FUNKTIONER),
  'sections/opf-lifestyle.liquid': medBasCss(LIFESTYLE),
  'sections/opf-garanti.liquid': medBasCss(GARANTI),
  'sections/opf-faq.liquid': medBasCss(FAQ),
};

// Innehållsblocken (1–7) läggs direkt efter main. FAQ:n läggs efter
// Judge.me-widgeten när templaten har en — kunden läser recensionerna
// före frågorna, precis som i CRO-temats egen ordning.
export const SEKTIONSORDNING_INNEHALL = [
  ['opf_problem', 'opf-problem'],
  ['opf_losning', 'opf-losning'],
  ['opf_funktioner', 'opf-funktioner'],
  ['opf_lifestyle', 'opf-lifestyle'],
  ['opf_garanti', 'opf-garanti'],
];
export const SEKTIONSORDNING_EFTER_REVIEWS = [['opf_faq', 'opf-faq']];
export const SEKTIONSORDNING_TEMA = [
  ...SEKTIONSORDNING_INNEHALL,
  ...SEKTIONSORDNING_EFTER_REVIEWS,
];

// Vilka metafält varje sektion behöver för att visa sig. Sektionen döljer sig
// själv i Liquid när fältet saknas — det här är samma regel på byggsidan, så
// dry-run kan säga exakt vilka sektioner som kommer synas.
export const SEKTIONSKRAV = {
  'opf-problem': ['problem_rubrik', 'problem_text'],
  'opf-losning': ['losning_rubrik', 'losning_text'],
  'opf-funktioner': ['benefits', 'features'],
  'opf-lifestyle': ['bild_lifestyle'],
  'opf-garanti': ['garantier'],
  'opf-faq': ['faq'],
};

// Delar upp sektionerna i de som kommer visas och de som döljer sig själva,
// givet vilka metafält produkten faktiskt fick.
export function sektionerSomVisas(metafaltNycklar) {
  const har = new Set(metafaltNycklar);
  const visas = [];
  const doljs = [];
  for (const [, typ] of SEKTIONSORDNING_TEMA) {
    const krav = SEKTIONSKRAV[typ] ?? [];
    (krav.length === 0 || krav.some((k) => har.has(k)) ? visas : doljs).push(typ);
  }
  return { visas, doljs };
}

// Sektionstyper som byggProduktTemplate städar bort ur templaten:
// gamla opf-sektioner som inte längre finns, och temats hårdkodade FAQ
// (dess frågor är skrivna för en annan produkt — opf-faq läser metafälten).
const UTGANGNA_TYPER = new Set([
  'opf-hero',
  'opf-trust',
  'opf-benefits',
  'opf-reviews',
  'opf-erbjudande',
  'opf-bundle',
  'opf-frakt-garanti',
  'opf-sticky-atc',
  'ms-faq-section',
]);

// Svenskt varumärke-signalen (Axels beslut 2026-09-07, standard på VARJE
// produktsida): en liten strip nära köpknappen som signalerar svenskt
// brand — det lyfter CVR mot Temu/AliExpress-alternativen. Claimet ska
// vara SANT: bolaget är svenskt, därav "Svenskt varumärke". Skriv aldrig
// "utvecklad av svenskar" om produkten inte är det (marknadsföringslagen,
// och repots regel om inga falska claims).
export const SVENSK_SIGNAL =
  `{% if request.locale.iso_code == 'nb' %}` +
  `<div class="ms-scope opf-svensk"><span aria-hidden="true">\u{1F1F8}\u{1F1EA}</span>` +
  `<span><strong>Svensk merkevare</strong> – laget for nordiske hjem</span></div>` +
  `{% else %}` +
  `<div class="ms-scope opf-svensk"><span aria-hidden="true">\u{1F1F8}\u{1F1EA}</span>` +
  `<span><strong>Svenskt varumärke</strong> – framtaget för svenska hem</span></div>` +
  `{% endif %}` +
  `<style>.opf-svensk{display:flex;align-items:center;gap:9px;margin:10px 0 4px;` +
  `padding:10px 14px;border:1px solid var(--ms-line,#dde);` +
  `border-radius:var(--ms-radius-sm,6px);background:var(--ms-surface-2,#f5f7f9);` +
  `font-size:.88em;line-height:1.35}</style>`;

// ---------------------------------------------------------------------------
// Köprutans JS ägs av fabriken, inte av bas-zip:en.
//
// `assets/ms-paket.js` är den enda filen i temat som rör pengar. Bas-zip:ens
// kopia bar två fel som båda gav samma symptom — kunden kastades till /cart i
// stället för att lådan gled in — och båda är mätta på riktigt 2026-09-09 mot
// heimguard.se och tankguard.se, som stod live och spenderade:
//
//   1. A/B-testet (`ms-ab.js`) tar aldrig bort den förlorande paketvarianten,
//      det sätter bara `hidden` på omslaget. Båda korten band därför sin
//      köplyssnare till SAMMA formulär, och ett klick körde två köp:
//      `/cart/add.js` två gånger (kunden fick 4 kameror när hen valt 2) och
//      två rabattkoder som tävlade om samma session.
//   2. Koden lades på FÖRE varorna. `/discount/<kod>` fäster inte på en TOM
//      kundvagn, så koden föll bort, sista kontrollen hittade den inte, och
//      reservvägen `laddaOm()` navigerade till `/discount/<kod>?redirect=/cart`.
//      Det var redirecten — och den slog exakt vid kundens FÖRSTA köp.
//
// Därför skrivs filen till VARJE butik av fabriken. Ändra den i
// `factory/tema/assets/ms-paket.js`, aldrig i en enskild butiks tema.
const MS_PAKET_JS = readFileSync(
  new URL('./tema/assets/ms-paket.js', import.meta.url),
  'utf8'
);

// Gåvoguiden — startsidans frågeflöde (Axels beslut 2026-09-11, byggd för
// AdventLane och därmed standard i varje nischbutik).
//
// Kunden vet sällan vilken produkt hon vill ha. Hon vet vem hon köper till.
// Guiden ställer några frågor om MOTTAGAREN och svarar med en produkt ur
// butikens egen kollektion.
//
// Datamodellen är hela poängen: produkterna kommer ur kollektionen och bär
// sina egna taggar i metafältet `opf.quiz`. En ny produkt med det fältet är
// med i guiden utan att en rad kod ändras — samma regel som resten av
// fabriken (aldrig en handskriven produktlista, CLAUDE.md).
//
// Frågorna ligger som BLOCK, inte i koden. Två skäl: Axel kan ändra dem i
// temaredigeraren, och Shopify översätter blockens texter som vanligt
// JSON-mallsinnehåll — en fråga skriven här hade varit osynlig för
// översättningssteget och stått kvar på svenska på /nb.
// Poängmodellen har EN källa: factory/gavoguide.mjs. Den importeras av
// testerna som modul och bakas in här i webbläsarfilen med `export` strippat.
// Alternativet — en kopia i temat — hade varit två sanningar om när en
// alkoholtemakalender får föreslås till ett barn, och den sortens kopia
// glider isär tyst.
const GAVOGUIDE_MODELL = readFileSync(new URL('./gavoguide.mjs', import.meta.url), 'utf8')
  .replace(/^export /gm, '')
  .replace(/^/gm, '  ')
  .trim();

const MS_GAVOGUIDE_JS = readFileSync(
  new URL('./tema/assets/ms-gavoguide.js', import.meta.url),
  'utf8'
).replace('/*{{ poangmodell }}*/', GAVOGUIDE_MODELL);

const GAVOGUIDE = `{%- liquid
  assign guide_kollektion = collections[section.settings.kollektion]
  assign antal_med_quiz = 0
  for p in guide_kollektion.products
    if p.metafields.opf.quiz != blank
      assign antal_med_quiz = antal_med_quiz | plus: 1
    endif
  endfor
-%}
{%- if section.settings.visible and section.blocks.size > 0 -%}
<div class="ms-scope ms-section ms-guide-sektion">
  <div class="ms-wrap" style="max-width: 820px;">
    <div class="ms-center ms-guide-huvud">
      {%- if section.settings.etikett != blank -%}
        <p class="ms-guide__ogonbryn">{{ section.settings.etikett }}</p>
      {%- endif -%}
      <h2 class="ms-h2">{{ section.settings.rubrik }}</h2>
      {%- if section.settings.intro != blank -%}
        <p class="ms-guide__intro">{{ section.settings.intro }}</p>
      {%- endif -%}
    </div>

    <div
      class="ms-guide"
      data-ms-gavoguide
      hidden
      data-kollektion-url="{{ guide_kollektion.url | default: '/collections/all' }}"
      data-text-match="{{ section.settings.text_match | escape }}"
      data-text-ocksa="{{ section.settings.text_ocksa | escape }}"
      data-text-kop="{{ section.settings.text_kop | escape }}"
      data-text-las="{{ section.settings.text_las | escape }}"
      data-text-om="{{ section.settings.text_om | escape }}"
      data-text-lagger="{{ section.settings.text_lagger | escape }}"
      data-text-lagd="{{ section.settings.text_lagd | escape }}"
      data-text-ingen="{{ section.settings.text_ingen | escape }}"
      data-text-alla="{{ section.settings.text_alla | escape }}"
      data-text-budget="{{ section.settings.text_budget | escape }}"
      data-text-tidigare="{{ section.settings.text_tidigare | escape }}"
    >
      <div class="ms-guide__progress" data-guide-progress>
        <span class="ms-guide__raknare" data-guide-raknare></span>
      </div>

      {%- for block in section.blocks -%}
        <fieldset
          class="ms-guide__fraga"
          data-guide-fraga
          data-vikt="{{ block.settings.vikt }}"
          data-visa-om="{{ block.settings.visa_om | escape }}"
          hidden
          {{ block.shopify_attributes }}
        >
          <legend class="ms-guide__legend">{{ block.settings.fraga }}</legend>
          {%- if block.settings.hjalptext != blank -%}
            <p class="ms-guide__hjalp">{{ block.settings.hjalptext }}</p>
          {%- endif -%}
          {%- comment -%}
            Etiketterna och taggarna ligger i VAR SITT fält, rad för rad i
            samma ordning. Skälet är översättningen: fältet svar är text som
            ska bli norsk, fältet taggar är kontraktet mot produktens metafält
            och måste stå orörd. Låg de i samma sträng ("Ett barn" följt av
            lodstreck och taggen) skulle översättningssteget erbjuda hela
            raden för översättning, och en översatt tagg matchar ingenting —
            guiden hade svarat fel på /nb utan ett enda felmeddelande.
            Reserven: saknas taggfältet delas den gamla formen på lodstreck.
          {%- endcomment -%}
          <div class="ms-guide__svar">
            {%- assign rader = block.settings.svar | newline_to_br | split: '<br />' -%}
            {%- assign taggrader = block.settings.taggar | newline_to_br | split: '<br />' -%}
            {%- for rad in rader -%}
              {%- liquid
                assign bit = rad | strip | split: '|'
                assign etikett = bit[0] | strip
                assign taggar = taggrader[forloop.index0] | strip
                if taggar == blank
                  assign taggar = bit[1] | strip
                endif
              -%}
              {%- if etikett != blank -%}
                <label class="ms-guide__alternativ">
                  <input
                    type="radio"
                    name="guide-{{ block.id }}"
                    value="{{ forloop.index }}"
                    data-taggar="{{ taggar | escape }}"
                    data-etikett="{{ etikett | escape }}"
                  >
                  <span>{{ etikett }}</span>
                </label>
              {%- endif -%}
            {%- endfor -%}
          </div>
          {%- unless forloop.first -%}
            <button type="button" class="ms-guide__tillbaka" data-guide-tillbaka>{{ section.settings.text_tillbaka }}</button>
          {%- endunless -%}
        </fieldset>
      {%- endfor -%}

      <div class="ms-guide__resultat" data-guide-resultat hidden aria-live="polite"></div>
      <p class="ms-guide__tidigare" data-guide-tidigare hidden></p>

      {%- comment -%} Produktdatan. Enbart produkter med opf.quiz. {%- endcomment -%}
      {%- for p in guide_kollektion.products -%}
        {%- if p.metafields.opf.quiz != blank -%}
          <div
            hidden
            data-guide-produkt="{{ p.metafields.opf.quiz.value | json | escape }}"
            data-handle="{{ p.handle }}"
            data-titel="{{ p.title | escape }}"
            data-url="{{ p.url }}"
            data-bild="{% if p.featured_image %}{{ p.featured_image | image_url: width: 640 }}{% endif %}"
            data-pris="{{ p.price | divided_by: 100.0 }}"
            data-pris-text="{{ p.price | money | strip_html | escape }}"
            data-jamfor-text="{% if p.compare_at_price > p.price %}{{ p.compare_at_price | money | strip_html | escape }}{% endif %}"
            data-variant="{{ p.selected_or_first_available_variant.id }}"
          ></div>
        {%- endif -%}
      {%- endfor -%}
    </div>

    {%- comment -%}
      Utan JavaScript, utan produkter med quiz-metafält, eller om skriptet
      inte laddar: en länk till kollektionen i stället för en tom ruta.
      Guiden tar bort den här själv när den startat.
    {%- endcomment -%}
    <p class="ms-guide__fallback ms-center" data-guide-fallback>
      <a class="ms-guide__lank" href="{{ guide_kollektion.url | default: '/collections/all' }}">{{ section.settings.text_alla }}</a>
    </p>
  </div>
</div>

<script src="{{ 'ms-gavoguide.js' | asset_url }}" defer></script>

<style>
  {{ bas_css }}
  .ms-guide-sektion { padding-block: 40px; }
  .ms-guide-huvud { margin-bottom: 20px; }
  .ms-guide__ogonbryn {
    margin: 0 0 6px; font-size: .78rem; letter-spacing: .12em;
    text-transform: uppercase; color: var(--ms-accent, #A8283A); font-weight: 700;
  }
  .ms-guide__intro { margin: 8px auto 0; max-width: 46ch; color: var(--ms-ink-soft, #555); }
  .ms-guide {
    border: 1px solid var(--ms-line, #E1D9CB);
    border-radius: var(--ms-radius, 16px);
    background: var(--ms-surface, #fff);
    padding: 22px;
  }
  .ms-guide__progress {
    position: relative; height: 4px; border-radius: 99px;
    background: var(--ms-surface-3, #EDE4D6); margin-bottom: 20px;
  }
  .ms-guide__progress::after {
    content: ""; position: absolute; inset: 0 auto 0 0;
    width: var(--ms-guide-andel, 0%); border-radius: 99px;
    background: var(--ms-accent, #A8283A); transition: width .25s ease;
  }
  .ms-guide__raknare {
    position: absolute; right: 0; top: 10px;
    font-size: .75rem; color: var(--ms-ink-faint, #888);
  }
  .ms-guide__fraga { border: 0; padding: 0; margin: 0; }
  .ms-guide__legend {
    padding: 0; margin: 0 0 4px; font-size: 1.35rem; line-height: 1.25;
    font-weight: 700; color: var(--ms-ink, #181F2E);
  }
  .ms-guide__hjalp { margin: 0 0 14px; font-size: .9rem; color: var(--ms-ink-faint, #888); }
  .ms-guide__svar { display: grid; gap: 10px; margin-top: 14px; }
  .ms-guide__alternativ {
    display: flex; align-items: center; gap: 12px; cursor: pointer;
    padding: 14px 16px; border: 1px solid var(--ms-line, #E1D9CB);
    border-radius: var(--ms-radius-sm, 8px); background: var(--ms-surface, #fff);
    transition: border-color .15s ease, background .15s ease;
  }
  .ms-guide__alternativ:hover { border-color: var(--ms-line-strong, #C4B9A6); background: var(--ms-surface-2, #F7F2EA); }
  .ms-guide__alternativ:has(input:checked) {
    border-color: var(--ms-accent, #A8283A);
    background: color-mix(in srgb, var(--ms-accent, #A8283A) 7%, #fff);
  }
  .ms-guide__alternativ:focus-within { box-shadow: var(--ms-ring, 0 0 0 3px rgba(168,40,58,.32)); }
  .ms-guide__alternativ input { accent-color: var(--ms-accent, #A8283A); width: 20px; height: 20px; margin: 0; flex: none; }
  .ms-guide__tillbaka {
    margin-top: 16px; background: none; border: 0; padding: 4px 0; cursor: pointer;
    font-size: .9rem; color: var(--ms-ink-faint, #888); text-decoration: underline;
  }
  .ms-guide__svarsrad { margin: 0 0 14px; font-size: .85rem; color: var(--ms-ink-faint, #888); }
  .ms-guide__traff { display: flex; gap: 18px; align-items: flex-start; }
  .ms-guide__traffbild { flex: none; width: 160px; }
  .ms-guide__traffbild img { width: 100%; height: auto; border-radius: var(--ms-radius-sm, 8px); display: block; }
  .ms-guide__trafftext { flex: 1 1 auto; min-width: 0; }
  .ms-guide__etikett {
    margin: 0 0 4px; font-size: .72rem; letter-spacing: .12em; text-transform: uppercase;
    font-weight: 700; color: var(--ms-accent, #A8283A);
  }
  .ms-guide__namn { margin: 0 0 8px; font-size: 1.25rem; line-height: 1.25; }
  .ms-guide__namn a { color: inherit; text-decoration: none; }
  .ms-guide__namn a:hover { text-decoration: underline; }
  .ms-guide__mening { margin: 0 0 10px; color: var(--ms-ink-soft, #555); }
  .ms-guide__pris { margin: 0 0 4px; font-weight: 700; font-size: 1.1rem; }
  .ms-guide__pris s { font-weight: 400; opacity: .55; margin-left: 6px; }
  .ms-guide__not { margin: 8px 0 0; font-size: .85rem; color: var(--ms-warn, #8A5A00); }
  .ms-guide__knappar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 16px; }
  .ms-guide__kop {
    border: 0; border-radius: var(--ms-radius-sm, 8px); cursor: pointer;
    background: var(--ms-accent, #A8283A); color: var(--ms-accent-ink, #fff);
    font-weight: 700; font-size: 1rem; padding: 14px 22px;
  }
  .ms-guide__kop[disabled] { opacity: .75; cursor: default; }
  .ms-guide__lank { color: var(--ms-ink, #181F2E); }
  .ms-guide__ocksa {
    margin: 24px 0 10px; font-size: .72rem; letter-spacing: .12em;
    text-transform: uppercase; font-weight: 700; color: var(--ms-ink-faint, #888);
  }
  .ms-guide__alt { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
  .ms-guide__alt a {
    display: flex; align-items: center; gap: 12px; text-decoration: none;
    color: inherit; padding: 8px; border-radius: var(--ms-radius-sm, 8px);
  }
  .ms-guide__alt a:hover { background: var(--ms-surface-2, #F7F2EA); }
  .ms-guide__alt img { width: 48px; height: 48px; object-fit: cover; border-radius: 6px; flex: none; }
  .ms-guide__altnamn { flex: 1 1 auto; min-width: 0; }
  .ms-guide__altpris { flex: none; font-weight: 700; }
  .ms-guide__om {
    margin-top: 22px; background: none; cursor: pointer; font-size: .95rem;
    border: 1px solid var(--ms-line-strong, #C4B9A6); border-radius: var(--ms-radius-sm, 8px);
    padding: 12px 18px; color: var(--ms-ink, #181F2E); width: 100%;
  }
  .ms-guide__om:hover { background: var(--ms-surface-2, #F7F2EA); }
  .ms-guide__tidigare { margin: 14px 0 0; font-size: .85rem; color: var(--ms-ink-faint, #888); }
  .ms-guide__tidigaretext { font-weight: 700; }
  .ms-guide__tom { margin: 0 0 8px; }
  .ms-guide__fallback { margin-top: 14px; }
  @media (max-width: 600px) {
    .ms-guide { padding: 16px; }
    .ms-guide__legend { font-size: 1.15rem; }
    .ms-guide__traff { flex-direction: column; }
    .ms-guide__traffbild { width: 100%; max-width: 220px; }
    .ms-guide__kop { width: 100%; text-align: center; }
  }
</style>
{%- endif -%}

{% schema %}
{
  "name": "Gåvoguide",
  "tag": "section",
  "max_blocks": 10,
  "settings": [
    { "type": "checkbox", "id": "visible", "label": "Visa sektionen", "default": true,
      "info": "Bocka ur för att stänga av den utan att ta bort den." },
    { "type": "collection", "id": "kollektion", "label": "Kollektion guiden väljer ur",
      "info": "Bara produkter som har metafältet opf.quiz är med." },
    { "type": "text", "id": "etikett", "label": "Ögonbryn", "default": "Gåvoguide" },
    { "type": "text", "id": "rubrik", "label": "Rubrik", "default": "Vem ska du köpa till?" },
    { "type": "textarea", "id": "intro", "label": "Ingress",
      "default": "Svara på några frågor om mottagaren, så säger vi vilken kalender som passar." },
    { "type": "header", "content": "Knapptexter" },
    { "type": "text", "id": "text_match", "label": "Etikett över träffen", "default": "Din match" },
    { "type": "text", "id": "text_ocksa", "label": "Rubrik över alternativen", "default": "Passar också" },
    { "type": "text", "id": "text_kop", "label": "Köpknapp", "default": "Lägg i varukorgen" },
    { "type": "text", "id": "text_lagger", "label": "Köpknapp medan den laddar", "default": "Lägger i varukorgen …" },
    { "type": "text", "id": "text_lagd", "label": "Köpknapp när varan är lagd", "default": "Lagd i varukorgen" },
    { "type": "text", "id": "text_las", "label": "Länk till produkten", "default": "Läs mer" },
    { "type": "text", "id": "text_om", "label": "Gör om-knapp", "default": "Gör om för en annan person" },
    { "type": "text", "id": "text_tillbaka", "label": "Tillbaka-knapp", "default": "Tillbaka" },
    { "type": "text", "id": "text_tidigare", "label": "Rad över tidigare matchningar", "default": "Dina matchningar hittills" },
    { "type": "text", "id": "text_alla", "label": "Länk till hela kollektionen", "default": "Se alla kalendrar" },
    { "type": "textarea", "id": "text_ingen", "label": "Text när inget matchar",
      "default": "Ingen kalender matchade allt du valde." },
    { "type": "textarea", "id": "text_budget", "label": "Text när träffen kostar mer än kunden valde",
      "default": "Den här kostar mer än du valde, men matchar bäst. Närmast under din gräns:" }
  ],
  "blocks": [
    { "type": "fraga", "name": "Fråga", "settings": [
      { "type": "text", "id": "fraga", "label": "Fråga" },
      { "type": "text", "id": "hjalptext", "label": "Hjälptext under frågan" },
      { "type": "textarea", "id": "svar", "label": "Svarsalternativ",
        "info": "Ett per rad. Bara texten kunden läser — taggarna står i fältet under." },
      { "type": "textarea", "id": "taggar", "label": "Taggar per svar",
        "info": "En rad per svarsalternativ, i samma ordning. Flera taggar separeras med komma. Matchas mot produktens metafält opf.quiz. Översätts ALDRIG." },
      { "type": "range", "id": "vikt", "label": "Vikt", "min": 1, "max": 5, "step": 1, "default": 2,
        "info": "Hur tungt frågans svar väger i matchningen." },
      { "type": "text", "id": "visa_om", "label": "Visa bara om",
        "info": "Taggar separerade med komma. Tomt = frågan visas alltid." }
    ] }
  ],
  "presets": [{ "name": "Gåvoguide", "blocks": [{ "type": "fraga" }, { "type": "fraga" }, { "type": "fraga" }] }]
}
{% endschema %}`;

// Temats filer som fabriken äger och skriver över i varje butik, oavsett vad
// klonen råkade ha med sig. Bas-zip:en är en startpunkt, inte facit.
export const TEMAFILER = {
  'assets/ms-paket.js': MS_PAKET_JS,
  'assets/ms-gavoguide.js': MS_GAVOGUIDE_JS,
  'sections/ms-gavoguide.liquid': medBasCss(GAVOGUIDE),
};

// ---------------------------------------------------------------------------
// Hjälpare ur konfigen (förenade ur tema-mall.mjs 2026-09-09, KEDJAN.md).
// Allt nedan är ren logik utan nätverk: ops.mjs skriver filerna.
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const eskapa = (s) => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Shopifys tema-JSON får bära ett /* … */-block överst. JSON.parse kvävs på det.
export function lasTemaJson(ra) {
  if (typeof ra !== 'string') return ra;
  return JSON.parse(String(ra).replace(/^﻿/, '').replace(/^\s*\/\*[\s\S]*?\*\//, '').trim());
}

// Filnamnen i Files som temat pekar på (shopify://shop_images/<fil>).
export function temabilder(butiksId) {
  return {
    logga: `${butiksId}-logga.png`,
    favicon: `${butiksId}-favicon.png`,
    hero: `${butiksId}-hero.jpg`,
    trygghet: `${butiksId}-trygghet.jpg`,
  };
}

// "6–10 arbetsdagar" → { min: 6, max: 10 }
export function leveransdagar(leveranstid) {
  const m = String(leveranstid ?? '').match(/(\d+)\s*[–-]\s*(\d+)/);
  if (m) return { min: Number(m[1]), max: Number(m[2]) };
  const e = String(leveranstid ?? '').match(/(\d+)/);
  return e ? { min: Number(e[1]), max: Number(e[1]) } : { min: 5, max: 10 };
}

// Trygghetsraden under köpknappen och annonsraden — samma källa som
// fraktzonerna och returvillkoren, så de kan inte säga olika saker.
// Alltid svensk lag, aldrig egna köplöften (Axels beslut 2026-09-08).
export function angerrattRad(butik) {
  const dagar = Number(butik?.retur?.angerratt_dagar) || 14;
  return `${dagar} dagars ångerrätt`;
}

// Fraktraden nämner VARJE marknad butiken skickar till (Axels beslut
// 2026-09-08: "Fri frakt – Sverige & Norge"). Länderna kommer ur
// butik.marknader — aldrig skrivna för hand.
const LANDNAMN = { SE: 'Sverige', NO: 'Norge', DK: 'Danmark', FI: 'Finland', DE: 'Tyskland', GB: 'Storbritannien', UK: 'Storbritannien' };
export function fraktRad(butik) {
  const b = butik?.butik ?? {};
  const fri = butik?.frakt?.fri_globalt !== false;
  if (!fri) return 'Snabb leverans';
  const hem = text(b.huvudmarknad) ?? LANDNAMN[String(b.land ?? '').toUpperCase()] ?? 'Sverige';
  const ovriga = lista(b.marknader).map((m) => LANDNAMN[String(m?.land ?? '').toUpperCase()] ?? text(m?.land)).filter(Boolean);
  const lander = [...new Set([hem, ...ovriga])];
  return lander.length > 1 ? `Fri frakt – ${lander.join(' & ')}` : `Fri frakt i ${hem}`;
}

export function trustPunkter(butik) {
  return [`truck:${fraktRad(butik)}`, `refresh:${angerrattRad(butik)}`, 'lock:Trygg betalning'];
}

export function uspPunkter(butik, p) {
  const bas = trustPunkter(butik).map((x) => x.replace('lock:Trygg betalning', 'lock:Trygg betalning med Klarna'));
  const usp = text(p?.vinkel?.usp);
  return usp ? [...bas, `shield:${usp}`] : bas;
}

// Annonsradens texter (max 3): butik.startsida.usp om det är ifyllt (samma
// källa som startsidans USP-rad), annars butikens egna villkor. Ikonprefixet
// ("truck:") plockas bort — annonsraden visar bara text.
export function annonsrader(butik, p = null) {
  const egna = lista(butik?.startsida?.usp).map((x) => String(x).trim()).filter(Boolean);
  const rader = egna.length > 0 ? egna : uspPunkter(butik, p);
  return rader.map((x) => (x.includes(':') ? x.split(':').slice(1).join(':') : x)).map((x) => x.trim()).filter(Boolean).slice(0, 3);
}

// Två paketblock (A synligt, B hidden tills ms-ab.js lottar) — samma
// custom_liquid som temats egna ms_paket-block, plus test-attributet.
// section_id får en suffix så A och B inte delar radioknappsnamn.
export function paketBlock(test, produktUttryck = 'product', { tillagg = false } = {}) {
  const rad = (variant) =>
    `{% assign sid = section.id | append: '-${variant}' %}` +
    `<div {% render 'ms-ab-attrs', test: '${test}', variant: '${variant}' %}>` +
    `{% render 'ms-paket', product: ${produktUttryck}, variant: '${variant}', section_id: sid %}</div>`;
  // Fullpris-kryssrutan (snippets/opf-tillagg, byggTillagg) ligger som eget
  // block direkt efter paketblocken och hakar i alla ms-paket i sektionen.
  const tillaggBlock = tillagg ? { opf_tillagg: { type: 'custom_liquid', settings: { custom_liquid: "{% render 'opf-tillagg' %}" } } } : {};
  if (!text(test)) {
    return { ms_paket: { type: 'custom_liquid', settings: { custom_liquid: `{% render 'ms-paket', product: ${produktUttryck}, section_id: section.id %}` } }, ...tillaggBlock };
  }
  return {
    ms_paket_a: { type: 'custom_liquid', settings: { custom_liquid: rad('a') } },
    ms_paket_b: { type: 'custom_liquid', settings: { custom_liquid: rad('b') } },
    ...tillaggBlock,
  };
}

export function harTillagg(p) {
  return p?.offer?.bonus_produkt?.tillagg_kryssruta === true && !!text(p?.offer?.bonus_produkt?.handle);
}

// Kryssrutans svenska texter — samma källa för temat och översättningsunderlaget.
export function tillaggTexter(p) {
  const b = p?.offer?.bonus_produkt ?? {};
  const namn = text(b.kortnamn) ?? String(b.titel ?? '').split(/\s[–-]\s/)[0];
  return { label: `Lägg till ${namn}`, info: 'Fullpris – gratis bara i paketen' };
}

// custom_liquid-block kan inte översättas via translationsRegister — texten
// locale-branchas i Liquid i stället (HeimGuard-lärdom 2026-09-07). `nb` är
// översättningsmappen (nyckel → norsk text) ur oversattning-nb.json.
function localeBranch(svLiquid, nbLiquid) {
  if (!nbLiquid || nbLiquid === svLiquid) return svLiquid;
  return `{% if request.locale.iso_code == 'nb' %}${nbLiquid}{% else %}${svLiquid}{% endif %}`;
}

const PAKETBLOCK_IDN = ['ms_paket', 'ms_paket_a', 'ms_paket_b', 'opf_tillagg'];

// Köprutans block ur produkt- och butiksfilen: paketblocken (A/B + fullpris-
// kryssruta när offer säger det), trygghetsraden, leveransdagarna och
// varianterna. Rör bara main-sektionen. Idempotent.
function patchaKoprutan(main, { produkt, butik, nb }) {
  const blocks = { ...main.blocks };
  let order = [...(main.block_order ?? [])];

  if (produkt) {
    const test = text(produkt.offer?.paket?.test) ?? '';
    const nya = paketBlock(test, 'product', { tillagg: harTillagg(produkt) });
    // Första paketblockets plats — räknad FÖRE filtreringen, så det måste
    // vara det lägsta indexet (annars glider blocken vid varje nytt varv).
    const platser = PAKETBLOCK_IDN.map((id) => order.indexOf(id)).filter((i) => i >= 0);
    const plats = platser.length > 0 ? Math.min(...platser) : -1;
    for (const id of PAKETBLOCK_IDN) delete blocks[id];
    order = order.filter((id) => !PAKETBLOCK_IDN.includes(id));
    // Samma plats som temats enkla ms_paket; annars efter variantväljaren,
    // annars före köpknappen.
    let efter = plats;
    if (efter === -1 && order.includes('variant_picker')) efter = order.indexOf('variant_picker') + 1;
    if (efter === -1 && order.includes('buy_buttons')) efter = order.indexOf('buy_buttons');
    if (efter === -1) efter = order.length;
    Object.assign(blocks, nya);
    order.splice(efter, 0, ...Object.keys(nya));
  }

  if (butik && blocks.ms_trust) {
    const sv = trustPunkter(butik);
    const no = sv.map((x, i) => (nb?.[`liquid.trust.${i}`] ? `${x.split(':')[0]}:${nb[`liquid.trust.${i}`]}` : x));
    const rad = (punkter) => `{% render 'ms-trust-row', items: '${punkter.join('|')}' %}`;
    blocks.ms_trust = { type: 'custom_liquid', settings: { custom_liquid: localeBranch(rad(sv), rad(no)) } };
  }
  if ((butik || produkt) && blocks.ms_delivery) {
    const d = leveransdagar(produkt?.leveranstid ?? produkt?.shipping?.tid ?? butik?.frakt?.leveranstid);
    const rad = (t) => `{% render 'ms-delivery-estimate', min_days: ${d.min}, max_days: ${d.max}, cutoff_hour: 0, text: '${t}' %}`;
    // Norska vyn får en STATISK rad: temats ms-delivery skriver datum med
    // svenska månadsnamn (Intl sv-SE i ms-cro.js) och reservtexten säger
    // "arbetsdagar" — sågs på /nb i kundvyn 2026-09-08. Samma klasser, ingen JS.
    const nbText = nb?.['liquid.delivery.text'] ?? 'Beräknad leverans';
    const nbDagar = nb?.['liquid.delivery.dagar'] ?? `${d.min}–${d.max} virkedager`;
    const statisk = `<div class="ms-delivery ms-scope"><span aria-hidden="true">🚚</span><div>${nbText} <span class="ms-delivery__date">${nbDagar}</span></div></div>`;
    blocks.ms_delivery = { type: 'custom_liquid', settings: { custom_liquid: localeBranch(rad('Beräknad leverans'), statisk) } };
  }

  // Bas-temat döljer varianterna (källbutiken sålde paket via ms-paket). En
  // produkt med riktiga varianter — färg, storlek — ska gå att välja.
  const settings = { ...main.settings };
  if (produkt && lista(produkt.varianter).length > 1) settings.hide_variants = false;

  return { ...main, blocks, block_order: order, settings };
}

// Lägger in OPF-sektionerna i en befintlig product.json utan att röra "main"s
// egna block. Innehållsblocken hamnar direkt efter main; FAQ:n efter
// Judge.me-widgeten (sektion av typen "apps" eller med judgeme i id:t) om
// templaten har en. Temats egna ms-sektioner (sticky ATC) lämnas orörda.
//
// Med { produkt, butik, nb } byggs dessutom köprutan ur konfigen: A/B-paket-
// blocken + fullpris-kryssrutan när offer säger det, trygghetsraden,
// leveransdagarna, och Judge.me-widgeten flyttar in i temats Appyta
// (ms-app-slot — Axels ursprungsmönster, widgeten stylas aldrig av temat).
export function byggProduktTemplate(befintlig, { produkt = null, butik = null, nb = {} } = {}) {
  const mall = lasTemaJson(befintlig);
  const sektioner = { ...mall.sections };

  // Temats icon-with-text har texten hårdkodad i templaten och skulle följa med
  // fel till nästa produkt.
  const main = sektioner.main;
  if (main?.blocks) {
    const hardkodade = Object.entries(main.blocks)
      .filter(([, b]) => b?.type === 'icon-with-text')
      .map(([id]) => id);
    if (hardkodade.length > 0) {
      const blocks = { ...main.blocks };
      for (const id of hardkodade) delete blocks[id];
      sektioner.main = {
        ...main,
        blocks,
        block_order: (main.block_order ?? []).filter((id) => !hardkodade.includes(id)),
      };
    }
  }

  // Svenskt varumärke-signalen in efter trust-raden (eller sist bland
  // blocken om trust-raden saknas). Idempotent — finns blocket rörs inget.
  const huvud = sektioner.main;
  if (huvud?.blocks && !huvud.blocks.opf_svensk) {
    const blocks = {
      ...huvud.blocks,
      opf_svensk: { type: 'custom_liquid', settings: { custom_liquid: SVENSK_SIGNAL } },
    };
    const ordningMain = [...(huvud.block_order ?? [])];
    const efterTrust = ordningMain.indexOf('ms_trust');
    ordningMain.splice(efterTrust === -1 ? ordningMain.length : efterTrust + 1, 0, 'opf_svensk');
    sektioner.main = { ...huvud, blocks, block_order: ordningMain };
  }

  // Köprutan ur konfigen (paket A/B, kryssruta, trust, leverans, varianter).
  if ((produkt || butik) && sektioner.main?.blocks) {
    sektioner.main = patchaKoprutan(sektioner.main, { produkt, butik, nb });
  }

  // Judge.me i Appyta (Axels ursprungsmönster) — widgeten stylas aldrig av
  // temat. Blocken (själva app-widgeten) följer med oförändrade.
  for (const [id, sek] of Object.entries(sektioner)) {
    if (sek?.type === 'apps' && /judge/i.test(id)) {
      sektioner[id] = { ...sek, type: 'ms-app-slot', settings: { visible: true, eyebrow: '', heading: '', width: 1100, ab_test: '', ab_variant: '' } };
    }
  }

  // Städa bort gamla opf-id:n och utgångna sektionstyper.
  const ordning = (mall.order ?? []).filter((id) => {
    if (id.startsWith('opf_')) {
      delete sektioner[id];
      return false;
    }
    if (UTGANGNA_TYPER.has(sektioner[id]?.type)) {
      delete sektioner[id];
      return false;
    }
    return true;
  });

  for (const [id, typ] of SEKTIONSORDNING_TEMA) sektioner[id] = { type: typ, settings: {} };

  // Innehållsblocken direkt efter main.
  const innehallsIdn = SEKTIONSORDNING_INNEHALL.map(([id]) => id);
  const mainIndex = ordning.indexOf('main');
  ordning.splice(mainIndex + 1, 0, ...innehallsIdn);

  // FAQ:n efter Judge.me-widgeten om den finns, annars efter innehållet.
  const faqIdn = SEKTIONSORDNING_EFTER_REVIEWS.map(([id]) => id);
  const reviewsIndex = ordning.findIndex(
    (id) => sektioner[id]?.type === 'apps' || /judge/i.test(id)
  );
  const faqPlats = reviewsIndex !== -1 ? reviewsIndex + 1 : mainIndex + 1 + innehallsIdn.length;
  ordning.splice(faqPlats, 0, ...faqIdn);

  return `${JSON.stringify({ ...mall, sections: sektioner, order: ordning }, null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// Korg-upsell (Q4-ramverket, standard för varje OPS sedan 2026-09-07):
// en billig komplementprodukt visas i varukorgslådan med en Lägg till-knapp.
// Bevisad på HeimGuard i tema v8. Tre delar, alla behövs:
//
//  1. snippets/opf-korg-upsell.liquid — själva kortet. Klicket är en
//     inline-onclick MED FLIT: lådan ritas om med innerHTML vid varje
//     varukorgsändring och då körs aldrig <script>-taggar, men
//     onclick-attribut överlever.
//  2. sections/cart-drawer.liquid — wrappern. Bastemats 600-raderssnippet
//     forkas inte; upsellen skjuts in framför footern med replace_first på
//     markeringskommentaren i den renderade HTML:en. Sektions-API:t (som
//     temat självt använder vid varje cart-ändring) renderar via den här
//     filen, så upsellen följer med automatiskt.
//  3. Tillägget i snippets/ms-head.liquid — layout/theme.liquid renderar
//     lådan som SNIPPET direkt (förbi wrappern), så sidans första rendering
//     saknar upsellen. Skriptet hämtar om lådan EN gång per sidladdning när
//     korgen har varor, via samma sektions-API och samma #CartDrawer-byte
//     som temats egna cart-drawer.js.
// Fullpris-kryssrutan på nivå 1 (Axels beslut 2026-09-08): den som köper ETT
// exemplar kan lägga till bonusprodukten till FULLPRIS — aldrig rabatterad,
// det håller paketens "värde X kr"-berättelse ärlig. Byggd ovanpå temats
// ms-paket utan att forka ms-paket.js: kryssrutan sätter samma
// data-gratis-*-attribut som en gratisrad använder, fast med bonusens
// FULLA pris som värde och utan rabattkod. ms-paket.js räknar då
// ordinarie = styckpris + bonuspris, drar 0 i rabatt, visar summan i
// kortet och sticky-knappen, och lägger bonusen i korgen vid köp.
// Kassan visar exakt samma tal — inget pris utlovas som kassan inte ger.
// `texter` = { sv: { label, info }, nb: { label, info } }.
export function byggTillagg(bonusHandle, texter) {
  const t = (locale, falt) => String(texter?.[locale]?.[falt] ?? texter?.sv?.[falt] ?? '').replaceAll("'", '’');
  const branch = (falt) =>
    texter?.nb?.[falt] && texter.nb[falt] !== texter.sv?.[falt]
      ? `{% if request.locale.iso_code == 'nb' %}${t('nb', falt)}{% else %}${t('sv', falt)}{% endif %}`
      : t('sv', falt);
  const snippet = `{%- comment -%}
  opf-tillagg — betald tilläggs-kryssruta på paketnivå 1 (OPS Factory).
  Renderas som custom_liquid-block direkt efter paketblocken (A/B). JS:en
  hittar varje ms-paket i sektionen, lägger kryssrutan under nivån utan
  rabattkod och gratisrad, och sätter/rensar data-gratis-* på den nivåns
  radioknapp. Priset kommer alltid ur produkten — fullpris, aldrig rabatt.
  Texterna är locale-branchade (custom_liquid går inte att översätta).
{%- endcomment -%}
{%- assign opf_tillagg = all_products['${bonusHandle}'] -%}
{%- if opf_tillagg != blank and opf_tillagg.available -%}
{%- assign opf_tv = opf_tillagg.selected_or_first_available_variant -%}
<template class="opf-tillagg-mall">
  <label class="opf-tillagg ms-scope" hidden>
    <input type="checkbox" class="opf-tillagg__kryss" data-variant="{{ opf_tv.id }}" data-pris="{{ opf_tv.price }}">
    {%- if opf_tillagg.featured_image -%}
      <img class="opf-tillagg__bild" src="{{ opf_tillagg.featured_image | image_url: width: 80 }}" alt="" width="40" height="40" loading="lazy">
    {%- endif -%}
    <span class="opf-tillagg__text">
      <span class="opf-tillagg__rubrik">${branch('label')}</span>
      <span class="opf-tillagg__info">${branch('info')}</span>
    </span>
    <span class="opf-tillagg__pris">+ {{ opf_tv.price | money }}</span>
  </label>
</template>
<script>
(function () {
  function koppla(paket) {
    if (paket.dataset.opfTillagg) return;
    var mall = paket.closest('[id^="shopify-section"]') ? paket.closest('[id^="shopify-section"]').querySelector('.opf-tillagg-mall') : null;
    mall = mall || document.querySelector('.opf-tillagg-mall');
    if (!mall) return;
    var inputs = Array.prototype.slice.call(paket.querySelectorAll('.ms-paket__input'));
    var bas = null;
    inputs.forEach(function (i) { if (!bas && !i.dataset.kod && Number(i.dataset.gratisAntal || 0) === 0) bas = i; });
    if (!bas) return;
    paket.dataset.opfTillagg = '1';
    var rad = mall.content.firstElementChild.cloneNode(true);
    var kryss = rad.querySelector('.opf-tillagg__kryss');
    bas.closest('.ms-paket__opt').insertAdjacentElement('afterend', rad);
    function uppdatera() {
      var vald = paket.querySelector('.ms-paket__input:checked');
      rad.hidden = vald !== bas;
      if (kryss.checked) {
        bas.dataset.gratisVariant = kryss.dataset.variant;
        bas.dataset.gratisAntal = '1';
        bas.dataset.gratisVarde = kryss.dataset.pris;
      } else {
        bas.dataset.gratisVariant = '';
        bas.dataset.gratisAntal = '0';
        bas.dataset.gratisVarde = '0';
      }
    }
    kryss.addEventListener('change', function () {
      uppdatera();
      if (bas.checked) bas.dispatchEvent(new Event('change', { bubbles: true }));
    });
    inputs.forEach(function (i) { i.addEventListener('change', uppdatera); });
    uppdatera();
  }
  function alla() { Array.prototype.forEach.call(document.querySelectorAll('ms-paket'), koppla); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', alla); else alla();
  document.addEventListener('shopify:section:load', alla);
})();
</script>
<style>
  .opf-tillagg { display: flex; align-items: center; gap: 10px; margin: -2px 6px 6px 22px; padding: 10px 12px;
    border: 2px dashed var(--ms-line-strong, #bbb); border-top-width: 0;
    border-radius: 0 0 var(--ms-radius, 10px) var(--ms-radius, 10px);
    background: var(--ms-surface-2, #f7f7f7); cursor: pointer; font-size: .82em; line-height: 1.3; }
  .opf-tillagg[hidden] { display: none; }
  .opf-tillagg__kryss { width: 20px; height: 20px; margin: 0; accent-color: var(--ms-accent, #111); flex: none; }
  .opf-tillagg__bild { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; flex: none; background: #fff; }
  .opf-tillagg__text { display: grid; gap: 2px; min-width: 0; }
  .opf-tillagg__rubrik { font-weight: 700; }
  .opf-tillagg__info { color: var(--ms-ink-soft, #555); font-size: .9em; }
  .opf-tillagg__pris { margin-left: auto; white-space: nowrap; font-weight: 700; }
</style>
{%- endif -%}
`;
  return { 'snippets/opf-tillagg.liquid': snippet };
}

export function byggKorgUpsell(upsellHandle) {
  const snippet = `{%- comment -%}
  opf-korg-upsell — betald upsell i varukorgslådan (OPS Factory).
  Visar komplementprodukten när korgen har varor och den inte redan ligger i.
  Knäpps in av sections/cart-drawer.liquid via replace_first på markeringen.
  Klicket är en inline-handler med flit: lådan ritas om med innerHTML vid
  varje varukorgsändring, och då körs aldrig <script>-taggar — men
  onclick-attribut överlever.
{%- endcomment -%}
{%- assign upsell = all_products['${upsellHandle}'] -%}
{%- if upsell != blank and upsell.available and cart.item_count > 0 -%}
  {%- assign redan = false -%}
  {%- for item in cart.items -%}
    {%- if item.product_id == upsell.id -%}{%- assign redan = true -%}{%- endif -%}
  {%- endfor -%}
  {%- unless redan -%}
  {%- assign variant_id = upsell.selected_or_first_available_variant.id -%}
  <div class="ms-scope opf-upsell">
    <span class="opf-upsell__etikett">{% if request.locale.iso_code == 'nb' %}Passer til{% else %}Passar till{% endif %}</span>
    <div class="opf-upsell__rad">
      {%- if upsell.featured_image -%}
        <img class="opf-upsell__bild" src="{{ upsell.featured_image | image_url: width: 120 }}" alt="{{ upsell.title | escape }}" width="52" height="52" loading="lazy">
      {%- endif -%}
      <span class="opf-upsell__text">
        <span class="opf-upsell__titel">{{ upsell.title }}</span>
        <span class="opf-upsell__pris">{{ upsell.selected_or_first_available_variant.price | money }}</span>
      </span>
      <button type="button" class="opf-upsell__knapp"
        onclick="this.disabled=true;var k=this;fetch('{{ routes.cart_add_url }}.js',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({id:{{ variant_id }},quantity:1})}).then(function(){window.location.reload()}).catch(function(){k.disabled=false})">
        {% if request.locale.iso_code == 'nb' %}Legg til{% else %}Lägg till{% endif %}
      </button>
    </div>
  </div>
  <style>
    .opf-upsell { margin: 0 0 12px; padding: 12px; border: 1px solid var(--ms-line, #ddd);
      border-radius: var(--ms-radius, 10px); background: var(--ms-surface-2, #f7f7f7); }
    .opf-upsell__etikett { display: block; font-size: .72em; letter-spacing: .1em;
      text-transform: uppercase; color: var(--ms-accent, #333); margin-bottom: 8px; }
    .opf-upsell__rad { display: flex; align-items: center; gap: 10px; }
    .opf-upsell__bild { border-radius: 6px; flex: none; background: #fff; }
    .opf-upsell__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
    .opf-upsell__titel { font-size: .8em; line-height: 1.3; font-weight: 600; }
    .opf-upsell__pris { font-size: .8em; color: var(--ms-ink-soft, #555); }
    .opf-upsell__knapp { margin-left: auto; flex: none; padding: 8px 14px; border: 0; cursor: pointer;
      font: inherit; font-size: .8em; font-weight: 700; border-radius: 6px;
      background: var(--ms-accent, #111); color: var(--ms-accent-ink, #fff); }
    .opf-upsell__knapp[disabled] { opacity: .6; cursor: wait; }
  </style>
  {%- endunless -%}
{%- endif -%}
`;

  const wrapper = `{%- comment -%}
  Varukorgslådan + betald upsell (OPS Factory).
  Själva lådan är orörd — upsellen skjuts in framför footern genom att
  ersätta markeringskommentaren i den renderade HTML:en. Så slipper vi
  forka bastemats 600-raderssnippet, och eftersom Dawn hämtar om HELA
  sektionen vid varje varukorgsändring följer upsellen med automatiskt.
{%- endcomment -%}
{%- capture opf_upsell -%}{% render 'opf-korg-upsell' %}{%- endcapture -%}
{%- capture opf_lada -%}{% render 'cart-drawer' %}{%- endcapture -%}
{%- assign opf_marke = '<!-- Start blocks -->' -%}
{%- if opf_upsell contains 'opf-upsell' -%}
  {%- assign opf_nytt = opf_upsell | append: opf_marke -%}
  {{ opf_lada | replace_first: opf_marke, opf_nytt }}
{%- else -%}
  {{ opf_lada }}
{%- endif -%}
`;

  const msHeadTillagg = `
{%- comment -%}
  Korg-upsellen (snippets/opf-korg-upsell) renderas av vår wrapper i
  sections/cart-drawer.liquid — men SIDANS första rendering går förbi den:
  layout/theme.liquid renderar snippeten direkt, och den filen forkar vi
  inte. Därför hämtas lådan om EN gång per sidladdning när korgen har
  varor, via samma sektions-API och samma #CartDrawer-byte som temats egna
  cart-drawer.js använder vid varje varukorgsändring.
{%- endcomment -%}
{%- if settings.cart_type == 'drawer' and cart.item_count > 0 -%}
<script>
  document.addEventListener('DOMContentLoaded', function () {
    var gammal = document.getElementById('CartDrawer');
    if (!gammal) return;
    var rot = (window.Shopify && Shopify.routes && Shopify.routes.root) || '/';
    fetch(rot + '?sections=cart-drawer')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d['cart-drawer']) return;
        var ny = new DOMParser().parseFromString(d['cart-drawer'], 'text/html').querySelector('#CartDrawer');
        if (ny) gammal.innerHTML = ny.innerHTML;
      })
      .catch(function () {});
  });
</script>
{%- endif -%}
`;

  return {
    'snippets/opf-korg-upsell.liquid': snippet,
    'sections/cart-drawer.liquid': wrapper,
    msHeadTillagg,
  };
}

// ---------------------------------------------------------------------------
// Sektionsgruppen header-group.json: annonsraden + headern, ur butiksfilen.
//
// Bas-zip:ens annonsrad bär källbutikens tre löften ("Levereras presentklart"
// …) högst upp på VARJE sida (AVBRANDNING.md). Här byggs den om ur butikens
// egna villkor. Blocken får id:n med prefixet opf_ så av-brandningen kan
// skilja fabrikens rader från källbutikens. Utan `befintlig` byggs gruppen
// från Dawns skelett — det räcker, temat har inga fler sektioner i gruppen.
// Land-/språkväljaren slås på när butiken har fler marknader än hemma-
// marknaden (butik.marknader), annars av.
const HEADER_SKELETT = {
  name: 't:sections.header.name',
  type: 'header',
  sections: {
    'announcement-bar': {
      type: 'announcement-bar',
      blocks: {},
      block_order: [],
      settings: {
        auto_rotate: true,
        change_slides_speed: 4,
        color_scheme: 'scheme-3',
        show_line_separator: false,
        show_social: false,
        enable_country_selector: false,
        enable_language_selector: false,
      },
    },
    header: {
      type: 'header',
      settings: {
        logo_position: 'middle-left',
        mobile_logo_position: 'center',
        menu: 'main-menu',
        menu_type_desktop: 'dropdown',
        sticky_header_type: 'on-scroll-up',
        show_line_separator: true,
        color_scheme: 'scheme-1',
        menu_color_scheme: 'scheme-1',
        enable_country_selector: false,
        enable_language_selector: false,
        enable_customer_avatar: false,
        margin_bottom: 0,
        padding_top: 16,
        padding_bottom: 16,
      },
    },
  },
  order: ['announcement-bar', 'header'],
};

export function byggHeaderGroup(butik, alternativ = {}, ...rest) {
  // Tål även den äldre anropsformen (befintlig, butik, produkt).
  if (typeof butik === 'string') {
    return byggHeaderGroup(alternativ, { befintlig: butik, produkt: rest[0] ?? null });
  }
  const { befintlig = null, produkt = null } = alternativ ?? {};
  const grupp = befintlig ? lasTemaJson(befintlig) : structuredClone(HEADER_SKELETT);
  grupp.sections ??= {};
  const fleraMarknader = lista(butik?.butik?.marknader).length > 0;
  const valjare = { enable_country_selector: fleraMarknader, enable_language_selector: fleraMarknader };

  const rader = annonsrader(butik, produkt);
  const blocks = Object.fromEntries(rader.map((t, i) => [`opf_a${i + 1}`, { type: 'announcement', settings: { text: t, link: '' } }]));
  const bar = grupp.sections['announcement-bar'] ?? structuredClone(HEADER_SKELETT.sections['announcement-bar']);
  grupp.sections['announcement-bar'] = { ...bar, blocks, block_order: Object.keys(blocks), settings: { ...bar.settings, ...valjare } };

  const header = grupp.sections.header ?? structuredClone(HEADER_SKELETT.sections.header);
  grupp.sections.header = { ...header, settings: { ...header.settings, menu: 'main-menu', ...valjare } };

  if (!Array.isArray(grupp.order) || grupp.order.length === 0) grupp.order = ['announcement-bar', 'header'];
  for (const id of ['announcement-bar', 'header']) if (!grupp.order.includes(id)) grupp.order.push(id);
  return `${JSON.stringify(grupp, null, 2)}\n`;
}

// ---------------------------------------------------------------------------
// Temainställningarna (config/settings_data.json): det som pekar på
// källbutiken utan att nämna den vid namn. Skanningen hittar det aldrig —
// därför nollas det explicit (AVBRANDNING.md: brand_description, sociala
// länkar, logga, app-inbäddningar).
//
//   rensaSettings(settingsData, { butik?, produkt?, logga?, favicon?, abTest? })
//
//  - sociala länkar töms ALLTID: en ny butik har inga konton, och att peka
//    kunden till källbutikens Instagram är värre än att inte peka alls.
//  - brand_description = butikens positionering (eller brandnamnet); utan
//    butik: tom.
//  - app-inbäddningar (current.blocks) = ENBART Judge.me. Klaviyo är
//    källbutikens e-postinsamling. Appinbäddningar dör i varje klon
//    (PROCESS.md) — därför sätts judgeme_core här varje gång.
//  - logga/favicon sätts när de ges (Files-handles). Ges de inte, och
//    logo/brand_image pekar på källbutikens fil, töms fälten — annars
//    lämnas de (loggasteget kan redan ha satt en riktig logga).
//  - A/B-testet (ms_ab_tests) ur produkt.offer.paket.test eller `abTest`.
//  - currency_code_enabled slås på när någon marknad har en annan valuta
//    än butikens (SEK och NOK skrivs båda "kr").
// Tar sträng eller objekt; ger tillbaka samma sort.
export const JUDGEME_EMBED = 'shopify://apps/judge-me-reviews/blocks/judgeme_core/61ccd3b1-a9f2-4160-9fe9-4fec8413e5d8';

export function rensaSettings(settingsData, { butik = null, produkt = null, logga = null, favicon = null, abTest = undefined } = {}) {
  const somStrang = typeof settingsData === 'string';
  const j = somStrang ? lasTemaJson(settingsData) : { ...(settingsData ?? {}) };
  const c = { ...(j.current ?? {}) };

  for (const k of Object.keys(c)) if (/^social_.*_link$/.test(k)) c[k] = '';
  c.brand_headline = '';
  c.brand_description = butik ? `<p>${eskapa(text(butik.branding?.positionering) ?? butik.butik?.brand ?? '')}</p>` : '';

  // App-inbäddningar: bara Judge.me. Ordningen behålls, resten åker ut.
  const blocks = {};
  for (const [id, b] of Object.entries(c.blocks ?? {})) {
    if (/judge-?me/i.test(String(b?.type ?? ''))) blocks[id] = { ...b, disabled: false };
  }
  if (Object.keys(blocks).length === 0) blocks.judgeme_karna = { type: JUDGEME_EMBED, disabled: false, settings: {} };
  c.blocks = blocks;

  if (logga) {
    c.logo = logga;
    c.brand_image = logga;
  } else {
    for (const k of ['logo', 'brand_image']) if (typeof c[k] === 'string' && arKalltext(c[k])) c[k] = '';
  }
  if (favicon) c.favicon = favicon;

  const test = abTest !== undefined ? abTest : produkt?.offer?.paket?.test;
  if (test !== undefined && test !== null) {
    c.ms_ab_tests = String(text(test) ?? '');
    c.ms_ab_cookie_days = Number(c.ms_ab_cookie_days) > 0 ? c.ms_ab_cookie_days : 30;
  }

  if (butik) {
    const egen = String(butik.butik?.valuta ?? '').toUpperCase();
    const annan = lista(butik.butik?.marknader).some((m) => m?.valuta && String(m.valuta).toUpperCase() !== egen);
    if (annan) c.currency_code_enabled = true;
  }

  j.current = c;
  return somStrang ? `${JSON.stringify(j, null, 2)}\n` : j;
}

// ms-head läser settings.ms_ab_tests men zip:ens settings_schema saknar
// fältet (mätt 2026-09-08) — utan schemat ignoreras värdet och Shopify
// stryker det ur settings_data. Läggs till idempotent som egen grupp sist.
// Returnerar null när gruppen redan finns.
export function settingsSchemaMedAb(schemaText) {
  const schema = lasTemaJson(schemaText);
  if (schema.some((g) => (g.settings ?? []).some((s) => s.id === 'ms_ab_tests'))) return null;
  schema.push({
    name: 'OPS A/B-test',
    settings: [
      { type: 'textarea', id: 'ms_ab_tests', label: 'Aktiva tester', info: 'Ett test per rad: id (50/50) eller id:90:10 (viktat). Rad som börjar med # är avstängd. Utfallet stämplas som orderattribut "AB <id>".' },
      { type: 'range', id: 'ms_ab_cookie_days', label: 'Kakans livslängd (dagar)', min: 1, max: 90, step: 1, default: 30 },
    ],
  });
  return `${JSON.stringify(schema, null, 2)}\n`;
}

// Temats ms-paket-snippet har svenska ord inbakade ("Gratis på köpet", "värde",
// "Välj paket") som ingen translationsRegister når — locale-brancha dem en
// gång (idempotent: null om grenen redan finns). Sågs på /nb 2026-09-08.
export const MS_PAKET_ORD = [
  ['Gratis på köpet', 'Gratis med på kjøpet'],
  ['värde {{ gvarde | money }}', 'verdi {{ gvarde | money }}'],
  ['aria-label="Välj paket"', 'aria-label="Velg pakke"'],
];
export function patchaMsPaket(snippet) {
  let s = String(snippet);
  if (s.includes("request.locale.iso_code == 'nb'")) return null;
  for (const [sv, nbOrd] of MS_PAKET_ORD) {
    if (!s.includes(sv)) continue;
    // aria-label sitter i ett attribut — grenen måste ligga inuti citattecknen.
    if (sv.startsWith('aria-label=')) {
      s = s.replaceAll(sv, `aria-label="{% if request.locale.iso_code == 'nb' %}Velg pakke{% else %}Välj paket{% endif %}"`);
    } else {
      s = s.replaceAll(sv, `{% if request.locale.iso_code == 'nb' %}${nbOrd}{% else %}${sv}{% endif %}`);
    }
  }
  return s;
}

// Språkmärkta galleribilder: alt som börjar med [SV]/[NO]/… visas bara för
// sitt språk (omärkt = alla). Dawns slider hoppar själv över dolda bilder.
// `locales` är butikens Shopify-locales (sv, nb, da, fi, de, en) — märket
// är landskoden folk faktiskt skriver i alt-texten. Idempotent på märket.
export const GALLERIFILTER_MARKE = 'opf-gallerifilter';
const LOCALE_MARKE = { sv: 'SV', nb: 'NO', no: 'NO', da: 'DK', fi: 'FI', de: 'DE', en: 'EN' };
export function msHeadGallerifilter(locales = ['sv', 'nb']) {
  const par = [...new Set(lista(locales).map((l) => String(l).toLowerCase()))]
    .map((l) => [l, LOCALE_MARKE[l] ?? l.toUpperCase()]);
  if (par.length === 0) par.push(['sv', 'SV'], ['nb', 'NO']);
  const alla = par.map(([, m]) => `[${m}]`);
  const regel = (marke) => `.product__media-item:has(img[alt^="${marke}"]),.thumbnail-list__item:has(img[alt^="${marke}"]),.product__media-list li:has(img[alt^="${marke}"])`;
  // För varje locale: dölj alla ANDRA märken. Okänd locale ser det första
  // språkets (huvudspråkets) bilder.
  const cssFor = (m) => {
    const dolj = alla.filter((x) => x !== `[${m}]`);
    return dolj.length > 0 ? `<style>${dolj.map(regel).join(',')}{display:none!important}</style>` : '';
  };
  const grenar = par.map(([l, m], i) => `${i === 0 ? '{%- if' : '{%- elsif'} request.locale.iso_code == '${l}' -%}${cssFor(m)}`);
  return `
{%- comment -%} ${GALLERIFILTER_MARKE}: språkmärkta galleribilder (${alla.join('/')} i alt) döljs för fel språk. {%- endcomment -%}
${grenar.join('\n')}
{%- else -%}${cssFor(par[0][1])}
{%- endif -%}
`;
}
