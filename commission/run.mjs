#!/usr/bin/env node
// run.mjs — räknar ihop redigerarnas commission och skriver rapporten.
//
//   node commission/run.mjs                      räkna månaden hittills (alltid)
//   node commission/run.mjs --rutin              schemalagt: kör bara på kördag
//   node commission/run.mjs --manad 2026-07      hela juli i efterhand
//   node commission/run.mjs --jobb <fil.json>    Notion-raderna från MCP-sessionen
//   node commission/run.mjs --torr               räkna och visa, skriv ingen fil
//   node commission/run.mjs --json               maskinläsbart
//
// Kör var tredje dag (1, 4, 7 … 28) plus alltid månadens sista dag.
// Den sista körningen i månaden är slutavräkningen — den som betalas ut.
//
// ⚠️ Rutinen är LÄS-BARA mot både Notion och Meta. Den ändrar ingen status,
// pausar ingenting och skriver ingenting tillbaka till Notion.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { berakna, SATS, arKordag, period } from './berakning.mjs';
import { hamtaAllSpend } from './meta.mjs';
import * as Notion from './notion.mjs';

const ROT = resolve(new URL('..', import.meta.url).pathname);
const args = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
};
const finns = (n) => args.includes(`--${n}`);
const do_ = (m) => { console.error(`✗ ${m}`); process.exit(1); };

// ------------------------------------------------------------------ Personer

/** Personerna bor i dashboard/data/team.json — en enda sanning i repot.
 *  En Ansvarig utan `notionUserId` där kan inte få betalt; det syns i rapporten. */
function laddaPersoner() {
  const { users } = JSON.parse(readFileSync(`${ROT}/dashboard/data/team.json`, 'utf8'));
  return users
    .filter((u) => u.active !== false)
    .map((u) => ({ id: u.id, namn: u.name, notionUserId: u.notionUserId || '', roll: u.role }));
}

// ------------------------------------------------------------------ Perioden

function bestamPeriod() {
  const manad = flagga('manad');
  if (manad) {
    if (!/^\d{4}-\d{2}$/.test(manad)) do_('--manad ska vara YYYY-MM.');
    const [ar, m] = manad.split('-').map(Number);
    const sista = new Date(Date.UTC(ar, m, 0));
    return { datum: sista, ...period(sista) };
  }
  const dag = flagga('datum');
  if (dag && !/^\d{4}-\d{2}-\d{2}$/.test(dag)) do_('--datum ska vara YYYY-MM-DD.');
  const datum = dag ? new Date(`${dag}T12:00:00Z`) : new Date();
  return { datum, ...period(datum) };
}

// ------------------------------------------------------------------ Rapporten

const belopp = (karta, valuta = 'SEK') => (karta?.[valuta] ?? 0).toFixed(2);
const allaValutor = (karta) => Object.entries(karta ?? {})
  .filter(([, v]) => v)
  .map(([v, b]) => `${b.toFixed(2)} ${v}`)
  .join(' + ') || '—';

