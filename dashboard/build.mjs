#!/usr/bin/env node
// Bygger dashboard/index.html — en självständig fil, ingen server, inga beroenden.
// Öppna den i webbläsaren eller lägg den i Drive. Kör om efter varje ändring.
//   node dashboard/build.mjs [--date YYYY-MM-DD] [--out path]

import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './lib/store.mjs';
import { STATUSES, TASK_TYPES, isLate } from './lib/model.mjs';
import { overview, editorKpis, productStatus, missingReports, quotaPerCycle, testShare } from './lib/kpi.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };

const DATE = flag('date', S.today());
const FROM = flag('from', DATE);
const TO   = flag('to', DATE);

const tasks = S.loadTasks();
const events = S.loadEvents();
const team = S.loadTeam();
const products = S.loadProducts();
const reports = S.loadReports();
const plans = S.loadPlans();
const snap = (() => { try { return JSON.parse(
  readFileSync(join(HERE, 'data', 'notion-snapshot.json'), 'utf8')); } catch { return null; } })();

const editors = team.users.filter(u => u.role === 'editor' && u.active);
const o = overview(tasks, events, products, FROM, TO, DATE);
const missing = missingReports(team, reports, DATE);

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nameOf = id => team.users.find(u => u.id === id)?.name ?? id;
const prodName = id => products.find(p => p.id === id)?.name?.replace(' (Bäverbutiken)', '') ?? id;

/** Status som text + ikon + färg — aldrig färg ensamt. */
const badge = (t) => {
  const s = STATUSES[t.status];
  const late = isLate(t, DATE);
  return `<span class="badge ${s.tone}"><span aria-hidden="true">${s.icon}</span> ${s.label}</span>` +
         (late ? ` <span class="badge danger"><span aria-hidden="true">⚠</span> Late</span>` : '');
};

const kpiTile = (label, value, sub = '', tip = '') => `
  <div class="tile"${tip ? ` title="${esc(tip)}"` : ''}>
    <div class="tile-label">${esc(label)}</div>
    <div class="tile-value">${value === null || value === undefined ? '–' : esc(value)}</div>
    ${sub ? `<div class="tile-sub">${esc(sub)}</div>` : ''}
  </div>`;

const quotaPill = (st) => {
  const icon = st.signal === 'ok' ? '🟢' : st.signal === 'warn' ? '🟡' : '🔴';
  const txt = `${st.diff >= 0 ? '+' : ''}${st.diff}`;
  return `<span class="pill ${st.signal}">${icon} ${txt} mot mål</span>`;
};

const taskRow = (t, { showEditor = true } = {}) => `
  <tr>
    <td>${badge(t)}</td>
    <td class="prio prio-${t.priority}">${t.priority === 'high' ? '▲ High' : t.priority === 'low' ? '▽ Low' : '– Normal'}</td>
    <td><strong>${esc(t.id)}</strong><br><span class="muted">${esc(t.title)}</span></td>
    <td>${esc(prodName(t.productId))}</td>
    ${showEditor ? `<td>${esc(nameOf(t.assignedEditorId).split(' ')[0])}</td>` : ''}
    <td class="num">${t.deliveredCreativeCount}/${t.plannedCreativeCount}</td>
    <td>${esc(t.dueDate)}</td>
    <td>${t.status === 'blocked' ? `<span class="blocker">${esc(t.blockerReason)}</span>` : t.feedbackHistory.length ? `<span class="muted">↺ v${t.currentRevision}</span>` : ''}</td>
    <td><a href="${esc(t.briefLink)}" target="_blank" rel="noopener">Brief</a>${t.deliveryLink ? ` · <a href="${esc(t.deliveryLink)}" target="_blank" rel="noopener">Delivery</a>` : ''}</td>
  </tr>`;

const table = (rows, headers) => rows.length
  ? `<div class="scroll"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`
  : `<p class="empty">Nothing here. That is a good sign — nothing needs your attention in this list.</p>`;

// ---------- Sektioner ----------

