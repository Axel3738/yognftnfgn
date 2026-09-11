// notion-produktrader.mjs — lägger upp en rad per produkt i en OPS-butiks
// Notion-databas ("<BRAND> Product test center").
//
// Varför den finns: en ny nischbutik får tolv produkter på en eftermiddag, och
// varje produkt ska ha sin egen rad att hänga creatives på. Att klicka upp dem
// för hand är elva chanser att stava fel på en länk.
//
// Läser produkterna ur factory/produkter/<id>.yaml (namn + handle) och skriver
// dem mot Notions REST-API med NOTION_TOKEN — inga mcp__*-verktyg, så den kan
// köras i en rutin utan att något godkännande utlöses.
//
// ⚠️ Databasen måste vara INBJUDEN till integrationen (••• → Connections).
//    404 betyder "inte inbjuden", aldrig "databasen saknas".
//
// Användning:
//   node tools/notion-produktrader.mjs <databas-id|url> <bas-url> <produkt-id …> [--torr]
//     --torr        visar planen, skriver ingenting
//     --typ "…"     Typ-värdet (default "Video - Pending Approval")
//     --status "…"  Status-värdet (default "Products")
//
// Exempel:
//   node tools/notion-produktrader.mjs 472270ab908c83cb868e8127667a3eee \
//     https://adventlane.se dinosaurie golf --torr

import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasYaml } from '../factory/yaml.mjs';
import { laddaEnv } from '../factory/env.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://api.notion.com/v1';
const VERSION = '2022-06-28';

/** Plockar databas-id:t ur en Notion-länk, eller släpper igenom ett rent id.
 *  Notions URL:er bär id:t utan bindestreck — API:t tar båda formerna. */
