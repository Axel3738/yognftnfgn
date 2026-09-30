// bilder.mjs — de engelska bildannonserna: källbilden ur MagiBorsten + engelsk text via kie.ai.
//
// ⛔ AVSTÄLLD 2026-09-30: provet på Takoverdrag_CS_2_1 gav "23% RABATT – TOAY" och lämnade
// kronorna kvar. Bilderna görs med bildrita.mjs (OCR + suddning + vektortext). Filen ligger
// kvar som referens och för testerna — kör den inte.
//
//   node worldwide/annonser/bilder.mjs            # torrt: vilka bilder, vilka rader, vilken prompt
//   node worldwide/annonser/bilder.mjs --skarpt   # generera (drar kie-krediter), spara i klar/, skriv media.json
//   node worldwide/annonser/bilder.mjs --skarpt --bara Batmotor_BF_12_1
//
// Texten per bild står i bildtext.json (sonnet läste varje bild och skrev engelskan mot
// REGLER-ANNONS.md: inga kronor, ingen Klarna, fri frakt utan "Sverige"). En bild utan text
// används som den är. En bild med "hoppa" byggs aldrig. Modellen är google/nano-banana-edit
// med källbilden som referens — samma väg som /bildannonser matchar en Winning Creative.
// ⚠️ Bildmodeller är dåliga på text: varje resultat TITTAS på innan annonsen byggs
// (bygg.mjs tar bara bilder som står "granskad": true i media.json).

import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const ROT = dirname(fileURLToPath(import.meta.url));
const REPO = join(ROT, '..', '..');
const KLAR = join(ROT, 'klar');
const U = JSON.parse(readFileSync(join(ROT, '..', 'urval.json'), 'utf8'));
const lasJson = (f, def) => (existsSync(join(ROT, f)) ? JSON.parse(readFileSync(join(ROT, f), 'utf8')) : def);
const log = (s) => console.log(s);
export const filnamn = (namn) => namn.replace(/[^A-Za-z0-9_.-]+/g, '_');

/** kie tar bara vissa bildformat — närmaste till källans proportion. */
export function narmasteFormat(bredd, hojd) {
  const f = { '1:1': 1, '4:5': 0.8, '3:4': 0.75, '9:16': 0.5625, '2:3': 0.6667, '16:9': 1.7778, '4:3': 1.3333, '5:4': 1.25, '3:2': 1.5 };
  const r = bredd / hojd;
  return Object.entries(f).sort((a, b) => Math.abs(a[1] - r) - Math.abs(b[1] - r))[0][0];
}

export function prompt(t) {
  const rader = t.rader.map((r) => (r.en ? `"${r.sv}" → "${r.en}"` : `"${r.sv}" → REMOVE (erase it cleanly, fill with the background)`)).join('\n');
  return [
    'Edit this advertisement image. Replace every piece of Swedish text with the English text below,',
    'in exactly the same position, font style, weight, color, size and background box as the original.',
    'Keep the product photo, the people, the layout and all colors exactly the same.',
    'Do not add any other text, logo, price, currency or watermark.',
    `Layout: ${t.layout_en}`,
    'Text replacements (Swedish → English):',
    rader,
  ].join('\n');
}

async function huvud() {
  const a = process.argv.slice(2);
  const skarpt = a.includes('--skarpt');
  const bara = a.includes('--bara') ? a[a.indexOf('--bara') + 1] : null;
  const texter = lasJson('bildtext.json', {});
  const media = lasJson('media.json', {});
  const spara = () => writeFileSync(join(ROT, 'media.json'), JSON.stringify(media, null, 1));
  mkdirSync(KLAR, { recursive: true });
  const bilder = U.produkter.filter((p) => !p.under).flatMap((p) => p.annonser.filter((x) => x.typ === 'bild').map((x) => ({ ...x, produkt: p.id })));
  const { api, säkerställProxy } = await import('../../tools/meta-lib.mjs');
  säkerställProxy();
  const { skapaJobb, hamtaJobb } = await import('../../bildannonser/kie.mjs');
  for (const b of bilder) {
    if (bara && b.namn !== bara) continue;
    const t = texter[b.namn];
    if (!t) { log(`· ${b.namn}: ingen rad i bildtext.json — väntar`); continue; }
    if (t.hoppa) { media[b.namn] = { ...(media[b.namn] ?? {}), hoppa: t.hoppa }; log(`· ${b.namn}: hoppas (${t.hoppa})`); continue; }
    const ut = join(KLAR, `${filnamn(b.namn)}.${t.rader.length ? 'png' : 'jpg'}`);
    const rel = ut.slice(REPO.length + 1);
    if (media[b.namn]?.fil && existsSync(join(REPO, media[b.namn].fil)) && !a.includes('--om')) { log(`✓ ${b.namn}: klar (${media[b.namn].fil})`); continue; }
    // Källans publika adress (Metas bild-CDN) — kie hämtar referensbilden själv.
    const r = await api('act_1867947880635861/adimages', { params: { hashes: JSON.stringify([b.image_hash]), fields: 'hash,url,width,height' } });
    const kalla = r.data?.[0];
    if (!kalla?.url) { log(`⚠️ ${b.namn}: källbilden gick inte att läsa`); continue; }
    if (!t.rader.length) {
      if (!skarpt) { log(`torrt: ${b.namn} har ingen text — används som den är`); continue; }
      writeFileSync(ut, Buffer.from(await (await fetch(kalla.url)).arrayBuffer()));
      media[b.namn] = { fil: rel, sha256: createHash('sha256').update(readFileSync(ut)).digest('hex'), granskad: true, utan_text: true };
      spara();
      log(`✓ ${b.namn}: utan text, kopierad`);
      continue;
    }
    const format = narmasteFormat(kalla.width, kalla.height);
    const p = prompt(t);
    if (!skarpt) { log(`torrt: ${b.namn} (${kalla.width}×${kalla.height} → ${format}), ${t.rader.length} rader`); continue; }
    const jobb = await skapaJobb({ prompt: p, referensBilder: [kalla.url], bildformat: format, filformat: 'png' });
    let url = null;
    for (let i = 0; i < 90 && !url; i++) {
      await new Promise((res) => setTimeout(res, 5000));
      const j = await hamtaJobb(jobb.taskId);
      if (j.misslyckad) { log(`❌ ${b.namn}: kie ${j.felmeddelande ?? 'fel'}`); break; }
      url = j.klar ? (j.urler?.[0] ?? null) : null;
    }
    if (!url) { log(`❌ ${b.namn}: ingen bild från kie`); continue; }
    writeFileSync(ut, Buffer.from(await (await fetch(url)).arrayBuffer()));
    media[b.namn] = { fil: rel, sha256: createHash('sha256').update(readFileSync(ut)).digest('hex'), granskad: false, kie_task: jobb.taskId };
    spara();
    log(`✅ ${b.namn}: ${rel} (${format}) — väntar på granskning`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
