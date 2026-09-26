#!/usr/bin/env node
// hamta.mjs — bygger stonebite/data/snapshot.json: allt dashboarden visar.
//
// Hämtningen och visningen är MED FLIT två olika saker. Shopify och Meta är
// långsamma och strypta; en sida som hämtar vid varje besök hade tagit minuter
// och slagit i Metas kod 17. Därför: en körning skriver en snapshot, servern
// läser bara filen. Sidan visar alltid när datan hämtades.
//
//   node stonebite/hamta.mjs               # allt
//   node stonebite/hamta.mjs --utan-nat    # bara det repot redan vet
//   node stonebite/hamta.mjs --dagar 14    # kortare fönster
//   node stonebite/hamta.mjs --torr        # skriv ingenting, visa bara
//
// Varje källa rapporterar sitt eget läge. En källa som inte gick att läsa blir
// "fel" med orsak — aldrig en nolla som ser ut som ett svar.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { upptackButiker, hamtaAlla as hamtaButiker, hamtaAllaTvister } from './kallor/shopify.mjs';
import { hamtaAllt as hamtaMeta } from './kallor/meta.mjs';
import { hamtaKurser } from './kallor/valuta.mjs';
import { samlaRepo, lasProfil, lasSystem } from './kallor/repo.mjs';
import { rutinlage } from './kallor/rutiner.mjs';
import { hamtaEskalering } from './kallor/discord.mjs';
import { lasSkickade } from './larm.mjs';
import { kor as korBonus, lasPersoner, lasRegler } from '../bonus/kor.mjs';
import { samlaAutosvar } from '../kundtjanst/dashboard.mjs';
import { readFileSync } from 'node:fs';

/** Varumärkesregistret (stonebite/varumarken.json). Tom lista om filen saknas. */
export function lasVarumarken(rot = ROT) {
  try {
    return JSON.parse(readFileSync(join(rot, 'stonebite', 'varumarken.json'), 'utf8')).varumarken ?? [];
  } catch {
    return [];
  }
}

export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const SNAPSHOT = join(ROT, 'stonebite', 'data', 'snapshot.json');

function flagga(argv, namn, standard = null) {
  const i = argv.indexOf(namn);
  if (i === -1) return standard;
  const v = argv[i + 1];
  return v && !v.startsWith('--') ? v : true;
}

