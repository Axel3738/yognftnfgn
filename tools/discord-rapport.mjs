#!/usr/bin/env node
// Strukturerad Discord-rapport till Axel — en fast mall, korta rader, ping
// bara när någon faktiskt ska göra något.
//
// Axels krav 2026-09-10, ordagrant: "mycket mer strukturerade rapporter och
// tydliga meddelanden som är simpla och lätta att läsa pga min grova dyslexi
// … pings bara när jag faktiskt BEHÖVER göra något, och då extra tydligt.
// Om någon annan behöver göra något så pinga dom och mig."
//
//   node tools/discord-rapport.mjs --jobb <fil.json> [--torr]
//
// Jobbfilen (skrivs av rutinen, aldrig för hand):
//   {
//     brand, butik, datum, lage: "budget" | "brief",
//     server (namn eller id, standard = brand), kanal (namn, standard "ops-rapport"),
//     gjort: [ ..korta engelska rader.. ],
//     siffror: { spend_7d, kop_7d, roas_7d, vinstbidrag_7d, briefs_nya },
//     briefer: [ { namn, typ, url } ],
//     action_axel: [ ..rader.. ],
//     action_redigerare: [ { discord_id, namn, rader: [..] } ],
//     nasta_korning: "YYYY-MM-DD",
//     varningar: [ .. ]
//   }
//
// Mallen (renderaRapport, ren funktion):
//   🌙 <BRAND> night watch — <datum>      (lage: budget)
//   📝 <BRAND> brief day — <datum>        (lage: brief)
//   Sektioner i fast ordning, bara de som har innehåll:
//   Numbers (7 days) → Done automatically → New briefs (N) → ⚠️ Warnings →
//   🔴 ACTION NEEDED (sist). Axel pingas ENBART i ACTION-sektionen. Har en
//   redigerare rader pingas redigeraren + Axel. Ingen action = ingen ping,
//   och sista raden är "✅ Nothing for you to do. Next run: <datum>".
//   Max 2000 tecken (Discords tak): listorna kapas, ACTION-sektionen aldrig.
//
// Språk: allt i Discord är på engelska (Axels order 2026-09-05). Den
// renderade texten körs genom tools/lib/engelska.mjs; svensk text stoppas
// med exit 3 och texten utskriven — samma regel som notify-discord.mjs.
//
// Skick: DISCORD_BOT_TOKEN. Servern hittas på brand-namnet (valjServer i
// factory/startskott.mjs), kanalen på namn och skapas om den saknas
// (hittaEllerSkapaKanal i factory/discord.mjs). Sitter boten inte i servern
// skrivs rapporten i stdout med felet, exit 2 — aldrig tyst.
// Axels id: env DISCORD_AXEL_ID, annars serverns owner_id (som startskottet).
//
// Noll beroenden.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { granskaSprak, serUtSomSvenska, stoppText } from './lib/engelska.mjs';

/** Discords tak för ett meddelande. */
export const MAXLANGD = 2000;
/** Kanalen rapporten går till om jobbet inte säger annat. Butiksservrarna
 *  har redan kanalerna (Axels bild 2026-09-10): nattens budgetrapport går
 *  till #ads, briefdagens rapport till #ads-to-do där redigeraren tittar. */
