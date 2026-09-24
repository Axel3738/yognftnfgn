import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KlaviyoKlient } from '../klient.mjs';
import { laddaUpp, laddaInnehall, mallKontroll, rapportText, raknaSenasteDygn, DYGNSTAK } from '../ladda-upp.mjs';
import { SEGMENT } from '../segment.mjs';
import { falskKlaviyo } from './falsk.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));
const BRAND = JSON.parse(fs.readFileSync(path.join(HAR, '..', 'brands', 'baverbutiken.json'), 'utf8'));
const MANIFEST = () => JSON.parse(fs.readFileSync(path.join(HAR, 'fixturer', 'manifest.json'), 'utf8'));
const NU = () => new Date('2026-09-24T12:00:00Z');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'klaviyo-'));

const ny = (o = {}) => {
  const f = falskKlaviyo(o);
  const k = new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async () => {} });
  return { k, f };
};
const inget = (f, re, metod = null) => f.anrop.filter((a) => re.test(a.sokvag) && (!metod || a.metod === metod));

test('torrt utan nyckel: planen byggs, inget anrop, exempelkroppar per sort', async () => {
  const dir = tmp();
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: null, kontoDir: dir, nu: NU });
  assert.equal(r.skarpt, false);
  assert.equal(r.stopp.length, 0, JSON.stringify(r.stopp));
  assert.ok(r.plan.some((p) => /SKAPA segment SEG_uppvarmning_steg1/.test(p)));
  assert.ok(r.plan.some((p) => /SKAPA mall TPL_k01-prov_v1/.test(p)));
  assert.ok(r.plan.some((p) => /SKAPA kampanj MAIL_20261001/.test(p)));
  assert.ok(r.plan.some((p) => /SKAPA flode FLOW_checkout_overgiven_v1/.test(p)));
  assert.ok(r.exempel['POST /api/campaigns']);
  assert.ok(r.exempel['POST /api/flows']);
  assert.equal(fs.existsSync(path.join(dir, 'uppladdat.jsonl')), false);
  assert.match(rapportText(r), /TORRT, inget skrevs/);
  assert.equal(r.ab.length, 1);
  assert.match(r.ab[0], /lägg in som A\/B-test i Klaviyo — A "Ämnesrad A", B "Ämnesrad B", C "Ämnesrad C"/);
});

test('torrt MED nyckel: bara GET mot Klaviyo', async () => {
  const { k, f } = ny();
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, kontoDir: tmp(), nu: NU });
  assert.equal(r.stopp.length, 0, JSON.stringify(r.stopp));
  assert.deepEqual([...new Set(f.anrop.map((a) => a.metod))], ['GET']);
});