export async function byggSnapshot({
  rot = ROT, dagar = 30, utanNat = false, env = process.env, nu = new Date(), logg = console.log,
} = {}) {
  const kallor = [];
  const anteckna = (id, status, orsak = null, extra = {}) => kallor.push({ id, status, orsak, tid: new Date().toISOString(), ...extra });

  logg('Repot …');
  const repo = samlaRepo(rot);
  anteckna('repo:redigerare', repo.redigerare.status, repo.redigerare.orsak);
  anteckna('repo:kundtjanst', repo.kundtjanst.status, repo.kundtjanst.orsak);
  anteckna('repo:leverans', repo.leverans.status, repo.leverans.orsak);
  anteckna('repo:nattvakten', repo.budgetlogg.status, repo.budgetlogg.orsak);

  let butiker = [];
  let annonskonton = [];
  let tvisterLive = null;

  if (utanNat) {
    anteckna('shopify', 'hoppad', 'kördes med --utan-nat');
    anteckna('meta', 'hoppad', 'kördes med --utan-nat');
  } else {
    logg('Shopify …');
    const upptackta = upptackButiker(rot);
    logg(`  ${upptackta.length} butiker upptäckta`);
    butiker = await hamtaButiker(upptackta, { dagar, env, nu, logg });
    // Avstängda med flit (stonebite/butiker-av.json) är varken lästa eller trasiga.
    const avstangda = butiker.filter((b) => b.status === 'av');
    const aktiva = butiker.filter((b) => b.status !== 'av');
    const trasiga = aktiva.filter((b) => b.status !== 'ok');
    anteckna('shopify', trasiga.length === aktiva.length && aktiva.length ? 'fel' : 'ok',
      trasiga.length ? `${trasiga.length} av ${aktiva.length} butiker gick inte att läsa` : null,
      { butiker: aktiva.length, avstangda: avstangda.length });

    // Tvisterna direkt ur Shopify, varje hämtning. Veckorapporten är bara
    // reserv för en butik Shopify inte svarar för (bonus/kallor.mjs
    // slaIhopTvister) — en tvist har en deadline, en vecka gammal lista ljuger.
    logg('Shopify-tvister …');
    try {
      tvisterLive = await hamtaAllaTvister(upptackta, { env, nu, logg });
      anteckna('shopify:tvister', tvisterLive.status, tvisterLive.orsak,
        { butiker: tvisterLive.butiker.length, oppna: tvisterLive.lista.filter((x) => x.oppen).length });
    } catch (e) {
      anteckna('shopify:tvister', 'fel', e.message);
    }

    logg('Meta …');
    if (!env.META_ACCESS_TOKEN) {
      anteckna('meta', 'saknas', 'META_ACCESS_TOKEN saknas i miljön');
    } else {
      try {
        annonskonton = await hamtaMeta({ dagar, preset: 'last_7d', env, logg, extraIds: lasVarumarken(rot).flatMap((v) => (v.konton ?? []).map((k) => k.id)) });
        const trasigaKonton = annonskonton.filter((k) => k.status !== 'ok');
        anteckna('meta', trasigaKonton.length === annonskonton.length && annonskonton.length ? 'fel' : 'ok',
          trasigaKonton.length ? `${trasigaKonton.length} av ${annonskonton.length} konton gick inte att läsa` : null,
          { konton: annonskonton.length });
      } catch (e) {
        anteckna('meta', 'fel', e.message);
      }
    }
  }

  // Växelkurserna (ECB) — bara för MER per verksamhet, där försäljning i
  // NOK/DKK/EUR ställs mot reklam i SEK. Sidan visar kursens datum.
  let valutakurser = { status: 'hoppad', orsak: 'kördes med --utan-nat' };
  if (!utanNat) {
    logg('Växelkurser …');
    valutakurser = await hamtaKurser({ nu });
    anteckna('valuta', valutakurser.status, valutakurser.orsak, { datum: valutakurser.datum ?? null });
    if (valutakurser.status === 'ok') logg(`  ECB ${valutakurser.datum}: 1 EUR = ${valutakurser.sekPer.EUR} SEK · 1 NOK = ${valutakurser.sekPer.NOK} SEK · 1 DKK = ${valutakurser.sekPer.DKK} SEK`);
  } else {
    anteckna('valuta', 'hoppad', 'kördes med --utan-nat');
  }

  // Rutinvakten: git-loggen mot schemat. Inget nät — bara spåren.
  logg('Rutinerna …');
  const rutiner = rutinlage(rot, { nu });
  anteckna('rutiner', rutiner.status, rutiner.orsak, rutiner.summering ?? {});
  if (rutiner.summering) logg(`  ${rutiner.summering.ok} ok · ${rutiner.summering.sen} sena · ${rutiner.summering.saknas} saknas · ${rutiner.summering.avstangd} avstängda · ${rutiner.summering.omatbar} omätbara`);

  // Eskaleringskanalerna: de senaste meddelandena per varumärke ur Discord.
  const varumarken = lasVarumarken(rot);
  let eskalering = { status: 'hoppad', orsak: 'kördes med --utan-nat', kanaler: [] };
  if (!utanNat) {
    logg('Discord …');
    eskalering = await hamtaEskalering(varumarken, { env, logg });
    anteckna('discord', eskalering.status, eskalering.orsak, { kanaler: eskalering.kanaler.length });
  } else {
    anteckna('discord', 'hoppad', 'kördes med --utan-nat');
  }

  // Bonusen räknas här, inte i vyn: den läser Judge.me och Notion, och det
  // ska hända EN gång per hämtning — inte vid varje sidvisning.
  logg('Bonus …');
  let bonus = null;
  let detaljer = { recensioner: null, produkttest: null, tvister: [], insatser: [] };
  try {
    const utfall = await korBonus({ utanNat, rot, env, nu, logg: (t) => logg(t), tvisterLive });
    detaljer = utfall.detaljer ?? detaljer;
    const { detaljer: _, ...kvitto } = utfall;
    bonus = kvitto;
    anteckna('bonus', 'ok', null, { personer: utfall.personer.filter((p) => p.summa > 0).length });
  } catch (e) {
    anteckna('bonus', 'fel', e.message);
  }

  // Autosvaret (kundtjanst/autosvar.mjs): loggen i repot, 30 dagar, talen är
  // oversikt.mjs:s — aldrig omräknade här. Ingen logg ⇒ boten har inte kört
  // för någon butik, och sidan säger det i stället för att visa noll.
  logg('Autosvaret …');
  let autosvar = null;
  try {
    autosvar = samlaAutosvar({ loggmapp: join(rot, 'kundtjanst', 'autosvar', 'logg'), nu });
    const ids = Object.keys(autosvar.brands);
    anteckna('autosvar', ids.length ? 'ok' : 'saknas', ids.length ? null : 'ingen logg i kundtjanst/autosvar/logg/ — autosvaret har inte kört för någon butik', { butiker: ids.length });
    for (const id of ids) {
      const a = autosvar.brands[id].antal;
      logg(`  ${id}: ${a.mejl} mejl · ${a.svar} skickade · ${a.utkast} utkast · ${a.ARG} arga · senaste körning ${autosvar.brands[id].senasteKorning ?? '–'}`);
    }
  } catch (e) {
    anteckna('autosvar', 'fel', e.message);
  }

  return {
    byggd: new Date().toISOString(),
    fonster: { dagar, till: nu.toISOString() },
    profil: lasProfil(rot),
    system: lasSystem(rot),
    varumarken,
    rutiner,
    eskalering,
    kallor,
    butiker,
    annonskonton,
    valutakurser,
    bonus,
    bonusProgram: (() => { try { return lasRegler(join(rot, 'bonus', 'regler.json')); } catch { return null; } })(),
    personer: (() => { try { return lasPersoner(join(rot, 'bonus', 'personer.json')); } catch { return []; } })(),
    recensioner: detaljer.recensioner,
    produkttest: detaljer.produkttest,
    oppnaTvister: detaljer.tvister,
    // Läget per butik för tvisterna (utan listan — den står i oppnaTvister).
    // null ⇒ Shopify lästes inte i den här körningen (--utan-nat).
    tvister: tvisterLive ? (({ lista: _, ...rest }) => rest)(tvisterLive) : null,
    insatser: detaljer.insatser,
    // Pingarna till VA:n (stonebite/larm.mjs skriver minnet EFTER hämtningen,
    // så det som syns här är förra körningens) — sidan visar dem per varumärke.
    larm: lasSkickade(rot),
    // Autosvarets läge per butik (arga kunder, utkast/skickat, senaste körning).
    autosvar,
    ...repo,
  };
}

export function sparaSnapshot(snapshot, fil = SNAPSHOT) {
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, `${JSON.stringify(snapshot, null, 1)}\n`);
  return fil;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const argv = process.argv.slice(2);
  const dagar = Number(flagga(argv, '--dagar', 30)) || 30;
  const utanNat = argv.includes('--utan-nat');
  const torr = argv.includes('--torr');

  const t0 = Date.now();
  const snapshot = await byggSnapshot({ dagar, utanNat });
  const sekunder = Math.round((Date.now() - t0) / 1000);

  console.log('\nKällor:');
  for (const k of snapshot.kallor) {
    const ikon = k.status === 'ok' ? '✅' : k.status === 'hoppad' ? '⏭️ ' : k.status === 'saknas' ? '⚠️ ' : '❌';
    console.log(`  ${ikon} ${k.id}${k.orsak ? ` — ${k.orsak}` : ''}`);
  }
  if (torr) {
    console.log(`\n--torr: inget skrevs. ${sekunder}s.`);
  } else {
    const fil = sparaSnapshot(snapshot);
    console.log(`\nSkrev ${fil} på ${sekunder}s.`);
  }
}
