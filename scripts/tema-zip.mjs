#!/usr/bin/env node
// Laddar ner ett helt tema via Admin-API, tar bort skrapkortet och skriver
// en zip som kan laddas upp i Shopify (Teman → Lägg till tema → Ladda upp
// zip-fil) — den hamnar då som OPUBLICERAT utkast.
//
//   node scripts/tema-zip.mjs SE            (MAIN-temat)
//   node scripts/tema-zip.mjs SE <temaId>   (specifikt tema)
//
// Kräver read_themes på butikens app. Skriver aldrig något till Shopify.
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join } from "node:path";

const API_V = "2025-07";
const [, , cc, valtTema] = process.argv;
if (!cc) { console.error("användning: tema-zip.mjs <SE|DK|NO|FI|UK> [temaId]"); process.exit(1); }
const CC = cc.toUpperCase();
const shop = process.env[`SHOPIFY_SHOP_${CC}`];

const tr = await fetch(`https://${shop}/admin/oauth/access_token`, {
  method: "POST", headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ grant_type: "client_credentials",
    client_id: process.env[`SHOPIFY_CLIENT_ID_${CC}`],
    client_secret: process.env[`SHOPIFY_CLIENT_SECRET_${CC}`] }),
});
const token = (await tr.json()).access_token;
if (!token) { console.error("FEL: fick ingen token"); process.exit(1); }

async function gql(query, variables = {}) {
  const r = await fetch(`https://${shop}/admin/api/${API_V}/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) { console.error("FEL:", JSON.stringify(j.errors).slice(0, 400)); process.exit(1); }
  return j.data;
}

// Verksamhetsspärren.
const info = (await gql("{ shop { name url } }")).shop;
if (["bbq", "grill", "matstrump"].some((w) => (info.name + info.url).toLowerCase().includes(w))) {
  console.error(`FEL: ${CC} pekar på "${info.name}" — fel verksamhet.`); process.exit(1);
}

const teman = (await gql("{ themes(first: 20) { nodes { id name role } } }")).themes.nodes;
const tema = valtTema
  ? teman.find((t) => t.id.endsWith("/" + valtTema))
  : teman.find((t) => t.role === "MAIN");
if (!tema) { console.error("FEL: hittar inte temat"); process.exit(1); }
console.log(`Butik: ${info.name} | Tema: "${tema.name}" (${tema.role})`);

const bas = `/tmp/tema-${CC.toLowerCase()}`;
rmSync(bas, { recursive: true, force: true });
mkdirSync(bas, { recursive: true });

let cursor = null, antal = 0, bortplockat = [];
for (;;) {
  const d = await gql(
    `query($id: ID!, $after: String) { theme(id: $id) {
      files(first: 50, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { filename body {
          __typename
          ... on OnlineStoreThemeFileBodyText { content }
          ... on OnlineStoreThemeFileBodyBase64 { contentBase64 }
          ... on OnlineStoreThemeFileBodyUrl { url }
        } }
      } } }`, { id: tema.id, after: cursor });
  for (const f of d.theme.files.nodes) {
    // Skrapkortet åker ut här.
    if (f.filename === "sections/skrapkort.liquid") { bortplockat.push(f.filename); continue; }
    let innehall;
    if (f.body.__typename === "OnlineStoreThemeFileBodyText") {
      innehall = f.body.content;
      if (f.filename === "layout/theme.liquid") {
        const fore = innehall;
        innehall = innehall.split("\n").filter((r) => !/{%-?\s*section\s+'skrapkort'\s*-?%}/.test(r)).join("\n");
        if (innehall !== fore) bortplockat.push("section-raden i layout/theme.liquid");
      }
      innehall = Buffer.from(innehall, "utf8");
    } else if (f.body.__typename === "OnlineStoreThemeFileBodyBase64") {
      innehall = Buffer.from(f.body.contentBase64, "base64");
    } else {
      const r = await fetch(f.body.url);
      if (!r.ok) { console.error(`FEL: kunde inte hämta ${f.filename} (HTTP ${r.status})`); process.exit(1); }
      innehall = Buffer.from(await r.arrayBuffer());
    }
    const vag = join(bas, f.filename);
    mkdirSync(dirname(vag), { recursive: true });
    writeFileSync(vag, innehall);
    antal++;
  }
  if (!d.theme.files.pageInfo.hasNextPage) break;
  cursor = d.theme.files.pageInfo.endCursor;
  process.stdout.write(`\r${antal} filer…`);
}
console.log(`\n${antal} filer nedladdade. Bortplockat: ${bortplockat.join(", ") || "inget (skrapkortet fanns inte?)"}`);

const zip = `/tmp/baverbutiken-${CC.toLowerCase()}-utan-skrapkort.zip`;
rmSync(zip, { force: true });
execSync(`cd ${bas} && zip -qr ${zip} .`);
console.log("ZIP:", zip, "|", execSync(`du -h ${zip} | cut -f1`).toString().trim());
