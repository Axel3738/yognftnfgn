// Tester för hemsidan: åtgärdsmotorn, dashboard-datan och inbakningen.
// Inget nätverk, inga riktiga körningar — bara ett resultatobjekt in, data ut.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { byggAtgardsplan, planPerHink, pengarIRisk, HINKAR } from '../atgardsplan.mjs';
import { byggDashboard, skrivDashboard, samlaDashboard, arendeRad, tvistRad } from '../dashboard.mjs';
import { byggSida } from '../rapportsida.mjs';
import { NIVAER } from '../chargeback.mjs';

const NU = new Date('2026-09-14T08:00:00Z');

function arende(kategori, extra = {}) {
  return {
    id: `t-${kategori}`, kund: { adress: 'kalle.karlsson@gmail.com', namn: 'Kalle' }, amne: `Ärende ${kategori}`,
    kategori, poang: 2, eskalering: 0, sprak: 'sv', nyckelord: [], ordernummer: ['5054'],
    antalInkommande: 1, antalSvar: 0, forstaInkommande: new Date('2026-09-08T08:00:00Z'), senasteInkommande: new Date('2026-09-08T08:00:00Z'),
    besvarad: false, timmarObesvarad: 150, larmObesvarad: true, svarstidTimmar: null,
    utdrag: 'Jag har inte fått mitt paket, kontakta mig på kalle.karlsson@gmail.com', uids: [1], ...extra,
  };
}

function resultat(extra = {}) {
  const arenden = [
    arende('chargeback_hot'), arende('okand_debitering'), arende('ej_levererad'),
    arende('ej_levererad', { id: 't2', besvarad: true, larmObesvarad: false, timmarObesvarad: 0, svarstidTimmar: 80 }),
    arende('var_ar_ordern'), arende('var_ar_ordern', { id: 'v2' }), arende('var_ar_ordern', { id: 'v3' }),
    arende('produktfraga', { besvarad: true, larmObesvarad: false, timmarObesvarad: 0 }),
  ];
  return {
    brand: { id: 'demo', brand: 'Demobutiken', valuta: 'SEK', trosklar: { obesvarad_timmar: 48, ordrar_dagar: 30, ofullbordad_dagar: 5, tvistgrans_gul_procent: 0.5, tvistgrans_rod_procent: 0.9 } },
    vecka: '2026-W38', kord: NU, dagar: 30,
    period: { fran: new Date('2026-08-15T08:00:00Z'), till: NU },
    kallor: ['ku***@demo.se via webbmejlen (INBOX: 263)'], varningar: ['Shopify svarade 403'],
    arenden,
    sammanfattning: {
      antalArenden: 8, spam: 2, obesvarade: 6, larmObesvarade: 6, besvaradeMedTid: 2, medianSvarstidTimmar: 82,
      antalMejl: 264,
      topp: [
        { id: 'var_ar_ordern', antal: 3, obesvarade: 3, larm: 3, exempel: ['Var är min order'] },
        { id: 'ej_levererad', antal: 2, obesvarade: 1, larm: 1, exempel: ['Aldrig kommit'] },
        { id: 'chargeback_hot', antal: 1, obesvarade: 1, larm: 1, exempel: ['Kontaktar banken'] },
        { id: 'okand_debitering', antal: 1, obesvarade: 1, larm: 1, exempel: ['Dubbelt drag'] },
        { id: 'produktfraga', antal: 1, obesvarade: 0, larm: 0, exempel: ['Passar den?'] },
      ],
    },
    risk: {
      poang: 100, niva: NIVAER[2], tvistgrad: 1.2,
      underlag: { arenden: 8, ordrar: 1739, chargebacks: 4, forfragningar: 7, dagar: 30 },
      signaler: [
        { id: 'tvister', sv: 'Chargebacks', en: 'Chargebacks', varde: 4, poang: 55, detaljer: ['#5584: chargeback · general · needs_response'] },
        { id: 'pengar_vantar', sv: 'Pengar', en: 'Unanswered refund requests', varde: 2, poang: 6, detaljer: ['ro***@gmail.com'] },
        { id: 'ofullbordade', sv: 'Ofullbordade', en: 'Paid orders unfulfilled', varde: 4, poang: 16, detaljer: ['#6369'] },
        { id: 'utan_sparning', sv: 'Utan spårning', en: 'Fulfilled without tracking', varde: 3, poang: 6, detaljer: ['#5500'] },
      ],
      atgarder: [],
    },
    ordrar: { antal: 1739 },
    tvister: {
      tillganglig: true,
      lista: [
        { id: 1, typ: 'chargeback', orsak: 'credit_not_processed', status: 'needs_response', belopp: 899, valuta: 'SEK', ordernamn: '#5584', initierad: new Date('2026-09-09T00:00:00Z'), evidensSenast: '2026-09-23' },
        { id: 2, typ: 'inquiry', orsak: 'product_not_received', status: 'needs_response', belopp: 599, valuta: 'SEK', ordernamn: '#5591', initierad: new Date('2026-09-10T00:00:00Z'), evidensSenast: '2026-09-28' },
        { id: 3, typ: 'inquiry', orsak: 'product_not_received', status: 'won', belopp: 499, valuta: 'SEK', ordernamn: '#5510', initierad: null, evidensSenast: null },
      ],
    },
    sop: { antalSop: 35, tackta: [{ id: 'var_ar_ordern', sop: 'Questions about delivery timeframe' }], saknas: ['produktfraga'] },
    aterkommande: [], forra: { antalArenden: 6, obesvarade: 4, larmObesvarade: 3, medianSvarstidTimmar: 40, riskPoang: 80, tvister: 2, tvistgrad: 0.8, perKategori: { var_ar_ordern: 2 } },
    historikrad: {}, historikVeckor: 2, modell: null, sammanfattningar: {},
    bortfiltrerade: { autosvar: 5, system: 61, listmejl: 12, utanAvsandare: 0 }, antalMejl: 264,
    ...extra,
  };
}

