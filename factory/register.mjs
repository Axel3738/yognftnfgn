// OPS-registret: uppslagningen butik → produkt → läge → annonskonto → prefix →
// ekonomi → redigerare → kördag. Noll beroenden.
//
//   node factory/register.mjs                       → hela registret
//   node factory/register.mjs <butik|produkt>        → en post, med ekonomi och kördag
//   node factory/register.mjs --idag 2026-09-12      → vilka butiker som är kördag
//   node factory/register.mjs skriv-in               → persistera nya poster i register.json
//   node factory/register.mjs log <butik> <antal> [YYYY-MM-DD]   → logga launchade creatives
//
// ⚠️ REGISTRET ÄR INTE EN HANDSKRIVEN LISTA.
// Identiteten UPPTÄCKS varje körning ur filerna som redan finns:
//   factory/butiker/*.yaml    → butikens id, brand, valuta
//   factory/produkter/*.yaml  → produktens id, pris, inköp, creative_prefix, konto
//   factory/state/<butik>--<produkt>.json → beviset att butiken FAKTISKT är byggd
//   products/products.json    → Bäverbutikens produkter, som är läge TEST
// En ny OPS-butik dyker alltså upp i registret av sig själv i samma sekund som
// ops.mjs skrivit sin första state-fil. Bygger man i stället en lista för hand
// missas nya butiker TYST — det är samma fälla som CLAUDE.md beskriver för
// rutiner som hårdkodar produkter.
//
// factory/produkter/register.json bär bara DRIFTLÄGET: läge, redigerare,
// Notion-hub, kördagsoffset, senaste körning, cykelstart, launches. Aldrig
// ekonomi. Står ett break-even-tal på två ställen hinner de bli olika, och då
// dömer nästa körning mot fel linje. Ett test vaktar det.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { sammanfoga } from './butik.mjs';
import { ekonomiForProdukt, linjetext } from './ekonomi.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const REGISTERFIL = join(ROT, 'factory', 'produkter', 'register.json');

// Det gemensamma OPS-kontot (samma konstant som meta-setup.mjs och kontroll.mjs).
export const OPS_ANNONSKONTO = '915422744950975';
// Bäverbutikens konto. Läge TEST läser det — men bara LÄSER. Namnen
// "MagiBorsten" och "MagiBorsten DK" är nästan identiska och kontona är
// olika verksamheter, så varje post kontrolleras mot sitt läge.
export const BAVERBUTIKEN_ANNONSKONTO = '1867947880635861';

export const CYKEL_DAGAR = 3;

// Tröskeln för startskottet. ⚠️ Talen är INTE påhittade här: de är avlästa ur
// den körande Skalningskungen-rutinen (agent/rond.mjs på grenen
// claude/daily-agent-discussion-uos5df, 2026-09-09) där de heter
// FORSTA_BATCH_SPEND_SEK och FORSTA_BATCH_VINST_PROCENT.
// ⚠️ Nivån är ett ÖPPET ägarbeslut: TRAPPAN.md "Öppna beslut" punkt 1 och
// SKALNINGSKUNGEN-PLAN.md steg 2 varnar för att sätta den för högt, eftersom
// en generalbutik konverterar sämre per produkt än en fokuserad OPS-butik.
// Tills Axel svarat körs samma nivå som i dag, och rapporten säger det.
export const TROSKEL = Object.freeze({
  spend_sek: 1500,
  vinst_procent: 20,
  kalla: 'agent/rond.mjs (grenen claude/daily-agent-discussion-uos5df), avläst 2026-09-09',
  beslut: 'Nivån är oförändrad tills Axel svarat — TRAPPAN.md Öppna beslut punkt 1.',
});

const normalisera = (v) => String(v ?? '').trim().toLowerCase();
const finns = (v) => typeof v === 'string' && v.trim() !== '';

// ------------------------------------------------------------- upptäckten

