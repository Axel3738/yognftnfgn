#!/usr/bin/env node
// Matstrumpor Growth Guide i Notion — byggd som Evolves "3.0 Growth Guide"
// (kurslektionen ⭐️ The 3.0 Evolve Growth Guide, Google Sheet
// 1zdDeYK0gwjFWbp4nq5VVm1COXqL1v8TailKJNHZ_pDI, läst 2026-10-03).
//
// Axels dom 2026-10-03 på den första versionen (en platt databas med 36
// mätkolumner per annons, i bokstavsordning): "det ser inte alls ut som en
// Evolve Growth Guide". Evolves guide är en PLANERARE per koncept, inte en
// mätlista per annons. Dess flikar och kolumner härmas rakt av:
//
//   Overview        hit rate (breakthrough + spend winner ÷ alla etiketterade)
//   Ad Roadmap      EN RAD PER BATCH (koncept): STATUS · UPVOTE · BATCH # ·
//                   DATE ADDED · AUTHOR · AD CONCEPT · DESIRE/CORE AVATAR ·
//                   SUB AVATAR · ANGLE(S) · BREAKTHROUGH MEMO · AWARENESS LEVEL ·
//                   FILE TYPE · AD TYPE · LINK TO BRIEF · LINK TO AD · RESULTS ·
//                   LEARNINGS (+ våra mättal, kreatör, marknad, relationen ADS)
//   Log             en rad per dag med det rutinen gjorde + NOTES för människor
//   Desires/Core Avatar · Sub Avatars/Angles · Avatars · Awareness · Creators
//                   planeringsflikarna, sådda EN gång ur repots research
//                   (matstrumpor/growthguide/underlag.json), sedan människornas
//   Ad Results      mätlistan per annons (det gamla), skriven bara av koden
//
// Vem äger vad (regeln från 2026-10-02 står kvar): koden äger mätkolumnerna och
// skriver om dem varje rond; människorna äger UPVOTE, NOTES, LEARNINGS och
// planeringsflikarna. Kolumnerna DESIRE/CORE AVATAR, SUB AVATAR, ANGLE(S),
// BREAKTHROUGH MEMO, AWARENESS LEVEL och LEARNINGS SÅS en gång ur briefens
// VARIABELTAGGAR och lärdomsfilen, bara där cellen är tom — sedan rörs de aldrig.
// STATUS sätts av koden bara när den är tom eller när Working ska bli Learning;
// Done är människans sista ord. Notions API kan inte ordna kolumner i en vy —
// det gör Cowork-prompten matstrumpor/cowork/1-growth-guide-vyer.txt.
//
//   node matstrumpor/growthguide.mjs --kolla          # sidan, databaserna, token
//   node matstrumpor/growthguide.mjs --torr           # vad som skulle skrivas
//   node matstrumpor/growthguide.mjs --skarpt         # bygg det som saknas, skriv raderna
//   node matstrumpor/growthguide.mjs --skarpt --migrera   # + lägg den gamla platta databasen i papperskorgen
//   node matstrumpor/growthguide.mjs --skarpt --sa    # så planeringsflikarna ur underlag.json (bara nya rader)
//
// Ren logik (batcher, egenskaper, loggrader, hash, såddregeln) exporteras och
// testas i test/growthguide.test.mjs. All I/O ligger i main().

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { tolka } from './namn.mjs';
import { RANG, ETIKETT, hitRate } from './etikett.mjs';
import { hubbnamnUrKalla } from '../redigerarrapport/namn.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..');
const KONFIG_FIL = join(HAR, 'growthguide.json');
const UNDERLAG_FIL = join(HAR, 'growthguide', 'underlag.json');
const ARKIV_FIL = join(ROT, 'products', 'matstrumpor', 'arkiv.json');
const LOGG_FIL = join(HAR, 'logg.jsonl');
const LARDOMAR_FIL = join(ROT, 'products', 'matstrumpor', 'lardomar.md');
const NOTION = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';
const KONTO = '730973156224390';

// ---------------------------------------------------------------- ordlistor

/** Evolves fyra utfall + vårt femte (en annons Meta aldrig visade säger inget om idén). */
export const RESULTAT = Object.freeze({
  BREAKTHROUGH: '🏆 Breakthrough', SPEND_WINNER: '💸 Spend Winner', KPI_WINNER: '🎯 KPI Winner', LOSER: '❌ Loser', INGEN_LEVERANS: '⚪ No delivery',
});
export const AD_TYPE = Object.freeze({ IDEA: '💡 Ideation', ITER: '🔄 Iteration', IMIT: '🎭 Imitation' });
export const FILE_TYPE = Object.freeze({ video: '🎬 Video', static: '🖼️ Static' });
export const AWARENESS = Object.freeze(['Unaware', 'Problem Aware', 'Solution Aware', 'Product Aware', 'Most Aware']);
export const STATUS = Object.freeze(['Working', 'Learning', 'Filming', 'Done']);
const STATISKA_FORMAT = new Set(['static', 'textheavy', 'comparison', 'beforeafter', 'lifestyle']);

/** Slutmarkören på systemets sådd. Bruces SOP säger "write under any text already
 *  there", så det som står EFTER markören är människans och rörs aldrig
 *  (strategrapporten läser samma markör). Sådd utan markör är den gamla formen
 *  från 2026-10-03 och känns igen på att den saknar SOP:ens egna ord. */
export const SEED_SLUT = '(end of seed)';

/** Är cellen fortfarande systemets egen sådd, utan ett ord från en människa? Ren. */
export function arSystemetsSadd(nu) {
  const s = String(nu ?? '').trim();
  if (!s.startsWith('(seeded')) return false;
  if (s.includes(SEED_SLUT)) return s.endsWith(SEED_SLUT);
  return !/too little data|\bguess\s*:/i.test(s);
}

const sel = (namn, farg) => ({ name: namn, color: farg });
const resultatOptions = [sel(RESULTAT.BREAKTHROUGH, 'green'), sel(RESULTAT.SPEND_WINNER, 'blue'), sel(RESULTAT.KPI_WINNER, 'yellow'), sel(RESULTAT.LOSER, 'red'), sel(RESULTAT.INGEN_LEVERANS, 'gray')];

// ---------------------------------------------------------------- scheman

/** Ad Roadmap. system = koden skriver om varje rond · sadd = koden fyller EN gång
 *  där cellen är tom · manniska = rörs aldrig av koden. */
