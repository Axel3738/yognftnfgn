#!/usr/bin/env node
// leaderboard.mjs — gör om en commission-körning till en daglig topplista.
//
// Commission-rapporten är ett kvitto: den räknar pengar och skrivs bara på
// kördagar. Leaderboarden är motsatsen — den uppdateras EN gång per dygn, visar
// månaden hittills och öppnas på mobil av redigerarna i Manila.
//
//   node commission/leaderboard.mjs                 bygg ur senaste rapporten
//   node commission/leaderboard.mjs --rapport <fil> bygg ur en viss rapport
//
// TVÅ REGLER SOM STYR ALLT HÄR (Axels beslut 2026-09-02):
//  1. Spend visas aldrig — varken totalt eller per person. Topplistan handlar
//     om vad redigeraren tjänat, inget annat.
//  2. Beloppen står i USD. Kursen hämtas från ECB via commission/valuta.mjs,
//     aldrig ur huvudet, och sidan visar vilken dag kursen gäller.
//
// Perioden är kalendermånaden och nollställs av sig själv vid månadsskiftet:
// september räknas från 1 september, oktober börjar om på noll den 1 oktober.
//
// Två filer skrivs:
//   commission/leaderboard.json          — datan som läggs upp på sidan
//   commission/leaderboard-historik.json — en rad per dygn, ger dagens ökning

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { hamtaKurs, tillUsd } from './valuta.mjs';

const ROT = resolve(new URL('..', import.meta.url).pathname);
export const DATAFIL = `${ROT}/commission/leaderboard.json`;
export const HISTORIKFIL = `${ROT}/commission/leaderboard-historik.json`;

/** Så många dygn historik som sparas — en månad räcker för sidans kurvor. */
export const HISTORIKDAGAR = 40;

const sek = (karta) => Number(karta?.SEK ?? 0);
const avrunda = (tal) => Math.round(tal * 100) / 100;

/**
 * Redigerarens commission per kampanj. Kampanjnamnet är det närmaste vi kommer
 * "vilken produkt" utan att slå upp något nytt. Beloppen är commission, aldrig
 * spend — spenden lämnar aldrig rapporten.
 */
export function toppkampanjer(annonser = [], sats, kurs, antal = 3) {
  const per = new Map();
  for (const a of annonser) {
    const namn = String(a.kampanj ?? a.hubb ?? '').trim() || '—';
    per.set(namn, (per.get(namn) ?? 0) + (a.spend ?? 0));
  }
  return [...per.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, antal)
    .map(([namn, spend]) => ({ namn, usd: tillUsd(spend * sats, kurs) }));
}

/** Annonsen som gett mest commission — den som bär personens månad. */
export function bastaAnnons(annonser = [], sats, kurs) {
  const b = [...annonser].sort((a, b2) => (b2.spend ?? 0) - (a.spend ?? 0))[0];
  return b ? { namn: b.adNamn, usd: tillUsd((b.spend ?? 0) * sats, kurs) } : null;
}

/**
 * Historiken är kumulativ commission per dygn och person, i USD. Dagens ökning
 * är skillnaden mot föregående dygn I SAMMA MÅNAD — den 1:a är hela dagen, för
 * då nollställs perioden.
 */
