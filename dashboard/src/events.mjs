/**
 * Eventschemat. Allt i dashboarden är härlett ur en append-only logg —
 * inget tillstånd skrivs över, så varje siffra går att spåra till råhändelser.
 */

export const EVENT_TYPES = {
  editor_added: {
    required: ['editorId', 'name'],
    optional: ['slackUserId', 'role', 'capacityHoursPerDay', 'active', 'startedAt'],
    doc: 'Lägger till eller uppdaterar en redigerare.',
  },
  task_created: {
    required: ['taskId'],
    optional: ['title', 'brand', 'kind', 'complexity', 'dueAt', 'briefUrl', 'requestedBy'],
    doc: 'En task finns nu (brief skriven). kind = static | video | edit | retouch | other.',
  },
  task_assigned: {
    required: ['taskId', 'editorId'],
    optional: ['dueAt'],
    doc: 'Task tilldelad en redigerare. Klockan för ledtid börjar här.',
  },
  task_started: {
    required: ['taskId'],
    optional: ['editorId'],
    doc: 'Redigeraren började faktiskt jobba (frivilligt — ger pickup-tid).',
  },
  task_delivered: {
    required: ['taskId'],
    optional: ['editorId', 'round', 'assetUrl'],
    doc: 'Leverans inskickad för granskning. round härleds om den utelämnas.',
  },
  revision_requested: {
    required: ['taskId'],
    optional: ['reviewerId', 'round', 'reason', 'notes'],
    doc: 'Granskaren vill ha ändringar. reason avgör om det räknas mot redigeraren.',
  },
  task_approved: {
    required: ['taskId'],
    optional: ['reviewerId', 'round'],
    doc: 'Godkänd. Task är klar.',
  },
  task_cancelled: {
    required: ['taskId'],
    optional: ['reason'],
    doc: 'Nedlagd — räknas varken som output eller som försening.',
  },
  work_logged: {
    required: ['editorId', 'minutes'],
    optional: ['taskId', 'date'],
    doc: 'Faktisk arbetad tid (frivilligt). Utan detta går utnyttjandegrad inte att mäta.',
  },
};

export const COMPLEXITIES = ['S', 'M', 'L', 'XL'];

export class ValidationError extends Error {}

/** Validerar och normaliserar ett event. Kastar ValidationError vid fel. */
export function normalizeEvent(raw, { index } = {}) {
  const where = index === undefined ? '' : ` (rad ${index + 1})`;
  if (!raw || typeof raw !== 'object') throw new ValidationError(`Event är inte ett objekt${where}`);

  const type = raw.type;
  const spec = EVENT_TYPES[type];
  if (!spec) {
    throw new ValidationError(
      `Okänd eventtyp "${type}"${where}. Giltiga: ${Object.keys(EVENT_TYPES).join(', ')}`,
    );
  }

  const ts = raw.ts ? new Date(raw.ts) : new Date();
  if (Number.isNaN(ts.getTime())) throw new ValidationError(`Ogiltig ts "${raw.ts}"${where}`);

  for (const field of spec.required) {
    if (raw[field] === undefined || raw[field] === null || raw[field] === '') {
      throw new ValidationError(`Event "${type}" saknar obligatoriskt fält "${field}"${where}`);
    }
  }

  const allowed = new Set(['id', 'type', 'ts', 'source', 'note', ...spec.required, ...spec.optional]);
  const unknown = Object.keys(raw).filter((k) => !allowed.has(k));
  if (unknown.length) {
    throw new ValidationError(
      `Event "${type}" har okända fält: ${unknown.join(', ')}${where}. ` +
        `Tillåtna: ${[...allowed].join(', ')}`,
    );
  }

  const event = { ...raw, type, ts: ts.toISOString() };
  if (!event.id) event.id = cryptoRandomId();

  if (event.complexity !== undefined) {
    event.complexity = String(event.complexity).toUpperCase();
    if (!COMPLEXITIES.includes(event.complexity)) {
      throw new ValidationError(
        `Ogiltig complexity "${raw.complexity}"${where}. Giltiga: ${COMPLEXITIES.join(', ')}`,
      );
    }
  }
  if (event.minutes !== undefined) {
    event.minutes = Number(event.minutes);
    if (!Number.isFinite(event.minutes) || event.minutes < 0) {
      throw new ValidationError(`Ogiltiga minutes "${raw.minutes}"${where}`);
    }
  }
  if (event.round !== undefined) {
    event.round = Number(event.round);
    if (!Number.isInteger(event.round) || event.round < 1) {
      throw new ValidationError(`Ogiltig round "${raw.round}"${where} — ska vara heltal ≥ 1`);
    }
  }
  if (event.dueAt) {
    const due = new Date(event.dueAt);
    if (Number.isNaN(due.getTime())) throw new ValidationError(`Ogiltig dueAt "${raw.dueAt}"${where}`);
    event.dueAt = due.toISOString();
  }
  if (event.capacityHoursPerDay !== undefined) {
    event.capacityHoursPerDay = Number(event.capacityHoursPerDay);
  }

  return event;
}

function cryptoRandomId() {
  return 'ev_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
