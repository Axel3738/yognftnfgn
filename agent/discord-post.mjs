#!/usr/bin/env node
// Postar ett meddelande till Discord. Används av ALLA rutiner — ronden,
// nattkörningen, och allt som kommer sedan. Noll beroenden, Node 20+.
//
//   node agent/discord-post.mjs "Rubrik" "Brödtext"
//   node agent/discord-post.mjs --kanal larm "Rubrik" "Brödtext"
//   echo "text" | node agent/discord-post.mjs "Rubrik"
//
// Kanalnamnen översätts via alias-listan i agent/discord.json. Posten görs SOM
// BOTEN. Repot är publikt, så token får ALDRIG ligga i en fil här. Två vägar
// in, och skriptet klarar båda:
//   1. env DISCORD_BOT_TOKEN (Railway, och lokalt).
//   2. En API-credential på molnmiljön: agentproxyn sätter Authorization-huvudet
//      åt oss efter att anropet lämnat sessionen, så nyckeln aldrig syns för
//      Claude eller i miljövariablerna. Då finns ingen token här, och vi ska
//      INTE sätta huvudet själva — proxyn gör det.
// Skriptet kraschar aldrig en rutin: fel skrivs till stderr och ger exit 1,
// men rutinen ska fortsätta ändå.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
export const KONFIGFIL = join(HÄR, 'discord.json');

// Discords hårda gräns är 2000 tecken. Vi lämnar marginal för rubrik och
// sidnumrering så ett svar aldrig avvisas på gränsen.
export const MAX_TECKEN = 1900;

/**
 * Delar text i Discord-lagom bitar utan att klippa mitt i en rad — och utan
 * att lämna ett kodblock öppet, för då färgar Discord resten av meddelandet.
 */
export function dela(text, max = MAX_TECKEN) {
  const rent = String(text ?? '').trim();
  if (!rent) return [];
  if (rent.length <= max) return [rent];

  const bitar = [];
  let nuvarande = '';
  let iKodblock = false;

  const spola = () => {
    if (!nuvarande.trim()) { nuvarande = ''; return; }
    bitar.push(iKodblock ? `${nuvarande.trimEnd()}\n\`\`\`` : nuvarande.trimEnd());
    nuvarande = iKodblock ? '```\n' : '';
  };

  for (const rad of rent.split('\n')) {
    // En ensam rad som är längre än taket måste huggas hårt.
    const delar = rad.length > max ? rad.match(new RegExp(`.{1,${max - 10}}`, 'g')) : [rad];
    for (const del of delar) {
      if (nuvarande.length + del.length + 1 > max) spola();
      nuvarande += `${del}\n`;
      if (del.trimStart().startsWith('```')) iKodblock = !iKodblock;
    }
  }
  spola();
  return bitar;
}

export async function lasKonfig(fil = KONFIGFIL) {
  const rå = JSON.parse(await readFile(fil, 'utf8'));
  const alias = rå.alias && typeof rå.alias === 'object' ? rå.alias : {};
  // Vilka som ska pingas i varje post (Axel 2026-09-02). Användarnamn, inte id.
  const pinga = Array.isArray(rå.pinga) ? rå.pinga.map((n) => String(n).replace(/^@/, '').trim()).filter(Boolean) : [];
  const guildId = rå.guild_id ? String(rå.guild_id) : null;
  // Roller per alias (Axel 2026-09-02: uppgifter-poster pingar rollen Video editor).
  const pingaRoll = rå.pinga_roll && typeof rå.pinga_roll === 'object' ? rå.pinga_roll : {};
  return { alias, pinga, guildId, pingaRoll };
}

/**
 * Slår upp en roll på namn i servern. Exakt träff, skiftlägesokänsligt.
 * Returnerar id eller null — aldrig ett fel.
 */
