// Lägg till paket UTAN Shopify-order på en butiks spårningssida — t.ex.
// paket till influencers (Axels beställning 2026-09-29: "jag vill inte
// skicka Kina-länken"). Mottagaren får butikens eget nummer (MS-/CS-/BB-)
// och sidlänken, aldrig fraktbolagets YT-nummer.
//
//   node sparning/lagg-till.mjs --butik matstrumpor YT2626800704776460 --notering "influencer"
//   node sparning/lagg-till.mjs --butik carashell YT… YT… --torr
//
// Paketet registreras hos 17TRACK (kostar kvot, ett per nummer) och skrivs
// in i butikens paketminne med `manuell` + `tillagd`. Timrutinen (kor.mjs)
// tar sedan med det på sidan som vilket minnespaket som helst — inga event
// i Shopify, det finns ingen order att skriva i. Manuella paket städas bort
// 60 dagar efter `tillagd` (kor.mjs steg 6).
//
// Namn skrivs ALDRIG i minnet (lage.json committas). Noteringen är fri text
// — skriv "influencer", inte personens namn.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { lasButik, butikIdUr, skapaMappar } from './butik.mjs';
import { registrera, nyckel } from './17track.mjs';
import { bavernummer, normalisera } from './bavernummer.mjs';

const arg = process.argv.slice(2);
const torr = arg.includes('--torr');
const iNot = arg.indexOf('--notering');
const notering = iNot >= 0 ? arg[iNot + 1] : 'manuellt tillagd';
const hoppa = new Set();
for (const f of ['--butik', '--notering']) { const i = arg.indexOf(f); if (i >= 0) { hoppa.add(i); hoppa.add(i + 1); } }
const nummer = arg.filter((a, i) => !hoppa.has(i) && !a.startsWith('--')).map(normalisera);

if (!nummer.length) { console.error('Ange minst ett spårningsnummer.'); process.exit(1); }
const BUTIK = lasButik(butikIdUr(arg));
const LAGE = skapaMappar(BUTIK).lage;
const lage = existsSync(LAGE) ? JSON.parse(readFileSync(LAGE, 'utf8')) : { paket: {} };
lage.paket ??= {};

const nya = nummer.filter((n) => !lage.paket[n]?.registrerad);
console.log(`Butik: ${BUTIK.namn}. ${nummer.length} nummer, ${nya.length} nya att registrera.`);
let accepterade = [];
if (nya.length && !torr) {
  if (!nyckel()) console.log('TRACK17_API_KEY saknas här — paketen sparas oregistrerade och timrutinen (kor.mjs) registrerar dem vid nästa körning.');
}
if (nya.length && !torr && nyckel()) {
  const r = await registrera(nya.map((n) => ({ number: n })));
  // "Redan registrerat" hos 17TRACK räknas som klart — numret går att läsa.
  accepterade = [...r.accepterade, ...r.avvisade.filter((a) => /already|-18019901/i.test(`${a.kod} ${a.fel}`)).map((a) => a.number)];
  for (const a of r.avvisade.filter((a) => !accepterade.includes(a.number))) console.log(`❌ 17TRACK avvisade ${a.number}: ${a.kod} ${a.fel}`);
}
const idag = new Date().toISOString().slice(0, 10);
for (const n of nummer) {
  const reg = lage.paket[n]?.registrerad ?? (accepterade.includes(n) ? idag : undefined);
  if (!torr) Object.assign((lage.paket[n] ??= {}), { bolag: lage.paket[n]?.bolag ?? '', kod: null, order: null, fulfillment: null, ...(reg ? { registrerad: reg } : {}), manuell: notering, tillagd: lage.paket[n]?.tillagd ?? idag });
  const eget = bavernummer(n, BUTIK.prefix);
  console.log(`${eget}  ${n}  ${BUTIK.url}/pages/${BUTIK.handle ?? 'spara'}?nummer=${eget}`);
}
if (!torr) writeFileSync(LAGE, `${JSON.stringify(lage, null, 1)}\n`);
console.log(torr ? '--torr: inget registrerat, inget sparat.' : 'Sparat. Kör kor.mjs för butiken så syns paketen på sidan direkt.');
