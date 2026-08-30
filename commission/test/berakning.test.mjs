import test from 'node:test';
import assert from 'node:assert/strict';
import {
  arKordag, sistaDagen, period, normalisera, basnyckel,
  byggRegister, matcha, berakna, annonsnamn, SATS,
} from '../berakning.mjs';

const JOSH = '50fdc7d9-a491-45b9-bac4-5315788a616b';
const CARL = '24ed872b-594c-8102-b94d-0002bde1d55a';
const AXEL = '332d872b-594c-815b-92e8-0002f9c93383';

const personer = [
  { id: 'josh', namn: 'Josh Naelga', notionUserId: JOSH, roll: 'editor' },
  { id: 'carl', namn: 'Carl Vicente', notionUserId: CARL, roll: 'editor' },
  { id: 'axel', namn: 'Axel Odhner', notionUserId: AXEL, roll: 'admin' },
];

const SE = { id: '1867947880635861', namn: 'MagiBorsten', valuta: 'SEK' };
const NO = { id: '1050941584152547', namn: 'Magiborsten NO', valuta: 'SEK' };
const US = { id: '1023341917138110', namn: 'NYC Grill', valuta: 'USD' };

const rad = (namn, ansvariga, extra = {}) => ({
  namn, ansvariga, status: 'Approved', typ: 'Video - Pending Approval',
  url: `https://notion/${namn}`, ...extra,
});
const annons = (adNamn, spend, konto = SE) => ({ adId: `id-${adNamn}`, adNamn, spend, konto });

// -------------------------------------------------------------- Kördagar

test('kördagar är var tredje dag plus alltid månadens sista', () => {
  assert.equal(arKordag(new Date('2026-08-01T12:00:00Z')).kor, true);
  assert.equal(arKordag(new Date('2026-08-04T12:00:00Z')).kor, true);
  assert.equal(arKordag(new Date('2026-08-28T12:00:00Z')).kor, true);
  assert.equal(arKordag(new Date('2026-08-02T12:00:00Z')).kor, false);
  assert.equal(arKordag(new Date('2026-08-30T12:00:00Z')).kor, false);
  // Sista dagen kör alltid, även när den inte ligger på var-tredje-mönstret.
  const sista = arKordag(new Date('2026-08-31T12:00:00Z'));
  assert.equal(sista.kor, true);
  assert.equal(sista.slutavrakning, true);
  const kortMan = arKordag(new Date('2026-09-30T12:00:00Z'));
  assert.equal(kortMan.kor, true);
  assert.equal(kortMan.slutavrakning, true);
  // Februari 2028 är skottår — sista dagen ska vara den 29:e, inte den 28:e.
  assert.equal(sistaDagen(new Date('2028-02-10T12:00:00Z')), 29);
  assert.equal(arKordag(new Date('2028-02-28T12:00:00Z')).slutavrakning, false);
  assert.equal(arKordag(new Date('2028-02-29T12:00:00Z')).slutavrakning, true);
});

test('perioden går från den 1:a till körningsdagen', () => {
  const p = period(new Date('2026-08-13T09:00:00Z'));
  assert.deepEqual(p, { manad: '2026-08', fran: '2026-08-01', till: '2026-08-13', heltMatad: false });
  assert.equal(period(new Date('2026-08-31T09:00:00Z')).heltMatad, true);
});

// -------------------------------------------------------------- Namnnycklar

test('namn normaliseras trots efterslängande blanksteg och versaler', () => {
  assert.equal(normalisera('Trimmerbelt_PD_16_1 '), 'TRIMMERBELT_PD_16_1');
  assert.equal(normalisera('trimmerbelt_pd_16_1'), 'TRIMMERBELT_PD_16_1');
});

test('marknadskoder stryks men konceptkoderna lämnas i fred', () => {
  assert.equal(basnyckel('Trimmerbelt_NO_PD_16_1'), 'TRIMMERBELT_PD_16_1');
  assert.equal(basnyckel('Fiskespöhållare_SP_2_1_UK'), 'FISKESPÖHÅLLARE_SP_2_1');
  // SO, SP, PD, CS, GT är vinklar i namnkonventionen — de får aldrig strykas.
  assert.equal(basnyckel('Enginecover_SO_5_1'), 'ENGINECOVER_SO_5_1');
  assert.equal(basnyckel('Enginecover_SP_4_1'), 'ENGINECOVER_SP_4_1');
});