function skrivRapport(r, kallor) {
  const rad = [];
  const p = r.period;
  const satsText = `${(r.sats * 100).toFixed(1).replace('.', ',')} %`;
  rad.push(`# Commission ${p.manad} — redigerarnas ${satsText} av spenden`);
  rad.push('');
  rad.push(`Period: **${p.fran} – ${p.till}**${p.heltMatad ? ' (hela månaden — slutavräkning)' : ' (månaden hittills)'}`);
  rad.push(`Körd: ${r.kord} · sats ${satsText} · ${r.kordag.skal}`);
  rad.push('');
  rad.push(`Underlag: ${r.godkandaRader} godkända annonsrader i ${kallor.hubbar.length} creative hub(bar), `
    + `spend läst ur ${kallor.konton.length} annonskonton.`);
  if (!kallor.teamspaceVerifierad) {
    rad.push('');
    rad.push('> ⚠️ Hubbarna hittades via REST-sök, inte via teamspacet Bäverbutiken '
      + '(Notion-MCP:n saknades i körningen). Kontrollera listan under "Källor" innan utbetalning.');
  }
  rad.push('');

  rad.push('## Att betala ut');
  rad.push('');
  if (!r.redigerare.length) {
    rad.push('_Ingen redigerare har godkända rader med spend i perioden._');
  } else {
    rad.push('| Redigerare | Spend (exakt) | Spend (översatt) | Spend totalt | Commission |');
    rad.push('|---|---:|---:|---:|---:|');
    for (const e of r.redigerare) {
      rad.push(`| ${e.namn} | ${allaValutor(e.exakt)} | ${allaValutor(e.variant)} | ${allaValutor(e.spend)} | **${allaValutor(e.commission)}** |`);
    }
    rad.push(`| **Summa** | | | ${allaValutor(r.totalt.spend)} | **${allaValutor(r.totalt.commission)}** |`);
  }
  rad.push('');

  rad.push('## Spend som inte betalas ut');
  rad.push('');
  rad.push('| Post | Spend | Skulle ge | Varför |');
  rad.push('|---|---:|---:|---|');
  rad.push(`| Godkända rader utan Ansvarig | ${allaValutor(r.utanMottagare.spend)} | ${allaValutor(r.utanMottagare.commission)} | Ingen är satt som Ansvarig i Notion |`);
  for (const e of r.ejRedigerare) {
    rad.push(`| ${e.namn} (${e.roll}) | ${allaValutor(e.spend)} | ${allaValutor(e.commission)} | Inte redigerare |`);
  }
  for (const o of r.okandaAnsvariga) {
    rad.push(`| Okänd Notion-användare ${o.namn ? `${o.namn} ` : ''}\`${o.notionUserId}\` | ${allaValutor(o.spend)} | ${allaValutor(o.commission)} | Saknar \`notionUserId\` i \`dashboard/data/team.json\` |`);
  }
  for (const k of r.konflikter) {
    rad.push(`| Namnkonflikt "${k.namn}" | ${k.spend.toFixed(2)} | — | Samma annonsnamn godkänt i flera hubbar med olika Ansvarig |`);
  }
  rad.push('');

  if (r.okandaAnsvariga.length) {
    rad.push('### Åtgärd: okända Ansvariga');
    rad.push('');
    rad.push('De här Notion-användarna står som Ansvarig på godkända rader men finns inte i '
      + '`dashboard/data/team.json`. Lägg in dem med rätt `notionUserId` och `role`, så kommer '
      + 'deras spend med nästa körning.');
    rad.push('');
    for (const o of r.okandaAnsvariga) {
      rad.push(`- \`${o.notionUserId}\`${o.namn ? ` — ${o.namn}` : ''} · ${allaValutor(o.spend)} · rader: ${o.rader.slice(0, 6).join(', ')}${o.rader.length > 6 ? ` … (+${o.rader.length - 6})` : ''}`);
    }
    rad.push('');
  }

  rad.push('## Annonserna bakom siffrorna');
  rad.push('');
  for (const e of r.redigerare) {
    rad.push(`### ${e.namn} — ${allaValutor(e.commission)}`);
    rad.push('');
    rad.push('| Annons | Konto | Hubb | Match | Spend |');
    rad.push('|---|---|---|---|---:|');
    for (const a of [...e.annonser].sort((x, y) => y.spend - x.spend)) {
      rad.push(`| ${a.adNamn} | ${a.konto.namn} | ${a.hubb} | ${a.typ === 'variant' ? 'översättning' : 'exakt'} | ${a.spend.toFixed(2)} ${a.konto.valuta} |`);
    }
    rad.push('');
  }

  rad.push('## Källor');
  rad.push('');
  rad.push('**Creative hubs:**');
  for (const h of kallor.hubbar) rad.push(`- ${h.namn} — ${(h.rader ?? []).length} rader`);
  rad.push('');
  rad.push('**Annonskonton:**');
  for (const k of kallor.konton) rad.push(`- ${k.namn} (${k.id}) · ${k.valuta}`);
  if (kallor.fel.length) {
    rad.push('');
    rad.push('**⚠️ Källor som inte gick att läsa** — siffrorna ovan är därför ofullständiga:');
    for (const f of kallor.fel) rad.push(`- ${f.konto ?? f.hubb}: ${f.fel}`);
  }
  rad.push('');
  rad.push(`Godkända rader utan spend i perioden: ${r.raderUtanSpend.length}. `
    + `Annonser med spend som saknar godkänd Notion-rad: ${r.annonserUtanGodkandRad.antal} `
    + `(${allaValutor(r.annonserUtanGodkandRad.spend)}).`);
  rad.push('');
  return rad.join('\n');
}

