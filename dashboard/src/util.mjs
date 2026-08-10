/** Små hjälpare som används överallt. */

export function median(values) {
  return quantile(values, 0.5);
}

/** Linjärt interpolerad kvantil (samma metod som numpy default). */
export function quantile(values, q) {
  const xs = values.filter((v) => typeof v === 'number' && Number.isFinite(v)).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  if (xs.length === 1) return xs[0];
  const pos = (xs.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return xs[lo];
  return xs[lo] + (xs[hi] - xs[lo]) * (pos - lo);
}

export function mean(values) {
  const xs = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (!xs.length) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function sum(values) {
  return values.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}

export function round(value, decimals = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

export function ratio(part, whole) {
  if (!whole) return null;
  return part / whole;
}

/** Lägger till n dagar på ett ISO-datum (YYYY-MM-DD). */
export function addDays(isoDate, n) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d) + n * 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}

export function daysBetween(fromIso, toIso) {
  const [y1, m1, d1] = fromIso.split('-').map(Number);
  const [y2, m2, d2] = toIso.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

export function eachDay(fromIso, toIso) {
  const out = [];
  const n = daysBetween(fromIso, toIso);
  for (let i = 0; i <= n; i++) out.push(addDays(fromIso, i));
  return out;
}

/** ISO-veckonyckel, t.ex. "2026-V32". */
export function isoWeek(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7; // måndag = 0
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // torsdagen i veckan
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((date - firstThursday) / (7 * 86_400_000));
  return `${date.getUTCFullYear()}-V${String(week).padStart(2, '0')}`;
}

/** Måndagen i samma ISO-vecka. */
export function weekStart(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7;
  return addDays(isoDate, -dayNum);
}

export function groupBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

/** Svensk timformattering: 45 min, 3,2 h, 2,5 d. */
export function formatHours(hours, hoursPerDay = 7) {
  if (hours === null || hours === undefined || !Number.isFinite(hours)) return '—';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < hoursPerDay * 2) return `${hours.toFixed(1).replace('.', ',')} h`;
  return `${(hours / hoursPerDay).toFixed(1).replace('.', ',')} d`;
}

export function formatPercent(value, decimals = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${(value * 100).toFixed(decimals).replace('.', ',')} %`;
}
