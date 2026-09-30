// bygg.mjs — marknaden Worldwide i Bäverbutikens Shopify: Beaver Store på beaverstoreco.com.
//
//   node worldwide/bygg.mjs --kolla                  # appens scopes + domänen (läser bara)
//   node worldwide/bygg.mjs --lage                   # marknader, språk, valutor, frakt, närvaro
//   node worldwide/bygg.mjs --alla                   # torrt (standard): planen för hela kedjan
//   node worldwide/bygg.mjs --alla --skarpt          # skriv allt, i ordning
//   node worldwide/bygg.mjs --steg frakt --skarpt    # ett steg
//
// Stegen (--alla kör dem i den här ordningen):
//   marknader       marknaden "Worldwide" med konfig.json → marknad.lander, basvaluta USD, lokala valutor
//   sprak           engelska aktiveras (opublicerad tills översättningarna ligger inne)
//   frakt           en zon med marknadens länder och fri frakt; länderna ut ur sina gamla zoner
//   prislista       bara om prisjustering_procent ≠ 0: prislista USD med påslaget + katalog
//   oversattningar  produkter (handle ⇒ en/<handle>.json), alternativ, kollektioner, sidor,
//                   policyer, menyer, temats texter och butikens titel — granska.mjs först
//   domaner         beaverstoreco.com: webbnärvaro (standard en) kopplad till Worldwide
//   publicera       engelska publiceras
//   kontroll        läser tillbaka översättningarna och kundens vy (skriver aldrig)
//
// Mönstret är Matstrumpors (matstrumpor/marknader/bygg.mjs, mätt 2026-09-27–29): torrt är
// standard, varje skrivning läses tillbaka, Shopifys tillfälliga fel får ett nytt försök, en
// produkt med ❌ i granska.mjs registreras aldrig. Sverige rörs aldrig: primärmarknaden,
// baverbutiken.se-närvaron och svenska texter är orörda. NO/DK/FI ligger inte i konfigen.
// Inget i Meta rörs härifrån (annonserna: worldwide/annonser/).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { granskaProdukt, lasEn } from './oversattning/granska.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const KONFIG = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const EN = join(ROT, 'oversattning', 'en');
const KALLA = join(ROT, 'oversattning', 'kalla');
const LOCALE = 'en';
const log = (s) => console.log(s);
const paus = (ms) => new Promise((r) => setTimeout(r, ms));

export const norm = (s) => String(s ?? '').replace(/\r\n/g, '\n').replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();

// ------------------------------------------------------------------ ren logik (testad)

/** Scopes som saknas för att köra stegen. */
export function saknadeScopes(har) {
  return KONFIG.butik.kravda_scopes.filter((s) => !har.includes(s));
}

/** Engelska för en produktresurs: key → text ur en/<handle>.json. */
export function produktKarta(en) {
  return { title: en.title, body_html: en.descriptionHtml, meta_title: en.seo_title ?? null, meta_description: en.seo_description ?? null };
}

/** Kartan svensk text → engelsk ur en {sv: en}-fil (menyer, temat, alternativ). Normaliserad nyckel. */
export function vardeKarta(...objekt) {
  const m = new Map();
  for (const o of objekt) for (const [sv, en] of Object.entries(o ?? {})) if (typeof en === 'string' && en.trim() && norm(sv)) m.set(norm(sv), en);
  return m;
}

/** Fraktplan: zonen med marknadens länder, och varje annan zon släpper dem (tom zon ⇒ radera). */
export function fraktplan(zoner, konfig) {
  const lander = konfig.lander;
  const plan = { skapa: null, uppdatera: [], radera: [], redan: false };
  const egen = zoner.find((z) => z.namn === konfig.zon);
  const lika = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();
  if (egen && lika(egen.lander, lander) && egen.metoder.some((m) => m.pris === 0 && m.aktiv)) plan.redan = true;
  else if (egen) plan.uppdatera.push({ id: egen.id, namn: egen.namn, efter: lander });
  else plan.skapa = { namn: konfig.zon, lander, metod: konfig.metod, pris: konfig.pris_sek };
  for (const z of zoner) {
    if (z.namn === konfig.zon) continue;
    const kvar = z.lander.filter((c) => !lander.includes(c));
    if (kvar.length === z.lander.length) continue;
    if (kvar.length === 0) plan.radera.push({ id: z.id, namn: z.namn, fore: z.lander });
    else plan.uppdatera.push({ id: z.id, namn: z.namn, efter: kvar, bort: z.lander.filter((c) => lander.includes(c)) });
  }
  return plan;
}

