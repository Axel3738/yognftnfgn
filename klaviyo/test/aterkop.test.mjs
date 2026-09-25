import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analysera } from '../aterkop.mjs';

const o = (profil, tid, varde, extra = {}) => ({ profil, tid, varde, flode: null, kampanj: null, ...extra });

test('ny mot återkommande: tidigare köp i historiken gör kunden återkommande', () => {
  const r = analysera({
    ordrar: [o('a', '2026-01-01T10:00:00Z', 100), o('a', '2026-09-20T10:00:00Z', 200, { flode: 'F7' }), o('b', '2026-09-21T10:00:00Z', 300)],
    fran: '2026-09-01T00:00:00Z', till: '2026-09-25T00:00:00Z', flodNamn: { F7: 'Tips' },
  });
  assert.deepEqual(r.summa.nya, { ordrar: 1, intakt: 300 });
  assert.deepEqual(r.summa.aterkommande, { ordrar: 1, intakt: 200 });
  assert.deepEqual(r.franMejl.aterkommande, { ordrar: 1, intakt: 200 });
  assert.equal(r.kallor[0].namn, 'Tips');
  assert.equal(r.historikFran, '2026-01-01T10:00:00Z');
});

test('kassan: köp inom en timme är inte övergivet, köp efter räknas som återvunnet', () => {
  const r = analysera({
    ordrar: [o('a', '2026-09-20T10:30:00Z', 100), o('b', '2026-09-22T10:00:00Z', 200, { flode: 'K' })],
    kassor: [{ profil: 'a', tid: '2026-09-20T10:00:00Z' }, { profil: 'b', tid: '2026-09-20T10:00:00Z' }, { profil: 'c', tid: '2026-09-20T10:00:00Z' }],
    fran: '2026-09-01T00:00:00Z', till: '2026-09-25T00:00:00Z', kassaFloden: ['K'],
  });
  assert.equal(r.kassa.direkt, 1);
  assert.equal(r.kassa.overgivna, 2);
  assert.equal(r.kassa.atervunna, 1);
  assert.equal(r.kassa.viaFlodet, 1);
  assert.equal(r.kassa.intaktFlodet, 200);
});
