// dashboard.mjs — körningens resultat som MASKINLÄSBAR data för hemsidan.
//
// Varför en egen fil och inte markdown: sidan ska kunna sortera ärenden, filtrera
// på kategori och visa deadlines. Att läsa det ur en renderad rapporttext är att
// gissa; här ligger samma tal som rapporten, men strukturerade.
//
// ⚠️ Allt som rör en kund är MASKERAT redan här (maskera.mjs), inte i sidan.
// Filen committas till repot och sidan publiceras — adresser får aldrig ligga i
// klartext i någon av dem. Ordernumret är det VA:n söker på.
//
// Texten som visas för VA:n är engelsk (CLAUDE.md: språket följer läsaren).
// Kategorinamn hämtas ur klassificering.mjs så sidan och rapporten aldrig
// kan säga olika saker.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KATEGORI } from './klassificering.mjs';
import { maskeraAdress, maskeraText } from './maskera.mjs';
import { byggAtgardsplan, pengarIRisk } from './atgardsplan.mjs';
import { oversikt as autosvarOversikt } from './autosvar/oversikt.mjs';
import { lasLogg, LOGGMAPP } from './autosvar/logg.mjs';

export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const VERSION = 2;
/** Autosvarets fönster på sidan — samma 30 dagar som `oversikt.mjs --dagar 30`. */
export const AUTOSVAR_DAGAR = 30;

const iso = (d) => (d instanceof Date ? d.toISOString() : d ? String(d) : null);
const dag = (d) => (d ? iso(d)?.slice(0, 10) ?? null : null);

/** Ett ärende som sidans tabellrad — maskerat, med det VA:n behöver för att agera. */
export function arendeRad(a) {
  const kat = KATEGORI[a.kategori] ?? null;
  return {
    kategori: a.kategori,
    kategoriEn: kat?.en ?? a.kategori,
    vikt: kat?.vikt ?? 0,
    kund: maskeraAdress(a.kund?.adress),
    ordernummer: a.ordernummer ?? [],
    amne: maskeraText(a.amne ?? '').slice(0, 140),
    utdrag: maskeraText(a.utdrag ?? '').slice(0, 200),
    sprak: a.sprak ?? 'okänt',
    besvarad: Boolean(a.besvarad),
    timmarObesvarad: a.timmarObesvarad ?? 0,
    larm: Boolean(a.larmObesvarad),
    svarstidTimmar: a.svarstidTimmar ?? null,
    antalInkommande: a.antalInkommande ?? 1,
    forsta: dag(a.forstaInkommande),
    senaste: dag(a.senasteInkommande),
    eskalering: a.eskalering ?? 0,
  };
}

/** En tvist som sidans rad: typ, pengar, deadline. */
export function tvistRad(x) {
  return {
    typ: x.typ ?? 'dispute',
    orsak: String(x.orsak ?? 'general').replace(/_/g, ' '),
    status: String(x.status ?? '').replace(/_/g, ' '),
    oppen: ['needs_response', 'under_review'].includes(x.status),
    belopp: Number(x.belopp) || 0,
    valuta: x.valuta ?? null,
    order: x.ordernamn ?? (x.orderId ? String(x.orderId) : null),
    initierad: dag(x.initierad),
    deadline: x.evidensSenast ?? null,
  };
}

/**
 * Hela sidans data för EN körning (ett brand, en vecka). `r` är run.mjs:s
 * resultatobjekt. Returnerar ett rent objekt — inget skrivs här.
 */
