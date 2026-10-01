// hinkar.mjs — vilken hink ett inkommande kundmejl hamnar i. RENA REGLER,
// samma svar varje gång, ingen modell. Det är avsiktligt: ett automatiskt
// svar till en kund måste gå att förklara efteråt ("den hamnade i ENKEL för
// att …"), och en regel som ändras är en commit, inte en känsla.
//
// Tre hinkar (Axels spec 2026-09-21) plus en tyst:
//   ENKEL  — var är min order, leveranstid, byte av adress före leverans,
//            öppettider. AI svarar själv, med fakta ur Shopify + 17TRACK.
//            Saknas fakta går mejlet till SVÅR — aldrig ett gissat svar.
//   ARG    — RIKTIG ilska: frustration i ordvalet, hot om bank/ARN/recension,
//            versaler, utropstecken, eskaleringsord, tredje mejlet utan svar.
//            EN lugnande rad (Axels mall) + läget ur spårningen när det finns,
//            sen flaggas tråden och flyttas till VA-mappen.
//            ⚠️ Kategorin ensam gör INTE ett mejl argt (Axels kalibrering
//            2026-09-22: "jag tyckte inte riktigt att han verkade så himla
//            sur" om ett lugnt "överdraget är för litet"). En lugn "trasig
//            vara" är ENKEL `foton` (bildförfrågan, SOP 05/08), ett lugnt
//            "aldrig fått paketet" är WISMO med fakta.
//   SVÅR   — allt annat: retur, återbetalning, byte/storlek, tvist, fel antal,
//            frågor som inte går att belägga. Inget AI-svar, bara flagga.
//   SKIP   — inte en kund: autosvar, listmejl, systemmejl, butikens egna.
//
// Järnreglerna som ligger HÄR (resten ligger i autosvar.mjs):
//   • Tvistord (chargeback, dispute, ARN, Klarna-tvist, tvist) ⇒ SVÅR, alltid,
//     även om mejlet i övrigt låter enkelt. Axels lista, inte förhandlingsbar.
//   • Bilaga ⇒ SVÅR (motorn läser inte bilagor, så den vet inte vad kunden visat).
//   • ARG vinner över ENKEL: en arg WISMO får den lugnande raden, inte en
//     spårningslänk — spårningslänken kommer i VA:ns svar.

import { klassificera, normalisera } from '../klassificering.mjs';
import { namnerHamtaUt } from './svar.mjs';
import { arSystem, arEgen } from '../arenden.mjs';

export const HINK = Object.freeze({ ENKEL: 'ENKEL', ARG: 'ARG', SVAR: 'SVÅR', SKIP: 'SKIP' });

// Så länge efter VA:ns senaste mejl till kunden (Skickat, vilken tråd som
// helst) räknas kunden som VA:ns — inget automatiskt svar, bara flagga.
// Kalibreringen 2026-09-22 (Ulf: fyra VA-svar på en vecka, nytt mejl i en
// Judge.me-tråd fick eskaleringsmallen).
export const VA_KUND_DAGAR = 14;

// Axels ord (2026-09-21) + de nordiska formerna. En träff = SVÅR utan svar.
const TVISTORD = [
  'chargeback', 'charge back', 'charge-back', 'dispute', '\\barn\\b', 'reklamationsnämnd', 'reklamationsnemnd', 'klarna.?tvist', 'klarna.?dispute',
  '\\btvist(en|er|erna)?\\b', 'återkrav', 'tilbakeføring', 'chargebacken',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));

// Ilska utöver klassificeringens eskaleringsord (sv/nb/da/fi/en).
// "besviken"/"disappointed" togs bort 2026-09-29 (Axels granskning av de 16
// skarpa svaren: Mikaels "blev väldigt besviken" om ett överdrag som inte
// passade fick eskaleringsmallen — besvikelse är inte ilska).
// "skit", "skräp", "bluff", "betalar inte" lades till 2026-09-21 kväll efter
// den första torrkörningen: "Vad är det här för skit? … Det här betalar jag
// inte för" och "Det är rent skräp" hamnade i SVÅR i stället för ARG.
const ARGORD = [
  '\\barg\\b', 'förbannad', 'irriterad', 'frustrerad', 'urusel', '\\busel\\b', 'fruktansvärt', 'hemskt', 'skäms', 'aldrig mer', 'sista gången', 'oseriös', 'katastrof',
  '\\bskit\\b', 'skitprodukt', 'skräp', 'bluff', 'bedrägeri', 'lurad', 'lurade', 'betalar (jag |vi )?inte', 'oacceptabel', 'skandal', 'skämt', 'dålig kvalit', 'usel kvalit', 'tunt som en',
  '\\bsint\\b', 'forbanna', 'frustrert', 'elendig', 'aldri mer', 'siste gang', 'useriøs', 'søppel', 'svindel', '\\blurt\\b', '\\bdritt\\b', 'uakseptabel',
  '\\bvred\\b', 'frustreret', 'elendigt', 'aldrig mere', 'sidste gang', 'skrald', 'snydt', '\\blort\\b', 'uacceptabel',
  'vihainen', 'turhautunut', 'surkea', 'en ikinä enää', 'roska', 'huijaus', 'paska',
  'pissed', 'angry', 'furious', 'frustrated', 'terrible', 'awful', '\\bworst\\b', 'never again', 'disgusting', 'ridiculous', 'unacceptable', 'joke\\b', '\\bscam\\b', 'fraud', 'rip-?off', 'garbage', 'rubbish', '\\bcrap\\b',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));

