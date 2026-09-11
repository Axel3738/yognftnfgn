#!/usr/bin/env node
// dop-om-carashell.mjs — ENGÅNGSSKRIPT 2026-09-11.
//
// Kampanjnamnen bar "BE-ROAS 1,63", ett tal som var baklängesräknat ur
// källkampanjens namn. Axel kvitterade det riktiga inköpspriset 2026-09-11
// (348,73 kr vara + 2,70 EUR tull = 379,07 kr), och break-even blev då 1,51.
// Ett kampanjnamn som bär fel break-even är en etikett som ljuger för varje
// människa som läser kontot — samma skäl som bygg-tankguard.mjs döpte om sin.
//
//   node factory/dop-om-carashell.mjs [--torr]
//
// ⛔ Slår upp kampanjerna på EXAKT gammalt namn, en i taget. Aldrig ett mönster:
// act_915422744950975 bär alla OPS-butiker OCH Bäverbutikens danska kampanjer.
//
// ⚠️ MÅSTE köras INNAN vågkonfigarna körs igen. Konfigarna slår upp kampanjen
// på namn — står det nya namnet i konfigen men det gamla i kontot skapar
// nästa körning en DUBBLETT i stället för att fylla den befintliga, och då går
// datan inte att skära. Ett namnbyte påverkar varken leverans eller inlärning.

import { säkerställProxy, api, alla, logg } from '../tools/meta-lib.mjs';

säkerställProxy();
const TORR = process.argv.includes('--torr');
const ACT = 'act_915422744950975';

const BYTEN = [
  { fran: 'CARASHELL_SE_Taköverdraget | BE-ROAS 1,63 | 2026-09-11',
    till: 'CARASHELL_SE_Taköverdraget | BE-ROAS 1,51 | 2026-09-11' },
  { fran: 'CARASHELL_NO_Takovertrekket | BE-ROAS 1,63 | 2026-09-11',
    till: 'CARASHELL_NO_Takovertrekket | BE-ROAS 1,51 | 2026-09-11' },
];

const kampanjer = await alla(`${ACT}/campaigns`, { fields: 'id,name' }, 200);
for (const b of BYTEN) {
  if (kampanjer.find((c) => c.name === b.till)) { logg(`· redan omdöpt: ${b.till}`); continue; }
  const k = kampanjer.find((c) => c.name === b.fran);
  if (!k) { logg(`⚠️ hittar ingen kampanj som heter exakt "${b.fran}" — hoppar`); continue; }
  if (TORR) { logg(`[torr] ${k.id}: "${b.fran}" → "${b.till}"`); continue; }
  await api(k.id, { method: 'POST', form: { name: b.till } });
  logg(`✓ ${k.id} omdöpt → ${b.till}`);
}

logg('\n— tillbakaläst:');
for (const c of await alla(`${ACT}/campaigns`, { fields: 'id,name,status' }, 200)) {
  if (c.name.startsWith('CARASHELL_')) logg(`  ${c.status.padEnd(8)} ${c.id}  ${c.name}`);
}
