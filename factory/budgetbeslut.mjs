// Nattvaktens beslutsmotor — REN räkning. Inga nätanrop, ingen fs, ingen
// klocka. Allt som avgör om en budget höjs, sänks, pausas eller lämnas i fred
// bor HÄR, så att svaret blir detsamma varje gång och går att testa.
// Skrivningen sker i factory/budgetrond.mjs, aldrig här.
//
// Källor: .claude/commands/skalningskungen.md steg 3–4 (spärrarna),
// docs/os/ANALYSMETOD.md steg 2–4 (grind, linjer, vinstbidrag), CLAUDE.md
// "PAUSED i annonskontot är ett beslut" + regel 11 (test-ABO), och den gamla
// motorn agent/besked.mjs på grenen claude/daily-agent-discussion-uos5df
// (vinstProcent, nyBudget med 50-kronorsavrundning, GOLV 500, TAK 4000,
// zonerna 16/25, snabbspår, raketspår). Axels beslut 2026-09-10: rutinen FÅR
// ändra budget själv (läge A) inom spärrarna, och raketen är "dubbla" (×2,0 —
// den gamla motorn hade ×1,8 som antagande).
//
// REGLERNA, i den ordning motorn prövar dem:
//
//  0. Rör aldrig något PAUSED. Aldrig aktivera. (CLAUDE.md, incident
//     2026-08-29/30.) En kampanj/adset/annons som inte är ACTIVE i både
//     status och effective_status får en rad med spärr — aldrig en åtgärd.
//  1. Kampanjer vars namn matchar /test/i är test-ABO (regel 11): inga
//     budgetändringar och ingen kampanjpaus — bara annonskills.
//  2. Budgetenhet: kampanjen om den har daily_budget > 0 (CBO), annars varje
//     ACTIVE adset med daily_budget (ABO).
//  3. FÖRLUSTSERIE: ≥ 5 förlustdygn i rad (dagsrader, ROAS < break-even-ROAS
//     med spend > 0; ett dygn utan spend bryter serien) ⇒ SÄNK −30 %, utan
//     hänsyn till grinden eller kadensen. ALDRIG en kampanjpaus — Axels
//     besked 2026-09-10: "jag vill inte pausa hela kampanjer på bara 5
//     dagar, då måste ni ha skalat ner den". Står enheten på golvet: ingen
//     åtgärd, förlusten döms på annonsnivå (regel 13).
//  4. NOLL KÖP: 7d spend ≥ 3 × break-even-CPA och 0 köp ⇒ −30 %
//     (NOLL_KOP_SANK), varje gång det upprepas. Den ENDA kampanjpausen i
//     motorn: enheten står redan på golvet 500 kr och har ändå 0 köp på 7
//     dygn med spend ≥ 3 × break-even-CPA — då finns inget mer att sänka, och
//     500 kr/dag utan ett enda köp i en vecka är ett beslut, inte en trend.
//  5. Signifikansgrind för budgetbeslut: 3d spend ≥ 300 kr OCH 3d köp ≥ 3,
//     annars "för tidigt" (ANALYSMETOD steg 2).
//  6. vinst % = (1/breakEvenRoas − 1/roas) × 100 (samma formel som
//     agent/besked.mjs och factory/skalning.mjs vinstProcent).
//  7. RAKET: ROAS_3d ≥ 5 OCH ROAS_7d ≥ 5 ⇒ ×2,0. Tillåtet varje dag.
//  8. SNABB: vinst_3d ≥ 25 % OCH ROAS_3d ≥ 3 ⇒ +20 %. Tillåtet varje dag.
//  9. SKALA: vinst_3d ≥ 25 % OCH vinst_7d ≥ 25 % ⇒ +20 %, bara om ≥ 3 dygn
//     sedan senaste ändring (budgetloggen).
// 10. HÅLL: 16 ≤ vinst_3d < 25 ⇒ ingen ändring.
// 11. SÄNK: vinst_3d < 16 % (inkl. förlust) ⇒ −30 %, aldrig under GOLV
//     500 kr, bara om ≥ 3 dygn sedan senaste ändring.
// 12. Avrundning till jämna 50 kr: nedåt vid höjning, uppåt vid sänkning, så
//     steget aldrig blir större än faktorn. GOLV 500, TAK 4 000 kr/dag per
//     enhet. Kan steget inte tas (taket/golvet nått) blir det ingen åtgärd.
// 13. Annonskill (ad-nivå, ur skalning.mjs klassificering 14d): klass
//     `forlorare` (CPA > break-even efter ≥ 500 kr och ≥ 3 köp) OCH 7d-CPA
//     också över break-even (trenden håller) ⇒ PAUSA annonsen.
//     NY ANNONS-REGELN (Axels ord 2026-09-10: "ny annons har spenderat 3
//     gånger target-CPA eller mer och inte går med vinst — då pausas den"):
//     annons med FÄRRE än 3 köp, 14d spend ≥ 3 × TARGET-CPA och inte lönsam
//     (0 köp, eller CPA över break-even) ⇒ PAUSA annonsen. Det är ett
//     ägarbeslut som medvetet går under ANALYSMETOD:s 3-köpsgrind — en ny
//     annons som bränt tre target-köp utan att tjäna pengar får inte mer.
//     Saknas target-CPA används break-even-CPA. Aldrig annonsen som bär
//     > 30 % av butikens positiva vinstbidrag (benchmarken).
// 14. Max 3 genomförda ändringar per butik och rond; resten listas som
//     "väntar på Axel". Prioritet: PAUSA > SÄNK > RAKET > SNABB > SKALA.
//
// Alla utfall returneras som rader { entitet_id, entitet_typ, namn, atgard,
// gammalt, nytt, motivering, sparr } — även "ingen ändring" med skäl, så
// tabellen kan visas FÖRE någon skrivning.

