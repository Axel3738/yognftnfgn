// domantema.mjs — temat per domän (Axels order 2026-09-29).
//
//   node matstrumpor/marknader/domantema.mjs                     # torrt: vad som skulle ändras i MAIN-temat
//   node matstrumpor/marknader/domantema.mjs --tema <gid>        # mot ett annat tema (provkopian)
//   node matstrumpor/marknader/domantema.mjs --skarpt [--tema <gid>] [--fran <gid>]  # --fran: läs filerna ur ett annat tema
//   node matstrumpor/marknader/domantema.mjs --omdomen [--skarpt]  # bara de norska recensionerna (metafältet)
//
// Axel: "i Norge … AB-testa att köra det som att det är ett norskt varumärke … en sid-version där
// vi får det att kännas väldigt norskt, istället för att det just nu känns som att det är svenskt och
// internationellt". A = matstrumpor.se/nb (som förut), B = matstrumpor.no. Allt här villkoras på
// request.host i Liquid — matstrumpor.se och myshopify-adressen ritas exakt som förut.
//
// Två nivåer:
//   EGEN domän (.no .eu .com): loggan utan ".SE" och butiksnamnet "Matstrumpor" i titel, delning,
//     sidhuvud, sidfot och löptext. En sida på matstrumpor.com som säger "MATSTRUMPOR.SE" är fel adress.
//   NORGE (.no, B-sidan): dessutom inga land- och språkväljare, inget "Nå i hele verden"-collage,
//     recensionerna på norska ur produktens metafält matstrumpor.omdomen_nb (Judge.me-widgeten visar svenska på
//     norska sidor — den känner bara igen locale `no`, inte `nb`, factory/PROCESS.md), och e-postraden
//     i sidfotens meny + FAQ:ns "Send en e-post til …" blir en länk till kontaktsidan.
//
// ⛔ Aldrig påstå norskt ursprung (markedsføringsloven § 7 og § 8): bolaget — STONEBITE ECOM AB,
// org.nr, e-post — står kvar i sidfoten, på Om oss, Kontakt och i villkoren (ehandelsloven § 8).
// Recensionerna är de riktiga, troget översatta (sonnet + infödd granskare 2026-09-29), alla elva,
// även treorna och "Lang leveringstid".
//
// Två rättningar som inte är domänbundna körs i samma steg, för att läsas tillbaka på samma sätt:
// finskans etikett i presentkortets formulär, och momsraden ("Skatter ingår.") som är borta på alla
// värdar och språk sedan 2026-09-29 (Axel: "ta bort inkl. moms … Skriv inget").
//
// Patcharna är exakta (bytExakt: fel antal träffar = kastar) och idempotenta (markören MARK).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { bytExakt } from './temapatch.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const MARK = 'ms-domantema';
export const LOGGA_FIL = 'matstrumpor-logga-utan-se.png';
export const NORSK_VARD = 'matstrumpor.no';
export const EGNA_VARDAR = ['matstrumpor.no', 'matstrumpor.eu', 'matstrumpor.com'];
const OM_EGEN = EGNA_VARDAR.map((v) => `request.host contains '${v}'`).join(' or ');
const OM_NORSK = `request.host contains '${NORSK_VARD}'`;
// Alla länder utom Sverige heter "Matstrumpor" (Axel 2026-09-29 kväll: "vi borde bara ha Matstrumpor").
// 12 av 13 utlandskampanjer länkar till matstrumpor.se/<språk>, så värden räcker inte som villkor:
// kundens land avgör. Sverige (SE) ritas exakt som förut, med MATSTRUMPOR.SE.
const OM_UTLAND = `localization.country.iso_code != 'SE'`;
const OM_MATSTRUMPOR = `${OM_EGEN} or ${OM_UTLAND}`;
// Kortets descriptor är bankens text och ska stå exakt som den står (tvisthandboken).
const DESCRIPTOR = 'SP Matstrumpor.se';

// FAQ:n på produktsidan (nb, registrerad översättning) → kontaktsidan på .no.
export const FAQ_EPOST = 'Send en e-post til <a href="mailto:kundsupport@matstrumpor.se">kundsupport@matstrumpor.se</a>';
export const FAQ_KONTAKT = '<a href="/pages/contact">Send oss en melding</a>';

/** Byter butiksnamnet i färdig HTML/text — descriptorn skyddas. Samma logik som Liquid-kedjan i layouten. */
export function bytNamn(s) {
  return String(s).split(DESCRIPTOR).map((d) => d.split('Matstrumpor.se').join('Matstrumpor')).join(DESCRIPTOR);
}

// Presentkortets bild bär svensk text och svenska kronor (PRESENTKORT / 150 KR / GILTIG I 3 MÅNADER).
// På alla andra språk byts filnamnet mot presentkort-<locale>.png i Files (domantema/presentkort/).
export const PRESENTKORT_SV = 'BlackRedBowPremiumGiftCertificate_3.png';
// Adressen till den lokala bilden läses ur Files i Liquid (images['presentkort-<locale>.png'] | image_url),
// med filens EGEN ?v=. Shopifys CDN väljer filversion efter v: med originalets v och en extra parameter
// svarade den fortfarande med den gamla bilden (mätt 2026-09-29 efter fileUpdate). Originalets adress
// läses på samma sätt ur produkten (all_products['presentkort'].featured_image), så bytet följer med
// om Axel byter den svenska bilden.
export const PRESENTKORT_HANDLE = 'presentkort';

// v6 (2026-09-29 kväll): ms_egen gäller också alla länder utom Sverige. Namnet står kvar, för
// blocken v1–v5 nedan bär det och måste gå att känna igen i en live-fil.
const villkor = (v2, v6 = false) => `{%- comment -%} ${MARK}: ${v6 ? 'egen domän (.no/.eu/.com) och alla länder utom Sverige' : 'egen domän (.no/.eu/.com)'} och norska B-sidan (.no) — matstrumpor/marknader/domantema.mjs {%- endcomment -%}
    {%- liquid
      assign ms_no = false
      assign ms_egen = false${v2 ? '\n      assign ms_lokal = false' : ''}
      if ${OM_NORSK}
        assign ms_no = true
      endif
      if ${v6 ? OM_MATSTRUMPOR : OM_EGEN}
        assign ms_egen = true
      endif${v2 ? "\n      if request.locale.iso_code != 'sv'\n        assign ms_lokal = true\n      endif" : ''}
    -%}
`;

const SIDAN = `    {% sections 'header-group' %}

    <main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
      {{ content_for_layout }}
    </main>

    {% sections 'footer-group' %}
`;

const KEDJA = `ms_sida | replace: '${DESCRIPTOR}', 'MS-DESCRIPTOR-SKYDD' | replace: 'Matstrumpor.se', 'Matstrumpor' | replace: 'MS-DESCRIPTOR-SKYDD', '${DESCRIPTOR}'`;

// Version 1 (live 2026-09-29 förmiddag): bara egen domän fångas. Står kvar så att en live-fil kan uppgraderas.
const BLOCK_V1 = `    {%- if ms_egen -%}
      {%- capture ms_sida -%}
${SIDAN}      {%- endcapture -%}
      {%- if ms_no -%}
        {%- assign ms_sida = ms_sida | replace: '${FAQ_EPOST}', '${FAQ_KONTAKT}' -%}
      {%- endif -%}
      {{ ${KEDJA} }}
    {%- else -%}
${SIDAN}    {%- endif -%}
`;

