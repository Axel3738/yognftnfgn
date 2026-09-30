#!/usr/bin/env node
/* ==========================================================================
   ordrar.mjs — ordrarna för ett A/B-test i Matstrumpors tema, direkt ur
   Admin GraphQL (appen Fabriken via sparning/butik.mjs). Ingen Shopify-MCP,
   ingen ShopifyQL. LÄS-BART: bara queries, aldrig mutations.

     node matstrumpor/ab/ordrar.mjs --test sortval --sedan 2026-09-18T07:31:00Z \
       --till 2026-09-29T00:00:00Z \
       --koder "a=SUSHI-*,PIZZA-*,HAMBURGARE-*,DONUT-*;b=STRUMPOR-K1F1-P*,STRUMPOR-K2F2-P*"

   Argument
     --test <id>        obligatoriskt — testets id i temat (ms_ab_tests)
     --sedan <när>      obligatoriskt — ISO-tid ("2026-09-18T07:31:00Z") eller
                        ordernummer ("#4786" = från och med den orderns tid)
     --till <när>       samma former; utelämnad = nu. Båda gränserna inkluderande.
     --koder <regler>   reserv när stämpeln saknas: "a=SUSHI-*,PIZZA-*;b=STRUMPOR-K1F1-P*"
                        (* = vad som helst; en kod som matchar BÅDA varianterna ger okänd)
     --ut <fil.json>    standard matstrumpor/ab/output/<id>-<datum>.json (gitignorerad)
     --json             sammanfattningen som JSON på stdout i stället för text

   Varför klockslaget filtreras här och inte i Shopify: Shopifys ordersökning
   `created_at:>=2026-09-18T07:31:00Z` gav `#4785` (05:49:36Z) tillbaka —
   mätt 2026-09-30. Sökningen tar bara datumet. Därför hämtas dygnen runt
   fönstret och varje order prövas mot createdAt på klientsidan.

   Filen som skrivs är den form analys.mjs --ordrar läser:
     [{ name, totalPrice, attributes: { "AB <id>": "a" }, … }]
   Den bär fönstrets alla icke-annullerade ordrar (även okända och tvingade,
   med sina attribut) så analys.mjs gör sina egna uteslutningar synligt.
   Varianten ur rabattkoden skrivs in som attribut med `kalla: "kod"`, så
   analys.mjs räknar den — hitta aldrig på en variant utan kod eller stämpel.

   Inga kundnamn, inga e-postadresser, inga adresser hämtas eller skrivs.
   ========================================================================== */

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const BUTIK_ID = 'matstrumpor';
export const BUTIK_DOMAN = 'matstrumpor.se';
export const UT_MAPP = join(ROT, 'output');

/* --- argument ------------------------------------------------------------ */

export function tolkaArgs(argv) {
  const ut = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const nyckel = a.slice(2);
      const nasta = argv[i + 1];
      if (nasta === undefined || nasta.startsWith('--')) ut[nyckel] = true;
      else { ut[nyckel] = nasta; i++; }
    } else ut._.push(a);
  }
  return ut;
}

/* --- tid och fönster ----------------------------------------------------- */

/** "#4786" ⇒ { ordernummer: "#4786" }, ISO ⇒ { tid: Date }. Kastar på skräp. */
export function tolkaNar(s) {
  const t = String(s ?? '').trim();
  if (!t) throw new Error('tomt tidsargument');
  if (/^#\d+$/.test(t)) return { ordernummer: t };
  if (/^\d+$/.test(t)) return { ordernummer: '#' + t };
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) throw new Error(`"${t}" är varken ett ISO-datum eller ett ordernummer (#NNNN)`);
  return { tid: d };
}

/** Är ordern lagd inom [sedan, till]? Båda inkluderande. */
export function iFonster(order, sedan, till) {
  const t = new Date(order.createdAt).getTime();
  if (Number.isNaN(t)) return false;
  if (sedan && t < sedan.getTime()) return false;
  if (till && t > till.getTime()) return false;
  return true;
}

/* --- rabattkoder som reserv ---------------------------------------------- */