export function byggDashboard(r, { nu = new Date() } = {}) {
  const s = r.sammanfattning ?? {};
  const t = r.brand?.trosklar ?? {};
  const bort = r.bortfiltrerade ?? {};
  const tvister = r.tvister?.tillganglig ? (r.tvister.lista ?? []).map(tvistRad) : [];
  const pengar = pengarIRisk(r);
  const forra = r.forra ?? null;
  const sopTackta = new Set((r.sop?.tackta ?? []).map((x) => x.id));
  const sopSaknas = new Set(r.sop?.saknas ?? []);

  return {
    id: r.brand?.id,
    namn: r.brand?.brand ?? r.brand?.id,
    vecka: r.vecka,
    kord: iso(r.kord ?? nu),
    period: { fran: dag(r.period?.fran), till: dag(r.period?.till), dagar: r.dagar ?? t.ordrar_dagar ?? 7 },
    kallor: r.kallor ?? [],
    varningar: (r.varningar ?? []).map((v) => maskeraText(v)),
    trosklar: { obesvaradTimmar: t.obesvarad_timmar ?? 48, ordrarDagar: t.ordrar_dagar ?? 30, ofullbordadDagar: t.ofullbordad_dagar ?? 5, tvistgradGul: t.tvistgrans_gul_procent ?? 0.5, tvistgradRod: t.tvistgrans_rod_procent ?? 0.9 },
    tvisterTillgangliga: Boolean(r.tvister?.tillganglig),

    // Vad som lästes och vad som sorterades bort — så "har du läst allt?" går att svara på.
    kallflode: {
      mejl: s.antalMejl ?? r.antalMejl ?? null,
      arenden: s.antalArenden ?? 0,
      spam: s.spam ?? 0,
      autosvar: bort.autosvar ?? 0,
      system: bort.system ?? 0,
      listmejl: bort.listmejl ?? 0,
      utanAvsandare: bort.utanAvsandare ?? 0,
    },

    nyckeltal: {
      risk: r.risk?.poang ?? 0,
      riskNiva: r.risk?.niva?.id ?? 'lag',
      riskNivaEn: r.risk?.niva?.en ?? 'Low',
      arenden: s.antalArenden ?? 0,
      obesvarade: s.obesvarade ?? 0,
      larmObesvarade: s.larmObesvarade ?? 0,
      medianSvarstidTimmar: s.medianSvarstidTimmar ?? null,
      besvaradeMedTid: s.besvaradeMedTid ?? 0,
      ordrar: r.ordrar?.antal ?? null,
      chargebacks: r.risk?.underlag?.chargebacks ?? null,
      forfragningar: r.risk?.underlag?.forfragningar ?? null,
      tvistgrad: r.risk?.tvistgrad ?? null,
      tvistgradAllt: r.risk?.tvistgradAllt ?? null,
      pengarIRisk: pengar.belopp,
      pengarValuta: pengar.valuta,
      oppnaTvister: pengar.antal,
      forra: forra ? {
        risk: forra.riskPoang ?? null, arenden: forra.antalArenden ?? null, obesvarade: forra.obesvarade ?? null,
        larmObesvarade: forra.larmObesvarade ?? null, medianSvarstidTimmar: forra.medianSvarstidTimmar ?? null,
        chargebacks: forra.tvister ?? null, tvistgrad: forra.tvistgrad ?? null, tvistgradAllt: forra.tvistgradAllt ?? null,
      } : null,
    },

    kategorier: (s.topp ?? []).map((p) => ({
      id: p.id,
      en: KATEGORI[p.id]?.en ?? p.id,
      vikt: KATEGORI[p.id]?.vikt ?? 0,
      antal: p.antal,
      obesvarade: p.obesvarade,
      andel: s.antalArenden ? Math.round((p.antal / s.antalArenden) * 100) : 0,
      forra: forra?.perKategori?.[p.id] ?? null,
      sop: sopTackta.has(p.id) ? 'covered' : sopSaknas.has(p.id) ? 'missing' : 'unknown',
      sopTitel: (r.sop?.tackta ?? []).find((x) => x.id === p.id)?.sop ?? null,
      aterkommande: (r.aterkommande ?? []).find((x) => x.id === p.id) ?? null,
      mening: r.sammanfattningar?.[p.id] ?? null,
    })),

    // Ärendelistan är arbetsordningen: farligast och äldst först (samma sortering som arenden.mjs).
    arenden: (r.arenden ?? []).filter((a) => a.kategori !== 'spam').map(arendeRad),
    tvister,
    signaler: (r.risk?.signaler ?? []).filter((x) => x.poang > 0 || (x.varde !== null && x.varde > 0)).map((x) => ({
      id: x.id, en: x.en, varde: x.varde, poang: x.poang, detaljer: (x.detaljer ?? []).map((d) => maskeraText(d)),
    })),
    sop: r.sop ? { antal: r.sop.antalSop ?? 0, tackta: (r.sop.tackta ?? []).map((x) => x.id), saknas: r.sop.saknas ?? [], fel: r.sop.fel ?? null } : null,
    plan: byggAtgardsplan(r, { nu }).map((a) => ({ ...a, varfor: maskeraText(a.varfor) })),
  };
}