// Version 2: dessutom presentkortets bild per språk (alla språk utom svenska, alla adresser).
// Svenska sidor på matstrumpor.se fångas fortfarande inte — de ritas exakt som förut.
const BLOCK_V2 = `    {%- if ms_egen or ms_lokal -%}
      {%- capture ms_sida -%}
${SIDAN}      {%- endcapture -%}
      {%- if ms_no -%}
        {%- assign ms_sida = ms_sida | replace: '${FAQ_EPOST}', '${FAQ_KONTAKT}' -%}
      {%- endif -%}
      {%- if ms_lokal -%}
        {%- assign ms_pk = 'presentkort-' | append: request.locale.iso_code | append: '.png' -%}
        {%- assign ms_sida = ms_sida | replace: '${PRESENTKORT_SV}', ms_pk -%}
      {%- endif -%}
      {%- if ms_egen -%}
        {{ ${KEDJA} }}
      {%- else -%}
        {{ ms_sida }}
      {%- endif -%}
    {%- else -%}
${SIDAN}    {%- endif -%}
`;

// Version 3: som v2, men bildadressen får ?pk=<version>& framför originalets ?v= (cachen, se ovan).
const blockV3 = (version = 2) => BLOCK_V2.replace(
  `{%- assign ms_pk = 'presentkort-' | append: request.locale.iso_code | append: '.png' -%}\n        {%- assign ms_sida = ms_sida | replace: '${PRESENTKORT_SV}', ms_pk -%}`,
  `{%- assign ms_pk = 'presentkort-' | append: request.locale.iso_code | append: '.png?pk=${version}&v=' -%}\n        {%- assign ms_sida = ms_sida | replace: '${PRESENTKORT_SV}?v=', ms_pk -%}`);

// Version 4: filens egen adress (se PRESENTKORT_HANDLE ovan). Gardering: bara när båda adresserna finns
// och bär ?v= — ett tomt sökord i replace hade skrivit in bilden mellan varje tecken på sidan.
const BLOCK_V4 = BLOCK_V2.replace(
  `{%- assign ms_pk = 'presentkort-' | append: request.locale.iso_code | append: '.png' -%}\n        {%- assign ms_sida = ms_sida | replace: '${PRESENTKORT_SV}', ms_pk -%}`,
  `{%- assign ms_pk_fil = 'presentkort-' | append: request.locale.iso_code | append: '.png' -%}\n        {%- assign ms_pk_ny = images[ms_pk_fil] | image_url | split: 'files/' | last -%}\n        {%- assign ms_pk_gammal = all_products['${PRESENTKORT_HANDLE}'].featured_image | image_url | split: 'files/' | last -%}\n        {%- if ms_pk_ny contains '?v=' and ms_pk_gammal contains '?v=' -%}\n          {%- assign ms_sida = ms_sida | replace: ms_pk_gammal, ms_pk_ny -%}\n        {%- endif -%}`);

// Version 5: på egen domän byts dessutom den gamla loggan ("MATSTRUMPOR.SE") mot LOGGA_FIL i hela den
// fångade sidan — sidfotens bild (settings.brand_image) och JSON-LD:ns Organization-logo (settings.logo)
// stod kvar när sidhuvudet fått sin egen patch (QA som kund 2026-09-29: 79 av 79 .eu-sidor, alla .com och
// .no). Filerna har samma mått (1920×1080, mätt), så sidfotens bredd/höjd-attribut stämmer. Samma
// gardering som presentkortet: bara när adresserna bär ?v= (ett tomt sökord hade förstört sidan).
const LOGGA_I_SIDAN = `        {%- assign ms_logga_ny = images['${LOGGA_FIL}'] | image_url | split: 'files/' | last -%}
        {%- if ms_logga_ny contains '?v=' -%}
          {%- assign ms_logga_fot = settings.brand_image | image_url | split: 'files/' | last -%}
          {%- assign ms_logga_lo = settings.logo | image_url | split: 'files/' | last -%}
          {%- if ms_logga_fot contains '?v=' -%}{%- assign ms_sida = ms_sida | replace: ms_logga_fot, ms_logga_ny -%}{%- endif -%}
          {%- if ms_logga_lo contains '?v=' and ms_logga_lo != ms_logga_fot -%}{%- assign ms_sida = ms_sida | replace: ms_logga_lo, ms_logga_ny -%}{%- endif -%}
        {%- endif -%}
`;
const V4_EGEN = `      {%- if ms_egen -%}\n        {{ ${KEDJA} }}`;
const BLOCK_V5 = BLOCK_V4.replace(V4_EGEN, `      {%- if ms_egen -%}\n${LOGGA_I_SIDAN}        {{ ${KEDJA} }}`);
if (BLOCK_V5 === BLOCK_V4) throw new Error('domantema: version 5 hittade inte egen-domän-grenen i version 4');

const VILLKOR_V5 = villkor(true);
const VILLKOR_V6 = villkor(true, true);

export function patchaLayout(kod) {
  if (kod.includes(BLOCK_V5) && kod.includes(VILLKOR_V6)) return { kod, byten: [], hoppade: ['layout: redan patchad (v6)'] };
  let byten;
  const aldreV3 = /\?pk=(\d+)&v='/.exec(kod);
  if (kod.includes(BLOCK_V5)) byten = [];
  else if (kod.includes(BLOCK_V4)) {
    kod = bytExakt(kod, BLOCK_V4, BLOCK_V5, 1);
    byten = ['uppgradering_v5'];
  } else if (aldreV3) {
    kod = bytExakt(kod, blockV3(Number(aldreV3[1])), BLOCK_V5, 1);
    byten = ['uppgradering_v5'];
  } else if (kod.includes(BLOCK_V2)) {
    kod = bytExakt(kod, BLOCK_V2, BLOCK_V5, 1);
    byten = ['uppgradering_v5'];
  } else if (kod.includes(MARK)) {
    kod = bytExakt(kod, `    ${villkor(false)}    <title>\n`, `    ${VILLKOR_V5}    <title>\n`, 1);
    kod = bytExakt(kod, BLOCK_V1, BLOCK_V5, 1);
    byten = ['uppgradering_v5'];
  } else {
    kod = bytExakt(kod, '    <title>\n', `    ${VILLKOR_V5}    <title>\n`, 1);
    kod = bytExakt(kod, '      {{ page_title }}\n',
      "      {% if ms_egen %}{{ page_title | replace: 'Matstrumpor.se', 'Matstrumpor' }}{% else %}{{ page_title }}{% endif %}\n", 1);
    kod = bytExakt(kod, '      {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}\n',
      "      {%- if ms_egen -%}{%- unless page_title contains 'Matstrumpor' %} &ndash; Matstrumpor{% endunless -%}{%- else -%}{%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}{%- endif -%}\n", 1);
    kod = bytExakt(kod, SIDAN, BLOCK_V5, 1);
    byten = ['villkor', 'titel', 'titelsuffix', 'sidan'];
  }
  // v6: villkoret gäller också alla länder utom Sverige (loggan, namnet och titeln följer med).
  if (!kod.includes(VILLKOR_V6)) {
    kod = bytExakt(kod, VILLKOR_V5, VILLKOR_V6, 1);
    byten.push('utland_v6');
  }
  return { kod, byten, hoppade: [] };
}

/** Bara för testerna: version 5 av layoutpatchen (live 2026-09-29 eftermiddag, bara egen domän). */
export function patchaLayoutV5(kod) {
  return patchaLayout(kod).kod.replace(VILLKOR_V6, VILLKOR_V5);
}

/** Bara för testerna: version 4 av layoutpatchen (live 2026-09-29 ~12:00). */
export function patchaLayoutV4(kod) {
  return patchaLayoutV5(kod).replace(BLOCK_V5, BLOCK_V4);
}

