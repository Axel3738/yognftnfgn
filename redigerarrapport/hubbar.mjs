#!/usr/bin/env node
// hubbar.mjs — ALLA creative hubs för veckorapporten till redigerarna, märkta
// per verksamhet, med varje rad som har någon i Ansvarig.
//
// Varför filen finns (PLAN.md avsnitt 1, mätt 2026-10-02): kopplingen annons →
// redigerare är flaskhalsen. commission/notion.mjs hittar bara hubbar vars titel
// slutar på "creative hub" plus commission/hubbar.json, så de nya BÄVER-hubbarna
// (Värmesitsen, Driftbilen, Maskinhyllan, Sotarsetet, Solcellslampan …) lästes
// aldrig — 35 av 43 okopplade SE-annonser hade ingen hubbrad alls.
//
// Vad den gör, i ordning:
//   1. Hittar hubbarna som /notionkorning gör (tools/notion-kalla.mjs
//      hittaHubbar: alla databaser integrationen ser + products.json-golvet),
//      och lägger TILLBAKA det den rutinen tar bort — OPS-hubbarna (id ur
//      factory/produkter/register.json) och andra verksamheters hubbar (id ur
//      tools/lib/andra-verksamheter.json) — men MÄRKTA med verksamhet i stället
//      för borttagna. Plus commission/hubbar.json som golv.
//   2. Klassar varje databas: verksamhet 'baverbutiken' (standard), 'carashell'
//      m.fl. (butiken ur registrets nyckel), 'matstrumpor'. Databaser som inte
//      är creative hubs (mallen MALL, Product test center, Customer support,
//      Creative Hub master/Grillkliniken, Bäverkoppling, Growth Guide,
//      Annonsidéer, utan titel) hoppas MED ORSAK — och som säkerhetsnät läses
//      kolumnerna: en creative hub har kolumnen Ansvarig (people). Saknas den
//      hoppas databasen också, med kolumnerna i orsaken.
//   3. Läser varje hubs ALLA rader oavsett status (commission/notion.mjs
//      hamtaAllaHubbar) och Jerzee via kommentar på rader utan Ansvarig
//      (commission/kommentarer.mjs berikaMedKommentarer).
//   4. Returnerar { hubbar, hoppade, fel } och skriver cachen
//      redigerarrapport/output/hubbar.json (gitignorerad).
//
// Läs-bart: skriver aldrig till Notion. Notion stryps till ~3/s — en läsning
// med kommentarssteget tar några minuter (~800 rader utan Ansvarig är ~800 anrop).
//
//   node redigerarrapport/hubbar.mjs                     läs Notion, skriv cachen
//   node redigerarrapport/hubbar.mjs --cache             läs cachen i stället
//   node redigerarrapport/hubbar.mjs --utan-kommentarer  hoppa Jerzee-steget
//   node redigerarrapport/hubbar.mjs --json              hela resultatet som JSON
//
// Kräver env NOTION_TOKEN (integrationen "Bäverbutiken RUTINER").

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { hittaHubbar as hittaBaverHubbar } from '../tools/notion-kalla.mjs';
import { opsHubbar, normaliseraId } from '../tools/lib/ops-hubbar.mjs';
import { hamtaAllaHubbar, hubbarUrFil } from '../commission/notion.mjs';
import { berikaMedKommentarer, sidId } from '../commission/kommentarer.mjs';

const API = 'https://api.notion.com/v1';
export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const CACHEFIL = join(ROT, 'redigerarrapport', 'output', 'hubbar.json');
export const VERKSAMHET_STANDARD = 'baverbutiken';

/** Verksamheter som aldrig får en redigerarrapport, även om hubben är en riktig
 *  creative hub (Grillklinikens Mastern är legacy — CLAUDE.md). Gemener. */
export const HOPPA_VERKSAMHETER = new Set(['grillkliniken']);

/** Databaser integrationen ser som INTE är creative hubs. Titelregler, i ordning,
 *  med orsaken som hamnar i `hoppade`. Id-reglerna (register, andra
 *  verksamheter, utan åtkomst) prövas FÖRE de här — titlar byts, id:n består. */
