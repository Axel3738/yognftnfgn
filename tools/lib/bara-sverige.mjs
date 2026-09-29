// bara-sverige.mjs — vinkelkoder vars annonser inte lämnar Sverige, och till
// vilka marknader spärren gäller.
//
// Fars dag-batchen 2026-09-28 (Axels order: "en batch på varje produkt som vi
// skalar just nu … fars dag-rea … fars dag den åttonde november") bär koden
// FD i namnet (`Takoverdrag_FD_1_H1`). Copyn säger "fars dag 8 november" och
// "beställ senast 19 oktober".
//
// ⚠️ **En spärr måste namnge de marknader den mätts mot.** Första versionen
// (2026-09-28) gjorde det inte och stoppade ALLA marknader på ett skäl som
// bara gällde fyra länder — Norge drogs med utan att någon hade kollat den
// norska kalendern, och 22 färdiga annonser låg still ett dygn.
//
// Mätt per marknad:
//   • US, GB, CA, DK — fars dag firas i JUNI. En engelsk eller dansk version
//     hade påstått fel datum. Spärren gäller.
//   • NO — norsk farsdag 2026 är söndag 8 november, exakt samma dag som den
//     svenska (andra söndagen i november: timeanddate.no, norskekalendere.no,
//     snl.no). Leveranstiden är dessutom KORTARE än den svenska: 1 194 ordrar
//     i beverbutikken.no sedan 1 aug, 587 med DELIVERED-stämpel, median 13,0
//     dygn, p75 15,8, p90 18,8 mot Bäverbutikens p90 20 — "beställ senast
//     19 oktober" håller med marginal. Rean finns också: Axels besked
//     2026-09-29, "den rean som är igång just nu är ju fars dag-rean".
//     Spärren gäller INTE Norge.
//
// Marknader som inte står i `TILLATNA` stoppas — en ny marknad ska mätas,
// inte antas. `baraSverige(namn)` utan marknad stoppar också (speglingen till
// OPS-butikerna är svensk och ska fortsätta göra det).

export const BARA_SVERIGE = Object.freeze({
  FD: {
    skal: 'fars dag-annons (fars dag 8 november, beställ senast 19 oktober) — bara Sverige: i USA, Storbritannien, Kanada och Danmark firas fars dag i juni, och sista beställningsdagen är räknad på leveranstiden till Sverige',
    // Marknader där vinkeln ÄR mätt och fungerar. Versaler, marknadskod.
    tillatna: Object.freeze(['NO']),
  },
});

/** Vinkelkoden (fält 2) ur ett annonsnamn, i versaler — eller null. */
export function vinkelkod(namn) {
  const falt = String(namn ?? '').trim().split('_');
  return falt.length >= 3 && falt[1] ? falt[1].toUpperCase() : null;
}

/**
 * Skälet till att annonsen stannar i Sverige, eller null om den får gå vidare.
 * @param {string} namn      annonsnamnet
 * @param {string} [marknad] marknadskod, t.ex. 'NO'. Utelämnad ⇒ spärren gäller.
 */
export function baraSverige(namn, marknad) {
  const k = vinkelkod(namn);
  if (!k || !Object.hasOwn(BARA_SVERIGE, k)) return null;
  const regel = BARA_SVERIGE[k];
  const kod = String(marknad ?? '').trim().toUpperCase();
  if (kod && regel.tillatna.includes(kod)) return null;
  return regel.skal;
}
