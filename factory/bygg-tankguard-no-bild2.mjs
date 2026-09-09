// TANKGUARD_NO — bildannonserna vars media var smutsig och nu är omplåstrad.
//
//   node factory/bygg-tankguard-no-bild2.mjs [--dry]
//
// Elva norska källbilder bar pris, rabatt, frakt, betalsätt, returrätt,
// stjärnor eller källbutikens domän inbränt i pixlarna. Raderna är utbytta
// med factory/bildplaster.py; här laddas de omplåstrade filerna upp och
// annonserna byggs.
//
// SP_2_1 är ett specialfall: den släpptes igenom av en för snäll grind och
// ligger REDAN uppe med smutsig media. Den får inte en ny annons — dess
// befintliga annons pekas om till den rena bilden.
import {
  säkerställProxy, api, alla, laddaUppBild, skapaAnnons, ingaEnhancements, logg,
} from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
säkerställProxy();

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const ACT = '915422744950975';
const SIDA = '1399193996606775';
const PIXEL = '2196132151319625';
const LÄNK = 'https://tankguard.se/nb/products/tankoverdraget';
const KAMPANJNAMN = 'TANKGUARD_NO_Tanktrekket | 2026-09-09';
const TORR = process.argv.includes('--dry');

const NYA = ['BOF_1_1', 'BOF_2_1', 'BOF_6_1', 'CS_2_1', 'CS_3_1', 'CS_4_1',
  'RV_1_1', 'RV_2_1', 'RV_3_1', 'RV_4_1'];
const BYTS = ['SP_2_1'];

const copy = JSON.parse(readFileSync('/home/user/yognftnfgn/factory/output/tankguard/no-annonstexter.json', 'utf8')).block;

const FÖRBJUDET = [
  [/\d+\s*(kr|kroner|nok)\b/i, 'pris'],
  [/\d+\s*%/, 'procent'],
  [/[★⭐]/, 'stjärnor'],
  [/b[aäe]v[eo]r?[\s-]?butik/i, 'källvarumärke'],
  [/frakt|klarna|åpent kjøp|apent kjop/i, 'villkor'],
];

const state = existsSync(`${S}/no-bild2.json`) ? JSON.parse(readFileSync(`${S}/no-bild2.json`, 'utf8')) : {};
state.media ||= {}; state.annonser ||= {};
const spara = () => writeFileSync(`${S}/no-bild2.json`, JSON.stringify(state, null, 2));

const kampanj = (await alla(`act_${ACT}/campaigns`, { fields: 'id,name' })).find((k) => k.name === KAMPANJNAMN);
if (!kampanj) throw new Error(`Hittar inte "${KAMPANJNAMN}".`);
const adsets = await alla(`${kampanj.id}/adsets`, { fields: 'id,name' }, 50);
const adsetFor = (v) => adsets.find((a) => a.name.endsWith(` - ${v}`))?.id;
const mall = await api(adsets[0].id, { params: { fields: 'targeting,billing_event,optimization_goal,attribution_spec' } });

const befintliga = await alla(`${kampanj.id}/ads`, { fields: 'id,name,status,creative{object_story_spec}' }, 200);
const finns = new Map(befintliga.map((a) => [a.name, a]));
logg(`Kampanjen har ${befintliga.length} annonser sedan tidigare.`);

async function säkerställAdset(vinkel) {
  const träff = adsetFor(vinkel);
  if (träff) return träff;
  const namn = `TANKGUARD_NO_Tanktrekket - ${vinkel}`;
  if (TORR) { logg(`(torr) skulle skapa adset ${namn}`); return 'TORR'; }
  const kropp = {
    name: namn, campaign_id: kampanj.id, status: 'PAUSED',
    billing_event: mall.billing_event, optimization_goal: mall.optimization_goal,
    targeting: JSON.stringify(mall.targeting),
    promoted_object: JSON.stringify({ pixel_id: PIXEL, custom_event_type: 'PURCHASE' }),
  };
  if (mall.attribution_spec) kropp.attribution_spec = JSON.stringify(mall.attribution_spec);
  const r = await api(`act_${ACT}/adsets`, { form: kropp });
  adsets.push({ id: r.id, name: namn });
  logg(`  Adset ${vinkel}: ${r.id} (PAUSED, geo NO)`);
  return r.id;
}

