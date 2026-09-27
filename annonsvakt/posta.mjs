// annonsvakt/posta.mjs — larmet ut: Discord (boten, kanalen skapas om den
// saknas) och Slack (incoming webhook, bara om variabeln finns).
//
// Discord: samma väg som kommentarsgranskningen — factory/discord.mjs hittar
// servern och kanalen, stonebite/kallor/discord.mjs postar med
// allowed_mentions låst till Axels id:n (ett citerat namn kan aldrig pinga
// en server). Texten delas på 1 900 tecken.
//
// Slack: POST { text } till webhooken. Discords <@id>-pingar och **fetstil**
// byts mot Slacks form. Slack-fel stoppar aldrig Discord — Discord är
// huvudkanalen tills Axel byggt Slack-kanalen (2026-09-27).

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

/** Discord-markdown → Slack: pingarna bort (Slack har andra id:n), **x** → *x*. */
export function slackText(text) {
  return String(text ?? '').replace(/<@\d+>\s*/g, '').replace(/\*\*(.+?)\*\*/g, '*$1*').replace(/\n{3,}/g, '\n\n').trim();
}

export async function postaSlack(text, { url, fetchFn = fetch } = {}) {
  if (!url) throw new Error('ingen Slack-webhook');
  const r = await fetchFn(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: slackText(text) }), signal: AbortSignal.timeout(30_000) });
  if (!r.ok) throw new Error(`Slack svarade ${r.status}: ${String(await r.text().catch(() => '')).slice(0, 200)}`);
  return { ok: true };
}
