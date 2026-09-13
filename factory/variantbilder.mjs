// variantbilder.mjs — varje variant ska peka på SIN bild.
//
//   node factory/variantbilder.mjs <produkt-handle> [--torr]
//
// Fabriken laddade upp produktens media men kopplade dem aldrig till
// varianterna. Mätt 2026-09-09 på DryTrek: 18 färgvarianter, noll bilder —
// kunden klickar "Röd" och ser samma bild som för "Svart".
//
// Kopplingen härleds ur KÄLLANS filnamn, inte ur en handskriven lista:
// källbutiken döper färgbilderna `damask-se-<FÄRGKOD>.jpg` och varianternas
// SKU slutar på samma kod (`TEMU-…-RD`). Koden är alltså facit, och en
// variant utan träff rapporteras i stället för att gissas.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { laddaEnv } from './env.mjs';
import { graphql } from './shopify.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

// SKU:ns sista segment är färgkoden: TEMU-601101617191068-RD → RD.
export function fargkod(sku) {
  const del = String(sku ?? '').split('-');
  return del.length > 1 ? del[del.length - 1] : null;
}

// Filnamnets färgkod: damask-se-RD.jpg → RD, damask-se-NG-ren.jpg → NG.
export function kodUrFilnamn(fil) {
  const m = String(fil).match(/^damask-se-([A-Z]{2})(?:-[a-z]+)?\./);
  return m ? m[1] : null;
}

export function byggKarta(kallbilder, varianter) {
  const perKod = new Map();
  for (const url of kallbilder) {
    const kod = kodUrFilnamn(url.split('/').pop().split('?')[0]);
    if (kod && !perKod.has(kod)) perKod.set(kod, url.split('?')[0]);
  }
  return varianter.map((v) => {
    const kod = fargkod(v.sku);
    return { variant: v, kod, url: kod ? (perKod.get(kod) ?? null) : null };
  });
}

if (process.argv[1] && process.argv[1].endsWith('variantbilder.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const handle = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr');
  if (!handle) throw new Error('Ange produkt-handle.');

  const kallfil = join(ROT, 'output', handle, 'kallprodukt.json');
  if (!existsSync(kallfil)) throw new Error(`Saknar ${kallfil} — spara källans /products/<handle>.json där först.`);
  const kalla = JSON.parse(readFileSync(kallfil, 'utf8')).product;
  const kallbilder = kalla.images.map((i) => i.src);

  const d = await graphql(
    `query($handle: String!) {
      productByIdentifier(identifier: { handle: $handle }) {
        id
        media(first: 100) { nodes { id ... on MediaImage { image { url } } } }
        variants(first: 100) { nodes { id title sku media(first: 1) { nodes { id } } } }
      }
    }`,
    { handle }
  );
  const p = d.productByIdentifier;
  if (!p) throw new Error(`Produkten ${handle} finns inte.`);

  const karta = byggKarta(kallbilder, p.variants.nodes);
  const utan = karta.filter((k) => !k.url);
  console.log(`${karta.length} varianter · ${karta.length - utan.length} har en färgbild i källan`);
  for (const u of utan) console.log(`   ⚠️ ${u.variant.title} (kod ${u.kod ?? '?'}) — ingen bild i källan, får produktens huvudbild`);

  // Vilka bilder ligger redan som media? Matcha på filnamnets färgkod.
  const mediaPerKod = new Map();
  for (const m of p.media.nodes) {
    const fil = m.image?.url?.split('/').pop()?.split('?')[0] ?? '';
    // Shopify har lagt på uuid: damask-se-RD_9f3c….jpg
    const kod = kodUrFilnamn(fil) ?? (fil.match(/^damask-se-([A-Z]{2})_/) ?? [])[1];
    if (kod && !mediaPerKod.has(kod)) mediaPerKod.set(kod, m.id);
  }
  const saknasSomMedia = [...new Set(karta.filter((k) => k.url && !mediaPerKod.has(k.kod)).map((k) => k.url))];
  console.log(`\n${mediaPerKod.size} färgbilder ligger som media, ${saknasSomMedia.length} måste laddas upp`);

  if (torr) { console.log('\n(torrkörning — inget ändrat)'); process.exit(0); }

  // 1. Ladda upp de som saknas.
  if (saknasSomMedia.length > 0) {
    const r = await graphql(
      `mutation($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { ... on MediaImage { id image { url } } }
          mediaUserErrors { field message }
        }
      }`,
      {
        productId: p.id,
        media: saknasSomMedia.map((u) => ({
          originalSource: u,
          mediaContentType: 'IMAGE',
          alt: `${kalla.title} – ${kodUrFilnamn(u.split('/').pop())}`,
        })),
      }
    );
    const fel = r.productCreateMedia?.mediaUserErrors ?? [];
    if (fel.length > 0) throw new Error(`Media: ${fel.map((f) => f.message).join('; ')}`);
    console.log(`✅ ${saknasSomMedia.length} bilder uppladdade — väntar på bearbetning`);
    for (let i = 0; i < 30; i++) {
      await sov(3000);
      const k = await graphql(
        `query($handle: String!) { productByIdentifier(identifier: { handle: $handle }) {
          media(first: 100) { nodes { id status ... on MediaImage { image { url } } } } } }`,
        { handle }
      );
      const noder = k.productByIdentifier.media.nodes;
      if (noder.every((n) => n.image?.url)) {
        mediaPerKod.clear();
        for (const m of noder) {
          const fil = m.image.url.split('/').pop().split('?')[0];
          const kod = kodUrFilnamn(fil) ?? (fil.match(/^damask-se-([A-Z]{2})_/) ?? [])[1];
          if (kod && !mediaPerKod.has(kod)) mediaPerKod.set(kod, m.id);
        }
        break;
      }
    }
  }

  // 2. Koppla varje variant till sin bild.
  const koppla = karta
    .filter((k) => k.kod && mediaPerKod.has(k.kod))
    .map((k) => ({ id: k.variant.id, mediaId: mediaPerKod.get(k.kod) }));
  console.log(`\nKopplar ${koppla.length} varianter till sin bild…`);

  for (let i = 0; i < koppla.length; i += 10) {
    const bit = koppla.slice(i, i + 10);
    const r = await graphql(
      `mutation($productId: ID!, $variantMedia: [ProductVariantAppendMediaInput!]!) {
        productVariantAppendMedia(productId: $productId, variantMedia: $variantMedia) {
          productVariants { id }
          userErrors { field message }
        }
      }`,
      { productId: p.id, variantMedia: bit.map((b) => ({ variantId: b.id, mediaIds: [b.mediaId] })) }
    );
    const fel = r.productVariantAppendMedia?.userErrors ?? [];
    if (fel.length > 0) console.log(`   ⚠️ ${fel.map((f) => f.message).join('; ')}`);
  }

  // 3. TILLBAKALÄSNING — en skrivning utan tillbakaläsning är inte gjord.
  const efter = await graphql(
    `query($handle: String!) { productByIdentifier(identifier: { handle: $handle }) {
      media(first: 100) { nodes { id } }
      variants(first: 100) { nodes { title media(first: 1) { nodes { id } } } } } }`,
    { handle }
  );
  const v = efter.productByIdentifier.variants.nodes;
  const utanBild = v.filter((x) => x.media.nodes.length === 0);
  console.log(`\n✅ ${efter.productByIdentifier.media.nodes.length} media på produkten`);
  console.log(`✅ ${v.length - utanBild.length} av ${v.length} varianter har en egen bild`);
  if (utanBild.length > 0) console.log(`   ⚠️ utan bild: ${utanBild.map((x) => x.title).join(', ')}`);
}
