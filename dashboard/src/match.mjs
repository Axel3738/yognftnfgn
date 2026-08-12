// Matchar en Meta-annons mot den Notion-task som gjorde den.
//
// Ägaren sa "annonserna heter ju samma i adkontot som i Notion". Det stämmer
// för ögat men inte för en sträng-jämförelse — bara 7% matchar exakt. Skillnaden
// är systematisk, inte slumpmässig:
//
//   Notion "101"                    Meta "NO 101 H1", "NO 101 H2", "NO 101 H3"
//   Notion "128 to norwegian"       Meta "NO 128 H2"
//   Notion "Enginecover_PD_23_H1"   Meta "Motorhölje_PD_1_H3"   (svenskt produktnamn)
//
// Meta-namnen bär marknadsprefix (NO) och hook-suffix (H1/H2/H3), och en enda
// Notion-task ger ofta flera Meta-annonser. Numret är det som håller.
//
// Eftersom resultatet styr utbetalningar matchas i NIVÅER med känd säkerhet.
// Bara 'exact' och 'number' används till pengar; 'fuzzy' visas för granskning
// men betalas inte ut förrän en människa sagt ja.

/** Marknadsprefix som förekommer i Meta-namnen men aldrig i Notion. */
const MARKET = /^(no|se|dk|fi|uk|nl|de|us|nyc)\s+/i;
/** Hook-suffix: H1, H2, h3, ibland med en efterföljande bokstav (L = liggande). */
const HOOK = /\s+h\s?\d+(\s+[a-z])?$/i;

export function normalise(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[_–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Annonsnumret — den enda delen som är stabil över marknader, hooks och språk.
 * "NO 101 H1" → 101, "128 to norwegian" → 128, "Translation 115" → 115.
 *
 * Returnerar null när det inte finns exakt ett rimligt nummer, hellre än att
 * plocka det första bästa. "NO 058 SE075" bär två nummer (samma annons i två
 * marknader) och "Cargoshorts_PD_H3_3" bär bara varianttal — båda ska falla
 * igenom till en säkrare nivå i stället för att gissa.
 */
export function adNumber(name) {
  const cleaned = normalise(name).replace(MARKET, '').replace(HOOK, '');
  // Strukturerade namn (Brand_ANGLE_nr_Hx) hanteras inte här — de har ingen
  // fristående numerisk identitet.
  if (/[a-z]{4,}_/i.test(String(name))) return null;

  const numbers = [...cleaned.matchAll(/\b(\d{1,4})\b/g)].map(m => Number(m[1]));
  if (numbers.length !== 1) return null;
  const n = numbers[0];
  return n >= 1 && n <= 9999 ? n : null;
}

/**
 * Strukturerade namn: Brand_ANGLE_nummer_Hook.
 * Produktnamnet finns på både svenska och engelska i olika system, så det
 * översätts innan jämförelse.
 */
const PRODUCT_ALIASES = {
  'motorhölje': 'enginecover',
  'motorholje': 'enginecover',
  'sätesskydd': 'seatcover',
  'satesskydd': 'seatcover',
  'strandtofflor': 'beachslippers',
  'trimmerbälte': 'trimmerbelt',
  'trimmerbalte': 'trimmerbelt',
};

export function structuredKey(name) {
  const raw = String(name || '');
  if (!raw.includes('_')) return null;
  const parts = normalise(raw).split(' ').filter(Boolean);
  if (parts.length < 3) return null;
  const product = PRODUCT_ALIASES[parts[0]] || parts[0];
  const angle = parts[1];
  const num = parts.slice(2).find(p => /^\d+$/.test(p));
  if (!angle || num == null) return null;
  return `${product}|${angle}|${num}`;
}

/**
 * Bygger ett register över Notion-tasks och matchar Meta-annonser mot det.
 *
 * @returns {{match(adName): {task, tier}|null, stats}}
 */
export function buildMatcher(tasks) {
  const byExact = new Map();
  const byNumber = new Map();
  const byStructured = new Map();
  const ambiguousNumbers = new Set();

  for (const t of tasks) {
    if (!t.title) continue;
    const exact = normalise(t.title);
    if (!byExact.has(exact)) byExact.set(exact, t);

    const key = structuredKey(t.title);
    if (key && !byStructured.has(key)) byStructured.set(key, t);

    const n = adNumber(t.title);
    if (n != null) {
      const prev = byNumber.get(n);
      if (prev && prev.editor && t.editor && prev.editor !== t.editor) {
        // Samma nummer, olika ägare — går inte att avgöra vem som ska betalas.
        ambiguousNumbers.add(n);
      }
      // Föredra en task som HAR en ansvarig; det är den som kan tillskrivas.
      if (!prev || (!prev.editor && t.editor)) byNumber.set(n, t);
    }
  }

  return {
    match(adName) {
      const exact = byExact.get(normalise(adName));
      if (exact) return { task: exact, tier: 'exact' };

      const key = structuredKey(adName);
      if (key && byStructured.has(key)) return { task: byStructured.get(key), tier: 'structured' };

      const n = adNumber(adName);
      if (n != null && byNumber.has(n) && !ambiguousNumbers.has(n)) {
        return { task: byNumber.get(n), tier: 'number' };
      }
      if (n != null && ambiguousNumbers.has(n)) return { task: null, tier: 'ambiguous' };
      return null;
    },
    stats: {
      exactKeys: byExact.size,
      numberKeys: byNumber.size,
      structuredKeys: byStructured.size,
      ambiguousNumbers: [...ambiguousNumbers],
    },
  };
}

/** Nivåer som får ligga till grund för utbetalning. */
export const PAYABLE_TIERS = new Set(['exact', 'structured', 'number']);
