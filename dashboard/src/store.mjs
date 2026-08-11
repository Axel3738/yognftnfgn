// Händelselogg (append-only JSONL) + veckning till tasks.
//
// Allt i systemet härleds från händelser. Det betyder att man kan mata in
// data från vad som helst — Notion-poller, CSV-import, manuell CLI, Slack —
// utan att metrics-koden vet var den kom ifrån.

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { toMs } from './time.mjs';

/** Händelsetyper i den ordning en task normalt rör sig. */
export const EVENT_TYPES = [
  'assigned',            // task tilldelad en redigerare
  'started',             // redigeraren började jobba
  'delivered',           // inlämnad (round 1 = första leverans, 2+ = omgjord)
  'revision_requested',  // granskaren vill ha ändringar
  'approved',            // godkänd, klar
  'cancelled',           // nedlagd
  'observed',            // "så här såg statusen ut när vi tittade" — se nedan
];

// `observed` finns för att kunna importera ett befintligt system utan att ljuga.
// Notion sparar ingen statushistorik: vi vet att en task ÄR godkänd, men inte NÄR
// den blev det. En `observed` sätter därför tillståndet utan att påstå någon
// tidpunkt — den räknas aldrig som en leverans och ger aldrig en ledtid.
// Riktiga tider börjar samlas först när pollern ser en statusövergång ske.
const OBSERVED_STATES = ['assigned', 'in_progress', 'in_review', 'revision', 'approved', 'cancelled'];

const REQUIRED = ['ts', 'type', 'task_id'];

/**
 * Lagade task-id:n vid inläsning.
 *
 * En tidigare version lät sidtiteln följa med in i id:t när Notion-URL:en
 * innehöll den ("N-Approvedmusic36f270ab…" i stället för "N-36f270ab…").
 * Redan sparade loggar bär de trasiga id:na, och eftersom kommentarerna då
 * pekar på ett annat id än raderna blir alla ledtider tomma utan att något
 * felmeddelande syns. Normaliseringen här läker gammal data vid läsning, så
 * ingen behöver hämta om allt eller rensa loggen för hand.
 */
function normaliseTaskId(id) {
  const m = String(id).match(/([0-9a-f]{32})$/i);
  return m ? `N-${m[1].toLowerCase()}` : id;
}

export function readEvents(path) {
  if (!existsSync(path)) return [];
  const out = [];
  const lines = readFileSync(path, 'utf8').split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    let ev;
    try {
      ev = JSON.parse(trimmed);
    } catch {
      throw new Error(`Trasig JSON i ${path} rad ${i + 1}`);
    }
    for (const key of REQUIRED) {
      if (!ev[key]) throw new Error(`Saknar "${key}" i ${path} rad ${i + 1}`);
    }
    if (!EVENT_TYPES.includes(ev.type)) {
      throw new Error(`Okänd händelsetyp "${ev.type}" i ${path} rad ${i + 1}`);
    }
    if (!Number.isFinite(toMs(ev.ts))) {
      throw new Error(`Ogiltig tidsstämpel "${ev.ts}" i ${path} rad ${i + 1}`);
    }
    if (String(ev.task_id).startsWith('N-')) ev.task_id = normaliseTaskId(ev.task_id);
    out.push(ev);
  });
  return out.sort((a, b) => toMs(a.ts) - toMs(b.ts));
}

export function appendEvents(path, events) {
  if (!events.length) return 0;
  mkdirSync(dirname(path), { recursive: true });
  const body = events.map(e => JSON.stringify(e)).join('\n') + '\n';
  appendFileSync(path, body, 'utf8');
  return events.length;
}

export function writeEvents(path, events) {
  mkdirSync(dirname(path), { recursive: true });
  const sorted = [...events].sort((a, b) => toMs(a.ts) - toMs(b.ts));
  writeFileSync(path, sorted.map(e => JSON.stringify(e)).join('\n') + '\n', 'utf8');
  return sorted.length;
}