// Enkla ämnen — bara när mejlet INTE är argt.
const ADRESS = ['ändra adress', 'ändra min adress', 'ändra leveransadress', 'fel adress', 'ny adress', 'byta adress', 'uppdatera adress', 'adressändring',
  'endre adresse', 'feil adresse', 'ny adresse', 'ændre adresse', 'forkert adresse', 'vaihtaa osoit', 'väärä osoite', 'uusi osoite',
  'change (my |the |delivery |shipping )?address', 'wrong address', 'new address', 'update (my |the )?address',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));
const OPPETTIDER = ['öppettider', 'när svarar ni', 'telefonnummer', 'ringa er', 'ringa till er', 'kan man ringa', 'åpningstider', 'åbningstider', 'aukioloajat', 'puhelinnumero',
  'opening hours', 'phone number', 'can i call', 'when do you (answer|reply)', 'customer service hours',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));
const LEVERANSTID = ['leveranstid', 'hur lång tid tar leverans', 'hur lång leveranstid', 'hur snabbt levererar', 'när levererar ni', 'leveringstid', 'hvor lang tid tar leverans', 'hvor lang leveringstid', 'toimitusaika', 'kuinka kauan toimitus',
  'delivery time', 'how long (does|will) (the )?(delivery|shipping) take', 'shipping time', 'how long until',
  // "hur länge får man vänta på leverans" (rutinens första körning 2026-09-22, Axels beslut A 2026-09-23) — utan order är det frågan före köp, med order WISMO (HAR_ORDER nedan).
  'hur länge (får|ska|måste|behöver) (man|jag|vi) vänta', 'vänta på leverans', 'how long (do|will) (i|we) (have to )?wait',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));
// SOP 38: företagsuppgifter är offentliga och ska gå ut direkt — bara de godkända (brandfilens svar.foretag).
const FORETAG = ['organisationsnummer', 'org\\.?\\s?nr', 'org-?nummer', 'orgnummer', 'företagsuppgifter', 'bolagsuppgifter', 'momsregistrerings', 'vat.?(number|nummer|nr)', 'juridisk[at]? namn', 'vilket bolag', 'vilket företag (står|är det som)',
  'organisasjonsnummer', 'foretaksopplysninger', 'cvr', 'virksomhedsoplysninger', 'y-tunnus', 'yritystiedot',
  'company (details|information|registration number)', 'registered address', 'legal (name|entity)',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));

