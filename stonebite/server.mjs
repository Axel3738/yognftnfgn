#!/usr/bin/env node
// server.mjs — hela webbplatsen. En Node-process, inga ramverk, noll beroenden.
//
//   node stonebite/server.mjs            # port 4000
//   PORT=8080 node stonebite/server.mjs
//
// Så hänger det ihop:
//   • Publika sidan  /            — vem som helst
//   • Inloggning     /logga-in    — kaka signerad med STONEBITE_HEMLIGHET
//   • Dashboards     /app/*       — rollen avgör vilka sidor som ens svarar
//   • Data           stonebite/data/snapshot.json (skrivs av hamta.mjs)
//
// Säkerheten sitter i routingen, aldrig i menyn: varje /app-sida frågar
// roller.mjs om användaren får se just den sidan, och svarar 403 annars.
// En gissad adress ger alltså ingenting.

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

import { hamtaHemlighet, skapaSession, lasSession, csrfNyckel, kollaCsrf, Strypning, KAKA, SESSION_TIMMAR, slumpLosenord, kollaLosenord } from './auth.mjs';
import * as anv from './anvandare.mjs';
import { farSe, harRatt, startsidaFor, SIDOR, serEkonomi, ekonomiVarning } from './roller.mjs';
import { lasSnapshot } from './data.mjs';
import { publikSida } from './vy/publik.mjs';
import { influencerSida } from './vy/influencers.mjs';
import { loginSida, uppstartSida } from './vy/login.mjs';
import { oversiktSida } from './vy/oversikt.mjs';
import { butikerSida } from './vy/butiker.mjs';
import { annonserSida } from './vy/annonser.mjs';
import { redigerareSida, migSida, kontonSida } from './vy/team.mjs';
import { kundtjanstSida, leveransSida } from './vy/drift.mjs';
import { produkttestSida, recensionerSida } from './vy/produkter.mjs';
import { bonusSida } from './vy/bonus.mjs';
import { systemSida } from './vy/system.mjs';
import { varumarkenSida, varumarkeSida } from './vy/varumarke.mjs';
import { kalenderSida } from './vy/kalender.mjs';
import { lasHandelser, skrivHandelse, nyHandelse, tolkaNar, harleddaHandelser } from './kalender.mjs';
import { lasKontakter, skrivKontakt, nyKontakt, uppdateraKontakt } from './kontakter.mjs';
import { lasVarumarken } from './hamta.mjs';
import { lasInsatser, skrivInsats, lasPersoner, sparaPerson, datamapp, lasRegler } from '../bonus/kor.mjs';
import { appSkal } from './vy/layout.mjs';
import { sattSprak } from './vy/delar.mjs';
import { sprakFor, SPRAKEN } from './sprak.mjs';
import { lasProfil } from './kallor/repo.mjs';
import { startaVakt, loggmappFor, harLogg } from './autosvar-vakt.mjs';
import { samlaAutosvar } from '../kundtjanst/dashboard.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = dirname(HAR);
const WEBB = join(HAR, 'webb');
const SNAPSHOT = join(HAR, 'data', 'snapshot.json');
const ANVANDARFIL = process.env.STONEBITE_ANVANDARE || anv.standardfil(HAR);
const INSATSFIL = join(datamapp(process.env, ROT), 'insatser.jsonl');
const PERSONFIL = join(datamapp(process.env, ROT), 'personer-extra.json');
// Kalendern och kontakterna: föränderliga, ligger på volymen — aldrig i git.
const KALENDERFIL = join(datamapp(process.env, ROT), 'kalender.jsonl');
const KONTAKTFIL = join(datamapp(process.env, ROT), 'kontakter.jsonl');

const lasKal = () => { try { return lasHandelser(KALENDERFIL); } catch { return []; } };
const lasKont = () => { try { return lasKontakter(KONTAKTFIL); } catch { return []; } };
/** Varumärkena ur snapshoten, annars direkt ur filen. */
const varumarkenFor = (snap) => (snap?.varumarken?.length ? snap.varumarken : lasVarumarken(ROT));
/** Bara adresser inne i appen får vara "tillbaka"-mål. */
const sakerNasta = (v, standard = '/app/kalender') => (String(v ?? '').startsWith('/app') ? String(v) : standard);
/** Kalenderrader en person får se: sina egna, och (för ägare/chef) alla varumärkens. */
function kalenderFor(anvandare, alla) {
  const allaBrands = harRatt(anvandare, 'varumarken');
  return alla.filter((h) => h.agare === anvandare.id || (allaBrands && (h.brand || !h.agare)));
}
const HEMLIGHET = hamtaHemlighet(process.env, join(HAR, 'data', 'hemlighet.txt'));

