// Extrareans rabattkoder i Shopify, en per kampanjmejl (Axels beslut A 2026-09-28:
// "rabattkod som läggs på av sig själv via knappen i mejlet, bara på produkterna i
// mejlet, gäller några dagar, en per kund").
//
//   node klaviyo/rea-kod.mjs --brand baverbutiken k23 k25 k29          # torrt: visar vad som finns och vad som skulle skapas
//   node klaviyo/rea-kod.mjs --brand baverbutiken k23 k25 k29 --ja     # skapar/rättar och läser tillbaka på koden
//   node klaviyo/rea-kod.mjs --brand baverbutiken --alla [--ja]        # alla kampanjfiler med rabatt-block
//   node klaviyo/rea-kod.mjs --brand baverbutiken --avaktivera KOD1,KOD2 [--ja]   # stänger gamla koder (utgår nu)
//
// En kod kan bäras av FLERA mejl (Axels 30 %-rea 2026-09-29: FARSDAG30 i elva fars dag-mejl,
// BAT30 i båtmejlen K02 och K24). Filerna grupperas per kod: procent, start och slut måste vara
// lika i alla, och koden gäller unionen av mejlens produkter.
//
// Kampanjfilen (klaviyo/innehall/<brand>/kampanjer/<id>-*.json) bär beslutet i
// `rabatt`: { typ: "kod", kod, procent, start, slut, handles? }. Saknas handles
// tas alla produkter som står i mejlets block. Koden gäller bara de produkterna,
// en gång per kund, kombineras bara med fraktrabatter, och räknas på dagens pris
// (prisinformationslagen: jämförpriset är det lägsta de senaste 30 dagarna, alltså
// det pris kunden ser i dag, inte det överstrukna).
//
// Nycklarna är appen bakom SHOPIFY_CLIENT_ID/SECRET_<suffix> (Bäverbutiken: SE =
// "Bäver uppladdare", som har write_discounts — mätt 2026-09-28; CLAUDE.md:s äldre
// "saknar write_discounts" var 2026-09-12). Tillbakaläsningen går på
// codeDiscountNodeByCode, aldrig på listan (den släpar efter, CLAUDE.md).
// Idempotent: finns koden rättas den i stället för att dubbleras.
// Rabatter i Shopify är ägarens beslut (CLAUDE.md regel 12) — --ja bara på Axels ord.

import fs from 'node:fs';
import path from 'node:path';

const ROT = path.resolve(new URL('..', import.meta.url).pathname);
const API = '2025-07';

const arg = (n, std) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : std; };
const brandId = arg('--brand', 'baverbutiken');
const suffix = arg('--suffix', brandId === 'baverbutiken' ? 'SE' : null);
const skarpt = process.argv.includes('--ja');
const alla = process.argv.includes('--alla');
const avaktivera = String(arg('--avaktivera', '') || '').split(',').map((x) => x.trim()).filter(Boolean);
const ids = process.argv.slice(2).filter((a) => /^k\d+/.test(a));

export function lasKampanj(brand, id) {
  const mapp = path.join(ROT, 'klaviyo', 'innehall', brand, 'kampanjer');
  const fil = fs.readdirSync(mapp).find((f) => f === `${id}.json` || f.startsWith(`${id}-`));
  if (!fil) throw new Error(`Hittar ingen kampanjfil för ${id} i ${mapp}`);
  const d = JSON.parse(fs.readFileSync(path.join(mapp, fil), 'utf8'));
  return { fil, d: { ...(d.mejl ?? d), id: (d.mejl ?? d).id ?? d.id, rabatt: d.rabatt ?? d.mejl?.rabatt } };
}

// Alla produkter som står i mejlet: produktrad.handles, produkt.handle, hero-knappens produkt:.
export function handlesI(m) {
  const ut = new Set();
  for (const b of m.block ?? []) {
    for (const h of b.handles ?? []) ut.add(h);
    if (b.handle) ut.add(b.handle);
    const l = b.knapp?.lank ?? '';
    const p = /^produkt:(.+)$/.exec(l);
    if (p) ut.add(p[1]);
  }
  return [...ut];
}

