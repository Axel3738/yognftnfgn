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

// Dubblettspärr: har produkten redan recensioner importeras inget. Judge.me
// har ingen egen spärr — kör man två gånger får produkten allt i dubbel
// upplaga, och det syns bara som konstiga siffror i widgeten.
//
// Två steg, för att /reviews filtrerar på Judge.me:s EGET produkt-id, inte på
// Shopifys. Skickar man Shopify-id:t som external_id ignoreras parametern tyst
// och man får butikens senaste recensioner i stället — det ser ut som en träff
// och skulle spärra varje produkt. Verifierat mot API:et 2026-08-30.
async function judgemeGet(sökväg, params) {
  const url = new URL(`https://api.judge.me/api/v1${sökväg}`);
  url.searchParams.set('api_token', TOKEN);
  url.searchParams.set('shop_domain', SHOP);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url);
  return { ok: r.ok, status: r.status, kropp: await r.json().catch(() => ({})) };
}

const produktSvar = await judgemeGet('/products/-1', { external_id: productId });
if (!produktSvar.ok && produktSvar.kropp?.error !== 'Product not found') {
  console.error(`Kunde inte slå upp produkten (${produktSvar.status}): ${JSON.stringify(produktSvar.kropp).slice(0, 200)}`);
  process.exit(1);
}
const judgemeId = produktSvar.kropp?.product?.id ?? null;

// Reservväg när Judge.me vägrar filtrera: butikens alla recensioner läses
// sidvis och filtreras här på Shopify-id:t. Långsammare men alltid sant.
async function raknaViaSvep(shopifyId) {
  let synliga = 0;
  for (let sida = 1; sida <= 50; sida++) {
    const svar = await judgemeGet('/reviews', { per_page: '100', page: String(sida) });
    if (!svar.ok) {
      console.error(`Kunde inte läsa butikens recensioner (${svar.status}) — vägrar gissa.`);
      process.exit(1);
    }
    const rev = svar.kropp.reviews ?? [];
    if (rev.length === 0) break;
    synliga += rev.filter(
      (r) => Number(r.product_external_id) === Number(shopifyId) && r.published && !r.hidden,
    ).length;
  }
  return synliga;
}

if (judgemeId) {
  const revSvar = await judgemeGet('/reviews', { product_id: String(judgemeId), per_page: '100' });
  // Bara det kunden faktiskt ser räknas. En avpublicerad eller dold recension
  // är bortstädad i praktiken (Judge.me:s v1-API kan inte radera, bara dölja),
  // och ska inte spärra en omkörning som ersätter den.
  let antal;
  if (revSvar.ok) {
    antal = (revSvar.kropp.reviews ?? []).filter((r) => r.published && !r.hidden).length;
  } else if (/too big/i.test(String(revSvar.kropp?.error ?? ''))) {
    // Judge.me avvisar sina EGNA nyare produkt-id:n som "too big" (422) —
    // gränsen ligger under 10 siffror, så varje produkt som skapas numera
    // träffar den. Utan reservvägen skulle spärren avbryta varje ny produkt
    // och rutinen stanna. Uppmätt 2026-09-09 på Adventskalender Racerbiler
    // (Judge.me-id 2150178134): products/-1 svarar 200, /reviews svarar 422.
    console.log(`Judge.me avvisar produkt-id ${judgemeId} som "för stort" — räknar via butikssvep i stället.`);
    antal = await raknaViaSvep(productId);
  } else {
    console.error(`Kunde inte läsa befintliga recensioner (${revSvar.status}).`);
    process.exit(1);
  }
  if (antal > 0 && !args.includes('--anda')) {
    console.log(`Produkt ${productId} har redan ${antal} synliga recensioner i ${SHOP} — hoppar över.`);
    console.log('Ska de läggas till ändå (t.ex. en påbyggnadsbatch): kör om med --anda.');
    process.exit(0);
  }
}

const rader = parseCsv(fs.readFileSync(csvFil, 'utf8'));
console.log(`${rader.length} recensioner i ${csvFil} → produkt ${productId} i ${SHOP}${dry ? ' (DRY — inget skickas)' : ''}`);

// Datumvakten (Axels bakläxa 2026-09-08, TankGuard): utan review_date får
// varje recension importögonblicket som datum — "för 12 minuter sedan" på
// allihop skriker fejk. Originaldatumen finns i källan; saknas de är det
// ett skrapfel som ska lagas, inte importeras runt. --utan-datum är en
// medveten override, aldrig en utväg.
const utanDatum = rader.filter((r) => !String(r.review_date ?? '').trim());
if (utanDatum.length > 0 && !args.includes('--utan-datum')) {
  console.error(`${utanDatum.length} av ${rader.length} rader saknar review_date — stoppar.`);
  console.error('Hämta originaldatumen från källan (reviews_for_widget har dem).');
  console.error('Måste de importeras utan datum: kör om med --utan-datum.');
  process.exit(1);
}

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

// Efterkontroll av datumen (uppmätt 2026-09-09 på beverbutikken.no): Judge.me:s
// v1-API tar emot created_at utan att klaga men SKRIVER ALDRIG in det — varken
// vid POST eller vid PUT efteråt (PUT svarar "Action performed successful" och
// ändrar ingenting). Recensionerna får importögonblicket i stället, och i
// kundvyn står det "nyss" på allihop. Datumvakten ovan fångar bara rader UTAN
// datum; den här läser tillbaka och säger ifrån när datumet inte tog.
// Enda vägen till äkta datum är CSV-importen i Judge.me-appen.
if (!dry && ok > 0) {
  await new Promise((res) => setTimeout(res, 20000));   // bakgrundsjobbet hos Judge.me
  const idag = new Date().toISOString().slice(0, 10);
  const kalladatum = new Set(
    rader.map((r) => String(r.review_date ?? '').trim().slice(0, 10)).filter(Boolean),
  );
  let importdag = 0, lasta = 0;
  for (let sida = 1; sida <= 50; sida++) {
    const svar = await judgemeGet('/reviews', { per_page: '100', page: String(sida) });
    if (!svar.ok) break;
    const rev = svar.kropp.reviews ?? [];
    if (rev.length === 0) break;
    for (const r of rev) {
      if (Number(r.product_external_id) !== Number(productId)) continue;
      lasta++;
      if (String(r.created_at ?? '').slice(0, 10) === idag && !kalladatum.has(idag)) importdag++;
    }
  }
  if (importdag > 0) {
    console.error(`⚠️ DATUMEN TOG INTE: ${importdag} av ${lasta} recensioner står som ${idag} i stället för källans datum.`);
    console.error('Judge.me:s API skriver inte created_at. I kundvyn står det "nyss" på allihop.');
    console.error(`Rätt väg: ladda upp ${csvFil} som CSV-import i Judge.me-appen — den bevarar datumen.`);
  } else if (lasta > 0) {
    console.log(`Datumen ser rätt ut: ${lasta} recensioner bär källans datum.`);
  }
}
if (!dry && !fel) {
  console.log('Verifiera i Judge.me-adminen att recensionerna ligger på rätt produkt innan nästa steg.');
}
process.exit(fel ? 1 : 0);
