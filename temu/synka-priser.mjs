// Synkar utlandspriser mot prismatrisen nar det svenska priset andrats.
//
//   node temu/synka-priser.mjs            # torrkorning, skriver ingenting
//   node temu/synka-priser.mjs --skarpt   # skarpt
//
// Matchar pa SKU:ns TRE SISTA SIFFROR. Katalogen anvander samma nummer i alla
// butiker men olika kategoridel: BEAVER-MARINE-049 / BEVER-MARIN-049 /
// BAEVER-MARINE-049 / MAJAVA-MARINE-049. Titelmatchning fungerar INTE — finska
// och norska titlarna delar inga ord med de svenska.
//
// Fyll i MAL nedan: [sku-nummer, nytt SEK-pris, namn].

import { Butik } from "./api.mjs";
import { pris, BUTIKER } from "./butiker.mjs";
const SKARPT = process.argv.includes("--skarpt");

// nummer -> nytt SEK-pris (numret delas mellan butikerna, kategoridelen skiljer)
const MAL = [
  ["049", 289, "Fiskespöhållare 4-pack"],
  ["122", 249, "Skoreparationslappar"],
  ["124", 279, "Magnetfiskesats 320lb"],
  ["131", 399, "14-i-1 Multiverktygshammare"],
  ["123", 579, "Uteduschen"],
  ["132", 369, "Gräsklippartäcke 600D"],
  ["125", 344, "Golfskoväska"],
];

for (const land of ["no", "dk", "fi", "uk"]) {
  const b = new Butik(land);
  const shop = await b.verifiera();
  console.log(`\n--- ${land.toUpperCase()}  ${shop.name} (${BUTIKER[land].valuta}) ---`);
  const { produkter } = await b.inventera();

  for (const [nr, sek, namn] of MAL) {
    const nyttPris = pris(land, sek);
    const traff = produkter.filter(p => p.skuer.some(s => new RegExp(`-${nr}(-|$)`).test(s)) && p.status === "ACTIVE");
    if (traff.length !== 1) {
      console.log(`   ⨯  ${namn.padEnd(30)} ${traff.length} traffar pa -${nr}`);
      continue;
    }
    const p = traff[0];
    const d = await b.fraga(`query($id:ID!){ node(id:$id){ ... on Product { variants(first:5){edges{node{id sku price}}} } } }`, { id: p.id });
    const vs = d.node.variants.edges.map(e => e.node);
    const gammalt = +vs[0].price;
    if (Math.abs(gammalt - nyttPris) < 0.011) { console.log(`   =  ${p.titel.slice(0,30).padEnd(32)} redan ${nyttPris}`); continue; }
    console.log(`   ${SKARPT ? "→" : "·"}  ${p.titel.slice(0,30).padEnd(32)} ${String(gammalt).padStart(7)} → ${String(nyttPris).padStart(7)}   ${vs[0].sku}`);
    if (SKARPT) {
      await b.mutera(
        `mutation($pid:ID!,$v:[ProductVariantsBulkInput!]!){ productVariantsBulkUpdate(productId:$pid,variants:$v){ userErrors{message} } }`,
        { pid: p.id, v: vs.map(v => ({ id: v.id, price: String(nyttPris) })) }, "productVariantsBulkUpdate");
    }
  }
}
