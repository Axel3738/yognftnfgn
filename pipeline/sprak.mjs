// sprak.mjs — språket i en HeyGen-körning: vilket språk marknaden SKA ha, och
// en gratis kontroll av att en text (SRT) faktiskt är på det språket.
//
// Varför filen finns (mätt 2026-09-20/22, CaraShell US-runda 7): translate-batch.mjs
// föll tillbaka på `Norwegian Bokmål (Norway)` när `--lang` saknades. Fyra
// videor för USA renderades då med NORSK röstmodell som läste ENGELSK text —
// "varannat ord på engelska, varannat på norska" (Axel). Batch-loggen påstod
// "amerikansk engelska"; HeyGens egen session sa `output_language: Norwegian`.
// Ingen kontroll läste HeyGens svar. Nu gör två det: tabellen nedan ger språket
// ur MARKNADEN (aldrig ur ett tyst standardvärde), och `kollaSprak` läser SRT:n.
//
// Ren logik, inga beroenden — testas i pipeline/test/sprak.test.mjs.

/** HeyGen-språk per marknadskod. Namnen är avlästa ur
 *  `listTargetLanguages()` 2026-09-22 (190 språk) — skriv aldrig in ett namn
 *  som inte står i den listan. Samma värden som factory/opsmarknader.mjs
 *  (NO/US/DK) och market-expansion/marknader.json (NO/DK/FI/UK). */
export const HEYGEN_SPRAK_PER_MARKNAD = Object.freeze({
  NO: 'Norwegian Bokmål (Norway)',
  US: 'English (United States)',
  DK: 'Danish (Denmark)',
  FI: 'Finnish (Finland)',
  UK: 'English (UK)',
  GB: 'English (UK)',
  CA: 'English (Canada)',
  AU: 'English (Australia)',
  NZ: 'English (New Zealand)',
});

/** HeyGen-språket för en marknad, eller null för en okänd kod. */
export function heygenSprakFor(marknad) {
  return HEYGEN_SPRAK_PER_MARKNAD[String(marknad ?? '').trim().toUpperCase()] ?? null;
}

/** Språkfamiljen ett HeyGen-språknamn tillhör: en | nb | da | fi | sv | null. */
export function sprakfamilj(heygenSprak) {
  const s = String(heygenSprak ?? '').toLowerCase();
  if (s.startsWith('english')) return 'en';
  if (s.startsWith('norwegian')) return 'nb';
  if (s.startsWith('danish')) return 'da';
  if (s.startsWith('finnish')) return 'fi';
  if (s.startsWith('swedish')) return 'sv';
  return null;
}

// Funktionsord per familj. Ord som delas mellan familjer står med i BÅDA
// listorna (de bär ändå information mot engelska/finska); orden som skiljer
// svenska/norska/danska åt (och/og, inte/ikke, är/er, att/at, jag/jeg,
// utan/uten/uden, vad/hva/hvad …) är det som avgör inom Skandinavien.
const LISTOR = {
  en: ['the', 'and', 'is', 'it', 'you', 'your', 'not', 'with', 'that', 'this', 'of', 'a', 'an', 'one', 'just', 'we', 'our', 'they',
    'when', 'from', 'need', 'only', 'or', 'be', 'are', 'was', 'do', 'does', 'have', 'has', 'can', 'will', 'if', 'what', 'who', 'how',
    'more', 'than', 'get', 'out', 'up', 'off', 'into', 'about', 'every', 'any', 'some', 'there', 'here', 'then', 'now', 'still',
    'dollars', 'day', 'days', 'nothing', 'without', 'no', 'yes', 'whole', 'all', 'by', 'its', 'my', 'me', 'him', 'her', 'them'],
  sv: ['och', 'inte', 'är', 'en', 'ett', 'som', 'på', 'till', 'för', 'med', 'av', 'du', 'din', 'ditt', 'dig', 'har', 'kan', 'ska',
    'bara', 'hela', 'när', 'från', 'ingen', 'alla', 'också', 'blir', 'vara', 'måste', 'vill', 'den', 'de', 'om', 'att', 'jag', 'vi',
    'ni', 'det', 'denna', 'detta', 'något', 'någon', 'mycket', 'vad', 'var', 'hur', 'utan', 'efter', 'före', 'kronor', 'kr', 'själv',
    'får', 'gör', 'inga', 'allt', 'så', 'nu', 'sen', 'sedan', 'än', 'både', 'eller', 'men', 'ju', 'mer'],
  nb: ['og', 'ikke', 'er', 'en', 'et', 'ei', 'som', 'på', 'til', 'for', 'med', 'av', 'du', 'din', 'ditt', 'deg', 'har', 'kan', 'skal',
    'bare', 'hele', 'når', 'fra', 'ingen', 'alle', 'også', 'blir', 'være', 'må', 'vil', 'den', 'de', 'om', 'at', 'jeg', 'vi', 'dere',
    'det', 'denne', 'dette', 'noe', 'noen', 'mye', 'hva', 'hvor', 'hvordan', 'uten', 'etter', 'før', 'kroner', 'kr', 'selv', 'får',
    'gjør', 'gjøre', 'bli', 'nok', 'sånn', 'veldig', 'litt', 'ut', 'nå', 'så', 'eller', 'men', 'mer', 'både', 'enn'],
  da: ['og', 'ikke', 'er', 'en', 'et', 'som', 'på', 'til', 'for', 'med', 'af', 'du', 'din', 'dit', 'dig', 'har', 'kan', 'skal',
    'bare', 'hele', 'når', 'fra', 'ingen', 'alle', 'også', 'bliver', 'være', 'må', 'vil', 'den', 'de', 'om', 'at', 'jeg', 'vi',
    'det', 'denne', 'dette', 'noget', 'nogen', 'meget', 'hvad', 'hvor', 'hvordan', 'uden', 'efter', 'før', 'kroner', 'kr', 'selv',
    'får', 'gør', 'gøre', 'blive', 'nok', 'sådan', 'lidt', 'ud', 'nu', 'så', 'eller', 'men', 'mere', 'både', 'end', 'kun'],
  fi: ['ja', 'ei', 'on', 'se', 'että', 'joka', 'kun', 'tai', 'myös', 'vain', 'kaikki', 'sinun', 'sinä', 'tämä', 'ole', 'voi',
    'mutta', 'jos', 'niin', 'kanssa', 'ilman', 'koko', 'yksi', 'ovat', 'olla', 'mitä', 'miten', 'nyt', 'vielä', 'euroa', 'ei'],
};
export const SPRAKFAMILJER = Object.freeze(Object.keys(LISTOR));
const MANGDER = Object.fromEntries(Object.entries(LISTOR).map(([k, v]) => [k, new Set(v)]));

