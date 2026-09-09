#!/usr/bin/env node
// villkorsskanning.mjs — sjätte ytan i /ny-annonser: KÄLLBUTIKENS VILLKOR.
//
// Bakgrunden (Axels bakläxa 2026-09-09, HeimGuard): brand-detektorn letade efter
// brandNAMNET och friade 38 av 40 svenska annonser. Fem av dem bar Bäverbutikens
// fraktgräns "fri frakt över 300 kr" — två i bilden, tre både inbränt OCH uttalat.
// CS_3 och CS_2 var två av tre bevisade vinnare. Felet upptäcktes först när
// annonserna redan låg uppe i HeimGuards konto.
//
// Villkoren är farligare än brandnamnet, för de LÅTER rätt. "30 dagars öppet köp"
// är sant hos båda butikerna; "fri frakt över 300 kr" är sant hos den ena och
// falskt hos den andra. Bara en jämförelse mot butikens EGNA villkor avgör.
//
//   import { skannaVillkor } from './villkorsskanning.mjs'
//   skannaVillkor(texter, butikskonfig)
//
// Läser bara. Kostar ingenting.

/** Regler som jämför en textrad mot butikens egna villkor.
 *  Varje regel: hittar den ett påstående, och stämmer påståendet? */
export function byggRegler(butik) {
  const friUtanGrans = butik?.frakt?.fri_globalt === true;
  const oppetKop = butik?.retur?.oppet_kop_dagar;
  const angerratt = butik?.retur?.angerratt_dagar;
  const leverans = butik?.frakt?.leveranstid || '';
  // "5–10 arbetsdagar" -> [5, 10]
  const lev = leverans.match(/(\d+)\s*[–-]\s*(\d+)/);
  const levMin = lev ? Number(lev[1]) : null;
  const levMax = lev ? Number(lev[2]) : null;

  return [
    {
      id: 'fraktgräns',
      // "fri frakt över 300 kr", "gratis frakt over 300 kr", "fri frakt över 300 kronor"
      re: /(fri|gratis)\s+frakt\s+(över|over)\s*(\d[\d\s]*)\s*(kr|kroner|kronor)/i,
      // Även den talade formen: "fri frakt över trehundra kronor"
      re2: /(fri|gratis)\s+frakt\s+(över|over)\s+(tre\s*hundra|trehundra)/i,
      fel: () => friUtanGrans,
      text: (m) => `lovar fraktgräns "${m}" — butiken har fri frakt UTAN gräns`,
    },
    {
      id: 'öppet köp',
      re: /(\d+)\s*dagar?s?\s*(öppet\s*köp|åpent\s*kjøp|nöjd|fornøyd|garanti|pengarna tillbaka)/i,
      fel: (m, n) => oppetKop != null && Number(n) !== Number(oppetKop),
      text: (m, n) => `säger ${n} dagar — butiken har ${oppetKop}`,
      taSiffra: true,
    },
    {
      id: 'ångerrätt',
      re: /(\d+)\s*dagars?\s*ånger/i,
      fel: (m, n) => angerratt != null && Number(n) !== Number(angerratt),
      text: (m, n) => `säger ${n} dagars ångerrätt — butiken har ${angerratt}`,
      taSiffra: true,
    },
    {
      id: 'leveranstid',
      re: /(\d+)\s*[–-]\s*(\d+)\s*(arbetsdagar|virkedager|arbeidsdager|vardagar)/i,
      fel: (m, a, b) => levMin != null && (Number(a) !== levMin || Number(b) !== levMax),
      text: (m, a, b) => `säger ${a}–${b} dagar — butiken har ${levMin}–${levMax}`,
      taPar: true,
    },
  ];
}

/** texter = [{ yta: 'copy'|'inbränd'|'tal', text: '...' }] */
export function skannaVillkor(texter, butik) {
  const regler = byggRegler(butik);
  const fynd = [];
  for (const t of texter) {
    const rad = String(t.text || '');
    for (const r of regler) {
      for (const re of [r.re, r.re2].filter(Boolean)) {
        const m = rad.match(re);
        if (!m) continue;
        let trasig, beskrivning;
        if (r.taPar) { trasig = r.fel(m[0], m[1], m[2]); beskrivning = r.text(m[0], m[1], m[2]); }
        else if (r.taSiffra) { trasig = r.fel(m[0], m[1]); beskrivning = r.text(m[0], m[1]); }
        else { trasig = r.fel(m[0]); beskrivning = r.text(m[0]); }
        if (trasig) fynd.push({ regel: r.id, yta: t.yta, rad: rad.slice(0, 120), fel: beskrivning });
        break;
      }
    }
  }
  return fynd;
}
