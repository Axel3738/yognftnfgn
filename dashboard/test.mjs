// Tester. Kör: node test.mjs
//
// Fokus ligger på det som är lätt att få fel och dyrt att ha fel:
// arbetstidsmatematiken och veckningen av händelser till tasks. Om de är rätt
// är resten aritmetik.

import assert from 'node:assert/strict';
import { businessMinutes, minutesPerWorkday, formatDuration, localDate, dateRange } from './src/time.mjs';
import { foldTasks, mergeEvents, eventKey } from './src/store.mjs';
import { enrichTask, computeMetrics, median, percentile, revisionSeverity } from './src/metrics.mjs';
import { parseCSV } from './src/ingest/csv.mjs';
import { taskIdFromUrl } from './src/ingest/notion-rows.mjs';
import { buildDigest, buildNudges } from './src/slack.mjs';

const TZ = 'Europe/Stockholm';
const WD = { days: [1, 2, 3, 4, 5], start: '09:00', end: '18:00', lunchStart: '12:00', lunchMinutes: 60 };

let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log(`  ✔ ${name}`); }
  catch (err) { failed++; console.log(`  ✖ ${name}\n     ${err.message}`); }
}

console.log('\nArbetstid');

test('full arbetsdag = 8h (9–18 minus lunch)', () => {
  assert.equal(minutesPerWorkday(WD), 480);
  // Tisdag 2026-08-11, 09:00 → 18:00
  assert.equal(businessMinutes('2026-08-11T09:00:00+02:00', '2026-08-11T18:00:00+02:00', WD, TZ), 480);
});

test('lunchen räknas bort', () => {
  assert.equal(businessMinutes('2026-08-11T11:30:00+02:00', '2026-08-11T13:30:00+02:00', WD, TZ), 60);
});

test('kvällar räknas inte', () => {
  // 17:00 tisdag → 10:00 onsdag = 1h kvar tisdag + 1h onsdag morgon
  assert.equal(businessMinutes('2026-08-11T17:00:00+02:00', '2026-08-12T10:00:00+02:00', WD, TZ), 120);
});

test('helgen räknas inte — fredag 16:45 → måndag 09:15 är 1h 30m', () => {
  // fredag 2026-08-07 16:45 → 18:00 = 75 min, måndag 2026-08-10 09:00 → 09:15 = 15 min
  assert.equal(businessMinutes('2026-08-07T16:45:00+02:00', '2026-08-10T09:15:00+02:00', WD, TZ), 90);
});

test('tid utanför arbetstid ger noll, inte negativt', () => {
  assert.equal(businessMinutes('2026-08-08T10:00:00+02:00', '2026-08-09T16:00:00+02:00', WD, TZ), 0); // lör→sön
  assert.equal(businessMinutes('2026-08-11T14:00:00+02:00', '2026-08-11T10:00:00+02:00', WD, TZ), 0); // baklänges
});

test('DST-skiftet förskjuter inte dagen', () => {
  // Sverige går till vintertid natten till söndag 2026-10-25. Måndagen efter
  // ska fortfarande vara exakt 8 arbetstimmar.
  assert.equal(businessMinutes('2026-10-26T09:00:00+01:00', '2026-10-26T18:00:00+01:00', WD, TZ), 480);
  // Och veckan över skiftet: mån–fre = 5 × 480.
  assert.equal(businessMinutes('2026-10-19T09:00:00+02:00', '2026-10-23T18:00:00+02:00', WD, TZ), 2400);
});

test('flera veckor summerar rätt', () => {
  // Mån 2026-08-03 09:00 → fre 2026-08-14 18:00 = 10 arbetsdagar
  assert.equal(businessMinutes('2026-08-03T09:00:00+02:00', '2026-08-14T18:00:00+02:00', WD, TZ), 4800);
});

test('localDate följer tidszonen, inte UTC', () => {
  // 2026-08-11T23:30Z är redan 12 augusti i Stockholm (UTC+2)
  assert.equal(localDate('2026-08-11T23:30:00Z', TZ), '2026-08-12');
  assert.equal(localDate('2026-08-11T21:30:00Z', TZ), '2026-08-11');
});

test('dateRange är inklusiv i båda ändar', () => {
  const r = dateRange('2026-08-10T10:00:00+02:00', '2026-08-14T10:00:00+02:00', TZ);
  assert.deepEqual(r, ['2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14']);
});