/** Läser en katalog och returnerar filnamnen med en viss ändelse. Tom vid saknad katalog. */
function filerI(katalog, andelse) {
  if (!existsSync(katalog)) return [];
  return readdirSync(katalog).filter((f) => f.endsWith(andelse)).sort();
}

/**
 * Parar ihop butiker och produkter. REN funktion — ingen fs, inget nätverk.
 *
 * Kopplingen görs i två steg, i den här ordningen:
 *   1. state-nycklarna `<butik>--<produkt>` — beviset att ops.mjs faktiskt
 *      byggt paret. Det är den enda källan som säger att butiken finns på
 *      riktigt, och därför den som får bestämma.
 *   2. brandnamnet i produktfilen mot brandnamnet i butiksfilen — reserv för
 *      en produkt som är konfigurerad men ännu inte byggd.
 *
 * @param {object} inpar
 * @param {Array}  inpar.butiker   [{ id, brand, fil, valuta }]
 * @param {Array}  inpar.produkter [{ id, brand, fil, … }]
 * @param {Array}  inpar.statenycklar ['drytrek--damasker', 'tacklebay--_butik', …]
 * @returns {Array} [{ butik, produkt, byggd, kalla }]
 */
export function paraIhop({ butiker = [], produkter = [], statenycklar = [] } = {}) {
  const parUrState = new Map(); // produkt-id → butiks-id
  for (const nyckel of statenycklar) {
    const [butiksId, produktId] = String(nyckel).split('--');
    if (!butiksId || !produktId || produktId === '_butik') continue;
    parUrState.set(normalisera(produktId), normalisera(butiksId));
  }

  const butikPaId = new Map(butiker.map((b) => [normalisera(b.id), b]));
  const butikPaBrand = new Map(butiker.map((b) => [normalisera(b.brand), b]));

  const par = [];
  for (const p of produkter) {
    const viaState = parUrState.get(normalisera(p.id));
    const butik = viaState ? butikPaId.get(viaState) : butikPaBrand.get(normalisera(p.brand));
    if (!butik) continue; // produkt utan butik — hör inte hemma i registret
    par.push({
      butik,
      produkt: p,
      byggd: Boolean(viaState),
      kalla: viaState ? 'state' : 'brand',
    });
  }
  return par;
}

/** Läser factory/butiker/*.yaml, factory/produkter/*.yaml och factory/state/. */
export function upptackOps(rot = ROT) {
  const butiksfiler = filerI(join(rot, 'factory', 'butiker'), '.yaml');
  const produktfiler = filerI(join(rot, 'factory', 'produkter'), '.yaml');
  const statenycklar = filerI(join(rot, 'factory', 'state'), '.json').map((f) => f.replace(/\.json$/, ''));

  const butiker = butiksfiler.map((f) => {
    const y = lasYaml(readFileSync(join(rot, 'factory', 'butiker', f), 'utf8'));
    return {
      id: y?.butik?.id ?? f.replace(/\.yaml$/, ''),
      brand: y?.butik?.brand ?? '',
      valuta: y?.butik?.valuta ?? 'SEK',
      fil: `factory/butiker/${f}`,
      ra: y,
    };
  });

  const produkter = produktfiler.map((f) => {
    const y = lasYaml(readFileSync(join(rot, 'factory', 'produkter', f), 'utf8'));
    return {
      id: y?.produkt?.id ?? f.replace(/\.yaml$/, ''),
      namn: y?.produkt?.namn ?? '',
      brand: y?.brand?.namn ?? '',
      annonsprefix: y?.meta?.creative_prefix ?? '',
      ad_account_id: String(y?.meta?.ad_account_id ?? ''),
      daily_budget_sek: y?.meta?.testbudget_per_dag ?? null,
      handle: y?.produkt?.handle ?? '',
      fil: `factory/produkter/${f}`,
      ra: y,
    };
  });

  const par = paraIhop({ butiker, produkter, statenycklar });

  // Hur många produkter butiken bär avgör om brandnamnet duger som filter.
  const antalPerButik = new Map();
  for (const { butik } of par) antalPerButik.set(butik.id, (antalPerButik.get(butik.id) ?? 0) + 1);

  return par.map(({ butik, produkt, byggd, kalla }) => ({
    nyckel: `${butik.id}/${produkt.id}`,
    lage: 'skala',
    id: produkt.id,
    butik: butik.id,
    brand: butik.brand,
    namn: produkt.namn || `${produkt.id} (${butik.brand})`,
    produktfil: produkt.fil,
    butiksfil: butik.fil,
    ad_account_id: produkt.ad_account_id || OPS_ANNONSKONTO,
    annonsprefix: produkt.annonsprefix,
    // Kampanjnamnen följer docs/naming-convention.md: {BRAND}_{OBJECTIVE}_{DATUM}.
    // Prefixet härleds därför ur annonsprefixet — aldrig handskrivet, och per
    // PRODUKT, aldrig per brand (FLERPRODUKT.md fällan 1).
    kampanjprefix: produkt.annonsprefix ? `${produkt.annonsprefix.replace(/_$/, '').toUpperCase()}_` : '',
    // Brandnamnet duger som filter bara i en enproduktsbutik. I en
    // flerproduktsbutik matchar brandet båda produkternas annonser, och då
    // rangordnas grannens creatives mot den här produktens break-even.
    enprodukt: (antalPerButik.get(butik.id) ?? 0) === 1,
    daily_budget_sek: produkt.daily_budget_sek,
    byggd,
    kopplingskalla: kalla,
    valuta: butik.valuta,
  }));
}

