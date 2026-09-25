// kommentarer/koppla.mjs — vilken verksamhet, produkt, vinkel och format en
// kommentar hör till. Rena funktioner + en läsning av repots register.
//
// Verksamheten avgörs i den här ordningen (konfig.json är facit):
//   1. Landningslänkens domän (carashell.se → CaraShell, baverbutiken.se → Bäverbutiken).
//      Det är där köpet bokförs, så det är den som räknas.
//   2. Facebook-sidan (första ledet i inläggets id).
//   3. Kampanjnamnet (CARASHELL_… i ett delat konto).
//   4. Kontots standard.
// Säger domänen och sidan olika saker är det en KONFLIKT, och den rapporteras —
// en CaraShell-annons på Bäverbutikens sida är fel sida/pixel, inte en tolkningsfråga.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Värdnamnet utan www och port, små bokstäver. Ren. */
export function vardUrLank(lank) {
  try { return new URL(lank).hostname.toLowerCase().replace(/^www\./, ''); } catch { return null; }
}

/** Produktens handle eller sidans slug ur länken. Ren. */
export function handleUrLank(lank) {
  try {
    const u = new URL(lank);
    const m = u.pathname.match(/\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?(products|pages|collections)\/([^/?#]+)/i);
    return m ? { typ: m[1].toLowerCase(), handle: decodeURIComponent(m[2]).toLowerCase() } : null;
  } catch { return null; }
}

/** Länken utan frågeparametrar (utm, fbclid) — det som skrivs i loggen. Ren. */
export function rensaLank(lank) {
  try { const u = new URL(lank); return `${u.origin}${u.pathname}`; } catch { return lank ?? null; }
}

/** Marknaden ur språkprefixet i sökvägen: carashell.se/nb/… är Norge. Ren. */
export function marknadUrSokvag(lank) {
  try {
    const m = new URL(lank).pathname.match(/^\/(nb|no|da|fi|en|sv)(?:-[a-z]{2})?\//i);
    return m ? ({ nb: 'NO', no: 'NO', da: 'DK', fi: 'FI', en: 'US', sv: 'SE' })[m[1].toLowerCase()] : null;
  } catch { return null; }
}

const MARKNADER = new Set(['SE', 'NO', 'DK', 'FI', 'US', 'UK', 'GB', 'CA', 'AU', 'NZ', 'DE']);
// DE är en marknad i kampanjnamn men en vinkel (demo) i annonsnamn — se nedan.

/** Å/ä/ö → a/a/o så att Motorhölje_ och Motorholje_ blir samma prefix. Ren. */
export function normaliseraPrefix(s) {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ø/gi, 'o').replace(/æ/gi, 'ae').toLowerCase();
}

/**
 * Annonsnamnet i delar. Ren. Klarar Takoverdrag_PD_10_H1, CaraShellRoof_NO_PD_106_H1,
 * DryTrek_Damasker_PD_14_1, Solcellslampa_SP_3, Motorhölje_OB_2_C1.
 * @returns {{ prefix, vinkel, format, marknad, nr }}
 */
export function tolkaAnnonsnamn(namn) {
  const delar = String(namn ?? '').trim().split('_').filter(Boolean);
  if (!delar.length) return { prefix: null, vinkel: null, format: null, marknad: null, nr: null };
  const prefix = delar[0];
  let marknad = null;
  let vinkel = null;
  let nr = null;
  for (let i = 1; i < delar.length; i++) {
    const d = delar[i];
    if (!marknad && i <= 2 && MARKNADER.has(d) && d !== 'DE') { marknad = d === 'GB' ? 'UK' : d; continue; }
    if (!vinkel && /^[A-Z]{1,4}$/.test(d)) { vinkel = d === 'G' ? 'GT' : d; continue; }
    if (vinkel && nr === null && /^\d+$/.test(d)) { nr = Number(d); break; }
  }
  const sista = delar[delar.length - 1];
  const format = /^H\d+$/i.test(sista) ? 'video' : /^C\d+$/i.test(sista) ? 'karusell' : /^\d+$/.test(sista) && delar.length >= 3 ? 'bild' : null;
  return { prefix, vinkel, format, marknad, nr };
}

/** OPS-butikerna ur factory/butiker/*.yaml: [{ brand, bas }] där bas är domänens namn ("carashell"). */
export function lasOpsButiker(rot = ROT) {
  const mapp = join(rot, 'factory', 'butiker');
  if (!existsSync(mapp)) return [];
  const ut = [];
  for (const f of readdirSync(mapp)) {
    if (!f.endsWith('.yaml') || f === 'testbutiken.yaml') continue;
    const t = readFileSync(join(mapp, f), 'utf8');
    const brand = t.match(/^\s*brand:\s*"?([^"\n]+)"?/m)?.[1]?.trim();
    const mail = t.match(/^\s*supportmail:\s*"?[^@\s"]+@([^"\s]+)"?/m)?.[1]?.trim();
    const bas = mail ? mail.split('.').slice(-2, -1)[0]?.toLowerCase() : null;
    if (brand && bas) ut.push({ brand, bas });
  }
  return ut;
}

/**
 * Prefix → produktmapp (products/<id>/) för de produkter som har ett minne.
 * konfig.produktmappar är facit (mätt 2026-09-24); products.json:s
 * creative_prefix läggs till så en ny skalningsprodukt kommer med av sig själv.
 * En mapp som inte finns på disk tas aldrig med — rutinen skapar inga produktmappar.
 */
export function lasProduktmappar(konfig, rot = ROT) {
  const karta = new Map();
  const lagg = (prefix, id) => { if (prefix && id && existsSync(join(rot, 'products', id))) karta.set(normaliseraPrefix(String(prefix).replace(/_$/, '')), id); };
  for (const [prefix, id] of Object.entries(konfig?.produktmappar ?? {})) if (!prefix.startsWith('_')) lagg(prefix, id);
  try {
    const pj = JSON.parse(readFileSync(join(rot, 'products', 'products.json'), 'utf8'));
    for (const p of (Array.isArray(pj) ? pj : (pj.products ?? []))) if (p.creative_prefix) lagg(p.creative_prefix, p.id);
  } catch { /* products.json saknas — då gäller bara konfig */ }
  return karta;
}

/**
 * Verksamhet och marknad för en annons. Ren (konfig + ops skickas in).
 * @returns {{ verksamhet, marknad, kalla, konflikt: string|null }}
 */
export function verksamhetFor({ lank, sida, kampanj, kontoId, annonsnamn }, { konfig, ops = [] }) {
  const vard = vardUrLank(lank);
  let fran = null;
  if (vard) {
    const exakt = konfig.domaner?.[vard];
    if (exakt) fran = { ...exakt, kalla: 'domän' };
    else {
      const bas = vard.split('.').slice(-2, -1)[0];
      const opsTraff = ops.find((o) => o.bas === bas);
      if (opsTraff) {
        const tld = vard.split('.').pop();
        fran = { verksamhet: opsTraff.brand, marknad: tld === 'com' ? 'US' : tld.toUpperCase(), kalla: 'domän' };
      }
    }
  }
  const sidaVerk = konfig.sidor?.[String(sida ?? '')] ?? null;
  if (!fran && sidaVerk) fran = { verksamhet: sidaVerk, marknad: null, kalla: 'sida' };
  if (!fran && kampanj) {
    const pre = String(kampanj).toUpperCase();
    const opsTraff = ops.find((o) => pre.includes(o.brand.toUpperCase()));
    if (opsTraff) fran = { verksamhet: opsTraff.brand, marknad: null, kalla: 'kampanj' };
  }
  const konto = [...(konfig.konton ?? []), ...(konfig.konton_valfria ?? []), ...(konfig.konton_utanfor ?? [])].find((k) => k.id === String(kontoId ?? '').replace(/^act_/, ''));
  if (!fran) fran = { ...(konto?.standard ?? { verksamhet: 'okänd', marknad: null }), kalla: 'konto' };

  const namnMarknad = tolkaAnnonsnamn(annonsnamn).marknad;
  const marknad = namnMarknad ?? marknadUrSokvag(lank) ?? fran.marknad ?? konto?.standard?.marknad ?? null;
  const konflikt = sidaVerk && fran.kalla === 'domän' && sidaVerk !== fran.verksamhet
    ? `länken går till ${fran.verksamhet} (${vard}) men inlägget ligger på ${sidaVerk}s sida ${sida}`
    : null;
  return { verksamhet: fran.verksamhet, marknad, kalla: fran.kalla, konflikt };
}
