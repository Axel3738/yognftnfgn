import { test } from 'node:test';
import assert from 'node:assert/strict';
import { KlaviyoKlient, KlaviyoFel, nyckelFranEnv, kontrolleraKonto, frageStrang, sparrSkicka } from '../klient.mjs';
import { hamtaMetriker, metrikId, metrikIds } from '../metriker.mjs';
import { falskKlaviyo } from './falsk.mjs';

const BRAND = { id: 'baverbutiken', namn: 'Bäverbutiken', public_id: 'QZ4jLG', nyckel_env: ['KLAVIYO_API_KEY_BAVERBUTIKEN'] };
const ny = (o = {}) => {
  const f = falskKlaviyo(o);
  const sovningar = [];
  const k = new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async (ms) => { sovningar.push(ms); } });
  return { k, f, sovningar };
};

test('headers: nyckel, revision, JSON:API i accept och content-type', async () => {
  const { k, f } = ny();
  await k.get('/api/accounts');
  const h = f.anrop[0].headers;
  assert.equal(h.Authorization, 'Klaviyo-API-Key pk_test');
  assert.equal(h.revision, '2026-07-15');
  assert.equal(h.accept, 'application/vnd.api+json');
  assert.equal(h['content-type'], 'application/vnd.api+json');
  assert.ok(f.anrop[0].url.startsWith('https://a.klaviyo.com/api/accounts'));
});

test('frågesträngen: arrayer kommaseparerade, null hoppas', () => {
  assert.equal(frageStrang({ 'fields[template]': ['name', 'html'], x: null }), '?fields%5Btemplate%5D=name%2Chtml');
});

test('429: väntar Retry-After sekunder och lyckas sedan', async () => {
  const { k, f, sovningar } = ny({ rateLimit: 2, retryAfter: '3' });
  const svar = await k.get('/api/accounts');
  assert.equal(svar.data[0].attributes.public_api_key, 'QZ4jLG');
  assert.deepEqual(sovningar, [3000, 3000]);
  assert.equal(f.anrop.length, 3);
});

test('429 fem gånger i rad: ger upp med svensk text', async () => {
  const { k, f } = ny({ rateLimit: 10 });
  await assert.rejects(k.get('/api/accounts'), (e) => e instanceof KlaviyoFel && e.status === 429 && /5 gånger i rad/.test(e.message));
  assert.equal(f.anrop.length, 5);
});

test('5xx: backoff och nytt försök', async () => {
  const { k, sovningar } = ny({ serverfel: 2 });
  await k.get('/api/accounts');
  assert.deepEqual(sovningar, [1000, 2000]);
});

test('400: JSON:API-felen i klartext med fält', async () => {
  const { k } = ny();
  await assert.rejects(k.post('/api/templates', { data: { type: 'template', attributes: { name: 'x' } } }), (e) => {
    assert.equal(e.status, 400);
    assert.equal(e.fel[0].code, 'invalid');
    assert.equal(e.fel[0].pointer, '/data/attributes/editor_type');
    assert.match(e.message, /Klaviyo svarade 400 på POST \/api\/templates: \[invalid\] 'editor_type' is a required field\. \(fält \/data\/attributes\/editor_type\)/);
    return true;
  });
});

test('allaSidor följer links.next', async () => {
  const { k, f } = ny({ sidstorlekMetriker: 4 });
  const alla = await k.allaSidor('/api/metrics');
  assert.equal(alla.length, 9);
  assert.equal(f.anrop.length, 3);
});

test('hittaPaNamn: exakt namn, null när det saknas, stopp vid dubblett', async () => {
  const { k } = ny({ mallar: [{ id: 'T1', name: 'TPL_a_v1' }, { id: 'T2', name: 'TPL_a_v10' }], segment: [{ id: 'S1', name: 'SEG_x' }, { id: 'S2', name: 'SEG_x' }] });
  assert.equal((await k.hittaPaNamn('templates', 'TPL_a_v1')).id, 'T1');
  assert.equal(await k.hittaPaNamn('template', 'TPL_saknas_v1'), null);
  await assert.rejects(k.hittaPaNamn('segment', 'SEG_x'), (e) => e.kod === 'DUBBLETT');
});

test('hittaPaNamn för kampanjer: kanalfiltret skickas och namnet jämförs exakt', async () => {
  const { k, f } = ny({ kampanjer: [{ id: 'C1', name: 'MAIL_a' }, { id: 'C2', name: 'MAIL_a_v2' }] });
  const r = await k.hittaPaNamn('campaign', 'MAIL_a');
  assert.equal(r.id, 'C1');
  assert.match(f.anrop.at(-1).q.get('filter'), /equals\(messages\.channel,'email'\)/);
});

test('templates slås upp med page[size] 10 (specens max)', async () => {
  const { k, f } = ny();
  await k.hittaPaNamn('template', 'x');
  assert.equal(f.anrop.at(-1).q.get('page[size]'), '10');
});

