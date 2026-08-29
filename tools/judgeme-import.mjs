#!/usr/bin/env node
// Importerar produktrecensioner till Judge.me via deras REST-API — ingen CSV-
// uppladdning i appen behövs. Noll beroenden (inbyggd fetch).
//
//   node tools/judgeme-import.mjs <reviews.csv> --product-id <shopify-produkt-id> [--dry]
//
// CSV-formatet är Judge.me:s eget (kolumnerna i <Produkt>_REVIEWS-sheetsen):
//   title,body,rating,review_date,reviewer_name,reviewer_email,product_id,product_handle,reply,picture_urls
//
// Sheetens product_handle IGNORERAS medvetet: den är ofta fel (skriven ur
// produktens titel, inte ur butiken) och ett fel handle importerar tyst mot
// ingenting. Kopplingen görs i stället via --product-id, Shopify-produktens
// numeriska id, som hämtas ur butiken vid körning.
//
// Kräver env: JUDGEME_API_TOKEN (privata tokenen), JUDGEME_SHOP_DOMAIN
// (t.ex. 4snrw0-mg.myshopify.com).

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
const csvFil = args.find((a) => !a.startsWith('--'));
const productId = args[args.indexOf('--product-id') + 1];
const dry = args.includes('--dry');

const TOKEN = process.env.JUDGEME_API_TOKEN;
const SHOP = process.env.JUDGEME_SHOP_DOMAIN;
if (!csvFil || !productId || args.indexOf('--product-id') < 0) {
  console.error('Användning: node tools/judgeme-import.mjs <reviews.csv> --product-id <id> [--dry]');
  process.exit(2);
}
if (!TOKEN || !SHOP) {
  console.error('Saknar env-variablerna JUDGEME_API_TOKEN och/eller JUDGEME_SHOP_DOMAIN.');
  process.exit(2);
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
