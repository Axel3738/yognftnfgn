#!/usr/bin/env node
// Kommandoraden bakom dashboarden. Managern rör den sällan direkt —
// Claude kör den åt henne via slash-kommandona, och build.mjs gör HTML:en.
//
//   node dashboard/cli.mjs status [--date YYYY-MM-DD]
//   node dashboard/cli.mjs today <editorId>
//   node dashboard/cli.mjs review-queue
//   node dashboard/cli.mjs new --title "..." --product axelbaltet --editor maria \
//        --type new_creative --brief <url> [--due YYYY-MM-DD] [--creatives 3] [--priority high]
//   node dashboard/cli.mjs start <taskId> --as <userId>
//   node dashboard/cli.mjs block <taskId> --as <userId> --reason "..." [--needs "..."] [--owner anna]
//   node dashboard/cli.mjs deliver <taskId> --as <userId> --link <url> --creatives 3 [--answers key=yes,key2=no]
//   node dashboard/cli.mjs approve <taskId> --as anna [--override "skäl minst 10 tecken"]
//   node dashboard/cli.mjs changes <taskId> --as anna --feedback "..."
//   node dashboard/cli.mjs check <taskId> --as anna --key distinct_hooks --pass|--fail [--answer "..."]
//   node dashboard/cli.mjs assign <taskId> --as anna --to jomar
//   node dashboard/cli.mjs due <taskId> --as anna --date YYYY-MM-DD
//   node dashboard/cli.mjs plan <editorId> --as anna [--date YYYY-MM-DD] [--notes "..."]
//   node dashboard/cli.mjs report <editorId> --message "..." [--creatives 5] [--blockers "..."]
//   node dashboard/cli.mjs kpi <editorId> [--from D --to D]
//   node dashboard/cli.mjs product <productId> [--from D --to D]
//   node dashboard/cli.mjs history [taskId] [--limit 30]
//   node dashboard/cli.mjs export-csv <tasks|events|kpi> [--from D --to D]

import * as S from './lib/store.mjs';
import { STATUSES, TASK_TYPES, isLate } from './lib/model.mjs';
import { overview, editorKpis, productStatus, missingReports, quotaPerCycle, testShare } from './lib/kpi.mjs';

const argv = process.argv.slice(2);
const cmd = argv[0];
const positional = argv.slice(1).filter(a => !a.startsWith('--'));
const flag = (name, fallback = undefined) => {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = argv[i + 1];
  return next && !next.startsWith('--') ? next : true;
};
const has = name => argv.includes(`--${name}`);

const TODAY = flag('date', S.today());
const fmt = t => `${STATUSES[t.status].icon} ${t.id.padEnd(8)} ${t.title.slice(0, 42).padEnd(44)} ${t.assignedEditorId.padEnd(7)} ${t.productId.padEnd(16)} ${t.status}`;
const die = msg => { console.error(`\n✗ ${msg}\n`); process.exit(1); };