/** Textraderna ur en SRT: index och tidskoder bort. */
export function srtText(srt) {
  return String(srt ?? '')
    .split(/\r?\n/)
    .filter((r) => r.trim() && !/^\d+$/.test(r.trim()) && !/-->/.test(r))
    .join('\n');
}

const orden = (text) => String(text ?? '').toLowerCase().match(/[a-zåäöæøü']+/g) ?? [];

/**
 * Gissar språkfamiljen i en text. Räknar funktionsord per familj.
 *   { sprak, poang: { en, sv, nb, da, fi }, ord }
 * `sprak` är null när texten är för kort (< 8 ord) eller två familjer ligger
 * jämnt (norska/danska delar det mesta) — då avgör anroparen om det räcker.
 */
export function gissaSprak(text) {
  const ord = orden(text);
  const poang = Object.fromEntries(SPRAKFAMILJER.map((k) => [k, 0]));
  for (const o of ord) for (const k of SPRAKFAMILJER) if (MANGDER[k].has(o)) poang[k]++;
  const ordnade = [...SPRAKFAMILJER].sort((a, b) => poang[b] - poang[a]);
  const [b1, b2] = ordnade;
  let sprak = null;
  if (ord.length >= 8 && poang[b1] >= 3 && poang[b1] > poang[b2] * 1.25) sprak = b1;
  return { sprak, poang, ord: ord.length, topp: ordnade.slice(0, 2) };
}

/**
 * Är texten på den förväntade familjen? Ren dom:
 *   ok: true   — förväntad familj vinner, eller ligger jämnt med vinnaren
 *   ok: false  — en ANNAN familj vinner klart (förväntad under 60 % av vinnaren)
 *   ok: null   — för lite text att döma (< 8 ord eller < 3 träffar)
 * Texten som gick fel 2026-09-20 var engelska (~90 ord) i en session som
 * förväntade norska: en = 30+, nb = 0 → false. Det är hela poängen.
 */
export function kollaSprak(text, forvantad) {
  const f = String(forvantad ?? '').toLowerCase();
  const g = gissaSprak(text);
  if (!SPRAKFAMILJER.includes(f)) return { ok: null, forvantad: f, gissat: g.sprak, poang: g.poang, ord: g.ord, skal: `okänd språkfamilj "${forvantad}"` };
  const vinnare = g.topp[0];
  const vinst = g.poang[vinnare];
  if (g.ord < 8 || vinst < 3) return { ok: null, forvantad: f, gissat: null, poang: g.poang, ord: g.ord, skal: `för lite text att döma (${g.ord} ord, ${vinst} träffar)` };
  const egen = g.poang[f];
  // Under 60 % av vinnarens träffar är fel språk. Svenska/norska/danska delar
  // många ord, så en svensk text i en norsk session hamnar ~50 % (mätt i testet),
  // medan norska mot danska ligger jämnt (≥ 90 %) och släpps igenom.
  if (vinnare !== f && egen < vinst * 0.6) {
    return { ok: false, forvantad: f, gissat: vinnare, poang: g.poang, ord: g.ord, skal: `texten är ${namnFor(vinnare)} (${vinst} funktionsord), inte ${namnFor(f)} (${egen})` };
  }
  return { ok: true, forvantad: f, gissat: g.sprak ?? f, poang: g.poang, ord: g.ord, skal: null };
}

const NAMN = { en: 'engelska', sv: 'svenska', nb: 'norska', da: 'danska', fi: 'finska' };
export const namnFor = (k) => NAMN[k] ?? String(k);

/** Språk och locale ur ett HeyGen-id ("…-nb-nb-NO" → { kod: 'nb', locale: 'nb-NO' }).
 *  Bara för rapportering — HeyGens `output_language` är facit. */
export function sprakUrHeygenId(id) {
  const m = /-([a-z]{2})(?:-([a-z]{2})-([A-Z]{2}))?$/.exec(String(id ?? ''));
  if (!m) return null;
  return { kod: m[1], locale: m[2] && m[3] ? `${m[2]}-${m[3]}` : null };
}