// Dawns egen finska locale-fil bär e-postfältets text på NAMNfältet i presentkortets mottagarformulär
// ("Vastaanottajan sähköpostiosoite (valinnainen)" — QA 2026-09-29 på /fi/products/presentkort).
// Inte domänbundet, men ligger här för att köras med samma steg och läsas tillbaka.
export const FI_FEL = '"name_label": "Vastaanottajan sähköpostiosoite (valinnainen)",';
export const FI_RATT = '"name_label": "Vastaanottajan nimi (valinnainen)",';
export function patchaFiLocale(kod) {
  if (kod.includes(FI_RATT)) return { kod, byten: [], hoppade: ['fi.json: redan rätt'] };
  return { kod: bytExakt(kod, FI_FEL, FI_RATT, 1), byten: ['mottagarens_namn'], hoppade: [] };
}

// Momsraden bort (Axels beslut 2026-09-29: "ta bort inkl. moms … Skriv inget"). Dawn skriver
// "Skatter ingår." under priset och "Skatter ingår. Rabatter och fraktkostnad beräknas i kassan."
// i varukorgen och sidolådan, på varje språk ("Taxes included.", "Inkl. Steuern." …), eftersom
// butikens priser är satta inklusive skatt. Axel sköter moms och tull själv, så sajten säger inget
// om det, och ingen ersättningstext skrivs. Korgens hela rad försvinner, också meningen om rabatter
// och frakt: den sitter ihop med momsen i samma översättning, och frakten är fri till alla länder.
// Elementet står kvar tomt så att avståndet till kassaknappen blir som förut. Butikens
// skatteinställning rörs aldrig. Inte domänbundet: gäller alla värdar och alla språk.
export const MOMS_MARK = `${MARK}: ingen momsrad`;
const MOMS_KOMMENTAR = `{%- comment -%} ${MOMS_MARK} (Axel 2026-09-29, matstrumpor/marknader/domantema.mjs) {%- endcomment -%}`;
export const PRODUKT_MOMS_VILLKOR = '{%- if cart.taxes_included or cart.duties_included or shop.shipping_policy.body != blank -%}';
const PRODUKT_MOMS = /\{%- if cart\.duties_included and cart\.taxes_included -%\}\s*\{\{ 'products\.product\.duties_and_taxes_included' \| t \}\}\s*\{%- elsif cart\.taxes_included -%\}\s*\{\{ 'products\.product\.taxes_included' \| t \}\}\s*\{%- elsif cart\.duties_included -%\}\s*\{\{ 'products\.product\.duties_included' \| t \}\}\s*\{%- endif -%\}/g;
const KORG_MOMS = /(<small class="tax-note caption-large rte">)[\s\S]*?(\n([ \t]*)<\/small>)/g;

function bytMonster(kod, re, ersatt, antal) {
  const traffar = [...kod.matchAll(re)].length;
  if (traffar !== antal) throw new Error(`${re.source.slice(0, 40)}… hittades ${traffar} gånger, väntade ${antal}`);
  return kod.replace(re, ersatt);
}

/** Produktsidan och "utvald produkt": momsraden under priset. Fraktpolicyns länk ritas som förut. */
export function patchaProduktMoms(kod) {
  if (kod.includes(MOMS_MARK)) return { kod, byten: [], hoppade: ['momsraden: redan borta'] };
  kod = bytExakt(kod, PRODUKT_MOMS_VILLKOR, '{%- if shop.shipping_policy.body != blank -%}', 1);
  kod = bytMonster(kod, PRODUKT_MOMS, MOMS_KOMMENTAR, 1);
  return { kod, byten: ['momsraden_under_priset'], hoppade: [] };
}

/** Varukorgen, sidolådan och snabbordern: raden under totalsumman. */
export function patchaKorgMoms(kod) {
  if (kod.includes(MOMS_MARK)) return { kod, byten: [], hoppade: ['momsraden: redan borta'] };
  kod = bytMonster(kod, KORG_MOMS, (_, start, slut, indrag) => `${start}\n${indrag}  ${MOMS_KOMMENTAR}${slut}`, 1);
  return { kod, byten: ['momsraden_i_varukorgen'], hoppade: [] };
}

/** Bara för testerna: version 2 av layoutpatchen, som den gick live förmiddagen 2026-09-29. */
export function patchaLayoutV2(kod) {
  return bytExakt(patchaLayoutV1(kod), BLOCK_V1, BLOCK_V2, 1).replace(`    ${villkor(false)}    <title>\n`, `    ${villkor(true)}    <title>\n`);
}

/** Bara för testerna: version 3 av layoutpatchen (live 2026-09-29 ~11:00). */
export function patchaLayoutV3(kod) {
  return patchaLayoutV2(kod).replace(BLOCK_V2, blockV3(2));
}

/** Bara för testerna: version 1 av layoutpatchen, som den gick live. */
export function patchaLayoutV1(kod) {
  kod = bytExakt(kod, '    <title>\n', `    ${villkor(false)}    <title>\n`, 1);
  kod = bytExakt(kod, '      {{ page_title }}\n',
    "      {% if ms_egen %}{{ page_title | replace: 'Matstrumpor.se', 'Matstrumpor' }}{% else %}{{ page_title }}{% endif %}\n", 1);
  kod = bytExakt(kod, '      {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}\n',
    "      {%- if ms_egen -%}{%- unless page_title contains 'Matstrumpor' %} &ndash; Matstrumpor{% endunless -%}{%- else -%}{%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}{%- endif -%}\n", 1);
  return bytExakt(kod, SIDAN, BLOCK_V1, 1);
}

// v1 (2026-09-29 eftermiddag): bara egen domän. v2 (samma kväll): också alla länder utom Sverige.
const META_V1 = `  # ${MARK}: egen domän ⇒ "Matstrumpor", aldrig "Matstrumpor.se" (matstrumpor/marknader/domantema.mjs)\n  assign ms_namn = shop.name\n  if ${OM_EGEN}\n`;
const META_V2 = `  # ${MARK}: egen domän och alla länder utom Sverige ⇒ "Matstrumpor", aldrig "Matstrumpor.se" (matstrumpor/marknader/domantema.mjs)\n  assign ms_namn = shop.name\n  if ${OM_MATSTRUMPOR}\n`;

export function patchaMetaTags(kod) {
  if (kod.includes(META_V2)) return { kod, byten: [], hoppade: ['meta-tags: redan patchad (v2)'] };
  if (kod.includes(META_V1)) return { kod: bytExakt(kod, META_V1, META_V2, 1), byten: ['utland_v2'], hoppade: [] };
  if (kod.includes(MARK)) throw new Error('meta-tags: patchen finns men i en okänd version — rör inget');
  // Byter bara när värdet ÄR butiksnamnet (startsidan och sidor utan egen beskrivning). Ett
  // replace på Shopifys färdigkodade text + escape dubbelkodar den ("don&amp;#39;t", mätt på
  // matstrumpor.com 2026-09-29) — därför rörs ingen annan text, och .se får exakt samma rader.
  kod = bytExakt(kod, '{%- liquid\n', `{%- liquid\n${META_V2}    assign ms_namn = 'Matstrumpor'\n  endif\n`, 1);
  kod = bytExakt(kod, '  assign og_description = page_description | default: shop.description | default: shop.name\n',
    '  assign og_description = page_description | default: shop.description | default: shop.name\n  if ms_namn != shop.name\n    if og_title == shop.name\n      assign og_title = ms_namn\n    endif\n    if og_description == shop.name\n      assign og_description = ms_namn\n    endif\n  endif\n', 1);
  kod = bytExakt(kod, '<meta property="og:site_name" content="{{ shop.name }}">', '<meta property="og:site_name" content="{{ ms_namn }}">', 1);
  return { kod, byten: ['namn', 'og_title_og_description', 'og_site_name'], hoppade: [] };
}