export function rabattUr(m) {
  const r = m.rabatt;
  if (!r || typeof r !== 'object' || r.typ !== 'kod') return null;
  if (!/^[A-Z0-9]{4,20}$/.test(String(r.kod ?? ''))) throw new Error(`${m.id}: koden ska vara A-Z0-9 (4–20 tecken), fick "${r.kod}"`);
  const procent = Number(r.procent);
  if (!Number.isFinite(procent) || procent <= 0 || procent >= 100) throw new Error(`${m.id}: procent saknas eller orimlig (${r.procent})`);
  for (const k of ['start', 'slut']) if (!Number.isFinite(Date.parse(r[k]))) throw new Error(`${m.id}: rabatt.${k} är inte en tidpunkt (${r[k]})`);
  if (Date.parse(r.slut) <= Date.parse(r.start)) throw new Error(`${m.id}: rabatt.slut ligger före start`);
  const handles = Array.isArray(r.handles) && r.handles.length ? r.handles : handlesI(m);
  if (!handles.length) throw new Error(`${m.id}: inga produkter att knyta koden till`);
  return { kod: r.kod, procent, start: r.start, slut: r.slut, handles, titel: r.titel ?? `Extrarea ${r.kod}: ${procent} % (mejl ${m.id.split('-')[0].toUpperCase()})` };
}

// Alla kampanjfiler i brandets mapp som bär ett rabatt-block av typen kod.
export function allaMedRabatt(brand) {
  const mapp = path.join(ROT, 'klaviyo', 'innehall', brand, 'kampanjer');
  return fs.readdirSync(mapp).filter((f) => f.endsWith('.json')).sort()
    .map((f) => /^(k\d+)/.exec(f)?.[1]).filter(Boolean)
    .filter((id) => { const { d } = lasKampanj(brand, id); return d.rabatt && typeof d.rabatt === 'object' && d.rabatt.typ === 'kod'; });
}

// Samma kod i flera mejl blir EN rabatt: procent, start och slut måste stämma i alla filer,
// och produkterna är unionen. Titeln räknar upp mejlen så att Shopify-listan går att läsa.
export function grupperaPerKod(poster) {
  const per = new Map();
  for (const { id, r } of poster) {
    const g = per.get(r.kod);
    if (!g) { per.set(r.kod, { ...r, handles: [...r.handles], mejl: [id] }); continue; }
    if (g.procent !== r.procent || !sammaTid(g.start, r.start) || !sammaTid(g.slut, r.slut)) {
      throw new Error(`${r.kod}: ${g.mejl.join(', ')} och ${id} säger olika procent, start eller slut (${g.procent} % ${g.start}–${g.slut} mot ${r.procent} % ${r.start}–${r.slut})`);
    }
    for (const h of r.handles) if (!g.handles.includes(h)) g.handles.push(h);
    g.mejl.push(id);
  }
  for (const g of per.values()) g.titel = `Extrarea ${g.kod}: ${g.procent} % (mejl ${g.mejl.map((m) => m.split('-')[0].toUpperCase()).join(', ')})`;
  return [...per.values()];
}

async function klient(env = process.env) {
  if (!suffix) throw new Error('Ange --suffix <ENV-suffix> för butikens Shopify-app.');
  const shop = String(env[`SHOPIFY_SHOP_${suffix}`] ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '').replace('_', '-');
  const id = env[`SHOPIFY_CLIENT_ID_${suffix}`]; const secret = env[`SHOPIFY_CLIENT_SECRET_${suffix}`];
  if (!shop || !id || !secret) throw new Error(`Saknar SHOPIFY_SHOP/CLIENT_ID/CLIENT_SECRET_${suffix} i miljön.`);
  const tr = await fetch(`https://${shop}/admin/oauth/access_token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ client_id: id, client_secret: secret, grant_type: 'client_credentials' }) });
  const t = await tr.json().catch(() => ({}));
  if (!t.access_token) throw new Error(`${shop}: kunde inte minta token (${tr.status}) ${JSON.stringify(t).slice(0, 160)}`);
  const graphql = async (query, variables = {}) => {
    const r = await fetch(`https://${shop}/admin/api/${API}/graphql.json`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': t.access_token }, body: JSON.stringify({ query, variables }) });
    const j = await r.json();
    if (j.errors) throw new Error(`GraphQL: ${JSON.stringify(j.errors).slice(0, 300)}`);
    return j.data;
  };
  return { shop, graphql };
}

