// ordrar.mjs — de rena funktionerna, utan nät, på syntetiska ordrar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  tolkaArgs, tolkaNar, iFonster, monsterTillRegex, tolkaKoder, variantUrKod,
  plattaAttribut, arTvingad, stampel, variantFor, arStrumplada, sortFor, raknaLador,
  radFor, klassificera, skrivSammanfattning, standardUtfil,
} from '../ordrar.mjs';
import { tolkaAbKonfig } from '../kor.mjs';

const TEST = 'sortval';
const REGLER = tolkaKoder('a=SUSHI-*,PIZZA-*,HAMBURGARE-*,DONUT-*;b=STRUMPOR-K1F1-P*,STRUMPOR-K2F2-P*');

/** Syntetisk Shopify-order i GraphQL-form. Inga kunduppgifter. */
function order({ name = '#1', createdAt = '2026-09-20T10:00:00Z', total = 399, attr = {}, koder = [], rader = null, cancelledAt = null, test = false, aterbetalt = 0 } = {}) {
  return {
    name, createdAt, cancelledAt, test,
    displayFinancialStatus: 'PAID',
    totalPriceSet: { shopMoney: { amount: String(total), currencyCode: 'SEK' } },
    totalRefundedSet: { shopMoney: { amount: String(aterbetalt) } },
    discountCodes: koder,
    customAttributes: Object.entries(attr).map(([key, value]) => ({ key, value })),
    lineItems: {
      pageInfo: { hasNextPage: false },
      nodes: rader ?? [
        { title: 'Äkta ätpinnar i trä', quantity: 2, product: { handle: 'sushipinnar-i-akta-tra' }, variant: { title: 'Default Title' } },
        { title: 'Sushi-Strumpor', quantity: 2, product: { handle: 'sushi-strumpor' }, variant: { title: '5 - Par / One Size' } },
      ],
    },
  };
}

test('kodmönster: * matchar vad som helst, bokstäver är bokstavliga, skiftläge kvittar', () => {
  assert.ok(monsterTillRegex('SUSHI-*').test('SUSHI-K1F1'));
  assert.ok(monsterTillRegex('SUSHI-*').test('sushi-k2f2'));
  assert.ok(!monsterTillRegex('SUSHI-*').test('XSUSHI-K1F1'));
  assert.ok(monsterTillRegex('STRUMPOR-K1F1-P*').test('STRUMPOR-K1F1-P2'));
  assert.ok(!monsterTillRegex('STRUMPOR-K1F1-P*').test('STRUMPOR-K2F2-P4'));
  assert.ok(monsterTillRegex('A.B').test('A.B'));
  assert.ok(!monsterTillRegex('A.B').test('AXB'));
});

test('tolkaKoder: a- och b-regler ur strängen, tom sträng ger tomma regler, skräp kastar', () => {
  assert.equal(REGLER.a.length, 4);
  assert.equal(REGLER.b.length, 2);
  assert.deepEqual(REGLER.b.map((r) => r.monster), ['STRUMPOR-K1F1-P*', 'STRUMPOR-K2F2-P*']);
  assert.deepEqual(tolkaKoder(undefined), { a: [], b: [] });
  assert.deepEqual(tolkaKoder(true), { a: [], b: [] });
  assert.throws(() => tolkaKoder('sushi'), /förstår inte/);
});

test('variantUrKod: bara A-kod ⇒ a, bara B-kod ⇒ b, koder för båda ⇒ okänd, ingen kod ⇒ okänd', () => {
  assert.equal(variantUrKod(['SUSHI-K1F1'], REGLER).variant, 'a');
  assert.equal(variantUrKod(['STRUMPOR-K2F2-P4'], REGLER).variant, 'b');
  assert.equal(variantUrKod(['STRUMPOR-K2F2-P4'], REGLER).kod, 'STRUMPOR-K2F2-P4');
  const konflikt = variantUrKod(['SUSHI-K1F1', 'STRUMPOR-K1F1-P2'], REGLER);
  assert.equal(konflikt.variant, null);
  assert.match(konflikt.orsak, /både/);
  assert.equal(variantUrKod([], REGLER).variant, null);
  assert.equal(variantUrKod(['VALKOMMEN10'], REGLER).variant, null);
});

