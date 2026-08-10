/**
 * Metrikmotorn. Läser eventloggen, bygger tasks med bollhistorik och räknar
 * ut per redigerare och för teamet.
 *
 * Tre principer som gör siffrorna hållbara:
 *
 *  1. ARBETSTID, inte väggklocka. Nätter, helger och röda dagar räknas inte.
 *  2. MEDIAN + p90, inte medelvärde. Ett enda monsterjobb ska inte döma ut någon.
 *  3. BOLLEN. Varje task-period tillhör antingen redigeraren eller granskaren.
 *     "Tog 4 dagar" betyder inget om 3 av dem var vi som inte tittade på den.
 *
 * Plus rättvisan: en revision som beror på otydlig brief eller att vi ändrade
 * oss räknas INTE mot redigeraren (`attributableRevisionRate`). Annars mäter
 * dashboarden hur ostabila beställarna är och skyller det på redigeraren.
 */

import { WorkCalendar, localDate } from './worktime.mjs';
import {
  median,
  quantile,
  mean,
  sum,
  round,
  ratio,
  addDays,
  eachDay,
  isoWeek,
  weekStart,
} from './util.mjs';

const OPEN_STATES = new Set(['assigned', 'in_progress', 'revision', 'in_review']);

/* ------------------------------------------------------------------ */
/* Steg 1: eventlogg → tasks + redigerare                              */
/* ------------------------------------------------------------------ */

