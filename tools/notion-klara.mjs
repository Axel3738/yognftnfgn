#!/usr/bin/env node
// notion-klara.mjs — hämtar de klara taskarna ur Bäverbutikens fyra creative hubs
// via Notions REST API. Reservväg för /notionkorning när Notion-MCP:n inte är
// tillgänglig i sessionen (rutiner ärver inte sessionens connectors).
//
//   node tools/notion-klara.mjs                      alla scaling-produkter
//   node tools/notion-klara.mjs --produkt motorholjet
//   node tools/notion-klara.mjs --status "To be Reviewed,Approved"
//   node tools/notion-klara.mjs --brief <page-id>    dumpar itemets brief som text
//   node tools/notion-klara.mjs --json               maskinläsbart
//
// Kräver env: NOTION_TOKEN (integration inbjuden till varje hub —
// ••• → Connections. 404 betyder "inte inbjuden", inte "databasen saknas").

import { readFileSync } from 'node:fs';

const API = 'https://api.notion.com/v1';
const TOKEN = process.env.NOTION_TOKEN;
const ROT = new URL('..', import.meta.url).pathname;

const args = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
};
const finns = (n) => args.includes(`--${n}`);

// "To be Reviewed" ar den status /bildannonser satter nar bilden ar klar och bifogad.
const STATUSAR = (flagga('status', 'To be Reviewed,Approved')).split(',').map(s => s.trim().toLowerCase());
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

