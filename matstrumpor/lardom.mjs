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

export const KOMPONENTER = ['avatar', 'vinkel', 'medvetandeniva', 'mekanism', 'tro', 'positionering', 'bradska'];
export const BRIEFTYPER = ['N', 'IM', 'I'];   // ny · imiterad · iteration
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

/** Taket (punkt 18): tre iterationer med skriven lärdom och ingen slår originalet
 *  ⇒ SLÄPP om forskningen bakom är svag, fler försök om den är stark. */
export const STARK_KALLA = ['voc', 'swipe', 'egen-data', 'playbook', 'winning-line', 'feedback'];

export function konceptStatus(koncept, briefrader, lardomar, { kalla = null } = {}) {
  const forsok = (briefrader ?? []).filter((b) => b.koncept === koncept);
  const medLardom = forsok.filter((b) => b.lardom);
  const slarOriginalet = lardomar?.some?.((l) => l.koncept === koncept && l.slar_originalet === true) ?? false;
  const stark = kalla ? STARK_KALLA.includes(String(kalla).toLowerCase()) : false;
  if (forsok.length < VIDAREBYGG_ITERATIONER) {
    return { koncept, iterationer: forsok.length, beslut: 'FORTSATT', motivering: `${forsok.length} av ${VIDAREBYGG_ITERATIONER} försök gjorda.` };
  }
  if (slarOriginalet) return { koncept, iterationer: forsok.length, beslut: 'FORTSATT', motivering: 'En iteration slår originalet.' };
  if (medLardom.length < VIDAREBYGG_ITERATIONER) {
    return { koncept, iterationer: forsok.length, beslut: 'SKRIV_LARDOM', motivering: `${forsok.length} försök men bara ${medLardom.length} lärdomar — taket går inte att döma förrän alla tre är skrivna.` };
  }
  return stark
    ? { koncept, iterationer: forsok.length, beslut: 'FORTSATT', motivering: `${forsok.length} försök utan vinnare, men källan (${kalla}) är stark — fler försök tillåtna, numret räknas.` }
    : { koncept, iterationer: forsok.length, beslut: 'SLAPP', motivering: `${forsok.length} försök med lärdom, ingen slår originalet och källan (${kalla ?? 'okänd'}) är svag.` };
}

/** Taggraden varje brief måste bära (punkt 13). Saknas ett fält skrivs ingen rad. */
export const TAGGAR = ['typ', 'koncept', 'parent', 'iteration', 'lardom', 'kalla', 'avatar', 'awareness', 'begar', 'mekanism', 'tro', 'urgency', 'hook_mekanik'];

export function granskaBrief(brief, { lardomar = [], briefrader = [] } = {}) {
  const fel = [];
  for (const t of TAGGAR) {
    if (t === 'parent' && brief.typ === 'N') continue;             // en ny vinkel har ingen förälder
    if (brief[t] === undefined || brief[t] === null || brief[t] === '') fel.push(`Taggen \`${t}\` saknas.`);
  }
  if (brief.typ && !BRIEFTYPER.includes(brief.typ)) fel.push(`typ="${brief.typ}" — tillåtna: ${BRIEFTYPER.join(', ')}.`);
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
