// Publicerar lyckohjulet som en Shopify-sida i Bäverbutiken. Idempotent på
// handle: finns sidan uppdateras den, annars skapas den. Läser tillbaka via
// API och hämtar sedan sidan PUBLIKT och kontrollerar att hjulet finns —
// trippelkollen (CLAUDE.md): säg aldrig "klart" utan kundens vy.
//
//   node mejl/hjul-publicera.mjs [--torr] [--offline]
//
// Skriver mejl/output/hjul.html (sidkroppen) och forhandsvisning/hjul.html
// (fristående, för skärmdump) och bokför datumet i konfig.json → lage.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { valjProdukter } from './mallar.mjs';
import { byggHjulsida, byggHjulForhandsvisning } from './hjul.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const UT = join(ROT, 'output');
const torr = process.argv.includes('--torr');
const offline = process.argv.includes('--offline');

const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(ROT, 'copy.json'), 'utf8'));
const h = konfig.hjul;
const titel = copy.hjul.titel;

let shopify = null;
let alla;
if (offline) {
  alla = JSON.parse(readFileSync(join(ROT, 'produkter.json'), 'utf8'));
} else {
  shopify = await import('./shopify.mjs');
  shopify.kravProxy();
  alla = await shopify.hamtaProdukter();
  writeFileSync(join(ROT, 'produkter.json'), JSON.stringify(alla, null, 1));
}
const produkter = valjProdukter(alla, konfig);
for (const p of produkter.gratis) {
  if (p.en_variant === false) {
    console.error(`❌ Vinsten "${p.handle}" har flera varianter — hjulet kan inte lägga den i korgen utan val. Byt i konfig.json.`);
    process.exit(1);
  }
}
const kropp = byggHjulsida({ konfig, copy, produkter });
mkdirSync(join(UT, 'forhandsvisning'), { recursive: true });
writeFileSync(join(UT, 'hjul.html'), kropp);
writeFileSync(join(UT, 'forhandsvisning', 'hjul.html'), byggHjulForhandsvisning({ konfig, copy, produkter }));
console.log(`Hjulsidan: ${(kropp.length / 1024).toFixed(0)} kB, ${produkter.gratis.length} vinster: ${produkter.gratis.map((p) => p.kortnamn).join(', ')}`);

if (torr || offline) {
  console.log(torr ? '--torr: inget skrivet till Shopify.' : '--offline: bara filerna byggda, inget skrivet till Shopify.');
  process.exit(0);
}

// pageByHandle finns inte i 2025-07 — sök och matcha exakt (factory/shopify.mjs).
const q = await shopify.graphql(`query($q: String!) { pages(first: 10, query: $q) { nodes { id handle } } }`, { q: `handle:${h.handle}` });
const finns = (q.pages?.nodes ?? []).find((s) => s.handle === h.handle) ?? null;
const sida = { title: titel, body: kropp, templateSuffix: h.template_suffix, isPublished: true };
let id;
if (finns) {
  const d = await shopify.graphql(
    `mutation($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { id handle } userErrors { field message } } }`,
    { id: finns.id, page: sida }
  );
  id = d.pageUpdate.page.id;
  console.log(`✅ Uppdaterad: ${id}`);
} else {
  const d = await shopify.graphql(
    `mutation($page: PageCreateInput!) { pageCreate(page: $page) { page { id handle } userErrors { field message } } }`,
    { page: { ...sida, handle: h.handle } }
  );
  id = d.pageCreate.page.id;
  console.log(`✅ Skapad: ${id}`);
}

// Tillbakaläsning 1: API:t.
const tillbaka = await shopify.graphql(`query($id: ID!) { page(id: $id) { handle title templateSuffix isPublished body } }`, { id });
const p = tillbaka.page;
if (p.handle !== h.handle || p.templateSuffix !== h.template_suffix || !p.isPublished) {
  console.error(`❌ Tillbakaläsning: handle=${p.handle} suffix=${p.templateSuffix} publicerad=${p.isPublished}`);
  process.exit(1);
}
const diff = Math.abs((p.body ?? '').length - kropp.length);
console.log(`Tillbakaläst via API: ${p.body.length} tecken (källa ${kropp.length}, skillnad ${diff})`);
if (!p.body.includes('id="bbh-data"') || !p.body.includes('<script>')) {
  console.error('❌ Shopify strök skriptet eller datan ur sidkroppen. Sidan fungerar inte.');
  process.exit(1);
}

// Tillbakaläsning 2: kundens vy. Cachen kan ligga kvar några sekunder.
const url = `${konfig.butik.url}/pages/${h.handle}`;
let publik = null;
for (let forsok = 1; forsok <= 4; forsok++) {
  const r = await fetch(url, { headers: { 'Cache-Control': 'no-cache' } });
  const html = await r.text();
  if (r.ok && html.includes('id="bb-hjul"') && html.includes('id="bbh-data"')) {
    publik = html;
    break;
  }
  console.log(`  publik vy försök ${forsok}: ${r.status}, hjulet ${html.includes('id="bb-hjul"') ? 'finns' : 'saknas'} — väntar`);
  await new Promise((ok) => setTimeout(ok, 3000 * forsok));
}
if (!publik) {
  console.error(`❌ ${url} visar inte hjulet. Sidan är skriven men syns inte för kunden — kolla temat/mallen.`);
  process.exit(1);
}
// Datan ska gå att tolka ur kundens vy, med alla vinster kvar. Shopifys
// sidredigerare kan omforma HTML, så det räcker inte att API:t svarar rätt.
const rutan = publik.match(/id="bbh-data"[^>]*>([\s\S]*?)<\/script>/);
let vinsterUte = 0;
try {
  const d = JSON.parse((rutan?.[1] ?? '').replace(/<\\\//g, '</'));
  vinsterUte = Array.isArray(d.vinster) ? d.vinster.length : 0;
} catch (fel) {
  console.error(`❌ Datan i kundens vy går inte att tolka: ${fel.message}`);
  process.exit(1);
}
if (vinsterUte !== produkter.gratis.length) {
  console.error(`❌ Kundens vy har ${vinsterUte} vinster, förväntade ${produkter.gratis.length}.`);
  process.exit(1);
}
console.log(`✅ Publikt: ${url} — hjulet finns, ${vinsterUte} vinster i datan`);

konfig.lage.hjul_publicerad = new Date().toISOString().slice(0, 10);
konfig.lage.hjul_url = url;
writeFileSync(join(ROT, 'konfig.json'), `${JSON.stringify(konfig, null, 2)}\n`);
console.log('Bokfört i konfig.json → lage.hjul_publicerad');
