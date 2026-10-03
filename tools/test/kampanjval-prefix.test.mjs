// prefixAv: vilka tecken som får stå i ett annonsprefix.
//
// Varje gång tolkaren varit för snäv har färdiga creatives fallit ur
// leveransrundan TYST, och det syns inte som ett fel — bara som en kortare kö.
// Två mätta fall ligger bakom reglerna här:
//   2026-09-15: mönstret var `^([A-Za-z]+)_`, så bindestreck föll bort och
//   Motorcycle Cover-hubbens 13 färdiga creatives syntes aldrig i någon rapport.
//   2026-10-03: å/ä/ö föll bort, så kampanjen "Värmesulorna med Fjärrkontroll"
//   (ACTIVE, 16 live annonser `Värmesulorna_*`) var osynlig från både kontot
//   och hubben, och fyra färdiga bildannonser stod kvar i "To be Reviewed".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prefixAv, prefixKarta } from '../lib/kampanjval.mjs';

test('prefixAv tar bokstäver, siffror och bindestreck', () => {
  assert.equal(prefixAv('Rodholder_PD_11_H1'), 'rodholder');
  assert.equal(prefixAv('MC-Kapell_OF_4_1'), 'mc-kapell');
  assert.equal(prefixAv('CaraShellRoof_BOF_103_1'), 'carashellroof');
});

test('prefixAv tar å, ä och ö — kontot bär dem även om konventionen inte vill det', () => {
  assert.equal(prefixAv('Värmesulorna_FD_4_1'), 'värmesulorna');
  assert.equal(prefixAv('Fågelmatare_LI_1_1'), 'fågelmatare');
  assert.equal(prefixAv('Öppningen_PD_1_1'), 'öppningen');
});

test('prefixAv läser annonsdelen, inte Notion-titelns suffix', () => {
  assert.equal(prefixAv('Värmesulorna_FD_4_1 – COPY ONLY: kort text'), 'värmesulorna');
});

test('prefixAv ger null när namnet inte är ett annonsnamn', () => {
  assert.equal(prefixAv('5.1 Sömnadskit 104 Delar'), null);
  assert.equal(prefixAv('Bordtennisnät Infällbart'), null);
  assert.equal(prefixAv(''), null);
  assert.equal(prefixAv(undefined), null);
});

test('prefixKarta hittar kampanjen för ett prefix med å/ä/ö', () => {
  const kampanj = { id: '120250377836130291', name: 'Värmesulorna med Fjärrkontroll | BE ROAS 1.64', status: 'ACTIVE' };
  const karta = prefixKarta([
    { name: 'Värmesulorna_SP_1_H1', campaign: kampanj },
    { name: 'Värmesulorna_PD_1_H1', campaign: kampanj },
  ]);
  assert.equal(karta['värmesulorna']?.id, '120250377836130291');
});