export const INTE_HUB = [
  { monster: /^\s*$/, orsak: 'utan titel — ingen produkt' },
  { monster: /\bMALL\b/i, orsak: 'mallen "MALL Creative hub MALL" — ingen produkt' },
  { monster: /product test center/i, orsak: 'produkttestregistret, inte en creative hub' },
  { monster: /customer support|kundsupport/i, orsak: 'kundtjänstens SOP-databas, inte en creative hub' },
  { monster: /creative hub master/i, orsak: 'Grillklinikens hub (Mastern, legacy) — ingen redigerarrapport' },
  { monster: /grillkliniken/i, orsak: 'Grillkliniken — legacy, ingen redigerarrapport' },
  { monster: /b[äa]verkoppling/i, orsak: 'Bäverkopplings SOP-bas, inte en creative hub' },
  { monster: /growth guide/i, orsak: 'annonsregister (Growth Guide), inte en creative hub' },
  { monster: /annonsid[ée]er/i, orsak: 'idébank, inte en creative hub' },
];

// ----------------------------------------------------------------- hjälpare

const lasJson = (fil) => JSON.parse(readFileSync(fil, 'utf8'));

/** Andra verksamheters hubbar ur tools/lib/andra-verksamheter.json →
 *  Map(normaliserat id → { id, namn, verksamhet (gemener) }). Trasig fil = tom Map. */
export function andraVerksamheter(fil = join(ROT, 'tools', 'lib', 'andra-verksamheter.json')) {
  try {
    const { hubbar = [] } = lasJson(fil);
    return new Map(hubbar.map((h) => [normaliseraId(h.id), {
      id: h.id, namn: h.namn ?? '', verksamhet: String(h.verksamhet ?? '').trim().toLowerCase(),
    }]));
  } catch {
    return new Map();
  }
}

/** Hubbar Axel sagt att vi ska strunta i (svarar 404, arkiverade) ur
 *  tools/lib/hubbar-utan-atkomst.json → Map(normaliserat id → { titel, beslut }). */
export function utanAtkomst(fil = join(ROT, 'tools', 'lib', 'hubbar-utan-atkomst.json')) {
  try {
    const j = lasJson(fil);
    return new Map((j.hubbar ?? []).map((h) => [normaliseraId(h.id), { titel: h.titel ?? '', beslut: j.beslut ?? '' }]));
  } catch {
    return new Map();
  }
}

/** Slår ihop flera kandidatlistor på id (med/utan bindestreck, skiftläge spelar
 *  ingen roll). Första förekomsten vinner; en tom titel fylls från en senare;
 *  `kallor` samlar var hubben sågs. Ordningen bevaras. */
export function slaIhop(...listor) {
  const pa = new Map();
  for (const lista of listor) {
    for (const h of lista ?? []) {
      const nyckel = normaliseraId(h.id);
      if (!nyckel) continue;
      const titel = String(h.titel ?? h.namn ?? h.name ?? '').trim();
      const kalla = h.kalla ?? 'okänd';
      const finns = pa.get(nyckel);
      if (!finns) {
        pa.set(nyckel, { id: h.id, titel, url: h.url ?? null, kallor: [kalla] });
      } else {
        if (!finns.titel && titel) finns.titel = titel;
        if (!finns.url && h.url) finns.url = h.url;
        if (!finns.kallor.includes(kalla)) finns.kallor.push(kalla);
      }
    }
  }
  return [...pa.values()];
}

/** Kartor för klassningen, lästa från disk. Tester skickar in egna. */
export function kartorFranDisk(rot = ROT) {
  return {
    opsKarta: opsHubbar(rot),
    andraKarta: andraVerksamheter(join(rot, 'tools', 'lib', 'andra-verksamheter.json')),
    utanAtkomstKarta: utanAtkomst(join(rot, 'tools', 'lib', 'hubbar-utan-atkomst.json')),
  };
}

/** Verksamheten ur registrets nyckel: "carashell/takskyddet" → "carashell". */
export const verksamhetUrNyckel = (nyckel) => String(nyckel ?? '').split('/')[0].trim().toLowerCase();

/**
 * Klassar EN databas. Ren funktion.
 * @returns {{ verksamhet: string, hoppa: string|null, ops_nyckel?: string }}
 */
