// Motorn per brand (2026-09-25, Matstrumpor): --brand i sla-pa och schemalagg,
// brandets Shopify-modul och reservfil, recensionskällan, kategorisegmenten,
// prenumerantlistans namn, sidhuvudet och det dynamiska prisfältet. Inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { KlaviyoKlient } from '../klient.mjs';
import { slaPa, tolkaArgs as argsSlaPa } from '../sla-pa.mjs';
import { schemalagg, tolkaArgs as argsSchemalagg, kampanjNamnFor } from '../schemalagg.mjs';
import { hamtaProdukterCache, reservSokvag } from '../produkter.mjs';
import { hamtaRecensionerCache, recensionsKalla, avHtml, widgetTillRader } from '../recensioner.mjs';
import { segmentLista, segmentPaNamn, SEGMENT, KATEGORIER, samtyckeVillkor, harSamtycke } from '../segment.mjs';
import { byggMejl, stilFran } from '../mallar.mjs';
import { laddaUpp } from '../ladda-upp.mjs';
import { kolla } from '../kolla.mjs';
import { falskKlaviyo } from './falsk.mjs';
import { BRAND, PRODUKTER, RECENSIONER, KAMPANJ, mejl, ROTEN, lasJson, FIXTURER } from './hjalp.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'klaviyo-brand-'));
const NU = () => new Date('2026-09-24T12:00:00Z');
const MATSTRUMPOR = lasJson(path.join(ROTEN, 'klaviyo', 'brands', 'matstrumpor.json'));
const STIL_MS = lasJson(path.join(ROTEN, 'mejl', 'butiker', 'matstrumpor.json'));
const MANIFEST = () => lasJson(path.join(FIXTURER, 'manifest.json'));
const nyKlientFor = (f) => (o = {}) => new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async () => {}, ...o });
const skrivningar = (f) => f.anrop.filter((a) => a.metod !== 'GET').map((a) => `${a.metod} ${a.sokvag}`);

const FLODE_DEF = () => ({
  triggers: [{ type: 'metric', id: 'M_PO' }],
  entry_action_id: 'a1',
  actions: [
    { id: 11, type: 'send-email', links: { next: 12 }, data: { status: 'draft', message: { subject_line: 'x' } } },
    { id: 12, type: 'time-delay', links: { next: 13 }, data: { unit: 'days', value: 1 } },
    { id: 13, type: 'send-email', links: { next: null }, data: { status: 'draft', message: { subject_line: 'y' } } },
  ],
});

// ------------------------------------------------------------------ brandfilen

test('matstrumpor.json: eget konto, egen nyckel, egen Shopify-modul, inget av Bäverbutikens', () => {
  assert.equal(MATSTRUMPOR.public_id, 'UV6Rqg');
  assert.deepEqual(MATSTRUMPOR.nyckel_env, ['KLAVIYO_API_KEY_MATSTRUMPOR']);
  assert.equal(MATSTRUMPOR.shopify.modul, 'klaviyo/shopify-butik.mjs');
  assert.equal(MATSTRUMPOR.shopify.butik, 'matstrumpor');
  assert.equal(MATSTRUMPOR.avsandare.from_email, 'kundsupport@matstrumpor.se');
  assert.equal(MATSTRUMPOR.sparningssida, 'https://matstrumpor.se/pages/spara');
  assert.equal(MATSTRUMPOR.erbjudande_fran, null);
  assert.equal(MATSTRUMPOR.metrik_val['Viewed Product'], 'R9yPAm');
  assert.ok(Number.isInteger(MATSTRUMPOR.leverans_p90_dygn));
  for (const s of JSON.stringify(MATSTRUMPOR).matchAll(/QZ4jLG|baverbutiken\.se|BAVERBUTIKEN/g)) assert.fail(`Bäverbutiken i Matstrumpors brandfil: ${s[0]}`);
});

// ------------------------------------------------------------------ sla-pa --brand

test('sla-pa: argumenten — standard baverbutiken, --brand byter, okänd flagga stoppar', () => {
  assert.deepEqual(argsSlaPa(['FLOW_a', '--ja']), { brand: 'baverbutiken', ja: true, namn: ['FLOW_a'] });
  assert.deepEqual(argsSlaPa(['--brand', 'matstrumpor', 'FLOW_a', 'FLOW_b']), { brand: 'matstrumpor', ja: false, namn: ['FLOW_a', 'FLOW_b'] });
  assert.throws(() => argsSlaPa(['--brand']), /--brand vill ha/);
  assert.throws(() => argsSlaPa(['--skarpt']), /Okänt argument/);
});

