// Fraktbolagens skanningstexter → svenska, och deras platssträngar → en ort
// kunden känner igen. Ren logik utan nät; testas i test/sprak.test.mjs.
//
// Varför filen finns: 17TRACK skickar vidare fraktbolagens egna texter rakt
// av — engelska, ofta i VERSALER, ibland ren logistikjargong ("NOA received",
// "Collected at Cargo Terminal"), ibland redan svenska från PostNord. På
// spårningssidan ska kunden aldrig se engelska.
//
// Ordboken `fraser.json` är byggd ur en MÄTNING, inte ur fantasi: 204 av
// butikens paket 2026-09-19 gav 1 873 händelser med 75 distinkta texter och
// 92 distinkta platser. Alla 75 finns i ordboken (tre par faller ihop till
// samma nyckel när punkt och versaler normaliseras bort, så 72 nycklar).
// En text som ändå saknas hamnar i `okandaFraser()` — rutinen loggar den och
// ordboken växer.
//
// ⚠️ En omätt text ska INTE gissas till något konkret. Två fall i ordboken är
// tolkade och märkta här i stället för i JSON-filen (JSON tål inga kommentarer):
//   - "No channel available" (1 träff, sub InTransit_Other) betyder i
//     YunExpress-jargong att ingen transportkanal är ledig. Svenskan säger
//     därför bara "Paketet väntar på transport" — inte varför.
//   - "NOA received" (42 träffar) läses som Notice of Arrival, alltså att
//     paketet anmälts till mottagarlandet. Det är en tolkning av förkortningen,
//     inte ett besked från fraktbolaget.
//
// Granskning 2026-09-19 rättade tre hål i genomsläppet (tester i
// test/sprak.test.mjs under rubriken "granskningen 2026-09-19"):
//   1. å/ä/ö räckte för att kalla en text svensk. En ENGELSK rad med ett
//      svenskt ortnamn i ("The item has been delivered in Åkersberga") gick
//      därför rakt ut till kunden som engelska — och räknades dessutom som
//      känd, så den hamnade aldrig i okandaFraser() och kunde aldrig upptäckas.
//      Nu krävs å/ä/ö UTAN engelska markörord. Ingen av mätningens fyra
//      svenska fraser med å/ä/ö faller på den spärren (kontrollerat mot
//      fraser-matta.json samma dag).
//   2. En okänd SVENSK text i VERSALER skickades vidare som skrik. Samma
//      källa som skriver svenska skriver också i versaler — mätningen har
//      både "The shipment item has been delivered." och "THE SHIPMENT ITEM
//      HAS BEEN DELIVERED." Versalsträngar görs nu om till Versal gemener.
//   3. Uppslagen gick rakt på objekten, så en nyckel som "constructor" gav
//      en ärvd funktion i stället för undefined — och funktionen hade nått
//      kunden som text. Alla uppslag går nu via slaUpp().

import { readFileSync } from 'node:fs';

// Ordboken: normaliserad engelsk (eller svensk) fras → svensk text.
export const FRASER = JSON.parse(readFileSync(new URL('./fraser.json', import.meta.url), 'utf8'));

// Fraser vi mött utan träff sedan modulen laddades. Nyckelordning = den
// ordning de dök upp. Rutinen skriver ut dem så ordboken kan växa.
const OKANDA = new Set();

// ---------------------------------------------------------------- normalisering

// Text → uppslagsnyckel: gemener, ett mellanslag mellan ord, utan avslutande
// punkt. Samma fras i VERSALER och gemener ger samma nyckel.
export function normalisera(text) {
  return String(text == null ? '' : text)
    .replace(/ /g, ' ')
    .replace(/[‘’]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.+$/, '')
    .trim();
}

// Putsar en text som redan är svensk: ett mellanslag mellan ord, ingen
// avslutande punkt, versal första bokstav.
function putsa(text) {
  const s = String(text == null ? '' : text).replace(/\s+/g, ' ').trim().replace(/\.+$/, '').trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Samma putsning, men en VERSALSTRÄNG görs också om till Versal gemener.
// Används bara på fraktbolagets egen svenska — ordbokens texter är redan
// skrivna med rätt skiftläge.
function putsaSvenska(text) {
  const s = putsa(text);
  if (s && s === s.toUpperCase() && /[A-ZÅÄÖ]/.test(s)) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }
  return s;
}

