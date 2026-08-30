import test from 'node:test';
import assert from 'node:assert/strict';
import { dela, MAX_TECKEN } from '../dela.js';
import { komprimeraLogg, ärFörbjuden, serUtSomToken, felorsak } from '../repo.js';

test('kort text delas inte', () => {
  assert.deepEqual(dela('hej'), ['hej']);
  assert.deepEqual(dela(''), []);
});

test('varje bit håller Discords gräns och alla rader överlever', () => {
  const rader = Array.from({ length: 300 }, (_, i) => `Rad ${i}: en rimligt lång rapportrad.`);
  const bitar = dela(rader.join('\n'));
  assert.ok(bitar.length > 1);
  for (const b of bitar) assert.ok(b.length <= MAX_TECKEN);
  assert.deepEqual(bitar.join('\n').split('\n').filter(Boolean), rader);
});

test('kodblock lämnas aldrig öppet över en delning', () => {
  const inne = Array.from({ length: 200 }, (_, i) => `rad ${i}`).join('\n');
  for (const b of dela('```js\n' + inne + '\n```')) {
    assert.equal((b.match(/```/g) || []).length % 2, 0);
  }
});

test('komprimeraLogg behåller senaste beslutet per kampanj', () => {
  const jsonl = [
    { kampanj_id: 'a', kod: 'SKALA', hamtad: '2026-08-29T08:00:00Z' },
    { kampanj_id: 'a', kod: 'SANK', hamtad: '2026-08-30T08:00:00Z' },
    { kampanj_id: 'b', kod: 'LAT_VARA', hamtad: '2026-08-30T09:00:00Z' },
    'trasig rad som inte är json',
  ].map((r) => (typeof r === 'string' ? r : JSON.stringify(r))).join('\n');

  const ut = komprimeraLogg(jsonl);
  assert.equal(ut.length, 2, 'en rad per kampanj');
  assert.equal(ut.find((r) => r.kampanj_id === 'a').kod, 'SANK', 'senaste, inte första');
});

test('komprimeraLogg sorterar på tid — inte på strängvärde', () => {
  // Loggen blandar tidsformat; strängsortering ger fel svar.
  const jsonl = [
    { kampanj_id: 'a', kod: 'GAMMAL', hamtad: '2026-08-30T09:12:00+02:00' },
    { kampanj_id: 'a', kod: 'NYARE', hamtad: '2026-08-30T08:00:00Z' },
  ].map((r) => JSON.stringify(r)).join('\n');
  // 09:12+02:00 = 07:12Z, alltså ÄLDRE än 08:00Z trots högre siffra.
  assert.equal(komprimeraLogg(jsonl)[0].kod, 'NYARE');
});

test('hemliga filer kan aldrig läsas av verktyget', () => {
  for (const f of ['.env', 'agent/discord-bot.json', 'my.key', 'x/secrets.txt', 'a.pem']) {
    assert.ok(ärFörbjuden(f), `${f} borde vara spärrad`);
  }
  assert.equal(ärFörbjuden('agent/produktkarta.json'), false);
  assert.equal(ärFörbjuden('products/motorholjet/dna.md'), false);
});

test('en sträng som inte är en GitHub-token känns igen som fel', () => {
  // En dummy-token i environmentet gav 401 under bygget och såg ut som
  // "fel behörighet". Formatkollen gör att felet i stället säger sanningen.
  assert.equal(serUtSomToken('abcdefghijklmn'), false);
  assert.equal(serUtSomToken(''), false);
  assert.equal(serUtSomToken(undefined), false);
  assert.equal(serUtSomToken(`ghp_${'a'.repeat(36)}`), true);
  assert.equal(serUtSomToken(`github_pat_${'B'.repeat(40)}`), true);
});

test('403 skiljer rate limit från saknad behörighet', () => {
  const svarMed = (h) => ({ headers: { get: (n) => h[n] ?? null } });
  const slut = felorsak(svarMed({ 'x-ratelimit-remaining': '0' }));
  assert.match(slut, /Rate limit/i, 'slut kvot ska heta rate limit');

  const nekad = felorsak(svarMed({ 'x-ratelimit-remaining': '4321' }));
  assert.doesNotMatch(nekad, /Rate limit/i, 'kvot kvar = behörighetsproblem');
  assert.match(nekad, /GITHUB_TOKEN/);
});
