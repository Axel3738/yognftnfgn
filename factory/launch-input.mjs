// LAUNCH-INPUT: den enda filen Axel fyller i före launch.
//
// Värdena läggs ovanpå butikskonfigen och produktfilen på rätt ställen —
// bolagsuppgifterna in i butiken (villkor, kontaktsida, köpvillkor),
// bilderna in i produktens media, tracking in i meta-fälten, och domänen
// blir ett krav som LAUNCH-verifieringen mäter butiken mot.
// Tomma rader ignoreras; det som saknas fångas av den vanliga QA:n.

import { readFileSync, existsSync } from 'node:fs';
import { lasYaml } from './yaml.mjs';

const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const lista = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim() !== '') : []);

const FALT = [
  'bolagsnamn',
  'orgnr',
  'adress',
  'supportmail',
  'doman',
  'produktbilder',
  'pixel_id',
  'ad_account_id',
  'page_id',
];

export function lasLaunchInput(sokvag) {
  if (!existsSync(sokvag)) return null;
  const input = lasYaml(readFileSync(sokvag, 'utf8'));
  const ifyllt = [];
  const saknas = [];
  for (const falt of FALT) {
    const har = falt === 'produktbilder' ? lista(input[falt]).length > 0 : text(input[falt]) !== null;
    (har ? ifyllt : saknas).push(falt);
  }
  return { input, ifyllt, saknas };
}

// Muterar butik och produkt (rådata, före sammanfogningen) med de ifyllda
// värdena. Returnerar vad som applicerades — för loggen, aldrig värdena själva.
export function tillampaLaunchInput(butik, produkt, input) {
  const applicerat = [];

  const bolag = {
    bolagsnamn: 'bolagsnamn',
    orgnr: 'orgnr',
    adress: 'adress',
    supportmail: 'supportmail',
  };
  butik.butik = butik.butik ?? {};
  for (const [fran, till] of Object.entries(bolag)) {
    const varde = text(input[fran]);
    if (varde) {
      butik.butik[till] = varde;
      applicerat.push(`${fran} → butiken`);
    }
  }

  const bilder = lista(input.produktbilder);
  if (bilder.length > 0) {
    produkt.media = { ...(produkt.media ?? {}), bilder };
    applicerat.push(`produktbilder (${bilder.length} st) → produkten`);
  }

  produkt.meta = produkt.meta ?? {};
  for (const falt of ['pixel_id', 'ad_account_id', 'page_id']) {
    const varde = text(input[falt]);
    if (varde) {
      produkt.meta[falt] = varde;
      applicerat.push(`${falt} → tracking`);
    }
  }

  const doman = text(input.doman);
  if (doman) {
    produkt.launch = { ...(produkt.launch ?? {}), doman: doman.replace(/^https?:\/\//, '').replace(/\/.*$/, '') };
    applicerat.push('doman → launch-kravet');
  }

  return applicerat;
}
