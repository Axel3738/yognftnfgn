#!/usr/bin/env node
// Dagens rond. Läser kontodata som /rond hämtat ur Meta, kör beslutsmotorn
// och skriver en rapport. Ändrar ALDRIG något i Meta — den föreslår.
//
//   node agent/rond.mjs [--data agent/kontodata.json] [--json] [--idag 2026-08-28]
//
// Exitkoder: 0 = klart · 2 = vägrade köra (fel konto eller tom data)

import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { besked, breakEvenRoas, GOLV_SEK as GOLV_SEK_PLAN, kostnadSek, lasBelopp, lasBreakEven, nyBudget, TAK_SEK as TAK_SEK_PLAN } from './besked.mjs';
import { backDagarIRad, dagarSedanAndring, lasLogg, raknaTrasigaRader, senasteRadMedKod } from './logg.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));

// Bäverbutiken. Enda kontot den här ronden får röra. Grillkliniken (SnarkLös
// 1346450049878358) är en annan verksamhet — se CLAUDE.md.
export const TILLATET_KONTO = '1867947880635861';
export const TILLATET_KONTONAMN = 'MagiBorsten';

// Utanför det här spannet är ROAS-talet inte att lita på.
export const ROAS_RIMLIGT_MIN = 0;
export const ROAS_RIMLIGT_MAX = 15;

// Samma sak för dagsbudgeten: kontots budgetar ligger 500-4 000 kr. Ett tal
// under 100 eller över 10 000 är med all sannolikhet en felparsning (öre lästa
// som kronor eller tvärtom) — ingen dom, larm i stället.
export const BUDGET_RIMLIG_MIN = 100;
export const BUDGET_RIMLIG_MAX = 10000;

// Kontodatan får vara högst så här gammal när en plan byggs.
export const MAX_DATAALDER_TIMMAR = 20;

export function kontrolleraKonto(data) {
  const fel = [];
  const konto = String(data?.ad_account_id ?? '').replace(/^act_/, '');
  if (konto !== TILLATET_KONTO) {
    fel.push(`Fel annonskonto: "${data?.ad_account_id}". Ronden kör bara mot ${TILLATET_KONTONAMN} ${TILLATET_KONTO}.`);
  }
  const namn = String(data?.ad_account_namn ?? '');
  if (namn && !namn.toLowerCase().includes(TILLATET_KONTONAMN.toLowerCase())) {
    fel.push(`Kontonamnet är "${namn}", förväntat ${TILLATET_KONTONAMN}. Avbryter hellre än gissar.`);
  }
  if (!Array.isArray(data?.kampanjer) || data.kampanjer.length === 0) {
    fel.push('Noll kampanjer i datan. Hellre stopp än en rapport byggd på ingenting.');
  }
  if (!data?.hamtad) {
    fel.push('Datan saknar tidsstämpel (hamtad) — går inte att avgöra hur färsk den är.');
  }
  return fel;
}

/**
 * Break-even för en kampanj, i tur och ordning:
 * 1. räknat ur kostnadsblocket i produktkarta.json (pris och kostnad per order)
 * 2. ett fast tal i produktkarta.json
 * 3. talet i kampanjnamnet
 */
export function breakEvenForPost(post, kampanjnamn, fx) {
  if (post?.kostnad) {
    const kostnad = kostnadSek(post.kostnad, fx);
    const be = breakEvenRoas(Number(post.kostnad.pris_sek), kostnad);
    if (Number.isFinite(be)) {
      return { be, kalla: post.kostnad.kalla || 'uträknad ur produktkarta.json' };
    }
  }
  if (Number.isFinite(post?.break_even_roas) && post.break_even_roas > 1) {
    return { be: post.break_even_roas, kalla: post.break_even_kalla || 'produktkarta.json' };
  }
  const ur = lasBreakEven(kampanjnamn);
  return { be: ur.be, kalla: ur.kalla };
}