/** Läser JSON-delar (_x-1.json, _x-2.json …) och slår ihop dem (bodies per nyckel fogas i del-ordning). */
export function lasDelar(prefix) {
  if (!existsSync(EN)) return {};
  const filer = readdirSync(EN).filter((f) => f.startsWith(prefix) && f.endsWith('.json')).sort((a, b) => (Number(/(\d+)\.json$/.exec(a)?.[1] ?? 0) - Number(/(\d+)\.json$/.exec(b)?.[1] ?? 0)));
  const ut = {};
  for (const f of filer) {
    const j = JSON.parse(readFileSync(join(EN, f), 'utf8'));
    if (j.del != null && (j.handle || j.typ)) {
      const k = j.handle ?? j.typ;
      ut[k] ??= { title: null, body: '' };
      if (j.title) ut[k].title = j.title;
      ut[k].body += j.body;
    } else Object.assign(ut, j);
  }
  return ut;
}

// ------------------------------------------------------------------ Shopify

async function klient() {
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  return skapaKlient({ ...lasButik('baverbutiken'), env_suffix: KONFIG.butik.env_suffix });
}

const TILLFALLIGT = /INTERNAL_SERVER_ERROR|THROTTLED|Internal error|MAX_COST_EXCEEDED|\b50[0-4]\b/;
async function mutation(k, query, variables, { forsok = 2 } = {}) {
  for (let n = 1; ; n++) {
    try { return { data: await k.graphql(query, variables), fel: [] }; } catch (e) {
      const m = /avvisade \w+: (.*)$/s.exec(e.message);
      if (m) return { data: null, fel: [m[1]] };
      if (!TILLFALLIGT.test(e.message)) throw e;
      if (n < forsok) { await paus(3000 * n); continue; }
      return { data: null, fel: [`Shopify: ${e.message.replace(/\s+/g, ' ').slice(0, 200)}`] };
    }
  }
}

async function scopes(k) {
  const d = await k.graphql('{ currentAppInstallation { app { title } accessScopes { handle } } }');
  return { app: d.currentAppInstallation.app.title, scopes: d.currentAppInstallation.accessScopes.map((s) => s.handle) };
}

async function hamtaLage(k) {
  const d = await k.graphql(`{
    shopLocales { locale primary published }
    shop { currencyCode enabledPresentmentCurrencies domains { id host sslEnabled } }
    markets(first: 50) { nodes { id name handle status primary
      conditions { regionsCondition { regions(first: 100) { nodes { ... on MarketRegionCountry { code } } } } }
      currencySettings { baseCurrency { currencyCode } localCurrencies }
      webPresences(first: 10) { nodes { id domain { host } } }
      catalogs(first: 10) { nodes { id title ... on MarketCatalog { priceList { id name currency parent { adjustment { type value } } } } } } } }
    webPresences(first: 20) { nodes { id domain { id host } defaultLocale { locale } alternateLocales { locale } markets(first: 10) { nodes { id name } } } }
    deliveryProfiles(first: 5) { nodes { id name default profileLocationGroups { locationGroup { id } locationGroupZones(first: 40) { nodes { zone { id name countries { code { countryCode restOfWorld } } } methodDefinitions(first: 20) { nodes { id name active rateProvider { ... on DeliveryRateDefinition { price { amount currencyCode } } } } } } } } } }
  }`);
  const profil = d.deliveryProfiles.nodes.find((p) => p.default) ?? d.deliveryProfiles.nodes[0];
  const grupp = profil?.profileLocationGroups?.[0];
  return {
    locales: d.shopLocales, shop: d.shop, webPresences: d.webPresences.nodes,
    marknader: d.markets.nodes.map((m) => ({ ...m, lander: (m.conditions?.regionsCondition?.regions?.nodes ?? []).map((r) => r.code).filter(Boolean) })),
    frakt: profil ? { profilId: profil.id, gruppId: grupp?.locationGroup?.id, zoner: (grupp?.locationGroupZones?.nodes ?? []).map((z) => ({ id: z.zone.id, namn: z.zone.name, lander: z.zone.countries.map((c) => (c.code.restOfWorld ? '*' : c.code.countryCode)), metoder: z.methodDefinitions.nodes.map((m) => ({ namn: m.name, aktiv: m.active, pris: Number(m.rateProvider?.price?.amount ?? NaN), valuta: m.rateProvider?.price?.currencyCode })) })) } : null,
  };
}

