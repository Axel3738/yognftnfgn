// Räkningen — steg 9 i `/ny-annonser`. Källannonser per dom mot annonser som
// FAKTISKT ligger i kontot, en tabell per marknad.
//
//   node factory/rakna-tankguard.mjs
//
// Två regler som gör räkningen sann:
//  1. Annonser räknas ur `act/ads`, aldrig ur `advideos`/`adimages`. Media i
//     kontot är inte en annons.
//  2. Källkontona svepts på ALLA kampanjer, inte på ett kampanj-id ur konfigen.
//     Källkampanjen växer medan bygget pågår — 34 annonser blev 40 på en kväll.
import { säkerställProxy, alla, logg } from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { writeFileSync } from 'node:fs';
säkerställProxy();

const MÅL = '915422744950975';                 // MagiBorsten DK (alla OPS-butiker)
const KAMPANJER = {
  SE: 'TANKGUARD_Tanköverdraget SE | BE-ROAS 1,62 | 2026-09-08',
  NO: 'TANKGUARD_NO_Tanktrekket | 2026-09-09',
};
const KÄLLOR = {
  SE: { act: '1867947880635861', prefix: /^IBC_/ },
  NO: { act: '1050941584152547', prefix: /^IBC-tanktrekk_NO_/ },
};

const ut = {};
for (const [marknad, k] of Object.entries(KÄLLOR)) {
  const ads = await alla(`act_${k.act}/ads`, { fields: 'id,name,campaign_id,effective_status' }, 200);
  const träff = ads.filter((a) => k.prefix.test(a.name));
  const kampanjer = [...new Set(träff.map((a) => a.campaign_id))];
  ut[marknad] = {
    kallaTotalt: ads.length,
    kalla: träff.map((a) => a.name.replace(k.prefix, '')).sort(),
    kampanjer: kampanjer.length,
  };
  logg(`${marknad}: ${träff.length} källannonser med prefixet, i ${kampanjer.length} kampanj(er) (av ${ads.length} i kontot)`);
}

const mål = await alla(`act_${MÅL}/campaigns`, { fields: 'id,name' }, 200);
for (const [marknad, namn] of Object.entries(KAMPANJER)) {
  const k = mål.find((x) => x.name === namn);
  if (!k) { ut[marknad].byggda = []; logg(`⚠️ ${marknad}: kampanjen "${namn}" hittades inte`); continue; }
  const ads = await alla(`${k.id}/ads`, { fields: 'id,name,status,effective_status' }, 200);
  ut[marknad].kampanjId = k.id;
  ut[marknad].byggda = ads.map((a) => ({
    kort: a.name.replace(/^TankGuard_(NO_)?/, ''), namn: a.name, status: a.status, id: a.id,
  })).sort((a, b) => a.kort.localeCompare(b.kort));
  logg(`${marknad}: ${ads.length} annonser i "${namn}"`);
}

logg('');
for (const marknad of ['SE', 'NO']) {
  const d = ut[marknad];
  const byggdaKort = new Set(d.byggda.map((b) => b.kort));
  const saknas = d.kalla.filter((k) => !byggdaKort.has(k));
  const extra = d.byggda.filter((b) => !d.kalla.includes(b.kort)).map((b) => b.kort);
  const aktiva = d.byggda.filter((b) => b.status !== 'PAUSED');
  logg(`######## ${marknad}`);
  logg(`  källannonser: ${d.kalla.length}   byggda: ${d.byggda.length}   saknas: ${saknas.length}`);
  if (saknas.length) logg(`  SAKNAS: ${saknas.join(', ')}`);
  if (extra.length) logg(`  BYGGDA UTAN KÄLLA: ${extra.join(', ')}`);
  logg(`  ${aktiva.length ? `⚠️ EJ PAUSADE: ${aktiva.map((a) => a.namn).join(', ')}` : 'alla PAUSED ✅'}`);
  d.saknas = saknas; d.extra = extra;
}

writeFileSync('/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad/rakning-slutlig.json',
  JSON.stringify(ut, null, 2));
logg('\nSkrivet till scratchpad/rakning-slutlig.json');
