// TANKGUARD SE — de källannonser som tillkom EFTER den första brand-detektorkörningen.
//
// Källkampanjen växer medan bygget pågår: 34 annonser vid detektorns körning,
// 40 vid räkningen samma kväll. En körning som bara bygger sin gamla lista
// missar dem tyst. Det här skriptet bygger de nya, och bara de vars media är
// bevisat rent (frame-OCR) eller ombyggt (slutkort.py).
//
//   node factory/bygg-tankguard-se-nya.mjs [--dry]
//
// Media läses ur $S/se-nya-klar/ (ombyggda) och $S/se-nya-media/ (redan rena).
// Copyn kommer ur se-nya-copy.json (sonnet-subagent, modellpolicy regel 6).
// Allt föds PAUSED.
import {
  säkerställProxy, api, alla, laddaUppVideo, väntaPåThumb,
  hittaEllerSkapaAdset, skapaAnnons, ingaEnhancements, logg,
} from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
säkerställProxy();

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const ACT = '915422744950975';
const KAMPANJ = '120248995235740172';
const SIDA = '1399193996606775';
const LÄNK = 'https://tankguard.se/products/tankoverdraget';
const TORR = process.argv.includes('--dry');

// Dom per creative, satt av huvudsessionen efter frame-OCR 2026-09-09.
// `fil` pekar på den mediafil som faktiskt får laddas upp — aldrig källfilen
// när slutkortet är ombyggt.
const NYA = {
  PD_4_H3: { dom: 'ren', fil: `${S}/se-nya-media/PD_4_H3.mp4` },
  GT_4_H1: { dom: 'slutkort ombyggt', fil: `${S}/se-nya-klar/GT_4_H1.mp4` },
  PD_4_H1: { dom: 'slutkort ombyggt', fil: `${S}/se-nya-klar/PD_4_H1.mp4` },
  PD_4_H2: { dom: 'slutkort ombyggt', fil: `${S}/se-nya-klar/PD_4_H2.mp4` },
  SP_3_H1: { dom: 'kräver-omdubb', fil: `${S}/klar2/SP_3_H1.mp4` },
  CS_4_H1: { dom: 'kräver-omdubb', fil: `${S}/klar2/CS_4_H1.mp4` },
};

const KOPIA = `${S}/se-nya-copy.json`;
if (!existsSync(KOPIA)) throw new Error(`Copyn saknas: ${KOPIA}`);
const copy = JSON.parse(readFileSync(KOPIA, 'utf8'));

// Källbutikens tal och socialt bevis stoppas här också, inte bara i copyskrivarens
// huvud. 489/799/1099 och 18/25 % är TankGuards EGNA och får stå.
const FÖRBJUDET = [
  [/\b636\b|\b147\b/, 'källbutikens prispar'],
  [/\b23\s*%/, 'källbutikens rabatt'],
  [/[★⭐]/, 'stjärnor'],
  [/recension|omdöme|\d[,.]\d\s*av\s*5/i, 'socialt bevis'],
  [/b[äa]verbutik/i, 'källvarumärke'],
  [/bara idag|lagret krymper|innan det är slut/i, 'påhittad brådska'],
];

const state = existsSync(`${S}/se-nya-bygge.json`)
  ? JSON.parse(readFileSync(`${S}/se-nya-bygge.json`, 'utf8')) : {};
state.media ||= {}; state.annonser ||= {};
const spara = () => writeFileSync(`${S}/se-nya-bygge.json`, JSON.stringify(state, null, 2));

const befintliga = await alla(`${KAMPANJ}/ads`, { fields: 'id,name' }, 200);
const finns = new Set(befintliga.map((a) => a.name));
logg(`SE-kampanjen har ${befintliga.length} annonser sedan tidigare.`);

const adsetCache = {};
async function adsetFor(vinkel) {
  if (adsetCache[vinkel]) return adsetCache[vinkel];
  const namn = `TANKGUARD_Tanköverdraget SE - ${vinkel}`;
  const r = await hittaEllerSkapaAdset({ kampanjId: KAMPANJ, act: ACT, namn, torr: TORR });
  logg(`  Adset ${vinkel}: ${r.adset.id} ${r.skapad ? '(NYSKAPAT, PAUSED)' : '(fanns)'}`);
  adsetCache[vinkel] = r.adset.id;
  return r.adset.id;
}

const enh = ingaEnhancements();
let byggda = 0; const väntar = [];

for (const [kort, info] of Object.entries(NYA)) {
  const namn = `TankGuard_${kort}`;
  if (finns.has(namn) || state.annonser[namn]?.annonsId) { logg(`↩︎ ${namn} finns redan`); byggda++; continue; }
  if (!existsSync(info.fil)) { väntar.push(`${kort} (${info.dom}: filen inte klar)`); continue; }

  const c = copy[kort];
  if (!c) { väntar.push(`${kort} (ingen copy)`); continue; }
  const text = [c.message, c.title, c.beskrivning].filter(Boolean).join(' \n ');
  const brott = FÖRBJUDET.filter(([re]) => re.test(text)).map(([, v]) => v);
  if (brott.length) { logg(`❌ ${namn}: copyn bär ${brott.join(', ')}`); väntar.push(`${kort} (copy underkänd: ${brott.join(', ')})`); continue; }

  if (TORR) { logg(`(torr) skulle bygga ${namn} ur ${info.fil.split('/').pop()} [${info.dom}]`); continue; }

  if (!state.media[kort]?.klar) {
    const videoId = await laddaUppVideo(ACT, info.fil);
    const thumb = await väntaPåThumb(videoId);
    state.media[kort] = { video_id: videoId, thumb, klar: true, dom: info.dom }; spara();
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
    state.annonser[namn] = { ...r, kort, dom: info.dom }; spara();
    logg(`✅ ${namn} → annons ${r.annonsId} (PAUSED)`);
    byggda++;
  } catch (e) {
    state.annonser[namn] = { fel: e.message }; spara();
    logg(`❌ ${namn}: ${e.message.slice(0, 200)}`);
    väntar.push(`${kort} (${e.message.slice(0, 80)})`);
  }
}

logg(`\nNya SE-annonser uppe: ${byggda} av ${Object.keys(NYA).length}`);
if (väntar.length) logg(`Väntar: ${väntar.join(', ')}`);
