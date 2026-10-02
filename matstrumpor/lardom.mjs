// lardom.mjs — lärdomen, brieftaket och mixen för Matstrumpor.
//
// Axels definition av klart (docs/os/CS-KLART.md, 2026-09-21) i liten skala:
// ingen annons är klar förrän lärdomen är skriven, ingen brief skrivs utan att
// peka på en lärdom, och antalet briefer får aldrig överstiga antalet lärdomar
// vi hunnit skriva. Budgeten styr inte antalet.
//
// Skillnaden mot Bäverbutikens `agent/lardom.mjs`: den kör 21 briefer per rond
// över ~17 kampanjer. Här är det EN produkt, 6 briefer per rond (Axels beslut
// 2026-09-21), och loggen är en enda fil.
//
//   products/matstrumpor/lardomar.md   — lärdomarna i klartext (det man läser)
//   matstrumpor/logg.jsonl             — LARDOM- och BRIEF-rader (det koden räknar)
//
// Ren logik. Filerna läses och skrivs av kor.mjs.
//
// Sedan 2026-10-01 bär filen också Evolves iterationsplaybook i maskinläsbar
// form (FEL, ITERATIONER, PLAYBOOK_PER_UTFALL — källan och hela texten i
// docs/os/evolve/ITERATIONS-PLAYBOOK.md). En iteration (typ I) måste peka på
// en rad i den: vilken iteration ur playbooken, och mot vilket fel.

import { RANG, gallandeEtiketter } from './etikett.mjs';

/** Evolves nio komponenter (lektionen "Ad Learning & Iteration Process", steg 5).
 *  begar och valens tillkom 2026-10-01 — de sju första är de vi alltid haft. */
export const KOMPONENTER = ['avatar', 'vinkel', 'medvetandeniva', 'mekanism', 'tro', 'positionering', 'bradska', 'begar', 'valens'];
export const BRIEFTYPER = ['N', 'IM', 'I'];   // ny (IDEA) · imiterad (IMIT) · iteration (ITER)

/** Felkatalogen — varför en annons blev det den blev (playbooken avsnitt 4–6). */
export const FEL = Object.freeze({
  '1': 'Hook 1: hooken griper inte (bild och text samverkar inte, ingen nyfikenhet)',
  '2': 'TAM: vinkeln är för smal att skala',
  '2.5': 'Bred: för bred vinkel med för svag copy',
  '3': 'Valens och intensitet: säger rätt sak men känns fel',
  '4': 'Hook 2: bild och text säger inte Meta vilken publik',
  '5': 'Tomma påståenden: inga belägg i en sofistikerad marknad',
  '6': 'Bryggan: hook till hold hackar (åsikter i stället för fakta)',
  '7': 'Tro: tillit och auktoritet saknas',
  '8': 'Erbjudandet: pris mot värde stämmer inte',
  '9': 'Brådska: ingen anledning att köpa NU',
  '10': 'Insats: för lite står på spel',
  '11': 'Funnel: landningssidan säger inte samma sak som annonsen',
  '12': 'Vilseledande: engagemang av fel skäl',
  '13': 'Lätt att kopiera: dör när någon härmar den',
  '14': 'Produktdifferentiering saknas',
});

/** Iterationerna (playbooken avsnitt 7 och 8). */
export const ITERATIONER = Object.freeze({
  'manus-1': 'Komponenterna omskrivna (hook, brygga och hold var för sig)',
  'manus-2': 'Emotionell hook: annan valens eller intensitet',
  'manus-3': 'Bryggan omgjord: mer tro, högre insats, visuell copy',
  'manus-4': 'In media res: börja mitt i handlingen',
  'manus-5': 'Längre problemdel',
  'manus-6': 'Medvetandenivå upp eller ner',
  'manus-7': 'Invändningarna ur kommentarerna',
  'manus-8': 'Negativ inramning ("köp inte den här …")',
  'manus-9': 'Annan sub-avatar, samma berättelse',
  'format-1': 'Voiceover och text på skärm byter plats',
  'format-2': 'Riktiga UGC-kreatörer (2–3 st: kopia, iteration, imitation)',
  'format-3': 'Animerade ingredienser eller mekanism',
  'format-4': 'AI-animerade lösningar (de andra som skurkar)',
  'format-5': 'AI-animerade kroppsdelar',
  'format-6': 'AI-sång',
  'format-7': 'AI-berättelse utan människa',
  'format-8': 'AI-berättelse med människa',
  'format-9': 'AI-UGC som berättar ovanpå videon',
  'format-10': 'VSL-expansion',
  'format-11': 'Native eller kamouflage (statisk)',
  'format-12': 'Grundare eller auktoritet',
  'format-13': 'Gatuintervju',
  'format-14': 'Podcast',
  'format-15': 'Vinnarna ihopklippta (mega-ad)',
});