// Notion stryper till ~3 anrop/s. Ett par hundra sidor tar minuter — det är normalt.
let sist = 0;
async function notion(sökväg, { method = 'GET', body = null } = {}) {
  if (!TOKEN) dö('NOTION_TOKEN saknas i miljön.');
  const vänta = 350 - (Date.now() - sist);
  if (vänta > 0) await new Promise(r => setTimeout(r, vänta));
  sist = Date.now();
  const res = await fetch(`${API}/${sökväg}`, {
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

const text = (rika = []) => rika.map(r => r.plain_text ?? '').join('');

/** Läser ut ett fältvärde oavsett om det är select, status, multi_select eller text. */
function värde(prop) {
  if (!prop) return '';
  switch (prop.type) {
    case 'title':        return text(prop.title);
    case 'rich_text':    return text(prop.rich_text);
    case 'select':       return prop.select?.name ?? '';
    case 'status':       return prop.status?.name ?? '';
    case 'multi_select': return (prop.multi_select ?? []).map(o => o.name).join(', ');
    case 'people':       return (prop.people ?? []).map(p => p.name || p.id).join(', ');
    case 'date':         return prop.date?.start ?? '';
    case 'files':        return (prop.files ?? []).map(f => f.file?.url ?? f.external?.url ?? '').filter(Boolean).join(' ');
    case 'url':          return prop.url ?? '';
    default:             return '';
  }
}

/** Hubbarna delar mall: Namn (title), Status (status), Typ (select). Ta dem på
 *  namn i första hand, på typ i andra, och på värde först som sista utväg — så
 *  att ett fritextfält som råkar innehålla "approved" aldrig läses som status. */
function hittaFält(sida) {
  const p = sida.properties ?? {};
  const poster = Object.entries(p);
  const titelFält = poster.find(([, v]) => v.type === 'title')?.[0] ?? null;

  const statusFält =
    poster.find(([n, v]) => n === 'Status' && (v.type === 'status' || v.type === 'select'))?.[0]
    ?? poster.find(([, v]) => v.type === 'status')?.[0]
    ?? poster.find(([, v]) => v.type === 'select'
         && /^(draft|in progress|to be reviewed|in review|approved|archived|not used|creative strat review)/i.test(värde(v)))?.[0]
    ?? null;

  const typFält =
    poster.find(([n, v]) => n === 'Typ' && (v.type === 'select' || v.type === 'multi_select'))?.[0]
    ?? poster.find(([n, v]) => /^(typ|type)$/i.test(n))?.[0]
    ?? poster.find(([n, v]) => (v.type === 'select' || v.type === 'multi_select')
         && n !== statusFält && /pending approval|winning creative|guideline|\bsop\b/i.test(värde(v)))?.[0]
    ?? null;

  return { statusFält, typFält, titelFält };
}

async function hämtaAllaSidor(databaseId) {
  const ut = [];
  let cursor;
  do {
    const r = await notion(`databases/${databaseId}/query`, {
      method: 'POST',
      body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    ut.push(...(r.results ?? []));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return ut;
}

/** Sidinnehållet som text — briefen ligger som blocks i itemet. */
async function briefText(pageId, djup = 0) {
  const rader = [];
  let cursor;
  do {
    const r = await notion(`blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
    for (const b of r.results ?? []) {
      const inne = b[b.type] ?? {};
      const t = text(inne.rich_text ?? []);
      const url = inne.url ?? inne.external?.url ?? inne.file?.url ?? '';
      if (t) rader.push('  '.repeat(djup) + t);
      if (url) rader.push('  '.repeat(djup) + `[${b.type}] ${url}`);
      if (b.has_children && djup < 3) rader.push(...await briefText(b.id, djup + 1));
    }
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return rader;
}

// --------------------------------------------------------------------- Main

const { products } = JSON.parse(readFileSync(`${ROT}products/products.json`, 'utf8'));

if (finns('brief')) {
  const id = flagga('brief');
  if (!id) dö('Ange --brief <page-id>.');
  console.log((await briefText(id)).join('\n'));
  process.exit(0);
}

const filter = flagga('produkt');

// Hubbarna hittas DYNAMISKT, inte ur products.json. Den filen kanner fyra produkter;
// kontot har 46 annonsprefix. En handskriven lista gjorde brief-grinden okorbar for
// 42 av dem — och grinden ar det enda som star mellan en trasig creative och kontot.
// (Fynd 2026-08-31, samma rotorsak som gomde fem fardiga bildannonser.)
const { hittaHubbar } = await import('./notion-kalla.mjs');
let hubbar;
try {
  hubbar = (await hittaHubbar()).map(h => ({
    id: h.titel, notion: { name: h.titel, database_id: h.id },
    campaign_ids: products.find(p => p.notion?.database_id?.replace(/-/g, '') === h.id.replace(/-/g, ''))?.campaign_ids ?? [],
  }));
} catch (e) {
  if (e.saknarToken) dö('NOTION_TOKEN saknas i miljön.');
  throw e;
}
// products.json far namnge de fyra den kanner, sa utskriften blir igenkannbar.
for (const h of hubbar) {
  const p = products.find(x => x.notion?.database_id?.replace(/-/g, '') === h.notion.database_id.replace(/-/g, ''));
  if (p) h.id = p.id;
}
if (filter) hubbar = hubbar.filter(h => h.id === filter || new RegExp(filter, 'i').test(h.notion.name));
if (!hubbar.length) dö(filter ? `Ingen creative hub matchar "${filter}".` : 'Hittade inga creative hub-databaser. Är integrationen inbjuden till dem?');

const resultat = { hämtadAt: new Date().toISOString(), produkter: {}, fel: {} };

for (const p of hubbar) {
  try {
    const sidor = await hämtaAllaSidor(p.notion.database_id);
    const klara = [];
    for (const s of sidor) {
      const { statusFält, typFält, titelFält } = hittaFält(s);
      const namn = titelFält ? värde(s.properties[titelFält]) : '';
      if (!namn || /^Skärmavbild/i.test(namn)) continue;         // mallrader är inte arbete
      const typ = typFält ? värde(s.properties[typFält]) : '';
      // INKLUDERING, aldrig uteslutning — annars smyger nya stödsidor in i mätningen.
      if (!/pending approval/i.test(typ)) continue;
      const status = statusFält ? värde(s.properties[statusFält]) : '';
      if (!STATUSAR.includes(status.toLowerCase())) continue;

      const filer = Object.values(s.properties)
        .filter(x => x.type === 'files')
        .flatMap(x => (x.files ?? []).map(f => f.file?.url ?? f.external?.url))
        .filter(Boolean);

      klara.push({
        id: s.id, namn, status, typ,
        skapad: s.created_time, redigerad: s.last_edited_time,
        url: s.url, filer,
        övrigt: Object.fromEntries(Object.entries(s.properties)
          .map(([k, v]) => [k, värde(v)]).filter(([, v]) => v)),
      });
    }
    resultat.produkter[p.id] = klara;
  } catch (e) {
    // 404 = integrationen är inte inbjuden till hubben (••• → Connections).
    resultat.fel[p.id] = e.status === 404
      ? `404 — integrationen är inte inbjuden till "${p.notion.name}" (••• → Connections)`
      : e.message;
  }
}

if (finns('json')) {
  console.log(JSON.stringify(resultat, null, 2));
  process.exit(0);
}

let totalt = 0;
for (const p of hubbar) {
  const fel = resultat.fel[p.id];
  if (fel) { console.log(`\n${p.id} — ✗ ${fel}`); continue; }
  const klara = resultat.produkter[p.id];
  totalt += klara.length;
  const kmp = p.campaign_ids?.[0] ? `→ kampanj ${p.campaign_ids[0]}` : '(kampanj slås upp ur kontot)';
  console.log(`\n${p.id} (${p.notion.name}) ${kmp} — ${klara.length} klara`);
  for (const k of klara) {
    console.log(`  • ${k.namn}  [${k.status}]  ${k.filer.length ? `${k.filer.length} fil(er)` : '⚠ ingen fil i itemet'}`);
    console.log(`    ${k.url}`);
  }
}
console.log(`\nTotalt ${totalt} klara tasks (status: ${STATUSAR.join(', ')}).`);
if (Object.keys(resultat.fel).length) console.log(`⚠ ${Object.keys(resultat.fel).length} hub(bar) svarade inte — se ovan.`);
