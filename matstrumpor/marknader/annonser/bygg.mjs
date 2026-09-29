// bygg.mjs — Matstrumpors annonskampanjer per marknad i kontot "nya kungen", via META_ACCESS_TOKEN.
//
//   node matstrumpor/marknader/annonser/bygg.mjs --marknad NO            # torrt
//   node matstrumpor/marknader/annonser/bygg.mjs --marknad NO --skarpt   # kampanj + adset + annonser, allt PAUSED
//   node matstrumpor/marknader/annonser/bygg.mjs --marknad NO --skarpt --aktivera   # slår på det den själv byggt
//   node matstrumpor/marknader/annonser/bygg.mjs --alla [--skarpt]       # alla kampanjer i marknader.json
//   node matstrumpor/marknader/annonser/bygg.mjs --lage                  # läs läget i kontot
//   node matstrumpor/marknader/annonser/bygg.mjs --marknad NO --skarpt --byt-video
//       byter videon i annonser som redan finns när filen i klar/ har ändrats (ny creative,
//       samma annons, fortfarande PAUSED). videor.json minns vilken fil varje annons bär.
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
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { api, alla, laddaUppVideo, laddaUppBild, väntaPåThumb, ingaEnhancements, skapaAnnons } from '../../../tools/meta-lib.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const M = JSON.parse(readFileSync(join(ROT, 'marknader.json'), 'utf8'));
const arg = process.argv.slice(2);
const skarpt = arg.includes('--skarpt');
const aktivera = arg.includes('--aktivera');
const bytVideo = arg.includes('--byt-video');
const log = (s) => console.log(s);
// Vilken fil varje annons bär (sha256 av filen i klar/). Utan minnet går det inte att veta om en
// annons redan har den nya videon — 2026-09-28 byttes speed-renderingarna mot precision.
const VIDEOR = join(ROT, 'videor.json');
const videor = existsSync(VIDEOR) ? JSON.parse(readFileSync(VIDEOR, 'utf8')) : {};
const sha = (fil) => createHash('sha256').update(readFileSync(fil)).digest('hex');
const sparaVideor = () => writeFileSync(VIDEOR, JSON.stringify(videor, null, 1) + '\n');

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
  // Egen domän (A/B-testets B-sida i Norge, `doman` i marknader.json): länken ska gå dit, aldrig till .se.
  if (k.doman) { if (!lank.startsWith(`https://${k.doman}/`)) return false; }
  else if (!lank.includes(`matstrumpor.se/${k.locale}/`)) return false;
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
    // Video (an.video, eller an.video_fran = en annan annons vars video återanvänds — A/B-testets B-kampanj
    // bär exakt samma video som A) eller bild (an.bild, eller an.bild_fran) med link_data.
    const spec = (an, media) => media.image_hash
      ? { page_id: M.sida, instagram_user_id: M.instagram_user_id,
        link_data: { image_hash: media.image_hash, link: k.lank, message: an.message, name: an.title, description: an.link_description, call_to_action: { type: 'SHOP_NOW', value: { link: k.lank } } } }
      : { page_id: M.sida, instagram_user_id: M.instagram_user_id,
        video_data: { video_id: media.video_id, image_url: media.thumb, title: an.title, message: an.message, link_description: an.link_description, call_to_action: { type: 'SHOP_NOW', value: { link: k.lank } } } };
    const kallfil = (an) => an.bild ?? an.video ?? null;
    const media = async (an) => {
      const fran = an.video_fran ?? an.bild_fran;
      if (fran) {
        const v = videor[fran];
        if (!v?.video_id && !v?.image_hash) throw new Error(`${an.namn}: ${fran} finns inte i videor.json — bygg A-annonsen först`);
        if (v.image_hash) return { image_hash: v.image_hash, sha256: v.sha256, fil: v.fil };
        return { video_id: v.video_id, thumb: await väntaPåThumb(v.video_id), sha256: v.sha256, fil: v.fil };
      }
      const fil = join(ROT, kallfil(an));
      if (an.bild) return { image_hash: await laddaUppBild(act, fil), sha256: sha(fil), fil: an.bild };
      const videoId = await laddaUppVideo(act, fil);
      return { video_id: videoId, thumb: await väntaPåThumb(videoId), sha256: sha(fil), fil: an.video };
    };
    const minne = (an, m, extra) => ({ sha256: m.sha256, fil: m.fil, ...(m.image_hash ? { image_hash: m.image_hash } : { video_id: m.video_id }), ...(an.video_fran || an.bild_fran ? { fran: an.video_fran ?? an.bild_fran } : {}), ...extra });
    for (const an of A.annonser) {
      const lanad = !!(an.video_fran || an.bild_fran);
      const fil = kallfil(an) ? join(ROT, kallfil(an)) : null;
      const gammal = finns.find((x) => x.name === an.namn);
      if (gammal) {
        if (!bytVideo || lanad) { log(`annons finns: ${an.namn}`); continue; }
        if (!existsSync(fil)) { log(`⚠️ ${an.namn}: filen saknas (${kallfil(an)}) — behåller den gamla`); continue; }
        const hash = sha(fil);
        if (videor[an.namn]?.sha256 === hash) { log(`annons finns med samma fil: ${an.namn}`); continue; }
        if (!skarpt) { log(`torrt: skulle byta filen i ${an.namn} (${gammal.id}) mot ${kallfil(an)}`); continue; }
        const m = await media(an);
        const creative = await api(`act_${act}/adcreatives`, { form: { name: an.namn, object_story_spec: JSON.stringify(spec(an, m)), degrees_of_freedom_spec: JSON.stringify(ingaEnhancements()) } });
        await api(gammal.id, { form: { creative: JSON.stringify({ creative_id: creative.id }) } });
        const las = await api(gammal.id, { params: { fields: 'status,creative{id}' } });
        if (las.creative?.id !== creative.id) throw new Error(`${an.namn}: creative byttes inte (läst ${las.creative?.id}, ville ${creative.id})`);
        videor[an.namn] = minne(an, m, { creative_id: creative.id, annons_id: gammal.id, bytt: new Date().toISOString() });
        sparaVideor();
        log(`✅ ny fil i ${an.namn} (${gammal.id}): creative ${creative.id}, status ${las.status}`);
        continue;
      }
      if (!lanad && !existsSync(fil)) { log(`⚠️ ${an.namn}: filen saknas (${kallfil(an)}) — hoppar`); continue; }
      if (lanad && !videor[an.video_fran ?? an.bild_fran]) { log(`⚠️ ${an.namn}: ${an.video_fran ?? an.bild_fran} är inte uppladdad än (videor.json) — hoppar, kör om när A-annonsen finns`); continue; }
      if (!skarpt || !adset) { log(`torrt: skulle ${lanad ? `återanvända ${an.video_fran ?? an.bild_fran}:s ${an.bild_fran ? 'bild' : 'video'}` : `ladda upp ${kallfil(an)}`} och skapa ${an.namn} (PAUSED) → ${k.lank}`); continue; }
      const m = await media(an);
      const r = await skapaAnnons({ act, adsetId: adset.id, namn: an.namn, spec: spec(an, m), enhancements: ingaEnhancements() });
      videor[an.namn] = minne(an, m, { creative_id: r.creativeId, annons_id: r.annonsId, skapad: new Date().toISOString() });
      sparaVideor();
      log(`✅ annons ${an.namn}: ${r.annonsId} PAUSED`);
    }
  }

  if (!kampanj) return null;
  const ads = adset ? (await alla(`${adset.id}/ads`, { fields: 'id,name,status,effective_status,creative{object_story_spec}' }, 50)).map((a) => { const o = a.creative?.object_story_spec ?? {}; return { ...a, lank: (o.video_data ?? o.link_data)?.call_to_action?.value?.link ?? o.link_data?.link ?? '' }; }) : [];
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
