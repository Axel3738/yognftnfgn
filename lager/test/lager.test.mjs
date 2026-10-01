import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { lasXlsx, kolumn, avkoda } from '../xlsx.mjs';
import { datumUrFlik, tolkaFlikar, rorelser, takt, bedom, avrundaMoq, sasongsbehov, bestallningUrAnteckning, sammanfatta } from '../berakna.mjs';
import { hittaKostnad } from '../shopify.mjs';

const MAPP = dirname(fileURLToPath(import.meta.url));
const ARK = readFileSync(join(MAPP, 'fixturer', 'ark.xlsx'));
const BAS = { idag: '2026-10-01', ledtid: 7, sakerhet: 14, cykel: 30, overtackning: 120 };

/** Serie med jämn försäljning: start st, minus perDag varje dag, n dagar bakåt från idag. */
function serie({ start, perDag, dagar = 30, idag = '2026-10-01' }) {
  const s = {};
  for (let i = dagar; i >= 0; i--) {
    const d = new Date(Date.parse(idag) - i * 86_400_000).toISOString().slice(0, 10);
    s[d] = Math.max(0, start - perDag * (dagar - i));
  }
  return s;
}

test('xlsx-läsaren ger flikarna med riktiga namn, text, tal och tomma celler', () => {
  const flikar = lasXlsx(ARK);
  assert.deepEqual(flikar.map((f) => f.namn), ['9.1updated', '9.2 updated', 'Anteckningar']);
  const [rubrik, rad1, rad2] = flikar[0].rader;
  assert.equal(rubrik[3], 'QTY');
  assert.equal(rad1[3], 100);
  assert.equal(rad2[1], 'Tratt – snabb & ren');
  assert.equal(rad1[4] ?? null, null, 'en tom cell ger aldrig ett värde');
});

test('kolumnbokstäver och XML-entiteter', () => {
  assert.equal(kolumn('A1'), 0);
  assert.equal(kolumn('AB12'), 27);
  assert.equal(avkoda('a &amp; b &#246; &#x2013;'), 'a & b ö –');
});

test('fliknamnen dateras som CWD skriver dem, och året vänder rätt', () => {
  assert.equal(datumUrFlik('9.30updated', '2026-10-01'), '2026-09-30');
  assert.equal(datumUrFlik('8.1 updated', '2026-10-01'), '2026-08-01');
  assert.equal(datumUrFlik('7.31upadte', '2026-10-01'), '2026-07-31');
  assert.equal(datumUrFlik('12.30updated', '2027-01-05'), '2026-12-30');
  assert.equal(datumUrFlik('Anteckningar', '2026-10-01'), null);
});

test('samma SKU med nytt namn blir en artikel, men två namn i samma flik blir två', () => {
  const { dagar, artiklar, hoppade } = tolkaFlikar(lasXlsx(ARK), { idag: '2026-10-01' });
  assert.deepEqual(dagar, ['2026-09-01', '2026-09-02']);
  assert.deepEqual(hoppade, ['Anteckningar']);
  const sticker = artiklar.find((a) => a.sku === 'KF-1');
  assert.equal(sticker.namn, 'Sticker', 'den interna koden 20595# ska inte bli visningsnamnet');
  assert.deepEqual(sticker.serie, { '2026-09-01': 100, '2026-09-02': 95 });
  assert.equal(artiklar.filter((a) => a.sku === 'KF-3').length, 2);
  const b = artiklar.find((a) => a.namn === 'Förkläde B');
  assert.deepEqual(bestallningUrAnteckning(b.anteckningar, '2026-10-01'), { antal: 50, datum: '2026-09-01' });
});

test('takten räknas bara på dagar då varan fanns i lager', () => {
  // 10 dagar med 2/dag, sedan slut i 10 dagar: takten är 2, inte 1.
  const s = {};
  for (let i = 0; i <= 20; i++) {
    const d = new Date(Date.parse('2026-09-11') + i * 86_400_000).toISOString().slice(0, 10);
    s[d] = Math.max(0, 20 - 2 * i);
  }
  const iv = rorelser(s);
  assert.equal(takt(iv, '2026-10-01', 30), 2);
});

test('påfyllning räknas som in, inte som negativ försäljning', () => {
  const iv = rorelser({ '2026-09-01': 10, '2026-09-02': 8, '2026-09-03': 108, '2026-09-04': 105 });
  assert.equal(iv.reduce((s, x) => s + x.ut, 0), 5);
  assert.equal(iv.reduce((s, x) => s + x.in, 0), 100);
});

test('beställ nu när lagret inte räcker ledtid + säkerhet, och antalet täcker cykeln', () => {
  const b = bedom({ nyckel: 'x', sku: 'x', namn: 'X', spec: '', serie: serie({ start: 200, perDag: 5 }), anteckningar: [] }, BAS);
  // 200 − 150 = 50 kvar, 5/dag → 10 dagar < 21
  assert.equal(b.lager, 50);
  assert.equal(b.status, 'bestall_nu');
  assert.equal(b.bestallAntal, 5 * (7 + 14 + 30) - 50);
});