/** Läser Bäverbutikens produkter ur products/products.json — de är läge TEST. */
export function upptackTest(rot = ROT) {
  const fil = join(rot, 'products', 'products.json');
  if (!existsSync(fil)) return [];
  const db = JSON.parse(readFileSync(fil, 'utf8'));
  return (db.products ?? [])
    .filter((p) => p.status === 'aktiv')
    .map((p) => ({
      nyckel: `baverbutiken/${p.id}`,
      lage: 'test',
      id: p.id,
      butik: 'baverbutiken',
      brand: 'Bäverbutiken',
      namn: p.name ?? p.id,
      produktfil: 'products/products.json',
      butiksfil: null,
      ad_account_id: String(p.ad_account_id ?? BAVERBUTIKEN_ANNONSKONTO),
      annonsprefix: p.creative_prefix ?? '',
      kampanjprefix: '',
      enprodukt: false,
      daily_budget_sek: p.daily_budget_sek ?? null,
      byggd: true,
      kopplingskalla: 'products.json',
      valuta: 'SEK',
      // Bäverbutikens linjer är Axels egen COGS-beräkning 2026-08-05 och
      // ligger i products.json. De räknas INTE om av factory/ekonomi.mjs —
      // verksamheten är en annan och talen är redan verifierade.
      linjer_ur_products_json: {
        breakEvenRoas: p.break_even_roas ?? null,
        breakEvenCpa: p.break_even_cpa_sek ?? null,
        targetRoas: p.target_roas_25pct ?? null,
        targetCpa: p.target_cpa_sek ?? null,
        aov: p.aov_sek ?? null,
      },
      notion: p.notion ?? null,
    }));
}

// --------------------------------------------------------------- driftläget

export function lasDrift() {
  if (!existsSync(REGISTERFIL)) return { poster: {} };
  return JSON.parse(readFileSync(REGISTERFIL, 'utf8'));
}

/**
 * Kördagsoffset 0–2: vilken av tre dagar butiken kör.
 * Väljs som den MINST använda offseten, lägst nummer vid lika. Det ger en
 * jämn spridning över dygnen utan slump, och en butik som redan fått sin
 * offset behåller den — så ingen befintlig butik flyttas när en ny tillkommer.
 */