test('skarpt: allt skapas i rätt ordning och med specens form', async () => {
  const { k, f } = ny();
  const dir = tmp();
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: dir, nu: NU });
  assert.equal(r.stopp.length, 0, JSON.stringify(r.stopp));
  const skriv = f.anrop.filter((a) => a.metod !== 'GET').map((a) => a.sokvag);
  // Ordning: lista → segment → mallar → kampanj (+ assign) → flöden
  const forsta = (re) => skriv.findIndex((s) => re.test(s));
  assert.ok(forsta(/\/api\/lists/) < forsta(/\/api\/segments/));
  assert.ok(forsta(/\/api\/segments/) < forsta(/\/api\/templates/));
  assert.ok(forsta(/\/api\/templates/) < forsta(/\/api\/campaigns/));
  assert.ok(forsta(/\/api\/campaigns$/) < forsta(/assign-template/));
  assert.ok(forsta(/assign-template/) < forsta(/\/api\/flows/));
  assert.equal(f.tillstand.segment.length, SEGMENT.length);
  assert.equal(f.tillstand.mallar.length, 3);
  assert.equal(f.tillstand.mallar[0].attributes.editor_type, 'CODE');
  assert.equal(f.tillstand.floden.length, 2);

  // Kampanjen
  const kamp = f.anrop.find((a) => a.sokvag === '/api/campaigns' && a.metod === 'POST').kropp.data.attributes;
  assert.deepEqual(kamp.send_strategy, { method: 'static', datetime: '2026-10-01T18:00:00+02:00', options: { is_local: false } });
  assert.deepEqual(kamp.send_options, { use_smart_sending: true });
  assert.equal(kamp.tracking_options.add_tracking_params, true);
  assert.deepEqual(kamp.tracking_options.custom_tracking_params, [{ type: 'static', name: 'utm_source', value: 'klaviyo' }, { type: 'static', name: 'utm_medium', value: 'email' }]);
  const upp = f.tillstand.segment.find((s) => s.attributes.name === 'SEG_uppvarmning_steg1').id;
  const oeng = f.tillstand.segment.find((s) => s.attributes.name === 'SEG_oengagerade_180d').id;
  assert.deepEqual(kamp.audiences, { included: [upp], excluded: [oeng] });
  const inn = kamp['campaign-messages'].data[0].attributes.definition.content;
  assert.equal(inn.subject, 'Ämnesrad A');
  assert.equal(inn.preview_text, 'Förhandstext');
  assert.equal(inn.from_email, 'kundsupport@baverbutiken.se');
  assert.equal(inn.reply_to_email, 'kundsupport@baverbutiken.se');
  const msgId = Object.keys(f.tillstand.meddelanden)[0];
  assert.equal(f.tillstand.meddelanden[msgId].mall, f.tillstand.mallar.find((t) => t.attributes.name === 'TPL_k01-prov_v1').id);
  assert.equal(f.tillstand.kampanjer[0].attributes.status, 'Draft');

  // Flödet
  const flode = f.tillstand.floden.find((x) => x.attributes.name === 'FLOW_checkout_overgiven_v1').attributes.definition;
  assert.deepEqual(flode.triggers, [{ type: 'metric', id: 'M_SC' }]);
  assert.deepEqual(flode.reentry_criteria, { duration: 7, unit: 'day' });
  assert.equal(flode.entry_action_id, 'a1');
  assert.deepEqual(flode.actions.map((x) => [x.temporary_id, x.type, x.links.next]), [['a1', 'time-delay', 'a2'], ['a2', 'send-email', 'a3'], ['a3', 'time-delay', 'a4'], ['a4', 'send-email', null]]);
  assert.deepEqual(flode.actions[0].data, { unit: 'hours', value: 1 });
  const mejl = flode.actions[1].data;
  assert.equal(mejl.status, 'draft');
  assert.equal(mejl.message.subject_line, 'Du glömde något');
  assert.equal(mejl.message.smart_sending_enabled, true);
  assert.equal(mejl.message.transactional, false);
  assert.equal(mejl.message.add_tracking_params, true);
  assert.equal(mejl.message.template_id, f.tillstand.mallar.find((t) => t.attributes.name === 'TPL_f02-steg1_v1').id);
  assert.equal(flode.profile_filter.condition_groups[0].conditions[0].type, 'profile-marketing-consent');
  const valkomst = f.tillstand.floden.find((x) => x.attributes.name === 'FLOW_valkomst_v1').attributes.definition;
  assert.deepEqual(valkomst.triggers, [{ type: 'list', id: f.tillstand.listor.find((l) => l.attributes.name === 'LISTA_nyhetsbrev').id }]);
  assert.equal(valkomst.reentry_criteria, undefined);

  // Minnet
  const minne = fs.readFileSync(path.join(dir, 'uppladdat.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  assert.ok(minne.some((m) => m.typ === 'flode' && m.namn === 'FLOW_valkomst_v1' && m.id));
  assert.ok(JSON.parse(fs.readFileSync(path.join(dir, 'lage.json'), 'utf8')).senaste_uppladdning);
});

test('aldrig ett utskick: inga send-jobs, inget live, ingen PATCH på flöden', async () => {
  const { k, f } = ny();
  await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: tmp(), nu: NU });
  assert.equal(inget(f, /campaign-send-jobs/).length, 0);
  assert.equal(f.tillstand.sendJobs.length, 0);
  assert.equal(inget(f, /^\/api\/flows\//, 'PATCH').length, 0);
  assert.equal(inget(f, /^\/api\/flow-actions/).length, 0);
  const text = JSON.stringify(f.anrop.map((a) => a.kropp));
  assert.doesNotMatch(text, /"status":"live"/);
});

test('idempotens: andra körningen skapar ingenting', async () => {
  const { k, f } = ny();
  const dir = tmp();
  await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: dir, nu: NU });
  const fore = f.anrop.filter((a) => a.metod !== 'GET').length;
  const r2 = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: dir, nu: NU });
  assert.equal(f.anrop.filter((a) => a.metod !== 'GET').length, fore);
  assert.equal(r2.skapade.length, 0);
  assert.ok(r2.hoppade.length >= SEGMENT.length + 3 + 1 + 2);
  assert.equal(f.tillstand.kampanjer.length, 1);
  assert.equal(f.tillstand.floden.length, 2);
});