function skrivLage(l) {
  log(`Språk: ${l.locales.map((x) => `${x.locale}${x.primary ? ' (primär)' : ''}${x.published ? '' : ' (opublicerat)'}`).join(', ')}`);
  log(`Valutor i kassan: ${l.shop.enabledPresentmentCurrencies.join(', ')} (butikens ${l.shop.currencyCode})`);
  log(`Domäner: ${l.shop.domains.map((d) => `${d.host}${d.sslEnabled ? '' : ' (utan SSL)'}`).join(', ')}`);
  for (const m of l.marknader) log(`Marknad ${m.name} [${m.handle}] ${m.status}${m.primary ? ' PRIMÄR' : ''}: ${m.lander.length} länder (${m.lander.slice(0, 12).join(',')}${m.lander.length > 12 ? '…' : ''}) · bas ${m.currencySettings?.baseCurrency?.currencyCode ?? '—'} · lokala ${m.currencySettings?.localCurrencies ?? '—'} · närvaro ${m.webPresences.nodes.map((w) => w.domain?.host ?? 'myshopify').join(',') || '—'}`);
  for (const w of l.webPresences) log(`Närvaro ${w.domain?.host ?? w.id}: ${w.defaultLocale?.locale} + ${w.alternateLocales.map((x) => x.locale).join(',') || '—'} · marknader ${w.markets.nodes.map((x) => x.name).join(', ')}`);
  for (const z of l.frakt?.zoner ?? []) log(`Fraktzon ${z.namn}: ${z.lander.length} länder → ${z.metoder.map((m) => `${m.namn} ${m.pris} ${m.valuta}${m.aktiv ? '' : ' (av)'}`).join(' · ')}`);
}

const hittaMarknad = (lage) => lage.marknader.find((x) => x.handle === KONFIG.marknad.handle) ?? lage.marknader.find((x) => !x.primary && KONFIG.marknad.lander.some((c) => x.lander.includes(c)));

