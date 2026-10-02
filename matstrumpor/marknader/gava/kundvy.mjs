// kundvy.mjs — gåvan följer lådorna, provat som kund i Chromium (gava.mjs --kundvy [--tema <gid>] [--fall A,B,…]).
//
// Varje fall är en ny kund (ny vagn): paketväljaren → lådan glider ut → plus och minus på lådraden i
// varukorgen → ta bort raden. Efter varje steg läses vagnen (/cart.js) och lådans egen text:
// ätpinnarna ska vara lika många som lådorna, gåvoraden ska vara låst, och priset ska vara facit
// (köp 1 få 1 per sort, variant B: 399 / 499 / 748,50 / 799). Inga köp: kassan öppnas aldrig.
// Metas pixel blockeras (webb.mjs), så proven syns inte i annonskontot.

import { starta, sida } from '../granskning/kontroll-2026-10-01/webb.mjs';

const SUSHI_V = 52506473365843;
const PIZZA_V = 52579705225555;
const PINNE_V = 52940241207635;
const A_KODER = ['PAKET-1', 'PAKET-3', 'PAKET-5'];
const B_KODER = ['SUSHI-1FOR399', 'SUSHI-2FOR499', 'SUSHI-4FOR799'];
const paus = (ms) => new Promise((r) => setTimeout(r, ms));

function adress(bas, temaId, extra = {}) {
  const u = new URL(bas);
  for (const [k, v] of Object.entries(extra)) u.searchParams.set(k, v);
  if (temaId) u.searchParams.set('preview_theme_id', temaId);
  return u.toString();
}

/** Sidan som kund: väntar in sidan och tar bort Shopifys cookie-ruta (den ligger över köpknappen i
    förhandsvisningen). Inget samtycke ges — rutan tas bara bort ur sidan. */
async function ga(page, url) {
  // Sidan räknas som laddad vid "load"; nätet får tio sekunder till att lugna sig (en spårningspixel
  // på pizzasidan höll nätet igång i över 90 sekunder 2026-10-02).
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
  await page.evaluate(() => { const r = document.querySelector('#shopify-pc__banner'); if (r) r.remove(); });
}

async function vagn(page) {
  return page.evaluate(async () => (await fetch('/cart.js', { headers: { Accept: 'application/json' } })).json());
}

function rakna(v) {
  const lador = v.items.filter((i) => i.variant_id !== 52940241207635).reduce((s, i) => s + i.quantity, 0);
  const par = v.items.filter((i) => i.variant_id === 52940241207635).reduce((s, i) => s + i.quantity, 0);
  return { lador, par, total: v.total_price / 100, koder: (v.discount_codes || []).map((d) => d.code.toUpperCase()), kodGaller: (v.discount_codes || []).filter((d) => d.applicable).map((d) => d.code) };
}

/** Väntar tills vagnen är i takt (par = lådor, koderna kompletta) och stilla i en sekund. */
async function vantaITakt(page, { koder, maxMs = 15000 }) {
  const t0 = Date.now();
  let forra = null; let stilla = 0; let r = null;
  while (Date.now() - t0 < maxMs) {
    await paus(500);
    r = rakna(await vagn(page));
    const nyckel = JSON.stringify(r);
    stilla = nyckel === forra ? stilla + 500 : 0;
    forra = nyckel;
    const iTakt = r.par === r.lador && koder.every((k) => r.lador === 0 || r.koder.includes(k));
    if (iTakt && stilla >= 1000) return { ...r, iTakt: true, ms: Date.now() - t0 };
  }
  return { ...r, iTakt: false, ms: Date.now() - t0 };
}

async function synligPicker(page, sel) {
  return page.evaluate((s) => {
    const p = [...document.querySelectorAll('ms-paket')].filter((e) => !e.hidden && !e.closest('[hidden]'))[0];
    return p ? p.querySelector(s) !== null : false;
  }, sel);
}

async function valjNiva(page, antal) {
  return page.evaluate((n) => {
    const p = [...document.querySelectorAll('ms-paket')].filter((e) => !e.hidden && !e.closest('[hidden]'))[0];
    const i = p && p.querySelector(`.ms-paket__input[data-antal="${n}"]`);
    if (!i) return null;
    i.checked = true;
    i.dispatchEvent(new Event('change', { bubbles: true }));
    return { antal: i.dataset.antal, kod: i.dataset.kod };
  }, antal);
}

