// Värva en vän på Matstrumpor. Axels beställning 2026-09-30 (Ty Chapmans reel om
// Redeemly): "Kan du implementera detta på matstrumpor" → val "Egen, 50 kr / 100 kr".
//
// Flödet:
//   1. Tacksidan (checkout UI extension i matstrumpor/varva/app/) visar kunden en
//      länk: matstrumpor.se/?van=<kundens bekräftelsenummer>.
//   2. Vännen landar. Temats skript (assets/ms-varva.js) lägger vännens rabattkod
//      (50 kr, en gång per kund) i varukorgen och sätter varukorgsattributet
//      van=<nummer>, som följer med till ordern.
//   3. Det här skriptet läser vännernas ordrar varje timme (/sparning matstrumpor,
//      steg 2c — den rutinen bär butikens nycklar och är ENDA köraren). När
//      vännens FÖRSTA order är betald, skickad och inte återbetald, och vännen
//      inte är kunden själv, får kunden 100 kr i butikskredit (Shopifys egen, i
//      kundens valuta) och ett mejl från Shopify om det.
//
//   node matstrumpor/varva.mjs --kolla               # nycklar, rättigheter, koden, kombinationerna
//   node matstrumpor/varva.mjs --kod [--skarpt]      # vännens kod + paketkoderna öppnas för den (idempotent)
//   node matstrumpor/varva.mjs --aterstall --skarpt  # kombinationerna tillbaka som före --kod
//   node matstrumpor/varva.mjs --mat [--skriv]       # vännens rabatt i varje valuta, mätt i riktiga varukorgar
//   node matstrumpor/varva.mjs --bygg                # kortets och temats data ur konfig.json
//   node matstrumpor/varva.mjs --tema [--skarpt]     # temat: skriptet + raden i layouten (idempotent)
//   node matstrumpor/varva.mjs --kundvy              # landa som vän: sitter koden och attributet?
//   node matstrumpor/varva.mjs [--skarpt] [--json]   # krediteringen (torrt utan --skarpt)
//
// Bara Matstrumpor. Skriptet rör aldrig en annan butik, aldrig en annons, och
// betalar aldrig ut två gånger: minnet (varva/krediterat.jsonl) skrivs FÖRE
// krediten, och en rad som påbörjats men inte kvitterats prövas aldrig igen av
// sig själv — den rapporteras.

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

const HAR = dirname(fileURLToPath(import.meta.url));
export const ROT = join(HAR, '..');
export const MAPP = join(HAR, 'varva');
export const KONFIGFIL = join(MAPP, 'konfig.json');
export const LAGEFIL = join(MAPP, 'lage.json');
export const MINNESFIL = join(MAPP, 'krediterat.jsonl');
export const SPRAKFIL = join(MAPP, 'sprak.json');
export const TEMASKRIPT_KALLA = join(MAPP, 'ms-varva.js');
export const KORTDATA = join(MAPP, 'app', 'extensions', 'varva-kort', 'src', 'data.js');
export const KORTTEXTER = join(MAPP, 'app', 'extensions', 'varva-kort', 'src', 'texter.js');
export const KORTSPRAK = join(MAPP, 'app', 'extensions', 'varva-kort', 'locales');
export const KORTNYCKLAR = ['rubrik', 'text', 'lank', 'kopiera', 'kopierad', 'villkor'];
export const BUTIK_ID = 'matstrumpor';

export const TEMA_ASSET = 'assets/ms-varva.js';
export const LAYOUT = 'layout/theme.liquid';
export const LAYOUT_MARKOR = '<!-- ms-varva -->';

export const lasKonfig = (fil = KONFIGFIL) => JSON.parse(readFileSync(fil, 'utf8'));
export const lasLage = (fil = LAGEFIL) => (existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : {});

// ---------------------------------------------------------------------------
// Rena funktioner (testas i matstrumpor/test/varva.test.mjs)
// ---------------------------------------------------------------------------

export const numId = (gid) => String(gid ?? '').split('/').pop();
export const normEpost = (e) => String(e ?? '').trim().toLowerCase();

