// Prislistor per marknad: fasta priser i marknadens EGEN valuta.
//
//   node factory/prislista.mjs <butik-id> <produkt-id> [--torr]
//
// Kedjans steg `prislista` (efter marknad + paket). Läser
// `ekonomi.marknadspriser` i produktfilen ({ valuta, pris, jamforpris }) och
// ser till att varje rad finns i Shopify som:
//   1. en PRISLISTA i valutan (priceListCreate, parent-justering 0 %),
//   2. en MARKNADSKATALOG som kopplar prislistan till marknaden för landet
//      (catalogCreate, status ACTIVE, context.marketIds),
//   3. ett FAST pris + jämförpris per variant (priceListFixedPricesAdd).
//
// Receptet mättes för hand på CaraShell 2026-09-11 (API-GRANSER.md: NOK
// 1 106 / 1 382,50, tillbakaläst som originType FIXED) — men fanns aldrig
// som kod, så nästa marknad hade fått tre lösa anrop igen. Det här är de tre
// anropen som steg. ⚠️ Nätdelen är skriven ur det receptet och API-schemat,
// inte körd mot en butik från sessionen som skrev den (2026-09-16, ingen
// butikstoken i miljön) — första riktiga körningen är mätningen.
//
// Förutsättning som API:t INTE kan ordna: valutan måste vara marknadens
// basvaluta (Inställningar → Marknader → marknaden → valuta). Är den inte
// det säger `sakerstallPrislistor` det som 🖐 med klicket, i stället för att
// låta Shopify avvisa anropet med ett kryptiskt userError.
//
// Fasta priser följer INTE valutakursen: ändras SEK-priset sätts de om för
// hand i produktfilen och steget körs igen (--igen prislista). Idempotent —
// en prislista som redan bär rätt pris rörs inte. Noll beroenden.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaProduktViaHandle, kontrolleraAnslutning } from './shopify.mjs';
import { hamtaLage } from './marknad.mjs';
import { lokalValuta, landsnamnSv } from './lander.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const tal = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : null);
const belopp = (v) => Number(v).toFixed(2);

// ---- Ren logik (testad i test/prislista.test.mjs) -----------------------------

/**
 * Planen: en rad per marknadspris, kopplad till marknaden vars EGNA valuta
 * (lander.mjs) är prisets valuta. Butikens egen valuta hoppas över (den är
 * ordinarie pris, ingen prislista). Ett pris utan marknad, eller en marknad
 * utan pris, blir ett fel i planen — inte ett tyst hopp.
 *
 * → { rader: [{ valuta, land, pris, jamforpris, namn }], fel: [] }
 */
export function byggPrislistplan(produkt, butik = null) {
  const id = text(produkt?.produkt?.id) ?? '?';
  const brand = text(produkt?.brand?.namn) ?? text(butik?.butik?.brand) ?? id;
  const butiksvaluta = (text(produkt?.ekonomi?.valuta) ?? text(butik?.butik?.valuta) ?? 'SEK').toUpperCase();
  const marknader = lista(butik?.butik?.marknader).map((m) => ({ land: String(m?.land ?? '').toUpperCase(), valuta: lokalValuta(m?.land) }));
  const rader = [];
  const fel = [];
  const sedda = new Set();
  for (const m of lista(produkt?.ekonomi?.marknadspriser)) {
    const valuta = text(m?.valuta)?.toUpperCase() ?? null;
    if (!valuta) { fel.push(`${id}: en rad i ekonomi.marknadspriser saknar valuta`); continue; }
    if (valuta === butiksvaluta) continue;
    if (sedda.has(valuta)) { fel.push(`${id}: valutan ${valuta} står två gånger i ekonomi.marknadspriser`); continue; }
    sedda.add(valuta);
    const pris = tal(Number(m?.pris));
    if (!pris) { fel.push(`${id}: ekonomi.marknadspriser ${valuta} saknar pris över 0`); continue; }
    const jamforpris = tal(Number(m?.jamforpris));
    if (jamforpris && jamforpris <= pris) fel.push(`${id}: ${valuta} jämförpris ${jamforpris} är inte över priset ${pris}`);
    const traffar = marknader.filter((x) => x.valuta === valuta);
    if (traffar.length === 0) { fel.push(`${id}: ${valuta}-priset har ingen marknad i butik.marknader vars valuta är ${valuta}`); continue; }
    if (traffar.length > 1) { fel.push(`${id}: ${valuta} matchar flera marknader (${traffar.map((x) => x.land).join(', ')}) — en prislista kan bara kopplas till en marknad här`); continue; }
    rader.push({ valuta, land: traffar[0].land, pris, jamforpris, namn: `${brand} ${valuta}` });
  }
  // Marknader som borde ha ett pris men saknar det — en norsk kund som ser
  // SEK är precis det fältet finns för (CaraShell 2026-09-12).
  for (const m of marknader) {
    if (!m.valuta || m.valuta === butiksvaluta) continue;
    if (!sedda.has(m.valuta)) fel.push(`${id}: marknaden ${m.land} har valutan ${m.valuta} men ekonomi.marknadspriser saknar en ${m.valuta}-rad — kunden ser då ${butiksvaluta}`);
  }
  return { rader, fel };
}

