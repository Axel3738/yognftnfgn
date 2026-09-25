// klaviyo/bygg.mjs: fixturerna → filer, manifest i kontraktets form, galleri. Inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync, cpSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bygg } from '../bygg.mjs';
import { FIXTURER, PRODUKTER, RECENSIONER } from './hjalp.mjs';

const nu = new Date('2026-09-24T12:00:00Z');
const kor = (innehallDir = join(FIXTURER, 'innehall'), extra = {}) => {
  const utDir = mkdtempSync(join(tmpdir(), 'klaviyo-bygg-'));
  return bygg({ innehallDir, utDir, produkter: PRODUKTER, recensioner: RECENSIONER, nu, ...extra });
};

test('manifestet har exakt kontraktets form', async () => {
  const { manifest: m, utDir } = await kor();
  assert.deepEqual(Object.keys(m), ['brand', 'byggd', 'mejl', 'kampanjer', 'floden', 'fel', 'varningar']);
  assert.equal(m.brand, 'baverbutiken');
  assert.equal(m.byggd, nu.toISOString());
  assert.deepEqual(m.fel, []);
  assert.deepEqual(m.mejl.map((x) => x.id), ['k01-test-motorholje', 'f02-test-kassa-e1', 'f02-test-kassa-sista']);
  const k = m.mejl[0];
  for (const f of ['id', 'namn', 'amnesrader', 'forhandstext', 'html', 'text', 'kalla', 'taggar', 'memo']) assert.ok(f in k, f);
  assert.equal(k.kalla, 'kampanj');
  assert.ok(!('flode_id' in k));
  assert.deepEqual(Object.keys(k.amnesrader[0]), ['text', 'begar']);
  const e1 = m.mejl[1];
  assert.equal(e1.kalla, 'flode');
  assert.equal(e1.flode_id, 'f02-test-kassa');
  assert.equal(e1.steg_index, 1);
  assert.deepEqual(m.kampanjer[0], {
    id: 'k01-test-motorholje',
    namn: 'MAIL_20260929_Motorholje_PD_1_test_problem_regnet_v1',
    planerad: '2026-09-29T18:00:00+02:00',
    segment: ['SEG_uppvarmning_steg1'],
    exkludera: ['SEG_oengagerade_180d'],
    mejl_id: 'k01-test-motorholje',
    status_plan: 'klar',
    kraver_axel: null,
  });
  const f = m.floden[0];
  assert.deepEqual(Object.keys(f), ['id', 'namn', 'memo', 'trigger', 'filter', 'ateintrade', 'steg']);
  assert.deepEqual(f.steg, [
    { typ: 'vanta', enhet: 'hours', varde: 1 },
    { typ: 'mejl', mejl_id: 'f02-test-kassa-e1' },
    { typ: 'vanta', enhet: 'days', varde: 1 },
    { typ: 'mejl', mejl_id: 'f02-test-kassa-sista' },
  ]);
  for (const x of m.mejl) {
    assert.ok(existsSync(join(utDir, x.html)));
    assert.ok(existsSync(join(utDir, x.text)));
    assert.ok(existsSync(join(utDir, `${x.id}.exempel.html`)));
  }
  assert.deepEqual(JSON.parse(readFileSync(join(utDir, 'manifest.json'), 'utf8')), m);
});

test('galleriet: tidslinje, flödeskedja, förhandsvisning i 390 och 600 px, ljust/mörkt', async () => {
  const { utDir } = await kor();
  const g = readFileSync(join(utDir, 'index.html'), 'utf8');
  assert.match(g, /tis 29 sep kl 18:00/);
  assert.match(g, /Vänta 1 timme/);
  assert.match(g, /width="390"/);
  assert.match(g, /srcdoc=/);
  assert.match(g, /prefers-color-scheme: dark/);
  assert.doesNotMatch(g, /<script[^>]+src=|<link[^>]+stylesheet/);
});

test('--bara bygger bara det valda flödet', async () => {
  const { manifest: m } = await kor(undefined, { bara: 'f02-test-kassa' });
  assert.deepEqual(m.mejl.map((x) => x.id), ['f02-test-kassa-e1', 'f02-test-kassa-sista']);
  assert.equal(m.kampanjer.length, 0);
  assert.equal(m.floden.length, 1);
});

