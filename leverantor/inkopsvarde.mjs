#!/usr/bin/env node
// leverantor/inkopsvarde.mjs — vilka produkter vi köper in mest av, i kronor. LÄS-BARA.
//
// Förhandlingen börjar där pengarna är: sålda enheter senaste 30 dagarna × Cost per item,
// per produkt och butik, rangordnat. Topp 10 brukar vara 70–80 % av allt inköp.
//
//   node leverantor/inkopsvarde.mjs                  # butikerna i standardlistan
//   node leverantor/inkopsvarde.mjs --butik carashell --dagar 30
//   node leverantor/inkopsvarde.mjs --skriv          # + leverantor/rapporter/inkopsvarde-<datum>.md
//
// Bäverbutiken (SE) kräver en app som får läsa ordrar — i en vanlig session svarar
// SHOPIFY_*_SE 403. Kör i /stonebite-rutinens miljö (SHOPIFY_*_BAVERBUTIKEN_EMAILSCRAPER).

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { forsaljning, kostnaderFor, normNamn } from '../lager/shopify.mjs';
import { hamtaKurser } from '../stonebite/kallor/valuta.mjs';

const MAPP = dirname(fileURLToPath(import.meta.url));
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const STANDARD = ['baverbutiken', 'beverbutikken', 'baeverbutiken', 'majavakauppa', 'carashell', 'matstrumpor'];
const BUTIKSVALUTA = { beverbutikken: 'NOK', baeverbutiken: 'DKK', majavakauppa: 'EUR' };

/** Rangordna produkterna på inköpsvärde. Ren funktion. */
export function rangordna(varor, kostnader, { kurs = 1 } = {}) {
  const perProdukt = new Map();
  let utanKostnad = 0;
  for (const v of varor) {
    const k = kostnader.get(normNamn(`${v.produkt}|${v.variant && v.variant !== 'Default Title' ? v.variant : ''}`)) ?? kostnader.get(normNamn(`${v.produkt}|`));
    const p = perProdukt.get(v.produkt) ?? { produkt: v.produkt, enheter: 0, inkop: 0, saknar: 0 };
    p.enheter += v.enheter;
    if (k === undefined || k === null) { p.saknar += v.enheter; utanKostnad += v.enheter; } else p.inkop += k * v.enheter * kurs;
    perProdukt.set(v.produkt, p);
  }
  const lista = [...perProdukt.values()].sort((a, b) => b.inkop - a.inkop);
  const total = lista.reduce((s, p) => s + p.inkop, 0);
  let kum = 0;
  for (const p of lista) { kum += p.inkop; p.andel = total ? p.inkop / total : 0; p.kumulativ = total ? kum / total : 0; }
  return { lista, total, utanKostnad };
}

async function main() {
  const dagar = Number(arg('--dagar') ?? 30);
  const butiker = arg('--butik') ? [arg('--butik')] : STANDARD;
  const kurser = await hamtaKurser();
  const idag = new Date().toISOString().slice(0, 10);
  const L = [`# Inköpsvärde per produkt, ${dagar} dagar till ${idag}`, '', 'Sålda enheter × Cost per item i Shopify (det vi betalar leverantören, inklusive frakten dit). Kronor, ECB-kurs. Rangordnat: förhandla uppifrån.', ''];
  const alla = [];
  for (const b of butiker) {
    try {
      const f = await forsaljning(b, { dagar });
      const { kostnader } = await kostnaderFor(b);
      const kurs = kurser.sekPer?.[BUTIKSVALUTA[b] ?? 'SEK'] ?? 1;
      const r = rangordna(f.varor, kostnader, { kurs });
      L.push(`## ${b} — ${Math.round(r.total).toLocaleString('sv-SE')} kr på ${dagar} dagar (${f.ordrar} ordrar)`, '');
      L.push('| # | Produkt | Enheter | Inköp | Andel | Kumulativt |', '|---|---|---|---|---|---|');
      r.lista.slice(0, 15).forEach((p, i) => L.push(`| ${i + 1} | ${p.produkt.slice(0, 60)} | ${p.enheter}${p.saknar ? ` (${p.saknar} utan kostnad)` : ''} | ${Math.round(p.inkop).toLocaleString('sv-SE')} kr | ${(p.andel * 100).toFixed(0)} % | ${(p.kumulativ * 100).toFixed(0)} % |`));
      if (r.utanKostnad) L.push('', `⚠️ ${r.utanKostnad} sålda enheter saknar Cost per item och räknas inte.`);
      L.push('');
      for (const p of r.lista) alla.push({ butik: b, ...p });
    } catch (e) {
      L.push(`## ${b}`, '', `⚠️ Gick inte att läsa: ${e.message}`, '');
    }
  }
  if (alla.length) {
    alla.sort((a, b) => b.inkop - a.inkop);
    const total = alla.reduce((s, p) => s + p.inkop, 0);
    L.push(`## Alla butiker tillsammans — ${Math.round(total).toLocaleString('sv-SE')} kr`, '', '| # | Produkt | Butik | Inköp | Andel |', '|---|---|---|---|---|');
    alla.slice(0, 20).forEach((p, i) => L.push(`| ${i + 1} | ${p.produkt.slice(0, 60)} | ${p.butik} | ${Math.round(p.inkop).toLocaleString('sv-SE')} kr | ${((p.inkop / total) * 100).toFixed(0)} % |`));
    L.push('');
  }
  const text = L.join('\n');
  console.log(text);
  if (process.argv.includes('--skriv')) {
    mkdirSync(join(MAPP, 'rapporter'), { recursive: true });
    writeFileSync(join(MAPP, 'rapporter', `inkopsvarde-${idag}.md`), text);
    console.error(`Skrev leverantor/rapporter/inkopsvarde-${idag}.md`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(`Stoppade: ${e.message}`); process.exit(1); });
}
