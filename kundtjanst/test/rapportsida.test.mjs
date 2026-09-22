// Tester för hemsidan: åtgärdsmotorn, dashboard-datan och inbakningen.
// Inget nätverk, inga riktiga körningar — bara ett resultatobjekt in, data ut.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { byggAtgardsplan, planPerHink, pengarIRisk, HINKAR } from '../atgardsplan.mjs';
import { byggDashboard, skrivDashboard, samlaDashboard, arendeRad, tvistRad, planUrDashboard, samlaAutosvar, brevladaRad, X_EN, samlaTvister, tvistRadLive, sorteraTvister, dagarTill, skickaInSenast, tvistLage } from '../dashboard.mjs';
import { byggSida, hamtaVaKo, korTvistkoll, TVISTKOLL_ARGS, lasHandbok } from '../rapportsida.mjs';
import { oversikt } from '../autosvar/oversikt.mjs';
import { dagarKvar } from '../tvistkoll.mjs';
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

test('planen går att räkna om ur den sparade filen — samma åtgärder, färska ord', () => {
  const r = resultat();
  const d = byggDashboard(r, { nu: NU });
  const ur = planUrDashboard(JSON.parse(JSON.stringify(d)), { nu: NU });
  assert.deepEqual(ur.map((a) => a.id), byggAtgardsplan(r, { nu: NU }).map((a) => a.id), 'samma regler fyrar');
  const tv = ur.find((a) => a.id === 'tvister');
  assert.match(tv.varfor, /1[ ,]?498 SEK/);
  assert.match(tv.varfor, /2026-09-23/);
  assert.match(ur.find((a) => a.id === 'backlogg').titel, /6 tickets/);
  assert.match(ur.find((a) => a.id === 'inquiries').titel, /1 open bank inquiry —/, 'singular, inte "inquiryies"');
});

