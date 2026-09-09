// Skapar en EGEN Kaching-stege för staketstolpsbygeln, där stegen heter
// 2-pack / 4-pack / 6-pack i stället för 1 st / 2 st / 3 st — produkten
// innehåller två byglar, så "1 st" är missvisande för kunden.
//
// Kör på Axels dator (kräver inloggad Shopify-session i Chrome):
//   node kaching.mjs login                       (en gång)
//   node bundle-staketbygel.mjs baverbutiken
//   node bundle-staketbygel.mjs beverbutikken
//
// Idempotent: finns blocket redan uppdateras det i stället för att dubbleras.
// Rensar samtidigt "Standard pris"-undertexten ur ALLA block i butiken
// (Axels beslut 2026-08-29 — den låg kvar i fallback-stegen).
import { withApp, API, assertOk } from './api.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = path.dirname(fileURLToPath(import.meta.url));
const STANDARD = /standard\s*-?\s*pri(s|ce)|normalpris|normaali?hinta|vakiohinta/i;

const butik = process.argv[2];
if (!butik) { console.error('Användning: node bundle-staketbygel.mjs <baverbutiken|beverbutikken>'); process.exit(1); }
const payload = JSON.parse(readFileSync(path.join(HÄR, 'payloads', `staketbygel-${butik}.json`), 'utf8'));

await withApp(butik, async (call) => {
  const lista = assertOk('GET deal_blocks', await call('GET', `${API}/deal_blocks`));

  // 1. Rensa "Standard pris" ur befintliga block
  let rensade = 0;
  for (const rad of lista) {
    const full = assertOk(`GET ${rad.id}`, await call('GET', `${API}/deal_blocks/${rad.id}`)).deal_block;
    if (!(full.dealBars || []).some((d) => STANDARD.test(d.subtitle || ''))) continue;
    for (const d of full.dealBars) if (STANDARD.test(d.subtitle || '')) d.subtitle = '';
    assertOk(`PUT ${rad.id}`, await call('PUT', `${API}/deal_blocks/${rad.id}`, {
      deal_block: full, ab_test_variants: [], ab_test_traffic_allocation: null, test_type: 'manual', publish: true }));
    rensade++;
  }
  if (rensade) console.log(`✔ "Standard pris" rensad ur ${rensade} block`);

  // 2. Skapa eller uppdatera produktstegen
  const befintlig = lista.find((r) => (r.blockName || r.name || '') === payload.blockName);
  const kropp = { deal_block: payload, ab_test_variants: [], ab_test_traffic_allocation: null, test_type: 'manual', publish: true };
  const svar = befintlig
    ? assertOk('PUT stege', await call('PUT', `${API}/deal_blocks/${befintlig.id}`, kropp))
    : assertOk('POST stege', await call('POST', `${API}/deal_blocks`, kropp));
  const id = befintlig ? befintlig.id : (svar.deal_block || svar).id;
  console.log(`${befintlig ? '✔ uppdaterade' : '+ skapade'} stegen (id ${id})`);

  // 3. Läs tillbaka och visa exakt vad som ligger skarpt
  const kvitto = assertOk('GET kvitto', await call('GET', `${API}/deal_blocks/${id}`)).deal_block;
  console.log(`   "${kvitto.blockTitle}" · synlighet: ${kvitto.blockVisibility}`);
  for (const d of kvitto.dealBars) {
    console.log(`   ${String(d.title).padEnd(8)} "${d.subtitle}"  → köp ${d.quantity} st, −${d.discountValue} %`);
  }
  const kvar = kvitto.dealBars.filter((d) => STANDARD.test(d.subtitle || '')).length;
  console.log(kvar ? `   ⚠️ ${kvar} steg har fortfarande "Standard pris"` : '   ✔ ingen "Standard pris"');
});
