#!/usr/bin/env node
// forbestallning.mjs — förbeställning i Matstrumpor medan lagret är slutsålt.
//
// Axels beslut 2026-10-03: "jag börjar med att köra lite pre order på matstrumporna eftersom de
// redan är sold out". Allt är slut, nästa leverans är i lagret om 8 dagar (2026-10-11) och den
// säljer också slut snabbt. Evolve Q4 (docs/os/evolve/Q4-2026.md → Backend): sälj vidare som
// förbeställning med ärligt datum, annars tror kunden att paketet kommer om några dagar och
// det blir arga mejl och chargebacks.
//
// Vad som läggs in i det publicerade temat (alltid samma tre ställen, alla språk):
//   snippets/ms-forbestallning.liquid  rutan "Förbeställning" på produktsidan + en rad i korgen
//   snippets/ms-delivery-estimate      rutan ovanför "Beräknad leverans", och datumet räknas
//                                      från packningsdagen i stället för i dag (data-start)
//   assets/ms-cro.js                   <ms-delivery> läser data-start
//   snippets/cart-drawer.liquid        raden i varukorgslådan, ovanför Trustpilot-raden
//   sections/main-cart-footer.liquid   raden på varukorgssidan, ovanför kassaknappen
//
// Av och på styrs av shop-metafältet matstrumpor.forbestallning (json):
//   { aktiv, packning_fran, skickas_fran }. Rutan släcker sig själv dagen då skickas_fran
//   inträffar, och --av släcker den direkt. Temafilerna står kvar och ritar ingenting.
//
//   node matstrumpor/forbestallning.mjs                     # torrt: visar vad som byts
//   node matstrumpor/forbestallning.mjs --skarpt            # lägger in, sätter metafältet, läser tillbaka
//   node matstrumpor/forbestallning.mjs --av --skarpt       # släcker (metafältet aktiv: false)
//   node matstrumpor/forbestallning.mjs --kundvy            # Chromium som kund: syns rutan på sv/en/de/ja?
//
// Idempotent: en fil som redan bär markören rörs inte (snippeten skrivs alltid om, så ny text
// eller nytt datum går ut med en ny --skarpt). Originalen sparas i forbestallning/original/.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';
import { bytExakt } from './korglada.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const MAPP = join(HAR, 'forbestallning');
const ORIGINAL = join(MAPP, 'original');
export const MARK = 'ms-forbestallning';
export const METAFALT = { namespace: 'matstrumpor', key: 'forbestallning' };

export const SPRAK = ['sv', 'nb', 'da', 'fi', 'de', 'fr', 'nl', 'es', 'it', 'pl', 'pt-PT', 'en', 'ja', 'zh-TW'];
const INTL = { sv: 'sv-SE', nb: 'nb-NO', da: 'da-DK', fi: 'fi-FI', de: 'de-DE', fr: 'fr-FR', nl: 'nl-NL', es: 'es-ES', it: 'it-IT', pl: 'pl-PL', 'pt-PT': 'pt-PT', en: 'en-US', ja: 'ja-JP', 'zh-TW': 'zh-TW' };

export function lasKonfig() {
  return JSON.parse(readFileSync(join(MAPP, 'konfig.json'), 'utf8'));
}
export function lasTexter() {
  return JSON.parse(readFileSync(join(MAPP, 'texter.json'), 'utf8'));
}

/** "13 oktober", "October 13", "10月13日" … ur ISO-datumet, i språkets egen form. */
export function datumText(iso, sprak) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat(INTL[sprak], { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, d)));
}