test('sla-pa torrt mot Matstrumpors konto: läser flödet, skriver inget', async () => {
  const f = falskKlaviyo({ publik: 'UV6Rqg', floden: [{ id: 'F1', name: 'FLOW_a_v1', definition: FLODE_DEF() }] });
  const dir = tmp();
  const r = await slaPa({ brand: MATSTRUMPOR, namn: ['FLOW_a_v1'], nyKlient: nyKlientFor(f), kontoDir: dir, nu: NU });
  assert.equal(r.ja, false);
  assert.equal(r.brand, 'matstrumpor');
  assert.equal(r.plan[0].mejl.length, 2);
  assert.deepEqual(skrivningar(f), []);
  assert.equal(fs.existsSync(path.join(dir, 'pasatt.jsonl')), false);
});

test('sla-pa --ja: varje mejl och flödet blir live, tillbakaläst, loggat med brand', async () => {
  const f = falskKlaviyo({ publik: 'UV6Rqg', floden: [{ id: 'F1', name: 'FLOW_a_v1', definition: FLODE_DEF() }] });
  const dir = tmp();
  const r = await slaPa({ brand: MATSTRUMPOR, namn: ['FLOW_a_v1'], ja: true, nyKlient: nyKlientFor(f), kontoDir: dir, nu: NU });
  assert.equal(r.ja, true);
  assert.deepEqual(skrivningar(f), ['PATCH /api/flow-actions/11', 'PATCH /api/flow-actions/13', 'PATCH /api/flows/F1']);
  assert.equal(r.resultat[0].status, 'live');
  assert.deepEqual(r.resultat[0].mejl, ['live', 'live']);
  const rader = fs.readFileSync(path.join(dir, 'pasatt.jsonl'), 'utf8').trim().split('\n').map((x) => JSON.parse(x));
  assert.equal(rader.length, 1);
  assert.equal(rader[0].brand, 'matstrumpor');
  assert.equal(rader[0].id, 'F1');
});

test('sla-pa: fel konto bakom nyckeln stoppar innan något skrivs', async () => {
  const f = falskKlaviyo({ publik: 'QZ4jLG', floden: [{ id: 'F1', name: 'FLOW_a_v1', definition: FLODE_DEF() }] });
  await assert.rejects(slaPa({ brand: MATSTRUMPOR, namn: ['FLOW_a_v1'], ja: true, nyKlient: nyKlientFor(f), kontoDir: tmp(), nu: NU }), (e) => e.kod === 'FEL_KONTO');
  assert.deepEqual(skrivningar(f), []);
});

test('sla-pa: ett namn som inte finns (eller finns två gånger) stoppar', async () => {
  const f = falskKlaviyo({ publik: 'UV6Rqg', floden: [{ id: 'F1', name: 'FLOW_a_v1', definition: FLODE_DEF() }, { id: 'F2', name: 'FLOW_dubbel', definition: FLODE_DEF() }, { id: 'F3', name: 'FLOW_dubbel', definition: FLODE_DEF() }] });
  await assert.rejects(slaPa({ brand: MATSTRUMPOR, namn: ['FLOW_finns_inte'], ja: true, nyKlient: nyKlientFor(f), kontoDir: tmp(), nu: NU }), /ger 0 flöden/);
  await assert.rejects(slaPa({ brand: MATSTRUMPOR, namn: ['FLOW_dubbel'], ja: true, nyKlient: nyKlientFor(f), kontoDir: tmp(), nu: NU }), /ger 2 flöden/);
  assert.deepEqual(skrivningar(f), []);
});

// ------------------------------------------------------------------ schemalagg --brand

