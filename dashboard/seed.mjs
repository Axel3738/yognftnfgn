#!/usr/bin/env node
// Seedar realistisk demodata: 4 redigerare, 3 produkter, 25+ tasks över 2 veckor.
// Deterministisk — samma körning ger samma data.
//   node dashboard/seed.mjs [--force]

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { DATA_DIR } from './lib/store.mjs';
import { checklistFor } from './lib/model.mjs';

// Datumen räknas relativt idag så demodatan alltid är färsk.
const TODAY = process.env.SEED_TODAY ?? new Date().toISOString().slice(0, 10);
const day = (offset) => {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};
const at = (date, hh, mm = 0) => `${date}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00.000Z`;

const team = {
  users: [
    { id: 'anna',   name: 'Anna Odhner',   email: 'anna@baverbutiken.se',  slackUserId: 'U_ANNA',   role: 'manager', timezone: 'Europe/Stockholm', active: true },
    { id: 'axel',   name: 'Axel Odhner',   email: 'axel@baverbutiken.se',  slackUserId: 'U_AXEL',   role: 'admin',   timezone: 'Europe/Stockholm', active: true },
    { id: 'maria',  name: 'Maria Santos',  email: 'maria@editors.ph',      slackUserId: 'U_MARIA',  role: 'editor',  timezone: 'Asia/Manila', active: true,
      profile: { defaultDailyCreativeTarget: 4, workingDays: [1,2,3,4,5], workdayStart: '09:00', workdayEnd: '18:00',
                 middayCheckTime: '13:30', endOfDayReportTime: '17:30', skills: ['UGC edit','subtitles','hooks'], notes: 'Snabbast på hook-iterationer.' } },
    { id: 'jomar',  name: 'Jomar Reyes',   email: 'jomar@editors.ph',      slackUserId: 'U_JOMAR',  role: 'editor',  timezone: 'Asia/Manila', active: true,
      profile: { defaultDailyCreativeTarget: 3, workingDays: [1,2,3,4,5], workdayStart: '09:00', workdayEnd: '18:00',
                 middayCheckTime: '13:30', endOfDayReportTime: '17:30', skills: ['motion graphics','statics'], notes: 'Tar de svåraste briefarna — högre revisionsgrad är väntat.' } },
    { id: 'ellen',  name: 'Ellen Cruz',    email: 'ellen@editors.ph',      slackUserId: 'U_ELLEN',  role: 'editor',  timezone: 'Asia/Manila', active: true,
      profile: { defaultDailyCreativeTarget: 4, workingDays: [1,2,3,4,5], workdayStart: '08:00', workdayEnd: '17:00',
                 middayCheckTime: '12:30', endOfDayReportTime: '16:30', skills: ['voice-over','B-roll'], notes: '' } },
    { id: 'paolo',  name: 'Paolo Aquino',  email: 'paolo@editors.ph',      slackUserId: 'U_PAOLO',  role: 'editor',  timezone: 'Asia/Manila', active: true,
      profile: { defaultDailyCreativeTarget: 3, workingDays: [1,2,3,4,5], workdayStart: '09:00', workdayEnd: '18:00',
                 middayCheckTime: '13:30', endOfDayReportTime: '17:30', skills: ['statics','listicle'], notes: 'Ny sedan 3 veckor.' } },
  ],
};

