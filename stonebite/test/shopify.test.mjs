// Shopify-källan: nycklarna provas app för app tills en får läsa ordrarna.
//
// Mätt 2026-09-22 på Bäverbutiken: appen bakom SHOPIFY_*_SE svarar 403 på
// ordrar ("requires merchant approval for read_orders") medan spårningens app
// (SHOPIFY_*_SE_BAVER_SE) läser 900 ordrar i timmen. Sajten sa "Bäverbutiken
// saknas" fast en fungerande nyckel fanns i samma miljö. Det här testet är
// bevis på att 403 på EN app aldrig är slutet — och att felet, när alla
// appar fallit, säger exakt vilka variabler som skulle ha löst det.
//
// Ingen nät ut: fetch är en fejk som spelar Shopify.

import test from 'node:test';
import assert from 'node:assert/strict';
import { kandidatNycklar, losNycklar, hamtaButik, forklaraNyckelfel, saknadeRegistreradeNycklar } from '../kallor/shopify.mjs';
import { forklaraFel } from '../forklaring.mjs';

const DOMAN = '4snrw0-mg.myshopify.com';
const NU = new Date('2026-09-22T18:00:00Z');

/** Fejk-Shopify: varje app (client id) får sin egen token; `farOrdrar` säger vilka appar som får läsa ordrar. */
function fejkShopify({ farOrdrar = [], installerade = null, ordrar = [] } = {}) {
  const anrop = [];
  const fetchFn = async (url, init = {}) => {
    anrop.push({ url, method: init.method ?? 'GET' });
    if (url.endsWith('/admin/oauth/access_token')) {
      const { client_id } = JSON.parse(init.body);
      if (installerade && !installerade.includes(client_id)) return svar(400, '<!DOCTYPE html><html><head><title>400 - Oauth error app_not_installed</title></head></html>');
      return svar(200, JSON.stringify({ access_token: `tok-${client_id}`, scope: 'read_orders' }));
    }
    const token = init.headers?.['X-Shopify-Access-Token'] ?? '';
    const app = token.replace(/^tok-/, '');
    if (url.includes('/shop.json')) return svar(200, JSON.stringify({ shop: { name: 'Bäverbutiken', currency: 'SEK', domain: 'baverbutiken.se', myshopify_domain: DOMAN } }));
    if (url.includes('/orders.json')) {
      if (!farOrdrar.includes(app)) return svar(403, JSON.stringify({ errors: '[API] This action requires merchant approval for read_orders scope.' }));
      return svar(200, JSON.stringify({ orders: ordrar }));
    }
    return svar(404, '{}');
  };
  return { fetchFn, anrop };
}

function svar(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: () => null },
    text: async () => body,
    json: async () => JSON.parse(body),
  };
}

const BUTIK = { id: 'baverbutiken', namn: 'Bäverbutiken', myshopify: DOMAN, env_suffix: 'SE_BAVER_SE', ops: false, url: 'https://baverbutiken.se' };

const ENV_TVA = {
  SHOPIFY_SHOP_SE: DOMAN, SHOPIFY_CLIENT_ID_SE: 'app-se', SHOPIFY_CLIENT_SECRET_SE: 'hemlig-se',
  SHOPIFY_SHOP_SE_BAVER_SE: DOMAN, SHOPIFY_CLIENT_ID_SE_BAVER_SE: 'app-sparning', SHOPIFY_CLIENT_SECRET_SE_BAVER_SE: 'hemlig-sparning',
  SHOPIFY_SHOP_NO: 'annan.myshopify.com', SHOPIFY_CLIENT_ID_NO: 'app-no', SHOPIFY_CLIENT_SECRET_NO: 'hemlig-no',
};
const ENV_EN = {
  SHOPIFY_SHOP_SE: DOMAN, SHOPIFY_CLIENT_ID_SE: 'app-se', SHOPIFY_CLIENT_SECRET_SE: 'hemlig-se',
};

test('kandidaterna: registrerade suffixet först, sedan domänens, aldrig en app för en annan butik, aldrig dubbletter', async () => {
  const k = await kandidatNycklar(BUTIK, ENV_TVA);
  assert.deepEqual(k.map((x) => x.via), ['SHOPIFY_*_SE_BAVER_SE', 'SHOPIFY_*_SE']);
  assert.ok(k.every((x) => x.shop === DOMAN));
  const forsta = await losNycklar(BUTIK, ENV_TVA);
  assert.equal(forsta.via, 'SHOPIFY_*_SE_BAVER_SE', 'spårningens app — den som bevisat får läsa ordrar — provas först');
});

test('hamtaButik: 403 på första appen ⇒ nästa app läser, och resultatet säger vilken', async () => {
  const { fetchFn, anrop } = fejkShopify({
    farOrdrar: ['app-sparning'],
    ordrar: [{ id: 1, created_at: '2026-09-22T10:00:00Z', current_total_price: '599.00' }, { id: 2, created_at: '2026-09-21T10:00:00Z', total_price: '348.00', cancelled_at: null }],
  });
  // Miljön här har SE före SE_BAVER_SE i ordningen — det får inte spela roll.
  const env = { SHOPIFY_SHOP_SE: DOMAN, SHOPIFY_CLIENT_ID_SE: 'app-se', SHOPIFY_CLIENT_SECRET_SE: 'hemlig-se', ...ENV_TVA };
  const rad = await hamtaButik(BUTIK, { dagar: 7, env, fetchFn, nu: NU });
  assert.equal(rad.status, 'ok');
  assert.equal(rad.via, 'SHOPIFY_*_SE_BAVER_SE');
  assert.equal(rad.ordrar, 2);
  assert.equal(rad.valuta, 'SEK');
  assert.equal(rad.dagar.find((d) => d.datum === '2026-09-22')?.omsattning, 599);
  assert.ok(anrop.some((a) => a.url.includes('orders.json')), 'ordrarna lästes');
});