export function buildState(events, config = {}, { now = new Date() } = {}) {
  const cal = new WorkCalendar(config);
  const weights = config.complexityWeights || { S: 1, M: 2, L: 4, XL: 8 };
  const reasons = config.revisionReasons || {};

  const editors = new Map();
  const tasks = new Map();
  const workLog = [];

  const ensureEditor = (id) => {
    if (!id) return null;
    if (!editors.has(id)) {
      editors.set(id, {
        id,
        name: id,
        slackUserId: null,
        role: null,
        capacityHoursPerDay: null,
        active: true,
      });
    }
    return editors.get(id);
  };

  const ensureTask = (id) => {
    if (!tasks.has(id)) {
      tasks.set(id, {
        id,
        title: id,
        brand: null,
        kind: 'other',
        complexity: 'M',
        createdAt: null,
        assignedAt: null,
        editorId: null,
        startedAt: null,
        dueAt: null,
        deliveries: [],
        revisions: [],
        approvedAt: null,
        cancelledAt: null,
        loggedMinutes: 0,
        segments: [],
        events: [],
      });
    }
    return tasks.get(id);
  };

  // Bollhistorik: vem "äger" tasken just nu.
  const closeSegment = (task, at) => {
    const open = task.segments[task.segments.length - 1];
    if (open && !open.end) open.end = at;
  };
  const openSegment = (task, owner, at) => {
    closeSegment(task, at);
    task.segments.push({ owner, start: at, end: null });
  };

  for (const event of events) {
    switch (event.type) {
      case 'editor_added': {
        const editor = ensureEditor(event.editorId);
        editor.name = event.name ?? editor.name;
        if (event.slackUserId !== undefined) editor.slackUserId = event.slackUserId;
        if (event.role !== undefined) editor.role = event.role;
        if (event.capacityHoursPerDay !== undefined) {
          editor.capacityHoursPerDay = event.capacityHoursPerDay;
        }
        if (event.active !== undefined) editor.active = Boolean(event.active);
        break;
      }
      case 'task_created': {
        const task = ensureTask(event.taskId);
        task.createdAt = event.ts;
        if (event.title) task.title = event.title;
        if (event.brand) task.brand = event.brand;
        if (event.kind) task.kind = event.kind;
        if (event.complexity) task.complexity = event.complexity;
        if (event.dueAt) task.dueAt = event.dueAt;
        if (event.briefUrl) task.briefUrl = event.briefUrl;
        if (event.requestedBy) task.requestedBy = event.requestedBy;
        task.events.push(event);
        break;
      }
      case 'task_assigned': {
        const task = ensureTask(event.taskId);
        ensureEditor(event.editorId);
        task.editorId = event.editorId;
        if (!task.assignedAt) task.assignedAt = event.ts;
        task.reassignedAt = task.assignedAt === event.ts ? null : event.ts;
        if (event.dueAt) task.dueAt = event.dueAt;
        openSegment(task, 'editor', event.ts);
        task.events.push(event);
        break;
      }
      case 'task_started': {
        const task = ensureTask(event.taskId);
        if (!task.startedAt) task.startedAt = event.ts;
        task.events.push(event);
        break;
      }
      case 'task_delivered': {
        const task = ensureTask(event.taskId);
        const roundNo = event.round ?? task.revisions.length + 1;
        task.deliveries.push({
          at: event.ts,
          round: roundNo,
          editorId: event.editorId || task.editorId,
          assetUrl: event.assetUrl || null,
        });
        // Stäng revisionen som den här leveransen svarar på.
        const openRevision = [...task.revisions].reverse().find((r) => !r.closedAt);
        if (openRevision) {
          openRevision.closedAt = event.ts;
          openRevision.turnaroundHours = cal.hoursBetween(openRevision.at, event.ts);
        }
        openSegment(task, 'reviewer', event.ts);
        task.events.push(event);
        break;
      }
      case 'revision_requested': {
        const task = ensureTask(event.taskId);
        const reason = event.reason || 'quality';
        const spec = reasons[reason];
        task.revisions.push({
          at: event.ts,
          round: event.round ?? task.deliveries.length,
          reason,
          // Okänd orsak behandlas som redigerarens — annars kan man tvätta bort
          // all rework genom att slarva med reason-fältet.
          attributable: spec ? spec.attributable !== false : true,
          reviewerId: event.reviewerId || null,
          notes: event.notes || null,
          closedAt: null,
          turnaroundHours: null,
        });
        openSegment(task, 'editor', event.ts);
        task.events.push(event);
        break;
      }
      case 'task_approved': {
        const task = ensureTask(event.taskId);
        task.approvedAt = event.ts;
        closeSegment(task, event.ts);
        task.events.push(event);
        break;
      }
      case 'task_cancelled': {
        const task = ensureTask(event.taskId);
        task.cancelledAt = event.ts;
        task.cancelReason = event.reason || null;
        closeSegment(task, event.ts);
        task.events.push(event);
        break;
      }
      case 'work_logged': {
        ensureEditor(event.editorId);
        const entry = {
          editorId: event.editorId,
          taskId: event.taskId || null,
          minutes: event.minutes,
          date: event.date || localDate(event.ts, cal.timezone),
          ts: event.ts,
        };
        workLog.push(entry);
        if (entry.taskId) ensureTask(entry.taskId).loggedMinutes += entry.minutes;
        break;
      }
      default:
        break;
    }
  }

  const nowIso = (now instanceof Date ? now : new Date(now)).toISOString();

  for (const task of tasks.values()) {
    task.weight = weights[task.complexity] ?? 1;
    task.rounds = task.revisions.length;
    task.attributableRounds = task.revisions.filter((r) => r.attributable).length;
    task.firstDeliveryAt = task.deliveries.length ? task.deliveries[0].at : null;
    task.lastDeliveryAt = task.deliveries.length
      ? task.deliveries[task.deliveries.length - 1].at
      : null;

    task.state = deriveState(task);
    task.open = OPEN_STATES.has(task.state);

    // Ledtider (arbetstimmar).
    task.timeToFirstDeliveryHours =
      task.assignedAt && task.firstDeliveryAt
        ? cal.hoursBetween(task.assignedAt, task.firstDeliveryAt)
        : null;
    task.pickupDelayHours =
      task.assignedAt && task.startedAt ? cal.hoursBetween(task.assignedAt, task.startedAt) : null;
    task.totalCycleHours =
      task.assignedAt && task.approvedAt ? cal.hoursBetween(task.assignedAt, task.approvedAt) : null;

    const closedRevisions = task.revisions.filter((r) => r.turnaroundHours !== null);
    task.revisionTurnaroundHours = closedRevisions.map((r) => r.turnaroundHours);

    // Bollen: redigerartid vs vår granskningstid.
    let handsOn = 0;
    let reviewWait = 0;
    for (const seg of task.segments) {
      const end = seg.end || nowIso;
      const hours = cal.hoursBetween(seg.start, end) || 0;
      if (seg.owner === 'editor') handsOn += hours;
      else reviewWait += hours;
    }
    task.handsOnHours = handsOn;
    task.reviewWaitHours = reviewWait;

    const openSeg = task.segments[task.segments.length - 1];
    task.currentOwner = openSeg && !openSeg.end ? openSeg.owner : null;
    task.waitingSince = openSeg && !openSeg.end ? openSeg.start : null;
    task.waitingHours =
      task.waitingSince !== null ? cal.hoursBetween(task.waitingSince, nowIso) : null;

    task.onTime =
      task.dueAt && task.approvedAt ? new Date(task.approvedAt) <= new Date(task.dueAt) : null;
    task.overdue = Boolean(
      task.open && task.dueAt && new Date(nowIso) > new Date(task.dueAt),
    );

    // Fick tasken en dom på första leveransen? (för first-pass-rate)
    task.firstVerdict =
      task.rounds > 0 ? 'revision' : task.approvedAt ? 'approved' : null;

    // Faktisk arbetad tid vs tid med bollen — säger om någon är långsam
    // eller bara sitter med tasken utan att röra den.
    task.touchRatio =
      task.loggedMinutes > 0 && handsOn > 0 ? task.loggedMinutes / 60 / handsOn : null;
  }

  return { editors, tasks, workLog, calendar: cal, config, now: nowIso };
}

