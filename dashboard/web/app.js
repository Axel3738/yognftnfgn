/**
 * Dashboardens klientlogik: hämtar rapporten, ritar korten och kopplar filter.
 * Filterraden styr allt — alla kort ritas om mot samma urval.
 */

import { stackedColumns, multiLine, stackedBars, scatter, sparkline, seriesColor, swatch } from './charts.js';

const state = {
  from: null,
  to: null,
  kind: '',
  editorId: '',
  report: null,
  openEditor: null,
  hoursPerDay: 7,
};

/* --- Formattering ---------------------------------------------------- */

const nf = (value, decimals = 0) =>
  value === null || value === undefined || !Number.isFinite(value)
    ? '—'
    : value.toLocaleString('sv-SE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function formatHours(hours) {
  if (hours === null || hours === undefined || !Number.isFinite(hours)) return '—';
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  if (hours < state.hoursPerDay * 2) return `${nf(hours, 1)} h`;
  return `${nf(hours / state.hoursPerDay, 1)} d`;
}

function formatPercent(value, decimals = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return `${nf(value * 100, decimals)} %`;
}

const isoToday = () => new Date().toISOString().slice(0, 10);
const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

/* --- Färg per redigerare (följer personen, aldrig placeringen) -------- */

const colorMap = new Map();
function editorColor(id) {
  if (!colorMap.has(id)) colorMap.set(id, seriesColor(colorMap.size));
  return colorMap.get(id);
}
function primeColors(report) {
  // Stabil ordning: alfabetiskt på id, inte efter dagens ranking.
  for (const id of report.editors.map((e) => e.id).sort()) editorColor(id);
}

/* --- Datahämtning ---------------------------------------------------- */

async function load() {
  const main = document.getElementById('main');
  main.classList.add('is-loading');
  const params = new URLSearchParams({ from: state.from, to: state.to });
  if (state.kind) params.set('kind', state.kind);
  const res = await fetch(`/api/report?${params}`);
  if (!res.ok) {
    main.classList.remove('is-loading');
    main.insertAdjacentHTML(
      'afterbegin',
      `<div class="card"><p>Kunde inte hämta rapporten (${res.status}).</p></div>`,
    );
    return;
  }
  state.report = await res.json();
  state.hoursPerDay = state.report.range.hoursPerDay || 7;
  primeColors(state.report);
  render();
  main.classList.remove('is-loading');
}

/* --- Rendering ------------------------------------------------------- */

function visibleEditors() {
  const rows = state.report.editors;
  if (state.editorId) return rows.filter((e) => e.id === state.editorId);
  return rows.filter((e) => e.kpis.deliveriesTotal > 0 || e.wip > 0);
}

function render() {
  const report = state.report;
  document.getElementById('range-label').textContent =
    `${report.range.from} → ${report.range.to} · ${report.range.workdays} arbetsdagar · ${report.range.timezone}`;
  document.getElementById('generated').textContent =
    `Uppdaterad ${new Date(report.generatedAt).toLocaleString('sv-SE')} · ledtider mätta i arbetstid (må–fr, kontorstid, röda dagar borträknade)`;

  renderEditorFilter(report);
  renderKindFilter(report);
  renderHero(report);
  renderInsights(report);
  renderOutputChart(report);
  renderLeadChart(report);
  renderRevisionChart(report);
  renderQuadrant(report);
  renderLeague(report);
  renderQueue(report);
  renderDataQuality(report);
}

function renderEditorFilter(report) {
  const select = document.getElementById('editor');
  const current = state.editorId;
  select.innerHTML =
    '<option value="">Alla redigerare</option>' +
    report.editors.map((e) => `<option value="${e.id}">${e.name}</option>`).join('');
  select.value = current;
}

function renderKindFilter(report) {
  const select = document.getElementById('kind');
  if (select.dataset.filled === '1') return;
  select.innerHTML =
    '<option value="">Alla typer</option>' +
    report.filters.kinds.map((k) => `<option value="${k}">${k}</option>`).join('');
  select.dataset.filled = '1';
}

function deltaMarkup(delta, { invert = false, format = (v) => nf(v, 1) } = {}) {
  if (!delta || delta.absolute === null || delta.absolute === undefined || delta.absolute === 0) {
    return '<span class="muted">oförändrat mot förra perioden</span>';
  }
  const better = invert ? delta.absolute < 0 : delta.absolute > 0;
  const arrow = delta.absolute > 0 ? '↑' : '↓';
  return `<span class="${better ? 'delta--good' : 'delta--bad'}">${arrow}&nbsp;${format(Math.abs(delta.absolute))}</span> <span class="muted">mot förra perioden</span>`;
}

