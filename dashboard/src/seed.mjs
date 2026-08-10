/**
 * Genererar realistisk demodata så att dashboarden går att titta på innan
 * riktiga event finns. Deterministisk (fast seed) — samma kommando ger samma
 * data, så skärmdumpar och tester är stabila.
 *
 * Redigerarna har medvetet olika profiler: en snabb-och-slarvig, en
 * långsam-och-exakt, en överbelastad, en jämn, och en ny. Det är just de
 * skillnaderna dashboarden ska kunna visa.
 */

import { WorkCalendar, localDate } from './worktime.mjs';
import { addDays } from './util.mjs';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROFILES = [
  {
    id: 'ed_tove',
    name: 'Tove Nyström',
    slackUserId: 'U01TOVE',
    role: 'Senior editor',
    capacityHoursPerDay: 7,
    tasksPerDay: 2.4,
    speed: 1.0,
    pickup: 0.6,
    revisionProb: 0.28,
    revisionSpeed: 0.8,
    touch: 0.62,
    logsTime: true,
    reasonBias: { quality: 0.5, technical: 0.15, brief: 0.2, 'scope-change': 0.1, preference: 0.05 },
  },
  {
    id: 'ed_lina',
    name: 'Lina Sjöberg',
    slackUserId: 'U02LINA',
    role: 'Editor',
    capacityHoursPerDay: 7,
    tasksPerDay: 2.8,
    speed: 0.55, // snabbast till första leverans
    pickup: 0.4,
    revisionProb: 0.62, // ...men gör om mest
    revisionSpeed: 0.6,
    touch: 0.7,
    logsTime: true,
    reasonBias: { quality: 0.62, technical: 0.2, brief: 0.1, 'scope-change': 0.05, preference: 0.03 },
  },
  {
    id: 'ed_omar',
    name: 'Omar Haddad',
    slackUserId: 'U03OMAR',
    role: 'Editor',
    capacityHoursPerDay: 7,
    tasksPerDay: 1.7,
    speed: 1.7, // långsammast
    pickup: 0.8,
    revisionProb: 0.14, // men nästan aldrig fel
    revisionSpeed: 0.9,
    touch: 0.75,
    logsTime: true,
    reasonBias: { quality: 0.3, technical: 0.1, brief: 0.35, 'scope-change': 0.15, preference: 0.1 },
  },
  {
    id: 'ed_kris',
    name: 'Kristian Vall',
    slackUserId: 'U04KRIS',
    role: 'Editor (deltid)',
    capacityHoursPerDay: 4,
    tasksPerDay: 1.9, // överbokad mot sin kapacitet
    speed: 1.3,
    pickup: 3.2, // tasks ligger orörda länge
    revisionProb: 0.34,
    revisionSpeed: 2.0,
    touch: 0.35, // öppna länge, arbetad tid liten
    logsTime: true,
    reasonBias: { quality: 0.45, technical: 0.15, brief: 0.25, 'scope-change': 0.1, preference: 0.05 },
  },
  {
    id: 'ed_petra',
    name: 'Petra Lund',
    slackUserId: 'U05PETRA',
    role: 'Junior editor',
    capacityHoursPerDay: 7,
    tasksPerDay: 1.2,
    speed: 1.25,
    pickup: 0.7,
    revisionProb: 0.5,
    revisionSpeed: 0.8,
    touch: 0.8,
    logsTime: false, // loggar ingen tid — visar hur dashboarden flaggar det
    startsAfterDays: 0.65, // börjar först en bit in i perioden
    reasonBias: { quality: 0.55, technical: 0.2, brief: 0.15, 'scope-change': 0.05, preference: 0.05 },
  },
];

const KINDS = [
  { kind: 'static', complexity: 'S', hours: 1.5, weightP: 0.3 },
  { kind: 'static', complexity: 'M', hours: 3, weightP: 0.25 },
  { kind: 'edit', complexity: 'M', hours: 3.5, weightP: 0.15 },
  { kind: 'video', complexity: 'L', hours: 7, weightP: 0.2 },
  { kind: 'video', complexity: 'XL', hours: 14, weightP: 0.1 },
];

const HOOKS = ['investering', 'farfar', 'smak', 'rea', 'garanti', '10sasonger', 'inbrant', 'specsheet'];
const ANGLES = ['pain', 'benefit', 'authority', 'offer', 'social', 'curiosity'];
const FORMATS = ['comparison', 'textheavy', 'beforeafter', 'ugc', 'lifestyle', 'collage'];

const SLA_HOURS = { S: 6, M: 12, L: 20, XL: 32 };

