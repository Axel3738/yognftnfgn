// kallor/vinst.mjs — det som behövs för RIKTIG vinst per butik och dag. LÄS-BARA.
//
// Evolve-kursens formel (stonebite/evolve/SVAR.md, svar 1):
//   vinstbidrag = nettoomsättning − varukostnad − frakt − betalavgifter − reklam
//
// Hämtas här, per butik, bara aggregerat per dag (aldrig en rad per order —
// snapshoten committas varje timme):
//   • nettoomsättning: orderns nuvarande summa UTAN moms (återbetalningar är
//     redan avdragna i Shopifys "current"-belopp)
//   • varukostnad: Shopifys "Cost per item" (inventoryItem.unitCost) × sålt antal
//   • betalavgifter: Shopify Payments avgifter per transaktion
//
// Det som INTE går att läsa står med belopp, aldrig som noll:
//   • utanKostnad: försäljning på varianter som saknar Cost per item
//   • utanAvgift: försäljning betald via en gateway utan avgiftsdata (PayPal …)
// Varianterna som saknar kostnad följer med (titel + försäljning, topp 5), så
// sidan kan säga exakt vad som ska fyllas i i Shopify.
//
// Mätt 2026-09-26 (första bygget): Cost per item ifyllt på 224/241 aktiva
// varianter i Bäverbutiken, 239/246 NO, 225/240 DK, 214/250 FI, 9/12 CaraShell,
// 2/6 Matstrumpor. Avgifterna syns per transaktion i alla sex.

import { kandidatNycklar, mintaToken } from './shopify.mjs';
import { dagnyckel, sistaDagarna } from '../berakna.mjs';

const API = '2025-07';