test('formatDuration byter enhet vid rätt gränser', () => {
  assert.equal(formatDuration(45, WD), '45m');
  assert.equal(formatDuration(90, WD), '1h 30m');
  assert.equal(formatDuration(120, WD), '2h');
  assert.equal(formatDuration(720, WD), '1,5 d');
  assert.equal(formatDuration(null, WD), '–');
});

console.log('\nHändelser → tasks');

const EVENTS = [
  { ts: '2026-08-03T09:00:00+02:00', type: 'assigned', task_id: 'T-1', editor: 'a', title: 'Hook A', due: '2026-08-04T17:00:00+02:00' },
  { ts: '2026-08-03T10:00:00+02:00', type: 'started', task_id: 'T-1', editor: 'a' },
  { ts: '2026-08-03T14:00:00+02:00', type: 'delivered', task_id: 'T-1', editor: 'a', round: 1 },
  { ts: '2026-08-03T16:00:00+02:00', type: 'revision_requested', task_id: 'T-1', editor: 'a', reason: 'Fel logga' },
  { ts: '2026-08-04T10:00:00+02:00', type: 'delivered', task_id: 'T-1', editor: 'a', round: 2 },
  { ts: '2026-08-04T11:00:00+02:00', type: 'approved', task_id: 'T-1', editor: 'a' },

  { ts: '2026-08-03T09:00:00+02:00', type: 'assigned', task_id: 'T-2', editor: 'b', title: 'Static B', due: '2026-08-03T17:00:00+02:00' },
  { ts: '2026-08-03T09:30:00+02:00', type: 'started', task_id: 'T-2', editor: 'b' },
  { ts: '2026-08-03T11:30:00+02:00', type: 'delivered', task_id: 'T-2', editor: 'b', round: 1 },
  { ts: '2026-08-04T09:30:00+02:00', type: 'approved', task_id: 'T-2', editor: 'b' },
];

test('veckningen bygger rätt task-struktur', () => {
  const tasks = foldTasks(EVENTS);
  assert.equal(tasks.length, 2);
  const t1 = tasks.find(t => t.id === 'T-1');
  assert.equal(t1.state, 'approved');
  assert.equal(t1.deliveries.length, 2);
  assert.equal(t1.revisions.length, 1);
  assert.equal(t1.revisions[0].deliveredAt, '2026-08-04T10:00:00+02:00', 'leveransen ska stänga revisionen');
  assert.equal(t1.title, 'Hook A');
  assert.equal(t1.dueAt, '2026-08-04T17:00:00+02:00');
});

test('ledtiderna räknas i arbetstid', () => {
  const t1 = enrichTask(foldTasks(EVENTS).find(t => t.id === 'T-1'), WD, TZ);
  assert.equal(t1.pickupMin, 60);          // 09:00 → 10:00
  assert.equal(t1.firstPassMin, 180);      // 10:00 → 14:00 minus lunch
  assert.equal(t1.turnaroundMin, 240);     // 09:00 → 14:00 minus lunch
  assert.equal(t1.revisionMins[0], 180);   // mån 16:00→18:00 = 2h, tis 09:00→10:00 = 1h
  assert.equal(t1.revisionCount, 1);
  assert.equal(t1.onTime, true);           // godkänd 4 aug 11:00, deadline 4 aug 17:00
});

test('första-gången-rätt syns i firstPass', () => {
  const [t1, t2] = ['T-1', 'T-2'].map(id => enrichTask(foldTasks(EVENTS).find(t => t.id === id), WD, TZ));
  assert.equal(t1.firstPass, false);
  assert.equal(t2.firstPass, true);
  assert.equal(t2.revisionCount, 0);
});

test('en task utan deadline döms inte på tid', () => {
  const tasks = foldTasks([
    { ts: '2026-08-03T09:00:00+02:00', type: 'assigned', task_id: 'T-9', editor: 'a' },
    { ts: '2026-08-03T12:00:00+02:00', type: 'delivered', task_id: 'T-9', editor: 'a', round: 1 },
    { ts: '2026-08-03T13:00:00+02:00', type: 'approved', task_id: 'T-9', editor: 'a' },
  ]);
  assert.equal(enrichTask(tasks[0], WD, TZ).onTime, null);
});

test('dedupe hindrar dubbletter vid upprepad pollning', () => {
  const incoming = EVENTS.slice(0, 3);
  const { added } = mergeEvents(EVENTS, incoming);
  assert.equal(added, 0);
  const { added: added2 } = mergeEvents(EVENTS, [{ ts: '2026-08-05T09:00:00+02:00', type: 'delivered', task_id: 'T-1', round: 3 }]);
  assert.equal(added2, 1, 'ny runda är en ny händelse');
  assert.equal(eventKey({ task_id: 'x', type: 'delivered', round: 2 }), 'x|delivered|2');
});

