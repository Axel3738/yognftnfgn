#!/usr/bin/env node
// thumbnails.mjs — gör en riktig videoframe till en PUBLIK bild-URL.
//
// Varför den finns: Meta KRÄVER en thumbnail på varje videoannons
// ("Your ad needs a video thumbnail", felkod 100/1443226, mätt 2026-09-21), och
// Adsmanager-MCP:n tar bara en publikt nåbar URL — inte en fil från containern.
// Metas egen `picture` på den uppladdade videon är 160×160 och signerad, alltså
// oanvändbar som omslag.
//
// Lösningen är butikens egen CDN: frame ur videon med ffmpeg → Shopify Files
// (stagedUploadsCreate → POST → fileCreate) → `https://cdn.shopify.com/...`.
// Den URL:en är publik, permanent och kostar ingenting.
//
//   node matstrumpor/thumbnails.mjs <fil.mov> [<fil.mov> …] [--sekund 1.0]
//
// Skriver ut en rad per fil: <filnamn> <cdn-url>

import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';

/** Frame ur videon som jpg. Default 1,0 s in — frame 0 är ofta svart. */
export function dragFrame(fil, sekund = 1.0) {
  const ut = join(tmpdir(), `${basename(fil).replace(/\.\w+$/, '')}-thumb.jpg`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(sekund), '-i', fil, '-frames:v', '1', '-q:v', '2', ut]);
  if (!existsSync(ut)) throw new Error(`ffmpeg gav ingen frame för ${fil}.`);
  return ut;
}

/** Laddar upp en lokal bild till Shopify Files och väntar tills den är READY. */
export async function tillShopify(klient, lokalFil, { forsok = 20 } = {}) {
  const namn = basename(lokalFil);
  const staged = await klient.graphql(
    `mutation($input:[StagedUploadInput!]!){stagedUploadsCreate(input:$input){stagedTargets{url resourceUrl parameters{name value}} userErrors{message}}}`,
    { input: [{ filename: namn, mimeType: 'image/jpeg', resource: 'IMAGE', httpMethod: 'POST' }] },
  );
  const mal = staged.stagedUploadsCreate.stagedTargets[0];
  if (!mal) throw new Error('Shopify gav ingen staged target.');

  const form = new FormData();
  for (const p of mal.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([readFileSync(lokalFil)], { type: 'image/jpeg' }), namn);
  const svar = await fetch(mal.url, { method: 'POST', body: form });
  if (!svar.ok) throw new Error(`Staged upload misslyckades: ${svar.status} ${(await svar.text()).slice(0, 200)}`);

  const skapad = await klient.graphql(
    `mutation($files:[FileCreateInput!]!){fileCreate(files:$files){files{id fileStatus ... on MediaImage{image{url}}} userErrors{message}}}`,
    { files: [{ originalSource: mal.resourceUrl, contentType: 'IMAGE', alt: namn }] },
  );
  const fel = skapad.fileCreate.userErrors;
  if (fel?.length) throw new Error(`fileCreate: ${fel.map((f) => f.message).join(', ')}`);
  const id = skapad.fileCreate.files[0].id;

  // Shopify processar asynkront — URL:en finns först när filen är READY.
  for (let i = 0; i < forsok; i++) {
    const las = await klient.graphql(`query($id:ID!){node(id:$id){... on MediaImage{fileStatus image{url}}}}`, { id });
    const n = las.node;
    if (n?.fileStatus === 'READY' && n.image?.url) return n.image.url;
    if (n?.fileStatus === 'FAILED') throw new Error(`Shopify kunde inte processa ${namn}.`);
    await new Promise((r) => setTimeout(r, 1500));
  }
  throw new Error(`${namn} blev aldrig READY i Shopify Files — vänta och läs om, ladda inte upp igen.`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const arg = process.argv.slice(2);
  const ix = arg.indexOf('--sekund');
  const sekund = ix > -1 ? Number(arg[ix + 1]) : 1.0;
  const filer = arg.filter((a, i) => !a.startsWith('--') && (ix === -1 || i !== ix + 1));
  if (!filer.length) { console.error('Ge minst en videofil.'); process.exit(1); }
  const klient = await skapaKlient(lasButik('matstrumpor'));
  for (const f of filer) {
    const frame = dragFrame(f, sekund);
    const url = await tillShopify(klient, frame);
    console.log(`${basename(f)}\t${url}`);
  }
}
