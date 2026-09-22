// anvandare.mjs — vilka som kan logga in. En JSON-fil, inget mer.
//
// Filen (stonebite/data/anvandare.json) bär bara hashade lösenord, så den kan
// ligga i repot utan att någon kommer åt ett konto med den. Den som lägger
// till folk gör det på sidan Konton — aldrig genom att handredigera filen.
//
// Varje ändring skrivs atomiskt (skriv till .tmp, byt namn), så en krasch mitt
// i aldrig kan lämna en halv fil efter sig och låsa ute alla.

import { readFileSync, writeFileSync, renameSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { hashaLosenord, kollaLosenord } from './auth.mjs';
import { ROLLNYCKLAR } from './roller.mjs';

export function standardfil(rot) {
  return join(rot, 'data', 'anvandare.json');
}

export function normaliseraEpost(epost) {
  return String(epost ?? '').trim().toLowerCase();
}

function tomtRegister() {
  return {
    kommentar: 'Inloggningarna till stonebite.org. Lösenorden är scrypt-hashade — filen går inte att logga in med. Lägg till folk på sidan Konton, inte här.',
    anvandare: [],
  };
}

export function las(fil) {
  if (!existsSync(fil)) return tomtRegister();
  try {
    const r = JSON.parse(readFileSync(fil, 'utf8'));
    return { ...tomtRegister(), ...r, anvandare: Array.isArray(r.anvandare) ? r.anvandare : [] };
  } catch (e) {
    throw new Error(`${fil} går inte att läsa som JSON (${e.message}). Rör inte filen för hand — kopiera undan den och starta om.`);
  }
}

export function spara(fil, register) {
  mkdirSync(dirname(fil), { recursive: true });
  const tmp = `${fil}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(register, null, 2)}\n`, { mode: 0o600 });
  renameSync(tmp, fil);
  return register;
}

/** Alla konton, nyast sist. Lösenordshashen följer aldrig med ut. */
export function lista(fil) {
  return las(fil).anvandare.map(utanHemlighet);
}

export function utanHemlighet(a) {
  const { losenord, ...resten } = a ?? {};
  return resten;
}

export function hittaPaEpost(fil, epost) {
  const e = normaliseraEpost(epost);
  return las(fil).anvandare.find((a) => normaliseraEpost(a.epost) === e) ?? null;
}

export function hittaPaId(fil, id) {
  return las(fil).anvandare.find((a) => a.id === id) ?? null;
}

export function antal(fil) {
  return las(fil).anvandare.length;
}

/**
 * Lägger till ett konto. Lösenordet får skickas med (Axel skriver ett själv)
 * eller utsläppt — då returneras ett slumpat som anroparen visar EN gång.
 */
export function skapa(fil, { namn, epost, roll, personId = null, losenord }) {
  const register = las(fil);
  const e = normaliseraEpost(epost);
  if (!namn || !String(namn).trim()) throw new Error('Namnet saknas.');
  if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error('E-postadressen ser inte ut som en adress.');
  if (!ROLLNYCKLAR.includes(roll)) throw new Error(`Okänd roll "${roll}". Välj en av: ${ROLLNYCKLAR.join(', ')}.`);
  if (register.anvandare.some((a) => normaliseraEpost(a.epost) === e)) throw new Error(`${e} har redan ett konto.`);

  const konto = {
    id: randomBytes(8).toString('hex'),
    namn: String(namn).trim(),
    epost: e,
    roll,
    personId: personId ? String(personId).trim() : null,
    losenord: hashaLosenord(losenord),
    losenordAndrat: Date.now(),
    skapad: new Date().toISOString(),
    senastInloggad: null,
    aktiv: true,
  };
  register.anvandare.push(konto);
  spara(fil, register);
  return utanHemlighet(konto);
}

function andra(fil, id, fn) {
  const register = las(fil);
  const konto = register.anvandare.find((a) => a.id === id);
  if (!konto) throw new Error('Kontot finns inte.');
  fn(konto);
  spara(fil, register);
  return utanHemlighet(konto);
}

export function sattLosenord(fil, id, losenord) {
  return andra(fil, id, (k) => {
    k.losenord = hashaLosenord(losenord);
    k.losenordAndrat = Date.now();
  });
}

export function sattRoll(fil, id, roll) {
  if (!ROLLNYCKLAR.includes(roll)) throw new Error(`Okänd roll "${roll}".`);
  return andra(fil, id, (k) => { k.roll = roll; });
}

export function sattAktiv(fil, id, aktiv) {
  return andra(fil, id, (k) => {
    k.aktiv = Boolean(aktiv);
    // Avstängd ⇒ gamla sessionskakor ska dö direkt, inte om två veckor.
    if (!aktiv) k.losenordAndrat = Date.now();
  });
}

export function sattSprak(fil, id, sprak) {
  const giltigt = ['sv', 'en'].includes(String(sprak ?? '').toLowerCase()) ? String(sprak).toLowerCase() : null;
  if (!giltigt) throw new Error('Okänt språk.');
  return andra(fil, id, (k) => { k.sprak = giltigt; });
}

export function sattPerson(fil, id, personId) {
  return andra(fil, id, (k) => { k.personId = personId ? String(personId).trim() : null; });
}

export function stampla(fil, id, nu = new Date()) {
  try {
    return andra(fil, id, (k) => { k.senastInloggad = nu.toISOString(); });
  } catch {
    return null; // en borttagen användare ska inte krascha en sidvisning
  }
}

export function taBort(fil, id) {
  const register = las(fil);
  const kvar = register.anvandare.filter((a) => a.id !== id);
  if (kvar.length === register.anvandare.length) throw new Error('Kontot finns inte.');
  if (!kvar.some((a) => a.roll === 'agare' && a.aktiv !== false)) {
    throw new Error('Det måste finnas minst en aktiv ägare — annars kommer ingen in igen.');
  }
  spara(fil, { ...register, anvandare: kvar });
  return true;
}

/**
 * Inloggningsförsök. Returnerar kontot utan hemlighet, eller null.
 * Samma svarstid oavsett om adressen finns: ett okänt konto kollas ändå mot
 * en dummyhash, annars går det att lista ut vilka adresser som existerar.
 */
const DUMMY = hashaLosenord('dummy-losenord-som-aldrig-stammer');

export function loggaIn(fil, epost, losenord) {
  const konto = hittaPaEpost(fil, epost);
  const ok = kollaLosenord(losenord, konto?.losenord ?? DUMMY);
  if (!konto || !ok || konto.aktiv === false) return null;
  return utanHemlighet(konto);
}
