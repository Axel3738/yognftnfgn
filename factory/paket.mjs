// paket.mjs — paketnivåerna (ms_paketniva) + rabattkoderna som gör dem sanna.
//
//   node factory/paket.mjs <produkt-handle>
//
// Två saker byggs, och de MÅSTE byggas ihop:
//   1. metaobjekt-definitionen ms_paketniva + en post per nivå
//   2. en riktig rabattkod per nivå som ger exakt nivåns pris i kassan
//
// Ärlighetsspärren i snippets/ms-paket.liquid visar ett rabatterat pris BARA
// när nivån har både `fastpris` och `rabattkod`. Skapas nivåerna utan koder
// visar sidan fullpris — vilket är rätt, men då är erbjudandet meningslöst.
//
// Definitionen skapas med translatable-capability PÅ från start. Slås den på
// i efterhand går nivåerna inte att översätta till nb (PROCESS.md fas 2 steg 7).
//
// Nivåerna läses ur factory/paketnivaer/<handle>.json så siffrorna aldrig
// står i koden.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

const FALT = [
  { key: 'produkt', name: 'Produkt', type: 'product_reference', required: true },
  { key: 'ab_variant', name: 'A/B-variant', type: 'single_line_text_field' },
  { key: 'antal', name: 'Antal', type: 'number_integer', required: true },
  { key: 'rubrik', name: 'Rubrik', type: 'single_line_text_field', required: true },
  { key: 'underrubrik', name: 'Underrubrik', type: 'single_line_text_field' },
  { key: 'bricka', name: 'Bricka', type: 'single_line_text_field' },
  { key: 'forvald', name: 'Förvald', type: 'boolean' },
  { key: 'fastpris', name: 'Fastpris', type: 'number_decimal' },
  { key: 'rabattkod', name: 'Rabattkod', type: 'single_line_text_field' },
  { key: 'bogo_gratis', name: 'BOGO gratis', type: 'number_integer' },
  { key: 'gratis_produkt', name: 'Gratisprodukt', type: 'product_reference' },
  { key: 'gratis_antal', name: 'Gratisantal', type: 'number_integer' },
  { key: 'gratis_text', name: 'Gratistext', type: 'single_line_text_field' },
];

export async function sakerstallDefinition() {
  const finns = await graphql(
    `query opsFactoryPaketDef {
      metaobjectDefinitions(first: 50) { nodes { id type } }
    }`
  );
  const traff = (finns.metaobjectDefinitions?.nodes ?? []).find((n) => n.type === 'ms_paketniva');
  if (traff) return { id: traff.id, skapad: false };

  const data = await graphql(
    `mutation opsFactoryPaketDefSkapa($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition { id type }
        userErrors { field message }
      }
    }`,
    {
      definition: {
        type: 'ms_paketniva',
        name: 'Paketnivå',
        displayNameKey: 'rubrik',
        // Storefront-läsning krävs — snippeten läser shop.metaobjects.
        access: { storefront: 'PUBLIC_READ' },
        // Translatable PÅ FRÅN START. Slås den på senare går befintliga
        // nivåer inte att översätta (PROCESS.md fas 2 steg 7).
        capabilities: { translatable: { enabled: true } },
        fieldDefinitions: FALT.map((f) => ({
          key: f.key,
          name: f.name,
          type: f.type,
          ...(f.required ? { required: true } : {}),
        })),
      },
    }
  );
  const fel = data.metaobjectDefinitionCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Definitionen: ${fel.map((f) => f.message).join('; ')}`);
  return { id: data.metaobjectDefinitionCreate.metaobjectDefinition.id, skapad: true };
}

// Idempotent: samma handle skrivs över i stället för att dubbleras.
export async function skrivNiva(handle, falt) {
  const finns = await graphql(
    `query opsFactoryNiva($handle: MetaobjectHandleInput!) {
      metaobjectByHandle(handle: $handle) { id }
    }`,
    { handle: { type: 'ms_paketniva', handle } }
  );
  const fields = Object.entries(falt)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([key, value]) => ({ key, value: String(value) }));

  if (finns.metaobjectByHandle?.id) {
    const d = await graphql(
      `mutation opsFactoryNivaUppdatera($id: ID!, $metaobject: MetaobjectUpdateInput!) {
        metaobjectUpdate(id: $id, metaobject: $metaobject) {
          metaobject { id handle }
          userErrors { field message }
        }
      }`,
      { id: finns.metaobjectByHandle.id, metaobject: { fields } }
    );
    const fel = d.metaobjectUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`Nivån ${handle}: ${fel.map((f) => f.message).join('; ')}`);
    return { ...d.metaobjectUpdate.metaobject, ny: false };
  }

  const d = await graphql(
    `mutation opsFactoryNivaSkapa($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id handle }
        userErrors { field message }
      }
    }`,
    { metaobject: { type: 'ms_paketniva', handle, fields } }
  );
  const fel = d.metaobjectCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Nivån ${handle}: ${fel.map((f) => f.message).join('; ')}`);
  return { ...d.metaobjectCreate.metaobject, ny: true };
}

