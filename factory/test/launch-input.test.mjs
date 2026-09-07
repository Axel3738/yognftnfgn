// Tester för LAUNCH-INPUT-kopplingen. Ingen nätverkstrafik.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasLaunchInput, tillampaLaunchInput } from '../launch-input.mjs';
import { sammanfoga } from '../butik.mjs';
import { kontrolleraLaunch } from '../kontroll.mjs';
import { rabutik, raprodukt } from './hjalp.mjs';

const MALLEN = join(dirname(fileURLToPath(import.meta.url)), '..', 'LAUNCH-INPUT.yaml');

const IFYLLD = {
  bolagsnamn: 'Mittbolag AB',
  orgnr: '556123-4567',
  adress: 'Gatan 1, 111 22 Stockholm',
  supportmail: 'hello@dinbutik.se',
  doman: 'dinbutik.se',
  produktbilder: ['https://cdn.exempel.se/riktig-bild.jpg'],
  pixel_id: '111',
  ad_account_id: '915422744950975',
  page_id: '333',
};

test('mallen läses — bara det gemensamma annonskontot är förifyllt', () => {
  const { ifyllt, saknas } = lasLaunchInput(MALLEN);
  assert.deepEqual(ifyllt, ['ad_account_id']);
  assert.equal(saknas.length, 8);
});

test('ifyllda värden hamnar på rätt ställen', () => {
  const butik = rabutik();
  const produkt = raprodukt();
  const applicerat = tillampaLaunchInput(butik, produkt, IFYLLD);
  assert.equal(butik.butik.bolagsnamn, 'Mittbolag AB');
  assert.equal(butik.butik.supportmail, 'hello@dinbutik.se');
  assert.deepEqual(produkt.media.bilder, ['https://cdn.exempel.se/riktig-bild.jpg']);
  assert.equal(produkt.meta.pixel_id, '111');
  assert.equal(produkt.launch.doman, 'dinbutik.se');
  assert.equal(applicerat.length, 9);
});

test('tomma rader ignoreras och skriver inte över befintligt', () => {
  const butik = rabutik();
  const orgnrForut = butik.butik.orgnr;
  const applicerat = tillampaLaunchInput(butik, raprodukt(), { bolagsnamn: '', produktbilder: [''] });
  assert.equal(butik.butik.orgnr, orgnrForut);
  assert.deepEqual(applicerat, []);
});

test('domänen normaliseras från URL till host', () => {
  const produkt = raprodukt();
  tillampaLaunchInput(rabutik(), produkt, { doman: 'https://dinbutik.se/sida' });
  assert.equal(produkt.launch.doman, 'dinbutik.se');
});

test('sammanfogningen bär vidare bolagsuppgifterna till villkoren', () => {
  const butik = rabutik();
  const produkt = raprodukt();
  tillampaLaunchInput(butik, produkt, IFYLLD);
  const p = sammanfoga(butik, produkt);
  assert.equal(p.brand.org_namn, 'Mittbolag AB');
  assert.equal(p.brand.kontakt_epost, 'hello@dinbutik.se');
  assert.equal(p.meta.page_id, '333');
});

// --- Domänkravet i LAUNCH-verifieringen ---

const SHOP = (host) => ({
  currencyCode: 'SEK',
  primaryDomain: { host, sslEnabled: true },
});
const PRODUKT = {
  handle: 'nackmagneten',
  status: 'DRAFT',
  media: { nodes: [{ id: 'm1' }] },
  variants: { nodes: [{ price: '399.00' }, { price: '399.00' }] },
};
const POLICYER = ['REFUND_POLICY', 'SHIPPING_POLICY', 'TERMS_OF_SERVICE', 'PRIVACY_POLICY'].map(
  (type) => ({ type, body: '<p>x</p>' })
);

function launchklar() {
  const butik = rabutik();
  const produkt = raprodukt();
  tillampaLaunchInput(butik, produkt, IFYLLD);
  return sammanfoga(butik, produkt);
}

test('fel domän i butiken stoppar launchen även utan myshopify', () => {
  const r = kontrolleraLaunch(launchklar(), { shop: SHOP('annanbutik.se'), produkt: PRODUKT, policyer: POLICYER });
  assert.ok(r.kritiska.some((k) => k.namn === 'doman' && k.detalj.includes('launch-inputen')));
});

test('rätt domän ger grön domänpunkt', () => {
  const r = kontrolleraLaunch(launchklar(), { shop: SHOP('dinbutik.se'), produkt: PRODUKT, policyer: POLICYER });
  assert.ok(!r.kritiska.some((k) => k.namn === 'doman'));
  assert.equal(r.gron, true, `kritiska: ${JSON.stringify(r.kritiska.map((k) => k.namn))}`);
});