import { vinstProcent } from './skalning.mjs';
import { dagarSedanAndring, harRad, andringarIdag } from './budgetlogg.mjs';

export { vinstProcent };

export const GOLV_SEK = 500;
export const TAK_SEK = 4000;
export const STEG_SEK = 50;

export const GRIND_SPEND_SEK = 300;
export const GRIND_KOP = 3;

export const ZON_SANK_UNDER = 16;
export const ZON_SKALA_OVER = 25;

export const RAKET_ROAS = 5;
export const RAKET_FAKTOR = 2.0;      // Axel 2026-09-10: "dubbla"
export const SNABB_ROAS = 3;
export const SKALA_FAKTOR = 1.2;
export const SANK_FAKTOR = 0.7;

export const KADENS_DAGAR = 3;
export const FORLUSTDYGN_FOR_PAUS = 5;
export const NOLL_KOP_MULTIPEL = 3;
export const NOLL_KOP_FONSTER_DAGAR = 7;
export const DODVIKT_MULTIPEL = 3;
export const BENCHMARK_ANDEL = 0.3;
export const MAX_ANDRINGAR = 3;

export const TEST_ABO = /test/i;

// Lägre tal = körs först. Att stoppa förlust går alltid före att lägga på mer.
export const PRIORITET = Object.freeze({ PAUSA: 0, SANK: 1, NOLL_KOP_SANK: 1, RAKET: 2, SNABB: 3, SKALA: 4 });

const nr = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const kr = (v) => `${Math.round(v).toLocaleString('sv-SE')} kr`;
const pct = (v) => `${v.toFixed(1).replace('.', ',')} %`;
const roasTxt = (v) => (Number.isFinite(v) ? v.toFixed(2).replace('.', ',') : '—');

/** Metas budgetfält kommer i öre (minsta valutaenhet). 0/null = ingen egen budget. */
export const budgetSek = (ore) => (nr(ore) > 0 ? nr(ore) / 100 : 0);

