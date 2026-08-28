import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  avstandTillGrans, besked, lasBelopp, lasBreakEven, nyBudget, vinstProcent,
  GOLV_SEK, TAK_SEK,
} from '../besked.mjs';

// En frisk kampanj att utgå från: passerar alla grindar, ingen färsk ändring.
function rad(extra = {}) {
  return {
    namn: 'Testprodukten | BE ROAS 2.00 | Launch 2026-08-01',
    lage: 'drift',
    roas3d: 2.5,
    spend3d: 1000,
    kop3d: 10,
    spendTotal: 5000,
    budget: 1000,
    dagarSedanAndring: 10,
    backDagarIRad: 0,
    ...extra,
  };
}

test('lasBreakEven plockar talet ur kampanjnamnet', () => {
  assert.equal(lasBreakEven('MC-Kapellet | BE ROAS 1.49 | Launch 2026-08-27').be, 1.49);
  assert.equal(lasBreakEven('Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18').be, 1.5);
  assert.equal(lasBreakEven('Magnetfiskesatsen CBO 08-17 BE ROAS 1,65').be, 1.65);
});

test('lasBreakEven vägrar gissa när talet saknas eller är TBC', () => {
  assert.equal(lasBreakEven('Cykelshorts Herr | BE ROAS TBC | Launch 2026-08-27').be, null);
  assert.equal(lasBreakEven('Motorhöljet').be, null);
  assert.equal(lasBreakEven('Gräsklippartäcket').be, null);
  // Ett break-even under 1,0 är matematiskt omöjligt och ska förkastas.
  assert.equal(lasBreakEven('Trasig | BE ROAS 0.80').be, null);
});

test('lasBelopp klarar Metas svenska format med hårt mellanslag', () => {
  assert.equal(lasBelopp('1 000,00 kr (SEK)'), 1000);
  assert.equal(lasBelopp('20 304,78 kr (SEK)'), 20304.78);
  assert.equal(lasBelopp('292,31'), 292.31);
  assert.equal(lasBelopp('1.456467'), 1.456467);
  assert.equal(lasBelopp(2500), 2500);
});

test('lasBelopp skiljer saknat värde från noll', () => {
  assert.equal(lasBelopp(null), null);
  assert.equal(lasBelopp(undefined), null);
  assert.equal(lasBelopp(''), null);
  assert.equal(lasBelopp('kr (SEK)'), null);
  assert.equal(lasBelopp('0,00 kr'), 0);
});

test('vinstProcent returnerar null i stället för nonsens när ROAS är noll', () => {
  // Bäverpanelen räknar 1/0 som 999 och landar på -99 838 % vinst.
  assert.equal(vinstProcent(2, 0), null);
  assert.equal(vinstProcent(2, null), null);
  assert.equal(vinstProcent(1, 2), null);
  assert.equal(Math.round(vinstProcent(2, 4) * 100) / 100, 25);
});

test('nyBudget bryter aldrig mot 20-procentsregeln vid avrundning', () => {
  // Panelens Math.round(605*1.2/50)*50 ger 750 kr = +24 %. Vi ger 700 kr = +15,7 %.
  assert.equal(nyBudget('upp', 605), 700);
  assert.ok(700 <= 605 * 1.2);
  // Sänkning avrundas uppåt så steget aldrig blir större än 20 % neråt.
  assert.equal(nyBudget('ner', 605), 500);
  assert.equal(nyBudget('ner', 1000), 800);
  assert.equal(nyBudget('upp', 1000), 1200);
});

test('nyBudget respekterar golv och tak', () => {
  assert.equal(nyBudget('upp', 3800), TAK_SEK);
  assert.equal(nyBudget('ner', 550), GOLV_SEK);
  assert.equal(nyBudget('halvera', 600), GOLV_SEK);
  assert.equal(nyBudget('halvera', 2500), 1250);
});

