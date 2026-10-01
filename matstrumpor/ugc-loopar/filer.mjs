// filer.mjs — looparna (mp4) och deras bildrutor (jpg) in i Matstrumpors filarkiv
// (Innehåll → Filer). Idempotent på filnamnet: en fil som redan finns laddas inte
// upp igen. Svaret skrivs i filer.json (committas), som temat och
// produktbeskrivningen läser sina adresser ur.
//
//   node matstrumpor/ugc-loopar/filer.mjs            # visar vad som finns och vad som saknas
//   node matstrumpor/ugc-loopar/filer.mjs --skarpt   # laddar upp det som saknas, väntar på READY
//
// Kräver looparna i output/loopar/ (klipp.sh). Videon laddas upp som VIDEO
// (stagedUploadsCreate + fileCreate); vi använder ORIGINALET (originalSource),
// inte Shopifys omkodning, för vår kodning är redan liten och har faststart.

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
export const FILER_JSON = join(HAR, 'filer.json');
const LOOPMAPP = join(HAR, 'output', 'loopar');
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

/** Looparna ur loopar.txt: namn + version (kolumn 8). */
export function loopar(text = readFileSync(join(HAR, 'loopar.txt'), 'utf8')) {
  return text.split('\n').filter((r) => r.trim() && !r.startsWith('#')).map((r) => {
    const k = r.trim().split(/\s+/);
    const v = Number(k[7]);
    if (k.length !== 9 || !Number.isInteger(v) || v < 1) throw new Error(`loopar.txt: raden "${r.trim()}" har inte nio kolumner med en version ≥ 1.`);
    return { namn: k[0], v };
  });
}
export const loopnamn = () => loopar().map((l) => l.namn);

/** Filnamnet i filarkivet: version 1 utan suffix (de första uppladdningarna), sedan -v2, -v3 … */
export function filnamnFor(namn, v, ext) {
  return `ms-loop-${namn.replace(/_/g, '-')}${v > 1 ? `-v${v}` : ''}.${ext}`;
}

export async function klientFor() {
  (await import('../../mejl/shopify.mjs')).kravProxy();
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  return skapaKlient(lasButik('matstrumpor'));
}

async function staged(k, sokvag, filnamn, mimeType, resource) {
  const d = await k.graphql(
    `mutation($input: [StagedUploadInput!]!) { stagedUploadsCreate(input: $input) { stagedTargets { url resourceUrl parameters { name value } } userErrors { message } } }`,
    { input: [{ resource, filename: filnamn, mimeType, httpMethod: 'POST', fileSize: String(statSync(sokvag).size) }] }
  );
  const fel = d.stagedUploadsCreate?.userErrors ?? [];
  if (fel.length) throw new Error(`stagedUploadsCreate ${filnamn}: ${fel.map((f) => f.message).join('; ')}`);
  const mal = d.stagedUploadsCreate.stagedTargets[0];
  const form = new FormData();
  for (const p of mal.parameters) form.append(p.name, p.value);
  form.append('file', new Blob([readFileSync(sokvag)], { type: mimeType }), filnamn);
  const svar = await fetch(mal.url, { method: 'POST', body: form });
  if (!svar.ok) throw new Error(`uppladdningen av ${filnamn} svarade ${svar.status}`);
  return mal.resourceUrl;
}

/** Filerna som redan finns, på filnamn → { id, url }. */
async function befintliga(k) {
  const d = await k.graphql(`{ files(first: 50, query: "filename:ms-loop-*") { nodes { id fileStatus ... on Video { filename originalSource { url } } ... on MediaImage { image { url } } } } }`);
  const ut = {};
  for (const n of d.files?.nodes ?? []) {
    if (n.fileStatus !== 'READY') continue;
    if (n.filename && n.originalSource?.url) ut[n.filename] = { id: n.id, url: n.originalSource.url };
    else if (n.image?.url) ut[n.image.url.split('/').pop().split('?')[0]] = { id: n.id, url: n.image.url };
  }
  return ut;
}