async function stegMarknader(k, { skarpt }) {
  const M = KONFIG.marknad;
  let lage = await hamtaLage(k);
  const primar = lage.marknader.find((m) => m.primary);
  const iPrimar = M.lander.filter((c) => primar?.lander.includes(c));
  if (iPrimar.length) throw new Error(`${iPrimar.join(', ')} ligger i primärmarknaden ${primar.name} — rörs aldrig. Ta bort dem ur konfig.json.`);
  let mk = lage.marknader.find((x) => x.handle === M.handle);
  // Länder som ligger i en ANNAN marknad flyttas: ut där, in här (ett land kan bara ha en marknad).
  const andra = lage.marknader.filter((x) => x.id !== mk?.id && !x.primary);
  for (const a of andra) {
    const flytt = a.lander.filter((c) => M.lander.includes(c));
    if (!flytt.length) continue;
    const kvar = a.lander.filter((c) => !M.lander.includes(c));
    log(`${skarpt ? '' : 'torrt: '}${flytt.join(', ')} flyttas ut ur marknaden ${a.name}${kvar.length ? ` (kvar: ${kvar.join(', ')})` : ' (blir tom — Shopify vill ha minst ett land: marknaden avaktiveras)'}`);
    if (!skarpt) continue;
    if (kvar.length) {
      const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { id } userErrors { field message } } }`, { id: a.id, input: { conditions: { conditionsToDelete: { regionsCondition: { regions: flytt.map((countryCode) => ({ countryCode })) } } } } });
      if (r.fel.length) throw new Error(`Flytta ut ur ${a.name}: ${r.fel.join('; ')}`);
    } else {
      const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { id status } userErrors { field message } } }`, { id: a.id, input: { status: 'DRAFT' } });
      if (r.fel.length) throw new Error(`Avaktivera ${a.name}: ${r.fel.join('; ')}`);
      const r2 = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { id } userErrors { field message } } }`, { id: a.id, input: { conditions: { conditionsToDelete: { regionsCondition: { regions: flytt.map((countryCode) => ({ countryCode })) } } } } });
      if (r2.fel.length) log(`⚠️ ${a.name}: länderna gick inte att släppa (${r2.fel.join('; ')}) — marknaden står som DRAFT`);
    }
  }
  if (!mk) {
    if (!skarpt) { log(`torrt: skulle skapa marknaden "${M.namn}" [${M.handle}] med ${M.lander.length} länder`); return; }
    const r = await mutation(k, `mutation($input: MarketCreateInput!) { marketCreate(input: $input) { market { id name handle status } userErrors { field message code } } }`,
      { input: { name: M.namn, handle: M.handle, status: 'ACTIVE', conditions: { regionsCondition: { regions: M.lander.map((countryCode) => ({ countryCode })) } } } });
    if (r.fel.length) throw new Error(`Marknaden kunde inte skapas: ${r.fel.join('; ')} — är det Shopify-planens marknadstak? Läs worldwide/README.md → Om marknaden inte går att skapa.`);
    log(`✅ marknaden ${r.data.marketCreate.market.name} skapad (${r.data.marketCreate.market.status})`);
    lage = await hamtaLage(k);
    mk = lage.marknader.find((x) => x.handle === M.handle);
    // marketCreate kan ge DRAFT trots status ACTIVE (factory/marknad.mjs, mätt 2026-09-09).
    if (mk && mk.status !== 'ACTIVE') {
      const r2 = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { status } userErrors { field message } } }`, { id: mk.id, input: { status: 'ACTIVE' } });
      if (r2.fel.length) throw new Error(`Aktivera ${mk.name}: ${r2.fel.join('; ')}`);
      log('✅ marknaden aktiverad');
    }
  } else {
    const saknas = M.lander.filter((c) => !mk.lander.includes(c));
    log(`marknaden ${mk.name} finns (${mk.status}), ${mk.lander.length} länder${saknas.length ? `, saknar ${saknas.join(', ')}` : ''}`);
    if (saknas.length && skarpt) {
      const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { id } userErrors { field message } } }`, { id: mk.id, input: { conditions: { conditionsToAdd: { regionsCondition: { regions: saknas.map((countryCode) => ({ countryCode })) } } } } });
      if (r.fel.length) throw new Error(`Länder in i ${mk.name}: ${r.fel.join('; ')}`);
      log(`✅ ${saknas.length} länder tillagda`);
    }
    if (mk.status !== 'ACTIVE' && skarpt) {
      const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { status } userErrors { field message } } }`, { id: mk.id, input: { status: 'ACTIVE' } });
      if (r.fel.length) throw new Error(`Aktivera ${mk.name}: ${r.fel.join('; ')}`);
      log('✅ marknaden aktiverad');
    }
  }
  if (!skarpt) return;
  const bas = mk.currencySettings?.baseCurrency?.currencyCode ?? null;
  if (bas !== M.basvaluta || mk.currencySettings?.localCurrencies !== M.lokala_valutor) {
    const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { currencySettings { baseCurrency { currencyCode } localCurrencies } } userErrors { field message } } }`, { id: mk.id, input: { currencySettings: { baseCurrency: M.basvaluta, localCurrencies: M.lokala_valutor } } });
    if (r.fel.length) log(`🖐 valutan: ${r.fel.join('; ')} — sätts då i admin: Inställningar → Marknader → ${M.namn} → Valuta ${M.basvaluta}, "lokala valutor" på (Cowork-prompten har klicket).`);
    else log(`✅ valuta: ${JSON.stringify(r.data.marketUpdate.market.currencySettings)}`);
  }
  lage = await hamtaLage(k);
  const efter = hittaMarknad(lage);
  const fattas = M.lander.filter((c) => !efter?.lander.includes(c));
  if (fattas.length) throw new Error(`Tillbakaläsning: ${fattas.join(', ')} ligger inte i ${M.namn}`);
  log(`✅ tillbakaläst: ${efter.name} ${efter.status}, ${efter.lander.length} länder, bas ${efter.currencySettings?.baseCurrency?.currencyCode}, lokala ${efter.currencySettings?.localCurrencies} · valutor i kassan ${lage.shop.enabledPresentmentCurrencies.join(',')}`);
}

async function stegSprak(k, { skarpt }) {
  const lage = await hamtaLage(k);
  const f = lage.locales.find((x) => x.locale === LOCALE);
  if (f) { log(`engelska finns (${f.published ? 'publicerad' : 'opublicerad'})`); return; }
  if (!skarpt) { log('torrt: skulle aktivera engelska (opublicerad)'); return; }
  const r = await mutation(k, `mutation($l: String!) { shopLocaleEnable(locale: $l) { shopLocale { locale published } userErrors { field message } } }`, { l: LOCALE });
  if (r.fel.length) throw new Error(`Engelska: ${r.fel.join('; ')}`);
  log('✅ engelska aktiverad (opublicerad)');
}

async function stegFrakt(k, { skarpt }) {
  const lage = await hamtaLage(k);
  if (!lage.frakt) throw new Error('Ingen fraktprofil.');
  const plan = fraktplan(lage.frakt.zoner, { ...KONFIG.frakt, lander: KONFIG.marknad.lander });
  if (plan.redan) log(`zonen "${KONFIG.frakt.zon}" finns med rätt länder och fri frakt`);
  if (plan.skapa) log(`${skarpt ? '' : 'torrt: '}ny zon "${plan.skapa.namn}" ${plan.skapa.lander.length} länder, "${plan.skapa.metod}" ${plan.skapa.pris} kr`);
  for (const u of plan.uppdatera) log(`${skarpt ? '' : 'torrt: '}zonen "${u.namn}" ${u.bort ? `släpper ${u.bort.join(',')}` : `får ${u.efter.length} länder`}`);
  for (const z of plan.radera) log(`${skarpt ? '' : 'torrt: '}zonen "${z.namn}" (${z.fore.join(',')}) blir tom och tas bort`);
  if (!skarpt || (plan.redan && !plan.uppdatera.length && !plan.radera.length)) return;
  const land = (kod) => (kod === '*' ? { restOfWorld: true } : { code: kod, includeAllProvinces: true });
  const profile = {
    ...(plan.radera.length ? { zonesToDelete: plan.radera.map((z) => z.id) } : {}),
    locationGroupsToUpdate: [{
      id: lage.frakt.gruppId,
      zonesToUpdate: plan.uppdatera.map((u) => ({ id: u.id, countries: u.efter.map(land) })),
      zonesToCreate: plan.skapa ? [{ name: plan.skapa.namn, countries: plan.skapa.lander.map(land), methodDefinitionsToCreate: [{ name: plan.skapa.metod, active: true, rateDefinition: { price: { amount: '0.0', currencyCode: 'SEK' } } }] }] : [],
    }],
  };
  const r = await mutation(k, `mutation($id: ID!, $profile: DeliveryProfileInput!) { deliveryProfileUpdate(id: $id, profile: $profile) { profile { id } userErrors { field message } } }`, { id: lage.frakt.profilId, profile });
  if (r.fel.length) throw new Error(`Frakten: ${r.fel.join('; ')}`);
  const efter = await hamtaLage(k);
  const z = efter.frakt.zoner.find((x) => x.namn === KONFIG.frakt.zon);
  if (!z || z.lander.length !== KONFIG.marknad.lander.length) throw new Error('Fraktzonen stämmer inte vid tillbakaläsningen.');
  log(`✅ frakten tillbakaläst: ${z.namn} ${z.lander.length} länder → ${z.metoder.map((m) => `${m.namn} ${m.pris} ${m.valuta}`).join(' · ')}`);
}

async function stegPrislista(k, { skarpt }) {
  const M = KONFIG.marknad;
  if (!M.prisjustering_procent) { log('prisjustering 0 % — Shopifys omräkning gäller, ingen prislista behövs'); return; }
  const lage = await hamtaLage(k);
  const mk = hittaMarknad(lage);
  if (!mk) { log('⚠️ marknaden finns inte — kör --steg marknader först'); return; }
  const kat = mk.catalogs.nodes.find((c) => c.priceList?.currency === M.basvaluta);
  const typ = M.prisjustering_procent > 0 ? 'PERCENTAGE_INCREASE' : 'PERCENTAGE_DECREASE';
  const varde = Math.abs(M.prisjustering_procent);
  if (kat) {
    const a = kat.priceList.parent?.adjustment;
    if (a?.type === typ && Number(a.value) === varde) { log(`prislistan ${kat.priceList.name} har redan ${typ} ${varde} %`); return; }
    if (!skarpt) { log(`torrt: prislistan ${kat.priceList.name} får ${typ} ${varde} %`); return; }
    const r = await mutation(k, `mutation($id: ID!, $input: PriceListUpdateInput!) { priceListUpdate(id: $id, input: $input) { priceList { parent { adjustment { type value } } } userErrors { field message } } }`, { id: kat.priceList.id, input: { parent: { adjustment: { type: typ, value: varde } } } });
    if (r.fel.length) throw new Error(r.fel.join('; '));
    log(`✅ prislistan: ${JSON.stringify(r.data.priceListUpdate.priceList.parent)}`);
    return;
  }
  if (!skarpt) { log(`torrt: prislista ${M.basvaluta} ${typ} ${varde} % + katalog för ${mk.name}`); return; }
  const p = await k.graphql(`mutation($input: PriceListCreateInput!) { priceListCreate(input: $input) { priceList { id name } userErrors { field message } } }`, { input: { name: `Beaver Store ${M.basvaluta}`, currency: M.basvaluta, parent: { adjustment: { type: typ, value: varde } } } });
  const c = await k.graphql(`mutation($input: CatalogCreateInput!) { catalogCreate(input: $input) { catalog { id title } userErrors { field message } } }`, { input: { title: `Beaver Store ${M.namn}`, status: 'ACTIVE', context: { marketIds: [mk.id] }, priceListId: p.priceListCreate.priceList.id } });
  log(`✅ ${p.priceListCreate.priceList.name} + ${c.catalogCreate.catalog.title}`);
}

// ---- översättningar

async function allaResurser(k, typ) {
  const ut = [];
  let efter = null;
  do {
    const d = await k.graphql(`query($t: TranslatableResourceType!, $e: String, $l: String!) { translatableResources(resourceType: $t, first: 100, after: $e) { pageInfo { hasNextPage endCursor } nodes { resourceId translatableContent { key value digest } translations(locale: $l) { key value outdated } } } }`, { t: typ, e: efter, l: LOCALE });
    ut.push(...d.translatableResources.nodes);
    efter = d.translatableResources.pageInfo.hasNextPage ? d.translatableResources.pageInfo.endCursor : null;
  } while (efter);
  return ut;
}

async function registrera(k, resurs, rader, { skarpt, etikett }) {
  const ny = rader.filter((r) => r.value && !resurs.translations?.some((t) => t.key === r.key && !t.outdated && norm(t.value) === norm(r.value)));
  if (!ny.length) return { antal: 0, fel: 0 };
  if (!skarpt) return { antal: ny.length, fel: 0 };
  let antal = 0, fel = 0;
  for (let i = 0; i < ny.length; i += 100) {
    const r = await mutation(k, `mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { translations { key } userErrors { field message } } }`,
      { id: resurs.resourceId, t: ny.slice(i, i + 100).map((x) => ({ key: x.key, value: x.value, locale: LOCALE, translatableContentDigest: x.digest })) });
    if (r.fel.length) { log(`❌ ${etikett}: ${r.fel.join('; ')}`); fel++; continue; }
    antal += r.data.translationsRegister.translations.length;
  }
  return { antal, fel };
}

async function stegOversattningar(k, { skarpt }) {
  const summa = {};
  const lagg = (typ, r) => { summa[typ] ??= { texter: 0, fel: 0, lackor: 0 }; summa[typ].texter += r.antal; summa[typ].fel += r.fel; };
  // Produkter: resurs → handle → en/<handle>.json (bara de som klarar granska.mjs).
  const kallor = new Map();
  for (const f of readdirSync(KALLA).filter((x) => x.startsWith('produkter-'))) for (const p of JSON.parse(readFileSync(join(KALLA, f), 'utf8'))) kallor.set(p.handle, p);
  const handles = new Map();
  let efter = null;
  do {
    const d = await k.graphql(`query($e: String) { products(first: 250, after: $e) { pageInfo { hasNextPage endCursor } nodes { id handle } } }`, { e: efter });
    for (const p of d.products.nodes) handles.set(p.id, p.handle);
    efter = d.products.pageInfo.hasNextPage ? d.products.pageInfo.endCursor : null;
  } while (efter);
  const alternativ = new Map();
  let underkanda = 0;
  for (const res of await allaResurser(k, 'PRODUCT')) {
    const h = handles.get(res.resourceId);
    const en = h ? lasEn(h) : null;
    if (!en) continue;
    const kalla = kallor.get(h);
    if (kalla && granskaProdukt(kalla, en).length) { underkanda++; continue; }
    for (const o of en.options ?? []) { alternativ.set(norm(o.name), o.name_en); for (const [sv, e] of Object.entries(o.values ?? {})) alternativ.set(norm(sv), e); }
    const karta = produktKarta(en);
    const rader = res.translatableContent.filter((c) => karta[c.key] && c.value).map((c) => ({ key: c.key, value: karta[c.key], digest: c.digest }));
    lagg('produkter', await registrera(k, res, rader, { skarpt, etikett: `produkt ${h}` }));
  }
  if (underkanda) log(`⚠️ ${underkanda} produkter har ❌ i granska.mjs och registrerades inte`);
  // Alternativ och alternativvärden (Färg → Color, Svart → Black) — på värde.
  for (const typ of ['PRODUCT_OPTION', 'PRODUCT_OPTION_VALUE']) {
    for (const res of await allaResurser(k, typ)) {
      const rader = res.translatableContent.filter((c) => c.key === 'name' && alternativ.has(norm(c.value)) && norm(alternativ.get(norm(c.value))) !== norm(c.value)).map((c) => ({ key: c.key, value: alternativ.get(norm(c.value)), digest: c.digest }));
      lagg('alternativ', await registrera(k, res, rader, { skarpt, etikett: typ }));
    }
  }
  // Kollektioner (handle).
  const koll = JSON.parse(readFileSync(join(EN, '_kollektioner.json'), 'utf8'));
  const kollHandles = new Map();
  const dk = await k.graphql(`{ collections(first: 250) { nodes { id handle } } }`);
  for (const c of dk.collections.nodes) kollHandles.set(c.id, c.handle);
  for (const res of await allaResurser(k, 'COLLECTION')) {
    const en = koll[kollHandles.get(res.resourceId)];
    if (!en) continue;
    const karta = { title: en.title, body_html: en.descriptionHtml, meta_title: en.seo_title, meta_description: en.seo_description };
    lagg('kollektioner', await registrera(k, res, res.translatableContent.filter((c) => karta[c.key] && c.value).map((c) => ({ key: c.key, value: karta[c.key], digest: c.digest })), { skarpt, etikett: 'kollektion' }));
  }
  // Sidor (handle).
  const sidor = { ...lasDelar('_sidor'), ...lasDelar('_integritet') };
  const sidHandles = new Map();
  const dp = await k.graphql(`{ pages(first: 250) { nodes { id handle } } }`);
  for (const p of dp.pages.nodes) sidHandles.set(p.id, p.handle);
  for (const res of await allaResurser(k, 'PAGE')) {
    const en = sidor[sidHandles.get(res.resourceId)];
    if (!en) continue;
    const karta = { title: en.title, body_html: en.body };
    lagg('sidor', await registrera(k, res, res.translatableContent.filter((c) => karta[c.key] && c.value).map((c) => ({ key: c.key, value: karta[c.key], digest: c.digest })), { skarpt, etikett: `sida ${sidHandles.get(res.resourceId)}` }));
  }
  // Butikens policyer (typ).
  const pol = { ...lasDelar('_policyer'), ...lasDelar('_villkor') };
  const dpol = await k.graphql(`{ shop { shopPolicies { id type } } }`);
  const polTyp = new Map(dpol.shop.shopPolicies.map((p) => [p.id, p.type.toLowerCase().replace(/_/g, '-')]));
  for (const res of await allaResurser(k, 'SHOP_POLICY')) {
    const en = pol[polTyp.get(res.resourceId)];
    if (!en) continue;
    lagg('policyer', await registrera(k, res, res.translatableContent.filter((c) => c.key === 'body' && c.value).map((c) => ({ key: c.key, value: en.body, digest: c.digest })), { skarpt, etikett: `policy ${polTyp.get(res.resourceId)}` }));
  }
  // Menyer, temat och butikens titel — på värde.
  const menyer = vardeKarta(JSON.parse(readFileSync(join(EN, '_menyer.json'), 'utf8')));
  const tema = vardeKarta(JSON.parse(readFileSync(join(EN, '_tema.json'), 'utf8')));
  const shop = JSON.parse(readFileSync(join(EN, '_shop.json'), 'utf8'));
  for (const [typ, karta] of [['LINK', menyer], ['MENU', menyer], ['ONLINE_STORE_THEME', tema], ['ONLINE_STORE_THEME_JSON_TEMPLATE', tema], ['ONLINE_STORE_THEME_SETTINGS_DATA_SECTIONS', tema], ['ONLINE_STORE_THEME_SECTION_GROUP', tema]]) {
    let resurser;
    try { resurser = await allaResurser(k, typ); } catch (e) { log(`⚠️ ${typ}: ${e.message.slice(0, 160)}`); continue; }
    for (const res of resurser) {
      const rader = res.translatableContent.filter((c) => c.value && karta.has(norm(c.value))).map((c) => ({ key: c.key, value: karta.get(norm(c.value)), digest: c.digest }));
      lagg(typ.toLowerCase(), await registrera(k, res, rader, { skarpt, etikett: typ }));
    }
  }
  for (const res of await allaResurser(k, 'SHOP')) {
    const karta = { meta_title: shop.title, meta_description: shop.description };
    lagg('butik', await registrera(k, res, res.translatableContent.filter((c) => karta[c.key] && c.value).map((c) => ({ key: c.key, value: karta[c.key], digest: c.digest })), { skarpt, etikett: 'shop' }));
  }
  for (const [typ, s] of Object.entries(summa)) log(`${skarpt ? (s.fel ? '⚠️' : '✅') : 'torrt:'} ${typ}: ${s.texter} texter ${skarpt ? 'registrerade' : 'att registrera'}${s.fel ? `, ${s.fel} resurser GICK INTE (kör igen)` : ''}`);
}

async function stegDomaner(k, { skarpt }) {
  const M = KONFIG.marknad;
  const lage = await hamtaLage(k);
  const dom = lage.shop.domains.find((d) => d.host === M.doman.host || d.host === `www.${M.doman.host}`);
  if (!dom) { log(`🖐 ${M.doman.host} är inte kopplad i Shopify (Inställningar → Domäner → Anslut befintlig domän) — worldwide/cowork/1-app-och-doman.txt`); return; }
  if (!dom.sslEnabled) log(`⚠️ ${dom.host}: SSL inte klart än (Shopify utfärdar inom en timme)`);
  const mk = hittaMarknad(lage);
  if (!mk) { log('⚠️ marknaden finns inte — kör --steg marknader först'); return; }
  let wp = lage.webPresences.find((w) => w.domain?.id === dom.id);
  if (!wp) {
    if (!skarpt) { log(`torrt: ${dom.host} får en webbnärvaro (standard en) och kopplas till ${mk.name}`); return; }
    const r = await mutation(k, `mutation($input: WebPresenceCreateInput!) { webPresenceCreate(input: $input) { webPresence { id } userErrors { field message code } } }`, { input: { domainId: dom.id, defaultLocale: M.doman.standard, alternateLocales: M.doman.alternativa } });
    if (r.fel.length) throw new Error(`webPresenceCreate: ${r.fel.join('; ')}`);
    wp = { id: r.data.webPresenceCreate.webPresence.id, markets: { nodes: [] } };
    log(`✅ närvaro ${wp.id}`);
  }
  if (!wp.markets.nodes.some((x) => x.id === mk.id)) {
    if (!skarpt) { log(`torrt: ${dom.host} kopplas till ${mk.name}`); return; }
    const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { id } userErrors { field message } } }`, { id: mk.id, input: { webPresencesToAdd: [wp.id] } });
    if (r.fel.length) throw new Error(`Koppla ${dom.host}: ${r.fel.join('; ')}`);
    log(`✅ ${dom.host} kopplad till ${mk.name}`);
  } else log(`${dom.host}: kopplad till ${mk.name}`);
}

