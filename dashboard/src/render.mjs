// Bygger dashboarden som EN självständig HTML-fil. Ingen server, inga CDN:er,
// inget som kan sluta ladda. Öppna filen — den funkar. Perioden byts i webbläsaren
// eftersom alla perioder är förberäknade och bakade i filen.

import { minutesPerWorkday } from './time.mjs';

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Kategoriska slots i fast ordning (validerad palett — se dataviz/palette.md).
// Ordningen är CVD-säkerhetsmekanismen, inte dekoration: rotera den inte.
const SERIES = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  dark:  ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

// Statusarna är ett flöde, inte identiteter — därför en ordinal enhuesramp
// (ljus → mörk i ljust läge, mörk → ljus i mörkt), inte kategoriska färger.
// Stegen är valda så det ljusaste/mörkaste ändå klarar 2:1 mot ytan.
const PIPELINE = {
  light: { assigned: '#86b6ef', in_progress: '#5598e7', in_review: '#2a78d6', revision: '#1c5cab', approved: '#104281', cancelled: '#c3c2b7' },
  dark:  { assigned: '#184f95', in_progress: '#256abf', in_review: '#3987e5', revision: '#6da7ec', approved: '#9ec5f4', cancelled: '#52514e' },
};

/**
 * @param fragment  utan <!doctype>/<html>/<head>/<body> — för värdar som
 *                  lägger in sidan i ett eget skelett. Innehållet är exakt
 *                  detsamma; panelen är självförsörjande och hämtar aldrig
 *                  något utifrån, så den fungerar likadant i båda formerna.
 */
export function renderDashboard({ config, editors, byWorkspace, spaces, defaultWorkspace, defaultPeriod, demo, payout = null, fragment = false }) {
  const payload = {
    config: {
      team: config.team,
      timezone: config.timezone,
      targets: config.targets,
      thresholds: config.thresholds,
      minutesPerWorkday: minutesPerWorkday(config.workday),
      workday: `${config.workday.start}–${config.workday.end}`,
    },
    editors,
    byWorkspace,
    spaces,
    defaultWorkspace,
    defaultPeriod,
    demo,
    payout,
    series: SERIES,
    pipeline: PIPELINE,
  };

  const body = `<div id="app"></div>
<script id="payload" type="application/json">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>
<script>
${CLIENT}
</script>`;

  if (fragment) {
    return `<title>Redigerarpanel</title>
<style>
${STYLE}
</style>
${body}`;
  }

  return `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Redigerarpanel – ${esc(config.team)}</title>
<style>
${STYLE}
</style>
</head>
<body>
${body}
</body>
</html>`;
}

