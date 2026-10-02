// Kontrollskript ur sajtgranskningen 2026-10-01 (matstrumpor/marknader/granskning/SAJT-2026-10-01.md, fynd K-01).
// Köpknappen och paketväljaren som ny kund på strypt mobilnät. node prova.mjs <bana> "SE:N:A,DE:F:B,…" (land:N vanlig/F snabb kund:A PageSpeeds mobilprofil/B 4 Mbit/s). Länder: SE, DE, DK, JP och sedan 2026-10-02 varje annonslänk (NO, NOB, FI, US, GB, FR, NL, ES, IT, PL, PT).
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

const MAT = join(UT, 'matningar');
const BILD = join(UT, 'bilder');

const LAND = {
  SE: { url: 'https://matstrumpor.se/products/sushi-strumpor?country=SE', locale: 'sv-SE', rot: '/', vantat: 79800 },
  DE: { url: 'https://matstrumpor.com/de/products/sushi-strumpor?country=DE', locale: 'de-DE', rot: '/de/', vantat: 8980 },
  DK: { url: 'https://matstrumpor.com/da/products/sushi-strumpor?country=DK', locale: 'da-DK', rot: '/da/', vantat: 68600 },
  JP: { url: 'https://matstrumpor.com/ja/products/sushi-strumpor?country=JP', locale: 'ja-JP', rot: '/ja/', vantat: 15960 },
  // Resten av annonslänkarna, tillagda vid första dygnets felkoll 2026-10-02 (README → Start fredag).
  NO: { url: 'https://matstrumpor.com/nb/products/sushi-strumpor?country=NO', locale: 'nb-NO', rot: '/nb/', vantat: 93800 },
  NOB: { url: 'https://matstrumpor.no/products/sushi-strumpor?country=NO', locale: 'nb-NO', rot: '/', vantat: 93800 },
  FI: { url: 'https://matstrumpor.com/fi/products/sushi-strumpor?country=FI', locale: 'fi-FI', rot: '/fi/', vantat: 8980 },
  US: { url: 'https://matstrumpor.com/products/sushi-strumpor?country=US', locale: 'en-US', rot: '/', vantat: 13800 },
  GB: { url: 'https://matstrumpor.com/products/sushi-strumpor?country=GB', locale: 'en-GB', rot: '/', vantat: 10800 },
  FR: { url: 'https://matstrumpor.com/fr/products/sushi-strumpor?country=FR', locale: 'fr-FR', rot: '/fr/', vantat: 8980 },
  NL: { url: 'https://matstrumpor.com/nl/products/sushi-strumpor?country=NL', locale: 'nl-NL', rot: '/nl/', vantat: 8980 },
  ES: { url: 'https://matstrumpor.com/es/products/sushi-strumpor?country=ES', locale: 'es-ES', rot: '/es/', vantat: 8980 },
  IT: { url: 'https://matstrumpor.com/it/products/sushi-strumpor?country=IT', locale: 'it-IT', rot: '/it/', vantat: 8980 },
  PL: { url: 'https://matstrumpor.com/pl/products/sushi-strumpor?country=PL', locale: 'pl-PL', rot: '/pl/', vantat: 40200 },
  PT: { url: 'https://matstrumpor.com/pt-pt/products/sushi-strumpor?country=PT', locale: 'pt-PT', rot: '/pt-pt/', vantat: 8980 },
};
const PROFIL = {
  A: { namn: 'Fast 3G-nivå', latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 },
  B: { namn: 'Slow 4G-nivå', latency: 100, downloadThroughput: 4e6 / 8, uploadThroughput: 3e6 / 8 },
};

const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const nu = () => new Date().toISOString();

