// Tester för hubbskaparen. Ingen nätverkstrafik, ingenting skapas.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggSchema, hubbnamn, saknarHub, opsButiker } from '../../tools/notion-hub.mjs';

test('hubben heter "<brand> creative hub" — annars hittar rutinerna den inte', () => {
  // CLAUDE.md: hubbar hittas dynamiskt på att titeln slutar på "creative hub".
  // Mätt 2026-09-08: två hubbar utan orden missade två videor tyst.
  assert.equal(hubbnamn('TankGuard'), 'TankGuard creative hub');
  assert.ok(hubbnamn('DryTrek').endsWith('creative hub'));
});

test('status blir select med valen kvar — API:t kan inte skapa status', () => {
  const { properties, nedgraderade } = byggSchema({
    Status: { type: 'status', status: { options: [{ name: 'Draft', color: 'gray' }, { name: 'To be Reviewed', color: 'blue' }] } },
  });
  assert.ok(properties.Status.select, 'ska bli select');
  assert.deepEqual(properties.Status.select.options.map((o) => o.name), ['Draft', 'To be Reviewed']);
  assert.ok(nedgraderade.some((n) => /status → select/.test(n)), 'nedgraderingen ska rapporteras, aldrig ske tyst');
});

test('titelfältet blir ett titelfält, inte något annat', () => {
  const { properties } = byggSchema({ Namn: { type: 'title', title: {} } });
  assert.deepEqual(properties.Namn, { title: {} });
});

test('select och multi_select behåller sina val', () => {
  const { properties } = byggSchema({
    Typ: { type: 'select', select: { options: [{ name: 'Image - Pending Approval', color: 'green' }] } },
    Marknad: { type: 'multi_select', multi_select: { options: [{ name: 'SE' }, { name: 'NO' }] } },
  });
  assert.equal(properties.Typ.select.options[0].name, 'Image - Pending Approval');
  assert.equal(properties.Marknad.multi_select.options.length, 2);
});

test('formler och relationer utelämnas OCH rapporteras', () => {
  // De pekar på andra databaser och går inte att kopiera rakt av. Att låta
  // dem försvinna tyst hade gett en hub som ser rätt ut och saknar fält.
  const { properties, utelamnade } = byggSchema({
    Namn: { type: 'title', title: {} },
    Spend: { type: 'formula', formula: { expression: 'prop("x")' } },
    Produkt: { type: 'relation', relation: { database_id: 'abc' } },
  });
  assert.ok(!('Spend' in properties) && !('Produkt' in properties));
  assert.equal(utelamnade.length, 2);
  assert.ok(utelamnade.every((u) => /för hand/.test(u)), 'varje utelämnat fält ska säga vad som krävs');
});

test('enkla fält följer med som de är', () => {
  const { properties } = byggSchema({
    Ansvarig: { type: 'people', people: {} },
    'Filer och media': { type: 'files', files: {} },
    'Godkänd datum': { type: 'date', date: {} },
  });
  assert.deepEqual(Object.keys(properties).sort(), ['Ansvarig', 'Filer och media', 'Godkänd datum']);
});

test('en butik som redan har en hub skapas inte igen', () => {
  const butiker = [{ id: 'tankguard', brand: 'TankGuard' }, { id: 'drytrek', brand: 'DryTrek' }];
  const kvar = saknarHub(butiker, ['TankGuard creative hub', 'Fish rod holder']);
  assert.deepEqual(kvar.map((b) => b.brand), ['DryTrek']);
});

test('jämförelsen bryr sig inte om versaler', () => {
  const kvar = saknarHub([{ id: 'x', brand: 'TankGuard' }], ['tankguard CREATIVE HUB']);
  assert.equal(kvar.length, 0);
});

test('butikerna läses ur konfigen, aldrig ur en handskriven lista', () => {
  // En ny OPS-butik ska komma med av sig själv. testbutiken är en fixtur och
  // ska aldrig få en hub.
  const b = opsButiker();
  assert.ok(b.length >= 4, 'de fyra byggda butikerna ska hittas');
  assert.ok(!b.includes('testbutiken'), 'fixturen ska inte med');
  assert.ok(b.includes('tankguard') && b.includes('drytrek'));
});
