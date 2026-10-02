// kallor.mjs — etiketterna ur de två loggarna, i EN form (veckorapporten till redigerarna).
//
// Problemet (redigerarrapport/PLAN.md avsnitt 1 och 7): etiketterna ligger i två
// loggar med olika form, och rapporten ska läsa dem — aldrig hämta ur Meta själv.
//
//   (1) matstrumpor/logg.jsonl, kod ETIKETT (Matstrumpor, kontot "nya kungen").
//       Fält i loggen 2026-10-02 (96 rader, mätt): datum, annons, etikett, bedombar,
//       fonster 'YYYY-MM-DD..YYYY-MM-DD', spend_sek, kop, roas, orsak, skrivet, och
//       andel på 45 av 96. Koden i matstrumpor/kor.mjs etikettraderFor skriver sedan
//       2026-10-01 dessutom vecka, uppgradering_fran, marknad, tillvaxt — men ingen
//       sådan rad fanns i loggen vid bygget, och hook_rate/hold_rate skrivs INTE i
//       raden (de ligger bara i domen). Ingen annons_id, ingen kampanj.
//   (2) agent/budgetlogg.jsonl på grenen claude/daily-agent-discussion-uos5df
//       (Bäverbutiken SE/NO och CaraShell; finns INTE på main). Läses med
//       `git fetch --depth 1` + `git show origin/<gren>:agent/budgetlogg.jsonl`,
//       grenen checkas aldrig ut. 3 880 ETIKETT-rader 2026-10-02 med annons_id,
//       kampanj_namn, ad_account_id, d0, d6, spend_ad, spend_kampanj, andel, kop,
//       roas_ad, hook_rate, hold_rate, lpv, cvr, bof, backfill (3 787),
//       utford_som_briefad ('okänd' på alla), godkand_av — men inget vecka-fält
//       (alla rader är annonsens första vecka; en ETIKETT_UPPGRADERAD-rad finns i
//       koden men ingen i loggen) och ingen tidsstämpel utöver datum.
//
// Grinden `bedombar` räknas OM här (spend ≥ 300 kr OCH köp ≥ 3, Axels beslut
// 2026-10-02, talen i redigerarrapport/konfig.json → grind). Loggens eget värde
// ligger kvar i `bedombar_rad` — Matstrumpor räknade ELLER till 2026-10-02.
//
// Verksamheten kommer ur kontot via stonebite/varumarken.json + kampanjTillhor:
// OPS-kontot och Magiborsten UK delas på kampanjprefixet CARASHELL_.
//
// Läs-bart: skriver bara cachen redigerarrapport/output/budgetlogg.jsonl.
// Noll beroenden. Testerna injicerar `lasare` och använder fixturerna.

import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RANG, gallandeEtiketter } from '../matstrumpor/etikett.mjs';
import { kampanjTillhor } from '../stonebite/data.mjs';
import { isoVecka } from '../kundtjanst/rapport.mjs';

export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const CACHEFIL = join(ROT, 'redigerarrapport', 'output', 'budgetlogg.jsonl');
export const KONFIGFIL = join(ROT, 'redigerarrapport', 'konfig.json');
/** Loggkoder som bär en etikett (agent-grenens ETIKETTKODER — importeras inte,
 *  grenen finns inte på main). */
export const ETIKETTKODER = ['ETIKETT', 'ETIKETT_UPPGRADERAD'];
const DAG = 86_400_000;

export function lasKonfig(fil = KONFIGFIL) {
  return JSON.parse(readFileSync(fil, 'utf8'));
}

/** Grinden ur konfigen. Saknas den: Axels tal 2026-10-02 (300 kr OCH 3 köp). */
export function grindUr(konfig) {
  const g = konfig?.grind ?? {};
  return { spend_sek: Number(g.spend_sek ?? 300), kop: Number(g.kop ?? 3) };
}

/** EN definition av bedömbar: spend ≥ 300 kr OCH köp ≥ 3. Ren. */
export function arBedombar(spend, kop, grind = { spend_sek: 300, kop: 3 }) {
  return Number(spend) >= grind.spend_sek && Number(kop) >= grind.kop;
}

