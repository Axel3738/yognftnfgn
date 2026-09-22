#!/usr/bin/env node
// rapportsida.mjs — kundtjänstens hemsida: bakar in datan och skriver den
// publicerbara filen.
//
// Sidan är ett ARBETSVERKTYG för VA:n, inte en rapport: läget, vad som ska
// göras, arbetskön, tvisterna med deadline. Datan kommer ur
// `korningar/<brand>/<vecka>.json` som run.mjs skriver vid varje körning
// (dashboard.mjs) — sidan räknar aldrig om något, så den och rapporten kan
// inte säga olika saker.
//
//   node kundtjanst/rapportsida.mjs               bygg kundtjanst/rapport-publicerad.html
//   node kundtjanst/rapportsida.mjs --url <länk>  spara sidans fasta länk (en gång)
//
// Publiceringen görs av rutinen med Artifact-verktyget mot SAMMA url varje
// gång (länken står i kundtjanst/rapportsida.json) — utan url blir det en ny
// sida med en ny länk, och den Axel har sparad slutar uppdateras.
//
// Ingen runtime-capability på sidan (samma regel som topplistan): datan ligger
// inbakad, så länken funkar för den som inte har ett Claude-konto.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { samlaDashboard, brevladaRad, samlaTvister } from './dashboard.mjs';
import { maskeraText } from './maskera.mjs';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const MALL = join(ROT, 'kundtjanst', 'rapport-sida.html');
export const UT = join(ROT, 'kundtjanst', 'rapport-publicerad.html');
export const URLFIL = join(ROT, 'kundtjanst', 'rapportsida.json');
export const HANDBOKFIL = join(ROT, 'kundtjanst', 'handbok.json');
export const SNAPSHOTFIL = join(ROT, 'stonebite', 'data', 'snapshot.json');

export function lasHandbok(fil = HANDBOKFIL) {
  if (!existsSync(fil)) return null;
  try { const { kommentar: _, ...resten } = JSON.parse(readFileSync(fil, 'utf8')); return resten; } catch { return null; }
}

/** Sajtens snapshot — källa 1 för tvisterna (oppnaTvister). null när den saknas. */
export function lasSnapshot(fil = SNAPSHOTFIL) {
  if (!existsSync(fil)) return null;
  try { return JSON.parse(readFileSync(fil, 'utf8')); } catch { return null; }
}

/**
 * Tvistkollen som källa 2: `node kundtjanst/tvistkoll.mjs --alla --torr --json`.
 * ⚠️ `--torr` är inbyggt här och går inte att ta bort — utan det postas larmet
 * i Discord igen och VA:n får samma larm två gånger (det hände 2026-09-21).
 * Verktyget svarar med exit 1 när inget brand kunde läsas; JSON:en står ändå
 * på stdout, så den läses oavsett exitkod. `kor` byts ut i tester.
 */
export const TVISTKOLL_ARGS = Object.freeze(['kundtjanst/tvistkoll.mjs', '--alla', '--torr', '--json']);

export async function korTvistkoll({ rot = ROT, env = process.env, kor = null, nu = new Date() } = {}) {
  const args = [...TVISTKOLL_ARGS];
  let stdout = '';
  try {
    if (kor) stdout = await kor(args);
    else {
      stdout = await new Promise((los, fall) => {
        execFile(process.execPath, args, { cwd: rot, env, maxBuffer: 16 * 1024 * 1024, timeout: 240_000 }, (fel, ut) => {
          // exit 1 = "inget brand kunde läsas" — JSON:en finns ändå. Bara ett tomt stdout är ett riktigt fel.
          if (fel && !String(ut ?? '').trim()) fall(fel); else los(String(ut ?? ''));
        });
      });
    }
    const start = stdout.indexOf('[');
    if (start === -1) throw new Error('tvistkoll gav ingen JSON på stdout');
    let slut = stdout.lastIndexOf(']');
    let lista = null;
    while (slut > start) {
      try { lista = JSON.parse(stdout.slice(start, slut + 1)); break; } catch { slut = stdout.lastIndexOf(']', slut - 1); }
    }
    if (!Array.isArray(lista)) throw new Error('tvistkoll-JSON gick inte att tolka');
    return { status: 'ok', hamtad: nu.toISOString(), orsak: null, brands: lista };
  } catch (e) {
    return { status: 'fel', hamtad: nu.toISOString(), orsak: String(e?.message ?? e).slice(0, 300), brands: [] };
  }
}