test('--uppdatera: patchar mall och Draft-kampanj, rör inte en skickad kampanj', async () => {
  const { k, f } = ny();
  const dir = tmp();
  await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: dir, nu: NU });
  const m = MANIFEST();
  m.mejl[0].html = m.mejl[0].html.replace('Hej', 'Hej igen');
  const r = await laddaUpp({ brand: BRAND, manifest: m, klient: k, skarpt: true, uppdatera: true, kontoDir: dir, nu: NU });
  assert.ok(f.tillstand.mallar.find((t) => t.attributes.name === 'TPL_k01-prov_v1').attributes.html.includes('Hej igen'));
  assert.ok(inget(f, /^\/api\/campaigns\/C/, 'PATCH').length === 1);
  assert.ok(r.uppdaterade.some((u) => u.typ === 'kampanj'));
  // Skickad kampanj
  f.tillstand.kampanjer[0].attributes.status = 'Sent';
  const r3 = await laddaUpp({ brand: BRAND, manifest: m, klient: k, skarpt: true, uppdatera: true, bara: 'kampanjer', kontoDir: dir, nu: NU });
  assert.ok(r3.hoppade.some((h) => /inte Draft — rörs aldrig/.test(h.orsak)));
  assert.equal(inget(f, /^\/api\/campaigns\/C/, 'PATCH').length, 1);
});

test('samtyckesspärren: kampanj till segment utan samtycke stoppas', async () => {
  const utan = { condition_groups: [{ conditions: [{ type: 'profile-metric', metric_id: 'M_PO', measurement: 'count', measurement_filter: { type: 'numeric', operator: 'greater-than-or-equal', value: 1 }, timeframe_filter: { type: 'date', operator: 'alltime' } }] }] };
  const { k, f } = ny({ segment: [{ id: 'SX', name: 'SEG_handgjort', definition: utan }] });
  const m = MANIFEST();
  m.kampanjer[0].segment = ['SEG_handgjort'];
  const r = await laddaUpp({ brand: BRAND, manifest: m, klient: k, skarpt: true, kontoDir: tmp(), nu: NU });
  assert.ok(r.stopp.some((s) => s.typ === 'kampanj' && s.kod === 'SAMTYCKE_SAKNAS'));
  assert.equal(inget(f, /^\/api\/campaigns$/, 'POST').length, 0);
});

test('samtyckesspärren: exkluderingssegment och listor är aldrig kampanjpublik', async () => {
  for (const publik of ['SEG_oengagerade_180d', 'LISTA_nyhetsbrev']) {
    const m = MANIFEST();
    m.kampanjer[0].segment = [publik];
    const r = await laddaUpp({ brand: BRAND, manifest: m, klient: null, kontoDir: tmp(), nu: NU });
    assert.ok(r.stopp.some((s) => s.typ === 'kampanj'), publik);
  }
});

test('flöde utan samtycke i filtret stoppas', async () => {
  const m = MANIFEST();
  m.floden[0].filter = ['ej_kopt_sedan_start'];
  const r = await laddaUpp({ brand: BRAND, manifest: m, klient: null, kontoDir: tmp(), nu: NU });
  assert.ok(r.stopp.some((s) => s.typ === 'flode' && s.kod === 'SAMTYCKE_SAKNAS'));
});

test('fel public_api_key stoppar allt innan något skrivs', async () => {
  const { k, f } = ny({ publik: 'XXXXXX' });
  await assert.rejects(laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: tmp(), nu: NU }), (e) => e.kod === 'FEL_KONTO');
  assert.equal(f.anrop.filter((a) => a.metod !== 'GET').length, 0);
});

test('manifest för en annan butik vägras', async () => {
  const m = MANIFEST();
  m.brand = 'carashell';
  await assert.rejects(laddaUpp({ brand: BRAND, manifest: m, klient: null, kontoDir: tmp(), nu: NU }), /blandas aldrig/);
});

