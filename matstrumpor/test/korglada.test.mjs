// Varukorgslådan vid första köpet — patcharna på ms-paket.js och ms-ab.js, utan nät.
// Originalen är butikens riktiga filer, lästa ur MAIN 2026-10-01 (matstrumpor/korglada/original/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { patchaPaket, patchaAb, giltigJs, bytExakt, ORIGINAL, PAKET_MARKE, AB_MARKE, PATCHAR, PAKET_FIL, AB_FIL } from '../korglada.mjs';
import { patchaPaketJs } from '../marknader/temapatch.mjs';

const paketOrig = readFileSync(join(ORIGINAL, 'ms-paket.js'), 'utf8');
const abOrig = readFileSync(join(ORIGINAL, 'ms-ab.js'), 'utf8');

test('originalen är det som satt i butiken: koden först, varorna sedan, och ms-ab med beacon på varje submit', () => {
  assert.ok(paketOrig.includes("var koden = kod\n"), 'ms-paket.js: /discount före add.js');
  assert.ok(!paketOrig.includes(PAKET_MARKE));
  assert.ok(abOrig.includes('function beaconStamp()'));
  assert.ok(!abOrig.includes(AB_MARKE));
  assert.ok(giltigJs(paketOrig) && giltigJs(abOrig));
});

test('ms-paket.js: varorna först, sedan koden, sedan lådan ur sektions-API:t — giltig JS', () => {
  const r = patchaPaket(paketOrig);
  assert.equal(r.byten.length, 2);
  assert.deepEqual(r.hoppade, []);
  assert.ok(giltigJs(r.kod), 'resultatet parsas som JavaScript');
  const kop = r.kod.slice(r.kod.indexOf('    kop(ev) {'), r.kod.indexOf('    fastKod(rutt, kod, forsok) {'));
  const add = kop.indexOf("'cart/add.js'");
  const kodSteg = kop.indexOf('self.fastKod(rutt, kod)');
  const lada = kop.indexOf('self.hamtaLada(rutt, lada)');
  assert.ok(add > 0 && kodSteg > add && lada > kodSteg, 'ordningen i kop(): add.js → fastKod → hamtaLada');
  assert.ok(!kop.includes("discount/' + encodeURIComponent(kod) + '?redirect=' + encodeURIComponent(rutt + 'cart.js')"), 'ingen /discount-fetch kvar inne i kop() — den ligger i fastKod');
  assert.ok(kop.includes('window.MS.ab.stamp()'), 'A/B-stämpeln inväntas');
  assert.ok(kop.includes('ev.stopImmediatePropagation()') && kop.includes('ev.msPaketHanterad'), 'samma submit en gång');
  assert.ok(r.kod.includes("'?sections=' + idn"), 'lådan hämtas ur sektions-API:t');
  assert.ok(r.kod.includes('self.kontrollera(rutt, kod, laddaOm)'), 'sista nätet står kvar');
  // Reservvägen bär fortfarande språkmappen (granskningen 2026-09-30).
  assert.ok(!r.kod.includes("encodeURIComponent('/cart')"));
  assert.ok(r.kod.includes("encodeURIComponent(rutt + 'cart')"));
});

test('ms-paket.js: temapatch (bygg.mjs --steg tema) hittar sina ankare i den patchade filen och rör den inte', () => {
  const r = patchaPaket(paketOrig);
  for (const ankare of ["msPaketText('lagger_i', 'Lägger i…')", "msPaketText('fel_lagga_i', 'Kunde inte lägga i varukorgen.')", "msPaketText('fel_forsok_igen', 'Det gick inte att lägga i varukorgen. Försök igen.')", '  var MS_PAKET_TEXT = ']) {
    assert.ok(r.kod.includes(ankare), `ankaret finns kvar: ${ankare.slice(0, 40)}`);
  }
  const t = patchaPaketJs(r.kod, {});
  assert.deepEqual(t.byten, [], 'temapatch har inget att byta');
  assert.equal(t.kod, r.kod);
});

test('ms-paket.js: idempotent — andra körningen byter ingenting', () => {
  const en = patchaPaket(paketOrig);
  const tva = patchaPaket(en.kod);
  assert.deepEqual(tva.byten, []);
  assert.deepEqual(tva.hoppade, ['ms-paket.js: redan patchad']);
  assert.equal(tva.kod, en.kod);
});

test('ms-paket.js: fastKod gör exakt ett försök till, hamtaLada svarar null utan låda', () => {
  const r = patchaPaket(paketOrig);
  const fast = r.kod.slice(r.kod.indexOf('    fastKod(rutt, kod, forsok) {'), r.kod.indexOf('    hamtaLada(rutt, lada) {'));
  assert.ok(fast.includes('(forsok || 0) >= 1'), 'högst ett omförsök');
  assert.ok(fast.includes("if (!kod) return Promise.resolve(null);"));
  const lada = r.kod.slice(r.kod.indexOf('    hamtaLada(rutt, lada) {'), r.kod.indexOf('    /* Sista kontrollen'));
  assert.ok(lada.includes('if (!lada || !lada.renderContents || !lada.getSectionsToRender) return Promise.resolve(null);'));
});

