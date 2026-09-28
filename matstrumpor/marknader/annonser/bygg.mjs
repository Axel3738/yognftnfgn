// bygg.mjs — Matstrumpors annonskampanjer per marknad i kontot "nya kungen", via META_ACCESS_TOKEN.
//
//   node matstrumpor/marknader/annonser/bygg.mjs --marknad NO            # torrt
//   node matstrumpor/marknader/annonser/bygg.mjs --marknad NO --skarpt   # kampanj + adset + annonser, allt PAUSED
//   node matstrumpor/marknader/annonser/bygg.mjs --marknad NO --skarpt --aktivera   # slår på det den själv byggt
//   node matstrumpor/marknader/annonser/bygg.mjs --alla [--skarpt]       # alla kampanjer i marknader.json
//   node matstrumpor/marknader/annonser/bygg.mjs --lage                  # läs läget i kontot
//
// Läser marknader.json (kampanj, adset, geo, länk, budget, budgetbeslut) och <KOD>.json
// (copy + en post per annons: namn, videofil relativt annonser/klar/, title, message,
// link_description). Idempotent: kampanj, adset och annonser med samma namn återanvänds.
//
// Järnregler: allt skapas PAUSED; `--aktivera` rör BARA kampanjen i marknader.json med
// exakt det namnet, och vägrar om budgetbeslutet inte är Axels ("EJ GIVEN" i texten) eller om
// en annons länkar till fel locale/land. Ingen annan kampanj i kontot rörs någonsin —
// PAUSED är ett beslut (CLAUDE.md). Kontonamnet läses tillbaka innan något skrivs.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { api, alla, laddaUppVideo, väntaPåThumb, ingaEnhancements, skapaAnnons } from '../../../tools/meta-lib.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const M = JSON.parse(readFileSync(join(ROT, 'marknader.json'), 'utf8'));
const arg = process.argv.slice(2);
const skarpt = arg.includes('--skarpt');
const aktivera = arg.includes('--aktivera');
const log = (s) => console.log(s);

/** Ren: får kampanjen aktiveras? Bara med ett budgetbeslut som är Axels och annonser som pekar rätt.
 *  ⛔ i budgetbeslutet (eller "tills Axel granskat") stoppar också: Axel 2026-09-27 kväll, "jag vill
 *  inte att du aktiverar kampanjerna i meta för ens jag har granskat alla". Budgeten är given, men
 *  aktiveringen är hans — texten i marknader.json ändras när han sagt ja, aldrig av en session själv. */
export function farAktiveras(k, annonser) {
  if (/EJ GIVEN|platshållare/i.test(k.budget_beslut ?? '')) return { ok: false, skal: `budgeten är en platshållare (${k.budget_beslut})` };
  if (/⛔|tills Axel granskat/i.test(k.budget_beslut ?? '')) return { ok: false, skal: `väntar på Axels granskning (${k.budget_beslut})` };
  if (!annonser.length) return { ok: false, skal: 'inga annonser i adsetet' };
  const fel = annonser.filter((a) => !lankOk(k, a.lank));
  if (fel.length) return { ok: false, skal: `${fel.length} annonser länkar fel: ${fel.map((a) => `${a.name} → ${a.lank}`).join('; ')}` };
  return { ok: true };
}
/** Ren: annonsens länk måste bära marknadens locale och (för enlandskampanjer) landet. */
export function lankOk(k, lank) {
  if (!lank) return false;
  if (!lank.includes(`matstrumpor.se/${k.locale}/`)) return false;
  if (k.geo.length === 1 && !lank.includes(`country=${k.geo[0]}`)) return false;
  return true;
}