// ─── datum ────────────────────────────────────────────────────────────────

export function plusDagar(iso, dagar) {
  const t = Date.parse(`${iso}T00:00:00Z`);
  if (!Number.isFinite(t)) return null;
  return new Date(t + dagar * DAG).toISOString().slice(0, 10);
}

/** ISO-veckan ett datum ligger i, "2026-W39". Ren. */
export function veckaFor(iso) {
  const t = Date.parse(`${String(iso ?? '').slice(0, 10)}T00:00:00Z`);
  return Number.isFinite(t) ? isoVecka(new Date(t)) : null;
}

/** Måndag och söndag för "2026-W39" → { fran: '2026-09-21', till: '2026-09-27' }.
 *  ISO: vecka 1 är den som bär 4 januari. */
export function veckansDatum(vecka) {
  const m = /^(\d{4})-W(\d{2})$/.exec(String(vecka ?? ''));
  if (!m) throw new Error(`Veckan ska skrivas 2026-W39, inte "${vecka}"`);
  const ar = Number(m[1]);
  const v = Number(m[2]);
  if (v < 1 || v > 53) throw new Error(`Vecka ${v} finns inte`);
  const jan4 = new Date(Date.UTC(ar, 0, 4));
  const dag = jan4.getUTCDay() || 7;
  const mandagW1 = new Date(jan4.getTime() - (dag - 1) * DAG);
  const mandag = new Date(mandagW1.getTime() + (v - 1) * 7 * DAG);
  const fran = mandag.toISOString().slice(0, 10);
  if (veckaFor(fran) !== vecka) throw new Error(`Vecka ${vecka} finns inte det året`);
  return { vecka, fran, till: plusDagar(fran, 6) };
}

// ─── verksamheten ur kontot ───────────────────────────────────────────────

export function lasVarumarken(fil = join(ROT, 'stonebite', 'varumarken.json')) {
  return JSON.parse(readFileSync(fil, 'utf8')).varumarken ?? [];
}

/** Verksamhets-id (baverbutiken, carashell, matstrumpor, grillkliniken, ops) för
 *  ett konto, med kampanjnamnet som skiljer i delade konton. null = kontot står
 *  inte i varumarken.json — aldrig gissat. */
export function verksamhetFor(konto, kampanj, varumarken) {
  const id = String(konto ?? '').replace(/^act_/, '');
  const traffar = [];
  for (const vm of varumarken ?? []) {
    for (const post of vm.konton ?? []) {
      if (String(post.id) !== id) continue;
      if (post.hela || kampanjTillhor(post, kampanj)) traffar.push(vm.id);
    }
  }
  return traffar.length ? traffar[0] : null;
}

// ─── normalisering ────────────────────────────────────────────────────────

const tal = (x) => (x === null || x === undefined || x === '' ? null : Number.isFinite(Number(x)) ? Number(x) : null);
const kvot = (t, n) => (t === null || n === null || n <= 0 ? null : Number((t / n).toFixed(4)));

/** Nyckeln som skiljer annonser åt. Samma NAMN ligger i två kampanjer i samma
 *  konto 291 gånger i agent-loggen (mätt 2026-10-02: Termoskydd_SP_2 i CBO:n och i
 *  listicle-kampanjen), så namnet ensamt duger inte där — annons_id gör det.
 *  Matstrumpor saknar annons_id; där är konto + namn unikt (0 dubbletter, mätt). */
export function annonsnyckel(rad) {
  return rad.annons_id ? `${rad.konto}|id:${rad.annons_id}` : `${rad.konto}|${rad.annons}`;
}

/** En Matstrumpor-rad (matstrumpor/logg.jsonl, kod ETIKETT) → enhetlig rad.
 *  konto/kampanj kommer ur matstrumpor/konfig.json (raden bär ingen). Marknad
 *  utanför Sverige har en egen kampanj som raden inte namnger ⇒ kampanj null. */
