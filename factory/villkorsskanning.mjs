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

/** OCR och taligenkänning tappar å/ä/ö och skiljetecken. Mätt 2026-09-11 på
 *  CatCabin: OCR läste "30 dagars oppet kop - helt riskfri" UTAN ö, och regeln
 *  `öppet\s*köp` gick därför förbi ett äkta villkorsfel (källan 30 dagar,
 *  butiken 14). Ett fel som bara syns när tecknen är perfekta är ingen spärr.
 *  Därför normaliseras varje rad före matchning, och reglerna skrivs i
 *  normaliserad form (a/o, inga accenter). */
export const normalisera = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[øæ]/g, 'o')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ');

/** Talord → värde. Svenska och norska bokmål, normaliserad form (å/ä/ö → a/o).
 *
 *  ⚠️ Varför den finns: transkript skriver ofta ut talen som ORD. CatCabins
 *  CS-videor säger "Från ettusenfemtionio kronor ner till åttahundranio" —
 *  siffrorna 1059 och 809 finns ingenstans i texten, så prisregeln friade
 *  talet och domen blev "kräver-slutkortsbygge" i stället för "kräver-omdubb".
 *  Hade bara den inbrända texten rättats hade videon gått ut med fel pris
 *  uppläst. Norska voiceovers skriver nästan alltid så ("åttehundre og ni").
 *
 *  Sammansättningarna med elision ligger som egna tokens och är längre än sina
 *  delar, så den giriga matchningen nedan tar dem först: "ettusen" är ett ord,
 *  inte "ett" + "usen". */
const TALORD = {
  // multiplikatorer först i listan spelar ingen roll — matchningen är girig på längd
  ettusen: { mult: 1000, ett: true }, etttusen: { mult: 1000, ett: true },
  tusen: { mult: 1000 }, hundra: { mult: 100 }, hundre: { mult: 100 },
  // ental
  noll: 0, null: 0, en: 1, ett: 1, tva: 2, to: 2, tre: 3, fyra: 4, fire: 4,
  fem: 5, sex: 6, seks: 6, sju: 7, syv: 7, atta: 8, atte: 8, nio: 9, ni: 9,
  // 10–19
  tio: 10, ti: 10, elva: 11, elleve: 11, tolv: 12, tretton: 13, tretten: 13,
  fjorton: 14, fjorten: 14, femton: 15, femten: 15, sexton: 16, seksten: 16,
  sjutton: 17, sytten: 17, arton: 18, atten: 18, nitton: 19, nitten: 19,
  // tiotal
  tjugo: 20, tjue: 20, trettio: 30, tretti: 30, fyrtio: 40, forti: 40,
  femtio: 50, femti: 50, sextio: 60, seksti: 60, sjuttio: 70, sytti: 70,
  attio: 80, atti: 80, nittio: 90, nitti: 90,
};
const TALTOKENS = Object.keys(TALORD).sort((a, b) => b.length - a.length);

/** Läser ett sammanskrivet eller isärskrivet talord till ett värde.
 *  "ettusenfemtionio" → 1059 · "attahundranio" → 809 · "atte hundre og ni" → 809
 *  Returnerar null om strängen inte är ett rent talord. */
export function talordTillTal(s) {
  // ⚠️ Ordningen är inte valfri: bindeorden måste bort MEDAN ordgränserna
  // finns kvar. Strippas mellanslagen först blir "ettusen og femti ni" till
  // "ettusenogfemtini", \bog\b matchar aldrig, och parsern faller på "og" —
  // svaret blev 59 i stället för 1059 (mätt 2026-09-12).
  let rest = normalisera(s).replace(/\b(og|och)\b/g, '').replace(/[\s-]/g, '');
  if (!rest) return null;
  let summa = 0, aktuell = 0, sågNåt = false;
  while (rest.length) {
    const token = TALTOKENS.find((t) => rest.startsWith(t));
    if (!token) return null; // något som inte är ett talord → inte ett tal
    const v = TALORD[token];
    sågNåt = true;
    if (typeof v === 'number') aktuell += v;
    else if (v.mult === 100) aktuell = (aktuell || 1) * 100;
    else { summa += (v.ett ? 1 : aktuell || 1) * 1000; aktuell = 0; }
    rest = rest.slice(token.length);
  }
  return sågNåt ? summa + aktuell : null;
}

/** Belopp skrivna som TALORD följt av valutaord: "ettusenfemtionio kronor".
 *  Samma snäva krav som siffervägen — utan valutaord plockas ingenting. */
