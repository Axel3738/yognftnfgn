#!/usr/bin/env node
// Rabattkoden bakom tacksides-erbjudandet — skapas/uppdateras idempotent.
//
//   node factory/tacksida/rabatter.mjs [--torr] [--spec factory/tacksida/erbjudande.json]
//
// Läser erbjudandespecen (kod, procent, produkter) och produkternas id:n ur
// produkter.lage.json, mintar butikens token (samma domänspärr som
// produkter.mjs) och gör:
//   1. discountCodeBasicCreate/Update: procentrabatt låst till EXAKT de här
//      produkterna, en gång per kund, kombinerbar med produktrabatter
//      (paketkoderna gäller andra produkter, så inget krockar), ingen
//      sluttid (giltigheten är erbjudandekortets sak — koden fungerar så
//      länge den finns, det är inget löfte som bryts).
//   2. Läser tillbaka koden och skriver factory/tacksida/rabatter.lage.json.
//
// Procenten här MÅSTE vara samma som `rabatt_procent` i extensionens
// inställningar (kortet räknar sitt pris med den) — därför skrivs båda ur
// SAMMA spec, och skriptet skriver ut raden som ska stå i kassaredigeraren.
// Noll beroenden. Skriver aldrig priser på produkterna.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { losNycklar, suffixForDoman, normaliseraDoman } from '../token.mjs';
import { graphql } from '../shopify.mjs';
import { lasYaml } from '../yaml.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const LAGE_FIL = join(HAR, 'rabatter.lage.json');

// ------------------------------------------------------------- ren logik

/** Input till discountCodeBasicCreate/Update ur ETT erbjudande + produkt-id:n. */
export function byggRabattInput(spec, produktIds, erbj = spec) {
  const procent = Number(erbj.rabatt_procent);
  if (!(procent > 0 && procent < 100)) throw new Error('rabatt_procent måste vara 1–99.');
  if (Math.abs(procent * 100 - Math.round(procent * 100)) > 1e-6) throw new Error(`rabatt_procent ${procent}: Shopify lagrar högst två decimaler.`);
  if (!/^[A-Z0-9]{3,20}$/.test(String(erbj.rabattkod ?? ''))) throw new Error('rabattkod: 3–20 versaler/siffror.');
  if (produktIds.length === 0) throw new Error('inga produkt-id:n att låsa koden till.');
  return {
    title: erbj.titel ?? `Tacksidan: ${erbj.rabattkod} (${procent} %)`,
    code: erbj.rabattkod,
    startsAt: spec.startar ?? '2026-09-26T00:00:00Z',
    appliesOncePerCustomer: spec.en_gang_per_kund !== false,
    combinesWith: { productDiscounts: true, orderDiscounts: false, shippingDiscounts: true },
    customerSelection: { all: true },
    customerGets: {
      // Shopify lagrar två decimaler (mätt 2026-09-26: 35,251 blev 35,25).
      value: { percentage: Math.round(procent * 100) / 10000 },
      items: { products: { productsToAdd: produktIds } },
    },
  };
}

/** Uppdateringsinput: samma som skapandet, men produkterna sätts som diff. */
export function byggUppdateringsInput(spec, produktIds, befintligaIds, erbj = spec) {
  const bas = byggRabattInput(spec, produktIds, erbj);
  const bort = befintligaIds.filter((id) => !produktIds.includes(id));
  const till = produktIds.filter((id) => !befintligaIds.includes(id));
  return {
    ...bas,
    customerGets: {
      value: bas.customerGets.value,
      items: { products: { ...(till.length ? { productsToAdd: till } : {}), ...(bort.length ? { productsToRemove: bort } : {}) } },
    },
  };
}

// ------------------------------------------------------------- nät

