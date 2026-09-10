// paket.mjs — paketnivåerna (ms_paketniva) + rabattkoderna som gör dem sanna.
//
//   node factory/paket.mjs <produkt-handle>
//
// Två saker byggs, och de MÅSTE byggas ihop:
//   1. metaobjekt-definitionen ms_paketniva + en post per nivå
//   2. en riktig rabattkod per nivå som ger exakt nivåns pris i kassan
//
// Ärlighetsspärren i snippets/ms-paket.liquid visar ett rabatterat pris BARA
// när nivån har både en rabattnivå och en `rabattkod`. Skapas nivåerna utan
// koder visar sidan fullpris — vilket är rätt, men då är erbjudandet meningslöst.
//
// ⚠️ RABATTEN ÄR EN PROCENT, ALDRIG ETT BELOPP (mätt 2026-09-09 på DryTrek).
// Varje OPS-butik säljer i minst två valutor (SE + NO är standard, inte
// tillval). Ett fast belopp är alltid skrivet i EN valuta: rabattkoden drar
// då 116,70 SEK även i den norska kassan, och kortet på /nb visar samma
// SEK-siffra eftersom `fastpris` är number_decimal och Shopify bara översätter
// textfält. Procent skalar med både variant och valuta, i kortet och i kassan.
// `fastpris` skrivs fortfarande, som svensk referenssiffra och som fallback
// för äldre butiker.
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
  // Rabatten som procent. Det här fältet är det som gäller — se filhuvudet.
  { key: 'rabatt_procent', name: 'Rabatt i procent', type: 'number_integer' },
  { key: 'rabattkod', name: 'Rabattkod', type: 'single_line_text_field' },
  { key: 'bogo_gratis', name: 'BOGO gratis', type: 'number_integer' },
  { key: 'gratis_produkt', name: 'Gratisprodukt', type: 'product_reference' },
  { key: 'gratis_antal', name: 'Gratisantal', type: 'number_integer' },
  { key: 'gratis_text', name: 'Gratistext', type: 'single_line_text_field' },
];

export async function sakerstallDefinition() {
  const finns = await graphql(
    `query opsFactoryPaketDef {
      metaobjectDefinitions(first: 50) { nodes { id type fieldDefinitions { key } } }
    }`
  );
  const traff = (finns.metaobjectDefinitions?.nodes ?? []).find((n) => n.type === 'ms_paketniva');
  if (traff) {
    // En butik byggd före `rabatt_procent` saknar fältet. Lägg till det som
    // fattas i stället för att låta nivåerna falla tillbaka på fastpris.
    const har = new Set((traff.fieldDefinitions ?? []).map((f) => f.key));
    const saknas = FALT.filter((f) => !har.has(f.key));
    if (saknas.length > 0) {
      const d = await graphql(
        `mutation opsFactoryPaketDefFalt($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
          metaobjectDefinitionUpdate(id: $id, definition: $definition) {
            metaobjectDefinition { id }
            userErrors { field message }
          }
        }`,
        {
          id: traff.id,
          definition: {
            fieldDefinitions: saknas.map((f) => ({
              create: { key: f.key, name: f.name, type: f.type },
            })),
          },
        }
      );
      const fel = d.metaobjectDefinitionUpdate?.userErrors ?? [];
      if (fel.length > 0) throw new Error(`Definitionen: ${fel.map((f) => f.message).join('; ')}`);
    }
    return { id: traff.id, skapad: false, tillagda: saknas.map((f) => f.key) };
  }

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

// Rabattkod som drar en PROCENT på just den här produkten, och bara när
// kunden har minst `minAntal` i korgen. Procenten räknas ut av anroparen ur
// nivåns pris — koden och kortet kan då aldrig säga olika saker, i någon valuta.
//
// ⚠️ `procent` är hela procenttal (15 = 15 %). Shopify vill ha andel (0.15).
export async function skrivRabattkod({ kod, titel, procent, minAntal, produktId }) {
  const finns = await graphql(
    `query opsFactoryKod($fraga: String!) {
      codeDiscountNodes(first: 5, query: $fraga) {
        nodes { id codeDiscount { ... on DiscountCodeBasic { title } } }
      }
    }`,
    { fraga: `code:${kod}` }
  );
  // ⚠️ `query: "code:X"` är en LUDDIG sökning. Mätt 2026-09-10 på DryTrek:
  // sökningen efter DAMASKER4PACK svarade med DAMASKER2PACK, och koden för
  // 2-packet skrevs över till 20 % / min 4 — det förvalda paketet stod utan
  // rabatt i kassan medan kortet lovade 661,30. Träffen räknas därför bara
  // om koden är EXAKT densamma; annars skapas en ny.
  const befintlig = (finns.codeDiscountNodes?.nodes ?? []).find((n) =>
    (n.codeDiscount?.codes?.nodes ?? []).some((c) => c.code === kod)
  ) ?? null;

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
      value: { percentage: Math.round(procent) / 100 },
      items: { products: { productsToAdd: [produktId] } },
    },
  };

  if (befintlig) {
    // ⚠️ `code` får INTE skickas med på en uppdatering av en kod som redan
    // har det värdet — Shopify svarar "Code must be unique" och jämför mot
    // koden själv (mätt 2026-09-09).
    const { code, ...utanKod } = basic;
    const d = await graphql(
      `mutation opsFactoryKodUppdatera($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode { id }
          userErrors { field message }
        }
      }`,
      { id: befintlig.id, basicCodeDiscount: utanKod }
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
  if (def.tillagda?.length) console.log(`   ➕ fält tillagda: ${def.tillagda.join(', ')}`);

  for (const n of konf.nivaer) {
    const ordinarie = styckpris * n.antal;
    if (n.fastpris != null && n.fastpris > ordinarie + 0.001) {
      throw new Error(`Nivå ${n.handle}: fastpris ${n.fastpris} är HÖGRE än ordinarie ${ordinarie}.`);
    }

    // Procenten räknas ur konfigens fastpris, så siffrorna i JSON-filen får
    // stå kvar som de är. Den MÅSTE bli ett helt procenttal: en kod på
    // 14,7 % går inte att skriva, och en avrundad kod gör att kortet och
    // kassan säger olika saker.
    let procent = null;
    if (n.rabatt_procent != null) {
      procent = n.rabatt_procent;
    } else if (n.fastpris != null && n.fastpris < ordinarie) {
      const exakt = (1 - n.fastpris / ordinarie) * 100;
      procent = Math.round(exakt);
      if (Math.abs(exakt - procent) > 0.001) {
        const rakt = Math.round(ordinarie * (1 - procent / 100) * 100) / 100;
        throw new Error(
          `Nivå ${n.handle}: fastpris ${n.fastpris} av ${ordinarie} är ${exakt.toFixed(2)} % — ` +
            `inte ett helt procenttal. Sätt fastpris ${rakt} (${procent} %) eller ange rabatt_procent i konfigen.`
        );
      }
    }

    let kod = null;
    if (procent != null && procent > 0) {
      kod = n.rabattkod;
      const r = await skrivRabattkod({
        kod,
        titel: `${konf.brand} ${n.rubrik} — ${procent} % rabatt`,
        procent,
        minAntal: n.antal,
        produktId,
      });
      console.log(`   ${r.ny ? '✅' : '♻️ '} kod ${kod}: −${procent} % vid ${n.antal}+ st`);
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
      rabatt_procent: procent != null ? String(procent) : '',
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
