// Mejlmallarna: Liquid-utdata som Shopify kan tolka, förhandsvisning utan
// Liquid, produktvalet och erbjudandets villkor. Inget nätverk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { byggAlla, byggMall, valjProdukter, kortnamn, ersatt, MALLAR, kr } from '../mallar.mjs';
import { byggSida } from '../sida.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(ROT, 'copy.json'), 'utf8'));

const p = (handle, pris, extra = {}) => ({
  id: handle, variant_id: '1', titel: `${handle} – Undertitel`, handle, url: `https://x.se/products/${handle}`,
  pris, jamforpris: null, lager: 10, lagerpolicy: 'CONTINUE', bild: `https://cdn/${handle}.jpg`, ...extra,
});
const ALLA = [
  ...konfig.erbjudande.gratisprodukter.map((h) => p(h, 169)),
  p('dyr-a', 3349), p('dyr-b', 2379), p('dyr-c', 2299, { lager: 0 }), p('dyr-d', 1869), p('billig', 49), p('utan-bild', 9999, { bild: null }),
];
const produkter = valjProdukter(ALLA, konfig);
const indata = { konfig, copy, produkter };

const rakna = (s, re) => (s.match(re) ?? []).length;

test('valjProdukter: gratis i konfigens ordning, dyraste med lager och bild, aldrig en gratisprodukt', () => {
  assert.deepEqual(produkter.gratis.map((x) => x.handle), konfig.erbjudande.gratisprodukter);
  assert.deepEqual(produkter.dyra.map((x) => x.handle), ['dyr-a', 'dyr-b', 'dyr-d']);
});

test('valjProdukter: dyra_override vinner, okänd handle stoppar', () => {
  const k = { ...konfig, erbjudande: { ...konfig.erbjudande, dyra_override: ['billig'] } };
  assert.deepEqual(valjProdukter(ALLA, k).dyra.map((x) => x.handle), ['billig']);
  const fel = { ...konfig, erbjudande: { ...konfig.erbjudande, gratisprodukter: ['finns-inte'] } };
  assert.throws(() => valjProdukter(ALLA, fel), /finns-inte/);
});

test('kortnamn klipper vid tankstreck och långa titlar', () => {
  assert.equal(kortnamn('Bäverlampa Pro'), 'Bäverlampa Pro');
  assert.equal(kortnamn('Kepslampa 300 Lumen – Clip-On LED Pannlampa'), 'Kepslampa 300 Lumen');
  assert.equal(kortnamn('Bävertratt - Tanka snabbt utan spill'), 'Bävertratt');
  assert.ok(kortnamn('A'.repeat(60)).endsWith('…'));
});

test('ersatt: platshållare blir Liquid respektive exempel', () => {
  assert.equal(ersatt('Order {{ordernummer}} till {{förnamn}}', 'liquid'), 'Order {{ name }} till {{ fornamn }}');
  assert.equal(ersatt('Order {{ordernummer}} till {{förnamn}}', 'exempel'), 'Order #4821 till Johan');
  assert.equal(ersatt('{{belopp}}', 'exempel'), kr(599));
});

