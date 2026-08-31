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
import { allaKlaraRader } from './notion-kalla.mjs';

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

// Prefix som inte gar att harleda ur kontot: Notion-hubben och annonskontot anvander
// ibland olika sprak for samma produkt (hubben "Belt grinder", kampanjen
// "Balteslipmaskinen"). Da finns ingen gemensam strang att matcha pa — kopplingen
// skrivs upp en gang i prefix-alias.json i stallet for att gissas.
let alias = {};
try {
  alias = JSON.parse(readFileSync(`${ROT}products/prefix-alias.json`, 'utf8')).alias ?? {};
} catch { /* filen ar frivillig */ }

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
    const al = alias[pfx];
    const kampanj = p ? { id: p.campaign_ids[0], name: null, status: null }
                  : (karta[pfx] ?? (al ? { id: al.kampanj_id, name: al.kampanj_namn, status: null } : null));
    leveranser.push({
      vecka: v.titel, mapp: m.id, namn, prefix: pfx,
      produktId: p?.id ?? pfx, kampanj,
      kalla: p ? 'products.json' : (karta[pfx] ? 'kontot' : (al ? 'prefix-alias.json' : null)),
    });
  }
}
for (const l of leveranser) l.kalla2 = 'drive';

// 2b. Leveranserna i Notion. /bildannonser (20:00) lagger bildannonser som BILAGA i
// radens "Filer och media" med status "To be Reviewed" — de passerar aldrig Drive, och
// bildannonser/output/ ar gitignorerat, sa Notion-bilagan ar enda kopian i varlden.
// (Rotorsaken till att fem fardiga bildannonser lag osynliga 2026-08-31.)
let notionFel = null;
let notionHubbar = 0;
let hubbNamn = [];
try {
  const { hubbar, rader, fel } = await allaKlaraRader();
  notionHubbar = hubbar.length;
  hubbNamn = hubbar.map(h => h.titel).sort();
  if (Object.keys(fel).length) notionFel = Object.entries(fel).map(([h, f]) => `${h}: ${f}`).join(' · ');
  for (const r of rader) {
    const namn = annonsdel(r.namn);
    const pfx = prefixAv(namn);
    if (!pfx) continue;
    const p = konfig[pfx] ?? null;
    const al = alias[pfx];
    // Kampanjkartan ur MagiBorsten ar ocksa teamspace-sparren: en hub vars prefix inte
    // finns i Baverbutikens konto hor till en annan verksamhet och laddas aldrig upp.
    const kampanj = p ? { id: p.campaign_ids[0], name: null, status: null }
                  : (karta[pfx] ?? (al ? { id: al.kampanj_id, name: al.kampanj_namn, status: null } : null));
    leveranser.push({
      vecka: r.hub, mapp: r.id, namn, prefix: pfx,
      produktId: p?.id ?? pfx, kampanj,
      kalla: p ? 'products.json' : (karta[pfx] ? 'kontot' : (al ? 'prefix-alias.json' : null)),
      kalla2: 'notion', notionUrl: r.url, notionFiler: r.filer, skapad: r.skapad,
    });
  }
} catch (e) {
  // ALDRIG tyst. Att Notion inte gick att lasa ar exakt den lucka som gomde
  // fem fardiga bildannonser — den ska synas hogst upp i rapporten.
  notionFel = e.saknarToken
    ? 'NOTION_TOKEN saknas — Notion-källan lästes INTE. Bildannonser från /bildannonser är osynliga i den här körningen.'
    : `Notion kunde inte läsas: ${e.message}`;
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
  const filer = l.kalla2 === 'notion'
    ? l.notionFiler.map(f => ({ typ: 'notion', id: l.mapp, titel: f.namn || `${l.namn}.jpg` }))
    : driveLs(l.mapp).filter(f => f.typ === 'fil');
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
// Ett tyst Notion-fel ar samma fella igen. Det star forst, fore allt annat.
if (notionFel) {
  console.log(`⚠️  NOTION-KÄLLAN: ${notionFel}`);
  console.log(`    Kön nedan är därför OFULLSTÄNDIG — bildannonser saknas.\n`);
}
const frånDrive = leveranser.filter(l => l.kalla2 === 'drive').length;
const frånNotion = leveranser.filter(l => l.kalla2 === 'notion').length;
// Lista hubbarna vid namn. En integration ser bara de hubbar den blivit inbjuden
// till, och en hub den inte ser ar helt osynlig — man kan inte sakna det man aldrig
// vetat om. Namnen i rapporten ar enda sattet att upptacka en ny hub som glomts bort.
if (hubbNamn.length) {
  console.log(`Notion-hubbar som lästes (${hubbNamn.length}):`);
  for (const n of hubbNamn) console.log(`  · ${n}`);
  console.log(`  Saknas en hub här har integrationen inte bjudits in till den.\n`);
}
console.log(`Källor: ${frånDrive} i Drive · ${frånNotion} i Notion (${notionHubbar} hubbar) · ${leveranser.length - nya.length} redan i kontot · ${Object.keys(karta).length} kända prefix\n`);

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
    const media = r.filer.filter(f => f.typ === 'notion' || /\.(mp4|mov|m4v|jpg|jpeg|png)$/i.test(f.titel));
    console.log(`  • ${r.namn}  (${r.kalla2 === 'notion' ? 'Notion: ' + r.vecka : r.vecka})`);
    if (!media.length) { console.log(`      ⚠ ingen media i mappen — inte klar`); continue; }
    for (const f of media) {
      if (r.kalla2 === 'notion') {
        // Signerad URL med kort livslangd — hamtas vid korning, skrivs aldrig ut.
        console.log(`      ${f.titel}`);
        console.log(`        hämtas med: node tools/notion-fil.mjs ${r.mapp} --ut <mapp>`);
        continue;
      }
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
