// skarmdump.mjs — tar skärmdumpar av en sida som en kund ser den (Chromium via
// Playwright, samma väg som factory/marknadskoll.mjs). Desktop 1280 px och
// mobil 390 px, hela sidan, plus en bild per sektion om --sektioner ges.
//
//   node storytelling/skarmdump.mjs <url> <utfil-prefix> [--sektioner bb-historia,bb-recensioner]
//
// Sidan rullas igenom först så temats inrullningsanimationer (data-aos) och
// lazyload-bilderna hinner visas — annars blir halva sidan tom i dumpen.

import { existsSync } from 'node:fs';

const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME_KANDIDATER = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'];

async function startaChromium() {
  const pw = await import(PLAYWRIGHT);
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const args = ['--no-sandbox', '--ignore-certificate-errors'];
  const fel = [];
  for (const exe of [null, ...CHROME_KANDIDATER]) {
    if (exe && !existsSync(exe)) continue;
    try { return await pw.chromium.launch({ headless: true, args, proxy, ...(exe ? { executablePath: exe } : {}) }); }
    catch (e) { fel.push(e.message.split('\n')[0]); }
  }
  throw new Error(`Chromium startade inte: ${fel.join(' | ')}`);
}

async function rullaIgenom(page) {
  const hojd = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < hojd; y += 500) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(900);
}

export async function dumpa(url, prefix, { sektioner = [], vyer = [['desktop', 1280, 900], ['mobil', 390, 844]] } = {}) {
  const b = await startaChromium();
  const ut = [];
  try {
    for (const [namn, width, height] of vyer) {
      const ctx = await b.newContext({ viewport: { width, height }, deviceScaleFactor: 1, locale: 'sv-SE', ignoreHTTPSErrors: true, userAgent: namn === 'mobil' ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' : undefined });
      const page = await ctx.newPage();
      try { await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }); }
      catch { await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }); }
      await page.waitForTimeout(2500);
      await rullaIgenom(page);
      const fil = `${prefix}-${namn}.png`;
      await page.screenshot({ path: fil, fullPage: true });
      ut.push(fil);
      for (const s of sektioner) {
        const el = page.locator(`[data-section-type="${s}"]`).first();
        if (await el.count()) { const f = `${prefix}-${namn}-${s}.png`; await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(600); await el.screenshot({ path: f }); ut.push(f); }
      }
      await ctx.close();
    }
  } finally { await b.close(); }
  return ut;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const [url, prefix] = process.argv.slice(2);
  const i = process.argv.indexOf('--sektioner');
  const sektioner = i > 0 ? process.argv[i + 1].split(',') : [];
  if (!url || !prefix) { console.error('Användning: node storytelling/skarmdump.mjs <url> <prefix> [--sektioner a,b]'); process.exit(1); }
  dumpa(url, prefix, { sektioner }).then((f) => console.log(f.join('\n'))).catch((e) => { console.error(e.message); process.exit(1); });
}
