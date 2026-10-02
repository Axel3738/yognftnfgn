// sajtfix.mjs — rättningarna ur sajtgranskningen 2026-10-01 som sitter i TEMAT (Matstrumpor).
//
// Granskningen: matstrumpor/marknader/granskning/SAJT-2026-10-01.md (Axels order 2026-10-02:
// "rätta allt rött och gult"). Det här är temadelen. Data (policyn, mejlen, presentkortsbilden)
// och Spoks ligger i egna skript; README.md → "Sajtgranskningen 2026-10-01: rättningarna".
//
// Fynd → fil:
//
//   S-001 🔴 köpknappen går att trycka innan paketväljaren kopplat sig, och en dold kortgrupp med
//            samma radionamn tar kundens val:
//              snippets/buy-buttons.liquid  knappen låses direkt efter sig själv (inline-skript, INTE
//                                           `disabled` i HTML:en: Dawn läser knappens attribut ur den
//                                           hämtade sektionen vid variantbyte och hade låst den för gott)
//              assets/ms-paket.js           kopplaKnapp() låser upp; en dold väljare markerar aldrig
//                                           ett kort; reservpriset i kundens valuta (S-008); nätfel på
//                                           kundens språk (S-009)
//              snippets/ms-paket.liquid     eget radionamn per kortgrupp
//   S-002/S-003/S-006/S-012/S-013/S-014/S-016 🔴/🟡 utlandsbesökare på matstrumpor.se, matstrumpor.eu
//            och myshopify-adressen hamnar i Sverige, SEK eller på svenska:
//              snippets/ms-flytt.liquid (ny) + layout/theme.liquid  skickar dem till matstrumpor.com i
//                                           rätt språk med rätt land (?country=). Landet läses ur
//                                           Shopifys egen server-timing (country;desc="DE"), som är
//                                           besökarens riktiga land även där Shopify ger Sverige.
//   S-004 🟡 delningslänken saknar land:   sections/main-product.liquid + assets/share.js
//   S-007 🟡 A/B-testet byter korten framför kunden:
//              assets/ms-ab.js              synligheten sätts medan sidan tolkas (MutationObserver)
//              snippets/ms-head.liquid      fel variant göms med CSS direkt när varianten är vald
//   S-010 🟡 Judge.me-märket svenskt före skriptet: ms-head.liquid (texten dold tills Judge.me ritat)
//   S-022 🟡 ätpinnarnas sida:              templates/product.tillbehor.json (samma rader som strumporna)
//   S-023 🟡 TWD som "$":                   assets/ms-cro.js ("NT$")
//   S-024 🟡 olika prisformat på samma sida: assets/ms-cro.js + ms-head.liquid (JS formaterar som
//            Liquids `| money`, ur ett prov Shopify själv formaterat i kundens valuta)
//   S-026 🟡 polska tecken i reservtypsnitt: ms-head.liquid (pl: ett rundat typsnitt med latin-ext)
//   S-027 🟡 valutan på egen rad i korgen:  ms-head.liquid (nowrap)
//   S-028 🟡 språkfel:                      locales/es.json, locales/pt-PT.json (du-form, se pt/),
//                                           assets/ms-cro.js (italienskt datumintervall)
//   S-029 🟡 utvecklarkommentarer i källan: ms-head.liquid (.no-blockets CSS-kommentarer)
//
//   node matstrumpor/marknader/sajtfix.mjs                         # torrt: läser MAIN, visar vad som byts
//   node matstrumpor/marknader/sajtfix.mjs --tema <gid> --skarpt   # skriver i det temat, läser tillbaka
//   node matstrumpor/marknader/sajtfix.mjs --skarpt                # skriver i MAIN (konfig.json → tema_id)
//
// Exakta byten (bytExakt: fel antal träffar = kastar, aldrig "nästan rätt") och idempotenta
// (markören MARK per fil). Originalen sparas i output/sajtfix/<tema>/fore/ före varje skarp skrivning.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bytExakt } from './temapatch.mjs';
import { saljlander } from './domantema.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const MARK = 'ms-sajtfix';
const KONFIG = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Språken på matstrumpor.com (Shopifys rootUrls, sparning/butiker.json → mejl_sprak[].sida).
// Engelskan ligger i roten. Obs: på .se bär portugisiskan /pt och kinesiskan /zh — därför byggs
// målet alltid ur språkkoden, aldrig ur .se-adressens mapp.
// ---------------------------------------------------------------------------
export const COM_MAPP = {
  nb: '/nb', da: '/da', fi: '/fi', en: '', de: '/de', fr: '/fr', nl: '/nl', es: '/es',
  it: '/it', pl: '/pl', 'pt-PT': '/pt-pt', ja: '/ja', 'zh-TW': '/zh-tw',
};
// Landets språk när webbläsaren inte säger något vi har. Land utan rad ⇒ engelska.
export const LAND_SPRAK = {
  NO: 'nb', DK: 'da', FI: 'fi', DE: 'de', AT: 'de', CH: 'de', LI: 'de', FR: 'fr', BE: 'fr', LU: 'fr',
  NL: 'nl', ES: 'es', IT: 'it', PL: 'pl', PT: 'pt-PT', JP: 'ja', TW: 'zh-TW',
};
// Marknadsländerna utom Sverige, ur konfig.json — ett nytt land i en marknad följer med av sig självt.
export const UTLANDET = saljlander(KONFIG).filter((l) => l !== 'SE');