/** Gata + postnummer utan mellanslag och skiljetecken. Tom sträng om något saknas. */
export function normAdress(a) {
  const gata = String(a?.address1 ?? '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  const zip = String(a?.zip ?? '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
  return gata && zip ? `${gata}|${zip}` : '';
}

/** Bekräftelsenumret ur varukorgsattributet, eller null. Bara A–Z/0–9, 6–16 tecken. */
export function refUr(attribut, namn = 'van') {
  const v = (attribut ?? []).find((x) => x?.key === namn)?.value;
  const s = String(v ?? '').trim().toUpperCase();
  return /^[A-Z0-9]{6,16}$/.test(s) ? s : null;
}

/** En kort, stabil nyckel för en kund i minnet (inga e-postadresser i repot). */
export const kundnyckel = (gid) => (gid ? createHash('sha256').update(String(gid)).digest('hex').slice(0, 12) : null);

/** Minnet: en rad per försök. → { klara: Set(vänorder-id), paborjade: Set, perVarvare: Map(kundnyckel → antal klara) } */
export function lasMinne(text) {
  const rader = String(text ?? '').split('\n').filter((r) => r.trim()).map((r) => JSON.parse(r));
  const klara = new Set();
  const forsok = new Set();
  const perVarvare = new Map();
  for (const r of rader) {
    if (r.status === 'forsok') forsok.add(r.van_order);
    if (r.status === 'klar') {
      klara.add(r.van_order);
      perVarvare.set(r.varvare, (perVarvare.get(r.varvare) ?? 0) + 1);
    }
  }
  const paborjade = new Set([...forsok].filter((id) => !klara.has(id)));
  return { klara, paborjade, perVarvare };
}

/**
 * Domen över en väns order. Ren: allt den behöver skickas in.
 * → { beslut: 'kreditera' | 'vanta' | 'nej' | 'klar' | 'kolla', orsak, belopp?, valuta? }
 *   'vanta' = prövas igen nästa körning (inte skickad än). 'kolla' = kräver en människa.
 */
export function dom({ van, varvare, minne, konfig }) {
  const idV = numId(van?.id);
  if (minne.klara.has(idV) || (van?.tags ?? []).includes(konfig.tagg_krediterad)) return { beslut: 'klar', orsak: 'redan krediterad' };
  if (minne.paborjade.has(idV)) return { beslut: 'kolla', orsak: 'en kreditering påbörjades men kvitterades aldrig — kontrollera kundens butikskredit i Shopify innan något görs' };
  if (!varvare) return { beslut: 'nej', orsak: 'länkens bekräftelsenummer hör inte till någon order' };
  if (van.cancelledAt) return { beslut: 'nej', orsak: 'vännens order är avbruten' };
  if (Number(van.totalRefundedSet?.shopMoney?.amount ?? 0) > 0) return { beslut: 'nej', orsak: 'vännens order är (delvis) återbetald' };

  const vanKund = van.customer?.id ?? null;
  const varvKund = varvare.customer?.id ?? null;
  if (!varvKund) return { beslut: 'nej', orsak: 'värvarens order har ingen kund' };
  if (varvare.cancelledAt) return { beslut: 'nej', orsak: 'värvarens egen order är avbruten' };
  if (vanKund && vanKund === varvKund) return { beslut: 'nej', orsak: 'samma kund (egen länk)' };
  const eV = normEpost(van.email ?? van.customer?.email);
  const eW = normEpost(varvare.email ?? varvare.customer?.email);
  if (eV && eV === eW) return { beslut: 'nej', orsak: 'samma e-post (egen länk)' };
  const aV = normAdress(van.shippingAddress);
  if (aV && aV === normAdress(varvare.shippingAddress)) return { beslut: 'nej', orsak: 'samma leveransadress (egen länk)' };
  const forsta = van.customer?.orders?.nodes?.[0]?.id;
  if (!vanKund || !forsta || numId(forsta) !== idV) return { beslut: 'nej', orsak: 'inte vännens första köp' };
  if (new Date(van.createdAt) < new Date(varvare.createdAt)) return { beslut: 'nej', orsak: 'vännens order är äldre än länken' };
  // Först när det är klart VEM det gäller: är vännens köp betalt och skickat?
  if (van.displayFinancialStatus !== 'PAID') return { beslut: 'vanta', orsak: `vännens order är inte betald (${van.displayFinancialStatus})` };
  if (!['FULFILLED', 'PARTIALLY_FULFILLED'].includes(van.displayFulfillmentStatus)) return { beslut: 'vanta', orsak: 'vännens paket är inte skickat än' };

  const nyckel = kundnyckel(varvKund);
  if ((minne.perVarvare.get(nyckel) ?? 0) >= konfig.max_per_varvare) {
    return { beslut: 'nej', orsak: `värvaren har redan ${konfig.max_per_varvare} krediterade vänner (taket)` };
  }
  const valuta = varvare.presentmentCurrencyCode;
  const rad = konfig.valutor?.[valuta];
  if (!rad?.kredit) return { beslut: 'kolla', orsak: `ingen kredit satt för ${valuta} i konfig.json → valutor` };
  return { beslut: 'kreditera', orsak: 'vännens första köp är skickat', belopp: rad.kredit, valuta };
}

/** Är en rabatt "orderrabatt" som skulle börja kombineras med paketkoderna? */
export function oppenOrderrabatt(d, kod) {
  const klasser = d?.discountClasses ?? [];
  if (!klasser.includes('ORDER')) return false;
  if (!['ACTIVE', 'SCHEDULED'].includes(d?.status)) return false;
  if ((d?.codes?.nodes ?? []).some((c) => c.code === kod)) return false;
  return d?.combinesWith?.productDiscounts === true;
}

/** Vännens rabatt att VISA: Shopifys mätta belopp, golvat, med 1,5 % marginal för
 *  att kursen rör sig mellan mätningarna. Aldrig högre än det kassan ger.
 *  Japanska/kinesiska belopp får aldrig innehålla siffran 4 (Axels regel för JP/TW). */
export const KURSMARGINAL = 0.985;
export function visningsbelopp(matt, valuta, butiksvaluta = 'SEK') {
  // Butikens egen valuta räknas aldrig om: där är det mätta beloppet exakt.
  const n = Number(matt) * (valuta === butiksvaluta ? 1 : KURSMARGINAL);
  if (!Number.isFinite(n) || n <= 0) return null;
  const steg = n >= 1000 ? 100 : n >= 100 ? 10 : n >= 20 ? 1 : 0.5;
  let v = Math.round(Math.floor(n / steg) * steg * 100) / 100;
  if (['JPY', 'TWD', 'CNY', 'HKD'].includes(valuta)) while (v > 0 && String(v).includes('4')) v -= steg;
  return v > 0 ? v : null;
}

/** Ett runt belopp nära `mal` (100 kr omräknat). Aldrig siffran 4 i JPY/TWD. */
export function kreditbelopp(mal, valuta) {
  const n = Number(mal);
  if (!Number.isFinite(n) || n <= 0) return null;
  const steg = n >= 1000 ? 100 : n >= 200 ? 10 : n >= 30 ? 5 : 1;
  let v = Math.round(n / steg) * steg;
  if (['JPY', 'TWD', 'CNY', 'HKD'].includes(valuta)) while (String(v).includes('4')) v += steg;
  return v;
}

/** Kortets och temats data ur konfigen (ren). */
export function byggData(konfig) {
  const valutor = {};
  for (const [kod, r] of Object.entries(konfig.valutor ?? {})) {
    if (r?.van && r?.kredit) valutor[kod] = { van: r.van, kredit: r.kredit };
  }
  return { kod: konfig.kod, attribut: konfig.attribut, lankar: konfig.lankar, valutor };
}

export function kortdataJs(data) {
  return `// GENERERAD av \`node matstrumpor/varva.mjs --bygg\` ur matstrumpor/varva/konfig.json — ändra aldrig här.\nexport const DATA = ${JSON.stringify(data, null, 2)};\n`;
}

/** Kortets texter som JS: reserven när i18n.translate inte svarar (kundkontots
 *  orderstatussida, där Shopify skriver att i18n-hjälparna kan saknas). Samma
 *  nycklar som språkfilerna, ur samma sprak.json (ren). */
export function korttexterJs(sprak) {
  const t = {};
  for (const [kod, rad] of Object.entries(sprak)) t[kod] = Object.fromEntries(KORTNYCKLAR.map((n) => [n, rad[n]]));
  return `// GENERERAD av \`node matstrumpor/varva.mjs --bygg\` ur matstrumpor/varva/sprak.json — ändra aldrig här.\nexport const TEXTER = ${JSON.stringify(t, null, 2)};\n`;
}

/** Kortets språkfiler ur sprak.json: { 'sv.default.json': {...}, 'nb.json': {...} } (ren). */
export function kortSprakfiler(sprak) {
  const ut = {};
  for (const [kod, t] of Object.entries(sprak)) {
    const saknas = KORTNYCKLAR.filter((n) => !String(t?.[n] ?? '').trim());
    if (saknas.length) throw new Error(`sprak.json → ${kod} saknar ${saknas.join(', ')}`);
    ut[kod === 'sv' ? 'sv.default.json' : `${kod}.json`] = Object.fromEntries(KORTNYCKLAR.map((n) => [n, t[n]]));
  }
  return ut;
}

/** Temaskriptet: källan + datan inbakad. */
export function temaskript(kalla, data, sprak) {
  const text = {};
  for (const [s, t] of Object.entries(sprak)) text[s] = { valkommen: t.valkommen, stang: t.stang };
  // Ersättningen som funktion: en sträng med "$" hade tolkats som ett mönster av replace.
  const dataJson = JSON.stringify({ kod: data.kod, attribut: data.attribut, valutor: Object.fromEntries(Object.entries(data.valutor).map(([k, v]) => [k, v.van])) });
  return kalla
    .replace('/*__DATA__*/null', () => dataJson)
    .replace('/*__TEXT__*/null', () => JSON.stringify(text));
}

/** Raden i layouten, före </body>. Idempotent. */
export function laggInILayout(layout) {
  if (layout.includes(LAYOUT_MARKOR)) return layout;
  const rad = `${LAYOUT_MARKOR}<script src="{{ 'ms-varva.js' | asset_url }}" defer="defer"></script>\n`;
  const i = layout.lastIndexOf('</body>');
  if (i < 0) throw new Error(`${LAYOUT} saknar </body>.`);
  return layout.slice(0, i) + rad + layout.slice(i);
}

// ---------------------------------------------------------------------------
// Shopify
// ---------------------------------------------------------------------------

async function klientFor(konfig) {
  const { lasButik, losNycklarFor } = await import('../sparning/butik.mjs');
  const butik = lasButik(BUTIK_ID);
  const k = await losNycklarFor(butik);
  if (!k.clientId || !k.clientSecret) throw new Error('Matstrumpor: SHOPIFY_CLIENT_ID/SECRET_1r46tp_qx saknas i miljön.');
  const tr = await fetch(`https://${k.shop}/admin/oauth/access_token`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: k.clientId, client_secret: k.clientSecret, grant_type: 'client_credentials' }),
  });
  const t = await tr.json().catch(() => ({}));
  if (!t.access_token) throw new Error(`Matstrumpor: kunde inte minta token (${tr.status}).`);
  const graphql = async (query, variables = {}) => {
    for (let forsok = 0; ; forsok++) {
      const svar = await fetch(`https://${k.shop}/admin/api/${konfig.api_version}/graphql.json`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': t.access_token },
        body: JSON.stringify({ query, variables }),
      });
      if (svar.status === 429 && forsok < 4) { await new Promise((r) => setTimeout(r, 2000 * (forsok + 1))); continue; }
      if (!svar.ok) throw new Error(`Shopify svarade ${svar.status}: ${(await svar.text()).slice(0, 300)}`);
      const j = await svar.json();
      if (j.errors?.some((e) => e.extensions?.code === 'THROTTLED') && forsok < 4) { await new Promise((r) => setTimeout(r, 2000 * (forsok + 1))); continue; }
      if (j.errors) throw new Error(`GraphQL-fel: ${JSON.stringify(j.errors).slice(0, 500)}`);
      return j.data;
    }
  };
  return { shop: k.shop, graphql };
}