/** Prislistan (ur priceLists-läsningen) som bär valutan OCH marknaden. */
export function hittaPrislista(prislistor, valuta, marketId) {
  return (
    lista(prislistor).find(
      (p) => String(p?.currency ?? '').toUpperCase() === valuta && lista(p?.catalog?.markets?.nodes).some((m) => m?.id === marketId)
    ) ?? null
  );
}

/** Varianterna vars fasta pris/jämförpris INTE redan står rätt. */
export function varianterAttSkriva(varianter, befintliga, rad) {
  const har = new Map(lista(befintliga).map((p) => [p?.variant?.id, p]));
  return lista(varianter).filter((v) => {
    const p = har.get(v.id);
    if (!p || p.originType !== 'FIXED') return true;
    if (belopp(p.price?.amount) !== belopp(rad.pris)) return true;
    const jf = p.compareAtPrice?.amount ?? null;
    if ((rad.jamforpris ? belopp(rad.jamforpris) : null) !== (jf === null ? null : belopp(jf))) return true;
    return false;
  });
}

/** Klicket när valutan inte är marknadens basvaluta. */
export function basvalutaSkal(rad, marknadsnamn, basvaluta) {
  return (
    `${rad.valuta} är inte basvaluta för marknaden ${marknadsnamn} (basvalutan är ${basvaluta ?? 'okänd'}). ` +
    `Inställningar → Marknader → ${marknadsnamn} → Valuta → välj ${rad.valuta}. API:t kan inte slå på den. Kör sen --igen prislista.`
  );
}

// ---- Nät --------------------------------------------------------------------------

const userErrors = (svar, namn) => {
  const fel = svar?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`${namn}: ${fel.map((f) => `${f.field ? `${[].concat(f.field).join('.')}: ` : ''}${f.message}`).join('; ')}`);
};

export async function hamtaPrislistor() {
  const d = await graphql(`query opsFactoryPrislistor {
    priceLists(first: 50) {
      nodes {
        id name currency fixedPricesCount
        catalog { id title status ... on MarketCatalog { markets(first: 20) { nodes { id name } } } }
      }
    }
  }`);
  return d.priceLists?.nodes ?? [];
}

export async function hamtaMarknadsvaluta(marketId) {
  const d = await graphql(
    `query opsFactoryMarknadsvaluta($id: ID!) {
      market(id: $id) { id name currencySettings { baseCurrency { currencyCode } localCurrencies } }
    }`,
    { id: marketId }
  );
  return d.market ?? null;
}