/**
 * Dedupe-nyckel. Pollern kan köra hur ofta som helst utan att dubblera —
 * samma task + samma typ + samma runda är samma händelse.
 */
export function eventKey(ev) {
  return [ev.task_id, ev.type, ev.round ?? 0].join('|');
}

export function mergeEvents(existing, incoming) {
  const seen = new Set(existing.map(eventKey));
  const fresh = incoming.filter(ev => !seen.has(eventKey(ev)));
  return { merged: [...existing, ...fresh], added: fresh.length };
}

/**
 * Vecker händelser till tasks.
 *
 * En task-post:
 *   id, editor, title, type, brand, priority
 *   assignedAt, startedAt, dueAt, approvedAt, cancelledAt
 *   deliveries: [{ts, round}]            — varje inlämning
 *   revisions:  [{requestedAt, deliveredAt, reason}]
 *   state: 'assigned' | 'in_progress' | 'in_review' | 'revision' | 'approved' | 'cancelled'
 */
export function foldTasks(events) {
  const tasks = new Map();

  for (const ev of events) {
    let t = tasks.get(ev.task_id);
    if (!t) {
      t = {
        id: ev.task_id,
        editor: ev.editor || null,
        title: ev.title || ev.task_id,
        type: ev.task_type || null,
        brand: ev.brand || null,
        workspace: ev.workspace || null,
        priority: ev.priority || null,
        assignedAt: null, startedAt: null, dueAt: null,
        approvedAt: null, cancelledAt: null,
        deliveries: [], revisions: [],
        state: 'assigned',
        observedAt: null, observedStatus: null, estimated: false,
        url: ev.notion_url || null,
        source: ev.source || null,
      };
      tasks.set(ev.task_id, t);
    }
    // Senare händelser får fylla i metadata som saknades.
    if (ev.editor) t.editor = ev.editor;
    if (ev.title) t.title = ev.title;
    if (ev.task_type) t.type = ev.task_type;
    if (ev.brand) t.brand = ev.brand;
    if (ev.workspace) t.workspace = ev.workspace;
    if (ev.priority) t.priority = ev.priority;
    if (ev.due) t.dueAt = ev.due;
    if (ev.source) t.source = ev.source;
    if (ev.notion_url) t.url = ev.notion_url;

    switch (ev.type) {
      case 'assigned':
        t.assignedAt = t.assignedAt ?? ev.ts;
        t.state = 'assigned';
        break;

      case 'started':
        t.startedAt = t.startedAt ?? ev.ts;
        t.state = 'in_progress';
        break;

      case 'delivered': {
        const round = ev.round ?? t.deliveries.length + 1;
        t.deliveries.push({ ts: ev.ts, round });
        // En leverans efter en revisionsbegäran stänger den revisionen.
        const open = t.revisions.find(r => !r.deliveredAt);
        if (open) open.deliveredAt = ev.ts;
        t.state = 'in_review';
        break;
      }

      case 'revision_requested':
        t.revisions.push({ requestedAt: ev.ts, deliveredAt: null, reason: ev.reason || null });
        t.state = 'revision';
        break;

      case 'approved':
        t.approvedAt = ev.ts;
        t.state = 'approved';
        break;

      case 'cancelled':
        t.cancelledAt = ev.ts;
        t.state = 'cancelled';
        break;

      case 'observed':
        if (!OBSERVED_STATES.includes(ev.state)) {
          throw new Error(`observed-händelse för ${ev.task_id} har okänt state "${ev.state}"`);
        }
        // Sätter tillståndet, men inga tidsstämplar — vi vet inte när det hände.
        t.state = ev.state;
        t.observedAt = ev.ts;
        t.observedStatus = ev.raw_status || null;
        t.estimated = true;
        break;
    }
  }

  return [...tasks.values()];
}

export function loadEditors(path) {
  if (!existsSync(path)) return [];
  return JSON.parse(readFileSync(path, 'utf8'));
}
