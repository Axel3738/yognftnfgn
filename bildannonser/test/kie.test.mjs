import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hamtaNyckel,
  skapaJobb,
  hamtaJobb,
  vantaPaJobb,
  lasResultUrler,
  MODELL_TEXT,
  MODELL_REDIGERA,
  KieFel,
} from '../kie.mjs';

const env = { KIE_API_KEY: 'test-nyckel' };

// Bygger en fejkad fetch som svarar med givna nyttolaster i tur och ordning.
function fejkFetch(svar) {
  const anrop = [];
  const kö = [...svar];
  const impl = async (url, init) => {
    anrop.push({ url, init });
    const nasta = kö.length > 1 ? kö.shift() : kö[0];
    return { ok: true, status: 200, json: async () => nasta, text: async () => '' };
  };
  impl.anrop = anrop;
  return impl;
}

test('hamtaNyckel kräver KIE_API_KEY och säger hur man kör utan den', () => {
  assert.throws(() => hamtaNyckel({}), /KIE_API_KEY/);
  assert.throws(() => hamtaNyckel({}), /--dry/);
  assert.equal(hamtaNyckel(env), 'test-nyckel');
});

test('skapaJobb väljer text-modellen utan referensbilder', async () => {
  const fetchImpl = fejkFetch([{ code: 200, data: { taskId: 'abc' } }]);
  const { taskId, modell } = await skapaJobb({ prompt: 'en bild' }, { fetchImpl, env });
  assert.equal(taskId, 'abc');
  assert.equal(modell, MODELL_TEXT);
  const kropp = JSON.parse(fetchImpl.anrop[0].init.body);
  assert.equal(kropp.input.aspect_ratio, '4:5');
  assert.equal(kropp.input.image_urls, undefined);
});

test('skapaJobb växlar till edit-modellen när briefen har en referensbild', async () => {
  const fetchImpl = fejkFetch([{ code: 200, data: { taskId: 'def' } }]);
  const { modell } = await skapaJobb(
    { prompt: 'matcha vinnaren', referensBilder: ['https://ex.se/a.png'], bildformat: '1:1' },
    { fetchImpl, env },
  );
  assert.equal(modell, MODELL_REDIGERA);
  const kropp = JSON.parse(fetchImpl.anrop[0].init.body);
  assert.deepEqual(kropp.input.image_urls, ['https://ex.se/a.png']);
  assert.equal(kropp.input.aspect_ratio, '1:1');
});

test('skapaJobb vägrar tom prompt, okänt format och för många referenser', async () => {
  const fetchImpl = fejkFetch([{ code: 200, data: { taskId: 'x' } }]);
  await assert.rejects(() => skapaJobb({ prompt: '  ' }, { fetchImpl, env }), /Tom prompt/);
  await assert.rejects(
    () => skapaJobb({ prompt: 'a', bildformat: '7:3' }, { fetchImpl, env }),
    /Ogiltigt bildformat/,
  );
  await assert.rejects(
    () => skapaJobb({ prompt: 'a', referensBilder: new Array(11).fill('u') }, { fetchImpl, env }),
    /Max 10 referensbilder/,
  );
});

test('ett kie.ai-fel i kuvertet blir ett tydligt KieFel, inte ett tyst null', async () => {
  const fetchImpl = fejkFetch([{ code: 402, msg: 'Insufficient credits' }]);
  await assert.rejects(
    () => skapaJobb({ prompt: 'a' }, { fetchImpl, env }),
    (f) => f instanceof KieFel && /402/.test(f.message) && /credits/.test(f.message),
  );
});

test('lasResultUrler klarar JSON-sträng, objekt och skräp', () => {
  assert.deepEqual(lasResultUrler('{"resultUrls":["https://ex.se/1.png"]}'), [
    'https://ex.se/1.png',
  ]);
  assert.deepEqual(lasResultUrler({ resultUrls: ['https://ex.se/2.png'] }), [
    'https://ex.se/2.png',
  ]);
  assert.deepEqual(lasResultUrler('inte json'), []);
  assert.deepEqual(lasResultUrler(null), []);
});

test('hamtaJobb översätter läget till klar/misslyckad', async () => {
  const klar = await hamtaJobb('t', {
    env,
    fetchImpl: fejkFetch([
      { code: 200, data: { state: 'success', resultJson: '{"resultUrls":["https://ex.se/a.png"]}' } },
    ]),
  });
  assert.equal(klar.klar, true);
  assert.deepEqual(klar.urler, ['https://ex.se/a.png']);

  const fel = await hamtaJobb('t', {
    env,
    fetchImpl: fejkFetch([{ code: 200, data: { state: 'fail', failMsg: 'blockerad prompt' } }]),
  });
  assert.equal(fel.misslyckad, true);
  assert.equal(fel.felmeddelande, 'blockerad prompt');
});

test('vantaPaJobb pollar tills jobbet är klart', async () => {
  const fetchImpl = fejkFetch([
    { code: 200, data: { state: 'queuing' } },
    { code: 200, data: { state: 'generating' } },
    { code: 200, data: { state: 'success', resultJson: '{"resultUrls":["https://ex.se/k.png"]}' } },
  ]);
  const status = await vantaPaJobb('t', { env, fetchImpl, sov: async () => {}, intervallMs: 0 });
  assert.deepEqual(status.urler, ['https://ex.se/k.png']);
  assert.equal(fetchImpl.anrop.length, 3);
});

test('vantaPaJobb ger upp vid timeout i stället för att hänga natten', async () => {
  let tid = 0;
  await assert.rejects(
    () =>
      vantaPaJobb('t', {
        env,
        fetchImpl: fejkFetch([{ code: 200, data: { state: 'generating' } }]),
        sov: async () => {
          tid += 60000;
        },
        nu: () => tid,
        timeoutMs: 120000,
      }),
    /Timeout/,
  );
});

test('ett "klart" jobb utan bild-URL räknas som fel', async () => {
  await assert.rejects(
    () =>
      vantaPaJobb('t', {
        env,
        fetchImpl: fejkFetch([{ code: 200, data: { state: 'success', resultJson: '{}' } }]),
        sov: async () => {},
      }),
    /ingen bild-URL/,
  );
});