test('stämpeln vinner över koden; bara exakt a/b räknas som stämpel', () => {
  // Stämpel b + A-kod ⇒ b (stämpeln är sanningen om den finns).
  const v = variantFor(order({ attr: { 'AB sortval': 'b' }, koder: ['SUSHI-K1F1'] }), TEST, REGLER);
  assert.deepEqual(v, { variant: 'b', kalla: 'stampel', kod: null, orsak: null });
  // Skiftläge och blanksteg tolereras.
  assert.equal(stampel(plattaAttribut([{ key: 'AB sortval', value: ' A ' }]), TEST), 'a');
  // Annat värde än a/b är ingen stämpel — då faller vi till koden.
  const v2 = variantFor(order({ attr: { 'AB sortval': 'c' }, koder: ['DONUT-K1F1'] }), TEST, REGLER);
  assert.equal(v2.variant, 'a');
  assert.equal(v2.kalla, 'kod');
  // Annat tests stämpel räknas inte.
  assert.equal(stampel(plattaAttribut([{ key: 'AB buybox', value: 'b' }]), TEST), null);
});

test('utan stämpel: koden ger varianten (kalla kod); utan bådadera: okänd, aldrig gissad', () => {
  const v = variantFor(order({ koder: ['STRUMPOR-K1F1-P2'] }), TEST, REGLER);
  assert.deepEqual(v, { variant: 'b', kalla: 'kod', kod: 'STRUMPOR-K1F1-P2', orsak: null });
  const o = variantFor(order({ koder: [] }), TEST, REGLER);
  assert.equal(o.variant, null);
  assert.equal(o.kalla, null);
  assert.match(o.orsak, /varken stämpel eller kod/);
  // Utan kodregler ger en kod inget heller.
  assert.equal(variantFor(order({ koder: ['SUSHI-K1F1'] }), TEST).variant, null);
});

test('tvingad: bara exakt "ja" på "AB <id> forced"', () => {
  assert.ok(arTvingad(plattaAttribut([{ key: 'AB sortval forced', value: 'ja' }]), TEST));
  assert.ok(arTvingad(plattaAttribut([{ key: 'AB sortval forced', value: 'JA' }]), TEST));
  assert.ok(!arTvingad(plattaAttribut([{ key: 'AB sortval forced', value: 'nej' }]), TEST));
  assert.ok(!arTvingad(plattaAttribut([{ key: 'AB sortval', value: 'a' }]), TEST));
  assert.ok(!arTvingad(plattaAttribut([{ key: 'AB buybox forced', value: 'ja' }]), TEST));
});

test('lådräkning: strumpor räknas, ätpinnar inte; sorten ur handle; blandat paket', () => {
  assert.ok(arStrumplada({ title: 'Sushi-Strumpor', product: { handle: 'sushi-strumpor' } }));
  assert.ok(!arStrumplada({ title: 'Äkta ätpinnar i trä', product: { handle: 'sushipinnar-i-akta-tra' } }));
  assert.equal(sortFor({ title: 'Pizza-Strumpor', product: { handle: 'pizza-strumpor' } }), 'pizza');
  assert.equal(sortFor({ title: 'Hamburgare-Strumpor', product: { handle: 'hamburgare-strumpor' } }), 'hamburgare');
  assert.equal(sortFor({ title: 'Donut-Strumpor', product: { handle: 'donut-strumpor' } }), 'donut');
  assert.equal(sortFor({ title: 'Äkta ätpinnar i trä', product: { handle: 'sushipinnar-i-akta-tra' } }), null);

  const enkel = raknaLador(order());
  assert.deepEqual(enkel, { lador: 2, sorter: ['sushi'], blandad: false });

  const blandad = raknaLador(order({ rader: [
    { title: 'Sushi-Strumpor', quantity: 1, product: { handle: 'sushi-strumpor' } },
    { title: 'Donut-Strumpor', quantity: 1, product: { handle: 'donut-strumpor' } },
    { title: 'Äkta ätpinnar i trä', quantity: 2, product: { handle: 'sushipinnar-i-akta-tra' } },
  ] }));
  assert.deepEqual(blandad, { lador: 2, sorter: ['sushi', 'donut'], blandad: true });

  const fyrpack = raknaLador(order({ rader: [
    { title: 'Sushi-Strumpor', quantity: 4, product: { handle: 'sushi-strumpor' } },
  ] }));
  assert.equal(fyrpack.lador, 4);
});

