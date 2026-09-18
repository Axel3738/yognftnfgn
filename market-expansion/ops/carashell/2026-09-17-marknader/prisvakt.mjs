#!/usr/bin/env node
// prisvakt.mjs — läser butikens pris som kund i GB/CA/AU/NZ och jämför med det
// pris de 216 annonserna säger (MARKNADER i marknader.mjs).
//
//   node prisvakt.mjs            → tabell + exit 1 om någon marknad driftat för långt
//   node prisvakt.mjs --grans 3  → egen gräns i procent (standard 2)
//
// VARFÖR DEN FINNS: de fyra länderna ligger i USA-marknaden med lokala valutor,
// så priset i pund/kanadadollar/australiensiska dollar/nyzeeländska dollar är
// Shopifys OMRÄKNING av det fasta USD-priset. Kursen rör sig varje dag, priset i
// annonsen står still. Mätt 2026-09-18, ett dygn efter bytet: AU hade redan glidit
// 286 → 285 medan GB/CA/NZ stod kvar. Fasta priser per valuta kräver att varje
// land blir en EGEN marknad med egen adress (prislistan hänger på marknaden, inte
// på landet) — tills det är gjort är den här kollen det som fångar driften.
//
// Läs-bar: rör varken butiken eller Meta.
import { MARKNADER } from './marknader.mjs';

const args = process.argv.slice(2);
const flagga = (f) => { const i = args.indexOf(`--${f}`); return i >= 0 ? args[i + 1] : null; };
const GRANS = Number(flagga('grans') ?? 2);
const HANDLE = flagga('handle') ?? 'takskyddet';

/** Siffran ur ett pris i tabellen: "CA$284" → 284, "£152" → 152. */
export function talUr(pris) {
  const m = String(pris).match(/([\d.,]+)/);
  return m ? Number(m[1].replace(/\s/g, '').replace(',', '.')) : NaN;
}

/** Driften i procent mellan annonsens pris och butikens. */
export function drift(annons, butik) {
  if (!Number.isFinite(annons) || !Number.isFinite(butik) || butik === 0) return NaN;
  return Math.abs(annons - butik) / butik * 100;
}

async function butikspris(kod) {
  const url = `https://carashell.com/products/${HANDLE}.json?country=${kod}`;
  const svar = await fetch(url, { signal: AbortSignal.timeout(25_000) });
  if (!svar.ok) throw new Error(`HTTP ${svar.status}`);
  const v = (await svar.json()).product.variants[0];
  return { pris: Number(v.price), jamforpris: Number(v.compare_at_price) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rader = [];
  for (const [kod, m] of Object.entries(MARKNADER)) {
    try {
      const b = await butikspris(kod);
      const a = { pris: talUr(m.pris), jamforpris: talUr(m.jamforpris) };
      const d = Math.max(drift(a.pris, b.pris), drift(a.jamforpris, b.jamforpris));
      rader.push({ kod, valuta: m.valuta, annons: a, butik: b, drift: d, ok: d <= GRANS });
    } catch (e) {
      rader.push({ kod, valuta: m.valuta, fel: e.message, ok: false });
    }
  }
  console.log(`Prisvakt ${HANDLE} · gräns ${GRANS} % · ${new Date().toISOString().slice(0, 16)}Z\n`);
  console.log('| Land | Annonsen säger | Butiken säger | Drift |');
  console.log('|---|---|---|---|');
  for (const r of rader) {
    if (r.fel) { console.log(`| ${r.kod} | — | gick inte att läsa | ${r.fel} |`); continue; }
    console.log(`| ${r.kod} | ${r.annons.pris} / ${r.annons.jamforpris} | ${r.butik.pris} / ${r.butik.jamforpris} | ${r.drift.toFixed(2)} % ${r.ok ? '✅' : '⚠️'} |`);
  }
  const varnar = rader.filter((r) => !r.ok);
  console.log(varnar.length
    ? `\n⚠️ ${varnar.length} marknad(er) över gränsen: ${varnar.map((r) => r.kod).join(', ')} — annonserna behöver nya priser (byt-text.py + dubba.mjs + byt-creative.mjs).`
    : '\nAlla fyra inom gränsen. Inget att göra.');
  process.exit(varnar.length ? 1 : 0);
}
