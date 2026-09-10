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

// ---------------------------------------------------------------- talord
//
// Transkript stavar ut priset: "femhundre og syttini til firehundre og trettini
// kroner" (NO CS_1, 2026-09-10), "sexhundrafyrtionio kronor" (SE). En prisregel
// som bara läser siffror friar hela talet. Därför läses talorden på svenska
// och bokmål: <ental>hundra/hundre + valfritt (och|og) + tiotal+ental.
const ENTAL = { ett: 1, en: 1, två: 2, tva: 2, to: 2, tre: 3, fyra: 4, fire: 4, fem: 5, sex: 6, seks: 6, sju: 7, syv: 7, åtta: 8, atta: 8, åtte: 8, atte: 8, nio: 9, ni: 9 };
const TONTAL = { tio: 10, ti: 10, elva: 11, elleve: 11, tolv: 12, tretton: 13, tretten: 13, fjorton: 14, fjorten: 14, femton: 15, femten: 15, sexton: 16, seksten: 16, sjutton: 17, sytten: 17, arton: 18, atten: 18, nitton: 19, nitten: 19 };
const TIOTAL = { tjugo: 20, tjue: 20, trettio: 30, tretti: 30, fyrtio: 40, førti: 40, forti: 40, femtio: 50, femti: 50, sextio: 60, seksti: 60, sjuttio: 70, sytti: 70, åttio: 80, attio: 80, åtti: 80, atti: 80, nittio: 90, nitti: 90 };

/** "fyrtionio" → 49, "syttini" → 79, "nitton" → 19, "" → 0, okänt → null. */
export function tiotalOchEntal(ord) {
  const o = String(ord || '').toLowerCase().trim();
  if (!o) return 0;
  if (TONTAL[o] != null) return TONTAL[o];
  if (ENTAL[o] != null) return ENTAL[o];
  for (const [t, v] of Object.entries(TIOTAL).sort((a, b) => b[0].length - a[0].length)) {
    if (o === t) return v;
    if (o.startsWith(t)) { const rest = ENTAL[o.slice(t.length)]; if (rest != null) return v + rest; }
  }
  return null;
}

/** Alla utskrivna hundratal i en textrad: [{ ord, tal }]. "hundratals" o.d.
 *  som inte går att läsa som ett tal hoppas över. */
