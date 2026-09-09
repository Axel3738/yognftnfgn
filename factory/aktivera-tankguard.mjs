// Sätter TankGuards kampanjer live. Ägarbeslut krävs — kör aldrig av eget bevåg.
//
//   node factory/aktivera-tankguard.mjs --dry
//   node factory/aktivera-tankguard.mjs --kor
//   node factory/aktivera-tankguard.mjs --kor --marknad=se
//
// Ordningen är medveten: annonser först, adsets sedan, KAMPANJEN SIST. Inget
// levereras förrän kampanjen slås på, så en halvfärdig körning kan inte börja
// spendera på en delmängd.
//
// ⚠️ Skriptet rör BARA de två namngivna kampanjerna. CLAUDE.md: statusändringar
// görs mot en namngiven lista, aldrig som svep över ett mönster. Allt i de här
// kampanjerna skapades PAUSED av den här körningen — det är därför de får
// aktiveras. Ligger något här som körningen inte skapat, rör det inte.
import { säkerställProxy, api, alla, logg } from '/home/user/yognftnfgn/tools/meta-lib.mjs';
säkerställProxy();

const KAMPANJER = {
  se: { id: '120248995235740172', namn: 'TANKGUARD_SE_Tanköverdraget' },
  no: { id: '120249012213810172', namn: 'TANKGUARD_NO_Tanktrekket' },
};

// Annonser som INTE får gå live, med skäl. Namngivna, aldrig ett mönster.
const HÅLLS = {
  TankGuard_PD_Extra: 'ingen dom — talet gick aldrig att läsa och det finns inget transkript',
};

const TORR = !process.argv.includes('--kor');
const valdMarknad = (process.argv.find((a) => a.startsWith('--marknad=')) || '').split('=')[1];
const marknader = valdMarknad ? [valdMarknad] : Object.keys(KAMPANJER);

for (const m of marknader) {
  const k = KAMPANJER[m];
  if (!k) throw new Error(`Okänd marknad "${m}" — välj se eller no.`);
  const kamp = await api(k.id, { params: { fields: 'id,name,status,daily_budget' } });
  if (!kamp.name.startsWith(k.namn)) {
    throw new Error(`Kampanj ${k.id} heter "${kamp.name}" — inte ${k.namn}. Avbryter hellre än rör fel kampanj.`);
  }
  logg(`\n######## ${m.toUpperCase()} — ${kamp.name} [${kamp.status}] ${kamp.daily_budget / 100} kr/dag`);

  const ads = await alla(`${k.id}/ads`, { fields: 'id,name,status' }, 25);
  const adsets = await alla(`${k.id}/adsets`, { fields: 'id,name,status' }, 50);
  const hålls = ads.filter((a) => HÅLLS[a.name]);
  const körs = ads.filter((a) => !HÅLLS[a.name]);
  logg(`  ${ads.length} annonser, ${adsets.length} adsets. ${hålls.length} hålls kvar pausade.`);
  for (const a of hålls) logg(`    ⏸  ${a.name} — ${HÅLLS[a.name]}`);

  if (TORR) {
    logg(`  (torr) skulle aktivera ${körs.filter((a) => a.status !== 'ACTIVE').length} annonser, ` +
      `${adsets.filter((a) => a.status !== 'ACTIVE').length} adsets och kampanjen.`);
    continue;
  }

  let n = 0;
  for (const a of körs) {
    if (a.status === 'ACTIVE') { n++; continue; }
    try { await api(a.id, { form: { status: 'ACTIVE' } }); n++; }
    catch (e) { logg(`  ❌ ${a.name}: ${e.message.slice(0, 140)}`); }
  }
  logg(`  Annonser ACTIVE: ${n} av ${körs.length}`);

  let s = 0;
  for (const a of adsets) {
    if (a.status === 'ACTIVE') { s++; continue; }
    try { await api(a.id, { form: { status: 'ACTIVE' } }); s++; }
    catch (e) { logg(`  ❌ adset ${a.name}: ${e.message.slice(0, 140)}`); }
  }
  logg(`  Adsets ACTIVE: ${s} av ${adsets.length}`);

  await api(k.id, { form: { status: 'ACTIVE' } });

  // Tillbakaläsning — status i svaret är inte samma sak som status i kontot.
  const efter = await api(k.id, { params: { fields: 'status,effective_status' } });
  const adsEfter = await alla(`${k.id}/ads`, { fields: 'name,status,effective_status' }, 25);
  const aktiva = adsEfter.filter((a) => a.status === 'ACTIVE').length;
  const pausade = adsEfter.filter((a) => a.status === 'PAUSED');
  logg(`  ✅ Kampanjen: ${efter.status} (${efter.effective_status})`);
  logg(`  Annonser: ${aktiva} ACTIVE, ${pausade.length} PAUSED` +
    (pausade.length ? ` — ${pausade.map((a) => a.name).join(', ')}` : ''));
}

logg('\nKlart.');
