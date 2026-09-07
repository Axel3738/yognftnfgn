// Kaching's own admin backend, driven from inside the app iframe.
// Endpoints discovered by capturing the app's traffic on 2026-08-20:
//   GET    /frontend_api/deal_blocks           -> summary list
//   GET    /frontend_api/deal_blocks/:id       -> { deal_block: {...} } full object
//   POST   /frontend_api/deal_blocks           -> create
//   PUT    /frontend_api/deal_blocks/:id       -> update
//   DELETE /frontend_api/deal_blocks/:id       -> delete
// Auth: App Bridge injects a fresh session-token JWT into every fetch made in the frame.

import { launch, adminUrl, isLoginUrl, waitForAppFrame } from './browser.mjs';

export const API = 'https://bundles.kachingappz.app/frontend_api';

// Opens the Kaching app once and hands back a caller(method, path, body) bound to
// that frame, so a create + read-back costs one browser launch instead of two.
export async function withApp(store, fn, { headed = true } = {}) {
  const context = await launch({ headed });
  try {
    const page = context.pages()[0] || (await context.newPage());
    await page.goto(adminUrl(store, '/apps/bundle-deals'), { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    if (isLoginUrl(page.url())) throw new Error('inte inloggad — kör: node kaching.mjs login');
    const frame = await waitForAppFrame(page, { timeoutMs: 45000 });
    if (!frame) throw new Error('hittade ingen Kaching-iframe (är appen installerad i butiken?)');
    await page.waitForTimeout(3000);

    const call = async (method, path, body) => {
      const out = await frame.evaluate(async ({ method, path, body }) => {
        const headers = { 'x-requested-with': 'XMLHttpRequest', accept: 'application/json' };
        if (body !== null && body !== undefined) headers['content-type'] = 'application/json';
        if (window.shopify?.idToken) {
          try { headers.authorization = `Bearer ${await window.shopify.idToken()}`; } catch { /* interceptor covers it */ }
        }
        const res = await fetch(path, {
          method, headers, credentials: 'include',
          body: body === null || body === undefined ? undefined : JSON.stringify(body),
        });
        const text = await res.text();
        return { status: res.status, text };
      }, { method, path, body: body ?? null });
      let json = null;
      try { json = JSON.parse(out.text); } catch { /* non-JSON error page */ }
      return { status: out.status, json, text: out.text };
    };

    return await fn(call, { page, frame });
  } finally {
    await context.close();
  }
}

export function assertOk(label, res) {
  if (res.status >= 400 || !res.json) {
    throw new Error(`${label} misslyckades (${res.status}): ${res.text.slice(0, 600)}`);
  }
  return res.json;
}
