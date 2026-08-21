// Skärmbild av förhandstemat. Kör: node skott.mjs <url> <fil> [höjd]
// Utgående trafik måste gå via miljöns proxy, annars svarar Shopify inte alls.
import { chromium } from 'playwright';

const [url, fil, höjd = '2400'] = process.argv.slice(2);
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;

const webbläsare = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  proxy: proxy ? { server: proxy } : undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors',
         `--proxy-server=${proxy}`,
         '--test-type'],
});
const kontext = await webbläsare.newContext({
  viewport: { width: 1440, height: Number(höjd) },
  ignoreHTTPSErrors: true,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36',
});
const sida = await kontext.newPage();
await sida.goto(url, { waitUntil: 'load', timeout: 90000 });
await sida.waitForTimeout(3500);
await sida.screenshot({ path: fil });
console.log('sparad:', fil);
await webbläsare.close();
