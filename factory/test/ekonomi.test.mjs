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

test('flerpack: varukostnaden skalar med ordervärdet', () => {
  // Utan skalning ser ett 2-pack ut som ren vinst (dubbel intäkt, enkel kostnad).
  const skalad = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 1342 });
  const explicit = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 1342, varukostnadPerOrder: 470 });
  assert.ok(skalad.varukostnad > 261, 'varukostnaden ska följa ordervärdet');
  // HeimGuards riktiga 2-packsinköp (49,2 USD ≈ 470 kr) ger break-even 2,22 —
  // strängare än styckpriset. Registrerat tal måste därför räknas om vid AOV.
  assert.equal(explicit.breakEvenRoas, 2.22);
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

test('saknad moms_i_pris antas vara MED moms (strängast)', () => {
  // Fel åt det stränga hållet dödar inga vinnare. Fel åt andra hållet gör det.
  const utanFalt = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsProcent: 25 });
  const medFalt = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsIPris: true, momsProcent: 25 });
  assert.deepEqual(utanFalt, medFalt);
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

test('ofullständig ekonomi ger null, aldrig ett påhittat tal', () => {
  assert.equal(raknaEkonomi({ pris: 799 }), null);
  assert.equal(raknaEkonomi({ inkopskostnad: 261 }), null);
  assert.equal(raknaEkonomi({}), null);
});
