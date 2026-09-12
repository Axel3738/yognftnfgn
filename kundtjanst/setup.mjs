#!/usr/bin/env node
// setup.mjs — allt som ska stämma innan kundtjänstrutinen kan köra på ETT
// Claude-konto: vilka brands som finns, vilka nycklar som saknas i just den
// här miljön, och rutinens exakta cron + MCP-anrop (via factory/rutin.mjs,
// samma spärrar som alla andra rutiner).
//
//   node kundtjanst/setup.mjs                    läget + checklistan
//   node kundtjanst/setup.mjs --nytt-konto       hela receptet för ett annat Claude-konto (samma repo)
//   node kundtjanst/setup.mjs --mappar <brand>   listar brandets IMAP-mappar (kräver lösenordet i miljön)
//   node kundtjanst/setup.mjs --tid 07:00        annan svensk tid för rutinen (standard måndag 07:00)
//
// Skapar INGENTING på claude.ai — sessionen gör create_session + create_trigger
// själv (det är MCP-verktyg). Det här är räknandet och kontrollen.

import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';
import { upptackBrands, korkonfig, envNamn } from './brands.mjs';
import { ImapKlient } from './imap.mjs';
import { tillCron, granska, INGA_CONNECTORS } from '../factory/rutin.mjs';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const RUTIN_KOMMANDO = '/kundtjanst --alla --discord';
export const RUTIN_TID = '07:00';
export const RUTIN_VECKODAG = '1'; // måndag — förra veckan är stängd, VA:n börjar veckan med listan

/** Det setup skriver ut per brand: rad + saknade namn. Ren över env. */
export function brandstatus(brand, env = process.env) {
  const k = korkonfig(brand, env);
  const n = envNamn(brand.id);
  const saknas = [];
  if (!k.mail.konfigurerad) saknas.push(...k.mail.saknas);
  return {
    id: brand.id,
    brand: brand.brand,
    supportmail: brand.supportmail || '(saknas — sätt supportmail i kundtjanst/brands/<id>.yaml)',
    mail: k.mail.konfigurerad,
    shopify: k.shopify.konfigurerad ? k.shopify.vag : null,
    shopifySaknas: k.shopify.saknas,
    sop: Boolean(k.notion?.sop_database_id),
    saknas,
    namn: n,
    klar: k.mail.konfigurerad,
  };
}

/** Rutinförslaget: cron för måndag + spärrarna. */
export function rutinforslag({ tid = RUTIN_TID, kommando = RUTIN_KOMMANDO, gren = null, rutiner = [], datum = new Date() } = {}) {
  const c = tillCron(tid, { dagar: RUTIN_VECKODAG, datum });
  const kontroll = granska({ kommando, gren, rutiner });
  return {
    ...c,
    kommando,
    rutinnamn: 'Kundtjänst: veckorapport alla brands',
    sessionstitel: 'Rutin: Kundtjänst veckorapport',
    taggar: ['routine:kundtjanst'],
    kontroll,
    steg: [
      { verktyg: 'create_session', argument: { title: 'Rutin: Kundtjänst veckorapport', source_url: 'https://github.com/Axel3738/yognftnfgn', outcome_branch: 'main', tags: ['routine:kundtjanst'] } },
      { verktyg: 'create_trigger', argument: { name: 'Kundtjänst: veckorapport alla brands', cron_expression: c.cron, persistent_session_id: '<id från steget ovan>', prompt: kommando, initiation: 'human_request' } },
    ],
  };
}

function gren() {
  try { return readFileSync(join(ROT, '.git', 'HEAD'), 'utf8').trim().replace('ref: refs/heads/', ''); } catch { return null; }
}

function skrivLaget(env = process.env) {
  const brands = upptackBrands();
  console.log(`\nKUNDTJÄNST — ${brands.length} brands upptäckta (factory/butiker + kundtjanst/brands)\n`);
  const status = brands.map((b) => brandstatus(b, env));
  for (const s of status) {
    const aktiv = brands.find((b) => b.id === s.id)?.aktiv === false ? ' (inaktiv i brandfilen)' : '';
    console.log(`  ${s.klar ? '✅' : '❌'} ${s.id.padEnd(14)} ${s.brand.padEnd(14)} ${s.supportmail.padEnd(30)} shopify: ${s.shopify ? `✅ ${s.shopify}` : `⚠️ saknar ${s.shopifySaknas.join(' / ')}`}   SOP-db: ${s.sop ? '✅' : '–'}${aktiv}`);
    if (s.saknas.length) console.log(`       saknar: ${s.saknas.join(', ')}`);
  }
  const klara = status.filter((s) => s.klar);
  console.log(`\n  ${klara.length} av ${status.length} brands går att läsa här. Delat: NOTION_TOKEN ${env.NOTION_TOKEN ? '✅' : '❌'} · DISCORD_BOT_TOKEN ${env.DISCORD_BOT_TOKEN ? '✅' : '❌'} · ANTHROPIC_NYCKEL ${env.ANTHROPIC_NYCKEL || env.ANTHROPIC_API_KEY ? '✅' : '– (valfri)'}`);

  const f = rutinforslag({ tid: process.argv.includes('--tid') ? process.argv[process.argv.indexOf('--tid') + 1] : RUTIN_TID, gren: gren() });
  console.log(`\nRUTINEN: "${f.rutinnamn}" — måndagar ${f.svenskTid} svensk tid → cron "${f.cron}" (${f.galler})`);
  console.log(`  ⚠️ ${f.omstallning}`);
  if (f.kontroll.hinder.length) { console.log('\n  STOPP:'); for (const h of f.kontroll.hinder) console.log(`    ❌ ${h}`); }
  for (const v of f.kontroll.varningar) console.log(`  ⚠️ ${v}`);
  console.log('\n  Sessionen gör sen, i den här ordningen:');
  for (const s of f.steg) console.log(`    ${s.verktyg}  ${JSON.stringify(s.argument)}`);
  console.log('');
  return { status, forslag: f };
}

