// Kommentarer → riktiga händelser.
//
// Detta är den enda platsen i Notion där arbetsflödet faktiskt har äkta
// tidsstämplar. Statusfältet har ingen historik, `Godkänd datum` är tomt —
// men varje kommentar bär `datetime` och författare.
//
// Avläsningen bygger på hur teamet faktiskt jobbar:
//
//   Kommentar från den ANSVARIGA         → leverans ("Kindly check!" = klar för granskning)
//   Kommentar från någon ANNAN           → ändringsbegäran (feedback från granskaren)
//
// Viktigt förbehåll, som också visas i panelen: alla kommenterar inte. Gilz
// skriver "Kindly check!" på varje task, Carl skriver ingenting. Ett mätetal
// som bara bygger på kommentarer skulle därför få Carl att se osynlig ut i
// stället för långsam. Därför räknas täckningsgraden per person och visas
// bredvid siffrorna.

import { taskIdFromUrl } from './notion-rows.mjs';

/** Text som betyder "jag är klar, titta på den" snarare än en fråga. */
const HANDOFF = /kindly check|please check|check this|klar|done|for review|to review|ready/i;

/**
 * Är granskarens kommentar en begäran om ändring — eller bara en anteckning?
 *
 * Långt ifrån allt granskaren skriver betyder "gör om det här". En stor del av
 * kommentarerna är Axel som klistrar in länken till den publicerade annonsen.
 * Räknas de som ändringsbegäran hamnar revisionsgraden på 83–100%, vilket är
 * uppenbart fel och gör hela måttet obrukbart.
 *
 * Två villkor, båda måste hålla:
 *   1. Det ska finnas text kvar när länkarna räknats bort. En naken URL är
 *      en anteckning, inte en instruktion.
 *   2. Något ska redan ha levererats. En kommentar innan första inlämningen är
 *      en brief eller ett förtydligande — det går inte att göra om något som
 *      ännu inte lämnats in.
 */
function isChangeRequest(text, deliveriesSoFar) {
  if (deliveriesSoFar < 1) return false;
  const words = String(text || '').replace(/https?:\/\/\S+/g, ' ').trim();
  return words.length >= 15;
}

export function commentsToEvents(payload, editors, tasksById = new Map()) {
  const byNotionId = new Map(editors.filter(e => e.notionId).map(e => [e.notionId, e.id]));
  const events = [];
  const coverage = new Map();
  let notes = 0;

  const comments = [...(payload.comments || [])]
    .sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));

  // Räkna rundor per task så att `delivered` får rätt round-nummer.
  const rounds = new Map();

  for (const c of comments) {
    // Samma id-funktion som raderna använder — annars matchar de inte.
    const taskId = taskIdFromUrl(c.page);
    const task = tasksById.get(taskId);
    const owner = task?.editor ?? null;
    const author = byNotionId.get(c.author) || `notion-${String(c.author).slice(0, 8)}`;

    const base = {
      task_id: taskId,
      editor: owner,
      title: task?.title || c.task || taskId,
      workspace: task?.workspace || null,
      brand: task?.brand || null,
      source: 'notion-comment',
      comment_by: author,
    };

    if (owner && author === owner) {
      // Den ansvariga hör av sig → leverans.
      const round = (rounds.get(taskId) || 0) + 1;
      rounds.set(taskId, round);
      events.push({
        ts: c.datetime, type: 'delivered', round,
        ...base,
        ...(HANDOFF.test(c.text) ? {} : { weak_signal: true }),
      });
    } else if (isChangeRequest(c.text, rounds.get(taskId) || 0)) {
      // Granskaren ber om en ändring på något som redan lämnats in.
      events.push({
        ts: c.datetime, type: 'revision_requested',
        reason: (c.text || '').slice(0, 200),
        ...base,
      });
    } else {
      // Anteckning — bokförs inte som något. Räknas bara för rapporteringen.
      notes++;
    }

    if (owner) {
      const cov = coverage.get(owner) || { comments: 0, tasks: new Set() };
      cov.comments += 1;
      cov.tasks.add(taskId);
      coverage.set(owner, cov);
    }
  }

  return {
    events,
    notes,
    coverage: [...coverage.entries()].map(([editor, c]) => ({
      editor, comments: c.comments, tasks: c.tasks.size,
    })),
    checkedPages: (payload.checkedPages || []).length,
    pagesWithComments: new Set(comments.map(c => c.page)).size,
  };
}

export { taskIdFromUrl };
