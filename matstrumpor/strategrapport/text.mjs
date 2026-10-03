// text.mjs — texterna i strategrapporten. Ren logik, ingen I/O.
//
//   feedbackText   till Bruce (engelska): hans måndagskoll mätt, veckans utfall
//                  på hans koncept, vinnarna att bygga på, hit rate som bråk,
//                  ETT action item. Klarar redigerarrapportens spärr
//                  (post.mjs kontrollera: inga kronor, ROAS, köp, tankstreck,
//                  butiksnamn i löptexten) — kommentaren kan vidarebefordras.
//   loggradText    SYSTEM-kolumnen på veckans Log-rad (kort, engelska)
//   rapportAxel    svaret i chatten (svenska, en sak per rad)
//   eskaleringText kommentaren till Axel (svenska, bara när det behövs)
//
// Inga påhittade tal: allt kommer ur mätningen (matt.mjs). Hook/hold bara när
// batchen är bedömbar och måttet är rimligt (< 90 %, post.mjs HOOK_ORIMLIG).

import { kontrollera, procent, datumEn, ETIKETTNAMN, HOOK_ORIMLIG } from '../../redigerarrapport/post.mjs';
import { RANG } from '../etikett.mjs';

/** Konceptradens dom per utfall — strategens version (konceptet är hans). */
export const UTFALLSRAD = Object.freeze({
  BREAKTHROUGH: 'Breakthrough: this concept took its share of the campaign in week one and the campaign grew with it. Three iterations on it within 14 days, before anything new.',
  SPEND_WINNER: 'Spend Winner: Meta found the audience and spent on it, but it did not turn that into enough purchases. That is belief, urgency or the landing page, and it is the next brief\'s job.',
  KPI_WINNER: 'KPI Winner: it converts when it is shown, but Meta shows it little. Read the hook first, then the hold, before you decide what changes.',
  LOSER: 'Loser: this angle did not stop enough people. The loss is the concept\'s unless the cut differs from the brief.',
  INGEN_LEVERANS: 'No delivery: Meta never showed it, so it does not count in your hit rate. Only the first frame is worth a second look.',
});

/** En titel i löptext: aldrig butikens namn, aldrig tankstreck. Ren. */
export const rensa = (s) => String(s ?? '').replace(/matstrumpor/gi, 'the store').replace(/[—–]/g, '-').replace(/\d\s?kr\b/gi, (m) => m.replace(/kr/i, 'SEK ')).replace(/\bSEK\s/g, '').trim();
const lista = (xs, max = 8) => { const v = xs.slice(0, max).map(rensa); const kvar = xs.length - v.length; return v.join(', ') + (kvar > 0 ? ` and ${kvar} more` : ''); };
const ett = (n, en, flera) => `${n} ${n === 1 ? en : flera}`;
const namn = (e) => ETIKETTNAMN[e] ?? e;

function hookRad(u, topp) {
  if (!u.bedombar) return 'Too little data on this one to read hook and hold.';
  if (u.hook == null) return 'Hook and hold: not measured on this one.';
  if (u.hook >= HOOK_ORIMLIG) return 'Hook and hold: the measurement on this one is not reliable, so we leave them out.';
  const egen = `Hook rate ${procent(u.hook)}, hold ${procent(u.hold)}.`;
  if (topp && topp.titel !== u.titel && topp.hook != null && topp.hook < HOOK_ORIMLIG) return `${egen} The account's top batch sits at ${procent(topp.hook)} / ${procent(topp.hold)}.`;
  return egen;
}

function utfallBlock(u, rubrik, topp) {
  return [
    `${rubrik}: ${rensa(u.titel)}, ${namn(u.etikett)} (week ${u.vecka}${u.uppgradering ? ', upgraded' : ''}).`,
    UTFALLSRAD[u.etikett] ?? '',
    u.etikett === 'INGEN_LEVERANS' ? '' : hookRad(u, topp),
  ].filter(Boolean).join(' ');
}

