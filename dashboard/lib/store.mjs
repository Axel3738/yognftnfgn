// Datalager: JSON-filer på disk, samma mönster som products/products.json.
// Varje skrivning loggas i events.json (append-only audit log).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertTransition, canEditTask, canReview, canApprove, checklistFor, isLate } from './model.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
// DASHBOARD_DATA_DIR låter tester köra mot en temporär katalog i stället för riktig data.
export const DATA_DIR = process.env.DASHBOARD_DATA_DIR ?? join(HERE, '..', 'data');
export const REPO_ROOT = join(HERE, '..', '..');

const FILES = {
  team:      'team.json',
  tasks:     'tasks.json',
  events:    'events.json',
  plans:     'daily-plans.json',
  reports:   'daily-reports.json',
};

const read = (name, fallback) => {
  const p = join(DATA_DIR, FILES[name]);
  if (!existsSync(p)) return fallback;
  return JSON.parse(readFileSync(p, 'utf8'));
};

const write = (name, data) => {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(join(DATA_DIR, FILES[name]), JSON.stringify(data, null, 2) + '\n');
};

export const today = () => new Date().toISOString().slice(0, 10);
const now = () => new Date().toISOString();

export const loadTeam    = () => read('team', { users: [] });
export const loadTasks   = () => read('tasks', { tasks: [] }).tasks;
export const loadEvents  = () => read('events', { events: [] }).events;
export const loadPlans   = () => read('plans', { plans: [] }).plans;
export const loadReports = () => read('reports', { reports: [] }).reports;

export const saveTeam    = t => write('team', t);
export const saveTasks   = tasks => write('tasks', { tasks });
export const savePlans   = plans => write('plans', { plans });
export const saveReports = reports => write('reports', { reports });

/** Produkterna kommer från det befintliga systemet — vi duplicerar dem inte. */
export function loadProducts() {
  const p = join(REPO_ROOT, 'products', 'products.json');
  return JSON.parse(readFileSync(p, 'utf8')).products;
}

export const findUser    = id => loadTeam().users.find(u => u.id === id);
export const findProduct = id => loadProducts().find(p => p.id === id);

/**
 * Skriver en rad i audit-loggen. Varje förändring ska gå att spåra:
 * vem, vad, när, varför och varifrån (dashboard/slack/ai/cli).
 */
export function logEvent({ taskId = null, userId, type, message = '', from = null, to = null, source = 'cli', meta = {} }) {
  const events = loadEvents();
  const event = {
    id: `EV-${String(events.length + 1).padStart(5, '0')}`,
    taskId, userId, type, message,
    oldStatus: from, newStatus: to,
    source, meta, createdAt: now(),
  };
  events.push(event);
  write('events', { events });
  return event;
}

let _seq = null;
function nextTaskId(productId) {
  const tasks = loadTasks();
  if (_seq === null) _seq = tasks.length;
  const prefix = (findProduct(productId)?.name ?? productId).slice(0, 3).toUpperCase()
    .replace(/[^A-ZÅÄÖ]/g, 'X');
  const n = tasks.filter(t => t.id.startsWith(prefix)).length + 1;
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

/** Skapar en task. Brief-länk är obligatorisk — otydliga briefs är en känd bottleneck. */
export function createTask({
  title, productId, assignedEditorId, taskType, createdBy,
  priority = 'normal', plannedDate = today(), dueDate = today(),
  plannedCreativeCount = 1, estimatedMinutes = 60,
  briefLink, sourceMaterialLink = '', deliveryLink = '', description = '',
}) {
  if (!title) throw new Error('Task behöver en titel');
  if (!briefLink) throw new Error('Task behöver en brief-länk — utan brief kan redigeraren inte leverera rätt');
  if (!findProduct(productId)) throw new Error(`Okänd produkt: ${productId}`);
  if (!findUser(assignedEditorId)) throw new Error(`Okänd redigerare: ${assignedEditorId}`);
  if (plannedCreativeCount < 0) throw new Error('plannedCreativeCount kan inte vara negativ');

  const tasks = loadTasks();
  const task = {
    id: nextTaskId(productId), title, description, productId, assignedEditorId, createdBy,
    taskType, priority, status: 'planned',
    plannedDate, startDate: null, dueDate, completedAt: null, approvedAt: null,
    estimatedMinutes, plannedCreativeCount, deliveredCreativeCount: 0,
    briefLink, sourceMaterialLink, deliveryLink,
    blockerReason: null, blockerReportedAt: null,
    currentRevision: 0, requiresManagerReview: true,
    checklist: checklistFor(taskType),
    feedbackHistory: [],
    createdAt: now(), updatedAt: now(),
  };
  tasks.push(task);
  saveTasks(tasks);
  logEvent({ taskId: task.id, userId: createdBy, type: 'task_created',
    message: `${task.title} → ${assignedEditorId}`, to: 'planned' });
  return task;
}

function mutate(taskId, userId, fn, eventFields) {
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) throw new Error(`Okänd task: ${taskId}`);
  const user = findUser(userId);
  if (!canEditTask(user, task)) {
    throw new Error(`${userId} får inte ändra ${taskId} — redigerare kan bara ändra sina egna tasks`);
  }
  const from = task.status;
  fn(task, user);
  task.updatedAt = now();
  saveTasks(tasks);
  if (eventFields) logEvent({ taskId, userId, from, to: task.status, ...eventFields });
  return task;
}

