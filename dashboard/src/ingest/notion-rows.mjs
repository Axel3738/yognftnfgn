// Engångsimport av ett Notion-uttag (rader ur en creative hub).
//
// Skillnaden mot pollern: pollern SER övergångar ske och kan tidsstämpla dem.
// Det här är en ögonblicksbild av ett system som redan snurrat i månader utan
// att någon loggat något. Vi vet vilket tillstånd varje task är i — vi vet inte
// när den kom dit. Notion sparar ingen statushistorik och `Godkänd datum` är
// ifyllt på 2 av 199 rader.
//
// Därför bokförs bara två saker per rad, och båda är sanna:
//   assigned  vid createdTime  — Notions systemtid, alltid korrekt
//   observed  nuvarande status — utan tidpunkt, räknas aldrig som leverans
//
// Konsekvens: ledtider blir tomma för importerad data. Det är rätt. Hellre ett
// tomt fält än ett påhittat.

const STATE_BY_STATUS = {
  // to_do
  'draft': 'assigned',
  // in_progress
  'in progress': 'in_progress',
  'in progress 2': 'revision',          // andra passet = omgörning efter review
  'creative strat review': 'in_review',
  'to be reviewed': 'in_review',
  'in review': 'in_review',
  'hereer to be rewied': 'in_review',   // stavfel i Notion, medvetet speglat
  'translation in review': 'in_review',
  'to be translated': 'in_progress',
  // complete
  'approved': 'approved',
  'archived': 'approved',
  'translation archived': 'approved',
  'not used': 'cancelled',
};

/**
 * Notion-sidans url → ett stabilt task-id.
 *
 * Hela id:t, inte ett prefix. Notion-id:n delar ofta de första tecknen när
 * sidor skapats i samma batch (3b8270ab908c80b3… och 3b8270ab908c8087… ligger
 * sekunder isär), så ett kapat id slår ihop olika tasks till en.
 */
export function taskIdFromUrl(url) {
  // Notion-URL:er har två former och båda måste ge SAMMA id:
  //   https://app.notion.com/3b8270ab908c80b3…        (bara id:t)
  //   https://www.notion.so/Approved-music-36f270ab…  (titeln + id:t)
  // Tar man bara sista segmentet hamnar sidans titel i id:t, och då matchar
  // inte raderna sina egna kommentarer — vilket tyst nollställer alla ledtider.
  // Därför: plocka de 32 sista hex-tecknen, aldrig hela segmentet.
  const hex = String(url).replace(/\?.*$/, '').replace(/-/g, '').match(/[0-9a-f]{32}$/i);
  if (!hex) throw new Error(`Hittar inget Notion-id i url: ${url}`);
  return `N-${hex[0].toLowerCase()}`;
}

function parseAssignee(raw) {
  if (!raw) return [];
  let arr = raw;
  if (typeof raw === 'string') {
    // Antingen en JSON-array (som Notions SQL-vy ger) eller ett blankt user-id.
    try { arr = JSON.parse(raw); } catch { return [raw.replace('user://', '').trim()]; }
  }
  if (!Array.isArray(arr)) return [];
  return arr.map(u => String(u).replace('user://', ''));
}

/** Notion-createdTime ("2026-08-04 07:52:46Z") → ISO. */
function toIso(ts) {
  if (!ts) return null;
  const norm = String(ts).includes('T') ? ts : String(ts).replace(' ', 'T');
  const d = new Date(norm.endsWith('Z') || /[+-]\d\d:?\d\d$/.test(norm) ? norm : norm + 'Z');
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * @param rows    rader ur Notion (url, Namn, Status, Typ, Ansvarig, createdTime, godkand)
 * @param editors data/editors.json — mappar Notion-user-id → vårt editor-id
 * @param hub     namn på hubben raderna kommer från
 */
export function rowsToEvents(rows, editors, hub = 'notion', workspace = null, includeTypes = [], observedAt = new Date().toISOString()) {
  // En creative hub rymmer mycket mer än arbete: SOP:ar, guidelines, arkiv över
  // vinnande annonser, lösa anteckningar. Att lista upp vad som ska bort blir en
  // kapplöpning man aldrig vinner — nya sorters sidor dyker upp hela tiden.
  // Därför tvärtom: bara de Typ-värden som faktiskt är annonser mäts. Tom lista
  // = ta med allt.
  const keepType = new Set(includeTypes.map(t => t.toLowerCase()));
  const byNotionId = new Map(editors.filter(e => e.notionId).map(e => [e.notionId, e.id]));
  const events = [];
  const unknownStatuses = new Set();
  let skipped = 0;

  let excluded = 0;
  for (const row of rows) {
    const createdAt = toIso(row.createdTime);
    if (!createdAt) { skipped++; continue; }
    if (keepType.size && !keepType.has(String(row.Typ || '').toLowerCase())) { excluded++; continue; }

    const status = (row.Status || '').trim();
    const state = STATE_BY_STATUS[status.toLowerCase()];
    if (status && !state) unknownStatuses.add(status);

    const people = parseAssignee(row.Ansvarig);
    // Delad task: första personen äger den. Sällsynt (1 rad av 199).
    const notionUser = people[0] || null;
    const editor = notionUser ? (byNotionId.get(notionUser) || `notion-${notionUser.slice(0, 8)}`) : null;

    const base = {
      task_id: taskIdFromUrl(row.url),
      editor,
      title: row.Namn || '(namnlös)',
      task_type: row.Typ || null,
      brand: hub,
      workspace,
      priority: row.Prioritet || null,
      source: 'notion-import',
      notion_url: row.url,
    };

    events.push({ ts: createdAt, type: 'assigned', ...base });

    // `Godkänd datum` är ifyllt på ett fåtal rader — där det finns är det äkta.
    const approved = toIso(row.godkand || row['date:Godkänd datum:start']);
    if (approved && state === 'approved') {
      events.push({ ts: approved, type: 'approved', ...base });
    } else if (state && state !== 'assigned') {
      // Stämplas med när vi TITTADE, inte när sidan skapades.
      //
      // Statusen är ett nuläge. Stämplas den med createdTime hamnar den först i
      // händelseordningen, och varje senare kommentar skriver över den: en task
      // som står Approved i Notion slutade som 'revision' i panelen. Felet slog
      // hårdast mot den som kommenterar mest — alltså tvärtemot verkligheten.
      events.push({ ts: observedAt, type: 'observed', state, raw_status: status, ...base });
    }
  }

  return { events, unknownStatuses: [...unknownStatuses], skipped, excluded };
}

export { STATE_BY_STATUS };