function renderHero(report) {
  const k = report.team.kpis;
  const d = report.team.delta;
  document.getElementById('hero-value').textContent = nf(k.outputPoints, 0);
  document.getElementById('hero-meta').innerHTML =
    `poäng från ${nf(k.tasksDelivered)} tasks · ${deltaMarkup(d.outputPoints)}`;

  const tiles = [
    {
      label: 'Median till första leverans',
      value: formatHours(k.medianTimeToFirstDeliveryHours),
      meta: `p90 ${formatHours(k.p90TimeToFirstDeliveryHours)}`,
      delta: d.medianTimeToFirstDeliveryHours,
      invert: true,
      format: formatHours,
    },
    {
      label: 'Rätt första gången',
      value: formatPercent(k.firstPassRate),
      meta: `${nf(k.reviewedTasks)} bedömda tasks · mål ${formatPercent(report.targets.firstPassRate)}`,
      delta: d.firstPassRate,
      format: (v) => formatPercent(v, 0),
    },
    {
      label: 'Median revisionsvändning',
      value: formatHours(k.medianRevisionTurnaroundHours),
      meta: `${nf(k.reworkDeliveries)} omleveranser (${formatPercent(k.reworkShare)} av allt)`,
      delta: d.medianRevisionTurnaroundHours,
      invert: true,
      format: formatHours,
    },
    {
      label: 'Levererat i tid',
      value: formatPercent(k.onTimeRate),
      meta: `${nf(k.onTimeSample)} tasks med deadline`,
      delta: d.onTimeRate,
      format: (v) => formatPercent(v, 0),
    },
    {
      label: 'Loggad tid mot kapacitet',
      value: formatPercent(k.utilization),
      meta: k.loggedHours ? `${nf(k.loggedHours)} h av ${nf(k.capacityHours)} h` : 'ingen tidsloggning',
      delta: d.utilization,
      format: (v) => formatPercent(v, 0),
    },
    {
      label: 'Öppna tasks',
      value: nf(report.queue.total),
      meta: `${report.queue.withEditor} hos redigerare · ${report.queue.withReviewer} hos oss`,
    },
  ];

  document.getElementById('tiles').innerHTML = tiles
    .map(
      (tile) => `
      <div class="tile">
        <p class="tile__label">${tile.label}</p>
        <p class="tile__value">${tile.value}</p>
        <p class="tile__meta">${tile.meta || ''}</p>
        ${tile.delta ? `<p class="tile__meta">${deltaMarkup(tile.delta, { invert: tile.invert, format: tile.format })}</p>` : ''}
      </div>`,
    )
    .join('');
}

function renderInsights(report) {
  const box = document.getElementById('insights');
  const icons = { warning: '⚠️', good: '✅', info: 'ℹ️' };
  if (!report.insights.length) {
    box.innerHTML = '';
    return;
  }
  box.innerHTML = report.insights
    .map(
      (insight) => `
      <div class="insight insight--${insight.severity}">
        <span class="status-icon" aria-hidden="true">${icons[insight.severity] || ''}</span>
        <span>${insight.message}<span class="insight__action">${insight.action}</span></span>
      </div>`,
    )
    .join('');
}

/* --- Chart 1: output per dag ----------------------------------------- */

function renderOutputChart(report) {
  const editors = visibleEditors();
  const series = editors.map((e) => ({ key: e.id, label: e.name, color: editorColor(e.id) }));
  const rows = report.daily
    .filter((day) => day.workday || day.points > 0)
    .map((day) => ({
      label: day.date,
      shortLabel: day.date.slice(5),
      values: day.byEditor,
    }));
  stackedColumns(document.getElementById('chart-output'), {
    rows,
    series,
    formatValue: (v) => nf(v, 0),
    emptyText: 'Inga leveranser i perioden.',
  });

  renderTableView('output', {
    head: ['Dag', ...series.map((s) => s.label), 'Totalt'],
    rows: rows.map((row) => [
      row.label,
      ...series.map((s) => nf(row.values[s.key] || 0, 1)),
      nf(series.reduce((sum, s) => sum + (row.values[s.key] || 0), 0), 1),
    ]),
  });
}