/**
 * Åtgärdsplanen räknad ur en FÄRDIG dashboard-post i stället för ur körningen.
 *
 * Varför: planens TEXT ska gå att rätta utan att läsa om brevlådan (en körning
 * tar tre kvart). Talen ligger kvar i JSON-filen som körningens kvitto; orden
 * skrivs om vid varje sidbygge. Samma regler, samma tal — bara formuleringen
 * är färsk.
 */
export function planUrDashboard(d, { nu = new Date() } = {}) {
  if (!d?.nyckeltal) return [];
  const t = d.trosklar ?? {};
  return byggAtgardsplan({
    brand: {
      id: d.id, brand: d.namn, valuta: d.nyckeltal.pengarValuta,
      trosklar: {
        obesvarad_timmar: t.obesvaradTimmar ?? 48, ordrar_dagar: t.ordrarDagar ?? 30,
        ofullbordad_dagar: t.ofullbordadDagar ?? 5,
        tvistgrans_gul_procent: t.tvistgradGul ?? 0.5, tvistgrans_rod_procent: t.tvistgradRod ?? 0.9,
      },
    },
    sammanfattning: {
      antalArenden: d.nyckeltal.arenden, obesvarade: d.nyckeltal.obesvarade, larmObesvarade: d.nyckeltal.larmObesvarade,
      medianSvarstidTimmar: d.nyckeltal.medianSvarstidTimmar, besvaradeMedTid: d.nyckeltal.besvaradeMedTid,
      topp: (d.kategorier ?? []).map((k) => ({ id: k.id, antal: k.antal, obesvarade: k.obesvarade })),
    },
    arenden: (d.arenden ?? []).map((a) => ({
      kategori: a.kategori, besvarad: a.besvarad, larmObesvarad: a.larm, timmarObesvarad: a.timmarObesvarad,
      ordernummer: a.ordernummer ?? [], kund: { adress: a.kund },
    })),
    risk: {
      poang: d.nyckeltal.risk, tvistgrad: d.nyckeltal.tvistgrad, signaler: d.signaler ?? [],
      underlag: { ordrar: d.nyckeltal.ordrar, chargebacks: d.nyckeltal.chargebacks, forfragningar: d.nyckeltal.forfragningar, dagar: d.period?.dagar ?? t.ordrarDagar ?? 30 },
    },
    ordrar: { antal: d.nyckeltal.ordrar },
    // ⚠️ Utan Shopify fanns aldrig några tvister — då ska inga tviståtgärder
    // skrivas alls. En tom lista betyder "inga", `tillganglig: false` betyder
    // "vet inte", och de två får aldrig blandas ihop.
    // Äldre filer (skrivna innan fältet fanns) saknar flaggan: en ifylld
    // tvistlista betyder att Shopify lästes, en tom att vi inte vet.
    tvister: { tillganglig: d.tvisterTillgangliga ?? (d.tvister ?? []).length > 0, lista: (d.tvister ?? []).map((x) => ({
      typ: x.typ, orsak: x.orsak, status: String(x.status ?? '').replace(/ /g, '_'), belopp: x.belopp,
      valuta: x.valuta, ordernamn: x.order, evidensSenast: x.deadline,
    })) },
    sop: d.sop ? { antalSop: d.sop.antal, tackta: (d.sop.tackta ?? []).map((id) => ({ id })), saknas: d.sop.saknas ?? [], fel: d.sop.fel } : null,
  }, { nu });
}