export function nastaOffset(anvanda = []) {
  const antal = [0, 0, 0];
  for (const o of anvanda) if (Number.isInteger(o) && o >= 0 && o < CYKEL_DAGAR) antal[o] += 1;
  let bast = 0;
  for (let i = 1; i < CYKEL_DAGAR; i += 1) if (antal[i] < antal[bast]) bast = i;
  return bast;
}

/** Dagnummer sedan 1970-01-01 för ett YYYY-MM-DD. Ingen klocka läses här. */
export function dagnummer(datum) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(datum ?? ''));
  if (!m) throw new Error(`Ogiltigt datum: ${datum} (använd YYYY-MM-DD)`);
  return Math.floor(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86400000);
}

const tillDatum = (n) => new Date(n * 86400000).toISOString().slice(0, 10);

/**
 * Är dagens datum kördag för posten? REN funktion.
 *
 * Tre vägar in, i den ordningen:
 *   1. Butiken har aldrig körts → kör i dag. En ny butik ska inte vänta
 *      upp till två dygn på sin plats i cykeln.
 *   2. Det är butikens dag i tredagarscykeln (dagnummer % 3 === offset).
 *   3. Det har gått ≥3 dygn sedan senaste körningen → kör ändå.
 *      Fångsten finns för att en butik aldrig ska svälta om en körning
 *      missas eller om offseten ändras.
 */
export function arKordag(post, idag) {
  const dag = dagnummer(idag);
  const offset = Number.isInteger(post?.kordag_offset) ? post.kordag_offset : 0;
  const senaste = finns(post?.senaste_korning) ? dagnummer(post.senaste_korning) : null;
  const dagarSedan = senaste === null ? null : dag - senaste;

  let nasta = dag;
  while (nasta % CYKEL_DAGAR !== offset) nasta += 1;
  if (nasta === dag) nasta = dag + CYKEL_DAGAR;

  if (senaste === null) {
    return { kordag: true, skal: 'butiken har aldrig körts — första ronden körs i dag', dagarSedan: null, offset, nastaKordag: tillDatum(nasta) };
  }
  if (dag % CYKEL_DAGAR === offset) {
    return { kordag: true, skal: `butikens dag i cykeln (offset ${offset})`, dagarSedan, offset, nastaKordag: tillDatum(nasta) };
  }
  if (dagarSedan >= CYKEL_DAGAR) {
    return { kordag: true, skal: `${dagarSedan} dygn sedan senaste ronden — ikappkörning`, dagarSedan, offset, nastaKordag: tillDatum(nasta) };
  }
  return { kordag: false, skal: `inte butikens dag (offset ${offset}), ${dagarSedan} dygn sedan senaste ronden`, dagarSedan, offset, nastaKordag: tillDatum(nasta) };
}

/**
 * Väver ihop upptäckta poster med driftläget. REN funktion — testerna matar
 * in listorna direkt, utan fs.
 *
 * Poster utan driftrad får sin offset tilldelad här (deterministiskt, i
 * nyckelordning) och märks `ny_i_registret`. Registret fungerar alltså direkt
 * efter ett bygge; `skriv-in` gör bara tilldelningen permanent.
 */
