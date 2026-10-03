// bygg-offertsvar.mjs — bygger texten som klistras in i StonePNL → Costs → "Your supplier's
// answer", ur ../../cogs.json. En rad per land och variant: 1 pc och 2 pcs (två lådor i ett
// paket) ur arket, 3 pcs lämnas som ___ (arket har ingen rad). Formatet är StonePNL:s egen
// offertmall (byggOffertmeddelande i pnl-app/app/lib/offertforfragan.ts), så appens läsare
// (tolkaOffertsvar + offertTillRader) känner igen varje rad — provläst 2026-10-03.
//
//   node matstrumpor/marknader/stonepnl/bygg-offertsvar.mjs            # skriver offertsvar-alla.txt
//   node matstrumpor/marknader/stonepnl/bygg-offertsvar.mjs --stdout   # bara till skärmen
//
// Länderna: Sverige (ark_usd — ger StonePNL 2-set-steget för hemmamarknaden; Cost per item för
// EN låda ligger redan i Shopify), Norden (norden.rader) och Big 5 (big5.rader). Belopp i USD,
// arkets pris-kolumn när den finns, annars cost + frakt. Ätpinnar och presentkort tas inte med.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HAR = dirname(fileURLToPath(import.meta.url));
const cogs = JSON.parse(readFileSync(join(HAR, '..', '..', 'cogs.json'), 'utf8'));

// Shopify-varianternas id (lästa live 2026-10-02 och 2026-10-03) — appen pekar ut varianten på id.
const VARIANTER = [
  { nyckel: 'sushi-5', rubrik: 'Sushi-Strumpor — 5 - Par / One Size', id: '52506473365843' },
  { nyckel: 'sushi-3', rubrik: 'Sushi-Strumpor — 3 - Par / One Size', id: '52506473398611' },
  { nyckel: 'donut', rubrik: 'Donut-strumpor — One Size', id: '52510025253203' },
  { nyckel: 'pizza', rubrik: 'Pizza-Strumpor — One Size', id: '52579705225555' },
  { nyckel: 'hamburgare', rubrik: 'Hamburgare-Strumpor — One Size', id: '52579707027795' },
];
const LANDNAMN = { SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', US: 'United States', CA: 'Canada', GB: 'United Kingdom', NZ: 'New Zealand', AU: 'Australia' };
const ORDNING = ['SE', 'NO', 'DK', 'FI', 'US', 'CA', 'GB', 'NZ', 'AU'];

const pris = (rad) => (rad.pris != null ? rad.pris : rad.cost + rad.frakt);
const usd = (n) => `${n.toFixed(2)} USD`;

/** Arkets rader för en variant i ett land, eller null. */
function raderFor(nyckel, land) {
  if (land === 'SE') return cogs.sverige.ark_usd?.[nyckel] ?? null;
  for (const block of ['norden', 'big5']) {
    if ((cogs[block]?.lander ?? []).includes(land)) return cogs[block].rader?.[nyckel]?.[land] ?? null;
  }
  return null;
}

export function byggOffertsvar(datum = new Date().toISOString().slice(0, 10)) {
  const delar = [];
  delar.push(`StonePNL quote request · Matstrumpor · ${datum} · USD`, '', 'Hi! Could you please send us your prices for the products below?', '',
    'HOW TO REPLY — please follow this exactly:',
    '1. Reply with ONE single message.',
    '2. Copy this whole message and write your price instead of every ___.',
    '3. Every price is the TOTAL price for that many pieces sent together in one order: product + shipping to that country. Example: "2 pcs = 30 USD" means 2 pieces cost 30 USD together, shipping included. Write only the total — not "+ shipping" and not "each".',
    '4. All prices in USD. If you use another currency, write it instead of USD after each price.',
    '5. Keep the "ID:" lines, and keep the country code at the start of each line.',
    '6. One line per country. Do not group countries (for example "EU").',
    '7. If you cannot ship a product to a country, write X instead of the prices on that line.',
    '8. If import duty/VAT is already included in the price (DDP), write DDP at the end of that line.',
    '');
  let lander = new Set();
  VARIANTER.forEach((v, i) => {
    delar.push('----------------------------------------', `#${i + 1} ${v.rubrik}`, `ID: ${v.id}`);
    for (const land of ORDNING) {
      const rader = raderFor(v.nyckel, land);
      if (!rader) continue;
      const ett = rader.find((r) => r.antal === 1);
      const tva = rader.find((r) => r.antal === 2);
      if (!ett) continue;
      lander.add(land);
      delar.push(`${land} (${LANDNAMN[land]}): 1 pc = ${usd(pris(ett))} | 2 pcs = ${tva ? usd(pris(tva)) : '___ USD'} | 3 pcs = ___ USD`);
    }
  });
  delar.push('----------------------------------------', '', `${VARIANTER.length} products, ${lander.size} countries. Thank you!`);
  return { text: delar.join('\n') + '\n', lander: [...lander] };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { text, lander } = byggOffertsvar();
  if (process.argv.includes('--stdout')) process.stdout.write(text);
  else {
    const ut = join(HAR, 'offertsvar-alla.txt');
    writeFileSync(ut, text);
    console.log(`skrev ${ut}: ${VARIANTER.length} varianter × ${lander.length} länder (${lander.join(', ')})`);
  }
}
