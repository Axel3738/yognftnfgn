// Tester för riskpoängen, taken och rankingen. Rena tal in, tal ut.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bedomRisk, granskaOrdrar, rankaBrands, aterkommande, niva } from '../chargeback.mjs';

const NU = new Date('2026-09-14T12:00:00Z');
const arende = (kategori, extra = {}) => ({ kategori, kund: { adress: 'k@x.se' }, ordernummer: [], besvarad: true, larmObesvarad: false, timmarObesvarad: 0, svarstidTimmar: 2, ...extra });
const order = (extra = {}) => ({ id: 1, namn: '#1', nummer: '1', email: 'k@x.se', skapad: new Date('2026-09-01T00:00:00Z'), betald: 'paid', fulfillment: 'fulfilled', sparning: true, aterbetald: false, avbruten: false, ...extra });

test('nivåerna: grönt under 25, gult 25–50, rött över 50', () => {
  assert.equal(niva(0).id, 'lag');
  assert.equal(niva(24).id, 'lag');
  assert.equal(niva(25).id, 'forhojd');
  assert.equal(niva(50).id, 'hog');
  assert.equal(niva(100).emoji, '🔴');
});

test('tom vecka utan Shopify ger noll poäng och säger att tvister är okända', () => {
  const r = bedomRisk({ arenden: [], ordrar: [], tvister: null, nu: NU });
  assert.equal(r.poang, 0);
  assert.equal(r.niva.id, 'lag');
  assert.equal(r.tvistgrad, null);
  assert.deepEqual(r.atgarder, []);
  assert.match(r.signaler.find((s) => s.id === 'tvister').detaljer[0], /okända/);
});

test('varje signal har ett tak — hundra hot ger inte mer än 36 poäng', () => {
  const r = bedomRisk({ arenden: Array.from({ length: 100 }, () => arende('chargeback_hot')), nu: NU });
  assert.equal(r.signaler.find((s) => s.id === 'hot').poang, 36);
  assert.equal(r.poang, 36);
  assert.equal(r.atgarder[0].signal, 'hot');
});

test('obesvarade väger tyngre när kategorin är chargeback-nära', () => {
  const lugn = bedomRisk({ arenden: [arende('produktfraga', { besvarad: false, larmObesvarad: true, timmarObesvarad: 60 })], nu: NU });
  const farlig = bedomRisk({ arenden: [arende('ej_levererad', { besvarad: false, larmObesvarad: true, timmarObesvarad: 60 })], nu: NU });
  assert.equal(lugn.signaler.find((s) => s.id === 'obesvarade').poang, 5);
  assert.equal(farlig.signaler.find((s) => s.id === 'obesvarade').poang, 8);
  assert.ok(farlig.poang > lugn.poang);
});

test('tvistgraden räknas mot ordrarna och slår i gul och röd gräns', () => {
  const ordrar = Array.from({ length: 200 }, (_, i) => order({ id: i, nummer: String(i) }));
  const tvist = (n) => ({ tillganglig: true, lista: Array.from({ length: n }, (_, i) => ({ status: 'won', typ: 'chargeback', orsak: 'general', ordernamn: `#${i}` })) });
  const gron = bedomRisk({ ordrar, tvister: tvist(0), nu: NU });
  const gul = bedomRisk({ ordrar, tvister: tvist(1), nu: NU });   // 0,5 %
  const rod = bedomRisk({ ordrar, tvister: tvist(2), nu: NU });   // 1,0 %
  assert.equal(gron.tvistgrad, 0);
  assert.equal(gul.tvistgrad, 0.5);
  assert.equal(rod.tvistgrad, 1);
  assert.equal(gron.signaler[0].poang, 0);
  assert.equal(gul.signaler[0].poang, 15 + 15);
  assert.equal(rod.signaler[0].poang, 30 + 30);
  const oppen = bedomRisk({ ordrar, tvister: { tillganglig: true, lista: [{ status: 'needs_response', typ: 'chargeback', orsak: 'product_not_received', ordernamn: '#5', evidensSenast: '2026-09-20' }] }, nu: NU });
  assert.match(oppen.atgarder[0].en, /1 open chargeback\(s\).*earliest 2026-09-20/);
});

