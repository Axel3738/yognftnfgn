import test from 'node:test';
import assert from 'node:assert/strict';
import { tolkaProdukt, handleUrLank, produktJsonUrl, prisText, kortTitel, slug, renText, hamtaProdukt } from '../produkt.mjs';

const FIXTUR = {
  product: {
    id: 16268150931805,
    title: 'Axelbälte för Trimmer – Justerbart Nylonbälte',
    handle: 'axelbalte-for-trimmer-justerbart-nylonbalte',
    product_type: 'Trädgård',
    body_html: '<h2>Trimma längre</h2><p>Att bära hela vikten &amp; mer.</p><ul><li>Fördelar vikten</li></ul>',
    variants: [
      { id: 1, title: 'Svart', price: '599.00', compare_at_price: '789.00' },
      { id: 2, title: 'Grön', price: '649.00', compare_at_price: '811.25' },
    ],
    options: [{ name: 'Färg', values: ['Svart', 'Grön'] }],
    images: [{ src: 'https://cdn.shopify.com/a.jpg?v=1', width: 1240, height: 1240, position: 1 }],
  },
};

test('tolkaProdukt: lägsta pris, dess jämförpris, bilder utan query, kort titel och slug', () => {
  const p = tolkaProdukt(FIXTUR);
  assert.equal(p.pris, 599);
  assert.equal(p.jamforpris, 789);
  assert.equal(p.prisText, '599 kr');
  assert.equal(p.jamforprisText, '789 kr');
  assert.deepEqual(p.flerPriser, [599, 649]);
  assert.equal(p.kortTitel, 'Axelbälte för Trimmer');
  assert.equal(p.slug, 'axelbalte-for-trimmer');
  assert.equal(p.url, 'https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte');
  assert.equal(p.bilder[0].src, 'https://cdn.shopify.com/a.jpg');
  assert.equal(p.bilder[0].width, 1240);
  assert.match(p.beskrivning, /Trimma längre\nAtt bära hela vikten & mer\.\nFördelar vikten/);
  assert.equal(p.alternativ[0].namn, 'Färg');
});

test('tolkaProdukt utan jämförpris och med ett pris', () => {
  const p = tolkaProdukt({ product: { ...FIXTUR.product, variants: [{ id: 1, title: 'x', price: '349.00', compare_at_price: null }] } });
  assert.equal(p.jamforpris, null);
  assert.equal(p.jamforprisText, null);
  assert.equal(p.flerPriser, null);
  assert.throws(() => tolkaProdukt({ product: { ...FIXTUR.product, variants: [] } }), /inga varianter/);
  assert.throws(() => tolkaProdukt({ product: {} }), /saknar handle/);
});

test('länk → handle → json-url', () => {
  assert.equal(handleUrLank('https://baverbutiken.se/products/axelbalte?variant=1'), 'axelbalte');
  assert.equal(handleUrLank('https://baverbutiken.se/nb/products/axelbalte/'), 'axelbalte');
  assert.equal(handleUrLank('axelbalte-for-trimmer'), 'axelbalte-for-trimmer');
  assert.equal(handleUrLank('hej hopp'), null);
  assert.equal(produktJsonUrl('https://baverbutiken.se/products/axelbalte?x=1'), 'https://baverbutiken.se/products/axelbalte.json');
  assert.equal(produktJsonUrl('axelbalte'), 'https://baverbutiken.se/products/axelbalte.json');
  assert.equal(produktJsonUrl(''), null);
});

test('prisText, kortTitel, slug, renText', () => {
  assert.equal(prisText(599), '599 kr');
  assert.equal(prisText('1129.00'), '1 129 kr');
  assert.equal(prisText(811.25), '811,25 kr');
  assert.equal(prisText('x'), '');
  assert.equal(kortTitel('Strandtofflor för Herr – Halkfria Trädgårdsskor'), 'Strandtofflor för Herr');
  assert.equal(kortTitel('Sätesöverdrag för Åkgräsklippare - Slittåligt'), 'Sätesöverdrag för Åkgräsklippare');
  assert.equal(kortTitel('Bara titel'), 'Bara titel');
  assert.equal(slug('Sätesöverdrag för Åkgräsklippare'), 'satesoverdrag-for-akgrasklippare');
  assert.equal(slug('  Ö  '), 'o');
  assert.equal(renText('<p>a&nbsp;b</p><p>c</p>'), 'a b\nc');
});

test('hamtaProdukt med injicerad fetch', async () => {
  const p = await hamtaProdukt('https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte', {
    fetchFn: async (url) => { assert.ok(url.endsWith('.json')); return { ok: true, status: 200, json: async () => FIXTUR }; },
  });
  assert.equal(p.pris, 599);
  await assert.rejects(hamtaProdukt('https://baverbutiken.se/products/finns-inte', { fetchFn: async () => ({ ok: false, status: 404 }) }), /404/);
  await assert.rejects(hamtaProdukt('???'), /produkt-handle/);
});
