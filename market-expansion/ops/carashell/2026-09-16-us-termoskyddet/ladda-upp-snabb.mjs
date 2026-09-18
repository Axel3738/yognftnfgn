#!/usr/bin/env node
// ladda-upp-snabb.mjs — samma annonser som ladda-upp.mjs, men med så få Graph-anrop som
// möjligt: Magiborsten UK slog i Metas anropstak ("User request limit reached", kod 17)
// på varje video, och tools/ops-till-meta.mjs gör ~20 anrop per annons (kontoläsning,
// kampanj, insights, adsets, kampanjens annonser ×2, thumbnail-poll var 5 s …). Mätt
// 2026-09-16: 8–20 min per video. Här: kontots annonser läses EN gång (dubblettspärren),
// sedan per annons upload + thumbnail-poll var 20 s + creative + annons + aktivera + läs
// tillbaka ≈ 8 anrop. Alla anrop går genom tools/meta-lib.mjs; spärrarna som redan
// verifierats av ops-till-meta (rätt konto, rätt kampanj, marknadskod, adset per koncept)
// bärs som fasta värden ur jobb.json + resultat-meta.json från samma körning.
//
//   node market-expansion/ops/carashell/2026-09-16-us-termoskyddet/ladda-upp-snabb.mjs [--torr] [--bara SP_3,PD_1]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { säkerställProxy, api, alla, laddaUppVideo, laddaUppBild, skapaAnnons, aktivera, ingaEnhancements } from '../../../../tools/meta-lib.mjs';
import { byggSpec } from '../../../../tools/ops-till-meta.mjs';

säkerställProxy();
const HAR = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const TORR = args.includes('--torr');
const baraIdx = args.indexOf('--bara');
const BARA = baraIdx >= 0 ? args[baraIdx + 1].split(',').map((s) => s.trim()) : null;