export const arAktiv = (e) => e?.status === 'ACTIVE' && (e?.effective_status ?? 'ACTIVE') === 'ACTIVE';

/**
 * Ny budget avrundad till jämna 50 kr UTAN att bryta mot stegets faktor:
 * höjningar rundas nedåt, sänkningar uppåt. Golv och tak gäller alltid.
 * Returnerar null om steget inte går att ta (taket/golvet redan nått, eller
 * avrundningen åt ingenting).
 */
export function nyBudget(budget, faktor) {
  if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(faktor) || faktor <= 0 || faktor === 1) return null;
  const ra = budget * faktor;
  let ny;
  if (faktor > 1) {
    ny = Math.min(TAK_SEK, Math.floor(ra / STEG_SEK) * STEG_SEK);
    return ny > budget ? ny : null;
  }
  ny = Math.max(GOLV_SEK, Math.ceil(ra / STEG_SEK) * STEG_SEK);
  return ny < budget ? ny : null;
}

/**
 * Förlustdygn i rad, räknat bakåt från senaste dygnet med spend.
 * Ett dygn räknas som förlust när spend > 0 och ROAS < break-even (saknad
 * ROAS = 0 = förlust: Meta utelämnar purchase_roas de dygn inget säljs).
 * Ett dygn utan spend, eller en lucka i kalendern, bryter serien.
 * @param {Array<{datum:string, spend:number, roas:number}>} dygn
 */
export function forlustdygnIRad(dygn, breakEvenRoas) {
  if (!Array.isArray(dygn) || !Number.isFinite(breakEvenRoas)) return null;
  const rader = dygn.filter((d) => d && /^\d{4}-\d{2}-\d{2}$/.test(String(d.datum ?? '')));
  if (!rader.length) return 0;
  const sorterade = [...rader].sort((a, b) => (a.datum < b.datum ? 1 : -1));
  let serie = 0;
  let vantat = null;
  for (const d of sorterade) {
    if (vantat !== null && d.datum !== vantat) break;
    if (!(nr(d.spend) > 0)) break;
    if (nr(d.roas) >= breakEvenRoas) break;
    serie += 1;
    vantat = new Date(Date.parse(`${d.datum}T00:00:00Z`) - 86400000).toISOString().slice(0, 10);
  }
  return serie;
}

/**
 * Budgetenheterna i en kampanj: kampanjen själv (CBO) eller dess aktiva
 * adsets med egen budget (ABO). Ren funktion.
 */
export function budgetenheter(kampanj, adsets = []) {
  if (budgetSek(kampanj.daily_budget) > 0) {
    return [{ entitet_id: String(kampanj.id), entitet_typ: 'campaign', namn: kampanj.name, budget: budgetSek(kampanj.daily_budget), status: kampanj.status, effective_status: kampanj.effective_status }];
  }
  return adsets
    .filter((a) => String(a.campaign_id) === String(kampanj.id) && budgetSek(a.daily_budget) > 0)
    .map((a) => ({ entitet_id: String(a.id), entitet_typ: 'adset', namn: a.name, budget: budgetSek(a.daily_budget), status: a.status, effective_status: a.effective_status }));
}

const rad = (enhet, kampanj, extra) => ({
  entitet_id: enhet.entitet_id,
  entitet_typ: enhet.entitet_typ,
  namn: enhet.namn,
  kampanj_id: String(kampanj.id),
  kampanj_namn: kampanj.name,
  atgard: null,
  gammalt: enhet.budget ?? null,
  nytt: null,
  motivering: '',
  sparr: null,
  ...extra,
});

