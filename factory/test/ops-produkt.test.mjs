// Tester för förarbetet när en NY produkt ska in i en BEFINTLIG OPS-butik
// (factory/ops-produkt.mjs, kommandot /ops-produkt). Ingen nätverkstrafik.
//
// Felen som testas är de tysta i factory/FLERPRODUKT.md:
//   1. delat creative_prefix — fyra system tappar isär produkterna
//   2. körraden med bara den nya produktfilen — gamla produkten försvinner
//      ur startsidan och menyn utan felmeddelande

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  idUrTitel, handleUrLank, produktJsonUrl, prefixForslag,
  priserUr, varianterUr, bilderUr, prefixKrock, byggKorrad, OMSTEG, fyllMall,
} from '../ops-produkt.mjs';

test('idUrTitel: svenska tecken bort, siffror bort, två ord', () => {
  assert.equal(idUrTitel('Taköverdrag Husvagn 6,5 × 3 m – Skyddar Den Dyraste Ytan'), 'takoverdrag-husvagn');
  assert.equal(idUrTitel('ATV-Kapell Storlek 3XL – 256 × 110 × 120 cm, Svart'), 'atv-kapell');
  assert.equal(idUrTitel('Värmesits 45 × 90 cm', 1), 'varmesits');
  assert.match(idUrTitel('Snöskyffel Utan Batteri'), /^[a-z0-9-]+$/, 'aldrig å/ä/ö i ett id');
});

test('handleUrLank + produktJsonUrl: tål query, fragment och slash', () => {
  assert.equal(handleUrLank('https://baverbutiken.se/products/atv-kapell?variant=1'), 'atv-kapell');
  assert.equal(handleUrLank('https://baverbutiken.se/collections/x/products/atv-kapell'), 'atv-kapell');
  assert.equal(handleUrLank('https://baverbutiken.se/'), null);
  assert.equal(produktJsonUrl('https://baverbutiken.se/products/atv-kapell?v=2'), 'https://baverbutiken.se/products/atv-kapell.json');
  assert.equal(produktJsonUrl('https://baverbutiken.se/products/atv-kapell/'), 'https://baverbutiken.se/products/atv-kapell.json');
  assert.equal(produktJsonUrl('https://baverbutiken.se/'), null);
});

test('prefixForslag: brand + produktord, aldrig å/ä/ö eller mellanslag', () => {
  assert.equal(prefixForslag('CaraShell', 'ATV-Kapell Storlek 3XL'), 'CaraShellAtv');
  assert.equal(prefixForslag('DryTrek', 'Värmesits 45 × 90 cm'), 'DryTrekVarmesits');
  assert.match(prefixForslag('CatCabin', 'Kattlåda Överdrag'), /^[A-Za-z0-9]+$/);
});

test('priserUr: lägsta variantpris, högsta jämförpris, som TAL', () => {
  const p = { variants: [{ price: '579.00', compare_at_price: '759.00' }, { price: '499.00', compare_at_price: null }] };
  assert.deepEqual(priserUr(p), { pris: 499, jamforpris: 759 });
  assert.deepEqual(priserUr({ variants: [] }), { pris: null, jamforpris: null });
  assert.deepEqual(priserUr({ variants: [{ price: '1129.00', compare_at_price: '' }] }), { pris: 1129, jamforpris: null });
});

test('varianterUr: en enda "Default Title" är ingen variant', () => {
  assert.deepEqual(varianterUr({ variants: [{ title: 'Default Title' }] }), []);
  assert.deepEqual(varianterUr({ variants: [{ title: 'Svart', sku: 'A' }, { title: 'Grå', sku: 'B' }] }),
    [{ namn: 'Svart', sku: 'A' }, { namn: 'Grå', sku: 'B' }]);
});

test('bilderUr: query-strängen bort — Shopifys ?v= byts vid varje uppdatering', () => {
  assert.deepEqual(bilderUr({ images: [{ src: 'https://cdn.shopify.com/a.png?v=1788793284' }, { src: 'https://cdn.shopify.com/b.jpg' }] }),
    ['https://cdn.shopify.com/a.png', 'https://cdn.shopify.com/b.jpg']);
});

test('prefixKrock: två produkter i en butik får ALDRIG samma prefix', () => {
  const b = [{ fil: 'factory/produkter/takskyddet.yaml', id: 'takskyddet', prefix: 'CaraShellRoof' }];
  assert.equal(prefixKrock('CaraShellRoof', b).id, 'takskyddet');
  assert.equal(prefixKrock('carashellroof', b).id, 'takskyddet', 'skiftlägesokänsligt');
  assert.equal(prefixKrock('CaraShellAtv', b), null);
  assert.equal(prefixKrock('', b), null);
});

test('byggKorrad: ALLA produktfiler, och stegen som byggs ur körningen tvingas om', () => {
  const rad = byggKorrad('factory/butiker/carashell.yaml',
    ['factory/produkter/takskyddet.yaml', 'factory/produkter/atv-kapell.yaml']);
  assert.match(rad, /takskyddet\.yaml/, 'den GAMLA produkten måste vara med — annars försvinner den ur startsidan och menyn');
  assert.match(rad, /atv-kapell\.yaml/);
  assert.match(rad, /--resume/);
  for (const steg of OMSTEG) assert.match(rad, new RegExp(steg), `${steg} måste tvingas om`);
  assert.deepEqual(OMSTEG, ['kollektion', 'startsida', 'meny', 'tema']);
});

test('fyllMall: fyller det maskinläsbara, lämnar det som kräver en människa', () => {
  const mall = [
    'produkt:', '  namn: ""                    # KRITISKT', '  id: ""', '  handle: ""',
    'brand:', '  namn: ""',
    'ekonomi:', '  inkopskostnad: 0', '  pris: 0', '  jamforpris: 0',
    'kalla:', '  produkt_id: ""', '  produkt_handle: ""', '  produkt_url: ""',
    'meta:', '  creative_prefix: ""',
  ].join('\n');
  const { yaml, ifyllda, kvar } = fyllMall(mall, {
    titel: 'ATV-Kapell 3XL', id: 'atv-kapell', brand: 'CaraShell', pris: 579, jamforpris: 759,
    prefix: 'CaraShellAtv', kallaProduktId: '123', kallaHandle: 'atv-kapell',
    kallaUrl: 'https://baverbutiken.se/products/atv-kapell', bilder: [], varianter: [],
  });
  assert.match(yaml, /namn: "ATV-Kapell 3XL"/);
  assert.match(yaml, /id: "atv-kapell"/);
  assert.match(yaml, /pris: 579/, 'pris skrivs som tal, inte text');
  assert.match(yaml, /creative_prefix: "CaraShellAtv"/);
  assert.match(yaml, /produkt_id: "123"/);
  assert.match(yaml, /inkopskostnad: 0/, 'COGS lämnas orörd — den är Axels');
  assert.ok(ifyllda.includes('produkt.namn') && ifyllda.includes('meta.creative_prefix'));
  assert.ok(kvar.some((k) => /inkopskostnad/.test(k)), 'COGS ska stå kvar som ett krav');
  assert.ok(kvar.some((k) => /huvudvinkel/.test(k)));
  // Kommentaren efter fältet ska överleva, annars tappas KRITISKT-märkningen.
  assert.match(yaml, /namn: "ATV-Kapell 3XL"\s+# KRITISKT/);
});
