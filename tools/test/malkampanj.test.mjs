import { test } from 'node:test';
import assert from 'node:assert/strict';
import { malkampanjFor, domFastMal } from '../lib/malkampanj.mjs';

const post = { malkampanj: { US: { kampanj_id: '120251633656390435', adset_id: '9' } } };

test('malkampanjFor läser marknaden versalokänsligt och bara när id finns', () => {
  assert.deepEqual(malkampanjFor(post, 'us'), { kampanj_id: '120251633656390435', adset_id: '9' });
  assert.equal(malkampanjFor(post, 'NO'), null);
  assert.equal(malkampanjFor({}, 'US'), null);
  assert.equal(malkampanjFor({ malkampanj: { US: {} } }, 'US'), null);
});

const utfall = (u) => async () => u;

test('domFastMal: ACTIVE på rätt konto blir målet', async () => {
  const d = await domFastMal({ kampanj_id: '1' }, '1107817401910319', utfall({ utfall: 'ACTIVE', kampanj: { id: '1', name: 'Taköverdrag 5 reasons USA TEST', status: 'ACTIVE', account_id: '1107817401910319' } }));
  assert.equal(d.skal, null);
  assert.equal(d.kampanj.id, '1');
  assert.equal(d.kampanj.bas, 'Taköverdrag 5 reasons USA TEST');
});

test('domFastMal faller aldrig tillbaka: fel konto, avvecklad och saknad stoppar', async () => {
  const fel = await domFastMal({ kampanj_id: '1' }, 'A', utfall({ utfall: 'ACTIVE', kampanj: { id: '1', name: 'x', account_id: 'B' } }));
  assert.equal(fel.kampanj, null);
  const avv = await domFastMal({ kampanj_id: '1' }, 'A', utfall({ utfall: 'AVVECKLAD', spend: 500, kampanj: { id: '1', name: 'x', account_id: 'A' } }));
  assert.equal(avv.kampanj, null);
  assert.match(avv.skal, /PAUSED med 500 kr/);
  const borta = await domFastMal({ kampanj_id: '1' }, 'A', utfall({ utfall: 'SAKNAS', kampanj: null, fel: '404' }));
  assert.equal(borta.kampanj, null);
});
