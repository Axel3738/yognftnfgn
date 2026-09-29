// akut/minne.mjs — larmets minne: vad som redan postats i #urgent, vilka
// butiker som är i drift, och när körningen senast gick.
//
// Utan minne hade "sajten är nere" postats varje timme tills den kom upp —
// och då slutar någon läsa. Samma regel som stonebite/larm.mjs: EN gång per
// ärende. Filen committas av rutinen (akut/data/larm.json), så minnet
// överlever containern.
//
// Två slags larm:
//   tillstånd — sajten nere, kontot avstängt, rutinen står still. Nyckeln är
//               stabil (butik:baverbutiken) och larmet får ett "✅ Löst" när
//               kontrollen ser att det är över. Först då kan nyckeln larma igen.
//   händelse  — pengar brinner i dag, pixeln såg noll köp i dag, tvistgraden
//               den här veckan. Nyckeln bär datumet, så nästa dag är ett nytt larm.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const DAG = 86_400_000;

/** Larmtyper som är tillstånd (kan lösas). Allt annat är händelser. */
export const TILLSTAND = Object.freeze(['butik', 'konto', 'spendcap', 'backend', 'rutin', 'nyckel']);
export const arTillstand = (typ) => TILLSTAND.includes(typ);

export function minnesfil(rot) { return join(rot, 'akut', 'data', 'larm.json'); }

/** { skickade: [{ nyckel, typ, verksamhet, rubrik, tid, lost, text }], butiker: { id: { namn, url, senastOk, ordrar7d } }, senasteKorning } */
export function lasMinne(rot) {
  const tomt = { skickade: [], butiker: {}, senasteKorning: null };
  const fil = minnesfil(rot);
  if (!existsSync(fil)) return tomt;
  try {
    const d = JSON.parse(readFileSync(fil, 'utf8'));
    return {
      skickade: Array.isArray(d.skickade) ? d.skickade : [],
      butiker: d.butiker && typeof d.butiker === 'object' ? d.butiker : {},
      senasteKorning: d.senasteKorning ?? null,
    };
  } catch {
    return tomt;
  }
}

export function sparaMinne(minne, rot) {
  const fil = minnesfil(rot);
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, `${JSON.stringify({
    uppdaterad: new Date().toISOString(),
    senasteKorning: minne.senasteKorning ?? null,
    butiker: minne.butiker ?? {},
    skickade: minne.skickade ?? [],
  }, null, 1)}\n`);
  return fil;
}

/**
 * Glöm gamla rader — men ALDRIG ett tillstånd som fortfarande pågår (lost
 * är null): det larmet skulle annars postas igen efter 30 dagar fast inget
 * förändrats. Ren.
 */
export function rensa(skickade = [], { nu = new Date(), dagar = 30 } = {}) {
  const grans = nu.getTime() - dagar * DAG;
  return skickade.filter((s) => {
    if (arTillstand(s.typ) && !s.lost) return true;
    const tid = new Date(s.lost ?? s.tid ?? 0).getTime();
    return tid >= grans;
  });
}

/** Är larmet redan postat och fortfarande "levande"? Händelser: finns nyckeln alls. Tillstånd: finns den olöst. */
export function redanPostat(skickade = [], larm) {
  return skickade.some((s) => s.nyckel === larm.nyckel && (!arTillstand(larm.typ) || !s.lost));
}

/** De tillstånd som är postade och ännu inte lösta. */
export function olosta(skickade = []) {
  return skickade.filter((s) => arTillstand(s.typ) && !s.lost);
}

/** Skriv in ett postat larm. Ett tillstånd som redan står olöst dubbleras aldrig. */
export function markeraPostat(minne, larm, { nu = new Date(), text = null } = {}) {
  if (redanPostat(minne.skickade, larm)) return minne;
  minne.skickade.push({
    nyckel: larm.nyckel, typ: larm.typ, verksamhet: larm.verksamhet ?? null, rubrik: larm.rubrik ?? null,
    tid: nu.toISOString(), lost: null, text: text ?? null,
  });
  return minne;
}

/** Markera ett tillstånd som löst (postat "✅ Löst"). */
export function markeraLost(minne, nyckel, { nu = new Date() } = {}) {
  for (const s of minne.skickade) {
    if (s.nyckel === nyckel && !s.lost) s.lost = nu.toISOString();
  }
  return minne;
}

/**
 * Butiker i drift: de som hade minst en order de senaste sju dygnen i
 * snapshoten. Det är dem sajtkollen mäter — en nedlagd OPS-butik utan
 * ordrar är inte akut för att dess domän svarar 404. Ren.
 */
export function butikerIDrift(butiker = [], { byggd = null, nu = new Date(), minOrdrar = 1 } = {}) {
  const ut = {};
  const grans = nu.getTime() - 7 * DAG;
  for (const b of butiker) {
    if (b.status !== 'ok') continue;
    const ordrar7d = (b.dagar ?? []).filter((d) => Date.parse(`${d.datum}T12:00:00Z`) >= grans)
      .reduce((s, d) => s + (Number(d.ordrar) || 0), 0);
    if (ordrar7d < minOrdrar) continue;
    ut[b.id] = { namn: b.namn ?? b.id, url: b.url ?? '', shop: b.shop ?? '', senastOk: byggd ?? nu.toISOString(), ordrar7d };
  }
  return ut;
}

/** Minnets butiker + snapshotens, snapshotens rad vinner. Rader äldre än `dagar` glöms. */
export function slaIhopButiker(minneButiker = {}, nya = {}, { nu = new Date(), dagar = 14 } = {}) {
  const grans = nu.getTime() - dagar * DAG;
  const ut = {};
  for (const [id, b] of Object.entries({ ...minneButiker, ...nya })) {
    if (!b?.senastOk || Date.parse(b.senastOk) < grans) continue;
    ut[id] = b;
  }
  return ut;
}
