// Paketnivåerna: ms_paketniva-metaobjekten + de RIKTIGA rabattkoder som gör
// att kassan ger exakt det pris kortet visar.
//
//   node factory/paket.mjs <butik.yaml> <produkt.yaml> [fler …] [--torr] [--tvinga] [--stada]
//
// Förenad 2026-09-09 ur tre grenar (KEDJAN.md): TackleBays A/B-standard +
// valutaspärr, TankGuards nivåer ur produktfilen + gratis bonus i rabatt-
// matten, DryTreks uppdatering av befintliga koder.
//
// Varför koder och inte bara en widget: temats snippets/ms-paket.liquid har
// en ärlighetsspärr — ett rabatterat pris visas BARA när nivån har både
// fastpris och rabattkod. En widget som ritar kort utan kod visar ett pris
// kassan inte ger, och det upptäcker kunden i sista steget.
//
// Nivåerna kommer ur produktfilen (offer.paket.nivaer) när de står där,
// annars ur standardstegen NIVAER (A = bevisade Kaching-nivåer, B = ett steg
// djupare rabatt). Förvald nivå är ALLTID mitten, ⌈n/2⌉ (Axels beslut
// 2026-09-07) — aldrig den första. Är förval satt i filen ska det vara exakt
// en per variant och inte den första; är det inte satt räknas mitten fram.
//
// Rabatten är ett BELOPP, inte en procent — så fungerar en Shopify-rabattkod,
// och så räknar snippeten:
//   belopp    = antal × pris + gratis × bonuspris − paketpris
//   min antal = antal + gratis   (tar kunden bort gratisvaran försvinner
//                                 rabatten — priset stämmer alltid)
// All matte i ÖRE (heltal): 778 − 661.3 i flyttal blir 116.70000000000005.
//
// Idempotent: definitionen kompletteras, metaobjekten upsertas på handle,
// rabattkoderna uppdateras om de finns (TackleBay 2026-09-09: åtta koder
// skrivna i PHP måste kunna skrivas om efter valutabytet). Noll beroenden.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { basename, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { graphql, hamtaProduktViaHandle, kontrolleraAnslutning } from './shopify.mjs';
import { produktHandle } from './build-store.mjs';

export const METAOBJEKT_TYP = 'ms_paketniva';
// Äldre namn på samma konstant (TackleBay-grenen) — behålls så inget bryts.
export const TYP = METAOBJEKT_TYP;

// Fälten temats ms-paket.liquid läser. Ordningen är den som visas i adminen.
// `required` är satt på de tre snippeten inte klarar sig utan.
export const FALT = [
  { key: 'rubrik', name: 'Rubrik', type: 'single_line_text_field', required: true },
  { key: 'underrubrik', name: 'Underrubrik', type: 'single_line_text_field' },
  { key: 'bricka', name: 'Bricka (t.ex. Spara 15 %)', type: 'single_line_text_field' },
  { key: 'produkt', name: 'Produkt', type: 'product_reference', required: true },
  { key: 'antal', name: 'Antal', type: 'number_integer', required: true },
  { key: 'fastpris', name: 'Paketpris', type: 'number_decimal' },
  { key: 'rabattkod', name: 'Rabattkod', type: 'single_line_text_field' },
  { key: 'forvald', name: 'Förvald', type: 'boolean' },
  { key: 'ab_variant', name: 'A/B-variant (a, b eller tom)', type: 'single_line_text_field' },
  { key: 'gratis_produkt', name: 'Gratis produkt', type: 'product_reference' },
  { key: 'gratis_antal', name: 'Gratis antal', type: 'number_integer' },
  { key: 'gratis_text', name: 'Gratis-text', type: 'single_line_text_field' },
  { key: 'bogo_gratis', name: 'BOGO (antal gratis av samma vara)', type: 'number_integer' },
];