async function stegPublicera(k, { skarpt }) {
  const lage = await hamtaLage(k);
  const f = lage.locales.find((x) => x.locale === LOCALE);
  if (!f) { log('⚠️ engelska är inte aktiverad — kör --steg sprak'); return; }
  if (f.published) { log('engelska är publicerad'); return; }
  if (!skarpt) { log('torrt: skulle publicera engelska'); return; }
  const r = await mutation(k, `mutation($l: String!, $s: ShopLocaleInput!) { shopLocaleUpdate(locale: $l, shopLocale: $s) { shopLocale { published } userErrors { field message } } }`, { l: LOCALE, s: { published: true } });
  if (r.fel.length) throw new Error(`Publicera: ${r.fel.join('; ')}`);
  log('✅ engelska publicerad');
}

async function stegKontroll() {
  log('Kundvyn: node worldwide/kundvy.mjs (läser beaverstoreco.com som kund i varje land).');
}

const STEG = { marknader: stegMarknader, sprak: stegSprak, frakt: stegFrakt, prislista: stegPrislista, oversattningar: stegOversattningar, domaner: stegDomaner, publicera: stegPublicera, kontroll: stegKontroll };
const ORDNING = ['marknader', 'sprak', 'frakt', 'prislista', 'oversattningar', 'domaner', 'publicera', 'kontroll'];

