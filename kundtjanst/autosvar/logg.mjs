// logg.mjs — minnet: en rad per hanterat mejl i kundtjanst/autosvar/logg/<butik>.jsonl.
//
// Loggen är det som gör "max ETT automatiskt svar per tråd, någonsin" sant
// över tid, och det som gör en körning idempotent: ett Message-ID som står
// här rörs aldrig igen. Den committas av rutinen (som sparning/lage.json).
// Andra vakten mot dubbelsvar är brevlådan själv — ett svar från oss i
// tråden (Sent eller Drafts) räknas också, så loggen får försvinna utan att
// en kund får två svar.
//
// Kundadressen står maskerad (ka***@gmail.com). Texten som skickades står
// inte här alls — den finns i Sent.

import { readFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { maskeraAdress } from '../maskera.mjs';

export const LOGGMAPP = join(dirname(fileURLToPath(import.meta.url)), 'logg');

/**
 * Kundens adress som ett kort, oåterkalleligt id (sha256, 12 hex). Loggen
 * bär det i stället för adressen, så "fick den här kunden ett automatiskt
 * svar det senaste dygnet?" går att svara på utan att adressen står i repot.
 */
export function kundHash(adress) {
  const a = String(adress ?? '').trim().toLowerCase();
  return a ? createHash('sha256').update(a, 'utf8').digest('hex').slice(0, 12) : '';
}

export function loggfil(brandId, mapp = LOGGMAPP) {
  return join(mapp, `${String(brandId).replace(/[^a-z0-9_-]/gi, '_')}.jsonl`);
}

/** Alla rader för ett brand (trasiga rader hoppas). */
export function lasLogg(brandId, mapp = LOGGMAPP) {
  const fil = loggfil(brandId, mapp);
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}

/** Lägger en rad. `post` maskeras: kundadress, aldrig lösenord. `tid` är körningens tid när den skickas med. */
export function skrivLogg(brandId, post, mapp = LOGGMAPP) {
  mkdirSync(mapp, { recursive: true });
  const rad = { tid: post.tid ?? new Date().toISOString(), brand: brandId, ...post, kund: maskeraAdress(post.kund ?? '') };
  appendFileSync(loggfil(brandId, mapp), JSON.stringify(rad) + '\n');
  return rad;
}

/**
 * Vad loggen minns: hanterade Message-ID:n, och trådarna som redan fått
 * ett automatiskt svar (på trådnyckel OCH på varje inkommande Message-ID i
 * tråden — så ett senare mejl med References till det första känns igen
 * även om trådnyckeln räknas om).
 */
export function minne(rader = []) {
  const hanterade = new Set();
  const svarade = new Set();
  const svaradeKunder = new Map();   // kundHash → senaste automatiska svarets tid (ms)
  for (const r of rader) {
    if (r.messageId) hanterade.add(r.messageId);
    if (['svar', 'utkast'].includes(r.atgard)) {
      if (r.tradnyckel) svarade.add(r.tradnyckel);
      if (r.messageId) svarade.add(r.messageId);
      for (const id of r.tradIds ?? []) svarade.add(id);
      const t = Date.parse(r.tid ?? '');
      if (r.kundHash && Number.isFinite(t)) svaradeKunder.set(r.kundHash, Math.max(t, svaradeKunder.get(r.kundHash) ?? 0));
    }
  }
  return { hanterade, svarade, svaradeKunder };
}

/** Fick kunden ett automatiskt svar inom `timmar`? (Två svar på en förmiddag låter som en robot.) */
export function kundNyssSvarad(minnet, hash, { nu = Date.now(), timmar = 24 } = {}) {
  const t = minnet?.svaradeKunder?.get(hash);
  return Number.isFinite(t) && nu - t < timmar * 3_600_000;
}

/** Skriver in ett svar i minnet under körningen — så nästa mejl i samma tråd eller från samma kund ser det direkt. */
export function minnsSvar(minnet, { tradnyckel = null, ids = [], hash = '', nu = Date.now() } = {}) {
  if (tradnyckel) minnet.svarade.add(tradnyckel);
  for (const id of ids) if (id) minnet.svarade.add(id);
  if (hash) minnet.svaradeKunder.set(hash, nu);
}

/** Har tråden (nyckel eller något av dess Message-ID:n/References) redan fått ett automatiskt svar? */
export function redanAutosvar(minnet, { tradnyckel = null, ids = [] } = {}) {
  if (tradnyckel && minnet.svarade.has(tradnyckel)) return true;
  return ids.some((id) => minnet.svarade.has(id));
}
