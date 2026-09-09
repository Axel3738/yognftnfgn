// Byter bilden i redan byggda TankGuard-annonser till den omplåstrade filen.
//
//   node factory/byt-bild-tankguard.mjs se [--dry]
//
// Elva svenska bildannonser byggdes innan bildgrinden var tillräckligt sträng.
// De ligger uppe (PAUSED) med källbutikens pris, rabatt, frakt, betalsätt,
// returrätt, stjärnor och kundnamn inbränt i pixlarna. Raderna är utbytta med
// factory/bildplaster.py; här pekas annonserna om till de rena filerna.
//
// Metas creatives är oföränderliga: en ny creative byggs med SAMMA copy och den
// nya bilden, och annonsen pekas om. Annonsens id, namn, adset och status står
// kvar. Skriptet vägrar röra något som inte är PAUSED.
import {
  säkerställProxy, api, alla, laddaUppBild, ingaEnhancements, logg,
} from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
säkerställProxy();

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const ACT = '915422744950975';
const SIDA = '1399193996606775';
const TORR = process.argv.includes('--dry');
const MARKNAD = (process.argv[2] || 'se').toLowerCase();

const MARKNADER = {
  se: { kampanj: '120248995235740172', prefix: 'TankGuard_', filer: `${S}/se-bild-ren` },
  no: { kampanj: '120249012213810172', prefix: 'TankGuard_NO_', filer: `${S}/no-bild-ren` },
};
const M = MARKNADER[MARKNAD];
if (!M) throw new Error(`Okänd marknad "${MARKNAD}" — välj se eller no.`);

const KORT = ['BOF_1_1', 'BOF_2_1', 'BOF_6_1', 'CS_2_1', 'CS_3_1', 'CS_4_1',
  'RV_1_1', 'RV_2_1', 'RV_3_1', 'RV_4_1', 'SP_2_1'];

const state = existsSync(`${S}/bildbyten-${MARKNAD}.json`)
  ? JSON.parse(readFileSync(`${S}/bildbyten-${MARKNAD}.json`, 'utf8')) : {};
const spara = () => writeFileSync(`${S}/bildbyten-${MARKNAD}.json`, JSON.stringify(state, null, 2));

const ads = await alla(`${M.kampanj}/ads`, { fields: 'id,name,status,creative{object_story_spec}' }, 200);
logg(`Kampanjen har ${ads.length} annonser.`);
const enh = ingaEnhancements();

for (const kort of KORT) {
  const namn = `${M.prefix}${kort}`;
  const ad = ads.find((a) => a.name === namn);
  if (!ad) { logg(`⚠️ ${namn}: annonsen finns inte`); continue; }
  if (state[namn]?.klar) { logg(`↩︎ ${namn} redan bytt`); continue; }
  if (ad.status !== 'PAUSED') { logg(`⛔ ${namn} är ${ad.status} — byter inte creative på något som kan spendera`); continue; }
  const fil = `${M.filer}/${kort}.jpg`;
  if (!existsSync(fil)) { logg(`⚠️ ${namn}: ${fil} saknas`); continue; }
  const ld = ad.creative?.object_story_spec?.link_data;
  if (!ld) { logg(`⚠️ ${namn}: ingen link_data`); continue; }
  if (TORR) { logg(`(torr) skulle byta bilden i ${namn} (${ad.id})`); continue; }

  const hash = state[namn]?.hash || await laddaUppBild(ACT, fil);
  state[namn] = { ...(state[namn] || {}), hash, annonsId: ad.id }; spara();
  const c = await api(`act_${ACT}/adcreatives`, { form: {
    name: `${namn} omplåstrad 2026-09-09`,
    object_story_spec: JSON.stringify({ page_id: SIDA, link_data: { ...ld, image_hash: hash } }),
    degrees_of_freedom_spec: JSON.stringify(enh),
  } });
  await api(ad.id, { form: { creative: JSON.stringify({ creative_id: c.id }) } });
  const efter = await api(ad.id, { params: { fields: 'creative{id},status' } });
  const ok = efter.creative?.id === c.id;
  state[namn] = { ...state[namn], creative: c.id, klar: ok }; spara();
  logg(`${ok ? '✅' : '❌'} ${namn}: bilden bytt → creative ${c.id} (${efter.status})`);
}
logg('\nKlart.');