const STYLE = `
:root {
  color-scheme: light;
  --page:           #f9f9f7;
  --surface:        #fcfcfb;
  --text-primary:   #0b0b0b;
  --text-secondary: #52514e;
  --text-muted:     #898781;
  --grid:           #e1e0d9;
  --axis:           #c3c2b7;
  --border:         rgba(11,11,11,0.10);
  --good:           #0ca30c;
  --warning:        #fab219;
  --serious:        #ec835a;
  --critical:       #d03b3b;
  --delta-good:     #006300;
  --delta-bad:      #b02c2c;
  --track:          #eceae4;
}
@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme="light"])) {
    color-scheme: dark;
    --page:           #0d0d0d;
    --surface:        #1a1a19;
    --text-primary:   #ffffff;
    --text-secondary: #c3c2b7;
    --text-muted:     #898781;
    --grid:           #2c2c2a;
    --axis:           #383835;
    --border:         rgba(255,255,255,0.10);
    --delta-good:     #0ca30c;
    --delta-bad:      #e66767;
    --track:          #262624;
  }
}
:root[data-theme="dark"] {
  color-scheme: dark;
  --page:           #0d0d0d;
  --surface:        #1a1a19;
  --text-primary:   #ffffff;
  --text-secondary: #c3c2b7;
  --text-muted:     #898781;
  --grid:           #2c2c2a;
  --axis:           #383835;
  --border:         rgba(255,255,255,0.10);
  --delta-good:     #0ca30c;
  --delta-bad:      #e66767;
  --track:          #262624;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--page);
  color: var(--text-primary);
  font: 14px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif;
  -webkit-font-smoothing: antialiased;
}
#app { max-width: 1320px; margin: 0 auto; padding: 28px 20px 72px; }

header.top { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; justify-content: space-between; margin-bottom: 8px; }
h1 { font-size: 22px; font-weight: 650; margin: 0; letter-spacing: -0.01em; }
.sub { color: var(--text-secondary); font-size: 13px; margin-top: 4px; }

.banner {
  margin: 16px 0 0; padding: 10px 14px; border-radius: 10px;
  border: 1px solid var(--border); background: var(--surface);
  color: var(--text-secondary); font-size: 13px;
  display: flex; gap: 10px; align-items: flex-start;
}
.banner b { color: var(--text-primary); font-weight: 600; }

/* Flikrad per teamspace. Vald flik bär en 2px understrykning i accentfärgen —
   färg ensam räcker inte, så den valda är också fetstilt och aria-selected. */
.tabs {
  display: flex; flex-wrap: wrap; gap: 2px; margin-top: 20px;
  border-bottom: 1px solid var(--grid);
}
.tabs .tab {
  appearance: none; border: 0; background: transparent; cursor: pointer;
  font: inherit; font-size: 13.5px; color: var(--text-secondary);
  padding: 9px 14px; border-bottom: 2px solid transparent; margin-bottom: -1px;
  display: inline-flex; align-items: center; gap: 8px;
}
.tabs .tab:hover { color: var(--text-primary); }
.tabs .tab[aria-selected="true"] {
  color: var(--text-primary); font-weight: 650;
  border-bottom-color: #2a78d6;
}
:root[data-theme="dark"] .tabs .tab[aria-selected="true"] { border-bottom-color: #3987e5; }
@media (prefers-color-scheme: dark) {
  :root:where(:not([data-theme="light"])) .tabs .tab[aria-selected="true"] { border-bottom-color: #3987e5; }
}
.tabs .tab-count {
  font-size: 11.5px; font-variant-numeric: tabular-nums;
  color: var(--text-muted); background: var(--surface);
  border: 1px solid var(--border); border-radius: 999px; padding: 1px 7px;
}
.tabs .tab:focus-visible { outline: 2px solid #2a78d6; outline-offset: -2px; }

.controls { display: flex; gap: 6px; align-items: center; }
/* En knapprad utan rubrik säger inte vad den styr. */
.seg-label { color: var(--text-secondary); font-size: 12.5px; white-space: nowrap; }
.seg { display: inline-flex; background: var(--surface); border: 1px solid var(--border); border-radius: 9px; padding: 3px; }
.seg button {
  appearance: none; border: 0; background: transparent; color: var(--text-secondary);
  font: inherit; font-size: 13px; padding: 5px 12px; border-radius: 6px; cursor: pointer;
}
.seg button[aria-pressed="true"] { background: var(--page); color: var(--text-primary); font-weight: 600; box-shadow: 0 0 0 1px var(--border); }
.seg button:hover:not([aria-pressed="true"]) { color: var(--text-primary); }

section { margin-top: 28px; }
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 14px; padding: 18px 20px;
}
h2 { font-size: 15px; font-weight: 600; margin: 0 0 2px; }
.hint { color: var(--text-muted); font-size: 12.5px; margin: 0 0 16px; }

.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
.tile { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 16px 18px; }
.tile .label { color: var(--text-secondary); font-size: 12.5px; }
.tile .value { font-size: 30px; font-weight: 620; margin-top: 6px; letter-spacing: -0.02em; line-height: 1.1; }
.tile .value.hero { font-size: 48px; }
.tile .delta { font-size: 12.5px; margin-top: 6px; color: var(--text-muted); }
.tile .delta .up { color: var(--delta-bad); }
.tile .delta .down { color: var(--delta-good); }
.tile .delta .flat { color: var(--text-muted); }
.tile .spark { margin-top: 10px; display: block; }

.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(420px, 1fr)); gap: 16px; }

.legend { display: flex; flex-wrap: wrap; gap: 14px; margin: 0 0 14px; padding: 0; list-style: none; }
.legend li { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--text-secondary); }
.legend .key { width: 10px; height: 10px; border-radius: 3px; flex: none; }
.legend button { appearance: none; background: none; border: 0; padding: 0; font: inherit; color: inherit; cursor: pointer; display: flex; align-items: center; gap: 7px; }
.legend button[aria-pressed="false"] { opacity: 0.38; }

.chart-wrap { position: relative; overflow-x: auto; }
svg { display: block; }
svg text { fill: var(--text-muted); font-size: 11px; }
svg .axis-line { stroke: var(--axis); stroke-width: 1; }
svg .grid-line { stroke: var(--grid); stroke-width: 1; }
svg .val-label { fill: var(--text-secondary); font-size: 11.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
svg .cat-label { fill: var(--text-secondary); font-size: 12px; }
svg .target-line { stroke: var(--text-muted); stroke-width: 1; stroke-dasharray: 0; opacity: 0.55; }
svg .hit { fill: transparent; cursor: pointer; }
svg .hit:hover ~ .hl, svg .col-hl { pointer-events: none; }

.tooltip {
  position: absolute; pointer-events: none; z-index: 20; opacity: 0;
  transform: translate(-50%, -100%); transition: opacity .09s linear;
  background: var(--surface); color: var(--text-primary);
  border: 1px solid var(--border); border-radius: 10px;
  padding: 9px 11px; font-size: 12.5px; min-width: 130px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.14);
}
.tooltip .tt-head { font-weight: 650; margin-bottom: 6px; }
.tooltip .tt-row { display: flex; align-items: center; gap: 8px; justify-content: space-between; }
.tooltip .tt-row .l { display: flex; align-items: center; gap: 6px; color: var(--text-secondary); }
.tooltip .tt-row .k { width: 8px; height: 8px; border-radius: 2px; flex: none; }
.tooltip .tt-row .v { font-variant-numeric: tabular-nums; font-weight: 600; }

table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: right; padding: 9px 10px; border-bottom: 1px solid var(--grid); white-space: nowrap; }
th:first-child, td:first-child { text-align: left; }
th {
  color: var(--text-muted); font-weight: 600; font-size: 12px; cursor: pointer;
  position: sticky; top: 0; background: var(--surface);
}
th[aria-sort="descending"]::after { content: " ↓"; }
th[aria-sort="ascending"]::after { content: " ↑"; }
td.num { font-variant-numeric: tabular-nums; }
tbody tr:hover { background: color-mix(in srgb, var(--text-primary) 4%, transparent); }
.who { display: flex; align-items: center; gap: 9px; }
.who .key { width: 9px; height: 9px; border-radius: 3px; flex: none; }
.who .role { color: var(--text-muted); font-size: 11.5px; }
.table-scroll { overflow-x: auto; max-height: 620px; overflow-y: auto; }

.pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 8px; border-radius: 999px; font-size: 11.5px; font-weight: 600;
  border: 1px solid var(--border);
}
.pill .dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }

/* Åtgärdslistan — den enda delen man faktiskt jobbar I, så den är byggd för
   tumme och telefon: hela raden är ett tryckyta mot Notion, kryssrutan är
   44px och ligger på motsatt sida från länken så man inte råkar öppna fel. */
.flags { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.flags li {
  display: grid; grid-template-columns: auto 1fr auto; gap: 4px 12px; align-items: center;
  border: 1px solid var(--border); border-radius: 12px; background: var(--page);
  transition: opacity .15s ease, background .15s ease;
}
.flags li.done { opacity: 0.4; }
.flags .tick {
  appearance: none; border: 0; background: none; cursor: pointer;
  width: 44px; height: 44px; display: grid; place-items: center;
  border-radius: 12px 0 0 12px; color: var(--text-muted); font-size: 16px;
}
.flags .tick:hover { color: var(--text-primary); background: color-mix(in srgb, var(--text-primary) 6%, transparent); }
.flags .tick[aria-pressed="true"] { color: var(--good); }
.flags .body {
  display: block; text-decoration: none; color: inherit;
  padding: 10px 0; min-width: 0;
}
.flags .body:hover .who-line { text-decoration: underline; }
.flags .who-line {
  font-weight: 600; font-size: 14px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.flags .detail { color: var(--text-secondary); font-size: 12.5px; margin-top: 2px; }
/* Pengarna bakom en liggande sak ska gå att se utan att läsa hela raden. */
.flags .stake { color: var(--text-primary); font-weight: 600; }

/* Pengatabellen: spenden är huvudsiffran, andelen står under den. */
table.money .spend { font-weight: 600; font-variant-numeric: tabular-nums; }
table.money .cut { color: var(--text-secondary); font-size: 12px; font-variant-numeric: tabular-nums; }
table.money tr.total td { border-top: 2px solid var(--border-strong, var(--border)); font-weight: 600; }
.flags .detail .sev { font-weight: 600; }
.flags .when {
  color: var(--text-secondary); font-size: 12.5px; font-variant-numeric: tabular-nums;
  padding-right: 14px; white-space: nowrap; font-weight: 600;
}

/* Filterchips */
.chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 0 14px; padding: 0; list-style: none; }
.chip {
  appearance: none; cursor: pointer; font: inherit; font-size: 12.5px;
  border: 1px solid var(--border); background: var(--page); color: var(--text-secondary);
  border-radius: 999px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;
}
.chip[aria-pressed="true"] { background: var(--text-primary); color: var(--surface); border-color: var(--text-primary); }
.chip .n { font-variant-numeric: tabular-nums; opacity: 0.7; }

.rowbtn {
  appearance: none; cursor: pointer; font: inherit; font-size: 12.5px;
  border: 1px solid var(--border); background: var(--page); color: var(--text-secondary);
  border-radius: 8px; padding: 6px 11px;
}
.rowbtn:hover { color: var(--text-primary); }
.empty { color: var(--text-muted); font-size: 13px; padding: 14px 0; }

details.tableview { margin-top: 14px; }
details.tableview summary { cursor: pointer; color: var(--text-secondary); font-size: 12.5px; }
details.tableview[open] summary { margin-bottom: 10px; }

footer.foot { margin-top: 36px; color: var(--text-muted); font-size: 12px; border-top: 1px solid var(--grid); padding-top: 14px; }
/* --- Telefon ------------------------------------------------------------
   Panelen läses oftare i handen än vid skrivbordet, så mobilen är inte ett
   undantagsfall utan det normala. Tabeller blir kort (en tabell som scrollar
   i sidled läser ingen på en telefon), rubriken och flikarna fastnar i toppen
   så man alltid vet var man är, och botten får plats för hemknappsområdet. */
@media (max-width: 720px) {
  #app { padding: 16px 14px calc(48px + env(safe-area-inset-bottom)); }
  h1 { font-size: 19px; }
  .sub { font-size: 12px; }
  .grid2 { grid-template-columns: 1fr; }
  .tiles { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
  .tile { padding: 13px 14px; border-radius: 12px; }
  .tile .value { font-size: 24px; }
  .tile .value.hero { font-size: 36px; }
  .card { padding: 15px 14px; border-radius: 12px; }
  section { margin-top: 18px; }

  /* Flikraden fastnar i toppen och scrollar i sidled i stället för att radbryta. */
  .tabs {
    position: sticky; top: 0; z-index: 30;
    background: var(--page); margin: 14px -14px 0; padding: 0 14px;
    flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none;
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tabs .tab { white-space: nowrap; padding: 11px 12px; }

  /* Tabell → kort. Varje cell får sin rubrik framför sig via data-label. */
  .table-scroll { max-height: none; overflow: visible; }
  .as-cards thead { display: none; }
  .as-cards, .as-cards tbody, .as-cards tr, .as-cards td { display: block; width: 100%; }
  .as-cards tr {
    border: 1px solid var(--border); border-radius: 12px;
    padding: 12px 14px; margin-bottom: 8px; background: var(--page);
  }
  .as-cards td {
    border: 0; padding: 3px 0; text-align: left;
    display: flex; justify-content: space-between; gap: 12px; align-items: baseline;
  }
  .as-cards td::before {
    content: attr(data-label); color: var(--text-muted); font-size: 12px;
    flex: none;
  }
  .as-cards td:first-child { padding-bottom: 8px; }
  .as-cards td:first-child::before { content: none; }

  .flags .who-line { white-space: normal; }
  .flags li { grid-template-columns: auto 1fr; }
  .flags .when { grid-column: 2; padding: 0 14px 10px 0; }

  /* Den klistrade flikraden ligger ovanpå sidan. Utan marginal här hamnar det
     man just scrollat till under den, och trycket landar på fliken i stället. */
  .flags li, section, .card, .chip { scroll-margin-top: 56px; }
}
`;

