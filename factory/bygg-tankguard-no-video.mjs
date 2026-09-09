// TANKGUARD_NO — videoannonserna. Laddar upp de färdiggrindade norska videorna
// i målkontot och bygger annonser på dem i den norska kampanjen.
//
// Idempotent: körs om utan att dubblera. Hoppar över en video vars fil inte
// ligger klar ännu, så skriptet kan köras medan omdubbarna fortfarande renderas.
//
//   node factory/bygg-tankguard-no-video.mjs [--dry]
//
// Källan till media är $S/no-klar/<kort>.mp4 — bara filer som passerat
// OCR-grinden hamnar där. Copyn kommer ur no-videocopy.json (sonnet-subagent,
// modellpolicy regel 6). Allt föds PAUSED.
import {
  säkerställProxy, api, alla, laddaUppVideo, väntaPåThumb,
  skapaAnnons, ingaEnhancements, logg,
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

const KOPIA = `${S}/no-videocopy.json`;
if (!existsSync(KOPIA)) throw new Error(`Copyn saknas: ${KOPIA} — skriv den innan du bygger.`);
const copy = JSON.parse(readFileSync(KOPIA, 'utf8'));

// Förbjudna påståenden. Grinden sitter här också, inte bara i subagentens huvud:
// en enda prisrad i en norsk annons räknar fel valuta och är förbjuden.
const FÖRBJUDET = [
  [/\d+\s*(kr|kroner|nok)\b/i, 'pris'],
  [/\d+\s*%/, 'rabattprocent'],
  [/[★⭐]/, 'stjärnor'],
  [/b[äa]verbutik|beverbutik/i, 'källvarumärke'],
  [/tidsbegrenset|lageret krymper|før det er tomt/i, 'påhittad brådska'],
];

const state = existsSync(`${S}/no-video-bygge.json`)
  ? JSON.parse(readFileSync(`${S}/no-video-bygge.json`, 'utf8')) : {};
state.media ||= {}; state.annonser ||= {}; state.adsets ||= {};
const spara = () => writeFileSync(`${S}/no-video-bygge.json`, JSON.stringify(state, null, 2));

// Kampanjen och dess adsets finns redan — slå upp dem, skapa aldrig en ny bredvid.
const kampanj = (await alla(`act_${ACT}/campaigns`, { fields: 'id,name' })).find((k) => k.name === KAMPANJNAMN);
if (!kampanj) throw new Error(`Hittar inte kampanjen "${KAMPANJNAMN}" — bygg den först.`);
logg(`Kampanj: ${kampanj.id}`);

const befintligaAdsets = await alla(`${kampanj.id}/adsets`, { fields: 'id,name' }, 50);
for (const a of befintligaAdsets) {
  const v = a.name.split(' - ').pop();
  if (v) state.adsets[v] ||= a.id;
}
const mall = befintligaAdsets[0];
if (!mall) throw new Error('Kampanjen har inga adsets att klona targeting ur.');
const mallFull = await api(mall.id, { params: { fields: 'targeting,billing_event,optimization_goal,attribution_spec' } });

async function adsetFor(vinkel) {
  if (state.adsets[vinkel]) return state.adsets[vinkel];
  const namn = `TANKGUARD_NO_Tanktrekket - ${vinkel}`;
  if (TORR) { logg(`(torr) skulle skapa adset ${namn}`); return 'TORR'; }
  const kropp = {
    name: namn, campaign_id: kampanj.id, status: 'PAUSED',
    billing_event: mallFull.billing_event, optimization_goal: mallFull.optimization_goal,
    targeting: JSON.stringify(mallFull.targeting),
    promoted_object: JSON.stringify({ pixel_id: PIXEL, custom_event_type: 'PURCHASE' }),
  };
  if (mallFull.attribution_spec) kropp.attribution_spec = JSON.stringify(mallFull.attribution_spec);
  const r = await api(`act_${ACT}/adsets`, { form: kropp });
  state.adsets[vinkel] = r.id; spara();
  logg(`  Adset ${vinkel}: ${r.id} (PAUSED, geo NO)`);
  return r.id;
}

const befintligaAnnonser = await alla(`${kampanj.id}/ads`, { fields: 'id,name' }, 200);
const finns = new Set(befintligaAnnonser.map((a) => a.name));
logg(`Kampanjen har ${befintligaAnnonser.length} annonser sedan tidigare.`);

const VIDEOR = ['CS_1_H2', 'CS_1_H3', 'GT_1_H1', 'GT_1_H2', 'GT_1_H3', 'GT_3_H1',
  'PD_1_H1', 'PD_1_H2', 'PD_1_H3', 'PD_3_H1', 'SP_1_H1', 'SP_1_H2', 'SP_1_H3'];

const enh = ingaEnhancements();
let byggda = 0, väntar = [];

for (const kort of VIDEOR) {
  const namn = `TankGuard_NO_${kort}`;
  if (finns.has(namn) || state.annonser[namn]?.annonsId) { logg(`↩︎ ${namn} finns redan`); byggda++; continue; }

  const fil = `${S}/no-klar/${kort}.mp4`;
  if (!existsSync(fil)) { väntar.push(`${kort} (ingen färdig fil)`); continue; }

  const c = copy[kort];
  if (!c) { väntar.push(`${kort} (ingen copy)`); continue; }

  const text = [c.message, c.title, c.beskrivning].filter(Boolean).join(' \n ');
  const brott = FÖRBJUDET.filter(([re]) => re.test(text)).map(([, vad]) => vad);
  if (brott.length) { logg(`❌ ${namn}: copyn bär ${brott.join(', ')} — laddas inte upp`); väntar.push(`${kort} (copy underkänd: ${brott.join(', ')})`); continue; }

  if (TORR) { logg(`(torr) skulle ladda upp ${kort} och bygga ${namn}`); continue; }

  if (!state.media[kort]?.klar) {
    const videoId = await laddaUppVideo(ACT, fil);
    const thumb = await väntaPåThumb(videoId);
    state.media[kort] = { video_id: videoId, thumb, klar: true }; spara();
    logg(`⬆ ${kort} → video ${videoId}`);
  }

  const adsetId = await adsetFor(kort.split('_')[0]);
  const spec = { page_id: SIDA, video_data: {
    video_id: state.media[kort].video_id,
    image_url: state.media[kort].thumb,
    message: c.message, title: c.title,
    link_description: c.beskrivning || undefined,
    call_to_action: { type: 'SHOP_NOW', value: { link: LÄNK } },
  } };
  try {
    const r = await skapaAnnons({ act: ACT, adsetId, namn, spec, enhancements: enh });
    state.annonser[namn] = { ...r, kort }; spara();
    logg(`✅ ${namn} → annons ${r.annonsId} (PAUSED)`);
    byggda++;
  } catch (e) {
    state.annonser[namn] = { fel: e.message }; spara();
    logg(`❌ ${namn}: ${e.message.slice(0, 200)}`);
    väntar.push(`${kort} (${e.message.slice(0, 80)})`);
  }
}

logg(`\nVideoannonser uppe: ${byggda} av ${VIDEOR.length}`);
if (väntar.length) logg(`Väntar: ${väntar.join(', ')}`);
