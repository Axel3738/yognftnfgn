// Tester för skalningsekonomin. Kör: node --test factory/test/*.test.mjs
//
// Poängen med filen: bevisa att momsen faktiskt räknas, och att Bäverbutikens
// tal INTE går att råka få ut ur en OPS-butik.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { raknaEkonomi, ekonomiForProdukt, granskaEkonomiblock } from '../ekonomi.mjs';
import { dummy } from './hjalp.mjs';

test('moms i priset ger ett strängare break-even än utan moms', () => {
  const med = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsIPris: true, momsProcent: 25 });
  const utan = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsIPris: false });

  assert.equal(med.netto, 639.2);          // 799 / 1,25
  assert.equal(med.tackningsbidrag, 378.2); // 639,20 − 261
  assert.equal(med.breakEvenRoas, 2.11);
  assert.equal(med.breakEvenCpa, 378);

  assert.equal(utan.breakEvenRoas, 1.49);
  // Skillnaden är hela poängen: kopieras Bäverbutikens räkning (utan moms) till
  // en OPS-butik blir kill-linjen 42 % för generös och förlustannonser överlever.
  assert.ok(med.breakEvenRoas > utan.breakEvenRoas * 1.4);
});

test('target är 25 % nettomarginal, alltid strängare än break-even', () => {
  const e = raknaEkonomi({ pris: 799, inkopskostnad: 261 });
  assert.equal(e.targetCpa, 218);   // 378,20 − 25 % av 639,20
  assert.equal(e.targetRoas, 3.66);
  assert.ok(e.targetRoas > e.breakEvenRoas);
  assert.ok(e.targetCpa < e.breakEvenCpa);
});

test('samma formel utan moms återger Axels COGS-beräkning för Bäverbutiken', () => {
  // products/products.json: motorhöljet break-even 1,63 → target 2,74.
  // Bevisar att OPS-formeln är husets egen — det är bara momsen som skiljer.
  // Pris/inköp valda så att break-even-ROAS blir 1,63 (marginal = 61,35 % av priset).
  const e = raknaEkonomi({ pris: 1000, inkopskostnad: 386.5, momsIPris: false });
  assert.equal(e.breakEvenRoas, 1.63);
  assert.ok(Math.abs(e.targetRoas - 2.74) < 0.02, `target blev ${e.targetRoas}`);
});

test('flerpack utan varukostnad_per_order: verktyget VÄGRAR räkna', () => {
  // Den farliga varianten vore att skala varukostnaden proportionellt mot
  // intäkten. Då blir break-even-ROAS matematiskt oberoende av AOV (kvoten
  // kostnad/intäkt är konstant), och en operatör som följer AOV-grinden får
  // tillbaka samma tal och tror att linjen är verifierad. Värre: husets paket
  // är rabatterade −16 till −37 % plus gratis bonus, så antalet varor växer
  // snabbare än intäkten och COGS underskattas — för generöst, åt det håll
  // som låter förlustannonser leva.
  const utan = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 1342 });
  assert.equal(utan.osaker, true);
  assert.equal(utan.breakEvenRoas, null);
  assert.equal(utan.breakEvenCpa, null);
  assert.match(utan.varning, /varukostnad_per_order/);

  // Med talet satt räknar den — och ger ett STRÄNGARE break-even än styckpriset.
  const explicit = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 1342, varukostnadPerOrder: 470 });
  assert.equal(explicit.osaker, false);
  assert.equal(explicit.breakEvenRoas, 2.22);
  assert.ok(explicit.breakEvenRoas > raknaEkonomi({ pris: 799, inkopskostnad: 261 }).breakEvenRoas);

  // B-paketet: samma varukostnad, lägre pris ⇒ ännu strängare.
  const b = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 1199, varukostnadPerOrder: 470 });
  assert.equal(b.breakEvenRoas, 2.45);
});

test('aov lika med priset räknas som en vara per order', () => {
  const a = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 799 });
  const b = raknaEkonomi({ pris: 799, inkopskostnad: 261 });
  assert.equal(a.osaker, false);
  assert.equal(a.breakEvenRoas, b.breakEvenRoas);
});

