// kund.mjs — beaverstoreco.com som KUND i Chromium, efter att JavaScript (Kaching, Judge.me,
// bw-appord, cookiebannern) har ritat sidan. Läs-bart: lägger aldrig en order.
//
//   node worldwide/granskning/kund.mjs --land DE --sprak de [--sidor alla|/,/products/x] [--skarm] [--ut <mapp>]
//   node worldwide/granskning/kund.mjs --land DE --sprak de --kassa [--skarm] [--ut <mapp>]
//
// Landet sätts som en kund gör (POST /localization → kakan), språket med Shopifys
// undermapp (/de, /fr …). ⚠️ Containern går ut på nätet från USA: utan landet blir allt USA.
// Utdata: <ut>/<LAND>-<sprak>.json (+ .kassa.json) och skärmdumpar <LAND>-<sprak>-<sida>-<mobil|desktop>.png.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = dirname(fileURLToPath(import.meta.url));
const W = JSON.parse(readFileSync(join(ROT, '..', 'konfig.json'), 'utf8'));
const U = JSON.parse(readFileSync(join(ROT, '..', 'urval.json'), 'utf8'));
export const BAS = `https://${W.marknad.doman.host}`;
const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'];
export const PRODUKTER = U.produkter.filter((p) => !p.under).map((p) => p.handle);

/** Alla sidor granskningen ska se (sökvägar utan språkprefix). */
export const SIDOR = {
  start: '/',
  ...Object.fromEntries(PRODUKTER.map((h, i) => [`p${String(i + 1).padStart(2, '0')}`, `/products/${h}`])),
  kollektion: '/collections/all',
  bestsaljare: '/collections/bestsaljare',
  sok: '/search?q=cover',
  s404: '/pages/finns-inte-xyz',
  kontakt: '/pages/contact',
  frakt: '/pages/fraktpolicy',
  retur: '/pages/retur-och-aterbetalningspolicy',
  villkor: '/pages/anvandarvillkor',
  integritet: '/pages/integritetspolicy',
  omoss: '/pages/om-oss',
  sparning: '/pages/spara',
  integritetsval: '/pages/data-sharing-opt-out',
  pol_refund: '/policies/refund-policy',
  pol_terms: '/policies/terms-of-service',
  pol_privacy: '/policies/privacy-policy',
  pol_shipping: '/policies/shipping-policy',
  korg: '/cart',
};

// Ord bara svenskan har (inte engelska/tyska/franska/spanska/italienska/nederländska/polska/portugisiska).
const SV_ORD = ['och', 'att', 'är', 'inte', 'som', 'eller', 'från', 'också', 'utan', 'när', 'där', 'varje', 'hela', 'eftersom', 'måste', 'bara', 'ingen', 'inga', 'ditt', 'dina', 'våra', 'vår', 'för', 'på', 'av', 'köp', 'köpa', 'varukorg', 'varukorgen', 'kassan', 'kassa', 'frakt', 'fri frakt', 'leverans', 'recension', 'recensioner', 'betyg', 'lägg', 'visa', 'sök', 'stäng', 'meny', 'kundvagn', 'dagar', 'arbetsdagar', 'spåra', 'paket', 'kontakta', 'oss', 'villkor', 'integritetspolicy', 'ångra', 'hos', 'dig', 'vi', 'du', 'här', 'alla', 'produkter', 'pris', 'ord', 'st', 'kr', 'moms', 'tack', 'mer', 'läs', 'nyhetsbrev', 'prenumerera', 'skicka', 'namn', 'telefon', 'meddelande', 'totalt', 'summa', 'rabatt', 'uppdatera', 'ta bort', 'fortsätt', 'handla'];
// "du", "vi", "mer", "pris", "alla" finns i andra språk — bara tillsammans med ett annat svenskt ord räknas de.
const SVAGA = new Set(['du', 'vi', 'mer', 'pris', 'alla', 'st', 'av', 'oss', 'ord', 'dig', 'paket', 'meny', 'visa', 'kassa', 'produkter', 'dagar', 'telefon', 'tack', 'hos', 'summa', 'rabatt', 'som', 'hela', 'bara', 'dina', 'inga', 'kr']);
const SV_RE = new RegExp(`(?<![\\p{L}])(${SV_ORD.join('|')})(?![\\p{L}])`, 'giu');
const NAMN_OK = /Göteborg|Stenkolsgatan|Bäverbutiken|Baverbutiken|STONEBITE|Sverige → Sweden|baverbutiken\.se/g;

