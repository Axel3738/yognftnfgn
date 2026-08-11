// Notion-ingest via statusdiff.
//
// Notions API ger dig inte statushistorik — bara nuläget. Lösningen är att
// köra det här på schema (t.ex. var 15:e minut) och jämföra mot förra
// körningens ögonblicksbild. Varje statusändring blir en händelse med
// tidsstämpel. Kör den ofta så blir tidsstämplarna exakta; kör den sällan och
// de blir grovkorniga (aldrig fel, bara trubbiga).
//
// Kräver NOTION_TOKEN (integration token) och notion.databaseId i config.json.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const API = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';

async function notion(path, token, body) {
  const res = await fetch(`${API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      authorization: `Bearer ${token}`,
      'notion-version': VERSION,
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Notion ${res.status}: ${json.message || JSON.stringify(json)}`);
  return json;
}

/** Plockar ut ett läsbart värde ur en Notion-property, oavsett typ. */
function readProp(prop) {
  if (!prop) return null;
  switch (prop.type) {
    case 'title': return prop.title.map(t => t.plain_text).join('') || null;
    case 'rich_text': return prop.rich_text.map(t => t.plain_text).join('') || null;
    case 'select': return prop.select?.name ?? null;
    case 'status': return prop.status?.name ?? null;
    case 'multi_select': return prop.multi_select.map(s => s.name).join(', ') || null;
    case 'date': return prop.date?.start ?? null;
    case 'people': return prop.people.map(p => p.name || p.id).join(', ') || null;
    case 'checkbox': return prop.checkbox;
    case 'number': return prop.number;
    case 'formula': return prop.formula?.string ?? prop.formula?.number ?? null;
    default: return null;
  }
}

/** Notion-status → vår händelsetyp. */
function mapStatus(statusName, statusMap) {
  if (!statusName) return null;
  const needle = statusName.trim().toLowerCase();
  for (const [event, names] of Object.entries(statusMap)) {
    if (names.some(n => n.trim().toLowerCase() === needle)) return event;
  }
  return null;
}

/** Slugifierar ett personnamn till ett editor-id (matchar data/editors.json). */
function editorId(name, editors) {
  if (!name) return null;
  const first = name.split(/[,;]/)[0].trim();
  const hit = editors.find(e =>
    e.name.toLowerCase() === first.toLowerCase() ||
    e.notion === first ||
    first.toLowerCase().startsWith(e.name.split(' ')[0].toLowerCase()));
  return hit ? hit.id : first.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function fetchAllPages(databaseId, token) {
  const pages = [];
  let cursor;
  do {
    const res = await notion(`/databases/${databaseId}/query`, token,
      cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 });
    pages.push(...res.results);
    cursor = res.has_more ? res.next_cursor : null;
  } while (cursor);
  return pages;
}

function loadSnapshot(path) {
  if (!existsSync(path)) return {};
  return JSON.parse(readFileSync(path, 'utf8'));
}
function saveSnapshot(path, snap) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(snap, null, 2), 'utf8');
}

/**
 * Kör en pollning. Returnerar { events, snapshot, pages }.
 * Första körningen skapar en baslinje: den bokför tilldelning vid sidans
 * created_time och nuvarande status vid last_edited_time, så historiken inte
 * börjar helt tom.
 */
export async function pollNotion({ config, editors, snapshotPath, token, now = Date.now() }) {
  const { databaseId, propertyMap, statusMap } = config.notion;
  if (!databaseId) throw new Error('config.notion.databaseId är tom — peka ut task-databasen först.');
  if (!token) throw new Error('NOTION_TOKEN saknas i miljön.');

  const pages = await fetchAllPages(databaseId, token);
  const snapshot = loadSnapshot(snapshotPath);
  const firstRun = Object.keys(snapshot).length === 0;
  const events = [];
  const nextSnapshot = {};

  for (const page of pages) {
    const props = page.properties || {};
    const title = readProp(props[propertyMap.title]) || page.id.slice(0, 8);
    const assignee = readProp(props[propertyMap.assignee]);
    const statusName = readProp(props[propertyMap.status]);
    const due = readProp(props[propertyMap.due]);
    const taskType = readProp(props[propertyMap.type]);
    const brand = readProp(props[propertyMap.brand]);

    const editor = editorId(assignee, editors);
    const event = mapStatus(statusName, statusMap);
    const taskId = `N-${page.id.replace(/-/g, '').slice(0, 12)}`;

    const base = {
      task_id: taskId, editor, title,
      task_type: taskType || null, brand: brand || null,
      source: 'notion', notion_url: page.url,
    };

    const before = snapshot[page.id];
    nextSnapshot[page.id] = {
      status: statusName, event, editor, title, due,
      lastEdited: page.last_edited_time,
      rounds: before?.rounds ?? (event === 'delivered' ? 1 : 0),
    };

    if (firstRun) {
      // Baslinje: bokför tilldelningen och nuvarande läge.
      events.push({ ts: page.created_time, type: 'assigned', due: due || undefined, ...base });
      if (event && event !== 'assigned') {
        events.push({ ts: page.last_edited_time, type: event, ...(event === 'delivered' ? { round: 1 } : {}), ...base });
      }
      continue;
    }

    if (!before) {
      events.push({ ts: page.created_time, type: 'assigned', due: due || undefined, ...base });
      if (event && event !== 'assigned') {
        events.push({ ts: page.last_edited_time, type: event, ...(event === 'delivered' ? { round: 1 } : {}), ...base });
        nextSnapshot[page.id].rounds = event === 'delivered' ? 1 : 0;
      }
      continue;
    }

    if (event && event !== before.event) {
      // Tidsstämpel: Notions last_edited_time om den flyttat sig, annars nu.
      const ts = page.last_edited_time !== before.lastEdited ? page.last_edited_time : new Date(now).toISOString();
      if (event === 'delivered') {
        const round = (before.rounds || 0) + 1;
        nextSnapshot[page.id].rounds = round;
        events.push({ ts, type: 'delivered', round, ...base });
      } else {
        events.push({ ts, type: event, ...base });
      }
    }

    // Deadline kan ändras utan statusbyte — bokför den på tilldelningen.
    if (due && due !== before.due) {
      events.push({ ts: page.last_edited_time, type: 'assigned', due, ...base });
    }
  }

  return { events, snapshot: nextSnapshot, pages: pages.length, firstRun, saveSnapshot: () => saveSnapshot(snapshotPath, nextSnapshot) };
}
