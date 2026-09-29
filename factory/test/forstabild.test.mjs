import { test } from 'node:test';
import assert from 'node:assert/strict';
import { forstabildBlock, laggInForstabild, ordningMedUgcSist, ugcAlt, FORSTABILD_MARKE, UGC_PREFIX } from '../forstabild.mjs';

test('forstabild: kontrollen (b, JS av, testet av) ser dagens galleri — [UGC]-bilden döljs överallt', () => {
  const b = forstabildBlock();
  // Dold för alla som INTE är a, i galleriet, tumnaglarna och zoom-modalen.
  for (const del of ['.product__media-item:has(img[alt^="[UGC]"])', '.thumbnail-list__item:has(img[alt^="[UGC]"])', '.product-media-modal__content img[alt^="[UGC]"]']) {
    assert.ok(b.includes(`html:not([data-ms-ab-forstabild="a"]) ${del}`), del);
  }
  assert.ok(b.includes('{display:none!important}'));
  // Variant a: först, även innan skriptet hunnit köra.
  assert.ok(b.includes('html[data-ms-ab-forstabild="a"] .product__media-list li:has(img[alt^="[UGC]"])'));
  assert.ok(b.includes('{order:-1}'));
  // Skriptet använder galleriets egen flytt (Dawn: setActiveMedia(id, prepend)).
  assert.ok(b.includes('setActiveMedia(li.getAttribute(\'data-media-id\'), true)'));
  assert.ok(b.includes("getAttribute('data-ms-ab-forstabild') !== 'a'"), 'skriptet gör ingenting för kontrollen');
});

test('forstabild: blocket läggs in en gång och byts på plats vid nästa körning', () => {
  const head = '<script src="ms-ab.js"></script>\n{%- comment -%} opf-gallerifilter {%- endcomment -%}\n';
  const en = laggInForstabild(head);
  assert.ok(en.startsWith(head.trimEnd()), 'resten av ms-head orörd');
  assert.equal(en.split(`${FORSTABILD_MARKE}:`).length - 1, 1);
  assert.equal(laggInForstabild(en), en, 'idempotent');
  const annatTest = laggInForstabild(en, { test: 'ugcforst' });
  assert.equal(annatTest.split(`${FORSTABILD_MARKE}:`).length - 1, 1, 'byts, dubbleras inte');
  assert.ok(annatTest.includes('data-ms-ab-ugcforst'));
  assert.ok(!annatTest.includes('data-ms-ab-forstabild'));
  // Blocket kommer EFTER ms-ab.js — attributet är satt när skriptet kör.
  assert.ok(en.indexOf('ms-ab.js') < en.indexOf(FORSTABILD_MARKE));
});

test('forstabild: halvt block (start utan slut) stoppar i stället för att gissa', () => {
  assert.throws(() => laggInForstabild(`x\n{%- comment -%} ${FORSTABILD_MARKE}: gammalt`), /slutmärket/);
});

test('forstabild: bilden läggs SIST, så featured_image och kortens hoverbild är samma för båda grupperna', () => {
  assert.deepEqual(ordningMedUgcSist(['a', 'u', 'b', 'c'], 'u'), ['a', 'b', 'c', 'u']);
  assert.deepEqual(ordningMedUgcSist(['a', 'b', 'u'], 'u'), ['a', 'b', 'u']);
});

test('forstabild: alt-texten bär alltid prefixet, aldrig två gånger', () => {
  assert.equal(ugcAlt('Man håller upp överdraget'), `${UGC_PREFIX} Man håller upp överdraget`);
  assert.equal(ugcAlt('[UGC] Redan märkt'), '[UGC] Redan märkt');
});