export function dagensOkning(historik, manad, datum, id, usdNu) {
  const tidigare = historik
    .filter((h) => h.manad === manad && h.datum < datum)
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .pop();
  if (!tidigare) return null;
  return avrunda(usdNu - Number(tidigare.per?.[id] ?? 0));
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
 * @param {object} opt
 * @param {{kurs:number,datum:string,gammal:boolean}} opt.valuta  Kursen SEK→USD.
 * @param {Array}  [opt.historik]  Tidigare dygnsmätningar.
 * @param {object} [opt.kallor]    Källorna från run.mjs (hubbar, konton).
 */
export function byggLeaderboard(rapport, { valuta, historik = [], kallor = null }) {
  if (!valuta?.kurs) throw new Error('Ingen växelkurs — topplistan får aldrig visa gissade dollar.');
  const kurs = valuta.kurs;
  const sats = rapport.sats;
  const datum = rapport.period.till;
  const manad = rapport.period.manad;

  const rader = rapport.redigerare
    .map((e) => ({
      id: e.id,
      namn: e.namn,
      usd: tillUsd(sek(e.commission), kurs),
      annonser: (e.annonser ?? []).length,
      kampanjer: toppkampanjer(e.annonser, sats, kurs),
      basta: bastaAnnons(e.annonser, sats, kurs),
    }))
    .sort((a, b) => b.usd - a.usd)
    .map((r, i) => ({ plats: i + 1, ...r }));

  for (const r of rader) {
    r.okning = dagensOkning(historik, manad, datum, r.id, r.usd);
    r.forraPlats = forraPlatsen(historik, datum, r.id);
    r.flytt = r.forraPlats === null ? 0 : r.forraPlats - r.plats;
  }

  const obetald = {
    utanAnsvarig: tillUsd(sek(rapport.utanMottagare?.commission), kurs),
    okanda: tillUsd((rapport.okandaAnsvariga ?? []).reduce((s, o) => s + sek(o.commission), 0), kurs),
    ejRedigerare: (rapport.ejRedigerare ?? []).map((p) => ({
      namn: p.namn, roll: p.roll, usd: tillUsd(sek(p.commission), kurs),
    })),
    konflikter: (rapport.konflikter ?? []).length,
  };

  return {
    uppdaterad: new Date().toISOString(),
    kord: rapport.kord,
    manad,
    period: { fran: rapport.period.fran, till: rapport.period.till },
    slutavrakning: Boolean(rapport.period.heltMatad),
    sats,
    valuta: { kod: 'USD', kurs, datum: valuta.datum, gammal: Boolean(valuta.gammal) },
    rader,
    totalt: {
      usd: tillUsd(sek(rapport.totalt?.commission), kurs),
      annonser: rader.reduce((s, r) => s + r.annonser, 0),
      redigerare: rader.length,
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

/** Dygnets mätning, som den sparas i historiken. En rad per dygn. */
export function dagsrad(leaderboard) {
  return {
    datum: leaderboard.period.till,
    manad: leaderboard.manad,
    valuta: 'USD',
    per: Object.fromEntries(leaderboard.rader.map((r) => [r.id, r.usd])),
    platser: Object.fromEntries(leaderboard.rader.map((r) => [r.id, r.plats])),
  };
}

/** Lägger dygnets rad i historiken. Samma datum skrivs över, aldrig dubbleras. */
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
    // Historiken bar kronor och spend före 2026-09-02. De raderna går inte att
    // jämföra med dollarraderna och kastas hellre än blandas ihop.
    return Array.isArray(data?.dagar) ? data.dagar.filter((d) => d.valuta === 'USD') : [];
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
export async function uppdateraLeaderboard(rapport, kallor = null,
  { datafil = DATAFIL, historikfil = HISTORIKFIL, valuta = null } = {}) {
  const kurs = valuta ?? await hamtaKurs();
  const historik = lasHistorik(historikfil);
  const leaderboard = byggLeaderboard(rapport, { valuta: kurs, historik, kallor });
  const dagar = laggIHistorik(historik, dagsrad(leaderboard));
  skriv(historikfil, { uppdaterad: leaderboard.uppdaterad, valuta: 'USD', dagar });
  skriv(datafil, leaderboard);
  return leaderboard;
}

/**
 * Bakar in dagens data i sidmallen och skriver den publicerbara filen.
 * Sidan hämtar sin data live ur artifact-databasen; den inbäddade kopian är
 * bara reservläget, så att sidan aldrig står tom.
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
  const usd = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  console.log(`\nTopplista ${l.manad}  ·  ${l.period.fran} – ${l.period.till}`
    + `${l.slutavrakning ? '  (SLUTAVRÄKNING)' : '  (månaden hittills)'}`);
  console.log(`Commission i USD · kurs ${l.valuta.kurs} (${l.valuta.datum})`
    + `${l.valuta.gammal ? ' — sparad kurs, nätet svarade inte' : ''}\n`);
  for (const r of l.rader) {
    const pil = r.flytt > 0 ? `▲${r.flytt}` : r.flytt < 0 ? `▼${-r.flytt}` : '–';
    const idag = r.okning === null ? '' : `  i dag ${usd(r.okning)}`;
    console.log(`  ${String(r.plats).padStart(2)}. ${r.namn.padEnd(22)} ${usd(r.usd).padStart(12)}`
      + `  ${r.annonser} annonser  ${pil}${idag}`);
  }
  console.log(`      ${'SUMMA'.padEnd(22)} ${usd(l.totalt.usd).padStart(12)}\n`);
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
  const l = await uppdateraLeaderboard(rapport, rapport.kallor ?? null);
  skrivTerminal(l);
  const sida = byggSida();
  console.log(`Data: commission/leaderboard.json  (ur ${fil.replace(`${ROT}/`, '')})`);
  console.log(`Sida: ${sida.replace(`${ROT}/`, '')}`);
}
