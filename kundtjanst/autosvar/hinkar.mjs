// hinkar.mjs — vilken hink ett inkommande kundmejl hamnar i. RENA REGLER,
// samma svar varje gång, ingen modell. Det är avsiktligt: ett automatiskt
// svar till en kund måste gå att förklara efteråt ("den hamnade i ENKEL för
// att …"), och en regel som ändras är en commit, inte en känsla.
//
// Tre hinkar (Axels spec 2026-09-21) plus en tyst:
//   ENKEL  — var är min order, leveranstid, byte av adress före leverans,
//            öppettider. AI svarar själv, med fakta ur Shopify + 17TRACK.
//            Saknas fakta går mejlet till SVÅR — aldrig ett gissat svar.
//   ARG    — frustration, hot om bank/ARN/recension, "aldrig fått", trasig
//            vara, tredje mejlet utan svar. EN lugnande rad (Axels mall), sen
//            flaggas tråden och flyttas till VA-mappen.
//   SVÅR   — allt annat: retur, återbetalning, reklamation, tvist, fel vara,
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
import { arSystem, arEgen } from '../arenden.mjs';

export const HINK = Object.freeze({ ENKEL: 'ENKEL', ARG: 'ARG', SVAR: 'SVÅR', SKIP: 'SKIP' });

// Axels ord (2026-09-21) + de nordiska formerna. En träff = SVÅR utan svar.
const TVISTORD = [
  'chargeback', 'charge back', 'charge-back', 'dispute', '\\barn\\b', 'reklamationsnämnd', 'reklamationsnemnd', 'klarna.?tvist', 'klarna.?dispute',
  '\\btvist(en|er|erna)?\\b', 'återkrav', 'tilbakeføring', 'chargebacken',
].map((o) => new RegExp(`(^|[^a-zåäöøæ])${o}`, 'i'));

// Ilska utöver klassificeringens eskaleringsord (sv/nb/da/fi/en).
// "skit", "skräp", "bluff", "betalar inte" lades till 2026-09-21 kväll efter
// den första torrkörningen: "Vad är det här för skit? … Det här betalar jag
// inte för" och "Det är rent skräp" hamnade i SVÅR i stället för ARG.
const ARGORD = [
  '\\barg\\b', 'förbannad', 'irriterad', 'besviken', 'frustrerad', 'urusel', '\\busel\\b', 'fruktansvärt', 'hemskt', 'skäms', 'aldrig mer', 'sista gången', 'oseriös', 'katastrof',
  '\\bskit\\b', 'skitprodukt', 'skräp', 'bluff', 'bedrägeri', 'lurad', 'lurade', 'betalar (jag |vi )?inte', 'oacceptabel', 'skandal', 'skämt', 'dålig kvalit', 'usel kvalit', 'tunt som en',
  '\\bsint\\b', 'forbanna', 'skuffet', 'frustrert', 'elendig', 'aldri mer', 'siste gang', 'useriøs', 'søppel', 'svindel', '\\blurt\\b', '\\bdritt\\b', 'uakseptabel',
  '\\bvred\\b', 'skuffet', 'frustreret', 'elendigt', 'aldrig mere', 'sidste gang', 'skrald', 'snydt', '\\blort\\b', 'uacceptabel',
  'vihainen', 'pettynyt', 'turhautunut', 'surkea', 'en ikinä enää', 'roska', 'huijaus', 'paska',
  'pissed', 'angry', 'furious', 'disappointed', 'frustrated', 'terrible', 'awful', '\\bworst\\b', 'never again', 'disgusting', 'ridiculous', 'unacceptable', 'joke\\b', '\\bscam\\b', 'fraud', 'rip-?off', 'garbage', 'rubbish', '\\bcrap\\b',
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

/** Andelen VERSALORD (≥ 4 bokstäver) i texten — "JAG VILL HA MINA PENGAR" är inte lugn. */
function versalandel(text) {
  const ord = String(text ?? '').match(/[A-ZÅÄÖØÆa-zåäöøæ]{4,}/g) ?? [];
  if (ord.length < 6) return 0;
  return ord.filter((o) => o === o.toUpperCase()).length / ord.length;
}

/**
 * Är mejlet argt? Ren. `klass` är klassificera(); `trad` bär
 * antalInkommande/antalSvar för tråden.
 */
export function arArg({ klass, amne = '', text = '', trad = null } = {}) {
  const orsaker = [];
  const a = normalisera(amne);
  const t = normalisera(text);
  if (klass.kategori === 'chargeback_hot') orsaker.push('hot om bank/anmälan/recension');
  if (klass.kategori === 'ej_levererad') orsaker.push('säger sig aldrig ha fått paketet');
  if (klass.kategori === 'skadad_defekt') orsaker.push('trasig eller defekt vara');
  if (klass.eskalering >= 1) orsaker.push(`eskaleringsord (${klass.eskalering})`);
  if (ARGORD.some((re) => re.test(a) || re.test(t))) orsaker.push('argt ordval');
  if ((String(text).match(/!{2,}/g) ?? []).length >= 1 || (String(text).match(/!/g) ?? []).length >= 3) orsaker.push('många utropstecken');
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
const ALDRIG_ENKEL = new Set(['retur_angerratt', 'aterbetalning', 'fel_vara', 'skadad_defekt', 'avbestallning', 'faktura_klarna', 'okand_debitering', 'chargeback_hot', 'ej_levererad']);

/** Vilken enkel fråga det är, eller null. Ren. */
export function enkelTyp({ klass, amne = '', text = '' }) {
  const a = normalisera(amne);
  const t = normalisera(text);
  const traff = (lista) => lista.some((re) => re.test(a) || re.test(t));
  if ((klass.alla ?? []).some((x) => ALDRIG_ENKEL.has(x.id))) return null;
  if (traff(FORETAG)) return 'foretag';
  if (traff(ADRESS)) return 'adress';
  if (traff(OPPETTIDER)) return 'oppettider';
  // Leveranstid utan order = fråga före köp. Med ordernummer eller ordertext är det WISMO.
  if (traff(LEVERANSTID) && !klass.ordernummer.length && !traff(HAR_ORDER)) return 'leveranstid';
  if (klass.kategori === 'var_ar_ordern' || traff(LEVERANSTID)) return 'wismo';
  return null;
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

  if (harTvistord(`${amne}\n${text}`)) return { ...bas, hink: HINK.SVAR, orsak: 'tvistord i mejlet (chargeback/dispute/ARN/tvist) — bara VA:n' };
  if (mejl.bilaga) return { ...bas, hink: HINK.SVAR, orsak: 'mejlet har en bilaga motorn inte läst' };
  if (String(text).trim().length < 8) return { ...bas, hink: HINK.SVAR, orsak: 'nästan ingen text att läsa' };

  const ilska = arArg({ klass, amne, text, trad });
  if (ilska.arg) return { ...bas, hink: HINK.ARG, orsak: ilska.orsaker.join(', '), argOrsaker: ilska.orsaker };

  const typ = enkelTyp({ klass, amne, text });
  if (typ) return { ...bas, hink: HINK.ENKEL, typ, orsak: `enkel fråga: ${typ}` };
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
  if (h.hink === HINK.ARG) return { ...h, svara: true, flagga: true, flytta: true, vaAtgard: true };
  if (h.hink === HINK.SVAR) return { ...h, svara: false, flagga: true, flytta: false, vaAtgard: false };

  // ENKEL — håller den mot faktan?
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
