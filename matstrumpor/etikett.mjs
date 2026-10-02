// etikett.mjs — utfallet per annons, vecka för vecka. Samma fyra utfall som
// Evolve ("Winning Ads Definitions", Billy 2026-05-13; sammanfattat i
// docs/os/evolve/ITERATIONS-PLAYBOOK.md avsnitt 1) och Skalnings kungens
// `agent/etikett.mjs`, så en lärdom går att läsa över butiksgränsen.
//
//   BREAKTHROUGH    ≥ 30 % av kampanjens spend OCH kampanjen växte ≥ 10 % mot
//                   veckan FÖRE annonsen OCH annonsens ROAS ≥ break-even
//   SPEND_WINNER    ≥ 30 % av spenden, men kampanjen växte inte eller under break-even
//   KPI_WINNER      < 30 %, minst ett köp, ROAS ≥ kampanjens ROAS
//   LOSER           resten
//   INGEN_LEVERANS  under 10 kr på sju dygn — hooken föll, logga och släpp
//
// Sedan 2026-10-01 (Evolve-genomgången, docs/os/evolve/EVOLVE-GAP-ANALYS.md):
//  • "Växte" mäts på kampanjens SPEND vecka mot veckan före annonsen (W0), som i
//    Evolves dataset. Var W0 noll (ny kampanj) gäller den gamla regeln: budgeten
//    höjdes under veckan. Före 2026-10-01 räckte VILKEN höjning som helst —
//    Nathalies breakthrough kom samma dag Axel höjde 1 000 → 10 000 kr/dag.
//  • En budgetändring i fönstret står kvar på raden som `yttre_handelse`:
//    Evolve räknar inte en höjning som annonsen inte orsakade. Koden kan inte
//    veta varför Axel höjde, så den flaggar och sessionen bedömer.
//  • Etiketten kan UPPGRADERAS vecka 2 och 3 (Evolve: "an ad can be labelled a
//    Spend Winner or KPI Winner in week 1, and become a breakthrough in week 2
//    or 3"; i deras data blev till och med en loser en breakthrough). Den
//    sänks aldrig. Före 2026-10-01 skrevs den en gång, utom till BREAKTHROUGH.
//
// ⚠️ ETIKETTEN ÄR INGEN DOM. Kill och skalning kräver `bedombar` (≥ 300 kr
// ELLER ≥ 3 köp, ANALYSMETOD) — båda fälten står på samma rad.
//
// 30 % är högt mot Evolves band 10–30 % ("högre spend, lägre andel"), men
// deras breakthroughs på nivån $0–100k/mån tog i median 67,9 % av kampanjen.
// Vi ligger på den nivån, så tröskeln står kvar.

export const ETIKETT_ANDEL = 0.30;
export const TILLVAXT_MIN = 0.10;
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

/** Rangen som uppgraderingen jämför. INGEN_DATA är ingen etikett. */
export const RANG = Object.freeze({ INGEN_LEVERANS: 0, LOSER: 1, KPI_WINNER: 2, SPEND_WINNER: 3, BREAKTHROUGH: 4 });

/** Etiketten för EN annons i ETT fönster.
 *  annons:  { namn, spend_sek, kop, roas }
 *  kampanj: { spend_sek, roas, spend_w0_sek, budget_d0, budget_d7, budgetandringar }
 *  break_even: ROAS-talet som gäller (null = okänt ⇒ breakthrough kan inte sättas) */
export function etikettera(annons, kampanj, break_even, grindar) {
  const spend = num(annons.spend_sek);
  const kop = Number.isFinite(num(annons.kop)) ? num(annons.kop) : 0;
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
  const vaxt = tillvaxt(kampanj);
  const yttre = yttreHandelse(kampanj?.budgetandringar);

  if (andel >= ETIKETT_ANDEL) {
    const overBreakEven = break_even !== null && break_even !== undefined && roas !== null ? roas >= break_even : null;
    const extra = { andel: r3(andel), tillvaxt: vaxt.varde, tillvaxt_kalla: vaxt.kalla, ...(yttre ? { yttre_handelse: yttre } : {}) };
    if (vaxt.vaxte === true && overBreakEven === true) {
      return { ...bas, ...extra, etikett: ETIKETT.BREAKTHROUGH, motivering: `${pct(andel)} av kampanjens spend, ${vaxt.text} och ROAS ${roas} ≥ break-even ${break_even}.${yttre ? ` ⚠️ ${yttre}` : ''}` };
    }
    const varfor = vaxt.vaxte === null ? 'kampanjens tillväxt går inte att mäta' : vaxt.vaxte === false ? vaxt.text : overBreakEven === null ? 'break-even okänt för marknaden' : `ROAS ${roas} under break-even ${break_even}`;
    return { ...bas, ...extra, etikett: ETIKETT.SPEND_WINNER, osaker_breakthrough: vaxt.vaxte === null || overBreakEven === null, motivering: `${pct(andel)} av kampanjens spend, men ${varfor}.` };
  }
  if (kop >= 1 && roas !== null && num(kampanj.roas) && roas >= num(kampanj.roas)) {
    return { ...bas, andel: r3(andel), etikett: ETIKETT.KPI_WINNER, motivering: `${pct(andel)} av spenden men ROAS ${roas} ≥ kampanjens ${kampanj.roas}.` };
  }
  return { ...bas, andel: r3(andel), etikett: ETIKETT.LOSER, motivering: `${pct(andel)} av spenden, ${kop} köp, ROAS ${roas ?? 'okänd'}.` };
}

