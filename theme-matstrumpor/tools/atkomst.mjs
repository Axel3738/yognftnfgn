#!/usr/bin/env node
// Vad släpper Shopify-appen faktiskt igenom just nu?
// Scope-listan i OAuth-svaret är inte hela sanningen — bara ett riktigt anrop är det,
// och Shopify svarar 200 på behörighetsfel, så ett nekat anrop ser lyckat ut annars.
//
//   node theme-matstrumpor/tools/atkomst.mjs
import { gql, kontrolleraButik } from './shopify.mjs';

// Saknad nyckel, oinstallerad app eller fel butik ska läsas som en mening.
for (const händelse of ['uncaughtException', 'unhandledRejection']) {
  process.on(händelse, fel => {
    const rad = String(fel?.message ?? fel).replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.error(`❌ ${rad.slice(0, 300)}`);
    if (/app_not_installed/.test(rad)) {
      console.error('   Appen som nycklarna tillhör är inte installerad på matstrumpor.se.');
      console.error('   Installera den på butiken i Shopifys Dev Dashboard (Apps → appen → Install) och kör igen.');
    }
    process.exit(1);
  });
}

const butik = await kontrolleraButik();
console.log(`Butik: ${butik.name} · ${butik.myshopifyDomain}\n`);

const prov = [
  ['produkter', '{ productsCount { count } }', 'behövs inte för uppladdningen'],
  ['teman', '{ themes(first: 1) { nodes { id } } }', 'read_themes — krävs för att ladda upp temat'],
  ['ordrar', '{ orders(first: 1) { nodes { id } } }', 'read_orders — krävs för att läsa trafik och köp'],
  ['rapporter', '{ shopifyqlQuery(query: "FROM sessions SHOW total_sessions SINCE -30d") { __typename } }', 'read_reports — krävs för sessions'],
];

let saknas = 0;
for (const [namn, fråga, varför] of prov) {
  try {
    await gql(fråga);
    console.log(`✅ ${namn.padEnd(11)} öppet`);
  } catch (e) {
    saknas++;
    console.log(`❌ ${namn.padEnd(11)} stängt — ${varför}`);
  }
}

if (saknas) {
  console.log('\nÖppnas i Shopify-adminen för matstrumpor.se:');
  console.log('  Inställningar → Appar och försäljningskanaler → Utveckla appar → appen');
  console.log('  → Konfiguration → Admin API-omfattning → kryssa i → Spara → Installera om');
}
process.exit(saknas ? 1 : 0);
