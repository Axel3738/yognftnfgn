// bygg.mjs — Matstrumpors marknader i Shopify, steg för steg och idempotent.
//
//   node matstrumpor/marknader/bygg.mjs --lage                 # bara läsa: marknader, språk, valutor, frakt, prislistor
//   node matstrumpor/marknader/bygg.mjs --steg marknader       # torrt (standard): säg vad som skulle göras
//   node matstrumpor/marknader/bygg.mjs --steg marknader --skarpt
//   node matstrumpor/marknader/bygg.mjs --alla --skarpt        # hela kedjan i rätt ordning
//
// Stegen, i den ordning --alla kör dem (varje steg går att köra ensamt):
//   definition     ms_paketniva translatable (annars finns paketnivåerna inte i underlaget)
//   marknader      marketCreate/aktivera, länder, basvaluta, lokala valutor — ur konfig.json
//   sprak          shopLocaleEnable för nb/da/fi/en (INTE publicera: en publicerad locale utan
//                  översättningar visar svenska texter med norska knappar)
//   frakt          fri frakt-zoner för launchländerna, länderna ut ur EU/Internationell (299 kr)
//   prislista      fasta USD-priser på den engelska marknaden (priceList + catalog + fixedPrices)
//   oversattningar translationsRegister ur output/underlag-<locale>.json — granska.mjs först, 0 fel krävs
//   tema           locale-grenar i ms-*.liquid + custom_liquid-blocken i mallarna (temapatch.mjs)
//   publicera      publicera localerna, alternateLocales på webbnärvaron, koppla närvaron till marknaderna
//
// Källor: factory/marknad.mjs (receptet: marketCreate → DRAFT ⇒ aktivera, webPresences på rotnivå,
// webPresencesToAdd, currencySettings via marketUpdate), factory/prislista.mjs (tre anrop),
// factory/API-GRANSER.md. Klienten är sparning/butik.mjs (appen Fabriken, 1r46tp-qx).
//
// Järnregler: torrt är standard; varje skrivning läses tillbaka; en översättning med fel i
// granska.mjs registreras aldrig; ingen marknad som redan bär en valuta får den bytt; inget i
// Meta rörs härifrån.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';
import { KONFIG, OUTPUT, underlagsfil, resursfil, LIQUID_TEXTER } from './underlag.mjs';
import { granska } from './granska.mjs';
import { patchaFil, patchaMallJson } from './temapatch.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const LOCALES = [...new Set(KONFIG.marknader.flatMap((m) => m.locales))];

// ---- Ren logik (delvis porterad från factory/marknad.mjs, testad i test/bygg.test.mjs) ----

export const norm = (s) => String(s ?? '').replace(/\r\n/g, '\n').replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();

/** Kartan svensk text → översatt text. Lika ord samlas i `samma`; två nycklar med olika översättning av samma svenska = konflikt (första vinner). */
export function byggKarta(sv, mal) {
  const karta = new Map();
  const samma = new Set();
  const konflikter = [];
  for (const [k, v] of Object.entries(sv ?? {})) {
    if (k.startsWith('_') || typeof v !== 'string') continue;
    const till = mal?.[k];
    if (typeof till !== 'string' || !norm(till)) continue;
    const fran = norm(v);
    if (!fran) continue;
    if (norm(till) === fran) { samma.add(fran); continue; }
    if (karta.has(fran) && karta.get(fran) !== till) { konflikter.push({ nyckel: k, sv: fran.slice(0, 60) }); continue; }
    karta.set(fran, till);
  }
  return { karta, samma, konflikter };
}

/** En resurs' translatableContent mot kartan → rader att registrera + svenska texter utan översättning. */
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

const TEKNISKT = /^(shopify:\/\/|https?:\/\/|\/|[a-z0-9_-]+$|[A-Z0-9_]+$|#[0-9a-fA-F]{3,8}$|-?\d+([.,]\d+)?$)/;
export function arLacka(l, samma = new Set()) {
  if (TEKNISKT.test(l.value)) return false;
  if (samma.has(l.value)) return false;
  if (/^\{\{[^}]*\}\}$/.test(String(l.value).trim())) return false;
  if (/^(handle|product_type|meta_description|ab_variant|rabattkod)$/.test(l.key)) return false;
  if (l.value === 'Default Title' || l.value === 'Title') return false;
  if (l.value.includes('{{') && /policy/i.test(l.typ ?? '')) return false;
  return true;
}

/**
 * Fraktplanen — ren logik över konfigens zoner och Shopifys:
 *  - en konfigzon som finns (samma namn, eller `tidigare_namn` när zonen ska döpas om) och
 *    bär exakt sina länder ⇒ `redan`; finns men skiljer ⇒ `uppdatera` till konfigens länder/namn;
 *  - en konfigzon som saknas ⇒ `skapa`;
 *  - varje annan Shopify-zon släpper de länder konfigen gör anspråk på ⇒ `uppdatera`, och blir
 *    den tom ⇒ `radera` (en tom zon är meningslös och Shopify avvisar den).
 * Mätt 2026-09-27: den gamla planen tömde zoner som redan var rätt ("Engelska marknader")
 * bara för att alla dess länder stod i konfigen — därav den här omskrivningen.
 */
