import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEvent, ValidationError } from '../src/events.mjs';
import { readEvents, writeEvents } from '../src/store.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test('okänd eventtyp avvisas', () => {
  assert.throws(() => normalizeEvent({ type: 'task_finished', taskId: 'T1' }), ValidationError);
});

test('saknat obligatoriskt fält avvisas', () => {
  assert.throws(() => normalizeEvent({ type: 'task_assigned', taskId: 'T1' }), /editorId/);
});

test('felstavat fält avvisas istället för att tyst ignoreras', () => {
  assert.throws(() => normalizeEvent({ type: 'task_created', taskId: 'T1', titel: 'Rubrik' }), /okända fält/);
});

test('ogiltig komplexitet avvisas', () => {
  assert.throws(() => normalizeEvent({ type: 'task_created', taskId: 'T1', complexity: 'XXL' }), /complexity/);
});

test('komplexitet normaliseras till versaler', () => {
  assert.equal(normalizeEvent({ type: 'task_created', taskId: 'T1', complexity: 'm' }).complexity, 'M');
});

test('event får id och ISO-tidsstämpel automatiskt', () => {
  const event = normalizeEvent({ type: 'task_created', taskId: 'T1' });
  assert.ok(event.id);
  assert.match(event.ts, /^\d{4}-\d{2}-\d{2}T/);
});

test('trasiga rader rapporteras utan att fälla resten av loggen', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'edash-')), 'events.jsonl');
  fs.writeFileSync(
    file,
    [
      JSON.stringify({ type: 'task_created', taskId: 'T1', ts: '2026-08-03T09:00:00Z' }),
      '{ trasig json',
      JSON.stringify({ type: 'task_assigned', taskId: 'T1', ts: '2026-08-03T09:05:00Z' }), // saknar editorId
      JSON.stringify({ type: 'task_delivered', taskId: 'T1', ts: '2026-08-03T12:00:00Z' }),
    ].join('\n'),
  );
  const { events, problems } = readEvents(file);
  assert.equal(events.length, 2);
  assert.equal(problems.length, 2);
  assert.equal(problems[0].line, 2);
});

test('loggen sorteras kronologiskt oavsett skrivordning', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'edash-')), 'events.jsonl');
  writeEvents(file, [
    { type: 'task_delivered', taskId: 'T1', ts: '2026-08-03T12:00:00Z' },
    { type: 'task_created', taskId: 'T1', ts: '2026-08-03T09:00:00Z' },
  ]);
  const { events } = readEvents(file);
  assert.equal(events[0].type, 'task_created');
});
