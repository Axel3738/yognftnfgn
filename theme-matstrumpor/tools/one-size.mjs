#!/usr/bin/env node
// Lägger alternativet "Storlek: One Size" på alla strumpor i matstrumpor.se.
//
// Varför: kunder blir osäkra på storleken när de bara ser "3 - Par / 5 - Par".
// Med ett eget alternativ visar Dawns variantväljare "Storlek: One Size" direkt
// under valet av par, och samma rad följer med i varukorgen, kassan och
// orderbekräftelsen. Presentkortet och ätpinnarna rörs inte.
//
// Variant-id:n behålls. Paketnivåerna, rabattkoderna och Meta-katalogen pekar
// på dem och fortsätter fungera. Sushis varianter byter dock namn från
// "5 - Par" till "5 - Par / One Size" — paketväljaren läser bara första ordet,
// så priset per par räknas fortfarande rätt.
//
//   node theme-matstrumpor/tools/one-size.mjs            → visar planen, skriver inget
//   node theme-matstrumpor/tools/one-size.mjs --skarpt   → utför och verifierar
//
// Säkert att köra om: strumpor som redan har One Size hoppas över.
// Kräver SHOPIFY_*_MATSTRUMPOR i environmentet (butiken 1r46tp-qx.myshopify.com)
// och att appen har write_products.

import { gql, kontrolleraButik } from './shopify.mjs';
import { ALTERNATIV, VÄRDE, FRÅGA_ALLA, beskriv, planera, utför } from './one-size-plan.mjs';

const skarpt = process.argv.includes('--skarpt');

// Saknad nyckel eller fel butik ska läsas som en mening, inte som en krasch.
for (const händelse of ['uncaughtException', 'unhandledRejection']) {
  process.on(händelse, fel => {
    console.error(`❌ ${fel?.message ?? fel}`);
    process.exit(1);
  });
}

const butik = await kontrolleraButik();
console.log(`Butik: ${butik.name} · ${butik.myshopifyDomain}${skarpt ? '' : '   (torrkörning — inget skrivs)'}\n`);

async function allaProdukter() {
  const ut = [];
  let efter = null;
  do {
    const d = await gql(FRÅGA_ALLA, { efter });
    ut.push(...d.products.nodes);
    efter = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (efter);
  return ut;
}

const planer = (await allaProdukter()).map(planera);
for (const plan of planer) console.log(beskriv(plan));

const attGöra = planer.filter(p => p.åtgärd === 'lägg-till' || p.åtgärd === 'döp-om');
if (!attGöra.length) {
  console.log(`\nInget att göra — alla strumpor har redan ${ALTERNATIV}: ${VÄRDE}.`);
  process.exit(0);
}
if (!skarpt) {
  console.log(`\n${attGöra.length} produkter skulle ändras. Kör med --skarpt för att göra det.`);
  process.exit(0);
}

console.log('');
let fel = 0;
for (const plan of attGöra) {
  const r = await utför(plan, gql);
  if (!r.ok) fel++;
  console.log(`${r.ok ? '✅' : '❌'} ${plan.titel}`);
  for (const s of r.steg) console.log(`     ${s}`);
  console.log(`     alternativ: ${r.alternativ.join(' · ') || '(inga)'}`);
  console.log(`     varianter:  ${r.varianter.join(' · ') || '(inga)'}`);
}
console.log(fel
  ? `\n${fel} produkter gick inte att ändra — se raderna ovan.`
  : `\nKlart. Alla strumpor har ${ALTERNATIV}: ${VÄRDE}. Kontrollera på https://matstrumpor.se/products/sushi-strumpor`);
process.exit(fel ? 1 : 0);
