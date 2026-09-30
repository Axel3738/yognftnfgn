// api-mcp.mjs — egen MCP-server för Spoks officiella API ("spoks-api" i .mcp.json).
//
// Axels beställning 2026-09-30: en CLI och en MCP "så du kan interagera med allt
// ... och göra allt själv". Servern är ett tunt skal runt klaviyo/spoks/api.mjs:
// samma klient, samma spärrar, samma utskrift som CLI:n. Noll beroenden; MCP:s
// stdio-transport är JSON-RPC 2.0, ett meddelande per rad (samma mönster som
// kundtjanst/mail-mcp.mjs).
//
// Den kompletterar Spoks-connectorn på claude.ai, ersätter den inte:
//   • connectorn: innehåll (produktkort, kuponger), segment, flöden (avstängda),
//     statistik. Den väljer aldrig publik.
//   • spoks-api: publik (segment) och ämnesrad på ett UTKAST, kampanjlistan med
//     status och publiceringstid, kontakter, produkter, taggar — med en nyckel
//     per arbetsyta i miljön, så den fungerar även där connectorn saknas.
//   • ingen av dem: schemalägga, skicka, slå på flöden. Det finns bara i appen.
//
// Regler för stdio-servrar: stdout är BARA JSON-RPC (logg till stderr), ett svar
// per request-id, notiser besvaras aldrig, verktygsfel returneras som resultat
// med isError: true så att modellen ser texten.

import { createInterface } from 'node:readline';
import { skapaKlient, kollaAlla, skrivUt, sammanfatta, allaArbetsytor, lasKonfig, STATUSAR } from './api.mjs';

export const PROTOKOLL = ['2025-06-18', '2025-03-26', '2024-11-05'];
export const SERVER_INFO = { name: 'spoks-api', title: 'Spoks officiella API (publik, ämnesrad, kampanjer, kontakter)', version: '1.0.0' };

const INSTRUKTIONER = [
  'Spoks officiella API, en nyckel per arbetsyta (butik). Börja med spoks_kolla.',
  'Kan: lista kampanjer med status och publiceringstid (spoks_kampanjer), läsa ett utkast (spoks_kampanj), välja publik = segment-id på ett UTKAST (spoks_publik), ämnesrad och förhandstext på ett utkast (spoks_amnesrad), söka kontakter och produkter, lista taggar, och fria anrop genom en vitlista (spoks_anrop).',
  'Kan INTE, och ingen annan väg härifrån heller: schemalägga, publicera, skicka, slå på flöden eller sändsteg. Det görs i Spoks-appen av Axel eller Cowork. Spoks-connectorns get_links ger länken.',
  'Segment-id står i Spoks-connectorns get_segments eller i repots id-filer. Gissa aldrig ett id.',
  'Innehåll med produktkort eller kuponger ändras med Spoks-connectorn (update_draft_campaign_blocks), aldrig här: API:t raderar block det inte kan uttrycka.',
  'Varje ändring läses tillbaka. torr: true visar bara före och efter.',
].join(' ');

