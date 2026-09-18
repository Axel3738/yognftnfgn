// Ren logik utan nät: statusmappning, svenska meddelanden, tolkning av
// 17TRACK-svar och planen för vad som skrivs in i Shopify.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bolagskod, STATUS, meddelande, tolka, planera } from '../status.mjs';

test('bolagskod: YunExpress, 4PX och PostNord känns igen oavsett stavning', () => {
  assert.equal(bolagskod('YunExpress'), 190008);
  assert.equal(bolagskod('Yun Express'), 190008);
  assert.equal(bolagskod('4PX'), 190094);
  assert.equal(bolagskod('PostNord Sverige'), 19241);
  assert.equal(bolagskod('Okänt bolag'), null);
  assert.equal(bolagskod(null), null);
});

test('varje 17TRACK-status har en avsiktlig mappning', () => {
  assert.equal(STATUS.Delivered, 'DELIVERED');
  assert.equal(STATUS.OutForDelivery, 'OUT_FOR_DELIVERY');
  assert.equal(STATUS.InTransit, 'IN_TRANSIT');
  assert.equal(STATUS.NotFound, null, 'NotFound ska inte ge något event');
  assert.equal(STATUS.Expired, null);
});

test('meddelandena är svenska, korta och bär platsen när den finns', () => {
  assert.equal(meddelande('IN_TRANSIT', 'Shenzhen'), 'Paketet är på väg (Shenzhen).');
  assert.equal(meddelande('IN_TRANSIT', null), 'Paketet är på väg.');
  assert.equal(meddelande('DELIVERED', 'Varberg'), 'Paketet är levererat (Varberg).');
  assert.match(meddelande('FAILURE'), /kundsupport@baverbutiken\.se/);
  assert.equal(meddelande('OKAND'), '');
  for (const s of ['CONFIRMED', 'IN_TRANSIT', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'ATTEMPTED_DELIVERY', 'DELIVERED', 'FAILURE']) {
    assert.ok(meddelande(s).length > 10 && meddelande(s).length < 120, s);
    assert.ok(!/sorry|ursäkt/i.test(meddelande(s)), `${s}: inga ursäkter`);
  }
});

const SVAR = {
  number: 'YT2626100708674690',
  carrier: 190008,
  track_info: {
    latest_status: { status: 'InTransit', sub_status: 'InTransit_Other' },
    latest_event: { time_iso: '2026-09-10T08:15:00+08:00', description: 'Departed from facility', location: 'Shenzhen, CN' },
    tracking: { providers: [{ events: [{ time_iso: '2026-09-09T01:00:00+08:00', description: 'Info received' }, { time_iso: '2026-09-10T08:15:00+08:00', description: 'Departed from facility' }] }] },
  },
};

test('tolka läser status, tid, plats och antal händelser ur ett 17TRACK-svar', () => {
  const t = tolka(SVAR);
  assert.equal(t.nummer, 'YT2626100708674690');
  assert.equal(t.status17, 'InTransit');
  assert.equal(t.status, 'IN_TRANSIT');
  assert.equal(t.tid, '2026-09-10T08:15:00+08:00');
  assert.equal(t.plats, 'Shenzhen, CN');
  assert.equal(t.antalHandelser, 2);
});

test('tolka kastar aldrig på tomma eller trasiga svar', () => {
  assert.deepEqual(tolka({}).status, null);
  assert.equal(tolka(null).status17, null);
  assert.equal(tolka({ number: 'X', track_info: { latest_status: { status: 'NotFound' } } }).status, null);
});

test('planera: skriver framåt i kedjan, aldrig bakåt, aldrig dubbelt', () => {
  const t = tolka(SVAR);
  const plan = planera(t, [], null);
  assert.equal(plan.status, 'IN_TRANSIT');
  assert.equal(plan.happenedAt, '2026-09-10T08:15:00+08:00');
  assert.equal(plan.message, 'Paketet är på väg (Shenzhen, CN).');
  // Samma status redan i Shopify ⇒ inget.
  assert.equal(planera(t, ['IN_TRANSIT'], null), null);
  // Senast skrivna är IN_TRANSIT ⇒ inget nytt IN_TRANSIT.
  assert.equal(planera(t, [], 'IN_TRANSIT'), null);
  // En försenad InTransit efter Delivered ⇒ inget (tidslinjen ska inte gå bakåt).
  assert.equal(planera(t, ['DELIVERED'], 'DELIVERED'), null);
  // Delivered efter IN_TRANSIT ⇒ skrivs.
  const lev = tolka({ ...SVAR, track_info: { ...SVAR.track_info, latest_status: { status: 'Delivered' }, latest_event: { time_iso: '2026-09-15T11:00:00+02:00', location: 'Varberg' } } });
  assert.equal(planera(lev, ['IN_TRANSIT'], 'IN_TRANSIT').status, 'DELIVERED');
  // Avvikelser skrivs alltid, även efter senare steg.
  const miss = tolka({ ...SVAR, track_info: { ...SVAR.track_info, latest_status: { status: 'DeliveryFailure' }, latest_event: { time_iso: '2026-09-14T09:00:00+02:00' } } });
  assert.equal(planera(miss, ['OUT_FOR_DELIVERY'], 'OUT_FOR_DELIVERY').status, 'ATTEMPTED_DELIVERY');
  assert.equal(planera(miss, ['ATTEMPTED_DELIVERY'], 'ATTEMPTED_DELIVERY'), null, 'men inte två gånger');
});

test('planera: saknad eller framtida tid ersätts med nu', () => {
  const t = tolka({ ...SVAR, track_info: { ...SVAR.track_info, latest_event: { time_iso: '2099-01-01T00:00:00Z' } } });
  const plan = planera(t, [], null);
  assert.ok(new Date(plan.happenedAt).getTime() <= Date.now() + 1000);
  const t2 = tolka({ ...SVAR, track_info: { ...SVAR.track_info, latest_event: null } });
  assert.ok(planera(t2, [], null).happenedAt);
});