export const STANDARDKANAL = 'ads';
export const KANAL_PER_LAGE = Object.freeze({ budget: 'ads', brief: 'ads-to-do', leverans: 'annons-uppladdning', oversatt: 'annons-uppladdning', bild: 'ads-to-do' });
export const kanalFor = (jobb) => String(jobb?.kanal || KANAL_PER_LAGE[jobb?.lage] || STANDARDKANAL).replace(/^#/, '');
/** Tak per lista i mallen — fler rader gör den oläslig, inte tydligare. */
export const TAK = { siffror: 4, gjort: 8, briefer: 10 };

const LAGEN = {
  budget: { emoji: '🌙', rubrik: 'night watch' },
  brief: { emoji: '📝', rubrik: 'brief day' },
  leverans: { emoji: '🚀', rubrik: 'delivery run' },
  oversatt: { emoji: '🇳🇴', rubrik: 'Norway translation' },
  bild: { emoji: '🖼️', rubrik: 'image ads' },
};

/** Fält som måste finnas för att mallen ska gå att rendera alls. */
export function saknadeFalt(jobb) {
  if (!jobb || typeof jobb !== 'object') return ['brand', 'datum', 'lage'];
  const saknade = [];
  if (!String(jobb.brand ?? '').trim()) saknade.push('brand');
  if (!String(jobb.datum ?? '').trim()) saknade.push('datum');
  if (!LAGEN[jobb.lage]) saknade.push('lage (budget | brief | leverans | oversatt | bild)');
  return saknade;
}

/** Heltal med tusenmellanslag: 4120 → "4 120". */
function heltal(n) {
  return Math.round(Number(n)).toLocaleString('en-US').replace(/,/g, ' ');
}

/** Två decimaler med punkt: 2.3 → "2.30". Engelsk läsare, engelskt decimaltecken. */
function decimal(n) {
  return Number(n).toFixed(2);
}

function arTal(v) {
  return v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v));
}

function lista(v) {
  return Array.isArray(v) ? v.filter((r) => r !== undefined && r !== null && String(typeof r === 'object' ? r.namn ?? '' : r).trim() !== '') : [];
}

/** Sektionen "Numbers (7 days)" — max 4 rader, bara talen som finns. */
function siffrorRader(s) {
  if (!s || typeof s !== 'object') return [];
  const rader = [];
  if (arTal(s.spend_7d)) rader.push(`Spend: ${heltal(s.spend_7d)} SEK`);
  if (arTal(s.kop_7d)) rader.push(`Purchases: ${heltal(s.kop_7d)}`);
  if (arTal(s.roas_7d)) rader.push(`ROAS: ${decimal(s.roas_7d)}`);
  if (arTal(s.vinstbidrag_7d)) rader.push(`Profit contribution: ${heltal(s.vinstbidrag_7d)} SEK`);
  return rader.slice(0, TAK.siffror);
}

/** En punktlista med tak. Över taket: "+N more". */
function punkter(rader, tak) {
  const ut = rader.slice(0, tak).map((r) => `• ${r}`);
  if (rader.length > tak) ut.push(`+${rader.length - tak} more`);
  return ut;
}

function briefRad(b) {
  const namn = typeof b === 'object' ? b.namn : String(b);
  const typ = typeof b === 'object' && b.typ ? ` (${b.typ})` : '';
  const url = typeof b === 'object' && b.url ? ` — <${b.url}>` : '';
  return `${namn}${typ}${url}`;
}

/**
 * ACTION-sektionen. Byggs separat för att den aldrig kapas. Tom sträng när
 * ingen har något att göra — då finns inga <@-pingar någonstans i rapporten.
 */
export function actionSektion(jobb, { axelId = null } = {}) {
  const axel = lista(jobb.action_axel).map(String);
  const redigerare = (Array.isArray(jobb.action_redigerare) ? jobb.action_redigerare : [])
    .filter((r) => r && lista(r.rader).length > 0);
  if (axel.length === 0 && redigerare.length === 0) return '';

  const pingAxel = axelId ? `<@${axelId}>` : null;
  const rader = ['**🔴 ACTION NEEDED**'];
  if (!pingAxel) rader.push('⚠️ No Discord id for Axel (set DISCORD_AXEL_ID) — no ping possible.');

  if (axel.length > 0) {
    rader.push(pingAxel ? `${pingAxel} — you:` : 'Axel — you:');
    axel.forEach((r, i) => rader.push(`${i + 1}. ${r}`));
  }
  for (const r of redigerare) {
    const namn = r.namn ? ` (${r.namn})` : '';
    const ping = r.discord_id ? `<@${r.discord_id}>${namn}` : `${r.namn || 'editor'} (no Discord id — no ping)`;
    rader.push('');
    rader.push(pingAxel ? `${ping} + ${pingAxel}:` : `${ping}:`);
    lista(r.rader).map(String).forEach((rad, i) => rader.push(`${i + 1}. ${rad}`));
  }
  return rader.join('\n');
}

