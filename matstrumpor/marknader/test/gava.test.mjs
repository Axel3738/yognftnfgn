// Tester för gava.mjs och assets/ms-gava.js — gåvan följer varje låda (Matstrumpor, 2026-10-02).
// Inget nät: modellen av Shopifys köp-X-få-Y jämförs med de priser Shopify själv räknade fram i proven
// (Storefront-API:ts cart med dolda testkoder), och korgsynken körs i en vm med en låtsas-sida.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import {
  uddaKod, UDDA, bxgyRabatt, bastaPris, patcha, avpatcha, PATCHADE_FILER, nyaFiler, giltigJs, eAvvikelse, MAX_KODER,
} from '../gava.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const GAVA = join(HAR, '..', 'gava');

// --- Hjälpkoderna och modellen ---------------------------------------------------------------

test('udda-koderna: köp k+1, få 3k+1 för N = 2k+1', () => {
  assert.deepEqual(uddaKod(1), { kod: 'PAKET-1', kop: 1, fa: 1, n: 1 });
  assert.deepEqual(uddaKod(3), { kod: 'PAKET-3', kop: 2, fa: 4, n: 3 });
  assert.deepEqual(uddaKod(5), { kod: 'PAKET-5', kop: 3, fa: 7, n: 5 });
  assert.deepEqual(UDDA.map((u) => u.kod), ['PAKET-1', 'PAKET-3', 'PAKET-5']);
  assert.throws(() => uddaKod(4));
});

const L = 39900; const P = 5000; // sushilådan och ett par ätpinnar, i öre
const kr = (ore) => ore / 100;
function pris(lador, par, kod) {
  const priser = [...Array(lador).fill(L), ...Array(par).fill(P)];
  return kr(priser.reduce((s, p) => s + p, 0) - bxgyRabatt(priser, kod, (i) => i < lador));
}
const E = { kop: 1, fa: 3, grans: null };

test('modellen ger samma priser som Shopify räknade med "köp 1, få 3, utan gräns" (prov 3)', () => {
  assert.equal(pris(2, 2, E), 399);
  assert.equal(pris(3, 3, E), 1197); // ingen halv andra användning
  assert.equal(pris(4, 4, E), 798);
  assert.equal(pris(1, 1, E), 449); // gäller inte alls
  assert.equal(pris(5, 5, E), 1596);
  assert.equal(pris(6, 6, E), 1197);
  assert.equal(pris(4, 0, E), 399); // ätpinnarna borttagna: tre lådor gratis — därför låser temat gåvoraden
  assert.equal(pris(4, 1, E), 798);
  assert.equal(pris(2, 3, E), 798); // ett par för mycket äter den gratis lådan — därför synkar temat
});

test('modellen: blandade sorter (prov 3, A7 och #5302)', () => {
  // 2 sushi + 2 pizza + 4 par: de dyraste är "köp", de billigaste gratis → pizzorna betalas.
  const a = [39900, 39900, 44900, 44900, P, P, P, P];
  assert.equal(kr(a.reduce((s, x) => s + x, 0) - bxgyRabatt(a, E, (i) => i < 4)), 898);
  const b = [44900, 44900, 29900, 29900, 29900, 29900, P, P, P, P, P, P];
  assert.equal(kr(b.reduce((s, x) => s + x, 0) - bxgyRabatt(b, E, (i) => i < 6)), 1197); // betalade 2 094 kr med dagens kod
});

test('modellen: dagens SUSHI-K1F1 (en gång per order) med två paket kostar 1 646 kr (prov 3, K2)', () => {
  assert.equal(pris(4, 4, { kop: 1, fa: 3, grans: 1 }), 1646);
});

