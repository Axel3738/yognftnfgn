#!/usr/bin/env node
// ops-video-launch.mjs — bygger en OPS-butiks HELA kampanjstruktur i det
// gemensamma OPS-kontot (MagiBorsten DK 915422744950975, valuta SEK).
// Systerskript till no-video-launch.mjs, med tre skillnader som FAS2 uppdrag B
// kräver: allt Graph-anrop går genom tools/meta-lib.mjs (rate limit + backoff
// på kod 17), kampanjnamnet måste bära butikens brandprefix, och sida/pixel/
// länk verifieras mot verkligheten innan något skapas.
//
//   node pipeline/ops-video-launch.mjs waves/tankguard-video.config.mjs [flaggor]
//
//   --dry             visar planen, skapar ingenting
//   --bara-struktur   bygger kampanj + adsets men INGA annonser (för butiker
//                     vars Meta-sida eller videofiler inte finns än)
//   --verifiera       skapar inget: läser tillbaka strukturen och jämför mot
//                     konfigen på alla tre nivåer
//
// Struktur = samma som no-video-launch.mjs (Temu-flödets förebild):
//   kampanj  OUTCOME_SALES, CBO daily_budget ur konfigen, LOWEST_COST_WITHOUT_CAP
//   adsets   ett per koncept, ingen egen budget, OFFSITE_CONVERSIONS→PURCHASE
//   annonser video_data + thumbnail, alla creative enhancements OPT_OUT
//
// SPÄRRAR SOM INTE GÅR ATT FLAGGA BORT:
//  1. Konfigen måste sätta status EXPLICIT på alla tre nivåer. Saknas ett fält
//     vägrar skriptet köra (batch.mjs/uk-wave.mjs/mastern-batch.mjs har lärt oss
//     varför: annonser som föds ACTIVE av misstag spenderar på sekunden).
//  2. Kontot läses live. Konfigens valuta måste stämma med kontots — 1000 kr/dag
//     är 100000 i öre bara om kontot är SEK.
//  3. Kampanjnamnet måste börja med konfigens brandPrefix. OPS-kontot bär ALLA
//     OPS-butiker plus Bäverbutikens danska kampanjer; utan prefix går datan
//     inte att skära per butik och "hitta kampanjen" träffar fel verksamhet.
//  4. Pixeln måste ägas av målkontot, och får aldrig vara en annan verksamhets.
//     Fel pixel bokför köpen på fel butik — och syns aldrig som ett felmeddelande.
//  5. Sidan läses ur Graph. Går den inte att läsa avbryts körningen — en gissad
//     sida är fel verksamhet.
//  6. Länken gissas aldrig: absolut https-URL på butikens egen domän, annars
//     avbryt. Aldrig en fallback till startsidan.
//  7. Befintlig kampanj återanvänds på exakt namn. Är den PAUSED med spend > 0
//     är den avvecklad med flit och rörs inte.
//
// Idempotent: kampanj/adsets/videor återanvänds på namn, annonser hoppar över
// dubbletter. Går att köra om när sidan eller videofilerna kommit på plats.

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  säkerställProxy, api, alla, spend, väntaPåThumb, ingaEnhancements, logg,
} from '../tools/meta-lib.mjs';

säkerställProxy();

const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const BARA_STRUKTUR = args.includes('--bara-struktur');
const VERIFIERA = args.includes('--verifiera');
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

const configPath = args.find((a) => !a.startsWith('--'));
if (!configPath) dö('Ange en vågkonfig: node pipeline/ops-video-launch.mjs waves/<butik>-video.config.mjs');
const cfg = (await import(path.resolve(configPath))).default;

// ── Spärr 1: alla fält explicit, statusarna på alla tre nivåer ──
for (const f of ['act', 'brandPrefix', 'domain', 'page', 'pixel', 'country', 'campaignName',
  'link', 'dailyBudget', 'campaignStatus', 'adsetStatus', 'adStatus', 'videoDir', 'adsets']) {
  if (cfg[f] === undefined) dö(`Konfigen saknar "${f}" — alla fält sätts EXPLICIT, inga defaultvärden.`);
}
for (const [fält, nivå] of [['campaignStatus', 'kampanj'], ['adsetStatus', 'adset'], ['adStatus', 'annons']]) {
  if (!['ACTIVE', 'PAUSED'].includes(cfg[fält])) dö(`${fält} måste vara ACTIVE eller PAUSED (${nivå}nivån), inte "${cfg[fält]}".`);
}
const ACT = String(cfg.act).replace(/^act_/, '');
// videoDir är ALLTID relativ repo-roten (no-video-launch.mjs räknar från pipeline/,
// vilket blir tvetydigt när konfigen ligger i pipeline/waves/).
const ROT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const videoDir = path.resolve(ROT, cfg.videoDir);

