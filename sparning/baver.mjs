// Bävernumret för kundtjänst: slå upp ett paket på ordernummer, fraktbolagets
// spårningsnummer eller bävernumret — och få alla tre tillbaka.
//
//   node sparning/baver.mjs "#7430"              # ordernummer (med eller utan #)
//   node sparning/baver.mjs YT2626100708674690   # fraktbolagets nummer
//   node sparning/baver.mjs BB-3F7A2C1D          # bävernumret
//   node sparning/baver.mjs --alla               # hela minnet som tabell
//
// Bävernumret är BB- + de åtta första hexsiffrorna i SHA-256 av
// spårningsnumret (bavernummer.mjs). Det räknas fram, lagras inte — därför
// behöver ingen "generera" något per order: mejlet räknar det med Liquid,
// sidan bär det i datan, och det här skriptet räknar det ur minnet.
//
// Minnet är sparning/lage.json (ordernummer ↔ spårningsnummer för paket som
// rundan följt de senaste 60 dagarna). Ett paket som inte finns där har inte
// passerat rundan än — ge då skriptet fraktbolagets nummer direkt, för
// bävernumret går alltid att räkna ut det.
//
// Inget nät. Inga skrivningar.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { bavernummer, arBavernummer, normalisera } from './bavernummer.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const LAGE = join(ROT, 'lage.json');

export function lasMinne(fil = LAGE) {
  if (!existsSync(fil)) return [];
  const lage = JSON.parse(readFileSync(fil, 'utf8'));
  return Object.entries(lage.paket ?? {}).map(([nummer, p]) => ({
    nummer,
    baver: bavernummer(nummer),
    order: p.order ?? null,
    bolag: p.bolag ?? null,
    status: p.status ?? null,
    senast: p.senast ?? null,
    levererad: p.levererad ?? null,
  }));
}

// Ett ordernummer är "#7430", "7430" eller "order 7430". Allt annat är ett
// nummer av något slag.
export function tolkaFraga(text) {
  const t = String(text ?? '').trim();
  // Med # eller ordet "order" är det alltid ett ordernummer; utan är det
  // ett ordernummer bara om det är 3–7 siffror (spårningsnummer är längre
  // och bär bokstäver).
  const order = t.match(/^(?:order\s*|#\s*|order\s*#\s*)(\d+)$/i) ?? t.match(/^(\d{3,7})$/);
  if (order) return { typ: 'order', varde: `#${order[1]}` };
  if (arBavernummer(t)) return { typ: 'baver', varde: normalisera(t).replace(/^BB/, 'BB-') };
  return { typ: 'sparning', varde: normalisera(t) };
}

export function slaUpp(text, minne) {
  const f = tolkaFraga(text);
  if (f.typ === 'order') return { fraga: f, traffar: minne.filter((p) => p.order === f.varde) };
  if (f.typ === 'baver') return { fraga: f, traffar: minne.filter((p) => p.baver === f.varde) };
  const traffar = minne.filter((p) => normalisera(p.nummer) === f.varde);
  // Ett spårningsnummer som inte finns i minnet ger ändå sitt bävernummer.
  if (!traffar.length && f.varde) traffar.push({ nummer: f.varde, baver: bavernummer(f.varde), order: null, bolag: null, status: null, senast: null, levererad: null, utanforMinnet: true });
  return { fraga: f, traffar };
}

function rad(p) {
  return `${p.baver}  ${p.nummer.padEnd(20)}  ${(p.order ?? '–').padEnd(7)}  ${(p.status ?? '–').padEnd(16)}  ${p.levererad ? `levererat ${p.levererad}` : p.senast ? `senast ${p.senast}` : ''}${p.utanforMinnet ? '  (inte i minnet — bävernumret är räknat)' : ''}`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = process.argv.slice(2);
  const minne = lasMinne();
  if (arg.includes('--alla')) {
    console.log(`Bävernummer   Spårningsnummer       Order    Status            Senast`);
    for (const p of minne.sort((a, b) => (b.senast ?? '').localeCompare(a.senast ?? ''))) console.log(rad(p));
    console.log(`\n${minne.length} paket i sparning/lage.json.`);
    process.exit(0);
  }
  const fraga = arg.filter((a) => !a.startsWith('--')).join(' ');
  if (!fraga) {
    console.log('Ange ett ordernummer (#7430), ett spårningsnummer (YT…) eller ett bävernummer (BB-…). --alla listar minnet.');
    process.exit(2);
  }
  const { fraga: f, traffar } = slaUpp(fraga, minne);
  if (!traffar.length) {
    console.log(f.typ === 'order'
      ? `Ordern ${f.varde} finns inte i minnet (${minne.length} paket, 60 dagar). Öppna ordern i Shopify, kopiera spårningsnumret och kör skriptet med det i stället — bävernumret räknas alltid.`
      : `Bävernumret ${f.varde} finns inte bland de ${minne.length} paketen i minnet. Kunden kan ha skrivit fel — be om ordernumret.`);
    process.exit(1);
  }
  console.log(`Bävernummer   Spårningsnummer       Order    Status            Senast`);
  for (const p of traffar) console.log(rad(p));
  console.log(`\nKundens länk: https://baverbutiken.se/pages/spara?nummer=${traffar[0].baver}`);
}
