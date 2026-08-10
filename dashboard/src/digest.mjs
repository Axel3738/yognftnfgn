/**
 * Bygger Slack-meddelandena. Regeln: varje meddelande ska gå att agera på.
 * Ingen siffervägg — det som skickas ut är kö, avvikelser och vem som gör vad.
 */

import { formatHours, formatPercent } from './util.mjs';

const SEVERITY_ICON = { warning: ':warning:', good: ':white_check_mark:', info: ':information_source:' };

function mention(person) {
  if (person?.slackUserId) return `<@${person.slackUserId}>`;
  return person?.editorName || person?.name || person?.editorId || 'okänd';
}

function section(text) {
  return { type: 'section', text: { type: 'mrkdwn', text } };
}

function header(text) {
  return { type: 'header', text: { type: 'plain_text', text, emoji: true } };
}

function context(text) {
  return { type: 'context', elements: [{ type: 'mrkdwn', text }] };
}

function taskLine(row, hoursPerDay) {
  const due = row.dueAt ? ` · deadline ${row.dueAt.slice(0, 10)}` : '';
  const rounds = row.rounds > 0 ? ` · runda ${row.rounds + 1}` : '';
  return `• *${row.title}* — ${mention(row)} · väntat ${formatHours(row.waitingHours, hoursPerDay)}${due}${rounds}`;
}

function dashboardLink(options) {
  const url = options.dashboardUrl || process.env.DASHBOARD_URL;
  return url ? `<${url}|Öppna dashboarden>` : null;
}

/** Dagligt läge: kön, det som brinner, och vad vi själva blockerar. */
export function buildDailyDigest(report, options = {}) {
  const hoursPerDay = options.hoursPerDay || 7;
  const q = report.queue;
  const k = report.team.kpis;
  const blocks = [header(`Redigering — läget ${report.range.to}`)];

  blocks.push(
    section(
      [
        `*Kö:* ${q.total} öppna · ${q.withEditor} hos redigerare · ${q.withReviewer} väntar på granskning hos oss`,
        `*Senaste ${report.range.days} dagarna:* ${k.tasksDelivered} leveranser (${k.outputPoints} poäng) · ` +
          `first-pass ${formatPercent(k.firstPassRate)} · median till första leverans ${formatHours(k.medianTimeToFirstDeliveryHours, hoursPerDay)}`,
      ].join('\n'),
    ),
  );

  if (q.overdue.length) {
    blocks.push({ type: 'divider' });
    blocks.push(
      section(
        `:rotating_light: *Försenade (${q.overdue.length})*\n` +
          q.overdue.slice(0, 6).map((r) => taskLine(r, hoursPerDay)).join('\n') +
          (q.overdue.length > 6 ? `\n_…och ${q.overdue.length - 6} till_` : ''),
      ),
    );
  }

  if (q.revisionsWaiting.length) {
    blocks.push(
      section(
        `:arrows_counterclockwise: *Revisions som ligger still (${q.revisionsWaiting.length})*\n` +
          q.revisionsWaiting.slice(0, 5).map((r) => taskLine(r, hoursPerDay)).join('\n'),
      ),
    );
  }

  if (q.stalled.length) {
    blocks.push(
      section(
        `:turtle: *Orörda hos redigerare (${q.stalled.length})*\n` +
          q.stalled.slice(0, 5).map((r) => taskLine(r, hoursPerDay)).join('\n'),
      ),
    );
  }

  // Vi mäter oss själva också — annars är dashboarden bara ett pekfinger.
  if (q.waitingOnUs.length) {
    const worst = q.waitingOnUs[0];
    blocks.push(
      section(
        `:eyes: *Väntar på oss:* ${q.waitingOnUs.length} leveranser ligger ogranskade ` +
          `(äldst: *${worst.title}*, ${formatHours(worst.waitingHours, hoursPerDay)}).`,
      ),
    );
  }

  const top = report.insights.filter((i) => i.severity !== 'good').slice(0, 2);
  if (top.length) {
    blocks.push({ type: 'divider' });
    for (const insight of top) {
      blocks.push(context(`${SEVERITY_ICON[insight.severity] || ''} ${insight.message} _${insight.action}_`));
    }
  }

  const link = dashboardLink(options);
  if (link) blocks.push(context(link));

  const text =
    `Redigering ${report.range.to}: ${q.total} öppna, ${q.overdue.length} försenade, ` +
    `${q.withReviewer} väntar på granskning.`;
  return { text, blocks };
}