/** Måndagskollen i ord. Ren. */
export function kollRader(M) {
  const r = [];
  const k = M.ko;
  r.push(M.forsta
    ? `Rows with a result and not Done when this review started: ${k.start} (${k.startBedombara} with enough data, ${k.startTunna} too little data).`
    : `Rows with a result and not Done at the start of the week: ${k.start} (${k.startBedombara} with enough data, ${k.startTunna} too little data).`);
  const lard = M.betade.filter((b) => b.typ === 'lardom').length;
  const tunn = M.betade.length - lard;
  r.push(M.betade.length ? `You closed ${M.betade.length}: ${ett(lard, 'with a learning', 'with a learning')}, ${tunn} as too little data.` : 'You closed none.');
  if (!k.slut) r.push('Nothing left open.');
  else if (k.bedombaraKvar.length) r.push(`Still open: ${k.slut}. With enough data, first to close: ${lista(k.bedombaraKvar, 6)}.`);
  else r.push(`Still open: ${k.slut}, all under the data gate. Too little data is the honest line there, one row at a time.`);
  if (M.kvalitet.tunnMenDomd.length) r.push(`Closed under the data gate but judged anyway: ${lista(M.kvalitet.tunnMenDomd)}. Under the gate the only honest line is Too little data.`);
  if (M.kvalitet.utanGuess.length) r.push(`Closed without a line that starts with Guess: ${lista(M.kvalitet.utanGuess)}. The guess is the whole point, it is what the next test checks.`);
  if (M.kvalitet.doneUtanLardom.length) r.push(`Set to Done without a learning: ${lista(M.kvalitet.doneUtanLardom)}. A row is Done when LEARNINGS is written.`);
  if (M.nyaRader.length) {
    for (const n of M.nyaRader) {
      r.push(n.komplett
        ? `New concept row: ${rensa(n.titel)}, with memo, desire, sub avatar, angle, awareness level and ad type. Good.`
        : `New concept row: ${rensa(n.titel)}. Missing: ${n.saknas.join(', ')}. Fill those in before the brief.`);
      if (n.filming) r.push('It is a Filming row: no hub row until the raw clips are in Drive.');
    }
    if (M.nyaRader.length > 1) r.push(`That is ${M.nyaRader.length} new rows. The SOP says one per week, so the rest wait their turn.`);
  } else {
    r.push('New concept row: none this week. One row, before it is briefed, every week.');
  }
  r.push(M.hubb.inlamnade.length
    ? `Briefs you handed in to the hub: ${M.hubb.inlamnade.length} (${lista(M.hubb.inlamnade.map((h) => h.namn), 6)}). Waiting in the review queue: ${M.hubb.iKo}.`
    : `Briefs you handed in to the hub: none. Waiting in the review queue: ${M.hubb.iKo}.`);
  for (const u of M.kvalitet.utanBrief) r.push(`Open for more than a week without a brief: ${rensa(u.titel)} (${u.dagar} days). Brief it or set it to Filming.`);
  if (M.butiksnamn.length) r.push(`The store's name appears in ${lista(M.butiksnamn)}. It never appears in an ad, a memo or a learning.`);
  return r;
}

