#!/usr/bin/env node
// Klubbdragningen — tio medlemmar dras ur klubben varje tisdag och får en låda.
//
// Axels beslut 2026-09-27 (alternativ B "Dragningen", efter Evolves svar 9): slumpen
// väljer tio medlemmar i veckan, vinnaren får sushilådan utan att betala, mot att
// hen skickar en bild på sig själv med strumporna som får användas i mejl och
// annonser. Evolve: förturen är kärnan, dragningen är krydda och intäktsmaskin.
//
//   node klaviyo/klubb/dragning.mjs                          # torrt: kandidater + vinnare, skriver inget i Shopify
//   node klaviyo/klubb/dragning.mjs --skarpt                 # taggar vinnarna + skapar 0-kronorsordrar
//   node klaviyo/klubb/dragning.mjs --test <e-post> --skarpt # kedjetest: bara den kunden vinner
//   node klaviyo/klubb/dragning.mjs --kordag --skarpt        # rutinen: exit 2 om det inte är dragningsdag
//   --brand matstrumpor  --antal 10  --datum YYYY-MM-DD  --fro <hex>  --igen
//
// Så här går det till, i ordning:
//   1. Alla kunder med e-postsamtycke (SUBSCRIBED) läses ur Shopify. Egna domäner,
//      redan vunna (taggen klubb-vinnare) och adresser utanför landet sorteras bort.
//      Medlemmar UTAN adress är med — E1 ber dem svara med adressen.
//   2. Dragningen är deterministisk: HMAC-SHA256(frö, kund-id) sorteras stigande och de
//      första `antal` vinner. Fröet och en hash av kandidatlistan loggas, så samma frö
//      på samma lista ger samma vinnare (kontrollerbart i efterhand). Aldrig handplockat.
//   3. Skarpt, per vinnare: draft order (lådan, 100 % rabatt, frakt 0 kr, ordertaggen
//      klubb-dragning) → slutförs till en riktig 0-kronorsorder när adress finns (annars
//      står den kvar som utkast åt VA:n) → kunden taggas klubb-vinnare + klubb-vinnare-<datum>.
//      Taggen startar Spoks-flödet F08 Klubbdragningen (contact_tags_added).
//   4. Loggen klaviyo/konto/<brand>/dragningar.jsonl bär inga personuppgifter (kund-hash,
//      ordernamn). VA:ns lista med e-post och stad skrivs i klaviyo/output/ (gitignorerad).
//
// Spärrar: deltagandet är gratis och kräver inget köp (annars lotteri enligt spellagen);
// en skarp dragning per datum (--igen krävs för en till); totalen måste vara 0 kr innan
// en order slutförs; --test kör hela kedjan på EN egen adress innan riktiga kunder.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash, createHmac, randomBytes } from 'node:crypto';

const HAR = dirname(fileURLToPath(import.meta.url));
export const ROT = join(HAR, '..', '..');

// ---------------------------------------------------------------------------
// Konfig och små hjälpare (rena funktioner — testas utan nät)
// ---------------------------------------------------------------------------

export function lasKonfig(brandId = 'matstrumpor', rot = ROT) {
  const fil = join(rot, 'klaviyo', 'brands', `${brandId}.json`);
  if (!existsSync(fil)) throw new Error(`Okänt brand "${brandId}" (${fil} saknas).`);
  const brand = JSON.parse(readFileSync(fil, 'utf8'));
  const d = brand.klubb?.dragning;
  if (!d) throw new Error(`${brandId}: brandfilen saknar klubb.dragning (antal, vinst, taggar).`);
  for (const f of ['antal', 'vinst', 'tagg_vinnare', 'ordertagg']) {
    if (d[f] === undefined || d[f] === null) throw new Error(`${brandId}: klubb.dragning saknar "${f}".`);
  }
  if (!d.vinst.variant_gid) throw new Error(`${brandId}: klubb.dragning.vinst.variant_gid saknas.`);
  const konf = {
    land: 'SE',
    egna_domaner: [],
    veckodag: 2,
    logg: `klaviyo/konto/${brandId}/dragningar.jsonl`,
    ...d,
    egna_domaner: (d.egna_domaner ?? []).map((x) => String(x).toLowerCase()),
  };
  return { brand, konf };
}

