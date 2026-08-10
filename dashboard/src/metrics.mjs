// Beräknar allt dashboarden visar. Ren funktion in/ut — inga filer, ingen I/O.

import { businessMinutes, localDate, dateRange, minutesPerWorkday, toMs } from './time.mjs';

export function median(xs) {
  const v = xs.filter(Number.isFinite).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = v.length >> 1;
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

export function percentile(xs, p) {
  const v = xs.filter(Number.isFinite).sort((a, b) => a - b);
  if (!v.length) return null;
  const idx = (v.length - 1) * p;
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? v[lo] : v[lo] + (v[hi] - v[lo]) * (idx - lo);
}

function mean(xs) {
  const v = xs.filter(Number.isFinite);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function ratio(num, den) {
  return den > 0 ? num / den : null;
}

/**
 * Härleder tidsmått per task. Allt i arbetsminuter.
 *
 *   pickupMin     tilldelad → påbörjad        (hur snabbt de ens sätter igång)
 *   firstPassMin  påbörjad → första leverans  (ren handpåläggning)
 *   turnaroundMin tilldelad → första leverans (vad beställaren upplever)
 *   cycleMin      tilldelad → godkänd         (hela loppet inkl. revisioner)
 *   revisionMins  varje revisionsbegäran → nästa leverans
 */
export function enrichTask(task, cfg, tz) {
  const firstDelivery = task.deliveries[0]?.ts ?? null;
  const lastDelivery = task.deliveries.at(-1)?.ts ?? null;

  const pickupMin = task.assignedAt && task.startedAt
    ? businessMinutes(task.assignedAt, task.startedAt, cfg, tz) : null;
  const firstPassMin = task.startedAt && firstDelivery
    ? businessMinutes(task.startedAt, firstDelivery, cfg, tz) : null;
  const turnaroundMin = task.assignedAt && firstDelivery
    ? businessMinutes(task.assignedAt, firstDelivery, cfg, tz) : null;
  const cycleMin = task.assignedAt && task.approvedAt
    ? businessMinutes(task.assignedAt, task.approvedAt, cfg, tz) : null;

  const revisionMins = task.revisions
    .filter(r => r.deliveredAt)
    .map(r => businessMinutes(r.requestedAt, r.deliveredAt, cfg, tz));

  // Uppskattad handpåläggning: första passet + varje revisionspass.
  const touchMin = (firstPassMin ?? 0) + revisionMins.reduce((a, b) => a + b, 0);

  const onTime = task.dueAt && task.approvedAt
    ? toMs(task.approvedAt) <= toMs(task.dueAt) : null;

  return {
    ...task,
    firstDelivery,
    lastDelivery,
    pickupMin,
    firstPassMin,
    turnaroundMin,
    cycleMin,
    revisionMins,
    revisionCount: task.revisions.length,
    openRevision: task.revisions.some(r => !r.deliveredAt),
    touchMin,
    onTime,
    firstPass: task.revisions.length === 0,
  };
}

/** Öppna tasks som ligger och skräpar just nu. Oberoende av vald period. */
function openTaskFlags(tasks, cfg, thresholds, tz, now) {
  const flags = [];
  for (const t of tasks) {
    if (t.state === 'approved' || t.state === 'cancelled') continue;

    const overdue = t.dueAt && toMs(t.dueAt) < now;
    if (overdue) {
      flags.push({
        kind: 'overdue', severity: 'critical', task: t.id, editor: t.editor, title: t.title,
        detail: `Deadline passerad (${localDate(t.dueAt, tz)})`,
        minutes: businessMinutes(t.dueAt, now, cfg, tz),
      });
    }

    // Tilldelad men aldrig påbörjad.
    if (t.assignedAt && !t.startedAt) {
      const idle = businessMinutes(t.assignedAt, now, cfg, tz);
      if (idle >= thresholds.idleAfterBusinessHours * 60) {
        flags.push({
          kind: 'not_started', severity: 'warning', task: t.id, editor: t.editor, title: t.title,
          detail: 'Tilldelad men aldrig påbörjad', minutes: idle,
        });
      }
    }

    // Påbörjad men inget levererat på länge.
    const lastMove = t.lastDelivery ?? t.startedAt ?? t.assignedAt;
    if (lastMove) {
      const stale = businessMinutes(lastMove, now, cfg, tz);
      if (stale >= thresholds.staleAfterBusinessHours * 60 && t.state !== 'assigned') {
        flags.push({
          kind: 'stale', severity: 'serious', task: t.id, editor: t.editor, title: t.title,
          detail: t.state === 'revision' ? 'Revision obesvarad' : 'Ingen rörelse',
          minutes: stale,
        });
      }
    }
  }
  return flags.sort((a, b) => b.minutes - a.minutes);
}

/** Aggregerar en uppsättning tasks till nyckeltal. */
function aggregate(tasks, deliveriesInPeriod, cfg, targets, tz) {
  const approved = tasks.filter(t => t.approvedAt);
  const withRevisionData = tasks.filter(t => t.deliveries.length > 0);

  const turnarounds = tasks.map(t => t.turnaroundMin).filter(Number.isFinite);
  const revisionMins = tasks.flatMap(t => t.revisionMins);
  const pickups = tasks.map(t => t.pickupMin).filter(Number.isFinite);

  const revisionTasks = withRevisionData.filter(t => t.revisionCount > 0);
  const onTimeJudged = tasks.filter(t => t.onTime !== null);

  const activeDays = new Set(deliveriesInPeriod.map(d => d.date)).size;
  const totalDeliveries = deliveriesInPeriod.length;
  const reworkDeliveries = deliveriesInPeriod.filter(d => d.round > 1).length;

  const touch = tasks.map(t => t.touchMin).filter(x => Number.isFinite(x) && x > 0);
  const perDay = minutesPerWorkday(cfg);

  return {
    tasks: tasks.length,
    approved: approved.length,
    deliveries: totalDeliveries,
    reworkDeliveries,
    activeDays,

    medianTurnaround: median(turnarounds),
    p90Turnaround: percentile(turnarounds, 0.9),
    medianRevisionTurnaround: median(revisionMins),
    medianPickup: median(pickups),

    revisionRate: ratio(revisionTasks.length, withRevisionData.length),
    avgRevisionsPerTask: mean(withRevisionData.map(t => t.revisionCount)),
    firstPassRate: ratio(withRevisionData.filter(t => t.revisionCount === 0).length, withRevisionData.length),
    reworkShare: ratio(reworkDeliveries, totalDeliveries),
    onTimeRate: onTimeJudged.length ? ratio(onTimeJudged.filter(t => t.onTime).length, onTimeJudged.length) : null,

    deliveriesPerActiveDay: ratio(totalDeliveries, activeDays),
    touchMinutes: touch.reduce((a, b) => a + b, 0),
    touchDays: touch.reduce((a, b) => a + b, 0) / perDay,

    hitsTarget: {
      turnaround: median(turnarounds) != null && median(turnarounds) <= targets.turnaroundHours * 60,
      revisionRate: ratio(revisionTasks.length, withRevisionData.length) != null
        && ratio(revisionTasks.length, withRevisionData.length) <= targets.revisionRate,
      pickup: median(pickups) != null && median(pickups) <= targets.pickupHours * 60,
    },
  };
}

/**
 * Beläggningsgrad: hur stor del av tillgänglig arbetstid som täcks av
 * uppskattad handpåläggning. Grovt mått — men det är det närmaste svaret på
 * "jobbar de egentligen?" som går att få ur en task-logg utan tidrapportering.
 * Loggas som uppskattning i UI:t, aldrig som fakta.
 */
function utilisation(touchMinutes, days, cfg, tz, from, to) {
  const workdays = dateRange(from, to, tz).filter(d => {
    const wd = new Date(`${d}T12:00:00Z`).getUTCDay();
    return cfg.days.includes(wd);
  }).length;
  const capacity = workdays * minutesPerWorkday(cfg);
  return capacity > 0 ? touchMinutes / capacity : null;
}

/**
 * Huvudingången.
 *
 * Periodfiltret gäller LEVERANSER (inte tilldelningar) — en task räknas till
 * den period redigeraren faktiskt gjorde jobbet i, annars flyttar historiken
 * på sig varje gång någon godkänner något gammalt.
 */
export function computeMetrics({ tasks: rawTasks, config, periodDays, now = Date.now(), editors = [] }) {
  const tz = config.timezone;
  const cfg = config.workday;
  const nowMs = toMs(now);

  const all = rawTasks.map(t => enrichTask(t, cfg, tz));

  const periodStart = nowMs - periodDays * 86_400_000;
  const prevStart = nowMs - 2 * periodDays * 86_400_000;

  const deliveriesOf = (task, from, to) => task.deliveries
    .filter(d => toMs(d.ts) >= from && toMs(d.ts) <= to)
    .map(d => ({ ...d, date: localDate(d.ts, tz), editor: task.editor, task: task.id }));

  const inWindow = (from, to) => {
    const deliveries = all.flatMap(t => deliveriesOf(t, from, to));
    const touched = new Set(deliveries.map(d => d.task));
    const tasks = all.filter(t => touched.has(t.id));
    return { tasks, deliveries };
  };

  const cur = inWindow(periodStart, nowMs);
  const prev = inWindow(prevStart, periodStart);

  const knownEditors = editors.length
    ? editors
    : [...new Set(all.map(t => t.editor).filter(Boolean))].map(id => ({ id, name: id }));

  const perEditor = knownEditors.map(ed => {
    const curTasks = cur.tasks.filter(t => t.editor === ed.id);
    const curDel = cur.deliveries.filter(d => d.editor === ed.id);
    const prevTasks = prev.tasks.filter(t => t.editor === ed.id);
    const prevDel = prev.deliveries.filter(d => d.editor === ed.id);

    const stats = aggregate(curTasks, curDel, cfg, config.targets, tz);
    const before = aggregate(prevTasks, prevDel, cfg, config.targets, tz);

    const open = all.filter(t => t.editor === ed.id && !['approved', 'cancelled'].includes(t.state));

    // Daglig serie — nollor inkluderade, annars ser tomma dagar ut som luckor.
    const days = dateRange(periodStart, nowMs, tz);
    const byDate = new Map();
    for (const d of curDel) byDate.set(d.date, (byDate.get(d.date) || 0) + 1);
    const daily = days.map(date => ({ date, count: byDate.get(date) || 0 }));

    return {
      ...ed,
      stats,
      previous: before,
      daily,
      wip: open.length,
      openTasks: open.map(t => ({
        id: t.id, title: t.title, state: t.state, dueAt: t.dueAt,
        revisionCount: t.revisionCount,
      })),
      utilisation: utilisation(stats.touchMinutes, stats.activeDays, cfg, tz, periodStart, nowMs),
      delta: {
        deliveries: before.deliveries ? (stats.deliveries - before.deliveries) / before.deliveries : null,
        medianTurnaround: before.medianTurnaround && stats.medianTurnaround
          ? (stats.medianTurnaround - before.medianTurnaround) / before.medianTurnaround : null,
        revisionRate: before.revisionRate != null && stats.revisionRate != null
          ? stats.revisionRate - before.revisionRate : null,
      },
    };
  }).filter(e => e.stats.deliveries > 0 || e.wip > 0);

  const team = aggregate(cur.tasks, cur.deliveries, cfg, config.targets, tz);
  const teamPrev = aggregate(prev.tasks, prev.deliveries, cfg, config.targets, tz);

  const days = dateRange(periodStart, nowMs, tz);
  const teamDaily = days.map(date => {
    const row = { date, total: 0 };
    for (const ed of perEditor) row[ed.id] = 0;
    return row;
  });
  const dayIndex = new Map(teamDaily.map((r, i) => [r.date, i]));
  for (const d of cur.deliveries) {
    const i = dayIndex.get(d.date);
    if (i == null || !d.editor) continue;
    if (teamDaily[i][d.editor] == null) continue;
    teamDaily[i][d.editor] += 1;
    teamDaily[i].total += 1;
  }

  const flags = openTaskFlags(all, cfg, config.thresholds, tz, nowMs);

  return {
    generatedAt: new Date(nowMs).toISOString(),
    periodDays,
    timezone: tz,
    team: { ...team, previous: teamPrev, daily: teamDaily },
    editors: perEditor.sort((a, b) => b.stats.deliveries - a.stats.deliveries),
    flags,
    tasks: cur.tasks.map(t => ({
      id: t.id, title: t.title, editor: t.editor, type: t.type, state: t.state,
      assignedAt: t.assignedAt, firstDelivery: t.firstDelivery, approvedAt: t.approvedAt,
      dueAt: t.dueAt, turnaroundMin: t.turnaroundMin, cycleMin: t.cycleMin,
      revisionCount: t.revisionCount, onTime: t.onTime, touchMin: t.touchMin,
    })).sort((a, b) => toMs(b.firstDelivery ?? 0) - toMs(a.firstDelivery ?? 0)),
    targets: config.targets,
    thresholds: config.thresholds,
  };
}

/** Statusfärg för revisionsgrad. Tröskelbaserat, inte relativt — annars blir det mobbning av den sämsta. */
export function revisionSeverity(rate, thresholds) {
  if (rate == null) return 'unknown';
  if (rate >= thresholds.revisionRateCritical) return 'critical';
  if (rate >= thresholds.revisionRateWarning) return 'warning';
  return 'good';
}
