#!/usr/bin/env node
// Growth Guide i Notion: arkivet som en databas Axel kan se och ändra i.
//
// Axels beslut 2026-10-02 ("vi trackar allt i ett inbyggt growth sheet … jag vill
// kunna komma åt och kika på det + min creative strat ska också kunna ändra i det").
// Arkivet (`products/matstrumpor/arkiv.json`) byggs av koden varje rond och skrivs
// över, så det går inte att ändra i. Den här databasen är spegeln: koden äger
// MÄTKOLUMNERNA (etikett, typ, förälder, hook/hold, spend, köp, ROAS …) och skriver
// om dem varje rond; människorna äger Anteckning, Beslut, Nästa steg och Ägare,
// som koden ALDRIG rör. Nyckeln är annonsens namn (titeln).
//
//   node matstrumpor/growthguide.mjs --kolla     # finns sidan, databasen, token?
//   node matstrumpor/growthguide.mjs --torr      # visa vad som skulle skrivas
//   node matstrumpor/growthguide.mjs --skarpt    # skapa databasen om den saknas, skriv raderna
//
// Databasen skapas under sidan Axel gjorde i Matstrumpors teamspace (API:t kan inte
// skapa en databas på teamspace-roten, bara under en sida integrationen ser). Id:n
// sparas i `matstrumpor/growthguide.json` och committas.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..');
const KONFIG_FIL = join(HAR, 'growthguide.json');
const ARKIV_FIL = join(ROT, 'products', 'matstrumpor', 'arkiv.json');
const NOTION = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';
const KONTO = '730973156224390';

/** Kolumnerna koden äger. Allt annat i databasen lämnas orört. */
export const MASKINKOLUMNER = {
  Status: { select: {} },
  Etikett: { select: {} },
  'Etikett v1': { select: {} },
  'Etikett v2': { select: {} },
  'Etikett v3': { select: {} },
  Typ: { select: {} },
  Vinkel: { select: {} },
  Format: { select: {} },
  Kreatör: { select: {} },
  Marknad: { select: {} },
  Adset: { select: {} },
  Playbook: { rich_text: {} },
  Förälder: { rich_text: {} },
  Koncept: { rich_text: {} },
  Lärdom: { rich_text: {} },
  Startdag: { date: {} },
  Mätt: { date: {} },
  'Spend kr': { number: { format: 'number' } },
  Köp: { number: { format: 'number' } },
  ROAS: { number: { format: 'number' } },
  'CPA kr': { number: { format: 'number' } },
  'Hook rate': { number: { format: 'percent' } },
  'Hold rate': { number: { format: 'percent' } },
  LPV: { number: { format: 'number' } },
  'Konv LPV': { number: { format: 'percent' } },
  'Vinstbidrag 14 d kr': { number: { format: 'number' } },
  'Meta-id': { rich_text: {} },
  'Ads Manager': { url: {} },
};

/** Kolumnerna människorna äger. Skapas en gång, skrivs aldrig av koden. */
export const MANNISKOKOLUMNER = {
  Anteckning: { rich_text: {} },
  Beslut: { select: { options: [
    { name: 'Skala', color: 'green' }, { name: 'Iterera', color: 'blue' },
    { name: 'Vänta', color: 'yellow' }, { name: 'Släpp', color: 'red' },
  ] } },
  'Nästa steg': { rich_text: {} },
  Ägare: { people: {} },
};

const text = (s) => ({ rich_text: s == null || s === '' ? [] : [{ text: { content: String(s).slice(0, 1900) } }] });
const sel = (s) => (s == null || s === '' ? { select: null } : { select: { name: String(s).replace(/,/g, ' ').slice(0, 90) } });
const num = (n) => ({ number: n == null || Number.isNaN(Number(n)) ? null : Number(n) });
const datum = (d) => ({ date: d ? { start: String(d).slice(0, 10) } : null });

