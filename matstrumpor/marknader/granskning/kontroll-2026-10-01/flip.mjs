// Kontrollskript ur sajtgranskningen 2026-10-01 (matstrumpor/marknader/granskning/SAJT-2026-10-01.md, fynd K-01).
// A/B-testet "paket" i Sverige: när variant a:s kort byts mot b:s. node flip.mjs A (eller B). Inget läggs i korgen.
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
const prof = process.argv[2] || 'A';
const P = prof === 'A' ? { latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 } : { latency: 100, downloadThroughput: 4e6 / 8, uploadThroughput: 3e6 / 8 };
const b = await starta();
const { ctx, page } = await sida(b, { locale: 'sv-SE', mobil: true });
await ctx.addCookies([{ name: 'ms_ab_paket', value: 'b', domain: 'matstrumpor.se', path: '/' }]);
await ctx.addInitScript({ content: `(() => { window.__f = []; let sen = '';
  const syns = (el) => { if (!el) return false; if (el.closest('[hidden]')) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  document.addEventListener('DOMContentLoaded', () => window.__f.push({ t: Math.round(performance.now()), h: 'DOMContentLoaded' }));
  const iv = setInterval(() => { try {
    const a = document.querySelector('[data-ms-ab="paket:a"]'), b = document.querySelector('[data-ms-ab="paket:b"]');
    const kod = [...document.querySelectorAll('.ms-paket__input:checked')].filter((i) => !i.closest('[hidden]')).map((i) => i.dataset.kod).join(',');
    const l = JSON.stringify([!!a, syns(a), !!b, syns(b), kod, !!customElements.get('ms-paket')]);
    if (l !== sen) { window.__f.push({ t: Math.round(performance.now()), aFinns: !!a, aSyns: syns(a), bFinns: !!b, bSyns: syns(b), valt: kod, msPaket: !!customElements.get('ms-paket') }); sen = l; }
  } catch (e) {} }, 50); setTimeout(() => clearInterval(iv), 30000); })();` });
const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.emulateNetworkConditions', { offline: false, ...P });
await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
const start = new Date().toISOString();
const resp = await page.goto('https://matstrumpor.se/products/sushi-strumpor?country=SE', { waitUntil: 'commit', timeout: 90000 });
let skott = 0;
for (let i = 0; i < 40; i++) {
  await page.waitForTimeout(500);
  const f = await page.evaluate(() => window.__f || []).catch(() => []);
  const sista = f[f.length - 1];
  if (skott === 0 && f.some((x) => x.aSyns)) { await page.locator('[data-ms-ab="paket:a"]').scrollIntoViewIfNeeded().catch(() => {}); await page.screenshot({ path: `${UT}/bilder/abflip-${prof}${process.argv[3] || ""}-1-a-syns.png` }); skott = 1; }
  if (skott === 1 && sista && sista.bSyns) { await page.locator('[data-ms-ab="paket:b"]').scrollIntoViewIfNeeded().catch(() => {}); await page.screenshot({ path: `${UT}/bilder/abflip-${prof}${process.argv[3] || ""}-2-b-syns.png` }); skott = 2; }
  if (skott === 2 && i > 20) break;
}
const html = await resp.text().catch(() => '');
const ia = html.indexOf('data-ms-ab="paket:a"'), ib = html.indexOf('data-ms-ab="paket:b"'), is = html.indexOf('ms-ab.js');
const ut = { start, profil: prof, kaka: 'ms_ab_paket=b', tidslinje: await page.evaluate(() => window.__f), html: { msAbSkriptPos: is, paketAPos: ia, paketBPos: ib, paketATagg: html.slice(Math.max(0, html.lastIndexOf('<', ia)), ia + 40), paketBTagg: html.slice(Math.max(0, html.lastIndexOf('<', ib)), ib + 40) } };
writeFileSync(`${UT}/matningar/abflip-SE-${prof}${process.argv[3] || ""}.json`, JSON.stringify(ut, null, 1));
console.log(JSON.stringify(ut.tidslinje), JSON.stringify(ut.html));
await b.close();
