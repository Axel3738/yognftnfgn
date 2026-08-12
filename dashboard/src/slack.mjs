// Slack-kopplingen.
//
// Två lägen, båda utan npm-beroenden:
//   1) Incoming webhook  — SLACK_WEBHOOK_URL. Enklast, postar i EN kanal.
//   2) Bot-token         — SLACK_BOT_TOKEN (xoxb-...). Krävs för DM till
//      enskilda redigerare (scopes: chat:write, im:write).
//
// Ingenting skickas utan att man ber om det. `--dry-run` skriver ut exakt
// den JSON som annars hade postats.

import { formatDuration } from './time.mjs';
import { revisionSeverity } from './metrics.mjs';

const ICON = { critical: ':red_circle:', serious: ':large_orange_circle:', warning: ':warning:', good: ':white_check_mark:' };

function pct(x, digits = 0) {
  if (x == null || !Number.isFinite(x)) return '–';
  return `${(x * 100).toFixed(digits).replace('.', ',')}%`;
}

function arrow(delta, lowerIsBetter) {
  if (delta == null || !Number.isFinite(delta) || Math.abs(delta) < 0.005) return '→ oförändrat';
  const worse = lowerIsBetter ? delta > 0 : delta < 0;
  const sign = delta > 0 ? '+' : '';
  return `${delta > 0 ? '↑' : '↓'} ${sign}${(delta * 100).toFixed(0)}% ${worse ? '(åt fel håll)' : '(åt rätt håll)'}`;
}

/** Dagsdigest till kanalen: läget i stort + vem som behöver knuffas. */
export function buildDigest(metrics, config, opts = {}) {
  const t = metrics.team;
  const prev = t.previous;
  const wd = config.workday;
  const rel = (a, b) => (b ? (a - b) / b : null);

  const blocks = [
    {
      type: 'header',
      text: { type: 'plain_text', text: `Redigerarläget – senaste ${metrics.periodDays} dagarna`, emoji: true },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Leveranser*\n${t.deliveries} st · ${arrow(rel(t.deliveries, prev.deliveries), false)}` },
        { type: 'mrkdwn', text: `*Median ledtid*\n${formatDuration(t.medianTurnaround, wd)} · ${arrow(rel(t.medianTurnaround, prev.medianTurnaround), true)}` },
        { type: 'mrkdwn', text: `*Revisionsgrad*\n${pct(t.revisionRate)} · mål ${pct(config.targets.revisionRate)}` },
        { type: 'mrkdwn', text: `*Levererat i tid*\n${pct(t.onTimeRate)} · mål ${pct(config.targets.onTimeRate)}` },
      ],
    },
    { type: 'divider' },
  ];

  // Per redigerare — en rad var, sorterad på output.
  const lines = metrics.editors.map(e => {
    const sev = revisionSeverity(e.stats.revisionRate, config.thresholds);
    const slow = e.stats.medianTurnaround != null && e.stats.medianTurnaround > config.targets.turnaroundHours * 60;
    const open = e.wip === 1 ? '1 öppen' : `${e.wip} öppna`;
    return `${ICON[sev] || ':white_circle:'} *${e.name}* — ${e.stats.deliveries} lev. · ledtid ${formatDuration(e.stats.medianTurnaround, wd)}${slow ? ' :turtle:' : ''} · rev. ${pct(e.stats.revisionRate)} · ${open}`;
  });

  if (lines.length) {
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Per redigerare*\n${lines.join('\n')}` },
    });
  }

  // Flaggor — det som faktiskt kräver handling.
  const top = metrics.flags.slice(0, opts.maxFlags ?? 8);
  if (top.length) {
    const flagLines = top.map(f => {
      const who = mention(f.editor, metrics, config);
      const what = f.url ? `<${f.url}|${f.title || 'namnlös'}>` : `*${f.title || f.task}*`;
      // Vad väntan kostar, när det går att veta. Det är den raden som gör
      // skillnad på "gammal" och "dyr".
      const stake = f.stake
        ? ` · :chart_with_upwards_trend: originalet drar ${kr(f.stake.perDay)}/dag, ROAS ${f.stake.roas.toFixed(1).replace('.', ',')}`
        : '';
      return `${ICON[f.severity] || ':white_circle:'} ${who} · ${what} — ${f.detail}, *${formatDuration(f.minutes, wd)}*${stake}`;
    });
    blocks.push({ type: 'divider' });
    blocks.push({
      type: 'section',
      text: { type: 'mrkdwn', text: `*Knuffa i den här ordningen (${metrics.flags.length} ligger)*\n${flagLines.join('\n')}` },
    });
    if (metrics.flags.length > top.length) {
      blocks.push({
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `…och ${metrics.flags.length - top.length} till i panelen.` }],
      });
    }
  } else {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: ':white_check_mark: *Inget som skräpar.* Allt rör sig.' } });
  }

  // Pengarna. Det här är den enda siffran folk läser frivilligt, så den ska
  // med varje dag — inte gömmas i en flik man måste klicka sig till.
  const money = payoutLines(opts.payout);
  if (money) {
    blocks.push({ type: 'divider' });
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: money } });
  }

  blocks.push({
    type: 'context',
    elements: [{
      type: 'mrkdwn',
      text: `Ledtider räknas i arbetstid (${wd.start}–${wd.end}, mån–fre, ${config.timezone}) — inte kalendertid.${opts.dashboardUrl ? ` <${opts.dashboardUrl}|Öppna panelen>` : ''}`,
    }],
  });

  return { text: `Redigerarläget – ${t.deliveries} leveranser, ${metrics.flags.length} att knuffa`, blocks };
}