export function normaliseraMatstrumpor(rad, { konto, kampanjnamn, grind, varumarken } = {}) {
  const [fonster_start = null, fonster_slut = null] = String(rad.fonster ?? '').split('..').map((s) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null));
  const vecka = tal(rad.vecka) ?? 1;
  const d0 = rad.d0 ?? (fonster_start && vecka >= 1 ? plusDagar(fonster_start, -7 * (vecka - 1)) : null);
  const marknad = rad.marknad ?? 'SE';
  const kampanj = rad.kampanj ?? (marknad === 'SE' ? kampanjnamn ?? null : null);
  const spend_sek = tal(rad.spend_sek);
  const kop = tal(rad.kop) ?? 0;
  const hook_rate = tal(rad.hook_rate);
  const hold_rate = tal(rad.hold_rate);
  return {
    kalla: 'matstrumpor',
    verksamhet: verksamhetFor(konto, kampanj, varumarken),
    konto: String(konto ?? ''),
    kampanj,
    annons: String(rad.annons ?? ''),
    annons_id: rad.annons_id ?? null,
    etikett: rad.etikett,
    bedombar_rad: rad.bedombar ?? null,
    bedombar: arBedombar(spend_sek ?? 0, kop, grind),
    d0,
    fonster_start,
    fonster_slut,
    vecka,
    uppgradering_fran: rad.uppgradering_fran ?? null,
    spend_sek,
    kop,
    roas: tal(rad.roas),
    andel: tal(rad.andel),
    hook_rate,
    hold_rate,
    hook_till_hold: kvot(hold_rate, hook_rate),
    konv_lpv: tal(rad.konv_lpv),
    // Fältet finns inte i Matstrumpors logg ⇒ null (inte 'okänd', som är agentens eget ord).
    utford_som_briefad: rad.utford_som_briefad ?? null,
    backfill: rad.backfill ?? null,
    skrivet: rad.skrivet ?? rad.datum ?? null,
  };
}

/** En agent-rad (agent/budgetlogg.jsonl, kod ETIKETT/ETIKETT_UPPGRADERAD) → enhetlig
 *  rad. `tidigare` = etiketten som gällde före en uppgraderingsrad (slås upp av
 *  anroparen på annons_id). Fönstret är alltid annonsens egen första vecka d0..d6;
 *  en uppgraderingsrad säger inte vilken vecka den lästes ⇒ vecka null. */
export function normaliseraAgent(rad, { grind, varumarken, tidigare = null } = {}) {
  const konto = String(rad.ad_account_id ?? '').replace(/^act_/, '');
  const spend_sek = tal(rad.spend_ad);
  const kop = tal(rad.kop) ?? 0;
  const hook_rate = tal(rad.hook_rate);
  const hold_rate = tal(rad.hold_rate);
  const lpv = tal(rad.lpv);
  const uppgradering = rad.kod === 'ETIKETT_UPPGRADERAD';
  return {
    kalla: 'agent',
    verksamhet: verksamhetFor(konto, rad.kampanj_namn, varumarken),
    konto,
    kampanj: rad.kampanj_namn ?? null,
    annons: String(rad.annons_namn ?? ''),
    annons_id: rad.annons_id ?? null,
    etikett: rad.etikett,
    bedombar_rad: rad.bedombar ?? null,
    bedombar: arBedombar(spend_sek ?? 0, kop, grind),
    d0: rad.d0 ?? null,
    fonster_start: rad.d0 ?? null,
    fonster_slut: rad.d6 ?? (rad.d0 ? plusDagar(rad.d0, 6) : null),
    vecka: uppgradering ? null : 1,
    uppgradering_fran: uppgradering ? tidigare?.etikett ?? null : null,
    spend_sek,
    kop,
    roas: tal(rad.roas_ad),
    andel: tal(rad.andel),
    hook_rate,
    hold_rate,
    hook_till_hold: kvot(hold_rate, hook_rate),
    // Köp per landningssidevisning. Agentens cvr faller tillbaka på klick när lpv
    // saknas — det är ett annat mått, så här bara lpv.
    konv_lpv: lpv !== null && lpv > 0 ? Number((kop / lpv).toFixed(4)) : null,
    utford_som_briefad: rad.utford_som_briefad ?? 'okänd',
    backfill: rad.backfill === true,
    skrivet: rad.datum ?? null,
  };
}

