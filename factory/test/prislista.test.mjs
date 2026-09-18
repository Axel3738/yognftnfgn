// Tester för prislista.mjs (ren logik: planen, uppslaget, vad som ska
// skrivas, klicktexten) och lander.mjs. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggPrislistplan, hittaPrislista, varianterAttSkriva, basvalutaSkal } from '../prislista.mjs';
import { landsnamnSv, landEn, sprakEn, lokalValuta, standardLocale, landskodUrNamn, ochLista, arKandLandskod, LANDSKODER } from '../lander.mjs';

const butik = (marknader) => ({ butik: { id: 'b', brand: 'CaraShell', valuta: 'SEK', marknader } });
const produkt = (marknadspriser) => ({ produkt: { id: 'takskyddet' }, brand: { namn: 'CaraShell' }, ekonomi: { pris: 1129, marknadspriser } });

// ---- lander.mjs -----------------------------------------------------------------

test('lander: USA finns i EN tabell — namn, valuta, språk och locale härleds ur koden', () => {
  assert.equal(landsnamnSv('US'), 'USA');
  assert.equal(landEn('us'), 'United States');
  assert.equal(sprakEn('US'), 'English');
  assert.equal(lokalValuta('US'), 'USD');
  assert.equal(standardLocale('US'), 'en');
  assert.ok(LANDSKODER.includes('US') && LANDSKODER.includes('NO'));
  // De gamla raderna oförändrade
  assert.equal(landsnamnSv('NO'), 'Norge');
  assert.equal(lokalValuta('NO'), 'NOK');
  assert.equal(landsnamnSv('UK'), 'Storbritannien'); // alias, inte ISO
  // Okänt: koden i versaler, aldrig en gissning
  assert.equal(landsnamnSv('xx'), 'XX');
  assert.equal(lokalValuta('XX'), null);
  assert.equal(arKandLandskod('XX'), false);
});

test('lander: landskodUrNamn läser både svenska och engelska namn, och koder', () => {
  assert.equal(landskodUrNamn('Sverige'), 'SE');
  assert.equal(landskodUrNamn('usa'), 'US');
  assert.equal(landskodUrNamn('United States'), 'US');
  assert.equal(landskodUrNamn('no'), 'NO');
  assert.equal(landskodUrNamn('Månen'), null);
  assert.equal(landskodUrNamn(''), null);
});

test('ochLista: två länder ser ut som förut, tre blir "A, B & C" — aldrig "A & B & C"', () => {
  assert.equal(ochLista([]), '');
  assert.equal(ochLista(['Sverige']), 'Sverige');
  assert.equal(ochLista(['Sverige', 'Norge']), 'Sverige & Norge');
  assert.equal(ochLista(['Sverige', 'Norge', 'USA']), 'Sverige, Norge & USA');
  assert.equal(ochLista(['Sverige', 'Norge', 'USA'], 'och'), 'Sverige, Norge och USA');
});

// ---- prislista.mjs: planen -------------------------------------------------------

test('byggPrislistplan: en rad per marknadspris, kopplad till marknaden med den valutan', () => {
  const plan = byggPrislistplan(
    produkt([{ valuta: 'NOK', pris: 1106, jamforpris: 1382.5 }, { valuta: 'USD', pris: 109, jamforpris: 139 }]),
    butik([{ land: 'NO', locale: 'nb', valuta: 'SEK' }, { land: 'US', locale: 'en', valuta: 'SEK' }])
  );
  assert.deepEqual(plan.fel, []);
  assert.deepEqual(
    plan.rader.map(({ valuta, land, pris, jamforpris, namn, stege }) => ({ valuta, land, pris, jamforpris, namn, stege })),
    [
      { valuta: 'NOK', land: 'NO', pris: 1106, jamforpris: 1382.5, namn: 'CaraShell NOK', stege: false },
      { valuta: 'USD', land: 'US', pris: 109, jamforpris: 139, namn: 'CaraShell USD', stege: false },
    ]
  );
  // Utan prisstege är kartan en rad — samma pris på varje variant, som förut.
  assert.deepEqual([...plan.rader[0].perVariant], [['Default Title', { pris: 1106, jamforpris: 1382.5 }]]);
});

test('byggPrislistplan: prisstege ⇒ varje variant får sitt eget fasta pris i marknadsvalutan', () => {
  const p = {
    produkt: { id: 'takskyddet' },
    brand: { namn: 'CaraShell' },
    ekonomi: {
      pris: 1129,
      valuta: 'SEK',
      marknadspriser: [{ valuta: 'EUR', pris: 126.9, jamforpris: 165.9 }],
    },
    varianter: [
      { namn: '5,5 × 3 m', pris: 1129, jamforpris: 1469, marknadspriser: [{ valuta: 'EUR', pris: 126.9, jamforpris: 165.9 }] },
      { namn: '13,5 × 3 m', pris: 2239, jamforpris: 2909, marknadspriser: [{ valuta: 'EUR', pris: 251.9, jamforpris: 327.9 }] },
    ],
  };
  const plan = byggPrislistplan(p, butik([{ land: 'FI', locale: 'fi', valuta: 'EUR' }]));
  assert.deepEqual(plan.fel, []);
  assert.equal(plan.rader[0].stege, true);
  assert.equal(plan.rader[0].perVariant.get('13,5 × 3 m').pris, 251.9);
  // Och varianterna skrivs var för sig, inte alla på referenspriset.
  const varianter = [
    { id: 'gid://v/1', title: '5,5 × 3 m' },
    { id: 'gid://v/2', title: '13,5 × 3 m' },
  ];
  const att = varianterAttSkriva(varianter, [
    { variant: { id: 'gid://v/1' }, originType: 'FIXED', price: { amount: '126.90' }, compareAtPrice: { amount: '165.90' } },
    { variant: { id: 'gid://v/2' }, originType: 'FIXED', price: { amount: '126.90' }, compareAtPrice: { amount: '165.90' } },
  ], plan.rader[0]);
  assert.deepEqual(att.map((v) => v.title), ['13,5 × 3 m']);
});

