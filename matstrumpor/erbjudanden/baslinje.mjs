// Baslinje för Matstrumpors erbjudanden — LÄS-BART (bara queries, aldrig mutations).
// Uppdrag M1 2026-09-30. Butik: matstrumpor (1r46tp-qx) via sparning/butik.mjs.
// Kör från repo-roten:  node matstrumpor/erbjudanden/baslinje.mjs [--sond] [--dagar 90]
//
// Skriver bara AGGREGAT: inga kundnamn, inga e-postadresser, inga adresser.
// Det som inte gick att läsa står i utdata under `kunde_inte` med orsak — aldrig som noll.

import { mkdirSync, writeFileSync } from 'node:fs';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';

const ARG = process.argv.slice(2);
const har = (f) => ARG.includes(f);
const val = (f, d) => { const i = ARG.indexOf(f); return i > -1 ? ARG[i + 1] : d; };
const SOND = har('--sond');
const DAGAR = Number(val('--dagar', 90));
const IDAG = '2026-09-30';
const UT_MAPP = '/home/user/yognftnfgn/matstrumpor/erbjudanden/data';
const UT_JSON = `${UT_MAPP}/baslinje-${IDAG}.json`;
const UT_MD = `${UT_MAPP}/baslinje-${IDAG}.md`;
const TZ = 'Europe/Stockholm';

// Fönstren: 90 d ⇒ created_at >= 2026-07-02, 30 d ⇒ >= 2026-08-31 (samma dagräkning som kor.mjs --aov).
const dagarSedan = (n) => new Date(Date.parse(`${IDAG}T12:00:00+02:00`) - n * 86400000).toISOString().slice(0, 10);
const FRAN_90 = dagarSedan(DAGAR);
const FRAN_30 = dagarSedan(30);
const stockholmDatum = (iso) => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
const stockholmTimme = (iso) => new Intl.DateTimeFormat('sv-SE', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false }).format(new Date(iso));
function isoVecka(datumStr) {
  const [y, m, d] = datumStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dag = dt.getUTCDay() || 7;
  dt.setUTCDate(dt.getUTCDate() + 4 - dag);
  const arStart = new Date(Date.UTC(dt.getUTCFullYear(), 0, 1));
  const v = Math.ceil(((dt - arStart) / 86400000 + 1) / 7);
  return `${dt.getUTCFullYear()}-W${String(v).padStart(2, '0')}`;
}

const kundeInte = [];
const logg = (s) => console.error(s);
const paus = (ms) => new Promise((r) => setTimeout(r, ms));
const r2 = (x) => Math.round(x * 100) / 100;
const pct = (a, b) => (b ? r2((a / b) * 100) : null);
const num = (x) => Number(x ?? 0);
const median = (arr) => { if (!arr.length) return null; const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : r2((s[m - 1] + s[m]) / 2); };
const raknare = () => new Map();
const plus = (map, nyckel, n = 1) => map.set(nyckel, (map.get(nyckel) ?? 0) + n);
const somObjekt = (map, sort = true) => Object.fromEntries(sort ? [...map.entries()].sort((a, b) => b[1] - a[1]) : [...map.entries()]);

