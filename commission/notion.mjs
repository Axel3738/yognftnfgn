// notion.mjs — läser godkända annonsrader ur Bäverbutikens creative hubs.
//
// Två vägar in, i den här ordningen:
//  1. En jobbfil som sessionen skrivit med Notion-MCP:n (teamspace-verifierad).
//     Det är den säkra vägen — teamspacet är skyddet mot att Grillklinikens,
//     Matstrupors eller Ploomis hubbar blandas in.
//  2. NOTION_TOKEN + REST, när rutinen kör utan MCP-connector. Då kan
//     teamspacet inte läsas, så hubbarna märks `teamspaceVerifierad: false`
//     och listas i rapporten — Axel ska kunna se exakt vad som räknades.
//
// Notion stryper till ~3 anrop/s. Ett par hundra sidor tar minuter. Normalt.

import { readFileSync } from 'node:fs';

const API = 'https://api.notion.com/v1';
const MALL = /creative hub MALL/i;
const HUBBNAMN = /creative hub\s*$/i;

export class NotionFel extends Error {}

export function harToken(env = process.env) {
  return Boolean(env.NOTION_TOKEN);
}

let sist = 0;
async function notion(sokvag, { method = 'GET', body = null, fetchImpl = fetch, env = process.env } = {}) {
  if (!env.NOTION_TOKEN) throw new NotionFel('NOTION_TOKEN saknas i miljön.');
  const vanta = 350 - (Date.now() - sist);
  if (vanta > 0) await new Promise((r) => setTimeout(r, vanta));
  sist = Date.now();
  const res = await fetchImpl(`${API}/${sokvag}`, {
    method,
    headers: {
      authorization: `Bearer ${env.NOTION_TOKEN}`,
      'notion-version': '2022-06-28',
      'content-type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const e = new NotionFel(json.message || res.statusText);
    e.status = res.status;
    throw e;
  }
  return json;
}

const text = (rika = []) => rika.map((r) => r.plain_text ?? '').join('');

/** Fälten heter likadant i alla hubbar — de klonas ur samma mall. Tas ändå på
 *  typ i andra hand, så att en omdöpt kolumn inte tystar hela utbetalningen. */
function las(sida) {
  const p = sida.properties ?? {};
  const poster = Object.entries(p);
  const av = (namn, typ) => p[namn]?.type === typ ? p[namn] : poster.find(([, v]) => v.type === typ)?.[1];

  const titel = av('Namn', 'title');
  const status = p.Status?.type === 'status' || p.Status?.type === 'select' ? p.Status : av('Status', 'status');
  const typ = p.Typ?.type === 'select' ? p.Typ : null;
  const ansvarig = p.Ansvarig?.type === 'people' ? p.Ansvarig : av('Ansvarig', 'people');
  const godkand = p['Godkänd datum']?.type === 'date' ? p['Godkänd datum'] : null;

  return {
    namn: text(titel?.title ?? []),
    status: status?.status?.name ?? status?.select?.name ?? '',
    typ: typ?.select?.name ?? '',
    ansvariga: (ansvarig?.people ?? []).map((x) => x.id).filter(Boolean),
    godkand: godkand?.date?.start ?? null,
    url: sida.url,
    skapad: sida.created_time,
  };
}

async function allaSidor(databaseId, opt) {
  const ut = [];
  let cursor;
  do {
    const r = await notion(`databases/${databaseId}/query`, {
      ...opt, method: 'POST',
      body: { page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) },
    });
    ut.push(...(r.results ?? []));
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return ut;
}

/** Hubbarna via REST-sök. Mallen räknas aldrig som en produkt. */
export async function hittaHubbar(opt = {}) {
  const r = await notion('search', {
    ...opt, method: 'POST',
    body: { query: 'creative hub', filter: { value: 'database', property: 'object' }, page_size: 100 },
  });
  return (r.results ?? [])
    .map((d) => ({ id: d.id, namn: text(d.title ?? []), url: d.url }))
    .filter((d) => HUBBNAMN.test(d.namn) && !MALL.test(d.namn));
}

/** Rader ur en hubb. 404 = integrationen är inte inbjuden (••• → Connections). */
export async function hamtaHubb(hubb, opt = {}) {
  const sidor = await allaSidor(hubb.id, opt);
  return { ...hubb, rader: sidor.map(las).filter((r) => r.namn) };
}

/**
 * Alla hubbar med sina rader. Hubbar som svarar med fel stoppar inte
 * körningen — de redovisas, för commission som tyst faller bort är
 * pengar någon inte får.
 */
export async function hamtaAllaHubbar({ hubbar = null, ...opt } = {}) {
  const lista = hubbar ?? await hittaHubbar(opt);
  const ut = [];
  const fel = [];
  for (const hubb of lista) {
    try {
      ut.push(await hamtaHubb(hubb, opt));
    } catch (e) {
      fel.push({
        hubb: hubb.namn,
        fel: e.status === 404
          ? `404 — integrationen är inte inbjuden till "${hubb.namn}" (••• → Connections)`
          : e.message,
      });
    }
  }
  return { hubbar: ut, fel };
}

/**
 * Jobbfil skriven av sessionen via Notion-MCP:n.
 * Format: { teamspace, hubbar: [{ id, namn, rader: [{namn, status, typ, ansvariga[], url}] }] }
 */
export function lasJobbfil(sokvag) {
  let jobb;
  try {
    jobb = JSON.parse(readFileSync(sokvag, 'utf8'));
  } catch (e) {
    throw new NotionFel(`Kunde inte läsa jobbfilen ${sokvag}: ${e.message}`);
  }
  if (!Array.isArray(jobb.hubbar) || !jobb.hubbar.length) {
    throw new NotionFel(`Jobbfilen ${sokvag} har inga hubbar. Kör steg 1 i /commission igen.`);
  }
  for (const h of jobb.hubbar) {
    if (!Array.isArray(h.rader)) throw new NotionFel(`Hubben "${h.namn}" i jobbfilen saknar rader[].`);
    for (const r of h.rader) {
      if (!Array.isArray(r.ansvariga)) {
        throw new NotionFel(`Raden "${r.namn}" i "${h.namn}" saknar ansvariga[] — utan den går ingen commission att räkna.`);
      }
    }
  }
  return jobb;
}

/** Namn på en Notion-användare, för att kunna namnge okända Ansvariga i rapporten. */
export async function hamtaAnvandare(id, opt = {}) {
  try {
    const r = await notion(`users/${id}`, opt);
    return { id, namn: r.name ?? '', epost: r.person?.email ?? '' };
  } catch {
    return { id, namn: '', epost: '' };
  }
}