async function ladda(kort) {
  const fil = `${S}/no-bild-ren/${kort}.jpg`;
  if (!existsSync(fil)) return null;
  if (!state.media[kort]) { state.media[kort] = await laddaUppBild(ACT, fil); spara(); logg(`⬆ ${kort} → ${state.media[kort]}`); }
  return state.media[kort];
}

const enh = ingaEnhancements();
let byggda = 0; const väntar = [];

for (const kort of NYA) {
  const namn = `TankGuard_NO_${kort}`;
  if (finns.has(namn) || state.annonser[namn]?.annonsId) { logg(`↩︎ ${namn} finns redan`); byggda++; continue; }
  const c = copy[kort];
  if (!c) { väntar.push(`${kort} (ingen copy)`); continue; }
  const text = [c.message, c.title, c.beskrivning].filter(Boolean).join(' \n ');
  const brott = FÖRBJUDET.filter(([re]) => re.test(text)).map(([, v]) => v);
  if (brott.length) { logg(`❌ ${namn}: copyn bär ${brott.join(', ')}`); väntar.push(`${kort} (copy: ${brott.join(', ')})`); continue; }
  if (TORR) { logg(`(torr) skulle bygga ${namn}`); continue; }

  const hash = await ladda(kort);
  if (!hash) { väntar.push(`${kort} (ingen omplåstrad fil)`); continue; }
  const adsetId = await säkerställAdset(kort.split('_')[0]);
  const spec = { page_id: SIDA, link_data: {
    image_hash: hash, link: LÄNK, message: c.message, name: c.title,
    description: c.beskrivning || undefined,
    call_to_action: { type: 'SHOP_NOW', value: { link: LÄNK } },
  } };
  try {
    const r = await skapaAnnons({ act: ACT, adsetId, namn, spec, enhancements: enh });
    state.annonser[namn] = { ...r, kort }; spara();
    logg(`✅ ${namn} → annons ${r.annonsId} (PAUSED)`);
    byggda++;
  } catch (e) {
    state.annonser[namn] = { fel: e.message }; spara();
    logg(`❌ ${namn}: ${e.message.slice(0, 180)}`);
    väntar.push(`${kort} (${e.message.slice(0, 80)})`);
  }
}

// Byt bilden i den annons som redan ligger uppe med smutsig media.
for (const kort of BYTS) {
  const namn = `TankGuard_NO_${kort}`;
  const ad = finns.get(namn);
  if (!ad) { logg(`⚠️ ${namn}: annonsen finns inte`); continue; }
  if (state.annonser[namn]?.bytt) { logg(`↩︎ ${namn} redan bytt`); continue; }
  if (ad.status !== 'PAUSED') { logg(`⛔ ${namn} är ${ad.status} — byter inte creative på något som kan spendera`); continue; }
  if (TORR) { logg(`(torr) skulle byta bilden i ${namn} (${ad.id})`); continue; }
  const hash = await ladda(kort);
  if (!hash) { väntar.push(`${kort} (ingen omplåstrad fil)`); continue; }
  const ld = ad.creative?.object_story_spec?.link_data;
  if (!ld) { logg(`⚠️ ${namn}: ingen link_data`); continue; }
  const c = await api(`act_${ACT}/adcreatives`, { form: {
    name: `${namn} omplåstrad 2026-09-09`,
    object_story_spec: JSON.stringify({ page_id: SIDA, link_data: { ...ld, image_hash: hash } }),
    degrees_of_freedom_spec: JSON.stringify(enh),
  } });
  await api(ad.id, { form: { creative: JSON.stringify({ creative_id: c.id }) } });
  const efter = await api(ad.id, { params: { fields: 'creative{id},status' } });
  const ok = efter.creative?.id === c.id;
  state.annonser[namn] = { annonsId: ad.id, creative: c.id, bytt: ok }; spara();
  logg(`${ok ? '✅' : '❌'} ${namn}: bilden bytt → creative ${c.id} (${efter.status})`);
}

logg(`\nNya bildannonser uppe: ${byggda} av ${NYA.length}`);
if (väntar.length) logg(`Väntar: ${väntar.join(', ')}`);