const strypning = new Strypning();

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
};

// ------------------------------------------------------------- hjälpare

function sakerhetsrubriker(res, { nonce, https }) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), interest-cohort=()');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; '));
  if (https) res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
}

function svaraHtml(res, html, { status = 200, nonce, https, kaka = null } = {}) {
  sakerhetsrubriker(res, { nonce, https });
  if (kaka) res.setHeader('Set-Cookie', kaka);
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(html);
}

function omdirigera(res, till, { kaka = null, status = 303 } = {}) {
  const rubriker = { Location: till, 'Cache-Control': 'no-store' };
  if (kaka) rubriker['Set-Cookie'] = kaka;
  res.writeHead(status, rubriker);
  res.end();
}

function lasKakor(req) {
  const ut = {};
  for (const bit of String(req.headers.cookie ?? '').split(';')) {
    const i = bit.indexOf('=');
    if (i < 1) continue;
    ut[bit.slice(0, i).trim()] = decodeURIComponent(bit.slice(i + 1).trim());
  }
  return ut;
}

function sattKaka(varde, { https, maxAlder = SESSION_TIMMAR * 3600 }) {
  const delar = [`${KAKA}=${encodeURIComponent(varde)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAlder}`];
  if (https) delar.push('Secure');
  return delar.join('; ');
}

function radeKaka(https) {
  return sattKaka('', { https, maxAlder: 0 });
}

async function lasKropp(req, max = 64 * 1024) {
  return new Promise((klar, fel) => {
    let langd = 0;
    const bitar = [];
    req.on('data', (b) => {
      langd += b.length;
      if (langd > max) { fel(new Error('För stor förfrågan.')); req.destroy(); return; }
      bitar.push(b);
    });
    req.on('end', () => klar(Buffer.concat(bitar).toString('utf8')));
    req.on('error', fel);
  });
}

function tolkaFormular(text) {
  const ut = {};
  for (const [k, v] of new URLSearchParams(text)) ut[k] = v;
  return ut;
}

function arHttps(req) {
  const vidare = String(req.headers['x-forwarded-proto'] ?? '').split(',')[0].trim();
  return vidare === 'https' || Boolean(req.socket?.encrypted);
}

/** Klientens adress — bakom Railway/Fly ligger den i X-Forwarded-For. */
function klientIp(req) {
  const f = String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim();
  return f || req.socket?.remoteAddress || 'okänd';
}

function nuvarandeAnvandare(req) {
  const kakor = lasKakor(req);
  const session = lasSession(kakor[KAKA], HEMLIGHET);
  if (!session) return { session: null, anvandare: null, kakvarde: kakor[KAKA] ?? '' };
  const konto = anv.hittaPaId(ANVANDARFIL, session.id);
  if (!konto || konto.aktiv === false) return { session: null, anvandare: null, kakvarde: kakor[KAKA] ?? '' };
  // Lösenordsbyte eller avstängning ogiltigförklarar äldre kakor.
  if ((konto.losenordAndrat ?? 0) > (session.v ?? 0)) return { session: null, anvandare: null, kakvarde: kakor[KAKA] ?? '' };
  return { session, anvandare: anv.utanHemlighet(konto), kakvarde: kakor[KAKA] ?? '' };
}

