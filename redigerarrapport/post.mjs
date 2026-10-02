// post.mjs — texten till EN redigerare för EN vecka. Ren logik, ingen I/O.
//
// Reglerna (docs/os/evolve/SVAR.md → "Vad vi tar med oss", redigerarrapport/PLAN.md):
//   • Engelska. Inga tankstreck. Inga butiksnamn.
//   • Aldrig kronor, ROAS, köp eller CPA — med köp och ROAS går spenden att räkna
//     ut baklänges. Det hon ser: etikett, andel av kampanjen i procent (Axels
//     beslut A 2026-10-02), hook % och hold %, "cut as briefed".
//   • Bästa annonsen först, sedan EN förlorare vi lär oss av, sedan resten som
//     en rad. Ingen jämförelse med andra redigerare.
//   • Förlusten är konceptets. Klippet pekas ut BARA vid mätt avvikelse från
//     regitabellen (utford_som_briefad === false).
//   • Hook/hold bara när annonsen är bedömbar (300 kr OCH 3 köp).
//   • ETT action item, ur action-items.json för hennes högsta etikett.
//   • Hypotesen märks "Our best guess, not a fact".
//
// Indata byggs av kor.mjs; formen står på byggPost().

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { RANG, formateraFrekvens } from '../matstrumpor/etikett.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
export const ACTION_FIL = join(HAR, 'action-items.json');

export const HOOK_LAG = 0.30; // Evolve: under ~30 % är lågt (ITERATIONS-PLAYBOOK §4)

/** Etikettraden, ordagrant ur PLAN.md avsnitt 4. `andel` skrivs bara när den finns. */
export const ETIKETTRAD = {
  BREAKTHROUGH: (r) => `Breakthrough: this ad took ${procent(r.andel)} of its campaign in week one and the campaign grew with it. We build three iterations on it within 14 days, and your cut is now the reference every other ad in the campaign is read against.`,
  SPEND_WINNER: () => 'Spend Winner: Meta found the audience and spent on it, but it did not turn that into enough purchases. That is about belief, urgency or the landing page, and it is ours to fix in the next brief, not yours in the edit.',
  KPI_WINNER: () => 'KPI Winner: it converts when it is shown, but Meta shows it little. That usually means the first 3 seconds, so we read hook rate first, then hold, before we decide what changes.',
  LOSER: () => 'Loser: this angle did not stop enough people.',
  INGEN_LEVERANS: () => 'No delivery: Meta never showed this one, so there is nothing in it to read and it does not count in your hit rate. The only thing worth a second look is the first frame, because that is what Meta judged.',
};

export const ETIKETTNAMN = {
  BREAKTHROUGH: 'Breakthrough', SPEND_WINNER: 'Spend Winner', KPI_WINNER: 'KPI Winner',
  LOSER: 'Loser', INGEN_LEVERANS: 'No delivery',
};

export function procent(v, dec = 0) {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return 'n/a';
  return `${(Number(v) * 100).toFixed(dec)} %`;
}

/** "Cut as briefed" ur regitabellen. null = inte mätt, aldrig gissat. */
export function klippRad(r) {
  if (r.utford_som_briefad === true) return 'Cut as briefed: yes. So this result is a learning about the concept, not about your cut.';
  if (r.utford_som_briefad === false) return 'Cut as briefed: no. The delivered video differs from the direction table, so this week\'s result tells us about the execution, not the concept. Next version: the exact lines from the brief, same timing.';
  return 'Cut as briefed: not measured yet.';
}

/** Hook/hold-raden — bara när annonsen är bedömbar. Referensen är kampanjens topp. */
export function mattRad(r) {
  if (!r.bedombar) return 'Hook and hold: too little data on this ad to read them fairly.';
  const egen = `Hook rate ${procent(r.hook_rate)}, hold ${procent(r.hold_rate)}.`;
  if (r.topp && r.topp.annons && r.topp.annons !== r.annons && Number.isFinite(Number(r.topp.hook_rate))) {
    return `${egen} The campaign's top ad sits at ${procent(r.topp.hook_rate)} / ${procent(r.topp.hold_rate)}.`;
  }
  return egen;
}

/** "Our best guess, not a fact" — kursens ordning: spend → KPI → mjuka mått.
 *  Klippet pekas ut bara vid mätt avvikelse. Returnerar null när inget går att säga. */
