// Domänmodellen: statusar, övergångar, tasktyper och checklistmallar.
// Ingen I/O här — bara regler, så de går att testa isolerat.

/** Statusar. Varje status har text + ikon + färg (aldrig färg ensamt). */
export const STATUSES = {
  not_started:  { label: 'Not started',   sv: 'Ej påbörjad',       icon: '○', tone: 'neutral' },
  planned:      { label: 'Planned',       sv: 'Planerad',          icon: '◔', tone: 'neutral' },
  in_progress:  { label: 'In progress',   sv: 'Pågår',             icon: '◕', tone: 'info'    },
  blocked:      { label: 'Blocked',       sv: 'Blockerad',         icon: '■', tone: 'danger'  },
  in_review:    { label: 'Ready for review', sv: 'Redo för granskning', icon: '◆', tone: 'warn' },
  changes:      { label: 'Changes required', sv: 'Ändringar krävs',  icon: '↺', tone: 'warn'  },
  approved:     { label: 'Approved',      sv: 'Godkänd',           icon: '✓', tone: 'ok'      },
  cancelled:    { label: 'Cancelled',     sv: 'Avbruten',          icon: '×', tone: 'neutral' },
};

/** "Sen" är inte en status utan ett härlett tillstånd — en task kan vara både pågående och sen. */
export const isLate = (task, today) =>
  !!task.dueDate && task.dueDate < today && !['approved', 'cancelled'].includes(task.status);

export const OPEN_STATUSES = ['not_started', 'planned', 'in_progress', 'blocked', 'changes'];

/** Tillåtna övergångar. Allt annat kastar — så en task aldrig kan hoppa till approved. */
const TRANSITIONS = {
  not_started: ['planned', 'in_progress', 'blocked', 'cancelled'],
  planned:     ['in_progress', 'blocked', 'cancelled'],
  in_progress: ['blocked', 'in_review', 'planned', 'cancelled'],
  blocked:     ['in_progress', 'planned', 'cancelled'],
  in_review:   ['approved', 'changes', 'in_progress', 'cancelled'],
  changes:     ['in_progress', 'blocked', 'cancelled'],
  approved:    ['changes'],           // kan öppnas igen om något visar sig fel
  cancelled:   ['planned'],
};

export function assertTransition(from, to) {
  if (!STATUSES[to]) throw new Error(`Okänd status: ${to}`);
  if (from === to) return;
  if (!TRANSITIONS[from]?.includes(to)) {
    throw new Error(`Otillåten övergång: ${from} → ${to}. Tillåtna: ${TRANSITIONS[from].join(', ')}`);
  }
}

export const TASK_TYPES = {
  new_creative:   'New creative from brief',
  hook_iteration: 'Hook iteration',
  new_intro:      'New intro sequence',
  new_vo:         'New voice-over version',
  ugc_iteration:  'UGC iteration',
  broll_variation:'B-roll variation',
  subtitle_fix:   'Subtitle fix',
  new_cta:        'New CTA',
  format_change:  'Format change',
  revision:       'Feedback revision',
  export_upload:  'Export & upload',
};

export const PRIORITIES = { high: 'High', normal: 'Normal', low: 'Low' };

/**
 * Checklistmallar per tasktyp. `required: true` blockerar godkännande.
 * Managern kan overrida — men bara med skriven motivering (se store.reviewTask).
 */
export const CHECKLIST_TEMPLATES = {
  _base: [
    { key: 'delivery_link',   item: 'Delivery link works and is accessible',        required: true },
    { key: 'right_product',   item: 'Correct product',                              required: true },
    { key: 'brief_followed',  item: 'Matches the brief',                            required: true },
    { key: 'file_naming',     item: 'File names follow the naming convention',      required: true },
    { key: 'aspect_ratio',    item: 'Correct aspect ratios (video 9:16 + 4:5)',     required: true },
    { key: 'clean_export',    item: 'No watermark, audio correct',                  required: true },
    { key: 'prev_feedback',   item: 'Previous feedback implemented',                required: false },
  ],
  new_creative: [
    { key: 'version_count',   item: 'All requested versions delivered',             required: true },
    { key: 'distinct_hooks',  item: 'Each version has a clearly different hook',    required: true,
      question: 'Which hook did you use for each version?' },
    { key: 'main_angle',      item: 'Main angle stated',                            required: true,
      question: 'What is the main angle of this creative?' },
    { key: 'real_variation',  item: 'Real variations, not cosmetic tweaks',         required: true,
      question: 'What is actually different between the versions?' },
    { key: 'cta_present',     item: 'CTA present',                                  required: true },
    { key: 'subtitles',       item: 'Swedish subtitles present, word-for-word from brief', required: true },
    { key: 'product_early',   item: 'Product visible before second 4',              required: true },
  ],
  hook_iteration: [
    { key: 'hook_only',       item: 'Only the hook changed — rest is identical to control', required: true,
      question: 'What exactly did you change compared to the control ad?' },
    { key: 'version_count',   item: 'All requested hook variants delivered',        required: true },
  ],
  revision: [
    { key: 'feedback_read',   item: 'Previous feedback read and confirmed',         required: true,
      question: 'What feedback did you receive, and how did you address it?' },
    { key: 'all_points',      item: 'Every feedback point addressed',               required: true },
  ],
  new_vo:         [{ key: 'vo_script', item: 'Voice-over matches the Swedish script word-for-word', required: true }],
  ugc_iteration:  [{ key: 'creator_credit', item: 'Correct creator footage used',   required: true }],
  subtitle_fix:   [{ key: 'sub_sync', item: 'Subtitles synced and spell-checked',   required: true }],
  new_cta:        [{ key: 'cta_present', item: 'New CTA present and readable',      required: true }],
  format_change:  [{ key: 'all_formats', item: 'All requested formats exported',    required: true }],
  broll_variation:[], new_intro: [], export_upload: [],
};

/** Bygger checklistan för en task: bas + typspecifikt. */
export function checklistFor(taskType) {
  const extra = CHECKLIST_TEMPLATES[taskType] ?? [];
  return [...CHECKLIST_TEMPLATES._base, ...extra].map(c => ({
    ...c, answer: null, passed: null, answeredBy: null, answeredAt: null,
  }));
}

/** En task får bli approved bara om alla obligatoriska punkter är passed — eller override med skäl. */
export function canApprove(task, { override = false, overrideReason = '' } = {}) {
  const missing = (task.checklist ?? []).filter(c => c.required && c.passed !== true);
  if (missing.length === 0) return { ok: true, missing: [] };
  if (override && overrideReason.trim().length >= 10) return { ok: true, missing, overridden: true };
  return { ok: false, missing };
}

export const ROLES = { editor: 'editor', manager: 'manager', admin: 'admin' };

/** Behörighet. Editors rör bara sina egna tasks. */
export function canEditTask(user, task) {
  if (!user) return false;
  if (user.role === ROLES.admin || user.role === ROLES.manager) return true;
  return user.role === ROLES.editor && task.assignedEditorId === user.id;
}

export function canReview(user) {
  return user?.role === ROLES.manager || user?.role === ROLES.admin;
}
