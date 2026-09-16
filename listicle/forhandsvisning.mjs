#!/usr/bin/env node
// forhandsvisning.mjs — sidan som skärmdumpar, utan nät i webbläsaren.
//
//   node listicle/forhandsvisning.mjs <handle>            # output/<handle>/forhandsvisning/{index.html,desktop.png,mobil.png}
//   node listicle/forhandsvisning.mjs <handle> --bara-html  # bygg bara den lokala kopian, ingen skärmdump
//
// Varför lokalt: claude.ai-containerns Chromium litar inte på proxyns
// certifikat (mätt 2026-09-16: ERR_CERT_AUTHORITY_INVALID mot baverbutiken.se
// och cdn.shopify.com), och TLS-kontrollen stängs aldrig av. Så bilderna och
// typsnitten hämtas här med Nodes fetch (som litar på CA-bundlen), skrivs
// lokalt, och HTML-kopian pekar på dem. Sedan renderas file:// med Playwright
// (globalt i containern) — hela sidan i riktig höjd + ett utsnitt per del
// (hero, punkt 1, punkt 2, slutblocken, sidfoten) i desktop 1280 px och mobil
// 390 px — eller, om Playwright saknas, med headless Chrome i fast fönsterhöjd.
// Mappen är gitignorerad.
//
// Skärmdumparna är till för att SESSIONEN ska titta (Read-verktyget) innan
// sidan levereras — inte för Axel.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname, extname, basename } from 'node:path';
import { somDokument } from './html.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
export const CHROME = process.env.LR_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const FONT_CSS = 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;700&display=swap';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const filnamnFor = (url) => {
  const ren = url.split(/[?#]/)[0];
  const ext = extname(ren) || '.bin';
  return `${createHash('sha1').update(url).digest('hex').slice(0, 12)}${ext}`;
};

async function hamta(url) {
  const r = await fetch(url, { headers: { 'user-agent': UA } });
  if (!r.ok) throw new Error(`${url} svarade ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

/** Byter varje https-bild och Google-fonts-importen mot lokala filer. Ren logik + injicerad hämtare. */
export async function lokalisera(fragment, mapp, { hamtaFn = hamta, logg = () => {} } = {}) {
  mkdirSync(mapp, { recursive: true });
  let ut = fragment;
  const urler = [...new Set([...fragment.matchAll(/src="(https:\/\/[^"]+)"/g)].map((m) => m[1]))];
  for (const url of urler) {
    const fil = filnamnFor(url);
    const sokvag = join(mapp, fil);
    if (!existsSync(sokvag)) {
      try { writeFileSync(sokvag, await hamtaFn(url)); logg(`  · ${fil} ← ${url.slice(0, 80)}`); }
      catch (e) { logg(`  ⚠ ${url.slice(0, 80)}: ${e.message}`); continue; }
    }
    ut = ut.split(`src="${url}"`).join(`src="${fil}"`);
  }
  // Typsnitten: css2-svaret pekar på woff2-filer — hämta dem och skriv om.
  try {
    let css = (await hamtaFn(FONT_CSS)).toString('utf8');
    for (const m of [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map((x) => x[1]))]) {
      const fil = filnamnFor(m);
      if (!existsSync(join(mapp, fil))) writeFileSync(join(mapp, fil), await hamtaFn(m));
      css = css.split(m).join(fil);
    }
    writeFileSync(join(mapp, 'fonter.css'), css);
    ut = ut.replace(/@import url\('https:\/\/fonts\.googleapis\.com[^']*'\);/, "@import url('fonter.css');");
    logg('  · typsnitt lokala (fonter.css)');
  } catch (e) {
    logg(`  ⚠ typsnitten kunde inte hämtas: ${e.message} — systemtypsnitt i skärmdumpen`);
  }
  return ut;
}

export const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';

/** Delarna som fotas var för sig (utöver hela sidan) — så de går att läsa i full storlek. */
export const UTSNITT = [['hero', '.lr-hero'], ['punkt1', '#lr-punkt-1'], ['punkt2', '#lr-punkt-2'], ['slut', '.lr-slut'], ['sidfot', '.lr-sidfot']];
export const VYER = [['desktop', 1280, 900], ['mobil', 390, 844]];

/**
 * Playwright (globalt installerad i containern, /opt/node22) ger riktig
 * helsideshöjd och elementbilder. Svarar null om modulen inte går att ladda —
 * då tar Chrome-CLI:t nedan över med fasta fönsterhöjder.
 */
export async function medPlaywright(indexFil, mapp, { logg = () => {}, modul = PLAYWRIGHT } = {}) {
  let pw;
  try { pw = await import(modul); } catch (e) { logg(`  · Playwright saknas (${e.message.split('\n')[0]}) — Chrome-CLI i stället`); return null; }
  let browser;
  try { browser = await pw.chromium.launch({ headless: true, args: ['--no-sandbox'] }); }
  catch (e) {
    if (!existsSync(CHROME)) { logg(`  · Playwright kunde inte starta (${e.message.split('\n')[0]})`); return null; }
    browser = await pw.chromium.launch({ headless: true, executablePath: CHROME, args: ['--no-sandbox'] });
  }
  const ut = {};
  try {
    for (const [namn, bredd, hojd] of VYER) {
      const page = await browser.newPage({ viewport: { width: bredd, height: hojd } });
      await page.goto(pathToFileURL(indexFil).href, { waitUntil: 'load' });
      await page.waitForTimeout(600);
      const hel = join(mapp, `${namn}.png`);
      await page.screenshot({ path: hel, fullPage: true });
      ut[namn] = hel;
      for (const [del, sel] of UTSNITT) {
        const el = page.locator(sel).first();
        if ((await el.count()) === 0) continue;
        const fil = join(mapp, `${namn}-${del}.png`);
        await el.screenshot({ path: fil });
        ut[`${namn}-${del}`] = fil;
      }
      await page.close();
      logg(`  ✓ ${namn}.png + ${UTSNITT.length} utsnitt (${bredd} px)`);
    }
  } finally {
    await browser.close();
  }
  return ut;
}

export function skarmdump(indexFil, utFil, { bredd, hojd, chrome = CHROME }) {
  if (!existsSync(chrome)) return { ok: false, skal: `Chrome saknas (${chrome})` };
  const r = spawnSync(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${bredd},${hojd}`, '--virtual-time-budget=6000', `--screenshot=${utFil}`, pathToFileURL(indexFil).href,
  ], { encoding: 'utf8', timeout: 120000 });
  if (!existsSync(utFil)) return { ok: false, skal: (r.stderr || r.stdout || '').split('\n').filter(Boolean).slice(-2).join(' ') };
  return { ok: true };
}