test('annonsnamnet plockas ur Notion-titelns beskrivning', () => {
  // Notion: "Trimmerbelt_SP_3_H1 – VIDEO: ..." · Meta: "Trimmerbelt_SP_3_H1"
  assert.equal(annonsnamn('Trimmerbelt_SP_3_H1 – VIDEO: UGC proof-led – skeptikern blir övertygad'), 'Trimmerbelt_SP_3_H1');
  assert.equal(annonsnamn('Trimmerbelt_PD_3_H1 – VIDEO: Mechanism demo "it\'s physics"'), 'Trimmerbelt_PD_3_H1');
  assert.equal(annonsnamn('Enginecover_PD_1_H6 NO ACCeSS'), 'Enginecover_PD_1_H6');
  assert.equal(annonsnamn('Enginecover_SP_16_H1'), 'Enginecover_SP_16_H1');
  assert.equal(annonsnamn('Trimmerbelt_PD_16_1 '), 'Trimmerbelt_PD_16_1');
  // Utan understreck är det inget annonsnamn — titeln lämnas hel så att ett
  // löst förstaord ("BRYN") aldrig råkar matcha en annons.
  assert.equal(annonsnamn('BRYN SWIPE'), 'BRYN SWIPE');
});

test('rad med beskrivning i titeln matchar ändå annonsen i kontot', () => {
  const r = berakna({
    hubbar: [{ namn: 'Trimmer belt creative hub', rader: [
      rad('Trimmerbelt_SP_3_H1 – VIDEO: UGC proof-led – skeptikern blir övertygad', [JOSH]),
    ] }],
    annonser: [annons('Trimmerbelt_SP_3_H1', 25000)],
    personer,
    datum: new Date('2026-08-31T12:00:00Z'),
  });
  assert.equal(r.redigerare.length, 1);
  assert.equal(r.redigerare[0].spend.SEK, 25000);
  assert.equal(r.redigerare[0].commission.SEK, 100);
});

// -------------------------------------------------------------- Registret

test('bara Approved-rader med annonstyp räknas', () => {
  const { godkanda, bortsorterade } = byggRegister([{ namn: 'Hub', rader: [
    rad('A', [JOSH]),
    rad('B', [JOSH], { status: 'In Review' }),
    rad('C', [JOSH], { typ: 'Winning Creative' }),
    rad('D', [JOSH], { typ: 'SOP' }),
  ] }]);
  assert.deepEqual(godkanda.map((r) => r.namn), ['A']);
  assert.equal(bortsorterade, 3);
});

// -------------------------------------------------------------- Matchning

test('exakt namn vinner över marknadsvariant', () => {
  const register = byggRegister([{ namn: 'Hub', rader: [rad('X_PD_1', [JOSH]), rad('X_NO_PD_1', [CARL])] }]);
  const { traffar } = matcha([annons('X_NO_PD_1', 100, NO)], register);
  assert.equal(traffar.length, 1);
  assert.equal(traffar[0].rad.ansvariga[0], CARL);
  assert.equal(traffar[0].typ, 'exakt');
});

test('samma namn i två hubbar med olika Ansvarig betalas inte ut', () => {
  const register = byggRegister([
    { namn: 'Hub A', rader: [rad('DUBBEL_PD_1', [JOSH])] },
    { namn: 'Hub B', rader: [rad('DUBBEL_PD_1', [CARL])] },
  ]);
  const { traffar, konflikter } = matcha([annons('DUBBEL_PD_1', 500)], register);
  assert.equal(traffar.length, 0);
  assert.equal(konflikter.length, 1);
  assert.equal(konflikter[0].spend, 500);
});

// -------------------------------------------------------------- Uträkningen

const enkelRapport = (hubbar, annonser, datum = new Date('2026-08-31T12:00:00Z')) =>
  berakna({ hubbar, annonser, personer, datum });

