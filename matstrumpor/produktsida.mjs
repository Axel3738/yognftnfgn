#!/usr/bin/env node
// Produktsidans beskrivning (body_html) i Matstrumpor — byt den mot filen i
// matstrumpor/produktsida/<handle>.html, med säkerhetskopia och tillbakaläsning.
//
//   node matstrumpor/produktsida.mjs                      # torrt: visar skillnaden, skriver inget
//   node matstrumpor/produktsida.mjs --skarpt             # byter beskrivningen, läser tillbaka
//   node matstrumpor/produktsida.mjs --handle sushi-strumpor --skarpt
//   node matstrumpor/produktsida.mjs --aterstall <backupfil> --skarpt   # lägger tillbaka en kopia
//
// Strukturen är Axels (2026-10-02): Problem → gif → Lösning → gif/bild → Funktioner → bild → Garanti.
// Temats block (paketväljaren, trust-raden, fraktrutan) rörs aldrig — bara beskrivningen.
// Varje skarp körning sparar den gamla texten i matstrumpor/produktsida/backup/ först.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasButik, skapaKlient } from '../sparning/butik.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const MAPP = join(ROT, 'produktsida');
const BUTIK = 'matstrumpor';

function arg(namn, standard = null) {
  const i = process.argv.indexOf(namn);
  return i >= 0 ? (process.argv[i + 1] ?? true) : standard;
}
const SKARPT = process.argv.includes('--skarpt');
const HANDLE = arg('--handle', 'sushi-strumpor');
const ATERSTALL = arg('--aterstall');

export function normalisera(html) {
  return String(html ?? '').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

// Kontrollerna som gäller all copy i repot (docs/copy-regler.md), på den nya texten.
export function kontrollera(html) {
  const text = html.replace(/<[^>]+>/g, ' ');
  const fel = [];
  // Tankstreck utanför garantiblocket (den raden är butikens gamla, orörd).
  const utanGaranti = html.replace(/<h3>30 dagar att ändra dig\.<\/h3>\s*<p>[^<]*<\/p>/, '').replace(/<[^>]+>/g, ' ');
  if (/[—–]/.test(utanGaranti)) fel.push('tankstreck i den nya texten');
  if (/\(/.test(utanGaranti)) fel.push('parentes i den nya texten');
  if (/mest beställda/i.test(text)) fel.push('"mest beställda" (källan säger topp tre)');
  if (/pizza|burgare|donut/i.test(text)) fel.push('en annan låda nämns');
  if (/\b\d{3,4} ?kr\b/.test(text)) fel.push('ett pris i beskrivningen (priset ägs av temat)');
  if (/material|mjuk|tvätt/i.test(text)) fel.push('materialpåstående');
  return fel;
}

async function main() {
  const butik = lasButik(BUTIK);
  const fil = join(MAPP, `${HANDLE}.html`);
  const ny = ATERSTALL ? readFileSync(ATERSTALL, 'utf8') : readFileSync(fil, 'utf8');
  const fel = ATERSTALL ? [] : kontrollera(ny);
  if (fel.length) {
    console.error(`⛔ Stoppar: ${fel.join('; ')}`);
    process.exit(1);
  }
  const k = await skapaKlient(butik);
  const q = `query($h: String!) { productByHandle(handle: $h) { id title handle descriptionHtml } }`;
  const d = await k.graphql(q, { h: HANDLE });
  const p = d.productByHandle;
  if (!p) throw new Error(`Hittar ingen produkt med handle ${HANDLE}`);
  const gammal = p.descriptionHtml ?? '';
  console.log(`Produkt: ${p.title} (${p.id})`);
  console.log(`Beskrivning i dag: ${normalisera(gammal).length} tecken, ${gammal.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length} ord`);
  console.log(`Ny beskrivning:    ${normalisera(ny).length} tecken, ${ny.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length} ord`);
  if (normalisera(gammal) === normalisera(ny)) {
    console.log('Samma text redan live. Inget att göra.');
    return;
  }
  const rubriker = (h) => [...h.matchAll(/<h3>([^<]*)<\/h3>/g)].map((m) => m[1]);
  console.log('Rubriker i dag: ' + rubriker(gammal).join(' | '));
  console.log('Rubriker nya:   ' + rubriker(ny).join(' | '));
  const media = (h) => (h.match(/<(video|img)\b/g) ?? []).length;
  console.log(`Media (video + bild): i dag ${media(gammal)}, nya ${media(ny)}`);
  if (!SKARPT) {
    console.log('\nTorrt. Kör med --skarpt för att byta.');
    return;
  }
  mkdirSync(join(MAPP, 'backup'), { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = join(MAPP, 'backup', `${stamp}-${HANDLE}.html`);
  writeFileSync(backup, gammal);
  console.log(`Säkerhetskopia: ${backup}`);
  const m = `mutation($p: ProductUpdateInput!) { productUpdate(product: $p) { product { id descriptionHtml } userErrors { field message } } }`;
  const u = await k.graphql(m, { p: { id: p.id, descriptionHtml: ny } });
  const tillbaka = u.productUpdate.product.descriptionHtml ?? '';
  const d2 = await k.graphql(q, { h: HANDLE });
  const last = d2.productByHandle.descriptionHtml ?? '';
  const ok = normalisera(last) === normalisera(ny);
  console.log(ok ? '✅ Tillbakaläst: beskrivningen är den nya.' : `⚠️ Tillbakaläst text skiljer sig (${normalisera(last).length} mot ${normalisera(ny).length} tecken) — Shopify kan ha normaliserat HTML:en. Läs sidan som kund.`);
  const kundvy = `https://matstrumpor.se/products/${HANDLE}.json`;
  try {
    const r = await fetch(kundvy, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const j = await r.json();
    const pub = j?.product?.body_html ?? '';
    const prov = rubriker(ny)[0];
    console.log(pub.includes(prov) ? `✅ Publika sidan bär den nya första rubriken ("${prov}").` : `⚠️ Publika sidan visar inte "${prov}" ännu (${r.status}) — cache eller fel.`);
  } catch (e) {
    console.log(`⚠️ Kunde inte läsa ${kundvy}: ${e.message}`);
  }
  if (!ok || !tillbaka) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
}
