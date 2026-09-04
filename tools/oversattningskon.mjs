#!/usr/bin/env node
// oversattningskon.mjs — kön för /oversatt: Notion-rader i "SE-ACTIVE to be
// translated" → SE-annonsen i MagiBorsten → marknadens kampanj/adset → målnamn.
// Skriver en jobbfil som bild-/video-stegen och notion-till-marknad.mjs läser.
//
//   node tools/oversattningskon.mjs --marknad NO [--dry] [--rader <fil.json>]
//        [--datum YYYY-MM-DD] [--max-bilder 40] [--max-videor 12]
//
//   --rader   rader som JSON (lista av {id, namn, typ, status, hub, url}) från
//             en MCP-session, i stället för Notion REST. Utan flaggan läses kön
//             via NOTION_TOKEN (tools/notion-kalla.mjs).
//   --dry     visa kön (rad → SE-annons → kampanj/adset → målnamn → kör/hoppa),
//             skriv ingen jobbfil.
//
// Kräver env META_ACCESS_TOKEN (+ NOTION_TOKEN utan --rader). Rör ALDRIG kontot —
// verktyget läser bara.
//
// Regler (docs/oversatt-rutin.md):
//  • Prefix = allt före första "_" i annonsdelen (bindestreck/å/ä/ö tillåtna).
//    SE-namnet slås upp EXAKT i SE-kontot; finns det inte är raden inte launchad
//    i Sverige — rapportera, hoppa. Ingen rad hoppas tyst.
//  • Kopplingen SE-prefix → marknadens kampanj ligger i <land>/produkter.json.
//  • Fyra utfall per kampanj: ACTIVE · PAUSED utan spend · PAUSED med spend
//    (avvecklad, kör inte) · saknas (kör inte, bygg aldrig).
//  • Dubblettspärr: målkontot läses EN gång; finns målnamnet → klar, hoppa tyst.
//  • Pris ur marknadens butik vid varje körning (products.json, matchat på handle).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { säkerställProxy, api, alla, kampanjUtfall } from './meta-lib.mjs';

säkerställProxy();

const ROT = new URL('..', import.meta.url).pathname;
const SE_ACT = '1867947880635861';           // MagiBorsten SE — källan
const KÖ_STATUS = 'SE-ACTIVE to be translated';
const TYP_RE = /pending approval/i;

const args = process.argv.slice(2);
const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
const finns = (n) => args.includes(`--${n}`);
const DRY = finns('dry');
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

const kod = (flagga('marknad') || '').toUpperCase();
if (!kod) dö('Ange --marknad <KOD>, t.ex. --marknad NO.');
const MARKNADER = JSON.parse(readFileSync(resolve(ROT, 'market-expansion/marknader.json'), 'utf8'));
const M = MARKNADER[kod];
if (!M) dö(`Okänd marknad "${kod}". Finns: ${Object.keys(MARKNADER).filter(k => !k.startsWith('_')).join(', ')}`);
if (!M.aktiv && !finns('trots-inaktiv')) dö(`Marknad ${kod} är inte aktiv i marknader.json (aktiv=false).`);
const PRODUKTER = JSON.parse(readFileSync(resolve(ROT, M.produkter), 'utf8'));
const datum = flagga('datum', new Date().toISOString().slice(0, 10));
const MAX_BILDER = Number(flagga('max-bilder', 40));
const MAX_VIDEOR = Number(flagga('max-videor', 12));

// ------------------------------------------------------------ hjälpare

