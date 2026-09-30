// Tester för erbjudanden/paket-test.mjs — utan nät. Fixturerna är temat och metaobjekten avlästa 2026-09-30
// (templates/product.json, templates/index.json, config/settings_data.json, ms_paketniva).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  lasSpec, valideraSpec, nivaFalt, nivaerUr, renderingar, renderUtanVariant, patchaProduktJson, patchaIndexJson,
  lasTestRader, aktivaTest, nyttTestVarde, bytTestRad, kodBelopp, kassaSumma, sidPris, sidaMotKassa, rabattMutation,
  planPa, planAv, tillampa, synligt, kontrolleraLage, slutlageFel, tolkaKundvy, krUrText, delaHuvud, B_BLOCK,
} from '../paket-test.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const FIX = join(ROT, 'fixturer');
const las = (f) => readFileSync(join(FIX, f), 'utf8');
const SPEC = lasSpec(join(ROT, '..', 'paket-spec-axel.json'));
const SPEC_399 = lasSpec(join(ROT, '..', 'paket-spec.json'));
const SPEC_6 = lasSpec(join(ROT, '..', 'paket-spec-6.json'));
const SPEC_299 = lasSpec(join(ROT, '..', 'paket-spec-299.json'));
const SUSHI = 'gid://shopify/Product/10286130889043';
const PINNAR = 'gid://shopify/Product/10408204468563';

function lage() {
  const m = JSON.parse(las('metaobjekt.json')).metaobjectDefinitionByType.metaobjects.nodes
    .map((n) => ({ ...n, capabilities: { publishable: { status: 'ACTIVE' } } }));
  return {
    mallar: { 'templates/product.json': las('product.json'), 'templates/index.json': las('index.json') },
    settings: las('settings_data.json'),
    nivaer: nivaerUr(m),
    koder: { 'SUSHI-K1F1': 'ACTIVE', 'SUSHI-K2F2': 'ACTIVE' },
  };
}
// Priserna avlästa 2026-09-30: 5-par 399, 3-par 369, ätpinnar 50.
const CTX = {
  produktId: SUSHI, gratisProduktId: PINNAR, standardOre: 39900, pinnOre: 5000,
  varianter: [
    { id: '52506473365843', gid: 'gid://shopify/ProductVariant/52506473365843', titel: '5 - Par / One Size', prisOre: 39900 },
    { id: '52506473398611', gid: 'gid://shopify/ProductVariant/52506473398611', titel: '3 - Par / One Size', prisOre: 36900 },
  ],
  pinnVariant: '52940241207635', pinnVariantGid: 'gid://shopify/ProductVariant/52940241207635', startsAt: '2026-10-01T00:00:00Z',
};
const SIM = { produktId: SUSHI, produktHandle: 'sushi-strumpor' };
const kor = (l, steg) => steg.reduce((x, s) => tillampa(x, s), l);

test('dagens läge: testet av, alla ser sushi-2 och sushi-4 på produktsidan och startsidan', () => {
  const l = lage();
  assert.deepEqual(aktivaTest(lasTestRader(l.settings)), []);
  assert.deepEqual(kontrolleraLage(l, SIM), []);
  for (const b of ['a', 'b']) for (const sida of ['product', 'index']) {
    assert.deepEqual(synligt(l, { sida, besokare: b, ...SIM }).filter((r) => r.nivaer.length).flatMap((r) => r.nivaer), ['sushi-2', 'sushi-4']);
  }
});

test('mallarna: startsidan renderar ms-paket utan variant, produktsidans A-block med variant a', () => {
  const l = lage();
  const utan = renderUtanVariant(l.mallar);
  assert.equal(utan.length, 1);
  assert.equal(utan[0].fil, 'templates/index.json');
  const p = renderingar(l.mallar['templates/product.json']);
  assert.deepEqual(p.map((r) => [r.block, r.test, r.testVariant, r.variant, r.mix, r.dold]), [
    ['ms_sortval', 'sortval', 'b', 'b', true, true],
    ['ms_paket', 'sortval', 'a', 'a', false, false],
  ]);
});

