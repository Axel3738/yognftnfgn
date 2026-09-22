// auth.mjs — lösenord, sessioner och de små spärrarna runt inloggningen.
// Noll beroenden: allt bygger på node:crypto.
//
// Tre saker händer här, och bara här:
//   1. Lösenord hashas med scrypt (aldrig i klartext, aldrig i en logg).
//   2. Sessionen bärs av en signerad kaka — servern behöver inget minne, så
//      en omstart av containern loggar inte ut någon.
//   3. Formulären bär en CSRF-nyckel, så ingen annan sajt kan posta åt dig.
//
// Hemligheten som signerar kakorna kommer ur STONEBITE_HEMLIGHET. Saknas den
// skapas en slumpad fil (stonebite/data/hemlighet.txt, gitignorerad). Byts
// hemligheten loggas alla ut — det är meningen.

import { randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';

const SCRYPT = Object.freeze({ N: 16384, r: 8, p: 1, langd: 32 });
export const SESSION_TIMMAR = 24 * 14; // två veckor
export const KAKA = 'stonebite_session';

// ------------------------------------------------------------- lösenord

/** Lösenord → "scrypt$N$r$p$salt$hash" (base64). Hashen går inte att vända. */
export function hashaLosenord(losenord) {
  const text = String(losenord ?? '');
  if (text.length < 8) throw new Error('Lösenordet måste vara minst 8 tecken.');
  const salt = randomBytes(16);
  const hash = scryptSync(text, salt, SCRYPT.langd, { N: SCRYPT.N, r: SCRYPT.r, p: SCRYPT.p });
  return ['scrypt', SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString('base64'), hash.toString('base64')].join('$');
}

/** Stämmer lösenordet mot det lagrade? Jämförelsen är tidskonstant. */
export function kollaLosenord(losenord, lagrat) {
  try {
    const delar = String(lagrat ?? '').split('$');
    if (delar.length !== 6 || delar[0] !== 'scrypt') return false;
    const [, N, r, p, salt, hash] = delar;
    const vantat = Buffer.from(hash, 'base64');
    const test = scryptSync(String(losenord ?? ''), Buffer.from(salt, 'base64'), vantat.length, {
      N: Number(N), r: Number(r), p: Number(p),
    });
    return test.length === vantat.length && timingSafeEqual(test, vantat);
  } catch {
    return false;
  }
}

const ORD = ['berg', 'sten', 'bäver', 'vind', 'norr', 'segel', 'björk', 'fyr', 'malm', 'vik', 'skär', 'tall', 'ek', 'is', 'sol'];

/** Ett läsbart engångslösenord: två ord, ett tal, ett tecken. */
export function slumpLosenord() {
  const val = () => ORD[randomBytes(1)[0] % ORD.length];
  const tal = 100 + (randomBytes(2).readUInt16BE(0) % 900);
  return `${val()}-${val()}-${tal}`;
}

// ------------------------------------------------------------ hemlighet

export function hamtaHemlighet(env = process.env, fil = null) {
  const ur = String(env.STONEBITE_HEMLIGHET ?? '').trim();
  if (ur.length >= 16) return ur;
  if (!fil) return null;
  if (existsSync(fil)) {
    const sparad = readFileSync(fil, 'utf8').trim();
    if (sparad.length >= 16) return sparad;
  }
  mkdirSync(dirname(fil), { recursive: true });
  const ny = randomBytes(32).toString('base64url');
  writeFileSync(fil, `${ny}\n`, { mode: 0o600 });
  try { chmodSync(fil, 0o600); } catch { /* filsystem utan lägen */ }
  return ny;
}

// ------------------------------------------------------------ sessioner

function signera(text, hemlighet) {
  return createHmac('sha256', hemlighet).update(text).digest('base64url');
}

/** Sessionskaka för en användare. Innehållet är läsbart men inte ändringsbart. */
export function skapaSession(anvandare, hemlighet, { nu = Date.now(), timmar = SESSION_TIMMAR } = {}) {
  const payload = {
    id: anvandare.id,
    roll: anvandare.roll,
    skapad: nu,
    gar_ut: nu + timmar * 3600_000,
    // Lösenordsbyte ogiltigförklarar gamla kakor: stämpeln följer med.
    v: anvandare.losenordAndrat ?? 0,
  };
  const kropp = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${kropp}.${signera(kropp, hemlighet)}`;
}

/** Kakan → sessionen, eller null om den är pillad på, utgången eller trasig. */
export function lasSession(varde, hemlighet, { nu = Date.now() } = {}) {
  const text = String(varde ?? '');
  const punkt = text.lastIndexOf('.');
  if (punkt < 1) return null;
  const kropp = text.slice(0, punkt);
  const namn = text.slice(punkt + 1);
  const vantat = signera(kropp, hemlighet);
  if (namn.length !== vantat.length) return null;
  if (!timingSafeEqual(Buffer.from(namn), Buffer.from(vantat))) return null;
  try {
    const p = JSON.parse(Buffer.from(kropp, 'base64url').toString('utf8'));
    if (!p?.id || typeof p.gar_ut !== 'number' || p.gar_ut < nu) return null;
    return p;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------- CSRF

/** Formulärnyckel bunden till sessionen. Giltig i tolv timmar. */
export function csrfNyckel(sessionVarde, hemlighet, { nu = Date.now() } = {}) {
  const fonster = Math.floor(nu / (12 * 3600_000));
  return signera(`csrf:${fonster}:${String(sessionVarde ?? 'anonym')}`, hemlighet).slice(0, 32);
}

/** Accepterar nuvarande och föregående fönster, så ett öppet formulär inte dör. */
export function kollaCsrf(nyckel, sessionVarde, hemlighet, { nu = Date.now() } = {}) {
  const test = String(nyckel ?? '');
  if (test.length !== 32) return false;
  for (const skift of [0, -12 * 3600_000]) {
    const giltig = csrfNyckel(sessionVarde, hemlighet, { nu: nu + skift });
    if (test.length === giltig.length && timingSafeEqual(Buffer.from(test), Buffer.from(giltig))) return true;
  }
  return false;
}

// ------------------------------------------------------------- strypning

/**
 * Bromsar gissningar: fem försök, sedan fem minuters vila per nyckel
 * (e-post + IP). Lever i minnet — en omstart nollställer, och det är okej:
 * spärren ska stoppa en robot som maler på, inte vara ett arkiv.
 */
export class Strypning {
  constructor({ tak = 5, vilaMs = 5 * 60_000, fonsterMs = 15 * 60_000 } = {}) {
    Object.assign(this, { tak, vilaMs, fonsterMs });
    this.forsok = new Map();
  }

  /** → { tillaten, kvar, sekunder } */
  kolla(nyckel, nu = Date.now()) {
    const p = this.forsok.get(nyckel);
    if (!p || nu - p.senast > this.fonsterMs) return { tillaten: true, kvar: this.tak, sekunder: 0 };
    if (p.antal >= this.tak && nu - p.senast < this.vilaMs) {
      return { tillaten: false, kvar: 0, sekunder: Math.ceil((this.vilaMs - (nu - p.senast)) / 1000) };
    }
    if (p.antal >= this.tak) return { tillaten: true, kvar: this.tak, sekunder: 0 };
    return { tillaten: true, kvar: this.tak - p.antal, sekunder: 0 };
  }

  miss(nyckel, nu = Date.now()) {
    const p = this.forsok.get(nyckel);
    const farsk = !p || nu - p.senast > this.fonsterMs || (p.antal >= this.tak && nu - p.senast >= this.vilaMs);
    this.forsok.set(nyckel, { antal: farsk ? 1 : p.antal + 1, senast: nu });
  }

  traff(nyckel) {
    this.forsok.delete(nyckel);
  }
}
