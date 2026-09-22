import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  avstandTillGrans, besked, breakEvenRoas, kostnadSek, lasBelopp, lasBreakEven,
  nyBudget, vinstProcent, targetRoas, trappsteg, surfBesked,
  GOLV_SEK, TAK_UTAN_VINNARE, LIVSTIDS_MAX_BACKDAGAR, HOGZON_MAX_FAKTOR, KLICK_MIN_ANDEL, KONSEKVENT_DAGAR, TRAPPA,
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
    // Dygnsserien finns och ligger konsekvent över target — spärren är
    // fail-closed sedan 2026-09-22, så en frisk kampanj måste bära talet.
    dagarOverTarget: 3,
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

test('nyBudget respekterar golvet; tak bara när anroparen skickar ett (inget motortak, Axel 2026-09-22)', () => {
  assert.equal(nyBudget('upp', 3800), 4550);
  assert.equal(nyBudget('upp', 9000), 10800, 'inget tak vid 10 000 längre');
  assert.equal(nyBudget('upp', 16000), 19200);
  // Utan vinnare skickar anroparen högzonens gräns — då klipps 3 800.
  assert.equal(nyBudget('upp', 3800, { tak: TAK_UTAN_VINNARE }), TAK_UTAN_VINNARE);
  assert.equal(nyBudget('upp', 3000, { tak: TAK_UTAN_VINNARE, faktor: 2 }), TAK_UTAN_VINNARE);
  assert.equal(nyBudget('upp', 1000, { faktor: 2 }), 2000);
  assert.equal(nyBudget('upp', 1000, { faktor: 1.5 }), 1500);
  assert.equal(nyBudget('ner', 550), GOLV_SEK);
  assert.equal(nyBudget('halvera', 600), GOLV_SEK);
  assert.equal(nyBudget('halvera', 2500), 1250);
  assert.throws(() => nyBudget('raket', 1000), /Okänd riktning/);
});

test('spärr 1: utan vinnaretikett är taket 4 000 — med vinnare finns inget tak', () => {
  // Skalningszon (vinst 29 %) på exakt 4 000 kr.
  const grund = { namn: 'X | BE ROAS 1.60', lage: 'drift', roas3d: 3.0, spend3d: 9000, kop3d: 40, spendTotal: 90000, budget: 4000, dagarSedanAndring: 9, backDagarIRad: 0, dagarOverTarget: 3 };
  const utan = besked({ ...grund });
  assert.equal(utan.kod, 'LAT_VARA');
  assert.equal(utan.harVinnare, false);
  assert.match(utan.motivering, /BREAKTHROUGH eller SPEND_WINNER/);
  const med = besked({ ...grund, harVinnare: true });
  assert.equal(med.kod, 'SKALA');
  assert.equal(med.nyBudget, 4800);
  // Ett undefined får ALDRIG öppna taket.
  assert.equal(besked({ ...grund, harVinnare: undefined }).kod, 'LAT_VARA');
  // Under 4 000 höjs den ändå — men bara upp TILL 4 000, inte förbi.
  assert.equal(besked({ ...grund, budget: 3800 }).nyBudget, TAK_UTAN_VINNARE);
  // Med vinnare skalar motorn förbi 10 000 och 16 000 — inget tak (Axel 2026-09-22, "Never by spend").
  assert.equal(besked({ ...grund, budget: 10000, harVinnare: true }).nyBudget, 12000);
  assert.equal(besked({ ...grund, budget: 16000, harVinnare: true }).nyBudget, 19200);
  assert.equal(besked({ ...grund, budget: 40000, harVinnare: true }).nyBudget, 48000);
});

test('spärr 2: i högzonen är steget 20 % — trappans ×1,5/×2 gäller bara under 4 000', () => {
  // BE 1,60 ⇒ härlett target 2,67. ROAS 6 = 225 % av target ⇒ dubbla under 4 000, 20 % över.
  const under = besked({ namn: 'X | BE ROAS 1.60', lage: 'drift', roas3d: 6, spend3d: 9000, kop3d: 40, spendTotal: 90000, budget: 3000, dagarSedanAndring: 9, backDagarIRad: 0, harVinnare: true, dagarOverTarget: 3 });
  assert.equal(under.faktor, 2);
  assert.equal(under.nyBudget, 6000); // 3 000 × 2
  const hog = besked({ namn: 'X | BE ROAS 1.60', lage: 'drift', roas3d: 6, spend3d: 9000, kop3d: 40, spendTotal: 90000, budget: 5000, dagarSedanAndring: 9, backDagarIRad: 0, harVinnare: true, dagarOverTarget: 3 });
  assert.equal(hog.faktor, HOGZON_MAX_FAKTOR);
  assert.equal(hog.nyBudget, 6000); // 5 000 × 1,2, inte ×2
  assert.match(hog.motivering, /högzonen/);
});

