#!/usr/bin/env node
// SPENDTJUVSSPÄRREN — hindrar att en hel kampanj stängs av när ett par enskilda
// annonser ätit spenden långt under break-even medan resten av kampanjen går plus.
//
// **Axels larm 2026-09-14.** Åtgärdstrappan stängde av Övervakningskameran och
// Adventskalendern Racingbilar på morgonen. Han startade om båda och skrev:
// "de båda hade haft någon enskild annons som hade dragit all spend som legat
// på dålig roas medans andra annonser var och visade väldigt goda tecken."
//
// Mätt i kontot samma dag (3-dagarsfönstret, MagiBorsten):
//   Övervakningskameran, break-even 1,57 — SP_2 (3 442 kr, ROAS 0,62),
//     CS_2 (1 958 kr, 1,09) och CS_3 (1 464 kr, 0,55) tog 89 % av spenden.
//     Resten av kampanjen: 874 kr på ROAS 3,62.
//   Adventskalendern, break-even 1,62 — PD_2_H1 (3 316 kr, ROAS 0,75) och
//     PD_2_1 (513 kr, 0,97) tog 89 %. Resten: 491 kr på ROAS 2,03.
//
// Den gamla potentialkollen letade efter en spendtjuv med **noll köp**. Båda
// tjuvarna hade köp — de var bara olönsamma. Därför föll kollen och båda
// kampanjerna dog trots en lönsam kärna.
//
// Skriptet RÄKNAR. Sessionen hämtar annonsraderna och utför domen — aldrig
// tvärtom. Samma skäl som för besked.mjs: ligger räkningen i kod blir svaret
// detsamma varje gång och går att testa.
//
//   node agent/spendtjuv.mjs --jobb <fil.json>          # rapport
//   node agent/spendtjuv.mjs --jobb <fil.json> --json   # maskindata
//
// Jobbfilen tål Metas egna strängar ordagrant ("3 316,26 kr (SEK)") — klistra
// in dem oförändrade, precis som i kontodata.json.

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lasBelopp } from './besked.mjs';

/**
 * En annons måste ha spenderat så här mycket för att få en egen dom.
 * Samma grind som CLAUDE.md regel 3 — under den är annonsen "osäker", inte dålig.
 */
export const TJUV_MIN_SPEND_SEK = 300;

/**
 * ...och ta minst så här stor del av kampanjens spend. En annons på 4 % av
 * spenden är inte det som dödade kampanjen, hur dålig den än är.
 */
export const TJUV_MIN_SPENDANDEL = 0.10;

/**
 * Hur långt under break-even annonsen måste ligga för att kallas tjuv.
 * 0,9 = minst 10 % under. En annons som ligger 2 % under break-even är brus,
 * inte en tjuv — och ROAS för de senaste dygnen revideras uppåt i efterhand.
 */
export const TJUV_MARGINAL = 0.9;

/**
 * Fler tjuvar än så och det är inte längre några enskilda annonser som är
 * problemet — då är det kampanjen. Då gäller trappan som vanligt.
 */
export const MAX_TJUVAR = 5;

/** Resten av kampanjen måste själv vara bedömbar, annars är domen en gissning. */
export const REST_MIN_SPEND_SEK = 300;
export const REST_MIN_KOP = 1;

/**
 * Hur många gånger en kampanj får räddas av spärren inom 14 dagar.
 * Utan taket kan en kampanj leva för evigt genom att tappa en annons om dagen.
 */
export const MAX_RADDNINGAR_14D = 3;

/** Domarna spärren kan fälla. */
export const DOM = {
  PAUSA_TJUVAR: 'PAUSA_TJUVAR',
  STANG_AV: 'STANG_AV',
  INGEN_TJUV: 'INGEN_TJUV',
};

/** Svenskt heltal med tusenmellanslag. */
function heltal(n) {
  return Math.round(Number(n)).toLocaleString('sv-SE');
}

/** Svenskt decimaltal med komma. */
function decimal(n, decimaler = 2) {
  return Number(n).toFixed(decimaler).replace('.', ',');
}

/**
 * Normaliserar en annonsrad från Meta. Tål både råa strängar och tal.
 * ROAS saknas de dygn inget sålts — det betyder noll intäkt, inte "vet inte":
 * annonsen har spenderat och inte sålt. Men bara om spenden går att läsa.
 */
