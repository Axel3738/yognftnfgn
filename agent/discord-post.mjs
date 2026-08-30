#!/usr/bin/env node
// Postar ett meddelande till Discord. Används av ALLA rutiner — ronden,
// nattkörningen, och allt som kommer sedan. Noll beroenden, Node 20+.
//
//   node agent/discord-post.mjs "Rubrik" "Brödtext"
//   node agent/discord-post.mjs --kanal larm "Rubrik" "Brödtext"
//   echo "text" | node agent/discord-post.mjs "Rubrik"
//
// Kanalerna och deras webhookar står i agent/discord.json. Saknas kanalen
// används "standard". Skriptet kraschar aldrig en rutin: fel skrivs till
// stderr och ger exit 1, men rutinen ska fortsätta ändå.

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
  const kanaler = rå.kanaler && typeof rå.kanaler === 'object' ? rå.kanaler : {};
  // Bakåtkompatibelt: den första versionen hade bara webhook_url.
  if (rå.webhook_url && !kanaler.standard) kanaler.standard = rå.webhook_url;
  const alias = rå.alias && typeof rå.alias === 'object' ? rå.alias : {};
  return { kanaler, alias, username: rå.username || 'Bävern 🦫' };
}

/**
 * Slår upp en kanal på NAMN med bot-token. Det här är den väg vi vill gå:
 * då kan boten skapa nya kanaler själv utan att någon behöver klistra in en
 * webhook-URL, och varje rutin kan posta i sin egen kanal med bara ett namn.
 * Kräver env DISCORD_BOT_TOKEN. Returnerar null om token saknas.
 */
export async function slaUppKanal(namn, token = process.env.DISCORD_BOT_TOKEN) {
  if (!token) return null;
  const huvuden = { Authorization: `Bot ${token}` };
  const sökt = String(namn).toLowerCase().replace(/^#/, '');

  const servrar = await fetch('https://discord.com/api/v10/users/@me/guilds', { headers: huvuden });
  if (!servrar.ok) throw new Error(`Kunde inte lista servrar (${servrar.status}) — är DISCORD_BOT_TOKEN rätt?`);

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
export async function skicka({ rubrik = '', text = '', kanal = 'standard', konfig = null } = {}) {
  const { kanaler, alias, username } = konfig || (await lasKonfig());

  // Kommandofilerna säger "ronden" / "uppgifter" / "larm" — alias översätter
  // till det kanalnamn servern faktiskt har, så en omdöpt kanal bara kräver
  // en rad i discord.json i stället för ändringar i varje kommandofil.
  const riktigtNamn = (alias && alias[kanal]) || kanal;

  // Väg 1 (helst): posta som boten till kanalen med det namnet. Kräver bara
  // env DISCORD_BOT_TOKEN — inga webhook-URL:er att hålla reda på, och nya
  // kanaler funkar direkt så fort boten skapat dem.
  let url = null;
  let huvuden = {};
  let via = 'webhook';
  if (process.env.DISCORD_BOT_TOKEN && riktigtNamn !== 'standard') {
    const id = await slaUppKanal(riktigtNamn);
    if (id) {
      url = `https://discord.com/api/v10/channels/${id}/messages`;
      huvuden = { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` };
      via = 'bot';
    }
  }

  // Väg 2: webhook ur discord.json. Faller tillbaka på "standard" så en rutin
  // aldrig tystnar bara för att dess kanal inte finns än.
  if (!url) {
    const webhook = kanaler[riktigtNamn] || kanaler[kanal] || kanaler.standard;
    if (!webhook) throw new Error(`Ingen webhook för kanalen "${kanal}" i ${KONFIGFIL}, och ingen DISCORD_BOT_TOKEN satt.`);
    url = webhook;
  }

  const bitar = dela(text);
  const antal = Math.max(1, bitar.length);
  for (let i = 0; i < antal; i += 1) {
    const huvud = i === 0
      ? (rubrik ? `**${rubrik}**\n` : '')
      : (rubrik ? `**${rubrik}** _(${i + 1}/${antal})_\n` : '');
    const innehåll = `${huvud}${bitar[i] ?? ''}`.trim();
    // username går bara att sätta på webhookar; botens namn styrs av appen.
    await posta(url, via === 'bot' ? { content: innehåll } : { username, content: innehåll }, huvuden);
  }
  return { kanal, delar: antal, via };
}

async function main() {
  const argv = process.argv.slice(2);
  let kanal = 'standard';
  const i = argv.indexOf('--kanal');
  if (i >= 0) { kanal = argv[i + 1] || 'standard'; argv.splice(i, 2); }

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

  const { kanal: använd, delar, via } = await skicka({ rubrik, text, kanal });
  console.log(`Postat till Discord (#${använd} via ${via}, ${delar} ${delar === 1 ? 'meddelande' : 'meddelanden'}).`);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  main().catch((fel) => {
    console.error(`Discord-posten misslyckades: ${fel.message}`);
    process.exit(1);
  });
}
