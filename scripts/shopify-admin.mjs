#!/usr/bin/env node
// Shopify Admin-API för Bäverbutikens butiker (SE/DK/NO/FI/UK).
// Läser SHOPIFY_SHOP_<CC>, SHOPIFY_CLIENT_ID_<CC>, SHOPIFY_CLIENT_SECRET_<CC>
// (och ev. SHOPIFY_TOKEN_<CC>) ur environmentet. Skriver ALDRIG ut tokens.
//
// Användning (från repo-roten):
//   node scripts/shopify-admin.mjs butik SE
//   node scripts/shopify-admin.mjs kolla-rabatt SE VALKOMMEN10
//   node scripts/shopify-admin.mjs skapa-rabatt SE VALKOMMEN10 10 "Välkommen – nyhetsbrev 10 %"
//   node scripts/shopify-admin.mjs tema-lista SE
//   node scripts/shopify-admin.mjs tema-installera-skrapkort DK <temaId>   (kräver read_themes+write_themes)
//   node scripts/shopify-admin.mjs tema-ta-bort-skrapkort SE <temaId>
//
// Spärr: vägrar röra butiker vars namn/URL ser ut som Grillkliniken-sidan
// (bbq/grill/matstrump) — två verksamheter, blandas aldrig.
//
// KRÄVER att appen har rätt behörigheter i respektive butik. Rabattkommandona
// kräver read_discounts + write_discounts; per 2026-08-23 har apparna bara
// products/inventory/publications, så de måste läggas till i appens
// konfiguration innan skapa-rabatt fungerar.

const API_V = "2025-07";

const [, , kommando, cc, ...rest] = process.argv;

function fel(msg) {
  console.error("FEL:", msg);
  process.exit(1);
}

if (!kommando || !cc) fel("användning: butik|kolla-rabatt|skapa-rabatt|tema-lista|tema-installera-skrapkort <SE|DK|NO|FI|UK> ...");

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
  if (j.errors) fel(`API-fel (${CC}): ` + JSON.stringify(j.errors).slice(0, 500));
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


if (kommando === "tema-lista") {
  const d = await gql(token, "{ themes(first: 20) { nodes { id name role } } }");
  d.themes.nodes.forEach((t) => console.log(`${t.role.padEnd(12)} ${t.id.split("/").pop()}  ${t.name}`));
  process.exit(0);
}

