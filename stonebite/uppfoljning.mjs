// uppfoljning.mjs — VA:ns bock på AI-botens svar.
//
// Axel 2026-09-23: Mechile svarade Micke Stigberg 15:28 utan att veta att
// boten redan svarat honom 13:42 — hon såg det inte på sidan. "Inget att
// interagera med eller markera som hanterade eller svarade på eller
// uppföljda. Ska man markera AI-bot-cases som uppföljda, och då arkiveras de."
//
// Det här är minnet för den bocken: en rad per tryck, jsonl på volymen,
// senaste raden per nyckel vinner — samma mönster som kalendern och
// insatserna. Nyckeln är loggradens `nyckel` (kundtjanst/autosvar/oversikt.mjs
// → fallNyckel: sha256 av Message-ID, aldrig adressen), så bocken överlever
// att mejlet flyttas och att loggen läses om.
//
// Botens egen logg rörs ALDRIG härifrån (kundtjanst/autosvar/DASHBOARD.md →
// "Rör inte"): den är botens minne "ett svar per tråd, någonsin".

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { datamapp } from '../bonus/kor.mjs';

export const UPPFOLJNING = join(datamapp(), 'autosvar-uppfoljning.jsonl');

/** Nyckeln ur loggöversikten: 16 hex, eller reserven uid|tid. Inget annat släpps in i filen. */
export function giltigNyckel(nyckel) {
  const n = String(nyckel ?? '').trim();
  return n.length > 0 && n.length <= 120 && /^[\w|:.+-]+$/.test(n);
}

/** Senaste raden per nyckel. Map nyckel → { nyckel, brand, order, uppfoljd, tid, av }. */
export function lasUppfoljning(fil = UPPFOLJNING) {
  const senaste = new Map();
  if (!existsSync(fil)) return senaste;
  for (const rad of readFileSync(fil, 'utf8').split('\n')) {
    if (!rad.trim()) continue;
    try {
      const r = JSON.parse(rad);
      if (r?.nyckel) senaste.set(r.nyckel, r);
    } catch { /* trasig rad hoppas över */ }
  }
  return senaste;
}

/**
 * Lägger en bock (uppfoljd: true) eller tar tillbaka den (false). Kastar på en
 * nyckel som inte ser ut som loggens — sidan visar felet, filen förblir ren.
 */
export function skrivUppfoljning({ nyckel, brand = null, order = null, uppfoljd = true, av = null, nu = new Date() } = {}, fil = UPPFOLJNING) {
  if (!giltigNyckel(nyckel)) throw new Error('Ärendet saknar nyckel. Ladda om sidan och försök igen.');
  const rad = {
    nyckel: String(nyckel).trim(),
    brand: brand ? String(brand).slice(0, 60) : null,
    order: order ? String(order).slice(0, 40) : null,
    uppfoljd: Boolean(uppfoljd),
    tid: nu.toISOString(),
    av: av ? String(av).slice(0, 120) : null,
  };
  mkdirSync(dirname(fil), { recursive: true });
  appendFileSync(fil, `${JSON.stringify(rad)}\n`);
  return rad;
}
