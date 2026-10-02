// discord.mjs — posten till redigeraren, i en PRIVAT kanal per person.
//
// Varför privat: posten bär hennes hit rate och etiketter. Tvålagerstavlan
// (stonebite/evolve/SVAR.md svar 3): lagets tal på tavlan, individens i 1:1.
// En kanal per redigerare i Bäverbutikens server, synlig bara för henne,
// Axels två konton och boten. @everyone nekas VIEW_CHANNEL (1024).
//
// Boten måste ha "Manage Channels" i servern för att skapa kanalen. Saknas
// rätten (403) kastas felet uppåt: kor.mjs skriver posten till fil och säger
// det i rapporten — aldrig en post i en öppen kanal i stället.
//
// Noll beroenden. Samma 429-hantering som stonebite/kallor/discord.mjs.

import { delaText } from '../annonsvakt/regler.mjs';

const API = 'https://discord.com/api/v10';
const VIEW_CHANNEL = 1024n;
const SEND_MESSAGES = 2048n;
const READ_HISTORY = 65536n;

export async function api(stig, { env = process.env, fetchImpl = globalThis.fetch, metod = 'GET', kropp = null } = {}) {
  if (!env.DISCORD_BOT_TOKEN) throw new Error('DISCORD_BOT_TOKEN saknas i miljön');
  const r = await fetchImpl(`${API}${stig}`, {
    method: metod,
    headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}`, ...(kropp ? { 'Content-Type': 'application/json' } : {}) },
    ...(kropp ? { body: JSON.stringify(kropp) } : {}),
  });
  if (r.status === 429) {
    const vanta = Number((await r.json().catch(() => ({}))).retry_after ?? 1) * 1000;
    await new Promise((k) => setTimeout(k, Math.min(vanta, 10_000)));
    return api(stig, { env, fetchImpl, metod, kropp });
  }
  if (!r.ok) {
    const text = await r.text().catch(() => '');
    const fel = new Error(`Discord ${r.status} på ${stig}${text ? `: ${text.slice(0, 200)}` : ''}`);
    fel.status = r.status;
    throw fel;
  }
  if (r.status === 204) return null;
  return r.json();
}

/** Kanalnamnet per redigerare: ad-report-carl. Discord tar bara a–z, 0–9 och bindestreck. */
export function kanalnamn(prefix, fornamn) {
  return `${prefix}${String(fornamn).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

/** Rättigheterna: @everyone ser inget; redigeraren, Axel och boten ser och skriver. */
export function overwrites(guildId, medlemIds) {
  const allow = String(VIEW_CHANNEL | SEND_MESSAGES | READ_HISTORY);
  return [
    { id: String(guildId), type: 0, deny: String(VIEW_CHANNEL) },
    ...[...new Set(medlemIds.map(String))].map((id) => ({ id, type: 1, allow })),
  ];
}

/**
 * Hittar kanalen på namnet, annars skapar den privat. Rör aldrig rättigheterna
 * på en kanal som redan finns (den kan vara ändrad för hand).
 * Returnerar { id, namn, skapad: boolean }.
 */
export async function hittaEllerSkapaPrivatKanal(guildId, namn, { medlemIds = [], env = process.env, fetchImpl } = {}) {
  const kanaler = await api(`/guilds/${guildId}/channels`, { env, fetchImpl });
  const finns = (kanaler ?? []).find((k) => k.type === 0 && k.name === namn);
  if (finns) return { id: finns.id, namn, skapad: false };
  const jag = await api('/users/@me', { env, fetchImpl });
  const ny = await api(`/guilds/${guildId}/channels`, {
    env, fetchImpl, metod: 'POST',
    kropp: { name: namn, type: 0, topic: 'Your weekly ad report. Private: you, Axel and the bot.', permission_overwrites: overwrites(guildId, [...medlemIds, jag?.id].filter(Boolean)) },
  });
  return { id: ny.id, namn, skapad: true };
}

/**
 * Postar texten i delar under 1 900 tecken. `mentions` är de enda id:n som får
 * pingas (allowed_mentions låser bort @everyone och roller). Returnerar
 * meddelande-id:n som tillbakaläsning.
 */
export async function postaTillKanal(kanalId, text, { mentions = [], env = process.env, fetchImpl } = {}) {
  const idn = [];
  const delar = delaText(text, 1900);
  for (let i = 0; i < delar.length; i++) {
    const content = i === 0 && mentions.length ? `${mentions.map((m) => `<@${m}>`).join(' ')}\n${delar[i]}` : delar[i];
    const svar = await api(`/channels/${kanalId}/messages`, {
      env, fetchImpl, metod: 'POST',
      kropp: { content: content.slice(0, 1990), allowed_mentions: { parse: [], users: mentions.map(String).slice(0, 10) } },
    });
    idn.push(svar?.id ?? null);
  }
  return idn;
}
