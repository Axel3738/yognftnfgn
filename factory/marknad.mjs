// Marknadssteget (KEDJAN.md steg 16–17, PROCESS.md fas 4): marknad + locale +
// webPresence, och ALLT översatt via translationsRegister — produkt, metafält,
// variantvärden, kollektion, sidor, menylänkar, policyer, paket-metaobjekt,
// temats JSON-mallar, sektionsgrupper och temainställningar.
//
//   node factory/marknad.mjs <butik-id> [--locale nb] [--torr]
//
// SE + NO är standard i varje OPS (Axels beslut 2026-09-08). Marknaderna
// kommer ur butiker/<id>.yaml (`butik.marknader`), aldrig härifrån.
//
// Vad API:t KAN: skapa marknad, lägga till region, aktivera och publicera en
// locale, lägga locale:n som alternateLocale på webPresence, koppla
// webPresence till marknaden (webPresencesToAdd — utan det är /nb bara ett
// språk på Sveriges domän, mätt på DryTrek 2026-09-10), registrera
// översättningar. Vad API:t INTE kan: byta butikens PRIMÄRSPRÅK och slå på
// NOK (unified markets). Båda är klick i adminen och står i VA:ns checklista.
//
// Tre mätningar mot Admin-API 2025-07 (DryTrek + TackleBay 2026-09-09):
//   - `marketCreate` kan ge status DRAFT — marknaden aktiveras separat.
//   - `webPresences` läses på ROTNIVÅ; fältet under `markets` svarade tom
//     lista på en butik som ändå hade en webPresence.
//   - `webPresenceUpdate` tar `id` + `input` (inte webPresenceId/webPresence).
//
// Översättningen läses ur factory/output/<butik>/oversattning-<locale>.json
// (skriven av en subagent ur oversattning-sv.json, samma nycklar — formatet
// står i oversattning.mjs). Matchningen mot Shopify görs på VÄRDE: varje
// översättningsbar sträng i butiken vars svenska text finns i underlaget får
// sin motsvarighet. Ingen gissar Shopifys nycklar (temats är hashade per
// sektion), och allt svenskt som blev kvar listas som läckor i stället för
// att tyst stå kvar på /nb. Nyckelmatchning används med flit INTE som reserv:
// har källtexten ändrats sedan underlaget skrevs är översättningen inaktuell,
// och då ska det synas — inte registreras.
//
// ⚠️ Tema-översättningar är knutna till TEMA-ID. Klonas temat måste raderna
// registreras om — nycklar och digests är stabila mellan kloner. Noll beroenden.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaProduktViaHandle, hamtaArbetstema, kontrolleraAnslutning } from './shopify.mjs';
import { lasState } from './state.mjs';
import { lasOversattning, lasUnderlag, byggMinimalKontext } from './oversattning.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));

// ---- Ren logik (testad i test/marknad.test.mjs) ------------------------------

// Matchningsnyckel: Shopify normaliserar HTML (radbrytningar mellan taggar,
// blanksteg) — jämför utan sådant mellanrum så en identisk text inte ser
// olik ut.
export const norm = (s) => String(s ?? '').replace(/\r\n/g, '\n').replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();

const LANDSNAMN = { NO: 'Norge', DK: 'Danmark', FI: 'Finland', SE: 'Sverige', DE: 'Tyskland', GB: 'Storbritannien' };
export const landsnamn = (kod) => LANDSNAMN[String(kod ?? '').toUpperCase()] ?? String(kod ?? '').toUpperCase();

// Kartan svensk text → översatt text ur de två underlagsfilerna. Nycklar som
// börjar med `_` är anteckningar, och värden som inte är strängar hoppas över.
// Ord som är likadana på båda språken (Kontakt, Returpolicy …) är ingen läcka
// — de samlas för sig så rapporten inte larmar på dem. Två nycklar med samma
// svenska text men OLIKA översättning är en konflikt: första vinner, resten
// rapporteras.
export function byggKarta(sv, nb) {
  const karta = new Map();
  const samma = new Set();
  const konflikter = [];
  for (const [k, v] of Object.entries(sv ?? {})) {
    if (k.startsWith('_') || typeof v !== 'string') continue;
    const till = nb?.[k];
    if (typeof till !== 'string' || !norm(till)) continue;
    const fran = norm(v);
    if (!fran) continue;
    if (norm(till) === fran) { samma.add(fran); continue; }
    if (karta.has(fran) && karta.get(fran) !== till) { konflikter.push({ nyckel: k, sv: fran.slice(0, 60) }); continue; }
    karta.set(fran, till);
  }
  return { karta, samma, konflikter };
}