/** Veckans utfall på hans koncept. Ren. */
export function utfallRader(M) {
  const r = [];
  const egna = M.utfall.filter((u) => u.egen);
  const andra = M.utfall.length - egna.length;
  if (!egna.length) {
    r.push(andra ? `No concept of yours got a label this week (${ett(andra, 'label', 'labels')} on other concepts).` : 'No concept of yours got a label this week.');
    return r;
  }
  const med = egna.filter((u) => u.etikett !== 'INGEN_LEVERANS');
  const utan = egna.filter((u) => u.etikett === 'INGEN_LEVERANS');
  if (med.length) {
    const basta = med[0];
    r.push(utfallBlock(basta, RANG[basta.etikett] >= RANG.KPI_WINNER ? 'Best first' : 'Largest first', M.topp));
    const forlorare = med.find((u) => u !== basta && u.etikett === 'LOSER');
    if (forlorare) r.push(utfallBlock(forlorare, 'One loser we learn from', M.topp));
    const rest = med.filter((u) => u !== basta && u !== forlorare);
    if (rest.length) r.push(`Also labelled this week: ${rest.slice(0, 10).map((u) => `${rensa(u.titel)} (${namn(u.etikett)})`).join('; ')}${rest.length > 10 ? `; and ${rest.length - 10} more` : ''}.`);
  }
  if (utan.length) r.push(`No delivery: ${lista(utan.map((u) => u.titel), 10)}. Meta never showed ${utan.length === 1 ? 'it' : 'them'}, so there is nothing in the numbers to read and ${utan.length === 1 ? 'it does' : 'they do'} not count in your hit rate.`);
  return r;
}

/** Vinnarna att bygga på. Ren. */
export function vinnareRader(M) {
  const lev = M.vinnare.filter((v) => v.levande);
  if (!lev.length) return ['No winner alive right now (label older than 28 days, or the ad is off), so the next row is a new angle, not a copy.'];
  return lev.map((v) => `${rensa(v.titel)}: ${namn(v.etikett)} ${v.dagar} days ago, ${ett(v.iterationer, 'iteration', 'iterations')} so far. The course asks for three within 14 days${v.iterationer >= 3 ? ', done' : v.utanIteration ? ', and none has started' : ''}.`);
}

export function hitrateRad(M) {
  const e = M.hitrate.egen, k = M.hitrate.konto;
  return `Your hit rate, all your concepts: ${e.traff} of ${e.levererade} that got delivery (${e.traff} of ${e.alla} counting no delivery). The account: ${k.traff} of ${k.levererade}. Benchmark across accounts: 5 to 10 %, a reference, not a grade.`;
}

/**
 * Hela feedbacken till strategen.
 *  M       matt.mjs matVecka
 *  action  { text_en } | null
 *  forra   { text_en, svar } | null  (förra veckans item och hans NOTES-svar)
 */
export function feedbackText(M, { action = null, forra = null } = {}) {
  const r = [];
  r.push(`Weekly strategy review, week ${String(M.vecka).split('-W')[1]} (${datumEn(M.fonster.fran)} to ${datumEn(M.fonster.till)}), for ${M.strateg.fornamn}`);
  r.push('');
  if (forra) {
    r.push(forra.svar
      ? `Last week's one thing: you wrote in NOTES "${rensa(forra.svar).slice(0, 160)}". Thank you.`
      : `Last week's one thing was: ${forra.text_en} Nothing in NOTES on that row yet. One line there when it is done.`);
    r.push('');
  }
  r.push('Your Monday check');
  r.push(...kollRader(M));
  r.push('');
  r.push('What your concepts did this week');
  r.push(...utfallRader(M));
  r.push('');
  r.push('Winners to build on');
  r.push(...vinnareRader(M));
  r.push('');
  r.push(hitrateRad(M));
  if (action) {
    r.push('');
    r.push(`One thing for this week: ${action.text_en} Write what you did in NOTES on this row by Thursday.`);
  }
  const text = r.join('\n');
  kontrollera(text);
  return text;
}

