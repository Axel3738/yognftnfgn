// KPI:er räknas ALLTID fram ur tasks + events. Inget KPI-värde lagras.
// Kvotformeln är densamma som pipeline/quota.mjs — en enda sanning.

import { isLate, OPEN_STATUSES } from './model.mjs';

export const CYCLE_DAYS = 3;
export const HIGH_SPEND_THRESHOLD_SEK = 5000;
export const testShare = budget => (budget >= HIGH_SPEND_THRESHOLD_SEK ? 0.10 : 0.20);

/** Creatives som ska launchas per 3-dagarscykel för en produkt. */
export const quotaPerCycle = product =>
  Math.ceil((product.daily_budget_sek * testShare(product.daily_budget_sek) / product.target_cpa_sek) * CYCLE_DAYS);

export const quotaPerDay = product => quotaPerCycle(product) / CYCLE_DAYS;

const inRange = (d, from, to) => !!d && d >= from && d <= to;
const dayOf = iso => (iso ? iso.slice(0, 10) : null);
const hoursBetween = (a, b) => (new Date(b) - new Date(a)) / 36e5;

/** Filtrerar tasks som är relevanta för ett datumintervall. */
export function tasksInRange(tasks, from, to) {
  return tasks.filter(t =>
    inRange(t.plannedDate, from, to) ||
    inRange(dayOf(t.completedAt), from, to) ||
    inRange(dayOf(t.approvedAt), from, to));
}

/** KPI:er för en redigerare över ett intervall. */
export function editorKpis(tasks, events, editorId, from, to, today) {
  const mine = tasks.filter(t => t.assignedEditorId === editorId);
  const planned   = mine.filter(t => inRange(t.plannedDate, from, to));
  const delivered = mine.filter(t => inRange(dayOf(t.completedAt), from, to));
  const approved  = mine.filter(t => inRange(dayOf(t.approvedAt), from, to));

  // Leveranssäkerhet: i tid = inlämnad senast deadline.
  const withDue = delivered.filter(t => t.dueDate);
  const onTime  = withDue.filter(t => dayOf(t.completedAt) <= t.dueDate);
  const lateNow = mine.filter(t => isLate(t, today));
  const delayDays = withDue
    .filter(t => dayOf(t.completedAt) > t.dueDate)
    .map(t => (new Date(dayOf(t.completedAt)) - new Date(t.dueDate)) / 864e5);

  // Kvalitet: first-pass = godkänd utan en enda revisionsrunda.
  const firstPass = approved.filter(t => t.currentRevision === 0);
  const revised   = mine.filter(t => t.currentRevision > 0 && inRange(dayOf(t.updatedAt), from, to));
  const revRounds = approved.map(t => t.currentRevision);

  // Kommunikation: svar på check-ins och rapporter kommer ur events.
  const myEvents = events.filter(e => e.userId === editorId && inRange(dayOf(e.createdAt), from, to));
  const blockerEvents = myEvents.filter(e => e.type === 'blocker_reported');
  const reportEvents  = myEvents.filter(e => e.type === 'daily_report');

  // Genomsnittstider
  const cycleTimes = delivered.filter(t => t.startDate && t.completedAt)
    .map(t => hoursBetween(`${t.startDate}T09:00:00.000Z`, t.completedAt));
  const reviewTimes = approved.filter(t => t.completedAt && t.approvedAt)
    .map(t => hoursBetween(t.completedAt, t.approvedAt));

  const pct = (a, b) => (b === 0 ? null : Math.round((a / b) * 100));
  const avg = xs => (xs.length === 0 ? null : Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 10) / 10);

  return {
    editorId,
    // Output
    tasksPlanned: planned.length,
    tasksDelivered: delivered.length,
    tasksApproved: approved.length,
    creativesPlanned: planned.reduce((s, t) => s + t.plannedCreativeCount, 0),
    creativesDelivered: delivered.reduce((s, t) => s + t.deliveredCreativeCount, 0),
    creativesApproved: approved.reduce((s, t) => s + t.deliveredCreativeCount, 0),
    // Leveranssäkerhet
    onTimeRate: pct(onTime.length, withDue.length),
    lateTasks: lateNow.length,
    avgDelayDays: avg(delayDays),
    // Kvalitet
    firstPassRate: pct(firstPass.length, approved.length),
    revisionRate: pct(revised.length, delivered.length),
    avgRevisionRounds: avg(revRounds),
    // Kommunikation
    blockersReported: blockerEvents.length,
    reportsSubmitted: reportEvents.length,
    // Tid
    avgHoursStartToDelivery: avg(cycleTimes),
    avgHoursDeliveryToApproval: avg(reviewTimes),
    // Kontext — så KPI:er inte läses som en ranking
    openTasks: mine.filter(t => OPEN_STATUSES.includes(t.status)).length,
    avgPlannedCreativesPerTask: avg(planned.map(t => t.plannedCreativeCount)),
  };
}

