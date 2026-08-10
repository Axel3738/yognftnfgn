#!/usr/bin/env node
/**
 * edash — CLI för redigerar-dashboarden.
 *
 *   node edash.mjs serve [--port 4173]          starta dashboarden
 *   node edash.mjs seed [--days 60] [--force]   fyll med realistisk demodata
 *   node edash.mjs log <typ> nyckel=värde ...   logga ett event
 *   node edash.mjs import <fil>                 importera .jsonl/.json/.csv
 *   node edash.mjs report [--from --to]         textrapport i terminalen
 *   node edash.mjs slack daily|weekly|nudge     skicka till Slack (--dry testar)
 *   node edash.mjs validate                     kontrollera eventloggen
 *   node edash.mjs types                        visa eventschemat
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readEvents, appendEvent, appendEvents, resolveStorePath, DEFAULT_STORE } from './src/store.mjs';
import { EVENT_TYPES, ValidationError } from './src/events.mjs';
import { computeReport } from './src/metrics.mjs';
import { generateSeed } from './src/seed.mjs';
import { createServer } from './src/server.mjs';
import { createSlackClient } from './src/slack.mjs';
import { buildDailyDigest, buildWeeklyScoreboard, buildNudges } from './src/digest.mjs';
import { formatHours, formatPercent, addDays } from './src/util.mjs';
import { WorkCalendar, localDate } from './src/worktime.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

/** Flaggor utan värde — allt annat tar nästa token som värde (--days 60). */
const BOOLEAN_FLAGS = new Set(['dry', 'force', 'help', 'json']);

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }
    const eq = arg.indexOf('=');
    if (eq !== -1) {
      flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (!BOOLEAN_FLAGS.has(key) && next !== undefined && !next.startsWith('--')) {
      flags[key] = next;
      i++;
    } else {
      flags[key] = true;
    }
  }
  return { flags, positional };
}