async function huvud() {
  const a = process.argv.slice(2);
  const skarpt = a.includes('--skarpt');
  const k = await klient();
  const s = await scopes(k);
  const saknas = saknadeScopes(s.scopes);
  log(`Butik ${k.shop} via appen "${s.app}"${skarpt ? '  SKARPT' : '  (torrt — --skarpt skriver)'}`);
  if (a.includes('--kolla') || saknas.length) {
    log(saknas.length ? `🖐 appen saknar ${saknas.join(', ')} — worldwide/cowork/1-app-och-doman.txt (steg 1) lägger till dem.` : `✅ appen har alla ${KONFIG.butik.kravda_scopes.length} scopes`);
    if (saknas.length) process.exit(3);
    if (a.includes('--kolla')) return;
  }
  if (a.includes('--lage')) { skrivLage(await hamtaLage(k)); return; }
  const valda = a.includes('--alla') ? ORDNING : (a[a.indexOf('--steg') + 1] ?? '').split(',').filter(Boolean);
  if (!valda.length) { console.error(`Ange --kolla, --lage, --alla eller --steg a,b. Steg: ${ORDNING.join(', ')}`); process.exit(2); }
  for (const st of valda) {
    if (!STEG[st]) throw new Error(`Okänt steg ${st}`);
    log(`\n── ${st} ──`);
    await STEG[st](k, { skarpt });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