export function klassificeraHub(hub, { opsKarta = new Map(), andraKarta = new Map(), utanAtkomstKarta = new Map() } = {}) {
  const nyckel = normaliseraId(hub.id);
  const titel = String(hub.titel ?? '');

  const ua = utanAtkomstKarta.get(nyckel);
  if (ua) return { verksamhet: VERKSAMHET_STANDARD, hoppa: `arkiverad och svarar 404 — strunta i den (${ua.beslut || 'Axels beslut'}, tools/lib/hubbar-utan-atkomst.json)` };

  const ops = opsKarta.get(nyckel);
  if (ops) {
    const verksamhet = verksamhetUrNyckel(ops.nyckel) || 'ops';
    if (HOPPA_VERKSAMHETER.has(verksamhet)) return { verksamhet, hoppa: `${verksamhet} — ingen redigerarrapport` };
    return { verksamhet, hoppa: null, ops_nyckel: ops.nyckel };
  }

  const andra = andraKarta.get(nyckel);
  if (andra) {
    const verksamhet = andra.verksamhet || 'annan';
    if (HOPPA_VERKSAMHETER.has(verksamhet)) {
      const regel = INTE_HUB.find((r) => r.monster.test(titel));
      return { verksamhet, hoppa: regel?.orsak ?? `${andra.namn || verksamhet} — ${verksamhet}, ingen redigerarrapport` };
    }
    return { verksamhet, hoppa: null };
  }

  const regel = INTE_HUB.find((r) => r.monster.test(titel));
  if (regel) return { verksamhet: VERKSAMHET_STANDARD, hoppa: regel.orsak };

  return { verksamhet: VERKSAMHET_STANDARD, hoppa: null };
}

/**
 * Klassar en kandidatlista. Ren funktion.
 * @returns {{ hubbar: Array<{id,titel,verksamhet,url,kallor,ops_nyckel?}>, hoppade: Array<{id,titel,orsak}> }}
 */
export function klassificera(kandidater, kartor = {}) {
  const hubbar = [];
  const hoppade = [];
  for (const k of slaIhop(kandidater)) {
    const dom = klassificeraHub(k, kartor);
    if (dom.hoppa) hoppade.push({ id: k.id, titel: k.titel, orsak: dom.hoppa });
    else hubbar.push({ ...k, verksamhet: dom.verksamhet, ...(dom.ops_nyckel ? { ops_nyckel: dom.ops_nyckel } : {}) });
  }
  return { hubbar, hoppade };
}

/** En rad som rapporten vill ha den. `page_id` ur radens URL (commission/kommentarer.mjs sidId). */
export function formaRad(r) {
  const ut = {
    namn: r.namn ?? '',
    ansvariga: [...new Set(r.ansvariga ?? [])],
    status: r.status ?? '',
    typ: r.typ ?? '',
    skapad: r.skapad ?? null,
    url: r.url ?? null,
    page_id: sidId(r.url),
  };
  if (r.viaKommentar) ut.via_kommentar = r.viaKommentar;
  return ut;
}

/** Personerna utan Notion-konto (Jerzee) på formen commission/kommentarer.mjs vill ha. */
export function personerUrTeam(team) {
  return (team?.users ?? [])
    .filter((u) => u.notionKommentarMonster && u.notionUserId)
    .map((u) => ({ id: u.id, namn: u.name, notionUserId: u.notionUserId, kommentarMonster: u.notionKommentarMonster }));
}

/** Notion-användar-id → namn: team.json (notionUserId + alias) och
 *  commission/produkter.json (agare). team.json vinner. */
export function namnkarta(team, produkter = null) {
  const karta = new Map();
  for (const [id, namn] of Object.entries(produkter?.agare ?? {})) karta.set(id, namn);
  for (const u of team?.users ?? []) {
    if (u.notionUserId) karta.set(u.notionUserId, u.name);
    for (const a of u.notionUserIdAlias ?? []) karta.set(a, u.name);
  }
  return karta;
}

/** Rader med Ansvarig per person, över alla hubbar. En rad med två personer
 *  räknas på båda (det är radernas antal per person, inte en fördelning).
 *  Okända id:n skrivs ut som "okänt id …" — aldrig gissade. */