/** Per utfall: vilka fel som är vanligast, vilka iterationer som gäller, och
 *  hur många försök en idé får. Iterationen "fixar" alltid ett fel. */
export const PLAYBOOK_PER_UTFALL = Object.freeze({
  LOSER: { fel: ['1', '2', '2.5', '3', '4', '5', '6', '7', '8'], iterationer: ['manus-1', 'manus-2', 'manus-3'], forsok: 'Idé ur research: 2–3 försök till, bara med belägg för den nya versionen. Iteration: hitta felet i utförandet. Imitation som förlorat: itereras aldrig.' },
  KPI_WINNER: { fel: ['1', '2', '2.5', '3', '4', '5', '6', '7', '8'], iterationer: ['manus-1', 'manus-2', 'manus-3'], forsok: 'Samma som loser. Låg andel med några köp = en loser som hade tur. En erbjudandeannons (BOF) väntas inte skala.' },
  SPEND_WINNER: { fel: ['2.5', '7', '9', '10', '11', '12'], iterationer: ['manus-1', 'manus-3', 'manus-5', 'manus-6', 'manus-7', 'manus-2', 'format-2', 'format-12'], forsok: 'Idé ur research: 3–5 försök till (med en riktning). Imitation: 2–3 till. Fällan: hooken kan vara rotorsaken, testa inte bara nya holds.' },
  BREAKTHROUGH: { fel: ['2', '13', '14'], iterationer: ['manus-5', 'manus-6', 'manus-4', 'manus-1', 'manus-7', 'format-2', 'format-1', 'format-12', 'format-11'], forsok: 'Alltid, alla tre typerna. Stäng aldrig av den för att ROAS sjunker när den skalas. De två första iterationerna på varje vinnare: längre problemdel (manus-5) och en medvetandenivå upp eller ner (manus-6).' },
});
export const VIDAREBYGG_ITERATIONER = 3;
export const VIDAREBYGG_DAGAR = 14;

/** Skelettet till en lärdom — datan fylls i av avläsningen, texten av sessionen.
 *  Fält som saknas skrivs som "okänd", ALDRIG som 0. (En backfillad annons har
 *  ingen konverteringsgrad; 0 hade sett ut som en mätning.) */
export function skelett(etikettrad, kampanj, extra = {}) {
  const id = `L-${etikettrad.namn}`;
  return {
    id,
    annons: etikettrad.namn,
    datum: extra.datum ?? null,
    batch: extra.batch ?? 'okänd',
    utfall: etikettrad.etikett,
    bedombar: etikettrad.bedombar,
    spend_annons_sek: etikettrad.spend_sek ?? 'okänd',
    spend_kampanj_sek: kampanj?.spend_sek ?? 'okänd',
    andel_av_kampanjen: etikettrad.andel ?? 'okänd',
    roas: etikettrad.roas ?? 'okänd',
    cpa_sek: etikettrad.kop ? round2(etikettrad.spend_sek / etikettrad.kop) : 'okänd',
    konverteringsgrad: extra.konverteringsgrad ?? 'okänd',
    hookar: extra.hookar ?? [],                       // { text, hook_rate, hold_rate }
    komponenter: KOMPONENTER.map((k) => ({ komponent: k, planerat: extra[k]?.planerat ?? 'brief saknas', utfort: extra[k]?.utfort ?? 'okänd', stammer: extra[k]?.stammer ?? 'okänd' })),
    hypotes: '',
    nasta_annonser: [],
  };
}

/** Grinden innan en lärdom får skrivas. Samma tre krav som CS-KLART 1–4. */
export function validera(lardom) {
  const fel = [];
  if (!lardom.annons) fel.push('Lärdomen saknar annonsnamn.');
  if (!lardom.utfall) fel.push('Lärdomen saknar utfall (etiketten).');
  if (!Array.isArray(lardom.hookar) || lardom.hookar.length === 0) fel.push('Hookarna saknas — de ska stå ORDAGRANT, med hook rate och hold rate (CS-KLART punkt 1).');
  if (!lardom.hypotes || !lardom.hypotes.trim()) fel.push('Hypotesen saknas (punkt 3).');
  else {
    if (!/\(gissning\)/i.test(lardom.hypotes)) fel.push('Hypotesen måste vara märkt "(gissning)" — den är aldrig fakta (punkt 3).');
    if (/\b(bevisar|definitivt|säkert att)\b/i.test(lardom.hypotes)) fel.push('Hypotesen påstår sig bevisa något. Skriv om den som en gissning (punkt 3).');
  }
  if (!Array.isArray(lardom.nasta_annonser) || lardom.nasta_annonser.length === 0) {
    fel.push('Lärdomen slutar inte med konkreta nästa annonser — då är den en dagbok, inte ett system (punkt 4).');
  } else {
    for (const n of lardom.nasta_annonser) {
      if (typeof n === 'string' ? !n.trim() : !n?.namn) fel.push('En rad under "Nästa annonser" saknar annonsnamn.');
      if (typeof n === 'object' && n?.beslut === 'SLÄPP' && !n.skal) fel.push(`SLÄPP av ${n.namn} saknar skäl.`);
    }
  }
  const komponenter = lardom.komponenter ?? [];
  if (komponenter.length !== KOMPONENTER.length) fel.push(`Komponentavstämningen ska ha ${KOMPONENTER.length} rader (${KOMPONENTER.join(', ')}) — punkt 2.`);
  return { ok: fel.length === 0, fel };
}

