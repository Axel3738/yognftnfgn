#!/usr/bin/env node
// ladda-upp-smal.mjs — SMAL uppladdare för de 12 US-videorna när Meta rate-limitar
// (mätt 2026-09-16 15:35–15:50 CEST: ops-till-meta:s dubblettkoll ensam tog 12 min
// per annons — fem backoff-väntor på error 17). Samma meta-lib-funktioner och
// samma spärrar i sak, men EN kontoläsning för hela batchen i stället för ~12 anrop
// per annons:
//   • kampanj, adsets, sida, länk är redan verifierade av tools/ops-till-meta.mjs
//     (torrkörning + 5 skarpa uppladdningar samma eftermiddag) — här står de som
//     KONSTANTER, kontrollerade mot kontot en gång vid start (adset måste ligga i
//     kampanjen, kampanjen på konto 1107817401910319).
//   • dubblett: kampanjens annonser läses EN gång; namn som redan finns hoppas.
//   • per video: advideos → thumbnail → creative+annons (PAUSED) → aktivera annonsen
//     (aldrig adset/kampanj) — meta-lib.skapaAnnons/aktivera, ingaEnhancements.
//   • röstkollen måste vara grön (rostkoll-us.json), annars hoppas videon.
//   node market-expansion/ops/carashell/2026-09-16-us/ladda-upp-smal.mjs [--torr] [--bara=GT_1_H1,…]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { säkerställProxy, api, alla, laddaUppVideo, väntaPåThumb, skapaAnnons, aktivera, ingaEnhancements } from '../../../../tools/meta-lib.mjs';
import { byggSpec } from '../../../../tools/ops-till-meta.mjs';

säkerställProxy();
const HAR = dirname(fileURLToPath(import.meta.url));
const TORR = process.argv.includes('--torr');
const BARA = (process.argv.find((a) => a.startsWith('--bara=')) || '').slice(7).split(',').filter(Boolean);
const KONTO = '1107817401910319';                 // Magiborsten UK — US-marknaden (factory/opsmarknader.mjs)
const KAMPANJ = '120251436741400435';             // CARASHELL_US_Taköverdrag … (PAUSED utan spend)
const ADSET = { CS: '120251437592600435', GT: '120251437593250435', PD: '120251437593850435', SP: '120251437594720435' };
const PAGE = '1381171778405935';                  // CaraShells sida (produktfilen meta.page_id, ärvd av ops-till-meta)
const LANK = 'https://carashell.com/products/takskyddet?country=US';
const copy = JSON.parse(readFileSync(join(HAR, 'adcopy-US-video.json'), 'utf8'));
const rost = JSON.parse(readFileSync(join(HAR, 'rostkoll-us.json'), 'utf8'));
const resFil = join(HAR, 'resultat-meta-video.json');
const spara = (mal, post) => { const nu = existsSync(resFil) ? JSON.parse(readFileSync(resFil, 'utf8')) : {}; nu[mal] = post; writeFileSync(resFil, JSON.stringify(nu, null, 2)); };
const logg = (...a) => console.error(...a);

// 1. Kontot och kampanjen — en gång.
const k = await api(KAMPANJ, { params: { fields: 'id,name,status,account_id,daily_budget' } });
if (String(k.account_id) !== KONTO) throw new Error(`Kampanj ${KAMPANJ} ligger på konto ${k.account_id}, inte ${KONTO}. Avbryter.`);
if (!/^CARASHELL_US_/.test(k.name)) throw new Error(`Kampanjnamnet "${k.name}" bär inte CARASHELL_US_. Avbryter.`);
logg(`Kampanj: "${k.name}" ${k.status} · konto ${k.account_id} · CBO ${Number(k.daily_budget) / 100} kr/dag`);
const adsets = await alla(`${KAMPANJ}/adsets`, { fields: 'id,name,status' });
for (const [kod, id] of Object.entries(ADSET)) {
  const s = adsets.find((a) => a.id === id);
  if (!s || !s.name.endsWith(`_${kod}`)) throw new Error(`Adset ${id} (${kod}) finns inte i kampanjen eller heter fel: ${s?.name}. Avbryter.`);
}
logg(`Adsets: ${adsets.map((a) => `${a.name} ${a.status}`).join(' · ')}`);
// 2. Dubblettspärren — kampanjens annonser, en gång.
const finns = await alla(`${KAMPANJ}/ads`, { fields: 'id,name,status,effective_status' });
logg(`Annonser i kampanjen nu: ${finns.length}`);

