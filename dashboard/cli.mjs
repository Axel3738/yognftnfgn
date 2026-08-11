#!/usr/bin/env node
// Redigerarpanel — CLI.
//
//   node cli.mjs build                 bygg dist/dashboard.html
//   node cli.mjs seed [--days 90]      generera demodata
//   node cli.mjs purge-demo            rensa alla demorader
//   node cli.mjs log <task> <event>    logga en händelse för hand
//   node cli.mjs ingest notion         polla Notion och bokför statusändringar
//   node cli.mjs ingest csv <fil>      importera CSV
//   node cli.mjs slack digest          posta lägesrapport i kanalen
//   node cli.mjs slack nudge           DM:a redigerare med öppna saker
//   node cli.mjs stats                 skriv ut nyckeltalen i terminalen
//
// Flaggor: --period <dagar>  --dry-run  --force  --config <fil>  --out <fil>

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readEvents, writeEvents, appendEvents, mergeEvents, foldTasks, loadEditors, EVENT_TYPES } from './src/store.mjs';
import { computeMetrics, revisionSeverity } from './src/metrics.mjs';
import { renderDashboard } from './src/render.mjs';
import { generateSeed } from './src/seed.mjs';
import { buildDigest, buildNudges, postWebhook, postApi } from './src/slack.mjs';
import { importCSV } from './src/ingest/csv.mjs';
import { formatDuration } from './src/time.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const P = {
  config: join(HERE, 'config.json'),
  events: join(HERE, 'data', 'events.jsonl'),
  editors: join(HERE, 'data', 'editors.json'),
  snapshot: join(HERE, 'data', 'notion-snapshot.json'),
  out: join(HERE, 'dist', 'dashboard.html'),
};

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) { flags[key] = next; i++; }
      else flags[key] = true;
    } else positional.push(a);
  }
  return { positional, flags };
}

const { positional, flags } = parseArgs(process.argv.slice(2));
const [command, ...rest] = positional;

if (flags.config) P.config = resolve(flags.config);
if (flags.out) P.out = resolve(flags.out);

const config = JSON.parse(readFileSync(P.config, 'utf8'));
const editors = loadEditors(P.editors);

function loadState() {
  const events = readEvents(P.events);
  return { events, tasks: foldTasks(events) };
}

function metricsFor(periodDays, now = Date.now()) {
  const { tasks } = loadState();
  return computeMetrics({ tasks, config, periodDays, now, editors });
}

const say = (...a) => console.log(...a);
const die = msg => { console.error(`\n✖ ${msg}\n`); process.exit(1); };

/* ------------------------------------------------------------------ build */

function cmdBuild() {
  const { events, tasks } = loadState();
  if (!events.length) die('Inga händelser i data/events.jsonl. Kör `node cli.mjs seed` för demodata, eller mata in riktig data med `ingest`.');

  const now = Date.now();
  const byPeriod = {};
  for (const d of config.periods) byPeriod[d] = computeMetrics({ tasks, config, periodDays: d, now, editors });

  const demo = events.some(e => e.source === 'demo');
  const html = renderDashboard({
    config, editors, byPeriod,
    defaultPeriod: config.defaultPeriodDays,
    demo,
  });

  mkdirSync(dirname(P.out), { recursive: true });
  writeFileSync(P.out, html, 'utf8');

  const m = byPeriod[config.defaultPeriodDays];
  say(`✔ Byggde ${P.out}`);
  say(`  ${events.length} händelser · ${tasks.length} tasks · ${m.editors.length} redigerare · ${m.flags.length} flaggor`);
  if (demo) say('  ⚠ Datan innehåller demorader (source:"demo").');
}

/* ------------------------------------------------------------------- seed */

