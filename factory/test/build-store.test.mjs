// Tester för sidmallen och Shopify-planen (allt utan nätverk).
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import { byggPlan, produktHandle, bildPost, fogaMeningar, seoTitel } from '../build-store.mjs';
import { byggSidaHtml, byggForhandsvisning, byggSektioner, formatPris, kundUnderrubrik } from '../sida.mjs';
import { dummy, medButiksfrakt, raprodukt, rabutik } from './hjalp.mjs';

test('handle = produkt.handle när det finns, annars produkt.id', () => {
  const data = dummy();
  assert.equal(produktHandle(data), 'nackmagneten');
  assert.equal(byggPlan(data).input.handle, 'nackmagneten');
  data.produkt.handle = 'tankoverdraget';
  assert.equal(produktHandle(data), 'tankoverdraget');
  assert.equal(byggPlan(data).input.handle, 'tankoverdraget');
  data.produkt.handle = '   ';
  assert.equal(produktHandle(data), 'nackmagneten');
});

test('files tål sträng eller { url, alt } — egen alt behålls, sträng får produktnamnet', () => {
  const data = dummy();
  data.media.bilder = [
    'https://exempel.se/a.jpg',
    { url: 'https://exempel.se/sv.jpg', alt: '[SV] Före och efter' },
    { url: 'https://exempel.se/no.jpg', alt: '[NO] Før og etter' },
    { url: 'https://exempel.se/utan-alt.jpg' },
    '',
    null,
  ];
  const { input } = byggPlan(data);
  assert.deepEqual(
    input.files.map((f) => [f.originalSource, f.alt, f.contentType]),
    [
      ['https://exempel.se/a.jpg', 'Nackmagneten', 'IMAGE'],
      ['https://exempel.se/sv.jpg', '[SV] Före och efter', 'IMAGE'],
      ['https://exempel.se/no.jpg', '[NO] Før og etter', 'IMAGE'],
      ['https://exempel.se/utan-alt.jpg', 'Nackmagneten', 'IMAGE'],
    ]
  );
  assert.equal(bildPost({ alt: 'utan url' }, 'X'), null);
});

test('byggPlan(produkt, butik): vendor faller tillbaka på butikens brand', () => {
  const data = dummy();
  data.brand.namn = null;
  const { input } = byggPlan(data, rabutik());
  assert.equal(input.vendor, 'Nackmagneten');
  assert.ok(input.seo.title.includes('Nackmagneten'));
  // Utan butik och utan brand blir vendor tom sträng — aldrig "undefined".
  assert.equal(byggPlan(data).input.vendor, '');
});

test('media.videor som inte är en lista kraschar inte planen', () => {
  const data = dummy();
  data.media.videor = null;
  assert.deepEqual(byggPlan(data).hoppadeOver, []);
  data.media.videor = [''];
  assert.deepEqual(byggPlan(data).hoppadeOver, []);
});


test('varianterna säljer vidare när lagret tar slut', () => {
  const { input } = byggPlan(dummy());
  for (const v of input.variants) {
    assert.equal(v.inventoryPolicy, 'CONTINUE');
    assert.equal(v.inventoryItem.tracked, false);
  }
});

test('planen: titel, handle, ACTIVE och vendor', () => {
  const { input } = byggPlan(dummy());
  assert.equal(input.title, 'Nackmagneten');
  assert.equal(input.handle, 'nackmagneten');
  // ACTIVE sedan 2026-09-09 (Axels bakläxa på TankGuard): en DRAFT produkt
  // ger 404 i menyn och "Exempel på produktnamn" i kundvyn. Trialbutiken är
  // lösenordsskyddad, så ACTIVE exponerar ingenting.
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

test('fogaMeningar dubblerar aldrig skiljetecken', () => {
  // "…fram till julafton.. 14 dagars ångerrätt" stod i Google-utdraget på
  // åtta av AdventLanes tolv produkter (2026-09-11).
  assert.equal(fogaMeningar(['Något att se fram emot.', '14 dagars ångerrätt']), 'Något att se fram emot. 14 dagars ångerrätt');
  assert.equal(fogaMeningar(['Något att se fram emot', '14 dagars ångerrätt']), 'Något att se fram emot. 14 dagars ångerrätt');
  assert.equal(fogaMeningar(['Varför vänta?', 'Fri frakt']), 'Varför vänta? Fri frakt');
  assert.equal(fogaMeningar([null, '', 'Ensam rad']), 'Ensam rad');
  assert.equal(fogaMeningar([]), '');
});

test('seoTitel stryker brandet hellre än kapar det mitt i ordet', () => {
  // "Smycken Adventskalender – 24 Halsband, Örhängen och Ringar – AdventLa…"
  // blev exakt 70 tecken och såg ut som ett fel (2026-09-11).
  assert.equal(seoTitel('Golfkalendern', 'AdventLane'), 'Golfkalendern – AdventLane');
  const langt = 'Smycken Adventskalender – 24 Halsband, Örhängen och Ringar';
  assert.equal(seoTitel(langt, 'AdventLane'), langt, 'brandet stryks, namnet står helt');
  assert.equal(seoTitel('x'.repeat(80), 'AdventLane').length, 70);
  assert.equal(seoTitel('Utan brand', ''), 'Utan brand');
});