function loadConfig(flags) {
  const file = flags.config ? path.resolve(flags.config) : path.join(ROOT, 'config.json');
  if (!fs.existsSync(file)) throw new Error(`Hittar ingen config: ${file}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function storePath(flags) {
  return resolveStorePath(flags.store || process.env.EDASH_STORE || DEFAULT_STORE, ROOT);
}

function loadEvents(flags, { strict = false } = {}) {
  const file = storePath(flags);
  const { events, problems } = readEvents(file);
  if (problems.length) {
    const preview = problems.slice(0, 5).map((p) => `  rad ${p.line}: ${p.message}`).join('\n');
    const message = `${problems.length} trasig(a) rad(er) i ${file}:\n${preview}`;
    if (strict) throw new Error(message);
    console.warn(`⚠️  ${message}\n   (kör "node edash.mjs validate" för hela listan)`);
  }
  return { file, events, problems };
}

function reportOptions(flags, config) {
  const cal = new WorkCalendar(config);
  const to = flags.to || localDate(new Date(), cal.timezone);
  const days = Number(flags.days || 30);
  const from = flags.from || addDays(to, -(days - 1));
  return {
    from,
    to,
    brand: flags.brand,
    kind: flags.kind,
    editorId: flags.editor,
  };
}

/* ------------------------------------------------------------------ */

const commands = {
  async serve(flags) {
    const config = loadConfig(flags);
    const file = storePath(flags);
    const port = Number(flags.port || process.env.PORT || 4173);
    if (!fs.existsSync(file)) {
      console.warn(`⚠️  ${file} finns inte än — dashboarden blir tom.`);
      console.warn('   Kör "node edash.mjs seed" för demodata, eller börja logga event.');
    }
    const server = createServer({ storeFile: file, config });
    server.listen(port, () => {
      console.log(`▶  Dashboard: http://localhost:${port}`);
      console.log(`   Data: ${file}`);
    });
  },

  async seed(flags) {
    const config = loadConfig(flags);
    const file = storePath(flags);
    if (fs.existsSync(file) && fs.statSync(file).size > 0 && !flags.force) {
      throw new Error(`${file} innehåller redan data. Kör med --force för att lägga till ändå.`);
    }
    const events = generateSeed(config, {
      days: Number(flags.days || 60),
      seed: Number(flags.seed || 20260810),
    });
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (flags.force && fs.existsSync(file)) fs.writeFileSync(file, '');
    appendEvents(file, events);
    console.log(`✔  ${events.length} demo-event skrivna till ${file}`);
    console.log('   Starta med: node edash.mjs serve');
  },

  async log(flags, positional) {
    const [type, ...pairs] = positional;
    if (!type) throw new Error('Ange eventtyp. Se "node edash.mjs types".');
    const event = { type };
    for (const pair of pairs) {
      const idx = pair.indexOf('=');
      if (idx === -1) throw new Error(`Förväntade nyckel=värde, fick "${pair}"`);
      const key = pair.slice(0, idx);
      const value = pair.slice(idx + 1);
      event[key] = /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
    }
    if (flags.ts) event.ts = flags.ts;
    const file = storePath(flags);
    const written = appendEvent(file, event);
    console.log(`✔  ${written.type} ${written.taskId || written.editorId || ''} @ ${written.ts}`);
  },

  async import(flags, positional) {
    const source = positional[0];
    if (!source) throw new Error('Ange en fil att importera.');
    const text = fs.readFileSync(source, 'utf8');
    const ext = path.extname(source).toLowerCase();
    let rows;
    if (ext === '.jsonl' || ext === '.ndjson') {
      rows = text.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => JSON.parse(l));
    } else if (ext === '.json') {
      const parsed = JSON.parse(text);
      rows = Array.isArray(parsed) ? parsed : parsed.events;
    } else if (ext === '.csv') {
      rows = parseCsv(text);
    } else {
      throw new Error(`Okänt filformat: ${ext}. Stöds: .jsonl, .json, .csv`);
    }
    const file = storePath(flags);
    const written = appendEvents(file, rows);
    console.log(`✔  ${written.length} event importerade till ${file}`);
  },

  async validate(flags) {
    const { file, events, problems } = loadEvents(flags);
    console.log(`Fil: ${file}`);
    console.log(`Event: ${events.length}`);
    if (!problems.length) {
      console.log('✔  Inga fel i loggen.');
    } else {
      console.log(`✖  ${problems.length} problem:`);
      for (const p of problems) console.log(`   rad ${p.line}: ${p.message}`);
    }
    // Logiska luckor som inte är syntaxfel men gör siffror missvisande.
    const config = loadConfig(flags);
    const report = computeReport(events, config, reportOptions(flags, config));
    if (report.dataQuality.length) {
      console.log('\nDatakvalitet:');
      for (const issue of report.dataQuality) console.log(`   • ${issue.message}`);
    }
    if (problems.length) process.exitCode = 1;
  },

  async report(flags) {
    const config = loadConfig(flags);
    const { events } = loadEvents(flags);
    const report = computeReport(events, config, reportOptions(flags, config));
    const cal = new WorkCalendar(config);
    const h = (v) => formatHours(v, cal.hoursPerDay);
    const k = report.team.kpis;

    console.log(`\n═ Redigerar-dashboard ${report.range.from} → ${report.range.to} `.padEnd(78, '═'));
    console.log(
      `Team: ${k.tasksDelivered} leveranser · ${k.outputPoints} poäng · first-pass ${formatPercent(k.firstPassRate)} · ` +
        `median till leverans ${h(k.medianTimeToFirstDeliveryHours)} · i tid ${formatPercent(k.onTimeRate)}`,
    );
    console.log(
      `Kö: ${report.queue.total} öppna (${report.queue.withEditor} hos redigerare, ` +
        `${report.queue.withReviewer} hos oss) · ${report.queue.overdue.length} försenade\n`,
    );

    const rows = report.editors.filter((e) => e.kpis.deliveriesTotal > 0 || e.wip > 0);
    const cols = [
      ['Redigerare', (e) => e.name, 18],
      ['Poäng', (e) => String(e.kpis.outputPoints ?? 0), 6],
      ['Tasks', (e) => String(e.kpis.tasksDelivered), 6],
      ['Först klar', (e) => h(e.kpis.medianTimeToFirstDeliveryHours), 11],
      ['p90', (e) => h(e.kpis.p90TimeToFirstDeliveryHours), 8],
      ['Rev.vändn.', (e) => h(e.kpis.medianRevisionTurnaroundHours), 11],
      ['Omgörn.', (e) => formatPercent(e.kpis.attributableRevisionRate), 8],
      ['1:a rätt', (e) => formatPercent(e.kpis.firstPassRate), 9],
      ['Belägg.', (e) => formatPercent(e.kpis.utilization), 8],
      ['WIP', (e) => `${e.wip}${e.overdue ? ` (${e.overdue}!)` : ''}`, 7],
    ];
    console.log(cols.map(([label, , w]) => label.padEnd(w)).join(''));
    console.log('─'.repeat(cols.reduce((n, c) => n + c[2], 0)));
    for (const e of rows) {
      const line = cols.map(([, fn, w]) => String(fn(e)).padEnd(w)).join('');
      console.log(e.sampleWarning ? `${line} ⚠ litet underlag` : line);
    }

    if (report.insights.length) {
      console.log('\nObservationer:');
      for (const i of report.insights) {
        const icon = i.severity === 'warning' ? '⚠' : i.severity === 'good' ? '✔' : 'ℹ';
        console.log(`  ${icon} ${i.message}\n    → ${i.action}`);
      }
    }
    if (report.dataQuality.length) {
      console.log('\nDatakvalitet:');
      for (const issue of report.dataQuality) console.log(`  • ${issue.message}`);
    }
    console.log('');
  },

  async slack(flags, positional) {
    const kind = positional[0] || 'daily';
    const config = loadConfig(flags);
    const { events } = loadEvents(flags);
    const cal = new WorkCalendar(config);
    const options = reportOptions(flags, config);
    if (kind === 'weekly' && !flags.days && !flags.from) {
      options.from = addDays(options.to, -6);
    }
    const report = computeReport(events, config, options);
    const client = createSlackClient({ dryRun: Boolean(flags.dry) });
    const channel = flags.channel || process.env.SLACK_CHANNEL || config.slack?.channel;
    const opts = { hoursPerDay: cal.hoursPerDay, dashboardUrl: flags.url || process.env.DASHBOARD_URL };

    if (kind === 'daily' || kind === 'weekly') {
      const message = kind === 'daily' ? buildDailyDigest(report, opts) : buildWeeklyScoreboard(report, opts);
      await client.send({ channel, ...message, label: kind });
      console.log(`✔  ${kind}-rapport ${flags.dry ? 'genererad (dry run)' : `skickad till ${channel}`}`);
      return;
    }

    if (kind === 'nudge') {
      const nudges = buildNudges(report, opts);
      if (!nudges.length) {
        console.log('✔  Inget att påminna om — ingen har försenat eller liggande revisions.');
        return;
      }
      if (!client.canDm && !flags.dry) {
        console.log(
          `⚠️  Ingen bot-token — kan inte DM:a. Postar sammanfattning i ${channel} istället.`,
        );
        const summary = {
          text: 'Påminnelser',
          blocks: nudges.flatMap((n) => n.blocks),
        };
        await client.send({ channel, ...summary, label: 'nudges (kanal)' });
        return;
      }
      for (const nudge of nudges) {
        const target = nudge.slackUserId || channel;
        await client.send({ channel: target, text: nudge.text, blocks: nudge.blocks, label: `nudge → ${nudge.editorName}` });
        console.log(`✔  Påminnelse ${flags.dry ? 'genererad' : 'skickad'} till ${nudge.editorName}`);
      }
      return;
    }

    throw new Error(`Okänt slack-kommando "${kind}". Giltiga: daily, weekly, nudge`);
  },

  async types() {
    console.log('\nEventtyper:\n');
    for (const [type, spec] of Object.entries(EVENT_TYPES)) {
      console.log(`  ${type}`);
      console.log(`    ${spec.doc}`);
      console.log(`    obligatoriskt: ${spec.required.join(', ') || '—'}`);
      console.log(`    frivilligt:    ${spec.optional.join(', ') || '—'}\n`);
    }
    console.log('Exempel:');
    console.log('  node edash.mjs log task_assigned taskId=T-0042 editorId=ed_lina');
    console.log('  node edash.mjs log revision_requested taskId=T-0042 reason=brief');
    console.log('  node edash.mjs log work_logged editorId=ed_lina minutes=95 taskId=T-0042\n');
  },

  async help() {
    console.log(
      [
        '',
        'edash — dashboard för redigerarnas output, ledtider och revisions.',
        '',
        '  serve [--port 4173]            starta dashboarden i webbläsaren',
        '  seed [--days 60] [--force]     fyll med realistisk demodata',
        '  log <typ> nyckel=värde ...     logga ett event',
        '  import <fil.jsonl|json|csv>    importera event från annat system',
        '  report [--days 30] [--from --to] textrapport i terminalen',
        '  slack daily|weekly|nudge [--dry]  skicka rapport/påminnelser till Slack',
        '  validate                       kontrollera loggen + datakvalitet',
        '  types                          visa eventschemat',
        '',
        'Gemensamma flaggor: --store <fil> --config <fil> --brand --kind --editor',
        '',
      ].join('\n'),
    );
  },
};

/* ------------------------------------------------------------------ */

function parseCsv(text) {
  const lines = text.split('\n').filter((l) => l.trim());
  if (!lines.length) return [];
  const split = (line) => {
    const out = [];
    let cur = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (quoted) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') quoted = false;
        else cur += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') {
        out.push(cur);
        cur = '';
      } else cur += ch;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = split(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = split(line);
    const row = {};
    headers.forEach((headerName, i) => {
      const value = cells[i];
      if (value === undefined || value === '') return;
      row[headerName] = /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;
    });
    return row;
  });
}

const { flags, positional } = parseArgs(process.argv.slice(2));
const command = positional.shift() || 'help';
const handler = commands[command] || commands.help;

try {
  await handler(flags, positional);
} catch (err) {
  if (err instanceof ValidationError) console.error(`✖  ${err.message}`);
  else console.error(`✖  ${err.message}`);
  process.exitCode = 1;
}
