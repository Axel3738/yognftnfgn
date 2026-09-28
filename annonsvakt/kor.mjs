#!/usr/bin/env node
// annonsvakt/kor.mjs — Annonsvakten: alla annonskonton, varje timme.
//
//   node annonsvakt/kor.mjs                 torrt: läs, döm, visa larmet — skriv inget, posta inget
//   node annonsvakt/kor.mjs --discord       rutinen: posta i Discord (+ Slack om SLACK_WEBHOOK_URL finns), skriv minnet
//   node annonsvakt/kor.mjs --json <fil>    hela resultatet som JSON (går med båda)
//   node annonsvakt/kor.mjs --kolla         nycklar, token:ens rättigheter och kontona — inget mer
//
// Axels beställning 2026-09-27: "en rutin som scannar alla annonskonton …
// efter problem med nedstängda annonser … rädda mig ifall något annonskonto
// blir nedtaget, eller om annonsen blir nedtagen … någon annons som drar åt
// helvete, som tar all spend". Vakten LÄSER bara — den pausar, aktiverar och
// ändrar aldrig något (Axel 2026-09-27: "Axels annonser pausas aldrig av en
// session"). Den säger till; Axel bestämmer.
//
// Flödet: konton (me/adaccounts + facit) → per konto: problemannonser,
// aktiva kampanjer/adsets, dagens insights → reglerna (regler.mjs) →
// minnet avgör vad som är NYTT, PÅMINNELSE, LÖST eller redan sagt → en
// Discord-post bara om det finns något att säga → minnet skrivs (bara om
// det ändrats). Misslyckas posten skrivs inte minnet: då larmas det igen
// nästa timme i stället för att försvinna.
//
// Exit: 0 klart · 1 fel (inget läst, ingen post) · 4 posten misslyckades
// (larmet står i terminalen, minnet är INTE skrivet).

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { säkerställProxy } from '../tools/meta-lib.mjs';
import { skapaKlient, lasKonton, lasKonto, lasRattigheter } from './meta.mjs';
import { bedomKonton, bedomObjekt, bedomSpend, lasfel, sammanfoga, formulera, skapaBreakEvenFor, dagStockholm, timmeStockholm } from './regler.mjs';
import { lasMinne, sparaMinne, likaMinne } from './minne.mjs';
import { postaDiscord, postaSlack } from './posta.mjs';

export const MAPP = dirname(fileURLToPath(import.meta.url));
export const ROT = dirname(MAPP);

const lasJson = (fil, reserv = null) => (existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : reserv);

export function lasKonfig(mapp = MAPP) {
  const fil = join(mapp, 'konfig.json');
  if (!existsSync(fil)) throw new Error(`${fil} saknas`);
  return JSON.parse(readFileSync(fil, 'utf8'));
}

/** Konto-id → verksamheterna som bär det, ur stonebite/varumarken.json. Delade konton får flera. */
export function lasVerksamheter(rot = ROT) {
  const reg = lasJson(join(rot, 'stonebite', 'varumarken.json'), { varumarken: [] });
  const ut = new Map();
  for (const vm of reg.varumarken ?? []) {
    for (const k of vm.konton ?? []) {
      const id = String(k.id);
      if (!ut.has(id)) ut.set(id, { namn: k.namn ?? null, verksamheter: [] });
      if (!ut.get(id).verksamheter.includes(vm.namn)) ut.get(id).verksamheter.push(vm.namn);
    }
  }
  return ut;
}

/** Kontona vakten kräver svar från: registrets + de minnet sett. */
export function facitKonton(verksamheter, minne) {
  const ut = new Map();
  for (const [id, v] of verksamheter) ut.set(id, { id, namn: v.namn });
  for (const [id, k] of Object.entries(minne?.konton ?? {})) if (!ut.has(id)) ut.set(id, { id, namn: k.namn ?? null });
  return [...ut.values()];
}

function lasBreakEvenKallor(rot) {
  const produkter = lasJson(join(rot, 'products', 'products.json'), {})?.products ?? lasJson(join(rot, 'products', 'products.json'), {})?.produkter ?? [];
  const ms = lasJson(join(rot, 'matstrumpor', 'konfig.json'), null);
  return {
    produkter: Array.isArray(produkter) ? produkter : [],
    matstrumpor: ms?.meta?.ad_account_id ? { kontoId: ms.meta.ad_account_id, ekonomi: ms.ekonomi } : null,
  };
}

/**
 * Hela körningen. Allt som rör nät går att byta ut: `klient` (Meta), `sand`
 * (Discord), `sandSlack`. torr = varken minne eller post.
 */