const escLiquid = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Kontroll av texterna: alla språk, alla fält, {datum} där det ska, inga tankstreck. */
export const PAKET_FALT = ['rubrik_igen', 'rubrik', 'text_igen', 'text', 'nedrakning', 'kort', 'knapp', 'egenskap_nyckel', 'egenskap_varde'];
const MED_DATUM = ['text_igen', 'text', 'kort', 'egenskap_varde'];
export function kontrolleraTexter(texter) {
  const fel = [];
  for (const s of SPRAK) {
    const t = texter[s];
    if (!t) { fel.push(`${s}: saknas`); continue; }
    const falt = [['korg', t.korg], ...PAKET_FALT.map((f) => [`paket.${f}`, t.paket?.[f]])];
    for (const [namn, v] of falt) {
      if (!v || typeof v !== 'string') fel.push(`${s}.${namn}: saknas`);
      else if (/[—–]/.test(v)) fel.push(`${s}.${namn}: tankstreck`);
    }
    for (const [namn, v] of [['korg', t.korg], ...MED_DATUM.map((f) => [`paket.${f}`, t.paket?.[f]])]) {
      if (v && (v.match(/\{datum\}/g) ?? []).length !== 1) fel.push(`${s}.${namn}: {datum} ska stå exakt en gång`);
    }
    if (/[四]/.test(JSON.stringify(t))) fel.push(`${s}: talet fyra`);
  }
  return fel;
}

/** Millisekunder sedan 1970 för midnatt svensk tid den dagen (nedräkningens mål). */
export function midnattStockholm(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const utc = Date.UTC(y, m - 1, d);
  const delar = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Stockholm', hour: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(utc));
  const timme = Number(delar.find((x) => x.type === 'hour').value);
  return utc - timme * 3600 * 1000;
}