test('ingen dom under 300 kr spend eller 3 köp', () => {
  assert.equal(besked(rad({ spend3d: 250, kop3d: 10 })).kod, 'FOR_LITE_DATA');
  assert.equal(besked(rad({ spend3d: 1000, kop3d: 2 })).kod, 'FOR_LITE_DATA');
  assert.equal(besked(rad({ spend3d: null, kop3d: null })).kod, 'FOR_LITE_DATA');
  // Grinden går före allt annat — även när siffrorna ser katastrofala ut.
  assert.equal(besked(rad({ roas3d: 0.1, spend3d: 200, kop3d: 1 })).kod, 'FOR_LITE_DATA');
});

test('utan break-even fälls ingen dom alls', () => {
  const dom = besked(rad({ namn: 'Cykelshorts Herr | BE ROAS TBC | Launch 2026-08-27' }));
  assert.equal(dom.kod, 'SAKNAR_BREAK_EVEN');
  assert.equal(dom.nyBudget, null);
});

test('utan känd budget föreslås ingen ändring', () => {
  assert.equal(besked(rad({ budget: null })).kod, 'SAKNAR_BUDGET');
});

test('kadensspärren stoppar en andra ändring inom tre dygn', () => {
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 0 })).kod, 'VANTA_KADENS');
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 2 })).kod, 'VANTA_KADENS');
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 3 })).kod, 'SKALA');
  // Aldrig ändrad av oss = ingen spärr.
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: null })).kod, 'SKALA');
});

test('zonerna: sänk, låt vara, skala', () => {
  // BE 2,00 · ROAS 2,50 -> 10 % vinst
  assert.equal(besked(rad({ roas3d: 2.5 })).kod, 'SANK');
  // BE 2,00 · ROAS 3,125 -> 18 % vinst
  assert.equal(besked(rad({ roas3d: 3.125 })).kod, 'LAT_VARA');
  // BE 2,00 · ROAS 4,00 -> exakt 25 % vinst: gränsen tillhör skalning
  assert.equal(besked(rad({ roas3d: 4 })).kod, 'SKALA');
});

test('gränsen vid 16 % tillhör låt-vara-zonen', () => {
  // BE 1,25 · ROAS 1,5625 -> exakt 16 % vinst
  const dom = besked(rad({ namn: 'X | BE ROAS 1.25', roas3d: 1.5625 }));
  assert.equal(dom.kod, 'LAT_VARA');
});

test('skalning föreslår rätt nytt tal och stannar vid taket', () => {
  const upp = besked(rad({ roas3d: 4, budget: 2000 }));
  assert.equal(upp.kod, 'SKALA');
  assert.equal(upp.nyBudget, 2400);
  assert.equal(upp.kraverGodkannande, true);

  const tak = besked(rad({ roas3d: 4, budget: TAK_SEK }));
  assert.equal(tak.kod, 'LAT_VARA');
  assert.equal(tak.nyBudget, null);
});

test('testprodukt med förlust lämnas ifred under tröskeln', () => {
  const dom = besked(rad({ lage: 'test', roas3d: 1.2, spendTotal: 900 }));
  assert.equal(dom.kod, 'VANTA_TROSKEL');
  assert.equal(dom.kraverGodkannande, false);
});

test('testprodukt med förlust över tröskeln går till åtgärdstrappan, inte avstängning', () => {
  const dom = besked(rad({ lage: 'test', roas3d: 1.2, spendTotal: 2500 }));
  assert.equal(dom.kod, 'ATGARDSTRAPPAN');
  assert.equal(dom.nyBudget, null);
  assert.match(dom.motivering, /Stäng INTE av produkten direkt/);
});

test('driftprodukt med förlust halveras, aldrig under golvet', () => {
  const dom = besked(rad({ lage: 'drift', roas3d: 1.2, budget: 2000 }));
  assert.equal(dom.kod, 'HALVERA');
  assert.equal(dom.nyBudget, 1000);

  const nära = besked(rad({ lage: 'drift', roas3d: 1.2, budget: 600 }));
  assert.equal(nära.nyBudget, GOLV_SEK);
});

