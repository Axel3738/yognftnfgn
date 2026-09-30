#!/usr/bin/env node
// Hämtar det facit behöver ur Meta, läs-bart med META_ACCESS_TOKEN:
//
//   1. Kampanjernas dygnsserie i 7d_click, UTAN statusfilter — avstängda och
//      pausade kampanjer är med (rondens egen hämtning filtrerar på ACTIVE och
//      tappar precis de kampanjer motorn stängt av).
//   2. Metas aktivitetslogg för budgetändringar (category BUDGET): gammal och
//      ny budget i öre, och vem som gjorde ändringen (`ads MCP server` =
//      motorn, `Power Editor` / iOS = för hand).
//
//   node agent/hamta-facit.mjs --konto SE|NO [--dagar 45] [--idag YYYY-MM-DD]
//     → agent/utdata/cache/facit-<konto>-<idag>.json (gitignorerad)
//
// Mätt 2026-09-30: SE 739 dygnsrader / 103 kampanjer på 45 dygn, 2 sidor,
// ~9 s; NO 335 rader, 1 sida, ~7 s. Aktivitetsloggen SE 361 rader, 1 sida.
// Ingenting här skriver till Meta. Tolkningen av svaren är ren räkning i
// agent/facit.mjs (tolkaInsiktsrad, tolkaBudgethandelse) och testas utan nät.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { alla, KONTON } from './hamta-kontodata.mjs';
import { tolkaInsiktsrad, tolkaBudgethandelse, plusDagar } from './facit.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));
export const CACHE = join(HÄR, 'utdata', 'cache');
export const STANDARD_DAGAR = 45;
// Kontots tidszon avgör vilket dygn en ändring hör till (07:55 i Stockholm är
// 05:55 UTC — samma dygn, men en ändring 23:30 UTC är nästa dygn lokalt).
export const TIDSZON = { SE: 'Europe/Stockholm', NO: 'Europe/Oslo' };

const svensktDatumIdag = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

export const cachefil = (konto, idag) => join(CACHE, `facit-${konto}-${idag}.json`);

export async function hamtaFacitdata(kontoKod, { idag, dagar = STANDARD_DAGAR } = {}) {
  const konto = KONTON[kontoKod];
  if (!konto) throw new Error(`Okänt konto ${kontoKod} — ange SE eller NO.`);
  const act = `act_${konto.id}`;
  const until = plusDagar(idag, -1); // gårdagen — dagens dygn är ofullständigt
  const since = plusDagar(idag, -dagar);
  const hamtad = new Date().toISOString();
  console.error(`Facit: hämtar ${konto.namn} (${act}) ${since}..${until} …`);

  const insikter = await alla(`${act}/insights`, {
    level: 'campaign',
    time_increment: '1',
    time_range: { since, until },
    fields: 'campaign_id,campaign_name,spend,actions,action_values,purchase_roas',
    action_attribution_windows: ['7d_click'],
    limit: 500,
  });
  console.error(`  ${insikter.length} dygnsrader`);

  const aktiviteter = await alla(`${act}/activities`, {
    category: 'BUDGET',
    since,
    until: idag,
    fields: 'event_time,event_type,object_id,object_type,extra_data,application_name',
    limit: 500,
  });
  const tz = TIDSZON[kontoKod];
  const budget = aktiviteter.map((a) => tolkaBudgethandelse(a, tz)).filter(Boolean);
  console.error(`  ${budget.length} budgetändringar i aktivitetsloggen`);

  return {
    hamtad,
    konto: kontoKod,
    ad_account_id: konto.id,
    attribution: '7d_click',
    since,
    until,
    idag,
    dygn: insikter.map(tolkaInsiktsrad).filter(Boolean),
    budgetandringar: budget,
  };
}

async function main(argv) {
  const flagga = (namn, fallback = null) => { const i = argv.indexOf(namn); return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback; };
  const kontoKod = flagga('--konto');
  if (!KONTON[kontoKod]) { console.error('Ange --konto SE | NO'); process.exit(2); }
  const idag = flagga('--idag', svensktDatumIdag());
  const dagar = Number(flagga('--dagar', STANDARD_DAGAR));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(idag) || !Number.isInteger(dagar) || dagar < 10 || dagar > 120) {
    console.error('Ogiltigt --idag eller --dagar (10–120).'); process.exit(2);
  }
  const data = await hamtaFacitdata(kontoKod, { idag, dagar });
  mkdirSync(CACHE, { recursive: true });
  const fil = cachefil(kontoKod, idag);
  writeFileSync(fil, `${JSON.stringify(data)}\n`);
  console.error(`Skrev ${fil}: ${data.dygn.length} dygnsrader, ${data.budgetandringar.length} budgetändringar`);
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main(process.argv.slice(2)).catch((e) => { console.error(`FACIT-HÄMTNINGEN AVBRÖTS: ${e.message}`); process.exit(2); });
}
