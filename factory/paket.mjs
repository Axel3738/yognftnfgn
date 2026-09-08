// Paketnivåerna: ms_paketniva-metaobjekten + rabattkoderna som ger EXAKT
// paketpriset i kassan (ärlighetsspärren i temats ms-paket: ett rabatterat
// pris visas bara om nivån har både fastpris och rabattkod).
//
//   node factory/paket.mjs factory/produkter/<id>.yaml [--torr]
//
// Läser offer.paket ur produktfilen (test-id + nivåer per A/B-variant) och
// offer.bonus_produkt (gratis-raden). Gör tre saker, alla idempotenta:
//   1. Metaobjektdefinitionen ms_paketniva — skapas om den saknas, med
//      translatable PÅ från start (utan den finns ingen translatableContent,
//      lärdom från HeimGuard 2026-09-07). Fältnycklarna är exakt de som
//      temats snippets/ms-paket.liquid läser.
//   2. En metaobjektpost per nivå, handle <produkt>-<variant>-<antal>.
//      Förvald nivå: den som är markerad i filen — regeln är mitten (⌈n/2⌉),
//      aldrig första (Axel 2026-09-07). Skriptet vägrar om första är förvald.
//   3. Rabattkoden per nivå: fast belopp = antal × pris + gratis × bonuspris
//      − paketpris, med minsta antal varor = antal + gratis (tar kunden bort
//      gratisvaran försvinner rabatten — priset stämmer alltid).
// Noll beroenden.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaProduktViaHandle, kontrolleraAnslutning } from './shopify.mjs';

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

export const METAOBJEKT_TYP = 'ms_paketniva';

// Fälten temats ms-paket.liquid läser. Ordningen är den som visas i adminen.
export const FALT = [
  { key: 'rubrik', name: 'Rubrik', type: 'single_line_text_field', required: true },
  { key: 'underrubrik', name: 'Underrubrik', type: 'single_line_text_field' },
  { key: 'bricka', name: 'Bricka (t.ex. Spara 15 %)', type: 'single_line_text_field' },
  { key: 'produkt', name: 'Produkt', type: 'product_reference', required: true },
  { key: 'antal', name: 'Antal', type: 'number_integer', required: true },
  { key: 'fastpris', name: 'Paketpris (kr)', type: 'number_decimal' },
  { key: 'rabattkod', name: 'Rabattkod', type: 'single_line_text_field' },
  { key: 'forvald', name: 'Förvald', type: 'boolean' },
  { key: 'ab_variant', name: 'A/B-variant (a, b eller tom)', type: 'single_line_text_field' },
  { key: 'gratis_produkt', name: 'Gratis produkt', type: 'product_reference' },
  { key: 'gratis_antal', name: 'Gratis antal', type: 'number_integer' },
  { key: 'gratis_text', name: 'Gratis-text', type: 'single_line_text_field' },
  { key: 'bogo_gratis', name: 'BOGO (antal gratis av samma vara)', type: 'number_integer' },
];

// Ren logik: nivåerna i filen → poster + koder, med all matematik. Testbar.
export function byggPaketplan(p) {
  const paket = p.offer?.paket;
  if (!paket || lista(paket.nivaer).length === 0) throw new Error('offer.paket.nivaer saknas i produktfilen.');
  const pris = Number(p.ekonomi?.pris);
  const bonus = p.offer?.bonus_produkt ?? {};
  const bonuspris = Number(bonus.pris) || 0;
  const produktId = p.produkt.id;
  const test = text(paket.test) ?? '';

  const perVariant = new Map();
  for (const n of lista(paket.nivaer)) {
    const v = (text(n.variant) ?? '').toLowerCase();
    if (!perVariant.has(v)) perVariant.set(v, []);
    perVariant.get(v).push(n);
  }

  const poster = [];
  const koder = [];
  const fel = [];
  for (const [variant, nivaer] of perVariant) {
    const forvalda = nivaer.filter((n) => n.forvald === true);
    const mitten = Math.ceil(nivaer.length / 2) - 1;
    if (forvalda.length !== 1) fel.push(`variant ${variant || '(alla)'}: exakt en nivå ska vara förvald (nu ${forvalda.length})`);
    else if (nivaer.indexOf(forvalda[0]) === 0 && nivaer.length > 1) fel.push(`variant ${variant || '(alla)'}: första nivån är förvald — regeln är mitten (nivå ${mitten + 1})`);

    for (const n of nivaer) {
      const antal = Number(n.antal) || 1;
      const gratisAntal = Number(n.gratis_antal) || 0;
      const kod = text(n.kod);
      const paketpris = Number(n.pris) || 0;
      const ordinarie = antal * pris + gratisAntal * bonuspris;
      const rabatt = kod && paketpris > 0 ? ordinarie - paketpris : 0;
      if (kod && rabatt <= 0) fel.push(`${kod}: paketpriset ${paketpris} är inte lägre än ordinarie ${ordinarie}`);
      if (gratisAntal > 0 && !(bonuspris > 0)) fel.push(`nivå ${antal}${variant}: gratis_antal utan offer.bonus_produkt.pris`);
      const handle = `${produktId}-${variant || 'x'}-${antal}`;
      poster.push({
        handle,
        variant,
        antal,
        rubrik: text(n.rubrik) ?? `${antal} st`,
        underrubrik: text(n.underrubrik) ?? '',
        bricka: text(n.bricka) ?? '',
        fastpris: kod && paketpris > 0 ? paketpris : null,
        kod: kod ?? '',
        forvald: n.forvald === true,
        gratisAntal,
        gratisText: text(n.gratis_text) ?? '',
        ordinarie,
        rabatt,
        kundpris: ordinarie - rabatt,
        // Verklig rabatt på själva produkten (bonusens värde räknas inte in —
        // det är det talet brickan "Spara X %" ska stämma mot).
        sparProcent: rabatt > 0 && paketpris > 0 ? Math.round(((antal * pris - paketpris) / (antal * pris)) * 100) : 0,
      });
      if (kod && rabatt > 0) {
        koder.push({ kod, belopp: rabatt, minstAntal: antal + gratisAntal, titel: `${p.brand?.namn ?? ''} paket ${antal}${variant ? variant.toUpperCase() : ''}`.trim() });
      }
    }
  }
  return { test, poster, koder, fel };
}

