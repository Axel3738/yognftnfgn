// paslag.mjs — utlandspriserna minst X % över Sveriges pris, snyggt avrundade (Axel 2026-09-30).
//
//   node matstrumpor/marknader/paslag.mjs            # torrt: dagens påslag per marknad och produkt + förslaget
//   node matstrumpor/marknader/paslag.mjs --skriv    # skriver förslaget i konfig.json → fasta_priser
//   node matstrumpor/marknader/bygg.mjs --steg prislista --skarpt   # sätter sedan priserna i Shopify
//
// Axel: "Jag undrar varför du bara har lagt på 15 % i worldwide … vi borde lowkey lägga på 20 %
// … om det går att göra ett snyggt pris av det då. För vi måste avrunda så att det blir något nice
// tal." Mätt samma dag (dagens kurs mot Sveriges pris): Norge 5-paret +17 % men resten −8 till +4 %,
// Europa 5-paret +27 % men resten +1 till +13 %, USA +34 till +73 %.
//
// Regeln (konfig.json → paslag_min): varje fast pris i en utlandsmarknad ska vara minst Sveriges pris
// × (1 + paslag_min) i dagens kurs. Ligger det under höjs det till närmaste snygga pris ovanför. Ett
// pris som redan ligger över sänks ALDRIG: Axel ville höja, och USA-priset $69 är hans eget beslut.
// Snyggt pris per valuta: hela kronor som slutar på 9 (469, 59), euro/dollar som slutar på ,90
// (31,90), yen som slutar på 80 (7 180) och Taiwan-dollar som slutar på 90 (1 690; under 1 000 på 9: 219).
//
// Kursen är exchangerate-api:s dagskurs (open.er-api.com, gratis, bär alla valutor inklusive TWD;
// ECB saknar TWD). Kursen rör sig — förslaget gäller dagen det räknades, och priset står sedan fast.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
const KONFIGFIL = join(ROT, 'konfig.json');

const HELA = new Set(['NOK', 'SEK', 'DKK', 'ISK', 'CZK', 'HUF', 'PLN', 'RON', 'BGN']);

/** Ren: minsta snygga pris ≥ mal i valutan. */
export function snyggtPris(mal, valuta) {
  const v = String(valuta).toUpperCase();
  if (v === 'JPY') return Math.max(80, Math.ceil((mal - 80) / 100) * 100 + 80);
  if (v === 'TWD') return mal < 1000 ? Math.max(9, Math.ceil((mal - 9) / 10) * 10 + 9) : Math.ceil((mal - 90) / 100) * 100 + 90;
  if (HELA.has(v)) return Math.max(9, Math.ceil((mal - 9) / 10) * 10 + 9);
  // Två decimaler: ,90 på hela enheter (31,90 · 5,90).
  return Math.round((Math.max(0.9, Math.ceil(mal - 0.9) + 0.9)) * 100) / 100;
}

/** Ren: det snygga pris som ligger NÄRMAST mal (uppåt eller nedåt) — för en ny marknad som ska ligga
 *  "som" en annan (Axels val B 2026-09-30: Japan och Taiwan som i Europa). */
export function narmasteSnygga(mal, valuta) {
  const v = String(valuta).toUpperCase();
  const upp = snyggtPris(mal, v);
  const steg = v === 'JPY' || (v === 'TWD' && mal >= 1000) ? 100 : HELA.has(v) || v === 'TWD' ? 10 : 1;
  const ned = Math.round((upp - steg) * 100) / 100;
  return ned > 0 && mal - ned < upp - mal ? ned : upp;
}

/** Ren: priset i en ny marknad "som i" en annan marknad: närmaste snygga pris till den andra
 *  marknadens pris i dagens kurs, men aldrig under golvet (Sveriges pris + paslag). */
export function prisSomI({ annat, kursAnnat, kurs, sek, valuta, paslag }) {
  const mal = (annat / kursAnnat) * kurs;
  const golv = snyggtPris(sek * (1 + paslag) * kurs, valuta);
  return Math.max(narmasteSnygga(mal, valuta), golv);
}

