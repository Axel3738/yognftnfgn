import test from 'node:test';
import assert from 'node:assert/strict';
import { serUtSomSvenska, granskaSprak, stoppText } from '../lib/engelska.mjs';

test('svenska rutinrapporter fångas', () => {
  assert.equal(serUtSomSvenska('✅ NO-recensioner: 0 nya (7 produkter, alla redan klara)'), true);
  assert.equal(serUtSomSvenska('✅ Inget nytt i kön, allt rullar'), true);
  assert.equal(serUtSomSvenska('⚠️ 3 klara i kön, 0 uppe — Notion saknas, brief-QA blockerad'), true);
  assert.equal(serUtSomSvenska('Du behöver inte göra något.'), true);
});

test('engelska rapporter släpps igenom', () => {
  assert.equal(serUtSomSvenska('✅ NO reviews: 0 new (7 products, all already done)'), false);
  assert.equal(serUtSomSvenska('✅ 10 new on IBC-tanktrekk, 6 skipped'), false);
  assert.equal(serUtSomSvenska('⚠️ Missing files for Badshorts: CS_1_H1.mp4'), false);
  assert.equal(serUtSomSvenska('Nothing new tonight.'), false);
});

test('svenska/norska namn i engelsk text stoppar inte', () => {
  assert.equal(serUtSomSvenska('Motorhöljet: 3 videos uploaded to #bäver-scaling-products'), false);
  assert.equal(serUtSomSvenska('Kranbeskyttelse Frost 420D live on beverbutikken.no, BE-ROAS 1.8'), false);
  assert.equal(serUtSomSvenska('<@1469423029783236689> Kjempefotball launched, 1 000 SEK/day'), false);
});

test('taggar, länkar och kod räknas inte som text', () => {
  assert.equal(serUtSomSvenska('<@123> https://drive.google.com/på/och `kör inte` ok'), false);
});

test('tomt och kort släpps igenom', () => {
  assert.equal(serUtSomSvenska(''), false);
  assert.equal(serUtSomSvenska('ok'), false);
});

test('granskaSprak: engelska passerar orörd utan nätverk', async () => {
  const r = await granskaSprak('✅ All good, nothing to do.');
  assert.deepEqual(r, { text: '✅ All good, nothing to do.', svenska: false, oversatt: false, stoppad: false });
});

test('granskaSprak: svenska utan nyckel stoppas med orsak', async () => {
  const sparad = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const r = await granskaSprak('✅ Inga nya produkter i natt.');
    assert.equal(r.stoppad, true);
    assert.equal(r.svenska, true);
    assert.match(r.orsak, /ANTHROPIC_API_KEY/);
    assert.match(stoppText(r.orsak), /engelska/);
  } finally {
    if (sparad !== undefined) process.env.ANTHROPIC_API_KEY = sparad;
  }
});

test('granskaSprak: DISCORD_TILLAT_SVENSKA=1 släpper igenom', async () => {
  const r = await granskaSprak('✅ Inga nya produkter i natt.', { tillatSvenska: true });
  assert.equal(r.stoppad, false);
  assert.equal(r.text, '✅ Inga nya produkter i natt.');
});
