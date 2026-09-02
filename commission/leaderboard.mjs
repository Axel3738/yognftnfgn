#!/usr/bin/env node
// leaderboard.mjs — gör om en commission-körning till en daglig topplista.
//
// Commission-rapporten är ett kvitto: den räknar pengar och skrivs bara på
// kördagar. Leaderboarden är motsatsen — den ska uppdateras VARJE dag, visa
// läget just nu och kunna öppnas på en mobil av redigerarna i Manila.
//
//   node commission/leaderboard.mjs                 bygg ur senaste rapporten
//   node commission/leaderboard.mjs --rapport <fil> bygg ur en viss rapport
//   node commission/leaderboard.mjs --visa          skriv ut i terminalen
//
// Två filer skrivs:
//   commission/leaderboard.json      — datan som läggs upp på leaderboard-sidan
//   commission/leaderboard-historik.json — en rad per dag, ger dagens ökning
//
// ⚠️ Läs-bara som resten av /commission. Den räknar inte om något: den läser
// rapportens egna siffror, så tabellen på sidan och utbetalningen kan aldrig
// säga olika saker.

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROT = resolve(new URL('..', import.meta.url).pathname);
export const DATAFIL = `${ROT}/commission/leaderboard.json`;
export const HISTORIKFIL = `${ROT}/commission/leaderboard-historik.json`;

/** Så många dagar historik som sparas — en månad räcker för sidans kurvor. */
export const HISTORIKDAGAR = 40;

const sek = (karta) => Number(karta?.SEK ?? 0);
const avrunda = (tal) => Math.round(tal * 100) / 100;

/** Valutor utöver SEK, om någon skulle dyka upp. Summeras aldrig ihop. */
function ovrigaValutor(karta) {
  return Object.entries(karta ?? {})
    .filter(([v, b]) => v !== 'SEK' && b)
    .map(([valuta, belopp]) => ({ valuta, belopp: avrunda(belopp) }));
}

/**
 * De tre kampanjer redigeraren dragit mest spend på. Kampanjnamnet är det
 * närmaste vi kommer "vilken produkt" utan att slå upp något nytt.
 */
export function toppkampanjer(annonser = [], antal = 3) {
  const per = new Map();
  for (const a of annonser) {
    const namn = String(a.kampanj ?? a.hubb ?? '').trim() || '—';
    per.set(namn, (per.get(namn) ?? 0) + (a.spend ?? 0));
  }
  return [...per.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, antal)
    .map(([namn, spend]) => ({ namn, spend: avrunda(spend) }));
}

/** Annonsen som dragit mest spend — den som faktiskt bär personens månad. */
export function bastaAnnons(annonser = []) {
  const b = [...annonser].sort((a, b2) => (b2.spend ?? 0) - (a.spend ?? 0))[0];
  return b ? { namn: b.adNamn, spend: avrunda(b.spend ?? 0) } : null;
}

/**
 * Historiken är kumulativ spend per dag och person. Dagens ökning är
 * skillnaden mot föregående dag I SAMMA MÅNAD — den 1:a är hela dagens spend,
 * för då nollställs perioden.
 */
export function dagensOkning(historik, manad, datum, id, spendNu) {
  const tidigare = historik
    .filter((h) => h.manad === manad && h.datum < datum)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .pop();
  if (!tidigare) return null;
  return avrunda(spendNu - Number(tidigare.per?.[id] ?? 0));
}

/** Platsen personen hade i den senaste tidigare mätningen, oavsett månad. */
export function forraPlatsen(historik, datum, id) {
  const tidigare = historik
    .filter((h) => h.datum < datum)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .pop();
  if (!tidigare?.platser) return null;
  const plats = tidigare.platser[id];
  return Number.isFinite(plats) ? plats : null;
}

