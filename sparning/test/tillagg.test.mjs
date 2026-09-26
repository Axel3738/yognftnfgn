// Tilläggen under paketet: tacksidans produkter och koder på spårningssidan.
// Inget nät. Kör: node --test sparning/test/tillagg.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { byggTillagg, lasTillagg, tillaggspris } from '../tillagg.mjs';
import { byggSidkropp, TILLAGG_TEXTER } from '../sida.mjs';
import { skapaOversattare } from '../oversatt.mjs';

const spec = {
  produkter: [
    { id: 'matta', handle: 'matta-2-pack', titel_sv: 'Matta 2-pack', kortnamn: { sv: 'Mattor', nb: 'Matter', en: 'Mats' }, en_mening: { sv: 'Två mattor.', en: 'Two mats.' } },
    { id: 'kalender', handle: 'kalender-retro', titel_sv: 'Kalendern', kortnamn: { sv: 'Kalendern' }, en_mening: { sv: 'Tjugofyra luckor.' } },
  ],
};
const erbj = { butik: 'testbutik', erbjudanden: [
  { produkt: 'matta', rabattkod: 'TACKMATTA', rabatt_procent: 34.88 },
  { produkt: 'kalender', rabattkod: 'TACKKALENDER', rabatt_procent: 36.94 },
] };
const lage = { butik: 'testbutik', produkter: {
  matta: { variant_legacy_id: '111', status: 'ACTIVE' },
  kalender: { variant_legacy_id: '222', status: 'ACTIVE' },
} };

test('byggTillagg: en rad per erbjudande med handle, variant, kod, procent och namn på alla fem språk', () => {
  const r = byggTillagg('testbutik', { spec, erbj, lage });
  assert.equal(r.length, 2);
  assert.deepEqual(r[0], {
    handle: 'matta-2-pack', variant: '111', kod: 'TACKMATTA', procent: 34.88,
    namn: { sv: 'Mattor', nb: 'Matter', en: 'Mats', fi: 'Mattor', da: 'Mattor' },
    rad: { sv: 'Två mattor.', nb: 'Två mattor.', en: 'Two mats.', fi: 'Två mattor.', da: 'Två mattor.' },
  });
});

test('byggTillagg: fel butik, saknad variant eller avpublicerad produkt släpps aldrig igenom', () => {
  assert.throws(() => byggTillagg('annan', { spec, erbj, lage }), /gäller testbutik/);
  assert.throws(() => byggTillagg('testbutik', { spec, erbj, lage: { butik: 'testbutik', produkter: { matta: lage.produkter.matta } } }), /kalender/);
  const arkiverad = { butik: 'testbutik', produkter: { ...lage.produkter, kalender: { variant_legacy_id: '222', status: 'ARCHIVED' } } };
  assert.equal(byggTillagg('testbutik', { spec, erbj, lage: arkiverad }).length, 1);
});

test('tillaggspris trunkerar rabatten till hela ören som Shopify (samma tal som kassans kort)', () => {
  assert.equal(tillaggspris(539, 34.88), 351);
  assert.equal(tillaggspris(379, 36.94), 239);
  assert.equal(tillaggspris(539, 35.25), 349.01);
  assert.equal(tillaggspris(0, 10), null);
});

test('de riktiga filerna för carashell läses och ger tacksidans två produkter', () => {
  const r = lasTillagg('carashell');
  assert.deepEqual(r.map((x) => [x.handle, x.kod]), [['fonstertermomatta-2-pack', 'TACKMATTA'], ['adventskalender-retrobussar', 'TACKKALENDER']]);
  assert.ok(r.every((x) => /^\d+$/.test(x.variant)));
  assert.throws(() => lasTillagg('baverbutiken'), /gäller carashell/);
});

test('sidan: rutan och texterna bara när konfigurationen bär tillägg, inga priser eller procent inbakade', () => {
  const data = { v: 1, byggd: 0, f: [], p: {}, k: { 0: [] } };
  const rader = byggTillagg('testbutik', { spec, erbj, lage });
  const med = byggSidkropp(data, { butik: { support: 'hello@example.com' }, tillagg: rader });
  assert.ok(med.includes('id="bbs-tillagg"'), 'rutan saknas');
  const copy = JSON.parse(med.match(/id="bb-spar-copy">([\s\S]*?)<\/script>/)[1]);
  assert.equal(copy.tillagg.rubrik, TILLAGG_TEXTER.rubrik);
  assert.equal(copy.tillagg.rader[0].namn, 'Mattor');
  assert.equal(copy.tillagg.rader[0].variant, '111');
  assert.equal(copy.tillagg.rader[1].kod, 'TACKKALENDER');
  // Priset står aldrig i sidan — det hämtas i kundens valuta i webbläsaren.
  assert.ok(!med.includes('351'), 'inget inbakat pris');
  // Prislagen: inget överstruket pris, inget "spara", ingen procent i texten.
  for (const t of Object.values(TILLAGG_TEXTER)) assert.ok(!/spara|ordinarie|%|erbjudande|rabatt/i.test(t), t);
  // Rutan ligger i träffvyn, före den lilla knappen.
  assert.ok(med.indexOf('id="bbs-tillagg"') > med.indexOf('id="bbs-traff"'));
  assert.ok(med.indexOf('id="bbs-tillagg"') < med.indexOf('id="bbs-annat"'));

  const utan = byggSidkropp(data, { butik: { support: 'hello@example.com' } });
  assert.ok(!utan.includes('id="bbs-tillagg"'));
  assert.equal(JSON.parse(utan.match(/id="bb-spar-copy">([\s\S]*?)<\/script>/)[1]).tillagg, null);
  // En trasig rad fäller hela blocket.
  const trasig = byggSidkropp(data, { butik: { support: 'hello@example.com' }, tillagg: [{ ...rader[0], kod: 'x' }] });
  assert.ok(!trasig.includes('id="bbs-tillagg"'));
});

test('sidan: de extra språken får texterna och produktnamnen på sitt språk, allt har översättning', () => {
  const data = { v: 1, byggd: 0, f: [], p: {}, k: { 0: [] } };
  const rader = byggTillagg('testbutik', { spec, erbj, lage });
  const kropp = byggSidkropp(data, { butik: { support: 'hello@example.com' }, sprak_extra: ['nb', 'en', 'fi'], tillagg: rader });
  const copy = JSON.parse(kropp.match(/id="bb-spar-copy">([\s\S]*?)<\/script>/)[1]);
  assert.equal(copy.sprak.en.tillagg.rubrik, 'For you who ordered from us');
  assert.equal(copy.sprak.en.tillagg.rader[0].namn, 'Mats');
  assert.equal(copy.sprak.nb.tillagg.rader[0].namn, 'Matter');
  assert.equal(copy.sprak.fi.tillagg.rader[0].namn, 'Mattor', 'saknat språk faller tillbaka på svenskan');
  for (const kod of ['nb', 'en', 'fi', 'da']) {
    const ov = skapaOversattare(kod);
    for (const t of Object.values(TILLAGG_TEXTER)) ov.T(t);
    assert.deepEqual(ov.okanda(), [], `alla tilläggstexter ska finnas på ${kod}`);
    for (const t of Object.values(TILLAGG_TEXTER)) if (t.includes('{{pris}}')) assert.ok(ov.T(t).includes('{{pris}}'), `${kod}: platshållaren ska stå kvar`);
  }
});
