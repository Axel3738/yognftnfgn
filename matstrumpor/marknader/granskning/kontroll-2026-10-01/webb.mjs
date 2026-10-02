// Chromium för granskningen, som kund. Metas pixel blockeras (connect.facebook.net, facebook.com/tr)
// och adressen sparas innan begäran avbryts. Formulär som skickar något blockeras också, som ett
// skyddsnät: kontaktformuläret, nyhetsbrevet, kundkonton, recensioner, Trustpilot, prenumerationer.
// Granskaren skriver ändå aldrig något och klickar aldrig på en skicka- eller betalknapp.
//
//   import { starta, sida } from './webb.mjs';
//   const b = await starta();
//   const { page, pixlar, stoppat } = await sida(b, { locale: 'de-DE', mobil: false });
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
export const UA_DATOR = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
export const UA_MOBIL = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const PIXEL = /(^https?:\/\/connect\.facebook\.net\/)|(facebook\.com\/tr)/i;
// POST som skickar kunddata eller registrerar något. Kassans egna GraphQL-läsningar släpps igenom.
const SKICKAR = [
  /\/contact(\b|\?|$)/i, /\/account(\/|\?|$)/i, /\/customer(s)?\//i, /^https?:\/\/[^/]+\/challenge(\?|\/?$)/i,
  /judge\.me\/.*review(?!_translations)/i, /trustpilot\./i, /subscri/i, /\/newsletter/i,
  /klaviyo\.com\/(client\/)?(subscriptions|profiles|back-in-stock)/i, /\/gift_cards?\//i,
];

export async function starta() {
  return chromium.launch({
    executablePath: CHROME,
    args: ['--ignore-certificate-errors', '--disable-blink-features=AutomationControlled'],
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  });
}

export async function sida(browser, { locale = 'en-US', mobil = false, viewport, ua } = {}) {
  const ctx = await browser.newContext({
    locale,
    viewport: viewport ?? (mobil ? { width: 390, height: 844 } : { width: 1280, height: 900 }),
    isMobile: mobil,
    hasTouch: mobil,
    deviceScaleFactor: mobil ? 2 : 1,
    userAgent: ua ?? (mobil ? UA_MOBIL : UA_DATOR),
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: { 'Accept-Language': `${locale},${locale.split('-')[0]};q=0.9,en;q=0.5` },
  });
  const pixlar = [];
  const stoppat = [];
  const konsol = [];
  await ctx.route('**/*', (route) => {
    const r = route.request();
    const url = r.url();
    if (PIXEL.test(url)) { pixlar.push(url); return route.abort(); }
    if (r.method() === 'POST' && SKICKAR.some((re) => re.test(url))) { stoppat.push(url); return route.abort(); }
    return route.continue();
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') konsol.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => konsol.push(`pageerror: ${String(e.message).slice(0, 300)}`));
  return { ctx, page, pixlar, stoppat, konsol };
}

// Läs sidans grunddata ur DOM:en.
export async function lasGrund(page) {
  return page.evaluate(() => ({
    url: location.href,
    lang: document.documentElement.lang,
    land: window.Shopify?.country ?? null,
    valuta: window.Shopify?.currency?.active ?? null,
    locale: window.Shopify?.locale ?? null,
    rot: window.Shopify?.routes?.root ?? null,
    titel: document.title,
  }));
}