// ── klient med backoff ──────────────────────────────────────────────────────
const b = lasButik('matstrumpor');
const k = await skapaKlient(b);
class KostnadsFel extends Error {}
async function gql(query, variables = {}, { forsok = 6 } = {}) {
  for (let n = 1; ; n++) {
    try {
      return await k.graphql(query, variables);
    } catch (e) {
      const msg = String(e.message);
      if (/MAX_COST_EXCEEDED|exceeds the maximum/i.test(msg)) throw new KostnadsFel(msg);
      if (/THROTTLED|Throttled|INTERNAL_SERVER_ERROR|Internal error|\b50[0-4]\b/.test(msg) && n < forsok) {
        const vantan = 2000 * n;
        logg(`  ⏳ Shopify: tillfälligt fel (${msg.slice(0, 80).replace(/\s+/g, ' ')}), väntar ${vantan / 1000} s (${n}/${forsok})`);
        await paus(vantan);
        continue;
      }
      throw e;
    }
  }
}
// Hela steget i try/catch: det som inte gick att läsa står med orsak.
async function steg(namn, fn) {
  try {
    const t0 = Date.now();
    const r = await fn();
    logg(`✅ ${namn} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
    return r;
  } catch (e) {
    const orsak = String(e.message).replace(/\s+/g, ' ').slice(0, 400);
    logg(`❌ ${namn}: ${orsak}`);
    kundeInte.push({ steg: namn, orsak });
    return null;
  }
}

// ── 0. butiken och planen ───────────────────────────────────────────────────
const butik = await steg('Butik + plan', async () => {
  const d = await gql(`{ shop { name currencyCode ianaTimezone primaryDomain { host }
    plan { publicDisplayName partnerDevelopment shopifyPlus }
    paymentSettings { supportedDigitalWallets } } }`);
  return {
    namn: d.shop.name, valuta: d.shop.currencyCode, tidszon: d.shop.ianaTimezone, doman: d.shop.primaryDomain?.host,
    plan: d.shop.plan, digitala_planbocker: d.shop.paymentSettings?.supportedDigitalWallets ?? null,
  };
});
const planLegacy = await steg('Plan (displayName, äldre fält)', async () => {
  const d = await gql(`{ shop { plan { displayName } } }`);
  return d.shop.plan?.displayName ?? null;
});
const checkoutProfiler = await steg('Checkout-profiler', async () => {
  const d = await gql(`{ checkoutProfiles(first: 5) { nodes { name isPublished } } }`);
  return d.checkoutProfiles.nodes;
});

// ── 1–10. ordrar ────────────────────────────────────────────────────────────
const ORDER_FALT = `
  createdAt cancelledAt test displayFinancialStatus displayFulfillmentStatus
  totalPriceSet { shopMoney { amount currencyCode } }
  subtotalPriceSet { shopMoney { amount } }
  totalDiscountsSet { shopMoney { amount } }
  totalShippingPriceSet { shopMoney { amount } }
  totalRefundedSet { shopMoney { amount } }
  totalTaxSet { shopMoney { amount } }
  presentmentCurrencyCode
  shippingAddress { countryCodeV2 }
  paymentGatewayNames
  discountCodes
  discountApplications(first: 5) { nodes { __typename allocationMethod targetSelection targetType
    value { __typename ... on MoneyV2 { amount currencyCode } ... on PricingPercentageValue { percentage } }
    ... on DiscountCodeApplication { code }
    ... on AutomaticDiscountApplication { title }
    ... on ManualDiscountApplication { title description }
    ... on ScriptDiscountApplication { title } } }
  tags
  customAttributes { key value }
  customer { id numberOfOrders }
  refunds { createdAt totalRefundedSet { shopMoney { amount } } }
  shippingLines(first: 3) { nodes { title code originalPriceSet { shopMoney { amount } } discountedPriceSet { shopMoney { amount } } } }
  transactions(first: 3) { kind status gateway formattedGateway
    paymentDetails { __typename ... on CardPaymentDetails { company wallet paymentMethodName } ... on LocalPaymentMethodsPaymentDetails { paymentMethodName } ... on ShopPayInstallmentsPaymentDetails { paymentMethodName } } }
  lineItems(first: 20) { nodes { title quantity sku variantTitle product { handle } variant { id title }
    originalUnitPriceSet { shopMoney { amount } } discountedTotalSet { shopMoney { amount } } } }
`;

async function hamtaOrdrar() {
  const alla = [];
  let after = null;
  let n = SOND ? 2 : 100;
  let sidor = 0;
  for (;;) {
    let d;
    try {
      d = await gql(
        `query($q: String!, $c: String, $n: Int!) { orders(first: $n, after: $c, query: $q, sortKey: CREATED_AT) {
          pageInfo { hasNextPage endCursor } nodes { ${ORDER_FALT} } } }`,
        { q: `created_at:>=${FRAN_90}`, c: after, n }
      );
    } catch (e) {
      if (e instanceof KostnadsFel && n > 5) { n = Math.max(5, Math.floor(n / 2)); logg(`  ↓ sidstorlek ${n} (kostnadstaket)`); continue; }
      throw e;
    }
    alla.push(...d.orders.nodes);
    sidor++;
    logg(`  sida ${sidor}: ${d.orders.nodes.length} ordrar (totalt ${alla.length})`);
    if (SOND || !d.orders.pageInfo.hasNextPage) break;
    after = d.orders.pageInfo.endCursor;
    if (sidor > 200) throw new Error('över 200 sidor — avbryter');
  }
  return alla;
}

const raOrdrar = await steg(`Ordrar sedan ${FRAN_90}`, hamtaOrdrar);
if (SOND) { console.log(JSON.stringify(raOrdrar, null, 2)); process.exit(0); }

// ── analys ──────────────────────────────────────────────────────────────────
function kategori(li) {
  const h = String(li.product?.handle ?? '').toLowerCase();
  const t = String(li.title ?? '').toLowerCase();
  if (h.includes('sushi-strumpor') || (t.includes('sushi') && t.includes('strumpor'))) return 'sushi';
  if (h.includes('pizza') || t.includes('pizza')) return 'pizza';
  if (h.includes('hamburg') || t.includes('hamburg')) return 'hamburgare';
  if (h.includes('donut') || t.includes('donut') || t.includes('munk')) return 'donut';
  if (h.includes('pinnar') || t.includes('pinnar')) return 'atpinnar';
  if (h.includes('presentkort') || t.includes('presentkort') || t.includes('gift card')) return 'presentkort';
  return 'annat';
}
const arStrumpor = (li) => /strumpor/i.test(String(li.title ?? '')) || /strumpor/i.test(String(li.product?.handle ?? ''));

function analysera(ordrar, etikett) {
  const A = { etikett, fran: null, till: IDAG };
  const giltiga = ordrar.filter((o) => !o.cancelledAt && !o.test);
  A.ordrar_totalt_hamtade = ordrar.length;
  A.annullerade = ordrar.filter((o) => o.cancelledAt).length;
  A.testordrar = ordrar.filter((o) => o.test).length;
  A.ordrar = giltiga.length;
  const finStatus = raknare();
  for (const o of giltiga) plus(finStatus, o.displayFinancialStatus ?? 'okänd');
  A.finansiell_status = somObjekt(finStatus);

  // 1. omsättning, AOV, median, per vecka
  const varden = giltiga.map((o) => num(o.totalPriceSet.shopMoney.amount));
  const oms = varden.reduce((s, x) => s + x, 0);
  A.omsattning_sek = r2(oms);
  A.aov_sek = giltiga.length ? r2(oms / giltiga.length) : null;
  A.median_ordervarde_sek = median(varden);
  const betalda = giltiga.filter((o) => o.displayFinancialStatus === 'PAID');
  const omsBetalda = betalda.reduce((s, o) => s + num(o.totalPriceSet.shopMoney.amount), 0);
  A.bara_betalda = { ordrar: betalda.length, omsattning_sek: r2(omsBetalda), aov_sek: betalda.length ? r2(omsBetalda / betalda.length) : null, comment: 'Samma urval som node matstrumpor/kor.mjs --aov (financial_status:paid).' };
  const veckor = new Map();
  for (const o of giltiga) {
    const v = isoVecka(stockholmDatum(o.createdAt));
    const w = veckor.get(v) ?? { ordrar: 0, omsattning_sek: 0 };
    w.ordrar++; w.omsattning_sek += num(o.totalPriceSet.shopMoney.amount);
    veckor.set(v, w);
  }
  A.per_vecka = Object.fromEntries([...veckor.entries()].sort().map(([v, w]) => [v, { ordrar: w.ordrar, omsattning_sek: r2(w.omsattning_sek), aov_sek: r2(w.omsattning_sek / w.ordrar) }]));

  // 2. strumplådor per order
  const fordelning = raknare(); const vardePerLador = new Map();
  let exakt2 = 0, fyraPlus = 0, medLador = 0, ladorTot = 0, avhuggna = 0;
  for (const o of giltiga) {
    if (o.lineItems.nodes.length >= 20) avhuggna++;
    const lador = o.lineItems.nodes.filter(arStrumpor).reduce((s, li) => s + li.quantity, 0);
    ladorTot += lador;
    if (lador > 0) medLador++;
    if (lador === 2) exakt2++;
    if (lador >= 4) fyraPlus++;
    const hink = lador === 0 ? '0' : lador >= 6 ? '6+' : lador === 5 ? '5' : String(lador);
    plus(fordelning, hink);
    const v = vardePerLador.get(hink) ?? { ordrar: 0, oms: 0, varden: [] };
    v.ordrar++; v.oms += num(o.totalPriceSet.shopMoney.amount); v.varden.push(num(o.totalPriceSet.shopMoney.amount)); vardePerLador.set(hink, v);
  }
  A.strumplador_per_order = {
    fordelning: Object.fromEntries(['0', '1', '2', '3', '4', '5', '6+'].map((n) => [n, fordelning.get(n) ?? 0])),
    ordervarde_per_lador: Object.fromEntries(['0', '1', '2', '3', '4', '5', '6+'].filter((n) => vardePerLador.has(n)).map((n) => { const v = vardePerLador.get(n); return [n, { ordrar: v.ordrar, omsattning_sek: r2(v.oms), aov_sek: r2(v.oms / v.ordrar), median_sek: median(v.varden), andel_omsattning_pct: pct(v.oms, oms) }]; })),
    andel_exakt_2_pct: pct(exakt2, giltiga.length), andel_4_plus_pct: pct(fyraPlus, giltiga.length),
    snitt_lador_per_order: giltiga.length ? r2(ladorTot / giltiga.length) : null,
    ordrar_med_lador: medLador, ordrar_med_20_plus_rader_avhuggna: avhuggna,
    comment: 'Räknar lineItems vars titel/handle innehåller "strumpor" — ätpinnar och presentkort räknas inte. 0 = ordrar med bara presentkort/pinnar/annat.',
  };

  // 3. variantmix sushi + produktmix
  const sushiVar = new Map(); const prodEnh = raknare(); const prodOrd = raknare(); const titlar = raknare();
  for (const o of giltiga) {
    const setKat = new Set(); const setVar = new Set();
    for (const li of o.lineItems.nodes) {
      const kat = kategori(li);
      plus(prodEnh, kat, li.quantity); setKat.add(kat);
      plus(titlar, `${li.title} | ${li.variantTitle ?? ''}`, li.quantity);
      if (kat === 'sushi') {
        // Varianten döptes om under fönstret ("5 - Par" → "5 - Par / One Size"): samma variant, slås ihop på antalet par.
        const ra = String(li.variantTitle ?? li.variant?.title ?? 'okänd');
        const m = /^(\d+)\s*-\s*Par/i.exec(ra);
        const vt = m ? `${m[1]}-pack` : ra;
        const s = sushiVar.get(vt) ?? { enheter: 0, ordrar: 0 };
        s.enheter += li.quantity; sushiVar.set(vt, s); setVar.add(vt);
      }
    }
    for (const kat of setKat) plus(prodOrd, kat);
    for (const vt of setVar) sushiVar.get(vt).ordrar++;
  }
  A.sushi_varianter = Object.fromEntries([...sushiVar.entries()].sort((x, y) => y[1].enheter - x[1].enheter));
  A.produktmix = Object.fromEntries(['sushi', 'pizza', 'hamburgare', 'donut', 'atpinnar', 'presentkort', 'annat'].map((kat) => [kat, { enheter: prodEnh.get(kat) ?? 0, ordrar: prodOrd.get(kat) ?? 0, andel_ordrar_pct: pct(prodOrd.get(kat) ?? 0, giltiga.length) }]));
  A.radtitlar_topp = Object.fromEntries([...titlar.entries()].sort((x, y) => y[1] - x[1]).slice(0, 15));

  // 4. rabattkoder + automatiska rabatter
  const koder = new Map(); let utanKod = 0; let utanNagonRabatt = 0; const autoApp = new Map(); const typer = raknare();
  let rabattTot = 0;
  for (const o of giltiga) {
    const rab = num(o.totalDiscountsSet.shopMoney.amount);
    rabattTot += rab;
    const cs = (o.discountCodes ?? []).map((c) => String(c).toUpperCase());
    if (!cs.length) utanKod++;
    if (rab === 0) utanNagonRabatt++;
    for (const c of new Set(cs)) {
      const s = koder.get(c) ?? { ordrar: 0, rabatt_sek: 0, ordervarde_sek: 0, lador: 0 };
      s.ordrar++; s.rabatt_sek += rab; s.ordervarde_sek += num(o.totalPriceSet.shopMoney.amount);
      s.lador += o.lineItems.nodes.filter(arStrumpor).reduce((q, li) => q + li.quantity, 0);
      koder.set(c, s);
    }
    for (const da of o.discountApplications?.nodes ?? []) {
      plus(typer, da.__typename);
      if (da.__typename === 'DiscountCodeApplication') continue;
      const nyckel = `${da.__typename}: ${da.title ?? da.description ?? '?'}`;
      const v = da.value?.__typename === 'PricingPercentageValue' ? `${da.value.percentage} %` : da.value?.amount ? `${da.value.amount} ${da.value.currencyCode ?? ''}` : '?';
      const s = autoApp.get(nyckel) ?? { ordrar: 0, varden: raknare(), target: `${da.targetType}/${da.targetSelection}/${da.allocationMethod}` };
      s.ordrar++; plus(s.varden, v); autoApp.set(nyckel, s);
    }
  }
  A.rabatter = {
    total_rabatt_sek: r2(rabattTot),
    ordrar_utan_kod: utanKod, andel_utan_kod_pct: pct(utanKod, giltiga.length),
    ordrar_utan_nagon_rabatt: utanNagonRabatt, andel_utan_nagon_rabatt_pct: pct(utanNagonRabatt, giltiga.length),
    typer_av_rabattapplikation: somObjekt(typer),
    koder: Object.fromEntries([...koder.entries()].sort((x, y) => y[1].ordrar - x[1].ordrar).map(([c, s]) => [c, { ordrar: s.ordrar, andel_pct: pct(s.ordrar, giltiga.length), snittrabatt_sek: r2(s.rabatt_sek / s.ordrar), snitt_ordervarde_sek: r2(s.ordervarde_sek / s.ordrar), snitt_lador: r2(s.lador / s.ordrar) }])),
    automatiska_och_manuella: Object.fromEntries([...autoApp.entries()].sort((x, y) => y[1].ordrar - x[1].ordrar).map(([n, s]) => [n, { ordrar: s.ordrar, varden: somObjekt(s.varden), mal: s.target }])),
    comment: 'snittrabatt_sek = totalDiscountsSet per order (alla rabatter på ordern, inte bara koden).',
  };

  // 5. betalsätt
  const gateways = raknare(); const metoder = raknare(); const planbocker = raknare(); const kombo = raknare();
  const klassa = (o) => {
    const g = (o.paymentGatewayNames ?? []).map((x) => String(x).toLowerCase());
    const tr = (o.transactions ?? []).filter((t) => ['SALE', 'CAPTURE', 'AUTHORIZATION'].includes(t.kind) && t.status === 'SUCCESS');
    const pd = tr.map((t) => t.paymentDetails).filter(Boolean);
    const namn = pd.map((p) => String(p.paymentMethodName ?? p.company ?? '').toLowerCase()).join(',');
    const wallet = pd.map((p) => p.wallet).filter(Boolean).join(',');
    const gtxt = g.join(',');
    if (g.some((x) => x.includes('gift_card'))) return 'presentkort';
    if (gtxt.includes('klarna') || namn.includes('klarna')) return 'klarna';
    if (gtxt.includes('paypal')) return 'paypal';
    if (gtxt.includes('swish') || namn.includes('swish')) return 'swish';
    if (wallet.includes('SHOPIFY_PAY') || wallet.includes('SHOP_PAY') || gtxt.includes('shop_pay') || namn.includes('shop pay')) return 'shop_pay';
    if (wallet.includes('APPLE_PAY') || namn.includes('apple')) return 'apple_pay';
    if (wallet.includes('GOOGLE_PAY') || namn.includes('google')) return 'google_pay';
    if (gtxt.includes('shopify_payments')) return namn && !/visa|mastercard|amex|american|maestro|card|kort/.test(namn) ? `shopify_payments:${namn.split(',')[0]}` : 'kort_shopify_payments';
    if (gtxt.includes('manual')) return 'manuell';
    return `annat:${gtxt || 'ingen gateway'}`;
  };
  for (const o of giltiga) {
    plus(gateways, (o.paymentGatewayNames ?? []).join('+') || 'ingen');
    plus(metoder, klassa(o));
    for (const t of o.transactions ?? []) {
      if (!t.paymentDetails) continue;
      plus(planbocker, `${t.paymentDetails.__typename}${t.paymentDetails.wallet ? ':' + t.paymentDetails.wallet : ''}${t.paymentDetails.paymentMethodName ? ':' + t.paymentDetails.paymentMethodName : ''}${t.paymentDetails.company ? ':' + t.paymentDetails.company : ''}`);
    }
    plus(kombo, `${(o.paymentGatewayNames ?? []).join('+') || 'ingen'} | ${(o.transactions ?? []).map((t) => t.formattedGateway).filter(Boolean)[0] ?? ''}`);
  }
  A.betalsatt = {
    klassat: Object.fromEntries([...metoder.entries()].sort((x, y) => y[1] - x[1]).map(([m, n]) => [m, { ordrar: n, andel_pct: pct(n, giltiga.length) }])),
    gateway_namn_ra: somObjekt(gateways),
    betaldetaljer_ra: somObjekt(planbocker),
    gateway_plus_formattedGateway: somObjekt(kombo),
    comment: 'Klassningen ur paymentGatewayNames + transaktionernas paymentDetails (wallet/paymentMethodName). Klarna via Shopify Payments syns bara om paymentDetails säger det — se betaldetaljer_ra för råvärdena.',
  };

  // 6. valuta och land
  const valutor = raknare(); const lander = raknare();
  for (const o of giltiga) { plus(valutor, o.presentmentCurrencyCode ?? 'okänd'); plus(lander, o.shippingAddress?.countryCodeV2 ?? 'saknar leveransadress'); }
  const seSek = giltiga.filter((o) => o.presentmentCurrencyCode === 'SEK' && (o.shippingAddress?.countryCodeV2 ?? 'SE') === 'SE').length;
  A.valuta_och_land = { valutor: somObjekt(valutor), lander: somObjekt(lander), sek_och_sverige: seSek, andel_sek_sverige_pct: pct(seSek, giltiga.length) };

  // 7. frakt
  const fraktrader = raknare(); let friFrakt = 0, fraktIntakt = 0, utanFraktrad = 0;
  for (const o of giltiga) {
    const fr = num(o.totalShippingPriceSet.shopMoney.amount);
    fraktIntakt += fr;
    if (fr === 0) friFrakt++;
    if (!o.shippingLines.nodes.length) utanFraktrad++;
    for (const sl of o.shippingLines.nodes) plus(fraktrader, `${sl.title} @ ${num(sl.discountedPriceSet?.shopMoney?.amount ?? sl.originalPriceSet?.shopMoney?.amount)} kr`);
  }
  A.frakt = { ordrar_med_fri_frakt: friFrakt, andel_fri_frakt_pct: pct(friFrakt, giltiga.length), fraktintakt_sek: r2(fraktIntakt), ordrar_utan_fraktrad: utanFraktrad, fraktrader: somObjekt(fraktrader) };

  // 8. återbetalningar
  let medRef = 0, refTot = 0, helt = 0;
  for (const o of giltiga) {
    const rt = num(o.totalRefundedSet.shopMoney.amount);
    if ((o.refunds ?? []).length || rt > 0) { medRef++; refTot += rt; if (rt >= num(o.totalPriceSet.shopMoney.amount) - 0.01) helt++; }
  }
  A.aterbetalningar = { ordrar_med_aterbetalning: medRef, andel_pct: pct(medRef, giltiga.length), belopp_sek: r2(refTot), andel_av_omsattning_pct: pct(refTot, oms), helt_aterbetalda: helt };

  // 9. återkommande kunder — reellt: tidigare order FÖRE den här (i fönstret eller före fönstret via numberOfOrders)
  const perKund = new Map();
  for (const o of giltiga) { if (!o.customer?.id) continue; const l = perKund.get(o.customer.id) ?? []; l.push(o); perKund.set(o.customer.id, l); }
  let ater = 0, aterUtanSammaDygn = 0, utanKund = 0, kunderMedFler = 0;
  for (const o of giltiga) {
    if (!o.customer?.id) { utanKund++; continue; }
    const lista = perKund.get(o.customer.id).sort((x, y) => Date.parse(x.createdAt) - Date.parse(y.createdAt));
    const i = lista.indexOf(o);
    const N = Number(o.customer.numberOfOrders ?? 0);
    const foreFonstret = Math.max(0, N - lista.length);
    const tidigare = foreFonstret + i;
    if (tidigare > 0) ater++;
    const tidigareUtanDygn = foreFonstret + lista.slice(0, i).filter((p) => Date.parse(o.createdAt) - Date.parse(p.createdAt) > 86400000).length;
    if (tidigareUtanDygn > 0) aterUtanSammaDygn++;
  }
  for (const [, l] of perKund) if (l.length > 1) kunderMedFler++;
  A.kunder = {
    ordrar_fran_aterkommande: ater, andel_aterkommande_pct: pct(ater, giltiga.length - utanKund),
    ordrar_fran_aterkommande_utan_samma_dygn: aterUtanSammaDygn, andel_utan_samma_dygn_pct: pct(aterUtanSammaDygn, giltiga.length - utanKund),
    unika_kunder_i_fonstret: perKund.size, kunder_med_fler_an_en_order_i_fonstret: kunderMedFler, ordrar_utan_kundkonto: utanKund,
    comment: 'Reellt: en order räknas som återkommande bara om kunden hade minst en order FÖRE den (numberOfOrders minus ordrarna i fönstret = ordrar före fönstret, plus tidigare ordrar i fönstret). "utan samma dygn" kräver att den tidigare ordern lades > 24 h före.',
  };

  // 10. taggar och customAttributes
  const taggar = raknare(); const attrNycklar = raknare(); const attrVarden = raknare(); let upsellSpar = 0;
  const IDENTIFIERARE = /^(fbp|fbc|auid|vid|ttp|_ga|gclid|ttclid|sh|sw)$/i; // spårningsid:n och skärmmått — räknas som nycklar, listas aldrig som värden
  const maska = (v) => String(v ?? '').replace(/[^\s@]+@[^\s@]+/g, '<mejl>').replace(/\+?\d[\d\s-]{6,}\d/g, '<nummer>').slice(0, 60);
  const abTest = new Map();
  for (const o of giltiga) {
    for (const t of o.tags ?? []) plus(taggar, t);
    for (const a of o.customAttributes ?? []) {
      plus(attrNycklar, a.key);
      if (/kalla|källa|aftersell|upsell|tacksida|post.?purchase|reconvert|zipify|kaching/i.test(`${a.key} ${a.value}`)) upsellSpar++;
      if (!IDENTIFIERARE.test(a.key)) plus(attrVarden, `${a.key}=${maska(a.value)}`);
      if (/^AB /i.test(a.key)) {
        const nyckel = `${a.key}=${String(a.value).slice(0, 20)}`;
        const s = abTest.get(nyckel) ?? { ordrar: 0, oms: 0, lador: 0 };
        s.ordrar++; s.oms += num(o.totalPriceSet.shopMoney.amount); s.lador += o.lineItems.nodes.filter(arStrumpor).reduce((q, li) => q + li.quantity, 0);
        abTest.set(nyckel, s);
      }
    }
  }
  A.taggar_och_attribut = {
    taggar_topp: Object.fromEntries([...taggar.entries()].sort((x, y) => y[1] - x[1]).slice(0, 25)),
    ordrar_med_upsell_spar: upsellSpar,
    attribut_nycklar: somObjekt(attrNycklar),
    attribut_varden_topp: Object.fromEntries([...attrVarden.entries()].sort((x, y) => y[1] - x[1]).slice(0, 20)),
    ab_test_i_temat: Object.fromEntries([...abTest.entries()].sort().map(([n, s]) => [n, { ordrar: s.ordrar, aov_sek: r2(s.oms / s.ordrar), snitt_lador: r2(s.lador / s.ordrar) }])),
    comment: 'ab_test_i_temat = ordrar som bär ett "AB …"-attribut ur temat (kunden sattes i en gren i webbläsaren). "AB sortval" är temats sortval-block ms_sortval (gren b = rullista per låda, enligt matstrumpor/marknader/underlag.mjs). Bara ordrar syns här, inte besökare — ingen konverteringsgrad går att räkna ur detta.',
  };
  return A;
}

let analys90 = null, analys30 = null;
if (raOrdrar) {
  const g30 = raOrdrar.filter((o) => stockholmDatum(o.createdAt) >= FRAN_30);
  analys90 = analysera(raOrdrar, `${DAGAR} dagar`); analys90.fran = FRAN_90;
  analys30 = analysera(g30, '30 dagar'); analys30.fran = FRAN_30;
}

// ── 7b. fraktprofiler (butikens zoner och priser) ───────────────────────────
const fraktprofiler = await steg('Fraktprofiler (deliveryProfiles)', async () => {
  const d = await gql(`{ deliveryProfiles(first: 10) { nodes { id name default
    profileLocationGroups { locationGroup { id locations(first: 3) { nodes { name } } }
      locationGroupZones(first: 25) { nodes { zone { name countries { name code { countryCode restOfWorld } provinces { code } } }
        methodDefinitions(first: 25) { nodes { name active description
          rateProvider { __typename ... on DeliveryRateDefinition { price { amount currencyCode } } ... on DeliveryParticipant { carrierService { formattedName } fixedFee { amount currencyCode } percentageOfRateFee adaptToNewServicesFlag } }
          methodConditions { field operator conditionCriteria { __typename ... on MoneyV2 { amount currencyCode } ... on Weight { unit value } } } } } } } } } } }`);
  return d.deliveryProfiles.nodes.map((p) => ({
    namn: p.name, standard: p.default,
    grupper: p.profileLocationGroups.map((g) => ({
      platser: g.locationGroup.locations.nodes.map((l) => l.name),
      zoner: g.locationGroupZones.nodes.map((z) => ({
        namn: z.zone.name,
        lander: z.zone.countries.map((c) => c.code.restOfWorld ? 'Resten av världen' : c.code.countryCode),
        metoder: z.methodDefinitions.nodes.map((m) => ({
          namn: m.name, aktiv: m.active, beskrivning: m.description || null,
          pris: m.rateProvider.__typename === 'DeliveryRateDefinition' ? `${m.rateProvider.price.amount} ${m.rateProvider.price.currencyCode}` : `fraktbolag ${m.rateProvider.carrierService?.formattedName ?? '?'}`,
          villkor: m.methodConditions.map((c) => `${c.field} ${c.operator} ${c.conditionCriteria.__typename === 'MoneyV2' ? `${c.conditionCriteria.amount} ${c.conditionCriteria.currencyCode}` : `${c.conditionCriteria.value} ${c.conditionCriteria.unit}`}`),
        })),
      })),
    })),
  }));
});

// ── 11. rabatter i butiken ──────────────────────────────────────────────────
const ITEMS = `items { __typename ... on AllDiscountItems { allItems }
  ... on DiscountProducts { products(first: 10) { nodes { handle title } } productVariants(first: 10) { nodes { title product { handle } } } }
  ... on DiscountCollections { collections(first: 10) { nodes { handle title } } } }`;
const VALUE = `value { __typename ... on DiscountPercentage { percentage } ... on DiscountAmount { amount { amount currencyCode } appliesOnEachItem }
  ... on DiscountOnQuantity { quantity { quantity } effect { __typename ... on DiscountPercentage { percentage } ... on DiscountAmount { amount { amount currencyCode } appliesOnEachItem } } } }`;
const MINREQ = `minimumRequirement { __typename ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity } ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount currencyCode } } }`;
const COMBINES = `combinesWith { orderDiscounts productDiscounts shippingDiscounts }`;
const CODES = `codes(first: 5) { nodes { code asyncUsageCount } }`;
const KOD_FRAG = `__typename
  ... on DiscountCodeBasic { title status summary startsAt endsAt usageLimit asyncUsageCount appliesOncePerCustomer ${COMBINES} ${CODES} customerGets { appliesOnOneTimePurchase appliesOnSubscription ${VALUE} ${ITEMS} } ${MINREQ} }
  ... on DiscountCodeBxgy { title status summary startsAt endsAt usageLimit asyncUsageCount appliesOncePerCustomer usesPerOrderLimit ${COMBINES} ${CODES}
    customerBuys { value { __typename ... on DiscountQuantity { quantity } ... on DiscountPurchaseAmount { amount } } ${ITEMS} }
    customerGets { ${VALUE} ${ITEMS} } }
  ... on DiscountCodeFreeShipping { title status summary startsAt endsAt usageLimit asyncUsageCount appliesOncePerCustomer ${COMBINES} ${CODES} ${MINREQ} destinationSelection { __typename ... on DiscountCountryAll { allCountries } ... on DiscountCountries { countries includeRestOfWorld } } }
  ... on DiscountCodeApp { title status startsAt endsAt usageLimit asyncUsageCount appliesOncePerCustomer ${COMBINES} ${CODES} appDiscountType { title functionId app { title } discountClass } }`;
const AUTO_FRAG = `__typename
  ... on DiscountAutomaticBasic { title status summary startsAt endsAt asyncUsageCount ${COMBINES} customerGets { ${VALUE} ${ITEMS} } ${MINREQ} }
  ... on DiscountAutomaticBxgy { title status summary startsAt endsAt asyncUsageCount usesPerOrderLimit ${COMBINES}
    customerBuys { value { __typename ... on DiscountQuantity { quantity } ... on DiscountPurchaseAmount { amount } } ${ITEMS} }
    customerGets { ${VALUE} ${ITEMS} } }
  ... on DiscountAutomaticFreeShipping { title status summary startsAt endsAt asyncUsageCount ${COMBINES} ${MINREQ} }
  ... on DiscountAutomaticApp { title status startsAt endsAt asyncUsageCount ${COMBINES} appDiscountType { title functionId app { title } discountClass } }`;

function plattaItems(it) {
  if (!it) return null;
  if (it.__typename === 'AllDiscountItems') return 'alla varor';
  if (it.__typename === 'DiscountProducts') return { produkter: it.products.nodes.map((p) => p.handle), varianter: it.productVariants.nodes.map((v) => `${v.product.handle} / ${v.title}`) };
  if (it.__typename === 'DiscountCollections') return { kollektioner: it.collections.nodes.map((c) => c.handle) };
  return it.__typename;
}
function plattaValue(v) {
  if (!v) return null;
  if (v.__typename === 'DiscountPercentage') return `${v.percentage * 100} %`;
  if (v.__typename === 'DiscountAmount') return `${v.amount.amount} ${v.amount.currencyCode}${v.appliesOnEachItem ? ' per vara' : ''}`;
  if (v.__typename === 'DiscountOnQuantity') return { antal: Number(v.quantity.quantity), effekt: plattaValue(v.effect) };
  return v.__typename;
}
function plattaRabatt(node, d) {
  if (!d) return null;
  const typ = d.__typename.replace('DiscountCode', 'kod:').replace('DiscountAutomatic', 'auto:');
  const ut = {
    id: node.id, typ, titel: d.title, status: d.status, sammanfattning: d.summary ?? null, startar: d.startsAt, slutar: d.endsAt ?? null,
    anvandningar: d.asyncUsageCount ?? null, anvandningsgrans: d.usageLimit ?? null, en_gang_per_kund: d.appliesOncePerCustomer ?? null, ganger_per_order: d.usesPerOrderLimit ?? null,
    kombinerar_med: d.combinesWith ?? null, koder: d.codes?.nodes?.map((c) => `${c.code} (${c.asyncUsageCount})`) ?? null,
  };
  if (d.customerBuys) ut.kunden_koper = { varde: d.customerBuys.value?.__typename === 'DiscountQuantity' ? `${d.customerBuys.value.quantity} st` : d.customerBuys.value?.amount ? `för ${d.customerBuys.value.amount}` : null, av: plattaItems(d.customerBuys.items) };
  if (d.customerGets) ut.kunden_far = { varde: plattaValue(d.customerGets.value), av: plattaItems(d.customerGets.items) };
  if (d.minimumRequirement) ut.minimikrav = d.minimumRequirement.__typename === 'DiscountMinimumQuantity' ? `minst ${d.minimumRequirement.greaterThanOrEqualToQuantity} st` : d.minimumRequirement.greaterThanOrEqualToSubtotal ? `minst ${d.minimumRequirement.greaterThanOrEqualToSubtotal.amount} ${d.minimumRequirement.greaterThanOrEqualToSubtotal.currencyCode}` : null;
  if (d.appDiscountType) ut.app = { titel: d.appDiscountType.title, app: d.appDiscountType.app?.title, klass: d.appDiscountType.discountClass };
  if (d.destinationSelection) ut.destination = d.destinationSelection.allCountries ? 'alla länder' : d.destinationSelection.countries;
  return ut;
}

const kodrabatter = await steg('Rabattkoder (codeDiscountNodes, alla statusar)', async () => {
  const alla = []; let after = null;
  for (let sida = 0; sida < 10; sida++) {
    const d = await gql(`query($c: String) { codeDiscountNodes(first: 50, after: $c, sortKey: CREATED_AT, reverse: true) { pageInfo { hasNextPage endCursor } nodes { id codeDiscount { ${KOD_FRAG} } } } }`, { c: after });
    alla.push(...d.codeDiscountNodes.nodes.map((n) => plattaRabatt(n, n.codeDiscount)));
    if (!d.codeDiscountNodes.pageInfo.hasNextPage) break;
    after = d.codeDiscountNodes.pageInfo.endCursor;
  }
  return alla;
});
const autorabatter = await steg('Automatiska rabatter (automaticDiscountNodes)', async () => {
  const d = await gql(`{ automaticDiscountNodes(first: 50) { nodes { id automaticDiscount { ${AUTO_FRAG} } } } }`);
  return d.automaticDiscountNodes.nodes.map((n) => plattaRabatt(n, n.automaticDiscount));
});
const BOGO = ['SUSHI-K1F1', 'STRUMPOR-K1F1-P1', 'STRUMPOR-K1F1-P2', 'SUSHI-K2F2'];
const bogoDetalj = await steg('De fyra BOGO-koderna (codeDiscountNodeByCode)', async () => {
  const ut = {};
  for (const kod of BOGO) {
    const d = await gql(`query($kod: String!) { codeDiscountNodeByCode(code: $kod) { id codeDiscount { ${KOD_FRAG} } } }`, { kod });
    ut[kod] = d.codeDiscountNodeByCode ? plattaRabatt(d.codeDiscountNodeByCode, d.codeDiscountNodeByCode.codeDiscount) : { saknas: 'koden finns inte i butiken' };
  }
  return ut;
});

// ── 12. produkter och priser ────────────────────────────────────────────────
const produkter = await steg('Produkter, varianter, priser, Cost per item', async () => {
  const d = await gql(`{ products(first: 50, sortKey: TITLE) { nodes { id title handle status productType tags totalInventory hasOnlyDefaultVariant publishedAt
    variants(first: 25) { nodes { id title sku price compareAtPrice inventoryQuantity inventoryPolicy availableForSale inventoryItem { tracked unitCost { amount currencyCode } } } } } } }`);
  return d.products.nodes.map((p) => ({
    titel: p.title, handle: p.handle, status: p.status, typ: p.productType || null, taggar: p.tags, lager_totalt: p.totalInventory, publicerad: p.publishedAt ? p.publishedAt.slice(0, 10) : null, en_variant: p.hasOnlyDefaultVariant,
    antal_varianter: p.variants.nodes.length,
    varianter: p.variants.nodes.map((v) => ({ titel: v.title, sku: v.sku || null, pris: Number(v.price), jamforpris: v.compareAtPrice ? Number(v.compareAtPrice) : null, lager: v.inventoryQuantity, lagerpolicy: v.inventoryPolicy, kopbar: v.availableForSale, kostnad_per_artikel: v.inventoryItem?.unitCost ? Number(v.inventoryItem.unitCost.amount) : null })),
  }));
});

// ── 13. appar ───────────────────────────────────────────────────────────────
const appar = await steg('Installerade appar', async () => {
  const d = await gql(`{ appInstallations(first: 50) { edges { node { app { title handle developerName } } } } }`);
  return d.appInstallations.edges.map((e) => ({ titel: e.node.app.title, handle: e.node.app.handle, utvecklare: e.node.app.developerName ?? null }));
});
const LETADE = ['aftersell', 'kaching', 'reconvert', 'zipify', 'selleasy', 'bundle', 'volume', 'trust', 'judge', 'klaviyo', 'spoks', 'upsell', 'post purchase', 'one click'];
const apparTraff = (appar ?? []).filter((a) => LETADE.some((l) => `${a.titel} ${a.handle}`.toLowerCase().includes(l)));

// ── skriv ut ────────────────────────────────────────────────────────────────
const resultat = {
  comment: 'Baslinje för Matstrumpors erbjudanden, LÄS-BAR mätning 2026-09-30. Bara aggregat — inga kundnamn, e-postadresser eller adresser. Källa: Shopify Admin GraphQL 2025-07 via appen Fabriken (sparning/butik.mjs). Det som inte gick att läsa står under kunde_inte med orsak.',
  matt: new Date().toISOString(),
  butik: { ...butik, plan_displayName_legacy: planLegacy, checkout_profiler: checkoutProfiler },
  fonster: { dagar: DAGAR, fran_90: FRAN_90, fran_30: FRAN_30, till: IDAG, tidszon: TZ },
  senaste_90_dagar: analys90,
  senaste_30_dagar: analys30,
  fraktprofiler,
  rabatter_i_butiken: { koder_antal: kodrabatter?.length ?? null, koder: kodrabatter, automatiska: autorabatter, bogo_detalj: bogoDetalj },
  produkter,
  appar: { antal: appar?.length ?? null, traffar_pa_letade: apparTraff, alla: appar },
  kunde_inte: kundeInte,
};
mkdirSync(UT_MAPP, { recursive: true });
writeFileSync(UT_JSON, JSON.stringify(resultat, null, 2));

// ── sammanfattning ──────────────────────────────────────────────────────────
const f = (x) => (x == null ? '—' : typeof x === 'number' ? x.toLocaleString('sv-SE') : String(x));
const cw = (c) => (c ? [c.orderDiscounts && 'order', c.productDiscounts && 'produkt', c.shippingDiscounts && 'frakt'].filter(Boolean).join('+') || 'inget' : '—');
const rad = [];
rad.push(`# Baslinje Matstrumpor — erbjudanden, mätt ${IDAG}`);
rad.push('');
rad.push(`Läs-bar mätning ur Shopify (appen Fabriken, GraphQL 2025-07). Bara aggregat. Fönster: ${DAGAR} dagar från ${FRAN_90}, och 30 dagar från ${FRAN_30}. Annullerade och testordrar borträknade.`);
rad.push('');
if (analys30) {
  const A = analys30; const bs = A.betalsatt.klassat; const n = (m) => bs[m]?.ordrar ?? 0;
  const kort = n('kort_shopify_payments'), shop = n('shop_pay'), klarna = n('klarna'), wallets = n('apple_pay') + n('google_pay'), paypal = n('paypal');
  rad.push('## Det viktigaste (30 dagar)');
  rad.push('');
  rad.push(`- ${A.ordrar} betalda ordrar, ${f(A.omsattning_sek)} kr, **AOV ${f(A.aov_sek)} kr, median ${f(A.median_ordervarde_sek)} kr**. ${A.strumplador_per_order.andel_exakt_2_pct} % av ordrarna bär exakt 2 lådor och står för ${A.strumplador_per_order.ordervarde_per_lador['2']?.andel_omsattning_pct} % av omsättningen; ${A.strumplador_per_order.andel_4_plus_pct} % bär 4+ (AOV ${f(A.strumplador_per_order.ordervarde_per_lador['4']?.aov_sek)} kr).`);
  rad.push(`- **Sverige, SEK och fri frakt på ${A.valuta_och_land.andel_sek_sverige_pct} % / ${A.frakt.andel_fri_frakt_pct} % av ordrarna.** Sverige-zonen i Shopify har EN fraktmetod: "Fri Frakt" 0 kr utan villkor. Fraktintäkt ${f(A.frakt.fraktintakt_sek)} kr.`);
  rad.push(`- **Erbjudandet lever i koderna:** ${A.rabatter.andel_utan_kod_pct} % av ordrarna saknar kod. SUSHI-K1F1 ${A.rabatter.koder['SUSHI-K1F1']?.andel_pct ?? 0} %, STRUMPOR-K1F1-P2 ${A.rabatter.koder['STRUMPOR-K1F1-P2']?.andel_pct ?? 0} %, SUSHI-K2F2 ${A.rabatter.koder['SUSHI-K2F2']?.andel_pct ?? 0} %. K1F1 = kunden köper 1 låda och får 3 varor gratis (1 låda + 2 par ätpinnar), K2F2 = köper 2, får 6 gratis (2 lådor + 4 par pinnar). Koderna kombineras inte med orderrabatter, så Black Week-trappan (SCHEDULED 22–30/11, "alla varor") kan inte läggas ovanpå dem.`);
  rad.push(`- **Betalsätt:** Klarna ${pct(klarna, A.ordrar)} %, Shop Pay ${pct(shop, A.ordrar)} %, Apple/Google Pay ${pct(wallets, A.ordrar)} %, PayPal ${pct(paypal, A.ordrar)} %, kort direkt ${pct(kort, A.ordrar)} %. Shopifys one-click post-purchase-sida visas inte för Klarna, wallets eller PayPal — se avsnittet "Vem kan se one-click-sidan" nedan.`);
  rad.push(`- **Återbetalningar ${A.aterbetalningar.ordrar_med_aterbetalning}, återkommande kunder ${A.kunder.andel_aterkommande_pct} % (reellt).** Ordrar med upsell-/tacksidespår i attribut eller taggar: ${A.taggar_och_attribut.ordrar_med_upsell_spar}. Taggen "Kaching Bundles" finns på ${analys90.taggar_och_attribut.taggar_topp['Kaching Bundles'] ?? 0} ordrar (juli) men appen är inte installerad i dag.`);
  rad.push(`- **Planen är ${butik?.plan?.publicDisplayName ?? '—'}, inte Plus.** Ingen AfterSell/Kaching/ReConvert/Zipify/Selleasy/Bundles installerad; Trust Badges, Judge.me, Klaviyo (avstängt) och Spoks finns.`);
  rad.push(`- **Cost per item i Shopify:** sushi 5-pack ${produkter?.find((p) => p.handle === 'sushi-strumpor')?.varianter.find((v) => v.titel.startsWith('5'))?.kostnad_per_artikel ?? 'saknas'} kr, 3-pack ${produkter?.find((p) => p.handle === 'sushi-strumpor')?.varianter.find((v) => v.titel.startsWith('3'))?.kostnad_per_artikel ?? 'saknas'} kr; ätpinnar, donut, pizza och hamburgare SAKNAR värde (tomt fält, inte 0).`);
  rad.push('');
}
if (butik) rad.push(`**Butik:** ${butik.namn} (${butik.doman}), valuta ${butik.valuta}, plan **${butik.plan?.publicDisplayName ?? planLegacy ?? '—'}** (Plus: ${butik.plan?.shopifyPlus ? 'ja' : 'nej'}), digitala plånböcker: ${(butik.digitala_planbocker ?? []).join(', ') || '—'}.`);
if (checkoutProfiler) rad.push(`Checkout-profiler: ${checkoutProfiler.map((c) => `${c.name}${c.isPublished ? ' (publicerad)' : ''}`).join(', ')}.`);
rad.push('');
for (const A of [analys90, analys30]) {
  if (!A) continue;
  rad.push(`## ${A.etikett} (från ${A.fran})`);
  rad.push('');
  rad.push(`- **Ordrar:** ${f(A.ordrar)} (hämtade ${A.ordrar_totalt_hamtade}, annullerade ${A.annullerade}, test ${A.testordrar}). Finansiell status: ${Object.entries(A.finansiell_status).map(([s, n]) => `${s} ${n}`).join(', ')}.`);
  rad.push(`- **Omsättning:** ${f(A.omsattning_sek)} kr · **AOV ${f(A.aov_sek)} kr** · median ${f(A.median_ordervarde_sek)} kr. Bara betalda: ${A.bara_betalda.ordrar} ordrar, AOV ${f(A.bara_betalda.aov_sek)} kr.`);
  rad.push(`- **Strumplådor per order:** ${Object.entries(A.strumplador_per_order.fordelning).map(([n, c]) => `${n}: ${c}`).join(' · ')} — exakt 2: **${f(A.strumplador_per_order.andel_exakt_2_pct)} %**, 4+: **${f(A.strumplador_per_order.andel_4_plus_pct)} %**, snitt ${f(A.strumplador_per_order.snitt_lador_per_order)} lådor.`);
  rad.push(`- **Sushi-varianter:** ${Object.entries(A.sushi_varianter).map(([v, s]) => `${v}: ${s.enheter} st i ${s.ordrar} ordrar`).join(' · ') || '—'}.`);
  rad.push(`- **Produktmix (ordrar):** ${Object.entries(A.produktmix).filter(([, s]) => s.ordrar).map(([kat, s]) => `${kat} ${s.ordrar} (${s.andel_ordrar_pct} %, ${s.enheter} st)`).join(' · ')}.`);
  rad.push(`- **Rabattkoder:** ${Object.entries(A.rabatter.koder).slice(0, 8).map(([c, s]) => `${c} ${s.ordrar} (${s.andel_pct} %, snittrabatt ${f(s.snittrabatt_sek)} kr, ordervärde ${f(s.snitt_ordervarde_sek)} kr, ${s.snitt_lador} lådor)`).join(' · ') || '—'}. Utan kod: ${A.rabatter.ordrar_utan_kod} (${A.rabatter.andel_utan_kod_pct} %), utan någon rabatt alls: ${A.rabatter.ordrar_utan_nagon_rabatt} (${A.rabatter.andel_utan_nagon_rabatt_pct} %). Total rabatt ${f(A.rabatter.total_rabatt_sek)} kr.`);
  const autoRab = Object.entries(A.rabatter.automatiska_och_manuella);
  rad.push(`- **Automatiska/manuella rabatter på ordrar:** ${autoRab.length ? autoRab.map(([n, s]) => `${n} ${s.ordrar} ordrar (${Object.entries(s.varden).map(([v, c]) => `${v} ×${c}`).join(', ')})`).join(' · ') : 'inga'}.`);
  rad.push(`- **Betalsätt:** ${Object.entries(A.betalsatt.klassat).map(([m, s]) => `${m} ${s.ordrar} (${s.andel_pct} %)`).join(' · ')}.`);
  rad.push(`- **Valuta/land:** SEK + Sverige ${A.valuta_och_land.sek_och_sverige} (${A.valuta_och_land.andel_sek_sverige_pct} %). Valutor: ${Object.entries(A.valuta_och_land.valutor).map(([v, n]) => `${v} ${n}`).join(', ')}. Länder: ${Object.entries(A.valuta_och_land.lander).map(([l, n]) => `${l} ${n}`).join(', ')}.`);
  rad.push(`- **Frakt:** fri frakt på ${A.frakt.ordrar_med_fri_frakt} ordrar (${A.frakt.andel_fri_frakt_pct} %), fraktintäkt ${f(A.frakt.fraktintakt_sek)} kr. Fraktrader: ${Object.entries(A.frakt.fraktrader).map(([t, n]) => `${t} ×${n}`).join(' · ')}.`);
  rad.push(`- **Återbetalningar:** ${A.aterbetalningar.ordrar_med_aterbetalning} ordrar (${A.aterbetalningar.andel_pct} %), ${f(A.aterbetalningar.belopp_sek)} kr (${A.aterbetalningar.andel_av_omsattning_pct} % av omsättningen), helt återbetalda ${A.aterbetalningar.helt_aterbetalda}.`);
  rad.push(`- **Återkommande kunder (reellt):** ${A.kunder.ordrar_fran_aterkommande} ordrar (${A.kunder.andel_aterkommande_pct} %), utan samma dygn ${A.kunder.ordrar_fran_aterkommande_utan_samma_dygn} (${A.kunder.andel_utan_samma_dygn_pct} %); ${A.kunder.unika_kunder_i_fonstret} unika kunder, ${A.kunder.kunder_med_fler_an_en_order_i_fonstret} med fler än en order i fönstret.`);
  rad.push(`- **Ordervärde per lådantal:** ${Object.entries(A.strumplador_per_order.ordervarde_per_lador).map(([n, v]) => `${n} lådor: ${v.ordrar} ordrar, AOV ${f(v.aov_sek)} kr, median ${f(v.median_sek)} kr (${v.andel_omsattning_pct} % av omsättningen)`).join(' · ')}.`);
  rad.push(`- **Taggar (topp):** ${Object.entries(A.taggar_och_attribut.taggar_topp).slice(0, 10).map(([t, n]) => `${t} ×${n}`).join(', ') || 'inga'}. Attributnycklar: ${Object.entries(A.taggar_och_attribut.attribut_nycklar).map(([k, n]) => `${k} ×${n}`).join(', ') || 'inga'}. Ordrar med upsell-/tacksidespår: ${A.taggar_och_attribut.ordrar_med_upsell_spar}. A/B-test i temat: ${Object.entries(A.taggar_och_attribut.ab_test_i_temat).map(([n, s]) => `${n} ${s.ordrar} ordrar, AOV ${f(s.aov_sek)} kr, ${s.snitt_lador} lådor`).join(' · ') || 'inget'}.`);
  rad.push('');
  rad.push('| Vecka | Ordrar | Omsättning kr | AOV kr |');
  rad.push('|---|---:|---:|---:|');
  for (const [v, w] of Object.entries(A.per_vecka)) rad.push(`| ${v} | ${w.ordrar} | ${f(w.omsattning_sek)} | ${f(w.aov_sek)} |`);
  rad.push('');
}
if (analys30) {
  const A = analys30; const bs = A.betalsatt.klassat; const n = (m) => bs[m]?.ordrar ?? 0;
  const kan = n('kort_shopify_payments') + n('shop_pay');
  const inte = n('klarna') + n('apple_pay') + n('google_pay') + n('paypal') + n('presentkort');
  const ovrigt = A.ordrar - kan - inte;
  rad.push('## Vem kan se one-click-sidan (Shopifys post-purchase-extension)');
  rad.push('');
  rad.push('Regeln ur shopify.dev → Apps → Checkout → "About product offers" → Limitations (läst 2026-09-30): sidan visas INTE när kunden betalar med avbetalning eller wallet (Klarna, Affirm, AfterPay, Apple Pay, Amazon Pay, Google Pay), med presentkort eller "annat betalsätt än kreditkort", vid tull eller flera valutor, local delivery eller annan kanal än Online Store. Shop Pay nämns bara med en Storage API-begränsning, så där visas sidan.');
  rad.push('');
  rad.push(`- **Kan se sidan (kort via Shopify Payments + Shop Pay): ${kan} av ${A.ordrar} ordrar = ${pct(kan, A.ordrar)} %.**`);
  rad.push(`- Kan inte se den: Klarna ${n('klarna')}, Apple Pay ${n('apple_pay')}, Google Pay ${n('google_pay')}, PayPal ${n('paypal')}${n('presentkort') ? `, presentkort ${n('presentkort')}` : ''} = ${inte} ordrar (${pct(inte, A.ordrar)} %).${ovrigt ? ` Oklassade: ${ovrigt}.` : ''}`);
  rad.push(`- Det betyder att ett post-purchase-test i en App Store-app når som mest var fjärde order. Utlandsordrar i annan valuta (0 av ${A.ordrar} i fönstret, allt är SEK/Sverige) skulle inte heller se den. Alternativet som når alla är tacksidan/orderstatussidan (checkout UI extension som i factory/tacksida/) — den visas oavsett betalsätt.`);
  rad.push('');
}
if (fraktprofiler) {
  rad.push('## Fraktzoner och priser i butiken');
  rad.push('');
  for (const p of fraktprofiler) for (const g of p.grupper) for (const z of g.zoner) rad.push(`- **${p.namn}${p.standard ? ' (standard)' : ''} → ${z.namn}** [${z.lander.join(', ')}]: ${z.metoder.map((m) => `${m.namn} ${m.pris}${m.villkor.length ? ` (${m.villkor.join(', ')})` : ''}${m.aktiv ? '' : ' [AV]'}`).join(' · ')}`);
  rad.push('');
}
if (kodrabatter) {
  rad.push(`## Rabatter i butiken (${kodrabatter.length} koder, ${autorabatter?.length ?? '—'} automatiska)`);
  rad.push('');
  rad.push('| Typ | Titel | Status | Koder (använda) | Kunden köper | Kunden får | Kombinerar med | Period |');
  rad.push('|---|---|---|---|---|---|---|---|');
  for (const r of [...(kodrabatter ?? []), ...(autorabatter ?? [])]) rad.push(`| ${r.typ} | ${r.titel} | ${r.status} | ${(r.koder ?? []).join(', ') || `auto (${r.anvandningar ?? '—'})`} | ${r.kunden_koper ? `${r.kunden_koper.varde} av ${JSON.stringify(r.kunden_koper.av)}` : r.minimikrav ?? '—'} | ${r.kunden_far ? `${JSON.stringify(r.kunden_far.varde)} på ${JSON.stringify(r.kunden_far.av)}` : r.app ? `app: ${r.app.titel}` : r.sammanfattning ?? '—'} | ${cw(r.kombinerar_med)} | ${(r.startar ?? '').slice(0, 10)} → ${(r.slutar ?? '').slice(0, 10) || 'tills vidare'} |`);
  rad.push('');
}
if (bogoDetalj) {
  rad.push('## De fyra BOGO-koderna i detalj');
  rad.push('');
  for (const [kod, r] of Object.entries(bogoDetalj)) {
    if (r.saknas) { rad.push(`- **${kod}:** ${r.saknas}`); continue; }
    rad.push(`- **${kod}** (${r.titel}, ${r.status}, ${r.anvandningar} användningar, ${r.en_gang_per_kund ? 'en gång per kund' : 'flera gånger per kund'}, max ${r.ganger_per_order ?? 'obegränsat'} gånger per order): kunden köper **${r.kunden_koper?.varde}** av ${JSON.stringify(r.kunden_koper?.av)} → får **${JSON.stringify(r.kunden_far?.varde)}** på ${JSON.stringify(r.kunden_far?.av)}. Kombinerar med: ${cw(r.kombinerar_med)}. ${r.startar?.slice(0, 10)} → ${r.slutar?.slice(0, 10) ?? 'tills vidare'}.`);
  }
  rad.push('');
}
if (produkter) {
  rad.push('## Produkter och priser');
  rad.push('');
  rad.push('| Produkt | Status | Variant | Pris | Jämförpris | Lager | Cost per item |');
  rad.push('|---|---|---|---:|---:|---:|---:|');
  for (const p of produkter) for (const v of p.varianter) rad.push(`| ${p.titel} | ${p.status} | ${v.titel} | ${v.pris} | ${v.jamforpris ?? '—'} | ${v.lager ?? '—'} | ${v.kostnad_per_artikel ?? 'saknas'} |`);
  const sushi = produkter.find((p) => p.handle === 'sushi-strumpor');
  if (sushi) rad.push(`\nSushi-Strumpor har **${sushi.antal_varianter} varianter**: ${sushi.varianter.map((v) => v.titel).join(', ')}.`);
  rad.push('');
}
if (appar) {
  rad.push(`## Installerade appar (${appar.length})`);
  rad.push('');
  rad.push(`Träffar på letade (AfterSell/Kaching/ReConvert/Zipify/Selleasy/Bundles/Volume/Trust/Judge.me …): ${apparTraff.length ? apparTraff.map((a) => `**${a.titel}** (${a.handle})`).join(', ') : 'inga'}.`);
  rad.push('');
  rad.push(`Alla: ${appar.map((a) => a.titel).join(' · ')}.`);
  rad.push('');
}
rad.push('## Kunde inte läsas');
rad.push('');
if (!kundeInte.length) rad.push('Allt gick att läsa.');
for (const ki of kundeInte) rad.push(`- **${ki.steg}:** ${ki.orsak}`);
rad.push('');
writeFileSync(UT_MD, rad.join('\n'));
console.log(rad.join('\n'));
logg(`\nSkrivet: ${UT_JSON}\n         ${UT_MD}`);