/** Ser raden svensk ut? Ger orsaken eller null. */
export function svenskRad(rad, sprak) {
  const t = String(rad).replace(NAMN_OK, '');
  if (/[åÅ]/.test(t)) return 'å';
  if (sprak !== 'de' && /(?<![\p{L}])\p{L}*[äöÄÖ]\p{L}*(?![\p{L}])/u.test(t)) return 'ä/ö';
  const ord = [...t.matchAll(SV_RE)].map((m) => m[1].toLowerCase());
  const starka = ord.filter((o) => !SVAGA.has(o));
  if (starka.length >= 1 && ord.length >= 2) return `ord: ${[...new Set(ord)].slice(0, 5).join(', ')}`;
  if (starka.length >= 1 && t.trim().split(/\s+/).length <= 6) return `ord: ${starka[0]}`;
  return null;
}

export const prefix = (sprak) => (sprak === W.marknad.doman.standard ? '' : `/${sprak}`);

export async function startaBrowser() {
  const pw = await import(PLAYWRIGHT);
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const args = ['--no-sandbox', '--ignore-certificate-errors'];
  for (const exe of [null, ...CHROME]) {
    if (exe && !existsSync(exe)) continue;
    try { return await pw.chromium.launch({ headless: true, args, proxy, ...(exe ? { executablePath: exe } : {}) }); } catch { /* nästa */ }
  }
  throw new Error('Chromium startade inte');
}

export async function kontext(browser, land, sprak, { mobil = false } = {}) {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: mobil ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: 1, isMobile: mobil, hasTouch: mobil,
    locale: sprak === 'pt-PT' ? 'pt-PT' : sprak,
    userAgent: mobil
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
  });
  // Granskningen får aldrig synas i annonsdatan: Metas pixel, Googles och TikToks taggar och
  // Shopifys egen besöksstatistik blockeras (annars bokförs varje sida och varje "lägg i korgen"
  // som en amerikansk besökare hos Bäverbutikens pixel 1554276343018184).
  await ctx.route(/facebook\.(com|net)|fbcdn|googletagmanager|google-analytics|doubleclick|tiktok|snapchat|pinterest|bing\.com|clarity\.ms|monorail-edge|\/api\/collect|\/\.well-known\/shopify\/monorail|trekkie|shopifysvc\.com\/v1\/produce|\/web-pixels/, (route) => route.abort());
  // Landet och språket som kunden väljer dem (samma som landväljaren).
  const r = await ctx.request.post(`${BAS}/localization`, { form: { form_type: 'localization', _method: 'put', utf8: '✓', country_code: land, language_code: sprak, return_to: '/' }, maxRedirects: 0 });
  if (r.status() >= 400) throw new Error(`/localization svarade ${r.status()}`);
  // Shopify skickar FÖRSTA sidvisningen i en ny session till landets standardspråk (mätt 2026-10-01:
  // /it/products/x → 302 /products/x en gång, sedan 200). Uppvärmningen tar den omdirigeringen.
  await ctx.request.get(`${BAS}${prefix(sprak)}/`, { maxRedirects: 0 }).catch(() => {});
  return ctx;
}

const MAX_BITAR = Number(process.env.KUND_MAX_BITAR || 10);
const sov = (ms) => new Promise((ok) => setTimeout(ok, ms));