test('ms-ab.js: stampCart lämnar det pågående löftet, ingen beacon efter stämpel, MS.ab.stamp finns — giltig JS', () => {
  const r = patchaAb(abOrig);
  assert.equal(r.byten.length, 3);
  assert.deepEqual(r.hoppade, []);
  assert.ok(giltigJs(r.kod));
  assert.ok(r.kod.includes('if (stamped) return stampLofte || Promise.resolve();'));
  assert.ok(r.kod.includes('stampLofte = fetch('));
  assert.ok(r.kod.includes('if (stamped || !Object.keys(assigned).length || !navigator.sendBeacon) return;'));
  assert.ok(r.kod.includes('stamp: stampCart'));
  // Fetch-kroken före /cart/add står kvar och väntar nu på den riktiga skrivningen.
  assert.ok(r.kod.includes("if (url.indexOf('/cart/add') !== -1) {") && r.kod.includes('return stampCart()'));
});

test('ms-ab.js: idempotent', () => {
  const en = patchaAb(abOrig);
  const tva = patchaAb(en.kod);
  assert.deepEqual(tva.byten, []);
  assert.deepEqual(tva.hoppade, ['ms-ab.js: redan patchad']);
  assert.equal(tva.kod, en.kod);
});

test('en fil utan ankaret stoppar — aldrig "nästan rätt"', () => {
  assert.throws(() => patchaPaket(paketOrig.replace('ev.stopPropagation();', 'ev.stopPropagation(); // ändrad')), /hittades 0 gånger/);
  assert.throws(() => patchaAb(abOrig.replace('  var stamped = false;\n', '')), /hittades 0 gånger/);
  assert.throws(() => bytExakt('a a', 'a', 'b', 1), /hittades 2 gånger/);
});

test('PATCHAR täcker exakt de två filerna', () => {
  assert.deepEqual(Object.keys(PATCHAR).sort(), [AB_FIL, PAKET_FIL].sort());
});

test('ms-ab.js: beteendet i en falsk webbläsare — add.js väntar på stämpeln, ingen beacon, stamp() ger samma löfte', async () => {
  const r = patchaAb(abOrig);
  const anrop = [];
  let slappStampel;
  const lyssnare = {};
  const win = {
    Shopify: { routes: { root: '/' } },
    fetch(url, init) {
      anrop.push({ url: String(url), method: init?.method || 'GET', body: init?.body || null });
      if (String(url).includes('/cart/update.js')) return new Promise((res) => { slappStampel = () => res({ json: async () => ({}) }); });
      if (String(url).includes('/cart.js')) return Promise.resolve({ json: async () => ({ item_count: 1, attributes: { 'AB paket': 'b' } }) });
      return Promise.resolve({ json: async () => ({}) });
    },
    dataLayer: [],
  };
  const doc = {
    cookie: 'ms_ab_paket=b',
    readyState: 'complete',
    documentElement: { setAttribute() {} },
    getElementById: (id) => (id === 'ms-ab-config' ? { textContent: JSON.stringify({ cookieDays: 30, tests: [{ id: 'paket', variants: ['a', 'b'], weights: [1, 1], active: true }] }) } : null),
    querySelectorAll: () => [],
    addEventListener: (typ, fn) => { (lyssnare[typ] ||= []).push(fn); },
  };
  const navigatorFake = { sendBeacon: () => { anrop.push({ url: 'BEACON' }); return true; } };
  const fn = new Function('window', 'document', 'navigator', 'fetch', 'URLSearchParams', 'Blob', r.kod.replace(/window\.location\.search/g, "''"));
  fn(win, doc, navigatorFake, win.fetch, URLSearchParams, class { constructor() {} });
  // Klicket stämplar, submit-beaconen hoppar över, och add.js väntar på stämpelns svar.
  const knapp = { closest: () => knapp };
  for (const f of lyssnare.click) f({ target: knapp });
  for (const f of lyssnare.submit) f({ target: { action: '/cart/add', } });
  assert.equal(anrop.filter((a) => a.url === 'BEACON').length, 0, 'ingen beacon när klicket redan stämplat');
  assert.equal(anrop.filter((a) => a.url.includes('/cart/update.js')).length, 1, 'en stämpel');
  const addLofte = win.fetch('/cart/add.js', { method: 'POST', body: '{}' });
  await new Promise((r2) => setTimeout(r2, 20));
  assert.equal(anrop.filter((a) => a.url.includes('/cart/add.js')).length, 0, 'add.js går inte iväg före stämpelns svar');
  const stamp2 = win.MS.ab.stamp();
  assert.ok(stamp2 && typeof stamp2.then === 'function');
  slappStampel();
  await addLofte;
  await stamp2;
  assert.equal(anrop.filter((a) => a.url.includes('/cart/add.js')).length, 1, 'add.js gick iväg när stämpeln var skriven');
  assert.equal(anrop.filter((a) => a.url.includes('/cart/update.js')).length, 1, 'fortfarande bara en stämpel');
});
