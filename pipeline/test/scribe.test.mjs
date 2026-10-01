// SRT-byggaren i pipeline/scribe.mjs. Inget nät — bara ord med tider in, cues ut.
//
// Varför det här är värt ett test: cue-TIDERNA är det `elevenlabs-omdubb.mjs`
// bygger om filmen kring. Bryter vi på fel ställe blir repliken fel lång, och
// då fördelas bildrutorna fel i den färdiga videon.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tillSrt } from '../scribe.mjs';

const ord = (...par) => par.map(([text, start, slut]) => ({ text, start, slut }));

test('bryter på meningsslut', () => {
  const srt = tillSrt(ord(['Taket', 0, 0.4], ['han', 0.45, 0.6], ['sjekker.', 0.62, 1.0],
    ['Fra', 1.1, 1.3], ['1189', 1.32, 1.9], ['kroner.', 1.92, 2.3]));
  const cues = srt.trim().split('\n\n');
  assert.equal(cues.length, 2);
  assert.match(cues[0], /Taket han sjekker\./);
  assert.match(cues[1], /Fra 1189 kroner\./);
});

test('bryter på paus ≥ 0,55 s även mitt i en mening', () => {
  const srt = tillSrt(ord(['Hele', 0, 0.3], ['takflaten', 0.32, 0.9], ['og', 2.0, 2.2], ['mer', 2.22, 2.5]));
  assert.equal(srt.trim().split('\n\n').length, 2);
});

test('tidsformatet är SRT med komma som decimaltecken', () => {
  const srt = tillSrt(ord(['Ja.', 1.5, 2.25]));
  assert.match(srt, /00:00:01,500 --> 00:00:02,250/);
});

test('timmar räknas rätt över en minut', () => {
  const srt = tillSrt(ord(['Sent.', 3661.125, 3661.5]));
  assert.match(srt, /01:01:01,125/);
});

test('en lång replik utan skiljetecken delas på teckengränsen', () => {
  const langa = Array.from({ length: 30 }, (_, i) => [`ord${i}`, i * 0.3, i * 0.3 + 0.25]);
  const cues = tillSrt(ord(...langa)).trim().split('\n\n');
  assert.ok(cues.length > 1, 'ska delas');
  for (const c of cues) {
    const text = c.split('\n').slice(2).join(' ');
    assert.ok(text.length <= 100, `cue för lång: ${text.length}`);
  }
});

test('inga ord ger en tom SRT i stället för att krascha', () => {
  assert.equal(tillSrt([]), '');
});

test('cue-numren är löpande från 1', () => {
  const srt = tillSrt(ord(['Ett.', 0, 0.5], ['Två.', 1.6, 2.0], ['Tre.', 3.2, 3.6]));
  assert.deepEqual(srt.trim().split('\n\n').map((c) => c.split('\n')[0]), ['1', '2', '3']);
});