export function taladeBeloppIRad(rad) {
  const norm = normalisera(rad);
  const ut = [];
  // Fångar en sammanhängande svans av talord (med ev. mellanslag/och/og) före
  // valutaordet. Ordgränsen framåt hindrar att halva meningen dras med.
  const re = /([a-z]+(?:[\s-]*(?:och|og)?[\s-]*[a-z]+){0,5}?)\s*(kronor|kroner|kr|nok|sek)\b/gi;
  let m;
  const läs = (fras) => {
    // Prova hela frasen, sedan allt kortare svansar — "priset pa vart isolerade
    // utekattehus fran ettusenfemtionio" ska ge 1059, inte null. Längsta
    // matchande svans vinner, annars blir "femti ni" till 59 i stället för 1059.
    const ord = String(fras).trim().split(/\s+/).filter(Boolean);
    for (let i = 0; i < ord.length; i++) {
      const tal = talordTillTal(ord.slice(i).join(' '));
      if (tal !== null && tal > 0) return tal;
    }
    return null;
  };
  while ((m = re.exec(norm)) !== null) {
    const tal = läs(m[1]);
    if (tal !== null) ut.push(tal);
  }
  // Det andra talet i en prisreplik bär sällan valutaordet: "fran
  // ettusenfemtionio kronor ner till attahundranio". Utan den här raden fångas
  // jämförpriset men inte priset — alltså just det tal kunden lovas. Samma
  // regel som för siffror, och bara i rader som redan bevisat handla om pengar.
  if (ut.length) {
    const svans = /(?:ner|ned)\s+(?:till|til)\s+([a-z\s]+?)(?:[.,!?]|$)/gi;
    let s;
    while ((s = svans.exec(norm)) !== null) {
      const tal = läs(s[1]);
      if (tal !== null && tal >= 10 && !ut.includes(tal)) ut.push(tal);
    }
  }
  return ut;
}

/** Belopp med valutaord ur en rad: "1 059 kronor" → 1059. Tal UTAN valutaord
 *  plockas aldrig — annars blir "1000 liter" i TankGuards annonser ett prisfel. */
export function beloppIRad(rad) {
  const norm = normalisera(rad);
  const städa = (s) => Number(String(s).replace(/[\s.,]/g, ''));
  const ut = [...taladeBeloppIRad(rad)];
  const medValuta = /(\d[\d\s.,]*)\s*(kr|kronor|kroner|nok|sek)\b/gi;
  let m;
  while ((m = medValuta.exec(norm)) !== null) {
    // "1.059" och "1 059" är tusentalsavgränsare, "1,5" är decimal — men
    // annonspriser är hela kronor, så allt utom siffrorna städas bort.
    const tal = städa(m[1]);
    if (Number.isFinite(tal) && tal > 0) ut.push(tal);
  }
  // ⚠️ Det andra talet i en prisreplik bär sällan valutaordet: "från 1059
  // kronor ner till 809". Utan den här raden fångas jämförpriset men inte
  // priset — alltså exakt det tal kunden faktiskt lovas (CatCabin 2026-09-11).
  // Nakna tal plockas BARA ur rader som redan bevisat handla om pengar, och
  // bara i prisintervall, så produktspecar ("1000 liter", "4-pack") står kvar.
  if (ut.length) {
    const naket = /(?:ner\s+till|ned\s+till|till|for|istallet\s+for|i\s*stallet\s+for|bara|kun|endast|nu)\s+(\d[\d\s.,]*)\b(?!\s*(?:kr|kronor|kroner|nok|sek|liter|cm|mm|m|kg|g|pack|st|dagar|ar|%))/gi;
    while ((m = naket.exec(norm)) !== null) {
      const tal = städa(m[1]);
      if (Number.isFinite(tal) && tal >= 10 && tal <= 100000 && !ut.includes(tal)) ut.push(tal);
    }
  }
  return ut;
}

/** Regler som jämför en textrad mot butikens egna villkor.
 *  Varje regel: hittar den ett påstående, och stämmer påståendet?
 *  `produkt` bär ekonomin (pris, jämförpris) — utan den körs ingen prisregel. */