const kampanjKonto = (over = {}) => falskKlaviyo({
  publik: 'UV6Rqg',
  segment: [{ id: 'S1', name: 'SEG_samtycke', definition: { condition_groups: [{ conditions: [samtyckeVillkor()] }] } }, { id: 'S2', name: 'SEG_utan', definition: { condition_groups: [{ conditions: [{ type: 'profile-metric', metric_id: 'M_PO', measurement: 'count', measurement_filter: { type: 'numeric', operator: 'greater-than-or-equal', value: 1 }, timeframe_filter: { type: 'date', operator: 'alltime' } }] }] } }],
  kampanjer: [{ id: 'C1', name: 'MAIL_20261001_Sushi_M_1_test_v1', status: 'Draft', send_strategy: { method: 'static', datetime: '2026-10-01T16:00:00Z', options: { is_local: false } }, audiences: { included: ['S1'], excluded: [] }, ...over }],
});
const innehallMed = (namn) => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'kampanjer'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'kampanjer', 'k01-test.json'), JSON.stringify({ id: 'k01-test', namn }));
  return dir;
};

test('schemalagg: argumenten — koder i versaler, --brand byter', () => {
  assert.deepEqual(argsSchemalagg(['k01', 'K02']), { brand: 'baverbutiken', ja: false, koder: ['K01', 'K02'] });
  assert.deepEqual(argsSchemalagg(['--brand', 'matstrumpor', 'k01', '--ja']), { brand: 'matstrumpor', ja: true, koder: ['K01'] });
  assert.throws(() => argsSchemalagg(['--nu']), /Okänt argument/);
  const dir = innehallMed('MAIL_x');
  assert.deepEqual(kampanjNamnFor('K01', dir), { fil: 'k01-test.json', namn: 'MAIL_x' });
  assert.throws(() => kampanjNamnFor('K02', dir), /ingen kampanjfil för K02/);
});

test('schemalagg torrt: planen utan send-job; --ja: ETT send-job för exakt den kampanjen, status tillbakaläst, loggat', async () => {
  const f = kampanjKonto();
  const innehallDir = innehallMed('MAIL_20261001_Sushi_M_1_test_v1');
  const kontoDir = tmp();
  const torr = await schemalagg({ brand: MATSTRUMPOR, koder: ['K01'], nyKlient: nyKlientFor(f), innehallDir, kontoDir, nu: NU });
  assert.equal(torr.ja, false);
  assert.equal(torr.plan[0].kod, 'K01');
  assert.equal(f.tillstand.sendJobs.length, 0);
  const skarp = await schemalagg({ brand: MATSTRUMPOR, koder: ['K01'], ja: true, nyKlient: nyKlientFor(f), innehallDir, kontoDir, nu: NU });
  assert.equal(f.tillstand.sendJobs.length, 1);
  assert.equal(f.tillstand.sendJobs[0].data.id, 'C1');
  assert.equal(skarp.resultat[0].status, 'Scheduled');
  const rad = JSON.parse(fs.readFileSync(path.join(kontoDir, 'schemalagt.jsonl'), 'utf8').trim());
  assert.equal(rad.brand, 'matstrumpor');
  assert.equal(rad.kod, 'K01');
  assert.equal(rad.sands, '2026-10-01T16:00:00.000Z');
});

test('schemalagg stoppar: inte Draft, för nära i tid, segment utan samtycke, fel konto', async () => {
  const kor = (f, over = {}) => schemalagg({ brand: MATSTRUMPOR, koder: ['K01'], ja: true, nyKlient: nyKlientFor(f), innehallDir: innehallMed('MAIL_20261001_Sushi_M_1_test_v1'), kontoDir: tmp(), nu: NU, ...over });
  const skickad = kampanjKonto({ status: 'Sent' });
  await assert.rejects(kor(skickad), /inte Draft/);
  const nara = kampanjKonto({ send_strategy: { method: 'static', datetime: '2026-09-24T12:30:00Z', options: { is_local: false } } });
  await assert.rejects(kor(nara), /minst en timme fram/);
  const utan = kampanjKonto({ audiences: { included: ['S2'], excluded: [] } });
  await assert.rejects(kor(utan), /saknar samtyckesvillkoret/);
  const felKonto = falskKlaviyo({ publik: 'QZ4jLG', kampanjer: [] });
  await assert.rejects(kor(felKonto), (e) => e.kod === 'FEL_KONTO');
  for (const f of [skickad, nara, utan, felKonto]) assert.equal(f.tillstand.sendJobs.length, 0);
});

// ------------------------------------------------------------------ produkter per brand

