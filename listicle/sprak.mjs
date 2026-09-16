// sprak.mjs — språket och valutan för en listicle: de fasta texterna sidan
// bär utanför copyn (författarraden, datumraden, "Sammanfattning:",
// reklammärkningen), hur ett pris skrivs och läses, och orden spärrarna letar
// efter (perioden i "Vi testade …", antalet i "N anledningar", de förbjudna
// fraserna). EN tabell per språk, samma tanke som factory/lander.mjs.
//
// Bakgrund 2026-09-16 kväll: Axel ville ha CaraShells två lagerrensningssidor
// "för carashell.com" — samma Shopify-butik, USA-marknaden med engelska på
// egen domän och USD. Sidan får då en ÖVERSÄTTNING (Shopifys Translations
// API, locale en), inte en dubblettsida, och allt som inte är copy måste
// byta språk med den. Till dess låg "Av", "Senast uppdaterad", "OBS: Detta
// är reklam." och "kr" hårdkodade i html.mjs och gempages.mjs.
//
// Ny marknad med nytt språk = en rad i SPRAK (och valutan i VALUTOR). Ingen
// if-sats någon annanstans. Koden översätter aldrig copy — den skrivs av
// huvudsessionen mot marknadens egen produktsida.

// ------------------------------------------------------------ datum

const MANADER_SV = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december'];
const MANADER_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function delarAv(iso) {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d || m < 1 || m > 12) throw new Error(`Ogiltigt datum "${iso}" — skriv YYYY-MM-DD.`);
  return [y, m, d];
}

/** "2026-09-16" → "16 september 2026". */
export function svensktDatum(iso) {
  const [y, m, d] = delarAv(iso);
  return `${d} ${MANADER_SV[m - 1]} ${y}`;
}

/** "2026-09-16" → "September 16, 2026" (amerikansk form — USA är första engelska marknaden). */
export function engelsktDatum(iso) {
  const [y, m, d] = delarAv(iso);
  return `${MANADER_EN[m - 1]} ${d}, ${y}`;
}

// ------------------------------------------------------------ valutor

/** Heltalsdelen grupperad: 1129 → "1 129" (mellanslag) eller "1,129" (komma). */
const grupperat = (hel, skilje) => String(Math.abs(hel)).replace(/\B(?=(\d{3})+(?!\d))/g, skilje);

function delaTal(tal) {
  const n = Number(tal);
  if (!Number.isFinite(n)) return null;
  const hel = Math.trunc(n);
  const ore = Math.round((n - hel) * 100);
  return { n, hel, ore };
}

/** Svenskt pristal: 599 → "599 kr", 1129 → "1 129 kr". Hela kronor; ören visas bara om de finns. */
export function prisText(tal) {
  const t = delaTal(tal);
  if (!t) return '';
  return `${t.hel < 0 ? '-' : ''}${grupperat(t.hel, ' ')}${t.ore ? `,${String(t.ore).padStart(2, '0')}` : ''} kr`;
}

/** Dollar/pund/euro framför talet: 199 → "$199", 1129 → "$1,129", 99.5 → "$99.50". */
const framforTal = (tecken) => (tal) => {
  const t = delaTal(tal);
  if (!t) return '';
  return `${t.hel < 0 ? '-' : ''}${tecken}${grupperat(t.hel, ',')}${t.ore ? `.${String(t.ore).padStart(2, '0')}` : ''}`;
};

// Prisläsningen: talet som fångas + hur det tolkas. "kr"-valutorna delar
// mönster (mellanslag som tusentalsavgränsare, komma som decimal); dollar/
// pund/euro har komma som tusental och punkt som decimal.
const KR_MONSTER = /(\d[\d \u00a0\u202f]*(?:[.,]\d{1,2})?)\s?(?:kr\b|:-)/gi;
const krTal = (s) => Number(String(s).replace(/[ \u00a0\u202f]/g, '').replace(',', '.'));
const punktTal = (s) => Number(String(s).replace(/,/g, ''));
const teckenMonster = (tecken, kod, ord) => new RegExp(`${tecken}\\s?(\\d[\\d,]*(?:\\.\\d{1,2})?)|(\\d[\\d,]*(?:\\.\\d{1,2})?)\\s?(?:${kod}|${ord})\\b`, 'gi');

export const VALUTOR = Object.freeze({
  SEK: Object.freeze({ kod: 'SEK', format: prisText, monster: KR_MONSTER, tolka: krTal, i_copy: '"599 kr", "1 129 kr"' }),
  NOK: Object.freeze({ kod: 'NOK', format: prisText, monster: KR_MONSTER, tolka: krTal, i_copy: '"599 kr", "1 129 kr"' }),
  DKK: Object.freeze({ kod: 'DKK', format: prisText, monster: KR_MONSTER, tolka: krTal, i_copy: '"599 kr", "1 129 kr"' }),
  USD: Object.freeze({ kod: 'USD', format: framforTal('$'), monster: teckenMonster('\\$', 'USD', 'dollars?'), tolka: punktTal, i_copy: '"$199", "$1,129", "$99.50"' }),
  GBP: Object.freeze({ kod: 'GBP', format: framforTal('£'), monster: teckenMonster('£', 'GBP', 'pounds?'), tolka: punktTal, i_copy: '"£199", "£1,129"' }),
  EUR: Object.freeze({ kod: 'EUR', format: framforTal('€'), monster: teckenMonster('€', 'EUR', 'euros?'), tolka: punktTal, i_copy: '"€199", "€1,129"' }),
});