/** Läs en sida som kunden ser den. */
export async function lasSida(page, sokvag, sprak, { skarm = null } = {}) {
  const url = `${BAS}${prefix(sprak)}${sokvag}`;
  const svar = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  try { await page.waitForLoadState('networkidle', { timeout: 9000 }); } catch { /* appar som pollar */ }
  await sov(1500);
  const d = await page.evaluate(() => {
    const synlig = (e) => { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && (r.width > 0 || r.height > 0); };
    const txt = (sel) => [...document.querySelectorAll(sel)].filter(synlig).map((e) => e.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean);
    // Appar ritar även i shadow DOM och i iframes med srcdoc (Ultimate Trust Badges: "Betala säkert
    // med våra samarbetspartners." under köpknappen syntes inte i document.body.innerText).
    const extra = [];
    const skugga = (rot) => { for (const el of rot.querySelectorAll('*')) if (el.shadowRoot) { extra.push(...el.shadowRoot.textContent.split('\n')); skugga(el.shadowRoot); } };
    skugga(document);
    for (const f of document.querySelectorAll('iframe')) { try { const t = f.contentDocument?.body?.innerText; if (t && synlig(f)) extra.push(...t.split('\n').map((x) => `[iframe ${f.title || f.id || ''}] ${x}`)); } catch { /* annan origin */ } }
    const rader = [...new Set([...document.body.innerText.split('\n'), ...extra].map((x) => x.replace(/\s+/g, ' ').trim()).filter((x) => x && !/^\[iframe [^\]]*\]\s*$/.test(x)))];
    const lankar = [...document.querySelectorAll('a[href]')].filter(synlig).map((a) => ({ text: a.innerText.replace(/\s+/g, ' ').trim().slice(0, 80) || a.getAttribute('aria-label') || '', href: a.href }));
    const logga = [...document.querySelectorAll('header img, .site-header img, [class*="header"] img')].map((i) => `${i.alt}|${i.currentSrc || i.src}`).slice(0, 3);
    return {
      titel: document.title,
      lang: document.documentElement.lang,
      land: window.Shopify?.country ?? null,
      valuta: window.Shopify?.currency?.active ?? null,
      locale: window.Shopify?.locale ?? null,
      rader,
      annonsrad: txt('.announcement-slider__slide, .announcement-bar, [id^="AnnouncementSlide"]'),
      kaching: txt('kaching-bundle, kaching-bundles-block'),
      judgeme: txt('[class*="jdgm-widget"], .jdgm-rev-widg, .jdgm-preview-badge').map((x) => x.slice(0, 1500)),
      cookie: txt('#shopify-pc__banner, .shopify-pc__banner__dialog, #shopify-pc__prefs, [id*="cookie" i], [class*="cookie-banner" i]').map((x) => x.slice(0, 800)),
      lankar,
      logga,
      placeholders: [...document.querySelectorAll('input[placeholder],textarea[placeholder]')].map((e) => e.placeholder).filter(Boolean),
      aria: [...document.querySelectorAll('[aria-label]')].filter(synlig).map((e) => e.getAttribute('aria-label')).filter(Boolean).slice(0, 200),
    };
  });
  const svenska = [];
  for (const r of [...d.rader, ...d.placeholders, ...d.aria]) { const o = svenskRad(r, sprak); if (o) svenska.push({ rad: r.slice(0, 200), orsak: o }); }
  const kronor = d.rader.filter((r) => /(?<![\p{L}])(kr|SEK|kronor)(?![\p{L}])|\d\s?:-/u.test(r)).slice(0, 10);
  const ut = { sokvag, url: page.url(), status: svar?.status() ?? null, ...d, svenska, kronor };
  if (skarm) {
    // Skärmdumpen i bitar (en hel sida är 8 000 px hög och går inte att läsa): bit 1, 2, 3 …
    ut.skarm = [];
    try {
      const { width: B, height: vh } = page.viewportSize();
      const H = Math.round(vh * 1.6);
      const hojd = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let i = 0, y = 0; y < hojd && i < MAX_BITAR; i++, y += H) {
        const fil = skarm.replace('.png', `-${i + 1}.png`);
        await page.screenshot({ path: fil, fullPage: true, clip: { x: 0, y, width: B, height: Math.min(H, hojd - y) }, timeout: 30000 });
        ut.skarm.push(fil);
      }
    } catch (e) { ut.skarm_fel = e.message.split('\n')[0]; }
  }
  return ut;
}

