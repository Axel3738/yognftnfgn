import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  rankaProdukter,
  nivaAvRate,
  butikensRate,
  forvarningar,
  maskera,
} from '../risk.mjs';

const tvist = (over = {}) => ({
  status: 'NEEDS_RESPONSE',
  order: '#1000',
  orderSkapad: '2026-08-01T00:00:00Z',
  belopp: 300,
  produkter: ['Motorhöljet'],
  svarsfrist: null,
  ...over,
});

test('nivåerna är absoluta och följer kortnätverkens gränser', () => {
  assert.equal(nivaAvRate(0.001), 'gron');
  assert.equal(nivaAvRate(0.005), 'gul');
  assert.equal(nivaAvRate(0.0089), 'gul');
  assert.equal(nivaAvRate(0.009), 'rod');
  assert.equal(nivaAvRate(null), 'for-lite-data');
});

test('ingen dom fälls på för lite data', () => {
  // 1 tvist på 4 ordrar är 25 % — men 4 ordrar är inget underlag.
  const rader = rankaProdukter([tvist()], [{ produkt: 'Motorhöljet', ordrar: 4 }]);
  assert.equal(rader[0].niva, 'for-lite-data');
  assert.equal(rader[0].rate, 0.25);
});

test('dom fälls när underlaget räcker', () => {
  const tvister = Array.from({ length: 5 }, (_, i) => tvist({ order: `#${i}` }));
  const rader = rankaProdukter(tvister, [{ produkt: 'Motorhöljet', ordrar: 100 }]);
  assert.equal(rader[0].rate, 0.05);
  assert.equal(rader[0].niva, 'rod');
});

test('rankningen går på pengar i risk, inte på rate', () => {
  const tvister = [
    ...Array.from({ length: 3 }, (_, i) =>
      tvist({ order: `#s${i}`, produkter: ['Småprodukt'], belopp: 100 })
    ),
    ...Array.from({ length: 6 }, (_, i) =>
      tvist({ order: `#b${i}`, produkter: ['Storsäljaren'], belopp: 900 })
    ),
  ];
  const rader = rankaProdukter(tvister, [
    { produkt: 'Småprodukt', ordrar: 40 }, // 7,5 % — högst rate
    { produkt: 'Storsäljaren', ordrar: 600 }, // 1,0 % — lägre rate
  ]);
  // Storsäljaren har lägre rate men 5 400 kr i risk mot 300 kr.
  assert.equal(rader[0].produkt, 'Storsäljaren');
  assert.equal(rader[0].pengarIRisk, 5400);
  assert.ok(rader[0].rate < rader[1].rate);
});

test('blandad order delar beloppet och flaggas', () => {
  const rader = rankaProdukter(
    [tvist({ produkter: ['A', 'B'], belopp: 1000 })],
    [
      { produkt: 'A', ordrar: 50 },
      { produkt: 'B', ordrar: 50 },
    ]
  );
  assert.equal(rader[0].pengarIRisk, 500);
  assert.equal(rader[0].blandadeOrdrar, 1);
  assert.equal(rader[1].pengarIRisk, 500);
});

test('tilläggstjänsten Garanti för säker frakt rankas aldrig', () => {
  const rader = rankaProdukter(
    [tvist({ produkter: ['Garanti för säker frakt', 'Motorhöljet'], belopp: 400 })],
    [
      { produkt: 'Motorhöljet', ordrar: 50 },
      { produkt: 'Garanti för säker frakt', ordrar: 300 },
    ]
  );
  assert.equal(rader.length, 1);
  assert.equal(rader[0].produkt, 'Motorhöljet');
  // Hela beloppet ligger kvar på den riktiga produkten, inte halva.
  assert.equal(rader[0].pengarIRisk, 400);
});

test('friska produkter kommer med i tabellen', () => {
  const rader = rankaProdukter([], [{ produkt: 'Frisk', ordrar: 200 }]);
  assert.equal(rader[0].niva, 'gron');
  assert.equal(rader[0].tvister, 0);
});

test('obesvarade och förlorade räknas var för sig', () => {
  const rader = rankaProdukter(
    [
      tvist({ status: 'NEEDS_RESPONSE' }),
      tvist({ status: 'LOST', order: '#2' }),
      tvist({ status: 'WON', order: '#3' }),
    ],
    [{ produkt: 'Motorhöljet', ordrar: 100 }]
  );
  assert.equal(rader[0].tvister, 3);
  assert.equal(rader[0].obesvarade, 1);
  assert.equal(rader[0].forlorade, 1);
});

test('butikens rate saknar dom utan ordrar', () => {
  assert.equal(butikensRate([tvist()], 0).niva, 'for-lite-data');
});