function cmdSeed() {
  if (existsSync(P.events) && !flags.force) {
    die('data/events.jsonl finns redan. Kör med --force för att skriva över.');
  }
  if (!editors.length) die('data/editors.json är tom.');
  const days = Number(flags.days || 90);
  const events = generateSeed({ config, editors, days, now: Date.now() });
  writeEvents(P.events, events);
  say(`✔ Genererade ${events.length} demohändelser över ${days} dagar → ${P.events}`);
  say('  Alla rader är taggade source:"demo" och kan rensas med `node cli.mjs purge-demo`.');
}

function cmdPurgeDemo() {
  const events = readEvents(P.events);
  const kept = events.filter(e => e.source !== 'demo');
  writeEvents(P.events, kept);
  say(`✔ Tog bort ${events.length - kept.length} demorader. ${kept.length} kvar.`);
}

/* -------------------------------------------------------------------- log */

function cmdLog() {
  const [taskId, type] = rest;
  if (!taskId || !type) die('Användning: node cli.mjs log <task-id> <event> [--editor x --title "..." --round 2 --reason "..." --due <iso>]');
  if (!EVENT_TYPES.includes(type)) die(`Okänd händelse "${type}". Giltiga: ${EVENT_TYPES.join(', ')}`);

  const ev = {
    ts: flags.ts && flags.ts !== true ? new Date(flags.ts).toISOString() : new Date().toISOString(),
    type,
    task_id: taskId,
    source: 'cli',
  };
  for (const [flag, key] of [['editor', 'editor'], ['title', 'title'], ['type-of', 'task_type'],
    ['brand', 'brand'], ['reason', 'reason'], ['due', 'due']]) {
    if (flags[flag] && flags[flag] !== true) ev[key] = flags[flag];
  }
  if (flags.round && flags.round !== true) ev.round = Number(flags.round);

  appendEvents(P.events, [ev]);
  say(`✔ Bokförde ${type} för ${taskId} (${ev.ts})`);
}

/* ----------------------------------------------------------------- ingest */