async function kop(page) {
  const knapp = page.locator('form[action*="/cart/add"] [type="submit"]:visible, form[action*="/cart/add"] [name="add"]:visible').first();
  await knapp.scrollIntoViewIfNeeded();
  await knapp.click();
  for (let i = 0; i < 50; i++) {
    await paus(200);
    const oppen = await page.evaluate(() => !!document.querySelector('cart-drawer.active')).catch(() => false);
    if (oppen) return true;
  }
  return false;
}

async function stangLada(page) {
  await page.evaluate(() => { const d = document.querySelector('cart-drawer'); if (d && d.close) d.close(); });
  await paus(400);
}

/** Klickar + på en lådrad för varianten (i lådan, eller på korgsidan). */
async function klickaAntal(page, variant, namn, behallare = '#CartDrawer-CartItems') {
  if (namn === 'minus') return minskaEn(page, variant, behallare);
  await page.locator(`${behallare} quantity-input:has(input[data-quantity-variant-id="${variant}"]) button[name="plus"]`).first().click();
}

/** En låda färre, som en kund gör det. Shopify delar lådorna på flera rader (betalda och gratis), och
    temat tillåter inte minus på en rad med en enda låda (då är det papperskorgen som gäller). */
async function minskaEn(page, variant, behallare = '#CartDrawer-CartItems') {
  const rader = await page.evaluate(({ b, v }) => [...document.querySelectorAll(`${b} input[data-quantity-variant-id="${v}"]`)]
    .map((i) => ({ index: i.dataset.index, antal: Number(i.value) })), { b: behallare, v: variant });
  if (!rader.length) throw new Error('ingen lådrad att minska');
  const stor = rader.filter((r) => r.antal >= 2).sort((a, b) => b.antal - a.antal)[0];
  if (stor) await page.locator(`${behallare} quantity-input:has(input[data-index="${stor.index}"]) button[name="minus"]`).first().click();
  else await page.locator(`${behallare} tr:has(input[data-index="${rader[0].index}"]) cart-remove-button button, ${behallare} tr:has(input[data-index="${rader[0].index}"]) cart-remove-button a`).first().click();
}

/** Papperskorgen på varje lådrad för varianten, en i taget, tills ingen finns kvar. */
async function taBort(page, variant, behallare = '#CartDrawer-CartItems') {
  for (let i = 0; i < 6; i++) {
    const rad = page.locator(`${behallare} tr:has(input[data-quantity-variant-id="${variant}"]) cart-remove-button button, ${behallare} tr:has(input[data-quantity-variant-id="${variant}"]) cart-remove-button a`).first();
    if (!(await rad.count())) return;
    await rad.click();
    await vantaITakt(page, { koder: [] });
  }
}

/** Lådans egen bild av gåvoraden: låst? antal? och lådans totalsumma. */
async function lasLada(page, behallare = '#CartDrawer-CartItems') {
  return page.evaluate(({ b, pv }) => {
    const rot = document.querySelector(b);
    if (!rot) return null;
    const pinnar = [...rot.querySelectorAll(`input[data-quantity-variant-id="${pv}"]`)];
    const rader = pinnar.map((p) => p.closest('tr'));
    const lasta = rader.every((rad, i) => pinnar[i].disabled && [...rad.querySelectorAll('quantity-input button')].every((k) => k.disabled));
    const dolda = rader.every((rad) => { const tb = rad.querySelector('cart-remove-button'); return !tb || tb.classList.contains('hidden') || getComputedStyle(tb).display === 'none'; });
    const totalEl = document.querySelector('cart-drawer .totals__total-value') || document.querySelector('#main-cart-footer .totals__total-value');
    return {
      gavaAntal: pinnar.reduce((s, p) => s + Number(p.value), 0),
      gavaLast: pinnar.length ? lasta : null,
      taBortDold: pinnar.length ? dolda : null,
      total: totalEl ? totalEl.textContent.replace(/\s+/g, ' ').trim() : null,
    };
  }, { b: behallare, pv: PINNE_V });
}

