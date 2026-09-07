#!/usr/bin/env node
// Kontrollerar att alla fem butiker går att nå och att rätt token sitter på rätt butik.
// Skriver INGENTING. Kör den innan varje uppladdning.
//
//   node temu/kolla-koppling.mjs

import { BUTIKER } from './butiker.mjs';
import { Butik } from './api.mjs';

let fel = 0;
console.log('\nKontrollerar kopplingen till alla butiker — ingenting skrivs.\n');

for (const [nyckel, konf] of Object.entries(BUTIKER)) {
  const etikett = `${nyckel.toUpperCase().padEnd(3)} ${konf.namn.padEnd(22)}`;
  let butik;
  try {
    butik = new Butik(nyckel);
  } catch (e) {
    console.log(`  ⨯  ${etikett} ${e.message.split('\n')[0]}`);
    console.log(`     ${e.message.split('\n').slice(1).join('\n     ')}\n`);
    fel++;
    continue;
  }

  try {
    const shop = await butik.verifiera();
    const kanaler = await butik.kanaler();
    const d = await butik.fraga(`{ productsCount(query: "status:active") { count } }`);
    console.log(
      `  ✓  ${etikett} ${shop.name} · ${shop.currencyCode} · ` +
      `${d.productsCount.count} aktiva produkter · ${kanaler.length} kanaler`
    );
  } catch (e) {
    console.log(`  ⨯  ${etikett}`);
    console.log(`     ${e.message.replace(/\n/g, '\n     ')}\n`);
    fel++;
  }
}

console.log();
if (fel) {
  console.log(`  ${fel} av ${Object.keys(BUTIKER).length} butiker gick inte att nå.`);
  console.log(`  Klickvägen för att skapa token står i temu/TOKENS.md\n`);
  process.exit(1);
}
console.log(`  Alla ${Object.keys(BUTIKER).length} butiker svarar. Redo att ladda upp.\n`);
