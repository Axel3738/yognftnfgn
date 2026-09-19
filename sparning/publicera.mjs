// Publicerar Bäverbutikens spårningssida som en Shopify-sida (/pages/spara).
// Idempotent på handle: finns sidan uppdateras den, annars skapas den — kör
// om hur många gånger som helst, det blir samma sida och samma adress.
//
//   node sparning/publicera.mjs [--torr] [--offline] [--fonster <dagar>] [--paket <fil>]
//
//   --torr / --offline   bygg filerna och rapportera, skriv inget till Shopify
//   --fonster <dagar>    hur långt bakåt ett pakets senaste skanning får ligga
//                        (standard: paketdata.FONSTER_DAGAR, i dag 45)
//   --paket <fil>        läs paketen ur en färdig lista i stället för ur
//                        paketminnet — det är så spårningsrundan (kor.mjs)
//                        skickar vidare skanningarna den just hämtat, utan att
//                        de behöver sparas och committas varje timme
//
// Skriver sparning/output/sida.html (sidkroppen som läggs i Shopify) och
// sparning/output/forhandsvisning.html (fristående, för skärmdump) och
// bokför datum + url i sparning/konfig.json → lage.
//
// Mönstret är mejl/hjul-publicera.mjs: skriv, läs tillbaka via API, hämta
// sedan sidan PUBLIKT med cache-buster och leta efter det som just skrevs.
// Det är trippelkollen i CLAUDE.md — säg aldrig "klart" utan kundens vy.
// Här går den två steg längre än hjulet: ett KÄNT spårningsnummer ur bygget
// ska gå att hitta i den publika datan (annars är sidan bara en tom ram), och
// datans versionsstämpel `byggd` ska vara just den här körningens — paketen
// ligger kvar mellan körningarna, så ett känt nummer finns även i en gammal
// cachad version och bevisar inte att kunden ser det som nyss skrevs.
//
// Rör ingenting i annonskonton, inga ordrar och inga temafiler. Enda skrivning
// mot Shopify är pageCreate/pageUpdate på den här handlen.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { byggData, filtreraFonster, handelserUr, FONSTER_DAGAR } from './paketdata.mjs';
import { oversattFras, stadaPlats, okandaFraser } from './sprak.mjs';
import { STATUS } from './status.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const UT = join(ROT, 'output');
const KONFIG = join(ROT, 'konfig.json');
const LAGE = join(ROT, 'lage.json');
const MEJLKONFIG = join(ROT, '..', 'mejl', 'konfig.json');

const DYGN_MS = 24 * 60 * 60 * 1000;

// Byggfunktionen i sparning/sida.mjs, och anropsformerna som provas i ordning.
// `byggSidkropp(data, konfig)` är den som finns där i dag (avläst 2026-09-19);
// de andra namnen och den andra formen finns för att en omdöpt eller omgjord
// byggfunktion ska ge ett tydligt fel i stället för en tyst trasig sida.
const BYGGNAMN = ['byggSidkropp', 'byggSida', 'byggSparningssida', 'byggSparningssidan', 'sparningssida', 'bygg', 'default'];
const FORMER = [
  ['(data, konfig)', (i) => [i.data, i.konfig]],
  ['{ konfig, data, statistik }', (i) => [i]],
];

// --- 0. Flaggor -------------------------------------------------------------

const arg = process.argv.slice(2);
const torr = arg.includes('--torr');
const offline = arg.includes('--offline');
// --torr och --offline gör samma sak här: bygget läser bara lokala filer, så
// det finns inget nät att stänga av. Båda finns ändå, så kommandoraden ser ut
// som mejl/hjul-publicera.mjs (där --offline hoppar över produkthämtningen).
const baraFiler = torr || offline;

// --paket <fil>: läs paketen ur en färdig lista i stället för ur paketminnet.
// Det är vägen spårningsrundan går. Skanningarna sparas ALDRIG i lage.json —
// 948 paket à ~9 skanningar väger 0,7 MB, och filen committas varje timme, så
// ett år hade gett 6,3 GB git-historik (räknat 2026-09-19 på repots lagefil).
// Rundan har ändå redan hämtat skanningarna från 17TRACK, så den skriver dem
// till en gitignorerad fil och skickar den hit i samma körning.
const paketIx = arg.indexOf('--paket');
const PAKETFIL = paketIx > -1 ? arg[paketIx + 1] : null;
if (paketIx > -1 && !PAKETFIL) {
  console.error('❌ --paket vill ha en sökväg till en JSON-fil med [{ nummer, bolag, statusKod, handelser }].');
  process.exit(1);
}