// Parar en resurs' översättningsbara innehåll mot kartan. `befintliga` är
// Map(key → { value, outdated }) — en rad som redan bär samma översättning
// och inte är outdated skickas inte om. Digesten följer ALLTID med från samma
// läsning som texten: ändras källan avvisar Shopify raden, och det är
// meningen. Returnerar { rader, kvar } där kvar är svenska texter utan
// översättning (= potentiella läckor).
export function paraResurs(translatableContent, karta, befintliga = new Map()) {
  const rader = [];
  const kvar = [];
  for (const c of translatableContent ?? []) {
    const sv = norm(c.value);
    if (!sv) continue;
    const till = karta.get(sv);
    if (!till) { kvar.push({ key: c.key, value: sv.slice(0, 60) }); continue; }
    const redan = befintliga.get(c.key);
    if (redan && !redan.outdated && norm(redan.value) === norm(till)) continue;
    rader.push({ key: c.key, value: till, digest: c.digest });
  }
  return { rader, kvar };
}

// Tema-resursernas id:n. translatableResources(resourceType: …) listar bara
// LIVE-temat (mätt 2026-09-08) — utkasttemats mallar nås via
// translatableResourcesByIds med konstruerade id:n ur temats fillista.
export function temaResursIds(temaId, filnamn) {
  const temaNr = String(temaId).split('/').pop();
  const mallar = filnamn.filter((x) => /^templates\/[^/]+\.json$/.test(x));
  const grupper = filnamn.filter((x) => /^sections\/[^/]+-group\.json$/.test(x));
  return [
    ...mallar.map((x) => `gid://shopify/OnlineStoreThemeJsonTemplate/${x.replace(/^templates\//, '').replace(/\.json$/, '')}?theme_id=${temaNr}`),
    ...grupper.map((x) => `gid://shopify/OnlineStoreThemeSectionGroup/${x.replace(/^sections\//, '').replace(/\.json$/, '')}?theme_id=${temaNr}`),
    `gid://shopify/OnlineStoreThemeSettingsDataSections/${temaNr}`,
  ];
}

export function typUrResursId(resourceId) {
  const id = String(resourceId);
  if (id.includes('Metafield/')) return 'metafält';
  if (id.includes('ProductOptionValue/')) return 'variant';
  if (id.includes('ProductOption/')) return 'variant';
  if (id.includes('/Product/')) return 'produkt';
  if (id.includes('SectionGroup/')) return 'sektionsgrupp';
  if (id.includes('SettingsData') || id.includes('SettingsCategory')) return 'temainställning';
  if (id.includes('JsonTemplate/')) return 'temamall';
  if (id.includes('LocaleContent')) return 'temasträng';
  if (id.includes('/Page/')) return 'sida';
  if (id.includes('/Link/')) return 'menylänk';
  if (id.includes('/Metaobject/')) return 'paket';
  if (id.includes('ShopPolicy/')) return 'policy';
  if (id.includes('/Collection/')) return 'kollektion';
  return 'övrigt';
}

// Tekniska värden (handle, ikon-/layoutord, rabattkoder, URL:er) och Shopifys
// egen integritetspolicy-mall (Liquid, kan inte översättas via API — byts i
// admin under Policyer) är inga läckor. Kundkontots meny (Orders/Profile) är
// Shopifys egen.
const TEKNISKT = /^(shopify:\/\/|https?:\/\/|\/|[a-z0-9_-]+$|[A-Z0-9_]+$|#[0-9a-fA-F]{3,8}$|-?\d+([.,]\d+)?$)/;
export function arLacka(l, samma = new Set()) {
  if (TEKNISKT.test(l.value)) return false;
  if (samma.has(l.value)) return false;
  // Ren Liquid ("{{ product.vendor }}") är ingen text — kunden ser värdet,
  // inte uttrycket (AdventLane 2026-09-10).
  if (/^\{\{[^}]*\}\}$/.test(String(l.value).trim())) return false;
  if (/^(handle|product_type|meta_description|ab_variant|rabattkod)$/.test(l.key)) return false;
  if (l.typ === 'policy' && l.value.includes('{{')) return false;
  if (l.typ === 'menylänk' && /^(Orders|Profile)$/.test(l.value)) return false;
  if (l.typ === 'variant' && l.value === 'Default Title') return false;
  return true;
}