test('product.json-transformationen: A-blocket paket:a, B-blocket direkt efter, idempotent', () => {
  const t0 = las('product.json');
  const r1 = patchaProduktJson(t0, SPEC);
  assert.equal(r1.byten.length, 3);
  const { data, huvud } = delaHuvud(r1.text);
  assert.match(huvud, /auto-generated/);
  const bo = data.sections.main.block_order;
  assert.equal(bo[bo.indexOf('ms_paket') + 1], B_BLOCK);
  assert.match(data.sections.main.blocks.ms_paket.settings.custom_liquid, /data-ms-ab="paket:a"/);
  assert.match(data.sections.main.blocks[B_BLOCK].settings.custom_liquid, /data-ms-ab="paket:b" hidden>.*section_id: block\.id, variant: 'paket-b'/);
  // sortval-mixblocket orört
  assert.equal(data.sections.main.blocks.ms_sortval.settings.custom_liquid, delaHuvud(t0).data.sections.main.blocks.ms_sortval.settings.custom_liquid);
  const r2 = patchaProduktJson(r1.text, SPEC);
  assert.deepEqual(r2.byten, []);
  assert.equal(r2.text, r1.text);
  const i1 = patchaIndexJson(las('index.json'), SPEC);
  assert.equal(i1.byten.length, 1);
  assert.deepEqual(patchaIndexJson(i1.text, SPEC).byten, []);
  assert.equal(renderUtanVariant({ 'templates/product.json': r1.text, 'templates/index.json': i1.text }).length, 0);
});

test('settings: bara raden ms_ab_tests byts, # sortval ligger kvar', () => {
  const t = las('settings_data.json');
  const pa = nyttTestVarde(lasTestRader(t), { test: 'paket', vikter: [50, 50], pa: true });
  assert.equal(pa, '# sortval\npaket:50:50');
  const t2 = bytTestRad(t, pa);
  const diff = t.split('\n').map((r, i) => [r, t2.split('\n')[i]]).filter(([a, b]) => a !== b);
  assert.equal(diff.length, 1);
  assert.equal(diff[0][1].trim(), '"ms_ab_tests": "# sortval\\npaket:50:50"');
  assert.deepEqual(aktivaTest(lasTestRader(t2)), ['paket']);
  const av = nyttTestVarde(pa, { test: 'paket', vikter: [50, 50], pa: false });
  assert.equal(av, '# sortval\n# paket:50:50');
  assert.deepEqual(aktivaTest(av), []);
  assert.equal(nyttTestVarde(av, { test: 'paket', vikter: [50, 50], pa: true }), pa); // idempotent på/av/på
});

test('--pa: rätt ordning, varje mellanläge visar en köpruta för A och B, slutläget är specens', () => {
  const l = lage();
  const plan = planPa(l, SPEC, CTX);
  assert.deepEqual(plan.hinder, []);
  const typer = plan.steg.map((s) => s.typ);
  assert.deepEqual(typer, ['kod', 'kod', 'mall', 'mall', 'niva', 'niva', 'niva', 'niva', 'niva', 'settings']);
  assert.deepEqual(plan.steg.filter((s) => s.typ === 'niva').map((s) => s.handle), ['sushi-paket-1', 'sushi-paket-2', 'sushi-paket-4', 'sushi-2', 'sushi-4']);
  let x = l;
  for (const s of plan.steg) { x = tillampa(x, s); assert.deepEqual(kontrolleraLage(x, SIM), [], `efter ${s.typ} ${s.handle ?? s.fil ?? s.kod ?? ''}`); }
  assert.deepEqual(slutlageFel(x, SPEC), []);
  const b = synligt(x, { sida: 'product', besokare: 'b', ...SIM }).filter((r) => r.nivaer.length);
  assert.deepEqual(b.flatMap((r) => r.nivaer), ['sushi-paket-1', 'sushi-paket-2', 'sushi-paket-4']);
  assert.deepEqual(synligt(x, { sida: 'product', besokare: 'a', ...SIM }).filter((r) => r.nivaer.length).flatMap((r) => r.nivaer), ['sushi-2', 'sushi-4']);
  assert.deepEqual(synligt(x, { sida: 'index', besokare: 'b', ...SIM }).filter((r) => r.nivaer.length).flatMap((r) => r.nivaer), ['sushi-paket-1', 'sushi-paket-2', 'sushi-paket-4']);
  // idempotent: en andra planering på slutläget har inget att göra
  assert.deepEqual(planPa(x, SPEC, CTX).steg, []);
});

