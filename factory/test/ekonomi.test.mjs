// Tester för skalningsekonomin. Kör: node --test factory/test/*.test.mjs
//
// Poängen med filen: bevisa att BÅDA momslinjerna räknas, att ingen av dem
// tyst blir "svaret" innan Axel beslutat (factory/BESLUT-VANTAR.md punkt 1),
// och att butikens moms_i_pris INTE kan smyga in i en kill-linje.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { raknaEkonomi, ekonomiForProdukt, granskaEkonomiblock, linjetext } from '../ekonomi.mjs';
import { dummy } from './hjalp.mjs';

test('båda momslinjerna räknas alltid — de skiljer 42 % på samma pris och inköp', () => {
  const e = raknaEkonomi({ pris: 799, inkopskostnad: 261 });

  assert.equal(e.utanMoms.tackningsbidrag, 538);   // 799 − 261
  assert.equal(e.utanMoms.breakEvenRoas, 1.49);
  assert.equal(e.utanMoms.breakEvenCpa, 538);

  assert.equal(e.medMoms.netto, 639.2);            // 799 / 1,25
  assert.equal(e.medMoms.tackningsbidrag, 378.2);  // 639,20 − 261
  assert.equal(e.medMoms.breakEvenRoas, 2.11);
  assert.equal(e.medMoms.breakEvenCpa, 378);

  // Skillnaden är hela poängen: fel momsläge flyttar kill-linjen 42 %.
  assert.ok(e.medMoms.breakEvenRoas > e.utanMoms.breakEvenRoas * 1.4);
});

test('utan uttryckligt antagande finns INGET enskilt break-even-tal att plocka', () => {
  // Det farliga vore att lämna ut ett tal ändå. En läsare som får 1,49 vet
  // inte att 2,11 var lika sannolikt, och dömer annonser mot fel linje.
  const e = raknaEkonomi({ pris: 799, inkopskostnad: 261 });
  assert.equal(e.antagande, 'obeslutat');
  assert.equal(e.oppetBeslut, true);
  assert.equal(e.breakEvenCpa, null);
  assert.equal(e.breakEvenRoas, null);
  assert.equal(e.targetCpa, null);
  assert.equal(e.antagen, null);
  // Spannet är det ärliga svaret: strängast först, generösast sist.
  assert.deepEqual(e.spann.breakEvenCpa, [378, 538]);
  assert.deepEqual(e.spann.breakEvenRoas, [1.49, 2.11]);
});

test('moms_antagen — och bara det fältet — avgör vilken linje som gäller', () => {
  const utan = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsAntagen: false });
  assert.equal(utan.antagande, 'utan_moms');
  assert.equal(utan.breakEvenCpa, 538);
  assert.equal(utan.breakEvenRoas, 1.49);
  assert.equal(utan.targetCpa, 338);
  assert.equal(utan.targetRoas, 2.36);

  const med = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsAntagen: true });
  assert.equal(med.antagande, 'med_moms');
  assert.equal(med.breakEvenCpa, 378);
  assert.equal(med.breakEvenRoas, 2.11);

  // Båda linjerna finns kvar även när antagandet är satt — rapporten ska
  // alltid kunna visa vad det andra beslutet hade inneburit.
  assert.equal(med.utanMoms.breakEvenRoas, 1.49);
  assert.equal(utan.medMoms.breakEvenRoas, 2.11);
});

test('butikens moms_i_pris får ALDRIG styra break-even', () => {
  // testbutiken.yaml har moms_i_pris: true, och butik.mjs väver in det i
  // produktens ekonomiblock. Skulle det fältet läsas som antagande hade varje
  // OPS-butik på main tyst fått med-moms-linjen — det är exakt det som
  // BESLUT-VANTAR.md punkt 1 säger att ingen får göra.
  const p = dummy();
  assert.equal(p.ekonomi.moms_i_pris, true, 'fixturen ska bära fältet, annars mäter testet ingenting');
  assert.equal(p.ekonomi.moms_antagen, undefined);
  const e = ekonomiForProdukt(p);
  assert.equal(e.antagande, 'obeslutat');
  assert.equal(e.breakEvenRoas, null);
  // Men båda talen finns, räknade ur produktfilens pris 399 och inköp 87.
  assert.equal(e.utanMoms.breakEvenRoas, 1.28);
  assert.equal(e.medMoms.breakEvenRoas, 1.72);
  assert.equal(e.medMoms.breakEvenCpa, 232);
  assert.equal(e.medMoms.targetCpa, 152);
});