// ---- Läge, locale, marknad, webbnärvaro --------------------------------------

export async function hamtaLage() {
  const d = await graphql(`query opsFactoryMarknadslage {
    shopLocales { locale name primary published }
    markets(first: 50) {
      nodes {
        id name handle status primary
        conditions { regionsCondition { regions(first: 20) { nodes { ... on MarketRegionCountry { code } } } } }
      }
    }
    webPresences(first: 20) {
      nodes { id domain { host } defaultLocale { locale } alternateLocales { locale } }
    }
  }`);
  return {
    locales: d.shopLocales ?? [],
    marknader: d.markets?.nodes ?? [],
    webPresences: d.webPresences?.nodes ?? [],
  };
}

// Länderna en marknad täcker, ur hamtaLage()-formen (regions → koder).
const marknadensLander = (m) =>
  (m?.conditions?.regionsCondition?.regions?.nodes ?? []).map((r) => String(r?.code ?? '').toUpperCase()).filter(Boolean);

/**
 * Är butikens primärmarknad rätt land? Ren logik över hamtaLage().marknader.
 *
 * ⚠️ CatCabin 2026-09-11: efter checklistans avsnitt 2 stod Norge som
 * primärmarknad (och den gamla Filippinerna-marknaden omdöpt till "Sweden").
 * Då blev VARJE variant `available: false` i kundvyn — paketväljaren och
 * sticky-knappen försvann — medan steget `huvudmarknad` var grönt, för det
 * kontrollerade bara valutan. Primärmarknaden kan inte sättas via API
 * (API-GRANSER.md), så fel svar här blir ett 🖐 med exakt klick.
 *
 * → { ok, primar: { name, lander } | null, skal }
 */
export function kontrolleraPrimarmarknad(marknader, land) {
  const l = String(land ?? '').toUpperCase();
  const primar = (marknader ?? []).find((m) => m?.primary === true) ?? null;
  if (!l) return { ok: false, primar: null, skal: 'butik.land saknas — kan inte veta vilken marknad som ska vara primär.' };
  if (!primar) return { ok: false, primar: null, skal: 'ingen marknad är markerad som primär i Shopify (markets.primary) — kontrollera Settings → Markets.' };
  const lander = marknadensLander(primar);
  if (lander.includes(l)) return { ok: true, primar: { name: primar.name, lander }, skal: '' };
  return {
    ok: false,
    primar: { name: primar.name, lander },
    skal:
      `primärmarknaden är "${primar.name}" (${lander.join(', ') || 'inga länder'}), inte ${l}. ` +
      `Settings → Markets → marknaden för ${l} → Set as primary. Kan inte sättas via API. ` +
      'Utan det är varje variant otillgänglig i kundvyn (paketväljaren och sticky-knappen renderas inte — mätt 2026-09-11).',
  };
}

const userErrors = (svar, namn) => {
  const fel = svar?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`${namn}: ${fel.map((f) => f.message).join('; ')}`);
};

export async function sakerstallLocale(locale, { torr = false } = {}) {
  const lage = await hamtaLage();
  const finns = lage.locales.find((l) => l.locale === locale);
  if (finns?.published || finns?.primary) return { locale, skapad: false, publicerad: true };
  if (torr) return { locale, skapad: !finns, publicerad: false, torr: true };
  if (!finns) {
    const e = await graphql(
      `mutation opsFactoryLocale($locale: String!) {
        shopLocaleEnable(locale: $locale) { shopLocale { locale name primary published } userErrors { field message } }
      }`,
      { locale }
    );
    userErrors(e.shopLocaleEnable, `Locale ${locale}`);
  }
  const u = await graphql(
    `mutation opsFactoryLocalePublicera($locale: String!, $shopLocale: ShopLocaleInput!) {
      shopLocaleUpdate(locale: $locale, shopLocale: $shopLocale) { shopLocale { locale published } userErrors { field message } }
    }`,
    { locale, shopLocale: { published: true } }
  );
  userErrors(u.shopLocaleUpdate, `Publicera ${locale}`);
  return { locale, skapad: !finns, publicerad: true };
}