export function lasAnnons(rad) {
  const spend = lasBelopp(rad.spend ?? rad.amount_spent);
  const roasRå = lasBelopp(rad.roas ?? rad.purchase_roas);
  const kopRå = lasBelopp(rad.kop ?? rad.omni_purchase);
  const status = String(rad.status ?? rad.effective_status ?? '').toUpperCase();
  return {
    id: String(rad.id ?? ''),
    namn: String(rad.namn ?? rad.name ?? ''),
    status,
    spend: Number.isFinite(spend) ? spend : null,
    roas: Number.isFinite(roasRå) ? roasRå : 0,
    kop: Number.isFinite(kopRå) ? kopRå : 0,
    // Intäkt räknas som spend × ROAS. omni_purchase_values är buggig i det här
    // kontot (100× för lågt på 5 av 8 rader) — se CLAUDE.md.
    intakt: Number.isFinite(spend) && Number.isFinite(roasRå) ? spend * roasRå : 0,
  };
}

/**
 * Hur mycket en annons dränerar kampanjen, uttryckt i kronor.
 * Vid break-even är intäkt = spend × break-even, alltså intäkt/break-even = spend
 * och dräneringen noll. Positivt tal = annonsen kostar mer än den drar in.
 */
export function dranering(annons, breakEven) {
  if (!Number.isFinite(annons.spend) || !(breakEven > 0)) return 0;
  return annons.spend - annons.intakt / breakEven;
}

/**
 * Fäller domen.
 *
 * @param {object} jobb
 * @param {Array} jobb.annonser      annonsrader ur Meta (level: ad, last_3d)
 * @param {number|string} jobb.spend_3d  kampanjens spend i samma fönster
 * @param {number} jobb.break_even   kampanjens break-even-ROAS ur kampanjnamnet
 * @param {number} [jobb.raddningar_14d]  antal PAUSA_TJUVAR-rader senaste 14 dygnen
 */
export function spendtjuvsdom(jobb = {}) {
  const breakEven = lasBelopp(jobb.break_even);
  const kampanjSpend = lasBelopp(jobb.spend_3d);
  const raddningar = Number(jobb.raddningar_14d ?? 0);

  if (!(breakEven > 0)) {
    return { dom: DOM.STANG_AV, tjuvar: [], raddade: [], motivering: 'Break-even saknas — spärren kan inte räkna och lämnar domen till trappan.' };
  }
  if (!(kampanjSpend > 0)) {
    return { dom: DOM.STANG_AV, tjuvar: [], raddade: [], motivering: 'Kampanjens spend saknas — spärren kan inte räkna och lämnar domen till trappan.' };
  }

  const alla = (Array.isArray(jobb.annonser) ? jobb.annonser : []).map(lasAnnons);
  const aktiva = alla.filter((a) => a.status === '' || a.status === 'ACTIVE');
  const bedombara = aktiva.filter((a) => Number.isFinite(a.spend));

  if (raddningar >= MAX_RADDNINGAR_14D) {
    return {
      dom: DOM.STANG_AV,
      tjuvar: [],
      raddade: [],
      motivering: `Spärren har redan räddat kampanjen ${raddningar} gånger på 14 dagar (taket är ${MAX_RADDNINGAR_14D}). Nya tjuvar varje dygn är ett kampanjproblem, inte ett annonsproblem.`,
    };
  }

  const tak = breakEven * TJUV_MARGINAL;
  const tjuvar = bedombara
    .filter((a) => a.spend >= TJUV_MIN_SPEND_SEK)
    .filter((a) => a.spend / kampanjSpend >= TJUV_MIN_SPENDANDEL)
    .filter((a) => a.roas < tak)
    .sort((a, b) => dranering(b, breakEven) - dranering(a, breakEven));

  if (tjuvar.length === 0) {
    return {
      dom: DOM.INGEN_TJUV,
      tjuvar: [],
      raddade: [],
      motivering: `Ingen enskild annons tog ≥${Math.round(TJUV_MIN_SPENDANDEL * 100)} % av spenden på en ROAS under ${decimal(tak)} (break-even ${decimal(breakEven)} minus marginalen). Förlusten sitter i kampanjen, inte i ett par annonser.`,
    };
  }

  if (tjuvar.length > MAX_TJUVAR) {
    return {
      dom: DOM.STANG_AV,
      tjuvar,
      raddade: [],
      motivering: `${tjuvar.length} annonser ligger under break-even med ≥${Math.round(TJUV_MIN_SPENDANDEL * 100)} % av spenden var (taket är ${MAX_TJUVAR}). Så många tjuvar är ett kampanjproblem.`,
    };
  }

  const tjuvIder = new Set(tjuvar.map((a) => a.id));
  const rest = bedombara.filter((a) => !tjuvIder.has(a.id));
  const restSpend = rest.reduce((s, a) => s + a.spend, 0);
  const restIntakt = rest.reduce((s, a) => s + a.intakt, 0);
  const restKop = rest.reduce((s, a) => s + a.kop, 0);
  const restRoas = restSpend > 0 ? restIntakt / restSpend : 0;

  const raddade = rest
    .filter((a) => a.kop > 0 && a.roas >= breakEven)
    .sort((a, b) => b.roas - a.roas);

  const gemensamt = {
    tjuvar,
    raddade,
    rest: { spend: restSpend, intakt: restIntakt, kop: restKop, roas: restRoas },
    break_even: breakEven,
    kampanj_spend: kampanjSpend,
    tjuvSpend: tjuvar.reduce((s, a) => s + a.spend, 0),
  };
  gemensamt.tjuvAndel = gemensamt.tjuvSpend / kampanjSpend;

  if (restSpend < REST_MIN_SPEND_SEK || restKop < REST_MIN_KOP) {
    return {
      ...gemensamt,
      dom: DOM.STANG_AV,
      motivering: `Resten av kampanjen är inte bedömbar utan tjuvarna: ${heltal(restSpend)} kr och ${restKop} köp (grinden går vid ${REST_MIN_SPEND_SEK} kr och ${REST_MIN_KOP} köp). Det finns ingen bevisat lönsam kärna att rädda.`,
    };
  }

  if (restRoas < breakEven) {
    return {
      ...gemensamt,
      dom: DOM.STANG_AV,
      motivering: `Även utan de ${tjuvar.length} tjuvarna ligger resten på ROAS ${decimal(restRoas)} mot break-even ${decimal(breakEven)} (${heltal(restSpend)} kr, ${restKop} köp). Kampanjen går back av egen kraft.`,
    };
  }

  const namn = tjuvar.map((a) => `${a.namn} (${heltal(a.spend)} kr, ROAS ${decimal(a.roas)})`).join(', ');
  return {
    ...gemensamt,
    dom: DOM.PAUSA_TJUVAR,
    motivering: `${tjuvar.length} spendtjuv${tjuvar.length > 1 ? 'ar' : ''} tog ${Math.round(gemensamt.tjuvAndel * 100)} % av spenden under break-even ${decimal(breakEven)}: ${namn}. Resten av kampanjen ligger på ROAS ${decimal(restRoas)} (${heltal(restSpend)} kr, ${restKop} köp) — över break-even. Pausa tjuvarna, låt kampanjen stå kvar.`,
  };
}