// Installerar skrapkortet i ett OPUBLICERAT tema (utkast) + lägger in
// section-raden i layout/theme.liquid. Vägrar röra MAIN-temat.
//   node scripts/shopify-admin.mjs tema-installera-skrapkort <CC> <temaId>
if (kommando === "tema-installera-skrapkort") {
  const temaId = rest[0];
  if (!temaId) fel("ange tema-id (siffrorna från tema-lista)");
  const gid = `gid://shopify/OnlineStoreTheme/${temaId}`;
  const t = (await gql(token, "query($id: ID!) { theme(id: $id) { name role } }", { id: gid })).theme;
  if (!t) fel("temat finns inte");
  if (t.role === "MAIN") fel(`"${t.name}" är LIVETEMAT — installera bara i utkast (duplicera temat i admin först)`);
  const { readFileSync } = await import("node:fs");
  const sektion = readFileSync(new URL(`../theme/skrapkort/${CC.toLowerCase()}-skrapkort.liquid`, import.meta.url), "utf8");

  const layout = (await gql(token,
    `query($id: ID!) { theme(id: $id) { files(filenames: ["layout/theme.liquid"], first: 1) { nodes { body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
    { id: gid })).theme.files.nodes[0]?.body?.content;
  if (!layout) fel("hittar inte layout/theme.liquid i temat");
  let nyLayout = layout;
  if (!layout.includes("section 'skrapkort'")) {
    if (!layout.includes("</body>")) fel("layout/theme.liquid saknar </body>");
    nyLayout = layout.replace("</body>", "  {% section 'skrapkort' %}\n  </body>");
  }

  const filer = [{ filename: "sections/skrapkort.liquid", body: { type: "TEXT", value: sektion } }];
  if (nyLayout !== layout) filer.push({ filename: "layout/theme.liquid", body: { type: "TEXT", value: nyLayout } });
  const r = await gql(token,
    `mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
      themeFilesUpsert(themeId: $id, files: $files) {
        upsertedThemeFiles { filename }
        userErrors { field message }
      }
    }`, { id: gid, files: filer });
  const res = r.themeFilesUpsert;
  if (res.userErrors?.length) fel(JSON.stringify(res.userErrors));
  console.log(`${identitet}\nINSTALLERAT i utkastet "${t.name}": ${res.upsertedThemeFiles.map((f) => f.filename).join(", ")}`);
  console.log("Förhandsgranska utkastet i admin → Webbshop → Teman → Förhandsgranska.");
  process.exit(0);
}


// Tar BORT skrapkortet ur ett OPUBLICERAT tema (utkast): raderar
// sections/skrapkort.liquid och plockar bort section-raden ur layouten.
// Vägrar röra MAIN-temat.
//   node scripts/shopify-admin.mjs tema-ta-bort-skrapkort <CC> <temaId>
if (kommando === "tema-ta-bort-skrapkort") {
  const temaId = rest[0];
  if (!temaId) fel("ange tema-id (siffrorna från tema-lista)");
  const gid = `gid://shopify/OnlineStoreTheme/${temaId}`;
  const t = (await gql(token, "query($id: ID!) { theme(id: $id) { name role } }", { id: gid })).theme;
  if (!t) fel("temat finns inte");
  if (t.role === "MAIN") fel(`"${t.name}" är LIVETEMAT — ändra bara utkast (duplicera temat i admin först)`);

  const layout = (await gql(token,
    `query($id: ID!) { theme(id: $id) { files(filenames: ["layout/theme.liquid"], first: 1) { nodes { body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`,
    { id: gid })).theme.files.nodes[0]?.body?.content;
  if (!layout) fel("hittar inte layout/theme.liquid i temat");

  const nyLayout = layout
    .split("\n")
    .filter((rad) => !/{%-?\s*section\s+'skrapkort'\s*-?%}/.test(rad))
    .join("\n");
  const gjort = [];

  if (nyLayout !== layout) {
    const r1 = await gql(token,
      `mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) {
        themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { field message } }
      }`,
      { id: gid, files: [{ filename: "layout/theme.liquid", body: { type: "TEXT", value: nyLayout } }] });
    if (r1.themeFilesUpsert.userErrors?.length) fel(JSON.stringify(r1.themeFilesUpsert.userErrors));
    gjort.push("section-raden borttagen ur layout/theme.liquid");
  } else {
    gjort.push("layouten hade ingen skrapkort-rad (redan borta?)");
  }

  const fanns = (await gql(token,
    `query($id: ID!) { theme(id: $id) { files(filenames: ["sections/skrapkort.liquid"], first: 1) { nodes { filename } } } }`,
    { id: gid })).theme.files.nodes.length > 0;
  if (fanns) {
    const r2 = await gql(token,
      `mutation($id: ID!, $files: [String!]!) {
        themeFilesDelete(themeId: $id, files: $files) { deletedThemeFiles { filename } userErrors { field message } }
      }`, { id: gid, files: ["sections/skrapkort.liquid"] });
    if (r2.themeFilesDelete.userErrors?.length) fel(JSON.stringify(r2.themeFilesDelete.userErrors));
    gjort.push("sections/skrapkort.liquid raderad");
  } else {
    gjort.push("sections/skrapkort.liquid fanns inte i temat");
  }
  console.log(`${identitet}\nUTKAST "${t.name}":\n- ` + gjort.join("\n- "));
  console.log("Förhandsgranska i admin → Webbshop → Teman → Förhandsgranska. Publicera när det ser rätt ut.");
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
  const res = d?.discountCodeBasicCreate;
  if (!res) fel(`Shopify svarade tomt på rabattskapandet (${CC}) — saknar appen write_discounts?`);
  if (res.userErrors?.length) fel(JSON.stringify(res.userErrors));
  const c = res.codeDiscountNode.codeDiscount;
  console.log(
    `${identitet}\nSKAPAD: ${c.codes.nodes[0].code} | ${c.title} | ${procent} % | status ${c.status} | en gång/kund: ${c.appliesOncePerCustomer}`
  );
  process.exit(0);
}

fel(`okänt kommando: ${kommando}`);