// marketCreate kan ge DRAFT — aktiveras separat (mätt på DryTrek 2026-09-09).
export async function aktiveraMarknad(id) {
  const d = await graphql(
    `mutation opsFactoryMarknadAktivera($id: ID!, $input: MarketUpdateInput!) {
      marketUpdate(id: $id, input: $input) { market { id name status } userErrors { field message } }
    }`,
    { id, input: { enabled: true } }
  );
  userErrors(d.marketUpdate, 'Aktivera marknaden');
  return d.marketUpdate.market;
}

// `marknad` är raden ur butik.yaml: { land, locale, valuta }. Hittas på
// regionens landskod först, annars på handle/namn (butiker byggda för hand).
export async function sakerstallMarknad(marknad, { torr = false } = {}) {
  const land = String(marknad?.land ?? '').toUpperCase();
  if (!land) throw new Error('marknad.land saknas i butik.marknader.');
  const namn = landsnamn(land);
  const handle = land.toLowerCase();
  const lage = await hamtaLage();
  let mk = lage.marknader.find((m) => (m.conditions?.regionsCondition?.regions?.nodes ?? []).some((r) => r.code === land))
    ?? lage.marknader.find((m) => m.handle === handle || String(m.name).toLowerCase() === namn.toLowerCase());
  let skapad = false;
  if (!mk) {
    if (torr) return { id: null, namn, skapad: true, status: null, torr: true };
    const d = await graphql(
      `mutation opsFactoryMarknad($input: MarketCreateInput!) {
        marketCreate(input: $input) { market { id name handle status } userErrors { field message } }
      }`,
      { input: { name: namn, handle, status: 'ACTIVE', conditions: { regionsCondition: { regions: [{ countryCode: land }] } } } }
    );
    userErrors(d.marketCreate, `Marknad ${namn}`);
    mk = d.marketCreate.market;
    skapad = true;
  }
  if (mk.status && mk.status !== 'ACTIVE' && !torr) mk = { ...mk, ...(await aktiveraMarknad(mk.id)) };
  return { id: mk.id, namn: mk.name ?? namn, skapad, status: mk.status ?? null };
}

// Locale:n som alternateLocale på VARJE webbnärvaro (domänen + myshopify) —
// webPresenceUpdate, INTE market-varianten (PROCESS.md fas 4 steg 13).
export async function laggTillAlternateLocale(locale, { torr = false } = {}) {
  const lage = await hamtaLage();
  if (lage.webPresences.length === 0) return { manuell: 'Butiken har ingen webPresence att haka språket på ännu.', presences: [] };
  const presences = [];
  for (const wp of lage.webPresences) {
    const har = (wp.alternateLocales ?? []).map((l) => l.locale);
    const host = wp.domain?.host ?? wp.id;
    if (har.includes(locale) || wp.defaultLocale?.locale === locale) { presences.push({ id: wp.id, host, redan: true }); continue; }
    if (torr) { presences.push({ id: wp.id, host, redan: false, torr: true }); continue; }
    const u = await graphql(
      `mutation opsFactoryWebPresence($id: ID!, $input: WebPresenceUpdateInput!) {
        webPresenceUpdate(id: $id, input: $input) { webPresence { id alternateLocales { locale } } userErrors { field message } }
      }`,
      { id: wp.id, input: { alternateLocales: [...har, locale] } }
    );
    userErrors(u.webPresenceUpdate, `webPresence ${host}`);
    presences.push({ id: wp.id, host, redan: false });
  }
  return { presences };
}

// Webbnärvaron måste KOPPLAS till marknaden, annars är /nb bara ett språk på
// Sveriges domän: norsk text, svenska priser, kassa i SEK (mätt 2026-09-10
// på DryTrek efter en dag med live norska annonser). Med närvaron kopplad
// väljer Shopify NOK på norsk IP; huvudmarknaden förblir default för andra.
// marketUpdate(webPresencesToAdd) med ALLA webPresence-id:n — "already" i
// userErrors betyder redan kopplad, och det är rätt läge, inte ett fel.
export async function kopplaPresence(marketId, { torr = false } = {}) {
  const lage = await hamtaLage();
  const ids = lage.webPresences.map((w) => w.id);
  const hosts = lage.webPresences.map((w) => w.domain?.host ?? w.id);
  if (ids.length === 0) return { manuell: 'Ingen webPresence att koppla ännu.', hosts: [] };
  if (torr || !marketId) return { hosts, redan: false, torr: true };
  const d = await graphql(
    `mutation opsFactoryMarknadPresence($id: ID!, $input: MarketUpdateInput!) {
      marketUpdate(id: $id, input: $input) {
        market { id webPresences(first: 10) { nodes { id domain { host } } } }
        userErrors { field message }
      }
    }`,
    { id: marketId, input: { webPresencesToAdd: ids } }
  );
  const fel = d.marketUpdate?.userErrors ?? [];
  const redan = fel.length > 0 && fel.every((f) => /already/i.test(f.message));
  if (fel.length > 0 && !redan) throw new Error(`Koppla webPresence: ${fel.map((f) => f.message).join('; ')}`);
  const noder = d.marketUpdate?.market?.webPresences?.nodes ?? [];
  return { hosts: noder.length > 0 ? noder.map((w) => w.domain?.host ?? w.id) : hosts, redan };
}

