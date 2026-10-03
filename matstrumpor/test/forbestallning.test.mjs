// Förbeställningen i Matstrumpor (matstrumpor/forbestallning.mjs) — utan nät, mot butikens
// egna filer från före inlägget (matstrumpor/forbestallning/original/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATCHAR, MARK, SPRAK, kontrolleraTexter, lasTexter, lasKonfig, byggSnippet, datumText } from '../forbestallning.mjs';

const ORIGINAL = join(dirname(fileURLToPath(import.meta.url)), '..', 'forbestallning', 'original');

test('texterna: alla fjorton språk, {datum} en gång, inga tankstreck, ingen fyra', () => {
  assert.deepEqual(kontrolleraTexter(lasTexter()), []);
  const trasig = { ...lasTexter(), de: { ...lasTexter().de, korg: 'Vorbestellung — bald' } };
  assert.ok(kontrolleraTexter(trasig).some((f) => /de\.korg: tankstreck/.test(f)));
});

test('datumet skrivs i språkets egen form', () => {
  assert.equal(datumText('2026-10-12', 'sv'), '12 oktober');
  assert.equal(datumText('2026-10-12', 'en'), 'October 12');
  assert.equal(datumText('2026-10-12', 'ja'), '10月12日');
});

test('snippeten: en gren per språk, svenskan som reserv, ritar bara när metafältet är aktivt', () => {
  const s = byggSnippet(lasTexter(), lasKonfig());
  for (const sp of SPRAK.filter((x) => x !== 'sv')) assert.ok(s.includes(`{%- when '${sp}' -%}`), sp);
  assert.ok(s.includes('Förbeställning: din beställning skickas från 12 oktober.'));
  assert.ok(s.includes('ms_fb.aktiv == true and ms_fb_idag < ms_fb_slut'));
  assert.ok(s.includes('{%- else -%}Slutsålt igen{%- endcase -%}'), 'sushi: bandet "Slutsålt igen" utan punkt');
  assert.ok(s.includes('{%- else -%}Säkra din låda ur nästa leverans.{%- endcase -%}'), 'rubriken under bandet');
  assert.ok(s.includes("produkt.handle == 'sushi-strumpor'"), 'bara sushilådan säger "igen"');
  assert.ok(s.includes('Förbeställning{%- endcase -%}" data-fb-varde="'), 'märkningens nyckel, svenskan som reserv');
  assert.ok(s.includes('skickas från 12 oktober{%- endcase -%}"'), 'märkningens värde');
  assert.equal(/\{datum\}/.test(s), false, 'ingen platshållare kvar');
});

test('patcharna träffar butikens filer exakt en gång och är idempotenta', () => {
  for (const [fil, patcha] of Object.entries(PATCHAR)) {
    const orig = readFileSync(join(ORIGINAL, fil.replace(/\//g, '__')), 'utf8');
    const { kod, byten } = patcha(orig);
    assert.ok(byten.length >= 1, fil);
    assert.ok(kod.includes(MARK), fil);
    assert.deepEqual(patcha(kod).byten, [], `${fil}: andra körningen rör inget`);
  }
});
