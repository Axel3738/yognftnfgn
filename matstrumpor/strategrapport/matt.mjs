// matt.mjs — mätningen av strategens vecka i Growth Guide. Ren logik, ingen I/O.
//
// Vad som mäts (kriterierna ur Bruces SOP, sop/BRUCE-WEEKLY-SELF-REVIEW.md,
// CS-KLART.md och Evolves iterationsplaybok — allt läst 2026-10-03):
//   K1  kön: rader med RESULTS som inte är stängda, delad i bedömbara
//       (≥ 300 kr OCH ≥ 3 köp, Axels beslut 2026-10-02) och "too little data"
//   K2  stängda rader: människotext i LEARNINGS och (STATUS Done eller "Too
//       little data"), nya sedan förra snapshoten. Under grinden ska texten
//       vara "Too little data"; över grinden ska en rad börja "Guess:"
//   K4  EN ny rad per vecka, skapad av strategen själv (created_by), med de sex
//       cellerna ifyllda och MEMO utan systemets "(seeded"-prefix
//   K6  levande vinnare (🏆/💸, etikett ≤ 28 dygn, annonsen kör) och hur många
//       LIVE iterationer den fått — kursen vill ha tre inom 14 dagar
//   K9  butikens namn i hans konceptnamn eller memo (mjuk påminnelse, aldrig
//       eskalering — regeln gäller annonsen, inte en planeringscell)
// Inte mätbart via API:t (står i README): om han ÖPPNADE sidan, kopior av en
// förlorad imitation, NEW FOOTAGE-regeln på kodens egna rader, "brief saknas"
// på hans egna planeringsrader (ingen koppling rad → batch finns).
//
// Människotext = det som står EFTER systemets slutmarkör "(end of seed)" —
// Bruces SOP säger "write under any text already there" (growthguide.mjs
// SEED_SLUT, samma regel som ronden skriver med).
//
// Varför en snapshot: Notion saknar ändringshistorik, och koden skriver om
// mätkolumnerna varje rond så boten blir last_edited_by igen. Diffen mot förra
// veckans snapshot är måttet; Done och människotext överlever alltid.

import { RANG, ETIKETT, hitRate, dagarMellan } from '../etikett.mjs';
import { SEED_SLUT } from '../growthguide.mjs';

export const SEEDED = '(seeded';
export const TOO_LITTLE = /too little data/i;
export const GUESS = /\bguess\s*:/i;
export const HOOK_HOLD = /\bhook\b|\bhold\b/i;
export const BUTIKSNAMN = /matstrumpor/i;
export const SADD_NAMN = Object.freeze({ memo: 'BREAKTHROUGH MEMO', desire: 'DESIRE/CORE AVATAR', subavatar: 'SUB AVATAR', angles: 'ANGLE(S)', awareness: 'AWARENESS LEVEL', adType: 'AD TYPE' });
export const GRIND = Object.freeze({ spend_sek: 300, kop: 3 });
const LIVE_STATUS = /^Approved/;

/** Människans del av en cell: allt när den inte är sådd, det efter slutmarkören
 *  när den är det. Gammal sådd utan markör räknas som människans bara när
 *  SOP:ens egna ord finns i den. Ren. */
export function manniskodel(s) {
  const t = String(s ?? '').trim();
  if (!t || !t.startsWith(SEEDED)) return t;
  const i = t.lastIndexOf(SEED_SLUT);
  if (i >= 0) return t.slice(i + SEED_SLUT.length).trim();
  return TOO_LITTLE.test(t) || GUESS.test(t) ? t : '';
}
export const arManniskotext = (s) => manniskodel(s).length > 0;
export const arBedombar = (spend, kop, grind = GRIND) => Number(spend ?? NaN) >= grind.spend_sek && Number(kop ?? NaN) >= grind.kop;
/** Stängd = Done, eller "Too little data" skrivet av en människa (SOP steg 1 säger "Next row" utan Done). Ren. */
export const arStangd = (r) => r.status === 'Done' || TOO_LITTLE.test(manniskodel(r.learnings));
const inom = (ts, fran, till) => !!ts && ts >= fran && ts <= till;

