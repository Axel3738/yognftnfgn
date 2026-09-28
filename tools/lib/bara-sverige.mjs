// bara-sverige.mjs — vinkelkoder vars annonser ALDRIG lämnar Sverige.
//
// Fars dag-batchen 2026-09-28 (Axels order: "en batch på varje produkt som vi
// skalar just nu … fars dag-rea … fars dag den åttonde november") bär koden
// FD i namnet (`Takoverdrag_FD_1_H1`). Copyn säger "fars dag 8 november" och
// "beställ senast 19 oktober" — båda gäller svenska kunder:
//   • i USA, Storbritannien, Kanada och Danmark firas fars dag i juni, så en
//     engelsk eller dansk version hade påstått fel datum;
//   • sista beställningsdagen är räknad på leveranstiden till Sverige
//     (klaviyo/brands/baverbutiken.json → kalender, p90 20 dygn).
// Därför översätts de inte (/oversatt, tools/oversattningskon.mjs) och speglas
// inte till en OPS-butik (/ops-spegla, tools/ops-spegla.mjs) — raden går
// direkt till Approved efter den svenska uppladdningen.
//
// Regeln läser vinkelfältet (fält 2 i namnet), aldrig en fri textsökning:
// "FD" får inte fångas av ett produktprefix som råkar innehålla bokstäverna.

export const BARA_SVERIGE = Object.freeze({
  FD: 'fars dag-annons (fars dag 8 november, beställ senast 19 oktober) — bara Sverige: i USA och Danmark firas fars dag i juni, och sista beställningsdagen är räknad på leveranstiden till Sverige',
});

/** Vinkelkoden (fält 2) ur ett annonsnamn, i versaler — eller null. */
export function vinkelkod(namn) {
  const falt = String(namn ?? '').trim().split('_');
  return falt.length >= 3 && falt[1] ? falt[1].toUpperCase() : null;
}

/** Skälet till att annonsen stannar i Sverige, eller null om den får översättas. */
export function baraSverige(namn) {
  const k = vinkelkod(namn);
  return k && Object.hasOwn(BARA_SVERIGE, k) ? BARA_SVERIGE[k] : null;
}
