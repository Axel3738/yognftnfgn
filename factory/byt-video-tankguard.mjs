// Byter videon i en redan byggd annons utan att röra dess copy eller adset.
//
//   node factory/byt-video-tankguard.mjs [--dry]
//
// Behövs när en creative renderats om efter att annonsen redan låg uppe —
// här: de fyra svenska videor vars repliker hamnade i fel ordning. Metas
// creatives är oföränderliga, så en ny creative byggs med SAMMA copy och den
// nya videon, och annonsen pekas om till den. Annonsens id, namn, adset och
// status står kvar; historiken bryts inte.
//
// Annonsen måste vara PAUSED. Att byta creative på något som spenderar är en
// annan sorts beslut och görs inte av ett skript.
import {
  säkerställProxy, api, laddaUppVideo, väntaPåThumb, ingaEnhancements, logg,
} from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
säkerställProxy();

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const ACT = '915422744950975';
const TORR = process.argv.includes('--dry');

// annonsnamn → den nya filen
const BYTEN = {
  TankGuard_GT_1_H2: `${S}/klar-se3/GT_1_H2.mp4`,
  TankGuard_SP_1_H1: `${S}/klar-se3/SP_1_H1.mp4`,
  TankGuard_SP_1_H2: `${S}/klar-se3/SP_1_H2.mp4`,
  TankGuard_SP_1_H3: `${S}/klar-se3/SP_1_H3.mp4`,
};
const KAMPANJ = '120248995235740172';

const state = existsSync(`${S}/videobyten.json`)
  ? JSON.parse(readFileSync(`${S}/videobyten.json`, 'utf8')) : {};
const spara = () => writeFileSync(`${S}/videobyten.json`, JSON.stringify(state, null, 2));

const ads = (await api(`${KAMPANJ}/ads`, { params: {
  fields: 'id,name,status,effective_status,creative{object_story_spec,degrees_of_freedom_spec}', limit: 200,
} })).data || [];

const enh = ingaEnhancements();
for (const [namn, fil] of Object.entries(BYTEN)) {
  const ad = ads.find((a) => a.name === namn);
  if (!ad) { logg(`⚠️ ${namn}: annonsen finns inte`); continue; }
  if (state[namn]?.klar) { logg(`↩︎ ${namn} redan bytt`); continue; }
  if (!existsSync(fil)) { logg(`⚠️ ${namn}: ${fil} saknas`); continue; }
  if (ad.status !== 'PAUSED') { logg(`⛔ ${namn} är ${ad.status} — byter inte creative på något som kan spendera`); continue; }

  const vd = ad.creative?.object_story_spec?.video_data;
  if (!vd) { logg(`⚠️ ${namn}: annonsen har ingen video_data`); continue; }
  if (TORR) { logg(`(torr) skulle byta ${namn} (annons ${ad.id}) till ${fil.split('/').pop()}`); continue; }

  const videoId = await laddaUppVideo(ACT, fil);
  const thumb = await väntaPåThumb(videoId);
  logg(`⬆ ${namn} → ny video ${videoId}`);

  const spec = { page_id: ad.creative.object_story_spec.page_id, video_data: {
    ...vd, video_id: videoId, image_url: thumb,
  } };
  delete spec.video_data.image_hash;   // gamla thumben hör till den gamla videon

  const c = await api(`act_${ACT}/adcreatives`, { form: {
    name: `${namn} omrenderad 2026-09-09`,
    object_story_spec: JSON.stringify(spec),
    degrees_of_freedom_spec: JSON.stringify(enh),
  } });
  await api(ad.id, { form: { creative: JSON.stringify({ creative_id: c.id }) } });
  const efter = await api(ad.id, { params: { fields: 'creative{id},status' } });
  const ok = efter.creative?.id === c.id;
  state[namn] = { annonsId: ad.id, creative: c.id, video_id: videoId, klar: ok }; spara();
  logg(`${ok ? '✅' : '❌'} ${namn}: annons ${ad.id} → creative ${c.id} (${efter.status})`);
}
logg('\nKlart.');
