// etikett.mjs — utfallet per annons, dag 7. Samma trösklar som Skalnings kungens
// `agent/etikett.mjs` (Evolve-materialet, Axels beslut 2026-09-20), så att de två
// systemen talar samma språk och en lärdom går att läsa över butiksgränsen.
//
//   BREAKTHROUGH    ≥ 30 % av kampanjens spend OCH budgeten höjdes under veckan
//                   OCH annonsens ROAS ≥ break-even
//   SPEND_WINNER    ≥ 30 % av spenden, men ingen höjning eller under break-even
//   KPI_WINNER      < 30 %, minst ett köp, ROAS ≥ kampanjens ROAS
//   LOSER           resten
//   INGEN_LEVERANS  under 10 kr på sju dygn — hooken föll, logga och släpp
//
// ⚠️ ETIKETTEN ÄR INGEN DOM. Den beskriver vad Meta gjorde. Kill och skalning
// kräver `bedombar` (≥ 300 kr ELLER ≥ 3 köp, ANALYSMETOD) — båda fälten står på
// samma rad. Etiketten skrivs en gång och ändras aldrig, utom uppgradering till
// BREAKTHROUGH.
//
// Fönstret är annonsens EGNA första vecka [D0, D0+6] — aldrig last_7d, aldrig
// kalenderveckan. Sessionen hämtar siffrorna ur Meta och skickar in dem
// ordagrant; den här filen räknar bara.

export const ETIKETT_ANDEL = 0.30;
export const INGEN_LEVERANS_SEK = 10;
export const FONSTER_DAGAR = 7;
export const FREKVENS_MIN_ANTAL = 10;

export const ETIKETT = {
  BREAKTHROUGH: 'BREAKTHROUGH',
  SPEND_WINNER: 'SPEND_WINNER',
  KPI_WINNER: 'KPI_WINNER',
  LOSER: 'LOSER',
  INGEN_LEVERANS: 'INGEN_LEVERANS',
  INGEN_DATA: 'INGEN_DATA',
};

/** Etiketten för EN annons.
 *  annons: { namn, spend_sek, kop, roas, d0 }
 *  kampanj: { spend_sek, roas, budget_d0, budget_d7 }
 *  break_even: ROAS-talet som gäller (null = okänt ⇒ breakthrough kan inte sättas) */
export function etikettera(annons, kampanj, break_even, grindar) {
  const spend = num(annons.spend_sek);
  const kop = num(annons.kop);
  const roas = annons.roas === null || annons.roas === undefined ? null : num(annons.roas);
  const kampanjSpend = num(kampanj?.spend_sek);
  const bedombar = spend >= grindar.signifikans_spend_sek || kop >= grindar.signifikans_kop;
  const bas = { namn: annons.namn, spend_sek: spend, kop, roas, bedombar };

  if (!Number.isFinite(spend)) return { ...bas, etikett: ETIKETT.INGEN_DATA, motivering: 'spend saknas i avläsningen.' };
  if (spend < INGEN_LEVERANS_SEK) {
    return { ...bas, etikett: ETIKETT.INGEN_LEVERANS, motivering: `${spend.toFixed(2)} kr på sju dygn (under ${INGEN_LEVERANS_SEK} kr) — Meta gav den ingen leverans.` };
  }
  if (!kampanjSpend) return { ...bas, etikett: ETIKETT.INGEN_DATA, motivering: 'kampanjens spend i samma fönster saknas — andelen går inte att räkna.' };

  const andel = spend / kampanjSpend;
  const hojd = Number.isFinite(num(kampanj.budget_d7)) && Number.isFinite(num(kampanj.budget_d0))
    ? num(kampanj.budget_d7) > num(kampanj.budget_d0)
    : null;

  if (andel >= ETIKETT_ANDEL) {
    const overBreakEven = break_even !== null && break_even !== undefined && roas !== null ? roas >= break_even : null;
    if (hojd === true && overBreakEven === true) {
      return { ...bas, andel: r3(andel), etikett: ETIKETT.BREAKTHROUGH, motivering: `${(andel * 100).toFixed(0)} % av kampanjens spend, budgeten höjdes ${kampanj.budget_d0}→${kampanj.budget_d7} kr och ROAS ${roas} ≥ break-even ${break_even}.` };
    }
    const varfor = hojd === null ? 'budgethistoriken saknas i fönstret' : hojd === false ? 'budgeten höjdes inte' : overBreakEven === null ? 'break-even okänt' : 'ROAS under break-even';
    return { ...bas, andel: r3(andel), etikett: ETIKETT.SPEND_WINNER, osaker_breakthrough: hojd === null || overBreakEven === null, motivering: `${(andel * 100).toFixed(0)} % av kampanjens spend, men ${varfor}.` };
  }
  if (kop >= 1 && roas !== null && num(kampanj.roas) && roas >= num(kampanj.roas)) {
    return { ...bas, andel: r3(andel), etikett: ETIKETT.KPI_WINNER, motivering: `${(andel * 100).toFixed(0)} % av spenden men ROAS ${roas} ≥ kampanjens ${kampanj.roas}.` };
  }
  return { ...bas, andel: r3(andel), etikett: ETIKETT.LOSER, motivering: `${(andel * 100).toFixed(0)} % av spenden, ${kop} köp, ROAS ${roas ?? 'okänd'}.` };
}

/** Breakthrough-frekvensen — ALLTID som bråk, procent bara vid ≥ 10 etiketter
 *  (CS-KLART punkt 15: "3 av 21, alltså 14 procent. Aldrig bara procent"). */
export function formateraFrekvens(antalBreakthrough, antalTotalt) {
  if (!antalTotalt) return '0/0 (inga etiketterade annonser än)';
  const brak = `${antalBreakthrough}/${antalTotalt}`;
  if (antalTotalt < FREKVENS_MIN_ANTAL) return `${brak} (för få för procent)`;
  return `${brak} (${Math.round((antalBreakthrough / antalTotalt) * 100)} %)`;
}

/** En levande breakthrough = etikett inom N dygn och annonsen kör fortfarande.
 *  Styr mixen i nästa rond (80 % vidarebyggen / 20 % nya vinklar). */
export function levandeBreakthrough(etiketter, idag, dagar = 28) {
  return etiketter.filter((e) => e.etikett === ETIKETT.BREAKTHROUGH && e.aktiv !== false && dagarMellan(e.datum, idag) <= dagar && dagarMellan(e.datum, idag) >= 0);
}

export function dagarMellan(a, b) {
  const ta = Date.parse(`${a}T00:00:00Z`);
  const tb = Date.parse(`${b}T00:00:00Z`);
  if (!Number.isFinite(ta) || !Number.isFinite(tb)) return Infinity;
  return Math.floor((tb - ta) / 86400000);
}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
const r3 = (v) => Math.round(v * 1000) / 1000;