/** Produktens läge mot kvoten. Godkända creatives är det som räknas. */
export function productStatus(product, tasks, from, to) {
  const mine = tasks.filter(t => t.productId === product.id);
  const approved = mine.filter(t => t.approvedAt && inRange(dayOf(t.approvedAt), from, to));
  const delivered = mine.filter(t => t.completedAt && inRange(dayOf(t.completedAt), from, to));
  const days = Math.max(1, Math.round((new Date(to) - new Date(from)) / 864e5) + 1);

  const target = Math.ceil(quotaPerDay(product) * days);
  const approvedCount = approved.reduce((s, t) => s + t.deliveredCreativeCount, 0);
  const diff = approvedCount - target;

  return {
    productId: product.id,
    name: product.name,
    targetPerCycle: quotaPerCycle(product),
    targetPerDay: Math.round(quotaPerDay(product) * 10) / 10,
    targetInRange: target,
    inBacklog: mine.filter(t => t.status === 'planned').length,
    inProduction: mine.filter(t => ['in_progress', 'blocked', 'changes'].includes(t.status)).length,
    delivered: delivered.reduce((s, t) => s + t.deliveredCreativeCount, 0),
    approved: approvedCount,
    diff,
    signal: diff >= 1 ? 'ok' : diff === 0 ? 'warn' : 'danger',
    editors: [...new Set(mine.filter(t => OPEN_STATUSES.includes(t.status)).map(t => t.assignedEditorId))],
    blockers: mine.filter(t => t.status === 'blocked').length,
  };
}

/** Managerns översikt: allt som kräver åtgärd, inte allt som är grönt. */
export function overview(tasks, events, products, from, to, today) {
  const range = tasksInRange(tasks, from, to);
  const byStatus = s => range.filter(t => t.status === s);
  const late = tasks.filter(t => isLate(t, today));

  const needsAttention = [
    ...tasks.filter(t => t.status === 'blocked').map(t => ({ kind: 'blocker', task: t,
      why: `Blocked: ${t.blockerReason ?? 'no reason given'}` })),
    ...late.map(t => ({ kind: 'late', task: t, why: `Overdue since ${t.dueDate}` })),
    ...tasks.filter(t => t.status === 'in_review').map(t => ({ kind: 'review', task: t,
      why: 'Waiting for your review' })),
  ];
  // Dedup: en task ska bara dyka upp en gång, med sitt allvarligaste skäl.
  const seen = new Set();
  const attention = needsAttention.filter(a => !seen.has(a.task.id) && seen.add(a.task.id));

  return {
    date: today, from, to,
    totalTasks: range.length,
    approved: byStatus('approved').length,
    inProgress: byStatus('in_progress').length,
    blocked: tasks.filter(t => t.status === 'blocked').length,
    late: late.length,
    inReview: tasks.filter(t => t.status === 'in_review').length,
    creativesPlanned: range.reduce((s, t) => s + t.plannedCreativeCount, 0),
    creativesDelivered: range.filter(t => t.completedAt).reduce((s, t) => s + t.deliveredCreativeCount, 0),
    creativesApproved: range.filter(t => t.approvedAt).reduce((s, t) => s + t.deliveredCreativeCount, 0),
    products: products.filter(p => p.status === 'aktiv').map(p => productStatus(p, tasks, from, to)),
    attention,
  };
}

/** Redigerare som inte lämnat slutrapport för ett datum. */
export function missingReports(team, reports, date) {
  const editors = team.users.filter(u => u.role === 'editor' && u.active);
  return editors.filter(e => !reports.some(r => r.editorId === e.id && r.date === date));
}