export const idag = (tz = 'Europe/Stockholm', nu = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(nu);

export function veckodag(tz = 'Europe/Stockholm', nu = new Date()) {
  const w = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(nu);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(w);
}

export const maskera = (e) => {
  const [a, b] = String(e ?? '').split('@');
  return b ? `${a.slice(0, 2)}***@${b}` : '***';
};
const doman = (e) => String(e ?? '').split('@')[1]?.toLowerCase() ?? '';
export const kundhash = (id, brandId) => createHash('sha256').update(`${brandId}:${id}`).digest('hex').slice(0, 12);

/**
 * Råa Shopify-kunder → kandidater. Sorterar bort och räknar varför.
 * `test` = e-post: då är BARA den kunden kandidat (egen domän tillåten), för
 * kedjetestet innan riktiga kunder dras.
 */
export function sorteraKandidater(rader, konf, { test = null } = {}) {
  const bort = { ej_samtycke: 0, utan_epost: 0, egen_doman: 0, redan_vunnit: 0, annat_land: 0 };
  const ut = [];
  const testEpost = test ? String(test).toLowerCase() : null;
  for (const r of rader) {
    const epost = String(r.email ?? '').toLowerCase();
    const arTest = Boolean(testEpost && epost === testEpost);
    if (!epost) { bort.utan_epost++; continue; }
    if (r.emailMarketingConsent?.marketingState !== 'SUBSCRIBED' && !arTest) { bort.ej_samtycke++; continue; }
    if (!arTest && konf.egna_domaner.includes(doman(epost))) { bort.egen_doman++; continue; }
    if ((r.tags ?? []).includes(konf.tagg_vinnare)) { bort.redan_vunnit++; continue; }
    const a = r.defaultAddress ?? null;
    const adress = a?.address1 ? a : null;
    if (adress && konf.land && adress.countryCodeV2 && adress.countryCodeV2 !== konf.land) { bort.annat_land++; continue; }
    ut.push({
      id: r.id,
      epost,
      fornamn: r.firstName ?? '',
      taggar: r.tags ?? [],
      adress,
      stad: adress?.city ?? null,
      ordrar: Number(r.numberOfOrders ?? 0),
      test: arTest,
    });
  }
  if (testEpost) {
    const t = ut.filter((x) => x.test);
    if (!t.length) {
      const fanns = rader.find((r) => String(r.email ?? '').toLowerCase() === testEpost);
      const varfor = !fanns
        ? 'kunden finns inte bland prenumeranterna (bara SUBSCRIBED-kunder läses)'
        : (fanns.tags ?? []).includes(konf.tagg_vinnare) ? `kunden bär redan taggen ${konf.tagg_vinnare} (ta bort den i Shopify för ett nytt test)` : 'kunden sorterades bort';
      throw new Error(`--test ${test}: ${varfor}.`);
    }
    return { kandidater: t, bort };
  }
  return { kandidater: ut, bort };
}

export function kandidatHash(kandidater) {
  return createHash('sha256').update(kandidater.map((k) => k.id).sort().join('\n')).digest('hex').slice(0, 16);
}

/** Deterministisk dragning: HMAC(frö, kund-id) stigande, de första `antal`. */
export function dra(kandidater, { antal, fro }) {
  if (!fro) throw new Error('Dragningen behöver ett frö.');
  const n = Number(antal);
  if (!Number.isInteger(n) || n < 1) throw new Error(`Ogiltigt antal: ${antal}`);
  return kandidater
    .map((k) => ({ k, h: createHmac('sha256', String(fro)).update(String(k.id)).digest('hex') }))
    .sort((a, b) => (a.h < b.h ? -1 : a.h > b.h ? 1 : 0))
    .slice(0, n)
    .map((x) => x.k);
}

/** Draft order-indatan för en vinnare: lådan, 100 % rabatt, frakt 0, ordertaggen. */
export function draftOrderInput(vinnare, konf, { datum, valuta, klubbnamn }) {
  return {
    purchasingEntity: { customerId: vinnare.id },
    useCustomerDefaultAddress: Boolean(vinnare.adress),
    lineItems: [{ variantId: konf.vinst.variant_gid, quantity: 1 }],
    appliedDiscount: { value: 100, valueType: 'PERCENTAGE', title: `Klubbdragningen ${datum}`, description: `Vinst i ${klubbnamn}` },
    shippingLine: { title: 'Klubbdragningen, fri frakt', priceWithCurrency: { amount: 0, currencyCode: valuta } },
    tags: [konf.ordertagg, `${konf.ordertagg}-${datum}`],
    note: `Klubbdragningen ${datum}: lådan till veckans vinnare, 0 kr. Villkoret (bild i retur) sköts av mejlen i F08 och VA:n.${vinnare.adress ? '' : ' ADRESS SAKNAS: kunden svarar på E1 med adressen, VA:n fyller i och slutför utkastet.'}`,
    acceptAutomaticDiscounts: false,
    allowDiscountCodesInCheckout: false,
  };
}

// ---------------------------------------------------------------------------
// Shopify
// ---------------------------------------------------------------------------

const FRAGA_KUNDER = `query($after: String, $q: String!) { customers(first: 250, after: $after, query: $q) {
  pageInfo { hasNextPage endCursor }
  nodes { id email firstName tags numberOfOrders emailMarketingConsent { marketingState } defaultAddress { address1 city zip countryCodeV2 } } } }`;

export async function hamtaMedlemmar(klient, { logg = () => {} } = {}) {
  const rader = [];
  let after = null;
  let sidor = 0;
  do {
    const d = await klient.graphql(FRAGA_KUNDER, { after, q: 'email_marketing_state:subscribed' });
    rader.push(...d.customers.nodes);
    sidor++;
    after = d.customers.pageInfo.hasNextPage ? d.customers.pageInfo.endCursor : null;
    if (sidor > 200) throw new Error('Fler än 200 sidor kunder — något är fel med frågan.');
  } while (after);
  logg(`Shopify: ${rader.length} prenumeranter på ${sidor} sidor.`);
  return rader;
}

export async function kollaVinst(klient, konf) {
  const d = await klient.graphql(
    'query($id: ID!) { productVariant(id: $id) { id title price availableForSale product { title handle status } } shop { currencyCode } }',
    { id: konf.vinst.variant_gid }
  );
  const v = d.productVariant;
  if (!v) throw new Error(`Vinstvarianten ${konf.vinst.variant_gid} finns inte i butiken.`);
  if (konf.vinst.handle && v.product?.handle !== konf.vinst.handle) throw new Error(`Vinstvarianten hör till "${v.product?.handle}", brandfilen säger "${konf.vinst.handle}".`);
  if (v.product?.status && v.product.status !== 'ACTIVE') throw new Error(`Vinstprodukten är ${v.product.status}, inte ACTIVE.`);
  return { id: v.id, titel: `${v.product?.title ?? ''} ${v.title ?? ''}`.trim(), pris: Number(v.price), kopbar: v.availableForSale !== false, valuta: d.shop?.currencyCode ?? 'SEK' };
}

async function skapaOrder(klient, vinnare, konf, ctx) {
  const input = draftOrderInput(vinnare, konf, ctx);
  const d1 = await klient.graphql(
    'mutation($input: DraftOrderInput!) { draftOrderCreate(input: $input) { draftOrder { id name status totalPriceSet { shopMoney { amount } } shippingAddress { city } } userErrors { field message } } }',
    { input }
  );
  const utkast = d1.draftOrderCreate?.draftOrder;
  if (!utkast?.id) throw new Error('draftOrderCreate gav inget utkast.');
  const total = Number(utkast.totalPriceSet?.shopMoney?.amount ?? NaN);
  if (total !== 0) {
    return { utkast: utkast.name, order: null, fel: `utkastet ${utkast.name} har totalen ${total}, inte 0 — inte slutfört, kontrollera rabatten i Shopify` };
  }
  if (!vinnare.adress) return { utkast: utkast.name, order: null, fel: null, utan_adress: true };
  const d2 = await klient.graphql(
    'mutation($id: ID!) { draftOrderComplete(id: $id) { draftOrder { id order { id name } } userErrors { field message } } }',
    { id: utkast.id }
  );
  const order = d2.draftOrderComplete?.draftOrder?.order;
  if (!order?.name) throw new Error(`draftOrderComplete på ${utkast.name} gav ingen order.`);
  return { utkast: utkast.name, order: order.name, fel: null };
}

async function taggaKund(klient, vinnare, konf, datum) {
  await klient.graphql(
    'mutation($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { node { id } userErrors { field message } } }',
    { id: vinnare.id, tags: [konf.tagg_vinnare, `${konf.tagg_vinnare}-${datum}`] }
  );
}

// ---------------------------------------------------------------------------
// Loggen (inga personuppgifter) och VA-listan (gitignorerad)
// ---------------------------------------------------------------------------

export function lasLogg(fil) {
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => JSON.parse(r));
}

