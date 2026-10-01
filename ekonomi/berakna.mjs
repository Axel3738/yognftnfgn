// ekonomi/berakna.mjs — Evolve Finance modul 1–4 som rena funktioner. Inget nät.
//
//   Modul 1  Contribution margin = intäkt − rörliga kostnader (varor inkl. frakt
//            från leverantören, betalavgifter, tull, reklam). Första ordern och
//            återköpet har olika kostnader: reklamen (CAC) ligger bara på den första.
//   Modul 2  CAC = all reklam i perioden ÷ NYA kunder i Shopify samma period
//            (inte Metas köp, inte ordrar). LTV i kronor per kohort, inte i kunder.
//   Modul 3  Barometrarna: AOV, CAC, varukostnad i procent (tak 30 %), och vad
//            som händer om CAC +20 %, LTV −20 %, varukostnaden +5 procentenheter.
//   Modul 4  När pengarna går ut mot när de kommer in (räknas i rapporten, inte här).
//
// Allt i kronor. Butikens valuta räknas om med ECB-kursen innan det kommer hit.

export const manadUr = (iso) => iso.slice(0, 7);
const DAG = 86_400_000;

/**
 * Shopifys ordrar → en rad per order med det kontributionen behöver.
 * kostnadFor(variantId) → styckkostnad i butikens valuta eller null.
 */
export function orderrader(ordrar, { kostnadFor, kurs = 1, tullSek = 0, avgiftsandel = 0, kostnadPerLand = null }) {
  const ut = [];
  for (const o of ordrar) {
    if (o.cancelled_at || o.test) continue;
    const kund = o.customer?.id ?? null;
    const netto = (Number(o.current_total_price ?? 0) - Number(o.current_total_tax ?? 0)) * kurs;
    if (!(netto > 0)) continue; // helt återbetald eller gratisorder
    let cogs = 0;
    let saknas = false;
    const land = o.shipping_address?.country_code ?? null;
    for (const li of o.line_items ?? []) {
      const antal = Number(li.current_quantity ?? li.quantity ?? 0);
      if (!antal) continue;
      // Landad kostnad per leveransland (Matstrumpor: matstrumpor/cogs.json) vinner över Cost per item.
      const egen = kostnadPerLand && land ? kostnadPerLand(li, land, antal) : null;
      if (egen && Number.isFinite(egen.kostnadSek)) { cogs += egen.kostnadSek; continue; }
      if (egen?.saknas) { saknas = true; continue; }
      const k = kostnadFor(li.variant_id);
      if (k === null || k === undefined) { saknas = true; continue; }
      cogs += k * antal * kurs;
    }
    ut.push({ datum: o.created_at.slice(0, 10), kund, netto, cogs: saknas ? null : cogs, tull: tullSek, avgift: netto * avgiftsandel });
  }
  return ut.sort((a, b) => a.datum.localeCompare(b.datum));
}

/**
 * Märker varje kunds första order. En kund räknas som NY bara om ordern ligger
 * minst `minHistorikDagar` efter första dagen vi ser — annars kan kunden ha
 * köpt före fönstret och vi vet det inte.
 */
export function markeraNya(rader, { forstaDag, minHistorikDagar = 180 }) {
  const sedd = new Set();
  const grans = new Date(Date.parse(forstaDag) + minHistorikDagar * DAG).toISOString().slice(0, 10);
  for (const r of rader) {
    if (r.kund === null) { r.ny = null; continue; }
    const forsta = !sedd.has(r.kund);
    sedd.add(r.kund);
    r.forsta = forsta;
    r.ny = forsta && r.datum >= grans ? true : forsta ? null : false;
  }
  return { rader, bedombarFran: grans };
}

/** Varukostnaden i procent på de ordrar där VARJE rad har en kostnad. */
export function cogsAndel(rader) {
  let n = 0; let c = 0; let tackt = 0; let alla = 0;
  for (const r of rader) {
    alla += r.netto;
    if (r.cogs === null) continue;
    n += r.netto; c += r.cogs; tackt += r.netto;
  }
  return { andel: n > 0 ? c / n : null, tackning: alla > 0 ? tackt / alla : 0 };
}

/** Bidraget på en order FÖRE reklam. Saknad varukostnad fylls med butikens andel (märkt). */
export function bidragForeReklam(r, cogsProcent) {
  const cogs = r.cogs ?? (cogsProcent === null ? null : r.netto * cogsProcent);
  if (cogs === null) return null;
  return r.netto - cogs - r.avgift - r.tull;
}

/**
 * Talen för en period [fran, till] (ISO-datum, båda inklusive) och reklamen i den.
 */