// Shopifys egna kundnotiser — ett svar på dem ("Re: Order #5953 bekräftad")
// är kundens FÖRSTA fråga, inte ett svar på ett svar från oss.
const NOTISAMNE = /^\s*((re|sv|vs|fwd?|fw|aw|ang)\s*:\s*)*(order\s*#?\d+\s*(bekräftad|bekreftet|bekræftet|confirmed|vahvistettu|har skickats|er sendt|is on its way|shipped)|tack för din (order|beställning)|takk for (bestillingen|ordren)|tak for din ordre|kiitos tilauksestasi|thank you for your (order|purchase)|din (order|beställning) (är på väg|har skickats)|your order (is on its way|has shipped)|leveransuppdatering|shipping (update|confirmation)|delivery update)/i;
const NOTISMARKOR = /(ordersammanfattning|order summary|ordresammendrag|ordreoversigt|tilauksen yhteenveto|tack för din order|takk for bestillingen|tak for din ordre|kiitos tilauksestasi|thank you for your order|din order är på väg|your order is on its way)/i;

/**
 * Har vi (en människa i butiken) redan svarat i den här tråden? Ren.
 * Två spår, båda billiga och oberoende av hur stor Sent-mappen är:
 *   1. References/In-Reply-To bär ett Message-ID från butikens egen domän —
 *      kunden svarar på ett mejl VI skrev (Roundcube sätter <…@baverbutiken.se>).
 *   2. Citatet i kroppen har vår supportadress som avsändare ("Från: … <supportmail>",
 *      "… <supportmail> skrev:"). Shopifys egna notiser (orderbekräftelsen) citeras
 *      också med vår adress — de räknas INTE: ett "Re: Order #5953 bekräftad" är
 *      kundens första fråga.
 * Bakgrund: första torrkörningen 2026-09-21 svarade i två trådar VA:n redan
 * besvarat (Sent har ~50 mejl om dagen, sökningen såg bara första sidan).
 */
export function redanBesvaradAvOss({ mejl, brand } = {}) {
  const support = String(brand?.supportmail ?? '').toLowerCase();
  const doman = support.split('@')[1] ?? '';
  const refs = (mejl?.references ?? []).map((r) => String(r).toLowerCase());
  const notis = NOTISAMNE.test(String(mejl?.amne ?? '')) || NOTISMARKOR.test(String(mejl?.helText ?? ''));
  if (doman && refs.some((r) => r.endsWith(`@${doman}>`)) && !notis) return { besvarad: true, orsak: 'References bär ett Message-ID från butikens egen domän' };
  if (!support || notis) return { besvarad: false, orsak: null };
  const hel = String(mejl?.helText ?? '');
  const adr = support.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (new RegExp(`(^|\\n)\\s*>?\\s*(från|from|fra|lähettäjä|de|von)\\s*:[^\\n]*${adr}`, 'i').test(hel)) return { besvarad: true, orsak: 'citatet har ett tidigare svar från vår supportadress' };
  if (new RegExp(`${adr}>?\\s*(skrev|wrote|schrieb|kirjoitti|escribió)\\s*:`, 'i').test(hel)) return { besvarad: true, orsak: 'citatet har ett tidigare svar från vår supportadress' };
  return { besvarad: false, orsak: null };
}

/** Är texten ett tvist-/chargebackärende? Ren. */
export function harTvistord(text) {
  const t = normalisera(text);
  return TVISTORD.some((re) => re.test(t));
}

// Hälsnings- och avslutningsrader räknas inte när utropstecknen räknas:
// "Hej!" + "Tack på förhand!" är artighet, inte ilska (Stevan 2026-09-27,
// vars lugna avbeställning fick eskaleringsmallen).
const HALSNINGSRAD = /^\s*(hej(san)?|hallå|hi|hello|hei|god (morgon|dag|kväll)|(tusen |stort )?tack( på förhand| så mycket)?|takk|tak|kiitos|thanks|thank you|mvh|m\.v\.h\.?|vänliga hälsningar|med vänlig(a)? hälsning(ar)?|vennlig hilsen|venlig hilsen|kind regards|best regards)[!.,\s]*$/i;
function utropstecken(text) {
  const s = String(text ?? '').split('\n').filter((r) => !HALSNINGSRAD.test(r)).join('\n');
  return { dubbla: (s.match(/!{2,}/g) ?? []).length, alla: (s.match(/!/g) ?? []).length };
}

/** Andelen VERSALORD (≥ 4 bokstäver) i texten — "JAG VILL HA MINA PENGAR" är inte lugn. */
function versalandel(text) {
  const ord = String(text ?? '').match(/[A-ZÅÄÖØÆa-zåäöøæ]{4,}/g) ?? [];
  if (ord.length < 6) return 0;
  return ord.filter((o) => o === o.toUpperCase()).length / ord.length;
}

// Svar eller vidarebefordran: Re:/Sv:/Vs:/AW:/Fwd:/Fw:/VB:/Antw: (flera i rad).
const SVARSAMNE = /^\s*(\[[^\]]*\]\s*)?((re|sv|vs|aw|fwd?|fw|vb|antw|svar)\s*(\[\d+\])?\s*:\s*)+/i;
/** Är ämnet ett svar/vidarebefordran (alltså någon annans rubrik)? Ren. */
export function arSvarsamne(amne) {
  return SVARSAMNE.test(String(amne ?? ''));
}

/**
 * Är mejlet argt? Ren. `klass` är klassificera(); `trad` bär
 * antalInkommande/antalSvar för tråden.
 */
export function arArg({ klass, amne = '', text = '', trad = null } = {}) {
  const orsaker = [];
  // Ett SVARS-ämne ("Re: Landade skämtet, eller inte?") är butikens egna ord, inte kundens —
  // Matstrumpors recensionsförfrågan i Spoks bär ordet "skämt", så varje svar på den startade
  // som ARG (mätt 2026-09-30). Ilskeorden prövas därför bara mot ämnen kunden skrivit själv.
  const a = arSvarsamne(amne) ? '' : normalisera(amne);
  const t = normalisera(text);
  // Bara ilskans EGNA tecken. "ej_levererad" och "skadad_defekt" räknades som
  // arga i sig till 2026-09-22 — då fick ett artigt "överdraget är för litet"
  // eskaleringsmallen. Ett hot om banken är däremot alltid ett tecken.
  if (klass.kategori === 'chargeback_hot') orsaker.push('hot om bank/anmälan/recension');
  // Bara de starka ("tredje gången", "ingen svarar", "unacceptable") — brådska
  // ensam ("immediately", "senast fredag") är inte ilska (2026-09-23).
  const stark = klass.eskaleringStark ?? klass.eskalering;
  if (stark >= 1) orsaker.push(`eskaleringsord (${stark})`);
  if (ARGORD.some((re) => re.test(a) || re.test(t))) orsaker.push('argt ordval');
  const u = utropstecken(text);
  if (u.dubbla >= 1 || u.alla >= 3) orsaker.push('många utropstecken');
  if (versalandel(text) >= 0.3) orsaker.push('skriver i versaler');
  if (trad && trad.antalInkommande >= 3 && trad.antalSvar === 0) orsaker.push(`tredje mejlet utan svar (${trad.antalInkommande} obesvarade)`);
  return { arg: orsaker.length > 0, orsaker };
}