function statiskFil(res, sokvag, nonce, https) {
  const rel = normalize(sokvag.replace(/^\/webb\//, '')).replace(/^(\.\.[/\\])+/, '');
  const fil = join(WEBB, rel);
  if (!fil.startsWith(WEBB) || !existsSync(fil) || !statSync(fil).isFile()) return false;
  const typ = MIME[extname(fil)] ?? 'application/octet-stream';
  sakerhetsrubriker(res, { nonce, https });
  // Bilderna byts nästan aldrig och är de tyngsta filerna — låt webbläsaren
  // hålla dem ett dygn. Stil och skript ändras med varje version: fem minuter.
  const cache = typ.startsWith('image/') && typ !== 'image/svg+xml' ? 'public, max-age=86400' : 'public, max-age=300';
  res.writeHead(200, { 'Content-Type': typ, 'Cache-Control': cache });
  res.end(readFileSync(fil));
  return true;
}

// Autosvarets logg LIVE ur volymen (minutservern på Railway skriver dit,
// stonebite/autosvar-vakt.mjs). Snapshoten bär repots committade logg — den
// är timmar gammal; en arg kund ska synas inom minuten, inte vid nästa
// hämtning. Volymens butiker vinner, snapshotens övriga står kvar.
// Ingen cache: några små jsonl-filer per sidvisning är billigare än att
// någonsin visa gårdagens läge som dagens.
function autosvarLive() {
  const mapp = loggmappFor(process.env, ROT);
  if (!harLogg(mapp)) return null;
  try { return { ...samlaAutosvar({ loggmapp: mapp }), kalla: 'volymen' }; } catch { return null; }
}

function snapshot() {
  const snap = lasSnapshot(SNAPSHOT);
  const live = autosvarLive();
  if (!snap || !live) return snap;
  return { ...snap, autosvar: { ...(snap.autosvar ?? {}), ...live, brands: { ...(snap.autosvar?.brands ?? {}), ...live.brands } } };
}

/** Vakten som håller autosvarets minutserver igång — null när AUTOSVAR_BRANDS är tomt. Sätts i uppstarten. */
let autosvarVakt = null;

function felsida(res, { kod, rubrik, text, nonce, https }) {
  svaraHtml(res, `<!doctype html><html lang="sv"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${rubrik} · Stonebite</title>
<link rel="stylesheet" href="/webb/stil.css"><meta name="robots" content="noindex"></head>
<body><div class="login-skarm"><div class="login-kort mitten">
  <h1 style="font-size:52px;letter-spacing:-.04em">${kod}</h1>
  <p class="under" style="margin:10px 0 22px">${text}</p>
  <a class="knapp" href="/app">Till dashboarden</a>
</div></div></body></html>`, { status: kod, nonce, https });
}

// ------------------------------------------------------------- sidorna

/**
 * Snapshoten + det som ändras mellan hämtningarna.
 *
 *  • Insatser läses ur filen varje gång: en VA som just rapporterat in något
 *    ska se den direkt, inte först efter nästa hämtning.
 *  • Reglerna och personregistret ligger i repot och ändras inte av en
 *    hämtning. Läs dem direkt så att uppdragen syns även på en sajt som
 *    startats innan första hämtningen.
 */
function medFarskaInsatser(snap) {
  const bas = snap ?? {};
  let insatser = [];
  try { insatser = lasInsatser(INSATSFIL); } catch { insatser = []; }
  // Reglerna läses ALLTID ur filen, aldrig ur snapshoten: ett belopp eller en
  // engelsk text som ändras ska slå igenom direkt, inte vid nästa hämtning.
  let bonusProgram = null;
  try { bonusProgram = lasRegler(); } catch { bonusProgram = bas.bonusProgram ?? null; }
  let personer = bas.personer ?? [];
  try { personer = lasPersoner(undefined, PERSONFIL); } catch { /* basregistret räcker */ }
  if (!snap && !bonusProgram) return snap;
  return { ...bas, insatser, bonusProgram, personer };
}

function renderaApp({ nyckel, anvandare, extra = {} }) {
  // Språket sätts FÖRE renderingen och gäller hela sidan. Renderingen är
  // synkron, så ingen annan förfrågan kan hinna emellan och byta språk mitt i.
  sattSprak(sprakFor(anvandare));
  const snap = medFarskaInsatser(snapshot());
  switch (nyckel) {
    case 'oversikt': return oversiktSida({ snapshot: snap, anvandare, kalender: kalenderFor(anvandare, lasKal()) });
    case 'varumarken': return varumarkenSida({ snapshot: snap, varumarken: varumarkenFor(snap), kalender: lasKal(), kontakter: lasKont() });
    case 'kalender': {
      const allaBrands = harRatt(anvandare, 'varumarken');
      return kalenderSida({
        anvandare,
        handelser: kalenderFor(anvandare, lasKal()),
        harledda: allaBrands ? harleddaHandelser({ snapshot: snap, kontakter: lasKont() }) : [],
        varumarken: varumarkenFor(snap),
        allaBrands,
        csrf: extra.csrf ?? '',
        manad: extra.manad ?? null,
        rutiner: snap?.rutiner ?? null,
      });
    }
    case 'butiker': return butikerSida({ snapshot: snap });
    case 'annonser': return annonserSida({ snapshot: snap });
    case 'redigerare': return redigerareSida({ snapshot: snap, anvandare });
    case 'kundtjanst': return kundtjanstSida({ snapshot: snap });
    case 'leverans': return leveransSida({ snapshot: snap });
    case 'produkttest': return produkttestSida({ snapshot: snap, anvandare });
    case 'recensioner': return recensionerSida({ snapshot: snap, anvandare });
    case 'bonus': return bonusSida({ snapshot: snap, anvandare, ...extra });
    case 'system': return systemSida({ snapshot: snap });
    case 'mig': return migSida({ snapshot: snap, anvandare, ...extra });
    case 'konton': return kontonSida({
      konton: anv.lista(ANVANDARFIL),
      anvandare,
      personer: (() => { try { return lasPersoner(undefined, PERSONFIL); } catch { return snap?.personer ?? []; } })(),
      butiker: [...new Set((snap?.leverans?.butiker ?? []).map((b) => b.id))],
      ...extra,
    });
    default: return null;
  }
}

function visaAppsida(res, { nyckel, anvandare, nonce, https, extra = {} }) {
  const sida = renderaApp({ nyckel, anvandare, extra });
  if (!sida) return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Sidan finns inte.', nonce, https });
  return svaraHtml(res, appSkal({
    titel: sida.titel,
    anvandare,
    aktivSida: nyckel,
    innehall: sida.innehall,
    nonce,
  }), { nonce, https });
}

// ------------------------------------------------------------ hanteraren

export async function hantera(req, res) {
  const nonce = randomBytes(12).toString('base64');
  const https = arHttps(req);
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  const stig = url.pathname.replace(/\/+$/, '') || '/';
  const { anvandare, kakvarde } = nuvarandeAnvandare(req);
  const csrf = csrfNyckel(kakvarde, HEMLIGHET);
  const ingaKonton = anv.antal(ANVANDARFIL) === 0;

  // ---------------------------------------------------------- statiskt
  if (req.method === 'GET' && stig.startsWith('/webb/')) {
    if (statiskFil(res, stig, nonce, https)) return;
    return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Filen finns inte.', nonce, https });
  }

  if (stig === '/halsa') {
    const snap = snapshot();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    // autosvar: minutserverns läge (null = vakten är av, AUTOSVAR_BRANDS tomt) — så en
    // curl mot /halsa säger om boten faktiskt snurrar, utan inloggning och utan gissning.
    return res.end(JSON.stringify({ ok: true, snapshot: snap?.byggd ?? null, konton: anv.antal(ANVANDARFIL), autosvar: autosvarVakt ? autosvarVakt.status() : null }));
  }

  // ------------------------------------------------------ förstagången
  if (ingaKonton && stig !== '/' && !stig.startsWith('/webb/')) {
    if (stig === '/kom-igang' && req.method === 'GET') {
      return svaraHtml(res, uppstartSida({ csrf, nonce }), { nonce, https });
    }
    if (stig === '/kom-igang' && req.method === 'POST') {
      const f = tolkaFormular(await lasKropp(req));
      const visaFel = (text) => svaraHtml(res, uppstartSida({ fel: text, csrf, nonce }), { status: 400, nonce, https });
      if (!kollaCsrf(f.csrf, kakvarde, HEMLIGHET)) return visaFel('Formuläret var för gammalt. Försök igen.');
      if (f.losenord !== f.losenord2) return visaFel('De två lösenorden är inte lika.');
      try {
        const fornamn = String(f.namn).trim().split(/\s+/)[0];
        const personId = fornamn.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'agaren';
        try {
          sparaPerson({
            id: personId, namn: String(f.namn).trim(), fornamn, roll: 'agare',
            brands: [], extraRoller: [], notionNamn: String(f.namn).trim(), alias: [],
          }, PERSONFIL);
        } catch { /* personregistret får aldrig blockera första inloggningen */ }
        const konto = anv.skapa(ANVANDARFIL, { namn: f.namn, epost: f.epost, roll: 'agare', personId, losenord: f.losenord });
        const full = anv.hittaPaId(ANVANDARFIL, konto.id);
        return omdirigera(res, '/app', { kaka: sattKaka(skapaSession(full, HEMLIGHET), { https }) });
      } catch (e) {
        return visaFel(e.message);
      }
    }
    return omdirigera(res, '/kom-igang');
  }

  // --------------------------------------------------------- publikt
  // Profilen läses ur filen vid varje visning — det är vad profil.json lovar.
  // Snapshotens kopia är bara reserv: den skrivs en gång i timmen av rutinen,
  // och hade den fått vinna hade varje textändring synts först upp till en
  // timme efter deployen (mätt 2026-09-22 när konsultsidan byttes ut).
  if (stig === '/' && req.method === 'GET') {
    const snap = snapshot();
    const profil = lasProfil(ROT) ?? snap?.profil;
    const butiker = (snap?.butiker ?? []).filter((b) => b.status === 'ok').length;
    const marknader = new Set((snap?.butiker ?? []).filter((b) => b.status === 'ok').map((b) => b.valuta)).size;
    return svaraHtml(res, publikSida({
      profil,
      fakta: butiker ? { butiker, marknader } : null,
      inloggad: Boolean(anvandare),
      nonce,
    }), { nonce, https });
  }

  // Mikroinfluenserna — det enda bolaget erbjuder andra. Publik, samma profil.
  if (stig === '/influencers' && req.method === 'GET') {
    const profil = lasProfil(ROT) ?? snapshot()?.profil;
    return svaraHtml(res, influencerSida({ profil, inloggad: Boolean(anvandare), nonce }), { nonce, https });
  }

  // Konsultsidan togs bort 2026-09-22 (Axel: inga tjänster, inget mentorskap).
  // Adressen kan ligga kvar i någons flik eller mejl — den pekar hit för alltid.
  if (stig === '/tjanster' && req.method === 'GET') {
    return omdirigera(res, '/influencers', { status: 301 });
  }

  // ------------------------------------------------------- inloggning
  if (stig === '/logga-in') {
    if (req.method === 'GET') {
      if (anvandare) return omdirigera(res, startsidaFor(anvandare));
      return svaraHtml(res, loginSida({ csrf, nonce, nasta: url.searchParams.get('nasta') ?? '' }), { nonce, https });
    }
    if (req.method === 'POST') {
      const f = tolkaFormular(await lasKropp(req));
      const nyckel = `${klientIp(req)}|${anv.normaliseraEpost(f.epost)}`;
      const visaFel = (text, kod = 400) => svaraHtml(res, loginSida({ fel: text, epost: f.epost ?? '', csrf, nonce, nasta: f.nasta ?? '' }), { status: kod, nonce, https });

      if (!kollaCsrf(f.csrf, kakvarde, HEMLIGHET)) return visaFel('Formuläret var för gammalt. Försök igen.');
      const lage = strypning.kolla(nyckel);
      if (!lage.tillaten) return visaFel(`För många försök. Vänta ${Math.ceil(lage.sekunder / 60)} minuter.`, 429);

      const konto = anv.loggaIn(ANVANDARFIL, f.epost, f.losenord);
      if (!konto) {
        strypning.miss(nyckel);
        return visaFel('Fel e-post eller lösenord.', 401);
      }
      strypning.traff(nyckel);
      anv.stampla(ANVANDARFIL, konto.id);
      const full = anv.hittaPaId(ANVANDARFIL, konto.id);
      const nasta = String(f.nasta ?? '');
      const till = nasta.startsWith('/app') ? nasta : startsidaFor(konto);
      return omdirigera(res, till, { kaka: sattKaka(skapaSession(full, HEMLIGHET), { https }) });
    }
  }

  if (stig === '/logga-ut') {
    return omdirigera(res, '/', { kaka: radeKaka(https) });
  }

  if (stig === '/kom-igang') {
    // Kontot finns redan — sidan ska inte gå att nå igen.
    return omdirigera(res, anvandare ? '/app' : '/logga-in');
  }

  // ------------------------------------------------------------- appen
  if (stig === '/app' || stig.startsWith('/app/')) {
    if (!anvandare) return omdirigera(res, `/logga-in?nasta=${encodeURIComponent(stig)}`);

    // Varumärkessidan: /app/varumarke/<id>?flik=…  — bara ägare och chef.
    if (req.method === 'GET' && stig.startsWith('/app/varumarke/')) {
      if (!farSe(anvandare, 'varumarken')) {
        return felsida(res, { kod: 403, rubrik: 'Inte din sida', text: 'Ditt konto når inte varumärkena.', nonce, https });
      }
      sattSprak(sprakFor(anvandare));
      const snap = medFarskaInsatser(snapshot());
      const vms = varumarkenFor(snap);
      const vm = vms.find((v) => v.id === decodeURIComponent(stig.slice('/app/varumarke/'.length)));
      if (!vm) return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Det varumärket finns inte.', nonce, https });
      const sida = varumarkeSida({
        snapshot: snap, vm, varumarken: vms,
        flik: url.searchParams.get('flik') ?? 'oversikt',
        manad: url.searchParams.get('manad'),
        kalender: lasKal(), kontakter: lasKont(), anvandare, csrf,
      });
      return svaraHtml(res, appSkal({ titel: sida.titel, anvandare, aktivSida: 'varumarken', innehall: sida.innehall, nonce }), { nonce, https });
    }

    // POST-åtgärderna först
    if (req.method === 'POST') {
      const f = tolkaFormular(await lasKropp(req));
      if (!kollaCsrf(f.csrf, kakvarde, HEMLIGHET)) {
        return felsida(res, { kod: 400, rubrik: 'Försök igen', text: 'Formuläret var för gammalt. Gå tillbaka och försök igen.', nonce, https });
      }

      // ---------------------------------------------------------- kalendern
      // Alla roller har en egen kalender. Rader med varumärke får bara ägare
      // och chef skapa och röra; en egen rad rör bara den som skrev den.
      if (stig.startsWith('/app/kalender/')) {
        if (!farSe(anvandare, 'kalender')) return felsida(res, { kod: 403, rubrik: 'Inte din sida', text: 'Ditt konto har ingen kalender.', nonce, https });
        const nasta = sakerNasta(f.nasta);
        const farBrand = harRatt(anvandare, 'varumarken');
        if (stig === '/app/kalender/ny') {
          try {
            const tolkat = tolkaNar(f.text ?? '');
            const brand = farBrand && f.brand ? String(f.brand) : null;
            skrivHandelse(nyHandelse({
              titel: tolkat.titel || f.text,
              datum: tolkat.datum ?? f.datum,
              tid: tolkat.tid ?? f.tid,
              brand,
              typ: f.typ,
              agare: brand ? null : anvandare.id,
              skapadAv: anvandare.namn,
            }), KALENDERFIL);
          } catch (e) {
            return felsida(res, { kod: 400, rubrik: 'Kunde inte lägga till', text: e.message, nonce, https });
          }
          return omdirigera(res, nasta);
        }
        const h = lasKal().find((x) => x.id === f.id);
        if (!h) return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Raden finns inte längre.', nonce, https });
        const min = h.agare === anvandare.id || (farBrand && (h.brand || !h.agare));
        if (!min) return felsida(res, { kod: 403, rubrik: 'Inte din rad', text: 'Du kan bara ändra dina egna rader.', nonce, https });
        const nu = new Date().toISOString();
        if (stig === '/app/kalender/klar') skrivHandelse({ ...h, klar: true, klarTid: nu, klarAv: anvandare.namn }, KALENDERFIL);
        else if (stig === '/app/kalender/oklar') skrivHandelse({ ...h, klar: false, klarTid: null }, KALENDERFIL);
        else if (stig === '/app/kalender/bort') skrivHandelse({ ...h, raderad: true, raderadTid: nu }, KALENDERFIL);
        else return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Okänd åtgärd.', nonce, https });
        return omdirigera(res, nasta);
      }

      // --------------------------------------------------------- kontakterna
      if (stig.startsWith('/app/kontakter/')) {
        if (!harRatt(anvandare, 'varumarken')) return felsida(res, { kod: 403, rubrik: 'Inte din sida', text: 'Bara ägare och chef rör kontakterna.', nonce, https });
        const nasta = sakerNasta(f.nasta, '/app/varumarken');
        try {
          if (stig === '/app/kontakter/ny') {
            skrivKontakt(nyKontakt({ ...f, skapadAv: anvandare.namn }), KONTAKTFIL);
          } else if (stig === '/app/kontakter/andra') {
            const k = lasKont().find((x) => x.id === f.id);
            if (!k) return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Kontakten finns inte längre.', nonce, https });
            skrivKontakt(uppdateraKontakt(k, { status: f.status, nastaSteg: f.nastaSteg, nastaDatum: f.nastaDatum, raderad: f.radera === '1' }), KONTAKTFIL);
          } else {
            return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Okänd åtgärd.', nonce, https });
          }
        } catch (e) {
          return felsida(res, { kod: 400, rubrik: 'Kunde inte spara', text: e.message, nonce, https });
        }
        return omdirigera(res, nasta);
      }

      if (stig === '/app/mig/losenord') {
        const konto = anv.hittaPaId(ANVANDARFIL, anvandare.id);
        const extra = {};
        if (!kollaLosenord(f.gammalt, konto?.losenord)) extra.fel = 'Nuvarande lösenord stämmer inte.';
        else if (f.nytt !== f.nytt2) extra.fel = 'De två nya lösenorden är inte lika.';
        else if (String(f.nytt ?? '').length < 8) extra.fel = 'Det nya lösenordet måste vara minst 8 tecken.';
        else {
          anv.sattLosenord(ANVANDARFIL, anvandare.id, f.nytt);
          const uppdaterad = anv.hittaPaId(ANVANDARFIL, anvandare.id);
          const sida = renderaApp({ nyckel: 'mig', anvandare, extra: { meddelande: 'Lösenordet är bytt.', csrf } });
          return svaraHtml(res, appSkal({ titel: sida.titel, anvandare, aktivSida: 'mig', innehall: sida.innehall, nonce }),
            { nonce, https, kaka: sattKaka(skapaSession(uppdaterad, HEMLIGHET), { https }) });
        }
        return visaAppsida(res, { nyckel: 'mig', anvandare, nonce, https, extra: { ...extra, csrf } });
      }

      if (stig === '/app/mig/sprak') {
        const extra = { csrf };
        try {
          anv.sattSprak(ANVANDARFIL, anvandare.id, f.sprak);
          const uppdaterad = anv.hittaPaId(ANVANDARFIL, anvandare.id);
          return visaAppsida(res, {
            nyckel: 'mig',
            anvandare: anv.utanHemlighet(uppdaterad),
            nonce, https,
            extra: { ...extra, meddelande: 'Språket är bytt.' },
          });
        } catch (e) {
          extra.fel = e.message;
        }
        return visaAppsida(res, { nyckel: 'mig', anvandare, nonce, https, extra });
      }

      if (stig === '/app/mig/rapportera') {
        const extra = { csrf };
        const person = anvandare.personId;
        if (!person) {
          extra.fel = 'Ditt konto är inte kopplat till en person än — be Axel koppla det under Konton.';
        } else {
          const program = medFarskaInsatser(snapshot())?.bonusProgram?.program ?? {};
          const uppdrag = Object.values(program).flatMap((p) => p.uppdrag ?? []).find((u) => u.id === f.uppdrag);
          if (!uppdrag) {
            extra.fel = 'Okänt uppdrag.';
          } else {
            const ref = String(f.referens ?? '').trim();
            skrivInsats({
              id: randomBytes(8).toString('hex'),
              personId: person,
              personNamn: anvandare.namn,
              uppdrag: uppdrag.id,
              uppdragNamn: uppdrag.namn,
              referens: ref,
              lank: /^https?:\/\//i.test(ref) ? ref : '',
              text: String(f.text ?? '').slice(0, 400),
              datum: new Date().toISOString(),
              status: 'vantar',
            }, INSATSFIL);
            extra.meddelande = 'Inskickat. Din chef ser det under Bonus och godkänner — sedan syns pengarna här.';
          }
        }
        return visaAppsida(res, { nyckel: 'mig', anvandare, nonce, https, extra });
      }

      if (stig === '/app/bonus/godkann') {
        if (!harRatt(anvandare, 'godkanna')) {
          return felsida(res, { kod: 403, rubrik: 'Inte din sida', text: 'Du får inte godkänna insatser.', nonce, https });
        }
        const extra = { csrf };
        const insats = lasInsatser(INSATSFIL).find((i) => i.id === f.id);
        // Regel 4: ingen godkänner sina egna pengar — inte ens med rätten
        // 'godkanna'. Mechile är både VA och Head of support (2026-09-21).
        if (insats && anvandare.personId && insats.personId === anvandare.personId) {
          return felsida(res, { kod: 403, rubrik: 'Inte din sida', text: 'Du kan inte godkänna dina egna insatser. Ägaren gör det.', nonce, https });
        }
        if (!insats) {
          extra.fel = 'Insatsen finns inte.';
        } else {
          const beslut = f.beslut === 'godkand' ? 'godkand' : 'nekad';
          skrivInsats({
            ...insats,
            status: beslut,
            beslutAv: anvandare.namn,
            beslutTid: new Date().toISOString(),
          }, INSATSFIL);
          extra.meddelande = beslut === 'godkand'
            ? `Godkänt. ${insats.personNamn ?? 'Personen'} får betalt vid nästa uträkning.`
            : 'Nekad. Inget betalas ut.';
        }
        return visaAppsida(res, { nyckel: 'bonus', anvandare, nonce, https, extra });
      }

      if (stig.startsWith('/app/konton/')) {
        if (!harRatt(anvandare, 'konton')) {
          return felsida(res, { kod: 403, rubrik: 'Inte din sida', text: 'Bara ägaren kan ändra konton.', nonce, https });
        }
        const extra = { csrf };
        try {
          if (stig === '/app/konton/ny') {
            // En roll som ser all ekonomi kräver ett uttryckligt ja (2026-09-23:
            // Mechile fick "Chef" och såg omsättningen — det går inte att ta tillbaka).
            if (serEkonomi(f.roll) && f.ekonomi_ok !== '1') throw new Error(ekonomiVarning(f.roll));
            const losen = slumpLosenord();
            // Personen skapas samtidigt som inloggningen — annars finns ingen
            // att koppla bonusen till, och personen ser noll fast hen jobbar.
            const personId = String(f.fornamn || f.namn || '').trim().toLowerCase()
              .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || randomBytes(4).toString('hex');
            const person = {
              id: personId,
              namn: String(f.namn).trim(),
              fornamn: String(f.fornamn || String(f.namn).trim().split(/\s+/)[0]).trim(),
              roll: f.roll,
              brands: String(f.brands ?? '').split(',').map((x) => x.trim()).filter(Boolean),
              extraRoller: f.extraroll ? [f.extraroll] : [],
              notionNamn: String(f.namn).trim(),
              alias: [],
            };
            sparaPerson(person, PERSONFIL);
            const ny = anv.skapa(ANVANDARFIL, { namn: f.namn, epost: f.epost, roll: f.roll, personId, losenord: losen });
            extra.nyttLosenord = { namn: ny.namn, losenord: losen };
            extra.meddelande = `${ny.namn} kan nu logga in med ${ny.epost}, och tjänar bonus som ${f.roll}.`;
          } else if (stig === '/app/konton/roll') {
            if (serEkonomi(f.roll) && f.ekonomi_ok !== '1') throw new Error(ekonomiVarning(f.roll));
            const k = anv.sattRoll(ANVANDARFIL, f.id, f.roll);
            // Rollen styr både vad man ser OCH vilket bonusprogram man är i.
            if (k.personId) {
              try {
                const nuvarande = lasPersoner(undefined, PERSONFIL).find((p) => p.id === k.personId);
                if (nuvarande) sparaPerson({ ...nuvarande, roll: f.roll }, PERSONFIL);
              } catch { /* registret får aldrig fälla en rolländring */ }
            }
            extra.meddelande = `${k.namn} är nu ${f.roll}.`;
          } else if (stig === '/app/konton/person') {
            const k = anv.sattPerson(ANVANDARFIL, f.id, f.personId || null);
            extra.meddelande = f.personId
              ? `${k.namn} är kopplad till ${f.personId} — nu räknas bonusen.`
              : `${k.namn} är inte kopplad till någon person längre.`;
          } else if (stig === '/app/konton/aktiv') {
            const k = anv.sattAktiv(ANVANDARFIL, f.id, f.aktiv === '1');
            extra.meddelande = `${k.namn} är nu ${k.aktiv ? 'aktiv' : 'avstängd'}.`;
          } else if (stig === '/app/konton/nytt-losenord') {
            const losen = slumpLosenord();
            const k = anv.sattLosenord(ANVANDARFIL, f.id, losen);
            extra.nyttLosenord = { namn: k.namn, losenord: losen };
            extra.meddelande = `${k.namn} loggades ut från alla enheter.`;
          } else if (stig === '/app/konton/ta-bort') {
            const k = anv.hittaPaId(ANVANDARFIL, f.id);
            anv.taBort(ANVANDARFIL, f.id);
            extra.meddelande = `${k?.namn ?? 'Kontot'} är borttaget.`;
          }
        } catch (e) {
          extra.fel = e.message;
        }
        return visaAppsida(res, { nyckel: 'konton', anvandare, nonce, https, extra });
      }

      return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Den knappen finns inte.', nonce, https });
    }

    // GET-sidorna
    const nyckel = stig === '/app' ? 'oversikt' : SIDOR.find((s) => s.url === stig)?.nyckel;
    if (!nyckel) return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Sidan finns inte.', nonce, https });
    if (!farSe(anvandare, nyckel)) {
      // Rollen når inte sidan: skicka till den första den FÅR se i stället.
      const start = startsidaFor(anvandare);
      if (start !== stig) return omdirigera(res, start);
      return felsida(res, { kod: 403, rubrik: 'Inte din sida', text: 'Ditt konto når inte den sidan.', nonce, https });
    }
    return visaAppsida(res, { nyckel, anvandare, nonce, https, extra: { csrf, manad: url.searchParams.get('manad') } });
  }

  return felsida(res, { kod: 404, rubrik: 'Finns inte', text: 'Sidan finns inte.', nonce, https });
}

export function skapaServer() {
  return createServer((req, res) => {
    hantera(req, res).catch((e) => {
      console.error('Fel:', e);
      if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Något gick fel. Försök igen.');
    });
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT) || 4000;
  const vard = process.env.HOST || '0.0.0.0';
  skapaServer().listen(port, vard, () => {
    const snap = snapshot();
    console.log(`Stonebite kör på http://localhost:${port}`);
    console.log(`  Användare: ${ANVANDARFIL} (${anv.antal(ANVANDARFIL)} konton)`);
    console.log(`  Data:      ${existsSync(SNAPSHOT) ? `hämtad ${snap?.byggd ?? 'okänt'}` : 'ingen snapshot än — kör node stonebite/hamta.mjs'}`);
    if (anv.antal(ANVANDARFIL) === 0) console.log('  Första gången: öppna /kom-igang och skapa ägarkontot.');
    // Autosvarets minutserver (stonebite/autosvar-vakt.mjs): bara när AUTOSVAR_BRANDS är satt.
    autosvarVakt = startaVakt({ logg: (m) => console.log(`  ${m}`) });
    if (!autosvarVakt) console.log('  Autosvar:  av (AUTOSVAR_BRANDS är tomt) — sajten visar loggen ur snapshoten.');
    for (const sig of ['SIGTERM', 'SIGINT']) process.on(sig, () => { try { autosvarVakt?.stopp(); } catch { /* ok */ } process.exit(0); });
  });
}