// Hela marknadssteget för en butik: marknad + locale + webbnärvaro (som
// alternateLocale OCH kopplad till marknaden) per rad i butik.marknader.
// Det ops.mjs steg 16 anropar.
export async function sakerstallMarknader(butik, { torr = false } = {}) {
  const rader = Array.isArray(butik?.butik?.marknader) ? butik.butik.marknader : [];
  if (rader.length === 0) throw new Error('butik.marknader är tom — SE + NO är standard i varje OPS.');
  const ut = [];
  for (const m of rader) {
    const marknad = await sakerstallMarknad(m, { torr });
    const locale = await sakerstallLocale(String(m.locale), { torr });
    const wp = await laggTillAlternateLocale(String(m.locale), { torr });
    const koppling = await kopplaPresence(marknad.id, { torr });
    ut.push({ land: String(m.land).toUpperCase(), locale: String(m.locale), valuta: m.valuta ?? null, marknad, localeLage: locale, webPresence: wp, koppling });
  }
  return ut;
}

// ---- Översättningar -----------------------------------------------------------

export async function hamtaOversattbara(resourceId) {
  const d = await graphql(
    `query opsFactoryOversattbar($id: ID!) {
      translatableResource(resourceId: $id) { resourceId translatableContent { key value digest locale } }
    }`,
    { id: resourceId }
  );
  return d.translatableResource?.translatableContent ?? [];
}

async function translatableIds(ids) {
  const ut = [];
  for (let i = 0; i < ids.length; i += 50) {
    const d = await graphql(
      `query opsFactoryTr($ids: [ID!]!) {
        translatableResourcesByIds(first: 50, resourceIds: $ids) { nodes { resourceId translatableContent { key value digest locale } } }
      }`,
      { ids: ids.slice(i, i + 50) }
    );
    ut.push(...(d.translatableResourcesByIds?.nodes ?? []));
  }
  return ut;
}