/** Ren: det nya priset. Höjs bara om det ligger under golvet; sänks aldrig. */
export function nyttPris({ sek, nu, kurs, valuta, paslag }) {
  const golv = sek * (1 + paslag) * kurs;
  if (nu !== null && nu !== undefined && nu >= golv) return { pris: nu, andrat: false, golv };
  const pris = snyggtPris(golv, valuta);
  return { pris: nu !== null && nu !== undefined ? Math.max(pris, nu) : pris, andrat: true, golv };
}

/** Ren: påslaget i procent mot Sveriges pris. */
export const paslagFor = (pris, sek, kurs) => (pris / kurs / sek - 1) * 100;

/** Ren: sätter ett pris i konfigens fasta_priser (tal för alla varianter, eller objekt per variant). */
export function sattFastPris(fasta, handle, variant, pris) {
  const p = fasta[handle];
  if (p && typeof p === 'object') { p[variant] = pris; return; }
  fasta[handle] = pris;
}

async function huvud() {
  const arg = process.argv.slice(2);
  const skriv = arg.includes('--skriv');
  const konfig = JSON.parse(readFileSync(KONFIGFIL, 'utf8'));
  const paslag = konfig.paslag_min;
  if (typeof paslag !== 'number') throw new Error('konfig.json saknar paslag_min (t.ex. 0.20)');
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const k = await skapaKlient(lasButik(konfig.butik));
  const svar = await (await fetch('https://open.er-api.com/v6/latest/SEK')).json();
  if (svar.result !== 'success') throw new Error(`kursen gick inte att läsa: ${JSON.stringify(svar).slice(0, 200)}`);
  console.log(`Kurs ${svar.time_last_update_utc} (1 SEK = ${['NOK', 'EUR', 'USD', 'JPY', 'TWD'].map((c) => `${svar.rates[c]} ${c}`).join(' · ')})`);
  console.log(`Golv: Sveriges pris + ${Math.round(paslag * 100)} %\n`);
  let andrade = 0;
  for (const m of konfig.marknader) {
    if (m.priser !== 'fasta' || !m.fasta_priser) continue;
    const kurs = svar.rates[m.basvaluta];
    if (!kurs) throw new Error(`ingen kurs för ${m.basvaluta}`);
    console.log(`${m.namn} (${m.basvaluta})`);
    for (const handle of Object.keys(m.fasta_priser).filter((h) => h !== 'comment')) {
      const d = await k.graphql(`query($q: String!) { products(first: 1, query: $q) { nodes { handle variants(first: 20) { nodes { title price } } } } }`, { q: `handle:${handle}` });
      const p = d.products.nodes[0];
      if (!p || p.handle !== handle) { console.log(`  ⚠️ ${handle} finns inte i Shopify — hoppar`); continue; }
      for (const v of p.variants.nodes) {
        const fasta = m.fasta_priser[handle];
        const nu = typeof fasta === 'number' ? fasta : fasta?.[v.title] ?? null;
        if (nu === null) continue;
        const sek = Number(v.price);
        const r = nyttPris({ sek, nu, kurs, valuta: m.basvaluta, paslag });
        const rad = `${handle} · ${v.title}: ${nu} → ${r.pris} ${m.basvaluta} (${paslagFor(nu, sek, kurs).toFixed(1)} % → ${paslagFor(r.pris, sek, kurs).toFixed(1)} %, Sverige ${sek} kr)`;
        console.log(`  ${r.andrat ? '⬆️' : '  '} ${rad}`);
        if (r.andrat) { andrade++; if (skriv) sattFastPris(m.fasta_priser, handle, v.title, r.pris); }
      }
    }
    console.log('');
  }
  if (!skriv) { console.log(`torrt: ${andrade} priser skulle höjas. --skriv lägger dem i konfig.json.`); return; }
  writeFileSync(KONFIGFIL, JSON.stringify(konfig, null, 1) + '\n');
  console.log(`✅ ${andrade} priser skrivna i konfig.json. Nästa: node matstrumpor/marknader/bygg.mjs --steg prislista --skarpt`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