// v1 (2026-09-29 eftermiddag): bara egen domän. v2 (samma kväll): också alla länder utom Sverige.
const HEADER_V1 = `{%- comment -%} ${MARK}: loggan utan ".SE" på egen domän (.no/.eu/.com), bilden ligger i Files som ${LOGGA_FIL} {%- endcomment -%}
{%- liquid
  assign ms_logga = settings.logo
  assign ms_logga_alt = settings.logo.alt | default: shop.name
  if ${OM_EGEN}
`;
const HEADER_V2 = `{%- comment -%} ${MARK}: loggan utan ".SE" på egen domän (.no/.eu/.com) och i alla länder utom Sverige, bilden ligger i Files som ${LOGGA_FIL} {%- endcomment -%}
{%- liquid
  assign ms_logga = settings.logo
  assign ms_logga_alt = settings.logo.alt | default: shop.name
  if ${OM_MATSTRUMPOR}
`;

export function patchaHeader(kod) {
  if (kod.includes(HEADER_V2)) return { kod, byten: [], hoppade: ['header: redan patchad (v2)'] };
  if (kod.includes(HEADER_V1)) return { kod: bytExakt(kod, HEADER_V1, HEADER_V2, 1), byten: ['utland_v2'], hoppade: [] };
  if (kod.includes(MARK)) throw new Error('header: patchen finns men i en okänd version — rör inget');
  const topp = `${HEADER_V2}    if images['${LOGGA_FIL}'] != blank
      assign ms_logga = images['${LOGGA_FIL}']
      assign ms_logga_alt = 'Matstrumpor'
    endif
  endif
-%}
`;
  kod = topp + kod;
  kod = bytExakt(kod, '{%- if settings.logo != blank -%}', '{%- if ms_logga != blank -%}', 2);
  kod = bytExakt(kod, '{%- assign logo_alt = settings.logo.alt | default: shop.name | escape -%}', '{%- assign logo_alt = ms_logga_alt | escape -%}', 2);
  kod = bytExakt(kod, 'divided_by: settings.logo.aspect_ratio', 'divided_by: ms_logga.aspect_ratio', 2);
  kod = bytExakt(kod, '              settings.logo\n              | image_url: width: 600', '              ms_logga\n              | image_url: width: 600', 2);
  return { kod, byten: ['logga_villkor', 'logga_if', 'logga_alt', 'logga_hojd', 'logga_bild'], hoppade: [] };
}

// Sidfotens betalikoner i Japan och Taiwan (granskningen 2026-09-30, G-D06/G-F05/G-C-JA-10):
// Shopify ritar butikens alla betalsätt i alla länder, så en japansk kund såg Klarna, Bancontact,
// Bizum, BLIK, MB WAY, MobilePay, iDEAL|Wero, Twint och Maestro, som inte finns i hens kassa (Klarna
// mätt borta i JP/TW-kassan). På ja och zh-TW visas bara korten, PayPal, Apple Pay, Google Pay och
// Shop Pay. Namnen är Shopifys (`pi-<typ>` i ikonen, mätt på .com/ja samma dag).
export const BETAL_MARK = `${MARK}: betalikoner Japan och Taiwan`;
export const BETAL_ASIEN = ['visa', 'master', 'american_express', 'paypal', 'apple_pay', 'google_pay', 'shopify_pay'];
const BETAL_SLINGA = '{%- for type in shop.enabled_payment_types -%}';

export function patchaFooter(kod) {
  const byten = [];
  const hoppade = [];
  if (kod.includes(`${MARK}: e-postraden`)) hoppade.push('footer: e-postraden redan patchad');
  else {
    const sok = '{%- for link in block.settings.menu.links -%}\n';
    kod = bytExakt(kod, sok, `${sok}                          {%- comment -%} ${MARK}: e-postraden i menyn visas inte på .no — adressen står i Selskapet-blocket och på Kontakt {%- endcomment -%}\n                          {%- if link.title contains '@' and ${OM_NORSK} -%}{%- continue -%}{%- endif -%}\n`, 1);
    byten.push('epostraden');
  }
  if (kod.includes(BETAL_MARK)) hoppade.push('footer: betalikonerna redan patchade');
  else if (!kod.includes(BETAL_SLINGA)) hoppade.push('footer: ingen betalikonslinga i filen');
  else {
    const lista = BETAL_ASIEN.join(',');
    kod = bytExakt(
      kod,
      BETAL_SLINGA,
      `${BETAL_SLINGA}{%- comment -%} ${BETAL_MARK} (matstrumpor/marknader/domantema.mjs) {%- endcomment -%}{%- if request.locale.iso_code == 'ja' or request.locale.iso_code == 'zh-TW' -%}{%- assign ms_betal_asien = '${lista}' | split: ',' -%}{%- unless ms_betal_asien contains type -%}{%- continue -%}{%- endunless -%}{%- endif -%}`,
      1,
    );
    byten.push('betalikoner_asien');
  }
  return { kod, byten, hoppade };
}

// Spanskan i Dawns locale-fil är latinamerikansk ("Agregar al carrito"). Kampanjen riktar sig till
// Spanien, där det heter "Añadir" (granskningen 2026-09-30, G-C-es-08). Bara verbet byts, i de
// kundsynliga raderna; allt annat i filen står som Dawn skrev det.
export const ES_BYTEN = [
  ['"add_to_cart": "Agregar al carrito"', '"add_to_cart": "Añadir al carrito"'],
  ['"cart_quantity_error_html": "Solo puedes agregar {{ quantity }} de este artículo a tu carrito."', '"cart_quantity_error_html": "Solo puedes añadir {{ quantity }} de este artículo a tu carrito."'],
  ['"step_error": "Solo puedes agregar este artículo en incrementos de {{ step }}"', '"step_error": "Solo puedes añadir este artículo en incrementos de {{ step }}"'],
  ['"add_new": "Agregar una nueva dirección"', '"add_new": "Añadir una nueva dirección"'],
  ['"add": "Agregar dirección"', '"add": "Añadir dirección"'],
  ['"add_to_apple_wallet": "Agregar a Apple Wallet"', '"add_to_apple_wallet": "Añadir a Apple Wallet"'],
];
export function patchaEsLocale(kod) {
  const byten = [];
  const hoppade = [];
  for (const [fel, ratt] of ES_BYTEN) {
    const nyckel = fel.slice(1, fel.indexOf('"', 1));
    if (kod.includes(ratt)) { hoppade.push(`es.json ${nyckel}: redan rätt`); continue; }
    kod = bytExakt(kod, fel, ratt, 1);
    byten.push(`es_${nyckel}`);
  }
  return { kod, byten, hoppade };
}

