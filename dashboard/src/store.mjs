/**
 * Lagring: en append-only JSONL-fil. Ingen databas, inget beroende.
 * Läsbar med `tail`, versionerbar, och omöjlig att tyst skriva över.
 */

import fs from 'node:fs';
import path from 'node:path';
import { normalizeEvent, ValidationError } from './events.mjs';

export const DEFAULT_STORE = 'data/events.jsonl';

export function resolveStorePath(file = DEFAULT_STORE, root = process.cwd()) {
  return path.isAbsolute(file) ? file : path.join(root, file);
}

/** Läser hela loggen, kronologiskt sorterad. Trasiga rader rapporteras, inte sväljs. */
export function readEvents(file) {
  if (!fs.existsSync(file)) return { events: [], problems: [] };
  const text = fs.readFileSync(file, 'utf8');
  const events = [];
  const problems = [];
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#')) continue;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      problems.push({ line: i + 1, message: 'Ogiltig JSON' });
      continue;
    }
    try {
      events.push(normalizeEvent(parsed, { index: i }));
    } catch (err) {
      if (err instanceof ValidationError) problems.push({ line: i + 1, message: err.message });
      else throw err;
    }
  }
  events.sort((a, b) => (a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0));
  return { events, problems };
}

/** Lägger till ett event. Returnerar det normaliserade eventet. */
export function appendEvent(file, raw) {
  const event = normalizeEvent(raw);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(event) + '\n', 'utf8');
  return event;
}

/** Lägger till flera event atomiskt (allt valideras innan något skrivs). */
export function appendEvents(file, rawEvents) {
  const normalized = rawEvents.map((raw, index) => normalizeEvent(raw, { index }));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, normalized.map((e) => JSON.stringify(e)).join('\n') + '\n', 'utf8');
  return normalized;
}

export function writeEvents(file, events) {
  const normalized = events.map((raw, index) => normalizeEvent(raw, { index }));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, normalized.map((e) => JSON.stringify(e)).join('\n') + '\n', 'utf8');
  return normalized;
}
