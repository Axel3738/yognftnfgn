#!/usr/bin/env node
// Skickar nattkörningens brief till Axels Discord-kanal via webhook.
// Noll beroenden.
//
//   node tools/notify-discord.mjs "✅ 2 launchade, allt rullar"
//   cat rapport.txt | node tools/notify-discord.mjs
//
// Två sätt att skicka, i den här ordningen:
//   1. DISCORD_BOT_TOKEN + DISCORD_CHANNEL_ID  (botten postar i kanalen)
//   2. DISCORD_WEBHOOK_URL                     (webhook, ingen bot behövs)
// Båda är hemligheter och ligger därför INTE i repot — de sätts i
// Claude-environmentet, precis som JUDGEME_API_TOKEN och Shopify-nycklarna.

import { spawnSync } from 'node:child_process';
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const WEBHOOK = process.env.DISCORD_WEBHOOK_URL;
const BOT = process.env.DISCORD_BOT_TOKEN;
const KANAL = process.env.DISCORD_CHANNEL_ID;
const viaBot = Boolean(BOT && KANAL);
if (!viaBot && !WEBHOOK) {
  console.error('Kan inte skicka: sätt antingen DISCORD_BOT_TOKEN + DISCORD_CHANNEL_ID, eller DISCORD_WEBHOOK_URL.');
  if (BOT && !KANAL) console.error('DISCORD_BOT_TOKEN finns men DISCORD_CHANNEL_ID saknas — botten vet inte vilken kanal.');
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

// Boten postar i kanalen; webhooken postar på sin egen adress. Botten kan
// dessutom LÄSA kanalen, vilket en webhook aldrig kan — men den behöver vara
// inbjuden till servern och ha skrivrättighet i just den kanalen.
const mål = viaBot
  ? `https://discord.com/api/v10/channels/${KANAL}/messages`
  : WEBHOOK;
const huvuden = viaBot
  ? { 'Content-Type': 'application/json', Authorization: `Bot ${BOT}` }
  : { 'Content-Type': 'application/json' };

for (const [i, content] of parts.entries()) {
  // username går bara att sätta på en webhook — botens namn styrs i Discord.
  const kropp = viaBot ? { content } : { content, username: 'Nattkörningen' };
  const r = await fetch(mål, { method: 'POST', headers: huvuden, body: JSON.stringify(kropp) });
  if (!r.ok) {
    console.error(`Discord svarade ${r.status}: ${(await r.text()).slice(0, 200)}`);
    if (viaBot && r.status === 401) console.error('401 = fel eller återkallad bot-token.');
    if (viaBot && r.status === 403) console.error('403 = botten är inte inbjuden till servern, eller saknar skrivrätt i kanalen.');
    if (viaBot && r.status === 404) console.error('404 = kanal-id:t finns inte, eller botten ser inte kanalen.');
    process.exit(1);
  }
  if (i < parts.length - 1) await new Promise(res => setTimeout(res, 600));
}
console.log(`Skickat till Discord via ${viaBot ? 'boten' : 'webhooken'} ` +
  `(${parts.length} meddelande${parts.length > 1 ? 'n' : ''}).`);