const attentionSection = `
<section id="attention">
  <h2>Behöver din uppmärksamhet <span class="count">${o.attention.length}</span></h2>
  <p class="lede">Börja här. Allt annat rullar på utan dig.</p>
  ${o.attention.length === 0 ? `<p class="empty">Inget kräver dig just nu. Grönmarkera dagen när slutrapporterna kommit in.</p>` : `
  <div class="cards">
    ${o.attention.map(a => `
      <article class="card ${a.kind}">
        <div class="card-top">${badge(a.task)}<span class="muted">${esc(prodName(a.task.productId))}</span></div>
        <h3>${esc(a.task.id)} · ${esc(a.task.title)}</h3>
        <p class="why">${esc(a.why)}</p>
        ${a.task.blockerNeeds ? `<p class="needs"><strong>Behöver:</strong> ${esc(a.task.blockerNeeds)}${a.task.blockerOwner ? ` <em>(${esc(nameOf(a.task.blockerOwner))})</em>` : ''}</p>` : ''}
        <p class="meta">${esc(nameOf(a.task.assignedEditorId))} · due ${esc(a.task.dueDate)}</p>
        <p class="actions">
          <a href="${esc(a.task.briefLink)}" target="_blank" rel="noopener">Öppna brief</a>
          ${a.task.deliveryLink ? ` · <a href="${esc(a.task.deliveryLink)}" target="_blank" rel="noopener">Öppna leverans</a>` : ''}
        </p>
        <p class="cmd">Kommando: <code>node dashboard/cli.mjs ${a.kind === 'review' ? `approve ${a.task.id} --as anna` : `history ${a.task.id}`}</code></p>
      </article>`).join('')}
  </div>`}
  ${missing.length ? `<p class="warnline"><strong>Saknad slutrapport idag:</strong> ${missing.map(m => esc(m.name)).join(', ')}</p>` : ''}
</section>`;

const overviewSection = `
<section id="overview">
  <h2>Översikt · ${esc(FROM)}${TO !== FROM ? ' – ' + esc(TO) : ''}</h2>
  <div class="tiles">
    ${kpiTile('Tasks i perioden', o.totalTasks)}
    ${kpiTile('Godkända', o.approved, '', 'Tasks som passerat granskning med grön checklista.')}
    ${kpiTile('Pågår', o.inProgress)}
    ${kpiTile('Blockerade', o.blocked, '', 'Redigeraren kan inte fortsätta utan hjälp.')}
    ${kpiTile('Sena', o.late, '', 'Deadline passerad och inte godkänd.')}
    ${kpiTile('Väntar granskning', o.inReview, '', 'Levererat, men inte godkänt än.')}
  </div>
  <div class="tiles">
    ${kpiTile('Creatives planerade', o.creativesPlanned)}
    ${kpiTile('Creatives levererade', o.creativesDelivered, '', 'Redigeraren har lämnat in — inte samma sak som godkänt.')}
    ${kpiTile('Creatives godkända', o.creativesApproved, '', 'Det enda som räknas mot kvoten.')}
    ${kpiTile('Plan mot utfall', `${o.creativesApproved - o.creativesPlanned >= 0 ? '+' : ''}${o.creativesApproved - o.creativesPlanned}`, 'godkända − planerade')}
  </div>

  <h3>Produkter mot creative-målet</h3>
  <p class="lede">Kvoten kommer från samma formel som resten av systemet: 20 % av dagsbudgeten (10 % över 5 000 kr) ÷ target-CPA × 3.</p>
  ${table(o.products.map(p => {
    const prod = products.find(x => x.id === p.productId);
    return `<tr>
      <td><strong>${esc(p.name.replace(' (Bäverbutiken)', ''))}</strong></td>
      <td class="num">${prod.daily_budget_sek.toLocaleString('sv-SE')} kr</td>
      <td class="num">${testShare(prod.daily_budget_sek) * 100} %</td>
      <td class="num">${quotaPerCycle(prod)}</td>
      <td class="num">${p.targetInRange}</td>
      <td class="num">${p.inProduction}</td>
      <td class="num">${p.delivered}</td>
      <td class="num">${p.approved}</td>
      <td>${quotaPill(p)}</td>
    </tr>`;
  }), ['Produkt', 'Budget/dag', 'Testandel', 'Kvot/cykel', 'Mål i perioden', 'I produktion', 'Levererat', 'Godkänt', 'Läge'])}
</section>`;