test('bästa koden av E + PAKET-1/3/5: köp 1 få 1 för 1–6 lådor och varje jämnt antal (prov 4)', () => {
  for (const n of [1, 2, 3, 4, 5, 6, 8, 10]) {
    assert.equal(kr(bastaPris({ lador: n, par: n, ladaPris: L, parPris: P })), 399 * Math.ceil(n / 2), `${n} lådor`);
  }
  // Sju och nio lådor: en låda för mycket (mätt för nio). PAKET-7 skulle ta vännens plats bland de fem
  // koder Shopify räknar, och ingen order de senaste 60 dygnen hade fler än sex lådor.
  assert.equal(kr(bastaPris({ lador: 7, par: 7, ladaPris: L, parPris: P })), 1995);
  assert.equal(kr(bastaPris({ lador: 9, par: 9, ladaPris: L, parPris: P })), 2394);
  // Med PAKET-7 (som i prov 4) hade sju blivit rätt.
  const med7 = [{ kop: 1, fa: 3, grans: null }, ...[1, 3, 5, 7].map((n) => ({ ...uddaKod(n), grans: 1 }))];
  assert.equal(kr(bastaPris({ lador: 7, par: 7, ladaPris: L, parPris: P, koder: med7 })), 1596);
});

// --- Korgsynken (assets/ms-gava.js) i en vm -----------------------------------------------------

const SUSHI = 10286130889043, DONUT = 10286979449171, PIZZA = 10314752852307, HAMB = 10314753769811;
const PINNE = 52940241207635, PINNE_PRODUKT = 10408204468563;
const VS = 52506473365843, VD = 52510025253203, VP = 52579705225555;
const NIVAER = [
  { produkt: SUSHI, gava: PINNE, kod: 'SUSHI-K1F1', antal: 2, bogo: 1, ab: 'a' },
  { produkt: SUSHI, gava: PINNE, kod: 'SUSHI-K2F2', antal: 4, bogo: 2, ab: 'a' },
  { produkt: SUSHI, gava: PINNE, kod: 'STRUMPOR-K1F1', antal: 2, bogo: 1, ab: 'b' },
  { produkt: SUSHI, gava: PINNE, kod: 'STRUMPOR-K2F2', antal: 4, bogo: 2, ab: 'b' },
  { produkt: SUSHI, gava: PINNE, kod: 'SUSHI-1FOR399', antal: 1, bogo: 0, ab: 'paket-b' },
  { produkt: SUSHI, gava: PINNE, kod: 'SUSHI-2FOR499', antal: 2, bogo: 0, ab: 'paket-b' },
  { produkt: SUSHI, gava: PINNE, kod: 'SUSHI-4FOR799', antal: 4, bogo: 0, ab: 'paket-b' },
  { produkt: DONUT, gava: PINNE, kod: 'DONUT-K1F1', antal: 2, bogo: 1, ab: '' },
  { produkt: DONUT, gava: PINNE, kod: 'DONUT-K2F2', antal: 4, bogo: 2, ab: '' },
  { produkt: PIZZA, gava: PINNE, kod: 'PIZZA-K1F1', antal: 2, bogo: 1, ab: '' },
  { produkt: PIZZA, gava: PINNE, kod: 'PIZZA-K2F2', antal: 4, bogo: 2, ab: '' },
  { produkt: HAMB, gava: PINNE, kod: 'HAMBURGARE-K1F1', antal: 2, bogo: 1, ab: '' },
  { produkt: HAMB, gava: PINNE, kod: 'HAMBURGARE-K2F2', antal: 4, bogo: 2, ab: '' },
];

