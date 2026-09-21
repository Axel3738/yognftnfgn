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
import { farSe, harRatt, startsidaFor, SIDOR } from './roller.mjs';
import { lasSnapshot } from './data.mjs';
import { publikSida } from './vy/publik.mjs';
import { loginSida, uppstartSida } from './vy/login.mjs';
import { oversiktSida } from './vy/oversikt.mjs';
import { butikerSida } from './vy/butiker.mjs';
import { annonserSida } from './vy/annonser.mjs';
import { redigerareSida, migSida, kontonSida } from './vy/team.mjs';
import { kundtjanstSida, leveransSida } from './vy/drift.mjs';
import { appSkal } from './vy/layout.mjs';
import { lasProfil } from './kallor/repo.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = dirname(HAR);
const WEBB = join(HAR, 'webb');
const SNAPSHOT = join(HAR, 'data', 'snapshot.json');
const ANVANDARFIL = process.env.STONEBITE_ANVANDARE || anv.standardfil(HAR);
const HEMLIGHET = hamtaHemlighet(process.env, join(HAR, 'data', 'hemlighet.txt'));

const strypning = new Strypning();

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
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

function omdirigera(res, till, { kaka = null } = {}) {
  const rubriker = { Location: till, 'Cache-Control': 'no-store' };
  if (kaka) rubriker['Set-Cookie'] = kaka;
  res.writeHead(303, rubriker);
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
  res.writeHead(200, { 'Content-Type': typ, 'Cache-Control': 'public, max-age=300' });
  res.end(readFileSync(fil));
  return true;
}

function snapshot() {
  return lasSnapshot(SNAPSHOT);
}

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

function renderaApp({ nyckel, anvandare, extra = {} }) {
  const snap = snapshot();
  switch (nyckel) {
    case 'oversikt': return oversiktSida({ snapshot: snap, anvandare });
    case 'butiker': return butikerSida({ snapshot: snap });
    case 'annonser': return annonserSida({ snapshot: snap });
    case 'redigerare': return redigerareSida({ snapshot: snap, anvandare });
    case 'kundtjanst': return kundtjanstSida({ snapshot: snap });
    case 'leverans': return leveransSida({ snapshot: snap });
    case 'mig': return migSida({ snapshot: snap, anvandare, ...extra });
    case 'konton': return kontonSida({
      konton: anv.lista(ANVANDARFIL),
      anvandare,
      folk: snap?.redigerare?.folk ?? [],
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
    return res.end(JSON.stringify({ ok: true, snapshot: snap?.byggd ?? null, konton: anv.antal(ANVANDARFIL) }));
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
        const konto = anv.skapa(ANVANDARFIL, { namn: f.namn, epost: f.epost, roll: 'agare', losenord: f.losenord });
        const full = anv.hittaPaId(ANVANDARFIL, konto.id);
        return omdirigera(res, '/app', { kaka: sattKaka(skapaSession(full, HEMLIGHET), { https }) });
      } catch (e) {
        return visaFel(e.message);
      }
    }
    return omdirigera(res, '/kom-igang');
  }

  // --------------------------------------------------------- publikt
  if (stig === '/' && req.method === 'GET') {
    const snap = snapshot();
    const profil = snap?.profil ?? lasProfil(ROT);
    const butiker = (snap?.butiker ?? []).filter((b) => b.status === 'ok').length;
    const marknader = new Set((snap?.butiker ?? []).filter((b) => b.status === 'ok').map((b) => b.valuta)).size;
    return svaraHtml(res, publikSida({
      profil,
      fakta: butiker ? { butiker, marknader } : null,
      inloggad: Boolean(anvandare),
      nonce,
    }), { nonce, https });
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

    // POST-åtgärderna först
    if (req.method === 'POST') {
      const f = tolkaFormular(await lasKropp(req));
      if (!kollaCsrf(f.csrf, kakvarde, HEMLIGHET)) {
        return felsida(res, { kod: 400, rubrik: 'Försök igen', text: 'Formuläret var för gammalt. Gå tillbaka och försök igen.', nonce, https });
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

      if (stig.startsWith('/app/konton/')) {
        if (!harRatt(anvandare, 'konton')) {
          return felsida(res, { kod: 403, rubrik: 'Inte din sida', text: 'Bara ägaren kan ändra konton.', nonce, https });
        }
        const extra = { csrf };
        try {
          if (stig === '/app/konton/ny') {
            const losen = slumpLosenord();
            const ny = anv.skapa(ANVANDARFIL, { namn: f.namn, epost: f.epost, roll: f.roll, personId: f.personId || null, losenord: losen });
            extra.nyttLosenord = { namn: ny.namn, losenord: losen };
            extra.meddelande = `${ny.namn} kan nu logga in med ${ny.epost}.`;
          } else if (stig === '/app/konton/roll') {
            const k = anv.sattRoll(ANVANDARFIL, f.id, f.roll);
            extra.meddelande = `${k.namn} är nu ${f.roll}.`;
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
    return visaAppsida(res, { nyckel, anvandare, nonce, https, extra: { csrf } });
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
  });
}