const fonsterIx = arg.indexOf('--fonster');
let FONSTER = null;
if (fonsterIx > -1) {
  FONSTER = Number(arg[fonsterIx + 1]);
  if (!Number.isFinite(FONSTER) || FONSTER <= 0) {
    console.error(`❌ --fonster vill ha ett antal dagar större än noll, fick "${arg[fonsterIx + 1] ?? ''}".`);
    process.exit(1);
  }
}

const NU = Date.now();

// --- 1. Konfig och löftet i mejlen ------------------------------------------

const konfig = lasJson(KONFIG, 'sidans inställningar');
const s = konfig.sida;
if (!s?.handle || !s?.titel) {
  console.error('❌ sparning/konfig.json saknar sida.handle eller sida.titel.');
  process.exit(1);
}
konfig.lage ??= {};

// Sidan och mejlen ska lova samma sak om när spårningen vaknar. Löftet bor i
// mejl/konfig.json (det är det kunden fått i brevlådan); här jämförs bara.
let mejlkonfig = null;
try {
  mejlkonfig = JSON.parse(readFileSync(MEJLKONFIG, 'utf8'));
  const dar = mejlkonfig?.frakt?.sparning_vaknar ?? null;
  const har = konfig.frakt?.sparning_vaknar ?? null;
  if (dar && har && dar !== har) {
    console.log(`⚠️ Löftet skiljer sig: mejl/konfig.json säger "${dar}", sparning/konfig.json säger "${har}". Sidan visar sitt eget värde — rätta det ena.`);
  }
} catch (fel) {
  console.log(`⚠️ Kunde inte läsa mejl/konfig.json för att jämföra löftet om spårningen: ${fel.message}`);
}

// Konfigurationen sidan byggs med: mejlens butiksblock (loggans färger och
// rubriktypsnittet bor där, i EN fil) med sparningens egna värden ovanpå.
// Därför står inga färger i sparning/konfig.json — de skulle bli en andra
// sanning och glida isär med mejlen.
const sidkonfig = {
  ...konfig,
  butik: { ...(mejlkonfig?.butik ?? {}), ...(konfig.butik ?? {}) },
  frakt: { ...(mejlkonfig?.frakt ?? {}), ...(konfig.frakt ?? {}) },
};

// Proxyn tidigt: kravProxy() kör om hela processen med NODE_USE_ENV_PROXY=1,
// så allt efter den punkten körs två gånger om den står längre ner.
let shopify = null;
if (!baraFiler) {
  shopify = await import('../mejl/shopify.mjs');
  shopify.kravProxy();
}

// --- 2. Paketminnet ---------------------------------------------------------

let paket;
let noter;
if (PAKETFIL) {
  if (!existsSync(PAKETFIL)) {
    console.error(`❌ ${PAKETFIL} saknas. --paket vill ha filen spårningsrundan just skrev.`);
    process.exit(1);
  }
  const ra = lasJson(PAKETFIL, 'paketlistan från spårningsrundan');
  const lista = Array.isArray(ra) ? ra : ra?.paket;
  if (!Array.isArray(lista)) {
    console.error(`❌ ${PAKETFIL} ska vara en lista med [{ nummer, bolag, statusKod, handelser }], eller ett objekt med fältet paket.`);
    process.exit(1);
  }
  // Samma väg in som ur paketminnet, så händelserna granskas och sorteras
  // likadant oavsett varifrån de kom. Rundan kallar fältet `statusKod` (namnet
  // i uppacka.mjs), paketminnet kallar det `status` — båda tas emot här.
  ({ paket, noter } = paketUrLage({
    paket: Object.fromEntries(lista.map((p) => [p.nummer, { ...p, status: p.statusKod ?? p.status ?? null }])),
  }));
} else {
  if (!existsSync(LAGE)) {
    console.error(`❌ ${LAGE} saknas. Spårningsrundan (node sparning/kor.mjs) skriver den — utan minnet finns inga paket att visa.`);
    process.exit(1);
  }
  ({ paket, noter } = paketUrLage(lasJson(LAGE, 'paketminnet')));
}
const medHandelser = paket.filter((p) => p.handelser.length).length;
const totaltHandelser = paket.reduce((n, p) => n + p.handelser.length, 0);
console.log(`${PAKETFIL ? 'Från spårningsrundan' : 'Paketminnet'}: ${paket.length} paket, ${medHandelser} med skanningar, ${ord(totaltHandelser, 'händelse', 'händelser')}.`);
if (noter.raOversatta) console.log(`  ${noter.raOversatta} paket bar råa 17TRACK-händelser och översattes här av sparning/sprak.mjs.`);