/**
 * `undermapp` = var skärmdumparna hamnar (standard "forhandsvisning"; en
 * marknadsversion får "forhandsvisning-en" så den svenska inte skrivs över),
 * `lang` = dokumentets språk (html lang).
 */
export async function forhandsvisa(handle, { baraHtml = false, logg = console.log, htmlFil = null, mapp = null, koncept = 'lagerrensning', undermapp = 'forhandsvisning', lang = 'sv' } = {}) {
  mapp = mapp ?? join(HAR, 'output', koncept, handle);
  // Utan angiven fil: den nyaste förhandsvisnings-HTML:en i mappen (inte *.sida.html — det är butikens body utan CSS).
  const fil = htmlFil ?? (() => { const f = readdirSync(mapp).filter((x) => x.endsWith('.html') && !x.endsWith('.sida.html')).sort().pop(); return f ? join(mapp, f) : null; })();
  if (!fil) throw new Error(`Ingen *.html i ${mapp} — kör bygg.mjs först.`);
  const fragment = readFileSync(fil, 'utf8');
  const fvMapp = join(mapp, undermapp);
  logg(`Förhandsvisning: ${fvMapp}`);
  const lokal = await lokalisera(fragment, fvMapp, { logg });
  const index = join(fvMapp, 'index.html');
  writeFileSync(index, somDokument(lokal, { titel: basename(fil), lang }));
  const ut = { index, desktop: null, mobil: null };
  if (baraHtml) return ut;
  const pw = await medPlaywright(index, fvMapp, { logg });
  if (pw) return { ...ut, ...pw };
  for (const [namn, bredd, hojd] of [['desktop', 1280, 7000], ['mobil', 390, 9000]]) {
    const fil = join(fvMapp, `${namn}.png`);
    const r = skarmdump(index, fil, { bredd, hojd });
    if (r.ok) { ut[namn] = fil; logg(`  ✓ ${namn}.png (${bredd}×${hojd})`); }
    else logg(`  ⚠ ${namn}: ingen skärmdump — ${r.skal}`);
  }
  return ut;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { spawnSync: sp } = await import('node:child_process');
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const r = sp(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
    process.exit(r.status ?? 1);
  }
  const argv = process.argv.slice(2);
  const handle = argv.find((a) => !a.startsWith('--'));
  if (!handle) { console.error('Användning: node listicle/forhandsvisning.mjs <handle> [--bara-html]'); process.exit(1); }
  forhandsvisa(handle, { baraHtml: argv.includes('--bara-html') }).catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
