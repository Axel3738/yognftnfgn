// lager/berakna.mjs — räknemotorn för lagerplanen. Rena funktioner, inget nät.
//
// Metoden är Kanarys (Evolve Supply Chain Program, modul 0 och "Last Minute CNY
// Prep"): titta på lagret i dag, det som är på väg och försäljningstakten, räkna
// "days of supply" och lägg beställningen så att varan aldrig tar slut.
//
//   takt            = utleveranser per dag MEDAN varan fanns i lager
//   dagar kvar      = lager ÷ takt
//   beställ senast  = dagen varan tar slut − ledtid − säkerhetsdagar
//   beställ antal   = takt × (ledtid + säkerhet + cykel) − lager, uppåt till MOQ
//
// Takten räknas bara på dagar då varan fanns. En vara som stått slut i en vecka
// har inte "sålt noll" den veckan — den har inte kunnat sälja. Att räkna med de
// dagarna hade gett en för låg takt och nästa slutförsäljning.

const DAG = 86_400_000;

export const iso = (d) => new Date(d).toISOString().slice(0, 10);
export const dagarMellan = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / DAG);
export const plusDagar = (d, n) => iso(Date.parse(d) + n * DAG);

/**
 * Fliknamnet → datum. CWD skriver "9.30updated", "8.1 updated", "7.31upadte".
 * Året saknas: det är innevarande år, utom när datumet då hamnar mer än en
 * vecka i framtiden (en decemberflik läst i januari hör till förra året).
 */
export function datumUrFlik(namn, idag) {
  const m = /^\s*(\d{1,2})[./-](\d{1,2})/.exec(String(namn));
  if (!m) return null;
  const man = Number(m[1]);
  const dag = Number(m[2]);
  if (man < 1 || man > 12 || dag < 1 || dag > 31) return null;
  let ar = Number(idag.slice(0, 4));
  let d = `${ar}-${String(man).padStart(2, '0')}-${String(dag).padStart(2, '0')}`;
  if (dagarMellan(idag, d) > 7) { ar -= 1; d = `${ar}-${d.slice(5)}`; }
  return d;
}

const ren = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

/** Rubrikraden → kolumnindex. Namnen är CWD:s; saknas SKU eller QTY är det inte ett lagerark. */
export function kolumner(rubrik) {
  const hitta = (...namn) => rubrik.findIndex((c) => namn.includes(ren(c).toLowerCase()));
  const k = {
    sku: hitta('sku'),
    namn: hitta('product name', 'name', 'produkt'),
    spec: hitta('specification', 'variant', 'spec'),
    antal: hitta('qty', 'quantity', 'stock', 'antal'),
    ut: hitta('outbound status', 'outbound'),
  };
  return k.sku >= 0 && k.antal >= 0 ? k : null;
}

/**
 * Alla dagsflikar → en serie per artikel. Nyckeln är SKU:n — CWD byter namn på
 * raderna över tid (KF-081-W5891-BC01 hette "20595#WA1771817980" i juli och
 * "sticker" i september). Men en SKU kan också stå två gånger i SAMMA flik med
 * olika namn (RY27 bar två förkläden): bara då blir nyckeln SKU + namn.
 * Flikar som inte går att datera eller läsa listas i `hoppade`.
 */