if (!totaltHandelser) {
  const rad = PAKETFIL
    ? `Inga händelser i ${PAKETFIL} — spårningsrundan hittade inga skanningar hos 17TRACK.`
    : 'Inga händelser i sparning/lage.json — spårningsrundan har inte sparat några skanningar än (node sparning/kor.mjs).';
  if (!baraFiler) {
    console.error(`❌ ${rad} En tom sida publiceras inte.`);
    process.exit(1);
  }
  console.log(`⚠️ ${rad} Bygget fortsätter för att det är en torrkörning.`);
}

// --- 3. Datan och sidkroppen ------------------------------------------------

// Ett fönster ur konfigen granskas lika hårt som ett från kommandoraden: ett
// nollställt eller negativt värde hade tyst tömt sidan på skanningar.
const konfigFonster = konfig.sida?.fonster_dagar ?? null;
if (konfigFonster !== null && (!Number.isFinite(konfigFonster) || konfigFonster <= 0)) {
  console.error(`❌ sparning/konfig.json → sida.fonster_dagar måste vara ett antal dagar större än noll (eller null), står som "${konfigFonster}".`);
  process.exit(1);
}

// filtreraFonster() bär sitt eget fönster (FONSTER_DAGAR). Ett eget fönster
// sätts genom att flytta klockan i filtret: gränsen är nu − FONSTER_DAGAR, så
// nu + (FONSTER_DAGAR − dagar) ger gränsen nu − dagar. Bygget självt får den
// riktiga tiden — bara filtret ser den flyttade.
const dagar = FONSTER ?? (konfigFonster ?? FONSTER_DAGAR);
const iFonster = filtreraFonster(paket, { nu: NU + (FONSTER_DAGAR - dagar) * DYGN_MS });
if (iFonster.length !== paket.length) {
  console.log(`Fönster ${dagar} dagar: ${paket.length - iFonster.length} paket föll bort (senaste skanningen är äldre).`);
}

const { data, statistik } = byggData(iFonster, { nu: NU });
for (const v of statistik.varningar.slice(0, 10)) console.log(`  ⚠️ ${v}`);
if (statistik.varningar.length > 10) console.log(`  ⚠️ … och ${ord(statistik.varningar.length - 10, 'varning till', 'varningar till')}`);

// Samma spärr som mot paketminnet, men mot det som FAKTISKT hamnar i filen.
// Fönstret sitter mellan minnet och datan: en lagefil vars skanningar alla är
// äldre än fönstret — eller ett för litet --fonster / sida.fonster_dagar —
// ger en sida där inget paket bär en enda skanning, och den ska inte gå ut
// till kunden. Kontrollen ovan såg bara minnet och släppte igenom det.
// Värre: utan ett paket med skanningar finns inget känt nummer att leta efter
// i tillbakaläsningen (valjKantNummer faller tillbaka på vilket paket som
// helst), så kundvy-kontrollen hade godkänt sig själv och sagt ✅ om en tom
// sida. (Reproducerat 2026-09-19: en lagefil med fyra skanningar och
// --fonster 0.0001 byggde en sida med 0 händelser utan en enda invändning.)
//
// `totaltHandelser` i villkoret: har paketminnet redan sagt sitt har
// kontrollen ovan antingen avbrutit eller varnat om samma tomhet, och det
// behöver inte sägas två gånger.
if ((!statistik.handelser || !statistik.paket) && totaltHandelser) {
  const rad = `Efter fönstret (${dagar} dagar) finns ${statistik.paket} paket och ${ord(statistik.handelser, 'skanning', 'skanningar')} kvar — sidan skulle visa tomma kedjor.`;
  if (!baraFiler) {
    console.error(`❌ ${rad} Höj fönstret eller kör spårningsrundan först. Inget publicerat.`);
    process.exit(1);
  }
  console.log(`⚠️ ${rad} En skarp körning hade avbrutit här; torrkörningen bygger filerna ändå.`);
}

const sidmodul = await laddaSidmodul();
const indata = { konfig: sidkonfig, data, statistik, paket: iFonster, nu: NU };
const { kropp, form } = byggKropp(sidmodul, indata);

const markor = markorer(kropp, sidmodul, s);
if (!markor.ok) {
  console.error(`❌ ${markor.fel}`);
  console.error('   Utan markör går tillbakaläsningen inte att lita på — den hade letat efter något som aldrig stod i sidan. Inget publicerat.');
  process.exit(1);
}

// --- 4. Filerna -------------------------------------------------------------

mkdirSync(UT, { recursive: true });
writeFileSync(join(UT, 'sida.html'), kropp);
writeFileSync(join(UT, 'forhandsvisning.html'), byggForhandsvisning(sidmodul, indata, kropp, form));

