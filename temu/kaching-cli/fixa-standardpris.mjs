// Tar bort "Standard pris"-undertexten från alla Kaching-stegar i en butik.
// Körs på AXELS DATOR (kräver inloggad Kaching-session, se kaching.mjs login).
//
//   cd temu/kaching-cli
//   node fixa-standardpris.mjs baverbutiken
//
// Går igenom varje deal block, nollar varje dealBar-subtitle som matchar
// "standard pris" (och språkvarianter), PUT:ar tillbaka HELA objektet (samma
// envelope som appens egen editor — partiell payload kan resetta A/B-läget)
// och läser tillbaka som verifiering. Rör inget annat.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withApp, API, assertOk } from './api.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MATCH = /standard\s*-?\s*pri(s|ce)|normalpris|normaali?hinta|vakiohinta/i;

const namn = process.argv[2];
if (!namn) { console.error('Användning: node fixa-standardpris.mjs <butik ur stores.json>'); process.exit(1); }
const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'stores.json'), 'utf8'));
const store = reg[namn];
if (!store) { console.error(`okänd butik "${namn}" — finns: ${Object.keys(reg).filter((k) => !k.startsWith('_')).join(', ')}`); process.exit(1); }

await withApp(store.handle, async (call) => {
  const lista = assertOk('GET deal_blocks', await call('GET', `${API}/deal_blocks`));
  let ändrade = 0;
  for (const rad of lista) {
    const full = assertOk(`GET deal_block ${rad.id}`, await call('GET', `${API}/deal_blocks/${rad.id}`)).deal_block;
    const träffar = (full.dealBars || []).filter((d) => MATCH.test(d.subtitle || ''));
    if (!träffar.length) { console.log(`  ${rad.id} "${full.blockName}": ren`); continue; }
    for (const d of full.dealBars) if (MATCH.test(d.subtitle || '')) d.subtitle = '';
    assertOk(`PUT deal_block ${rad.id}`, await call('PUT', `${API}/deal_blocks/${rad.id}`, {
      deal_block: full,
      ab_test_variants: [],
      ab_test_traffic_allocation: null,
      test_type: 'manual',
      publish: true,
    }));
    const efter = assertOk(`GET deal_block ${rad.id}`, await call('GET', `${API}/deal_blocks/${rad.id}`)).deal_block;
    const kvar = (efter.dealBars || []).filter((d) => MATCH.test(d.subtitle || ''));
    console.log(`✔ ${rad.id} "${full.blockName}": rensade ${träffar.length} rad(er)${kvar.length ? ` — ⚠ ${kvar.length} KVAR!` : ''}`);
    ändrade++;
  }
  console.log(ändrade ? `\n${ändrade} block uppdaterade i ${namn}.` : `\nInget att ändra i ${namn}.`);
});
