// konkurrenter/arenden.mjs — ärendeminnet: konkurrenter/arenden.jsonl, en rad
// per ändring, senaste raden per id vinner (samma mönster som insatserna och
// kalendern på sajten). Filen committas: ett skickat brev är ett kvitto.
//
// Statusarna och vem som flyttar dem:
//   ny         rutinen hittade kopian — väntar på Axels granskning
//   skickad    Axel godkände (`--skicka <id> --ja`) och brevet gick ut
//   pamind     påminnelsen gick ut (fristen passerad, kopian kvar)
//   atgardad   kopian är borta vid uppföljningen (rutinen mäter, ingen tycker)
//   avfardad   Axel: ingen kopia / inte värt det (`--avfarda <id> "skäl"`)
//   eskalerad  Axel: anmält vidare (Meta/Shopify/ombud) — bara människan sätter den
//
// Rutinen kan ALDRIG flytta ett ärende till skickad själv. Det är hela poängen:
// "Detta måste jag granska först" (Axel 2026-09-27).

import { readFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const MAPP = dirname(fileURLToPath(import.meta.url));
// KONKURRENTER_DATA pekar om ärenden, läge, sida och output till en annan mapp
// (provkörningar och tester) — koden och konfig.json ligger kvar i MAPP.
export const DATAMAPP = process.env.KONKURRENTER_DATA || MAPP;
export const ARENDEFIL = join(DATAMAPP, 'arenden.jsonl');

export const STATUS = Object.freeze({ NY: 'ny', SKICKAD: 'skickad', PAMIND: 'pamind', ATGARDAD: 'atgardad', AVFARDAD: 'avfardad', ESKALERAD: 'eskalerad' });
export const OPPNA = Object.freeze([STATUS.NY, STATUS.SKICKAD, STATUS.PAMIND]);

const TILLATNA = Object.freeze({
  [STATUS.NY]: [STATUS.SKICKAD, STATUS.AVFARDAD],
  [STATUS.SKICKAD]: [STATUS.PAMIND, STATUS.ATGARDAD, STATUS.AVFARDAD, STATUS.ESKALERAD],
  [STATUS.PAMIND]: [STATUS.ATGARDAD, STATUS.AVFARDAD, STATUS.ESKALERAD],
  [STATUS.ATGARDAD]: [],
  [STATUS.AVFARDAD]: [],
  [STATUS.ESKALERAD]: [STATUS.ATGARDAD],
});

/** Alla ärenden ur loggen: Map id → senaste raden. Trasiga rader hoppas med varning. */
export function lasArenden(fil = ARENDEFIL, { logg = () => {} } = {}) {
  const ut = new Map();
  if (!existsSync(fil)) return ut;
  const rader = readFileSync(fil, 'utf8').split('\n').filter((r) => r.trim());
  rader.forEach((rad, i) => {
    try { const a = JSON.parse(rad); if (a?.id) ut.set(a.id, a); } catch { logg(`⚠️ arenden.jsonl rad ${i + 1} går inte att läsa — hoppas`); }
  });
  return ut;
}

/** Skriver en ny rad (hela ärendet) — aldrig en ändring av en gammal rad. */
export function sparaArende(arende, fil = ARENDEFIL, { nu = new Date().toISOString() } = {}) {
  if (!arende?.id || !arende?.status) throw new Error('sparaArende: ärendet saknar id eller status.');
  mkdirSync(dirname(fil), { recursive: true });
  const rad = { ...arende, uppdaterad: nu };
  appendFileSync(fil, `${JSON.stringify(rad)}\n`);
  return rad;
}

/** Nästa id för året: KD-2026-001, KD-2026-002 … Ren. */
export function nyttId(arenden, datum = new Date()) {
  const ar = String(datum instanceof Date ? datum.getUTCFullYear() : datum).slice(0, 4);
  let hogsta = 0;
  for (const id of arenden.keys()) {
    const m = String(id).match(/^KD-(\d{4})-(\d+)$/);
    if (m && m[1] === ar) hogsta = Math.max(hogsta, Number(m[2]));
  }
  return `KD-${ar}-${String(hogsta + 1).padStart(3, '0')}`;
}

/** Nyckeln som säger att två fynd är SAMMA ärende: samma motpart, samma produkt hos oss. Ren. */
export function nyckelFor({ typ = 'webb', doman = null, sidaId = null, handle = null } = {}) {
  const motpart = typ === 'annons' ? `sida:${sidaId ?? doman ?? '?'}` : `doman:${String(doman ?? '?').toLowerCase().replace(/^www\./, '')}`;
  return `${typ}|${motpart}|${handle ?? '?'}`;
}

/** Ärendet med nyckeln, oavsett status (så ett avfärdat inte föds om varje dag). */
export function hittaBefintligt(arenden, nyckel) {
  for (const a of arenden.values()) if (a.nyckel === nyckel) return a;
  return null;
}

/**
 * Flyttar ett ärende till en ny status, med historikrad. Kastar om övergången
 * inte är tillåten — `ny → skickad` går bara via skicka.mjs, som skickar
 * `av: 'axel'` och brevets kvitto.
 */
export function overgang(arende, till, { av = 'rutinen', not = null, nu = new Date().toISOString(), extra = {} } = {}) {
  const fran = arende.status;
  if (!Object.values(STATUS).includes(till)) throw new Error(`Okänd status "${till}".`);
  if (!TILLATNA[fran]?.includes(till)) throw new Error(`Ärendet ${arende.id} kan inte gå från ${fran} till ${till}.`);
  if (till === STATUS.SKICKAD && av !== 'axel') throw new Error(`Bara Axel kan sätta ${arende.id} som skickad — rutinen skickar aldrig själv.`);
  return {
    ...arende,
    ...extra,
    status: till,
    historik: [...(arende.historik ?? []), { nar: nu, fran, till, av, not }],
  };
}

/** Ett nytt ärende ur ett fynd. Ren — skriver inget. */
export function nyttArende({ id, nyckel, verksamhet, typ, var: vart, deras, bevis, styrka, skal, skalEn, brev, nu = new Date().toISOString() }) {
  return {
    id, nyckel, verksamhet, typ, status: STATUS.NY,
    skapad: nu, uppdaterad: nu, senast_sedd: nu, sedd_ganger: 1,
    var: vart, deras, bevis, styrka, skal, skalEn,
    brev: brev ?? null,
    historik: [{ nar: nu, fran: null, till: STATUS.NY, av: 'rutinen', not: null }],
  };
}

/** Samma fynd igen: bevisen uppdateras, räknaren tickar, statusen rörs inte. Ren. */
export function uppdateraFynd(arende, { deras, bevis, styrka, skal, skalEn, nu = new Date().toISOString() }) {
  return { ...arende, deras: { ...arende.deras, ...deras }, bevis, styrka, skal, skalEn, senast_sedd: nu, sedd_ganger: (arende.sedd_ganger ?? 1) + 1 };
}

/** En rad på svenska om ett ärende — för listor och rapporten. Ren. */
export function sammanfatta(a) {
  const motpart = a.typ === 'annons' ? (a.deras?.sidnamn ?? a.deras?.sidaId ?? '?') : (a.deras?.doman ?? '?');
  return `${a.id} · ${a.status.toUpperCase()} · ${a.styrka ?? '?'} · ${a.var?.produkt?.titel ?? a.var?.produkt?.handle ?? '?'} ← ${motpart}${a.skal?.length ? ` · ${a.skal[0]}` : ''}`;
}

/** Öppna ärenden (ny, skickad, pamind), nyast först. */
export function oppna(arenden) {
  return [...arenden.values()].filter((a) => OPPNA.includes(a.status)).sort((a, b) => String(b.skapad).localeCompare(String(a.skapad)));
}