/** K1: kön = rader med utfall som inte är stängda. Ren. */
export function koRader(rader) {
  return (rader ?? []).filter((r) => r.results && !arStangd(r));
}

export function delaKo(rader, grind = GRIND) {
  const bedombara = [], tunna = [];
  for (const r of rader) (arBedombar(r.spend, r.kop, grind) ? bedombara : tunna).push(r);
  return { bedombara, tunna };
}

/** K2: rader som stängdes med en lärdom sedan förra snapshoten (eller
 *  någonsin, första gången). Kvaliteten per rad: tunn men dömd, utan Guess. Ren. */
export function betade(rader, forra, grind = GRIND) {
  const prev = new Map((forra?.rader ?? []).map((r) => [r.id, r]));
  const ut = [];
  for (const r of rader ?? []) {
    const text = manniskodel(r.learnings);
    if (!text || !arStangd(r)) continue;
    const p = prev.get(r.id);
    if (p && arManniskotext(p.learnings) && arStangd(p)) continue;
    const tunn = !arBedombar(r.spend, r.kop, grind);
    const tooLittle = TOO_LITTLE.test(text);
    const guess = GUESS.test(text);
    ut.push({
      id: r.id, titel: r.titel, results: r.results ?? null, tunn,
      typ: tooLittle && !guess ? 'too_little' : 'lardom',
      harGuess: guess, namnerHookHold: HOOK_HOLD.test(text),
      tunnMenDomd: tunn && !!r.results && !tooLittle,
      utanGuess: !tunn && !!r.results && !guess,
    });
  }
  return ut;
}

/** Done utan en skriven lärdom — nytt sedan förra snapshoten. Ren. */
export function doneUtanLardom(rader, forra) {
  const prev = new Map((forra?.rader ?? []).map((r) => [r.id, r]));
  return (rader ?? []).filter((r) => r.status === 'Done' && !arManniskotext(r.learnings) && prev.get(r.id)?.status !== 'Done').map((r) => ({ id: r.id, titel: r.titel }));
}

/** K4: strategens egna nya rader i fönstret, med vilka av de sex cellerna som saknas. Ren. */
export function nyaRader(rader, { strategId, fran, till }) {
  const ut = [];
  for (const r of rader ?? []) {
    if (r.created_by !== strategId || !inom(r.created_time, fran, till)) continue;
    const saknas = [];
    for (const [c, namn] of Object.entries(SADD_NAMN)) {
      const v = String(r[c] ?? '').trim();
      if (!v || (v.startsWith(SEEDED) && !manniskodel(v))) saknas.push(namn);
    }
    ut.push({ id: r.id, titel: r.titel, status: r.status ?? null, created_time: r.created_time, adType: r.adType ?? null, saknas, komplett: !saknas.length, filming: r.status === 'Filming', harBrief: !!r.linkBrief });
  }
  return ut.sort((a, b) => String(a.created_time).localeCompare(String(b.created_time)));
}

/** K9: butikens namn i det som blir en annons: hans eget konceptnamn eller en
 *  människoskriven memo. En lärdom får nämna sajten. Ren. */
export function butiksnamnRader(rader, { strategId }) {
  return (rader ?? []).filter((r) => BUTIKSNAMN.test(manniskodel(r.memo)) || (r.created_by === strategId && BUTIKSNAMN.test(r.titel ?? ''))).map((r) => ({ id: r.id, titel: r.titel }));
}

/** Hubben: raderna strategen rörde i fönstret (skapade eller sist redigerade),
 *  de av hans rader som gick live sedan förra snapshoten, och hur många av hans
 *  rader som väntar i kön. Ren. */
