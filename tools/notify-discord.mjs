#!/usr/bin/env node
// Skickar nattkörningens brief till Axels Discord-kanal "mamma jobb".
// Noll beroenden.
//
//   node tools/notify-discord.mjs "✅ 2 launchade, allt rullar"
//   cat rapport.txt | node tools/notify-discord.mjs
//
// Auth (hemligheterna ligger i environmentet, ALDRIG i repot):
//   1. Bot-token — env DISCORD_BOT_TOKEN / DISCORD_TOKEN / DISCORD_ACCESS_TOKEN,
//      eller vilken env-variabel som helst vars NAMN innehåller DISCORD och vars
//      värde inte är en URL (så funkar det oavsett exakt vad Axel döpte den till).
//      Skickar via POST /api/v10/channels/<id>/messages. Botten kan dessutom
//      LÄSA kanalen, vilket en webhook aldrig kan — men den måste vara inbjuden
//      till servern och ha skrivrätt i kanalen.
//   2. Webhook — env DISCORD_WEBHOOK_URL (eller en DISCORD-variabel som är en
//      webhook-URL). Används bara om ingen bot-token finns.
//
// Kanal-id:t är inte en hemlighet: "mamma jobb" = 1543546469884362833
// (läst ur webhooken 2026-08-30). Kan pekas om med env DISCORD_CHANNEL_ID.

import { spawnSync } from 'node:child_process';
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const KANAL = process.env.DISCORD_CHANNEL_ID || '1543546469884362833';

function hittaAuth() {
  const env = process.env;
  for (const n of ['DISCORD_BOT_TOKEN', 'DISCORD_TOKEN', 'DISCORD_ACCESS_TOKEN']) {
    if (env[n]) return { typ: 'bot', token: env[n].replace(/^Bot\s+/i, '') };
  }
  const kandidater = Object.keys(env).filter(n => /DISCORD/i.test(n) && env[n]);
  for (const n of kandidater) {
    if (!/^https?:\/\//i.test(env[n])) return { typ: 'bot', token: env[n].replace(/^Bot\s+/i, '') };
  }
  const hook = env.DISCORD_WEBHOOK_URL
    || kandidater.map(n => env[n]).find(v => v.startsWith('https://discord.com/api/webhooks/'));
  if (hook) return { typ: 'webhook', url: hook };
  return null;
}

const auth = hittaAuth();
if (!auth) {
  console.error('Ingen Discord-auth i environmentet. Letade efter: DISCORD_BOT_TOKEN / DISCORD_TOKEN / DISCORD_ACCESS_TOKEN / *DISCORD* / DISCORD_WEBHOOK_URL.');
  process.exit(2);
}

let text = process.argv.slice(2).join(' ').trim();
if (!text) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  text = Buffer.concat(chunks).toString('utf8').trim();
}
if (!text) { console.error('Inget meddelande. Ge texten som argument eller på stdin.'); process.exit(2); }

// Discord tar max 2000 tecken per meddelande — dela på radgränser vid behov.
const parts = [];
let cur = '';
for (const line of text.split('\n')) {
  if ((cur + '\n' + line).length > 1900) { parts.push(cur); cur = line; }
  else cur = cur ? cur + '\n' + line : line;
}
if (cur) parts.push(cur);

const viaBot = auth.typ === 'bot';
const mål = viaBot ? `https://discord.com/api/v10/channels/${KANAL}/messages` : auth.url;
const huvuden = viaBot
  ? { 'Content-Type': 'application/json', Authorization: `Bot ${auth.token}` }
  : { 'Content-Type': 'application/json' };

for (const [i, content] of parts.entries()) {
  // username går bara att sätta på en webhook — botens namn styrs i Discord.
  const kropp = viaBot ? { content } : { content, username: 'Nattkörningen' };
  const r = await fetch(mål, { method: 'POST', headers: huvuden, body: JSON.stringify(kropp) });
  if (!r.ok) {
    console.error(`Discord svarade ${r.status} (${auth.typ}): ${(await r.text()).slice(0, 200)}`);
    if (viaBot && r.status === 401) console.error('401 = fel eller återkallad bot-token.');
    if (viaBot && r.status === 403) console.error('403 = botten är inte inbjuden till servern, eller saknar skrivrätt i kanalen.');
    if (viaBot && r.status === 404) console.error('404 = kanal-id:t finns inte, eller botten ser inte kanalen.');
    process.exit(1);
  }
  if (i < parts.length - 1) await new Promise(res => setTimeout(res, 600));
}
console.log(`Skickat till Discord via ${viaBot ? 'boten' : 'webhooken'} ` +
  `(${parts.length} meddelande${parts.length > 1 ? 'n' : ''}).`);