async function cmdIngest() {
  const [kind, arg] = rest;

  if (kind === 'csv') {
    if (!arg) die('Användning: node cli.mjs ingest csv <fil.csv>');
    const { events: incoming, format } = importCSV(resolve(arg));
    const existing = readEvents(P.events);
    const { merged, added } = mergeEvents(existing, incoming);
    if (flags['dry-run']) {
      say(`(dry-run) ${format}-format · ${incoming.length} rader lästa · ${added} nya skulle läggas till.`);
      return;
    }
    writeEvents(P.events, merged);
    say(`✔ Importerade ${added} nya händelser (${format}-format, ${incoming.length} rader lästa).`);
    return;
  }

  if (kind === 'notion-rows') {
    if (!arg) die('Användning: node cli.mjs ingest notion-rows <uttag.json>');
    const { rowsToEvents } = await import('./src/ingest/notion-rows.mjs');
    const raw = JSON.parse(readFileSync(resolve(arg), 'utf8'));
    const rows = Array.isArray(raw) ? raw : raw.rows;
    if (!Array.isArray(rows)) die('Filen saknar en "rows"-array.');

    const { events: incoming, unknownStatuses, skipped } = rowsToEvents(rows, editors, raw.hub || 'notion');
    const existing = readEvents(P.events);
    const { merged, added } = mergeEvents(existing, incoming);

    if (unknownStatuses.length) {
      say(`⚠ Okända statusar (mappas inte): ${unknownStatuses.join(', ')}`);
      say('  Lägg till dem i STATE_BY_STATUS i src/ingest/notion-rows.mjs.');
    }
    if (skipped) say(`⚠ Hoppade över ${skipped} rader utan giltig createdTime.`);

    if (flags['dry-run']) {
      say(`(dry-run) ${rows.length} rader → ${incoming.length} händelser · ${added} nya.`);
      return;
    }
    writeEvents(P.events, merged);
    say(`✔ Importerade ${added} händelser från ${rows.length} Notion-rader (${raw.hub || 'notion'}).`);
    say('  Endast tilldelningstid är äkta. Nuvarande status bokförs utan tidpunkt —');
    say('  ledtider börjar mätas när `ingest notion` ser övergångar ske.');
    return;
  }

  if (kind === 'notion-comments') {
    if (!arg) die('Användning: node cli.mjs ingest notion-comments <kommentarer.json>');
    const { commentsToEvents } = await import('./src/ingest/notion-comments.mjs');
    const payload = JSON.parse(readFileSync(resolve(arg), 'utf8'));

    // Kommentarerna behöver veta vem som äger tasken — den kopplingen finns i
    // händelserna som redan importerats från raderna.
    const existing = readEvents(P.events);
    const tasksById = new Map(foldTasks(existing).map(t => [t.id, t]));

    const { events: incoming, coverage, checkedPages, pagesWithComments } =
      commentsToEvents(payload, editors, tasksById);
    const { merged, added } = mergeEvents(existing, incoming);

    if (flags['dry-run']) {
      say(`(dry-run) ${incoming.length} händelser ur ${payload.comments.length} kommentarer · ${added} nya.`);
      for (const e of incoming) say(`   ${e.ts}  ${e.type.padEnd(19)} ${e.editor ?? '?'}  ${e.title}`);
      return;
    }
    writeEvents(P.events, merged);
    say(`✔ ${added} händelser ur kommentarer (${pagesWithComments} av ${checkedPages} sidor hade kommentarer).`);
    say('  Täckning per person — låg täckning = siffror att ta med en nypa salt:');
    for (const c of coverage) {
      const ed = editors.find(e => e.id === c.editor);
      say(`   ${(ed?.name || c.editor).padEnd(20)} ${c.tasks} task(s), ${c.comments} kommentar(er)`);
    }
    return;
  }

  if (kind === 'notion') {
    const { pollNotion } = await import('./src/ingest/notion.mjs');
    const token = process.env.NOTION_TOKEN;
    const res = await pollNotion({ config, editors, snapshotPath: P.snapshot, token });
    const existing = readEvents(P.events);
    const { merged, added } = mergeEvents(existing, res.events);

    if (flags['dry-run']) {
      say(`(dry-run) ${res.pages} Notion-sidor · ${res.events.length} händelser härledda · ${added} nya.`);
      for (const e of res.events.slice(0, 20)) say(`   ${e.ts}  ${e.type.padEnd(19)} ${e.task_id}  ${e.editor ?? '?'}`);
      return;
    }
    writeEvents(P.events, merged);
    res.saveSnapshot();
    say(`✔ ${res.firstRun ? 'Baslinje skapad från' : 'Pollade'} ${res.pages} Notion-sidor · ${added} nya händelser.`);
    if (res.firstRun) say('  Kör igen med jämna mellanrum (t.ex. var 15:e min via cron) så fångas statusändringar löpande.');
    return;
  }

  die('Användning: node cli.mjs ingest <notion|csv> [fil]');
}

/* ------------------------------------------------------------------ slack */

async function cmdSlack() {
  const [kind] = rest;
  const period = Number(flags.period || config.defaultPeriodDays);
  const metrics = metricsFor(period);
  const dry = flags['dry-run'] === true || flags['dry-run'] === 'true';

  const webhook = process.env.SLACK_WEBHOOK_URL;
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = (flags.channel && flags.channel !== true) ? flags.channel : config.slack.channel;

  if (kind === 'digest') {
    const payload = buildDigest(metrics, config, {
      dashboardUrl: (flags.url && flags.url !== true) ? flags.url : undefined,
    });
    if (dry) { say(JSON.stringify(payload, null, 2)); return; }
    if (token) {
      const r = await postApi(token, channel, payload);
      if (!r.ok) die(`Slack svarade: ${JSON.stringify(r.body)}`);
      say(`✔ Digest postad i ${channel}`);
    } else if (webhook) {
      const r = await postWebhook(webhook, payload);
      if (!r.ok) die(`Slack svarade ${r.status}: ${r.body}`);
      say('✔ Digest postad via webhook');
    } else {
      die('Varken SLACK_BOT_TOKEN eller SLACK_WEBHOOK_URL är satt. Kör med --dry-run för att se vad som hade skickats.');
    }
    return;
  }

  if (kind === 'nudge') {
    const nudges = buildNudges(metrics, config);
    if (!nudges.length) { say('Inget att knuffa — inga öppna flaggor.'); return; }
    if (dry) { say(JSON.stringify(nudges, null, 2)); return; }
    if (!token) die('DM kräver SLACK_BOT_TOKEN (scopes: chat:write, im:write). Kör med --dry-run för att se meddelandena.');

    for (const n of nudges) {
      if (!n.slack) { say(`… hoppar över ${n.editor}: inget slack-id i data/editors.json`); continue; }
      const r = await postApi(token, n.slack, n.message);
      say(r.ok ? `✔ DM till ${n.editor}` : `✖ ${n.editor}: ${JSON.stringify(r.body)}`);
    }
    return;
  }

  die('Användning: node cli.mjs slack <digest|nudge> [--dry-run] [--channel #kanal] [--url <dashboard-url>]');
}

