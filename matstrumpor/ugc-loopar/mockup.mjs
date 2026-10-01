// mockup.mjs — bygger designförslagen i en LOKAL kopia av sidan (inget skrivs i butiken).
//   node matstrumpor/ugc-loopar/mockup.mjs start|produkt <bredd>     (390 = mobil, 1440 = dator)
// Kräver looparna i output/loopar/ (klipp.sh). Skärmdumparna hamnar i output/skarmar/.
// Laddar matstrumpor.se som svensk kund, tar "före"-bilder av varje område, lägger in looparna i
// DOM:en och tar "efter"-bilder. Looparna serveras lokalt via page.route (https://loopar.test/…).
import { mkdirSync } from 'node:fs';
const pw = await import('/opt/node22/lib/node_modules/playwright/index.mjs');
const [sida = 'start', bredd = '390', ut = new URL('./output/skarmar', import.meta.url).pathname] = process.argv.slice(2);
mkdirSync(ut, { recursive: true });
const DIR = new URL('./output/loopar/', import.meta.url).pathname;
const URL_ = sida === 'start' ? 'https://matstrumpor.se/?country=SE' : 'https://matstrumpor.se/products/sushi-strumpor?country=SE';
const b = await pw.chromium.launch({ headless: true, args: ['--no-sandbox', '--ignore-certificate-errors', '--autoplay-policy=no-user-gesture-required'], executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const c = await b.newContext({ viewport: { width: +bredd, height: +bredd < 700 ? 844 : 900 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true, locale: 'sv-SE' });
await c.route('https://loopar.test/**', (r) => {
  const fil = r.request().url().split('/').pop();
  const typ = fil.endsWith('.webm') ? 'video/webm' : fil.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
  return r.fulfill({ path: DIR + fil, contentType: typ, headers: { 'Accept-Ranges': 'none' } });
});
const p = await c.newPage();
await p.goto(URL_, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => console.error('goto', e.message));
const H = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < H; y += 500) { await p.evaluate((y) => window.scrollTo(0, y), y); await p.waitForTimeout(200); }
await p.evaluate(() => window.scrollTo(0, 0));
await p.waitForTimeout(800);
// Stäng cookie-/popup-rutor så de inte ligger över bilderna
await p.addStyleTag({ content: '[id$="__header"], .shopify-section-header-sticky{position:relative!important;top:0!important} .ms-sticky, [id$="__ms_sticky"]{display:none!important}' });
await p.evaluate(() => document.querySelectorAll('#shopify-pc__banner, .shopify-pc__banner__dialog, [id^="klaviyo"], .needsclick.kl-private-reset-css-Xuajs1').forEach((e) => e.remove()));

// Områdena per sida: selektor för "före" (samma element får förslaget)
const OMR = sida === 'start'
  ? [['1-hero', '[id$="__hero"]'], ['2-band', '[id$="__trustpilot_rad"]'], ['3-berattelse', '[id$="__berattelse"]'], ['4-somdeanvands', '[id$="__ugc_galleri"]']]
  : [['5-kopruta', '.product__description'], ['6-beskrivning', '.product__description'], ['7-morkt-block', '[id$="__judgeme_widget"]']];

async function bild(sel, fil, extraTopp = 0, hojd = null) {
  const box = await p.evaluate(([s]) => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: 'start' }); const r = e.getBoundingClientRect(); return { x: 0, y: r.top + scrollY, w: innerWidth, h: r.height }; }, [sel]);
  if (!box) { console.log('saknas', sel); return; }
  await p.waitForTimeout(500);
  await frys();
  await p.screenshot({ path: fil, fullPage: true, clip: { x: 0, y: Math.max(0, box.y - extraTopp), width: box.w, height: hojd ?? (box.h + extraTopp) } });
}

// Ställ varje video på sin bästa ruta (data-snap) så skärmdumpen visar rätt ögonblick
async function frys() {
  await p.evaluate(async () => {
    const vs = [...document.querySelectorAll('video.ms-loop__v')];
    await Promise.all(vs.map((v) => new Promise((res) => {
      const klar = () => { v.pause(); const t = parseFloat(v.dataset.snap || '0'); if (Math.abs(v.currentTime - t) < 0.05) return res(); v.addEventListener('seeked', () => res(), { once: true }); v.currentTime = t; setTimeout(res, 3000); };
      if (v.readyState >= 2) klar(); else { v.addEventListener('loadeddata', klar, { once: true }); v.load(); setTimeout(res, 5000); }
    })));
  });
  await p.waitForTimeout(300);
}

