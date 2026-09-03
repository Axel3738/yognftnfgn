#!/usr/bin/env node
// Skickar nattkörningens brief till Axels Discord-kanal "mamma jobb".
// Noll beroenden.
//
//   node tools/notify-discord.mjs "✅ 2 launchade, allt rullar"
//   cat rapport.txt | node tools/notify-discord.mjs
//   node tools/notify-discord.mjs --ping "Missing files for Badshorts: ..."
//   node tools/notify-discord.mjs --ping-axel "Kunde inte flytta: Badshorts, Luffarschack"
//
// --ping-axel (Axels beslut 2026-09-02): mappar i Products som redan har
// kampanj men inte gått att flytta till LAUNCHED pingas till Axels båda
// konton, confident_otter_25993 och ecom_chadking.
//
// --ping (Axels beslut 2026-09-02): redigerarnotiser går via Discord och ska
// @-pinga redigerarna. Flaggan sätter <@id> för carlvicente.working och
// jazzer1522 först i meddelandet. Id:n slås upp på användarnamnet via boten
// (members/search) med de kända id:na som reserv — ren text "@namn" pingar
// aldrig i Discord, det måste vara <@id>.
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
// Kanal (Axels beslut 2026-08-30): briefen går till #new-products-coing-out
// (stavningen med "coing" är kanalens faktiska namn). Boten slår upp kanal-id:t
// på namnet i servern (guild 1540322130388983921, läst ur webhooken — inte en
// hemlighet). Overrides: env DISCORD_CHANNEL_ID (id) eller DISCORD_CHANNEL_NAME.
// Hittas inte kanalen används "mamma jobb" = 1543546469884362833 som reserv.

import { spawnSync } from 'node:child_process';
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const GUILD = '1540322130388983921';
const KANALNAMN = (process.env.DISCORD_CHANNEL_NAME || 'new-products-coing-out').replace(/^#/, '');
const RESERVKANAL = '1543546469884362833'; // "mamma jobb"

// Redigerarna som pingas med --ping. Id:n verifierade via members/search 2026-09-02.
const REDIGERARE = [
  { namn: 'carlvicente.working', id: '1411720622484095089' },
  { namn: 'jazzer1522', id: '740814777374343259' },
];
// Axels två konton, pingas med --ping-axel (mappar som inte gått att flytta).
// Id:n verifierade via members/search 2026-09-02.
const AXEL = [
  { namn: 'confident_otter_25993', id: '1469423029783236689' },
  { namn: 'ecom_chadking', id: '1543537450335477836' },
];

async function pingRad(token, personer) {
  const idn = [];
  for (const r of personer) {
    let id = r.id;
    if (token) {
      try {
        const res = await fetch(
          `https://discord.com/api/v10/guilds/${GUILD}/members/search?query=${encodeURIComponent(r.namn)}&limit=5`,
          { headers: { Authorization: `Bot ${token}` } },
        );
        if (res.ok) {
          const träff = (await res.json()).find(m => m.user?.username === r.namn);
          if (träff) id = träff.user.id;
        }
      } catch { /* reserv-id:t används */ }
    }
    idn.push(`<@${id}>`);
  }
  return idn.join(' ');
}

async function hittaKanal(token) {
  // Ett uttryckligt kanalnamn vinner över ett fast id. Miljön hade
  // DISCORD_CHANNEL_ID satt globalt, så varje `DISCORD_CHANNEL_NAME=ads-launching`
  // gick tyst till fel kanal hela 2026-09-02 — Axel såg en tom kanal.
  if (process.env.DISCORD_CHANNEL_ID && !process.env.DISCORD_CHANNEL_NAME) {
    return process.env.DISCORD_CHANNEL_ID;
  }
  try {
    const r = await fetch(`https://discord.com/api/v10/guilds/${GUILD}/channels`, {
      headers: { Authorization: `Bot ${token}` },
    });
    if (r.ok) {
      const kanaler = (await r.json()).filter(k => k.type === 0);
      const träff = kanaler.find(k => k.name === KANALNAMN)
        || kanaler.find(k => k.name.startsWith('new-products'));
      if (träff) return träff.id;
      console.error(`Hittade ingen kanal "${KANALNAMN}" i servern — skickar till reservkanalen.`);
    } else {
      console.error(`Kunde inte lista kanaler (${r.status}) — skickar till reservkanalen.`);
    }
  } catch (e) {
    console.error(`Kanaluppslag misslyckades (${e.message}) — skickar till reservkanalen.`);
  }
  return RESERVKANAL;
}

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

const argv = process.argv.slice(2);
const ping = argv.includes('--ping');
const pingAxel = argv.includes('--ping-axel');
let text = argv.filter(a => a !== '--ping' && a !== '--ping-axel').join(' ').trim();
if (!text) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  text = Buffer.concat(chunks).toString('utf8').trim();
}
if (!text) { console.error('Inget meddelande. Ge texten som argument eller på stdin.'); process.exit(2); }
const bot = auth.typ === 'bot' ? auth.token : null;
const pingar = [];
if (ping) pingar.push(await pingRad(bot, REDIGERARE));
if (pingAxel) pingar.push(await pingRad(bot, AXEL));
if (pingar.length) text = `${pingar.join(' ')}\n${text}`;

// Discord tar max 2000 tecken per meddelande — dela på radgränser vid behov.
const parts = [];
let cur = '';
for (const line of text.split('\n')) {
  if ((cur + '\n' + line).length > 1900) { parts.push(cur); cur = line; }
  else cur = cur ? cur + '\n' + line : line;
}
if (cur) parts.push(cur);

const viaBot = auth.typ === 'bot';
const KANAL = viaBot ? await hittaKanal(auth.token) : null;
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
