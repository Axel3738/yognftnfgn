// Filuppladdning till Shopify (Files + staged uploads). Noll beroenden.
//
//   laddaUppBild(sokvag, { alt })        → { id, url }   bild i Files (MediaImage)
//   stagedUpload(sokvag, { resource, mimeType }) → resourceUrl   (t.ex. tema-zip)
//
// Flödet är Shopifys eget: stagedUploadsCreate ger en signerad mål-URL +
// parametrar → filen POST:as dit som multipart → resourceUrl:en används som
// originalSource i fileCreate (bilder) eller som source i themeCreate (zip).
// Bilder är inte "READY" i samma sekund — laddaUppBild pollar tills url:en
// finns, så anroparen alltid får en riktig CDN-adress tillbaka.

import { readFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';
import { graphql } from './shopify.mjs';

const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', zip: 'application/zip', svg: 'image/svg+xml' };

export function mimeFor(sokvag) {
  const andelse = sokvag.split('.').pop().toLowerCase();
  return MIME[andelse] ?? 'application/octet-stream';
}

export async function stagedUpload(sokvag, { resource = 'FILE', mimeType = mimeFor(sokvag), filnamn = basename(sokvag) } = {}) {
  const storlek = statSync(sokvag).size;
  const data = await graphql(
    `mutation opsFactoryStaged($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    { input: [{ resource, filename: filnamn, mimeType, httpMethod: 'POST', fileSize: String(storlek) }] }
  );
  const fel = data.stagedUploadsCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`stagedUploadsCreate: ${fel.map((f) => f.message).join('; ')}`);
  const mal = data.stagedUploadsCreate.stagedTargets[0];

  const form = new FormData();
  for (const p of mal.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([readFileSync(sokvag)], { type: mimeType }), filnamn);
  const svar = await fetch(mal.url, { method: 'POST', body: form });
  if (!svar.ok) throw new Error(`Uppladdningen till ${new URL(mal.url).host} svarade ${svar.status}: ${(await svar.text()).slice(0, 200)}`);
  return mal.resourceUrl;
}

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

// Bild in i Files. Returnerar CDN-url:en när Shopify processat den.
export async function laddaUppBild(sokvag, { alt = '', filnamn = basename(sokvag) } = {}) {
  const resourceUrl = await stagedUpload(sokvag, { resource: 'IMAGE', filnamn });
  const data = await graphql(
    `mutation opsFactoryFil($files: [FileCreateInput!]!) {
      fileCreate(files: $files) {
        files { id fileStatus }
        userErrors { field message }
      }
    }`,
    { files: [{ originalSource: resourceUrl, contentType: 'IMAGE', alt, filename: filnamn }] }
  );
  const fel = data.fileCreate?.userErrors ?? [];
  if (fel.length > 0) throw new Error(`fileCreate ${filnamn}: ${fel.map((f) => f.message).join('; ')}`);
  const id = data.fileCreate.files[0].id;

  for (let i = 0; i < 30; i++) {
    const q = await graphql(
      `query opsFactoryFilStatus($id: ID!) {
        node(id: $id) { ... on MediaImage { id fileStatus image { url } } }
      }`,
      { id }
    );
    const nod = q.node;
    if (nod?.fileStatus === 'READY' && nod.image?.url) return { id, url: nod.image.url };
    if (nod?.fileStatus === 'FAILED') throw new Error(`Filen ${filnamn} gick inte att processa i Shopify.`);
    await sov(1000);
  }
  throw new Error(`Filen ${filnamn} blev aldrig READY.`);
}

// Slår upp en redan uppladdad bild via filnamnet (idempotens: ladda inte
// upp samma logga två gånger).
export async function hittaBild(filnamn) {
  const stam = filnamn.replace(/\.[a-z0-9]+$/i, '');
  const data = await graphql(
    `query opsFactoryHittaFil($q: String!) {
      files(first: 10, query: $q) { nodes { ... on MediaImage { id fileStatus image { url } } } }
    }`,
    { q: `filename:${stam}` }
  );
  return (data.files?.nodes ?? []).find((f) => f?.image?.url && f.image.url.includes(stam)) ?? null;
}