export function databasId(input) {
  const s = String(input ?? '').trim();
  const m = s.match(/[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  if (!m) throw new Error(`Hittar inget databas-id i "${s}".`);
  const rent = m[0].replace(/-/g, '').toLowerCase();
  return `${rent.slice(0, 8)}-${rent.slice(8, 12)}-${rent.slice(12, 16)}-${rent.slice(16, 20)}-${rent.slice(20)}`;
}

/** Produktens rad: namn ur filen, adress ur butikens handle (aldrig filens id). */
export function produktrad(p, basUrl) {
  const namn = String(p?.produkt?.namn ?? '').trim();
  const handle = String(p?.produkt?.handle ?? p?.produkt?.id ?? '').trim();
  if (!namn) throw new Error('Produktfilen saknar produkt.namn.');
  if (!handle) throw new Error(`${namn}: produktfilen saknar både handle och id.`);
  return { namn, handle, url: `${String(basUrl).replace(/\/+$/, '')}/products/${handle}` };
}

/** Sidkroppen: länken som ett eget stycke, så den syns när raden öppnas. */
export function sidegenskaper(rad, { typ, status, lankfalt }) {
  const egenskaper = {
    Namn: { title: [{ text: { content: rad.namn } }] },
    Typ: { select: { name: typ } },
    Status: { status: { name: status } },
  };
  if (lankfalt) egenskaper[lankfalt] = { rich_text: [{ text: { content: rad.url, link: { url: rad.url } } }] };
  return egenskaper;
}

async function notion(vag, { metod = 'GET', kropp = null } = {}) {
  const svar = await fetch(`${API}${vag}`, {
    method: metod,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': VERSION,
      'Content-Type': 'application/json',
    },
    ...(kropp ? { body: JSON.stringify(kropp) } : {}),
  });
  const data = await svar.json();
  if (data.object === 'error') {
    const extra = data.status === 404 ? ' — databasen är troligen inte inbjuden till integrationen (••• → Connections)' : '';
    throw new Error(`Notion ${data.status} ${data.code}: ${data.message}${extra}`);
  }
  return data;
}

/** Namnen som redan finns i databasen, så en andra körning inte dubblerar. */
async function befintligaNamn(dbId) {
  const namn = new Set();
  let cursor;
  do {
    const d = await notion(`/databases/${dbId}/query`, {
      metod: 'POST',
      kropp: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    for (const sida of d.results) {
      const titel = Object.values(sida.properties ?? {}).find((v) => v?.type === 'title');
      const t = (titel?.title ?? []).map((x) => x.plain_text).join('').trim();
      if (t) namn.add(t);
    }
    cursor = d.has_more ? d.next_cursor : null;
  } while (cursor);
  return namn;
}

async function huvud() {
  laddaEnv();
  if (!process.env.NOTION_TOKEN) throw new Error('NOTION_TOKEN saknas i environmentet.');
  const argv = process.argv.slice(2);
  const torr = argv.includes('--torr') || argv.includes('--dry');
  const flagga = (namn, standard) => {
    const i = argv.indexOf(`--${namn}`);
    return i > -1 ? argv[i + 1] : standard;
  };
  const typ = flagga('typ', 'Video - Pending Approval');
  const status = flagga('status', 'Products');
  const fria = argv.filter((a, i) => !a.startsWith('--') && !['--typ', '--status'].includes(argv[i - 1]));
  const [dbArg, basUrl, ...ids] = fria;
  if (!dbArg || !basUrl || ids.length === 0) {
    console.error('Användning: node tools/notion-produktrader.mjs <databas-id|url> <bas-url> <produkt-id …> [--torr] [--typ "…"] [--status "…"]');
    process.exit(1);
  }
  const dbId = databasId(dbArg);

  // Fältet länken ska ligga i väljs ur databasens EGET schema, aldrig gissat:
  // en rich_text som heter något med "landing"/"länk"/"url".
  const db = await notion(`/databases/${dbId}`);
  const titel = (db.title ?? []).map((t) => t.plain_text).join('');
  const lankfalt = Object.entries(db.properties)
    .find(([namn, v]) => v.type === 'rich_text' && /landing|l(ä|a)nk|url|page/i.test(namn))?.[0] ?? null;
  for (const [falt, varde] of [['Typ', typ], ['Status', status]]) {
    const def = db.properties[falt];
    if (!def) throw new Error(`Databasen "${titel}" saknar fältet ${falt}.`);
    const val = (def.select ?? def.status)?.options?.map((o) => o.name) ?? [];
    if (!val.includes(varde)) throw new Error(`${falt} "${varde}" finns inte. Möjliga: ${val.join(' | ')}`);
  }

  const rader = ids.map((id) => produktrad(lasYaml(readFileSync(join(ROT, 'factory/produkter', `${id}.yaml`), 'utf8')), basUrl));
  const finns = await befintligaNamn(dbId);

  console.log(`\nNotion · ${titel}${torr ? ' · TORR' : ''}`);
  console.log(`Typ: ${typ} · Status: ${status} · länken i: ${lankfalt ?? '(inget rich_text-fält hittat — bara i sidkroppen)'}\n`);

  let skapade = 0;
  let hoppade = 0;
  for (const rad of rader) {
    if (finns.has(rad.namn)) {
      hoppade += 1;
      console.log(`⏭  ${rad.namn} — finns redan, hoppar över`);
      continue;
    }
    if (torr) {
      skapade += 1;
      console.log(`   ${rad.namn}\n      ${rad.url}`);
      continue;
    }
    const sida = await notion('/pages', {
      metod: 'POST',
      kropp: {
        parent: { database_id: dbId },
        properties: sidegenskaper(rad, { typ, status, lankfalt }),
        children: [
          {
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ text: { content: rad.url, link: { url: rad.url } } }] },
          },
        ],
      },
    });
    skapade += 1;
    console.log(`✅ ${rad.namn}\n      ${rad.url}\n      ${sida.url}`);
  }
  console.log(`\n${torr ? `${skapade} rader skulle skapas` : `${skapade} rader skapade`}${hoppade > 0 ? `, ${hoppade} fanns redan` : ''} · ${rader.length} produkter lästa.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