/** Skriver körningens dashboard-JSON bredvid rapporterna. Idempotent per vecka. */
export function skrivDashboard(r, { korningar } = {}) {
  const mapp = join(korningar ?? join(ROT, 'kundtjanst', 'korningar'), r.brand.id);
  mkdirSync(mapp, { recursive: true });
  const fil = join(mapp, `${r.vecka}.json`);
  writeFileSync(fil, `${JSON.stringify(byggDashboard(r), null, 2)}\n`);
  return fil;
}

// -------------------------------------------------------------- Autosvaret

/**
 * Engelska ord för det ARGA svarets X — kundens faktiska problem (nycklarna
 * ur autosvar/svar.mjs). Bara etiketter för sidan; talen kommer ur loggen.
 */
export const X_EN = Object.freeze({
  som_pa_bilden: 'looks nothing like the picture',
  kvalitet: 'quality not what they paid for',
  ej_levererad: 'parcel never arrived',
  vantat: 'waited too long for a reply',
  skadad_defekt: 'broken or defective item',
  fel_vara: 'wrong item',
  okand_debitering: 'unknown charge',
  standard: 'general complaint',
});

/** Engelska ord för ENKEL-typen (autosvar/hinkar.mjs). */
export const TYP_EN = Object.freeze({
  wismo: 'where is my order',
  levererad: 'marked delivered, not received',
  leveranstid: 'delivery time',
  oppettider: 'opening hours',
  adress: 'address change',
  ordernummer: 'asked for order number',
  foretag: 'company details',
  foton: 'photos requested',
  retur: 'return',
});

/**
 * En rad ur loggen som sidan visar den. Loggen är redan maskerad; fritexten
 * (ämne, felmeddelande) maskeras EN gång till här — regel 1 i DASHBOARD.md
 * gäller allt som visas, och ett felmeddelande från Roundcube kan bära
 * adressen som stod i Till-fältet.
 */
export function autosvarRad(r) {
  const ut = { ...r, kund: maskeraAdress(r.kund), amne: maskeraText(r.amne ?? '').slice(0, 120) };
  if ('fel' in r) ut.fel = maskeraText(r.fel ?? '').slice(0, 200);
  if ('orsak' in r) ut.orsak = maskeraText(r.orsak ?? '');
  if ('orsakEn' in r) ut.orsakEn = maskeraText(r.orsakEn ?? '');
  return ut;
}

/** En rad ur brevlådans listning (brevlada.mjs → tolkaListrad) som sidan visar den: avsändaren maskerad. */
export function brevladaRad(r) {
  return {
    uid: Number.isFinite(Number(r?.uid)) ? Number(r.uid) : null,
    fran: maskeraAdress(r?.franAdress || r?.fran || ''),
    amne: maskeraText(r?.amne ?? '').slice(0, 120),
    datum: String(r?.datum ?? ''),
    last: Boolean(r?.last),
    flaggad: Boolean(r?.flaggad),
  };
}

/**
 * Autosvarets läge per butik, ur loggen `kundtjanst/autosvar/logg/<butik>.jsonl`.
 * Talen är `oversikt.mjs`:s — ingenting räknas om här (DASHBOARD.md regel 4),
 * så sidan och `node kundtjanst/autosvar/oversikt.mjs --json` kan inte säga
 * olika saker. Butikerna är loggfilerna som finns; en butik utan logg står
 * inte här, och sidan säger då att autosvaret inte kört för den.
 * `brevlada` fylls av rapportsida.mjs (live ur webbmejlen) — null tills dess.
 */
export function samlaAutosvar({ loggmapp = LOGGMAPP, nu = new Date(), dagar = AUTOSVAR_DAGAR } = {}) {
  const brands = {};
  if (existsSync(loggmapp)) {
    for (const f of readdirSync(loggmapp).filter((x) => x.endsWith('.jsonl')).sort()) {
      const id = f.slice(0, -'.jsonl'.length);
      const rader = lasLogg(id, loggmapp);
      if (!rader.length) continue;
      const o = autosvarOversikt(rader, { nu, dagar });
      brands[id] = {
        ...o,
        brand: o.brand ?? id,
        arga: o.arga.map(autosvarRad),
        svarade: o.svarade.map(autosvarRad),
        tillVa: o.tillVa.map(autosvarRad),
        fel: o.fel.map(autosvarRad),
        brevlada: null,
      };
    }
  }
  return { dagar, hamtad: iso(nu), etiketter: { x: X_EN, typ: TYP_EN }, brands };
}