// Inga CSS-kommentarer i blocket: de syns i sidans källkod (sajtgranskningen 2026-10-01, S-029).
// Varför: inga land- eller språkväljare på .no; Judge.me-rutan döljs (de norska recensionerna ritas
// av ms-omdomen-no); "Nå i hele verden" (.ms-varlden) säger internationellt, och .no ska inte göra det.
export const CSS_NORSK = `
{%- comment -%} ${MARK}: B-sidan i Norge (matstrumpor.no) — matstrumpor/marknader/domantema.mjs {%- endcomment -%}
{%- if ${OM_NORSK} -%}
<style>
  localization-form, .desktop-localization-wrapper, .menu-drawer__localization, .footer__localization { display: none !important; }
  .jdgm-widget, [id$="__judgeme_widget"] { display: none !important; }
  .ms-varlden { display: none !important; }
  .ms-omd-badge { display: inline-flex; align-items: center; gap: 8px; margin: 2px 0 10px; color: inherit; text-decoration: none; font-size: 1.4rem; }
  .ms-omd-badge:hover .ms-omd-badge__txt { text-decoration: underline; }
  .ms-omd-stj { letter-spacing: 2px; font-size: 1.7rem; line-height: 1; background: linear-gradient(90deg, #f6a623 var(--ms-fyll), #d9d9d9 var(--ms-fyll)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .ms-omd__snitt { display: flex; justify-content: center; align-items: center; gap: 8px; margin: 8px 0 0; }
  .ms-omd .ms-omd-tom { opacity: .22; display: inline-flex; }
</style>
{%- endif -%}
`;

// Appen Ultimate Trust Badges ritar en egen rad under köpknappen: "Betala säkert med Klarna." och
// logorna Mastercard, Visa, Apple Pay, Klarna, Google Pay och Swish. Texten är appens egen och finns
// bara på svenska, och Swish finns bara i Sverige. Mätt 2026-09-30 som kund: raden ritades på svenska
// sidor OCH på de engelska (.com utan språkmapp: USA, UK, Australien, Kanada, Nya Zeeland), men inte
// under /nb /da /fi /de … (appen känner bara igen sökvägar utan språkmapp). Den döljs därför på
// alla språk utom svenska, och där står trust-radens "Secure payment" kvar. Svenska sidor ritas som förut.
export const UTB_MARK = `${MARK}: trust-badge-appen bara på svenska`;
export const CSS_UTB = `
{%- comment -%} ${UTB_MARK} — matstrumpor/marknader/domantema.mjs {%- endcomment -%}
{%- unless request.locale.iso_code == 'sv' -%}
<style>#ultimateTrustBadgeswidgetDiv { display: none !important; }</style>
{%- endunless -%}
`;
export function patchaMsHead(kod) {
  const byten = [];
  let ut = kod;
  if (!ut.includes(MARK)) { ut = ut.replace(/\s*$/, '\n') + CSS_NORSK; byten.push('css_norsk'); }
  if (!ut.includes(UTB_MARK)) { ut = ut.replace(/\s*$/, '\n') + CSS_UTB; byten.push('trust_badges_bara_svenska'); }
  return byten.length ? { kod: ut, byten, hoppade: [] } : { kod, byten: [], hoppade: ['ms-head: redan patchad'] };
}

// Recensionerna på norska — en egen sektion, ritas BARA på matstrumpor.no.
export const SEKTION_OMDOMEN = `{%- comment -%}
  ${MARK}: recensionerna på norska för B-sidan (matstrumpor.no). Judge.me visar dem på svenska på
  norska sidor, så där döljs widgeten (ms-head) och samma riktiga recensioner ritas här, troget
  översatta, ur produktens metafält matstrumpor.omdomen_nb (matstrumpor/marknader/domantema.mjs --omdomen).
  På alla andra adresser ritas ingenting.
{%- endcomment -%}
{%- if ${OM_NORSK} -%}
  {%- assign d = product.metafields.matstrumpor.omdomen_nb.value -%}
  {%- if d and d.antal > 0 -%}
    <div class="ms-scope ms-section ms-omd" id="ms-omdomen">
      <div class="ms-wrap">
        <div class="ms-center" style="margin-bottom: 22px;">
          <h2 class="ms-h2">Hva kundene sier</h2>
          <p class="ms-omd__snitt"><span class="ms-omd-stj" style="--ms-fyll: {{ d.snitt | times: 20 }}%" aria-hidden="true">★★★★★</span> {{ d.snitt_text }} av 5 · {{ d.antal }} anmeldelser</p>
        </div>
        <div class="ms-reviews__grid">
          {%- for r in d.omdomen -%}
            <article class="ms-review">
              <div class="ms-review__stars" role="img" aria-label="{{ r.stjerner }} av 5 stjerner">
                {%- for i in (1..5) -%}
                  {%- if i <= r.stjerner -%}{% render 'ms-icon', name: 'star', class: 'ms-i--fill' %}{%- else -%}<span class="ms-omd-tom">{% render 'ms-icon', name: 'star', class: 'ms-i--fill' %}</span>{%- endif -%}
                {%- endfor -%}
              </div>
              <p class="ms-review__body">{{ r.tekst | escape }}</p>
              <div class="ms-review__who">
                <span>{{ r.navn | escape }}</span>
                {%- if r.verifisert -%}
                  <span class="ms-review__verified">{% render 'ms-icon', name: 'check-circle' %} Verifisert kjøp</span>
                {%- endif -%}
              </div>
            </article>
          {%- endfor -%}
        </div>
      </div>
    </div>
  {%- endif -%}
{%- endif -%}

{% schema %}
{
  "name": "Omdömen på norska (.no)",
  "tag": "section",
  "settings": [
    { "type": "paragraph", "content": "Visas bara på matstrumpor.no. Texterna ligger i produktens metafält matstrumpor.omdomen_nb (matstrumpor/marknader/domantema.mjs --omdomen)." }
  ]
}
{% endschema %}
`;

export const SNIPPET_BADGE = `{%- comment -%} ${MARK}: stjärnor + antal under produktnamnet på matstrumpor.no (Judge.me-märket är svenskt där) {%- endcomment -%}
{%- if ${OM_NORSK} -%}
  {%- assign d = product.metafields.matstrumpor.omdomen_nb.value -%}
  {%- if d and d.antal > 0 -%}
    <a href="#ms-omdomen" class="ms-omd-badge" aria-label="{{ d.snitt_text }} av 5 stjerner, {{ d.antal }} anmeldelser">
      <span class="ms-omd-stj" style="--ms-fyll: {{ d.snitt | times: 20 }}%" aria-hidden="true">★★★★★</span>
      <span class="ms-omd-badge__txt">{{ d.antal }} anmeldelser</span>
    </a>
  {%- endif -%}
{%- endif -%}
`;

/** product.json: sektionen efter Judge.me-widgeten, märket efter Judge.me-märket. Tar och ger JSON-text (med Shopifys kommentarshuvud). */
export function patchaProduktMall(text) {
  const m = /^(\s*\/\*[\s\S]*?\*\/\s*)?([\s\S]*)$/.exec(text);
  const huvud = m[1] ?? '';
  const d = JSON.parse(m[2]);
  const byten = [], hoppade = [];
  if (d.sections.ms_omdomen_no) hoppade.push('sektionen finns');
  else {
    d.sections.ms_omdomen_no = { type: 'ms-omdomen-no', settings: {} };
    const ix = d.order.indexOf('judgeme_widget');
    if (ix === -1) throw new Error('product.json: judgeme_widget saknas i order — läs mallen innan du patchar');
    d.order.splice(ix + 1, 0, 'ms_omdomen_no');
    byten.push('sektionen');
  }
  const main = d.sections.main;
  if (!main?.blocks) throw new Error('product.json: main saknar block');
  if (main.blocks.ms_stjarnor_no) hoppade.push('märket finns');
  else {
    main.blocks.ms_stjarnor_no = { type: 'custom_liquid', settings: { custom_liquid: "{%- render 'ms-omdomen-badge', product: product -%}" } };
    const ix = main.block_order.indexOf('judgeme_stjarnor');
    if (ix === -1) throw new Error('product.json: judgeme_stjarnor saknas i block_order');
    main.block_order.splice(ix + 1, 0, 'ms_stjarnor_no');
    byten.push('märket');
  }
  return { text: huvud + JSON.stringify(d, null, 2) + '\n', byten, hoppade };
}