const escAttr = (s) => escLiquid(s).replace(/"/g, '&quot;');

/** Snippeten. Datumet bakas in per språk; metafältet bär av/på och slutdagen. */
export function byggSnippet(texter, konfig) {
  const varde = (s, v) => v.replace('{datum}', datumText(konfig.skickas_fran, s));
  const gren = (hamta, esc = escLiquid) => {
    const rader = SPRAK.filter((s) => s !== 'sv').map((s) => `{%- when '${s}' -%}${esc(varde(s, hamta(texter[s])))}`);
    return `{%- case request.locale.iso_code -%}${rader.join('')}{%- else -%}${esc(varde('sv', hamta(texter.sv)))}{%- endcase -%}`;
  };
  const p = (f) => gren((t) => t.paket[f]);
  const pa = (f) => gren((t) => t.paket[f], escAttr);
  // Rubriken är två meningar ("Slutsålt igen. Säkra din låda …"): den första blir det röda bandet
  // (utan punkt), den andra rubriken under. Japanska och kinesiska delas på "。".
  const del = (f, i) => gren((t) => {
    const m = /^(.+?)[.。]\s*(.+)$/.exec(t.paket[f]);
    if (!m) throw new Error(`paket.${f} går inte att dela i två meningar: ${t.paket[f]}`);
    return m[i + 1];
  });
  const mal = midnattStockholm(konfig.skickas_fran);
  return `{%- comment -%}
  ${MARK} — förbeställningen medan lagret är slutsålt (matstrumpor/forbestallning.mjs, Axel 2026-10-03).
  Skrivs om av skriptet — ändra texterna i matstrumpor/forbestallning/texter.json, inte här.
  Ritar bara när shop-metafältet matstrumpor.forbestallning är aktivt och skickas_fran inte inträffat.
  Parametrar: lage ('paket' | 'kort' | 'knapp' | 'data' | 'input' | 'korg' | 'produkt'), produkt (vid 'paket')
    paket   rutan överst i paketväljaren (ms-paket.liquid): rött band, rubrik, text, nedräkning i rutor
            till skickdagen (Axel 2026-10-03 kväll: "snyggare och mer urgency", inte brunt)
    kort    raden under varje paketkort
    knapp   köpknappens text (buy-buttons.liquid faller tillbaka på add_to_cart när den är tom)
    data    attributen på <ms-paket>, så ms-paket.js märker raderna "Förbeställning: skickas från …"
    input   samma märkning som dolt fält i produktformuläret (reservvägen utan ms-paket.js)
    korg    raden i varukorgslådan och på korgsidan
    produkt ingenting sedan rutan flyttade in i paketväljaren (2026-10-03 kväll)
  Sushilådan sålde slut i november 2025, så bara den säger "slutsålt igen".
{%- endcomment -%}
{%- liquid
  assign ms_fb = shop.metafields.matstrumpor.forbestallning.value
  assign ms_fb_idag = 'now' | date: '%Y%m%d' | plus: 0
  assign ms_fb_slut = ms_fb.skickas_fran | remove: '-' | plus: 0
-%}
{%- if ms_fb.aktiv == true and ms_fb_idag < ms_fb_slut -%}
  {%- case lage -%}
  {%- when 'korg' -%}
<p class="ms-forbestallning ms-forbestallning--korg" style="margin: 8px 0 10px; padding: 8px 12px; border-radius: 8px; background: #fff4f2; border: 1px solid #ff3b30; color: #c4211b; font-size: 0.95rem; font-weight: 700; text-align: left;">${gren((t) => t.korg)}</p>
  {%- when 'kort' -%}
<span class="ms-fb-kort">${p('kort')}</span>
  {%- when 'knapp' -%}${p('knapp')}
  {%- when 'data' %} data-fb-nyckel="${pa('egenskap_nyckel')}" data-fb-varde="${pa('egenskap_varde')}"
  {%- when 'input' -%}
<input type="hidden" name="properties[${pa('egenskap_nyckel')}]" value="${pa('egenskap_varde')}">
  {%- when 'paket' -%}
<div class="ms-forbestallning ms-fb-paket">
  <p class="ms-fb-paket__band"><span class="ms-fb-paket__prick" aria-hidden="true"></span>{%- if produkt.handle == 'sushi-strumpor' -%}${del('rubrik_igen', 0)}{%- else -%}${del('rubrik', 0)}{%- endif -%}</p>
  <div class="ms-fb-paket__kropp">
    <p class="ms-fb-paket__rubrik">{%- if produkt.handle == 'sushi-strumpor' -%}${del('rubrik_igen', 1)}{%- else -%}${del('rubrik', 1)}{%- endif -%}</p>
    <p class="ms-fb-paket__text">{%- if produkt.handle == 'sushi-strumpor' -%}${p('text_igen')}{%- else -%}${p('text')}{%- endif -%}</p>
    <div class="ms-fb-paket__nedrakning" data-ms-fb-nedrakning hidden>
      <span class="ms-fb-paket__etikett">${p('nedrakning')}</span>
      <span class="ms-fb-paket__klocka"><span class="ms-fb-ruta"><b data-ms-fb="0">0</b><i data-ms-fb-enhet="0">d</i></span><span class="ms-fb-ruta"><b data-ms-fb="1">00</b><i data-ms-fb-enhet="1">h</i></span><span class="ms-fb-ruta"><b data-ms-fb="2">00</b><i data-ms-fb-enhet="2">m</i></span><span class="ms-fb-ruta"><b data-ms-fb="3">00</b><i data-ms-fb-enhet="3">s</i></span></span>
    </div>
  </div>
</div>
<style>
  .ms-fb-paket { margin: 0 0 14px; border-radius: 14px; overflow: hidden; background: #fff; border: 2px solid #ff3b30; box-shadow: 0 8px 22px rgba(255, 59, 48, 0.14); text-align: left; }
  .ms-fb-paket p { margin: 0; }
  .ms-fb-paket__band { display: flex; align-items: center; gap: 9px; padding: 8px 14px; background: linear-gradient(90deg, #ff3b30, #ff7a1a); color: #fff; font-weight: 800; font-size: 0.82rem; letter-spacing: 0.08em; text-transform: uppercase; }
  .ms-fb-paket__prick { flex: none; width: 9px; height: 9px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8); animation: ms-fb-puls 1.4s infinite; }
  .ms-fb-paket__kropp { padding: 12px 14px 14px; }
  .ms-fb-paket__rubrik { font-weight: 800; font-size: 1.12rem; line-height: 1.3; color: #111; }
  .ms-fb-paket__text { margin-top: 6px !important; font-size: 0.9rem; line-height: 1.45; color: #444; }
  .ms-fb-paket__nedrakning { margin-top: 12px; }
  .ms-fb-paket__etikett { display: block; margin-bottom: 6px; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #ff3b30; }
  .ms-fb-paket__klocka { display: flex; gap: 6px; }
  .ms-fb-ruta { display: flex; align-items: baseline; justify-content: center; gap: 2px; min-width: 52px; padding: 7px 8px; border-radius: 9px; background: #111; color: #fff; }
  .ms-fb-ruta b { font-size: 1.3rem; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; }
  .ms-fb-ruta i { font-style: normal; font-size: 0.75rem; font-weight: 700; color: #ff8a6b; }
  .ms-fb-kort { display: block; margin-top: 3px; font-size: 0.8rem; font-weight: 800; color: #e5302a; }
  @keyframes ms-fb-puls { 0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.8); } 70% { box-shadow: 0 0 0 8px rgba(255, 255, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); } }
  @media (prefers-reduced-motion: reduce) { .ms-fb-paket__prick { animation: none; } }
</style>
<script>
  (function () {
    if (window.msFbNedrakning) return;
    window.msFbNedrakning = true;
    var MAL = ${mal}; // ${konfig.skickas_fran} 00:00 svensk tid
    var lang = (document.documentElement.lang || 'sv').toLowerCase();
    var ENHET = lang.indexOf('ja') === 0 ? ['日', '時間', '分', '秒'] : lang.indexOf('zh') === 0 ? ['天', '時', '分', '秒'] : ['d', 'h', 'm', 's'];
    function pad(n) { return n < 10 ? '0' + n : String(n); }
    function tick() {
      var kvar = MAL - Date.now();
      var s = Math.max(0, Math.floor(kvar / 1000));
      var v = [String(Math.floor(s / 86400)), pad(Math.floor(s % 86400 / 3600)), pad(Math.floor(s % 3600 / 60)), pad(s % 60)];
      document.querySelectorAll('[data-ms-fb-nedrakning]').forEach(function (el) {
        if (kvar <= 0) { el.hidden = true; return; }
        el.hidden = false;
        for (var i = 0; i < 4; i++) {
          var b = el.querySelector('[data-ms-fb="' + i + '"]'); if (b) b.textContent = v[i];
          var e = el.querySelector('[data-ms-fb-enhet="' + i + '"]'); if (e) e.textContent = ENHET[i];
        }
      });
      if (kvar > 0) setTimeout(tick, 1000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick); else tick();
  })();
</script>
  {%- endcase -%}
{%- endif -%}
`;
}

// ---- patcharna -------------------------------------------------------------------

const LEV_SOK = '<ms-delivery class="ms-scope"\n';
const LEV_NY = `{%- comment -%} ${MARK}: rutan + packningsdagen som start (matstrumpor/forbestallning.mjs) {%- endcomment -%}
{%- render 'ms-forbestallning', lage: 'produkt' -%}
{%- liquid
  assign ms_fb = shop.metafields.matstrumpor.forbestallning.value
  assign ms_fb_idag = 'now' | date: '%Y%m%d' | plus: 0
  assign ms_fb_slut = ms_fb.skickas_fran | remove: '-' | plus: 0
-%}
<ms-delivery class="ms-scope"
  {% if ms_fb.aktiv == true and ms_fb_idag < ms_fb_slut %}data-start="{{ ms_fb.packning_fran }}"{% endif %}
`;
export function patchaLeverans(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  return { kod: bytExakt(kod, LEV_SOK, LEV_NY), byten: ['rutan + data-start'] };
}

const JS_SOK = `      // Helg: packning startar först på måndag.
      var wd = start.getDay();`;
const JS_NY = `      // ${MARK}: förbeställning — packningen börjar först när lagret är inne (data-start, ÅÅÅÅ-MM-DD).
      if (this.dataset.start) {
        var ms_fb = this.dataset.start.split('-');
        var ms_fb_start = new Date(Number(ms_fb[0]), Number(ms_fb[1]) - 1, Number(ms_fb[2]));
        if (!isNaN(ms_fb_start.getTime()) && ms_fb_start > start) start = ms_fb_start;
      }
      // Helg: packning startar först på måndag.
      var wd = start.getDay();`;
export function patchaJs(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  return { kod: bytExakt(kod, JS_SOK, JS_NY), byten: ['<ms-delivery> läser data-start'] };
}

const LADA_SOK = "        {% render 'ms-trustpilot-rad', kompakt: true %}\n        <!-- CTAs -->";
const LADA_NY = `        {%- comment -%} ${MARK} {%- endcomment -%}{% render 'ms-forbestallning', lage: 'korg' %}\n${LADA_SOK}`;
export function patchaLada(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  return { kod: bytExakt(kod, LADA_SOK, LADA_NY), byten: ['raden i lådan'] };
}

const KORG_SOK = '              <div class="cart__ctas" {{ block.shopify_attributes }}>';
const KORG_NY = `              {%- comment -%} ${MARK} {%- endcomment -%}{% render 'ms-forbestallning', lage: 'korg' %}\n${KORG_SOK}`;
export function patchaKorg(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  return { kod: bytExakt(kod, KORG_SOK, KORG_NY), byten: ['raden på korgsidan'] };
}

const PAKET_DATA_SOK = '    data-varianter="{{ priskarta | strip | escape }}">';
const PAKET_DATA_NY = `    data-varianter="{{ priskarta | strip | escape }}"{% render 'ms-forbestallning', lage: 'data' %}>`;
const PAKET_LISTA_SOK = '    <div class="ms-paket__lista" role="radiogroup"';
const PAKET_LISTA_NY = `    {%- comment -%} ${MARK}: förbeställningen i paketväljaren (matstrumpor/forbestallning.mjs) {%- endcomment -%}\n    {%- render 'ms-forbestallning', lage: 'paket', produkt: p -%}\n${PAKET_LISTA_SOK}`;
const PAKET_KORT_SOK = `                {%- if niva.underrubrik.value != blank -%}
                  <span class="ms-paket__under">{{ niva.underrubrik.value }}</span>
                {%- endif -%}
`;
const PAKET_KORT_NY = `${PAKET_KORT_SOK}                {%- render 'ms-forbestallning', lage: 'kort' -%}
`;
export function patchaPaketLiquid(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  kod = bytExakt(kod, PAKET_DATA_SOK, PAKET_DATA_NY);
  kod = bytExakt(kod, PAKET_LISTA_SOK, PAKET_LISTA_NY);
  kod = bytExakt(kod, PAKET_KORT_SOK, PAKET_KORT_NY);
  return { kod, byten: ['rutan överst', 'raden på varje kort', 'märkningen på <ms-paket>'] };
}

const KNAPP_SOK = "                {{ 'products.product.add_to_cart' | t }}\n";
const KNAPP_NY = `                {%- comment -%} ${MARK}: "Förbeställ nu" medan förbeställningen pågår {%- endcomment -%}
                {%- capture ms_fb_knapp -%}{%- unless product.gift_card? -%}{%- render 'ms-forbestallning', lage: 'knapp' -%}{%- endunless -%}{%- endcapture -%}
                {%- if ms_fb_knapp != blank -%}{{ ms_fb_knapp }}{%- else -%}{{ 'products.product.add_to_cart' | t }}{%- endif -%}
`;
const FORM_SOK = "        data-type: 'add-to-cart-form'\n      -%}\n";
const FORM_NY = `${FORM_SOK}        {%- unless product.gift_card? -%}{%- render 'ms-forbestallning', lage: 'input' -%}{%- endunless -%}\n`;
export function patchaKnapp(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  kod = bytExakt(kod, KNAPP_SOK, KNAPP_NY);
  kod = bytExakt(kod, FORM_SOK, FORM_NY);
  return { kod, byten: ['knapptexten', 'dolda märkningen i formuläret'] };
}

const PJS_SOK = `        if (gvariant && gantal > 0) varor.push({ id: Number(gvariant), quantity: gantal });
      }

      var self = this;`;
const PJS_NY = `        if (gvariant && gantal > 0) varor.push({ id: Number(gvariant), quantity: gantal });
      }

      // ${MARK}: lådorna märks "Förbeställning: skickas från …" (syns i kassan, på ordern och i
      // orderbekräftelsen). Gåvan märks inte. Attributen sätts av snippets/ms-forbestallning.liquid.
      if (this.dataset.fbNyckel && this.dataset.fbVarde) {
        var fbNyckel = this.dataset.fbNyckel, fbVarde = this.dataset.fbVarde;
        varor.forEach(function (rad) {
          if (gvariant && String(rad.id) === String(gvariant)) return;
          rad.properties = {};
          rad.properties[fbNyckel] = fbVarde;
        });
      }

      var self = this;`;
export function patchaPaketJs(kod) {
  if (kod.includes(MARK)) return { kod, byten: [] };
  return { kod: bytExakt(kod, PJS_SOK, PJS_NY), byten: ['lådorna märks som förbeställning'] };
}

export const PATCHAR = {
  'snippets/ms-delivery-estimate.liquid': patchaLeverans,
  'assets/ms-cro.js': patchaJs,
  'snippets/cart-drawer.liquid': patchaLada,
  'sections/main-cart-footer.liquid': patchaKorg,
  'snippets/ms-paket.liquid': patchaPaketLiquid,
  'snippets/buy-buttons.liquid': patchaKnapp,
  'assets/ms-paket.js': patchaPaketJs,
};
export const SNIPPET = 'snippets/ms-forbestallning.liquid';

// ---- butiken ---------------------------------------------------------------------

async function huvudtema(k) {
  const th = await k.graphql('{ themes(first: 30) { nodes { id name role } } }');
  const t = th.themes.nodes.find((x) => x.role === 'MAIN');
  if (!t) throw new Error('inget publicerat tema');
  return t;
}
async function lasFiler(k, temaId, filer) {
  const d = await k.graphql('query($id: ID!, $f: [String!]) { theme(id: $id) { files(filenames: $f, first: 50) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }', { id: temaId, f: filer });
  return Object.fromEntries(d.theme.files.nodes.map((n) => [n.filename, n.body?.content ?? null]));
}
async function skrivMetafalt(k, varde) {
  const q = await k.graphql(`{ shop { id } }`);
  await k.graphql('mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { metafields { id } userErrors { field message } } }',
    { m: [{ ownerId: q.shop.id, namespace: METAFALT.namespace, key: METAFALT.key, type: 'json', value: JSON.stringify(varde) }] });
  const las = await k.graphql(`{ shop { metafield(namespace: "${METAFALT.namespace}", key: "${METAFALT.key}") { value } } }`);
  const tillbaka = JSON.parse(las.shop.metafield?.value ?? 'null');
  if (JSON.stringify(tillbaka) !== JSON.stringify(varde)) throw new Error(`metafältet lästes tillbaka som ${JSON.stringify(tillbaka)}`);
  return tillbaka;
}

async function kor({ skarpt, av, logg = console.log }) {
  const konfig = lasKonfig();
  const k = await skapaKlient(lasButik('matstrumpor'));
  if (av) {
    if (!skarpt) { logg('torrt: skulle sätta matstrumpor.forbestallning aktiv: false'); return; }
    const v = await skrivMetafalt(k, { ...konfig, aktiv: false });
    logg(`✓ förbeställningen AV — metafältet tillbakaläst: ${JSON.stringify(v)}`);
    return;
  }
  const texter = lasTexter();
  const fel = kontrolleraTexter(texter);
  if (fel.length) throw new Error(`texterna: ${fel.join('; ')}`);
  const tema = await huvudtema(k);
  logg(`tema: ${tema.name} (${tema.id})`);
  const filer = await lasFiler(k, tema.id, Object.keys(PATCHAR));
  const skriv = [{ filename: SNIPPET, body: { type: 'TEXT', value: byggSnippet(texter, konfig) } }];
  mkdirSync(ORIGINAL, { recursive: true });
  for (const [fil, patcha] of Object.entries(PATCHAR)) {
    if (filer[fil] == null) throw new Error(`${fil} finns inte i temat`);
    const { kod, byten } = patcha(filer[fil]);
    if (!byten.length) { logg(`  ${fil}: redan inlagd`); continue; }
    const orig = join(ORIGINAL, fil.replace(/\//g, '__'));
    if (!existsSync(orig)) writeFileSync(orig, filer[fil]);
    skriv.push({ filename: fil, body: { type: 'TEXT', value: kod } });
    logg(`  ${fil}: ${byten.join(', ')}`);
  }
  logg(`  ${SNIPPET}: skrivs (datum ${konfig.skickas_fran}, ${SPRAK.length} språk)`);
  for (const s of ['sv', 'en', 'ja']) logg(`    ${s}: ${texter[s].paket.rubrik_igen} | ${texter[s].paket.kort.replace('{datum}', datumText(konfig.skickas_fran, s))} | ${texter[s].paket.knapp}`);
  mkdirSync(join(HAR, 'output', 'forbestallning'), { recursive: true });
  for (const f of skriv) writeFileSync(join(HAR, 'output', 'forbestallning', f.filename.replace(/\//g, '__')), f.body.value);
  if (!skarpt) { logg('torrt: inget skrivet (filerna i matstrumpor/output/forbestallning/)'); return; }

  const v = await skrivMetafalt(k, { ...konfig, aktiv: true });
  logg(`✓ metafältet tillbakaläst: ${JSON.stringify(v)}`);
  const u = await k.graphql('mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }', { id: tema.id, files: skriv });
  const ufel = u.themeFilesUpsert?.userErrors ?? [];
  if (ufel.length) throw new Error(`themeFilesUpsert: ${ufel.map((f) => `${f.filename}: ${f.message}`).join('; ')}`);
  // Shopify kan svara med den gamla filen några sekunder efter skrivningen (mätt 2026-10-03 på
  // ms-cro.js: olika direkt, identisk en minut senare) — läs om upp till fem gånger.
  let kvar = skriv.map((f) => f.filename);
  for (let forsok = 1; kvar.length && forsok <= 5; forsok++) {
    if (forsok > 1) await new Promise((r) => setTimeout(r, 5000));
    const tillbaka = await lasFiler(k, tema.id, kvar);
    kvar = kvar.filter((fil) => tillbaka[fil] !== skriv.find((f) => f.filename === fil).body.value);
  }
  if (kvar.length) throw new Error(`lästes inte tillbaka likadant efter fem försök: ${kvar.join(', ')}`);
  logg(`✓ ${skriv.length} filer skrivna och tillbakalästa`);
}

// Kundvyn: produktsidan + korgen i Chromium, som kund i några länder.
export async function kundvy({ logg = console.log } = {}) {
  let pw;
  try { pw = await import('playwright'); } catch { pw = await import('/opt/node-tools/node_modules/playwright/index.mjs'); }
  const b = await pw.chromium.launch({ args: ['--ignore-certificate-errors'] });
  // Alla fjorton språk i sitt land, plus Norges B-sida på egen domän.
  const P = '/products/sushi-strumpor';
  const prov = [
    ['sv', `https://matstrumpor.se${P}?country=SE`],
    ['nb', `https://matstrumpor.com/nb${P}?country=NO`],
    ['nb', `https://matstrumpor.no${P}?country=NO`],
    ['da', `https://matstrumpor.com/da${P}?country=DK`],
    ['fi', `https://matstrumpor.com/fi${P}?country=FI`],
    ['de', `https://matstrumpor.com/de${P}?country=DE`],
    ['fr', `https://matstrumpor.com/fr${P}?country=FR`],
    ['nl', `https://matstrumpor.com/nl${P}?country=NL`],
    ['es', `https://matstrumpor.com/es${P}?country=ES`],
    ['it', `https://matstrumpor.com/it${P}?country=IT`],
    ['pl', `https://matstrumpor.com/pl${P}?country=PL`],
    ['pt-PT', `https://matstrumpor.com/pt-pt${P}?country=PT`],
    ['en', `https://matstrumpor.com${P}?country=US`],
    ['en', `https://matstrumpor.com${P}?country=GB`],
    ['ja', `https://matstrumpor.com/ja${P}?country=JP`],
    ['zh-TW', `https://matstrumpor.com/zh-tw${P}?country=TW`],
  ];
  const texter = lasTexter();
  let ok = 0;
  for (const [s, url] of prov) {
    const sida = await b.newPage({ ignoreHTTPSErrors: true });
    await sida.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sida.waitForTimeout(2500);
    const ruta = await sida.locator('.ms-fb-paket:visible').first().innerText({ timeout: 5000 }).catch(() => null);
    const knapp = await sida.locator('form[action*="/cart/add"] button[name="add"]:visible').first().innerText({ timeout: 5000 }).catch(() => null);
    const lev = await sida.locator('[data-ms-delivery-range]').first().innerText().catch(() => null);
    const lang = await sida.evaluate(() => document.documentElement.lang);
    // Rubriken visas i versaler (text-transform), så jämför utan skiftläge.
    const delar = texter[s].paket.rubrik_igen.split(/(?<=[.。])\s*/).map((x) => x.replace(/[.。]$/, '').trim().toLowerCase()).filter(Boolean);
    const ratt = Boolean(ruta && delar.every((d) => ruta.toLowerCase().includes(d)) && lang.toLowerCase() === s.toLowerCase() && knapp && knapp.trim() === texter[s].paket.knapp);
    logg(`${ratt ? '✓' : '✗'} ${s} ${new URL(url).host}${new URL(url).search} (lang=${lang}): ${ruta ? ruta.replace(/\s+/g, ' ') : 'INGEN RUTA'} | knapp: ${knapp?.trim()} | leverans: ${lev}`);
    if (ratt) ok++;
    await sida.screenshot({ path: join(HAR, 'output', 'forbestallning', `kundvy-${s}-${new URL(url).host}${new URL(url).searchParams.get('country')}.png`), fullPage: false });
    if (s === 'sv') {
      // Korgen: lägg en låda i vagnen med Shopifys eget API och läs korgsidan.
      const korg = await sida.evaluate(async () => {
        const p = await (await fetch('/products/sushi-strumpor.js')).json();
        await fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: p.variants[0].id, quantity: 1 }] }) });
        const html = await (await fetch('/cart?country=SE')).text();
        const m = /class="ms-forbestallning ms-forbestallning--korg"[^>]*>([^<]*)</.exec(html);
        return m ? m[1].trim() : null;
      });
      const kok = korg && korg.includes(texter.sv.korg.split('{datum}')[0].trim());
      logg(`${kok ? '✓' : '✗'} sv korgsidan: ${korg ?? 'INGEN RAD'}`);
      if (kok) ok++; else ok -= 100;
    }
    await sida.close();
  }
  await b.close();
  return ok === prov.length + 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  try {
    if (a.includes('--kundvy')) process.exit((await kundvy()) ? 0 : 1);
    await kor({ skarpt: a.includes('--skarpt'), av: a.includes('--av') });
  } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
}
