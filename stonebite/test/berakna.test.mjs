// Tester för räknandet. Reglerna ur ANALYSMETOD.md ligger i berakna.mjs, och
// de här testerna är det som håller dem på plats.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  tal, pengar, pengarKort, procent, forandring, summaPerValuta,
  vinstbidrag, vinstbidragRoas, breakEvenUrNamn, cpa, bedombar, motBreakEven,
  sparkline, dagnyckel, sistaDagarna, sedan,
} from '../berakna.mjs';
import { forklaraFel, kategorinamn, kortMotivering, tvisttyp } from '../forklaring.mjs';

/** Intl grupperar med no-break space (U+00A0) — jämför på samma villkor. */
const rent = (t) => String(t).replace(/[\u00A0\u202F]/g, ' ');

test('tal och pengar formateras svenskt', () => {
  assert.equal(rent(tal(124500)), '124 500');
  assert.equal(rent(pengar(124500)), '124 500 kr');
  assert.equal(rent(pengar(1234, 'USD')), '$1 234');
  assert.equal(pengar(99, 'NOK'), '99 nkr');
  assert.equal(procent(12.4, 1), '12,4 %');
});

test('saknat tal blir tankstreck, aldrig noll', () => {
  for (const tomt of [null, undefined, NaN, 'abc']) {
    assert.equal(tal(tomt), '–');
    assert.equal(pengar(tomt), '–');
    assert.equal(procent(tomt), '–');
    assert.equal(pengarKort(tomt), '–');
  }
});

test('stora tal kortas bara i hjältesiffran', () => {
  assert.equal(rent(pengarKort(1_240_000)), '1,2 mkr');
  assert.equal(rent(pengarKort(124_500)), '125 tkr');
  assert.equal(rent(pengarKort(4_500)), '4 500 kr');
});

test('förändring räknas bara när båda talen finns', () => {
  assert.equal(forandring(110, 100).text, '+10 %');
  assert.equal(forandring(90, 100).riktning, 'ner');
  assert.equal(forandring(100, 100).riktning, 'stilla');
  assert.equal(forandring(5, null), null);
  assert.equal(forandring(null, 5), null);
});

test('förändring från noll ger ingen procent — "oändligt bättre" är inget svar', () => {
  assert.equal(forandring(500, 0).andel, null);
  assert.equal(forandring(500, 0).text, 'nytt');
  assert.equal(forandring(0, 0).text, 'oförändrat');
});

test('valutor summeras var för sig, aldrig ihop', () => {
  const rader = [
    { valuta: 'SEK', v: 100 }, { valuta: 'SEK', v: 50 },
    { valuta: 'NOK', v: 70 }, { valuta: 'EUR', v: 10 },
  ];
  const ut = summaPerValuta(rader, 'v');
  assert.deepEqual(ut, [
    { valuta: 'SEK', varde: 150 },
    { valuta: 'NOK', varde: 70 },
    { valuta: 'EUR', varde: 10 },
  ]);
});

test('vinstbidrag = (break-even-CPA − CPA) × köp', () => {
  // 10 köp, 1 000 kr spend ⇒ CPA 100. Break-even-CPA 150 ⇒ 50 × 10 = 500.
  assert.equal(vinstbidrag({ spend: 1000, kop: 10, breakEvenCpa: 150 }), 500);
  // Dyrare än break-even ⇒ negativt bidrag.
  assert.equal(vinstbidrag({ spend: 2000, kop: 10, breakEvenCpa: 150 }), -500);
});

test('vinstbidrag saknas när underlaget saknas — aldrig noll', () => {
  assert.equal(vinstbidrag({ spend: 1000, kop: 0, breakEvenCpa: 150 }), null);
  assert.equal(vinstbidrag({ spend: 1000, kop: 10, breakEvenCpa: null }), null);
  assert.equal(vinstbidragRoas({ spend: 0, roas: 3, breakEvenRoas: 1.6 }), null);
  assert.equal(vinstbidragRoas({ spend: 100, roas: null, breakEvenRoas: 1.6 }), null);
});

test('ROAS-formen ger samma svar som CPA-formen', () => {
  // AOV 300, 10 köp ⇒ intäkt 3 000. Spend 1 000 ⇒ ROAS 3.
  // Break-even-ROAS 2 ⇒ break-even-CPA = 300/2 = 150.
  const viaCpa = vinstbidrag({ spend: 1000, kop: 10, breakEvenCpa: 150 });
  const viaRoas = vinstbidragRoas({ spend: 1000, roas: 3, breakEvenRoas: 2 });
  assert.ok(Math.abs(viaCpa - viaRoas) < 1e-9, `${viaCpa} ≠ ${viaRoas}`);
});