/** Växte kampanjen? Spend i fönstret mot veckan före annonsen (W0) — Evolves
 *  mått. W0 noll eller okänd ⇒ reserven: budgeten höjdes under veckan. Ren. */
export function tillvaxt(kampanj) {
  const w1 = num(kampanj?.spend_sek);
  const w0 = num(kampanj?.spend_w0_sek);
  if (Number.isFinite(w0) && w0 > 0 && Number.isFinite(w1)) {
    const v = w1 / w0 - 1;
    return { vaxte: v >= TILLVAXT_MIN, varde: r3(v), kalla: 'spend mot veckan före', text: `kampanjens spend ${v >= 0 ? '+' : ''}${pct(v)} mot veckan före annonsen (${Math.round(w0)} → ${Math.round(w1)} kr)` };
  }
  const d0 = num(kampanj?.budget_d0), d7 = num(kampanj?.budget_d7);
  if (Number.isFinite(d0) && Number.isFinite(d7)) {
    return { vaxte: d7 > d0, varde: d0 > 0 ? r3(d7 / d0 - 1) : null, kalla: 'budgeten (ingen spend veckan före)', text: d7 > d0 ? `budgeten höjdes ${d0}→${d7} kr (ingen spend veckan före att jämföra med)` : 'budgeten höjdes inte (ingen spend veckan före att jämföra med)' };
  }
  return { vaxte: null, varde: null, kalla: 'saknas', text: 'tillväxten går inte att mäta' };
}

/** En budgetändring i fönstret som annonsen kanske inte orsakade. Ren. */
export function yttreHandelse(andringar) {
  const hojningar = (andringar ?? []).filter((h) => num(h.till_sek) > num(h.fran_sek));
  if (!hojningar.length) return null;
  return `budgeten höjdes för hand i fönstret (${hojningar.map((h) => `${String(h.tid).slice(0, 10)} ${h.fran_sek}→${h.till_sek} kr`).join(', ')}) — Evolve räknar inte en höjning som annonsen inte orsakade, bedöm själv`;
}

/** Ska en ny etikett ersätta den som står i loggen? Bara uppåt. Ren. */
export function arUppgradering(tidigare, ny) {
  if (!tidigare) return true;
  const a = RANG[tidigare], b = RANG[ny];
  if (a === undefined || b === undefined) return false;
  return b > a;
}

/** Högsta loggade etiketten per annons ur ETIKETT-rader. Ren. */
export function gallandeEtiketter(etikettrader) {
  const ut = new Map();
  for (const r of etikettrader ?? []) {
    if (!r?.annons || RANG[r.etikett] === undefined) continue;
    const nu = ut.get(r.annons);
    if (!nu || RANG[r.etikett] > RANG[nu.etikett]) ut.set(r.annons, r);
  }
  return ut;
}

/** Breakthrough-frekvensen — ALLTID som bråk, procent bara vid ≥ 10 etiketter
 *  (CS-KLART punkt 15: "3 av 21, alltså 14 procent. Aldrig bara procent"). */
export function formateraFrekvens(antalBreakthrough, antalTotalt) {
  if (!antalTotalt) return '0/0 (inga etiketterade annonser än)';
  const brak = `${antalBreakthrough}/${antalTotalt}`;
  if (antalTotalt < FREKVENS_MIN_ANTAL) return `${brak} (för få för procent)`;
  return `${brak} (${Math.round((antalBreakthrough / antalTotalt) * 100)} %)`;
}

/** Evolves hit rate (Growth Guide, Overview): (breakthrough + spend winner) ÷
 *  alla etiketterade. Två nämnare: med och utan INGEN_LEVERANS, för en annons
 *  som aldrig visades säger inget om idén. Ren. */
export function hitRate(etiketter) {
  const alla = (etiketter ?? []).filter((e) => RANG[e.etikett] !== undefined);
  const traff = alla.filter((e) => e.etikett === ETIKETT.BREAKTHROUGH || e.etikett === ETIKETT.SPEND_WINNER).length;
  const levererade = alla.filter((e) => e.etikett !== ETIKETT.INGEN_LEVERANS).length;
  return { traff, alla: alla.length, levererade, text: `${formateraFrekvens(traff, alla.length)} av alla · ${formateraFrekvens(traff, levererade)} av dem som fick leverans` };
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

const num = (v) => (v === null || v === undefined || v === '' ? NaN : (Number.isFinite(Number(v)) ? Number(v) : NaN));
const r3 = (v) => Math.round(v * 1000) / 1000;
const pct = (v) => `${(v * 100).toFixed(0)} %`;