export async function slaUppRoll(namn, guildId, token = process.env.DISCORD_BOT_TOKEN) {
  if (!guildId || !namn) return null;
  try {
    const svar = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, { headers: botHuvuden(token) });
    if (!svar.ok) return null;
    const sökt = String(namn).toLowerCase();
    const träff = (await svar.json()).find((r) => String(r?.name || '').toLowerCase() === sökt);
    return träff?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Pingraden överst i posten. Discord pingar BARA på formen <@id> (användare)
 * och <@&id> (roll) — texten "@namn" ser ut som en ping men når ingen. Därför
 * slås namnen upp till id först; det som inte gick att slå upp skrivs som
 * text så att ingen tystas.
 * @param {{namn: string, id: string|null}[]} personer
 * @param {{namn: string, id: string|null}[]} roller
 */
export function pingRad(personer, roller = []) {
  const delar = [
    ...(roller || []).filter((r) => r && r.namn).map((r) => (r.id ? `<@&${r.id}>` : `@${r.namn}`)),
    ...(personer || []).filter((p) => p && p.namn).map((p) => (p.id ? `<@${p.id}>` : `@${p.namn}`)),
  ];
  return delar.length ? delar.join(' ') : '';
}

/**
 * Slår upp en användare på användarnamn i servern. Exakt träff på username
 * (skiftlägesokänsligt); Discords sökning är prefix-baserad, så vi filtrerar
 * själv. Returnerar id eller null — aldrig ett fel, posten ska gå ändå.
 */
export async function slaUppAnvandare(namn, guildId, token = process.env.DISCORD_BOT_TOKEN) {
  if (!guildId || !namn) return null;
  try {
    const url = `https://discord.com/api/v10/guilds/${guildId}/members/search?query=${encodeURIComponent(namn)}&limit=25`;
    const svar = await fetch(url, { headers: botHuvuden(token) });
    if (!svar.ok) return null;
    const sökt = String(namn).toLowerCase();
    const träff = (await svar.json()).find((m) => String(m?.user?.username || '').toLowerCase() === sökt);
    return träff?.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Authorization-huvudet för Discord.
 *
 * Utan token skickar vi INGET huvud alls. Det är med flit: kör vi i en
 * molnmiljö med en API-credential för discord.com sätter agentproxyn huvudet
 * åt oss, och ett tomt eget huvud hade skrivit över det. Är varken token eller
 * credential på plats svarar Discord 401, och felet nedan säger vad som fattas.
 */
export function botHuvuden(token = process.env.DISCORD_BOT_TOKEN) {
  return token ? { Authorization: `Bot ${token}` } : {};
}

export const SAKNAS_HJALP =
  'Discord nekade anropet (401). Token saknas eller är fel. Sätt den antingen '
  + 'som API-credential på molnmiljön (hosts: discord.com, huvud Authorization '
  + 'utan prefix, värde "Bot <token>") eller som env DISCORD_BOT_TOKEN. '
  + 'Repot är publikt — den får aldrig ligga i en fil här.';

/**
 * Slår upp en kanal på NAMN med bot-token. Det här är den väg vi vill gå:
 * då kan boten skapa nya kanaler själv utan att någon behöver klistra in en
 * webhook-URL, och varje rutin kan posta i sin egen kanal med bara ett namn.
 */
export async function slaUppKanal(namn, token = process.env.DISCORD_BOT_TOKEN) {
  const huvuden = botHuvuden(token);
  const sökt = String(namn).toLowerCase().replace(/^#/, '');

  const servrar = await fetch('https://discord.com/api/v10/users/@me/guilds', { headers: huvuden });
  if (servrar.status === 401) throw new Error(SAKNAS_HJALP);
  if (!servrar.ok) throw new Error(`Kunde inte lista servrar (${servrar.status}).`);

  for (const server of await servrar.json()) {
    const svar = await fetch(`https://discord.com/api/v10/guilds/${server.id}/channels`, { headers: huvuden });
    if (!svar.ok) continue;
    // type 0 = textkanal. Discord slugifierar namn (mellanslag → bindestreck).
    const träff = (await svar.json()).find(
      (k) => k.type === 0 && k.name.toLowerCase() === sökt,
    );
    if (träff) return träff.id;
  }
  return null;
}

/** POST med omförsök vid rate limit. Discord svarar 204 (webhook) / 200 (bot). */
async function posta(url, kropp, extraHuvuden = {}) {
  for (let försök = 0; försök < 3; försök += 1) {
    const svar = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHuvuden },
      body: JSON.stringify(kropp),
    });
    if (svar.status === 429) {
      const data = await svar.json().catch(() => ({}));
      const vänta = Math.min(10, Number(data.retry_after) || 1);
      await new Promise((r) => setTimeout(r, vänta * 1000));
      continue;
    }
    if (svar.status === 401) throw new Error(SAKNAS_HJALP);
    if (!svar.ok) {
      throw new Error(`Discord svarade ${svar.status}: ${(await svar.text()).slice(0, 200)}`);
    }
    return;
  }
  throw new Error('Discord rate-limitade tre gånger i rad — gav upp.');
}

/**
 * Skickar ett meddelande. Rubriken fetstilas och upprepas inte på följdbitar;
 * i stället numreras de, så en lång rapport går att läsa i ordning.
 */
export async function skicka({ rubrik = '', text = '', kanal = 'chatt', konfig = null } = {}) {
  const token = process.env.DISCORD_BOT_TOKEN;

  const { alias, pinga = [], guildId = null, pingaRoll = {} } = konfig || (await lasKonfig());
  // Kommandofilerna säger "ronden" / "uppgifter" / "larm" — alias översätter
  // till det kanalnamn servern faktiskt har, så en omdöpt kanal bara kräver
  // en rad i discord.json i stället för ändringar i varje kommandofil.
  const riktigtNamn = alias[kanal] || kanal;

  const id = await slaUppKanal(riktigtNamn, token);
  if (!id) {
    throw new Error(
      `Hittade ingen textkanal som heter "${riktigtNamn}" i någon server boten är med i. `
      + 'Kolla stavningen i alias-listan i agent/discord.json, eller att boten ser kanalen.',
    );
  }

  const url = `https://discord.com/api/v10/channels/${id}/messages`;
  const huvuden = botHuvuden(token);

  // Pingarna (Axel 2026-09-02): slå upp id:n, bygg raden, och tillåt EXAKT de
  // användarna i allowed_mentions — @everyone och roller är fortfarande spärrade.
  const personer = [];
  for (const namn of pinga) personer.push({ namn, id: await slaUppAnvandare(namn, guildId, token) });
  // Rollerna hänger på aliaset (t.ex. uppgifter → Video editor), inte på kanalnamnet.
  const roller = [];
  for (const namn of (pingaRoll[kanal] || [])) roller.push({ namn, id: await slaUppRoll(namn, guildId, token) });
  const ping = pingRad(personer, roller);
  const tillatnaIdn = personer.map((p) => p.id).filter(Boolean);
  const tillatnaRoller = roller.map((r) => r.id).filter(Boolean);

  const bitar = dela(text);
  const antal = Math.max(1, bitar.length);
  for (let i = 0; i < antal; i += 1) {
    const huvud = i === 0
      ? `${ping ? `${ping}\n` : ''}${rubrik ? `**${rubrik}**\n` : ''}`
      : (rubrik ? `**${rubrik}** _(${i + 1}/${antal})_\n` : '');
    // Discord tillåter ~5 meddelanden per 5 sekunder per kanal — en paus
    // mellan bitarna gör att en lång rapport inte rate-limitas.
    if (i > 0) await new Promise((r) => setTimeout(r, 350));
    await posta(url, {
      content: `${huvud}${bitar[i] ?? ''}`.trim(),
      // parse: [] stoppar @everyone/@here/roller; users: listar de enda som får pingas.
      allowed_mentions: { parse: [], users: i === 0 ? tillatnaIdn : [], roles: i === 0 ? tillatnaRoller : [] },
    }, huvuden);
  }
  const ejHittade = [...personer, ...roller].filter((p) => !p.id).map((p) => p.namn);
  return { kanal: riktigtNamn, delar: antal, pingade: tillatnaIdn.length + tillatnaRoller.length, ejHittade };
}

async function main() {
  const argv = process.argv.slice(2);
  let kanal = 'chatt';
  const i = argv.indexOf('--kanal');
  if (i >= 0) { kanal = argv[i + 1] || 'chatt'; argv.splice(i, 2); }

  const rubrik = argv[0] || '';
  let text = argv.slice(1).join(' ');
  if (!text && !process.stdin.isTTY) {
    text = await new Promise((r) => {
      let buf = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (d) => { buf += d; });
      process.stdin.on('end', () => r(buf));
    });
  }
  if (!rubrik && !text) {
    console.error('Användning: node agent/discord-post.mjs [--kanal <namn>] "Rubrik" "Text"');
    process.exit(2);
  }

  const { kanal: använd, delar, pingade, ejHittade } = await skicka({ rubrik, text, kanal });
  console.log(`Postat till Discord (#${använd}, ${delar} ${delar === 1 ? 'meddelande' : 'meddelanden'}, ${pingade} pingade).`);
  if (ejHittade.length) console.error(`Kunde inte slå upp Discord-användare: ${ejHittade.join(', ')} — skrevs som text, pingade inte.`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  main().catch((fel) => {
    console.error(`Discord-posten misslyckades: ${fel.message}`);
    process.exit(1);
  });
}
