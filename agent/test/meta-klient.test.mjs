import { test } from 'node:test';
import assert from 'node:assert/strict';

// Graph-klienten läser token vid import — sätt en låtsasnyckel först.
process.env.META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'test';
const { alla, stallIn } = await import('../hamta-kontodata.mjs');

/** En låtsas-fetch som svarar i tur och ordning. */
function stubba(svar) {
  const kvar = [...svar];
  const anrop = [];
  globalThis.fetch = async (url) => {
    anrop.push(String(url));
    const s = kvar.shift();
    if (!s) throw new Error('för många anrop');
    return { ok: !s.error, status: s.error ? 400 : 200, statusText: '', json: async () => s };
  };
  return anrop;
}

test('alla(): en strypning (kod 17) mitt i bläddringen ger HELA listan — förut kom halva, utan ett ord (hittat 2026-09-30)', async () => {
  stallIn({ pausMs: 0, backoffMs: [0, 0] });
  const anrop = stubba([
    { data: [{ id: 1 }, { id: 2 }], paging: { next: 'https://graph.example/sida2' } },
    { error: { code: 17, message: 'User request limit reached' } },
    { data: [{ id: 3 }] },
  ]);
  const ut = await alla('act_1/insights', {});
  assert.deepEqual(ut.map((x) => x.id), [1, 2, 3]);
  assert.equal(anrop[1], 'https://graph.example/sida2');
  assert.equal(anrop[2], 'https://graph.example/sida2', 'samma sida hämtas om');
});

test('alla(): tar försöken slut kastas felet — aldrig ett tyst delsvar', async () => {
  stallIn({ pausMs: 0, backoffMs: [0] });
  stubba([
    { data: [{ id: 1 }], paging: { next: 'https://graph.example/sida2' } },
    { error: { code: 17, message: 'User request limit reached' } },
    { error: { code: 17, message: 'User request limit reached' } },
  ]);
  await assert.rejects(() => alla('act_1/insights', {}), /request limit/);
});

test('alla(): egen backoff och tidsgräns per anrop (facit håller aldrig upp ronden)', async () => {
  stallIn({ pausMs: 0, backoffMs: [0, 0, 0] });
  stubba([
    { error: { code: 17, message: 'User request limit reached' } },
    { data: [{ id: 9 }] },
  ]);
  await assert.rejects(() => alla('act_1/insights', {}, { backoff: [60000], deadline: Date.now() + 1000 }), /tidsgränsen/);
});

test('alla(): efter tidsgränsen görs inget nytt anrop (nästa sida eller nästa konto)', async () => {
  stallIn({ pausMs: 0, backoffMs: [0] });
  const anrop = stubba([{ data: [{ id: 1 }], paging: { next: 'https://graph.example/sida2' } }, { data: [{ id: 2 }] }]);
  await assert.rejects(() => alla('act_1/insights', {}, { deadline: Date.now() - 1 }), /tidsgränsen/);
  assert.equal(anrop.length, 0);
});