// Tecken på att kunden redan HAR en order — då är en leveranstidsfråga WISMO.
const HAR_ORDER = ['min order', 'min beställning', 'beställde', 'har beställt', 'mitt paket', 'paketet', 'ordern', 'ordre', 'bestilte', 'har bestilt', 'pakken', 'min pakke',
  'my order', 'i ordered', 'i have ordered', 'my parcel', 'my package', 'the parcel', 'tilasin', 'tilaukseni', 'pakettini', 'paketti',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));

// Kategorier som gör att ett mejl ALDRIG är enkelt, även om det också låter
// som en spårningsfråga. "Skickade min retur i fredags med Postnord spårbart
// paket" fick ett WISMO-svar med utgående spårning i första torrkörningen
// 2026-09-21 — ordet "spårbart" vann över ordet "retur".
// (skadad_defekt, fel_vara och ej_levererad togs bort 2026-09-22: de är enkla
// när kunden är lugn — bildförfrågan resp. WISMO. Fel ANTAL är fel_vara och
// får också bildförfrågan: SOP 07 börjar med bild på det som kom.)
const ALDRIG_ENKEL = new Set(['retur_angerratt', 'aterbetalning', 'avbestallning', 'faktura_klarna', 'okand_debitering', 'chargeback_hot']);

// Byte och storlek (SOP 21): "för litet", "en storlek större", "passar inte"
// är ett byte som VA:n beslutar om — ingen bildförfrågan, inget WISMO.
// Jan-Olofs "överdraget är för litet, behöver en storlek större" 2026-09-21.
// "passar inte"/"does not fit" är ett klagomål, inte en bytesbegäran — det får bildförfrågan `passform` (Mikael 2026-09-23/29), inte SVÅR. Bara storleken (för liten, en storlek större, byta) är byte.
const BYTE = ['(jätte|väldigt|alldeles|helt|på tok) ?(för )?(små|liten|litet|stor|stora|stort|trång|trånga)', 'kan inte ha (dom|dem|den|de)', 'får (inte|ej) (ens )?på (mig|dom|dem|den)', 'får (dom|dem|den) inte på', 'för lite[tn]', 'för sto[rt]+\\b', 'för små', 'för trång', 'för kort', 'för lång', 'storlek större', 'storlek mindre', 'större storlek', 'mindre storlek', 'annan storlek', 'fel storlek', 'byta (till|mot|ut|storlek)', '\\bbyte\\b',
  'for lit[ent]', 'for sto[rt]+\\b', 'for små', 'for trang', 'større størrelse', 'mindre størrelse', 'feil størrelse', 'bytte (til|mot|størrelse)',
  'for lille', 'forkert størrelse', 'ombytning', 'bytte (til|størrelse)',
  'liian pieni', 'liian iso', 'liian suuri', 'väärä koko', 'vaihtaa (kokoa|toiseen)',
  'too small', 'too big', 'too large', 'too tight', 'wrong size', 'size up', 'size down', 'a size (bigger|larger|smaller)', 'exchange (it|for|to)',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));

// Kunden vill returnera och frågar hur (Axels beslut 2026-09-22 på Peters
// "hur gör vi enklast för en smidig retur?": "vill ha retur direkt → skicka
// returinformationen direkt"). Inte "retur" som ord — det är retur_angerratt —
// utan själva avsikten att skicka tillbaka.
const RETURFRAGA = [
  '(vill|önskar|önskar att|ska|tänker|väljer att|kommer att) (returnera|skicka tillbaka|lämna tillbaka|göra en retur|returnera varan|returnera produkten)', 'hur (gör|går) (jag|vi|man) .{0,40}(retur|returnera|skicka tillbaka)', '(smidig|enkel|snabb) retur', 'returnera (varan|produkten|den|beställningen|ordern|paketet)', 'returadress', 'vart (skickar|ska) (jag|vi) (den|varan|paketet|tillbaka)', 'vill ha en retur', 'begär(a|) (en )?retur', 'retur(en)? (till|av)',
  '(vil|ønsker|skal|kommer til å) (returnere|sende tilbake|levere tilbake)', 'hvordan (gjør|går) (jeg|vi|man) .{0,40}(retur|returnere|sende tilbake)', 'returadresse', 'returnere (varen|produktet|den|bestillingen)',
  '(vil|ønsker|skal) (returnere|sende tilbage|levere tilbage)', 'hvordan (gør|går) (jeg|vi|man) .{0,40}(retur|returnere|sende tilbage)', 'returnere (varen|produktet|den|ordren)',
  '(haluan|haluaisin|aion) palauttaa', 'miten (voin |voi )?palauttaa', 'palautusosoite', 'palauttaa (tuotteen|tilauksen|sen)',
  '(want|would like|need|going) to return', 'how (do|can|should) (i|we) return', 'return (it|the item|the product|this|the order)', 'return address', 'send (it|the item|this) back',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));

