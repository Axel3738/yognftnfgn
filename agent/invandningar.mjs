// invandningar.mjs — invändningsmatrisen som motorn läser (Axels beslut 2026-09-22).
//
// Filen products/<id>/invandningar.md skrivs av tools/invandningsmatris.mjs på
// main (kommentarer + supportmejl + kontots annonsnamn). Här läses den bara:
//   • funnelläge: dagsbudget över FUNNEL_BUDGET_SEK ⇒ tomma rutor går före
//     lärdomar i briefsteget (lardom.mjs), täckningen skrivs i rapporten och en
//     obesvarad invändning över VARNING_ANDEL skrivs ut i höjningsdomen
//     (varning, aldrig spärr).
//   • kopplingen till CPA-regeln: stigande CPA + tomma rutor ⇒ bygg rutorna;
//     stigande CPA + full matris ⇒ marknaden är mätt, nytt land eller ny produkt.
//
// ⚠️ matrisUrText/tackning är KOPIERADE från tools/invandningsmatris.mjs
// (kontraktet för filen) — agent/ finns inte på main och tools/ inte här.
// Ändra formatet på båda ställena.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Funnelläget: över den här dagsbudgeten slås matrisens fyra regler på för produkten. */
export const FUNNEL_BUDGET_SEK = 10000;
/** En obesvarad invändning med minst så stor andel tar en briefplats före nästa iteration (funnelläge). */
export const BRIEF_ANDEL = 0.10;
/** Över den här andelen utan ett enda svar skrivs det ut i höjningsdomen. */
export const VARNING_ANDEL = 0.25;

// ------------------------------------------------------------------ kontraktet (kopia av tools/invandningsmatris.mjs)

export const FORMAT = Object.freeze([
  { nyckel: 'video', rubrik: 'Video-svar' },
  { nyckel: 'statisk', rubrik: 'Statisk' },
  { nyckel: 'demo', rubrik: 'Demo' },
  { nyckel: 'jamforelse', rubrik: 'Jämförelse' },
]);
export const TOM = '⬜';