export const ROADMAP = Object.freeze({
  titel: 'AD CONCEPT',
  system: {
    'BATCH #': { rich_text: {} },
    'DATE ADDED': { date: {} },
    AUTHOR: { rich_text: {} },
    'FILE TYPE': { select: { options: [sel(FILE_TYPE.video, 'purple'), sel(FILE_TYPE.static, 'orange')] } },
    'AD TYPE': { select: { options: [sel(AD_TYPE.IDEA, 'yellow'), sel(AD_TYPE.ITER, 'blue'), sel(AD_TYPE.IMIT, 'pink')] } },
    'LINK TO BRIEF': { url: {} },
    'LINK TO AD': { url: {} },
    RESULTS: { select: { options: resultatOptions } },
    CREATOR: { select: {} },
    MARKET: { select: {} },
    'SPEND 14D KR': { number: { format: 'number' } },
    'PURCHASES 14D': { number: { format: 'number' } },
    'ROAS 14D': { number: { format: 'number' } },
    'HOOK RATE': { number: { format: 'percent' } },
    'HOLD RATE': { number: { format: 'percent' } },
    'PROFIT 14D KR': { number: { format: 'number' } },
    SYSTEM: { rich_text: {} },
  },
  sadd: {
    STATUS: { select: { options: [sel('Working', 'blue'), sel('Learning', 'yellow'), sel('Filming', 'purple'), sel('Done', 'green')] } },
    'DESIRE/CORE AVATAR': { rich_text: {} },
    'SUB AVATAR': { rich_text: {} },
    'ANGLE(S)': { rich_text: {} },
    'BREAKTHROUGH MEMO': { rich_text: {} },
    'AWARENESS LEVEL': { select: { options: AWARENESS.map((a) => sel(a, 'default')) } },
    LEARNINGS: { rich_text: {} },
  },
  manniska: {
    UPVOTE: { number: { format: 'number' } },
  },
});

/** Ad Results: mätlistan per annons. Allt skrivs av koden. */
export const RESULTS = Object.freeze({
  titel: 'AD',
  system: {
    RESULT: { select: { options: resultatOptions } },
    'LABEL HISTORY': { rich_text: {} },
    BATCH: { rich_text: {} },
    TYPE: { select: {} },
    ANGLE: { select: {} },
    FORMAT: { select: {} },
    CREATOR: { select: {} },
    MARKET: { select: {} },
    ADSET: { select: {} },
    'ADSET VERDICT': { select: {} },
    STATUS: { select: {} },
    START: { date: {} },
    MEASURED: { date: {} },
    'SPEND 14D KR': { number: { format: 'number' } },
    'PURCHASES 14D': { number: { format: 'number' } },
    'ROAS 14D': { number: { format: 'number' } },
    'CPA KR': { number: { format: 'number' } },
    'HOOK RATE': { number: { format: 'percent' } },
    'HOLD RATE': { number: { format: 'percent' } },
    'PROFIT 14D KR': { number: { format: 'number' } },
    'ADS MANAGER': { url: {} },
    'META ID': { rich_text: {} },
    SYSTEM: { rich_text: {} },
  },
});

/** Log: en rad per dag rutinen gjorde något. NOTES är människornas. */
export const LOG = Object.freeze({
  titel: 'DAY',
  system: { DATE: { date: {} }, SYSTEM: { rich_text: {} } },
  manniska: { NOTES: { rich_text: {} } },
});

/** Planeringsflikarna, Evolves kolumner. Sås en gång, sedan människornas. */
export const PLANERING = Object.freeze({
  desires: { rubrik: 'Desires / Core Avatar', titel: 'DESIRE ("I want…")', kolumner: { NOTE: { rich_text: {} }, SOURCE: { rich_text: {} } } },
  subavatars: { rubrik: 'Sub Avatars / Angles', titel: 'SUB AVATAR', kolumner: { 'PRODUCT NAME': { rich_text: {} }, 'FEATURE (what it is)': { rich_text: {} }, 'BENEFIT ("so you can…")': { rich_text: {} }, DESIRE: { rich_text: {} }, 'ANGLE(S)': { rich_text: {} }, SOURCE: { rich_text: {} } } },
  avatars: { rubrik: 'Avatars', titel: 'AVATAR', kolumner: { DESCRIPTION: { rich_text: {} }, SOURCE: { rich_text: {} } } },
  awareness: { rubrik: 'Awareness', titel: 'LEVEL', kolumner: { 'PRODUCT NAME': { rich_text: {} }, QUESTION: { rich_text: {} }, ANSWER: { rich_text: {} }, SOURCE: { rich_text: {} } } },
  creators: { rubrik: 'Creators', titel: 'CREATOR', kolumner: { ROLE: { rich_text: {} }, 'AUDIENCE SIZE': { rich_text: {} }, YOUTUBE: { url: {} }, TIKTOK: { url: {} }, INSTAGRAM: { url: {} }, 'HIGH PERFORMING CONTENT TRENDS': { rich_text: {} }, 'USER COMMENT NOTES': { rich_text: {} }, RESULT: { rich_text: {} }, SOURCE: { rich_text: {} } } },
});

// ---------------------------------------------------------------- små hjälpare

const txt = (s) => {
  const str = s == null ? '' : String(s);
  if (!str) return { rich_text: [] };
  const delar = [];
  for (let i = 0; i < Math.min(str.length, 3800); i += 1900) delar.push({ text: { content: str.slice(i, i + 1900) } });
  return { rich_text: delar };
};
const val = (s) => (s == null || s === '' ? { select: null } : { select: { name: String(s).replace(/,/g, ' ').slice(0, 90) } });
const num = (n) => ({ number: n == null || Number.isNaN(Number(n)) ? null : Number(n) });
const datum = (d) => ({ date: d ? { start: String(d).slice(0, 10) } : null });
const url = (u) => ({ url: u || null });
const r0 = (n) => (n == null ? null : Math.round(n));
const r3 = (n) => (n == null ? null : Math.round(n * 1000) / 1000);
const stor = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function hashAv(obj) { return createHash('sha1').update(JSON.stringify(obj)).digest('hex').slice(0, 10); }

/** Schwartz nivå ur briefens tagg (`awareness=problem`), eller null. Ren. */
export function awarenessAv(tagg) {
  const s = String(tagg ?? '').toLowerCase();
  if (!s) return null;
  if (s.includes('unaware') || s.includes('omedveten')) return 'Unaware';
  if (s.includes('problem')) return 'Problem Aware';
  if (s.includes('solution') || s.includes('lösning') || s.includes('losning')) return 'Solution Aware';
  if (s.includes('product') || s.includes('produkt')) return 'Product Aware';
  if (s.includes('most') || s.includes('mest')) return 'Most Aware';
  return null;
}

/** Lärdomstexten för ett L-id ur lardomar.md: raderna under rubriken till nästa
 *  rubrik. null när rubriken saknas. Ren (md in). */