/** Brieftaket (punkt 8): aldrig fler briefer än skrivna lärdomar sedan förra ronden.
 *  Budgeten ger bara golvet i konfigen; lärdomarna ger taket. */
export function brieftak({ lardomarSedanForraRonden, kadensAntal }) {
  const tak = Math.max(0, Number(lardomarSedanForraRonden) || 0);
  const antal = Math.min(kadensAntal, tak);
  return {
    antal,
    kadens_antal: kadensAntal,
    brieftak: tak,
    orsak: antal === 0
      ? `0 briefer: inga lärdomar skrivna sedan förra ronden. Skriv dem först i products/matstrumpor/lardomar.md (steg 3 i /matstrumporkungen), logga dem, kör om.`
      : antal < kadensAntal
        ? `${antal} briefer: kadensen säger ${kadensAntal} men bara ${tak} lärdomar är skrivna sedan förra ronden.`
        : `${antal} briefer: kadensen (${kadensAntal}) ryms under taket ${tak}.`,
  };
}

/** Mixen (punkt 7): finns en levande breakthrough är ronden 80 % vidarebyggen på
 *  den, annars 80 % nya vinklar. Udda annons går till majoriteten. */
export function mix(antal, harLevandeBreakthrough) {
  if (!antal) return { vidarebyggen: 0, nya_vinklar: 0, motivering: 'Ingen rond att fördela.' };
  if (harLevandeBreakthrough) {
    const v = Math.round(antal * 0.8);
    return { vidarebyggen: v, nya_vinklar: antal - v, motivering: `Levande breakthrough finns ⇒ 80 % vidarebyggen (${v} av ${antal}).` };
  }
  const n = Math.round(antal * 0.8);
  return { vidarebyggen: antal - n, nya_vinklar: n, motivering: `Ingen levande breakthrough ⇒ 80 % nya vinklar (${n} av ${antal}).` };
}

/** Iterationsnumret räknas ur loggen, aldrig ur minnet eller briefens egen siffra
 *  (punkt 14) — så vi alltid vet om vi gjort två eller trettio försök. */
export function nastaIteration(briefrader, koncept) {
  const n = (briefrader ?? []).filter((b) => b.koncept === koncept).length;
  return n + 1;
}

/** Taket (punkt 18): tre iterationer MED UTFALL och ingen slår originalet
 *  ⇒ SLÄPP om forskningen bakom är svag, fler försök om den är stark.
 *
 *  Rättat 2026-10-01: förut räknades briefer som pekade på en lärdom, inte
 *  iterationer som fått en etikett — konceptet "nathalie" stod på SLÄPP med 9
 *  briefer och 0 utfall. Nu räknas bara iterationer med en ETIKETT-rad i
 *  loggen, och "slår originalet" betyder att iterationens etikett är minst lika
 *  hög som förälderns (RANG i etikett.mjs).
 *
 *  briefrader: BRIEF-rader (annons, koncept, parent) · etikettrader: ETIKETT-rader ·
 *  omdopt: OMDOPT-rader (fran → till) så en omdöpt brief hittar sin annons. */
export const STARK_KALLA = ['voc', 'swipe', 'egen-data', 'playbook', 'winning-line', 'feedback', 'parent'];