export const redanKord = (rader, brandId, datum) =>
  rader.some((r) => r.typ === 'dragning' && r.brand === brandId && r.datum === datum && !r.torr && !r.test);

function skrivVaLista({ rot, brandId, datum, vinnare, resultat }) {
  const mapp = join(rot, 'klaviyo', 'output', brandId, 'dragningar');
  mkdirSync(mapp, { recursive: true });
  const fil = join(mapp, `${datum}.csv`);
  const rader = ['epost;fornamn;stad;adress;order;utkast;fel'];
  vinnare.forEach((v, i) => {
    const r = resultat[i] ?? {};
    rader.push([v.epost, v.fornamn, v.stad ?? '', v.adress ? 'ja' : 'NEJ', r.order ?? '', r.utkast ?? '', r.fel ?? ''].map((x) => String(x).replace(/;/g, ',')).join(';'));
  });
  writeFileSync(fil, rader.join('\n') + '\n');
  return fil;
}

// ---------------------------------------------------------------------------
// Hela körningen
// ---------------------------------------------------------------------------

export async function korDragning({
  klient, brand, konf, brandId, rot = ROT, datum, fro, antal, skarpt = false, test = null, igen = false, logg = () => {},
}) {
  const loggfil = join(rot, konf.logg);
  if (skarpt && !test && redanKord(lasLogg(loggfil), brandId, datum) && !igen) {
    throw new Error(`En skarp dragning för ${brandId} ${datum} finns redan i ${konf.logg}. Kör med --igen om det verkligen ska dras en gång till.`);
  }
  const vinst = await kollaVinst(klient, konf);
  if (!vinst.kopbar) logg(`⚠️  Vinstvarianten ${vinst.titel} är inte köpbar just nu (slut?). Dragningen fortsätter — ordern hamnar ändå i kön.`);
  logg(`Vinsten: ${vinst.titel}, ${vinst.pris} ${vinst.valuta} på sajten.`);

  const rader = await hamtaMedlemmar(klient, { logg });
  const { kandidater, bort } = sorteraKandidater(rader, konf, { test });
  const utanAdress = kandidater.filter((k) => !k.adress).length;
  logg(`Kandidater: ${kandidater.length} (utan adress ${utanAdress}); bortsorterade: ${Object.entries(bort).map(([k, v]) => `${k} ${v}`).join(', ')}.`);
  if (!kandidater.length) throw new Error('Inga kandidater — ingen dragning.');

  const n = Math.min(Number(antal), kandidater.length);
  const vinnare = dra(kandidater, { antal: n, fro });
  const hash = kandidatHash(kandidater);
  logg(`Dragning ${datum}: frö ${fro}, kandidathash ${hash}, ${vinnare.length} vinnare${test ? ' (TEST: bara ' + maskera(test) + ')' : ''}.`);
  for (const v of vinnare) logg(`  • ${maskera(v.epost)}  ${v.stad ?? '(ingen adress)'}  ${v.ordrar} ordrar innan`);

  const resultat = [];
  const fel = [];
  if (skarpt) {
    for (const v of vinnare) {
      try {
        const r = await skapaOrder(klient, v, konf, { datum, valuta: vinst.valuta, klubbnamn: brand.klubb?.namn ?? 'klubben' });
        if (r.fel) { fel.push(`${maskera(v.epost)}: ${r.fel}`); resultat.push(r); continue; }
        await taggaKund(klient, v, konf, datum);
        resultat.push(r);
        logg(`  ✅ ${maskera(v.epost)}: ${r.order ? `order ${r.order}` : `utkast ${r.utkast} (adress saknas — VA:n slutför)`}, taggad ${konf.tagg_vinnare}.`);
      } catch (e) {
        fel.push(`${maskera(v.epost)}: ${e.message}`);
        resultat.push({ utkast: null, order: null, fel: e.message });
        logg(`  ❌ ${maskera(v.epost)}: ${e.message}`);
      }
    }
  } else {
    logg('TORRT: inget skrivs i Shopify. --skarpt skapar ordrarna och taggar vinnarna.');
  }

  const rad = {
    typ: 'dragning',
    brand: brandId,
    datum,
    kordes: new Date().toISOString(),
    torr: !skarpt,
    test: Boolean(test),
    fro,
    antal: vinnare.length,
    kandidater: kandidater.length,
    kandidater_utan_adress: utanAdress,
    bort,
    kandidat_hash: hash,
    vinst: { variant_gid: konf.vinst.variant_gid, titel: vinst.titel, pris: vinst.pris },
    vinnare: vinnare.map((v, i) => ({
      kund: kundhash(v.id, brandId),
      adress: Boolean(v.adress),
      ordrar_innan: v.ordrar,
      order: resultat[i]?.order ?? null,
      utkast: resultat[i]?.utkast ?? null,
      fel: resultat[i]?.fel ?? null,
    })),
    fel,
  };
  mkdirSync(dirname(loggfil), { recursive: true });
  appendFileSync(loggfil, JSON.stringify(rad) + '\n');

  let vaFil = null;
  if (skarpt) vaFil = skrivVaLista({ rot, brandId, datum, vinnare, resultat });
  return { rad, vinnare, resultat, fel, vaFil, loggfil };
}