test('varje mall i liquid-läge: balanserade taggar, inga platshållare kvar, assign-rad först', () => {
  for (const m of byggAlla({ ...indata, lage: 'liquid' })) {
    assert.ok(m.html.startsWith('{% assign fornamn'), `${m.id}: assign-raden ska vara först`);
    assert.equal(rakna(m.html, /\{%\s*if\b/g), rakna(m.html, /\{%\s*endif\b/g), `${m.id}: if/endif`);
    assert.equal(rakna(m.html, /\{%\s*for\b/g), rakna(m.html, /\{%\s*endfor\b/g), `${m.id}: for/endfor`);
    assert.ok(!/\{\{(förnamn|ordernummer|fraktbolag|belopp)\}\}/.test(m.html), `${m.id}: platshållare kvar`);
    assert.ok(!/\{\{(förnamn|ordernummer|fraktbolag|belopp)\}\}/.test(m.amne), `${m.id}: platshållare i ämnet`);
    assert.ok(m.html.includes('kundsupport@baverbutiken.se'), `${m.id}: supportadressen`);
    // Incident 2026-09-12: default: "fraktbolaget" blev default: &quot;fraktbolaget&quot;
    for (const tagg of m.html.match(/\{\{[^}]*\}\}|\{%[^%]*%\}/g) ?? []) {
      assert.ok(!tagg.includes('&quot;') && !tagg.includes('&#'), `${m.id}: HTML-eskapning inuti Liquid: ${tagg}`);
    }
    for (const tagg of m.amne.match(/\{\{[^}]*\}\}|\{%[^%]*%\}/g) ?? []) {
      assert.ok(!tagg.includes('&quot;'), `${m.id}: HTML-eskapning i ämnesraden: ${tagg}`);
    }
  }
});

test('exempel-läget innehåller ingen Liquid alls', () => {
  for (const m of byggAlla({ ...indata, lage: 'exempel' })) {
    assert.ok(!m.html.includes('{{') && !m.html.includes('{%'), `${m.id}: Liquid i förhandsvisningen`);
    assert.ok(m.html.includes('Johan'), `${m.id}: exempelkunden`);
  }
});

test('erbjudandet ligger i rätt mallar och bär kod, kollektionslänk, fyra gratis och tre dyra', () => {
  const e = konfig.erbjudande;
  for (const meta of MALLAR) {
    const m = byggMall(meta.id, { ...indata, lage: 'liquid' });
    const har = m.html.includes(`/discount/${e.kod}?redirect=%2Fcollections%2F${e.kollektion_handle}`);
    assert.equal(har, meta.erbjudande, `${meta.id}: erbjudande ${meta.erbjudande ? 'saknas' : 'ska inte vara med'}`);
    if (meta.erbjudande) {
      for (const g of produkter.gratis) assert.ok(m.html.includes(g.url), `${meta.id}: gratis ${g.handle}`);
      for (const d of produkter.dyra) assert.ok(m.html.includes(d.url), `${meta.id}: dyr ${d.handle}`);
      assert.ok(m.html.includes(String(e.minsta_kop_sek)), `${meta.id}: minsta köp`);
    }
  }
});

test('rabattkoden följer namnregeln: versaler, inga å/ä/ö, inga mellanslag', () => {
  assert.match(konfig.erbjudande.kod, /^[A-Z0-9]+$/);
});

test('orderbekräftelsen använder Shopifys ordervariabler', () => {
  const m = byggMall('orderbekraftelse', { ...indata, lage: 'liquid' });
  for (const v of ['{{ order_status_url }}', '{% for line in line_items %}', '{{ subtotal_price | money }}', '{{ total_price | money }}', '{% for shipping_method in shipping_methods %}', '{% if shipping_address %}']) {
    assert.ok(m.html.includes(v), `saknar ${v}`);
  }
});

test('fraktmallarna använder fulfillment, övergiven kassa använder url, återbetalning amount', () => {
  const frakt = byggMall('fraktbekraftelse', { ...indata, lage: 'liquid' });
  assert.ok(frakt.html.includes('{% for line in fulfillment.fulfillment_line_items %}'));
  assert.ok(frakt.html.includes('fulfillment.tracking_url'));
  const kassa = byggMall('overgiven_kassa', { ...indata, lage: 'liquid' });
  assert.ok(kassa.html.includes('href="{{ url }}"'));
  const ater = byggMall('aterbetalning', { ...indata, lage: 'liquid' });
  assert.ok(ater.html.includes('{{ amount | money }}'));
  assert.ok(ater.html.includes('{% for line in refund_line_items %}'));
});

test('sidan bakar in alla mallar med kopiera-knappar och förhandsvisningar', () => {
  const liquid = byggAlla({ ...indata, lage: 'liquid' });
  const exempel = byggAlla({ ...indata, lage: 'exempel' });
  const sida = byggSida({ liquid, exempel, konfig, produkter, byggd: '2026-09-12 16:00' });
  assert.ok(sida.startsWith('<title>'));
  assert.equal(rakna(sida, /data-mal="liquid-/g), MALLAR.length);
  assert.equal(rakna(sida, /<iframe /g), MALLAR.length);
  assert.ok(sida.includes(konfig.erbjudande.kod));
  assert.ok(!sida.includes('</script>{'), 'mallkoden får inte bryta script-taggen');
});