// Standardstegen när produktfilen inte har egna nivåer (offer.paket.nivaer).
// A är källans Kaching-uppsättning, B testoffret. `rabatt` är procent MOT
// ordinarie styckpris × antal; en gratis bonus läggs alltid ovanpå det.
// B testar EN sak: ett steg djupare rabatt per nivå. Inte mer — ett testoffer
// får inte kunna hamna under break-even på ett inköpspris ingen bekräftat.
export const NIVAER = {
  a: [
    { antal: 1, rabatt: 0, rubrik: '1 st', underrubrik: 'Standard pris', bricka: '' },
    { antal: 2, rabatt: 0.15, rubrik: '2 st', underrubrik: '', bricka: 'Mest populär' },
    { antal: 3, rabatt: 0.2, rubrik: '3 st', underrubrik: '', bricka: 'Bäst pris' },
  ],
  b: [
    { antal: 1, rabatt: 0, rubrik: '1 st', underrubrik: 'Standard pris', bricka: '' },
    { antal: 2, rabatt: 0.2, rubrik: '2 st', underrubrik: '', bricka: 'Mest populär' },
    { antal: 3, rabatt: 0.25, rubrik: '3 st', underrubrik: '', bricka: 'Bäst pris' },
  ],
};

// Mitten, alltid: ⌈n/2⌉ räknat från 1, som index från 0. Aldrig första nivån.
export const forvaldIndex = (antalNivaer) => Math.ceil(antalNivaer / 2) - 1;

const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

// Öre in, öre ut. Kronor lämnar modulen bara som tal med max två decimaler.
const ore = (kr) => Math.round(Number(kr) * 100);
const kr = (o) => o / 100;
const krText = (o) => (o / 100).toFixed(2);

// Kodprefixet: produktens annonsprefix (creative_prefix) eller dess id, bara
// A–Z/0–9, max 12 tecken. Samma regel som TackleBays koder skrevs med.
export function paketPrefix(produkt) {
  const bas = text(produkt?.meta?.creative_prefix) ?? String(produkt?.produkt?.id ?? '');
  return bas.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 12);
}

// Nivåerna grupperade per A/B-variant, ur produktfilen eller standardstegen.
export function lasNivaer(produkt) {
  const paket = produkt?.offer?.paket ?? {};
  const egna = lista(paket.nivaer);
  const perVariant = new Map();
  if (egna.length > 0) {
    for (const n of egna) {
      const v = (text(n.variant) ?? '').toLowerCase();
      if (!perVariant.has(v)) perVariant.set(v, []);
      perVariant.get(v).push(n);
    }
    return { test: text(paket.test) ?? '', perVariant, kalla: 'produktfil' };
  }
  for (const [v, nivaer] of Object.entries(NIVAER)) perVariant.set(v, nivaer.map((n) => ({ ...n, variant: v })));
  // Standardstegen är två varianter — då finns ett A/B-test, "paket" om inget
  // annat står i filen (samma id som temats ms-ab mäter på).
  return { test: text(paket.test) ?? 'paket', perVariant, kalla: 'standard' };
}