/**
 * Bygger leaderboard-datan ur en färdig commission-rapport.
 *
 * @param {object} rapport  Rapporten från commission/berakning.mjs.
 * @param {object} [opt]
 * @param {Array}  [opt.historik]  Tidigare dagsmätningar.
 * @param {object} [opt.kallor]    Källorna från run.mjs (hubbar, konton).
 */
export function byggLeaderboard(rapport, { historik = [], kallor = null } = {}) {
  const datum = rapport.period.till;
  const manad = rapport.period.manad;

  const rader = rapport.redigerare
    .map((e) => ({
      id: e.id,
      namn: e.namn,
      spend: avrunda(sek(e.spend)),
      commission: avrunda(sek(e.commission)),
      annonser: (e.annonser ?? []).length,
      kampanjer: toppkampanjer(e.annonser),
      basta: bastaAnnons(e.annonser),
      ovriga: ovrigaValutor(e.spend),
    }))
    .sort((a, b) => b.spend - a.spend)
    .map((r, i) => ({ plats: i + 1, ...r }));

  for (const r of rader) {
    r.okning = dagensOkning(historik, manad, datum, r.id, r.spend);
    r.forraPlats = forraPlatsen(historik, datum, r.id);
    r.flytt = r.forraPlats === null ? 0 : r.forraPlats - r.plats;
  }

  const obetald = {
    utanAnsvarig: avrunda(sek(rapport.utanMottagare?.spend)),
    okanda: avrunda((rapport.okandaAnsvariga ?? []).reduce((s, o) => s + sek(o.spend), 0)),
    ejRedigerare: (rapport.ejRedigerare ?? []).map((p) => ({
      namn: p.namn, roll: p.roll, spend: avrunda(sek(p.spend)),
    })),
    konflikter: (rapport.konflikter ?? []).length,
  };

  return {
    uppdaterad: new Date().toISOString(),
    kord: rapport.kord,
    manad,
    period: { fran: rapport.period.fran, till: rapport.period.till },
    slutavrakning: Boolean(rapport.period.heltMatad),
    sats: rapport.sats,
    rader,
    totalt: {
      spend: avrunda(sek(rapport.totalt?.spend)),
      commission: avrunda(sek(rapport.totalt?.commission)),
      annonser: rader.reduce((s, r) => s + r.annonser, 0),
    },
    obetald,
    kallor: kallor
      ? { hubbar: kallor.hubbar?.length ?? 0, konton: kallor.konton?.length ?? 0, fel: (kallor.fel ?? []).length }
      : null,
    historik: historik
      .filter((h) => h.manad === manad)
      .map((h) => ({ datum: h.datum, per: h.per })),
  };
}

/** Dagens mätning, som den sparas i historiken. En rad per dag. */
export function dagsrad(leaderboard) {
  return {
    datum: leaderboard.period.till,
    manad: leaderboard.manad,
    per: Object.fromEntries(leaderboard.rader.map((r) => [r.id, r.spend])),
    platser: Object.fromEntries(leaderboard.rader.map((r) => [r.id, r.plats])),
  };
}

/** Lägger dagens rad i historiken. Samma datum skrivs över, aldrig dubbleras. */
export function laggIHistorik(historik, rad, max = HISTORIKDAGAR) {
  return [...historik.filter((h) => h.datum !== rad.datum), rad]
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .slice(-max);
}

// ------------------------------------------------------------------ Filer

export function lasHistorik(fil = HISTORIKFIL) {
  if (!existsSync(fil)) return [];
  try {
    const data = JSON.parse(readFileSync(fil, 'utf8'));
    return Array.isArray(data?.dagar) ? data.dagar : [];
  } catch {
    return [];
  }
}

function skriv(fil, data) {
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, `${JSON.stringify(data, null, 2)}\n`);
}

/**
 * Bygger, sparar och returnerar leaderboarden. Anropas av run.mjs varje
 * körning — även på icke-kördagar, för sidan ska aldrig visa gamla siffror
 * bara för att kalendern säger att ingen rapport ska sparas.
 */
