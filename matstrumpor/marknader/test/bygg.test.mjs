import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggKarta, paraResurs, arLacka, fraktplan, fastPrisFor, LOCALES } from '../bygg.mjs';
import { granska, TILLATET_TOMT } from '../granska.mjs';
import { KONFIG, raderUr, arText } from '../underlag.mjs';

test('konfigen: elva språk, tre marknader, alla länder i exakt en marknad, fraktzonerna täcker samma länder', () => {
  assert.deepEqual([...LOCALES].sort(), ['da', 'de', 'en', 'es', 'fi', 'fr', 'it', 'nb', 'nl', 'pl', 'pt-PT']);
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

test('fraktplan: konfigzoner skapas/uppdateras/döps om, andra zoner släpper anspråkta länder, tomma zoner raderas', () => {
  const konfig = [
    { namn: 'Norden (Norge)', tidigare_namn: 'Norden (Norge, Danmark, Finland)', lander: ['NO'], metod: 'Fri frakt', pris_sek: 0 },
    { namn: 'Engelska', lander: ['US', 'GB'], metod: 'Free shipping', pris_sek: 0 },
    { namn: 'Europa', lander: ['DK', 'FI', 'DE', 'AT', 'CH'], metod: 'Fri frakt', pris_sek: 0 },
  ];
  const shopify = [
    { id: 'z1', namn: 'EU (Europeiska Unionen)', lander: ['AT', 'DE'] },
    { id: 'z2', namn: 'Internationell', lander: ['CH', 'JP'] },
    { id: 'z3', namn: 'Sverige', lander: ['SE'] },
    { id: 'z4', namn: 'Norden (Norge, Danmark, Finland)', lander: ['NO', 'DK', 'FI'] },
    { id: 'z5', namn: 'Engelska', lander: ['GB', 'US'] },
  ];
  const p = fraktplan(shopify, konfig);
  assert.deepEqual(p.redan, ['Engelska']);
  assert.deepEqual(p.skapa.map((z) => z.namn), ['Europa']);
  assert.deepEqual(p.radera.map((z) => z.namn), ['EU (Europeiska Unionen)']);
  assert.deepEqual(p.uppdatera.map((u) => [u.namn, u.efter, u.bytNamn]), [
    ['Norden (Norge)', ['NO'], 'Norden (Norge, Danmark, Finland)'],
    ['Internationell', ['JP'], null],
  ]);
  // Sverige rörs aldrig, och en andra körning gör ingenting.
  assert.ok(!p.uppdatera.some((u) => u.namn === 'Sverige') && !p.radera.some((z) => z.namn === 'Sverige'));
  const efter = [{ id: 'z3', namn: 'Sverige', lander: ['SE'] }, { id: 'z2', namn: 'Internationell', lander: ['JP'] }, { id: 'z4', namn: 'Norden (Norge)', lander: ['NO'] }, { id: 'z5', namn: 'Engelska', lander: ['US', 'GB'] }, { id: 'z6', namn: 'Europa', lander: ['AT', 'CH', 'DE', 'DK', 'FI'] }];
  const igen = fraktplan(efter, konfig);
  assert.equal(igen.skapa.length + igen.uppdatera.length + igen.radera.length, 0);
  assert.equal(igen.redan.length, 3);
});

test('fastPrisFor: tal för alla varianter, objekt per varianttitel, null när det saknas', () => {
  const f = KONFIG.marknader.find((m) => m.id === 'EN').fasta_priser;
  assert.equal(fastPrisFor(f, 'donut-strumpor', 'One Size'), 39.99);
  assert.equal(fastPrisFor(f, 'sushi-strumpor', '5 - Par / One Size'), 69);
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