test('produkter: brandets Shopify-modul får brand.shopify, och reservfilen är bara Bäverbutikens', async () => {
  let fick = null;
  const live = await hamtaProdukterCache({ brand: MATSTRUMPOR, rot: tmp(), hamta: async (o) => { fick = o; return PRODUKTER; } });
  assert.equal(live.kalla, 'live');
  assert.equal(fick.butik, 'matstrumpor');
  assert.equal(reservSokvag(MATSTRUMPOR), null);
  assert.match(reservSokvag(BRAND), /mejl[\\/]produkter\.json$/);
  assert.match(reservSokvag('baverbutiken'), /mejl[\\/]produkter\.json$/);
  const rot = tmp();
  fs.mkdirSync(path.join(rot, 'mejl'));
  fs.writeFileSync(path.join(rot, 'mejl', 'produkter.json'), JSON.stringify(PRODUKTER));
  await assert.rejects(hamtaProdukterCache({ brand: MATSTRUMPOR, rot, offline: true }), /Ingen produktdata för matstrumpor.*ingen reservfil/);
});

// ------------------------------------------------------------------ recensioner per brand

test('recensioner: källan väljs per brand, widgetens HTML blir ren text', () => {
  assert.equal(recensionsKalla(BRAND).kalla, 'judgeme-api');
  assert.deepEqual(recensionsKalla(MATSTRUMPOR), { kalla: 'judgeme-widget', shop_domain: '1r46tp-qx.myshopify.com' });
  assert.equal(recensionsKalla({ id: 'x', recensioner: { kalla: 'ingen' } }).kalla, 'ingen');
  assert.equal(avHtml('<p>Jätte &amp; sköna</p><p>strumpor<br>igen</p>'), 'Jätte & sköna strumpor igen');
  const rader = widgetTillRader({ product_external_id: 1001, reviews: [{ rating: 5, body_html: '<p>Bra</p>', reviewer_name: 'Kent', verified_buyer: true, created_at: '2026-09-25' }] }, 1001);
  assert.deepEqual(rader[0], { product_external_id: 1001, rating: 5, body: 'Bra', reviewer: { name: 'Kent' }, published: true, hidden: false, verified_buyer: true, created_at: '2026-09-25' });
});

test('recensioner: judgeme-widget frågar per produkt, kopplar på Shopify-id, cachar med källan', async () => {
  const rot = tmp();
  const anrop = [];
  const p0 = PRODUKTER[0];
  const fetchFn = async (u) => {
    anrop.push(String(u));
    const id = new URL(u).searchParams.get('product_id');
    const reviews = String(id) === String(p0.id) ? [{ rating: 5, body_html: '<p>Jätte sköna strumpor, bra present</p>', reviewer_name: 'Kent', verified_buyer: true, created_at: '2026-09-25T08:12:30Z' }, { rating: 2, body_html: '<p>Inte alls bra, för små strumpor</p>', reviewer_name: 'Bo' }] : [];
    return { ok: true, json: async () => ({ number_of_reviews: reviews.length, product_external_id: Number(id), reviews }) };
  };
  const live = await hamtaRecensionerCache({ brand: MATSTRUMPOR, produkter: PRODUKTER, rot, env: {}, fetchFn });
  assert.equal(live.kalla, 'live');
  assert.equal(anrop.length, PRODUKTER.length);
  assert.match(anrop[0], /^https:\/\/judge\.me\/reviews\/reviews_for_widget\?/);
  assert.ok(anrop.some((u) => u.includes(`product_id=${p0.id}`) && u.includes('shop_domain=1r46tp-qx.myshopify.com')));
  assert.deepEqual(Object.keys(live.recensioner), [p0.handle]);
  assert.equal(live.recensioner[p0.handle].length, 1);
  assert.equal(live.recensioner[p0.handle][0].namn, 'Kent');
  assert.equal(live.recensioner[p0.handle][0].text, 'Jätte sköna strumpor, bra present');
  const cache = JSON.parse(fs.readFileSync(path.join(rot, 'klaviyo', 'output', 'matstrumpor', 'recensioner.json'), 'utf8'));
  assert.equal(cache.kalla, 'judgeme-widget');
  const off = await hamtaRecensionerCache({ brand: MATSTRUMPOR, produkter: PRODUKTER, rot, offline: true, env: {} });
  assert.equal(off.kalla, 'cache');
  assert.equal(off.recensioner[p0.handle][0].namn, 'Kent');
  const ingen = await hamtaRecensionerCache({ brand: { id: 'x', recensioner: { kalla: 'ingen' } }, produkter: PRODUKTER, rot: tmp(), env: {}, fetchFn });
  assert.equal(ingen.kalla, 'saknas');
});

