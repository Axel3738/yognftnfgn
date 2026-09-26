// Black Week-trappan som tre schemalagda automatiska rabatter i en butiks Shopify.
//
//   node klaviyo/black-week-trappa.mjs --butik carashell          # torrt: visar vad som finns och vad som skulle ändras
//   node klaviyo/black-week-trappa.mjs --butik carashell --ja     # skapar det som saknas, rättar tiderna, läser tillbaka
//
// Samma trappa som Bäverbutiken och Matstrumpor (Axels beslut 2026-09-25, avläst
// ur Matstrumpors Shopify 2026-09-26: DiscountAutomaticBasic, 10 % vid minst 1
// vara, 20 % vid 2, 30 % vid 3, alla produkter, bara engångsköp, kombineras
// bara med fraktrabatter, 2026-11-22T23:00Z till 2026-11-30T23:00Z = måndag
// 23/11 00:00 till och med måndag 30/11 svensk tid). Rabatterna kombineras inte
// med varandra, så kassan ger den största som varukorgen når.
//
// En flerspråkig butik (klaviyo/brands/<id>.json har flersprakig: true, i dag
// CaraShell: sv, nb, en) får två skillnader, båda beslutade av sessionen 2026-09-26:
// - Titeln syns för kunden i kassan, så den saknar svenska ord: "Black Week 10 %".
// - Slutet flyttas till 2026-12-01T08:00Z = midnatt natten mot tisdag i
//   Kalifornien. Engelska mejl lovar "through Monday, November 30", och med
//   Bäverbutikens slut (00:00 svensk tid) hade rabatten försvunnit måndag kl 18
//   i New York och kl 15 i Kalifornien — 54 av CaraShells 57 engelska
//   prenumeranter är i USA. Svenska och norska kunder får några nattimmar till;
//   deras mejl lovar "till och med måndag 30 november", vilket fortfarande stämmer.
//
// Idempotent: en nivå vars titel redan finns skapas aldrig igen, och en befintlig
// nivå med fel start- eller sluttid rättas i stället för att dubbleras. Butikens
// nycklar är sparning/butik.mjs skapaKlient() (registret sparning/butiker.json).
// Axels beslut krävs innan --ja körs: rabatter i Shopify är ägarens (CLAUDE.md regel 12).

import fs from 'node:fs';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';

// klaviyo/brands/<id>.json när butiken har en mejlbrandfil.
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
export const SLUT_FLERA_MARKNADER = '2026-12-01T08:00:00Z';

export const slut = (flersprakig) => (flersprakig ? SLUT_FLERA_MARKNADER : SLUT);

export function titel(niva, flersprakig) {
  return flersprakig
    ? `Black Week ${niva.procent} %`
    : `Black Week 2026: ${niva.procent} % vid ${niva.antal === 1 ? '1 vara' : niva.antal === 3 ? '3+ varor' : `${niva.antal} varor`}`;
}

export function indata(niva, flersprakig) {
  return {
    title: titel(niva, flersprakig),
    startsAt: START,
    endsAt: slut(flersprakig),
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
    minimumRequirement: { quantity: { greaterThanOrEqualToQuantity: String(niva.antal) } },
    customerGets: { value: { percentage: niva.procent / 100 }, items: { all: true } },
  };
}

// Shopify svarar med tider utan millisekunder (2026-11-22T23:00:00Z); jämför som tidpunkter.
const sammaTid = (a, b) => Date.parse(a) === Date.parse(b);

const LAS = `query { automaticDiscountNodes(first: 100) { edges { node { id automaticDiscount { __typename
  ... on DiscountAutomaticBasic { title status startsAt endsAt } } } } } }`;
const LAS_ID = `query($id: ID!) { automaticDiscountNode(id: $id) { automaticDiscount { ... on DiscountAutomaticBasic {
  title status startsAt endsAt combinesWith { orderDiscounts productDiscounts shippingDiscounts }
  minimumRequirement { ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity } }
  customerGets { value { ... on DiscountPercentage { percentage } } items { ... on AllDiscountItems { allItems } } } } } } }`;
const SKAPA = `mutation($d: DiscountAutomaticBasicInput!) { discountAutomaticBasicCreate(automaticBasicDiscount: $d) {
  automaticDiscountNode { id } userErrors { field message } } }`;
const RATTA = `mutation($id: ID!, $d: DiscountAutomaticBasicInput!) { discountAutomaticBasicUpdate(id: $id, automaticBasicDiscount: $d) {
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
  console.log(`${butik.namn ?? butikId}: ${fore.length} Black Week-rabatter finns. Mål: ${START} till ${slut(flersprakig)}.`);
  for (const r of fore) console.log(`  finns: ${r.title} (${r.status}, ${r.startsAt} till ${r.endsAt}, ${r.id})`);

  const skapa = [];
  const ratta = [];
  for (const n of TRAPPA) {
    const t = titel(n, flersprakig);
    const f = fore.find((r) => r.title === t);
    if (!f) skapa.push(n);
    else if (!sammaTid(f.startsAt, START) || !sammaTid(f.endsAt, slut(flersprakig))) ratta.push({ n, id: f.id, fran: `${f.startsAt} till ${f.endsAt}` });
  }
  for (const n of skapa) console.log(`  ${skarpt ? 'skapar' : 'skulle skapa'}: ${titel(n, flersprakig)}, minst ${n.antal} vara/varor`);
  for (const r of ratta) console.log(`  ${skarpt ? 'rättar' : 'skulle rätta'}: ${titel(r.n, flersprakig)} ${r.fran} → ${START} till ${slut(flersprakig)}`);
  if (!skapa.length && !ratta.length) { console.log('Hela trappan finns med rätt tider, inget att göra.'); return; }
  if (!skarpt) { console.log('Torrt. Kör med --ja för att genomföra.'); return; }

  const lasTillbaka = [];
  for (const n of skapa) {
    const r = (await k.graphql(SKAPA, { d: indata(n, flersprakig) })).discountAutomaticBasicCreate;
    if (r.userErrors?.length) throw new Error(`${titel(n, flersprakig)}: ${JSON.stringify(r.userErrors)}`);
    console.log(`  skapad: ${titel(n, flersprakig)} → ${r.automaticDiscountNode.id}`);
    lasTillbaka.push(r.automaticDiscountNode.id);
  }
  for (const x of ratta) {
    const r = (await k.graphql(RATTA, { id: x.id, d: { startsAt: START, endsAt: slut(flersprakig) } })).discountAutomaticBasicUpdate;
    if (r.userErrors?.length) throw new Error(`${titel(x.n, flersprakig)}: ${JSON.stringify(r.userErrors)}`);
    console.log(`  rättad: ${titel(x.n, flersprakig)} (${x.id})`);
    lasTillbaka.push(x.id);
  }
  // Tillbakaläsning på id: listan automaticDiscountNodes släpar några sekunder efter
  // en ny rabatt (mätt 2026-09-26 på CaraShell: 0 i listan direkt efter, 3 en minut
  // senare). Kör därför aldrig --ja två gånger i rad — vänta en minut och kör torrt först.
  let fel = 0;
  for (const id of lasTillbaka) {
    const r = (await k.graphql(LAS_ID, { id })).automaticDiscountNode?.automaticDiscount;
    if (!r || !sammaTid(r.startsAt, START) || !sammaTid(r.endsAt, slut(flersprakig))) fel++;
    console.log(`  tillbakaläst: ${id} ${JSON.stringify(r)}`);
  }
  if (fel) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