// ---------------------------------------------------------------------------
// Den rena logiken bakom snippets/ms-flytt.liquid. Samma regler skrivs ut som JS i snippeten
// (flyttJs nedan bygger den ur exakt de här tabellerna); testerna kör den här versionen.
// ---------------------------------------------------------------------------

/** Första språket i webbläsarens lista som butiken har. 'sv' om svenska finns NÅGONSTANS i listan. */
export function webblasarSprak(lista) {
  const l = (lista || []).map((x) => String(x || '').toLowerCase()).filter(Boolean);
  if (l.some((t) => /^sv\b/.test(t))) return 'sv';
  for (const t of l) {
    if (/^(nb|no|nn)\b/.test(t)) return 'nb';
    if (/^zh-(tw|hant|hk|mo)\b/.test(t)) return 'zh-TW';
    if (/^pt\b/.test(t)) return 'pt-PT';
    const k = t.split('-')[0];
    if (k !== 'zh' && k !== 'pt' && Object.prototype.hasOwnProperty.call(COM_MAPP, k)) return k;
  }
  return null;
}

const BOT = /bot|crawl|spider|slurp|lighthouse|headless|facebookexternalhit|meta-external|inspectiontool|google-|bingpreview|yandex|baidu|duckduck|petal|ahrefs|semrush|applebot|whatsapp|telegram|pinterest|embedly|quora|vkshare|redditbot|bytespider|gptbot|claudebot|perplexity|ccbot|preview/i;
const EGNA = /(^|\.)matstrumpor\.(se|com|no|eu)$/;

/**
 * Vart ska besöket? null = stanna, 'stanna' = stanna och kom ihåg det (kakan ms_stanna), annars adressen.
 *  s: { vard, sprak, rot, land (Shopifys), verkligt (server-timing), roll, typ, sida, sok, hash, vag,
 *       ua, sprakLista, referrer, nu, senast, stannaKaka }
 */
export function flyttMal(s) {
  if (s.roll !== 'main' && !/[?&]ms_flytt_prov=1(&|$)/.test(s.sok || '')) return null;
  if (BOT.test(s.ua || '')) return null;
  const q = new URLSearchParams(s.sok || '');
  if (q.has('ms_stanna')) return 'stanna';
  if (q.has('country') || q.has('preview_theme_id')) return null;
  if (/^(cart|password|gift_card|captcha|customers)/.test(s.typ || '')) return null;
  if (s.senast && s.nu - s.senast < 15000) return null;       // ingen slinga
  const vard = String(s.vard || '').toLowerCase();
  const se = /(^|\.)matstrumpor\.se$/.test(vard);
  const eu = /(^|\.)matstrumpor\.eu$/.test(vard);
  const my = /\.myshopify\.com$/.test(vard);
  if (!se && !eu && !my) return null;
  if (se && s.stannaKaka && s.sida !== 'data-sharing-opt-out') return null;
  const land = /^[A-Z]{2}$/.test(s.verkligt || '') ? s.verkligt : s.land;
  const rotSprak = eu ? 'en' : 'sv';
  // Sökvägen utan språkmappen (routes.root_url är "/" eller "/de").
  let vag = s.vag || '/';
  if (s.rot && s.rot !== '/' && (vag === s.rot || vag.indexOf(s.rot + '/') === 0)) vag = vag.slice(s.rot.length) || '/';
  q.delete('country');

  const tillSe = () => `https://matstrumpor.se${vag}${q.toString() ? '?' + q : ''}${s.hash || ''}`;
  const tillCom = (sprak, medLand) => {
    const mapp = COM_MAPP[sprak] ?? '';
    const sokvag = vag === '/' && mapp ? mapp : mapp + vag;
    if (medLand) q.set('country', land);
    return `https://matstrumpor.com${sokvag}${q.toString() ? '?' + q : ''}${s.hash || ''}`;
  };
  const valjSprak = () => {
    const w = webblasarSprak(s.sprakLista);
    return (w && w !== 'sv' ? w : null) || LAND_SPRAK[land] || 'en';
  };

  if (se) {
    if (!land || land === 'SE' || !UTLANDET.includes(land)) return null;
    if (s.sprak !== 'sv') return tillCom(s.sprak, true);          // en språkmapp: språket står kvar
    if (webblasarSprak(s.sprakLista) === 'sv') return null;        // svensk webbläsare utomlands
    // Från en annan av våra domäner (landväljaren på .com, en länk där): kunden valde Sverige själv,
    // och det gäller resten av besöket (kakan). Undantag: "Dina integritetsval", som Shopifys
    // integritetspolicy alltid länkar på .se (S-006).
    let refVard = '';
    try { refVard = s.referrer ? new URL(s.referrer).hostname.toLowerCase() : ''; } catch (e) { refVard = ''; }
    if (EGNA.test(refVard) && refVard !== vard && s.sida !== 'data-sharing-opt-out') return 'stanna';
    return tillCom(valjSprak(), true);
  }
  // .eu och myshopify-adressen ska aldrig vara ett mål.
  if (land === 'SE') return tillSe();
  if (!land || !UTLANDET.includes(land)) return tillCom(s.sprak !== rotSprak && COM_MAPP[s.sprak] !== undefined ? s.sprak : 'en', false);
  return tillCom(s.sprak !== rotSprak && COM_MAPP[s.sprak] !== undefined ? s.sprak : valjSprak(), true);
}

