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
// ⚠️ NORGE: skälet ovan gäller INTE datumet där, mätt 2026-09-29 av
// /oversatt NO när de 22 FD-raderna dök upp i kön. Norsk farsdag 2026 är
// söndag 8 november — andra söndagen i november, exakt samma dag som den
// svenska (timeanddate.no, norskekalendere.no, snl.no) — och leveranstiden är
// kortare: 1 194 ordrar i beverbutikken.no sedan 1 aug, 587 med DELIVERED-
// stämpel, median 13,0 dygn, p75 15,8, **p90 18,8** mot Bäverbutikens p90 20,
// så "beställ senast 19 oktober" håller även i Norge. Det som ändå stoppar en
// norsk version är REA-priset i copyn ("Fars dag-rea: 289 kr, ord. 482 kr"):
// den norska butiken kör ingen fars dag-rea (Fiskestangholder 4-pakning 199 /
// 300 NOK = ordinarie pris och ordinarie jämförpris), så en översättning hade
// kallat vardagspriset för en rea. Frågan ligger hos Axel 2026-09-29: samma rea
// i Norge ⇒ ta bort FD här och låt rutinen köra; bara Sverige ⇒ regeln står
// kvar och raderna flyttas till Approved.
// Lärdom: en "bara Sverige"-regel ska NAMNGE de marknader den mätts mot. Den
// här mätte fyra länder (US, GB, CA, DK) och drog med Norge utan att någon
// hade kollat den norska kalendern.
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
