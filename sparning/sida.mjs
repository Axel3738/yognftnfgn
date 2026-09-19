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
  return {
    support: butik.support ?? k.support ?? STANDARDSUPPORT,
    rod: butik.farg_rod ?? k.farg_rod ?? STANDARDSTIL.rod,
    svart: butik.farg_svart ?? k.farg_svart ?? STANDARDSTIL.svart,
    ram: butik.farg_ram ?? k.farg_ram ?? STANDARDSTIL.ram,
    font: butik.font_rubrik ?? k.font_rubrik ?? STANDARDSTIL.font,
    vaknar: vaknar ? String(vaknar).trim() : null,
  };
}

// Texten för ett paket som är registrerat men aldrig skannat. Meningen om
// väntetiden byggs bara när konfigurationen gett en.
function tomtext(vaknar) {
  const bas = 'Paketet är bokat. Fraktbolaget har inte skannat det än';
  return vaknar ? `${bas} — det brukar ta ${vaknar}.` : `${bas}.`;
}

// Texterna som skriptet behöver. Allt annat står i HTML:en, så det går att
// läsa och rätta utan att gräva i JavaScript.
function copydata(c) {
  return {
    idag: 'i dag',
    igar: 'i går',
    rubriker: RUBRIKER,
    reservrubrik: 'Ditt paket',
    tom: tomtext(c.vaknar),
    // Sidan är statisk: skanningarna bakas in när rutinen bygger om den, varje
    // timme. Den hämtar ingenting själv medan kunden tittar, och får inte
    // påstå det heller — står det "hämtar" tror kunden att en uppdatering är
    // ett klick bort.
    uppdaterad: 'Uppdaterad {{tid}} · nya skanningar läggs till varje timme',
    bolag: 'Fraktbolag',
    nummer: 'Spårningsnummer',
    tomtFalt: 'Klistra in numret från leveransmejlet först.',
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
// `.bbs-lista` bär 8 px vänsterindrag av samma sorts skäl: tidslinjens punkt
// ligger på `left:-7px` i förhållande till raden, och utan indraget sticker
// den ut till vänster om #bb-spar. Ligger temats spalt kant i kant med
// skärmen blir det en vågrät scrollning på mobilen. (Resonemang, inte
// mätning — sidan har ännu inte setts i en riktig webbläsare.)
function stil(c) {
  return `
#bb-spar{--bbs-rod:${c.rod};--bbs-svart:${c.svart};--bbs-ram:${c.ram};--bbs-gra:#5b5b5b;max-width:620px;margin:0 auto;padding:0 0 28px;color:var(--bbs-svart);font-family:inherit;font-size:16px;line-height:1.5;text-align:left}
#bb-spar *{box-sizing:border-box}
#bb-spar [hidden]{display:none!important}
#bb-spar h2{font-family:${c.font};font-weight:400;text-transform:uppercase;letter-spacing:.5px;font-size:30px;line-height:1.1;margin:0 0 10px;color:var(--bbs-svart)}
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
#bb-spar .bbs-knapp{display:block;width:100%;min-height:52px;padding:14px 20px;background:var(--bbs-rod);color:#fff;border:0;border-radius:0;font-family:${c.font};font-size:21px;letter-spacing:1px;text-transform:uppercase;line-height:1.2;text-align:center;text-decoration:none;cursor:pointer}
#bb-spar .bbs-knapp:hover{background:#b81616;color:#fff;text-decoration:none}
#bb-spar .bbs-knapp--tunn{background:#fff;color:var(--bbs-svart);border:2px solid var(--bbs-svart);font-size:17px;min-height:48px}
#bb-spar .bbs-knapp--tunn:hover{background:var(--bbs-ram);color:var(--bbs-svart)}
#bb-spar .bbs-fel{color:var(--bbs-rod);font-weight:700;margin:0 0 12px}
#bb-spar .bbs-fakta{display:flex;flex-wrap:wrap;gap:8px 28px;margin:0 0 18px;padding:14px 16px;border:1px solid var(--bbs-ram)}
#bb-spar .bbs-fakta div{min-width:0}
#bb-spar .bbs-fakta dt{font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--bbs-gra);margin:0 0 2px}
#bb-spar .bbs-fakta dd{margin:0;font-weight:700;word-break:break-all}
#bb-spar .bbs-lista{list-style:none;margin:8px 0 0;padding:0 0 0 8px}
#bb-spar .bbs-rad{position:relative;margin:0;padding:0 0 22px 24px;border-left:2px solid var(--bbs-ram)}
#bb-spar .bbs-rad:last-child{border-left-color:transparent;padding-bottom:0}
#bb-spar .bbs-rad::before{content:"";position:absolute;left:-5px;top:5px;width:12px;height:12px;border-radius:50%;background:var(--bbs-ram);border:2px solid #fff}
#bb-spar .bbs-rad--nu::before{left:-7px;top:2px;width:16px;height:16px;background:var(--bbs-rod)}
#bb-spar .bbs-rad--nu .bbs-text{font-weight:700}
#bb-spar .bbs-tid{display:block;font-size:13px;letter-spacing:.5px;text-transform:uppercase;color:var(--bbs-gra);margin:0 0 2px}
#bb-spar .bbs-text{margin:0}
#bb-spar .bbs-ort{margin:2px 0 0;font-size:14px;color:var(--bbs-gra)}
#bb-spar .bbs-byggd{font-size:13px;color:var(--bbs-gra);margin:20px 0 0}
#bb-spar .bbs-hjalprad{font-size:14px;color:var(--bbs-gra);margin:14px 0 0}
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
    // sökfältet och rutan med adressen till kundtjänst i stället.
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
  var TZ = 'Europe/Stockholm';
  var $ = function (id) { return document.getElementById(id); };
  var visaEl = function (el, pa) { if (el) el.hidden = !pa; };

  // ---------------------------------------------------------------- tiden
  function datumStr(d) { return d.toLocaleDateString('sv-SE', { timeZone: TZ }); }
  function arStr(d) { return d.toLocaleDateString('sv-SE', { timeZone: TZ, year: 'numeric' }); }
  function klockStr(d) { return d.toLocaleTimeString('sv-SE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }); }

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
    return d.toLocaleDateString('sv-SE', alt).replace(/\./g, '') + ' ' + kl;
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
  var lista = $('bbs-lista'), tomrad = $('bbs-tom'), annat = $('bbs-annat');

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

  function rad(h, forst) {
    var li = document.createElement('li');
    li.className = forst ? 'bbs-rad bbs-rad--nu' : 'bbs-rad';
    var tid = document.createElement('time');
    tid.className = 'bbs-tid';
    tid.setAttribute('datetime', h.iso);
    tid.textContent = formatera(h.tid);
    li.appendChild(tid);
    var text = document.createElement('p');
    text.className = 'bbs-text';
    text.textContent = h.text;
    li.appendChild(text);
    if (h.plats) {
      var ort = document.createElement('p');
      ort.className = 'bbs-ort';
      ort.textContent = h.plats;
      li.appendChild(ort);
    }
    return li;
  }

  function visaPaket(p) {
    visaEl(sok, false); visaEl(saknas, false); visaEl(traff, true); visaEl(annat, true);
    $('bbs-rubrik').textContent = C.rubriker[p.statusKod] || p.status || C.reservrubrik;
    var forsta = p.handelser.length ? p.handelser[0] : null;
    var ingress = forsta ? forsta.text + (forsta.plats ? ' (' + forsta.plats + ')' : '') : '';
    $('bbs-ingress').textContent = ingress;
    visaEl($('bbs-ingress'), !!ingress);
    $('bbs-bolag').textContent = p.bolag || '–';
    $('bbs-nummer').textContent = p.nummer;
    lista.textContent = '';
    for (var i = 0; i < p.handelser.length; i++) lista.appendChild(rad(p.handelser[i], i === 0));
    visaEl(lista, p.handelser.length > 0);
    tomrad.textContent = C.tom;
    visaEl(tomrad, p.handelser.length === 0);
  }

  function slaUpp(nr, franAdressen) {
    var n = nyckel(nr);
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
  const vantetid = c.vaknar
    ? ` Är paketet nyss skickat kan fraktbolaget ännu inte ha registrerat det — det brukar ta ${esk(c.vaknar)}.`
    : ' Är paketet nyss skickat kan fraktbolaget ännu inte ha registrerat det.';
  return `<div id="bb-spar">
<style>${stil(c)}</style>
<noscript><p class="bbs-noscript">Den här sidan behöver JavaScript för att visa din spårning. Slå på det i webbläsaren och ladda om sidan, eller mejla <a href="mailto:${mail}">${mail}</a> så kollar vi paketet åt dig.</p></noscript>
<div id="bbs-sok" class="bbs-ruta" hidden>
  <p class="bbs-etikett">Spårning</p>
  <h2>Spåra ditt paket</h2>
  <p id="bbs-fel" class="bbs-fel" hidden></p>
  <form id="bbs-form" novalidate>
    <label for="bbs-falt">Klistra in ditt spårningsnummer</label>
    <input id="bbs-falt" class="bbs-falt" name="nummer" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="YT2626100708674690">
    <button type="submit" class="bbs-knapp">Visa paketet</button>
  </form>
  <p class="bbs-hjalp">Numret står i ditt leveransmejl, under knappen Spåra paketet. Mellanslag och bindestreck spelar ingen roll.</p>
</div>
<div id="bbs-saknas" class="bbs-ruta" hidden>
  <h2>Vi hittar inte det numret</h2>
  <p>Kontrollera att hela numret kom med när du klistrade in det.${vantetid}</p>
  <p>Stämmer numret och det ändå inte syns här: mejla <a href="mailto:${mail}">${mail}</a> så letar vi upp paketet åt dig.</p>
  <p class="bbs-hjalprad"><a href="/">Till butiken</a></p>
</div>
<div id="bbs-traff" hidden>
  <p class="bbs-etikett">Spårning</p>
  <h2 id="bbs-rubrik"></h2>
  <p id="bbs-ingress" class="bbs-ingress" hidden></p>
  <dl class="bbs-fakta">
    <div><dt>Fraktbolag</dt><dd id="bbs-bolag"></dd></div>
    <div><dt>Spårningsnummer</dt><dd id="bbs-nummer"></dd></div>
  </dl>
  <p id="bbs-tom" hidden></p>
  <ol id="bbs-lista" class="bbs-lista" hidden></ol>
  <p class="bbs-hjalprad">Undrar du något om leveransen? Mejla <a href="mailto:${mail}">${mail}</a>.</p>
</div>
<button type="button" id="bbs-annat" class="bbs-knapp bbs-knapp--tunn" hidden>Spåra ett annat nummer</button>
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
<html lang="sv"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Spåra ditt paket</title>
<style>body{margin:0;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;background:#f7f7f7}.rte{background:#fff;padding:24px 16px;max-width:760px;margin:0 auto}</style></head>
<body><div class="rte">${byggSidkropp(data, konfig)}</div></body></html>`;
}