export function nyckelUrEtikett(etikett) {
  return String(etikett ?? '').replace(/\*\*/g, '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}
export function kortnamn(etikett) {
  return nyckelUrEtikett(etikett).split(/[\s/,]+/)[0] ?? '';
}
export function andelUrEtikett(etikett) {
  const m = String(etikett ?? '').match(/\((\d+(?:[.,]\d+)?)\s*%\)/);
  return m ? Number(m[1].replace(',', '.')) / 100 : null;
}
export function cellTom(cell) {
  const s = String(cell ?? '').replace(/\*\*/g, '').trim();
  return !s || s === TOM || s === '—' || s === '-';
}
export function cellLive(cell) {
  return !cellTom(cell) && /\blive\b/i.test(String(cell)) && !/\bej live\b/i.test(String(cell));
}
export function matrisUrText(text) {
  const t = String(text ?? '');
  const start = t.search(/^## Matrisen\s*$/m);
  if (start === -1) return { finns: false, fore: t, efter: '', kolumner: FORMAT.map((f) => f.rubrik), rader: [] };
  const rubrikSlut = t.indexOf('\n', start);
  const rest = t.slice(rubrikSlut + 1);
  const linjer = rest.split('\n');
  let i = 0;
  while (i < linjer.length && !linjer[i].trim().startsWith('|')) i += 1;
  const tabell = [];
  while (i < linjer.length && linjer[i].trim().startsWith('|')) { tabell.push(linjer[i]); i += 1; }
  const efter = linjer.slice(i).join('\n');
  const celler = (rad) => rad.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const kolumner = tabell.length ? celler(tabell[0]).slice(1) : FORMAT.map((f) => f.rubrik);
  const nycklar = kolumner.map((k) => FORMAT.find((f) => f.rubrik.toLowerCase() === k.toLowerCase())?.nyckel ?? k.toLowerCase());
  const rader = [];
  for (const rad of tabell.slice(2)) {
    const c = celler(rad);
    if (!c[0]) continue;
    const r = { etikett: c[0], nyckel: nyckelUrEtikett(c[0]), andel: andelUrEtikett(c[0]), celler: {} };
    nycklar.forEach((n, j) => { r.celler[n] = cellTom(c[j + 1]) ? null : c[j + 1]; });
    rader.push(r);
  }
  return { finns: true, fore: t.slice(0, start), efter, kolumner, rader };
}
export function tackning(rader) {
  return (rader ?? []).map((r) => {
    const fyllda = FORMAT.filter((f) => !cellTom(r.celler?.[f.nyckel])).map((f) => f.nyckel);
    const live = FORMAT.filter((f) => cellLive(r.celler?.[f.nyckel])).map((f) => f.nyckel);
    const tomma = FORMAT.filter((f) => cellTom(r.celler?.[f.nyckel])).map((f) => f.nyckel);
    return { nyckel: r.nyckel, kort: kortnamn(r.etikett), etikett: r.etikett, andel: r.andel, live: live.length, fyllda: fyllda.length, briefade: fyllda.length - live.length, av: FORMAT.length, tomma, obesvarad: live.length === 0 };
  });
}
export function tackningText(t) {
  return `${t.kort} ${t.live} av ${t.av} format${t.briefade ? ` (+${t.briefade} briefad${t.briefade === 1 ? '' : 'e'})` : ''}${Number.isFinite(t.andel) ? ` (${Math.round(t.andel * 100)} %)` : ''}`;
}

// ------------------------------------------------------------------ motorns regler

/** Funnelläge för en dagsbudget. Ren. */
export function funnellage(budget) {
  return Number.isFinite(budget) && budget > FUNNEL_BUDGET_SEK;
}

/**
 * Matrisen för en produktmapp, eller null när filen saknas. Läser en fil.
 * @returns {{ fil, rader, tackning } | null}
 */
export function lasMatris(mapp, { rot = null } = {}) {
  if (!mapp) return null;
  const fil = rot ? join(rot, mapp, 'invandningar.md') : join(mapp, 'invandningar.md');
  if (!existsSync(fil)) return null;
  const m = matrisUrText(readFileSync(fil, 'utf8'));
  if (!m.finns) return null;
  return { fil, rader: m.rader, tackning: tackning(m.rader) };
}

/** Rader som ska briefas före en iteration: tomma rutor OCH andel ≥ BRIEF_ANDEL. Ren. Sorterat på andel. */
export function rutorAttBygga(matris, { andel = BRIEF_ANDEL } = {}) {
  return (matris?.tackning ?? []).filter((t) => t.tomma.length > 0 && Number.isFinite(t.andel) && t.andel >= andel).sort((a, b) => b.andel - a.andel);
}

/** Den största invändningen som saknar VARJE svar (inget live) över VARNING_ANDEL, eller null. Ren. */
export function storstaObesvarade(matris, { andel = VARNING_ANDEL } = {}) {
  const t = (matris?.tackning ?? []).filter((x) => x.obesvarad && Number.isFinite(x.andel) && x.andel >= andel).sort((a, b) => b.andel - a.andel);
  return t[0] ?? null;
}

/** Är matrisen full — ingen rad med tomma rutor bland dem som når BRIEF_ANDEL? Ren. */
export function matrisFull(matris) {
  const rel = (matris?.tackning ?? []).filter((t) => Number.isFinite(t.andel) && t.andel >= BRIEF_ANDEL);
  return rel.length > 0 && rel.every((t) => t.tomma.length === 0);
}

/**
 * Kopplingen till CPA-regeln (Axel 2026-09-22). Ren.
 * @returns {'bygg'|'matt'|null}  bygg = stigande CPA + tomma rutor; matt = stigande CPA + full matris; null annars
 */
export function cpaDiagnos(matris, cpaTrend) {
  const dagar = Number(cpaTrend?.dagar ?? 0);
  if (!matris || dagar < 2) return null;
  if (rutorAttBygga(matris).length) return 'bygg';
  if (matrisFull(matris)) return 'matt';
  return null;
}

/** Täckningsraden för rapporten: "fukt 0 av 4 format (38 %) · blåser 1 av 4 format". Ren. */
export function tackningRad(matris) {
  const t = [...(matris?.tackning ?? [])].sort((a, b) => (b.andel ?? -1) - (a.andel ?? -1));
  return t.length ? t.map(tackningText).join(' · ') : 'matrisen har inga rader';
}
