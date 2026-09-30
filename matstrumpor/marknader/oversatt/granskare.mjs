// granskare.mjs — vilka av Matstrumpors utlandsmarknader SKALAR, och får alltså nya översättningar?
//
// Axels beställning 2026-09-30: "jag kommer testa jättemånga olika marknader nu i tre dagar … då är
// det onödigt att bara börja spamma upp nya annonser och översätta till alla språk … de marknaderna
// som vi faktiskt går bra i, dem ska vi fortsätta ladda upp nya vinnare och översätta".
//
// Fem lägen per marknad (kampanj i marknader.json):
//   av        kampanjen är inte ACTIVE i kontot (PAUSED är ett beslut — rutinen rör det aldrig)
//   testas    ACTIVE men färre än test_dagar HELA dygn med spend — inga översättningar än
//   for_lite  testen är över men under grinden (300 kr OCH 3 köp) — ingen dom, inga översättningar
//   under     ROAS under marknadens break-even — inga översättningar
//   skalar    ROAS ≥ break-even över senaste fönstret — nya vinnare översätts hit
// Axels egna ord (konfig.manuellt) vinner alltid över mätningen.
//
// Allt här är rena funktioner — nätet ligger i kor.mjs.

export const LAGE = { AV: 'av', TESTAS: 'testas', FOR_LITE: 'for_lite', UNDER: 'under', SKALAR: 'skalar' };

const num = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);

/** Ren: antal kalenderdygn från a till b (YYYY-MM-DD), b exklusive. */
export function dygnMellan(a, b) {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);
}

/** Ren: första dygnet med spend, före i dag (dagens halva räknas aldrig). */
export function forstaSpendDygn(dagar, idag) {
  const med = dagar.filter((d) => d.datum < idag && num(d.spend) > 0).map((d) => d.datum).sort();
  return med[0] ?? null;
}

/**
 * Ren: domen för EN marknad.
 * @param k       { kod, effective_status }
 * @param dagar   [{ datum, spend }] — kampanjens dygn (Metas dygn), alla före och med i dag
 * @param fonster { spend, kop, roas } — senaste fönstrets hela dygn, ROAS ur Meta (aldrig egen division)
 * @param be      { roas, kalla } — marknadens break-even och var talet kommer ifrån
 * @param g       konfig.granskare
 * @param idag    YYYY-MM-DD (Metas dygn)
 * @param manuellt konfig.manuellt[kod] eller undefined
 */
export function domMarknad({ k, dagar = [], fonster = null, be, g, idag, manuellt }) {
  const bas = { kod: k.kod, kampanj: k.kampanj ?? null, effective_status: k.effective_status ?? null, break_even: be?.roas ?? null, break_even_kalla: be?.kalla ?? null };
  if (manuellt?.lage) {
    return { ...bas, lage: manuellt.lage === 'skalar' ? LAGE.SKALAR : LAGE.AV, manuellt: true, motivering: `Axels ord ${manuellt.datum ?? ''}: ${manuellt.citat ?? manuellt.lage}${manuellt.lage === 'skalar' && k.effective_status !== 'ACTIVE' ? ` — ⚠️ kampanjen är ${k.effective_status ?? 'inte hittad'}, så nya annonser laddas upp PAUSADE` : ''}`.trim() };
  }
  if (k.effective_status !== 'ACTIVE') return { ...bas, lage: LAGE.AV, motivering: `kampanjen är ${k.effective_status ?? 'inte hittad'} i kontot` };
  const forsta = forstaSpendDygn(dagar, idag);
  const hela = forsta ? dygnMellan(forsta, idag) : 0;
  if (hela < g.test_dagar) return { ...bas, lage: LAGE.TESTAS, forsta_dygn: forsta, hela_dygn: hela, motivering: `${hela} av ${g.test_dagar} testdygn${forsta ? ` (spend sedan ${forsta})` : ' — ingen spend än'}` };
  const spend = num(fonster?.spend), kop = num(fonster?.kop);
  const roas = fonster?.roas === null || fonster?.roas === undefined ? null : num(fonster.roas);
  const tal = { forsta_dygn: forsta, hela_dygn: hela, spend_sek: Math.round(spend), kop, roas };
  if (spend < g.min_spend_sek || kop < g.min_kop) return { ...bas, ...tal, lage: LAGE.FOR_LITE, motivering: `${Math.round(spend)} kr och ${kop} köp — under grinden ${g.min_spend_sek} kr OCH ${g.min_kop} köp` };
  if (roas === null) return { ...bas, ...tal, lage: LAGE.FOR_LITE, motivering: 'ROAS saknas i Metas avläsning — ingen dom hittas på' };
  if (!be?.roas) return { ...bas, ...tal, lage: LAGE.FOR_LITE, motivering: 'break-even saknas — ingen dom' };
  return roas >= be.roas
    ? { ...bas, ...tal, lage: LAGE.SKALAR, motivering: `ROAS ${roas.toFixed(2)} ≥ break-even ${be.roas} (${be.kalla})` }
    : { ...bas, ...tal, lage: LAGE.UNDER, motivering: `ROAS ${roas.toFixed(2)} < break-even ${be.roas} (${be.kalla})` };
}

/**
 * Ren: vilka kampanjer får nya översättningar? De som skalar — plus A/B-partnern (NO ↔ NOB) när
 * partnern är ACTIVE, för ett A/B-test måste bära samma annonser på båda sidor.
 * → [{ kod, skal }]
 */
export function malMarknader(domar, kampanjer) {
  const per = new Map(domar.map((d) => [d.kod, d]));
  const ut = new Map();
  for (const d of domar) {
    if (d.lage !== LAGE.SKALAR) continue;
    ut.set(d.kod, { kod: d.kod, skal: d.motivering });
    const mot = kampanjer[d.kod]?.ab?.mot;
    const p = mot ? per.get(mot) : null;
    if (p && !ut.has(mot) && (p.effective_status === 'ACTIVE' || p.lage === LAGE.SKALAR)) ut.set(mot, { kod: mot, skal: `A/B-partner till ${d.kod} (samma annonser på båda sidor)` });
  }
  return [...ut.values()];
}