/** Rader ur en jsonl-text. Trasiga rader hoppas och räknas. */
export function tolkaJsonl(text) {
  const rader = [];
  let trasiga = 0;
  for (const rad of String(text ?? '').split('\n')) {
    const t = rad.trim();
    if (!t) continue;
    try { rader.push(JSON.parse(t)); } catch { trasiga++; }
  }
  return { rader, trasiga };
}

/** Räknar hur många råa rader som saknar ett fält (undefined eller null) — så
 *  rapporten kan säga vilka mått som inte finns i den ena källan. */
export function saknadeFalt(rader, falt) {
  const ut = {};
  for (const f of falt) {
    const n = rader.filter((r) => r[f] === undefined || r[f] === null).length;
    if (n) ut[f] = n;
  }
  return ut;
}

/** Fälten rapporten vill ha och som kan saknas i respektive källa. `backfill`
 *  räknas för sig (saknat fält betyder "inte backfill", inte "okänt"). */
const FALT_MATSTRUMPOR = ['annons_id', 'kampanj', 'marknad', 'andel', 'hook_rate', 'hold_rate', 'konv_lpv', 'vecka', 'uppgradering_fran', 'utford_som_briefad'];
const FALT_AGENT = ['andel', 'hook_rate', 'hold_rate', 'lpv', 'cvr', 'spend_ad', 'vecka', 'skrivet'];

// ─── läsarna (I/O) ─────────────────────────────────────────────────────────

/** Hämtar agent-grenens budgetlogg utan att checka ut den: fetch --depth 1 +
 *  git show. Skriver cachen. Går inte fetchen: cachen om den finns, annars fel. */
export function hamtaAgentlogg({ rot = ROT, gren, hamta = true, cachefil = CACHEFIL, kor = execFileSync } = {}) {
  const t0 = Date.now();
  const git = (...a) => kor('git', a, { cwd: rot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 });
  if (hamta) {
    try {
      git('fetch', '--depth', '1', 'origin', gren);
      const text = git('show', `origin/${gren}:agent/budgetlogg.jsonl`);
      mkdirSync(dirname(cachefil), { recursive: true });
      writeFileSync(cachefil, text);
      return { text, fran: 'fetch', ms: Date.now() - t0, fil: cachefil };
    } catch (fel) {
      if (existsSync(cachefil)) return { text: readFileSync(cachefil, 'utf8'), fran: 'cache efter misslyckad fetch', ms: Date.now() - t0, fil: cachefil, orsak: String(fel.message ?? fel).split('\n')[0] };
      throw new Error(`Agent-grenens logg gick inte att hämta och ingen cache finns (${cachefil}): ${String(fel.message ?? fel).split('\n')[0]}`);
    }
  }
  if (!existsSync(cachefil)) throw new Error(`--utan-fetch kräver cachen ${cachefil} — kör en gång utan flaggan först.`);
  return { text: readFileSync(cachefil, 'utf8'), fran: 'cache', ms: Date.now() - t0, fil: cachefil };
}

/** Standardläsarna. Testerna byter ut dem. */
export function standardLasare({ rot = ROT, gren, hamta = true } = {}) {
  return {
    matstrumpor: () => readFileSync(join(rot, 'matstrumpor', 'logg.jsonl'), 'utf8'),
    matstrumporKonfig: () => JSON.parse(readFileSync(join(rot, 'matstrumpor', 'konfig.json'), 'utf8')),
    agent: () => hamtaAgentlogg({ rot, gren, hamta }),
    varumarken: () => lasVarumarken(join(rot, 'stonebite', 'varumarken.json')),
    // De unga (fönstret inte komplett) står bara i Matstrumpors dom-json
    // (matstrumpor/output/dom-*.json → for_unga, gitignorerad). Agent-grenen
    // skriver dem inte till disk (bara `hoppade` i utskriften).
    unga: () => lasUngaMatstrumpor(join(rot, 'matstrumpor', 'output')),
  };
}

/** Unga annonser ur senaste dom-filen per marknad i matstrumpor/output. Finns
 *  mappen inte: { rader: [], orsak }. */
