// Trendmått ur dygnsserien — ren räkning, ingen I/O, inget Claude.
//
// Motorns hälsomått är CPA-trenden (Axels beslut 2026-09-22, ur Evolve):
// spendnivå, frekvens och marknadsstorlek är alla förkastade som tak, och
// den enda signalen kursen behåller är kostnaden per köp dag för dag — den
// är marknadsoberoende. Mätt i kontot samma dag, Taköverdraget SE
// 120250147343350291, 10–21 september: CPA 150 → 171 → 147 → 323 → 235 →
// 325 → 269 → 371 → 333 → 410 → 421 → 466 kr medan dagsspenden gick
// 1 352 → 15 990 kr. Break-even-CPA ~750. Marginalen krympte 80 % → 38 %
// utan att en enda ROAS-dom slog om.
//
// Dygnsserien (`kampanj.dygn` i kontodatan) bär per dygn:
//   datum, spend, roas, kop (köp 7d_click), kop_visning (köp 1d_view),
//   cpa (cost_per_action_type → omni_purchase, fönstret 7d_click).
// Saknas `cpa` räknas den som spend / kop. Ett dygn med spend men noll köp
// har oändlig CPA — det är en stigning, inte en lucka. Ett dygn utan spend
// är en lucka och bryter serien.

/** Så här många dygn i rad ska CPA:n ha stigit för att en höjning ska stoppas. */
export const CPA_STIG_DAGAR = 3;

/** Så stor andel av köpen ska vara klickbaserade innan en höjning (Compare Attribution Settings). */
export const KLICK_MIN_ANDEL = 0.6;

/** Så många dygn i rad ska dags-ROAS ligga över target innan trappan tar ett steg (48–72 timmar konsekvent). */
export const KONSEKVENT_DAGAR = 2;

const tal = (x) => {
  if (x === null || x === undefined || x === '') return null;
  const n = typeof x === 'number' ? x : Number(String(x).replace(/\s/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

/** Dygnen i kalenderordning (äldst först), bara rader med giltigt datum. */
export function sorteradeDygn(dygn) {
  if (!Array.isArray(dygn)) return [];
  return dygn
    .filter((d) => d && /^\d{4}-\d{2}-\d{2}$/.test(String(d.datum ?? '')))
    .sort((a, b) => (a.datum < b.datum ? -1 : a.datum > b.datum ? 1 : 0));
}

/**
 * CPA per dygn: [{ datum, cpa, spend, kop }]. `cpa` = Infinity när spend > 0
 * och köp = 0, null när dygnet saknar spend eller köpuppgift.
 */
export function cpaPerDag(dygn) {
  return sorteradeDygn(dygn).map((d) => {
    const spend = tal(d.spend);
    const kop = tal(d.kop);
    const uttrycklig = tal(d.cpa);
    let cpa = null;
    if (uttrycklig !== null && uttrycklig > 0) cpa = uttrycklig;
    else if (spend !== null && spend > 0 && kop !== null) cpa = kop > 0 ? spend / kop : Infinity;
    return { datum: d.datum, cpa, spend, kop };
  });
}

/**
 * Antal dygn i rad, räknat bakåt från senaste dygnet med spend, som CPA:n
 * stigit jämfört med dygnet före. Tre dygn i rad = tre stigningar = fyra
 * mätpunkter. Oändlig CPA (spend utan köp) räknas som stigning från ett
 * ändligt tal och som oförändrad från ett annat oändligt. En lucka (dygn
 * utan spend, eller saknat datum i följd) bryter räkningen.
 *
 * `tillOchMed` (YYYY-MM-DD) utesluter senare dygn — dagens ofullständiga dygn
 * ska aldrig avgöra en trend; ronden skickar gårdagen.
 */
export function stigandeDagar(dygn, { tillOchMed = null } = {}) {
  const serie = cpaPerDag(dygn).filter((d) => d.cpa !== null && (!tillOchMed || d.datum <= tillOchMed));
  if (serie.length < 2) return { dagar: 0, serie: serie.map((d) => ({ datum: d.datum, cpa: d.cpa })) };
  let dagar = 0;
  for (let i = serie.length - 1; i >= 1; i--) {
    const nu = serie[i];
    const fore = serie[i - 1];
    if (!arNastaDag(fore.datum, nu.datum)) break;
    const steg = nu.cpa === Infinity ? (fore.cpa === Infinity ? 0 : 1) : nu.cpa > fore.cpa ? 1 : 0;
    if (steg !== 1) break;
    dagar += 1;
  }
  return { dagar, serie: serie.slice(-(dagar + 1)).map((d) => ({ datum: d.datum, cpa: d.cpa })) };
}

/** Stiger CPA:n så många dygn i rad att en höjning ska stoppas? */
export function cpaStiger(dygn, { tillOchMed = null, dagar = CPA_STIG_DAGAR } = {}) {
  const s = stigandeDagar(dygn, { tillOchMed });
  return { stiger: s.dagar >= dagar, dagar: s.dagar, serie: s.serie };
}

/**
 * Klickandelen av köpen över de senaste `n` dygnen: köp 7d_click / (köp
 * 7d_click + köp 1d_view). Null när visningstalet saknas i serien — ingen
 * dom på en gissning. Metas fönster är disjunkta: ett köp som både setts
 * och klickats hamnar på klicket.
 */
export function klickandel(dygn, { n = 3, tillOchMed = null } = {}) {
  const rader = sorteradeDygn(dygn).filter((d) => !tillOchMed || d.datum <= tillOchMed).slice(-n);
  let klick = 0;
  let visning = 0;
  let harVisning = false;
  for (const d of rader) {
    const k = tal(d.kop);
    const v = tal(d.kop_visning);
    if (k !== null) klick += k;
    if (v !== null) { visning += v; harVisning = true; }
  }
  if (!harVisning || klick + visning === 0) return null;
  return { andel: klick / (klick + visning), klick, visning, dygn: rader.length };
}

/**
 * Antal dygn i rad (bakåt från senaste dygnet med spend) som dags-ROAS
 * legat på eller över `granstal`. Dygn utan köp räknas som under. Null när
 * serien saknar roas helt.
 */
export function dagarOver(dygn, granstal, { tillOchMed = null } = {}) {
  if (!Number.isFinite(granstal)) return null;
  const rader = sorteradeDygn(dygn).filter((d) => !tillOchMed || d.datum <= tillOchMed);
  if (!rader.some((d) => tal(d.roas) !== null)) return null;
  let dagar = 0;
  for (let i = rader.length - 1; i >= 0; i--) {
    const spend = tal(rader[i].spend);
    if (spend !== null && spend <= 0) break;
    const roas = tal(rader[i].roas);
    if (roas === null || roas < granstal) break;
    dagar += 1;
  }
  return dagar;
}

function arNastaDag(a, b) {
  const t = Date.parse(`${a}T00:00:00Z`);
  const u = Date.parse(`${b}T00:00:00Z`);
  return Number.isFinite(t) && Number.isFinite(u) && u - t === 86400000;
}

/** Läsbar CPA-serie: "333 → 410 → 421 → 466 kr". */
export function cpaText(serie) {
  return `${serie.map((d) => (d.cpa === Infinity ? '∞' : String(Math.round(d.cpa)))).join(' → ')} kr`;
}