function deriveState(task) {
  if (task.cancelledAt) return 'cancelled';
  if (task.approvedAt) return 'approved';
  if (!task.assignedAt) return 'unassigned';
  const lastDelivery = task.lastDeliveryAt;
  const lastRevision = task.revisions.length ? task.revisions[task.revisions.length - 1].at : null;
  if (lastDelivery && (!lastRevision || lastDelivery > lastRevision)) return 'in_review';
  if (lastRevision) return 'revision';
  return task.startedAt ? 'in_progress' : 'assigned';
}

/* ------------------------------------------------------------------ */
/* Steg 2: tasks → rapport för en period                               */
/* ------------------------------------------------------------------ */

export function computeReport(events, config = {}, options = {}) {
  const now = options.now ? new Date(options.now) : new Date();
  const state = buildState(events, config, { now });
  const cal = state.calendar;
  const tz = cal.timezone;

  const to = options.to || localDate(now, tz);
  const from = options.from || addDays(to, -29);
  const days = eachDay(from, to);
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(days.length - 1));

  const inRange = (iso, a, b) => iso >= a && iso <= b;
  const dayOf = (ts) => localDate(ts, tz);

  const allTasks = [...state.tasks.values()];
  const filtered = allTasks.filter((t) => {
    if (options.brand && t.brand !== options.brand) return false;
    if (options.kind && t.kind !== options.kind) return false;
    return true;
  });

  const buildSlice = (a, b) => {
    const perEditor = new Map();
    const ensure = (editorId) => {
      if (!editorId) return null;
      if (!perEditor.has(editorId)) {
        perEditor.set(editorId, {
          editorId,
          deliveries: [],
          firstDeliveries: [],
          reworkDeliveries: [],
          approvedTasks: [],
          ttfd: [],
          pickup: [],
          revisionTurnaround: [],
          cycle: [],
          handsOn: [],
          reviewedTasks: [],
          revisedTasks: [],
          attributableRevisedTasks: [],
          revisionReasons: new Map(),
          loggedMinutes: 0,
          activeDays: new Set(),
          onTime: [],
          touchRatios: [],
        });
      }
      return perEditor.get(editorId);
    };

    for (const task of filtered) {
      const editorId = task.editorId;
      if (!editorId) continue;
      const bucket = ensure(editorId);

      for (const delivery of task.deliveries) {
        const day = dayOf(delivery.at);
        if (!inRange(day, a, b)) continue;
        bucket.deliveries.push({ task, delivery, day });
        bucket.activeDays.add(day);
        if (delivery.round === 1) {
          bucket.firstDeliveries.push({ task, day });
          if (task.timeToFirstDeliveryHours !== null) bucket.ttfd.push(task.timeToFirstDeliveryHours);
          if (task.pickupDelayHours !== null) bucket.pickup.push(task.pickupDelayHours);
        } else {
          bucket.reworkDeliveries.push({ task, day });
        }
      }

      for (const revision of task.revisions) {
        if (revision.closedAt && inRange(dayOf(revision.closedAt), a, b)) {
          if (revision.turnaroundHours !== null) bucket.revisionTurnaround.push(revision.turnaroundHours);
        }
      }

      if (task.approvedAt && inRange(dayOf(task.approvedAt), a, b)) {
        bucket.approvedTasks.push(task);
        if (task.totalCycleHours !== null) bucket.cycle.push(task.totalCycleHours);
        if (task.handsOnHours !== null) bucket.handsOn.push(task.handsOnHours);
        if (task.onTime !== null) bucket.onTime.push(task.onTime);
        if (task.touchRatio !== null) bucket.touchRatios.push(task.touchRatio);
      }

      // Revisionsgrad mäts på tasks vars FÖRSTA leverans föll i perioden och
      // som hunnit få en dom. Odömda hamnar i "pending" istället för att
      // tyst räknas som godkända.
      if (task.firstDeliveryAt && inRange(dayOf(task.firstDeliveryAt), a, b) && task.firstVerdict) {
        bucket.reviewedTasks.push(task);
        if (task.rounds > 0) bucket.revisedTasks.push(task);
        if (task.attributableRounds > 0) bucket.attributableRevisedTasks.push(task);
        for (const revision of task.revisions) {
          bucket.revisionReasons.set(
            revision.reason,
            (bucket.revisionReasons.get(revision.reason) || 0) + 1,
          );
        }
      }
    }

    for (const entry of state.workLog) {
      if (!inRange(entry.date, a, b)) continue;
      const bucket = ensure(entry.editorId);
      if (!bucket) continue;
      bucket.loggedMinutes += entry.minutes;
      if (entry.minutes > 0) bucket.activeDays.add(entry.date);
    }

    return perEditor;
  };

  const workdays = cal.workdaysBetween(from, to);
  const current = buildSlice(from, to);
  const previous = buildSlice(prevFrom, prevTo);

  const summarize = (bucket) => {
    if (!bucket) return null;
    const outputPoints = sum(bucket.firstDeliveries.map((d) => d.task.weight));
    const approvedPoints = sum(bucket.approvedTasks.map((t) => t.weight));
    const reviewed = bucket.reviewedTasks.length;
    const capacityHours = null; // fylls i av anroparen (behöver editor-config)
    return {
      outputPoints: round(outputPoints, 1),
      approvedPoints: round(approvedPoints, 1),
      tasksDelivered: bucket.firstDeliveries.length,
      tasksApproved: bucket.approvedTasks.length,
      deliveriesTotal: bucket.deliveries.length,
      reworkDeliveries: bucket.reworkDeliveries.length,
      reworkShare: round(ratio(bucket.reworkDeliveries.length, bucket.deliveries.length), 3),
      medianTimeToFirstDeliveryHours: round(median(bucket.ttfd), 2),
      p90TimeToFirstDeliveryHours: round(quantile(bucket.ttfd, 0.9), 2),
      medianPickupDelayHours: round(median(bucket.pickup), 2),
      medianRevisionTurnaroundHours: round(median(bucket.revisionTurnaround), 2),
      p90RevisionTurnaroundHours: round(quantile(bucket.revisionTurnaround, 0.9), 2),
      medianCycleHours: round(median(bucket.cycle), 2),
      medianHandsOnHours: round(median(bucket.handsOn), 2),
      revisionRate: round(ratio(bucket.revisedTasks.length, reviewed), 3),
      attributableRevisionRate: round(ratio(bucket.attributableRevisedTasks.length, reviewed), 3),
      firstPassRate: reviewed ? round(1 - bucket.revisedTasks.length / reviewed, 3) : null,
      avgRounds: round(mean(bucket.reviewedTasks.map((t) => t.rounds)), 2),
      reviewedTasks: reviewed,
      onTimeRate: bucket.onTime.length
        ? round(bucket.onTime.filter(Boolean).length / bucket.onTime.length, 3)
        : null,
      onTimeSample: bucket.onTime.length,
      loggedHours: round(bucket.loggedMinutes / 60, 1),
      activeDays: bucket.activeDays.size,
      outputPerActiveDay: bucket.activeDays.size
        ? round(outputPoints / bucket.activeDays.size, 2)
        : null,
      medianTouchRatio: round(median(bucket.touchRatios), 2),
      capacityHours,
      revisionReasons: Object.fromEntries(bucket.revisionReasons),
    };
  };

  const editorIds = new Set([...state.editors.keys(), ...current.keys()]);
  const editorRows = [];
  for (const editorId of editorIds) {
    const editorInfo = state.editors.get(editorId) || { id: editorId, name: editorId };
    if (options.editorId && editorId !== options.editorId) continue;
    const kpis = summarize(current.get(editorId)) || summarize(emptyBucket(editorId));
    const prev = summarize(previous.get(editorId)) || summarize(emptyBucket(editorId));

    const capacityPerDay = editorInfo.capacityHoursPerDay ?? cal.hoursPerDay;
    kpis.capacityHours = round(capacityPerDay * workdays, 1);
    kpis.utilization =
      kpis.loggedHours > 0 && kpis.capacityHours ? round(kpis.loggedHours / kpis.capacityHours, 3) : null;

    const open = filtered.filter((t) => t.open && t.editorId === editorId);
    editorRows.push({
      id: editorId,
      name: editorInfo.name || editorId,
      slackUserId: editorInfo.slackUserId || null,
      role: editorInfo.role || null,
      active: editorInfo.active !== false,
      capacityHoursPerDay: round(capacityPerDay, 2),
      kpis,
      previous: prev,
      delta: deltaOf(kpis, prev),
      wip: open.length,
      wipPoints: round(sum(open.map((t) => t.weight)), 1),
      overdue: open.filter((t) => t.overdue).length,
      sampleWarning: kpis.reviewedTasks < (config.minSample ?? 5),
    });
  }

  editorRows.sort((a, b) => (b.kpis.outputPoints || 0) - (a.kpis.outputPoints || 0));

  /* --- Team ------------------------------------------------------- */
  const teamBucket = mergeBuckets([...current.values()]);
  const teamPrevBucket = mergeBuckets([...previous.values()]);
  const team = summarize(teamBucket);
  const teamPrev = summarize(teamPrevBucket);
  const activeEditors = editorRows.filter((r) => r.active).length || 1;
  team.capacityHours = round(
    sum(editorRows.filter((r) => r.active).map((r) => r.capacityHoursPerDay * workdays)),
    1,
  );
  team.utilization =
    team.loggedHours > 0 && team.capacityHours ? round(team.loggedHours / team.capacityHours, 3) : null;

  const openTasks = filtered.filter((t) => t.open);

  /* --- Tidsserier -------------------------------------------------- */
  const dailyIndex = new Map(days.map((d) => [d, { date: d, byEditor: {}, points: 0, rework: 0, deliveries: 0 }]));
  for (const [editorId, bucket] of current) {
    for (const { task, day } of bucket.firstDeliveries) {
      const row = dailyIndex.get(day);
      if (!row) continue;
      row.byEditor[editorId] = round((row.byEditor[editorId] || 0) + task.weight, 1);
      row.points = round(row.points + task.weight, 1);
      row.deliveries += 1;
    }
    for (const { day } of bucket.reworkDeliveries) {
      const row = dailyIndex.get(day);
      if (!row) continue;
      row.rework += 1;
      row.deliveries += 1;
    }
  }
  const daily = days.map((d) => ({ ...dailyIndex.get(d), workday: cal.isWorkingDay(d) }));

  const weeklyMap = new Map();
  for (const [editorId, bucket] of current) {
    for (const { task, day } of bucket.firstDeliveries) {
      const key = weekStart(day);
      if (!weeklyMap.has(key)) weeklyMap.set(key, { week: isoWeek(day), weekStart: key, values: new Map() });
      const row = weeklyMap.get(key);
      if (!row.values.has(editorId)) row.values.set(editorId, []);
      if (task.timeToFirstDeliveryHours !== null) {
        row.values.get(editorId).push(task.timeToFirstDeliveryHours);
      }
    }
  }
  const weekly = [...weeklyMap.values()]
    .sort((a, b) => (a.weekStart < b.weekStart ? -1 : 1))
    .map((row) => ({
      week: row.week,
      weekStart: row.weekStart,
      byEditor: Object.fromEntries(
        [...row.values].map(([editorId, values]) => [editorId, round(median(values), 2)]),
      ),
      team: round(median([...row.values.values()].flat()), 2),
    }));

  /* --- Revisionsorsaker (vem äger problemet?) ---------------------- */
  const reasonTotals = new Map();
  for (const bucket of current.values()) {
    for (const [reason, count] of bucket.revisionReasons) {
      reasonTotals.set(reason, (reasonTotals.get(reason) || 0) + count);
    }
  }
  const reasonSpec = config.revisionReasons || {};
  const revisionReasons = [...reasonTotals]
    .map(([reason, count]) => ({
      reason,
      label: reasonSpec[reason]?.label || reason,
      attributable: reasonSpec[reason]?.attributable !== false,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    generatedAt: new Date().toISOString(),
    range: {
      from,
      to,
      days: days.length,
      workdays,
      timezone: tz,
      hoursPerDay: round(cal.hoursPerDay, 2),
    },
    previousRange: { from: prevFrom, to: prevTo },
    targets: config.targets || {},
    minSample: config.minSample ?? 5,
    team: { kpis: team, previous: teamPrev, delta: deltaOf(team, teamPrev), editors: activeEditors },
    editors: editorRows,
    daily,
    weekly,
    revisionReasons,
    queue: buildQueue(openTasks, state, config),
    filters: {
      brands: [...new Set(allTasks.map((t) => t.brand).filter(Boolean))].sort(),
      kinds: [...new Set(allTasks.map((t) => t.kind).filter(Boolean))].sort(),
    },
    insights: buildInsights(editorRows, team, config),
    dataQuality: buildDataQuality(filtered, editorRows, state, config, { from, to }),
  };
}

function emptyBucket(editorId) {
  return {
    editorId,
    deliveries: [],
    firstDeliveries: [],
    reworkDeliveries: [],
    approvedTasks: [],
    ttfd: [],
    pickup: [],
    revisionTurnaround: [],
    cycle: [],
    handsOn: [],
    reviewedTasks: [],
    revisedTasks: [],
    attributableRevisedTasks: [],
    revisionReasons: new Map(),
    loggedMinutes: 0,
    activeDays: new Set(),
    onTime: [],
    touchRatios: [],
  };
}

function mergeBuckets(buckets) {
  const merged = emptyBucket('__team__');
  for (const b of buckets) {
    merged.deliveries.push(...b.deliveries);
    merged.firstDeliveries.push(...b.firstDeliveries);
    merged.reworkDeliveries.push(...b.reworkDeliveries);
    merged.approvedTasks.push(...b.approvedTasks);
    merged.ttfd.push(...b.ttfd);
    merged.pickup.push(...b.pickup);
    merged.revisionTurnaround.push(...b.revisionTurnaround);
    merged.cycle.push(...b.cycle);
    merged.handsOn.push(...b.handsOn);
    merged.reviewedTasks.push(...b.reviewedTasks);
    merged.revisedTasks.push(...b.revisedTasks);
    merged.attributableRevisedTasks.push(...b.attributableRevisedTasks);
    merged.onTime.push(...b.onTime);
    merged.touchRatios.push(...b.touchRatios);
    merged.loggedMinutes += b.loggedMinutes;
    for (const day of b.activeDays) merged.activeDays.add(day);
    for (const [reason, count] of b.revisionReasons) {
      merged.revisionReasons.set(reason, (merged.revisionReasons.get(reason) || 0) + count);
    }
  }
  return merged;
}

function deltaOf(current, previous) {
  const out = {};
  if (!current || !previous) return out;
  for (const key of Object.keys(current)) {
    const a = current[key];
    const b = previous[key];
    if (typeof a === 'number' && typeof b === 'number') {
      out[key] = { absolute: round(a - b, 2), relative: b ? round((a - b) / Math.abs(b), 3) : null };
    }
  }
  return out;
}

/** Kön just nu — det Slack-meddelandena faktiskt handlar om. */
function buildQueue(openTasks, state, config) {
  const slack = config.slack || {};
  const rows = openTasks.map((task) => ({
    id: task.id,
    title: task.title,
    editorId: task.editorId,
    editorName: state.editors.get(task.editorId)?.name || task.editorId,
    slackUserId: state.editors.get(task.editorId)?.slackUserId || null,
    state: task.state,
    complexity: task.complexity,
    weight: task.weight,
    dueAt: task.dueAt,
    overdue: task.overdue,
    currentOwner: task.currentOwner,
    waitingHours: round(task.waitingHours, 1),
    rounds: task.rounds,
    brand: task.brand,
    kind: task.kind,
  }));

  const withEditor = rows.filter((r) => r.currentOwner === 'editor');
  return {
    total: rows.length,
    withEditor: withEditor.length,
    withReviewer: rows.filter((r) => r.currentOwner === 'reviewer').length,
    overdue: rows.filter((r) => r.overdue).sort((a, b) => (b.waitingHours || 0) - (a.waitingHours || 0)),
    revisionsWaiting: withEditor
      .filter((r) => r.state === 'revision' && (r.waitingHours || 0) >= (slack.revisionWaitingHours ?? 8))
      .sort((a, b) => (b.waitingHours || 0) - (a.waitingHours || 0)),
    stalled: withEditor
      .filter((r) => (r.waitingHours || 0) >= (slack.stalledHours ?? 16))
      .sort((a, b) => (b.waitingHours || 0) - (a.waitingHours || 0)),
    waitingOnUs: rows
      .filter((r) => r.currentOwner === 'reviewer')
      .sort((a, b) => (b.waitingHours || 0) - (a.waitingHours || 0)),
    all: rows.sort((a, b) => (b.waitingHours || 0) - (a.waitingHours || 0)),
  };
}

/**
 * Automatiska observationer. Bara sådant som går att agera på, och bara när
 * urvalet är stort nog att det inte är brus.
 */
function buildInsights(editorRows, team, config) {
  const insights = [];
  const minSample = config.minSample ?? 5;
  const targets = config.targets || {};

  for (const row of editorRows) {
    const k = row.kpis;
    if (k.reviewedTasks >= minSample && team.attributableRevisionRate) {
      const factor = k.attributableRevisionRate / team.attributableRevisionRate;
      if (factor >= 1.5 && k.attributableRevisionRate >= 0.25) {
        insights.push({
          severity: 'warning',
          editorId: row.id,
          metric: 'attributableRevisionRate',
          message:
            `${row.name} gör om ${Math.round(k.attributableRevisionRate * 100)} % av sina tasks ` +
            `på egna fel — ${factor.toFixed(1)}× teamsnittet (${k.reviewedTasks} tasks).`,
          action: 'Titta på vad som går fel innan nästa brief — kvalitet eller spec?',
        });
      }
      if (factor <= 0.6 && k.firstPassRate !== null && k.firstPassRate >= 0.8) {
        insights.push({
          severity: 'good',
          editorId: row.id,
          metric: 'firstPassRate',
          message: `${row.name} får igenom ${Math.round(k.firstPassRate * 100)} % på första försöket — bäst i teamet.`,
          action: 'Låt hen sätta standarden för hur en färdig leverans ser ut.',
        });
      }
    }

    if (
      k.medianPickupDelayHours !== null &&
      targets.pickupDelayHours &&
      k.medianPickupDelayHours > targets.pickupDelayHours * 2 &&
      k.tasksDelivered >= minSample
    ) {
      insights.push({
        severity: 'warning',
        editorId: row.id,
        metric: 'medianPickupDelayHours',
        message:
          `${row.name} börjar i median först efter ${k.medianPickupDelayHours.toFixed(1).replace('.', ',')} h ` +
          'arbetstid — tasken ligger orörd innan den ens påbörjas.',
        action: 'Är kön för lång, eller prioriteringen otydlig?',
      });
    }

    if (k.medianTouchRatio !== null && k.medianTouchRatio < 0.25 && k.tasksApproved >= minSample) {
      insights.push({
        severity: 'info',
        editorId: row.id,
        metric: 'medianTouchRatio',
        message:
          `${row.name} har tasks öppna ${Math.round(1 / k.medianTouchRatio)}× längre än den loggade arbetstiden.`,
        action: 'Långsam ≠ lat: det här ser ut som kötid, inte arbetstid.',
      });
    }

    if (k.utilization !== null && k.utilization > 1.05) {
      insights.push({
        severity: 'warning',
        editorId: row.id,
        metric: 'utilization',
        message: `${row.name} har loggat ${Math.round(k.utilization * 100)} % av sin kapacitet.`,
        action: 'Överbelastad — nästa task bör gå någon annanstans.',
      });
    }
  }

  if (
    targets.onTimeRate &&
    team.onTimeRate !== null &&
    team.onTimeSample >= minSample &&
    team.onTimeRate < targets.onTimeRate - 0.1
  ) {
    insights.push({
      severity: 'warning',
      metric: 'onTimeRate',
      message:
        `${Math.round(team.onTimeRate * 100)} % av tasksen blev klara till deadline ` +
        `(mål ${Math.round(targets.onTimeRate * 100)} %, ${team.onTimeSample} tasks med deadline).`,
      action: 'Antingen är deadlines för optimistiska eller så är kön för lång — det är två olika problem.',
    });
  }

  // Är det VI som är flaskhalsen?
  if (team.medianCycleHours && team.medianHandsOnHours !== null && team.medianCycleHours > 0) {
    const editorShare = team.medianHandsOnHours / team.medianCycleHours;
    if (editorShare < 0.5) {
      insights.push({
        severity: 'info',
        metric: 'reviewWait',
        message:
          `Bara ${Math.round(editorShare * 100)} % av ledtiden är redigerartid — resten ligger tasken ` +
          'och väntar på granskning hos oss.',
        action: 'Snabbare feedback från vår sida sänker ledtiden mer än snabbare redigerare.',
      });
    }
  }

  return insights;
}

function buildDataQuality(tasks, editorRows, state, config, range) {
  const issues = [];
  const minSample = config.minSample ?? 5;

  const unassigned = tasks.filter((t) => !t.editorId && !t.cancelledAt).length;
  if (unassigned) {
    issues.push({
      kind: 'unassigned',
      count: unassigned,
      message: `${unassigned} task(s) saknar tilldelad redigerare — de räknas inte in någonstans.`,
    });
  }

  const noDue = tasks.filter((t) => !t.dueAt).length;
  if (noDue) {
    issues.push({
      kind: 'missing_due',
      count: noDue,
      message: `${noDue} task(s) saknar deadline — "i tid"-siffran bygger bara på resten.`,
    });
  }

  const noStart = tasks.filter((t) => t.assignedAt && !t.startedAt).length;
  if (noStart) {
    issues.push({
      kind: 'missing_start',
      count: noStart,
      message: `${noStart} task(s) saknar startmarkering — pickup-tid går inte att skilja från arbetstid där.`,
    });
  }

  const loggedAny = state.workLog.length > 0;
  if (!loggedAny) {
    issues.push({
      kind: 'no_time_log',
      count: 0,
      message:
        'Ingen tidsloggning finns. Utnyttjandegrad och "jobbar de faktiskt?" kan inte besvaras — ' +
        'bara ledtid och output.',
    });
  }

  const thin = editorRows.filter((r) => r.kpis.reviewedTasks < minSample && r.kpis.deliveriesTotal > 0);
  for (const row of thin) {
    issues.push({
      kind: 'small_sample',
      editorId: row.id,
      count: row.kpis.reviewedTasks,
      message: `${row.name} har bara ${row.kpis.reviewedTasks} bedömda tasks i perioden — kvalitetssiffrorna är brus.`,
    });
  }

  const unknownReason = tasks.reduce(
    (n, t) => n + t.revisions.filter((r) => !(config.revisionReasons || {})[r.reason]).length,
    0,
  );
  if (unknownReason) {
    issues.push({
      kind: 'unknown_reason',
      count: unknownReason,
      message: `${unknownReason} revision(er) saknar giltig orsak — de räknas mot redigeraren tills orsak sätts.`,
    });
  }

  return issues;
}
