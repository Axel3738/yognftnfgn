#!/usr/bin/env node
// Importerar Notion-briefarna till dashboarden. Notion är sanningen för VAD som
// finns och vilken status det har — dashboarden lägger på vem, när och hur mycket.
//
// Claude kör Notion-frågorna (MCP) och skriver resultatet till
// dashboard/data/notion-raw.json. Detta skript gör om det till tasks.
//   node dashboard/notion-import.mjs

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checklistFor } from './lib/model.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA = join(HERE, 'data');

/** Notions Status → dashboardens status. */
export const STATUS_MAP = {
  'Draft':                 'planned',
  'In progress':           'in_progress',
  'In progress 2':         'in_progress',
  'To be translated':      'in_progress',
  'Creative strat review': 'in_review',
  'To be Reviewed':        'in_review',
  'In Review':             'in_review',
  'Hereer to be rewied':   'in_review',
  'Translation in review': 'in_review',
  'Approved':              'approved',
  'Archived':              'approved',
  'Translation archived':  'approved',
  'Not used':              'cancelled',
};

/** Annonsnamnet kodar typen: PD/SP/SO + video (H) eller bild (siffra). */
function taskTypeFor(namn = '', typ = '') {
  if (/^Image/i.test(typ)) return 'new_creative';
  if (/_H\d/i.test(namn)) return 'hook_iteration';
  if (/_C\d/i.test(namn)) return 'new_creative';
  return 'new_creative';
}

const raw = JSON.parse(readFileSync(join(DATA, 'notion-raw.json'), 'utf8'));
const team = JSON.parse(readFileSync(join(DATA, 'team.json'), 'utf8'));
const byNotionId = Object.fromEntries(
  team.users.filter(u => u.notionUserId).map(u => [u.notionUserId, u.id]));

const tasks = [];
const counters = {};
const prefixes = { motorholjet: 'MOT', axelbaltet: 'AXE', strandtofflorna: 'STR', satesoverdragaren: 'SAT' };

for (const [productId, items] of Object.entries(raw.items)) {
  for (const it of items) {
    // Tomma rader och mallrader hoppas över — de är inte arbete.
    if (!it.namn || /^Skärmavbild/i.test(it.namn)) continue;
    const status = STATUS_MAP[it.status] ?? 'planned';
    if (status === 'cancelled') continue;

    const pfx = prefixes[productId];
    counters[pfx] = (counters[pfx] ?? 0) + 1;
    const day = (it.createdTime ?? '').slice(0, 10) || raw.syncedAt.slice(0, 10);
    const notionUser = (it.ansvarig ?? [])[0];
    const editor = byNotionId[notionUser] ?? null;

    tasks.push({
      id: `${pfx}-${String(counters[pfx]).padStart(3, '0')}`,
      title: it.namn,
      description: '',
      productId,
      assignedEditorId: editor,          // null = ingen ansvarig i Notion
      createdBy: 'axel',
      taskType: taskTypeFor(it.namn, it.typ),
      priority: it.prioritet === 'High' ? 'high' : it.prioritet === 'Low' ? 'low' : 'normal',
      status,
      plannedDate: day,
      startDate: status === 'planned' ? null : day,
      dueDate: null,   // Notion har inget deadline-falt - managern satter det i dashboarden
      completedAt: ['in_review', 'approved'].includes(status) ? `${day}T16:00:00.000Z` : null,
      approvedAt: status === 'approved' ? `${day}T18:00:00.000Z` : null,
      estimatedMinutes: 60,
      plannedCreativeCount: 1,
      deliveredCreativeCount: ['in_review', 'approved'].includes(status) ? 1 : 0,
      briefLink: it.url,
      sourceMaterialLink: '',
      deliveryLink: ['in_review', 'approved'].includes(status) ? it.url : '',
      blockerReason: null, blockerReportedAt: null, blockerNeeds: '', blockerOwner: '',
      currentRevision: 0,
      requiresManagerReview: true,
      checklist: checklistFor(taskTypeFor(it.namn, it.typ)).map(c =>
        status === 'approved' ? { ...c, passed: true, answer: 'from Notion', answeredBy: 'axel' } : c),
      feedbackHistory: it.feedback ? [{ round: 1, feedback: it.feedback, by: 'axel', at: `${day}T18:00:00.000Z` }] : [],
      notionUrl: it.url,
      notionStatus: it.status,
      notionType: it.typ,
      createdAt: it.createdTime ?? `${day}T08:00:00.000Z`,
      updatedAt: raw.syncedAt,
    });
  }
}

writeFileSync(join(DATA, 'tasks.json'), JSON.stringify({ tasks }, null, 2) + '\n');
if (!existsSync(join(DATA, 'events.json'))) {
  writeFileSync(join(DATA, 'events.json'), JSON.stringify({ events: [] }, null, 2) + '\n');
}

const count = s => tasks.filter(t => t.status === s).length;
const unassigned = tasks.filter(t => !t.assignedEditorId).length;
console.log(`✓ Importerat ${tasks.length} annonser från Notion (${raw.syncedAt.slice(0, 16).replace('T', ' ')})`);
console.log(`  godkända ${count('approved')} · i granskning ${count('in_review')} · pågår ${count('in_progress')} · draft ${count('planned')}`);
console.log(`  ⚠ ${unassigned} utan Ansvarig i Notion`);