// ------------------------------------------------------------------ segment per brand

test('segment: kategorierna kommer ur brandfilen, Bäverbutiken är oförändrad', () => {
  const ms = segmentLista(MATSTRUMPOR).map((s) => s.namn);
  for (const k of ['sushi', 'pizza', 'hamburgare', 'donut']) assert.ok(ms.includes(`SEG_kategori_${k}`), k);
  for (const k of Object.keys(KATEGORIER)) assert.ok(!ms.includes(`SEG_kategori_${k}`), k);
  assert.deepEqual(segmentLista(BRAND).map((s) => s.namn), SEGMENT.map((s) => s.namn));
  assert.deepEqual(segmentLista(null).map((s) => s.namn), SEGMENT.map((s) => s.namn));
  const IDS = { placed_order: 'PO', started_checkout: 'SC', viewed_product: 'VP', active_on_site: 'AOS', added_to_cart: 'ATC', ordered_product: 'OP', opened_email: 'OE', clicked_email: 'CE', received_email: 'RE' };
  const sushi = segmentPaNamn('SEG_kategori_sushi', MATSTRUMPOR);
  assert.ok(sushi && sushi.kampanjOk);
  assert.ok(harSamtycke(sushi.bygg(IDS)));
  assert.deepEqual(sushi.bygg(IDS).condition_groups[1].conditions.map((c) => c.metric_filters[0].filter.value), ['sushi', 'Sushi']);
  assert.equal(segmentPaNamn('SEG_kategori_sushi'), null);
  assert.equal(segmentPaNamn('SEG_kategori_husvagn_husbil', MATSTRUMPOR), null);
});

test('ladda-upp: brandets kategorisegment skapas, inte Bäverbutikens, och brandets prenumerantlista återanvänds', async () => {
  const f = falskKlaviyo({ listor: [{ id: 'L_E', name: 'Email List' }] });
  const k = new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async () => {} });
  const brand = { ...BRAND, kategorier: { sushi: ['sushi'] }, lista_nyhetsbrev: 'Email List' };
  const r = await laddaUpp({ brand, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: tmp(), nu: NU });
  assert.equal(r.stopp.length, 0, JSON.stringify(r.stopp));
  const seg = f.tillstand.segment.map((s) => s.attributes.name);
  assert.ok(seg.includes('SEG_kategori_sushi'));
  assert.ok(!seg.includes('SEG_kategori_husvagn_husbil'));
  // Brandets prenumerantlista fanns redan: den skapas inte. (Fixturens välkomstflöde
  // pekar själv på LISTA_nyhetsbrev, och den listan får skapas som förut.)
  const skapadeListor = f.anrop.filter((a) => a.metod === 'POST' && a.sokvag === '/api/lists').map((a) => a.kropp.data.attributes.name);
  assert.deepEqual(skapadeListor, ['LISTA_nyhetsbrev']);
  assert.ok(!r.varningar.some((v) => /Email List är ny och tom/.test(v)));
});

// ------------------------------------------------------------------ sidhuvud, rubrik, dynamiskt pris

