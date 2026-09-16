// Liten Admin API-klient för matstrumpor.se.
// Hämtar token via client_credentials (samma väg som shopify/token.mjs) och
// kör GraphQL. Butiksnyckeln är låst till MATSTRUMPOR med flit — det här
// verktyget ska aldrig kunna råka peka på Bäverbutiken.

const NYCKEL = 'MATSTRUMPOR';
const API_VERSION = '2026-07';
const FÖRVÄNTAD_DOMÄN = 'matstrumpor.se';
const MYSHOPIFY = '1r46tp-qx.myshopify.com'; // avläst ur live-sajtens Shopify.shop 2026-09-16

const domän = v => (v.includes('.') ? v : `${v}.myshopify.com`);

export function butiksDomän() {
  const v = process.env[`SHOPIFY_SHOP_${NYCKEL}`];
  if (!v) {
    throw new Error(
      `SHOPIFY_SHOP_${NYCKEL} saknas i environmentet. Butiken är ${MYSHOPIFY} — lägg in ` +
      `SHOPIFY_SHOP_${NYCKEL}, SHOPIFY_CLIENT_ID_${NYCKEL} och SHOPIFY_CLIENT_SECRET_${NYCKEL} i environmentet.`,
    );
  }
  return domän(v);
}

let cachadToken = null;

export async function token() {
  if (cachadToken) return cachadToken;

  const butik = butiksDomän(); // kastar med hela listan på variabler om butiken saknas
  const klientId = process.env[`SHOPIFY_CLIENT_ID_${NYCKEL}`];
  const hemlighet = process.env[`SHOPIFY_CLIENT_SECRET_${NYCKEL}`];
  if (!klientId || !hemlighet) {
    throw new Error(`SHOPIFY_CLIENT_ID_${NYCKEL} / SHOPIFY_CLIENT_SECRET_${NYCKEL} saknas i environmentet (butiken ${MYSHOPIFY}).`);
  }

  const svar = await fetch(`https://${butik}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: klientId, client_secret: hemlighet, grant_type: 'client_credentials' }),
  });
  const text = await svar.text();
  if (!svar.ok) throw new Error(`OAuth ${svar.status}: ${text.slice(0, 300)}`);

  const data = JSON.parse(text);
  if (!data.access_token) throw new Error(`Inget access_token i svaret: ${text.slice(0, 300)}`);
  cachadToken = data.access_token;
  return cachadToken;
}

// Kör GraphQL. Kastar på både HTTP-fel och errors[] — Shopify svarar 200 på
// behörighetsfel, så errors[] måste läsas eller så ser ett nekat anrop ut att lyckas.
export async function gql(query, variables = {}) {
  const t = await token();
  const svar = await fetch(`https://${butiksDomän()}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': t, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const text = await svar.text();
  if (!svar.ok) throw new Error(`GraphQL ${svar.status}: ${text.slice(0, 400)}`);

  const data = JSON.parse(text);
  if (data.errors?.length) throw new Error(data.errors.map(e => e.message).join('; '));
  return data.data;
}

// Spärren mot fel butik. Körs före allt som skriver.
export async function kontrolleraButik() {
  const d = await gql('{ shop { name myshopifyDomain primaryDomain { host } } }');
  const värd = d.shop.primaryDomain.host;
  if (värd !== FÖRVÄNTAD_DOMÄN) {
    throw new Error(`FEL BUTIK: primär domän är ${värd}, förväntade ${FÖRVÄNTAD_DOMÄN}. Avbryter.`);
  }
  return d.shop;
}