// Ren logik: nivåerna → poster (metaobjekt) + koder (rabattkoder), med all
// matematik. Kastar med ALLA fel i ett meddelande om konfigen inte håller:
// första nivån förvald, fastpris över ordinarie, gratis utan bonuspris,
// samma kod på två nivåer.
export function byggPaketplan(produkt, butik = null) {
  const id = produkt?.produkt?.id;
  if (!text(id)) throw new Error('Produktfilen saknar produkt.id.');
  const prisOre = ore(produkt.ekonomi?.pris);
  if (!(prisOre > 0)) throw new Error(`${id}: ekonomi.pris saknas eller är 0.`);
  const valuta = text(produkt.ekonomi?.valuta) ?? text(butik?.butik?.valuta) ?? 'SEK';
  const bonus = produkt.offer?.bonus_produkt ?? {};
  const bonusOre = Number(bonus.pris) > 0 ? ore(bonus.pris) : 0;
  const prefix = paketPrefix(produkt);
  const brand = text(produkt.brand?.namn) ?? text(butik?.butik?.brand) ?? '';
  const { test, perVariant, kalla } = lasNivaer(produkt);

  const poster = [];
  const koder = [];
  const fel = [];
  const seddaKoder = new Set();

  for (const [variant, nivaer] of perVariant) {
    const etikett = `variant ${variant || '(alla)'}`;
    const markerade = nivaer.filter((n) => n.forvald === true);
    let forvaldPos = forvaldIndex(nivaer.length);
    if (markerade.length > 1) {
      fel.push(`${etikett}: ${markerade.length} nivåer är förvalda — exakt en ska vara det`);
    } else if (markerade.length === 1) {
      forvaldPos = nivaer.indexOf(markerade[0]);
      if (forvaldPos === 0 && nivaer.length > 1) {
        fel.push(`${etikett}: första nivån är förvald — regeln är mitten (nivå ${forvaldIndex(nivaer.length) + 1})`);
      }
    }

    nivaer.forEach((n, i) => {
      const antal = Math.max(1, Math.round(Number(n.antal) || 1));
      const gratisAntal = Math.max(0, Math.round(Number(n.gratis_antal) || 0));
      const radnamn = `${etikett}, ${antal} st`;
      if (gratisAntal > 0 && bonusOre === 0) fel.push(`${radnamn}: gratis_antal utan offer.bonus_produkt.pris`);

      const produktOre = antal * prisOre;
      const ordinarieOre = produktOre + gratisAntal * bonusOre;

      // Paketpriset: uttryckligt (pris) eller som procent på produkten (rabatt).
      let fastOre = null;
      if (Number(n.pris) > 0) fastOre = ore(n.pris);
      else if (Number(n.rabatt) > 0) fastOre = Math.round(produktOre * (1 - Number(n.rabatt)));
      if (fastOre !== null && fastOre > produktOre) {
        fel.push(`${radnamn}: paketpriset ${krText(fastOre)} är HÖGRE än ordinarie ${krText(produktOre)}`);
      }
      const rabattOre = fastOre === null ? 0 : ordinarieOre - fastOre;
      const egenKod = text(n.kod);
      if (egenKod && rabattOre <= 0) fel.push(`${egenKod}: paketpriset är inte lägre än ordinarie ${krText(ordinarieOre)}`);
      const kod = rabattOre > 0 ? (egenKod ?? `${prefix}${antal}${variant.toUpperCase()}`) : '';
      if (kod) {
        if (seddaKoder.has(kod)) fel.push(`${kod} används på två nivåer`);
        seddaKoder.add(kod);
      }

      const handle = (text(n.handle) ?? `${id}-${variant || 'x'}-${antal}`).toLowerCase();
      const post = {
        handle,
        variant,
        antal,
        rubrik: text(n.rubrik) ?? `${antal} st`,
        underrubrik: text(n.underrubrik) ?? '',
        bricka: text(n.bricka) ?? '',
        fastpris: rabattOre > 0 ? kr(fastOre) : null,
        kod,
        forvald: i === forvaldPos,
        gratisAntal,
        gratisText: gratisAntal > 0 ? (text(n.gratis_text) ?? '') : '',
        ordinarie: kr(ordinarieOre),
        rabatt: kr(Math.max(0, rabattOre)),
        kundpris: kr(rabattOre > 0 ? fastOre : ordinarieOre),
        // Verklig rabatt på själva produkten (bonusens värde räknas inte in —
        // det är det talet brickan "Spara X %" ska stämma mot).
        sparProcent: rabattOre > 0 ? Math.round(((produktOre - fastOre) / produktOre) * 100) : 0,
        valuta,
      };
      poster.push(post);
      if (kod && rabattOre > 0) {
        koder.push({
          kod,
          belopp: kr(rabattOre),
          minstAntal: antal + gratisAntal,
          antal,
          gratisAntal,
          handle,
          titel: `${brand} ${post.rubrik} — ${variant ? variant.toUpperCase() : 'paket'} (${kod})`.trim(),
        });
      }
    });
  }

  if (fel.length > 0) throw new Error(`Paketkonfigen för ${id}: ${fel.join('; ')}`);
  const perVariantUt = Object.fromEntries([...perVariant.keys()].map((v) => [v, poster.filter((p) => p.variant === v)]));
  return {
    test,
    kalla,
    valuta,
    poster,
    koder,
    perVariant: perVariantUt,
    A: perVariantUt.a ?? [],
    B: perVariantUt.b ?? [],
  };
}

