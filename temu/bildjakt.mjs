// Hämtar produktbild-kandidater för Temu-produkter via DuckDuckGos bildsök.
// Temu serverar ingen bilddata själv (SSR-skalet är tomt, API:t kräver login),
// men DDG:s index bär originalbildernas kwcdn-URL:er.
//
// Körs: node temu/bildjakt.mjs <jobb.json> <utkatalog>
// jobb.json: [{slug, query}, ...]
// Ut: <utkatalog>/<slug>/kandidat-N.jpg + <utkatalog>/kandidater.json
//
// ⚠️ Kandidaterna är söktraffar — INTE verifierade. Varje bild måste
// granskas visuellt mot produkten innan den används. Fel bild i butiken
// är värre än ingen bild.

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const vanta = (ms) => new Promise((r) => setTimeout(r, ms));

async function ddgBilder(query) {
  const s1 = await fetch(
    `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
    { headers: { 'User-Agent': UA } }
  );
  const vqd = ((await s1.text()).match(/vqd=["']?([\d-]+)/) || [])[1];
  if (!vqd) return [];
  const s2 = await fetch(
    `https://duckduckgo.com/i.js?l=wt-wt&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&p=1`,
    { headers: { 'User-Agent': UA, Referer: 'https://duckduckgo.com/' } }
  );
  if (!s2.ok) return [];
  const j = await s2.json();
  return (j.results || []).map((r) => ({
    bild: r.image,
    kalla: r.url,
    titel: r.title,
    hojd: r.height,
    bredd: r.width,
  }));
}

// kwcdn = Temus egen CDN (bäst), pinimg = Pinterest-speglingar (näst bäst).
function ranka(resultat) {
  const kw = resultat.filter((r) => /kwcdn\.com/.test(r.bild));
  const pin = resultat.filter((r) => /pinimg\.com/.test(r.bild) && /temu/i.test(r.titel || ''));
  return [...kw, ...pin];
}

async function laddaNer(url, sokvag) {
  const s = await fetch(url, { headers: { 'User-Agent': UA, Referer: 'https://www.temu.com/' } });
  if (!s.ok) return false;
  const buf = Buffer.from(await s.arrayBuffer());
  if (buf.length < 5000) return false; // trasig/tom
  await writeFile(sokvag, buf);
  return true;
}

const [jobbfil, utkatalog] = process.argv.slice(2);
const jobb = JSON.parse(await readFile(jobbfil, 'utf8'));
const alla = {};

for (const { slug, query } of jobb) {
  await mkdir(join(utkatalog, slug), { recursive: true });
  const resultat = ranka(await ddgBilder(query));
  const tagna = [];
  for (const r of resultat) {
    if (tagna.length >= 8) break;
    // hämta i högre upplösning: byt w/500 mot w/1300
    const url = r.bild.replace(/w\/\d+/, 'w/1300');
    const fil = join(utkatalog, slug, `kandidat-${tagna.length + 1}.jpg`);
    try {
      if (await laddaNer(url, fil)) tagna.push({ ...r, fil, hamtad: url });
    } catch {}
    await vanta(300);
  }
  alla[slug] = tagna;
  console.error(`${slug}: ${tagna.length} kandidater (${resultat.length} träffar)`);
  await vanta(1500);
}

await writeFile(join(utkatalog, 'kandidater.json'), JSON.stringify(alla, null, 1));
console.log('klart:', join(utkatalog, 'kandidater.json'));