export function byggRegister({ upptackta = [], drift = { poster: {} } } = {}) {
  const poster = drift.poster ?? {};
  const anvanda = Object.values(poster).map((d) => d?.kordag_offset).filter(Number.isInteger);

  // En OPS-butik kommer in i registret när den är BYGGD — alltså när ops.mjs
  // skrivit en state-fil för paret. En butik som bara är konfigurerad har
  // inga annonser att läsa, och testfixturen (testbutiken/nackmagneten) ska
  // aldrig bli en riktig post. Kravet står i uppdraget: "in i registret
  // automatiskt när den byggts".
  const ejByggda = upptackta.filter((p) => p.byggd === false).map((p) => p.nyckel).sort();

  const ut = [];
  const nya = upptackta.filter((p) => p.byggd !== false).sort((a, b) => a.nyckel.localeCompare(b.nyckel));
  for (const post of nya) {
    const d = poster[post.nyckel] ?? null;
    let offset = Number.isInteger(d?.kordag_offset) ? d.kordag_offset : null;
    if (offset === null) {
      offset = nastaOffset(anvanda);
      anvanda.push(offset);
    }
    ut.push({
      ...post,
      // Driftläget får ändra läget (t.ex. en testprodukt som fått egen butik
      // och ska sluta bevakas), men aldrig identiteten.
      lage: d?.lage ?? post.lage,
      redigerare: d?.redigerare ?? null,
      notion: d?.notion ?? post.notion ?? null,
      kordag_offset: offset,
      senaste_korning: d?.senaste_korning ?? '',
      cycle_start: d?.cycle_start ?? '',
      launches: Array.isArray(d?.launches) ? d.launches : [],
      troskel: { ...TROSKEL, ...(d?.troskel ?? {}) },
      anteckning: d?.anteckning ?? '',
      ny_i_registret: d === null,
    });
  }
  return {
    ops_annonskonto: OPS_ANNONSKONTO,
    produkter: ut.filter((p) => p.lage !== 'avslutad'),
    // Konfigurerade men ännu inte byggda par. Redovisas, aldrig körda.
    ej_byggda: ejByggda,
  };
}

/** Hela registret: upptäckt + drift. */
export function lasRegister(rot = ROT) {
  return byggRegister({ upptackta: [...upptackOps(rot), ...upptackTest(rot)], drift: lasDrift() });
}

// ------------------------------------------------------------- uppslagning

/** Slår upp en post på nyckel, produkt-id, butiks-id eller brandnamn. */
export function hittaPost(nyckel, register = lasRegister()) {
  const n = normalisera(nyckel);
  const traffar = register.produkter.filter(
    (p) => normalisera(p.nyckel) === n
      || normalisera(p.id) === n
      || normalisera(p.butik) === n
      || normalisera(p.brand) === n
  );
  if (traffar.length === 0) {
    const lista = register.produkter.map((p) => `${p.nyckel} (${p.brand}, läge ${p.lage})`).join(', ');
    throw new Error(`Okänd butik/produkt: "${nyckel}". Registret innehåller: ${lista || '(tomt)'}`);
  }
  if (traffar.length > 1) {
    // En flerproduktsbutik slås upp på butiks-id och ger två träffar. Gissa
    // aldrig vilken — en rond mot fel produkt dömer mot fel break-even.
    throw new Error(
      `"${nyckel}" matchar ${traffar.length} poster: ${traffar.map((p) => p.nyckel).join(', ')}. `
      + 'Ange produktens nyckel (butik/produkt) i stället.'
    );
  }
  return traffar[0];
}

/**
 * Spärren mot fel annonskonto. Läges-medveten:
 *   läge skala → MÅSTE vara OPS-kontot. Bäverbutikens konto nekas alltid.
 *   läge test  → MÅSTE vara Bäverbutikens konto, och läses bara.
 * Kastar hellre än att gissa — fel konto kostar riktiga pengar.
 */
export function sakerstallKonto(post) {
  const konto = String(post?.ad_account_id ?? '');
  const lage = post?.lage ?? 'skala';
  if (lage === 'test') {
    if (konto !== BAVERBUTIKEN_ANNONSKONTO) {
      throw new Error(
        `STOPP: ${post.nyckel} står i läge TEST men pekar på konto ${konto || '(tomt)'}. `
        + `Läge TEST läser Bäverbutiken ${BAVERBUTIKEN_ANNONSKONTO}.`
      );
    }
    return konto;
  }
  if (konto === BAVERBUTIKEN_ANNONSKONTO) {
    throw new Error(
      `STOPP: ${post.nyckel} pekar på Bäverbutikens konto ${konto}. OPS-butiker kör på ${OPS_ANNONSKONTO}.`
    );
  }
  if (konto !== OPS_ANNONSKONTO) {
    throw new Error(
      `STOPP: ${post.nyckel} pekar på annonskonto ${konto || '(tomt)'}, men OPS-kontot är ${OPS_ANNONSKONTO}.`
    );
  }
  return konto;
}