async function anslut(butikId) {
  const butik = lasYaml(readFileSync(join(HAR, '..', 'butiker', `${butikId}.yaml`), 'utf8'));
  const doman = normaliseraDoman(butik?.butik?.myshopify);
  const suffix = suffixForDoman(doman);
  if (!suffix) throw new Error(`Ingen SHOPIFY_SHOP_<suffix> i miljön bär ${doman}.`);
  const { shop, clientId, clientSecret } = losNycklar(suffix);
  if (normaliseraDoman(shop) !== doman) throw new Error(`Nycklarna för ${suffix} pekar inte på ${doman}.`);
  const j = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
  }).then((r) => r.json());
  if (!j.access_token) throw new Error(`Token nekad: ${JSON.stringify(j).slice(0, 200)}`);
  process.env.SHOPIFY_STORE_DOMAIN = shop;
  process.env.SHOPIFY_ADMIN_TOKEN = j.access_token;
  const d = await graphql(`{ shop { name myshopifyDomain } }`);
  if (normaliseraDoman(d.shop.myshopifyDomain) !== doman) throw new Error(`Svarade ${d.shop.myshopifyDomain}, väntade ${doman}.`);
  return { shop, namn: d.shop.name };
}

const FALT = `id codeDiscount { ... on DiscountCodeBasic {
  title status startsAt endsAt appliesOncePerCustomer usageLimit asyncUsageCount
  codes(first: 3) { nodes { code } }
  combinesWith { productDiscounts orderDiscounts shippingDiscounts }
  customerGets { value { ... on DiscountPercentage { percentage } } items { ... on DiscountProducts { products(first: 20) { nodes { id handle } } } } }
} }`;

// Slår upp koden DIREKT (codeDiscountNodeByCode) — sökindexet bakom
// codeDiscountNodes(query:) släpar efter nyss skapade koder (mätt 2026-09-26:
// "Code must be unique" på andra körningen fast sökningen gav noll).
async function hittaKod(kod) {
  const d = await graphql(`query tacksidaKod($kod: String!) { codeDiscountNodeByCode(code: $kod) { ${FALT} } }`, { kod });
  return d.codeDiscountNodeByCode ?? null;
}

// Sökindexet (codeDiscountNodes query) släpar efter ett nyss skapat objekt —
// läs då noden på id i stället.
async function hamtaNod(id) {
  const d = await graphql(`query tacksidaNod($id: ID!) { codeDiscountNode(id: $id) { ${FALT} } }`, { id });
  return d.codeDiscountNode ?? null;
}

async function skapa(input) {
  const d = await graphql(
    `mutation tacksidaSkapa($input: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $input) { codeDiscountNode { ${FALT} } userErrors { field code message } }
    }`,
    { input }
  );
  return d.discountCodeBasicCreate.codeDiscountNode;
}

async function uppdatera(id, input) {
  const d = await graphql(
    `mutation tacksidaUppdatera($id: ID!, $input: DiscountCodeBasicInput!) {
      discountCodeBasicUpdate(id: $id, basicCodeDiscount: $input) { codeDiscountNode { ${FALT} } userErrors { field code message } }
    }`,
    { id, input }
  );
  return d.discountCodeBasicUpdate.codeDiscountNode;
}

// ------------------------------------------------------------- körning

