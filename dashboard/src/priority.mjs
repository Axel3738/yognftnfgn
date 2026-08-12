// Vilken av de liggande sakerna ska knuffas FÖRST?
//
// Panelen har hela tiden kunnat svara "den äldsta". Det är fel svar. Av 62
// liggande saker är nästan alla översättningar, och en översättning av en
// annons som drar 3 000 kr om dagen är inte samma sak som en översättning av
// en annons som aldrig sålde något — även om den senare legat längre.
//
// Kopplingen finns redan: översättningen bär samma annonsnummer som
// originalet ("145 Translation to Norwegian" ← annons 145), och originalets
// spend och ROAS står i Meta. Alltså går det att räkna ut vad väntan kostar
// i stället för att bara mäta hur länge den pågått.
//
// Måttet är avsiktligt trubbigt: dagsspend på originalet gånger dess ROAS.
// Det är ingen prognos över vad översättningen skulle dra — det vet ingen —
// utan en rangordning: hur bra går det original som ligger och väntar på att
// få finnas på ett språk till.

import { adNumber, structuredKey, normalise } from './match.mjs';

const DAY = 86400000;

/** Summerar Meta-raderna per annonsidentitet (nummer eller strukturerad nyckel). */
function indexAds(metaRows, { now = Date.now(), windowDays = 14 } = {}) {
  const cutoff = new Date(now - windowDays * DAY).toISOString().slice(0, 10);
  const byKey = new Map();

  for (const r of metaRows) {
    const keys = [];
    const n = adNumber(r.adName);
    if (n != null) keys.push('n:' + n);
    const sk = structuredKey(r.adName);
    if (sk) keys.push('s:' + sk);
    if (!keys.length) keys.push('t:' + normalise(r.adName));

    for (const key of keys) {
      const a = byKey.get(key) || {
        key, spend: 0, revenue: 0, purchases: 0,
        recentSpend: 0, recentDays: new Set(),
        names: new Set(), lastDate: r.date,
      };
      a.spend += r.spend;
      a.revenue += r.revenue;
      a.purchases += r.purchases;
      if (r.date >= cutoff) { a.recentSpend += r.spend; a.recentDays.add(r.date); }
      a.names.add(r.adName);
      if (r.date > a.lastDate) a.lastDate = r.date;
      byKey.set(key, a);
    }
  }
  return byKey;
}

/** Nycklarna en task kan kännas igen på, i samma ordning som matchningen. */
function keysForTask(task) {
  const keys = [];
  const sk = structuredKey(task.title);
  if (sk) keys.push('s:' + sk);
  const n = adNumber(task.title);
  if (n != null) keys.push('n:' + n);
  return keys;
}

/**
 * Rangordnar liggande saker efter vad väntan kostar.
 *
 * @param flags     metrics.flags
 * @param tasks     alla tasks (för titel och spår)
 * @param metaRows  Meta-raderna
 * @returns flaggorna igen, sorterade, med .stake ifyllt där det går
 */
export function rankByStake({ flags, tasks, metaRows, now = Date.now(), windowDays = 14 }) {
  if (!metaRows?.length) return flags.map(f => ({ ...f, stake: null }));

  const ads = indexAds(metaRows, { now, windowDays });
  const taskById = new Map(tasks.map(t => [t.id, t]));

  const scored = flags.map(f => {
    const task = taskById.get(f.task) || { title: f.title };
    let best = null;
    for (const key of keysForTask(task)) {
      const a = ads.get(key);
      if (!a) continue;
      if (!best || a.recentSpend > best.recentSpend) best = a;
    }
    if (!best || best.recentSpend <= 0) return { ...f, stake: null };

    const days = Math.max(best.recentDays.size, 1);
    const perDay = best.recentSpend / days;
    const roas = best.spend > 0 ? best.revenue / best.spend : 0;

    return {
      ...f,
      stake: {
        // Originalet, alltså det som redan bevisat något.
        perDay: Math.round(perDay),
        roas: Math.round(roas * 100) / 100,
        totalSpend: Math.round(best.spend),
        purchases: best.purchases,
        example: [...best.names][0],
        lastDate: best.lastDate,
        // Rangordningen: pengar per dag viktat med hur bra det går. En
        // annons som drar mycket OCH säljer bra ska ligga överst.
        score: perDay * Math.max(roas, 0.1),
      },
    };
  });

  return scored.sort((a, b) => {
    const as = a.stake?.score ?? -1;
    const bs = b.stake?.score ?? -1;
    if (as !== bs) return bs - as;
    // Utan pengar bakom sig får åldern avgöra, som förut.
    return (b.minutes || 0) - (a.minutes || 0);
  });
}

/** En mening som förklarar varför just den här ligger överst. */
export function stakeText(stake) {
  if (!stake) return null;
  const kr = n => `${Math.round(n).toLocaleString('sv-SE')} kr`;
  return `originalet drar ${kr(stake.perDay)}/dag, ROAS ${stake.roas.toFixed(1).replace('.', ',')}`;
}