/** Bakåtkompatibelt namn: samma spärr, men bara för läge skala. */
export const sakerstallOpsKonto = (post) => sakerstallKonto({ ...post, lage: 'skala' });

/**
 * Prefixen som en läsning av det DELADE kontot ska filtreras på.
 * Kontot bär alla OPS-butiker plus Bäverbutikens danska kampanjer, så utan
 * filter läser en skalningsrond en annan verksamhets annonser.
 */
export function prefixFor(post) {
  const ut = new Set();
  for (const p of [post?.kampanjprefix, post?.annonsprefix]) {
    if (finns(p)) ut.add(p.trim().toLowerCase());
  }
  // Brandnamnet bara i en enproduktsbutik — se `enprodukt` i upptackOps.
  if (post?.enprodukt && finns(post?.brand)) ut.add(post.brand.trim().toLowerCase());
  if (ut.size === 0) {
    throw new Error(`${post?.nyckel ?? post?.butik}: inget annonsprefix — kan inte filtrera kontot. Sätt meta.creative_prefix i produktfilen.`);
  }
  return [...ut];
}

// Tecken som räknas som ordgräns efter ett prefix i ett kampanj- eller
// annonsnamn. Namnkonventionen skiljer fält med `_`; kontot innehåller även
// mellanslag, bindestreck och `|`.
const ORDGRANS = /[_\-\s|.:/]/;

/**
 * true om namnet BÖRJAR med något av postens prefix (skiftlägesokänsligt)
 * OCH prefixet slutar vid en ordgräns.
 *
 * ⚠️ Ordgränsen är inte kosmetisk. Utan den matchar "Heim" varje annons som
 * tillhör "HeimGuard", och alla OPS-butiker delar konto — en butik hade då
 * rangordnat en grannbutiks annonser mot sin egen break-even. Prefixen ur
 * registret slutar ofta på `_`; brandnamnet gör det aldrig, och det är just
 * brandnamnet som är den farliga matchningen.
 */
export function tillhorButiken(namn, prefix) {
  const n = normalisera(namn);
  if (!n) return false;
  return prefix.some((p) => {
    if (!n.startsWith(p)) return false;
    if (n.length === p.length) return true;              // exakt namn
    if (ORDGRANS.test(p.slice(-1))) return true;         // prefixet bär sin egen gräns (…_)
    return ORDGRANS.test(n[p.length]);                   // annars måste nästa tecken vara en gräns
  });
}

/**
 * Prefixen, eller null med ett skäl. Används där ett saknat prefix ska
 * RAPPORTERAS i stället för att stoppa hela ronden — t.ex. Bäverbutikens
 * testprodukter, av vilka två (ai-glasogon, vaggfastet) saknar
 * `creative_prefix` i products.json (avläst 2026-09-09).
 */
export function prefixEllerSkal(post) {
  try {
    return { prefix: prefixFor(post), skal: null };
  } catch (e) {
    return { prefix: null, skal: e.message };
  }
}