/**
 * Renderar hela rapporten ur ett jobb. Ren funktion: inget nätverk, ingen
 * klocka. `axelId` skickas in av CLI:t (env eller serverns ägare) — utan id
 * pingas ingen, och det står i så fall i klartext i ACTION-sektionen.
 */
export function renderaRapport(jobb, { axelId = null } = {}) {
  const saknade = saknadeFalt(jobb);
  if (saknade.length > 0) throw new Error(`Rapporten vägrar: saknade fält — ${saknade.join(', ')}`);

  const lage = LAGEN[jobb.lage];
  const rubrik = `${lage.emoji} ${String(jobb.brand).toUpperCase()} ${lage.rubrik} — ${jobb.datum}`;
  const action = actionSektion(jobb, { axelId });
  const nasta = String(jobb.nasta_korning ?? '').trim();
  const svans = action
    ? [nasta ? `Next run: ${nasta}` : null, '', action].filter((r) => r !== null).join('\n')
    : `✅ Nothing for you to do.${nasta ? ` Next run: ${nasta}` : ''}`;

  const siffror = siffrorRader(jobb.siffror);
  const gjort = lista(jobb.gjort).map(String);
  const briefer = lista(jobb.briefer);
  const varningar = lista(jobb.varningar).map(String);
  const antalBriefer = arTal(jobb.siffror?.briefs_nya) ? Number(jobb.siffror.briefs_nya) : briefer.length;

  // Kroppen byggs om med krympande tak tills den ryms under 2000 tecken.
  // ACTION-sektionen (svansen) räknas in men rörs aldrig.
  const bygg = (tak) => {
    const delar = [rubrik];
    if (siffror.length) delar.push('', '**Numbers (7 days)**', ...siffror);
    if (gjort.length) delar.push('', '**Done automatically**', ...punkter(gjort, tak.gjort));
    if (briefer.length) delar.push('', `**New briefs (${antalBriefer})**`, ...punkter(briefer.map(briefRad), tak.briefer));
    if (varningar.length) delar.push('', '**⚠️ Warnings**', ...punkter(varningar, tak.varningar));
    delar.push('', svans);
    return delar.join('\n');
  };

  const tak = { gjort: TAK.gjort, briefer: TAK.briefer, varningar: 8 };
  let text = bygg(tak);
  while (text.length > MAXLANGD && (tak.gjort > 0 || tak.briefer > 0 || tak.varningar > 0)) {
    // Krymp den längsta listan först — varningar sist, de är viktigast.
    if (tak.briefer >= tak.gjort && tak.briefer > 0) tak.briefer -= 1;
    else if (tak.gjort > 0) tak.gjort -= 1;
    else tak.varningar -= 1;
    text = bygg(tak);
  }
  if (text.length > MAXLANGD) {
    // Bara rubrik + svans kvar och ändå för långt: kapa kroppen, aldrig svansen.
    const kropp = `${rubrik}\n\n`;
    const plats = MAXLANGD - svans.length - '… [cut]\n\n'.length;
    text = `${kropp.slice(0, Math.max(0, plats))}… [cut]\n\n${svans}`.slice(-MAXLANGD);
  }
  return text;
}

// ------------------------------------------------------------------- Skick

/**
 * Server → kanal (skapas vid behov) → post. Kastar med klartext om boten
 * inte sitter i servern; CLI:t har då redan skrivit rapporten i stdout.
 */
/**
 * Servern för en butik. Exakt namn eller id först; annars den ENDA servern
 * vars namn börjar med brandnamnet — butiksservrarna heter "DryTrek — OPS"
 * och "TackleBay — OPS" (mätt 2026-09-10), inte bara brandet. Två träffar
 * ⇒ null, för fel server är fel människa.
 */