export function bedomKampanj(kampanj, { logg, idag, karta, fx }) {
  const post = karta?.[kampanj.id] ?? {};
  const budget = lasBelopp(kampanj.daily_budget);
  const spend3d = lasBelopp(kampanj.spend_3d);
  const spendTotal = lasBelopp(kampanj.spend_total);
  const roas3d = lasBelopp(kampanj.roas_3d);
  const kop3d = lasBelopp(kampanj.kop_3d);

  const grund = {
    id: kampanj.id,
    namn: kampanj.namn,
    lage: post.lage === 'drift' ? 'drift' : 'test',
    budget,
    spend3d,
    spendTotal,
    roas3d,
    kop3d,
  };

  // Fryst på Axels order: rörs inte alls till och med frys_till-datumet.
  // Används när siffrorna ljuger av yttre skäl (spärrat kort, prishöjning på
  // väg, retroaktivt ändrad break-even) — reglerna ska inte straffa en produkt
  // för något som inte är annonsernas fel.
  if (post.frys_till && String(idag) <= String(post.frys_till)) {
    const urNamn = lasBreakEven(kampanj.namn);
    return {
      ...grund,
      dom: {
        kod: 'FRYST', rubrik: `Fryst t.o.m. ${post.frys_till}`,
        motivering: post.frys_motivering || 'Fryst på Axels order.',
        nyBudget: null, zon: null, vinstProcent: null,
        breakEven: urNamn.be, breakEvenKalla: urNamn.kalla,
        kraverGodkannande: false, naraGrans: false,
      },
    };
  }

  if (budget !== null && (budget < BUDGET_RIMLIG_MIN || budget > BUDGET_RIMLIG_MAX)) {
    const urNamn = lasBreakEven(kampanj.namn);
    return {
      ...grund,
      dom: {
        kod: 'ORIMLIG_DATA',
        rubrik: 'Budgeten ser fel ut',
        motivering: `Dagsbudget ${budget} kr ligger utanför ${BUDGET_RIMLIG_MIN}–${BUDGET_RIMLIG_MAX} kr — troligen en felparsning (öre/kronor). Ingen dom fälls; kontrollera i Ads Manager.`,
        nyBudget: null, zon: null, vinstProcent: null,
        breakEven: urNamn.be, breakEvenKalla: urNamn.kalla,
        kraverGodkannande: false, naraGrans: false,
      },
    };
  }

  if (roas3d !== null && (roas3d < ROAS_RIMLIGT_MIN || roas3d > ROAS_RIMLIGT_MAX)) {
    return {
      ...grund,
      dom: {
        kod: 'ORIMLIG_DATA',
        rubrik: 'Siffran ser fel ut',
        motivering: `ROAS ${roas3d} ligger utanför ${ROAS_RIMLIGT_MIN}–${ROAS_RIMLIGT_MAX}. Ingen dom fälls — kontrollera i Ads Manager.`,
        nyBudget: null,
        zon: null,
        vinstProcent: null,
        breakEven: lasBreakEven(kampanj.namn).be,
        breakEvenKalla: lasBreakEven(kampanj.namn).kalla,
        kraverGodkannande: false,
      },
    };
  }

  const källa = breakEvenForPost(post, kampanj.namn, fx);

  return {
    ...grund,
    dom: besked({
      namn: kampanj.namn,
      lage: grund.lage,
      breakEven: källa.be,
      breakEvenKalla: källa.kalla,
      roas3d,
      spend3d,
      kop3d,
      spendTotal,
      budget,
      dagarSedanAndring: dagarSedanAndring(logg, kampanj.id, idag),
      senasteAndringKod: senasteRadMedKod(logg, kampanj.id, ['SKALA', 'SANK', 'HALVERA'])?.kod ?? null,
      backDagarIRad: backDagarIRad(kampanj.dygn, källa.be),
    }),
  };
}

/**
 * Bygger den exakta åtgärdslistan för autoläget (/rond-auto).
 *
 * Talen här är de enda som får skickas till Meta — Claude räknar aldrig om dem.
 * Budget anges i BÅDE kronor och öre eftersom Metas API tar öre
 * (1 200 kr = 120000). Skickas kronorna rakt in blir budgeten 100x för låg;
 * skickas öre där kronor väntas blir den 100x för hög.
 *
 * Försiktighetsregeln nära zongräns (ROAS revideras uppåt i efterhand):
 * ett besked som ligger inom NARA_GRANS_PP från en gräns mildras ett steg —
 * HALVERA blir SANK, och SKALA/SANK/STANG_AV/ATGARDSTRAPPAN skjuts upp till
 * nästa körning. Är signalen äkta står den kvar om tre dagar med mognare data.
 */