const todoSection = `
<section id="todo">
  <h2>Dagens lista · alla redigerare</h2>
  <p class="lede">Sorterad på prioritet och deadline.</p>
  ${table(
    tasks.filter(t => t.plannedDate === DATE || ['in_progress', 'blocked', 'changes', 'in_review'].includes(t.status))
      .sort((a, b) => ({ high: 0, normal: 1, low: 2 }[a.priority] - { high: 0, normal: 1, low: 2 }[b.priority]) || a.dueDate.localeCompare(b.dueDate))
      .map(t => taskRow(t)),
    ['Status', 'Prio', 'Task', 'Produkt', 'Redigerare', 'Creatives', 'Deadline', 'Blocker / rev', 'Länkar'])}
</section>`;

const reviewSection = `
<section id="review">
  <h2>Review-kö <span class="count">${o.inReview}</span></h2>
  <p class="lede">En task blir aldrig godkänd bara för att någon säger att den är klar. Checklistan måste vara grön — annars krävs en skriven override.</p>
  ${o.inReview === 0 ? `<p class="empty">Kön är tom.</p>` : tasks.filter(t => t.status === 'in_review')
    .sort((a, b) => (a.completedAt ?? '').localeCompare(b.completedAt ?? ''))
    .map(t => {
      const req = t.checklist.filter(c => c.required);
      const open = req.filter(c => c.passed !== true);
      const ready = open.length === 0;
      return `
      <article class="review-card">
        <div class="card-top">
          <h3>${esc(t.id)} · ${esc(t.title)}</h3>
          <span class="pill ${ready ? 'ok' : 'warn'}">${ready ? '✓ Checklistan klar' : `⚠ ${open.length} punkter kvar`}</span>
        </div>
        <p class="meta">${esc(nameOf(t.assignedEditorId))} · ${esc(prodName(t.productId))} · ${t.deliveredCreativeCount} creatives · levererad ${esc(t.completedAt?.slice(0, 16).replace('T', ' '))}</p>
        ${t.feedbackHistory.length ? `<p class="prev-feedback"><strong>Tidigare feedback (runda ${t.currentRevision}):</strong> ${esc(t.feedbackHistory.at(-1).feedback)}</p>` : ''}
        <details${ready ? '' : ' open'}>
          <summary>Checklista (${req.length - open.length}/${req.length} gröna)</summary>
          <ul class="checklist">
            ${t.checklist.map(c => `<li class="${c.passed === true ? 'pass' : c.passed === false ? 'fail' : 'todo'}">
              <span aria-hidden="true">${c.passed === true ? '✓' : c.passed === false ? '✗' : '○'}</span>
              ${esc(c.item)}${c.required ? '' : ' <em>(valfri)</em>'}
              ${c.question && c.passed !== true ? `<br><span class="question">Fråga redigeraren: ${esc(c.question)}</span>` : ''}
            </li>`).join('')}
          </ul>
        </details>
        <p class="actions"><a href="${esc(t.deliveryLink)}" target="_blank" rel="noopener">Öppna leverans</a> · <a href="${esc(t.briefLink)}" target="_blank" rel="noopener">Öppna brief</a></p>
        <p class="cmd">Godkänn: <code>node dashboard/cli.mjs approve ${t.id} --as anna</code><br>
           Skicka tillbaka: <code>node dashboard/cli.mjs changes ${t.id} --as anna --feedback "..."</code></p>
      </article>`;
    }).join('')}
</section>`;

