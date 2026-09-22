// kalender.mjs — kalendern: en per varumärke och en personlig.
//
// Axels beställning 2026-09-22: "en liten kalender i varje brand … 'det här
// kommer hända snart, det här är på väg upp' … visar allt åstadkommet, så jag
// bara kan sitta och ha high leverage tasks" och "en personlig kalender som
// Google Calendar fast bättre — simpel, annars kommer jag inte använda den".
//
// Två sorters rader:
//   1. Det någon skrivit in (lagras här, jsonl i dataspegeln — samma mönster
//      som bonusens insatser: en rad per version, senaste raden per id vinner,
//      radering är en rad med raderad: true).
//   2. Det systemet redan vet (härleds vid varje sidvisning, lagras aldrig):
//      tvister med deadline, rutiner som ska köra i dag, kontakter att följa
//      upp, kommissionens kördagar. De går inte att radera — de försvinner
//      när saken är gjord.
//
// Snabbinmatningen förstår svenska: "Ring leverantören imorgon kl 14",
// "Byt kort på banken fredag", "Lansera julkampanjen 15/10". Utan datumord
// gäller datumfältet. Testas i test/kalender.test.mjs.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { datamapp } from '../bonus/kor.mjs';

const DAG = 86_400_000;
const TIDSZON = 'Europe/Stockholm';

export const KALENDER = join(datamapp(), 'kalender.jsonl');

export const TYPER = Object.freeze({
  plan: { sv: 'Plan', en: 'Plan' },
  deadline: { sv: 'Deadline', en: 'Deadline' },
  larm: { sv: 'Larm', en: 'Alert' },
  notering: { sv: 'Notering', en: 'Note' },
});

// ------------------------------------------------------------- lagring

export function lasHandelser(fil = KALENDER) {
  if (!existsSync(fil)) return [];
  const senaste = new Map();
  for (const rad of readFileSync(fil, 'utf8').split('\n')) {
    if (!rad.trim()) continue;
    try {
      const h = JSON.parse(rad);
      if (h?.id) senaste.set(h.id, h);
    } catch { /* trasig rad hoppas över */ }
  }
  return [...senaste.values()].filter((h) => !h.raderad);
}

export function skrivHandelse(h, fil = KALENDER) {
  mkdirSync(dirname(fil), { recursive: true });
  appendFileSync(fil, `${JSON.stringify(h)}\n`);
  return h;
}

