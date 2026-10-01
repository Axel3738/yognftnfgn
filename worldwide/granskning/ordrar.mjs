// ordrar.mjs — vilket språk får de utländska kunderna sina mejl på? Läs-bart.
//
//   node worldwide/granskning/ordrar.mjs [--sedan 2026-10-01] [--ut fil.json]
//
// 1) Ordrarna utanför Sverige sedan --sedan: land, valuta, customerLocale (Shopify skickar
//    notisen på orderns språk), källa, om orderbekräftelsen gick ut (händelserna).
// 2) Notismallarna (EMAIL_TEMPLATE): huvudmallen (svenska) och vad som finns på varje
//    worldwide-språk — Shopifys standardöversättning eller vår.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const W = JSON.parse(readFileSync(join(ROT, '..', 'konfig.json'), 'utf8'));
const a = process.argv.slice(2);
const arg = (n, d = null) => (a.includes(n) ? a[a.indexOf(n) + 1] : d);

async function huvud() {
  const sedan = arg('--sedan', '2026-10-01');
  // Kundtjänstens app läser ordrar (Bäver uppladdare har inte read_orders).
  const kO = await skapaKlient({ ...lasButik('baverbutiken'), env_suffix: 'BAVERBUTIKEN_EMAILSCRAPER' });
  const kT = await skapaKlient({ ...lasButik('baverbutiken'), env_suffix: 'SE' });
  const d = await kO.graphql(`query($q:String){ orders(first: 100, query: $q, sortKey: CREATED_AT) { nodes { name createdAt customerLocale sourceName presentmentCurrencyCode
      totalPriceSet { presentmentMoney { amount currencyCode } shopMoney { amount currencyCode } }
      shippingAddress { countryCodeV2 } billingAddress { countryCodeV2 }
      displayFulfillmentStatus
      shippingLines(first: 3) { nodes { title originalPriceSet { presentmentMoney { amount currencyCode } } } }
      events(first: 20) { nodes { message createdAt } } } } }`, { q: `created_at:>=${sedan}` });
  const ordrar = d.orders.nodes.map((o) => ({
    order: o.name, skapad: o.createdAt, land: o.shippingAddress?.countryCodeV2 ?? o.billingAddress?.countryCodeV2 ?? null,
    locale: o.customerLocale, valuta: o.presentmentCurrencyCode, summa: `${o.totalPriceSet.presentmentMoney.amount} ${o.totalPriceSet.presentmentMoney.currencyCode}`,
    frakt: o.shippingLines.nodes.map((s) => `${s.title} ${s.originalPriceSet.presentmentMoney.amount} ${s.originalPriceSet.presentmentMoney.currencyCode}`),
    kalla: o.sourceName, leverans: o.displayFulfillmentStatus,
    mejl: o.events.nodes.map((e) => e.message.replace(/<[^>]+>/g, '')).filter((m) => /mejl|e-?post|email|mail/i.test(m)),
  }));
  const utland = ordrar.filter((o) => o.land && o.land !== 'SE');
  console.log(`Ordrar sedan ${sedan}: ${ordrar.length}, utanför Sverige: ${utland.length}`);
  for (const o of utland) console.log(`  ${o.order} ${o.skapad.slice(0, 16)} ${o.land} locale ${o.locale} ${o.summa} · frakt ${o.frakt.join(', ')} · ${o.leverans}${o.mejl.length ? ` · ${o.mejl.join(' | ')}` : ''}`);

  // Notismallarna
  const mallar = [];
  let efter = null;
  do {
    const r = await kT.graphql(`query($e:String){ translatableResources(resourceType: EMAIL_TEMPLATE, first: 100, after: $e) { pageInfo { hasNextPage endCursor } nodes { resourceId translatableContent { key value } } } }`, { e: efter });
    mallar.push(...r.translatableResources.nodes);
    efter = r.translatableResources.pageInfo.hasNextPage ? r.translatableResources.pageInfo.endCursor : null;
  } while (efter);
  const per = {};
  for (const locale of W.marknad.locales) {
    const ids = mallar.map((m) => m.resourceId);
    const r = await kT.graphql(`query($ids:[ID!]!, $l:String!){ translatableResourcesByIds(resourceIds: $ids, first: 100) { nodes { resourceId translations(locale: $l) { key value outdated updatedAt } } } }`, { ids, l: locale });
    per[locale] = new Map(r.translatableResourcesByIds.nodes.map((n) => [n.resourceId, n.translations]));
  }
  const ut = [];
  for (const m of mallar) {
    const titel = m.translatableContent.find((c) => c.key === 'title')?.value ?? '';
    const kropp = m.translatableContent.find((c) => c.key === 'body_html')?.value ?? '';
    const egen = /baverbutiken\.se\/pages\/spara|gratisprodukt|TACKIGEN|Bäverbutiken|BB-/i.test(kropp);
    const rad = { id: m.resourceId, titel, egen_svensk: egen, kropp_borjan: kropp.replace(/\s+/g, ' ').slice(0, 160), sprak: {} };
    for (const l of W.marknad.locales) {
      const t = per[l].get(m.resourceId) ?? [];
      const tt = t.find((x) => x.key === 'title'), tb = t.find((x) => x.key === 'body_html');
      rad.sprak[l] = { titel: tt?.value ?? null, har_kropp: Boolean(tb?.value), uppdaterad: tb?.updatedAt ?? null, outdated: tb?.outdated ?? null, egen: /beaverstoreco|Beaver Store/i.test(tb?.value ?? ''), svensk: /[åäö]|Bäverbutiken|gratisprodukt/i.test(tb?.value ?? ''), langd: tb?.value?.length ?? 0 };
    }
    ut.push(rad);
  }
  console.log(`\nNotismallar: ${ut.length} (egna svenska enligt kroppen: ${ut.filter((x) => x.egen_svensk).length})`);
  for (const x of ut) console.log(`  ${x.egen_svensk ? '★' : ' '} ${x.titel.slice(0, 60).padEnd(60)} ${W.marknad.locales.map((l) => `${l}:${x.sprak[l].har_kropp ? (x.sprak[l].svensk ? 'SV!' : x.sprak[l].uppdaterad ? 'vår' : 'std') : '—'}`).join(' ')}`);
  if (arg('--ut')) writeFileSync(arg('--ut'), JSON.stringify({ ordrar, mallar: ut }, null, 1));
}

huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
