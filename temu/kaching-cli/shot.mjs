// Renders a storefront product page in the logged-in browser and screenshots the
// Kaching widget, so a bundle can be checked visually and not just in JSON.
import { launch, isLoginUrl } from './lib/browser.mjs';

const url = process.argv[2];
const out = process.argv[3] || 'shot.png';
const password = process.argv[4] || null;

const context = await launch({ headed: true });
try {
  const page = context.pages()[0] || (await context.newPage());
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  if (/\/password/.test(page.url())) {
    if (!password) throw new Error(`butiken är lösenordsskyddad (${page.url()}) — skicka lösenordet som 3:e argument`);
    await page.fill('input[type="password"]', password);
    await page.press('input[type="password"]', 'Enter');
    await page.waitForTimeout(3000);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
  }
  if (isLoginUrl(page.url())) throw new Error('hamnade på inloggningssidan');

  // The widget hydrates client-side; wait for a deal bar to actually paint.
  let el = null;
  for (let i = 0; i < 30; i++) {
    el = await page.$('kaching-bundle, .kaching-bundles__block, [class*="kaching-bundles"]');
    if (el) {
      const box = await el.boundingBox();
      if (box && box.height > 80) break;
    }
    await page.waitForTimeout(1000);
  }
  if (!el) {
    console.log('INGEN Kaching-widget hittades i DOM:en.');
    console.log('URL:', page.url());
    console.log('TITEL:', await page.title());
    await page.screenshot({ path: out, fullPage: false });
    console.log(`Helskärmsbild sparad: ${out}`);
  } else {
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const box = await el.boundingBox();
    console.log(`Widget hittad: ${Math.round(box.width)}x${Math.round(box.height)} px`);
    await page.screenshot({
      path: out,
      clip: { x: Math.max(0, box.x - 8), y: Math.max(0, box.y - 8), width: Math.min(box.width + 16, 1280), height: Math.min(box.height + 16, 1400) },
    });
    console.log(`Skärmbild sparad: ${out}`);
    const text = await el.innerText();
    console.log('--- widgetens text ---');
    console.log(text);
  }
} finally {
  await context.close();
}
