#!/usr/bin/env node
// oversikt.mjs — autosvarets logg som siffror, för en dashboard eller en
// rapport. Läser bara loggen (kundtjanst/autosvar/logg/<butik>.jsonl),
// rör aldrig brevlådan, Shopify eller nätet. Datakontraktet står i
// kundtjanst/autosvar/DASHBOARD.md.
//
//   node kundtjanst/autosvar/oversikt.mjs --brand baverbutiken            svensk tabell
//   node kundtjanst/autosvar/oversikt.mjs --alla --dagar 30 --json        { [butik]: översikt } på stdout
//
// Loggen har en rad per mejl och KÖRNING — samma mejl kan stå flera gånger
// (kalibreringar med --igen, eller ett mejl som prövats igen). Här vinner
// den senaste raden per Message-ID, precis som i logg-maskera.mjs.

import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { lasLogg, LOGGMAPP } from './logg.mjs';
import { orsakEn } from './rapport.mjs';

const DAG = 86_400_000;
export const HINKAR = ['ENKEL', 'ARG', 'SVÅR', 'SKIP'];

/**
 * Ärendets nyckel för en dashboard som ska kunna bocka av ett botsvar
 * (stonebite/uppfoljning.mjs): sha256 av Message-ID, 16 hex — stabil när
 * mejlet flyttas (uid:t byts då), och bär varken adressen eller domänen.
 * Utan Message-ID samma reserv som senastePerMejl: uid|tid. Ren.
 */
export function fallNyckel(r = {}) {
  if (r.messageId) return createHash('sha256').update(String(r.messageId)).digest('hex').slice(0, 16);
  return `${r.uid ?? '?'}|${r.tid ?? ''}`;
}

/** Senaste raden per Message-ID (eller uid|tid utan id), sorterade på tid. Ren. */
export function senastePerMejl(rader = []) {
  const per = new Map();
  for (const r of rader) {
    if (!r || typeof r !== 'object') continue;
    const nyckel = r.messageId || `${r.uid}|${r.tid}`;
    const forra = per.get(nyckel);
    if (!forra || String(r.tid ?? '') >= String(forra.tid ?? '')) per.set(nyckel, r);
  }
  return [...per.values()].sort((a, b) => String(a.tid ?? '').localeCompare(String(b.tid ?? '')));
}

function rakna(lista, nyckel) {
  const ut = {};
  for (const r of lista) {
    const k = String(r[nyckel] ?? '') || '–';
    ut[k] = (ut[k] ?? 0) + 1;
  }
  return ut;
}

const svarad = (r) => ['svar', 'utkast'].includes(r.atgard);

/**
 * Översikten för ett brand ur dess loggrader. Ren.
 * `dagar` = fönstret bakåt från `nu`. Kundadresser är redan maskerade i loggen
 * och maskeras aldrig upp här.
 */
