// kontakter.mjs — influencers, UGC-kreatörer och leverantörer per varumärke.
//
// Axels beställning 2026-09-22: "en flik i varje brand där det är kontakt med
// influencers och kontakt med UGC-kreatörer … leverantörsinformation".
// Ett register, inte ett CRM: namn, var de finns, var i samtalet vi är, och
// nästa steg med datum. Nästa steg dyker upp i varumärkets kalender av sig
// självt, så ingen uppföljning glöms.
//
// Lagras som jsonl i dataspegeln (volymen i drift), samma mönster som
// insatser och kalender: senaste raden per id vinner, radering = raderad: true.

import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { datamapp } from '../bonus/kor.mjs';

export const KONTAKTER = join(datamapp(), 'kontakter.jsonl');

export const TYPER = Object.freeze({
  influencer: { sv: 'Influencer', en: 'Influencer' },
  ugc: { sv: 'UGC-kreatör', en: 'UGC creator' },
  leverantor: { sv: 'Leverantör', en: 'Supplier' },
  partner: { sv: 'Partner', en: 'Partner' },
  annat: { sv: 'Annat', en: 'Other' },
});

/** Stegen i ordning. `aktiv` = syns i uppföljningen. */
export const STATUSAR = Object.freeze([
  { id: 'att_kontakta', sv: 'Att kontakta', en: 'To contact', aktiv: true },
  { id: 'kontaktad', sv: 'Kontaktad', en: 'Contacted', aktiv: true },
  { id: 'svarat', sv: 'Har svarat', en: 'Replied', aktiv: true },
  { id: 'avtal', sv: 'Avtal klart', en: 'Agreed', aktiv: true },
  { id: 'levererat', sv: 'Levererat', en: 'Delivered', aktiv: false },
  { id: 'nej', sv: 'Nej / inaktuell', en: 'No / inactive', aktiv: false },
]);

export function lasKontakter(fil = KONTAKTER) {
  if (!existsSync(fil)) return [];
  const senaste = new Map();
  for (const rad of readFileSync(fil, 'utf8').split('\n')) {
    if (!rad.trim()) continue;
    try {
      const k = JSON.parse(rad);
      if (k?.id) senaste.set(k.id, k);
    } catch { /* trasig rad hoppas över */ }
  }
  return [...senaste.values()].filter((k) => !k.raderad);
}

export function skrivKontakt(k, fil = KONTAKTER) {
  mkdirSync(dirname(fil), { recursive: true });
  appendFileSync(fil, `${JSON.stringify(k)}\n`);
  return k;
}

/** Ny kontakt ur formuläret. Kastar vid tomt namn eller okänt varumärke. */
export function nyKontakt({ brand, namn, typ = 'influencer', plattform = '', lank = '', kontakt = '', status = 'att_kontakta', nastaSteg = '', nastaDatum = '', anteckning = '', skapadAv = null, nu = new Date() }) {
  const n = String(namn ?? '').trim();
  if (!n) throw new Error('Skriv ett namn.');
  if (!brand) throw new Error('Kontakten måste höra till ett varumärke.');
  if (nastaDatum && !/^\d{4}-\d{2}-\d{2}$/.test(nastaDatum)) throw new Error('Datumet måste vara ÅÅÅÅ-MM-DD.');
  return {
    id: randomUUID(),
    brand,
    namn: n.slice(0, 120),
    typ: TYPER[typ] ? typ : 'annat',
    plattform: String(plattform ?? '').slice(0, 60),
    lank: saneraLank(lank),
    kontakt: String(kontakt ?? '').slice(0, 200),
    status: STATUSAR.some((s) => s.id === status) ? status : 'att_kontakta',
    nastaSteg: String(nastaSteg ?? '').slice(0, 200),
    nastaDatum: nastaDatum || '',
    anteckning: String(anteckning ?? '').slice(0, 2000),
    skapad: nu.toISOString(),
    uppdaterad: nu.toISOString(),
    skapadAv: skapadAv || null,
  };
}

/** Uppdaterar status/nästa steg på en befintlig kontakt — ny rad, samma id. */
export function uppdateraKontakt(befintlig, andringar, nu = new Date()) {
  const ny = { ...befintlig, uppdaterad: nu.toISOString() };
  if (andringar.status && STATUSAR.some((s) => s.id === andringar.status)) ny.status = andringar.status;
  if (andringar.nastaSteg !== undefined) ny.nastaSteg = String(andringar.nastaSteg).slice(0, 200);
  if (andringar.nastaDatum !== undefined) {
    if (andringar.nastaDatum && !/^\d{4}-\d{2}-\d{2}$/.test(andringar.nastaDatum)) throw new Error('Datumet måste vara ÅÅÅÅ-MM-DD.');
    ny.nastaDatum = andringar.nastaDatum;
  }
  if (andringar.anteckning !== undefined) ny.anteckning = String(andringar.anteckning).slice(0, 2000);
  if (andringar.raderad) ny.raderad = true;
  return ny;
}

/** Bara http(s)-länkar släpps igenom — allt annat blir tomt. */
function saneraLank(lank) {
  const l = String(lank ?? '').trim();
  if (!l) return '';
  try {
    const u = new URL(l.startsWith('http') ? l : `https://${l}`);
    return ['http:', 'https:'].includes(u.protocol) ? u.toString() : '';
  } catch { return ''; }
}

export function statusnamn(id, sprak = 'sv') {
  return STATUSAR.find((s) => s.id === id)?.[sprak] ?? id;
}

export function typnamn(id, sprak = 'sv') {
  return TYPER[id]?.[sprak] ?? id;
}