const LAS = `query($kod: String!) { codeDiscountNodeByCode(code: $kod) { id codeDiscount { __typename ... on DiscountCodeBasic {
  title status startsAt endsAt appliesOncePerCustomer usageLimit asyncUsageCount
  combinesWith { orderDiscounts productDiscounts shippingDiscounts }
  customerGets { value { ... on DiscountPercentage { percentage } } items { ... on DiscountProducts { products(first: 50) { nodes { id handle } } } ... on AllDiscountItems { allItems } } } } } } }`;
const LAS_ID = LAS.replace('query($kod: String!) { codeDiscountNodeByCode(code: $kod)', 'query($id: ID!) { codeDiscountNode(id: $id)');
const SKAPA = `mutation($d: DiscountCodeBasicInput!) { discountCodeBasicCreate(basicCodeDiscount: $d) { codeDiscountNode { id } userErrors { field code message } } }`;
const RATTA = `mutation($id: ID!, $d: DiscountCodeBasicInput!) { discountCodeBasicUpdate(id: $id, basicCodeDiscount: $d) { codeDiscountNode { id } userErrors { field code message } } }`;
const PRODUKT = `query($q: String!) { products(first: 5, query: $q) { nodes { id handle title status } } }`;
const AVAKTIVERA = `mutation($id: ID!) { discountCodeDeactivate(id: $id) { codeDiscountNode { id codeDiscount { ... on DiscountCodeBasic { status endsAt } } } userErrors { field code message } } }`;

const sammaTid = (a, b) => Date.parse(a) === Date.parse(b);
const sammaMangd = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

async function produktIds(k, handles) {
  const ut = {};
  for (const h of handles) {
    const d = await k.graphql(PRODUKT, { q: `handle:${h}` });
    const p = d.products.nodes.find((x) => x.handle === h);
    if (!p) throw new Error(`Produkten ${h} finns inte i butiken.`);
    if (p.status !== 'ACTIVE') throw new Error(`Produkten ${h} är ${p.status}, inte ACTIVE.`);
    ut[h] = p.id;
  }
  return ut;
}

function indata(r, ids, { skapa }) {
  return {
    title: r.titel,
    ...(skapa ? { code: r.kod } : {}),
    startsAt: r.start,
    endsAt: r.slut,
    appliesOncePerCustomer: true,
    combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
    customerSelection: { all: true },
    customerGets: { value: { percentage: r.procent / 100 }, items: { products: { productsToAdd: r.handles.map((h) => ids[h]) } } },
  };
}

export function bedom(las, r, ids) {
  const c = las?.codeDiscount;
  if (!c || c.__typename !== 'DiscountCodeBasic') return { finns: false, avvikelser: [] };
  const av = [];
  if (!sammaTid(c.startsAt, r.start)) av.push(`start ${c.startsAt} ≠ ${r.start}`);
  if (!sammaTid(c.endsAt, r.slut)) av.push(`slut ${c.endsAt} ≠ ${r.slut}`);
  if (Math.abs(Number(c.customerGets?.value?.percentage ?? -1) - r.procent / 100) > 1e-9) av.push(`procent ${c.customerGets?.value?.percentage} ≠ ${r.procent / 100}`);
  if (!c.appliesOncePerCustomer) av.push('inte en gång per kund');
  const har = (c.customerGets?.items?.products?.nodes ?? []).map((p) => p.id);
  const ska = r.handles.map((h) => ids[h]);
  if (c.customerGets?.items?.allItems || !sammaMangd(har, ska)) av.push(`produkter: har ${har.length} (${(c.customerGets?.items?.products?.nodes ?? []).map((p) => p.handle).join(', ') || 'alla'}), ska ${ska.length}`);
  return { finns: true, id: las.id, status: c.status, anvand: c.asyncUsageCount, avvikelser: av, har };
}

