#!/usr/bin/env node
// notion-hub.mjs — skapar en creative hub per OPS-butik, med samma schema som
// husets befintliga hubbar.
//
//   node tools/notion-hub.mjs --lista                     visar mallen och vad som skulle skapas
//   node tools/notion-hub.mjs --foralder <page-id> --torr planen, skriver ingenting
//   node tools/notion-hub.mjs --foralder <page-id>        skarpt, en hub per OPS-butik
//   node tools/notion-hub.mjs --foralder <page-id> --butik tankguard
//
// Kräver env: NOTION_TOKEN, och att integrationen är inbjuden till föräldersidan
// (••• → Connections). 404 betyder "inte inbjuden", inte "sidan saknas".
//
// TVÅ SAKER API:T INTE KAN, och som därför är Axels klick:
//
//   1. SKAPA ETT TEAMSPACE. Notions publika API har ingen endpoint för det.
//      Teamspacet görs i Notion, och `--foralder` är en SIDA inuti det.
//   2. SKAPA EN `status`-EGENSKAP. API:t kan bara skapa `select`. Husets
//      läsare (tools/notion-kalla.mjs, notion-klara.mjs, commission/notion.mjs)
//      accepterar båda typerna, så hubben fungerar direkt — men vill du ha
//      Notions status-kolumn med faser byter du typ för hand efteråt.
//
// Schemat HITTAS PÅ ALDRIG: det läses ur en befintlig hub, så nya butiker får
// exakt de fält resten av systemet redan letar efter. Ändras mallen i Notion
// följer nya hubbar med av sig själva.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const API = 'https://api.notion.com/v1';
const TOKEN = process.env.NOTION_TOKEN;
const ROT = dirname(dirname(fileURLToPath(import.meta.url)));

const args = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
};
const finns = (n) => args.includes(`--${n}`);
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

