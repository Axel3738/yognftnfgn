import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PROFILE_DIR = path.join(ROOT, 'profile');

// Headed by default: admin.shopify.com sits behind Cloudflare bot detection that
// blocks headless Chrome outright ("Just a moment..."). A real headed window passes.
export async function launch({ headed = true } = {}) {
  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    channel: 'chrome',
    headless: !headed,
    viewport: { width: 1440, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  return context;
}

export function adminUrl(store, suffix = '') {
  return `https://admin.shopify.com/store/${store}${suffix}`;
}

export function isLoginUrl(url) {
  return /accounts\.shopify\.com|admin\.shopify\.com\/login|identity\.shopify\.com/.test(url);
}

// The embedded app renders in an iframe on the vendor's own origin.
// Prefer a kachingappz frame; otherwise the first frame that is neither
// Shopify admin chrome nor a Shopify-owned service frame.
export function findAppFrame(page) {
  const frames = page.frames().filter((f) => /^https?:/.test(f.url()) && f.url() !== page.url());
  return (
    frames.find((f) => /kachingappz/.test(f.url())) ||
    frames.find((f) => !/admin\.shopify\.com|\.shopify\.com|shopifycloud|shopifysvc|cdn\.shopify/.test(f.url()))
  );
}

export async function waitForAppFrame(page, { timeoutMs = 45000 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const frame = findAppFrame(page);
    if (frame) return frame;
    await page.waitForTimeout(500);
  }
  return null;
}

// Admin GraphQL via Shopify's own web proxy, authenticated by the admin session.
// Discovered/proven in the MX build: POST /api/shopify/<handle>?operation=<name>&type=<query|mutation>
// with x-shopify-web-force-proxy: 1 and a fresh CSRF token from the server-data script.
export async function adminGraphql(page, storeHandle, query, variables = {}) {
  return page.evaluate(
    async ({ storeHandle, query, variables }) => {
      const el = document.querySelector('script[data-serialized-id="server-data"]');
      let csrf = null;
      if (el) {
        try { csrf = JSON.parse(el.textContent).csrfToken ?? null; } catch { /* fall through */ }
      }
      if (!csrf) {
        const m = document.documentElement.innerHTML.match(/"csrfToken"\s*:\s*"([^"]+)"/);
        csrf = m ? m[1] : null;
      }
      const type = /^\s*mutation/.test(query) ? 'mutation' : 'query';
      const res = await fetch(`https://admin.shopify.com/api/shopify/${storeHandle}?operation=q&type=${type}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
          'x-shopify-web-force-proxy': '1',
          ...(csrf ? { 'x-csrf-token': csrf } : {}),
        },
        body: JSON.stringify({ query, variables }),
      });
      const text = await res.text();
      try { return { status: res.status, json: JSON.parse(text) }; }
      catch { return { status: res.status, text }; }
    },
    { storeHandle, query, variables },
  );
}