test('inquiries räknas inte i tvistgraden men får egen signal och egen åtgärd', () => {
  const ordrar = Array.from({ length: 200 }, (_, i) => order({ id: i, nummer: String(i) }));
  const lista = [
    { status: 'needs_response', typ: 'inquiry', orsak: 'product_not_received', ordernamn: '#1', evidensSenast: '2026-09-28' },
    { status: 'won', typ: 'inquiry', orsak: 'credit_not_processed', ordernamn: '#2' },
    { status: 'needs_response', typ: 'chargeback', orsak: 'product_not_received', ordernamn: '#3', evidensSenast: '2026-09-23' },
  ];
  const r = bedomRisk({ ordrar, tvister: { tillganglig: true, lista }, nu: NU });
  assert.equal(r.tvistgrad, 0.5, 'bara chargebacken räknas: 1 av 200');
  assert.equal(r.underlag.chargebacks, 1);
  assert.equal(r.underlag.forfragningar, 2);
  assert.equal(r.underlag.dagar, 30);
  const cb = r.signaler.find((s) => s.id === 'tvister');
  const inq = r.signaler.find((s) => s.id === 'forfragningar');
  assert.equal(cb.varde, 1);
  assert.equal(cb.poang, 15 + 15);
  assert.match(cb.sv, /Chargebacks \(30 dagar\)/);
  assert.match(cb.atgard_en, /1 open chargeback\(s\).*earliest 2026-09-23/);
  assert.equal(inq.varde, 2);
  assert.equal(inq.poang, 10);
  assert.match(inq.atgard_en, /1 open inquiry.*before 2026-09-28.*becomes a chargeback/);
  const utanOppna = bedomRisk({ ordrar, tvister: { tillganglig: true, lista: [lista[1]] }, nu: NU });
  assert.equal(utanOppna.signaler.find((s) => s.id === 'forfragningar').atgard_en, null);
});

test('ordersignalerna: betald utan fulfillment efter gränsen, skickad utan spårning', () => {
  const o = granskaOrdrar([
    order({ id: 1, fulfillment: null, skapad: new Date('2026-09-01T00:00:00Z') }),           // 13 dagar gammal, betald, ej skickad → larm
    order({ id: 2, fulfillment: null, skapad: new Date('2026-09-13T00:00:00Z') }),           // 1 dag — inte än
    order({ id: 3, sparning: false }),                                                       // skickad utan spårning
    order({ id: 4, avbruten: true, fulfillment: null }),                                     // avbruten räknas inte
    order({ id: 5, betald: 'refunded', aterbetald: true, fulfillment: null }),               // återbetald räknas inte
  ], { nu: NU, ofullbordadDagar: 5 });
  assert.deepEqual(o.betaldaOfullbordade.map((x) => x.id), [1]);
  assert.deepEqual(o.utanSparning.map((x) => x.id), [3]);
  assert.equal(o.avbrutna, 1);
  assert.equal(o.aterbetalda, 1);
});

test('svarstiden ger poäng först över ett dygn', () => {
  const snabb = bedomRisk({ arenden: [arende('retur_angerratt', { svarstidTimmar: 5 })], nu: NU });
  const seg = bedomRisk({ arenden: [arende('retur_angerratt', { svarstidTimmar: 30 })], nu: NU });
  const mycketSeg = bedomRisk({ arenden: [arende('retur_angerratt', { svarstidTimmar: 70 })], nu: NU });
  assert.equal(snabb.signaler.find((s) => s.id === 'svarstid').poang, 0);
  assert.equal(seg.signaler.find((s) => s.id === 'svarstid').poang, 10);
  assert.equal(mycketSeg.signaler.find((s) => s.id === 'svarstid').poang, 20);
});

test('rankingen sätter högst risk först och hoppade sist utan plats', () => {
  const r = rankaBrands([
    { brand: { id: 'a' }, risk: { poang: 10 }, sammanfattning: { antalArenden: 3 } },
    { brand: { id: 'b' }, hoppad: true, orsak: 'inget lösenord' },
    { brand: { id: 'c' }, risk: { poang: 60 }, sammanfattning: { antalArenden: 1 } },
  ]);
  assert.deepEqual(r.map((x) => [x.plats, x.brand.id]), [[1, 'c'], [2, 'a'], [null, 'b']]);
});

test('återkommande kräver tre veckor — och räknar topp 3 per vecka', () => {
  assert.deepEqual(aterkommande([{ vecka: 'w1', topp: ['a'] }]), []);
  assert.deepEqual(aterkommande([{ vecka: 'w1', topp: ['a'] }, { vecka: 'w2', topp: ['a'] }]), []);
  const tre = aterkommande([{ topp: ['a', 'b'] }, { topp: ['a', 'c'] }, { topp: ['a', 'b', 'c'] }]);
  assert.deepEqual(tre, [{ id: 'a', veckor: 3, av: 3 }]);
  const fyra = aterkommande([{ topp: ['x'] }, { topp: ['a', 'b'] }, { topp: ['a', 'c'] }, { topp: ['a', 'b', 'c'] }, { topp: ['b', 'a'] }]);
  assert.deepEqual(fyra.map((x) => x.id), ['a', 'b']);
});
