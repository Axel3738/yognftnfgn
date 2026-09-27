import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tolka, bygg, nastaNummer, nastaNummer_flera, mediatyp, adsetNyckel, granska, samlaKandaNamn } from '../namn.mjs';
import { lasKonfig } from '../kor.mjs';

const KONFIG = lasKonfig();

// Namnen nedan är AVLÄSTA ur kontot 730973156224390 2026-09-21.
const KONTOT = [
  'MATSTRUMP_sushi_gift_ugc_haikuh3_v1',
  'MATSTRUMP_sushi_offer_static_d3_v1',
  'MATSTRUMP_sushi_curiosity_product_038_v1',
  'MATSTRUMP_sushi_pain_lifestyle_031_v1',
  '09-17 Nathalie captions musik',
  'Sofie H2 julstrumpa Sushi Captions Ingen musik',
];

test('mönstret tolkar kontots egna namn', () => {
  const t = tolka('MATSTRUMP_sushi_curiosity_product_038_v1');
  assert.deepEqual({ vinkel: t.vinkel, format: t.format, nummer: t.nummer, version: t.version }, { vinkel: 'curiosity', format: 'product', nummer: 38, version: 1 });
});

test('äldre id med bokstäver tolkas men ger inget nummer', () => {
  const t = tolka('MATSTRUMP_sushi_gift_ugc_haikuh3_v1');
  assert.equal(t.id, 'haikuh3');
  assert.equal(t.nummer, null);
});

test('Axels egna uppladdningar följer inte mönstret och flyttar aldrig numreringen', () => {
  assert.equal(tolka('09-17 Nathalie captions musik'), null);
  assert.equal(nastaNummer(KONTOT), 39, 'högsta numret i listan är 038 ⇒ nästa är 039');
});

test('flera lediga nummer i rad', () => {
  assert.deepEqual(nastaNummer_flera(['MATSTRUMP_sushi_gift_ugc_043_v1'], 3), [44, 45, 46]);
});

test('bygg ger nollutfyllt namn', () => {
  assert.equal(bygg({ vinkel: 'jul', format: 'ugc', nummer: 44 }, KONFIG), 'MATSTRUMP_sushi_jul_ugc_044_v1');
});

test('okänd vinkel eller okänt format kastar — fel namn är fel adset', () => {
  assert.throws(() => bygg({ vinkel: 'halloween', format: 'ugc', nummer: 1 }, KONFIG), /Okänd vinkel/);
  assert.throws(() => bygg({ vinkel: 'jul', format: 'gif', nummer: 1 }, KONFIG), /Okänt format/);
  assert.throws(() => bygg({ vinkel: 'jul', format: 'ugc', nummer: 0 }, KONFIG), /heltal/);
});

test('mediatypen kommer ur formatet, aldrig ur filändelsen', () => {
  assert.equal(mediatyp('MATSTRUMP_sushi_gift_ugc_012_v1', KONFIG), 'video');
  assert.equal(mediatyp('MATSTRUMP_sushi_offer_static_d3_v1', KONFIG), 'bild');
  assert.equal(mediatyp('MATSTRUMP_sushi_jul_anim_044_v1', KONFIG), 'video');
});

test('JUL-ROUTINGEN: vinkeln jul skickar annonsen till jul-adsetet, formatet väljer video eller bild', () => {
  assert.equal(adsetNyckel('MATSTRUMP_sushi_jul_ugc_044_v1', KONFIG), 'jul_video');
  assert.equal(adsetNyckel('MATSTRUMP_sushi_jul_static_045_v1', KONFIG), 'jul_bild');
  assert.equal(adsetNyckel('MATSTRUMP_sushi_gift_ugc_046_v1', KONFIG), 'video');
  assert.equal(adsetNyckel('MATSTRUMP_sushi_offer_product_047_v1', KONFIG), 'bild');
});

test('ett namn utanför mönstret går aldrig att routa', () => {
  assert.equal(adsetNyckel('09-17 Nathalie captions musik', KONFIG), null);
});

test('granska fångar upptaget namn och okänd vinkel', () => {
  const upptaget = granska('MATSTRUMP_sushi_offer_static_d3_v1', KONTOT, KONFIG);
  assert.equal(upptaget.ok, false);
  assert.match(upptaget.fel.join(' '), /redan upptaget/);
  const okand = granska('MATSTRUMP_sushi_halloween_ugc_050_v1', [], KONFIG);
  assert.equal(okand.ok, false);
  assert.match(okand.fel.join(' '), /Vinkeln "halloween"/);
});

test('hookvarianter med siffra först räknas som upptaget nummer (044h1 ⇒ 44)', () => {
  assert.equal(tolka('MATSTRUMP_sushi_jul_ugc_044h1_v1').nummer, 44);
  assert.equal(tolka('MATSTRUMP_sushi_gift_ugc_012v2_v1').nummer, 12);
  assert.equal(nastaNummer([...KONTOT, 'MATSTRUMP_sushi_jul_ugc_047h3_v1']), 48, '047h3 ligger live ⇒ nästa är 048');
});

test('en Draft-brief i hubben upptar sitt nummer lika mycket som en live annons (krocken 2026-09-24/25)', () => {
  // Kontot hade 047 som högsta, hubben bar rond 2:s Draft-briefer 048–053.
  const konto = [...KONTOT, 'MATSTRUMP_sushi_jul_ugc_047h3_v1'];
  const hubb = ['MATSTRUMP_sushi_gift_ugc_048_v1', 'MATSTRUMP_sushi_skamt_ugc_053_v1', 'B_Mini-clip_UGC_04', '026'];
  assert.equal(nastaNummer(konto), 48, 'kontot ensamt säger 048 — det var felet');
  const alla = samlaKandaNamn({ logg: ['MATSTRUMP_sushi_jul_ugc_044h1_v1'], fil: konto, konto, hubb });
  assert.equal(nastaNummer(alla), 54, 'unionen ser Draft-raden 053 ⇒ nästa är 054');
  assert.equal(alla.filter((n) => n === 'MATSTRUMP_sushi_jul_ugc_047h3_v1').length, 1, 'dubbletter bort');
  assert.ok(alla.includes('B_Mini-clip_UGC_04'), 'namn utanför mönstret följer med men flyttar inte numret');
});