const RABATT_FALT = `
  __typename
  ... on DiscountCodeBasic { title status discountClasses appliesOncePerCustomer combinesWith { orderDiscounts productDiscounts shippingDiscounts }
    codes(first: 5) { nodes { code } }
    minimumRequirement { __typename ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount } } }
    customerGets { value { __typename ... on DiscountAmount { amount { amount currencyCode } appliesOnEachItem } } items { __typename ... on AllDiscountItems { allItems } } } }
  ... on DiscountCodeBxgy { title status discountClasses combinesWith { orderDiscounts productDiscounts shippingDiscounts } codes(first: 5) { nodes { code } } }
  ... on DiscountCodeFreeShipping { title status discountClasses combinesWith { orderDiscounts productDiscounts shippingDiscounts } codes(first: 5) { nodes { code } } }`;

async function allaKodrabatter(klient) {
  const ut = [];
  let c = null;
  do {
    const d = await klient.graphql(`query($c: String) { codeDiscountNodes(first: 100, after: $c) { pageInfo { hasNextPage endCursor } nodes { id codeDiscount { ${RABATT_FALT} } } } }`, { c });
    ut.push(...d.codeDiscountNodes.nodes.map((n) => ({ id: n.id, ...n.codeDiscount })));
    c = d.codeDiscountNodes.pageInfo.hasNextPage ? d.codeDiscountNodes.pageInfo.endCursor : null;
  } while (c);
  return ut;
}