// [dagOffset, editor, produkt, typ, titel, prioritet, plannedCreatives, slutstatus, extra]
const SPEC = [
  // --- Vecka 1 (avslutad, godkänd) ---
  [-13, 'maria', 'axelbaltet',      'new_creative',   'Hook test: pain-first opener',            'high',   3, 'approved', {}],
  [-13, 'jomar', 'motorholjet',     'new_creative',   'Listicle static: 5 reasons',              'normal', 2, 'approved', {}],
  [-12, 'ellen', 'strandtofflorna', 'new_vo',         'Swedish VO v2 for beach angle',           'normal', 2, 'approved', {}],
  [-12, 'maria', 'axelbaltet',      'hook_iteration', 'Hook iteration on winner AXE-001',        'high',   3, 'approved', {}],
  [-11, 'paolo', 'motorholjet',     'new_creative',   'Price-anchor static',                     'normal', 2, 'approved', { revisions: 1 }],
  [-11, 'jomar', 'axelbaltet',      'broll_variation','B-roll variation: outdoor use',           'low',    2, 'approved', { revisions: 2 }],
  [-10, 'ellen', 'motorholjet',     'new_creative',   'Storm-proof demo video',                  'high',   3, 'approved', {}],
  [-10, 'maria', 'strandtofflorna', 'subtitle_fix',   'Subtitle sync fix on STR-002',            'low',    1, 'approved', {}],
  [ -9, 'paolo', 'axelbaltet',      'new_creative',   'Comparison static: us vs generic strap',   'normal', 2, 'approved', { revisions: 1 }],
  [ -9, 'jomar', 'motorholjet',     'new_cta',        'New CTA variant: free shipping',          'normal', 2, 'approved', {}],
  [ -8, 'ellen', 'strandtofflorna', 'new_creative',   'UGC-style walk test',                     'normal', 3, 'approved', {}],
  [ -8, 'maria', 'motorholjet',     'revision',       'Revision: reduce text density',           'high',   2, 'approved', { revisions: 1 }],

  // --- Vecka 2 ---
  [ -6, 'maria', 'axelbaltet',      'new_creative',   'Testimonial-style creative',              'high',   3, 'approved', {}],
  [ -6, 'jomar', 'motorholjet',     'format_change',  'Reformat winner to 4:5',                  'normal', 2, 'approved', {}],
  [ -5, 'ellen', 'motorholjet',     'new_creative',   'Winter storage angle',                    'normal', 3, 'approved', {}],
  [ -5, 'paolo', 'strandtofflorna', 'new_creative',   'Garden-use static set',                   'low',    2, 'approved', { revisions: 2 }],
  [ -4, 'maria', 'axelbaltet',      'hook_iteration', 'Hook: "Slipp ont i axlarna"',             'high',   3, 'approved', {}],
  [ -4, 'jomar', 'axelbaltet',      'new_creative',   'Mechanism-led: how the padding works',    'normal', 2, 'changes',  { revisions: 1, feedback: 'Padding close-up is out of focus from 0:04. Reshoot that shot and keep everything else.' }],

  // --- Sena (deadline passerad, inte klara) ---
  [ -3, 'paolo', 'motorholjet',     'new_creative',   'Cost-of-inaction static',                 'normal', 2, 'in_progress', { due: -1 }],
  [ -2, 'ellen', 'strandtofflorna', 'ugc_iteration',  'UGC iteration from creator @annaxyz',     'normal', 3, 'in_progress', { due: -1 }],

  // --- Blockerade ---
  [ -1, 'maria', 'axelbaltet',      'new_vo',         'Voice-over for AXE-hook set',             'high',   2, 'blocked', { due: 0,
       blocker: 'Missing the new Swedish voice-over file — the brief links to a Drive folder that is empty.',
       needs: 'Someone to upload the VO file or approve using the old one.', owner: 'anna' }],
  [ -1, 'jomar', 'motorholjet',     'new_creative',   'Boat-owner angle video',                  'high',   3, 'blocked', { due: 0,
       blocker: 'Source footage folder has no boat b-roll, only engine close-ups.',
       needs: 'B-roll of a boat on a trailer, or approval to use stock.', owner: 'anna' }],
  [  0, 'paolo', 'strandtofflorna', 'new_creative',   'Comfort-first static set',                'normal', 2, 'blocked', { due: 1,
       blocker: 'Product page price says 349 kr but the brief says 399 kr.',
       needs: 'Confirmation of the correct price before I add the price overlay.', owner: 'axel' }],

  // --- Redo för granskning (5 st) ---
  [  0, 'maria', 'axelbaltet',      'new_creative',   'Problem/solution: heavy trimmer',         'high',   3, 'in_review', { due: 0, delivered: 3 }],
  [  0, 'maria', 'motorholjet',     'hook_iteration', 'Hook iteration on top spender',           'high',   2, 'in_review', { due: 0, delivered: 2 }],
  [  0, 'jomar', 'motorholjet',     'new_creative',   'Mechanism-led: 420D fabric',              'normal', 2, 'in_review', { due: 0, delivered: 2 }],
  [  0, 'ellen', 'strandtofflorna', 'new_creative',   'Non-slip demo on wet deck',               'normal', 3, 'in_review', { due: 0, delivered: 3 }],
  [  0, 'ellen', 'axelbaltet',      'revision',       'Revision: stronger CTA end card',         'normal', 2, 'in_review', { due: 0, delivered: 2, revisions: 1 }],

  // --- Pågår / planerat idag ---
  [  0, 'jomar', 'axelbaltet',      'broll_variation','B-roll variation: forest work',           'low',    2, 'in_progress', { due: 1 }],
  [  0, 'paolo', 'motorholjet',     'export_upload',  'Export & upload approved batch',          'normal', 1, 'in_progress', { due: 0 }],
  [  0, 'ellen', 'motorholjet',     'new_intro',      'New 2-sec intro for winner',              'normal', 2, 'planned', { due: 1 }],
  [  0, 'maria', 'strandtofflorna', 'new_creative',   'Beach-day lifestyle set',                 'normal', 3, 'planned', { due: 1 }],
  [  1, 'paolo', 'axelbaltet',      'new_creative',   'Offer static: bundle price',              'low',    2, 'planned', { due: 2 }],
];

