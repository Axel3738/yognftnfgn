import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KlaviyoKlient } from '../klient.mjs';
import { laddaUpp, laddaInnehall, mallKontroll, rapportText, raknaSenasteDygn, DYGNSTAK, aterintrade, planeradTid, produktTriggerFilter, ORDER_PRODUKTFALT } from '../ladda-upp.mjs';
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
  // Samma ögonblick som kampanjfilens 18:00 svensk tid, skickat i UTC.
  assert.deepEqual(kamp.send_strategy, { method: 'static', datetime: '2026-10-01T16:00:00.000Z', options: { is_local: false } });
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

test('återinträde "alltime": duration 1 (aldrig igen) — 0 betyder "får gå in igen" i specen', async () => {
  const m = MANIFEST();
  m.floden[1].ateintrade = { varaktighet: null, enhet: 'alltime' };
  const { k, f } = ny();
  await laddaUpp({ brand: BRAND, manifest: m, klient: k, skarpt: true, kontoDir: tmp(), nu: NU });
  const v = f.tillstand.floden.find((x) => x.attributes.name === 'FLOW_valkomst_v1').attributes.definition;
  assert.deepEqual(v.reentry_criteria, { duration: 1, unit: 'alltime' });
  assert.deepEqual(aterintrade({ namn: 'x', ateintrade: { varaktighet: 7, enhet: 'dagar' } }), { duration: 7, unit: 'day' });
  assert.throws(() => aterintrade({ namn: 'x', ateintrade: { varaktighet: null, enhet: 'day' } }), /heltal/);
  assert.throws(() => aterintrade({ namn: 'x', ateintrade: { varaktighet: 3, enhet: 'month' } }), /okänd enhet/);
});

test('planerad tid som passerat: kampanjen skapas inte, mallen laddas upp, orsaken står i klartext', async () => {
  const { k, f } = ny();
  const sent = () => new Date('2026-10-02T12:00:00Z'); // efter kampanjens 1 oktober
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: tmp(), nu: sent });
  const s = r.stopp.find((x) => x.typ === 'kampanj');
  assert.equal(s?.kod, 'PLANERAD_PASSERAD');
  assert.match(s.orsak, /TPL_k01-prov_v1/);
  assert.equal(inget(f, /^\/api\/campaigns$/, 'POST').length, 0);
  assert.ok(f.tillstand.mallar.some((t) => t.attributes.name === 'TPL_k01-prov_v1'));
  // Under marginalen räknas som passerat; saknad tid och skräp stoppas också.
  assert.throws(() => planeradTid({ planerad: '2026-10-01T18:30:00+02:00' }, new Date('2026-10-01T16:00:00Z')), (e) => e.kod === 'PLANERAD_PASSERAD');
  assert.throws(() => planeradTid({}, NU()), (e) => e.kod === 'PLANERAD_SAKNAS');
  assert.throws(() => planeradTid({ planerad: 'nästa tisdag' }, NU()), (e) => e.kod === 'PLANERAD_OGILTIG');
  assert.equal(planeradTid({ planerad: '2026-10-01T18:00:00+02:00' }, NU()), '2026-10-01T16:00:00.000Z');
});

test('avbruten körning: kampanjen skapad men mallen aldrig kopplad ⇒ nästa körning kopplar den, ingen dubblett', async () => {
  const { k, f } = ny();
  const dir = tmp();
  // Första körningen dör efter att kampanjen skapats: assign-template svarar nätfel.
  const riktig = f.fetchFn;
  let dod = true;
  const k1 = new KlaviyoKlient({ nyckel: 'pk_test', paus: 0, sov: async () => {}, fetchFn: async (url, o) => {
    if (dod && url.includes('assign-template')) throw new Error('ECONNRESET');
    return riktig(url, o);
  } });
  const r1 = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k1, skarpt: true, kontoDir: dir, nu: NU });
  assert.ok(r1.stopp.some((s) => s.typ === 'kampanj'));
  assert.equal(f.tillstand.kampanjer.length, 1);
  assert.equal(f.tillstand.meddelanden[`MSG_${f.tillstand.kampanjer[0].id}`].mall, null);
  dod = false;
  const r2 = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: dir, nu: NU });
  assert.equal(r2.stopp.length, 0, JSON.stringify(r2.stopp));
  assert.equal(f.tillstand.kampanjer.length, 1);
  assert.ok(f.tillstand.meddelanden[`MSG_${f.tillstand.kampanjer[0].id}`].mall);
  // Tredje körningen: allt på plats, inget skrivs.
  const fore = f.anrop.filter((a) => a.metod !== 'GET').length;
  await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: dir, nu: NU });
  assert.equal(f.anrop.filter((a) => a.metod !== 'GET').length, fore);
});

