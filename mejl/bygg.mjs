// Bygger Bäverbutikens mejlmallar. Noll beroenden.
//
//   node mejl/bygg.mjs              # hämtar produkter ur Shopify, bygger allt
//   node mejl/bygg.mjs --offline    # använder mejl/produkter.json från förra körningen
//
// Skriver:
//   mejl/produkter.json                    aktiva produkter (cache + testdata)
//   mejl/output/<mall>.liquid              det Axel klistrar in i Shopify
//   mejl/output/<mall>.amne.txt            ämnesraden (eget fält i Shopify)
//   mejl/output/forhandsvisning/<mall>.html mejlet med exempeldata
//   mejl/output/index.html                 sidan med klistra-in-knappar
//   mejl/output/STATUS.md                  vad som byggdes, med vilka produkter
//
// Shopify har inget API för notismallarna — därför slutar kedjan i en sida
// där varje mall kopieras med ett klick och klistras in i admin. Allt annat
// (produkter, priser, bilder, kollektionen) sker via API.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { byggAlla, valjProdukter } from './mallar.mjs';
import { byggSida } from './sida.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const UT = join(ROT, 'output');
const offline = process.argv.includes('--offline');

const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(ROT, 'copy.json'), 'utf8'));

let alla;
const cache = join(ROT, 'produkter.json');
if (offline) {
  if (!existsSync(cache)) {
    console.error('❌ --offline men mejl/produkter.json saknas. Kör utan flaggan först.');
    process.exit(1);
  }
  alla = JSON.parse(readFileSync(cache, 'utf8'));
  console.log(`Offline: ${alla.length} produkter ur mejl/produkter.json`);
} else {
  const { kravProxy, hamtaProdukter } = await import('./shopify.mjs');
  kravProxy();
  alla = await hamtaProdukter();
  writeFileSync(cache, JSON.stringify(alla, null, 1));
  console.log(`Shopify: ${alla.length} aktiva produkter → mejl/produkter.json`);
}

if (!offline && alla.some((p) => p.kollektioner === undefined)) {
  console.error('❌ Produkterna saknar fältet kollektioner — shopify.mjs och bygg.mjs är i osynk.');
  process.exit(1);
}
if (offline && alla.some((p) => p.kollektioner === undefined)) {
  console.error('❌ mejl/produkter.json är från före 2026-09-13 och saknar kollektioner. Kör utan --offline först.');
  process.exit(1);
}

const produkter = valjProdukter(alla, konfig);
const km = produkter.komplement;
console.log('\nGratisprodukter (välj en):');
for (const p of produkter.gratis) console.log(`  • ${p.kortnamn} — ${p.pris} kr`);
console.log(`Komplement (en till + ${km.antal} som passar ihop): ${km.karta.size} produkter med egen lista, ${km.katalog.size} i katalogen`);
console.log(`  källor: ${km.kallor.per_handle} per handle, ${km.kallor.per_kollektion} per kollektion, ${km.kallor.fallback} fallback`);
console.log(`  fallback: ${km.fallback.map((h) => km.katalog.get(h).kortnamn).join(', ')}`);
if (km.okanda.length) console.log(`  ⚠️ handles i konfigen som inte finns bland aktiva produkter (hoppas över): ${km.okanda.join(', ')}`);

mkdirSync(join(UT, 'forhandsvisning'), { recursive: true });
const liquid = byggAlla({ konfig, copy, produkter, lage: 'liquid' });
const exempel = byggAlla({ konfig, copy, produkter, lage: 'exempel' });

// Notismallarnas storleksgräns i Shopify är inte dokumenterad. Komplement-
// kartan gör de tre erbjudandemallarna stora — stoppa innan de växer
// obemärkt förbi vad som är rimligt att klistra in.
const MAX_KB = 100;
for (const m of liquid) {
  const kb = m.html.length / 1024;
  if (kb > MAX_KB) {
    console.error(`❌ ${m.id}.liquid är ${kb.toFixed(0)} kB (> ${MAX_KB} kB). Krymp komplementkartan i konfig.json.`);
    process.exit(1);
  }
}

for (const m of liquid) {
  writeFileSync(join(UT, `${m.id}.liquid`), m.html);
  writeFileSync(join(UT, `${m.id}.amne.txt`), `${m.amne}\n`);
}
for (const m of exempel) writeFileSync(join(UT, 'forhandsvisning', `${m.id}.html`), m.html);

const byggd = new Date().toISOString().slice(0, 16).replace('T', ' ');
writeFileSync(join(UT, 'index.html'), byggSida({ liquid, exempel, konfig, produkter, byggd }));

const status = [
  `# Mejlmallarna — byggda ${byggd} UTC`,
  '',
  `Rabattkod: **${konfig.erbjudande.kod}** · minst ${konfig.erbjudande.minsta_kop_sek} kr · 1 gratis ur /collections/${konfig.erbjudande.kollektion_handle}`,
  '',
  '## Gratisprodukter',
  ...produkter.gratis.map((p) => `- ${p.titel} — ${p.pris} kr (${p.handle})`),
  '',
  '## Komplement (en till + tre som passar ihop)',
  `- ${km.karta.size} produkter med egen lista (${km.kallor.per_handle} per handle, ${km.kallor.per_kollektion} per kollektion), ${km.kallor.fallback} utan — de får storsäljarna`,
  `- Katalog i mallen: ${km.katalog.size} produkter`,
  `- Fallback: ${km.fallback.map((h) => `${km.katalog.get(h).kortnamn} (${h})`).join(', ')}`,
  ...(km.okanda.length ? [`- ⚠️ Handles i konfigen som inte finns i butiken: ${km.okanda.join(', ')}`] : []),
  '',
  '## Mallar',
  ...liquid.map((m) => `- \`${m.id}.liquid\` → ${m.shopify} · ämne: ${m.amne} · ${(m.html.length / 1024).toFixed(0)} kB`),
  '',
];
writeFileSync(join(UT, 'STATUS.md'), status.join('\n'));

console.log(`\n✅ ${liquid.length} mallar → mejl/output/ (index.html är sidan Axel klistrar från)`);
