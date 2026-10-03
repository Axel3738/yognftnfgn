#!/usr/bin/env node
// au-aktivera.mjs — aktiverar det adset DEN HÄR körningen skapade i Australienkampanjen.
//
// Varför det behövs: `tools/ops-till-meta.mjs` aktiverar annonsen alltid men adsetet
// bara när samma anrop skapade det (`aktivera({ annonsId, adset, skapad })`). Första
// AU-försöket skapade `CARASHELL AU_OB` och föll sedan på Metas IG-fel, så adsetet
// föddes PAUSED; de sex följande uppladdningarna såg det som befintligt och lämnade
// det. Resultatet: sju ACTIVE annonser i ett PAUSED adset, alltså noll leverans.
//
// ⛔ Rör BARA adsetet ur `annonser.json` (det körningen skapade), och bara om det
// alltjämt har 0 kr spend och ligger i AU-kampanjen ur registret. Axels fyra egna
// AU-adsets (AU_PD, AU_CS, AU_GT, AU_SP) rörs ALDRIG — ett pausat adset med spend
// är ett beslut, aldrig ett fel att rätta (CLAUDE.md).
//
//   node au-aktivera.mjs           # visar bara
//   node au-aktivera.mjs --ja      # aktiverar och läser tillbaka
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const JA = process.argv.includes('--ja');
const T = process.env.META_ACCESS_TOKEN;

const api = async (p, q = {}, metod = 'GET') => {
  const u = new URL(`https://graph.facebook.com/v23.0/${p}`);
  const kropp = new URLSearchParams({ ...q, access_token: T });
  const r = metod === 'GET' ? await fetch(`${u}?${kropp}`) : await fetch(u, { method: 'POST', body: kropp });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j;
};

const jobb = JSON.parse(readFileSync(join(HÄR, 'jobb.json'), 'utf8'));
const rader = JSON.parse(readFileSync(join(HÄR, 'annonser.json'), 'utf8'));
const auKampanj = jobb.rader.flatMap((r) => r.ocksa ?? []).find((o) => o.land === 'AU')?.kampanj_id;
const idn = [...new Set(rader.filter((r) => r.land === 'AU' && r.adset_id).map((r) => r.adset_id))];
if (!idn.length) { console.log('Inget AU-adset i annonser.json — inget att göra.'); process.exit(0); }

for (const id of idn) {
  const a = await api(id, { fields: 'name,status,effective_status,campaign_id,created_time' });
  const ins = await api(`${id}/insights`, { fields: 'spend', date_preset: 'maximum' }).catch(() => ({ data: [] }));
  const spend = Number(ins.data?.[0]?.spend ?? 0);
  console.log(`${a.name} (${id}) ${a.status} · kampanj ${a.campaign_id} · spend ${spend} · skapat ${a.created_time}`);

  if (a.campaign_id !== auKampanj) { console.log('   ⛔ ligger inte i registrets AU-kampanj — rörs inte.'); continue; }
  if (!/^CARASHELL AU_OB$/.test(a.name)) { console.log('   ⛔ inte körningens eget adset — rörs inte.'); continue; }
  if (spend > 0) { console.log('   ⛔ har spend, alltså ett beslut — rörs inte.'); continue; }
  if (a.status === 'ACTIVE') { console.log('   redan ACTIVE.'); continue; }
  if (!JA) { console.log('   skulle aktiveras (kör med --ja).'); continue; }

  await api(id, { status: 'ACTIVE' }, 'POST');
  const efter = await api(id, { fields: 'name,status,effective_status' });
  console.log(`   ✅ ${a.status} → ${efter.status} / effective ${efter.effective_status}`);
}