test('break-even läses ur kampanjnamnet', () => {
  assert.equal(breakEvenUrNamn('Takskyddet | BE ROAS 1.63 | Launch 2026-08-04'), 1.63);
  assert.equal(breakEvenUrNamn('IBC | BE-ROAS 1,51 | x'), 1.51);
  assert.equal(breakEvenUrNamn('be roas 2 test'), 2);
  assert.equal(breakEvenUrNamn('Kampanj utan tal'), null);
  assert.equal(breakEvenUrNamn(null), null);
});

test('ingen dom under 300 kr spend eller 3 köp', () => {
  assert.equal(bedombar({ spend: 299, kop: 10 }).ok, false);
  assert.equal(bedombar({ spend: 5000, kop: 2 }).ok, false);
  assert.equal(bedombar({ spend: 5000, kop: 3 }).ok, true);
  assert.match(bedombar({ spend: 100, kop: 1 }).orsak, /för lite för en dom/);
});

test('domen ställs mot break-even, aldrig mot target', () => {
  assert.equal(motBreakEven({ roas: 1.8, breakEvenRoas: 1.63 }).lage, 'over');
  assert.equal(motBreakEven({ roas: 1.5, breakEvenRoas: 1.63 }).lage, 'under');
  assert.equal(motBreakEven({ roas: 2.5, breakEvenRoas: null }).lage, 'okant');
});

test('cpa kräver köp', () => {
  assert.equal(cpa({ spend: 1000, kop: 4 }), 250);
  assert.equal(cpa({ spend: 1000, kop: 0 }), null);
});

test('sparkline hoppar över luckor i stället för att rita dem som nollor', () => {
  const s = sparkline([1, 2, null, 4]);
  assert.ok(s.d.startsWith('M'));
  assert.equal((s.d.match(/M/g) ?? []).length, 2, 'en lucka ska bryta linjen i två delar');
  assert.equal(sparkline([5]), null, 'en punkt är ingen kurva');
  assert.equal(sparkline([]), null);
});

test('dagnyckel följer svensk tid, inte UTC', () => {
  // 2026-09-21 23:30 UTC är redan 22 september i Sverige (UTC+2).
  assert.equal(dagnyckel(new Date('2026-09-21T23:30:00Z')), '2026-09-22');
  const dagar = sistaDagarna(3, { nu: new Date('2026-09-21T12:00:00Z') });
  assert.deepEqual(dagar, ['2026-09-19', '2026-09-20', '2026-09-21']);
});

test('sedan skriver tid som folk pratar', () => {
  const nu = Date.parse('2026-09-21T12:00:00Z');
  assert.equal(sedan('2026-09-21T11:58:00Z', { nu }), '2 min sedan');
  assert.equal(sedan('2026-09-21T09:00:00Z', { nu }), '3 timmar sedan');
  assert.equal(sedan('2026-09-20T12:00:00Z', { nu }), 'i går');
  assert.equal(sedan('inte ett datum', { nu }), 'okänt');
});

test('API-fel översätts till svenska med en åtgärd', () => {
  const f = forklaraFel('Shopify svarade 403: {"errors":"[API] This action requires merchant approval for read_orders scope."}');
  assert.match(f.text, /får inte läsa ordrar/);
  assert.match(f.atgard, /dev\.shopify\.com/);
});

test('okänt fel göms aldrig — det kortas bara', () => {
  const langt = `Något helt nytt gick fel: ${'x'.repeat(300)}`;
  const f = forklaraFel(langt);
  assert.ok(f.text.startsWith('Något helt nytt gick fel'));
  assert.ok(f.text.length <= 160);
  assert.equal(forklaraFel('').text, 'Okänt fel.');
});

test('kategorier och tvisttyper blir svenska', () => {
  assert.equal(kategorinamn('var_ar_ordern'), 'Var är min order?');
  assert.equal(kategorinamn('okänd_kategori', 'Unknown thing'), 'Unknown thing');
  assert.match(tvisttyp('chargeback'), /pengarna är tagna/);
  assert.equal(tvisttyp('inquiry'), 'förfrågan från banken');
});

test('nattvaktens motivering kortas till första meningen', () => {
  const lang = 'Dödvikt: 2 köp till CPA 750 kr över break-even 693 kr. 14d: 1 499 kr, 2 köp, CPA 750 kr · klass for_tidigt.';
  const kort = kortMotivering(lang);
  assert.equal(kort, 'Dödvikt: 2 köp till CPA 750 kr över break-even 693 kr.');
  assert.ok(kortMotivering('x'.repeat(400)).length <= 130);
  assert.equal(kortMotivering(null), '');
});
