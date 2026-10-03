#!/usr/bin/env node
// las-resultat.mjs — plockar annons-id, adset och kampanj ur de skarpa uppladdningsloggarna.
// ⚠️ Skriptets egna JSON-parse i ladda-upp.mjs föll på "Extra data" (loggen fortsätter
// efter JSON-objektet), så id:na läses här ur raden "8. Annons skapad" i stället.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const rader = [];
for (const f of readdirSync(HÄR).filter((x) => /^upp-(US|AU)-OB_\d+\.log$/.test(x))) {
  const t = readFileSync(join(HÄR, f), 'utf8');
  const land = f.split('-')[1];
  const kort = f.match(/OB_\d+/)[0];
  const annons = t.match(/8\. Annons skapad \w+: (\S+) \((\d+)\)/);
  const adset = t.match(/5\. Koncept \w+ → adset "([^"]+)" \((\d+)\)/) || t.match(/5\. Koncept \w+ → adset "([^"]+)" \(([^)]+)\)/);
  const kampanj = t.match(/2\. Kampanj \(--kampanj\): "([^"]+)" \((\d+)\)/);
  const aktiv = t.match(/9\. Aktiverad: (.+)/);
  const nyttAdset = /nyskapat som klon av "([^"]+)"/.exec(t);
  rader.push({ land, kort, namn: annons?.[1] ?? null, ad_id: annons?.[2] ?? null,
    adset_namn: adset?.[1] ?? null, adset_id: adset?.[2] ?? null,
    kampanj_namn: kampanj?.[1] ?? null, kampanj_id: kampanj?.[2] ?? null,
    aktiverad: aktiv?.[1]?.trim() ?? null, adset_klonat_av: nyttAdset?.[1] ?? null });
}
rader.sort((a, b) => (a.kort === b.kort ? a.land.localeCompare(b.land) : a.kort.localeCompare(b.kort)));
writeFileSync(join(HÄR, 'annonser.json'), JSON.stringify(rader, null, 1));
for (const r of rader) console.log(`${r.land} ${r.namn ?? r.kort} ad ${r.ad_id ?? 'SAKNAS'} · adset ${r.adset_namn} (${r.adset_id})${r.adset_klonat_av ? ` — nytt, klon av ${r.adset_klonat_av}` : ''} · ${r.aktiverad ?? 'ingen aktiveringsrad'}`);
console.log(`\n${rader.length} rader → annonser.json`);