const kr = x => `${Math.round(x).toLocaleString('sv-SE')} kr`;

/** Innevarande månad ur ett payout-underlag. */
export function currentMonth(payout) {
  if (!payout?.months?.length) return null;
  return payout.months.slice().sort().pop();
}

/**
 * "Så här mycket har du tjänat hittills i månaden" — en rad per person.
 * Returnerar null när det inte finns något Meta-underlag, så digesten ser
 * likadan ut som förut i stället för att visa nollor.
 */
function payoutLines(payout) {
  const month = currentMonth(payout);
  if (!month) return null;

  const rows = payout.editors
    .filter(e => !e.name.startsWith('Okänd'))
    .map(e => ({ name: e.name, payout: (e.byMonth[month] || {}).payout || 0 }))
    .filter(r => r.payout > 0)
    .sort((a, b) => b.payout - a.payout);
  if (!rows.length) return null;

  const total = rows.reduce((s, r) => s + r.payout, 0);
  const list = rows.map(r => `:moneybag: *${r.name}* — ${kr(r.payout)}`).join('\n');
  return `*Intjänat hittills i ${month}* (${(payout.rate * 100).toFixed(1).replace('.', ',')}% av adspenden)\n${list}\n_Totalt ${kr(total)}._`;
}

function mention(editorId, metrics, config) {
  // Saknad ansvarig är ett eget läge, inte ett namn. Utan det här skrevs det
  // ut som "*null*" i kanalen — vilket är precis de sakerna som behöver
  // uppmärksamhet mest, eftersom ingen känner sig träffad av dem.
  if (!editorId) return '_ingen ansvarig_';
  const ed = metrics.editors.find(e => e.id === editorId);
  if (ed?.slack && config.slack?.mentionOnFlags) return `<@${ed.slack}>`;
  return `*${ed?.name || editorId}*`;
}

/** Personlig knuff — en per redigerare som har något öppet att göra. */
export function buildNudges(metrics, config, opts = {}) {
  const wd = config.workday;
  const out = [];
  const month = currentMonth(opts.payout);

  for (const ed of metrics.editors) {
    const mine = metrics.flags.filter(f => f.editor === ed.id);
    if (!mine.length) continue;

    // Titeln länkas till Notion-sidan. Ett task-id att klistra in i en sökruta
    // är en uppgift till; en länk är ett klick.
    const items = mine.slice(0, 6).map(f => {
      const title = f.url ? `<${f.url}|${f.title || 'namnlös'}>` : (f.title || f.task);
      const stake = f.stake ? ` · originalet drar ${kr(f.stake.perDay)}/dag` : '';
      return `${ICON[f.severity] || ':white_circle:'} ${title}\n     ${f.detail} — ligger ${formatDuration(f.minutes, wd)}${stake}`;
    });

    const sev = revisionSeverity(ed.stats.revisionRate, config.thresholds);
    const coaching = [];
    if (sev === 'critical' || sev === 'warning') {
      coaching.push(`Din revisionsgrad är ${pct(ed.stats.revisionRate)} (mål ${pct(config.targets.revisionRate)}) — dvs. ${pct(ed.stats.revisionRate)} av dina tasks kommer tillbaka. Kolla briefen en extra gång innan du lämnar in.`);
    }
    if (ed.stats.medianPickup != null && ed.stats.medianPickup > config.targets.pickupHours * 60) {
      coaching.push(`Du tar i snitt ${formatDuration(ed.stats.medianPickup, wd)} innan du ens startar en task (mål ${config.targets.pickupHours}h).`);
    }

    // Egen intjäning sist: knuffen ska landa som "det här ligger, och så här
    // mycket har du tjänat" — inte bara som en lista över det man inte gjort.
    const mineMoney = month
      ? (opts.payout.editors.find(e => e.id === ed.id)?.byMonth || {})[month]
      : null;
    const moneyBlock = mineMoney?.payout > 0
      ? [{ type: 'context', elements: [{ type: 'mrkdwn',
          text: `:moneybag: Du har tjänat *${kr(mineMoney.payout)}* på dina annonser hittills i ${month}.` }] }]
      : [];

    const count = mine.length === 1 ? '1 sak' : `${mine.length} saker`;
    out.push({
      editor: ed.id,
      slack: ed.slack || null,
      message: {
        text: `Du har ${count} som ligger`,
        blocks: [
          { type: 'section', text: { type: 'mrkdwn', text: `Hej ${ed.name.split(' ')[0]} — *${count}* på ditt bord som står still:` } },
          { type: 'section', text: { type: 'mrkdwn', text: items.join('\n') } },
          ...(coaching.length ? [{ type: 'context', elements: [{ type: 'mrkdwn', text: coaching.join(' ') }] }] : []),
          ...moneyBlock,
        ],
      },
    });
  }

  return out;
}

/** Postar via webhook. Returnerar {ok, status, body}. */
export async function postWebhook(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  return { ok: res.ok && body.trim() === 'ok', status: res.status, body };
}

/** Postar via bot-token till kanal eller användare (DM öppnas automatiskt av Slack). */
export async function postApi(token, channel, payload) {
  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8', authorization: `Bearer ${token}` },
    body: JSON.stringify({ channel, ...payload }),
  });
  const body = await res.json();
  return { ok: body.ok === true, status: res.status, body };
}
