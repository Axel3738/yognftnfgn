// Kundens spårningssida: /pages/spara på baverbutiken.se (handlen står i
// sparning/konfig.json → sida.handle och är den publicera.mjs använder).
//
// Kunden klickar "Spåra paketet" i leveransmejlet och landar här med
// ?nummer=YT… i adressen. Sidan slår upp numret i den inbäddade datan och
// ritar hela kedjan på svenska med ort och tid — det Shopifys egen
// orderstatussida inte gör (den visar tre streck: Bekräftad / På väg /
// Levererad, utan orter och utan historik).
//
// Byggs som en Shopify-sida (write_content) med ALLT inline: HTML, <style>,
// <script> och datan. Samma mönster som lyckohjulet (`mejl/hjul.mjs`):
// inga temafiler, inga externa resurser, sidan överlever temabyten och
// GemPages. Liquid renderas inte i page.content, så allt som ska vara
// dynamiskt görs i webbläsaren.
//
// ⚠️ Uppackaren skrivs INTE om här. `sparning/uppacka.mjs` läses in vid
// bygget och bäddas in med orden `export ` bortstrippade, så det finns bara
// EN uppackare och formatet kan aldrig tolkas olika i Node och i
// webbläsaren. Ändras formatet ändras bara den filen.
//
// Integritet: datan bär bara spårningsnummer, status, fraktbolag,
// skanningstexter och orter. Inga namn, inga adresser, inga ordernummer,
// inga e-postadresser. Sidan slår därför aldrig upp på ordernummer —
// spårningsnumret är enda nyckeln, precis som hos fraktbolaget.

import { readFileSync } from 'node:fs';
import { skapaOversattare } from './oversatt.mjs';

// Publiceraren letar efter de här två i kundens vy för att veta att rätt sida
// ligger uppe. Ändras de måste publiceraren ändras samtidigt.
export const SIDMARKOR = 'id="bb-spar"';
export const DATAMARKOR = 'id="bb-spar-data"';

// Texterna ligger i en egen JSON-ruta. Paketdatan i `bb-spar-data` är då
// exakt det `sparning/uppacka.mjs` beskriver — inget hölje runt — så vilken
// annan läsare som helst kan plocka den och köra `packaUppEtt()` på den.
export const COPYMARKOR = 'id="bb-spar-copy"';

// Butikens färger och rubriktypsnitt. Avlästa ur `mejl/konfig.json`
// (butik.farg_rod / farg_svart / farg_ram / font_rubrik) 2026-09-19 — samma
// värden som mejlen och lyckohjulet använder. En `konfig` som bär egna
// värden vinner; det här är reserven så sidan går att bygga i ett test utan
// att släpa med hela mejlkonfigurationen.
export const STANDARDSTIL = {
  rod: '#dd1d1d',
  svart: '#000000',
  ram: '#e8e8e1',
  font: "Impact,'Anton','Arial Narrow','Arial Black',sans-serif",
};

// Supportadressen. Samma reserv som `sparning/status.mjs` använder för de
// meddelanden som skrivs in i Shopify, så kunden ser en och samma adress i
// mejlet, på orderstatussidan och här.
export const STANDARDSUPPORT = 'kundsupport@baverbutiken.se';

// Tidszon per språk för de extra språken på en sida. 'auto' = kundens
// webbläsare — engelskan (US, GB, CA, AU, NZ) spänner över tio tidszoner.
export const TIDSZON = { sv: 'Europe/Stockholm', nb: 'Europe/Oslo', da: 'Europe/Copenhagen', fi: 'Europe/Helsinki', en: 'auto' };

// De fasta texterna i markupen, på svenska. Varje rad har ett data-t med
// samma text som nyckel; för de extra språken bakas översättningen in i
// C.sprak[kod].markup och skriptet byter textContent vid start. {{prefix}}
// byts redan här (prefixet är detsamma på alla språk).
export const MARKUP_TEXTER = [
  'Den här sidan behöver JavaScript för att visa din spårning. Slå på det i webbläsaren och ladda om sidan, eller mejla',
  'så kollar vi paketet åt dig.',
  'Spårning',
  'Spåra ditt paket',
  'Skriv in ditt paketnummer',
  'Visa paketet',
  'Paketnumret börjar med {{prefix}} och står i ditt leveransmejl, under knappen Spåra paketet. Har du ett spårningsnummer från fraktbolaget fungerar det också. Mellanslag och bindestreck spelar ingen roll.',
  'Vi hittar inte det numret',
  'Kontrollera att hela numret kom med när du klistrade in det.',
  'Fick du leveransmejlet nyss? Då är paketet på väg in här — sidan hämtar nya paket varje timme, så prova igen om en liten stund.',
  'Stämmer numret och det ändå inte syns här: mejla',
  'så letar vi upp paketet åt dig.',
  'Till butiken',
  'Ditt paketnummer',
  'Undrar du något om leveransen? Mejla',
  'Spåra ett annat nummer',
];
function markupTexter(T, prefixKort) {
  const ut = {};
  for (const t of MARKUP_TEXTER) ut[t] = T(t).split('{{prefix}}').join(prefixKort);
  return ut;
}

// Statuskod → rubriken kunden möter högst upp. Koderna är `STATUSAR` i
// `sparning/uppacka.mjs`; en kod som inte står här faller tillbaka på den
// svenska etiketten därifrån, aldrig på en påhittad rubrik.
export const RUBRIKER = {
  CONFIRMED: 'Paketet är bokat',
  IN_TRANSIT: 'Paketet är på väg',
  OUT_FOR_DELIVERY: 'Paketet är ute för leverans',
  READY_FOR_PICKUP: 'Paketet finns att hämta',
  DELIVERED: 'Paketet är levererat',
  ATTEMPTED_DELIVERY: 'Leveransförsöket misslyckades',
  FAILURE: 'Det blev ett problem med leveransen',
};

const esk = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// ---------------------------------------------------------------------------
// Konfigurationen
// ---------------------------------------------------------------------------

// Läser det sidan behöver ur `konfig`. Formen är `mejl/konfig.json`:
// { butik: { support, farg_rod, farg_svart, farg_ram, font_rubrik },
//   frakt: { sparning_vaknar } }. Platta fält går också bra.
//
// ⚠️ `vaknar` ("2–4 dagar") är en SIFFRA om verkligheten och hittas aldrig på
// här. Saknas den i konfigurationen säger sidan bara att fraktbolaget inte
// skannat paketet än, utan att lova någon tid.
function lasKonfig(konfig) {
  const k = konfig ?? {};
  const butik = k.butik ?? {};
  const frakt = k.frakt ?? {};
  const vaknar = frakt.sparning_vaknar ?? k.sparning_vaknar ?? null;
  // Butikens språk (sparning/oversatt.mjs). Svenska är identiteten; för
  // Beverbutikken, Bæverbutiken och Majavakauppa byts varje mening här i
  // sista ledet. Prefixet och tidszonen följer butiken (sparning/butiker.json).
  const ov = skapaOversattare(k.sprak ?? butik.sprak ?? 'sv');
  return {
    sprak: ov.kod,
    locale: ov.locale,
    html: ov.html,
    T: ov.T,
    prefix: String(k.prefix ?? butik.prefix ?? 'BB-'),
    tidszon: String(k.tidszon ?? butik.tidszon ?? 'Europe/Stockholm'),
    support: butik.support ?? k.support ?? STANDARDSUPPORT,
    rod: butik.farg_rod ?? k.farg_rod ?? STANDARDSTIL.rod,
    svart: butik.farg_svart ?? k.farg_svart ?? STANDARDSTIL.svart,
    ram: butik.farg_ram ?? k.farg_ram ?? STANDARDSTIL.ram,
    font: butik.font_rubrik ?? k.font_rubrik ?? STANDARDSTIL.font,
    // Rubrikstilen följer mejlen (mejl/mallar.mjs stil()): Bäverbutiken
    // Impact i versaler, CaraShell fet Arial i gemener.
    versaler: butik.rubrik_versaler ?? k.rubrik_versaler ?? true,
    fet: butik.rubrik_fet ?? k.rubrik_fet ?? false,
    // Extra språk på samma sida (registret → sprak_extra). Sidan byter själv
    // efter <html lang> för adressen kunden kom in på — Shopify sätter den
    // per locale (/nb → nb, carashell.com → en). Texterna för varje extra
    // språk bakas in i copy-rutan (C.sprak) och i datan (D.ft/D.ot).
    extra: (Array.isArray(k.sprak_extra) ? k.sprak_extra : [])
      .filter((kod) => kod && kod !== ov.kod)
      .map((kod) => {
        const o = skapaOversattare(kod);
        return { kod: o.kod, locale: o.locale, T: o.T, tidszon: TIDSZON[o.kod] ?? 'Europe/Stockholm' };
      }),
    vaknar: vaknar ? String(vaknar).trim() : null,
    // Leveranslöftet kunden redan fått i mejlen (mejl/konfig.json →
    // frakt.leverans_dagar_min/max). ⚠️ Hittas ALDRIG på här: saknas talen
    // visar sidan ingen beräknad leverans alls. Sidan och mejlen får aldrig
    // lova olika saker.
    levMin: Number.isFinite(frakt.leverans_dagar_min) ? frakt.leverans_dagar_min : null,
    levMax: Number.isFinite(frakt.leverans_dagar_max) ? frakt.leverans_dagar_max : null,
    // Erbjudandet "köp igen → gratisprodukt" (mejl/konfig.json → erbjudande +
    // hjul, samma källa som mejlen och lyckohjulet). Axels beslut 2026-09-20
    // kväll: en stor knapp till hjulet under paketet, "Spåra ett annat
    // nummer" blir liten. Saknas blocket i konfigurationen visas inget —
    // sidan hittar aldrig på ett erbjudande.
    erbjudande: erbjudandeUr(k),
  };
}