/**
 * Domen för EN kampanj. Returnerar en rad per budgetenhet (plus en
 * kampanjrad vid paus eller spärr).
 *
 * @param {object} p
 * @param {object} p.kampanj    {id,name,status,effective_status,daily_budget}
 * @param {Array}  p.adsets     kontots adsets (filtreras på campaign_id här)
 * @param {object} p.d3         {spend, kop, roas} senaste 3 dygnen
 * @param {object} p.d7         {spend, kop, roas} senaste 7 dygnen
 * @param {Array}  p.dygn       [{datum, spend, roas}] senaste 7 dygnen, ett per dag
 * @param {object} p.ekonomi    {breakEvenRoas, breakEvenCpa}
 * @param {Array}  p.logg       budgetloggens rader
 * @param {string} p.idag       YYYY-MM-DD
 */
export function beslutaKampanj({ kampanj, adsets = [], d3 = {}, d7 = {}, dygn = [], ekonomi = {}, logg = [], idag }) {
  const be = ekonomi?.breakEvenRoas;
  const beCpa = ekonomi?.breakEvenCpa;
  const kampanjEnhet = { entitet_id: String(kampanj.id), entitet_typ: 'campaign', namn: kampanj.name, budget: budgetSek(kampanj.daily_budget) || null };
  const bas = `3d: ${kr(nr(d3.spend))}, ${nr(d3.kop)} köp, ROAS ${roasTxt(d3.roas)} · 7d: ${kr(nr(d7.spend))}, ${nr(d7.kop)} köp, ROAS ${roasTxt(d7.roas)} · break-even ROAS ${roasTxt(be)}.`;

  // 0. Break-even måste finnas — annars finns ingen linje att döma mot.
  if (!Number.isFinite(be) || be <= 1 || !Number.isFinite(beCpa) || beCpa <= 0) {
    return [rad(kampanjEnhet, kampanj, { sparr: 'Break-even saknas (momsbeslutet obeslutat eller ekonomin oräknad) — ingen dom kan fällas. Gissa aldrig.' })];
  }
  // 0. PAUSED är ett beslut. Rörs aldrig, aktiveras aldrig.
  if (kampanj.status !== 'ACTIVE') {
    return [rad(kampanjEnhet, kampanj, { sparr: `Kampanjen är ${kampanj.status} — ett beslut, rörs aldrig och aktiveras aldrig.` })];
  }
  if ((kampanj.effective_status ?? 'ACTIVE') !== 'ACTIVE') {
    return [rad(kampanjEnhet, kampanj, { sparr: `effective_status ${kampanj.effective_status} — kampanjen kör inte som vanligt; rörs inte förrän en människa tittat.` })];
  }

  const arTest = TEST_ABO.test(String(kampanj.name ?? ''));
  const enheter = budgetenheter(kampanj, adsets);
  const forlustdygn = forlustdygnIRad(dygn, be);

  // 1. Test-ABO: inga budgetändringar, ingen kampanjpaus. Bara annonskills.
  if (arTest) {
    const mal = enheter.length ? enheter : [kampanjEnhet];
    return mal.map((e) => rad(e, kampanj, {
      sparr: `Test-ABO (namnet matchar /test/i, regel 11) — lika budget per annons tills testet är läst. ${forlustdygn >= FORLUSTDYGN_FOR_PAUS ? `${forlustdygn} förlustdygn i rad — döms på annonsnivå, inte via kampanjens budget.` : ''}`.trim(),
      motivering: bas,
    }));
  }

  if (!enheter.length) {
    return [rad(kampanjEnhet, kampanj, { sparr: 'Ingen budgetenhet: varken kampanjen (CBO) eller något ACTIVE adset har daily_budget. Lifetime-budget rörs inte.', motivering: bas })];
  }

  // 3. FÖRLUSTSERIE: fem förlustdygn i rad ⇒ sänk, aldrig pausa (Axel 2026-09-10).
  if (forlustdygn >= FORLUSTDYGN_FOR_PAUS) {
    return enheter.map((e) => {
      if (!arAktiv(e)) return rad(e, kampanj, { sparr: `Adsetet är ${e.status}/${e.effective_status} — rörs inte.`, motivering: bas });
      const grund = `${forlustdygn} förlustdygn i rad (ROAS under break-even ${roasTxt(be)} med spend varje dygn) — gränsen är ${FORLUSTDYGN_FOR_PAUS}.`;
      const ny = nyBudget(e.budget, SANK_FAKTOR);
      if (ny === null) {
        return rad(e, kampanj, { sparr: `${grund} Står redan på golvet ${kr(GOLV_SEK)} — kampanjen pausas inte (Axel 2026-09-10), förlusten döms på annonsnivå.`, motivering: bas });
      }
      return rad(e, kampanj, { atgard: 'SANK', nytt: ny, motivering: `${grund} Sänks −30 % ${kr(e.budget)} → ${kr(ny)} utan hänsyn till kadensen. Ingen kampanjpaus. ${bas}` });
    });
  }

  // 4. NOLL KÖP på 7 dygn trots spend ≥ 3 × break-even-CPA.
  const nollKop = nr(d7.kop) === 0 && nr(d7.spend) >= NOLL_KOP_MULTIPEL * beCpa;
  if (nollKop) {
    return enheter.map((e) => {
      if (!arAktiv(e)) return rad(e, kampanj, { sparr: `Adsetet är ${e.status}/${e.effective_status} — rörs inte.`, motivering: bas });
      const tidigare = harRad(logg, e.entitet_id, 'NOLL_KOP_SANK', NOLL_KOP_FONSTER_DAGAR, idag);
      const grund = `0 köp på 7 dygn trots ${kr(nr(d7.spend))} spend (≥ ${NOLL_KOP_MULTIPEL} × break-even-CPA ${kr(beCpa)}).`;
      const ny = nyBudget(e.budget, SANK_FAKTOR);
      if (ny === null) {
        return rad(e, kampanj, { atgard: 'PAUSA', gammalt: 'ACTIVE', nytt: 'PAUSED', motivering: `${grund} Står redan på golvet ${kr(GOLV_SEK)} — inget mer att sänka, och en vecka på golvet utan ett enda köp pausas (enda kampanjpausen i motorn). ${bas}` });
      }
      return rad(e, kampanj, { atgard: 'NOLL_KOP_SANK', nytt: ny, motivering: `${grund} Sänks −30 % ${kr(e.budget)} → ${kr(ny)}${tidigare ? ` — igen (sänkt för noll köp inom ${NOLL_KOP_FONSTER_DAGAR} dygn enligt budgetloggen)` : ''}. Pausas först när golvet ${kr(GOLV_SEK)} är nått utan köp. ${bas}` });
    });
  }

  // 5. Signifikansgrinden.
  if (nr(d3.spend) < GRIND_SPEND_SEK || nr(d3.kop) < GRIND_KOP) {
    return enheter.map((e) => rad(e, kampanj, {
      sparr: `För tidigt: ${kr(nr(d3.spend))} och ${nr(d3.kop)} köp på 3 dygn — grinden går vid ${GRIND_SPEND_SEK} kr OCH ${GRIND_KOP} köp. Ingen dom.`,
      motivering: bas,
    }));
  }

  const vinst3 = vinstProcent(be, nr(d3.roas));
  const vinst7 = vinstProcent(be, nr(d7.roas));
  if (vinst3 === null) {
    return enheter.map((e) => rad(e, kampanj, { sparr: 'ROAS för 3 dygn saknas trots köp — Meta gav inget tal. Rör ingenting förrän siffran finns.', motivering: bas }));
  }
  const vinstTxt = `Vinst 3d ${pct(vinst3)}${vinst7 === null ? '' : `, 7d ${pct(vinst7)}`}.`;

  return enheter.map((e) => {
    if (!arAktiv(e)) return rad(e, kampanj, { sparr: `Adsetet är ${e.status}/${e.effective_status} — rörs inte.`, motivering: `${vinstTxt} ${bas}` });
    const dagar = dagarSedanAndring(logg, e.entitet_id, idag);
    const kadensOk = dagar === null || dagar >= KADENS_DAGAR;
    const kadensTxt = dagar === null ? 'aldrig ändrad av rutinen' : `${dagar} dygn sedan senaste ändring`;
    const grund = `${vinstTxt} ${bas}`;

    // 7. RAKET
    if (nr(d3.roas) >= RAKET_ROAS && nr(d7.roas) >= RAKET_ROAS) {
      const ny = nyBudget(e.budget, RAKET_FAKTOR);
      if (ny === null) return rad(e, kampanj, { sparr: `Raketläge, men taket ${kr(TAK_SEK)}/dag är nått.`, motivering: grund });
      return rad(e, kampanj, { atgard: 'RAKET', nytt: ny, motivering: `ROAS ≥ ${RAKET_ROAS} på både 3 och 7 dygn — dubblas ${kr(e.budget)} → ${kr(ny)} (Axel 2026-09-10). Tillåtet varje dag. ${grund}` });
    }
    if (vinst3 >= ZON_SKALA_OVER) {
      // 8. SNABB
      if (nr(d3.roas) >= SNABB_ROAS) {
        const ny = nyBudget(e.budget, SKALA_FAKTOR);
        if (ny === null) return rad(e, kampanj, { sparr: `Snabbspår, men taket ${kr(TAK_SEK)}/dag är nått.`, motivering: grund });
        return rad(e, kampanj, { atgard: 'SNABB', nytt: ny, motivering: `Snabbspår: vinst 3d ≥ ${ZON_SKALA_OVER} % och ROAS 3d ≥ ${SNABB_ROAS} — +20 % ${kr(e.budget)} → ${kr(ny)}. Tillåtet varje dag. ${grund}` });
      }
      // 9. SKALA
      if (vinst7 !== null && vinst7 >= ZON_SKALA_OVER) {
        if (!kadensOk) return rad(e, kampanj, { sparr: `Skalningsläge, men kadensspärren: ${kadensTxt} (krav ≥ ${KADENS_DAGAR}).`, motivering: grund });
        const ny = nyBudget(e.budget, SKALA_FAKTOR);
        if (ny === null) return rad(e, kampanj, { sparr: `Skalningsläge, men taket ${kr(TAK_SEK)}/dag är nått.`, motivering: grund });
        return rad(e, kampanj, { atgard: 'SKALA', nytt: ny, motivering: `Vinst ≥ ${ZON_SKALA_OVER} % på både 3 och 7 dygn — +20 % ${kr(e.budget)} → ${kr(ny)}. ${kadensTxt}. ${grund}` });
      }
      return rad(e, kampanj, { sparr: `Vinst 3d över ${ZON_SKALA_OVER} % men 7d ${vinst7 === null ? 'saknas' : pct(vinst7)} — inte bekräftat över veckan, och ROAS 3d under ${SNABB_ROAS}. Håll.`, motivering: grund });
    }
    // 10. HÅLL
    if (vinst3 >= ZON_SANK_UNDER) {
      return rad(e, kampanj, { sparr: `Håll: ${ZON_SANK_UNDER} ≤ vinst 3d < ${ZON_SKALA_OVER} % — läget vi vill ha. Ingen ändring.`, motivering: grund });
    }
    // 11. SÄNK
    if (!kadensOk) return rad(e, kampanj, { sparr: `Under ${ZON_SANK_UNDER} % vinst, men kadensspärren: ${kadensTxt} (krav ≥ ${KADENS_DAGAR}).`, motivering: grund });
    const ny = nyBudget(e.budget, SANK_FAKTOR);
    if (ny === null) return rad(e, kampanj, { sparr: `Under ${ZON_SANK_UNDER} % vinst, men står redan på golvet ${kr(GOLV_SEK)}. ${forlustdygn} förlustdygn i rad — kampanjen pausas inte, förlusten döms på annonsnivå.`, motivering: grund });
    return rad(e, kampanj, { atgard: 'SANK', nytt: ny, motivering: `Vinst 3d under ${ZON_SANK_UNDER} % — −30 % ${kr(e.budget)} → ${kr(ny)}. ${kadensTxt}. ${grund}` });
  });
}

