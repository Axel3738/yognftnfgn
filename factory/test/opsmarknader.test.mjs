// Tester för factory/opsmarknader.mjs — annonsmarknaderna per OPS-butik
// (konto per marknad, målnamn, landningslänk, Approved-regeln). Ren logik.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  OPS_MARKNADER, OPS_MARKNADSKODER, marknadFor, kontoFor, arOpsMarknad, oversattningsmarknader,
  marknadsNamn, lankFor, domanUrButik, skaFlyttasTillApproved, annonsmarknaderUr,
  domanForMarknad, marknadslank,
} from '../opsmarknader.mjs';

test('domanForMarknad + marknadslank: marknadens egen domän utan språkmapp, annars butikens med /locale/ (carashell.com för USA 2026-09-16)', () => {
  const butik = { butik: { supportmail: 'hello@carashell.se', marknader: [{ land: 'NO', locale: 'nb' }, { land: 'US', locale: 'en', doman: 'https://carashell.com/' }] } };
  assert.deepEqual(domanForMarknad(butik, 'US'), { doman: 'carashell.com', egen: true });
  assert.deepEqual(domanForMarknad(butik, 'NO'), { doman: 'carashell.se', egen: false });
  assert.equal(marknadslank(butik, { handle: 'takskyddet', kod: 'US' }), 'https://carashell.com/products/takskyddet?country=US');
  assert.equal(marknadslank(butik, { handle: 'takskyddet', kod: 'NO' }), 'https://carashell.se/nb/products/takskyddet?country=NO');
  assert.equal(marknadslank(butik, { handle: 'takskyddet', kod: 'SE' }), 'https://carashell.se/products/takskyddet');
});
import { annonskontoFor, OPS_ANNONSKONTO } from '../register.mjs';
import { MARKNADSKODER, marknadskoderI, filtreraPaMarknad } from '../skalning.mjs';

test('USA ligger i Magiborsten UK, SE och NO i OPS-kontot — kontot är per marknad, kontrollerat på id', () => {
  assert.deepEqual(OPS_MARKNADSKODER, ['SE', 'NO', 'US']);
  assert.equal(kontoFor('US'), '1107817401910319');
  assert.equal(kontoFor('NO'), '915422744950975');
  assert.equal(kontoFor('se'), '915422744950975');
  assert.equal(OPS_MARKNADER.US.kontonamn, 'Magiborsten UK');
  assert.equal(OPS_MARKNADER.US.heygen_sprak, 'English (United States)');
  assert.equal(OPS_MARKNADER.US.locale, 'en');
  assert.equal(OPS_MARKNADER.US.valuta, 'USD');
  assert.deepEqual(OPS_MARKNADER.US.geo, ['US']);
  assert.throws(() => marknadFor('DK'), /Okänd OPS-marknad "DK"/);
  assert.equal(arOpsMarknad('us'), true);
  assert.equal(arOpsMarknad('XX'), false);
  assert.deepEqual(oversattningsmarknader(), ['NO', 'US']);
});

test('annonskontoFor: OPS-posten har OPS-kontot som identitet men målet är marknadens konto', () => {
  const post = { nyckel: 'carashell/takskyddet', lage: 'skala', ad_account_id: OPS_ANNONSKONTO };
  assert.equal(annonskontoFor(post, 'SE'), OPS_ANNONSKONTO);
  assert.equal(annonskontoFor(post, 'NO'), OPS_ANNONSKONTO);
  assert.equal(annonskontoFor(post, 'US'), '1107817401910319');
  // Fel baskonto stoppar innan marknaden ens läses.
  assert.throws(() => annonskontoFor({ ...post, ad_account_id: '1867947880635861' }, 'US'), /Bäverbutikens konto/);
});