test('mallar: Matstrumpors stil ger vitt sidhuvud med linje, fet rubrik i gemener och brandets adress', () => {
  const s = stilFran(STIL_MS);
  assert.equal(s.huvud, '#ffffff');
  // Webbfonten först (Mochiy Pop P One, en enda vikt ⇒ ingen syntetisk fetstil), reservstacken efter.
  assert.match(s.rubrik, /^font-family: 'Mochiy Pop P One','Trebuchet MS'/);
  assert.doesNotMatch(s.rubrik, /font-weight: bold/);
  assert.doesNotMatch(s.rubrik, /uppercase/);
  const { html, text } = byggMejl(KAMPANJ, { brand: MATSTRUMPOR, stil: STIL_MS, erbjudande: null, produkter: PRODUKTER, recensioner: RECENSIONER, lage: 'klaviyo' });
  assert.match(html, /bgcolor="#ffffff" style="padding: 20px 24px 16px; border-bottom: 1px solid #e4dbc9;"/);
  // Loggans adress eskapas i HTML (& → &amp;), så filnamnet räcker som bevis.
  assert.ok(html.includes(STIL_MS.logga_url.split('?')[0]));
  assert.match(html, /kundsupport@matstrumpor\.se/);
  // Sidfotens "varför" är brandfilens (klubben sedan 2026-09-25), inte standardraden.
  assert.match(html, /anmälde dig själv till Matstrumpor-klubben/);
  assert.doesNotMatch(html, /nyhetsbrev från Matstrumpor/);
  // Sidfoten och avsändaren är brandets, inte Bäverbutikens (fixturens produktlänkar är testdata).
  for (const s of [html, text]) {
    assert.doesNotMatch(s, /kundsupport@baverbutiken\.se/);
    assert.doesNotMatch(s, /nyhetsbrev från Bäverbutiken/);
  }
  // Bäverbutiken: exakt som förut — svart sidhuvud, versaler.
  const bb = byggMejl(KAMPANJ, { brand: BRAND, produkter: PRODUKTER, recensioner: RECENSIONER, lage: 'klaviyo' });
  assert.match(bb.html, /bgcolor="#000000" style="padding: 16px 24px;"/);
  assert.match(stilFran({ font_rubrik: 'Impact' }).rubrik, /uppercase/);
});

test('mallar: webbfonten laddas i huvudet och står först på rubrik, brödtext och knapp; finstilt är Arial; utan font_webb som förut', () => {
  const s = stilFran(STIL_MS);
  assert.equal(s.webbfont.namn, 'Mochiy Pop P One');
  assert.match(s.brod, /^font-family: 'Mochiy Pop P One',Arial,Helvetica,sans-serif;$/);
  assert.equal(s.fin, 'font-family: Arial,Helvetica,sans-serif;');
  const { html } = byggMejl(KAMPANJ, { brand: MATSTRUMPOR, stil: STIL_MS, erbjudande: null, produkter: PRODUKTER, recensioner: RECENSIONER, lage: 'klaviyo' });
  assert.ok(html.includes('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mochiy+Pop+P+One&amp;display=swap">'), 'länken i huvudet');
  assert.ok(html.includes("<style>@import url('https://fonts.googleapis.com/css2?family=Mochiy+Pop+P+One&display=swap');</style>"), '@import oeskapad');
  // Knappen bär rubrikstilen, alltså webbfonten.
  assert.match(html, /<a href="[^"]*" target="_blank" style="display: inline-block; font-family: 'Mochiy Pop P One'/);
  // Sidfotens finstilta rader är Arial, inte webbfonten.
  assert.match(html, /<p style="font-family: Arial,Helvetica,sans-serif; font-size: 12px; line-height: 1\.7; color: #6b6b6b; margin: 0;">Du anmälde dig själv/);
  // Utan font_webb: exakt de gamla strängarna (Bäverbutikens mallar ändras inte).
  const utan = stilFran({ ...STIL_MS, font_webb: undefined });
  assert.equal(utan.rubrik, "font-family: 'Trebuchet MS',Verdana,Arial,sans-serif; font-weight: bold;");
  assert.equal(utan.brod, 'font-family: Arial,Helvetica,sans-serif;');
  assert.equal(utan.webbfont, null);
  const bb = byggMejl(KAMPANJ, { brand: BRAND, produkter: PRODUKTER, recensioner: RECENSIONER, lage: 'klaviyo' });
  assert.doesNotMatch(bb.html, /fonts\.googleapis|@import/);
});