test('0,4 % av spenden, exakt och översatt särredovisat', () => {
  const r = enkelRapport(
    [{ namn: 'Trimmer belt creative hub', rader: [rad('Trimmerbelt_PD_16_1', [JOSH])] }],
    [annons('Trimmerbelt_PD_16_1', 10000), annons('Trimmerbelt_NO_PD_16_1', 5000, NO)],
  );
  assert.equal(r.redigerare.length, 1);
  const josh = r.redigerare[0];
  assert.equal(josh.namn, 'Josh Naelga');
  assert.equal(josh.exakt.SEK, 10000);
  assert.equal(josh.variant.SEK, 5000);
  assert.equal(josh.spend.SEK, 15000);
  assert.equal(josh.commission.SEK, 60);          // 15 000 × 0,004
  assert.equal(r.totalt.commission.SEK, 60);
  assert.equal(r.sats, SATS);
});

test('rader utan Ansvarig betalas inte ut men syns i rapporten', () => {
  const r = enkelRapport(
    [{ namn: 'Hub', rader: [rad('Enginecover_PD_7_H1', [])] }],
    [annons('Enginecover_PD_7_H1', 20000)],
  );
  assert.equal(r.redigerare.length, 0);
  assert.equal(r.utanMottagare.spend.SEK, 20000);
  assert.equal(r.utanMottagare.commission.SEK, 80);
  assert.equal(r.totalt.commission.SEK ?? 0, 0);
});

test('Axels egna rader hamnar utanför utbetalningen', () => {
  const r = enkelRapport(
    [{ namn: 'Hub', rader: [rad('Enginecover_SO_5_1', [AXEL]), rad('Enginecover_SP_9_H1', [JOSH])] }],
    [annons('Enginecover_SO_5_1', 50000), annons('Enginecover_SP_9_H1', 1000)],
  );
  assert.deepEqual(r.redigerare.map((e) => e.namn), ['Josh Naelga']);
  assert.equal(r.redigerare[0].commission.SEK, 4);
  assert.equal(r.ejRedigerare.length, 1);
  assert.equal(r.ejRedigerare[0].namn, 'Axel Odhner');
  assert.equal(r.ejRedigerare[0].spend.SEK, 50000);
  assert.equal(r.totalt.commission.SEK, 4);       // bara Josh
});

test('två Ansvariga på samma rad delar lika', () => {
  const r = enkelRapport(
    [{ namn: 'Hub', rader: [rad('Delad_PD_1_H1', [JOSH, CARL])] }],
    [annons('Delad_PD_1_H1', 1000)],
  );
  assert.equal(r.redigerare.length, 2);
  for (const e of r.redigerare) {
    assert.equal(e.spend.SEK, 500);
    assert.equal(e.commission.SEK, 2);
  }
});

test('valutor summeras aldrig ihop', () => {
  const r = enkelRapport(
    [{ namn: 'Hub', rader: [rad('Grill_PD_1', [JOSH])] }],
    [annons('Grill_PD_1', 1000), annons('Grill_PD_1', 200, US)],
  );
  const josh = r.redigerare[0];
  assert.equal(josh.spend.SEK, 1000);
  assert.equal(josh.spend.USD, 200);
  assert.equal(josh.commission.SEK, 4);
  assert.equal(josh.commission.USD, 0.8);
  assert.deepEqual(r.valutor, ['SEK', 'USD']);
});

test('okänd Notion-ansvarig tappas aldrig tyst', () => {
  const r = enkelRapport(
    [{ namn: 'Hub', rader: [rad('Okand_PD_1', ['3bcd872b-594c-8133-865d-0002340f7eff'])] }],
    [annons('Okand_PD_1', 2500)],
  );
  assert.equal(r.redigerare.length, 0);
  assert.equal(r.okandaAnsvariga.length, 1);
  assert.equal(r.okandaAnsvariga[0].spend.SEK, 2500);
  assert.deepEqual(r.okandaAnsvariga[0].rader, ['Okand_PD_1']);
});

test('spend utan godkänd rad redovisas, godkänd rad utan spend likaså', () => {
  const r = enkelRapport(
    [{ namn: 'Hub', rader: [rad('Har_PD_1', [JOSH]), rad('Vilande_PD_2', [JOSH])] }],
    [annons('Har_PD_1', 100), annons('Nagot_helt_annat', 900)],
  );
  assert.equal(r.annonserUtanGodkandRad.antal, 1);
  assert.equal(r.annonserUtanGodkandRad.spend.SEK, 900);
  assert.deepEqual(r.raderUtanSpend.map((x) => x.namn), ['Vilande_PD_2']);
});