/* ------------------------------------------------------------------ stats */

function cmdStats() {
  const period = Number(flags.period || config.defaultPeriodDays);
  const m = metricsFor(period);
  const wd = config.workday;
  const pct = x => (x == null ? '–' : `${Math.round(x * 100)}%`);

  say(`\n  Redigerarläget – senaste ${period} dagarna  (arbetstid ${wd.start}–${wd.end}, ${config.timezone})\n`);
  say(`  Leveranser ${m.team.deliveries}   Median ledtid ${formatDuration(m.team.medianTurnaround, wd)}   ` +
      `Revisionsgrad ${pct(m.team.revisionRate)}   I tid ${pct(m.team.onTimeRate)}\n`);

  const rows = [['Redigerare', 'Lev.', 'Ledtid', 'p90', 'Pickup', 'Rev.%', 'Revtid', 'I tid', 'Öppna', 'Status']];
  for (const e of m.editors) {
    rows.push([
      e.name,
      String(e.stats.deliveries),
      formatDuration(e.stats.medianTurnaround, wd),
      formatDuration(e.stats.p90Turnaround, wd),
      formatDuration(e.stats.medianPickup, wd),
      pct(e.stats.revisionRate),
      formatDuration(e.stats.medianRevisionTurnaround, wd),
      pct(e.stats.onTimeRate),
      String(e.wip),
      revisionSeverity(e.stats.revisionRate, config.thresholds),
    ]);
  }
  const widths = rows[0].map((_, i) => Math.max(...rows.map(r => r[i].length)));
  rows.forEach((r, i) => {
    say('  ' + r.map((c, j) => (j === 0 ? c.padEnd(widths[j]) : c.padStart(widths[j]))).join('  '));
    if (i === 0) say('  ' + widths.map(w => '─'.repeat(w)).join('  '));
  });

  if (m.flags.length) {
    say(`\n  Behöver en knuff (${m.flags.length}):`);
    for (const f of m.flags.slice(0, 10)) {
      say(`   ${f.severity.padEnd(8)} ${f.task.padEnd(8)} ${(f.editor ?? '?').padEnd(8)} ${f.detail} — ${formatDuration(f.minutes, wd)}`);
    }
  }
  say('');
}

/* -------------------------------------------------------------------- run */

const COMMANDS = {
  build: cmdBuild,
  seed: cmdSeed,
  'purge-demo': cmdPurgeDemo,
  log: cmdLog,
  ingest: cmdIngest,
  slack: cmdSlack,
  stats: cmdStats,
};

if (!command || command === 'help' || flags.help) {
  say(readFileSync(fileURLToPath(import.meta.url), 'utf8')
    .split('\n').slice(1, 18).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exit(0);
}

const fn = COMMANDS[command];
if (!fn) die(`Okänt kommando "${command}". Kör \`node cli.mjs help\`.`);

try {
  await fn();
} catch (err) {
  die(err.message);
}