export function fraktplan(zonerIShopify, konfigZoner) {
  const lika = (a, b) => a.length === b.length && [...a].sort().every((x, i) => x === [...b].sort()[i]);
  const anspråk = new Set(konfigZoner.flatMap((z) => z.lander));
  const skapa = [], redan = [], uppdatera = [], radera = [];
  const tagna = new Set();
  for (const kz of konfigZoner) {
    const z = zonerIShopify.find((x) => x.namn === kz.namn) ?? (kz.tidigare_namn ? zonerIShopify.find((x) => x.namn === kz.tidigare_namn) : null);
    if (!z) { skapa.push({ namn: kz.namn, lander: kz.lander, metod: kz.metod, pris: kz.pris_sek }); continue; }
    tagna.add(z.id);
    if (lika(z.lander, kz.lander) && z.namn === kz.namn) { redan.push(kz.namn); continue; }
    uppdatera.push({ id: z.id, namn: kz.namn, fore: z.lander, efter: kz.lander, bort: z.lander.filter((c) => !kz.lander.includes(c)), till: kz.lander.filter((c) => !z.lander.includes(c)), bytNamn: z.namn !== kz.namn ? z.namn : null });
  }
  for (const z of zonerIShopify) {
    if (tagna.has(z.id)) continue;
    const kvar = z.lander.filter((c) => !anspråk.has(c));
    if (kvar.length === z.lander.length) continue;
    if (kvar.length === 0) radera.push({ id: z.id, namn: z.namn, fore: z.lander });
    else uppdatera.push({ id: z.id, namn: z.namn, fore: z.lander, efter: kvar, bort: z.lander.filter((c) => anspråk.has(c)), till: [], bytNamn: null });
  }
  return { skapa, redan, uppdatera, radera };
}

/** Priset för en variant ur konfigens fasta_priser: tal för alla varianter, eller objekt per varianttitel. */
export function fastPrisFor(fasta, handle, variantTitel) {
  const p = fasta?.[handle];
  if (p === undefined || p === null) return null;
  if (typeof p === 'number') return p;
  if (typeof p === 'object') {
    const t = p[variantTitel];
    return typeof t === 'number' ? t : null;
  }
  return null;
}

// ---- Nät -------------------------------------------------------------------

const log = (s) => console.log(s);
const bara = (x) => JSON.stringify(x);

async function hamtaLage(k) {
  const d = await k.graphql(`{
    shopLocales { locale name primary published }
    shop { currencyCode enabledPresentmentCurrencies }
    markets(first: 50) { nodes { id name handle enabled primary status
      conditions { regionsCondition { regions(first: 60) { nodes { ... on MarketRegionCountry { code } } } } }
      currencySettings { baseCurrency { currencyCode } localCurrencies }
      webPresences(first: 10) { nodes { id domain { host } } }
      catalogs(first: 10) { nodes { id title status ... on MarketCatalog { priceList { id name currency } } } } } }
    webPresences(first: 20) { nodes { id domain { host } defaultLocale { locale } alternateLocales { locale } } }
    deliveryProfiles(first: 5) { nodes { id name default profileLocationGroups { locationGroup { id } locationGroupZones(first: 30) { nodes { zone { id name countries { code { countryCode restOfWorld } } } methodDefinitions(first: 20) { nodes { id name active rateProvider { ... on DeliveryRateDefinition { id price { amount currencyCode } } } } } } } } } }
  }`);
  const profil = d.deliveryProfiles.nodes.find((p) => p.default) ?? d.deliveryProfiles.nodes[0];
  const grupp = profil?.profileLocationGroups?.[0];
  return {
    locales: d.shopLocales,
    shop: d.shop,
    marknader: d.markets.nodes.map((m) => ({ ...m, lander: (m.conditions?.regionsCondition?.regions?.nodes ?? []).map((r) => r.code).filter(Boolean) })),
    webPresences: d.webPresences.nodes,
    frakt: profil ? {
      profilId: profil.id, gruppId: grupp?.locationGroup?.id,
      zoner: (grupp?.locationGroupZones?.nodes ?? []).map((z) => ({ id: z.zone.id, namn: z.zone.name, lander: z.zone.countries.map((c) => c.code.restOfWorld ? '*' : c.code.countryCode), metoder: z.methodDefinitions.nodes.map((m) => ({ id: m.id, namn: m.name, aktiv: m.active, pris: Number(m.rateProvider?.price?.amount ?? NaN), valuta: m.rateProvider?.price?.currencyCode ?? null })) })),
    } : null,
  };
}

function skrivLage(l) {
  log(`Språk: ${l.locales.map((x) => `${x.locale}${x.primary ? ' (primär)' : ''}${x.published ? '' : ' (opublicerad)'}`).join(', ')}`);
  log(`Valutor i kassan: ${l.shop.enabledPresentmentCurrencies.join(', ')} (butikens: ${l.shop.currencyCode})`);
  for (const m of l.marknader) {
    log(`Marknad ${m.name} [${m.handle}] ${m.status}${m.primary ? ' PRIMÄR' : ''}: länder ${m.lander.join(',') || '—'} · bas ${m.currencySettings?.baseCurrency?.currencyCode ?? '—'} · lokala valutor ${m.currencySettings?.localCurrencies ?? '—'} · närvaro ${m.webPresences.nodes.map((w) => w.domain?.host ?? w.id).join(',') || '—'} · prislistor ${m.catalogs.nodes.map((c) => `${c.title}:${c.priceList?.currency ?? '?'}`).join(',') || '—'}`);
  }
  for (const w of l.webPresences) log(`Webbnärvaro ${w.domain?.host ?? w.id}: standard ${w.defaultLocale?.locale}, alternativa ${w.alternateLocales.map((x) => x.locale).join(',') || '—'}`);
  if (l.frakt) for (const z of l.frakt.zoner) log(`Fraktzon ${z.namn}: ${z.lander.join(',')} → ${z.metoder.map((m) => `${m.namn} ${m.pris} ${m.valuta}${m.aktiv ? '' : ' (av)'}`).join(' · ')}`);
}