export function lasUngaMatstrumpor(mapp) {
  if (!existsSync(mapp)) return { rader: [], orsak: `${mapp} finns inte (gitignorerad — bara i en session som kört kor.mjs --dom)` };
  const filer = readdirSync(mapp).filter((f) => /^dom-\d{4}-\d{2}-\d{2}(-[A-Z]{2,3})?\.json$/.test(f)).sort();
  if (!filer.length) return { rader: [], orsak: `inga dom-*.json i ${mapp}` };
  const senastePerMarknad = new Map();
  for (const f of filer) senastePerMarknad.set((/-([A-Z]{2,3})\.json$/.exec(f) ?? [, 'SE'])[1], f);
  const rader = [];
  for (const [marknad, f] of senastePerMarknad) {
    try {
      const dom = JSON.parse(readFileSync(join(mapp, f), 'utf8'));
      for (const u of dom.for_unga ?? []) rader.push({ kalla: 'matstrumpor', verksamhet: 'matstrumpor', marknad, annons: u.namn, d0: u.d0 ?? null, until: u.until ?? null, dagar: u.dagar ?? null, skal: u.skal ?? null, datum: dom.datum ?? null, fil: f });
    } catch (fel) {
      return { rader, orsak: `${f}: ${fel.message}` };
    }
  }
  return { rader, orsak: null };
}

/**
 * Båda loggarna → enhetliga rader + vad som lästes.
 * Returnerar { rader, kallor: { matstrumpor, agent }, unga, varningar }.
 * `lasare` byter ut I/O (testerna). `gren` kommer annars ur konfig.json.
 */
export function lasKallor({ rot = ROT, gren, hamta = true, lasare, konfig } = {}) {
  const k = konfig ?? (existsSync(join(rot, 'redigerarrapport', 'konfig.json')) ? lasKonfig(join(rot, 'redigerarrapport', 'konfig.json')) : {});
  const grenen = gren ?? k.gren_agent;
  if (!grenen) throw new Error('Ingen gren för agent-loggen: ge `gren` eller sätt gren_agent i redigerarrapport/konfig.json');
  const grind = grindUr(k);
  const L = { ...standardLasare({ rot, gren: grenen, hamta }), ...(lasare ?? {}) };
  const varumarken = L.varumarken();
  const varningar = [];

  // (1) Matstrumpor
  const msKonfig = L.matstrumporKonfig();
  const msKonto = String(msKonfig?.meta?.ad_account_id ?? '');
  const msKampanj = msKonfig?.meta?.kampanj?.namn ?? null;
  if (!msKonto) varningar.push('matstrumpor/konfig.json saknar meta.ad_account_id — Matstrumpors rader får inget konto');
  const ms = tolkaJsonl(L.matstrumpor());
  const msRaa = ms.rader.filter((r) => ETIKETTKODER.includes(r.kod));
  const msRader = msRaa.map((r) => normaliseraMatstrumpor(r, { konto: msKonto, kampanjnamn: msKampanj, grind, varumarken }));
  if (ms.trasiga) varningar.push(`matstrumpor/logg.jsonl: ${ms.trasiga} rader gick inte att tolka`);

  // (2) agent-grenen
  const ag = L.agent();
  const agTolkad = tolkaJsonl(ag.text);
  const agRaa = agTolkad.rader.filter((r) => ETIKETTKODER.includes(r.kod));
  if (agTolkad.trasiga) varningar.push(`agent/budgetlogg.jsonl: ${agTolkad.trasiga} rader gick inte att tolka`);
  if (ag.orsak) varningar.push(`agent-loggen lästes ur cachen: ${ag.orsak}`);
  // Etiketten före en uppgraderingsrad: senaste raden för samma annons_id med lägre datum.
  const senastePerId = new Map();
  const agRader = [];
  for (const r of [...agRaa].sort((a, b) => String(a.datum).localeCompare(String(b.datum)))) {
    const tidigare = r.kod === 'ETIKETT_UPPGRADERAD' ? senastePerId.get(r.annons_id) ?? null : null;
    const rad = normaliseraAgent(r, { grind, varumarken, tidigare });
    agRader.push(rad);
    if (r.annons_id) senastePerId.set(r.annons_id, rad);
  }

  const rader = [...msRader, ...agRader];
  const utanVerksamhet = rader.filter((r) => !r.verksamhet);
  if (utanVerksamhet.length) varningar.push(`${utanVerksamhet.length} rader från konton som inte står i stonebite/varumarken.json: ${[...new Set(utanVerksamhet.map((r) => r.konto))].join(', ')}`);

  let unga;
  try { unga = L.unga(); } catch (fel) { unga = { rader: [], orsak: fel.message }; }

  return {
    rader,
    kallor: {
      matstrumpor: { rader: msRader.length, rader_i_loggen: ms.rader.length, saknas: saknadeFalt(msRaa, FALT_MATSTRUMPOR), konto: msKonto },
      agent: { rader: agRader.length, rader_i_loggen: agTolkad.rader.length, fran: ag.fran, ms: ag.ms, fil: ag.fil, gren: grenen, saknas: saknadeFalt(agRaa, FALT_AGENT), backfill: agRader.filter((r) => r.backfill).length, konton: raknaPer(agRader, 'konto') },
    },
    unga,
    grind,
    varningar,
  };
}

