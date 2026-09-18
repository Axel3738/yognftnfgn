// Länderna fabriken känner — EN tabell, inte sex. Till 2026-09-16 låg samma
// landskod → namn-karta kopierad i butik.mjs, checklista.mjs, frakt.mjs,
// marknad.mjs, startsida.mjs och tema.mjs, och ingen av dem kände USA. En ny
// marknad ska vara EN rad här — inte sex ställen att glömma ett av.
//
// Landskoden är ISO 3166-1 alpha-2 (SE, NO, US …). Allt annat härleds:
//   landsnamnSv(kod)     "USA" — kundtext på svenska (startsidans fraktrad m.m.)
//   landEn(kod)          "United States" — checklistan (VA:n läser engelska)
//   sprakEn(kod)         "English" — vad VA:n ser i adminen
//   lokalValuta(kod)     "USD" — marknadens egen valuta (slås på i admin)
//   standardLocale(kod)  "en" — Shopify-locale marknaden brukar få
//   landskodUrNamn(namn) "usa" → "US" (butik.huvudmarknad skrivs med namn)
//   ochLista(lander)     ["Sverige","Norge","USA"] → "Sverige, Norge & USA"
//
// Koden översätter aldrig kundtext — det här är egennamn, samma regel som
// LANDNAMN-kartorna hade. Noll beroenden.

const RADER = [
  // kod   sv               en               språk (en)   valuta  locale
  ['SE', 'Sverige',        'Sweden',        'Swedish',    'SEK', 'sv'],
  ['NO', 'Norge',          'Norway',        'Norwegian',  'NOK', 'nb'],
  ['DK', 'Danmark',        'Denmark',       'Danish',     'DKK', 'da'],
  ['FI', 'Finland',        'Finland',       'Finnish',    'EUR', 'fi'],
  ['DE', 'Tyskland',       'Germany',       'German',     'EUR', 'de'],
  ['GB', 'Storbritannien', 'United Kingdom', 'English',   'GBP', 'en'],
  ['US', 'USA',            'United States', 'English',    'USD', 'en'],
  // Engelsktalande länder i samma marknadsblock som USA (CaraShell 2026-09-17,
  // Axels beslut: "Nya Zeeland, Kanada, UK och Australien, samma annonser").
  ['CA', 'Kanada',         'Canada',        'English',    'CAD', 'en'],
  ['AU', 'Australien',     'Australia',     'English',    'AUD', 'en'],
  ['NZ', 'Nya Zeeland',    'New Zealand',   'English',    'NZD', 'en'],
];

const kodAv = (v) => String(v ?? '').trim().toUpperCase();
// "UK" är ingen ISO-kod men skrivs ändå — den betyder GB.
const ALIAS = { UK: 'GB' };
const rad = (kod) => {
  const k = ALIAS[kodAv(kod)] ?? kodAv(kod);
  return RADER.find((r) => r[0] === k) ?? null;
};

export const LANDSKODER = Object.freeze(RADER.map((r) => r[0]));

/** Svenskt namn, eller koden i versaler när landet är okänt (ingen gissning). */
export const landsnamnSv = (kod) => rad(kod)?.[1] ?? kodAv(kod);
/** Engelskt namn, eller koden. */
export const landEn = (kod) => rad(kod)?.[2] ?? kodAv(kod);
/** Språket på engelska, eller null. */
export const sprakEn = (kod) => rad(kod)?.[3] ?? null;
/** Marknadens egen valuta, eller null. */
export const lokalValuta = (kod) => rad(kod)?.[4] ?? null;
/** Shopify-locale marknaden brukar få, eller null. */
export const standardLocale = (kod) => rad(kod)?.[5] ?? null;
/** Känd landskod? */
export const arKandLandskod = (kod) => rad(kod) !== null;

/** "Sverige" / "sverige" / "USA" / "SE" → "SE"; okänt → null. */
export function landskodUrNamn(namn) {
  const s = String(namn ?? '').trim();
  if (!s) return null;
  if (/^[A-Za-z]{2}$/.test(s)) return arKandLandskod(s) ? (ALIAS[kodAv(s)] ?? kodAv(s)) : kodAv(s);
  const traff = RADER.find((r) => r[1].toLowerCase() === s.toLowerCase() || r[2].toLowerCase() === s.toLowerCase());
  return traff ? traff[0] : null;
}

/**
 * Lista i löptext: [] → "", [a] → "a", [a, b] → "a & b", [a, b, c] → "a, b & c".
 * Samma form som "Fri frakt – Sverige & Norge" hade, så en butik med två
 * länder ser exakt samma text som förut — och tre länder blir inte "A & B & C".
 */
export function ochLista(lander, bindeord = '&') {
  const l = (Array.isArray(lander) ? lander : []).map((x) => String(x ?? '').trim()).filter(Boolean);
  if (l.length === 0) return '';
  if (l.length === 1) return l[0];
  return `${l.slice(0, -1).join(', ')} ${bindeord} ${l.at(-1)}`;
}
