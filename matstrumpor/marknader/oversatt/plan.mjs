// plan.mjs — rena funktioner: rader i kön × skalande marknader → vad som ska översättas.
//
// Namnet i marknaden är SE-namnet med marknadskoden insatt, så SE-numret följer med och en
// annons går att spåra tillbaka till sin svenska vinnare:
//   MATSTRUMP_sushi_gift_ugc_052_v1  →  MATSTRUMP_DE_sushi_gift_ugc_052_v1
// (Marknadernas egna första annonser heter 001–008 och kommer ur andra källor — ingen krock,
// SE-numren i kön ligger över 008, och krockar kontrolleras ändå mot kontot.)

import { tolka } from '../../namn.mjs';

/** Ren: marknadens annonsnamn ur SE-namnet, eller null om SE-namnet inte följer mönstret. */
export function marknadsNamn(seNamn, kod) {
  if (!tolka(seNamn)) return null;
  return `MATSTRUMP_${kod}_${String(seNamn).trim().slice('MATSTRUMP_'.length)}`;
}

/** Ren: namnets bas utan hookvariant — `…_049h1_v1` och `…_049_v1` är samma koncept (redigerarens
 *  rad heter 049, uppladdaren döper hookarna 049h1/049h2 i kontot). Null om namnet inte följer mönstret. */
export function basNyckel(namn) {
  const t = tolka(namn);
  if (!t) return null;
  return `${t.vinkel}_${t.format}_${t.id.replace(/h\d+$/, '')}_v${t.version}`;
}

/** Ren: namnet ur ett marknadsnamn tillbaka till SE (för att koppla annons ↔ rad). */
export function seNamnUr(marknadsnamn, kod) {
  const pre = `MATSTRUMP_${kod}_`;
  return String(marknadsnamn).startsWith(pre) ? `MATSTRUMP_${String(marknadsnamn).slice(pre.length)}` : null;
}

/**
 * Ren: planen.
 * @param rader   kön ur Notion: [{ id, namn, leverans, url }]
 * @param mal     [{ kod }] — skalande marknader (granskare.malMarknader)
 * @param finns   { KOD: Set(annonsnamn i kampanjen) }
 * @param g       { aldrig_utomlands: ['katarina'], tak_per_korning }
 * → { klara: [rad + marknader], att_gora: [{ rad, kod, namn }], stoppade: [{ rad, skal }], over_taket }
 */
export function planera(rader, mal, finns, g) {
  const klara = [], stoppade = [], alla = [];
  const forbjudna = (g.aldrig_utomlands ?? []).map((s) => s.toLowerCase());
  for (const rad of rader) {
    if (!tolka(rad.namn)) { stoppade.push({ rad, skal: 'namnet följer inte MATSTRUMP_sushi_<vinkel>_<format>_<nnn>_v<n> — döp raden först (/matstrumpor steg 3)' }); continue; }
    const forbjuden = forbjudna.find((f) => `${rad.namn} ${rad.text ?? ''}`.toLowerCase().includes(f));
    if (forbjuden) { stoppade.push({ rad, skal: `${forbjuden} får aldrig lämna Sverige (Axel 2026-09-27)` }); continue; }
    if (rad.leverans === 'saknas') { stoppade.push({ rad, skal: 'ingen fil på raden (varken bilaga, mediablock eller Drive-länk)' }); continue; }
    if (!mal.length) continue;
    const bas = basNyckel(rad.namn);
    const harDen = (kod) => [...(finns[kod] ?? [])].some((n) => { const se = seNamnUr(n, kod); return se && basNyckel(se) === bas; });
    const saknas = mal.filter((m) => !harDen(m.kod));
    if (!saknas.length) klara.push({ ...rad, marknader: mal.map((m) => m.kod) });
    for (const m of saknas) alla.push({ rad, kod: m.kod, namn: marknadsNamn(rad.namn, m.kod) });
  }
  const tak = g.tak_per_korning ?? Infinity;
  return { klara, stoppade, att_gora: alla.slice(0, tak), over_taket: alla.slice(tak) };
}

/**
 * Ren: SE-vinnare bland raderna i "Approved + Launched in SE".
 * @param rader  [{ id, namn }]
 * @param insikt Map(annonsnamn → { spend, kop, roas }) — SE-kampanjens annonser; hookvarianter (049h1, 049h2)
 *               räknas ihop på radens bas (spendvägd ROAS ur Metas egna tal)
 * @param be     Sveriges break-even-ROAS
 * @param v      konfig.vinnare
 */
export function vinnare(rader, insikt, be, v) {
  const ut = [];
  for (const rad of rader) {
    if (!tolka(rad.namn)) continue;
    const bas = basNyckel(rad.namn);
    const trff = [...insikt].filter(([n]) => basNyckel(n) === bas);
    if (!trff.length) continue;
    const i = trff.reduce((a, [, x]) => ({ spend: a.spend + x.spend, kop: a.kop + x.kop, varde: a.varde + (x.roas ?? 0) * x.spend }), { spend: 0, kop: 0, varde: 0 });
    i.roas = i.spend ? i.varde / i.spend : null;
    const hookar = trff.map(([n, x]) => ({ namn: n, spend_sek: Math.round(x.spend), kop: x.kop, roas: x.roas })).sort((a, b) => b.spend_sek - a.spend_sek);
    if (i.spend < v.min_spend_sek || i.kop < v.min_kop || i.roas === null || i.roas < be) continue;
    ut.push({ ...rad, spend_sek: Math.round(i.spend), kop: i.kop, roas: i.roas, hookar });
  }
  return ut.sort((a, b) => b.spend_sek - a.spend_sek);
}