/** Bygger en ny händelse ur formuläret. Kastar om titel eller datum saknas. */
export function nyHandelse({ titel, datum, tid = '', brand = null, typ = 'plan', anteckning = '', agare = null, skapadAv = null, nu = new Date() }) {
  const t = String(titel ?? '').trim();
  if (!t) throw new Error('Skriv vad som ska hända.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(datum ?? ''))) throw new Error('Datumet måste vara ÅÅÅÅ-MM-DD.');
  const klocka = String(tid ?? '').trim();
  if (klocka && !/^\d{1,2}:\d{2}$/.test(klocka)) throw new Error('Tiden skrivs som 14:00.');
  return {
    id: randomUUID(),
    titel: t.slice(0, 200),
    datum,
    tid: klocka ? klocka.padStart(5, '0') : '',
    brand: brand || null,
    typ: TYPER[typ] ? typ : 'plan',
    anteckning: String(anteckning ?? '').slice(0, 2000),
    agare: agare || null,
    klar: false,
    skapad: nu.toISOString(),
    skapadAv: skapadAv || null,
  };
}

// ------------------------------------------------------ svenska datumord

const VECKODAGAR = { 'söndag': 0, 'sön': 0, 'måndag': 1, 'mån': 1, 'tisdag': 2, 'tis': 2, 'onsdag': 3, 'ons': 3, 'torsdag': 4, 'tors': 4, 'fredag': 5, 'fre': 5, 'lördag': 6, 'lör': 6 };
const MANADER = { jan: 1, januari: 1, feb: 2, februari: 2, mar: 3, mars: 3, apr: 4, april: 4, maj: 5, jun: 6, juni: 6, jul: 7, juli: 7, aug: 8, augusti: 8, sep: 9, sept: 9, september: 9, okt: 10, oktober: 10, nov: 11, november: 11, dec: 12, december: 12 };

/** Dagens datum i Stockholm som ÅÅÅÅ-MM-DD. */
export function idag(nu = new Date()) {
  const f = new Intl.DateTimeFormat('sv-SE', { timeZone: TIDSZON, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(nu);
  const o = Object.fromEntries(f.map((d) => [d.type, d.value]));
  return `${o.year}-${o.month}-${o.day}`;
}

function veckodagIdag(nu) {
  const namn = new Intl.DateTimeFormat('en-US', { timeZone: TIDSZON, weekday: 'short' }).format(nu);
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[namn];
}

export function plusDagar(datum, n) {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

function pad(n) { return String(n).padStart(2, '0'); }

/**
 * Plockar ut när ur en fritext. Returnerar { datum|null, tid|null, titel }
 * där titel är texten utan datumorden. Aldrig en gissning: hittas inget
 * datumord blir datum null och formulärets datumfält gäller.
 */
export function tolkaNar(text, { nu = new Date() } = {}) {
  let rest = ` ${String(text ?? '').trim()} `;
  let datum = null;
  let tid = null;
  const dag0 = idag(nu);
  const ar = Number(dag0.slice(0, 4));

  const ta = (re, fn) => {
    const m = rest.match(re);
    if (!m) return false;
    fn(m);
    rest = rest.replace(m[0], ' ');
    return true;
  };

  // Klockslag: "kl 14", "kl. 14:30", "14:30"
  ta(/\s(?:kl\.?\s*)?(\d{1,2})[:.](\d{2})(?=\s)/i, (m) => { tid = `${pad(m[1])}:${m[2]}`; })
    || ta(/\skl\.?\s*(\d{1,2})(?=\s)/i, (m) => { tid = `${pad(m[1])}:00`; });

  // ISO-datum
  ta(/\s(\d{4})-(\d{2})-(\d{2})(?=\s)/, (m) => { datum = `${m[1]}-${m[2]}-${m[3]}`; })
    // 15/10 eller 15/10/2026
    || ta(/\s(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?(?=\s)/, (m) => {
      let y = m[3] ? Number(m[3]) : ar;
      if (y < 100) y += 2000;
      let d = `${y}-${pad(m[2])}-${pad(m[1])}`;
      if (!m[3] && d < dag0) d = `${y + 1}-${pad(m[2])}-${pad(m[1])}`;
      datum = d;
    })
    // "15 okt", "15 oktober", "den 15 oktober"
    || ta(/\s(?:den\s+)?(\d{1,2})\s+(jan|januari|feb|februari|mar|mars|apr|april|maj|jun|juni|jul|juli|aug|augusti|sep|sept|september|okt|oktober|nov|november|dec|december)(?=\s)/i, (m) => {
      let d = `${ar}-${pad(MANADER[m[2].toLowerCase()])}-${pad(m[1])}`;
      if (d < dag0) d = `${ar + 1}-${pad(MANADER[m[2].toLowerCase()])}-${pad(m[1])}`;
      datum = d;
    })
    || ta(/\s(i\s?dag)(?=\s)/i, () => { datum = dag0; })
    || ta(/\s(i\s?övermorgon)(?=\s)/i, () => { datum = plusDagar(dag0, 2); })
    || ta(/\s(i\s?morgon|imorn)(?=\s)/i, () => { datum = plusDagar(dag0, 1); })
    || ta(/\som\s+(\d{1,2})\s+dag(?:ar)?(?=\s)/i, (m) => { datum = plusDagar(dag0, Number(m[1])); })
    || ta(/\som\s+(en|1|två|2|tre|3)\s+veck(?:a|or)(?=\s)/i, (m) => {
      const n = { en: 1, 1: 1, två: 2, 2: 2, tre: 3, 3: 3 }[m[1].toLowerCase()];
      datum = plusDagar(dag0, 7 * n);
    })
    || ta(/\s(nästa\s+)?(söndag|måndag|tisdag|onsdag|torsdag|fredag|lördag|sön|mån|tis|ons|tors|fre|lör)(?=\s)/i, (m) => {
      const mal = VECKODAGAR[m[2].toLowerCase()];
      const nuDag = veckodagIdag(nu);
      let diff = (mal - nuDag + 7) % 7;
      if (diff === 0) diff = 7;                 // "fredag" på en fredag = nästa fredag
      if (m[1]) diff += diff <= 7 && diff < 7 ? 7 : 0; // "nästa fredag" = veckan efter
      datum = plusDagar(dag0, diff);
    })
    || ta(/\snästa\s+vecka(?=\s)/i, () => {
      const nuDag = veckodagIdag(nu);
      datum = plusDagar(dag0, ((1 - nuDag + 7) % 7) || 7);
    });

  const titel = rest.replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
  return { datum, tid, titel };
}

// ------------------------------------------------------- härledda rader

/**
 * Det systemet redan vet kommer hända. Lagras aldrig — räknas vid varje visning.
 * @param snapshot   sajtens snapshot (tvister, rutiner)
 * @param kontakter  raderna ur kontakter.mjs (nästa steg med datum)
 * @param dagar      hur långt fram vi tittar
 */
export function harleddaHandelser({ snapshot, kontakter = [], nu = new Date(), dagar = 30, brand = null } = {}) {
  const ut = [];
  const start = idag(nu);
  const slut = plusDagar(start, dagar);
  const inom = (d) => d && d >= plusDagar(start, -1) && d <= slut;
  const passar = (b) => !brand || b === brand || (brand === 'ops' && b && !['baverbutiken', 'grillkliniken', 'matstrumpor', 'carashell'].includes(b));

  for (const t of snapshot?.oppnaTvister ?? []) {
    if (!t.oppen || !t.deadline || !inom(t.deadline) || !passar(brandForKundtjanst(t.brand))) continue;
    ut.push({
      id: `tvist:${t.brand}:${t.order}`, kalla: 'tvist', typ: 'deadline', brand: brandForKundtjanst(t.brand),
      datum: t.deadline, tid: '',
      titel: `${t.typ === 'chargeback' ? 'Chargeback' : 'Tvist'} ${ordertext(t.order)} — svar senast (${t.belopp} ${t.valuta})`,
      lank: '/app/kundtjanst',
    });
  }

  // Rutinerna: bara det som INTE är vardag. Timrutiner och dagliga rutiner som
  // kör som de ska är brus i en kalender (20 rader om dagen) — de bor i
  // rutinblocket. Här syns veckorutiner, var-tredje-dag-rutiner och dagliga
  // rutiner som är sena eller saknas, så att nästa körning går att bevaka.
  for (const r of snapshot?.rutiner?.rutiner ?? []) {
    if (!r.nasta || r.status === 'avstangd') continue;
    const typ = r.schema?.typ;
    if (typ === 'timme') continue;
    if (typ === 'dag' && r.status === 'ok') continue;
    const d = r.nasta.slice(0, 10);
    if (!inom(d) || !passar(r.brand)) continue;
    const varning = r.status === 'sen' || r.status === 'saknas';
    ut.push({
      id: `rutin:${r.id}`, kalla: 'rutin', typ: varning ? 'larm' : 'plan', brand: r.brand ?? null,
      datum: d, tid: tidUrIso(r.nasta),
      titel: varning ? `${r.namn} ska köra — ${r.ord}` : `${r.namn} kör (${r.schematext})`,
      lank: r.brand ? `/app/varumarke/${r.brand}?flik=rutiner` : '/app/varumarken',
      status: r.status,
    });
  }

  for (const k of kontakter) {
    if (!k.nastaDatum || !inom(k.nastaDatum) || !passar(k.brand) || k.status === 'nej' || k.status === 'levererat') continue;
    ut.push({
      id: `kontakt:${k.id}`, kalla: 'kontakt', typ: 'plan', brand: k.brand ?? null,
      datum: k.nastaDatum, tid: '', titel: `${k.namn}: ${k.nastaSteg || 'följ upp'}`, lank: `/app/varumarke/${k.brand}?flik=kontakter`,
    });
  }

  // Commission: den 1, 4, 7 … 28 + månadens sista dag (CLAUDE.md).
  for (let i = 0; i <= dagar; i++) {
    const d = plusDagar(start, i);
    const dagNr = Number(d.slice(-2));
    const sista = plusDagar(d, 1).slice(-2) === '01';
    if (((dagNr - 1) % 3 === 0 && dagNr <= 28) || sista) {
      if (passar('baverbutiken')) ut.push({ id: `commission:${d}`, kalla: 'rutin', typ: 'plan', brand: 'baverbutiken', datum: d, tid: '06:00', titel: sista ? 'Commission — månadens slutavräkning' : 'Commission — kördag', lank: '/app/redigerare' });
    }
  }

  return ut.sort((a, b) => (a.datum + a.tid).localeCompare(b.datum + b.tid));
}

/** "#5763" är ett ordernummer; ett 14-siffrigt id är Shopifys interna och kortas. */
function ordertext(order) {
  const o = String(order ?? '').trim();
  if (/^\d{10,}$/.test(o)) return `order-id …${o.slice(-6)}`;
  return o || 'okänd order';
}

function tidUrIso(iso) {
  try {
    return new Intl.DateTimeFormat('sv-SE', { timeZone: TIDSZON, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso)).replace('24:', '00:');
  } catch { return ''; }
}

/** Kundtjänstens brand-id → varumärke på sajten. */
export function brandForKundtjanst(id) {
  const k = String(id ?? '');
  if (['baverbutiken', 'beverbutikken', 'baeverbutiken', 'majavakauppa', 'uk'].includes(k)) return 'baverbutiken';
  if (k === 'carashell') return 'carashell';
  if (k === 'grillkliniken') return 'grillkliniken';
  if (k === 'matstrumpor' || k === '1r46tp-qx') return 'matstrumpor';
  return k || null;
}

// ------------------------------------------------------------ urval

/** Händelser som gäller en person: hens egna + (för agare/chef) alla varumärkens. */
export function forPerson(handelser, { anvandareId, allaBrands = false }) {
  return handelser.filter((h) => h.agare === anvandareId || (allaBrands && h.brand) || (!h.agare && allaBrands));
}

export function forBrand(handelser, brand) {
  return handelser.filter((h) => h.brand === brand);
}

/** Dagarna i en månad, med veckodag, för månadsrutnätet. */
export function manadsdagar(ar, manad) {
  const forsta = new Date(Date.UTC(ar, manad - 1, 1));
  const antal = new Date(Date.UTC(ar, manad, 0)).getUTCDate();
  const startVeckodag = (forsta.getUTCDay() + 6) % 7; // måndag = 0
  const dagar = [];
  for (let i = 1; i <= antal; i++) dagar.push(`${ar}-${pad(manad)}-${pad(i)}`);
  return { dagar, startVeckodag, antal };
}

export { DAG };
