import test from 'node:test';
import assert from 'node:assert/strict';
import { arSvensk, UTLANDSKA_KONTON } from '../berakning.mjs';

const SE = { id: '1867947880635861', namn: 'MagiBorsten', valuta: 'SEK' };
const SNARK = { id: '1346450049878358', namn: 'SnarkLös', valuta: 'SEK' };
const NO = { id: '1050941584152547', namn: 'Magiborsten NO', valuta: 'SEK' };
const MX = { id: '918424617391896', namn: 'Snark mexico', valuta: 'SEK' };

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