test('spärr 3: högzonen kapas aldrig — två förlustmorgnar krävs för −20 %', () => {
  const grund = { namn: 'X | BE ROAS 1.60', lage: 'drift', roas3d: 1.2, spend3d: 9000, kop3d: 40, spendTotal: 90000, budget: 6000, dagarSedanAndring: 9, harVinnare: true };
  const en = besked({ ...grund, backDagarIRad: 1 });
  assert.equal(en.kod, 'HOGZON_AVVAKTA');
  assert.equal(en.nyBudget, null);
  const tva = besked({ ...grund, backDagarIRad: 2 });
  assert.equal(tva.kod, 'SANK');
  assert.equal(tva.nyBudget, 4800); // 6 000 × 0,8 — inte en halvering
  // Aldrig under 4 000 i ett steg: 4 500 × 0,8 = 3 600 → stannar på 4 000.
  assert.equal(besked({ ...grund, budget: 4500, backDagarIRad: 3 }).nyBudget, TAK_UTAN_VINNARE);
  // Okänt antal förlustmorgnar rör ingenting.
  assert.equal(besked({ ...grund, backDagarIRad: null }).kod, 'HOGZON_AVVAKTA');
  // Och åtgärdstrappan får aldrig stänga av en högzonskampanj, ens i testläge.
  assert.equal(besked({ ...grund, lage: 'test', backDagarIRad: 1 }).kod, 'HOGZON_AVVAKTA');
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

test('snabbspåret: ROAS över 3 i skalningszonen får höjas redan dagen efter en HÖJNING (24 h, Axels beslut 2026-09-22 "24")', () => {
  // BE 2,00 · ROAS 10 -> 40 % vinst, ROAS ≥ 3, förra ändringen var en höjning.
  const snabb = rad({ roas3d: 10, dagarSedanAndring: 1, senasteAndringKod: 'SKALA' });
  assert.equal(besked(snabb).kod, 'SKALA');
  assert.match(besked(snabb).motivering, /Snabbspår/);
  // Det som hindrar 1 000 → 2 000 → 4 000 på ett dygn mellan stegen är konsekvent-spärren, inte kadensen.
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 1, senasteAndringKod: 'SKALA', dagarOverTarget: 1 })).kod, 'VANTA_KONSEKVENT');
  // Aldrig samma dag som förra ändringen.
  assert.equal(besked(rad({ roas3d: 10, dagarSedanAndring: 0, senasteAndringKod: 'SKALA' })).kod, 'VANTA_KADENS');
  // Utan snabbspår (ROAS < 3) står texten inte "Snabbspår" fast trappan ger ×1,5.
  const utan = besked(rad({ namn: 'X | BE ROAS 1.63', roas3d: 2.9, budget: 2000, targetRoas: 2.3, dagarSedanAndring: 5 }));
  assert.equal(utan.kod, 'SKALA');
  assert.doesNotMatch(utan.motivering, /Snabbspår/);
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

test('skalning föreslår rätt nytt tal; utan vinnare stannar den vid 4 000, med vinnare finns inget tak', () => {
  const upp = besked(rad({ roas3d: 4, budget: 2000 }));
  assert.equal(upp.kod, 'SKALA');
  assert.equal(upp.nyBudget, 2400);
  assert.equal(upp.kraverGodkannande, true);

  const tak = besked(rad({ roas3d: 4, budget: 10000 }));
  assert.equal(tak.kod, 'LAT_VARA');
  assert.match(tak.motivering, /taket utan vinnare/);
  assert.equal(besked(rad({ roas3d: 4, budget: 10000, harVinnare: true })).nyBudget, 12000);
});

