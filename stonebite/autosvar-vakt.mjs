// autosvar-vakt.mjs — håller kundtjänstbotens minutserver igång där sajten bor.
//
// Axels krav 2026-09-22: "den ska ju svara arga kunder på 60 sekunder så den
// måste ju ligga och skanna hela tiden". En rutin på claude.ai kör som tätast
// en gång i timmen — det räcker inte. Sajten kör redan dygnet runt på Railway,
// så minutservern (`node kundtjanst/autosvar.mjs --loop 60`) startas som
// barnprocess av servern och startas om när den dör. Samma kod som för hand,
// ingen ny tjänst, samma volym.
//
// Tre regler som sitter här:
//   1. Inget startar utan AUTOSVAR_BRANDS. Tomt ⇒ vakten gör ingenting, och
//      sajten är precis som förut.
//   2. Torrt om inte AUTOSVAR_LAGE=skarpt står uttryckligen. Torrt = utkast i
//      Drafts, inget skickas. (Axels ordning 2026-09-21: 20 utkast i rad rätt
//      → skarpt.)
//   3. Loggen — minnet "ett svar per tråd någonsin" — ligger på volymen
//      (AUTOSVAR_LOGGMAPP, standard <STONEBITE_DATA>/autosvar/logg), aldrig i
//      containern: annars dör minnet med varje deploy och kunden kan få två
//      svar. Sajten läser samma mapp live (server.mjs → autosvarLive).
//
// ⚠️ Två autosvar på samma brevlåda är ett dubbelsvar som väntar på att hända
// (mätt 2026-09-21). När vakten är på för en butik kör INGEN session
// autosvar.mjs mot den brevlådan för hand.

import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { datamapp } from '../bonus/kor.mjs';
import { envNamn } from '../kundtjanst/brands.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
export const ROT = dirname(HAR);
export const OMSTART_MIN_S = 30;
export const OMSTART_MAX_S = 600;
/** Levde processen längre än så räknas nästa död som ny, och pausen börjar om från 30 s. */
export const LANGT_LIV_MS = 10 * 60 * 1000;

/** Loggmappen sajten och vakten delar. Ren. */
export function loggmappFor(env = process.env, rot = ROT) {
  return env.AUTOSVAR_LOGGMAPP || join(datamapp(env, rot), 'autosvar', 'logg');
}

/**
 * Får vakten köra HÄR? Bara på Railway (som sätter RAILWAY_* i varje tjänst)
 * eller med AUTOSVAR_VAKT=1 uttryckligen. Ren.
 *
 * Mätt 2026-09-22 22:41 CEST: Axel lade in AUTOSVAR_BRANDS + mejllösenordet
 * i claude.ai-miljön, och en `node stonebite/server.mjs` för att provstarta
 * servern i en session drog igång boten mot den RIKTIGA brevlådan i sex
 * sekunder. En provstart, en skärmdump eller `npm run sida` får aldrig bli en
 * andra bot bredvid Railways — det är dubbelsvaret igen.
 */
export function farKoraHar(env = process.env) {
  if (String(env.AUTOSVAR_VAKT ?? '').trim() === '1') return { ja: true, varfor: 'AUTOSVAR_VAKT=1' };
  if (env.RAILWAY_PROJECT_ID || env.RAILWAY_ENVIRONMENT || env.RAILWAY_SERVICE_ID) return { ja: true, varfor: 'Railway' };
  return { ja: false, varfor: 'inte på Railway (RAILWAY_* saknas) och AUTOSVAR_VAKT är inte 1 — vakten startar bara där sajten bor' };
}

/**
 * Konfigurationen ur miljön, eller null när vakten inte ska köra. Ren.
 * `saknar` är de mejllösenord som fattas — utan dem hoppar autosvaret butiken
 * varje varv, så vakten säger det en gång i stället för sextio gånger i timmen.
 */
export function vaktKonfig(env = process.env, rot = ROT) {
  const brands = [...new Set(String(env.AUTOSVAR_BRANDS ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean))];
  if (!brands.length) return null;
  const lage = String(env.AUTOSVAR_LAGE ?? 'torr').trim().toLowerCase() === 'skarpt' ? 'skarpt' : 'torr';
  const loop = Math.max(30, Number(env.AUTOSVAR_LOOP) || 60);
  const discord = ['1', 'true', 'ja', 'yes'].includes(String(env.AUTOSVAR_DISCORD ?? '').trim().toLowerCase());
  const saknar = brands.map((id) => envNamn(id).mailPass).filter((namn) => !env[namn]);
  return { brands, lage, loop, loggmapp: loggmappFor(env, rot), discord, saknar };
}