/* --- Chart 2: ledtid per vecka --------------------------------------- */

function renderLeadChart(report) {
  const editors = visibleEditors();
  const points = report.weekly.map((week) => ({ label: `${week.week} (${week.weekStart})`, shortLabel: week.week.slice(5) }));
  const series = editors.map((e) => ({
    key: e.id,
    label: e.name,
    short: e.name.split(' ')[0],
    color: editorColor(e.id),
    values: report.weekly.map((week) => week.byEditor[e.id] ?? null),
  }));
  multiLine(document.getElementById('chart-lead'), {
    points,
    series,
    formatValue: formatHours,
    emptyText: 'Inga leveranser att mäta ledtid på.',
  });

  renderTableView('lead', {
    head: ['Vecka', ...series.map((s) => s.label), 'Team'],
    rows: report.weekly.map((week, i) => [
      week.week,
      ...series.map((s) => formatHours(s.values[i])),
      formatHours(week.team),
    ]),
  });
}

/* --- Chart 3: omgörningar -------------------------------------------- */

function renderRevisionChart(report) {
  const editors = visibleEditors().filter((e) => e.kpis.reviewedTasks > 0);
  const series = [
    { key: 'own', label: 'Utförande / teknik', color: 'var(--series-1)' },
    { key: 'ours', label: 'Brief, scope eller smakändring från oss', color: 'var(--series-2)' },
  ];
  const rows = editors.map((e) => {
    const own = e.kpis.attributableRevisionRate || 0;
    const total = e.kpis.revisionRate || 0;
    return {
      label: e.name + (e.sampleWarning ? ' *' : ''),
      values: { own, ours: Math.max(0, total - own) },
      note: `${e.kpis.reviewedTasks} bedömda tasks${e.sampleWarning ? ' — litet underlag' : ''}`,
    };
  });
  stackedBars(document.getElementById('chart-revisions'), {
    rows,
    series,
    formatValue: (v) => formatPercent(v, 0),
    reference: { value: report.team.kpis.revisionRate || 0, label: 'teamet' },
    emptyText: 'Inga bedömda tasks i perioden.',
  });

  renderTableView('revisions', {
    head: ['Redigerare', 'Bedömda tasks', 'Omgörning totalt', 'Varav egna fel', 'Rätt första gången', 'Snitt rundor'],
    rows: editors.map((e) => [
      e.name,
      nf(e.kpis.reviewedTasks),
      formatPercent(e.kpis.revisionRate),
      formatPercent(e.kpis.attributableRevisionRate),
      formatPercent(e.kpis.firstPassRate),
      nf(e.kpis.avgRounds, 2),
    ]),
    note: '* = färre än minimiantalet bedömda tasks; siffran är osäker.',
  });
}

/* --- Chart 4: fart mot träffsäkerhet ---------------------------------- */

function renderQuadrant(report) {
  const editors = visibleEditors().filter(
    (e) => e.kpis.medianTimeToFirstDeliveryHours !== null && e.kpis.firstPassRate !== null,
  );
  // Punktdiagram jämför alla punkter mot alla — där håller inte fler än tre
  // kategorifärger isär under färgblindhet. Över tre bär namnetiketten
  // identiteten istället, och alla punkter får samma färg.
  const useEntityColors = editors.length <= 3;
  const points = editors.map((e) => ({
    label: e.name.split(' ')[0],
    x: e.kpis.medianTimeToFirstDeliveryHours,
    y: e.kpis.firstPassRate,
    size: e.kpis.outputPoints,
    color: useEntityColors ? editorColor(e.id) : 'var(--series-1)',
    tooltip:
      `<div class="tooltip__row"><span class="tooltip__key">Median till leverans</span><span class="tooltip__value">${formatHours(e.kpis.medianTimeToFirstDeliveryHours)}</span></div>` +
      `<div class="tooltip__row"><span class="tooltip__key">Rätt första gången</span><span class="tooltip__value">${formatPercent(e.kpis.firstPassRate)}</span></div>` +
      `<div class="tooltip__row"><span class="tooltip__key">Output</span><span class="tooltip__value">${nf(e.kpis.outputPoints)} p</span></div>` +
      (e.sampleWarning ? '<div class="tooltip__row"><span class="tooltip__key">⚠️ litet underlag</span></div>' : ''),
  }));
  scatter(document.getElementById('chart-quadrant'), {
    points,
    xLabel: 'Median arbetstimmar till första leverans →',
    yLabel: 'Rätt första gången',
    formatX: formatHours,
    formatY: (v) => formatPercent(v, 0),
    emptyText: 'För lite data för att jämföra.',
  });

  renderTableView('quadrant', {
    head: ['Redigerare', 'Median till leverans', 'Rätt första gången', 'Output (poäng)'],
    rows: editors.map((e) => [
      e.name,
      formatHours(e.kpis.medianTimeToFirstDeliveryHours),
      formatPercent(e.kpis.firstPassRate),
      nf(e.kpis.outputPoints, 1),
    ]),
  });
}

