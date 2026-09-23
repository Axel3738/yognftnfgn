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

test('USA ligger i Magiborsten UK, SE/NO/DK i OPS-kontot — kontot är per marknad, kontrollerat på id', () => {
  assert.deepEqual(OPS_MARKNADSKODER, ['SE', 'NO', 'US', 'DK']);
  assert.equal(kontoFor('US'), '1107817401910319');
  assert.equal(kontoFor('NO'), '915422744950975');
  assert.equal(kontoFor('se'), '915422744950975');
  assert.equal(OPS_MARKNADER.US.kontonamn, 'Magiborsten UK');
  assert.equal(OPS_MARKNADER.US.heygen_sprak, 'English (United States)');
  assert.equal(OPS_MARKNADER.US.locale, 'en');
  assert.equal(OPS_MARKNADER.US.valuta, 'USD');
  assert.deepEqual(OPS_MARKNADER.US.geo, ['US']);
  // Danmark 2026-09-20: samma konto som SE och NO trots att kontot HETER
  // "MagiBorsten DK" — namnet är historiskt, kontot är OPS gemensamma.
  assert.equal(kontoFor('DK'), '915422744950975');
  assert.equal(OPS_MARKNADER.DK.locale, 'da');
  assert.equal(OPS_MARKNADER.DK.valuta, 'DKK');
  assert.equal(OPS_MARKNADER.DK.heygen_sprak, 'Danish (Denmark)');
  assert.deepEqual(OPS_MARKNADER.DK.geo, ['DK']);
  assert.throws(() => marknadFor('JP'), /Okänd OPS-marknad "JP"/);
  assert.equal(arOpsMarknad('us'), true);
  assert.equal(arOpsMarknad('dk'), true);
  assert.equal(arOpsMarknad('XX'), false);
  assert.deepEqual(oversattningsmarknader(), ['NO', 'US', 'DK']);
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

test('rösten per marknad: ElevenLabs-rösten står i tabellen, aldrig i ett skript (Danmark 2026-09-20)', () => {
  // Axels beslut 2026-09-16: omdubbningen görs med ElevenLabs, inte HeyGen.
  // Rösten valdes 2026-09-20 genom mätning — fem infödda danska röster läste
  // tre annonsrepliker med eleven_v3, Scribe transkriberade tillbaka, och
  // Søren var den enda felfria med jämnt tempo (pipeline/omdubb/README.md).
  assert.equal(OPS_MARKNADER.DK.rost, 'Søren - Clear, Confident and Versatile');
  assert.equal(OPS_MARKNADER.SE.rost, 'Martin - Warm, Confident and Relatable');
  assert.equal(OPS_MARKNADER.NO.rost, 'Martin - Clear and Comforting');
  // USA har ingen röst vald — engelskan har aldrig dubbats om, bara textats.
  assert.equal(OPS_MARKNADER.US.rost, null);
  // Järnregeln: ingen röst delas mellan två språk.
  const roster = OPS_MARKNADSKODER.map((k) => OPS_MARKNADER[k].rost).filter(Boolean);
  assert.equal(new Set(roster).size, roster.length, 'två marknader delar röst — dubba aldrig ett språk med ett annat språks röst');
});

test('kontot i tabellen är OPS-kontot — och kommentaren bär UNSETTLED-fyndet 2026-09-20', async () => {
  // Fyndet får inte tappas bort vid en refaktorering: felet SER UT som ett
  // behörighetsfel ("Permissions error", code 200, subcode 1487194) och är en
  // obetald faktura. Den riktiga orsaken står bara i error_data
  // ("ad_account_status":3). Utan den raden letar nästa session efter fel
  // scope, fel sida och fel token i timmar — uppladdningen kommer nämligen
  // igenom sju steg och laddar till och med upp videofilen innan den faller.
  const { readFileSync } = await import('node:fs');
  const kalla = readFileSync(new URL('../opsmarknader.mjs', import.meta.url), 'utf8');
  assert.match(kalla, /UNSETTLED/, 'UNSETTLED-fyndet ska stå kvar i filen');
  assert.match(kalla, /1487194/, 'subkoden är det som gör felet googlingsbart');
  assert.match(kalla, /ad_account_status/, 'error_data är där orsaken faktiskt står');
  // Kontot självt ska inte ha ändrats av fyndet.
  assert.equal(OPS_MARKNADER.SE.act, '915422744950975');
  assert.equal(OPS_MARKNADER.DK.act, '915422744950975');
});

import { MARKNADSKODER_I_NAMN, marknadskodIFil, arMarknadsfil, utanMarknadsfiler } from '../opsmarknader.mjs';

test('marknadskodIFil: marknadsversionen känns igen på plats två, källfilen inte (2026-09-22: bara den svenska får översättas)', () => {
  assert.equal(marknadskodIFil('CaraShellRoof_NO_PD_106_H1.mp4'), 'NO');
  assert.equal(marknadskodIFil('/x/y/CaraShellRoof_US_PD_106_H1.mp4'), 'US');
  assert.equal(marknadskodIFil('Takovertrekk_DK_GT_5_H1.jpg'), 'DK');
  assert.equal(marknadskodIFil('CaraShellRoof_PD_106_H1.mp4'), null);
  assert.equal(marknadskodIFil('Takoverdrag_BOF_3_1_4x5.jpg'), null);
  assert.equal(marknadskodIFil('Kranskydd_DE_3_1.jpg'), null, 'DE är en svensk vinkel (Demo), inte en marknad');
  assert.equal(marknadskodIFil('HeimGuard_SP_2_1'), null);
  assert.equal(marknadskodIFil(''), null);
  assert.equal(arMarknadsfil('CaraShellRoof_NO_PD_106_H1.mp4'), true);
  assert.ok(!MARKNADSKODER_I_NAMN.includes('SE') && !MARKNADSKODER_I_NAMN.includes('DE'));
});

test('utanMarknadsfiler: bara källfiler kvar, ordningen bevarad, objekt med namn/name fungerar', () => {
  assert.deepEqual(utanMarknadsfiler(['CaraShellRoof_NO_PD_106_H1.mp4', 'CaraShellRoof_PD_106_H1.mp4']), ['CaraShellRoof_PD_106_H1.mp4']);
  assert.deepEqual(utanMarknadsfiler([{ namn: 'A_NO_PD_1_H1.mp4' }, { name: 'A_PD_1_H1.mp4' }]), [{ name: 'A_PD_1_H1.mp4' }]);
  assert.deepEqual(utanMarknadsfiler(['A_NO_PD_1_H1.mp4', 'A_US_PD_1_H1.mp4']), [], 'bara marknadsfiler ⇒ ingen källa');
  assert.deepEqual(utanMarknadsfiler([]), []);
});