/** En arkivrad → Notion-egenskaper (bara maskinkolumnerna). Ren funktion, testad. */
export function egenskaperFor(rad) {
  const m = rad.senaste_matning || {};
  const v = (n) => (rad.etiketter || []).find((e) => e.vecka === n)?.etikett;
  return {
    Annons: { title: [{ text: { content: rad.namn } }] },
    Status: sel(rad.status),
    Etikett: sel(rad.etikett),
    'Etikett v1': sel(v(1)),
    'Etikett v2': sel(v(2)),
    'Etikett v3': sel(v(3)),
    Typ: sel(rad.typ),
    Vinkel: sel(rad.vinkel),
    Format: sel(rad.format),
    Kreatör: sel(rad.kreator),
    Marknad: sel(rad.marknad),
    Adset: sel(rad.adset),
    Playbook: text(rad.playbook),
    Förälder: text(rad.foralder),
    Koncept: text(rad.koncept),
    Lärdom: text(rad.lardom),
    Startdag: datum(rad.d0),
    Mätt: datum(m.datum),
    'Spend kr': num(m.spend_sek == null ? null : Math.round(m.spend_sek)),
    Köp: num(m.kop),
    ROAS: num(m.roas),
    'CPA kr': num(m.cpa_sek == null ? null : Math.round(m.cpa_sek)),
    'Hook rate': num(m.hook_rate),
    'Hold rate': num(m.hold_rate),
    LPV: num(m.lpv),
    'Konv LPV': num(m.konv_lpv),
    'Vinstbidrag 14 d kr': num(rad.vinstbidrag_14d_sek == null ? null : Math.round(rad.vinstbidrag_14d_sek)),
    'Meta-id': text(rad.id),
    'Ads Manager': { url: rad.id ? `https://adsmanager.facebook.com/adsmanager/manage/ads?act=${KONTO}&selected_ad_ids=${rad.id}` : null },
  };
}

/** Vilka rader som är nya, ändrade eller oförändrade mot det som redan ligger i Notion. */
export function planera(arkivrader, befintliga) {
  const plan = { nya: [], andrade: [], oandrade: 0 };
  for (const rad of arkivrader) {
    const bef = befintliga.get(rad.namn);
    if (!bef) { plan.nya.push(rad); continue; }
    const m = rad.senaste_matning || {};
    const samma = bef.etikett === (rad.etikett || null) && bef.matt === (m.datum || null) && bef.spend === (m.spend_sek == null ? null : Math.round(m.spend_sek)) && bef.status === (rad.status || null);
    if (samma) plan.oandrade++; else plan.andrade.push(rad);
  }
  return plan;
}

function lasKonfig() { return existsSync(KONFIG_FIL) ? JSON.parse(readFileSync(KONFIG_FIL, 'utf8')) : {}; }