export function uppdateraLeaderboard(rapport, kallor = null, { datafil = DATAFIL, historikfil = HISTORIKFIL } = {}) {
  const historik = lasHistorik(historikfil);
  const leaderboard = byggLeaderboard(rapport, { historik, kallor });
  const dagar = laggIHistorik(historik, dagsrad(leaderboard));
  skriv(historikfil, { uppdaterad: leaderboard.uppdaterad, dagar });
  skriv(datafil, leaderboard);
  return leaderboard;
}

/**
 * Bakar in dagens data i sidmallen och skriver den publicerbara filen.
 * Sidan hämtar sin data live ur artifact-databasen; den inbäddade kopian är
 * bara reservläget, så att sidan aldrig står tom om datan inte kan läsas.
 */
export function byggSida({ mall = `${ROT}/commission/leaderboard-sida.html`,
  data = DATAFIL, ut = `${ROT}/commission/leaderboard-publicerad.html` } = {}) {
  const html = readFileSync(mall, 'utf8');
  if (!html.includes('__DATA__')) throw new Error('Mallen saknar platshållaren __DATA__.');
  const leaderboard = JSON.parse(readFileSync(data, 'utf8'));
  writeFileSync(ut, html.replace('__DATA__', JSON.stringify(leaderboard)));
  return ut;
}

/** Senaste rapportfilen i commission/korningar/. */
export function senasteRapporten(rot = ROT) {
  const bas = `${rot}/commission/korningar`;
  if (!existsSync(bas)) return null;
  const filer = [];
  for (const manad of readdirSync(bas)) {
    const mapp = `${bas}/${manad}`;
    let innehall = [];
    try { innehall = readdirSync(mapp); } catch { continue; }
    for (const f of innehall) if (f.endsWith('.json')) filer.push(`${mapp}/${f}`);
  }
  return filer.sort().pop() ?? null;
}

/** Terminalvy — samma ordning som sidan, så de aldrig kan säga olika. */
export function skrivTerminal(l) {
  const kr = (n) => `${n.toLocaleString('sv-SE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kr`;
  console.log(`\nLeaderboard ${l.manad}  ·  ${l.period.fran} – ${l.period.till}`
    + `${l.slutavrakning ? '  (SLUTAVRÄKNING)' : '  (månaden hittills)'}`);
  console.log(`${(l.sats * 100).toFixed(1).replace('.', ',')} % av spenden · ${l.rader.length} redigerare\n`);
  for (const r of l.rader) {
    const pil = r.flytt > 0 ? `▲${r.flytt}` : r.flytt < 0 ? `▼${-r.flytt}` : '–';
    const idag = r.okning === null ? '' : `  i dag ${kr(r.okning)}`;
    console.log(`  ${String(r.plats).padStart(2)}. ${r.namn.padEnd(22)} ${kr(r.spend).padStart(16)}`
      + `  →  ${kr(r.commission).padStart(12)}  ${pil}${idag}`);
  }
  console.log(`      ${'SUMMA'.padEnd(22)} ${kr(l.totalt.spend).padStart(16)}  →  ${kr(l.totalt.commission).padStart(12)}\n`);
}

// -------------------------------------------------------------------- CLI

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const flagga = (n) => {
    const i = args.indexOf(`--${n}`);
    return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null;
  };
  const fil = flagga('rapport') ?? senasteRapporten();
  if (!fil) {
    console.error('✗ Ingen rapport hittad i commission/korningar/. Kör `node commission/run.mjs` först.');
    process.exit(1);
  }
  const rapport = JSON.parse(readFileSync(fil, 'utf8'));
  const l = uppdateraLeaderboard(rapport, rapport.kallor ?? null);
  skrivTerminal(l);
  const sida = byggSida();
  console.log(`Data: commission/leaderboard.json  (ur ${fil.replace(`${ROT}/`, '')})`);
  console.log(`Sida: ${sida.replace(`${ROT}/`, '')}`);
}
