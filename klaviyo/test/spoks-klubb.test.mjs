// Klubbdragningens flöde i Spoks-motorn: tagg-triggern, utan_tagg-filtret, F08.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { triggerTillSpoks, filterTillSpoks, flodeTillSpoks, flodesnamn } from '../spoks-paket.mjs';

test('tagg-trigger blir contact_tags_added med taggen som triggerfilter', () => {
  const t = triggerTillSpoks({ typ: 'tagg', tagg: 'klubb-vinnare' }, {});
  assert.equal(t.event, 'contact_tags_added');
  assert.deepEqual(t.triggerFilter, { type: 'filter', field: 'tags', operator: 'in', value: ['klubb-vinnare'] });
  assert.match(t.anmarkning, /inget återinträde/);
  assert.throws(() => triggerTillSpoks({ typ: 'tagg' }, {}), /minst en tagg/);
});

test('utan_tagg:<tagg> blir ett stegfilter tags nin, inget triggerfilter', () => {
  const f = filterTillSpoks(['utan_tagg:klubb-bild-klar']);
  assert.equal(f.trigger, null);
  assert.deepEqual(f.steg, { type: 'filter', field: 'tags', operator: 'nin', value: ['klubb-bild-klar'] });
});

test('F08 Klubbdragningen: inget återinträde, väntestegen i dagar, filtret på varje mejl', () => {
  const flode = {
    id: 'f08-klubbdragning',
    namn: 'F08 Klubbdragningen',
    trigger: { typ: 'tagg', tagg: 'klubb-vinnare' },
    filter: ['utan_tagg:klubb-bild-klar'],
    ateintrade: { varaktighet: 30, enhet: 'days' },
    steg: [
      { typ: 'mejl', mejl: { id: 'f08-e1' } },
      { typ: 'vanta', varde: 12, enhet: 'days' },
      { typ: 'mejl', mejl: { id: 'f08-e2' } },
      { typ: 'vanta', varde: 6, enhet: 'days' },
      { typ: 'mejl', mejl: { id: 'f08-e3' } },
    ],
  };
  const r = flodeTillSpoks(flode, { brand: {}, facit: {} }, new Map());
  assert.equal(r.create.trigger.event, 'contact_tags_added');
  assert.deepEqual(r.create.trigger.triggerFilter, { type: 'filter', field: 'tags', operator: 'in', value: ['klubb-vinnare'] });
  assert.equal(r.create.trigger.filter, undefined, 'inget kontaktfilter: taggen är hela grinden');
  assert.equal(r.create.reenrollEnabled, false, 'Spoks tillåter inget återinträde på contact_tags_added, oavsett ateintrade');
  assert.equal(r.create.allowReenrolmentAfter, null);
  assert.deepEqual(r.steg.map((s) => s.typ), ['delay', 'send', 'delay', 'send', 'delay', 'send']);
  assert.deepEqual(r.steg.filter((s) => s.typ === 'delay').map((s) => s.delay), [0, 12 * 86_400_000, 6 * 86_400_000]);
  assert.ok(r.steg.filter((s) => s.typ === 'send').every((s) => s.filter?.operator === 'nin'));
  assert.ok(flodesnamn(flode).startsWith('F08 Klubbdragningen (vinnarna)'));
});