/** "SUSHI-*" ⇒ /^SUSHI-.*$/i. Bara * är specialtecken. */
export function monsterTillRegex(monster) {
  const esc = String(monster).trim().replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${esc}$`, 'i');
}

/** "a=SUSHI-*,PIZZA-*;b=STRUMPOR-K1F1-P*" ⇒ { a: [{monster, regex}], b: [...] } */
export function tolkaKoder(str) {
  const regler = { a: [], b: [] };
  if (!str || str === true) return regler;
  for (const del of String(str).split(';')) {
    const d = del.trim();
    if (!d) continue;
    const m = /^([ab])\s*=\s*(.*)$/i.exec(d);
    if (!m) throw new Error(`--koder: förstår inte "${d}" (form: a=MÖNSTER,MÖNSTER;b=MÖNSTER)`);
    const variant = m[1].toLowerCase();
    for (const mon of m[2].split(',')) {
      const mm = mon.trim();
      if (mm) regler[variant].push({ monster: mm, regex: monsterTillRegex(mm) });
    }
  }
  return regler;
}

/**
 * Varianten ur orderns rabattkoder. Matchar koderna bara a ⇒ a, bara b ⇒ b.
 * Matchar de båda (två koder, eller ett mönster som täcker båda) ⇒ null —
 * hellre okänd än gissad.
 */
export function variantUrKod(koder, regler) {
  const traff = { a: [], b: [] };
  for (const kod of koder ?? []) {
    for (const v of ['a', 'b']) {
      if (regler[v].some((r) => r.regex.test(kod))) traff[v].push(kod);
    }
  }
  if (traff.a.length && traff.b.length) return { variant: null, kod: null, orsak: 'koder för både A och B' };
  if (traff.a.length) return { variant: 'a', kod: traff.a[0], orsak: null };
  if (traff.b.length) return { variant: 'b', kod: traff.b[0], orsak: null };
  return { variant: null, kod: null, orsak: null };
}

/* --- stämpeln ------------------------------------------------------------ */

export function plattaAttribut(customAttributes) {
  if (!customAttributes) return {};
  if (Array.isArray(customAttributes)) {
    return Object.fromEntries(customAttributes.filter((x) => x && x.key != null).map((x) => [String(x.key), x.value == null ? '' : String(x.value)]));
  }
  return { ...customAttributes };
}

export const attributNyckel = (testId) => `AB ${testId}`;

export function arTvingad(attr, testId) {
  return String(attr[attributNyckel(testId) + ' forced'] ?? '').trim().toLowerCase() === 'ja';
}

/** 'a' | 'b' | null. Bara exakt a/b räknas; annat (tomt, "A ", "c") ⇒ null. */
export function stampel(attr, testId) {
  const v = String(attr[attributNyckel(testId)] ?? '').trim().toLowerCase();
  return v === 'a' || v === 'b' ? v : null;
}

/** Stämpeln först, sedan koden, annars okänd. */
export function variantFor(order, testId, regler = { a: [], b: [] }) {
  const attr = plattaAttribut(order.customAttributes ?? order.attributes);
  const s = stampel(attr, testId);
  if (s) return { variant: s, kalla: 'stampel', kod: null, orsak: null };
  const k = variantUrKod(order.discountCodes ?? [], regler);
  if (k.variant) return { variant: k.variant, kalla: 'kod', kod: k.kod, orsak: null };
  return { variant: null, kalla: null, kod: null, orsak: k.orsak ?? 'varken stämpel eller kod' };
}

/* --- lådor och sorter ---------------------------------------------------- */

/** En strumplåda = en orderrad vars produkt heter/handlar "strumpor". Ätpinnar räknas inte. */
export function arStrumplada(li) {
  const h = String(li?.product?.handle ?? '').toLowerCase();
  const t = String(li?.title ?? '').toLowerCase();
  return h.includes('strumpor') || t.includes('strumpor');
}

/** Sorten på en strumplåda ur handle/titel; null för ätpinnar och okänt. */
export function sortFor(li) {
  if (!arStrumplada(li)) return null;
  const s = `${li?.product?.handle ?? ''} ${li?.title ?? ''}`.toLowerCase();
  if (s.includes('sushi')) return 'sushi';
  if (s.includes('pizza')) return 'pizza';
  if (s.includes('hamburg')) return 'hamburgare';
  if (s.includes('donut') || s.includes('munk')) return 'donut';
  return 'annan';
}

/** { lador, sorter: ["sushi", …] (unika, i ordning), blandad } */
export function raknaLador(order) {
  const rader = order?.lineItems?.nodes ?? order?.lineItems ?? [];
  let lador = 0;
  const sorter = [];
  for (const li of rader) {
    if (!arStrumplada(li)) continue;
    lador += Number(li.quantity ?? 0);
    const s = sortFor(li);
    if (s && !sorter.includes(s)) sorter.push(s);
  }
  return { lador, sorter, blandad: sorter.length > 1 };
}

/* --- klassificering ------------------------------------------------------ */

const belopp = (set) => Number(set?.shopMoney?.amount ?? set?.amount ?? set ?? 0) || 0;

/** En rad i utfilen. Bara det analysen behöver — inga kunduppgifter. */
export function radFor(order, testId, regler) {
  const attr = plattaAttribut(order.customAttributes ?? order.attributes);
  const nyckel = attributNyckel(testId);
  const v = variantFor(order, testId, regler);
  const tvingad = arTvingad(attr, testId);
  const { lador, sorter, blandad } = raknaLador(order);
  const attributes = {};
  if (v.variant) attributes[nyckel] = v.variant;
  if (tvingad) attributes[nyckel + ' forced'] = 'ja';
  return {
    name: order.name,
    createdAt: order.createdAt,
    totalPrice: belopp(order.totalPriceSet),
    attributes,
    variant: v.variant,
    kalla: v.kalla,
    kod: v.kod,
    tvingad,
    koder: [...(order.discountCodes ?? [])],
    lador,
    sorter,
    blandad,
    finansiellStatus: order.displayFinancialStatus ?? null,
    aterbetalt: belopp(order.totalRefundedSet),
    raderAvhuggna: Boolean(order.lineItems?.pageInfo?.hasNextPage),
  };
}

const pctTal = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);
const r2 = (x) => Math.round(x * 100) / 100;

/**
 * Hela klassificeringen, utan nät. Tar råa Shopify-ordrar (GraphQL-noder) och
 * ger { rader, sammanfattning }. rader = fönstrets icke-annullerade,
 * icke-test-ordrar i utfilens form. Sammanfattningen räknar allt som INTE
 * räknas (annullerade, test, utanför fönstret, tvingade, okända) med namn.
 */
export function klassificera(ordrar, { testId, regler = { a: [], b: [] }, sedan = null, till = null } = {}) {
  if (!testId) throw new Error('testId saknas');
  const s = {
    test: testId,
    fonster: { sedan: sedan ? sedan.toISOString() : null, till: till ? till.toISOString() : null },
    hamtade: ordrar.length,
    utanfor_fonster: 0,
    annullerade: [],
    testordrar: [],
    tvingade: [],
    okanda: [],
    ur_kod: [],
    aterbetalda: [],
    rader_avhuggna: [],
    raknade: 0,
    forsta: null,
    sista: null,
    per_variant: {},
  };
  const rader = [];
  const per = { a: [], b: [] };

  for (const o of ordrar) {
    if (!iFonster(o, sedan, till)) { s.utanfor_fonster++; continue; }
    if (o.cancelledAt) { s.annullerade.push(o.name); continue; }
    if (o.test) { s.testordrar.push(o.name); continue; }
    const rad = radFor(o, testId, regler);
    rader.push(rad);
    if (rad.raderAvhuggna) s.rader_avhuggna.push(rad.name);
    if (rad.aterbetalt > 0) s.aterbetalda.push(rad.name);
    if (rad.tvingad) { s.tvingade.push(rad.name); continue; }
    if (!rad.variant) { s.okanda.push(rad.name); continue; }
    if (rad.kalla === 'kod') s.ur_kod.push(`${rad.name} (${rad.variant}, ${rad.kod})`);
    per[rad.variant].push(rad);
  }

  rader.sort((x, y) => String(x.createdAt).localeCompare(String(y.createdAt)));
  const raknade = rader.filter((r) => r.variant && !r.tvingad);
  s.raknade = raknade.length;
  if (raknade.length) {
    s.forsta = { name: raknade[0].name, createdAt: raknade[0].createdAt };
    s.sista = { name: raknade[raknade.length - 1].name, createdAt: raknade[raknade.length - 1].createdAt };
  }

  for (const v of ['a', 'b']) {
    const xs = per[v];
    const n = xs.length;
    const intakt = xs.reduce((acc, r) => acc + r.totalPrice, 0);
    const lador = xs.reduce((acc, r) => acc + r.lador, 0);
    const hink = { '1': 0, '2': 0, '3': 0, '4+': 0, '0': 0 };
    const koder = new Map();
    let blandade = 0;
    for (const r of xs) {
      const h = r.lador >= 4 ? '4+' : String(Math.max(0, r.lador));
      hink[h] = (hink[h] ?? 0) + 1;
      if (r.blandad) blandade++;
      const ks = r.koder.length ? r.koder : ['(utan kod)'];
      for (const kod of ks) koder.set(kod, (koder.get(kod) ?? 0) + 1);
    }
    s.per_variant[v] = {
      ordrar: n,
      intakt_sek: r2(intakt),
      snittorder_sek: n ? r2(intakt / n) : null,
      lador_per_order: n ? r2(lador / n) : null,
      andel_lador_pct: { '1': pctTal(hink['1'], n), '2': pctTal(hink['2'], n), '3': pctTal(hink['3'], n), '4+': pctTal(hink['4+'], n) },
      antal_lador: hink,
      blandade_sorter: blandade,
      ur_kod: xs.filter((r) => r.kalla === 'kod').length,
      koder: Object.fromEntries([...koder.entries()].sort((x, y) => y[1] - x[1]).map(([k, c]) => [k, { ordrar: c, andel_pct: pctTal(c, n) }])),
    };
  }
  return { rader, sammanfattning: s };
}

/* --- utskrift ------------------------------------------------------------ */

const kr = (n) => (n == null ? '—' : Math.round(n).toLocaleString('sv-SE') + ' kr');
const tal = (n) => (n == null ? '—' : String(n).replace('.', ','));
const pctStr = (n) => (n == null ? '—' : tal(n) + ' %');

export function skrivSammanfattning(s, { fil = null } = {}) {
  const rad = [];
  const rub = (t) => rad.push('', t, '─'.repeat(Math.max(20, t.length)));
  rub(`Ordrar för A/B-testet ${s.test} — matstrumpor.se`);
  rad.push(`Fönster (inkl.)   : ${s.fonster.sedan ?? '—'} → ${s.fonster.till ?? 'nu'}`);
  if (s.forsta) rad.push(`Första / sista    : ${s.forsta.name} ${s.forsta.createdAt} / ${s.sista.name} ${s.sista.createdAt}`);
  rad.push(`Hämtade ur Shopify: ${s.hamtade} (utanför fönstret: ${s.utanfor_fonster})`);
  rad.push(`Räknade (A + B)   : ${s.raknade}`);
  const lista = (xs) => (xs.length ? `${xs.length} (${xs.slice(0, 12).join(', ')}${xs.length > 12 ? ', …' : ''})` : '0');
  rad.push(`Annullerade, bort : ${lista(s.annullerade)}`);
  if (s.testordrar.length) rad.push(`Testordrar, bort  : ${lista(s.testordrar)}`);
  rad.push(`Tvingade, bort    : ${lista(s.tvingade)}`);
  rad.push(`Ur rabattkoden    : ${lista(s.ur_kod)}`);
  rad.push(`Okända, ej räknade: ${lista(s.okanda)}${s.okanda.length ? '  ← varken stämpel eller kod; ingen variant gissas' : ''}`);
  rad.push(`Återbetalda (kvar i intäkten): ${lista(s.aterbetalda)}`);
  if (s.rader_avhuggna.length) rad.push(`⚠️ Ordrar med > 20 rader (lådor kan saknas): ${lista(s.rader_avhuggna)}`);

  const A = s.per_variant.a, B = s.per_variant.b;
  const kol = (x) => String(x).padStart(14);
  rub('Per variant');
  rad.push('                     Variant A     Variant B');
  rad.push('  ' + '─'.repeat(44));
  rad.push(`  Ordrar       ${kol(A.ordrar)}${kol(B.ordrar)}`);
  rad.push(`  Intäkt       ${kol(kr(A.intakt_sek))}${kol(kr(B.intakt_sek))}`);
  rad.push(`  Snittorder   ${kol(kr(A.snittorder_sek))}${kol(kr(B.snittorder_sek))}`);
  rad.push(`  Lådor/order  ${kol(tal(A.lador_per_order))}${kol(tal(B.lador_per_order))}`);
  for (const h of ['1', '2', '3', '4+']) {
    rad.push(`  ${(h + ' låd' + (h === '1' ? 'a' : 'or')).padEnd(13)}${kol(`${A.antal_lador[h]} (${pctStr(A.andel_lador_pct[h])})`)}${kol(`${B.antal_lador[h]} (${pctStr(B.andel_lador_pct[h])})`)}`);
  }
  rad.push(`  Blandade sorter${kol(A.blandade_sorter).slice(2)}${kol(B.blandade_sorter)}`);
  rad.push(`  Ur koden     ${kol(A.ur_kod)}${kol(B.ur_kod)}`);
  for (const v of ['a', 'b']) {
    const p = s.per_variant[v];
    rad.push('', `  Rabattkoder ${v.toUpperCase()} (${p.ordrar} ordrar):`);
    const poster = Object.entries(p.koder);
    if (!poster.length) rad.push('    —');
    for (const [k, c] of poster) rad.push(`    ${k.padEnd(22)} ${String(c.ordrar).padStart(5)}  ${pctStr(c.andel_pct)}`);
  }
  if (fil) rad.push('', `Filen till analys.mjs: ${fil}`);
  return rad.join('\n');
}

/* --- Shopify ------------------------------------------------------------- */

const ORDER_FALT = `
  name createdAt cancelledAt test displayFinancialStatus
  totalPriceSet { shopMoney { amount currencyCode } }
  totalRefundedSet { shopMoney { amount } }
  discountCodes
  customAttributes { key value }
  lineItems(first: 20) { pageInfo { hasNextPage } nodes { title quantity product { handle } variant { title } } }
`;

const paus = (ms) => new Promise((r) => setTimeout(r, ms));

async function gql(k, query, variables, { forsok = 6, logg = () => {} } = {}) {
  for (let n = 1; ; n++) {
    try {
      return await k.graphql(query, variables);
    } catch (e) {
      const msg = String(e.message);
      if (/THROTTLED|Throttled|INTERNAL_SERVER_ERROR|Internal error|\b50[0-4]\b/.test(msg) && n < forsok) {
        logg(`  ⏳ Shopify: tillfälligt fel, väntar ${2 * n} s (${n}/${forsok})`);
        await paus(2000 * n);
        continue;
      }
      throw e;
    }
  }
}

/** createdAt för ett ordernummer, eller fel om det inte finns i butiken. */
export async function tidForOrder(k, ordernummer, { logg = () => {} } = {}) {
  const d = await gql(k, `query($q: String!) { orders(first: 1, query: $q) { nodes { name createdAt } } }`, { q: `name:${ordernummer}` }, { logg });
  const o = d.orders.nodes.find((x) => x.name === ordernummer) ?? d.orders.nodes[0];
  if (!o || o.name !== ordernummer) throw new Error(`ordern ${ordernummer} finns inte i butiken`);
  return new Date(o.createdAt);
}

const datumStr = (d) => d.toISOString().slice(0, 10);
const plusDagar = (d, n) => new Date(d.getTime() + n * 86400000);

/**
 * Alla ordrar vars datum ligger inom fönstret ± ett dygn (Shopify tar bara
 * datumet i created_at-sökningen). Filtreringen på klockslag görs sedan i
 * klassificera(). Paginerar 100 åt gången, halverar vid kostnadstaket.
 */
export async function hamtaOrdrar(k, { sedan, till = null, logg = () => {} } = {}) {
  if (!sedan) throw new Error('sedan saknas');
  const fran = datumStr(plusDagar(sedan, -1));
  const tom = till ? ` created_at:<=${datumStr(plusDagar(till, 1))}` : '';
  const q = `created_at:>=${fran}${tom}`;
  const alla = [];
  let after = null;
  let n = 100;
  for (let sida = 1; sida <= 200; sida++) {
    let d;
    try {
      d = await gql(k, `query($q: String!, $c: String, $n: Int!) { orders(first: $n, after: $c, query: $q, sortKey: CREATED_AT) {
        pageInfo { hasNextPage endCursor } nodes { ${ORDER_FALT} } } }`, { q, c: after, n }, { logg });
    } catch (e) {
      if (/MAX_COST_EXCEEDED|exceeds the maximum/i.test(String(e.message)) && n > 5) { n = Math.max(5, Math.floor(n / 2)); logg(`  ↓ sidstorlek ${n} (kostnadstaket)`); continue; }
      throw e;
    }
    alla.push(...d.orders.nodes);
    logg(`  sida ${sida}: ${d.orders.nodes.length} ordrar (totalt ${alla.length})`);
    if (!d.orders.pageInfo.hasNextPage) break;
    after = d.orders.pageInfo.endCursor;
  }
  return alla;
}

/** Stannar om klienten inte pekar på matstrumpor.se — fel butik ger rimliga siffror från fel verksamhet. */
export async function kravMatstrumpor(k) {
  const info = await k.kolla();
  const doman = String(info.doman ?? '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (doman !== BUTIK_DOMAN && !doman.endsWith('.' + BUTIK_DOMAN)) {
    throw new Error(`fel butik: ${doman || '(okänd)'} — ska vara ${BUTIK_DOMAN}. Inget hämtas.`);
  }
  if (!info.scopes.includes('read_orders') && !info.scopes.includes('read_all_orders')) {
    throw new Error(`appen ${info.app ?? '?'} saknar read_orders i ${doman}`);
  }
  return { ...info, doman };
}

export const standardUtfil = (testId, datum = new Date()) => join(UT_MAPP, `${testId}-${datumStr(datum)}.json`);

/* --- körning ------------------------------------------------------------- */

export async function kor(argv = process.argv.slice(2), { env = process.env, ut = console.log, logg = console.error } = {}) {
  const a = tolkaArgs(argv);
  const testId = a.test && a.test !== true ? String(a.test).trim() : null;
  if (!testId) throw new Error('ange testet: --test <id>');
  if (!a.sedan || a.sedan === true) throw new Error('ange starttiden: --sedan <ISO-tid eller #ordernummer> (testets första order — gissa aldrig)');
  const regler = tolkaKoder(a.koder);

  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const b = lasButik(BUTIK_ID);
  const k = await skapaKlient(b, { env });
  const info = await kravMatstrumpor(k);
  logg(`Butik: ${info.namn} (${info.doman}), appen ${info.app}`);

  const nS = tolkaNar(a.sedan);
  const sedan = nS.tid ?? (await tidForOrder(k, nS.ordernummer, { logg }));
  let till = null;
  if (a.till && a.till !== true) {
    const nT = tolkaNar(a.till);
    till = nT.tid ?? (await tidForOrder(k, nT.ordernummer, { logg }));
  }
  if (till && till < sedan) throw new Error(`--till (${till.toISOString()}) ligger före --sedan (${sedan.toISOString()})`);
  logg(`Fönster: ${sedan.toISOString()} → ${till ? till.toISOString() : 'nu'} (inkl.)`);

  const raa = await hamtaOrdrar(k, { sedan, till, logg });
  const { rader, sammanfattning } = klassificera(raa, { testId, regler, sedan, till });

  const fil = a.ut && a.ut !== true ? resolve(String(a.ut)) : standardUtfil(testId);
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, JSON.stringify(rader, null, 1) + '\n');
  sammanfattning.fil = fil;

  if (a.json) ut(JSON.stringify(sammanfattning, null, 2));
  else ut(skrivSammanfattning(sammanfattning, { fil }));
  return { fil, rader, sammanfattning };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  kor().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
