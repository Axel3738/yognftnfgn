// Screenshots Kaching's own live preview of a deal block, inside the app editor.
// Avoids needing the storefront password on a password-protected shop.
import { launch, adminUrl, isLoginUrl, waitForAppFrame } from './lib/browser.mjs';

const store = process.argv[2];
const id = process.argv[3];
const out = process.argv[4] || 'preview.png';

const context = await launch({ headed: true });
try {
  const page = context.pages()[0] || (await context.newPage());
  // Wide viewport: the app's preview column is a fraction of the window, and a
  // narrow one wraps prices mid-number ("1 398,00 kr" -> "1 / 398,00 / kr").
  await page.setViewportSize({ width: 2400, height: 1500 });
  await page.goto(adminUrl(store, `/apps/bundle-deals/app/deal_blocks/${id}/edit`), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  if (isLoginUrl(page.url())) throw new Error('inte inloggad');
  const frame = await waitForAppFrame(page, { timeoutMs: 45000 });
  if (!frame) throw new Error('ingen app-iframe');
  await page.waitForTimeout(12000);

  const info = await frame.evaluate(() => {
    const hit = document.querySelector('kaching-bundle, .kaching-bundles__block, [class*="kaching-bundles__"]');
    return {
      href: location.href,
      widgetFound: !!hit,
      text: hit ? hit.innerText : (document.body.innerText || '').slice(0, 800),
    };
  });
  console.log('iframe:', info.href);
  console.log('widget i DOM:', info.widgetFound);
  console.log('--- text ---');
  console.log(info.text);

  // Prefer a tight shot of the widget itself over the whole admin chrome.
  let best = null;
  for (const sel of ['kaching-bundle', '.kaching-bundles__block', '[class*="kaching-bundles__"]']) {
    for (const h of await frame.$$(sel)) {
      const box = await h.boundingBox();
      if (box && (!best || box.height > best.box.height)) best = { h, box };
    }
  }
  if (best) {
    await best.h.screenshot({ path: out });
    console.log(`Widget-skärmbild sparad: ${out} (${Math.round(best.box.width)}x${Math.round(best.box.height)} px)`);
  } else {
    await page.screenshot({ path: out, fullPage: true });
    console.log(`Helsidesbild sparad: ${out}`);
  }
} finally {
  await context.close();
}
