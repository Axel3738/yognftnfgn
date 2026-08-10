/**
 * Arbetstid, inte väggklocka.
 *
 * Hela poängen: en task som lämnas över fredag 16:30 och är klar måndag 09:30
 * ska mätas som 1 timme — inte 65. Annars mäter dashboarden helger och nätter
 * och rankar folk efter när i veckan de råkade få jobbet.
 *
 * All räkning sker i lokal väggklockstid för konfigurerad tidszon.
 */

const MS_PER_DAY = 86_400_000;

const partsCache = new Map();

function formatter(timezone) {
  let f = partsCache.get(timezone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    partsCache.set(timezone, f);
  }
  return f;
}

/** Väggklockan i `timezone` för ett givet ögonblick. */
export function zonedParts(instant, timezone) {
  const date = instant instanceof Date ? instant : new Date(instant);
  if (Number.isNaN(date.getTime())) throw new TypeError(`Ogiltigt datum: ${instant}`);
  const out = {};
  for (const p of formatter(timezone).formatToParts(date)) {
    if (p.type !== 'literal') out[p.type] = Number(p.value);
  }
  // 24:00 förekommer i vissa ICU-versioner för midnatt.
  if (out.hour === 24) out.hour = 0;
  const dayNumber = Math.round(Date.UTC(out.year, out.month - 1, out.day) / MS_PER_DAY);
  return {
    year: out.year,
    month: out.month,
    day: out.day,
    hour: out.hour,
    minute: out.minute,
    second: out.second,
    dayNumber,
    minuteOfDay: out.hour * 60 + out.minute + out.second / 60,
    isoDate: `${out.year}-${String(out.month).padStart(2, '0')}-${String(out.day).padStart(2, '0')}`,
  };
}

/** ISO-datum (YYYY-MM-DD) i lokal tidszon. */
export function localDate(instant, timezone) {
  return zonedParts(instant, timezone).isoDate;
}

function dayNumberToIso(dayNumber) {
  const d = new Date(dayNumber * MS_PER_DAY);
  return d.toISOString().slice(0, 10);
}

/** 0 = söndag … 6 = lördag. Epoken (dag 0) var en torsdag. */
function weekdayOf(dayNumber) {
  return (((dayNumber + 4) % 7) + 7) % 7;
}

function parseClock(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + (m || 0);
}

export class WorkCalendar {
  constructor(config = {}) {
    const wd = config.workday || {};
    this.timezone = config.timezone || 'Europe/Stockholm';
    this.startMin = parseClock(wd.start || '09:00');
    this.endMin = parseClock(wd.end || '17:00');
    this.lunchMinutes = Number(wd.lunchMinutes || 0);
    this.days = new Set(wd.days || [1, 2, 3, 4, 5]);
    this.holidays = new Set(config.holidays || []);
    if (this.endMin <= this.startMin) {
      throw new Error('workday.end måste vara efter workday.start');
    }
    // Lunchen dras av proportionellt över dagen: en task som pågår halva
    // arbetsdagen får halva lunchavdraget. Enkelt och rimligt.
    this.grossDayMinutes = this.endMin - this.startMin;
    this.netFactor =
      this.grossDayMinutes > 0
        ? Math.max(0, this.grossDayMinutes - this.lunchMinutes) / this.grossDayMinutes
        : 1;
  }

  isWorkingDayNumber(dayNumber) {
    if (!this.days.has(weekdayOf(dayNumber))) return false;
    return !this.holidays.has(dayNumberToIso(dayNumber));
  }

  isWorkingDay(isoDate) {
    const [y, m, d] = isoDate.split('-').map(Number);
    return this.isWorkingDayNumber(Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY));
  }

  /** Arbetsminuter mellan två ögonblick (0 om end <= start). */
  minutesBetween(start, end) {
    const a = start instanceof Date ? start : new Date(start);
    const b = end instanceof Date ? end : new Date(end);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
    if (b <= a) return 0;

    const pa = zonedParts(a, this.timezone);
    const pb = zonedParts(b, this.timezone);

    // Skyddsräcke mot orimliga spann (trasig data ska inte hänga servern).
    const span = pb.dayNumber - pa.dayNumber;
    if (span > 3650) return null;

    let gross = 0;
    for (let day = pa.dayNumber; day <= pb.dayNumber; day++) {
      if (!this.isWorkingDayNumber(day)) continue;
      const from = day === pa.dayNumber ? Math.max(this.startMin, pa.minuteOfDay) : this.startMin;
      const to = day === pb.dayNumber ? Math.min(this.endMin, pb.minuteOfDay) : this.endMin;
      if (to > from) gross += to - from;
    }
    return gross * this.netFactor;
  }

  /** Arbetstimmar mellan två ögonblick. */
  hoursBetween(start, end) {
    const min = this.minutesBetween(start, end);
    return min === null ? null : min / 60;
  }

  /** Antal arbetsdagar i [from, to] (inklusive båda, ISO-datum). */
  workdaysBetween(fromIso, toIso) {
    const toDayNumber = (iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      return Math.round(Date.UTC(y, m - 1, d) / MS_PER_DAY);
    };
    const a = toDayNumber(fromIso);
    const b = toDayNumber(toIso);
    let n = 0;
    for (let day = a; day <= b; day++) if (this.isWorkingDayNumber(day)) n++;
    return n;
  }

  /** Netto arbetstimmar per full arbetsdag. */
  get hoursPerDay() {
    return (this.grossDayMinutes * this.netFactor) / 60;
  }

  /**
   * Flyttar fram ett ögonblick N arbetstimmar. Används för deadlines och för
   * att generera realistisk testdata som inte hamnar mitt i natten.
   */
  addWorkingHours(start, hours) {
    const a = start instanceof Date ? start : new Date(start);
    let remaining = (hours * 60) / this.netFactor; // brutto-minuter kvar
    const p = zonedParts(a, this.timezone);
    let day = p.dayNumber;
    let cursor = p.minuteOfDay;

    for (let guard = 0; guard < 4000; guard++) {
      if (this.isWorkingDayNumber(day)) {
        const from = Math.max(this.startMin, Math.min(cursor, this.endMin));
        const available = this.endMin - from;
        if (available > 0) {
          if (remaining <= available) {
            return instantFromLocal(day, from + remaining, this.timezone);
          }
          remaining -= available;
        }
      }
      day += 1;
      cursor = this.startMin;
    }
    throw new Error('addWorkingHours: för långt spann');
  }
}

/**
 * Bygger ett UTC-ögonblick från lokal dag + minut-på-dagen. Löser tidszons-
 * offseten iterativt (två varv räcker även över sommartidsskiften).
 */
function instantFromLocal(dayNumber, minuteOfDay, timezone) {
  const base = dayNumber * MS_PER_DAY + Math.round(minuteOfDay * 60_000);
  let guess = new Date(base);
  for (let i = 0; i < 3; i++) {
    const p = zonedParts(guess, timezone);
    const actual = p.dayNumber * MS_PER_DAY + Math.round(p.minuteOfDay * 60_000);
    const drift = base - actual;
    if (Math.abs(drift) < 1000) break;
    guess = new Date(guess.getTime() + drift);
  }
  return guess;
}