test('byggPrislistplan: butikens egen valuta hoppas över, pris utan marknad och marknad utan pris är fel — inte tysta', () => {
  const plan = byggPrislistplan(
    produkt([{ valuta: 'SEK', pris: 1129 }, { valuta: 'DKK', pris: 799 }]),
    butik([{ land: 'US', locale: 'en' }])
  );
  assert.deepEqual(plan.rader, []);
  assert.ok(plan.fel.some((f) => /DKK-priset har ingen marknad/.test(f)), plan.fel.join(' | '));
  assert.ok(plan.fel.some((f) => /marknaden US har valutan USD men ekonomi.marknadspriser saknar en USD-rad/.test(f)), plan.fel.join(' | '));
});

test('byggPrislistplan: jämförpris under priset, dubbel valuta och pris 0 rapporteras', () => {
  const plan = byggPrislistplan(
    produkt([{ valuta: 'USD', pris: 109, jamforpris: 99 }, { valuta: 'USD', pris: 109 }, { valuta: 'NOK', pris: 0 }]),
    butik([{ land: 'US', locale: 'en' }, { land: 'NO', locale: 'nb' }])
  );
  assert.equal(plan.rader.length, 1);
  assert.ok(plan.fel.some((f) => /jämförpris 99 är inte över priset 109/.test(f)));
  assert.ok(plan.fel.some((f) => /USD står två gånger/.test(f)));
  assert.ok(plan.fel.some((f) => /NOK saknar pris över 0/.test(f)));
});

test('byggPrislistplan utan marknadspriser: tomt och utan fel när butiken bara har sin egen valuta', () => {
  const plan = byggPrislistplan(produkt(undefined), butik([]));
  assert.deepEqual(plan, { rader: [], fel: [] });
});

// ---- prislista.mjs: uppslag och skrivning ---------------------------------------

test('hittaPrislista kräver BÅDE valutan och marknaden — en NOK-lista för Norge duger inte för USA', () => {
  const listor = [
    { id: 'pl1', currency: 'NOK', catalog: { markets: { nodes: [{ id: 'm-no' }] } } },
    { id: 'pl2', currency: 'USD', catalog: { markets: { nodes: [{ id: 'm-us' }] } } },
  ];
  assert.equal(hittaPrislista(listor, 'USD', 'm-us')?.id, 'pl2');
  assert.equal(hittaPrislista(listor, 'NOK', 'm-us'), null);
  assert.equal(hittaPrislista(listor, 'USD', 'm-no'), null);
  assert.equal(hittaPrislista([], 'USD', 'm-us'), null);
});

test('varianterAttSkriva: bara varianter som saknar FIXED-pris eller bär fel pris/jämförpris', () => {
  const rad = { valuta: 'USD', pris: 109, jamforpris: 139 };
  const varianter = [{ id: 'v1' }, { id: 'v2' }, { id: 'v3' }, { id: 'v4' }];
  const befintliga = [
    { variant: { id: 'v1' }, originType: 'FIXED', price: { amount: '109.00' }, compareAtPrice: { amount: '139.00' } }, // rätt
    { variant: { id: 'v2' }, originType: 'FIXED', price: { amount: '99.00' }, compareAtPrice: { amount: '139.00' } },  // fel pris
    { variant: { id: 'v3' }, originType: 'RELATIVE', price: { amount: '109.00' }, compareAtPrice: { amount: '139.00' } }, // inte fast
    // v4 saknas helt
  ];
  assert.deepEqual(varianterAttSkriva(varianter, befintliga, rad).map((v) => v.id), ['v2', 'v3', 'v4']);
  // Utan jämförpris i planen ska ett befintligt jämförpris räknas som fel.
  const utanJf = varianterAttSkriva([{ id: 'v1' }], befintliga, { valuta: 'USD', pris: 109, jamforpris: null });
  assert.deepEqual(utanJf.map((v) => v.id), ['v1']);
});

test('basvalutaSkal säger klicket i adminen, inte ett rått userError', () => {
  const s = basvalutaSkal({ valuta: 'USD' }, 'USA', 'SEK');
  assert.match(s, /USD är inte basvaluta för marknaden USA/);
  assert.match(s, /Inställningar → Marknader → USA → Valuta → välj USD/);
  assert.match(s, /--igen prislista/);
});