try {
  switch (cmd) {
    case 'status': {
      const o = overview(S.loadTasks(), S.loadEvents(), S.loadProducts(), flag('from', TODAY), flag('to', TODAY), TODAY);
      console.log(`\n=== ÖVERSIKT ${o.from}${o.to !== o.from ? ' – ' + o.to : ''} ===\n`);
      console.log(`Tasks ${o.totalTasks} · godkända ${o.approved} · pågår ${o.inProgress} · blockerade ${o.blocked} · sena ${o.late} · väntar granskning ${o.inReview}`);
      console.log(`Creatives: planerat ${o.creativesPlanned} · levererat ${o.creativesDelivered} · godkänt ${o.creativesApproved}\n`);
      console.log('PRODUKTER MOT KVOT');
      for (const p of o.products) {
        const icon = p.signal === 'ok' ? '🟢' : p.signal === 'warn' ? '🟡' : '🔴';
        console.log(`  ${icon} ${p.name.padEnd(34)} mål ${String(p.targetInRange).padStart(3)} · godkänt ${String(p.approved).padStart(3)} · ${p.diff >= 0 ? '+' : ''}${p.diff}`);
      }
      const missing = missingReports(S.loadTeam(), S.loadReports(), TODAY);
      console.log(`\nBEHÖVER DIN UPPMÄRKSAMHET (${o.attention.length})`);
      if (o.attention.length === 0) console.log('  (inget — allt rullar)');
      for (const a of o.attention) console.log(`  ${STATUSES[a.task.status].icon} ${a.task.id.padEnd(8)} ${(a.task.assignedEditorId ?? "ingen").padEnd(7)} ${a.why}`);
      if (missing.length) console.log(`\nSAKNAD SLUTRAPPORT: ${missing.map(m => m.name).join(', ')}`);
      console.log();
      break;
    }

    case 'today': {
      const editorId = positional[0] ?? die('Ange redigerare: node dashboard/cli.mjs today maria');
      const tasks = S.loadTasks().filter(t => t.assignedEditorId === editorId && (t.plannedDate === TODAY || ['in_progress','blocked','changes'].includes(t.status)));
      const plan = S.loadPlans().find(p => p.editorId === editorId && p.date === TODAY);
      const doneCreatives = tasks.filter(t => t.completedAt?.startsWith(TODAY)).reduce((s, t) => s + t.deliveredCreativeCount, 0);
      const goal = plan?.plannedCreativeCount ?? tasks.reduce((s, t) => s + t.plannedCreativeCount, 0);
      console.log(`\n=== ${editorId.toUpperCase()} · ${TODAY} ===`);
      console.log(`Goal: ${goal} creatives · Delivered so far: ${doneCreatives}`);
      if (plan?.managerNotes) console.log(`Note from manager: ${plan.managerNotes}`);
      console.log();
      const order = { high: 0, normal: 1, low: 2 };
      for (const t of tasks.sort((a, b) => order[a.priority] - order[b.priority] || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))) {
        console.log(`  ${STATUSES[t.status].icon} ${t.id}  ${t.title}`);
        console.log(`      ${TASK_TYPES[t.taskType]} · ${t.plannedCreativeCount} creatives · due ${t.dueDate ?? '–'}${isLate(t, TODAY) ? '  ⚠ LATE' : ''}`);
        console.log(`      brief: ${t.briefLink}`);
        if (t.status === 'blocked') console.log(`      ■ BLOCKED: ${t.blockerReason}`);
        if (t.feedbackHistory.length) console.log(`      ↺ feedback: ${t.feedbackHistory.at(-1).feedback}`);
      }
      if (!tasks.length) console.log('  (inga tasks — be managern publicera dagens plan)');
      console.log();
      break;
    }

    case 'review-queue': {
      const q = S.loadTasks().filter(t => t.status === 'in_review')
        .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''));
      console.log(`\n=== REVIEW-KÖ (${q.length}) ===\n`);
      for (const t of q) {
        const req = t.checklist.filter(c => c.required);
        const open = req.filter(c => c.passed !== true);
        console.log(`${t.id}  ${t.title}`);
        console.log(`   ${t.assignedEditorId} · ${t.productId} · ${t.deliveredCreativeCount} creatives · levererad ${t.completedAt?.slice(0,16).replace('T',' ')}`);
        console.log(`   checklista: ${req.length - open.length}/${req.length} gröna${open.length ? ' → SAKNAS: ' + open.map(c => c.key).join(', ') : '  ✓ klar för godkännande'}`);
        console.log(`   leverans: ${t.deliveryLink}`);
        if (t.feedbackHistory.length) console.log(`   tidigare feedback (v${t.currentRevision}): ${t.feedbackHistory.at(-1).feedback}`);
        console.log();
      }
      if (!q.length) console.log('  (tomt — inget väntar på dig)\n');
      break;
    }

    case 'new': {
      const t = S.createTask({
        title: flag('title') || die('--title krävs'),
        productId: flag('product') || die('--product krävs'),
        assignedEditorId: flag('editor') || die('--editor krävs'),
        taskType: flag('type', 'new_creative'),
        createdBy: flag('as', 'anna'),
        briefLink: flag('brief') || die('--brief krävs (en task utan brief kan inte levereras rätt)'),
        priority: flag('priority', 'normal'),
        plannedDate: flag('planned', TODAY),
        dueDate: flag('due', TODAY),
        plannedCreativeCount: Number(flag('creatives', 1)),
        estimatedMinutes: Number(flag('minutes', 60)),
        sourceMaterialLink: flag('source', ''),
      });
      console.log(`✓ ${t.id} skapad → ${t.assignedEditorId} (${t.plannedCreativeCount} creatives, due ${t.dueDate ?? '–'})`);
      break;
    }

    case 'start':
      console.log(`✓ ${S.setStatus(positional[0], flag('as') || die('--as krävs'), 'in_progress', { source: flag('source', 'cli') }).id} → pågår`);
      break;

    case 'block': {
      const t = S.reportBlocker(positional[0], flag('as') || die('--as krävs'), flag('reason') || die('--reason krävs'),
        { needs: flag('needs', ''), owner: flag('owner', ''), source: flag('source', 'cli') });
      console.log(`■ ${t.id} blockerad — syns nu i managerns översikt`);
      break;
    }

    case 'deliver': {
      const answers = {};
      for (const pair of String(flag('answers', '')).split(',').filter(Boolean)) {
        const [k, v] = pair.split('=');
        answers[k] = v === 'no' || v === 'false' ? false : v;
      }
      const t = S.submitForReview(positional[0], flag('as') || die('--as krävs'), {
        deliveryLink: flag('link') || die('--link krävs (leveranslänk)'),
        deliveredCreativeCount: Number(flag('creatives', 0)),
        answers, source: flag('source', 'cli'),
      });
      const open = t.checklist.filter(c => c.required && c.passed !== true);
      console.log(`◆ ${t.id} → redo för granskning (${t.deliveredCreativeCount} creatives)`);
      if (open.length) console.log(`  Kvar att besvara: ${open.map(c => c.key).join(', ')}`);
      break;
    }

    case 'approve': {
      const override = flag('override');
      const t = S.reviewTask(positional[0], flag('as') || die('--as krävs'), 'approve',
        { override: !!override, overrideReason: typeof override === 'string' ? override : '', source: flag('source', 'cli') });
      console.log(`✓ ${t.id} GODKÄND${override ? ' (override)' : ''}`);
      break;
    }

    case 'changes': {
      const t = S.reviewTask(positional[0], flag('as') || die('--as krävs'), 'changes',
        { feedback: flag('feedback') || die('--feedback krävs'), source: flag('source', 'cli') });
      console.log(`↺ ${t.id} → ändringar krävs (runda ${t.currentRevision})`);
      break;
    }

    case 'check': {
      if (!has('pass') && !has('fail')) die('Ange --pass eller --fail');
      const t = S.answerChecklist(positional[0], flag('as') || die('--as krävs'), flag('key') || die('--key krävs'), has('pass'), flag('answer', ''));
      const open = t.checklist.filter(c => c.required && c.passed !== true);
      console.log(`${has('pass') ? '✓' : '✗'} ${t.id}/${flag('key')} — ${open.length} obligatoriska punkter kvar`);
      break;
    }

    case 'assign':
      console.log(`✓ ${S.reassign(positional[0], flag('as') || die('--as krävs'), flag('to') || die('--to krävs')).id} omtilldelad`);
      break;

    case 'due':
      console.log(`✓ ${S.setDueDate(positional[0], flag('as') || die('--as krävs'), flag('date') || die('--date krävs')).id} ny deadline`);
      break;

    case 'plan': {
      const p = S.publishDailyPlan(positional[0] || die('Ange redigerare'), TODAY, flag('as', 'anna'), flag('notes', ''));
      console.log(`✓ Plan publicerad: ${p.editorId} ${p.date} — ${p.plannedTaskCount} tasks / ${p.plannedCreativeCount} creatives`);
      break;
    }

    case 'report': {
      const r = S.submitDailyReport({
        editorId: positional[0] || die('Ange redigerare'), date: TODAY,
        rawMessage: flag('message') || die('--message krävs'),
        summary: flag('summary', ''),
        deliveredCreativeCount: Number(flag('creatives', 0)),
        blockers: flag('blockers', ''), needsHelp: has('help'), source: flag('source', 'cli'),
      });
      console.log(`✓ Slutrapport sparad: ${r.editorId} ${r.date}`);
      break;
    }

    case 'kpi': {
      const editorId = positional[0] ?? die('Ange redigerare');
      const k = editorKpis(S.loadTasks(), S.loadEvents(), editorId, flag('from', TODAY), flag('to', TODAY), TODAY);
      const user = S.findUser(editorId);
      console.log(`\n=== KPI ${user?.name ?? editorId} · ${flag('from', TODAY)} – ${flag('to', TODAY)} ===\n`);
      const row = (label, v, suffix = '') => console.log(`  ${label.padEnd(34)} ${v === null ? '–' : v}${suffix}`);
      console.log(' OUTPUT');
      row('Tasks delivered', k.tasksDelivered); row('Tasks approved', k.tasksApproved);
      row('Creatives delivered', k.creativesDelivered); row('Creatives approved', k.creativesApproved);
      console.log('\n LEVERANSSÄKERHET');
      row('On-time delivery rate', k.onTimeRate, '%'); row('Late tasks (now)', k.lateTasks);
      row('Avg delay', k.avgDelayDays, ' dagar');
      console.log('\n KVALITET');
      row('First-pass approval rate', k.firstPassRate, '%'); row('Revision rate', k.revisionRate, '%');
      row('Avg revision rounds', k.avgRevisionRounds);
      console.log('\n TID');
      row('Start → leverans', k.avgHoursStartToDelivery, ' h'); row('Leverans → godkänd', k.avgHoursDeliveryToApproval, ' h');
      console.log('\n KONTEXT (läs KPI:erna mot detta, inte som ranking)');
      row('Öppna tasks nu', k.openTasks); row('Snitt creatives per task', k.avgPlannedCreativesPerTask);
      row('Blockers rapporterade', k.blockersReported); row('Slutrapporter inlämnade', k.reportsSubmitted);
      if (user?.profile?.notes) console.log(`\n  Not: ${user.profile.notes}`);
      console.log();
      break;
    }

    case 'product': {
      const p = S.findProduct(positional[0]) ?? die(`Okänd produkt: ${positional[0]}`);
      const st = productStatus(p, S.loadTasks(), flag('from', TODAY), flag('to', TODAY));
      const icon = st.signal === 'ok' ? '🟢' : st.signal === 'warn' ? '🟡' : '🔴';
      console.log(`\n=== ${p.name} ===\n`);
      console.log(`  Budget ${p.daily_budget_sek} kr/dag · testandel ${testShare(p.daily_budget_sek) * 100} % · target-CPA ${p.target_cpa_sek} kr`);
      console.log(`  Kvot: ${quotaPerCycle(p)} creatives per 3-dagarscykel (${st.targetPerDay}/dag)`);
      console.log(`  Break-even-ROAS ${p.break_even_roas ?? '–'} · target-ROAS ${p.target_roas_25pct ?? '–'}\n`);
      console.log(`  I backlog ${st.inBacklog} · i produktion ${st.inProduction} · levererat ${st.delivered} · godkänt ${st.approved}`);
      console.log(`  ${icon} ${st.diff >= 0 ? '+' : ''}${st.diff} mot mål (${st.targetInRange})`);
      console.log(`  Redigerare: ${st.editors.join(', ') || '–'} · blockers ${st.blockers}\n`);
      break;
    }

    case 'history': {
      const taskId = positional[0];
      const limit = Number(flag('limit', 30));
      const evs = S.loadEvents().filter(e => !taskId || e.taskId === taskId).slice(-limit);
      console.log(`\n=== HISTORIK${taskId ? ' ' + taskId : ''} (${evs.length}) ===\n`);
      for (const e of evs) {
        const arrow = e.oldStatus && e.newStatus ? ` ${e.oldStatus}→${e.newStatus}` : '';
        console.log(`  ${e.createdAt.slice(0, 16).replace('T', ' ')}  ${(e.taskId ?? '–').padEnd(8)} ${e.userId.padEnd(7)} ${e.type}${arrow}  [${e.source}]`);
        if (e.message) console.log(`      ${e.message.slice(0, 100)}`);
      }
      console.log();
      break;
    }

    case 'export-csv': {
      const what = positional[0] ?? 'tasks';
      const esc = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
      if (what === 'tasks') {
        console.log('id,title,product,editor,type,priority,status,plannedDate,dueDate,completedAt,approvedAt,plannedCreatives,deliveredCreatives,revisions');
        for (const t of S.loadTasks()) console.log([t.id, t.title, t.productId, t.assignedEditorId, t.taskType, t.priority, t.status, t.plannedDate, t.dueDate, t.completedAt, t.approvedAt, t.plannedCreativeCount, t.deliveredCreativeCount, t.currentRevision].map(esc).join(','));
      } else if (what === 'events') {
        console.log('id,createdAt,taskId,userId,type,oldStatus,newStatus,source,message');
        for (const e of S.loadEvents()) console.log([e.id, e.createdAt, e.taskId, e.userId, e.type, e.oldStatus, e.newStatus, e.source, e.message].map(esc).join(','));
      } else if (what === 'kpi') {
        const editors = S.loadTeam().users.filter(u => u.role === 'editor');
        console.log('editor,tasksDelivered,tasksApproved,creativesDelivered,creativesApproved,onTimeRate,firstPassRate,revisionRate,avgRevisionRounds,lateTasks');
        for (const e of editors) {
          const k = editorKpis(S.loadTasks(), S.loadEvents(), e.id, flag('from', TODAY), flag('to', TODAY), TODAY);
          console.log([e.name, k.tasksDelivered, k.tasksApproved, k.creativesDelivered, k.creativesApproved, k.onTimeRate, k.firstPassRate, k.revisionRate, k.avgRevisionRounds, k.lateTasks].map(esc).join(','));
        }
      } else die(`Okänd export: ${what} (tasks|events|kpi)`);
      break;
    }

    default:
      console.log(`
Bäverbutiken · redigerardashboard

  status [--date D] [--from D --to D]   Managerns översikt
  today <editor>                        Redigerarens dagslista
  review-queue                          Allt som väntar på granskning
  new --title .. --product .. --editor .. --type .. --brief <url>
  start|block|deliver|approve|changes|check|assign|due  <taskId> --as <user>
  plan <editor> --as anna               Publicera dagens plan
  report <editor> --message "..."       Slutrapport
  kpi <editor> [--from D --to D]        KPI:er
  product <id>                          Produktens läge mot kvoten
  history [taskId]                      Audit-logg
  export-csv tasks|events|kpi           CSV till stdout

Bygg HTML-dashboarden:  node dashboard/build.mjs
`);
  }
} catch (err) {
  die(err.message);
}