export function diagnos(r) {
  if (r.etikett === 'INGEN_LEVERANS') return null;
  if (r.utford_som_briefad === false) return null; // klippraden säger det redan
  if (!r.bedombar) return null;
  const hook = num(r.hook_rate), hold = num(r.hold_rate), toppHold = num(r.topp?.hold_rate);
  if (r.etikett === 'SPEND_WINNER') {
    return 'Our best guess, not a fact: people stopped and stayed, so the cut did its job. The ad did not turn that into enough purchases, which is about belief, urgency or the landing page, and that is ours to fix in the next brief.';
  }
  if (r.etikett === 'BREAKTHROUGH') return null;
  if (hook !== null && hook < HOOK_LAG) {
    return `Our best guess, not a fact: hook rate ${procent(hook)} is under the ${procent(HOOK_LAG)} line we use for every ad, so the first 3 seconds did not stop enough people. If you cut the first frame as the direction table says, the next brief changes the hook line; if the picture in second one shows something else than the line talks about, that is the place to look.`;
  }
  if (hook !== null && hold !== null && toppHold !== null && toppHold > 0 && hold < toppHold / 2) {
    return `Our best guess, not a fact: the hook worked, ${procent(hook)} stopped, but hold ${procent(hold)} is well under the campaign's top ad. Where the curve drops decides it: on a cut it is pacing and we fix it in the edit, on a claim it is the script and we fix it in the brief.`;
  }
  if (r.etikett === 'KPI_WINNER') {
    return 'Our best guess, not a fact: the hook and hold hold up, so this looks like an offer or audience question rather than a cut question. It may be a loser that got lucky, or an offer ad that was never going to scale. We read it again next week.';
  }
  return 'Our best guess, not a fact: people stopped and stayed but did not buy, which points at belief, urgency or the page, not at the cut.';
}

/** Nästa test ur playbooken per etikett (ITERATIONS-PLAYBOOK §4–7), en rad. */
export const NASTA_TEST = {
  BREAKTHROUGH: 'What we test next: a longer problem section and the same winner one awareness level up and down.',
  SPEND_WINNER: 'What we test next: belief, urgency or page congruence in the brief, before any new hook or format.',
  KPI_WINNER: 'What we test next: the next unused hook from the brief on the same body.',
  LOSER: 'What we test next: a new hook line, or a new first frame that shows the object the line talks about.',
};

/** Hela blocket för en annons. */
export function annonsBlock(r, { rubrik }) {
  const rader = [
    `${rubrik}: ${r.annons}. Label: ${ETIKETTNAMN[r.etikett] ?? r.etikett} (week ${r.vecka ?? 1}${r.uppgradering_fran ? `, up from ${ETIKETTNAMN[r.uppgradering_fran] ?? r.uppgradering_fran}` : ''}).`,
    ETIKETTRAD[r.etikett]?.(r) ?? '',
  ];
  if (r.etikett !== 'INGEN_LEVERANS') {
    if (Number.isFinite(num(r.andel))) rader.push(`Share of its campaign's budget in its first 7 days: ${procent(r.andel)}.`);
    rader.push(mattRad(r));
    rader.push(klippRad(r));
    const d = diagnos(r);
    if (d) rader.push(d);
    if (NASTA_TEST[r.etikett]) rader.push(NASTA_TEST[r.etikett]);
  }
  return rader.filter(Boolean).join('\n');
}

/** Action item-banken: första ogjorda för etiketten. `gjorda` = index redan givna. */
export function valjAction(etikett, gjorda = [], bank = lasBank()) {
  const lista = bank.per_utfall[etikett] ?? [];
  const idx = lista.findIndex((_, i) => !gjorda.includes(i));
  if (idx < 0) return lista.length ? { index: 0, ...lista[0] } : null;
  return { index: idx, ...lista[idx] };
}

export function lasBank(fil = ACTION_FIL) {
  return JSON.parse(readFileSync(fil, 'utf8'));
}

/** Högsta etiketten bland annonserna (RANG ur etikett.mjs). */
export function hogstaEtikett(annonser) {
  let b = null;
  for (const a of annonser) if (RANG[a.etikett] !== undefined && (b === null || RANG[a.etikett] > RANG[b])) b = a.etikett;
  return b;
}

const MANADER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function datumEn(iso) {
  const [, m, d] = String(iso).split('-').map(Number);
  return `${MANADER[m - 1]} ${d}`;
}

/**
 * Hela posten.
 *  redigerare:    { id, fornamn }
 *  vecka:         { iso: '2026-W40', fran: '2026-09-28', till: '2026-10-04' }
 *  annonser:      etiketterade rader med komplett vecka, HENNES: { annons, etikett, vecka,
 *                 uppgradering_fran, andel, hook_rate, hold_rate, bedombar, utford_som_briefad,
 *                 topp: { annons, hook_rate, hold_rate } }
 *  unga:          [{ annons, d0 }]  (startade, fönstret inte komplett)
 *  hitrate:       { traff, levererade, alla, iter }  (senaste fem veckorna)
 *  action:        { text_en } | null
 *  forraAction:   { text_en, gjord: true|false|null } | null
 */