const jobb = JSON.parse(readFileSync(join(HAR, 'jobb.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(HAR, 'adcopy-US.json'), 'utf8'));
const dubb = JSON.parse(readFileSync(join(HAR, 'resultat-dubb.json'), 'utf8'));
const resultat = existsSync(join(HAR, 'resultat-meta.json')) ? JSON.parse(readFileSync(join(HAR, 'resultat-meta.json'), 'utf8')) : {};
const KONTO = jobb.konto;                       // 1107817401910319 Magiborsten UK
const KAMPANJ = jobb.kampanj;                   // CARASHELL_US_Termoskydd …
const LANK = jobb.lank;                         // https://carashell.com/products/termoskyddet
// Sidan: samma som ops-till-meta använde (produktfilens meta.page_id, tillbakaläst i de 8 första annonserna).
const PAGE_ID = '1381171778405935';
const adsetFor = (koncept) => KAMPANJ.adsets.find((s) => s.name === `CARASHELL_US_${koncept}`);
const vänta = (ms) => new Promise((r) => setTimeout(r, ms));

/** Thumbnail-poll var 20 s (meta-lib pollar var 5 s = 4× fler anrop). Max ~4 min. */
async function väntaPåThumbGlest(videoId) {
  for (let i = 0; i < 12; i++) {
    const r = await api(videoId, { params: { fields: 'status,thumbnails' } });
    const t = (r.thumbnails?.data || []).find((x) => x.is_preferred) || r.thumbnails?.data?.[0];
    if (t?.uri) return t.uri;
    if (r.status?.video_status === 'error') throw new Error('Meta kunde inte processa videon.');
    await vänta(20000);
  }
  throw new Error('Metas video-thumbnail kom aldrig.');
}

// 1. Kontots annonser EN gång: dubblett i hela kontot + annonser som skapades men aldrig aktiverades.
const iKontot = await alla(`act_${KONTO}/ads`, { fields: 'id,name,status,effective_status,adset_id,campaign_id' });
const perNamn = new Map(iKontot.map((a) => [a.name.trim().toLowerCase(), a]));
console.log(`Kontot ${KONTO}: ${iKontot.length} annonser lästa (dubblettspärren)`);

const ORDNING = ['SP_2', 'SP_3', 'PD_1', 'PD_2', 'PD_3', 'G_1', 'G_2', 'G_3', 'CS_1', 'CS_2', 'CS_3', 'SP_1', 'CS_2_1', 'SP_2_1', 'PD_2_1', 'G_2_1'];
for (const k of ORDNING) {
  if (BARA && !BARA.includes(k)) continue;
  const rad = jobb.rader.find((r) => r.namn === `CaraShellFront_${k}`);
  if (!rad) { console.log(`${k}: finns inte i jobb.json`); continue; }
  const mal = rad.mal_namn;
  const koncept = rad.koncept;
  const adset = adsetFor(koncept);
  const c = copy[koncept];
  if (!adset || !c) { console.log(`${mal}: adset/copy saknas`); continue; }
  if (resultat[mal]?.ok && resultat[mal]?.annons?.id) { continue; }
  const befintlig = perNamn.get(mal.toLowerCase());
  if (befintlig) {
    // Skapad av en tidigare körning (t.ex. avbruten mitt i aktiveringen): rör bara annonsen.
    if (String(befintlig.campaign_id) !== KAMPANJ.id) { console.log(`${mal}: finns redan i ANNAN kampanj ${befintlig.campaign_id} — rörs inte`); resultat[mal] = { ok: false, fel: `finns i annan kampanj ${befintlig.campaign_id}` }; continue; }
    let efter = befintlig;
    if (befintlig.status !== 'ACTIVE' && !TORR) ({ efter } = await aktivera({ annonsId: befintlig.id, adset: { id: adset.id, name: adset.name, status: adset.status }, skapad: false }));
    resultat[mal] = { ok: true, aterfunnen: true, konto: KONTO, marknad: 'US', kampanj: { id: KAMPANJ.id, namn: KAMPANJ.namn }, adset: { id: adset.id, namn: adset.name }, annons: { id: befintlig.id, namn: mal, status: efter.status, effective_status: efter.effective_status }, vinkel: koncept, typ: rad.typ, lank: LANK, tid: new Date().toISOString() };
    console.log(`${mal}: fanns redan i kampanjen (${befintlig.id}) → ${efter.status}/${efter.effective_status}`);
    writeFileSync(join(HAR, 'resultat-meta.json'), JSON.stringify(resultat, null, 2));
    continue;
  }
  const arBild = rad.typ === 'bild';
  const fil = join(HAR, 'us', `${mal}.${arBild ? 'png' : 'mp4'}`);
  if (!arBild && dubb[mal]?.status !== 'OK') { resultat[mal] = { ok: false, hoppad: `dubben är inte OK (${dubb[mal]?.status ?? 'saknas'})` }; console.log(`${mal}: hoppad — dubben inte OK`); continue; }
  if (!existsSync(fil)) { resultat[mal] = { ok: false, hoppad: `filen saknas: ${fil}` }; console.log(`${mal}: hoppad — fil saknas`); continue; }
  console.log(`\n=== ${mal} (${rad.typ}, ${koncept} → ${adset.name} ${adset.id})${TORR ? ' [TORR]' : ''}`);
  if (TORR) { resultat[mal] = { ok: true, torr: true }; continue; }
  try {
    let media;
    if (arBild) media = { hash: await laddaUppBild(KONTO, fil) };
    else { const videoId = await laddaUppVideo(KONTO, fil); media = { videoId, thumb: await väntaPåThumbGlest(videoId) }; }
    const spec = byggSpec({ typ: rad.typ, pageId: PAGE_ID, igId: null, media, primär: c.message, rubrik: c.headline, beskrivning: c.description ?? '', länk: LANK });
    const { creativeId, annonsId } = await skapaAnnons({ act: KONTO, adsetId: adset.id, namn: mal, spec, enhancements: ingaEnhancements(), dsa: null });
    const { efter } = await aktivera({ annonsId, adset: { id: adset.id, name: adset.name, status: adset.status }, skapad: false });
    resultat[mal] = { ok: true, konto: KONTO, marknad: 'US', kampanj: { id: KAMPANJ.id, namn: KAMPANJ.namn }, adset: { id: adset.id, namn: adset.name, skapad: false }, annons: { id: annonsId, namn: mal, status: efter.status, effective_status: efter.effective_status }, creative_id: creativeId, media: arBild ? { typ: 'bild', hash: media.hash } : { typ: 'video', id: media.videoId }, lank: LANK, vinkel: koncept, typ: rad.typ, fil: `us/${mal}.${arBild ? 'png' : 'mp4'}`, snabb: true, tid: new Date().toISOString() };
    console.log(`   ✓ ${efter.status}/${efter.effective_status} · ad ${annonsId} · creative ${creativeId}`);
  } catch (e) {
    resultat[mal] = { ok: false, fel: e.message, tid: new Date().toISOString() };
    console.log(`   ✗ ${e.message}`);
  }
  writeFileSync(join(HAR, 'resultat-meta.json'), JSON.stringify(resultat, null, 2));
}
writeFileSync(join(HAR, 'resultat-meta.json'), JSON.stringify(resultat, null, 2));
const ok = Object.values(resultat).filter((r) => r.ok).length;
const inte = Object.entries(resultat).filter(([, r]) => !r.ok);
console.log(`\n${ok} ok, ${inte.length} inte${inte.length ? `: ${inte.map(([n, r]) => `${n} (${r.hoppad ?? r.fel})`).join(' · ')}` : ''}`);
