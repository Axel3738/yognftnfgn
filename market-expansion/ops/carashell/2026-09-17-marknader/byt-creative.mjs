#!/usr/bin/env node
// byt-creative.mjs — ger en annons som REDAN är live en ny creative med rätt pris,
// utan att röra något annat. Samma tanke som tools/ops-byt-bild.mjs, men för
// Magiborsten UK, för både bild och video, och med ny annonstext.
//
//   node byt-creative.mjs [--marknad NZ] [--kampanj <id>] [--bara CS_4_1] [--torr]
//
// VAD SOM BEVARAS, hämtat ur annonsens EGEN nuvarande creative och skrivet tillbaka oförändrat:
//   • landningslänken (Axels order: "ändra inte länksidan som man kommer in på")
//   • sidan (page_id), Instagram-kontot, call-to-action
//   • annonsens namn, dess adset, dess kampanj, dess status
// VAD SOM BYTS: bilden/videon (bara där priset står inbränt) och annonstexten.
//
// Spärrar som inte går att flagga bort:
//   1. Bara konto 1107817401910319 (Magiborsten UK). Allt annat avbryts.
//   2. Bara de åtta kampanjerna i marknader.mjs → KAMPANJER. En kampanj som inte
//      står där rörs aldrig — US-kampanjerna i samma konto har RÄTT pris.
//   3. Kampanjens marknad styr priset. En NZ-kampanj kan aldrig få GB-copy.
//   4. Varje skrivning läses tillbaka: creative-id ska ha bytt, länk och status ska
//      vara oförändrade. Skiljer något sig rapporteras annonsen som FEL.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { säkerställProxy, api, alla, laddaUppBild, laddaUppVideo, väntaPåThumb, ingaEnhancements } from '../../../../tools/meta-lib.mjs';
import { MARKNADER, KAMPANJER, KODER, kvarUS } from './marknader.mjs';

säkerställProxy();
const HAR = dirname(fileURLToPath(import.meta.url));
const KONTO = '1107817401910319';
const args = process.argv.slice(2);
const flagga = (f) => { const i = args.indexOf(`--${f}`); return i >= 0 ? args[i + 1] : null; };
const TORR = args.includes('--torr');
const MARKNAD = flagga('marknad');
const KAMPANJ = flagga('kampanj');
const BARA = flagga('bara');

const copy = JSON.parse(readFileSync(join(HAR, 'copy-per-marknad.json'), 'utf8'));
const regioner = JSON.parse(readFileSync(join(HAR, 'bildregioner.json'), 'utf8'));
const manus = JSON.parse(readFileSync(join(HAR, 'manus.json'), 'utf8'));
const NYTT_MEDIA = new Set([...Object.keys(regioner), ...Object.keys(manus)].filter((k) => !k.startsWith('_')));
const media = existsSync(join(HAR, 'media-uppladdat.json')) ? JSON.parse(readFileSync(join(HAR, 'media-uppladdat.json'), 'utf8')) : {};
const resultat = existsSync(join(HAR, 'resultat-byte.json')) ? JSON.parse(readFileSync(join(HAR, 'resultat-byte.json'), 'utf8')) : {};
const spara = () => { writeFileSync(join(HAR, 'media-uppladdat.json'), JSON.stringify(media, null, 2)); writeFileSync(join(HAR, 'resultat-byte.json'), JSON.stringify(resultat, null, 2)); };

/** Ladda upp marknadens nya fil en gång och återanvänd hashen/id:t i alla kampanjer. */
const dubb = existsSync(join(HAR, 'resultat-dubb.json')) ? JSON.parse(readFileSync(join(HAR, 'resultat-dubb.json'), 'utf8')) : {};
async function mediaFor(kod, namn, typ) {
  const nyckel = `${kod}/${namn}`;
  if (media[nyckel]) return media[nyckel];
  const fil = join(HAR, kod, `${namn}.${typ === 'video' ? 'mp4' : 'png'}`);
  if (!existsSync(fil)) throw new Error(`filen saknas: ${fil}`);
  // En video med ❌ i röstkollen laddas ALDRIG upp (Axels regel 2026-09-08) — filen
  // finns på disk även när kollen underkände den, så spärren måste sitta här.
  if (typ === 'video' && dubb[kod]?.[namn] && dubb[kod][namn].status !== 'OK') {
    throw new Error(`dubben är inte godkänd (röstkoll/captions): ${dubb[kod][namn].status}`);
  }
  if (TORR) return { torr: true };
  if (typ === 'video') {
    const videoId = await laddaUppVideo(KONTO, fil);
    media[nyckel] = { typ, videoId, thumb: await väntaPåThumb(videoId) };
  } else {
    media[nyckel] = { typ, hash: await laddaUppBild(KONTO, fil) };
  }
  spara();
  console.log(`   media uppladdat: ${nyckel} → ${media[nyckel].hash ?? media[nyckel].videoId}`);
  return media[nyckel];
}

/** Ny object_story_spec: originalets, med ny text och (om det finns) nytt media. */
export function nySpec(gammal, text, nyttMedia) {
  const s = JSON.parse(JSON.stringify(gammal));
  if (s.link_data) {
    s.link_data.message = text.message;
    s.link_data.name = text.headline;
    if (text.description) s.link_data.description = text.description; else delete s.link_data.description;
    if (nyttMedia?.hash) { s.link_data.image_hash = nyttMedia.hash; delete s.link_data.picture; }
  } else if (s.video_data) {
    s.video_data.message = text.message;
    s.video_data.title = text.headline;
    if (text.description) s.video_data.link_description = text.description; else delete s.video_data.link_description;
    if (nyttMedia?.videoId) { s.video_data.video_id = nyttMedia.videoId; s.video_data.image_url = nyttMedia.thumb; }
    // Meta: "Endast ett av image_url och image_hash bör anges i video_data". Metas EGNA
    // creatives läses ut med båda, så specen måste rensas innan den skickas tillbaka —
    // annars avvisas varje video med 400 (mätt 2026-09-17 på de nio orörda videorna).
    if (s.video_data.image_url && s.video_data.image_hash) delete s.video_data.image_hash;
  } else {
    throw new Error('creative saknar både link_data och video_data');
  }
  return s;
}

