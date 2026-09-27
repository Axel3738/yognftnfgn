// upp.mjs — Norge-kampanjen i kontot "nya kungen" (730973156224390), via META_ACCESS_TOKEN.
//
//   node matstrumpor/marknader/norge/upp.mjs --torr            # säg vad som skulle göras
//   node matstrumpor/marknader/norge/upp.mjs --skarpt          # kampanj + adset + annonser, allt PAUSED
//   node matstrumpor/marknader/norge/upp.mjs --skarpt --aktivera   # slår på det som skapats här (och bara det)
//
// Läser matstrumpor/marknader/konfig.json (marknaden NO → annons: budget, kampanjnamn, pixel,
// sida, landningssida) och matstrumpor/marknader/norge/annonser.json (en post per annons:
// namn, videofil, title, message, link_description). Idempotent: kampanj, adset och annonser
// med samma namn återanvänds — ett avbrutet bygge körs bara om.
//
// ⚠️ Mätt 2026-09-27: token:en LÄSER kontot men får inte skriva ("Permissions error … rollen
// Annonsör eller högre … ads_management") — systemanvändaren "API LONG TERM" sitter i
// Business Manager SnarkLös och har bara läsrätt på Matstrumpors konto. Axels klick i
// Business Manager Matstrumpor.se: Users → System users (eller Partners → SnarkLös) →
// annonskontot "nya kungen" → rollen "Manage campaigns" (Annonsör). Tills dess stoppar
// skriptet på första skrivningen med Metas eget felmeddelande.
//
// Aktivering gäller ENBART det den här körningen själv skapat (kampanjnamnet ur konfigen).
// Ingen annan kampanj rörs — PAUSED i kontot är ett beslut (CLAUDE.md).

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { api, alla, laddaUppVideo, väntaPåThumb, ingaEnhancements, skapaAnnons } from '../../../tools/meta-lib.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const KONFIG = JSON.parse(readFileSync(join(ROT, '..', 'konfig.json'), 'utf8'));
const NO = KONFIG.marknader.find((m) => m.id === 'NO');
const A = NO?.annons;
if (!A) throw new Error('konfig.json: marknaden NO saknar annons-blocket (budget, kampanj, pixel, sida).');
const ANNONSER = existsSync(join(ROT, 'annonser.json')) ? JSON.parse(readFileSync(join(ROT, 'annonser.json'), 'utf8')) : null;
const LAGE = join(ROT, 'kampanj.json');
const ADSET = 'MATSTRUMP_NO_ugc';
const arg = process.argv.slice(2);
const skarpt = arg.includes('--skarpt');
const aktivera = arg.includes('--aktivera');
const log = (s) => console.log(s);