// Storleken mäts i BYTE, inte i tecken: sidan skickas som UTF-8 och varje
// å/ä/ö väger två byte där `String.length` räknar ett. Sidan är full av
// svenska ortnamn och fraser, så tecken hade sagt för lite.
const kB = (Buffer.byteLength(kropp, 'utf8') / 1024).toFixed(0);
console.log(`Sidan: ${kB} kB, ${statistik.paket} paket, ${ord(statistik.handelser, 'händelse', 'händelser')}, ${ord(statistik.fraser, 'fras', 'fraser')}, ${ord(statistik.platser, 'plats', 'platser')}.`);
console.log(`Markörer: sidan id="${markor.markor}", datan id="${markor.dataId}"${markor.extra.length ? `, dessutom ${markor.extra.map((i) => `id="${i}"`).join(', ')}` : ''}.`);

if (baraFiler) {
  console.log(`${torr ? '--torr' : '--offline'}: inget skrivet till Shopify. Filerna ligger i sparning/output/.`);
  rapportSlut();
  process.exit(0);
}

// --- 5. Skriv sidan ---------------------------------------------------------

// pageByHandle finns inte i det här API:t (2025-07) — sök och matcha exakt,
// precis som mejl/hjul-publicera.mjs.
const q = await shopify.graphql(`query($q: String!) { pages(first: 10, query: $q) { nodes { id handle } } }`, { q: `handle:${s.handle}` });
const finns = (q.pages?.nodes ?? []).find((n) => n.handle === s.handle) ?? null;
const sidinput = { title: s.titel, body: kropp, isPublished: true };
if (s.template_suffix) sidinput.templateSuffix = s.template_suffix;

let id;
if (finns) {
  const d = await shopify.graphql(
    `mutation($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { id handle } userErrors { field message } } }`,
    { id: finns.id, page: sidinput }
  );
  id = sidId(d?.pageUpdate, 'pageUpdate');
  console.log(`✅ Uppdaterad: ${id}`);
} else {
  const d = await shopify.graphql(
    `mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle } userErrors { field message } } }`,
    { page: { ...sidinput, handle: s.handle } }
  );
  id = sidId(d?.pageCreate, 'pageCreate');
  console.log(`✅ Skapad: ${id}`);
}

// --- 6. Tillbakaläsning 1: API:t --------------------------------------------

const tillbaka = await shopify.graphql(`query($id: ID!) { page(id: $id) { handle title templateSuffix isPublished body } }`, { id });
const p = tillbaka?.page;
if (!p) {
  console.error(`❌ Tillbakaläsningen hittade ingen sida med id ${id} — mutationen svarade OK men sidan går inte att läsa.`);
  process.exit(1);
}
if (p.handle !== s.handle || !p.isPublished) {
  console.error(`❌ Tillbakaläsning: handle=${p.handle} publicerad=${p.isPublished} (väntade ${s.handle}, publicerad).`);
  process.exit(1);
}
if (s.template_suffix && p.templateSuffix !== s.template_suffix) {
  console.error(`❌ Tillbakaläsning: mallen blev "${p.templateSuffix}", väntade "${s.template_suffix}".`);
  process.exit(1);
}
// Konfigens null betyder "rör inte mallen", inte "nolla den": en mall som
// satts i Shopify-admin får ligga kvar, men den ska synas i rapporten.
if (!s.template_suffix && p.templateSuffix) {
  console.log(`  Sidan ligger på mallen "${p.templateSuffix}" — satt i Shopify, inte här (sida.template_suffix är null).`);
}
const api = (p.body ?? '');
console.log(`Tillbakaläst via API: ${api.length} tecken (källa ${kropp.length}, skillnad ${Math.abs(api.length - kropp.length)}).`);
const saknasIApi = [markor.markor, markor.dataId, ...markor.extra].filter((i) => !api.includes(`id="${i}"`));
if (saknasIApi.length || !api.includes('<script')) {
  console.error(`❌ Shopify strök ${saknasIApi.length ? saknasIApi.map((i) => `id="${i}"`).join(', ') : 'skriptet'} ur sidkroppen. Sidan skulle inte fungera.`);
  process.exit(1);
}
const apiData = datanUr(api, markor.dataId);
if (apiData.fel) {
  console.error(`❌ Datan i API-svaret går inte att tolka: ${apiData.fel}`);
  process.exit(1);
}

// Ett nummer som finns i bygget OCH bär skanningar — det är det kunden slår
// upp, och det som avslöjar en tom eller gammal sida.
const kantNummer = valjKantNummer(data);
if (kantNummer && !harPaket(apiData.data, kantNummer)) {
  console.error(`❌ API-svaret bär inte paketet ${kantNummer} som just byggdes.`);
  process.exit(1);
}
if (apiData.data?.byggd !== data.byggd) {
  console.error(`❌ API-svaret bär ett annat bygge (byggd ${apiData.data?.byggd ?? '—'}, skrev ${data.byggd}) — sidan uppdaterades inte med det som just byggdes.`);
  process.exit(1);
}