export function raknaPerPerson(hubbar, namnAv = new Map()) {
  const ut = {};
  for (const h of hubbar ?? []) {
    for (const r of h.rader ?? []) {
      for (const id of r.ansvariga ?? []) {
        const namn = namnAv.get(id) ?? `okänt id ${id}`;
        const p = (ut[namn] ??= { rader: 0, via_kommentar: 0, verksamheter: {} });
        p.rader++;
        if (r.via_kommentar) p.via_kommentar++;
        p.verksamheter[h.verksamhet] = (p.verksamheter[h.verksamhet] ?? 0) + 1;
      }
    }
  }
  return ut;
}

// -------------------------------------------------------------- kolumnkollen

let sist = 0;
/** Kolumnerna i en databas (GET databases/{id}) → [{ namn, typ }]. Egen
 *  strypning till ~3/s, samma takt som commission/notion.mjs. */
export async function hamtaKolumner(id, { fetchImpl = fetch, env = process.env, vanta = 350 } = {}) {
  if (!env.NOTION_TOKEN) throw new Error('NOTION_TOKEN saknas i miljön.');
  const kvar = vanta - (Date.now() - sist);
  if (kvar > 0) await new Promise((r) => setTimeout(r, kvar));
  sist = Date.now();
  const res = await fetchImpl(`${API}/databases/${normaliseraId(id)}`, {
    headers: { authorization: `Bearer ${env.NOTION_TOKEN}`, 'notion-version': '2022-06-28' },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(json.message || res.statusText); e.status = res.status; throw e; }
  return Object.entries(json.properties ?? {}).map(([namn, v]) => ({ namn, typ: v.type }));
}

/** Är det här en creative hub att döma av kolumnerna? Kravet: en title-kolumn
 *  och en people-kolumn (Ansvarig). Mätt 2026-10-02: alla 27 creative hubs bär
 *  Ansvarig:people; Annonsidéer, Growth Guide och den namnlösa gör det inte. */
export function serUtSomHub(kolumner) {
  const k = kolumner ?? [];
  return k.some((c) => c.typ === 'title') && k.some((c) => c.typ === 'people');
}

// ------------------------------------------------------------ hela läsningen

/** Kandidaterna: Bäverbutikens hubbar som /notionkorning ser dem + OPS-hubbarna
 *  per id + andra verksamheter per id + commission/hubbar.json (SE, ej arkiverade). */
export async function hittaKandidater({ sok = hittaBaverHubbar, kartor = kartorFranDisk(), hubbarJson = hubbarUrFil, logg = console.error } = {}) {
  const sokLogg = [];
  // tools/notion-kalla.mjs loggar sina egna spärrar ("OPS-hubbar undantagna …",
  // "Andra verksamheters hubbar undantagna …") på stderr. De gäller
  // /notionkorning — här läggs samma hubbar tillbaka, märkta per verksamhet.
  if (logg) logg('Sökningen går via tools/notion-kalla.mjs — dess spärr-loggar nedan gäller /notionkorning; rapporten lägger tillbaka de hubbarna märkta per verksamhet.');
  const baver = await sok({ logg: (r) => { sokLogg.push(String(r)); if (logg) logg(r); } });
  const sokFel = sokLogg.some((r) => /FELADE I ALLA FÖRSÖK/i.test(r))
    ? 'Notion-sökningen felade i alla försök — listan bygger bara på golven (products.json, register, andra-verksamheter, hubbar.json). Nya hubbar saknas.'
    : null;
  const ops = [...kartor.opsKarta.values()].map((o) => ({ id: o.id, titel: o.name, kalla: 'register.json' }));
  const andra = [...kartor.andraKarta.values()].map((a) => ({ id: a.id, titel: a.namn, kalla: 'andra-verksamheter.json' }));
  let fil = [];
  try { fil = hubbarJson().map((h) => ({ id: h.id, titel: h.namn, kalla: 'hubbar.json' })); } catch { fil = []; }
  const kandidater = slaIhop(
    (baver ?? []).map((h) => ({ ...h, kalla: h.kalla ?? 'sök' })),
    ops, andra, fil,
  );
  return {
    kandidater,
    sok: { baver: (baver ?? []).length, ops: ops.length, andra: andra.length, hubbar_json: fil.length, kandidater: kandidater.length, fel: sokFel },
  };
}

/**
 * Hela läsningen. Allt som pratar med nätet går att byta ut i tester:
 * `sok` (hubblistan), `kolumner(id)` (kolumnkollen), `fetchImpl`/`env`
 * (raderna och kommentarerna via commission/*).
 */
export async function hamtaHubbar({
  sok, kartor = kartorFranDisk(), hubbarJson,
  kolumner = null, fetchImpl = fetch, env = process.env,
  team = null, produkter = null,
  kommentarer = true, logg = console.error,
} = {}) {
  const t0 = Date.now();
  const kolumnerAv = kolumner ?? ((id) => hamtaKolumner(id, { fetchImpl, env }));

  const { kandidater, sok: sokInfo } = await hittaKandidater({ sok, kartor, hubbarJson, logg });
  const klass = klassificera(kandidater, kartor);
  const hoppade = [...klass.hoppade];
  const fel = [];
  if (sokInfo.fel) fel.push({ hubb: '(sökningen)', fel: sokInfo.fel });

  // Säkerhetsnätet: kolumnerna. En databas utan Ansvarig är ingen creative hub,
  // hur den än heter. 404 här = integrationen inte inbjuden → fel, inte rad-läsning.
  const attLasa = [];
  for (const h of klass.hubbar) {
    try {
      const kol = await kolumnerAv(h.id);
      if (!serUtSomHub(kol)) {
        hoppade.push({ id: h.id, titel: h.titel, orsak: `saknar kolumnen Ansvarig (people) — inte en creative hub (kolumner: ${kol.map((c) => c.namn).join(', ') || 'inga'})` });
        continue;
      }
      attLasa.push(h);
    } catch (e) {
      fel.push({ hubb: h.titel, fel: e.status === 404
        ? `404 — integrationen är inte inbjuden till "${h.titel}" (••• → Connections)`
        : e.message });
    }
  }

  // Raderna: ALLA, oavsett status — en rad med Ansvarig är gjord av någon.
  const svar = await hamtaAllaHubbar({ hubbar: attLasa.map((h) => ({ ...h, namn: h.titel })), fetchImpl, env });
  fel.push(...svar.fel);
  const hubbar = svar.hubbar.map((h) => ({
    id: h.id, titel: h.titel, verksamhet: h.verksamhet, url: h.url ?? null, kallor: h.kallor ?? [],
    ...(h.ops_nyckel ? { ops_nyckel: h.ops_nyckel } : {}),
    rader: (h.rader ?? []).map(formaRad),
  }));

  // Jerzee via kommentar — bara rader utan Ansvarig, bara Pending Approval
  // (reglerna sitter i commission/kommentarer.mjs). Muterar raderna på plats.
  let kom = null;
  const teamData = team ?? lasJson(join(ROT, 'dashboard', 'data', 'team.json'));
  if (kommentarer) {
    const personer = personerUrTeam(teamData);
    if (personer.length) {
      const vy = hubbar.map((h) => ({ namn: h.titel, rader: h.rader }));
      kom = await berikaMedKommentarer(vy, personer, { fetchImpl, env });
      for (const h of hubbar) for (const r of h.rader) if (r.viaKommentar) { r.via_kommentar = r.viaKommentar; delete r.viaKommentar; }
    } else {
      kom = { matchare: [], lasta: 0, traffar: 0, fel: 0, perPerson: {}, rader: [], orsak: 'ingen i team.json har notionKommentarMonster' };
    }
  }

  let produkterData = produkter;
  if (!produkterData) { try { produkterData = lasJson(join(ROT, 'commission', 'produkter.json')); } catch { produkterData = null; } }
  const namnAv = namnkarta(teamData, produkterData);

  return {
    skrivet: new Date().toISOString(),
    sek: Math.round((Date.now() - t0) / 1000),
    sok: sokInfo,
    hubbar,
    hoppade,
    fel,
    kommentarer: kom ? { lasta: kom.lasta, traffar: kom.traffar, fel: kom.fel, perPerson: kom.perPerson, ...(kom.orsak ? { orsak: kom.orsak } : {}) } : { hoppat: true },
    per_person: raknaPerPerson(hubbar, namnAv),
  };
}

// --------------------------------------------------------------------- cache

export function skrivCache(resultat, fil = CACHEFIL) {
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, JSON.stringify(resultat, null, 1));
  return fil;
}

