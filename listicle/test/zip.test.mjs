import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { skrivZip, lasZip, crc32 } from '../zip.mjs';

test('crc32 mot kända värden', () => {
  assert.equal(crc32(Buffer.from('')), 0);
  assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926);
});

test('skrivZip → lasZip ger samma poster i samma ordning', () => {
  const zip = skrivZip([
    { namn: 'a.json', data: '{"x":1}' },
    { namn: 'mapp/b.txt', data: Buffer.from('åäö ✓', 'utf8') },
    { namn: 'tom.txt', data: '' },
  ]);
  const ut = lasZip(zip);
  assert.deepEqual([...ut.keys()], ['a.json', 'mapp/b.txt', 'tom.txt']);
  assert.equal(ut.get('a.json').toString(), '{"x":1}');
  assert.equal(ut.get('mapp/b.txt').toString('utf8'), 'åäö ✓');
  assert.equal(ut.get('tom.txt').length, 0);
});

test('zip i zip (samma form som .gempages)', () => {
  const inre = skrivZip([{ namn: '1_1.json', data: '{"id":1}' }]);
  const yttre = skrivZip([{ namn: '1_1.zip', data: inre }, { namn: 'manifest.json', data: '{}' }]);
  const y = lasZip(yttre);
  const i = lasZip(y.get('1_1.zip'));
  assert.equal(i.get('1_1.json').toString(), '{"id":1}');
});

test('läser GemPages egen export', () => {
  const fil = readFileSync(new URL('../mall/motorholje-lagerrensning.gempages', import.meta.url));
  const y = lasZip(fil);
  assert.deepEqual([...y.keys()].sort(), ['1_631451887748514611.zip', 'manifest.json', 'pages_info.zip']);
  const inre = lasZip(y.get('1_631451887748514611.zip'));
  assert.ok(inre.get('1_631451887748514611.json').length > 200000);
  assert.equal(lasZip(y.get('pages_info.zip')).get('pages_info.json').toString().includes('Lagerrensning'), true);
});

test('lasZip felar tydligt på skräp', () => {
  assert.throws(() => lasZip(Buffer.from('inte en zip')), /ingen zip-katalog/);
  assert.throws(() => skrivZip([]), /inga poster/);
});