test('spärren: send-jobs och live-status når aldrig nätet', async () => {
  const { k, f } = ny();
  await assert.rejects(k.post('/api/campaign-send-jobs', { data: { type: 'campaign-send-job', id: 'C1' } }), (e) => e.kod === 'SPARR_SKICKA');
  await assert.rejects(k.patch('/api/flows/F1', { data: { type: 'flow', id: 'F1', attributes: { status: 'live' } } }), (e) => e.kod === 'SPARR_SKICKA');
  await assert.rejects(k.post('/api/flows', { data: { type: 'flow', attributes: { name: 'x', definition: { triggers: [], entry_action_id: 'a1', actions: [{ temporary_id: 'a1', type: 'send-email', data: { status: 'live' } }] } } } }), (e) => e.kod === 'SPARR_SKICKA');
  await assert.rejects(k.patch('/api/flow-actions/A1', { data: { type: 'flow-action', id: 'A1', attributes: { status: 'live' } } }), (e) => e.kod === 'SPARR_SKICKA');
  assert.equal(f.anrop.length, 0);
  assert.doesNotThrow(() => sparrSkicka('PATCH', '/api/flows/F1', { data: { attributes: { status: 'draft' } } }));
});

test('nyckelFranEnv: bara brandets egna variabler, i ordning', () => {
  assert.equal(nyckelFranEnv(BRAND, { KLAVIYO_API_KEY_CARASHELL: 'pk_fel' }), null);
  assert.equal(nyckelFranEnv(BRAND, { KLAVIYO_API_KEY: 'pk_generisk' }), null);
  assert.deepEqual(nyckelFranEnv(BRAND, { KLAVIYO_API_KEY_BAVERBUTIKEN: ' pk_ratt ' }), { nyckel: 'pk_ratt', variabel: 'KLAVIYO_API_KEY_BAVERBUTIKEN' });
  assert.deepEqual(nyckelFranEnv({ nyckel_env: ['A', 'B'] }, { A: '  ', B: 'pk_b' }), { nyckel: 'pk_b', variabel: 'B' });
});

test('kontrolleraKonto: fel public_api_key stoppar', async () => {
  const { k } = ny({ publik: 'ANNAT1' });
  await assert.rejects(kontrolleraKonto(k, BRAND), (e) => e.kod === 'FEL_KONTO' && /ANNAT1/.test(e.message) && /QZ4jLG/.test(e.message));
  const { k: k2 } = ny();
  assert.equal((await kontrolleraKonto(k2, BRAND)).id, 'ACC1');
});

test('metriker: kassametriken provas under båda namnen', async () => {
  const { k } = ny({ metriker: [['M1', 'Placed Order'], ['M2', 'Checkout Started']] });
  const m = await hamtaMetriker(k);
  assert.equal(metrikId(m, ['Started Checkout', 'Checkout Started']), 'M2');
  assert.throws(() => metrikId(m, 'Viewed Product'), (e) => e.kod === 'METRIK_SAKNAS');
  const { ids, saknas } = metrikIds(m);
  assert.equal(ids.placed_order, 'M1');
  assert.equal(ids.started_checkout, 'M2');
  assert.ok(saknas.some((s) => s.nyckel === 'viewed_product'));
});

test('metriker: två med samma namn är stopp, inte ett val', () => {
  const m = [{ id: 'A', namn: 'Placed Order', integration: 'Shopify' }, { id: 'B', namn: 'Placed Order', integration: 'API' }];
  assert.throws(() => metrikId(m, 'Placed Order'), (e) => e.kod === 'METRIK_FLERA' && /A från Shopify/.test(e.message));
});

test('spärren: kampanj utan send_strategy eller med "immediate" skapas aldrig', () => {
  const kamp = (st) => ({ data: { type: 'campaign', attributes: { name: 'x', ...(st === undefined ? {} : { send_strategy: st }) } } });
  assert.throws(() => sparrSkicka('POST', '/api/campaigns', kamp(undefined)), (e) => e.kod === 'SPARR_SKICKA');
  assert.throws(() => sparrSkicka('POST', '/api/campaigns', kamp({ method: 'immediate' })), (e) => e.kod === 'SPARR_SKICKA');
  assert.throws(() => sparrSkicka('PATCH', '/api/campaigns/C1', kamp({ method: 'immediate' })), (e) => e.kod === 'SPARR_SKICKA');
  assert.doesNotThrow(() => sparrSkicka('POST', '/api/campaigns', kamp({ method: 'static', datetime: '2026-10-01T16:00:00Z', options: { is_local: false } })));
  assert.doesNotThrow(() => sparrSkicka('PATCH', '/api/campaigns/C1', kamp(undefined)));
  // campaign-messages och assign-template berörs inte
  assert.doesNotThrow(() => sparrSkicka('PATCH', '/api/campaign-messages/M1', { data: { attributes: { definition: {} } } }));
});
