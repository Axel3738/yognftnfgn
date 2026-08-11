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

/**
 * Vems bord ligger bollen på?
 *
 * Utan den här uppdelningen läses varje stillastående task som att redigeraren
 * är sen. Men en task som är inlämnad och väntar på granskning ligger inte hos
 * redigeraren alls — den ligger hos den som ska titta på den. Att blanda ihop
 * de två gör att panelen pekar åt fel håll, vilket är värre än att inte peka.
 */
const COURT = {
  'Väntar på granskning': 'reviewer',
  'Revision obesvarad': 'editor',
  'Ingen rörelse': 'editor',
  'Tilldelad men aldrig påbörjad': 'editor',
  'Saknar ansvarig': 'unassigned',
};
const courtOf = detail => COURT[detail] || (String(detail).startsWith('Deadline') ? 'editor' : 'editor');

/** Öppna tasks som ligger och skräpar just nu. Oberoende av vald period. */
function openTaskFlags(tasks, thresholds, now, workdayFor) {
  const flags = [];
  for (const t of tasks) {
    if (t.state === 'approved' || t.state === 'cancelled') continue;
    const { cfg, tz } = workdayFor(t.editor);

    const overdue = t.dueAt && toMs(t.dueAt) < now;
    if (overdue) {
      flags.push({
        kind: 'overdue', severity: 'critical', task: t.id, editor: t.editor, title: t.title,
        detail: `Deadline passerad (${localDate(t.dueAt, tz)})`,
        minutes: businessMinutes(t.dueAt, now, cfg, tz),
      });
    }

    // Högst EN aktivitetsflagga per task — annars flaggas samma sak två gånger
    // och listan fylls av dubbletter i stället för av verkliga problem.
    // (Deadline-flaggan ovan är en annan sak och får ligga kvar bredvid.)
    const lastMove = t.lastDelivery ?? t.startedAt ?? t.assignedAt;
    const idleMin = lastMove ? businessMinutes(lastMove, now, cfg, tz) : null;

    if (idleMin == null) continue;

    if (!t.editor) {
      // Ingen äger den. Att kalla det "aldrig påbörjad" pekar finger åt någon
      // som inte finns — det här är ett annat problem, och det är beställarens
      // att lösa, inte redigerarnas.
      if (idleMin >= thresholds.idleAfterBusinessHours * 60) {
        flags.push({
          kind: 'unassigned', severity: 'warning', task: t.id, editor: null, title: t.title,
          detail: 'Saknar ansvarig', minutes: idleMin,
        });
      }
    } else if (t.state === 'assigned') {
      // Ligger i inkorgen och har aldrig rört sig.
      if (idleMin >= thresholds.idleAfterBusinessHours * 60) {
        flags.push({
          kind: 'not_started', severity: 'warning', task: t.id, editor: t.editor, title: t.title,
          detail: 'Tilldelad men aldrig påbörjad', minutes: idleMin,
        });
      }
    } else if (idleMin >= thresholds.staleAfterBusinessHours * 60) {
      flags.push({
        kind: 'stale', severity: 'serious', task: t.id, editor: t.editor, title: t.title,
        detail: t.state === 'revision' ? 'Revision obesvarad'
          : t.state === 'in_review' ? 'Väntar på granskning'
          : 'Ingen rörelse',
        minutes: idleMin,
        // Importerad data: vi vet inte när statusen sattes, bara när tasken skapades.
        approximate: t.estimated === true,
      });
    }
  }
  return flags.map(f => ({ ...f, court: courtOf(f.detail) })).sort((a, b) => b.minutes - a.minutes);
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

  // Arbetsfönster per person. Teamet sitter inte i samma tidszon som kontoret:
  // mäter man alla mot Stockholm 09–18 hamnar halva deras arbetsdag utanför
  // fönstret och ledtiderna blir nonsens. Varje redigerare kan därför ha egen
  // timezone/workday i data/editors.json; saknas den används kontorets.
  const workdayByEditor = new Map(
    editors.map(e => [e.id, { cfg: e.workday || cfg, tz: e.timezone || tz }]));
  const workdayFor = id => workdayByEditor.get(id) || { cfg, tz };

  const all = rawTasks.map(t => {
    const w = workdayFor(t.editor);
    return enrichTask(t, w.cfg, w.tz);
  });

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

    const w = workdayFor(ed.id);
    const stats = aggregate(curTasks, curDel, w.cfg, config.targets, w.tz);
    const before = aggregate(prevTasks, prevDel, w.cfg, config.targets, w.tz);

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
      timezone: w.tz,
      utilisation: utilisation(stats.touchMinutes, stats.activeDays, w.cfg, w.tz, periodStart, nowMs),
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

  const flags = openTaskFlags(all, config.thresholds, nowMs, workdayFor);

  // Summering per bord: antal och hur mycket väntan som samlats där.
  const perDay = minutesPerWorkday(cfg);
  const courts = ['editor', 'reviewer', 'unassigned'].map(court => {
    const mine = flags.filter(f => f.court === court);
    return {
      court,
      count: mine.length,
      waitingDays: Math.round(mine.reduce((a, f) => a + f.minutes, 0) / perDay),
      oldestDays: mine.length ? Math.round(Math.max(...mine.map(f => f.minutes)) / perDay) : 0,
    };
  });

  // Nulägesvy: fungerar även när tidshistoriken saknas (importerad data där vi
  // vet VAD som gäller men inte NÄR det hände). Räknar allt, inte bara perioden.
  const STATE_ORDER = ['assigned', 'in_progress', 'in_review', 'revision', 'approved', 'cancelled'];
  const snapshotEditors = [...new Set(all.map(t => t.editor).filter(Boolean))].map(id => {
    const mine = all.filter(t => t.editor === id);
    const byState = Object.fromEntries(STATE_ORDER.map(s => [s, mine.filter(t => t.state === s).length]));
    const open = mine.filter(t => !['approved', 'cancelled'].includes(t.state));
    const w = workdayFor(id);
    const ages = open.map(t => businessMinutes(t.assignedAt, nowMs, w.cfg, w.tz)).filter(Number.isFinite);
    const meta = knownEditors.find(e => e.id === id);
    return {
      id,
      name: meta?.name || id,
      role: meta?.role || null,
      timezone: w.tz,
      total: mine.length,
      byState,
      open: open.length,
      oldestOpenMin: ages.length ? Math.max(...ages) : null,
      medianOpenAgeMin: median(ages),
      timedTasks: mine.filter(t => t.turnaroundMin != null).length,
    };
  }).sort((a, b) => b.total - a.total);

  const unassigned = all.filter(t => !t.editor).length;
  const snapshot = {
    editors: snapshotEditors,
    states: STATE_ORDER,
    totalTasks: all.length,
    unassigned,
    // Hur stor del av datan som faktiskt har mätbara tider. Är den låg är
    // ledtidssiffrorna inte att lita på, och det ska synas i UI:t.
    timedTasks: all.filter(t => t.turnaroundMin != null).length,
    estimatedTasks: all.filter(t => t.estimated).length,
  };

  return {
    generatedAt: new Date(nowMs).toISOString(),
    periodDays,
    timezone: tz,
    team: { ...team, previous: teamPrev, daily: teamDaily },
    snapshot,
    editors: perEditor.sort((a, b) => b.stats.deliveries - a.stats.deliveries),
    flags,
    courts,
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
