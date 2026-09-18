// Mäter om erbjudandet i mejlen gör något. Läs-bara mot Shopify (bara GET
// via GraphQL). Skriver mejl/matning.json så siffrorna går att följa över
// tid, och skriver ut dem i terminalen.
//
//   node mejl/matning.mjs            # sedan koden skapades (konfig.lage.rabattkod_skapad)
//   node mejl/matning.mjs --fran 2026-09-14
//
// Fyra tal, från hårdast till mjukast:
//   1. Ordrar med koden        — kunden fick gåvan. Det enda som bevisar köp.
//   2. Ordrar via hjulet       — radegenskapen _gratishjul på en orderrad, satt
//                                 av hjulsidan när vinsten läggs i korgen. Fångar
//                                 även köp där koden föll bort i kassan.
//   3. Ordrar som kom från mejlet — kundresans landningssida är hjulsidan,
//                                 eller utm_source=mejl (länkarna i mejlen bär
//                                 utm sedan v5). Shopify sparar resan per order.
//   4. Andel återköp per månad — grundlinjen: hur stor del av månadens ordrar
//                                 kommer från någon som handlat förut. Stiger
//                                 den efter launch gör erbjudandet jobbet.
//
// Nämnaren är antalet ordrar sedan startdatumet: varje order ger en
// orderbekräftelse, alltså ett mejl med erbjudandet. Mejlens öppningar och
// klick går inte att mäta — Shopifys notiser saknar spårning.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { kravProxy, graphql } from './shopify.mjs';

kravProxy();

const ROT = dirname(fileURLToPath(import.meta.url));
const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const KOD = konfig.erbjudande.kod;
const HJUL = `/pages/${konfig.hjul.handle}`;
const arg = process.argv.indexOf('--fran');
const fran = arg > -1 ? process.argv[arg + 1] : konfig.lage.rabattkod_skapad;
if (!/^\d{4}-\d{2}-\d{2}$/.test(fran ?? '')) {
  console.error('❌ Startdatum saknas: --fran YYYY-MM-DD, eller konfig.lage.rabattkod_skapad.');
  process.exit(1);
}

async function hamtaOrdrar(fraga, falt) {
  const ut = [];
  let cursor = null;
  for (let sida = 0; sida < 40; sida++) {
    const d = await graphql(
      `query($q: String!, $c: String) { orders(first: 100, after: $c, query: $q, sortKey: CREATED_AT) {
        pageInfo { hasNextPage endCursor } nodes { ${falt} } } }`,
      { q: fraga, c: cursor }
    );
    ut.push(...d.orders.nodes);
    if (!d.orders.pageInfo.hasNextPage) break;
    cursor = d.orders.pageInfo.endCursor;
  }
  return ut;
}

const FALT = `name createdAt cancelledAt email
  totalPriceSet { shopMoney { amount } }
  discountCodes
  lineItems(first: 20) { nodes { title quantity customAttributes { key value } } }
  customerJourneySummary { lastVisit { landingPage utmParameters { source medium campaign } } firstVisit { landingPage utmParameters { source medium campaign } } }`;

const sedan = await hamtaOrdrar(`created_at:>=${fran}`, FALT);
const ordrar = sedan.filter((o) => !o.cancelledAt);

const medKod = ordrar.filter((o) => (o.discountCodes ?? []).some((c) => c.toUpperCase() === KOD.toUpperCase()));
const viaHjul = ordrar.filter((o) => o.lineItems.nodes.some((r) => r.customAttributes.some((a) => a.key === '_gratishjul')));
const besok = (o) => [o.customerJourneySummary?.lastVisit, o.customerJourneySummary?.firstVisit].filter(Boolean);
const franMejl = ordrar.filter((o) => besok(o).some((v) => (v.landingPage ?? '').includes(HJUL) || v.utmParameters?.source === 'mejl'));
const perMall = {};
for (const o of franMejl) for (const v of besok(o)) if (v.utmParameters?.source === 'mejl') perMall[v.utmParameters.medium ?? '?'] = (perMall[v.utmParameters.medium ?? '?'] ?? 0) + 1;

const kr = (o) => Number(o.totalPriceSet.shopMoney.amount);
const summa = (lista) => lista.reduce((s, o) => s + kr(o), 0);
const gavor = medKod.flatMap((o) => o.lineItems.nodes.filter((r) => r.customAttributes.some((a) => a.key === '_gratishjul')).map((r) => r.title));

// Grundlinjen: återköp per månad, sedan årsskiftet så första köpet oftast är med.
const historik = await hamtaOrdrar('created_at:>=2026-01-01', 'name createdAt cancelledAt email');
const sett = new Set();
const manad = {};
for (const o of historik.filter((x) => !x.cancelledAt && x.email).sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
  const m = o.createdAt.slice(0, 7);
  manad[m] ??= { ordrar: 0, aterkop: 0 };
  manad[m].ordrar++;
  const e = o.email.toLowerCase();
  if (sett.has(e)) manad[m].aterkop++;
  sett.add(e);
}

const resultat = {
  matt: new Date().toISOString().slice(0, 10),
  fran,
  kod: KOD,
  ordrar_sedan_start: ordrar.length,
  med_koden: { antal: medKod.length, omsattning_sek: Math.round(summa(medKod)), ordrar: medKod.map((o) => o.name), gavor },
  via_hjulet: { antal: viaHjul.length, ordrar: viaHjul.map((o) => o.name) },
  fran_mejlet: { antal: franMejl.length, per_mall: perMall, ordrar: franMejl.map((o) => o.name) },
  konvertering_procent: ordrar.length ? Math.round((medKod.length / ordrar.length) * 1000) / 10 : null,
  aterkop_per_manad: Object.fromEntries(Object.entries(manad).map(([m, v]) => [m, { ...v, procent: Math.round((v.aterkop / v.ordrar) * 1000) / 10 }])),
};
writeFileSync(join(ROT, 'matning.json'), `${JSON.stringify(resultat, null, 2)}\n`);

console.log(`Sedan ${fran}: ${ordrar.length} ordrar = ${ordrar.length} orderbekräftelser med erbjudandet.`);
console.log(`1. Med koden ${KOD}: ${medKod.length} ordrar, ${Math.round(summa(medKod))} kr${medKod.length ? ` — snitt ${Math.round(summa(medKod) / medKod.length)} kr` : ''}${gavor.length ? ` — gåvor: ${gavor.join(', ')}` : ''}`);
console.log(`2. Via hjulet (vinst i korgen): ${viaHjul.length} ordrar`);
console.log(`3. Kom från mejlet (landade på hjulsidan / utm_source=mejl): ${franMejl.length} ordrar${Object.keys(perMall).length ? ` — per mall: ${JSON.stringify(perMall)}` : ''}`);
console.log(`   Konvertering mejl → köp med koden: ${resultat.konvertering_procent ?? '–'} %`);
console.log('4. Återköp per månad (andel av ordrarna från någon som handlat förut):');
for (const [m, v] of Object.entries(resultat.aterkop_per_manad)) console.log(`   ${m}: ${v.aterkop} av ${v.ordrar} (${v.procent} %)`);
console.log('Sparat i mejl/matning.json');
