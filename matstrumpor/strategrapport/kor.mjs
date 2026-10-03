#!/usr/bin/env node
// kor.mjs — strategrapporten: veckorutinen som läser Growth Guide i Notion,
// mäter Bruces vecka (gjorde han måndagskollen, vad gjorde hans koncept) och
// skriver feedbacken till honom som EN Log-rad + EN kommentar med
// @-omnämnande på den raden. Axel pingas i samma rad bara när något bara han
// kan påverka (matt.mjs eskalering).
//
//   node matstrumpor/strategrapport/kor.mjs                torrt: texterna i output/<vecka>/, inget i Notion
//   node matstrumpor/strategrapport/kor.mjs --skarpt       rutinen: Log-rad + kommentar + minnet i data/
//   node matstrumpor/strategrapport/kor.mjs --kolla        token, id:n, antal rader
//   --idag 2026-10-06     räkna som om det vore den dagen
//   --cache               Notion-raderna ur output/notion.json (nätet borta)
//   --utan-arkiv          bygg inte om products/matstrumpor/arkiv.json först
//   --igen                skriv även om veckan redan står i historiken
//
// Kedjan: kor.mjs --arkiv (arkivet ur loggen, offline) → notion.mjs (Ad Roadmap +
// hubben, kompakta rader) → growthguide.mjs batcher → matt.mjs matVecka →
// text.mjs → Notion (Log-rad, kommentar) → data/snapshot.json + data/historik.jsonl.
//
// Skriver aldrig i Ad Roadmap, Ad Results eller hubben. Raderar aldrig.
// Omkörning är säker: Log-raden återanvänds på titeln och kommentaren hoppas
// när den redan finns — faller Notion mellan raden och kommentaren skrivs
// inget minne, och nästa körning tar vid utan dubbletter.

import { readFileSync, writeFileSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { batcher } from '../growthguide.mjs';
import { lasRoadmap, lasHub, skrivLoggrad, kommentera, lasNotes, harKommentar, notion } from './notion.mjs';
import { matVecka, eskalering, valjAction, perVecka } from './matt.mjs';
import { feedbackText, loggradText, rapportAxel, eskaleringText } from './text.mjs';
import { plusDagar, veckaFor } from '../../redigerarrapport/kallor.mjs';
import { urLogg } from '../../redigerarrapport/namn.mjs';
import { serUtSomSvenska } from '../../tools/lib/engelska.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
export const ROT = join(HAR, '..', '..');
export const KONFIGFIL = join(HAR, 'konfig.json');
export const ACTIONFIL = join(HAR, 'actions.json');
export const DATAMAPP = join(HAR, 'data');
export const UTMAPP = join(HAR, 'output');
const SNAPSHOT = join(DATAMAPP, 'snapshot.json');
const HISTORIK = join(DATAMAPP, 'historik.jsonl');
const GROWTHGUIDE = join(HAR, '..', 'growthguide.json');
const MS_KONFIG = join(HAR, '..', 'konfig.json');
const LOGG = join(HAR, '..', 'logg.jsonl');
const ARKIV = join(ROT, 'products', 'matstrumpor', 'arkiv.json');
const LARDOMAR = join(ROT, 'products', 'matstrumpor', 'lardomar.md');
export const FONSTER_MAX_DAGAR = 28;

const lasJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const lasJsonl = (p) => (existsSync(p) ? readFileSync(p, 'utf8').split('\n').filter(Boolean).map((r) => JSON.parse(r)) : []);

export function idagSE(nu = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(nu);
}

/** Veckan som rapporten gäller: ISO-veckan som gårdagen låg i (tisdag ⇒ måndagens vecka). Ren. */
export function rapportVecka(idag) { return veckaFor(plusDagar(idag, -1)); }

/** Etikettfönstret: från dagen efter förra körningens fönster (så en missad
 *  tisdag inte tappar en vecka), annars de sju dygnen före i dag; aldrig längre
 *  bakåt än FONSTER_MAX_DAGAR, och alltid till i går. Ren. */
export function fonsterFor(idag, forraTill = null) {
  const till = plusDagar(idag, -1);
  const tidigast = plusDagar(idag, -FONSTER_MAX_DAGAR);
  let fran = forraTill ? plusDagar(forraTill, 1) : plusDagar(idag, -7);
  if (fran < tidigast) fran = tidigast;
  if (fran > till) fran = till;
  return { fran, till };
}

/** Snapshotens rad: det som behövs för diffen nästa vecka. LEARNINGS hel, för
 *  människans del står efter systemets sådd. Ren. */
export function snapshotRad(r) {
  return { id: r.id, titel: r.titel, status: r.status, results: r.results, learnings: String(r.learnings ?? ''), memo: String(r.memo ?? '').slice(0, 300), upvote: r.upvote ?? null, spend: r.spend ?? null, kop: r.kop ?? null, created_by: r.created_by, created_time: r.created_time, last_edited_by: r.last_edited_by, last_edited_time: r.last_edited_time };
}
export function snapshotHubbrad(h) { return { id: h.id, namn: h.namn, status: h.status ?? null }; }

export function tolkaArgv(argv) {
  const a = { skarpt: false, idag: null, cache: false, utanArkiv: false, igen: false, kolla: false };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--skarpt') a.skarpt = true;
    else if (x === '--torr') a.skarpt = false;
    else if (x === '--idag') a.idag = argv[++i];
    else if (x === '--cache') a.cache = true;
    else if (x === '--utan-arkiv') a.utanArkiv = true;
    else if (x === '--igen') a.igen = true;
    else if (x === '--kolla') a.kolla = true;
    else throw new Error(`Okänd flagga: ${x}`);
  }
  return a;
}

