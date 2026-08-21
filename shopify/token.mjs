#!/usr/bin/env node
// Hämtar Shopify Admin-token och verifierar att kopplingen lever.
// Uppgifterna läses ur environmentets variabler — aldrig ur repot, aldrig ur chatten.
//
// Varje butik konfigureras med tre variabler, där <NYCKEL> är butikens kortnamn
// (SE, DK, NO, FI, UK, MATSTRUMPOR ...):
//
//   SHOPIFY_SHOP_<NYCKEL>            xxxxxx-yy.myshopify.com   (".myshopify.com" får utelämnas)
//   SHOPIFY_CLIENT_ID_<NYCKEL>       app-nyckeln
//   SHOPIFY_CLIENT_SECRET_<NYCKEL>   shpss_...
//
// Finns SHOPIFY_TOKEN_<NYCKEL> provas den först; svarar butiken inte på den används
// klientnyckeln i stället och en varning skrivs ut.
//
//   node shopify/token.mjs                → lista alla butiker och verifiera var och en
//   node shopify/token.mjs SE             → verifiera en butik
//   node shopify/token.mjs SE --token     → skriv även ut access token i klartext
//   node shopify/token.mjs SE --json      → maskinläsbart svar

const API_VERSION = '2026-07';

const args = process.argv.slice(2);
const flaggor = new Set(args.filter(a => a.startsWith('--')));
const valdNyckel = args.find(a => !a.startsWith('--'))?.toUpperCase();
const visaToken = flaggor.has('--token');
const somJson = flaggor.has('--json');

// Alla butiker som finns i environmentet, härledda ur SHOPIFY_SHOP_*.
function hittaButiker() {
  return Object.keys(process.env)
    .map(k => k.match(/^SHOPIFY_SHOP_(.+)$/)?.[1])
    .filter(Boolean)
    .sort();
}

const domän = värde => (värde.includes('.') ? värde : `${värde}.myshopify.com`);
const maskera = t => (t ? `${t.slice(0, 9)}…${t.slice(-4)}` : '');

function konfig(nyckel) {
  const butik = process.env[`SHOPIFY_SHOP_${nyckel}`];
  if (!butik) throw new Error(`SHOPIFY_SHOP_${nyckel} saknas i environmentet.`);
  return {
    nyckel,
    butik: domän(butik),
    klientId: process.env[`SHOPIFY_CLIENT_ID_${nyckel}`],
    hemlighet: process.env[`SHOPIFY_CLIENT_SECRET_${nyckel}`],
    fastToken: process.env[`SHOPIFY_TOKEN_${nyckel}`],
  };
}

// Hämtar en färsk token via client_credentials.
async function oauthToken(c) {
  if (!c.klientId || !c.hemlighet) {
    throw new Error(
      `SHOPIFY_CLIENT_ID_${c.nyckel} eller SHOPIFY_CLIENT_SECRET_${c.nyckel} saknas ` +
      `(och ingen SHOPIFY_TOKEN_${c.nyckel} finns).`,
    );
  }

  const svar = await fetch(`https://${c.butik}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: c.klientId,
      client_secret: c.hemlighet,
      grant_type: 'client_credentials',
    }),
  });

  const text = await svar.text();
  if (!svar.ok) throw new Error(`OAuth ${svar.status}: ${text.slice(0, 200)}`);

  const data = JSON.parse(text);
  if (!data.access_token) throw new Error(`Inget access_token i svaret: ${text.slice(0, 200)}`);

  return {
    token: data.access_token,
    källa: 'client_credentials',
    scope: data.scope,
    giltigTimmar: data.expires_in ? Math.round(data.expires_in / 3600) : undefined,
  };
}

const FRÅGA = `{
  shop { name myshopifyDomain primaryDomain { url } currencyCode }
  productsCount { count }
}`;

async function verifiera(c, token) {
  const svar = await fetch(`https://${c.butik}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: FRÅGA }),
  });

  const text = await svar.text();
  if (!svar.ok) throw new Error(`GraphQL ${svar.status}: ${text.slice(0, 200)}`);

  const data = JSON.parse(text);
  // Shopify svarar 200 även på behörighetsfel — felen ligger i errors[].
  if (data.errors?.length) throw new Error(data.errors.map(e => e.message).join('; '));

  return { ...data.data.shop, antalProdukter: data.data.productsCount.count };
}

// SHOPIFY_TOKEN_* provas först, men verifieras innan den godtas: håller den inte
// faller vi tillbaka på client_credentials, så en död token inte tar ner butiken.
async function kör(nyckel) {
  const c = konfig(nyckel);
  const varningar = [];

  if (c.fastToken) {
    try {
      const butik = await verifiera(c, c.fastToken);
      return { nyckel, token: c.fastToken, källa: `SHOPIFY_TOKEN_${nyckel}`, butik, varningar };
    } catch (e) {
      varningar.push(`SHOPIFY_TOKEN_${nyckel} fungerar inte (${e.message.slice(0, 90)}) — använde klientnyckeln i stället.`);
    }
  }

  const { token, ...meta } = await oauthToken(c);
  const butik = await verifiera(c, token);
  return { nyckel, token, ...meta, butik, varningar };
}

const nycklar = valdNyckel ? [valdNyckel] : hittaButiker();

if (nycklar.length === 0) {
  console.error('Inga Shopify-butiker i environmentet (letade efter SHOPIFY_SHOP_*).');
  console.error('Lägg till tre variabler per butik, t.ex:');
  console.error('  SHOPIFY_SHOP_MATSTRUMPOR, SHOPIFY_CLIENT_ID_MATSTRUMPOR, SHOPIFY_CLIENT_SECRET_MATSTRUMPOR');
  process.exit(1);
}

const resultat = [];
let fel = 0;

for (const nyckel of nycklar) {
  try {
    const r = await kör(nyckel);
    resultat.push({ ok: true, ...r });
    if (!somJson) {
      const scope = r.scope ? ` · scopes: ${r.scope}` : '';
      const giltig = r.giltigTimmar ? ` · giltig ${r.giltigTimmar} h` : '';
      console.log(`✅ ${nyckel.padEnd(12)} ${r.butik.name} — ${r.butik.antalProdukter} produkter (${r.butik.currencyCode})`);
      console.log(`   ${r.butik.primaryDomain.url}  ·  ${r.butik.myshopifyDomain}`);
      console.log(`   token: ${visaToken ? r.token : maskera(r.token)} (${r.källa})${giltig}${scope}`);
      for (const v of r.varningar) console.log(`   ⚠️  ${v}`);
    }
  } catch (e) {
    fel++;
    resultat.push({ ok: false, nyckel, fel: e.message });
    if (!somJson) console.log(`❌ ${nyckel.padEnd(12)} ${e.message}`);
  }
}

if (somJson) {
  // Token utelämnas ur JSON om inte --token angetts, så den inte råkar hamna i en loggfil.
  console.log(JSON.stringify(
    resultat.map(r => (visaToken ? r : { ...r, token: undefined })),
    null,
    2,
  ));
}

process.exit(fel > 0 ? 1 : 0);