// Rabattkod som drar ett FAST BELOPP på just den här produkten, och bara när
// kunden har minst `minAntal` i korgen. Beloppet räknas ut av anroparen ur
// nivåns fastpris — koden och kortet kan då aldrig säga olika saker.
export async function skrivRabattkod({ kod, titel, belopp, minAntal, produktId }) {
  const finns = await graphql(
    `query opsFactoryKod($fraga: String!) {
      codeDiscountNodes(first: 5, query: $fraga) {
        nodes { id codeDiscount { ... on DiscountCodeBasic { title } } }
      }
    }`,
    { fraga: `code:${kod}` }
  );
  const befintlig = finns.codeDiscountNodes?.nodes?.[0] ?? null;

  const basic = {
    title: titel,
    code: kod,
    // 2020-01-01 i UTC: koden ska gälla direkt och tills vidare.
    startsAt: '2020-01-01T00:00:00Z',
    customerSelection: { all: true },
    appliesOncePerCustomer: false,
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
    minimumRequirement: {
      quantity: { greaterThanOrEqualToQuantity: String(minAntal) },
    },
    customerGets: {
      value: {
        discountAmount: { amount: belopp.toFixed(2), appliesOnEachItem: false },
      },
      items: { products: { productsToAdd: [produktId] } },
    },
  };

  if (befintlig) {
    const d = await graphql(
      `mutation opsFactoryKodUppdatera($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode { id }
          userErrors { field message }
        }
      }`,
      { id: befintlig.id, basicCodeDiscount: basic }
    );
    const fel = d.discountCodeBasicUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`Koden ${kod}: ${fel.map((f) => f.message).join('; ')}`);
    return { kod, ny: false };
  }

  const d = await graphql(
    `mutation opsFactoryKodSkapa($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode { id }
        userErrors { field message }
      }
    }`,
    { basicCodeDiscount: basic }
  );
  const fel = d.discountCodeBasicCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Koden ${kod}: ${fel.map((f) => f.message).join('; ')}`);
  return { kod, ny: true };
}

if (process.argv[1] && process.argv[1].endsWith('paket.mjs')) {
  laddaEnv();
  const handle = process.argv[2];
  if (!handle) throw new Error('Ange produkt-handle: node factory/paket.mjs <handle>');
  const konf = JSON.parse(readFileSync(join(ROT, 'paketnivaer', `${handle}.json`), 'utf8'));

  const prod = await graphql(
    `query opsFactoryPaketProdukt($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id title
        variants(first: 1) { nodes { price } }
      }
    }`,
    { handle }
  );
  if (!prod.productByIdentifier) throw new Error(`Produkten ${handle} finns inte i butiken.`);
  const produktId = prod.productByIdentifier.id;
  const styckpris = Number(prod.productByIdentifier.variants.nodes[0].price);
  console.log(`Produkt: ${prod.productByIdentifier.title} — ${styckpris} kr/st`);

  const def = await sakerstallDefinition();
  console.log(`${def.skapad ? '✅ Definition skapad' : '⏭  Definition fanns'}: ms_paketniva`);

  for (const n of konf.nivaer) {
    const ordinarie = styckpris * n.antal;
    if (n.fastpris != null && n.fastpris > ordinarie + 0.001) {
      throw new Error(`Nivå ${n.handle}: fastpris ${n.fastpris} är HÖGRE än ordinarie ${ordinarie}.`);
    }
    let kod = null;
    if (n.fastpris != null && n.fastpris < ordinarie) {
      const belopp = Math.round((ordinarie - n.fastpris) * 100) / 100;
      kod = n.rabattkod;
      const r = await skrivRabattkod({
        kod,
        titel: `${konf.brand} ${n.rubrik} — fast pris ${n.fastpris} kr`,
        belopp,
        minAntal: n.antal,
        produktId,
      });
      console.log(`   ${r.ny ? '✅' : '♻️ '} kod ${kod}: −${belopp.toFixed(2)} kr vid ${n.antal}+ st`);
    }
    const r = await skrivNiva(n.handle, {
      produkt: produktId,
      ab_variant: n.ab ?? '',
      antal: n.antal,
      rubrik: n.rubrik,
      underrubrik: n.underrubrik ?? '',
      bricka: n.bricka ?? '',
      forvald: n.forvald ? 'true' : 'false',
      fastpris: n.fastpris != null ? String(n.fastpris) : '',
      rabattkod: kod ?? '',
    });
    const pris = n.fastpris != null ? n.fastpris : ordinarie;
    console.log(
      `   ${r.ny ? '✅' : '♻️ '} nivå ${n.handle}: ${n.antal} st → ${pris} kr` +
        `${n.forvald ? '  ◀ FÖRVALD' : ''}${n.bricka ? `  [${n.bricka}]` : ''}`
    );
  }
  console.log('\nKlart. Nivåerna syns i Innehåll → Metaobjekt → Paketnivå.');
}