// Uppslag i en vanlig objektlitteral utan att ärvda nycklar ("constructor",
// "valueOf" …) slinker med. Utan det svarar LANDSNAMN['constructor'] med en
// funktion, och funktionen hade skrivits ut som text för kunden.
function slaUpp(tabell, nyckel) {
  if (!nyckel) return undefined;
  return Object.prototype.hasOwnProperty.call(tabell, nyckel) ? tabell[nyckel] : undefined;
}

const SVENSKA_TECKEN = /[åäöÅÄÖ]/;

// Ord som inte finns i svenskan. Står ett av dem i texten är raden engelsk,
// hur många å/ä/ö ortnamnet än bär. Listan är medvetet snäv: varje ord är
// kontrollerat mot att det inte också är ett svenskt ord ("is", "in", "by",
// "for" och "center" är därför INTE med — de betyder något på svenska).
const ENGELSKA_MARKORER = /\b(the|and|at|to|of|has|have|been|was|with|from|your|item|items|shipment|package|parcel|delivered|delivery|received|sender|recipient|customs|facility|airport|warehouse|courier|locker|arrived|departed|carrier|scan|clearance|clearence)\b/;

// ---------------------------------------------------------------- fraser

// 17TRACK:s sub_status → generell svensk mening, när frasen inte finns i
// ordboken. Exakt matchning först, sedan prefixet före understrecket.
const UNDERSTATUS = {
  InfoReceived: 'Vi har fått uppgifterna om paketet',
  InTransit_PickedUp: 'Paketet är upphämtat',
  InTransit_CustomsProcessing: 'Paketet ligger hos tullen',
  InTransit_CustomsReleased: 'Paketet är klart i tullen',
  InTransit_Delivering: 'Paketet är ute för leverans',
  Exception_Returned: 'Paketet har skickats tillbaka till avsändaren',
  Exception_Returning: 'Paketet skickas tillbaka till avsändaren',
};

const UNDERSTATUS_PREFIX = {
  InfoReceived: 'Vi har fått uppgifterna om paketet',
  InTransit: 'Paketet är på väg',
  OutForDelivery: 'Paketet är ute för leverans',
  AvailableForPickup: 'Paketet finns att hämta hos ombudet',
  Delivered: 'Paketet är levererat',
  DeliveryFailure: 'Leveransen misslyckades',
  Exception: 'Det har blivit ett problem med leveransen',
};

// ---------------------------------------------------------------- mönster
//
// Fraser som bär VARIABEL text och därför aldrig kan stå som nycklar i
// ordboken. Yanwens kinesiska skanningar skriver ut terminalen i 【…】, och
// upphämtningsraden bär dessutom budets NAMN och MOBILNUMMER:
//
//   您的快件在【江苏省昆山市陆家镇】已揽收，揽收人: <namn>（<telefon>）
//
// ⚠️ Den raden får ALDRIG bli en ordboksnyckel — då hade en främmande
// persons telefonnummer legat i repot. Mönstret matchar i stället på det som
// är stabilt (已揽收 = "upphämtat") och lämnar resten därhän. Samma sak för
// terminalraderna: 转运中心 är ett omlastningscenter, och vilket det är
// spelar kunden ingen roll — sidan visar ändå ingen utländsk geografi.
//
// ⚠️ Översättningarna av de kinesiska raderna är TOLKADE, inte hämtade ur
// någon dokumentation. De är medvetet generella: 转运中心 blir
// "omlastningsterminalen" utan ortsnamn, och 揽收 blir "upphämtat".
// Mätt 2026-09-20: fem sådana rader i butikens 1 055 paket, alla från Yanwen.
const MONSTER = [
  [/离开.*(转运中心|分拨中心)/, 'Paketet har lämnat omlastningsterminalen'],
  [/(到达|已到).*(转运中心|分拨中心)/, 'Paketet har kommit till omlastningsterminalen'],
  [/已揽收/, 'Paketet är upphämtat'],
  [/入库称重/, 'Paketet är invägt hos fraktbolaget'],
  [/下单成功/, 'Ordern är registrerad hos fraktbolaget'],
  [/退回客户/, 'Paketet skickas tillbaka till avsändaren'],
  [/换号失败|路由失败/, 'Fraktbolaget kunde inte uppdatera spårningen'],
];