const editorSections = editors.map(e => {
  const k = editorKpis(tasks, events, e.id, FROM, TO, DATE);
  const week = editorKpis(tasks, events, e.id, new Date(new Date(DATE) - 6 * 864e5).toISOString().slice(0, 10), DATE, DATE);
  const mine = tasks.filter(t => t.assignedEditorId === e.id && (t.plannedDate === DATE || ['in_progress', 'blocked', 'changes', 'in_review'].includes(t.status)));
  const plan = plans.find(p => p.editorId === e.id && p.date === DATE);
  const goal = plan?.plannedCreativeCount ?? mine.reduce((s, t) => s + t.plannedCreativeCount, 0);
  const done = mine.filter(t => t.completedAt?.startsWith(DATE)).reduce((s, t) => s + t.deliveredCreativeCount, 0);
  const pctDone = goal ? Math.min(100, Math.round((done / goal) * 100)) : 0;
  return `
  <section id="editor-${e.id}" class="editor-page">
    <h2>${esc(e.name)}</h2>
    <p class="lede">${esc(e.profile?.skills?.join(' · ') ?? '')}${e.profile?.notes ? ` — ${esc(e.profile.notes)}` : ''}</p>
    <div class="progress-wrap">
      <div class="progress-label">${done} av ${goal} creatives levererade idag</div>
      <div class="progress" role="progressbar" aria-valuenow="${pctDone}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" style="width:${pctDone}%"></div>
      </div>
    </div>
    ${plan?.managerNotes ? `<p class="note"><strong>Från managern:</strong> ${esc(plan.managerNotes)}</p>` : ''}
    <div class="tiles">
      ${kpiTile('Creatives idag', k.creativesDelivered)}
      ${kpiTile('Creatives 7 dagar', week.creativesDelivered)}
      ${kpiTile('On-time rate', week.onTimeRate === null ? '–' : week.onTimeRate + ' %', '', 'Andel leveranser inlämnade senast deadline.')}
      ${kpiTile('First-pass approval', week.firstPassRate === null ? '–' : week.firstPassRate + ' %', '', 'Godkänd utan en enda revisionsrunda.')}
      ${kpiTile('Revision rate', week.revisionRate === null ? '–' : week.revisionRate + ' %', '', 'Läs mot snitt creatives/task — svårare tasks ger fler revisioner.')}
      ${kpiTile('Öppna tasks', k.openTasks, '', 'Nuvarande arbetsbelastning.')}
    </div>
    <p class="context">Kontext: snitt ${week.avgPlannedCreativesPerTask ?? '–'} creatives per task, ${week.avgRevisionRounds ?? '–'} revisionsrundor i snitt, ${week.blockersReported} blockers rapporterade. <strong>KPI:er ska läsas mot svårighetsgraden — inte som en topplista.</strong></p>
    ${table(mine.map(t => taskRow(t, { showEditor: false })), ['Status', 'Prio', 'Task', 'Produkt', 'Creatives', 'Deadline', 'Blocker / rev', 'Länkar'])}
  </section>`;
}).join('');

const productSections = o.products.map(p => {
  const prod = products.find(x => x.id === p.productId);
  const mine = tasks.filter(t => t.productId === p.productId);
  return `
  <section id="product-${p.productId}" class="product-page">
    <h2>${esc(p.name.replace(' (Bäverbutiken)', ''))} ${quotaPill(p)}</h2>
    <div class="tiles">
      ${kpiTile('Kvot per 3-dagarscykel', quotaPerCycle(prod), `${p.targetPerDay}/dag`)}
      ${kpiTile('Mål i perioden', p.targetInRange)}
      ${kpiTile('I backlog', p.inBacklog)}
      ${kpiTile('I produktion', p.inProduction)}
      ${kpiTile('Levererat', p.delivered)}
      ${kpiTile('Godkänt', p.approved, '', 'Bara godkända creatives räknas mot kvoten.')}
    </div>
    <p class="context">Budget ${prod.daily_budget_sek.toLocaleString('sv-SE')} kr/dag · testandel ${testShare(prod.daily_budget_sek) * 100} % · target-CPA ${prod.target_cpa_sek} kr · break-even-ROAS ${prod.break_even_roas ?? '–'} · target-ROAS ${prod.target_roas_25pct ?? '–'}</p>
    <p class="actions">Redigerare på produkten: ${p.editors.map(x => esc(nameOf(x).split(' ')[0])).join(', ') || '–'} · blockers ${p.blockers}</p>
    ${table(mine.filter(t => !['approved', 'cancelled'].includes(t.status)).map(t => taskRow(t)),
      ['Status', 'Prio', 'Task', 'Produkt', 'Redigerare', 'Creatives', 'Deadline', 'Blocker / rev', 'Länkar'])}
  </section>`;
}).join('');

