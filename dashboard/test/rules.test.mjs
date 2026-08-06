// Tester för de regler som systemet står och faller med.
// Körs mot en isolerad datakatalog så din riktiga data aldrig rörs.
//   node --test dashboard/test/

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Peka store mot en temporär katalog innan den importeras.
const TMP = mkdtempSync(join(tmpdir(), 'bb-dash-'));
process.env.DASHBOARD_DATA_DIR = TMP;

const { assertTransition, canApprove, canEditTask, canReview, isLate, checklistFor } =
  await import('../lib/model.mjs');
const { editorKpis, productStatus, quotaPerCycle, testShare, missingReports } =
  await import('../lib/kpi.mjs');

// ---------- Statusövergångar ----------

test('en task kan inte hoppa direkt från pågående till godkänd', () => {
  assert.throws(() => assertTransition('in_progress', 'approved'), /Otillåten övergång/);
});

test('godkänd kräver vägen via granskning', () => {
  assert.doesNotThrow(() => assertTransition('in_progress', 'in_review'));
  assert.doesNotThrow(() => assertTransition('in_review', 'approved'));
});

test('okänd status avvisas', () => {
  assert.throws(() => assertTransition('planned', 'finished'), /Okänd status/);
});

// ---------- Godkännande och checklista ----------

const taskWith = (checklist, extra = {}) => ({ id: 'T-1', status: 'in_review', checklist, ...extra });

test('en task kan inte godkännas med obesvarad obligatorisk punkt', () => {
  const t = taskWith([{ key: 'a', required: true, passed: null }, { key: 'b', required: false, passed: null }]);
  const r = canApprove(t);
  assert.equal(r.ok, false);
  assert.equal(r.missing.length, 1);
});

test('valfria punkter blockerar inte godkännande', () => {
  const t = taskWith([{ key: 'a', required: true, passed: true }, { key: 'b', required: false, passed: null }]);
  assert.equal(canApprove(t).ok, true);
});

test('override kräver en motivering på minst 10 tecken', () => {
  const t = taskWith([{ key: 'a', required: true, passed: null }]);
  assert.equal(canApprove(t, { override: true, overrideReason: 'ok' }).ok, false);
  const r = canApprove(t, { override: true, overrideReason: 'Kollade manuellt, filen är korrekt' });
  assert.equal(r.ok, true);
  assert.equal(r.overridden, true);
});

test('checklistan innehåller både bas och typspecifika punkter', () => {
  const c = checklistFor('new_creative');
  assert.ok(c.some(x => x.key === 'delivery_link'), 'baspunkt saknas');
  assert.ok(c.some(x => x.key === 'distinct_hooks'), 'typspecifik punkt saknas');
  assert.ok(c.every(x => x.passed === null), 'punkter ska börja obesvarade');
});

// ---------- Behörigheter ----------

const editor = { id: 'maria', role: 'editor' };
const manager = { id: 'anna', role: 'manager' };

test('en editor kan inte ändra någon annans task', () => {
  assert.equal(canEditTask(editor, { assignedEditorId: 'jomar' }), false);
  assert.equal(canEditTask(editor, { assignedEditorId: 'maria' }), true);
});

test('bara manager och admin får granska', () => {
  assert.equal(canReview(editor), false);
  assert.equal(canReview(manager), true);
  assert.equal(canReview({ role: 'admin' }), true);
});

// ---------- Sena tasks ----------

test('sena tasks identifieras korrekt och godkända räknas aldrig som sena', () => {
  assert.equal(isLate({ dueDate: '2026-08-01', status: 'in_progress' }, '2026-08-05'), true);
  assert.equal(isLate({ dueDate: '2026-08-09', status: 'in_progress' }, '2026-08-05'), false);
  assert.equal(isLate({ dueDate: '2026-08-01', status: 'approved' }, '2026-08-05'), false);
  assert.equal(isLate({ dueDate: null, status: 'in_progress' }, '2026-08-05'), false);
});

// ---------- Kvotformeln ----------

test('kvotformeln matchar pipeline/quota.mjs', () => {
  // Motorhöljet: 6000 kr/dag ≥ 5000 → 10 %; 600 / 135 × 3 = 13,33 → 14
  assert.equal(testShare(6000), 0.10);
  assert.equal(quotaPerCycle({ daily_budget_sek: 6000, target_cpa_sek: 135 }), 14);
  // Axelbältet: 2000 kr/dag < 5000 → 20 %; 400 / 185 × 3 = 6,49 → 7
  assert.equal(testShare(2000), 0.20);
  assert.equal(quotaPerCycle({ daily_budget_sek: 2000, target_cpa_sek: 185 }), 7);
  // Tröskeln går vid exakt 5000
  assert.equal(testShare(4999), 0.20);
  assert.equal(testShare(5000), 0.10);
});

// ---------- KPI-beräkningar ----------

const mkTask = (o) => ({
  id: o.id, assignedEditorId: 'maria', productId: 'axelbaltet',
  plannedDate: '2026-08-03', dueDate: '2026-08-03',
  startDate: '2026-08-03', completedAt: null, approvedAt: null,
  plannedCreativeCount: 2, deliveredCreativeCount: 0,
  currentRevision: 0, status: 'planned', updatedAt: '2026-08-03T18:00:00.000Z', ...o,
});