async function byggMarknad(kod) {
  const k = M.kampanjer[kod];
  if (!k) throw new Error(`Okänd marknad ${kod}. Finns: ${Object.keys(M.kampanjer).join(', ')}`);
  const act = M.konto;
  const copyFil = join(ROT, `${kod}.json`);
  const A = existsSync(copyFil) ? JSON.parse(readFileSync(copyFil, 'utf8')) : null;
  log(`\n── ${kod}: ${k.kampanj} (${k.geo.join(',')}, ${k.locale}, ${k.budget_sek_dag} kr/dag — ${k.budget_beslut}) ──`);

  const kampanjer = (await api(`act_${act}/campaigns`, { params: { fields: 'id,name,status,daily_budget,bid_strategy', limit: 200 } })).data ?? [];
  let kampanj = kampanjer.find((c) => c.name === k.kampanj);
  if (kampanj) log(`kampanj finns: ${kampanj.id} ${kampanj.status} ${Number(kampanj.daily_budget) / 100} kr/dag`);
  else if (!skarpt) log(`torrt: skulle skapa kampanjen (CBO ${k.budget_sek_dag} kr/dag, OUTCOME_SALES, lowest cost, PAUSED)`);
  else {
    kampanj = await api(`act_${act}/campaigns`, { form: { name: k.kampanj, objective: 'OUTCOME_SALES', status: 'PAUSED', special_ad_categories: '[]', buying_type: 'AUCTION', daily_budget: String(k.budget_sek_dag * 100), bid_strategy: 'LOWEST_COST_WITHOUT_CAP' } });
    log(`✅ kampanj skapad PAUSED: ${kampanj.id}`);
  }

  let adset = kampanj ? ((await api(`${kampanj.id}/adsets`, { params: { fields: 'id,name,status', limit: 50 } })).data ?? []).find((a) => a.name === k.adset) : null;
  if (adset) log(`adset finns: ${adset.id} ${adset.status}`);
  else if (!skarpt || !kampanj) log(`torrt: skulle skapa adsetet ${k.adset} (${k.geo.join(',')}, 18–65, Advantage+ audience, köp via pixel ${M.pixel}, 7d klick)`);
  else {
    adset = await api(`act_${act}/adsets`, { form: {
      name: k.adset, campaign_id: kampanj.id, status: 'PAUSED', billing_event: 'IMPRESSIONS', optimization_goal: 'OFFSITE_CONVERSIONS', destination_type: 'WEBSITE',
      promoted_object: JSON.stringify({ pixel_id: M.pixel, custom_event_type: 'PURCHASE' }),
      attribution_spec: JSON.stringify([{ event_type: 'CLICK_THROUGH', window_days: 7 }]),
      targeting: JSON.stringify({ geo_locations: { countries: k.geo, location_types: ['home', 'recent', 'frequently_in'] }, age_min: 18, age_max: 65, targeting_automation: { advantage_audience: 1 } }),
      dsa_beneficiary: 'STonebite', dsa_payor: 'STonebite',
    } });
    log(`✅ adset skapat PAUSED: ${adset.id}`);
  }

  if (!A) log(`inga annonser: ${kod}.json saknas (copy skrivs av sonnet mot docs/copy-regler.md)`);
  else {
    const finns = adset ? await alla(`${adset.id}/ads`, { fields: 'id,name,status' }, 50) : [];
    for (const an of A.annonser) {
      if (finns.find((x) => x.name === an.namn)) { log(`annons finns: ${an.namn}`); continue; }
      const fil = join(ROT, an.video);
      if (!existsSync(fil)) { log(`⚠️ ${an.namn}: videon saknas (${an.video}) — hoppar`); continue; }
      if (!skarpt || !adset) { log(`torrt: skulle ladda upp ${an.video} och skapa ${an.namn} (PAUSED) → ${k.lank}`); continue; }
      const videoId = await laddaUppVideo(act, fil);
      const thumb = await väntaPåThumb(videoId);
      const spec = { page_id: M.sida, instagram_user_id: M.instagram_user_id,
        video_data: { video_id: videoId, image_url: thumb, title: an.title, message: an.message, link_description: an.link_description, call_to_action: { type: 'SHOP_NOW', value: { link: k.lank } } } };
      const r = await skapaAnnons({ act, adsetId: adset.id, namn: an.namn, spec, enhancements: ingaEnhancements() });
      log(`✅ annons ${an.namn}: ${r.annonsId} PAUSED`);
    }
  }

  if (!kampanj) return null;
  const ads = adset ? (await alla(`${adset.id}/ads`, { fields: 'id,name,status,effective_status,creative{object_story_spec}' }, 50)).map((a) => ({ ...a, lank: a.creative?.object_story_spec?.video_data?.call_to_action?.value?.link ?? '' })) : [];
  for (const a of ads) if (!lankOk(k, a.lank)) log(`❌ ${a.name}: länken ${a.lank} matchar inte ${k.locale}/${k.geo.join(',')}`);
  if (aktivera && skarpt) {
    const f = farAktiveras(k, ads);
    if (!f.ok) log(`⛔ aktiverar INTE ${k.kampanj}: ${f.skal}`);
    else {
      for (const a of ads) if (a.status !== 'ACTIVE') await api(a.id, { form: { status: 'ACTIVE' } });
      if (adset.status !== 'ACTIVE') await api(adset.id, { form: { status: 'ACTIVE' } });
      if (kampanj.status !== 'ACTIVE') await api(kampanj.id, { form: { status: 'ACTIVE' } });
      log(`✅ aktiverat ${k.kampanj}: ${ads.length} annonser, adsetet, kampanjen (${k.budget_sek_dag} kr/dag)`);
    }
  }
  const k3 = await api(kampanj.id, { params: { fields: 'id,name,status,effective_status,daily_budget' } });
  const ads3 = adset ? await alla(`${adset.id}/ads`, { fields: 'id,name,status,effective_status' }, 50) : [];
  log(`tillbakaläst: ${k3.name} ${k3.status}/${k3.effective_status} ${Number(k3.daily_budget) / 100} kr/dag · adset ${adset ? `${adset.id}` : '—'} · ${ads3.length} annonser${ads3.length ? `: ${ads3.map((a) => `${a.name} ${a.status}`).join(', ')}` : ''}`);
  return { kod, kampanj: k3, adset: adset ? { id: adset.id, namn: k.adset } : null, annonser: ads3 };
}