export async function kor({ rot = ROT, mapp = MAPP, env = process.env, nu = new Date(), torr = true, posta = false, klient = null, sand = null, sandSlack = null, logg = (s) => console.error(s) } = {}) {
  const konfig = lasKonfig(mapp);
  const minnesfil = join(mapp, 'minne.json');
  const minne = lasMinne(minnesfil);
  const verksamheter = lasVerksamheter(rot);
  const verksamhetFor = (id) => verksamheter.get(String(id))?.verksamheter.join(' / ') ?? null;
  const facit = facitKonton(verksamheter, minne);
  const datum = dagStockholm(nu);
  const be = lasBreakEvenKallor(rot);
  const breakEvenFor = skapaBreakEvenFor({ ...be, standard: konfig.trosklar?.break_even_standard });
  const k = klient ?? skapaKlient({ token: env.META_ACCESS_TOKEN, logg });

  const lasning = await lasKonton(k, { facit });
  if (lasning.tokenFel) logg(`  ✗ token: ${lasning.tokenFel}`);
  const problem = [...bedomKonton(lasning, { verksamhetFor })];
  const lasta = new Set();
  const kontorader = [];
  if (!lasning.tokenFel) {
    for (const konto of lasning.konton) {
      try {
        const d = await lasKonto(k, konto);
        lasta.add(konto.id);
        const objekt = bedomObjekt({ konto, ...d }, { nu, konfig });
        const spend = bedomSpend({ konto, ...d }, { konfig, datum, breakEvenFor });
        problem.push(...objekt, ...spend);
        const spendIdag = d.idag.reduce((s, r) => s + (Number(r.spend) || 0), 0);
        kontorader.push({ id: konto.id, namn: konto.namn, valuta: konto.valuta, status: konto.account_status, verksamhet: verksamhetFor(konto.id), spendIdag, annonserProblemstatus: d.annonser.length, kampanjerAktiva: d.kampanjer.length, annonserMedSpend: d.idag.length, fynd: objekt.length + spend.length });
        logg(`  ${konto.namn} (${konto.id}): ${Math.round(spendIdag)} ${konto.valuta} i dag · ${d.annonser.length} annonser med problemstatus · ${d.kampanjer.length} aktiva kampanjer · ${objekt.length + spend.length} fynd`);
        if (!minne.konton[konto.id]) minne.konton[konto.id] = { namn: konto.namn, valuta: konto.valuta, forstSedd: datum };
      } catch (e) {
        problem.push(lasfel(konto, e.message));
        kontorader.push({ id: konto.id, namn: konto.namn, valuta: konto.valuta, status: konto.account_status, verksamhet: verksamhetFor(konto.id), fel: e.message });
        logg(`  ⚠️ ${konto.namn} (${konto.id}): ${e.message}`);
      }
    }
  }
  for (const o of lasning.olasta) logg(`  ✗ ${o.namn ?? o.id} (${o.id}): ${o.fel}`);

  const s = sammanfoga({ problem, minne, nu, konfig, lasta: lasning.tokenFel ? null : lasta });
  const nyttMinne = s.minne;
  const hjartslagNu = Boolean(konfig.hjartslag) && nyttMinne.hjartslag !== datum && timmeStockholm(nu) >= Number(konfig.hjartslag.timme ?? 7);
  const hjartslag = hjartslagNu ? { konton: lasta.size, oppna: Object.keys(nyttMinne.oppna).length, olasta: lasning.olasta.length } : null;
  if (hjartslagNu) nyttMinne.hjartslag = datum;
  const post = formulera({ nya: s.nya, paminnelser: s.paminnelser, handelser: s.handelser, losta: s.losta, hjartslag, nu }, konfig);

  const resultat = {
    datum, nu: nu.toISOString(), torr,
    tokenFel: lasning.tokenFel, konton: kontorader, olasta: lasning.olasta,
    problem, nya: s.nya, paminnelser: s.paminnelser, handelser: s.handelser, losta: s.losta, hjartslag,
    text: post?.text ?? null, mentions: post?.mentions ?? [],
    postat: null, slack: null, postFel: null, minneAndrat: !likaMinne(minne, nyttMinne), minneSkrivet: false,
  };
  if (torr) return resultat;

  if (post && posta) {
    try {
      const sandDiscord = sand ?? ((text, mentions) => postaDiscord(text, { konfig, mentions, env }));
      resultat.postat = await sandDiscord(post.text, post.mentions);
      logg(`  Discord ✓ #${resultat.postat?.kanal ?? konfig.kanal?.discord?.kanal} i ${resultat.postat?.server ?? konfig.kanal?.discord?.server}${resultat.postat?.skapad ? ' (kanalen skapades nu)' : ''}`);
    } catch (e) {
      resultat.postFel = e.message;
      logg(`  ✗ Discord: ${e.message}`);
      return resultat; // minnet skrivs inte — larmas igen nästa timme
    }
    const webhook = env[konfig.kanal?.slack?.webhook_env ?? 'SLACK_WEBHOOK_URL'];
    if (webhook) {
      try {
        resultat.slack = await (sandSlack ?? ((text) => postaSlack(text, { url: webhook })))(post.text);
        logg('  Slack ✓');
      } catch (e) {
        resultat.slack = { ok: false, fel: e.message };
        logg(`  ⚠️ Slack: ${e.message} (Discord gick — Slack stoppar inget)`);
      }
    } else {
      resultat.slack = { ok: false, fel: `${konfig.kanal?.slack?.webhook_env ?? 'SLACK_WEBHOOK_URL'} saknas i miljön — bara Discord` };
    }
  }
  if (resultat.minneAndrat) {
    sparaMinne(nyttMinne, minnesfil, { nu });
    resultat.minneSkrivet = true;
  }
  return resultat;
}