const tasks = [];
const events = [];
let evId = 0;
const counters = {};

const push = (e) => { events.push({ id: `EV-${String(++evId).padStart(5, '0')}`, ...e }); };

for (const [offset, editor, product, type, title, priority, planned, finalStatus, extra] of SPEC) {
  const prefix = { axelbaltet: 'AXE', motorholjet: 'MOT', strandtofflorna: 'STR' }[product];
  counters[prefix] = (counters[prefix] ?? 0) + 1;
  const id = `${prefix}-${String(counters[prefix]).padStart(3, '0')}`;
  const plannedDate = day(offset);
  const dueDate = day(extra.due ?? offset);
  const revisions = extra.revisions ?? 0;
  const delivered = extra.delivered ?? (['approved'].includes(finalStatus) ? planned : 0);

  const checklist = checklistFor(type).map(c => ({ ...c }));
  const answered = ['in_review', 'approved'].includes(finalStatus);
  if (answered) {
    for (const c of checklist) {
      // En av review-taskarna har medvetet en obligatorisk punkt kvar — så managern ser skillnaden.
      const holdBack = id === 'MOT-011' && c.key === 'distinct_hooks';
      c.passed = holdBack ? null : true;
      c.answer = holdBack ? null : 'yes';
      c.answeredBy = holdBack ? null : editor;
      c.answeredAt = holdBack ? null : at(plannedDate, 16);
    }
  }

  const task = {
    id, title, description: '', productId: product, assignedEditorId: editor, createdBy: 'anna',
    taskType: type, priority, status: finalStatus,
    plannedDate,
    startDate: finalStatus === 'planned' ? null : plannedDate,
    dueDate,
    completedAt: ['in_review', 'approved'].includes(finalStatus) ? at(plannedDate, 16, 30) : null,
    approvedAt: finalStatus === 'approved' ? at(plannedDate, 18) : null,
    estimatedMinutes: planned * 45,
    plannedCreativeCount: planned,
    deliveredCreativeCount: delivered,
    briefLink: `https://notion.so/brief/${id}`,
    sourceMaterialLink: `https://drive.google.com/drive/folders/${product}-footage`,
    deliveryLink: delivered > 0 ? `https://drive.google.com/drive/folders/${id}-delivery` : '',
    blockerReason: extra.blocker ?? null,
    blockerReportedAt: extra.blocker ? at(plannedDate, 11) : null,
    blockerNeeds: extra.needs ?? '',
    blockerOwner: extra.owner ?? '',
    currentRevision: revisions,
    requiresManagerReview: true,
    checklist,
    feedbackHistory: extra.feedback
      ? [{ round: revisions, feedback: extra.feedback, by: 'anna', at: at(plannedDate, 18) }]
      : (revisions > 0
          ? [{ round: revisions, feedback: 'Versions were too similar — the hooks need to differ, not just the text colour.', by: 'anna', at: at(plannedDate, 18) }]
          : []),
    createdAt: at(day(offset - 1), 8),
    updatedAt: at(plannedDate, 18),
  };
  tasks.push(task);

  // Audit-spår
  push({ taskId: id, userId: 'anna', type: 'task_created', message: title, oldStatus: null, newStatus: 'planned', source: 'dashboard', meta: {}, createdAt: at(day(offset - 1), 8) });
  if (task.startDate) push({ taskId: id, userId: editor, type: 'status_changed', message: '', oldStatus: 'planned', newStatus: 'in_progress', source: 'slack', meta: {}, createdAt: at(plannedDate, 9, 20) });
  if (extra.blocker) push({ taskId: id, userId: editor, type: 'blocker_reported', message: extra.blocker, oldStatus: 'in_progress', newStatus: 'blocked', source: 'slack', meta: { needs: extra.needs, owner: extra.owner }, createdAt: at(plannedDate, 11) });
  if (task.completedAt) push({ taskId: id, userId: editor, type: 'submitted_for_review', message: `${delivered} creatives`, oldStatus: 'in_progress', newStatus: 'in_review', source: 'slack', meta: { deliveryLink: task.deliveryLink, deliveredCreativeCount: delivered }, createdAt: task.completedAt });
  for (let r = 1; r <= revisions; r++) {
    push({ taskId: id, userId: 'anna', type: 'review', message: 'Changes required', oldStatus: 'in_review', newStatus: 'changes', source: 'dashboard', meta: { decision: 'changes' }, createdAt: at(plannedDate, 17, r) });
  }
  if (task.approvedAt) push({ taskId: id, userId: 'anna', type: 'review', message: 'Approved', oldStatus: 'in_review', newStatus: 'approved', source: 'dashboard', meta: { decision: 'approve' }, createdAt: task.approvedAt });
}

