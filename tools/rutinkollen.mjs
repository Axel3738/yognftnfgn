#!/usr/bin/env node
// rutinkollen.mjs — morgonsammanfattningen av alla nattens rutiner.
// Noll beroenden. Läser rutinernas egna Discord-briefer via boten och skickar
// EN rapport till Axels kanal "mamma jobb", i hans läsformat.
//
//   node tools/rutinkollen.mjs           # läs, sammanfatta, skicka
//   node tools/rutinkollen.mjs --torr    # visa rapporten, skicka ingenting
//   node tools/rutinkollen.mjs --timmar=36
//   node tools/rutinkollen.mjs --kanal=<id>
//
// Varför den finns (Axels önskan 2026-09-06): rutinerna skickar var sin brief
// i var sin kanal, dygnet runt. Axel ska inte behöva läsa dem. Grön rapport =
// läs ingenting mer. Verktyget larmar också när en daglig rutin INTE hörde av
// sig — tystnad är annars osynlig — och visar credit-saldona (HeyGen + Kie)
// med förändring sedan gårdagens rapport, så credit-åtgången går att se utan
// att öppna något annat.
//
// Kräver DISCORD_BOT_TOKEN (webhook räcker inte — den kan inte LÄSA kanaler).
// HEYGEN_API_KEY / KIE_API_KEY är valfria; saknas de hoppas saldoraden över.
// Botten behöver "Read Message History" i kanalerna nedan.

import { spawnSync } from 'node:child_process';
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
  });
  process.exit(r.status ?? 1);
}

const GUILD = '1540322130388983921';
// Rapportens mål: #dagens-checkin. Kanalen "mamma jobb" finns inte längre —
// id:t 1543546469884362833 heter numera new-products-coing-out (läst ur
// servern 2026-09-06), så gamla reserver som pekar dit hamnar i nattkörningens
// brus. Övergripande via env RUTINKOLLEN_KANAL eller --kanal.
const DAGENS_CHECKIN = '1543769100583706874';

// Rutinerna och var de rapporterar. Id:n lästa ur servern 2026-09-06;
// namnen slås upp på nytt varje körning som reserv om ett id skulle dö.
// `dagligen: true` = tystnad är ett larm. `minst` = antal briefer som väntas
// per dygn (translate-no och /oversatt delar kanal, därför 2 där).
const RUTINER = [
  { namn: 'Nattkörningen',       kanal: 'new-products-coing-out',  id: '1543546469884362833', dagligen: false, minst: 1 },
  { namn: 'Bildannonserna',      kanal: 'ai-image-ads',            id: '1543736579762290688', dagligen: true,  minst: 1 },
  { namn: 'Leveransrundan',      kanal: 'ads-launching',           id: '1544579646849286244', dagligen: true,  minst: 1 },
  { namn: 'Norska recensioner',  kanal: 'reviews',                 id: '1544586846787477504', dagligen: true,  minst: 1 },
  { namn: 'Norge-översättning',  kanal: 'translation-till-norge-av-nya-produkter', id: '1543546518785495151', dagligen: true, minst: 2 },
];
// Problemkanalerna: allt som dykt upp här under fönstret lyfts upp i rapporten.
const PROBLEMKANALER = [
  { namn: 'problems-no',               id: '1544567111475535892' },
  { namn: 'problem-and-revisions-ads', id: '1544579266044493884' },
];

// ---- argument ---------------------------------------------------------------
const flaggor = { torr: false, timmar: 25, kanal: null };
for (const a of process.argv.slice(2)) {
  if (a === '--torr' || a === '--dry') flaggor.torr = true;
  else if (a.startsWith('--timmar=')) flaggor.timmar = Number(a.slice('--timmar='.length)) || 25;
  else if (a.startsWith('--kanal=')) flaggor.kanal = a.slice('--kanal='.length);
}

// ---- auth -------------------------------------------------------------------
function hittaToken() {
  const env = process.env;
  for (const n of ['DISCORD_BOT_TOKEN', 'DISCORD_TOKEN', 'DISCORD_ACCESS_TOKEN']) {
    if (env[n]) return env[n].replace(/^Bot\s+/i, '');
  }
  for (const n of Object.keys(env)) {
    if (/DISCORD/i.test(n) && env[n] && !/^https?:\/\//i.test(env[n])) {
      return env[n].replace(/^Bot\s+/i, '');
    }
  }
  return null;
}
const TOKEN = hittaToken();
if (!TOKEN) {
  console.error('Ingen bot-token (DISCORD_BOT_TOKEN). En webhook kan inte läsa kanaler — avbryter.');
  process.exit(2);
}
const HUVUDEN = { Authorization: `Bot ${TOKEN}` };

