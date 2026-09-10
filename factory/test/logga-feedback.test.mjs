// Loggfeedback-loopen: raden, tillägget och sammanfattningen. Inga filer.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  byggRad, laggTill, sammanfatta, formateraSammanfattning, RUBRIK,
} from '../logga-feedback.mjs';

test('byggRad skriver en tabellrad och vägrar utan val', () => {
  const rad = byggRad({ butik: 'kalender', vald: 'B', motiv: 'lucka', kommentar: 'lucka|fin', datum: '2026-09-10' });
  assert.equal(rad, '| 2026-09-10 | kalender | b | lucka | lucka/fin |');
  assert.throws(() => byggRad({ butik: 'kalender', vald: 'd', datum: '2026-09-10' }), /Okänd variant/);
  assert.throws(() => byggRad({ butik: 'kalender', vald: 'a', datum: 'igår' }), /datum/);
});

test('laggTill sätter rubriken först på en tom fil och lägger raden sist', () => {
  const rad = byggRad({ butik: 'tankguard', vald: 'a', datum: '2026-09-08' });
  const forsta = laggTill('', rad);
  assert.ok(forsta.startsWith(RUBRIK));
  assert.ok(forsta.endsWith(rad + '\n'));
  const andra = laggTill(forsta, byggRad({ butik: 'drytrek', vald: 'a', datum: '2026-09-09' }));
  assert.equal((andra.match(/^# Loggfeedback/gm) ?? []).length, 1, 'rubriken skrivs en gång');
  assert.ok(andra.endsWith('| 2026-09-09 | drytrek | a | droppe |  |\n'));
});

test('sammanfatta räknar per variant och pekar ut vinnare och aldrig valda', () => {
  let t = laggTill('', byggRad({ butik: 'tankguard', vald: 'a', datum: '2026-09-08' }));
  t = laggTill(t, byggRad({ butik: 'drytrek', vald: 'a', datum: '2026-09-09' }));
  t = laggTill(t, byggRad({ butik: 'kalender', vald: 'b', motiv: 'lucka', kommentar: 'luckan syns', datum: '2026-09-10' }));
  const s = sammanfatta(t);
  assert.equal(s.antal, 3);
  assert.deepEqual(s.perVariant, { a: 2, b: 1, c: 0 });
  assert.equal(s.vinnare, 'a');
  assert.deepEqual(s.aldrigValda, ['c']);
  assert.equal(s.perMotiv.lucka, 1);
  const text = formateraSammanfattning(s);
  assert.match(text, /Oftast vald: a/);
  assert.match(text, /Aldrig vald: c/);
  assert.match(text, /kalender \(b\): luckan syns/);
});

test('tom logg ger en tydlig mening, ingen vinnare', () => {
  const s = sammanfatta('');
  assert.equal(s.vinnare, null);
  assert.match(formateraSammanfattning(s), /Ingen loggfeedback/);
});
