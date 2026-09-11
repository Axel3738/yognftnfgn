#!/usr/bin/env node
// bygg-carashell-struktur.mjs — ENGÅNGSSKRIPT, /ny-annonser carashell 2026-09-11.
//
// Varför det finns: pipeline/no-video-launch.mjs bygger kampanj → adsets →
// annonser i EN loop, och avbryter på första annonsen som Meta vägrar. CaraShells
// Meta-sida 1381171778405935 kan ännu inte annonseras med (error_subcode 1815813
// — samma blockerare som stoppade TankGuard 2026-09-08), så körningen dör efter
// första adsetet och resten av strukturen byggs aldrig. Det här skriptet skapar
// de adsets som saknas, med EXAKT samma fält som no-video-launch.mjs sätter, så
// att en enda omkörning av vågkonfigarna räcker när sidan är löst.
//
//   node factory/bygg-carashell-struktur.mjs [--torr]
//
// ⛔ Strukturen är den låsta (Axels beslut 2026-09-10): EN CBO-kampanj per
// marknad, ett adset per KÄLLKONCEPT utan egen budget, OFFSITE_CONVERSIONS →
// PURCHASE mot butikens egen pixel, geo = marknaden. Inget adset per annons,
// ingen ABO, ingen egen idé. Allt föds PAUSED.
//
// Idempotent: kampanj och adsets slås upp på NAMN och återanvänds.
// Allt Graph-anrop går genom tools/meta-lib.mjs.

import { säkerställProxy, api, alla, logg } from '../tools/meta-lib.mjs';

säkerställProxy();
const TORR = process.argv.includes('--torr');

const ACT = 'act_915422744950975';   // MagiBorsten DK = OPS Factory (SEK)
const PIXEL = '28589207184025756';   // CaraShell — aldrig Bäverbutikens 1554276343018184

const MARKNADER = [
  {
    land: 'SE',
    kampanj: 'CARASHELL_SE_Taköverdraget | BE-ROAS 1,63 | 2026-09-11',
    adsets: ['PD', 'GT', 'SP', 'CS'].map((k) => `CARASHELL_SE_Taköverdraget - ${k}`),
  },
  {
    land: 'NO',
    kampanj: 'CARASHELL_NO_Takovertrekket | BE-ROAS 1,63 | 2026-09-11',
    // CS saknas med FLIT: de tre norska CS-videorna läser upp en NOK-pris som
    // butiken inte har satt. De byggs när NOK-paketnivåerna finns.
    adsets: ['PD', 'SP', 'G'].map((k) => `CARASHELL_NO_Takovertrekket - ${k}`),
  },
];

const targetingFör = (land) => JSON.stringify({
  age_min: 18, age_max: 65,
  geo_locations: { countries: [land], location_types: ['home', 'recent'] },
  targeting_automation: { advantage_audience: 1 },
});

for (const m of MARKNADER) {
  const kampanjer = await alla(`${ACT}/campaigns`, { fields: 'id,name' }, 200);
  let kampanjId = kampanjer.find((c) => c.name === m.kampanj)?.id;
  if (kampanjId) {
    logg(`· ${m.land}: återanvänder kampanj ${m.kampanj} (${kampanjId})`);
  } else if (TORR) {
    logg(`[torr] ${m.land}: skulle skapa kampanj ${m.kampanj}`);
    continue;
  } else {
    const c = await api(`${ACT}/campaigns`, { method: 'POST', form: {
      name: m.kampanj, objective: 'OUTCOME_SALES', status: 'PAUSED',
      daily_budget: '100000', bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      special_ad_categories: '[]',
    } });
    kampanjId = c.id;
    logg(`✓ ${m.land}: kampanj (PAUSED, 1000 kr/dag CBO): ${kampanjId}`);
  }

  const fanns = await alla(`${kampanjId}/adsets`, { fields: 'id,name' }, 100);
  for (const namn of m.adsets) {
    if (fanns.find((a) => a.name === namn)) { logg(`  · adset finns: ${namn}`); continue; }
    if (TORR) { logg(`  [torr] skulle skapa adset ${namn}`); continue; }
    const a = await api(`${ACT}/adsets`, { method: 'POST', form: {
      name: namn, campaign_id: kampanjId, status: 'PAUSED',
      billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS',
      promoted_object: JSON.stringify({ pixel_id: PIXEL, custom_event_type: 'PURCHASE' }),
      targeting: targetingFör(m.land),
    } });
    logg(`  ✓ adset (PAUSED): ${namn} (${a.id})`);
  }
}
logg('\nKlart. Annonserna skapas av vågkonfigarna när sidan går att annonsera med.');
