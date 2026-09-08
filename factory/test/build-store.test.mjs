// Tester för sidmallen och Shopify-planen (allt utan nätverk).
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import { byggPlan } from '../build-store.mjs';
import { byggSidaHtml, byggForhandsvisning, byggSektioner, formatPris, kundUnderrubrik } from '../sida.mjs';
import { dummy, medButiksfrakt, raprodukt } from './hjalp.mjs';


test('planen: titel, handle, ACTIVE och vendor', () => {
  const { input } = byggPlan(dummy());
  assert.equal(input.title, 'Nackmagneten');
  assert.equal(input.handle, 'nackmagneten');
  assert.equal(input.status, 'ACTIVE');
  assert.equal(input.vendor, 'Nackmagneten');
});

test('planen: varianter med pris, jämförpris och sku', () => {
  const { input } = byggPlan(dummy());
  assert.equal(input.variants.length, 2);
  assert.equal(input.variants[0].price, '399.00');
  assert.equal(input.variants[0].compareAtPrice, '599.00');
  assert.equal(input.variants[0].sku, 'NM-GRA');
  assert.equal(input.productOptions[0].name, 'Variant');
});

test('planen: utan varianter blir det en Default Title-variant', () => {
  const data = dummy();
  data.varianter = [];
  const { input } = byggPlan(data);
  assert.equal(input.variants.length, 1);
  assert.equal(input.productOptions[0].name, 'Title');
  assert.equal(input.variants[0].optionValues[0].name, 'Default Title');
});

test('planen: bilder blir filer, videor hoppas över med notis', () => {
  const plan = byggPlan(dummy());
  assert.equal(plan.input.files.length, 2);
  assert.equal(plan.input.files[0].contentType, 'IMAGE');
  assert.equal(plan.hoppadeOver.length, 1);
  assert.ok(plan.hoppadeOver[0].includes('video'));
});

test('planen: SEO-titel och beskrivning sätts och är korta nog', () => {
  const { input } = byggPlan(dummy());
  assert.ok(input.seo.title.startsWith('Nackmagneten'));
  assert.ok(input.seo.description.length > 0 && input.seo.description.length <= 160);
});

test('sidan: beskrivningsstrukturens block finns i rätt ordning', () => {
  const html = byggForhandsvisning(dummy());
  const idn = [
    'opf-hero',
    'opf-problem',
    'opf-losning',
    'opf-funktioner',
    'opf-lifestyle',
    'opf-garanti',
    'opf-judgeme',
    'opf-faq',
    'opf-kop', // sticky add-to-cart
  ];
  let senast = -1;
  for (const id of idn) {
    const plats = html.indexOf(`id="${id}"`);
    assert.ok(plats !== -1, `saknar sektion ${id}`);
    assert.ok(plats > senast, `${id} ligger i fel ordning`);
    senast = plats;
  }
});

test('sidan: recensionstexterna renderas aldrig — de ägs av Judge.me', () => {
  const html = byggForhandsvisning(dummy());
  assert.ok(!html.includes('Första natten på månader'), 'recensionstext läckte in i sidan');
  assert.ok(html.includes('Judge.me-widgeten renderas här'));
});

test('sidan: block 1 och 3 visar text och media ur beskrivningen', () => {
  const html = byggSidaHtml(dummy());
  assert.ok(html.includes('Klockan är 15 och nacken är redan stel.'));
  assert.ok(html.includes('nackmagneten-problem.gif'));
  assert.ok(html.includes('Tio minuter på Nackmagneten löser upp spänningarna'));
  assert.ok(html.includes('nackmagneten-losning.gif'));
});

test('sidan: body_html har innehållssektionerna men inte sticky ATC', () => {
  const html = byggSidaHtml(dummy());
  assert.ok(html.includes('id="opf-hero"'));
  assert.ok(!html.includes('id="opf-kop"'));
});

test('sidan: text ur filen eskapas', () => {
  const data = dummy();
  data.produkt.namn = 'Nack<script>alert(1)</script>';
  const html = byggSidaHtml(data);
  assert.ok(!html.includes('<script>alert'));
  assert.ok(html.includes('&lt;script&gt;'));
});

test('sidan: tomma valfria sektioner hoppas över', () => {
  const data = dummy();
  data.faq = [];
  data.media.bild_lifestyle = '';
  const sektioner = byggSektioner(data);
  assert.equal(sektioner.faq, '');
  assert.equal(sektioner.lifestyle, '');
  const html = byggSidaHtml(data);
  assert.ok(!html.includes('id="opf-faq"'));
  assert.ok(!html.includes('id="opf-lifestyle"'));
});

test('prisformat per valuta', () => {
  assert.equal(formatPris(399, 'SEK'), '399 kr');
  assert.equal(formatPris(29.5, 'EUR'), '€29.50');
  assert.equal(formatPris(19, 'GBP'), '£19');
});

test('hero visar underrubriken, aldrig den interna huvudvinkeln', () => {
  const html = byggSidaHtml(dummy());
  assert.ok(!html.includes('källa:'), 'källhänvisningen får inte nå kundtexten');
  assert.ok(html.includes('Stel nacke efter en dag vid skärmen'));
});

test('utan underrubrik strippas källparentesen ur huvudvinkeln', () => {
  const data = dummy();
  delete data.vinkel.underrubrik;
  assert.equal(
    kundUnderrubrik(data.vinkel),
    'Problem-demo: stel nacke efter 8 timmar vid skärmen — lindring på 10 minuter'
  );
  assert.ok(!byggSidaHtml(data).includes('källa:'));
});
