// klaviyo/mejlbilder.mjs + bild:<namn> i mallar, Spoks-paketet och valideringen.
// Inget nät: registret skickas in som data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bildNamn, heroBild, bildLank, samma, byggPrompt, standardLank, kolla } from '../mejlbilder.mjs';
import { byggMejl } from '../mallar.mjs';
import { validera } from '../validera.mjs';
import { mejlTillSpoks } from '../spoks-paket.mjs';
import { BRAND, PRODUKTER, RECENSIONER, mejl } from './hjalp.mjs';

const REG = {
  'tre-vinster': { url: 'https://cdn.shopify.com/s/files/1/0/files/mejl-tre-vinster.jpg?v=1', alt: 'Tre lådor med guldrosett', lank: 'produkt:sushi-strumpor', spoks_id: '11111111-2222-4333-8444-555555555555' },
  'utan-spoks': { url: 'https://cdn.shopify.com/s/files/1/0/files/mejl-utan.jpg?v=1', alt: 'Utan Spoks-id', lank: null },
};
const kampanj = (id, planerad, bild, extra = {}) => ({ id, planerad, block: bild ? [{ typ: 'hero', bild, rubrik: 'R' }] : [{ typ: 'text', text: 'x' }], ...extra });

test('bildNamn läser bara bild:<namn> med små bokstäver, siffror och bindestreck', () => {
  assert.equal(bildNamn('bild:tre-vinster'), 'tre-vinster');
  assert.equal(bildNamn(' bild:a1 '), 'a1');
  assert.equal(bildNamn('produkt:sushi-strumpor'), null);
  assert.equal(bildNamn('bild:Stora'), null);
  assert.equal(bildNamn('https://x/y.jpg'), null);
  assert.equal(bildNamn(null), null);
});

test('heroBild och bildLank: egen länk, sedan knappen, sedan registret', () => {
  assert.equal(heroBild({ block: [{ typ: 'text' }, { typ: 'hero', bild: 'bild:x' }] }), 'bild:x');
  assert.equal(heroBild({ block: [{ typ: 'hero', rubrik: 'utan bild' }] }), null);
  assert.equal(bildLank({ bild_lank: 'kollektion:a', knapp: { lank: 'produkt:b' } }, { lank: 'produkt:c' }), 'kollektion:a');
  assert.equal(bildLank({ knapp: { lank: 'produkt:b' } }, { lank: 'produkt:c' }), 'produkt:b');
  assert.equal(bildLank({}, { lank: 'produkt:c' }), 'produkt:c');
  assert.equal(bildLank({}, {}), null);
});

test('samma: samma bild inom fönstret stoppas, utanför fönstret, före startdatum och parkerat släpps', () => {
  const k = [
    kampanj('a', '2026-10-01T18:00:00+02:00', 'produkt:sushi-strumpor'),
    kampanj('b', '2026-10-04T18:00:00+02:00', 'produkt:sushi-strumpor'),
    kampanj('c', '2026-11-20T18:00:00+01:00', 'produkt:sushi-strumpor'),
    kampanj('d', '2026-10-05T18:00:00+02:00', 'bild:x'),
    kampanj('e', '2026-10-06T18:00:00+02:00', 'bild:y'),
    kampanj('f', '2026-10-07T18:00:00+02:00', 'bild:x', { status_plan: 'parkerad' }),
    kampanj('g', '2026-09-20T18:00:00+02:00', 'bild:y'),
    kampanj('h', '2026-10-08T18:00:00+02:00', null),
  ];
  const r = samma(k, { dagar: 21, fran: '2026-09-30' });
  assert.deepEqual(r.map((x) => `${x.a}+${x.b}`), ['a+b']);
  assert.equal(r[0].dagar, 3);
  // Utan startdatum räknas g (20/9) med och krockar med e (6/10), 16 dygn isär.
  assert.ok(samma(k, { dagar: 21 }).some((x) => x.a === 'g' && x.b === 'e'));
  assert.deepEqual(samma(k, { dagar: 2, fran: '2026-09-30' }), []);
});

