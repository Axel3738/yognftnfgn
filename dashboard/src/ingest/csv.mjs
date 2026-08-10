// CSV-import — för historik som redan finns i ett kalkylark, eller för att
// mata in data från ett verktyg som inte har API.
//
// Två format stöds:
//
// 1) HÄNDELSER (en rad per händelse) — mest exakt:
//    task_id,editor,event,ts,round,reason,due,title,type,brand
//    T-1001,marcus,assigned,2026-08-01T09:00:00+02:00,,,2026-08-02T17:00:00+02:00,Mastern_PD_3,video,Mastern
//    T-1001,marcus,delivered,2026-08-01T13:30:00+02:00,1,,,,,
//
// 2) TASKS (en rad per task, kolumner för tidsstämplar) — enklast att exportera:
//    task_id,editor,title,type,brand,assigned_at,started_at,delivered_at,revision_requested_at,revision_delivered_at,approved_at,due_at
//
// Formatet detekteras på om kolumnen "event" finns.

import { readFileSync } from 'node:fs';

export function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',' || c === ';') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* ignorera */ }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }

  return rows.filter(r => r.some(c => c.trim() !== ''));
}

function toObjects(rows) {
  const [header, ...body] = rows;
  const keys = header.map(h => h.trim().toLowerCase().replace(/\s+/g, '_'));
  return body.map(r => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? '').trim()])));
}

const clean = v => (v === '' || v == null ? undefined : v);

function eventRows(objs) {
  return objs.map((o, i) => {
    if (!o.task_id) throw new Error(`CSV rad ${i + 2}: task_id saknas`);
    if (!o.event) throw new Error(`CSV rad ${i + 2}: event saknas`);
    if (!o.ts) throw new Error(`CSV rad ${i + 2}: ts saknas`);
    return {
      ts: o.ts,
      type: o.event,
      task_id: o.task_id,
      editor: clean(o.editor),
      title: clean(o.title),
      task_type: clean(o.type),
      brand: clean(o.brand),
      round: o.round ? Number(o.round) : undefined,
      reason: clean(o.reason),
      due: clean(o.due),
      source: 'csv',
    };
  });
}

function taskRows(objs) {
  const out = [];
  objs.forEach((o, i) => {
    if (!o.task_id) throw new Error(`CSV rad ${i + 2}: task_id saknas`);
    const base = {
      task_id: o.task_id,
      editor: clean(o.editor),
      title: clean(o.title),
      task_type: clean(o.type),
      brand: clean(o.brand),
      source: 'csv',
    };
    const push = (ts, type, extra) => { if (ts) out.push({ ts, type, ...extra, ...base }); };

    push(o.assigned_at, 'assigned', { due: clean(o.due_at) });
    push(o.started_at, 'started', {});
    push(o.delivered_at, 'delivered', { round: 1 });
    push(o.revision_requested_at, 'revision_requested', { reason: clean(o.revision_reason) });
    push(o.revision_delivered_at, 'delivered', { round: 2 });
    push(o.approved_at, 'approved', {});
  });
  return out;
}

export function importCSV(path) {
  const rows = parseCSV(readFileSync(path, 'utf8'));
  if (rows.length < 2) throw new Error('CSV:en har ingen data under rubrikraden.');
  const objs = toObjects(rows);
  const isEventFormat = Object.keys(objs[0]).includes('event');
  const events = isEventFormat ? eventRows(objs) : taskRows(objs);
  return { events, format: isEventFormat ? 'events' : 'tasks' };
}