/** Bakar in datan i mallen. `</script` i datan bryts så sidan inte kan gå sönder. */
export function byggSida({ mall = MALL, ut = UT, data } = {}) {
  const html = readFileSync(mall, 'utf8');
  if (!html.includes('__DATA__')) throw new Error('Mallen saknar platshållaren __DATA__.');
  const json = JSON.stringify(data ?? samlaDashboard()).replace(/<\//g, '<\\/');
  writeFileSync(ut, html.replace('__DATA__', () => json));
  return ut;
}

export function lasUrl(fil = URLFIL) {
  if (!existsSync(fil)) return null;
  try { return JSON.parse(readFileSync(fil, 'utf8')).url ?? null; } catch { return null; }
}

export function sparaUrl(url, fil = URLFIL) {
  writeFileSync(fil, `${JSON.stringify({ url, sparad: new Date().toISOString().slice(0, 10) }, null, 2)}\n`);
}

/**
 * VA:ns kö LIVE ur brevlådan: mejlen i VA-mappen (INBOX.VA-PRIO) för varje
 * butik som har en autosvarslogg. Läs-bara — EN listning, sedan utloggning;
 * inget markeras som läst, flyttas eller raderas (Brevlada.lista kan inte
 * ens). Utan nyckel i miljön står orsaken där talet skulle ha stått, och
 * sidan visar orsaken i stället för en nolla. `konfigFor`/`oppna` byts ut i
 * tester så inget nät behövs.
 */
export async function hamtaVaKo(autosvar, { env = process.env, oppna = null, konfigFor = null, logg = () => {}, nu = new Date() } = {}) {
  const ids = Object.keys(autosvar?.brands ?? {});
  if (!ids.length) return autosvar;
  let konfig = konfigFor;
  if (!konfig) {
    const { upptackBrands, korkonfig } = await import('./brands.mjs');
    const alla = upptackBrands();
    konfig = (id) => {
      const b = alla.find((x) => x.id === id);
      if (!b) return { finns: false };
      const k = korkonfig(b, env);
      return { finns: true, konfigurerad: Boolean(k.mail?.konfigurerad), saknas: k.mail?.saknas ?? [], vaMapp: k.svar?.va_mapp || b.svar?.va_mapp || 'VA-PRIO' };
    };
  }
  const oppnaBrev = oppna ?? (await import('./brevlada.mjs')).oppnaBrevlada;

  for (const id of ids) {
    const o = autosvar.brands[id];
    const k = konfig(id) ?? { finns: false };
    const mapp = k.vaMapp || 'VA-PRIO';
    if (!k.finns) { o.brevlada = { status: 'saknas', mapp, orsak: `no brand file for "${id}" — the mailbox cannot be located` }; continue; }
    if (!k.konfigurerad) { o.brevlada = { status: 'saknas', mapp, orsak: `mailbox key not set in this environment (${(k.saknas ?? []).join(', ') || 'KUNDTJANST_MAIL_PASS_<ID>'})` }; continue; }
    let brevlada = null;
    try {
      brevlada = oppnaBrev(id, { env, logg });
      const svar = await brevlada.lista({ mapp, antal: 50 });
      o.brevlada = {
        status: 'ok', mapp: svar.mapp ?? mapp, totalt: Number(svar.totalt ?? svar.rader?.length ?? 0),
        olasta: Number.isFinite(Number(svar.olasta)) ? Number(svar.olasta) : null,
        hamtad: nu.toISOString(), rader: (svar.rader ?? []).map(brevladaRad),
      };
      logg(`${id}: ${o.brevlada.totalt} mejl i ${o.brevlada.mapp}`);
    } catch (e) {
      const text = maskeraText(String(e?.message ?? e)).slice(0, 200);
      o.brevlada = e?.kod === 'MAPP_SAKNAS'
        ? { status: 'saknas', mapp, orsak: `the folder ${mapp} does not exist in the mailbox yet — the auto-reply creates it on its first upset email` }
        : { status: 'fel', mapp, orsak: text };
      logg(`${id}: VA-mappen gick inte att läsa — ${text}`);
    } finally {
      try { await brevlada?.loggaUt?.(); } catch { /* utloggningen får aldrig fälla sidbygget */ }
    }
  }
  return autosvar;
}

// -------------------------------------------------------------------- CLI

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const args = process.argv.slice(2);
    const i = args.indexOf('--url');
    if (i !== -1 && args[i + 1]) { sparaUrl(args[i + 1]); console.log(`Länk sparad i kundtjanst/rapportsida.json: ${args[i + 1]}`); }
    const data = samlaDashboard();
    // VA-mappen läses live om nyckeln finns; --utan-brevlada hoppar steget (offline, tester).
    if (args.includes('--utan-brevlada')) {
      for (const o of Object.values(data.autosvar?.brands ?? {})) o.brevlada = { status: 'saknas', mapp: 'VA-PRIO', orsak: 'mailbox not read for this build (--utan-brevlada)' };
    } else {
      await hamtaVaKo(data.autosvar, { logg: (m) => console.error(`  brevlådan: ${m}`) });
    }
    // Tvisterna: snapshoten (allt öppet) + tvistkollen torrt (vad som brådskar). --utan-tvistkoll hoppar verktyget.
    const { upptackBrands } = await import('./brands.mjs');
    const tvistkoll = args.includes('--utan-tvistkoll')
      ? { status: 'hoppad', hamtad: null, orsak: 'tvistkoll not run for this build (--utan-tvistkoll)', brands: [] }
      : await korTvistkoll({ rot: ROT });
    data.tvister = samlaTvister({ snapshot: lasSnapshot(), tvistkoll, brands: upptackBrands().map((b) => ({ id: b.id, namn: b.brand })), handbok: lasHandbok() });
    const fil = byggSida({ data });
    console.log(`Sida: ${fil.replace(`${ROT}/`, '')}`);
    if (!data.brands.length) {
      console.log('⚠️ Inga körningar med dashboard-data ännu (korningar/<brand>/<vecka>.json). Kör `node kundtjanst/run.mjs --brand <id>` utan --torr först.');
    }
    for (const b of data.brands) {
      const k = b.nyckeltal;
      console.log(`  ${b.namn.padEnd(16)} ${b.vecka}  risk ${String(k.risk).padStart(3)}/100 · ${k.arenden} ärenden · ${k.larmObesvarade} obesvarade > gräns · ${b.plan.length} åtgärder · ${b.veckor.length} vecka/-or`);
    }
    const auto = data.autosvar?.brands ?? {};
    if (!Object.keys(auto).length) console.log('  autosvar: ingen logg än (kundtjanst/autosvar/logg/) — sidan säger det för varje butik');
    for (const [id, o] of Object.entries(auto)) {
      const a = o.antal; const bl = o.brevlada;
      const mappen = bl?.status === 'ok' ? `${bl.totalt} mejl i ${bl.mapp}` : `${bl?.mapp ?? 'VA-PRIO'} inte läst (${bl?.orsak ?? 'okänt'})`;
      console.log(`  autosvar ${id.padEnd(16)} ${data.autosvar.dagar} d: ${a.mejl} mejl · svar ${a.svar} · utkast ${a.utkast} · ARG ${a.ARG} · till VA:n ${a.tillVa} · fel ${a.fel} · ${mappen}`);
    }
    const tv = data.tvister;
    console.log(`  tvister: snapshot ${tv.snapshotByggd ?? '–'} · tvistkoll ${tv.kollStatus}${tv.kollOrsak ? ` (${tv.kollOrsak})` : ''}`);
    for (const b of tv.brands) {
      const pengar = Object.entries(b.pengarIRisk).map(([v, s]) => `${s} ${v}`).join(' · ') || '–';
      console.log(`    ${b.namn.padEnd(16)} ${b.tillganglig === false ? `OKÄND — ${b.orsak}` : `${b.antal.oppna} öppna · ${b.antal.chargebacks} chargebacks · ${b.antal.forsenade} försenade · ${b.antal.idag} i dag · i risk ${pengar}${b.tillganglig === null ? ` · ${b.orsak}` : ''}`}`);
    }
    const url = lasUrl();
    console.log(url
      ? `\nPublicera mot samma länk:\n  Artifact  file_path: ${fil}\n            url:       ${url}`
      : '\n⚠️ Ingen länk sparad än. Publicera med Artifact (favicon 📬) och kör sedan:\n  node kundtjanst/rapportsida.mjs --url <länken>');
  })().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