async function vanta(k, id, namn) {
  for (let i = 0; i < 60; i += 1) {
    const q = await k.graphql(`query($id: ID!) { node(id: $id) { ... on Video { fileStatus originalSource { url } } ... on MediaImage { fileStatus image { url } } } }`, { id });
    const n = q.node;
    if (n?.fileStatus === 'FAILED') throw new Error(`Shopify kunde inte behandla ${namn}.`);
    const url = n?.originalSource?.url ?? n?.image?.url;
    if (n?.fileStatus === 'READY' && url) return url;
    await sov(3000);
  }
  throw new Error(`${namn} blev aldrig READY.`);
}

async function laddaUpp(k, namn, v, typ) {
  const sokvag = join(LOOPMAPP, `${namn}.${typ === 'VIDEO' ? 'mp4' : 'jpg'}`);
  const filnamn = filnamnFor(namn, v, typ === 'VIDEO' ? 'mp4' : 'jpg');
  if (!existsSync(sokvag)) throw new Error(`${sokvag} saknas — kör klipp.sh först.`);
  const mime = typ === 'VIDEO' ? 'video/mp4' : 'image/jpeg';
  const kalla = await staged(k, sokvag, filnamn, mime, typ);
  // En staged VIDEO-adress saknar filändelse och fileCreate vägrar då `filename` (mätt
  // 2026-09-10, factory/filer.mjs).
  const d = await k.graphql(
    `mutation($f: [FileCreateInput!]!) { fileCreate(files: $f) { files { id } userErrors { message } } }`,
    { f: [{ originalSource: kalla, contentType: typ, alt: '', ...(typ === 'IMAGE' ? { filename: filnamn } : {}) }] }
  );
  const fel = d.fileCreate?.userErrors ?? [];
  if (fel.length) throw new Error(`fileCreate ${filnamn}: ${fel.map((f) => f.message).join('; ')}`);
  const id = d.fileCreate.files[0].id;
  const url = await vanta(k, id, filnamn);
  // Videon får staged-filnamnet av Shopify själv (mätt 2026-10-01: ms-loop-avslojandet.mp4);
  // fileUpdate på filnamn vägras för video ("only supported on images and generic files").
  return { id, url, filnamn };
}

async function main() {
  const skarpt = process.argv.includes('--skarpt');
  const k = await klientFor();
  const finns = await befintliga(k);
  const tidigare = existsSync(FILER_JSON) ? JSON.parse(readFileSync(FILER_JSON, 'utf8')) : {};
  const ut = { _om: 'Looparnas adresser i Matstrumpors filarkiv (matstrumpor/ugc-loopar/filer.mjs). mp4 = originalet, jpg = bildrutan (poster).', ...tidigare };
  for (const { namn, v } of loopar()) {
    // Ny version ⇒ nya filer: adresserna till den gamla versionen gäller inte längre.
    const post = (ut[namn]?.v ?? 1) === v ? (ut[namn] ?? {}) : {};
    post.v = v;
    for (const typ of ['VIDEO', 'IMAGE']) {
      const nyckel = typ === 'VIDEO' ? 'mp4' : 'jpg';
      const filnamn = filnamnFor(namn, v, nyckel);
      if (post[nyckel] && finns[filnamn]) { console.log(`  ${filnamn}: finns`); continue; }
      if (finns[filnamn]) { post[nyckel] = finns[filnamn].url; console.log(`  ${filnamn}: finns i filarkivet`); continue; }
      if (!skarpt) { console.log(`  ${filnamn}: saknas (torrt, laddas upp med --skarpt)`); continue; }
      const r = await laddaUpp(k, namn, v, typ);
      post[nyckel] = r.url;
      console.log(`  ✓ ${filnamn} → ${r.url}`);
    }
    ut[namn] = { v, mp4: post.mp4, jpg: post.jpg };
  }
  if (skarpt) {
    writeFileSync(FILER_JSON, JSON.stringify(ut, null, 2) + '\n');
    // Tillbakaläsning: varje adress ska svara 200 publikt.
    for (const namn of loopnamn()) {
      for (const nyckel of ['mp4', 'jpg']) {
        const r = await fetch(ut[namn][nyckel], { method: 'HEAD' });
        console.log(`  ${r.ok ? '✓' : '✗'} ${namn}.${nyckel} ${r.status} ${r.headers.get('content-type')} ${r.headers.get('content-length')} B`);
        if (!r.ok) process.exitCode = 1;
      }
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
