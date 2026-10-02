import test from 'node:test';
import assert from 'node:assert/strict';
import { kanalnamn, overwrites, hittaEllerSkapaPrivatKanal, postaTillKanal } from '../discord.mjs';

const ENV = { DISCORD_BOT_TOKEN: 'x' };

function fakeFetch(svar) {
  const anrop = [];
  const f = async (url, init = {}) => {
    anrop.push({ url, metod: init.method ?? 'GET', kropp: init.body ? JSON.parse(init.body) : null });
    const nyckel = `${init.method ?? 'GET'} ${new URL(url).pathname}`;
    const s = svar[nyckel] ?? svar['*'];
    if (typeof s === 'function') return s(anrop.length);
    return { ok: true, status: 200, json: async () => s ?? {}, text: async () => '' };
  };
  f.anrop = anrop;
  return f;
}

test('kanalnamnet är Discord-säkert', () => {
  assert.equal(kanalnamn('ad-report-', 'Carl'), 'ad-report-carl');
  assert.equal(kanalnamn('ad-report-', 'Jérzee Robe'), 'ad-report-jerzee-robe');
});

test('rättigheterna nekar @everyone och släpper in medlemmarna, utan dubbletter', () => {
  const o = overwrites('1540322130388983921', ['1', '2', '1']);
  assert.deepEqual(o[0], { id: '1540322130388983921', type: 0, deny: '1024' });
  assert.equal(o.length, 3);
  assert.equal(o[1].type, 1);
  assert.equal(o[1].allow, String(1024 + 2048 + 65536));
});

test('befintlig kanal återanvänds utan att rättigheterna rörs', async () => {
  const f = fakeFetch({ 'GET /api/v10/guilds/g/channels': [{ id: 'k1', type: 0, name: 'ad-report-carl' }] });
  const k = await hittaEllerSkapaPrivatKanal('g', 'ad-report-carl', { medlemIds: ['7'], env: ENV, fetchImpl: f });
  assert.deepEqual(k, { id: 'k1', namn: 'ad-report-carl', skapad: false });
  assert.equal(f.anrop.length, 1);
});

test('ny kanal skapas privat med redigeraren, Axel och boten', async () => {
  const f = fakeFetch({
    'GET /api/v10/guilds/g/channels': [],
    'GET /api/v10/users/@me': { id: 'bot1' },
    'POST /api/v10/guilds/g/channels': { id: 'ny1' },
  });
  const k = await hittaEllerSkapaPrivatKanal('g', 'ad-report-carl', { medlemIds: ['7', 'axel1'], env: ENV, fetchImpl: f });
  assert.deepEqual(k, { id: 'ny1', namn: 'ad-report-carl', skapad: true });
  const skapa = f.anrop.find((a) => a.metod === 'POST');
  assert.equal(skapa.kropp.name, 'ad-report-carl');
  assert.deepEqual(skapa.kropp.permission_overwrites.map((o) => o.id), ['g', '7', 'axel1', 'bot1']);
});

test('posten delas under 1 900 tecken, pingen låses till id:na och står först', async () => {
  const f = fakeFetch({ '*': (n) => ({ ok: true, status: 200, json: async () => ({ id: `m${n}` }), text: async () => '' }) });
  const lang = Array.from({ length: 60 }, (_, i) => `Rad ${i} ${'x'.repeat(50)}`).join('\n');
  const idn = await postaTillKanal('k1', lang, { mentions: ['7'], env: ENV, fetchImpl: f });
  assert.ok(idn.length >= 2, 'minst två delar');
  for (const a of f.anrop) {
    assert.ok(a.kropp.content.length <= 1990);
    assert.deepEqual(a.kropp.allowed_mentions, { parse: [], users: ['7'] });
  }
  assert.ok(f.anrop[0].kropp.content.startsWith('<@7>\n'));
  assert.ok(!f.anrop[1].kropp.content.startsWith('<@'));
});

test('403 kastas uppåt med status, aldrig tyst', async () => {
  const f = fakeFetch({ '*': async () => ({ ok: false, status: 403, json: async () => ({}), text: async () => 'Missing Permissions' }) });
  await assert.rejects(() => postaTillKanal('k1', 'hej', { env: ENV, fetchImpl: f }), (e) => e.status === 403 && /Missing Permissions/.test(e.message));
});
