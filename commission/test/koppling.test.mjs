import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  nummer, arOversattning, annonsnamn, byggHubbregister, produktAgare, kopplaAnnons,
} from '../koppling.mjs';

const JOSH = '50fdc7d9-a491-45b9-bac4-5315788a616b';
const ANNA = '2cad872b-594c-8168-ba6d-0002611779b8';
const GILZ = '1a4d872b-594c-81d8-adf3-0002a95f9e7f';

const { produkter } = JSON.parse(readFileSync(new URL('../produkter.json', import.meta.url), 'utf8'));
const annons = (adNamn, kampanj = '') => ({ adNamn, kampanj, spend: 100 });

test('löpnumret plockas bara när namnet faktiskt börjar med ett', () => {
  assert.equal(nummer('235 H1'), '235');
  assert.equal(nummer('279 H1 08-11'), '279');
  assert.equal(nummer('128 b2'), '128');
  assert.equal(nummer('B69 LISTICLE'), null);
  assert.equal(nummer('Enginecover_PD_22_H1'), null);
  assert.equal(nummer('Gril 10'), null);
});

test('översättningsrader känns igen', () => {
  assert.equal(arOversattning('129 to norwegian'), true);
  assert.equal(arOversattning('Translation 115'), true);
  assert.equal(arOversattning('140 to TA ENGELSK'), true);
  assert.equal(arOversattning('235'), false);
  assert.equal(arOversattning('Enginecover_PD_22_H1'), false);
});

test('annonsnamnet plockas ur Notion-titelns beskrivning', () => {
  assert.equal(annonsnamn('Trimmerbelt_SP_3_H1 – VIDEO: UGC proof-led'), 'Trimmerbelt_SP_3_H1');
  assert.equal(annonsnamn('Enginecover_PD_1_H6 NO ACCeSS'), 'Enginecover_PD_1_H6');
  assert.equal(annonsnamn('235 H1'), '235 H1');
});

test('en riktig creative slår en översättningsrad med samma nummer', () => {
  const reg = byggHubbregister([{ namn: 'master', rader: [
    { namn: '129 to norwegian', ansvariga: [ANNA] },
    { namn: '129', ansvariga: [JOSH] },
  ] }]);
  assert.deepEqual(reg.perNummer.get('129').ansvariga, [JOSH]);
  assert.equal(reg.oversattningar, 1);
});

test('finns bara en översättningsrad används den ändå', () => {
  const reg = byggHubbregister([{ namn: 'master', rader: [{ namn: '131 to norwegian', ansvariga: [JOSH] }] }]);
  assert.deepEqual(reg.perNummer.get('131').ansvariga, [JOSH]);
});

test('rader utan Ansvarig kommer aldrig in i registret', () => {
  const reg = byggHubbregister([{ namn: 'hub', rader: [
    { namn: 'Enginecover_PD_1_H1', ansvariga: [] },
    { namn: 'Enginecover_PD_2_H1', ansvariga: [JOSH] },
  ] }]);
  assert.equal(reg.rader, 1);
  assert.equal(reg.exakt.has('ENGINECOVER_PD_1_H1'), false);
});

test('båda namnsystemen kopplar', () => {
  const reg = byggHubbregister([
    { namn: 'Boat cover', rader: [{ namn: 'Enginecover_PD_22_H1', ansvariga: [JOSH] }] },
    { namn: 'master', rader: [{ namn: '235', ansvariga: [ANNA] }, { namn: '214 #29', ansvariga: [GILZ] }] },
  ]);
  assert.deepEqual(kopplaAnnons(annons('Enginecover_PD_22_H1'), reg, produkter), { ansvariga: [JOSH], via: 'hubb', radnamn: 'Enginecover_PD_22_H1' });
  assert.equal(kopplaAnnons(annons('235 H1 AJL'), reg, produkter).ansvariga[0], ANNA);
  assert.equal(kopplaAnnons(annons('214 H3'), reg, produkter).ansvariga[0], GILZ);
});

test('produkten är reserv när ingen hubbrad finns', () => {
  const reg = byggHubbregister([]);
  const k = kopplaAnnons(annons('Motorhölje_PD_1_H3', 'Motorhöljet'), reg, produkter);
  assert.equal(k.via, 'produkt');
  assert.equal(k.ansvariga[0], ANNA);
  const j = kopplaAnnons(annons('Axelbälte_PD_1_H1', 'Axelbältet brynis lagris'), reg, produkter);
  assert.equal(j.ansvariga[0], JOSH);
});

test('hubben går före produkten', () => {
  const reg = byggHubbregister([{ namn: 'hub', rader: [{ namn: 'Motorhölje_PD_1_H3', ansvariga: [JOSH] }] }]);
  const k = kopplaAnnons(annons('Motorhölje_PD_1_H3', 'Motorhöljet'), reg, produkter);
  assert.equal(k.via, 'hubb');
  assert.equal(k.ansvariga[0], JOSH);
});

test('kampanjnamnets brus stör inte produktmatchningen', () => {
  assert.equal(produktAgare('Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18', produkter), JOSH);
  assert.equal(produktAgare('Motorhöljet Lagerrensingsrea', produkter), ANNA);
  assert.equal(produktAgare('Motorhöljet ABO-test 08-12', produkter), ANNA);
  assert.equal(produktAgare('Sätesöverdragaren – kopia', produkter), '332d872b-594c-815b-92e8-0002f9c93383');
});

test('okänd kampanj kopplas hellre inte alls än fel', () => {
  assert.equal(produktAgare('Följ bäver', produkter), null);
  assert.equal(produktAgare('Ny Interaktion-kampanj', produkter), null);
  assert.equal(kopplaAnnons(annons('NUNSIIIIIN', 'Mastern'), byggHubbregister([]), produkter), null);
});

test('Kranskydd Frost 420D fastnar inte på Motorhölje via "420D"', () => {
  // 420D är svagt och får aldrig avgöra ensamt.
  assert.equal(produktAgare('Kranskydd Frost 420D | BE ROAS 1.49 | Launch 2026-08-21', produkter), JOSH);
});
