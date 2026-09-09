// Paketnivåerna: metaobjektet ms_paketniva + de RIKTIGA rabattkoder som gör
// att kassan ger exakt det pris kortet visar.
//
//   node factory/paket.mjs <butik.yaml> <produkt.yaml> [fler …] [--dry]
//
// Varför koder och inte bara en widget: temats ms-paket.liquid har en
// ärlighetsspärr — ett rabatterat pris visas BARA när nivån har både fastpris
// och rabattkod. En widget som ritar kort utan kod visar ett pris kassan inte
// ger, och det upptäcker kunden i sista steget.
//
// A = källans Kaching-nivåer (bevisat erbjudande).
// B = testoffer. Förvald nivå är ALLTID mitten, ⌈n/2⌉ (Axels beslut
// 2026-09-07) — aldrig den första.
//
// Rabatten är ett BELOPP, inte en procent: så fungerar en Shopify-rabattkod,
// och så räknar snippeten. Beloppet = ordinarie (styckpris × antal) − fastpris.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { basename, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaProduktViaHandle } from './shopify.mjs';

export const TYP = 'ms_paketniva';

// Fälten snippeten läser (snippets/ms-paket.liquid).
const FALT = [
  { key: 'produkt', name: 'Produkt', type: 'product_reference' },
  { key: 'ab_variant', name: 'AB-variant', type: 'single_line_text_field' },
  { key: 'antal', name: 'Antal', type: 'number_integer' },
  { key: 'rubrik', name: 'Rubrik', type: 'single_line_text_field' },
  { key: 'underrubrik', name: 'Underrubrik', type: 'single_line_text_field' },
  { key: 'bricka', name: 'Bricka', type: 'single_line_text_field' },
  { key: 'fastpris', name: 'Fastpris', type: 'number_decimal' },
  { key: 'rabattkod', name: 'Rabattkod', type: 'single_line_text_field' },
  { key: 'forvald', name: 'Förvald', type: 'boolean' },
  { key: 'bogo_gratis', name: 'BOGO gratis', type: 'number_integer' },
  { key: 'gratis_produkt', name: 'Gratis produkt', type: 'product_reference' },
  { key: 'gratis_antal', name: 'Gratis antal', type: 'number_integer' },
  { key: 'gratis_text', name: 'Gratis text', type: 'single_line_text_field' },
];

// Nivåerna. A är källans Kaching-uppsättning, B testoffret.
// Rabattprocenten är MOT ordinarie styckpris × antal.
export const NIVAER = {
  a: [
    { antal: 1, rabatt: 0, rubrik: '1 st', underrubrik: 'Standard pris', bricka: '' },
    { antal: 2, rabatt: 0.15, rubrik: '2 st', underrubrik: '', bricka: 'Mest populär' },
    { antal: 3, rabatt: 0.2, rubrik: '3 st', underrubrik: '', bricka: 'Bäst pris' },
  ],
  // B testar EN sak: ett steg djupare rabatt per nivå. Inte mer.
  // 30 % på 3-packet vore ett ärligare test av djup, men TackleBays
  // inköpskostnader är ännu gissningar (40 % av priset) — ett testoffer får
  // inte kunna hamna under break-even på ett tal ingen bekräftat.
  // Höj till 30 % när Axel gett de riktiga inköpspriserna.
  b: [
    { antal: 1, rabatt: 0, rubrik: '1 st', underrubrik: 'Standard pris', bricka: '' },
    { antal: 2, rabatt: 0.2, rubrik: '2 st', underrubrik: '', bricka: 'Mest populär' },
    { antal: 3, rabatt: 0.25, rubrik: '3 st', underrubrik: '', bricka: 'Bäst pris' },
  ],
};

// Mitten, alltid: ⌈n/2⌉ räknat från 1. Aldrig första nivån.
export const forvaldIndex = (antalNivaer) => Math.ceil(antalNivaer / 2) - 1;

// Öre in, öre ut — flyttal på pengar ger 491.29999999999995.
const ore = (kr) => Math.round(Number(kr) * 100);
const kr = (o) => (o / 100).toFixed(2);

// Räknar en nivå till exakt de tal både kortet och kassan ska visa.
export function byggNiva(niva, styckpris, index, antalNivaer, prefix, abVariant) {
  const ordinarie = ore(styckpris) * niva.antal;
  const fastpris = Math.round(ordinarie * (1 - niva.rabatt));
  const rabattbelopp = ordinarie - fastpris;
  const kod = niva.rabatt > 0 ? `${prefix}${niva.antal}${abVariant.toUpperCase()}` : '';
  return {
    ...niva,
    handle: `${prefix}-${abVariant}-${niva.antal}`.toLowerCase(),
    abVariant,
    ordinarie,
    fastpris,
    rabattbelopp,
    kod,
    forvald: index === forvaldIndex(antalNivaer),
  };
}

