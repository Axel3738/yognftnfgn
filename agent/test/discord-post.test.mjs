import test from 'node:test';
import assert from 'node:assert/strict';
import { botHuvuden, dela, lasKonfig, MAX_TECKEN, pingRad } from '../discord-post.mjs';

test('kort text delas inte alls', () => {
  assert.deepEqual(dela('hej'), ['hej']);
  assert.deepEqual(dela('  hej  '), ['hej']);
  assert.deepEqual(dela(''), []);
  assert.deepEqual(dela(null), []);
});

test('varje bit håller sig under Discords gräns', () => {
  const rader = Array.from({ length: 400 }, (_, i) => `Rad ${i}: en rimligt lång rapportrad om budgetar.`);
  const bitar = dela(rader.join('\n'));
  assert.ok(bitar.length > 1, 'lång text ska delas');
  for (const b of bitar) assert.ok(b.length <= MAX_TECKEN, `bit på ${b.length} tecken är för lång`);
});

test('delningen klipper på radgräns — inga halva rader', () => {
  const rader = Array.from({ length: 200 }, (_, i) => `Produkt ${i} skalades till ${1000 + i} kr`);
  const bitar = dela(rader.join('\n'));
  const tillbaka = bitar.join('\n').split('\n').filter(Boolean);
  assert.deepEqual(tillbaka, rader, 'alla rader ska överleva delningen hela');
});

test('en enda extremt lång rad huggs i stället för att spränga gränsen', () => {
  const bitar = dela('x'.repeat(5000));
  assert.ok(bitar.length >= 3);
  for (const b of bitar) assert.ok(b.length <= MAX_TECKEN);
  assert.equal(bitar.join('').replace(/\n/g, '').length, 5000);
});

test('kodblock stängs och återöppnas över en delning', () => {
  // Ett långt kodblock måste stängas i varje bit — annars färgar Discord
  // resten av kanalen som kod.
  const inne = Array.from({ length: 200 }, (_, i) => `rad ${i} i kodblocket`).join('\n');
  const bitar = dela('```\n' + inne + '\n```');
  assert.ok(bitar.length > 1);
  for (const b of bitar) {
    const antal = (b.match(/```/g) || []).length;
    assert.equal(antal % 2, 0, `bit med ${antal} kodblocksmarkörer lämnar blocket öppet`);
  }
});

test('med token sätter vi Authorization själva', () => {
  assert.deepEqual(botHuvuden('abc123'), { Authorization: 'Bot abc123' });
});

test('utan token skickas INGET Authorization-huvud', () => {
  // Testet måste vara hermetiskt: står DISCORD_BOT_TOKEN i miljön tar
  // default-parametern den och testet mäter miljön i stället för koden.
  const sparad = process.env.DISCORD_BOT_TOKEN;
  delete process.env.DISCORD_BOT_TOKEN;
  try {
  // Med en API-credential på molnmiljön sätter agentproxyn huvudet åt oss efter
  // att anropet lämnat sessionen. Ett tomt eget huvud hade skrivit över det, och
  // då hade token behövt ligga som synlig miljövariabel i stället.
    assert.deepEqual(botHuvuden(undefined), {});
    assert.deepEqual(botHuvuden(''), {});
  } finally {
    if (sparad === undefined) delete process.env.DISCORD_BOT_TOKEN;
    else process.env.DISCORD_BOT_TOKEN = sparad;
  }
});


test('pingraden pingar bara på <@id> — namn utan id skrivs som text', () => {
  // Axel 2026-09-02: varje post ska pinga två personer. "@namn" i klartext
  // pingar ingen på Discord, bara <@id> gör det.
  assert.equal(pingRad([{ namn: 'ecom_chadking', id: '123' }]), '<@123>');
  assert.equal(pingRad([{ namn: 'ecom_chadking', id: '123' }, { namn: 'confident_otter_25993', id: null }]),
    '<@123> @confident_otter_25993');
  assert.equal(pingRad([]), '');
  assert.equal(pingRad(undefined), '');
});

test('discord.json bär de två som ska pingas, serverns id och rollen för uppgifter', async () => {
  const { pinga, guildId, pingaRoll } = await lasKonfig();
  assert.deepEqual(pinga, ['confident_otter_25993', 'ecom_chadking']);
  assert.equal(guildId, '1540322130388983921');
  // Axel 2026-09-02: nya briefer/rundor ska pinga @Video editor.
  assert.deepEqual(pingaRoll, { uppgifter: ['Video editor'] });
});

test('rollpingen skrivs som <@&id> och står först på raden', () => {
  assert.equal(pingRad([{ namn: 'ecom_chadking', id: '1' }], [{ namn: 'Video editor', id: '77' }]), '<@&77> <@1>');
  assert.equal(pingRad([], [{ namn: 'Video editor', id: null }]), '@Video editor');
});
