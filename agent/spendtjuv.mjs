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
 * ...och dränera minst så här många KRONOR i fönstret.
 *
 * Det här är grinden som skiljer en riktig tjuv från en tunn avläsning. En
 * annons med 513 kr spend och ETT köp kan visa ROAS 0,97 i dag och 3,04 sett
 * över livstiden — ett enda sent attribuerat köp vänder talet. Den dränerar
 * 205 kr och är brus. En annons som dränerar 2 078 kr är ett beslut.
 *
 * *(Lagt till 2026-09-14 samma dag som spärren byggdes: första skarpa körningen
 * pausade Adventskalender_PD_2_1 på 1 köp i fönstret, trots livstids-ROAS 3,04.
 * Det var precis det misstag spärren finns för att hindra, en nivå ner.)*
 */
export const TJUV_MIN_DRANERING_SEK = 500;

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
  ROR_INGENTING: 'ROR_INGENTING',
  TJUV_I_GRON: 'TJUV_I_GRON',
};

// ---------------------------------------------------------------------------
// GRÖNT LÄGE (Axels beslut 2026-09-20, ur Evolve-materialet — förslagets 2.3).
// Spärren körs numera på ALLA aktiva kampanjer, inte bara dem trappan är på
// väg att stänga av. I en grön kampanj (över break-even) finns ingen kärna att
// rädda — frågan är bara om enskilda annonser dränerar den. Där gäller Axels
// strängare grind: ≥ 300 kr OCH antingen ≥ 3 köp under break-even, eller 0 köp
// över 3 × break-even-CPA. En annons med 1–2 köp under break-even är brus i en
// grön kampanj — den pausas INTE här (i trappan gäller den gamla grinden,
// annars hade Övervakningskameran 2026-09-14 dött igen: dess tjuvar hade 1–2 köp).
// ---------------------------------------------------------------------------

/** Köp som krävs för att döma en annons med köp som tjuv i en grön kampanj. */
export const GRON_MIN_KOP = 3;
/** Utan köp: så många break-even-CPA i spend innan annonsen är en tjuv. */
export const GRON_NOLL_KOP_CPA_FAKTOR = 3;
/** Under sju dygn får en annons dränera så här mycket utan att kallas tjuv (fördröjd tändning). */
export const UNG_ANNONS_DAGAR = 7;
export const UNG_ANNONS_MAX_DRANERING_SEK = 1000;
/** Nåden för breakthroughs: etiketten får vara högst så här gammal … */
export const NAD_ETIKETT_MAX_DAGAR = 14;
/** … och nåden bryts när dräneringen över 7 dygn passerar så många break-even-CPA, eller vid så många back-dygn. */
export const NAD_MAX_DRANERING_CPA_FAKTOR = 3;
export const NAD_MAX_BACKDAGAR = 5;