test('stegtrappan (Axel 2026-09-22): steget går på avståndet till TARGET — 100 % över ⇒ dubbla, 50 % över ⇒ ×1,5, annars 20 %', () => {
  // BE 2,00 ⇒ härlett target 4,00 (25 % vinst). ROAS 8 = 200 % ⇒ dubbla.
  const dubbla = besked(rad({ roas3d: 8, budget: 1000 }));
  assert.equal(dubbla.kod, 'SKALA');
  assert.equal(dubbla.nyBudget, 2000);
  assert.equal(dubbla.faktor, 2);
  assert.equal(dubbla.trappsteg, 'dubbla');
  assert.match(dubbla.motivering, /200 % av target/);
  // ROAS 6 = 150 % ⇒ ×1,5.
  const halv = besked(rad({ roas3d: 6, budget: 1000 }));
  assert.equal(halv.nyBudget, 1500);
  assert.equal(halv.faktor, 1.5);
  // ROAS 5,9 = 147 % ⇒ 20 %. Det gamla raketspåret (≥ 5 ⇒ ×1,8) finns inte.
  const vanlig = besked(rad({ roas3d: 5.9, budget: 1000 }));
  assert.equal(vanlig.nyBudget, 1200);
  assert.equal(vanlig.faktor, 1.2);
  assert.equal(vanlig.raket, undefined);
  // Utan vinnare klipper 4 000: 2 500 × 2 = 5 000 → 4 000.
  assert.equal(besked(rad({ roas3d: 8, budget: 2500 })).nyBudget, 4000);
  assert.deepEqual(TRAPPA.map((t) => t.faktor), [2, 1.5, 1.2]);
});

test('två beslut, två mått: skalning mäts mot target, kill mot break-even', () => {
  // BE 2,00, eget target 3,50. ROAS 3,0 = 33 % vinst — förr skalningszon (≥ 25 %), nu under target ⇒ låt vara.
  const under = besked(rad({ roas3d: 3.0, budget: 1000, targetRoas: 3.5 }));
  assert.equal(under.kod, 'LAT_VARA');
  assert.match(under.motivering, /Target 3,50 \(produktens target_roas\) nås inte/);
  assert.equal(under.targetRoas, 3.5);
  // ROAS 3,6 ⇒ över target ⇒ 20 %.
  assert.equal(besked(rad({ roas3d: 3.6, budget: 1000, targetRoas: 3.5 })).nyBudget, 1200);
  // Ett target under break-even ignoreras — det härledda gäller.
  const t = targetRoas(2.0, 1.5);
  assert.equal(t.target, 4);
  assert.match(t.kalla, /ignoreras/);
  assert.equal(targetRoas(2.0).target, 4);
  assert.equal(targetRoas(1.63).target.toFixed(2), '2.75');
  assert.equal(targetRoas(null).target, null);
  // Kill-besluten rör inte target: förlust mot break-even är förlust, oavsett target.
  const forlust = besked(rad({ roas3d: 1.5, budget: 1000, targetRoas: 3.5 }));
  assert.equal(forlust.kod, 'HALVERA');
  assert.equal(forlust.breakEven, 2);
  assert.equal(trappsteg(8, 4).faktor, 2);
  assert.equal(trappsteg(3.9, 4), null);
});

test('hälsomåttet: stigande CPA tre dygn i rad ⇒ ingen höjning oavsett ROAS, ingen sänkning', () => {
  const serie = [{ datum: '2026-09-18', cpa: 333 }, { datum: '2026-09-19', cpa: 410 }, { datum: '2026-09-20', cpa: 421 }, { datum: '2026-09-21', cpa: 466 }];
  const stopp = besked(rad({ roas3d: 8, budget: 1000, cpaStiger: { stiger: true, dagar: 3, serie } }));
  assert.equal(stopp.kod, 'CPA_STIGER');
  assert.equal(stopp.nyBudget, null);
  assert.equal(stopp.kraverGodkannande, false);
  assert.match(stopp.motivering, /333 → 410 → 421 → 466 kr/);
  assert.match(stopp.motivering, /nya creatives/);
  // Två stigningar stoppar inte.
  assert.equal(besked(rad({ roas3d: 8, budget: 1000, cpaStiger: { stiger: false, dagar: 2, serie: serie.slice(1) } })).kod, 'SKALA');
  // Förlust är förlust — CPA-trenden rör inte kill-besluten.
  assert.equal(besked(rad({ roas3d: 1.5, budget: 1000, cpaStiger: { stiger: true, dagar: 3, serie } })).kod, 'HALVERA');
});

test('klickandelen: under 60 % klickköp ⇒ vänta ett dygn; utan visningstal ingen spärr', () => {
  const vanta = besked(rad({ roas3d: 8, budget: 1000, klickandel: { andel: 0.4, klick: 4, visning: 6 } }));
  assert.equal(vanta.kod, 'VISNING_AVVAKTA');
  assert.equal(vanta.nyBudget, null);
  assert.match(vanta.motivering, /40,0 % av köpen/);
  assert.equal(besked(rad({ roas3d: 8, budget: 1000, klickandel: { andel: 0.82, klick: 28, visning: 6 } })).kod, 'SKALA');
  assert.equal(besked(rad({ roas3d: 8, budget: 1000, klickandel: null })).kod, 'SKALA');
  assert.equal(KLICK_MIN_ANDEL, 0.6);
});