test('mall utan avregistrering stoppas, och kampanjen som använder den också', async () => {
  assert.deepEqual(mallKontroll('<p>{% unsubscribe %}</p>{{ organization.full_address }}'), []);
  assert.equal(mallKontroll('<p>hej</p>').length, 2);
  const m = MANIFEST();
  m.mejl[0].html = '<p>ingen avregistrering</p>';
  const { k, f } = ny();
  const r = await laddaUpp({ brand: BRAND, manifest: m, klient: k, skarpt: true, kontoDir: tmp(), nu: NU });
  assert.ok(r.stopp.some((s) => s.typ === 'mall' && s.kod === 'MALL_UTAN_AVREGISTRERING'));
  assert.ok(r.stopp.some((s) => s.typ === 'kampanj'));
  assert.equal(f.tillstand.kampanjer.length, 0);
});

test('dygnstaket: 100 segment senaste dygnet ⇒ inga fler segment', async () => {
  const dir = tmp();
  const rader = Array.from({ length: DYGNSTAK.segment }, (_, i) => JSON.stringify({ tid: '2026-09-24T08:00:00Z', typ: 'segment', namn: `x${i}`, id: `i${i}`, atgard: 'skapad' }));
  fs.writeFileSync(path.join(dir, 'uppladdat.jsonl'), rader.join('\n') + '\n');
  assert.equal(raknaSenasteDygn(rader.map((r) => JSON.parse(r)), 'segment', NU()), 100);
  const { k, f } = ny();
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, bara: 'segment', kontoDir: dir, nu: NU });
  assert.equal(inget(f, /^\/api\/segments$/, 'POST').length, 0);
  assert.ok(r.stopp.every((s) => s.kod === 'DYGNSTAK'));
  // Rader äldre än ett dygn räknas inte
  assert.equal(raknaSenasteDygn([{ tid: '2026-09-22T08:00:00Z', typ: 'segment', atgard: 'skapad' }], 'segment', NU()), 0);
});

test('--bara kampanjer utan uppladdade segment: stopp med orsak i skarpt läge', async () => {
  const { k } = ny();
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, bara: 'kampanjer', kontoDir: tmp(), nu: NU });
  assert.ok(r.stopp.some((s) => s.kod === 'SEGMENT_SAKNAS' || s.kod === 'MALL_SAKNAS'));
});

test('saknad Shopify-metrik: segmentet hoppas med orsak, flödet stoppas', async () => {
  const { k } = ny({ metriker: [['M_OE', 'Opened Email'], ['M_CE', 'Clicked Email'], ['M_RE', 'Received Email']] });
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: tmp(), nu: NU });
  assert.ok(r.hoppade.some((h) => h.namn === 'SEG_kopare' && /Placed Order/.test(h.orsak)));
  assert.ok(r.stopp.some((s) => s.namn === 'FLOW_checkout_overgiven_v1' && s.kod === 'METRIK_SAKNAS'));
});

test('byggarens manifest: html och text som filnamn läses in bredvid manifestet', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'a.html'), '<p>{% unsubscribe %}</p>{{ organization.full_address }}');
  fs.writeFileSync(path.join(dir, 'a.txt'), 'text');
  const m = laddaInnehall({ mejl: [{ id: 'a', html: 'a.html', text: 'a.txt' }, { id: 'b', html: '<p>redan html</p>', text: null }] }, dir);
  assert.match(m.mejl[0].html, /unsubscribe/);
  assert.equal(m.mejl[0].text, 'text');
  assert.equal(m.mejl[1].html, '<p>redan html</p>');
  assert.throws(() => laddaInnehall({ mejl: [{ id: 'c', html: 'saknas.html' }] }, dir), /finns inte/);
});

test('återinträde "alltime" utan varaktighet: duration 0, unit alltime', async () => {
  const m = MANIFEST();
  m.floden[1].ateintrade = { varaktighet: null, enhet: 'alltime' };
  const r = await laddaUpp({ brand: BRAND, manifest: m, klient: null, kontoDir: tmp(), nu: NU });
  const def = r.exempel['POST /api/flows'] && Object.values(r.exempel).length;
  assert.ok(def);
  const { k, f } = ny();
  await laddaUpp({ brand: BRAND, manifest: m, klient: k, skarpt: true, kontoDir: tmp(), nu: NU });
  const v = f.tillstand.floden.find((x) => x.attributes.name === 'FLOW_valkomst_v1').attributes.definition;
  assert.deepEqual(v.reentry_criteria, { duration: 0, unit: 'alltime' });
});
