// shopify.mjs — genererade bilder in på Shopifys CDN (Bäverbutiken, SE).
//
// GemPages läser bilder från vilken publik URL som helst, men kie.ai:s länkar
// är tillfälliga. Sidan måste peka på cdn.shopify.com för att hålla i månader.
// Två vägar, i ordning:
//
//   1. Innehåll → Filer (fileCreate). Kräver scopet write_files.
//   2. Bildarkiv-produkten: en DRAFT-produkt "Landningssidor – bildarkiv" som
//      bara finns för att bära media (productCreateMedia — write_products
//      räcker). Produktbilder ligger på samma CDN och är publika oavsett
//      produktens status; kunden ser aldrig en DRAFT-produkt.
//
// Mätt 2026-09-16: appen bakom SHOPIFY_CLIENT_ID_SE ("Bäver uppladdare") har
// write_inventory, write_products, write_publications — inte write_files. Då
// tar vägen 2 över av sig själv och rapporten säger det. Finns nycklarna
// SHOPIFY_CLIENT_ID_SE_BAVER_SE (appen med alla scopes) i miljön vinner de,
// precis som i mejl/shopify.mjs som auth-lagret lånas från.

import { graphql, kravEnv } from '../mejl/shopify.mjs';

export const ARKIV_HANDLE = 'lp-bildarkiv';
export const ARKIV_TITEL = 'Landningssidor – bildarkiv (rör ej)';

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

export async function appScopes() {
  const d = await graphql('{ currentAppInstallation { app { title } accessScopes { handle } } }');
  return {
    app: d.currentAppInstallation?.app?.title ?? '?',
    scopes: (d.currentAppInstallation?.accessScopes ?? []).map((s) => s.handle),
  };
}

export const harFiles = (scopes) => (scopes ?? []).includes('write_files');

/** Bildens slutliga form när Shopify bearbetat den. Kastar på FAILED. */
async function vantaPaBild(id, filnamn, { forsok = 40, paus = 2000, sovFn = sov } = {}) {
  for (let i = 0; i < forsok; i += 1) {
    const q = await graphql(
      `query lpBild($id: ID!) { node(id: $id) { ... on MediaImage { id fileStatus status image { url width height } } } }`,
      { id }
    );
    const n = q.node;
    const klar = (n?.fileStatus === 'READY' || n?.status === 'READY') && n?.image?.url;
    if (klar) return { src: n.image.url, width: n.image.width, height: n.image.height, id: n.id };
    if (n?.fileStatus === 'FAILED' || n?.status === 'FAILED') throw new Error(`Shopify kunde inte behandla bilden ${filnamn}.`);
    await sovFn(paus);
  }
  throw new Error(`Bilden ${filnamn} blev aldrig READY hos Shopify.`);
}

/** Väg 1: Innehåll → Filer. */
export async function laddaUppTillFiles(url, { filnamn, alt = '' } = {}) {
  const d = await graphql(
    `mutation lpFil($files: [FileCreateInput!]!) {
      fileCreate(files: $files) { files { id fileStatus } userErrors { field message } }
    }`,
    { files: [{ originalSource: url, contentType: 'IMAGE', alt: alt || filnamn, ...(filnamn ? { filename: filnamn } : {}) }] }
  );
  const id = d.fileCreate?.files?.[0]?.id;
  if (!id) throw new Error('fileCreate gav inget fil-id.');
  return { ...(await vantaPaBild(id, filnamn)), via: 'files' };
}

export async function hamtaArkiv() {
  const d = await graphql(
    `query lpArkiv($q: String!) { products(first: 5, query: $q) { nodes { id handle status title } } }`,
    { q: `handle:${ARKIV_HANDLE}` }
  );
  return (d.products?.nodes ?? []).find((p) => p.handle === ARKIV_HANDLE) ?? null;
}

export async function skapaArkiv() {
  const d = await graphql(
    `mutation lpArkivSkapa($product: ProductCreateInput!) {
      productCreate(product: $product) { product { id handle status } userErrors { field message } }
    }`,
    {
      product: {
        title: ARKIV_TITEL,
        handle: ARKIV_HANDLE,
        status: 'DRAFT',
        descriptionHtml: '<p>Teknisk produkt: bär bilderna till landningssidorna (lagerrensning). Publicera aldrig, radera aldrig — då försvinner bilderna från sidorna.</p>',
      },
    }
  );
  const p = d.productCreate?.product;
  if (!p?.id) throw new Error('productCreate gav ingen produkt.');
  return p;
}

/** Väg 2: bildarkiv-produkten. Skapar den (DRAFT) första gången. */
export async function laddaUppTillArkiv(url, { filnamn, alt = '' } = {}) {
  let arkiv = await hamtaArkiv();
  if (!arkiv) arkiv = await skapaArkiv();
  if (arkiv.status && arkiv.status !== 'DRAFT') {
    throw new Error(`Bildarkivet ${ARKIV_HANDLE} har status ${arkiv.status} — den ska vara DRAFT så kunden aldrig ser den. Stoppar.`);
  }
  const d = await graphql(
    `mutation lpArkivMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id status ... on MediaImage { image { url width height } } }
        mediaUserErrors { field message }
      }
    }`,
    { productId: arkiv.id, media: [{ originalSource: url, alt: alt || filnamn, mediaContentType: 'IMAGE' }] }
  );
  const fel = d.productCreateMedia?.mediaUserErrors ?? [];
  if (fel.length) throw new Error(`productCreateMedia ${filnamn}: ${fel.map((f) => f.message).join('; ')}`);
  const id = d.productCreateMedia?.media?.[0]?.id;
  if (!id) throw new Error('productCreateMedia gav inget media-id.');
  return { ...(await vantaPaBild(id, filnamn)), via: 'bildarkiv', produkt: arkiv.handle };
}

/**
 * EN bild från en publik URL in på Shopifys CDN. Väljer väg efter scopes.
 * → { src, width, height, via: 'files' | 'bildarkiv' }
 */
export async function laddaUppBild(url, { filnamn, alt = '' } = {}) {
  kravEnv();
  const { scopes } = await appScopes();
  if (harFiles(scopes)) return laddaUppTillFiles(url, { filnamn, alt });
  if (!scopes.includes('write_products')) {
    throw new Error(`Appen har varken write_files eller write_products (scopes: ${scopes.join(', ') || 'inga'}) — kan inte lägga bilden på Shopify.`);
  }
  return laddaUppTillArkiv(url, { filnamn, alt });
}
