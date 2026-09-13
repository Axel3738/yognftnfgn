#!/usr/bin/env node
// notion-fil-upp.mjs — laddar upp en LOKAL fil till en Notion-rads "Filer och
// media" via REST (Notions File Upload API). Byggstenen som gör att en rutin
// UTAN Notion-MCP (nattvakterna, /ops-bild) kan lägga en genererad bild i
// raden — och bilagan i Notion är enda kopian i världen (bildannonser/output/
// och factory/output/ dör med containern).
//
//   node tools/notion-fil-upp.mjs <page-id> --fil <sökväg>
//   node tools/notion-fil-upp.mjs <page-id> --fil <sökväg> --status "To be Reviewed" --kommentar "…"
//   node tools/notion-fil-upp.mjs <page-id> --fil <sökväg> --falt "Filer och media" --torr
//   node tools/notion-fil-upp.mjs <page-id> --fil <sökväg> --ersatt      byter ut en fil med samma namn
//   node tools/notion-fil-upp.mjs <page-id> --fil <sökväg> --json
//
// Ordningen är inte förhandlingsbar (samma regel som /bildannonser steg 6):
//   1. skapa uppladdning  → 2. skicka bytes → 3. sätt fältet → 4. LÄS TILLBAKA
//   → 5. först då kommentar + status. Statusen flyttas aldrig före bilden sitter.
// Befintliga filer i fältet behålls — nya läggs sist, inget skrivs över.
//
// Tre REST-anrop bakom kulisserna:
//   POST /v1/file_uploads            {mode:"single_part", filename, content_type}
//   POST /v1/file_uploads/<id>/send  multipart, fältet "file" (max 20 MiB)
//   PATCH /v1/pages/<id>             {properties:{<fält>:{files:[…, {type:"file_upload", file_upload:{id}}]}}}
//
// Kräver env NOTION_TOKEN (integrationen inbjuden till hubben, med rätt att
// uppdatera innehåll). 404 = "inte inbjuden", inte "sidan saknas".

import { readFileSync, statSync, existsSync } from 'node:fs';
import { basename, extname } from 'node:path';

const API = 'https://api.notion.com/v1';
export const MAX_BYTES = 20 * 1024 * 1024;   // single_part-gränsen
export const STANDARD_FALT = 'Filer och media';

// ------------------------------------------------------------ ren logik

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.gif': 'image/gif', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.pdf': 'application/pdf',
  '.srt': 'text/plain', '.txt': 'text/plain', '.json': 'application/json',
};

/** MIME-typ ur filändelsen. Okänd ändelse ⇒ null (vi gissar aldrig). */
export function mimeFor(filnamn) {
  return MIME[extname(String(filnamn ?? '')).toLowerCase()] ?? null;
}

/** Hittar files-fältet: det önskade namnet om det finns och är av typ files,
 *  annars det första files-fältet. Inget ⇒ null. */
export function hittaFilfalt(properties = {}, onskat = STANDARD_FALT) {
  const poster = Object.entries(properties);
  const exakt = poster.find(([n, v]) => n === onskat && v.type === 'files');
  if (exakt) return exakt[0];
  return poster.find(([, v]) => v.type === 'files')?.[0] ?? null;
}

/** Bygger värdet för files-fältet: befintliga filer (utan expiry_time, som
 *  Notion inte tar emot tillbaka) + den nya uppladdningen sist.
 *  ersatt = true: en befintlig fil med SAMMA namn tas bort (omgenerering —
 *  annars skulle leveransrundan ta den gamla, som ligger först). */
export function byggFilerVarde(befintliga = [], uppladdningsId, namn, { ersatt = false } = {}) {
  const behallna = (befintliga ?? []).filter((f) => !(ersatt && String(f.name ?? '') === String(namn))).map((f) => {
    const ut = { name: f.name, type: f.type };
    if (f.type === 'external') ut.external = { url: f.external?.url };
    else if (f.type === 'file') ut.file = { url: f.file?.url };
    else if (f.type === 'file_upload') ut.file_upload = { id: f.file_upload?.id };
    return ut;
  }).filter((f) => f.external?.url || f.file?.url || f.file_upload?.id);
  return { files: [...behallna, { type: 'file_upload', file_upload: { id: uppladdningsId }, name: namn }] };
}

