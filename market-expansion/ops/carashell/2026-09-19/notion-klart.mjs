// Skriver kommentar + "Translated url" på varje uppladdad rad och flyttar den
// till Approved när radens flytta_till_approved är sant (alla annonsmarknader
// bär annonsen). Läser resultat.jsonl + ko.json — inga id:n för hand.
//   node market-expansion/ops/carashell/2026-09-19/notion-klart.mjs [--torr]
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const D = 'market-expansion/ops/carashell/2026-09-19';
const KONTO = '915422744950975';
const torr = process.argv.includes('--torr');

const ko = JSON.parse(readFileSync(`${D}/ko.json`, 'utf8'));
const rader = readFileSync(`${D}/resultat.jsonl`, 'utf8').trim().split('\n')
  .filter(Boolean).map((r) => JSON.parse(r));
const perNamn = new Map(rader.filter((r) => r.ok).map((r) => [r.annons.namn, r]));

for (const rad of ko.rader) {
  const res = perNamn.get(rad.mal_namn);
  if (!res) {
    console.log(`— ${rad.namn}: ingen uppladdning, raden lämnas orörd`);
    continue;
  }
  const koncept = res.adset.namn.split(' - ').pop();
  const argv = [
    'tools/notion-aterkoppling.mjs', rad.page_id,
    '--kommentar', `NO ✅ ${rad.mal_namn} live in ${res.kampanj.namn} (adset ${koncept}), ad ${res.annons.id}`,
    '--egenskap', `Translated url=https://www.facebook.com/adsmanager/manage/ads?act=${KONTO}&selected_ad_ids=${res.annons.id}`,
  ];
  if (rad.flytta_till_approved) argv.push('--status', 'Approved');
  if (torr) argv.push('--torr');
  console.log(`▶ ${rad.mal_namn} → ${rad.flytta_till_approved ? 'Approved' : 'status orörd'}`);
  try {
    execFileSync('node', argv, { stdio: 'inherit' });
  } catch {
    console.log(`  ⚠ misslyckades, försöker utan --egenskap`);
    execFileSync('node', argv.filter((a, i) => i !== argv.indexOf('--egenskap') && i !== argv.indexOf('--egenskap') + 1), { stdio: 'inherit' });
  }
}
