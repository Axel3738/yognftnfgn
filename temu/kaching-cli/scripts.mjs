// Lists the script URLs the Kaching admin app loads, so their bundles can be
// downloaded and grepped for the real API routes.
import { withApp } from './lib/api.mjs';

const store = process.argv[2];
const urls = await withApp(store, async (call, { frame }) =>
  frame.evaluate(() => [...document.querySelectorAll('script[src], link[rel="modulepreload"][href]')]
    .map((n) => n.src || n.href)));
for (const u of urls) console.log(u);
