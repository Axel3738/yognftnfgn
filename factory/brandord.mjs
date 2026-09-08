// brandord.mjs — hittar källbrandet (Bäverbutiken) i text. Noll beroenden.
//
// EN matchare för alla fyra ytorna i brand-detektorn: ad copy, SRT-transkript,
// OCR ur videoframes och OCR ur bildannonser. Ytorna läses på olika sätt men
// domen ska aldrig bero på VILKEN yta texten kom ifrån.
//
// Varför fuzzy och inte en fast lista: yta 2 (talet) läses ur HeyGens
// transkript, och HeyGen hör fel. Mätt i repots 217 svenska transkript
// 2026-09-08: "Bäverbutiken" 26 träffar, "Bawebutiken" 8, "Spavebutiken" 2.
// En fast lista missar nästa felhörning tyst — och tyst är det farliga.
// Därför: kända former exakt + Levenshtein ≤ 3 mot stammen för allt som
// slutar på butiken/butikken. Varje träff redovisas ORDAGRANT så en
// felaktig fuzzy-träff syns i rapporten i stället för att gömma sig.

/** Kända skrivningar av källbrandet. Gemener, utan diakriter. */
export const KÄNDA_FORMER = [
  'baverbutiken',      // Bäverbutiken (SE)
  'beverbutikken',     // Beverbutikken (NO)
  'bawebutiken',       // HeyGen-felhörning, 8 träffar i korpuset
  'spavebutiken',      // HeyGen-felhörning, 2 träffar
];

/** Domäner som pekar ut källbutiken. Träff här är alltid en riktig träff. */
export const KÄNDA_DOMÄNER = ['baverbutiken.se', 'bäverbutiken.se', 'beverbutikken.no'];

const STAMMAR = ['baverbutiken', 'beverbutikken'];
const SUFFIX = /(butiken|butikken)$/;
const MAX_AVSTÅND = 3;

/** Gemener, å/ä/ö → a/a/o, allt annat än a–z0–9 bort. "BÄVERBUTIKEN.se" → "baverbutikense" */
export function normalisera(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, '');
}

/** Levenshtein-avstånd, avbryter när det passerat taket. */
export function avstånd(a, b, tak = MAX_AVSTÅND) {
  if (Math.abs(a.length - b.length) > tak) return tak + 1;
  let förra = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const rad = [i];
    let minst = i;
    for (let j = 1; j <= b.length; j++) {
      const kostnad = a[i - 1] === b[j - 1] ? 0 : 1;
      rad[j] = Math.min(rad[j - 1] + 1, förra[j] + 1, förra[j - 1] + kostnad);
      if (rad[j] < minst) minst = rad[j];
    }
    if (minst > tak) return tak + 1;
    förra = rad;
  }
  return förra[b.length];
}

/**
 * Söker källbrandet i en text.
 * @param {string} text
 * @param {string[]} extraOrd  fler former att räkna som brandet (produktfilens kalla.extra_brandord)
 * @returns {{träff: boolean, fynd: Array<{ord: string, form: string, sätt: string}>}}
 *   `ord` = det som faktiskt stod i texten, `form` = vad det matchade,
 *   `sätt` = "domän" | "exakt" | "fuzzy(<avstånd>)".
 */
export function sökBrand(text, extraOrd = []) {
  const rå = String(text ?? '');
  const fynd = [];
  const sett = new Set();
  const lägg = (ord, form, sätt) => {
    const nyckel = `${normalisera(ord)}|${sätt}`;
    if (sett.has(nyckel)) return;
    sett.add(nyckel);
    fynd.push({ ord, form, sätt });
  };

  const platt = normalisera(rå);
  for (const d of KÄNDA_DOMÄNER) {
    if (rå.toLowerCase().includes(d)) lägg(d, d, 'domän');
  }

  const former = [...KÄNDA_FORMER, ...extraOrd.map(normalisera)].filter(Boolean);

  // Sammanskrivna träffar (URL:er, hashtaggar, OCR utan mellanslag) fångas på
  // den plattade texten. Ordträffarna nedan ger det ordagranna belägget.
  for (const f of former) {
    if (platt.includes(f)) lägg(f, f, 'exakt');
  }

  for (const råttOrd of rå.split(/[\s/\\|,;:()[\]{}"'«»…]+/)) {
    const ord = normalisera(råttOrd);
    if (ord.length < 8 || ord.length > 20) continue;
    if (former.some((f) => ord.includes(f))) { lägg(råttOrd, ord, 'exakt'); continue; }
    if (!SUFFIX.test(ord)) continue;
    for (const stam of STAMMAR) {
      const d = avstånd(ord, stam);
      if (d > 0 && d <= MAX_AVSTÅND) { lägg(råttOrd, stam, `fuzzy(${d})`); break; }
    }
  }

  return { träff: fynd.length > 0, fynd };
}