test('obesvarad tvist med kort frist blir akut', () => {
  const larm = forvarningar({
    disputes: [tvist({ svarsfrist: '2026-09-11T00:00:00Z' })],
    nu: new Date('2026-09-09T00:00:00Z'),
  });
  assert.equal(larm[0].typ, 'obesvarad-tvist');
  assert.equal(larm[0].allvar, 'akut');
  assert.equal(larm[0].dagarKvar, 2);
});

test('obesvarad tvist utan känd frist blir hög, inte akut', () => {
  const larm = forvarningar({ disputes: [tvist()], nu: new Date('2026-09-09T00:00:00Z') });
  assert.equal(larm[0].allvar, 'hog');
  assert.equal(larm[0].dagarKvar, null);
});

test('besvarad tvist larmar inte', () => {
  const larm = forvarningar({ disputes: [tvist({ status: 'WON' })] });
  assert.equal(larm.length, 0);
});

test('betald order som ligger oskickad larmar', () => {
  const larm = forvarningar({
    ordrar: [
      {
        namn: '#500',
        skapad: '2026-09-01T00:00:00Z',
        financialStatus: 'PAID',
        fulfillmentStatus: 'UNFULFILLED',
        belopp: 400,
        skickad: false,
        harTracking: false,
      },
    ],
    nu: new Date('2026-09-09T00:00:00Z'),
  });
  assert.equal(larm[0].typ, 'obefordrad');
  assert.equal(larm[0].allvar, 'hog');
});

test('order oskickad över tre veckor blir akut', () => {
  const larm = forvarningar({
    ordrar: [
      {
        namn: '#500',
        skapad: '2026-08-10T00:00:00Z',
        financialStatus: 'PAID',
        fulfillmentStatus: 'UNFULFILLED',
        belopp: 400,
        skickad: false,
        harTracking: false,
      },
    ],
    nu: new Date('2026-09-09T00:00:00Z'),
  });
  assert.equal(larm[0].allvar, 'akut');
});

test('nyss lagd order larmar inte', () => {
  const larm = forvarningar({
    ordrar: [
      {
        namn: '#501',
        skapad: '2026-09-08T00:00:00Z',
        financialStatus: 'PAID',
        fulfillmentStatus: 'UNFULFILLED',
        belopp: 400,
        skickad: false,
        harTracking: false,
      },
    ],
    nu: new Date('2026-09-09T00:00:00Z'),
  });
  assert.equal(larm.length, 0);
});

test('skickad order utan tracking larmar', () => {
  const larm = forvarningar({
    ordrar: [
      {
        namn: '#502',
        skapad: '2026-09-01T00:00:00Z',
        financialStatus: 'PAID',
        fulfillmentStatus: 'FULFILLED',
        belopp: 400,
        skickad: true,
        harTracking: false,
      },
    ],
    nu: new Date('2026-09-09T00:00:00Z'),
  });
  assert.equal(larm[0].typ, 'saknar-tracking');
});

test('mail som nämner banken blir akut larm', () => {
  const larm = forvarningar({
    mail: [{ amne: 'Kräver pengar', hot: { niva: 'akut' }, ordernummer: ['#5435'] }],
  });
  assert.equal(larm[0].typ, 'hotfullt-mail');
  assert.equal(larm[0].allvar, 'akut');
  assert.equal(larm[0].order, '#5435');
});

test('kund som mailat två gånger utan svar larmar', () => {
  const larm = forvarningar({
    mail: [
      { fran: 'kund@exempel.se', amne: 'Hej', besvarad: false, hot: { niva: null } },
      { fran: 'kund@exempel.se', amne: 'Hallå?', besvarad: false, hot: { niva: null } },
    ],
  });
  assert.equal(larm[0].typ, 'obesvarad-kund');
  assert.ok(larm[0].text.includes('k***@exempel.se'));
});

test('kund som fått svar larmar inte', () => {
  const larm = forvarningar({
    mail: [
      { fran: 'kund@exempel.se', amne: 'Hej', besvarad: true, hot: { niva: null } },
      { fran: 'kund@exempel.se', amne: 'Hallå?', besvarad: true, hot: { niva: null } },
    ],
  });
  assert.equal(larm.length, 0);
});

test('akuta larm sorteras före höga', () => {
  const larm = forvarningar({
    ordrar: [
      {
        namn: '#hog',
        skapad: '2026-09-01T00:00:00Z',
        financialStatus: 'PAID',
        fulfillmentStatus: 'UNFULFILLED',
        belopp: 100,
        skickad: false,
        harTracking: false,
      },
    ],
    mail: [{ amne: 'Bank', hot: { niva: 'akut' } }],
    nu: new Date('2026-09-09T00:00:00Z'),
  });
  assert.equal(larm[0].allvar, 'akut');
  assert.equal(larm[1].allvar, 'hog');
});

test('maskera döljer kundadressen men behåller domänen', () => {
  assert.equal(maskera('anna.andersson@gmail.com'), 'a***@gmail.com');
  assert.equal(maskera(''), '');
});