export function oversikt(rader = [], { nu = new Date(), dagar = 30 } = {}) {
  const nuMs = nu instanceof Date ? nu.getTime() : Number(nu);
  const sedan = nuMs - dagar * DAG;
  const iFonstret = (r) => r && r.tid && new Date(r.tid).getTime() >= sedan && new Date(r.tid).getTime() <= nuMs + DAG;
  const alla = senastePerMejl(rader).filter(iFonstret);
  // Körningarna räknas på råraderna: en kalibrering som omprövat alla mejl är
  // fortfarande en körning, även om ingen av dess rader är den senaste.
  const korningar = [...new Set(rader.filter(iFonstret).map((r) => r.tid))].sort();
  const arenden = alla.filter((r) => r.hink !== 'SKIP');
  const perHink = Object.fromEntries(HINKAR.map((h) => [h, 0]));
  for (const r of alla) perHink[r.hink] = (perHink[r.hink] ?? 0) + 1;

  const dagMap = new Map();
  for (const r of alla) {
    const d = String(r.tid).slice(0, 10);
    if (!dagMap.has(d)) dagMap.set(d, { datum: d, mejl: 0, ENKEL: 0, ARG: 0, 'SVÅR': 0, SKIP: 0, svar: 0, utkast: 0, flaggade: 0 });
    const rad = dagMap.get(d);
    rad.mejl++;
    rad[r.hink] = (rad[r.hink] ?? 0) + 1;
    if (r.atgard === 'svar') rad.svar++;
    if (r.atgard === 'utkast') rad.utkast++;
    if (r.flaggad) rad.flaggade++;
  }

  const kompakt = (r) => ({
    nyckel: fallNyckel(r),
    tid: r.tid, uid: r.uid ?? null, hink: r.hink, typ: r.typ ?? null, kategori: r.kategori ?? null,
    ordernummer: Array.isArray(r.ordernummer) ? r.ordernummer : [], kund: r.kund ?? '', sprak: r.sprak ?? null,
    amne: String(r.amne ?? '').slice(0, 80), kontaktformular: Boolean(r.kontaktformular),
    atgard: r.atgard ?? null, torr: Boolean(r.torr), flaggad: Boolean(r.flaggad), flyttad: r.flyttad ?? null,
    fotonTyp: r.fotonTyp ?? null,
    orsak: r.orsak ?? '', orsakEn: orsakEn(r),
  });

  // ARG-raden bär också vad det arga svaret innehöll: X, spårningsläget, returblocket,
  // "opostad i N dagar", bildförfrågan (fotonTyp sätts bara när svaret bad om bilder) och
  // frågan efter ordernumret — så en dashboard kan säga VA:n exakt vad kunden redan fått.
  const arga = alla.filter((r) => r.hink === 'ARG').map((r) => ({ ...kompakt(r), x: r.x ?? null, lage: Boolean(r.lage), retur: Boolean(r.retur), opostadDagar: r.opostadDagar ?? null, foton: Boolean(r.fotonTyp), behoverOrdernummer: Boolean(r.behoverOrdernummer) })).reverse();
  const svarade = alla.filter(svarad).map(kompakt).reverse();
  const tillVa = alla.filter((r) => r.flaggad && !svarad(r)).map(kompakt).reverse();
  const fel = alla.filter((r) => r.atgard === 'fel').map((r) => ({ ...kompakt(r), fel: r.fel ?? '' })).reverse();

  return {
    brand: alla[0]?.brand ?? rader[0]?.brand ?? null,
    period: { fran: new Date(sedan).toISOString(), till: new Date(nuMs).toISOString(), dagar },
    senasteKorning: korningar.at(-1) ?? null,
    antalKorningar: korningar.length,
    antal: {
      mejl: alla.length, arenden: arenden.length, ...perHink,
      svar: alla.filter((r) => r.atgard === 'svar').length,
      utkast: alla.filter((r) => r.atgard === 'utkast').length,
      flaggade: alla.filter((r) => r.flaggad).length,
      tillVa: tillVa.length,
      fel: fel.length,
      kontaktformular: alla.filter((r) => r.kontaktformular).length,
    },
    perTyp: rakna(alla.filter((r) => r.typ), 'typ'),
    perKategori: rakna(arenden, 'kategori'),
    perSprak: rakna(arenden, 'sprak'),
    perAtgard: rakna(alla, 'atgard'),
    perDag: [...dagMap.values()].sort((a, b) => a.datum.localeCompare(b.datum)),
    arga, svarade, tillVa, fel,
  };
}

/** Svensk tabell för terminalen. Ren. */
export function renderaOversikt(o) {
  const a = o.antal;
  const rader = [
    `${o.brand ?? '?'} — senaste ${o.period.dagar} dagarna (${o.antalKorningar} körningar, senaste ${o.senasteKorning ?? '–'})`,
    `  mejl ${a.mejl} · ärenden ${a.arenden} · ENKEL ${a.ENKEL} · ARG ${a.ARG} · SVÅR ${a['SVÅR']} · hoppade ${a.SKIP}`,
    `  svar ${a.svar} · utkast ${a.utkast} · flaggade ${a.flaggade} · till VA:n utan svar ${a.tillVa} · fel ${a.fel} · kontaktformulär ${a.kontaktformular}`,
  ];
  if (Object.keys(o.perTyp).length) rader.push(`  typer: ${Object.entries(o.perTyp).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  for (const d of o.perDag) rader.push(`  ${d.datum}  mejl ${String(d.mejl).padStart(3)}  ENKEL ${d.ENKEL}  ARG ${d.ARG}  SVÅR ${d['SVÅR']}  svar ${d.svar}  utkast ${d.utkast}`);
  for (const r of o.arga.slice(0, 10)) rader.push(`  ARG ${r.tid.slice(0, 16)}  ${r.ordernummer[0] ? `#${r.ordernummer[0]}` : '—'}  ${r.kund}  ${r.x ?? ''}  ${r.atgard}`);
  return rader.join('\n');
}

export async function huvud(argv = process.argv.slice(2)) {
  const val = (n, std = null) => { const i = argv.indexOf(`--${n}`); return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : std; };
  const finns = (n) => argv.includes(`--${n}`);
  const dagar = Number(val('dagar', 30)) || 30;
  const mapp = val('loggmapp', LOGGMAPP);
  let brands = [];
  if (val('brand')) brands = [val('brand')];
  else {
    const { upptackBrands } = await import('../brands.mjs');
    brands = upptackBrands().map((b) => b.id);
  }
  const ut = {};
  for (const id of brands) {
    const rader = lasLogg(id, mapp);
    if (!rader.length && !val('brand')) continue;
    ut[id] = oversikt(rader, { dagar });
  }
  if (finns('json')) console.log(JSON.stringify(ut, null, 2));
  else for (const o of Object.values(ut)) console.log(renderaOversikt(o) + '\n');
  return ut;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