// ----------------------------------------------------------------- CLI

function skrivSammanfattning(r, logg = console.log) {
  logg(`\nAnnonsvakten ${r.datum} ${r.nu.slice(11, 16)} UTC${r.torr ? ' (torrt)' : ''}`);
  if (r.tokenFel) logg(`  ✗ TOKEN: ${r.tokenFel}`);
  for (const k of r.konton) logg(k.fel ? `  ⚠️ ${k.namn} (${k.id}): ${k.fel}` : `  ${k.namn.padEnd(18)} ${String(Math.round(k.spendIdag)).padStart(7)} ${k.valuta} i dag · ${k.annonserProblemstatus} annonser med problemstatus · ${k.kampanjerAktiva} aktiva kampanjer · ${k.fynd} fynd`);
  for (const o of r.olasta) logg(`  ✗ ${o.namn ?? o.id} (${o.id}): ${o.fel}`);
  logg(`  fynd totalt ${r.problem.length}: ${r.nya.length} nya tillstånd · ${r.handelser.length} nya händelser · ${r.paminnelser.length} påminnelser · ${r.losta.length} lösta${r.hjartslag ? ' · hjärtslag' : ''}`);
  if (r.text) { logg('\n----- Discord -----'); logg(r.text); logg('-------------------'); } else logg('  inget att posta');
  if (r.postat) logg(`  postat: #${r.postat.kanal} i ${r.postat.server}${r.postat.lank ? ` ${r.postat.lank}` : ''}`);
  if (r.postFel) logg(`  ✗ posten misslyckades: ${r.postFel} — minnet är inte skrivet, larmas igen nästa timme`);
  if (r.slack) logg(`  slack: ${r.slack.ok ? 'postat' : r.slack.fel}`);
  logg(`  minne: ${r.torr ? (r.minneAndrat ? 'hade ändrats (torrt — inte skrivet)' : 'oförändrat') : r.minneSkrivet ? 'ÄNDRAT och skrivet — committa annonsvakt/minne.json' : 'oförändrat'}`);
}

async function kolla(env = process.env) {
  const konfig = lasKonfig();
  console.log(`META_ACCESS_TOKEN: ${env.META_ACCESS_TOKEN ? '✓' : '✗ saknas'}`);
  if (env.META_ACCESS_TOKEN) {
    const k = skapaKlient({ token: env.META_ACCESS_TOKEN });
    try { const r = await lasRattigheter(k); console.log(`  rättigheter: ${r.includes('ads_read') ? '✓' : '✗'} ads_read${r.includes('ads_management') ? ', ads_management' : ''}`); } catch (e) { console.log(`  ✗ ${e.message}`); }
    const minne = lasMinne();
    const l = await lasKonton(k, { facit: facitKonton(lasVerksamheter(), minne) });
    if (l.tokenFel) console.log(`  ✗ token: ${l.tokenFel}`);
    for (const x of l.konton) console.log(`  ✓ ${x.namn} (${x.id}) ${x.valuta} status ${x.account_status}${x.utanforListan ? ' (utanför me/adaccounts-listan)' : ''}`);
    for (const o of l.olasta) console.log(`  ✗ ${o.namn ?? o.id} (${o.id}): ${o.fel}`);
  }
  console.log(`DISCORD_BOT_TOKEN: ${env.DISCORD_BOT_TOKEN ? '✓' : '✗ saknas (larmet står bara i terminalen)'} — #${konfig.kanal.discord.kanal} i ${konfig.kanal.discord.server}`);
  const w = konfig.kanal?.slack?.webhook_env ?? 'SLACK_WEBHOOK_URL';
  console.log(`${w}: ${env[w] ? '✓ (postar även i Slack)' : '– saknas (bara Discord; lägg in den när Slack-kanalen finns)'}`);
}

if (process.argv[1] && /annonsvakt[\\/]kor\.mjs$/.test(process.argv[1])) {
  säkerställProxy();
  const args = process.argv.slice(2);
  const har = (f) => args.includes(`--${f}`);
  const flagga = (f) => { const i = args.indexOf(`--${f}`); return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : null; };
  const jobb = har('kolla')
    ? () => kolla()
    : async () => {
      const r = await kor({ torr: !har('discord'), posta: har('discord') });
      skrivSammanfattning(r);
      const jsonFil = flagga('json');
      if (jsonFil) { mkdirSync(dirname(jsonFil), { recursive: true }); writeFileSync(jsonFil, `${JSON.stringify(r, null, 1)}\n`); console.log(`  → ${jsonFil}`); }
      if (r.postFel) process.exit(4);
    };
  Promise.resolve().then(jobb).catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
