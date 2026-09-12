#!/usr/bin/env node
// launch-kampanj.mjs — steg 11b i `/ny-annonser`: sätt EN namngiven OPS-kampanj
// ACTIVE på alla tre nivåer, och läs tillbaka det.
//
//   node factory/launch-kampanj.mjs <kampanj-id> [--torr]
//
// ⚠️ Varför den här filen finns i stället för meta-lib.aktivera(): den senare är
// byggd för EN annons i taget och rör aldrig kampanjen — med flit, eftersom den
// används av nattrutinerna där en kampanj aldrig får slås på. Vid launch är det
// precis tvärtom: kampanjen SKA på, men bara den ena, namngivna.
//
// Spärrarna, i ordning:
//  1. Kampanjen slås upp på ID, aldrig på ett namnmönster. Ett svep över kontot
//     hade kunnat väcka manuellt avstängda kampanjer — incidenten 2026-08-29/30.
//  2. Namnet måste bära ett marknadsprefix (<BRAND>_SE_ / _NO_). Utan det är det
//     inte en OPS-kampanj byggd av /ny-annonser.
//  3. Allt Graph-anrop går genom tools/meta-lib.mjs. Inga egna fetch-anrop.
//  4. Statusen läses TILLBAKA på alla tre nivåer och skrivs ut. Delvis är delvis.
//
// Den kontrollerar INTE butiken eller pixeln — det gör körningen före, och
// besluten där är människans.

import { säkerställProxy, api, alla, logg } from '../tools/meta-lib.mjs';

const MARKNADSPREFIX = /_(SE|NO|DK|FI|UK)_/;

export function kontrolleraNamn(namn) {
  if (!namn) return 'kampanjen saknar namn';
  if (!MARKNADSPREFIX.test(namn)) {
    return `"${namn}" bär inget marknadsprefix (<BRAND>_SE_ / _NO_) — launch-steget rör bara OPS-kampanjer byggda av /ny-annonser`;
  }
  return null;
}

async function main() {
  säkerställProxy();
  const argv = process.argv.slice(2);
  const torr = argv.includes('--torr');
  const kampanjId = argv.find((a) => !a.startsWith('--'));
  if (!kampanjId) {
    console.error('Användning: node factory/launch-kampanj.mjs <kampanj-id> [--torr]');
    process.exit(1);
  }

  const kampanj = await api(String(kampanjId), { params: { fields: 'name,status,daily_budget,account_id' } });
  const fel = kontrolleraNamn(kampanj.name);
  if (fel) { console.error(`✗ ${fel}`); process.exit(1); }

  logg(`Launch — ${kampanj.name}`);
  logg(`  konto ${kampanj.account_id} · budget ${Number(kampanj.daily_budget) / 100} kr/dag · status ${kampanj.status}`);
  if (torr) logg('  TORRKÖRNING — ingenting ändras\n');

  const adsets = await alla(`${kampanjId}/adsets`, { fields: 'name,status' });
  const annonser = await alla(`${kampanjId}/ads`, { fields: 'name,status' });
  logg(`  ${adsets.length} adsets · ${annonser.length} annonser\n`);

  // Kampanjen först: ett ACTIVE adset i en PAUSED kampanj levererar ingenting,
  // så ordningen uppifrån och ned gör att inget hinner spendera halvfärdigt.
  const satt = async (id, namn, nivå) => {
    if (torr) { logg(`  [torr] ${nivå} ${namn}: skulle bli ACTIVE`); return; }
    await api(String(id), { form: { status: 'ACTIVE' } });
    logg(`  ✓ ${nivå} ${namn}`);
  };

  await satt(kampanjId, kampanj.name, 'kampanj');
  for (const a of adsets) await satt(a.id, a.name, 'adset  ');
  for (const a of annonser) await satt(a.id, a.name, 'annons ');

  if (torr) return;

  // ── Tillbakaläsning, alla tre nivåer ──
  logg('\n=== TILLBAKALÄST UR META ===');
  const k = await api(String(kampanjId), { params: { fields: 'name,status,effective_status,daily_budget' } });
  logg(`kampanj: ${k.status} (effektiv ${k.effective_status}) · ${Number(k.daily_budget) / 100} kr/dag`);

  const adsetsEfter = await alla(`${kampanjId}/adsets`, { fields: 'name,status,effective_status' });
  const annonserEfter = await alla(`${kampanjId}/ads`, { fields: 'name,status,effective_status' });
  const ejAktiva = (rader) => rader.filter((r) => r.status !== 'ACTIVE');

  logg(`adsets:   ${adsetsEfter.length - ejAktiva(adsetsEfter).length}/${adsetsEfter.length} ACTIVE`);
  for (const a of ejAktiva(adsetsEfter)) logg(`   ⚠ ${a.name}: ${a.status} (effektiv ${a.effective_status})`);
  logg(`annonser: ${annonserEfter.length - ejAktiva(annonserEfter).length}/${annonserEfter.length} ACTIVE`);
  for (const a of ejAktiva(annonserEfter)) logg(`   ⚠ ${a.name}: ${a.status} (effektiv ${a.effective_status})`);

  // Metas effektiva status kan skilja sig från den satta (granskning, betalning,
  // en pausad förälder). Den satta statusen är vad vi styr; den effektiva är vad
  // som faktiskt levererar — båda redovisas, ingen döljs.
  const ejLevererande = annonserEfter.filter((a) => a.effective_status !== 'ACTIVE');
  if (ejLevererande.length) {
    logg(`\n⚠️ ${ejLevererande.length} annons(er) är ACTIVE men levererar inte ännu:`);
    for (const a of ejLevererande.slice(0, 10)) logg(`   ${a.name}: effektiv ${a.effective_status}`);
    logg('   (IN_REVIEW och PENDING_REVIEW är normalt strax efter launch)');
  }

  const allt = !ejAktiva(adsetsEfter).length && !ejAktiva(annonserEfter).length && k.status === 'ACTIVE';
  logg(allt ? '\n✅ LAUNCHAD — alla tre nivåer ACTIVE.' : '\n❌ DELVIS — se varningarna ovan.');
  process.exit(allt ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