test('klassificera: annullerade och testordrar bort, tvingade bort men i filen, okända räknas och namnges', () => {
  const sedan = new Date('2026-09-18T07:31:00Z');
  const till = new Date('2026-09-29T00:00:00Z');
  const ordrar = [
    order({ name: '#1', createdAt: '2026-09-18T05:49:00Z', attr: {}, koder: ['SUSHI-K1F1'] }),         // före fönstret (förköp)
    order({ name: '#2', createdAt: '2026-09-18T07:31:04Z', attr: { 'AB sortval': 'a' }, koder: ['SUSHI-K1F1'] }),
    order({ name: '#3', createdAt: '2026-09-19T10:00:00Z', attr: {}, koder: ['STRUMPOR-K1F1-P2'] }),  // ur koden ⇒ b
    order({ name: '#4', createdAt: '2026-09-20T10:00:00Z', attr: { 'AB sortval': 'b', 'AB sortval forced': 'ja' }, koder: ['STRUMPOR-K1F1-P2'] }),
    order({ name: '#5', createdAt: '2026-09-21T10:00:00Z', attr: { 'AB sortval': 'a' }, cancelledAt: '2026-09-22T00:00:00Z' }),
    order({ name: '#6', createdAt: '2026-09-22T10:00:00Z', attr: {}, koder: [] }),                       // okänd
    order({ name: '#7', createdAt: '2026-09-23T10:00:00Z', attr: { 'AB sortval': 'b' }, total: 798, koder: ['STRUMPOR-K2F2-P4'],
      rader: [{ title: 'Sushi-Strumpor', quantity: 4, product: { handle: 'sushi-strumpor' } }] }),
    order({ name: '#8', createdAt: '2026-09-24T10:00:00Z', attr: { 'AB sortval': 'a' }, test: true }),
    order({ name: '#9', createdAt: '2026-09-29T00:00:01Z', attr: { 'AB sortval': 'a' } }),               // efter fönstret
  ];
  const { rader, sammanfattning: s } = klassificera(ordrar, { testId: TEST, regler: REGLER, sedan, till });

  assert.equal(s.hamtade, 9);
  assert.equal(s.utanfor_fonster, 2);
  assert.deepEqual(s.annullerade, ['#5']);
  assert.deepEqual(s.testordrar, ['#8']);
  assert.deepEqual(s.tvingade, ['#4']);
  assert.deepEqual(s.okanda, ['#6']);
  assert.deepEqual(s.ur_kod, ['#3 (b, STRUMPOR-K1F1-P2)']);
  assert.equal(s.raknade, 3);
  assert.equal(s.per_variant.a.ordrar, 1);
  assert.equal(s.per_variant.b.ordrar, 2);
  assert.equal(s.per_variant.b.intakt_sek, 399 + 798);
  assert.equal(s.per_variant.b.snittorder_sek, 598.5);
  assert.equal(s.per_variant.b.lador_per_order, 3);
  assert.deepEqual(s.per_variant.b.antal_lador, { '0': 0, '1': 0, '2': 1, '3': 0, '4+': 1 });
  assert.equal(s.per_variant.b.andel_lador_pct['4+'], 50);
  assert.equal(s.per_variant.b.ur_kod, 1);
  assert.deepEqual(Object.keys(s.per_variant.b.koder), ['STRUMPOR-K1F1-P2', 'STRUMPOR-K2F2-P4']);
  assert.equal(s.forsta.name, '#2');
  assert.equal(s.sista.name, '#7');

  // Filen: fönstrets icke-annullerade ordrar, i analys.mjs form — tvingade och okända kvar, med sina attribut.
  assert.deepEqual(rader.map((r) => r.name), ['#2', '#3', '#4', '#6', '#7']);
  const r3 = rader.find((r) => r.name === '#3');
  assert.deepEqual(r3.attributes, { 'AB sortval': 'b' });
  assert.equal(r3.kalla, 'kod');
  const r4 = rader.find((r) => r.name === '#4');
  assert.deepEqual(r4.attributes, { 'AB sortval': 'b', 'AB sortval forced': 'ja' });
  const r6 = rader.find((r) => r.name === '#6');
  assert.deepEqual(r6.attributes, {});
  assert.equal(r6.variant, null);
  for (const r of rader) {
    assert.equal(typeof r.totalPrice, 'number');
    assert.ok(!('customer' in r) && !('email' in r), 'inga kunduppgifter i filen');
  }
});

