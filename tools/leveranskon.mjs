#!/usr/bin/env node
// leveranskon.mjs — vad redigerarna har levererat som ännu inte ligger i Meta.
// Kön för /notionkorning. Två källor, två olika jobb (samma logik som /nattkorning):
//
//   Vad som SKA laddas upp  = redigerarnas leveransmappar i Drive.
//   Vad som REDAN ÄR gjort  = annonsnamnen i MagiBorsten.
//   Kön = leverans i Drive  −  annons i kontot.
//
//   node tools/leveranskon.mjs [--produkt <id>] [--json] [--alla]
//
// Kräver env: META_ACCESS_TOKEN. Drive läses via publika länkar
// (tools/drive-ls.py) — ingen connector behövs, så rutiner kan köra det.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Redigerarnas leveransrot. Innehåller "Week N"-mappar, en mapp per annons.
const EDITED_FOLDER = '1V4V8y4QQnX0tvZ3MQUicu1Y1k-l95yFM';
const API = `https://graph.facebook.com/${process.env.META_API_VERSION || 'v23.0'}`;
const ROT = new URL('..', import.meta.url).pathname;

const args = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
};
const finns = (n) => args.includes(`--${n}`);
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

function driveLs(id) {
  try {
    const ut = execFileSync('python3', [`${ROT}tools/drive-ls.py`, id], { encoding: 'utf8', timeout: 60000 });
    return ut.trim().split('\n').filter(Boolean).map(rad => {
      const [typ, fid, ...titel] = rad.split('\t');
      return { typ, id: fid, titel: titel.join('\t') };
    });
  } catch (e) {
    dö(`Kunde inte läsa Drive-mappen ${id}: ${e.message}`);
  }
}

async function metaAnnonsnamn(act) {
  if (!process.env.META_ACCESS_TOKEN) dö('META_ACCESS_TOKEN saknas i miljön.');
  const namn = new Set();
  let url = `${API}/act_${act}/ads?fields=name&limit=200&access_token=${process.env.META_ACCESS_TOKEN}`;
  while (url) {
    const r = await fetch(url);
    const j = await r.json();
    if (j.error) dö(`Meta: ${j.error.message}`);
    for (const a of j.data || []) namn.add(a.name.trim().toLowerCase());
    url = j.paging?.next ?? null;
  }
  return namn;
}

// Notion-titlar bär ibland ett suffix: "Beachslippers_PD_2_8 – COPY ONLY: ...".
// Drive-mappen heter bara annonsdelen. Jämför alltid på annonsdelen.
const annonsdel = (s) => s.split(/\s+[–—-]\s+/)[0].trim();

const { products } = JSON.parse(readFileSync(`${ROT}products/products.json`, 'utf8'));
const filter = flagga('produkt');
const medPrefix = products.filter(p => p.creative_prefix && (!filter || p.id === filter));
if (!medPrefix.length) dö(filter ? `${filter} saknar creative_prefix i products.json.` : 'Ingen produkt har creative_prefix.');

const produktFör = (namn) => medPrefix.find(p =>
  annonsdel(namn).toLowerCase().startsWith(p.creative_prefix.toLowerCase()));

// 1. Leveranserna i Drive.
const veckor = driveLs(EDITED_FOLDER).filter(x => x.typ === 'mapp');
const leveranser = [];
for (const v of veckor) {
  for (const m of driveLs(v.id)) {
    if (m.typ !== 'mapp') continue;
    const p = produktFör(m.titel);
    if (!p) continue;            // andra produkter utanför detta OS — rörs aldrig
    leveranser.push({ vecka: v.titel, mapp: m.id, namn: annonsdel(m.titel), rubrik: m.titel, produkt: p });
  }
}

// 2. Kvittot: vad som redan finns i kontot.
const uppe = await metaAnnonsnamn(medPrefix[0].ad_account_id);

// 3. Kön.
const kö = [];
for (const l of leveranser) {
  const gjort = uppe.has(l.namn.toLowerCase());
  if (gjort && !finns('alla')) continue;
  const filer = driveLs(l.mapp).filter(f => f.typ === 'fil');
  kö.push({ ...l, produktId: l.produkt.id, kampanj: l.produkt.campaign_ids[0], gjort, filer });
}

if (finns('json')) {
  console.log(JSON.stringify({
    hämtadAt: new Date().toISOString(),
    levereratTotalt: leveranser.length,
    kö: kö.map(({ produkt, ...r }) => r),
  }, null, 2));
  process.exit(0);
}

const perProdukt = {};
for (const k of kö) (perProdukt[k.produktId] ??= []).push(k);

console.log(`Leveransmappar i Drive: ${leveranser.length} · redan i kontot: ${leveranser.length - kö.filter(k => !k.gjort).length}`);
for (const [pid, rader] of Object.entries(perProdukt)) {
  console.log(`\n${pid} → kampanj ${rader[0].kampanj}`);
  for (const r of rader) {
    const media = r.filer.filter(f => /\.(mp4|mov|m4v|jpg|jpeg|png)$/i.test(f.titel));
    console.log(`  ${r.gjort ? '✔' : '•'} ${r.namn}  (${r.vecka})`);
    if (!media.length) console.log(`      ⚠ ingen media i mappen — inte klar`);
    else for (const f of media) console.log(`      ${f.titel}  https://drive.google.com/uc?export=download&id=${f.id}`);
  }
}
const nya = kö.filter(k => !k.gjort).length;
console.log(`\n${nya} leverans(er) väntar på uppladdning.`);