const historySection = `
<section id="history">
  <h2>Historik</h2>
  <p class="lede">Varje ändring loggas: vem, vad, när och varifrån (dashboard, Slack, AI eller CLI).</p>
  ${table(events.slice(-80).reverse().map(e => `
    <tr>
      <td class="muted">${esc(e.createdAt.slice(0, 16).replace('T', ' '))}</td>
      <td>${esc(e.taskId ?? '–')}</td>
      <td>${esc(nameOf(e.userId).split(' ')[0])}</td>
      <td>${esc(e.type)}</td>
      <td>${e.oldStatus ? `${esc(e.oldStatus)} → ${esc(e.newStatus)}` : ''}</td>
      <td><span class="src src-${esc(e.source)}">${esc(e.source)}</span></td>
      <td class="muted">${esc((e.message ?? '').slice(0, 90))}</td>
    </tr>`), ['Tid', 'Task', 'Vem', 'Händelse', 'Status', 'Varifrån', 'Detalj'])}
</section>`;


const notionSection = !snap ? '' : (() => {
  const rows = o.products.map(p => {
    const s = snap.products[p.productId]; if (!s) return '';
    const prod = products.find(x => x.id === p.productId);
    const assigned = Object.entries(s.byEditor).filter(([k]) => k !== 'unassigned');
    const unass = s.byEditor.unassigned ?? 0;
    return `<tr>
      <td><strong>${esc(p.name.replace(' (Bäverbutiken)', ''))}</strong><br>
          <a href="${esc(prod.notion.url)}" target="_blank" rel="noopener">${esc(prod.notion.name)}</a></td>
      <td class="num">${s.total}</td>
      <td class="num">${s.byStatus.Approved ?? 0}</td>
      <td class="num">${(s.byStatus['In progress'] ?? 0) + (s.byStatus['In progress 2'] ?? 0)}</td>
      <td class="num">${(s.byStatus['In Review'] ?? 0) + (s.byStatus['Creative strat review'] ?? 0) + (s.byStatus['To be Reviewed'] ?? 0)}</td>
      <td class="num">${s.byStatus.Draft ?? 0}</td>
      <td>${assigned.length ? assigned.map(([id, n]) =>
            `${esc((snap.notionUsers[id] ?? id).split(' ')[0])} ${n}`).join(' · ') : '–'}</td>
      <td class="num">${unass ? `<span class="badge danger"><span aria-hidden="true">⚠</span> ${unass}</span>` : '0'}</td>
    </tr>`;
  });
  const totBriefs = Object.values(snap.products).reduce((s, x) => s + x.total, 0);
  const totUnass = Object.values(snap.products).reduce((s, x) => s + (x.byEditor.unassigned ?? 0), 0);
  return `
<section id="notion">
  <h2>Notion · creative hubs</h2>
  <p class="lede">Läst direkt ur produkternas Notion-databaser ${esc(snap.syncedAt.slice(0, 16).replace('T', ' '))}.
     Notion är där briefarna bor — den här vyn visar vad som finns och vem som står som Ansvarig.</p>
  <div class="tiles">
    ${kpiTile('Briefer totalt', totBriefs, 'i de 4 skalningsprodukterna')}
    ${kpiTile('Godkända', Object.values(snap.products).reduce((s, x) => s + (x.byStatus.Approved ?? 0), 0))}
    ${kpiTile('Utan Ansvarig', totUnass, `${Math.round(totUnass / totBriefs * 100)} % av alla briefer`,
      'Ingen står som ansvarig i Notion — då går det inte att mäta vem som gjort vad.')}
  </div>
  ${totUnass ? `<p class="warnline"><strong>${totUnass} av ${totBriefs} briefer saknar Ansvarig i Notion.</strong>
     Så länge fältet är tomt kan systemet inte visa hur mycket varje redigerare jobbar. Det är den
     enda ändringen som krävs i Notion för att KPI:erna ska bli verkliga.</p>` : ''}
  ${table(rows, ['Produkt / Notion-databas', 'Briefer', 'Godkända', 'Pågår', 'I granskning', 'Draft', 'Ansvarig i Notion', 'Utan ansvarig'])}
</section>`;
})();

