#!/usr/bin/env node
// Shopify Admin-API för Bäverbutikens butiker (SE/DK/NO/FI/UK).
// Läser SHOPIFY_SHOP_<CC>, SHOPIFY_CLIENT_ID_<CC>, SHOPIFY_CLIENT_SECRET_<CC>
// (och ev. SHOPIFY_TOKEN_<CC>) ur environmentet. Skriver ALDRIG ut tokens.
//
// Användning (från repo-roten):
//   node scripts/shopify-admin.mjs butik SE
//   node scripts/shopify-admin.mjs kolla-rabatt SE VALKOMMEN10
//   node scripts/shopify-admin.mjs skapa-rabatt SE VALKOMMEN10 10 "Välkommen – nyhetsbrev 10 %"
//
// Spärr: vägrar röra butiker vars namn/URL ser ut som Grillkliniken-sidan
// (bbq/grill/matstrump) — två verksamheter, blandas aldrig.

const API_V = "2025-07";

const [, , kommando, cc, ...rest] = process.argv;

function fel(msg) {
  console.error("FEL:", msg);
  process.exit(1);
}

if (!kommando || !cc) fel("användning: butik|kolla-rabatt|skapa-rabatt <SE|DK|NO|FI|UK> ...");

const CC = cc.toUpperCase();
const shop = process.env[`SHOPIFY_SHOP_${CC}`];
if (!shop) fel(`SHOPIFY_SHOP_${CC} saknas i environmentet`);

async function hamtaToken() {
  const direkt = process.env[`SHOPIFY_TOKEN_${CC}`];
  if (direkt) {
    // testa att den lever innan vi litar på den
    const r = await fetch(`https://${shop}/admin/api/${API_V}/graphql.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": direkt },
      body: JSON.stringify({ query: "{ shop { name } }" }),
    });
    const j = await r.json();
    if (!j.errors) return direkt;
    console.error(`(SHOPIFY_TOKEN_${CC} är ogiltig — byter client-credentials mot färsk token)`);
  }
  const id = process.env[`SHOPIFY_CLIENT_ID_${CC}`];
  const secret = process.env[`SHOPIFY_CLIENT_SECRET_${CC}`];
  if (!id || !secret) fel(`varken giltig SHOPIFY_TOKEN_${CC} eller client-credentials för ${CC}`);
  const r = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
  });
  if (!r.ok) fel(`token-utbytet misslyckades för ${CC}: HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  if (!j.access_token) fel(`token-utbytet gav ingen access_token för ${CC}`);
  return j.access_token;
}

async function gql(token, query, variables = {}) {
  const r = await fetch(`https://${shop}/admin/api/${API_V}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors && !j.data) fel(`API-fel (${CC}): ` + JSON.stringify(j.errors).slice(0, 300));
  return j.data;
}

const token = await hamtaToken();

const info = (await gql(token, "{ shop { name url myshopifyDomain currencyCode } }")).shop;
const identitet = `${info.name} | ${info.url} | ${info.currencyCode}`;

// Verksamhetsspärren — kör före ALLT annat.
const farligt = ["bbq", "grill", "matstrump"];
if (farligt.some((w) => (info.name + info.url).toLowerCase().includes(w))) {
  fel(`${CC} pekar på "${identitet}" — det ser ut som fel verksamhet. Rör den inte.`);
}

if (kommando === "butik") {
  console.log(identitet);
  process.exit(0);
}

const kod = rest[0];
if (!kod) fel("ange rabattkod");

const befintlig = (
  await gql(token, "query($c: String!) { codeDiscountNodeByCode(code: $c) { id } }", { c: kod })
).codeDiscountNodeByCode;

if (kommando === "kolla-rabatt") {
  console.log(`${identitet}\n${kod}: ${befintlig ? "FINNS (" + befintlig.id + ")" : "finns inte"}`);
  process.exit(0);
}

if (kommando === "skapa-rabatt") {
  const procent = Number(rest[1]);
  const titel = rest.slice(2).join(" ");
  if (!procent || procent < 1 || procent > 100) fel("ange procent 1–100");
  if (!titel) fel("ange titel");
  if (befintlig) {
    console.log(`${identitet}\n${kod}: FINNS REDAN (${befintlig.id}) — skapar inte om.`);
    process.exit(0);
  }
  const d = await gql(
    token,
    `mutation skapa($input: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $input) {
        codeDiscountNode { id codeDiscount { ... on DiscountCodeBasic {
          title status startsAt appliesOncePerCustomer codes(first: 1) { nodes { code } }
        } } }
        userErrors { field message }
      }
    }`,
    {
      input: {
        title: titel,
        code: kod,
        startsAt: new Date().toISOString(),
        customerSelection: { all: true },
        customerGets: { value: { percentage: procent / 100 }, items: { all: true } },
        appliesOncePerCustomer: true,
      },
    }
  );
  const res = d.discountCodeBasicCreate;
  if (res.userErrors?.length) fel(JSON.stringify(res.userErrors));
  const c = res.codeDiscountNode.codeDiscount;
  console.log(
    `${identitet}\nSKAPAD: ${c.codes.nodes[0].code} | ${c.title} | ${procent} % | status ${c.status} | en gång/kund: ${c.appliesOncePerCustomer}`
  );
  process.exit(0);
}

fel(`okänt kommando: ${kommando}`);
