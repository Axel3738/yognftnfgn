#!/usr/bin/env node
// Läser nya meddelanden i en Discord-kanal sedan förra körningen.
// Motsvarigheten till tools/notify-discord.mjs, fast åt andra hållet.
// Noll beroenden.
//
//   node tools/discord-read.mjs                    # nya meddelanden sedan sist
//   node tools/discord-read.mjs --grep "Norge"     # bara de som matchar
//   node tools/discord-read.mjs --peek             # läs utan att flytta läsmärket
//   node tools/discord-read.mjs --sedan <meddelande-id>
//
// Det finns inget som lyssnar dygnet runt — sessionen lever bara medan den kör.
// Därför FRÅGAR vi i stället: en rutin kör det här skriptet med jämna mellanrum
// och agerar på det som kommit sedan förra läsmärket.
//
// Kräver env: DISCORD_BOT_TOKEN (botten måste vara med i servern och ha
// behörigheten "Read Message History" i kanalen) och DISCORD_CHANNEL_ID.
// Webhooken i DISCORD_WEBHOOK_URL kan bara SKICKA — den kan inte läsa.

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const KANAL = process.env.DISCORD_CHANNEL_ID;
if (!TOKEN || !KANAL) {
  console.error('Saknar env DISCORD_BOT_TOKEN och/eller DISCORD_CHANNEL_ID.');
  console.error('Webhooken (DISCORD_WEBHOOK_URL) kan bara skicka, inte läsa — en bot krävs.');
  process.exit(2);
}

const args = process.argv.slice(2);
const flagga = (n) => (args.indexOf(n) < 0 ? null : args[args.indexOf(n) + 1]);
const peek = args.includes('--peek');
const grep = flagga('--grep');
const MÄRKE = `tools/state/discord-last-${KANAL}.json`;

function läsMärke() {
  try { return JSON.parse(readFileSync(MÄRKE, 'utf8')).sista_id ?? null; }
  catch { return null; }
}

const sedan = flagga('--sedan') ?? läsMärke();

// Discord ger nyast först. Utan "after" hämtar vi bara de senaste 50 och
// sätter läsmärket — första körningen ska inte svälla över hela historiken.
const url = new URL(`https://discord.com/api/v10/channels/${KANAL}/messages`);
url.searchParams.set('limit', sedan ? '100' : '50');
if (sedan) url.searchParams.set('after', sedan);

const svar = await fetch(url, { headers: { Authorization: `Bot ${TOKEN}` } });
if (!svar.ok) {
  const text = (await svar.text()).slice(0, 300);
  console.error(`Discord svarade ${svar.status}: ${text}`);
  if (svar.status === 401) console.error('401 = fel eller återkallad bot-token.');
  if (svar.status === 403) console.error('403 = botten saknar åtkomst till kanalen.');
  process.exit(1);
}

const alla = (await svar.json()).reverse();          // äldst först
const träffar = grep ? alla.filter((m) => m.content?.toLowerCase().includes(grep.toLowerCase())) : alla;

for (const m of träffar) {
  const när = new Date(m.timestamp).toISOString().replace('T', ' ').slice(0, 16);
  console.log(`--- ${m.id} | ${när} | ${m.author?.username ?? 'okänd'} ---`);
  console.log(m.content?.trim() || '(inget textinnehåll)');
  for (const e of m.embeds ?? []) {
    if (e.title) console.log(`  [embed] ${e.title}`);
    if (e.description) console.log(`  ${e.description.trim()}`);
  }
  console.log();
}

console.error(`${träffar.length} meddelande${träffar.length === 1 ? '' : 'n'}` +
  `${grep ? ` som matchar "${grep}"` : ''} av ${alla.length} nya` +
  `${sedan ? ` sedan ${sedan}` : ' (första körningen)'}.`);

if (alla.length && !peek) {
  mkdirSync(dirname(MÄRKE), { recursive: true });
  writeFileSync(MÄRKE, JSON.stringify({
    kanal: KANAL, sista_id: alla[alla.length - 1].id, uppdaterad: new Date().toISOString(),
  }, null, 2) + '\n');
  console.error(`Läsmärket flyttat till ${alla[alla.length - 1].id}.`);
}
