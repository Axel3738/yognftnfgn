import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggKarta, paraResurs, arLacka, fraktplan, fastPrisFor, LOCALES } from '../bygg.mjs';
import { granska, TILLATET_TOMT } from '../granska.mjs';
import { KONFIG, raderUr, arText } from '../underlag.mjs';

test('konfigen: fyra språk, tre marknader, alla länder i exakt en marknad, fraktzonerna täcker samma länder', () => {
  assert.deepEqual([...LOCALES].sort(), ['da', 'en', 'fi', 'nb']);
  const lander = KONFIG.marknader.flatMap((m) => m.lander);
  assert.equal(new Set(lander).size, lander.length);
  assert.ok(!lander.includes('SE'));
  const fraktLander = KONFIG.frakt.zoner.flatMap((z) => z.lander).sort();
  assert.deepEqual(fraktLander, [...lander].sort());
  for (const m of KONFIG.marknader) if (m.priser === 'fasta') assert.ok(m.fasta_priser && Object.keys(m.fasta_priser).length > 1);
});

test('byggKarta: lika ord samlas för sig, konflikt när samma svenska får två översättningar', () => {
  const { karta, samma, konflikter } = byggKarta({ a: 'Kontakt', b: 'Startsida', c: 'Startsida', d: 'Vanliga frågor' }, { a: 'Kontakt', b: 'Home', c: 'Front page', d: 'FAQ' });
  assert.ok(samma.has('Kontakt'));
  assert.equal(karta.get('Startsida'), 'Home');
  assert.equal(konflikter.length, 1);
  assert.equal(karta.get('Vanliga frågor'), 'FAQ');
});

test('paraResurs: befintlig identisk översättning skickas inte om, outdated skickas', () => {
  const karta = new Map([['Startsida', 'Home'], ['Kontakt oss', 'Contact us']]);
  const content = [{ key: 'title', value: 'Startsida', digest: 'd1' }, { key: 'x', value: 'Kontakt oss', digest: 'd2' }, { key: 'y', value: 'Okänd text', digest: 'd3' }];
  const { rader, kvar } = paraResurs(content, karta, new Map([['title', { value: 'Home', outdated: false }], ['x', { value: 'Contact us', outdated: true }]]));
  assert.deepEqual(rader, [{ key: 'x', value: 'Contact us', digest: 'd2' }]);
  assert.deepEqual(kvar, [{ key: 'y', value: 'Okänd text' }]);
});

test('arLacka: tekniska värden och lika ord är inga läckor', () => {
  assert.equal(arLacka({ key: 'image', value: 'shopify://shop_images/x.jpg' }), false);
  assert.equal(arLacka({ key: 'text', value: '{{ product.vendor }}' }), false);
  assert.equal(arLacka({ key: 'handle', value: 'sushi-strumpor' }), false);
  assert.equal(arLacka({ key: 'name', value: 'Default Title' }), false);
  assert.equal(arLacka({ key: 'title', value: 'Kontakt' }, new Set(['Kontakt'])), false);
  assert.equal(arLacka({ key: 'title', value: 'Vanliga frågor' }), true);
});

test('fraktplan: launchländerna flyttas ut ur EU/Internationell och två zoner skapas', () => {
  const shopify = [
    { id: 'z1', namn: 'EU (Europeiska Unionen)', lander: ['AT', 'DK', 'FI', 'DE'] },
    { id: 'z2', namn: 'Internationell', lander: ['AU', 'NO', 'US', 'JP'] },
    { id: 'z3', namn: 'Sverige', lander: ['SE'] },
  ];
  const p = fraktplan(shopify, KONFIG.frakt.zoner);
  assert.equal(p.skapa.length, 2);
  assert.deepEqual(p.uppdatera.map((u) => [u.namn, u.efter]), [['EU (Europeiska Unionen)', ['AT', 'DE']], ['Internationell', ['JP']]]);
  const igen = fraktplan([...shopify, ...KONFIG.frakt.zoner.map((z) => ({ id: 'ny', namn: z.namn, lander: z.lander }))], KONFIG.frakt.zoner);
  assert.equal(igen.skapa.length, 0);
  assert.equal(igen.redan.length, 2);
});

test('fastPrisFor: tal för alla varianter, objekt per varianttitel, null när det saknas', () => {
  const f = KONFIG.marknader.find((m) => m.id === 'EN').fasta_priser;
  assert.equal(fastPrisFor(f, 'donut-strumpor', 'One Size'), 33.99);
  assert.equal(fastPrisFor(f, 'sushi-strumpor', '5 - Par / One Size'), 59);
  assert.equal(fastPrisFor(f, 'sushi-strumpor', 'Okänd'), null);
  assert.equal(fastPrisFor(f, 'presentkort', 'x'), null);
});

test('underlag: raderUr hoppar handle och tekniska värden, tar bort hash-suffix i temanycklar', () => {
  const rader = raderUr('tema.index', [
    { key: 'section.index.json.hero.h.heading:19i18qlqd4da3', value: 'Strumpor som ser ut som mat', digest: 'a' },
    { key: 'section.index.json.hero.image:hfrw6qb4vzqf', value: 'shopify://shop_images/x.jpg', digest: 'b' },
    { key: 'handle', value: 'sushi-strumpor', digest: 'c' },
  ]);
  assert.deepEqual(rader.map((r) => r.nyckel), ['tema.index.hero.h.heading']);
  assert.equal(arText('{{ product.vendor }}'), false);
  assert.equal(arText('One Size'), true);
});

test('granska: nyckelparitet, HTML, Liquid, förbjudet, sanning, tomt', () => {
  const sv = { 'a.t': 'Fri frakt i Sverige', 'a.b': '<p>Hej <a href="/x">du</a></p>{{ last_updated }}', 'liquid.ms-sista-dag.jul': 'Beställ senast 8 december så är paketet framme till jul.', 'c': 'Text' };
  const en = { 'a.t': 'Free shipping', 'a.b': '<p>Hi <a href="/x">you</a></p>{{ last_updated }}', 'liquid.ms-sista-dag.jul': '', 'c': 'Text', 'extra': 'x' };
  const r = granska(sv, en, 'en');
  const typer = r.fel.map((f) => `${f.nyckel}:${f.typ}`);
  assert.ok(typer.includes('extra:nycklar'));
  assert.ok(typer.includes('c:oforandrat'));
  assert.ok(!typer.some((t) => t.startsWith('liquid.ms-sista-dag.jul')));
  assert.ok(TILLATET_TOMT.has('liquid.ms-sista-dag.jul'));
  const daligt = granska({ x: '<p>Fri frakt i Sverige</p>' }, { x: '<div>Free shipping to Sweden</div> Sjöhed' }, 'en');
  const t2 = daligt.fel.map((f) => f.typ);
  assert.ok(t2.includes('html'));
  assert.ok(t2.includes('forbjudet'));
  assert.ok(t2.includes('sanning'));
});