export function planera(rader, { logg = [], idag = null } = {}) {
  const atgarder = [];
  const uppskjutna = [];

  // Antal UPPSKJUTEN_GRANS i rad (senaste raderna) per kampanj: efter tre
  // uppskjutningar har signalen stått i 3+ dagar — attributionsargumentet är
  // förbrukat och åtgärden körs ändå.
  const uppskjutnaIRad = (id) => {
    const egna = logg
      .filter((r) => r.kampanj_id === id && r.kod !== 'NAMNBYTE')
      .sort((a, b) => (a.datum < b.datum ? 1 : -1));
    const dagar = new Set();
    for (const r of egna) {
      if (r.kod === 'UPPSKJUTEN_GRANS') dagar.add(r.datum); // unika DAGAR — två körningar samma dag är en uppskjutning
      else break;
    }
    return dagar.size;
  };

  // Redan ändrad idag (dubbelkörning, kraschad körning som hann skriva)?
  const andradIdag = (id) => idag !== null && logg.some(
    (r) => r.kampanj_id === id && r.genomford === true && r.datum === idag
      && ['SKALA', 'SANK', 'HALVERA', 'STANG_AV', 'TRAPPA_STEG_1', 'TRAPPA_STEG_2', 'TRAPPA_STEG_3'].includes(r.kod),
  );

  for (const r of rader) {
    const d = r.dom;
    if (!d.kraverGodkannande) continue;

    const grund = { kampanj_id: r.id, namn: r.namn, kod: d.kod, motivering: d.motivering };

    if (andradIdag(r.id)) {
      uppskjutna.push({ ...grund, orsak: 'redan ändrad idag — en ändring per dygn' });
      continue;
    }

    if (d.naraGrans && uppskjutnaIRad(r.id) < 3) {
      if (d.kod === 'HALVERA') {
        const ner = nyBudget('ner', r.budget);
        if (Number.isFinite(ner) && ner < r.budget) {
          atgarder.push({
            ...grund, typ: 'budget', kod: 'SANK',
            fran_sek: r.budget, till_sek: ner, till_ore: Math.round(ner * 100),
            mildrad: 'HALVERA mildrad till SANK: beskedet ligger nära en zongräns och ROAS kan revideras uppåt. Står förlusten kvar nästa körning halveras den då.',
          });
        } else {
          uppskjutna.push({ ...grund, orsak: 'nära zongräns och redan på golvet' });
        }
      } else {
        uppskjutna.push({ ...grund, orsak: 'nära zongräns — omprövas nästa körning med mognare data' });
      }
      continue;
    }

    if (d.kod === 'SKALA' || d.kod === 'SANK' || d.kod === 'HALVERA') {
      // Sista ledet före API:t: beloppet MÅSTE vara ett vettigt tal.
      if (!Number.isFinite(d.nyBudget) || d.nyBudget < GOLV_SEK_PLAN || d.nyBudget > TAK_SEK_PLAN
          || d.nyBudget === r.budget) {
        uppskjutna.push({ ...grund, orsak: `ogiltigt belopp (${d.nyBudget}) — utförs inte` });
        continue;
      }
      atgarder.push({
        ...grund, typ: 'budget',
        fran_sek: r.budget, till_sek: d.nyBudget, till_ore: Math.round(d.nyBudget * 100),
      });
    } else if (d.kod === 'STANG_AV') {
      atgarder.push({ ...grund, typ: 'paus_kampanj' });
    } else if (d.kod === 'ATGARDSTRAPPAN') {
      atgarder.push({ ...grund, typ: 'trappa' });
    }
  }

  // Kontospärren: summan av dagsbudgetarna får aldrig stiga mer än 20 % på en
  // körning. Med 20 %-taket per kampanj är det matematiskt omöjligt att bryta —
  // slår spärren till är något trasigt (enhetsfel, dubbelräkning) och HELA
  // planen kasseras. Hellre en dag utan ändringar än en trasig ändring.
  const gammalTotal = rader.reduce((s, r) => s + (Number.isFinite(r.budget) ? r.budget : 0), 0);
  let nyTotal = gammalTotal;
  for (const a of atgarder) {
    if (a.typ === 'budget') nyTotal += a.till_sek - a.fran_sek;
  }
  if (nyTotal > gammalTotal * 1.2 + 1) {
    return {
      sparrad: true,
      orsak: `Kontospärr: planen skulle höja totalbudgeten från ${Math.round(gammalTotal)} till ${Math.round(nyTotal)} kr/dag (över +20 %). Det ska inte kunna hända — hela planen kasseras. Gör inga ändringar och larma Axel.`,
      atgarder: [], uppskjutna, gammalTotal, nyTotal,
    };
  }

  return { sparrad: false, orsak: null, atgarder, uppskjutna, gammalTotal, nyTotal };
}