/** Ber kunden om att få returnera (hur, vart, vill returnera)? Ren. */
export function arReturfraga({ amne = '', text = '' } = {}) {
  const a = normalisera(amne);
  const t = normalisera(text);
  return RETURFRAGA.some((re) => re.test(a) || re.test(t));
}

// Tecken på att kunden HAR varan eller en order. Utan dem (och utan ordernummer)
// är "Någon garanti?", "passar den?" och "vilket överdrag skall jag välja" frågor
// FÖRE köp — Hans 2026-09-28 fick en bildförfrågan för att ordet garanti är
// skadad_defekt. Axels beslut 2026-09-29: sådana mejl svarar boten aldrig på.
const HAR_VARAN = ['fick', 'fått', 'kom (fram|hem|idag|i dag|igår|i går)', 'levererad', 'levererat', 'levererades', 'mottog', 'mottagit', 'öppnade', 'beställde', 'köpte', 'har beställt', 'har köpt', 'varan jag', 'produkten jag',
  'fikk', 'mottok', 'kjøpte', 'bestilte', 'pakken', 'modtog', 'købte', '\\bfik\\b', 'sain', 'ostin', 'tilasin', 'pakettini',
  'received', 'arrived', 'got (it|the|my)', 'bought', 'ordered', 'delivered', 'my parcel', 'the parcel', 'the package',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));

// Frågan före köp: garanti, passform, vilken variant, "innan jag beställer". sv/nb/da/fi/en.
const FORKOP_FRAGA = /garanti|warranty|guarantee|passar (den|det|de|dom|detta|dessa) (till|på|min|mitt|mina|en|ett)|skulle (den|det) passa|kommer (den|det) (att )?passa|vilken (storlek|modell|variant|färg|version)|vilket (överdrag|skydd|alternativ)|(skall|ska) jag välja|rekommenderar ni|finns (den|det|de) i|har ni (den|det|de|någon|några|nån)|innan jag (beställer|köper)|funderar på att (köpa|beställa)|vad kostar|går den att|passer (den|det) (til|på)|hvilken (størrelse|modell)|anbefaler dere|før jeg bestiller|sopiiko|mikä koko|ennen kuin tilaan|does it fit|will it fit|which (size|model)|before (i|we) order|before ordering|do you (have|sell)|is it (suitable|compatible)/i;
// Ett klagomål på en vara kunden har — då är det aldrig en fråga före köp.
const KLAGOMAL = /trasig|sönder|defekt|fungerar (inte|ej)|funkar (inte|ej)|saknas|fel (vara|produkt|storlek|färg|antal)|ser (inte|ej) (alls )?ut som|inte som på bilden|stämmer (inte|ej)|passar (inte|ej)|för (liten|litet|små|stor|stora|stort)|skadad|reklam|ødelagt|virker ikke|passer ikke|i stykker|rikki|ei toimi|ei sovi|broken|damaged|does not (work|fit)|doesn.t (work|fit)|wrong (item|size|product)|not as (pictured|described)|missing/i;

/** Är mejlet en fråga före köp — produktfråga, garanti eller passform utan order och utan mottagen vara? Ren. */
export function arForkop({ klass, amne = '', text = '' } = {}) {
  if (klass?.ordernummer?.length) return false;
  const a = normalisera(amne);
  const t = normalisera(text);
  const allt = `${a}\n${t}`;
  if ([...HAR_ORDER, ...HAR_VARAN].some((re) => re.test(a) || re.test(t))) return false;
  if (KLAGOMAL.test(allt)) return false;
  return klass?.kategori === 'produktfraga' || FORKOP_FRAGA.test(allt);
}

/** Är mejlet ett byte eller en storleksfråga på en levererad vara (SOP 21)? Ren. */
export function arByte({ klass, amne = '', text = '' } = {}) {
  const a = normalisera(amne);
  const t = normalisera(text);
  // Johan 2026-09-28 ("dom va jätte små!! … kan inte ha dom") bar ingen kategori alls — ordet storlek i mejlet räcker.
  return BYTE.some((re) => re.test(a) || re.test(t)) && ((klass?.alla ?? []).some((x) => ['skadad_defekt', 'fel_vara', 'retur_angerratt', 'produktfraga'].includes(x.id)) || /storlek|størrelse|\bkoko\b|\bsize\b/i.test(`${a}\n${t}`));
}

