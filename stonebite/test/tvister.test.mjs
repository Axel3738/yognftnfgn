// Tvisterna direkt ur Shopify (stonebite/kallor/shopify.mjs hamtaTvister).
//
// Mätt 2026-09-23: sajten läste tvisterna ur kundtjänstens veckorapport, och
// den enda rapporten var Bäverbutikens från 2026-09-14 — rutinen stod
// avstängd. CaraShell visade "Inga öppna tvister" utan att någon frågat
// Shopify. Testerna bevisar att (1) tvisterna läses med paginering (Shopify
// ger 50 per sida — Bäverbutiken hade 68), (2) en butik som inte går att läsa
// blir "okänd" och aldrig noll, (3) Shopify vinner över veckorapporten butik
// för butik, och (4) `under review` aldrig larmas.
//
// Inget nät: fetch är en fejk som spelar Shopify.

import test from 'node:test';
import assert from 'node:assert/strict';
import { hamtaTvister, hamtaAllaTvister, tvistRad } from '../kallor/shopify.mjs';
import { slaIhopTvister } from '../../bonus/kallor.mjs';
import { hittaLarm } from '../larm.mjs';
import { tvisterForSidan } from '../vy/drift.mjs';

const NU = new Date('2026-09-23T12:00:00Z');
const BAVER = { id: 'baverbutiken', namn: 'Bäverbutiken', myshopify: '4snrw0-mg.myshopify.com', env_suffix: 'SE' };
const CARA = { id: 'carashell', namn: 'Carashell', myshopify: 'yitrbk-m3.myshopify.com', suffix: 'yitrbk_m3' };
const ENV = {
  SHOPIFY_SHOP_SE: BAVER.myshopify, SHOPIFY_CLIENT_ID_SE: 'app-se', SHOPIFY_CLIENT_SECRET_SE: 'x',
  SHOPIFY_SHOP_yitrbk_m3: CARA.myshopify, SHOPIFY_CLIENT_ID_yitrbk_m3: 'app-cara', SHOPIFY_CLIENT_SECRET_yitrbk_m3: 'y',
};

function svar(status, body, link = null) {
  return { status, ok: status >= 200 && status < 300, headers: { get: (h) => (h.toLowerCase() === 'link' ? link : null) }, text: async () => body, json: async () => JSON.parse(body) };
}

function tvist(i, over = {}) {
  return { id: i, order_id: 1000 + i, type: 'inquiry', reason: 'product_not_received', status: 'won', amount: '100.00', currency: 'SEK', initiated_at: '2026-09-01T10:00:00+02:00', evidence_due_by: '2026-09-20T23:59:59+02:00', ...over };
}

/** Fejk-Shopify. `per` = tvister per butik, `nekad` = appar som får 403 på tvisterna. */
function fejk({ per = {}, nekad = [], sida = 50 } = {}) {
  const anrop = [];
  const fetchFn = async (url, init = {}) => {
    anrop.push(url);
    if (url.endsWith('/admin/oauth/access_token')) {
      const { client_id } = JSON.parse(init.body);
      return svar(200, JSON.stringify({ access_token: `tok-${client_id}` }));
    }
    const shop = new URL(url).host;
    const app = String(init.headers?.['X-Shopify-Access-Token'] ?? '').replace(/^tok-/, '');
    if (url.includes('/disputes.json')) {
      if (nekad.includes(app)) return svar(403, '{"errors":"[API] This action requires merchant approval for read_shopify_payments_disputes scope."}');
      const alla = per[shop] ?? [];
      const fran = Number(new URL(url).searchParams.get('page_info') ?? 0);
      const bit = alla.slice(fran, fran + sida);
      const nasta = fran + sida < alla.length ? `<https://${shop}/admin/api/2025-07/shopify_payments/disputes.json?page_info=${fran + sida}>; rel="next"` : null;
      return svar(200, JSON.stringify({ disputes: bit }), nasta);
    }
    if (url.includes('/orders.json')) {
      const ids = (new URL(url).searchParams.get('ids') ?? '').split(',').filter(Boolean);
      return svar(200, JSON.stringify({ orders: ids.map((id) => ({ id: Number(id), name: `#${Number(id) - 1000 + 5000}` })) }));
    }
    return svar(404, '{}');
  };
  return { fetchFn, anrop };
}

test('pagineras: 68 tvister över två sidor blir 68, inte de 50 Shopify ger på första sidan', async () => {
  const lista = Array.from({ length: 68 }, (_, i) => tvist(i));
  const { fetchFn } = fejk({ per: { [BAVER.myshopify]: lista } });
  const r = await hamtaTvister(BAVER, { env: ENV, fetchFn, nu: NU });
  assert.equal(r.status, 'ok');
  assert.equal(r.lista.length, 68);
  assert.equal(r.lista[0].order, '#5000', 'ordernamnet slås upp — bonusens anspråk pekar på #nummer');
});

test('raden bär samma form som veckorapportens: status med mellanslag, besvarad, öppen, utfall', () => {
  const needs = tvistRad(tvist(1, { status: 'needs_response', type: 'chargeback' }), { butikId: 'baverbutiken' });
  assert.equal(needs.status, 'needs response');
  assert.equal(needs.oppen, true);
  assert.equal(needs.besvarad, false);
  assert.equal(needs.deadline, '2026-09-20');
  const review = tvistRad(tvist(2, { status: 'under_review' }), { butikId: 'baverbutiken' });
  assert.equal(review.oppen, true);
  assert.equal(review.besvarad, true, 'under review = bevisen är redan inne');
  const vunnen = tvistRad(tvist(3, { status: 'won' }), { butikId: 'baverbutiken' });
  assert.equal(vunnen.oppen, false);
  assert.equal(vunnen.utfall, 'won');
});