function renderTableView(target, { head, rows, note }) {
  const box = document.getElementById(`table-${target}`);
  box.innerHTML =
    '<div class="table-scroll"><table><thead><tr>' +
    head.map((h) => `<th>${h}</th>`).join('') +
    '</tr></thead><tbody>' +
    rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('') +
    '</tbody></table></div>' +
    (note ? `<p class="muted">${note}</p>` : '');
}

/* --- Ligatabell ------------------------------------------------------ */

const LEAGUE_COLUMNS = [
  { key: 'name', label: 'Redigerare', sort: (e) => e.name, render: (e) => nameCell(e) },
  { key: 'points', label: 'Poäng', sort: (e) => e.kpis.outputPoints || 0, render: (e) => nf(e.kpis.outputPoints, 1) },
  { key: 'tasks', label: 'Tasks', sort: (e) => e.kpis.tasksDelivered, render: (e) => nf(e.kpis.tasksDelivered) },
  { key: 'perday', label: 'Poäng/aktiv dag', sort: (e) => e.kpis.outputPerActiveDay || 0, render: (e) => nf(e.kpis.outputPerActiveDay, 1) },
  { key: 'ttfd', label: 'Median till leverans', sort: (e) => e.kpis.medianTimeToFirstDeliveryHours ?? Infinity, render: (e) => formatHours(e.kpis.medianTimeToFirstDeliveryHours) },
  { key: 'p90', label: 'p90', sort: (e) => e.kpis.p90TimeToFirstDeliveryHours ?? Infinity, render: (e) => formatHours(e.kpis.p90TimeToFirstDeliveryHours) },
  { key: 'pickup', label: 'Innan start', sort: (e) => e.kpis.medianPickupDelayHours ?? Infinity, render: (e) => formatHours(e.kpis.medianPickupDelayHours) },
  { key: 'revturn', label: 'Revisionsvändning', sort: (e) => e.kpis.medianRevisionTurnaroundHours ?? Infinity, render: (e) => formatHours(e.kpis.medianRevisionTurnaroundHours) },
  { key: 'own', label: 'Omgörning (egna)', sort: (e) => e.kpis.attributableRevisionRate ?? -1, render: (e) => formatPercent(e.kpis.attributableRevisionRate) },
  { key: 'fpr', label: 'Rätt 1:a gången', sort: (e) => e.kpis.firstPassRate ?? -1, render: (e) => formatPercent(e.kpis.firstPassRate) },
  { key: 'ontime', label: 'I tid', sort: (e) => e.kpis.onTimeRate ?? -1, render: (e) => formatPercent(e.kpis.onTimeRate) },
  { key: 'util', label: 'Loggat / kapacitet', sort: (e) => e.kpis.utilization ?? -1, render: (e) => formatPercent(e.kpis.utilization) },
  { key: 'wip', label: 'Öppna', sort: (e) => e.wip, render: (e) => (e.overdue ? `${e.wip} <span class="badge badge--warn">${e.overdue} sen</span>` : nf(e.wip)) },
];

let sortKey = 'points';
let sortDir = -1;

function nameCell(editor) {
  return (
    `<span class="name-cell"><span class="dot" style="background:${editorColor(editor.id)}"></span>` +
    `<span>${editor.name}${editor.sampleWarning ? ' <span class="badge">litet underlag</span>' : ''}` +
    `<br /><span class="muted">${editor.role || ''}</span></span></span>`
  );
}