test('target är 25 % nettomarginal, alltid strängare än break-even', () => {
  const e = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsAntagen: false });
  assert.equal(e.targetCpa, 338);   // 538 − 25 % av 799
  assert.equal(e.targetRoas, 2.36);
  assert.ok(e.targetRoas > e.breakEvenRoas);
  assert.ok(e.targetCpa < e.breakEvenCpa);
});

test('samma formel utan moms återger Axels COGS-beräkning för Bäverbutiken', () => {
  // products/products.json: motorhöljet break-even 1,63 → target 2,74.
  // Bevisar att formeln är husets egen — det är bara momsen som är obeslutad.
  const e = raknaEkonomi({ pris: 1000, inkopskostnad: 386.5, momsAntagen: false });
  assert.equal(e.breakEvenRoas, 1.63);
  assert.ok(Math.abs(e.targetRoas - 2.74) < 0.02, `target blev ${e.targetRoas}`);
});

test('flerpack utan varukostnad_per_order: verktyget VÄGRAR räkna', () => {
  // Den farliga varianten vore att skala varukostnaden proportionellt mot
  // intäkten. Då blir break-even-ROAS matematiskt oberoende av AOV, och en
  // operatör som följer AOV-grinden får tillbaka samma tal och tror att
  // linjen är verifierad. Husets paket är dessutom rabatterade plus gratis
  // bonus, så COGS underskattas — åt det håll som låter förlustannonser leva.
  const utan = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 1342 });
  assert.equal(utan.osaker, true);
  assert.equal(utan.utanMoms, null);
  assert.equal(utan.medMoms, null);
  assert.equal(utan.breakEvenCpa, null);
  assert.match(utan.varning, /varukostnad_per_order/);

  // Med talet satt räknar den — och ger ett STRÄNGARE break-even än styckpriset.
  // HeimGuards riktiga A-paket: 1 342 kr, 2 st à 235 kr (Axels quote 2026-09-05).
  const styck = raknaEkonomi({ pris: 799, inkopskostnad: 261 });
  const a = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 1342, varukostnadPerOrder: 470 });
  assert.equal(a.osaker, false);
  assert.equal(a.utanMoms.breakEvenRoas, 1.54);
  assert.ok(a.utanMoms.breakEvenRoas > styck.utanMoms.breakEvenRoas);

  // B-paketet: samma varukostnad, lägre pris ⇒ ännu strängare.
  const b = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 1199, varukostnadPerOrder: 470 });
  assert.equal(b.utanMoms.breakEvenRoas, 1.64);
  assert.ok(b.utanMoms.breakEvenRoas > a.utanMoms.breakEvenRoas);
});

test('aov lika med priset räknas som en vara per order', () => {
  const a = raknaEkonomi({ pris: 799, inkopskostnad: 261, aov: 799 });
  const b = raknaEkonomi({ pris: 799, inkopskostnad: 261 });
  assert.equal(a.osaker, false);
  assert.equal(a.utanMoms.breakEvenRoas, b.utanMoms.breakEvenRoas);
});

test('aov_sek 0 (mallens tomma fält) betyder "inte satt", inte "order värd 0 kr"', () => {
  // Regression: tal(0) är ett giltigt tal, så `tal(aov) ?? pris` gav brutto 0
  // → null → nyckeltal null → TypeError långt därifrån.
  const e = raknaEkonomi({ pris: 399, inkopskostnad: 87, aov: 0 });
  assert.ok(e, 'aov 0 får inte ge null');
  assert.equal(e.brutto, 399);
  assert.equal(e.medMoms.breakEvenRoas, 1.72);
});