// Fraktbolagets beskrivning → { text, kand }.
//
// kand = true när frasen fanns i ordboken, eller när den redan är svensk.
// Annars härleds en generell mening ur subStatus, och kand = false.
// Går inte det heller blir text = null — anroparen hoppar då hellre över
// händelsen än visar engelska för kunden.
export function oversattFras(beskrivning, subStatus) {
  const nyckel = normalisera(beskrivning);

  if (nyckel && Object.prototype.hasOwnProperty.call(FRASER, nyckel)) {
    return { text: putsa(FRASER[nyckel]), kand: true };
  }

  // Mönstren prövas FÖRE svenskakollen och före OKANDA: de är exakta nog att
  // räknas som kända, men kan aldrig stå som nycklar (se varningen ovan).
  const rå = String(beskrivning == null ? '' : beskrivning);
  for (const [m, svensk] of MONSTER) {
    if (m.test(rå)) return { text: svensk, kand: true };
  }

  // Redan svensk — släpps igenom som den är. PostNord skriver en del av sina
  // skanningar på svenska, och de är bättre än vår generella mening. Men å/ä/ö
  // ensamt räcker inte: engelska rader bär svenska ortnamn ("delivered in
  // Åkersberga"), och de ska INTE passera som svenska.
  if (nyckel && SVENSKA_TECKEN.test(nyckel) && !ENGELSKA_MARKORER.test(nyckel)) {
    return { text: putsaSvenska(beskrivning), kand: true };
  }

  if (nyckel) OKANDA.add(nyckel);

  const under = String(subStatus == null ? '' : subStatus).trim();
  if (under) {
    const exakt = slaUpp(UNDERSTATUS, under);
    if (exakt) return { text: exakt, kand: false };
    const prefix = slaUpp(UNDERSTATUS_PREFIX, under.split('_')[0]);
    if (prefix) return { text: prefix, kand: false };
  }

  return { text: null, kand: false };
}

// Fraserna oversattFras() mött utan träff sedan start, i den ordning de kom.
export function okandaFraser() {
  return Array.from(OKANDA);
}

// ---------------------------------------------------------------- platser

// Landskod → svenskt landsnamn. Mätta i datan: SE, NL, CN, BE. Resten är
// grannländer och avsändarländer butiken kan tänkas få — de kostar inget att
// ha med och gör att en ny marknad inte visar "PL" för kunden.
const LANDSKODER = {
  SE: 'Sverige', NO: 'Norge', DK: 'Danmark', FI: 'Finland', IS: 'Island',
  NL: 'Nederländerna', BE: 'Belgien', LU: 'Luxemburg', DE: 'Tyskland',
  FR: 'Frankrike', ES: 'Spanien', PT: 'Portugal', IT: 'Italien',
  AT: 'Österrike', CH: 'Schweiz', PL: 'Polen', CZ: 'Tjeckien',
  SK: 'Slovakien', SI: 'Slovenien', HU: 'Ungern', RO: 'Rumänien',
  BG: 'Bulgarien', GR: 'Grekland', HR: 'Kroatien', EE: 'Estland',
  LV: 'Lettland', LT: 'Litauen', IE: 'Irland', GB: 'Storbritannien',
  UK: 'Storbritannien', US: 'USA', CA: 'Kanada', AU: 'Australien',
  NZ: 'Nya Zeeland', CN: 'Kina', HK: 'Hongkong', TW: 'Taiwan',
  JP: 'Japan', KR: 'Sydkorea', SG: 'Singapore', MY: 'Malaysia',
  TH: 'Thailand', VN: 'Vietnam', IN: 'Indien', TR: 'Turkiet',
  AE: 'Förenade Arabemiraten',
};