/** Bara raderna — det rapporten behöver i vardagen. */
export function lasEtiketter(opt = {}) {
  return lasKallor(opt).rader;
}

// ─── urval ────────────────────────────────────────────────────────────────

/** Högsta etiketten per annons (RANG ur matstrumpor/etikett.mjs). Map nyckel →
 *  rad, nyckeln är annonsnyckel(). Rader med etikett utanför RANG (INGEN_DATA)
 *  faller bort — de bär ingen dom. */
export function gallande(rader) {
  // gallandeEtiketter jämför på r.annons — ge den nyckeln och ta tillbaka raden.
  const med = (rader ?? []).map((rad) => ({ annons: annonsnyckel(rad), etikett: rad.etikett, rad }));
  const ut = new Map();
  for (const [nyckel, r] of gallandeEtiketter(med)) ut.set(nyckel, r.rad);
  return ut;
}

/**
 * Veckans rader: annonser vars första vecka slutade i veckan (vecka 1), plus
 * uppgraderingar skrivna i veckan (vecka 2–3), plus de unga (d0 inom veckan
 * men fönstret inte komplett vid veckans slut) när källan går att läsa.
 * `vecka` är "2026-W39" eller { fran, till }. Ren.
 */
export function veckansRader(rader, { vecka, unga = null } = {}) {
  const span = typeof vecka === 'string' ? veckansDatum(vecka) : { vecka: vecka?.vecka ?? veckaFor(vecka?.fran), fran: vecka?.fran, till: vecka?.till };
  if (!span.fran || !span.till) throw new Error('veckansRader kräver vecka "2026-W39" eller { fran, till }');
  const inom = (d) => d && d >= span.fran && d <= span.till;
  const alla = rader ?? [];
  const forsta = alla.filter((r) => r.vecka === 1 && inom(r.fonster_slut));
  const uppgraderingar = alla.filter((r) => r.uppgradering_fran && inom(String(r.skrivet ?? '').slice(0, 10)));
  const ungaRader = unga?.rader
    ? unga.rader.filter((u) => u.d0 && u.d0 <= span.till && plusDagar(u.d0, 6) > span.till)
    : null;
  return {
    ...span,
    forsta,
    uppgraderingar,
    rader: [...forsta, ...uppgraderingar],
    unga: ungaRader,
    unga_orsak: unga?.rader ? unga.orsak ?? null : 'ingen källa för unga annonser gavs',
  };
}

/** Antal per värde i ett fält. */
export function raknaPer(rader, falt) {
  const ut = {};
  for (const r of rader ?? []) { const v = r[falt] ?? '(saknas)'; ut[v] = (ut[v] ?? 0) + 1; }
  return ut;
}

/** Sammanställningen CLI:n skriver: per verksamhet × etikett, bedömbara (OCH),
 *  INGEN_LEVERANS, unga. Ren. */
