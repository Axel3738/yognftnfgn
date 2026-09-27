// Tester för sammanfoga.mjs — ren logik, inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sammanfoga, aterstallHardaBlanksteg } from '../sammanfoga.mjs';

const NBSP = ' ';

test('hårda blanksteg: ett blanksteg-element och ett inledande hårt blanksteg återställs', () => {
  const sv = `<p>Hej</p><p>${NBSP}</p><p><span>${NBSP}Om du vill</span></p>`;
  const mal = '<p>Hello</p><p> </p><p><span> If you want</span></p>';
  assert.equal(aterstallHardaBlanksteg(sv, mal), `<p>Hello</p><p>${NBSP}</p><p><span>${NBSP}If you want</span></p>`);
});

test('hårda blanksteg: orörd när svenskan saknar dem, när översättningen redan har dem, och när taggarna skiljer', () => {
  assert.equal(aterstallHardaBlanksteg('<p>Hej</p>', '<p>Hello </p>'), '<p>Hello </p>');
  const sv = `<p>${NBSP}</p>`;
  assert.equal(aterstallHardaBlanksteg(sv, `<p>${NBSP}</p><p>x</p>`), `<p>${NBSP}</p><p>x</p>`);
  assert.equal(aterstallHardaBlanksteg(sv, '<p> </p><p> </p>'), '<p> </p><p> </p>');
  assert.equal(aterstallHardaBlanksteg(sv, 42), 42);
});

test('hårda blanksteg: Liquid-taggar räknas som taggar och lämnas orörda', () => {
  const sv = `{% if a %}<p>${NBSP}</p>{% endif %}`;
  assert.equal(aterstallHardaBlanksteg(sv, '{% if a %}<p> </p>{% endif %}'), sv);
});

test('sammanfoga: slår ihop delarna, återställer blanksteg och rapporterar saknat/extra/dubbletter', () => {
  const sv = { a: 'Hej', b: `<p>${NBSP}</p>`, c: 'Tre' };
  const delar = [
    ['x-A.json', { a: 'Hello', _om: 'meta' }],
    ['x-B.json', { b: '<p> </p>', d: 'extra' }],
    ['x-C.json', { a: 'Hi' }],
  ];
  const r = sammanfoga(sv, delar);
  assert.equal(r.ut.a, 'Hi');
  assert.equal(r.ut.b, `<p>${NBSP}</p>`);
  assert.deepEqual(r.saknas, ['c']);
  assert.deepEqual(r.extra, ['d']);
  assert.deepEqual(r.dubbletter, [{ nyckel: 'a', del: 'x-C.json' }]);
});
