// kampanjval.mjs — vilken kampanj ett annonsprefix hör till. Ren räkning, inga
// API-anrop, så den går att testa utan nät.
//
// Bruten ut ur tools/leveranskon.mjs 2026-09-22: den filen gör `await
// metaAnnonser(...)` på toppnivå utan main-guard, så varje `import` av den
// startade en riktig Meta-hämtning. Ett test som importerade logiken härifrån
// hade alltså gått ut på nätet för att pröva en ren funktion.

/** Notion-titlar bär ibland ett suffix: "Beachslippers_PD_2_8 – COPY ONLY: ...".
 *  Drive-mappen heter bara annonsdelen. Jämför alltid på annonsdelen. */
export const annonsdel = (s) => String(s ?? '').split(/\s+[–—-]\s+/)[0].trim();

/** Prefixet ur ett annonsnamn: "Rodholder_PD_11_H1" -> "rodholder".
 *  Bindestreck och siffror RÄKNAS med: "MC-Kapell_OF_4_1" -> "mc-kapell".
 *  *(Mätt 2026-09-15: mönstret var `^([A-Za-z]+)_`, så varje namn med bindestreck
 *  i prefixet gav null och raden föll ur kön TYST. Motorcycle Cover-hubben hade
 *  13 färdiga creatives i `To be Reviewed` som aldrig syntes i någon rapport.)* */
export const prefixAv = (namn) =>
  (annonsdel(namn).match(/^([A-Za-z][A-Za-z0-9-]*)_/) || [])[1]?.toLowerCase() ?? null;

/** Landningssideskampanjer (listicle / lagerrensning / vi-testade / anledningar).
 *  De bär SAMMA annonsprefix som produktens vanliga kampanj men skickar trafiken
 *  till `/pages/<slug>-…` i stället för till produktsidan, och de fylls bara på
 *  kommando — aldrig av leveransrundan.
 *
 *  ⚠️ Axels order 2026-09-22: "Ladda aldrig upp någonting i listicle-kampanjerna
 *  utan min tillsägelse." Bakgrunden är mätt samma dag i MagiBorsten:
 *  `Taköverdraget LISTICLE LAGERRENSNING` hade svalt 64 annonser med prefixet
 *  `Takoverdrag_` mot huvudkampanjens 34. Eftersom prefixKarta() väljer kampanjen
 *  med FLEST annonser valde leveransrundan listicle-kampanjen — och försprånget
 *  växte för varje leverans den lade dit. En självförstärkande loop: 34 annonser
 *  16/9, sedan 12, 4, 5 och 9 till fram till 22/9, alla briefade mot produktsidan.
 *  Bland dem `Takoverdrag_OB_1_H1` och `Takoverdrag_OB_2_H1`. */
export const LISTICLE_MONSTER = /\b(listicle|lagerrens\w*|vi[- ]testade|anledningar)\b/i;
export const arListiclekampanj = (namn) => LISTICLE_MONSTER.test(String(namn ?? ''));

/**
 * Kontot lär oss självt vilken kampanj ett prefix hör till — ingen konfig behövs.
 * Nya produkter dyker upp ständigt i Bäverbutiken; en hårdkodad lista missar dem
 * tyst, och tyst missad leverans är värre än en rapporterad. Kampanjen med FLEST
 * annonser på prefixet vinner; oavgjort bryts av att en ACTIVE kampanj går före.
 *
 * Listicle-kampanjer räknas ALDRIG som kandidat. De uteslutna returneras i
 * `_uteslutna` så körningen kan skriva ut dem — en tyst uteslutning är lika svår
 * att upptäcka som det tysta felvalet den ersätter. Har ett prefix BARA en
 * listicle-kampanj får det ingen kampanj alls: hellre en rapporterad lucka än en
 * leverans som landar på fel landningssida.
 */
export function prefixKarta(annonser) {
  const rakning = {};
  const uteslutna = {};
  for (const a of annonser ?? []) {
    const p = prefixAv(a?.name);
    if (!p || !a.campaign?.id) continue;
    const hink = arListiclekampanj(a.campaign.name) ? uteslutna : rakning;
    ((hink[p] ??= {})[a.campaign.id] ??= { ...a.campaign, antal: 0 }).antal++;
  }
  const karta = {};
  for (const [p, kampanjer] of Object.entries(rakning)) {
    karta[p] = Object.values(kampanjer).sort((a, b) =>
      b.antal - a.antal || (b.status === 'ACTIVE') - (a.status === 'ACTIVE'))[0];
  }
  Object.defineProperty(karta, '_uteslutna', { value: uteslutna, enumerable: false });
  return karta;
}
