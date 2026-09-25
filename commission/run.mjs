#!/usr/bin/env node
// run.mjs — räknar ihop redigerarnas commission och skriver rapporten.
//
//   node commission/run.mjs                      räkna månaden hittills (alltid)
//   node commission/run.mjs --rutin              schemalagt: kör bara på kördag
//   node commission/run.mjs --manad 2026-07      hela juli i efterhand
//   node commission/run.mjs --jobb <fil.json>    Notion-raderna från MCP-sessionen
//   node commission/run.mjs --torr               räkna och visa, skriv ingen fil
//   node commission/run.mjs --json               maskinläsbart
//   node commission/run.mjs --utan-ops-hubbar    räkna INTE OPS-butikernas hubbar
//   node commission/run.mjs --utan-kommentarer   hoppa över redigerare utan Notion-konto
//
// Kör var tredje dag (1, 4, 7 … 28) plus alltid månadens sista dag.
// Den sista körningen i månaden är slutavräkningen — den som betalas ut.
//
// ⚠️ Rutinen är LÄS-BARA mot både Notion och Meta. Den ändrar ingen status,
// pausar ingenting och skriver ingenting tillbaka till Notion.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { berakna, arSvensk, SATS, arKordag, period, UTLANDSKA_KONTON } from './berakning.mjs';
import { hamtaAllSpend } from './meta.mjs';
import * as Notion from './notion.mjs';
import { opsHubbar, utanOpsHubbar } from '../tools/lib/ops-hubbar.mjs';
import { byggHubbregister, kopplaAnnons } from './koppling.mjs';
import { berikaMedKommentarer } from './kommentarer.mjs';
import { uppdateraLeaderboard, skrivTerminal as skrivLeaderboard } from './leaderboard.mjs';

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
    .map((u) => ({
      id: u.id,
      namn: u.name,
      notionUserId: u.notionUserId || '',
      // Samma person kan bära flera Notion-id:n — t.ex. ett gästkonto som
      // dykt upp i efterhand vid sidan av det syntetiska kommentar-id:t.
      notionUserIdAlias: Array.isArray(u.notionUserIdAlias) ? u.notionUserIdAlias : [],
      roll: u.role,
      // Redigerare utan Notion-konto pekas ut i en kommentar i stället —
      // se commission/kommentarer.mjs.
      kommentarMonster: u.notionKommentarMonster || '',
    }));
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
  rad.push(`Underlag: ${r.koppling?.hubbrader ?? r.godkandaRader} hubbrader med Ansvarig i ${kallor.hubbar.length} creative hub(bar), `
    + `${r.koppling ? `${r.koppling.produkter} produkter som reserv, ` : ''}spend läst ur ${kallor.konton.length} annonskonton.`);
  if (r.kommentarer?.traffar) {
    rad.push('');
    rad.push(`${r.kommentarer.traffar} rader kopplades via **kommentar** i stället för Ansvarig `
      + `(${Object.entries(r.kommentarer.perPerson).map(([n, a]) => `${n}: ${a}`).join(', ')}) — `
      + 'redigerare som inte har något Notion-konto och därför aldrig kan stå i kolumnen Ansvarig.');
  }
  if (kallor.svenskaBara) {
    rad.push('');
    rad.push(`**Endast svenska annonser räknas.** ${kallor.bortfiltrerat} annonser `
      + `(${kallor.bortfiltreradSpend.toFixed(2)} SEK) filtrerades bort: utländska marknadskonton `
      + `(${[...UTLANDSKA_KONTON.values()].join(', ')}) och annonser med marknadskod i namnet.`);
  }
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
    rad.push('| Redigerare | Spend via hubb | Spend via produkt | Spend totalt | Commission |');
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
  if (kallor.svenskaBara) console.log(`Endast svenska annonser — ${kallor.bortfiltrerat} utländska annonser (${kallor.bortfiltreradSpend.toFixed(0)} SEK) borträknade.`);
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
  // Rutinen räknar VARJE dag. Kördagen avgör bara om rapporten sparas som
  // kvitto — inte om siffrorna tas fram. En rutin som svarar "ingen körning
  // i dag" ser ut som en trasig rutin, och Axel ska alltid kunna fråga.
  const kordag = arKordag(datum);
  const sparaRapport = !finns('rutin') || kordag.kor;
  if (!sparaRapport) {
    console.log(`Lägeskoll — ${kordag.skal}. Siffrorna nedan sparas inte som rapport.\n`);
  }

  // --- Notion
  let hubbar; let notionFel = []; let teamspaceVerifierad = false;
  const jobbfil = flagga('jobb');
  if (jobbfil) {
    const jobb = Notion.lasJobbfil(jobbfil);
    // MCP-sessionen som skrev jobbfilen kan ha fått med OPS-butikernas hubbar
    // (samma integration, egna teamspaces). Bort per id, med loggrad.
    hubbar = utanOpsHubbar(jobb.hubbar, opsHubbar());
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

  // OPS-butikernas hubbar hålls utanför Bäverbutikens ÖVRIGA rutiner för att
  // ingenting ska laddas upp i fel annonskonto. Commission är LÄS-BART och har
  // inte det problemet — men spenden i OPS-kontot räknas ändå med, så utan
  // hubbarna föll de annonserna tillbaka på produktens ägare i koppling.mjs och
  // fel person fick betalt.
  //
  // Mätt 2026-09-15 (månaden hittills, två körningar med minuters mellanrum):
  // utan hubbarna Josh 442,36 kr / Jerzee 0,43 kr; med dem Josh 421,55 kr,
  // Jerzee 6,12 kr, Gilz +4,60, Jasper +3,22, Carl +1,09. Alltså ~21 kr som
  // låg på produktens ägare i stället för på den som gjorde annonsen.
  // --utan-ops-hubbar återgår till det gamla beteendet.
  let opsLasta = [];
  if (!finns('utan-ops-hubbar') && Notion.harToken()) {
    const lista = [...opsHubbar().values()].map((o) => ({ id: o.id, namn: o.name }));
    const svar = await Notion.hamtaAllaHubbar({ hubbar: lista });
    opsLasta = svar.hubbar;
    notionFel = [...notionFel, ...svar.fel];
    hubbar = [...hubbar, ...opsLasta];
    console.log(`OPS-hubbar MEDRÄKNADE: ${opsLasta.length} av ${lista.length} `
      + `(${opsLasta.reduce((n, h) => n + h.rader.length, 0)} rader)`);
  }

  // NÖDBROMS. 2026-08-31 hittade rutinen 2 hubbar av 6 — de fyra
  // skalningsprodukternas hubbar är arkiverade i Notion och föll bort ur
  // sökningen — och rapporterade 0 kr som augustis slutavräkning. En
  // utbetalning på noll ska aldrig kunna komma ur en ofullständig läsning.
  // Facit utan OPS-hubbarna (tyst — loggraden kom redan vid uppräkningen),
  // annars kräver nödbromsen hubbar som filtret just tog bort med flit.
  const kanda = utanOpsHubbar([...Notion.hubbarUrFil(), ...Notion.hubbarUrProdukter()], opsHubbar(), { logg: null });
  const lasta = new Set(hubbar.map((h) => String(h.id).replace(/-/g, '')));
  const saknade = kanda.filter((k) => !lasta.has(String(k.id).replace(/-/g, '')));
  if (saknade.length) {
    do_(`Hubbar som products.json känner till saknas i körningen: ${saknade.map((h) => h.namn).join(', ')}.\n`
      + '  De fyra skalningsprodukternas hubbar är ARKIVERADE i Notion och faller bort ur en vanlig sökning.\n'
      + '  Avbryter — en ofullständig läsning får aldrig bli en utbetalning.');
  }
  const medAnsvarig = hubbar.reduce((n, h) => n + (h.rader ?? []).filter((r) => r.ansvariga?.length).length, 0);
  if (!medAnsvarig) {
    do_(`Noll hubbrader med Ansvarig i ${hubbar.length} hubbar. Det är nästan alltid ett läsfel, inte sanningen.\n`
      + '  Avbryter hellre än rapporterar 0 kr till alla. Kontrollera Notion-åtkomsten och kör om.');
  }

  // Redigerare utan Notion-konto (Jerzee) står aldrig i Ansvarig — deras rader
  // pekas ut i en kommentar. Bara rader som saknar Ansvarig kollas, så det blir
  // ett API-anrop per okopplad annonsrad och aldrig en omskrivning av någon
  // annans rad. --utan-kommentarer stänger av steget.
  const personer = laddaPersoner();
  let kommentarer = null;
  if (!finns('utan-kommentarer') && Notion.harToken() && personer.some((x) => x.kommentarMonster)) {
    kommentarer = await berikaMedKommentarer(hubbar, personer);
    console.log(`Kommentarskopplade rader: ${kommentarer.traffar} av ${kommentarer.lasta} lästa `
      + `(${Object.entries(kommentarer.perPerson).map(([n, a]) => `${n} ${a}`).join(', ') || 'ingen'})`
      + `${kommentarer.fel ? ` · ${kommentarer.fel} rader kunde inte läsas` : ''}`);
  }

  // --- Meta
  const { konton, annonser: allaAnnonser, fel: metaFel } = await hamtaAllSpend({ fran: p.fran, till: p.till });

  // Ett annonskonto som tappat ads_read försvinner TYST ur me/adaccounts — inget
  // felmeddelande, bara mindre spend och för lite betalt. Samma spärr som för
  // hubbarna: en ofullständig läsning får aldrig bli en utbetalning.
  // *(Mätt 2026-09-22: token:en nådde 5 konton av 14. SnarkLös svarade "(#200)
  // Ad account owner has NOT grant ads_management or ads_read permission", och
  // Gilz föll 36,62 → 6,80 kr mitt i månaden eftersom hans spend ligger på
  // Mastern. Utan den här spärren hade rapporten sparats som ett riktigt kvitto.)*
  //
  // ⚠️ Spärren skiljer på två sorters saknat konto (2026-09-25). Ett konto i
  // UTLANDSKA_KONTON filtreras bort av `arSvensk` ändå, så att det saknas kan
  // inte ändra en enda krona — det rapporteras, men stoppar inte. Ett SVENSKT
  // konto som saknas ändrar utbetalningen och stoppar körningen. Utan den
  // skillnaden höll fem utlandskonton (NYC Grill, SNarklös FI, Norge,
  // Finland DK, Snark mexico) rapporten gisslan i tre dygn för ingenting.
  const kandaKonton = JSON.parse(readFileSync(`${ROT}/commission/kanda-konton.json`, 'utf8')).konton;
  const nadda = new Set(konton.map((k) => String(k.id)));
  const onadda = kandaKonton.filter((k) => !nadda.has(String(k.id)));
  const saknadeUtlandska = onadda.filter((k) => UTLANDSKA_KONTON.has(String(k.id)));
  const saknadeKonton = onadda.filter((k) => !UTLANDSKA_KONTON.has(String(k.id)));
  if (saknadeUtlandska.length) {
    console.log(`⚠ Utlandskonton som inte gick att läsa: `
      + `${saknadeUtlandska.map((k) => `${k.namn} (${k.id})`).join(', ')}.\n`
      + `  De filtreras bort ur commission ändå (bara svenska annonser betalas),\n`
      + `  så utbetalningen påverkas inte. Körningen fortsätter.`);
  }
  if (saknadeKonton.length && !finns('utan-kontospärr')) {
    do_(`Annonskonton som PÅVERKAR utbetalningen saknas i körningen: `
      + `${saknadeKonton.map((k) => `${k.namn} (${k.id})`).join(', ')}.\n`
      + `  Nådde ${konton.length} av ${kandaKonton.length} kända konton.\n`
      + `  Ett konto försvinner ur me/adaccounts när appen tappat ads_read — spenden finns,\n`
      + `  vi ser den bara inte, och redigerarna får för lite betalt utan att något syns.\n`
      + `  Ge appen ads_read på kontot igen, eller stryk kontot ur commission/kanda-konton.json\n`
      + `  om det är avvecklat med flit. --utan-kontospärr kör ändå (siffrorna blir ofullständiga).`);
  }

  // Bara svenska annonser ger commission. --alla-marknader stänger av filtret.
  const svenskaBara = !finns('alla-marknader');
  const annonser = svenskaBara ? allaAnnonser.filter(arSvensk) : allaAnnonser;
  const bortfiltrerat = allaAnnonser.length - annonser.length;
  const bortfiltreradSpend = allaAnnonser.filter((a) => !annonser.includes(a))
    .reduce((s, a) => s + a.spend, 0);

  // Kopplingen: hubbrad per annons (båda namnsystemen), produkt som reserv.
  const { produkter } = JSON.parse(readFileSync(`${ROT}/commission/produkter.json`, 'utf8'));
  const register = byggHubbregister(hubbar);
  const koppla = (a) => kopplaAnnons(a, register, produkter);

  const rapport = berakna({
    hubbar,
    annonser,
    personer,
    datum,
    sats: Number(flagga('sats', SATS)),
    koppla,
  });
  rapport.koppling = { hubbrader: register.rader, oversattningsrader: register.oversattningar, produkter: produkter.length };
  if (kommentarer) rapport.kommentarer = kommentarer;

  // Namnge okända Ansvariga när Notion går att fråga — ett id säger ingenting.
  if (Notion.harToken()) {
    for (const o of rapport.okandaAnsvariga) {
      Object.assign(o, await Notion.hamtaAnvandare(o.notionUserId));
      o.notionUserId = o.id;
    }
  }

  const kallor = { hubbar, konton, teamspaceVerifierad, svenskaBara, bortfiltrerat, bortfiltreradSpend,
    fel: [...notionFel, ...metaFel] };

  if (finns('json')) {
    console.log(JSON.stringify({ ...rapport, kallor }, null, 2));
    return;
  }

  skrivTerminal(rapport, kallor);

  if (finns('torr')) { console.log('\n[TORR] Ingen rapportfil skriven.'); return; }

  // Leaderboarden uppdateras VARJE körning, också de dagar ingen rapport ska
  // sparas. Rapporten är kvittot på utbetalningen; leaderboarden är dagens
  // läge, och en topplista som står stilla två dagar i sträck är värdelös.
  const leaderboard = await uppdateraLeaderboard(rapport, kallor);
  skrivLeaderboard(leaderboard);
  if (!sparaRapport) { console.log('\nIngen rapportfil — i dag är ingen kördag. Nästa rapport: den 1, 4, 7 … 28 eller månadens sista dag.'); return; }

  const md = skrivRapport(rapport, kallor);
  const bas = `${ROT}/commission/korningar/${p.manad}/${p.till}`;
  mkdirSync(dirname(bas), { recursive: true });
  writeFileSync(`${bas}.md`, md);
  writeFileSync(`${bas}.json`, JSON.stringify({ ...rapport, kallor }, null, 2));
  console.log(`\nRapport: commission/korningar/${p.manad}/${p.till}.md`);
  if (p.heltMatad) console.log('Det här är månadens SLUTAVRÄKNING — summan ovan är den som betalas ut.');
}

main().catch((e) => do_(e.message));