/** Hubben som growthguide.mjs batcher vill ha den: annonsnamn → { ansvariga (namn), url }. Ren. */
export function hubbKarta(hub) {
  return new Map(hub.map((h) => [h.namn, { ansvariga: h.ansvariga_namn ?? [], url: h.url }]));
}

export async function kor(argv = process.argv.slice(2), { skriv = console.log, env = process.env, nu = new Date() } = {}) {
  const arg = tolkaArgv(argv);
  const konfig = lasJson(KONFIGFIL);
  const bank = lasJson(ACTIONFIL);
  const gg = existsSync(GROWTHGUIDE) ? lasJson(GROWTHGUIDE) : {};
  const hubId = existsSync(MS_KONFIG) ? lasJson(MS_KONFIG).notion?.hub_id ?? null : null;
  const db = gg.databaser ?? {};
  if (!db.roadmap || !db.log) throw new Error('growthguide.json saknar databaser.roadmap/log — bygg Growth Guide först (node matstrumpor/growthguide.mjs --skarpt)');

  if (arg.kolla) {
    skriv(`Token: ${env.NOTION_TOKEN ? 'finns' : 'SAKNAS'} · Ad Roadmap ${db.roadmap} · Log ${db.log} · hubben ${hubId ?? 'saknas'} · strateg ${konfig.strateg.namn} (${konfig.strateg.notion_user_id})`);
    skriv(`Snapshot: ${existsSync(SNAPSHOT) ? lasJson(SNAPSHOT).skrivet : 'saknas (första körningen mäter hela guiden)'} · historik: ${lasJsonl(HISTORIK).length} rader`);
    if (env.NOTION_TOKEN) {
      const me = await notion('/users/me', { env });
      const rader = await lasRoadmap(db.roadmap, { env });
      skriv(`Integrationen: ${me.name} (${me.id}) · Ad Roadmap: ${rader.length} rader, ${rader.filter((r) => r.created_by === konfig.strateg.notion_user_id).length} skapade av strategen, ${rader.filter((r) => r.status === 'Done').length} Done`);
    }
    return { kolla: true };
  }

  const idag = arg.idag ?? idagSE(nu);
  const vecka = rapportVecka(idag);
  const nuIso = nu.toISOString();
  mkdirSync(join(UTMAPP, vecka), { recursive: true });
  mkdirSync(DATAMAPP, { recursive: true });

  // 1. Arkivet (offline: loggen + mätningarna + briefernas taggar).
  if (!arg.utanArkiv) {
    try { execFileSync(process.execPath, [join(ROT, 'matstrumpor', 'kor.mjs'), '--arkiv', '--idag', idag], { cwd: ROT, stdio: 'pipe' }); }
    catch (e) { skriv(`⚠️ arkivet gick inte att bygga om (${String(e.message).split('\n')[0].slice(0, 160)}) — läser det som finns`); }
  }
  if (!existsSync(ARKIV)) throw new Error(`Arkivet saknas (${ARKIV}). Kör node matstrumpor/kor.mjs --arkiv`);
  const arkiv = lasJson(ARKIV);
  const lardomar = existsSync(LARDOMAR) ? readFileSync(LARDOMAR, 'utf8') : '';
  const { uppladdade } = urLogg(lasJsonl(LOGG));

  // 2. Notion: Ad Roadmap + hubben (eller cachen).
  const cacheFil = join(UTMAPP, 'notion.json');
  let roadmap, hub, hamtat;
  if (arg.cache) {
    if (!existsSync(cacheFil)) throw new Error(`--cache men ${cacheFil} saknas`);
    ({ roadmap, hub, hamtat } = lasJson(cacheFil));
    skriv(`Notion ur cachen (${hamtat}): Ad Roadmap ${roadmap.length} rader, hubben ${hub.length}`);
  } else {
    const t0 = Date.now();
    roadmap = await lasRoadmap(db.roadmap, { env });
    hub = hubId ? await lasHub(hubId, { env }) : [];
    hamtat = nuIso;
    writeFileSync(cacheFil, JSON.stringify({ hamtat, roadmap, hub }, null, 1));
    skriv(`Notion: Ad Roadmap ${roadmap.length} rader, hubben ${hub.length} rader, ${Math.round((Date.now() - t0) / 1000)} s`);
  }

  // 3. Förra snapshoten + historiken + fönstren.
  const forra = existsSync(SNAPSHOT) ? lasJson(SNAPSHOT) : null;
  const historik = lasJsonl(HISTORIK);
  const fonster = fonsterFor(idag, forra?.fonster?.till ?? null);
  const aktivitet = { fran: forra?.skrivet ?? `${fonster.fran}T00:00:00.000Z`, till: nuIso };

  // 4. Batcherna (samma gruppering som Growth Guide) och mätningen.
  const batchar = batcher(arkiv, { hub: hubbKarta(hub), lardomar, uppladdade });
  const M = matVecka({ roadmap, forra, hub, batchar, strateg: konfig.strateg, idag, vecka, fonster, aktivitet, grind: konfig.grind, konfig });
  const esk = eskalering(M, historik, konfig.eskalera);
  const action = valjAction(M, historik, bank);
  const forraRad = perVecka(historik, vecka).reverse().find((h) => h.action);
  let forraAction = null;
  if (forraRad) {
    let svar = null;
    if (!arg.cache && forraRad.logg_rad_id) { const n = await lasNotes(forraRad.logg_rad_id, { env }); svar = n.ok ? n.text : null; if (!n.ok) skriv(`⚠️ NOTES på förra veckans Log-rad gick inte att läsa: ${n.fel}`); }
    forraAction = { text_en: forraRad.action.text_en, svar };
  }

  // 5. Texterna.
  const feedback = feedbackText(M, { action, forra: forraAction });
  const loggrad = loggradText(M, action);
  const eskText = eskaleringText(M, esk);
  if (serUtSomSvenska(feedback.replace(/[A-Za-zåäöÅÄÖ0-9]+_[A-Za-z0-9_]+/g, ''))) skriv('⚠️ feedbacken ser svensk ut för engelskspärren — läs den innan den postas');
  writeFileSync(join(UTMAPP, vecka, 'feedback.md'), `${feedback}\n`);
  writeFileSync(join(UTMAPP, vecka, 'loggrad.txt'), `${loggrad}\n`);
  writeFileSync(join(UTMAPP, vecka, 'matning.json'), JSON.stringify({ M, action, eskalering: esk, forraAction }, null, 1));
  const snapshot = { skrivet: nuIso, idag, vecka, fonster, rader: roadmap.map(snapshotRad), hub: hub.map(snapshotHubbrad) };

  // 6. Notion + minnet (bara --skarpt).
  let skrivet = null;
  const redan = perVecka(historik).find((h) => h.vecka === vecka);
  if (arg.skarpt && redan && !arg.igen) {
    skriv(`Veckan ${vecka} är redan skriven ${redan.skrivet} (Log-rad ${redan.logg_rad_id}). --igen för att skriva om. Inget skrivet.`);
  } else if (arg.skarpt) {
    const rad = await skrivLoggrad(db.log, { titel: `${vecka} Weekly review`, datum: idag, system: loggrad }, { env });
    const forstaRaden = feedback.split('\n')[0];
    let kommentarId = await harKommentar(rad.id, { av: konfig.integration_id, borjar: forstaRaden }, { env });
    let kommentarFanns = !!kommentarId;
    if (!kommentarId) kommentarId = (await kommentera(rad.id, [{ mention: konfig.strateg.notion_user_id }, { text: ` ${feedback}` }], { env })).id;
    let axelId = null;
    if (eskText) {
      axelId = await harKommentar(rad.id, { av: konfig.integration_id, borjar: eskText.split('\n')[0] }, { env });
      if (!axelId) axelId = (await kommentera(rad.id, [{ mention: konfig.axel_notion_user_id }, { text: ` ${eskText}` }], { env })).id;
    }
    skrivet = { logg_rad_id: rad.id, logg_rad_url: rad.url, loggrad_skapad: rad.skapad, kommentar_id: kommentarId, kommentar_fanns: kommentarFanns, axel_kommentar_id: axelId };
    writeFileSync(SNAPSHOT, `${JSON.stringify(snapshot, null, 1)}\n`);
    appendFileSync(HISTORIK, `${JSON.stringify({ vecka, idag, skrivet: nuIso, gjordeKollen: M.gjordeKollen, ko: M.ko, betade: M.betade.length, lardomar: M.betade.filter((b) => b.typ === 'lardom').length, nya_rader: M.nyaRader.length, hubbrader: M.hubb.inlamnade.length, utfall_egna: M.utfall.filter((u) => u.egen).length, hitrate: M.hitrate.egen, action, eskalering: esk.orsaker, ...skrivet })}\n`);
    if (kommentarFanns) skriv(`Kommentaren till ${konfig.strateg.fornamn} fanns redan på Log-raden (${kommentarId}) — ingen ny postad.`);
  } else {
    writeFileSync(join(UTMAPP, vecka, 'snapshot-skulle.json'), `${JSON.stringify(snapshot, null, 1)}\n`);
  }

  // 7. Svaret.
  const lank = skrivet?.logg_rad_url ?? null;
  skriv('');
  skriv(rapportAxel(M, { action, eskalering: esk, skarpt: !!skrivet, lank }));
  skriv('');
  skriv(`Filer: ${join(UTMAPP, vecka)}`);
  return { vecka, M, action, eskalering: esk, skrivet, feedback };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  kor().catch((fel) => { console.error(`FEL: ${fel.message}`); process.exit(1); });
}
