// sidokampanjer.mjs — en OPS-butik kan ha FLERA aktiva kampanjer på samma
// marknad utan att någon av dem är fel. De pekar bara på olika landningssidor.
//
// Bakgrunden (mätt 2026-09-16 på CaraShell): kontot hade två ACTIVE
// SE-kampanjer med nästan samma namn. Leveransrundan vägrade gissa och sju
// färdiga annonser blev stående. Axels besked: "det är inte 2 stycken samma,
// den ena går ju till en listicle" — avläst i kontot stämde det, kopian
// pekade på /pages/…-lagerrensning och originalet på /products/takskyddet.
// Axel döpte sedan om den till "CARASHELL_SE_Taköverdraget LISTICLE".
//
// Regeln här: en kampanj vars NAMN bär ett sidospårsord är inte butikens
// standardmål för leveransrundan. Annonserna som kommer ur creative-hubben
// hör till produktsidan; listicle-kampanjen fylls för hand eller av sitt eget
// kommando.
//
// ⚠️ Spärren tar ALDRIG bort den sista kampanjen: bär alla aktiva ett
// sidospårsord lämnas listan orörd och den vanliga tvetydighetsregeln får
// gälla. Ett namn är en svag signal — den får sålla, aldrig avgöra ensam.
// Att styra kampanjen explicit går fortfarande: `--kampanj <id>`.

/** Ord i ett kampanjnamn som betyder "eget spår, inte standardmålet".
 *  Utöka listan när ett nytt spår föds — och skriv dit datum och varför. */
export const SIDOSPAR = Object.freeze([
  'LISTICLE',   // landningssida byggd av /lagerrensning, /vi-testade, /anledningar (2026-09-16)
]);

/** true om kampanjnamnet bär ett sidospårsord (versalokänsligt, hela ord). */
export function arSidospar(namn, ord = SIDOSPAR) {
  const n = String(namn ?? '');
  return ord.some((o) => new RegExp(`(^|[^A-Za-zÅÄÖåäö])${o}([^A-Za-zÅÄÖåäö]|$)`, 'i').test(n));
}

/**
 * Sållar bort sidospårskampanjer ur en lista — men bara om något blir kvar.
 * Ren funktion; `namnFalt` finns för att kontot säger `name` och kön `namn`.
 * Returnerar { kvar, bortsallade }.
 */
export function utanSidospar(kampanjer, namnFalt = ['name', 'namn']) {
  const lista = kampanjer ?? [];
  const namnet = (k) => namnFalt.map((f) => k?.[f]).find((v) => v != null) ?? '';
  const bortsallade = lista.filter((k) => arSidospar(namnet(k)));
  const kvar = lista.filter((k) => !arSidospar(namnet(k)));
  if (!kvar.length) return { kvar: lista, bortsallade: [] };
  return { kvar, bortsallade };
}
