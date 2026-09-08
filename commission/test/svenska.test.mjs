import test from 'node:test';
import assert from 'node:assert/strict';
import { arSvensk, bedomCommission, gerCommission, UTLANDSKA_KONTON } from '../berakning.mjs';
import { laddaRegister } from '../../tools/hubbregister.mjs';

const SE = { id: '1867947880635861', namn: 'MagiBorsten', valuta: 'SEK' };
const SNARK = { id: '1346450049878358', namn: 'SnarkLös', valuta: 'SEK' };
const NO = { id: '1050941584152547', namn: 'Magiborsten NO', valuta: 'SEK' };
const MX = { id: '918424617391896', namn: 'Snark mexico', valuta: 'SEK' };
// MagiBorsten DK — delat konto: OPS-fabriken OCH Bäverbutikens danska annonser.
const DK = { id: '915422744950975', namn: 'Magiborsten DK', valuta: 'SEK' };

const annons = (adNamn, konto = SE) => ({ adId: 'x', adNamn, spend: 100, konto });

test('svenska annonser i svenska konton räknas', () => {
  assert.equal(arSvensk(annons('Enginecover_PD_22_H1')), true);
  assert.equal(arSvensk(annons('Motorhölje_PD_1_H3')), true);
  assert.equal(arSvensk(annons('Seatcover_PD_1_3_H1')), true);
  assert.equal(arSvensk(annons('Vid Dom är mjuka och sköna – kopia', SNARK)), true);
});

test('utländska marknadskonton räknas aldrig', () => {
  assert.equal(arSvensk(annons('Trimmerbelt_PD_3_H1', NO)), false);
  assert.equal(arSvensk(annons('vad som helst', MX)), false);
  // Alla nio marknadskonton ska vara spärrade.
  for (const id of UTLANDSKA_KONTON.keys()) {
    assert.equal(arSvensk(annons('Enginecover_PD_1_H1', { id, namn: 'x', valuta: 'SEK' })), false);
  }
});

test('marknadskod i namnet räknas inte, inte ens i ett svenskt konto', () => {
  assert.equal(arSvensk(annons('NO_Trimmerbelt_PD_3_H1')), false);
  assert.equal(arSvensk(annons('Fiskespöhållare_SP_2_1_UK')), false);
  assert.equal(arSvensk(annons('Kjempefotball_NO_CS_1')), false);
  assert.equal(arSvensk(annons('DK_Trimmerbelt_PD_3_H1')), false);
});

test('konceptkoderna i namnkonventionen misstas aldrig för marknader', () => {
  // SO, SP, PD, CS, GT, CI, UG är vinklar — inte länder.
  for (const kod of ['SO', 'SP', 'PD', 'CS', 'GT', 'CI', 'UG']) {
    assert.equal(arSvensk(annons(`Enginecover_${kod}_5_1`)), true, `${kod} ska räknas som svensk`);
  }
});

// ---------------------------------------------------- filtret per brandprefix

const reg = laddaRegister();

test('utan register beter sig bedömningen exakt som kontospärren', () => {
  assert.equal(gerCommission(annons('Enginecover_PD_1_H1')), true);
  assert.equal(gerCommission(annons('Enginecover_PD_1_H1', DK)), false);
  assert.equal(gerCommission(annons('vad som helst', MX)), false);
  assert.equal(gerCommission(annons('NO_Trimmerbelt_PD_3_H1')), false);
});

test('OPS-butikens annonser ger commission trots att kontot är spärrat', () => {
  const d = bedomCommission(annons('HeimGuard_TR_1_H1', DK), reg);
  assert.equal(d.ger, true);
  assert.equal(d.butik.id, 'heimguard');
});

test('Bäverbutikens danska annonser i SAMMA konto ger fortfarande noll', () => {
  // Axels beslut 2026-08-31 står kvar: bara svenska annonser betalas ut.
  // Prefixet enginecover hör till butiken baverbutiken, vars konto är ett annat
  // — matchningen faller alltså igenom till kontospärren.
  const d = bedomCommission(annons('Enginecover_PD_1_H1', DK), reg);
  assert.equal(d.ger, false);
  assert.match(d.skal, /utländskt marknadskonto/);
  // Och en helt okänd creative i DK-kontot ger också noll.
  assert.equal(gerCommission(annons('Nagotnytt_PD_1_H1', DK), reg), false);
});

test('marknadskod i namnet slår ut även en OPS-butiks annons', () => {
  // OPS-butikernas norska annonser: Axels beslut saknas (FAS2 uppdrag F).
  // Tills det finns är svaret nej — spärren rivs aldrig på gissning.
  const d = bedomCommission(annons('HeimGuard_NO_TR_1_H1', DK), reg);
  assert.equal(d.ger, false);
  assert.equal(d.skal, 'marknadskod i annonsnamnet');
});

test('registret ändrar ingenting för Bäverbutiken och Grillkliniken', () => {
  for (const namn of ['Enginecover_PD_22_H1', 'Motorhölje_PD_1_H3', 'Seatcover_PD_1_3_H1']) {
    assert.equal(gerCommission(annons(namn), reg), arSvensk(annons(namn)), namn);
  }
  assert.equal(gerCommission(annons('235 H1', SNARK), reg), true);
  assert.equal(gerCommission(annons('Vid Dom är mjuka och sköna – kopia', SNARK), reg), true);
  for (const id of UTLANDSKA_KONTON.keys()) {
    if (id === '915422744950975') continue;      // delat konto, testas ovan
    assert.equal(gerCommission(annons('Enginecover_PD_1_H1', { id, namn: 'x', valuta: 'SEK' }), reg), false);
  }
});