async function hamtaFastaPriser(priceListId) {
  const d = await graphql(
    `query opsFactoryFastaPriser($id: ID!) {
      priceList(id: $id) { prices(first: 250, originType: FIXED) { nodes { variant { id } price { amount currencyCode } compareAtPrice { amount } originType } } }
    }`,
    { id: priceListId }
  );
  return d.priceList?.prices?.nodes ?? [];
}

// Prislista + katalog för en rad. Returnerar { id, skapad, katalogId }.
export async function sakerstallPrislista(rad, marketId, { torr = false } = {}) {
  const finns = hittaPrislista(await hamtaPrislistor(), rad.valuta, marketId);
  if (finns) return { id: finns.id, skapad: false, katalogId: finns.catalog?.id ?? null, namn: finns.name };
  if (torr) return { id: null, skapad: true, katalogId: null, namn: rad.namn, torr: true };
  const p = await graphql(
    `mutation opsFactoryPrislista($input: PriceListCreateInput!) {
      priceListCreate(input: $input) { priceList { id name currency } userErrors { field message code } }
    }`,
    { input: { name: rad.namn, currency: rad.valuta, parent: { adjustment: { type: 'PERCENTAGE_INCREASE', value: 0 } } } }
  );
  userErrors(p.priceListCreate, `Prislista ${rad.namn}`);
  const priceListId = p.priceListCreate.priceList.id;
  const k = await graphql(
    `mutation opsFactoryKatalog($input: CatalogCreateInput!) {
      catalogCreate(input: $input) { catalog { id title status } userErrors { field message code } }
    }`,
    { input: { title: rad.namn, status: 'ACTIVE', context: { marketIds: [marketId] }, priceListId } }
  );
  userErrors(k.catalogCreate, `Katalog ${rad.namn}`);
  return { id: priceListId, skapad: true, katalogId: k.catalogCreate.catalog.id, namn: rad.namn };
}

export async function skrivFastaPriser(priceListId, varianter, rad, { torr = false } = {}) {
  if (varianter.length === 0) return { skrivna: 0 };
  if (torr) return { skrivna: varianter.length, torr: true };
  const prices = varianter.map((v) => ({
    variantId: v.id,
    price: { amount: belopp(rad.pris), currencyCode: rad.valuta },
    ...(rad.jamforpris ? { compareAtPrice: { amount: belopp(rad.jamforpris), currencyCode: rad.valuta } } : {}),
  }));
  const d = await graphql(
    `mutation opsFactoryFastaPriser($id: ID!, $prices: [PriceListPriceInput!]!) {
      priceListFixedPricesAdd(priceListId: $id, prices: $prices) { prices { variant { id } price { amount currencyCode } originType } userErrors { field message code } }
    }`,
    { id: priceListId, prices }
  );
  userErrors(d.priceListFixedPricesAdd, `Fasta priser ${rad.valuta}`);
  return { skrivna: (d.priceListFixedPricesAdd.prices ?? []).length };
}

/**
 * Hela steget för en produkt. Returnerar { prislistor: [], manuella: [] } —
 * manuella är klick (valutan inte påslagen, marknaden saknas) och stoppar
 * bara den raden, aldrig de andra.
 */