function renderLeague(report) {
  const table = document.getElementById('league');
  const rows = visibleEditors().slice();
  const column = LEAGUE_COLUMNS.find((c) => c.key === sortKey) || LEAGUE_COLUMNS[1];
  rows.sort((a, b) => {
    const av = column.sort(a);
    const bv = column.sort(b);
    if (typeof av === 'string') return sortDir * av.localeCompare(bv, 'sv');
    return sortDir * (av - bv);
  });

  table.querySelector('thead').innerHTML =
    '<tr>' +
    LEAGUE_COLUMNS.map(
      (c) =>
        `<th data-sort="${c.key}" role="button" tabindex="0" title="Sortera">${c.label}${sortKey === c.key ? (sortDir === -1 ? ' ↓' : ' ↑') : ''}</th>`,
    ).join('') +
    '</tr>';

  table.querySelector('tbody').innerHTML = rows
    .map(
      (editor) =>
        `<tr data-editor="${editor.id}" class="${state.openEditor === editor.id ? 'is-open' : ''}">` +
        LEAGUE_COLUMNS.map((c) => `<td>${c.render(editor)}</td>`).join('') +
        '</tr>',
    )
    .join('');

  if (!rows.length) {
    table.querySelector('tbody').innerHTML =
      `<tr><td colspan="${LEAGUE_COLUMNS.length}"><span class="empty">Ingen aktivitet i perioden.</span></td></tr>`;
  }
}

/* --- Drilldown ------------------------------------------------------- */