async function sakerstallDefinition(torr) {
  const q = await graphql(
    `query opsFactoryPaketDef($type: String!) {
      metaobjectDefinitionByType(type: $type) { id type capabilities { translatable { enabled } } fieldDefinitions { key } }
    }`,
    { type: METAOBJEKT_TYP }
  );
  const def = q.metaobjectDefinitionByType;
  if (def) {
    const saknade = FALT.filter((f) => !def.fieldDefinitions.some((d) => d.key === f.key));
    if (saknade.length > 0 && !torr) {
      const u = await graphql(
        `mutation opsFactoryPaketDefUppd($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
          metaobjectDefinitionUpdate(id: $id, definition: $definition) { userErrors { field message code } }
        }`,
        {
          id: def.id,
          definition: {
            fieldDefinitions: saknade.map((f) => ({ create: { key: f.key, name: f.name, type: f.type, required: f.required === true } })),
            capabilities: { translatable: { enabled: true } },
          },
        }
      );
      const fel = u.metaobjectDefinitionUpdate?.userErrors ?? [];
      if (fel.length > 0) throw new Error(`Definitionen: ${fel.map((f) => f.message).join('; ')}`);
    }
    if (!def.capabilities?.translatable?.enabled && !torr) {
      const u = await graphql(
        `mutation opsFactoryPaketDefTr($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
          metaobjectDefinitionUpdate(id: $id, definition: $definition) { userErrors { field message code } }
        }`,
        { id: def.id, definition: { capabilities: { translatable: { enabled: true } } } }
      );
      const fel = u.metaobjectDefinitionUpdate?.userErrors ?? [];
      if (fel.length > 0) throw new Error(`Translatable: ${fel.map((f) => f.message).join('; ')}`);
    }
    return { id: def.id, skapad: false, saknade: saknade.map((f) => f.key) };
  }
  if (torr) return { id: null, skapad: true, saknade: FALT.map((f) => f.key) };
  const m = await graphql(
    `mutation opsFactoryPaketDefSkapa($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition { id type }
        userErrors { field message code }
      }
    }`,
    {
      definition: {
        // displayNameField finns inte i 2025-07:s CreateInput (mätt 2026-09-08)
        // — adminen visar handle. Storefront-åtkomst PUBLIC_READ krävs för
        // att temats Liquid (shop.metaobjects) ska se posterna.
        type: METAOBJEKT_TYP,
        name: 'Paketnivå',
        access: { storefront: 'PUBLIC_READ' },
        capabilities: { translatable: { enabled: true } },
        fieldDefinitions: FALT.map((f) => ({ key: f.key, name: f.name, type: f.type, required: f.required === true })),
      },
    }
  );
  const fel = m.metaobjectDefinitionCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`metaobjectDefinitionCreate: ${fel.map((f) => f.message).join('; ')}`);
  return { id: m.metaobjectDefinitionCreate.metaobjectDefinition.id, skapad: true, saknade: [] };
}

async function skrivPost(post, produktGid, bonusGid) {
  const falt = [
    ['rubrik', post.rubrik],
    ['underrubrik', post.underrubrik],
    ['bricka', post.bricka],
    ['produkt', produktGid],
    ['antal', String(post.antal)],
    ['fastpris', post.fastpris === null ? '' : String(post.fastpris)],
    ['rabattkod', post.kod],
    ['forvald', post.forvald ? 'true' : 'false'],
    ['ab_variant', post.variant],
    ['gratis_produkt', post.gratisAntal > 0 && bonusGid ? bonusGid : ''],
    ['gratis_antal', String(post.gratisAntal)],
    ['gratis_text', post.gratisAntal > 0 ? post.gratisText : ''],
    ['bogo_gratis', '0'],
  ].map(([key, value]) => ({ key, value }));
  const m = await graphql(
    `mutation opsFactoryPaketPost($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject { id handle }
        userErrors { field message code }
      }
    }`,
    { handle: { type: METAOBJEKT_TYP, handle: post.handle }, metaobject: { fields: falt } }
  );
  const fel = m.metaobjectUpsert?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`${post.handle}: ${fel.map((f) => `${f.field?.join('.') ?? ''} ${f.message}`).join('; ')}`);
  return m.metaobjectUpsert.metaobject;
}