test('KPI:er räknas korrekt ur taskdata', () => {
  const tasks = [
    mkTask({ id: 'A', status: 'approved', completedAt: '2026-08-03T12:00:00.000Z', approvedAt: '2026-08-03T15:00:00.000Z', deliveredCreativeCount: 2 }),
    mkTask({ id: 'B', status: 'approved', completedAt: '2026-08-04T12:00:00.000Z', approvedAt: '2026-08-04T15:00:00.000Z', deliveredCreativeCount: 3, currentRevision: 1, dueDate: '2026-08-03' }),
    mkTask({ id: 'C', status: 'in_progress' }),
  ];
  const k = editorKpis(tasks, [], 'maria', '2026-08-01', '2026-08-05', '2026-08-05');
  assert.equal(k.tasksDelivered, 2);
  assert.equal(k.tasksApproved, 2);
  assert.equal(k.creativesDelivered, 5);
  assert.equal(k.onTimeRate, 50, 'B levererades en dag för sent → 1 av 2 i tid');
  assert.equal(k.firstPassRate, 50, 'bara A godkändes utan revision');
  assert.equal(k.avgRevisionRounds, 0.5);
  assert.equal(k.openTasks, 1);
});

test('levererade och godkända creatives är två olika mått', () => {
  const tasks = [
    mkTask({ id: 'A', status: 'in_review', completedAt: '2026-08-03T12:00:00.000Z', deliveredCreativeCount: 3 }),
  ];
  const k = editorKpis(tasks, [], 'maria', '2026-08-01', '2026-08-05', '2026-08-05');
  assert.equal(k.creativesDelivered, 3);
  assert.equal(k.creativesApproved, 0, 'inlämnad men inte godkänd ska inte räknas som godkänd');
});

test('datumfiltret utesluter tasks utanför intervallet', () => {
  const tasks = [
    mkTask({ id: 'A', status: 'approved', plannedDate: '2026-07-01', completedAt: '2026-07-01T12:00:00.000Z', approvedAt: '2026-07-01T15:00:00.000Z', deliveredCreativeCount: 2 }),
  ];
  const inside  = editorKpis(tasks, [], 'maria', '2026-07-01', '2026-07-02', '2026-08-05');
  const outside = editorKpis(tasks, [], 'maria', '2026-08-01', '2026-08-05', '2026-08-05');
  assert.equal(inside.creativesApproved, 2);
  assert.equal(outside.creativesApproved, 0);
});

// ---------- Produktstatus mot kvot ----------

test('produktens kvotläge räknas på godkända creatives, inte levererade', () => {
  const product = { id: 'axelbaltet', name: 'Axelbältet', daily_budget_sek: 2000, target_cpa_sek: 185 };
  const tasks = [
    mkTask({ id: 'A', productId: 'axelbaltet', status: 'in_review', completedAt: '2026-08-03T12:00:00.000Z', deliveredCreativeCount: 5 }),
    mkTask({ id: 'B', productId: 'axelbaltet', status: 'approved', completedAt: '2026-08-03T12:00:00.000Z', approvedAt: '2026-08-03T15:00:00.000Z', deliveredCreativeCount: 2 }),
  ];
  const st = productStatus(product, tasks, '2026-08-03', '2026-08-03');
  assert.equal(st.delivered, 7);
  assert.equal(st.approved, 2, 'bara den godkända räknas');
  assert.equal(st.targetInRange, 3, '7 per cykel ÷ 3 dagar = 2,33/dag → 3 för en dag');
  assert.equal(st.diff, -1);
  assert.equal(st.signal, 'danger');
});

// ---------- Utebliven slutrapport ----------

test('redigerare utan slutrapport flaggas', () => {
  const team = { users: [
    { id: 'maria', role: 'editor', active: true, name: 'Maria' },
    { id: 'jomar', role: 'editor', active: true, name: 'Jomar' },
    { id: 'anna',  role: 'manager', active: true, name: 'Anna' },
  ]};
  const reports = [{ editorId: 'maria', date: '2026-08-05' }];
  const missing = missingReports(team, reports, '2026-08-05');
  assert.equal(missing.length, 1);
  assert.equal(missing[0].id, 'jomar');
});

// ---------- Store: skrivregler och idempotens ----------

test('store: negativ creative-count och saknad brief avvisas, Slack-event bearbetas en gång', async () => {
  mkdirSync(TMP, { recursive: true });
  writeFileSync(join(TMP, 'team.json'), JSON.stringify({ users: [
    { id: 'anna', name: 'Anna', role: 'manager', active: true },
    { id: 'maria', name: 'Maria', role: 'editor', active: true },
  ]}));
  writeFileSync(join(TMP, 'tasks.json'), JSON.stringify({ tasks: [] }));
  writeFileSync(join(TMP, 'events.json'), JSON.stringify({ events: [] }));

  const S = await import('../lib/store.mjs');
  // createTask kräver brief-länk
  assert.throws(() => S.createTask({ title: 'X', productId: 'axelbaltet', assignedEditorId: 'maria',
    taskType: 'new_creative', createdBy: 'anna' }), /brief/i);

  // Idempotens: samma Slack-event får bara ge ett event i loggen.
  const before = S.loadEvents().length;
  const slackId = 'Ev123ABC';
  const seen = () => S.loadEvents().some(e => e.meta?.slackEventId === slackId);
  if (!seen()) S.logEvent({ userId: 'maria', type: 'slack_event', source: 'slack', meta: { slackEventId: slackId } });
  if (!seen()) S.logEvent({ userId: 'maria', type: 'slack_event', source: 'slack', meta: { slackEventId: slackId } });
  assert.equal(S.loadEvents().length, before + 1, 'samma Slack-event ska bara bearbetas en gång');
});

after(() => rmSync(TMP, { recursive: true, force: true }));