test('samtycke: ett befintligt segment med BIBLIOTEKETS namn men utan samtycke i Klaviyo stoppas', async () => {
  const utan = { condition_groups: [{ conditions: [{ type: 'profile-metric', metric_id: 'M_OE', measurement: 'count', measurement_filter: { type: 'numeric', operator: 'greater-than-or-equal', value: 1 }, timeframe_filter: { type: 'date', operator: 'alltime' } }] }] };
  const { k, f } = ny({ segment: [{ id: 'SX', name: 'SEG_uppvarmning_steg1', definition: utan }] });
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: tmp(), nu: NU });
  assert.ok(r.stopp.some((s) => s.typ === 'kampanj' && s.kod === 'SAMTYCKE_SAKNAS'), JSON.stringify(r.stopp));
  assert.equal(inget(f, /^\/api\/campaigns$/, 'POST').length, 0);
  // Och objektet som motorn inte skapat syns som varning.
  assert.ok(r.varningar.some((v) => /SEG_uppvarmning_steg1.*skapades inte av motorn/.test(v)));
});

test('två kassametriker i kontot ⇒ varning om vilken som väljs', async () => {
  const { k } = ny({ metriker: [['M_PO', 'Placed Order'], ['M_SC', 'Started Checkout'], ['M_CS', 'Checkout Started'], ['M_VP', 'Viewed Product'], ['M_AOS', 'Active on Site'], ['M_OP', 'Ordered Product'], ['M_OE', 'Opened Email'], ['M_CE', 'Clicked Email'], ['M_RE', 'Received Email']] });
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, kontoDir: tmp(), nu: NU });
  assert.ok(r.varningar.some((v) => /started_checkout.*"Started Checkout", "Checkout Started"/.test(v)));
});

test('produkt_innehaller: trigger_filter med metric-property på hela produkttitlar (listfiltret matchar hela element)', async () => {
  const produkter = [
    { titel: 'Marin Motorhölje 420D – Universellt Skydd' },
    { titel: 'Motorhölje för Utombordare – Tåligt Skydd' },
    { titel: 'Båtmotorskydd 420D – Heltäckande för Utombordare' },
  ];
  const pf = produktTriggerFilter({ metricId: 'M_PO', ord: ['Marin Motorhölje'], produkter });
  assert.deepEqual(pf.trigger_filter, { condition_groups: [{ conditions: [{ type: 'metric-property', metric_id: 'M_PO', field: ORDER_PRODUKTFALT, filter: { type: 'list', operator: 'contains', value: 'Marin Motorhölje 420D – Universellt Skydd' } }] }] });
  assert.equal(pf.varningar.length, 0);
  // Utan produktdata: orden som de står, med varning.
  const utan = produktTriggerFilter({ metricId: 'M_PO', ord: ['Marin Motorhölje'] });
  assert.equal(utan.trigger_filter.condition_groups[0].conditions[0].filter.value, 'Marin Motorhölje');
  assert.match(utan.varningar[0], /HELA produkttitlar/);
  assert.throws(() => produktTriggerFilter({ metricId: 'M_PO', ord: ['Finns inte'], produkter }), (e) => e.kod === 'PRODUKT_OKAND');

  // Hela vägen genom uppladdaren, skarpt mot den falska Klaviyo.
  const m = MANIFEST();
  m.floden[0].trigger = { typ: 'metrik', metrik: ['Placed Order'], produkt_innehaller: ['Marin Motorhölje'] };
  const { k, f } = ny();
  const r = await laddaUpp({ brand: BRAND, manifest: m, klient: k, skarpt: true, kontoDir: tmp(), nu: NU, produkter });
  assert.equal(r.stopp.length, 0, JSON.stringify(r.stopp));
  const def = f.tillstand.floden.find((x) => x.attributes.name === 'FLOW_checkout_overgiven_v1').attributes.definition;
  assert.equal(def.triggers[0].type, 'metric');
  assert.equal(def.triggers[0].id, 'M_PO');
  assert.equal(def.triggers[0].trigger_filter.condition_groups[0].conditions[0].value, undefined);
  assert.equal(def.triggers[0].trigger_filter.condition_groups[0].conditions[0].filter.value, 'Marin Motorhölje 420D – Universellt Skydd');
  assert.ok(r.varningar.some((v) => /obekräftat.*kolla\.mjs --prov/.test(v)));
  // Produktfilter på en listtrigger är fel.
  const m2 = MANIFEST();
  m2.floden[1].trigger = { typ: 'lista', lista: 'LISTA_nyhetsbrev', produkt_innehaller: ['x'] };
  const r2 = await laddaUpp({ brand: BRAND, manifest: m2, klient: null, kontoDir: tmp(), nu: NU });
  assert.ok(r2.stopp.some((x) => x.kod === 'TRIGGER_OKAND'));
});

test('segment som inte kan byggas (metrik saknas): kampanjens stopp säger vilken metrik', async () => {
  const { k } = ny({ metriker: [['M_PO', 'Placed Order'], ['M_SC', 'Started Checkout'], ['M_VP', 'Viewed Product'], ['M_OP', 'Ordered Product'], ['M_OE', 'Opened Email'], ['M_CE', 'Clicked Email'], ['M_RE', 'Received Email']] });
  const r = await laddaUpp({ brand: BRAND, manifest: MANIFEST(), klient: k, skarpt: true, kontoDir: tmp(), nu: NU });
  const s = r.stopp.find((x) => x.typ === 'kampanj');
  assert.equal(s?.kod, 'METRIK_SAKNAS');
  assert.match(s.orsak, /active_on_site/);
  // Listan skapades ny ⇒ påminnelse om Shopify-synken.
  assert.ok(r.varningar.some((v) => /LISTA_nyhetsbrev är ny och tom/.test(v)));
});