console.log('\nNyckeltal');

const CONFIG = {
  team: 'Test', timezone: TZ, workday: WD,
  targets: { turnaroundHours: 8, revisionTurnaroundHours: 4, pickupHours: 2, revisionRate: 0.25, deliveriesPerActiveDay: 2, onTimeRate: 0.85 },
  thresholds: { revisionRateWarning: 0.3, revisionRateCritical: 0.45, staleAfterBusinessHours: 24, idleAfterBusinessHours: 16 },
  periods: [7, 30], defaultPeriodDays: 30,
  slack: { channel: '#test', mentionOnFlags: true },
};
const NOW = Date.parse('2026-08-06T12:00:00+02:00');
const M = computeMetrics({
  tasks: foldTasks(EVENTS), config: CONFIG, periodDays: 30, now: NOW,
  editors: [{ id: 'a', name: 'Alfa', slack: 'UA' }, { id: 'b', name: 'Beta', slack: 'UB' }],
});

test('median och percentil', () => {
  assert.equal(median([1, 2, 3]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(median([]), null);
  assert.equal(percentile([1, 2, 3, 4, 5], 0.9), 4.6);
});

test('revisionsgrad räknas per task, inte per leverans', () => {
  const a = M.editors.find(e => e.id === 'a');
  const b = M.editors.find(e => e.id === 'b');
  assert.equal(a.stats.revisionRate, 1);   // 1 av 1 task fick revision
  assert.equal(b.stats.revisionRate, 0);
  assert.equal(M.team.revisionRate, 0.5);  // 1 av 2
});

test('omgjort-andelen räknas per leverans', () => {
  // 3 leveranser totalt, varav 1 är en omgjord runda
  assert.equal(M.team.deliveries, 3);
  assert.equal(M.team.reworkDeliveries, 1);
  assert.ok(Math.abs(M.team.reworkShare - 1 / 3) < 1e-9);
});

test('perioden filtrerar på leveransdatum', () => {
  const narrow = computeMetrics({ tasks: foldTasks(EVENTS), config: CONFIG, periodDays: 1, now: NOW, editors: [] });
  assert.equal(narrow.team.deliveries, 0, 'inga leveranser inom det senaste dygnet');
  assert.equal(M.team.deliveries, 3, 'men tre inom 30 dagar');
});

test('dagsserien har en rad per dag, nollor inkluderade', () => {
  assert.equal(M.team.daily.length, 31);
  const day3 = M.team.daily.find(d => d.date === '2026-08-03');
  assert.equal(day3.total, 2);
  assert.equal(day3.a, 1);
  assert.equal(day3.b, 1);
  assert.ok(M.team.daily.some(d => d.total === 0), 'tomma dagar ska finnas med som nollor');
});

test('statusgränser för revisionsgrad', () => {
  const th = CONFIG.thresholds;
  assert.equal(revisionSeverity(0.1, th), 'good');
  assert.equal(revisionSeverity(0.35, th), 'warning');
  assert.equal(revisionSeverity(0.5, th), 'critical');
  assert.equal(revisionSeverity(null, th), 'unknown');
});

test('öppna tasks flaggas, stängda gör det inte', () => {
  const open = [
    { ts: '2026-08-03T09:00:00+02:00', type: 'assigned', task_id: 'T-OPEN', editor: 'a', title: 'Ligger', due: '2026-08-04T17:00:00+02:00' },
    { ts: '2026-08-03T10:00:00+02:00', type: 'started', task_id: 'T-OPEN', editor: 'a' },
  ];
  const m = computeMetrics({ tasks: foldTasks([...EVENTS, ...open]), config: CONFIG, periodDays: 30, now: NOW, editors: [] });
  const kinds = m.flags.filter(f => f.task === 'T-OPEN').map(f => f.kind);
  assert.ok(kinds.includes('overdue'), 'deadline passerad ska flaggas');
  assert.ok(kinds.includes('stale'), 'ingen rörelse ska flaggas');
  assert.equal(m.flags.filter(f => f.task === 'T-1').length, 0, 'godkänd task ska inte flaggas');
});

console.log('\nCSV');

test('parsern klarar citat, komman och semikolon', () => {
  const rows = parseCSV('a,b,c\n1,"två, med komma",3\n');
  assert.deepEqual(rows, [['a', 'b', 'c'], ['1', 'två, med komma', '3']]);
  assert.deepEqual(parseCSV('a;b\n1;2\n'), [['a', 'b'], ['1', '2']]);
  assert.deepEqual(parseCSV('a\n"säger ""hej"""\n'), [['a'], ['säger "hej"']]);
});

console.log('\nNotion-id');

test('titel i URL:en ändrar inte task-id:t', () => {
  // Notions API ger URL:er med titeln inbakad, SQL-vyn ger bara id:t. Skiljer de
  // sig åt kopplas inte kommentarerna till sina tasks och ledtiderna blir tomma.
  const bart = taskIdFromUrl('https://app.notion.com/36f270ab908c80aaa89ffade93ea9cb4');
  const medTitel = taskIdFromUrl('https://www.notion.so/Approved-music-36f270ab908c80aaa89ffade93ea9cb4');
  const medStreck = taskIdFromUrl('https://www.notion.so/36f270ab-908c-80aa-a89f-fade93ea9cb4');
  assert.equal(bart, 'N-36f270ab908c80aaa89ffade93ea9cb4');
  assert.equal(medTitel, bart, 'titeln får inte hamna i id:t');
  assert.equal(medStreck, bart, 'bindestreck får inte ändra id:t');
  assert.throws(() => taskIdFromUrl('https://www.notion.so/inget-id-har'));
});

test('en naken länk är inte en ändringsbegäran', async () => {
  const { commentsToEvents } = await import('./src/ingest/notion-comments.mjs');
  const page = '36f270ab908c80aaa89ffade93ea9cb4';
  const tasks = new Map([['N-' + page, { id: 'N-' + page, editor: 'a', title: 'T' }]]);
  const eds = [{ id: 'a', notionId: 'UA' }, { id: 'granskare', notionId: 'UR' }];

  const res = commentsToEvents({ comments: [
    { page, author: 'UR', datetime: '2026-08-01T09:00:00Z', text: 'Kolla briefen först' },   // före leverans → brief
    { page, author: 'UA', datetime: '2026-08-01T12:00:00Z', text: 'Kindly check!' },          // leverans
    { page, author: 'UR', datetime: '2026-08-01T13:00:00Z', text: 'https://facebook.com/x' }, // bara länk
    { page, author: 'UR', datetime: '2026-08-01T14:00:00Z', text: 'Hooken är för svag i 0-2s' }, // riktig
  ] }, eds, tasks);

  const types = res.events.map(e => e.type);
  assert.deepEqual(types, ['delivered', 'revision_requested']);
  assert.equal(res.notes, 2, 'briefen och länken ska inte bokföras');
  assert.match(res.events[1].reason, /Hooken/);
});

console.log('\nSlack');

test('digesten är giltig Block Kit och nämner rätt saker', () => {
  const d = buildDigest(M, CONFIG, { dashboardUrl: 'https://exempel.se' });
  assert.ok(typeof d.text === 'string' && d.text.length);
  assert.ok(Array.isArray(d.blocks) && d.blocks.length);
  assert.ok(d.blocks.every(b => typeof b.type === 'string'));
  assert.equal(d.blocks[0].type, 'header');
  const json = JSON.stringify(d);
  assert.ok(json.includes('Alfa') && json.includes('Beta'));
  assert.ok(json.includes('exempel.se'));
});

test('knuffar skickas bara till den som har något liggande', () => {
  const openEvents = [
    { ts: '2026-08-03T09:00:00+02:00', type: 'assigned', task_id: 'T-OPEN', editor: 'a', title: 'Ligger', due: '2026-08-04T17:00:00+02:00' },
    { ts: '2026-08-03T10:00:00+02:00', type: 'started', task_id: 'T-OPEN', editor: 'a' },
  ];
  const m = computeMetrics({
    tasks: foldTasks([...EVENTS, ...openEvents]), config: CONFIG, periodDays: 30, now: NOW,
    editors: [{ id: 'a', name: 'Alfa', slack: 'UA' }, { id: 'b', name: 'Beta', slack: 'UB' }],
  });
  const n = buildNudges(m, CONFIG);
  assert.equal(n.length, 1);
  assert.equal(n[0].editor, 'a');
  assert.equal(n[0].slack, 'UA');
  assert.ok(JSON.stringify(n[0].message).includes('T-OPEN'));
});

console.log(`\n${failed ? '✖' : '✔'} ${passed} godkända, ${failed} misslyckade\n`);
process.exit(failed ? 1 : 0);