test('filen läses av analys.mjs regler: a/b ur attributes, forced=ja utesluts, okänd hoppas', () => {
  // Samma tolkning som analys.mjs gör (rad 112–126 där), på radFor:s utdata.
  const nyckel = 'AB sortval';
  const rader = [
    radFor(order({ name: '#a', attr: { [nyckel]: 'a' } }), TEST, REGLER),
    radFor(order({ name: '#b', koder: ['STRUMPOR-K2F2-P4'] }), TEST, REGLER),
    radFor(order({ name: '#f', attr: { [nyckel]: 'b', [nyckel + ' forced']: 'ja' } }), TEST, REGLER),
    radFor(order({ name: '#o' }), TEST, REGLER),
  ];
  let a = 0, b = 0, uteslutna = 0;
  for (const o of rader) {
    const v = o.attributes[nyckel];
    if (v !== 'a' && v !== 'b') continue;
    if (o.attributes[nyckel + ' forced'] === 'ja') { uteslutna++; continue; }
    if (v === 'a') a++; else b++;
  }
  assert.deepEqual({ a, b, uteslutna }, { a: 1, b: 1, uteslutna: 1 });
});

test('tolkaNar och iFonster: ISO-tid, ordernummer med och utan #, inkluderande gränser', () => {
  assert.deepEqual(tolkaNar('#4786'), { ordernummer: '#4786' });
  assert.deepEqual(tolkaNar('4786'), { ordernummer: '#4786' });
  assert.equal(tolkaNar('2026-09-18T07:31:00Z').tid.toISOString(), '2026-09-18T07:31:00.000Z');
  assert.throws(() => tolkaNar('igår'), /varken/);
  const sedan = new Date('2026-09-18T07:31:00Z'), till = new Date('2026-09-29T00:00:00Z');
  assert.ok(iFonster({ createdAt: '2026-09-18T07:31:00Z' }, sedan, till));
  assert.ok(iFonster({ createdAt: '2026-09-29T00:00:00Z' }, sedan, till));
  assert.ok(!iFonster({ createdAt: '2026-09-18T07:30:59Z' }, sedan, till));
  assert.ok(!iFonster({ createdAt: '2026-09-29T00:00:01Z' }, sedan, till));
  assert.ok(iFonster({ createdAt: '2027-01-01T00:00:00Z' }, sedan, null));
});

test('argument, utfil och utskrift', () => {
  const a = tolkaArgs(['--test', 'sortval', '--json', '--sedan', '#4786', '--koder', 'a=SUSHI-*;b=STRUMPOR-*']);
  assert.equal(a.test, 'sortval');
  assert.equal(a.json, true);
  assert.equal(a.sedan, '#4786');
  assert.match(standardUtfil('sortval', new Date('2026-09-30T12:00:00Z')), /matstrumpor\/ab\/output\/sortval-2026-09-30\.json$/);

  const { sammanfattning } = klassificera([
    order({ name: '#2', attr: { 'AB sortval': 'a' }, koder: ['SUSHI-K1F1'] }),
    order({ name: '#3', attr: { 'AB sortval': 'b' }, koder: ['STRUMPOR-K1F1-P2'] }),
    order({ name: '#6', koder: [] }),
  ], { testId: TEST, regler: REGLER });
  const text = skrivSammanfattning(sammanfattning, { fil: '/x/sortval.json' });
  assert.match(text, /Okända, ej räknade: 1 \(#6\)/);
  assert.match(text, /Tvingade, bort {4}: 0/);
  assert.match(text, /SUSHI-K1F1 .*100 %/);
  assert.match(text, /Filen till analys.mjs: \/x\/sortval.json/);
});

test('temats testlista läses ur den publika sidans ms-ab-config', () => {
  const html = '<html><script id="ms-ab-config" type="application/json">\n{\n  "cookieDays": 30,\n  "tests": []\n}\n</script></html>';
  assert.deepEqual(tolkaAbKonfig(html), { cookieDays: 30, tests: [] });
  assert.equal(tolkaAbKonfig('<html></html>'), null);
  assert.equal(tolkaAbKonfig('<script id="ms-ab-config" type="application/json">{trasig</script>'), null);
});