/** Recensionerna → metafältets JSON. `rader` = [{ stjarnor, namn, nb, verifierad }] i Judge.me:s ordning. */
export function omdomenJson(rader, { kalla = null } = {}) {
  const antal = rader.length;
  const snitt = antal ? rader.reduce((s, r) => s + r.stjarnor, 0) / antal : 0;
  return {
    antal,
    snitt: Math.round(snitt * 100) / 100,
    snitt_text: snitt.toFixed(1).replace('.', ','),
    omdomen: rader.map((r) => ({ stjerner: r.stjarnor, navn: r.namn, tekst: r.nb, verifisert: !!r.verifierad })),
    ...(kalla ? { kalla } : {}),
  };
}

// ---- Fraktrutan följer kundens land ----------------------------------------------------------------
// Axel 2026-09-30: "istället för att vi har den här widgeten … att den ändras utifrån vilket land kunden
// sitter i så att det står Free shipping to Norway, Japan etc … magnetchess har gjort detta väldigt
// snyggt". Förut stod "Fri frakt i Sverige" på svenska och bara "Free shipping"/"Kostenloser Versand"
// (utan land) på de andra språken. Nu: kundens flagga i stället för lastbilen, och texten med landet.
// Landnamnet är Shopifys eget på kundens språk (localization.country.name, mätt 2026-09-30: "Schweiz"
// på de, "Szwajcaria" på pl, "Svizzera" på it, "Sveitsi" på fi; nb får svenska namn, eftersom Shopify
// saknar bokmål, men "Norge" stavas likadant). Flaggan är Shopifys egen (country | image_url).
// Grammatiken står per språk: hemlandet har en fast fras, och artikel/preposition står per land där
// språket kräver det (fr en/au/aux/à, de "in die", it "negli/nel/nei/a", pt "para a/o/os", es "al/a los",
// nl "naar de/het", en "the"). Där landnamnet böjs (fi illativ, pl genitiv) står en neutral form.
// Ett land vi inte säljer till får frasen utan land och ingen flagga. Texten "Fri frakt i Sverige" står
// kvar ordagrant för svenska kunder. Snippeten skrivs om varje körning (NYA_FILER), så ett nytt land i
// konfig.json följer med av sig självt.
export const FRAKT_MARK = `${MARK}: fraktrutan följer kundens land`;
const perLand = (grupper, fore, efter = '') => Object.fromEntries(Object.entries(grupper).flatMap(([art, koder]) => koder.map((k) => [k, [`${fore}${art}`, efter]])));
// Per språk: generisk = land vi inte säljer till; hel = hela frasen per land; namn = [före, efter] runt
// Shopifys landnamn, per land eller som standard ('*'). Saknas både hel, namn[land] och '*' blir det generiskt.
export const FRAKT_SPRAK = {
  sv: { generisk: 'Fri frakt', hel: { SE: 'Fri frakt i Sverige' }, namn: { '*': ['Fri frakt till ', ''] } },
  nb: { generisk: 'Fri frakt', hel: { NO: 'Fri frakt til Norge' }, namn: { '*': ['Fri frakt til ', ''] } },
  da: { generisk: 'Fri fragt', hel: { DK: 'Fri fragt til Danmark' }, namn: { '*': ['Fri fragt til ', ''] } },
  fi: { generisk: 'Ilmainen toimitus', hel: { FI: 'Ilmainen toimitus Suomeen' }, namn: { '*': ['Ilmainen toimitus maahan ', ''] } },
  en: { generisk: 'Free shipping', namn: { ...perLand({ 'the ': ['US', 'GB', 'NL'] }, 'Free shipping to '), '*': ['Free shipping to ', ''] } },
  de: {
    generisk: 'Kostenloser Versand',
    hel: { CH: 'Kostenloser Versand in die Schweiz', NL: 'Kostenloser Versand in die Niederlande', SK: 'Kostenloser Versand in die Slowakei', US: 'Kostenloser Versand in die USA', GB: 'Kostenloser Versand ins Vereinigte Königreich' },
    namn: { '*': ['Kostenloser Versand nach ', ''] },
  },
  fr: {
    generisk: 'Livraison gratuite',
    namn: perLand({
      'en ': ['FR', 'BE', 'CH', 'DE', 'AT', 'ES', 'IT', 'PL', 'SE', 'NO', 'FI', 'IE', 'GR', 'HR', 'SI', 'SK', 'HU', 'RO', 'BG', 'EE', 'LV', 'LT', 'IS', 'CZ', 'AU', 'NZ'],
      'au ': ['LU', 'PT', 'DK', 'GB', 'CA', 'LI', 'JP'],
      'aux ': ['NL', 'US'],
      'à ': ['MT', 'CY', 'TW'],
    }, 'Livraison gratuite '),
  },
  nl: { generisk: 'Gratis verzending', namn: { ...perLand({ 'de ': ['US'], 'het ': ['GB'] }, 'Gratis verzending naar '), '*': ['Gratis verzending naar ', ''] } },
  es: { generisk: 'Envío gratis', hel: { GB: 'Envío gratis al Reino Unido', NL: 'Envío gratis a los Países Bajos' }, namn: { '*': ['Envío gratis a ', ''] } },
  it: {
    generisk: 'Spedizione gratuita',
    hel: { US: 'Spedizione gratuita negli Stati Uniti', GB: 'Spedizione gratuita nel Regno Unito', NL: 'Spedizione gratuita nei Paesi Bassi' },
    namn: { ...perLand({ 'a ': ['MT', 'CY'] }, 'Spedizione gratuita '), '*': ['Spedizione gratuita in ', ''] },
  },
  pl: { generisk: 'Darmowa dostawa', hel: { PL: 'Darmowa dostawa do Polski' }, namn: { '*': ['Darmowa dostawa: ', ''] } },
  'pt-PT': {
    generisk: 'Envio grátis',
    hel: { PT: 'Envio grátis para Portugal', US: 'Envio grátis para os Estados Unidos', GB: 'Envio grátis para o Reino Unido', NL: 'Envio grátis para os Países Baixos' },
    namn: perLand({
      'a ': ['FR', 'ES', 'IT', 'SE', 'NO', 'FI', 'IE', 'GR', 'HR', 'SI', 'SK', 'HU', 'RO', 'BG', 'EE', 'LV', 'LT', 'IS', 'CZ', 'AT', 'PL', 'DK', 'AU', 'NZ', 'DE', 'CH', 'BE'],
      'o ': ['LU', 'LI', 'CA', 'JP'],
      '': ['MT', 'CY', 'TW'],
    }, 'Envio grátis para '),
  },
  ja: { generisk: '送料無料', hel: { JP: '日本全国送料無料' }, namn: { '*': ['', 'への送料無料'] } },
  'zh-TW': { generisk: '免運費', hel: { TW: '全台免運費' }, namn: { '*': ['免運費寄送至', ''] } },
};

/** Alla länder vi säljer till: Sverige + varje marknad i konfig.json. */
export function saljlander(konfig) {
  return [...new Set([konfig.primar?.land ?? 'SE', ...konfig.marknader.flatMap((m) => m.lander)])];
}

/** Ren: fraktraden per land i JS — samma regler som Liquid-snippeten. För tester och granskning. */
export function fraktText(locale, kod, namn, lander, sprak = FRAKT_SPRAK) {
  const d = sprak[locale];
  if (!d) return null;
  if (!kod || !lander.includes(kod)) return d.generisk;
  if (d.hel?.[kod]) return d.hel[kod];
  const n = d.namn?.[kod] ?? d.namn?.['*'];
  return n ? `${n[0]}${namn}${n[1]}` : d.generisk;
}