async function api(path) {
  const r = await fetch(`https://discord.com/api/v10${path}`, { headers: HUVUDEN });
  if (!r.ok) throw new Error(`${r.status} på ${path}`);
  return r.json();
}

// ---- kanaluppslag -----------------------------------------------------------
let kanallista = null;
async function kanalId(post) {
  if (post.id) return post.id;
  if (!kanallista) {
    kanallista = (await api(`/guilds/${GUILD}/channels`)).filter(k => k.type === 0);
  }
  const namn = (post.kanal || post.namn).replace(/^#/, '');
  const träff = kanallista.find(k => k.name === namn);
  return träff ? träff.id : null;
}

// ---- meddelanden ------------------------------------------------------------
const sedan = Date.now() - flaggor.timmar * 3600 * 1000;
async function botMeddelanden(id) {
  // Bara bot-/webhook-författade meddelanden räknas som rutinrapporter —
  // Axels egna inlägg i kanalerna är inte en körning.
  const alla = await api(`/channels/${id}/messages?limit=100`);
  return alla
    .filter(m => m.author?.bot && new Date(m.timestamp).getTime() >= sedan)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

const STATUSTECKEN = /✅|⚠️|❌|🚨/u; // hela emojin, aldrig halva surrogatpar
function förstaRaden(m) {
  // Rubrikrader ("**Läget.**"), pingar och tomrader är inte innehåll.
  const rader = (m.content || '').split('\n').map(r => r.trim())
    .filter(r => r && !/^<@/.test(r) && !/^\*\*[^*]{0,20}\*\*$/.test(r));
  const vald = (rader.find(r => STATUSTECKEN.test(r)) || rader[0] || '')
    .replace(/^\*\*|\*\*$/g, '');
  const tecken = Array.from(vald); // klipp på tecken, inte kodenheter
  return tecken.length > 90 ? tecken.slice(0, 89).join('') + '…' : vald;
}
function status(msgs) {
  // Sämsta signalen i fönstret vinner: ett fel göms inte av en senare grön rad.
  let s = 'ok';
  for (const m of msgs) {
    if (/🚨|❌/u.test(m.content || '')) return 'fel';
    if (/⚠️/u.test(förstaRaden(m))) s = 'varning';
  }
  return s;
}

// ---- saldon (samma endpoints som tools/oversattningskon.mjs) ----------------
async function heygenSaldo() {
  const key = process.env.HEYGEN_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch('https://api.heygen.com/v2/user/remaining_quota', { headers: { 'x-api-key': key } });
    if (!r.ok) return null;
    const j = await r.json();
    return j.data?.details?.api ?? j.data?.remaining_quota ?? null;
  } catch { return null; }
}
async function kieSaldo() {
  const key = process.env.KIE_API_KEY;
  if (!key) return null;
  try {
    const r = await fetch('https://api.kie.ai/api/v1/chat/credit', { headers: { authorization: `Bearer ${key}` } });
    if (!r.ok) return null;
    const j = await r.json();
    return typeof j.data === 'number' ? j.data : j.data?.credit ?? null;
  } catch { return null; }
}

// Gårdagens saldon läses ur den förra Rutinkollen-rapporten i målkanalen,
// så förändringen kan skrivas ut utan något eget minne.
function förraSaldon(msgs) {
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (!/☀️ Rutinkollen/.test(m.content || '')) continue;
    const hg = m.content.match(/HeyGen ([\d\s]+)/);
    const kie = m.content.match(/Kie ([\d\s]+)/);
    return {
      heygen: hg ? Number(hg[1].replace(/\s/g, '')) : null,
      kie: kie ? Number(kie[1].replace(/\s/g, '')) : null,
    };
  }
  return { heygen: null, kie: null };
}

const fmt = n => Math.round(n).toLocaleString('sv-SE').replace(/ /g, ' ');
function saldoRad(namn, nu, förr) {
  if (nu == null) return null;
  let rad = `${namn} ${fmt(nu)} kvar`;
  if (förr != null && Math.round(förr) !== Math.round(nu)) {
    const diff = nu - förr;
    rad += ` (${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))} sedan sist)`;
  }
  return rad;
}