function laddaGava() {
  const config = { udda: UDDA.map((u) => u.kod), nivaer: NIVAER };
  const document = {
    readyState: 'complete',
    getElementById: (id) => (id === 'ms-gava-config' ? { textContent: JSON.stringify(config) } : null),
    querySelector: () => null,
    addEventListener: () => {},
  };
  const window = { Shopify: { routes: { root: '/' } } };
  const ctx = vm.createContext({ window, document, setTimeout: () => 0, clearTimeout: () => {}, fetch: async () => { throw new Error('inget nät'); }, Promise, JSON, Object, String, Number });
  vm.runInContext(readFileSync(join(GAVA, 'ms-gava.js'), 'utf8'), ctx);
  return window.MS.gava;
}
const gava = laddaGava();
const vagn = (koder, rader) => ({
  discount_codes: koder.map((code) => ({ code, applicable: true })),
  items: rader.map(([variant_id, product_id, quantity], i) => ({ variant_id, product_id, quantity, key: `${variant_id}:rad${i}` })),
});
const ALLA_A = ['SUSHI-K1F1', 'PAKET-1', 'PAKET-3', 'PAKET-5'];

test('synk: paketväljarens kod får hjälpkoderna, ätpinnarna stämmer redan', () => {
  const p = gava.plan(vagn(['SUSHI-K1F1'], [[VS, SUSHI, 2], [PINNE, PINNE_PRODUKT, 2]]), 'SUSHI-K1F1');
  assert.deepEqual({ ...p.updates }, {});
  assert.equal(p.discount, 'SUSHI-K1F1,PAKET-1,PAKET-3,PAKET-5');
  assert.equal(p.andras, true);
});

test('synk: fler, färre eller inga lådor — ätpinnarna följer, koderna rörs inte', () => {
  const tre = gava.plan(vagn(ALLA_A, [[VS, SUSHI, 3], [PINNE, PINNE_PRODUKT, 2]]));
  assert.deepEqual({ ...tre.updates }, { [PINNE]: 3 });
  assert.equal(tre.discount, null);
  assert.deepEqual({ ...gava.plan(vagn(ALLA_A, [[VS, SUSHI, 1], [PINNE, PINNE_PRODUKT, 2]])).updates }, { [PINNE]: 1 });
  assert.deepEqual({ ...gava.plan(vagn(ALLA_A, [[PINNE, PINNE_PRODUKT, 2]])).updates }, { [PINNE]: 0 });
  const lika = gava.plan(vagn(ALLA_A, [[VS, SUSHI, 4], [PINNE, PINNE_PRODUKT, 4]]));
  assert.equal(lika.andras, false);
});

test('synk: blandade sorter räknas ihop, och EN paketkod räcker (alla är likadana)', () => {
  const p = gava.plan(vagn([...ALLA_A, 'DONUT-K1F1'], [[VS, SUSHI, 2], [VD, DONUT, 2], [VP, PIZZA, 1], [PINNE, PINNE_PRODUKT, 4]]), 'DONUT-K1F1');
  assert.deepEqual({ ...p.updates }, { [PINNE]: 5 });
  assert.equal(p.discount, 'DONUT-K1F1,PAKET-1,PAKET-3,PAKET-5');
});

test('synk: vännens kod först, aldrig fler än fem koder', () => {
  assert.equal(gava.plan(vagn(['VAN-ABC123', 'SUSHI-K1F1'], [[VS, SUSHI, 2], [PINNE, PINNE_PRODUKT, 2]])).discount,
    'VAN-ABC123,SUSHI-K1F1,PAKET-1,PAKET-3,PAKET-5');
  assert.equal(gava.plan(vagn([...ALLA_A, 'VAN-ABC123'], [[VS, SUSHI, 2], [PINNE, PINNE_PRODUKT, 2]])).discount,
    'VAN-ABC123,SUSHI-K1F1,PAKET-1,PAKET-3,PAKET-5');
  const manga = gava.plan(vagn(['X1', 'X2', 'X3', 'SUSHI-K1F1'], [[VS, SUSHI, 2], [PINNE, PINNE_PRODUKT, 2]]));
  assert.equal(manga.discount, 'X1,X2,X3,SUSHI-K1F1,PAKET-1');
  assert.equal(manga.discount.split(',').length, MAX_KODER);
});