async function huvud() {
  const konto = await api(`act_${M.konto}`, { params: { fields: 'name,currency' } });
  if (konto.name !== M.konto_namn) throw new Error(`Kontot heter "${konto.name}", marknader.json säger "${M.konto_namn}" — fel konto, stopp.`);
  log(`Konto: ${konto.name} (${M.konto}, ${konto.currency}) — ${skarpt ? 'SKARPT' : 'torrt'}${aktivera ? ' + aktivera' : ''}`);
  if (arg.includes('--lage')) {
    const namn = new Set(Object.values(M.kampanjer).map((k) => k.kampanj));
    const alla_ = (await api(`act_${M.konto}/campaigns`, { params: { fields: 'id,name,status,effective_status,daily_budget', limit: 200 } })).data ?? [];
    for (const c of alla_.filter((c) => namn.has(c.name))) log(`${c.name}: ${c.id} ${c.status}/${c.effective_status} ${Number(c.daily_budget) / 100} kr/dag`);
    return;
  }
  const koder = arg.includes('--alla') ? Object.keys(M.kampanjer) : [arg[arg.indexOf('--marknad') + 1]].filter(Boolean);
  if (!koder.length) { console.error('Ange --marknad <KOD>, --alla eller --lage'); process.exit(2); }
  const lage = [];
  for (const kod of koder) lage.push(await byggMarknad(kod));
  // Slå ihop med filen: en körning med --marknad NO får bara byta ut NO-raden. Utan det
  // skrev 2026-09-28 års NO-körning över läget för de elva andra kampanjerna.
  const fil = join(ROT, 'lage.json');
  const forra = existsSync(fil) ? (JSON.parse(readFileSync(fil, 'utf8')).kampanjer ?? []) : [];
  writeFileSync(fil, JSON.stringify({ _om: 'Skrivet av annonser/bygg.mjs efter tillbakaläsning ur kontot.', skrivet: new Date().toISOString(), kampanjer: slaIhopLage(forra, lage.filter(Boolean)) }, null, 1) + '\n');
}

/** Ren: nya rader ersätter gamla med samma kod, övriga står kvar, ordningen följer marknader.json. */
export function slaIhopLage(forra, nya, ordning = Object.keys(M.kampanjer)) {
  const per = new Map(forra.map((k) => [k.kod, k]));
  for (const k of nya) per.set(k.kod, k);
  return [...per.values()].sort((a, b) => ordning.indexOf(a.kod) - ordning.indexOf(b.kod));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