export const setStatus = (taskId, userId, to, { message = '', source = 'cli' } = {}) =>
  mutate(taskId, userId, task => {
    assertTransition(task.status, to);
    task.status = to;
    if (to === 'in_progress' && !task.startDate) task.startDate = today();
    if (to === 'blocked') task.blockerReportedAt = now();
    if (to !== 'blocked') task.blockerReason = null;
  }, { type: 'status_changed', message, source });

export const reportBlocker = (taskId, userId, reason, { needs = '', owner = '', source = 'cli' } = {}) => {
  if (!reason?.trim()) throw new Error('En blocker behöver en beskrivning');
  return mutate(taskId, userId, task => {
    assertTransition(task.status, 'blocked');
    task.status = 'blocked';
    task.blockerReason = reason;
    task.blockerReportedAt = now();
    task.blockerNeeds = needs;
    task.blockerOwner = owner;
  }, { type: 'blocker_reported', message: reason, source, meta: { needs, owner } });
};

/** Redigeraren lämnar in. Leveranslänk krävs — "klart" utan länk räknas inte. */
export const submitForReview = (taskId, userId, { deliveryLink, deliveredCreativeCount, answers = {}, source = 'cli' }) => {
  if (!deliveryLink?.trim()) throw new Error('Leveranslänk krävs för att lämna in till granskning');
  if (deliveredCreativeCount < 0) throw new Error('deliveredCreativeCount kan inte vara negativ');
  return mutate(taskId, userId, task => {
    assertTransition(task.status, 'in_review');
    task.status = 'in_review';
    task.deliveryLink = deliveryLink;
    task.deliveredCreativeCount = deliveredCreativeCount;
    task.completedAt = now();
    for (const [key, value] of Object.entries(answers)) {
      const item = task.checklist.find(c => c.key === key);
      if (!item) continue;
      item.answer = typeof value === 'string' ? value : (value ? 'yes' : 'no');
      item.passed = value === false || value === 'no' ? false : true;
      item.answeredBy = userId;
      item.answeredAt = now();
    }
  }, { type: 'submitted_for_review', message: `${deliveredCreativeCount} creatives`, source,
       meta: { deliveryLink, deliveredCreativeCount } });
};