export function konceptStatus(koncept, briefrader, etikettrader = [], { kalla = null, omdopt = [], foralderEtikett = null } = {}) {
  const forsok = (briefrader ?? []).filter((b) => b.koncept === koncept);
  const nyttNamn = new Map((omdopt ?? []).map((o) => [o.fran, o.till]));
  const galler = gallandeEtiketter(etikettrader);
  const utfall = forsok.map((b) => {
    const namn = nyttNamn.get(b.annons) ?? b.annons;
    return { annons: namn, etikett: galler.get(namn)?.etikett ?? null };
  });
  const medUtfall = utfall.filter((u) => u.etikett);
  const foralder = foralderEtikett ?? (forsok[0]?.parent ? galler.get(forsok[0].parent)?.etikett ?? null : null);
  const ribba = foralder && RANG[foralder] !== undefined ? RANG[foralder] : RANG.SPEND_WINNER;
  const vinnare = medUtfall.filter((u) => RANG[u.etikett] >= ribba);
  const stark = kalla ? STARK_KALLA.includes(String(kalla).toLowerCase()) : false;
  const bas = { koncept, iterationer: forsok.length, med_utfall: medUtfall.length, foralder: foralder ?? 'okänd', utfall };
  if (vinnare.length) return { ...bas, beslut: 'FORTSATT', motivering: `${vinnare.map((v) => `${v.annons} (${v.etikett})`).join(', ')} når förälderns nivå ${foralder ?? 'SPEND_WINNER'} — fortsätt iterera på den.` };
  if (medUtfall.length < VIDAREBYGG_ITERATIONER) {
    return { ...bas, beslut: forsok.length < VIDAREBYGG_ITERATIONER ? 'FORTSATT' : 'VANTA_UTFALL', motivering: `${forsok.length} försök briefade, ${medUtfall.length} med utfall — taket döms först när ${VIDAREBYGG_ITERATIONER} har en etikett.` };
  }
  return stark
    ? { ...bas, beslut: 'FORTSATT', motivering: `${medUtfall.length} försök med utfall utan att nå förälderns nivå, men källan (${kalla}) är stark — fler försök tillåtna, numret räknas.` }
    : { ...bas, beslut: 'SLAPP', motivering: `${medUtfall.length} försök med utfall, inget når förälderns nivå och källan (${kalla ?? 'okänd'}) är svag.` };
}

/** Taggraden varje brief måste bära (punkt 13). Saknas ett fält skrivs ingen rad.
 *  `playbook` (vilken iteration ur ITERATIONER) krävs på typ I sedan 2026-10-01. */
export const TAGGAR = ['typ', 'koncept', 'parent', 'iteration', 'lardom', 'kalla', 'avatar', 'awareness', 'begar', 'mekanism', 'tro', 'urgency', 'hook_mekanik'];

export function granskaBrief(brief, { lardomar = [], briefrader = [] } = {}) {
  const fel = [];
  for (const t of TAGGAR) {
    if (t === 'parent' && brief.typ === 'N') continue;             // en ny vinkel har ingen förälder
    if (brief[t] === undefined || brief[t] === null || brief[t] === '') fel.push(`Taggen \`${t}\` saknas.`);
  }
  if (brief.typ && !BRIEFTYPER.includes(brief.typ)) fel.push(`typ="${brief.typ}" — tillåtna: ${BRIEFTYPER.join(', ')}.`);
  if (brief.typ === 'I') {
    if (!brief.playbook) fel.push(`Taggen \`playbook\` saknas — en iteration ska säga vilken rad i playbooken den kör (${Object.keys(ITERATIONER).slice(0, 4).join(', ')} …, docs/os/evolve/ITERATIONS-PLAYBOOK.md).`);
    else if (!ITERATIONER[brief.playbook]) fel.push(`playbook="${brief.playbook}" finns inte i ITERATIONER (lardom.mjs).`);
    if (brief.fel !== undefined && brief.fel !== null && brief.fel !== '' && !String(brief.fel).split(/[,\s]+/).filter(Boolean).every((f) => FEL[f])) fel.push(`fel="${brief.fel}" — bara nummer ur felkatalogen (${Object.keys(FEL).join(', ')}).`);
  }
  if (brief.lardom && !lardomar.some((l) => l.id === brief.lardom)) {
    fel.push(`Lärdomen ${brief.lardom} finns inte i loggen — en brief som inte kan peka på en lärdom skrivs inte (punkt 6).`);
  }
  const raknat = nastaIteration(briefrader, brief.koncept);
  if (brief.iteration && Number(brief.iteration) !== raknat) {
    fel.push(`iteration=${brief.iteration} men loggen säger ${raknat}. Loggen vinner (punkt 14).`);
  }
  const varning = [];
  if (brief.typ === 'N' && briefrader.some((b) => b.avatar === brief.avatar && b.begar === brief.begar && b.mekanism === brief.mekanism)) {
    varning.push('typ=N med samma avatar, begär OCH mekanism som en tidigare brief — samma löfte med nya ord är en iteration, inte en ny vinkel (punkt 19).');
  }
  return { ok: fel.length === 0, fel, varning, iteration: raknat };
}

const round2 = (v) => Math.round(v * 100) / 100;