/**
 * Annonskills. Ren funktion.
 *
 * @param {object} p
 * @param {Array}  p.annonser   14d-rader ur skalning.mjs byggRapport: {ad_id, namn, kampanj, amount_spent, kop, cpa, effective_status, dom:{klass, vinst_generos}}
 * @param {object} p.annonser7d ad_id → {amount_spent, kop, cpa} senaste 7 dygnen
 * @param {object} p.ekonomi    {breakEvenCpa}
 */
export function beslutaAnnonser({ annonser = [], annonser7d = {}, ekonomi = {} }) {
  const beCpa = ekonomi?.breakEvenCpa;
  // Ny annons-regeln mäts mot TARGET-CPA (Axel 2026-09-10); saknas den mot break-even.
  const malCpa = Number.isFinite(ekonomi?.targetCpa) && ekonomi.targetCpa > 0 ? ekonomi.targetCpa : beCpa;
  const malNamn = malCpa === ekonomi?.targetCpa ? 'target-CPA' : 'break-even-CPA (target saknas)';
  const ut = [];
  const grund = (a) => `14d: ${kr(a.amount_spent)}, ${a.kop} köp, CPA ${a.cpa ? kr(a.cpa) : '—'} · klass ${a.dom?.klass ?? '—'}.`;
  const bas = (a) => ({ entitet_id: String(a.ad_id), entitet_typ: 'ad', namn: a.namn, kampanj_namn: a.kampanj ?? null, atgard: null, gammalt: a.effective_status ?? null, nytt: null, motivering: grund(a), sparr: null });

  if (!Number.isFinite(beCpa) || beCpa <= 0) {
    return annonser.map((a) => ({ ...bas(a), sparr: 'Break-even-CPA saknas — ingen annons döms.' }));
  }
  const positivTotal = annonser.reduce((s, a) => s + Math.max(0, nr(a.dom?.vinst_generos)), 0);

  for (const a of annonser) {
    const r = bas(a);
    const status = a.effective_status ?? null;
    if (status !== null && status !== 'ACTIVE') {
      ut.push({ ...r, sparr: `Annonsen är ${status} — ett beslut, rörs aldrig.` });
      continue;
    }
    const andel = positivTotal > 0 ? Math.max(0, nr(a.dom?.vinst_generos)) / positivTotal : 0;
    if (andel > BENCHMARK_ANDEL) {
      ut.push({ ...r, sparr: `Benchmarken: bär ${pct(andel * 100)} av butikens positiva vinstbidrag — döms aldrig mot småannonser.` });
      continue;
    }
    // Ny annons-regeln (under 3 köp — annars gäller förlorare + trend nedan):
    // tre target-köp i spend utan att gå med vinst ⇒ pausa. "Inte lönsam" =
    // 0 köp, eller CPA över break-even (Axel 2026-09-10).
    const nyAnnons = nr(a.kop) < GRIND_KOP;
    const olonsam = nr(a.kop) === 0 || (Number.isFinite(nr(a.cpa)) && nr(a.cpa) > beCpa);
    if (nyAnnons && olonsam && nr(a.amount_spent) >= DODVIKT_MULTIPEL * malCpa) {
      const varfor = nr(a.kop) === 0 ? '0 köp' : `${a.kop} köp till CPA ${kr(a.cpa)} över break-even ${kr(beCpa)}`;
      ut.push({ ...r, atgard: 'PAUSA', gammalt: 'ACTIVE', nytt: 'PAUSED', motivering: `Dödvikt: ${varfor} på 14 dygn trots ${kr(a.amount_spent)} spend (≥ ${DODVIKT_MULTIPEL} × ${malNamn} ${kr(malCpa)}). ${grund(a)}` });
      continue;
    }
    if (a.dom?.klass === 'forlorare') {
      const s7 = annonser7d[String(a.ad_id)];
      if (!s7 || nr(s7.amount_spent) <= 0) {
        ut.push({ ...r, sparr: 'Förlorare på 14d men ingen spend senaste 7 dygnen — trenden går inte att läsa. Bevaka.' });
        continue;
      }
      const cpa7 = nr(s7.kop) > 0 ? nr(s7.amount_spent) / nr(s7.kop) : Infinity;
      if (cpa7 > beCpa) {
        ut.push({ ...r, atgard: 'PAUSA', gammalt: 'ACTIVE', nytt: 'PAUSED', motivering: `Förlorare på 14d OCH 7d-CPA ${Number.isFinite(cpa7) ? kr(cpa7) : '∞ (0 köp)'} över break-even ${kr(beCpa)} — trenden håller. ${grund(a)}` });
      } else {
        ut.push({ ...r, sparr: `Förlorare på 14d men 7d-CPA ${kr(cpa7)} under break-even ${kr(beCpa)} — trenden vänder, ingen kill.` });
      }
      continue;
    }
    ut.push({ ...r, sparr: `${a.dom?.klass ?? 'oklart'} — ingen kill-kandidat.` });
  }
  return ut;
}

