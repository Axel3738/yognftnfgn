// Tester för egna/dubba.mjs — CSV:n till ElevenLabs manuella läge och SRT:n (ren logik, inget nät).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggCsv, byggSrt, SPRAKKOD } from '../egna/dubba.mjs';

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
  assert.equal(Object.keys(SPRAKKOD).length, 11);
  assert.equal(SPRAKKOD.NO, 'no');
});