export function verktyg(konfig = lasKonfig()) {
  const butiker = allaArbetsytor(konfig).map((y) => y.id);
  const BUTIK = { type: 'string', enum: butiker, description: `Arbetsytan: ${butiker.join(', ')}. Varje butik har egen nyckel och egna kunder.` };
  const ID = { type: 'string', minLength: 1, maxLength: 64, description: 'Kampanjens id (ur spoks_kampanjer, Spoks-connectorns search_campaigns eller appens länk).' };
  const TORR = { type: 'boolean', description: 'true = ändra inget, visa bara före och efter.' };
  const FILTER = { type: 'object', description: 'Spoks sökfilter, t.ex. {"type":"filter","field":"email","operator":"ilike","value":"@gmail.com"} eller en conjunction {"type":"conjunction","operator":"and","isGrouped":true,"filters":[…]}.' };
  const las = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true };
  return [
    {
      name: 'spoks_kolla',
      title: 'Vilka Spoks-nycklar finns',
      description: 'För varje arbetsyta: finns nyckeln i miljön, och hör den till rätt arbetsyta (GET /authorization mot api-konfig.json)? Visar rättigheterna. Returnerar aldrig själva nyckeln.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: las,
    },
    {
      name: 'spoks_kampanjer',
      title: 'Lista kampanjer',
      description: 'Kampanjerna i en arbetsyta, nyast först: status (draft/scheduled/published/failed), publiceringstid i svensk tid, titel, id.',
      inputSchema: {
        type: 'object',
        properties: { butik: BUTIK, status: { type: 'string', enum: STATUSAR, description: 'Bara kampanjer med den statusen.' }, antal: { type: 'integer', minimum: 1, maximum: 500, description: 'Max antal, standard 50.' } },
        required: ['butik'],
        additionalProperties: false,
      },
      annotations: las,
    },
    {
      name: 'spoks_kampanj',
      title: 'Läs en kampanj',
      description: 'Ett utkast eller en kampanj: status, publiceringstid, ämnesrad, förhandstext, publik (segment-id), antal block och vilka block API:t inte kan uttrycka, länk till appen.',
      inputSchema: { type: 'object', properties: { butik: BUTIK, id: ID }, required: ['butik', 'id'], additionalProperties: false },
      annotations: las,
    },
    {
      name: 'spoks_publik',
      title: 'Välj publik på ett utkast',
      description: 'Sätter kampanjens publik (ersätter den gamla) till segmenten. Bara utkast; en schemalagd eller skickad kampanj vägras. If-Match skyddar mot att skriva över någon annans ändring, och publiken läses tillbaka. Skickar ingenting: kampanjen är fortfarande ett utkast tills någon schemalägger den i appen.',
      inputSchema: {
        type: 'object',
        properties: {
          butik: BUTIK,
          id: ID,
          segmentIds: { type: 'array', items: { type: 'string' }, minItems: 0, description: 'Segmentens id (UUID). Tom lista kräver tom: true.' },
          tom: { type: 'boolean', description: 'true = tillåt tom publik (kampanjen får ingen mottagare).' },
          torr: TORR,
        },
        required: ['butik', 'id', 'segmentIds'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    {
      name: 'spoks_amnesrad',
      title: 'Ämnesrad och förhandstext på ett utkast',
      description: 'Sätter e-postens ämnesrad (max 45 tecken) och/eller förhandstext (max 130). Bara utkast. Läses tillbaka.',
      inputSchema: {
        type: 'object',
        properties: { butik: BUTIK, id: ID, amne: { type: 'string', maxLength: 45 }, forhand: { type: 'string', maxLength: 130 }, torr: TORR },
        required: ['butik', 'id'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    },
    {
      name: 'spoks_kontakter',
      title: 'Sök kontakter',
      description: 'Kontakter i arbetsytan: på exakt e-postadress, eller med ett Spoks-filter. Max 100 per sida. Kundadresser är personuppgifter: maskera dem innan något postas i Discord eller Notion.',
      inputSchema: {
        type: 'object',
        properties: { butik: BUTIK, epost: { type: 'string' }, filter: FILTER, antal: { type: 'integer', minimum: 1, maximum: 100 }, offset: { type: 'integer', minimum: 0 } },
        required: ['butik'],
        additionalProperties: false,
      },
      annotations: las,
    },
    {
      name: 'spoks_produkter',
      title: 'Sök produkter',
      description: 'Produkterna Spoks har synkat från Shopify: fritext (Spoks egen sökning) och/eller filter. Ger Spoks produkt-id, som connectorns produktkort vill ha.',
      inputSchema: {
        type: 'object',
        properties: { butik: BUTIK, sok: { type: 'string' }, filter: FILTER, antal: { type: 'integer', minimum: 1, maximum: 100 }, offset: { type: 'integer', minimum: 0 } },
        required: ['butik'],
        additionalProperties: false,
      },
      annotations: las,
    },
    {
      name: 'spoks_taggar',
      title: 'Kontakttaggar',
      description: 'Taggarna som används på kontakterna i arbetsytan.',
      inputSchema: { type: 'object', properties: { butik: BUTIK }, required: ['butik'], additionalProperties: false },
      annotations: las,
    },
    {
      name: 'spoks_anrop',
      title: 'Fritt anrop (vitlista)',
      description: 'Vilket anrop som helst ur Spoks spec (https://api.spoks.com/openapi.json) genom vitlistan: GET och sökningar fritt; skrivning bara POST /campaigns (nytt utkast), PATCH /campaigns/{id} på ett utkast (aldrig block/text på ett utkast med produktkort eller kuponger) och avregistrering (false) i /contacts/{id}/notification-settings. Allt annat vägras med orsak.',
      inputSchema: {
        type: 'object',
        properties: {
          butik: BUTIK,
          metod: { type: 'string', enum: ['GET', 'POST', 'PATCH'] },
          sokvag: { type: 'string', description: 'Sökväg på api.spoks.com, t.ex. /campaigns eller /collections.' },
          data: { type: 'object', description: 'JSON-kroppen.' },
          query: { type: 'object', description: 'Frågeparametrar, t.ex. {"$limit": 20}.' },
          torr: TORR,
        },
        required: ['butik', 'metod', 'sokvag'],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    },
  ];
}

/**
 * Servern utan I/O: `hantera(meddelande)` → svar (eller null för notiser).
 * `klient(butik)` ger en klient; i tester en med falsk fetch.
 */
export function skapaServer({ env = process.env, konfig = lasKonfig(), logg = () => {}, klientOpts = {} } = {}) {
  const VERKTYG = verktyg(konfig);
  const klienter = new Map();
  let protokoll = PROTOKOLL[0];

  function klient(butik) {
    if (!klienter.has(butik)) klienter.set(butik, skapaKlient(butik, { env, konfig, logg, ...klientOpts }));
    return klienter.get(butik);
  }

  async function korVerktyg(namn, a = {}) {
    switch (namn) {
      case 'spoks_kolla': {
        const r = await kollaAlla({ env, konfig, logg, ...klientOpts });
        return { text: skrivUt('kolla', r), data: { arbetsytor: r } };
      }
      case 'spoks_kampanjer': {
        const r = await klient(a.butik).kampanjer({ status: a.status ?? null, antal: a.antal ?? 50 });
        return { text: skrivUt('kampanjer', r), data: r };
      }
      case 'spoks_kampanj': {
        const r = sammanfatta(await klient(a.butik).kampanj(a.id));
        return { text: skrivUt('kampanj', r), data: r };
      }
      case 'spoks_publik': {
        const r = await klient(a.butik).sattPublik(a.id, a.segmentIds ?? [], { torr: Boolean(a.torr), tom: Boolean(a.tom) });
        return { text: skrivUt('publik', r), data: r };
      }
      case 'spoks_amnesrad': {
        const r = await klient(a.butik).sattAmnesrad(a.id, { amne: a.amne, forhand: a.forhand }, { torr: Boolean(a.torr) });
        return { text: skrivUt('amnesrad', r), data: r };
      }
      case 'spoks_kontakter': {
        const r = await klient(a.butik).kontakter({ epost: a.epost ?? null, filter: a.filter ?? null, antal: a.antal ?? 20, offset: a.offset ?? 0 });
        return { text: skrivUt('kontakter', r), data: r };
      }
      case 'spoks_produkter': {
        const r = await klient(a.butik).produkter({ sok: a.sok ?? null, filter: a.filter ?? null, antal: a.antal ?? 20, offset: a.offset ?? 0 });
        return { text: skrivUt('produkter', r), data: r };
      }
      case 'spoks_taggar': {
        const r = await klient(a.butik).taggar();
        return { text: skrivUt('taggar', r), data: r };
      }
      case 'spoks_anrop': {
        const r = await klient(a.butik).fritt(a.metod, a.sokvag, { data: a.data, query: a.query, torr: Boolean(a.torr) });
        return { text: skrivUt('anrop', r), data: r };
      }
      default:
        throw new Error(`Okänt verktyg: ${namn}`);
    }
  }

  const svar = (id, result) => ({ jsonrpc: '2.0', id, result });
  const fel = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

  async function hantera(m) {
    if (!m || typeof m !== 'object' || m.jsonrpc !== '2.0') return fel(m?.id ?? null, -32600, 'Inte ett JSON-RPC 2.0-meddelande');
    const { id, method, params = {} } = m;
    const arNotis = id === undefined;
    try {
      switch (method) {
        case 'initialize': {
          const onskad = String(params.protocolVersion ?? '');
          protokoll = PROTOKOLL.includes(onskad) ? onskad : PROTOKOLL[0];
          logg(`MCP: klient ${params.clientInfo?.name ?? '?'} ${params.clientInfo?.version ?? ''}, protokoll ${protokoll}`);
          return svar(id, { protocolVersion: protokoll, capabilities: { tools: { listChanged: false } }, serverInfo: SERVER_INFO, instructions: INSTRUKTIONER });
        }
        case 'ping':
          return svar(id, {});
        case 'tools/list':
          return svar(id, { tools: VERKTYG });
        case 'tools/call': {
          const namn = params.name;
          if (!VERKTYG.some((v) => v.name === namn)) return fel(id, -32602, `Okänt verktyg: ${namn}`);
          try {
            const { text, data } = await korVerktyg(namn, params.arguments ?? {});
            return svar(id, { content: [{ type: 'text', text }], structuredContent: data, isError: false });
          } catch (e) {
            logg(`MCP: ${namn} misslyckades — ${e.message}`);
            return svar(id, { content: [{ type: 'text', text: `✗ ${e.message}` }], isError: true });
          }
        }
        default:
          if (arNotis) return null;
          return fel(id, -32601, `Metoden finns inte: ${method}`);
      }
    } catch (e) {
      if (arNotis) return null;
      return fel(id, -32603, e.message);
    }
  }

  return { hantera, verktyg: VERKTYG, get protokoll() { return protokoll; } };
}

/** Kör servern över stdin/stdout tills stdin stängs. */
export async function startaStdio(server, { in_ = process.stdin, ut = process.stdout, logg = () => {} } = {}) {
  const rl = createInterface({ input: in_, crlfDelay: Infinity });
  const skriv = (obj) => { if (obj) ut.write(JSON.stringify(obj) + '\n'); };
  const pagaende = new Set();
  for await (const rad of rl) {
    const s = rad.trim();
    if (!s) continue;
    let m;
    try { m = JSON.parse(s); } catch { skriv({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Raden var inte JSON' } }); continue; }
    const p = Promise.all((Array.isArray(m) ? m : [m]).map((x) => server.hantera(x))).then((svar) => { for (const x of svar) skriv(x); });
    pagaende.add(p);
    p.finally(() => pagaende.delete(p));
  }
  await Promise.allSettled([...pagaende]);
  logg('MCP: stdin stängd');
}

if (process.argv[1] && process.argv[1].endsWith('api-mcp.mjs')) {
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
    process.exit(r.status ?? 1);
  }
  const logg = (s) => process.stderr.write(`· ${s}\n`);
  const konfig = lasKonfig();
  const medNyckel = allaArbetsytor(konfig).filter((y) => String(process.env[y.nyckel] ?? '').trim()).map((y) => y.id);
  logg(`${SERVER_INFO.name} ${SERVER_INFO.version}: ${verktyg(konfig).length} verktyg, nycklar: ${medNyckel.join(', ') || 'INGA (SPOKS_API_KEY_<BUTIK> saknas)'}`);
  startaStdio(skapaServer({ logg, konfig }), { logg }).catch((e) => { logg(`✗ ${e.message}`); process.exit(1); });
}