/** Rapporten en människa läser. */
export function formatera(utfall, jobb = {}) {
  const rader = [];
  rader.push(`SPENDTJUVSSPÄRREN — ${jobb.kampanj_namn ?? jobb.kampanj_id ?? 'okänd kampanj'}`);
  rader.push('='.repeat(70));
  rader.push(`Dom: ${utfall.dom}`);
  rader.push('');
  rader.push(utfall.motivering);
  if (utfall.tjuvar?.length) {
    rader.push('');
    rader.push('Tjuvar:');
    for (const a of utfall.tjuvar) {
      rader.push(`  ⛔ ${a.namn.padEnd(34)} ${heltal(a.spend).padStart(7)} kr  ${a.kop} köp  ROAS ${decimal(a.roas)}`);
    }
  }
  if (utfall.raddade?.length) {
    rader.push('');
    rader.push('Räddade (över break-even, hade dött med kampanjen):');
    for (const a of utfall.raddade) {
      rader.push(`  ✅ ${a.namn.padEnd(34)} ${heltal(a.spend).padStart(7)} kr  ${a.kop} köp  ROAS ${decimal(a.roas)}`);
    }
  }
  return rader.join('\n');
}

async function main(argv) {
  const jobbIndex = argv.indexOf('--jobb');
  if (jobbIndex === -1 || !argv[jobbIndex + 1]) {
    console.error('Användning: node agent/spendtjuv.mjs --jobb <fil.json> [--json]');
    process.exit(2);
  }
  const jobb = JSON.parse(readFileSync(argv[jobbIndex + 1], 'utf8'));
  const utfall = spendtjuvsdom(jobb);
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ ...utfall, kampanj_id: jobb.kampanj_id, kampanj_namn: jobb.kampanj_namn }, null, 2));
  } else {
    console.log(formatera(utfall, jobb));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main(process.argv.slice(2));
}
