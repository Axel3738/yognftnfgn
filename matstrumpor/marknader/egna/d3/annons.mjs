// annons.mjs — bildannonsen D3 ("Köp 2 – få 2", sex lådor i pyramid) som annons 008 i alla tolv kampanjer.
//
//   node matstrumpor/marknader/egna/d3/annons.mjs          # torrt: visar annonserna och varnar
//   node matstrumpor/marknader/egna/d3/annons.mjs --skriv  # ritar bilderna i annonser/klar/ och skriver in 008 i <KOD>.json
//   sedan: node matstrumpor/marknader/annonser/nob.mjs && bygg.mjs --marknad <KOD> --skarpt   (PAUSED)
//
// Texterna i texter/<KOD>.json skrevs av en sonnet-subagent mot docs/copy-regler.md och granskades av
// infödda granskare per språk 2026-09-29 (fynden inlagda samma dag: rad 1 säger vad kunden FÅR — fyra
// lådor — eftersom bilden visar sex). WW är engelskspråkig och bär USA:s text och bild. Bilden ritas av
// rita.py på den textfria basen bas.png: ordmärket, underraden och pillret som skarp text, aldrig av
// bildmodellen.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
const ANNONSER = join(ROT, '..', '..', 'annonser');
export const KODER = ['NO', 'DK', 'FI', 'US', 'WW', 'DE', 'FR', 'NL', 'ES', 'IT', 'PL', 'PT', 'JP', 'TW'];
export const textKod = (kod) => (kod === 'WW' ? 'US' : kod);
export const namnFor = (kod) => `MATSTRUMP_${kod}_sushi_offer_static_008_v1`;
// Butikens namn och domän står aldrig i en annons (Axels beslut 2026-09-18).
const BUTIKSORD = /matstrumpor|\.se\b|\.no\b|\.com\b|\.eu\b/i;

/** Ren: textfilen → annonsen i kampanjfilens form. */
export function annonsFor(kod, t) {
  const k = textKod(kod);
  return {
    namn: namnFor(kod),
    kalla: `D3 Köp 2 – få 2 (bildannons: textfri bas bas.png + textlagret egna/d3/rita.py, texten egna/d3/texter/${k}.json, granskad av infödda 2026-09-29)`,
    bild: `klar/${k}_d3.jpg`,
    title: t.title,
    message: t.message,
    link_description: t.link_description,
  };
}

/** Ren: spärrarna. Tom lista = grön. */
export function fel(kampanjfil, annons, t) {
  const ut = [];
  const rader = annons.message.split('\n');
  const varumarke = kampanjfil.annonser.map((a) => a.message.split('\n').at(-1)).find(Boolean);
  if (varumarke && rader.at(-1) !== varumarke) ut.push(`sista raden "${rader.at(-1)}" är inte kampanjens varumärkesrad "${varumarke}"`);
  for (const [falt, v] of Object.entries({ title: annons.title, message: annons.message, link_description: annons.link_description, wordmark: t.wordmark, underrubrik: t.underrubrik, banner: t.banner })) {
    if (!v) ut.push(`${falt} saknas`);
    else if (BUTIKSORD.test(v)) ut.push(`${falt} nämner butiken eller en domän: "${v}"`);
    if (v && /\d+\s*(kr|€|\$|zł|nok|sek|eur|usd)/i.test(v)) ut.push(`${falt} bär ett pris — priset står bara på sidan`);
  }
  // Japan och Taiwan: talet fyra (四, en ensam 4:a) undviks i presenter — storleken 36–44 räknas inte.
  if (/^(JP|TW)$/.test(t.kod ?? '')) {
    for (const [falt, v] of Object.entries({ title: annons.title, message: annons.message, link_description: annons.link_description, underrubrik: t.underrubrik, banner: t.banner })) {
      if (v && /四|(?<![\d–-])4(?![\d–-])/u.test(v)) ut.push(`${falt} säger fyra — undviks i presenter i Japan och Taiwan`);
    }
  }
  const kryss = (t.tre_fragor ?? []).filter((r) => [r.visualisera, r.falsifiera, r.unik].includes('❌'));
  if (!t.tre_fragor?.length) ut.push('tre-frågorstestet saknas');
  for (const r of kryss) ut.push(`tre-frågorstestet har ❌: "${r.rad}"`);
  return ut;
}

/** Ren: kampanjfilen med annonsen inlagd (ersätter en äldre 008 med samma namn) och testraderna tillagda. */
export function laggIn(kampanjfil, annons, treFragor = []) {
  const annonser = kampanjfil.annonser.filter((a) => a.namn !== annons.namn);
  const kanda = new Set((kampanjfil.tre_fragor ?? []).map((r) => r.rad));
  return { ...kampanjfil, annonser: [...annonser, annons], tre_fragor: [...(kampanjfil.tre_fragor ?? []), ...treFragor.filter((r) => !kanda.has(r.rad))] };
}

function huvud() {
  const skriv = process.argv.includes('--skriv');
  let stopp = 0;
  const ritade = new Set();
  for (const kod of KODER) {
    const t = JSON.parse(readFileSync(join(ROT, 'texter', `${textKod(kod)}.json`), 'utf8'));
    const fil = join(ANNONSER, `${kod}.json`);
    const kampanjfil = JSON.parse(readFileSync(fil, 'utf8'));
    const annons = annonsFor(kod, t);
    const f = fel(kampanjfil, annons, t);
    if (f.length) { stopp++; console.log(`❌ ${kod}: ${f.join(' · ')}`); continue; }
    console.log(`✅ ${annons.namn} · ${annons.bild} · "${annons.title}"`);
    if (!skriv) continue;
    const bild = join(ANNONSER, annons.bild);
    if (!ritade.has(bild)) { execFileSync('python3', [join(ROT, 'rita.py'), join(ROT, 'texter', `${textKod(kod)}.json`), bild]); ritade.add(bild); }
    if (!existsSync(bild)) throw new Error(`${bild} ritades inte`);
    writeFileSync(fil, JSON.stringify(laggIn(kampanjfil, annons, t.tre_fragor), null, 1) + '\n');
  }
  console.log(stopp ? `\n${stopp} kampanjer stoppade — inget skrivet för dem.` : skriv ? `\nSkrivet: ${ritade.size} bilder, ${KODER.length} kampanjfiler. Kör nob.mjs och bygg.mjs.` : '\nTorrt — --skriv ritar och skriver.');
  if (stopp) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) huvud();