export function generateSeed(config, { days = 60, seed = 20260810, now = new Date() } = {}) {
  const rng = mulberry32(seed);
  const cal = new WorkCalendar(config);
  const nowMs = (now instanceof Date ? now : new Date(now)).getTime();
  const events = [];
  const push = (event) => {
    if (new Date(event.ts).getTime() <= nowMs) events.push(event);
  };

  const endIso = localDate(now, cal.timezone);
  const startIso = addDays(endIso, -(days - 1));

  for (const p of PROFILES) {
    events.push({
      type: 'editor_added',
      ts: new Date(new Date(`${startIso}T08:00:00Z`).getTime() - 86_400_000).toISOString(),
      editorId: p.id,
      name: p.name,
      slackUserId: p.slackUserId,
      role: p.role,
      capacityHoursPerDay: p.capacityHoursPerDay,
      active: true,
    });
  }

  const pick = (list) => list[Math.floor(rng() * list.length)];
  const jitter = (base, spread) => base * (1 - spread + rng() * spread * 2);
  const pickKind = () => {
    const r = rng();
    let acc = 0;
    for (const k of KINDS) {
      acc += k.weightP;
      if (r <= acc) return k;
    }
    return KINDS[0];
  };
  const pickReason = (bias) => {
    const r = rng();
    let acc = 0;
    for (const [reason, p] of Object.entries(bias)) {
      acc += p;
      if (r <= acc) return reason;
    }
    return 'quality';
  };

  let counter = 0;
  const totalDays = days;

  for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
    const iso = addDays(startIso, dayOffset);
    if (!cal.isWorkingDay(iso)) continue;
    const dayProgress = dayOffset / totalDays;

    for (const p of PROFILES) {
      if (p.startsAfterDays && dayProgress < p.startsAfterDays) continue;

      // Antal tasks idag: poissonliknande runt tasksPerDay.
      let count = Math.floor(p.tasksPerDay);
      if (rng() < p.tasksPerDay - count) count += 1;

      for (let i = 0; i < count; i++) {
        counter += 1;
        const spec = pickKind();
        const taskId = `T-${String(counter).padStart(4, '0')}`;
        const title = `GRILL_mastern_${pick(ANGLES)}_${pick(FORMATS)}_${pick(HOOKS)}_v${1 + Math.floor(rng() * 3)}`;

        // Skapad tidigt på dagen, tilldelad kort därefter.
        const created = cal.addWorkingHours(new Date(`${iso}T00:00:00Z`), 0.2 + rng() * 2);
        const assigned = cal.addWorkingHours(created, rng() * 1.5);
        const dueAt = cal.addWorkingHours(assigned, SLA_HOURS[spec.complexity] * jitter(1, 0.2));

        push({
          type: 'task_created',
          ts: created.toISOString(),
          taskId,
          title,
          brand: 'Grillkliniken',
          kind: spec.kind,
          complexity: spec.complexity,
          requestedBy: rng() < 0.7 ? 'axel' : 'sanna',
        });
        push({
          type: 'task_assigned',
          ts: assigned.toISOString(),
          taskId,
          editorId: p.id,
          dueAt: dueAt.toISOString(),
        });

        const pickupHours = Math.max(0.1, jitter(p.pickup, 0.8));
        const started = cal.addWorkingHours(assigned, pickupHours);
        push({ type: 'task_started', ts: started.toISOString(), taskId, editorId: p.id });

        const effortHours = Math.max(0.5, spec.hours * jitter(p.speed, 0.45));
        let cursor = cal.addWorkingHours(started, effortHours);
        let roundNo = 1;
        push({
          type: 'task_delivered',
          ts: cursor.toISOString(),
          taskId,
          editorId: p.id,
          round: roundNo,
        });

        logWork(push, p, taskId, started, effortHours, cal, rng);

        // Granskningsrundor.
        let done = false;
        while (!done && roundNo <= 3) {
          const reviewLag = Math.max(0.3, jitter(3.5, 0.9));
          const verdictAt = cal.addWorkingHours(cursor, reviewLag);
          // Sannolikheten för ytterligare en revision faller för varje runda.
          const prob = p.revisionProb / roundNo;
          if (rng() < prob) {
            const reason = pickReason(p.reasonBias);
            push({
              type: 'revision_requested',
              ts: verdictAt.toISOString(),
              taskId,
              reviewerId: 'axel',
              round: roundNo,
              reason,
              notes: reason === 'brief' ? 'Briefen sa fel format' : null,
            });
            const fixHours = Math.max(0.3, effortHours * 0.35 * jitter(p.revisionSpeed, 0.5));
            const fixStart = cal.addWorkingHours(verdictAt, Math.max(0.2, jitter(p.pickup, 0.8)));
            roundNo += 1;
            cursor = cal.addWorkingHours(fixStart, fixHours);
            push({
              type: 'task_delivered',
              ts: cursor.toISOString(),
              taskId,
              editorId: p.id,
              round: roundNo,
            });
            logWork(push, p, taskId, fixStart, fixHours, cal, rng);
          } else {
            push({ type: 'task_approved', ts: verdictAt.toISOString(), taskId, reviewerId: 'axel' });
            done = true;
          }
        }
        if (!done) {
          const finalAt = cal.addWorkingHours(cursor, 2);
          push({ type: 'task_approved', ts: finalAt.toISOString(), taskId, reviewerId: 'axel' });
        }
      }
    }
  }

  events.sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));
  return events;
}

/** Loggar arbetad tid på leveransdagen (den delen redigeraren faktiskt satt). */
function logWork(push, profile, taskId, startInstant, effortHours, cal, rng) {
  if (!profile.logsTime) return;
  const logged = effortHours * profile.touch * (0.85 + rng() * 0.3);
  push({
    type: 'work_logged',
    ts: cal.addWorkingHours(startInstant, Math.max(0.2, effortHours * 0.9)).toISOString(),
    editorId: profile.id,
    taskId,
    minutes: Math.round(logged * 60),
  });
}
