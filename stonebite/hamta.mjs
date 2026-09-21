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
import { upptackButiker, hamtaAlla as hamtaButiker } from './kallor/shopify.mjs';
import { hamtaAllt as hamtaMeta } from './kallor/meta.mjs';
import { samlaRepo, lasProfil, lasSystem } from './kallor/repo.mjs';
import { kor as korBonus, lasPersoner, lasRegler } from '../bonus/kor.mjs';

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

  if (utanNat) {
    anteckna('shopify', 'hoppad', 'kördes med --utan-nat');
    anteckna('meta', 'hoppad', 'kördes med --utan-nat');
  } else {
    logg('Shopify …');
    const upptackta = upptackButiker(rot);
    logg(`  ${upptackta.length} butiker upptäckta`);
    butiker = await hamtaButiker(upptackta, { dagar, env, nu, logg });
    const trasiga = butiker.filter((b) => b.status !== 'ok');
    anteckna('shopify', trasiga.length === butiker.length && butiker.length ? 'fel' : 'ok',
      trasiga.length ? `${trasiga.length} av ${butiker.length} butiker gick inte att läsa` : null,
      { butiker: butiker.length });

    logg('Meta …');
    if (!env.META_ACCESS_TOKEN) {
      anteckna('meta', 'saknas', 'META_ACCESS_TOKEN saknas i miljön');
    } else {
      try {
        annonskonton = await hamtaMeta({ dagar, preset: 'last_7d', env, logg });
        const trasigaKonton = annonskonton.filter((k) => k.status !== 'ok');
        anteckna('meta', trasigaKonton.length === annonskonton.length && annonskonton.length ? 'fel' : 'ok',
          trasigaKonton.length ? `${trasigaKonton.length} av ${annonskonton.length} konton gick inte att läsa` : null,
          { konton: annonskonton.length });
      } catch (e) {
        anteckna('meta', 'fel', e.message);
      }
    }
  }

  // Bonusen räknas här, inte i vyn: den läser Judge.me och Notion, och det
  // ska hända EN gång per hämtning — inte vid varje sidvisning.
  logg('Bonus …');
  let bonus = null;
  let detaljer = { recensioner: null, produkttest: null, tvister: [], insatser: [] };
  try {
    const utfall = await korBonus({ utanNat, rot, env, nu, logg: (t) => logg(t) });
    detaljer = utfall.detaljer ?? detaljer;
    const { detaljer: _, ...kvitto } = utfall;
    bonus = kvitto;
    anteckna('bonus', 'ok', null, { personer: utfall.personer.filter((p) => p.summa > 0).length });
  } catch (e) {
    anteckna('bonus', 'fel', e.message);
  }

  return {
    byggd: new Date().toISOString(),
    fonster: { dagar, till: nu.toISOString() },
    profil: lasProfil(rot),
    system: lasSystem(rot),
    kallor,
    butiker,
    annonskonton,
    bonus,
    bonusProgram: (() => { try { return lasRegler(join(rot, 'bonus', 'regler.json')); } catch { return null; } })(),
    personer: (() => { try { return lasPersoner(join(rot, 'bonus', 'personer.json')); } catch { return []; } })(),
    recensioner: detaljer.recensioner,
    produkttest: detaljer.produkttest,
    oppnaTvister: detaljer.tvister,
    insatser: detaljer.insatser,
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