export function sammanstall(veckan) {
  const per = {};
  for (const r of veckan.rader) {
    const v = (per[r.verksamhet ?? '(okänt konto)'] ??= { rader: 0, etiketter: {}, bedombara: 0, bedombara_rad: 0, ingen_leverans: 0, uppgraderingar: 0, unga: 0 });
    v.rader++;
    v.etiketter[r.etikett] = (v.etiketter[r.etikett] ?? 0) + 1;
    if (r.bedombar) v.bedombara++;
    if (r.bedombar_rad) v.bedombara_rad++;
    if (r.etikett === 'INGEN_LEVERANS') v.ingen_leverans++;
    if (r.uppgradering_fran) v.uppgraderingar++;
  }
  for (const u of veckan.unga ?? []) {
    const v = (per[u.verksamhet ?? '(okänt konto)'] ??= { rader: 0, etiketter: {}, bedombara: 0, bedombara_rad: 0, ingen_leverans: 0, uppgraderingar: 0, unga: 0 });
    v.unga++;
  }
  return per;
}

// ─── CLI ──────────────────────────────────────────────────────────────────

function arg(argv, namn) {
  const i = argv.indexOf(namn);
  return i >= 0 ? argv[i + 1] ?? null : null;
}

export function korCli(argv = process.argv.slice(2), { skriv = console.log, rot = ROT, lasare, konfig } = {}) {
  const vecka = arg(argv, '--vecka');
  if (!vecka) { skriv('Användning: node redigerarrapport/kallor.mjs --vecka 2026-W39 [--utan-fetch] [--json]'); return 2; }
  const hamta = !argv.includes('--utan-fetch');
  const k = lasKallor({ rot, hamta, lasare, konfig });
  const veckan = veckansRader(k.rader, { vecka, unga: k.unga });
  const per = sammanstall(veckan);
  if (argv.includes('--json')) { skriv(JSON.stringify({ vecka: veckan.vecka, fran: veckan.fran, till: veckan.till, kallor: k.kallor, grind: k.grind, per, unga_orsak: veckan.unga_orsak, varningar: k.varningar }, null, 2)); return 0; }
  skriv(`Källor: Matstrumpor ${k.kallor.matstrumpor.rader} ETIKETT-rader (${k.kallor.matstrumpor.rader_i_loggen} rader i loggen) · agent ${k.kallor.agent.rader} ETIKETT-rader (${k.kallor.agent.rader_i_loggen} rader, ${k.kallor.agent.fran}, ${k.kallor.agent.ms} ms, gren ${k.kallor.agent.gren})`);
  skriv(`Grinden bedömbar: spend ≥ ${k.grind.spend_sek} kr OCH köp ≥ ${k.grind.kop} (loggens eget värde i bedombar_rad)`);
  skriv(`Fält som saknas — Matstrumpor: ${JSON.stringify(k.kallor.matstrumpor.saknas)} · agent: ${JSON.stringify(k.kallor.agent.saknas)} (backfill ${k.kallor.agent.backfill} av ${k.kallor.agent.rader})`);
  for (const v of k.varningar) skriv(`⚠️ ${v}`);
  skriv('');
  skriv(`Vecka ${veckan.vecka} (${veckan.fran}..${veckan.till}): ${veckan.forsta.length} annonser med första veckan slut i veckan, ${veckan.uppgraderingar.length} uppgraderingar skrivna i veckan`);
  for (const [verksamhet, v] of Object.entries(per).sort()) {
    const etik = Object.entries(v.etiketter).sort((a, b) => b[1] - a[1]).map(([e, n]) => `${e} ${n}`).join(' · ');
    skriv(`  ${verksamhet.padEnd(14)} ${String(v.rader).padStart(4)} rader — ${etik || 'inga'}  | bedömbara (OCH) ${v.bedombara}${v.bedombara_rad !== v.bedombara ? ` (loggens egen flagga ${v.bedombara_rad})` : ''} · INGEN_LEVERANS ${v.ingen_leverans} · uppgraderingar ${v.uppgraderingar} · unga ${v.unga}`);
  }
  skriv(veckan.unga ? `Unga (fönstret inte komplett ${veckan.till}): ${veckan.unga.length}${veckan.unga_orsak ? ` — ${veckan.unga_orsak}` : ''}` : `Unga: går inte att läsa — ${veckan.unga_orsak}`);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exitCode = korCli();
}