// Mutation som får svara med userErrors: returnerar { data, fel } i stället för att kasta.
// Shopifys egna tillfälliga fel (INTERNAL_SERVER_ERROR, THROTTLED) får ETT nytt försök efter
// en paus — mätt 2026-09-27: translationsRegister svarade "Internal error. Looks like something
// went wrong on our end" mitt i en annars felfri körning och dödade hela steget. Kvarstår felet
// returneras det som text, så resten av resurserna körs och det som inte gick står i listan.
const TILLFALLIGT = /INTERNAL_SERVER_ERROR|THROTTLED|Internal error|MAX_COST_EXCEEDED|\b50[0-4]\b/;
const paus = (ms) => new Promise((r) => setTimeout(r, ms));
async function mutation(k, query, variables, { forsok = 2 } = {}) {
  for (let n = 1; ; n++) {
    try {
      const d = await k.graphql(query, variables);
      return { data: d, fel: [] };
    } catch (e) {
      const m = /avvisade \w+: (.*)$/s.exec(e.message);
      if (m) return { data: null, fel: [m[1]] };
      if (!TILLFALLIGT.test(e.message)) throw e;
      if (n < forsok) { await paus(3000 * n); continue; }
      return { data: null, fel: [`Shopify: ${e.message.replace(/\s+/g, ' ').slice(0, 200)}`] };
    }
  }
}

async function stegDefinition(k, { skarpt }) {
  const d = await k.graphql(`{ metaobjectDefinitionByType(type: "ms_paketniva") { id capabilities { translatable { enabled } } } }`);
  const def = d.metaobjectDefinitionByType;
  if (!def) { log('⚠️ ms_paketniva finns inte i butiken — inget att göra.'); return; }
  if (def.capabilities.translatable.enabled) { log('✅ ms_paketniva är translatable.'); return; }
  if (!skarpt) { log('torrt: skulle slå på translatable på ms_paketniva.'); return; }
  const u = await k.graphql(`mutation($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) { metaobjectDefinitionUpdate(id: $id, definition: $definition) { metaobjectDefinition { capabilities { translatable { enabled } } } userErrors { field message code } } }`, { id: def.id, definition: { capabilities: { translatable: { enabled: true } } } });
  log(`✅ translatable satt: ${bara(u.metaobjectDefinitionUpdate.metaobjectDefinition.capabilities)}`);
}