/** Vilken enkel fråga det är, eller null. Ren. */
export function enkelTyp({ klass, amne = '', text = '' }) {
  const a = normalisera(amne);
  const t = normalisera(text);
  const traff = (lista) => lista.some((re) => re.test(a) || re.test(t));
  const alla = new Set((klass.alla ?? []).map((x) => x.id));
  // Returen först: kunden som vill returnera och frågar hur får returinformationen (Axels beslut 2026-09-22) — inte ett byte, inte en tvist.
  if (alla.has('retur_angerratt') && !alla.has('chargeback_hot') && !arByte({ klass, amne, text }) && arReturfraga({ amne, text })) return 'retur';
  if ([...alla].some((id) => ALDRIG_ENKEL.has(id))) return null;
  if (arByte({ klass, amne, text })) return null;
  // SOP 05/08/07/15: skadad, defekt, fel eller för få varor ⇒ första svaret ber om bilderna — bara när kunden HAR varan (arForkop).
  if ((alla.has('skadad_defekt') || alla.has('fel_vara')) && !arForkop({ klass, amne, text })) return 'foton';
  // Kunden står hos ombudet utan kod (Mats 2026-09-25): läget ur spårningen + vad hen gör hos ombudet.
  if (namnerHamtaUt(`${amne}\n${text}`)) return 'wismo';
  if (traff(FORETAG)) return 'foretag';
  if (traff(ADRESS)) return 'adress';
  if (traff(OPPETTIDER)) return 'oppettider';
  // Leveranstid utan order = fråga före köp. Med ordernummer eller ordertext är det WISMO.
  if (traff(LEVERANSTID) && !klass.ordernummer.length && !traff(HAR_ORDER)) return 'leveranstid';
  // "Aldrig fått paketet" utan ilska är en spårningsfråga (SOP 36/37) — svaret säger var paketet är.
  if (['var_ar_ordern', 'ej_levererad'].includes(klass.kategori) || traff(LEVERANSTID)) return 'wismo';
  return null;
}

// Säljmejl TILL butiken (leverantörer, "Shopify-experter", provisionsjägare).
// Mätt i CaraShells inkorg 2026-09-23: en dropshipping-leverantör skrev
// "Orders processed within 24 hours" — eskaleringsordet "within 24" gjorde
// den till en ARG kund, den fick ett lugnande utkast och flyttades till
// VA-PRIO. Klassificeringens spam-kategori vann inte, för "competitive
// pricing" gav rabatt_kod. Två eller fler av de här fraserna och inget
// ordernummer ⇒ SKIP. En kund skriver inte "dropshipping" och "quotation" i
// samma mejl; en fras ensam räcker aldrig.
const SALJFRASER = [
  /dropshipping/, /sourcing/, /fulfil?lment (partner|solution|system)/, /factory pric/, /quotation/, /whatsapp/,
  /shopify (website |store )?(expert|developer)/, /\bcommission\b/, /profit margin/, /seasonal promotion/,
  /(increase|boost) (your )?sales/, /brand awareness/, /drive (significant )?engagement/, /digital agency/, /web design/,
  /overseas warehouse/, /test order/,
  // Byråer och SaaS-säljare (2026-09-30). En AI-annonsbyrå ("Your copy is funnier than your ad", Matstrumpor
  // 2026-09-25) fick eskaleringsmallen i torrläge — ordet "joke" i komplimangen blev ARG, och ingen fras ovan
  // träffade. Klaviyos säljare 2026-09-30 räddades bara av ordet "unsubscribe" i en länk. Två fraser krävs fortfarande.
  /examples? of (our|my) work/, /would you be open to (seeing|hearing|a (quick |short )?(call|chat|concept|demo|look))/,
  /reply .{0,3}no thanks/, /\b(ai|ugc|video) (product )?(ads|creatives?)\b/, /quick concept/,
  /growth specialist/, /account executive/, /partnership (manager|specialist)/, /business development/,
  /book (a )?(time|call|meeting) (on|in) my calendar/, /schedule a (quick |short )?(call|chat|meeting)/, /when works best/,
  /follow(ing)? up on my (last|previous|earlier) (message|e-?mail|note)/, /before upgrading/, /upgrade your (plan|account)/,
  /exempel på (vårt|mitt) arbete/, /boka (ett )?(kort |snabbt )?(möte|samtal)/,
];

/** Är mejlet en säljpitch till butiken? Två fraser, inget ordernummer. Ren. */
export function arSaljmejl({ amne = '', text = '', klass = null } = {}) {
  if (klass?.ordernummer?.length) return false;
  const s = `${amne}\n${text}`.toLowerCase();
  return SALJFRASER.filter((re) => re.test(s)).length >= 2;
}

/**
 * Hinken för ett mejl, UTAN fakta (fakta avgör sen om ENKEL håller — se
 * beslut()). `mejl` är mime.tolkaMejl() (+ ev. `bilaga`), `brand` brandet,
 * `trad` tråden ur arenden.mjs (antalInkommande, antalSvar) eller null.
 *
 * Returnerar { hink, typ, orsak, klass, argOrsaker }.
 */
