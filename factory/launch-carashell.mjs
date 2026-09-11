#!/usr/bin/env node
// launch-carashell.mjs — steg 11b i `/ny-annonser`: sätter CaraShells två
// kampanjer ACTIVE efter Axels "Launch: CaraShell" (2026-09-11).
//
//   node factory/launch-carashell.mjs [--torr]
//
// ⛔ RÖR BARA DET DEN HÄR KÖRNINGEN BYGGDE. Kampanjerna slås upp på EXAKT namn
// ur listan nedan — aldrig på ett mönster, aldrig som ett svep över kontot.
// act_915422744950975 bär ALLA OPS-butiker OCH Bäverbutikens danska kampanjer;
// ett namnmönster-svep här är samma misstag som incidenten 2026-08-29/30, då en
// nattrutin slog på ett dussin manuellt avstängda kampanjer.
//
// ⚠️ PAUSED med spend > 0 är ett BESLUT. Skriptet vägrar röra en kampanj, ett
// adset eller en annons som har spenderat pengar — den här körningen skapade
// allt från noll, så allt den äger har spend 0. Hittas spend > 0 på något av
// dem är det inte vårt, och då stannar skriptet.
//
// Grindarna (steg 11b) kontrolleras av den som kör, INTE av skriptet:
//   • butiken live (ingen /password)        — verifierad 2026-09-11
//   • pixeln har avfyrat (last_fired_time)  — verifierad 2026-09-11 14:52
//   • sidan går att annonsera med           — verifierad 2026-09-11
//
// Idempotent: det som redan är ACTIVE lämnas i fred. Läser tillbaka statusen på
// alla tre nivåer efteråt och skriver ut den — "delvis klart heter delvis klart".

import { säkerställProxy, api, alla, logg } from '../tools/meta-lib.mjs';

säkerställProxy();
const TORR = process.argv.includes('--torr');
const ACT = 'act_915422744950975';

// EXAKTA namn. Läggs en tredje kampanj till här utan att någon läst den är det
// ett fel, inte en bekvämlighet.
const ALLA_KAMPANJER = {
  SE: 'CARASHELL_SE_Taköverdraget | BE-ROAS 1,51 | 2026-09-11',
  NO: 'CARASHELL_NO_Takovertrekket | BE-ROAS 1,51 | 2026-09-11',
};

// --marknad SE launchar bara den svenska. Finns för att marknaderna kan vara
// olika redo: 2026-09-11 var SE grön medan NO satt fast på ett fel i
// landningssidans paketpriser (oomräknade SEK-belopp märkta "kr" i NOK-vyn).
// Att launcha en marknad vars landningssida visar fel pris är att betala för
// trafik till ett brutet löfte — hellre halva launchen än fel launch.
const iM = process.argv.indexOf('--marknad');
const valda = iM >= 0 && process.argv[iM + 1] && !process.argv[iM + 1].startsWith('--')
  ? process.argv[iM + 1].toUpperCase().split(',')
  : Object.keys(ALLA_KAMPANJER);
for (const m of valda) if (!ALLA_KAMPANJER[m]) { console.error(`✗ okänd marknad "${m}" — välj SE och/eller NO.`); process.exit(1); }
const KAMPANJER = valda.map((m) => ALLA_KAMPANJER[m]);
logg(`Launchar marknad(er): ${valda.join(', ')}`);

const spendAv = async (id) => {
  try {
    const j = await api(`${id}/insights`, { params: { fields: 'spend', date_preset: 'maximum' } });
    return Number(j.data?.[0]?.spend ?? 0);
  } catch { return 0; }
};

async function aktivera(id, namn, niva) {
  const s = await spendAv(id);
  if (s > 0) {
    logg(`  ⛔ ${niva} "${namn}" har spenderat ${s} — PAUSED med spend är ett beslut. RÖRS INTE.`);
    return 'hoppad';
  }
  if (TORR) { logg(`  [torr] skulle sätta ${niva} ACTIVE: ${namn}`); return 'torr'; }
  await api(id, { method: 'POST', form: { status: 'ACTIVE' } });
  logg(`  ✓ ${niva} ACTIVE: ${namn}`);
  return 'aktiverad';
}

const alla_kampanjer = await alla(`${ACT}/campaigns`, { fields: 'id,name,status' }, 200);
for (const namn of KAMPANJER) {
  const k = alla_kampanjer.find((c) => c.name === namn);
  if (!k) { logg(`⚠️ hittar ingen kampanj som heter exakt "${namn}" — hoppar`); continue; }
  logg(`\n▸ ${namn} (${k.id})`);

  // Annonserna först, sedan adseten, sist kampanjen. Meta tvångspausar vid
  // strukturändringar, och den ordningen gör att inget hinner börja spendera
  // innan hela trädet är på plats.
  const adsets = await alla(`${k.id}/adsets`, { fields: 'id,name,status' }, 100);
  for (const a of adsets) {
    const annonser = await alla(`${a.id}/ads`, { fields: 'id,name,status' }, 100);
    for (const ad of annonser) {
      if (ad.status === 'ACTIVE') { logg(`  · annons redan ACTIVE: ${ad.name}`); continue; }
      await aktivera(ad.id, ad.name, 'annons');
    }
    if (a.status === 'ACTIVE') logg(`  · adset redan ACTIVE: ${a.name}`);
    else await aktivera(a.id, a.name, 'adset ');
  }
  if (k.status === 'ACTIVE') logg(`  · kampanjen redan ACTIVE`);
  else await aktivera(k.id, namn, 'kampanj');
}

// ---------------------------------------------------------- tillbakaläsning
logg('\n=== TILLBAKALÄST UR META ===');
const efter = await alla(`${ACT}/campaigns`, { fields: 'id,name,status,daily_budget' }, 200);
for (const namn of KAMPANJER) {
  const k = efter.find((c) => c.name === namn);
  if (!k) { logg(`⚠️ ${namn}: FINNS INTE`); continue; }
  logg(`\n▸ ${k.name}`);
  logg(`  kampanj ${k.status} · ${k.daily_budget ? Number(k.daily_budget) / 100 + ' kr/dag CBO' : 'INGEN BUDGET'}`);
  const adsets = await alla(`${k.id}/adsets`, { fields: 'id,name,status,daily_budget' }, 100);
  for (const a of adsets) {
    const annonser = await alla(`${a.id}/ads`, { fields: 'id,name,status' }, 100);
    const aktiva = annonser.filter((x) => x.status === 'ACTIVE').length;
    logg(`   • ${a.name}: adset ${a.status}${a.daily_budget ? ' ⛔ EGEN BUDGET' : ''} · ${aktiva}/${annonser.length} annonser ACTIVE`);
    for (const x of annonser) if (x.status !== 'ACTIVE') logg(`       ⚠️ ${x.status} ${x.name}`);
  }
}
