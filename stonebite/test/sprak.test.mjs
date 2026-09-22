// Tester för språklagret. VA:erna och redigerarna läser engelska — får de en
// svensk sida använder de den inte, och då betalas ingen bonus ut.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { oversatt, tolk, sprakFor, SPRAKEN, ORDBOK } from '../sprak.mjs';
import { sattSprak, sprak, t, kort, tabell, block } from '../vy/delar.mjs';
import { SIDOR, ROLLER, ROLLNYCKLAR } from '../roller.mjs';

const ROT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

test('svenska går rakt igenom, engelska slås upp', () => {
  assert.equal(oversatt('Min sida', 'sv'), 'Min sida');
  assert.equal(oversatt('Min sida', 'en'), 'My page');
  assert.equal(tolk('en')('Bonus'), 'Bonus');
});

test('en mening utan översättning blir svensk, aldrig tom', () => {
  assert.equal(oversatt('En mening ingen har översatt', 'en'), 'En mening ingen har översatt');
  assert.equal(oversatt('', 'en'), '');
  assert.equal(oversatt(null, 'en'), null);
});

test('språket följer rollen, men eget val vinner', () => {
  assert.equal(sprakFor({ roll: 'agare' }), 'sv');
  assert.equal(sprakFor({ roll: 'chef' }), 'sv');
  assert.equal(sprakFor({ roll: 'va' }), 'en');
  assert.equal(sprakFor({ roll: 'redigerare' }), 'en');
  assert.equal(sprakFor({ roll: 'produkttest' }), 'en');
  assert.equal(sprakFor({ roll: 'support_chef' }), 'en');
  assert.equal(sprakFor({ roll: 'va', sprak: 'sv' }), 'sv', 'eget val vinner');
  assert.equal(sprakFor({ roll: 'agare', sprak: 'en' }), 'en');
  assert.equal(sprakFor({ roll: 'va', sprak: 'klingon' }), 'en', 'okänt språk ⇒ rollens förval');
});

test('varje sida i menyn står i ordboken', () => {
  // Några ord är identiska på båda språken ("Bonus") — det som räknas är att
  // raden FINNS, inte att den skiljer sig.
  for (const s of SIDOR) {
    assert.ok(Object.hasOwn(ORDBOK, s.titel), `"${s.titel}" saknas i ordboken`);
  }
});

test('varje roll har engelskt namn och beskrivning', () => {
  for (const nyckel of ROLLNYCKLAR) {
    const r = ROLLER[nyckel];
    assert.ok(Object.hasOwn(ORDBOK, r.namn), `rollnamnet "${r.namn}" saknas i ordboken`);
    assert.ok(Object.hasOwn(ORDBOK, r.beskrivning), `beskrivningen för ${nyckel} saknas i ordboken`);
  }
});

test('komponenterna översätter sina egna etiketter — men aldrig datan', () => {
  sattSprak('en');
  assert.equal(sprak(), 'en');
  const html = kort({ etikett: 'Intjänat', varde: '$25,00', forklaring: 'Betalas ut med lönen.' });
  assert.match(html, /Earned/);
  assert.match(html, /Paid out with your salary/);
  assert.match(html, /\$25,00/, 'värdet ska stå kvar orört');
  assert.doesNotMatch(html, /Intjänat/);
  sattSprak('sv');
});

test('tabellrubriker översätts, radernas innehåll rörs inte', () => {
  sattSprak('en');
  const html = tabell([{ titel: 'Person' }, { titel: 'Belopp', tal: true }], ['<tr><td>Bäverbutiken</td><td>100</td></tr>']);
  assert.match(html, /<th>Person<\/th>/);
  assert.match(html, /Amount/);
  assert.match(html, /Bäverbutiken/, 'butiksnamnet är data och ska inte översättas');
  sattSprak('sv');
});

test('språket går tillbaka till svenska när det sätts om', () => {
  sattSprak('en');
  assert.equal(t('Min sida'), 'My page');
  sattSprak('sv');
  assert.equal(t('Min sida'), 'Min sida');
  sattSprak('något annat');
  assert.equal(sprak(), 'sv', 'okänt språk faller tillbaka på svenska');
});

test('varje bonusuppdrag har en engelsk version', () => {
  const regler = JSON.parse(readFileSync(join(ROT, 'bonus', 'regler.json'), 'utf8'));
  for (const [id, program] of Object.entries(regler.program)) {
    assert.ok(program.en?.namn, `programmet ${id} saknar engelskt namn`);
    assert.ok(program.en?.beskrivning?.length > 20, `programmet ${id} saknar engelsk beskrivning`);
    for (const u of program.uppdrag) {
      assert.ok(u.en?.namn, `${u.id} saknar engelskt namn`);
      assert.ok(u.en?.hur?.length > 20, `${u.id} saknar engelsk "hur"`);
      assert.ok(u.en?.mats?.length > 10, `${u.id} saknar engelsk "mats"`);
      assert.ok(u.en?.enhet, `${u.id} saknar engelsk enhet`);
    }
  }
});

test('mallen som ska ge recensioner finns på båda språken', () => {
  const regler = JSON.parse(readFileSync(join(ROT, 'bonus', 'regler.json'), 'utf8'));
  const recension = regler.program.va.uppdrag.find((u) => u.id === 'recension_med_namn');
  assert.ok(recension.mall?.sv?.length > 60, 'svensk mall saknas');
  assert.ok(recension.mall?.en?.length > 60, 'engelsk mall saknas');
  assert.match(recension.mall.sv, /namn/i, 'mallen måste be kunden skriva namnet');
  assert.match(recension.mall.en, /name/i);
});

test('ordboken har inga tomma översättningar', () => {
  for (const [sv, en] of Object.entries(ORDBOK)) {
    assert.ok(sv.trim().length > 0, 'tom nyckel i ordboken');
    assert.ok(String(en).trim().length > 0, `"${sv}" har tom översättning`);
  }
  assert.deepEqual(Object.keys(SPRAKEN), ['sv', 'en']);
});