const INIT = `(() => {
  window.__msT = {};
  const mark = (k) => { if (window.__msT[k] == null) window.__msT[k] = Math.round(performance.now()); };
  try { customElements.whenDefined('ms-paket').then(() => mark('msPaketDefinierad')); } catch (e) {}
  try { customElements.whenDefined('product-form').then(() => mark('productFormDefinierad')); } catch (e) {}
  try { customElements.whenDefined('cart-drawer').then(() => mark('cartDrawerDefinierad')); } catch (e) {}
  document.addEventListener('DOMContentLoaded', () => mark('dcl'));
  window.addEventListener('load', () => mark('load'));
  const syns = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.05; };
  const iv = setInterval(() => {
    try {
      const knappar = [...document.querySelectorAll('form[action*="/cart/add"] button[name="add"], form[action*="/cart/add"] [type="submit"]')];
      if (knappar.some(syns)) mark('knappSyns');
      if (knappar.some((k) => syns(k) && !k.disabled)) mark('knappKlickbar');
      if ([...document.querySelectorAll('.ms-paket__opt')].some(syns)) mark('valjareSyns');
      if ([...document.querySelectorAll('ms-paket')].some((e) => e.knapp)) mark('msPaketKopplad');
      const T = window.__msT;
      if (T.msPaketKopplad != null && T.knappKlickbar != null && T.valjareSyns != null) clearInterval(iv);
    } catch (e) {}
  }, 50);
})();`;

// Läser sidolådan, korgsidan och formuläret i sidan.
async function lasLage(page) {
  return page.evaluate(() => {
    const syns = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const lada = document.querySelector('cart-drawer');
    const ladaOppen = !!lada && (lada.classList.contains('active') || lada.classList.contains('animate')) && syns(lada.querySelector('.drawer__inner'));
    const txt = (sel, rot = document) => { const e = rot.querySelector(sel); return e ? e.innerText.replace(/\s+/g, ' ').trim() : null; };
    return {
      url: location.pathname + location.search,
      titel: document.title,
      ladaOppen,
      ladaTotal: lada ? txt('.totals__total-value', lada) : null,
      ladaRabatt: lada ? [...lada.querySelectorAll('.discounts__discount, .cart-discount, .discounts')].map((e) => e.innerText.replace(/\s+/g, ' ').trim()).join(' | ') : null,
      ladaAntal: lada ? [...lada.querySelectorAll('input[name="updates[]"]')].map((i) => i.value).join(',') : null,
      ladaText: lada && ladaOppen ? lada.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) : null,
      paCorgsida: /\/cart(\?|$)/.test(location.pathname + location.search) || /\/cart$/.test(location.pathname),
      korgsidaTotal: txt('main .totals__total-value') ?? txt('.totals__total-value'),
      korgsidaTom: !!document.querySelector('.cart__empty-text, .cart--empty, cart-items.is-empty') && /tom|empty|leer|vazio|vuoto|vide|pusty|leeg|vacío|空|tyhjä|tomt/i.test(document.body.innerText.slice(0, 3000)),
      felRad: (() => { const f = document.querySelector('[data-ms-paket-fel]'); return f && !f.hidden ? f.innerText : null; })(),
      laddar: !!document.querySelector('.loading__spinner:not(.hidden)'),
    };
  }).catch((e) => ({ fel: String(e.message).slice(0, 120) }));
}

