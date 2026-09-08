// Tester för importtolken. Körs med `npm test` (node --test) mot den
// kompilerade TypeScript-filen via tsx-lös import — därför importeras
// modulen genom en liten inline-transpilering med Nodes strip-types.
import { test } from "node:test";
import assert from "node:assert/strict";

const mod = await import("../app/lib/cost-import.server.ts");
const { parseCostText, matchRows, parseMoney, detectDelimiter } = mod;

const katalog = () => {
  const v = (productTitle, variantTitle, sku, id) => ({
    productGid: "gid://shopify/Product/1",
    variantGid: `gid://shopify/ProductVariant/${id}`,
    inventoryItemGid: `gid://shopify/InventoryItem/${id}`,
    productTitle, variantTitle, sku, price: 599, unitCost: null,
  });
  const all = [
    v("Marin Motorhölje 420D", "Svart / 40 - 60 hk", "MH-420-S", 101),
    v("Marin Motorhölje 420D", "Grå / 40 - 60 hk", "MH-420-G", 102),
    v("Strandtofflor", "Default Title", "", 201),
  ];
  const byGid = new Map(all.map((x) => [x.variantGid, x]));
  const byTitle = new Map(all.map((x) => [`${x.productTitle.toLowerCase()} ${x.variantTitle.toLowerCase()}`, x]));
  const bySku = new Map(all.filter((x) => x.sku).map((x) => [x.sku.toLowerCase(), x]));
  return { byGid, byTitle, bySku, all };
};

test("parseMoney: komma, punkt, tusental, valuta", () => {
  assert.equal(parseMoney("81,92"), 81.92);
  assert.equal(parseMoney("81.92"), 81.92);
  assert.equal(parseMoney("1 234,50"), 1234.5);
  assert.equal(parseMoney("1,234.50"), 1234.5);
  assert.equal(parseMoney("SEK 99"), 99);
  assert.equal(parseMoney("$12.30"), 12.3);
  assert.equal(parseMoney(""), null);
  assert.equal(parseMoney("abc"), null);
});

test("detectDelimiter", () => {
  assert.equal(detectDelimiter("a;b;c"), ";");
  assert.equal(detectDelimiter("a,b,c"), ",");
  assert.equal(detectDelimiter("a\tb\tc"), "\t");
  assert.equal(detectDelimiter("ensam"), ";");
});

test("rubrikrad på engelska (Juicy-liknande export) matchas på SKU och variant-ID", () => {
  const text = [
    "Product,Variant,SKU,Variant ID,Cost",
    "Marin Motorhölje 420D,Svart / 40 - 60 hk,MH-420-S,101,81.92",
    "Något annat namn,Annan variant,MH-420-G,,85.00",
    "Fel namn,,,201,103.16",
    "Okänd,Okänd,NOPE,,10",
  ].join("\n");
  const p = parseCostText(text);
  assert.equal(p.hadHeader, true);
  assert.equal(p.delimiter, ",");
  assert.equal(p.columns.cost, "Cost");
  assert.equal(p.columns.sku, "SKU");
  const m = matchRows(p.rows, katalog());
  assert.equal(m.matched.length, 3);
  assert.deepEqual(m.matched.map((x) => x.via), ["variantId", "sku", "variantId"]);
  assert.equal(m.unmatched.length, 1);
  assert.match(m.unmatched[0].reason, /NOPE/);
});

test("positionsformatet utan rubrik: produkt;variant;kostnad", () => {
  const text = "Marin Motorhölje 420D;Svart / 40 - 60 hk;81,92\nStrandtofflor;;103,16";
  const p = parseCostText(text);
  assert.equal(p.hadHeader, false);
  const m = matchRows(p.rows, katalog());
  assert.equal(m.matched.length, 2);
  assert.equal(m.matched[0].targets[0].sku, "MH-420-S");
  // Tom varianttitel = alla varianter i produkten (här bara en).
  assert.equal(m.matched[1].targets.length, 1);
});

test("tom varianttitel sätter samma kostnad på alla varianter", () => {
  const text = "Produkt;Variant;Kostnad\nMarin Motorhölje 420D;;80";
  const m = matchRows(parseCostText(text).rows, katalog());
  assert.equal(m.matched.length, 1);
  assert.equal(m.matched[0].targets.length, 2);
});

test("citattecken och semikolon i titel", () => {
  const text = 'sku;cost\n"MH-420-G";"85,50"';
  const m = matchRows(parseCostText(text).rows, katalog());
  assert.equal(m.matched.length, 1);
  assert.equal(m.matched[0].row.cost, 85.5);
});

test("rad utan läsbar kostnad rapporteras, skrivs inte", () => {
  const text = "sku;cost\nMH-420-S;n/a";
  const m = matchRows(parseCostText(text).rows, katalog());
  assert.equal(m.matched.length, 0);
  assert.match(m.unmatched[0].reason, /kostnaden/);
});