function bedom(namn, r, vantat, lada, logg) {
  const ok = r.iTakt && Math.abs(r.total - vantat.total) < 0.005 && r.lador === vantat.lador
    && (!lada || r.lador === 0 || (lada.gavaAntal === r.par && lada.gavaLast === true && lada.taBortDold === true));
  logg(`${ok ? '✅' : '❌'} ${namn}: ${r.lador} lådor + ${r.par} par, ${r.total} (väntat ${vantat.lador} lådor, ${vantat.total})${r.iTakt ? '' : ' — INTE I TAKT'}, koden som gäller: ${r.kodGaller.join(', ') || 'ingen'}${lada ? `, lådan visar ${lada.gavaAntal} par, gåvoraden ${lada.gavaLast ? 'låst' : 'INTE låst'}, ta bort ${lada.taBortDold ? 'dold' : 'SYNS'}, summa "${lada.total}"` : ''} (${r.ms} ms)`);
  return ok;
}

const FALL = {
  // Variant A i Sverige: paketet, plus till fyra, minus ner till en, ta bort.
  A: async ({ page, temaId, logg, steg }) => {
    await ga(page, adress('https://matstrumpor.se/products/sushi-strumpor', temaId, { country: 'SE', ms_ab: 'paket:a' }));
    const tema = await page.evaluate(() => window.Shopify && Shopify.theme && Shopify.theme.id);
    if (temaId && String(tema) !== String(temaId)) throw new Error(`förhandsvisningen gav tema ${tema}`);
    if (!(await page.evaluate(() => !!(window.MS && window.MS.gava)))) throw new Error('MS.gava saknas på sidan — temat bär inte korgsynken');
    await valjNiva(page, '2');
    if (!(await kop(page))) throw new Error('lådan öppnades inte');
    const k = { koder: ['SUSHI-K1F1', ...A_KODER] };
    steg('köp 1 få 1', await vantaITakt(page, k), { lador: 2, total: 399 }, await lasLada(page));
    for (const [n, total] of [[3, 798], [4, 798]]) {
      await klickaAntal(page, SUSHI_V, 'plus');
      steg(`plus → ${n}`, await vantaITakt(page, k), { lador: n, total }, await lasLada(page));
    }
    await page.screenshot({ path: `${process.env.GAVA_SKARMDUMP || '/tmp'}/gava-A-4.png` });
    for (const [n, total] of [[3, 798], [2, 399], [1, 399]]) {
      await klickaAntal(page, SUSHI_V, 'minus');
      steg(`minus → ${n}`, await vantaITakt(page, k), { lador: n, total }, await lasLada(page));
    }
    await page.screenshot({ path: `${process.env.GAVA_SKARMDUMP || '/tmp'}/gava-A-1.png` });
    await taBort(page, SUSHI_V);
    steg('ta bort lådan', await vantaITakt(page, { koder: [] }), { lador: 0, total: 0 }, null);
  },
  // Samma paket två gånger (förut 1 646 kr för 4 + 4).
  A2: async ({ page, temaId, steg }) => {
    await ga(page, adress('https://matstrumpor.se/products/sushi-strumpor', temaId, { country: 'SE', ms_ab: 'paket:a' }));
    await valjNiva(page, '2');
    await kop(page); await vantaITakt(page, { koder: [] }); await stangLada(page);
    await valjNiva(page, '2');
    await kop(page);
    steg('samma paket två gånger', await vantaITakt(page, { koder: ['SUSHI-K1F1', ...A_KODER] }), { lador: 4, total: 798 }, await lasLada(page));
  },
  // Variant B i Sverige: en låda, sedan plus till fyra.
  B: async ({ page, temaId, steg }) => {
    await ga(page, adress('https://matstrumpor.se/products/sushi-strumpor', temaId, { country: 'SE', ms_ab: 'paket:b' }));
    if (!(await synligPicker(page, '.ms-paket__input[data-antal="1"]'))) throw new Error('variant B:s enlådsnivå syns inte');
    await valjNiva(page, '1');
    if (!(await kop(page))) throw new Error('lådan öppnades inte');
    const k = { koder: B_KODER };
    steg('en låda', await vantaITakt(page, k), { lador: 1, total: 399 }, await lasLada(page));
    for (const [n, total] of [[2, 499], [3, 748.5], [4, 799]]) {
      await klickaAntal(page, SUSHI_V, 'plus');
      steg(`plus → ${n}`, await vantaITakt(page, k), { lador: n, total }, await lasLada(page));
    }
    await klickaAntal(page, SUSHI_V, 'minus');
    steg('minus → 3', await vantaITakt(page, k), { lador: 3, total: 748.5 }, await lasLada(page));
  },
  // Tyskland (.com/de, euro): paketet och en låda till.
  DE: async ({ page, temaId, steg }) => {
    await ga(page, adress('https://matstrumpor.com/de/products/sushi-strumpor', temaId, { country: 'DE' }));
    await valjNiva(page, '2');
    if (!(await kop(page))) throw new Error('lådan öppnades inte');
    const k = { koder: ['SUSHI-K1F1', ...A_KODER] };
    steg('DE köp 1 få 1', await vantaITakt(page, k), { lador: 2, total: 44.9 }, await lasLada(page));
    await klickaAntal(page, SUSHI_V, 'plus');
    steg('DE plus → 3', await vantaITakt(page, k), { lador: 3, total: 89.8 }, await lasLada(page));
  },
  // Korgsidan (/cart): plus där, sidan ritas om med rätt summa.
  KORG: async ({ page, temaId, steg }) => {
    await ga(page, adress('https://matstrumpor.se/products/sushi-strumpor', temaId, { country: 'SE', ms_ab: 'paket:a' }));
    await valjNiva(page, '2');
    await kop(page); await vantaITakt(page, { koder: ['SUSHI-K1F1', ...A_KODER] });
    await ga(page, adress('https://matstrumpor.se/cart', temaId, { country: 'SE' }));
    await klickaAntal(page, SUSHI_V, 'plus', '#main-cart-items');
    const r = await vantaITakt(page, { koder: ['SUSHI-K1F1', ...A_KODER] });
    await paus(1500);
    steg('korgsidan plus → 3', r, { lador: 3, total: 798 }, await lasLada(page, '#main-cart-items'));
    await page.screenshot({ path: `${process.env.GAVA_SKARMDUMP || '/tmp'}/gava-korg-3.png`, fullPage: true });
  },
  // Två sorter: sushi-paketet och pizza-paketet (förut 1 746 kr, #5214).
  MIX: async ({ page, temaId, steg }) => {
    await ga(page, adress('https://matstrumpor.se/products/sushi-strumpor', temaId, { country: 'SE', ms_ab: 'paket:a' }));
    await valjNiva(page, '2');
    await kop(page); await vantaITakt(page, { koder: [] }); await stangLada(page);
    await ga(page, adress('https://matstrumpor.se/products/pizza-strumpor', temaId, { country: 'SE' }));
    await valjNiva(page, '2');
    await kop(page);
    steg('sushi-paket + pizza-paket', await vantaITakt(page, { koder: A_KODER }), { lador: 4, total: 898 }, await lasLada(page));
    void PIZZA_V;
  },
};

