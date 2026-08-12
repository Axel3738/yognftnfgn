#!/usr/bin/env node
// Redigerarpanel — CLI.
//
//   node cli.mjs build                 bygg dist/dashboard.html
//   node cli.mjs seed [--days 90]      generera demodata
//   node cli.mjs purge-demo            rensa alla demorader
//   node cli.mjs log <task> <event>    logga en händelse för hand
//   node cli.mjs check-notion          testa token + att varje hub är insläppt
//   node cli.mjs ingest notion-all     hämta alla rader OCH alla kommentarer
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
import { computePayout, projectMonth } from './src/payout.mjs';
import { formatDuration } from './src/time.mjs';
import { trackOf } from './src/track.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const P = {
  config: join(HERE, 'config.json'),
  events: join(HERE, 'data', 'events.jsonl'),
  editors: join(HERE, 'data', 'editors.json'),
  snapshot: join(HERE, 'data', 'notion-snapshot.json'),
  meta: join(HERE, 'data', 'meta-ads.json'),
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

  // Flikar = teamspace × spår. Produktion och översättning är två olika
  // arbeten med olika folk och olika tempo; mäts de ihop döljer de varandra.
  // Översättningarna får därför egna flikar i stället för att blandas in.
  const track = new Map(tasks.map(t => [t.id, trackOf(t)]));
  const has = (wsId, tr) => tasks.some(t =>
    (wsId === 'all' ? true : wsId === 'unassigned' ? !t.workspace : t.workspace === wsId) &&
    track.get(t.id) === tr);

  const spaces = [{ id: 'all', name: 'Alla annonser' }];
  for (const ws of config.workspaces || []) {
    if (has(ws.id, 'production')) spaces.push({ id: ws.id, name: ws.name });
  }
  if (has('unassigned', 'production')) spaces.push({ id: 'unassigned', name: 'Utan teamspace' });
  // Översättningsflikarna sist, så det vanliga arbetet ligger först.
  for (const ws of config.workspaces || []) {
    if (has(ws.id, 'translation')) {
      spaces.push({ id: ws.id + ':translation', name: ws.name + ' · Översättning', track: 'translation' });
    }
  }
  if (has('unassigned', 'translation')) {
    spaces.push({ id: 'unassigned:translation', name: 'Utan teamspace · Översättning', track: 'translation' });
  }

  const byWorkspace = {};
  for (const space of spaces) {
    const wantTrack = space.track || 'production';
    const wsId = space.id.replace(/:translation$/, '');
    const subset = tasks.filter(t => {
      if (track.get(t.id) !== wantTrack) return false;
      if (wsId === 'all') return true;
      if (wsId === 'unassigned') return !t.workspace;
      return t.workspace === wsId;
    });
    byWorkspace[space.id] = {};
    for (const d of config.periods) {
      byWorkspace[space.id][d] = computeMetrics({ tasks: subset, config, periodDays: d, now, editors });
    }
  }

  // Ersättningen: 0,4% av adspenden på de annonser man gjort. Finns inget
  // Meta-uttag byggs panelen precis som förut, bara utan lönefliken.
  let payout = null;
  if (existsSync(P.meta)) {
    try {
      const meta = JSON.parse(readFileSync(P.meta, 'utf8'));
      const rows = meta.rows || [];
      if (rows.length) {
        payout = computePayout({
          metaRows: rows, tasks, editors,
          rate: config.meta?.payoutRate ?? 0.004,
        });
        payout.fetchedAt = meta.fetchedAt || null;
        payout.currency = config.meta?.currency || 'SEK';
      }
    } catch (err) {
      say(`  ⚠ Kunde inte läsa Meta-uttaget: ${err.message}`);
    }
  }

  const demo = events.some(e => e.source === 'demo');
  const html = renderDashboard({
    config, editors, byWorkspace, spaces,
    defaultWorkspace: spaces.length > 1 ? spaces[0].id : spaces[0].id,
    defaultPeriod: config.defaultPeriodDays,
    demo, payout,
  });

  mkdirSync(dirname(P.out), { recursive: true });
  writeFileSync(P.out, html, 'utf8');

  const m = byWorkspace.all[config.defaultPeriodDays];
  say(`✔ Byggde ${P.out}`);
  say(`  ${events.length} händelser · ${tasks.length} tasks · ${m.editors.length} redigerare · ${m.flags.length} flaggor`);
  say(`  Flikar: ${spaces.map(s => s.name).join(' · ')}`);
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

    const { events: incoming, unknownStatuses, skipped } = rowsToEvents(rows, editors, raw.hub || 'notion', raw.workspace || null, config.notion.includeTypes || [], raw.exportedAt ? raw.exportedAt + 'T23:59:00Z' : undefined);
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

  if (kind === 'notion-all') {
    const token = process.env.NOTION_TOKEN;
    if (!token) die('NOTION_TOKEN saknas. Se README → "Så skaffar du en Notion-token".');

    const { fetchEverything, fetchUsers } = await import('./src/ingest/notion-fetch.mjs');
    const { rowsToEvents } = await import('./src/ingest/notion-rows.mjs');
    const { commentsToEvents } = await import('./src/ingest/notion-comments.mjs');

    // Slå upp riktiga namn först — API:t ser gästanvändare som MCP-kopplingen missar.
    const people = await fetchUsers(token);
    const unknown = people.filter(p => !editors.some(e => e.notionId === p.id));
    if (unknown.length) {
      say(`ℹ ${unknown.length} person(er) i Notion saknas i data/editors.json:`);
      for (const p of unknown) say(`   ${p.id}  ${p.name}${p.email ? '  <' + p.email + '>' : ''}`);
    }
    for (const ed of editors) {
      const hit = people.find(p => p.id === ed.notionId);
      if (hit && hit.name && ed.name !== hit.name) {
        say(`ℹ Notion kallar ${ed.name} för "${hit.name}" — uppdatera gärna editors.json.`);
      }
    }

    const bundles = await fetchEverything({ token, workspaces: config.workspaces || [], onProgress: say });

    // Hela Notion hämtas om varje körning, så de härledda händelserna byggs om
    // från grunden i stället för att staplas ovanpå gamla. Annars lever fel
    // kvar för alltid: en felklassad kommentar, en redigerad text, en borttagen
    // kommentar — allt skulle ligga kvar och räknas. Händelser från andra
    // källor (pollern, CSV, manuell loggning) rörs inte.
    const fetchedAt = new Date().toISOString();
    const previous = readEvents(P.events);
    const DERIVED = new Set(['notion-import', 'notion-comment']);
    let events = previous.filter(e => !DERIVED.has(e.source));
    const dropped = previous.length - events.length;
    if (dropped) say(`  Bygger om ${dropped} härledda händelser från grunden.`);

    for (const b of bundles) {
      const rowRes = rowsToEvents(b.rows, editors, b.hub, b.workspace, config.notion.includeTypes || [], fetchedAt);
      events = mergeEvents(events, rowRes.events).merged;

      // Kommentarerna behöver veta vem som äger tasken → vecka raderna först.
      const tasksById = new Map(foldTasks(events).map(t => [t.id, t]));
      const comRes = commentsToEvents(
        { comments: b.comments, checkedPages: b.checkedPages }, editors, tasksById);
      events = mergeEvents(events, comRes.events).merged;

      const orphans = comRes.events.filter(e => !e.editor).length;
      if (comRes.notes) {
        say(`     ${comRes.notes} kommentar(er) lästes som anteckningar, inte ändringsbegäran.`);
      }
      say(`  ${b.hub}: ${b.rows.length} rader, ${b.comments.length} kommentarer` +
          (rowRes.excluded ? ` (${rowRes.excluded} icke-annonssidor utelämnade)` : ''));
      if (orphans) {
        say(`  ⚠ ${orphans} kommentar(er) kunde inte kopplas till en ansvarig —`);
        say('     de räknas som ändringsbegäran, inte som leveranser.');
      }
      if (rowRes.unknownStatuses.length) {
        say(`  ⚠ Okända statusar: ${rowRes.unknownStatuses.join(', ')}`);
      }
    }
    const addedTotal = events.length - (previous.length - dropped);

    if (flags['dry-run']) { say(`(dry-run) ${addedTotal} nya händelser skulle sparas.`); return; }
    writeEvents(P.events, events);
    say(`✔ ${addedTotal} nya händelser sparade. Kör \`node cli.mjs build\`.`);
    return;
  }

  if (kind === 'meta') {
    const token = process.env.META_ACCESS_TOKEN;
    if (!token) die('META_ACCESS_TOKEN saknas. Lägg den som repository secret i GitHub.');
    const { fetchAccounts, fetchAllAccounts } = await import('./src/ingest/meta.mjs');

    // Vilka konton? Config vinner; annars alla token:en når.
    let accounts = (config.meta?.accounts || []).map(a => ({ id: String(a.id), name: a.name, brand: a.brand }));
    if (!accounts.length) {
      const found = await fetchAccounts(token);
      accounts = found.map(a => ({ id: a.account_id, name: a.name }));
      say(`  Inga konton i config — använder alla ${accounts.length} som token:en når.`);
    }

    // Två fönster, inte ett:
    //   refreshDays  = hur långt bak vi frågar Meta den här körningen
    //   historyDays  = hur långt bak vi SPARAR
    // Att fråga om 120 dagar × 11 konton varje timme är vad som spärrade oss.
    // Färdiga dagar ändrar sig ändå inte — det räcker att fråga om de senaste,
    // och lägga dem ovanpå det vi redan har.
    const keepDays = Number(config.meta?.historyDays || 120);
    const days = Number(flags.days || config.meta?.refreshDays || 14);
    const until = new Date(Date.now()).toISOString().slice(0, 10);
    const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    const cutoff = new Date(Date.now() - keepDays * 86400000).toISOString().slice(0, 10);

    const { rows: fresh, ok, failed } = await fetchAllAccounts({ token, accounts, since, until, onProgress: say });
    if (flags['dry-run']) { say(`(dry-run) ${fresh.length} annons-dagar ${since} → ${until}.`); return; }

    // Gammal data behålls: dels dagar äldre än fönstret vi just frågade om,
    // dels allt från konton som Meta vägrade svara om den här gången. Annars
    // skulle en enda taktgräns radera månader av spend.
    let previous = [];
    if (existsSync(P.meta)) {
      try { previous = JSON.parse(readFileSync(P.meta, 'utf8')).rows || []; } catch { previous = []; }
    }
    const refreshed = new Set(ok);
    const kept = previous.filter(r => r.date >= cutoff && !(refreshed.has(String(r.accountId)) && r.date >= since));
    // Dagar utan spend är dagar då annonsen låg stilla — de säger ingenting om
    // vare sig ersättning eller vinnare, och de är hälften av alla rader.
    const rows = [...kept, ...fresh.filter(r => r.date >= cutoff && r.spend > 0)];

    mkdirSync(dirname(P.meta), { recursive: true });
    const oldest = rows.reduce((m, r) => (r.date < m ? r.date : m), until);
    // En rad per textrad. Filen sparas varje timme; skrivs allt på EN rad kan
    // git inte se att 99 % är oförändrat och lagrar 4 MB på nytt varje gång.
    const head = JSON.stringify({ since: oldest, until, fetchedAt: new Date().toISOString() }).slice(0, -1);
    writeFileSync(P.meta, `${head},"rows":[\n${rows.map(r => JSON.stringify(r)).join(',\n')}\n]}`, 'utf8');
    const spend = rows.reduce((s, r) => s + r.spend, 0);
    say(`✔ ${rows.length} annons-dagar sparade (${oldest} → ${until}), varav ${fresh.length} nyhämtade, total spend ${Math.round(spend).toLocaleString('sv-SE')}.`);
    if (failed.length) say(`  ⚠ Behöll gammal data för ${failed.map(f => f.name).join(', ')} (Meta svarade inte).`);
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

/* ----------------------------------------------------------- check-notion */

// Svarar på "har jag gjort steg 5 rätt?" utan att man behöver gissa.
// Testar token, varje hub var för sig, och om kommentarer går att läsa.
async function cmdCheckNotion() {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    die('NOTION_TOKEN är inte satt i den här terminalen.\n' +
        '  Gjorde du `export $(cat .env | xargs)`? Den gäller bara i det fönstret.');
  }
  say(`\n  Token hittad (${token.slice(0, 7)}…${token.slice(-4)})\n`);

  const call = async (path, init) => {
    const res = await fetch(`https://api.notion.com/v1${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        'notion-version': '2022-06-28',
        'content-type': 'application/json',
        ...(init?.headers || {}),
      },
    });
    return { status: res.status, body: await res.json() };
  };

  // 1. Duger token:en över huvud taget?
  const me = await call('/users/me');
  if (me.status === 401) die('Token:en avvisas (401). Den är fel, eller så har den återkallats. Kopiera en ny från integrations-sidan.');
  if (me.status !== 200) die(`Oväntat svar från Notion: ${me.status} ${JSON.stringify(me.body)}`);
  const integrationName = me.body.name || me.body.bot?.owner?.type || 'din integration';
  say(`  ✔ Token giltig — integrationen heter "${integrationName}"`);

  // 2. Får den läsa användare?
  const users = await call('/users?page_size=1');
  say(users.status === 200
    ? '  ✔ Får läsa användare (namnen kan slås upp)'
    : `  ✖ Får INTE läsa användare — bocka i "Read user information" i integrationens Capabilities`);

  // 3. Varje hub för sig. Det är HÄR steg 5 syns.
  say('\n  Hubbar:');
  let connected = 0, total = 0, commentsOk = null;
  for (const ws of config.workspaces || []) {
    for (const hub of ws.hubs || []) {
      total++;
      const db = await call(`/databases/${hub.databaseId}`);
      const label = `${ws.name} / ${hub.name}`;
      if (db.status === 200) {
        connected++;
        say(`   ✔ ${label}`);

        // 4. Testa kommentarsläsning på en sida i den första hub som funkar.
        if (commentsOk === null) {
          const q = await call(`/databases/${hub.databaseId}/query`, {
            method: 'POST', body: JSON.stringify({ page_size: 1 }),
          });
          const pageId = q.body?.results?.[0]?.id;
          if (pageId) {
            const c = await call(`/comments?block_id=${pageId}&page_size=1`);
            commentsOk = c.status === 200;
            if (!commentsOk) {
              say(`      ⚠ Kommentarer går inte att läsa (${c.status}: ${c.body?.message || ''})`);
            }
          }
        }
      } else if (db.status === 404) {
        say(`   ✖ ${label}`);
        say(`        Integrationen "${integrationName}" är inte insläppt här.`);
        say('        Enklast: integrationens sida → fliken "Åtkomst till innehåll" → lägg till');
        say('        teamspacet, så ärver alla databaser under det åtkomsten.');
      } else {
        say(`   ✖ ${label} — ${db.status}: ${db.body?.message || ''}`);
      }
    }
  }

  if (commentsOk === true) say('\n  ✔ Kommentarer går att läsa — det är de som ger ledtiderna.');
  if (commentsOk === false) say('\n  ✖ Kommentarer går INTE att läsa. Bocka i "Read comments" i Capabilities.');

  say(`\n  ${connected} av ${total} hubbar anslutna.`);
  if (connected === total && commentsOk) {
    say('  Allt klart. Kör: node cli.mjs ingest notion-all\n');
  } else {
    say('  Fixa raderna med ✖ ovan och kör det här kommandot igen.\n');
  }
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
  'check-notion': cmdCheckNotion,
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