async function korgJs(page, rot) {
  return page.evaluate(async (rot) => {
    try {
      const r = await fetch(rot + 'cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      const v = await r.json();
      return {
        status: r.status, token: (v.token || '').slice(0, 12), item_count: v.item_count, total_price: v.total_price,
        original_total_price: v.original_total_price, total_discount: v.total_discount, currency: v.currency,
        discount_codes: v.discount_codes, rader: (v.items || []).map((i) => ({ titel: i.product_title, variant: i.variant_title, antal: i.quantity, rad: i.final_line_price })),
      };
    } catch (e) { return { fel: String(e.message).slice(0, 120) }; }
  }, rot).catch((e) => ({ fel: String(e.message).slice(0, 120) }));
}

async function enKorning(browser, bana, nr, land, typ, profilKod) {
  const L = LAND[land];
  const P = PROFIL[profilKod];
  const id = `${bana}${String(nr).padStart(2, '0')}-${land}-${typ}-${profilKod}`;
  const ut = { id, land, typ: typ === 'N' ? 'vanlig kund' : 'snabb kund', profil: `${profilKod} ${P.namn}`, cpu: '4x', adress: L.url, start: nu(), steg: [], natet: [], navigeringar: [], status429: 0, utmaning: false };
  const { ctx, page, pixlar, stoppat, konsol } = await sida(browser, { locale: L.locale, mobil: true });
  const t0 = Date.now();
  const rel = () => Date.now() - t0;
  const logg = (vad, extra = {}) => { ut.steg.push({ t: rel(), vad, ...extra }); };
  try {
    await ctx.addInitScript({ content: INIT });
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: P.latency, downloadThroughput: P.downloadThroughput, uploadThroughput: P.uploadThroughput });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

    const intressant = /ms-paket|product-form\.js|global\.js|cart-drawer\.js|ms-cro|\/cart(\/|\.js|\?|$)|\/discount\/|\/checkouts?\/|update\.js|change\.js|add\.js|\/cart\/add/;
    const start = new Map();
    page.on('request', (r) => { if (intressant.test(r.url())) start.set(r, rel()); });
    const avsluta = (r, status, fel) => {
      if (!start.has(r)) return;
      const u = new URL(r.url());
      ut.natet.push({ start: start.get(r), slut: rel(), metod: r.method(), vag: (u.pathname + u.search).slice(0, 140), status, fel, typ: r.resourceType(), navigering: r.isNavigationRequest() });
      start.delete(r);
    };
    page.on('requestfinished', async (r) => { const s = await r.response().catch(() => null); avsluta(r, s ? s.status() : null); });
    page.on('requestfailed', (r) => avsluta(r, null, r.failure()?.errorText));
    page.on('response', (s) => { if (s.status() === 429) ut.status429++; });
    page.on('framenavigated', (f) => { if (f === page.mainFrame()) { const u = new URL(f.url()); ut.navigeringar.push({ t: rel(), vag: (u.pathname + u.search).slice(0, 140) }); } });

    logg('goto');
    await page.goto(L.url, { waitUntil: 'commit', timeout: 120000 });
    // Botskyddet: vänta ut utmaningen.
    for (let i = 0; i < 40; i++) {
      const titel = await page.title().catch(() => '');
      if (/just a moment|nur einen moment|verifying|et øjeblik|しばらく|ett ögonblick/i.test(titel)) { ut.utmaning = true; await sov(1000); continue; }
      break;
    }

    const opt = page.locator('.ms-paket__opt:visible', { has: page.locator('.ms-paket__input[data-kod^="SUSHI-K2F2"]') }).first();
    const knapp = page.locator('form[action*="/cart/add"] button[name="add"]:visible').first();
    await opt.waitFor({ state: 'visible', timeout: 120000 });
    logg('väljaren syns');
    if (typ === 'N') await sov(3000); // läser korten
    const foreVal = await page.evaluate(() => ({ T: { ...window.__msT }, msPaket: !!customElements.get('ms-paket'), kopplad: [...document.querySelectorAll('ms-paket')].some((e) => e.knapp) }));
    await opt.click({ timeout: 60000 });
    logg('valt K2F2', { foreVal });
    if (typ === 'N') await sov(1000);
    await knapp.waitFor({ state: 'visible', timeout: 120000 });
    const foreKlick = await page.evaluate(() => {
      const f = [...document.querySelectorAll('form[action*="/cart/add"]')].find((x) => x.querySelector('button[name="add"]'));
      const q = f && f.querySelector('input[name="quantity"]');
      const valdInput = [...document.querySelectorAll('.ms-paket__input:checked')].find((i) => !i.closest('[hidden]'));
      const kortPris = valdInput ? (valdInput.closest('.ms-paket__opt')?.querySelector('[data-ms-paket-nu]')?.innerText ?? null) : null;
      return {
        T: { ...window.__msT }, nuMs: Math.round(performance.now()),
        msPaketDefinierad: !!customElements.get('ms-paket'), msPaketKopplad: [...document.querySelectorAll('ms-paket')].some((e) => e.knapp),
        productForm: !!customElements.get('product-form'), msWindow: !!window.MS,
        formKvantitet: q ? q.value : null, valdKod: valdInput ? valdInput.dataset.kod : null, valdAntal: valdInput ? valdInput.dataset.antal : null, kortPris,
        skript: [...document.scripts].filter((s) => /ms-paket|product-form|ms-cro|global\.js/.test(s.src)).map((s) => ({ src: s.src.replace(/^https?:\/\/[^/]+/, '').slice(0, 90), defer: s.defer, async: s.async })),
      };
    });
    await knapp.click({ timeout: 60000, noWaitAfter: true });
    const klickT = rel();
    logg('köpknappen tryckt', { foreKlick });
    ut.foreKlick = foreKlick;

    // Följ vad som händer i 45 s: sidolådan, omladdningar, korgsidan.
    let forstaLada = null; const ladaHistorik = []; let senast = '';
    let kassaKlickad = false; let kassaKlickLage = null;
    for (let i = 0; i < 180; i++) {
      await sov(250);
      const l = await lasLage(page);
      const nyckel = JSON.stringify([l.url, l.ladaOppen, l.ladaTotal, l.ladaAntal, l.korgsidaTotal, l.korgsidaTom, l.felRad]);
      if (nyckel !== senast) { ladaHistorik.push({ t: rel(), ...l, ladaText: l.ladaText ? l.ladaText.slice(0, 200) : null }); senast = nyckel; }
      if (l.ladaOppen && !forstaLada) {
        forstaLada = { t: rel(), sedanKlick: rel() - klickT, total: l.ladaTotal, antal: l.ladaAntal, rabatt: l.ladaRabatt, text: l.ladaText };
        forstaLada.korgJs = await korgJs(page, L.rot);
        await page.screenshot({ path: `${BILD}/${id}-1-lada.png` }).catch(() => {});
      }
      // En beslutsam kund trycker "Kassa" i lådan ca 2 s efter att den öppnats.
      if (!kassaKlickad && forstaLada && rel() - forstaLada.t >= 2000 && l.ladaOppen) {
        kassaKlickLage = { t: rel(), ...l, korgJs: await korgJs(page, L.rot) };
        const kassa = page.locator('cart-drawer #CartDrawer-Checkout, cart-drawer button[name="checkout"]').first();
        try { await kassa.click({ timeout: 8000, noWaitAfter: true }); kassaKlickad = 'låda'; logg('kassa i lådan tryckt'); } catch (e) { logg('kassa i lådan gick inte', { fel: String(e.message).slice(0, 100) }); kassaKlickad = 'misslyckad'; }
      }
      // Hamnade kunden på korgsidan (reservvägen eller temats vanliga flöde) — läs den och tryck kassan där.
      if (!kassaKlickad && l.paCorgsida && (l.korgsidaTotal || l.korgsidaTom) && !l.laddar) {
        await sov(1500);
        kassaKlickLage = { t: rel(), ...(await lasLage(page)), korgJs: await korgJs(page, L.rot), via: 'korgsidan' };
        await page.screenshot({ path: `${BILD}/${id}-1-korgsida.png` }).catch(() => {});
        if (!kassaKlickLage.korgsidaTom) {
          const k2 = page.locator('main button[name="checkout"], #checkout').first();
          try { await k2.click({ timeout: 8000, noWaitAfter: true }); kassaKlickad = 'korgsida'; logg('kassa på korgsidan tryckt'); } catch (e) { kassaKlickad = 'misslyckad'; logg('kassa på korgsidan gick inte', { fel: String(e.message).slice(0, 100) }); }
        } else { kassaKlickad = 'tom korg'; }
      }
      if (kassaKlickad) break;
    }
    ut.forstaLada = forstaLada; ut.ladaHistorik = ladaHistorik; ut.kassaKlickad = kassaKlickad; ut.kassaKlickLage = kassaKlickLage;

    // Var hamnade kunden efter kassaknappen?
    let landning = null;
    if (kassaKlickad === 'låda' || kassaKlickad === 'korgsida') {
      for (let i = 0; i < 160; i++) {
        await sov(500);
        const u = page.url();
        if (/\/checkouts?\//.test(u)) {
          // Vänta tills kassan ritat summan.
          for (let j = 0; j < 40; j++) {
            await sov(750);
            const txt = await page.evaluate(() => document.body ? document.body.innerText : '').catch(() => '');
            if (/\d/.test(txt) && txt.length > 200) break;
          }
          break;
        }
        if (/\/cart(\?|$)/.test(new URL(u).pathname + new URL(u).search) && i > 16) break; // hamnade på korgsidan
        if (i > 90) break;
      }
      await sov(1500);
      const u = new URL(page.url());
      const text = await page.evaluate(() => document.body ? document.body.innerText.replace(/\s+/g, ' ').trim() : '').catch(() => '');
      landning = { t: rel(), sedanKassaKlick: kassaKlickLage ? rel() - kassaKlickLage.t : null, vag: (u.pathname).replace(/\/checkouts\/cn\/[^/]+/, '/checkouts/cn/<id>'), iKassan: /\/checkouts?\//.test(u.pathname), belopp: (text.match(/(?:[€$¥￥£]\s?[\d.,\s]+\d|[\d.,\s]+\d\s?(?:kr|SEK|DKK|EUR|€|円|JPY|zł|PLN))/g) || []).slice(0, 12), utdrag: text.slice(0, 700) };
      await page.screenshot({ path: `${BILD}/${id}-2-landning.png` }).catch(() => {});
    }
    ut.landning = landning;
    // Korgen till sist (samma kund, samma kakor).
    await sov(500);
    ut.korgTillSist = await korgJs(page, L.rot);
    ut.pixlarBlockerade = pixlar.length; ut.stoppat = stoppat; ut.konsol = konsol.slice(0, 15);
  } catch (e) {
    ut.fel = String(e.message).slice(0, 400);
    await page.screenshot({ path: `${BILD}/${id}-fel.png` }).catch(() => {});
    ut.korgTillSist = await korgJs(page, L.rot).catch(() => null);
  } finally {
    ut.slut = nu();
    ut.natet.sort((a, b) => a.start - b.start);
    writeFileSync(`${MAT}/${id}.json`, JSON.stringify(ut, null, 1));
    await ctx.close().catch(() => {});
  }
  return ut;
}

