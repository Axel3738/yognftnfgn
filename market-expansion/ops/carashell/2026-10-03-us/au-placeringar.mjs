#!/usr/bin/env node
// au-placeringar.mjs — sätter marknadens placeringar på det adset DEN HÄR körningen
// skapade i Australienkampanjen, och läser tillbaka.
//
// ⛔ Rör BARA adsetet körningen själv skapade (CARASHELL AU_OB). Axels fyra egna
// AU-adsets (AU_PD, AU_CS, AU_GT, AU_SP) står på Advantage+ och rörs ALDRIG här —
// det är hans beslut, och det står som fråga i rapporten.
//
// Varför: `tools/ops-till-meta.mjs` klonar ett nytt adset ur ett syskon och ärver
// därmed syskonets placeringar. `factory/kampanj.mjs` ger nya US-adsets marknadens
// placeringar, men uppladdaren gör det inte. Mätt 2026-10-03 i AU-kampanjen:
// Instagram Stories 762 kr i går och 504 kr i dag, 0 köp, medan flödet gav 5 + 1 köp.
//
//   node au-placeringar.mjs            # visar bara
//   node au-placeringar.mjs --ja       # sätter och läser tillbaka
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const JA = process.argv.includes('--ja');
const T = process.env.META_ACCESS_TOKEN;
const PLACERINGAR = { publisher_platforms: ['facebook', 'instagram'], facebook_positions: ['feed'], instagram_positions: ['stream'] };

const api = async (p, q = {}, metod = 'GET') => {
  const u = new URL(`https://graph.facebook.com/v23.0/${p}`);
  const kropp = new URLSearchParams({ ...q, access_token: T });
  const r = metod === 'GET'
    ? await fetch(`${u}?${kropp}`)
    : await fetch(u, { method: 'POST', body: kropp });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j;
};

const rader = JSON.parse(readFileSync(join(HÄR, 'annonser.json'), 'utf8'));
const au = rader.filter((r) => r.land === 'AU' && r.adset_id);
const idn = [...new Set(au.map((r) => r.adset_id))];
if (!idn.length) { console.log('Inget AU-adset i annonser.json — inget att göra.'); process.exit(0); }

for (const id of idn) {
  const a = await api(id, { fields: 'id,name,status,campaign_id,targeting' });
  const t = a.targeting ?? {};
  console.log(`${a.name} (${a.id}) ${a.status}`);
  console.log(`   före: plattformar ${JSON.stringify(t.publisher_platforms ?? 'Advantage+ (inga satta)')} · fb ${JSON.stringify(t.facebook_positions ?? null)} · ig ${JSON.stringify(t.instagram_positions ?? null)}`);
  if (!JA) { console.log('   (torrt — inget skrivet, kör med --ja)'); continue; }
  await api(id, { targeting: JSON.stringify({ ...t, ...PLACERINGAR }) }, 'POST');
  const b = await api(id, { fields: 'id,name,targeting' });
  const u = b.targeting ?? {};
  console.log(`   efter: plattformar ${JSON.stringify(u.publisher_platforms)} · fb ${JSON.stringify(u.facebook_positions)} · ig ${JSON.stringify(u.instagram_positions)}`);
}