export function byggPost({ redigerare, vecka, annonser = [], unga = [], hitrate = null, action = null, forraAction = null }) {
  const rader = [];
  rader.push(`Weekly ad report, week ${String(vecka.iso).split('-W')[1]} (${datumEn(vecka.fran)} to ${datumEn(vecka.till)}), for ${redigerare.fornamn}`);
  rader.push('');

  const med = annonser.filter((a) => a.etikett !== 'INGEN_LEVERANS');
  const utan = annonser.filter((a) => a.etikett === 'INGEN_LEVERANS');
  const sorterade = [...med].sort((a, b) => (num(b.andel) ?? -1) - (num(a.andel) ?? -1) || RANG[b.etikett] - RANG[a.etikett]);

  if (forraAction) {
    rader.push(forraAction.gjord === true
      ? `Last week's one thing: done. Thank you.`
      : forraAction.gjord === false
        ? `Last week's one thing is still open: ${forraAction.text_en}`
        : `Last week's one thing was: ${forraAction.text_en} Did it happen? Reply here.`);
    rader.push('');
  }

  if (!sorterade.length) {
    rader.push(unga.length
      ? `No finished labels this week. ${unga.length === 1 ? 'One ad' : `${unga.length} ads`} launched and get their label next Monday.`
      : 'No ads of yours finished their first 7 days this week.');
  } else {
    const basta = sorterade[0];
    rader.push(annonsBlock(basta, { rubrik: 'Best first' }));
    const forlorare = sorterade.find((a) => a !== basta && a.etikett === 'LOSER');
    if (forlorare) {
      rader.push('');
      rader.push(annonsBlock(forlorare, { rubrik: 'One loser we can learn from' }));
    }
    const rest = sorterade.filter((a) => a !== basta && a !== forlorare);
    if (rest.length) {
      rader.push('');
      rader.push(`Also labelled this week: ${rest.map((a) => `${a.annons} (${ETIKETTNAMN[a.etikett] ?? a.etikett}${a.uppgradering_fran ? `, up from ${ETIKETTNAMN[a.uppgradering_fran] ?? a.uppgradering_fran}` : ''})`).join('; ')}.`);
    }
  }

  if (unga.length && sorterade.length) {
    rader.push('');
    rader.push(`Not finished yet: ${unga.map((u) => `${u.annons} (launched ${veckodagEn(u.d0)})`).join(', ')}. Label next Monday.`);
  }
  if (utan.length) {
    rader.push('');
    rader.push(`No delivery: ${utan.map((u) => u.annons).join(', ')}. Meta never showed ${utan.length === 1 ? 'it' : 'them'}, so there is nothing in the numbers to read and ${utan.length === 1 ? 'it does' : 'they do'} not count in your hit rate.`);
  }

  if (hitrate) {
    rader.push('');
    const iter = hitrate.iter ? ` (${hitrate.iter} of them iterations of an existing winner)` : '';
    rader.push(`Your hit rate, last 5 weeks: ${formateraFrekvens(hitrate.traff, hitrate.levererade).replace('(för få för procent)', '').replace(' (inga etiketterade annonser än)', '').trim()} of your ads that got delivery${iter}. Benchmark across accounts: 5 to 10 %.`);
  }

  if (action) {
    rader.push('');
    rader.push(`One thing for this week: ${action.text_en} Reply here by Thursday.`);
  }

  rader.push('');
  rader.push('What would make the next cut easier: a clearer source list, or more hook options in the brief?');

  const text = rader.join('\n');
  kontrollera(text);
  return text;
}

const VECKODAGAR = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function veckodagEn(iso) {
  const t = Date.parse(`${String(iso).slice(0, 10)}T12:00:00Z`);
  return Number.isFinite(t) ? VECKODAGAR[new Date(t).getUTCDay()] : 'this week';
}

/** Spärren: inga kronor, ingen ROAS/CPA, inga tankstreck, inga butiksnamn. Kastar. */
export const FORBJUDET = [/\bSEK\b/, /\d\s?kr\b/i, /\bROAS\b/, /\bCPA\b/, /[—–]/, /b[äa]verbutiken/i, /matstrumpor/i, /carashell/i, /\.se\b/i, /\bköp\b/i];
export function kontrollera(text) {
  for (const re of FORBJUDET) {
    const m = text.match(re);
    if (m) throw new Error(`Posten bär förbjudet innehåll (${re}): "…${text.slice(Math.max(0, m.index - 30), m.index + 30)}…"`);
  }
  return true;
}

const num = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));