/**
 * Annons-triggern: flaggar produkter som behöver nya annonser, ur budgetloggen.
 * Axels regel 2026-08-29: "rutinen ska leta efter produkter som inte har fått
 * sin tre dagars brief" — var tredje dag får varje produkt med en batch en ny
 * brief-runda (/cs). Produkter utan batch fångas av forsta_batch-regeln.
 * - forsta_batch: passerat 1 500 kr OCH på/över break-even, ingen batch ännu.
 * - brief_runda: har en batch och senaste *_KLAR-raden är ≥3 dagar gammal.
 *   Fokus (ersätt pausat / mata vinnaren) bakas in i orsaken.
 * - ersatt/mata_vinnare: kvarvarande signaler för produkter utan batch.
 * Flaggan startar ingenting själv — rond-auto steg 4b kör rundorna.
 */
export const BRIEF_INTERVALL_DAGAR = 3;

export function annonsbehov(rader, { logg = [], idag = null } = {}) {
  if (idag === null) return [];
  const nu = Date.parse(`${idag}T00:00:00Z`);
  const inom7 = (datum) => {
    const d = (nu - Date.parse(`${datum}T00:00:00Z`)) / 86400000;
    return Number.isFinite(d) && d >= 0 && d <= 7;
  };
  const KLAR = ['FORSTA_BATCH_KLAR', 'CS_BATCH_KLAR'];
  const behov = [];
  for (const r of rader) {
    // Fryst = händerna borta helt: datan går inte att lita på (spärrat kort,
    // prishöjning på väg). En brief skriven nu skulle bygga på fel siffror
    // eller fel pris. Gäller alla behovstyper, inte bara rundorna.
    if (r.dom?.kod === 'FRYST') continue;
    const egna = logg.filter((rad) => rad.kampanj_id === r.id && rad.genomford === true);
    const klarRader = egna.filter((rad) => KLAR.includes(rad.kod));
    const harBatch = klarRader.length > 0;
    // Dagar sedan senaste batch — null om ingen batch finns.
    const senasteKlar = klarRader
      .map((rad) => Date.parse(`${rad.datum}T00:00:00Z`))
      .filter(Number.isFinite)
      .sort((a, b) => b - a)[0];
    const dagarSedanBatch = Number.isFinite(senasteKlar)
      ? Math.floor((nu - senasteKlar) / 86400000)
      : null;

    const senaste7 = egna.filter((rad) => inom7(rad.datum));
    const pausat = senaste7.some((rad) => ['TRAPPA_STEG_1', 'TRAPPA_STEG_2', 'TRAPPA_STEG_3', 'STANG_AV'].includes(rad.kod));
    const skalningar = senaste7.filter((rad) => rad.kod === 'SKALA').length;

    if (harBatch) {
      if (dagarSedanBatch !== null && dagarSedanBatch < BRIEF_INTERVALL_DAGAR) continue; // låt batchen landa
      const rundaAntal = rundkvot(r.budget);
      if (rundaAntal === 0) continue; // ingen budget — ingen runda
      let fokus = '';
      if (pausat) fokus = ' Fokus: ersätt det som pausats i trappan.';
      else if (skalningar >= 2) fokus = ` Fokus: mata vinnaren — skalats ${skalningar} gånger på en vecka.`;
      behov.push({
        kampanj_id: r.id, namn: r.namn, typ: 'brief_runda',
        dagarSedanBatch, rundaAntal,
        orsak: `${dagarSedanBatch} dagar sedan senaste batchen — dags för 3-dagarsrundan (${rundaAntal} annonser via /cs).${fokus}`,
      });
      continue;
    }

    // Axels regel 2026-08-29 (förtydligad): CS-processen startar när produkten
    // KLARAR testet — passerat 1 500 kr OCH ligger på/över break-even. Då går
    // den test -> skalning och ska pumpas med nya annonser. En produkt som
    // passerat tröskeln MED förlust hanteras av åtgärdstrappan, inte av en batch.
    const overBreakEven = r.dom?.vinstProcent === null || r.dom?.vinstProcent === undefined
      ? null
      : r.dom.vinstProcent >= 0;
    if (Number.isFinite(r.spendTotal) && r.spendTotal >= FORSTA_BATCH_SPEND_SEK
        && overBreakEven !== false) {
      behov.push({
        kampanj_id: r.id, namn: r.namn, typ: 'forsta_batch',
        orsak: `har klarat testet (${Math.round(r.spendTotal).toLocaleString('sv-SE')} kr spenderat, över break-even) utan en riktig batch — dags för /forsta-batch`,
      });
      continue;
    }

    if (pausat) {
      behov.push({ kampanj_id: r.id, namn: r.namn, typ: 'ersatt', orsak: 'material pausat senaste veckan — ersätt det som stängts av' });
    } else if (skalningar >= 2) {
      behov.push({ kampanj_id: r.id, namn: r.namn, typ: 'mata_vinnare', orsak: `skalats ${skalningar} gånger på en vecka — mata vinnaren med mer material innan tröttheten kommer` });
    }
  }
  // Första batchen först, sen brief-rundor (äldst först), sist övriga signaler.
  const RANG = { forsta_batch: 0, brief_runda: 1, ersatt: 2, mata_vinnare: 2 };
  return behov.sort((a, b) => {
    if (RANG[a.typ] !== RANG[b.typ]) return RANG[a.typ] - RANG[b.typ];
    if (a.typ === 'brief_runda' && b.typ === 'brief_runda'
        && a.dagarSedanBatch !== b.dagarSedanBatch) {
      return b.dagarSedanBatch - a.dagarSedanBatch;
    }
    return (b_spend(rader, b) - b_spend(rader, a));
  });
}