// ── Spärr 2: kontot läses live, valutan måste stämma ──
const konto = await api(`act_${ACT}`, { params: { fields: 'name,currency,account_status,min_daily_budget' } });
if (cfg.currency && konto.currency !== cfg.currency) {
  dö(`Kontot ${konto.name} är i ${konto.currency}, konfigen säger ${cfg.currency}. dailyBudget är i minsta valutaenhet — fel valuta är fel budget.`);
}
if (Number(cfg.dailyBudget) < Number(konto.min_daily_budget || 0)) {
  dö(`dailyBudget ${cfg.dailyBudget} är under kontots minimum ${konto.min_daily_budget}.`);
}
logg(`\n=== ${cfg.campaignName}`);
logg(`    konto ${konto.name} (act_${ACT}, ${konto.currency}) · ${Number(cfg.dailyBudget) / 100} ${konto.currency}/dag CBO`);
logg(`    läge: ${VERIFIERA ? 'VERIFIERA' : DRY ? 'DRY RUN' : BARA_STRUKTUR ? 'SKARPT (bara struktur)' : 'SKARPT'}\n`);

// ── Spärr 3: brandprefixet ──
if (!cfg.campaignName.startsWith(cfg.brandPrefix)) {
  dö(`Kampanjnamnet måste börja med brandprefixet "${cfg.brandPrefix}" — kontot bär flera butiker och datan skärs på prefixet.`);
}
for (const adset of cfg.adsets) {
  for (const ad of adset.ads) {
    if (!ad.name.startsWith(cfg.brandPrefix)) dö(`Annonsen "${ad.name}" saknar brandprefixet "${cfg.brandPrefix}".`);
  }
}

// ── Spärr 4: pixeln ägs av målkontot ──
const pixlar = await alla(`act_${ACT}/adspixels`, { fields: 'id,name,owner_ad_account' }, 50);
const pixel = pixlar.find((p) => p.id === String(cfg.pixel));
if (!pixel) {
  dö(`Pixel ${cfg.pixel} finns inte i act_${ACT}. Kontots pixlar: ${pixlar.map((p) => `${p.name} (${p.id})`).join(', ') || 'inga'}.`);
}
if (pixel.owner_ad_account?.account_id && pixel.owner_ad_account.account_id !== ACT) {
  dö(`Pixel ${cfg.pixel} ("${pixel.name}") ägs av act_${pixel.owner_ad_account.account_id}, inte målkontot. Fel pixel bokför köpen på fel verksamhet.`);
}
logg(`✓ pixel: ${pixel.name} (${pixel.id}) — ägs av målkontot`);

// ── Spärr 6: länken gissas aldrig ──
let url;
try { url = new URL(cfg.link); } catch { dö(`link "${cfg.link}" är ingen giltig URL.`); }
if (url.protocol !== 'https:') dö(`link måste vara https, inte ${url.protocol}`);
if (url.hostname !== cfg.domain) dö(`link pekar på ${url.hostname}, butikens domän är ${cfg.domain}. Länken gissas aldrig.`);
if (url.pathname === '/' || url.pathname === '') dö('link pekar på startsidan — annonser ska alltid gå till produktsidan.');
logg(`✓ länk: ${cfg.link}`);

// ── Spärr 5: sidan läses ur Graph ──
let sida = null;
if (cfg.page) {
  try {
    sida = await api(String(cfg.page), { params: { fields: 'id,name,link' } });
  } catch (e) {
    dö(`Sidan ${cfg.page} går inte att läsa (${e.message}). En gissad sida är fel verksamhet — avbryter.`);
  }
  logg(`✓ sida: ${sida.name} (${sida.id})`);
} else if (BARA_STRUKTUR || VERIFIERA) {
  logg('⚠ page saknas i konfigen — inga annonser kan byggas (creative kräver page_id).');
} else {
  dö('page saknas i konfigen. Skapa butikens Meta-sida först, eller kör med --bara-struktur för att bygga kampanj + adsets utan annonser.');
}

const annonserPlanerade = cfg.adsets.flatMap((a) => a.ads);