// ---------- FÖRE ----------
if (sida === 'start') {
  for (const [n, s] of OMR) await bild(s, `${ut}/${n}-fore-${bredd}.png`);
} else {
  await bild('.product-form__buttons', `${ut}/5-kopruta-fore-${bredd}.png`, 60, 1100);
  await bild('.product__description', `${ut}/6-beskrivning-fore-${bredd}.png`);
  await bild('[id$="__judgeme_widget"]', `${ut}/7-morkt-block-fore-${bredd}.png`, 0, 700);
}
await p.screenshot({ path: `${ut}/${sida}-hela-fore-${bredd}.png`, fullPage: true });

// ---------- FÖRSLAGEN ----------
await p.evaluate((sida) => {
  const SNAP = { avslojandet: 2.2, rullen: 1.6, uppackningen: 2.6, ladan: 3.4, soffan: 1.75, strumpan_sv: 1.9, reaktionen_sv: 2.0, tamago_sv: 1.0 };
  // Skärmdumpsläget: den valda bildrutan som <img> (headless-Chromium hoppar inte pålitligt i video).
  // I butiken blir det <video autoplay muted loop playsinline> med samma ruta som poster.
  const v = (n) => `<img class="ms-loop__v" alt="" src="https://loopar.test/${n}.jpg">`;
  const css = document.createElement('style');
  css.textContent = `
  .ms-loop__v{display:block;width:100%;height:100%;object-fit:cover;background:#f4ede4}
  .ms-loop-kort{position:relative;border-radius:18px;overflow:hidden;aspect-ratio:1/1;box-shadow:0 6px 22px rgba(0,0,0,.10)}
  .ms-accent{color:rgb(221,130,29)}
  /* band */
  .ms-loop-band{padding:18px 0 22px;background:#fff}
  .ms-loop-band__rubrik{font-family:var(--font-heading-family);font-size:1.7rem;text-align:center;margin:0 16px 12px;color:#121212}
  .ms-loop-band__rad{display:flex;gap:10px;overflow-x:auto;padding:0 16px 4px;scrollbar-width:none;justify-content:flex-start}
  .ms-loop-band__item{flex:0 0 132px}
  .ms-loop-band__item .ms-loop-kort{border-radius:14px;box-shadow:none;outline:3px solid rgb(221,130,29);outline-offset:-3px}
  .ms-loop-band__txt{font-size:1.15rem;text-align:center;margin-top:6px;color:#121212;font-family:var(--font-heading-family)}
  @media (min-width:750px){.ms-loop-band__rad{justify-content:center}.ms-loop-band__item{flex-basis:190px}.ms-loop-band__rubrik{font-size:2.2rem}}
  /* berättelse */
  .ms-loop-split{display:grid;gap:22px;align-items:center;max-width:1100px;margin:0 auto;padding:0 16px}
  .ms-loop-split .ms-loop-kort{max-width:520px;width:100%;margin:0 auto}
  @media (min-width:750px){.ms-loop-split{grid-template-columns:1fr 1fr;text-align:left}.ms-loop-split .rich-text__blocks{text-align:left}}
  /* grid */
  .ms-loop-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:0 16px;max-width:1100px;margin:0 auto}
  @media (min-width:750px){.ms-loop-grid{grid-template-columns:repeat(4,1fr);gap:16px}}
  .ms-loop-grid .ms-loop-kort{border-radius:14px}
  .ms-loop-grid__txt{position:absolute;left:8px;bottom:8px;background:rgba(255,255,255,.92);color:#121212;font-family:var(--font-heading-family);font-size:1.15rem;padding:4px 10px;border-radius:999px}
  /* mörkt block */
  .ms-loop-mork{background:#1c1714;color:#fff;padding:26px 16px 30px}
  .ms-loop-mork__inre{max-width:1000px;margin:0 auto;display:grid;gap:20px;align-items:center}
  @media (min-width:750px){.ms-loop-mork__inre{grid-template-columns:1fr 1fr}}
  .ms-loop-mork .ms-loop-kort{border-radius:18px 18px 0 0;box-shadow:none}
  .ms-loop-mork__knapp{display:block;background:rgb(221,130,29);color:#fff;text-align:center;font-family:var(--font-heading-family);font-size:1.7rem;padding:13px;border-radius:0 0 18px 18px;text-decoration:none}
  .ms-loop-mork h2{color:#fff;font-family:var(--font-heading-family);font-size:2.6rem;line-height:1.15;margin:0 0 12px}
  .ms-loop-mork p{color:rgba(255,255,255,.86);font-size:1.45rem;line-height:1.6;margin:0}
  @media (min-width:750px){.ms-loop-mork h2{font-size:3.8rem}.ms-loop-mork p{font-size:1.8rem}.ms-loop-mork{padding:56px 16px}}
  /* beskrivningens loopar */
  .product__description .ms-loop-kort{margin:14px 0 18px;max-width:420px}
  `;
  document.head.appendChild(css);

  if (sida === 'start') {
    // 1. Hero: mobil = avslöjandet i stället för fotot; dator = fotot kvar + loopen som kort bredvid texten
    if (innerWidth < 750) {
      const media = document.querySelector('[id$="__hero"] .banner__media');
      media.innerHTML = v('avslojandet');
      const st = document.createElement('style');
      st.textContent = `[id$="__hero"] .banner__media{height:100vw!important;min-height:0!important;position:relative!important}[id$="__hero"] .banner{min-height:0!important}[id$="__hero"] .banner::after{opacity:0!important}`;
      document.head.appendChild(st);
    } else {
      const banner = document.querySelector('[id$="__hero"] .banner');
      const kort = document.createElement('div');
      kort.className = 'ms-loop-hero-kort';
      kort.innerHTML = `<div class="ms-loop-kort">${v('avslojandet')}</div>`;
      banner.appendChild(kort);
      const st = document.createElement('style');
      st.textContent = `[id$="__hero"] .banner{position:relative}
        [id$="__hero"] .banner__content{justify-content:flex-start!important;padding-left:6%!important}
        [id$="__hero"] .banner__box{max-width:560px!important;margin:0!important;text-align:left!important}
        [id$="__hero"] .banner__box > *{text-align:left!important;justify-content:flex-start!important}
        .ms-loop-hero-kort{position:absolute;right:7%;top:50%;transform:translateY(-50%) rotate(2deg);width:min(34vw,420px);z-index:2;background:#fff;padding:10px;border-radius:22px;box-shadow:0 18px 40px rgba(0,0,0,.25)}
        .ms-loop-hero-kort .ms-loop-kort{border-radius:14px;box-shadow:none}`;
      document.head.appendChild(st);
    }
    // 2. Loop-bandet under Trustpilot-raden
    const band = document.createElement('section');
    band.className = 'ms-loop-band'; band.id = 'ms-loop-band';
    const items = [['ladan', 'Lådan'], ['avslojandet', 'Avslöjandet'], ['strumpan_sv', 'Strumpan'], ['uppackningen', 'Uppackningen'], ['soffan', 'Myskvällen']];
    band.innerHTML = `<h2 class="ms-loop-band__rubrik">Så ser det ut när lådan öppnas</h2><div class="ms-loop-band__rad">${items.map(([n, t]) => `<div class="ms-loop-band__item"><div class="ms-loop-kort">${v(n)}</div><div class="ms-loop-band__txt">${t}</div></div>`).join('')}</div>`;
    document.querySelector('[id$="__trustpilot_rad"]').after(band);
    // 3. Berättelsen: loop + orange accent i rubriken
    const ber = document.querySelector('[id$="__berattelse"] .rich-text__wrapper');
    const blocks = ber.querySelector('.rich-text__blocks');
    const h = blocks.querySelector('h2');
    h.innerHTML = h.textContent.replace('aldrig blandar ihop', '<span class="ms-accent">aldrig blandar ihop</span>');
    const wrap = document.createElement('div'); wrap.className = 'ms-loop-split';
    wrap.innerHTML = `<div class="ms-loop-kort">${v('rullen')}</div>`;
    ber.prepend(wrap); wrap.appendChild(blocks);
    // 4. Som de används: riktiga loopar i stället för AI-bilderna
    const gal = document.querySelector('[id$="__ugc_galleri"] .page-width');
    const rubrik = gal.querySelector('h2')?.outerHTML ?? '<h2 class="h1">Som de används</h2>';
    const g = [['uppackningen', 'Uppackningen'], ['soffan', 'Myskvällen'], ['reaktionen_sv', 'Reaktionen'], ['tamago_sv', 'Strumpan']];
    gal.innerHTML = `<div style="padding:0 16px 14px">${rubrik}</div><div class="ms-loop-grid">${g.map(([n, t]) => `<div class="ms-loop-kort">${v(n)}<span class="ms-loop-grid__txt">${t}</span></div>`).join('')}</div>`;
    document.querySelector('[id$="__ugc_markning"]')?.remove();
  } else {
    // 5. Mini-band direkt efter köprutan (före beskrivningen)
    const desc = document.querySelector('.product__description');
    const mini = document.createElement('div');
    mini.className = 'ms-loop-band'; mini.id = 'ms-loop-mini'; mini.style.cssText = 'padding:14px 0 18px;margin:0 -1.5rem';
    const m = [['ladan', 'Lådan'], ['avslojandet', 'Avslöjandet'], ['uppackningen', 'Reaktionen']];
    mini.innerHTML = `<div class="ms-loop-band__rad" style="gap:8px">${m.map(([n, t]) => `<div class="ms-loop-band__item" style="flex:0 0 31%"><div class="ms-loop-kort">${v(n)}</div><div class="ms-loop-band__txt">${t}</div></div>`).join('')}</div>`;
    desc.before(mini);
    // 6. Beskrivningen: leverantörens webp → vår uppackning, avslöjandet under "Ser ut som sushi"
    const gammal = desc.querySelector('img[src*="ezgif"]');
    if (gammal) { const k = document.createElement('div'); k.className = 'ms-loop-kort'; k.innerHTML = v('uppackningen'); gammal.closest('p').replaceWith(k); }
    const h3 = [...desc.querySelectorAll('h3')].find((e) => e.textContent.includes('Ser ut som sushi'));
    if (h3) { let p = h3.nextElementSibling; while (p && p.tagName !== 'P') p = p.nextElementSibling; const k = document.createElement('div'); k.className = 'ms-loop-kort'; k.innerHTML = v('avslojandet'); (p || h3).after(k); }
    // 7. Mörkt block med knapp (före recensionerna)
    const mork = document.createElement('section');
    mork.className = 'ms-loop-mork'; mork.id = 'ms-loop-mork';
    mork.innerHTML = `<div class="ms-loop-mork__inre"><div><div class="ms-loop-kort">${v('rullen')}</div><a class="ms-loop-mork__knapp" href="#">Lägg i varukorgen</a></div><div><h2>Gåvan de skrattar åt först <span class="ms-accent">– och sen använder varje vecka.</span></h2><p>Levereras i en presentförpackning som ser ut som riktig mat.</p></div></div>`;
    document.querySelector('[id$="__judgeme_widget"]').before(mork);
  }
}, sida);
await p.waitForTimeout(2500);

// ---------- EFTER ----------
if (sida === 'start') {
  await bild('[id$="__hero"]', `${ut}/1-hero-efter-${bredd}.png`);
  await bild('#ms-loop-band', `${ut}/2-band-efter-${bredd}.png`);
  await bild('[id$="__berattelse"]', `${ut}/3-berattelse-efter-${bredd}.png`);
  await bild('[id$="__ugc_galleri"]', `${ut}/4-somdeanvands-efter-${bredd}.png`);
} else {
  await bild('.product-form__buttons', `${ut}/5-kopruta-efter-${bredd}.png`, 60, 1100 + Math.round(+bredd < 700 ? 200 : 260));
  await bild('.product__description', `${ut}/6-beskrivning-efter-${bredd}.png`);
  await bild('#ms-loop-mork', `${ut}/7-morkt-block-efter-${bredd}.png`);
}
await frys();
await p.screenshot({ path: `${ut}/${sida}-hela-efter-${bredd}.png`, fullPage: true });
await b.close();
console.log('klart', sida, bredd);