// ------------------------------------------------------------ Åtgärdsplanen

test('planen fyller alla tre hinkar och sorterar dem i rätt ordning', () => {
  const plan = byggAtgardsplan(resultat(), { nu: NU });
  const ordning = plan.map((a) => a.hink);
  assert.deepEqual([...ordning].sort((a, b) => HINKAR.findIndex((h) => h.id === a) - HINKAR.findIndex((h) => h.id === b)), ordning, 'hinkarna kommer i ordning');
  assert.deepEqual(planPerHink(plan).map((h) => h.id), ['nu', 'veckan', 'process']);
  for (const a of plan) {
    assert.ok(a.titel && a.varfor && a.effekt, `${a.id} saknar text`);
    assert.ok(Array.isArray(a.steg) && a.steg.length >= 2, `${a.id} har för få steg`);
    assert.ok(a.matt && Object.keys(a.matt).length, `${a.id} saknar mätta tal`);
    assert.ok(!/[åäöÅÄÖ]/.test(`${a.titel} ${a.varfor} ${a.steg.join(' ')} ${a.effekt}`), `${a.id} innehåller svenska tecken — VA:n läser engelska`);
  }
});

test('varje åtgärd bär de riktiga talen, inte påhittade', () => {
  const plan = byggAtgardsplan(resultat(), { nu: NU });
  const av = (id) => plan.find((a) => a.id === id);
  assert.match(av('tvister').titel, /2 open disputes/);
  assert.match(av('tvister').varfor, /1[ ,]?498 SEK/, 'summan av de två öppna tvisterna');
  assert.match(av('tvister').varfor, /2026-09-23/, 'tidigaste deadline');
  assert.equal(av('tvister').matt.chargebacks, 1);
  assert.match(av('hot').titel, /1 customer/);
  assert.match(av('hot').varfor, /#5054/);
  assert.match(av('backlogg').titel, /6 tickets have waited more than 48 h/);
  assert.equal(av('backlogg').matt.farliga, 6, 'hot, dubbeldrag, en ej levererad och tre WISMO väger >= 2');
  assert.match(av('svarstid').titel, /median first reply is 82 h/i);
  assert.match(av('ej_levererad').titel, /2 "never arrived"/);
  assert.match(av('inquiries').titel, /1 open bank inquiry/);
  assert.match(av('aterbetalning').titel, /2 pending/);
  assert.match(av('ofullbordade').titel, /4 paid orders/);
  assert.match(av('sparning').titel, /3 fulfilled orders/);
  assert.match(av('topp_var_ar_ordern').titel, /38%/, '3 av 8 ärenden');
  assert.match(av('sop').titel, /Product question/);
  assert.match(av('tvistgrad').titel, /1,2%/);
  assert.match(av('tvistgrad').varfor, /above the card networks|4 chargebacks on 1,?739 orders/);
  assert.equal(av('tvistgrad').agare, 'Axel');
});

test('en lugn vecka ger inga påhittade åtgärder', () => {
  const lugn = resultat({
    arenden: [arende('produktfraga', { besvarad: true, larmObesvarad: false, timmarObesvarad: 0 })],
    sammanfattning: { antalArenden: 1, spam: 0, obesvarade: 0, larmObesvarade: 0, besvaradeMedTid: 1, medianSvarstidTimmar: 3, antalMejl: 12, topp: [{ id: 'produktfraga', antal: 1, obesvarade: 0, larm: 0, exempel: [] }] },
    risk: { poang: 0, niva: NIVAER[0], tvistgrad: 0, underlag: { ordrar: 100, chargebacks: 0, forfragningar: 0, dagar: 30 }, signaler: [], atgarder: [] },
    tvister: { tillganglig: true, lista: [] },
    sop: { antalSop: 35, tackta: [{ id: 'produktfraga', sop: 'Product questions' }], saknas: [] },
  });
  const plan = byggAtgardsplan(lugn, { nu: NU });
  assert.deepEqual(plan.filter((a) => a.hink === 'nu'), [], 'inget brinner');
  assert.ok(!plan.some((a) => a.id === 'backlogg' || a.id === 'svarstid' || a.id === 'tvistgrad'));
  assert.ok(plan.every((a) => a.hink === 'process'), 'bara process kvar');
});

test('utan Shopify nämns aldrig tvister som noll', () => {
  const utan = resultat({ tvister: { tillganglig: false, lista: [], orsak: 'Shopify inte kopplat' }, risk: { ...resultat().risk, tvistgrad: null, underlag: { ordrar: 0, chargebacks: null, forfragningar: null, dagar: 30 } } });
  const plan = byggAtgardsplan(utan, { nu: NU });
  assert.ok(!plan.some((a) => ['tvister', 'inquiries', 'tvistgrad'].includes(a.id)), 'inga tviståtgärder utan data');
  assert.equal(pengarIRisk(utan).belopp, 0);
});

test('pengarIRisk summerar bara ÖPPNA tvister', () => {
  const p = pengarIRisk(resultat());
  assert.equal(p.belopp, 1498);
  assert.equal(p.antal, 2);
  assert.equal(p.valuta, 'SEK');
});

// -------------------------------------------------------------- Dashboard

test('dashboard-datan maskerar kunden överallt och bär hela flödet', () => {
  const d = byggDashboard(resultat(), { nu: NU });
  const json = JSON.stringify(d);
  assert.ok(!json.includes('kalle.karlsson@gmail.com'), 'ingen adress i klartext');
  assert.ok(json.includes('ka***@gmail.com'), 'maskerad adress finns');
  assert.equal(d.namn, 'Demobutiken');
  assert.equal(d.vecka, '2026-W38');
  assert.deepEqual(d.kallflode, { mejl: 264, arenden: 8, spam: 2, autosvar: 5, system: 61, listmejl: 12, utanAvsandare: 0 });
  assert.equal(d.nyckeltal.risk, 100);
  assert.equal(d.nyckeltal.pengarIRisk, 1498);
  assert.equal(d.nyckeltal.chargebacks, 4);
  assert.equal(d.nyckeltal.forra.arenden, 6);
  assert.equal(d.arenden.length, 8);
  assert.equal(d.arenden[0].kund, 'ka***@gmail.com');
  assert.deepEqual(d.arenden[0].ordernummer, ['5054']);
  assert.equal(d.tvister.length, 3);
  assert.equal(d.tvister[0].oppen, true);
  assert.ok(d.plan.length >= 10, `bara ${d.plan.length} åtgärder`);
});

test('kategorierna bär SOP-status, andel och förra veckan', () => {
  const d = byggDashboard(resultat(), { nu: NU });
  const wismo = d.kategorier.find((k) => k.id === 'var_ar_ordern');
  assert.equal(wismo.en, 'Where is my order (WISMO)');
  assert.equal(wismo.andel, 38);
  assert.equal(wismo.forra, 2);
  assert.equal(wismo.sop, 'covered');
  assert.equal(wismo.sopTitel, 'Questions about delivery timeframe');
  assert.equal(d.kategorier.find((k) => k.id === 'produktfraga').sop, 'missing');
});

test('ärende- och tvistraden plattas ut till det sidan visar', () => {
  const a = arendeRad(arende('ej_levererad'));
  assert.equal(a.kategoriEn, 'Never delivered');
  assert.equal(a.vikt, 3);
  assert.equal(a.larm, true);
  assert.equal(a.timmarObesvarad, 150);
  assert.ok(!a.utdrag.includes('kalle.karlsson'), 'utdraget maskeras också');
  const x = tvistRad({ typ: 'inquiry', orsak: 'product_not_received', status: 'needs_response', belopp: '599.00', valuta: 'SEK', ordernamn: '#1', evidensSenast: '2026-09-28' });
  assert.equal(x.orsak, 'product not received');
  assert.equal(x.status, 'needs response');
  assert.equal(x.oppen, true);
  assert.equal(x.belopp, 599);
});

test('samlaDashboard läser veckofilerna och historiken, sorterar brands på risk', () => {
  const rot = mkdtempSync(join(tmpdir(), 'dash-'));
  const korningar = join(rot, 'korningar');
  const historik = join(rot, 'historik');
  mkdirSync(join(korningar, '_ranking'), { recursive: true });
  mkdirSync(historik, { recursive: true });

  const lagg = (id, vecka, risk) => {
    mkdirSync(join(korningar, id), { recursive: true });
    const d = byggDashboard(resultat({ brand: { ...resultat().brand, id, brand: id }, vecka, risk: { ...resultat().risk, poang: risk } }), { nu: NU });
    writeFileSync(join(korningar, id, `${vecka}.json`), JSON.stringify(d));
  };
  lagg('demo', '2026-W37', 40);
  lagg('demo', '2026-W38', 100);
  lagg('lugn', '2026-W38', 10);
  writeFileSync(join(korningar, 'demo', '2026-W38.md'), '# markdown ignoreras');
  writeFileSync(join(historik, 'demo.jsonl'), [
    JSON.stringify({ vecka: '2026-W37', riskPoang: 40, antalArenden: 6, larmObesvarade: 3, tvistgrad: 0.8, tvister: 2 }),
    JSON.stringify({ vecka: '2026-W38', riskPoang: 100, antalArenden: 8, larmObesvarade: 6, tvistgrad: 1.2, tvister: 4 }),
    'trasig rad',
  ].join('\n') + '\n');

  const d = samlaDashboard({ korningar, historik, nu: NU });
  assert.equal(d.version, 2);
  assert.deepEqual(d.brands.map((b) => b.id), ['demo', 'lugn'], 'högst risk först');
  const demo = d.brands[0];
  assert.equal(demo.vecka, '2026-W38', 'senaste veckan visas');
  assert.deepEqual(demo.veckor, ['2026-W37', '2026-W38']);
  assert.deepEqual(demo.historik.map((h) => h.risk), [40, 100]);
  assert.equal(demo.arkiv['2026-W37'].nyckeltal.risk, 40);
  assert.equal(d.brands[1].historik.length, 0, 'brand utan historikfil får tom lista, inte krasch');
});

test('skrivDashboard skriver en fil per vecka och brand', () => {
  const rot = mkdtempSync(join(tmpdir(), 'dash-skriv-'));
  const fil = skrivDashboard(resultat(), { korningar: rot });
  assert.match(fil, /demo\/2026-W38\.json$/);
  assert.equal(JSON.parse(readFileSync(fil, 'utf8')).nyckeltal.risk, 100);
});

test('tomt repo ger en tom men giltig sida-data', () => {
  const rot = mkdtempSync(join(tmpdir(), 'dash-tom-'));
  const d = samlaDashboard({ korningar: join(rot, 'x'), historik: join(rot, 'y'), nu: NU });
  assert.deepEqual(d.brands, []);
  assert.equal(d.version, 2);
});

// ------------------------------------------------------------------ Sidan

test('sidan bakas in i mallen och </script> i datan kan inte bryta sidan', () => {
  const rot = mkdtempSync(join(tmpdir(), 'sida-'));
  const mall = join(rot, 'mall.html');
  const ut = join(rot, 'ut.html');
  writeFileSync(mall, '<script>const DATA = __DATA__;</script>');
  byggSida({ mall, ut, data: { version: 2, brands: [{ id: 'x', amne: '<p></script>oj</p>' }] } });
  const html = readFileSync(ut, 'utf8');
  assert.ok(html.startsWith('<script>const DATA = {"version":2'));
  assert.ok(!html.includes('</script>oj'), 'avslutstaggen i datan ska vara bruten');
  assert.match(html, /<\\\/script>oj/);
  writeFileSync(mall, '<p>utan platshållare</p>');
  assert.throws(() => byggSida({ mall, ut, data: {} }), /__DATA__/);
});

test('den riktiga mallen har platshållaren, titeln, båda språken och ingen runtime-capability', () => {
  const mall = readFileSync(new URL('../rapport-sida.html', import.meta.url), 'utf8');
  assert.match(mall, /const DATA = __DATA__;/);
  assert.match(mall, /^<title>Support Control Room<\/title>/);
  assert.ok(!/window\.claude/.test(mall), 'sidan ska funka utan Claude-konto');
  assert.match(mall, /T = \{[\s\S]*en: \{[\s\S]*sv: \{/, 'etiketter på båda språken');
  assert.match(mall, /data-theme="dark"/, 'mörkt läge');
  assert.match(mall, /prefers-color-scheme: dark/);
});