/** Hela bilden av en post: register + butikskonfig + produktfil + ekonomi. */
export function laddaButik(nyckel, register = lasRegister()) {
  const post = hittaPost(nyckel, register);
  // Kontospärren körs vid VARJE uppslagning, inte bara före ett Meta-anrop.
  // En post med fel konto får aldrig hinna bli en tabell någon läser.
  sakerstallKonto(post);
  const { prefix, skal: prefixfel } = prefixEllerSkal(post);

  if (post.lage === 'test') {
    // Bäverbutikens linjer räknas inte om — de är Axels COGS-beräkning och
    // hör till en annan verksamhet. Formen görs bara lik OPS-ekonomin så
    // rapportkoden slipper två vägar.
    const l = post.linjer_ur_products_json ?? {};
    return {
      post,
      butik: null,
      produkt: null,
      prefix,
      prefixfel,
      ekonomi: {
        osaker: false,
        antagande: 'baverbutiken',
        oppetBeslut: false,
        beslutstext: 'Bäverbutiken säljer utan moms (Axels besked 2026-08-29). Talen är hans COGS-beräkning 2026-08-05 och räknas inte om här.',
        brutto: l.aov,
        breakEvenRoas: l.breakEvenRoas,
        breakEvenCpa: l.breakEvenCpa,
        targetRoas: l.targetRoas,
        targetCpa: l.targetCpa,
        utanMoms: { ...l, momsProcent: 0, olonsam: false },
        medMoms: null,
        antagen: { ...l, momsProcent: 0, olonsam: false },
        spann: { breakEvenCpa: [l.breakEvenCpa, l.breakEvenCpa], breakEvenRoas: [l.breakEvenRoas, l.breakEvenRoas] },
      },
    };
  }

  const butik = lasYaml(readFileSync(join(ROT, post.butiksfil), 'utf8'));
  const raProdukt = lasYaml(readFileSync(join(ROT, post.produktfil), 'utf8'));
  const produkt = sammanfoga(butik, raProdukt);
  return { post, butik, produkt, ekonomi: ekonomiForProdukt(produkt), prefix, prefixfel };
}

/** Redigeraren för butiken — eller null. Hittar aldrig på en person. */
export function redigerareFor(post) {
  return finns(post?.redigerare) ? post.redigerare : null;
}

// ------------------------------------------------------------- skrivningar

function skrivDrift(drift) {
  writeFileSync(REGISTERFIL, `${JSON.stringify(drift, null, 2)}\n`);
}

/** Skriver in de poster som saknas i register.json, med sin tilldelade offset. */
export function skrivInNya(rot = ROT) {
  const drift = lasDrift();
  drift.poster = drift.poster ?? {};
  const register = lasRegister(rot);
  const tillagda = [];
  for (const p of register.produkter) {
    if (drift.poster[p.nyckel]) continue;
    drift.poster[p.nyckel] = {
      lage: p.lage,
      redigerare: null,
      notion: p.notion ?? { name: '', database_id: '' },
      kordag_offset: p.kordag_offset,
      senaste_korning: '',
      cycle_start: '',
      launches: [],
      anteckning: `Upptäckt automatiskt ur ${p.kopplingskalla === 'state' ? 'state-filen' : p.kopplingskalla}.`,
    };
    tillagda.push(p.nyckel);
  }
  if (tillagda.length) skrivDrift(drift);
  return tillagda;
}

/** Stämplar en genomförd rond. Utan den kan ikappkörningen inte veta något. */
export function loggaKorning(nyckel, datum) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(datum ?? ''))) throw new Error(`Ogiltigt datum: ${datum} (använd YYYY-MM-DD)`);
  const post = hittaPost(nyckel);
  const drift = lasDrift();
  drift.poster = drift.poster ?? {};
  const rad = drift.poster[post.nyckel] ?? { kordag_offset: post.kordag_offset, launches: [] };
  rad.senaste_korning = datum;
  rad.lage = rad.lage ?? post.lage;
  drift.poster[post.nyckel] = rad;
  skrivDrift(drift);
  return { ...post, senaste_korning: datum };
}