async function allaAutomatiska(klient) {
  const d = await klient.graphql(`{ automaticDiscountNodes(first: 50) { nodes { id automaticDiscount { __typename
    ... on DiscountAutomaticBasic { title status discountClasses combinesWith { orderDiscounts productDiscounts shippingDiscounts } }
    ... on DiscountAutomaticBxgy { title status discountClasses combinesWith { orderDiscounts productDiscounts shippingDiscounts } } } } } }`);
  return d.automaticDiscountNodes.nodes.map((n) => ({ id: n.id, ...n.automaticDiscount }));
}

/** Vad --kod skulle göra (ren, ur listorna). */
export function planKod({ koder, automatiska, konfig }) {
  const re = new RegExp(konfig.paketkoder_monster);
  const van = koder.find((d) => (d.codes?.nodes ?? []).some((c) => c.code === konfig.kod)) ?? null;
  const paket = koder.filter((d) => d.__typename === 'DiscountCodeBxgy' && ['ACTIVE', 'SCHEDULED'].includes(d.status)
    && (d.codes?.nodes ?? []).some((c) => re.test(c.code)));
  const oppna = paket.filter((d) => d.combinesWith?.orderDiscounts !== true);
  const stang = [...koder, ...automatiska].filter((d) => oppenOrderrabatt(d, konfig.kod));
  return { van, paket, oppna, stang };
}

const vanInput = (konfig) => ({
  title: konfig.kod_titel,
  code: konfig.kod,
  startsAt: new Date().toISOString(),
  customerSelection: { all: true },
  customerGets: { value: { discountAmount: { amount: String(konfig.van_belopp_sek), appliesOnEachItem: false } }, items: { all: true } },
  minimumRequirement: { subtotal: { greaterThanOrEqualToSubtotal: String(konfig.minsta_ordervarde_sek) } },
  appliesOncePerCustomer: true,
  combinesWith: { orderDiscounts: false, productDiscounts: true, shippingDiscounts: true },
});

/** Stämmer den befintliga koden med konfigen? → lista med avvikelser */
export function avvikelserVan(d, konfig) {
  const fel = [];
  if (!d) return ['koden finns inte'];
  if (d.status !== 'ACTIVE') fel.push(`status ${d.status}`);
  const v = d.customerGets?.value;
  if (v?.__typename !== 'DiscountAmount' || Number(v.amount?.amount) !== konfig.van_belopp_sek || v.appliesOnEachItem) fel.push('beloppet');
  if (d.customerGets?.items?.__typename !== 'AllDiscountItems') fel.push('varorna (ska vara alla)');
  if (!d.appliesOncePerCustomer) fel.push('en gång per kund');
  if (Number(d.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount) !== konfig.minsta_ordervarde_sek) fel.push('minsta ordervärde');
  const k = d.combinesWith ?? {};
  if (k.orderDiscounts !== false || k.productDiscounts !== true || k.shippingDiscounts !== true) fel.push('kombinationerna');
  return fel;
}

async function uppdateraKombination(klient, d, combinesWith) {
  const mut = {
    DiscountCodeBxgy: ['discountCodeBxgyUpdate', 'bxgyCodeDiscount', 'DiscountCodeBxgyInput!'],
    DiscountCodeBasic: ['discountCodeBasicUpdate', 'basicCodeDiscount', 'DiscountCodeBasicInput!'],
    DiscountCodeFreeShipping: ['discountCodeFreeShippingUpdate', 'freeShippingCodeDiscount', 'DiscountCodeFreeShippingInput!'],
    DiscountAutomaticBasic: ['discountAutomaticBasicUpdate', 'automaticBasicDiscount', 'DiscountAutomaticBasicInput!'],
    DiscountAutomaticBxgy: ['discountAutomaticBxgyUpdate', 'automaticBxgyDiscount', 'DiscountAutomaticBxgyInput!'],
  }[d.__typename];
  if (!mut) throw new Error(`kan inte uppdatera ${d.__typename}`);
  const [namn, arg, typ] = mut;
  const r = await klient.graphql(`mutation($id: ID!, $in: ${typ}) { ${namn}(id: $id, ${arg}: $in) { userErrors { field message } } }`, { id: d.id, in: { combinesWith } });
  const fel = r[namn]?.userErrors ?? [];
  if (fel.length) throw new Error(`${namn} (${d.title}): ${fel.map((e) => e.message).join('; ')}`);
}