/**
 * Max N genomförda ändringar per butik och rond, i prioritetsordning.
 * Redan gjorda ändringar i dag (loggen) räknas av, så en omkörning inte
 * dubblar. Resten hamnar i `vantar` — "väntar på Axel".
 */
export function prioritera(rader, { max = MAX_ANDRINGAR, logg = [], butik = null, idag = null } = {}) {
    const redan = butik && idag ? andringarIdag(logg, butik, idag).length : 0;
    const plats = Math.max(0, max - redan);
    const kandidater = rader
      .filter((r) => r.atgard)
      .map((r, i) => ({ r, i }))
      .sort((a, b) => (PRIORITET[a.r.atgard] ?? 9) - (PRIORITET[b.r.atgard] ?? 9)
        || nr(b.r.gammalt) - nr(a.r.gammalt)
        || a.i - b.i)
      .map(({ r }) => r);
    const genomfor = kandidater.slice(0, plats);
    const vantar = kandidater.slice(plats).map((r) => ({ ...r, sparr: `Över max ${max} ändringar per rond${redan ? ` (${redan} redan gjorda i dag)` : ''} — väntar på Axel.` }));
    return { genomfor, vantar, redanIdag: redan, plats };
}

/** Hela butikens dom: kampanjer + annonser + plan. Ren funktion. */
export function besluta({ kampanjer = [], adsets = [], insikter = {}, dygn = {}, annonser = [], annonser7d = {}, ekonomi = {}, logg = [], idag, butik = null, max = MAX_ANDRINGAR }) {
  const kampanjrader = [];
  for (const k of kampanjer) {
    const id = String(k.id);
    kampanjrader.push(...beslutaKampanj({
      kampanj: k, adsets,
      d3: insikter[id]?.d3 ?? {}, d7: insikter[id]?.d7 ?? {},
      dygn: dygn[id] ?? [], ekonomi, logg, idag,
    }));
  }
  const annonsrader = beslutaAnnonser({ annonser, annonser7d, ekonomi });
  // En annons i en kampanj som pausas i samma rond behöver inte pausas själv.
  const pausadeKampanjer = new Set(kampanjrader.filter((r) => r.atgard === 'PAUSA' && r.entitet_typ === 'campaign').map((r) => r.kampanj_namn));
  const annonserKvar = annonsrader.map((r) => (r.atgard && pausadeKampanjer.has(r.kampanj_namn)
    ? { ...r, atgard: null, sparr: 'Kampanjen pausas i samma rond — annonsen följer med.' }
    : r));
  const plan = prioritera([...kampanjrader, ...annonserKvar], { max, logg, butik, idag });
  return { kampanjrader, annonsrader: annonserKvar, plan };
}