test('aov_sek 0 (mallens tomma fält) betyder "inte satt", inte "order värd 0 kr"', () => {
  // Regression: tal(0) är ett giltigt tal, så `tal(aov) ?? pris` gav brutto 0
  // → null → nyckeltal null → TypeError i ops.mjs långt därifrån.
  const e = raknaEkonomi({ pris: 399, inkopskostnad: 87, aov: 0 });
  assert.ok(e, 'aov 0 får inte ge null');
  assert.equal(e.brutto, 399);
  assert.equal(e.breakEvenRoas, 1.72);
});

test('övriga verifierade kostnader gör break-even strängare', () => {
  const utan = raknaEkonomi({ pris: 799, inkopskostnad: 261 });
  const med = raknaEkonomi({ pris: 799, inkopskostnad: 261, ovrigaKostnaderPerOrder: 30 });
  assert.equal(med.tackningsbidrag, utan.tackningsbidrag - 30);
  assert.ok(med.breakEvenRoas > utan.breakEvenRoas);
});

test('produkt som inte bär sin varukostnad flaggas olönsam i stället för att ge negativa tal', () => {
  const e = raknaEkonomi({ pris: 300, inkopskostnad: 261 }); // netto 240 < 261
  assert.equal(e.olonsam, true);
  assert.equal(e.breakEvenRoas, null);
  assert.equal(e.targetCpa, null);
});

test('saknad moms_i_pris antas vara MED moms — och det är ett nödläge, inte en säkerhet', () => {
  const utanFalt = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsProcent: 25 });
  const medFalt = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsIPris: true, momsProcent: 25 });
  assert.deepEqual(utanFalt, medFalt);
  // Fallbacken ger en STRÄNGARE linje, och en för sträng linje dödar
  // lönsamma annonser. Därför måste momsen komma ur butikskonfigen —
  // validera() varnar när den saknas, och det testas nedan.
  assert.ok(utanFalt.breakEvenRoas > raknaEkonomi({ pris: 799, inkopskostnad: 261, momsIPris: false }).breakEvenRoas);
});

test('ekonomin läses ur den sammanvävda produkten, med butikens moms', () => {
  const e = ekonomiForProdukt(dummy()); // testbutiken: moms_i_pris true, 25 %
  assert.equal(e.momsProcent, 25);
  assert.equal(e.breakEvenRoas, 1.72);
  assert.equal(e.breakEvenCpa, 232);
  assert.equal(e.targetCpa, 152);
});

test('granskaEkonomiblock fångar tal som inte längre stämmer', () => {
  const p = dummy();
  assert.deepEqual(granskaEkonomiblock(p), [], 'dummyprodukten ska vara i takt');

  p.ekonomi.break_even_roas = 1.28; // Bäverbutikens räkning utan moms
  const avvikelser = granskaEkonomiblock(p);
  assert.equal(avvikelser.length, 1);
  assert.match(avvikelser[0], /break_even_roas/);
});

test('granskaEkonomiblock säger aldrig "i takt" när den inte kunnat granska', () => {
  // En tom lista läses som ett godkännande. "Kunde inte granska" måste därför
  // ge en rad, inte tystnad.
  const utanPris = dummy();
  delete utanPris.ekonomi.pris;
  assert.match(granskaEkonomiblock(utanPris)[0], /kunde inte granskas/);

  const flerpack = dummy();
  flerpack.ekonomi.aov_sek = 649; // 2-pack, ingen varukostnad_per_order
  assert.match(granskaEkonomiblock(flerpack)[0], /varukostnad_per_order/);

  // Ett fält som finns men inte är ett tal hoppades tidigare över tyst.
  const komma = dummy();
  komma.ekonomi.break_even_roas = '1,72';
  assert.match(granskaEkonomiblock(komma)[0], /inte ett tal/);
});

test('ofullständig ekonomi ger null, aldrig ett påhittat tal', () => {
  assert.equal(raknaEkonomi({ pris: 799 }), null);
  assert.equal(raknaEkonomi({ inkopskostnad: 261 }), null);
  assert.equal(raknaEkonomi({}), null);
});