/** SYSTEM-kolumnen på Log-raden: hela veckan på en rad, högst 1 900 tecken. Ren. */
export function loggradText(M, action = null) {
  const lard = M.betade.filter((b) => b.typ === 'lardom').length;
  const egna = M.utfall.filter((u) => u.egen);
  const antal = {};
  for (const u of egna) antal[u.etikett] = (antal[u.etikett] ?? 0) + 1;
  const delar = [
    `Weekly review ${M.vecka}`,
    `queue at start ${M.ko.start} (${M.ko.startBedombara} with enough data)`,
    `closed ${M.betade.length} (${lard} learnings, ${M.betade.length - lard} too little data)`,
    `open now ${M.ko.slut}`,
    `new rows ${M.nyaRader.length}${M.nyaRader.some((n) => !n.komplett) ? ' (incomplete)' : ''}`,
    `briefs handed in ${M.hubb.inlamnade.length}`,
    egna.length ? `labels on own concepts: ${Object.entries(antal).map(([k, v]) => `${namn(k)} ${v}`).join(', ')}` : 'no labels on own concepts',
    `winners alive ${M.vinnare.filter((v) => v.levande).length}`,
    `hit rate ${M.hitrate.egen.traff}/${M.hitrate.egen.levererade} with delivery`,
    action ? `one thing: ${action.nyckel} #${action.index}` : null,
    M.gjordeKollen ? 'Monday check: done' : 'Monday check: not done',
  ].filter(Boolean);
  return delar.join(' · ').slice(0, 1900);
}

/** Svaret i chatten till Axel: svenska, en sak per rad. Ren. */
export function rapportAxel(M, { action = null, eskalering = null, skarpt = false, lank = null } = {}) {
  const lard = M.betade.filter((b) => b.typ === 'lardom').length;
  const egna = M.utfall.filter((u) => u.egen);
  const antal = {};
  for (const u of egna) antal[u.etikett] = (antal[u.etikett] ?? 0) + 1;
  const r = [];
  r.push(`Strategrapporten vecka ${String(M.vecka).split('-W')[1]} för ${M.strateg.fornamn}.`);
  r.push(M.gjordeKollen ? 'Han gjorde sin måndagskoll.' : 'Han gjorde ingen måndagskoll i veckan.');
  r.push(`Kön i början: ${M.ko.start} rader, ${M.ko.startBedombara} med nog data.`);
  r.push(M.betade.length ? `Stängda i veckan: ${M.betade.length}, varav ${lard} med lärdom.` : 'Stängda i veckan: inga.');
  r.push(M.nyaRader.length ? `Ny konceptrad: ${M.nyaRader.length}${M.nyaRader.every((n) => n.komplett) ? ', komplett' : ', ofullständig'}.` : 'Ny konceptrad: ingen.');
  r.push(`Briefer i hubben: ${M.hubb.inlamnade.length}.`);
  r.push(egna.length ? `Hans utfall i veckan: ${Object.entries(antal).map(([k, v]) => `${v} ${namn(k).toLowerCase()}`).join(', ')}.` : 'Hans utfall i veckan: inga nya etiketter.');
  r.push(`Hit rate: ${M.hitrate.egen.traff} av ${M.hitrate.egen.levererade} med leverans.`);
  if (action) r.push(`Veckans sak till honom: ${action.text_en}`);
  r.push(eskalering?.tillAxel ? `Till dig: ${eskalering.orsaker.map(eskRad).join(' ')}` : 'Inget som kräver dig.');
  r.push(skarpt ? `Skrivet i Notion: Log-raden och kommentaren till honom.${lank ? ` ${lank}` : ''}` : 'Torrt: inget skrivet i Notion.');
  return r.join('\n');
}

function eskRad(o) {
  if (o.kod === 'ingen_koll') return `Ingen måndagskoll ${o.veckor} veckor i rad.`;
  if (o.kod === 'vinnare_utan_iteration') return `Vinnaren ${rensa(o.titel)} har ingen iteration efter ${o.dagar} dagar.`;
  if (o.kod === 'butiksnamn') return `Butikens namn står i ${o.titlar.map(rensa).join(', ')}.`;
  return JSON.stringify(o);
}

/** Kommentaren till Axel i Notion, bara när eskaleringen säger till. Svenska, kort. Ren. */
export function eskaleringText(M, eskalering) {
  if (!eskalering?.tillAxel) return null;
  return [`Vecka ${String(M.vecka).split('-W')[1]}, bara du kan påverka det här:`, ...eskalering.orsaker.map(eskRad)].join('\n');
}