/**
 * Storleken på en 3-dagarsrunda: halva veckokvoten, avrundad uppåt (två rundor
 * per vecka ≈ veckokvoten). ANTAGANDE 2026-08-29, säg till Axel om delningen
 * ska vara en annan.
 */
export function rundkvot(budgetSek) {
  const vecka = annonskvot(budgetSek).antal;
  return vecka === 0 ? 0 : Math.ceil(vecka / 2);
}

function b_spend(rader, behovsrad) {
  const r = rader.find((x) => x.id === behovsrad.kampanj_id);
  return Number.isFinite(r?.spendTotal) ? r.spendTotal : 0;
}

// Axels beslut 2026-08-29 (förtydligat samma dag): testtröskeln. När en
// produkt passerat den OCH ligger över break-even går den test -> skalning,
// och då startar creative-strategy-processen.
export const FORSTA_BATCH_SPEND_SEK = 1500;

/**
 * Launchstrukturen — Axels tabell ur Bäverpanelen: hur många nya annonser en
 * produkt ska få per vecka, styrt av dagsbudgeten. Mest variationer, ungefär
 * en ny idé per tre variationer. Jasper klarar 50-70/vecka totalt; blir det
 * plats över ska den gå till FLER PRODUKTER, inte fler annonser på samma.
 */
export function annonskvot(budgetSek) {
  if (!Number.isFinite(budgetSek) || budgetSek <= 0) return { antal: 0, nyaKoncept: 0 };
  if (budgetSek < 750) return { antal: 1, nyaKoncept: 0 };
  if (budgetSek < 1500) return { antal: 2, nyaKoncept: 1 };
  if (budgetSek < 3000) return { antal: 3, nyaKoncept: 1 };
  return { antal: 4, nyaKoncept: 1 };
}