/** Veckans scoreboard — jämförelse mellan redigerare, med rättvisemarkeringar. */
export function buildWeeklyScoreboard(report, options = {}) {
  const hoursPerDay = options.hoursPerDay || 7;
  const blocks = [header(`Veckorapport redigering — ${report.range.from} → ${report.range.to}`)];
  const k = report.team.kpis;
  const d = report.team.delta;

  // Pilen visar åt vilket håll siffran gick; ordet säger om det är bra eller dåligt
  // (för ledtider är nedåt bra, för output är uppåt bra).
  const trend = (key, invert = false) => {
    const delta = d[key];
    if (!delta || delta.absolute === null || delta.absolute === 0) return '';
    const better = invert ? delta.absolute < 0 : delta.absolute > 0;
    return ` ${delta.absolute > 0 ? '↑' : '↓'} _${better ? 'bättre' : 'sämre'}_`;
  };

  blocks.push(
    section(
      [
        `*Teamet:* ${k.tasksDelivered} leveranser · ${k.outputPoints} poäng${trend('outputPoints')}`,
        `*First-pass:* ${formatPercent(k.firstPassRate)}${trend('firstPassRate')} · ` +
          `*Median till första leverans:* ${formatHours(k.medianTimeToFirstDeliveryHours, hoursPerDay)}${trend('medianTimeToFirstDeliveryHours', true)}`,
        `*Median revisionsvändning:* ${formatHours(k.medianRevisionTurnaroundHours, hoursPerDay)} · ` +
          `*I tid:* ${formatPercent(k.onTimeRate)}`,
      ].join('\n'),
    ),
  );

  blocks.push({ type: 'divider' });
  const rows = report.editors
    .filter((e) => e.kpis.deliveriesTotal > 0)
    .map((e) => {
      const flag = e.sampleWarning ? ' _(litet underlag)_' : '';
      return (
        `• *${e.name}* — ${e.kpis.outputPoints} poäng / ${e.kpis.tasksDelivered} tasks · ` +
        `first-pass ${formatPercent(e.kpis.firstPassRate)} · ` +
        `median ${formatHours(e.kpis.medianTimeToFirstDeliveryHours, hoursPerDay)} · ` +
        `egna omgörningar ${formatPercent(e.kpis.attributableRevisionRate)}${flag}`
      );
    });
  blocks.push(section(rows.length ? rows.join('\n') : '_Ingen levererad output i perioden._'));

  if (report.revisionReasons.length) {
    const ours = report.revisionReasons.filter((r) => !r.attributable).reduce((n, r) => n + r.count, 0);
    const theirs = report.revisionReasons.filter((r) => r.attributable).reduce((n, r) => n + r.count, 0);
    blocks.push(
      context(
        `*Revisioner:* ${theirs} på utförande/teknik · ${ours} på brief, scope eller smakändringar från vår sida.`,
      ),
    );
  }

  for (const insight of report.insights.slice(0, 3)) {
    blocks.push(context(`${SEVERITY_ICON[insight.severity] || ''} ${insight.message} _${insight.action}_`));
  }

  if (report.dataQuality.length) {
    blocks.push(context(`:mag: Datakvalitet: ${report.dataQuality[0].message}`));
  }

  const link = dashboardLink(options);
  if (link) blocks.push(context(link));

  return {
    text: `Veckorapport redigering: ${k.tasksDelivered} leveranser, first-pass ${formatPercent(k.firstPassRate)}.`,
    blocks,
  };
}

/** Personliga påminnelser — en per redigerare som har något att göra. */
export function buildNudges(report, options = {}) {
  const hoursPerDay = options.hoursPerDay || 7;
  const byEditor = new Map();
  const bucket = (row) => {
    if (!byEditor.has(row.editorId)) {
      byEditor.set(row.editorId, {
        editorId: row.editorId,
        editorName: row.editorName,
        slackUserId: row.slackUserId,
        overdue: [],
        revisions: [],
        stalled: [],
        open: 0,
      });
    }
    return byEditor.get(row.editorId);
  };

  for (const row of report.queue.all) {
    if (row.currentOwner !== 'editor') continue;
    bucket(row).open += 1;
  }
  for (const row of report.queue.overdue) bucket(row).overdue.push(row);
  for (const row of report.queue.revisionsWaiting) bucket(row).revisions.push(row);
  for (const row of report.queue.stalled) bucket(row).stalled.push(row);

  const nudges = [];
  for (const entry of byEditor.values()) {
    if (!entry.overdue.length && !entry.revisions.length && !entry.stalled.length) continue;
    const blocks = [
      section(
        `Hej ${entry.editorName}! Såhär ser din kö ut just nu — ${entry.open} öppna tasks.`,
      ),
    ];
    if (entry.overdue.length) {
      blocks.push(
        section(
          `:rotating_light: *Över deadline (${entry.overdue.length})*\n` +
            entry.overdue.slice(0, 5).map((r) => `• ${r.title} (deadline ${r.dueAt?.slice(0, 10) || '—'})`).join('\n'),
        ),
      );
    }
    if (entry.revisions.length) {
      blocks.push(
        section(
          `:arrows_counterclockwise: *Väntande revisions (${entry.revisions.length})*\n` +
            entry.revisions
              .slice(0, 5)
              .map((r) => `• ${r.title} — ligger sedan ${formatHours(r.waitingHours, hoursPerDay)}`)
              .join('\n'),
        ),
      );
    }
    if (entry.stalled.length && !entry.revisions.length) {
      blocks.push(
        section(
          `:turtle: *Inte rörda på ett tag (${entry.stalled.length})*\n` +
            entry.stalled
              .slice(0, 5)
              .map((r) => `• ${r.title} — ${formatHours(r.waitingHours, hoursPerDay)}`)
              .join('\n'),
        ),
      );
    }
    blocks.push(context('Svara här om något är blockerat — då flyttar vi det istället för att låta det ligga.'));

    nudges.push({
      editorId: entry.editorId,
      editorName: entry.editorName,
      slackUserId: entry.slackUserId,
      text: `Din kö: ${entry.open} öppna, ${entry.overdue.length} försenade, ${entry.revisions.length} revisions.`,
      blocks,
    });
  }
  return nudges;
}