export function lardomText(id, md) {
  if (!id || !md) return null;
  const rader = md.split('\n');
  const i = rader.findIndex((r) => /^#{2,3}\s+/.test(r) && r.includes(id));
  if (i < 0) return null;
  const ut = [];
  for (let j = i + 1; j < rader.length && !/^#{1,3}\s+/.test(rader[j]); j++) ut.push(rader[j]);
  const t = ut.join('\n').replace(/[*`]/g, '').replace(/\n{3,}/g, '\n\n').trim();
  return t ? t.slice(0, 1500) : null;
}

// ---------------------------------------------------------------- batcher

/** Batchnyckeln för en annons: Evolves "batch" = ett koncept med sina
 *  variationer. Hookvarianter (h1/h2/h3) och omklipp (v1/v2) av samma
 *  löpnummer hör ihop. Ett id utan löpnummer (haikuh2, s004h4, d3) är sin egen
 *  batch — "haikuh2" och "haikuh3" var olika koncept (lardomar.md), så de
 *  slås aldrig ihop på en gissning. Axels egna uppladdningar utan namnregel
 *  ("09-17 Nathalie captions musik") är sin egen batch. Ren. */
export function batchNyckel(namn) {
  const t = tolka(namn);
  if (!t) return { nyckel: namn, titel: namn, batchnr: null, land: null };
  const token = t.nummer != null ? String(t.nummer).padStart(3, '0') : t.id;
  const land = t.land ?? null;
  const bas = `sushi_${t.vinkel}_${t.format}_${token}`;
  return { nyckel: `${land ?? 'SE'}|${bas}`, titel: land ? `${land} ${bas}` : bas, batchnr: `#${token}`, land };
}

const basta = (etiketter) => etiketter.filter((e) => RANG[e] !== undefined).sort((a, b) => RANG[b] - RANG[a])[0] ?? null;
const forsta = (lista) => lista.find((x) => x != null && x !== '' && x !== 'okänd') ?? null;

const batchKod = (t) => (t && t.nummer != null ? `${t.land ?? 'SE'}|${t.vinkel}|${t.format}|${t.nummer}` : null);

/** Hubbraden för ett annonsnamn, i fyra steg: exakt namn → namnet utan `_v<n>` →
 *  uppladdarens källa (UPPLADDAD `kalla: 'Drive 022_H1.mov'` ⇒ hubbraden "022") →
 *  samma löpnummer, vinkel och format (3:2:2-namnet `…_048h1_v1` hör till
 *  hubbraden `…_048_v1`). Mätt 2026-10-03: exakt namn träffade 25 av 260
 *  arkivnamn, så Bruces batcher stod utan AUTHOR. Ren. */
export function hubbUppslag(hub = new Map(), uppladdade = []) {
  const perBatch = new Map();
  for (const [namn, post] of hub) {
    const k = batchKod(tolka(namn));
    if (k && !perBatch.has(k)) perBatch.set(k, post);
  }
  const perAnnons = new Map();
  for (const u of uppladdade ?? []) {
    const h = hubbnamnUrKalla(u?.kalla);
    if (h && u.annons && hub.has(h.namn)) perAnnons.set(u.annons, hub.get(h.namn));
  }
  return (namn) => {
    if (!namn) return null;
    if (hub.has(namn)) return hub.get(namn);
    const utanV = namn.replace(/_v\d+$/, '');
    if (hub.has(utanV)) return hub.get(utanV);
    if (perAnnons.has(namn)) return perAnnons.get(namn);
    const k = batchKod(tolka(namn));
    return (k && perBatch.get(k)) ?? null;
  };
}

/** Arkivets annonser → batcher (en per koncept). hub: Map annonsnamn → { ansvariga, url };
 *  uppladdade: loggens UPPLADDAD-rader (redigerarrapport/namn.mjs urLogg). Ren. */
export function batcher(arkiv, { hub = new Map(), lardomar = '', uppladdade = [] } = {}) {
  const slaUpp = hubbUppslag(hub, uppladdade);
  const grupper = new Map();
  for (const a of arkiv?.annonser ?? []) {
    if (!a?.namn) continue;
    const k = batchNyckel(a.namn);
    const g = grupper.get(k.nyckel) ?? { ...k, annonser: [] };
    g.annonser.push(a);
    grupper.set(k.nyckel, g);
  }
  const ut = [];
  for (const g of grupper.values()) {
    const ads = g.annonser.sort((a, b) => a.namn.localeCompare(b.namn));
    const m = ads.map((a) => a.senaste_matning).filter(Boolean);
    const spend = m.reduce((s, x) => s + (x.spend_sek ?? 0), 0);
    const vagt = (f) => { const rader = m.filter((x) => x[f] != null && x.spend_sek); const w = rader.reduce((s, x) => s + x.spend_sek, 0); return w ? rader.reduce((s, x) => s + x[f] * x.spend_sek, 0) / w : null; };
    const ids = ads.map((a) => a.id).filter(Boolean);
    const hubbrader = ads.map((a) => slaUpp(a.namn)).filter(Boolean);
    const forfattare = [...new Set(hubbrader.flatMap((h) => h.ansvariga ?? []))];
    const komp = {};
    for (const f of ['avatar', 'awareness', 'begar', 'mekanism', 'tro', 'urgency', 'hook_typ']) komp[f] = forsta(ads.map((a) => a.komponenter?.[f]));
    const brief = ads.find((a) => a.brief) ?? null;
    const etiketter = ads.map((a) => a.etikett).filter(Boolean);
    const lardomId = forsta(ads.map((a) => a.lardom));
    ut.push({
      nyckel: g.nyckel, titel: g.titel, batchnr: g.batchnr, land: g.land ?? 'SE',
      annonser: ads, ids,
      d0: ads.map((a) => a.d0).filter(Boolean).sort()[0] ?? null,
      forfattare,
      vinkel: forsta(ads.map((a) => a.vinkel)),
      format: forsta(ads.map((a) => a.format)),
      typ: forsta(ads.map((a) => a.typ)),
      kreator: forsta(ads.map((a) => a.kreator)),
      koncept: forsta(ads.map((a) => a.koncept)),
      kalla: forsta(ads.map((a) => a.kalla)),
      playbook: forsta(ads.map((a) => a.playbook)),
      foralder: forsta(ads.map((a) => a.foralder)),
      iteration: forsta(ads.map((a) => a.iteration)),
      komponenter: komp,
      brief_url: brief?.brief ?? hubbrader[0]?.url ?? null,
      etikett: basta(etiketter),
      spend_14d_sek: m.length ? r0(spend) : null,
      kop_14d: m.length ? m.reduce((s, x) => s + (x.kop ?? 0), 0) : null,
      roas_14d: m.length && spend ? r3(m.reduce((s, x) => s + (x.roas ?? 0) * (x.spend_sek ?? 0), 0) / spend) : null,
      hook_rate: r3(vagt('hook_rate')),
      hold_rate: r3(vagt('hold_rate')),
      vinstbidrag_14d_sek: ads.some((a) => a.vinstbidrag_14d_sek != null) ? r0(ads.reduce((s, a) => s + (a.vinstbidrag_14d_sek ?? 0), 0)) : null,
      lardom_id: lardomId,
      lardom_text: lardomText(lardomId, lardomar),
    });
  }
  return ut.sort((a, b) => (b.spend_14d_sek ?? 0) - (a.spend_14d_sek ?? 0) || a.titel.localeCompare(b.titel));
}

/** STATUS koden föreslår: Filming = ingen annons uppe än, Working = uppe utan
 *  utfall, Learning = utfall finns. Ren. */
export function statusFor(batch) {
  if (!batch.ids?.length) return 'Filming';
  return batch.etikett ? 'Learning' : 'Working';
}

/** Får koden skriva STATUS? Bara när cellen är tom, eller när Working ska bli
 *  Learning. Done och allt annat människan valt står kvar. Ren. */
export function statusAttSkriva(batch, befintlig) {
  const ny = statusFor(batch);
  if (!befintlig) return ny;
  if (befintlig === 'Working' && ny === 'Learning') return ny;
  return null;
}

/** BREAKTHROUGH MEMO sådd ur briefens fält (WHY/WHAT/HOW som Evolve). Ren. */
export function memoAv(b) {
  const delar = [];
  // WHY = briefens källa. Annonsens EGEN lärdom (lardom_id) hör till LEARNINGS, inte hit.
  if (b.kalla) delar.push(`WHY: source: ${b.kalla}.`);
  const what = [b.koncept ? `concept ${b.koncept}` : null, b.iteration ? `iteration ${b.iteration}${b.foralder ? ` on ${b.foralder}` : ''}` : null, b.komponenter?.mekanism ? `mechanism ${b.komponenter.mekanism}` : null, b.komponenter?.hook_typ ? `hook ${b.komponenter.hook_typ}` : null].filter(Boolean).join(', ');
  if (what) delar.push(`WHAT: ${what}.`);
  // Utan WHY eller WHAT finns ingen brief bakom — då sås ingen memo (bara "HOW: static" vore brus).
  if (!delar.length) return null;
  const how = [b.format ? b.format : null, b.playbook ? `playbook ${b.playbook}` : null, b.komponenter?.tro ? `belief ${b.komponenter.tro}` : null, b.komponenter?.urgency ? `urgency ${b.komponenter.urgency}` : null].filter(Boolean).join(', ');
  if (how) delar.push(`HOW: ${how}.`);
  return `(seeded from the brief) ${delar.join(' ')} ${SEED_SLUT}`;
}

/** En batch → Notion-egenskaper. system skrivs alltid, sadd bara där tomt. Ren. */
export function roadmapEgenskaper(b, { adsIds = [] } = {}) {
  const fileType = b.format ? (STATISKA_FORMAT.has(b.format) ? FILE_TYPE.static : FILE_TYPE.video) : null;
  const system = {
    'BATCH #': txt(b.batchnr),
    'DATE ADDED': datum(b.d0),
    AUTHOR: txt(b.forfattare?.join(', ')),
    // FILE TYPE och AD TYPE skrivs bara när de är kända — ett okänt värde får
    // aldrig tömma det en människa valt (89 av 106 SE-batcher saknar typ i briefen).
    ...(fileType ? { 'FILE TYPE': val(fileType) } : {}),
    ...(AD_TYPE[b.typ] ? { 'AD TYPE': val(AD_TYPE[b.typ]) } : {}),
    'LINK TO BRIEF': url(b.brief_url),
    'LINK TO AD': url(b.ids?.length ? `https://adsmanager.facebook.com/adsmanager/manage/ads?act=${KONTO}&selected_ad_ids=${b.ids.join(',')}` : null),
    RESULTS: val(RESULTAT[b.etikett] ?? null),
    CREATOR: val(stor(b.kreator)),
    MARKET: val(b.land),
    'SPEND 14D KR': num(b.spend_14d_sek),
    'PURCHASES 14D': num(b.kop_14d),
    'ROAS 14D': num(b.roas_14d),
    'HOOK RATE': num(b.hook_rate),
    'HOLD RATE': num(b.hold_rate),
    'PROFIT 14D KR': num(b.vinstbidrag_14d_sek),
    ADS: { relation: adsIds.slice(0, 100).map((id) => ({ id })) },
  };
  const angle = [b.vinkel, b.komponenter?.hook_typ ? `hook: ${b.komponenter.hook_typ}` : null].filter(Boolean).join(' · ');
  const sadd = {
    'DESIRE/CORE AVATAR': txt(b.komponenter?.begar),
    'SUB AVATAR': txt(b.komponenter?.avatar),
    'ANGLE(S)': txt(angle),
    'BREAKTHROUGH MEMO': txt(memoAv(b)),
    'AWARENESS LEVEL': val(awarenessAv(b.komponenter?.awareness)),
    LEARNINGS: txt(b.lardom_text ? `(seeded from lardomar.md, ${b.lardom_id}) ${b.lardom_text} ${SEED_SLUT}` : null),
  };
  return { titel: b.titel, system, sadd };
}

/** Textvärdet i en såddegenskap (rich_text eller select), '' när tom. Ren. */
export const saddVarde = (p) => (p?.rich_text ? p.rich_text.map((t) => t.text?.content ?? t.plain_text ?? '').join('') : p?.select?.name ?? '');

/** Såddregeln: en cell är systemets tills en människa rört den. Av `sadd`
 *  skrivs ett fält när det har ett värde OCH cellen i Notion är tom, eller
 *  fortfarande är systemets egen sådd (`arSystemetsSadd`: "(seeded …" utan ett
 *  ord från en människa efter slutmarkören) som nu ändrats. Har en människa
 *  skrivit under sådden rörs cellen aldrig, även om sådden skulle ha ändrats.
 *  `befintlig` = { kolumn: nuvarande text } (null = ny rad). Ren. */
export function saddAttSkriva(sadd, befintlig) {
  const ut = {};
  for (const [k, v] of Object.entries(sadd)) {
    const ny = saddVarde(v);
    const nu = befintlig ? (befintlig[k] ?? '') : '';
    // Ingen sådd längre (briefen gav inget) ⇒ systemets gamla sådd töms, människans text står kvar.
    if (!ny) { if (arSystemetsSadd(nu)) ut[k] = v; continue; }
    if (nu === '' || (arSystemetsSadd(nu) && nu !== ny)) ut[k] = v;
  }
  return ut;
}

/** En annons → Ad Results-egenskaper. Ren. */
export function resultatEgenskaper(a, batchTitel) {
  const m = a.senaste_matning || {};
  const hist = (a.etiketter || []).map((e) => `W${e.vecka ?? 1} ${e.etikett}`).join(' · ');
  return {
    titel: a.namn,
    system: {
      RESULT: val(RESULTAT[a.etikett] ?? null),
      'LABEL HISTORY': txt(hist),
      BATCH: txt(batchTitel),
      TYPE: val(a.typ && a.typ !== 'okänd' ? a.typ : null),
      ANGLE: val(a.vinkel),
      FORMAT: val(a.format),
      CREATOR: val(stor(a.kreator)),
      MARKET: val(a.marknad ?? 'SE'),
      ADSET: val(a.adset),
      'ADSET VERDICT': val(a.adset_dom),
      STATUS: val(a.status),
      START: datum(a.d0),
      MEASURED: datum(m.datum),
      'SPEND 14D KR': num(r0(m.spend_sek)),
      'PURCHASES 14D': num(m.kop),
      'ROAS 14D': num(m.roas),
      'CPA KR': num(r0(m.cpa_sek)),
      'HOOK RATE': num(m.hook_rate),
      'HOLD RATE': num(m.hold_rate),
      'PROFIT 14D KR': num(r0(a.vinstbidrag_14d_sek)),
      'ADS MANAGER': url(a.id ? `https://adsmanager.facebook.com/adsmanager/manage/ads?act=${KONTO}&selected_ad_ids=${a.id}` : null),
      'META ID': txt(a.id),
    },
  };
}

const VECKODAG = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Loggens rader → en Log-rad per dag med det rutinen gjorde. Ren. */
export function loggrader(logg) {
  const perDag = new Map();
  for (const r of logg ?? []) {
    if (!r?.datum || !r.kod) continue;
    const d = String(r.datum).slice(0, 10);
    const g = perDag.get(d) ?? { etiketter: {}, forslag: [], briefer: [], uppladdade: 0, adsetdom: [], beslut: [], rond: false, omdopta: 0 };
    if (r.kod === 'ETIKETT') g.etiketter[r.etikett] = (g.etiketter[r.etikett] ?? 0) + 1;
    else if (r.kod === 'FORSLAG') g.forslag.push(`${r.atgard} ${r.objekt}${r.orsak ? ` (${r.orsak})` : ''}`);
    else if (r.kod === 'BRIEF') g.briefer.push(r.annons);
    else if (r.kod === 'UPPLADDAD') g.uppladdade++;
    else if (r.kod === 'ADSET_DOM') g.adsetdom.push(`${r.adset ?? r.adset_id}: ${r.dom}`);
    else if (r.kod === 'BESLUT') g.beslut.push(r.beslut ?? r.text ?? JSON.stringify(r).slice(0, 80));
    else if (r.kod === 'ROND_KLAR') g.rond = true;
    else if (r.kod === 'OMDOPT') g.omdopta++;
    perDag.set(d, g);
  }
  return [...perDag.entries()].sort().map(([d, g]) => {
    const delar = [];
    const n = Object.values(g.etiketter).reduce((s, x) => s + x, 0);
    if (n) delar.push(`Labels: ${n} (${Object.entries(g.etiketter).map(([k, v]) => `${k} ${v}`).join(', ')})`);
    if (g.uppladdade) delar.push(`Uploaded: ${g.uppladdade}`);
    if (g.briefer.length) delar.push(`Briefs: ${g.briefer.join(', ')}`);
    if (g.adsetdom.length) delar.push(`Adset verdicts: ${g.adsetdom.join('; ')}`);
    if (g.forslag.length) delar.push(`Proposals to Axel: ${g.forslag.join('; ')}`);
    if (g.beslut.length) delar.push(`Decisions: ${g.beslut.join('; ')}`);
    if (g.omdopta) delar.push(`Renamed: ${g.omdopta}`);
    if (g.rond) delar.push('Round completed');
    const dag = new Date(`${d}T12:00:00Z`);
    return { titel: `${d} ${VECKODAG[dag.getUTCDay()]}`, datum: d, system: delar.join(' · ').slice(0, 1900) };
  });
}

/** Overview-texten (Evolves hit rate + våra räknade utfall). Ren. */
export function overviewText(arkiv, batchar, idag) {
  const h = hitRate((arkiv?.annonser ?? []).filter((a) => a.etikett).map((a) => ({ etikett: a.etikett })));
  const antal = {};
  for (const a of arkiv?.annonser ?? []) if (a.etikett) antal[a.etikett] = (antal[a.etikett] ?? 0) + 1;
  const rad = Object.keys(RESULTAT).map((k) => `${RESULTAT[k]} ${antal[k] ?? 0}`).join('   ');
  const bt = batchar.filter((b) => b.etikett === ETIKETT.BREAKTHROUGH).map((b) => b.titel);
  return [
    `AD HIT RATE: ${h.traff} of ${h.alla} labelled ads (${h.alla ? Math.round((h.traff / h.alla) * 100) : 0} %) · ${h.traff} of ${h.levererade} that got delivery (${h.levererade ? Math.round((h.traff / h.levererade) * 100) : 0} %). Hit = Breakthrough or Spend Winner, as in Evolve.`,
    rad,
    `Batches: ${batchar.length} · Ads: ${arkiv?.annonser?.length ?? 0} · Breakthroughs: ${bt.length ? bt.join(', ') : 'none yet'}.`,
    `Updated ${idag} by /matstrumporkungen. Numbers are the last 14 days from Meta (click attribution).`,
  ].join('\n');
}

export const SA_LASER_DU = [
  'How this guide works (Evolve Growth Guide 3.0, mirrored): every concept is ONE row in Ad Roadmap, before it is briefed. Write the BREAKTHROUGH MEMO as WHY we make it, WHAT it is about, HOW we make it, plus desire, sub avatar, angle, awareness level and ad type.',
  'The system (/matstrumporkungen) fills BATCH #, DATE ADDED, AUTHOR, FILE TYPE, AD TYPE, links, RESULTS and the numbers every round, and seeds the planning cells once from the brief. It never overwrites what a person wrote.',
  'You own STATUS (Working → Learning → Done), UPVOTE and LEARNINGS. A row is Done when LEARNINGS is written. Log: the system writes what it did each day, you write NOTES. The planning tabs below are yours after the first seed.',
].join('\n');

// ---------------------------------------------------------------- Notion I/O

function lasKonfig() { return existsSync(KONFIG_FIL) ? JSON.parse(readFileSync(KONFIG_FIL, 'utf8')) : {}; }
function skrivKonfig(k) { writeFileSync(KONFIG_FIL, JSON.stringify(k, null, 2) + '\n'); }
const sov = (ms) => new Promise((k) => setTimeout(k, ms));

async function notion(path, { method = 'GET', body } = {}) {
  const tok = process.env.NOTION_TOKEN;
  if (!tok) throw new Error('NOTION_TOKEN saknas i miljön');
  for (let forsok = 0; forsok < 6; forsok++) {
    const r = await fetch(`${NOTION}${path}`, { method, headers: { Authorization: `Bearer ${tok}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 429 || r.status >= 500) { await sov(1500 * (forsok + 1)); continue; }
    const j = await r.json();
    if (!r.ok) throw new Error(`Notion ${r.status} ${method} ${path}: ${j.message || JSON.stringify(j).slice(0, 300)}`);
    return j;
  }
  throw new Error(`Notion svarade inte på sex försök: ${path}`);
}

const plain = (p) => (p?.rich_text ?? p?.title ?? []).map((t) => t.plain_text).join('');
const rt = (s) => txt(s).rich_text;

async function fraga(dbId) {
  const ut = [];
  let cursor;
  do {
    const q = await notion(`/databases/${dbId}/query`, { method: 'POST', body: { page_size: 100, start_cursor: cursor } });
    ut.push(...(q.results ?? []));
    cursor = q.has_more ? q.next_cursor : undefined;
  } while (cursor);
  return ut;
}

/** Hubben: annonsnamn → { ansvariga, url }. Läs-bart. */
async function lasHub(hubId) {
  const karta = new Map();
  if (!hubId) return karta;
  try {
    for (const p of await fraga(hubId)) {
      const namn = plain(Object.values(p.properties).find((x) => x.type === 'title'));
      if (!namn) continue;
      karta.set(namn, { ansvariga: (p.properties.Ansvarig?.people ?? []).map((x) => x.name).filter(Boolean), url: p.url });
    }
  } catch (e) { console.log(`  (hubben gick inte att läsa: ${e.message.slice(0, 120)})`); }
  return karta;
}

/** Befintliga rader i en databas: titel → { id, hash, tomma, status }. */
async function lasBefintliga(dbId, titelProp, saddProps = []) {
  const karta = new Map();
  for (const p of await fraga(dbId)) {
    const titel = plain(p.properties?.[titelProp]);
    if (!titel) continue;
    const system = plain(p.properties?.SYSTEM);
    const sadd = Object.fromEntries(saddProps.map((k) => { const v = p.properties?.[k]; return [k, !v ? '' : v.type === 'rich_text' ? plain(v) : v.type === 'select' ? (v.select?.name ?? '') : '']; }));
    karta.set(titel, { id: p.id, hash: (system.match(/hash:([0-9a-f]+)/) ?? [])[1] ?? null, toggle: (system.match(/toggle:([0-9a-f-]{32,36})/) ?? [])[1] ?? null, sadd, status: p.properties?.STATUS?.select?.name ?? null });
  }
  return karta;
}

async function skapaDatabas(sidaId, titel, beskrivning, titelProp, kolumner) {
  const db = await notion('/databases', { method: 'POST', body: {
    parent: { type: 'page_id', page_id: sidaId }, is_inline: true,
    title: [{ text: { content: titel } }],
    description: beskrivning ? [{ text: { content: beskrivning } }] : [],
    properties: { [titelProp]: { title: {} }, ...kolumner },
  } });
  return db.id;
}

async function rubrik(sidaId, text) {
  const r = await notion(`/blocks/${sidaId}/children`, { method: 'PATCH', body: { children: [{ type: 'heading_2', heading_2: { rich_text: rt(text) } }] } });
  return r.results?.[0]?.id;
}

async function callout(sidaId, text, emoji) {
  const r = await notion(`/blocks/${sidaId}/children`, { method: 'PATCH', body: { children: [{ type: 'callout', callout: { rich_text: rt(text), icon: { type: 'emoji', emoji } } }] } });
  return r.results?.[0]?.id;
}

/** Bygger det som saknas på sidan, i Evolves ordning, och sparar id:na. */
async function sakerstallSida(konfig, { skarpt }) {
  const k = { ...konfig, databaser: { ...(konfig.databaser ?? {}) }, block: { ...(konfig.block ?? {}) } };
  const sida = k.sida_id;
  if (!sida) throw new Error('sida_id saknas i growthguide.json — Axel skapar sidan "Matstrumpor Growth Guide" och bjuder in integrationen');
  const steg = [];
  if (!k.block.overview) steg.push('Overview (rubrik + två rutor)');
  if (!k.databaser.roadmap) steg.push('Ad Roadmap');
  if (!k.databaser.log) steg.push('Log');
  for (const [n, p] of Object.entries(PLANERING)) if (!k.databaser[n]) steg.push(p.rubrik);
  if (!k.databaser.results) steg.push('Ad Results');
  if (!steg.length) return k;
  if (!skarpt) { console.log(`TORRT: skulle bygga på sidan: ${steg.join(' · ')}`); return k; }
  if (!k.block.overview) {
    await rubrik(sida, 'Overview');
    k.block.lasa = await callout(sida, SA_LASER_DU, '📖');
    k.block.overview = await callout(sida, 'AD HIT RATE: not computed yet.', '📊');
  }
  // Evolves ordning på sidan: Roadmap före Log och planeringsflikarna, mätlistan
  // sist. Blocken kan inte flyttas via API:t, så ordningen är skapandeordningen.
  if (!k.databaser.roadmap) {
    await rubrik(sida, 'Ad Roadmap');
    k.databaser.roadmap = await skapaDatabas(sida, 'Ad Roadmap', 'One row per batch (concept). Write WHY / WHAT / HOW in BREAKTHROUGH MEMO before the brief. The system fills RESULTS and the numbers. You own STATUS, UPVOTE and LEARNINGS.', ROADMAP.titel, { ...ROADMAP.system, ...ROADMAP.sadd, ...ROADMAP.manniska });
  }
  if (!k.databaser.log) {
    await rubrik(sida, 'Log');
    k.databaser.log = await skapaDatabas(sida, 'Log', 'Meta ads log. The system writes what it did each day in SYSTEM; write your own notes and the weekly recap in NOTES.', LOG.titel, { ...LOG.system, ...LOG.manniska });
  }
  for (const [n, p] of Object.entries(PLANERING)) {
    if (k.databaser[n]) continue;
    await rubrik(sida, p.rubrik);
    k.databaser[n] = await skapaDatabas(sida, p.rubrik, 'Seeded once from the research in the repo (SOURCE says where). After that this table is yours.', p.titel, p.kolumner);
  }
  if (!k.databaser.results) {
    await rubrik(sida, 'Ad Results (per ad, written by the system)');
    k.databaser.results = await skapaDatabas(sida, 'Ad Results', 'One row per ad, written by /matstrumporkungen every round. Read only: comment on a row if something looks wrong.', RESULTS.titel, RESULTS.system);
  }
  // Relationen ADS (Roadmap → Ad Results) läggs på efteråt, så Roadmap kan skapas före mätlistan.
  if (k.ads_relation !== k.databaser.results) {
    const rel = { ADS: { relation: { database_id: k.databaser.results, single_property: {} } } };
    try { await notion(`/databases/${k.databaser.roadmap}`, { method: 'PATCH', body: { properties: rel } }); }
    catch { await notion(`/databases/${k.databaser.roadmap}`, { method: 'PATCH', body: { properties: { ADS: null } } }); await notion(`/databases/${k.databaser.roadmap}`, { method: 'PATCH', body: { properties: rel } }); }
    k.ads_relation = k.databaser.results;
  }
  skrivKonfig(k);
  console.log(`Byggt på sidan: ${steg.join(' · ')}`);
  return k;
}

/** Skriver/uppdaterar rader i en databas med hash-spärr. rader: [{ titel, system, sadd? }]. */
async function skrivRader(dbId, titelProp, rader, befintliga, { skarpt, statusFor: statusFn = null } = {}) {
  const plan = { nya: [], andrade: [], oandrade: 0, idn: new Map() };
  const idag = new Date().toISOString().slice(0, 10);
  for (const r of rader) {
    const bef = befintliga.get(r.titel);
    const sadd = saddAttSkriva(r.sadd ?? {}, bef ? bef.sadd : null);
    const status = statusFn ? statusFn(r, bef) : null;
    const hash = hashAv(r.system);
    if (bef) plan.idn.set(r.titel, bef.id);
    if (bef && bef.hash === hash && !Object.keys(sadd).length && !status) { plan.oandrade++; continue; }
    (bef ? plan.andrade : plan.nya).push(r.titel);
    if (!skarpt) continue;
    const props = { ...r.system, ...sadd, SYSTEM: txt(`${idag} · hash:${hash}${bef?.toggle ? ` · toggle:${bef.toggle}` : ''}`) };
    if (status) props.STATUS = val(status);
    await sov(340);
    if (bef) await notion(`/pages/${bef.id}`, { method: 'PATCH', body: { properties: props } });
    else {
      const p = await notion('/pages', { method: 'POST', body: { parent: { database_id: dbId }, properties: { [titelProp]: { title: [{ text: { content: r.titel.slice(0, 200) } }] }, ...props } } });
      plan.idn.set(r.titel, p.id);
      befintliga.set(r.titel, { id: p.id, hash: null, toggle: null, sadd: {}, status: null });
    }
  }
  return plan;
}

/** Roadmap-radens kropp: en hopfällbar ruta "System data" med annonstabellen —
 *  bara den rutan skrivs om, så Bruces egna block på sidan står kvar. */
async function skrivKropp(pageId, befintlig, batch) {
  const rader = batch.annonser.map((a) => { const m = a.senaste_matning || {}; return [a.namn, RESULTAT[a.etikett] ?? '', (a.etiketter || []).map((e) => `W${e.vecka ?? 1} ${e.etikett}`).join(' · '), String(r0(m.spend_sek) ?? ''), String(m.kop ?? ''), String(m.roas ?? ''), m.hook_rate != null ? `${Math.round(m.hook_rate * 100)} %` : '', m.hold_rate != null ? `${Math.round(m.hold_rate * 100)} %` : '', String(r0(a.vinstbidrag_14d_sek) ?? '')]; });
  const cell = (s) => [{ type: 'text', text: { content: String(s).slice(0, 1900) } }];
  const tabell = { type: 'table', table: { table_width: 9, has_column_header: true, children: [
    { type: 'table_row', table_row: { cells: ['AD', 'RESULT', 'LABELS', 'SPEND 14D', 'PURCHASES', 'ROAS', 'HOOK', 'HOLD', 'PROFIT'].map(cell) } },
    ...rader.slice(0, 90).map((r) => ({ type: 'table_row', table_row: { cells: r.map(cell) } })),
  ] } };
  const fakta = [batch.brief_url ? `Brief: ${batch.brief_url}` : null, batch.foralder ? `Parent: ${batch.foralder}` : null, batch.lardom_id ? `System learning: ${batch.lardom_id}` : null].filter(Boolean).join(' · ');
  const barn = [{ type: 'paragraph', paragraph: { rich_text: rt(fakta || 'No brief or parent recorded.') } }, tabell];
  let toggleId = befintlig?.toggle ?? null;
  if (toggleId) {
    try {
      const gamla = await notion(`/blocks/${toggleId}/children?page_size=100`);
      for (const b of gamla.results ?? []) { await sov(120); await notion(`/blocks/${b.id}`, { method: 'DELETE' }); }
      await sov(200);
      await notion(`/blocks/${toggleId}/children`, { method: 'PATCH', body: { children: barn } });
      return toggleId;
    } catch { toggleId = null; }
  }
  await sov(200);
  const r = await notion(`/blocks/${pageId}/children`, { method: 'PATCH', body: { children: [{ type: 'toggle', toggle: { rich_text: rt('📊 System data (rewritten every round, do not edit here)'), children: barn } }] } });
  return r.results?.[0]?.id ?? null;
}

/** Planeringsflikarna ur underlag.json: bara rader vars titel saknas. */
async function saPlanering(konfig, { skarpt }) {
  if (!existsSync(UNDERLAG_FIL)) { console.log(`Underlaget saknas (${UNDERLAG_FIL}) — planeringsflikarna lämnas tomma.`); return; }
  const u = JSON.parse(readFileSync(UNDERLAG_FIL, 'utf8'));
  const mall = {
    desires: (r) => ({ titel: r.desire, system: { NOTE: txt(r.note), SOURCE: txt(r.source) } }),
    subavatars: (r) => ({ titel: r.sub_avatar, system: { 'PRODUCT NAME': txt(r.product), 'FEATURE (what it is)': txt(r.feature), 'BENEFIT ("so you can…")': txt(r.benefit), DESIRE: txt(r.desire), 'ANGLE(S)': txt(r.angles), SOURCE: txt(r.source) } }),
    avatars: (r) => ({ titel: r.avatar, system: { DESCRIPTION: txt(r.description), SOURCE: txt(r.source) } }),
    awareness: (r) => ({ titel: r.level, system: { 'PRODUCT NAME': txt(r.product ?? 'Sushi socks'), QUESTION: txt(r.question), ANSWER: txt(r.answer), SOURCE: txt(r.source) } }),
    creators: (r) => ({ titel: r.creator, system: { ROLE: txt(r.role), 'HIGH PERFORMING CONTENT TRENDS': txt(r.what), RESULT: txt(r.result), SOURCE: txt(r.source) } }),
  };
  for (const [n, bygg] of Object.entries(mall)) {
    const dbId = konfig.databaser?.[n];
    const rader = (u[n] ?? (n === 'subavatars' ? u.sub_avatars_angles : null) ?? []).map(bygg).filter((r) => r.titel);
    if (!dbId || !rader.length) { console.log(`  ${PLANERING[n].rubrik}: ${!dbId ? 'ingen databas' : 'inget underlag'}`); continue; }
    const bef = new Set((await fraga(dbId)).map((p) => plain(p.properties?.[PLANERING[n].titel])));
    const nya = rader.filter((r) => !bef.has(r.titel.slice(0, 200)));
    console.log(`  ${PLANERING[n].rubrik}: ${nya.length} nya rader (${bef.size} fanns)`);
    if (!skarpt) continue;
    for (const r of nya) { await sov(340); await notion('/pages', { method: 'POST', body: { parent: { database_id: dbId }, properties: { [PLANERING[n].titel]: { title: [{ text: { content: r.titel.slice(0, 200) } }] }, ...r.system } } }); }
  }
}

async function main() {
  const arg = new Set(process.argv.slice(2));
  const skarpt = arg.has('--skarpt');
  let konfig = lasKonfig();
  if (arg.has('--kolla')) {
    console.log(`Sidan: ${konfig.sida_id ?? 'saknas'} · databaser: ${JSON.stringify(konfig.databaser ?? {})} · gammal databas: ${konfig.gammal_database_id ?? '-'}`);
    console.log(`Token: ${process.env.NOTION_TOKEN ? 'finns' : 'SAKNAS'} · arkiv: ${existsSync(ARKIV_FIL) ? 'finns' : 'saknas (kör kor.mjs --arkiv)'} · underlag: ${existsSync(UNDERLAG_FIL) ? 'finns' : 'saknas'}`);
    if (konfig.sida_id && process.env.NOTION_TOKEN) { const k = await notion(`/blocks/${konfig.sida_id}/children?page_size=50`); for (const b of k.results ?? []) console.log(`  block ${b.type} ${b.id} ${b.child_database?.title ?? plain(b[b.type]) ?? ''}`.slice(0, 140)); }
    return;
  }
  if (!existsSync(ARKIV_FIL)) { console.log(`Arkivet saknas (${ARKIV_FIL}). Kör först: node matstrumpor/kor.mjs --arkiv`); process.exit(2); }
  const arkiv = JSON.parse(readFileSync(ARKIV_FIL, 'utf8'));
  const logg = existsSync(LOGG_FIL) ? readFileSync(LOGG_FIL, 'utf8').split('\n').filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean) : [];
  const lardomar = existsSync(LARDOMAR_FIL) ? readFileSync(LARDOMAR_FIL, 'utf8') : '';
  const hubId = (() => { try { return JSON.parse(readFileSync(join(HAR, 'konfig.json'), 'utf8')).notion?.hub_id ?? null; } catch { return null; } })();
  const idag = new Date().toISOString().slice(0, 10);

  // --ordna (engång): Ad Results hamnade FÖRE Ad Roadmap i första bygget 2026-10-03
  // (relationen krävde att mätlistan fanns först). Blocken kan inte flyttas, så
  // mätlistan läggs i papperskorgen och byggs om sist på sidan; raderna skrivs om.
  if (arg.has('--ordna') && konfig.databaser?.results) {
    if (!skarpt) console.log(`TORRT: skulle flytta Ad Results (${konfig.databaser.results}) sist på sidan.`);
    else {
      const barn = await notion(`/blocks/${konfig.sida_id}/children?page_size=100`);
      for (const b of barn.results ?? []) {
        const ar = (b.type === 'child_database' && b.id.replace(/-/g, '') === konfig.databaser.results.replace(/-/g, '')) || (b.type === 'heading_2' && plain(b.heading_2).startsWith('Ad Results'));
        if (ar) { await sov(200); await notion(`/blocks/${b.id}`, { method: 'DELETE' }); }
      }
      konfig = { ...konfig, databaser: { ...konfig.databaser, results: null }, ads_relation: null, flyttad_results: idag };
      skrivKonfig(konfig);
      console.log('Ad Results borttagen från sidan — byggs om sist.');
    }
  }
  konfig = await sakerstallSida(konfig, { skarpt });
  const db = konfig.databaser ?? {};
  if (!db.roadmap || !db.results || !db.log) { console.log('Sidan är inte byggd än (torrt). Kör --skarpt.'); return; }

  const hub = await lasHub(hubId);
  const uppladdade = logg.filter((r) => r.kod === 'UPPLADDAD' && r.annons).map((r) => ({ annons: r.annons, kalla: r.kalla ?? null }));
  const batchar = batcher(arkiv, { hub, lardomar, uppladdade });
  const batchAv = new Map(); for (const b of batchar) for (const a of b.annonser) batchAv.set(a.namn, b.titel);
  console.log(`Arkivet: ${arkiv.annonser.length} annonser → ${batchar.length} batcher · hubben: ${hub.size} rader · loggen: ${logg.length} rader`);

  // 1. Ad Results (per annons) — först, så relationen från Roadmap kan peka på raderna.
  const resRader = arkiv.annonser.filter((a) => a.namn).map((a) => resultatEgenskaper(a, batchAv.get(a.namn)));
  const resBef = await lasBefintliga(db.results, RESULTS.titel);
  const resPlan = await skrivRader(db.results, RESULTS.titel, resRader, resBef, { skarpt });
  console.log(`Ad Results: nya ${resPlan.nya.length}, ändrade ${resPlan.andrade.length}, oförändrade ${resPlan.oandrade}`);

  // 2. Ad Roadmap (per batch) + kroppen med annonstabellen.
  const roadRader = batchar.map((b) => roadmapEgenskaper(b, { adsIds: b.annonser.map((a) => resPlan.idn.get(a.namn)).filter(Boolean) }));
  const roadBef = await lasBefintliga(db.roadmap, ROADMAP.titel, Object.keys(ROADMAP.sadd));
  const roadPlan = await skrivRader(db.roadmap, ROADMAP.titel, roadRader, roadBef, { skarpt, statusFor: (r, bef) => statusAttSkriva(batchar.find((b) => b.titel === r.titel), bef?.status) });
  console.log(`Ad Roadmap: nya ${roadPlan.nya.length}, ändrade ${roadPlan.andrade.length}, oförändrade ${roadPlan.oandrade}`);
  if (skarpt) {
    for (const titel of [...roadPlan.nya, ...roadPlan.andrade]) {
      const b = batchar.find((x) => x.titel === titel); const bef = roadBef.get(titel);
      if (!b || !bef) continue;
      const toggle = await skrivKropp(bef.id, bef, b);
      if (toggle && toggle !== bef.toggle) { await sov(200); await notion(`/pages/${bef.id}`, { method: 'PATCH', body: { properties: { SYSTEM: txt(`${idag} · hash:${hashAv(roadRader.find((r) => r.titel === titel).system)} · toggle:${toggle}`) } } }); }
    }
  }

  // 3. Log.
  const logRader = loggrader(logg).map((r) => ({ titel: r.titel, system: { DATE: datum(r.datum), SYSTEM: txt(r.system) } }));
  const logBef = await lasBefintliga(db.log, LOG.titel);
  const logPlan = await skrivRader(db.log, LOG.titel, logRader.map((r) => ({ ...r, system: { ...r.system }, hashbas: r.system })), logBef, { skarpt });
  console.log(`Log: nya ${logPlan.nya.length}, ändrade ${logPlan.andrade.length}, oförändrade ${logPlan.oandrade}`);

  // 4. Overview.
  const text = overviewText(arkiv, batchar, idag);
  if (skarpt && konfig.block?.overview) await notion(`/blocks/${konfig.block.overview}`, { method: 'PATCH', body: { callout: { rich_text: rt(text) } } });
  console.log(`Overview: ${text.split('\n')[0]}`);

  // 5. Planeringsflikarna (bara på --sa, eller första gången de byggts).
  if (arg.has('--sa')) await saPlanering(konfig, { skarpt });

  // 6. Den gamla platta databasen → papperskorgen (en gång, på --migrera).
  if (arg.has('--migrera') && konfig.gammal_database_id && !konfig.gammal_arkiverad) {
    if (skarpt) { await notion(`/blocks/${konfig.gammal_database_id}`, { method: 'DELETE' }); skrivKonfig({ ...konfig, gammal_arkiverad: idag }); console.log(`Gamla databasen ${konfig.gammal_database_id} ligger i papperskorgen (går att återställa i Notion i 30 dagar).`); }
    else console.log(`TORRT: skulle lägga den gamla databasen ${konfig.gammal_database_id} i papperskorgen.`);
  }

  // Tillbakaläsning.
  if (skarpt) {
    const efter = await lasBefintliga(db.roadmap, ROADMAP.titel);
    const efterRes = await lasBefintliga(db.results, RESULTS.titel);
    console.log(`Tillbakaläst: Ad Roadmap ${efter.size} rader (batcher ${batchar.length}) · Ad Results ${efterRes.size} rader (arkivet ${arkiv.annonser.length})`);
    if (efter.size < batchar.length || efterRes.size < arkiv.annonser.length) process.exit(1);
  }
  console.log(`Länk: https://www.notion.so/${String(konfig.sida_id).replace(/-/g, '')}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