async function openEditor(editorId) {
  const box = document.getElementById('drilldown');
  if (state.openEditor === editorId) {
    state.openEditor = null;
    box.hidden = true;
    renderLeague(state.report);
    return;
  }
  state.openEditor = editorId;
  renderLeague(state.report);
  box.hidden = false;
  box.innerHTML = '<p class="empty">Hämtar tasks…</p>';

  const params = new URLSearchParams({ from: state.from, to: state.to });
  const res = await fetch(`/api/editor/${encodeURIComponent(editorId)}?${params}`);
  if (!res.ok) {
    box.innerHTML = '<p class="empty">Kunde inte hämta tasks.</p>';
    return;
  }
  const { editor, tasks } = await res.json();
  const row = state.report.editors.find((e) => e.id === editorId);
  const spark = state.report.daily.map((day) => day.byEditor[editorId] || 0);

  box.innerHTML = `
    <div class="drilldown__head">
      <div>
        <h3>${editor.name} — ${tasks.length} tasks i perioden</h3>
        <p class="muted">Klicka på raden i tabellen igen för att stänga.</p>
      </div>
      <div id="spark-holder"></div>
    </div>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Task</th><th>Typ</th><th>Vikt</th><th>Status</th>
            <th>Till leverans</th><th>Innan start</th><th>Egen tid</th><th>Väntat på oss</th>
            <th>Rundor</th><th>Orsaker</th><th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          ${tasks
            .map(
              (task) => `
            <tr>
              <td>${task.title}</td>
              <td>${task.kind}</td>
              <td>${task.complexity}</td>
              <td>${statusLabel(task)}</td>
              <td>${formatHours(task.timeToFirstDeliveryHours)}</td>
              <td>${formatHours(task.pickupDelayHours)}</td>
              <td>${formatHours(task.handsOnHours)}</td>
              <td>${formatHours(task.reviewWaitHours)}</td>
              <td>${task.rounds}${task.attributableRounds < task.rounds ? ` <span class="muted">(${task.attributableRounds} egna)</span>` : ''}</td>
              <td>${task.revisions.map((r) => r.reason).join(', ') || '—'}</td>
              <td>${task.dueAt ? task.dueAt.slice(0, 10) : '—'}${task.onTime === false ? ' ⚠️' : ''}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    ${row?.sampleWarning ? '<p class="muted">⚠️ Litet underlag i perioden — läs kvalitetssiffrorna som en indikation, inte ett facit.</p>' : ''}
  `;
  document.getElementById('spark-holder').appendChild(sparkline(spark, { color: editorColor(editorId) }));
}

function statusLabel(task) {
  const map = {
    approved: 'godkänd',
    in_review: 'hos oss',
    revision: 'revision',
    in_progress: 'pågår',
    assigned: 'ej påbörjad',
    cancelled: 'nedlagd',
    unassigned: 'otilldelad',
  };
  return map[task.state] || task.state;
}

/* --- Kö -------------------------------------------------------------- */

function renderQueue(report) {
  const q = report.queue;
  const columns = [
    { title: '🚨 Försenade', rows: q.overdue, empty: 'Inget över deadline.' },
    { title: '🔄 Revisions som ligger', rows: q.revisionsWaiting, empty: 'Inga liggande revisions.' },
    { title: '👀 Väntar på oss', rows: q.waitingOnUs, empty: 'Inget ogranskat.' },
  ];
  document.getElementById('queue').innerHTML = columns
    .map(
      (col) => `
      <div class="queue__col">
        <h3>${col.title} <span class="badge">${col.rows.length}</span></h3>
        <ul class="queue__list">
          ${
            col.rows.length
              ? col.rows
                  .slice(0, 8)
                  .map(
                    (row) => `
              <li class="queue__item">
                <strong>${row.title}</strong>
                <div class="queue__meta">
                  ${swatch(editorColor(row.editorId))} ${row.editorName} ·
                  bollen ${row.currentOwner === 'editor' ? 'hos redigeraren' : 'hos oss'} sedan
                  ${formatHours(row.waitingHours)}
                  ${row.dueAt ? `· deadline ${row.dueAt.slice(0, 10)}` : ''}
                  ${row.rounds ? `· runda ${row.rounds + 1}` : ''}
                </div>
              </li>`,
                  )
                  .join('')
              : `<li class="empty">${col.empty}</li>`
          }
        </ul>
        ${col.rows.length > 8 ? `<p class="muted">…och ${col.rows.length - 8} till</p>` : ''}
      </div>`,
    )
    .join('');
}

function renderDataQuality(report) {
  const list = document.getElementById('dq');
  const items = [...report.dataQuality, ...(report.storeProblems || []).map((p) => ({ message: `Rad ${p.line}: ${p.message}` }))];
  list.innerHTML = items.length
    ? items.map((issue) => `<li>${issue.message}</li>`).join('')
    : '<li>Inga kända luckor i datan.</li>';
}

/* --- Filter och händelser -------------------------------------------- */

function setRange(from, to) {
  state.from = from;
  state.to = to;
  document.getElementById('from').value = from;
  document.getElementById('to').value = to;
  load();
}

function wire() {
  document.querySelectorAll('[data-range]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-range]').forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');
      const today = isoToday();
      const preset = button.dataset.range;
      if (preset === 'mtd') setRange(`${today.slice(0, 8)}01`, today);
      else setRange(addDays(today, -(Number(preset) - 1)), today);
    });
  });

  document.getElementById('from').addEventListener('change', (e) => {
    state.from = e.target.value;
    load();
  });
  document.getElementById('to').addEventListener('change', (e) => {
    state.to = e.target.value;
    load();
  });
  document.getElementById('kind').addEventListener('change', (e) => {
    state.kind = e.target.value;
    load();
  });
  document.getElementById('editor').addEventListener('change', (e) => {
    state.editorId = e.target.value;
    render();
  });

  document.querySelectorAll('.toggle-table').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.target;
      const table = document.getElementById(`table-${target}`);
      const chart = document.getElementById(`chart-${target}`);
      const showTable = table.hidden;
      table.hidden = !showTable;
      chart.hidden = showTable;
      button.textContent = showTable ? 'Diagram' : 'Tabell';
    });
  });

  document.getElementById('league').addEventListener('click', (event) => {
    const th = event.target.closest('th[data-sort]');
    if (th) {
      if (sortKey === th.dataset.sort) sortDir = -sortDir;
      else {
        sortKey = th.dataset.sort;
        sortDir = sortKey === 'name' ? 1 : -1;
      }
      renderLeague(state.report);
      return;
    }
    const tr = event.target.closest('tr[data-editor]');
    if (tr) openEditor(tr.dataset.editor);
  });

  const toggle = document.getElementById('theme-toggle');
  toggle.addEventListener('click', () => {
    const root = document.documentElement;
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : current === 'light' ? '' : 'dark';
    if (next) root.setAttribute('data-theme', next);
    else root.removeAttribute('data-theme');
    localStorage.setItem('edash-theme', next);
    if (state.report) render();
  });
  const saved = localStorage.getItem('edash-theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);

  window.addEventListener('resize', () => {
    clearTimeout(window.__edashResize);
    window.__edashResize = setTimeout(() => state.report && render(), 200);
  });
}

const today = isoToday();
state.to = today;
state.from = addDays(today, -29);
document.getElementById('from').value = state.from;
document.getElementById('to').value = state.to;
wire();
load();