export function byggRegler(butik, produkt) {
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
      // Normaliserad form: öppet köp → oppet kop, åpent kjøp → apent kjop.
      re: /(\d+)\s*dagar?s?\s*(oppet\s*kop|apent\s*kjop|nojd|fornoyd|garanti|pengarna tillbaka)/i,
      fel: (m, n) => oppetKop != null && Number(n) !== Number(oppetKop),
      text: (m, n) => `säger ${n} dagar — butiken har ${oppetKop}`,
      taSiffra: true,
    },
    {
      id: 'ångerrätt',
      re: /(\d+)\s*dagars?\s*anger/i,
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

/** PRISET — sjätte ytans dyraste fynd, och det som saknades längst.
 *
 *  Bakgrund (CatCabin 2026-09-11): alla 16 källannonser fick domen `ren`, och
 *  tre av dem LÄSER UPP "från 1059 kronor ner till 809" medan butiken säljer
 *  för 789 (jämförpris 1039). Villkorsskanningen hade ingen prisregel alls —
 *  den listade "rabatt: 24%" i rapporten men jämförde aldrig ett belopp mot
 *  butikens egna. Ett fel pris i en annons är både ett brutet löfte mot kunden
 *  och ett brott mot husregeln att priset hämtas från produktsidan varje gång.
 *
 *  Regeln är medvetet snäv: bara belopp med valutaord, och bara belopp som
 *  varken är priset eller jämförpriset. Paketpriser skickas in via
 *  `tillatnaBelopp` så 2- och 3-pack inte larmar.
 *
 *  ⚠️ Den ser bara SIFFROR. "atte hundre og ni kroner" (talad form, vanlig i
 *  norska voiceovers) går förbi — den ytan kräver fortfarande ett öra. */
export function prisfynd(texter, produkt, tillatnaBelopp = []) {
  const pris = Number(produkt?.ekonomi?.pris);
  const jamfor = Number(produkt?.ekonomi?.jamforpris);
  if (!Number.isFinite(pris) || pris <= 0) return [];
  const ok = new Set([pris, ...(Number.isFinite(jamfor) ? [jamfor] : []), ...tillatnaBelopp.map(Number)]);
  const fynd = [];
  for (const t of texter) {
    for (const belopp of beloppIRad(t.text)) {
      if (ok.has(belopp)) continue;
      fynd.push({
        regel: 'pris',
        yta: t.yta,
        rad: String(t.text).slice(0, 120),
        fel: `säger ${belopp} kr — butiken säljer för ${pris} kr${Number.isFinite(jamfor) ? ` (jämförpris ${jamfor} kr)` : ''}`,
      });
    }
  }
  return fynd;
}

/** Tidsbegränsade erbjudanden som butiken inte har.
 *
 *  "Bara idag", "sista chansen", "lagret krymper" är påståenden om en KAMPANJ,
 *  inte om produkten. De följer med creativen till den nya butiken där ingen
 *  sådan kampanj finns — och då är hela repliken falsk, inte bara ett tal.
 *  Källa: CatCabins CS_1/2/3 2026-09-11.
 *
 *  Har butiken faktiskt ett tidsbegränsat erbjudande sätts
 *  `butik.erbjudande.tidsbegransat: true` och regeln tiger. */
export function erbjudandefynd(texter, butik) {
  if (butik?.erbjudande?.tidsbegransat === true) return [];
  const re = /(bara|kun|endast)\s+i\s*dag|sista\s+chansen|siste\s+sjanse|nastan\s+slutsald|tilbudet\s+gjelder|erbjudandet\s+galler|lager(et)?\s+krymper|lageret\s+minker/i;
  const fynd = [];
  for (const t of texter) {
    const m = normalisera(t.text).match(re);
    if (!m) continue;
    fynd.push({
      regel: 'tidsbegränsat erbjudande',
      yta: t.yta,
      rad: String(t.text).slice(0, 120),
      fel: `lovar "${m[0]}" — butiken har ingen tidsbegränsad kampanj (sätt butik.erbjudande.tidsbegransat om den får en)`,
    });
  }
  return fynd;
}

/** texter = [{ yta: 'copy'|'inbränd'|'tal', text: '...' }]
 *  `produkt` är valfri men utan den körs ingen prisjämförelse — och priset är
 *  det fel som kostar mest när det slinker igenom. */
export function skannaVillkor(texter, butik, produkt, tillatnaBelopp = []) {
  const regler = byggRegler(butik, produkt);
  const fynd = [...prisfynd(texter, produkt, tillatnaBelopp), ...erbjudandefynd(texter, butik)];
  for (const t of texter) {
    const rad = normalisera(t.text || '');
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
  // OCR läser samma textrad i varje frame där den syns, så ett enda inbränt
  // prispåstående kom tillbaka sju gånger och gjorde "Måste åtgärdas" oläslig.
  // Samma regel + samma yta + samma fel är ETT fel att rätta, inte sju.
  const sett = new Set();
  return fynd.filter((f) => {
    const nyckel = `${f.regel}|${f.yta}|${f.fel}`;
    if (sett.has(nyckel)) return false;
    sett.add(nyckel);
    return true;
  });
}