// ══════════════════════════════════════════════════════ VERIFIERA
if (VERIFIERA) {
  const kampanjer = await alla(`act_${ACT}/campaigns`, { fields: 'id,name,status,objective,daily_budget,bid_strategy' }, 100);
  const k = kampanjer.find((c) => c.name === cfg.campaignName);
  if (!k) dö(`Kampanjen "${cfg.campaignName}" finns inte i act_${ACT}.`);

  const rader = [];
  const kolla = (nivå, fält, vantat, faktiskt) =>
    rader.push({ nivå, fält, vantat: String(vantat), faktiskt: String(faktiskt), ok: String(vantat) === String(faktiskt) });

  logg(`\n── KAMPANJ ${k.name} (${k.id})`);
  kolla('kampanj', 'daily_budget', cfg.dailyBudget, k.daily_budget);
  kolla('kampanj', 'status', cfg.campaignStatus, k.status);
  kolla('kampanj', 'objective', 'OUTCOME_SALES', k.objective);
  kolla('kampanj', 'bid_strategy', 'LOWEST_COST_WITHOUT_CAP', k.bid_strategy);

  const adsets = await alla(`${k.id}/adsets`, { fields: 'id,name,status,promoted_object,targeting,daily_budget,optimization_goal' }, 50);
  logg(`── ADSETS (${adsets.length})`);
  for (const cfgAdset of cfg.adsets) {
    const a = adsets.find((x) => x.name === cfgAdset.name);
    if (!a) { rader.push({ nivå: 'adset', fält: cfgAdset.name, vantat: 'finns', faktiskt: 'SAKNAS', ok: false }); continue; }
    logg(`   ${a.name} (${a.id})`);
    kolla('adset', `${a.name}·pixel_id`, cfg.pixel, a.promoted_object?.pixel_id);
    kolla('adset', `${a.name}·custom_event_type`, 'PURCHASE', a.promoted_object?.custom_event_type);
    kolla('adset', `${a.name}·status`, cfg.adsetStatus, a.status);
    kolla('adset', `${a.name}·land`, cfg.country, (a.targeting?.geo_locations?.countries || []).join(','));
    kolla('adset', `${a.name}·egen budget`, 'ingen (CBO)', a.daily_budget ? a.daily_budget : 'ingen (CBO)');
  }

  const annonser = await alla(`${k.id}/ads`, { fields: 'id,name,status,creative{object_story_spec}' }, 100);
  logg(`── ANNONSER (${annonser.length} i kontot, ${annonserPlanerade.length} i konfigen)`);
  for (const planerad of annonserPlanerade) {
    const a = annonser.find((x) => x.name === planerad.name);
    if (!a) { rader.push({ nivå: 'annons', fält: planerad.name, vantat: 'finns', faktiskt: 'SAKNAS', ok: false }); continue; }
    const spec = a.creative?.object_story_spec;
    kolla('annons', `${a.name}·page_id`, cfg.page, spec?.page_id);
    kolla('annons', `${a.name}·länk`, cfg.link, spec?.video_data?.call_to_action?.value?.link);
    kolla('annons', `${a.name}·status`, cfg.adStatus, a.status);
  }

  logg('\n── RESULTAT');
  for (const r of rader) logg(`  ${r.ok ? '✅' : '❌'} ${r.nivå.padEnd(8)} ${r.fält.padEnd(46)} ${r.ok ? r.faktiskt : `väntat ${r.vantat}, fick ${r.faktiskt}`}`);
  const fel = rader.filter((r) => !r.ok);
  logg(`\n${fel.length === 0 ? '✅ ALLT STÄMMER' : `❌ ${fel.length} av ${rader.length} avvikelser`}`);
  process.exit(fel.length === 0 ? 0 : 2);
}

// ══════════════════════════════════════════════════════ VIDEOR
const vids = new Map();
if (!BARA_STRUKTUR) {
  for (const v of await alla(`act_${ACT}/advideos`, { fields: 'title,id,status' }, 100)) {
    vids.set((v.title || '').replace(/\.\w+$/, '').trim(), v.id);
  }
  for (const ad of annonserPlanerade) {
    const fil = path.join(videoDir, ad.file);
    if (!existsSync(fil)) dö(`videofil saknas: ${fil}`);
    if (vids.has(ad.name)) { logg(`  · video finns redan i kontot: ${ad.name}`); continue; }
    if (DRY) { logg(`  [dry] skulle ladda upp ${ad.file} som "${ad.name}"`); continue; }
    const form = new FormData();
    form.append('source', new Blob([readFileSync(fil)], { type: 'video/mp4' }), path.basename(fil));
    form.append('title', ad.name);
    const r = await api(`act_${ACT}/advideos`, { form });
    if (!r.id) dö(`Metas advideos gav ingen video-id för ${ad.name}.`);
    vids.set(ad.name, r.id);
    logg(`  ✓ video uppladdad: ${ad.name} (${r.id})`);
  }
}

if (DRY) {
  logg('\nPLAN:');
  logg(`  kampanj (${cfg.campaignStatus}): ${cfg.campaignName}`);
  for (const a of cfg.adsets) {
    logg(`  adset (${cfg.adsetStatus}): ${a.name}`);
    for (const ad of a.ads) logg(`     annons (${cfg.adStatus}): ${ad.name}${BARA_STRUKTUR ? ' — HOPPAS ÖVER (--bara-struktur)' : ''}`);
  }
  logg('\nDry run — inget skapat i kontot.');
  process.exit(0);
}

