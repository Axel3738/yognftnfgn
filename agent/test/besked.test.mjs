import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  avstandTillGrans, besked, breakEvenRoas, kostnadSek, lasBelopp, lasBreakEven,
  nyBudget, vinstProcent,
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
  assert.equal(besked(rad({ spend3d: 600, kop3d: 2 })).kod, 'FOR_LITE_DATA');
  assert.equal(besked(rad({ spend3d: null, kop3d: null })).kod, 'FOR_LITE_DATA');
  assert.equal(besked(rad({ roas3d: 0.1, spend3d: 200, kop3d: 1 })).kod, 'FOR_LITE_DATA');
});

test('grinden är inget evigt frikort: stor spend som inte går ihop larmar', () => {
  // 900+ kr på tre dagar, under 3 köp OCH under break-even: inte "för lite
  // data" — trasigt. BE är 2,00 i testraden, så 1,2 är förlust.
  assert.equal(besked(rad({ spend3d: 1000, kop3d: 2, roas3d: 1.2 })).kod, 'STOR_SPEND_UTAN_KOP');
  assert.equal(besked(rad({ spend3d: 2500, kop3d: 0, roas3d: 0 })).kod, 'STOR_SPEND_UTAN_KOP');
  // Larmet föreslår ingen automatisk åtgärd — en människa ska titta.
  assert.equal(besked(rad({ spend3d: 1000, kop3d: 2, roas3d: 1.2 })).kraverGodkannande, false);
  // Precis under larmgränsen: fortfarande vanlig grind.
  assert.equal(besked(rad({ spend3d: 899, kop3d: 2, roas3d: 1.2 })).kod, 'FOR_LITE_DATA');
});

test('få köp men över break-even är inte ett larm — den är tidig, inte trasig', () => {
  // Overvåkingskamera NO 2026-08-31: 1 183 kr på 3 dagar, 2 köp, ROAS 2,10 mot
  // break-even 1,40. Boten skrev "bränner pengar utan köp" om 50 % marginal.
  const dom = besked(rad({
    namn: 'Overvåkingskamera NO | BE-ROAS 1,40 | 2026-08-29',
    lage: 'test', spend3d: 1183, kop3d: 2, roas3d: 2.10, spendTotal: 1800,
  }));
  assert.equal(dom.kod, 'FOR_LITE_DATA');

  // Precis PÅ break-even räknas som att den betalar för sig.
  assert.equal(besked(rad({ spend3d: 1000, kop3d: 1, roas3d: 2.00 })).kod, 'FOR_LITE_DATA');
  // Strax under: larm igen.
  assert.equal(besked(rad({ spend3d: 1000, kop3d: 1, roas3d: 1.99 })).kod, 'STOR_SPEND_UTAN_KOP');
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
  // ROAS 2,9 med BE 2,00 -> 15,5 % vinst: inget snabbspår, vanliga tre dagar.
  assert.equal(besked(rad({ roas3d: 2.9, dagarSedanAndring: 2 })).kod, 'VANTA_KADENS');
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 3 })).kod, 'SKALA');
  // Aldrig ändrad av oss = ingen spärr.
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: null })).kod, 'SKALA');
});

test('snabbspåret: ROAS över 3 i skalningszonen får höjas redan dagen efter en HÖJNING', () => {
  // BE 2,00 · ROAS 10 -> 40 % vinst, ROAS ≥ 3, förra ändringen var en höjning.
  const snabb = rad({ roas3d: 10, dagarSedanAndring: 1, senasteAndringKod: 'SKALA' });
  assert.equal(besked(snabb).kod, 'SKALA');
  assert.match(besked(snabb).motivering, /Snabbspår/);
  // Aldrig samma dag som förra ändringen.
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 0, senasteAndringKod: 'SKALA' })).kod, 'VANTA_KADENS');
});

test('snabbspåret gäller aldrig dagen efter en sänkning eller okänd ändring', () => {
  // Dagen efter en HALVERA vore en +20 % ren vingelflygning.
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 1, senasteAndringKod: 'HALVERA' })).kod, 'VANTA_KADENS');
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 1, senasteAndringKod: 'SANK' })).kod, 'VANTA_KADENS');
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 1 })).kod, 'VANTA_KADENS');
});

