import test from 'node:test';
import assert from 'node:assert/strict';
import { computeReport } from '../src/metrics.mjs';
import { buildDailyDigest, buildWeeklyScoreboard, buildNudges } from '../src/digest.mjs';
import { createSlackClient } from '../src/slack.mjs';

const config = {
  timezone: 'Europe/Stockholm',
  workday: { start: '09:00', end: '17:00', lunchMinutes: 0, days: [1, 2, 3, 4, 5] },
  holidays: [],
  complexityWeights: { S: 1, M: 2, L: 4, XL: 8 },
  minSample: 2,
  targets: { firstPassRate: 0.7 },
  revisionReasons: { quality: { label: 'Kvalitet', attributable: true } },
  slack: { channel: '#redigering', revisionWaitingHours: 4, stalledHours: 8 },
};

const local = (day, hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(Date.UTC(2026, 7, day, h - 2, m)).toISOString();
};

const events = [
  { type: 'editor_added', ts: local(3, '08:00'), editorId: 'ed_a', name: 'Anna', slackUserId: 'U_A' },
  { type: 'task_created', ts: local(3, '09:00'), taskId: 'T1', complexity: 'M', title: 'Försenad task' },
  { type: 'task_assigned', ts: local(3, '09:00'), taskId: 'T1', editorId: 'ed_a', dueAt: local(3, '12:00') },
  { type: 'task_created', ts: local(3, '09:00'), taskId: 'T2', complexity: 'M', title: 'Liggande revision' },
  { type: 'task_assigned', ts: local(3, '09:00'), taskId: 'T2', editorId: 'ed_a' },
  { type: 'task_delivered', ts: local(3, '10:00'), taskId: 'T2' },
  { type: 'revision_requested', ts: local(3, '11:00'), taskId: 'T2', reason: 'quality' },
];

const report = computeReport(events, config, { from: '2026-08-03', to: '2026-08-05', now: local(5, '12:00') });

test('dagsrapporten listar försenade och liggande revisions', () => {
  const message = buildDailyDigest(report, { hoursPerDay: 8 });
  const text = JSON.stringify(message.blocks);
  assert.match(text, /Försenade/);
  assert.match(text, /Försenad task/);
  assert.match(text, /Revisions som ligger still/);
  assert.match(text, /<@U_A>/); // taggar personen, inte bara namnet
  assert.match(message.text, /1 försenade/);
});

test('veckorapporten rankar redigerare och redovisar orsaker', () => {
  const message = buildWeeklyScoreboard(report, { hoursPerDay: 8 });
  const text = JSON.stringify(message.blocks);
  assert.match(text, /Anna/);
  assert.match(text, /first-pass/);
});

test('påminnelser skickas per redigerare med det som ligger', () => {
  const nudges = buildNudges(report, { hoursPerDay: 8 });
  assert.equal(nudges.length, 1);
  assert.equal(nudges[0].slackUserId, 'U_A');
  assert.match(JSON.stringify(nudges[0].blocks), /Försenad task/);
  assert.match(JSON.stringify(nudges[0].blocks), /Liggande revision/);
});

test('inga påminnelser när kön är ren', () => {
  const clean = computeReport(
    [
      { type: 'editor_added', ts: local(3, '08:00'), editorId: 'ed_a', name: 'Anna' },
      { type: 'task_created', ts: local(3, '09:00'), taskId: 'T9', complexity: 'S', title: 'Klar' },
      { type: 'task_assigned', ts: local(3, '09:00'), taskId: 'T9', editorId: 'ed_a' },
      { type: 'task_delivered', ts: local(3, '10:00'), taskId: 'T9' },
      { type: 'task_approved', ts: local(3, '11:00'), taskId: 'T9' },
    ],
    config,
    { from: '2026-08-03', to: '2026-08-05', now: local(5, '12:00') },
  );
  assert.equal(buildNudges(clean, {}).length, 0);
});

test('slack-klienten skickar inget i dry run', async () => {
  const lines = [];
  const client = createSlackClient({ dryRun: true, env: {}, logger: { log: (m) => lines.push(m) } });
  const res = await client.send({ channel: '#test', text: 'hej', blocks: [] });
  assert.equal(res.dryRun, true);
  assert.ok(lines.join('\n').includes('hej'));
});

test('slack-klienten säger ifrån när konfiguration saknas', async () => {
  const client = createSlackClient({ dryRun: false, env: {} });
  await assert.rejects(() => client.send({ channel: '#test', text: 'hej' }), /Slack-konfiguration/);
});

test('DM utan bot-token ger ett begripligt fel', async () => {
  const client = createSlackClient({ dryRun: false, env: { SLACK_WEBHOOK_URL: 'https://example.invalid/hook' } });
  await assert.rejects(() => client.send({ channel: 'U_A', text: 'hej' }), /SLACK_BOT_TOKEN/);
});
