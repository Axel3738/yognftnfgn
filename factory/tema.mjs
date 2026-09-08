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
`;

// --- 1 + 2. Problem/emotion och gif ---
const PROBLEM = `{%- assign rubrik = product.metafields.opf.problem_rubrik.value -%}
{%- assign text = product.metafields.opf.problem_text.value -%}
{%- assign gif = product.metafields.opf.gif_problem.value -%}
{%- assign eyebrow = section.settings.eyebrow -%}
{%- if eyebrow == blank -%}{%- if request.locale.iso_code == 'nb' -%}{%- assign eyebrow = 'Kjenner du deg igjen?' -%}{%- else -%}{%- assign eyebrow = 'Känner du igen det?' -%}{%- endif -%}{%- endif -%}
{%- if rubrik != blank or text != blank -%}
<div class="ms-scope opf-block opf-problem">
  <div class="opf-wrap">
    <span class="opf-eyebrow">{{ eyebrow }}</span>
    {%- if rubrik != blank -%}<h2 class="opf-h2">{{ rubrik }}</h2>{%- endif -%}
    {%- if text != blank -%}<p class="opf-lede">{{ text | newline_to_br }}</p>{%- endif -%}
    {%- if gif != blank -%}
      <img class="opf-media" src="{{ gif }}" alt="{{ product.title | escape }}" loading="lazy">
    {%- endif -%}
  </div>
</div>
{%- endif -%}
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
{%- assign media = product.metafields.opf.media_losning.value -%}
{%- assign eyebrow = section.settings.eyebrow -%}
{%- if eyebrow == blank -%}{%- if request.locale.iso_code == 'nb' -%}{%- assign eyebrow = 'Løsningen' -%}{%- else -%}{%- assign eyebrow = 'Lösningen' -%}{%- endif -%}{%- endif -%}
{%- if rubrik != blank or text != blank -%}
<div class="ms-scope opf-block opf-losning" style="background: var(--ms-surface-2, transparent);">
  <div class="opf-wrap">
    <span class="opf-eyebrow">{{ eyebrow }}</span>
    {%- if rubrik != blank -%}<h2 class="opf-h2">{{ rubrik }}</h2>{%- endif -%}
    {%- if text != blank -%}<p class="opf-lede">{{ text | newline_to_br }}</p>{%- endif -%}
    {%- if media != blank -%}
      <img class="opf-media" src="{{ media }}" alt="{{ product.title | escape }}" loading="lazy">
    {%- endif -%}
  </div>
</div>
{%- endif -%}
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
const LIFESTYLE = `{%- assign bild = product.metafields.opf.bild_lifestyle.value -%}
{%- if bild != blank -%}
<div class="ms-scope opf-block opf-lifestyle" style="padding-block: 0;">
  <div class="opf-wrap">
    <img class="opf-media" style="margin-top: 0;" src="{{ bild }}" alt="{{ product.title | escape }}" loading="lazy">
  </div>
</div>
{%- endif -%}
<style>
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

// Lägger in OPF-sektionerna i en befintlig product.json utan att röra "main".
// Innehållsblocken hamnar direkt efter main; FAQ:n efter Judge.me-widgeten
// (sektion av typen "apps" eller med judgeme i id:t) om templaten har en.
// Temats egna ms-sektioner (sticky ATC, paket) lämnas orörda.
export function byggProduktTemplate(befintlig) {
  const mall = JSON.parse(String(befintlig).replace(/\/\*[\s\S]*?\*\//, '').trim());
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