function skrivTerminal(r, kallor) {
  const p = r.period;
  console.log(`\nCommission ${p.manad}  ·  ${p.fran} – ${p.till}${p.heltMatad ? '  (SLUTAVRÄKNING)' : '  (månaden hittills)'}`);
  console.log(`${(r.sats * 100).toFixed(1).replace('.', ',')} % av spenden · ${r.godkandaRader} godkända rader · ${kallor.konton.length} annonskonton\n`);
  if (!r.redigerare.length) console.log('  (ingen redigerare med spend i perioden)');
  for (const e of r.redigerare) {
    console.log(`  ${e.namn.padEnd(22)} ${allaValutor(e.spend).padStart(16)} spend  →  ${allaValutor(e.commission)}`);
  }
  console.log(`  ${'SUMMA'.padEnd(22)} ${allaValutor(r.totalt.spend).padStart(16)} spend  →  ${allaValutor(r.totalt.commission)}`);
  console.log('');
  if (Object.keys(r.utanMottagare.spend).length) {
    console.log(`  ⚠ ${allaValutor(r.utanMottagare.spend)} på godkända rader UTAN Ansvarig — ingen får de ${allaValutor(r.utanMottagare.commission)}.`);
  }
  for (const o of r.okandaAnsvariga) {
    console.log(`  ⚠ Okänd Notion-användare ${o.notionUserId}${o.namn ? ` (${o.namn})` : ''}: ${allaValutor(o.spend)} — lägg in i team.json.`);
  }
  for (const k of r.konflikter) console.log(`  ⚠ Namnkonflikt "${k.namn}" — ${k.spend.toFixed(2)} betalas inte ut.`);
  for (const f of kallor.fel) console.log(`  ✗ ${f.konto ?? f.hubb}: ${f.fel}`);
}

// ---------------------------------------------------------------------- Main

async function main() {
  const { datum, ...p } = bestamPeriod();
  // Kalenderspärren gäller BARA den schemalagda rutinen (--rutin). Kör Axel
  // kommandot för hand ska han alltid få siffror — annars ser en handkörning
  // en icke-kördag ut som att rutinen är trasig.
  const kordag = arKordag(datum);
  if (finns('rutin') && !kordag.kor) {
    console.log(`Ingen körning i dag: ${kordag.skal}.`);
    console.log('Kördagar är den 1, 4, 7 … 28 plus månadens sista dag.');
    return;
  }

  // --- Notion
  let hubbar; let notionFel = []; let teamspaceVerifierad = false;
  const jobbfil = flagga('jobb');
  if (jobbfil) {
    const jobb = Notion.lasJobbfil(jobbfil);
    hubbar = jobb.hubbar;
    teamspaceVerifierad = Boolean(jobb.teamspace);
  } else if (Notion.harToken()) {
    const svar = await Notion.hamtaAllaHubbar();
    hubbar = svar.hubbar;
    notionFel = svar.fel;
  } else {
    do_('Varken --jobb <fil> eller NOTION_TOKEN finns. Utan Notion-raderna går ingen commission att räkna — '
      + 'kör steg 1 i /commission (MCP) eller sätt NOTION_TOKEN i miljön.');
  }
  if (!hubbar.length) do_('Inga creative hubs kunde läsas. Avbryter hellre än rapporterar 0 kr till alla.');

  // --- Meta
  const { konton, annonser, fel: metaFel } = await hamtaAllSpend({ fran: p.fran, till: p.till });

  const rapport = berakna({
    hubbar,
    annonser,
    personer: laddaPersoner(),
    datum,
    sats: Number(flagga('sats', SATS)),
  });

  // Namnge okända Ansvariga när Notion går att fråga — ett id säger ingenting.
  if (Notion.harToken()) {
    for (const o of rapport.okandaAnsvariga) {
      Object.assign(o, await Notion.hamtaAnvandare(o.notionUserId));
      o.notionUserId = o.id;
    }
  }

  const kallor = { hubbar, konton, teamspaceVerifierad, fel: [...notionFel, ...metaFel] };

  if (finns('json')) {
    console.log(JSON.stringify({ ...rapport, kallor }, null, 2));
    return;
  }

  skrivTerminal(rapport, kallor);

  if (finns('torr')) { console.log('\n[TORR] Ingen rapportfil skriven.'); return; }

  const md = skrivRapport(rapport, kallor);
  const bas = `${ROT}/commission/korningar/${p.manad}/${p.till}`;
  mkdirSync(dirname(bas), { recursive: true });
  writeFileSync(`${bas}.md`, md);
  writeFileSync(`${bas}.json`, JSON.stringify({ ...rapport, kallor }, null, 2));
  console.log(`\nRapport: commission/korningar/${p.manad}/${p.till}.md`);
  if (p.heltMatad) console.log('Det här är månadens SLUTAVRÄKNING — summan ovan är den som betalas ut.');
}

main().catch((e) => do_(e.message));