export function lasCache(fil = CACHEFIL) {
  if (!existsSync(fil)) {
    const e = new Error(`Ingen cache i ${fil} — kör utan --cache först.`);
    e.ingenCache = true;
    throw e;
  }
  return lasJson(fil);
}

// ------------------------------------------------------------------ utskrift

const pad = (s, n) => String(s).padEnd(n);
const hoger = (s, n) => String(s).padStart(n);

/** Rapporten som rader text (svenska — läses av Axel i chatten). */
export function sammanfattning(res) {
  const ut = [];
  const medAnsv = (h) => h.rader.filter((r) => r.ansvariga.length).length;
  const rader = res.hubbar.reduce((n, h) => n + h.rader.length, 0);
  const ansv = res.hubbar.reduce((n, h) => n + medAnsv(h), 0);
  ut.push(`Hubbar: ${res.hubbar.length} lästa · ${res.hoppade.length} hoppade · ${res.fel.length} fel · ${rader} rader, ${ansv} med Ansvarig · ${res.sek ?? '?'} s${res.skrivet ? ` (${res.skrivet})` : ''}`);
  if (res.sok) ut.push(`Kandidater: ${res.sok.kandidater} (notionkorning-sökningen ${res.sok.baver}, register ${res.sok.ops}, andra verksamheter ${res.sok.andra}, hubbar.json ${res.sok.hubbar_json})`);
  const bredd = Math.max(20, ...res.hubbar.map((h) => h.titel.length));
  for (const h of [...res.hubbar].sort((a, b) => a.verksamhet.localeCompare(b.verksamhet) || medAnsv(b) - medAnsv(a))) {
    ut.push(`  ${pad(h.titel, bredd)}  ${pad(h.verksamhet, 13)} ${hoger(h.rader.length, 4)} rader ${hoger(medAnsv(h), 4)} med Ansvarig`);
  }
  if (res.hoppade.length) {
    ut.push('Hoppade (inte creative hubs, eller ingen rapport):');
    for (const h of res.hoppade) ut.push(`  ✗ ${h.titel || '(utan titel)'} — ${h.orsak}`);
  }
  if (res.fel.length) {
    ut.push('Fel:');
    for (const f of res.fel) ut.push(`  ⛔ ${f.hubb}: ${f.fel}`);
  }
  if (res.kommentarer && !res.kommentarer.hoppat) {
    const k = res.kommentarer;
    ut.push(`Kommentarssteget (Jerzee): ${k.lasta} rader lästa, ${k.traffar} träffar, ${k.fel} fel${k.orsak ? ` — ${k.orsak}` : ''}`);
  } else {
    ut.push('Kommentarssteget hoppat (--utan-kommentarer): Jerzees äldre rader saknar Ansvarig och syns då inte.');
  }
  ut.push('Per person (rader med Ansvarig, alla hubbar och statusar):');
  const pers = Object.entries(res.per_person ?? {}).sort((a, b) => b[1].rader - a[1].rader);
  if (!pers.length) ut.push('  (inga)');
  for (const [namn, p] of pers) {
    const v = Object.entries(p.verksamheter).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ');
    ut.push(`  ${pad(namn, 22)} ${hoger(p.rader, 4)}  (${v})${p.via_kommentar ? ` · ${p.via_kommentar} via kommentar` : ''}`);
  }
  return ut;
}

// ------------------------------------------------------------- fristående CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const finns = (n) => args.includes(`--${n}`);
  // ⚠️ Aldrig process.exit() efter en stor utskrift: stdout till en pipe töms
  // asynkront, och --json kapades vid 64 kB första gången. exitCode räcker.
  try {
    let res;
    if (finns('cache')) {
      res = lasCache();
      res.per_person ??= raknaPerPerson(res.hubbar, namnkarta(lasJson(join(ROT, 'dashboard', 'data', 'team.json'))));
    } else {
      res = await hamtaHubbar({ kommentarer: !finns('utan-kommentarer') });
      const fil = skrivCache(res);
      console.error(`Cache skriven: ${fil}`);
    }
    if (finns('json')) {
      process.stdout.write(JSON.stringify(res, null, 1) + '\n');
    } else {
      for (const rad of sammanfattning(res)) console.log(rad);
    }
    process.exitCode = res.fel.length && !res.hubbar.length ? 1 : 0;
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exitCode = 1;
  }
}