/** Ren: snippeten ms-frakt-land.liquid. `del: 'flagga'` ger kundens flagga (bara säljländer), annars
 *  fraktraden. Ett språk utanför tabellen ger ingenting, och då står trust-radens egen text kvar. */
export function fraktLandSnippet(lander, sprak = FRAKT_SPRAK) {
  const q = (s) => `'${String(s).replace(/'/g, '’')}'`;
  const rad = (d, kod) => {
    if (d.hel?.[kod]) return `echo ${q(d.hel[kod])}`;
    const n = d.namn?.[kod] ?? d.namn?.['*'];
    if (!n) return `echo ${q(d.generisk)}`;
    return `echo ${n[0] ? `${q(n[0])} | append: ms_fl_namn` : 'ms_fl_namn'}${n[1] ? ` | append: ${q(n[1])}` : ''}`;
  };
  const grenar = Object.entries(sprak).map(([loc, d]) => {
    const egna = [...new Set([...Object.keys(d.hel ?? {}), ...Object.keys(d.namn ?? {}).filter((k) => k !== '*')])].filter((k) => lander.includes(k));
    const standard = rad(d, '*');
    const land = egna.length
      ? `        case ms_fl_kod\n${egna.map((kod) => `          when '${kod}'\n            ${rad(d, kod)}`).join('\n')}\n          else\n            ${standard}\n        endcase`
      : `        ${standard}`;
    return `      when '${loc}'\n        if ms_fl_kod == blank\n          echo ${q(d.generisk)}\n        else\n${land.replace(/^/gm, '  ')}\n        endif`;
  }).join('\n');
  return `{%- comment -%}
  ${FRAKT_MARK} (Axel 2026-09-30). Skrivs av matstrumpor/marknader/domantema.mjs varje körning —
  ändra där, aldrig här. del: 'flagga' ger kundens flagga, annars fraktraden. Ett land vi inte säljer
  till får frasen utan land och ingen flagga.
{%- endcomment -%}
{%- liquid
  assign ms_fl_kod = localization.country.iso_code
  assign ms_fl_namn = localization.country.name
  assign ms_fl_sok = ',' | append: ms_fl_kod | append: ','
  unless '${',' + lander.join(',') + ','}' contains ms_fl_sok
    assign ms_fl_kod = ''
  endunless
  if del == 'flagga'
    if ms_fl_kod != blank
      echo localization.country | image_url: width: 64 | image_tag: class: 'ms-fraktflagga', alt: '', width: 20, height: 15, loading: 'lazy', style: 'height:1.25em;width:auto;margin:.125em 0;border-radius:3px;box-shadow:0 0 0 1px rgba(0,0,0,.1)'
    endif
  else
    case request.locale.iso_code
${grenar}
    endcase
  endif
-%}`;
}

// Trust-radens två rader som byts: ikonen och punktens början. Flaggan tar lastbilens plats bara när
// kunden sitter i ett säljland; annars ritas lastbilen som förut. Flaggan (Shopifys, 4:3) är 1,25em hög
// med 0,125em luft över och under, så att den tar samma höjd som ikonerna bredvid (1,5em i mobilen)
// och texterna under står i linje. Stilen står i img-taggen: ingen CSS-fil behöver patchas.
const TRUST_ANKARE = `      <div class="ms-trust__item">
        {% render 'ms-icon', name: ico %}
`;
const TRUST_NY = `      {%- comment -%} ${FRAKT_MARK} (snippets/ms-frakt-land.liquid) {%- endcomment -%}
      {%- assign ms_fraktflagga = '' -%}
      {%- if ico == 'truck' -%}
        {%- capture ms_fraktland -%}{%- render 'ms-frakt-land' -%}{%- endcapture -%}
        {%- assign ms_fraktland = ms_fraktland | strip -%}
        {%- if ms_fraktland != blank -%}{%- assign txt = ms_fraktland -%}{%- endif -%}
        {%- capture ms_fraktflagga -%}{%- render 'ms-frakt-land', del: 'flagga' -%}{%- endcapture -%}
        {%- assign ms_fraktflagga = ms_fraktflagga | strip -%}
      {%- endif -%}
      <div class="ms-trust__item">
        {%- if ms_fraktflagga != blank -%}{{ ms_fraktflagga }}{%- else -%}{% render 'ms-icon', name: ico %}{%- endif %}
`;
// ---- Collaget "Nu i hela världen" (sections/ms-varlden.liquid) -----------------------------------
// Sektionen skrivs av collageverktyget (collage/tema.mjs på grenen claude/friendly-maxwell-cwfglq,
// inte på main). Dess språkgrenar slutar på pt, så japanska och kinesiska fick svenskans
// "Nu i hela världen" (mätt som kund i Japan och Taiwan 2026-09-30). Grenarna läggs in före else;
// inget annat i filen rörs. Texterna skrivna av en sonnet-översättare samma dag.
export const VARLDEN_MARK = `${MARK}: collagets rubrik på japanska och kinesiska`;
export const VARLDEN_SPRAK = {
  ja: { rubrik: 'いま、世界中で', under: '同じ寿司ボックス、同じ笑い。東京からシドニーまで。' },
  'zh-tw': { rubrik: '現在，遍布全世界', under: '一樣的壽司盒，一樣的歡笑。從台北到雪梨。' },
};
const VARLDEN_ANKARE = "    else\n      assign rubrik = 'Nu i hela världen'";
export function patchaVarlden(kod) {
  if (kod.includes(VARLDEN_MARK)) return { kod, byten: [], hoppade: ['varlden: redan patchad'] };
  const grenar = Object.entries(VARLDEN_SPRAK).filter(([l]) => !kod.includes(`when '${l}'`))
    .map(([l, t]) => `    when '${l}'\n      assign rubrik = '${t.rubrik}'\n      assign under = '${t.under}'\n`).join('');
  // Grenarna står inne i en {%- liquid -%}-tagg: där är en kommentar en rad som börjar med #.
  const ny = `    # ${VARLDEN_MARK}\n${grenar}${VARLDEN_ANKARE}`;
  return { kod: bytExakt(kod, VARLDEN_ANKARE, ny, 1), byten: ['varlden'], hoppade: [] };
}

/** Trust-radens truck-punkt tar texten och flaggan ur ms-frakt-land. Idempotent via FRAKT_MARK. */
export function patchaTrustRow(kod) {
  if (kod.includes(FRAKT_MARK)) return { kod, byten: [], hoppade: ['trust-raden: redan patchad (fraktland)'] };
  return { kod: bytExakt(kod, TRUST_ANKARE, TRUST_NY, 1), byten: ['fraktland'], hoppade: [] };
}