// Notion stryper till ~3 anrop/s. Det är normalt, inte en hängning.
let sist = 0;
async function notion(sokvag, { method = 'GET', body = null } = {}) {
  if (!TOKEN) dö('NOTION_TOKEN saknas i miljön. Lägg in den i sessionens Environment.');
  const vanta = 350 - (Date.now() - sist);
  if (vanta > 0) await new Promise((r) => setTimeout(r, vanta));
  sist = Date.now();
  const res = await fetch(`${API}/${sokvag}`, {
    method,
    headers: {
      authorization: `Bearer ${TOKEN}`,
      'notion-version': '2022-06-28',
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new Error(json.message || res.statusText);
    e.status = res.status;
    throw e;
  }
  return json;
}

// ------------------------------------------------------------------ ren logik

/** OPS-butikerna som ska ha en hub. Läses ur konfigen, aldrig ur en lista —
 *  en ny butik ska komma med av sig själv. testbutiken är en fixtur. */
export function opsButiker(rot = ROT) {
  const mapp = join(rot, 'factory', 'butiker');
  if (!existsSync(mapp)) return [];
  return readdirSync(mapp)
    .filter((f) => f.endsWith('.yaml') && f !== 'testbutiken.yaml')
    .map((f) => f.replace(/\.yaml$/, ''));
}

/** Hubbnamnet. Titelregeln i CLAUDE.md: hubbar hittas dynamiskt på att titeln
 *  slutar på "creative hub" — så det måste den göra, annars missar rutinerna
 *  butiken tyst. (Mätt 2026-09-08: två hubbar utan orden missade två videor.) */
export function hubbnamn(brand) {
  return `${brand} creative hub`;
}

/** Bygger databasens properties ur en befintlig hubs schema.
 *
 *  Två saker städas bort, för API:t vägrar annars:
 *   • `status`-typen går inte att skapa — den blir `select` med samma val.
 *   • formler, relationer och rollups pekar på andra databaser och kan inte
 *     kopieras rakt av; de tas bort och RAPPORTERAS, aldrig tyst. */
export function byggSchema(mallProperties) {
  const ut = {};
  const nedgraderade = [];
  const utelamnade = [];

  for (const [namn, def] of Object.entries(mallProperties || {})) {
    const typ = def.type;
    if (typ === 'title') { ut[namn] = { title: {} }; continue; }
    if (typ === 'status') {
      // Behåll valen, byt typ. Husets läsare accepterar select lika gärna.
      const val = (def.status?.options || []).map((o) => ({ name: o.name, color: o.color }));
      ut[namn] = { select: { options: val } };
      nedgraderade.push(`${namn}: status → select (API:t kan inte skapa status)`);
      continue;
    }
    if (typ === 'select' || typ === 'multi_select') {
      const val = (def[typ]?.options || []).map((o) => ({ name: o.name, color: o.color }));
      ut[namn] = { [typ]: { options: val } };
      continue;
    }
    if (['formula', 'relation', 'rollup', 'unique_id'].includes(typ)) {
      utelamnade.push(`${namn} (${typ}) — pekar på en annan databas, måste sättas för hand`);
      continue;
    }
    // Enkla typer bär ingen konfiguration: rich_text, number, date, checkbox,
    // url, email, phone_number, people, files, created_time, ...
    ut[namn] = { [typ]: def[typ] ?? {} };
  }
  return { properties: ut, nedgraderade, utelamnade };
}

/** Vilka butiker som saknar hub. Jämför på brandnamn, inte på id — hubbarna
 *  heter efter brandet. */
export function saknarHub(butiker, befintligaTitlar) {
  const finnsRedan = (brand) =>
    befintligaTitlar.some((t) => t.toLowerCase().includes(String(brand).toLowerCase()));
  return butiker.filter((b) => !finnsRedan(b.brand));
}

// ------------------------------------------------------------------ läsning

function lasButiker() {
  const { lasYaml } = { lasYaml: null };
  const ut = [];
  for (const id of opsButiker()) {
    const fil = join(ROT, 'factory', 'butiker', `${id}.yaml`);
    const text = readFileSync(fil, 'utf8');
    // Brandet står som `brand: "Namn"` eller `namn: "Namn"` i butiksblocket.
    const m = text.match(/^\s*brand:\s*["']?([^"'\n]+)["']?\s*$/m)
      || text.match(/^\s*namn:\s*["']?([^"'\n]+)["']?\s*$/m);
    ut.push({ id, brand: (m ? m[1] : id).trim() });
  }
  return ut;
}

/** Hittar en befintlig hub att läsa schemat ur. Mallen först, annars vilken
 *  hub som helst — poängen är att INTE hitta på fälten. */
async function hittaMall() {
  const svar = await notion('search', {
    method: 'POST',
    body: { query: 'creative hub', filter: { property: 'object', value: 'database' }, page_size: 100 },
  });
  const träffar = (svar.results || []).map((d) => ({
    id: d.id,
    titel: (d.title || []).map((t) => t.plain_text).join(''),
    properties: d.properties,
  }));
  if (!träffar.length) return { mall: null, alla: [] };
  const mall = träffar.find((t) => /mall/i.test(t.titel)) || träffar[0];
  return { mall, alla: träffar };
}

// ------------------------------------------------------------------ CLI

async function main() {
  const butiker = lasButiker();
  if (!butiker.length) dö('Inga OPS-butiker i factory/butiker/.');

  const valdButik = flagga('butik');
  const mål = valdButik ? butiker.filter((b) => b.id === valdButik) : butiker;
  if (valdButik && !mål.length) dö(`Ingen butik "${valdButik}" i factory/butiker/.`);

  console.log(`\nOPS-butiker i konfigen: ${butiker.map((b) => `${b.brand} (${b.id})`).join(', ')}\n`);

  if (finns('lista') && !TOKEN) {
    console.log('Skulle skapa:');
    for (const b of mål) console.log(`  • ${hubbnamn(b.brand)}`);
    console.log('\nKräver NOTION_TOKEN och --foralder <page-id> (en sida i teamspacet).');
    console.log('Teamspacet självt går INTE att skapa via API:t — det är ett klick i Notion.\n');
    return;
  }

  const { mall, alla } = await hittaMall();
  if (!mall) dö('Hittade ingen befintlig creative hub att läsa schemat ur. Är integrationen inbjuden till någon hub?');
  console.log(`Schemat läses ur: "${mall.titel}"`);

  const { properties, nedgraderade, utelamnade } = byggSchema(mall.properties);
  console.log(`  ${Object.keys(properties).length} fält: ${Object.keys(properties).join(', ')}`);
  for (const n of nedgraderade) console.log(`  ⚠️ ${n}`);
  for (const u of utelamnade) console.log(`  ⚠️ utelämnat — ${u}`);

  const behovs = saknarHub(mål, alla.map((a) => a.titel));
  if (!behovs.length) {
    console.log('\n✓ Varje butik har redan en hub. Inget att göra.\n');
    return;
  }
  console.log(`\nSaknar hub: ${behovs.map((b) => b.brand).join(', ')}`);

  const foralder = flagga('foralder');
  if (finns('torr') || !foralder) {
    console.log('\nSkulle skapa:');
    for (const b of behovs) console.log(`  • ${hubbnamn(b.brand)}`);
    if (!foralder) console.log('\n⚠️ Ange --foralder <page-id> — en SIDA i teamspacet hubbarna ska ligga i.');
    console.log('');
    return;
  }

  for (const b of behovs) {
    const titel = hubbnamn(b.brand);
    try {
      const db = await notion('databases', {
        method: 'POST',
        body: {
          parent: { type: 'page_id', page_id: foralder },
          title: [{ type: 'text', text: { content: titel } }],
          properties,
        },
      });
      console.log(`  ✅ ${titel} — ${db.id}`);
    } catch (e) {
      console.log(`  ❌ ${titel}: ${e.message}${e.status === 404 ? ' (integrationen är inte inbjuden till föräldersidan)' : ''}`);
    }
  }
  console.log('\nSkriv in hubb-id:na i respektive butikskonfig innan skalningsronden körs.\n');
}

if (process.argv[1] && process.argv[1].endsWith('notion-hub.mjs')) {
  main().catch((e) => dö(e.message));
}