/** Annonsdelen av radtiteln: allt före " – suffix" / " — " / " - ". */
const annonsdel = (t) => String(t).split(/\s[–—-]\s/)[0].trim();
/** Prefix = allt före första "_". Inga teckenklasser — "MC-Kapell", "Båtmotor" ska funka. */
const prefixAv = (n) => { const i = n.indexOf('_'); return i > 0 ? n.slice(0, i) : null; };
/** Namnets fält efter prefixet: K (vinkel), nr, ev. hook. Kranskydd_PD_3_1 → PD, 3, "1" */
function delaNamn(n) {
  const f = n.split('_');
  const K = (f[1] || '').trim();
  const nr = (f[2] || '').trim();
  const rest = f.slice(3).join('_');
  return { K, nr, rest };
}
// Vinkeln tas ur SE-namnet, som aldrig bär marknadskod. Det enda som får stoppas
// är målmarknadens egen kod (K="NO" ur ett NO-namn matchade vartenda NO-adset) — inte
// "DE", som är en svensk vinkel (Demo), och inte andra landskoder.
const FÖRBJUDEN_K = new RegExp(`^(${kod}|SE)$`, 'i');
const handleAv = (url) => { try { return new URL(url).pathname.split('/products/')[1]?.split(/[/?#]/)[0] ?? null; } catch { return null; } };

/** Målnamn: <no_prefix>_<KOD>_<K>_<nr>[_<rest>]. Bild i SE = "_1"-suffix, video = "_H<n>". */
function målnamn(p, K, nr, rest) {
  return [p.no_prefix, kod, K, nr, rest].filter(x => x !== '' && x != null).join('_');
}

async function hämtaJson(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (oversattningskon)' } });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

/** Marknadens produktkatalog (Shopify products.json, paginerat). */
async function butikensProdukter() {
  const ut = new Map();
  for (let page = 1; page < 40; page++) {
    const d = await hämtaJson(`${M.butik}/products.json?limit=250&page=${page}`);
    const ps = d.products || [];
    if (!ps.length) break;
    for (const p of ps) {
      const v = p.variants?.[0] || {};
      ut.set(p.handle, { handle: p.handle, titel: p.title, pris: v.price, jamforpris: v.compare_at_price, tillganglig: v.available });
    }
  }
  return ut;
}

async function heygenKvot() {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch('https://api.heygen.com/v2/user/remaining_quota', { headers: { 'x-api-key': key } });
    const j = await r.json();
    return j.data?.details?.api ?? j.data?.remaining_quota ?? null;
  } catch { return null; }
}
async function kieSaldo() {
  const key = process.env.KIE_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch('https://api.kie.ai/api/v1/chat/credit', { headers: { authorization: `Bearer ${key}` } });
    const j = await r.json();
    return j.data ?? null;
  } catch { return null; }
}

// ------------------------------------------------------------ kön

async function läsKö() {
  const fil = flagga('rader');
  if (fil) {
    const rader = JSON.parse(readFileSync(fil, 'utf8'));
    return rader
      .filter(r => (r.status || '').toLowerCase() === KÖ_STATUS.toLowerCase() && TYP_RE.test(r.typ || ''))
      .map(r => ({ id: String(r.id).replace(/-/g, ''), namn: r.namn, typ: r.typ, status: r.status, hub: r.hub, url: r.url, kalla: 'rader-fil' }));
  }
  const { allaKlaraRader } = await import('./notion-kalla.mjs');
  const { rader, fel } = await allaKlaraRader({ statusar: [KÖ_STATUS.toLowerCase()], typ: TYP_RE });
  for (const [h, f] of Object.entries(fel)) console.error(`  ⚠ ${h}: ${f}`);
  return rader.map(r => ({ id: String(r.id).replace(/-/g, ''), namn: r.namn, typ: r.typ, status: r.status, hub: r.hub, url: r.url, kalla: 'notion-rest' }));
}

async function main() {
  console.log(`=== /oversatt kön → ${M.namn} (${kod}) ${DRY ? '[DRY]' : ''} ${datum} ===`);
  const kö = await läsKö();
  console.log(`Kön: ${kö.length} rader i "${KÖ_STATUS}" (Typ ~ pending approval)`);
  if (!kö.length) {
    if (!DRY) skrivJobb([], {});
    return;
  }

  // 1. SE-kontot: alla annonsnamn en gång.
  console.log('Läser SE-kontot …');
  const seAnnonser = await alla(`act_${SE_ACT}/ads`, { fields: 'name,status,effective_status,campaign{id,name,status},adset{id,name}' }, 100);
  const seMap = new Map();
  for (const a of seAnnonser) {
    const nyckel = a.name.trim().toLowerCase();
    if (!seMap.has(nyckel)) seMap.set(nyckel, a);
  }
  console.log(`  ${seAnnonser.length} annonser i SE-kontot`);

  // 2. Målkontot: alla annonsnamn en gång (dubblettspärren).
  console.log(`Läser ${M.kontonamn} …`);
  const målAnnonser = await alla(`act_${M.act}/ads`, { fields: 'name,status,adset{id,name},campaign{id,name,status}' }, 100);
  const målNamn = new Set(målAnnonser.map(a => a.name.trim().toLowerCase()));
  console.log(`  ${målAnnonser.length} annonser i ${M.kontonamn}`);

  // 3. Butiken.
  console.log(`Läser ${M.butik}/products.json …`);
  const butik = await butikensProdukter();
  console.log(`  ${butik.size} produkter`);

  // 4. Rad för rad.
  const kampanjCache = new Map();
  const jobb = [];
  for (const rad of kö) {
    const namn = annonsdel(rad.namn);
    const j = { notion: rad, namn, status: 'HOPPA', skal: null };
    jobb.push(j);

    const se = seMap.get(namn.toLowerCase());
    if (!se) { j.skal = 'inte uppe i Sverige (annonsnamnet finns inte i SE-kontot)'; continue; }
    j.se = { annonsId: se.id, status: se.effective_status, kampanj: se.campaign?.name, kampanjId: se.campaign?.id, adset: se.adset?.name };

    const prefix = prefixAv(namn);
    if (!prefix) { j.skal = 'annonsnamnet saknar "_" — inget prefix att koppla på'; continue; }
    const { K, nr, rest } = delaNamn(namn);
    if (!K || !/^[A-Za-zÅÄÖåäö]{1,4}$/.test(K) || FÖRBJUDEN_K.test(K)) { j.skal = `kan inte läsa vinkeln ur "${namn}" (fält 2 = "${K}")`; continue; }
    j.prefix = prefix; j.K = K.toUpperCase(); j.nr = nr; j.hook = rest || null;
    j.typ = /video/i.test(rad.typ) ? 'video' : 'bild';

    const p = PRODUKTER[prefix.toLowerCase()];
    if (!p) { j.skal = `prefixet "${prefix}" saknar koppling i ${M.produkter} — lägg till raden (SE-kampanj: ${se.campaign?.name})`; continue; }
    j.produkt = p;

    if (!kampanjCache.has(p.campaign_id)) kampanjCache.set(p.campaign_id, await kampanjUtfall(p.campaign_id));
    const u = kampanjCache.get(p.campaign_id);
    j.mal = { kod, kampanjId: p.campaign_id, kampanjNamn: u.kampanj?.name ?? null, utfall: u.utfall, spend: u.spend ?? null,
              adsetNamn: `${p.adset_prefix} - ${j.K}`, annonsNamn: målnamn(p, j.K, nr, rest), link: p.link, prefix: p.no_prefix };
    if (u.utfall === 'SAKNAS') { j.skal = `kampanj ${p.campaign_id} finns inte i ${M.kontonamn} (${u.fel}) — bygg aldrig här, kör /translate-no eller rätta produkter.json`; continue; }
    if (u.kampanj.account_id !== M.act) { j.skal = `kampanj ${p.campaign_id} ligger på konto ${u.kampanj.account_id}, inte ${M.act} — fel konto, rättas i produkter.json`; continue; }
    if (u.utfall === 'AVVECKLAD') { j.skal = `"${u.kampanj.name}" är PAUSED med ${u.spend} kr spend — avvecklad, väntar`; continue; }

    if (målNamn.has(j.mal.annonsNamn.toLowerCase())) { j.status = 'KLAR'; j.skal = `finns redan i ${M.kontonamn}`; continue; }

    const handle = handleAv(p.link);
    const prod = handle ? butik.get(handle) : null;
    if (!prod) { j.skal = `produkten (${handle}) finns inte på ${M.butik}`; continue; }
    if (prod.tillganglig === false) { j.skal = `produkten "${prod.titel}" är slut i ${M.butik}`; continue; }
    j.pris = { pris: prod.pris, jamforpris: prod.jamforpris, titel: prod.titel, handle };

    j.status = 'KÖR';
    if (u.utfall === 'PAUSAD_TOM') j.anm = 'kampanjen är PAUSED utan spend — annonsen lämnas PAUSED';
  }

  // 5. Max per körning, äldst först (radordningen ur Notion = skapad-ordning i praktiken).
  let bilder = 0, videor = 0;
  for (const j of jobb) {
    if (j.status !== 'KÖR') continue;
    if (j.typ === 'bild') { if (++bilder > MAX_BILDER) { j.status = 'KÖ'; j.skal = `över max ${MAX_BILDER} bilder per körning`; } }
    else if (++videor > MAX_VIDEOR) { j.status = 'KÖ'; j.skal = `över max ${MAX_VIDEOR} videor per körning`; }
  }

  // 6. SE-creativen för raderna som ska köras: copy + media. Bilden hämtas via
  //    image_hash → adimages.url, videon via advideos source. Notion-bilagan är reserv.
  const körs = jobb.filter(j => j.status === 'KÖR');
  if (körs.length) console.log(`\nLäser SE-creativen för ${körs.length} annonser …`);
  const hashar = [];
  for (const j of körs) {
    try {
      const a = await api(j.se.annonsId, { params: { fields: 'creative{object_story_spec}' } });
      const oss = a.creative?.object_story_spec || {};
      const ld = oss.link_data, vd = oss.video_data;
      j.se.copy = {
        message: ld?.message ?? vd?.message ?? '',
        headline: ld?.name ?? vd?.title ?? '',
        description: ld?.description ?? vd?.link_description ?? '',
        link: ld?.link ?? vd?.call_to_action?.value?.link ?? null,
      };
      j.se.media = ld?.image_hash ? { typ: 'bild', image_hash: ld.image_hash }
                 : vd?.video_id ? { typ: 'video', video_id: vd.video_id } : null;
      if (!j.se.media) { j.status = 'HOPPA'; j.skal = 'SE-creativen har varken bild eller video'; continue; }
      if (j.se.media.typ !== j.typ) { j.typ = j.se.media.typ; }   // Notion-Typ och kontot oense: kontot vinner
      if (j.se.media.image_hash) hashar.push(j.se.media.image_hash);
    } catch (e) {
      j.status = 'HOPPA'; j.skal = `kunde inte läsa SE-creativen: ${e.message}`;
    }
  }
  if (hashar.length) {
    const urlAv = new Map();
    for (let i = 0; i < hashar.length; i += 20) {
      const r = await api(`act_${SE_ACT}/adimages`, { params: { hashes: hashar.slice(i, i + 20), fields: 'hash,url,width,height' } });
      for (const b of r.data || []) urlAv.set(b.hash, { url: b.url, bredd: b.width, hojd: b.height });
    }
    for (const j of körs) {
      if (j.se.media?.image_hash) {
        const b = urlAv.get(j.se.media.image_hash);
        if (b) Object.assign(j.se.media, b);
        else { j.status = 'HOPPA'; j.skal = 'bildens URL gick inte att läsa ur SE-kontot'; }
      }
    }
  }
  for (const j of körs) {
    if (j.se.media?.video_id && j.status === 'KÖR') {
      try {
        const v = await api(j.se.media.video_id, { params: { fields: 'source,length,title' } });
        Object.assign(j.se.media, { url: v.source ?? null, langd_s: v.length ?? null });
        if (!v.source) { j.status = 'HOPPA'; j.skal = 'videons källa gick inte att läsa ur SE-kontot'; }
      } catch (e) { j.status = 'HOPPA'; j.skal = `kunde inte läsa videon: ${e.message}`; }
    }
  }

  // 7. Kvoter — bara informativt här; videosteget stannar självt.
  const heygen = videor ? await heygenKvot() : null;
  const kie = await kieSaldo();

  // 8. Rapport.
  const räkna = (s) => jobb.filter(j => j.status === s).length;
  console.log('');
  for (const j of jobb) {
    const ikon = { KÖR: '▶', KLAR: '✓', HOPPA: '⏭', KÖ: '…' }[j.status];
    const mål = j.mal ? `${j.mal.kampanjNamn} / ${j.mal.adsetNamn} → ${j.mal.annonsNamn}` : '—';
    console.log(`${ikon} ${j.namn.padEnd(30)} ${(j.typ || '').padEnd(5)} ${mål}${j.pris ? `  ${j.pris.pris}${j.pris.jamforpris ? ` (${j.pris.jamforpris})` : ''} ${M.valuta}` : ''}${j.skal ? `  — ${j.skal}` : ''}${j.anm ? `  (${j.anm})` : ''}`);
  }
  console.log(`\nKör: ${räkna('KÖR')} · klara sedan tidigare: ${räkna('KLAR')} · hoppar: ${räkna('HOPPA')} · i kö: ${räkna('KÖ')}`);
  console.log(`HeyGen api-krediter: ${heygen ?? (videor ? 'okänt' : 'ej behövt')} · Kie-saldo: ${kie ?? 'okänt'}`);

  if (!DRY) skrivJobb(jobb, { heygen, kie });
}

function skrivJobb(jobb, kvot) {
  const mapp = resolve(ROT, M.batchmapp, datum);
  mkdirSync(mapp, { recursive: true });
  const fil = join(mapp, 'jobb.json');
  writeFileSync(fil, JSON.stringify({ marknad: kod, datum, skapad: new Date().toISOString(), kvot, jobb }, null, 2));
  console.log(`\nJobbfil: ${fil}`);
}

main().catch(e => dö(e.message));
