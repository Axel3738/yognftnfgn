// Throwaway prober: opens the Kaching app once and runs several fetches inside the
// iframe, so endpoint discovery doesn't pay a browser launch per call.
import fs from 'node:fs';
import { launch, adminUrl, waitForAppFrame } from './lib/browser.mjs';

const store = process.argv[2];
const spec = JSON.parse(fs.readFileSync(process.argv[3], 'utf8')); // [{method,path,body}]

const context = await launch({ headed: true });
const page = context.pages()[0] || (await context.newPage());
await page.goto(adminUrl(store, '/apps/bundle-deals'), { waitUntil: 'domcontentloaded' });
const frame = await waitForAppFrame(page, { timeoutMs: 40000 });
if (!frame) { console.error('ingen app-iframe'); await context.close(); process.exit(1); }
await page.waitForTimeout(4000);

for (const call of spec) {
  const out = await frame.evaluate(async ({ method, path, body }) => {
    const headers = { 'x-requested-with': 'XMLHttpRequest', accept: 'application/json' };
    if (body) headers['content-type'] = 'application/json';
    if (window.shopify?.idToken) {
      try { headers.authorization = `Bearer ${await window.shopify.idToken()}`; } catch { /* interceptor */ }
    }
    try {
      const res = await fetch(path, { method, headers, credentials: 'include', body: body ? JSON.stringify(body) : undefined });
      const text = await res.text();
      return { status: res.status, len: text.length, text };
    } catch (e) { return { error: String(e) }; }
  }, call);
  console.log(`\n=== ${call.method} ${call.path} -> ${out.status ?? out.error} (${out.len ?? 0} tecken)`);
  if (out.text) console.log(out.text);
}
await context.close();
