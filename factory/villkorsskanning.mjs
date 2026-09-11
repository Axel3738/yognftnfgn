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

/** Siffra ur ett tal skrivet med bokstäver — eller ur en siffra, orörd.
 *  Transkripten stavar ut talen ("trettio dagars öppet köp"), copyn använder
 *  siffror ("30 dagars öppet köp"). Samma regel måste klara båda. */
export function talAvOrd(x) {
  // Svenska OCH norska former — transkripten är på båda språken.
  const ORD = { ti: 10, tio: 10, tolv: 12, fjorton: 14, fjorten: 14, femton: 15, nitton: 19,
    tjugo: 20, tjue: 20, trettio: 30, tretti: 30, sextio: 60, seksti: 60, nitti: 90 };
  const n = Number(x);
  return Number.isFinite(n) ? n : (ORD[String(x).toLowerCase()] ?? NaN);
}

// ⚠️ DIAKRITERNA ÖVERLEVER INTE OCR:EN. Mätt 2026-09-11 på Takoverdrag_SP_2_1:
// den lokala OCR:en läste bildens band ordagrant som
//     "30 dagars oppet kop - full aterbetalning"
// — utan ö och å. Regeln krävde "öppet köp" och matchade därför ingenting, så
// ett INBRÄNT villkorsfel gick igenom tyst medan samma fel i copyn (där texten
// är exakt) fångades. Eftersom inbränd text bara kan läsas via OCR betyder det
// att hela den ytan var blind för villkor. brandord.mjs har ett fuzzy-pass av
// precis det här skälet; de här reglerna hade inget. Därför står vokalerna som
// teckenklasser: [öo], [åa], [øo] — aldrig som ett enda tecken.

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
      re: /(\d+)\s*dag(?:ar|er|ars|ers|s)?\s*([öo]ppet\s*k[öo]p|[åa]pent\s*kj[øo]p|n[öo]jd|forn[øo]yd|garanti|pengarna tillbaka)/i,
      // ⚠️ TALET SKRIVS UT I BOKSTÄVER I TRANSKRIPTEN. Mätt 2026-09-11 på
      // takoverdrag_CS_1/2/3: HeyGens SRT säger "Trettio dagars öppet köp om du
      // ångrar dig" — sifferregeln ovan hittar ingenting, och tre videor med ett
      // uttalat villkorsfel friades. Ytan är den dyraste (tal ⇒ omdubb), så en
      // miss här kostar mest av alla.
      re2: /(tio|ti|tolv|fjorton|fjorten|femton|tjugo|tjue|trettio|tretti|sextio|seksti|nitti|nitton)\s*dag(?:ar|er|ars|ers|s)?\s*([öo]ppet\s*k[öo]p|[åa]pent\s*kj[øo]p|n[öo]jd|forn[øo]yd|garanti|pengarna tillbaka)/i,
      fel: (m, n) => oppetKop != null && talAvOrd(n) !== Number(oppetKop),
      text: (m, n) => `säger ${talAvOrd(n)} dagar — butiken har ${oppetKop}`,
      taSiffra: true,
    },
    {
      id: 'ångerrätt',
      re: /(\d+)\s*dag(?:ar|er|ars|ers|s)?\s*[åa]nger/i,
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