// Tar bort kommentarerna ur en funktions källtext: hela kommentarsrader och en kommentar efter koden
// (minst två blanksteg före //). En adress som https://… rörs inte, den har inget blanksteg före //.
export function utanKommentarer(kod) {
  return String(kod).split('\n')
    .filter((rad) => !/^\s*\/\//.test(rad))
    .map((rad) => rad.replace(/\s{2,}\/\/\s.*$/, ''))
    .join('\n');
}

// JS-versionen i snippeten. Byggs ur flyttMal:s källkod, så testerna och sajten kör samma regler.
// Utan kommentarerna: snippeten står i källan på varje sida, och granskningen (S-029) ville inte ha
// utvecklarkommentarer där.
function flyttJs() {
  const kod = [webblasarSprak, flyttMal].map((f) => utanKommentarer(f.toString())).join('\n');
  return `var COM_MAPP=${JSON.stringify(COM_MAPP)},LAND_SPRAK=${JSON.stringify(LAND_SPRAK)},UTLANDET=${JSON.stringify(UTLANDET)};
var BOT=${BOT.toString()},EGNA=${EGNA.toString()};
${kod.replace(/\bexport\s+/g, '')}`;
}

export const SNIPPET_FLYTT = `{%- comment -%}
  ${MARK}: utlandsbesökare på matstrumpor.se, matstrumpor.eu och myshopify-adressen skickas till
  matstrumpor.com i rätt språk och med rätt land (matstrumpor/marknader/sajtfix.mjs, granskningen
  2026-10-01 S-002/S-003/S-006/S-012/S-013/S-014/S-016). Landet är besökarens riktiga (Shopifys
  server-timing), också där Shopify ger Europa-marknaden landet Sverige på .se. Stannar: svenskar,
  svenska webbläsare utomlands, botar, temaredigeraren, ?country= i adressen, korgen och kontot.
  Ändra reglerna i sajtfix.mjs (flyttMal) och kör om — snippeten byggs därifrån.
{%- endcomment -%}
{%- unless request.design_mode -%}
<script>
(function () {
  try {
    ${flyttJs().replace(/\n/g, '\n    ')}
    var verkligt = null;
    try {
      var nav = performance.getEntriesByType('navigation')[0];
      (nav && nav.serverTiming || []).forEach(function (t) { if (t.name === 'country') verkligt = t.description; });
    } catch (e) {}
    var senast = 0;
    try { senast = Number(sessionStorage.getItem('ms_flytt') || 0); } catch (e) {}
    var mal = flyttMal({
      vard: location.hostname, sprak: {{ request.locale.iso_code | json }}, rot: {{ routes.root_url | json }},
      land: {{ localization.country.iso_code | json }}, verkligt: verkligt, roll: {{ theme.role | json }},
      typ: {{ request.page_type | json }}, sida: {{ page.handle | default: '' | json }},
      sok: location.search, hash: location.hash, vag: location.pathname, ua: navigator.userAgent,
      sprakLista: navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language],
      referrer: document.referrer, nu: Date.now(), senast: senast,
      stannaKaka: /(^|;\\s*)ms_stanna=1(;|$)/.test(document.cookie)
    });
    if (mal === 'stanna') { document.cookie = 'ms_stanna=1; path=/; SameSite=Lax'; return; }
    if (!mal || mal === location.href) return;
    try { sessionStorage.setItem('ms_flytt', String(Date.now())); } catch (e) {}
    location.replace(mal);
  } catch (e) {}
})();
</script>
{%- endunless -%}
`;

// ---------------------------------------------------------------------------
// S-001: köpknappen och radionamnen
// ---------------------------------------------------------------------------

const KNAPP_SOK = `            {%- render 'loading-spinner' -%}
          </button>
          {%- if show_dynamic_checkout -%}`;
// v1 (2026-10-02 förmiddag): låset bara i ett skript EFTER knappen. Mätt live samma dag på
// strypt nät: HTML:en kom i bitar, och knappen syntes klickbar en kort stund innan skriptet efter
// den hunnit fram. v2 märker knappen redan i serverns HTML (data-ms-las + CSS pointer-events) —
// fortfarande inte med disabled, se nedan.
const KNAPP_NY_V1 = `            {%- render 'loading-spinner' -%}
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
          {%- if show_dynamic_checkout -%}`;
const KNAPP_V2 = `${MARK} (S-001) v2`;
const KNAPP_TAGG_SOK = `          <button
            id="ProductSubmitButton-{{ section_id }}"
            type="submit"`;
const KNAPP_TAGG_NY = `          {%- comment -%}
            ${KNAPP_V2}: köpknappen är låst tills paketväljaren (assets/ms-paket.js) lyssnar på den.
            Innan dess gick den att trycka, och korgen fick EN låda till fullpris fast "Köp 2 – få 2"
            stod vald. Låset är data-ms-las i HTML:en (CSS i ms-head stänger klick från första stund)
            plus disabled från skriptet direkt efter knappen. Aldrig disabled i HTML:en: Dawn läser
            just det attributet ur den hämtade sektionen vid variantbyte och hade låst knappen för gott.
            ms-paket.js låser upp; DOMContentLoaded låser upp som reserv (efter alla defer-skript).
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
          <button
            id="ProductSubmitButton-{{ section_id }}"
            {% if ms_las %}data-ms-las aria-disabled="true"{% endif %}
            type="submit"`;
const KNAPP_NY = `            {%- render 'loading-spinner' -%}
          </button>
          {%- if ms_las -%}
            <script>(function(){var b=document.getElementById('ProductSubmitButton-{{ section_id }}');if(!b||!b.hasAttribute('data-ms-las'))return;b.disabled=true;b.setAttribute('aria-busy','true');document.addEventListener('DOMContentLoaded',function(){if(b.hasAttribute('data-ms-las')){b.removeAttribute('data-ms-las');b.removeAttribute('aria-disabled');b.removeAttribute('aria-busy');b.disabled=false;}});})();</script>
          {%- endif -%}
          {%- if show_dynamic_checkout -%}`;
export function patchaKnapp(kod) {
  if (kod.includes(KNAPP_V2)) return { kod, byten: [], hoppade: ['buy-buttons: redan patchad (v2)'] };
  let ut = kod;
  const byten = [];
  if (ut.includes(MARK)) { ut = bytExakt(ut, KNAPP_NY_V1, KNAPP_SOK, 1); byten.push('v1 bort'); }
  ut = bytExakt(ut, KNAPP_TAGG_SOK, KNAPP_TAGG_NY, 1);
  ut = bytExakt(ut, KNAPP_SOK, KNAPP_NY, 1);
  byten.push('knapplås');
  return { kod: ut, byten, hoppade: [] };
}

const RADIO_SOK = `            <input
              class="ms-paket__input"
              type="radio"
              name="ms-paket-{{ uid }}"`;
const RADIO_NY = `            {%- comment -%} ${MARK} (S-001): eget radionamn per kortgrupp. Det dolda sortvalet bar samma namn som paketet och tog kundens markering. {%- endcomment -%}
            <input
              class="ms-paket__input"
              type="radio"
              name="ms-paket-{{ uid }}-{{ ab | default: 'x' }}{% if mix %}-mix{% endif %}"`;
export function patchaPaketLiquid(kod) {
  if (kod.includes(MARK)) return { kod, byten: [], hoppade: ['ms-paket.liquid: redan patchad'] };
  return { kod: bytExakt(kod, RADIO_SOK, RADIO_NY, 1), byten: ['radionamn'], hoppade: [] };
}

const PJS = [
  // Den dolda väljaren markerar aldrig ett kort.
  [`      var vald = this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      vald.checked = true;
      this.onChange({ target: vald });`,
  `      // ${MARK}: en dold paketväljare (A/B-syskonet, sortvalet) markerar aldrig ett kort.
      var vald = this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      if (!this.inaktiv()) vald.checked = true;
      this.onChange({ target: vald });`],
  [`      var vald = this.vald || this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      if (vald) this.onChange({ target: vald });`,
  `      var vald = this.vald || this.inputs.filter(function (i) { return i.checked; })[0] || this.inputs[0];
      if (vald && !vald.checked) vald.checked = true;
      if (vald) this.onChange({ target: vald });`],
  // Knappen låses upp när köplyssnaren sitter.
  [`      document.addEventListener('submit', this.kop.bind(this), true);
    }`,
  `      document.addEventListener('submit', this.kop.bind(this), true);

      // ${MARK}: knappen låstes i snippets/buy-buttons.liquid tills köplyssnaren ovan sitter.
      if (this.knapp.hasAttribute('data-ms-las')) {
        this.knapp.removeAttribute('data-ms-las');
        this.knapp.removeAttribute('aria-disabled');
        this.knapp.removeAttribute('aria-busy');
        this.knapp.disabled = false;
      }
    }`],
  // S-008: reservpriset i kundens valuta, inte "44,9 kr" på /nl.
  [`  function money(cents, format) {
    if (window.MS && window.MS.money) return window.MS.money(cents, format);
    return (cents / 100).toLocaleString('sv-SE') + ' kr';
  }`,
  `  function money(cents, format) {
    if (window.MS && window.MS.money) return window.MS.money(cents, format);
    // ${MARK}: reservvägen (ms-cro.js uteblev) skrev "kr" i alla valutor. Kundens valuta och sidans språk.
    var sprak = document.documentElement.lang || 'sv';
    var valuta = (window.Shopify && window.Shopify.currency && window.Shopify.currency.active) || 'SEK';
    try {
      return new Intl.NumberFormat(sprak, { style: 'currency', currency: valuta }).format(cents / 100);
    } catch (e) {
      return (cents / 100).toFixed(2);
    }
  }`],
  // S-009: ett nätfel ("Failed to fetch") visas aldrig rått — den översatta raden i stället.
  [`          fel.textContent = e.message || msPaketText('fel_forsok_igen', 'Det gick inte att lägga i varukorgen. Försök igen.');`,
  `          // ${MARK}: webbläsarens råa nätfel ("Failed to fetch") visas aldrig — bara Shopifys egna svar.
          fel.textContent = (e && e.name !== 'TypeError' && e.message) || msPaketText('fel_forsok_igen', 'Det gick inte att lägga i varukorgen. Försök igen.');`],
];
const UPPLAS_V1 = `        this.knapp.removeAttribute('data-ms-las');
        this.knapp.removeAttribute('aria-busy');`;
const UPPLAS_V2 = `        this.knapp.removeAttribute('data-ms-las');
        this.knapp.removeAttribute('aria-disabled');
        this.knapp.removeAttribute('aria-busy');`;
export function patchaPaketJs(kod) {
  if (kod.includes(MARK)) {
    if (kod.includes(UPPLAS_V2)) return { kod, byten: [], hoppade: ['ms-paket.js: redan patchad'] };
    return { kod: bytExakt(kod, UPPLAS_V1, UPPLAS_V2, 1), byten: ['upplåsning v2 (aria-disabled)'], hoppade: [] };
  }
  let ut = kod;
  for (const [sok, ny] of PJS) ut = bytExakt(ut, sok, ny, 1);
  return { kod: ut, byten: ['dold väljare', 'aktivera', 'upplåsning', 'reservpris', 'nätfel'], hoppade: [] };
}

// ---------------------------------------------------------------------------
// S-007: A/B-varianten sätts medan sidan tolkas
// ---------------------------------------------------------------------------
const AB_SOK = `  applyVisibility();
  if (document.readyState === 'loading') {`;
const AB_NY = `  applyVisibility();
  // ${MARK}: rätt variant så fort blocket finns i sidan, inte först vid DOMContentLoaded. Annars
  // syntes fel variants kort i flera sekunder på mobilnät, och ett val där försvann.
  if (document.readyState === 'loading' && typeof MutationObserver === 'function' && Object.keys(assigned).length) {
    var bevakare = new MutationObserver(function () { applyVisibility(); });
    bevakare.observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('DOMContentLoaded', function () { bevakare.disconnect(); });
  }
  if (document.readyState === 'loading') {`;
export function patchaAb(kod) {
  if (kod.includes(MARK)) return { kod, byten: [], hoppade: ['ms-ab.js: redan patchad'] };
  return { kod: bytExakt(kod, AB_SOK, AB_NY, 1), byten: ['synlighet medan sidan tolkas'], hoppade: [] };
}

// ---------------------------------------------------------------------------
// ms-head.liquid: CSS (S-007, S-010, S-026, S-027), prisprovet (S-024), .no-kommentarerna (S-029)
// ---------------------------------------------------------------------------
export const HEAD_BLOCK = `
{%- comment -%}
  ${MARK} (matstrumpor/marknader/sajtfix.mjs, granskningen 2026-10-01):
  - S-007: fel A/B-variant göms med CSS så fort ms-ab.js satt varianten på <html>, innan blocket ens ritats.
  - S-010: Judge.me-märkets text står på svenska i serverns HTML; den döljs utanför svenskan tills Judge.me översatt den.
  - S-026: Mochiy Pop P One saknar polska bokstäver (ą ę ł …), som då ritades i ett annat typsnitt mitt i orden.
    Polskan får ett rundat typsnitt som har dem.
  - S-027: pris och valuta på samma rad i korgen.
  - S-024: ett belopp som Shopify själv formaterat i kundens valuta — ms-cro.js formaterar paketväljarens
    priser likadant som köprutan och korgen.
{%- endcomment -%}
<style>
  {%- for line in raw_tests -%}
    {%- liquid
      assign ms_t = line | strip
      assign ms_h = ms_t | slice: 0, 1
      assign ms_id = ms_t | split: ':' | first | strip
    -%}
    {%- if ms_t != blank and ms_h != '#' and ms_id != blank -%}
  html[data-ms-ab-{{ ms_id }}="a"] [data-ms-ab="{{ ms_id }}:b"], html[data-ms-ab-{{ ms_id }}="b"] [data-ms-ab="{{ ms_id }}:a"] { display: none !important; }
    {%- endif -%}
  {%- endfor %}
  html:not([lang="sv"]) .jdgm-widget:not(.jdgm--done-setup) .jdgm-prev-badge__text { visibility: hidden !important; }
  .cart-item__price-wrapper .price, .cart-item__final-price, .cart-item__old-price, .cart-item .price, .totals__total-value, .cart-drawer .price { white-space: nowrap; }
</style>
{%- if request.locale.iso_code == 'pl' -%}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@700;800&display=swap">
<style>
  html[lang="pl"] { --font-body-family: "M PLUS Rounded 1c", ui-rounded, system-ui, sans-serif; --font-heading-family: "M PLUS Rounded 1c", ui-rounded, system-ui, sans-serif; --font-body-weight: 700; --font-heading-weight: 800; }
</style>
{%- endif -%}
<script>window.MS = window.MS || {}; window.MS.pengaprov = { text: {{ 123456789 | money | json }}, valuta: {{ cart.currency.iso_code | json }} };</script>
`;
const NO_KOMMENTARER = [
  ['  /* Bara Norge och norska på .no: inga land- eller språkväljare. */\n', ''],
  ['  /* Judge.me visar recensionerna på svenska på norska sidor; de norska ritas av ms-omdomen-no. */\n', ''],
  ['  /* "Nå i hele verden" säger internationellt, B-sidan ska kännas norsk. */\n', ''],
];
const HEAD_ANKARE = `<script src="{{ 'ms-ab.js' | asset_url }}"></script>`;
export const KNAPPLAS_CSS = `{%- comment -%} ${MARK}: knapplås — köpknappen tar inga klick förrän paketväljaren lyssnar (snippets/buy-buttons.liquid, S-001) {%- endcomment -%}
<style>button[data-ms-las] { pointer-events: none; opacity: .6; cursor: progress; }</style>`;
export function patchaHead(kod) {
  const byten = [];
  let ut = kod;
  for (const [sok, ny] of NO_KOMMENTARER) if (ut.includes(sok)) { ut = bytExakt(ut, sok, ny, 1); byten.push('no-kommentar'); }
  if (!ut.includes(MARK)) {
    // Före ms-ab.js: CSS-reglerna ska finnas när attributet sätts, och raw_tests är redan läst.
    ut = bytExakt(ut, HEAD_ANKARE, HEAD_BLOCK.trim() + '\n' + HEAD_ANKARE, 1);
    byten.push('css + prisprov');
  }
  if (!ut.includes(`${MARK}: knapplås`)) {
    ut = bytExakt(ut, HEAD_ANKARE, KNAPPLAS_CSS + '\n' + HEAD_ANKARE, 1);
    byten.push('knapplås-css');
  }
  return byten.length ? { kod: ut, byten, hoppade: [] } : { kod, byten: [], hoppade: ['ms-head: redan patchad'] };
}

// ---------------------------------------------------------------------------
// ms-cro.js: prisformatet (S-024), NT$ (S-023), italienskt datumintervall (S-028)
// ---------------------------------------------------------------------------
const CRO_PENGAR_SOK = `    if (aktiv && aktiv !== 'SEK' && aktiv !== butikens) {
      try {`;
const CRO_PENGAR_NY = `    if (aktiv && aktiv !== 'SEK' && aktiv !== butikens) {
      // ${MARK}: samma format som Liquids \`| money\` på samma sida (köpruta, korg). Förut stod
      // "44,90 €" i paketväljaren bredvid köprutans "€44,90".
      var enligtProv = pengarSomShopify(cents, aktiv);
      if (enligtProv) return enligtProv;
      try {`;
const CRO_HJALP_SOK = `  function kopformular(rot) {`;
export const CRO_HJALP_NY = `  // ${MARK}: beloppet formaterat som Shopify formaterar kundens valuta. Mönstret läses ur ett prov
  // (MS.pengaprov, 1 234 567,89 formaterat av Liquid i snippets/ms-head.liquid): det som står före och
  // efter siffrorna, tusentalstecknet och om ören visas. TWD skrivs "NT$", aldrig "$" (S-023).
  function pengarSomShopify(cents, valuta) {
    var p = window.MS && window.MS.pengaprov;
    if (!p || !p.text || p.valuta !== valuta) return null;
    var t = document.createElement('textarea');
    t.innerHTML = String(p.text);
    var prov = t.value;
    var m = /\\d[\\d.,'\\s\\u00a0\\u202f]*\\d/.exec(prov);
    if (!m) return null;
    var tal = m[0];
    var fore = prov.slice(0, m.index);
    var efter = prov.slice(m.index + tal.length);
    var decSep = /[.,]\\d{2}$/.test(tal) ? tal.charAt(tal.length - 3) : '';
    var heltal = decSep ? tal.slice(0, -3) : tal;
    var tusen = /^\\d+(\\D)/.exec(heltal);
    var grupp = function (s) { return tusen ? s.replace(/\\B(?=(\\d{3})+(?!\\d))/g, tusen[1]) : s; };
    var ut = decSep
      ? grupp((cents / 100).toFixed(2).split('.')[0]) + decSep + (cents / 100).toFixed(2).split('.')[1]
      : grupp(String(Math.round(cents / 100)));
    if (valuta === 'TWD' && /^\\s*\\$\\s*$/.test(fore)) fore = fore.replace('$', 'NT$');
    return fore + ut + efter;
  }

  // ${MARK}: Shopify skriver TWD som "$1,690.00", som amerikanska dollar. Bara i Taiwans valuta.
  function ntDollar(rot) {
    if (!(window.Shopify && Shopify.currency && Shopify.currency.active === 'TWD') || !rot) return;
    var w = document.createTreeWalker(rot, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        return p === 'SCRIPT' || p === 'STYLE' || p === 'NOSCRIPT' || p === 'TEXTAREA' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    var n;
    while ((n = w.nextNode())) {
      if (/(^|[^A-Za-z$])\\$\\s?\\d/.test(n.nodeValue)) n.nodeValue = n.nodeValue.replace(/(^|[^A-Za-z$])\\$(\\s?\\d)/g, '$1NT$$$2');
    }
  }
  if (window.Shopify && Shopify.currency && Shopify.currency.active === 'TWD') {
    var ntKor = function () {
      ntDollar(document.body);
      if (typeof MutationObserver === 'function') {
        var vantar = false;
        new MutationObserver(function () {
          if (vantar) return;
          vantar = true;
          setTimeout(function () { vantar = false; ntDollar(document.body); }, 50);
        }).observe(document.body, { childList: true, subtree: true });
      }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ntKor); else ntKor();
  }

  function kopformular(rot) {`;
const CRO_DATUM_SOK = `  function datumIntervall(from, to) {
    var vanlig = svDate(from, false) + ' – ' + svDate(to, false);`;
const CRO_DATUM_NY = `  function datumIntervall(from, to) {
    var vanlig = svDate(from, false) + ' – ' + svDate(to, false);
    // ${MARK}: italienska, samma månad: "8–15 ottobre" (Intl ger "08–15", därför för hand).
    if (/^it\\b/.test(LANG) && from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      return from.getDate() + '–' + svDate(to, false);
    }`;
export function patchaCro(kod) {
  if (kod.includes(MARK)) return { kod, byten: [], hoppade: ['ms-cro.js: redan patchad'] };
  let ut = bytExakt(kod, CRO_PENGAR_SOK, CRO_PENGAR_NY, 1);
  ut = bytExakt(ut, CRO_HJALP_SOK, CRO_HJALP_NY, 1);
  ut = bytExakt(ut, CRO_DATUM_SOK, CRO_DATUM_NY, 1);
  return { kod: ut, byten: ['prisformat', 'NT$', 'italienskt datum'], hoppade: [] };
}

// ---------------------------------------------------------------------------
// S-004: delningslänken bär landet
// ---------------------------------------------------------------------------
const DELA_SOK = `                  assign share_url = product.selected_variant.url | default: product.url | prepend: request.origin
`;
const DELA_NY = `                  assign share_url = product.selected_variant.url | default: product.url | prepend: request.origin
                  # ${MARK} (S-004): länken bär landet. Utan ?country= blir en produktsida i en språkmapp på .com engelsk för den som öppnar den.
                  if localization.country.iso_code != 'SE'
                    if share_url contains '?'
                      assign share_url = share_url | append: '&country=' | append: localization.country.iso_code
                    else
                      assign share_url = share_url | append: '?country=' | append: localization.country.iso_code
                    endif
                  endif
`;
export function patchaDela(kod) {
  if (kod.includes(`${MARK} (S-004)`)) return { kod, byten: [], hoppade: ['main-product: delningslänken redan patchad'] };
  return { kod: bytExakt(kod, DELA_SOK, DELA_NY, 1), byten: ['delningslänk'], hoppade: [] };
}
const SHARE_SOK = `      updateUrl(url) {
        this.urlToShare = url;`;
const SHARE_NY = `      updateUrl(url) {
        // ${MARK}: länken bär landet (som delningsrutan i main-product.liquid).
        try {
          var land = window.Shopify && window.Shopify.country;
          if (land && land !== 'SE' && !/[?&]country=/.test(url)) url += (url.indexOf('?') === -1 ? '?' : '&') + 'country=' + land;
        } catch (e) {}
        this.urlToShare = url;`;
export function patchaShare(kod) {
  if (kod.includes(MARK)) return { kod, byten: [], hoppade: ['share.js: redan patchad'] };
  return { kod: bytExakt(kod, SHARE_SOK, SHARE_NY, 1), byten: ['delningslänk vid variantbyte'], hoppade: [] };
}

// ---------------------------------------------------------------------------
// layout/theme.liquid: ms-flytt först i <head>
// ---------------------------------------------------------------------------
const LAYOUT_SOK = `    <meta charset="utf-8">\n`;
const LAYOUT_NY = `    <meta charset="utf-8">\n    {%- comment -%} ${MARK}: utlandsbesökare på .se/.eu/myshopify till matstrumpor.com — snippets/ms-flytt.liquid {%- endcomment -%}\n    {%- render 'ms-flytt' -%}\n`;
export function patchaLayout(kod) {
  if (kod.includes(MARK)) return { kod, byten: [], hoppade: ['layout: redan patchad'] };
  return { kod: bytExakt(kod, LAYOUT_SOK, LAYOUT_NY, 1), byten: ['ms-flytt'], hoppade: [] };
}

// ---------------------------------------------------------------------------
// S-022: ätpinnarnas sida får strumpsidornas trust- och leveransrad (ja, zh-TW, danskans "returret")
// ---------------------------------------------------------------------------
// Mallar och språkfiler börjar med Shopifys kommentar /* … */ — den behålls som den är.
function lasMall(text) {
  const m = /^\s*\/\*[\s\S]*?\*\/\s*/.exec(text);
  const huvud = m ? m[0] : '';
  return { huvud, json: JSON.parse(text.slice(huvud.length)) };
}
export function patchaTillbehor(text, produktMall) {
  const t = lasMall(text);
  const p = lasMall(produktMall).json.sections.main.blocks;
  const b = t.json.sections.main.blocks;
  const byten = [];
  for (const id of ['ms_trust', 'ms_delivery']) {
    if (!b[id] || !p[id]) throw new Error(`product.tillbehor: blocket ${id} saknas`);
    if (b[id].settings.custom_liquid !== p[id].settings.custom_liquid) {
      b[id].settings.custom_liquid = p[id].settings.custom_liquid;
      byten.push(id);
    }
  }
  if (!byten.length) return { kod: text, byten: [], hoppade: ['product.tillbehor: redan som strumpsidorna'] };
  return { kod: t.huvud + JSON.stringify(t.json, null, 2), byten, hoppade: [] };
}

// ---------------------------------------------------------------------------
// S-028: språkfilerna
// ---------------------------------------------------------------------------
export function patchaEs(kod) {
  if (!kod.includes('"empty": "Tu carrito esta vacío"')) return { kod, byten: [], hoppade: ['es: redan rättad'] };
  return { kod: bytExakt(kod, '"empty": "Tu carrito esta vacío"', '"empty": "Tu carrito está vacío"', 1), byten: ['está'], hoppade: [] };
}
// pt-PT: temats inbyggda texter i ni-form ("O seu carrinho") — resten av sajten säger "tu".
// Bytena ligger i pt/tu.json (nyckel → ny text), skrivna av en sonnet-agent och granskade.
export function patchaPt(kod, byten) {
  if (!byten || !Object.keys(byten).length) return { kod, byten: [], hoppade: ['pt-PT: inga byten'] };
  const t = lasMall(kod);
  const gjorda = [];
  for (const [nyckel, ny] of Object.entries(byten)) {
    const delar = nyckel.split('.');
    let o = t.json;
    for (const d of delar.slice(0, -1)) o = o?.[d];
    const sista = delar.at(-1);
    if (!o || typeof o[sista] !== 'string') throw new Error(`pt-PT: nyckeln ${nyckel} finns inte`);
    if (o[sista] !== ny) { o[sista] = ny; gjorda.push(nyckel); }
  }
  if (!gjorda.length) return { kod, byten: [], hoppade: ['pt-PT: redan i tu-form'] };
  return { kod: t.huvud + JSON.stringify(t.json, null, 2), byten: [`${gjorda.length} texter i tu-form`], hoppade: [] };
}

// ---------------------------------------------------------------------------
// Filerna
// ---------------------------------------------------------------------------
const PT_FIL = join(ROT, 'sajtfix', 'pt-tu.json');
export const PATCHAR = {
  'snippets/buy-buttons.liquid': patchaKnapp,
  'snippets/ms-paket.liquid': patchaPaketLiquid,
  'assets/ms-paket.js': patchaPaketJs,
  'assets/ms-ab.js': patchaAb,
  'snippets/ms-head.liquid': patchaHead,
  'assets/ms-cro.js': patchaCro,
  'sections/main-product.liquid': patchaDela,
  'assets/share.js': patchaShare,
  'layout/theme.liquid': patchaLayout,
  'locales/es.json': patchaEs,
  'locales/pt-PT.json': (kod) => patchaPt(kod, (() => { try { return JSON.parse(readFileSync(PT_FIL, 'utf8')); } catch { return null; } })()),
};
export const NYA_FILER = { 'snippets/ms-flytt.liquid': SNIPPET_FLYTT };

// Tillbakaläsningen: varje fil ska bära sin markör (eller sitt byte).
function okFor(fil, innehall) {
  if (fil === 'snippets/ms-flytt.liquid') return innehall === SNIPPET_FLYTT;
  if (fil === 'snippets/buy-buttons.liquid') return innehall.includes(KNAPP_V2) && innehall.includes('data-ms-las aria-disabled');
  if (fil === 'snippets/ms-head.liquid') return innehall.includes(`${MARK}: knapplås`) && innehall.includes('MS.pengaprov');
  if (fil === 'assets/ms-paket.js') return innehall.includes(UPPLAS_V2);
  if (fil === 'templates/product.tillbehor.json') return innehall.includes('30 dages returret') && innehall.includes('お届け予定');
  if (fil === 'locales/es.json') return innehall.includes('"empty": "Tu carrito está vacío"');
  if (fil === 'locales/pt-PT.json') return !innehall.includes('"title": "O seu carrinho"');
  return innehall.includes(MARK);
}

// ---- Nät -------------------------------------------------------------------

async function huvud() {
  const arg = process.argv.slice(2);
  const skarpt = arg.includes('--skarpt');
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const k = await skapaKlient(lasButik(KONFIG.butik));
  const log = (s) => console.log(s);
  const temaId = arg.includes('--tema') ? arg[arg.indexOf('--tema') + 1] : KONFIG.tema_id;
  const namn = [...Object.keys(PATCHAR), ...Object.keys(NYA_FILER), 'templates/product.json', 'templates/product.tillbehor.json'];
  const d = await k.graphql(`query($id: ID!, $f: [String!]) { theme(id: $id) { name role files(filenames: $f, first: 30) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: temaId, f: namn });
  log(`Tema: ${d.theme.name} (${d.theme.role})${skarpt ? '  SKARPT' : '  (torrt — --skarpt skriver)'}`);
  const filer = Object.fromEntries(d.theme.files.nodes.map((n) => [n.filename, n.body.content]));
  const ut = [];
  for (const [fil, fn] of Object.entries(PATCHAR)) {
    if (filer[fil] === undefined) throw new Error(`${fil} saknas i temat`);
    const r = fn(filer[fil]);
    log(`${fil}: ${r.byten.length ? 'ändras (' + r.byten.join(', ') + ')' : r.hoppade.join(', ')}`);
    if (r.byten.length) ut.push({ filename: fil, body: { type: 'TEXT', value: r.kod } });
  }
  const tb = patchaTillbehor(filer['templates/product.tillbehor.json'], filer['templates/product.json']);
  log(`templates/product.tillbehor.json: ${tb.byten.length ? 'ändras (' + tb.byten.join(', ') + ')' : tb.hoppade.join(', ')}`);
  if (tb.byten.length) ut.push({ filename: 'templates/product.tillbehor.json', body: { type: 'TEXT', value: tb.kod } });
  // De nya filerna byggs hela ur repot: skrivs bara när temats version skiljer sig.
  for (const [fil, innehall] of Object.entries(NYA_FILER)) {
    const lika = filer[fil] === innehall;
    log(`${fil}: ${lika ? 'redan som i repot' : filer[fil] === undefined ? 'ny fil' : 'ändras (byggd om ur sajtfix.mjs)'}`);
    if (!lika) ut.unshift({ filename: fil, body: { type: 'TEXT', value: innehall } });
  }

  const mapp = join(ROT, 'output', 'sajtfix', String(temaId).split('/').pop());
  for (const f of ut) {
    for (const [del, text] of [['fore', filer[f.filename] ?? ''], ['efter', f.body.value]]) {
      const p = join(mapp, del, f.filename);
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, text);
    }
  }
  if (!skarpt) { log(`torrt: ${ut.length} filer skulle skrivas (före/efter i ${mapp})`); return; }
  // Nya filer först, så att layouten aldrig pekar på en snippet som inte finns.
  for (const f of ut) {
    const r = await k.graphql(`mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }`, { id: temaId, files: [f] });
    const fel = r.themeFilesUpsert.userErrors;
    if (fel.length) throw new Error(`${f.filename}: ${fel.map((e) => `${e.code} ${e.message}`).join('; ')}`);
    log(`✅ skrivet ${f.filename}`);
  }
  // Shopify kan svara med den gamla versionen en kort stund efter skrivningen — upp till tre läsningar.
  let las;
  for (let forsok = 1; forsok <= 3; forsok++) {
    las = await k.graphql(`query($id: ID!, $f: [String!]) { theme(id: $id) { files(filenames: $f, first: 30) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: temaId, f: ut.map((x) => x.filename) });
    if (las.theme.files.nodes.every((n) => okFor(n.filename, n.body.content)) || forsok === 3) break;
    await new Promise((r) => setTimeout(r, 5000));
  }
  let alla = true;
  for (const n of las.theme.files.nodes) {
    const ok = okFor(n.filename, n.body.content);
    if (!ok) alla = false;
    log(`${ok ? '✅' : '❌'} tillbakaläst ${n.filename}`);
  }
  if (!alla) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