export function byggNivaer(p, prefix) {
  const styckpris = p.ekonomi.pris;
  const ut = [];
  for (const [abVariant, lista] of Object.entries(NIVAER)) {
    lista.forEach((niva, i) => {
      ut.push(byggNiva(niva, styckpris, i, lista.length, prefix, abVariant));
    });
  }
  return ut;
}

// --- Shopify ---------------------------------------------------------------

async function hamtaDefinition() {
  const data = await graphql(
    `query opsFactoryPaketDef($type: String!) {
      metaobjectDefinitionByType(type: $type) { id type fieldDefinitions { key } }
    }`,
    { type: TYP }
  );
  return data.metaobjectDefinitionByType ?? null;
}

export async function sakerstallDefinition() {
  const befintlig = await hamtaDefinition();
  if (befintlig) {
    const har = new Set(befintlig.fieldDefinitions.map((f) => f.key));
    const saknas = FALT.filter((f) => !har.has(f.key));
    if (saknas.length === 0) return { id: befintlig.id, skapad: false, tillagda: 0 };
    const data = await graphql(
      `mutation opsFactoryPaketDefUppdatera($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
        metaobjectDefinitionUpdate(id: $id, definition: $definition) {
          metaobjectDefinition { id }
          userErrors { field message }
        }
      }`,
      {
        id: befintlig.id,
        definition: { fieldDefinitions: saknas.map((f) => ({ create: f })) },
      }
    );
    const fel = data.metaobjectDefinitionUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`Definitionen: ${fel.map((f) => f.message).join('; ')}`);
    return { id: befintlig.id, skapad: false, tillagda: saknas.length };
  }

  const data = await graphql(
    `mutation opsFactoryPaketDefSkapa($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition { id type }
        userErrors { field message code }
      }
    }`,
    {
      definition: {
        type: TYP,
        name: 'Paketnivå',
        // translatable PÅ FRÅN START (PROCESS.md fas 2 steg 7) — slås den på
        // i efterhand går befintliga poster inte att översätta till nb.
        capabilities: { translatable: { enabled: true } },
        fieldDefinitions: FALT,
      },
    }
  );
  const fel = data.metaobjectDefinitionCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Definitionen: ${fel.map((f) => `${f.code ?? ''} ${f.message}`).join('; ')}`);
  return { id: data.metaobjectDefinitionCreate.metaobjectDefinition.id, skapad: true, tillagda: FALT.length };
}

async function hamtaRabattkod(kod) {
  const data = await graphql(
    `query opsFactoryRabatt($q: String!) {
      codeDiscountNodes(first: 10, query: $q) {
        nodes { id codeDiscount { ... on DiscountCodeBasic { title codes(first: 5) { nodes { code } } } } }
      }
    }`,
    { q: `code:${kod}` }
  );
  return (
    (data.codeDiscountNodes?.nodes ?? []).find((n) =>
      (n.codeDiscount?.codes?.nodes ?? []).some((c) => c.code === kod)
    ) ?? null
  );
}

// Rabattkoden som ger EXAKT nivåns pris. Beloppsrabatt + minsta antal, låst
// till produkten — annars kan koden användas på fel vara eller för få.
export async function sakerstallRabattkod(niva, produktId, valuta) {
  const befintlig = await hamtaRabattkod(niva.kod);
  if (befintlig) return { kod: niva.kod, skapad: false };

  const data = await graphql(
    `mutation opsFactoryRabattSkapa($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode { id }
        userErrors { field message code }
      }
    }`,
    {
      basicCodeDiscount: {
        title: `${niva.rubrik} — ${niva.abVariant.toUpperCase()} (${niva.kod})`,
        code: niva.kod,
        startsAt: new Date().toISOString(),
        customerSelection: { all: true },
        customerGets: {
          value: {
            discountAmount: {
              amount: kr(niva.rabattbelopp),
              appliesOnEachItem: false,
            },
          },
          items: { products: { productsToAdd: [produktId] } },
        },
        minimumRequirement: {
          quantity: { greaterThanOrEqualToQuantity: String(niva.antal) },
        },
        appliesOncePerCustomer: false,
      },
    }
  );
  const fel = data.discountCodeBasicCreate?.userErrors ?? [];
  if (fel.length > 0) {
    throw new Error(`Rabattkoden ${niva.kod}: ${fel.map((f) => `${f.code ?? ''} ${f.message}`).join('; ')}`);
  }
  return { kod: niva.kod, skapad: true, valuta };
}

export async function skrivNiva(niva, produktId) {
  const falt = [
    { key: 'produkt', value: produktId },
    { key: 'ab_variant', value: niva.abVariant },
    { key: 'antal', value: String(niva.antal) },
    { key: 'rubrik', value: niva.rubrik },
    { key: 'underrubrik', value: niva.underrubrik ?? '' },
    { key: 'bricka', value: niva.bricka ?? '' },
    { key: 'fastpris', value: kr(niva.fastpris) },
    { key: 'rabattkod', value: niva.kod },
    { key: 'forvald', value: String(niva.forvald) },
    { key: 'bogo_gratis', value: '0' },
    { key: 'gratis_antal', value: '0' },
    { key: 'gratis_text', value: '' },
  ];
  const data = await graphql(
    `mutation opsFactoryPaketUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject { id handle }
        userErrors { field message code }
      }
    }`,
    {
      handle: { type: TYP, handle: niva.handle },
      metaobject: { fields: falt },
    }
  );
  const fel = data.metaobjectUpsert?.userErrors ?? [];
  if (fel.length > 0) {
    throw new Error(`Nivån ${niva.handle}: ${fel.map((f) => `${f.code ?? ''} ${f.message}`).join('; ')}`);
  }
  return data.metaobjectUpsert.metaobject;
}

export async function byggPaket(butik, produktfiler, { dry = false, tvinga = false } = {}) {
  const rapport = [];
  if (!dry) {
    // ⚠️ VALUTASPÄRREN (byggd 2026-09-09 efter att TackleBays åtta koder
    // skrevs som PHP-belopp): en rabattkod lagras i BUTIKENS valuta. Står
    // butiken kvar i registreringsvalutan blir "86.70" 86,70 fel valuta, och
    // felet syns inte i adminen — bara i kassan, på riktiga ordrar.
    const { kontrolleraAnslutning } = await import('./shopify.mjs');
    const shop = await kontrolleraAnslutning();
    if (shop.currencyCode !== butik.butik.valuta && !tvinga) {
      throw new Error(
        `Butikens valuta är ${shop.currencyCode}, konfigen säger ${butik.butik.valuta}. ` +
          'Rabattkoderna skulle skrivas i fel valuta. Byt valuta i Shopify-admin och kör om ' +
          '(eller kör med --tvinga om du vet vad du gör).'
      );
    }

    const def = await sakerstallDefinition();
    rapport.push(
      `Definition ${TYP}: ${def.skapad ? 'skapad' : 'fanns redan'}${def.tillagda > 0 ? `, ${def.tillagda} fält` : ''}`
    );
  }

  for (const fil of produktfiler) {
    const p = lasYaml(readFileSync(fil, 'utf8'));
    const prefix = (p.meta?.creative_prefix ?? p.produkt.id).replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
    const nivaer = byggNivaer(p, prefix);
    rapport.push(`\n${p.produkt.namn} — styckpris ${p.ekonomi.pris} ${butik.butik.valuta}`);

    let produktId = null;
    if (!dry) {
      const produkt = await hamtaProduktViaHandle(p.produkt.id);
      if (!produkt) throw new Error(`Produkten ${p.produkt.id} finns inte i butiken — kör ops.mjs först.`);
      produktId = produkt.id;
    }

    for (const niva of nivaer) {
      const rad =
        `  ${niva.abVariant.toUpperCase()} · ${niva.rubrik.padEnd(5)} ` +
        `${(niva.fastpris / 100).toFixed(2)} kr (ord ${(niva.ordinarie / 100).toFixed(2)})` +
        `${niva.kod ? ` · kod ${niva.kod} −${(niva.rabattbelopp / 100).toFixed(2)}` : ' · ingen kod'}` +
        `${niva.forvald ? ' · FÖRVALD' : ''}`;
      rapport.push(rad);
      if (dry) continue;
      if (niva.kod) await sakerstallRabattkod(niva, produktId, butik.butik.valuta);
      await skrivNiva(niva, produktId);
    }
  }
  return rapport;
}

async function huvud() {
  laddaEnv();
  const argv = process.argv.slice(2);
  const dry = argv.includes('--dry') || argv.includes('--dry-run');
  const tvinga = argv.includes('--tvinga');
  const filer = argv.filter((a) => !a.startsWith('--'));
  const butiksfil = filer.find((f) => basename(dirname(f)) === 'butiker');
  const produktfiler = filer.filter((f) => f !== butiksfil);
  if (!butiksfil || produktfiler.length === 0) {
    console.error('Användning: node factory/paket.mjs <butik.yaml> <produkt.yaml> [fler …] [--dry]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  console.log(`\nPaketnivåer · ${butik.butik.brand}${dry ? ' · DRY' : ''}\n`);
  for (const rad of await byggPaket(butik, produktfiler, { dry, tvinga })) console.log(rad);
  console.log(dry ? '\n✅ Dry — inget skrevs till Shopify.\n' : '\n✅ Paketnivåer och rabattkoder på plats.\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
