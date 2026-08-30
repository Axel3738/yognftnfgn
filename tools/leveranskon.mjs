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

/** Alla annonser i kontot, med sin kampanj. Kontot ar kvittot pa vad som ar gjort
 *  OCH facit for vilken kampanj ett prefix hor till — bada las har, en gang. */
async function metaAnnonser(act) {
  if (!process.env.META_ACCESS_TOKEN) dö('META_ACCESS_TOKEN saknas i miljön.');
  const ut = [];
  let url = `${API}/act_${act}/ads?fields=name,campaign{name,status}&limit=300&access_token=${process.env.META_ACCESS_TOKEN}`;
  while (url) {
    const j = await (await fetch(url)).json();
    if (j.error) dö(`Meta: ${j.error.message}`);
    ut.push(...(j.data || []));
    url = j.paging?.next ?? null;
  }
  return ut;
}

/** Prefixet ur ett annonsnamn: "Rodholder_PD_11_H1" -> "rodholder". */
const prefixAv = (namn) => (annonsdel(namn).match(/^([A-Za-z]+)_/) || [])[1]?.toLowerCase() ?? null;

/** Kontot lar oss sjalvt vilken kampanj ett prefix hor till — ingen konfig behovs.
 *  Nya produkter dyker upp standigt i Baverbutiken; en hardkodad lista missar dem
 *  tyst, och tyst missad leverans ar varre an en rapporterad. Kampanjen med FLEST
 *  annonser pa prefixet vinner; oavgjort bryts av att en ACTIVE kampanj gar fore. */
function prefixKarta(annonser) {
  const rakning = {};
  for (const a of annonser) {
    const p = prefixAv(a.name);
    if (!p || !a.campaign?.id) continue;
    ((rakning[p] ??= {})[a.campaign.id] ??= { ...a.campaign, antal: 0 }).antal++;
  }
  const karta = {};
  for (const [p, kampanjer] of Object.entries(rakning)) {
    karta[p] = Object.values(kampanjer).sort((a, b) =>
      b.antal - a.antal || (b.status === 'ACTIVE') - (a.status === 'ACTIVE'))[0];
  }
  return karta;
}

// Notion-titlar bär ibland ett suffix: "Beachslippers_PD_2_8 – COPY ONLY: ...".
// Drive-mappen heter bara annonsdelen. Jämför alltid på annonsdelen.
const annonsdel = (s) => s.split(/\s+[–—-]\s+/)[0].trim();

const { products } = JSON.parse(readFileSync(`${ROT}products/products.json`, 'utf8'));
const BAVERBUTIKEN_ACT = '1867947880635861';
const filter = flagga('produkt');

// products.json ar en explicit override for de fyra skalningsprodukterna.
// Allt annat i Baverbutiken hittas via kontot i prefixKarta().
const konfig = {};
for (const p of products) {
  if (p.creative_prefix && p.ad_account_id === BAVERBUTIKEN_ACT) {
    konfig[p.creative_prefix.replace(/_$/, '').toLowerCase()] = p;
  }
}

// Notion-titlar bar ibland ett suffix: "Beachslippers_PD_2_8 – COPY ONLY: ...".
// Drive-mappen heter bara annonsdelen. Jamfor alltid pa annonsdelen.

// 1. Kontot: vad som redan ar gjort, och vilket prefix som hor till vilken kampanj.
const annonser = await metaAnnonser(BAVERBUTIKEN_ACT);
const uppe = new Set(annonser.map(a => a.name.trim().toLowerCase()));
const karta = prefixKarta(annonser);

// 2. Leveranserna i Drive.
const veckor = driveLs(EDITED_FOLDER).filter(x => x.typ === 'mapp');
const leveranser = [];
for (const v of veckor) {
  for (const m of driveLs(v.id)) {
    if (m.typ !== 'mapp') continue;
    const namn = annonsdel(m.titel);
    const pfx = prefixAv(namn);
    if (!pfx) continue;                       // inte ett annonsnamn — hoppa tyst
    const p = konfig[pfx] ?? null;
    const kampanj = p ? { id: p.campaign_ids[0], name: null, status: null } : (karta[pfx] ?? null);
    leveranser.push({
      vecka: v.titel, mapp: m.id, namn, prefix: pfx,
      produktId: p?.id ?? pfx, kampanj,
      kalla: p ? 'products.json' : (kampanj ? 'kontot' : null),
    });
  }
}
if (filter) {
  for (let i = leveranser.length - 1; i >= 0; i--) {
    if (leveranser[i].produktId !== filter && leveranser[i].prefix !== filter.toLowerCase()) leveranser.splice(i, 1);
  }
}