// Filerna och vad som görs med dem.
export const PATCHAR = {
  'layout/theme.liquid': patchaLayout,
  'snippets/meta-tags.liquid': patchaMetaTags,
  'sections/header.liquid': patchaHeader,
  'sections/footer.liquid': patchaFooter,
  'snippets/ms-head.liquid': patchaMsHead,
  'locales/fi.json': patchaFiLocale,
  'locales/es.json': patchaEsLocale,
  'sections/main-product.liquid': patchaProduktMoms,
  'sections/featured-product.liquid': patchaProduktMoms,
  'sections/main-cart-footer.liquid': patchaKorgMoms,
  'snippets/cart-drawer.liquid': patchaKorgMoms,
  'snippets/quick-order-list.liquid': patchaKorgMoms,
  'snippets/ms-trust-row.liquid': patchaTrustRow,
  'sections/ms-varlden.liquid': patchaVarlden,
};
const MOMSFILER = Object.keys(PATCHAR).filter((f) => PATCHAR[f] === patchaProduktMoms || PATCHAR[f] === patchaKorgMoms);
export const NYA_FILER = {
  'sections/ms-omdomen-no.liquid': SEKTION_OMDOMEN,
  'snippets/ms-omdomen-badge.liquid': SNIPPET_BADGE,
  'snippets/ms-frakt-land.liquid': fraktLandSnippet(saljlander(JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8')))),
};

// ---- Nät -------------------------------------------------------------------

async function huvud() {
  const arg = process.argv.slice(2);
  const skarpt = arg.includes('--skarpt');
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const KONFIG = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
  const k = await skapaKlient(lasButik(KONFIG.butik));
  const log = (s) => console.log(s);

  if (arg.includes('--omdomen')) {
    const fil = join(ROT, 'domantema', 'omdomen-nb.json');
    const d = JSON.parse(readFileSync(fil, 'utf8'));
    const p = await k.graphql(`query($h: String!) { productByHandle(handle: $h) { id metafield(namespace: "matstrumpor", key: "omdomen_nb") { value } } }`, { h: d.handle });
    const varde = JSON.stringify(omdomenJson(d.rader, { kalla: d.kalla }));
    if (p.productByHandle.metafield?.value === varde) { log(`✅ ${d.handle}: matstrumpor.omdomen_nb har redan de ${d.rader.length} recensionerna`); return; }
    if (!skarpt) { log(`torrt: ${d.handle} får matstrumpor.omdomen_nb (${d.rader.length} recensioner, snitt ${omdomenJson(d.rader).snitt_text})`); return; }
    const r = await k.graphql(`mutation($m: [MetafieldsSetInput!]!) { metafieldsSet(metafields: $m) { metafields { id } userErrors { field message } } }`,
      { m: [{ ownerId: p.productByHandle.id, namespace: 'matstrumpor', key: 'omdomen_nb', type: 'json', value: varde }] });
    if (r.metafieldsSet.userErrors.length) throw new Error(r.metafieldsSet.userErrors.map((e) => e.message).join('; '));
    const las = await k.graphql(`query($h: String!) { productByHandle(handle: $h) { metafield(namespace: "matstrumpor", key: "omdomen_nb") { value } } }`, { h: d.handle });
    if (las.productByHandle.metafield?.value !== varde) throw new Error('metafältet läste tillbaka fel');
    log(`✅ ${d.handle}: matstrumpor.omdomen_nb skrivet och tillbakaläst (${d.rader.length} recensioner)`);
    return;
  }

  const temaId = arg.includes('--tema') ? arg[arg.indexOf('--tema') + 1] : KONFIG.tema_id;
  // --fran <gid>: läs filerna ur ett annat tema (t.ex. opatchade MAIN) och skriv patchen i --tema.
  // Så görs en provkopia om efter en rättning utan att patcha ovanpå en äldre patch.
  const franId = arg.includes('--fran') ? arg[arg.indexOf('--fran') + 1] : temaId;
  const namn = [...Object.keys(PATCHAR), 'templates/product.json'];
  const d = await k.graphql(`query($id: ID!, $f: [String!]) { theme(id: $id) { name role files(filenames: $f, first: 20) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: franId, f: namn });
  const mal = franId === temaId ? d.theme : (await k.graphql(`query($id: ID!) { theme(id: $id) { name role } }`, { id: temaId })).theme;
  log(`Tema: ${mal.name} (${mal.role})${franId !== temaId ? ` · filerna ur ${d.theme.name} (${d.theme.role})` : ''}${skarpt ? '  SKARPT' : '  (torrt — --skarpt skriver)'}`);
  const filer = Object.fromEntries(d.theme.files.nodes.map((n) => [n.filename, n.body.content]));
  const ut = [];
  for (const [fil, fn] of Object.entries(PATCHAR)) {
    if (filer[fil] === undefined) throw new Error(`${fil} saknas i temat`);
    const r = fn(filer[fil]);
    log(`${fil}: ${r.byten.length ? 'ändras (' + r.byten.join(', ') + ')' : r.hoppade.join(', ')}`);
    if (r.byten.length) ut.push({ filename: fil, body: { type: 'TEXT', value: r.kod } });
  }
  const pm = patchaProduktMall(filer['templates/product.json']);
  log(`templates/product.json: ${pm.byten.length ? 'ändras (' + pm.byten.join(', ') + ')' : pm.hoppade.join(', ')}`);
  if (pm.byten.length) ut.push({ filename: 'templates/product.json', body: { type: 'TEXT', value: pm.text } });
  for (const [fil, innehall] of Object.entries(NYA_FILER)) ut.push({ filename: fil, body: { type: 'TEXT', value: innehall } });
  // Nya filer först, så att product.json och layouten aldrig pekar på något som inte finns.
  ut.sort((a, b) => (a.filename in NYA_FILER ? 0 : 1) - (b.filename in NYA_FILER ? 0 : 1));
  if (!skarpt) { log(`torrt: ${ut.length} filer skulle skrivas: ${ut.map((f) => f.filename).join(', ')}`); return; }
  for (const f of ut) {
    const r = await k.graphql(`mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }`, { id: temaId, files: [f] });
    const fel = r.themeFilesUpsert.userErrors;
    if (fel.length) throw new Error(`${f.filename}: ${fel.map((e) => `${e.code} ${e.message}`).join('; ')}`);
    log(`✅ ${f.filename}`);
  }
  // Tillbakaläsning: markören i varje patchad fil. Shopify kan svara med den gamla versionen en kort stund
  // efter skrivningen (mätt 2026-09-29: locales/fi.json läste fel direkt efter, rätt en minut senare) —
  // därför upp till tre läsningar innan en fil döms.
  const okFor = (n) => (n.filename === 'templates/product.json' ? n.body.content.includes('ms_omdomen_no')
    : n.filename === 'locales/fi.json' ? n.body.content.includes(FI_RATT)
    : n.filename === 'locales/es.json' ? n.body.content.includes('"add_to_cart": "Añadir al carrito"')
    : n.filename === 'sections/footer.liquid' ? n.body.content.includes(BETAL_MARK)
      : MOMSFILER.includes(n.filename) ? n.body.content.includes(MOMS_MARK)
        : n.filename === 'layout/theme.liquid' ? n.body.content.includes(BLOCK_V5) && n.body.content.includes(VILLKOR_V6)
          : n.filename === 'sections/header.liquid' ? n.body.content.includes(HEADER_V2)
            : n.filename === 'snippets/meta-tags.liquid' ? n.body.content.includes(META_V2)
              : n.filename === 'snippets/ms-frakt-land.liquid' ? n.body.content === NYA_FILER['snippets/ms-frakt-land.liquid']
                : n.filename === 'snippets/ms-head.liquid' ? n.body.content.includes(UTB_MARK)
                : n.filename === 'snippets/ms-trust-row.liquid' ? n.body.content.includes(FRAKT_MARK) : n.body.content.includes(MARK));
  let las;
  for (let forsok = 1; forsok <= 3; forsok++) {
    las = await k.graphql(`query($id: ID!, $f: [String!]) { theme(id: $id) { files(filenames: $f, first: 20) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: temaId, f: ut.map((x) => x.filename) });
    if (las.theme.files.nodes.every(okFor) || forsok === 3) break;
    await new Promise((r) => setTimeout(r, 5000));
  }
  for (const n of las.theme.files.nodes) {
    const ok = okFor(n);
    log(`${ok ? '✅' : '❌'} tillbakaläst ${n.filename}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
