// TANKGUARD_NO: egen kampanj i SAMMA konto (915422744950975), geo NO, /nb-länk.
// Bara de creatives vars media är RENA enligt den norska mediagrinden.
// Allt föds PAUSED.
import { säkerställProxy, api, alla, laddaUppBild, skapaAnnons, ingaEnhancements, logg } from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
säkerställProxy();

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const ACT = '915422744950975';
const SIDA = '1399193996606775';
const PIXEL = '2196132151319625';
const LÄNK = 'https://tankguard.se/nb/products/tankoverdraget';
const KAMPANJNAMN = 'TANKGUARD_NO_Tanktrekket | 2026-09-09';
const TORR = process.argv.includes('--dry');

const copy = JSON.parse(readFileSync('/home/user/yognftnfgn/factory/output/tankguard/no-annonstexter.json', 'utf8')).block;
const grind = JSON.parse(readFileSync(`${S}/no-grind-bild.json`, 'utf8'));
const media = JSON.parse(readFileSync(`${S}/no-media.json`, 'utf8'));
const RENA = Object.entries(grind).filter(([, f]) => !f.length).map(([k]) => k).sort();
logg(`Rena norska bildcreatives: ${RENA.length} — ${RENA.join(', ')}`);

// Targeting läst ur den norska KÄLLKAMPANJEN (geo NO). Aldrig en fallback-geo.
const källa = JSON.parse(readFileSync(`${S}/kalla-NO.json`, 'utf8'));
const mall = källa.adsets.find(a => a.targeting?.geo_locations?.countries?.includes('NO'));
if (!mall) throw new Error('Hittade inget norskt adset att läsa targeting ur — avbryter hellre än gissar geo.');
logg(`Targeting-mall: "${mall.name}" geo=${JSON.stringify(mall.targeting.geo_locations.countries)}`);

const state = existsSync(`${S}/no-bygge.json`) ? JSON.parse(readFileSync(`${S}/no-bygge.json`, 'utf8')) : {};
const spara = () => writeFileSync(`${S}/no-bygge.json`, JSON.stringify(state, null, 2));

// 1. Kampanjen — finns den redan?
if (!state.kampanj) {
  const fanns = (await alla(`act_${ACT}/campaigns`, { fields: 'id,name' })).find(k => k.name === KAMPANJNAMN);
  if (fanns) { state.kampanj = fanns.id; logg(`Kampanjen fanns: ${fanns.id}`); }
  else if (TORR) { logg(`(torr) skulle skapa kampanj "${KAMPANJNAMN}"`); }
  else {
    const r = await api(`act_${ACT}/campaigns`, { form: {
      name: KAMPANJNAMN, objective: 'OUTCOME_SALES', status: 'PAUSED',
      special_ad_categories: JSON.stringify([]),
      daily_budget: 100000, bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    }});
    state.kampanj = r.id; logg(`✅ Kampanj skapad: ${r.id} (PAUSED, 1000 kr/dag, CBO)`);
  }
  spara();
}

// 2. Adsets per vinkel, geo NO, TankGuards pixel.
state.adsets ||= {};
async function adsetFor(vinkel) {
  if (state.adsets[vinkel]) return state.adsets[vinkel];
  const namn = `TANKGUARD_NO_Tanktrekket - ${vinkel}`;
  const fanns = (await alla(`${state.kampanj}/adsets`, { fields: 'id,name' }, 50)).find(a => a.name === namn);
  if (fanns) { state.adsets[vinkel] = fanns.id; spara(); return fanns.id; }
  if (TORR) { logg(`(torr) skulle skapa adset ${namn}`); return 'TORR'; }
  const kropp = {
    name: namn, campaign_id: state.kampanj, status: 'PAUSED',
    billing_event: mall.billing_event || 'IMPRESSIONS',
    optimization_goal: mall.optimization_goal || 'OFFSITE_CONVERSIONS',
    targeting: JSON.stringify(mall.targeting),
    promoted_object: JSON.stringify({ pixel_id: PIXEL, custom_event_type: 'PURCHASE' }),
  };
  if (mall.attribution_spec) kropp.attribution_spec = JSON.stringify(mall.attribution_spec);
  const r = await api(`act_${ACT}/adsets`, { form: kropp });
  state.adsets[vinkel] = r.id; spara();
  logg(`  Adset ${vinkel}: ${r.id} (PAUSED, geo NO, pixel ${PIXEL})`);
  return r.id;
}

// 3. Media upp i målkontot + annonser.
state.media ||= {}; state.annonser ||= {};
const enh = ingaEnhancements();
for (const kort of RENA) {
  const namn = `TankGuard_NO_${kort}`;
  if (state.annonser[namn]?.annonsId) { logg(`↩︎ ${namn} finns redan`); continue; }
  const c = copy[kort];
  if (!c) { logg(`⚠️ ${namn}: ingen copy`); continue; }
  const m = media[kort];
  if (!m?.fil) { logg(`⚠️ ${namn}: ingen mediafil`); continue; }

  if (!state.media[kort]) {
    if (TORR) { logg(`(torr) skulle ladda upp ${kort}`); continue; }
    state.media[kort] = await laddaUppBild(ACT, m.fil); spara();
    logg(`⬆ ${kort} → ${state.media[kort]}`);
  }
  const vinkel = kort.split('_')[0];
  const adsetId = await adsetFor(vinkel);
  if (TORR) { logg(`(torr) skulle skapa ${namn} i ${vinkel}`); continue; }

  const link_data = { image_hash: state.media[kort], link: LÄNK, message: c.message, name: c.title,
    call_to_action: { type: 'SHOP_NOW', value: { link: LÄNK } } };
  if (c.beskrivning) link_data.description = c.beskrivning;
  try {
    const r = await skapaAnnons({ act: ACT, adsetId, namn, spec: { page_id: SIDA, link_data }, enhancements: enh });
    state.annonser[namn] = { ...r, vinkel }; spara();
    logg(`✅ ${namn} → annons ${r.annonsId} (PAUSED) i ${vinkel}`);
  } catch (e) { state.annonser[namn] = { fel: e.message }; spara(); logg(`❌ ${namn}: ${e.message.slice(0, 180)}`); }
}
logg('\nKlart med den norska kampanjen.');