// ---------------------------------------------------------------------------
// Kommandoraden
// ---------------------------------------------------------------------------

function arg(namn) {
  const i = process.argv.indexOf(namn);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : null;
}
const flagga = (namn) => process.argv.includes(namn);

async function main() {
  const brandId = arg('--brand') ?? 'matstrumpor';
  const { brand, konf } = lasKonfig(brandId);
  const tz = brand.tidszon ?? 'Europe/Stockholm';
  const skarpt = flagga('--skarpt');
  const test = arg('--test');
  if (flagga('--kordag') && veckodag(tz) !== konf.veckodag) {
    console.log(`Ingen dragningsdag i dag (veckodag ${veckodag(tz)}, dragningen går dag ${konf.veckodag}). Inget gjort.`);
    process.exit(2);
  }
  const datum = arg('--datum') ?? idag(tz);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) throw new Error(`--datum ska vara YYYY-MM-DD, fick ${datum}.`);
  const antal = test ? 1 : Number(arg('--antal') ?? konf.antal);
  const fro = arg('--fro') ?? randomBytes(16).toString('hex');

  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const butik = lasButik(brand.shopify?.butik ?? brandId);
  const klient = await skapaKlient(butik);
  const info = await klient.kolla();
  const kravs = ['read_customers', 'write_customers', 'write_draft_orders', 'read_products'];
  const saknar = kravs.filter((s) => !info.scopes.includes(s));
  if (saknar.length) throw new Error(`${butik.namn}: appen "${info.app}" saknar ${saknar.join(', ')}.`);
  console.log(`${butik.namn} (${info.doman}) via appen "${info.app}". Läge: ${skarpt ? 'SKARPT' : 'torrt'}${test ? `, TEST ${maskera(test)}` : ''}.`);

  const r = await korDragning({ klient, brand, konf, brandId, datum, fro, antal, skarpt, test, igen: flagga('--igen'), logg: (t) => console.log(t) });
  console.log(`\nLoggat i ${konf.logg}.`);
  if (r.vaFil) {
    console.log(`VA-listan (e-post, stad, order): ${r.vaFil} (gitignorerad).`);
    console.log(`\nFor the VA (English): winners are tagged "${konf.tagg_vinnare}-${datum}" in Shopify → Customers; their orders are tagged "${konf.ordertagg}-${datum}". ` +
      `Orders without a shipping address are left as DRAFT orders — the winner replies to the club email with the address; add it to the draft and click "Mark as paid"/complete. ` +
      `When a winner's photo arrives, add the customer tag "${konf.tagg_bild_klar ?? 'klubb-bild-klar'}" so the reminders stop.`);
  }
  if (r.fel.length) {
    console.error(`\n❌ ${r.fel.length} fel:\n${r.fel.map((f) => `  ${f}`).join('\n')}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