export function hubbAktivitet(hub, { strategId, fran, till, koStatusar = ['Creative strat review', 'To be Reviewed'], forraHub = null }) {
  const egna = (hub ?? []).filter((h) => (h.ansvariga ?? []).includes(strategId));
  const inlamnade = egna.filter((h) => (h.created_by === strategId && inom(h.created_time, fran, till)) || (h.last_edited_by === strategId && inom(h.last_edited_time, fran, till))).map((h) => ({ id: h.id, namn: h.namn, status: h.status ?? null }));
  const forra = new Map((forraHub ?? []).map((h) => [h.id, h]));
  const gickLive = forraHub ? egna.filter((h) => LIVE_STATUS.test(String(h.status ?? '')) && forra.has(h.id) && !LIVE_STATUS.test(String(forra.get(h.id).status ?? ''))).map((h) => ({ id: h.id, namn: h.namn })) : [];
  const iKo = egna.filter((h) => koStatusar.includes(h.status)).length;
  return { inlamnade, gickLive, gickLiveMatt: !!forraHub, iKo, egna: egna.length };
}

/** K6: vinnare (🏆/💸) och deras iterationer. Levande = etikett ≤ levandeDagar
 *  och minst en annons ACTIVE. Iteration = en batch vars förälder är vinnaren
 *  (batchtiteln eller något av dess annonsnamn); bara LIVE iterationer (med
 *  annons-id i kontot) räknas mot kursens tre, briefade står för sig. Ren. */
export function vinnare(batchar, { idag, levandeDagar = 28, iterationDagar = 14 }) {
  const ut = [];
  for (const b of batchar ?? []) {
    if (b.etikett !== ETIKETT.BREAKTHROUGH && b.etikett !== ETIKETT.SPEND_WINNER) continue;
    const datumen = (b.annonser ?? []).flatMap((a) => a.etiketter ?? []).filter((e) => e.etikett === b.etikett && e.datum).map((e) => e.datum).sort();
    const etikettDatum = datumen[0] ?? b.d0 ?? null;
    const aktiv = (b.annonser ?? []).some((a) => a.status === 'ACTIVE');
    const dagar = etikettDatum ? dagarMellan(etikettDatum, idag) : null;
    const levande = aktiv && dagar !== null && dagar >= 0 && dagar <= levandeDagar;
    const namn = new Set([b.titel, ...(b.annonser ?? []).map((a) => a.namn)].filter(Boolean));
    const iterationer = (batchar ?? []).filter((x) => x !== b && x.foralder && namn.has(x.foralder));
    const live = iterationer.filter((x) => (x.ids ?? []).length > 0);
    const forsent = levande && dagar >= iterationDagar;
    ut.push({ titel: b.titel, etikett: b.etikett, etikettDatum, dagar, aktiv, levande, iterationer: live.length, briefade: iterationer.length - live.length, iterationTitlar: live.map((x) => x.titel), utanIteration: forsent && live.length === 0, underTre: forsent && live.length < 3 });
  }
  return ut.sort((a, b) => RANG[b.etikett] - RANG[a.etikett] || (a.dagar ?? 999) - (b.dagar ?? 999));
}

/** Utfallen i fönstret: batcher som fick en etikett med datum i [fran, till].
 *  Bästa först. `egen` = hubbens Ansvarig är strategen. Ren. */
export function veckansUtfall(batchar, { fran, till, strategNamn, grind = GRIND }) {
  const ut = [];
  for (const b of batchar ?? []) {
    const iVeckan = (b.annonser ?? []).flatMap((a) => (a.etiketter ?? []).map((e) => ({ ...e, annons: a.namn }))).filter((e) => e.datum && e.datum >= fran && e.datum <= till);
    if (!iVeckan.length) continue;
    const basta = [...iVeckan].sort((x, y) => (RANG[y.etikett] ?? -1) - (RANG[x.etikett] ?? -1))[0];
    if (RANG[basta.etikett] === undefined) continue;
    ut.push({ titel: b.titel, etikett: basta.etikett, vecka: basta.vecka ?? 1, uppgradering: iVeckan.some((e) => (e.vecka ?? 1) > 1), egen: (b.forfattare ?? []).includes(strategNamn), bedombar: arBedombar(b.spend_14d_sek, b.kop_14d, grind), hook: b.hook_rate ?? null, hold: b.hold_rate ?? null, kreator: b.kreator ?? null, spend: b.spend_14d_sek ?? null, iteration: !!b.foralder });
  }
  return ut.sort((a, b) => (RANG[b.etikett] ?? -1) - (RANG[a.etikett] ?? -1) || (b.spend ?? 0) - (a.spend ?? 0));
}

