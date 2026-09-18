#!/usr/bin/env node
// Publicerar recensioner som Judge.mes egna spamfilter har märkt som spam på EN
// namngiven produkt. Läser tillbaka efteråt.
//
//   node tools/judgeme-publicera.mjs --product-handle <handle> \
//     --store-url https://beverbutikken.no \
//     --shop-domain "$JUDGEME_NO_SHOP_DOMAIN" --token-env JUDGEME_NO_API_TOKEN [--dry]
//
// VARFÖR: uppmätt 2026-09-16→18 på beverbutikken.no tar Judge.mes spamfilter
// hela importer — POST svarar 201 på varje rad, men raderna får
// `curated: spam` + `published: false` och syns aldrig för kunden. Antalet steg
// 1 → 5 → 14 → 18 på fyra dagar. PUT med {published, hidden, curated} svarar
// 200 OCH ÄNDRAR på riktigt (till skillnad från created_at, som API:t aldrig
// skriver).
//
// TVÅ SPÄRRAR, båda medvetna:
//   1. Bara EN produkt per körning, angiven med handle. Aldrig ett svep över
//      butiken — samma princip som PAUSED i annonskontot: en rad någon annan
//      har gömt med flit får aldrig plockas fram av en rutin.
//   2. Bara rader med `curated === 'spam'`. En rad som är dold på annat sätt
//      (hidden, opublicerad utan spam-märkning) lämnas orörd och rapporteras.
//
// ⚠️ Spam-märkta rader på en produkt som FORTFARANDE har synliga recensioner är
// oftast dubbletter — samma CSV uppladdad två gånger — och då är märkningen
// RÄTT. Verktyget säger ifrån i det läget i stället för att publicera dubbletter.
// Kör det ändå med --anda om du vet att de inte är dubbletter.

const args = process.argv.slice(2);
function flagga(namn) {
  const i = args.indexOf(namn);
  return i >= 0 && i + 1 < args.length ? args[i + 1] : null;
}

const handle = flagga('--product-handle');
const storeUrl = (flagga('--store-url') ?? 'https://beverbutikken.no').replace(/\/$/, '');
const shopDomain = flagga('--shop-domain') ?? process.env.JUDGEME_NO_SHOP_DOMAIN;
const tokenEnv = flagga('--token-env') ?? 'JUDGEME_NO_API_TOKEN';
const token = process.env[tokenEnv];
const dry = args.includes('--dry');
const anda = args.includes('--anda');

if (!handle) {
  console.error('Saknar --product-handle. Verktyget rör aldrig mer än en produkt per körning.');
  process.exit(2);
}
if (!token) {
  console.error(`Saknar token i miljövariabeln ${tokenEnv}.`);
  process.exit(2);
}
if (!shopDomain) {
  console.error('Saknar --shop-domain (eller JUDGEME_NO_SHOP_DOMAIN).');
  process.exit(2);
}

function url(vag) {
  const u = new URL(`https://api.judge.me/api/v1${vag}`);
  u.searchParams.set('api_token', token);
  u.searchParams.set('shop_domain', shopDomain);
  return u;
}

// Shopify-id:t ur butikens publika produktfeed — samma väg som importskriptet.
const prodSvar = await fetch(`${storeUrl}/products/${handle}.json`);
if (!prodSvar.ok) {
  console.error(`Hittar inte produkten ${handle} i ${storeUrl} (${prodSvar.status}).`);
  process.exit(1);
}
const productId = (await prodSvar.json()).product.id;
console.log(`${handle} -> produkt ${productId} i ${storeUrl}`);

async function hamtaProduktens() {
  const traffar = [];
  for (let sida = 1; sida <= 50; sida++) {
    const u = url('/reviews');
    u.searchParams.set('per_page', '100');
    u.searchParams.set('page', String(sida));
    const r = await fetch(u);
    if (!r.ok) {
      console.error(`Kunde inte läsa butikens recensioner (${r.status}) — vägrar gissa.`);
      process.exit(1);
    }
    const rev = (await r.json()).reviews ?? [];
    if (rev.length === 0) break;
    traffar.push(...rev.filter((x) => Number(x.product_external_id) === Number(productId)));
  }
  return traffar;
}

const fore = await hamtaProduktens();
const spam = fore.filter((r) => r.curated === 'spam');
const synliga = fore.filter((r) => r.published && !r.hidden);
const dolda = fore.filter((r) => !r.published && r.curated !== 'spam');

console.log(`${fore.length} rader på produkten: ${synliga.length} synliga, ${spam.length} spam, ${dolda.length} dolda på annat sätt`);
if (dolda.length > 0) {
  console.log(`  ${dolda.length} rader är opublicerade UTAN spam-märkning — de rörs inte.`);
}

if (spam.length === 0) {
  console.log('Inget att göra.');
  process.exit(0);
}

if (synliga.length > 0 && !anda) {
  console.error(`\n⚠️ Produkten har redan ${synliga.length} synliga recensioner.`);
  console.error('De spam-märkta är då sannolikt DUBBLETTER (samma CSV uppladdad två gånger),');
  console.error('och märkningen är rätt. Publicera dem bara om du vet att de inte är dubbletter:');
  console.error('kör om med --anda.');
  process.exit(1);
}

for (const r of spam) {
  if (dry) {
    console.log(`  DRY ${r.reviewer?.name ?? r.id} | "${r.title}"`);
    continue;
  }
  const svar = await fetch(url(`/reviews/${r.id}`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ published: true, hidden: false, curated: 'ok' }),
  });
  console.log(`  ${svar.ok ? 'OK ' : 'FEL'} ${svar.status} ${r.reviewer?.name ?? r.id} | "${r.title}"`);
  await new Promise((res) => setTimeout(res, 600));
}

if (dry) {
  console.log(`\nDRY — ${spam.length} rader skulle publicerats. Inget skickades.`);
  process.exit(0);
}

// Tillbakaläsning: en PUT som svarar 200 är inte samma sak som en rad som syns.
await new Promise((res) => setTimeout(res, 8000));
const efter = await hamtaProduktens();
const kvarSpam = efter.filter((r) => r.curated === 'spam').length;
const nuSynliga = efter.filter((r) => r.published && !r.hidden).length;
console.log(`\nefter: ${efter.length} rader, ${nuSynliga} synliga, ${kvarSpam} spam`);
if (kvarSpam > 0) {
  console.error(`⚠️ ${kvarSpam} rader är fortfarande spam-märkta — publiceringen tog inte på dem.`);
  process.exit(1);
}
