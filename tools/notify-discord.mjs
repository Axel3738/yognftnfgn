#!/usr/bin/env node
// Skickar nattkörningens brief till Axels Discord-kanal via webhook.
// Noll beroenden.
//
//   node tools/notify-discord.mjs "✅ 2 launchade, allt rullar"
//   cat rapport.txt | node tools/notify-discord.mjs
//
// Webhook-adressen är en hemlighet och ligger därför INTE i repot — den
// läses ur env DISCORD_WEBHOOK_URL (sätts i Claude-environmentet, precis
// som JUDGEME_API_TOKEN och Shopify-nycklarna).

import { spawnSync } from 'node:child_process';
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const URL = process.env.DISCORD_WEBHOOK_URL;
if (!URL) { console.error('Saknar env DISCORD_WEBHOOK_URL — briefen kan inte skickas.'); process.exit(2); }

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

for (const [i, content] of parts.entries()) {
  const r = await fetch(URL, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, username: 'Nattkörningen' }),
  });
  if (!r.ok) {
    console.error(`Discord svarade ${r.status}: ${(await r.text()).slice(0, 200)}`);
    process.exit(1);
  }
  if (i < parts.length - 1) await new Promise(res => setTimeout(res, 600));
}
console.log(`Skickat till Discord (${parts.length} meddelande${parts.length > 1 ? 'n' : ''}).`);