test('mallar: medlemskortet och klubbens eyebrow — förnamnet med "Medlem" som reserv, klubbnamnet, mörkt kort med orange ram', () => {
  const brand = { ...MATSTRUMPOR, klubb: { namn: 'Matstrumpor-klubben', eyebrow: 'Bara för medlemmar' } };
  const m = mejl({ block: [{ typ: 'medlemskort', etikett: 'Medlemskort', rad_under_namnet: 'Medlem i Matstrumpor-klubben', fotnot: 'Behöver aldrig visas upp.' }] });
  const { html, text } = byggMejl(m, { brand, stil: STIL_MS, erbjudande: null, produkter: PRODUKTER, recensioner: {}, lage: 'klaviyo' });
  assert.ok(html.includes("{% if first_name %}{{ first_name|default:'' }}{% else %}Medlem{% endif %}"), 'namnet med reserv i Klaviyo-läget');
  assert.match(html, /bgcolor="#121212" style="border-radius: 14px; border: 2px solid #dd821d;"/);
  assert.match(html, /letter-spacing: 3px; text-transform: uppercase; color: #dd821d[^>]*>Medlemskort</);
  assert.match(html, /Medlem i Matstrumpor-klubben/);
  assert.match(html, /Behöver aldrig visas upp\./);
  // Eyebrow under klubbnamnet i sidhuvudet, i versaler.
  assert.match(html, /Matstrumpor-klubben<\/p><p style="font-family: 'Mochiy Pop P One',Arial[^>]*text-transform: uppercase; color: #6b6b6b[^>]*>Bara för medlemmar<\/p>/);
  // Textversionen bär kortet i klartext.
  assert.match(text, /MEDLEMSKORT/);
  assert.match(text, /Medlem i Matstrumpor-klubben/);
  // Exempelläget: förnamnet Anna, inget mallspråk.
  const ex = byggMejl(m, { brand, stil: STIL_MS, erbjudande: null, produkter: PRODUKTER, recensioner: {}, lage: 'exempel' });
  assert.match(ex.html, />Anna<\/p>/);
  assert.doesNotMatch(ex.html, /\{%/);
});

test('mallar: klubben — raden under loggan och sidfotens "varför" följer brandfilen, utan klubb ingen rad', () => {
  const brand = { ...MATSTRUMPOR, klubb: { namn: 'Matstrumpor-klubben' }, sidfot_varfor: 'Du får det här för att du gått med i Matstrumpor-klubben.' };
  const { html } = byggMejl(KAMPANJ, { brand, stil: STIL_MS, erbjudande: null, produkter: PRODUKTER, recensioner: RECENSIONER, lage: 'klaviyo' });
  assert.match(html, /<\/a><p style="font-family: 'Mochiy Pop P One'[^>]*color: #dd821d; margin: 10px 0 0;">Matstrumpor-klubben<\/p>/, 'klubbraden direkt under loggan, i accentfärgen');
  assert.match(html, /Du får det här för att du gått med i Matstrumpor-klubben\./);
  assert.doesNotMatch(html, /nyhetsbrev från Matstrumpor/);
  const { html: utan } = byggMejl(KAMPANJ, { brand: { ...MATSTRUMPOR, klubb: undefined, sidfot_varfor: undefined }, stil: STIL_MS, erbjudande: null, produkter: PRODUKTER, recensioner: RECENSIONER, lage: 'klaviyo' });
  assert.doesNotMatch(utan, /margin: 10px 0 0;">[^<]*klubb/i);
});

test('mallar: Viewed Product-priset skrivs som det kommer (text med kr, mätt i båda kontona), aldrig floatformat', () => {
  const { html, text } = byggMejl(mejl({ block: [{ typ: 'dynamisk', kalla: 'visad_produkt' }] }), { brand: MATSTRUMPOR, stil: STIL_MS, erbjudande: null, produkter: PRODUKTER, recensioner: {}, lage: 'klaviyo' });
  assert.ok(html.includes('{% if event.Price %}'));
  assert.ok(html.includes('{{ event.Price }}</p>'));
  assert.doesNotMatch(html, /floatformat/);
  assert.doesNotMatch(text, /floatformat/);
});

// ------------------------------------------------------------------ kolla --profiler

test('kolla: listornas profilantal och --profiler räknar samtycket', async () => {
  const f = falskKlaviyo({ publik: 'UV6Rqg', listor: [{ id: 'L1', name: 'Email List', profile_count: 2 }], profiler: [{ id: 'P1', consent: 'SUBSCRIBED' }, { id: 'P2', consent: 'UNSUBSCRIBED' }, { id: 'P3' }] });
  const k = new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async () => {} });
  const { lage } = await kolla({ brand: MATSTRUMPOR, klient: k, profiler: true });
  assert.equal(lage.konto.public_api_key, 'UV6Rqg');
  assert.deepEqual(lage.listor[0], { id: 'L1', namn: 'Email List', opt_in: 'single_opt_in', profiler: 2 });
  assert.deepEqual(lage.profiler, { totalt: 3, subscribed: 1, unsubscribed: 1, aldrig: 1 });
  const utan = await kolla({ brand: MATSTRUMPOR, klient: k });
  assert.equal(utan.lage.profiler, undefined);
});