test('MOQ rundar uppåt, aldrig nedåt', () => {
  assert.equal(avrundaMoq(201, 100), 300);
  assert.equal(avrundaMoq(0, 100), 0);
  assert.equal(avrundaMoq(-5, 100), 0);
});

test('överlager och stilla lager blir kronor när kostnaden är känd', () => {
  const over = bedom({ nyckel: 'o', sku: 'o', namn: 'O', spec: '', serie: serie({ start: 1030, perDag: 1 }), anteckningar: [] }, { ...BAS, kostnad: 10 });
  assert.equal(over.status, 'overlager');
  assert.equal(over.overlagerSt, 1000 - 120);
  assert.equal(over.overlagerKr, 8800);
  const stilla = bedom({ nyckel: 's', sku: 's', namn: 'S', spec: '', serie: serie({ start: 40, perDag: 0 }), anteckningar: [] }, { ...BAS, kostnad: 5 });
  assert.equal(stilla.status, 'stilla');
  assert.equal(stilla.overlagerKr, 200);
  const sum = sammanfatta([over, stilla]);
  assert.equal(sum.bundetKr, 1000 * 10 + 40 * 5);
});

test('slut med försäljning är en åtgärd, slut utan försäljning är vilande', () => {
  const slut = bedom({ nyckel: 'a', sku: 'a', namn: 'A', spec: '', serie: serie({ start: 30, perDag: 2 }), anteckningar: [] }, BAS);
  assert.equal(slut.status, 'slut');
  assert.ok(slut.bestallAntal > 0);
  const vilande = bedom({ nyckel: 'b', sku: 'b', namn: 'B', spec: '', serie: serie({ start: 0, perDag: 0 }), anteckningar: [] }, BAS);
  assert.equal(vilande.status, 'vilande');
});

test('uppmätt ledtid ur CWD:s anteckning och påfyllningen efter den', () => {
  const b = bedom({
    nyckel: 'm', sku: 'm', namn: 'Mastern', spec: '',
    serie: { '2026-08-12': 118, '2026-08-13': 89, '2026-08-15': 33, '2026-08-17': 956, '2026-09-30': 650 },
    anteckningar: ['order 1000 8.13'],
  }, BAS);
  assert.deepEqual(b.mattLedtid, { bestalld: '2026-08-13', ilager: '2026-08-17', dagar: 4, antal: 923 });
});

test('kinesiska nyåret flaggas när lagret inte räcker tills fabrikerna är igång igen', () => {
  const kny = { datum: '2027-02-06', sista_utskick: '2027-01-28', normal_igen: '2027-03-06' };
  // 100 st kvar, 1/dag → slut 9/1. Fram till 6/3 + 7 dagars ledtid behövs 163 st.
  const b = bedom({ nyckel: 'k', sku: 'k', namn: 'K', spec: '', serie: serie({ start: 130, perDag: 1 }), anteckningar: [] }, { ...BAS, kny });
  assert.ok(b.kny);
  assert.equal(b.kny.saknas, 63);
  const rakar = bedom({ nyckel: 'r', sku: 'r', namn: 'R', spec: '', serie: serie({ start: 400, perDag: 1 }), anteckningar: [] }, { ...BAS, kny });
  assert.equal(rakar.kny, null);
  assert.equal(b.kny.bestallSenast, '2027-01-21');
});

test('säsongsbehovet: förra årets kurva × scenario, dagens takt, och glappet över nyåret', () => {
  const plan = sasongsbehov({
    manader: { '2025-12': 310, '2026-01': 310, '2026-02': 280, '2026-03': 310 },
    enheterPerOrder: 2, scenarier: [1, 2], idag: '2026-12-01', taktPerDag: 10,
    kny: { sista_utskick: '2027-02-01', normal_igen: '2027-03-01' }, ledtid: 0,
  });
  assert.equal(plan.rader[0].manad, '2026-12');
  assert.equal(plan.rader[0].enheter[1], 620);
  assert.equal(plan.rader[0].enheter[2], 1240);
  assert.equal(plan.rader[0].dagensTakt, 310);
  // Hela februari ligger i glappet: 280 ordrar × 2 = 560 enheter vid 1×.
  assert.equal(plan.knyGap.enheter[1], 560);
  assert.equal(plan.knyGap.dagensTakt, 280);
});

test('kostnaden hittas på produkt + variant, sedan på produkten', () => {
  const kartor = [{ kostnader: new Map([['bävertratt - tanka snabbt utan spill|röd', 61], ['bäverlampa pro|', 85]]) }];
  assert.equal(hittaKostnad({ namn: 'Bävertratt – Tanka snabbt utan spill', spec: 'Röd' }, kartor), 61);
  assert.equal(hittaKostnad({ namn: 'Bäverlampa Pro', spec: '' }, kartor), 85);
  assert.equal(hittaKostnad({ namn: 'Okänd', spec: '' }, kartor), null);
});
