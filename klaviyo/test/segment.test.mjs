import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SEGMENT, KATEGORIER, segmentPaNamn, filterVillkor, profilFilter, harSamtycke, kravSamtycke, samtyckeVillkor, ordVarianter, FILTERNYCKLAR } from '../segment.mjs';
import { platshallarIds } from '../metriker.mjs';

const IDS = { placed_order: 'PO', started_checkout: 'SC', viewed_product: 'VP', active_on_site: 'AOS', added_to_cart: 'ATC', ordered_product: 'OP', opened_email: 'OE', clicked_email: 'CE', received_email: 'RE' };

test('samtycke: specens form (HasEmailMarketingConsent + HasEmailMarketingSubscribed)', () => {
  assert.deepEqual(samtyckeVillkor(), {
    type: 'profile-marketing-consent',
    consent: { channel: 'email', can_receive_marketing: true, consent_status: { subscription: 'subscribed' } },
  });
});

test('alla segment i ARKITEKTUR-tabellen finns, och varje kampanjsegment har samtycke', () => {
  const namn = SEGMENT.map((s) => s.namn);
  for (const n of ['SEG_samtycke', 'SEG_uppvarmning_steg1', 'SEG_engagerade_60d', 'SEG_engagerade_90d', 'SEG_kopare', 'SEG_kopare_30d', 'SEG_ej_kopt', 'SEG_flerkopare', 'SEG_vinback_90d', 'SEG_oengagerade_180d']) assert.ok(namn.includes(n), n);
  for (const k of Object.keys(KATEGORIER)) assert.ok(namn.includes(`SEG_kategori_${k}`));
  for (const s of SEGMENT) {
    const def = s.bygg(IDS);
    assert.ok(harSamtycke(def), s.namn);
    assert.doesNotThrow(() => kravSamtycke(def, s.namn));
  }
  assert.equal(segmentPaNamn('SEG_oengagerade_180d').kampanjOk, false);
});

test('uppvärmning steg 1: samtycke AND (fyra metriker OR) senaste 30 dagar', () => {
  const def = segmentPaNamn('SEG_uppvarmning_steg1').bygg(IDS);
  assert.equal(def.condition_groups.length, 2);
  const g = def.condition_groups[1].conditions;
  assert.deepEqual(g.map((c) => c.metric_id), ['PO', 'AOS', 'OE', 'CE']);
  for (const c of g) {
    assert.equal(c.type, 'profile-metric');
    assert.equal(c.measurement, 'count');
    assert.deepEqual(c.measurement_filter, { type: 'numeric', operator: 'greater-than-or-equal', value: 1 });
    assert.deepEqual(c.timeframe_filter, { type: 'date', operator: 'in-the-last', unit: 'day', quantity: 30 });
  }
});

test('vinback: köpt någon gång AND inte senaste 90 dagar (egna grupper, alltså AND)', () => {
  const def = segmentPaNamn('SEG_vinback_90d').bygg(IDS);
  assert.equal(def.condition_groups.length, 3);
  assert.deepEqual(def.condition_groups[1].conditions[0].timeframe_filter, { type: 'date', operator: 'alltime' });
  assert.deepEqual(def.condition_groups[2].conditions[0].measurement_filter, { type: 'numeric', operator: 'equals', value: 0 });
});

test('kategorisegment: Ordered Product med ett produktfilter per ord (och versalvariant)', () => {
  const def = segmentPaNamn('SEG_kategori_husvagn_husbil').bygg(IDS);
  const villkor = def.condition_groups[1].conditions;
  const varden = villkor.map((c) => c.metric_filters[0].filter.value);
  assert.deepEqual(varden, ['taköverdrag', 'Taköverdrag', 'termoskydd', 'Termoskydd']);
  assert.equal(villkor[0].metric_id, 'OP');
  assert.deepEqual(villkor[0].metric_filters[0].filter, { type: 'string', operator: 'contains', value: 'taköverdrag' });
  assert.deepEqual(ordVarianter('åkgräsklippare'), ['åkgräsklippare', 'Åkgräsklippare']);
});

