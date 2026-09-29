// annonsvakt/posta.mjs — larmet ut: Discord (boten, kanalen skapas om den
// saknas) och Slack #urgent (nyckel i miljön, annars kön till connectorn).
//
// Discord: samma väg som kommentarsgranskningen — factory/discord.mjs hittar
// servern och kanalen, stonebite/kallor/discord.mjs postar med
// allowed_mentions låst till Axels id:n (ett citerat namn kan aldrig pinga
// en server). Texten delas på 1 900 tecken.
//
// Slack (Axels ord 2026-09-29: "du kan ju koppla Slack själv, eftersom att
// den redan är connectad här"): tre vägar, i ordning —
//   SLACK_BOT_TOKEN   i miljön ⇒ chat.postMessage till kanal.slack.kanalId
//   SLACK_WEBHOOK_URL i miljön ⇒ POST { text } till webhooken (låst till kanalen)
//   ingen nyckel      ⇒ texten läggs i annonsvakt/output/att-posta.json, och
//                        sessionen postar den med mcp__Slack__slack_send_message
//                        och kvitterar med `node annonsvakt/kor.mjs --postat <id>`
//                        (samma mönster som akut/). Mätt 2026-09-29: rutinens
//                        fasta session HAR inga Slack-verktyg (create_trigger
//                        avvisar `connectors` i organisationen), så i rutinen
//                        är det nyckeln som gäller; kön är för sessioner som
//                        har connectorn.
// Ett Slack-fel stoppar aldrig Discord — Discord är huvudkanalen och minnet.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname } from 'node:path';
import { delaText } from './regler.mjs';