const nav = `
<nav class="tabs" role="tablist">
  <button class="tab active" data-target="attention">Uppmärksamhet <span class="count">${o.attention.length}</span></button>
  <button class="tab" data-target="overview">Översikt</button>
  <button class="tab" data-target="notion">Notion</button>
  <button class="tab" data-target="todo">Dagens lista</button>
  <button class="tab" data-target="review">Review-kö <span class="count">${o.inReview}</span></button>
  ${editors.map(e => `<button class="tab" data-target="editor-${e.id}">${esc(e.name.split(' ')[0])}</button>`).join('')}
  ${o.products.map(p => `<button class="tab" data-target="product-${p.productId}">${esc(prodName(p.productId))}</button>`).join('')}
  <button class="tab" data-target="history">Historik</button>
</nav>`;

const html = `<!doctype html>
<html lang="sv">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bäverbutiken · Redigerardashboard ${esc(DATE)}</title>
<style>
:root{
  --paper:#faf9f7; --raise:#f2f0ec; --ink:#15171c; --ink-2:#3d424d; --muted:#6f7480;
  --line:#e2ded7; --marine:#1d4e78;
  --moss:#2c6a44; --moss-bg:#e8f1ea; --amber:#8a5c0b; --amber-bg:#faf1de;
  --rust:#9a3227; --rust-bg:#fbebe8; --steel:#2d5580; --steel-bg:#e9f0f7;
  --shadow:0 1px 2px rgba(21,23,28,.05);
}
@media (prefers-color-scheme:dark){:root{
  --paper:#14161b; --raise:#1c1f26; --ink:#e8eaee; --ink-2:#b9bec8; --muted:#8b919d;
  --line:#2b2f38; --marine:#8ab4e8;
  --moss:#6cc78f; --moss-bg:#14301f; --amber:#e0b264; --amber-bg:#302510;
  --rust:#ef9086; --rust-bg:#361715; --steel:#8fb6e0; --steel-bg:#152840;
  --shadow:0 1px 2px rgba(0,0,0,.3);
}}
:root[data-theme="dark"]{
  --paper:#14161b; --raise:#1c1f26; --ink:#e8eaee; --ink-2:#b9bec8; --muted:#8b919d;
  --line:#2b2f38; --marine:#8ab4e8;
  --moss:#6cc78f; --moss-bg:#14301f; --amber:#e0b264; --amber-bg:#302510;
  --rust:#ef9086; --rust-bg:#361715; --steel:#8fb6e0; --steel-bg:#152840;
  --shadow:0 1px 2px rgba(0,0,0,.3);
}
:root[data-theme="light"]{
  --paper:#faf9f7; --raise:#f2f0ec; --ink:#15171c; --ink-2:#3d424d; --muted:#6f7480;
  --line:#e2ded7; --marine:#1d4e78;
  --moss:#2c6a44; --moss-bg:#e8f1ea; --amber:#8a5c0b; --amber-bg:#faf1de;
  --rust:#9a3227; --rust-bg:#fbebe8; --steel:#2d5580; --steel-bg:#e9f0f7;
  --shadow:0 1px 2px rgba(21,23,28,.05);
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);
  font:15px/1.55 ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  -webkit-font-smoothing:antialiased}
.num,td.num,.tile-value,table{font-variant-numeric:tabular-nums}

header{padding:22px 18px 14px;border-bottom:1px solid var(--line)}
h1{margin:0;font-size:19px;font-weight:650;letter-spacing:-.01em;text-wrap:balance}
.sub{margin:5px 0 0;color:var(--muted);font-size:13px}

.tabs{display:flex;gap:6px;overflow-x:auto;padding:10px 18px;border-bottom:1px solid var(--line);
  position:sticky;top:0;background:var(--paper);z-index:20;-webkit-overflow-scrolling:touch;scrollbar-width:thin}
.tab{flex:0 0 auto;min-height:40px;padding:7px 14px;border:1px solid var(--line);background:var(--raise);
  color:var(--ink-2);border-radius:8px;font:inherit;font-size:13.5px;cursor:pointer;white-space:nowrap;
  display:inline-flex;align-items:center;gap:7px}
.tab:hover{border-color:var(--muted)}
.tab:focus-visible{outline:2px solid var(--marine);outline-offset:2px}
.tab.active{background:var(--ink);color:var(--paper);border-color:var(--ink);font-weight:600}
.tab.active .count{background:transparent;border-color:currentColor;color:inherit}

main{padding:18px;max-width:1360px;margin:0 auto}
section{display:none} section.visible{display:block}
h2{font-size:20px;font-weight:650;letter-spacing:-.01em;margin:22px 0 3px;
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;text-wrap:balance}
h3{font-size:15px;font-weight:650;margin:22px 0 6px;
  text-transform:uppercase;letter-spacing:.07em;color:var(--muted)}
.lede{color:var(--muted);font-size:13.5px;margin:0 0 14px;max-width:70ch}
.count{background:var(--raise);border:1px solid var(--line);border-radius:99px;
  padding:1px 8px;font-size:12.5px;font-weight:600;color:var(--ink-2)}

.tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(148px,1fr));gap:10px;margin:14px 0}
.tile{background:var(--raise);border:1px solid var(--line);border-radius:10px;padding:12px 14px;box-shadow:var(--shadow)}
.tile-label{font-size:10.5px;font-weight:650;color:var(--muted);text-transform:uppercase;letter-spacing:.09em}
.tile-value{font-size:27px;font-weight:680;line-height:1.1;margin-top:3px;letter-spacing:-.02em}
.tile-sub{font-size:12px;color:var(--muted);margin-top:1px}

.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(296px,1fr));gap:12px}
.card,.review-card{background:var(--raise);border:1px solid var(--line);border-left:4px solid var(--muted);
  border-radius:10px;padding:14px 15px;box-shadow:var(--shadow)}
.card.blocker,.card.late{border-left-color:var(--rust)}
.card.review,.review-card{border-left-color:var(--amber)}
.review-card{margin-bottom:12px}
.card h3,.review-card h3{margin:7px 0 0;font-size:15.5px;font-weight:650;
  text-transform:none;letter-spacing:-.005em;color:var(--ink)}
.card-top{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.why{margin:7px 0 0;font-weight:600;font-size:14px}
.needs{margin:7px 0 0;font-size:13.5px;color:var(--ink-2)}
.meta,.context{color:var(--muted);font-size:12.5px;margin:7px 0 0}
.context{max-width:80ch;line-height:1.5}
.actions{margin:9px 0 0;font-size:13.5px}
.cmd{margin:9px 0 0;font-size:11.5px;color:var(--muted);line-height:1.7}
code{background:var(--paper);border:1px solid var(--line);border-radius:4px;padding:1px 5px;
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;word-break:break-all}

.badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:650;
  border-radius:6px;padding:3px 8px;white-space:nowrap;letter-spacing:.01em}
.badge.ok{background:var(--moss-bg);color:var(--moss)}
.badge.warn{background:var(--amber-bg);color:var(--amber)}
.badge.danger{background:var(--rust-bg);color:var(--rust)}
.badge.info{background:var(--steel-bg);color:var(--steel)}
.badge.neutral{background:var(--raise);color:var(--muted);border:1px solid var(--line)}
.pill{display:inline-block;font-size:12.5px;font-weight:650;border-radius:99px;padding:3px 11px}
.pill.ok{background:var(--moss-bg);color:var(--moss)}
.pill.warn{background:var(--amber-bg);color:var(--amber)}
.pill.danger{background:var(--rust-bg);color:var(--rust)}

.scroll{overflow-x:auto;border:1px solid var(--line);border-radius:10px;margin:10px 0;background:var(--raise)}
table{border-collapse:collapse;width:100%;font-size:13.5px;min-width:740px}
th{text-align:left;font-size:10.5px;font-weight:650;text-transform:uppercase;letter-spacing:.09em;
  color:var(--muted);padding:10px 11px;border-bottom:1px solid var(--line);white-space:nowrap}
td{padding:10px 11px;border-bottom:1px solid var(--line);vertical-align:top}
tbody tr:last-child td{border-bottom:none}
tbody tr:hover{background:var(--paper)}
.num{text-align:right;white-space:nowrap}
.muted{color:var(--muted);font-size:12.5px}
.prio{font-size:12.5px;white-space:nowrap}
.prio-high{color:var(--rust);font-weight:650} .prio-low{color:var(--muted)}
.blocker{color:var(--rust);font-size:12.5px}

.empty{background:var(--raise);border:1px dashed var(--line);border-radius:10px;
  padding:26px 20px;text-align:center;color:var(--muted);font-size:13.5px}
.warnline{background:var(--amber-bg);color:var(--amber);border-radius:8px;
  padding:11px 14px;font-size:13.5px;margin-top:14px}
.note{background:var(--steel-bg);color:var(--steel);border-radius:8px;padding:11px 14px;font-size:13.5px}
.prev-feedback{background:var(--amber-bg);color:var(--amber);border-radius:7px;
  padding:9px 12px;font-size:13.5px;margin:9px 0 0}

details{margin:11px 0 0} summary{cursor:pointer;font-weight:600;font-size:13.5px;padding:4px 0}
summary:focus-visible{outline:2px solid var(--marine);outline-offset:2px}
.checklist{list-style:none;padding:0;margin:8px 0 0}
.checklist li{padding:6px 0;font-size:13.5px;border-bottom:1px solid var(--line);
  display:flex;gap:8px;align-items:flex-start}
.checklist li:last-child{border-bottom:none}
.checklist li.pass{color:var(--moss)} .checklist li.fail{color:var(--rust)} .checklist li.todo{color:var(--muted)}
.question{color:var(--amber);font-size:12.5px;font-style:italic;display:block;margin-top:3px}

.progress-wrap{margin:14px 0}
.progress-label{font-size:13.5px;font-weight:650;margin-bottom:6px}
.progress{background:var(--raise);border:1px solid var(--line);border-radius:99px;height:12px;overflow:hidden}
.progress-bar{background:var(--moss);height:100%;border-radius:99px}
.src{font-size:10.5px;font-weight:600;border-radius:4px;padding:2px 6px;
  background:var(--paper);border:1px solid var(--line);color:var(--muted);text-transform:uppercase;letter-spacing:.05em}
a{color:var(--marine);text-underline-offset:2px}
a:focus-visible{outline:2px solid var(--marine);outline-offset:2px}
footer{padding:24px 18px;color:var(--muted);font-size:12.5px;border-top:1px solid var(--line);
  margin-top:32px;line-height:1.8}
@media(max-width:640px){
  main{padding:14px} .tabs{padding:9px 14px} header{padding:18px 14px 12px}
  .tile-value{font-size:23px} h2{font-size:18px}
}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style>
</head>
<body>
<header>
  <h1>Bäverbutiken · Redigerardashboard</h1>
  <p class="sub">${esc(DATE)}${TO !== FROM ? ` · period ${esc(FROM)} – ${esc(TO)}` : ''} · ${editors.length} redigerare · ${o.products.length} produkter vi skalar · genererad ${new Date().toISOString().slice(0, 16).replace('T', ' ')}</p>
</header>
${nav}
<main>
${attentionSection}
${overviewSection}
${notionSection}
${todoSection}
${reviewSection}
${editorSections}
${productSections}
${historySection}
</main>
<footer>
  Bygg om efter varje ändring: <code>node dashboard/build.mjs</code> ·
  Visa annat datum: <code>node dashboard/build.mjs --date 2026-08-01</code> ·
  Period: <code>--from 2026-07-29 --to 2026-08-05</code><br>
  Godkända creatives är det enda som räknas mot kvoten. Levererad ≠ godkänd.
</footer>
<script>
const tabs=[...document.querySelectorAll('.tab')],secs=[...document.querySelectorAll('section')];
function show(id){secs.forEach(s=>s.classList.toggle('visible',s.id===id));
  tabs.forEach(t=>t.classList.toggle('active',t.dataset.target===id));
  history.replaceState(null,'','#'+id);}
tabs.forEach(t=>t.addEventListener('click',()=>show(t.dataset.target)));
show(location.hash.slice(1)||'attention');
</script>
</body>
</html>`;

const out = flag('out', join(HERE, 'index.html'));
writeFileSync(out, html);
console.log(`✓ Dashboard byggd: ${out}`);
console.log(`  ${DATE} · ${o.attention.length} kräver uppmärksamhet · ${o.inReview} i review-kö · ${o.blocked} blockerade · ${o.late} sena`);
