// Renders a real storefront page through the admin theme editor's preview iframe.
// That preview carries a staff session, so it works on a password-protected shop
// without ever handling the storefront password.
import { launch, adminUrl, isLoginUrl } from './lib/browser.mjs';

const store = process.argv[2];
const previewPath = process.argv[3] || '/';
const themeId = process.argv[4];
const out = process.argv[5] || 'theme-preview.png';

const context = await launch({ headed: true });
try {
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1700, height: 1400 });
  const url = adminUrl(store, `/themes/${themeId}/editor?previewPath=${encodeURIComponent(previewPath)}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  if (isLoginUrl(page.url())) throw new Error('inte inloggad');

  // The editor boots, then loads the storefront into a nested preview iframe.
  // The storefront sits in a frame nested inside the editor shell, so match on
  // content (does this document contain the widget?) rather than on URL shape.
  let shopFrame = null;
  for (let i = 0; i < 60 && !shopFrame; i++) {
    await page.waitForTimeout(2000);
    for (const f of page.frames()) {
      const has = await f.evaluate(() => !!document.querySelector('kaching-bundle, [class*="kaching-bundles"], script.kaching-bundles-deal-block-settings')).catch(() => false);
      if (has) { shopFrame = f; break; }
    }
    if (i === 20) console.log('ramar hittills:', page.frames().map((f) => f.url().slice(0, 80)).join('\n  '));
  }
  if (!shopFrame) throw new Error('hittade ingen ram som innehåller Kaching-widgeten');
  console.log('storefront-iframe:', shopFrame.url().slice(0, 120));
  // The settings JSON is server-rendered; the Svelte widget hydrates a beat later.
  for (let i = 0; i < 20; i++) {
    const painted = await shopFrame.evaluate(() => {
      const n = document.querySelector('kaching-bundle, [class*="kaching-bundles__block"]');
      return !!n && n.getBoundingClientRect().height > 80;
    }).catch(() => false);
    if (painted) break;
    await page.waitForTimeout(1500);
  }

  const dump = await shopFrame.evaluate(() => {
    const blocks = [...document.querySelectorAll('script.kaching-bundles-deal-block-settings')]
      .map((s) => { try { return JSON.parse(s.textContent); } catch { return null; } })
      .filter(Boolean);
    const w = document.querySelector('kaching-bundle, [class*="kaching-bundles__block"]');
    return {
      dealBlockJson: blocks.map((b) => ({
        blockTitle: b.blockTitle, spacing: b.spacing, cornerRadius: b.cornerRadius,
        bars: (b.dealBars || []).map((d) => `${d.title} | qty ${d.quantity} | ${d.discountType}=${d.discountValue} | badge "${d.badgeText}"`),
      })),
      widgetText: w ? w.innerText : null,
    };
  });
  console.log(JSON.stringify(dump, null, 2));

  let best = null;
  for (const sel of ['kaching-bundle', '[class*="kaching-bundles__block"]']) {
    for (const h of await shopFrame.$$(sel)) {
      const box = await h.boundingBox();
      if (box && box.height > 60 && (!best || box.height > best.box.height)) best = { h, box };
    }
  }
  if (best) {
    await best.h.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    await best.h.screenshot({ path: out });
    console.log(`Storefront-skärmbild sparad: ${out} (${Math.round(best.box.width)}x${Math.round(best.box.height)} px)`);
  } else {
    await page.screenshot({ path: out });
    console.log(`Helsidesbild sparad: ${out}`);
  }
} finally {
  await context.close();
}