// 3. Kon: levererat men inte i kontot.
const kö = [];
for (const l of leveranser) {
  const gjort = uppe.has(l.namn.toLowerCase());
  if (gjort && !finns('alla')) continue;
  const filer = driveLs(l.mapp).filter(f => f.typ === 'fil');
  kö.push({ ...l, gjort, filer });
}

/** Lifetime-spend. Fel att lasa = anta att den spenderat (rors inte). */
async function spend(id) {
  try {
    const r = await (await fetch(`${API}/${id}/insights?date_preset=maximum&fields=spend&access_token=${process.env.META_ACCESS_TOKEN}`)).json();
    return Number(r.data?.[0]?.spend ?? 0);
  } catch { return Infinity; }
}

// Kampanjnamn for de som kom ur products.json (kartan har dem inte alltid).
for (const k of kö) {
  if (k.kampanj && !k.kampanj.name) {
    const träff = annonser.find(a => a.campaign?.id === k.kampanj.id)?.campaign;
    if (träff) { k.kampanj.name = träff.name; k.kampanj.status = träff.status; }
  }
}

// En PAUSED kampanj som spenderat ar avvecklad — dit gar inga nya creatives.
for (const k of kö) {
  if (k.kampanj && k.kampanj.status && k.kampanj.status !== 'ACTIVE') {
    k.kampanjSpend = await spend(k.kampanj.id);
    k.avvecklad = k.kampanjSpend > 0;
  }
}

if (finns('json')) {
  console.log(JSON.stringify({
    hämtadAt: new Date().toISOString(),
    levereratTotalt: leveranser.length,
    kö,
  }, null, 2));
  process.exit(0);
}

const nya = kö.filter(k => !k.gjort);
const utan = nya.filter(k => !k.kampanj);
const hyllade = nya.filter(k => k.avvecklad);
console.log(`Leveransmappar i Drive: ${leveranser.length} · ${leveranser.length - nya.length} redan i kontot · ${karta && Object.keys(karta).length} kända prefix i kontot\n`);

const perProdukt = {};
for (const k of nya) (perProdukt[k.produktId] ??= []).push(k);

for (const [pid, rader] of Object.entries(perProdukt)) {
  const kmp = rader[0].kampanj;
  if (!kmp) {
    console.log(`${pid} → ⚠️  INGEN KAMPANJ i kontot — produkten är inte launchad. Laddas INTE upp.`);
  } else if (rader[0].avvecklad) {
    console.log(`${pid} → ${kmp.name} [${kmp.status}], ${rader[0].kampanjSpend} kr spend`);
    console.log(`   ⏭  AVVECKLAD — avstängd med flit. Laddas INTE upp. Rapporteras bara.`);
  } else {
    const aktiv = kmp.status === 'ACTIVE';
    console.log(`${pid} → ${kmp.name} [${kmp.status}]${aktiv ? '  ⚠️ AKTIV — uppladdning här börjar spendera' : ''}`);
    console.log(`   (kopplingen kommer från ${rader[0].kalla})`);
  }
  for (const r of rader) {
    const media = r.filer.filter(f => /\.(mp4|mov|m4v|jpg|jpeg|png)$/i.test(f.titel));
    console.log(`  • ${r.namn}  (${r.vecka})`);
    if (!media.length) { console.log(`      ⚠ ingen media i mappen — inte klar`); continue; }
    for (const f of media) {
      const fnamn = f.titel.replace(/\.[^.]+$/, '');
      const varning = fnamn.toLowerCase() !== r.namn.toLowerCase() ? '  ⚠ FILNAMN ≠ MAPPNAMN' : '';
      console.log(`      ${f.titel}${varning}`);
      console.log(`        https://drive.google.com/uc?export=download&id=${f.id}`);
    }
  }
  console.log('');
}

console.log(`${nya.length} leverans(er) väntar på uppladdning.`);
if (utan.length) console.log(`⚠️  ${utan.length} av dem saknar kampanj i kontot och laddas inte upp.`);
if (hyllade.length) console.log(`⏭  ${hyllade.length} hör till en avvecklad kampanj och laddas inte upp.`);
const iAktiva = nya.filter(k => k.kampanj?.status === 'ACTIVE').length;
if (iAktiva) console.log(`⚠️  ${iAktiva} skulle hamna i en AKTIV kampanj — de börjar spendera direkt vid aktivering.`);