/** Varukorgen, lådan och kassan som kund. Lägger ALDRIG en order: fyller aldrig e-post, trycker aldrig betala. */
export async function lasKassa(browser, land, sprak, { handle = PRODUKTER[0], skarm = null, mobil = true } = {}) {
  const ctx = await kontext(browser, land, sprak, { mobil });
  const page = await ctx.newPage();
  const ut = { land, sprak, handle };
  try {
    // Startsidan först: Shopify skickar sessionens första sidvisning till standardspråket (en), och
    // utan den hamnade en tysk kund på den engelska produktsidan (mätt 2026-10-01).
    await page.goto(`${BAS}${prefix(sprak)}/`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.goto(`${BAS}${prefix(sprak)}/products/${handle}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    ut.sidans_lang = await page.evaluate(() => document.documentElement.lang);
    try { await page.waitForLoadState('networkidle', { timeout: 9000 }); } catch {}
    const prod = await page.evaluate(async (h) => (await (await fetch(`/products/${h}.js`)).json()), handle);
    const variant = prod.variants.find((v) => v.available) ?? prod.variants[0];
    ut.produktpris = { pris: variant.price, valuta: (await page.evaluate(() => window.Shopify?.currency?.active)) };
    // Lägg i korgen med knappen, som kunden — då öppnas lådan.
    const knapp = page.locator('form[action*="/cart/add"] button[type="submit"], button[name="add"]').first();
    ut.knapptext = (await knapp.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    await knapp.click({ timeout: 15000 }).catch(async () => {
      await page.evaluate(async (id) => fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id, quantity: 1 }] }) }), variant.id);
      ut.knapp_fel = 'knappen gick inte att klicka — lades i via /cart/add.js';
    });
    await sov(3500);
    ut.lada = await page.evaluate(() => {
      const el = document.querySelector('#CartDrawer, .drawer--right.drawer--is-open, [id*="CartDrawer"], cart-drawer, .cart-drawer');
      return el ? el.innerText.replace(/\n+/g, '\n').trim().slice(0, 3000) : null;
    });
    if (skarm) { await page.screenshot({ path: skarm.replace('.png', '-lada.png'), timeout: 30000 }).catch(() => {}); }
    const korg = await page.evaluate(async () => (await (await fetch('/cart.js')).json()));
    ut.korg = { valuta: korg.currency, total: korg.total_price, rader: korg.items.map((i) => `${i.quantity}× ${i.title} ${i.final_line_price}`) };
    // Fraktpriset för landet (Shopifys AJAX, utan kassa och utan e-post).
    const adr = ADRESS[land] ?? { zip: '' };
    const fr = await page.evaluate(async ({ land, zip, prov }) => {
      const q = new URLSearchParams({ 'shipping_address[country]': land, 'shipping_address[zip]': zip, ...(prov ? { 'shipping_address[province]': prov } : {}) });
      await fetch(`/cart/prepare_shipping_rates.json?${q}`, { method: 'POST' });
      for (let i = 0; i < 8; i++) {
        const r = await fetch(`/cart/async_shipping_rates.json?${q}`);
        if (r.status === 200) { const j = await r.json(); if (j) return j; }
        await new Promise((o) => setTimeout(o, 1200));
      }
      return null;
    }, { land, zip: adr.zip, prov: adr.prov });
    ut.fraktpriser = fr?.shipping_rates?.map((r) => `${r.name}: ${r.price} ${r.currency}`) ?? fr;
    await page.goto(`${BAS}${prefix(sprak)}/cart`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    try { await page.waitForLoadState('networkidle', { timeout: 8000 }); } catch {}
    await sov(1500);
    ut.korgsida = await page.evaluate(() => document.querySelector('main')?.innerText.replace(/\n+/g, '\n').trim().slice(0, 2500));
    if (skarm) await page.screenshot({ path: skarm.replace('.png', '-korg.png'), fullPage: true, timeout: 30000 }).catch(() => {});
    // Kassan: samma väg som kassaknappen.
    await page.goto(`${BAS}${prefix(sprak)}/checkout`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    try { await page.waitForSelector('select[name="countryCode"], [name="countryCode"]', { timeout: 40000 }); } catch {}
    await sov(3000);
    ut.kassa = await page.evaluate(() => {
      const val = (s) => document.querySelector(s)?.value ?? null;
      const lbl = (inp) => (inp?.id && document.querySelector(`label[for="${CSS.escape(inp.id)}"]`)?.innerText) || inp?.closest('label')?.innerText || null;
      const mk = document.querySelector('input[name="marketing_opt_in"], #marketing_opt_in');
      return {
        url: location.href,
        lang: document.documentElement.lang,
        land: val('select[name="countryCode"]'),
        samtycke: mk ? { text: (lbl(mk) || '').replace(/\s+/g, ' ').trim(), ikryssad: mk.checked } : null,
        text: document.body.innerText.replace(/\n+/g, '\n').trim().slice(0, 5000),
      };
    });
    if (skarm) await page.screenshot({ path: skarm.replace('.png', '-kassa.png'), fullPage: true, timeout: 30000 }).catch(() => {});
    // Adressen (aldrig e-post/telefon): fraktraden i kassan räknas fram.
    if (adr.adress) {
      const fyll = async (sel, v) => { const f = page.locator(sel).first(); if (await f.count()) { await f.fill(v).catch(() => {}); } };
      await fyll('input[name="firstName"]', 'Test');
      await fyll('input[name="lastName"]', 'Kund');
      await fyll('input[name="address1"]', adr.adress);
      await page.keyboard.press('Escape').catch(() => {});
      await fyll('input[name="postalCode"]', adr.zip);
      await fyll('input[name="city"]', adr.stad);
      if (adr.prov) { const p = page.locator('select[name="zone"]').first(); if (await p.count()) await p.selectOption(adr.prov).catch(() => {}); }
      await page.locator('input[name="city"]').first().blur().catch(() => {});
      await sov(7000);
      ut.kassa_med_adress = await page.evaluate(() => document.body.innerText.replace(/\n+/g, '\n').trim().slice(0, 5000));
      if (skarm) await page.screenshot({ path: skarm.replace('.png', '-kassa-adress.png'), fullPage: true, timeout: 30000 }).catch(() => {});
      // Bred skärm: ordersammanfattningen (rabattnamnen, frakten, totalen) syns alltid där.
      await page.setViewportSize({ width: 1280, height: 900 }).catch(() => {});
      await sov(2500);
      ut.kassa_desktop = await page.evaluate(() => document.body.innerText.replace(/\n+/g, '\n').trim().slice(0, 6000));
      if (skarm) await page.screenshot({ path: skarm.replace('.png', '-kassa-desktop.png'), fullPage: true, timeout: 30000 }).catch(() => {});
    }
  } catch (e) { ut.fel = e.message.split('\n')[0]; }
  finally { await ctx.close(); }
  return ut;
}

/** En riktig postadress per land (huvudstadens stadshus/landmärke) — bara för att räkna fram frakten. */
export const ADRESS = {
  US: { adress: '1600 Pennsylvania Ave NW', zip: '20500', stad: 'Washington', prov: 'DC' }, CA: { adress: '111 Wellington St', zip: 'K1A 0A9', stad: 'Ottawa', prov: 'ON' },
  GB: { adress: '10 Downing Street', zip: 'SW1A 2AA', stad: 'London' }, IE: { adress: '1 Dame Street', zip: 'D02 X285', stad: 'Dublin' },
  AU: { adress: '1 Martin Place', zip: '2000', stad: 'Sydney', prov: 'NSW' }, NZ: { adress: '1 Queen Street', zip: '1010', stad: 'Auckland' },
  DE: { adress: 'Unter den Linden 1', zip: '10117', stad: 'Berlin' }, AT: { adress: 'Stephansplatz 1', zip: '1010', stad: 'Wien' }, CH: { adress: 'Bahnhofstrasse 1', zip: '8001', stad: 'Zürich' },
  NL: { adress: 'Dam 1', zip: '1012 JS', stad: 'Amsterdam' }, BE: { adress: 'Grote Markt 1', zip: '1000', stad: 'Brussel' }, LU: { adress: 'Place Guillaume II 1', zip: '1648', stad: 'Luxembourg' },
  FR: { adress: '1 Rue de Rivoli', zip: '75001', stad: 'Paris' }, ES: { adress: 'Calle Mayor 1', zip: '28013', stad: 'Madrid', prov: 'M' }, PT: { adress: 'Rua Augusta 1', zip: '1100-048', stad: 'Lisboa' },
  IT: { adress: 'Via del Corso 1', zip: '00186', stad: 'Roma', prov: 'RM' }, PL: { adress: 'Nowy Świat 1', zip: '00-496', stad: 'Warszawa' },
  CZ: { adress: 'Václavské náměstí 1', zip: '110 00', stad: 'Praha' }, SK: { adress: 'Hlavné námestie 1', zip: '811 01', stad: 'Bratislava' },
  SI: { adress: 'Prešernov trg 1', zip: '1000', stad: 'Ljubljana' }, HR: { adress: 'Trg bana Jelačića 1', zip: '10000', stad: 'Zagreb' },
  HU: { adress: 'Váci utca 1', zip: '1052', stad: 'Budapest' }, RO: { adress: 'Calea Victoriei 1', zip: '030023', stad: 'București' },
  BG: { adress: 'Vitosha 1', zip: '1000', stad: 'Sofia' }, GR: { adress: 'Ermou 1', zip: '105 63', stad: 'Athina' },
  CY: { adress: 'Ledras 1', zip: '1011', stad: 'Nicosia' }, MT: { adress: 'Republic Street 1', zip: 'VLT 1117', stad: 'Valletta' },
  EE: { adress: 'Raekoja plats 1', zip: '10146', stad: 'Tallinn' }, LV: { adress: 'Brīvības iela 1', zip: 'LV-1010', stad: 'Rīga' }, LT: { adress: 'Gedimino pr. 1', zip: '01103', stad: 'Vilnius' },
  AE: { adress: 'Sheikh Zayed Road 1', zip: '', stad: 'Dubai', prov: 'DU' }, HK: { adress: '1 Queen\'s Road Central', zip: '', stad: 'Central', prov: 'HK' },
  IL: { adress: 'Rothschild Blvd 1', zip: '6688101', stad: 'Tel Aviv' }, JP: { adress: '1-1 Marunouchi', zip: '100-0005', stad: 'Chiyoda-ku', prov: 'JP-13' },
  KR: { adress: '1 Sejong-daero', zip: '04524', stad: 'Seoul', prov: 'KR-11' }, MY: { adress: 'Jalan Ampang 1', zip: '50450', stad: 'Kuala Lumpur', prov: 'KUL' },
  SG: { adress: '1 Raffles Place', zip: '048616', stad: 'Singapore' },
};

async function huvud() {
  const a = process.argv.slice(2);
  const arg = (n, def = null) => (a.includes(n) ? a[a.indexOf(n) + 1] : def);
  const land = arg('--land', 'US'), sprak = arg('--sprak', 'en');
  const ut = arg('--ut', join(ROT, 'output'));
  mkdirSync(ut, { recursive: true });
  const browser = await startaBrowser();
  try {
    if (a.includes('--kassa')) {
      const r = await lasKassa(browser, land, sprak, { handle: arg('--produkt', PRODUKTER[0]), skarm: a.includes('--skarm') ? join(ut, `${land}-${sprak}.png`) : null });
      writeFileSync(join(ut, `${land}-${sprak}.kassa.json`), JSON.stringify(r, null, 1));
      console.log(JSON.stringify({ land, sprak, knapp: r.knapptext, korg: r.korg, frakt: r.fraktpriser, kassa: r.kassa && { lang: r.kassa.lang, land: r.kassa.land, samtycke: r.kassa.samtycke }, fel: r.fel }, null, 1));
      return;
    }
    const valda = arg('--sidor', 'alla');
    const sidor = valda === 'alla' ? Object.entries(SIDOR) : valda.split(',').map((s) => [Object.keys(SIDOR).find((k) => SIDOR[k] === s) ?? s.replace(/\W+/g, '_'), SIDOR[s] ?? s]);
    const resultat = [];
    // --skarm-sidor start,p01,korg: skärmdumpar bara av de sidorna (texten läses på alla).
    const skarmSidor = arg('--skarm-sidor') ? new Set(arg('--skarm-sidor').split(',')) : null;
    for (const mobil of a.includes('--skarm') ? [true, false] : [false]) {
      const ctx = await kontext(browser, land, sprak, { mobil });
      const page = await ctx.newPage();
      for (const [namn, sokvag] of sidor) {
        if (mobil && skarmSidor && !skarmSidor.has(namn)) continue;
        try {
          const skarm = a.includes('--skarm') && (!skarmSidor || skarmSidor.has(namn)) ? join(ut, `${land}-${sprak}-${namn}-${mobil ? 'mobil' : 'desktop'}.png`) : null;
          const r = await lasSida(page, sokvag, sprak, { skarm });
          resultat.push({ namn, vy: mobil ? 'mobil' : 'desktop', ...r });
          console.log(`${r.status} ${namn.padEnd(14)} ${mobil ? 'mobil  ' : 'desktop'} lang ${r.lang} ${r.land}/${r.valuta} · svenska ${r.svenska.length} · kronor ${r.kronor.length}`);
        } catch (e) { resultat.push({ namn, sokvag, fel: e.message.split('\n')[0] }); console.log(`✗ ${namn}: ${e.message.split('\n')[0]}`); }
      }
      await ctx.close();
    }
    writeFileSync(join(ut, `${land}-${sprak}.json`), JSON.stringify(resultat, null, 1));
  } finally { await browser.close(); }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
