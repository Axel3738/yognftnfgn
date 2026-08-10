import test from 'node:test';
import assert from 'node:assert/strict';
import { computeReport, buildState } from '../src/metrics.mjs';

const config = {
  timezone: 'Europe/Stockholm',
  workday: { start: '09:00', end: '17:00', lunchMinutes: 0, days: [1, 2, 3, 4, 5] },
  holidays: [],
  complexityWeights: { S: 1, M: 2, L: 4, XL: 8 },
  minSample: 2,
  targets: { firstPassRate: 0.7, pickupDelayHours: 4 },
  revisionReasons: {
    quality: { label: 'Kvalitet', attributable: true },
    brief: { label: 'Brief', attributable: false },
  },
  slack: { revisionWaitingHours: 8, stalledHours: 16 },
};

/** Alla klockslag är lokala (UTC+2 i augusti 2026). */
const local = (day, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(2026, 7, day, h - 2, m)).toISOString();
};

const baseEvents = [
  { type: 'editor_added', ts: local(3, '08:00'), editorId: 'ed_a', name: 'Anna', slackUserId: 'U_A' },
  { type: 'editor_added', ts: local(3, '08:00'), editorId: 'ed_b', name: 'Bertil' },

  // T1: godkänd på första försöket, i tid.
  { type: 'task_created', ts: local(3, '09:00'), taskId: 'T1', complexity: 'M', title: 'T1' },
  { type: 'task_assigned', ts: local(3, '09:00'), taskId: 'T1', editorId: 'ed_a', dueAt: local(4, '17:00') },
  { type: 'task_started', ts: local(3, '10:00'), taskId: 'T1' },
  { type: 'task_delivered', ts: local(3, '13:00'), taskId: 'T1' },
  { type: 'task_approved', ts: local(3, '15:00'), taskId: 'T1' },

  // T2: en revision på eget fel, godkänd efter runda 2, försenad.
  { type: 'task_created', ts: local(4, '09:00'), taskId: 'T2', complexity: 'L', title: 'T2' },
  { type: 'task_assigned', ts: local(4, '09:00'), taskId: 'T2', editorId: 'ed_a', dueAt: local(4, '17:00') },
  { type: 'task_delivered', ts: local(4, '12:00'), taskId: 'T2' },
  { type: 'revision_requested', ts: local(4, '14:00'), taskId: 'T2', reason: 'quality' },
  { type: 'task_delivered', ts: local(4, '16:00'), taskId: 'T2' },
  { type: 'task_approved', ts: local(5, '10:00'), taskId: 'T2' },

  // T3: revision som är VÅRT fel (brief) — ska inte belasta redigeraren.
  { type: 'task_created', ts: local(5, '09:00'), taskId: 'T3', complexity: 'S', title: 'T3' },
  { type: 'task_assigned', ts: local(5, '09:00'), taskId: 'T3', editorId: 'ed_b' },
  { type: 'task_delivered', ts: local(5, '11:00'), taskId: 'T3' },
  { type: 'revision_requested', ts: local(5, '12:00'), taskId: 'T3', reason: 'brief' },
  { type: 'task_delivered', ts: local(5, '14:00'), taskId: 'T3' },
  { type: 'task_approved', ts: local(5, '15:00'), taskId: 'T3' },

  { type: 'work_logged', ts: local(3, '16:00'), editorId: 'ed_a', taskId: 'T1', minutes: 120 },
];

const report = () =>
  computeReport(baseEvents, config, { from: '2026-08-03', to: '2026-08-07', now: local(7, '12:00') });

test('ledtid till första leverans mäts i arbetstimmar', () => {
  const anna = report().editors.find((e) => e.id === 'ed_a');
  // T1: 09→13 = 4 h, T2: 09→12 = 3 h → median 3,5 h.
  assert.equal(anna.kpis.medianTimeToFirstDeliveryHours, 3.5);
});

test('output viktas efter komplexitet', () => {
  const anna = report().editors.find((e) => e.id === 'ed_a');
  assert.equal(anna.kpis.outputPoints, 6); // M (2) + L (4)
  assert.equal(anna.kpis.tasksDelivered, 2);
});

test('revisionsgrad skiljer på eget fel och vårt fel', () => {
  const rows = report().editors;
  const anna = rows.find((e) => e.id === 'ed_a');
  const bertil = rows.find((e) => e.id === 'ed_b');
  assert.equal(anna.kpis.revisionRate, 0.5); // 1 av 2 tasks
  assert.equal(anna.kpis.attributableRevisionRate, 0.5);
  assert.equal(bertil.kpis.revisionRate, 1); // fick en revision …
  assert.equal(bertil.kpis.attributableRevisionRate, 0); // … men den var vår brief
});

test('rätt-första-gången är komplementet till revisionsgraden', () => {
  const anna = report().editors.find((e) => e.id === 'ed_a');
  assert.equal(anna.kpis.firstPassRate, 0.5);
});

test('revisionsvändning mäts från begäran till nästa leverans', () => {
  const anna = report().editors.find((e) => e.id === 'ed_a');
  assert.equal(anna.kpis.medianRevisionTurnaroundHours, 2); // 14:00 → 16:00
});