function skrivNyttKonto() {
  const brands = upptackBrands();
  console.log(`
SÅ KÖRS KUNDTJÄNSTRUTINEN PÅ ETT ANNAT CLAUDE-KONTO (samma repo, andra brands)

Allt som är brand-specifikt ligger i repot (kundtjanst/brands/<id>.yaml) och
allt som är hemligt ligger i kontots Environment på claude.ai. Inget i koden
behöver ändras. Fem steg:

1. Klona/koppla repot Axel3738/yognftnfgn till kontot (main).
2. Brands: kör \`node kundtjanst/brands.mjs\` — de ${brands.length} brands som finns
   i repot listas. Saknas ett brand: kopiera kundtjanst/brand-mall.yaml till
   kundtjanst/brands/<id>.yaml och fyll i namn, supportmail och shop.
   Vill kontot INTE köra ett brand: sätt \`aktiv: false\` i dess brandfil,
   eller kör rutinen med \`--brand a,b\` i stället för \`--alla\`.
3. Environment på claude.ai (Settings → Environments → variabler), per brand:
${brands.map((b) => { const n = envNamn(b.id); return `     ${b.id.padEnd(14)} ${n.mailPass}   (Loopia-lösenordet för ${b.supportmail || 'supportmailen'})\n     ${''.padEnd(14)} ${n.shop} + ${n.adminToken}  (eller ${n.clientId} + ${n.clientSecret})`; }).join('\n')}
   Delade (en gång per konto): NOTION_TOKEN, DISCORD_BOT_TOKEN, ANTHROPIC_NYCKEL (valfri).
   ⚠️ Nya variabler syns först i en NY container — inte i en session som redan kör.
4. Kontrollera: \`node kundtjanst/setup.mjs\` ska visa ✅ på varje brand som ska köras.
   Provkör: \`node kundtjanst/run.mjs --brand <id> --torr\` (läser, skriver inget).
5. Rutinen: skriv \`/rutin /kundtjanst --alla --discord 07:00\` i chatten, eller följ
   stegen som \`node kundtjanst/setup.mjs\` skriver ut (create_session + create_trigger,
   fast session, cron för måndag). Kommandofilen .claude/commands/kundtjanst.md är
   märkt "${INGA_CONNECTORS}" — koppla inga connectors, allt går via env-nycklarna.

Loopia: IMAP-servern är mailcluster.loopia.se, port 993, användarnamnet är hela
mejladressen. Lösenordet är brevlådans lösenord (Loopia Kundzon → E-post →
brevlådan → Ändra lösenord). Rutinen läser bara — inget markeras som läst.
`);
}

async function listaMappar(brandId, env = process.env) {
  const b = upptackBrands().find((x) => x.id === brandId);
  if (!b) { console.error(`✗ Brandet "${brandId}" finns inte.`); process.exit(1); }
  const k = korkonfig(b, env);
  if (!k.mail.konfigurerad) { console.error(`✗ Saknar ${k.mail.saknas.join(', ')} i miljön.`); process.exit(1); }
  const klient = new ImapKlient({ host: k.mail.host, port: k.mail.port, user: k.mail.user, pass: k.mail.pass });
  try {
    await klient.anslut();
    await klient.loggaIn();
    const mappar = await klient.lista();
    console.log(`\nMappar i ${k.mail.user} (${k.mail.host}):\n`);
    for (const m of mappar) console.log(`  ${m}`);
    const sent = mappar.find((m) => /sent|skickat|sendt/i.test(m));
    console.log(sent ? `\nSkickat-mappen verkar heta "${sent}" — sätt \`mail.skickat: "${sent}"\` i kundtjanst/brands/${brandId}.yaml om rutinen inte hittar den själv.\n` : '\n⚠️ Ingen mapp som ser ut som Skickat — svarstider går då inte att mäta.\n');
  } finally {
    await klient.stang();
  }
}

if (process.argv[1] && process.argv[1].endsWith('setup.mjs')) {
  if (process.argv.includes('--nytt-konto')) skrivNyttKonto();
  else if (process.argv.includes('--mappar')) listaMappar(process.argv[process.argv.indexOf('--mappar') + 1]).catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
  else {
    const { status } = skrivLaget();
    process.exitCode = status.some((s) => s.klar) ? 0 : 1;
  }
}
