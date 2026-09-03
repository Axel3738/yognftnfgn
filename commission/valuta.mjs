// valuta.mjs — växelkursen SEK → USD för redigerarnas topplista.
//
// Annonskontona är i kronor, redigerarna räknar i dollar. Kursen får aldrig
// gissas: den hämtas från Frankfurter (Europeiska centralbankens dagskurser),
// sparas med sitt eget datum och visas på sidan tillsammans med datumet.
//
// Hämtas en gång per dygn. Går nätet inte att nå används den sparade kursen,
// och den märks som gammal — hellre gårdagens riktiga kurs än en påhittad.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const ROT = resolve(new URL('..', import.meta.url).pathname);
export const KURSFIL = `${ROT}/commission/valutakurs.json`;
export const KALLA = 'https://api.frankfurter.dev/v1/latest?base=SEK&symbols=USD';

/** Rimlighetsspärr. En krona har legat mellan 8 och 13 cent i modern tid;
 *  ett svar utanför spannet är ett trasigt API, inte en kursrörelse. */
export const RIMLIGT = { min: 0.05, max: 0.25 };

export function rimlig(kurs) {
  return Number.isFinite(kurs) && kurs > RIMLIGT.min && kurs < RIMLIGT.max;
}

export function lasKurs(fil = KURSFIL) {
  if (!existsSync(fil)) return null;
  try {
    const k = JSON.parse(readFileSync(fil, 'utf8'));
    return rimlig(k?.kurs) ? k : null;
  } catch {
    return null;
  }
}

function spara(kurs, fil = KURSFIL) {
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, `${JSON.stringify(kurs, null, 2)}\n`);
}

/** Dagens kurs som ett tal, eller null om svaret inte går att lita på. */
export function tolkaSvar(text) {
  let data;
  try { data = JSON.parse(text); } catch { return null; }
  const kurs = Number(data?.rates?.USD);
  if (!rimlig(kurs)) return null;
  return { kurs, datum: String(data.date ?? '').slice(0, 10) || null };
}

/**
 * Hämtar kursen. Är den sparade kursen redan hämtad i dag används den —
 * en handkörning ska inte ringa upp banken en gång till.
 *
 * @returns {Promise<{kurs:number, datum:string, hamtad:string, kalla:string, gammal:boolean}>}
 */
export async function hamtaKurs({ fil = KURSFIL, idag = new Date().toISOString().slice(0, 10) } = {}) {
  const sparad = lasKurs(fil);
  if (sparad?.hamtad?.slice(0, 10) === idag) return { ...sparad, gammal: false };

  try {
    const svar = await fetch(KALLA, { signal: AbortSignal.timeout(20000) });
    if (!svar.ok) throw new Error(`HTTP ${svar.status}`);
    const tolkad = tolkaSvar(await svar.text());
    if (!tolkad) throw new Error('Orimligt eller oläsbart svar');
    const ny = { kurs: tolkad.kurs, datum: tolkad.datum ?? idag, hamtad: new Date().toISOString(), kalla: KALLA };
    spara(ny, fil);
    return { ...ny, gammal: false };
  } catch (fel) {
    if (sparad) return { ...sparad, gammal: true, fel: String(fel.message ?? fel) };
    throw new Error(`Växelkursen SEK→USD gick inte att hämta och ingen sparad kurs finns: ${fel.message ?? fel}`);
  }
}

/** SEK → USD med öresavrundning på cent. */
export function tillUsd(sek, kurs) {
  return Math.round(Number(sek) * Number(kurs) * 100) / 100;
}