/** Sitter en fil med det här namnet i fältet efter tillbakaläsningen? */
export function filSitter(properties = {}, falt, namn) {
  const filer = properties?.[falt]?.files ?? [];
  return filer.some((f) => String(f.name ?? '') === String(namn));
}

/** Statusfältet i samma uppslag som notion-aterkoppling.mjs. */
export function hittaStatusfalt(properties = {}) {
  const poster = Object.entries(properties);
  return poster.find(([n, v]) => n === 'Status' && (v.type === 'status' || v.type === 'select'))
    ?? poster.find(([, v]) => v.type === 'status')
    ?? [null, null];
}

// ------------------------------------------------------------ nät

function huvuden(token, extra = {}) {
  return { authorization: `Bearer ${token}`, 'notion-version': '2022-06-28', ...extra };
}

async function notion(token, sokvag, { method = 'GET', body = null } = {}) {
  const res = await fetch(`${API}/${sokvag}`, {
    method,
    headers: huvuden(token, { 'content-type': 'application/json' }),
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Notion 404 på ${sokvag} — integrationen är inte inbjuden till sidan/hubben (••• → Connections).`);
    throw new Error(`Notion ${res.status} på ${sokvag}: ${json.message || res.statusText}`);
  }
  return json;
}

/**
 * Hela flödet. Returnerar { page_id, falt, fil, file_upload_id, status } eller kastar.
 * `logg` får en rad per steg.
 */
export async function laddaUppTillRad({
  token = process.env.NOTION_TOKEN, pageId, fil, falt = STANDARD_FALT, status = null, kommentar = null,
  ersatt = false, torr = false, logg = (m) => console.error(m),
}) {
  if (!token) throw new Error('NOTION_TOKEN saknas i miljön.');
  if (!pageId) throw new Error('Ange <page-id>.');
  if (!fil || !existsSync(fil)) throw new Error(`Filen finns inte: ${fil}`);
  const storlek = statSync(fil).size;
  if (storlek === 0) throw new Error(`Filen är tom: ${fil}`);
  if (storlek > MAX_BYTES) throw new Error(`Filen är ${(storlek / 1048576).toFixed(1)} MiB — över 20 MiB-gränsen för single_part. Komprimera.`);
  const namn = basename(fil);
  const mime = mimeFor(namn);
  if (!mime) throw new Error(`Okänd filändelse på ${namn} — kan inte sätta content_type.`);

  const id = String(pageId).replace(/-/g, '');
  const sida = await notion(token, `pages/${id}`);
  const props = sida.properties ?? {};
  const titel = Object.values(props).find((v) => v.type === 'title')?.title?.map((t) => t.plain_text).join('') ?? id;
  const filfalt = hittaFilfalt(props, falt);
  if (!filfalt) throw new Error(`Raden "${titel}" har inget files-fält (sökte "${falt}").`);
  const befintliga = props[filfalt].files ?? [];
  logg(`Rad: ${titel}`);
  logg(`Fält: ${filfalt} (${befintliga.length} fil(er) redan) · fil: ${namn} (${mime}, ${(storlek / 1024).toFixed(0)} kB)`);
  if (befintliga.some((f) => f.name === namn)) logg(ersatt ? `↻ En fil med namnet ${namn} sitter redan i fältet — den byts ut (--ersatt).` : `⚠️ En fil med namnet ${namn} sitter redan i fältet — den nya läggs till, inget skrivs över.`);
  if (status) logg(`Status efteråt: ${status}`);
  if (torr) { logg('--torr: inget skickat.'); return { page_id: sida.id, falt: filfalt, fil: namn, file_upload_id: null, status: null, torr: true }; }

  // 1. Skapa uppladdningen.
  const upp = await notion(token, 'file_uploads', { method: 'POST', body: { mode: 'single_part', filename: namn, content_type: mime } });
  if (!upp.id) throw new Error('Notion gav inget file_upload-id.');

  // 2. Skicka bytes (multipart, fältet "file"). content-type sätts av fetch (boundary).
  const fd = new FormData();
  fd.append('file', new Blob([readFileSync(fil)], { type: mime }), namn);
  const skick = await fetch(`${API}/file_uploads/${upp.id}/send`, { method: 'POST', headers: huvuden(token), body: fd });
  const skickJson = await skick.json().catch(() => ({}));
  if (!skick.ok) throw new Error(`Notion ${skick.status} vid send: ${skickJson.message || skick.statusText}`);
  if (skickJson.status && skickJson.status !== 'uploaded') throw new Error(`Uppladdningen fick status "${skickJson.status}", inte "uploaded".`);
  logg(`✓ Bytes uppe (file_upload ${upp.id}).`);

  // 3. Sätt fältet — befintliga filer behålls.
  await notion(token, `pages/${id}`, { method: 'PATCH', body: { properties: { [filfalt]: byggFilerVarde(befintliga, upp.id, namn, { ersatt }) } } });

  // 4. Läs tillbaka. Ett PATCH som svarar 200 utan att fältet ändrats har hänt förr.
  const efter = await notion(token, `pages/${id}`);
  if (!filSitter(efter.properties, filfalt, namn)) {
    throw new Error(`Tillbakaläsningen visar ingen fil "${namn}" i "${filfalt}". Statusen rörs inte.`);
  }
  logg(`✓ ${namn} sitter i "${filfalt}" (${efter.properties[filfalt].files.length} fil(er) totalt).`);

  // 5. Kommentar före status (samma ordning som notion-aterkoppling.mjs).
  if (kommentar) {
    await notion(token, 'comments', { method: 'POST', body: { parent: { page_id: sida.id }, rich_text: [{ text: { content: String(kommentar).slice(0, 2000) } }] } });
    logg('✓ Kommentar skriven.');
  }
  let blev = null;
  if (status) {
    const [statusNamn, statusProp] = hittaStatusfalt(efter.properties);
    if (!statusNamn) throw new Error('Raden har inget Status-fält — filen sitter, statusen kunde inte ändras.');
    const varde = statusProp.type === 'status' ? { status: { name: status } } : { select: { name: status } };
    await notion(token, `pages/${id}`, { method: 'PATCH', body: { properties: { [statusNamn]: varde } } });
    const kontroll = await notion(token, `pages/${id}`);
    blev = kontroll.properties?.[statusNamn]?.[statusProp.type]?.name ?? '';
    if (blev !== status) throw new Error(`Statusen blev "${blev}", inte "${status}". Filen sitter ändå.`);
    logg(`✓ Status → ${blev}`);
  }
  return { page_id: sida.id, falt: filfalt, fil: namn, file_upload_id: upp.id, status: blev };
}

// ------------------------------------------------------------ CLI

async function main() {
  const args = process.argv.slice(2);
  const flagga = (n, s = null) => {
    const i = args.indexOf(`--${n}`);
    return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : s;
  };
  const finns = (n) => args.includes(`--${n}`);
  const pageId = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
  const json = finns('json');
  const logg = (m) => console.error(m);
  try {
    const r = await laddaUppTillRad({
      pageId, fil: flagga('fil'), falt: flagga('falt', STANDARD_FALT), status: flagga('status'),
      kommentar: flagga('kommentar'), ersatt: finns('ersatt'), torr: finns('torr'), logg,
    });
    if (json) console.log(JSON.stringify(r));
  } catch (e) {
    console.error(`✗ ${e.message}`);
    if (json) console.log(JSON.stringify({ fel: e.message }));
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