// ---------------------------------------------------------------- Tvisterna
//
// Kontraktet: kundtjanst/DASHBOARD-TVISTER.md. Två källor — snapshotens
// oppnaTvister[] (allt som är öppet, alla varumärken) och tvistkollens
// `--alla --torr --json` (vad som brådskar, med `kvar` räknat av verktyget).
// Chargebacks överst, sedan kvar stigande, sedan belopp fallande. Ett
// varumärke som inte gick att läsa är OKÄNT med orsak — aldrig noll.
// Ingen dom (FIGHT/REFUND …) — tvistfakta.mjs har inget --json, och en dom
// gissad ur reason-koden vore påhittad data.

export const TVIST_BRADSKANDE_DAGAR = 3;
const DYGN = 86_400_000;

/**
 * Kalenderdagar från i dag till deadline — exakt samma räkning som
 * tvistkoll.dagarKvar (testet bevisar det). Används BARA för rader tvistkollen
 * inte redan dömt: har tvistkollen ett `kvar` för raden vinner det alltid.
 */
export function dagarTill(deadline, nu = new Date()) {
  if (!deadline) return null;
  const d = Date.parse(`${String(deadline).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d)) return null;
  const idag = Date.parse(`${new Date(nu).toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((d - idag) / DYGN);
}

/** "Submit by" = dagen före deadline. Bevisen skickas in SIST — de blir bättre med tiden. */
export function skickaInSenast(deadline) {
  if (!deadline) return null;
  const d = Date.parse(`${String(deadline).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d)) return null;
  return new Date(d - DYGN).toISOString().slice(0, 10);
}

/** Försenad och "går ut i dag" är två olika lägen — en tvist som går ut i dag är fortfarande vinnbar. */
export function tvistLage(kvar) {
  if (kvar === null || kvar === undefined) return 'okand';
  if (kvar < 0) return 'forsenad';
  if (kvar === 0) return 'idag';
  if (kvar <= TVIST_BRADSKANDE_DAGAR) return 'bradskande';
  return 'kommande';
}

const arCb = (r) => (String(r?.typ ?? '').toLowerCase() === 'chargeback' ? 1 : 0);

/** Chargebacks först, sedan kvar stigande (okänd deadline sist bland de kända), sedan belopp fallande. */
export function sorteraTvister(rader = []) {
  return [...rader].sort((a, b) => (arCb(b) - arCb(a)) || ((a.kvar ?? 99) - (b.kvar ?? 99)) || ((b.belopp || 0) - (a.belopp || 0)));
}

/**
 * En öppen tvist som sidan visar den. `koll` är tvistkollens brådskande rad
 * för samma order+deadline när den finns — då är `kvar` och `orsak` dess.
 * Inga kunduppgifter: order, typ, belopp, datum, status. Inget annat.
 */
export function tvistRadLive(tv, { nu = new Date(), koll = null } = {}) {
  const order = String(tv.order ?? '');
  const status = String(tv.status ?? '').replace(/_/g, ' ').trim();
  const kvar = koll ? (koll.kvar ?? null) : dagarTill(tv.deadline, nu);
  return {
    order,
    orderArId: !order.startsWith('#'),
    typ: String(tv.typ ?? 'inquiry').toLowerCase(),
    orsak: koll?.orsak ? String(koll.orsak).replace(/_/g, ' ') : null,
    belopp: Number(tv.belopp) || 0,
    valuta: tv.valuta ?? null,
    deadline: tv.deadline ?? null,
    initierad: tv.initierad ?? null,
    status,
    underReview: status === 'under review',
    kvar,
    lage: tvistLage(kvar),
    submitBy: skickaInSenast(tv.deadline),
    bradskande: Boolean(koll),
    kvarFran: koll ? 'tvistkoll' : 'sidan',
  };
}

/**
 * Hela tvistläget för sidan: ett block per varumärke. Ren funktion.
 * @param snapshot   stonebite/data/snapshot.json (oppnaTvister, byggd, kundtjanst.brands)
 * @param tvistkoll  { status, hamtad, orsak, brands: [{ brand, tillganglig, orsak, tvister, bradskande }] } ur korTvistkoll — eller null
 * @param brands     [{ id, namn }] alla kända brands (upptackBrands), så de olästa också får en rad
 * @param handbok    länkarna ur kundtjanst/handbok.json
 */
export function samlaTvister({ snapshot = null, tvistkoll = null, brands = [], nu = new Date(), handbok = null } = {}) {
  const oppna = (snapshot?.oppnaTvister ?? []).filter((t) => t && t.oppen !== false);
  const kollPerBrand = new Map((tvistkoll?.brands ?? []).map((b) => [b.brand, b]));
  const ids = new Set([...brands.map((b) => b.id), ...oppna.map((t) => t.brand), ...kollPerBrand.keys()].filter(Boolean));
  const namnFor = (id) => brands.find((b) => b.id === id)?.namn ?? (snapshot?.kundtjanst?.brands ?? []).find((b) => b.id === id)?.namn ?? id;
  const nyckel = (o, d) => `${String(o ?? '')}|${String(d ?? '').slice(0, 10)}`;

  const ut = [];
  for (const id of [...ids].sort()) {
    const koll = kollPerBrand.get(id) ?? null;
    const egna = oppna.filter((t) => t.brand === id);
    const bradskande = new Map((koll?.bradskande ?? []).map((b) => [nyckel(b.order, b.deadline), b]));
    const rader = egna.map((t) => tvistRadLive(t, { nu, koll: bradskande.get(nyckel(t.order, t.deadline)) ?? null }));
    // Brådskande rader tvistkollen såg men snapshoten inte har (nyare än hämtningen) — tvistkollens tal, rakt av.
    for (const b of koll?.bradskande ?? []) {
      if (egna.some((t) => nyckel(t.order, t.deadline) === nyckel(b.order, b.deadline))) continue;
      rader.push(tvistRadLive({ order: b.order, brand: id, typ: b.typ, belopp: b.belopp, valuta: b.valuta, deadline: b.deadline, status: 'needs response', oppen: true }, { nu, koll: b }));
    }
    // Pengar i risk per valuta — valutor summeras aldrig ihop.
    const pengarIRisk = {};
    for (const r of rader) if (r.valuta && r.belopp) pengarIRisk[r.valuta] = Math.round(((pengarIRisk[r.valuta] ?? 0) + r.belopp) * 100) / 100;

    let tillganglig; let orsak;
    if (koll) { tillganglig = Boolean(koll.tillganglig); orsak = koll.orsak ?? null; }
    else if (egna.length) { tillganglig = true; orsak = null; }
    else { tillganglig = null; orsak = tvistkoll?.status === 'ok' ? 'not in the tvistkoll result' : 'urgency not read for this build — open disputes come from the snapshot only'; }

    const sorterade = sorteraTvister(rader);
    ut.push({
      id, namn: namnFor(id), tillganglig, orsak,
      // Antalet på 180 dagar bara när tvistkollen faktiskt läste butiken — en oläst butik
      // svarar med 0, och 0 där är okänt, inte noll.
      tvister180: koll?.tillganglig ? (koll.tvister ?? null) : null,
      oppna: sorterade,
      pengarIRisk,
      antal: {
        oppna: rader.length,
        chargebacks: rader.filter((r) => r.typ === 'chargeback').length,
        forsenade: rader.filter((r) => r.lage === 'forsenad').length,
        idag: rader.filter((r) => r.lage === 'idag').length,
        bradskande: rader.filter((r) => r.bradskande).length,
        underReview: rader.filter((r) => r.underReview).length,
      },
    });
  }
  // Det som brinner först: brands med öppna rader (eller läst brådska) överst, sedan de utan rader —
  // omätta (null) före okända (false), så det VA:n kan agera på står först och orsakerna sist.
  const rang = (b) => (b.antal.oppna > 0 || b.tillganglig === true ? 0 : b.tillganglig === null ? 1 : 2);
  ut.sort((a, b) => {
    if (rang(a) !== rang(b)) return rang(a) - rang(b);
    if (a.antal.chargebacks !== b.antal.chargebacks) return b.antal.chargebacks - a.antal.chargebacks;
    const ka = a.oppna[0]?.kvar ?? 99; const kb = b.oppna[0]?.kvar ?? 99;
    if (ka !== kb) return ka - kb;
    return (b.antal.oppna - a.antal.oppna) || a.namn.localeCompare(b.namn);
  });

  return {
    snapshotByggd: snapshot?.byggd ?? null,
    kollStatus: tvistkoll?.status ?? 'saknas',
    kollHamtad: tvistkoll?.hamtad ?? null,
    kollOrsak: tvistkoll?.orsak ?? null,
    bradskandeDagar: TVIST_BRADSKANDE_DAGAR,
    handbok: handbok ?? null,
    brands: ut,
  };
}

// ------------------------------------------------------------------ Sidan

function lasJsonl(fil) {
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean)
    .map((rad) => { try { return JSON.parse(rad); } catch { return null; } })
    .filter((x) => x && x.vecka);
}

/**
 * Allt sidan visar: varje brands senaste körning + historiken bakåt.
 * Läser `<brand>/<vecka>.json` (skrivna av skrivDashboard) och
 * `historik/<brand>.jsonl`. Veckor utan JSON (körda före version 2) syns
 * bara i historikkurvan — aldrig som en tom flik.
 */
export function samlaDashboard({ korningar, historik, loggmapp, nu = new Date() } = {}) {
  const kbas = korningar ?? join(ROT, 'kundtjanst', 'korningar');
  const hbas = historik ?? join(ROT, 'kundtjanst', 'historik');
  const brands = [];
  const mappar = existsSync(kbas) ? readdirSync(kbas, { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith('_')).map((d) => d.name) : [];

  for (const id of mappar.sort()) {
    const mapp = join(kbas, id);
    const veckofiler = readdirSync(mapp).filter((f) => /^\d{4}-W\d{2}\.json$/.test(f)).sort();
    if (!veckofiler.length) continue;
    const veckor = {};
    for (const f of veckofiler) {
      try { veckor[f.slice(0, -5)] = JSON.parse(readFileSync(join(mapp, f), 'utf8')); } catch { /* trasig fil hoppas över, aldrig tyst i loggen nedan */ }
    }
    const nycklar = Object.keys(veckor).sort();
    if (!nycklar.length) continue;
    // Planens ORD skrivs om vid varje sidbygge (talen kommer ur filen).
    for (const v of nycklar) veckor[v].plan = planUrDashboard(veckor[v], { nu });
    const senaste = veckor[nycklar[nycklar.length - 1]];
    brands.push({
      ...senaste,
      veckor: nycklar,
      historik: lasJsonl(join(hbas, `${id}.jsonl`)).sort((a, b) => a.vecka.localeCompare(b.vecka)).map((h) => ({
        vecka: h.vecka, risk: h.riskPoang ?? null, arenden: h.antalArenden ?? null, obesvarade: h.obesvarade ?? null,
        larm: h.larmObesvarade ?? null, median: h.medianSvarstidTimmar ?? null, chargebacks: h.tvister ?? null,
        forfragningar: h.forfragningar ?? null, tvistgrad: h.tvistgrad ?? null, tvistgradAllt: h.tvistgradAllt ?? null, ordrar: h.ordrar ?? null,
      })),
      arkiv: Object.fromEntries(nycklar.map((v) => [v, veckor[v]])),
    });
  }

  brands.sort((a, b) => (b.nyckeltal?.risk ?? 0) - (a.nyckeltal?.risk ?? 0));
  // Autosvaret ligger bredvid veckorapporten, per butiks-id — sidan slår upp
  // det för den valda butiken. Loggen är dagsfärsk, veckorapporten är veckans.
  return { version: VERSION, uppdaterad: iso(nu), brands, autosvar: samlaAutosvar({ loggmapp, nu }) };
}