function erbjudandeUr(k) {
  const e = k.erbjudande ?? null;
  const handle = k.hjul?.handle ?? null;
  if (!e || !handle) return null;
  const minsta = Number(e.minsta_kop_sek);
  if (!Number.isFinite(minsta) || minsta <= 0) return null;
  return { minsta, sida: `/pages/${String(handle).replace(/^\/+|\/+$/g, '')}` };
}

// Texten för ett paket som är registrerat men aldrig skannat. Meningen om
// väntetiden byggs bara när konfigurationen gett en.
function tomtext(vaknar, T = (x) => x) {
  const bas = T('Paketet är bokat. Fraktbolaget har inte skannat det än');
  return vaknar ? `${bas} — ${T('det brukar ta')} ${vaknar}.` : `${bas}.`;
}

// Erbjudandet under paketet (Axels beslut 2026-09-20 kväll: "nån sjuk upsell
// … 'få en gratis produkt' stor och tydlig, och en mindre knapp under som är
// spåra ett annat paket"). Ligger inne i träffvyn, så det visas bara när ett
// paket visas — aldrig i sökläget eller vid "hittar inte". Löftet är exakt
// det mejlen och hjulet ger: vinsten blir gratis i KASSAN vid nästa köp över
// beloppet (rabatten syns först där, se mejl/README.md → "Det här är hjulet
// inte"). Ingen rabattkod i länken — hjulets kassaknapp lägger på den.
function erbjudandeBlock(c) {
  const e = c.erbjudande;
  if (!e) return '';
  return `  <div class="bbs-erbjudande">
    <p class="bbs-etikett bbs-etikett--ljus">Tack för din beställning</p>
    <h2>Vinn en gratisprodukt</h2>
    <p>Som tack får du snurra vårt lyckohjul. Vinsten blir gratis i kassan vid ditt nästa köp över ${esk(String(e.minsta))} kr.</p>
    <a class="bbs-knapp bbs-knapp--stor" href="${esk(e.sida)}">Få en gratisprodukt</a>
  </div>
`;
}

// Texterna som skriptet behöver. Allt annat står i HTML:en, så det går att
// läsa och rätta utan att gräva i JavaScript.
function copydata(c) {
  const T = c.T || ((x) => x);
  return {
    tz: c.tidszon,
    locale: c.locale,
    idag: T('i dag'),
    igar: T('i går'),
    rubriker: Object.fromEntries(Object.entries(RUBRIKER).map(([k, v]) => [k, T(v)])),
    reservrubrik: T('Ditt paket'),
    tom: tomtext(c.vaknar, T),
    // Raden under det aktiva skedet när paketet rört sig sedan det nåddes.
    // Utan den står sidan stilla i 4–9 dygn under den internationella
    // sträckan — 544 av 1 055 paket låg där när det mättes 2026-09-19.
    senast: T('Senaste skanning {{tid}}'),
    // Sista biten i Sverige. 17TRACK lämnar bolaget och dess EGET nummer i
    // misc_info; vi läste bara aldrig fältet (Axel 2026-09-20). Mätt samma
    // dag: 623 av 1 055 paket hade ett namngivet svenskt bolag.
    sistaRubrik: T('Hämta ditt paket'),
    sistaLank: T('Följ hos {{bolag}}'),
    sistaUtanLank: T('Numret hos {{bolag}}'),
    // Motiv per skede. Delskedets eget motiv (DELSTEG i uppacka.mjs) vinner,
    // så ikonen följer resan: kvitto → låda → stämpel → flygplan → lager →
    // lastbil → brevlåda.
    ikoner: {
      bestalld: 'kvitto', pa_vag: 'flyg', i_landet: 'lager',
      utkorning: 'lastbil', levererat: 'brevlada',
    },
    // Sidan är statisk: skanningarna bakas in när rutinen bygger om den, varje
    // timme. Den hämtar ingenting själv medan kunden tittar, och får inte
    // påstå det heller — står det "hämtar" tror kunden att en uppdatering är
    // ett klick bort.
    uppdaterad: T('Uppdaterad {{tid}} · nya skanningar läggs till varje timme'),
    nummer: T('Ditt paketnummer'),
    // Beräknad leverans. Dagarna kommer ur mejlens konfiguration, samma
    // löfte kunden redan fått — aldrig ur huvudet. Saknas de visas ingen
    // ruta alls.
    leverans: T('Beräknad leverans'),
    leveransSen: T('Leveransen är försenad'),
    leveransSenText: T('Den skulle ha varit framme {{datum}}. Mejla oss så kollar vi upp den åt dig.'),
    levMin: c.levMin,
    levMax: c.levMax,
    tomtFalt: T('Klistra in numret från leveransmejlet först.'),
    // Samma texter på de extra språken, plus markupens fasta rader. Skriptet
    // byter till C.sprak[lang] när <html lang> säger ett av dem.
    ...(c.extra?.length
      ? {
          sprak: Object.fromEntries(
            c.extra.map((x) => [
              x.kod,
              {
                ...copydata({ ...c, T: x.T, tidszon: x.tidszon, locale: x.locale, extra: [] }),
                markup: markupTexter(x.T, String(c.prefix ?? '').replace(/-+$/, '')),
              },
            ])
          ),
        }
      : {}),
  };
}

// ---------------------------------------------------------------------------
// Stilen
// ---------------------------------------------------------------------------