async function huvud() {
  const act = A.konto;
  const konto = await api(`act_${act}`, { params: { fields: 'name,currency' } });
  log(`Konto: ${konto.name} (${act}, ${konto.currency}) — ${skarpt ? 'SKARPT' : 'torrt'}${aktivera ? ' + aktivera' : ''}`);
  if (konto.name !== A.konto_namn.split(' (')[0]) throw new Error(`Kontot heter "${konto.name}", konfigen säger "${A.konto_namn}" — fel konto, stopp.`);

  // Kampanj
  const kampanjer = (await api(`act_${act}/campaigns`, { params: { fields: 'id,name,status,daily_budget,bid_strategy', limit: 200 } })).data ?? [];
  let kampanj = kampanjer.find((c) => c.name === A.kampanj);
  if (kampanj) log(`kampanj ${A.kampanj} finns: ${kampanj.id} ${kampanj.status} ${Number(kampanj.daily_budget) / 100} kr/dag`);
  else if (!skarpt) log(`torrt: skulle skapa kampanjen ${A.kampanj} (CBO ${A.budget_sek_dag} kr/dag, OUTCOME_SALES, lowest cost, PAUSED)`);
  else {
    kampanj = await api(`act_${act}/campaigns`, { form: { name: A.kampanj, objective: 'OUTCOME_SALES', status: 'PAUSED', special_ad_categories: '[]', buying_type: 'AUCTION', daily_budget: String(A.budget_sek_dag * 100), bid_strategy: 'LOWEST_COST_WITHOUT_CAP' } });
    log(`✅ kampanj skapad PAUSED: ${kampanj.id}`);
  }

  // Adset — speglar SE-adsetet "09-17 UGC" (mätt 2026-09-27), med Norge som land.
  let adset = kampanj ? ((await api(`${kampanj.id}/adsets`, { params: { fields: 'id,name,status', limit: 50 } })).data ?? []).find((a) => a.name === ADSET) : null;
  if (adset) log(`adset ${ADSET} finns: ${adset.id} ${adset.status}`);
  else if (!skarpt || !kampanj) log(`torrt: skulle skapa adsetet ${ADSET} (NO, 18–65, Advantage+ audience, köp via pixel ${A.pixel}, 7d klick)`);
  else {
    adset = await api(`act_${act}/adsets`, { form: {
      name: ADSET, campaign_id: kampanj.id, status: 'PAUSED', billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS', destination_type: 'WEBSITE',
      promoted_object: JSON.stringify({ pixel_id: A.pixel, custom_event_type: 'PURCHASE' }),
      attribution_spec: JSON.stringify([{ event_type: 'CLICK_THROUGH', window_days: 7 }]),
      targeting: JSON.stringify({ geo_locations: { countries: NO.lander, location_types: ['home', 'recent', 'frequently_in'] }, age_min: 18, age_max: 65, targeting_automation: { advantage_audience: 1 } }),
      dsa_beneficiary: 'STonebite', dsa_payor: 'STonebite',
    } });
    log(`✅ adset skapat PAUSED: ${adset.id}`);
  }

  // Annonser
  const skapade = [];
  if (!ANNONSER) log('inga annonser: matstrumpor/marknader/norge/annonser.json saknas — bara kampanj + adset');
  else {
    const finns = adset ? await alla(`${adset.id}/ads`, { fields: 'id,name,status' }, 50) : [];
    for (const an of ANNONSER.annonser) {
      const redan = finns.find((x) => x.name === an.namn);
      if (redan) { log(`annons ${an.namn} finns: ${redan.id} ${redan.status}`); skapade.push({ id: redan.id, namn: an.namn }); continue; }
      const fil = join(ROT, an.video);
      if (!existsSync(fil)) { log(`⚠️ ${an.namn}: videon saknas (${an.video}) — hoppar`); continue; }
      if (!skarpt || !adset) { log(`torrt: skulle ladda upp ${an.video} och skapa annonsen ${an.namn} (PAUSED) → ${A.landningssida}`); continue; }
      const videoId = await laddaUppVideo(act, fil);
      const thumb = await väntaPåThumb(videoId);
      const spec = { page_id: A.sida, ...(ANNONSER.instagram_user_id ? { instagram_user_id: ANNONSER.instagram_user_id } : {}),
        video_data: { video_id: videoId, image_url: thumb, title: an.title, message: an.message, link_description: an.link_description, call_to_action: { type: 'SHOP_NOW', value: { link: A.landningssida } } } };
      const r = await skapaAnnons({ act, adsetId: adset.id, namn: an.namn, spec, enhancements: ingaEnhancements() });
      log(`✅ annons ${an.namn}: ${r.annonsId} (creative ${r.creativeId}) PAUSED`);
      skapade.push({ id: r.annonsId, namn: an.namn, creativeId: r.creativeId, videoId });
    }
  }

  // Tillbakaläsning + aktivering (bara det som skapats här)
  if (kampanj) {
    const k2 = await api(kampanj.id, { params: { fields: 'id,name,status,effective_status,daily_budget,bid_strategy' } });
    const ads = adset ? await alla(`${adset.id}/ads`, { fields: 'id,name,status,effective_status,creative{object_story_spec}' }, 50) : [];
    for (const a of ads) {
      const vd = a.creative?.object_story_spec?.video_data ?? {};
      const lank = vd.call_to_action?.value?.link ?? '';
      if (!lank.includes('/nb/') || !lank.includes('country=NO')) log(`❌ ${a.name}: länken ${lank} pekar inte på /nb/ + country=NO — aktiveras inte`);
    }
    if (aktivera && skarpt) {
      const felaktiga = ads.filter((a) => { const l = a.creative?.object_story_spec?.video_data?.call_to_action?.value?.link ?? ''; return !l.includes('/nb/') || !l.includes('country=NO'); });
      if (!ads.length) log('⚠️ inga annonser i adsetet — aktiverar inget');
      else if (felaktiga.length) log('⚠️ annonser med fel länk — aktiverar inget');
      else {
        for (const a of ads) if (a.status !== 'ACTIVE') await api(a.id, { form: { status: 'ACTIVE' } });
        if (adset.status !== 'ACTIVE') await api(adset.id, { form: { status: 'ACTIVE' } });
        if (k2.status !== 'ACTIVE') await api(k2.id, { form: { status: 'ACTIVE' } });
        log(`✅ aktiverat: ${ads.length} annonser, adsetet och kampanjen (${A.budget_sek_dag} kr/dag)`);
      }
    }
    const k3 = await api(kampanj.id, { params: { fields: 'id,name,status,effective_status,daily_budget' } });
    const ads3 = adset ? await alla(`${adset.id}/ads`, { fields: 'id,name,status,effective_status' }, 50) : [];
    log(`tillbakaläst: kampanj ${k3.status}/${k3.effective_status} ${Number(k3.daily_budget) / 100} kr/dag · ${ads3.length} annonser: ${ads3.map((a) => `${a.name} ${a.status}`).join(', ') || '—'}`);
    writeFileSync(LAGE, JSON.stringify({ _om: 'Norge-kampanjen i nya kungen — skrivet av norge/upp.mjs efter tillbakaläsning.', konto: act, kampanj: k3, adset: adset ? { id: adset.id, namn: ADSET } : null, annonser: ads3, skrivet: new Date().toISOString() }, null, 1) + '\n');
  }
}

huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