// Dagliga planer för idag
const plans = ['maria', 'jomar', 'ellen', 'paolo'].map(editorId => {
  const mine = tasks.filter(t => t.assignedEditorId === editorId && t.plannedDate === TODAY);
  return {
    id: `PLAN-${editorId}-${TODAY}`, editorId, date: TODAY,
    plannedTaskCount: mine.length,
    plannedCreativeCount: mine.reduce((s, t) => s + t.plannedCreativeCount, 0),
    managerNotes: editorId === 'maria' ? 'Start with AXE-013 — it ships first.' : '',
    publishedAt: at(TODAY, 7), acknowledgedAt: editorId === 'paolo' ? null : at(TODAY, 9),
  };
});

// Slutrapporter (paolo saknas medvetet för igår → flaggas som utebliven)
const reports = [
  { id: 'REP-maria-' + day(-1), editorId: 'maria', date: day(-1),
    rawMessage: 'Today I finished the two hook iterations for Axelbältet and uploaded everything to Drive. The VO task is blocked, the folder is empty.',
    summary: '2 tasks done, 1 blocked (missing VO)', completedTaskIds: [], incompleteTaskIds: [],
    deliveredCreativeCount: 5, blockers: 'Missing VO file', needsHelp: true,
    submittedAt: at(day(-1), 17, 30), reviewedAt: at(day(-1), 19), source: 'slack' },
  { id: 'REP-jomar-' + day(-1), editorId: 'jomar', date: day(-1),
    rawMessage: 'Finished the 4:5 reformat. Started the boat-owner video but the footage folder has no boat b-roll.',
    summary: '1 task done, 1 blocked (missing b-roll)', completedTaskIds: [], incompleteTaskIds: [],
    deliveredCreativeCount: 2, blockers: 'No boat b-roll', needsHelp: true,
    submittedAt: at(day(-1), 17, 45), reviewedAt: null, source: 'slack' },
  { id: 'REP-ellen-' + day(-1), editorId: 'ellen', date: day(-1),
    rawMessage: 'Winter storage angle delivered, 3 creatives. Starting the UGC iteration tomorrow.',
    summary: '1 task done, 3 creatives', completedTaskIds: [], incompleteTaskIds: [],
    deliveredCreativeCount: 3, blockers: '', needsHelp: false,
    submittedAt: at(day(-1), 16, 30), reviewedAt: at(day(-1), 19), source: 'dashboard' },
];

mkdirSync(DATA_DIR, { recursive: true });
const force = process.argv.includes('--force');
const exists = existsSync(join(DATA_DIR, 'tasks.json'));
if (exists && !force) {
  console.error('Data finns redan. Kör med --force för att skriva över.');
  process.exit(1);
}

writeFileSync(join(DATA_DIR, 'team.json'), JSON.stringify(team, null, 2) + '\n');
writeFileSync(join(DATA_DIR, 'tasks.json'), JSON.stringify({ tasks }, null, 2) + '\n');
writeFileSync(join(DATA_DIR, 'events.json'), JSON.stringify({ events }, null, 2) + '\n');
writeFileSync(join(DATA_DIR, 'daily-plans.json'), JSON.stringify({ plans }, null, 2) + '\n');
writeFileSync(join(DATA_DIR, 'daily-reports.json'), JSON.stringify({ reports }, null, 2) + '\n');

const count = s => tasks.filter(t => t.status === s).length;
console.log(`Seedat: ${team.users.length} användare · ${tasks.length} tasks · ${events.length} events`);
console.log(`  godkända ${count('approved')} · review ${count('in_review')} · blockerade ${count('blocked')} · pågår ${count('in_progress')} · planerade ${count('planned')} · ändringar ${count('changes')}`);