test('en gammal tvist som fortfarande är öppen följer med, en gammal avgjord gör det inte', async () => {
  const gammal = { initiated_at: '2025-01-01T00:00:00Z' };
  const { fetchFn } = fejk({ per: { [BAVER.myshopify]: [tvist(1, { ...gammal, status: 'needs_response' }), tvist(2, gammal)] } });
  const r = await hamtaTvister(BAVER, { env: ENV, fetchFn, nu: NU });
  assert.deepEqual(r.lista.map((x) => x.orderId), ['1001']);
});

test('CaraShell utan tvister ⇒ ok med tom lista (Shopify har svarat) — inte okänd', async () => {
  const { fetchFn } = fejk({ per: {} });
  const r = await hamtaAllaTvister([CARA], { env: ENV, fetchFn, nu: NU });
  assert.equal(r.butiker[0].status, 'ok');
  assert.equal(r.butiker[0].antal, 0);
  assert.equal(r.status, 'ok');
});

test('403 på tvisterna ⇒ butiken är OKÄND med orsak, aldrig noll tvister', async () => {
  const { fetchFn } = fejk({ nekad: ['app-se'] });
  const r = await hamtaAllaTvister([BAVER, CARA], { env: ENV, fetchFn, nu: NU });
  const baver = r.butiker.find((b) => b.id === 'baverbutiken');
  assert.equal(baver.status, 'fel');
  assert.match(baver.orsak, /read_shopify_payments_disputes/);
  assert.equal(r.status, 'delvis');
});

test('avstängda butiker hämtas inte alls', async () => {
  const { fetchFn, anrop } = fejk();
  const r = await hamtaAllaTvister([{ ...CARA, av: true }], { env: ENV, fetchFn, nu: NU });
  assert.equal(r.butiker.length, 0);
  assert.equal(anrop.length, 0);
});

test('Shopify vinner över veckorapporten butik för butik; oläst butik behåller rapportens rader, märkta', () => {
  const vecka = [
    { order: '#5122', brand: 'baverbutiken', status: 'needs response', oppen: true, besvarad: false },
    { order: '#77', brand: 'annan', status: 'needs response', oppen: true, besvarad: false },
  ];
  const live = {
    butiker: [{ id: 'baverbutiken', status: 'ok' }, { id: 'annan', status: 'fel' }],
    lista: [{ order: '#5122', brand: 'baverbutiken', status: 'under review', oppen: true, besvarad: true, kalla: 'shopify' }],
  };
  const ut = slaIhopTvister(vecka, live);
  assert.equal(ut.filter((x) => x.order === '#5122').length, 1, 'ingen dubblett');
  assert.equal(ut.find((x) => x.order === '#5122').status, 'under review', 'Shopifys läge, inte rapportens');
  assert.equal(ut.find((x) => x.order === '#77').kalla, 'veckorapport');
  assert.deepEqual(slaIhopTvister(vecka, null), vecka, 'utan livläsning är allt som förut');
});

test('larmet pingar aldrig en tvist under review — bara den som väntar på vårt svar', () => {
  const snapshot = {
    eskalering: { kanaler: [{ brand: 'baverbutiken', kanal: 'customer-service', kanalId: '1', roll: 'eskalering', server: 'S', lank: 'l', meddelanden: [] }] },
    oppnaTvister: [
      { order: '#5122', brand: 'baverbutiken', typ: 'inquiry', belopp: 1, valuta: 'SEK', deadline: '2026-09-24', oppen: true, besvarad: true },
      { order: '#4914', brand: 'baverbutiken', typ: 'chargeback', belopp: 348, valuta: 'SEK', deadline: '2026-09-24', oppen: true, besvarad: false },
    ],
  };
  const { larm } = hittaLarm({ snapshot, personer: [], nu: NU });
  assert.deepEqual(larm.filter((l) => l.typ === 'tvist').map((l) => l.order), ['#4914']);
});

test('sidan Kundtjänst: med livläsning visas Shopifys rader, utan veckorapport, och under review räknas inte som brådskande', () => {
  const snapshot = {
    butiker: [{ id: 'carashell', namn: 'Carashell' }, { id: 'baverbutiken', namn: 'Bäverbutiken' }],
    kundtjanst: { status: 'ok', brands: [{ id: 'baverbutiken', namn: 'Bäverbutiken', tvister: [{ order: '#1', deadline: '2026-09-24' }] }] },
    tvister: { hamtad: NU.toISOString(), butiker: [{ id: 'carashell', namn: 'Carashell', status: 'ok' }, { id: 'baverbutiken', namn: 'Bäverbutiken', status: 'ok' }] },
    oppnaTvister: [
      { order: '#4914', brand: 'baverbutiken', deadline: '2026-09-25', oppen: true, besvarad: false },
      { order: '#4446', brand: 'baverbutiken', deadline: '2026-09-24', oppen: true, besvarad: true },
    ],
  };
  const tv = tvisterForSidan(snapshot, NU);
  assert.equal(tv.fran, 'shopify');
  assert.deepEqual(tv.bradskande.map((x) => x.order), ['#4914'], 'veckorapportens #1 och under review-raden syns inte');
  assert.equal(tv.bradskande[0].brand, 'Bäverbutiken');
  assert.deepEqual(tv.lasta.map((b) => b.id), ['carashell', 'baverbutiken']);
  // Utan livläsning: veckorapporten som förut.
  const gammal = tvisterForSidan({ ...snapshot, tvister: null }, NU);
  assert.equal(gammal.fran, 'veckorapport');
  assert.deepEqual(gammal.bradskande.map((x) => x.order), ['#1']);
});
