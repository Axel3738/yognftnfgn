import { test } from 'node:test';
import assert from 'node:assert/strict';
import { malkampanjFor, domFastMal, ocksaUr, arMalkampanj, landsNamn, domOcksa } from '../lib/malkampanj.mjs';

const post = { malkampanj: { US: { kampanj_id: '120251633656390435', adset_id: '9' } } };

test('malkampanjFor läser marknaden versalokänsligt och bara när id finns', () => {
  assert.deepEqual(malkampanjFor(post, 'us'), { kampanj_id: '120251633656390435', adset_id: '9', ocksa: [] });
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

// ------------------------------------------- extra mål (Australien, 2026-10-03)

const postAu = { malkampanj: { US: { kampanj_id: '1', adset_id: '9', ocksa: [{ land: 'au', kampanj_id: '2', kampanj_namn: 'AU LISTICLE' }, { land: 'XX' }, null] } } };

test('ocksaUr: normaliserar landet till versaler, namnkod = landet, skräp utan id hoppas', () => {
  assert.deepEqual(ocksaUr(postAu.malkampanj.US), [{ land: 'AU', namnkod: 'AU', kampanj_id: '2', kampanj_namn: 'AU LISTICLE', adset_id: null }]);
  assert.deepEqual(malkampanjFor(postAu, 'US').ocksa.map((o) => o.land), ['AU']);
});

test('arMalkampanj: huvudmålet, ett extra mål, eller null — aldrig en gissning', () => {
  const fast = malkampanjFor(postAu, 'US');
  assert.deepEqual(arMalkampanj(fast, '1'), { huvud: true, ocksa: null });
  assert.equal(arMalkampanj(fast, '2').ocksa.land, 'AU');
  assert.equal(arMalkampanj(fast, '3'), null);
  assert.equal(arMalkampanj(null, '1'), null);
});

test('landsNamn: US-namnet blir AU-namnet, ett AU-namn lämnas, ett SE-namn får koden, utan "_" null', () => {
  assert.equal(landsNamn('CaraShellRoof_US_OB_111_H1', 'AU'), 'CaraShellRoof_AU_OB_111_H1');
  assert.equal(landsNamn('CaraShellRoof_AU_OB_111_H1', 'AU'), 'CaraShellRoof_AU_OB_111_H1');
  assert.equal(landsNamn('CaraShellRoof_OB_111_H1', 'AU'), 'CaraShellRoof_AU_OB_111_H1');
  assert.equal(landsNamn('CaraShellRoof_US_OB_111_H1 – kopia', 'AU'), 'CaraShellRoof_AU_OB_111_H1');
  assert.equal(landsNamn('nonsens', 'AU'), null);
});

test('domOcksa: varje extra mål döms som huvudmålet, ett dött extra mål stoppar inte de andra', async () => {
  const fast = { kampanj_id: '1', ocksa: [{ land: 'AU', namnkod: 'AU', kampanj_id: '2' }, { land: 'GB', namnkod: 'GB', kampanj_id: '3' }] };
  const svar = { 2: { utfall: 'ACTIVE', kampanj: { id: '2', name: 'AU LISTICLE', status: 'ACTIVE', account_id: 'A' } }, 3: { utfall: 'AVVECKLAD', spend: 100, kampanj: { id: '3', name: 'GB', account_id: 'A' } } };
  const d = await domOcksa(fast, 'A', async (id) => svar[id]);
  assert.equal(d[0].kampanj.id, '2');
  assert.equal(d[1].kampanj, null);
  assert.match(d[1].skal, /PAUSED med 100 kr/);
});