const namn = ['CS_1_H1', 'CS_2_H1', 'CS_3_H1', 'GT_1_H1', 'GT_2_H1', 'GT_3_H1', 'PD_1_H1', 'PD_2_H1', 'PD_3_H1', 'SP_1_H1', 'SP_2_H1', 'SP_3_H1'];
for (const n of namn) {
  if (BARA.length && !BARA.includes(n)) continue;
  const mal = `CaraShellRoof_US_${n}`;
  const koncept = n.split('_')[0];
  const dubb = finns.find((a) => a.name.trim().toLowerCase() === mal.toLowerCase());
  if (dubb) {
    logg(`— ${mal}: finns redan (${dubb.id}, ${dubb.status}/${dubb.effective_status})`);
    if (dubb.status !== 'ACTIVE' && !TORR) {
      // Körningens egen annons (skapad av det avbrutna försöket) — aktivera bara annonsen.
      const { efter } = await aktivera({ annonsId: dubb.id, adset: { id: ADSET[koncept], name: `CARASHELL_US_${koncept}`, status: 'PAUSED' }, skapad: false });
      logg(`   aktiverad: ${efter.status}/${efter.effective_status}`);
      dubb.status = efter.status; dubb.effective_status = efter.effective_status;
    }
    spara(mal, { exit: 0, resultat: { ok: true, konto: KONTO, marknad: 'US', kampanj: { id: KAMPANJ, namn: k.name }, adset: { id: ADSET[koncept], namn: `CARASHELL_US_${koncept}` }, annons: { id: dubb.id, namn: mal, status: dubb.status, effective_status: dubb.effective_status }, lank: LANK, dubblett: true } });
    continue;
  }
  if (rost[mal]?.ok !== true) { logg(`✗ ${mal}: röstkollen inte grön — hoppar`); spara(mal, { hoppad: 'röstkoll' }); continue; }
  const fil = join(HAR, 'us', `${mal}.mp4`);
  if (!existsSync(fil)) { logg(`✗ ${mal}: saknar ${fil}`); continue; }
  const c = copy[koncept];
  logg(`\n=== ${mal} → adset CARASHELL_US_${koncept} (${ADSET[koncept]})${TORR ? ' [torr]' : ''}`);
  if (TORR) continue;
  try {
    const videoId = await laddaUppVideo(KONTO, fil);
    const thumb = await väntaPåThumb(videoId);
    logg(`   video ${videoId}, thumbnail klar`);
    const spec = byggSpec({ typ: 'video', pageId: PAGE, igId: null, media: { videoId, thumb }, primär: c.message, rubrik: c.headline, beskrivning: c.description || '', länk: LANK });
    const { creativeId, annonsId } = await skapaAnnons({ act: KONTO, adsetId: ADSET[koncept], namn: mal, spec, enhancements: ingaEnhancements(), dsa: null });
    logg(`   annons ${annonsId} skapad PAUSED, creative ${creativeId}`);
    const { efter } = await aktivera({ annonsId, adset: { id: ADSET[koncept], name: `CARASHELL_US_${koncept}`, status: 'PAUSED' }, skapad: false });
    logg(`   aktiverad: ${efter.status}/${efter.effective_status}`);
    spara(mal, { exit: 0, resultat: { ok: true, konto: KONTO, marknad: 'US', kampanj: { id: KAMPANJ, namn: k.name }, adset: { id: ADSET[koncept], namn: `CARASHELL_US_${koncept}` }, annons: { id: annonsId, namn: mal, status: efter.status, effective_status: efter.effective_status }, creative_id: creativeId, media: { typ: 'video', id: videoId }, lank: LANK } });
    console.log(`→ OK ${mal} ${annonsId} ${efter.status}/${efter.effective_status}`);
  } catch (e) {
    logg(`✗ ${mal}: ${e.message}`);
    spara(mal, { exit: 1, resultat: { ok: false, fel: e.message } });
    console.log(`→ FEL ${mal} — ${e.message}`);
  }
}
console.log('klart');