export async function sakerstallPrislistor(ctx, produkt, { torr = false } = {}) {
  const plan = byggPrislistplan(produkt, ctx?.butik ?? null);
  const manuella = [...plan.fel];
  const prislistor = [];
  if (plan.rader.length === 0) return { prislistor, manuella, plan };

  const lage = await hamtaLage();
  const iButiken = await hamtaProduktViaHandle(produkt.produkt.id);
  if (!iButiken) throw new Error(`Produkten ${produkt.produkt.id} finns inte i butiken — kör produkt-steget först.`);
  const varianter = iButiken.variants?.nodes ?? [];

  for (const rad of plan.rader) {
    const marknad = lage.marknader.find((m) => (m.conditions?.regionsCondition?.regions?.nodes ?? []).some((r) => String(r.code).toUpperCase() === rad.land)) ?? null;
    if (!marknad) { manuella.push(`${rad.valuta}: ingen marknad för ${landsnamnSv(rad.land)} i Shopify — kör marknad-steget först`); continue; }
    const valutalage = await hamtaMarknadsvaluta(marknad.id);
    const bas = valutalage?.currencySettings?.baseCurrency?.currencyCode ?? null;
    if (bas !== rad.valuta) { manuella.push(basvalutaSkal(rad, marknad.name, bas)); continue; }

    const pl = await sakerstallPrislista(rad, marknad.id, { torr });
    const befintliga = pl.id && !torr ? await hamtaFastaPriser(pl.id) : [];
    const att = varianterAttSkriva(varianter, befintliga, rad);
    const skrivet = pl.id || torr ? await skrivFastaPriser(pl.id, att, rad, { torr }) : { skrivna: 0 };
    // Tillbakaläsning: varje variant ska nu bära FIXED-priset.
    let kvar = [];
    if (!torr && pl.id) kvar = varianterAttSkriva(varianter, await hamtaFastaPriser(pl.id), rad).map((v) => v.title ?? v.id);
    if (kvar.length > 0) manuella.push(`${rad.valuta}: ${kvar.length} varianter bär inte det fasta priset efter skrivning (${kvar.join(', ')})`);
    prislistor.push({ valuta: rad.valuta, land: rad.land, marknad: marknad.name, id: pl.id, skapad: pl.skapad, varianter: varianter.length, skrivna: skrivet.skrivna, redanRatt: varianter.length - att.length, pris: rad.pris, jamforpris: rad.jamforpris });
  }
  return { prislistor, manuella, plan };
}

// ---- CLI ----------------------------------------------------------------------

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const torr = arg.includes('--torr') || arg.includes('--dry');
  const [butikId, produktId] = arg.filter((a) => !a.startsWith('--'));
  if (!butikId || !produktId) {
    console.error('Användning: node factory/prislista.mjs <butik-id> <produkt-id> [--torr]');
    process.exit(1);
  }
  const butiksfil = join(FACTORY_ROT, 'butiker', `${butikId}.yaml`);
  const produktfil = join(FACTORY_ROT, 'produkter', `${produktId}.yaml`);
  for (const f of [butiksfil, produktfil]) if (!existsSync(f)) throw new Error(`Hittar inte ${f}.`);
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const produkt = lasYaml(readFileSync(produktfil, 'utf8'));
  const plan = byggPrislistplan(produkt, butik);
  console.log(`Plan: ${plan.rader.length} prislistor${plan.rader.length ? ' — ' + plan.rader.map((r) => `${r.valuta} (${r.land}) ${r.pris}${r.jamforpris ? ` / ${r.jamforpris}` : ''}`).join(', ') : ''}`);
  for (const f of plan.fel) console.log(`🖐 ${f}`);
  if (plan.rader.length === 0) return;
  const shop = await kontrolleraAnslutning();
  console.log(`Connected: ${shop.myshopifyDomain} ✓${torr ? '  (torrkörning)' : ''}`);
  const r = await sakerstallPrislistor({ butik, shop }, produkt, { torr });
  for (const p of r.prislistor) {
    console.log(`✅ ${p.valuta} → ${p.marknad}: prislista ${p.skapad ? (torr ? 'skulle skapas' : 'skapad') : 'fanns'}${p.id ? ` (${String(p.id).split('/').pop()})` : ''}, ${p.skrivna} av ${p.varianter} varianter ${torr ? 'skulle få' : 'fick'} ${p.pris}${p.jamforpris ? ` / ${p.jamforpris}` : ''} ${p.valuta}${p.redanRatt ? ` (${p.redanRatt} stod redan rätt)` : ''}`);
  }
  for (const m of r.manuella) console.log(`🖐 ${m}`);
  console.log('\nTrippelkolla som kund i landet: POST /localization (country_code=<land>) och läs priset på produktsidan — /<locale> byter bara språk, inte valuta.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