/** Länken ur en spec — den som ALDRIG får ändras. */
export function lankUr(spec) {
  return spec?.link_data?.link || spec?.link_data?.call_to_action?.value?.link
    || spec?.video_data?.call_to_action?.value?.link || null;
}

const kampanjer = Object.entries(KAMPANJER)
  .filter(([id, k]) => (!KAMPANJ || id === KAMPANJ) && (!MARKNAD || k.marknad === MARKNAD));
console.log(`Konto ${KONTO} · ${kampanjer.length} kampanjer${TORR ? ' · TORRKÖRNING' : ''}`);

for (const [kid, kinfo] of kampanjer) {
  const kod = kinfo.marknad;
  const m = MARKNADER[kod];
  const annonser = await alla(`${kid}/ads`, { fields: 'id,name,status,effective_status,adset_id,creative{id,object_story_spec}' }, 50);
  console.log(`\n### ${kinfo.namn} (${kid}) · marknad ${kod} · ${annonser.length} annonser · pris ${m.pris}`);
  resultat[kid] = resultat[kid] ?? {};
  for (const a of annonser) {
    if (BARA && !a.name.includes(BARA)) continue;
    // En torrkörning räknas ALDRIG som gjord — bara ett skarpt byte med grön
    // tillbakaläsning får hoppas över vid omkörning.
    if (resultat[kid][a.name]?.ok && !resultat[kid][a.name]?.torr && !TORR) continue;
    const gammal = a.creative?.object_story_spec;
    const text = copy[kod]?.[a.name];
    if (!gammal) { resultat[kid][a.name] = { ok: false, skal: 'ingen object_story_spec' }; continue; }
    if (!text) { resultat[kid][a.name] = { ok: false, skal: `ingen copy för ${a.name} i ${kod}` }; continue; }
    const kvar = [text.message, text.headline, text.description].flatMap((t) => kvarUS(t, kod));
    if (kvar.length) { resultat[kid][a.name] = { ok: false, skal: `copyn bär kvar US-spår: ${kvar.join(' ')}` }; continue; }
    const typ = gammal.video_data ? 'video' : 'bild';
    const lankFore = lankUr(gammal);
    try {
      const nytt = NYTT_MEDIA.has(a.name) ? await mediaFor(kod, a.name, typ) : null;
      const spec = nySpec(gammal, text, nytt);
      const lankEfter = lankUr(spec);
      if (lankEfter !== lankFore) throw new Error(`länken ändrades: ${lankFore} → ${lankEfter}`);
      if (TORR) {
        resultat[kid][a.name] = { ok: true, torr: true, typ, nytt_media: Boolean(nytt), lank: lankFore, rubrik: text.headline };
        console.log(`   [TORR] ${a.name} ${typ}${nytt ? ' + nytt media' : ' (media orört)'} · "${text.headline}" · länk oförändrad`);
        continue;
      }
      const creative = await api(`act_${KONTO}/adcreatives`, { form: {
        name: `${a.name} · ${kod} ${m.pris}`,
        object_story_spec: JSON.stringify(spec),
        degrees_of_freedom_spec: JSON.stringify(ingaEnhancements()),
      } });
      await api(a.id, { form: { creative: JSON.stringify({ creative_id: creative.id }) } });
      const efter = await api(a.id, { params: { fields: 'id,name,status,effective_status,adset_id,creative{id,object_story_spec}' } });
      const lankEfterLive = lankUr(efter.creative?.object_story_spec);
      const ok = efter.creative?.id === creative.id && lankEfterLive === lankFore
        && efter.status === a.status && efter.adset_id === a.adset_id && efter.name === a.name;
      resultat[kid][a.name] = {
        ok, typ, nytt_media: Boolean(nytt), creative_fore: a.creative.id, creative_efter: efter.creative?.id,
        lank_fore: lankFore, lank_efter: lankEfterLive, status_fore: a.status, status_efter: efter.status,
        adset_fore: a.adset_id, adset_efter: efter.adset_id, rubrik: text.headline, ad_id: a.id, marknad: kod,
        skal: ok ? null : 'tillbakaläsningen stämmer inte',
      };
      console.log(`   ${ok ? '✓' : '✗'} ${a.name} ${typ}${nytt ? ' + nytt media' : ''} · creative ${a.creative.id} → ${efter.creative?.id} · ${efter.status}/${efter.effective_status} · länk ${lankEfterLive === lankFore ? 'oförändrad' : 'ÄNDRAD!'}`);
    } catch (e) {
      resultat[kid][a.name] = { ok: false, skal: e.message, ad_id: a.id, marknad: kod };
      console.log(`   ✗ ${a.name}: ${e.message}`);
    }
    spara();
  }
}
spara();
const alla_ = Object.values(resultat).flatMap((v) => Object.entries(v));
const fel = alla_.filter(([, r]) => !r.ok);
console.log(`\n${alla_.length - fel.length} bytta, ${fel.length} fel${fel.length ? `:\n${fel.map(([n, r]) => `   ${n}: ${r.skal}`).join('\n')}` : ''}`);