async function stegMarknader(k, { skarpt }) {
  let lage = await hamtaLage(k);
  const butiksvaluta = lage.shop.currencyCode;
  for (const m of KONFIG.marknader) {
    let mk = lage.marknader.find((x) => m.lander.some((c) => x.lander.includes(c))) ?? lage.marknader.find((x) => x.handle === m.handle);
    if (mk?.primary) throw new Error(`Landet ${m.lander.join(',')} ligger i primärmarknaden ${mk.name} — rör aldrig den.`);
    if (!mk) {
      if (!skarpt) { log(`torrt: skulle skapa marknaden "${m.namn}" [${m.handle}] med ${m.lander.join(', ')}`); continue; }
      const r = await mutation(k, `mutation($input: MarketCreateInput!) { marketCreate(input: $input) { market { id name handle status } userErrors { field message code } } }`,
        { input: { name: m.namn, handle: m.handle, status: 'ACTIVE', conditions: { regionsCondition: { regions: m.lander.map((countryCode) => ({ countryCode })) } } } });
      if (r.fel.length) throw new Error(`Marknaden ${m.namn} kunde inte skapas: ${r.fel.join('; ')} — är det Shopify-planens marknadstak? Då slås marknaderna ihop i konfig.json (färre marknader, fler länder per marknad).`);
      mk = { ...r.data.marketCreate.market, lander: m.lander, currencySettings: null };
      log(`✅ Marknad ${mk.name} skapad (${mk.status})`);
      if (mk.status !== 'ACTIVE') {
        await k.graphql(`mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { status } userErrors { field message } } }`, { id: mk.id, input: { enabled: true } });
        log(`✅ Marknad ${mk.name} aktiverad`);
      }
    } else {
      log(`Marknad ${mk.name} finns (${mk.status}), länder ${mk.lander.join(',')}`);
      const saknas = m.lander.filter((c) => !mk.lander.includes(c));
      if (saknas.length) {
        if (!skarpt) log(`torrt: skulle lägga till ${saknas.join(', ')} i ${mk.name}`);
        else {
          const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { id conditions { regionsCondition { regions(first: 60) { nodes { ... on MarketRegionCountry { code } } } } } } userErrors { field message } } }`,
            { id: mk.id, input: { conditions: { conditionsToAdd: { regionsCondition: { regions: saknas.map((countryCode) => ({ countryCode })) } } } } });
          if (r.fel.length) throw new Error(`Länder i ${mk.name}: ${r.fel.join('; ')}`);
          log(`✅ ${saknas.join(', ')} tillagda i ${mk.name}`);
        }
      }
      if (mk.status && mk.status !== 'ACTIVE') {
        if (!skarpt) log(`torrt: skulle aktivera ${mk.name}`);
        else { await k.graphql(`mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { status } userErrors { field message } } }`, { id: mk.id, input: { enabled: true } }); log(`✅ ${mk.name} aktiverad`); }
      }
    }
    // Basvaluta: bara när marknaden saknar egen (en satt valuta är ett beslut).
    const harBas = mk.currencySettings?.baseCurrency?.currencyCode ?? null;
    if (m.basvaluta && m.basvaluta !== butiksvaluta) {
      if (harBas) log(`   basvaluta ${harBas} står redan${harBas !== m.basvaluta ? ` (konfig säger ${m.basvaluta} — rörs inte)` : ''}`);
      else if (!skarpt) log(`torrt: skulle sätta basvalutan ${m.basvaluta} på ${m.namn}`);
      else {
        const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { currencySettings { baseCurrency { currencyCode } localCurrencies } } userErrors { field message } } }`, { id: mk.id, input: { currencySettings: { baseCurrency: m.basvaluta } } });
        if (r.fel.length) throw new Error(`Basvalutan ${m.basvaluta} på ${m.namn}: ${r.fel.join('; ')}`);
        const satt = r.data.marketUpdate.market.currencySettings?.baseCurrency?.currencyCode;
        if (satt !== m.basvaluta) throw new Error(`${m.namn} tog inte emot ${m.basvaluta} (läste tillbaka ${satt})`);
        log(`✅ basvaluta ${satt} på ${m.namn}`);
        mk.currencySettings = r.data.marketUpdate.market.currencySettings;
      }
    }
    if (m.lokala_valutor === true && mk.currencySettings?.localCurrencies !== true) {
      if (!skarpt) log(`torrt: skulle slå på lokala valutor i ${m.namn}`);
      else {
        const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { currencySettings { baseCurrency { currencyCode } localCurrencies } } userErrors { field message } } }`, { id: mk.id, input: { currencySettings: { localCurrencies: true } } });
        if (r.fel.length) throw new Error(`Lokala valutor i ${m.namn}: ${r.fel.join('; ')}`);
        log(`✅ lokala valutor på i ${m.namn}: ${bara(r.data.marketUpdate.market.currencySettings)}`);
      }
    } else if (m.lokala_valutor === true) log('   lokala valutor redan på');
  }
  if (skarpt) { lage = await hamtaLage(k); log(`Valutor i kassan nu: ${lage.shop.enabledPresentmentCurrencies.join(', ')}`); }
}

async function stegSprak(k, { skarpt }) {
  const lage = await hamtaLage(k);
  for (const locale of LOCALES) {
    const f = lage.locales.find((x) => x.locale === locale);
    if (f) { log(`Språk ${locale} finns${f.published ? ' (publicerat)' : ' (opublicerat)'}`); continue; }
    if (!skarpt) { log(`torrt: skulle aktivera språket ${locale} (opublicerat)`); continue; }
    const r = await mutation(k, `mutation($locale: String!) { shopLocaleEnable(locale: $locale) { shopLocale { locale published } userErrors { field message } } }`, { locale });
    if (r.fel.length) throw new Error(`Språk ${locale}: ${r.fel.join('; ')}`);
    log(`✅ språk ${locale} aktiverat (opublicerat tills översättningarna ligger inne)`);
  }
}

async function stegFrakt(k, { skarpt }) {
  const lage = await hamtaLage(k);
  if (!lage.frakt) throw new Error('Ingen fraktprofil.');
  const plan = fraktplan(lage.frakt.zoner, KONFIG.frakt.zoner);
  for (const z of plan.redan) log(`Fraktzon "${z}" finns redan med rätt länder.`);
  for (const u of plan.uppdatera) log(`${skarpt ? '' : 'torrt: '}zonen "${u.bytNamn ?? u.namn}"${u.bytNamn ? ` döps om till "${u.namn}",` : ''}${u.bort.length ? ` släpper ${u.bort.join(', ')}` : ''}${u.till.length ? ` får ${u.till.join(', ')}` : ''} (efteråt ${u.efter.length} länder)`);
  for (const z of plan.radera) log(`${skarpt ? '' : 'torrt: '}zonen "${z.namn}" blir tom (${z.fore.join(', ')} flyttar) och tas bort`);
  for (const z of plan.skapa) log(`${skarpt ? '' : 'torrt: '}ny zon "${z.namn}" ${z.lander.join(', ')} med "${z.metod}" ${z.pris} SEK`);
  if (!skarpt || (plan.skapa.length === 0 && plan.uppdatera.length === 0 && plan.radera.length === 0)) return;
  const land = (kod) => (kod === '*' ? { restOfWorld: true } : { code: kod, includeAllProvinces: true });
  const profile = {
    ...(plan.radera.length ? { zonesToDelete: plan.radera.map((z) => z.id) } : {}),
    locationGroupsToUpdate: [{
      id: lage.frakt.gruppId,
      zonesToUpdate: plan.uppdatera.map((u) => ({ id: u.id, name: u.namn, countries: u.efter.map(land) })),
      zonesToCreate: plan.skapa.map((z) => ({ name: z.namn, countries: z.lander.map(land), methodDefinitionsToCreate: [{ name: z.metod, active: true, rateDefinition: { price: { amount: Number(z.pris).toFixed(1), currencyCode: 'SEK' } } }] })),
    }],
  };
  const r = await mutation(k, `mutation($id: ID!, $profile: DeliveryProfileInput!) { deliveryProfileUpdate(id: $id, profile: $profile) { profile { id } userErrors { field message } } }`, { id: lage.frakt.profilId, profile });
  if (r.fel.length) throw new Error(`Frakten: ${r.fel.join('; ')}`);
  const efter = await hamtaLage(k);
  for (const z of efter.frakt.zoner) log(`   nu: ${z.namn}: ${z.lander.join(',')} → ${z.metoder.map((m) => `${m.namn} ${m.pris} ${m.valuta}`).join(' · ')}`);
  for (const z of plan.skapa) if (!efter.frakt.zoner.some((x) => x.namn === z.namn)) throw new Error(`Zonen ${z.namn} saknas efter skrivningen.`);
  log('✅ frakten skriven och tillbakaläst');
}

async function stegPrislista(k, { skarpt }) {
  const lage = await hamtaLage(k);
  for (const m of KONFIG.marknader) {
    if (m.priser !== 'fasta' || !m.fasta_priser) continue;
    const mk = lage.marknader.find((x) => m.lander.some((c) => x.lander.includes(c)));
    if (!mk) { log(`⚠️ ${m.namn}: marknaden finns inte än — kör --steg marknader först.`); continue; }
    const bas = mk.currencySettings?.baseCurrency?.currencyCode ?? null;
    if (bas !== m.basvaluta) { log(`🖐 ${m.namn}: basvalutan är ${bas ?? 'inte satt'}, prislistan i ${m.basvaluta} kan inte kopplas. Sätt valutan först (steg marknader, eller Inställningar → Marknader → ${m.namn} → Valuta).`); continue; }
    // Varianterna
    const handles = Object.keys(m.fasta_priser).filter((h) => h !== 'comment');
    const rader = [];
    for (const h of handles) {
      const d = await k.graphql(`query($q: String!) { products(first: 1, query: $q) { nodes { handle variants(first: 20) { nodes { id title price } } } } }`, { q: `handle:${h}` });
      const p = d.products.nodes[0];
      if (!p || p.handle !== h) { log(`⚠️ produkten ${h} finns inte — hoppar`); continue; }
      for (const v of p.variants.nodes) {
        const pris = fastPrisFor(m.fasta_priser, h, v.title);
        if (pris === null) { log(`⚠️ ${h} / ${v.title}: inget fast pris i konfigen — Shopifys omräkning gäller`); continue; }
        rader.push({ handle: h, variantId: v.id, titel: v.title, pris, sek: v.price });
      }
    }
    for (const r of rader) log(`${skarpt ? '' : 'torrt: '}${r.handle} · ${r.titel}: ${r.pris.toFixed(2)} ${m.basvaluta} (SEK-pris ${r.sek})`);
    if (!skarpt) continue;
    // Prislista + katalog (en per marknad och valuta), idempotent.
    let katalog = mk.catalogs.nodes.find((c) => c.priceList?.currency === m.basvaluta);
    let priceListId = katalog?.priceList?.id ?? null;
    if (!priceListId) {
      const p = await k.graphql(`mutation($input: PriceListCreateInput!) { priceListCreate(input: $input) { priceList { id name currency } userErrors { field message code } } }`, { input: { name: `Matstrumpor ${m.basvaluta}`, currency: m.basvaluta, parent: { adjustment: { type: 'PERCENTAGE_INCREASE', value: 0 } } } });
      priceListId = p.priceListCreate.priceList.id;
      log(`✅ prislista ${p.priceListCreate.priceList.name} skapad`);
      const c = await k.graphql(`mutation($input: CatalogCreateInput!) { catalogCreate(input: $input) { catalog { id title status } userErrors { field message code } } }`, { input: { title: `Matstrumpor ${m.namn}`, status: 'ACTIVE', context: { marketIds: [mk.id] }, priceListId } });
      log(`✅ katalog ${c.catalogCreate.catalog.title} kopplad till ${mk.name}`);
    } else log(`prislista ${katalog.priceList.name} finns redan på ${mk.name}`);
    // Fasta priser (idempotent: sätter om samma värde).
    const f = await k.graphql(`mutation($id: ID!, $prices: [PriceListPriceInput!]!) { priceListFixedPricesAdd(priceListId: $id, prices: $prices) { prices { variant { id } price { amount currencyCode } originType } userErrors { field message code } } }`,
      { id: priceListId, prices: rader.map((r) => ({ variantId: r.variantId, price: { amount: r.pris.toFixed(2), currencyCode: m.basvaluta } })) });
    const satta = f.priceListFixedPricesAdd.prices;
    log(`✅ ${satta.length} fasta priser: ${satta.map((p) => `${p.price.amount} ${p.price.currencyCode} (${p.originType})`).join(', ')}`);
    if (satta.length !== rader.length) throw new Error(`${rader.length} priser skickade, ${satta.length} satta.`);
  }
}

// Läser översättningsbara resurser 40 åt gången. Faller en sats på ett Shopify-fel görs
// ett nytt försök EN resurs i taget, så ett fel på en resurs inte tar de andra 39 med sig;
// det som ändå inte gick returneras som `misslyckade` och rapporteras — aldrig tyst.
async function translatableIds(k, ids, locale) {
  const Q = `query($ids: [ID!]!, $l: String!) { translatableResourcesByIds(first: 40, resourceIds: $ids) { nodes { resourceId translatableContent { key value digest } translations(locale: $l) { key value outdated } } } }`;
  const hamta = async (del) => (await k.graphql(Q, { ids: del, l: locale })).translatableResourcesByIds.nodes;
  const noder = [], misslyckade = [];
  for (let i = 0; i < ids.length; i += 40) {
    const del = ids.slice(i, i + 40);
    try { noder.push(...(await hamta(del))); continue; } catch (e) { if (!TILLFALLIGT.test(e.message)) throw e; await paus(3000); }
    for (const id of del) {
      try { noder.push(...(await hamta([id]))); } catch (e) { misslyckade.push({ id, fel: e.message.replace(/\s+/g, ' ').slice(0, 160) }); }
    }
  }
  return { noder, misslyckade };
}

export function lasOversattning(locale) {
  const fil = underlagsfil(locale);
  return existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : null;
}

async function stegOversattningar(k, { skarpt, bara: baraLocale = null }) {
  const sv = JSON.parse(readFileSync(underlagsfil('sv'), 'utf8'));
  const resurser = JSON.parse(readFileSync(resursfil(), 'utf8')).resurser;
  const sammanfattning = {};
  for (const locale of LOCALES) {
    if (baraLocale && locale !== baraLocale) continue;
    const mal = lasOversattning(locale);
    if (!mal) { log(`⚠️ ${locale}: ingen ${underlagsfil(locale)} — hoppar`); sammanfattning[locale] = { status: 'saknas' }; continue; }
    const g = granska(sv, mal, locale);
    if (g.fel.length) {
      log(`❌ ${locale}: ${g.fel.length} fel i granskningen — registrerar INGET för ${locale}. Första: ${g.fel.slice(0, 3).map((f) => `${f.nyckel} [${f.typ}] ${f.text}`).join(' | ')}`);
      sammanfattning[locale] = { status: 'fel', fel: g.fel.length };
      continue;
    }
    const { karta, samma, konflikter } = byggKarta(sv, mal);
    if (konflikter.length) log(`⚠️ ${locale}: ${konflikter.length} svenska texter med två olika översättningar (första vann): ${konflikter.map((c) => c.nyckel).join(', ')}`);
    const { noder, misslyckade } = await translatableIds(k, resurser.map((r) => r.id), locale);
    const typAv = new Map(resurser.map((r) => [r.id, r.typ]));
    for (const m of misslyckade) log(`❌ ${locale}: gick inte att läsa ${typAv.get(m.id)} ${m.id}: ${m.fel}`);
    let registrerade = 0, resurserMed = 0;
    const lackor = [];
    const perTyp = {};
    const felResurser = [];
    for (const n of noder) {
      // ⚠️ Befintliga översättningar ur batchläsningen används INTE för att hoppa över något:
      // läsningen kan svara med ett ANNAT språks värden (mätt 2026-09-27), och där danskan och
      // norskan råkar vara identiska ("Del", "Hele sortimentet") hoppades sju norska texter
      // över som "redan registrerade" — de fanns aldrig. Registreringen är idempotent, så allt
      // skickas varje körning; `--steg kontroll` (som läser om ensamt) är facit.
      const innehall = (n.translatableContent ?? []).filter((c) => !['handle', 'ab_variant', 'rabattkod'].includes(c.key));
      const { rader, kvar } = paraResurs(innehall, karta, new Map());
      for (const q of kvar) if (arLacka({ ...q, typ: typAv.get(n.resourceId) }, samma)) lackor.push({ id: n.resourceId.split('/').pop().split('?')[0], typ: typAv.get(n.resourceId), ...q });
      if (rader.length === 0) continue;
      resurserMed++;
      perTyp[typAv.get(n.resourceId)] = (perTyp[typAv.get(n.resourceId)] ?? 0) + rader.length;
      if (!skarpt) { registrerade += rader.length; continue; }
      for (let i = 0; i < rader.length; i += 100) {
        const r = await mutation(k, `mutation($id: ID!, $t: [TranslationInput!]!) { translationsRegister(resourceId: $id, translations: $t) { translations { key } userErrors { field message code } } }`,
          { id: n.resourceId, t: rader.slice(i, i + 100).map((x) => ({ key: x.key, value: x.value, locale, translatableContentDigest: x.digest })) });
        if (r.fel.length) { log(`❌ ${locale} ${typAv.get(n.resourceId)} ${n.resourceId}: ${r.fel.join('; ')}`); felResurser.push(n.resourceId); continue; }
        registrerade += r.data.translationsRegister.translations.length;
      }
    }
    const misslyckat = misslyckade.length + felResurser.length;
    log(`${skarpt ? (misslyckat ? '⚠️' : '✅') : 'torrt:'} ${locale}: ${registrerade} översättningar ${skarpt ? 'registrerade' : 'skulle registreras'} på ${resurserMed} resurser — ${Object.entries(perTyp).map(([t, n]) => `${t} ${n}`).join(', ')}${misslyckat ? ` — ${misslyckat} resurser GICK INTE (se ❌ ovan), kör steget igen` : ''}`);
    if (lackor.length) { log(`⚠️ ${locale}: ${lackor.length} svenska texter utan översättning (läckor på /${locale}):`); for (const l of lackor.slice(0, 25)) log(`     ${l.typ} ${l.id} ${l.key}: "${l.value}"`); }
    sammanfattning[locale] = { status: misslyckat ? 'delvis' : 'ok', registrerade, lackor: lackor.length, konflikter: konflikter.length, misslyckade: misslyckat };
  }
  return sammanfattning;
}

/** Språken som låg i temats grenar efter första patchen 2026-09-27 12:30 — facit för ombyggnaden. */
const GAMLA_LOCALES = ['nb', 'da', 'fi', 'en'];

/** Filens ORIGINAL ur den äldsta backupen som har den (output/tema-original/<tid>/<fil>). */
function urOriginal(fil) {
  const bas = join(OUTPUT, 'tema-original');
  if (!existsSync(bas)) return null;
  for (const d of readdirSync(bas).sort()) { const p = join(bas, d, fil); if (existsSync(p)) return readFileSync(p, 'utf8'); }
  return null;
}

async function stegTema(k, { skarpt }) {
  const ov = Object.fromEntries(LOCALES.map((l) => [l, lasOversattning(l) ?? {}]));
  const saknar = LOCALES.filter((l) => !lasOversattning(l));
  if (saknar.length) log(`⚠️ översättning saknas för ${saknar.join(', ')} — de språken faller på svenskan i grenarna.`);
  const temaId = KONFIG.tema_id;
  const t = await k.graphql(`query($id: ID!) { theme(id: $id) { name role } }`, { id: temaId });
  if (t.theme?.role !== 'MAIN') throw new Error(`Temat ${temaId} är ${t.theme?.role ?? 'borta'}, inte MAIN — uppdatera tema_id.`);
  const filer = [...KONFIG.liquid_patch.filer, ...KONFIG.liquid_patch.mallar];
  const f = await k.graphql(`query($id: ID!, $f: [String!]) { theme(id: $id) { files(first: 50, filenames: $f) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: temaId, f: filer });
  const innehall = Object.fromEntries(f.theme.files.nodes.map((x) => [x.filename, x.body?.content ?? null]));
  const skriv = [];
  const patcha = (fil, kod, o) => (fil.endsWith('.json') ? patchaMallJson(fil, kod, o, LIQUID_TEXTER) : patchaFil(fil, kod, o));
  for (const fil of filer) {
    const kod = innehall[fil];
    if (kod === null || kod === undefined) { log(`⚠️ ${fil} finns inte i temat — hoppar`); continue; }
    let r;
    try {
      // En redan patchad fil bär bara de språk som fanns vid förra patchen (2026-09-27 12:30:
      // nb, da, fi, en) och patchen är idempotent — den lägger inte till nya grenar. Därför
      // byggs den om från ORIGINALET i output/tema-original, men bara om originalet + den
      // gamla patchen ger exakt det som ligger i temat nu (annars har någon rört filen).
      let bas = kod;
      if (/request\.locale\.iso_code|var LANG = /.test(kod)) {
        const orig = urOriginal(fil);
        if (!orig) { log(`⚠️ ${fil}: redan patchad och originalet saknas i output/tema-original — hoppar`); continue; }
        const ovGammal = Object.fromEntries(GAMLA_LOCALES.filter((l) => l in ov).map((l) => [l, ov[l]]));
        const kontroll = patcha(fil, orig, ovGammal);
        if (kontroll.kod !== kod) { log(`❌ ${fil}: temat är inte originalet + den gamla patchen (någon har ändrat filen) — rör den inte`); continue; }
        bas = orig;
        log(`${fil}: byggs om från originalet (${GAMLA_LOCALES.join(',')} → ${LOCALES.join(',')})`);
      }
      r = patcha(fil, bas, ov);
    } catch (e) { log(`❌ ${fil}: ${e.message}`); continue; }
    log(`${fil}: ${r.byten.length} byten${r.byten.length ? ` (${r.byten.join(', ')})` : ''}${r.hoppade.length ? ` · hoppade: ${r.hoppade.join('; ')}` : ''}`);
    if (r.byten.length && r.kod !== kod) skriv.push({ filename: fil, body: { type: 'TEXT', value: r.kod } });
  }
  if (!skarpt || skriv.length === 0) { log(skriv.length ? `torrt: ${skriv.length} filer skulle skrivas` : 'inget att skriva'); return; }
  // Originalen sparas innan något skrivs, så en fil kan läggas tillbaka exakt som den var
  // (themeFilesUpsert med innehållet ur mappen). Mappen ligger under output/ och committas inte.
  const backup = join(OUTPUT, 'tema-original', new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-'));
  for (const s of skriv) { const p = join(backup, s.filename); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, innehall[s.filename]); }
  log(`originalen sparade i ${backup}`);
  const u = await mutation(k, `mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }`, { id: temaId, files: skriv });
  if (u.fel.length) throw new Error(`themeFilesUpsert: ${u.fel.join('; ')}`);
  // Tillbakaläsning
  const efter = await k.graphql(`query($id: ID!, $f: [String!]) { theme(id: $id) { files(first: 50, filenames: $f) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: temaId, f: skriv.map((s) => s.filename) });
  for (const s of skriv) {
    const nu = efter.theme.files.nodes.find((x) => x.filename === s.filename)?.body?.content;
    if (nu !== s.body.value) throw new Error(`${s.filename} läses inte tillbaka identiskt efter skrivningen.`);
  }
  log(`✅ ${skriv.length} temafiler skrivna och tillbakalästa: ${skriv.map((s) => s.filename).join(', ')}`);
}

async function stegPublicera(k, { skarpt }) {
  let lage = await hamtaLage(k);
  for (const locale of LOCALES) {
    const f = lage.locales.find((x) => x.locale === locale);
    if (!f) { log(`⚠️ språket ${locale} är inte aktiverat — kör --steg sprak först`); continue; }
    if (f.published) { log(`språk ${locale} är publicerat`); continue; }
    if (!skarpt) { log(`torrt: skulle publicera ${locale}`); continue; }
    const r = await mutation(k, `mutation($locale: String!, $s: ShopLocaleInput!) { shopLocaleUpdate(locale: $locale, shopLocale: $s) { shopLocale { locale published } userErrors { field message } } }`, { locale, s: { published: true } });
    if (r.fel.length) throw new Error(`Publicera ${locale}: ${r.fel.join('; ')}`);
    log(`✅ ${locale} publicerat`);
  }
  // alternateLocales på varje webbnärvaro (domänen + myshopify) — alla launchspråk.
  for (const wp of lage.webPresences) {
    const har = wp.alternateLocales.map((l) => l.locale);
    const nya = LOCALES.filter((l) => !har.includes(l) && wp.defaultLocale?.locale !== l);
    if (nya.length === 0) { log(`webbnärvaro ${wp.domain?.host}: har redan ${har.join(',')}`); continue; }
    if (!skarpt) { log(`torrt: webbnärvaro ${wp.domain?.host} skulle få ${nya.join(', ')}`); continue; }
    const r = await mutation(k, `mutation($id: ID!, $input: WebPresenceUpdateInput!) { webPresenceUpdate(id: $id, input: $input) { webPresence { alternateLocales { locale } } userErrors { field message } } }`, { id: wp.id, input: { alternateLocales: [...har, ...nya] } });
    if (r.fel.length) throw new Error(`webPresence ${wp.domain?.host}: ${r.fel.join('; ')}`);
    log(`✅ webbnärvaro ${wp.domain?.host}: ${r.data.webPresenceUpdate.webPresence.alternateLocales.map((l) => l.locale).join(',')}`);
  }
  // Koppla närvaron till marknaderna (annars är /nb bara ett språk på Sveriges marknad — DryTrek 2026-09-10).
  lage = await hamtaLage(k);
  const ids = lage.webPresences.map((w) => w.id);
  for (const m of KONFIG.marknader) {
    const mk = lage.marknader.find((x) => m.lander.some((c) => x.lander.includes(c)));
    if (!mk) { log(`⚠️ ${m.namn}: marknaden finns inte`); continue; }
    const har = mk.webPresences.nodes.map((w) => w.id);
    const saknas = ids.filter((id) => !har.includes(id));
    if (saknas.length === 0) { log(`marknad ${mk.name}: närvaron kopplad (${mk.webPresences.nodes.map((w) => w.domain?.host).join(',')})`); continue; }
    if (!skarpt) { log(`torrt: marknad ${mk.name} skulle få webbnärvaron kopplad`); continue; }
    const r = await mutation(k, `mutation($id: ID!, $input: MarketUpdateInput!) { marketUpdate(id: $id, input: $input) { market { webPresences(first: 10) { nodes { domain { host } } } } userErrors { field message } } }`, { id: mk.id, input: { webPresencesToAdd: saknas } });
    const redan = r.fel.length > 0 && r.fel.every((f) => /already/i.test(f));
    if (r.fel.length && !redan) throw new Error(`Koppla närvaron till ${mk.name}: ${r.fel.join('; ')}`);
    log(`✅ ${mk.name}: närvaro ${redan ? 'var redan kopplad' : r.data.marketUpdate.market.webPresences.nodes.map((w) => w.domain?.host).join(',')}`);
  }
}

// Tillbakaläsning: läser varje resurs' översättningar per språk ur Shopify och jämför med
// filen. Registreringen svarar "ok" per anrop, men bara en läsning efteråt bevisar att det
// som ligger i butiken är det vi skickade (mätt 2026-09-27: en läsning direkt efter en
// registrering visade gamla värden — Shopifys översättningsläsning släpar — så kör steget
// en stund efter registreringen, inte i samma sekund). Skriver aldrig.
async function stegKontroll(k, { bara: baraLocale = null }) {
  const sv = JSON.parse(readFileSync(underlagsfil('sv'), 'utf8'));
  const resurser = JSON.parse(readFileSync(resursfil(), 'utf8')).resurser;
  const typAv = new Map(resurser.map((r) => [r.id, r.typ]));
  const ut = {};
  for (const locale of LOCALES) {
    if (baraLocale && locale !== baraLocale) continue;
    const mal = lasOversattning(locale);
    if (!mal) { log(`⚠️ ${locale}: ingen ${underlagsfil(locale)} — hoppar`); continue; }
    const { karta } = byggKarta(sv, mal);
    const { noder, misslyckade } = await translatableIds(k, resurser.map((r) => r.id), locale);
    // Jämför en nod mot filen → { ok, saknas: [plats…], fel: [text…] }.
    const jamfor = (n) => {
      const r = { ok: 0, saknas: [], fel: [] };
      const har = new Map((n.translations ?? []).map((t) => [t.key, t]));
      for (const c of n.translatableContent ?? []) {
        if (['handle', 'ab_variant', 'rabattkod'].includes(c.key)) continue;
        const till = karta.get(norm(c.value));
        if (!till) continue;
        const h = har.get(c.key);
        const plats = `${typAv.get(n.resourceId)} ${n.resourceId.split('/').pop().split('?')[0]} ${c.key}`;
        if (!h) r.saknas.push(plats);
        else if (norm(h.value) !== norm(till)) r.fel.push(`${plats}: butiken "${String(h.value).slice(0, 50)}" ≠ filen "${String(till).slice(0, 50)}"`);
        else r.ok++;
      }
      return r;
    };
    let ok = 0; const saknas = [], fel = []; let omlasta = 0;
    for (const n of noder) {
      let r = jamfor(n);
      if (r.saknas.length || r.fel.length) {
        // ⚠️ Mätt 2026-09-27: en batchläsning svarade med DANSKA värden för locale en på temats
        // resurser, och samma fråga en stund senare gav rätt engelska — Shopifys läsning av
        // temaöversättningar är inte alltid färsk. En avvikelse räknas därför först när en
        // ny läsning av resursen ENSAM, efter en paus, säger samma sak.
        await paus(2000);
        const { noder: igen } = await translatableIds(k, [n.resourceId], locale);
        if (igen[0]) { const r2 = jamfor(igen[0]); omlasta++; if (r2.saknas.length + r2.fel.length < r.saknas.length + r.fel.length) log(`   ℹ️ ${typAv.get(n.resourceId)} ${n.resourceId.split('/').pop().split('?')[0]}: första läsningen avvek (${r.saknas.length + r.fel.length}), omläst ensam: ${r2.saknas.length + r2.fel.length} avviker`); r = r2; }
      }
      ok += r.ok; saknas.push(...r.saknas); fel.push(...r.fel);
    }
    for (const m of misslyckade) fel.push(`${typAv.get(m.id)} ${m.id}: gick inte att läsa (${m.fel})`);
    log(`${saknas.length || fel.length ? '❌' : '✅'} ${locale}: ${ok} översättningar ligger som i filen, ${saknas.length} saknas, ${fel.length} avviker${omlasta ? ` (${omlasta} resurser omlästa ensamma)` : ''}`);
    for (const s of saknas.slice(0, 15)) log(`     saknas: ${s}`);
    for (const f of fel.slice(0, 15)) log(`     avviker: ${f}`);
    ut[locale] = { ok, saknas: saknas.length, fel: fel.length };
  }
  return ut;
}

const STEG = { definition: stegDefinition, marknader: stegMarknader, sprak: stegSprak, frakt: stegFrakt, prislista: stegPrislista, oversattningar: stegOversattningar, tema: stegTema, publicera: stegPublicera, kontroll: stegKontroll };
const ORDNING = ['definition', 'marknader', 'sprak', 'frakt', 'prislista', 'oversattningar', 'tema', 'publicera', 'kontroll'];

async function huvud() {
  const arg = process.argv.slice(2);
  const skarpt = arg.includes('--skarpt');
  const k = await skapaKlient(lasButik(KONFIG.butik));
  const kolla = await k.kolla();
  log(`Butik: ${kolla.namn} (${k.shop}) via appen ${kolla.app}${skarpt ? '  SKARPT' : '  (torrt — --skarpt skriver)'}`);
  if (arg.includes('--lage')) { skrivLage(await hamtaLage(k)); return; }
  const valda = arg.includes('--alla') ? ORDNING : (arg[arg.indexOf('--steg') + 1] ?? '').split(',').filter(Boolean);
  if (valda.length === 0) { console.error('Ange --lage, --alla eller --steg a,b,c. Steg: ' + ORDNING.join(', ')); process.exit(2); }
  const baraLocale = arg.includes('--locale') ? arg[arg.indexOf('--locale') + 1] : null;
  for (const s of valda) {
    if (!STEG[s]) throw new Error(`Okänt steg ${s}. Finns: ${ORDNING.join(', ')}`);
    log(`\n── ${s} ──`);
    await STEG[s](k, { skarpt, bara: baraLocale });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
