// Tidsmatematik i arbetstid, inte kalendertid.
//
// Hela poängen: en task som lämnas ut 16:45 på fredag och levereras 09:15 på
// måndag tog INTE 64 timmar. Den tog 1h 30min arbetstid. Räknar man kalendertid
// ser alla ut som sölkorvar över helger och alla ser snabba ut på tisdagar.
// Allt i den här filen räknar i minuter inom konfigurerat arbetsfönster,
// i rätt tidszon, med DST hanterat.

const MIN = 60_000;

/** Tidszonens offset (ms) vid en given instant. */
function tzOffsetMs(instant, tz) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p = Object.fromEntries(dtf.formatToParts(new Date(instant)).map(x => [x.type, x.value]));
  // Intl ger 24 för midnatt i vissa runtimes — normalisera.
  const hour = p.hour === '24' ? 0 : Number(p.hour);
  const asUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), hour, Number(p.minute), Number(p.second));
  return asUTC - instant;
}

/** Väggklocka (år/mån/dag/tim/min) i tidszonen → instant (ms). Två pass p.g.a. DST. */
export function instantFromWall(y, m, d, h, mi, tz) {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  let t = guess - tzOffsetMs(guess, tz);
  t = guess - tzOffsetMs(t, tz);
  return t;
}

/** Instant → lokala delar i tidszonen. */
export function wallParts(instant, tz) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    weekday: 'short',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
  const p = Object.fromEntries(dtf.formatToParts(new Date(instant)).map(x => [x.type, x.value]));
  const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: p.hour === '24' ? 0 : Number(p.hour),
    minute: Number(p.minute),
    weekday: weekdayIndex,
  };
}

/** ISO-datum (YYYY-MM-DD) i tidszonen — nyckeln vi grupperar dagar på. */
export function localDate(instant, tz) {
  const { year, month, day } = wallParts(instant, tz);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseHHMM(s) {
  const [h, m] = String(s).split(':').map(Number);
  return { h, m: m || 0 };
}

/** Arbetsfönstren (som instants) för ett lokalt datum. Returnerar 0–2 segment (lunch delar dagen). */
function daySegments(y, m, d, weekday, cfg, tz) {
  if (!cfg.days.includes(weekday)) return [];
  const s = parseHHMM(cfg.start);
  const e = parseHHMM(cfg.end);
  const open = instantFromWall(y, m, d, s.h, s.m, tz);
  const close = instantFromWall(y, m, d, e.h, e.m, tz);
  if (close <= open) return [];

  const lunchMin = Number(cfg.lunchMinutes || 0);
  if (!lunchMin) return [[open, close]];

  const l = parseHHMM(cfg.lunchStart || '12:00');
  const lunchOpen = instantFromWall(y, m, d, l.h, l.m, tz);
  const lunchClose = lunchOpen + lunchMin * MIN;
  if (lunchClose <= open || lunchOpen >= close) return [[open, close]];

  const segs = [];
  if (lunchOpen > open) segs.push([open, Math.min(lunchOpen, close)]);
  if (lunchClose < close) segs.push([Math.max(lunchClose, open), close]);
  return segs;
}

/**
 * Arbetsminuter mellan två instants. Negativ input → 0.
 * Itererar dag för dag i tidszonen; DST-säkert eftersom varje dags fönster
 * beräknas från väggklockan.
 */
export function businessMinutes(from, to, cfg, tz) {
  const a = toMs(from);
  const b = toMs(to);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;

  let total = 0;
  // Börja på a:s lokala dag, gå framåt tills vi passerat b.
  let cursor = a;
  let guard = 0;
  while (cursor < b && guard++ < 2000) {
    const { year, month, day, weekday } = wallParts(cursor, tz);
    for (const [open, close] of daySegments(year, month, day, weekday, cfg, tz)) {
      const start = Math.max(open, a);
      const end = Math.min(close, b);
      if (end > start) total += (end - start) / MIN;
    }
    // Hoppa till nästa lokala midnatt.
    cursor = instantFromWall(year, month, day, 0, 0, tz) + 26 * 3600_000;
    const p = wallParts(cursor, tz);
    cursor = instantFromWall(p.year, p.month, p.day, 0, 0, tz);
  }
  return Math.round(total);
}

/** Arbetsminuter per full arbetsdag (för att kunna säga "2,5 arbetsdagar"). */
export function minutesPerWorkday(cfg) {
  const s = parseHHMM(cfg.start);
  const e = parseHHMM(cfg.end);
  return (e.h * 60 + e.m) - (s.h * 60 + s.m) - Number(cfg.lunchMinutes || 0);
}

/** Är instant inom arbetstid? */
export function isWorkingTime(instant, cfg, tz) {
  const t = toMs(instant);
  const { year, month, day, weekday } = wallParts(t, tz);
  return daySegments(year, month, day, weekday, cfg, tz).some(([o, c]) => t >= o && t < c);
}

/** Lista lokala datum mellan två instants (inklusive båda ändar). */
export function dateRange(from, to, tz) {
  const out = [];
  let cursor = toMs(from);
  const end = toMs(to);
  let guard = 0;
  while (cursor <= end && guard++ < 2000) {
    const p = wallParts(cursor, tz);
    out.push(`${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`);
    cursor = instantFromWall(p.year, p.month, p.day, 0, 0, tz) + 26 * 3600_000;
    const q = wallParts(cursor, tz);
    cursor = instantFromWall(q.year, q.month, q.day, 0, 0, tz);
  }
  return out;
}

export function toMs(x) {
  if (x == null) return NaN;
  if (typeof x === 'number') return x;
  if (x instanceof Date) return x.getTime();
  return Date.parse(x);
}

/**
 * Skriver en varaktighet så att den går att läsa högt utan att stanna upp.
 *
 * "3,6 d" säger ingenting — d för vad? Kalenderdagar? Arbetsdagar? Decimalen
 * gör det värre: ingen har en känsla för vad 0,6 dagar är. Därför skrivs
 * enheten ut, och en arbetsdag är åtta timmar mån–fre.
 *
 *    45  → "45 min"
 *   300  → "5 timmar"
 *   480  → "1 arbetsdag"
 *  1730  → "3,5 arbetsdagar"
 *  6000  → "2,5 veckor"        (en vecka = 5 arbetsdagar)
 */
export function formatDuration(minutes, cfg) {
  if (minutes == null || !Number.isFinite(minutes)) return '–';
  const perDay = minutesPerWorkday(cfg);
  const nice = n => (Math.round(n * 10) / 10).toString().replace('.', ',');

  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < perDay) {
    const h = minutes / 60;
    return h < 1.05 ? '1 timme' : `${nice(h)} timmar`;
  }
  const days = minutes / perDay;
  if (days < 10) return days < 1.05 ? '1 arbetsdag' : `${nice(days)} arbetsdagar`;
  const weeks = days / 5;
  return weeks < 1.05 ? '1 vecka' : `${nice(weeks)} veckor`;
}

/** Kort variant för trånga tabellceller. Samma enheter, färre tecken. */
export function formatDurationShort(minutes, cfg) {
  if (minutes == null || !Number.isFinite(minutes)) return '–';
  const perDay = minutesPerWorkday(cfg);
  const nice = n => (Math.round(n * 10) / 10).toString().replace('.', ',');
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < perDay) return `${nice(minutes / 60)} tim`;
  const days = minutes / perDay;
  if (days < 10) return `${nice(days)} dgr`;
  return `${nice(days / 5)} v`;
}