test('48–72 timmar konsekvent: dags-ROAS över target färre än två dygn i rad ⇒ vänta; saknad serie ⇒ vänta (fail-closed)', () => {
  const vanta = besked(rad({ roas3d: 8, budget: 1000, dagarOverTarget: 1 }));
  assert.equal(vanta.kod, 'VANTA_KONSEKVENT');
  assert.match(vanta.motivering, /1 helt dygn i rad/);
  assert.equal(besked(rad({ roas3d: 8, budget: 1000, dagarOverTarget: 2 })).kod, 'SKALA');
  // Utan dygnsserie: hellre en dag utan höjning än en höjning utan serie.
  const saknas = besked(rad({ roas3d: 8, budget: 1000, dagarOverTarget: null }));
  assert.equal(saknas.kod, 'VANTA_KONSEKVENT');
  assert.match(saknas.motivering, /dygnsserien saknas/);
  assert.equal(besked(rad({ roas3d: 8, budget: 1000, dagarOverTarget: undefined })).kod, 'VANTA_KONSEKVENT');
  // Kill-besluten är opåverkade av att serien saknas.
  assert.equal(besked(rad({ roas3d: 1.5, budget: 1000, dagarOverTarget: null })).kod, 'HALVERA');
  assert.equal(KONSEKVENT_DAGAR, 2);
});

test('ett eget target under sänkzonens gräns (16 % vinst) ignoreras — sänk-20 % är ett tredje mått', () => {
  // BE 1,63: 16 %-linjen är ROAS 2,205. Target 2,0 ligger under den — ignoreras, härledd 2,75 gäller.
  const t = targetRoas(1.63, 2.0);
  assert.equal(t.target.toFixed(2), '2.75');
  assert.match(t.kalla, /under sänkzonens gräns 2\.2[01]/);
  // ROAS 2,1 med "target 2,0": förr SKALA och SANK samtidigt, nu bara sänk-zonen (drift).
  const d = besked(rad({ namn: 'X | BE ROAS 1.63', roas3d: 2.1, budget: 2000, targetRoas: 2.0 }));
  assert.equal(d.kod, 'SANK');
  // Target 2,3 ligger över gränsen och gäller.
  assert.equal(targetRoas(1.63, 2.3).kalla, 'produktens target_roas');
});

test('surf-läget: midnattsreset till halva gårdagens spend, dubbla i bra fönster, sänk i dåligt, håll däremellan', () => {
  const grund = { namn: 'X | BE ROAS 1.60', budget: 4000, spendIdag: 2000, roasIdag: 4.0, kopIdag: 12, spendIgar: 7000 };
  const reset = surfBesked({ ...grund, efterMidnatt: true });
  assert.equal(reset.kod, 'SURF_RESET');
  assert.equal(reset.nyBudget, 3500);
  const dubbla = surfBesked({ ...grund, efterMidnatt: false });
  assert.equal(dubbla.kod, 'SURF_DUBBLA');
  assert.equal(dubbla.nyBudget, 8000);
  assert.equal(dubbla.kraverGodkannande, true);
  const sank = surfBesked({ ...grund, efterMidnatt: false, roasIdag: 1.2 });
  assert.equal(sank.kod, 'SURF_SANK');
  assert.equal(sank.nyBudget, 3200);
  const hall = surfBesked({ ...grund, efterMidnatt: false, roasIdag: 2.0 });
  assert.equal(hall.kod, 'SURF_HALL');
  assert.equal(hall.nyBudget, null);
  // Grinden gäller i fönstret också, och hälsomåttet stoppar dubblingen.
  assert.equal(surfBesked({ ...grund, efterMidnatt: false, kopIdag: 2 }).kod, 'SURF_HALL');
  assert.equal(surfBesked({ ...grund, efterMidnatt: false, cpaStiger: { stiger: true, dagar: 3 } }).kod, 'CPA_STIGER');
  // Reset utan gårdagens spend rör ingenting.
  assert.equal(surfBesked({ ...grund, efterMidnatt: true, spendIgar: null }).kod, 'SURF_HALL');
});

test('testprodukt med förlust lämnas ifred under tröskeln', () => {
  const dom = besked(rad({ lage: 'test', roas3d: 1.2, spendTotal: 900 }));
  assert.equal(dom.kod, 'VANTA_TROSKEL');
  assert.equal(dom.kraverGodkannande, false);
});