export function valjButiksServer(guilds, onskad) {
  const lista = Array.isArray(guilds) ? guilds : [];
  const o = String(onskad ?? '').trim().toLowerCase();
  if (!o) return null;
  const exakt = lista.find((g) => g.id === o) ?? lista.find((g) => String(g.name).toLowerCase() === o);
  if (exakt) return exakt;
  const borjar = lista.filter((g) => String(g.name).toLowerCase().startsWith(o));
  return borjar.length === 1 ? borjar[0] : null;
}

export async function skickaRapport(jobb, { axelId = null } = {}) {
  if (!process.env.DISCORD_BOT_TOKEN) {
    throw new Error('DISCORD_BOT_TOKEN saknas i miljön — rapporten står bara i chatten.');
  }
  const { hamtaGuilds, hamtaGuild, hittaEllerSkapaKanal, skickaMeddelande } = await import('../factory/discord.mjs');
  const onskad = String(jobb.server || jobb.brand).trim();
  const guilds = await hamtaGuilds();
  const vald = valjButiksServer(guilds, onskad);
  if (!vald) {
    throw new Error(`Boten sitter inte i servern "${onskad}" (eller flera servrar börjar så). Den sitter i: ${guilds.map((g) => g.name).join(', ') || 'ingen'}.`);
  }
  const server = await hamtaGuild(vald.id);
  const pingId = axelId || process.env.DISCORD_AXEL_ID || server.owner_id;
  const text = renderaRapport(jobb, { axelId: pingId });
  const sprak = await granskaSprak(text);
  if (sprak.stoppad) {
    const fel = new Error(stoppText(sprak.orsak));
    fel.exitKod = 3;
    fel.text = text;
    throw fel;
  }
  const kanal = await hittaEllerSkapaKanal(server.id, kanalFor(jobb));
  const svar = await skickaMeddelande(kanal.id, sprak.text);
  return { id: svar.id, server, kanal, pingId, text: sprak.text, oversatt: sprak.oversatt };
}

// ------------------------------------------------------------------- CLI

async function huvud(argv) {
  const i = argv.indexOf('--jobb');
  if (i === -1 || !argv[i + 1]) {
    console.error('Användning: node tools/discord-rapport.mjs --jobb <fil.json> [--torr]');
    process.exit(1);
  }
  let jobb;
  try {
    jobb = JSON.parse(readFileSync(argv[i + 1], 'utf8'));
  } catch (e) {
    console.error(`Kunde inte läsa jobbfilen: ${e.message}`);
    process.exit(1);
  }
  const torr = argv.includes('--torr');
  const axelId = process.env.DISCORD_AXEL_ID || null;

  let text;
  try {
    text = renderaRapport(jobb, { axelId });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  if (torr) {
    console.log(text);
    console.log(`\n[--torr] ${text.length}/${MAXLANGD} tecken. Ingenting skickades.`);
    if (!axelId) console.log('[--torr] DISCORD_AXEL_ID saknas — skarp körning tar serverns ägare.');
    if (serUtSomSvenska(text)) {
      console.error(`\n${stoppText('torrkörning översätter inte')}`);
      process.exit(3);
    }
    return;
  }

  try {
    const svar = await skickaRapport(jobb, { axelId });
    if (svar.oversatt) console.error('Texten var på svenska — översatt till engelska före skick.');
    console.log(svar.text);
    console.log(`\n✅ Discord: postat i #${svar.kanal.name} på ${svar.server.name}`
      + `${svar.kanal.skapad ? ' (kanalen skapades nu)' : ''} (meddelande ${svar.id}).`);
  } catch (e) {
    // Rapporten får aldrig försvinna tyst: texten skrivs alltid ut före felet.
    console.log(e.text ?? text);
    console.error(`\n❌ ${e.message}`);
    process.exit(e.exitKod ?? 2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Samma proxy-omstart som notify-discord.mjs: inbyggda fetch följer inte
  // HTTPS_PROXY utan NODE_USE_ENV_PROXY.
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1' && !process.argv.includes('--torr')) {
    const r = spawnSync(process.execPath, process.argv.slice(1), {
      stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
    });
    process.exit(r.status ?? 1);
  }
  huvud(process.argv.slice(2)).catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
