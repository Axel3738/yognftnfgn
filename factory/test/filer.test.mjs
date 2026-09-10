// Tester för filer.mjs — ren logik: filnamn ur URL, mime, handle-bygge och
// idempotensmatchningen mot Shopifys UUID-suffixade namn. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  filnamnUrUrl,
  mimeFor,
  arUrl,
  stam,
  byggHandle,
  matchaLagratNamn,
  tolkaFilpost,
  somKarta,
} from '../filer.mjs';

test('filnamnUrUrl: sista segmentet utan query, fragment och URL-kodning', () => {
  assert.equal(filnamnUrUrl('https://cdn.shopify.com/s/files/1/x/benskydd-08.jpg?v=1725'), 'benskydd-08.jpg');
  assert.equal(filnamnUrUrl('https://cdn/x/hero%20bild.png#top'), 'hero bild.png');
  assert.equal(filnamnUrUrl('/home/user/output/drytrek/drytrek-logga.png'), 'drytrek-logga.png');
  assert.equal(filnamnUrUrl('bara-namn.webp'), 'bara-namn.webp');
  assert.equal(filnamnUrUrl(null), '');
});

test('mimeFor: kända ändelser, okänd blir octet-stream, query ignoreras', () => {
  assert.equal(mimeFor('a.PNG'), 'image/png');
  assert.equal(mimeFor('a.jpg'), 'image/jpeg');
  assert.equal(mimeFor('a.jpeg?v=2'), 'image/jpeg');
  assert.equal(mimeFor('a.webp'), 'image/webp');
  assert.equal(mimeFor('tema.zip'), 'application/zip');
  assert.equal(mimeFor('a.bmp'), 'application/octet-stream');
});

test('arUrl skiljer URL från lokal sökväg', () => {
  assert.equal(arUrl('https://x.se/a.png'), true);
  assert.equal(arUrl('HTTP://x.se/a.png'), true);
  assert.equal(arUrl('factory/output/a.png'), false);
  assert.equal(arUrl(''), false);
});

test('handeln bär det LAGRADE namnet med ändelse (DryTrek 2026-09-09)', () => {
  assert.equal(byggHandle('benskydd-08_3ecbd654-1b2c-4d5e-8f90-abcdef123456.jpg'),
    'shopify://shop_images/benskydd-08_3ecbd654-1b2c-4d5e-8f90-abcdef123456.jpg');
  assert.equal(byggHandle(null), null);
  assert.equal(stam('a.b.jpg'), 'a.b');
});

test('matchaLagratNamn: exakt namn vinner', () => {
  const lagrade = ['benskydd-08_3ecbd654-1b2c-4d5e-8f90-abcdef123456.jpg', 'benskydd-08.jpg', 'benskydd-08-2.jpg'];
  assert.equal(matchaLagratNamn(lagrade, 'benskydd-08.jpg'), 'benskydd-08.jpg');
});

test('matchaLagratNamn: UUID-suffixad variant när originalnamnet är upptaget', () => {
  const lagrade = ['annan.jpg', 'benskydd-08-2.jpg', 'benskydd-08_3ecbd654-1b2c-4d5e-8f90-abcdef123456.jpg'];
  assert.equal(matchaLagratNamn(lagrade, 'benskydd-08.jpg'), 'benskydd-08_3ecbd654-1b2c-4d5e-8f90-abcdef123456.jpg');
});

test('matchaLagratNamn: samma ändelse föredras, annars samma stam med annan ändelse', () => {
  const lagrade = ['logga_aaaa.png', 'logga_bbbb.jpg'];
  assert.equal(matchaLagratNamn(lagrade, 'logga.jpg'), 'logga_bbbb.jpg');
  assert.equal(matchaLagratNamn(['logga.webp'], 'logga.png'), 'logga.webp');
});

test('matchaLagratNamn: "logga" träffar inte "logga-b" och tom lista ger null', () => {
  assert.equal(matchaLagratNamn(['drytrek-logga-b.png'], 'drytrek-logga.png'), null);
  assert.equal(matchaLagratNamn([], 'x.png'), null);
  assert.equal(matchaLagratNamn(null, 'x.png'), null);
  assert.equal(matchaLagratNamn(['x.png'], ''), null);
});

test('tolkaFilpost tål sträng, { url, alt } och { sokvag, alt }', () => {
  assert.deepEqual(tolkaFilpost('https://x/a.png'), { kalla: 'https://x/a.png', alt: '', filnamn: null });
  assert.deepEqual(tolkaFilpost({ url: 'https://x/a.png', alt: 'Hero' }), { kalla: 'https://x/a.png', alt: 'Hero', filnamn: null });
  assert.deepEqual(tolkaFilpost({ sokvag: 'out/l.png', filnamn: 'butik-logga.png' }), { kalla: 'out/l.png', alt: '', filnamn: 'butik-logga.png' });
  assert.throws(() => tolkaFilpost({ alt: 'utan källa' }), /saknar url\/sokvag/);
});

test('somKarta: käll-namn → lagrad handle, i indataordning', () => {
  const kallor = ['https://x/hero.jpg', { url: 'https://x/trygghet.jpg' }];
  const svar = [
    { namn: 'hero_3ecbd654-1b2c-4d5e-8f90-abcdef123456.jpg', handle: 'shopify://shop_images/hero_3ecbd654-1b2c-4d5e-8f90-abcdef123456.jpg' },
    { namn: 'trygghet.jpg', handle: 'shopify://shop_images/trygghet.jpg' },
  ];
  assert.deepEqual(somKarta(svar, kallor), {
    'hero.jpg': 'shopify://shop_images/hero_3ecbd654-1b2c-4d5e-8f90-abcdef123456.jpg',
    'trygghet.jpg': 'shopify://shop_images/trygghet.jpg',
  });
  assert.deepEqual(somKarta(svar), {
    'hero_3ecbd654-1b2c-4d5e-8f90-abcdef123456.jpg': svar[0].handle,
    'trygghet.jpg': svar[1].handle,
  });
});