test('saknad metrik ger ett tydligt fel, inte ett trasigt villkor', () => {
  assert.throws(() => segmentPaNamn('SEG_kopare').bygg({}), (e) => e.kod === 'METRIK_SAKNAS');
});

test('flödesfilter: specens villkor per nyckel', () => {
  assert.deepEqual(filterVillkor('ej_kopt_sedan_start', IDS).timeframe_filter, { type: 'date', operator: 'flow-start' });
  assert.equal(filterVillkor('ej_checkout_sedan_start', IDS).metric_id, 'SC');
  assert.deepEqual(filterVillkor('ej_i_flodet_14d', IDS), { type: 'profile-not-in-flow', timeframe_filter: { type: 'date', operator: 'in-the-last', unit: 'day', quantity: 14 } });
  assert.deepEqual(filterVillkor('kopt_minst_en_gang', IDS).measurement_filter, { type: 'numeric', operator: 'greater-than-or-equal', value: 1 });
  for (const n of FILTERNYCKLAR) assert.ok(filterVillkor(n, IDS));
  assert.throws(() => filterVillkor('nagot_annat', IDS), /Okänd filternyckel/);
});

test('profilFilter: en grupp per nyckel (AND), null utan nycklar', () => {
  const pf = profilFilter(['samtycke', 'ej_kopt_sedan_start'], IDS);
  assert.equal(pf.condition_groups.length, 2);
  assert.equal(pf.condition_groups[0].conditions[0].type, 'profile-marketing-consent');
  assert.equal(profilFilter([], IDS), null);
  assert.ok(harSamtycke(pf));
});

test('samtyckesspärren: saknat, "any" och samtycke i en OR-grupp räknas inte', () => {
  const utan = { condition_groups: [{ conditions: [{ type: 'profile-metric', metric_id: 'PO' }] }] };
  assert.equal(harSamtycke(utan), false);
  assert.throws(() => kravSamtycke(utan, 'SEG_x'), (e) => e.kod === 'SAMTYCKE_SAKNAS' && /SEG_x/.test(e.message));
  const any = { condition_groups: [{ conditions: [{ type: 'profile-marketing-consent', consent: { channel: 'email', can_receive_marketing: true, consent_status: { subscription: 'any' } } }] }] };
  assert.equal(harSamtycke(any), false);
  const orGrupp = { condition_groups: [{ conditions: [samtyckeVillkor(), { type: 'profile-metric', metric_id: 'PO' }] }] };
  assert.equal(harSamtycke(orGrupp), false);
  assert.equal(harSamtycke(null), false);
});

test('platshållar-id:n räcker för att bygga alla segment torrt', () => {
  const ids = platshallarIds();
  for (const s of SEGMENT) assert.ok(s.bygg(ids));
});

test('kundundantaget: alla som kan ta emot reklam, aldrig de avregistrerade, och räknas inte som samtycke', async () => {
  const { kundundantagVillkor } = await import('../segment.mjs');
  assert.deepEqual(filterVillkor('kundundantag', {}), kundundantagVillkor());
  assert.equal(kundundantagVillkor().consent.can_receive_marketing, true);
  assert.equal(kundundantagVillkor().consent.consent_status.subscription, 'any');
  assert.equal(harSamtycke({ condition_groups: [{ conditions: [kundundantagVillkor()] }] }), false);
});

test('metrikId: brandets metrik_val avgör en dubblett, men bara med ett id som finns', async () => {
  const { metrikId } = await import('../metriker.mjs');
  const m = [{ id: 'V6gSUn', namn: 'Viewed Product', integration: 'API' }, { id: 'WXk2Lf', namn: 'Viewed Product', integration: 'Shopify' }];
  assert.throws(() => metrikId(m, ['Viewed Product']), (e) => e.kod === 'METRIK_FLERA');
  assert.equal(metrikId(m, ['Viewed Product'], { 'Viewed Product': 'V6gSUn' }), 'V6gSUn');
  assert.throws(() => metrikId(m, ['Viewed Product'], { 'Viewed Product': 'FINNSEJ' }), (e) => e.kod === 'METRIK_FLERA');
});