// Allt avgränsat under #bb-spar så temats egna regler (.rte h2, .rte ul …)
// inte tar över och så sidan inte färgar av sig på resten av butiken.
//
// ⚠️ `#bb-spar [hidden]{display:none!important}` är inte prydnad. Webbläsarens
// egen regel `[hidden]{display:none}` ligger i UA-stilmallen och FÖRLORAR mot
// varje författarregel som sätter `display` — t.ex. `.bbs-knapp{display:block}`
// på knappen "Spåra ett annat nummer", som därför syntes redan innan kunden
// hade sökt. Spärren gör `hidden` pålitligt för alla vyer på sidan.
//
// Sammanfattningens fem punkter (.bbs-steg) är hela vyn: nådda skeden är
// svarta med datum, kommande står grå utan. Den fullständiga historiken
// (.bbs-lista bakom "Mer information") togs bort 2026-09-20 kväll på Axels
// beslut — den räknade upp Kina och Nederländerna rad för rad.
//
// ⚠️ Inga /* */-kommentarer inuti mallsträngen nedan: testet som mäter att
// all CSS är avgränsad under #bb-spar läser selektorerna med en enkel
// delning och tar då kommentaren för en selektor som läcker ut i temat.
function stil(c) {
  return `
#bb-spar{--bbs-rod:${c.rod};--bbs-svart:${c.svart};--bbs-ram:${c.ram};--bbs-gra:#5b5b5b;max-width:620px;margin:0 auto;padding:0 0 28px;color:var(--bbs-svart);font-family:inherit;font-size:16px;line-height:1.5;text-align:left}
#bb-spar *{box-sizing:border-box}
#bb-spar [hidden]{display:none!important}
#bb-spar h2{font-family:${c.font};font-weight:${c.fet ? 700 : 400};text-transform:${c.versaler ? 'uppercase' : 'none'};letter-spacing:${c.versaler ? '.5px' : '0'};font-size:30px;line-height:1.1;margin:0 0 10px;color:var(--bbs-svart)}
#bb-spar p{margin:0 0 12px}
#bb-spar a{color:var(--bbs-svart);text-decoration:underline}
#bb-spar a:hover{color:var(--bbs-rod)}
#bb-spar :focus-visible{outline:3px solid var(--bbs-rod);outline-offset:2px}
#bb-spar .bbs-etikett{font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--bbs-rod);margin:0 0 6px}
#bb-spar .bbs-ingress{font-size:17px;margin:0 0 16px}
#bb-spar .bbs-noscript{border:2px solid var(--bbs-rod);padding:14px 16px;margin:0 0 16px;font-weight:700}
#bb-spar .bbs-ruta{border:1px solid var(--bbs-ram);padding:18px 16px;margin:0 0 18px;background:#fff}
#bb-spar .bbs-falt{display:block;width:100%;padding:14px 12px;font-size:16px;font-family:inherit;color:var(--bbs-svart);background:#fff;border:2px solid var(--bbs-svart);border-radius:0;margin:0 0 12px}
#bb-spar label{display:block;font-weight:700;margin:0 0 8px}
#bb-spar .bbs-hjalp{font-size:14px;color:var(--bbs-gra);margin:10px 0 0}
#bb-spar .bbs-knapp{display:block;width:100%;min-height:52px;padding:14px 20px;background:var(--bbs-rod);color:#fff;border:0;border-radius:0;font-family:${c.font};font-weight:${c.fet ? 700 : 400};font-size:${c.versaler ? 21 : 19}px;letter-spacing:${c.versaler ? '1px' : '0'};text-transform:${c.versaler ? 'uppercase' : 'none'};line-height:1.2;text-align:center;text-decoration:none;cursor:pointer}
#bb-spar .bbs-knapp:hover{background:#b81616;color:#fff;text-decoration:none}
#bb-spar .bbs-knapp--tunn{background:#fff;color:var(--bbs-svart);border:2px solid var(--bbs-svart);font-size:17px;min-height:48px}
#bb-spar .bbs-knapp--tunn:hover{background:var(--bbs-ram);color:var(--bbs-svart)}
#bb-spar .bbs-fel{color:var(--bbs-rod);font-weight:700;margin:0 0 12px}
#bb-spar .bbs-leverans{margin:0 0 16px;padding:14px 16px;border:2px solid var(--bbs-svart);background:#fff}
#bb-spar .bbs-leverans .bbs-levetikett{display:block;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--bbs-gra);margin:0 0 4px}
#bb-spar .bbs-leverans .bbs-levdatum{display:block;font-family:${c.font};font-weight:${c.fet ? 700 : 400};font-size:24px;line-height:1.15;text-transform:${c.versaler ? 'uppercase' : 'none'};letter-spacing:${c.versaler ? '.5px' : '0'}}
#bb-spar .bbs-leverans .bbs-levtext{display:block;font-size:14px;margin:6px 0 0}
#bb-spar .bbs-leverans--sen{border-color:var(--bbs-rod)}
#bb-spar .bbs-leverans--sen .bbs-levdatum{color:var(--bbs-rod)}
#bb-spar .bbs-fakta{display:flex;flex-wrap:wrap;gap:8px 28px;margin:0 0 18px;padding:14px 16px;border:1px solid var(--bbs-ram)}
#bb-spar .bbs-fakta div{min-width:0}
#bb-spar .bbs-fakta dt{font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--bbs-gra);margin:0 0 2px}
#bb-spar .bbs-fakta dd{margin:0;font-weight:700;word-break:break-all}
#bb-spar .bbs-sista{margin:-8px 0 18px;padding:12px 16px;border:1px solid var(--bbs-ram);border-top:0;font-size:14px;line-height:1.6}
#bb-spar .bbs-sista .bbs-sistaetikett{display:block;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--bbs-gra);margin:0 0 3px}
#bb-spar .bbs-sista .bbs-sistanr{font-weight:700;word-break:break-all}
#bb-spar .bbs-sista a{font-weight:700}
#bb-spar .bbs-steg{list-style:none;margin:18px 0 0;padding:0 0 0 8px}
#bb-spar .bbs-stegrad{position:relative;margin:0;padding:0 0 20px 26px;border-left:2px solid var(--bbs-ram)}
#bb-spar .bbs-stegrad:last-child{border-left-color:transparent;padding-bottom:0}
#bb-spar .bbs-stegrad::before{content:"";position:absolute;left:-7px;top:4px;width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid var(--bbs-ram);box-sizing:border-box}
#bb-spar .bbs-stegrad--nadd{border-left-color:var(--bbs-svart)}
#bb-spar .bbs-stegrad--nadd::before{background:var(--bbs-svart);border-color:var(--bbs-svart)}
#bb-spar .bbs-stegrad--nadd:last-child{border-left-color:transparent}
#bb-spar .bbs-stegrad--nu::before{left:-9px;top:1px;width:18px;height:18px;background:var(--bbs-rod);border-color:var(--bbs-rod)}
#bb-spar .bbs-stegnamn{margin:0;font-weight:700;color:var(--bbs-gra)}
#bb-spar .bbs-stegrad--nadd .bbs-stegnamn{color:var(--bbs-svart)}
#bb-spar .bbs-stegtid{display:block;font-size:13px;letter-spacing:.5px;text-transform:uppercase;color:var(--bbs-gra);margin:3px 0 0}
#bb-spar .bbs-stegort{text-transform:none;letter-spacing:0}
#bb-spar .bbs-stegsenast{text-transform:none;letter-spacing:0;font-style:italic}
#bb-spar .bbs-stegextra{text-transform:none;letter-spacing:0}
#bb-spar .bbs-steg--ikoner .bbs-stegrad{padding-left:44px}
#bb-spar .bbs-steg--ikoner .bbs-stegrad::before{display:none}
#bb-spar .bbs-stegikon{position:absolute;left:-17px;top:-2px;width:32px;height:32px;border-radius:50%;background:#fff;border:2px solid var(--bbs-ram);display:flex;align-items:center;justify-content:center;box-sizing:border-box}
#bb-spar .bbs-stegikon svg{width:17px;height:17px;display:block;fill:none;stroke:var(--bbs-ram);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
#bb-spar .bbs-stegrad--nadd .bbs-stegikon{border-color:var(--bbs-svart);background:var(--bbs-svart)}
#bb-spar .bbs-stegrad--nadd .bbs-stegikon svg{stroke:#fff}
#bb-spar .bbs-stegrad--nu .bbs-stegikon{border-color:var(--bbs-rod);background:var(--bbs-rod)}
#bb-spar .bbs-stegrad--nu .bbs-stegikon svg{stroke:#fff}
#bb-spar .bbs-stegdel{display:inline-flex;align-items:center;gap:6px;margin:6px 0 0;padding:4px 10px 4px 7px;border:1.5px solid var(--bbs-svart);border-radius:999px;font-size:13px;font-weight:700;line-height:1.3}
#bb-spar .bbs-stegdel svg{width:14px;height:14px;flex:0 0 14px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}
#bb-spar .bbs-stegrad--nu .bbs-stegdel{border-color:var(--bbs-rod);color:var(--bbs-rod)}
#bb-spar .bbs-linje{position:absolute;left:-2px;top:0;width:2px;height:0;background:var(--bbs-svart);transition:height 900ms cubic-bezier(.22,.61,.36,1)}
#bb-spar .bbs-steg--rullar .bbs-stegrad--nadd .bbs-linje{height:100%}
#bb-spar .bbs-stegrad--nu .bbs-stegikon{animation:bbs-puls 2.4s ease-in-out infinite}
@keyframes bbs-puls{0%,100%{box-shadow:0 0 0 0 rgba(221,29,29,.45)}50%{box-shadow:0 0 0 7px rgba(221,29,29,0)}}
#bb-spar .bbs-resa{position:absolute;left:-11px;top:26px;bottom:2px;width:20px;pointer-events:none;overflow:hidden}
#bb-spar .bbs-resa svg{position:absolute;left:0;width:20px;height:20px;fill:none;stroke:var(--bbs-rod);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;animation:bbs-resa 4.2s cubic-bezier(.45,0,.55,1) infinite}
@keyframes bbs-resa{0%{top:-24px;opacity:0}18%{opacity:1}82%{opacity:1}100%{top:100%;opacity:0}}
@media (prefers-reduced-motion:reduce){
#bb-spar .bbs-linje{transition:none}
#bb-spar .bbs-stegrad--nu .bbs-stegikon{animation:none}
#bb-spar .bbs-resa{display:none}
}
#bb-spar .bbs-avvikelse{margin:14px 0 0;padding:12px 14px;border-left:4px solid var(--bbs-rod);background:#fdf3f3;font-weight:700}
#bb-spar .bbs-byggd{font-size:13px;color:var(--bbs-gra);margin:20px 0 0}
#bb-spar .bbs-hjalprad{font-size:14px;color:var(--bbs-gra);margin:14px 0 0}
#bb-spar .bbs-erbjudande{margin:26px 0 0;padding:22px 18px 20px;background:var(--bbs-svart);color:#fff}
#bb-spar .bbs-erbjudande h2{color:#fff;margin:0 0 8px}
#bb-spar .bbs-erbjudande p{color:#fff;margin:0 0 14px}
#bb-spar .bbs-etikett--ljus{color:var(--bbs-rod)}
#bb-spar .bbs-knapp--stor{font-size:23px;min-height:58px;padding:16px 20px}
#bb-spar .bbs-knapp--liten{width:auto;min-height:42px;padding:9px 18px;margin:16px auto 0;font-size:15px;letter-spacing:.5px;border-width:1px}
@media (max-width:420px){#bb-spar h2{font-size:25px}#bb-spar .bbs-fakta{gap:10px 0;display:block}}
`;
}