/** Managerns granskning. approve kräver grön checklista eller override med skäl (≥10 tecken). */
export function reviewTask(taskId, reviewerId, decision, { feedback = '', override = false, overrideReason = '', source = 'cli' } = {}) {
  const reviewer = findUser(reviewerId);
  if (!canReview(reviewer)) throw new Error(`${reviewerId} får inte granska — kräver manager eller admin`);
  const tasks = loadTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) throw new Error(`Okänd task: ${taskId}`);
  const from = task.status;

  if (decision === 'approve') {
    const check = canApprove(task, { override, overrideReason });
    if (!check.ok) {
      throw new Error(
        `Kan inte godkänna ${taskId}: ${check.missing.length} obligatoriska punkter är inte gröna ` +
        `(${check.missing.map(m => m.key).join(', ')}). Använd override med motivering om du ändå vill godkänna.`);
    }
    assertTransition(from, 'approved');
    task.status = 'approved';
    task.approvedAt = now();
    if (check.overridden) {
      logEvent({ taskId, userId: reviewerId, type: 'override', message: overrideReason, source });
    }
  } else if (decision === 'changes') {
    if (!feedback.trim()) throw new Error('Ändringar krävs måste ha feedback — annars vet redigeraren inte vad som ska göras');
    assertTransition(from, 'changes');
    task.status = 'changes';
    task.currentRevision += 1;
    task.feedbackHistory.push({ round: task.currentRevision, feedback, by: reviewerId, at: now() });
    for (const c of task.checklist) { c.passed = null; c.answer = null; c.answeredAt = null; }
  } else {
    throw new Error(`Okänt beslut: ${decision} (approve|changes)`);
  }

  task.updatedAt = now();
  saveTasks(tasks);
  logEvent({ taskId, userId: reviewerId, type: 'review', message: feedback || decision,
    from, to: task.status, source, meta: { decision, override } });
  return task;
}

/** Managern svarar på en checklistpunkt vid granskning. */
export const answerChecklist = (taskId, userId, key, passed, answer = '') =>
  mutate(taskId, userId, task => {
    const item = task.checklist.find(c => c.key === key);
    if (!item) throw new Error(`Okänd checklistpunkt: ${key}`);
    item.passed = passed; item.answer = answer; item.answeredBy = userId; item.answeredAt = now();
  }, { type: 'checklist_answered', message: `${key}=${passed ? 'pass' : 'fail'}` });

export const reassign = (taskId, managerId, newEditorId) =>
  mutate(taskId, managerId, task => {
    if (!findUser(newEditorId)) throw new Error(`Okänd redigerare: ${newEditorId}`);
    task.assignedEditorId = newEditorId;
  }, { type: 'reassigned', message: `→ ${newEditorId}` });

export const setDueDate = (taskId, managerId, dueDate) =>
  mutate(taskId, managerId, task => { task.dueDate = dueDate; },
    { type: 'due_date_changed', message: dueDate });

/** Dagens plan per redigerare. Publicerad plan = det redigeraren ser i sin lista. */
export function publishDailyPlan(editorId, date, managerId, notes = '') {
  const plans = loadPlans();
  const tasks = loadTasks().filter(t => t.assignedEditorId === editorId && t.plannedDate === date);
  const existing = plans.find(p => p.editorId === editorId && p.date === date);
  const plan = existing ?? { id: `PLAN-${editorId}-${date}`, editorId, date, acknowledgedAt: null };
  plan.plannedTaskCount = tasks.length;
  plan.plannedCreativeCount = tasks.reduce((s, t) => s + t.plannedCreativeCount, 0);
  plan.managerNotes = notes;
  plan.publishedAt = now();
  if (!existing) plans.push(plan);
  savePlans(plans);
  logEvent({ userId: managerId, type: 'plan_published',
    message: `${editorId} ${date}: ${plan.plannedTaskCount} tasks / ${plan.plannedCreativeCount} creatives` });
  return plan;
}

export function submitDailyReport({ editorId, date = today(), rawMessage, summary = '', completedTaskIds = [], incompleteTaskIds = [], deliveredCreativeCount = 0, blockers = '', needsHelp = false, source = 'cli' }) {
  const reports = loadReports();
  const report = {
    id: `REP-${editorId}-${date}`, editorId, date, rawMessage, summary,
    completedTaskIds, incompleteTaskIds, deliveredCreativeCount, blockers, needsHelp,
    submittedAt: now(), reviewedAt: null, source,
  };
  const i = reports.findIndex(r => r.id === report.id);
  if (i >= 0) reports[i] = report; else reports.push(report);
  saveReports(reports);
  logEvent({ userId: editorId, type: 'daily_report', message: summary || rawMessage?.slice(0, 120), source });
  return report;
}

export { isLate };