export function tolkaFlikar(flikar, { idag }) {
  const hoppade = [];
  const perDatum = new Map();
  for (const f of flikar) {
    const datum = datumUrFlik(f.namn, idag);
    const k = f.rader?.[0] ? kolumner(f.rader[0]) : null;
    if (!datum || !k) { hoppade.push(f.namn); continue; }
    perDatum.set(datum, { flik: f.namn, rader: f.rader.slice(1), k }); // samma datum två gånger: sista fliken vinner
  }
  const dagar = [...perDatum.keys()].sort();
  const dubbla = new Set();
  for (const { rader, k } of perDatum.values()) {
    const sedda = new Set();
    for (const r of rader) {
      const sku = ren(r[k.sku]);
      if (!sku) continue;
      if (sedda.has(sku)) dubbla.add(sku);
      sedda.add(sku);
    }
  }
  const artiklar = new Map();
  for (const datum of dagar) {
    const { rader, k } = perDatum.get(datum);
    for (const r of rader) {
      const sku = ren(r[k.sku]);
      if (!sku || /^sku$/i.test(sku)) continue;
      const namn = ren(r[k.namn]);
      const spec = k.spec >= 0 ? ren(r[k.spec]) : '';
      const nyckel = dubbla.has(sku) ? `${sku}|${namn.toLowerCase().slice(0, 24)}` : sku;
      const raa = r[k.antal];
      const antal = raa === null || raa === '' || raa === undefined ? null : Number(raa);
      const a = artiklar.get(nyckel) ?? { nyckel, sku, namn, spec: spec === 'sku' ? '' : spec, serie: {}, anteckningar: [] };
      // Visningsnamnet: senaste riktiga namnet, aldrig CWD:s interna kod (20595#…).
      if (namn && !/^\d+#/.test(namn)) a.namn = namn;
      else if (!a.namn) a.namn = namn;
      if (spec && spec !== 'sku') a.spec = spec;
      a.serie[datum] = Number.isFinite(antal) ? antal : null;
      const extra = r.slice(Math.max(k.antal, k.ut) + 1).filter((x) => x !== null && x !== '' && typeof x === 'string').map(ren);
      if (extra.length) a.anteckningar = extra;
      artiklar.set(nyckel, a);
    }
  }
  return { dagar, artiklar: [...artiklar.values()], hoppade };
}

/**
 * En artikels rörelser mellan två dagsavläsningar i följd.
 * Ökning = påfyllning (in). Minskning = utleverans (ut).
 * Dagar "i lager" = dagar då intervallet började med lager > 0.
 */
export function rorelser(serie) {
  const punkter = Object.keys(serie).filter((d) => serie[d] !== null).sort();
  const intervall = [];
  for (let i = 1; i < punkter.length; i++) {
    const fran = punkter[i - 1];
    const till = punkter[i];
    const a = serie[fran];
    const b = serie[till];
    const dagar = Math.max(1, dagarMellan(fran, till));
    intervall.push({ fran, till, dagar, ut: Math.max(0, a - b), in: Math.max(0, b - a), iLager: a > 0 || b > 0 ? dagar : 0 });
  }
  return intervall;
}

/** Utleveranser per dag i lager, i fönstret (idag − N, idag]. null under 5 lagerdagar. */
export function takt(intervall, idag, fonsterDagar) {
  const start = plusDagar(idag, -fonsterDagar);
  let ut = 0;
  let dagar = 0;
  for (const iv of intervall) {
    if (iv.till <= start) continue;
    ut += iv.ut;
    dagar += iv.iLager;
  }
  return dagar >= 5 ? ut / dagar : null;
}

export function saltI(intervall, idag, fonsterDagar) {
  const start = plusDagar(idag, -fonsterDagar);
  return intervall.filter((iv) => iv.till > start).reduce((s, iv) => s + iv.ut, 0);
}

/**
 * CWD:s anteckning "order 1000 8.13" → { antal: 1000, datum }. Påfyllningen
 * efter det datumet ger den uppmätta ledtiden.
 */
export function bestallningUrAnteckning(anteckningar, idag) {
  for (const t of anteckningar ?? []) {
    const m = /order\s*(\d+)\D+(\d{1,2})\.(\d{1,2})/i.exec(t);
    if (m) return { antal: Number(m[1]), datum: datumUrFlik(`${m[2]}.${m[3]}`, idag) };
  }
  return null;
}

/**
 * Hela bedömningen för en artikel.
 * inst: { idag, ledtid, sakerhet, cykel, overtackning, kny, moq, kostnad, sasong }
 */
export function bedom(artikel, inst) {
  const { idag, ledtid, sakerhet, cykel, overtackning, kny = null, moq = 1, kostnad = null, sasong = 1, taktOverstyrd = null } = inst;
  const iv = rorelser(artikel.serie);
  const dagar = Object.keys(artikel.serie).sort();
  const senast = [...dagar].reverse().find((d) => artikel.serie[d] !== null) ?? null;
  const lager = senast ? artikel.serie[senast] : null;
  const t7 = takt(iv, idag, 7);
  const t14 = takt(iv, idag, 14);
  const t30 = takt(iv, idag, 30);
  const tAlla = takt(iv, idag, 3650);
  const bas = taktOverstyrd ?? t14 ?? t30 ?? tAlla ?? 0;
  const planTakt = bas * sasong;
  const salt30 = saltI(iv, idag, 30);
  const paFyllningar = iv.filter((x) => x.in > 0).map((x) => ({ datum: x.till, antal: x.in }));

  const order = bestallningUrAnteckning(artikel.anteckningar, idag);
  const matt = order ? paFyllningar.find((p) => p.datum >= order.datum && p.antal >= order.antal * 0.5) : null;
  const mattLedtid = order && matt ? { bestalld: order.datum, ilager: matt.datum, dagar: dagarMellan(order.datum, matt.datum), antal: matt.antal } : null;

  const ut = {
    nyckel: artikel.nyckel, sku: artikel.sku, namn: artikel.namn, spec: artikel.spec,
    lager, avlast: senast, takt7: t7, takt14: t14, takt30: t30, taktAlla: tAlla, planTakt, salt30,
    paFyllningar, mattLedtid, kostnad,
    dagarKvar: null, slutDatum: null, bestallSenast: null, bestallAntal: 0, status: 'ok', varfor: '',
    bundet: kostnad !== null && lager > 0 ? lager * kostnad : null, overlagerSt: 0, overlagerKr: null, kny: null,
  };

  if (lager === null) { ut.status = 'okand'; ut.varfor = 'ingen läsbar avläsning'; return ut; }
  if (lager <= 0) {
    if (salt30 > 0) { ut.status = 'slut'; ut.varfor = `slut i lager — sålde ${salt30} st de senaste 30 dagarna`; }
    else { ut.status = 'vilande'; ut.varfor = 'slut, och ingen försäljning på 30 dagar'; }
    ut.bestallAntal = salt30 > 0 ? avrundaMoq(planTakt * (ledtid + sakerhet + cykel), moq) : 0;
    return ut;
  }
  if (salt30 === 0) {
    ut.status = 'stilla';
    ut.varfor = `${lager} st i lager, ingen utleverans på 30 dagar`;
    ut.overlagerSt = lager;
    ut.overlagerKr = kostnad !== null ? lager * kostnad : null;
    return ut;
  }

  ut.dagarKvar = planTakt > 0 ? lager / planTakt : null;
  ut.slutDatum = ut.dagarKvar !== null ? plusDagar(idag, Math.floor(ut.dagarKvar)) : null;
  ut.bestallSenast = ut.slutDatum ? plusDagar(ut.slutDatum, -(ledtid + sakerhet)) : null;
  const bestallPunkt = planTakt * (ledtid + sakerhet);

  if (lager <= bestallPunkt) {
    ut.status = 'bestall_nu';
    ut.varfor = `räcker ${Math.floor(ut.dagarKvar)} dagar, ledtid + säkerhet är ${ledtid + sakerhet}`;
  } else if (dagarMellan(idag, ut.bestallSenast) <= 14) {
    ut.status = 'bestall_snart';
    ut.varfor = `beställ senast ${ut.bestallSenast}`;
  } else if (ut.dagarKvar > overtackning) {
    ut.status = 'overlager';
    ut.overlagerSt = Math.floor(lager - planTakt * overtackning);
    ut.overlagerKr = kostnad !== null ? ut.overlagerSt * kostnad : null;
    ut.varfor = `räcker ${Math.round(ut.dagarKvar)} dagar — ${ut.overlagerSt} st mer än ${overtackning} dagars behov`;
  } else {
    ut.varfor = `räcker till ${ut.slutDatum}`;
  }
  if (ut.status === 'bestall_nu' || ut.status === 'bestall_snart') {
    ut.bestallAntal = avrundaMoq(planTakt * (ledtid + sakerhet + cykel) - lager, moq);
  }

  // Kinesiska nyåret: räcker lagret tills fabrikerna är igång igen + ledtiden?
  // Bara varor som faktiskt säljer (minst 5 st på 30 dagar) — annars drunknar listan i småsaker.
  if (kny && planTakt > 0 && salt30 >= 5) {
    const tackas = plusDagar(kny.normal_igen, ledtid);
    const behov = planTakt * dagarMellan(idag, tackas);
    if (behov > lager && ut.slutDatum < tackas) {
      ut.kny = {
        behov: Math.ceil(behov),
        saknas: Math.ceil(behov - lager),
        bestallSenast: plusDagar(kny.sista_utskick, -ledtid),
        tackas,
      };
    }
  }
  return ut;
}

export function nastaManad(manad) {
  const [a, m] = manad.split('-').map(Number);
  return m === 12 ? `${a + 1}-01-01` : `${a}-${String(m + 1).padStart(2, '0')}-01`;
}

export function avrundaMoq(antal, moq = 1) {
  if (!(antal > 0)) return 0;
  const m = Math.max(1, moq || 1);
  return Math.ceil(antal / m) * m;
}

const ORDNING = { slut: 0, bestall_nu: 1, bestall_snart: 2, ok: 3, overlager: 4, stilla: 5, vilande: 6, okand: 7 };
export function sortera(bedomningar) {
  return [...bedomningar].sort((a, b) => (ORDNING[a.status] - ORDNING[b.status]) || (b.salt30 - a.salt30) || (b.lager ?? 0) - (a.lager ?? 0));
}

/** Summor per status och bundet kapital (bara där kostnaden är känd). */
export function sammanfatta(bedomningar) {
  const per = {};
  let enheter = 0;
  let bundet = 0;
  let utanKostnad = 0;
  let overlagerKr = 0;
  for (const b of bedomningar) {
    per[b.status] = (per[b.status] ?? 0) + 1;
    if (b.lager > 0) {
      enheter += b.lager;
      if (b.kostnad !== null) bundet += b.lager * b.kostnad; else utanKostnad += b.lager;
    }
    if (b.overlagerKr) overlagerKr += b.overlagerKr;
  }
  return { perStatus: per, enheter, bundetKr: bundet, enheterUtanKostnad: utanKostnad, overlagerKr };
}

/**
 * Säsongsbehovet för en vara med förra årets månadskurva (Matstrumpor).
 * manader: { 'YYYY-MM': ordrar } förra säsongen. enheterPerOrder: mätt.
 * Ger enheter per månad framåt för varje scenario (1×, 2× … förra året), och
 * hur mycket som måste ligga i lager före kinesiska nyåret (det som säljs
 * mellan sista utskick och dagen fabrikerna är igång igen + ledtiden).
 */
export function sasongsbehov({ manader, enheterPerOrder, scenarier = [1, 2, 3], idag, kny = null, ledtid = 0, taktPerDag = null }) {
  const framat = [];
  const [ar, man] = idag.slice(0, 7).split('-').map(Number);
  for (let i = 0; i < 6; i++) {
    const m = ((man - 1 + i) % 12) + 1;
    const a = ar + Math.floor((man - 1 + i) / 12);
    const forra = `${a - 1}-${String(m).padStart(2, '0')}`;
    framat.push({ manad: `${a}-${String(m).padStart(2, '0')}`, forraAret: forra, ordrarForra: manader[forra] ?? null });
  }
  // "Dagens takt" = det som säljs per dag nu, lika varje dag i månaden. Golvet om
  // säsongen inte växer alls från i dag — förra årets kurva kan ligga under det.
  const rader = framat.map((f) => ({
    ...f,
    dagensTakt: taktPerDag === null ? null : Math.round(taktPerDag * dagarMellan(`${f.manad}-01`, nastaManad(f.manad))),
    enheter: Object.fromEntries(scenarier.map((s) => [s, f.ordrarForra === null ? null : Math.round(f.ordrarForra * enheterPerOrder * s)])),
  }));
  let knyGap = null;
  if (kny) {
    const fran = kny.sista_utskick;
    const till = plusDagar(kny.normal_igen, ledtid);
    // Andelen av månaden som ligger i glappet (enheterna antas sälja jämnt över månaden).
    const andel = (manad) => {
      const start = `${manad}-01`;
      const slut = nastaManad(manad);
      const a = start < fran ? fran : start;
      const b = slut > till ? till : slut;
      return Math.max(0, dagarMellan(a, b)) / dagarMellan(start, slut);
    };
    knyGap = { fran, till, enheter: {}, dagensTakt: taktPerDag === null ? null : Math.round(taktPerDag * dagarMellan(fran, till)) };
    for (const s of scenarier) {
      let summa = 0;
      for (const r of rader) if (r.enheter[s] !== null) summa += r.enheter[s] * andel(r.manad);
      knyGap.enheter[s] = Math.round(summa);
    }
  }
  return { rader, knyGap };
}
