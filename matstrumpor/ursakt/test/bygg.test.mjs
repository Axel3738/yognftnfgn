import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { textFel, block, NYCKLAR } from '../bygg.mjs';

const sv = JSON.parse(readFileSync(new URL('../sprak/sv.json', import.meta.url), 'utf8'));

test('svenskan klarar kontrollerna', () => {
  assert.deepEqual(textFel('sv', sv), []);
  assert.deepEqual(Object.keys(sv), NYCKLAR);
});

test('tankstreck, påhittade tal och okända tokens stoppas', () => {
  const fel = textFel('sv', { ...sv, behalla: 'Det tar 14 dagar — ungefär', avslut: '{{namn}}' }).join('\n');
  assert.match(fel, /tankstreck/);
  assert.match(fel, /talet 14/);
  assert.match(fel, /okänd token/);
});

test('förseningen måste säga 5-10', () => {
  assert.match(textFel('sv', { ...sv, forsening: 'Det kan dröja.' }).join('\n'), /5-10 saknas/);
});

test('bara kampanjen säger att den som fått paketet kan bortse', () => {
  const k = JSON.stringify(block(sv, 'kampanj', 'https://x'));
  const f = JSON.stringify(block(sv, 'flode', 'https://x'));
  assert.ok(k.includes(sv.redan_framme_kampanj) && !f.includes(sv.redan_framme_kampanj));
  assert.ok(f.includes(sv.intro_flode) && !k.includes(sv.intro_flode));
  assert.ok(k.includes("{{ contact.first_name | default: 'du' }}"));
});