// Läsbara rader för torrkörning och rapport.
export function paketRader(plan) {
  const rader = [];
  for (const post of plan.poster) {
    rader.push(
      `${(post.variant || '·').toUpperCase().padEnd(2)} ${post.rubrik.padEnd(12)} ${post.kundpris.toFixed(2).padStart(9)} ${plan.valuta}` +
        (post.rabatt > 0 ? ` (ord ${post.ordinarie.toFixed(2)}, −${post.rabatt.toFixed(2)} via ${post.kod}, spara ${post.sparProcent} %)` : ' (ordinarie)') +
        (post.gratisAntal > 0 ? ` + ${post.gratisAntal} gratis` : '') +
        (post.forvald ? '  ◀ FÖRVALD' : '')
    );
  }
  rader.push(
    plan.koder.length > 0
      ? `Rabattkoder: ${plan.koder.map((k) => `${k.kod} = −${k.belopp.toFixed(2)} ${plan.valuta} (min ${k.minstAntal} varor)`).join(', ')}`
      : 'Rabattkoder: inga (alla nivåer ordinarie)'
  );
  return rader;
}

// --- Shopify ---------------------------------------------------------------

// Definitionen ms_paketniva: skapas med translatable PÅ och storefront
// PUBLIC_READ från start (utan translatable finns ingen translatableContent
// — HeimGuard 2026-09-07; utan PUBLIC_READ ser Liquid inte posterna).
// Finns den: saknade fält läggs till, capabilities/access rättas.
export async function sakerstallDefinition() {
  const q = await graphql(
    `query opsFactoryPaketDef($type: String!) {
      metaobjectDefinitionByType(type: $type) {
        id type
        fieldDefinitions { key }
        capabilities { translatable { enabled } }
        access { storefront }
      }
    }`,
    { type: METAOBJEKT_TYP }
  );
  const def = q.metaobjectDefinitionByType;
  const faltInput = (f) => ({ key: f.key, name: f.name, type: f.type, required: f.required === true });

  if (def) {
    const saknade = FALT.filter((f) => !def.fieldDefinitions.some((d) => d.key === f.key));
    const translatable = def.capabilities?.translatable?.enabled === true;
    const publik = def.access?.storefront === 'PUBLIC_READ';
    if (saknade.length === 0 && translatable && publik) {
      return { id: def.id, skapad: false, tillagda: [], andrad: false };
    }
    const definition = {};
    if (saknade.length > 0) definition.fieldDefinitions = saknade.map((f) => ({ create: faltInput(f) }));
    if (!translatable) definition.capabilities = { translatable: { enabled: true } };
    if (!publik) definition.access = { storefront: 'PUBLIC_READ' };
    const u = await graphql(
      `mutation opsFactoryPaketDefUppdatera($id: ID!, $definition: MetaobjectDefinitionUpdateInput!) {
        metaobjectDefinitionUpdate(id: $id, definition: $definition) {
          metaobjectDefinition { id }
          userErrors { field message code }
        }
      }`,
      { id: def.id, definition }
    );
    const fel = u.metaobjectDefinitionUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`Definitionen ${METAOBJEKT_TYP}: ${fel.map((f) => f.message).join('; ')}`);
    return { id: def.id, skapad: false, tillagda: saknade.map((f) => f.key), andrad: true };
  }

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
        // — adminen visar handle.
        type: METAOBJEKT_TYP,
        name: 'Paketnivå',
        access: { storefront: 'PUBLIC_READ' },
        capabilities: { translatable: { enabled: true } },
        fieldDefinitions: FALT.map(faltInput),
      },
    }
  );
  const fel = m.metaobjectDefinitionCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Definitionen ${METAOBJEKT_TYP}: ${fel.map((f) => `${f.code ?? ''} ${f.message}`.trim()).join('; ')}`);
  return { id: m.metaobjectDefinitionCreate.metaobjectDefinition.id, skapad: true, tillagda: FALT.map((f) => f.key), andrad: true };
}

// Fältvärdena exakt som snippeten läser dem. Ren och testbar.
export function nivaFalt(post, produktGid, bonusGid = null) {
  const gratis = post.gratisAntal > 0 && bonusGid ? bonusGid : '';
  return [
    ['rubrik', post.rubrik],
    ['underrubrik', post.underrubrik ?? ''],
    ['bricka', post.bricka ?? ''],
    ['produkt', produktGid],
    ['antal', String(post.antal)],
    ['fastpris', post.fastpris === null || post.fastpris === undefined ? '' : Number(post.fastpris).toFixed(2)],
    ['rabattkod', post.kod ?? ''],
    ['forvald', post.forvald ? 'true' : 'false'],
    ['ab_variant', post.variant ?? ''],
    ['gratis_produkt', gratis],
    ['gratis_antal', String(post.gratisAntal ?? 0)],
    ['gratis_text', post.gratisAntal > 0 ? post.gratisText ?? '' : ''],
    ['bogo_gratis', '0'],
  ].map(([key, value]) => ({ key, value }));
}

// En post per nivå, upsert på handle — samma handle skrivs över, aldrig dubblerad.
export async function skrivNiva(post, produktGid, bonusGid = null) {
  const m = await graphql(
    `mutation opsFactoryPaketUpsert($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
      metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
        metaobject { id handle }
        userErrors { field message code }
      }
    }`,
    { handle: { type: METAOBJEKT_TYP, handle: post.handle }, metaobject: { fields: nivaFalt(post, produktGid, bonusGid) } }
  );
  const fel = m.metaobjectUpsert?.userErrors ?? [];
  if (fel.length > 0) {
    throw new Error(`Nivån ${post.handle}: ${fel.map((f) => `${f.field?.join?.('.') ?? ''} ${f.message}`.trim()).join('; ')}`);
  }
  return m.metaobjectUpsert.metaobject;
}

// Rabattkodens input: fast belopp, låst till produkten (och bonusen när en
// gratisrad finns — annars räknas gratisvaran inte mot minsta antal), med
// minsta antal varor = antal + gratis. Ren och testbar.
export function rabattkodInput(k, produktGid, { bonusGid = null } = {}) {
  const produkter = [produktGid];
  if (k.gratisAntal > 0 && bonusGid) produkter.push(bonusGid);
  return {
    title: k.titel,
    code: k.kod,
    // Fast datum bakåt i tiden: koden gäller direkt och tills vidare, och
    // en omkörning ändrar inte startdatumet.
    startsAt: '2020-01-01T00:00:00Z',
    customerSelection: { all: true },
    customerGets: {
      value: { discountAmount: { amount: Number(k.belopp).toFixed(2), appliesOnEachItem: false } },
      items: { products: { productsToAdd: produkter } },
    },
    minimumRequirement: { quantity: { greaterThanOrEqualToQuantity: String(k.minstAntal) } },
    appliesOncePerCustomer: false,
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
  };
}

// Rabattkoden som ger EXAKT nivåns pris. Finns koden uppdateras den (belopp,
// minsta antal, produkter) — aldrig en dubblett, aldrig ett tyst "fanns redan"
// med fel belopp i fel valuta.
export async function sakerstallRabattkod(k, produktGid, { valuta = null, bonusGid = null } = {}) {
  const q = await graphql(
    `query opsFactoryRabattkod($code: String!) {
      codeDiscountNodeByCode(code: $code) { id }
    }`,
    { code: k.kod }
  );
  const input = rabattkodInput(k, produktGid, { bonusGid });
  const finns = q.codeDiscountNodeByCode?.id ?? null;
  if (finns) {
    const u = await graphql(
      `mutation opsFactoryRabattUppdatera($id: ID!, $basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicUpdate(id: $id, basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode { id }
          userErrors { field message code }
        }
      }`,
      { id: finns, basicCodeDiscount: input }
    );
    const fel = u.discountCodeBasicUpdate?.userErrors ?? [];
    if (fel.length > 0) throw new Error(`Rabattkoden ${k.kod} (uppdatering): ${fel.map((f) => f.message).join('; ')}`);
    return { kod: k.kod, id: finns, skapad: false, belopp: k.belopp, valuta };
  }
  const m = await graphql(
    `mutation opsFactoryRabattSkapa($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode { id }
        userErrors { field message code }
      }
    }`,
    { basicCodeDiscount: input }
  );
  const fel = m.discountCodeBasicCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Rabattkoden ${k.kod}: ${fel.map((f) => `${f.code ?? ''} ${f.message}`.trim()).join('; ')}`);
  return { kod: k.kod, id: m.discountCodeBasicCreate.codeDiscountNode.id, skapad: true, belopp: k.belopp, valuta };
}

