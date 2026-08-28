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
import { besked, lasBelopp, lasBreakEven } from './besked.mjs';
import { backDagarIRad, dagarSedanAndring, lasLogg, raknaTrasigaRader } from './logg.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));

// Bäverbutiken. Enda kontot den här ronden får röra. Grillkliniken (SnarkLös
// 1346450049878358) är en annan verksamhet — se CLAUDE.md.
export const TILLATET_KONTO = '1867947880635861';
export const TILLATET_KONTONAMN = 'MagiBorsten';

// Utanför det här spannet är ROAS-talet inte att lita på.
export const ROAS_RIMLIGT_MIN = 0;
export const ROAS_RIMLIGT_MAX = 15;

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

export function bedomKampanj(kampanj, { logg, idag, karta }) {
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

  const ur = lasBreakEven(kampanj.namn);
  const breakEven = Number.isFinite(post.break_even_roas) ? post.break_even_roas : ur.be;

  return {
    ...grund,
    dom: besked({
      namn: kampanj.namn,
      lage: grund.lage,
      breakEven: Number.isFinite(post.break_even_roas) ? post.break_even_roas : null,
      breakEvenKalla: post.break_even_kalla,
      roas3d,
      spend3d,
      kop3d,
      spendTotal,
      budget,
      dagarSedanAndring: dagarSedanAndring(logg, kampanj.id, idag),
      backDagarIRad: backDagarIRad(kampanj.dygn, breakEven),
    }),
  };
}

const ORDNING = [
  'STANG_AV', 'ATGARDSTRAPPAN', 'HALVERA', 'SANK', 'SKALA',
  'RAKNA_BACKDAGAR', 'ORIMLIG_DATA', 'SAKNAR_BREAK_EVEN', 'SAKNAR_BUDGET',
  'VANTA_KADENS', 'VANTA_TROSKEL', 'FOR_LITE_DATA', 'LAT_VARA',
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
      && ['ORIMLIG_DATA', 'SAKNAR_BREAK_EVEN', 'SAKNAR_BUDGET', 'RAKNA_BACKDAGAR'].includes(r.dom.kod),
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

  let karta = {};
  try {
    const rå = JSON.parse(await readFile(join(HÄR, 'produktkarta.json'), 'utf8'));
    for (const post of rå.kampanjer ?? []) karta[post.campaign_id] = post;
  } catch {
    karta = {};
  }

  const logg = await lasLogg();
  const varningar = [];
  const trasiga = await raknaTrasigaRader();
  if (trasiga > 0) varningar.push(`${trasiga} trasig(a) rader i budgetloggen hoppades över.`);

  const rader = data.kampanjer.map((k) => bedomKampanj(k, { logg, idag, karta }));

  const utankarta = rader.filter((r) => !karta[r.id]);
  if (utankarta.length > 0) {
    varningar.push(`${utankarta.length} kampanj(er) saknas i produktkarta.json och kördes som testprodukt: ${utankarta.map((r) => r.namn.split('|')[0].trim()).join(', ')}.`);
  }

  const meta = { idag, hamtad: data.hamtad, varningar };
  if (argv.includes('--json')) {
    console.log(JSON.stringify({ meta, rader }, null, 2));
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