async function main() {
  const args = process.argv.slice(2);
  const torr = args.includes('--torr');
  const specIx = args.indexOf('--spec');
  const spec = JSON.parse(readFileSync(specIx >= 0 ? args[specIx + 1] : join(HAR, 'erbjudande.json'), 'utf8'));
  const lageFil = join(HAR, 'produkter.lage.json');
  if (!existsSync(lageFil)) throw new Error('produkter.lage.json saknas — kör produkter.mjs först.');
  const produktlage = JSON.parse(readFileSync(lageFil, 'utf8'));
  const erbjudanden = spec.erbjudanden ?? [];
  if (erbjudanden.length === 0) throw new Error('erbjudande.json saknar erbjudanden[].');
  const rader = erbjudanden.map((e) => {
    const p = produktlage.produkter[e.produkt];
    if (!p) throw new Error(`${e.produkt} finns inte i produkter.lage.json.`);
    const input = byggRabattInput(spec, [p.produkt_id], e);
    // Shopify trunkerar rabattbeloppet till hela ören (mätt 2026-09-26): räkna likadant.
    const rabatt = Math.floor(Number(p.pris) * Number(e.rabatt_procent) + 1e-6) / 100;
    const pris = Math.round((Number(p.pris) - rabatt) * 100) / 100;
    return { e, p, input, pris };
  });

  console.log(`Rabattkoderna för tacksidan — ${produktlage.butik} ${torr ? '(TORRT)' : '(SKARPT)'}`);
  for (const { e, p, pris } of rader) {
    const mal = e.pris_mal_sek != null ? (Math.abs(pris - Number(e.pris_mal_sek)) < 0.005 ? '= målet ✓' : `≠ målet ${e.pris_mal_sek} ✗`) : '';
    console.log(`  • ${e.rabattkod}: ${e.rabatt_procent} % på ${p.handle} — ${p.pris} → ${pris.toFixed(2)} kr ${mal}`);
  }
  console.log(`  en gång per kund: ${spec.en_gang_per_kund !== false} · kombineras med produktrabatter: ja, orderrabatter: nej`);
  if (rader.some(({ e, pris }) => e.pris_mal_sek != null && Math.abs(pris - Number(e.pris_mal_sek)) >= 0.005)) {
    throw new Error('en procent ger inte målpriset — rätta rabatt_procent i erbjudande.json.');
  }
  if (torr) return console.log('\nTorrt: inget skrivet.');

  const k = await anslut(produktlage.butik);
  console.log(`\nConnected: ${k.shop} (${k.namn}) ✓`);
  const lage = { butik: produktlage.butik, uppdaterad: new Date().toISOString(), koder: {} };
  for (const { e, p, input } of rader) {
    const finns = await hittaKod(input.code);
    let nodId;
    if (finns) {
      const befintliga = finns.codeDiscount.customerGets?.items?.products?.nodes?.map((n) => n.id) ?? [];
      await uppdatera(finns.id, byggUppdateringsInput(spec, [p.produkt_id], befintliga, e));
      nodId = finns.id;
      console.log(`${input.code}: fanns (${finns.id}) — uppdaterad.`);
    } else {
      const nod = await skapa(input);
      nodId = nod.id;
      console.log(`${input.code}: skapad (${nod.id}).`);
    }
    const tillbaka = (await hamtaNod(nodId)) ?? (await hittaKod(input.code));
    if (!tillbaka) throw new Error(`${input.code}: gick inte att läsa tillbaka.`);
    const d = tillbaka.codeDiscount;
    lage.koder[e.produkt] = {
      id: tillbaka.id,
      kod: input.code,
      procent: Math.round((d.customerGets?.value?.percentage ?? 0) * 10000) / 100,
      status: d.status,
      en_gang_per_kund: d.appliesOncePerCustomer,
      produkter: (d.customerGets?.items?.products?.nodes ?? []).map((n) => n.handle),
      anvand: d.asyncUsageCount,
    };
    const kk = lage.koder[e.produkt];
    console.log(`  tillbakaläst: ${kk.kod} ${kk.procent} % ${kk.status}, produkter: ${kk.produkter.join(', ')}, använd ${kk.anvand} ggr`);
  }
  writeFileSync(LAGE_FIL, `${JSON.stringify(lage, null, 2)}\n`);
  console.log(`\nSkrev ${LAGE_FIL}`);
  console.log('\nSamma tal i kassaredigeraren (blocket "Tacksidan: erbjudande efter köp"):');
  rader.forEach(({ e, p }, i) => console.log(`  produkt_${i + 1}=${p.handle}  kod_${i + 1}=${e.rabattkod}  procent_${i + 1}=${e.rabatt_procent}`));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`FEL: ${e.message}`);
    process.exit(1);
  });
}