test('bollen delas upp i redigerartid och vår granskningstid', () => {
  const state = buildState(baseEvents, config, { now: new Date(local(7, '12:00')) });
  const t2 = state.tasks.get('T2');
  // Redigerare: 09→12 (3 h) + 14→16 (2 h) = 5 h. Vi: 12→14 (2 h) + 16→17,09→10 (2 h).
  assert.equal(t2.handsOnHours, 5);
  assert.equal(t2.reviewWaitHours, 4);
});

test('i tid mäts mot deadline', () => {
  const anna = report().editors.find((e) => e.id === 'ed_a');
  assert.equal(anna.kpis.onTimeSample, 2);
  assert.equal(anna.kpis.onTimeRate, 0.5); // T1 i tid, T2 godkänd dagen efter deadline
});

test('pickup-tid mäts från tilldelning till start', () => {
  const anna = report().editors.find((e) => e.id === 'ed_a');
  assert.equal(anna.kpis.medianPickupDelayHours, 1);
});

test('teamet summerar alla redigerare', () => {
  const team = report().team.kpis;
  assert.equal(team.tasksDelivered, 3);
  assert.equal(team.outputPoints, 7);
  assert.equal(team.reviewedTasks, 3);
});

test('öppna tasks hamnar i kön med rätt ägare', () => {
  const events = [
    ...baseEvents,
    { type: 'task_created', ts: local(6, '09:00'), taskId: 'T4', complexity: 'M', title: 'T4' },
    { type: 'task_assigned', ts: local(6, '09:00'), taskId: 'T4', editorId: 'ed_a', dueAt: local(6, '12:00') },
    { type: 'task_created', ts: local(6, '09:00'), taskId: 'T5', complexity: 'M', title: 'T5' },
    { type: 'task_assigned', ts: local(6, '09:00'), taskId: 'T5', editorId: 'ed_b' },
    { type: 'task_delivered', ts: local(6, '10:00'), taskId: 'T5' },
  ];
  const r = computeReport(events, config, { from: '2026-08-03', to: '2026-08-07', now: local(7, '12:00') });
  assert.equal(r.queue.total, 2);
  assert.equal(r.queue.withEditor, 1);
  assert.equal(r.queue.withReviewer, 1);
  assert.equal(r.queue.overdue.length, 1);
  assert.equal(r.queue.overdue[0].id, 'T4');
  assert.equal(r.queue.overdue[0].slackUserId, 'U_A');
  // T4 har legat hos redigeraren i 11 arbetstimmar — under stalledHours (16),
  // så den flaggas ännu inte som stillastående.
  assert.equal(r.queue.overdue[0].waitingHours, 11);
  assert.equal(r.queue.stalled.length, 0);

  const strict = computeReport(events, { ...config, slack: { ...config.slack, stalledHours: 8 } }, {
    from: '2026-08-03',
    to: '2026-08-07',
    now: local(7, '12:00'),
  });
  assert.equal(strict.queue.stalled[0].id, 'T4');
});

test('utnyttjandegrad räknas mot kapaciteten i perioden', () => {
  const events = [
    ...baseEvents,
    { type: 'editor_added', ts: local(3, '08:00'), editorId: 'ed_a', name: 'Anna', capacityHoursPerDay: 8 },
  ];
  const r = computeReport(events, config, { from: '2026-08-03', to: '2026-08-07', now: local(7, '12:00') });
  const anna = r.editors.find((e) => e.id === 'ed_a');
  assert.equal(anna.kpis.loggedHours, 2);
  assert.equal(anna.kpis.capacityHours, 40); // 5 arbetsdagar × 8 h
  assert.equal(anna.kpis.utilization, 0.05);
});

test('okänd revisionsorsak räknas mot redigeraren och flaggas', () => {
  const events = [
    ...baseEvents,
    { type: 'task_created', ts: local(6, '09:00'), taskId: 'T6', complexity: 'S', title: 'T6' },
    { type: 'task_assigned', ts: local(6, '09:00'), taskId: 'T6', editorId: 'ed_b' },
    { type: 'task_delivered', ts: local(6, '10:00'), taskId: 'T6' },
    { type: 'revision_requested', ts: local(6, '11:00'), taskId: 'T6', reason: 'nagot-annat' },
    { type: 'task_delivered', ts: local(6, '12:00'), taskId: 'T6' },
    { type: 'task_approved', ts: local(6, '13:00'), taskId: 'T6' },
  ];
  const r = computeReport(events, config, { from: '2026-08-03', to: '2026-08-07', now: local(7, '12:00') });
  const bertil = r.editors.find((e) => e.id === 'ed_b');
  assert.equal(bertil.kpis.attributableRevisionRate, 0.5); // T6 räknas, T3 (brief) inte
  assert.ok(r.dataQuality.some((issue) => issue.kind === 'unknown_reason'));
});

test('perioden avgränsar vad som räknas', () => {
  const r = computeReport(baseEvents, config, { from: '2026-08-05', to: '2026-08-05', now: local(7, '12:00') });
  assert.equal(r.team.kpis.tasksDelivered, 1); // bara T3
  assert.equal(r.range.workdays, 1);
});

test('daglig serie följer perioden och nollar tomma dagar', () => {
  const r = report();
  assert.equal(r.daily.length, 5);
  assert.equal(r.daily[0].date, '2026-08-03');
  assert.equal(r.daily[0].byEditor.ed_a, 2);
  assert.equal(r.daily[4].points, 0);
});
