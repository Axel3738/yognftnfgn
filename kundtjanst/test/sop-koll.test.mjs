// Tester för SOP-portabilitetsvakten. Rena funktioner, inga filer.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { platshallare, normalisera, granska, ALIAS, KANONISKA, BUTIK } from '../sop-koll.mjs';

test('platshallare hittar namn med radnummer', () => {
  const p = platshallare('rad ett\nhej {{STORE_NAME}} och {{CURRENCY}}\n');
  assert.deepEqual(p, [{ namn: 'STORE_NAME', rad: 2 }, { namn: 'CURRENCY', rad: 2 }]);
});

test('normalisera byter alias mot kanoniska namn', () => {
  const { text, antal } = normalisera('{{FIGHT_ABOVE}} och {{FIGHT_WORTH_IT_ABOVE}} och {{VA_NAME}}');
  assert.equal(antal, 3);
  assert.equal(text, '{{FIGHT_THRESHOLD}} och {{FIGHT_THRESHOLD}} och {{AGENT_NAME}}');
});

test('alla alias pekar på ett namn som finns i den kanoniska listan', () => {
  for (const [fran, till] of Object.entries(ALIAS)) {
    assert.ok(KANONISKA.includes(till), `aliaset ${fran} pekar på ${till} som inte är kanoniskt`);
    assert.ok(!KANONISKA.includes(fran), `${fran} är både alias och kanoniskt`);
  }
});

test('granska flaggar ett alias och en okänd platshållare', () => {
  const g = granska('x.md', 'ett {{VA_NAME}} och ett {{HITTEPA_VARDE}}');
  assert.equal(g.fel.length, 2);
  assert.match(g.fel[0], /alias/);
  assert.match(g.fel[1], /kanoniska listan/);
});

test('DATE_PLUS_3 och DATE_PLUS_10 accepteras utan att listas var för sig', () => {
  assert.equal(granska('x.md', '{{DATE_PLUS_3}} {{DATE_PLUS_10}}').fel.length, 0);
});

test('butiksnamn i procedurtext är FEL, i ett exempel bara en notis', () => {
  assert.equal(granska('x.md', 'Send the return to Bäverbutiken today.').fel.length, 1);
  assert.equal(granska('x.md', 'Example only: Bäverbutiken uses 30 days.').fel.length, 0);
  assert.equal(granska('x.md', '| `{{STORE_NAME}}` | brand.namn | Bäverbutiken |').fel.length, 0);
  assert.equal(granska('x.md', 'measured in kundtjanst/korningar/baverbutiken/2026-W38.json').fel.length, 0);
});

test('varje butiksvärde bär en förklaring — annars går det inte att fylla i', () => {
  for (const [k, v] of Object.entries(BUTIK)) assert.ok(v && v.length > 5, `{{${k}}} saknar förklaring`);
});

test('de RIKTIGA SOP-filerna är portabla — inga alias, inga okända namn', async () => {
  const { readdirSync, readFileSync, existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { SOPMAPP } = await import('../sop-koll.mjs');
  if (!existsSync(SOPMAPP)) return; // mappen byggs av /tvistkoll-uppdraget
  const filer = readdirSync(SOPMAPP).filter((f) => f.endsWith('.md'));
  assert.ok(filer.length >= 10, `bara ${filer.length} SOP-filer — något har försvunnit`);
  const alla = [];
  for (const f of filer) alla.push(...granska(f, readFileSync(join(SOPMAPP, f), 'utf8')).fel);
  assert.deepEqual(alla, [], `SOP-filerna är inte portabla:\n${alla.join('\n')}`);
});

test('eskaleringen finns som egen SOP och är routad från START-HERE', async () => {
  const { readFileSync, existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { SOPMAPP } = await import('../sop-koll.mjs');
  if (!existsSync(SOPMAPP)) return;
  const esk = join(SOPMAPP, '60-ESCALATION.md');
  assert.ok(existsSync(esk), '60-ESCALATION.md saknas — VA:n vet inte vem hon frågar');
  const t = readFileSync(esk, 'utf8');
  // Regeln som gör eskaleringen ofarlig: deadlinen väntar aldrig på ett svar.
  assert.match(t, /DEADLINE NEVER WAITS/i);
  assert.match(t, /\{\{OWNER_CONTACT\}\}/);
  assert.match(t, /\{\{REFUND_APPROVAL_LIMIT\}\}/);
  assert.match(readFileSync(join(SOPMAPP, 'START-HERE.md'), 'utf8'), /60-ESCALATION\.md/);
});

test('returadressen lämnas ut på förfrågan — och svarstiden står bredvid regeln', async () => {
  const { readFileSync, existsSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { SOPMAPP } = await import('../sop-koll.mjs');
  if (!existsSync(SOPMAPP)) return;
  for (const f of ['START-HERE.md', '30-EMAIL-TEMPLATES.md']) {
    const t = readFileSync(join(SOPMAPP, f), 'utf8');
    assert.match(t, /returadress_pa_forfragan/, `${f} nämner inte friktionsmodellen`);
    assert.match(t, /\{\{FIRST_REPLY_TARGET_HOURS\}\}/, `${f} saknar svarstidsvillkoret`);
  }
});