async function main() {
  const valda = alla ? allaMedRabatt(brandId) : ids;
  if (!valda.length && !avaktivera.length) throw new Error('Ange kampanj-id:n (t.ex. k23 k25), --alla eller --avaktivera KOD1,KOD2.');
  const k = await klient();
  console.log(`${brandId} (${k.shop}) via SHOPIFY_*_${suffix}, ${skarpt ? 'SKARPT' : 'torrt'}`);
  let fel = 0;

  for (const kod of avaktivera) {
    const las = (await k.graphql(LAS, { kod })).codeDiscountNodeByCode;
    const c = las?.codeDiscount;
    if (!c) { console.log(`\n${kod}: finns inte i butiken, inget att stänga.`); continue; }
    console.log(`\n${kod}: ${las.id} ${c.status}, använd ${c.asyncUsageCount} ggr, ${c.startsAt} → ${c.endsAt}`);
    if (c.status === 'EXPIRED') { console.log('  redan utgången, rör inte.'); continue; }
    if (!skarpt) { console.log('  skulle stängas (torrt).'); continue; }
    const s2 = (await k.graphql(AVAKTIVERA, { id: las.id })).discountCodeDeactivate;
    if (s2.userErrors?.length) throw new Error(`${kod}: ${JSON.stringify(s2.userErrors)}`);
    const efter = (await k.graphql(LAS_ID, { id: las.id })).codeDiscountNode?.codeDiscount;
    if (efter?.status !== 'EXPIRED') { fel++; console.log(`  ⚠️ status efter stängning: ${efter?.status ?? 'hittas inte'}`); }
    else console.log(`  stängd: ${efter.status}, slut ${efter.endsAt} ✅`);
  }

  const poster = [];
  for (const id of valda) {
    const { fil, d } = lasKampanj(brandId, id);
    const r = rabattUr(d);
    if (!r) { console.log(`${fil}: inget rabatt-block (typ kod) — hoppar.`); continue; }
    poster.push({ id: d.id ?? id, r });
  }
  for (const r of grupperaPerKod(poster)) {
    const pids = await produktIds(k, r.handles);
    const fore = bedom((await k.graphql(LAS, { kod: r.kod })).codeDiscountNodeByCode, r, pids);
    console.log(`\n${r.kod}: ${r.procent} % på ${r.handles.length} produkter, ${r.start} → ${r.slut} (mejl ${r.mejl.join(', ')})`);
    for (const h of r.handles) console.log(`  ${h} → ${pids[h]}`);
    if (fore.finns) console.log(`  finns: ${fore.id} (${fore.status}, använd ${fore.anvand} ggr)${fore.avvikelser.length ? `, avviker: ${fore.avvikelser.join('; ')}` : ', stämmer'}`);
    else console.log('  finns inte i butiken.');
    if (!skarpt) { console.log(fore.finns && !fore.avvikelser.length ? '  inget att göra.' : `  skulle ${fore.finns ? 'rätta' : 'skapa'} (torrt).`); continue; }
    if (fore.finns && !fore.avvikelser.length) { console.log('  redan rätt, rör inte.'); continue; }
    let skapadId = null;
    if (!fore.finns) {
      const s2 = (await k.graphql(SKAPA, { d: indata(r, pids, { skapa: true }) })).discountCodeBasicCreate;
      if (s2.userErrors?.length) throw new Error(`${r.kod}: ${JSON.stringify(s2.userErrors)}`);
      skapadId = s2.codeDiscountNode.id;
      console.log(`  skapad: ${skapadId}`);
    } else {
      const bort = fore.har.filter((x) => !r.handles.map((h) => pids[h]).includes(x));
      const dIn = indata(r, pids, { skapa: false });
      if (bort.length) dIn.customerGets.items.products.productsToRemove = bort;
      const s2 = (await k.graphql(RATTA, { id: fore.id, d: dIn })).discountCodeBasicUpdate;
      if (s2.userErrors?.length) throw new Error(`${r.kod}: ${JSON.stringify(s2.userErrors)}`);
      console.log(`  rättad: ${fore.id}`);
    }
    // codeDiscountNodeByCode släpar några sekunder efter en ny kod (mätt 2026-09-28: tre
    // nyskapade koder svarade null direkt efter skapandet, alla tre fanns 20 s senare).
    // Läs därför tillbaka på id direkt efter skrivningen; kör torrt en minut senare för koden.
    const nodId = skapadId ?? fore.id;
    const efter = bedom((await k.graphql(LAS_ID, { id: nodId })).codeDiscountNode, r, pids);
    if (!efter.finns || efter.avvikelser.length) { fel++; console.log(`  ⚠️ tillbakaläsningen avviker: ${efter.avvikelser.join('; ') || 'noden hittas inte'}`); }
    else console.log(`  tillbakaläst: ${efter.id}, ${efter.status}, ${r.procent} %, ${r.handles.length} produkter, en gång per kund, ${r.start} → ${r.slut} ✅`);
  }
  if (fel) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e.message); process.exit(1); });