test('byggPrompt: motivet, produkten ur referensen och stilen — och en referens utan beskrivning stoppar', () => {
  const plan = { produkter: { 'sushi-lada': 'the sushi box', donut: 'the donut box' }, stil: 'No text.' };
  const p = byggPrompt(plan, { namn: 'x', prompt: 'Three boxes.', ref: ['sushi-lada'] });
  assert.equal(p, 'Three boxes. The product is the sushi box. No text.');
  assert.match(byggPrompt(plan, { namn: 'y', prompt: 'Two.', ref: ['sushi-lada', 'donut'] }), /The products are the sushi box; and the donut box\./);
  assert.throws(() => byggPrompt(plan, { namn: 'z', prompt: 'x', ref: ['pizza-lada'] }), /pizza-lada saknar beskrivning/);
});

test('standardLank: planens länk, annars produkten ur referensen, flera sorter blir kollektionen', () => {
  assert.equal(standardLank({ lank: 'sida:/pages/x', ref: ['donut'] }), 'sida:/pages/x');
  assert.equal(standardLank({ ref: ['sushi-lada', 'sushi-strumpor'] }), 'produkt:sushi-strumpor');
  assert.equal(standardLank({ ref: ['burgare'] }), 'produkt:hamburger-strumpor');
  assert.equal(standardLank({ ref: ['sushi-lada', 'pizza-lada'] }), 'kollektion:alla-produkter');
  assert.equal(standardLank({ befintlig: 'https://x' }), null);
});

test('kolla: ogodkänd bild, saknat Spoks-id, produktbild kvar och dubblett rapporteras', () => {
  const plan = { bilder: [{ namn: 'tre-vinster', alt: 'a', prompt: 'p' }, { namn: 'utan-spoks', alt: 'b', prompt: 'p' }, { namn: 'ny', alt: 'c', prompt: 'p' }] };
  const k = [
    kampanj('v01', '2026-09-30T18:00:00+02:00', 'bild:tre-vinster'),
    kampanj('k03', '2026-10-01T18:00:00+02:00', 'produkt:sushi-strumpor'),
    kampanj('fd01', '2026-10-04T18:00:00+02:00', 'bild:saknas'),
    kampanj('fd02', '2026-10-05T18:00:00+02:00', 'bild:tre-vinster'),
  ];
  const typer = kolla({ plan, register: REG, kampanjer: k, dagar: 21, fran: '2026-09-30' }).map((r) => `${r.typ}:${r.namn}`);
  assert.ok(typer.includes('ej_spoks:utan-spoks'));
  assert.ok(typer.includes('ej_godkand:ny'));
  assert.ok(typer.includes('produktbild:k03'));
  assert.ok(typer.includes('saknas_i_register:fd01'));
  assert.ok(typer.includes('samma:v01+fd02'));
  assert.ok(!typer.some((t) => t.startsWith('ej_godkand:tre-vinster')));
});

test('mallar: bild:<namn> ritas ur registret, länkas som hero-knappen och varnar när bilden saknas', () => {
  const m = mejl({ block: [{ typ: 'hero', bild: 'bild:tre-vinster', rubrik: 'Du är med', knapp: { text: 'Till lådan', lank: 'produkt:motorholje-test' } }] });
  const { html, varningar } = byggMejl(m, { brand: BRAND, produkter: PRODUKTER, recensioner: RECENSIONER, bilder: REG, lage: 'exempel' });
  assert.match(html, /mejl-tre-vinster_1000x1000\.jpg\?v=1/);
  assert.match(html, /alt="Tre lådor med guldrosett"/);
  assert.ok(!varningar.some((v) => /bildregistret/.test(v)));
  const saknas = byggMejl(mejl({ block: [{ typ: 'hero', bild: 'bild:finns-inte', rubrik: 'x' }] }), { brand: BRAND, produkter: PRODUKTER, recensioner: RECENSIONER, bilder: REG, lage: 'exempel' });
  assert.ok(saknas.varningar.some((v) => /"finns-inte" finns inte i bildregistret/.test(v)));
  assert.doesNotMatch(saknas.html, /finns-inte/);
});