// Landsnamn som fraktbolagen skriver ut → svenskt namn. "Mainland China" och
// "HOLLAND" är mätta i datan; resten är samma billiga beredskap som ovan.
const LANDSNAMN = {
  'mainland china': 'Kina', china: 'Kina', 'hong kong': 'Hongkong',
  sweden: 'Sverige', norway: 'Norge', denmark: 'Danmark', finland: 'Finland',
  holland: 'Nederländerna', netherlands: 'Nederländerna',
  'the netherlands': 'Nederländerna', belgium: 'Belgien',
  germany: 'Tyskland', france: 'Frankrike', spain: 'Spanien',
  italy: 'Italien', poland: 'Polen', estonia: 'Estland',
  latvia: 'Lettland', lithuania: 'Litauen', 'united kingdom': 'Storbritannien',
  'great britain': 'Storbritannien', 'united states': 'USA', usa: 'USA',
  japan: 'Japan', singapore: 'Singapore', malaysia: 'Malaysia',
  thailand: 'Thailand', vietnam: 'Vietnam', india: 'Indien',
  canada: 'Kanada', australia: 'Australien', taiwan: 'Taiwan',
};

// Svenska orter som fraktbolagen skriver utan prickar eller i VERSALER.
// Nyckeln är ortnamnet utan diakriter och i versaler ("MALMO" och "MALMÖ"
// ger båda "Malmö"). Listan är de orter som faktiskt mättes 2026-09-19 —
// den ska växa med mätningen, inte med gissningar.
const ORTER = {};
for (const ort of [
  'Malmö', 'Göteborg', 'Stockholm', 'Uppsala', 'Jönköping', 'Nässjö',
  'Hallsberg', 'Torsvik', 'Veddesta', 'Järfälla', 'Sundsvall', 'Örebro',
  'Norrtälje', 'Umeå', 'Nyköping', 'Karlstad', 'Växjö', 'Kalmar',
  'Torshälla', 'Arvika', 'Linköping', 'Motala', 'Tranås', 'Västervik',
  'Skövde', 'Broby', 'Huskvarna', 'Kramfors', 'Tanumshede', 'Söderhamn',
  'Bengtsfors', 'Oskarshamn', 'Gävle', 'Gällö', 'Ånge', 'Piteå',
  'Vimmerby', 'Gimo', 'Borås', 'Nybro', 'Falköping', 'Bunkeflostrand',
  'Ystad', 'Eslöv', 'Grums', 'Hallstahammar', 'Landvetter', 'Tyresö',
  'Askim', 'Åkersberga', 'Vara', 'Örsundsbro', 'Knivsta', 'Grisslehamn',
  'Flen', 'Vendelsö', 'Bromma', 'Alingsås', 'Varberg', 'Norrköping',
  'Limhamn', 'Högsby', 'Örbyhus', 'Ljusterö', 'Hedvigsborg',
]) ORTER[utanDiakriter(ort).toUpperCase()] = ort;

// Ord som behåller sina versaler när en VERSALSTRÄNG görs om till vanlig text.
const VERSALORD = new Set(['ICA', 'COOP', 'OKQ8', 'DHL', 'PN', 'T1', 'T2']);

// Ord som betyder "terminal" — allt som står EFTER ett sådant ord är
// fraktbolagets egen ortsupprepning ("TORSVIK PAKETTERMINAL JÖNKÖPING") och
// säger kunden ingenting.
function arTerminalord(ord) {
  return /terminal$/.test(utanDiakriter(ord).toLowerCase());
}