function sammanfatta(u) {
  const k = u.korgTillSist || {};
  const fk = u.foreKlick || {};
  const T = fk.T || {};
  const fonster = T.knappKlickbar != null && T.msPaketKopplad != null ? T.msPaketKopplad - T.knappKlickbar : (T.knappKlickbar != null && T.msPaketKopplad == null ? `>${(fk.nuMs ?? 0) - T.knappKlickbar}` : null);
  return `${u.id} ${u.start.slice(11, 19)} | kopplad vid klick=${fk.msPaketKopplad} fönster(knapp→kopplad)=${fonster} ms | låda=${u.forstaLada ? u.forstaLada.total + ' @' + u.forstaLada.sedanKlick + 'ms' : '-'} | kassa=${u.kassaKlickad} → ${u.landning ? u.landning.vag + ' ' + (u.landning.belopp || []).slice(0, 3).join(' ') : '-'} | korg: ${k.item_count} st ${k.total_price} ${k.currency} koder=${JSON.stringify((k.discount_codes || []).map((d) => d.code + ':' + d.applicable))} | 429=${u.status429} utm=${u.utmaning}${u.fel ? ' FEL ' + u.fel.slice(0, 80) : ''}`;
}

const [bana, lista] = process.argv.slice(2);
const korningar = lista.split(',').map((s) => s.split(':'));
const browser = await starta();
let nr = 0;
for (const [land, typ, profil] of korningar) {
  nr++;
  const u = await enKorning(browser, bana, nr, land, typ, profil);
  console.log(sammanfatta(u));
  if (nr < korningar.length) await sov(22000);
}
await browser.close();