/** Orsakskoder — så ersättaren angriper rätt sak första gången. */
export const ORSAK = {
  TROTT_VINNARE: 'TROTT_VINNARE',
  NOLL_KOP: 'NOLL_KOP',
  UNDER_BE: 'UNDER_BE',
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
  const roasLivstid = lasBelopp(rad.roas_livstid);
  const status = String(rad.status ?? rad.effective_status ?? '').toUpperCase();
  const spend7d = lasBelopp(rad.spend_7d);
  const roas7d = lasBelopp(rad.roas_7d);
  const alder = lasBelopp(rad.alder_dagar);
  const backdagar = lasBelopp(rad.backdagar_i_rad);
  return {
    id: String(rad.id ?? ''),
    namn: String(rad.namn ?? rad.name ?? ''),
    status,
    spend: Number.isFinite(spend) ? spend : null,
    roas: Number.isFinite(roasRå) ? roasRå : 0,
    kop: Number.isFinite(kopRå) ? kopRå : 0,
    // Grönt läge (frivilliga fält): ålder i dygn, 7-dygnsfönstret för nåden,
    // etiketten dag 7 ur budgetloggen (kod ETIKETT) och dess datum.
    alder_dagar: Number.isFinite(alder) ? alder : null,
    spend_7d: Number.isFinite(spend7d) ? spend7d : null,
    roas_7d: Number.isFinite(roas7d) ? roas7d : null,
    backdagar_i_rad: Number.isFinite(backdagar) ? backdagar : null,
    etikett: rad.etikett ? String(rad.etikett).toUpperCase() : null,
    etikett_datum: rad.etikett_datum ? String(rad.etikett_datum).slice(0, 10) : null,
    // Livstids-ROAS är frivillig. Den dömer aldrig — den märker en tjuv som
    // en TRÖTT VINNARE, så leveransen kan säga "mata ersättarna" i stället för
    // "den här creativen var dålig".
    roas_livstid: Number.isFinite(roasLivstid) ? roasLivstid : null,
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
function raknaDom(jobb = {}) {
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
    .filter((a) => dranering(a, breakEven) >= TJUV_MIN_DRANERING_SEK)
    .sort((a, b) => dranering(b, breakEven) - dranering(a, breakEven));

  // Tjuvar som gick plus över livstiden är trötta vinnare, inte dåliga
  // creatives. De pausas ändå — de blöder nu och svälter ut ersättarna — men
  // leveransen ska säga varför, så nästa batch matar rätt spår.
  for (const a of tjuvar) {
    a.trott_vinnare = Number.isFinite(a.roas_livstid) && a.roas_livstid >= breakEven;
  }

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

/** Orsaken bakom en tjuv, i fast ordning. */
export function tjuvOrsak(a, breakEven) {
  if (Number.isFinite(a.roas_livstid) && a.roas_livstid >= breakEven) return ORSAK.TROTT_VINNARE;
  if (a.kop === 0) return ORSAK.NOLL_KOP;
  return ORSAK.UNDER_BE;
}

/**
 * Grönt läge: tjuvar i en kampanj som går plus. Se blocket ovanför DOM.
 *
 * @param {object} jobb
 * @param {Array}  jobb.annonser        annonsrader (level: ad, last_3d) — en NAMNGIVEN lista, aldrig ett mönstersvep
 * @param {number|string} jobb.spend_3d kampanjens spend i samma fönster
 * @param {number} jobb.break_even      break-even-ROAS
 * @param {number} [jobb.break_even_cpa] break-even-CPA i kronor (AOV ÷ break-even-ROAS) — krävs för 0-köpsgrinden
 * @param {string} [jobb.idag]          YYYY-MM-DD, för nådens 14-dagarsfönster
 */
export function raknaGron(jobb = {}) {
  const breakEven = lasBelopp(jobb.break_even);
  const kampanjSpend = lasBelopp(jobb.spend_3d);
  const beCpa = lasBelopp(jobb.break_even_cpa);
  const idag = jobb.idag ? String(jobb.idag).slice(0, 10) : null;
  const noteringar = [];

  if (!(breakEven > 0)) return { dom: DOM.ROR_INGENTING, lage: 'gron', tjuvar: [], vantar: [], motivering: 'Break-even saknas — spärren kan inte räkna. Ingenting rörs.' };
  if (!(kampanjSpend > 0)) return { dom: DOM.ROR_INGENTING, lage: 'gron', tjuvar: [], vantar: [], motivering: 'Kampanjens spend saknas — spärren kan inte räkna. Ingenting rörs.' };
  if (!(beCpa > 0)) noteringar.push('break_even_cpa saknas i jobbfilen — annonser med 0 köp kan inte dömas som tjuvar i dag.');

  const alla = (Array.isArray(jobb.annonser) ? jobb.annonser : []).map(lasAnnons);
  const aktiva = alla.filter((a) => a.status === '' || a.status === 'ACTIVE');
  const tak = breakEven * TJUV_MARGINAL;

  const kandidater = aktiva
    .filter((a) => Number.isFinite(a.spend) && a.spend >= TJUV_MIN_SPEND_SEK)
    .filter((a) => a.spend / kampanjSpend >= TJUV_MIN_SPENDANDEL)
    .filter((a) => dranering(a, breakEven) >= TJUV_MIN_DRANERING_SEK)
    .filter((a) => {
      if (a.kop >= GRON_MIN_KOP) return a.roas < tak;
      if (a.kop === 0) return beCpa > 0 && a.spend >= GRON_NOLL_KOP_CPA_FAKTOR * beCpa;
      return false; // 1–2 köp under break-even är brus i en grön kampanj
    })
    .sort((a, b) => dranering(b, breakEven) - dranering(a, breakEven));

  const tjuvar = [];
  const vantar = [];
  for (const a of kandidater) {
    a.dranering = dranering(a, breakEven);
    a.trott_vinnare = Number.isFinite(a.roas_livstid) && a.roas_livstid >= breakEven;
    a.orsak = tjuvOrsak(a, breakEven);

    // Fördröjd tändning: en ung annons får dränera lite innan den kallas tjuv.
    if (Number.isFinite(a.alder_dagar) && a.alder_dagar < UNG_ANNONS_DAGAR && a.dranering < UNG_ANNONS_MAX_DRANERING_SEK) {
      vantar.push({ ...a, vantar_orsak: `bara ${a.alder_dagar} dygn gammal och dränerar ${heltal(a.dranering)} kr (< ${UNG_ANNONS_MAX_DRANERING_SEK}) — fördröjd tändning, läs om i morgon` });
      continue;
    }

    // Nåden (Evolve: en breakthrough får ha en dålig vecka). Bara etiketterad
    // BREAKTHROUGH ≤ 14 dygn gammal med livstid över break-even. Takad: bryts
    // vid 3 × BE-CPA i 7-dygnsdränering eller 5 back-dygn i rad. Saknas 7-dygns-
    // talen håller nåden — hellre ett dygn till än en pausad vinnare.
    const etikettAlder = a.etikett_datum && idag ? (Date.parse(`${idag}T00:00:00Z`) - Date.parse(`${a.etikett_datum}T00:00:00Z`)) / 86400000 : null;
    const nadKandidat = a.etikett === 'BREAKTHROUGH' && a.trott_vinnare
      && (etikettAlder === null || (Number.isFinite(etikettAlder) && etikettAlder <= NAD_ETIKETT_MAX_DAGAR));
    if (nadKandidat) {
      const dran7 = Number.isFinite(a.spend_7d) && Number.isFinite(a.roas_7d)
        ? a.spend_7d - (a.spend_7d * a.roas_7d) / breakEven
        : null;
      const taketNatt = (beCpa > 0 && Number.isFinite(dran7) && dran7 >= NAD_MAX_DRANERING_CPA_FAKTOR * beCpa)
        || (Number.isFinite(a.backdagar_i_rad) && a.backdagar_i_rad >= NAD_MAX_BACKDAGAR);
      if (!taketNatt) {
        vantar.push({ ...a, vantar_orsak: `BREAKTHROUGH (${a.etikett_datum ?? 'datum saknas'}) med livstids-ROAS ${decimal(a.roas_livstid)} över break-even — nåd. Dränering 7 d: ${dran7 === null ? 'okänd' : `${heltal(dran7)} kr`} (tak ${beCpa > 0 ? heltal(NAD_MAX_DRANERING_CPA_FAKTOR * beCpa) : '—'} kr), back-dygn ${a.backdagar_i_rad ?? 'okänt'} (tak ${NAD_MAX_BACKDAGAR}).` });
        continue;
      }
      a.nad_bruten = true;
    }
    tjuvar.push(a);
  }

  const gemensamt = { lage: 'gron', tjuvar, vantar, break_even: breakEven, break_even_cpa: beCpa > 0 ? beCpa : null, kampanj_spend: kampanjSpend, noteringar };
  if (tjuvar.length === 0) {
    const vantText = vantar.length ? ` ${vantar.length} annons(er) väntar (nåd eller ung).` : '';
    return { ...gemensamt, dom: DOM.INGEN_TJUV, motivering: `Ingen annons uppfyller den gröna grinden (≥ ${TJUV_MIN_SPEND_SEK} kr, ≥ ${Math.round(TJUV_MIN_SPENDANDEL * 100)} % av spenden, ≥ ${TJUV_MIN_DRANERING_SEK} kr dränering, och ≥ ${GRON_MIN_KOP} köp under ${decimal(tak)} eller 0 köp över ${GRON_NOLL_KOP_CPA_FAKTOR} × break-even-CPA).${vantText}` };
  }
  if (tjuvar.length > MAX_TJUVAR) {
    return { ...gemensamt, dom: DOM.ROR_INGENTING, motivering: `${tjuvar.length} tjuvar i en kampanj som går plus (taket är ${MAX_TJUVAR}) — det stämmer inte, kontrollera datan. Ingenting rörs.` };
  }
  const namn = tjuvar.map((a) => `${a.namn} (${heltal(a.spend)} kr, ${a.kop} köp, ROAS ${decimal(a.roas)}, ${a.orsak}${a.nad_bruten ? ', nåden bruten' : ''})`).join(', ');
  return {
    ...gemensamt,
    dom: DOM.TJUV_I_GRON,
    tjuvSpend: tjuvar.reduce((s, a) => s + a.spend, 0),
    motivering: `${tjuvar.length} spendtjuv${tjuvar.length > 1 ? 'ar' : ''} i en grön kampanj (break-even ${decimal(breakEven)}): ${namn}. Pausa exakt dessa — kampanjen rörs inte.${vantar.length ? ` ${vantar.length} annons(er) väntar (nåd eller ung).` : ''}`,
  };
}

/**
 * Fäller domen — och lägger på ägarskyddet.
 * `jobb.lage === 'gron'` går till raknaGron (kampanj som går plus); annars trappan.
 *
 * **Ägarskyddet (Axels beslut 2026-09-14).** Har ägaren själv startat om
 * kampanjen i dag (`agarbeslut_idag`, dvs en `ATERAKTIVERA`-rad med dagens
 * datum i budgetloggen) får ronden ALDRIG stänga av den samma dygn. Att slå
 * på en kampanj är ett beslut precis som att pausa en är det — och en rutin
 * som river upp ägarens beslut några timmar senare är trasig, oavsett vad
 * siffrorna säger. Blödningen stoppas ändå: finns tjuvar pausas de.
 */
export function spendtjuvsdom(jobb = {}) {
  if (jobb.lage === 'gron') return raknaGron(jobb);
  const utfall = raknaDom(jobb);
  for (const a of utfall.tjuvar ?? []) a.orsak = tjuvOrsak(a, utfall.break_even ?? lasBelopp(jobb.break_even));
  if (!jobb.agarbeslut_idag) return utfall;
  if (utfall.dom !== DOM.STANG_AV && utfall.dom !== DOM.INGEN_TJUV) return utfall;

  const kanPausa = utfall.tjuvar?.length > 0 && utfall.tjuvar.length <= MAX_TJUVAR;
  return {
    ...utfall,
    dom: kanPausa ? DOM.PAUSA_TJUVAR : DOM.ROR_INGENTING,
    agarskydd: true,
    motivering: `${utfall.motivering} ⚠️ ÄGARSKYDD: ägaren startade om kampanjen i dag, så ronden stänger inte av den. ${
      kanPausa
        ? 'Tjuvarna pausas ändå så blödningen stoppas — men resten av kampanjen bär sig inte ännu, så läs om i morgon.'
        : 'Ingenting rörs i dag.'
    }`,
  };
}

/** Rapporten en människa läser. */
export function formatera(utfall, jobb = {}) {
  const rader = [];
  rader.push(`SPENDTJUVSSPÄRREN — ${jobb.kampanj_namn ?? jobb.kampanj_id ?? 'okänd kampanj'}`);
  rader.push('='.repeat(70));
  rader.push(`Dom: ${utfall.dom}${utfall.lage === 'gron' ? '  (grönt läge — kampanjen går plus)' : ''}`);
  rader.push('');
  rader.push(utfall.motivering);
  for (const n of utfall.noteringar ?? []) rader.push(`  ⚠ ${n}`);
  if (utfall.tjuvar?.length) {
    rader.push('');
    rader.push('Tjuvar:');
    for (const a of utfall.tjuvar) {
      const trott = a.trott_vinnare ? `  ← trött vinnare (livstid ${decimal(a.roas_livstid)})` : '';
      const orsak = a.orsak ? `  [${a.orsak}]` : '';
      rader.push(`  ⛔ ${a.namn.padEnd(34)} ${heltal(a.spend).padStart(7)} kr  ${a.kop} köp  ROAS ${decimal(a.roas)}${orsak}${trott}`);
    }
  }
  if (utfall.vantar?.length) {
    rader.push('');
    rader.push('Väntar (pausas inte i dag):');
    for (const a of utfall.vantar) {
      rader.push(`  ⏳ ${a.namn.padEnd(34)} ${heltal(a.spend).padStart(7)} kr  ${a.kop} köp  ROAS ${decimal(a.roas)} — ${a.vantar_orsak}`);
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