function utanDiakriter(text) {
  return String(text).normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Platssträng från fraktbolaget → svensk ortstext, eller null när det inte
// finns något begripligt att visa.
export function stadaPlats(plats) {
  // 17TRACK skickar `location` som sträng eller null. Kommer något annat in
  // (ett objekt, en lista) är svaret null — String({}) hade annars gett
  // "[object" som ortstext på sidan.
  if (plats == null) return null;
  if (typeof plats !== 'string' && typeof plats !== 'number') return null;

  const rå = String(plats).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  if (!rå) return null;

  // "MALMO, SCHNER, SE" → delarna. Landskoden i slutet plockas bort men
  // sparas: är det allt vi har blir landet svaret.
  const delar = rå.split(',').map((d) => d.trim()).filter(Boolean);
  let land = null;
  const kvar = [];
  for (const del of delar) {
    const kod = del.toUpperCase();
    const träff = kod.length === 2 ? slaUpp(LANDSKODER, kod) : undefined;
    if (träff) land = träff;
    else kvar.push(del);
  }
  if (!kvar.length) return land;

  // Första delen är orten. Resten är fraktbolagets region- och landsrader
  // ("NORTH HOLLAND", "SCHNER") och upprepningar av samma ort.
  const forsta = kvar[0];

  const landsnamn = slaUpp(LANDSNAMN, normalisera(forsta));
  if (landsnamn) return landsnamn;

  return stadaOrt(forsta) ?? land;
}

// Vilket LAND ligger platsen i? Returnerar svenskt landsnamn, eller null när
// fraktbolaget inte gett något att gå på.
//
// `stadaPlats` kastar landet när det finns en ort ("MALMO, SCHNER, SE" →
// "Malmö"), för kunden vill läsa orten. Stegindelningen behöver landet, och
// kontrollen behöver kunna bevisa att inget land försvann på vägen — därför
// den här, som läser samma sträng men svarar på den andra frågan.
//
// Tre källor, i fallande säkerhet:
//   1. Landskod i någon kommadel ("…, SE").
//   2. Landsnamn utskrivet ("Mainland China", "SWEDEN").
//   3. Ortnamnet i ORTER — de svenska orter som FAKTISKT mätts i datan.
// Punkt 3 gäller bara Sverige: vi har ingen kinesisk ortstabell, och gissar
// aldrig ett land ur en ort vi inte känner igen.
export function landFor(plats) {
  if (plats == null) return null;
  if (typeof plats !== 'string' && typeof plats !== 'number') return null;
  const rå = String(plats).replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  if (!rå) return null;

  const delar = rå.split(',').map((d) => d.trim()).filter(Boolean);
  for (const del of delar) {
    const kod = del.toUpperCase();
    if (kod.length === 2) {
      const träff = slaUpp(LANDSKODER, kod);
      if (träff) return träff;
    }
    const namn = slaUpp(LANDSNAMN, normalisera(del));
    if (namn) return namn;
  }

  // Ortnamnet. Varje ord prövas mot ORTER, så "MALMÖ BREVTERMINAL" och
  // "Early Bird Malmö" båda ger Sverige.
  for (const ord of rå.split(/[\s,]+/)) {
    const bar = utanDiakriter(ord).toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (bar && slaUpp(ORTER, bar)) return 'Sverige';
  }
  return null;
}

// Alla länder en platssträng kan sägas nämna. Används av kontrollen: varje
// land i fraktbolagets rådata ska gå att hitta i den fullständiga historiken.
export function landerI(plats) {
  const l = landFor(plats);
  return l ? [l] : [];
}

function stadaOrt(text) {
  // "644 35 Torshälla" → "Torshälla". Postnumret säger kunden inget.
  let s = text.replace(/^\d{3}\s?\d{2}\s+/, '').trim();
  if (!s) return null;

  let ord = s.split(/\s+/);

  // Samma ord två gånger ("ROZENBURG ROZENBURG", "MALMÖ BREVTERMINAL MALMÖ").
  const sedda = new Set();
  ord = ord.filter((o) => {
    const n = utanDiakriter(o).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!n) return true;
    if (sedda.has(n)) return false;
    sedda.add(n);
    return true;
  });

  // Klipp efter terminalordet, men bara när något står före det —
  // "Terminal Malmö" ska förbli "Terminal Malmö".
  for (let i = 1; i < ord.length; i++) {
    if (arTerminalord(ord[i])) { ord = ord.slice(0, i + 1); break; }
  }

  s = ord.join(' ').trim();
  if (!s) return null;

  // VERSALER → Versal gemener. Blandad text lämnas som den är ("Early Bird
  // Malmö", "Instabox DC Växjö" skulle bara bli fulare av en omskrivning).
  if (s === s.toUpperCase() && /[A-ZÅÄÖ]/.test(s)) {
    s = s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    s = s
      .split(' ')
      .map((o) => {
        const bar = utanDiakriter(o).toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (VERSALORD.has(bar)) return o.toUpperCase();
        const ort = slaUpp(ORTER, bar);
        if (ort) return ort;
        return o;
      })
      .join(' ');
    // Versal första bokstav igen, ifall första ordet byttes mot ett ortnamn.
    s = s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Ett ensamt ord utan vokal ("SVHL") är en kod, inte en ort.
  if (!s.includes(' ') && !/[aeiouyåäöAEIOUYÅÄÖ]/.test(s)) return null;
  if (!/[a-zA-ZåäöÅÄÖ]/.test(s)) return null;

  return s;
}