// ---------------------------------------------------------------------------
// Uppackaren
// ---------------------------------------------------------------------------

// Källkoden till `sparning/uppacka.mjs` med `export ` bortstrippat, så den
// kan ligga rakt i sidans <script>. Filen är skriven för att tåla just det:
// ingen import, inget Node-API, inget nyare än ES2019.
export function uppackarkalla() {
  const kod = readFileSync(new URL('./uppacka.mjs', import.meta.url), 'utf8');
  const utan = kod.split('export ').join('');
  if (utan.indexOf('function packaUppEtt(') < 0) {
    throw new Error('sida.mjs: uppacka.mjs ser inte ut som väntat — packaUppEtt() hittades inte.');
  }
  // `</` någonstans i koden skulle stänga <script>-taggen. Uppackaren har
  // ingen sådan sekvens i dag; spärren finns för att den aldrig ska smyga in.
  if (utan.indexOf('</') >= 0) {
    throw new Error('sida.mjs: uppacka.mjs innehåller "</" och kan inte bäddas in i en <script>-tagg.');
  }
  return utan;
}

// ---------------------------------------------------------------------------
// Skriptet
// ---------------------------------------------------------------------------

// Ren ES5-aktig JavaScript utan mallsträngar, så den kan ligga i en
// JS-mallsträng här utan eskapning. Bygger all dynamisk text med
// textContent — aldrig innerHTML — så en skanningstext från fraktbolaget
// aldrig kan bli HTML i kundens webbläsare.
function skript() {
  return String.raw`
var rot = document.getElementById('bb-spar');
if (rot) {
  try {
    starta();
  } catch (e) {
    // Kunden ska aldrig mötas av en tom sida. Går något sönder som sidan
    // inte kan laga — trasig JSON i datablocket, en skadad händelse — visas
    // sökfältet och rutan med adressen till kundtjänst i stället. Felet
    // loggas i webbläsarens konsol så det går att hitta.
    try { if (typeof console !== 'undefined' && console.error) console.error('bb-spar:', e && e.stack ? e.stack : e); } catch (e2) {}
    nodlage();
  }
}

function nodlage() {
  var sok = document.getElementById('bbs-sok');
  var saknas = document.getElementById('bbs-saknas');
  if (sok) sok.hidden = false;
  if (saknas) saknas.hidden = false;
}

function starta() {
  var D = JSON.parse(document.getElementById('bb-spar-data').textContent);
  var C = JSON.parse(document.getElementById('bb-spar-copy').textContent);
  // Flera språk på samma sida: Shopify sätter lang-attributet på dokumentet
  // efter adressen kunden kom in på (/nb → nb, carashell.com → en). Finns språket i C.sprak
  // byts texterna, fraserna (D.ft) och etiketterna (D.ot) här, innan något
  // ritas. Annars butikens eget språk, precis som förut.
  var rotEl = document.documentElement;
  var LANG = String((rotEl && rotEl.getAttribute && rotEl.getAttribute('lang')) || '').slice(0, 2).toLowerCase();
  if (LANG && C && C.sprak && Object.prototype.hasOwnProperty.call(C.sprak, LANG)) {
    var CX = C.sprak[LANG];
    if (D && D.ft && D.ft[LANG]) D.f = D.ft[LANG];
    if (D && D.ot && D.ot[LANG]) D.o = D.ot[LANG];
    var noder = document.querySelectorAll ? document.querySelectorAll('#bb-spar [data-t]') : [];
    for (var ni = 0; ni < noder.length; ni++) {
      // (heter inte nyckel — det är uppackarens funktion, som ligger i samma räckvidd)
      var tNyckel = noder[ni].getAttribute('data-t');
      if (CX.markup && Object.prototype.hasOwnProperty.call(CX.markup, tNyckel)) noder[ni].textContent = CX.markup[tNyckel];
    }
    // "Till butiken" ska landa i samma språk som kunden kom från.
    var hem = document.querySelector ? document.querySelector('#bb-spar a[data-hem]') : null;
    var seg = String((location && location.pathname) || '').split('/')[1] || '';
    if (hem && seg.toLowerCase() === LANG) hem.setAttribute('href', '/' + seg + '/');
    C = CX;
  }
  var TZ = (C && C.tz) || 'Europe/Stockholm';
  if (TZ === 'auto') {
    try { TZ = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Stockholm'; } catch (e) { TZ = 'Europe/Stockholm'; }
  }
  var LOC = (C && C.locale) || LOC;

  // Skedenas och delskedenas etiketter ligger inbäddade på svenska (uppacka.mjs
  // körs här i webbläsaren); butikens språk står i D.o, byggt av
  // sparning/oversatt.mjs. Svensk butik: ingen ordlista, samma text tillbaka.
  function ord(text) {
    if (D && D.o && Object.prototype.hasOwnProperty.call(D.o, text)) return D.o[text];
    return text;
  }
  var $ = function (id) { return document.getElementById(id); };
  var visaEl = function (el, pa) { if (el) el.hidden = !pa; };

  // ---------------------------------------------------------------- tiden
  // ⚠️ datumStr/arStr är NYCKLAR (dagenFore() delar dem på '-'), inte text
  // kunden ser — de ska alltid vara sv-SE:s ÅÅÅÅ-MM-DD. Med butikens locale
  // gav nb-NO "20.9.2026", dagenFore() kastade och varje norskt uppslag
  // slutade i "Vi finner ikke det nummeret" (mätt 2026-09-20). Bara det
  // som VISAS (formatera, spann, klockStr) formateras med LOC.
  function datumStr(d) { return d.toLocaleDateString('sv-SE', { timeZone: TZ }); }
  function arStr(d) { return d.toLocaleDateString('sv-SE', { timeZone: TZ, year: 'numeric' }); }
  function klockStr(d) { return d.toLocaleTimeString(LOC, { timeZone: TZ, hour: '2-digit', minute: '2-digit' }); }

  function dagenFore(iso) {
    var a = iso.split('-');
    var d = new Date(Date.UTC(Number(a[0]), Number(a[1]) - 1, Number(a[2])));
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  // "i dag 14:25", "i går 09:12", annars "17 sep 14:25" — och med årtal när
  // skanningen är från ett annat år än i dag.
  function formatera(d) {
    if (!d || isNaN(d.getTime())) return '';
    var nu = new Date();
    var dag = datumStr(d), idag = datumStr(nu);
    var kl = klockStr(d);
    if (dag === idag) return C.idag + ' ' + kl;
    if (dag === dagenFore(idag)) return C.igar + ' ' + kl;
    var alt = { timeZone: TZ, day: 'numeric', month: 'short' };
    if (arStr(d) !== arStr(nu)) alt.year = 'numeric';
    return d.toLocaleDateString(LOC, alt).replace(/\./g, '') + ' ' + kl;
  }

  // ------------------------------------------------------------- adressen
  // Kunden kommer från mejlet med ?nummer=YT…. Numret läses också ur
  // #-delen (#nummer=YT… eller bara #YT…) — en del mejlklienter och
  // omdirigeringar tappar frågesträngen men behåller ankaret.
  function nummerUrAdressen() {
    // decodeURIComponent KASTAR på trasig procentkodning ("?nummer=YT1%").
    // En mejlklient eller en omdirigering kan kapa adressen mitt i, och ett
    // ofångat fel här hade lämnat kunden med en helt tom sida.
    var avkoda = function (s) { try { return decodeURIComponent(s); } catch (e) { return s; } };
    var ur = function (s) {
      if (!s) return '';
      var m = /(?:^|[?&#])(?:nummer|tracking|n)=([^&#]+)/i.exec(s);
      if (m) return avkoda(m[1]);
      return '';
    };
    var q = ur(location.search) || ur(location.hash);
    if (q) return q;
    var h = String(location.hash || '').replace(/^#/, '');
    if (h && h.indexOf('=') < 0) return avkoda(h);
    return '';
  }

  // Skriver numret i adressen så kunden kan spara eller dela länken. Övriga
  // parametrar behålls — butiken är flermarknads, och tappas ?country=NO
  // byter nästa klick land och valuta åt kunden.
  function skrivAdress(n) {
    try {
      var delar = String(location.search || '').replace(/^\?/, '').split('&').filter(function (d) {
        return d && !/^(?:nummer|tracking|n)=/i.test(d);
      });
      delar.push('nummer=' + encodeURIComponent(n));
      history.replaceState(null, '', location.pathname + '?' + delar.join('&'));
    } catch (e) {}
  }

  // ---------------------------------------------------------------- vyerna
  var sok = $('bbs-sok'), traff = $('bbs-traff'), saknas = $('bbs-saknas');
  var falt = $('bbs-falt'), form = $('bbs-form'), fel = $('bbs-fel');
  var tomrad = $('bbs-tom'), annat = $('bbs-annat');
  var stegruta = $('bbs-steg'), avvikelse = $('bbs-avvikelse');

  // saknat = numret slogs upp men fanns inte (då visas rutan som förklarar
  // varför). felText = en rad rakt ovanför fältet, t.ex. vid tomt fält.
  // Fältet får fokus bara efter ett misslyckat försök — att flytta fokus vid
  // sidladdning drar upp tangentbordet på mobilen och hoppar förbi rubriken.
  function visaSok(forifyllt, saknat, felText) {
    visaEl(traff, false); visaEl(annat, false);
    visaEl(saknas, !!saknat);
    visaEl(sok, true);
    fel.textContent = felText || '';
    visaEl(fel, !!felText);
    if (forifyllt) falt.value = forifyllt;
    if (saknat || felText) { try { falt.focus(); } catch (e) {} }
  }

  // En punkt i sammanfattningen. Nådda skeden bär datum och ort; de som
  // återstår står kvar i grått, så kunden ser vad som händer sedan i stället
  // för att undra om något saknas.
  //
  // Ortsfältet s.plats är redan filtrerat av sammanfattning() i uppacka.mjs —
  // utländska orter och terminalnamn kommer aldrig hit. Filtrera inte om här.
  //
  // Argumentet "extra" är en frivillig underrad ("Ute för leverans 17 sep
  // 14:41") som används när utkörningsskedet vävs in i ankomstraden.
  function stegrad(s, arNu, extra) {
    var li = document.createElement('li');
    li.className = 'bbs-stegrad' + (s.nadd ? ' bbs-stegrad--nadd' : '') + (arNu ? ' bbs-stegrad--nu' : '');

    // Linjen som fylls vid inladdning. Den ligger ovanpå radens grå kant och
    // växer till full höjd när listan får klassen bbs-steg--rullar.
    var linje = document.createElement('span');
    linje.className = 'bbs-linje';
    li.appendChild(linje);

    var ikon = document.createElement('span');
    ikon.className = 'bbs-stegikon';
    ikon.appendChild(rita(ikonFor(s)));
    li.appendChild(ikon);

    // Paketet som färdas längs linjen — bara på det skede som pågår NU, och
    // bara medan resan faktiskt fortsätter (aldrig på "Levererat").
    //
    // ⚠️ Motivet är ALLTID paketet, aldrig skedets ikon. Det är kundens
    // paket som rör sig; en tullstämpel som glider nedför linjen läser som
    // ett fel. Skedets egen ikon visar i stället VAR paketet är just nu.
    if (arNu && s.nadd && s.nyckel !== 'levererat') {
      var resa = document.createElement('span');
      resa.className = 'bbs-resa';
      resa.setAttribute('aria-hidden', 'true');
      resa.appendChild(rita(s.nyckel === 'utkorning' ? 'lastbil' : 'lada'));
      li.appendChild(resa);
    }

    var namn = document.createElement('p');
    namn.className = 'bbs-stegnamn';
    namn.textContent = ord(s.etikett);
    li.appendChild(namn);
    if (s.nadd) {
      var tid = document.createElement('time');
      tid.className = 'bbs-stegtid';
      tid.setAttribute('datetime', s.iso);
      tid.textContent = formatera(s.tid);
      li.appendChild(tid);
      // Orten i egen nod: datumet står i versaler som på resten av sidan, men
      // ett ortnamn i versaler skriks ut ("MALMÖ", "UMEÅ") och ser billigt ut.
      if (s.plats) {
        var ort = document.createElement('span');
        ort.className = 'bbs-stegort';
        ort.textContent = s.plats;
        tid.appendChild(document.createTextNode(' · '));
        tid.appendChild(ort);
      }
      // Var på resan paketet är. Egen rad, inte inbakad i datumet: det är
      // den upplysning kunden faktiskt är ute efter medan paketet är borta.
      if (s.delstegEtikett) {
        var del = document.createElement('span');
        del.className = 'bbs-stegdel';
        del.appendChild(rita(s.delstegIkon || 'lada'));
        var dtext = document.createElement('span');
        dtext.textContent = ord(s.delstegEtikett);
        del.appendChild(dtext);
        li.appendChild(del);
      }
      if (extra) {
        var u = document.createElement('span');
        u.className = 'bbs-stegtid bbs-stegextra';
        u.textContent = extra;
        li.appendChild(u);
      }
      // Det AKTIVA skedet får den senaste skanningen under sig, men bara när
      // paketet faktiskt rört sig sedan skedet nåddes. Annars hade raden
      // upprepat samma tid två gånger.
      if (arNu && s.senastIso && s.senastIso !== s.iso) {
        var sen = document.createElement('time');
        sen.className = 'bbs-stegtid bbs-stegsenast';
        sen.setAttribute('datetime', s.senastIso);
        sen.textContent = C.senast.replace('{{tid}}', formatera(s.senastTid));
        li.appendChild(sen);
      }
    }
    return li;
  }

  // Orten en ENSKILD skanning får visa i standardvyn (ingressen och
  // avvikelseraden). Samma regel som sammanfattning() i uppacka.mjs, men på
  // en skanning i stället för ett skede: ligger den utanför mottagarlandet är
  // den ett utländskt terminalnamn och stryks. Saknas landet visas orten —
  // landFor() känner bara de svenska orter som mätts, så en okänd ort är
  // oftast en svensk ort och aldrig ett land vi kunnat läsa ut.
  //
  // ⚠️ Undantag: skanningar FÖRE ankomsten till mottagarlandet visar aldrig
  // ort, även när landet är okänt — det är där "Hongqiao" bor.
  // ⚠️ Argumentet "strang" krävs för avvikelseraden. En avvikelse bär inget skede
  // (steg.mjs ger den -1, en störning är inte framsteg), så skedesspärren
  // nedan biter inte på den. Utan det stränga läget skrev returrutan
  // "Paketet skickas tillbaka till avsändaren (Hongqiao)" — mätt på ett
  // riktigt paket 2026-09-20. I strängt läge måste landet vara KÄNT och
  // vara mottagarlandet; annars ingen ort alls.
  function ortIVyn(h, land, strang) {
    if (!h || !h.plats) return null;
    if (h.plats === land) return null;
    if (strang) return h.land && land && h.land === land ? h.plats : null;
    if (h.land && land && h.land !== land) return null;
    if (typeof h.steg === 'number' && h.steg >= 0 && h.steg < I_LANDET_NR) return null;
    return h.plats;
  }

  // Motiven. Varje ikon är en lista med path-data i ett 24x24-rutnät, ritade
  // med createElementNS i stället för en HTML-sträng — sidan sätter aldrig
  // uppmärkning från text, och den regeln gäller även våra egna konstanter.
  var IKONER = {
    kvitto: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6', 'M9 12h6'],
    lada: ['M3 8l9-4 9 4v8l-9 4-9-4z', 'M3 8l9 4 9-4', 'M12 12v8'],
    stampel: ['M9 3h6v5a3 3 0 0 0 3 3H6a3 3 0 0 0 3-3z', 'M4 15h16v4H4z'],
    flygplats: ['M3 20h18', 'M5 20V9l7-5 7 5v11', 'M10 20v-5h4v5'],
    flyg: ['M2 13l20-7-7 20-3-8z', 'M12 18l-1 4 3-3'],
    lager: ['M3 21V9l9-6 9 6v12', 'M9 21v-7h6v7'],
    lastbil: ['M2 7h11v9H2z', 'M13 10h4l4 3v3h-8z', 'M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'M18 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
    brevlada: ['M3 10a5 5 0 0 1 10 0v7H3z', 'M13 17h8v-7a5 5 0 0 0-5-5h-3', 'M17 8h2', 'M7 21v-4'],
  };

  function rita(namn) {
    var banor = IKONER[namn] || IKONER.lada;
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    for (var i = 0; i < banor.length; i++) {
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', banor[i]);
      svg.appendChild(p);
    }
    return svg;
  }

  // Vilket motiv bär skedet? Delskedet vinner när det finns, så raden
  // "På väg till Sverige" visar var paketet FAKTISKT är.
  function ikonFor(s) {
    if (s.delstegIkon) return s.delstegIkon;
    return (C.ikoner && C.ikoner[s.nyckel]) || 'lada';
  }

  // Beräknad leverans: avsändningsdagen + löftet kunden redan fått i mejlen.
  //
  // ⚠️ Ankaret är den FÖRSTA skanningen i "Paketet är på väg", alltså när
  // fraktbolaget faktiskt fick paketet — inte bokningen, som ligger dygn före.
  //
  // Mätt 2026-09-22 på 879 levererade paket: från "på väg" till levererat är
  // medianen 10,1 dygn (p25 9,2 · p90 12,2), och fönstret 7–14 träffar 96 %.
  // Ankaret är alltså rätt — så länge skedet finns.
  //
  // ⚠️ FALLBACKEN VAR FÖR TIDIG, rättad samma dag (Axel: "visar något
  // förtidigt estimerat leveransdatum"). Har paketet ännu inte nått "på väg"
  // användes BOKNINGEN som ankare, och den gamla kommentaren här påstod att
  // fönstret då blev "försiktigt brett, inte snävt". Det var bakvänt: ett
  // TIDIGARE ankare ger ett TIDIGARE datum. Dröjsmålet bokning → första
  // rörelse är i median 4,1 dygn (p25 2,6 · p90 7,3) på samma 879 paket, så
  // de paketen fick ett löfte som låg fyra dygn fel åt optimistiska hållet —
  // och det gällde 383 av de 1 165 paket som var på väg vid mätningen, alltså
  // var tredje.
  //
  // Därför läggs medianen på när bokningen är allt vi har. Den är mätt, inte
  // vald: ett paket som just bokats beter sig som de 879 gjorde.
  var DROJSMAL_DYGN = 4;
  //
  // ⚠️ Räknas i KALENDERDAGAR, som löftet i mejlen. Ingen avrundning åt något
  // håll, och inga helgdagar — vi har ingen kalender för fraktbolagets
  // arbetsdagar och ska inte låtsas ha en.
  function fonster(p) {
    if (!C.levMin || !C.levMax) return null;
    var s = p.sammanfattning && p.sammanfattning.steg ? p.sammanfattning.steg : [];
    var ankare = null;
    for (var i = 0; i < s.length; i++) {
      if (s[i].nyckel === 'pa_vag' && s[i].nadd) { ankare = s[i].tid; break; }
    }
    var franBokningen = false;
    if (!ankare) {
      for (var j = 0; j < s.length; j++) if (s[j].nyckel === 'bestalld' && s[j].nadd) { ankare = s[j].tid; franBokningen = true; break; }
    }
    if (!ankare || isNaN(ankare.getTime())) return null;
    var noll = ankare.getTime() + (franBokningen ? DROJSMAL_DYGN * 86400000 : 0);
    var fran = new Date(noll + C.levMin * 86400000);
    var till = new Date(noll + C.levMax * 86400000);
    return { fran: fran, till: till, sen: Date.now() > till.getTime() };
  }

  // "25–28 sep" — och med månad på båda när de skiljer sig.
  function spann(a, b) {
    var alt = { timeZone: TZ, day: 'numeric', month: 'short' };
    var ettA = a.toLocaleDateString(LOC, alt).replace(/\./g, '');
    var ettB = b.toLocaleDateString(LOC, alt).replace(/\./g, '');
    var m = { timeZone: TZ, month: 'short' };
    if (a.toLocaleDateString(LOC, m) === b.toLocaleDateString(LOC, m)) {
      return a.toLocaleDateString(LOC, { timeZone: TZ, day: 'numeric' }) + '–' + ettB;
    }
    return ettA + ' – ' + ettB;
  }

  function visaLeverans(p) {
    var ruta = $('bbs-leverans');
    ruta.textContent = '';
    ruta.className = 'bbs-leverans';
    // Framme ⇒ ingen prognos. Är paketet levererat eller ligger och väntar
    // hos ombudet är en beräknad leveransdag inaktuell och bara förvirrande —
    // kunden ska hämta det, inte vänta på det.
    var klar = p.statusKod === 'DELIVERED' || p.statusKod === 'READY_FOR_PICKUP';
    var f = klar ? null : fonster(p);
    if (!f) { visaEl(ruta, false); return; }
    var et = document.createElement('span');
    et.className = 'bbs-levetikett';
    et.textContent = f.sen ? C.leveransSen : C.leverans;
    ruta.appendChild(et);
    var d = document.createElement('span');
    d.className = 'bbs-levdatum';
    d.textContent = spann(f.fran, f.till);
    ruta.appendChild(d);
    if (f.sen) {
      ruta.className = 'bbs-leverans bbs-leverans--sen';
      var t = document.createElement('span');
      t.className = 'bbs-levtext';
      t.textContent = C.leveransSenText.split('{{datum}}').join(spann(f.fran, f.till));
      ruta.textContent = '';
      ruta.appendChild(et);
      ruta.appendChild(t);
    }
    visaEl(ruta, true);
  }

  function visaPaket(p) {
    visaEl(sok, false); visaEl(saknas, false); visaEl(traff, true); visaEl(annat, true);
    visaLeverans(p);
    $('bbs-rubrik').textContent = C.rubriker[p.statusKod] || ord(p.status) || C.reservrubrik;

    // Ingressen bär fraktbolagets senaste text. Den STÅR KVAR med flit: den
    // är det enda på sidan som rör sig under den internationella sträckan,
    // som tar 4–9 dygn. Bara ORTEN stryks, och bara när skanningen skedde
    // utanför mottagarlandet — då är den ett utländskt terminalnamn.
    var forsta = p.handelser.length ? p.handelser[0] : null;
    var ingressort = ortIVyn(forsta, p.land);
    var ingress = forsta ? forsta.text + (ingressort ? ' (' + ingressort + ')' : '') : '';
    $('bbs-ingress').textContent = ingress;
    visaEl($('bbs-ingress'), !!ingress);
    // ⚠️ Fraktbolagets namn (YunExpress, 4PX) och dess nummer (YT…, 4PX…)
    // skrivs INTE ut. Axels beslut 2026-09-20: kunden ska inte se var
    // paketet kommer ifrån. Båda finns kvar i datan — historiken bakom
    // "Mer information" är oförändrad — men vyn visar bävernumret.
    $('bbs-nummer').textContent = p.baver || p.nummer;

    // Sista biten i Sverige: vem som kör hem paketet och vad det heter hos
    // dem. Länken pekar rakt på paketet när vi har en PROVAD djuplänk, annars
    // på bolagets egen spårningssida — numret står bredvid så kunden kan
    // klistra in det. En gissad djuplänk som ger 404 mitt i en leverans är
    // värre än ingen länk alls.
    var sista = $('bbs-sista');
    sista.textContent = '';
    var sb = p.sistaBiten;
    if (sb && sb.namn) {
      var et = document.createElement('span');
      et.className = 'bbs-sistaetikett';
      et.textContent = C.sistaRubrik.split('{{land}}').join(p.land || '');
      sista.appendChild(et);
      if (sb.lank) {
        var a = document.createElement('a');
        a.setAttribute('href', sb.lank);
        a.setAttribute('rel', 'noopener');
        a.setAttribute('target', '_blank');
        a.textContent = (sb.djuplank ? C.sistaLank : C.sistaUtanLank).split('{{bolag}}').join(sb.namn);
        sista.appendChild(a);
      } else {
        var b = document.createElement('strong');
        b.textContent = sb.namn;
        sista.appendChild(b);
      }
      if (sb.nummer) {
        sista.appendChild(document.createTextNode(' · '));
        var nr = document.createElement('span');
        nr.className = 'bbs-sistanr';
        nr.textContent = sb.nummer;
        sista.appendChild(nr);
      }
    }
    // ⚠️ BARA när paketet ligger och väntar på att hämtas. Axels beslut
    // 2026-09-20: annars kan kunden slå upp bolagets eget nummer hos t.ex.
    // CityMail och se hela kedjan från Kina. När paketet ska hämtas behöver
    // hen däremot numret — då väger nyttan tyngre.
    visaEl(sista, Boolean(sb && sb.namn && p.statusKod === 'READY_FOR_PICKUP'));

    // Avvikelser göms inte bland punkterna — en retur eller ett misslyckat
    // leveransförsök är det enda kunden bryr sig om just då. Orten stryks
    // med samma regel; frasen säger redan "till avsändaren".
    var avv = p.avvikelser && p.avvikelser.length ? p.avvikelser[0] : null;
    var avvort = ortIVyn(avv, p.land, true);
    avvikelse.textContent = avv ? avv.text + (avvort ? ' (' + avvort + ')' : '') : '';
    visaEl(avvikelse, !!avv);

    // Sammanfattningen: leveransens milstolpar.
    var s = p.sammanfattning && p.sammanfattning.steg ? p.sammanfattning.steg : [];
    stegruta.textContent = '';
    // (Variabeln hette en gång "rad" och skuggade historikens rad() i hela
    // visaPaket — kunden fick "Vi hittar inte det numret". Historiken är
    // borta sedan 2026-09-20, namnet stegpost står kvar av tydlighet.)
    // Fem rader, alltid. Axels val 2026-09-20 ("jag kör gärna på 5 steg").
    // Varianten som vävde in utkörningen i ankomstraden är borttagen.
    for (var k = 0; k < s.length; k++) {
      var stegpost = s[k];
      stegruta.appendChild(stegrad(stegpost, stegpost.nr === p.sammanfattning.nu));
    }
    visaEl(stegruta, s.length > 0 && p.handelser.length > 0);

    // Linjerna ritas tomma och fylls sedan, så kunden SER hur långt paketet
    // kommit i stället för att bara läsa det. Klassen sätts i nästa
    // bildruta, annars hinner webbläsaren aldrig se utgångsläget och
    // övergången uteblir. Sidan är statisk — animationen visar historik, och
    // får aldrig se ut som att något händer live.
    stegruta.className = 'bbs-steg bbs-steg--ikoner';
    try {
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { stegruta.className = 'bbs-steg bbs-steg--ikoner bbs-steg--rullar'; });
      });
    } catch (e) { stegruta.className = 'bbs-steg bbs-steg--ikoner bbs-steg--rullar'; }

    // ⚠️ Ingen fullständig historik längre (Axels beslut 2026-09-20 kväll,
    // "B — bort med mer information"): den listade Kina och Nederländerna
    // rad för rad, och det var hela poängen med bävernumret att inte peka ut
    // avsändarlandet. Rådatan ligger kvar i D (kontroll.mjs mäter den), men
    // kunden ser bara de fem punkterna.

    tomrad.textContent = C.tom;
    visaEl(tomrad, p.handelser.length === 0);
  }

  // Bävernummer → spårningsnummer. Byggs en gång, vid första uppslaget.
  // Kunden har numret ur mejlet; gamla mejl bär fortfarande YT-numret och
  // ska fortsätta fungera, så båda slås upp.
  var baverIndex = null;
  function viaBaver(n) {
    if (!baverIndex) {
      baverIndex = {};
      for (var k in D.k) {
        if (!Object.prototype.hasOwnProperty.call(D.k, k)) continue;
        var hex = D.k[k][3];
        // Prefixet ur datan (D.bp): CaraShells kunder skriver CS-…, inte BB-….
        if (typeof hex === 'string' && hex) baverIndex[baverNyckel(hex, D.bp)] = k;
      }
    }
    return Object.prototype.hasOwnProperty.call(baverIndex, n) ? baverIndex[n] : null;
  }

  function slaUpp(nr, franAdressen) {
    var n = nyckel(nr);
    var somBaver = n ? viaBaver(n) : null;
    if (somBaver) n = somBaver;
    if (!n) { visaSok(String(nr || ''), false, franAdressen ? '' : C.tomtFalt); return; }
    // En skadad post i datan (en händelse utan minut ⇒ minutTillIso() kastar
    // på en ogiltig tid) får inte tömma sidan. Kunden får då samma vänliga
    // ruta som ett okänt nummer, med adressen till kundtjänst.
    try {
      var p = packaUppEtt(D, n);
      if (!p) { visaSok(n, true, ''); return; }
      visaPaket(p);
    } catch (e) { visaSok(n, true, ''); return; }
    if (!franAdressen) skrivAdress(n);
    try { rot.scrollIntoView({ block: 'start' }); } catch (e) {}
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    slaUpp(falt.value, false);
  });
  // Kunden bad uttryckligen om att söka igen: töm fältet (annars står det
  // gamla numret kvar och måste raderas för hand) och ge det fokus. Det är
  // ett klick, inte en sidladdning, så tangentbordet ska upp.
  annat.addEventListener('click', function () {
    falt.value = '';
    visaSok('', false, '');
    try { falt.focus(); } catch (e) {}
  });

  // Datans ålder — kunden ska veta att sidan inte är sekundfärsk. En byggd
  // som inte är ett tal ger en ogiltig tid, och minutTillIso() kastar då;
  // raden är en upplysning och får aldrig fälla hela sidan.
  var byggd = $('bbs-byggd');
  if (D && typeof D.byggd === 'number' && isFinite(D.byggd)) {
    try {
      byggd.textContent = C.uppdaterad.replace('{{tid}}', formatera(new Date(minutTillIso(D.byggd))));
      visaEl(byggd, true);
    } catch (e) {}
  }

  var start = nummerUrAdressen();
  if (start) slaUpp(start, true); else visaSok('', false, '');
}
`;
}