test('validera: en bild som inte finns i registret stoppar mejlet', () => {
  const m = mejl({ block: [{ typ: 'hero', bild: 'bild:finns-inte', rubrik: 'x' }] });
  const { html, text } = byggMejl(m, { brand: BRAND, produkter: PRODUKTER, recensioner: RECENSIONER, bilder: REG, lage: 'klaviyo' });
  const r = validera(m, { html, text, produkter: PRODUKTER, brand: BRAND, bilder: REG });
  assert.ok(r.fel.some((f) => /"finns-inte" finns inte i bildregistret/.test(f)));
  const ok = mejl({ block: [{ typ: 'hero', bild: 'bild:tre-vinster', rubrik: 'x' }] });
  const b = byggMejl(ok, { brand: BRAND, produkter: PRODUKTER, recensioner: RECENSIONER, bilder: REG, lage: 'klaviyo' });
  assert.ok(!validera(ok, { html: b.html, text: b.text, produkter: PRODUKTER, brand: BRAND, bilder: REG }).fel.some((f) => /bildregistret/.test(f)));
});

test('Spoks-paketet: bildblock med Spoks-id och knappens länk, utan id stoppar det', () => {
  const brand = { id: 'testbutik', namn: 'Testbutiken', butik_url: 'https://testbutik.se' };
  const produkter = [{ handle: 'sushi-strumpor', titel: 'Sushi-Strumpor', url: 'https://testbutik.se/products/sushi-strumpor' }];
  const perHandle = new Map(produkter.map((p) => [p.handle, p]));
  const ctx = { brand, facit: { produkter: {} }, produkt: (h) => perHandle.get(h) ?? null, produktlista: produkter, recensioner: {}, stil: null, bilder: REG };
  const m = { id: 'v01', amnesrader: [{ text: 'Ämne' }], block: [{ typ: 'hero', bild: 'bild:tre-vinster', rubrik: 'Du är med', knapp: { text: 'Se lådan', lank: 'kollektion:alla-produkter' } }] };
  const r = mejlTillSpoks(m, ctx, { titel: 'V01' });
  assert.deepEqual(r.fel, []);
  assert.deepEqual(r.post.blocks[0], { type: 'image', fileId: REG['tre-vinster'].spoks_id, altText: 'Tre lådor med guldrosett', urlRedirect: 'https://testbutik.se/collections/alla-produkter' });
  const utan = mejlTillSpoks({ ...m, block: [{ typ: 'hero', bild: 'bild:utan-spoks', rubrik: 'x' }] }, ctx, { titel: 'V01' });
  assert.ok(utan.fel.some((f) => /saknar Spoks-id/.test(f)));
  const okand = mejlTillSpoks({ ...m, block: [{ typ: 'hero', bild: 'bild:okand', rubrik: 'x' }] }, ctx, { titel: 'V01' });
  assert.ok(okand.fel.some((f) => /finns inte i bildregistret/.test(f)));
});

test('faktablocket: rubriken följer brandfältet angerratt_rubrik, annars Ångerrätt', () => {
  const brand = { id: 'testbutik', namn: 'Testbutiken', butik_url: 'https://testbutik.se', angerratt_text: '30 dagars returrätt', angerratt_rubrik: 'Öppet köp', sparningssida: 'https://testbutik.se/pages/spara' };
  const ctx = { brand, facit: { produkter: {} }, produkt: () => null, produktlista: [], recensioner: {}, stil: null, bilder: {} };
  const m = { id: 'x', amnesrader: [{ text: 'Ämne' }], block: [{ typ: 'fakta' }] };
  const med = JSON.stringify(mejlTillSpoks(m, ctx, { titel: 'X' }).post.blocks);
  assert.match(med, /\*\*Öppet köp\*\*/);
  assert.doesNotMatch(med, /Ångerrätt/);
  const utan = JSON.stringify(mejlTillSpoks(m, { ...ctx, brand: { ...brand, angerratt_rubrik: undefined } }, { titel: 'X' }).post.blocks);
  assert.match(utan, /\*\*Ångerrätt\*\*/);
  const html = byggMejl(mejl({ block: [{ typ: 'fakta' }] }), { brand: { ...BRAND, angerratt_rubrik: 'Öppet köp' }, produkter: PRODUKTER, recensioner: RECENSIONER, bilder: {}, lage: 'exempel' }).html;
  assert.match(html, /Öppet köp/);
});
