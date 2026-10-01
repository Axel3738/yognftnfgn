// Ordkollen: manus mot vad rösten faktiskt säger.
//
// Talen i testerna är mätta 2026-10-01 på den norska rösten
// `Martin - Clear and Comforting` (eleven_v3) — se huvudet i ordkoll.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalisera, ord, lasSrt, jamfor } from '../ordkoll.mjs';

const o = (text, start, slut) => ({ text, start, slut });

test('bindestreck är inte ett ord — "åtti-ni" och "åtti ni" är samma uppläsning', () => {
  // Utan den här regeln fick en PERFEKT uppläst prisrad 12 fel av 15 ord,
  // eftersom bindestrecket förcköt hela jämförelsen (mätt 2026-10-01).
  assert.deepEqual(ord('ett tusen hundre og åtti-ni kroner'),
                   ord('ett tusen hundre og åtti ni kroner'));
});

test('skiljetecken och versaler räknas aldrig som felläsning', () => {
  assert.equal(normalisera('Hele takflaten, 6,5 × 3 m.'), normalisera('hele takflaten 6,5 × 3 m'));
});

test('fångar det riktiga felet: Taket lästes som Pake', () => {
  const cues = [{ nr: 1, start: 0, slut: 3, text: 'Taket han aldri sjekker.' }];
  const hord = [o('Pake', 0.1, 0.5), o('han', 0.55, 0.7), o('aldri', 0.72, 1.0), o('sjekker', 1.02, 1.5)];
  const r = jamfor(cues, hord);
  assert.equal(r[0].avvikelser.length, 1);
  assert.deepEqual(r[0].avvikelser[0], { vantat: 'taket', hord: 'pake' });
});

test('en korrekt uppläst replik ger noll avvikelser', () => {
  const cues = [{ nr: 1, start: 0, slut: 3, text: 'Taket han aldri sjekker.' }];
  const hord = [o('Taket', 0.1, 0.5), o('han', 0.55, 0.7), o('aldri', 0.72, 1.0), o('sjekker.', 1.02, 1.5)];
  assert.equal(jamfor(cues, hord)[0].avvikelser.length, 0);
});

test('ett tappat ord syns som ett avvikande ord, inte som tystnad', () => {
  const cues = [{ nr: 1, start: 0, slut: 3, text: 'ikke tynn presenning' }];
  const hord = [o('ikke', 0.1, 0.4), o('tynn', 0.45, 0.8)];
  const r = jamfor(cues, hord);
  assert.deepEqual(r[0].avvikelser, [{ vantat: 'presenning', hord: '—' }]);
});

test('ord strax utanför cue-fönstret räknas med — rösten flyttar gränsen', () => {
  const cues = [{ nr: 1, start: 1.0, slut: 2.0, text: 'tre meter' }];
  const hord = [o('tre', 0.8, 1.1), o('meter', 1.9, 2.3)];
  assert.equal(jamfor(cues, hord)[0].avvikelser.length, 0);
});

test('ord i en ANNAN cue blandas inte in', () => {
  const cues = [
    { nr: 1, start: 0, slut: 1.5, text: 'Taket han aldri sjekker' },
    { nr: 2, start: 5.0, slut: 6.5, text: 'Fra ett tusen hundre og åtti-ni kroner' },
  ];
  const hord = [
    o('Taket', 0.1, 0.4), o('han', 0.45, 0.6), o('aldri', 0.62, 0.9), o('sjekker', 0.92, 1.4),
    o('Fra', 5.1, 5.3), o('ett', 5.32, 5.5), o('tusen', 5.52, 5.8), o('hundre', 5.82, 6.0),
    o('og', 6.02, 6.1), o('åtti', 6.12, 6.3), o('ni', 6.32, 6.4), o('kroner', 6.42, 6.5),
  ];
  const r = jamfor(cues, hord);
  assert.equal(r[0].avvikelser.length, 0, 'cue 1 ren');
  assert.equal(r[1].avvikelser.length, 0, 'cue 2 ren trots bindestrecket');
});

test('SRT läses med tider och löpnummer', () => {
  const srt = '1\n00:00:00,000 --> 00:00:01,400\nTaket han aldri sjekker.\n\n'
            + '2\n00:00:02,100 --> 00:00:03,400\nFra 1 189 kroner.\n';
  const c = lasSrt(srt);
  assert.equal(c.length, 2);
  assert.equal(c[0].nr, 1);
  assert.equal(c[1].start, 2.1);
  assert.equal(c[1].text, 'Fra 1 189 kroner.');
});

test('en tom SRT ger inga cues i stället för att krascha', () => {
  assert.deepEqual(lasSrt(''), []);
});
