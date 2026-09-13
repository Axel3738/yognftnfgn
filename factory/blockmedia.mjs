// blockmedia.mjs — bilderna MELLAN styckena på produktsidan.
//
//   node factory/blockmedia.mjs <produkt-handle> [--torr]
//
// opf-sektionerna läser tre mediafält ur produktens metafält:
//   opf.gif_problem    bild/video efter problemtexten
//   opf.media_losning  bild/video som visar lösningen
//   opf.bild_lifestyle stark produktbild längre ned
//
// Två fel som båda syntes först i kundvyn (Axels bakläxa 2026-09-09):
//   1. gif_problem och media_losning fanns INTE alls — sektionerna renderade
//      ren text utan en enda bild. "Inga bilder mellan styckena."
//   2. bild_lifestyle pekade på KÄLLBUTIKENS CDN
//      (cdn.shopify.com/s/files/1/1013/0322/2621/… = Bäverbutiken). Sidan
//      hotlänkade alltså en annan butiks bilder. Byter källan bild eller
//      stänger av hotlinking blir produktsidan tom, och trafiken belastar
//      fel butik.
//
// Regeln: varje bild på sidan ska ligga i BUTIKENS EGET filarkiv. Det här
// steget slår upp filerna där och skriver metafälten till dem.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

// Vilken bild som hör till vilket block. Filnamnen är källans, men URL:en
// hämtas ur butikens EGET arkiv.
export const BLOCK = {
  gif_problem: 'benskydd-benskydd-08',
  media_losning: 'klart-spanne-benskydd-sv',
  bild_lifestyle: 'benskydd-benskydd-09',
};

export async function egnaFiler() {
  const karta = new Map();
  let cursor = null;
  for (;;) {
    const d = await graphql(
      `query opsFactoryEgnaFiler($c: String) {
        files(first: 250, after: $c) {
          nodes { ... on MediaImage { image { url } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { c: cursor }
    );
    for (const n of d.files.nodes) {
      const url = n.image?.url;
      if (!url) continue;
      const fil = url.split('/').pop().split('?')[0];
      // Shopify kan ha lagt på ett uuid: namn_3ecbd654-….jpg
      const bas = fil.replace(/\.[^.]+$/, '').replace(/_[0-9a-f]{8}-[0-9a-f-]+$/, '');
      if (!karta.has(bas)) karta.set(bas, url.split('?')[0]);
    }
    if (!d.files.pageInfo.hasNextPage) break;
    cursor = d.files.pageInfo.endCursor;
  }
  return karta;
}

if (process.argv[1] && process.argv[1].endsWith('blockmedia.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const handle = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr');
  if (!handle) throw new Error('Ange produkt-handle.');

  const d = await graphql(
    `query($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id
        metafields(first: 50, namespace: "opf") { nodes { key value } }
      }
    }`,
    { handle }
  );
  const p = d.productByIdentifier;
  if (!p) throw new Error(`Produkten ${handle} finns inte.`);
  const nu = Object.fromEntries(p.metafields.nodes.map((m) => [m.key, m.value]));

  const filer = await egnaFiler();
  const attSkriva = [];
  console.log('BLOCKMEDIA\n');
  for (const [nyckel, bas] of Object.entries(BLOCK)) {
    const egen = filer.get(bas);
    const gammal = nu[nyckel] ?? '(saknas)';
    const frammande = /cdn\.shopify\.com\/s\/files\/1\/1013\/0322\/2621/.test(gammal);
    console.log(`${nyckel}`);
    console.log(`   nu : ${gammal.slice(0, 80)}${frammande ? '   ⚠️ KÄLLBUTIKENS CDN' : ''}`);
    if (!egen) { console.log('   ❌ filen finns inte i butikens arkiv'); continue; }
    console.log(`   ska: ${egen.slice(0, 80)}`);
    if (gammal !== egen) {
      attSkriva.push({ ownerId: p.id, namespace: 'opf', key: nyckel, type: 'url', value: egen });
    } else {
      console.log('   ✅ redan rätt');
    }
  }

  if (torr) { console.log('\n(torrkörning — inget skrivet)'); process.exit(0); }
  if (attSkriva.length === 0) { console.log('\n✅ Inget att ändra.'); process.exit(0); }

  const r = await graphql(
    `mutation($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) { metafields { key } userErrors { field message } }
    }`,
    { metafields: attSkriva }
  );
  const fel = r.metafieldsSet?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`Metafält: ${fel.map((f) => f.message).join('; ')}`);

  // TILLBAKALÄSNING
  const e = await graphql(
    `query($handle: String!) { productByIdentifier(identifier: { handle: $handle }) {
      metafields(first: 50, namespace: "opf") { nodes { key value } } } }`,
    { handle }
  );
  const efter = Object.fromEntries(e.productByIdentifier.metafields.nodes.map((m) => [m.key, m.value]));
  console.log(`\n✅ ${attSkriva.length} metafält skrivna. Tillbakaläst:`);
  let allaEgna = true;
  for (const nyckel of Object.keys(BLOCK)) {
    const v = efter[nyckel] ?? '(saknas)';
    const egen = !/1\/1013\/0322\/2621/.test(v) && v !== '(saknas)';
    if (!egen) allaEgna = false;
    console.log(`   ${egen ? '✅' : '❌'} ${nyckel}: ${v.split('/').pop().slice(0, 60)}`);
  }
  console.log(allaEgna ? '\nAlla tre pekar på butikens egna filer.' : '\n⚠️ Något pekar fortfarande fel.');
}