// Nivåer i butiken som pekar på produkten men inte finns i planen — t.ex.
// poster med ett äldre handle-mönster. Snippeten visar ALLA nivåer som
// pekar på produkten, så en kvarglömd post blir ett extra kort på sidan.
export async function hittaFrammandeNivaer(produktGid, kandaHandles) {
  const kanda = new Set(kandaHandles);
  const frammande = [];
  let cursor = null;
  do {
    const q = await graphql(
      `query opsFactoryPaketLista($type: String!, $cursor: String) {
        metaobjects(type: $type, first: 100, after: $cursor) {
          nodes { id handle produkt: field(key: "produkt") { value } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { type: METAOBJEKT_TYP, cursor }
    );
    const sida = q.metaobjects ?? { nodes: [], pageInfo: {} };
    for (const n of sida.nodes) {
      if (n.produkt?.value === produktGid && !kanda.has(n.handle)) frammande.push({ id: n.id, handle: n.handle });
    }
    cursor = sida.pageInfo?.hasNextPage ? sida.pageInfo.endCursor : null;
  } while (cursor);
  return frammande;
}

async function taBortNiva(id) {
  const m = await graphql(
    `mutation opsFactoryPaketTaBort($id: ID!) {
      metaobjectDelete(id: $id) { deletedId userErrors { field message } }
    }`,
    { id }
  );
  const fel = m.metaobjectDelete?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Kunde inte ta bort ${id}: ${fel.map((f) => f.message).join('; ')}`);
  return m.metaobjectDelete.deletedId;
}

// Hela steget för EN produkt. ctx = { butik, shop? } (ops.mjs:s kontext).
//   torr    — bara planen, inget nätverk
//   tvinga  — kör trots att butikens valuta inte är konfigens
//   stada   — ta bort främmande nivåer på produkten (annars rapporteras de)
export async function byggPaket(ctx, produkt, { torr = false, tvinga = false, stada = false } = {}) {
  const butik = ctx?.butik ?? null;
  const plan = byggPaketplan(produkt, butik);
  const rapport = paketRader(plan);
  if (torr) return { ...plan, nivaer: plan.poster, rapport, skrivet: false };

  // ⚠️ VALUTASPÄRREN (2026-09-09, efter att TackleBays åtta koder skrevs som
  // PHP-belopp): en rabattkod lagras i BUTIKENS valuta. Står butiken kvar i
  // registreringsvalutan blir "86.70" 86,70 fel valuta, och felet syns inte i
  // adminen — bara i kassan, på riktiga ordrar.
  const shop = ctx?.shop ?? (await kontrolleraAnslutning());
  if (ctx && !ctx.shop) ctx.shop = shop;
  if (shop?.currencyCode && shop.currencyCode !== plan.valuta && !tvinga) {
    throw new Error(
      `Butikens valuta är ${shop.currencyCode}, konfigen säger ${plan.valuta}. ` +
        'Rabattkoderna skulle skrivas i fel valuta. Byt valuta i Shopify-admin och kör om ' +
        '(eller --tvinga om du vet vad du gör).'
    );
  }

  const definition = await sakerstallDefinition();
  rapport.push(
    `Definition ${METAOBJEKT_TYP}: ${definition.skapad ? 'skapad' : 'fanns'}` +
      (definition.tillagda.length > 0 && !definition.skapad ? `, fält tillagda: ${definition.tillagda.join(', ')}` : '') +
      (definition.andrad && !definition.skapad && definition.tillagda.length === 0 ? ', capabilities/access rättade' : '')
  );

  // Butikens handle, inte filens id — se produktHandle(). Elva av adventlanes
  // produkter blev utan paketnivåer 2026-09-11 för att `produkt.handle` var
  // satt och id:t slogs upp i stället.
  const handle = produktHandle(produkt);
  const iButiken = await hamtaProduktViaHandle(handle);
  if (!iButiken) throw new Error(`Produkten ${handle} finns inte i butiken — kör produkt-steget först.`);
  const produktGid = iButiken.id;

  let bonusGid = null;
  if (plan.poster.some((p) => p.gratisAntal > 0)) {
    const bonusHandle = text(produkt.offer?.bonus_produkt?.handle);
    const bonus = bonusHandle ? await hamtaProduktViaHandle(bonusHandle) : null;
    if (!bonus) {
      throw new Error(`Bonusprodukten ${bonusHandle ?? '(handle saknas)'} finns inte i butiken — kör bonus-steget först.`);
    }
    bonusGid = bonus.id;
  }

  const nivaer = [];
  for (const post of plan.poster) {
    const m = await skrivNiva(post, produktGid, bonusGid);
    nivaer.push({ ...post, id: m.id });
    rapport.push(`nivå ${m.handle} skriven (${String(m.id).split('/').pop()})`);
  }
  const koder = [];
  for (const k of plan.koder) {
    const r = await sakerstallRabattkod(k, produktGid, { valuta: plan.valuta, bonusGid });
    koder.push(r);
    rapport.push(`kod ${k.kod}: −${k.belopp.toFixed(2)} ${plan.valuta}, min ${k.minstAntal} varor (${r.skapad ? 'skapad' : 'uppdaterad'})`);
  }

  let frammande = await hittaFrammandeNivaer(produktGid, plan.poster.map((p) => p.handle));
  if (frammande.length > 0 && stada) {
    for (const f of frammande) {
      await taBortNiva(f.id);
      rapport.push(`främmande nivå ${f.handle} borttagen`);
    }
    frammande = [];
  } else if (frammande.length > 0) {
    rapport.push(`⚠️ ${frammande.length} nivåer i butiken pekar på produkten men står inte i planen: ${frammande.map((f) => f.handle).join(', ')} — de syns som extra kort. Kör med --stada för att ta bort dem.`);
  }

  return { ...plan, nivaer, koder, frammande, definition, rapport, skrivet: true };
}

async function huvud() {
  laddaEnv();
  const argv = process.argv.slice(2);
  const torr = argv.includes('--torr') || argv.includes('--dry') || argv.includes('--dry-run');
  const tvinga = argv.includes('--tvinga');
  const stada = argv.includes('--stada');
  const filer = argv.filter((a) => !a.startsWith('--'));
  const butiksfil = filer.find((f) => basename(dirname(f)) === 'butiker');
  const produktfiler = filer.filter((f) => f !== butiksfil);
  if (!butiksfil || produktfiler.length === 0) {
    console.error('Användning: node factory/paket.mjs <butik.yaml> <produkt.yaml> [fler …] [--torr] [--tvinga] [--stada]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const ctx = { butik, shop: null };
  console.log(`\nPaketnivåer · ${butik.butik.brand}${torr ? ' · TORR' : ''}\n`);
  for (const fil of produktfiler) {
    const produkt = lasYaml(readFileSync(fil, 'utf8'));
    const r = await byggPaket(ctx, produkt, { torr, tvinga, stada });
    console.log(`${produkt.produkt.namn} — nivåer ur ${r.kalla}${r.test ? `, A/B-test "${r.test}"` : ''}`);
    for (const rad of r.rapport) console.log(`  ${rad}`);
    console.log('');
  }
  console.log(torr ? '✅ Torr — inget skrevs till Shopify.\n' : '✅ Paketnivåer och rabattkoder på plats. Kontrollera på produktsidan att paketpriset och kassapriset är samma tal.\n');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