// ---------------------------------------------------------------------------
// Sidkroppen
// ---------------------------------------------------------------------------

// `data` är objektet ur `sparning/paketdata.mjs` byggData().data, alltså
// exakt formatet `sparning/uppacka.mjs` beskriver. `konfig` är mejlens
// konfiguration (`mejl/konfig.json`) eller ett utsnitt av den.
export function byggSidkropp(data, konfig) {
  if (!data || typeof data !== 'object' || !data.k) {
    throw new Error('byggSidkropp(): datan saknar `k` — det är inte paketdatan ur sparning/paketdata.mjs.');
  }
  const c = lasKonfig(konfig);
  // Samma eskapning som lyckohjulet: "</" i en JSON-sträng skulle stänga
  // <script>-taggen mitt i datan och tömma sidan. En ortsträng från ett
  // fraktbolag kan innehålla vad som helst.
  const json = JSON.stringify(data).replace(/<\//g, '<\\/');
  const copy = JSON.stringify(copydata(c)).replace(/<\//g, '<\\/');
  const mail = esk(c.support);
  const T = c.T;
  const prefixKort = c.prefix.replace(/-+$/, '');
  // Kunden får leveransmejlet i samma sekund som ordern skickas, men sidan
  // hämtar nya paket en gång i timmen — klickar hen direkt finns numret inte
  // här än. Det är den vanligaste orsaken till "hittar inte", inte ett
  // felskrivet nummer (Axels test 2026-09-20 kväll).
  const vantetid = ' ' + T('Fick du leveransmejlet nyss? Då är paketet på väg in här — sidan hämtar nya paket varje timme, så prova igen om en liten stund.');
  return `<div id="bb-spar">
<style>${stil(c)}</style>
<noscript><p class="bbs-noscript"><span data-t="Den här sidan behöver JavaScript för att visa din spårning. Slå på det i webbläsaren och ladda om sidan, eller mejla">${T('Den här sidan behöver JavaScript för att visa din spårning. Slå på det i webbläsaren och ladda om sidan, eller mejla')}</span> <a href="mailto:${mail}">${mail}</a> <span data-t="så kollar vi paketet åt dig.">${T('så kollar vi paketet åt dig.')}</span></p></noscript>
<div id="bbs-sok" class="bbs-ruta" hidden>
  <p class="bbs-etikett" data-t="Spårning">${T('Spårning')}</p>
  <h2 data-t="Spåra ditt paket">${T('Spåra ditt paket')}</h2>
  <p id="bbs-fel" class="bbs-fel" hidden></p>
  <form id="bbs-form" novalidate>
    <label for="bbs-falt" data-t="Skriv in ditt paketnummer">${T('Skriv in ditt paketnummer')}</label>
    <input id="bbs-falt" class="bbs-falt" name="nummer" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="${esk(c.prefix)}3F7A2C1D">
    <button type="submit" class="bbs-knapp" data-t="Visa paketet">${T('Visa paketet')}</button>
  </form>
  <p class="bbs-hjalp" data-t="Paketnumret börjar med {{prefix}} och står i ditt leveransmejl, under knappen Spåra paketet. Har du ett spårningsnummer från fraktbolaget fungerar det också. Mellanslag och bindestreck spelar ingen roll.">${esk(T('Paketnumret börjar med {{prefix}} och står i ditt leveransmejl, under knappen Spåra paketet. Har du ett spårningsnummer från fraktbolaget fungerar det också. Mellanslag och bindestreck spelar ingen roll.').split('{{prefix}}').join(prefixKort))}</p>
</div>
<div id="bbs-saknas" class="bbs-ruta" hidden>
  <h2 data-t="Vi hittar inte det numret">${T('Vi hittar inte det numret')}</h2>
  <p><span data-t="Kontrollera att hela numret kom med när du klistrade in det.">${T('Kontrollera att hela numret kom med när du klistrade in det.')}</span> <span data-t="Fick du leveransmejlet nyss? Då är paketet på väg in här — sidan hämtar nya paket varje timme, så prova igen om en liten stund.">${vantetid.trim()}</span></p>
  <p><span data-t="Stämmer numret och det ändå inte syns här: mejla">${T('Stämmer numret och det ändå inte syns här: mejla')}</span> <a href="mailto:${mail}">${mail}</a> <span data-t="så letar vi upp paketet åt dig.">${T('så letar vi upp paketet åt dig.')}</span></p>
  <p class="bbs-hjalprad"><a href="/" data-hem data-t="Till butiken">${T('Till butiken')}</a></p>
</div>
<div id="bbs-traff" hidden>
  <p class="bbs-etikett" data-t="Spårning">${T('Spårning')}</p>
  <h2 id="bbs-rubrik"></h2>
  <p id="bbs-ingress" class="bbs-ingress" hidden></p>
  <p id="bbs-leverans" class="bbs-leverans" hidden></p>
  <dl class="bbs-fakta">
    <div><dt data-t="Ditt paketnummer">${T('Ditt paketnummer')}</dt><dd id="bbs-nummer"></dd></div>
  </dl>
  <p id="bbs-sista" class="bbs-sista" hidden></p>
  <p id="bbs-tom" hidden></p>
  <p id="bbs-avvikelse" class="bbs-avvikelse" hidden></p>
  <ol id="bbs-steg" class="bbs-steg" hidden></ol>
  <p class="bbs-hjalprad"><span data-t="Undrar du något om leveransen? Mejla">${T('Undrar du något om leveransen? Mejla')}</span> <a href="mailto:${mail}">${mail}</a>.</p>
${erbjudandeBlock(c)}</div>
<button type="button" id="bbs-annat" class="bbs-knapp bbs-knapp--tunn bbs-knapp--liten" hidden data-t="Spåra ett annat nummer">${T('Spåra ett annat nummer')}</button>
<p id="bbs-byggd" class="bbs-byggd" hidden></p>
<script type="application/json" ${DATAMARKOR}>${json}</script>
<script type="application/json" ${COPYMARKOR}>${copy}</script>
<script>(function(){"use strict";
${uppackarkalla()}
${skript()}
})();</script>
</div>`;
}

// Fristående dokument för skärmdump och ögonkoll utan Shopify. Samma kropp,
// tomt dokument runtom. Sidan hämtar ingenting från nätet, så den ser exakt
// likadan ut här som i butiken — bortsett från temats typsnitt, som ärvs av
// butiken men inte finns här.
export function byggForhandsvisning(data, konfig) {
  return `<!DOCTYPE html>
<html lang="${lasKonfig(konfig).html}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esk(lasKonfig(konfig).T('Spåra ditt paket'))}</title>
<style>body{margin:0;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;background:#f7f7f7}.rte{background:#fff;padding:24px 16px;max-width:760px;margin:0 auto}</style></head>
<body><div class="rte">${byggSidkropp(data, konfig)}</div></body></html>`;
}