test('nivåerna före mallarna hade tömt startsidan (därför skrivs mallarna först)', () => {
  const l = lage();
  const plan = planPa(l, SPEC, CTX);
  const fel = plan.steg.filter((s) => s.typ === 'niva');
  const x = kor(l, fel);
  assert.ok(kontrolleraLage(x, SIM).some((f) => /^index\/.*ingen köpruta/.test(f)));
});

test('B-nivåer märkta "b" hade krockat med sortval-testets mix-2/mix-4 — specen vägrar b', () => {
  const fel = valideraSpec({ ...SPEC, b_variant: 'b' });
  assert.ok(fel.some((f) => /krockar/.test(f)));
  const l = lage();
  const plan = planPa(l, SPEC, CTX);
  const x = kor(l, plan.steg.map((s) => (s.typ === 'niva' && s.handle.startsWith('sushi-paket') ? { ...s, falt: s.falt.map((f) => (f.key === 'ab_variant' ? { ...f, value: 'b' } : f)) } : s))
    .map((s) => (s.typ === 'mall' ? { ...s, text: s.text.replaceAll("variant: 'paket-b'", "variant: 'b'") } : s)));
  assert.ok(kontrolleraLage(x, SIM).some((f) => /samma antal två gånger/.test(f)));
});

test('--av återställer i rätt ordning och lämnar aldrig A-nivåerna som a när settings säger # paket', () => {
  const pa = kor(lage(), planPa(lage(), SPEC, CTX).steg);
  const plan = planAv(pa, SPEC);
  // Efter --pa skickar alla renderingar en variant ⇒ settings först, A-nivåerna sist.
  assert.equal(plan.ordning, 'settings först');
  assert.deepEqual(plan.steg.map((s) => s.typ), ['settings', 'niva', 'niva']);
  assert.match(plan.steg[0].efter, /^# sortval\n# paket:50:50$/);
  assert.deepEqual(plan.steg.filter((s) => s.typ === 'niva').map((s) => [s.handle, s.falt[0].value]), [['sushi-2', ''], ['sushi-4', '']]);
  let x = pa;
  for (const s of plan.steg) { x = tillampa(x, s); assert.deepEqual(kontrolleraLage(x, SIM), []); }
  assert.deepEqual(slutlageFel(x, SPEC), []);
  for (const b of ['a', 'b']) assert.deepEqual(synligt(x, { sida: 'product', besokare: b, ...SIM }).filter((r) => r.nivaer.length).flatMap((r) => r.nivaer), ['sushi-2', 'sushi-4']);
  assert.deepEqual(planAv(x, SPEC).steg, []); // --av en gång till: inget att göra
  // Motbevis 1: nivåerna först medan testet är på ⇒ B-besökaren ser två "2 lådor".
  const nivaForst = tillampa(pa, plan.steg[1]);
  assert.ok(kontrolleraLage(nivaForst, SIM).some((f) => /^product\/b: samma antal två gånger/.test(f)));
  // Motbevis 2: finns en rendering utan variant (opatchad startsida) blir ordningen den omvända — och settings
  // först hade då lämnat startsidans köpruta tom.
  const opatchad = { ...pa, mallar: { ...pa.mallar, 'templates/index.json': las('index.json') } };
  const plan2 = planAv(opatchad, SPEC);
  assert.equal(plan2.ordning, 'nivåer först');
  assert.deepEqual(plan2.steg.map((s) => s.typ), ['niva', 'niva', 'settings']);
  const settingsForst = tillampa(opatchad, plan2.steg.at(-1));
  assert.equal(slutlageFel(settingsForst, SPEC).length, 2);
  assert.ok(kontrolleraLage(settingsForst, SIM).some((f) => /^index\/.*ingen köpruta/.test(f)));
  let y = opatchad;
  for (const s of plan2.steg) y = tillampa(y, s);
  assert.deepEqual(slutlageFel(y, SPEC), []);
});

test('spec med okänd rabattkod stoppar --skarpt (paket-spec-6 SUSHI-K3F3, paket-spec-299 SUSHI-1LADA)', () => {
  for (const [spec, kod] of [[SPEC_6, 'SUSHI-K3F3'], [SPEC_299, 'SUSHI-1LADA']]) {
    const plan = planPa(lage(), spec, CTX);
    assert.deepEqual(plan.hinder, [], JSON.stringify(plan.hinder));
    assert.ok(plan.skarptHinder.some((h) => h.startsWith(kod) && /finns inte/.test(h)), JSON.stringify(plan.skarptHinder));
    assert.ok(!plan.steg.some((s) => s.typ === 'kod'));
  }
  // paket-spec.json använder bara koder som finns ⇒ inga skarpa hinder
  assert.deepEqual(planPa(lage(), SPEC_399, CTX).skarptHinder, []);
  // en kod som finns men är avstängd stoppar också
  const l = { ...lage(), koder: { 'SUSHI-K1F1': 'EXPIRED', 'SUSHI-K2F2': 'ACTIVE' } };
  assert.ok(planPa(l, SPEC_399, CTX).skarptHinder.some((h) => /SUSHI-K1F1 finns men har status EXPIRED/.test(h)));
});

test('rabattkoderna ger exakt 499,00 och 799,00 kr i kassan (fasta belopp i ören, ingen procent)', () => {
  const [k2, k4] = SPEC.rabattkoder;
  const b2 = kodBelopp(k2, CTX), b4 = kodBelopp(k4, CTX);
  assert.deepEqual(b2, { belopp: 39900, minsta: 89800 });
  assert.deepEqual(b4, { belopp: 99700, minsta: 179600 });
  const v = new Set(['52506473365843', '52940241207635']);
  const korg = (lador, pinnar) => [{ variant: '52506473365843', prisOre: 39900, antal: lador }, { variant: '52940241207635', prisOre: 5000, antal: pinnar }];
  assert.equal(kassaSumma(korg(2, 2), { varianter: v, ...b2 }), 49900);
  assert.equal(kassaSumma(korg(4, 4), { varianter: v, ...b4 }), 79900);
  // pinnarna bort ur korgen ⇒ under minsta delsumman ⇒ ingen rabatt (inget att tjäna på att ta bort dem)
  assert.equal(kassaSumma(korg(2, 0), { varianter: v, ...b2 }), 79800);
  assert.equal(kassaSumma(korg(4, 0), { varianter: v, ...b4 }), 159600);
  // fel kod på fel paket ger aldrig ett lägre pris än nivån
  assert.equal(kassaSumma(korg(2, 2), { varianter: v, ...b4 }), 89800);
  assert.ok(kassaSumma(korg(4, 4), { varianter: v, ...b2 }) > 79900);
  // Exakt på öret för godtyckliga priser (även udda ören): kundpriset kommer alltid ut
  for (const [s, p] of [[39900, 5000], [39950, 4999], [36900, 1], [40001, 12345]]) {
    for (const d of [k2, k4]) {
      const b = kodBelopp(d, { standardOre: s, pinnOre: p });
      assert.equal(kassaSumma([{ variant: 'x', prisOre: s, antal: d.lador }, { variant: 'y', prisOre: p, antal: d.pinnar }], { varianter: new Set(['x', 'y']), ...b }), d.kundpris * 100);
    }
  }
  const m = rabattMutation(k2, b2, { varianter: ['gid5', 'gidP'], startsAt: 'T' });
  assert.match(m.query, /discountCodeBasicCreate/);
  assert.deepEqual(m.variables.d.customerGets.value, { discountAmount: { amount: '399.00', appliesOnEachItem: false } });
  assert.deepEqual(m.variables.d.minimumRequirement, { subtotal: { greaterThanOrEqualToSubtotal: '898.00' } });
  assert.equal(m.variables.d.code, 'SUSHI-2FOR499');
});

test('sidan mot kassan: 5-par stämmer, 3-par visar 439/679 kr men kassan tar 838/1 676 kr ⇒ --skarpt vägras', () => {
  const r = sidaMotKassa(SPEC, CTX);
  const rad = (h, v) => r.find((x) => x.handle === h && x.variant.startsWith(v));
  assert.deepEqual([rad('sushi-paket-2', '5').sida, rad('sushi-paket-2', '5').kassa], [49900, 49900]);
  assert.deepEqual([rad('sushi-paket-4', '5').sida, rad('sushi-paket-4', '5').kassa], [79900, 79900]);
  assert.deepEqual([rad('sushi-paket-2', '3').sida, rad('sushi-paket-2', '3').kassa], [43900, 83800]);
  assert.deepEqual([rad('sushi-paket-4', '3').sida, rad('sushi-paket-4', '3').kassa], [67900, 167600]);
  assert.deepEqual([rad('sushi-paket-1', '3').sida, rad('sushi-paket-1', '3').kassa], [36900, 36900]);
  const plan = planPa(lage(), SPEC, CTX);
  assert.equal(plan.skarptHinder.length, 2);
  // Med 3-par i koden stämmer allt (Axels andra väg)
  const med3 = { ...SPEC, rabattkoder: SPEC.rabattkoder.map((d) => ({ ...d, varianter: ['5 - Par / One Size', '3 - Par / One Size'] })) };
  assert.ok(sidaMotKassa(med3, CTX).every((x) => x.ok));
  assert.deepEqual(planPa(lage(), med3, CTX).skarptHinder, []);
  // sidPris följer snippeten: BOGO-nivån i A ger 399 kr på 5-par
  assert.equal(sidPris({ antal: 2, rabattkod: 'SUSHI-K1F1', bogo_gratis: 1, gratis_antal: 2, fastpris: 399 }, { variantOre: 39900, standardOre: 39900, pinnOre: 5000 }), 39900);
});

test('specens regler: gratis utan kod, "gratis" utan gratis, två förvalda, pris som inte stämmer', () => {
  const n = SPEC.b_nivaer;
  const med = (i, andring) => ({ ...SPEC, b_nivaer: n.map((x, j) => (j === i ? { ...x, ...andring } : x)) });
  assert.deepEqual(valideraSpec(SPEC, CTX), []);
  assert.deepEqual(valideraSpec(SPEC_399, CTX), []);
  assert.deepEqual(valideraSpec(SPEC_6, CTX), []);
  assert.deepEqual(valideraSpec(SPEC_299, CTX), []);
  assert.ok(valideraSpec(med(0, { gratis_antal: 1 }), CTX).some((f) => /utan rabattkod/.test(f)));
  assert.ok(valideraSpec(med(1, { rubrik: '2 lådor – 1 gratis' }), CTX).some((f) => /gratis/.test(f)));
  assert.ok(valideraSpec(med(0, { forvald: true }), CTX).some((f) => /förvald/.test(f)));
  assert.ok(valideraSpec(med(0, { fastpris: 349 }), CTX).some((f) => /variantpriset 399.00/.test(f)));
  assert.ok(valideraSpec(med(0, { handle: 'sushi-2' }), CTX).some((f) => /A-nivå/.test(f)));
  assert.ok(valideraSpec(med(0, { handle: 'mix-2' }), CTX).some((f) => /mix-/.test(f)));
  assert.ok(valideraSpec(SPEC, { ...CTX, befintliga: [{ handle: 'sushi-paket-2', fields: { ab_variant: 'b' } }] }).some((f) => /skriv inte över/.test(f)));
  // ett annat aktivt test stoppar --pa
  const l = lage();
  l.settings = bytTestRad(l.settings, 'sortval');
  assert.ok(planPa(l, SPEC, CTX).hinder.some((h) => /sortval/.test(h)));
});

test('nivaFalt: B-nivån får paket-b, ätpinnarna bara när gratis_antal > 0', () => {
  const f = Object.fromEntries(nivaFalt(SPEC.b_nivaer[1], { produktId: SUSHI, gratisProduktId: PINNAR, abVariant: 'paket-b' }).map((x) => [x.key, x.value]));
  assert.deepEqual([f.antal, f.fastpris, f.rabattkod, f.gratis_produkt, f.gratis_antal, f.ab_variant, f.forvald, f.bricka], ['2', '499.0', 'SUSHI-2FOR499', PINNAR, '2', 'paket-b', 'true', 'Mest populär']);
  const e = Object.fromEntries(nivaFalt(SPEC.b_nivaer[0], { produktId: SUSHI, gratisProduktId: PINNAR, abVariant: 'paket-b' }).map((x) => [x.key, x.value]));
  assert.equal(e.gratis_produkt, '');
  // nya poster skickas utan tomma fält
  const ny = planPa(lage(), SPEC, CTX).steg.find((s) => s.handle === 'sushi-paket-1');
  assert.ok(ny.falt.every((x) => x.value !== ''));
});

test('kundvyns tolkning: testet av ⇒ A; aktivt ⇒ variantens nivåer och priser', () => {
  const facit = { a: [{ rubrik: 'Köp 1 – Få 1 GRATIS', pris: 399 }, { rubrik: 'Köp 2 – Få 2 GRATIS', pris: 798 }], b: [{ rubrik: '1 låda', pris: 399 }, { rubrik: '2 lådor', pris: 499 }, { rubrik: '4 lådor', pris: 799 }] };
  const blockA = { ab: 'sortval:a', dold: false, sektion: 'shopify-section-template--1__main', nivaer: [{ rubrik: 'Köp 1 – Få 1 GRATIS', nu: '399 kr', forr: '898 kr' }, { rubrik: 'Köp 2 – Få 2 GRATIS', nu: '798,00 kr', forr: null }] };
  const blockB = { ab: 'paket:b', dold: true, sektion: 'shopify-section-template--1__main', nivaer: [{ rubrik: '1 låda', nu: '399 kr' }, { rubrik: '2 lådor', nu: '499 kr' }, { rubrik: '4 lådor', nu: '799 kr' }] };
  const av = tolkaKundvy({ cfg: { tests: [] }, attr: {}, block: [blockA, blockB] }, { test: 'paket', facit });
  assert.equal(av.testAktivt, false);
  assert.deepEqual(av.fel, []);
  const b = tolkaKundvy({ cfg: { tests: [{ id: 'paket', active: true }] }, attr: { paket: 'b' }, block: [{ ...blockA, dold: true }, { ...blockB, dold: false }] }, { test: 'paket', facit, tvingad: 'b' });
  assert.deepEqual([b.testAktivt, b.variant, b.vantad, b.fel], [true, 'b', 'b', []]);
  const tva = tolkaKundvy({ cfg: { tests: [{ id: 'paket', active: true }] }, attr: { paket: 'b' }, block: [blockA, { ...blockB, dold: false }] }, { test: 'paket', facit });
  assert.ok(tva.fel.some((f) => /2 synliga köprutor/.test(f)));
  const felpris = tolkaKundvy({ cfg: { tests: [{ id: 'paket', active: true }] }, attr: { paket: 'b' }, block: [{ ...blockB, dold: false, nivaer: [{ rubrik: '1 låda', nu: '399 kr' }, { rubrik: '2 lådor', nu: '439 kr' }, { rubrik: '4 lådor', nu: '799 kr' }] }] }, { test: 'paket', facit });
  assert.ok(felpris.fel.some((f) => /2 lådor: sidan visar 439/.test(f)));
  assert.equal(krUrText('1 197,00 kr'), 1197);
  assert.equal(krUrText('SEK 399'), 399);
  assert.equal(krUrText('1.197,50 kr'), 1197.5);
});