const ORDNING = [
  'STANG_AV', 'ATGARDSTRAPPAN', 'HALVERA', 'SANK', 'SKALA',
  'STOR_SPEND_UTAN_KOP', 'RAKNA_BACKDAGAR', 'ORIMLIG_DATA', 'SAKNAR_BREAK_EVEN',
  'SAKNAR_BUDGET', 'SAKNAR_SPEND_TOTAL', 'VANTA_KADENS', 'VANTA_TROSKEL',
  'FOR_LITE_DATA', 'FRYST', 'LAT_VARA',
];

function kr(n) {
  return n === null ? '—' : `${Math.round(n).toLocaleString('sv-SE')} kr`;
}

export function rapport(rader, meta, behov = []) {
  const sorterade = [...rader].sort(
    (a, b) => ORDNING.indexOf(a.dom.kod) - ORDNING.indexOf(b.dom.kod),
  );
  const attGora = sorterade.filter((r) => r.dom.kraverGodkannande);
  const attKolla = sorterade.filter(
    (r) => !r.dom.kraverGodkannande
      && ['STOR_SPEND_UTAN_KOP', 'ORIMLIG_DATA', 'SAKNAR_BREAK_EVEN', 'SAKNAR_BUDGET', 'SAKNAR_SPEND_TOTAL', 'RAKNA_BACKDAGAR'].includes(r.dom.kod),
  );
  const ifred = sorterade.filter((r) => !attGora.includes(r) && !attKolla.includes(r));

  const ut = [];
  ut.push(`# Dagens rond — ${meta.idag}`);
  ut.push('');
  ut.push(`${TILLATET_KONTONAMN} ${TILLATET_KONTO} · ${rader.length} aktiva kampanjer · data hämtad ${meta.hamtad}`);
  ut.push('');

  if (attGora.length === 0) {
    ut.push('## Inget att göra idag');
    ut.push('');
    ut.push('Ingen kampanj föll ut med ett förslag som kräver ditt godkännande.');
  } else {
    ut.push(`## Att godkänna (${attGora.length})`);
    ut.push('');
    ut.push('| Produkt | Besked | Budget idag | Föreslagen | Varför |');
    ut.push('|---|---|---|---|---|');
    for (const r of attGora) {
      const kort = r.namn.split('|')[0].trim();
      const flagga = r.dom.naraGrans ? ' ⚠' : '';
      ut.push(`| ${kort}${flagga} | **${r.dom.rubrik}** | ${kr(r.budget)} | ${kr(r.dom.nyBudget)} | ${r.dom.motivering} |`);
    }
    const nära = attGora.filter((r) => r.dom.naraGrans).length;
    if (nära > 0) {
      ut.push('');
      ut.push(`⚠ = ${nära} rad(er) ligger nära en zongräns. Kolla siffran i Ads Manager innan du godkänner just den.`);
    }
  }
  ut.push('');

  if (attKolla.length > 0) {
    ut.push(`## Behöver en titt (${attKolla.length})`);
    ut.push('');
    for (const r of attKolla) {
      ut.push(`- **${r.namn.split('|')[0].trim()}** — ${r.dom.rubrik}. ${r.dom.motivering}`);
    }
    ut.push('');
  }

  if (ifred.length > 0) {
    ut.push(`## Lämnas ifred (${ifred.length})`);
    ut.push('');
    for (const r of ifred) {
      const vinst = r.dom.vinstProcent === null
        ? ''
        : ` (${r.dom.vinstProcent.toFixed(1).replace('.', ',')} % vinst)`;
      ut.push(`- ${r.namn.split('|')[0].trim()} — ${r.dom.rubrik}${vinst}`);
    }
    ut.push('');
  }

  if (behov.length > 0) {
    ut.push(`## 🎨 Nya annonser behövs (${behov.length})`);
    ut.push('');
    for (const b of behov) {
      const kommando = b.typ === 'forsta_batch' ? '`/forsta-batch`' : '`/cs`';
      const orsak = b.orsak.endsWith('.') ? b.orsak : `${b.orsak}.`;
      ut.push(`- **${b.namn.split('|')[0].trim()}** — ${orsak} Kommando: ${kommando}.`);
    }
    ut.push('');
    const totalVecka = rader.reduce((s2, r) => s2 + annonskvot(r.budget).antal, 0);
    ut.push(`Veckokvot totalt (launchstrukturen): ${totalVecka} annonser över ${rader.length} produkter. Jasper klarar 50–70 — plats över går till FLER produkter.`);
    ut.push('');
  }

  if (meta.varningar?.length) {
    ut.push('## Varningar');
    ut.push('');
    for (const v of meta.varningar) ut.push(`- ${v}`);
    ut.push('');
  }

  ut.push('---');
  ut.push('Ronden ändrar ingenting själv. Svara med vilka rader som ska köras.');
  return ut.join('\n');
}

