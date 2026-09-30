// Tester för egna/dubba.mjs — CSV:n (kontrollen av segmenten), SRT:n, tidsfönstren och farten (ren logik, inget nät).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggCsv, byggSrt, SPRAKKOD, fonster, fartFor, froFor, klippNyckel, RÖST, röstFor } from '../egna/dubba.mjs';

const manus = [
  { a: 0, b: 2.5, sv: 'Hej, "du".' },
  { a: 3, b: 5.25, sv: 'Klicka på länken.' },
  { a: 5.5, b: 6, sv: 'Matstrumpor.se', stryk: true },
];
const lok = { segment: [{ a: 0, b: 2.5, sv: 'Hej, "du".', text: 'Hi, "you".' }, { a: 3, b: 5.25, sv: 'Klicka på länken.', text: 'Tap the link.' }] };

test('byggCsv: en rad per segment, strukna utelämnade, citattecken dubblade, sekunder med tre decimaler', () => {
  const csv = byggCsv(manus, lok).trim().split('\n');
  assert.equal(csv[0], 'speaker,start_time,end_time,transcription,translation');
  assert.equal(csv.length, 3);
  assert.equal(csv[1], '"Berattare","0.000","2.500","Hej, ""du"".","Hi, ""you""."');
  assert.equal(csv[2], '"Berattare","3.000","5.250","Klicka på länken.","Tap the link."');
});

test('byggCsv: fel antal segment eller flyttade tider stoppar', () => {
  assert.throws(() => byggCsv(manus, { segment: lok.segment.slice(0, 1) }), /1 segment mot 2/);
  const flyttad = { segment: [lok.segment[0], { ...lok.segment[1], a: 3.2 }] };
  assert.throws(() => byggCsv(manus, flyttad), /tiderna/);
});

test('byggSrt och språkkoderna', () => {
  assert.equal(byggSrt(lok), '1\n00:00:00,000 --> 00:00:02,500\nHi, "you".\n\n2\n00:00:03,000 --> 00:00:05,250\nTap the link.\n');
  assert.equal(Object.keys(SPRAKKOD).length, 13);
  assert.equal(SPRAKKOD.NO, 'no');
  assert.equal(SPRAKKOD.JP, 'ja');
  assert.equal(SPRAKKOD.TW, 'zh');
});

test('fonster: segmentet får tiden fram till nästa segment, ett struket segment är en gräns, sista till slutet', () => {
  const f = fonster(manus, lok, 10);
  assert.deepEqual(f, [{ a: 0, max: 3 }, { a: 3, max: 2.5 }]);
  assert.deepEqual(fonster(manus.slice(0, 2), lok, 6), [{ a: 0, max: 3 }, { a: 3, max: 2.65 }]);
});

test('fartFor: orört när klippet ryms, annars lite snabbare men aldrig över 1,2', () => {
  assert.equal(fartFor(2, 3), 1);
  assert.equal(fartFor(3.3, 3), 1.133);
  assert.equal(fartFor(6, 3), 1.2);
});

test('klippNyckel: klonens nyckel är oförändrad (cachen för elva språk håller), en annan röst ger en annan nyckel', () => {
  const x = { rost: RÖST, modell: 'eleven_multilingual_v2', fart: 1, prev: 'a', text: 'b', next: 'c' };
  assert.equal(klippNyckel(x), 'eleven_multilingual_v2|1|a|b|c');
  assert.notEqual(klippNyckel({ ...x, rost: 'annanRost' }), klippNyckel(x));
  assert.equal(röstFor('DE'), RÖST);
});

test('froFor: tagning 1 behåller det gamla fröet (godkända klipp står kvar), tagning 2 ger ett nytt, --om ett eget', () => {
  assert.equal(froFor(), 29);
  assert.equal(froFor(1), 29);
  assert.equal(froFor(1, true), 30);
  assert.equal(froFor(2), 1029);
  assert.notEqual(froFor(2), froFor(1, true));
  assert.equal(froFor(0), 29, 'en tagning under 1 räknas som 1');
});

test('röstFor: en röst per video går före marknadens — japanska s001h1 har Kyoko, haikuh3 klonen; Danmark Freja', () => {
  assert.equal(röstFor('JP', 's001h1'), '4lOQ7A2l7HPuG7UIHiKA');
  assert.equal(röstFor('JP', 'haikuh3'), RÖST);
  assert.equal(röstFor('DK', 'haikuh2'), 'h5TGSgjuArqhPBRRe0mM');
  assert.equal(röstFor('DE', 's001h1'), RÖST);
  assert.equal(röstFor('TW'), '9lHjugDhwqoxA5MhX0az');
});
