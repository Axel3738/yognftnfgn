// Byter videon i redan byggda annonser utan att röra copy eller adset.
//
//   node factory/byt-video-tankguard.mjs <marknad> [--dry]
//
// Metas creatives är oföränderliga, så en omrenderad video kan inte bytas in i
// en befintlig creative. En NY creative byggs med SAMMA copy och den nya videon,
// och annonsen pekas om. Annonsens id, namn, adset och status står kvar —
// historiken bryts inte.
//
// Annonsen måste vara PAUSED. Att byta creative på något som spenderar är ett
// annat slags beslut och görs inte av ett skript.
import {
  säkerställProxy, api, alla, laddaUppVideo, väntaPåThumb, ingaEnhancements, logg,
} from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
säkerställProxy();

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const ACT = '915422744950975';
const TORR = process.argv.includes('--dry');
const MARKNAD = (process.argv[2] || 'se4').toLowerCase();

const MARKNADER = {
  se3: { kampanj: '120248995235740172', prefix: 'TankGuard_' },
  se4: { kampanj: '120248995235740172', prefix: 'TankGuard_' },
  no2: { kampanj: '120249012213810172', prefix: 'TankGuard_NO_' },
};
const M = MARKNADER[MARKNAD];
if (!M) throw new Error(`Okänd marknad "${MARKNAD}" — välj ${Object.keys(MARKNADER).join(', ')}.`);

const KATALOG = `${S}/klar-${MARKNAD}`;
if (!existsSync(KATALOG)) throw new Error(`${KATALOG} finns inte — kör captionbytet först.`);
const filer = readdirSync(KATALOG).filter((f) => f.endsWith('.mp4'));
logg(`${filer.length} färdiga videor i ${KATALOG}`);

const state = existsSync(`${S}/videobyten-${MARKNAD}.json`)
  ? JSON.parse(readFileSync(`${S}/videobyten-${MARKNAD}.json`, 'utf8')) : {};
const spara = () => writeFileSync(`${S}/videobyten-${MARKNAD}.json`, JSON.stringify(state, null, 2));

const ads = await alla(`${M.kampanj}/ads`, {
  fields: 'id,name,status,creative{object_story_spec}',
}, 25);
logg(`Kampanjen har ${ads.length} annonser.`);

const enh = ingaEnhancements();
let bytta = 0; const kvar = [];

for (const fil of filer.sort()) {
  const kort = fil.replace(/\.mp4$/, '');
  const namn = `${M.prefix}${kort}`;
  const ad = ads.find((a) => a.name === namn);
  if (!ad) { kvar.push(`${kort} (annonsen finns inte)`); continue; }
  if (state[namn]?.klar) { logg(`↩︎ ${namn} redan bytt`); bytta++; continue; }
  if (ad.status !== 'PAUSED') { logg(`⛔ ${namn} är ${ad.status} — rör inte något som kan spendera`); kvar.push(`${kort} (${ad.status})`); continue; }
  const vd = ad.creative?.object_story_spec?.video_data;
  if (!vd) { kvar.push(`${kort} (ingen video_data)`); continue; }
  if (TORR) { logg(`(torr) skulle byta ${namn} (${ad.id}) till ${fil}`); continue; }

  // Video-id:t sparas innan thumbnailen väntas in — dröjer Metas thumbnail
  // laddar en omkörning annars upp hela videon igen.
  if (!state[namn]?.video_id) {
    state[namn] = { ...(state[namn] || {}), annonsId: ad.id, video_id: await laddaUppVideo(ACT, `${KATALOG}/${fil}`) };
    spara();
    logg(`⬆ ${kort} → video ${state[namn].video_id}`);
  }
  let thumb = state[namn].thumb;
  if (!thumb) {
    try { thumb = await väntaPåThumb(state[namn].video_id); state[namn].thumb = thumb; spara(); }
    catch (e) { logg(`⏳ ${kort}: ${e.message} Kör om.`); kvar.push(`${kort} (väntar på thumbnail)`); continue; }
  }

  const spec = { page_id: ad.creative.object_story_spec.page_id, video_data: {
    ...vd, video_id: state[namn].video_id, image_url: thumb,
  } };
  delete spec.video_data.image_hash;   // hör till den gamla videon

  try {
    const c = await api(`act_${ACT}/adcreatives`, { form: {
      name: `${namn} omdubbad ${MARKNAD} 2026-09-09`,
      object_story_spec: JSON.stringify(spec),
      degrees_of_freedom_spec: JSON.stringify(enh),
    } });
    await api(ad.id, { form: { creative: JSON.stringify({ creative_id: c.id }) } });
    const efter = await api(ad.id, { params: { fields: 'creative{id},status' } });
    const ok = efter.creative?.id === c.id;
    state[namn] = { ...state[namn], creative: c.id, klar: ok }; spara();
    logg(`${ok ? '✅' : '❌'} ${namn}: annons ${ad.id} → creative ${c.id} (${efter.status})`);
    if (ok) bytta++; else kvar.push(`${kort} (creative pekar fel efter bytet)`);
  } catch (e) {
    logg(`❌ ${namn}: ${e.message.slice(0, 180)}`);
    kvar.push(`${kort} (${e.message.slice(0, 80)})`);
  }
}

logg(`\nBytta: ${bytta} av ${filer.length}`);
if (kvar.length) logg(`Kvar: ${kvar.join(', ')}`);
