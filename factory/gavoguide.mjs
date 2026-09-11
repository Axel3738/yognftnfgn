// gavoguide.mjs — gåvoguidens poängmodell. Ren logik, noll beroenden.
//
// Varför den ligger här och inte i temats JS: spärrarna måste gå att TESTA.
// "En alkoholtemakalender får aldrig föreslås till ett barn" är inte en
// åsikt om konvertering, det är ett löfte till kunden — och ett löfte som
// bara finns i en webbläsarfil kan ingen bevisa håller.
//
// Filen är skriven så att den fungerar på BÅDA ställena: här som ESM-modul
// (tester, Node) och i temat, där factory/tema.mjs bakar in samma källkod i
// assets/ms-gavoguide.js efter att ha strippat `export`. Därför finns det
// ingen kopia att glömma att uppdatera, och därför får filen inte importera
// någonting — webbläsaren har ingen modulladdare i den scriptaggen.
//
// ORDNINGEN ÄR REGELN:
//   1. Uteslutningar  — hårda, går före allt.
//   2. Prisfilter     — mjukt, släpps hellre än att lämna kunden utan svar.
//   3. Poäng          — mjuka preferenser, avgör bara vem som vinner.

/** Antalet produkter guiden visar: en träff plus två alternativ. */
export const RESULTAT_ANTAL = 3;

/**
 * Hårda uteslutningar. Varje regel får kundens valda taggar och produktens
 * quiz-objekt och svarar: ska den här produkten bort helt?
 *
 * Lägg till en regel HÄR — aldrig i poängräkningen. En spärr som uttrycks
 * som "minuspoäng" är ingen spärr: den kan vägas upp av tillräckligt många
 * träffar någon annanstans, och då står en whiskykalender som julklapp till
 * en sjuåring.
 */
export const UTESLUT = [
  {
    id: 'alkohol-till-barn',
    varfor: 'alkoholtema föreslås aldrig till barn eller tonåring',
    test: (taggar, q) =>
      q.alkoholtema === true && (taggar.has('mottagare:barn') || taggar.has('mottagare:tonaring')),
  },
  {
    id: 'sma-delar',
    varfor: 'smådelar föreslås aldrig när kunden valt att mottagaren är under tre år',
    test: (taggar, q) => taggar.has('krav:utan-sma-delar') && q.sma_delar === true,
  },
  {
    id: 'fyll-sjalv',
    varfor: 'kunden har bett om en kalender att fylla själv',
    test: (taggar, q) =>
      taggar.has('krav:fyll-sjalv') && !(q.taggar || []).includes('egenskap:fyll-sjalv'),
  },
];

/** Prisspärren kunden valde, eller null. Mjuk: se rangordna(). */
export function prisTak(taggar) {
  if (taggar.has('pris:under-400')) return 400;
  if (taggar.has('pris:400-600')) return 600;
  return null;
}

/** Produktens poäng: summan av vikterna för de taggar den delar med svaren. */
export function poang(taggar, vikter, q) {
  let p = 0;
  for (const t of q.taggar || []) {
    if (taggar.has(t)) p += vikter[t] || 1;
  }
  return p;
}

/** Svarens taggar och deras vikt. En tagg som förekommer i två frågor får
 *  den högsta vikten, inte summan — annars kan en bred fråga dränka en smal. */
export function taggarOchVikter(valda) {
  const taggar = new Set();
  const vikter = {};
  for (const v of valda || []) {
    for (const t of v.taggar || []) {
      taggar.add(t);
      vikter[t] = Math.max(vikter[t] || 0, v.vikt || 1);
    }
  }
  return { taggar, vikter };
}

/**
 * Rangordnar produkterna mot kundens svar.
 *
 *   produkter  [{ handle, pris, quiz: { taggar[], mening, sma_delar, alkoholtema } }]
 *   valda      [{ taggar: [], vikt: n, etikett }]  — ett per besvarad fråga
 *
 * Returnerar { rankade, not, uteslutna }. `not` är 'budget' när prisfiltret
 * fick släppas — guiden skriver då ut varför, i stället för att låtsas att
 * svaret låg inom budgeten.
 *
 * Guiden svarar ALLTID när det finns minst en produkt som klarar spärrarna.
 * Ett tomt resultat betyder att spärrarna tog allt, och det är rätt svar:
 * hellre "ingen av våra passar" än en olämplig rekommendation.
 */
export function rangordna(produkter, valda) {
  const { taggar, vikter } = taggarOchVikter(valda);

  const kvar = (produkter || []).filter((p) => !UTESLUT.some((r) => r.test(taggar, p.quiz || {})));

  let not = '';
  const tak = prisTak(taggar);
  if (tak !== null) {
    const inomBudget = kvar.filter((p) => p.pris <= tak);
    if (inomBudget.length > 0) {
      return { rankade: sortera(kvar.filter((p) => p.pris <= tak), taggar, vikter), not, uteslutna: produkter.length - inomBudget.length };
    }
    if (kvar.length > 0) not = 'budget';
  }

  return { rankade: sortera(kvar, taggar, vikter), not, uteslutna: produkter.length - kvar.length };
}

function sortera(lista, taggar, vikter) {
  return lista
    .map((p) => ({ produkt: p, poang: poang(taggar, vikter, p.quiz || {}) }))
    .sort((a, b) => (b.poang !== a.poang ? b.poang - a.poang : a.produkt.pris - b.produkt.pris));
}