test('driftprodukt på golvet stängs av först efter sju raka back-dygn', () => {
  const sex = besked(rad({ lage: 'drift', roas3d: 1.2, budget: GOLV_SEK, backDagarIRad: 6 }));
  assert.equal(sex.kod, 'RAKNA_BACKDAGAR');
  assert.equal(sex.kraverGodkannande, false);

  const sju = besked(rad({ lage: 'drift', roas3d: 1.2, budget: GOLV_SEK, backDagarIRad: 7 }));
  assert.equal(sju.kod, 'STANG_AV');
  assert.equal(sju.kraverGodkannande, true);

  // Utan känd streak stängs ingenting av.
  const okänd = besked(rad({ lage: 'drift', roas3d: 1.2, budget: GOLV_SEK, backDagarIRad: null }));
  assert.equal(okänd.kod, 'RAKNA_BACKDAGAR');
});

test('driftprodukt på golvet som går plus lämnas ifred', () => {
  const dom = besked(rad({ lage: 'drift', roas3d: 2.1, budget: GOLV_SEK }));
  assert.equal(dom.kod, 'LAT_VARA');
  assert.equal(dom.nyBudget, null);
});

test('varje förslag som rör kontot kräver godkännande', () => {
  const rörKontot = ['SANK', 'SKALA', 'HALVERA', 'STANG_AV', 'ATGARDSTRAPPAN'];
  const fall = [
    rad({ roas3d: 2.5 }),
    rad({ roas3d: 4 }),
    rad({ lage: 'drift', roas3d: 1.2, budget: 2000 }),
    rad({ lage: 'drift', roas3d: 1.2, budget: GOLV_SEK, backDagarIRad: 9 }),
    rad({ lage: 'test', roas3d: 1.2, spendTotal: 9000 }),
  ];
  for (const f of fall) {
    const dom = besked(f);
    assert.ok(rörKontot.includes(dom.kod), `oväntad kod ${dom.kod}`);
    assert.equal(dom.kraverGodkannande, true, `${dom.kod} måste kräva godkännande`);
  }
});

test('break-even ur produktkartan vinner över kampanjnamnet', () => {
  const dom = besked(rad({ namn: 'X | BE ROAS 2.00', breakEven: 1.25, breakEvenKalla: 'produktkarta.json', roas3d: 1.5 }));
  assert.equal(dom.breakEven, 1.25);
  assert.equal(dom.breakEvenKalla, 'produktkarta.json');
});

test('domar nära en zongräns flaggas i stället för att köras rakt igenom', () => {
  // BE 1,50 · ROAS 1,46 -> -2,0 % vinst: knappt under nollan.
  const nära = besked(rad({ namn: 'X | BE ROAS 1.50', lage: 'drift', roas3d: 1.456467, budget: 2500 }));
  assert.equal(nära.kod, 'HALVERA');
  assert.equal(nära.naraGrans, true);
  assert.match(nära.motivering, /zongräns/);

  // BE 1,49 · ROAS 2,87 -> 32,3 % vinst: långt från både 25 och 16.
  const trygg = besked(rad({ namn: 'X | BE ROAS 1.49', roas3d: 2.87016 }));
  assert.equal(trygg.kod, 'SKALA');
  assert.equal(trygg.naraGrans, false);
  assert.doesNotMatch(trygg.motivering, /zongräns/);
});

test('avstandTillGrans mäter till närmaste av 0, 16 och 25 procent', () => {
  assert.equal(avstandTillGrans(-2), 2);
  assert.equal(avstandTillGrans(17), 1);
  assert.equal(avstandTillGrans(24), 1);
  assert.equal(avstandTillGrans(20), 4);
  assert.equal(avstandTillGrans(null), null);
});