const valutaKod = (v) => String(v ?? 'SEK').trim().toUpperCase();

/** Valutan för en kod. Kastar på okänd — ett pris i fel valuta är ett fel på sidan. */
export function valutaFor(kod) {
  const v = VALUTOR[valutaKod(kod)];
  if (!v) throw new Error(`Okänd valuta "${kod}". Kända: ${Object.keys(VALUTOR).join(', ')} (listicle/sprak.mjs).`);
  return v;
}

/** 1129 → "1 129 kr" (SEK) / "$1,129" (USD). */
export const formateraPris = (tal, valuta = 'SEK') => valutaFor(valuta).format(tal);

/** Alla priser i en text i den valutan: "299 kr, 1 129 kr" → [299, 1129]; "$199 instead of $249" → [199, 249]. */
export function priserI(text, valuta = 'SEK') {
  const v = valutaFor(valuta);
  const ut = [];
  const re = new RegExp(v.monster.source, v.monster.flags);
  for (const m of String(text ?? '').matchAll(re)) {
    const tal = m.slice(1).find((x) => x != null);
    const n = v.tolka(tal);
    if (Number.isFinite(n)) ut.push(n);
  }
  return ut;
}

// ------------------------------------------------------------ språken

export const SPRAK = Object.freeze({
  sv: Object.freeze({
    locale: 'sv', namn: 'svenska', lang: 'sv',
    av: 'Av', sammanfattning: 'Sammanfattning:', reklam: 'OBS: Detta är reklam.',
    lagret: 'Lagret', punkt: 'punkt',
    datumrad: (iso) => `Senast uppdaterad ${svensktDatum(iso)}.`,
    periodOrd: /\b(dag|dagar|dygn|vecka|veckor|månad|månader|vinter|sommar|höst|vår|säsong|år)\b/i,
    antalOrd: Object.freeze({ 5: 'fem', 7: 'sju' }),
    forbjudna: Object.freeze(['innan lagret tar slut', 'innan det tar slut', 'sista chansen']),
    forbjudnaTips: 'skriv "så länge lagret räcker"',
    fetTips: 'skriv **fet** i stället för taggar',
  }),
  en: Object.freeze({
    locale: 'en', namn: 'engelska', lang: 'en',
    av: 'By', sammanfattning: 'Summary:', reklam: 'Note: this is an advertisement.',
    lagret: 'The warehouse', punkt: 'point',
    datumrad: (iso) => `Last updated ${engelsktDatum(iso)}.`,
    periodOrd: /\b(day|days|week|weeks|month|months|winter|summer|fall|autumn|spring|season|year)\b/i,
    antalOrd: Object.freeze({ 5: 'five', 7: 'seven' }),
    forbjudna: Object.freeze(['before stock runs out', 'before it runs out', "before it's gone", 'before they’re gone', "before they're gone", 'last chance']),
    forbjudnaTips: 'write "while stock lasts"',
    fetTips: 'write **bold** instead of tags',
  }),
});

export const SPRAKKODER = Object.freeze(Object.keys(SPRAK));
export const STANDARD_SPRAK = 'sv';

const sprakKod = (v) => String(v ?? STANDARD_SPRAK).trim().toLowerCase().split(/[-_]/)[0];

/** Språket för en locale ("en", "en-US" → en). Kastar på okänt — en sida på ett språk motorn inte kan är en halv sida. */
export function sprakFor(locale = STANDARD_SPRAK) {
  const s = SPRAK[sprakKod(locale)];
  if (!s) throw new Error(`Okänt språk "${locale}". Kända: ${SPRAKKODER.join(', ')} (listicle/sprak.mjs).`);
  return s;
}

export const arKantSprak = (locale) => Boolean(SPRAK[sprakKod(locale)]);

/**
 * Konceptet på ett annat språk: koncept/<id>.json bär `sprak.<locale>` med de
 * fält som byter språk (sidnamn, sidtitel, forfattare_obrandad, arlig_rubrik,
 * riskfritt_rubrik). Svenska = konceptet som det är. Saknas språket i
 * konceptet stoppar bygget — en engelsk sida med "Anders på lagret" är fel.
 */
export function konceptForSprak(koncept, locale = STANDARD_SPRAK) {
  const kod = sprakKod(locale);
  if (kod === STANDARD_SPRAK) return koncept;
  const over = koncept?.sprak?.[kod];
  if (!over) throw new Error(`Konceptet ${koncept?.id ?? '?'} saknar texterna för språket "${kod}" (fältet "sprak": { "${kod}": { sidnamn, sidtitel, forfattare_obrandad } } i listicle/koncept/${koncept?.id}.json).`);
  for (const f of ['sidnamn', 'sidtitel', 'forfattare_obrandad']) if (!over[f]) throw new Error(`Konceptet ${koncept.id}, språket ${kod}: saknar "${f}".`);
  return { ...koncept, sidnamn: over.sidnamn, sidtitel: over.sidtitel, forfattare_obrandad: over.forfattare_obrandad, arlig_rubrik: over.arlig_rubrik ?? koncept.arlig_rubrik, riskfritt_rubrik: over.riskfritt_rubrik ?? koncept.riskfritt_rubrik, sprak: koncept.sprak };
}
