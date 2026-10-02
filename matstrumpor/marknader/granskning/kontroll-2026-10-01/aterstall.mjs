// Kontrollskript ur sajtgranskningen 2026-10-01 (matstrumpor/marknader/granskning/SAJT-2026-10-01.md, fynd K-01).
// Håller inne ms-paket.js tills "Köp 2 – få 2" valts och läser sedan vilket kort som är valt. node aterstall.mjs DE "https://matstrumpor.com/de/products/sushi-strumpor?country=DE" de-DE
// Läs-bart enligt granskningens regler: väljer land, lägger i korgen och öppnar kassan, men skriver aldrig
// något i kassan och trycker aldrig betala. Metas pixel och formulärposter blockeras av webb.mjs.
// Utdata (JSON och skärmdumpar) hamnar i $UT, annars i systemets tmp-mapp, aldrig i repot.
// Kräver Chromium och Playwright som i claude.ai-containern (sökvägarna står i webb.mjs) och
// NODE_USE_ENV_PROXY=1 bakom proxyn.
import { starta, sida } from './webb.mjs';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const UT = process.env.UT ?? join(tmpdir(), 'kontroll-2026-10-01');
mkdirSync(join(UT, 'matningar'), { recursive: true });
mkdirSync(join(UT, 'bilder'), { recursive: true });
import { writeFileSync } from 'node:fs';
const [land, url, locale] = process.argv.slice(2);
const b = await starta();
const { ctx, page } = await sida(b, { locale, mobil: true });
let slapp; const halls = new Promise((r) => (slapp = r));
await page.route('**/assets/ms-paket.js*', async (route) => { await halls; await route.continue(); });
const lage = () => page.evaluate(() => ({
  definierad: !!customElements.get('ms-paket'),
  radios: [...document.querySelectorAll('ms-paket .ms-paket__input')].map((i) => ({ kod: i.dataset.kod, namn: i.name, checked: i.checked, gomd: !!i.closest('[hidden]'), formAgare: i.form ? (i.form.getAttribute('action') || 'form') : null })),
  formKvantitet: (() => { const f = [...document.querySelectorAll('form[action*="/cart/add"]')].find((x) => x.querySelector('button[name="add"]')); const q = f && f.querySelector('input[name="quantity"]'); return q ? q.value : null; })(),
  valtKortText: (() => { const i = [...document.querySelectorAll('.ms-paket__input:checked')].find((x) => !x.closest('[hidden]')); return i ? i.closest('.ms-paket__opt').innerText.replace(/\s+/g, ' ').slice(0, 70) : null; })(),
}));
const ut = { land, url, start: new Date().toISOString() };
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(() => {});
const opt = page.locator('.ms-paket__opt:visible', { has: page.locator('.ms-paket__input[data-kod^="SUSHI-K2F2"]') }).first();
await opt.waitFor({ state: 'visible', timeout: 60000 });
ut.foreVal = await lage();
await opt.click();
await page.waitForTimeout(500);
ut.efterVal_skriptetInneHallet = await lage();
await page.screenshot({ path: `${UT}/bilder/aterstall-${land}-1-valt-K2F2.png` });
slapp();
await page.waitForFunction(() => !!customElements.get('ms-paket'), null, { timeout: 60000 });
await page.waitForTimeout(1500);
ut.efterSkriptet = await lage();
await page.locator('.ms-paket__opt:visible').first().scrollIntoViewIfNeeded().catch(() => {});
await page.screenshot({ path: `${UT}/bilder/aterstall-${land}-2-efter-skriptet.png` });
ut.slut = new Date().toISOString();
writeFileSync(`${UT}/matningar/aterstall-${land}.json`, JSON.stringify(ut, null, 1));
const kort = (l) => l.radios.filter((r) => !r.gomd).map((r) => `${r.kod}${r.checked ? '✓' : ''}`).join(' ') + ' | gömda: ' + l.radios.filter((r) => r.gomd).map((r) => `${r.kod}${r.checked ? '✓' : ''}(${r.namn.slice(-12)})`).join(' ');
console.log(land, 'före val:', kort(ut.foreVal));
console.log(land, 'efter val (skriptet inne):', kort(ut.efterVal_skriptetInneHallet), 'kvantitet', ut.efterVal_skriptetInneHallet.formKvantitet);
console.log(land, 'efter skriptet:', kort(ut.efterSkriptet), 'kvantitet', ut.efterSkriptet.formKvantitet, '| valt kort:', ut.efterSkriptet.valtKortText);
await b.close();