export function talord(text) {
  const ut = [];
  const re = /([a-zåäöø]*)hundr(?:a|e|ede)([a-zåäöø]*)(?:\s+(?:og|och)\s+([a-zåäöø]+))?/gi;
  for (const m of String(text || '').toLowerCase().matchAll(re)) {
    const h = m[1] ? ENTAL[m[1]] : 1;
    if (h == null) continue;
    const svans = m[2] || m[3] || '';
    const r = tiotalOchEntal(svans);
    if (r == null) continue;
    ut.push({ ord: m[0].trim(), tal: h * 100 + r });
  }
  return ut;
}

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
      // "30 dagars öppet köp" OCH "30 dagers åpent kjøp" — det norska "dagers"
      // täcktes inte av `dagar?s?` (mätt 2026-09-10: 16 norska annonser friade).
      // OCR tappar prickar och ringar ("apent kjop", "fornoyd") — de formerna räknas också.
      re: /(\d+)\s*dag(?:ar|er)?s?\s*([öo]ppet\s*k[öo]p|[åa]pent\s*kj[øo]p|n[öo]jd|forn[øo]yd|garanti|pengarna tillbaka|pengene tilbake)/i,
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
    {
      // Recensionsattribution: ett citat märkt "Verifierad kund" är ett löfte om
      // att butiken HAR den kunden. OPS-butikens recensioner är en känd lista
      // (`butik.recensioner`, importerade ur källan) — står citatet inte där är
      // det påhittat för den här butiken. AdventLane 2026-09-10: SP-annonserna
      // bar "Han sprang ut ur sängen varje morgon…" – Verifierad kund, 34 år;
      // ingen av butikens tio recensioner säger det. Utan recensionslista
      // görs ingen jämförelse.
      id: 'recension',
      // Även en stjärnrad (⭐⭐⭐⭐⭐ "…") är ett citat — attributionen står ofta
      // på raden under, och byts den ensam står det påhittade citatet kvar.
      re: /verifierad\s+kund|verifisert\s+kunde|verified\s+(?:customer|buyer)|bekräftad\s+köpare|^\s*[⭐★]{3,}/iu,
      fel: (m, rad) => {
        if (!Array.isArray(butik?.recensioner) || butik.recensioner.length === 0) return false;
        // Diakritiken viks bort: OCR läser "langtar" för "längtar".
        const norm = (s) => String(s).toLowerCase()
          .replace(/ø/g, 'o').replace(/æ/g, 'ae')
          .normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, ' ').trim();
        const r = norm(rad);
        return !butik.recensioner.some((t) => {
          const n = norm(t);
          // Räcker att en bit av recensionen (≥ 20 tecken) står i raden.
          for (let i = 0; i + 20 <= n.length; i += 10) if (r.includes(n.slice(i, i + 20))) return true;
          return false;
        });
      },
      text: (m) => `citat attribuerat "${m}" som inte finns bland butikens ${butik?.recensioner?.length ?? 0} recensioner — påhittad kund`,
    },
    {
      // Brådska och lagerpåståenden är KÄLLBUTIKENS kampanjvillkor ("bara idag",
      // "sista chansen", "begränsat lager – slut innan jul", "priset gäller inte
      // länge"). En OPS-butik lovar aldrig tidsbegränsning (Axels regel
      // 2026-09-08: aldrig egna köplöften; butiksfilens cta-stil: "Aldrig
      // SISTA CHANSEN"). AdventLane 2026-09-10: hela CS-konceptet bar det i
      // tal, inbränd text OCH copy utan att någon regel fångade det.
      id: 'brådska',
      re: /(bara\s+i\s*dag|endast\s+i\s*dag|kun\s+i\s*dag|sista\s+chansen|siste\s+sjanse|begr[äa]nsat\s+lager|begrenset\s+lager|lagret\s+(är|er)\s+begr[äa]nsat|lagret\s+(krymper|tar\s+slut)|slut\s+innan\s+jul|innan\s+(den|det)\s+(tar\s+slut|är\s+slut)|priset\s+g[äa]ller\s+inte\s+l[äa]nge|prisen\s+gjelder\s+ikke\s+lenge|f[øo]r\s+den\s+er\s+utsolgt)/i,
      fel: () => true,
      text: (m) => `lovar brådska/lager "${m}" — butiken lovar aldrig tidsbegränsning eller lagerbrist`,
      // ⚠️ ANMÄRKNING, inte fel. Axels regel 2026-09-10 (/ny-annonser): en
      // annons ändras bara om den säger Bäverbutiken, fel pris eller fel
      // villkor (fraktgräns, öppet köp, recensionsantal). Brådska står inte i
      // den listan — källkampanjen kör den, och den kopieras orörd. Fyndet
      // skrivs ut så ett öga ser det, men det får aldrig bli en dom som
      // tvingar fram omdubb eller ny copy.
      anmarkning: true,
    },
    {
      // Priset: varje "NNN kr" i materialet måste vara ett pris butiken faktiskt
      // tar. `butik.priser` är listan (pris, jämförpris, paketnivåer) som
      // detektorn läser ur produktfilen. Norska källannonser bär NOK-tal
      // (579 → 439) som inte finns i en butik som säljer i SEK — det är ett
      // "fel pris" i Axels mening, och ytan avgör kostnaden precis som för
      // brandnamnet. Utan prislista görs ingen jämförelse (fel: false).
      id: 'pris',
      // "över 300 kr" (fraktgräns), "spara 150 kr", "rabatt 150 kr" är belopp,
      // inte priser — de ska inte jämföras mot prislistan.
      // (Inget \b före ordet: JS-\b känner inte å/ä/ö, så "\böver" träffar aldrig.)
      re: /(?<!(?:över|over|spara|spar|sparer|rabatt|minus)\s{0,2})(\d{2,3}(?:[\s.]\d{3})?)\s*(?:kr|kronor|kroner|:-|,-)(?![\w])/gi,
      alla: true,
      // Ett tal under halva lägsta priset är ett BELOPP (spara 150 kr), inte ett
      // pris — även när ordet "spara" står i föregående caption-frame och OCR:en
      // bara ser "150 kronor på julens" (CS_3_H1, 2026-09-10). Ett fel pris
      // från en systerbutik ligger alltid nära det rätta (439 mot 499).
      fel: (m, n) => {
        if (!Array.isArray(butik?.priser) || butik.priser.length === 0) return false;
        const tal = Number(String(n).replace(/[\s.]/g, ''));
        return !butik.priser.includes(tal) && tal >= Math.min(...butik.priser) / 2;
      },
      text: (m, n) => `säger ${String(n).trim()} kr — butiken tar ${(butik?.priser || []).join(' / ')} kr`,
      taSiffra: true,
    },
    {
      // Samma prisregel för UTSKRIVNA tal i talet: "femhundre og syttini".
      id: 'pris',
      // Samma undantag som för siffror: "fri frakt över trehundra kronor" är en
      // fraktgräns (egen regel), "spara hundrafemtio" ett belopp.
      re: /(?<!(?:över|over|spara|spar|sparer|rabatt|minus)\s{0,2})\b[a-zåäöø]*hundr(?:a|e|ede)[a-zåäöø]*(?:\s+(?:og|och)\s+[a-zåäöø]+)?/gi,
      alla: true,
      fel: (m) => {
        if (!Array.isArray(butik?.priser) || butik.priser.length === 0) return false;
        const [t] = talord(m);
        if (!t) return false;
        return !butik.priser.includes(t.tal) && t.tal >= Math.min(...butik.priser) / 2;
      },
      text: (m) => `säger ${talord(m)[0]?.tal} kr ("${m.trim()}") — butiken tar ${(butik?.priser || []).join(' / ')} kr`,
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
        // `alla`: varje träff på raden prövas (två priser på samma rad: "649 kr → 499 kr").
        const träffar = r.alla ? [...rad.matchAll(re)] : [rad.match(re)].filter(Boolean);
        if (!träffar.length) continue;
        for (const m of träffar) {
          let trasig, beskrivning;
          if (r.taPar) { trasig = r.fel(m[0], m[1], m[2]); beskrivning = r.text(m[0], m[1], m[2]); }
          else if (r.taSiffra) { trasig = r.fel(m[0], m[1]); beskrivning = r.text(m[0], m[1]); }
          else { trasig = r.fel(m[0], rad); beskrivning = r.text(m[0], rad); }
          if (!trasig) continue;
          const post = { regel: r.id, yta: t.yta, rad: rad.slice(0, 120), fel: beskrivning };
          // Anmärkningar följer med i utfallet men bär flaggan — domen
          // (brand-detektor.klassa) ska aldrig räkna dem som fel.
          if (r.anmarkning) post.anmarkning = true;
          fynd.push(post);
        }
        break;
      }
    }
  }
  return fynd;
}

/** Bara de fynd som är FEL — anmärkningar (brådska) bortsorterade. */
export function baraFel(fynd) {
  return (fynd || []).filter((f) => !f.anmarkning);
}