async function main() {
  const argv = process.argv.slice(2);
  const flagga = (namn, fallback = null) => {
    const i = argv.indexOf(namn);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
  };

  const datafil = resolve(flagga('--data', join(HÄR, 'kontodata.json')));
  const data = JSON.parse(await readFile(datafil, 'utf8'));

  const fel = kontrolleraKonto(data);
  if (fel.length > 0) {
    console.error('RONDEN AVBRÖTS:');
    for (const f of fel) console.error(`  - ${f}`);
    process.exit(2);
  }

  const idag = flagga('--idag', data.idag);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(idag))) {
    console.error(`RONDEN AVBRÖTS: saknar giltigt datum (fick "${idag}"). Ange --idag YYYY-MM-DD.`);
    process.exit(2);
  }

  // Gammal kontodata ger en plan byggd på gårdagen. Hellre stopp.
  const alderMs = Date.now() - Date.parse(String(data.hamtad));
  if (!Number.isFinite(alderMs)) {
    console.error(`RONDEN AVBRÖTS: "hamtad" (${data.hamtad}) går inte att tolka som tid.`);
    process.exit(2);
  }
  if (alderMs > MAX_DATAALDER_TIMMAR * 3600 * 1000 && !argv.includes('--tillat-gammal')) {
    console.error(`RONDEN AVBRÖTS: kontodatan är ${Math.round(alderMs / 3600000)} timmar gammal (max ${MAX_DATAALDER_TIMMAR}). Hämta ny, eller kör --tillat-gammal för en historisk torrkörning.`);
    process.exit(2);
  }

  let karta = {};
  let fx = null;
  try {
    const rå = JSON.parse(await readFile(join(HÄR, 'produktkarta.json'), 'utf8'));
    for (const post of rå.kampanjer ?? []) karta[post.campaign_id] = post;
    fx = rå.valutakurser ?? null;
  } catch {
    karta = {};
  }

  const logg = await lasLogg();
  const varningar = [];
  const trasiga = await raknaTrasigaRader();
  if (trasiga > 0) varningar.push(`${trasiga} trasig(a) rader i budgetloggen hoppades över.`);

  const rader = data.kampanjer.map((k) => bedomKampanj(k, { logg, idag, karta, fx }));

  for (const r of rader) {
    const anm = karta[r.id]?.anmarkning;
    if (anm) varningar.push(`${r.namn.split('|')[0].trim()}: ${anm}`);
  }

  const utankarta = rader.filter((r) => !karta[r.id]);
  if (utankarta.length > 0) {
    varningar.push(`${utankarta.length} kampanj(er) saknas i produktkarta.json och kördes som testprodukt: ${utankarta.map((r) => r.namn.split('|')[0].trim()).join(', ')}.`);
  }

  const meta = { idag, hamtad: data.hamtad, varningar };
  if (argv.includes('--json')) {
    const behovslista = annonsbehov(rader, { logg, idag }).map((b) => {
      const rad = rader.find((r) => r.id === b.kampanj_id);
      return { ...b, veckokvot: annonskvot(rad?.budget) };
    });
    console.log(JSON.stringify({
      meta, rader, plan: planera(rader, { logg, idag }), annonsbehov: behovslista,
      veckokvot: rader.map((r) => ({ kampanj_id: r.id, namn: r.namn, ...annonskvot(r.budget) })),
    }, null, 2));
  } else {
    console.log(rapport(rader, meta, annonsbehov(rader, { logg, idag })));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(`RONDEN AVBRÖTS: ${e.message}`);
    process.exit(2);
  });
}
