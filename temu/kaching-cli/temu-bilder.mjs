// Bildskörd från en Temu-produktsida — körs på AXELS DATOR (molnet är blockerat
// av Temu, verifierat 2026-08-28/29: Chromium får connection reset och curl får
// ett tomt skal utan produktdata; img.kwcdn.com är däremot öppet överallt).
//
//   cd temu/kaching-cli        (playwright finns i node_modules här)
//   node temu-bilder.mjs '<temu-url>' <mappnamn>
//
// Öppnar sidan i ett riktigt Chrome-fönster (headed — Temus botskydd släpper
// igenom det, och dyker en captcha upp löser du den i fönstret). Skriptet
// scrollar genom hela sidan och håvar in ALLT som kwcdn levererar: galleri-
// bilder, beskrivningsbilder, GIF:ar och produktvideor. Sparas till
// ../bildskord/<mappnamn>/ med manifest.json.
//
// Efteråt: granska mappen, ta bort skräp (andra produkters miniatyrer från
// "liknande produkter"-sektionen följer ibland med), committa och pusha:
//   git add temu/bildskord/<mappnamn> && git commit -m "bildskörd <mappnamn>" && git push
// Sen tar molnsessionen över och bygger galleriet i butiken.

import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2];
const namn = process.argv[3];
if (!url || !namn || !/^[a-z0-9-]+$/.test(namn)) {
  console.error("Användning: node temu-bilder.mjs '<temu-url>' <mappnamn-med-sma-bokstaver>");
  process.exit(1);
}
const UT = path.join(HERE, '..', 'bildskord', namn);
mkdirSync(UT, { recursive: true });

const PROFIL = path.join(HERE, 'profile-temu'); // egen profil — INTE Shopify-profilen
const ctx = await chromium.launchPersistentContext(PROFIL, {
  channel: 'chrome',
  headless: false,
  viewport: { width: 1440, height: 900 },
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = await ctx.newPage();

// URL (utan query) → { buf, typ, ordning }. Största varianten per URL vinner.
const fångst = new Map();
let ordning = 0;
page.on('response', async (r) => {
  try {
    const u = r.url();
    if (!/kwcdn\.com/.test(u)) return;
    const typ = (r.headers()['content-type'] || '').split(';')[0];
    if (!/^(image|video)\//.test(typ)) return;
    const bas = u.split('?')[0];
    if (!/\/(product|goods|video)\//.test(bas) && !/\.(gif|mp4|webm)$/.test(bas)) return;
    const buf = await r.body();
    if (buf.length < 15000) return; // ikoner och pyttebilder
    const bef = fångst.get(bas);
    if (!bef || buf.length > bef.buf.length) {
      fångst.set(bas, { buf, typ, ordning: bef ? bef.ordning : ordning++ });
    }
  } catch { /* stängd respons, strunt i den */ }
});

console.log('Öppnar sidan… (löser du en captcha i fönstret fortsätter skörden själv)');
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(8000);

// Klicka igenom galleriets miniatyrer så alla fullstora varianter laddas
const minis = await page.$$('[class*="thumb"] img, [class*="gallery"] img');
for (const m of minis.slice(0, 20)) { await m.click().catch(() => {}); await page.waitForTimeout(700); }

// Scrolla genom hela beskrivningen så lazy-bilder och GIF:ar triggas
for (let i = 0; i < 25; i++) { await page.mouse.wheel(0, 1400); await page.waitForTimeout(900); }
await page.waitForTimeout(5000);

const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif', 'image/avif': '.avif', 'video/mp4': '.mp4', 'video/webm': '.webm' };
const manifest = [];
let n = 0;
for (const [bas, { buf, typ, ordning: o }] of [...fångst.entries()].sort((a, b) => a[1].ordning - b[1].ordning)) {
  n++;
  const fil = `${String(n).padStart(2, '0')}${ext[typ] || '.bin'}`;
  writeFileSync(path.join(UT, fil), buf);
  manifest.push({ fil, url: bas, typ, bytes: buf.length });
  console.log(`  ✔ ${fil}  ${(buf.length / 1024).toFixed(0)} kB  ${typ}`);
}
writeFileSync(path.join(UT, 'manifest.json'), JSON.stringify({ kalla: url, skordad: new Date().toISOString(), filer: manifest }, null, 1));
console.log(`\n${n} filer → ${UT}`);
console.log('Granska mappen (släng skräp från "liknande produkter"), committa och pusha.');
await ctx.close();