/** Loggar launchade creatives (motsvarigheten till pipeline/quota.mjs log). */
export function loggaLaunch(nyckel, antal, datum) {
  if (!Number.isFinite(antal) || antal <= 0) throw new Error('Ange antal launchade creatives som ett tal > 0.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(datum ?? ''))) throw new Error(`Ogiltigt datum: ${datum} (använd YYYY-MM-DD)`);
  const post = hittaPost(nyckel);
  const drift = lasDrift();
  drift.poster = drift.poster ?? {};
  const rad = drift.poster[post.nyckel] ?? { kordag_offset: post.kordag_offset, launches: [] };
  rad.launches = Array.isArray(rad.launches) ? rad.launches : [];
  rad.launches.push({ date: datum, count: antal });
  // Första loggningen startar cykeln — annars räknas kvoten från ett tomt fält.
  if (!finns(rad.cycle_start)) rad.cycle_start = datum;
  drift.poster[post.nyckel] = rad;
  skrivDrift(drift);
  return { ...post, launches: rad.launches, cycle_start: rad.cycle_start };
}

// ------------------------------------------------------------------- CLI

function skrivPost(post, idag) {
  const kord = arKordag(post, idag);
  console.log(`\n${post.namn}  ·  ${post.nyckel}  ·  LÄGE ${post.lage.toUpperCase()}`);
  console.log(`  Annonskonto:  ${post.ad_account_id}${post.lage === 'test' ? ' (Bäverbutiken — LÄSES bara)' : ' (delat OPS-konto, filtrera på prefix)'}`);
  const { prefix, skal } = prefixEllerSkal(post);
  console.log(`  Prefixfilter: ${prefix ? prefix.join(' · ') : `❌ ${skal}`}`);
  console.log(`  Redigerare:   ${redigerareFor(post) ?? 'ingen redigerare tilldelad'}`);
  console.log(`  Dagsbudget:   ${post.daily_budget_sek ? `${post.daily_budget_sek} kr` : 'oklart — saknas i konfigen'}`);
  console.log(`  Kördag ${idag}: ${kord.kordag ? '✅ JA' : '⏭️  nej'} — ${kord.skal}. Nästa: ${kord.nastaKordag}`);
  if (post.ny_i_registret) console.log('  ⚠️ Ny i registret — kör `node factory/register.mjs skriv-in` för att låsa kördagen.');
  if (post.lage !== 'test') {
    const { ekonomi } = laddaButik(post.nyckel, { produkter: [post] });
    for (const rad of linjetext(ekonomi)) console.log(rad);
  } else {
    const l = post.linjer_ur_products_json ?? {};
    console.log(`  Bäverbutiken:    break-even ROAS ${l.breakEvenRoas ?? '—'} · CPA ${l.breakEvenCpa ?? '—'} kr (Axels COGS-beräkning 2026-08-05, utan moms)`);
  }
}

function huvud() {
  const arg = process.argv.slice(2);
  const flagga = (namn, standard = null) => {
    const i = arg.indexOf(`--${namn}`);
    return i >= 0 && arg[i + 1] ? arg[i + 1] : standard;
  };
  const idag = flagga('idag', new Date().toISOString().slice(0, 10));

  if (arg[0] === 'skriv-in') {
    const tillagda = skrivInNya();
    console.log(tillagda.length ? `Skrev in ${tillagda.length} nya poster: ${tillagda.join(', ')}` : 'Inga nya poster — registret är i takt.');
    return;
  }
  if (arg[0] === 'log') {
    const post = loggaLaunch(arg[1], Number(arg[2]), arg[3] ?? idag);
    console.log(`Loggat: ${arg[2]} creatives på ${post.namn} (${post.launches.at(-1).date})`);
    return;
  }

  const register = lasRegister();
  const nyckel = arg.find((a) => !a.startsWith('--') && a !== idag);
  if (nyckel) {
    skrivPost(hittaPost(nyckel, register), idag);
    console.log('');
    return;
  }
  console.log(`\nOPS-REGISTRET ${idag} — ${register.produkter.length} poster (upptäckta ur yaml + state + products.json)\n`);
  const kordag = register.produkter.filter((p) => arKordag(p, idag).kordag);
  console.log(`Kördag i dag: ${kordag.length ? kordag.map((p) => p.nyckel).join(', ') : 'ingen'}`);
  for (const p of register.produkter) skrivPost(p, idag);
  console.log('');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    huvud();
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }
}