async function notion(path, { method = 'GET', body } = {}) {
  const tok = process.env.NOTION_TOKEN;
  if (!tok) throw new Error('NOTION_TOKEN saknas i miljön');
  for (let forsok = 0; forsok < 5; forsok++) {
    const r = await fetch(`${NOTION}${path}`, { method, headers: { Authorization: `Bearer ${tok}`, 'Notion-Version': VERSION, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 429 || r.status >= 500) { await new Promise((k) => setTimeout(k, 1500 * (forsok + 1))); continue; }
    const j = await r.json();
    if (!r.ok) throw new Error(`Notion ${r.status} ${path}: ${j.message || JSON.stringify(j).slice(0, 300)}`);
    return j;
  }
  throw new Error(`Notion svarade inte på fem försök: ${path}`);
}

async function hittaSida(namn) {
  const s = await notion('/search', { method: 'POST', body: { query: namn, filter: { property: 'object', value: 'page' }, page_size: 20 } });
  return (s.results || []).find((r) => (Object.values(r.properties || {}).find((v) => v.type === 'title')?.title || []).map((t) => t.plain_text).join('').trim() === namn);
}

async function skapaDatabas(sidaId) {
  const db = await notion('/databases', { method: 'POST', body: {
    parent: { type: 'page_id', page_id: sidaId },
    title: [{ text: { content: 'Matstrumpor Growth Guide' } }],
    description: [{ text: { content: 'Byggs av /matstrumporkungen varje rond ur arkivet. Koden skriver mätkolumnerna; Anteckning, Beslut, Nästa steg och Ägare är människornas och rörs aldrig av koden.' } }],
    properties: { Annons: { title: {} }, ...MASKINKOLUMNER, ...MANNISKOKOLUMNER },
  } });
  return db.id;
}

async function lasBefintliga(dbId) {
  const karta = new Map();
  let cursor;
  do {
    const q = await notion(`/databases/${dbId}/query`, { method: 'POST', body: { page_size: 100, start_cursor: cursor } });
    for (const p of q.results || []) {
      const namn = (p.properties?.Annons?.title || []).map((t) => t.plain_text).join('');
      if (!namn) continue;
      karta.set(namn, {
        id: p.id,
        etikett: p.properties?.Etikett?.select?.name || null,
        status: p.properties?.Status?.select?.name || null,
        matt: p.properties?.['Mätt']?.date?.start || null,
        spend: p.properties?.['Spend kr']?.number ?? null,
      });
    }
    cursor = q.has_more ? q.next_cursor : undefined;
  } while (cursor);
  return karta;
}

async function main() {
  const arg = new Set(process.argv.slice(2));
  const skarpt = arg.has('--skarpt');
  const konfig = lasKonfig();
  if (!existsSync(ARKIV_FIL)) { console.log(`Arkivet saknas (${ARKIV_FIL}). Kör först: node matstrumpor/kor.mjs --arkiv`); process.exit(2); }
  const arkiv = JSON.parse(readFileSync(ARKIV_FIL, 'utf8'));
  const rader = (arkiv.annonser || []).filter((r) => r.namn);
  console.log(`Arkivet: ${rader.length} annonser, skrivet ${arkiv.skrivet}`);

  if (arg.has('--kolla')) {
    const sida = konfig.sida_id ? { id: konfig.sida_id } : await hittaSida(konfig.sida_namn || 'Matstrumpor Growth Guide');
    console.log(`Sidan: ${sida ? sida.id : 'HITTAS INTE (skapa "Matstrumpor Growth Guide" och bjud in integrationen)'}`);
    console.log(`Databasen: ${konfig.database_id || 'inte skapad än'}`);
    return;
  }

  let dbId = konfig.database_id;
  if (!dbId) {
    const sida = konfig.sida_id ? { id: konfig.sida_id } : await hittaSida(konfig.sida_namn || 'Matstrumpor Growth Guide');
    if (!sida) { console.log('Sidan "Matstrumpor Growth Guide" syns inte för integrationen. Axel skapar den och bjuder in integrationen (••• → Connections).'); process.exit(2); }
    if (!skarpt) { console.log(`TORRT: skulle skapa databasen under sidan ${sida.id} och skriva ${rader.length} rader.`); return; }
    dbId = await skapaDatabas(sida.id);
    writeFileSync(KONFIG_FIL, JSON.stringify({ ...konfig, sida_id: sida.id, database_id: dbId, skapad: new Date().toISOString().slice(0, 10) }, null, 2) + '\n');
    console.log(`Databasen skapad: ${dbId}`);
  }

  const befintliga = await lasBefintliga(dbId);
  const plan = planera(rader, befintliga);
  console.log(`Notion har ${befintliga.size} rader. Nya: ${plan.nya.length}, ändrade: ${plan.andrade.length}, oförändrade: ${plan.oandrade}.`);
  if (!skarpt) { for (const r of plan.nya.slice(0, 10)) console.log('  + ' + r.namn); for (const r of plan.andrade.slice(0, 10)) console.log('  ~ ' + r.namn); if (plan.nya.length + plan.andrade.length > 20) console.log('  …'); return; }

  let skrivna = 0, fel = 0;
  for (const rad of plan.nya) {
    try { await notion('/pages', { method: 'POST', body: { parent: { database_id: dbId }, properties: egenskaperFor(rad) } }); skrivna++; }
    catch (e) { fel++; console.log(`  FEL ny ${rad.namn}: ${e.message}`); }
  }
  for (const rad of plan.andrade) {
    try { await notion(`/pages/${befintliga.get(rad.namn).id}`, { method: 'PATCH', body: { properties: egenskaperFor(rad) } }); skrivna++; }
    catch (e) { fel++; console.log(`  FEL ändrad ${rad.namn}: ${e.message}`); }
  }
  // Tillbakaläsning: antalet rader i Notion ska vara minst arkivets.
  const efter = await lasBefintliga(dbId);
  console.log(`Skrivna: ${skrivna}, fel: ${fel}. Notion har nu ${efter.size} rader (arkivet ${rader.length}).`);
  console.log(`Länk: https://www.notion.so/${dbId.replace(/-/g, '')}`);
  if (fel) process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(e.message); process.exit(1); });
}
