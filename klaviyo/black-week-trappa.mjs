// Black Week-trappan som tre schemalagda automatiska rabatter i en butiks Shopify.
//
//   node klaviyo/black-week-trappa.mjs --butik carashell          # torrt: visar vad som finns och vad som skulle skapas
//   node klaviyo/black-week-trappa.mjs --butik carashell --ja     # skapar det som saknas och läser tillbaka
//
// Samma trappa som Bäverbutiken och Matstrumpor (Axels beslut 2026-09-25, avläst
// ur Matstrumpors Shopify 2026-09-26: DiscountAutomaticBasic, 10 % vid minst 1
// vara, 20 % vid 2, 30 % vid 3, alla produkter, bara engångsköp, kombineras
// bara med fraktrabatter, 2026-11-22T23:00Z till 2026-11-30T23:00Z = måndag
// 23/11 00:00 till och med måndag 30/11 svensk tid). Rabatterna kombineras inte
// med varandra, så kassan ger den största som varukorgen når.
//
// Titeln syns för kunden i kassan. En flerspråkig butik (CaraShell: sv, nb, en)
// får en titel utan svenska ord: "Black Week 10 %".
//
// Idempotent: en nivå vars titel redan finns skapas aldrig igen. Butikens
// nycklar är sparning/butik.mjs skapaKlient() (registret sparning/butiker.json).
// Axels beslut krävs innan --ja körs: rabatter i Shopify är ägarens (CLAUDE.md regel 12).

import fs from 'node:fs';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';

// klaviyo/brands/<id>.json när butiken har en mejlbrandfil (flersprakig: true ⇒ titel utan svenska ord).
function lasBrandOmFinns(id) {
  const f = new URL(`./brands/${id}.json`, import.meta.url);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

export const TRAPPA = [
  { antal: 1, procent: 10 },
  { antal: 2, procent: 20 },
  { antal: 3, procent: 30 },
];
export const START = '2026-11-22T23:00:00Z';
export const SLUT = '2026-11-30T23:00:00Z';

export function titel(niva, flersprakig) {
  return flersprakig
    ? `Black Week ${niva.procent} %`
    : `Black Week 2026: ${niva.procent} % vid ${niva.antal === 1 ? '1 vara' : niva.antal === 3 ? '3+ varor' : `${niva.antal} varor`}`;
}

export function indata(niva, flersprakig) {
  return {
    title: titel(niva, flersprakig),
    startsAt: START,
    endsAt: SLUT,
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
    minimumRequirement: { quantity: { greaterThanOrEqualToQuantity: String(niva.antal) } },
    customerGets: { value: { percentage: niva.procent / 100 }, items: { all: true } },
  };
}

const LAS = `query { automaticDiscountNodes(first: 100) { edges { node { id automaticDiscount { __typename
  ... on DiscountAutomaticBasic { title status startsAt endsAt
    combinesWith { orderDiscounts productDiscounts shippingDiscounts }
    minimumRequirement { ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity } }
    customerGets { value { ... on DiscountPercentage { percentage } } items { ... on AllDiscountItems { allItems } } } } } } } } }`;

const SKAPA = `mutation($d: DiscountAutomaticBasicInput!) { discountAutomaticBasicCreate(automaticBasicDiscount: $d) {
  automaticDiscountNode { id } userErrors { field message } } }`;

async function lasTrappan(k) {
  const d = await k.graphql(LAS);
  return d.automaticDiscountNodes.edges
    .map(({ node }) => ({ id: node.id, ...node.automaticDiscount }))
    .filter((r) => /^Black Week/i.test(r.title ?? ''));
}

async function main() {
  const i = process.argv.indexOf('--butik');
  const butikId = i >= 0 ? process.argv[i + 1] : null;
  if (!butikId) throw new Error('Ange --butik <id ur sparning/butiker.json>.');
  const skarpt = process.argv.includes('--ja');
  const butik = lasButik(butikId);
  const flersprakig = process.argv.includes('--flersprakig') || Boolean(lasBrandOmFinns(butikId)?.flersprakig);
  const k = await skapaKlient(butik);

  const fore = await lasTrappan(k);
  const finns = new Set(fore.map((r) => r.title));
  console.log(`${butik.namn ?? butikId}: ${fore.length} Black Week-rabatter finns.`);
  for (const r of fore) console.log(`  finns: ${r.title} (${r.status}, ${r.id})`);

  const saknas = TRAPPA.filter((n) => !finns.has(titel(n, flersprakig)));
  for (const n of saknas) console.log(`  ${skarpt ? 'skapar' : 'skulle skapa'}: ${titel(n, flersprakig)}, minst ${n.antal} vara/varor, ${START} till ${SLUT}`);
  if (!saknas.length) { console.log('Hela trappan finns, inget att skapa.'); return; }
  if (!skarpt) { console.log('Torrt. Kör med --ja för att skapa.'); return; }

  const skapade = [];
  for (const n of saknas) {
    const d = await k.graphql(SKAPA, { d: indata(n, flersprakig) });
    const r = d.discountAutomaticBasicCreate;
    if (r.userErrors?.length) throw new Error(`${titel(n, flersprakig)}: ${JSON.stringify(r.userErrors)}`);
    console.log(`  skapad: ${titel(n, flersprakig)} → ${r.automaticDiscountNode.id}`);
    skapade.push(r.automaticDiscountNode.id);
  }
  // Tillbakaläsning på id: listan automaticDiscountNodes släpar några sekunder efter
  // en ny rabatt (mätt 2026-09-26 på CaraShell: 0 i listan direkt efter, 3 en minut
  // senare). Kör därför aldrig --ja två gånger i rad — vänta en minut och kör torrt först.
  let fel = 0;
  for (const id of skapade) {
    const d = await k.graphql(`query($id: ID!) { automaticDiscountNode(id: $id) { automaticDiscount { ... on DiscountAutomaticBasic { title status startsAt endsAt } } } }`, { id });
    const r = d.automaticDiscountNode?.automaticDiscount;
    if (!r || r.startsAt !== START || r.endsAt !== SLUT) fel++;
    console.log(`  tillbakaläst: ${id} ${JSON.stringify(r)}`);
  }
  if (fel) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