test('synk: variant B — alla tre nivåernas koder, ätpinnarna följer sushilådorna', () => {
  const p = gava.plan(vagn(['SUSHI-2FOR499'], [[VS, SUSHI, 1], [PINNE, PINNE_PRODUKT, 2]]), 'SUSHI-2FOR499');
  assert.deepEqual({ ...p.updates }, { [PINNE]: 1 });
  assert.equal(p.discount, 'SUSHI-1FOR399,SUSHI-2FOR499,SUSHI-4FOR799');
  const fyra = gava.plan(vagn(['SUSHI-1FOR399', 'SUSHI-2FOR499', 'SUSHI-4FOR799'], [[VS, SUSHI, 4], [PINNE, PINNE_PRODUKT, 2]]));
  assert.deepEqual({ ...fyra.updates }, { [PINNE]: 4 });
  assert.equal(fyra.discount, null);
});

test('synk: köp-X-få-Y och variant B i samma vagn — köp-X-få-Y gäller alla sorter, B-koden som just lades får ligga kvar', () => {
  const p = gava.plan(vagn(['DONUT-K1F1', 'PAKET-1', 'PAKET-3', 'PAKET-5', 'SUSHI-2FOR499'], [[VS, SUSHI, 2], [VD, DONUT, 2], [PINNE, PINNE_PRODUKT, 4]]), 'SUSHI-2FOR499');
  assert.equal(p.discount, 'SUSHI-2FOR499,DONUT-K1F1,PAKET-1,PAKET-3,PAKET-5');
  const utan = gava.plan(vagn(['DONUT-K1F1', 'PAKET-1', 'PAKET-3', 'PAKET-5', 'SUSHI-2FOR499'], [[VS, SUSHI, 2], [VD, DONUT, 2], [PINNE, PINNE_PRODUKT, 4]]));
  assert.equal(utan.discount, 'DONUT-K1F1,PAKET-1,PAKET-3,PAKET-5');
});

test('synk: utan paketkod rörs ingenting — utom ätpinnar som blivit kvar utan en enda låda', () => {
  assert.equal(gava.plan(vagn([], [[VS, SUSHI, 2], [PINNE, PINNE_PRODUKT, 1]])).andras, false);
  assert.equal(gava.plan(vagn(['VAN-ABC123'], [[VS, SUSHI, 1]])).andras, false);
  const ensam = gava.plan(vagn([], [[PINNE, PINNE_PRODUKT, 2]]));
  assert.deepEqual({ ...ensam.updates }, { [PINNE]: 0 });
  assert.equal(ensam.discount, null);
});

test('synk: gåvan på två rader (en gratis, en betald) — första raden får målet, de andra noll', () => {
  const p = gava.plan(vagn(ALLA_A, [[VS, SUSHI, 1], [PINNE, PINNE_PRODUKT, 1], [PINNE, PINNE_PRODUKT, 1]]));
  assert.deepEqual({ ...p.updates }, { [`${PINNE}:rad1`]: 1, [`${PINNE}:rad2`]: 0 });
  const upp = gava.plan(vagn(ALLA_A, [[VS, SUSHI, 3], [PINNE, PINNE_PRODUKT, 1], [PINNE, PINNE_PRODUKT, 1]]));
  assert.deepEqual({ ...upp.updates }, { [`${PINNE}:rad1`]: 3, [`${PINNE}:rad2`]: 0 });
  assert.equal(gava.plan(vagn(ALLA_A, [[VS, SUSHI, 2], [PINNE, PINNE_PRODUKT, 1], [PINNE, PINNE_PRODUKT, 1]])).andras, false);
});

test('synk: små bokstäver och bara hjälpkoder kvar', () => {
  assert.equal(gava.plan(vagn(['sushi-k1f1', 'paket-1', 'paket-3', 'paket-5'], [[VS, SUSHI, 2], [PINNE, PINNE_PRODUKT, 2]])).andras, false);
  const bara = gava.plan(vagn(['PAKET-1', 'PAKET-3'], [[VD, DONUT, 3], [PINNE, PINNE_PRODUKT, 3]]));
  assert.equal(bara.discount, 'DONUT-K1F1,PAKET-1,PAKET-3,PAKET-5');
});