export function periodtal(rader, { fran, till, spend }) {
  const i = rader.filter((r) => r.datum >= fran && r.datum <= till);
  const cogs = cogsAndel(i);
  const nya = i.filter((r) => r.ny === true);
  const ater = i.filter((r) => r.ny === false);
  const okanda = i.filter((r) => r.ny === null).length;
  const summa = (lista, f) => lista.reduce((s, r) => s + f(r), 0);
  const snitt = (lista, f) => (lista.length ? summa(lista, f) / lista.length : null);
  const netto = summa(i, (r) => r.netto);
  const ncac = nya.length && spend !== null ? spend / nya.length : null;
  // Utan en enda känd varukostnad finns inget bidrag att räkna — då null, aldrig en gissning.
  const snittBidrag = (lista) => {
    const v = lista.map((r) => bidragForeReklam(r, cogs.andel)).filter((x) => x !== null);
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null;
  };
  const bidragNy = snittBidrag(nya);
  const bidragAter = snittBidrag(ater);
  return {
    fran, till, ordrar: i.length, nya: nya.length, aterkop: ater.length, okanda,
    netto, spend, mer: spend !== null && spend > 0 ? netto / spend : null,
    aov: snitt(i, (r) => r.netto), aovNy: snitt(nya, (r) => r.netto), aovAter: snitt(ater, (r) => r.netto),
    cogsAndel: cogs.andel, kostnadsTackning: cogs.tackning,
    avgiftsAndel: netto > 0 ? summa(i, (r) => r.avgift) / netto : null,
    tullPerOrder: snitt(i, (r) => r.tull),
    ncac,
    // Modul 1: första ordern bär hela reklamen, återköpet ingen.
    bidragForstaOrder: bidragNy === null || ncac === null ? null : bidragNy - ncac,
    bidragForeReklamNy: bidragNy,
    bidragAterkop: bidragAter,
    // Modul 3: hur mycket en ny kund FÅR kosta för att första ordern ska gå jämnt ut.
    breakEvenCac: bidragNy,
    roasMotNya: ncac ? (snitt(nya, (r) => r.netto) ?? 0) / ncac : null,
  };
}

/**
 * Modul 2: kohorter per månad. För varje månads nya kunder: vad de har gett
 * per kund (intäkt och bidrag före reklam) månad 0, 1, 2 … och när bidraget
 * passerar månadens CAC. Bara hela månader räknas — en månad som pågår är
 * aldrig en punkt på kurvan.
 */
export function kohorter(rader, { spendPerManad, idag, cogsProcent }) {
  const kundKohort = new Map();
  for (const r of rader) if (r.ny === true) kundKohort.set(r.kund, manadUr(r.datum));
  const perKohort = new Map();
  for (const r of rader) {
    const k = kundKohort.get(r.kund);
    if (!k) continue;
    const offset = manadsavstand(k, manadUr(r.datum));
    if (offset < 0) continue;
    const p = perKohort.get(k) ?? { manad: k, kunder: new Set(), intakt: [], bidrag: [] };
    if (r.ny === true) p.kunder.add(r.kund);
    p.intakt[offset] = (p.intakt[offset] ?? 0) + r.netto;
    p.bidrag[offset] = (p.bidrag[offset] ?? 0) + (bidragForeReklam(r, cogsProcent) ?? 0);
    perKohort.set(k, p);
  }
  const pagaende = manadUr(idag);
  return [...perKohort.values()].sort((a, b) => a.manad.localeCompare(b.manad)).map((p) => {
    const n = p.kunder.size;
    const hela = Math.max(0, manadsavstand(p.manad, pagaende)); // antal avslutade månader efter kohortmånaden + 1
    const spend = spendPerManad[p.manad] ?? null;
    const cac = spend !== null && n ? spend / n : null;
    const kumIntakt = [];
    const kumBidrag = [];
    let si = 0; let sb = 0;
    for (let m = 0; m < hela; m++) {
      si += p.intakt[m] ?? 0; sb += p.bidrag[m] ?? 0;
      kumIntakt.push(n ? si / n : 0);
      kumBidrag.push(n ? sb / n : 0);
    }
    const payback = cac === null ? null : kumBidrag.findIndex((b) => b >= cac);
    return { manad: p.manad, kunder: n, spend, cac, kumIntakt, kumBidrag, paybackManad: payback === -1 ? null : payback, avslutadeManader: hela };
  });
}

export function manadsavstand(fran, till) {
  const [a1, m1] = fran.split('-').map(Number);
  const [a2, m2] = till.split('-').map(Number);
  return (a2 - a1) * 12 + (m2 - m1);
}

/**
 * Modul 3: stresstestet. bas = periodtal(). Ger bidraget per ny kund på första
 * ordern och efter `ltvExtra` (vad en kund i snitt ger i återköpsbidrag inom
 * 90 dagar) i fyra lägen.
 */
export function stresstest(bas, { ltvExtra = 0 } = {}) {
  if (bas.ncac === null || bas.bidragForeReklamNy === null || bas.aovNy === null) return null;
  const lage = (namn, { cac = 1, ltv = 1, cogsPp = 0 }) => {
    const forstaOrder = bas.bidragForeReklamNy - bas.aovNy * cogsPp - bas.ncac * cac;
    return { namn, forstaOrder, nittioDagar: forstaOrder + ltvExtra * ltv };
  };
  return [
    lage('Som nu', {}),
    lage('CAC +20 %', { cac: 1.2 }),
    lage('LTV −20 %', { ltv: 0.8 }),
    lage('Varukostnad +5 procentenheter', { cogsPp: 0.05 }),
  ];
}

/** Snittet av återköpsbidrag per ny kund inom 90 dagar, på kohorter som hunnit 90 dagar. */
export function aterkopsbidrag90(rader, { idag, cogsProcent }) {
  const forsta = new Map();
  for (const r of rader) if (r.ny === true) forsta.set(r.kund, r.datum);
  const grans = new Date(Date.parse(idag) - 90 * DAG).toISOString().slice(0, 10);
  const kunder = [...forsta].filter(([, d]) => d <= grans);
  if (!kunder.length) return { kunder: 0, perKund: null };
  const mal = new Map(kunder);
  let summa = 0;
  for (const r of rader) {
    const d = mal.get(r.kund);
    if (!d || r.ny === true) continue;
    if (Date.parse(r.datum) - Date.parse(d) <= 90 * DAG) summa += bidragForeReklam(r, cogsProcent) ?? 0;
  }
  return { kunder: kunder.length, perKund: summa / kunder.length };
}
