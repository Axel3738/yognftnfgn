// kundvy.mjs — läser startsidan och produktsidan som kund, i Chromium, efter att looparna gått live.
//
//   node matstrumpor/ugc-loopar/kundvy.mjs [--bilder]
//
// Per vy: antal loopar, vilka (data-loop), Katarina-loopar (*_sv), Liquid-fel, bandets rubrik
// och produktbeskrivningens videor. ⛔ En Katarina-loop utanför Sverige = exit 1.
// --bilder sparar skärmdumpar i output/kundvy/ (mobil 390 px). Chromium här spelar inte H.264,
// så skärmdumparna visar loopens bildruta (postern), aldrig rörelsen.

import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const UT = join(HAR, 'output', 'kundvy');
export const VYER = [
  { namn: 'SE-start', url: 'https://matstrumpor.se/?country=SE', sverige: true, sida: 'start' },
  { namn: 'SE-produkt', url: 'https://matstrumpor.se/products/sushi-strumpor?country=SE', sverige: true, sida: 'produkt' },
  { namn: 'NO-start', url: 'https://matstrumpor.com/nb?country=NO', sverige: false, sida: 'start' },
  { namn: 'DE-start', url: 'https://matstrumpor.com/de?country=DE', sverige: false, sida: 'start' },
  { namn: 'DE-produkt', url: 'https://matstrumpor.com/de/products/sushi-strumpor?country=DE', sverige: false, sida: 'produkt' },
  { namn: 'US-start', url: 'https://matstrumpor.com/?country=US', sverige: false, sida: 'start' },
  { namn: 'JP-produkt', url: 'https://matstrumpor.com/ja/products/sushi-strumpor?country=JP', sverige: false, sida: 'produkt' },
];

async function main() {
  const bilder = process.argv.includes('--bilder');
  if (bilder) mkdirSync(UT, { recursive: true });
  const pw = await import(process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs');
  const b = await pw.chromium.launch({ headless: true, args: ['--no-sandbox', '--ignore-certificate-errors'], executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  let fel = 0;
  for (const v of VYER) {
    const c = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
    const p = await c.newPage();
    // Shopifys robotspärr ("Verify you are human") slår ibland till mot containern — vänta och försök igen.
    for (let f = 0; f < 4; f += 1) {
      await p.goto(v.url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
      if (!/Verify you are human|connection needs to be verified/i.test(await p.evaluate(() => document.body.innerText).catch(() => ''))) break;
      console.log(`   (${v.namn}: robotspärren, nytt försök om 20 s)`);
      await p.waitForTimeout(20000);
    }
    const H = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < H; y += 500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(150); }
    await p.evaluate(() => window.scrollTo(0, 0));
    const m = await p.evaluate(() => {
      const loopar = [...document.querySelectorAll('video.ms-loop__v')].map((x) => x.dataset.loop);
      const beskr = document.querySelector('.product__description');
      const beskrVideor = beskr ? [...beskr.querySelectorAll('video source')].map((s) => s.src.split('/').pop()) : [];
      const etiketter = beskr ? [...beskr.querySelectorAll('[data-t]')].map((d) => getComputedStyle(d, '::after').content) : [];
      return {
        lang: document.documentElement.lang,
        loopar,
        laddade: [...document.querySelectorAll('video.ms-loop__v')].filter((x) => x.getAttribute('src')).length,
        liquidFel: /Liquid (syntax )?error/i.test(document.body.innerText),
        band: document.querySelector('.ms-loop-band__rubrik')?.innerText ?? null,
        rubrikEm: document.querySelector('.ms-loop-wrapper .rich-text__heading em')?.innerText ?? null,
        grid: document.querySelector('.ms-loop-grid__rubrik')?.innerText ?? null,
        ai: /AI-gener|KI-gener|AI-generated/i.test(document.body.innerText),
        ezgif: !!document.querySelector('img[src*="ezgif"]'),
        beskrVideor: beskrVideor.length,
        etiketter,
        meta: document.querySelector('meta[name="description"]')?.content?.slice(0, 90) ?? null,
      };
    });
    const katarina = m.loopar.filter((x) => x?.endsWith('_sv'));
    const brott = !v.sverige && katarina.length > 0;
    if (brott || m.liquidFel) fel += 1;
    console.log(`${v.namn} (${m.lang}): ${m.loopar.length} loopar [${m.loopar.join(', ')}], ${m.laddade} laddade vid start${katarina.length ? `, Katarina ${katarina.length}` : ''}${brott ? ' ⛔ KATARINA UTANFÖR SVERIGE' : ''}${m.liquidFel ? ' ⛔ LIQUID-FEL' : ''}`);
    if (v.sida === 'start') console.log(`   band: "${m.band}" · rubrikens orange del: "${m.rubrikEm}" · rutnät: "${m.grid}" · AI-raden kvar: ${m.ai ? 'ja' : 'nej'}`);
    if (v.sida === 'produkt') console.log(`   beskrivningen: ${m.beskrVideor} videor, etiketter ${m.etiketter.join(' ')}, ezgif kvar: ${m.ezgif ? 'JA' : 'nej'} · meta: "${m.meta}"`);
    if (bilder) await p.screenshot({ path: join(UT, `${v.namn}.png`), fullPage: true });
    await c.close();
  }
  await b.close();
  if (fel) { console.log(`⛔ ${fel} vy(er) med fel`); process.exit(1); }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e.message); process.exit(1); });
