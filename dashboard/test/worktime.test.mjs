import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkCalendar, localDate } from '../src/worktime.mjs';

const config = {
  timezone: 'Europe/Stockholm',
  workday: { start: '09:00', end: '17:00', lunchMinutes: 0, days: [1, 2, 3, 4, 5] },
  holidays: ['2026-06-19'],
};

const cal = new WorkCalendar(config);

test('räknar bara timmar inom arbetsdagen', () => {
  // Onsdag 2026-08-05, 10:00 → 14:00 lokal tid.
  const hours = cal.hoursBetween('2026-08-05T08:00:00Z', '2026-08-05T12:00:00Z');
  assert.equal(hours, 4);
});

test('hoppar över natten', () => {
  // Onsdag 16:00 → torsdag 10:00 lokal = 1 h + 1 h = 2 h.
  const hours = cal.hoursBetween('2026-08-05T14:00:00Z', '2026-08-06T08:00:00Z');
  assert.equal(hours, 2);
});

test('hoppar över helgen — det här är hela poängen', () => {
  // Fredag 16:30 → måndag 09:30 lokal = 30 min + 30 min = 1 h.
  const hours = cal.hoursBetween('2026-08-07T14:30:00Z', '2026-08-10T07:30:00Z');
  assert.equal(hours, 1);
});

test('röda dagar räknas inte', () => {
  // Midsommarafton 2026-06-19 är helgdag i configen: torsdag 16:00 → måndag 10:00.
  const hours = cal.hoursBetween('2026-06-18T14:00:00Z', '2026-06-22T08:00:00Z');
  assert.equal(hours, 2); // 1 h torsdag + 1 h måndag, fredag borträknad
});

test('tid utanför arbetsdagen ger noll', () => {
  assert.equal(cal.hoursBetween('2026-08-08T10:00:00Z', '2026-08-09T10:00:00Z'), 0);
});

test('negativa spann klipps till noll', () => {
  assert.equal(cal.hoursBetween('2026-08-06T10:00:00Z', '2026-08-05T10:00:00Z'), 0);
});

test('lunchavdrag minskar arbetsdagen', () => {
  const withLunch = new WorkCalendar({
    ...config,
    workday: { ...config.workday, lunchMinutes: 60 },
  });
  assert.equal(withLunch.hoursPerDay, 7);
  assert.equal(withLunch.hoursBetween('2026-08-05T07:00:00Z', '2026-08-05T15:00:00Z'), 7);
});

test('addWorkingHours är invers till hoursBetween', () => {
  const start = new Date('2026-08-07T13:00:00Z'); // fredag 15:00 lokal
  const later = cal.addWorkingHours(start, 6);
  assert.equal(Math.round(cal.hoursBetween(start, later) * 100) / 100, 6);
  // 2 h kvar av fredagen + 4 h in på måndagen → måndag 13:00 lokal.
  assert.equal(localDate(later, 'Europe/Stockholm'), '2026-08-10');
});

test('addWorkingHours startar nästa arbetsdag när dagen är slut', () => {
  const start = new Date('2026-08-05T20:00:00Z'); // onsdag 22:00 lokal
  const later = cal.addWorkingHours(start, 1);
  assert.equal(localDate(later, 'Europe/Stockholm'), '2026-08-06');
});

test('workdaysBetween exkluderar helg och helgdag', () => {
  assert.equal(cal.workdaysBetween('2026-08-03', '2026-08-09'), 5);
  assert.equal(cal.workdaysBetween('2026-06-15', '2026-06-21'), 4); // 19:e är röd dag
});

test('sommartidsskifte påverkar inte arbetstidsräkningen', () => {
  // Sista söndagen i oktober 2026 (25/10) — måndagen efter ska mätas normalt.
  // Fredag 15:00 lokal (CEST, UTC+2) → måndag 10:00 lokal (CET, UTC+1):
  // 2 h kvar av fredagen + 1 h på måndagen. Skiftet får inte äta upp en timme.
  const hours = cal.hoursBetween('2026-10-23T13:00:00Z', '2026-10-26T09:00:00Z');
  assert.equal(hours, 3);
});