const CLIENT = String.raw`
const P = JSON.parse(document.getElementById('payload').textContent);
const CFG = P.config;
const NS = 'http://www.w3.org/2000/svg';

// Avbockningar sparas i webbläsaren. De rör aldrig Notion — det är en
// arbetslista för egen del, inte en statusändring för teamet.
const DONE_KEY = 'redigerarpanel.hanterade';
const PAYOUT_TAB = '__ersattning';
function loadDone() {
  try { return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveDone() {
  try { localStorage.setItem(DONE_KEY, JSON.stringify([...state.done])); } catch {}
}

const state = {
  // Öppnar på pengarna när det finns pengar att visa. Det är den frågan
  // panelen faktiskt får varje dag.
  workspace: P.payout ? PAYOUT_TAB : P.defaultWorkspace,
  month: null,
  court: 'all',
  done: loadDone(),
  period: P.defaultPeriod,
  hidden: new Set(),
  sort: { key: 'deliveries', dir: -1 },
};

function isDark() {
  const stamp = document.documentElement.getAttribute('data-theme');
  if (stamp) return stamp === 'dark';
  return matchMedia('(prefers-color-scheme: dark)').matches;
}
function seriesColors() { return isDark() ? P.series.dark : P.series.light; }

const editorIndex = new Map(P.editors.map((e, i) => [e.id, i]));
function colorOf(id) {
  const c = seriesColors();
  const i = editorIndex.get(id);
  return c[(i == null ? 0 : i) % c.length];
}
function nameOf(id) {
  if (!id) return 'Ingen ansvarig';
  const e = P.editors.find(x => x.id === id);
  return e ? e.name : id;
}

/* ---------- format ---------- */
const nf = new Intl.NumberFormat('sv-SE');
const nf1 = new Intl.NumberFormat('sv-SE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function dur(min) {
  if (min == null || !isFinite(min)) return '–';
  if (min < 60) return Math.round(min) + 'm';
  if (min < CFG.minutesPerWorkday) {
    const h = Math.floor(min / 60), m = Math.round(min % 60);
    return m ? h + 'h ' + m + 'm' : h + 'h';
  }
  return nf1.format(min / CFG.minutesPerWorkday) + ' d';
}
function pct(x, digits) {
  if (x == null || !isFinite(x)) return '–';
  return (x * 100).toFixed(digits == null ? 0 : digits).replace('.', ',') + '%';
}
function num(x, d) {
  if (x == null || !isFinite(x)) return '–';
  return d ? nf1.format(x) : nf.format(Math.round(x));
}
function shortDate(iso) {
  const d = new Date(iso + 'T12:00:00Z');
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}
function el(tag, attrs, kids) {
  const n = document.createElement(tag);
  for (const k in (attrs || {})) {
    if (k === 'class') n.className = attrs[k];
    else if (k === 'html') n.innerHTML = attrs[k];
    else if (k === 'text') n.textContent = attrs[k];
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  }
  for (const kid of (kids || [])) if (kid) n.appendChild(kid);
  return n;
}
function s(tag, attrs, kids) {
  const n = document.createElementNS(NS, tag);
  for (const k in (attrs || {})) {
    if (k === 'text') n.textContent = attrs[k];
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), attrs[k]);
    else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
  }
  for (const kid of (kids || [])) if (kid) n.appendChild(kid);
  return n;
}

/* ---------- tooltip ---------- */
function attachTooltip(wrap) {
  const tip = el('div', { class: 'tooltip' });
  wrap.appendChild(tip);
  return {
    show(x, y, html) {
      tip.innerHTML = html;
      tip.style.left = x + 'px';
      tip.style.top = (y - 10) + 'px';
      tip.style.opacity = '1';
    },
    hide() { tip.style.opacity = '0'; },
  };
}

/* ---------- staplat dagsdiagram ---------- */
function stackedDaily(daily, editorIds) {
  const wrap = el('div', { class: 'chart-wrap' });
  const visible = editorIds.filter(id => !state.hidden.has(id));

  const H = 260, padL = 34, padR = 12, padT = 12, padB = 30;
  const n = daily.length;
  const slot = Math.max(14, Math.min(38, 900 / Math.max(n, 1)));
  const W = Math.max(560, padL + padR + slot * n);
  const barW = Math.min(24, slot - 6);
  const GAP = 2; // ytgapet som separerar segmenten

  let maxV = 0;
  for (const d of daily) {
    let sum = 0;
    for (const id of visible) sum += d[id] || 0;
    maxV = Math.max(maxV, sum);
  }
  maxV = Math.max(maxV, 1);
  const ticks = niceTicks(maxV, 4);
  const top = ticks[ticks.length - 1];
  const y = v => padT + (H - padT - padB) * (1 - v / top);

  const svg = s('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, role: 'img',
    'aria-label': 'Leveranser per dag, staplat per redigerare' });

  for (const t of ticks) {
    svg.appendChild(s('line', { class: 'grid-line', x1: padL, x2: W - padR, y1: y(t), y2: y(t) }));
    svg.appendChild(s('text', { x: padL - 8, y: y(t) + 4, 'text-anchor': 'end', text: nf.format(t) }));
  }
  svg.appendChild(s('line', { class: 'axis-line', x1: padL, x2: W - padR, y1: y(0), y2: y(0) }));

  const tip = attachTooltip(wrap);
  const everyN = Math.ceil(n / 14);

  daily.forEach((d, i) => {
    const x = padL + i * slot + (slot - barW) / 2;
    let acc = 0;
    const segs = visible.map(id => ({ id, v: d[id] || 0 })).filter(sg => sg.v > 0);

    segs.forEach((sg, si) => {
      const y0 = y(acc), y1 = y(acc + sg.v);
      acc += sg.v;
      const isTop = si === segs.length - 1;
      let h = y0 - y1;
      // Ytgap mellan segment: kapa nederkant utom på det understa.
      const gapBottom = si > 0 ? GAP : 0;
      h = Math.max(1, h - gapBottom);
      const r = isTop ? Math.min(4, h / 2, barW / 2) : 0;
      svg.appendChild(s('path', {
        d: roundedTopRect(x, y1, barW, h, r),
        fill: colorOf(sg.id),
      }));
    });

    if (i % everyN === 0) {
      svg.appendChild(s('text', { x: x + barW / 2, y: H - padB + 16, 'text-anchor': 'middle', text: shortDate(d.date) }));
    }

    const total = segs.reduce((a, b) => a + b.v, 0);
    const hit = s('rect', { class: 'hit', x: padL + i * slot, y: padT, width: slot, height: H - padT - padB });
    hit.addEventListener('mousemove', ev => {
      const r = wrap.getBoundingClientRect();
      const rows = segs.slice().reverse().map(sg =>
        '<div class="tt-row"><span class="l"><span class="k" style="background:' + colorOf(sg.id) + '"></span>' +
        escapeHtml(nameOf(sg.id)) + '</span><span class="v">' + sg.v + '</span></div>').join('');
      tip.show(ev.clientX - r.left, ev.clientY - r.top,
        '<div class="tt-head">' + shortDate(d.date) + ' · ' + total + ' leverans' + (total === 1 ? '' : 'er') + '</div>' +
        (rows || '<div class="tt-row"><span class="l">Inget levererat</span></div>'));
    });
    hit.addEventListener('mouseleave', tip.hide);
    svg.appendChild(hit);
  });

  wrap.appendChild(svg);
  return wrap;
}

function roundedTopRect(x, y, w, h, r) {
  if (r <= 0) return 'M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + (-w) + 'Z';
  return 'M' + x + ' ' + (y + r) +
    'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + (-r) +
    'h' + (w - 2 * r) +
    'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r +
    'v' + (h - r) + 'h' + (-w) + 'Z';
}
function roundedEndBar(x, y, w, h, r) {
  const rr = Math.min(r, w, h / 2);
  if (rr <= 0) return 'M' + x + ' ' + y + 'h' + w + 'v' + h + 'h' + (-w) + 'Z';
  return 'M' + x + ' ' + y + 'h' + (w - rr) +
    'a' + rr + ' ' + rr + ' 0 0 1 ' + rr + ' ' + rr +
    'v' + (h - 2 * rr) +
    'a' + rr + ' ' + rr + ' 0 0 1 ' + (-rr) + ' ' + rr +
    'h' + (-(w - rr)) + 'Z';
}

function niceTicks(max, count) {
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(v => v >= raw) || mag * 10;
  const out = [];
  for (let v = 0; v <= max + step * 0.999; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}

/* ---------- horisontella staplar ---------- */
function hbars(rows, opts) {
  // rows: [{id, label, value, color, valueText, note}]
  const wrap = el('div', { class: 'chart-wrap' });
  const rowH = 34, padL = 116, padR = 62, padT = 6, padB = 26;
  const W = 560, H = padT + padB + rows.length * rowH;
  const maxV = Math.max(opts.target || 0, ...rows.map(r => r.value || 0), 1) * 1.08;
  const x = v => padL + (W - padL - padR) * (v / maxV);

  const svg = s('svg', { width: '100%', height: H, viewBox: '0 0 ' + W + ' ' + H,
    preserveAspectRatio: 'xMinYMin meet', role: 'img', 'aria-label': opts.aria || '' });

  if (opts.target) {
    svg.appendChild(s('line', { class: 'target-line', x1: x(opts.target), x2: x(opts.target), y1: padT, y2: H - padB }));
    svg.appendChild(s('text', { x: x(opts.target), y: H - padB + 15, 'text-anchor': 'middle',
      text: 'mål ' + opts.targetLabel }));
  }

  const tip = attachTooltip(wrap);
  const barH = Math.min(24, rowH - 12);

  rows.forEach((r, i) => {
    const yTop = padT + i * rowH + (rowH - barH) / 2;
    const w = Math.max(2, x(r.value || 0) - padL);

    svg.appendChild(s('text', { class: 'cat-label', x: padL - 10, y: yTop + barH / 2 + 4,
      'text-anchor': 'end', text: r.label }));
    svg.appendChild(s('path', { d: roundedEndBar(padL, yTop, w, barH, 4), fill: r.color }));
    svg.appendChild(s('text', { class: 'val-label', x: padL + w + 8, y: yTop + barH / 2 + 4, text: r.valueText }));

    const hit = s('rect', { class: 'hit', x: 0, y: padT + i * rowH, width: W, height: rowH });
    hit.addEventListener('mousemove', ev => {
      const bb = wrap.getBoundingClientRect();
      tip.show(ev.clientX - bb.left, ev.clientY - bb.top,
        '<div class="tt-head">' + escapeHtml(r.label) + '</div>' +
        '<div class="tt-row"><span class="l">' + escapeHtml(opts.measure) + '</span><span class="v">' + escapeHtml(r.valueText) + '</span></div>' +
        (r.note ? '<div class="tt-row"><span class="l">' + escapeHtml(r.note) + '</span></div>' : ''));
    });
    hit.addEventListener('mouseleave', tip.hide);
    svg.appendChild(hit);
  });

  svg.appendChild(s('line', { class: 'axis-line', x1: padL, x2: padL, y1: padT, y2: H - padB }));
  wrap.appendChild(svg);
  return wrap;
}

/* ---------- sparkline ---------- */
function sparkline(series, color) {
  const W = 92, H = 24, pad = 2;
  const max = Math.max(1, ...series);
  const step = series.length > 1 ? (W - pad * 2) / (series.length - 1) : 0;
  const pts = series.map((v, i) => [pad + i * step, H - pad - (H - pad * 2) * (v / max)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  return s('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, class: 'spark', 'aria-hidden': 'true' }, [
    s('path', { d: d, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.75 }),
    last ? s('circle', { cx: last[0], cy: last[1], r: 3, fill: color, stroke: 'var(--surface)', 'stroke-width': 2 }) : null,
  ]);
}

/* Ger varje cell sin kolumnrubrik, så tabellen kan bli kort på mobilen
   utan att siffrorna tappar betydelse. */
function labelCells(tr, headers) {
  [...tr.children].forEach((td, i) => { if (headers[i]) td.setAttribute('data-label', headers[i]); });
  return tr;
}

function escapeHtml(x) {
  return String(x ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

/* ---------- status ---------- */
function revSeverity(rate) {
  if (rate == null) return 'unknown';
  if (rate >= CFG.thresholds.revisionRateCritical) return 'critical';
  if (rate >= CFG.thresholds.revisionRateWarning) return 'warning';
  return 'good';
}
const STATUS = {
  good:     { color: 'var(--good)',     hex: '#0ca30c', icon: '●', label: 'Inom mål' },
  warning:  { color: 'var(--warning)',  hex: '#fab219', icon: '▲', label: 'Över mål' },
  serious:  { color: 'var(--serious)',  hex: '#ec835a', icon: '▲', label: 'Släpar' },
  critical: { color: 'var(--critical)', hex: '#d03b3b', icon: '■', label: 'Kritisk' },
  unknown:  { color: 'var(--text-muted)', hex: '#898781', icon: '·', label: 'Ingen data' },
};
function statusPill(sev, text) {
  const st = STATUS[sev];
  return el('span', { class: 'pill', title: st.label }, [
    el('span', { class: 'dot', style: 'background:' + st.color }),
    el('span', { text: text + ' · ' + st.label }),
  ]);
}

/* ---------- delta ---------- */
function deltaLine(value, opts) {
  // lowerIsBetter: uppgång = dåligt
  if (value == null || !isFinite(value)) return el('div', { class: 'delta', text: 'ingen jämförelse' });
  const rounded = Math.abs(value) < 0.005 ? 0 : value;
  const dir = rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'flat';
  const bad = opts.lowerIsBetter ? rounded > 0 : rounded < 0;
  const cls = rounded === 0 ? 'flat' : (bad ? 'up' : 'down');
  const arrow = rounded > 0 ? '↑' : rounded < 0 ? '↓' : '→';
  const text = opts.points
    ? (rounded > 0 ? '+' : '') + (rounded * 100).toFixed(0) + ' p.e.'
    : (rounded > 0 ? '+' : '') + (rounded * 100).toFixed(0) + '%';
  return el('div', { class: 'delta' }, [
    el('span', { class: cls, text: arrow + ' ' + text }),
    el('span', { text: ' mot föreg. ' + state.period + ' d' }),
  ]);
}

/* ---------- render ---------- */
function render() {
  const onPayout = state.workspace === PAYOUT_TAB && P.payout;
  const spaceData = P.byWorkspace[state.workspace] || P.byWorkspace[P.spaces[0].id];
  const M = spaceData[state.period];
  const app = document.getElementById('app');
  app.innerHTML = '';

  /* header */
  //
  // Periodväxlaren visas bara när den faktiskt ändrar en synlig siffra.
  // "7 d / 14 d / 30 d / 90 d" satt uppe i hörnet på varje vy och gjorde
  // ingenting på de flesta av dem, eftersom nästan all data saknar
  // leveransdatum — en kontroll som inte svarar när man trycker på den är
  // värre än ingen kontroll alls.
  const periods = Object.keys(spaceData).map(Number).sort((a, b) => a - b);
  const changesSomething = periods.some(d =>
    spaceData[d].team.deliveries !== spaceData[state.period].team.deliveries);

  const periodBtns = el('div', { class: 'seg' },
    periods.map(d =>
      el('button', {
        text: d + ' d', 'aria-pressed': String(d === state.period),
        onclick: () => { state.period = d; render(); },
      })));

  app.appendChild(el('header', { class: 'top' }, [
    el('div', {}, [
      el('h1', { text: 'Redigerarpanel' }),
      el('div', { class: 'sub', text: CFG.team + ' · arbetstid ' + CFG.workday +
        ' i varje persons egen tidszon' +
        ' · uppdaterad ' + new Date(M.generatedAt).toLocaleString('sv-SE', { dateStyle: 'medium', timeStyle: 'short' }) }),
    ]),
    // Periodväxlaren styr bara tidsbaserade mätetal — göm den när det inte
    // finns några, annars ser den ut att vara trasig. På lönefliken styr den
    // ingenting alls.
    !onPayout && changesSomething ? el('div', { class: 'controls' }, [
      el('span', { class: 'seg-label', text: 'Leveranser senaste' }),
      periodBtns,
    ]) : null,
  ]));

  // Ersättningen ligger FÖRST. Den låg sist, och på en telefon ryms bara två
  // och en halv flik — så den flik som handlar om pengar var den enda man
  // aldrig såg utan att veta att man skulle dra i sidled.
  const tabs = P.spaces.slice();
  if (P.payout) tabs.unshift({ id: PAYOUT_TAB, name: 'Pengar', payout: true });

  if (tabs.length > 1) {
    app.appendChild(el('nav', { class: 'tabs', 'aria-label': 'Teamspace' },
      tabs.map(sp => {
        const m30 = (P.byWorkspace[sp.id] || {})[state.period];
        const count = sp.payout ? null : (m30 ? m30.snapshot.totalTasks : 0);
        return el('button', {
          class: 'tab', 'aria-selected': String(sp.id === state.workspace),
          onclick: () => { state.workspace = sp.id; render(); },
        }, [
          el('span', { text: sp.name }),
          count == null ? null : el('span', { class: 'tab-count', text: String(count) }),
        ]);
      })));
  }

  if (onPayout) {
    app.appendChild(payoutView());
    return;
  }

  if (P.demo) {
    app.appendChild(el('div', { class: 'banner' }, [
      el('span', { text: '⚠' }),
      el('div', { html: '<b>Demodata.</b> Den här vyn körs på genererad exempeldata så du kan se hur panelen ' +
        'beter sig. Koppla in riktig data med <code>node cli.mjs ingest notion</code> eller <code>ingest csv</code>, ' +
        'och rensa demoraderna med <code>node cli.mjs purge-demo</code>.' }),
    ]));
  }

  const snap = M.snapshot || { timedTasks: 0, estimatedTasks: 0, totalTasks: 0, editors: [] };
  const hasTiming = M.team.deliveries > 0;

  if (!hasTiming && snap.estimatedTasks > 0) {
    app.appendChild(el('div', { class: 'banner' }, [
      el('span', { text: '⏳' }),
      el('div', { html:
        '<b>Ledtider saknas ännu — och det är inte ett fel i panelen.</b> ' +
        'Datan är importerad från Notion, som inte sparar statushistorik: vi vet vilket läge varje task ' +
        '<i>är</i> i, men inte <i>när</i> den kom dit. Fältet <code>Godkänd datum</code> är ifyllt på 2 av 199 rader. ' +
        'Panelen vägrar räkna ledtid på gissade tidpunkter. ' +
        'Nulägesvyn nedan är däremot helt äkta, och riktiga ledtider börjar mätas så fort ' +
        '<code>ingest notion</code> körts ett par gånger och sett en status ändras.' }),
    ]));
  }

  /* --- alla mätetal förklaras i tid som räknas i arbetstimmar --- */
  if (snap.editors.length) app.appendChild(snapshotSection(M));
  if (hasTiming) {
    // Exakt en hero-siffra per vy: har nulägesvyn redan en, tar den inte en till.
    app.appendChild(tilesSection(M, !snap.editors.length));
    app.appendChild(dailySection(M));
    app.appendChild(compareSection(M));
    app.appendChild(leaderboardSection(M));
  }
  app.appendChild(flagsSection(M));
  if (hasTiming) app.appendChild(tasksSection(M));

  app.appendChild(el('footer', { class: 'foot', html:
    'Alla ledtider räknas i <b>arbetstid</b> (' + CFG.workday + ', mån–fre) — inte kalendertid. ' +
    'Nätter och helger räknas inte mot någon. ' +
    'Perioden filtrerar på <b>leveransdatum</b>, så historiken flyttar sig inte när gamla tasks godkänns. ' +
    'Beläggning är en <b>uppskattning</b> ur handpåläggningstid, inte tidrapportering.' }));
}

const STATE_TEXT = {
  assigned: 'Ej påbörjad', in_progress: 'Pågår', in_review: 'I granskning',
  revision: 'Omgörning', approved: 'Klar', cancelled: 'Nedlagd',
};

function pipelineColor(state) {
  return (isDark() ? P.pipeline.dark : P.pipeline.light)[state];
}

/* Nuläge: var varje persons tasks står just nu. Kräver ingen tidshistorik. */
function snapshotSection(M) {
  const snap = M.snapshot;
  const states = snap.states;
  const rows = snap.editors;

  const W = 640, rowH = 40, padL = 150, padR = 52, padT = 4;
  const H = padT + rows.length * rowH + 8;
  const maxTotal = Math.max(1, ...rows.map(r => r.total));
  const wrap = el('div', { class: 'chart-wrap' });
  const svg = s('svg', { width: '100%', height: H, viewBox: '0 0 ' + W + ' ' + H,
    preserveAspectRatio: 'xMinYMin meet', role: 'img', 'aria-label': 'Tasks per redigerare, fördelat på status' });
  const tip = attachTooltip(wrap);
  const barH = 22, GAP = 2;

  rows.forEach((r, i) => {
    const yTop = padT + i * rowH + (rowH - barH) / 2;
    const scale = (W - padL - padR) / maxTotal;
    let x = padL;

    svg.appendChild(s('text', { class: 'cat-label', x: padL - 10, y: yTop + barH / 2 + 4,
      'text-anchor': 'end', text: r.name }));

    const segs = states.map(st => ({ st, v: r.byState[st] || 0 })).filter(sg => sg.v > 0);
    segs.forEach((sg, si) => {
      const full = sg.v * scale;
      const w = Math.max(1, full - (si < segs.length - 1 ? GAP : 0));
      const isLast = si === segs.length - 1;
      svg.appendChild(s('path', {
        d: isLast ? roundedEndBar(x, yTop, w, barH, 4) : roundedEndBar(x, yTop, w, barH, 0),
        fill: pipelineColor(sg.st),
      }));
      x += full;
    });

    svg.appendChild(s('text', { class: 'val-label', x: padL + r.total * scale + 8,
      y: yTop + barH / 2 + 4, text: String(r.total) }));

    const hit = s('rect', { class: 'hit', x: 0, y: padT + i * rowH, width: W, height: rowH });
    hit.addEventListener('mousemove', ev => {
      const bb = wrap.getBoundingClientRect();
      const lines = segs.map(sg =>
        '<div class="tt-row"><span class="l"><span class="k" style="background:' + pipelineColor(sg.st) + '"></span>' +
        STATE_TEXT[sg.st] + '</span><span class="v">' + sg.v + '</span></div>').join('');
      tip.show(ev.clientX - bb.left, ev.clientY - bb.top,
        '<div class="tt-head">' + escapeHtml(r.name) + ' · ' + r.total + ' tasks</div>' + lines +
        '<div class="tt-row"><span class="l">Äldsta öppna</span><span class="v">' + dur(r.oldestOpenMin) + '</span></div>');
    });
    hit.addEventListener('mouseleave', tip.hide);
    svg.appendChild(hit);
  });

  svg.appendChild(s('line', { class: 'axis-line', x1: padL, x2: padL, y1: padT, y2: H - 8 }));
  wrap.appendChild(svg);

  const legend = el('ul', { class: 'legend' }, states.map(st =>
    el('li', {}, [
      el('span', { class: 'key', style: 'background:' + pipelineColor(st) }),
      el('span', { text: STATE_TEXT[st] }),
    ])));

  const table = el('table', { class: 'as-cards' }, [
    el('thead', {}, [el('tr', {}, ['Redigerare', ...states.map(st => STATE_TEXT[st]), 'Totalt', 'Öppna', 'Äldsta öppna', 'Mätbara', 'Tidszon']
      .map(h => el('th', { text: h, scope: 'col' })))]),
    el('tbody', {}, rows.map(r => labelCells(el('tr', {}, [
      el('td', {}, [el('div', { class: 'who' }, [
        el('span', { class: 'key', style: 'background:' + colorOf(r.id) }),
        el('span', { text: r.name }),
      ])]),
      ...states.map(st => el('td', { class: 'num', text: num(r.byState[st] || 0) })),
      el('td', { class: 'num', text: num(r.total) }),
      el('td', { class: 'num', text: num(r.open) }),
      el('td', { class: 'num', text: dur(r.oldestOpenMin) }),
      el('td', { class: 'num', text: num(r.timedTasks) + ' / ' + num(r.total) }),
      el('td', { text: (r.timezone || '').replace(/^\w+\//, '') }),
    ]), ['Redigerare', ...states.map(st => STATE_TEXT[st]), 'Totalt', 'Öppna', 'Äldsta öppna', 'Mätbara', 'Tidszon']))),
  ]);

  // Mättäckning per person. Utan den ser den som kommenterar flitigt ut som den
  // enda som jobbar — vilket vore en direkt felaktig slutsats att dra.
  const measured = rows.filter(r => r.timedTasks > 0);
  const unmeasured = rows.filter(r => r.timedTasks === 0 && r.total > 0);
  const coverageNote = unmeasured.length
    ? el('div', { class: 'banner', style: 'margin:0 0 16px' }, [
        el('span', { text: '⚖' }),
        el('div', { html:
          '<b>Läs ledtiderna med det här i huvudet.</b> Tiderna kommer från kommentarer, ' +
          'och alla kommenterar inte. ' +
          measured.map(r => escapeHtml(r.name) + ' (' + r.timedTasks + ' av ' + r.total + ' mätbara)').join(', ') +
          ' går att mäta. ' +
          unmeasured.map(r => escapeHtml(r.name)).join(', ') +
          ' har <b>noll</b> mätbara tasks — det betyder <i>inte</i> att de är långsamma, ' +
          'det betyder att de aldrig skriver i kommentarsfältet. ' +
          'Jämför dem först när pollern samlat egna statusövergångar.' }),
      ])
    : null;

  const tiles = [
    { label: 'Tasks totalt', value: num(snap.totalTasks), hero: true },
    { label: 'Utan ansvarig', value: num(snap.unassigned),
      note: snap.totalTasks ? pct(snap.unassigned / snap.totalTasks) + ' av allt' : '' },
    { label: 'Öppna just nu', value: num(snap.editors.reduce((a, e) => a + e.open, 0)) },
    { label: 'Med mätbar ledtid', value: num(snap.timedTasks),
      note: snap.timedTasks === 0 ? 'ingen tidshistorik ännu' : '' },
  ];

  return el('section', {}, [
    el('div', { class: 'tiles' }, tiles.map(t => el('div', { class: 'tile' }, [
      el('div', { class: 'label', text: t.label }),
      el('div', { class: 'value' + (t.hero ? ' hero' : ''), text: t.value }),
      el('div', { class: 'delta', text: t.note || '' }),
    ]))),
    coverageNote ? el('div', { style: 'margin-top:16px' }, [coverageNote]) : null,
    el('div', { class: 'card', style: coverageNote ? '' : 'margin-top:16px' }, [
      el('h2', { text: 'Nuläge per redigerare' }),
      el('p', { class: 'hint', text: 'Var varje persons tasks står just nu. Bygger bara på tilldelning och nuvarande status — inga uppskattade tider.' }),
      legend,
      wrap,
      el('details', { class: 'tableview' }, [
        el('summary', { text: 'Visa som tabell' }),
        el('div', { class: 'table-scroll' }, [table]),
      ]),
    ]),
  ]);
}

function tilesSection(M, allowHero) {
  const t = M.team, prev = t.previous;
  const rel = (a, b) => (b ? (a - b) / b : null);

  const teamSpark = M.team.daily.map(d => d.total);

  const tiles = [
    { label: 'Leveranser i perioden', value: num(t.deliveries), hero: allowHero,
      delta: deltaLine(rel(t.deliveries, prev.deliveries), { lowerIsBetter: false }),
      spark: teamSpark },
    { label: 'Median ledtid (tilldelad → levererad)', value: dur(t.medianTurnaround),
      delta: deltaLine(rel(t.medianTurnaround, prev.medianTurnaround), { lowerIsBetter: true }) },
    { label: 'Revisionsgrad', value: pct(t.revisionRate),
      delta: deltaLine(t.revisionRate != null && prev.revisionRate != null ? t.revisionRate - prev.revisionRate : null,
        { lowerIsBetter: true, points: true }) },
    { label: 'Median revisionstid', value: dur(t.medianRevisionTurnaround),
      delta: deltaLine(rel(t.medianRevisionTurnaround, prev.medianRevisionTurnaround), { lowerIsBetter: true }) },
    { label: 'Levererat i tid', value: pct(t.onTimeRate),
      delta: deltaLine(t.onTimeRate != null && prev.onTimeRate != null ? t.onTimeRate - prev.onTimeRate : null,
        { lowerIsBetter: false, points: true }) },
    { label: 'Öppna tasks just nu', value: num(M.editors.reduce((a, e) => a + e.wip, 0)),
      delta: el('div', { class: 'delta', text: M.flags.length + ' flaggade' }) },
  ];

  return el('section', {}, [
    el('div', { class: 'tiles' }, tiles.map(x => {
      const kids = [
        el('div', { class: 'label', text: x.label }),
        el('div', { class: 'value' + (x.hero ? ' hero' : ''), text: x.value }),
        x.delta,
      ];
      const node = el('div', { class: 'tile' }, kids);
      if (x.spark) node.appendChild(sparkline(x.spark, seriesColors()[0]));
      return node;
    })),
  ]);
}

function dailySection(M) {
  const ids = M.editors.map(e => e.id);
  const legend = el('ul', { class: 'legend' }, ids.map(id =>
    el('li', {}, [
      el('button', {
        'aria-pressed': String(!state.hidden.has(id)),
        onclick: () => {
          if (state.hidden.has(id)) state.hidden.delete(id); else state.hidden.add(id);
          render();
        },
      }, [
        el('span', { class: 'key', style: 'background:' + colorOf(id) }),
        el('span', { text: nameOf(id) }),
      ]),
    ])));

  const tableRows = M.team.daily.slice().reverse().map(d =>
    el('tr', {}, [el('td', { text: shortDate(d.date) })]
      .concat(ids.map(id => el('td', { class: 'num', text: num(d[id] || 0) })))
      .concat([el('td', { class: 'num', text: num(d.total) })])));

  return el('section', {}, [
    el('div', { class: 'card' }, [
      el('h2', { text: 'Output per dag' }),
      el('p', { class: 'hint', text: 'Varje inlämning räknas — även omgjorda. Klicka i förklaringen för att filtrera.' }),
      legend,
      stackedDaily(M.team.daily, ids),
      el('details', { class: 'tableview' }, [
        el('summary', { text: 'Visa som tabell' }),
        el('div', { class: 'table-scroll' }, [
          el('table', {}, [
            el('thead', {}, [el('tr', {}, [el('th', { text: 'Dag' })]
              .concat(ids.map(id => el('th', { text: nameOf(id) })))
              .concat([el('th', { text: 'Totalt' })]))]),
            el('tbody', {}, tableRows),
          ]),
        ]),
      ]),
    ]),
  ]);
}

function compareSection(M) {
  const withData = M.editors.filter(e => e.stats.deliveries > 0);

  const turn = withData.slice()
    .sort((a, b) => (a.stats.medianTurnaround ?? 1e9) - (b.stats.medianTurnaround ?? 1e9))
    .map(e => ({
      id: e.id, label: e.name, value: e.stats.medianTurnaround || 0,
      color: colorOf(e.id), valueText: dur(e.stats.medianTurnaround),
      note: 'p90: ' + dur(e.stats.p90Turnaround) + ' · pickup: ' + dur(e.stats.medianPickup),
    }));

  const rev = withData.slice()
    .sort((a, b) => (b.stats.revisionRate ?? -1) - (a.stats.revisionRate ?? -1))
    .map(e => {
      const sev = revSeverity(e.stats.revisionRate);
      return {
        id: e.id, label: e.name, value: (e.stats.revisionRate || 0) * 100,
        color: STATUS[sev].hex,
        valueText: STATUS[sev].icon + ' ' + pct(e.stats.revisionRate),
        note: num(e.stats.avgRevisionsPerTask, 1) + ' rundor/task · ' + STATUS[sev].label,
      };
    });

  return el('section', { class: 'grid2' }, [
    el('div', { class: 'card' }, [
      el('h2', { text: 'Median ledtid per redigerare' }),
      el('p', { class: 'hint', text: 'Tilldelad → första leverans, räknat i arbetstimmar. Kortare är bättre.' }),
      hbars(turn, {
        target: CFG.targets.turnaroundHours * 60,
        targetLabel: CFG.targets.turnaroundHours + 'h',
        measure: 'Median ledtid',
        aria: 'Median ledtid per redigerare',
      }),
    ]),
    el('div', { class: 'card' }, [
      el('h2', { text: 'Revisionsgrad' }),
      el('p', { class: 'hint', text: 'Andel tasks som fick minst en ändringsbegäran. Ikon + text bär statusen, inte färgen ensam.' }),
      hbars(rev, {
        target: CFG.targets.revisionRate * 100,
        targetLabel: pct(CFG.targets.revisionRate),
        measure: 'Revisionsgrad',
        aria: 'Revisionsgrad per redigerare',
      }),
      el('ul', { class: 'legend' }, ['good', 'warning', 'critical'].map(k =>
        el('li', {}, [
          el('span', { class: 'key', style: 'background:' + STATUS[k].hex }),
          el('span', { text: STATUS[k].icon + ' ' + STATUS[k].label }),
        ]))),
    ]),
  ]);
}

const COLUMNS = [
  { key: 'name', label: 'Redigerare', get: e => e.name, type: 'text' },
  { key: 'deliveries', label: 'Leveranser', get: e => e.stats.deliveries, fmt: v => num(v) },
  { key: 'approved', label: 'Godkända', get: e => e.stats.approved, fmt: v => num(v) },
  { key: 'perDay', label: 'Per aktiv dag', get: e => e.stats.deliveriesPerActiveDay, fmt: v => num(v, 1) },
  { key: 'turnaround', label: 'Median ledtid', get: e => e.stats.medianTurnaround, fmt: dur },
  { key: 'p90', label: 'p90 ledtid', get: e => e.stats.p90Turnaround, fmt: dur },
  { key: 'pickup', label: 'Pickup', get: e => e.stats.medianPickup, fmt: dur },
  { key: 'revrate', label: 'Revisionsgrad', get: e => e.stats.revisionRate, fmt: v => pct(v) },
  { key: 'revtime', label: 'Revisionstid', get: e => e.stats.medianRevisionTurnaround, fmt: dur },
  { key: 'rework', label: 'Omgjort', get: e => e.stats.reworkShare, fmt: v => pct(v) },
  { key: 'ontime', label: 'I tid', get: e => e.stats.onTimeRate, fmt: v => pct(v) },
  { key: 'util', label: 'Beläggning*', get: e => e.utilisation, fmt: v => pct(v) },
  { key: 'wip', label: 'Öppna', get: e => e.wip, fmt: v => num(v) },
];

function leaderboardSection(M) {
  const col = COLUMNS.find(c => c.key === state.sort.key) || COLUMNS[1];
  const rows = M.editors.slice().sort((a, b) => {
    const av = col.get(a), bv = col.get(b);
    if (col.type === 'text') return String(av).localeCompare(String(bv), 'sv') * state.sort.dir * -1;
    const an = av == null ? -Infinity : av, bn = bv == null ? -Infinity : bv;
    return (an - bn) * state.sort.dir;
  });

  const head = el('tr', {}, COLUMNS.map(c => el('th', {
    text: c.label,
    scope: 'col',
    'aria-sort': state.sort.key === c.key ? (state.sort.dir === -1 ? 'descending' : 'ascending') : 'none',
    onclick: () => {
      if (state.sort.key === c.key) state.sort.dir *= -1;
      else { state.sort.key = c.key; state.sort.dir = -1; }
      render();
    },
  })).concat([el('th', { text: 'Trend' })]));

  const body = rows.map(e => {
    const tds = COLUMNS.map(c => {
      if (c.key === 'name') {
        return el('td', {}, [el('div', { class: 'who' }, [
          el('span', { class: 'key', style: 'background:' + colorOf(e.id) }),
          el('div', {}, [
            el('div', { text: e.name }),
            el('div', { class: 'role', text: e.role || '' }),
          ]),
        ])]);
      }
      if (c.key === 'revrate') {
        const sev = revSeverity(e.stats.revisionRate);
        const td = el('td', { class: 'num' });
        td.appendChild(statusPill(sev, pct(e.stats.revisionRate)));
        return td;
      }
      return el('td', { class: 'num', text: c.fmt(c.get(e)) });
    });
    const spark = el('td', {});
    spark.appendChild(sparkline(e.daily.map(d => d.count), colorOf(e.id)));
    tds.push(spark);
    return labelCells(el('tr', {}, tds), [...COLUMNS.map(c => c.label), 'Trend']);
  });

  return el('section', {}, [
    el('div', { class: 'card' }, [
      el('h2', { text: 'Per redigerare' }),
      el('p', { class: 'hint', text: 'Klicka på en kolumnrubrik för att sortera. * Beläggning = uppskattad handpåläggning delat med tillgänglig arbetstid — grovt mått, inte tidrapport.' }),
      el('div', { class: 'table-scroll' }, [
        el('table', { class: 'as-cards' }, [el('thead', {}, [head]), el('tbody', {}, body)]),
      ]),
    ]),
  ]);
}

/* ------------------------------------------------------------ ersättning */

function kr(x) {
  if (x == null || !isFinite(x)) return '–';
  return nf.format(Math.round(x)) + ' kr';
}

function monthName(m) {
  const d = new Date(m + '-01T12:00:00Z');
  return d.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
}

/**
 * Så här mycket blir det om resten av månaden går som de dagar som gått.
 * Räknas i klienten så siffran är rätt även om panelen byggdes i går.
 */
function project(spentSoFar, month) {
  const now = new Date();
  const cur = now.toISOString().slice(0, 7);
  if (month !== cur) return null;
  const day = now.getUTCDate();
  const days = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  if (day >= days) return null;
  return { value: spentSoFar * (days / day), day: day, days: days };
}

function payoutView() {
  const P0 = P.payout;
  const months = P0.months.slice().sort();
  // Vilken månad man tittar på är ett eget val. Förut fanns bara den senaste,
  // och "hur mycket drog vi i juli" gick inte att svara på i panelen.
  const month = (state.month && months.includes(state.month)) ? state.month : months[months.length - 1];
  const rate = P0.rate;

  // Rader utan känd person filtreras bort: en "Okänd (367d)" med 2 kr i
  // ersättning är brus, och det finns ingen att betala den till.
  const known = P0.editors.filter(function (e) { return e.name.indexOf('Okänd') !== 0; });

  const rows = known
    .map(function (e) {
      const m = e.byMonth[month] || { spend: 0, payout: 0, purchases: 0, revenue: 0 };
      return { e: e, m: m, proj: project(m.payout, month) };
    })
    .sort(function (a, b) { return b.m.payout - a.m.payout; });

  const teamMonth = rows.reduce(function (s, r) { return s + r.m.payout; }, 0);
  const teamProj = project(teamMonth, month);

  const out = el('div', {});

  /* Månadsväljare. Den enda datumkontrollen i panelen som faktiskt ändrar
     siffrorna man tittar på — och den står direkt ovanför dem. */
  out.appendChild(el('section', {}, [
    el('ul', { class: 'chips' }, months.slice().reverse().map(m =>
      el('li', {}, [
        el('button', {
          class: 'chip', 'aria-pressed': String(m === month),
          onclick: () => { state.month = m; render(); },
        }, [el('span', { text: monthName(m) })]),
      ]))),
  ]));

  /* Vad det är, i en mening som inte går att missförstå. */
  out.appendChild(el('section', {}, [
    el('div', { class: 'tiles' }, [
      el('div', { class: 'tile' }, [
        el('div', { class: 'label', text: 'Att betala ut för ' + monthName(month) + ' hittills' }),
        el('div', { class: 'value hero', text: kr(teamMonth) }),
        el('div', { class: 'delta', text: teamProj
          ? 'Blir ' + kr(teamProj.value) + ' om resten av månaden går likadant'
          : 'Månaden är slut – det här är hela summan' }),
      ]),
      el('div', { class: 'tile' }, [
        el('div', { class: 'label', text: 'Adspend som ligger bakom' }),
        el('div', { class: 'value', text: kr(rows.reduce(function (s, r) { return s + r.m.spend; }, 0)) }),
        el('div', { class: 'delta', text: pct(rate, 1) + ' av spenden går till den som gjort annonsen' }),
      ]),
      el('div', { class: 'tile' }, [
        el('div', { class: 'label', text: 'Köp från annonserna i månaden' }),
        el('div', { class: 'value', text: num(rows.reduce(function (s, r) { return s + (r.m.purchases || 0); }, 0)) }),
        el('div', { class: 'delta', text: 'Intäkt ' + kr(rows.reduce(function (s, r) { return s + (r.m.revenue || 0); }, 0)) }),
      ]),
    ]),
  ]));

  /* Adspend per person och månad — hela bilden i en tabell, inte en siffra i
     taget. Varje ruta: hur mycket personens annonser drog, och vad det ger. */
  const monthsDesc = months.slice().reverse();

  const head = el('tr', {}, [el('th', { text: 'Redigerare', scope: 'col' })]
    .concat(monthsDesc.map(function (m) { return el('th', { text: monthName(m), scope: 'col' }); }))
    .concat([el('th', { text: 'Totalt', scope: 'col' })]));

  const labels = ['Redigerare'].concat(monthsDesc.map(monthName)).concat(['Totalt']);

  const cell = function (spend, payout) {
    return el('td', { class: 'num' }, [
      el('div', { class: 'spend', text: kr(spend) }),
      el('div', { class: 'cut', text: payout > 0 ? '→ ' + kr(payout) : '–' }),
    ]);
  };

  const body = known.slice()
    .sort(function (a, b) { return b.totalSpend - a.totalSpend; })
    .map(function (e) {
      const tds = [el('td', {}, [el('div', { class: 'who' }, [
        el('span', { class: 'key', style: 'background:' + colorOf(e.id) }),
        el('div', {}, [el('div', { text: e.name })]),
      ])])];
      monthsDesc.forEach(function (m) {
        const v = e.byMonth[m] || { spend: 0, payout: 0 };
        tds.push(cell(v.spend, v.payout));
      });
      tds.push(cell(e.totalSpend, e.totalPayout));
      return labelCells(el('tr', {}, tds), labels);
    });

  // Summeringsrad: annars får man räkna ihop kolumnerna i huvudet.
  const totalRow = [el('td', {}, [el('b', { text: 'Alla' })])];
  monthsDesc.forEach(function (m) {
    totalRow.push(cell(
      known.reduce(function (s, e) { return s + ((e.byMonth[m] || {}).spend || 0); }, 0),
      known.reduce(function (s, e) { return s + ((e.byMonth[m] || {}).payout || 0); }, 0)));
  });
  totalRow.push(cell(
    known.reduce(function (s, e) { return s + e.totalSpend; }, 0),
    known.reduce(function (s, e) { return s + e.totalPayout; }, 0)));
  body.push(labelCells(el('tr', { class: 'total' }, totalRow), labels));

  out.appendChild(el('section', {}, [
    el('div', { class: 'card' }, [
      el('h2', { text: 'Adspend per person och månad' }),
      el('p', { class: 'hint', text: 'Stora siffran är hur mycket personens annonser drog i Meta den månaden. ' +
        'Pilen under är vad hen får ut: ' + pct(rate, 1) + ' av den.' }),
      el('div', { class: 'table-scroll' }, [
        el('table', { class: 'as-cards money' }, [el('thead', {}, [head]), el('tbody', {}, body)]),
      ]),
    ]),
  ]));

  /* Vad som vilar på ett påstående i stället för på en koppling. */
  if (P0.coverage.manualSpend > 0) {
    const manualKr = P0.coverage.manualSpend * rate;
    out.appendChild(el('div', { class: 'banner' }, [
      el('span', { text: 'ⓘ' }),
      el('div', { text: kr(manualKr) + ' av ersättningen bygger på att ' +
        (P0.coverage.statedBy || 'någon') + ' själv sagt vem som gjort annonserna' +
        (P0.coverage.statedAt ? ' (' + P0.coverage.statedAt + ')' : '') +
        ' — de annonserna finns inte i Notion, så panelen kan inte kontrollera det. Resten är matchad mot Notion.' }),
    ]));
  }

  /* Vinnarna – vilka annonser som faktiskt drar. */
  const winners = P0.ads.filter(function (a) { return a.spend >= 500; }).slice(0, 15);
  if (winners.length) {
    const wHead = el('tr', {}, ['Annons', 'Konto', 'Spend', 'Köp', 'ROAS', 'Gjord av'].map(function (h) {
      return el('th', { text: h, scope: 'col' });
    }));
    const wBody = winners.map(function (a) {
      const name = a.url
        ? el('td', {}, [el('a', { href: a.url, target: '_blank', rel: 'noopener', text: a.adName })])
        : el('td', { text: a.adName });
      return labelCells(el('tr', {}, [
        name,
        el('td', { text: a.account || '–' }),
        el('td', { class: 'num', text: kr(a.spend) }),
        el('td', { class: 'num', text: num(a.purchases) }),
        el('td', { class: 'num', text: a.roas == null ? '–' : nf1.format(a.roas) }),
        el('td', { text: a.editorName || '— ingen vet' }),
      ]), ['Annons', 'Konto', 'Spend', 'Köp', 'ROAS', 'Gjord av']);
    });
    out.appendChild(el('section', {}, [
      el('div', { class: 'card' }, [
        el('h2', { text: 'Annonserna som drar mest pengar' }),
        el('p', { class: 'hint', text: 'ROAS = intäkt per spenderad krona. Under 1,0 betyder att annonsen går back.' }),
        el('div', { class: 'table-scroll' }, [
          el('table', { class: 'as-cards' }, [el('thead', {}, [wHead]), el('tbody', {}, wBody)]),
        ]),
      ]),
    ]));
  }

  /* Luckan – och den är stor. Den ska synas, inte gömmas. */
  const cov = P0.coverage;
  if (cov.unmatchedSpend > 0) {
    out.appendChild(el('div', { class: 'banner' }, [
      el('span', { text: '⚠' }),
      el('div', { html: '<b>' + pct(1 - cov.share) + ' av spenden (' + escapeHtml(kr(cov.unmatchedSpend)) +
        ') går inte att knyta till någon.</b> Annonsen finns i Meta men inte i Notion, eller så saknar ' +
        'Notion-tasken ansvarig. De pengarna betalas inte ut till någon — panelen gissar aldrig. ' +
        'Listan nedan är de största; känner du igen vem som gjort en, sätt ansvarig på tasken i Notion så ' +
        'flyttas den hit av sig själv.' }),
    ]));

    const uHead = el('tr', {}, ['Annons', 'Konto', 'Spend', 'Skulle ge', 'Köp', 'ROAS', 'Kördes'].map(function (h) {
      return el('th', { text: h, scope: 'col' });
    }));
    const uLabels = ['Annons', 'Konto', 'Spend', 'Skulle ge', 'Köp', 'ROAS', 'Kördes'];
    const uBody = cov.topUnmatched.map(function (u) {
      return labelCells(el('tr', {}, [
        el('td', { text: u.adName }),
        el('td', { text: u.account || '–' }),
        el('td', { class: 'num' }, [el('b', { text: kr(u.spend) })]),
        el('td', { class: 'num', text: kr(u.payout) }),
        el('td', { class: 'num', text: num(u.purchases) }),
        el('td', { class: 'num', text: u.roas == null ? '–' : nf1.format(u.roas) }),
        el('td', { text: shortDate(u.firstDate) + '–' + shortDate(u.lastDate) }),
      ]), uLabels);
    });

    out.appendChild(el('section', {}, [
      el('div', { class: 'card' }, [
        el('h2', { text: 'Ingen får betalt för de här' }),
        el('p', { class: 'hint', text: '"Skulle ge" är vad ' + pct(rate, 1) + ' av spenden hade blivit om annonsen ' +
          'hade en ansvarig i Notion.' }),
        el('div', { class: 'table-scroll' }, [
          el('table', { class: 'as-cards' }, [el('thead', {}, [uHead]), el('tbody', {}, uBody)]),
        ]),
      ]),
    ]));
  }

  out.appendChild(el('footer', { class: 'foot', text:
    'Siffrorna kommer från Meta Ads och uppdateras varje timme. Kopplingen annons → person går via ' +
    'annonsnamnet: exakt namn, strukturerat namn (Produkt_Vinkel_nr) eller annonsnummer. Är namnet tvetydigt ' +
    'betalas ingen — hellre en synlig lucka än fel person.' +
    (P0.fetchedAt ? ' Senast hämtat ' + new Date(P0.fetchedAt).toLocaleString('sv-SE',
      { dateStyle: 'medium', timeStyle: 'short' }) + '.' : '') }));

  return out;
}

function flagsSection(M) {
  const ICON = { critical: '■', serious: '▲', warning: '▲' };
  const SHOWN = 40;

  // Vems bord bollen ligger på. Utan den här uppdelningen läses varje
  // stillastående task som att redigeraren är sen — och då pekar panelen åt
  // fel håll, vilket är sämre än att inte peka alls.
  const COURT_TEXT = {
    editor: { label: 'Hos redigeraren', hint: 'Ska göras eller göras om' },
    reviewer: { label: 'Hos granskaren', hint: 'Inlämnat, väntar på svar' },
    unassigned: { label: 'Saknar ansvarig', hint: 'Ingen har fått den' },
  };
  const courts = (M.courts || []).filter(c => c.count > 0);

  // Filtrera på vems bord. Chipsen visar antal, så man ser vad man väljer bort.
  const filtered = state.court === 'all' ? M.flags : M.flags.filter(f => f.court === state.court);
  const chips = el('ul', { class: 'chips' }, [
    ['all', 'Allt', M.flags.length],
    ...courts.map(c => [c.court, COURT_TEXT[c.court].label, c.count]),
  ].map(([id, label, n]) => el('li', {}, [
    el('button', {
      class: 'chip', 'aria-pressed': String(state.court === id),
      onclick: () => { state.court = id; render(); },
    }, [el('span', { text: label }), el('span', { class: 'n', text: String(n) })]),
  ])));

  // Hela raden är en länk till Notion-sidan. På telefonen öppnar det appen,
  // så man går från "den här står still" till att kunna göra något åt det
  // med ett tryck. Kryssrutan är avbockning för egen del och sparas i
  // webbläsaren — den rör inte Notion och syns inte för någon annan.
  const items = filtered.slice(0, SHOWN).map(f => {
    const done = state.done.has(f.task);
    const li = el('li', { class: done ? 'done' : '' }, [
      el('button', {
        class: 'tick', 'aria-pressed': String(done),
        'aria-label': done ? 'Markera som ej hanterad' : 'Markera som hanterad',
        title: 'Bockas av lokalt i din webbläsare — ändrar inget i Notion',
        onclick: () => {
          if (state.done.has(f.task)) state.done.delete(f.task); else state.done.add(f.task);
          saveDone(); render();
        },
      }, [el('span', { text: done ? '✓' : '○' })]),
      el(f.url ? 'a' : 'div', {
        class: 'body', href: f.url || null,
        target: f.url ? '_blank' : null, rel: f.url ? 'noreferrer' : null,
      }, [
        el('div', { class: 'who-line', text: f.title }),
        el('div', { class: 'detail' }, [
          el('span', { class: 'sev', style: 'color:' + STATUS[f.severity].color,
            text: (ICON[f.severity] || '·') + ' ' + f.detail }),
          el('span', { text: ' · ' + nameOf(f.editor) +
            (f.approximate ? ' · tid räknad från när tasken skapades' : '') }),
          // Vad väntan kostar. Utan den här raden ser en översättning av en
          // annons som drar 9 000 kr/dag likadan ut som en som drar noll.
          f.stake ? el('span', { class: 'stake',
            text: ' · originalet drar ' + kr(f.stake.perDay) + '/dag, ROAS ' +
              nf1.format(f.stake.roas) }) : null,
        ]),
      ]),
      el('div', { class: 'when', text: dur(f.minutes) }),
    ]);
    return li;
  });

  // Sammanfattning per typ — annars döljer en lång lista att det egentligen
  // är två eller tre problem, inte femtio.
  const byKind = {};
  for (const f of filtered) byKind[f.detail] = (byKind[f.detail] || 0) + 1;
  const summary = Object.entries(byKind).sort((a, b) => b[1] - a[1])
    .map(([detail, n]) => el('li', {}, [
      // Neutral prick: det här är antal per typ, inte en statusbedömning.
      el('span', { class: 'key', style: 'background:var(--text-muted)' }),
      el('span', { text: detail + ': ' + n }),
    ]));

  // Kopiera listan som text — klar att klistra in i Slack.
  const copyBtn = el('button', {
    class: 'rowbtn', style: 'margin-top:12px',
    onclick: async ev => {
      const lines = filtered.slice(0, SHOWN)
        .filter(f => !state.done.has(f.task))
        .map(f => '• ' + f.title + ' — ' + f.detail + ', ' + nameOf(f.editor) +
          ', ligger ' + dur(f.minutes) + (f.url ? '\n  ' + f.url : ''));
      const text = 'Står still (' + lines.length + ' st):\n' + lines.join('\n');
      try {
        await navigator.clipboard.writeText(text);
        ev.target.textContent = 'Kopierat ✓';
      } catch {
        ev.target.textContent = 'Kunde inte kopiera — markera texten manuellt';
      }
      setTimeout(() => { ev.target.textContent = 'Kopiera listan'; }, 2500);
    },
    text: 'Kopiera listan',
  });

  const courtTiles = courts.length ? el('div', { class: 'tiles', style: 'margin-bottom:16px' },
    courts.map(c => el('div', { class: 'tile' }, [
      el('div', { class: 'label', text: COURT_TEXT[c.court].label }),
      el('div', { class: 'value', text: num(c.count) }),
      el('div', { class: 'delta', text: COURT_TEXT[c.court].hint + ' · äldsta ' + c.oldestDays + ' d' }),
    ]))) : null;

  return el('section', {}, [
    el('div', { class: 'card' }, [
      el('h2', { text: 'Behöver en knuff' }),
      courtTiles,
      el('p', { class: 'hint', text: (filtered.some(f => f.stake)
        ? 'Sorterat efter vad väntan kostar, inte efter ålder: en översättning av en annons som drar 9 000 kr om dagen ligger före en som drar noll, även om den andra legat längre. '
        : '') +
        'Tryck på en rad för att öppna den i Notion. Ringen bockar av den åt dig — den sparas i din webbläsare och ändrar inget för någon annan.' }),
      M.flags.length ? chips : null,
      filtered.length ? el('ul', { class: 'legend' }, summary) : null,
      items.length ? el('ul', { class: 'flags' }, items) : el('div', { class: 'empty', text: 'Inget som skräpar. Allt rör sig.' }),
      items.length ? copyBtn : null,
      filtered.length > SHOWN
        ? el('p', { class: 'hint', style: 'margin-top:12px;margin-bottom:0',
            text: 'Visar de ' + SHOWN + ' som legat längst av ' + filtered.length + '.' })
        : null,
    ]),
  ]);
}

const STATE_LABEL = {
  assigned: 'Tilldelad', in_progress: 'Pågår', in_review: 'I granskning',
  revision: 'Revision', approved: 'Godkänd', cancelled: 'Avbruten',
};

function tasksSection(M) {
  const rows = M.tasks.slice(0, 400).map(t => el('tr', {}, [
    el('td', { text: t.id }),
    el('td', {}, [el('div', { class: 'who' }, [
      el('span', { class: 'key', style: 'background:' + colorOf(t.editor) }),
      el('span', { text: nameOf(t.editor) }),
    ])]),
    el('td', { text: t.title }),
    el('td', { text: STATE_LABEL[t.state] || t.state }),
    el('td', { class: 'num', text: dur(t.turnaroundMin) }),
    el('td', { class: 'num', text: dur(t.cycleMin) }),
    el('td', { class: 'num', text: num(t.revisionCount) }),
    el('td', { class: 'num', text: t.onTime == null ? '–' : (t.onTime ? 'Ja' : 'Nej') }),
  ]));

  return el('section', {}, [
    el('div', { class: 'card' }, [
      el('h2', { text: 'Tasks i perioden' }),
      el('p', { class: 'hint', text: 'Rådata bakom siffrorna ovan — så att ingen siffra behöver tas på förtroende.' }),
      el('div', { class: 'table-scroll' }, [
        el('table', {}, [
          el('thead', {}, [el('tr', {}, ['Task', 'Redigerare', 'Titel', 'Status', 'Ledtid', 'Total cykel', 'Rev.', 'I tid']
            .map(h => el('th', { text: h, scope: 'col' })))]),
          el('tbody', {}, rows),
        ]),
      ]),
    ]),
  ]);
}

render();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
`;