// ---- huvudflödet ------------------------------------------------------------
const rader = [];
const problemRader = [];
const lästeInte = [];

for (const rutin of RUTINER) {
  let id;
  try { id = await kanalId(rutin); } catch (e) { id = null; }
  if (!id) { lästeInte.push(rutin.namn); continue; }
  let msgs;
  try { msgs = await botMeddelanden(id); } catch { lästeInte.push(rutin.namn); continue; }
  if (msgs.length === 0) {
    if (rutin.dagligen) rader.push({ nivå: 'fel', text: `❌ ${rutin.namn} hörde inte av sig.` });
    continue;
  }
  const s = status(msgs);
  const emoji = s === 'fel' ? '❌' : s === 'varning' ? '⚠️' : '✅';
  let text = `${emoji} ${rutin.namn}: ${förstaRaden(msgs[msgs.length - 1]).replace(/^(?:✅|⚠️|❌|🚨|☀️|\p{Emoji_Presentation})+\s*/gu, '')}`;
  if (rutin.minst > 1 && msgs.length < rutin.minst) {
    text += ` (${msgs.length} av ${rutin.minst} rapporter)`;
    rader.push({ nivå: 'varning', text: text.replace(/^✅/, '⚠️') });
  } else {
    rader.push({ nivå: s === 'ok' ? 'ok' : s, text });
  }
}

for (const pk of PROBLEMKANALER) {
  let id;
  try { id = await kanalId(pk); } catch { id = null; }
  if (!id) continue;
  let msgs = [];
  try { msgs = await botMeddelanden(id); } catch { continue; }
  for (const m of msgs) problemRader.push(`• ${förstaRaden(m)}`);
}

const målkanal = flaggor.kanal || process.env.RUTINKOLLEN_KANAL || DAGENS_CHECKIN;
let förr = { heygen: null, kie: null };
try {
  const gamla = (await api(`/channels/${målkanal}/messages?limit=50`))
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  förr = förraSaldon(gamla);
} catch { /* utan historik skrivs saldot utan förändring */ }

const [hg, kie] = await Promise.all([heygenSaldo(), kieSaldo()]);

// ---- rapporten (Axels läsformat: en mening per rad, max ~10 ord) ------------
const datum = new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Stockholm' });
const antalIlla = rader.filter(r => r.nivå !== 'ok').length + problemRader.length + lästeInte.length;

const ut = [`☀️ Rutinkollen ${datum}`];
ut.push(antalIlla === 0 ? '✅ Allt rullar. Du behöver inte läsa mer.' : `⚠️ ${antalIlla} sak${antalIlla > 1 ? 'er' : ''} att titta på.`);
ut.push('');
for (const r of rader) ut.push(r.text);
for (const namn of lästeInte) ut.push(`⚠️ ${namn}: kunde inte läsa kanalen.`);
if (problemRader.length) {
  ut.push('');
  ut.push('Problem rapporterade i natt:');
  ut.push(...problemRader);
}
const saldon = [saldoRad('HeyGen', hg, förr.heygen), saldoRad('Kie', kie, förr.kie)].filter(Boolean);
if (saldon.length) {
  ut.push('');
  ut.push(`💳 ${saldon.join('. ')}.`);
}
ut.push('');
ut.push(antalIlla === 0 ? 'Du behöver inte göra något.' : 'Titta bara på raderna med ⚠️ och ❌.');

const rapport = ut.join('\n');
console.log(rapport);

if (flaggor.torr) { console.error('\n--torr: inget skickades.'); process.exit(0); }

// ---- skicka -----------------------------------------------------------------
const delar = [];
let ack = '';
for (const rad of rapport.split('\n')) {
  if ((ack + '\n' + rad).length > 1900) { delar.push(ack); ack = rad; }
  else ack = ack ? ack + '\n' + rad : rad;
}
if (ack) delar.push(ack);
for (const [i, content] of delar.entries()) {
  const r = await fetch(`https://discord.com/api/v10/channels/${målkanal}/messages`, {
    method: 'POST',
    headers: { ...HUVUDEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!r.ok) {
    console.error(`Discord svarade ${r.status}: ${(await r.text()).slice(0, 200)}`);
    process.exit(1);
  }
  if (i < delar.length - 1) await new Promise(res => setTimeout(res, 600));
}
console.error('Rapporten skickad till Discord.');