async function kodSteg(klient, konfig, { skarpt, aterstall = false, logg = console.log }) {
  const lage = lasLage();
  const [koder, automatiska] = await Promise.all([allaKodrabatter(klient), allaAutomatiska(klient)]);

  if (aterstall) {
    const lista = lage.aterstall ?? [];
    if (!lista.length) { logg('  inget att återställa (lage.json → aterstall är tom)'); return; }
    for (const r of lista) {
      const d = [...koder, ...automatiska].find((x) => x.id === r.id);
      if (!d) { logg(`  ⚠️ ${r.titel}: finns inte längre, hoppas`); continue; }
      logg(`  ${r.titel}: tillbaka till ${JSON.stringify(r.fore)}`);
      if (skarpt) await uppdateraKombination(klient, d, r.fore);
    }
    if (!skarpt) { logg('  torrt: inget skrivet. Kör --aterstall --skarpt.'); return; }
    logg('  ✓ återställt. Vännens kod ligger kvar men kombineras inte längre med paketen.');
    writeFileSync(LAGEFIL, JSON.stringify({ ...lage, aterstall: [], aterstallt: new Date().toISOString() }, null, 1) + '\n');
    return;
  }

  const plan = planKod({ koder, automatiska, konfig });
  const fel = avvikelserVan(plan.van, konfig);
  logg(`  vännens kod ${konfig.kod}: ${plan.van ? (fel.length ? `finns, avviker: ${fel.join(', ')}` : 'finns och stämmer') : 'saknas, skapas'}`);
  logg(`  paketkoder: ${plan.paket.length} st, ${plan.oppna.length} ska öppnas för orderrabatter`);
  for (const d of plan.oppna) logg(`    • ${d.title} (${d.codes.nodes.map((c) => c.code).join(', ')})`);
  logg(`  andra orderrabatter som annars börjar kombineras med paketen: ${plan.stang.length ? plan.stang.map((d) => d.title).join(', ') : 'inga'}`);
  if (!skarpt) { logg('  torrt: inget skrivet. Kör --kod --skarpt.'); return plan; }

  // Minnet för återställningen skrivs FÖRST, och ett original skrivs aldrig över.
  const aterstallning = [...(lage.aterstall ?? [])];
  const har = new Set(aterstallning.map((r) => r.id));
  for (const d of [...plan.oppna, ...plan.stang]) {
    if (!har.has(d.id)) aterstallning.push({ id: d.id, titel: d.title, typ: d.__typename, fore: d.combinesWith });
  }
  writeFileSync(LAGEFIL, JSON.stringify({ ...lage, aterstall: aterstallning }, null, 1) + '\n');

  // 1. Stäng produktkombinationen på andra öppna orderrabatter (inget nytt får börja kombineras).
  for (const d of plan.stang) await uppdateraKombination(klient, d, { ...d.combinesWith, productDiscounts: false });
  // 2. Vännens kod.
  if (!plan.van) {
    const r = await klient.graphql(`mutation($in: DiscountCodeBasicInput!) { discountCodeBasicCreate(basicCodeDiscount: $in) { codeDiscountNode { id } userErrors { field message } } }`, { in: vanInput(konfig) });
    const e = r.discountCodeBasicCreate.userErrors;
    if (e.length) throw new Error(`discountCodeBasicCreate: ${e.map((x) => x.message).join('; ')}`);
  } else if (fel.length) {
    const { startsAt, code, ...resten } = vanInput(konfig);
    const r = await klient.graphql(`mutation($id: ID!, $in: DiscountCodeBasicInput!) { discountCodeBasicUpdate(id: $id, basicCodeDiscount: $in) { userErrors { field message } } }`, { id: plan.van.id, in: resten });
    const e = r.discountCodeBasicUpdate.userErrors;
    if (e.length) throw new Error(`discountCodeBasicUpdate: ${e.map((x) => x.message).join('; ')}`);
  }
  // 3. Paketkoderna öppnas för orderrabatter (allt annat i kombinationen orört).
  for (const d of plan.oppna) await uppdateraKombination(klient, d, { ...d.combinesWith, orderDiscounts: true });

  // Tillbakaläsning: allt måste stå som planen säger.
  const [k2, a2] = await Promise.all([allaKodrabatter(klient), allaAutomatiska(klient)]);
  const efter = planKod({ koder: k2, automatiska: a2, konfig });
  const kvar = avvikelserVan(efter.van, konfig);
  if (kvar.length) throw new Error(`vännens kod lästes tillbaka fel: ${kvar.join(', ')}`);
  if (efter.oppna.length) throw new Error(`${efter.oppna.length} paketkoder är fortfarande stängda efter uppdateringen.`);
  if (efter.stang.length) throw new Error(`${efter.stang.map((d) => d.title).join(', ')} kombineras fortfarande med produktrabatter.`);
  writeFileSync(LAGEFIL, JSON.stringify({ ...lasLage(), kod_id: efter.van.id, kod_skapad: lage.kod_skapad ?? new Date().toISOString(), aterstall: aterstallning }, null, 1) + '\n');
  logg(`  ✓ tillbakaläst: ${konfig.kod} stämmer, ${efter.paket.length} paketkoder tar emot orderrabatter, inga andra orderrabatter kombineras med dem`);
  return efter;
}

// ---------------------------------------------------------------------------
// Varukorgar som kund (mätningen och kundvyn). Egen kakburk, inga bibliotek.
// ---------------------------------------------------------------------------

