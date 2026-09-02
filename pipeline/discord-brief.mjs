#!/usr/bin/env node
// discord-brief.mjs — NO-rutinens meddelanden till Discord. Noll beroenden.
//
//   node pipeline/discord-brief.mjs "text"              → #translation-till-norge-av-nya-produkter
//   node pipeline/discord-brief.mjs --problem "text"    → #problems-no
//   echo "text" | node pipeline/discord-brief.mjs       (texten kan komma på stdin)
//
// Flaggor:
//   --problem          skicka till problemkanalen i stället för briefkanalen
//   --kanal=<namn|id>  valfri annan kanal (namn slås upp i servern via boten)
//   --utan-ping        skicka utan att pinga personerna
//   --torr             visa mål + text, skicka ingenting
//
// Kanaler och personer som pingas står i market-expansion/no/discord.json
// (Axels beslut 2026-09-02: Axel + ECOM CHADKING pingas i BÅDA kanalerna).
//
// Auth (hemligheter ligger i environmentet, aldrig i repot):
//   1. Bot-token — DISCORD_BOT_TOKEN / DISCORD_TOKEN / DISCORD_ACCESS_TOKEN.
//      Skickar till exakt den kanal som valts (POST /channels/<id>/messages).
//   2. Webhook — DISCORD_WEBHOOK_URL, bara om ingen bot-token finns. En webhook
//      sitter fast i SIN kanal, så meddelandet hamnar där webhooken pekar, inte
//      i den valda kanalen. Det varnas högt på stderr när det händer.
//
// Max 2000 tecken per meddelande — längre text delas på radgränser.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const HÄR = dirname(fileURLToPath(import.meta.url));
const KONFIG = JSON.parse(readFileSync(join(HÄR, '..', 'market-expansion', 'no', 'discord.json'), 'utf8'));

// ---- argument ---------------------------------------------------------------
const flaggor = { problem: false, utanPing: false, torr: false, kanal: null };
const textdelar = [];
for (const a of process.argv.slice(2)) {
  if (a === '--problem') flaggor.problem = true;
  else if (a === '--utan-ping') flaggor.utanPing = true;
  else if (a === '--torr' || a === '--dry') flaggor.torr = true;
  else if (a.startsWith('--kanal=')) flaggor.kanal = a.slice('--kanal='.length);
  else textdelar.push(a);
}

let text = textdelar.join(' ').trim();
if (!text) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  text = Buffer.concat(chunks).toString('utf8').trim();
}
if (!text) { console.error('Ingen text att skicka.'); process.exit(2); }

// ---- kanal ------------------------------------------------------------------
const vald = flaggor.problem ? KONFIG.kanaler.problem : KONFIG.kanaler.brief;
let kanal = { namn: vald.namn, id: vald.id };
if (flaggor.kanal) kanal = /^\d+$/.test(flaggor.kanal)
  ? { namn: flaggor.kanal, id: flaggor.kanal }
  : { namn: flaggor.kanal.replace(/^#/, ''), id: null };

// ---- pingar -----------------------------------------------------------------
const pingIds = flaggor.utanPing ? [] : KONFIG.pinga.map(p => p.id);
const pingrad = pingIds.map(id => `<@${id}>`).join(' ');
const innehåll = pingrad ? `${pingrad}\n${text}` : text;

// ---- auth -------------------------------------------------------------------
function hittaAuth() {
  const env = process.env;
  for (const n of ['DISCORD_BOT_TOKEN', 'DISCORD_TOKEN', 'DISCORD_ACCESS_TOKEN']) {
    if (env[n]) return { typ: 'bot', token: env[n].replace(/^Bot\s+/i, '') };
  }
  if (env.DISCORD_WEBHOOK_URL) return { typ: 'webhook', url: env.DISCORD_WEBHOOK_URL };
  return null;
}

async function slåUppKanal(token, namn) {
  const r = await fetch(`https://discord.com/api/v10/guilds/${KONFIG.guild}/channels`, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!r.ok) throw new Error(`kunde inte lista kanaler (${r.status})`);
  const träff = (await r.json()).find(k => k.type === 0 && k.name === namn);
  if (!träff) throw new Error(`hittade ingen kanal "#${namn}" i servern`);
  return träff.id;
}

// ---- dela upp ---------------------------------------------------------------
const delar = [];
let cur = '';
for (const rad of innehåll.split('\n')) {
  if ((cur + '\n' + rad).length > 1900) { delar.push(cur); cur = rad; }
  else cur = cur ? cur + '\n' + rad : rad;
}
if (cur) delar.push(cur);

// ---- skicka -----------------------------------------------------------------
const auth = hittaAuth();
if (flaggor.torr) {
  console.log(`[torr] mål: #${kanal.namn} (${kanal.id ?? 'id slås upp'}) via ${auth?.typ ?? 'INGEN AUTH'}`);
  console.log(`[torr] pingar: ${pingIds.length ? KONFIG.pinga.map(p => p.namn).join(', ') : 'inga'}`);
  console.log(`[torr] ${delar.length} meddelande${delar.length > 1 ? 'n' : ''}:\n`);
  console.log(innehåll);
  process.exit(0);
}
if (!auth) {
  console.error('Ingen Discord-auth i environmentet (DISCORD_BOT_TOKEN eller DISCORD_WEBHOOK_URL).');
  process.exit(2);
}

let mål, huvuden;
if (auth.typ === 'bot') {
  if (!kanal.id) kanal.id = await slåUppKanal(auth.token, kanal.namn);
  mål = `https://discord.com/api/v10/channels/${kanal.id}/messages`;
  huvuden = { 'content-type': 'application/json', Authorization: `Bot ${auth.token}` };
} else {
  console.error(`⚠️ Ingen bot-token — skickar via webhooken, som hamnar i webhookens egen kanal, inte i #${kanal.namn}.`);
  mål = auth.url;
  huvuden = { 'content-type': 'application/json' };
}

for (const [i, content] of delar.entries()) {
  const kropp = { content, allowed_mentions: { users: pingIds } };
  const res = await fetch(mål, { method: 'POST', headers: huvuden, body: JSON.stringify(kropp) });
  if (!res.ok) {
    console.error(`Discord svarade ${res.status} (${auth.typ}): ${(await res.text()).slice(0, 200)}`);
    if (res.status === 403) console.error('403 = boten saknar skrivrätt i kanalen, eller är inte inbjuden.');
    if (res.status === 404) console.error('404 = kanal-id:t finns inte, eller boten ser inte kanalen.');
    process.exit(1);
  }
  if (i < delar.length - 1) await new Promise(r => setTimeout(r, 600));
}
console.log(`✓ skickat till #${kanal.namn} via ${auth.typ} (${delar.length} meddelande${delar.length > 1 ? 'n' : ''}${pingIds.length ? ', med ping' : ''})`);
