#!/usr/bin/env node
// discord-brief.mjs — postar rutinens dagliga brief till Axels Discord-kanal.
//   node discord-brief.mjs "text"        eller:  echo "text" | node discord-brief.mjs
// Webhooken kan overridas med env DISCORD_WEBHOOK_URL. Max 2000 tecken per
// meddelande — längre text delas på styckegränser.

const URL_ = process.env.DISCORD_WEBHOOK_URL ||
  'https://discord.com/api/webhooks/1543545482352140288/aGRC9XarKi_WQwUexBwWvOIWGVb3QkKjVag5duhDlFKS94vJDtP-2LJWF9nTiWfqIfNb';

let text = process.argv[2];
if (!text) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  text = Buffer.concat(chunks).toString('utf8').trim();
}
if (!text) { console.error('Ingen text att skicka.'); process.exit(1); }

const parts = [];
let cur = '';
for (const st of text.split('\n')) {
  if ((cur + '\n' + st).length > 1900) { parts.push(cur); cur = st; }
  else cur = cur ? cur + '\n' + st : st;
}
if (cur) parts.push(cur);

for (const p of parts) {
  const res = await fetch(URL_, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content: p }),
  });
  if (!res.ok) { console.error('Discord-fel:', res.status, await res.text()); process.exit(1); }
}
console.log(`✓ brief skickad (${parts.length} meddelande${parts.length > 1 ? 'n' : ''})`);