function kakburk() {
  const kakor = new Map();
  const spara = (svar) => {
    for (const s of svar.headers.getSetCookie?.() ?? []) {
      const [par] = s.split(';');
      const i = par.indexOf('=');
      if (i > 0) kakor.set(par.slice(0, i).trim(), par.slice(i + 1).trim());
    }
  };
  const hamta = async (url, init = {}) => {
    let u = url;
    for (let hopp = 0; hopp < 8; hopp++) {
      const svar = await fetch(u, { ...init, redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (matstrumpor varva)', Accept: 'application/json,text/html', ...(init.headers ?? {}), Cookie: [...kakor].map(([k, v]) => `${k}=${v}`).join('; ') } });
      spara(svar);
      if (svar.status === 429 && hopp < 5) { await new Promise((r) => setTimeout(r, 4000 * (hopp + 1))); continue; }
      const plats = svar.headers.get('location');
      if (svar.status >= 300 && svar.status < 400 && plats) {
        u = new URL(plats, u).toString();
        init = { method: 'GET' };
        continue;
      }
      return svar;
    }
    throw new Error(`för många omdirigeringar från ${url}`);
  };
  return { hamta, kakor };
}

/** En varukorg i landet, en vara, vännens kod → { valuta, rabatt, tillampas, total } */
export async function matLand({ land, bas, kod, variant, extra = [], extraKod = null }) {
  const { hamta } = kakburk();
  // ?country= räcker inte för varukorgen (containern står i USA och kakan följer
  // geo-IP:n, mätt 2026-09-30: alla länder gav USD). Shopifys eget landformulär gör det.
  await hamta(`${bas}/localization`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `form_type=localization&utf8=%E2%9C%93&_method=put&return_to=%2F&country_code=${land}` });
  const add = await hamta(`${bas}/cart/add.js`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: variant, quantity: 1 }, ...extra] }) });
  if (!add.ok) throw new Error(`${land}: cart/add svarade ${add.status}`);
  if (extraKod) await hamta(`${bas}/discount/${encodeURIComponent(extraKod)}?redirect=/cart.js`);
  await hamta(`${bas}/discount/${encodeURIComponent(kod)}?redirect=/cart.js`);
  const vagn = await (await hamta(`${bas}/cart.js`)).json();
  const koder = Object.fromEntries((vagn.discount_codes ?? []).map((d) => [d.code, d.applicable]));
  // Vännens del av rabatten: rabatten på ordernivå (cart_level_discount_applications).
  const vanDel = (vagn.cart_level_discount_applications ?? []).filter((a) => a.title === kod || a.discount_application?.title === kod)
    .reduce((s, a) => s + Number(a.total_allocated_amount ?? 0), 0);
  return { land, valuta: vagn.currency, rabatt: vanDel / 100, total_rabatt: vagn.total_discount / 100, koder, total: vagn.total_price / 100 };
}

// ---------------------------------------------------------------------------
// Krediteringen
// ---------------------------------------------------------------------------

const ORDER_FALT = `id name createdAt cancelledAt confirmationNumber presentmentCurrencyCode displayFinancialStatus displayFulfillmentStatus
  tags email totalRefundedSet { shopMoney { amount } } shippingAddress { address1 zip }`;

async function kandidater(klient, konfig, dagar) {
  const fran = new Date(Date.now() - dagar * 864e5).toISOString().slice(0, 10);
  const ut = [];
  let lackor = 0;
  let c = null;
  do {
    const d = await klient.graphql(`query($c: String, $q: String) { orders(first: 250, after: $c, query: $q, sortKey: CREATED_AT) { pageInfo { hasNextPage endCursor } nodes { id customAttributes { key value } discountCodes } } }`, { c, q: `created_at:>=${fran}` });
    for (const o of d.orders.nodes) {
      const ref = refUr(o.customAttributes, konfig.attribut);
      if (ref) ut.push({ id: o.id, ref });
      else if ((o.discountCodes ?? []).includes(konfig.kod)) lackor++;
    }
    c = d.orders.pageInfo.hasNextPage ? d.orders.pageInfo.endCursor : null;
  } while (c);
  return { kandidater: ut, lackor };
}

async function vanOrder(klient, id) {
  const d = await klient.graphql(`query($id: ID!) { order(id: $id) { ${ORDER_FALT} customer { id email orders(first: 1, sortKey: CREATED_AT) { nodes { id } } } } }`, { id });
  return d.order;
}

async function varvarOrder(klient, ref) {
  const d = await klient.graphql(`query($q: String) { orders(first: 2, query: $q) { nodes { ${ORDER_FALT} customer { id email } } } }`, { q: `confirmation_number:${ref}` });
  return (d.orders.nodes ?? []).find((o) => String(o.confirmationNumber).toUpperCase() === ref) ?? null;
}

async function kreditera(klient, konfig, { kund, belopp, valuta }) {
  const r = await klient.graphql(`mutation($id: ID!, $in: StoreCreditAccountCreditInput!) { storeCreditAccountCredit(id: $id, creditInput: $in) {
    storeCreditAccountTransaction { id amount { amount currencyCode } account { id balance { amount currencyCode } } } userErrors { field message code } } }`,
  { id: kund, in: { creditAmount: { amount: String(belopp), currencyCode: valuta }, notify: konfig.notify === true } });
  const e = r.storeCreditAccountCredit.userErrors;
  if (e.length) throw new Error(`storeCreditAccountCredit: ${e.map((x) => `${x.code ?? ''} ${x.message}`).join('; ')}`);
  return r.storeCreditAccountCredit.storeCreditAccountTransaction;
}

export async function kor({ skarpt = false, dagar = null, logg = console.log } = {}) {
  const konfig = lasKonfig();
  const klient = await klientFor(konfig);
  const minne = lasMinne(existsSync(MINNESFIL) ? readFileSync(MINNESFIL, 'utf8') : '');
  const { kandidater: lista, lackor } = await kandidater(klient, konfig, dagar ?? konfig.dagar_bakat);
  const utfall = { kandidater: lista.length, krediterade: [], vantar: [], nej: [], kolla: [], klara: 0, lackor };
  for (const k of lista) {
    const van = await vanOrder(klient, k.id);
    const varvare = await varvarOrder(klient, k.ref);
    const d = dom({ van, varvare, minne, konfig });
    const rad = { van: van?.name, varvare: varvare?.name ?? `(${k.ref})`, orsak: d.orsak };
    if (d.beslut === 'klar') { utfall.klara++; continue; }
    if (d.beslut === 'vanta') { utfall.vantar.push(rad); continue; }
    if (d.beslut === 'nej') { utfall.nej.push(rad); continue; }
    if (d.beslut === 'kolla') { utfall.kolla.push(rad); continue; }
    // kreditera
    if (!skarpt) { utfall.krediterade.push({ ...rad, belopp: d.belopp, valuta: d.valuta, torrt: true }); continue; }
    const post = { van_order: numId(van.id), van_namn: van.name, varvare_order: numId(varvare.id), varvare_namn: varvare.name, varvare: kundnyckel(varvare.customer.id), belopp: d.belopp, valuta: d.valuta };
    appendFileSync(MINNESFIL, JSON.stringify({ ...post, status: 'forsok', tid: new Date().toISOString() }) + '\n');
    const tx = await kreditera(klient, konfig, { kund: varvare.customer.id, belopp: d.belopp, valuta: d.valuta });
    appendFileSync(MINNESFIL, JSON.stringify({ ...post, status: 'klar', transaktion: numId(tx?.id), tid: new Date().toISOString() }) + '\n');
    minne.klara.add(post.van_order);
    minne.perVarvare.set(post.varvare, (minne.perVarvare.get(post.varvare) ?? 0) + 1);
    const t = await klient.graphql(`mutation($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { message } } }`, { id: van.id, tags: [konfig.tagg_krediterad] });
    if (t.tagsAdd.userErrors.length) logg(`  ⚠️ ${van.name}: taggen gick inte att sätta (${t.tagsAdd.userErrors[0].message}) — minnet håller ändå`);
    utfall.krediterade.push({ ...rad, belopp: d.belopp, valuta: d.valuta, saldo: tx?.account?.balance });
  }
  return utfall;
}

