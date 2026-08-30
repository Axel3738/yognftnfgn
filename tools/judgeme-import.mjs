#!/usr/bin/env node
// Importerar produktrecensioner till Judge.me via deras REST-API — ingen CSV-
// uppladdning i appen behövs. Noll beroenden (inbyggd fetch).
//
//   node tools/judgeme-import.mjs <reviews.csv> --product-id <shopify-produkt-id> [--dry]
//
// Mot en annan butik än den svenska (t.ex. norska), med handle-uppslag:
//   node tools/judgeme-import.mjs <reviews.no.csv> \
//     --product-handle <no-handle> --store-url https://beverbutikken.no \
//     --shop-domain "$JUDGEME_NO_SHOP_DOMAIN" --token-env JUDGEME_NO_API_TOKEN [--dry]
//
// CSV-formatet är Judge.me:s eget (kolumnerna i <Produkt>_REVIEWS-sheetsen):
//   title,body,rating,review_date,reviewer_name,reviewer_email,product_id,product_handle,reply,picture_urls
//
// Sheetens product_handle IGNORERAS medvetet: den är ofta fel (skriven ur
// produktens titel, inte ur butiken) och ett fel handle importerar tyst mot
// ingenting. Kopplingen görs i stället via --product-id, Shopify-produktens
// numeriska id — antingen angivet direkt, eller uppslaget ur butikens publika
// products.json med --product-handle + --store-url.
//
// Kräver env: JUDGEME_API_TOKEN (privata tokenen), JUDGEME_SHOP_DOMAIN
// (t.ex. 4snrw0-mg.myshopify.com). Judge.me-tokens är PER BUTIK — den svenska
// tokenen fungerar inte mot den norska butiken. Peka på en annan butiks token
// med --token-env och dess domän med --shop-domain.

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

// Nodes inbyggda fetch läser inte HTTPS_PROXY utan den här flaggan, och i
// molnmiljön går ALL trafik via proxyn — utan den hänger anropen bara.
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

function parseCsv(text) {
  const rader = []; let fält = [], värde = '', iCitat = false, rad = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (iCitat) {
      if (c === '"' && text[i + 1] === '"') { värde += '"'; i++; }
      else if (c === '"') iCitat = false;
      else värde += c;
    } else if (c === '"') iCitat = true;
    else if (c === ',') { rad.push(värde); värde = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      rad.push(värde); värde = '';
      if (rad.some((x) => x !== '')) rader.push(rad);
      rad = [];
    } else värde += c;
  }
  if (värde !== '' || rad.length) { rad.push(värde); if (rad.some((x) => x !== '')) rader.push(rad); }
  const [huvud, ...data] = rader;
  return data.map((r) => Object.fromEntries(huvud.map((k, i) => [k.trim(), (r[i] ?? '').trim()])));
}

const args = process.argv.slice(2);
const flagga = (namn) => (args.indexOf(namn) < 0 ? null : args[args.indexOf(namn) + 1]);
const csvFil = args.find((a) => !a.startsWith('--') && a.endsWith('.csv'));
const dry = args.includes('--dry');

const handle = flagga('--product-handle');
const storeUrl = (flagga('--store-url') || '').replace(/\/$/, '');
const TOKEN = process.env[flagga('--token-env') || 'JUDGEME_API_TOKEN'];
const SHOP = flagga('--shop-domain') || process.env.JUDGEME_SHOP_DOMAIN;

if (!csvFil || (!flagga('--product-id') && !handle)) {
  console.error('Användning: node tools/judgeme-import.mjs <reviews.csv> --product-id <id> [--dry]');
  console.error('       eller: ... --product-handle <handle> --store-url <https://butiken>');
  process.exit(2);
}
if (!TOKEN || !SHOP) {
  console.error(`Saknar token (${flagga('--token-env') || 'JUDGEME_API_TOKEN'}) och/eller butiksdomän.`);
  console.error('Judge.me-tokens är per butik — den svenska gäller inte för den norska butiken.');
  process.exit(2);
}

// Handle -> numeriskt produkt-id via butikens publika feed (ingen token behövs).
let productId = flagga('--product-id');
if (!productId) {
  if (!storeUrl) { console.error('--product-handle kräver --store-url.'); process.exit(2); }
  let träff = null;
  for (let sida = 1; sida <= 5 && !träff; sida++) {
    const r = await fetch(`${storeUrl}/products.json?limit=250&page=${sida}`);
    if (!r.ok) { console.error(`Kunde inte läsa ${storeUrl}/products.json (${r.status}).`); process.exit(1); }
    const produkter = (await r.json()).products ?? [];
    if (produkter.length === 0) break;
    träff = produkter.find((p) => p.handle === handle) ?? null;
  }
  if (!träff) { console.error(`Hittade inget handle "${handle}" i ${storeUrl}.`); process.exit(1); }
  productId = String(träff.id);
  console.log(`${handle} -> produkt ${productId} i ${storeUrl}`);
}

const rader = parseCsv(fs.readFileSync(csvFil, 'utf8'));
console.log(`${rader.length} recensioner i ${csvFil} → produkt ${productId} i ${SHOP}${dry ? ' (DRY — inget skickas)' : ''}`);

let ok = 0, fel = 0;
for (const r of rader) {
  const payload = {
    api_token: TOKEN, shop_domain: SHOP, platform: 'shopify',
    id: Number(productId),
    name: r.reviewer_name, email: r.reviewer_email,
    rating: Number(r.rating), title: r.title, body: r.body,
    ...(r.review_date ? { created_at: r.review_date } : {}),
  };
  if (dry) { console.log(`  DRY ${r.reviewer_name} | ${r.rating}★ | "${r.title}"`); ok++; continue; }
  try {
    const resp = await fetch('https://api.judge.me/api/v1/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    });
    const text = (await resp.text()).slice(0, 120);
    console.log(`  ${resp.ok ? 'OK ' : 'FEL'} ${resp.status} ${r.reviewer_name} | ${text}`);
    resp.ok ? ok++ : fel++;
  } catch (e) { console.log(`  FEL ${r.reviewer_name} | ${e.message}`); fel++; }
  await new Promise((res) => setTimeout(res, 1200));   // spamma inte deras API
}
console.log(`klart: ${ok} ok, ${fel} fel`);
if (!dry && !fel) console.log('Verifiera i Judge.me-adminen att recensionerna ligger på rätt produkt innan nästa steg.');
process.exit(fel ? 1 : 0);
