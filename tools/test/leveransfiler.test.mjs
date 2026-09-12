// Spärren som hindrar att brief-mappens videor laddas upp under annonsens namn.
// Mätt 2026-09-12 på Batmotor_GT_3_H1: leveransmappen ("Finished Ad") var tom,
// brief-mappen bar tolv batch-1-videor, och den gamla regeln "första mappen med
// media vinner" hämtade dem och döpte om dem till annonsnamnet.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { valjLeveransfiler, matcharAnnonsnamn, ÄR_BRIEFMAPP } from '../notion-kalla.mjs';

const fil = (titel, id = titel) => ({ typ: 'fil', id, titel });
const BRIEF = { id: 'brief', typ: 'mapp', kontext: 'Drive folder: https://drive.google.com/…' };
const LEVERANS = { id: 'levererat', typ: 'mapp', kontext: 'Finished Ad — https://drive.google.com/…' };

test('matcharAnnonsnamn struntar i skiftläge, understreck och ändelse', () => {
  assert.equal(matcharAnnonsnamn('Batmotor_GT_3_H1.mp4', 'Batmotor_GT_3_H1'), true);
  assert.equal(matcharAnnonsnamn('batmotor gt 3 h1.MOV', 'Batmotor_GT_3_H1'), true);
  assert.equal(matcharAnnonsnamn('Båtmotorskydd_CS_1_H1.mp4', 'Batmotor_GT_3_H1'), false);
  assert.equal(matcharAnnonsnamn('Batmotor_GT_3_H1.mp4', ''), false);
});

test('ÄR_BRIEFMAPP känner igen brief-mappens sammanhang', () => {
  assert.equal(ÄR_BRIEFMAPP('Drive folder: https://…'), true);
  assert.equal(ÄR_BRIEFMAPP('Brief in Drive'), true);
  assert.equal(ÄR_BRIEFMAPP('Finished Ad — https://…'), false);
  assert.equal(ÄR_BRIEFMAPP('Link for approval: https://…'), false);
});

test('tom leveransmapp + full brief-mapp ger INGEN fil', () => {
  const lista = (id) => (id === 'brief'
    ? ['CS_1_H1', 'GT_1_H1', 'PD_1_H1'].map(n => fil(`Båtmotorskydd_${n}.mp4`))
    : []);
  assert.deepEqual(valjLeveransfiler([LEVERANS, BRIEF], 'Batmotor_GT_3_H1', lista), []);
});

test('leveransmappen väljs på filnamnet, inte på ordningen', () => {
  const lista = (id) => (id === 'brief'
    ? [fil('Båtmotorskydd_CS_1_H1.mp4')]
    : [fil('Batmotor_GT_3_H1.mp4', 'rätt'), fil('Batmotor_SP_9_H1.mp4', 'fel')]);
  const ut = valjLeveransfiler([BRIEF, LEVERANS], 'Batmotor_GT_3_H1', lista);
  assert.deepEqual(ut.map(f => f.id), ['rätt']);
});

test('en ensam fil i leveransmappen godtas även utan namnmatchning', () => {
  const lista = () => [fil('export_final_v2.mp4', 'ensam')];
  const ut = valjLeveransfiler([LEVERANS], 'Batmotor_GT_3_H1', lista);
  assert.deepEqual(ut.map(f => f.id), ['ensam']);
});

test('en ensam fil i BRIEF-mappen godtas inte utan namnmatchning', () => {
  const lista = () => [fil('storyboard.mp4', 'ensam')];
  assert.deepEqual(valjLeveransfiler([BRIEF], 'Batmotor_GT_3_H1', lista), []);
});

test('brief-mappen får leverera om filen faktiskt heter som annonsen', () => {
  const lista = () => [fil('Batmotor_GT_3_H1.mp4', 'rätt'), fil('annat.mp4', 'fel')];
  const ut = valjLeveransfiler([BRIEF], 'Batmotor_GT_3_H1', lista);
  assert.deepEqual(ut.map(f => f.id), ['rätt']);
});

test('direktlänkad fil är alltid leveransen', () => {
  const ut = valjLeveransfiler([{ id: 'direkt', typ: 'fil', kontext: '' }], 'Damasker_PD_8_H1', () => []);
  assert.equal(ut.length, 1);
  assert.equal(ut[0].direkt, true);
  assert.equal(ut[0].titel, 'Damasker_PD_8_H1.mp4');
});

test('en mapp som inte går att lista fäller inte de andra', () => {
  const lista = (id) => { if (id === 'trasig') throw new Error('403'); return [fil('Batmotor_GT_3_H1.mp4', 'rätt')]; };
  const ut = valjLeveransfiler([{ id: 'trasig', typ: 'mapp', kontext: '' }, LEVERANS], 'Batmotor_GT_3_H1', lista);
  assert.deepEqual(ut.map(f => f.id), ['rätt']);
});