// --- Temafilerna ---------------------------------------------------------------------------------

test('patcharna: träffar exakt, går att köra två gånger och backar till butikens original', () => {
  for (const fil of PATCHADE_FILER) {
    const original = readFileSync(join(GAVA, 'original', fil), 'utf8');
    const en = patcha(fil, original);
    assert.ok(en.byten.length > 0, fil);
    assert.ok(en.kod.includes('ms-gava'), fil);
    const tva = patcha(fil, en.kod);
    assert.deepEqual(tva.byten, [], `${fil} patchas inte två gånger`);
    assert.equal(avpatcha(fil, en.kod).kod, original, `${fil} backar exakt`);
    if (fil.endsWith('.js')) assert.ok(giltigJs(en.kod), `${fil} är giltig JavaScript`);
  }
});

test('patcharna: gåvoraden låst i lådan och på korgsidan, paketväljaren synkar före lådan', () => {
  const lada = patcha('snippets/cart-drawer.liquid', readFileSync(join(GAVA, 'original', 'snippets/cart-drawer.liquid'), 'utf8')).kod;
  assert.equal(lada.split('{% if ms_gava_rad or item.instructions and item.instructions.can_update_quantity == false %}').length - 1, 3);
  assert.ok(lada.includes('{% if ms_gava_rad %}class="hidden"{% endif %}'));
  const sida = patcha('sections/main-cart-items.liquid', readFileSync(join(GAVA, 'original', 'sections/main-cart-items.liquid'), 'utf8')).kod;
  assert.ok(sida.includes('{% if ms_gava_rad %}{% assign can_update_quantity = false %}{% endif %}'));
  assert.ok(sida.includes('{% if ms_gava_rad %}{% assign can_remove = false %}{% endif %}'));
  const js = patcha('assets/ms-paket.js', readFileSync(join(GAVA, 'original', 'assets/ms-paket.js'), 'utf8')).kod;
  const iKoden = js.indexOf('return self.fastKod(rutt, kod);');
  const iSynk = js.indexOf('gava.synka({ tyst: true, behall: kod })');
  const iLada = js.indexOf('return self.hamtaLada(rutt, lada);');
  assert.ok(iKoden < iSynk && iSynk < iLada, 'ordningen: koden → synken → lådan');
});

test('de nya filerna: giltig JavaScript, hjälpkoderna inskrivna i snippeten', () => {
  const nya = nyaFiler();
  assert.ok(giltigJs(nya['assets/ms-gava.js']));
  assert.ok(nya['snippets/ms-gava.liquid'].includes('"udda": ["PAKET-1","PAKET-3","PAKET-5"]'));
  assert.ok(!nya['snippets/ms-gava.liquid'].includes('__UDDA__'));
});

test('eAvvikelse: dagens SUSHI-K1F1 avviker, målet gör det inte', () => {
  const kod = (kop, fa, grans, kopP, faP) => ({
    usesPerOrderLimit: grans,
    customerBuys: { value: { quantity: String(kop) }, items: { products: { nodes: kopP.map((id) => ({ id })) } } },
    customerGets: { value: { quantity: { quantity: String(fa) }, effect: { percentage: 1 } }, items: { products: { nodes: faP.map((id) => ({ id })) } } },
  });
  const sorter = ['s', 'd', 'p', 'h'];
  assert.ok(eAvvikelse(kod(1, 3, 1, ['s'], ['s', 'g']), { sorter, gava: 'g' }).fel.length > 0);
  assert.deepEqual(eAvvikelse(kod(1, 3, null, sorter, [...sorter, 'g']), { sorter, gava: 'g' }).fel, []);
});