test('marknadsNamn: prefix + _US_ + resten; redan märkt lämnas; annan marknads kod byts aldrig om', () => {
  assert.equal(marknadsNamn('HeimGuard_SP_2_1', 'US'), 'HeimGuard_US_SP_2_1');
  assert.equal(marknadsNamn('HeimGuard_SP_2_1', 'NO'), 'HeimGuard_NO_SP_2_1');
  assert.equal(marknadsNamn('HeimGuard_SP_2_1', 'SE'), 'HeimGuard_SP_2_1');
  assert.equal(marknadsNamn('HeimGuard_US_SP_2_1', 'US'), 'HeimGuard_US_SP_2_1');
  assert.equal(marknadsNamn('HeimGuard_NO_SP_2_1', 'US'), null, 'en NO-rad är inte en US-rad');
  assert.equal(marknadsNamn('HeimGuard', 'US'), null);
  assert.equal(marknadsNamn('HeimGuard_SP_2_1 – COPY ONLY', 'US'), 'HeimGuard_US_SP_2_1');
});

test('lankFor: marknadens språk + ?country= — SE utan prefix', () => {
  assert.equal(lankFor({ doman: 'carashell.se', handle: 'takskyddet', kod: 'US' }), 'https://carashell.se/en/products/takskyddet?country=US');
  assert.equal(lankFor({ doman: 'https://carashell.se/', handle: 'takskyddet', kod: 'NO' }), 'https://carashell.se/nb/products/takskyddet?country=NO');
  assert.equal(lankFor({ doman: 'carashell.se', handle: 'takskyddet', kod: 'SE' }), 'https://carashell.se/products/takskyddet');
  assert.throws(() => lankFor({ doman: '', handle: 'x', kod: 'US' }), /doman/);
  assert.equal(domanUrButik({ butik: { supportmail: 'hello@carashell.se' } }), 'carashell.se');
  assert.throws(() => domanUrButik({ butik: {} }), /supportmail/);
});

test('skaFlyttasTillApproved: bara när varje ANNAN översättningsmarknad redan bär annonsen', () => {
  assert.equal(skaFlyttasTillApproved({}, ['NO'], 'NO'), true, 'ensam marknad: flytta');
  assert.equal(skaFlyttasTillApproved({ NO: false }, ['NO', 'US'], 'US'), false, 'NO saknas → stanna');
  assert.equal(skaFlyttasTillApproved({ NO: true }, ['NO', 'US'], 'US'), true);
  assert.equal(skaFlyttasTillApproved({ US: true }, ['NO', 'US'], 'NO'), true);
  assert.equal(skaFlyttasTillApproved({}, ['NO', 'US'], 'NO'), false, 'US okänd → stanna');
  assert.equal(skaFlyttasTillApproved({ NO: true }, ['SE', 'NO', 'US'], 'US'), true, 'SE räknas aldrig');
});

test('annonsmarknaderUr: normaliserar, slänger SE och okända, standard NO', () => {
  assert.deepEqual(annonsmarknaderUr('NO,US'), ['NO', 'US']);
  assert.deepEqual(annonsmarknaderUr(['us', 'SE', 'no', 'xx']), ['US', 'NO']);
  assert.deepEqual(annonsmarknaderUr(undefined), ['NO']);
  assert.deepEqual(annonsmarknaderUr(''), ['NO']);
});

test('skalning känner US som marknadskod — en _US_-annons filtreras till US, aldrig till SE', () => {
  assert.ok(MARKNADSKODER.includes('US'));
  assert.deepEqual(marknadskoderI('CaraShellRoof_US_PD_4_1'), ['US']);
  const rader = [{ campaign_name: 'CARASHELL_US_Taköverdraget', ad_name: 'CaraShellRoof_US_PD_4_1' }, { campaign_name: 'CARASHELL_SE_X', ad_name: 'CaraShellRoof_PD_4_1' }];
  assert.equal(filtreraPaMarknad(rader, 'US').behall.length, 1);
  assert.equal(filtreraPaMarknad(rader, 'SE').behall.length, 1);
  assert.deepEqual(filtreraPaMarknad(rader, 'SE').bortfiltrerade, { US: 1 });
});