export function hinka({ mejl, brand, trad = null } = {}) {
  const fran = mejl?.fran?.adress ?? '';
  const amne = mejl?.amne ?? '';
  const text = mejl?.text ?? '';
  const klass = klassificera({ amne, text });
  const bas = { klass, typ: null, argOrsaker: [] };

  if (!fran) return { ...bas, hink: HINK.SKIP, orsak: 'ingen avsändare' };
  if (mejl.autosvar) return { ...bas, hink: HINK.SKIP, orsak: 'autosvar' };
  if (mejl.listmejl) return { ...bas, hink: HINK.SKIP, orsak: 'listmejl/nyhetsbrev' };
  if (arSystem(fran, amne)) return { ...bas, hink: HINK.SKIP, orsak: `systemavsändare (${fran.split('@')[1] ?? fran})` };
  if (arEgen(fran, brand)) return { ...bas, hink: HINK.SKIP, orsak: 'butikens egen adress' };
  if (klass.kategori === 'spam') return { ...bas, hink: HINK.SKIP, orsak: 'spam/marknadsföring' };
  if (arSaljmejl({ amne, text, klass })) return { ...bas, hink: HINK.SKIP, orsak: 'säljmejl till butiken (leverantör/byrå)' };

  if (harTvistord(`${amne}\n${text}`)) return { ...bas, hink: HINK.SVAR, orsak: 'tvistord i mejlet (chargeback/dispute/ARN/tvist) — bara VA:n' };
  if (mejl.bilaga) return { ...bas, hink: HINK.SVAR, orsak: 'mejlet har en bilaga motorn inte läst' };
  if (String(text).trim().length < 8) return { ...bas, hink: HINK.SVAR, orsak: 'nästan ingen text att läsa' };

  // Axels granskning 2026-09-29 (de 16 skarpa svaren): tre sorters mejl får ALDRIG
  // ett automatiskt svar, hur många utropstecken de än bär — de går till VA:n.
  //   • frågan före köp (Hans: "Någon garanti? … vilket överdrag skall jag välja")
  //   • byte eller storlek (Johan: "jätte små!!" fick eskaleringsmallen för utropstecknen)
  //   • avbeställning (Stevan: "Kan jag avbryta denna orden?" fick eskaleringsmallen)
  const alla = new Set((klass.alla ?? []).map((x) => x.id));
  if (arForkop({ klass, amne, text })) return { ...bas, hink: HINK.SVAR, orsak: 'fråga före köp — ingen order och ingen mottagen vara nämns, VA:n svarar (Axels beslut 2026-09-29)' };
  if (!alla.has('chargeback_hot')) {
    if (arByte({ klass, amne, text })) return { ...bas, hink: HINK.SVAR, orsak: 'byte eller storlek (SOP 21) — VA:n beslutar' };
    if (alla.has('avbestallning')) return { ...bas, hink: HINK.SVAR, orsak: 'avbeställning — VA:n, inget automatiskt svar (Axels beslut 2026-09-29)' };
  }

  const ilska = arArg({ klass, amne, text, trad });
  if (ilska.arg) return { ...bas, hink: HINK.ARG, orsak: ilska.orsaker.join(', '), argOrsaker: ilska.orsaker };

  const typ = enkelTyp({ klass, amne, text });
  if (typ) return { ...bas, hink: HINK.ENKEL, typ, orsak: `enkel fråga: ${typ}` };
  if (arByte({ klass, amne, text })) return { ...bas, hink: HINK.SVAR, orsak: 'byte eller storlek (SOP 21) — VA:n beslutar' };
  return { ...bas, hink: HINK.SVAR, orsak: `kategori ${klass.kategori} — VA:n` };
}

/**
 * Det slutliga beslutet när faktan är hämtad. Ren.
 * `fakta` = autosvar/fakta.mjs hamtaFakta() (order, sparning, sparr …), `trad` tråden.
 *
 * Reglerna:
 *   • ett automatiskt svar redan i tråden, ett svar från oss, eller ett utkast ⇒ inget nytt svar (SVÅR/flagga)
 *   • ENKEL utan order när ordern behövs ⇒ SVÅR — eller, med brandfilens
 *     `svar.fraga_ordernummer`, SOP 36 steg 1: be om ordernumret (flaggas så VA:n ser tråden)
 *   • ENKEL där ordernumret tillhör en annan kund ⇒ SVÅR ("nämn aldrig en annan kunds order")
 *   • WISMO men paketet är levererat enligt fraktbolaget ⇒ ENKEL `levererad`
 *     (SOP 06: checklistan brevlåda/avi/ombud/grannar) + flagga + VA-mappen, så
 *     VA:n följer upp om kunden inte hittar det. Är kunden arg är mejlet redan ARG.
 *   • `foton` (lugn skadad/fel vara) ⇒ bildförfrågan + flagga + VA-mappen, ingen fakta behövs
 *   • adressbyte på en redan skickad order ⇒ SVÅR
 *   • företagsuppgifter (SOP 38) ⇒ svar bara när brandfilen bär `svar.foretag`
 */
