// Genererar DEMODATA så dashboarden går att köra och granska innan riktig
// data är inkopplad. Varje händelse taggas source:"demo" — riktig ingest
// taggar "notion"/"csv"/"cli" och demo-raderna kan rensas med
//   node cli.mjs purge-demo
//
// Deterministisk PRNG: samma seed → samma dataset, så tester blir stabila.

import { instantFromWall, wallParts, businessMinutes } from './time.mjs';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Profiler — medvetet olika, så dashboardens signaler går att se med blotta ögat.
const PROFILES = {
  // snabb och slarvig: hög output, hög revisionsgrad
  marcus: { perDay: 2.6, pickupH: [0.2, 1.5], firstPassH: [1.5, 4], revProb: 0.52, revRounds: [1, 3], revH: [1, 3], lateProb: 0.18 },
  // långsam men träffsäker: låg output, nästan inga revisioner
  sofia:  { perDay: 1.3, pickupH: [0.5, 3],   firstPassH: [4, 9],   revProb: 0.14, revRounds: [1, 1], revH: [1, 2], lateProb: 0.12 },
  // stabil mittfältare
  jonte:  { perDay: 2.0, pickupH: [0.3, 2],   firstPassH: [2, 5],   revProb: 0.27, revRounds: [1, 2], revH: [1.5, 4], lateProb: 0.15 },
  // ny, ojämn, lång pickup
  amina:  { perDay: 1.5, pickupH: [2, 12],    firstPassH: [3, 8],   revProb: 0.38, revRounds: [1, 2], revH: [2, 6], lateProb: 0.3 },
  // sladdar rejält: låg output, långa ledtider, obesvarade revisioner
  viktor: { perDay: 0.8, pickupH: [4, 20],    firstPassH: [5, 14],  revProb: 0.44, revRounds: [1, 2], revH: [6, 20], lateProb: 0.42 },
};

const TASK_TYPES = ['video', 'static', 'variant', 'hook-cut'];
const ANGLES = ['PD', 'SP', 'SO', 'CU'];
const BRANDS = ['Mastern', 'Seatcover', 'Enginecover', 'Trimmerbelt'];
const REV_REASONS = [
  'Hook för svag i 0–2s',
  'Fel logotypplacering',
  'Text bryter säker yta',
  'Pris/erbjudande saknas',
  'Fel aspect ratio (behöver 4:5)',
  'Ljudmix för låg',
  'Förbjudet påstående i copy',
  'Fel produktbild — gammal variant',
];

/** Slumpa en instant inom arbetstid på en given lokal dag. */
function workInstant(rand, y, m, d, cfg, tz, fromHour = null) {
  const [sh] = cfg.start.split(':').map(Number);
  const [eh] = cfg.end.split(':').map(Number);
  const lo = fromHour != null ? Math.max(sh, fromHour) : sh;
  const hi = Math.max(lo + 0.25, eh - 0.5);
  const hour = lo + rand() * (hi - lo);
  return instantFromWall(y, m, d, Math.floor(hour), Math.floor((hour % 1) * 60), tz);
}

/** Lägg på arbetstimmar och landa på en instant inom arbetstid. */
function addBusinessHours(start, hours, cfg, tz) {
  let t = start;
  let remaining = Math.round(hours * 60);
  let guard = 0;
  while (remaining > 0 && guard++ < 400) {
    const step = Math.min(remaining, 30);
    const next = t + step * 60_000;
    const gained = businessMinutes(t, next, cfg, tz);
    if (gained === 0) {
      // Utanför arbetstid — hoppa framåt en timme tills fönstret öppnar.
      t = next;
      continue;
    }
    remaining -= gained;
    t = next;
  }
  return t;
}

const pick = (rand, xs) => xs[Math.floor(rand() * xs.length)];
const between = (rand, [lo, hi]) => lo + rand() * (hi - lo);

export function generateSeed({ config, editors, days = 90, now = Date.now(), seed = 20260810 }) {
  const rand = mulberry32(seed);
  const tz = config.timezone;
  const cfg = config.workday;
  const events = [];
  let counter = 1000;

  for (let back = days; back >= 0; back--) {
    const dayInstant = now - back * 86_400_000;
    const { year, month, day, weekday } = wallParts(dayInstant, tz);
    if (!cfg.days.includes(weekday)) continue;

    for (const ed of editors) {
      const p = PROFILES[ed.id] || PROFILES.jonte;
      // Antal nya tasks den här dagen — Poisson-liknande via två tärningar.
      const n = Math.floor(between(rand, [0, p.perDay * 1.6]) + (rand() < 0.25 ? 1 : 0));
      for (let i = 0; i < n; i++) {
        const id = `T-${counter++}`;
        const brand = pick(rand, BRANDS);
        const angle = pick(rand, ANGLES);
        const type = pick(rand, TASK_TYPES);
        const title = `${brand}_${angle}_${counter % 40}_H1 – ${type}`;

        const assignedAt = workInstant(rand, year, month, day, cfg, tz);
        const dueAt = addBusinessHours(assignedAt, between(rand, [8, 24]), cfg, tz);

        const base = {
          task_id: id, editor: ed.id, title, task_type: type, brand, source: 'demo',
        };

        events.push({ ts: iso(assignedAt), type: 'assigned', due: iso(dueAt), ...base });

        // Har den hunnit påbörjas? Öppna tasks i svansen är realistiskt.
        const startedAt = addBusinessHours(assignedAt, between(rand, p.pickupH), cfg, tz);
        if (startedAt > now) continue;
        events.push({ ts: iso(startedAt), type: 'started', ...base });

        let deliveredAt = addBusinessHours(startedAt, between(rand, p.firstPassH), cfg, tz);
        if (deliveredAt > now) continue;
        let round = 1;
        events.push({ ts: iso(deliveredAt), type: 'delivered', round, ...base });

        // Revisioner
        let rounds = 0;
        if (rand() < p.revProb) {
          rounds = Math.round(between(rand, p.revRounds));
        }
        let stop = false;
        for (let r = 0; r < rounds && !stop; r++) {
          const requestedAt = addBusinessHours(deliveredAt, between(rand, [0.5, 6]), cfg, tz);
          if (requestedAt > now) { stop = true; break; }
          events.push({ ts: iso(requestedAt), type: 'revision_requested', reason: pick(rand, REV_REASONS), ...base });

          const redeliveredAt = addBusinessHours(requestedAt, between(rand, p.revH), cfg, tz);
          if (redeliveredAt > now) { stop = true; break; }
          round += 1;
          events.push({ ts: iso(redeliveredAt), type: 'delivered', round, ...base });
          deliveredAt = redeliveredAt;
        }
        if (stop) continue;

        const approvedAt = addBusinessHours(deliveredAt, between(rand, [0.5, 8]), cfg, tz);
        if (approvedAt > now) continue;
        // Några få läggs ner.
        if (rand() < 0.03) {
          events.push({ ts: iso(approvedAt), type: 'cancelled', ...base });
        } else {
          events.push({ ts: iso(approvedAt), type: 'approved', ...base });
        }
      }
    }
  }

  return events.sort((a, b) => Date.parse(a.ts) - Date.parse(b.ts));
}

function iso(ms) {
  return new Date(Math.round(ms / 60000) * 60000).toISOString();
}