test('hamtaButik: bara den nekade appen i miljön ⇒ felet namnger appen OCH de tre variabler som skulle ha löst det', async () => {
  const { fetchFn } = fejkShopify({ farOrdrar: [] });
  await assert.rejects(
    () => hamtaButik(BUTIK, { dagar: 7, env: ENV_EN, fetchFn, nu: NU }),
    (e) => {
      assert.match(e.message, /^Shopify-appen bakom SHOPIFY_\*_SE får inte läsa ordrar \(403: merchant approval for read_orders saknas\)/);
      assert.match(e.message, /SHOPIFY_SHOP_SE_BAVER_SE, SHOPIFY_CLIENT_ID_SE_BAVER_SE, SHOPIFY_CLIENT_SECRET_SE_BAVER_SE/);
      assert.match(e.message, /Protected customer data access/);
      return true;
    },
  );
  assert.deepEqual(saknadeRegistreradeNycklar(BUTIK, ENV_EN), ['SHOPIFY_SHOP_SE_BAVER_SE', 'SHOPIFY_CLIENT_ID_SE_BAVER_SE', 'SHOPIFY_CLIENT_SECRET_SE_BAVER_SE']);
  assert.deepEqual(saknadeRegistreradeNycklar(BUTIK, ENV_TVA), []);
});

test('hamtaButik: båda apparna nekade ⇒ båda står i felet, utan variabeltips (de finns ju redan)', async () => {
  const { fetchFn } = fejkShopify({ farOrdrar: [] });
  await assert.rejects(
    () => hamtaButik(BUTIK, { dagar: 7, env: ENV_TVA, fetchFn, nu: NU }),
    (e) => {
      assert.match(e.message, /SHOPIFY_\*_SE_BAVER_SE, SHOPIFY_\*_SE får inte läsa ordrar/);
      assert.doesNotMatch(e.message, /lägg in SHOPIFY_SHOP_/);
      assert.match(e.message, /Godkänn kunddata/);
      return true;
    },
  );
});

test('hamtaButik: appen inte installerad på ena, 403 på andra ⇒ felet bär båda orsakerna', async () => {
  const { fetchFn } = fejkShopify({ farOrdrar: [], installerade: ['app-se'] });
  await assert.rejects(
    () => hamtaButik(BUTIK, { dagar: 7, env: ENV_TVA, fetchFn, nu: NU }),
    (e) => {
      assert.match(e.message, /Shopify-appen bakom SHOPIFY_\*_SE får inte läsa ordrar/);
      assert.match(e.message, /Prövade också SHOPIFY_\*_SE_BAVER_SE \(token-svaret var inte JSON \(400\)/);
      return true;
    },
  );
});

test('hamtaButik: ett annat fel än 403 kastas direkt — det säger något om butiken, inte om appen', async () => {
  const fetchFn = async (url, init = {}) => {
    if (url.endsWith('/admin/oauth/access_token')) return svar(200, JSON.stringify({ access_token: 'tok-x' }));
    return svar(402, JSON.stringify({ errors: 'Unavailable Shop' }));
  };
  await assert.rejects(() => hamtaButik(BUTIK, { dagar: 7, env: ENV_TVA, fetchFn, nu: NU }), /Shopify svarade 402/);
});

test('hamtaButik utan en enda nyckel ⇒ det gamla "nycklarna saknas"-felet med variabelnamnen', async () => {
  const { fetchFn } = fejkShopify();
  await assert.rejects(() => hamtaButik({ ...BUTIK, env_suffix: '' }, { env: {}, fetchFn, nu: NU }), /nycklarna saknas i miljön \(SHOPIFY_SHOP_/);
});

test('forklaraNyckelfel är ren och forklaraFel behåller den meningen i stället för den generella', () => {
  const text = forklaraNyckelfel(BUTIK, [{ via: 'SHOPIFY_*_SE', fel: '403 — requires merchant approval for read_orders' }], ENV_EN);
  const f = forklaraFel(text);
  assert.equal(f.text, 'Shopify-appen bakom SHOPIFY_*_SE får inte läsa ordrar (403: merchant approval for read_orders saknas).');
  assert.match(f.atgard, /^Axel: Spårningen läser samma butik med appen bakom SHOPIFY_\*_SE_BAVER_SE — lägg in SHOPIFY_SHOP_SE_BAVER_SE/);
  // Det råa Shopify-felet (utan vår mening) får fortfarande den generella förklaringen.
  assert.match(forklaraFel('Shopify svarade 403: {"errors":"[API] This action requires merchant approval for read_orders scope."}').text, /Protected customer data access/);
});