test('ett mejl med fel hamnar i manifestets fel med mejl-id', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'klaviyo-innehall-'));
  cpSync(join(FIXTURER, 'innehall'), dir, { recursive: true });
  const fil = join(dir, 'kampanjer', 'k01-test-motorholje.json');
  const k = JSON.parse(readFileSync(fil, 'utf8'));
  k.forhandstext = 'Nu bara 199 kr — sista chansen';
  k.taggar.urgency = 'ingen';
  writeFileSync(fil, JSON.stringify(k));
  const { manifest: m } = await kor(dir);
  assert.ok(m.fel.some((f) => f.startsWith('k01-test-motorholje: ') && /Tankstreck/.test(f)));
  assert.ok(m.fel.some((f) => /Kronbelopp/.test(f)));
  assert.ok(m.fel.some((f) => /Falsk brådska/.test(f)));
});

// ---- produkter.mjs och recensioner.mjs (falsk fetch, temp-rot) ----
import { mkdirSync } from 'node:fs';
import { hamtaProdukterCache } from '../produkter.mjs';
import { hamtaRecensionerCache, kortNamn, kortaText, sorteraRecensioner } from '../recensioner.mjs';

test('recensioner: bara publicerade 4-5 stjärnor, förnamn + initial, kortad vid ordgräns', () => {
  assert.equal(kortNamn('anna berg'), 'Anna B.');
  assert.equal(kortNamn('Lars'), 'Lars');
  assert.equal(kortNamn(''), 'Verifierad kund');
  const lang = 'ord '.repeat(80).trim();
  const k = kortaText(lang);
  assert.ok(k.length <= 220 && k.endsWith('ord…'));
  const rader = [
    { product_external_id: 1001, rating: 5, body: 'Riktigt bra hölje, sitter kvar i blåsten.', reviewer: { name: 'Anna Berg' }, published: true, created_at: '2026-09-01' },
    { product_external_id: 1001, rating: 3, body: 'Helt okej men inget mer än så.', reviewer: { name: 'Bo' }, published: true },
    { product_external_id: 1001, rating: 5, body: 'Dold recension som inte ska synas.', reviewer: { name: 'C' }, published: true, hidden: true },
    { product_external_id: 1001, rating: 5, body: 'Spam som inte ska synas alls här.', reviewer: { name: 'D' }, published: false, curated: 'spam' },
    { product_external_id: 9999, rating: 5, body: 'Annan produkt som inte finns här.', reviewer: { name: 'E' }, published: true },
  ];
  const ut = sorteraRecensioner(rader, PRODUKTER);
  assert.deepEqual(Object.keys(ut), ['motorholje-test']);
  assert.equal(ut['motorholje-test'].length, 1);
  assert.equal(ut['motorholje-test'][0].namn, 'Anna B.');
});

test('recensioner: live via Judge.me skriver cache, offline läser den', async () => {
  const rot = mkdtempSync(join(tmpdir(), 'klaviyo-rot-'));
  const anrop = [];
  const fetchFn = async (u) => {
    anrop.push(String(u));
    return { ok: true, json: async () => ({ reviews: [{ product_external_id: 1001, rating: 5, body: 'Håller tätt, bra passform på motorn.', reviewer: { name: 'Eva K' }, published: true }] }) };
  };
  const env = { JUDGEME_API_TOKEN: 't', JUDGEME_SHOP_DOMAIN: 'x.myshopify.com' };
  const live = await hamtaRecensionerCache({ brand: 'baverbutiken', produkter: PRODUKTER, rot, env, fetchFn });
  assert.equal(live.kalla, 'live');
  assert.match(anrop[0], /^https:\/\/api\.judge\.me\/api\/v1\/reviews\?/);
  const off = await hamtaRecensionerCache({ brand: 'baverbutiken', produkter: PRODUKTER, rot, offline: true, env: {} });
  assert.equal(off.kalla, 'cache');
  assert.equal(off.recensioner['motorholje-test'][0].namn, 'Eva K.');
});

test('produkter: live skriver cache, offline läser den, annars mejl/produkter.json', async () => {
  const rot = mkdtempSync(join(tmpdir(), 'klaviyo-rot-'));
  const live = await hamtaProdukterCache({ brand: 'baverbutiken', rot, hamta: async () => PRODUKTER });
  assert.equal(live.kalla, 'live');
  const off = await hamtaProdukterCache({ brand: 'baverbutiken', rot, offline: true });
  assert.equal(off.kalla, 'cache');
  assert.equal(off.produkter.length, 3);
  const rot2 = mkdtempSync(join(tmpdir(), 'klaviyo-rot-'));
  mkdirSync(join(rot2, 'mejl'));
  writeFileSync(join(rot2, 'mejl', 'produkter.json'), JSON.stringify(PRODUKTER));
  const reserv = await hamtaProdukterCache({ brand: 'baverbutiken', rot: rot2, offline: true });
  assert.equal(reserv.kalla, 'reserv');
  assert.ok(reserv.varningar.some((v) => /mejl\/produkter\.json/.test(v)));
});