export function beslut({ hink, fakta = null, trad = null, brand = null } = {}) {
  const h = { ...hink };
  if (h.hink === HINK.SKIP) return { ...h, svara: false, flagga: false, flytta: false, vaAtgard: false };
  const redanSvarad = Boolean(trad && (trad.antalSvar > 0 || trad.redanAutosvar));
  if (redanSvarad && h.hink !== HINK.SVAR) {
    return { ...h, hink: HINK.SVAR, orsak: trad.antalSvar > 0 ? 'tråden har redan ett svar från oss — VA:n fortsätter' : 'tråden eller kunden har redan fått ett automatiskt svar — andra mejlet går till VA:n', svara: false, flagga: true, flytta: false, vaAtgard: false };
  }
  // Kunden är VA:ns: har vi skrivit till adressen de senaste VA_KUND_DAGAR
  // dagarna (Skickat, vilken tråd som helst) pågår ett ärende — ett automatiskt
  // svar i en annan tråd ("Jag eskalerar detta…") pratar då i munnen på VA:n.
  if (trad?.vaDagar != null && trad.vaDagar <= VA_KUND_DAGAR && h.hink !== HINK.SVAR) {
    const d = Math.max(0, Math.round(trad.vaDagar));
    return { ...h, hink: HINK.SVAR, orsak: `VA:n skrev till kunden för ${d} dag${d === 1 ? '' : 'ar'} sedan (annan tråd) — pågående ärende, kunden är VA:ns`, svara: false, flagga: true, flytta: false, vaAtgard: false };
  }
  if (h.hink === HINK.ARG) return { ...h, svara: true, flagga: true, flytta: true, vaAtgard: true };
  if (h.hink === HINK.SVAR) return { ...h, svara: false, flagga: true, flytta: false, vaAtgard: false };

  // ENKEL — håller den mot faktan?
  // Bildförfrågan behöver ingen fakta: VA:n tar ärendet när bilderna kommit (flaggad + VA-mappen).
  if (h.typ === 'foton') return { ...h, orsak: 'skadad, defekt eller fel vara utan ilska — bildförfrågan (SOP 05/08), VA:n tar det vidare', svara: true, flagga: true, flytta: true, vaAtgard: true };
  // Returen: informationen direkt (Axels beslut 2026-09-22) — kräver en returadress i brandfilen; VA:n tar emot returen.
  if (h.typ === 'retur') {
    if (!String(brand?.tvister?.returadress ?? '').trim()) return { ...h, hink: HINK.SVAR, orsak: 'kunden ber om retur men brandfilen saknar tvister.returadress — VA:n', svara: false, flagga: true, flytta: false, vaAtgard: false };
    return { ...h, orsak: 'kunden ber om retur — returinformationen direkt (Axels beslut 2026-09-22), VA:n tar emot returen', svara: true, flagga: true, flytta: true, vaAtgard: true };
  }
  if (h.typ === 'foretag') {
    const f = brand?.svar?.foretag;
    if (!f?.namn || !f?.orgnr || !f?.adress) return { ...h, hink: HINK.SVAR, orsak: 'företagsuppgifter efterfrågade men brandfilen saknar svar.foretag — VA:n', svara: false, flagga: true, flytta: false, vaAtgard: false };
    return { ...h, svara: true, flagga: false, flytta: false, vaAtgard: false };
  }
  if (fakta?.sparr) return { ...h, hink: HINK.SVAR, orsak: fakta.sparr, svara: false, flagga: true, flytta: false, vaAtgard: false };
  const behoverOrder = ['wismo', 'adress'].includes(h.typ);
  if (behoverOrder && !fakta?.order) {
    if (h.typ === 'wismo' && brand?.svar?.fraga_ordernummer && fakta && !fakta.sparr) {
      return { ...h, typ: 'ordernummer', orsak: 'ingen order på ordernummer eller e-post — ber om ordernumret (SOP 36 steg 1), flaggad så VA:n ser tråden', svara: true, flagga: true, flytta: false, vaAtgard: false };
    }
    return { ...h, hink: HINK.SVAR, orsak: `${h.typ}: ingen order hittad på ordernummer eller kundens e-post — VA:n`, svara: false, flagga: true, flytta: false, vaAtgard: false };
  }
  if (h.typ === 'wismo' && fakta?.sparning?.levererad) {
    return { ...h, typ: 'levererad', orsak: 'levererat enligt fraktbolaget men kunden frågar var det är — checklistan (SOP 06), VA:n följer upp', svara: true, flagga: true, flytta: true, vaAtgard: true };
  }
  if (h.typ === 'adress') {
    if (fakta.order.sandningar?.length || fakta.order.fulfillment === 'fulfilled') return { ...h, hink: HINK.SVAR, orsak: 'adressbyte på en redan skickad order — VA:n', svara: false, flagga: true, flytta: false, vaAtgard: false };
    // Svaret går ut, men VA:n måste faktiskt ändra adressen: flaggas + VA-mappen.
    return { ...h, svara: true, flagga: true, flytta: true, vaAtgard: true };
  }
  return { ...h, svara: true, flagga: false, flytta: false, vaAtgard: false };
}