export async function postaDiscord(text, { konfig, mentions = [], env = process.env } = {}) {
  if (!env.DISCORD_BOT_TOKEN) throw new Error('DISCORD_BOT_TOKEN saknas i miljön — larmet står bara i terminalen.');
  const { hamtaGuilds, hittaEllerSkapaKanal } = await import('../factory/discord.mjs');
  const { valjButiksServer } = await import('../tools/discord-rapport.mjs');
  const { skickaTillKanal } = await import('../stonebite/kallor/discord.mjs');
  const d = konfig?.kanal?.discord ?? {};
  const guilds = await hamtaGuilds();
  const server = (d.serverId && valjButiksServer(guilds, d.serverId)) || valjButiksServer(guilds, d.server);
  if (!server) throw new Error(`Boten sitter inte i servern "${d.server}" (${d.serverId ?? 'utan id'}). Den sitter i: ${guilds.map((g) => g.name).join(', ') || 'ingen'}.`);
  const kanal = await hittaEllerSkapaKanal(server.id, String(d.kanal ?? 'ad-alerts').replace(/^#/, ''));
  let forsta = null;
  for (const del of delaText(text)) {
    const m = await skickaTillKanal(kanal.id, del, { env, mentions });
    forsta ??= m;
  }
  return { server: server.name, serverId: server.id, kanal: kanal.name, kanalId: kanal.id, skapad: kanal.skapad, meddelandeId: forsta?.id ?? null, lank: forsta?.id ? `https://discord.com/channels/${server.id}/${kanal.id}/${forsta.id}` : null };
}

// ----------------------------------------------------------------- Slack

const slackKonfig = (konfig) => konfig?.kanal?.slack ?? {};
export const botTokenEnv = (konfig) => slackKonfig(konfig).bot_token_env ?? 'SLACK_BOT_TOKEN';
export const webhookEnv = (konfig) => slackKonfig(konfig).webhook_env ?? 'SLACK_WEBHOOK_URL';

/** Vilken Slack-väg miljön ger: 'bot', 'webhook' eller null (⇒ kön till connectorn). */
export function slackVag(env = process.env, konfig = {}) {
  if (env[botTokenEnv(konfig)]) return 'bot';
  if (env[webhookEnv(konfig)]) return 'webhook';
  return null;
}

/** Postar ETT Slack-meddelande ({ text, mrkdwn }) med nyckeln i miljön. Svarar { ok, vag, ts } eller kastar med orsaken. */
export async function postaSlack(meddelande, { env = process.env, konfig = {}, fetchFn = fetch } = {}) {
  const s = slackKonfig(konfig);
  const vag = slackVag(env, konfig);
  const text = meddelande?.mrkdwn ?? meddelande?.text ?? String(meddelande ?? '');
  if (vag === 'bot') {
    if (!s.kanalId) throw new Error('annonsvakt/konfig.json saknar kanal.slack.kanalId');
    const r = await fetchFn('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env[botTokenEnv(konfig)]}`, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ channel: s.kanalId, text, unfurl_links: false, unfurl_media: false }),
      signal: AbortSignal.timeout(30_000),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(`Slack svarade ${j.error ?? r.status}${j.error === 'not_in_channel' ? ` — bjud in appen i #${s.kanal ?? 'urgent'} (/invite @appen)` : ''}`);
    return { ok: true, vag, ts: j.ts ?? null };
  }
  if (vag === 'webhook') {
    const r = await fetchFn(env[webhookEnv(konfig)], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), signal: AbortSignal.timeout(30_000) });
    if (!r.ok) throw new Error(`Slack-webhooken svarade ${r.status}: ${String(await r.text().catch(() => '')).slice(0, 200)}`);
    return { ok: true, vag, ts: null };
  }
  throw new Error(`ingen Slack-nyckel i miljön (${botTokenEnv(konfig)} / ${webhookEnv(konfig)})`);
}

// ----------------------------------------------------------------- kön till connectorn

/** Kön: { kanalId, kanal, meddelanden: [{ id, tid, text, mrkdwn }] }. Rader äldre än ttlTimmar faller bort — ett larm som ingen postat på ett dygn är gammalt; Discord har det. */
export function lasKo(fil, { nu = new Date(), ttlTimmar = 24 } = {}) {
  const tom = { kanalId: null, kanal: null, meddelanden: [] };
  if (!existsSync(fil)) return tom;
  try {
    const d = JSON.parse(readFileSync(fil, 'utf8'));
    const meddelanden = (Array.isArray(d.meddelanden) ? d.meddelanden : []).filter((m) => nu.getTime() - Date.parse(m.tid ?? 0) <= ttlTimmar * 3_600_000);
    return { kanalId: d.kanalId ?? null, kanal: d.kanal ?? null, meddelanden };
  } catch {
    return tom;
  }
}

/** Skriver kön; tom kö ⇒ filen tas bort så en gammal kö aldrig postas igen. */
export function skrivKo(fil, ko, { nu = new Date() } = {}) {
  if (!ko.meddelanden?.length) { if (existsSync(fil)) rmSync(fil); return null; }
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, `${JSON.stringify({ skapad: nu.toISOString(), kanalId: ko.kanalId ?? null, kanal: ko.kanal ?? null, meddelanden: ko.meddelanden }, null, 1)}\n`);
  return fil;
}

/** Lägger körningens Slack-text i kön. Id:t är minuten (sYYYYMMDDHHMM), unikt per körning. */
export function laggIKo(fil, meddelande, { konfig = {}, nu = new Date() } = {}) {
  const s = slackKonfig(konfig);
  const ko = lasKo(fil, { nu });
  const id = `s${nu.toISOString().replace(/\D/g, '').slice(0, 12)}`;
  ko.meddelanden = ko.meddelanden.filter((m) => m.id !== id);
  ko.meddelanden.push({ id, tid: nu.toISOString(), text: meddelande.text, mrkdwn: meddelande.mrkdwn });
  skrivKo(fil, { kanalId: s.kanalId ?? ko.kanalId ?? null, kanal: s.kanal ?? ko.kanal ?? null, meddelanden: ko.meddelanden }, { nu });
  return { id, kvar: ko.meddelanden.length, fil };
}

/** --postat: ta bort kvitterade meddelanden ur kön ('alla' tömmer den). */
export function kvittera(fil, ids = [], { nu = new Date() } = {}) {
  const ko = lasKo(fil, { nu, ttlTimmar: Infinity });
  const alla = ids.includes('alla');
  const kvitterade = ko.meddelanden.filter((m) => alla || ids.includes(m.id)).map((m) => m.id);
  const kvar = ko.meddelanden.filter((m) => !kvitterade.includes(m.id));
  skrivKo(fil, { ...ko, meddelanden: kvar }, { nu });
  return { kvitterade, kvar: kvar.length };
}