export function rapportRader(u, { skarpt }) {
  const r = [];
  r.push(`Värva en vän: ${u.kandidater} vänorder med länk senaste perioden, ${u.klara} redan krediterade.`);
  for (const k of u.krediterade) r.push(`  ${skarpt ? '✓ krediterat' : '(torrt) hade krediterat'} ${k.belopp} ${k.valuta} till köparen av ${k.varvare} (vännens order ${k.van})`);
  if (u.vantar.length) r.push(`  väntar (prövas nästa timme): ${u.vantar.map((x) => `${x.van} (${x.orsak})`).join('; ')}`);
  if (u.nej.length) r.push(`  ingen kredit: ${u.nej.map((x) => `${x.van} (${x.orsak})`).join('; ')}`);
  if (u.kolla.length) r.push(`  ⚠️ kräver en människa: ${u.kolla.map((x) => `${x.van}: ${x.orsak}`).join('; ')}`);
  if (u.lackor) r.push(`  ⚠️ vännens kod användes ${u.lackor} gång(er) utan länk — koden kan ha läckt. Många ⇒ byt kod (konfig.json → kod).`);
  return r;
}

// ---------------------------------------------------------------------------
// Temat
// ---------------------------------------------------------------------------

async function skrivTema(klient, konfig, { skarpt, logg = console.log }) {
  const data = byggData(konfig);
  if (!Object.keys(data.valutor).length) throw new Error('konfig.json → valutor är tom. Kör --mat --skriv först.');
  const sprak = JSON.parse(readFileSync(SPRAKFIL, 'utf8'));
  const skript = temaskript(readFileSync(TEMASKRIPT_KALLA, 'utf8'), data, sprak);
  const t = await klient.graphql('{ themes(first: 5, roles: [MAIN]) { nodes { id name role } } }');
  const tema = t.themes.nodes.find((x) => x.role === 'MAIN');
  if (!tema) throw new Error('hittar inget publicerat tema.');
  const las = async (namn) => {
    const d = await klient.graphql(`query($id: ID!, $n: [String!]) { theme(id: $id) { files(filenames: $n, first: 5) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: tema.id, n: namn });
    return Object.fromEntries(d.theme.files.nodes.map((f) => [f.filename, f.body?.content ?? null]));
  };
  const fore = await las([TEMA_ASSET, LAYOUT]);
  if (fore[LAYOUT] == null) throw new Error(`${LAYOUT} finns inte i temat.`);
  const filer = [];
  if (fore[TEMA_ASSET] !== skript) filer.push({ filename: TEMA_ASSET, body: { type: 'TEXT', value: skript } });
  const layout = laggInILayout(fore[LAYOUT]);
  if (layout !== fore[LAYOUT]) filer.push({ filename: LAYOUT, body: { type: 'TEXT', value: layout } });
  logg(`  tema "${tema.name}": ${filer.length ? filer.map((f) => f.filename).join(', ') + ' skrivs' : 'står redan rätt'}`);
  if (!filer.length || !skarpt) { if (filer.length) logg('  torrt: inget skrivet. Kör --tema --skarpt.'); return; }
  // Skriptet först, sedan layouten: annars pekar layouten en stund på en fil som inte finns.
  for (const f of filer) {
    const u = await klient.graphql(`mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { userErrors { filename message } } }`, { id: tema.id, files: [f] });
    if (u.themeFilesUpsert.userErrors.length) throw new Error(`themeFilesUpsert ${f.filename}: ${u.themeFilesUpsert.userErrors.map((e) => e.message).join('; ')}`);
  }
  // Shopify kan svara med den gamla filen en kort stund efter skrivningen (mätt
  // 2026-10-01: första läsningen gammal, en läsning sekunder senare rätt).
  let fel = filer;
  for (let forsok = 0; fel.length && forsok < 5; forsok++) {
    if (forsok) await new Promise((r) => setTimeout(r, 3000));
    const efter = await las(filer.map((f) => f.filename));
    fel = filer.filter((f) => efter[f.filename] !== f.body.value);
  }
  for (const f of fel) throw new Error(`${f.filename} lästes tillbaka med annat innehåll (fem läsningar).`);
  logg(`  ✓ ${filer.map((f) => f.filename).join(', ')} skrivna och tillbakalästa`);
}

// ---------------------------------------------------------------------------

async function main() {
  (await import('../mejl/shopify.mjs')).kravProxy();
  const arg = process.argv.slice(2);
  const har = (f) => arg.includes(f);
  const varde = (f) => { const i = arg.indexOf(f); return i > -1 ? arg[i + 1] : null; };
  const skarpt = har('--skarpt');
  const konfig = lasKonfig();

  if (har('--bygg')) {
    const data = byggData(konfig);
    if (!Object.keys(data.valutor).length) throw new Error('konfig.json → valutor är tom. Kör --mat --skriv först.');
    const sprak = JSON.parse(readFileSync(SPRAKFIL, 'utf8'));
    const utanText = Object.keys(data.lankar).filter((s) => !sprak[s]);
    if (utanText.length) throw new Error(`sprak.json saknar ${utanText.join(', ')} — kortet hade visat nycklar i stället för text.`);
    mkdirSync(dirname(KORTDATA), { recursive: true });
    writeFileSync(KORTDATA, kortdataJs(data));
    writeFileSync(KORTTEXTER, korttexterJs(sprak));
    mkdirSync(KORTSPRAK, { recursive: true });
    const filer = kortSprakfiler(sprak);
    for (const [namn, innehall] of Object.entries(filer)) writeFileSync(join(KORTSPRAK, namn), JSON.stringify(innehall, null, 2) + '\n');
    console.log(`✓ ${KORTDATA.replace(ROT + '/', '')}: kod ${data.kod}, ${Object.keys(data.valutor).length} valutor, ${Object.keys(data.lankar).length} språk`);
    console.log(`✓ ${Object.keys(filer).length} språkfiler i ${KORTSPRAK.replace(ROT + '/', '')}`);
    return;
  }

  const klient = await klientFor(konfig);

  if (har('--kolla')) {
    const s = await klient.graphql('{ currentAppInstallation { accessScopes { handle } } }');
    const scopes = s.currentAppInstallation.accessScopes.map((x) => x.handle);
    for (const krav of ['read_orders', 'write_orders', 'write_discounts', 'write_store_credit_account_transactions', 'write_themes']) {
      console.log(`  ${scopes.includes(krav) ? '✓' : '❌'} ${krav}`);
    }
    await kodSteg(klient, konfig, { skarpt: false });
    const saknas = Object.entries(konfig.valutor ?? {}).filter(([, r]) => !r.van || !r.kredit).map(([k]) => k);
    console.log(`  valutor: ${Object.keys(konfig.valutor ?? {}).length} i konfigen${saknas.length ? `, ofullständiga: ${saknas.join(', ')}` : ''}`);
    return;
  }
  if (har('--kod') || har('--aterstall')) {
    console.log(har('--aterstall') ? 'Återställer kombinationerna' : 'Vännens kod och paketkoderna');
    await kodSteg(klient, konfig, { skarpt, aterstall: har('--aterstall') });
    return;
  }
  if (har('--mat')) {
    const varianter = { sushi5: 52506473365843, pinnar: 52940241207635 };
    const lage = lasLage();
    const matt = {};
    for (const [valuta, r] of Object.entries(konfig.valutor ?? {})) {
      const bas = r.land === 'SE' ? 'https://matstrumpor.se' : 'https://matstrumpor.com';
      try {
        const m = await matLand({ land: r.land, bas, kod: konfig.kod, variant: varianter.sushi5 });
        matt[valuta] = m;
        console.log(`  ${valuta} (${r.land}): kassan ger ${m.rabatt} ${m.valuta}${m.valuta !== valuta ? ` ⚠️ fel valuta` : ''} · koden ${m.koder[konfig.kod] ? 'gäller' : 'GÄLLER INTE'}`);
      } catch (e) { console.log(`  ${valuta}: ❌ ${e.message}`); }
    }
    // Kombinationen: paketet + vännens kod i samma varukorg (Sverige).
    const p = await matLand({ land: 'SE', bas: 'https://matstrumpor.se', kod: konfig.kod, variant: varianter.sushi5, extra: [{ id: varianter.sushi5, quantity: 1 }, { id: varianter.pinnar, quantity: 2 }], extraKod: 'SUSHI-K1F1' });
    console.log(`  SE paket + vän: koder ${JSON.stringify(p.koder)}, rabatt totalt ${p.total_rabatt} ${p.valuta}, varav vännens ${p.rabatt}, att betala ${p.total}`);
    if (har('--skriv')) {
      for (const [valuta, m] of Object.entries(matt)) {
        if (m.valuta !== valuta || !m.koder[konfig.kod] || !(m.rabatt > 0)) continue;
        konfig.valutor[valuta].matt = m.rabatt;
        konfig.valutor[valuta].van = visningsbelopp(m.rabatt, valuta);
        konfig.valutor[valuta].kredit ??= kreditbelopp(m.rabatt * (konfig.kredit_belopp_sek / konfig.van_belopp_sek), valuta);
      }
      konfig.valutor_matta = new Date().toISOString().slice(0, 10);
      writeFileSync(KONFIGFIL, JSON.stringify(konfig, null, 1) + '\n');
      writeFileSync(LAGEFIL, JSON.stringify({ ...lage, matning: { tid: new Date().toISOString(), matt, paket_och_van: p } }, null, 1) + '\n');
      console.log('  ✓ konfig.json → valutor uppdaterad (van = golvat mätt belopp; kredit sätts bara där den saknas)');
    }
    return;
  }
  if (har('--tema')) {
    await skrivTema(klient, konfig, { skarpt });
    return;
  }
  if (har('--kundvy')) {
    const r = konfig.valutor.SEK;
    if (!r) throw new Error('SEK saknas i konfigen.');
    console.log('  Kundvyn kräver en webbläsare (skriptet körs i sidan): node matstrumpor/varva/kundvy.mjs');
    return;
  }

  const dagar = varde('--dagar') ? Number(varde('--dagar')) : null;
  const u = await kor({ skarpt, dagar });
  if (har('--json')) console.log(JSON.stringify(u, null, 1));
  else for (const r of rapportRader(u, { skarpt })) console.log(r);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((e) => { console.error(`FEL: ${e.message}`); process.exit(1); });
}