test('övriga verifierade kostnader gör break-even strängare på båda linjerna', () => {
  const utan = raknaEkonomi({ pris: 799, inkopskostnad: 261 });
  const med = raknaEkonomi({ pris: 799, inkopskostnad: 261, ovrigaKostnaderPerOrder: 30 });
  assert.equal(med.utanMoms.tackningsbidrag, utan.utanMoms.tackningsbidrag - 30);
  assert.equal(med.medMoms.tackningsbidrag, utan.medMoms.tackningsbidrag - 30);
  assert.ok(med.utanMoms.breakEvenRoas > utan.utanMoms.breakEvenRoas);
});

test('produkt som inte bär sin varukostnad flaggas olönsam i stället för negativa tal', () => {
  // Bara MED moms: netto 240 < 261. Utan moms bär den fortfarande 39 kr, så
  // hela produkten är inte olönsam — och det ska synas per linje.
  const delvis = raknaEkonomi({ pris: 300, inkopskostnad: 261 });
  assert.equal(delvis.medMoms.olonsam, true);
  assert.equal(delvis.medMoms.breakEvenRoas, null);
  assert.equal(delvis.utanMoms.olonsam, false);
  assert.equal(delvis.olonsam, false, 'olönsam på totalen kräver att BÅDA linjerna faller');

  const helt = raknaEkonomi({ pris: 300, inkopskostnad: 310 });
  assert.equal(helt.olonsam, true);
  assert.equal(helt.utanMoms.breakEvenCpa, null);
  assert.equal(helt.medMoms.breakEvenCpa, null);
});

test('granskaEkonomiblock säger vilken linje filens tal motsvarar när antagandet saknas', () => {
  const p = dummy();
  const rader = granskaEkonomiblock(p);
  assert.equal(rader.length, 1);
  assert.match(rader[0], /moms_antagen saknas/);
  assert.match(rader[0], /1\.28/);   // utan moms
  assert.match(rader[0], /1\.72/);   // med moms

  // Står talet i filen ska granskningen peka ut vilken linje det är.
  const medTal = dummy();
  medTal.ekonomi.break_even_roas = 1.72;
  assert.match(granskaEkonomiblock(medTal)[0], /MED moms/);
});

test('granskaEkonomiblock fångar tal som inte längre stämmer när antagandet finns', () => {
  const p = dummy();
  p.ekonomi.moms_antagen = true;
  p.ekonomi.break_even_roas = 1.72;
  p.ekonomi.break_even_cpa_sek = 232;
  assert.deepEqual(granskaEkonomiblock(p), [], 'talen ska vara i takt med med-moms-linjen');

  p.ekonomi.break_even_roas = 1.28; // linjen utan moms — fel för antagandet
  const avvikelser = granskaEkonomiblock(p);
  assert.equal(avvikelser.length, 1);
  assert.match(avvikelser[0], /break_even_roas/);
  assert.match(avvikelser[0], /med_moms/);
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
  komma.ekonomi.moms_antagen = true;
  komma.ekonomi.break_even_roas = '1,72';
  assert.match(granskaEkonomiblock(komma)[0], /inte ett tal/);
});

test('linjetext visar alltid båda raderna och märker antagandet', () => {
  const obeslutat = linjetext(raknaEkonomi({ pris: 799, inkopskostnad: 261 }));
  assert.equal(obeslutat.length, 3);
  assert.match(obeslutat[0], /UTAN moms/);
  assert.match(obeslutat[1], /MED moms 25 %/);
  assert.match(obeslutat[2], /ANTAGANDE SAKNAS/);

  const beslutat = linjetext(raknaEkonomi({ pris: 799, inkopskostnad: 261, momsAntagen: false }));
  assert.match(beslutat[2], /Antagande: UTAN moms/);
  assert.match(beslutat[0], /1\.49/, 'båda linjerna visas även när beslutet finns');
  assert.match(beslutat[1], /2\.11/);
});

test('ofullständig ekonomi ger null, aldrig ett påhittat tal', () => {
  assert.equal(raknaEkonomi({ pris: 799 }), null);
  assert.equal(raknaEkonomi({ inkopskostnad: 261 }), null);
  assert.equal(raknaEkonomi({}), null);
});
