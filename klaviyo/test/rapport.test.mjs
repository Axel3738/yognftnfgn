import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { KlaviyoKlient } from '../klient.mjs';
import { dom, doma, median, rapport, rapportKropp, tabell, tidsram, GRIND, STATISTIK } from '../rapport.mjs';
import { falskKlaviyo } from './falsk.mjs';

const BRAND = { id: 'baverbutiken', namn: 'Bäverbutiken', public_id: 'QZ4jLG', nyckel_env: ['KLAVIYO_API_KEY_BAVERBUTIKEN'] };
const NU = () => new Date('2026-09-24T12:00:00Z');

const rad = (o) => ({ typ: 'kampanj', delivered: 1000, conversions: 5, conversion_value: 3000, revenue_per_recipient: 3, unsubscribe_rate: 0.002, spam_complaint_rate: 0.0001, open_rate: 0.9, ...o });

test('grinden: under 3 konverteringar eller 500 levererade är för tidigt', () => {
  assert.equal(GRIND.minLevererade, 500);
  assert.equal(dom(rad({ conversions: 2 }), { breakEvenRoas: 1.6, benchmark: 1 }).dom, 'FOR_TIDIGT');
  assert.equal(dom(rad({ delivered: 499 }), { breakEvenRoas: 1.6, benchmark: 1 }).dom, 'FOR_TIDIGT');
});

test('leveranslarm går före grinden', () => {
  assert.equal(dom(rad({ spam_complaint_rate: 0.004, conversions: 0 })).dom, 'LARM_LEVERANS');
  const d = dom(rad({ unsubscribe_rate: 0.02 }));
  assert.equal(d.dom, 'LARM_LEVERANS');
  assert.match(d.orsak, /avregistreringar 2\.00 %/);
  assert.equal(dom(rad({ spam_complaint_rate: 0.003 }), { benchmark: 1 }).dom, 'VINNARE'); // exakt på gränsen är inte över
});

test('vinstbidrag = intäkt / break-even; okänt utan break-even', () => {
  assert.equal(dom(rad(), { breakEvenRoas: 1.5, benchmark: 1 }).vinstbidrag, 2000);
  const d = dom(rad(), { benchmark: 1 });
  assert.equal(d.vinstbidrag, null);
  assert.equal(d.vinstbidrag_text, 'okänt, break-even saknas');
});

test('etikett mot medianen av samma typ; öppningsgraden avgör aldrig', () => {
  assert.equal(dom(rad({ revenue_per_recipient: 3 }), { benchmark: 2 }).dom, 'VINNARE');
  assert.equal(dom(rad({ revenue_per_recipient: 1, open_rate: 0.99 }), { benchmark: 2 }).dom, 'FORLORARE');
  assert.equal(dom(rad(), {}).dom, 'BEDOMBAR');
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(median([]), null);
  const d = doma([rad({ revenue_per_recipient: 1 }), rad({ revenue_per_recipient: 5 }), rad({ typ: 'flode', revenue_per_recipient: 0.5 }), rad({ revenue_per_recipient: 9, conversions: 1 })]);
  assert.equal(d[0].benchmark, 5); // medianen av de ANDRA kampanjerna som passerat grinden
  assert.deepEqual(d.map((x) => x.dom.dom), ['FORLORARE', 'VINNARE', 'BEDOMBAR', 'FOR_TIDIGT']);
});

test('rapportkroppen: specens fält, group_by, Placed Order som konvertering', () => {
  const k = rapportKropp('kampanj', { dagar: 30, metrikId: 'M_PO', nu: NU() }).data;
  assert.equal(k.type, 'campaign-values-report');
  assert.deepEqual(k.attributes.timeframe, { key: 'last_30_days' });
  assert.equal(k.attributes.conversion_metric_id, 'M_PO');
  assert.deepEqual(k.attributes.statistics, STATISTIK);
  assert.ok(k.attributes.group_by.includes('campaign_id'));
  const f = rapportKropp('flode', { dagar: 14, metrikId: 'M_PO', nu: NU() }).data;
  assert.equal(f.type, 'flow-values-report');
  assert.ok(f.attributes.group_by.includes('flow_message_id'));
  assert.deepEqual(tidsram(14, NU()), { start: '2026-09-10T12:00:00.000Z', end: '2026-09-24T12:00:00.000Z' });
});

test('rapport: två anrop totalt, utfall.jsonl skrivs, tabellen på svenska', async () => {
  const f = falskKlaviyo({
    kampanjer: [{ id: 'C1', name: 'MAIL_20261001_prov' }],
    floden: [{ id: 'F1', name: 'FLOW_checkout_overgiven_v1' }],
    rapport: {
      kampanj: [{ groupings: { campaign_id: 'C1', campaign_message_id: 'MSG1', send_channel: 'email' }, statistics: { recipients: 1200, delivered: 1180, conversions: 6, conversion_value: 4200, revenue_per_recipient: 3.5, unsubscribe_rate: 0.004, spam_complaint_rate: 0.0002, open_rate: 0.5, click_rate: 0.02 } }],
      flode: [{ groupings: { flow_id: 'F1', flow_name: 'FLOW_checkout_overgiven_v1', flow_message_id: 'FM1', flow_message_name: 'mejl 1', send_channel: 'email' }, statistics: { recipients: 90, delivered: 88, conversions: 4, conversion_value: 2000, revenue_per_recipient: 22, unsubscribe_rate: 0, spam_complaint_rate: 0 } }],
    },
  });
  const k = new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async () => {} });
  const loggDir = fs.mkdtempSync(path.join(os.tmpdir(), 'klaviyo-rapport-'));
  const rader = await rapport({ brand: BRAND, klient: k, dagar: 30, breakEvenRoas: 1.6, loggDir, nu: NU });
  assert.equal(f.anrop.filter((a) => /values-reports/.test(a.sokvag)).length, 2);
  assert.equal(rader.length, 2);
  assert.equal(rader[0].namn, 'MAIL_20261001_prov');
  assert.equal(rader[0].dom.dom, 'BEDOMBAR');
  assert.equal(rader[0].dom.vinstbidrag, 2625);
  assert.equal(rader[1].dom.dom, 'FOR_TIDIGT');
  const utfall = fs.readFileSync(path.join(loggDir, 'utfall.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(utfall.length, 2);
  assert.equal(utfall[0].hamtad, '2026-09-24T12:00:00.000Z');
  assert.equal(utfall[0].period.dagar, 30);
  const t = tabell(rader);
  assert.match(t, /Kampanj/);
  assert.match(t, /Flöde/);
  assert.match(t, /2625 kr/);
});

test('rapport: fel konto stoppar innan någon rapport hämtas', async () => {
  const f = falskKlaviyo({ publik: 'ANNAT1' });
  const k = new KlaviyoKlient({ nyckel: 'pk_test', fetchFn: f.fetchFn, paus: 0, sov: async () => {} });
  await assert.rejects(rapport({ brand: BRAND, klient: k, loggDir: fs.mkdtempSync(path.join(os.tmpdir(), 'k-')), nu: NU }), (e) => e.kod === 'FEL_KONTO');
  assert.equal(f.anrop.filter((a) => /values-reports/.test(a.sokvag)).length, 0);
});