test('snabbspåret gäller aldrig neråt — sänkningar väntar sina tre dagar', () => {
  // ROAS 3,1 men BE 2,9 -> bara 2,2 % vinst: SANK-zon, ingen genväg trots hög ROAS.
  const dom = besked(rad({ namn: 'X | BE ROAS 2.90', roas3d: 3.1, dagarSedanAndring: 1 }));
  assert.equal(dom.kod, 'VANTA_KADENS');
  // Förlust med hög ROAS-siffra finns inte, men förlust + färsk ändring ska vänta.
  assert.equal(besked(rad({ lage: 'drift', roas3d: 1.2, budget: 2000, dagarSedanAndring: 2 })).kod, 'VANTA_KADENS');
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

test('raketspåret: ROAS ≥ 5 skalar ×1,8 i stället för 20 % (Axel 2026-08-30)', () => {
  // BE 2,00 · ROAS 6 -> 33 % vinst och raket: 1 000 -> 1 800.
  const raket = besked(rad({ roas3d: 6, budget: 1000 }));
  assert.equal(raket.kod, 'SKALA');
  assert.equal(raket.nyBudget, 1800);
  assert.equal(raket.raket, true);
  assert.match(raket.motivering, /Raketregeln/);
  // Strax under 5: vanliga 20 %.
  const vanlig = besked(rad({ roas3d: 4.9, budget: 1000 }));
  assert.equal(vanlig.nyBudget, 1200);
  assert.equal(vanlig.raket, undefined);
  // Taket klipper: 2 500 × 1,8 = 4 500 -> 4 000.
  assert.equal(besked(rad({ roas3d: 8, budget: 2500 })).nyBudget, 4000);
  // Redan på taket: låt vara.
  assert.equal(besked(rad({ roas3d: 8, budget: TAK_SEK })).kod, 'LAT_VARA');
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

test('kostnadSek lägger ihop USD, EUR och kronor', () => {
  const fx = { usd_sek: 9.6, eur_sek: 11.09 };
  // Cykelshorts 1-pack: 8,9 USD + 2,9 EUR
  assert.equal(Math.round(kostnadSek({ usd: 8.9, eur: 2.9 }, fx) * 100) / 100, 117.6);
  assert.equal(kostnadSek({ sek: 50 }, fx), 50);
  assert.equal(kostnadSek(null, fx), null);
  assert.equal(kostnadSek({ usd: 8.9 }, null), null);
  // Saknas kursen för en valuta som faktiskt används: vägra räkna.
  assert.equal(kostnadSek({ usd: 8.9 }, { eur_sek: 11.09 }), null);
});

test('breakEvenRoas räknar pris delat med marginal', () => {
  // Cykelshorts 1-pack: 259 kr, kostnad 117,60 kr
  assert.equal(Math.round(breakEvenRoas(259, 117.6) * 100) / 100, 1.83);
  // 3-pack: 622 kr, kostnad 226,08 kr
  assert.equal(Math.round(breakEvenRoas(622, 226.08) * 100) / 100, 1.57);
  // Bälteslipmaskinen med 40 USD rakt av: 909 kr, 384 kr
  assert.equal(Math.round(breakEvenRoas(909, 384) * 100) / 100, 1.73);
});

test('breakEvenRoas vägrar räkna när produkten inte går ihop', () => {
  assert.equal(breakEvenRoas(259, 259), null);
  assert.equal(breakEvenRoas(259, 300), null);
  assert.equal(breakEvenRoas(0, 100), null);
  assert.equal(breakEvenRoas(259, null), null);
});

test('break-even räknas rakt på priset — ingen moms (DDP till Sverige)', () => {
  // Spärr mot att någon i framtiden lägger in ett 25-procentsavdrag.
  // Cykelshorts 1-pack: pris 259 kr, verklig kostnad 8,9 USD + 2,9 EUR = 117,60 kr.
  const kostnad = 8.9 * 9.6 + 2.9 * 11.09;
  assert.equal(Math.round(breakEvenRoas(259, kostnad) * 100) / 100, 1.83);
  // Med ett momsavdrag hade samma siffror gett ett helt annat tal.
  assert.notEqual(Math.round(breakEvenRoas(259 / 1.25, kostnad) * 100) / 100, 1.83);
});


test('break-even-typon fångas: heltal som 149 ger ingen dom', () => {
  assert.equal(lasBreakEven('X | BE ROAS 149 | Launch').be, null);
  assert.equal(lasBreakEven('X | BE ROAS 11 |').be, null);
  assert.equal(lasBreakEven('X | BE ROAS 9.5 |').be, 9.5);
  assert.equal(besked(rad({ namn: 'X | BE ROAS 149 |' })).kod, 'SAKNAR_BREAK_EVEN');
});

test('lasBelopp: amerikanskt format och tvetydiga tusental', () => {
  assert.equal(lasBelopp('2,500.00 kr'), 2500);
  assert.equal(lasBelopp('1,000.00'), 1000);
  assert.equal(lasBelopp('1.000'), null); // tvetydigt — hellre "vet inte" än 1000x fel
  assert.equal(lasBelopp('1.000.000'), 1000000);
  assert.equal(lasBelopp('1 000,00 kr (SEK)'), 1000); // svenskt funkar fortfarande
  assert.equal(lasBelopp('1.456467'), 1.456467); // Metas råa decimaler likaså
});

test('okänd totalspend skickar aldrig en testprodukt till trappan', () => {
  const dom = besked(rad({ lage: 'test', roas3d: 1.2, spendTotal: null }));
  assert.equal(dom.kod, 'SAKNAR_SPEND_TOTAL');
  assert.equal(dom.kraverGodkannande, false);
});

test('en testprodukt som går plus behåller sin testbudget — sänk-zonen gäller bara drift', () => {
  // BE 2,00 · ROAS 2,50 -> 10 % vinst: drift sänks, test rörs inte.
  assert.equal(besked(rad({ lage: 'drift', roas3d: 2.5 })).kod, 'SANK');
  const dom = besked(rad({ lage: 'test', roas3d: 2.5 }));
  assert.equal(dom.kod, 'LAT_VARA');
  assert.equal(dom.kraverGodkannande, false);
  assert.match(dom.motivering, /priset/);
});

test('en testprodukt under 1 500 kr totalspend larmas aldrig — MC-Kapellet-regeln', () => {
  // 1 053 kr på 3 dagar, 2 köp, 1 114 kr totalt: under testtröskeln -> samlar data.
  const dom = besked(rad({ lage: 'test', spend3d: 1053, kop3d: 2, roas3d: 1.2, spendTotal: 1114 }));
  assert.equal(dom.kod, 'FOR_LITE_DATA');
  // Samma siffror ÖVER tröskeln: larm.
  assert.equal(besked(rad({ lage: 'test', spend3d: 1053, kop3d: 2, roas3d: 1.2, spendTotal: 1600 })).kod, 'STOR_SPEND_UTAN_KOP');
  // Drift larmar oavsett totalspend.
  assert.equal(besked(rad({ lage: 'drift', spend3d: 1053, kop3d: 2, roas3d: 1.2, spendTotal: null })).kod, 'STOR_SPEND_UTAN_KOP');
});

test('break-even läses ur BÅDA skrivsätten — Sverige och Norge', () => {
  // Norge skriver "BE-ROAS 1,63" med bindestreck och komma, Sverige
  // "BE ROAS 1.49". Läser parsern bara det svenska får varje norsk kampanj
  // "saknas i kampanjnamnet" och en hel marknad blir odömbar.
  // Namnen nedan är avlästa ur kontot 1050941584152547 2026-08-31.
  const fall = [
    ['Motorhöljet | BE ROAS 1.49 | Launch 2026-08-27', 1.49],
    ['Kranbeskyttelse Frost NO | BE-ROAS 1,63 | 2026-08-29', 1.63],
    ['Kjempefotball NO | BE-ROAS 1,65 | 2026-08-30', 1.65],
    ['Fiskespöhållaren NO | BE-ROAS 1,36 | 2026-08-20', 1.36],
    ['Overvåkingskamera NO | BE-ROAS 1,40 | 2026-08-29', 1.40],
  ];
  for (const [namn, väntat] of fall) {
    const { be, kalla } = lasBreakEven(namn);
    assert.equal(be, väntat, namn);
    assert.equal(kalla, 'kampanjnamnet');
  }
});

test('TBC gäller även med bindestreck', () => {
  assert.equal(lasBreakEven('Ny produkt NO | BE-ROAS TBC | 2026-08-31').be, null);
  assert.equal(lasBreakEven('Ny produkt | BE ROAS TBC | 2026-08-31').be, null);
});
