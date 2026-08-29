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
    let n = 0;
    for (const r of egna) {
      if (r.kod === 'UPPSKJUTEN_GRANS') n += 1;
      else break;
    }
    return n;
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

const ORDNING = [
  'STANG_AV', 'ATGARDSTRAPPAN', 'HALVERA', 'SANK', 'SKALA',
  'STOR_SPEND_UTAN_KOP', 'RAKNA_BACKDAGAR', 'ORIMLIG_DATA', 'SAKNAR_BREAK_EVEN',
  'SAKNAR_BUDGET', 'SAKNAR_SPEND_TOTAL', 'VANTA_KADENS', 'VANTA_TROSKEL',
  'FOR_LITE_DATA', 'FRYST', 'LAT_VARA',
];

function kr(n) {
  return n === null ? '—' : `${Math.round(n).toLocaleString('sv-SE')} kr`;
}

export function rapport(rader, meta) {
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
    console.log(JSON.stringify({ meta, rader, plan: planera(rader, { logg, idag }) }, null, 2));
  } else {
    console.log(rapport(rader, meta));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(`RONDEN AVBRÖTS: ${e.message}`);
    process.exit(2);
  });
}