// ══════════════════════════════════════════════════════ KAMPANJ (CBO)
const kampanjer = await alla(`act_${ACT}/campaigns`, { fields: 'id,name,status,daily_budget' }, 100);
const befintlig = kampanjer.find((c) => c.name === cfg.campaignName);
let campaignId;
if (befintlig) {
  // Spärr 7: PAUSED med spend är ett beslut, aldrig ett fel att rätta.
  if (befintlig.status !== 'ACTIVE' && (await spend(befintlig.id)) > 0) {
    dö(`Kampanjen "${cfg.campaignName}" är ${befintlig.status} och har spenderat — den är avvecklad med flit och rörs inte.`);
  }
  campaignId = befintlig.id;
  logg(`· återanvänder kampanj ${cfg.campaignName} (${campaignId})`);
} else {
  const c = await api(`act_${ACT}/campaigns`, { form: {
    name: cfg.campaignName,
    objective: 'OUTCOME_SALES',
    status: cfg.campaignStatus,
    daily_budget: cfg.dailyBudget,
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    special_ad_categories: '[]',
  } });
  campaignId = c.id;
  logg(`✓ kampanj (${cfg.campaignStatus}, ${Number(cfg.dailyBudget) / 100} ${konto.currency}/dag CBO): ${campaignId}`);
}

// ══════════════════════════════════════════════════════ ADSETS
const priorAdsets = await alla(`${campaignId}/adsets`, { fields: 'id,name,status' }, 50);
const targeting = JSON.stringify(cfg.targeting ?? {
  age_min: 18,
  age_max: 65,
  geo_locations: { countries: [cfg.country], location_types: ['home', 'recent'] },
  targeting_automation: { advantage_audience: 1 },
});

for (const adsetCfg of cfg.adsets) {
  let adsetId = priorAdsets.find((a) => a.name === adsetCfg.name)?.id;
  if (adsetId) {
    logg(`· återanvänder adset ${adsetCfg.name} (${adsetId})`);
  } else {
    const a = await api(`act_${ACT}/adsets`, { form: {
      name: adsetCfg.name,
      campaign_id: campaignId,
      status: cfg.adsetStatus,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'OFFSITE_CONVERSIONS',
      destination_type: 'WEBSITE',
      promoted_object: JSON.stringify({ pixel_id: String(cfg.pixel), custom_event_type: 'PURCHASE' }),
      attribution_spec: JSON.stringify([{ event_type: 'CLICK_THROUGH', window_days: 7 }]),
      targeting,
    } });
    adsetId = a.id;
    logg(`✓ adset (${cfg.adsetStatus}, ${cfg.country}): ${adsetCfg.name} (${adsetId})`);
  }

  if (BARA_STRUKTUR) continue;

  const priorAds = new Set((await alla(`${adsetId}/ads`, { fields: 'name' }, 100)).map((x) => x.name));
  for (const ad of adsetCfg.ads) {
    if (priorAds.has(ad.name)) { logg(`  · annons finns redan: ${ad.name}`); continue; }
    const videoId = vids.get(ad.name);
    const thumb = await väntaPåThumb(videoId);
    const creative = await api(`act_${ACT}/adcreatives`, { form: {
      name: ad.name,
      object_story_spec: JSON.stringify({
        page_id: String(cfg.page),
        video_data: {
          video_id: videoId,
          title: adsetCfg.copy.headline,
          message: adsetCfg.copy.message,
          link_description: adsetCfg.copy.description,
          image_url: thumb,
          call_to_action: { type: 'SHOP_NOW', value: { link: cfg.link } },
        },
      }),
      degrees_of_freedom_spec: JSON.stringify(ingaEnhancements({ inlineKommentar: true })),
    } });
    await api(`act_${ACT}/ads`, { form: {
      name: ad.name,
      adset_id: adsetId,
      creative: JSON.stringify({ creative_id: creative.id }),
      status: cfg.adStatus,
    } });
    logg(`  ✓ annons (${cfg.adStatus}): ${ad.name}`);
  }
}

if (BARA_STRUKTUR) {
  logg(`\nSTRUKTUREN KLAR — ${cfg.adsets.length} adsets, 0 annonser (--bara-struktur).`);
  logg(`Kvar: ${cfg.page ? '' : 'butikens Meta-sida (page saknas i konfigen), '}videofilerna i ${cfg.videoDir}.`);
} else {
  logg('\nKLART.');
}
logg(`Verifiera med: node ${path.relative(process.cwd(), process.argv[1])} ${configPath} --verifiera`);