async function gql(shop, token, query, variables = {}, fetchFn = fetch) {
  for (let forsok = 0; forsok < 5; forsok++) {
    const svar = await fetchFn(`https://${shop}/admin/api/${API}/graphql.json`, {
      method: 'POST',
      headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    if (svar.status === 429) { await new Promise((r) => setTimeout(r, 2000)); continue; }
    const j = await svar.json().catch(() => ({}));
    const strypt = (j.errors ?? []).some((e) => e?.extensions?.code === 'THROTTLED');
    if (strypt) { await new Promise((r) => setTimeout(r, 2000 * (forsok + 1))); continue; }
    if (j.errors?.length) {
      const fel = new Error(`Shopify GraphQL: ${j.errors.map((e) => e.message).join('; ').slice(0, 200)}`);
      fel.nekad = j.errors.some((e) => e?.extensions?.code === 'ACCESS_DENIED');
      throw fel;
    }
    return j.data;
  }
  throw new Error('Shopify strypte GraphQL-anropet fem gånger i rad.');
}

const VARIANTER = `query($efter: String) {
  productVariants(first: 250, after: $efter) {
    pageInfo { hasNextPage endCursor }
    nodes { id sku title product { title } inventoryItem { unitCost { amount } } }
  }
}`;

// 40 ordrar × (10 rader + 5 transaktioner) håller frågan under Shopifys kostnadstak.
//
// `medVariant`: kundtjänstens app (Bäverbutiken) saknar read_products och nekas
// fältet `variant` — då kopplas kostnaden via SKU, i sista hand via namnet.
// `medLand`: leveranslandet (shippingAddress.countryCodeV2) behövs för butiker med
// kostnad per marknad (Matstrumpor sedan 2026-09-27, matstrumpor/cogs.json). En
// app utan tillgång till kunddata nekas fältet — då räknas utan land.
export function frageFor({ medVariant = true, medLand = true } = {}) {
  return `query($efter: String, $q: String) {
  orders(first: 40, after: $efter, query: $q, sortKey: CREATED_AT) {
    pageInfo { hasNextPage endCursor }
    nodes {
      createdAt cancelledAt test
      ${medLand ? 'shippingAddress { countryCodeV2 }' : ''}
      currentTotalPriceSet { shopMoney { amount } }
      currentTotalTaxSet { shopMoney { amount } }
      lineItems(first: 10) { nodes { currentQuantity originalUnitPriceSet { shopMoney { amount } } ${medVariant ? 'variant { id } ' : ''}sku title variantTitle } }
      transactions(first: 5) { gateway kind status fees { amount { amount currencyCode } } }
    }
  }
}`;
}

/** Vilket fält Shopify nekade, ur felmeddelandet — så nästa försök tar bort just det. */
export function nekatFalt(meddelande) {
  const m = String(meddelande ?? '');
  if (/variant field|field 'variant'/i.test(m)) return 'variant';
  if (/shippingAddress|customer data|protected/i.test(m)) return 'land';
  return null;
}

const namnNyckel = (produkt, variant) => `${String(produkt ?? '').trim().toLowerCase()}|${variant && variant !== 'Default Title' ? String(variant).trim().toLowerCase() : ''}`;

/** Orderradens kostnadspost: variant-id, sedan SKU, sedan namn. */
export function kostnadFor(li, kostnader) {
  return (li.variant && kostnader.get(li.variant.id))
    || (li.sku && kostnader.get(`sku:${li.sku}`))
    || kostnader.get(`namn:${namnNyckel(li.title, li.variantTitle)}`)
    || null;
}

/** Varukostnaden per variant-id, ur vilken app som helst som får läsa produkter. */
async function lasKostnader(shop, token, fetchFn) {
  const karta = new Map();
  let efter = null;
  for (let sida = 0; sida < 40; sida++) {
    const d = await gql(shop, token, VARIANTER, { efter }, fetchFn);
    for (const v of d.productVariants.nodes) {
      // Ifylld nolla är en riktig kostnad (Axel 2026-09-27: ätpinnarna ingår i
      // sushipaketen och kostar 0). Bara ett TOMT fält räknas som saknat.
      const raa = v.inventoryItem?.unitCost?.amount;
      const k = raa === null || raa === undefined ? null : Number(raa);
      const post = { kostnad: Number.isFinite(k) && k >= 0 ? k : null, titel: `${v.product?.title ?? ''}${v.title && v.title !== 'Default Title' ? ` · ${v.title}` : ''}` };
      karta.set(v.id, post);
      if (v.sku) karta.set(`sku:${v.sku}`, post);
      karta.set(`namn:${namnNyckel(v.product?.title, v.title)}`, post);
    }
    if (!d.productVariants.pageInfo.hasNextPage) break;
    efter = d.productVariants.pageInfo.endCursor;
  }
  return karta;
}

/**
 * Ordrarna → en rad per dag. Ren funktion, testbar utan nät.
 * `kostnader` är variant-id → { kostnad, titel }.
 */
/**
 * Ordrarna → en rad per dag. Ren funktion, testbar utan nät.
 * `kostnader` är variant-id → { kostnad, titel }.
 * `kostnadPerLand(li, land, antal)` (valfri) ger butikens kostnad för RADEN till
 * leveranslandet: { kostnad, kalla } vinner över Cost per item, { saknas } räknas
 * som saknad med orsak, null ⇒ Cost per item som vanligt. Matstrumpor skickar
 * landad kostnad ur cogs.json för Big 5-länderna; Sverige läses fortfarande ur
 * Shopify (källan), Norden faller på Sveriges kostnad tills frakten dit är känd.
 */
export function summeraOrdrar(ordrar, kostnader, { dagar, nu = new Date(), valuta, kostnadPerLand = null }) {
  const perDag = new Map();
  for (const d of sistaDagarna(dagar, { nu })) {
    perDag.set(d, { datum: d, ordrar: 0, netto: 0, varukostnad: 0, avgifter: 0, avgifterAnnanValuta: {}, utanKostnad: 0, utanAvgift: 0 });
  }
  const saknas = new Map();
  const kostnadKallor = { shopify: 0, land: 0, saknasLand: 0 };
  const perLand = {};
  for (const o of ordrar) {
    if (o.cancelledAt || o.test) continue;
    const rad = perDag.get(dagnyckel(new Date(o.createdAt)));
    if (!rad) continue;
    const brutto = Number(o.currentTotalPriceSet?.shopMoney?.amount) || 0;
    const moms = Number(o.currentTotalTaxSet?.shopMoney?.amount) || 0;
    const netto = brutto - moms;
    rad.ordrar += 1;
    rad.netto += netto;
    const land = o.shippingAddress?.countryCodeV2 ?? null;
    if (land) perLand[land] = (perLand[land] ?? 0) + 1;

    for (const li of o.lineItems?.nodes ?? []) {
      const antal = Number(li.currentQuantity) || 0;
      if (!antal) continue;
      const egen = kostnadPerLand && land ? kostnadPerLand(li, land, antal) : null;
      if (egen && typeof egen.kostnad === 'number' && Number.isFinite(egen.kostnad)) {
        rad.varukostnad += egen.kostnad;
        kostnadKallor.land += 1;
        continue;
      }
      if (egen?.saknas) {
        const pris = (Number(li.originalUnitPriceSet?.shopMoney?.amount) || 0) * antal;
        rad.utanKostnad += pris;
        kostnadKallor.saknasLand += 1;
        const titel = `${li.title || 'okänd variant'} → ${land}: ${egen.saknas}`;
        saknas.set(titel, (saknas.get(titel) ?? 0) + pris);
        continue;
      }
      const k = kostnadFor(li, kostnader);
      if (k && k.kostnad !== null) {
        rad.varukostnad += k.kostnad * antal;
        kostnadKallor.shopify += 1;
      } else {
        const pris = (Number(li.originalUnitPriceSet?.shopMoney?.amount) || 0) * antal;
        rad.utanKostnad += pris;
        const titel = k?.titel || li.title || 'okänd variant';
        saknas.set(titel, (saknas.get(titel) ?? 0) + pris);
      }
    }

    const betalda = (o.transactions ?? []).filter((t) => t.status === 'SUCCESS' && (t.kind === 'SALE' || t.kind === 'CAPTURE'));
    const utanData = betalda.length === 0 || betalda.some((t) => !t.fees?.length && t.gateway !== 'shopify_payments' && t.gateway !== 'manual');
    for (const t of betalda) {
      for (const f of t.fees ?? []) {
        const belopp = Number(f.amount?.amount) || 0;
        const v = f.amount?.currencyCode ?? valuta;
        if (v === valuta) rad.avgifter += belopp;
        else rad.avgifterAnnanValuta[v] = (rad.avgifterAnnanValuta[v] ?? 0) + belopp;
      }
    }
    if (utanData && netto > 0) rad.utanAvgift += netto;
  }
  const rund = (x) => Math.round(x * 100) / 100;
  const dagarUt = [...perDag.values()].map((r) => ({
    ...r, netto: rund(r.netto), varukostnad: rund(r.varukostnad), avgifter: rund(r.avgifter),
    utanKostnad: rund(r.utanKostnad), utanAvgift: rund(r.utanAvgift),
    avgifterAnnanValuta: Object.fromEntries(Object.entries(r.avgifterAnnanValuta).map(([k, v]) => [k, rund(v)])),
  }));
  const saknarKostnad = [...saknas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([titel, intakt]) => ({ titel, intakt: rund(intakt) }));
  return { dagar: dagarUt, saknarKostnad, kostnadKallor, perLand };
}

/**
 * En butiks vinstunderlag, `dagar` dygn bakåt. Kostnaderna och ordrarna får
 * komma ur olika appar: kundtjänstens app får läsa ordrar men inte produkter,
 * fabrikens tvärtom (mätt på Bäverbutiken 2026-09-26).
 */
export async function hamtaVinstunderlag(butik, { dagar = 8, env = process.env, fetchFn = fetch, nu = new Date(), valuta, kostnadPerLand = null } = {}) {
  const kandidater = await kandidatNycklar(butik, env);
  const tokens = [];
  const fel = [];
  for (const nycklar of kandidater) {
    try { tokens.push({ via: nycklar.via, ...(await mintaToken(butik, { env, fetchFn, nycklar })) }); } catch (e) { fel.push(`${nycklar.via}: ${e.message}`); }
  }
  if (!tokens.length) throw new Error(fel[0] ?? 'inga nycklar för butiken');

  let kostnader = null;
  let kostnadVia = null;
  for (const t of tokens) {
    try { kostnader = await lasKostnader(t.shop, t.token, fetchFn); kostnadVia = t.via; break; } catch (e) { fel.push(`${t.via} (produkter): ${e.message}`); }
  }
  if (!kostnader) throw new Error(`ingen app får läsa varukostnaden (Cost per item) — ${fel.slice(-1)[0] ?? ''}`);

  const fran = sistaDagarna(dagar, { nu })[0];
  let ordrar = null;
  let orderVia = null;
  let landVia = null;
  for (const t of tokens) {
    try {
      const alla = [];
      let efter = null;
      const form = { medVariant: true, medLand: true };
      for (let sida = 0; sida < 80; sida++) {
        let d;
        try {
          d = await gql(t.shop, t.token, frageFor(form), { efter, q: `created_at:>=${fran}` }, fetchFn);
        } catch (e) {
          // Nekat fält ⇒ ta bort just det och fråga om samma sida.
          const nekat = nekatFalt(e.message);
          if (nekat === 'variant' && form.medVariant) { form.medVariant = false; sida--; continue; }
          if (nekat === 'land' && form.medLand) { form.medLand = false; sida--; continue; }
          throw e;
        }
        alla.push(...d.orders.nodes);
        if (!d.orders.pageInfo.hasNextPage) break;
        efter = d.orders.pageInfo.endCursor;
      }
      ordrar = alla; orderVia = t.via; landVia = form.medLand; break;
    } catch (e) { fel.push(`${t.via} (ordrar): ${e.message}`); }
  }
  if (!ordrar) throw new Error(`ingen app får läsa ordrarna med rader och avgifter — ${fel.slice(-1)[0] ?? ''}`);

  const utfall = summeraOrdrar(ordrar, kostnader, { dagar, nu, valuta, kostnadPerLand });
  return {
    id: butik.id, status: 'ok', orsak: null, valuta, via: { kostnad: kostnadVia, ordrar: orderVia, land: landVia ? 'shippingAddress' : 'nekad — räknat utan leveransland' },
    varianter: kostnader.size, varianterMedKostnad: [...kostnader.values()].filter((k) => k.kostnad !== null).length,
    ...utfall,
  };
}

/**
 * Alla butiker som gick att läsa i försäljningssteget. Aldrig ett undantag.
 * `kostnadPerLandFor(butik)` (valfri) ger butikens hook för kostnad per leveransland,
 * eller null (Cost per item som vanligt).
 */
export async function hamtaAllVinst(butiker, lasta, { dagar = 8, env = process.env, fetchFn = fetch, nu = new Date(), logg = () => {}, kostnadPerLandFor = () => null } = {}) {
  const ut = [];
  for (const b of butiker) {
    const las = lasta.find((x) => x.id === b.id);
    if (!las || las.status !== 'ok') continue; // butiken lästes inte alls — orsaken står redan på butiken
    try {
      const rad = await hamtaVinstunderlag(b, { dagar, env, fetchFn, nu, valuta: las.valuta, kostnadPerLand: kostnadPerLandFor(b) ?? null });
      const s = rad.dagar.reduce((a, d) => ({ n: a.n + d.netto, k: a.k + d.varukostnad, u: a.u + d.utanKostnad }), { n: 0, k: 0, u: 0 });
      logg(`  ${b.id}: netto ${Math.round(s.n)} · varukostnad ${Math.round(s.k)} · utan kostnad ${Math.round(s.u)} ${las.valuta} (${rad.varianterMedKostnad}/${rad.varianter} varianter${rad.kostnadKallor?.land ? `, ${rad.kostnadKallor.land} rader med kostnad per leveransland` : ''})`);
      ut.push(rad);
    } catch (e) {
      logg(`  ${b.id}: ${e.message}`);
      ut.push({ id: b.id, status: 'fel', orsak: e.message, valuta: las.valuta, dagar: [], saknarKostnad: [] });
    }
  }
  return ut;
}