/** Referensen: kontots största bedömbara batch med hook rate (för "the top batch sits at"). Ren. */
export function toppBatch(batchar, grind = GRIND) {
  return [...(batchar ?? [])].filter((b) => b.hook_rate != null && arBedombar(b.spend_14d_sek, b.kop_14d, grind)).sort((a, b) => (b.spend_14d_sek ?? 0) - (a.spend_14d_sek ?? 0)).map((b) => ({ titel: b.titel, hook: b.hook_rate, hold: b.hold_rate }))[0] ?? null;
}

/** Hit rate för strategens egna batcher och för kontot, Evolves två nämnare;
 *  träffar som är iterationer av en vinnare räknas för sig (SVAR.md punkt 4). Ren. */
export function hitrater(batchar, { strategNamn }) {
  const med = (batchar ?? []).filter((b) => b.etikett);
  const egna = med.filter((b) => (b.forfattare ?? []).includes(strategNamn));
  const traff = (b) => b.etikett === ETIKETT.BREAKTHROUGH || b.etikett === ETIKETT.SPEND_WINNER;
  return {
    egen: { ...hitRate(egna.map((b) => ({ etikett: b.etikett }))), iter: egna.filter((b) => traff(b) && b.foralder).length },
    konto: { ...hitRate(med.map((b) => ({ etikett: b.etikett }))), iter: med.filter((b) => traff(b) && b.foralder).length },
  };
}

/** Historiken som en rad per vecka (sista raden vinner — --igen lägger till en
 *  andra), bara veckor FÖRE den som mäts, i veckoordning. Ren. */
export function perVecka(historik, fore = null) {
  const m = new Map();
  for (const h of historik ?? []) if (h?.vecka && (!fore || h.vecka < fore)) m.set(h.vecka, h);
  return [...m.values()].sort((a, b) => String(a.vecka).localeCompare(String(b.vecka)));
}

/**
 * Hela mätningen. Indata:
 *  roadmap   kompakta rader (notion.mjs roadmapRad)
 *  forra     förra snapshoten { skrivet, rader, hub } eller null
 *  hub       kompakta hubbrader (notion.mjs hubbRad)
 *  batchar   growthguide.mjs batcher(arkiv, { hub, uppladdade })
 *  strateg   { notion_user_id, namn, fornamn }
 *  idag      'YYYY-MM-DD'; fonster { fran, till } för etiketter (datum);
 *  aktivitet { fran, till } ISO-tidsstämplar för created/edited
 */