// --- 7. Tillbakaläsning 2: kundens vy ---------------------------------------

const url = `${(konfig.butik?.url ?? 'https://baverbutiken.se').replace(/\/$/, '')}/pages/${s.handle}`;
let publik = null;
let sistaFel = 'inget försök gjort';
for (let forsok = 1; forsok <= 4; forsok++) {
  // Cache-buster: Shopifys CDN serverar annars förra versionen en stund, och
  // kontrollen nedan jämför mot det som just skrevs.
  let svar;
  try {
    svar = await fetch(`${url}?v=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
  } catch (fel) {
    sistaFel = `hämtningen misslyckades: ${fel.message}`;
    console.log(`  kundens vy försök ${forsok}: ${sistaFel}${forsok < 4 ? ' — väntar' : ''}`);
    if (forsok < 4) await paus(3000 * forsok);
    continue;
  }
  const html = await svar.text();
  const brister = [];
  if (!svar.ok) brister.push(`status ${svar.status}`);
  if (!html.includes(`id="${markor.markor}"`)) brister.push(`markören id="${markor.markor}" saknas`);
  // Textrutan (COPYMARKOR) måste också överleva: sidans skript läser den
  // direkt vid start, och utan den kastar det och kunden ser en tom ruta —
  // med markören och datan prydligt på plats.
  for (const extra of markor.extra) if (!html.includes(`id="${extra}"`)) brister.push(`id="${extra}" saknas`);
  const ute = datanUr(html, markor.dataId);
  if (ute.fel) brister.push(`datan: ${ute.fel}`);
  else {
    if (kantNummer && !harPaket(ute.data, kantNummer)) brister.push(`paketet ${kantNummer} saknas i datan`);
    // Samma BYGGE, inte bara samma paket. Paketen ligger kvar mellan
    // körningarna, så ett känt nummer finns även i gårdagens version — en
    // CDN-kopia hade alltså sluppit igenom kontrollen som säger sig jämföra
    // "mot det som just skrevs". `byggd` (minuten bygget stämplade) skiljer
    // versionerna åt, och slingan väntar ut cachen.
    if (ute.data?.byggd !== data.byggd) brister.push(`sidan är en annan version (byggd ${ute.data?.byggd ?? '—'}, väntade ${data.byggd})`);
  }
  if (!brister.length) {
    publik = { html, data: ute.data, url: svar.url };
    break;
  }
  sistaFel = brister.join(', ');
  console.log(`  kundens vy försök ${forsok}: ${sistaFel}${forsok < 4 ? ' — väntar' : ''}`);
  if (forsok < 4) await paus(3000 * forsok);
}
if (!publik) {
  console.error(`❌ ${url} visar inte sidan som den blev skriven: ${sistaFel}.`);
  console.error('   Sidan finns i Shopify men kunden ser inte det som just publicerades. Inget bokfört i konfig.json.');
  process.exit(1);
}
const uteAntal = Object.keys(publik.data?.k ?? {}).length;
console.log(`✅ Publikt: ${url} — markören finns, datan går att tolka, ${uteAntal} paket och ${kantNummer ?? '(inget nummer att prova)'} finns i kundens vy.`);
// Butiker med flera marknader skickar vidare till en annan domän beroende på
// varifrån anropet kommer (CLAUDE.md: carashell.se → .com från en amerikansk
// container). Då är det inte kundens svenska sida vi läst.
if (publik.url && !String(publik.url).startsWith(url)) {
  console.log(`⚠️ Hämtningen hamnade på ${publik.url} — en omdirigering. Kontrollen gjordes alltså på den sidan, inte på ${url}.`);
}
if (uteAntal !== statistik.paket) {
  console.log(`⚠️ Kundens vy har ${uteAntal} paket, bygget ${statistik.paket}. Sidan fungerar, men något föll bort på vägen — läs om den innan nästa körning.`);
}

// --- 8. Bokför och rapportera -----------------------------------------------

// Datumet bokförs i SVENSK tid. toISOString() ger UTC, och rutinen kör varje
// timme (CLAUDE.md) — en körning mellan midnatt och 02:00 svensk sommartid
// hade då bokförts på gårdagens datum, alltså varje natt.
konfig.lage.sida_publicerad = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' });
konfig.lage.sida_url = url;
konfig.lage.sida_matt = `${statistik.paket} paket, ${ord(statistik.handelser, 'händelse', 'händelser')}, ${kB} kB`;
writeFileSync(KONFIG, `${JSON.stringify(konfig, null, 2)}\n`);
console.log('Bokfört i sparning/konfig.json → lage.sida_publicerad och lage.sida_url.');
rapportSlut();

// ---------------------------------------------------------------------------
// Delarna
// ---------------------------------------------------------------------------

// En halvskriven JSON-fil ska ge en mening som går att agera på, inte en
// stackdump. lage.json skrivs av spårningsrundan varje timme och committas —
// en container som dör mitt i skrivningen lämnar en trasig fil efter sig.
function lasJson(fil, vad) {
  try {
    return JSON.parse(readFileSync(fil, 'utf8'));
  } catch (fel) {
    console.error(`❌ ${fil} (${vad}) går inte att läsa: ${fel.message}`);
    process.exit(1);
  }
}

// "1 händelse", "2 händelser". Rapporten läses av Axel, inte av en maskin.
function ord(antal, ental, flertal) {
  return `${antal} ${antal === 1 ? ental : flertal}`;
}

function rapportSlut() {
  const okanda = okandaFraser();
  console.log(
    `Klart: ${statistik.paket} paket, ${ord(statistik.handelser, 'händelse', 'händelser')}, ${kB} kB sida, ` +
    `${ord(okanda.length, 'okänd fras', 'okända fraser')}${okanda.length ? `: ${okanda.slice(0, 5).join(' | ')}${okanda.length > 5 ? ' …' : ''}` : ''}.`
  );
  if (!okanda.length && !noter.raOversatta) {
    // Räknaren i sprak.mjs lever i den här processen. Är händelserna redan
    // översatta i lage.json (spårningsrundans väg) möter publiceringen aldrig
    // en fras själv, och noll betyder då "inget att mäta här" — inte "inga
    // okända fraser i datan". Den siffran står i rundans egen logg.
    console.log('  (Fraserna var redan översatta i lage.json — okända fraser räknas då av sparning/kor.mjs, inte här.)');
  }
}

function paus(ms) {
  return new Promise((ok) => setTimeout(ok, ms));
}

// --- paketminnet → paketlistan som paketdata.byggData() vill ha -------------

// lage.json skrivs av sparning/kor.mjs: nummer → { bolag, kod, order,
// fulfillment, registrerad, status, status17, senast, levererad }.
// Skanningarna läggs till där av rundan. Mätt 2026-09-19 på den lagefil som
// låg i repot (1 055 paket): ingen post bar ännu ett `handelser`-fält — det
// skrivs av rundan när den sparar skanningarna, och tills dess bygger den här
// filen en tom sida (som bara --torr får publicera).
//
// Två former tas emot, för att det inte ska spela roll var översättningen
// sker:
//   1. Färdiga svenska händelser: handelser: [{ tid, text, plats }] — samma
//      form som paketdata.handelserUr() returnerar.
//   2. Råa 17TRACK-händelser (bär description/time_iso) eller ett helt rått
//      svar (bär track_info) — då översätts de här med sparning/sprak.mjs.
function paketUrLage(lageFil) {
  const noterna = { raOversatta: 0, utanStatus: 0 };
  const ut = [];
  for (const [nummer, post] of Object.entries(lageFil?.paket ?? {})) {
    const statusKod = post?.status ?? (post?.status17 ? STATUS[post.status17] ?? null : null);
    if (!statusKod) noterna.utanStatus++;
    ut.push({
      nummer,
      bolag: post?.bolag ?? null,
      statusKod,
      handelser: handelserFor(post, noterna),
    });
  }
  return { paket: ut, noter: noterna };
}

function handelserFor(post, noterna) {
  const via = (rått) => {
    noterna.raOversatta++;
    return handelserUr(rått, { oversattFras, stadaPlats, nu: NU });
  };
  if (post?.track_info) return via(post);
  if (post?.ra?.track_info) return via(post.ra);

  const lista = Array.isArray(post?.handelser) ? post.handelser : [];
  if (!lista.length) return [];
  const rått = lista.some((h) => h && (h.description !== undefined || h.time_iso !== undefined || h.time_utc !== undefined));
  if (rått) return via({ track_info: { tracking: { providers: [{ events: lista }] } } });

  // Färdiga händelser. `iso` tas emot som alias för `tid`, eftersom det är vad
  // uppacka.packaUppEtt() kallar samma sak när en sparad kedja läses tillbaka.
  return lista
    .map((h) => ({ tid: h?.tid ?? h?.iso ?? null, text: h?.text ?? null, plats: h?.plats ?? null }))
    .filter((h) => h.tid && h.text);
}

// --- sida.mjs ---------------------------------------------------------------

// Sidkroppen byggs av sparning/sida.mjs (en annan del av samma bygge). Den
// här filen letar upp byggfunktionen i stället för att kräva ett visst namn,
// och kontrollerar sedan att kroppen verkligen bär datan — en felaktig
// anropsform får aldrig gå vidare till Shopify.
async function laddaSidmodul() {
  if (!existsSync(join(ROT, 'sida.mjs'))) {
    console.error('❌ sparning/sida.mjs saknas — sidkroppen byggs där. Inget publicerat.');
    process.exit(1);
  }
  return import('./sida.mjs');
}

function byggKropp(modul, indata) {
  const namn = BYGGNAMN.find((n) => typeof modul[n] === 'function');
  if (!namn) {
    console.error(`❌ sparning/sida.mjs har ingen byggfunktion att anropa. Letade efter ${BYGGNAMN.join(', ')}; exporter: ${Object.keys(modul).join(', ') || 'inga'}.`);
    process.exit(1);
  }
  for (const [form, args] of FORMER) {
    let kropp = null;
    try {
      kropp = modul[namn](...args(indata));
    } catch (fel) {
      console.log(`  ${namn} med ${form} kastade: ${fel.message}`);
      continue;
    }
    if (typeof kropp === 'string' && kropp.trim() && barDatan(kropp, indata.data)) return { kropp, form, namn };
    console.log(`  ${namn} med ${form} gav en kropp utan datan i.`);
  }
  console.error(`❌ sparning/sida.mjs → ${namn}() gav ingen sidkropp med paketdatan i. Inget publicerat.`);
  process.exit(1);
}

// Bär kroppen datan? Ett känt spårningsnummer ska stå i den. Finns inget
// paket alls (tom torrkörning) räcker det att kroppen är en HTML-sträng.
function barDatan(kropp, data) {
  const nummer = valjKantNummer(data);
  if (!nummer) return /<\w/.test(kropp);
  return kropp.includes(nummer);
}

// Förhandsvisningen anropas med samma form som sidkroppen byggdes med — de
// två funktionerna bor i samma fil och tar samma argument.
function byggForhandsvisning(modul, indata, kropp, form) {
  const args = (FORMER.find((f) => f[0] === form) ?? FORMER[0])[1](indata);
  for (const namn of ['byggForhandsvisning', 'byggSparningsforhandsvisning', 'forhandsvisning']) {
    if (typeof modul[namn] !== 'function') continue;
    try {
      const html = modul[namn](...args);
      if (typeof html === 'string' && html.trim()) return html;
    } catch (fel) {
      console.log(`  ${namn}() kastade: ${fel.message} — förhandsvisningen byggs här i stället.`);
    }
  }
  // Ingen egen förhandsvisning i sida.mjs: sidkroppen läggs i ett minimalt
  // skal så filen går att öppna i en webbläsare och skärmdumpa.
  const titel = htmlSakra(indata.konfig?.sida?.titel ?? 'Spåra ditt paket');
  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titel} — förhandsvisning</title>
<style>body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#fff;color:#000}</style>
</head>
<body>
${kropp}
</body>
</html>
`;
}

function htmlSakra(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// --- markörer ---------------------------------------------------------------

// Sidmarkören (sidans yttersta id) och datablockets id. Ordningen är: det
// sida.mjs själv säger → det som faktiskt står i den byggda kroppen →
// konfigens reserv. Båda måste finnas i kroppen, annars stannar körningen:
// en tillbakaläsning som letar efter fel id säger alltid OK och bevisar
// ingenting.
function markorer(kropp, modul, sidkonfig) {
  const dataId =
    str(modul.DATA_ID) ?? str(modul.DATAMARKOR) ?? dataIdUrKropp(kropp) ?? str(sidkonfig.data_id);
  const markor =
    str(modul.SIDMARKOR) ?? str(modul.MARKOR) ??
    (harId(kropp, sidkonfig.markor) ? str(sidkonfig.markor) : sidmarkorUrKropp(kropp, dataId)) ??
    str(sidkonfig.markor);

  if (!dataId || !giltigtId(dataId)) return { ok: false, fel: `Hittade inget dugligt id på datablocket (fick "${dataId ?? ''}").` };
  if (!markor || !giltigtId(markor)) return { ok: false, fel: `Hittade ingen duglig sidmarkör (fick "${markor ?? ''}").` };
  if (!harId(kropp, markor)) return { ok: false, fel: `Sidmarkören id="${markor}" står inte i sidkroppen som sparning/sida.mjs byggde.` };
  if (!harId(kropp, dataId)) return { ok: false, fel: `Datablocket id="${dataId}" står inte i sidkroppen som sparning/sida.mjs byggde.` };

  // Övriga block sida.mjs säger att den skrev — i dag textrutan COPYMARKOR,
  // som sidans skript läser i första raden av starta(). Bara de som FAKTISKT
  // står i den byggda kroppen kontrolleras, så en framtida sida utan textruta
  // inte fastnar på en kontroll av något den aldrig skrev.
  const extra = [str(modul.COPYMARKOR), str(modul.COPY_ID)]
    .filter((i) => i && giltigtId(i) && i !== markor && i !== dataId && harId(kropp, i));

  return { ok: true, markor, dataId, extra: [...new Set(extra)] };
}

// En markör får skrivas som bara id:t ("bb-spar") eller som hela attributet
// (`id="bb-spar"`, vilket är formen sparning/sida.mjs exporterar, avläst
// 2026-09-19 — den formen skrivs rakt in i HTML:en där). Här behövs id:t.
function str(v) {
  const t = typeof v === 'string' ? v.trim() : '';
  if (!t.length) return null;
  const attribut = t.match(/id\s*=\s*"([^"]+)"/i);
  return attribut ? attribut[1] : t;
}

function giltigtId(id) {
  return /^[A-Za-z][\w:.-]*$/.test(id);
}

function harId(html, id) {
  return Boolean(id) && html.includes(`id="${id}"`);
}

function dataIdUrKropp(kropp) {
  const m =
    kropp.match(/<script[^>]*\bid="([^"]+)"[^>]*\btype="application\/json"/i) ??
    kropp.match(/<script[^>]*\btype="application\/json"[^>]*\bid="([^"]+)"/i);
  return m ? m[1] : null;
}