export async function kundvy({ temaGid = null, fall = null, logg = console.log } = {}) {
  const temaId = temaGid ? String(temaGid).split('/').pop() : null;
  const b = await starta();
  let alla = true;
  try {
    for (const namn of fall || Object.keys(FALL)) {
      const { ctx, page } = await sida(b, { locale: 'sv-SE', mobil: true });
      const sidfel = [];
      page.on('pageerror', (e) => sidfel.push(String(e).slice(0, 160)));
      logg(`\n— ${namn}${temaId ? ` (tema ${temaId})` : ' (MAIN)'}`);
      const steg = (rubrik, r, vantat, lada) => { if (!bedom(rubrik, r, vantat, lada, logg)) alla = false; };
      try {
        await FALL[namn]({ page, temaId, logg, steg });
      } catch (e) { alla = false; logg(`❌ ${namn}: ${e.message}`); }
      if (sidfel.length) { logg(`   sidfel: ${[...new Set(sidfel)].join(' | ')}`); }
      await ctx.close();
      await paus(2000);
    }
  } finally {
    await b.close();
  }
  logg(alla ? '\n✅ Kundvyn: ätpinnarna följde lådorna och priset var facit i varje steg.' : '\n❌ Kundvyn: se raderna ovan.');
  return { ok: alla };
}