export function matVecka({ roadmap, forra = null, hub = [], batchar = [], strateg, idag, vecka, fonster, aktivitet, grind = GRIND, konfig = {} }) {
  const strategId = strateg.notion_user_id;
  const koStart = koRader(forra?.rader ?? roadmap);
  const koSlut = koRader(roadmap);
  const startDel = delaKo(koStart, grind);
  const slutDel = delaKo(koSlut, grind);
  const bet = betade(roadmap, forra, grind);
  const nya = nyaRader(roadmap, { strategId, fran: aktivitet.fran, till: aktivitet.till });
  const hubb = hubbAktivitet(hub, { strategId, fran: aktivitet.fran, till: aktivitet.till, koStatusar: konfig.ko_statusar, forraHub: forra?.hub ?? null });
  const vin = vinnare(batchar, { idag, levandeDagar: konfig.vinnare_levande_dagar ?? 28, iterationDagar: konfig.iteration_dagar ?? 14 });
  const utfall = veckansUtfall(batchar, { fran: fonster.fran, till: fonster.till, strategNamn: strateg.namn, grind });
  const M = {
    vecka, idag, fonster, aktivitet, strateg: { id: strateg.id ?? null, namn: strateg.namn, fornamn: strateg.fornamn },
    forsta: !forra,
    ko: {
      start: koStart.length, startBedombara: startDel.bedombara.length, startTunna: startDel.tunna.length,
      slut: koSlut.length, slutBedombara: slutDel.bedombara.length, slutTunna: slutDel.tunna.length,
      bedombaraKvar: slutDel.bedombara.map((r) => r.titel),
    },
    betade: bet,
    kvalitet: {
      tunnMenDomd: bet.filter((b) => b.tunnMenDomd).map((b) => b.titel),
      utanGuess: bet.filter((b) => b.utanGuess).map((b) => b.titel),
      doneUtanLardom: doneUtanLardom(roadmap, forra).map((r) => r.titel),
    },
    nyaRader: nya,
    hubb,
    butiksnamn: butiksnamnRader(roadmap, { strategId }).map((r) => r.titel),
    vinnare: vin,
    utfall,
    topp: toppBatch(batchar, grind),
    hitrate: hitrater(batchar, { strategNamn: strateg.namn }),
  };
  // Måndagskollen är SOP:ens två steg: stäng rader med lärdom, lägg en ny rad.
  // Hubbarbetet är hans vanliga jobb och bevisar inte kollen.
  M.gjordeKollen = bet.length > 0 || nya.length > 0;
  return M;
}

/** Till Axel bara när det behövs: ingen koll N veckor i rad (räknat på
 *  distinkta veckor före den här), eller en levande vinnare utan en enda live
 *  iteration efter 14 dagar. Ren. */
export function eskalering(M, historik = [], { veckor_utan_koll = 2 } = {}) {
  const orsaker = [];
  if (!M.gjordeKollen) {
    let rad = 1;
    for (const h of perVecka(historik, M.vecka).reverse()) { if (h.gjordeKollen === false) rad++; else break; }
    if (rad >= veckor_utan_koll) orsaker.push({ kod: 'ingen_koll', veckor: rad });
  }
  for (const v of M.vinnare) if (v.utanIteration) orsaker.push({ kod: 'vinnare_utan_iteration', titel: v.titel, dagar: v.dagar });
  return { tillAxel: orsaker.length > 0, orsaker };
}

/** Veckans action item: läget avgör nyckeln, minnet avgör vilket i listan.
 *  Samma item ges aldrig två gånger förrän listan är slut. Ren. */
export function actionNyckel(M) {
  if (M.ko.bedombaraKvar.length) return 'ko_bedombar_kvar';
  if (!M.nyaRader.length) return 'ingen_ny_rad';
  if (M.vinnare.some((v) => v.levande && v.iterationer < 3)) return 'vinnare_utan_iteration';
  if (M.kvalitet.doneUtanLardom.length) return 'done_utan_lardom';
  const egna = M.utfall.filter((u) => u.egen);
  if (egna.length) return egna[0].etikett;
  return 'allmant';
}

export function valjAction(M, historik = [], bank) {
  const nyckel = actionNyckel(M);
  const lista = bank?.per_lage?.[nyckel] ?? bank?.per_lage?.allmant ?? [];
  if (!lista.length) return null;
  const gjorda = perVecka(historik).filter((h) => h.action?.nyckel === nyckel).map((h) => h.action.index);
  let idx = lista.findIndex((_, i) => !gjorda.includes(i));
  if (idx < 0) idx = gjorda.length % lista.length;
  return { nyckel, index: idx, text_en: lista[idx].text_en, rubrik_sv: bank?.rubrik_sv?.[nyckel] ?? nyckel, kalla: lista[idx].kalla ?? null };
}