async function translatableTyp(typ) {
  const ut = [];
  let cursor = null;
  for (let i = 0; i < 20; i++) {
    const d = await graphql(
      `query opsFactoryTrTyp($typ: TranslatableResourceType!, $cursor: String) {
        translatableResources(first: 100, resourceType: $typ, after: $cursor) {
          nodes { resourceId translatableContent { key value digest locale } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { typ, cursor }
    );
    ut.push(...(d.translatableResources?.nodes ?? []));
    if (!d.translatableResources?.pageInfo?.hasNextPage) break;
    cursor = d.translatableResources.pageInfo.endCursor;
  }
  return ut;
}

async function befintliga(resourceId, locale) {
  const d = await graphql(
    `query opsFactoryTrHar($id: ID!, $locale: String!) {
      translatableResource(resourceId: $id) { translations(locale: $locale) { key value outdated } }
    }`,
    { id: resourceId, locale }
  );
  return new Map((d.translatableResource?.translations ?? []).map((t) => [t.key, t]));
}

// Registrerar [{ key, value, digest }] på EN resurs, i omgångar om 100.
export async function registrera(resourceId, locale, rader) {
  if (!rader || rader.length === 0) return { antal: 0 };
  let antal = 0;
  for (let i = 0; i < rader.length; i += 100) {
    const d = await graphql(
      `mutation opsFactoryOversatt($id: ID!, $translations: [TranslationInput!]!) {
        translationsRegister(resourceId: $id, translations: $translations) { translations { key } userErrors { field message } }
      }`,
      {
        id: resourceId,
        translations: rader.slice(i, i + 100).map((r) => ({ key: r.key, value: r.value, locale, translatableContentDigest: r.digest })),
      }
    );
    userErrors(d.translationsRegister, `Översättning ${resourceId}`);
    antal += (d.translationsRegister.translations ?? []).length;
  }
  return { antal };
}

// Alla resurser butiken bär text i: [{ id, typ, handle?, translatableContent }].
// Produkterna kommer ur ctx.produkter (pk.p eller p), tema-filerna filtreras
// på arbetstemat (temaId). Sidor, menylänkar, policyer, paket och
// kollektioner listas för hela butiken — en OPS-butik har inga andra.
export async function samlaResurser(ctx, temaId) {
  const ut = [];
  const produkter = (ctx?.produkter ?? []).map((pk) => pk?.p ?? pk);
  const handles = [];
  for (const p of produkter) {
    if (p?.produkt?.id) handles.push({ handle: p.produkt.id, typ: 'produkt' });
    const bonus = p?.offer?.bonus_produkt?.handle;
    if (bonus && !handles.some((h) => h.handle === bonus)) handles.push({ handle: bonus, typ: 'bonus' });
  }
  for (const { handle, typ } of handles) {
    const produkt = await hamtaProduktViaHandle(handle);
    if (!produkt) {
      if (typ === 'produkt') throw new Error(`Produkten ${handle} finns inte — kör ops.mjs först.`);
      continue; // bonusen är valfri (steg 9 kan ha lämnat den manuell)
    }
    const mf = await graphql(
      `query opsFactoryMf($id: ID!) {
        product(id: $id) { metafields(first: 30, namespace: "opf") { nodes { id key type } } options { id optionValues { id name } } }
      }`,
      { id: produkt.id }
    );
    const metafalt = (mf.product?.metafields?.nodes ?? []).filter((m) => m.type !== 'url');
    const optionValueIds = (mf.product?.options ?? []).flatMap((o) => o.optionValues.map((v) => v.id));
    const ids = [produkt.id, ...metafalt.map((m) => m.id), ...optionValueIds];
    for (const r of await translatableIds(ids)) {
      const falt = metafalt.find((m) => m.id === r.resourceId)?.key ?? null;
      ut.push({ id: r.resourceId, typ: typUrResursId(r.resourceId), handle, falt, translatableContent: r.translatableContent ?? [] });
    }
  }

  const typer = [['PAGE', 'sida'], ['LINK', 'menylänk'], ['METAOBJECT', 'paket'], ['SHOP_POLICY', 'policy']];
  if (produkter.length > 1 || ctx?.kollektion?.handle) typer.push(['COLLECTION', 'kollektion']);
  for (const [typ, namn] of typer) {
    for (const r of await translatableTyp(typ)) {
      if (typ === 'METAOBJECT' && !r.resourceId.includes('Metaobject/')) continue;
      ut.push({ id: r.resourceId, typ: namn, translatableContent: r.translatableContent ?? [] });
    }
  }

  if (temaId) {
    const temaNr = String(temaId).split('/').pop();
    // Temat har ~400 filer — filtrera på mönster i frågan i stället för att
    // lista alla (first: 250 tappade templates/ och sections/, mätt 2026-09-08).
    const f = await graphql(
      `query opsFactoryTemaFiler($id: ID!) { theme(id: $id) { files(first: 250, filenames: ["templates/*.json", "sections/*-group.json"]) { nodes { filename } } } }`,
      { id: temaId }
    );
    const filnamn = (f.theme?.files?.nodes ?? []).map((x) => x.filename);
    for (const r of await translatableIds(temaResursIds(temaId, filnamn))) {
      if ((r.translatableContent ?? []).length === 0) continue;
      ut.push({ id: r.resourceId, typ: typUrResursId(r.resourceId), translatableContent: r.translatableContent });
    }
    // Temainställningarnas texter (sidfotens brand_description m.fl.) ligger
    // under SETTINGS_CATEGORY — den typen listar även utkasttemat (mätt
    // 2026-09-08). Temats egna locale-strängar (Dela, Snabblänkar …) tas
    // med på samma villkor: bara rader som bär vårt theme_id. Om typen
    // saknar theme_id i id:t hoppas den över — hellre en läcka i rapporten
    // än en rad registrerad på fel tema.
    for (const typ of ['ONLINE_STORE_THEME_SETTINGS_CATEGORY', 'ONLINE_STORE_THEME_LOCALE_CONTENT']) {
      let noder = [];
      try { noder = await translatableTyp(typ); } catch { continue; } // typen finns inte i API-versionen
      for (const r of noder) {
        if (!r.resourceId.includes(`theme_id=${temaNr}`)) continue;
        ut.push({ id: r.resourceId, typ: typUrResursId(r.resourceId), translatableContent: r.translatableContent ?? [] });
      }
    }
  }
  return ut;
}

// Registrerar allt. `oversattning` är det lasOversattning() ger ({ sv, nb })
// eller ett platt { nyckel: text } — då läses sv-underlaget ur output/<butik>/.
// Returnerar { registrerade, saknade, perTyp, resurser, konflikter }; saknade
// är de svenska texter som blev kvar (läckor på /<locale>), redan filtrerade
// från tekniska värden och ord som är lika på båda språken.
export async function oversattAllt(ctx, locale, oversattning, { temaId = null, torr = false } = {}) {
  const butikId = ctx?.butik?.butik?.id;
  const nb = oversattning?.nb ?? oversattning;
  const sv = oversattning?.sv ?? (butikId ? lasUnderlag(butikId) : null);
  if (!sv) throw new Error(`Saknar output/${butikId}/oversattning-sv.json — kör oversattning.byggUnderlag först.`);
  if (!nb || typeof nb !== 'object') throw new Error(`Saknar oversattning-${locale}.json för ${butikId}.`);
  const { karta, samma, konflikter } = byggKarta(sv, nb);

  const resurser = await samlaResurser(ctx, temaId);
  const perTyp = {};
  const lackor = [];
  let registrerade = 0;
  for (const r of resurser) {
    const har = torr ? new Map() : await befintliga(r.id, locale);
    const { rader, kvar } = paraResurs(r.translatableContent, karta, har);
    if (rader.length > 0 && !torr) await registrera(r.id, locale, rader);
    registrerade += rader.length;
    perTyp[r.typ] = (perTyp[r.typ] ?? 0) + rader.length;
    for (const k of kvar) lackor.push({ typ: r.typ, id: String(r.id).split('/').pop().split('?')[0], handle: r.handle ?? null, ...k });
  }
  const saknade = lackor.filter((l) => arLacka(l, samma));
  return { registrerade, saknade, perTyp, resurser: resurser.length, konflikter, torr };
}

// ---- CLI ----------------------------------------------------------------------

// Produkterna som hör till butiken: statefilerna <butik>--<produkt>.json, i
// andra hand produktfiler på kommandoraden.
function produktfilerFor(butikId, extra) {
  const ut = extra.filter((a) => a.endsWith('.yaml'));
  if (ut.length > 0) return ut;
  const stateMapp = join(FACTORY_ROT, 'state');
  const ids = existsSync(stateMapp)
    ? readdirSync(stateMapp).filter((f) => f.startsWith(`${butikId}--`) && f.endsWith('.json') && !f.endsWith('--_butik.json')).map((f) => f.slice(butikId.length + 2, -5))
    : [];
  const mapp = join(FACTORY_ROT, 'produkter');
  for (const fil of readdirSync(mapp).filter((f) => f.endsWith('.yaml'))) {
    const rad = lasYaml(readFileSync(join(mapp, fil), 'utf8'));
    if (ids.includes(String(rad?.produkt?.id))) ut.push(join(mapp, fil));
  }
  return ut;
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const torr = arg.includes('--torr') || arg.includes('--dry');
  const locale = arg.includes('--locale') ? arg[arg.indexOf('--locale') + 1] : null;
  const fria = arg.filter((a, i) => !a.startsWith('--') && arg[i - 1] !== '--locale');
  const butikId = fria.find((a) => !a.endsWith('.yaml'));
  if (!butikId) {
    console.error('Användning: node factory/marknad.mjs <butik-id> [--locale nb] [--torr] [produkt.yaml …]');
    process.exit(1);
  }
  const butiksfil = join(FACTORY_ROT, 'butiker', `${butikId}.yaml`);
  if (!existsSync(butiksfil)) throw new Error(`Hittar inte ${butiksfil}.`);
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const produktfiler = produktfilerFor(butikId, fria);
  if (produktfiler.length === 0) throw new Error(`Inga produkter för ${butikId} — ange produktfiler eller kör ops.mjs först.`);
  const ctx = byggMinimalKontext(butik, produktfiler.map((f) => lasYaml(readFileSync(f, 'utf8'))));

  const shop = await kontrolleraAnslutning();
  console.log(`Connected: ${shop.myshopifyDomain} ✓${torr ? '  (torrkörning)' : ''}`);
  const state = lasState(butikId, '_butik');
  const temaIdUrState = state.steg?.['tema-upload']?.arbetstemaId ?? state.steg?.['tema-upload']?.temaId ?? state.steg?.tema?.temaId ?? null;
  const tema = await hamtaArbetstema(temaIdUrState);
  console.log(`Tema: ${tema?.name ?? '—'} (${tema?.role ?? '?'})`);

  const lage = await hamtaLage();
  console.log(`Primärspråk: ${lage.locales.find((l) => l.primary)?.locale ?? '?'} · locales: ${lage.locales.map((l) => `${l.locale}${l.published ? '' : ' (opublicerad)'}`).join(', ')}`);
  console.log(`Marknader: ${lage.marknader.map((m) => `${m.name} [${m.handle}] ${m.status}`).join(', ') || '—'}`);

  const rader = Array.isArray(butik.butik?.marknader) ? butik.butik.marknader : [];
  for (const m of rader) {
    if (locale && String(m.locale) !== locale) continue;
    const r = (await sakerstallMarknader({ butik: { ...butik.butik, marknader: [m] } }, { torr }))[0];
    console.log(`\n✅ Marknad ${r.marknad.namn}: ${r.marknad.skapad ? (torr ? 'skulle skapas' : 'skapad') : 'finns'}${r.marknad.status ? ` (${r.marknad.status})` : ''}`);
    console.log(`✅ Språk ${r.locale}: ${r.localeLage.skapad ? (torr ? 'skulle aktiveras' : 'aktiverat') : 'fanns'}${r.localeLage.publicerad ? ', publicerat' : ''}`);
    if (r.webPresence.manuell) console.log(`🖐 webPresence: ${r.webPresence.manuell}`);
    for (const wp of r.webPresence.presences) console.log(`   webbnärvaro ${wp.host}: ${wp.redan ? `har ${r.locale}` : torr ? `skulle få ${r.locale}` : `${r.locale} tillagd`}`);
    if (r.koppling.manuell) console.log(`🖐 Marknaden ${r.marknad.namn} → webbnärvaro: ${r.koppling.manuell}`);
    else console.log(`✅ Marknaden ${r.marknad.namn} ${torr ? 'skulle kopplas' : r.koppling.redan ? 'var redan kopplad' : 'kopplad'} till webbnärvaron: ${r.koppling.hosts.join(', ')}`);
    console.log(`🖐 Valutan ${m.valuta ?? 'NOK'} slås på i admin: Inställningar → Marknader → ${r.marknad.namn} (API-spärrat i unified markets).`);

    const ov = lasOversattning(butikId, r.locale);
    if (!ov) {
      console.log(`\n🖐 Ingen output/${butikId}/oversattning-${r.locale}.json — kör factory/oversattning.mjs och låt subagenten skriva ${r.locale}-filen.`);
      continue;
    }
    if (!ov.sv) {
      console.log(`\n🖐 Ingen output/${butikId}/oversattning-sv.json — kör factory/oversattning.mjs först.`);
      continue;
    }
    const res = await oversattAllt(ctx, r.locale, ov, { temaId: tema?.id ?? null, torr });
    console.log(`\nÖversättningar ${r.locale}: ${res.resurser} resurser lästa.`);
    for (const [typ, n] of Object.entries(res.perTyp)) console.log(`   ${typ}: ${n} ${torr ? 'skulle registreras' : 'registrerade'}`);
    if (res.konflikter.length > 0) console.log(`⚠️  ${res.konflikter.length} nycklar med samma svenska text men olika översättning (första vann): ${res.konflikter.map((k) => k.nyckel).join(', ')}`);
    if (res.saknade.length > 0) {
      console.log(`\n⚠️  ${res.saknade.length} svenska texter saknar översättning (läckor på /${r.locale}):`);
      for (const l of res.saknade.slice(0, 40)) console.log(`   ${l.typ} ${l.id} ${l.key}: "${l.value}"`);
      if (res.saknade.length > 40) console.log(`   … +${res.saknade.length - 40} till`);
    } else {
      console.log('\n✅ Inga oöversatta texter kvar i resurserna.');
    }
  }
  console.log('\nTrippelkolla mot kundens vy: /nb på startsidan och produktsidan (kundvy-kor.mjs), svensk regression, mobilkontroll.');
  console.log('🖐 Kvar som klick i adminen: butikens primärspråk och NOK. API:t kan inte sätta dem.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
