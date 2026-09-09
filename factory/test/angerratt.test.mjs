// Efterrustningen av EU:s ångerknapp. Ingen nätverkstrafik, inga körningar.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { butikerAttRusta, lage, STEGEN } from '../angerratt.mjs';

const poster = [
  { butik: 'alfa', brand: 'Alfa', butiksfil: 'factory/butiker/alfa.yaml', produktfil: 'factory/produkter/alfa-ett.yaml', byggd: true },
  { butik: 'alfa', brand: 'Alfa', butiksfil: 'factory/butiker/alfa.yaml', produktfil: 'factory/produkter/alfa-tva.yaml', byggd: true },
  { butik: 'beta', brand: 'Beta', butiksfil: 'factory/butiker/beta.yaml', produktfil: 'factory/produkter/beta-ett.yaml', byggd: false },
];

test('en flerproduktsbutik blir EN rad med alla sina produktfiler', () => {
  // En butik har en policy och en meny. Körs den en gång per produkt skriver
  // andra körningen över första och rapporten räknar två butiker som en.
  const rader = butikerAttRusta(poster);
  assert.equal(rader.length, 2);
  const alfa = rader.find((r) => r.id === 'alfa');
  assert.deepEqual(alfa.produktfiler, ['factory/produkter/alfa-ett.yaml', 'factory/produkter/alfa-tva.yaml']);
  assert.equal(alfa.byggd, true);
});

test('en obyggd butik rustas inte — knappen kommer med i första bygget', () => {
  const beta = butikerAttRusta(poster).find((r) => r.id === 'beta');
  const l = lage(beta, {});
  assert.equal(l.kor, false);
  assert.match(l.skal, /inte byggd/);
});

test('en byggd butik utan nycklar rapporteras som hoppad med orsak, aldrig som klar', () => {
  const alfa = butikerAttRusta(poster).find((r) => r.id === 'alfa');
  const l = lage(alfa, {});
  assert.equal(l.kor, false);
  assert.match(l.skal, /SHOPIFY_CLIENT_SECRET/);
  // Orsaken ska namnge den per-butik-variabel VA:n faktiskt ska sätta.
  assert.match(l.skal, /SHOPIFY_SHOP_ALFA/);
});

test('med nycklar i miljön går butiken att köra', () => {
  const alfa = butikerAttRusta(poster).find((r) => r.id === 'alfa');
  const l = lage(alfa, {
    SHOPIFY_SHOP_ALFA: 'alfa-test.myshopify.com',
    SHOPIFY_CLIENT_ID_ALFA: 'id',
    SHOPIFY_CLIENT_SECRET_ALFA: 'hemlis',
  });
  assert.equal(l.kor, true);
  assert.equal(l.doman, 'alfa-test.myshopify.com');
});

test('efterrustningen kör om policyn OCH menyn OCH checklistan', () => {
  // Bara policyn räcker inte: knappen ska gå att hitta i sidfoten, och VA:n
  // ska få avsnitt 5b i sin checklista.
  assert.deepEqual([...STEGEN], ['policyer', 'meny', 'checklista']);
});
