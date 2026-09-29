// Tester för egna/d3/annons.mjs — utan nät, utan ritning.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { annonsFor, fel, laggIn, namnFor, textKod, KODER } from '../egna/d3/annons.mjs';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
const text = (k) => JSON.parse(readFileSync(join(ROT, 'egna', 'd3', 'texter', `${k}.json`), 'utf8'));
const kampanj = (rad) => ({ annonser: [{ namn: 'MATSTRUMP_NO_sushi_gift_ugc_001_v1', message: `Något.\n${rad}` }], tre_fragor: [] });

test('alla tolv kampanjer har en granskad text, WW bär USA:s', () => {
  assert.equal(KODER.length, 12);
  assert.equal(textKod('WW'), 'US');
  for (const k of KODER) {
    const t = text(textKod(k));
    assert.ok(t.title && t.message && t.link_description && t.wordmark && t.underrubrik && t.banner, k);
    assert.equal(t.message.split('\n').length, 5, `${k}: fem rader`);
  }
  assert.equal(annonsFor('WW', text('US')).bild, 'klar/US_d3.jpg');
  assert.equal(namnFor('FR'), 'MATSTRUMP_FR_sushi_offer_static_008_v1');
});

test('de riktiga texterna klarar spärrarna mot kampanjens varumärkesrad', () => {
  assert.deepEqual(fel(kampanj('Et svensk merke.'), annonsFor('NO', text('NO')), text('NO')), []);
  assert.deepEqual(fel(kampanj('A Swedish brand.'), annonsFor('WW', text('US')), text('US')), []);
});

test('spärrarna: fel varumärkesrad, butiken, en domän, ett pris och ❌ i tre-frågorstestet stoppar', () => {
  const t = text('NO');
  const med = (andring) => ({ ...t, ...andring });
  assert.match(fel(kampanj('A Swedish brand.'), annonsFor('NO', t), t)[0], /varumärkesrad/);
  const butik = med({ link_description: 'Handle på matstrumpor.no' });
  assert.ok(fel(kampanj('Et svensk merke.'), annonsFor('NO', butik), butik).some((f) => /butiken eller en domän/.test(f)));
  const pris = med({ title: 'Kjøp 2 for 449 kr' });
  assert.ok(fel(kampanj('Et svensk merke.'), annonsFor('NO', pris), pris).some((f) => /pris/.test(f)));
  const kryss = med({ tre_fragor: [{ rad: 'X', visualisera: '✅', falsifiera: '❌', unik: '✅' }] });
  assert.ok(fel(kampanj('Et svensk merke.'), annonsFor('NO', kryss), kryss).some((f) => /❌/.test(f)));
});

test('laggIn ersätter en äldre 008 och lägger bara till nya testrader', () => {
  const t = text('NO');
  const a = annonsFor('NO', t);
  const f1 = laggIn(kampanj('Et svensk merke.'), a, t.tre_fragor);
  const f2 = laggIn(f1, { ...a, title: 'ny' }, t.tre_fragor);
  assert.equal(f2.annonser.filter((x) => x.namn === a.namn).length, 1);
  assert.equal(f2.annonser.at(-1).title, 'ny');
  assert.equal(f2.tre_fragor.length, t.tre_fragor.length);
});