test('utan Shopify skrivs inga tviståtgärder när planen räknas om ur filen', () => {
  const utan = byggDashboard(resultat({ tvister: { tillganglig: false, lista: [], orsak: 'Shopify inte kopplat' } }), { nu: NU });
  assert.equal(utan.tvisterTillgangliga, false);
  const plan = planUrDashboard(JSON.parse(JSON.stringify(utan)), { nu: NU });
  assert.ok(!plan.some((a) => ['tvister', 'inquiries'].includes(a.id)), 'tomt är inte samma sak som noll');
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

// ------------------------------------------------------------- Autosvaret

/** En logg som motorn skriver den: maskerad kund, en rad per mejl och körning. */
function autosvarLogg() {
  const rad = (extra) => JSON.stringify({ tid: '2026-09-21T06:00:00.000Z', brand: 'demo', uid: 1, messageId: '<a@x>', kund: 'ka***@gmail.com', kundHash: 'abc', amne: 'Var är min order #5054', hink: 'ENKEL', typ: 'wismo', kategori: 'var_ar_ordern', ordernummer: ['5054'], sprak: 'sv', orsak: 'enkel wismo', atgard: 'utkast', torr: true, flaggad: true, ...extra });
  return [
    // Samma mejl två gånger — den äldre raden (SVÅR) ska förlora mot den nya (ENKEL, utkast).
    rad({ tid: '2026-09-20T06:00:00.000Z', hink: 'SVÅR', typ: null, atgard: 'flaggad', torr: true }),
    rad({}),
    rad({ uid: 2, messageId: '<b@x>', kund: 'mo***@gmail.com', amne: 'Skräp order #6600', hink: 'ARG', typ: null, kategori: 'aterbetalning', ordernummer: ['6600'], orsak: 'argt ordval', atgard: 'utkast', torr: true, flaggad: true, flyttad: 'INBOX.VA-PRIO', x: 'kvalitet', lage: false, retur: true }),
    rad({ uid: 3, messageId: '<c@x>', kund: 'br***@gmail.com', amne: 'Hello', hink: 'SVÅR', typ: null, kategori: 'ovrigt', ordernummer: [], sprak: 'en', orsak: 'kategori ovrigt — VA:n', atgard: 'flaggad', torr: true, flaggad: true }),
    rad({ uid: 4, messageId: '<d@x>', kund: 'ny***@shopify.com', amne: 'Nyhetsbrev', hink: 'SKIP', typ: null, kategori: null, ordernummer: [], orsak: 'listmejl', atgard: 'hoppad', torr: true, flaggad: false }),
    rad({ uid: 5, messageId: '<e@x>', kund: 'fe***@gmail.com', amne: 'Adressbyte', hink: 'ENKEL', typ: 'adress', atgard: 'fel', fel: 'Roundcube sa nej (302) för lisa.fel@gmail.com', flaggad: false }),
    // Utanför fönstret (60 dagar gammal) — räknas inte.
    rad({ tid: '2026-07-20T06:00:00.000Z', uid: 6, messageId: '<f@x>', hink: 'ENKEL', atgard: 'svar', torr: false }),
  ].join('\n') + '\n';
}

test('samlaAutosvar visar oversikt.mjs:s tal rakt av — inget räknas om, adresser maskerade', () => {
  const NU2 = new Date('2026-09-22T12:00:00Z');
  const rot = mkdtempSync(join(tmpdir(), 'autosvar-'));
  writeFileSync(join(rot, 'demo.jsonl'), autosvarLogg());
  writeFileSync(join(rot, 'tom.jsonl'), '');
  const a = samlaAutosvar({ loggmapp: rot, nu: NU2, dagar: 30 });
  assert.equal(a.dagar, 30);
  assert.deepEqual(Object.keys(a.brands), ['demo'], 'en tom logg ger ingen butik');
  const d = a.brands.demo;
  // Samma funktion, samma rader ⇒ exakt samma tal. Det är hela regel 4.
  const facit = oversikt(JSON.parse(`[${autosvarLogg().trim().split('\n').join(',')}]`), { nu: NU2, dagar: 30 });
  assert.deepEqual(d.antal, facit.antal);
  assert.deepEqual(d.perDag, facit.perDag);
  assert.equal(d.antal.mejl, 5, 'dubbletten och den gamla raden räknas bort');
  assert.equal(d.antal.utkast, 2);
  assert.equal(d.antal.svar, 0, 'torrkörningens utkast är inte skickade svar');
  assert.equal(d.antal.ARG, 1);
  assert.equal(d.antal.tillVa, 1, 'bara SVÅR-raden väntar på VA:n — de två utkasten räknas som svarade');
  assert.equal(d.arga[0].x, 'kvalitet');
  assert.equal(d.arga[0].retur, true);
  assert.equal(d.arga[0].torr, true);
  assert.equal(d.fel.length, 1);
  assert.equal(d.brevlada, null, 'brevlådan fylls av rapportsida.mjs, inte här');
  assert.equal(a.etiketter.x.kvalitet, X_EN.kvalitet);
  const json = JSON.stringify(a);
  assert.ok(!json.includes('lisa.fel@gmail.com'), 'ett felmeddelande med en adress maskeras');
  assert.ok(json.includes('li***@gmail.com'));
  assert.ok(!/[\w.+-]{3,}@gmail\.com/.test(json.replace(/\*\*\*@/g, '@X')), 'ingen omaskerad adress någonstans');
});

test('samlaDashboard bär autosvaret bredvid veckorapporten', () => {
  const rot = mkdtempSync(join(tmpdir(), 'dash-auto-'));
  mkdirSync(join(rot, 'logg'));
  writeFileSync(join(rot, 'logg', 'demo.jsonl'), autosvarLogg());
  const d = samlaDashboard({ korningar: join(rot, 'x'), historik: join(rot, 'y'), loggmapp: join(rot, 'logg'), nu: new Date('2026-09-22T12:00:00Z') });
  assert.equal(d.version, 2, 'veckofilernas format är oförändrat');
  assert.equal(d.autosvar.brands.demo.antal.mejl, 5);
  const utan = samlaDashboard({ korningar: join(rot, 'x'), historik: join(rot, 'y'), loggmapp: join(rot, 'finns-inte'), nu: NU });
  assert.deepEqual(utan.autosvar.brands, {}, 'ingen loggmapp ⇒ inga butiker, ingen krasch');
});

test('brevlådans rader maskeras innan de hamnar på sidan', () => {
  const r = brevladaRad({ uid: '17', fran: 'Kalle Karlsson', franAdress: 'kalle.karlsson@gmail.com', amne: 'Svar till kalle.karlsson@gmail.com', datum: 'Today 09:12', last: 0, flaggad: 1 });
  assert.equal(r.uid, 17);
  assert.equal(r.fran, 'ka***@gmail.com');
  assert.equal(r.amne, 'Svar till ka***@gmail.com');
  assert.equal(r.last, false);
  assert.equal(r.flaggad, true);
});

test('hamtaVaKo: läser VA-mappen live när nyckeln finns, säger varför annars — och rör ingenting', async () => {
  const bas = { brands: { demo: { antal: {}, brevlada: null }, utan: { antal: {}, brevlada: null }, trasig: { antal: {}, brevlada: null }, okand: { antal: {}, brevlada: null } } };
  const anrop = [];
  const konfigFor = (id) => ({
    demo: { finns: true, konfigurerad: true, saknas: [], vaMapp: 'VA-PRIO' },
    utan: { finns: true, konfigurerad: false, saknas: ['KUNDTJANST_MAIL_PASS_UTAN'], vaMapp: 'VA-PRIO' },
    trasig: { finns: true, konfigurerad: true, saknas: [], vaMapp: 'VA-PRIO' },
    okand: { finns: false },
  })[id];
  const oppna = (id) => ({
    async lista({ mapp, antal }) {
      anrop.push(['lista', id, mapp, antal]);
      if (id === 'trasig') throw Object.assign(new Error('Mappen VA-PRIO finns inte i brevlådan (INBOX, Sent) — skriv till anna@kund.se'), { kod: 'MAPP_SAKNAS' });
      return { mapp: 'INBOX.VA-PRIO', totalt: 3, olasta: 2, rader: [{ uid: 5, fran: 'Anna', franAdress: 'anna.andersson@kund.se', amne: 'ARG', datum: 'Today 09:12', last: 0, flaggad: 1 }] };
    },
    async loggaUt() { anrop.push(['ut', id]); },
  });
  const ut = await hamtaVaKo(bas, { konfigFor, oppna, nu: new Date('2026-09-22T12:00:00Z') });
  const demo = ut.brands.demo.brevlada;
  assert.equal(demo.status, 'ok');
  assert.equal(demo.totalt, 3);
  assert.equal(demo.olasta, 2);
  assert.equal(demo.mapp, 'INBOX.VA-PRIO');
  assert.equal(demo.rader[0].fran, 'an***@kund.se', 'avsändaren maskeras');
  assert.equal(ut.brands.utan.brevlada.status, 'saknas');
  assert.match(ut.brands.utan.brevlada.orsak, /KUNDTJANST_MAIL_PASS_UTAN/, 'variabelnamnet står i orsaken');
  assert.equal(ut.brands.trasig.brevlada.status, 'saknas');
  assert.match(ut.brands.trasig.brevlada.orsak, /does not exist/);
  assert.equal(ut.brands.okand.brevlada.status, 'saknas');
  // Bara listningar och utloggningar — aldrig las/flytta/radera, och alltid utloggad efteråt.
  assert.deepEqual(anrop, [['lista', 'demo', 'VA-PRIO', 50], ['ut', 'demo'], ['lista', 'trasig', 'VA-PRIO', 50], ['ut', 'trasig']]);
  assert.ok(!JSON.stringify(ut).includes('anna@kund.se') && !JSON.stringify(ut).includes('anna.andersson@'), 'adresser i fel och rader maskeras');
});

// -------------------------------------------------------------- Tvisterna

const NU_TV = new Date('2026-09-22T12:00:00Z');
const SNAP_TV = {
  byggd: '2026-09-22T16:06:08.517Z',
  kundtjanst: { brands: [{ id: 'baverbutiken', namn: 'Bäverbutiken' }] },
  oppnaTvister: [
    { order: '#5763', brand: 'baverbutiken', typ: 'inquiry', belopp: 100, valuta: 'SEK', deadline: '2026-10-02', initierad: '2026-09-13', status: 'needs response', besvarad: false, utfall: null, oppen: true },
    { order: '#5584', brand: 'baverbutiken', typ: 'chargeback', belopp: 348, valuta: 'SEK', deadline: '2026-09-23', initierad: '2026-09-10', status: 'needs response', besvarad: false, utfall: null, oppen: true },
    { order: '17666239660381', brand: 'baverbutiken', typ: 'inquiry', belopp: 255, valuta: 'SEK', deadline: '2026-09-28', status: 'needs response', oppen: true },
    { order: '#5122', brand: 'baverbutiken', typ: 'inquiry', belopp: 348, valuta: 'SEK', deadline: '2026-09-21', status: 'needs response', oppen: true },   // försenad
    { order: '#5200', brand: 'baverbutiken', typ: 'inquiry', belopp: 900, valuta: 'SEK', deadline: '2026-09-22', status: 'needs_response', oppen: true },   // i dag
    { order: '#5300', brand: 'baverbutiken', typ: 'inquiry', belopp: 50, valuta: 'SEK', deadline: '2026-09-25', status: 'under_review', oppen: true },
    { order: '#9', brand: 'baverbutiken', typ: 'chargeback', belopp: 1, valuta: 'SEK', deadline: '2026-09-01', status: 'won', oppen: false },              // stängd
    { order: '#77', brand: 'carashell', typ: 'inquiry', belopp: 1129, valuta: 'SEK', deadline: '2026-09-29', status: 'needs response', oppen: true },
    { order: '#88', brand: 'carashell', typ: 'inquiry', belopp: 99, valuta: 'USD', deadline: '2026-09-30', status: 'needs response', oppen: true },
  ],
};
const KOLL_TV = { status: 'ok', hamtad: '2026-09-22T12:00:00Z', orsak: null, brands: [
  { brand: 'baverbutiken', tillganglig: true, orsak: null, tvister: 50, bradskande: [
    { order: '#5584', typ: 'chargeback', orsak: 'credit_not_processed', belopp: 348, valuta: 'SEK', deadline: '2026-09-23', kvar: 1 },
    { order: '#5122', typ: 'inquiry', orsak: 'product_unacceptable', belopp: 348, valuta: 'SEK', deadline: '2026-09-21', kvar: -1 },
    { order: '#5200', typ: 'inquiry', orsak: 'product_not_received', belopp: 900, valuta: 'SEK', deadline: '2026-09-22', kvar: 0 },
    { order: '#6000', typ: 'chargeback', orsak: 'fraudulent', belopp: 599, valuta: 'SEK', deadline: '2026-09-24', kvar: 2 },   // nyare än snapshoten
  ] },
  { brand: 'carashell', tillganglig: false, orsak: 'Shopify inte kopplat (saknar SHOPIFY_CLIENT_ID_CARASHELL, SHOPIFY_CLIENT_SECRET_CARASHELL)', tvister: 0, bradskande: [] },
  { brand: 'tacklebay', tillganglig: false, orsak: 'app_not_installed', tvister: 0, bradskande: [] },
] };
const BRANDS_TV = [{ id: 'baverbutiken', namn: 'Bäverbutiken' }, { id: 'carashell', namn: 'CaraShell' }, { id: 'tacklebay', namn: 'TackleBay' }, { id: 'drytrek', namn: 'DryTrek' }];

test('dagarTill räknar exakt som tvistkoll.dagarKvar, och submit by är dagen före deadline', () => {
  for (const d of ['2026-09-21', '2026-09-22', '2026-09-23', '2026-10-02', null, 'trasigt']) assert.equal(dagarTill(d, NU_TV), dagarKvar(d, NU_TV), String(d));
  assert.equal(skickaInSenast('2026-09-23'), '2026-09-22');
  assert.equal(skickaInSenast('2026-10-01'), '2026-09-30');
  assert.equal(skickaInSenast(null), null);
  // Försenad och i dag är två lägen — aldrig samma.
  assert.equal(tvistLage(-1), 'forsenad');
  assert.equal(tvistLage(0), 'idag');
  assert.equal(tvistLage(3), 'bradskande');
  assert.equal(tvistLage(4), 'kommande');
  assert.equal(tvistLage(null), 'okand');
});

test('sorteringen: chargebacks först, sedan kvar stigande, sedan belopp fallande', () => {
  const rader = sorteraTvister([
    { order: 'a', typ: 'inquiry', kvar: -2, belopp: 900 },
    { order: 'b', typ: 'chargeback', kvar: 5, belopp: 10 },
    { order: 'c', typ: 'chargeback', kvar: 1, belopp: 348 },
    { order: 'd', typ: 'inquiry', kvar: 1, belopp: 50 },
    { order: 'e', typ: 'inquiry', kvar: 1, belopp: 500 },
    { order: 'f', typ: 'inquiry', kvar: null, belopp: 5 },
  ]);
  assert.deepEqual(rader.map((r) => r.order), ['c', 'b', 'a', 'e', 'd', 'f']);
});

test('samlaTvister: tvistkollens kvar och orsak vinner, snapshoten ger resten, valutor summeras aldrig, okända brands står med orsak ordagrant', () => {
  const d = samlaTvister({ snapshot: SNAP_TV, tvistkoll: KOLL_TV, brands: BRANDS_TV, nu: NU_TV, handbok: lasHandbok() });
  assert.equal(d.snapshotByggd, SNAP_TV.byggd);
  assert.equal(d.kollStatus, 'ok');
  assert.ok(d.handbok?.start?.startsWith('https://app.notion.com/'), 'handbokslänken följer med');
  assert.deepEqual(d.brands.map((b) => b.id), ['baverbutiken', 'carashell', 'drytrek', 'tacklebay'], 'lästa först, sedan okända — och alla kända brands finns');

  const bb = d.brands[0];
  assert.equal(bb.tillganglig, true);
  assert.equal(bb.tvister180, 50);
  assert.deepEqual(bb.oppna.map((r) => r.order), ['#5584', '#6000', '#5122', '#5200', '#5300', '17666239660381', '#5763'], 'chargebacks överst, sedan kvar, stängda bort');
  const cb = bb.oppna[0];
  assert.equal(cb.kvar, 1); assert.equal(cb.kvarFran, 'tvistkoll'); assert.equal(cb.orsak, 'credit not processed'); assert.equal(cb.bradskande, true);
  assert.equal(cb.submitBy, '2026-09-22');
  const ny = bb.oppna[1];
  assert.equal(ny.order, '#6000'); assert.equal(ny.kvar, 2); assert.equal(ny.status, 'needs response', 'tvistkollens nya rad, snapshoten hann inte se den');
  assert.equal(bb.oppna.find((r) => r.order === '#5122').lage, 'forsenad');
  assert.equal(bb.oppna.find((r) => r.order === '#5200').lage, 'idag', 'går ut i dag ≠ försenad');
  const ur = bb.oppna.find((r) => r.order === '#5300');
  assert.equal(ur.underReview, true); assert.equal(ur.status, 'under review'); assert.equal(ur.kvarFran, 'sidan'); assert.equal(ur.kvar, 3);
  assert.equal(bb.oppna.find((r) => r.order === '17666239660381').orderArId, true, 'ett order-id kallas för vad det är, inget påhittat #');
  assert.deepEqual(bb.pengarIRisk, { SEK: 100 + 348 + 255 + 348 + 900 + 50 + 599 });
  assert.deepEqual(bb.antal, { oppna: 7, chargebacks: 2, forsenade: 1, idag: 1, bradskande: 4, underReview: 1 });
  assert.ok(!bb.oppna.some((r) => r.order === '#9'), 'stängda tvister visas inte');

  const cs = d.brands.find((b) => b.id === 'carashell');
  assert.equal(cs.tillganglig, false, 'tvistkollen kunde inte läsa — okänt, inte noll');
  assert.equal(cs.orsak, 'Shopify inte kopplat (saknar SHOPIFY_CLIENT_ID_CARASHELL, SHOPIFY_CLIENT_SECRET_CARASHELL)', 'orsaken ordagrant');
  assert.deepEqual(cs.pengarIRisk, { SEK: 1129, USD: 99 }, 'två valutor, två tal — aldrig en summa');
  assert.equal(cs.oppna.length, 2, 'snapshotens rader visas ändå');
  assert.equal(cs.tvister180, null, 'en oläst butik svarar 0 på 180 dagar — det är okänt, aldrig noll');
  assert.equal(cs.oppna[0].kvarFran, 'sidan');

  assert.equal(d.brands.find((b) => b.id === 'tacklebay').orsak, 'app_not_installed');
  const dt = d.brands.find((b) => b.id === 'drytrek');
  assert.equal(dt.tillganglig, null, 'inte i tvistkollens svar och inget i snapshoten — okänt, med orsak');
  assert.equal(dt.antal.oppna, 0);
  assert.ok(!JSON.stringify(d).match(/FIGHT|REFUND|ESCALATE|WAIT/), 'ingen dom någonstans');
  assert.ok(!JSON.stringify(d).match(/@/), 'inga kunduppgifter');
});

test('samlaTvister utan tvistkoll: snapshoten räcker, brådskan står som inte läst', () => {
  const d = samlaTvister({ snapshot: SNAP_TV, tvistkoll: null, brands: BRANDS_TV, nu: NU_TV });
  assert.equal(d.kollStatus, 'saknas');
  const bb = d.brands.find((b) => b.id === 'baverbutiken');
  assert.equal(bb.tillganglig, true);
  assert.equal(bb.oppna[0].order, '#5584');
  assert.equal(bb.oppna[0].kvar, 1, 'räknat av sidan med samma formel');
  assert.equal(bb.oppna[0].kvarFran, 'sidan');
  assert.equal(bb.tvister180, null);
  assert.match(d.brands.find((b) => b.id === 'drytrek').orsak, /urgency not read/);
});

test('korTvistkoll kör alltid torrt, tolkar JSON:en även med varningstext efter, och ett fel blir ett läge — inte en krasch', async () => {
  const anrop = [];
  const ut = await korTvistkoll({ nu: NU_TV, kor: async (args) => { anrop.push(args); return `${JSON.stringify(KOLL_TV.brands)}\n\n⚠️ Tvisterna kunde inte läsas för: CaraShell (Shopify inte kopplat (saknar X))\n`; } });
  assert.equal(ut.status, 'ok');
  assert.equal(ut.brands.length, 3);
  assert.deepEqual(anrop[0], [...TVISTKOLL_ARGS]);
  assert.ok(anrop[0].includes('--torr'), '--torr är inbyggt');
  assert.ok(!anrop[0].includes('--discord'), 'aldrig --discord härifrån');
  const fel = await korTvistkoll({ nu: NU_TV, kor: async () => 'inget json här' });
  assert.equal(fel.status, 'fel');
  assert.match(fel.orsak, /ingen JSON/);
  assert.deepEqual(fel.brands, []);
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

test('mallen bär autosvaret: egen sektion, utkast skilt från skickat, torrkörningen sägs rakt ut', () => {
  const mall = readFileSync(new URL('../rapport-sida.html', import.meta.url), 'utf8');
  assert.match(mall, /<section id="auto-sektion">/);
  assert.match(mall, /function ritaAutosvar\(\)/);
  assert.match(mall, /DATA\.autosvar/, 'sidan läser samlaAutosvar:s data, räknar inte om loggen');
  assert.ok(!/lasLogg|\.jsonl'\)/.test(mall.split('<script>')[1]), 'sidan läser aldrig loggen själv');
  for (const nyckel of ['draftsDry', 'dryRunText', 'inMailboxNow', 'notRead', 'upsetAbout', 'replyIncluded', 'autoNone']) {
    assert.equal((mall.match(new RegExp(`\\b${nyckel}:`, 'g')) ?? []).length, 2, `${nyckel} på båda språken`);
  }
  assert.match(mall, /Nothing has been sent to a customer/, 'utkast ≠ skickat');
  assert.match(mall, /r\.atgard === 'utkast' \? `<span class="stampel gul">/, 'utkast får egen stämpel');
  assert.match(mall, /r\.atgard === 'svar' \? `<span class="stampel gron">/, 'skickat får en annan');
});

test('mallen bär tvisterna: egen sektion, försenad ≠ i dag, aldrig "submit now", aldrig "lost automatically", ingen dom', () => {
  const mall = readFileSync(new URL('../rapport-sida.html', import.meta.url), 'utf8');
  assert.match(mall, /<section id="tvist-alla-sektion">/);
  assert.match(mall, /function ritaTvisterAlla\(\)/);
  assert.match(mall, /DATA\.tvister/);
  assert.ok(!/submit now/i.test(mall), 'bevisen skickas in sist — aldrig "submit now"');
  assert.ok(!/lost automatically/i.test(mall), 'en obesvarad inquiry förloras inte — den eskalerar');
  assert.ok(!/\b(FIGHT|REFUND|ESCALATE)\b/.test(mall), 'ingen dom på sidan');
  assert.match(mall, /r\.lage === 'forsenad' \? `<span class="stampel rod">\$\{t\(\)\.overdue\}/, 'försenad har egen stämpel');
  assert.match(mall, /r\.lage === 'idag' \? `<span class="stampel rod">\$\{t\(\)\.dueToday\}/, 'går ut i dag har en annan');
  assert.match(mall, /r\.underReview \? `<span class="stampel gron">\$\{t\(\)\.underReview\}/, 'under review kallas aldrig obesvarad');
  for (const nyckel of ['tvistAlla', 'tvistAllaIngress', 'submitBy', 'dueToday', 'overdue', 'unknownBrand', 'moneyAtRisk', 'handbook', 'urgencyFromSnapshot', 'fullReason', 'dayOverdue', 'daysOverdue']) {
    assert.equal((mall.match(new RegExp(`\\b${nyckel}:`, 'g')) ?? []).length, 2, `${nyckel} på båda språken`);
  }
  assert.match(mall, /\$\{t\(\)\.overdue\} · \$\{forsenad\(r\.kvar\)\}/, 'en försenad tvist säger "N days overdue", aldrig "N days left"');
  assert.match(mall, /<details><summary>\$\{esc\(t\(\)\.fullReason\)\}<\/summary><pre class="orsak-full">\$\{esc\(s\)\}<\/pre><\/details>/, 'en lång orsak fälls ihop men står kvar ordagrant och escapad');
  assert.match(mall, /Reply to the customer today/, 'kundmejlet väntar aldrig');
  assert.match(mall, /day before the deadline/, 'bevisen sist');
});