test('testprodukt med förlust över tröskeln går till åtgärdstrappan', () => {
  const dom = besked(rad({ lage: 'test', roas3d: 1.2, spendTotal: 2500 }));
  assert.equal(dom.kod, 'ATGARDSTRAPPAN');
  assert.equal(dom.nyBudget, null);
  // Axels regel 2026-09-01: två utgångar samma morgon — pausa spendtjuven och
  // ge ett dygn till, annars stäng av hela kampanjen. Ingen femdagarstrappa.
  assert.match(dom.motivering, /spendtjuven/);
  assert.match(dom.motivering, /ETT dygn till/);
  assert.match(dom.motivering, /stängs hela kampanjen av i dag/);
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
  // Axel 2026-09-02: över tröskeln är det inte ett larm längre utan trappan —
  // Jättefotbollen fick larmet tre morgnar i rad utan att någon stängde av.
  const over = besked(rad({ lage: 'test', spend3d: 1053, kop3d: 2, roas3d: 1.2, spendTotal: 1600 }));
  assert.equal(over.kod, 'ATGARDSTRAPPAN');
  assert.equal(over.kraverGodkannande, true);
  assert.match(over.motivering, /Bränner|utan att gå ihop/);
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


test('kadensspärren stoppar aldrig avstängningen av en testprodukt som går back', () => {
  // Axel 2026-09-02: "om det ser dåligt ut stänger vi av direkt". Budgeten
  // ändrades igår — det ska inte ge en förlorare tre dygn till.
  const dom = besked(rad({ lage: 'test', roas3d: 1.2, spendTotal: 2500, dagarSedanAndring: 1 }));
  assert.equal(dom.kod, 'ATGARDSTRAPPAN');
  // Men en driftprodukt som ska SÄNKAS väntar fortfarande på kadensen.
  const drift = besked(rad({ lage: 'drift', roas3d: 1.2, spendTotal: 9000, budget: 2000, dagarSedanAndring: 1 }));
  assert.equal(drift.kod, 'VANTA_KADENS');
});


test('livstidsspärren kapar till golvet i stället för att stänga av', () => {
  // Axels larm 2026-09-04: Kranskydd Frost 420D hade 7 417 kr spend, 28 köp
  // och livstids-ROAS 1,59 mot break-even 1,49 — och stängdes av på 1,35.
  const dom = besked(rad({
    namn: 'Kranskydd Frost 420D | BE ROAS 1.49',
    lage: 'test', roas3d: 1.35, spend3d: 2892, kop3d: 10,
    spendTotal: 7416, roasTotal: 1.59, budget: 1000, backDagarIRad: 2,
  }));
  assert.equal(dom.kod, 'SANK');
  // Hela vägen ner till golvet — inte 20 % (800 kr). Axels invändning samma dag.
  assert.equal(dom.nyBudget, GOLV_SEK);
  assert.match(dom.motivering, /livstids-ROAS/);
  assert.equal(dom.livstidssparr, true);

  // Går den back även över livstiden gäller trappan som förut.
  const back = besked(rad({
    namn: 'Kranskydd Frost 420D | BE ROAS 1.49',
    lage: 'test', roas3d: 1.35, spend3d: 2892, kop3d: 10,
    spendTotal: 7416, roasTotal: 1.10, budget: 1000, backDagarIRad: 2,
  }));
  assert.equal(back.kod, 'ATGARDSTRAPPAN');
});

test('livstidsspärren tar slut — den räddar aldrig samma kampanj i evighet', () => {
  const bas = {
    namn: 'Kranskydd Frost 420D | BE ROAS 1.49',
    lage: 'test', roas3d: 1.35, spend3d: 900, kop3d: 5,
    spendTotal: 9000, roasTotal: 1.59, budget: GOLV_SEK,
  };
  // Redan på golvet, inom taket: ligg kvar och räkna.
  const kvar = besked(rad({ ...bas, backDagarIRad: LIVSTIDS_MAX_BACKDAGAR - 1 }));
  assert.equal(kvar.kod, 'RAKNA_BACKDAGAR');
  assert.equal(kvar.livstidssparr, true);
  assert.match(kvar.motivering, /1 kvar innan den stängs av/);

  // Taket nått: spärren släpper, trappan tar över trots plus över livstiden.
  const slut = besked(rad({ ...bas, backDagarIRad: LIVSTIDS_MAX_BACKDAGAR }));
  assert.equal(slut.kod, 'ATGARDSTRAPPAN');
  assert.equal(slut.livstidssparr, undefined);
});