function sidmarkorUrKropp(kropp, dataId) {
  const träffar = kropp.matchAll(/<(?:div|section|main|article)[^>]*\bid="([^"]+)"/gi);
  for (const t of träffar) if (t[1] !== dataId) return t[1];
  return null;
}

// --- datan ur en sida -------------------------------------------------------

// Plockar JSON:en ur <script id="<dataId>" …>…</script>. `<\/` skrivs så i
// JSON inbäddad i HTML (annars stänger webbläsaren skriptet) — det backas ut
// här, precis som i mejl/hjul-publicera.mjs.
function datanUr(html, dataId) {
  // Id:t sätts ihop till ett reguljärt uttryck och måste eskaperas först: ett
  // id får bära punkt och bindestreck (giltigtId), och en punkt hade annars
  // matchat vilket tecken som helst — en tillbakaläsning som träffar fel
  // block bevisar ingenting.
  const m = html.match(new RegExp(`id="${eskRegex(dataId)}"[^>]*>([\\s\\S]*?)</script>`));
  if (!m) return { fel: `blocket id="${dataId}" saknas` };
  try {
    return { data: JSON.parse(m[1].replace(/<\\\//g, '</')) };
  } catch (fel) {
    return { fel: fel.message };
  }
}

// Ett paket som bär minst en skanning — det är ett sådant kunden slår upp, och
// ett sådant som bevisar att sidan inte är tom. Finns inget väljs vilket som
// helst; finns inga paket alls blir svaret null.
function valjKantNummer(data) {
  const k = data?.k ?? {};
  const nummer = Object.keys(k);
  return nummer.find((n) => (k[n]?.[2] ?? []).length) ?? nummer[0] ?? null;
}

function harPaket(data, nummer) {
  return Boolean(data?.k) && Object.prototype.hasOwnProperty.call(data.k, nummer);
}

function eskRegex(text) {
  return String(text).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');
}

// --- Shopifys svar på en mutation -------------------------------------------

// Shopify svarar 200 även när mutationen nekades: förklaringen ligger i
// `userErrors` och `page` är null. Utan den här kontrollen kraschade
// publiceringen på "Cannot read properties of null (reading 'id')" och
// Shopifys egen text (fel handle, för stor kropp, saknad rättighet) syntes
// aldrig — och exakt det felet är det enda som säger vad som gick snett.
function sidId(svar, namn) {
  const fel = svar?.userErrors ?? [];
  if (fel.length) {
    const rader = fel.map((f) => `${Array.isArray(f?.field) ? f.field.join('.') : (f?.field ?? '—')}: ${f?.message ?? ''}`);
    console.error(`❌ Shopify nekade ${namn}: ${rader.join(' | ')}`);
    process.exit(1);
  }
  const id = svar?.page?.id;
  if (!id) {
    console.error(`❌ ${namn} gav ingen sida tillbaka: ${JSON.stringify(svar ?? null).slice(0, 300)}`);
    process.exit(1);
  }
  return id;
}
