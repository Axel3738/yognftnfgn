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
export function byggRegler(butik, { produkt = null } = {}) {
  const friUtanGrans = butik?.frakt?.fri_globalt === true;
  // Priset (TackleBay 2026-09-10): källvideor sa "149 kronor" — ett gammalt
  // pris hos källan. Varje kronbelopp som varken är butikens pris, jämförpris,
  // styckpris (pris/antal, "72,25 kr per hållare") eller en paketsumma
  // (n × pris) är ett fel. Rabatt i procent är ett fel när produkten saknar
  // jämförpris — då finns ingen rabatt att tala om.
  const pris = Number(produkt?.ekonomi?.pris) || null;
  const jamfor = Number(produkt?.ekonomi?.jamforpris) || null;
  const tillatna = new Set();
  if (pris) {
    for (const n of [1, 2, 3, 4, 5, 6]) tillatna.add(Math.round(pris * n));
    for (const d of [2, 3, 4, 5, 6]) {
      tillatna.add(Math.round((pris / d) * 100) / 100); // 72,25
      tillatna.add(Math.floor(pris / d));               // "72 kr" (OCR utan decimaler)
      tillatna.add(Math.round(pris / d));
    }
  }
  if (jamfor) tillatna.add(jamfor);
  const talAv = (t) => Number(String(t).replace(/\s/g, '').replace(',', '.'));
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
      // Även den talade formen: "fri frakt över trehundra kronor", och
      // Whisper-formen "Frifrakt om det handlar för över 300 kronor".
      re2: /(fri|gratis)\s*frakt[^.]{0,40}?(över|over)\s*(\d[\d\s]*\s*(kr|kronor)|tre\s*hundra|trehundra)/i,
      // Norsk form utan tal: "Fri frakt ved større bestillinger" (NO_SO_1_H2).
      re3: /(fri|gratis)\s*frakt\s+(ved|vid|på|pa)\s+st[øo]rre\s+(bestillinger|ordre|beställningar)/i,
      fel: () => friUtanGrans,
      text: (m) => `lovar fraktgräns "${m}" — butiken har fri frakt UTAN gräns`,
    },
    {
      id: 'öppet köp',
      // OCR tappar prickarna ("30 dagars nojd-kund-garanti") och ordet kan
      // stå ett par ord bort ("30 dagars nöjd-kund-garanti", "30 dagar köp ett köp").
      // Norska: "30 dagers åpent kjøp", "30 dagers fornøyd-kunde-garanti"
      // (TackleBay NO 2026-09-10 — `dagar?s?` missade "dagers").
      re: /(\d+)\s*dag(?:ar|er)?s?\s*(?:[a-zåäöø-]+[\s-]+){0,3}?(öppet\s*köp|[åa]pent\s*kj[øo]p|n[öo]jd|forn[øo]yd|garanti|pengarna tillbaka|pengene tilbake|köp\s*ett\s*köp|uppe\s*köp|upp\s*ett\s*köp|köper\s*köp|köp\b|kj[øo]p\b)/i,
      fel: (m, n) => oppetKop != null && Number(n) !== Number(oppetKop),
      text: (m, n) => `säger ${n} dagar — butiken har ${oppetKop}`,
      taSiffra: true,
    },
    {
      id: 'ångerrätt',
      re: /(\d+)\s*dag(?:ar|er)s?\s*(ånger|angrer)/i,
      fel: (m, n) => angerratt != null && Number(n) !== Number(angerratt),
      text: (m, n) => `säger ${n} dagars ångerrätt — butiken har ${angerratt}`,
      taSiffra: true,
    },
    {
      id: 'pris',
      // "149 kronor", "289 kr", "72,25 kr" — inte "över 300 kr" (fraktgränsen
      // har sin egen regel) och inte "300 kr" i "handla för 300 kr".
      // Talet får inte börja mitt i en siffra ("149" är inte "49"), och 300 är
      // fraktgränsens tal, aldrig ett pris — den har sin egen regel.
      re: /(?<![\d,.])(\d{2,4}(?:[,.]\d{2})?)\s*(kr|kronor|kroner)\b/i,
      fel: (m, n) => pris != null && talAv(n) !== 300 && !tillatna.has(talAv(n)),
      text: (m, n) => `säger ${n} kr — butikens pris är ${pris} kr${jamfor ? ` (jämförpris ${jamfor})` : ''}`,
      taSiffra: true,
    },
    {
      id: 'rabatt',
      // OCR delar ofta "40%" och "RABATT" i två texter (Fiskespöhållare_CS_2_1_NO
      // 2026-09-10) — ett ensamt procenttal på en bild är därför också ett fynd.
      re: /(\d{1,2})\s*%\s*(rabatt|billigare|avdrag|avslag)|rabatt[^.]{0,20}?(\d{1,2})\s*%|^\s*-?\d{1,2}\s*%\s*$/i,
      fel: () => pris != null && !jamfor,
      text: (m) => `lovar rabatt "${m}" — produkten har inget jämförpris, alltså ingen rabatt`,
    },
    {
      id: 'brådska',
      // Falsk knapphet/brådska: lagerslut, "bara idag", "sista chansen". En ny
      // OPS-butik säljer inte ut något lager och har ingen deadline.
      // Norska formerna (TackleBay NO 2026-09-10): "LAGERRENSING", "Vi rydder
      // lageret", "Begrenset antall på lager", "så lenge lageret rekker",
      // "før den er utsolgt", "Ikke vent".
      re: /(säljer ut lagret|lagret (rensas|krymper|är begränsat)|så långt lagret räcker|få kvar i lager|begränsat antal|bara i ?dag|idag endast|sista chansen|innan (det|den) är slut|när det är slut är det slut|lagerrensing|rydder lageret|begrenset antall|så lenge lageret rekker|før (den|det) er utsolgt|ikke vent|kun ?i ?dag|siste sjanse|f[åa] igjen p[åa] lager|f[øo]r det er tomt|bare i ?dag|lageret er begrenset|t[øo]mmes raskt|n[åa]r det er tomt|tilbudet forsvinner|siste sjanse|benytt sjansen|sikre deg din)/i,
      fel: () => true,
      text: (m) => `falsk brådska "${m}" — butiken säljer inte ut något lager`,
    },
    {
      id: 'rabatt-ord',
      // "kraftigt rabatterat pris", "rabatterat pris" utan procenttal.
      re: /rabatterat pris|till rabatterat|rea-?pris|nedsatt pris|nå kun \d|nedsatt til|tilbudspris|redusert pris|denne prisen/i,
      fel: () => pris != null && !jamfor,
      text: (m) => `lovar rabatt "${m}" — produkten har inget jämförpris, alltså ingen rabatt`,
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
export function skannaVillkor(texter, butik, alternativ = {}) {
  const regler = byggRegler(butik, alternativ);
  const fynd = [];
  for (const t of texter) {
    // Talord → siffror. HeyGen/Whisper och inbrända captions skriver ut talen
    // ("Tretti dagers åpent kjøp", "trettio dagars", "fjorton dagars") och en
    // regel som kräver \d+ missar dem alla (NO_CS_1_H1, 2026-09-10).
    const rad = String(t.text || '')
      .replace(/\btretti(o)?\b/gi, '30')
      .replace(/\bfjort(on|en)\b/gi, '14')
      .replace(/\btre ?hundr[ae]\b/gi, '300');
    for (const r of regler) {
      for (const re of [r.re, r.re2, r.re3].filter(Boolean)) {
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