async function skrivKod(k, valuta) {
  const q = await graphql(
    `query opsFactoryKod($code: String!) {
      codeDiscountNodeByCode(code: $code) { id }
    }`,
    { code: k.kod }
  );
  const input = {
    title: k.titel,
    code: k.kod,
    startsAt: '2026-01-01T00:00:00Z',
    customerSelection: { all: true },
    customerGets: { value: { discountAmount: { amount: k.belopp.toFixed(2), appliesOnEachItem: false } }, items: { all: true } },
    minimumRequirement: { quantity: { greaterThanOrEqualToQuantity: String(k.minstAntal) } },
    appliesOncePerCustomer: false,
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
  };
  const finns = q.codeDiscountNodeByCode?.id;
  if (finns) {
    const u = await graphql(
      `mutation opsFactoryKodUppd($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) { userErrors { field message code } }
      }`,
      { id: finns, basicCodeDiscount: input }
    );
    const fel = u.discountCodeBasicUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`${k.kod} (uppdatering): ${fel.map((f) => f.message).join('; ')}`);
    return { id: finns, ny: false };
  }
  const m = await graphql(
    `mutation opsFactoryKodSkapa($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode { id }
        userErrors { field message code }
      }
    }`,
    { basicCodeDiscount: input }
  );
  const fel = m.discountCodeBasicCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`${k.kod}: ${fel.map((f) => f.message).join('; ')}`);
  return { id: m.discountCodeBasicCreate.codeDiscountNode.id, ny: true, valuta };
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const produktfil = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr') || arg.includes('--dry');
  if (!produktfil) {
    console.error('Användning: node factory/paket.mjs factory/produkter/<id>.yaml [--torr]');
    process.exit(1);
  }
  const p = lasYaml(readFileSync(produktfil, 'utf8'));
  const plan = byggPaketplan(p);
  const enhet = p.ekonomi?.valuta ?? 'SEK';

  console.log(`\nPaketnivåer för ${p.produkt.namn}${plan.test ? ` · A/B-test "${plan.test}"` : ''}:`);
  for (const post of plan.poster) {
    console.log(
      `  ${post.handle.padEnd(22)} ${post.rubrik.padEnd(12)} ${String(post.kundpris).padStart(5)} ${enhet}` +
        (post.rabatt > 0 ? ` (ord. ${post.ordinarie}, −${post.rabatt} via ${post.kod}, spara ${post.sparProcent} %)` : ' (ordinarie)') +
        (post.gratisAntal > 0 ? ` + ${post.gratisAntal} gratis` : '') +
        (post.forvald ? '  ← FÖRVALD' : '')
    );
  }
  console.log('  Rabattkoder: ' + plan.koder.map((k) => `${k.kod} = ${k.belopp} ${enhet} (min ${k.minstAntal} varor)`).join(', '));
  if (plan.fel.length > 0) {
    console.error(`\n❌ ${plan.fel.length} fel i paketkonfigen:`);
    for (const f of plan.fel) console.error(`   • ${f}`);
    process.exit(1);
  }
  if (torr) { console.log('\n(torrkörning — inget skapades)'); return; }

  const shop = await kontrolleraAnslutning();
  console.log(`Connected: ${shop.myshopifyDomain} ✓`);

  const produkt = await hamtaProduktViaHandle(p.produkt.id);
  if (!produkt) throw new Error(`Produkten ${p.produkt.id} finns inte i butiken — kör ops.mjs först.`);
  const bonusHandle = p.offer?.bonus_produkt?.handle;
  const bonus = bonusHandle ? await hamtaProduktViaHandle(bonusHandle) : null;
  if (plan.poster.some((x) => x.gratisAntal > 0) && !bonus) {
    throw new Error(`Bonusprodukten ${bonusHandle} finns inte i butiken — kör factory/bonus.mjs först.`);
  }

  const def = await sakerstallDefinition(false);
  console.log(`✅ Metaobjektdefinition ${METAOBJEKT_TYP} ${def.skapad ? 'skapad' : 'finns'} (translatable PÅ)${def.saknade.length > 0 && !def.skapad ? `, fält tillagda: ${def.saknade.join(', ')}` : ''}`);

  for (const post of plan.poster) {
    const m = await skrivPost(post, produkt.id, bonus?.id ?? null);
    console.log(`✅ ${m.handle} (${m.id.split('/').pop()})`);
  }
  for (const k of plan.koder) {
    const r = await skrivKod(k, enhet);
    console.log(`✅ kod ${k.kod}: −${k.belopp} ${enhet}, min ${k.minstAntal} varor (${r.ny ? 'skapad' : 'uppdaterad'})`);
  }
  console.log('\nKlart. Kontrollera på produktsidan att paketpriset och kassapriset är samma tal.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