/** Argumenten till autosvar.mjs — exakt de flaggor en människa hade skrivit. Ren. */
export function vaktArgv(k) {
  return [
    join('kundtjanst', 'autosvar.mjs'),
    '--brand', k.brands.join(','),
    k.lage === 'skarpt' ? '--skarpt' : '--torr',
    '--loop', String(k.loop),
    ...(k.discord ? ['--discord'] : []),
  ];
}

/** Finns det en logg på volymen att visa? Ren mot filsystemet. */
export function harLogg(loggmapp) {
  try { return existsSync(loggmapp) && readdirSync(loggmapp).some((f) => f.endsWith('.jsonl')); } catch { return false; }
}

/**
 * Startar minutservern och håller den vid liv. Returnerar { status(), stopp() }
 * eller null när AUTOSVAR_BRANDS är tomt. `spawnFn`/`timer`/`nu` byts ut i
 * testerna — ingen riktig process startas där.
 */
export function startaVakt({ env = process.env, rot = ROT, spawnFn = spawn, logg = (m) => console.error(m), timer = setTimeout, nu = () => Date.now() } = {}) {
  const k = vaktKonfig(env, rot);
  if (!k) return null;
  const har = farKoraHar(env);
  const status = { brands: k.brands, lage: k.lage, loop: k.loop, loggmapp: k.loggmapp, saknar: k.saknar, host: har.varfor, kor: false, startad: null, omstarter: 0, senasteUtgang: null };
  if (!har.ja) {
    logg(`autosvar-vakt: startar INTE — ${har.varfor}.`);
    return { status: () => ({ ...status }), stopp() {} };
  }
  if (k.saknar.length) {
    logg(`autosvar-vakt: startar INTE — mejllösenordet saknas i miljön: ${k.saknar.join(', ')}. Lägg in det på tjänsten (Railway → Variables) så startar vakten vid nästa deploy.`);
    return { status: () => ({ ...status }), stopp() {} };
  }

  let barn = null;
  let stoppad = false;
  let paus = OMSTART_MIN_S;
  let senastStart = 0;

  const starta = () => {
    if (stoppad) return;
    senastStart = nu();
    barn = spawnFn(process.execPath, vaktArgv(k), {
      cwd: rot,
      stdio: ['ignore', 'inherit', 'inherit'],
      // NODE_USE_ENV_PROXY=1 hindrar autosvar.mjs från att starta om sig självt
      // bakom en proxy — på Railway finns ingen, och en dubbel process vore ett dubbelsvar.
      env: { ...env, AUTOSVAR_LOGGMAPP: k.loggmapp, NODE_USE_ENV_PROXY: env.NODE_USE_ENV_PROXY ?? '1', NODE_NO_WARNINGS: '1' },
    });
    status.kor = true;
    status.startad = new Date(senastStart).toISOString();
    logg(`autosvar-vakt: minutservern igång — ${k.lage.toUpperCase()}, var ${k.loop}:e sekund, ${k.brands.join(', ')}, logg ${k.loggmapp}`);
    barn.on('error', (e) => { status.kor = false; logg(`autosvar-vakt: kunde inte starta minutservern: ${e.message}`); });
    barn.on('exit', (kod, signal) => {
      status.kor = false;
      status.senasteUtgang = { tid: new Date(nu()).toISOString(), kod: kod ?? null, signal: signal ?? null };
      if (stoppad) return;
      paus = nu() - senastStart > LANGT_LIV_MS ? OMSTART_MIN_S : Math.min(OMSTART_MAX_S, paus * 2);
      status.omstarter += 1;
      logg(`autosvar-vakt: minutservern avslutades (kod ${kod ?? '–'}${signal ? `, ${signal}` : ''}) — startar om om ${paus} s`);
      timer(starta, paus * 1000);
    });
  };

  starta();
  return {
    status: () => ({ ...status }),
    stopp() { stoppad = true; if (barn && status.kor) { try { barn.kill('SIGTERM'); } catch { /* redan död */ } } },
  };
}
