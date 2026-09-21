// mail-mcp.mjs — en egen MCP-connector för supportbrevlådan på Loopia.
//
// Claude Code startar den här filen som en stdio-MCP-server (`.mcp.json` i
// repo-roten) och får verktygen mail_brands, mail_folders, mail_list,
// mail_read, mail_search (läsning) samt mail_reply, mail_draft, mail_flag och
// mail_move (skrivning, sedan 2026-09-21) — samma saker som CLI:n
// (kundtjanst/mail.mjs) gör, genom samma bibliotek (kundtjanst/brevlada.mjs).
// Noll beroenden: MCP:s stdio-transport är JSON-RPC 2.0, ett meddelande per
// rad, och det räcker med readline + JSON.parse.
//
// Varför en egen connector: claude.ai har ingen Loopia-connector, IMAP går
// inte genom containerns proxy (bara HTTPS, mätt 2026-09-12), och Axel vill
// inte vidarebefordra mejlen till Gmail. Webbmejlen på port 443 är den enda
// vägen — och den här servern gör den till verktyg i stället för en
// Bash-rad man måste komma ihåg.
//
// Skrivningen gör fyra saker och inget annat: svara i tråden, spara utkast,
// flagga, flytta (skapar mappen bara med skapa: true). Ingen radering, ingen
// läst-markering. mail_reply är det enda som inte går att ångra — det är
// markerat destructiveHint så klienten kan fråga. Regeln för autosvaret
// (kundtjanst/autosvar.mjs) är att ALDRIG anropa mail_reply mot en kund förrän
// tjugo utkast i rad varit rätt (Axels beslut 2026-09-21, steg 5).
//
// Regler för stdio-servrar som är lätta att bryta:
//   • stdout är BARA JSON-RPC. All logg går till stderr (Claude Code visar den
//     i /mcp-vyn). En console.log i fel fil dödar hela anslutningen.
//   • Ett svar per request-id; notiser (utan id) besvaras aldrig.
//   • Ett verktygsfel returneras som resultat med isError: true, inte som
//     JSON-RPC-fel — annars ser modellen inte texten.

import { createInterface } from 'node:readline';
import { oppnaBrevlada, valjBrevlada } from './brevlada.mjs';
import { upptackBrands, korkonfig } from './brands.mjs';
import { skrivUt } from './mail.mjs';

export const PROTOKOLL = ['2025-06-18', '2025-03-26', '2024-11-05'];
export const SERVER_INFO = { name: 'loopia-mail', title: 'Loopia brevlåda (läsa, svara, flagga, flytta)', version: '1.1.0' };

const BRAND_ARG = { type: 'string', description: 'Brand-id (t.ex. "baverbutiken"). Utelämna när bara en brevlåda är konfigurerad — se mail_brands.' };
const MAPP_ARG = { type: 'string', description: 'Mapp, standard INBOX. Namnen ges av mail_folders (Sent, Drafts, Spam, Trash …).' };

/** Verktygen exakt som de annonseras i tools/list. */
export const VERKTYG = [
  {
    name: 'mail_brands',
    title: 'Vilka brevlådor finns',
    description: 'Listar butikerna (brands) och om deras supportbrevlåda går att läsa i den här miljön. Inga hemligheter returneras — bara vilka nycklar som saknas.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  {
    name: 'mail_folders',
    title: 'Mapparna i brevlådan',
    description: 'Mappnamnen i brevlådan (INBOX, Sent, Drafts, Spam, Trash …). Loopia lägger skickat i "Sent"; äldre klienter i "INBOX.Sent".',
    inputSchema: { type: 'object', properties: { brand: BRAND_ARG }, additionalProperties: false },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'mail_list',
    title: 'Lista mejl (nyast först)',
    description: 'En sida ur en mapp, nyast först: uid, avsändare, ämne, datum, läst/oläst. Hämtar inte mejltexten — använd mail_read med uid:t för det. Roundcube ger ~50 rader per sida; sida 2 är de nästa 50.',
    inputSchema: {
      type: 'object',
      properties: {
        brand: BRAND_ARG,
        mapp: MAPP_ARG,
        sida: { type: 'integer', minimum: 1, description: 'Sida, standard 1 (nyast).' },
        antal: { type: 'integer', minimum: 1, maximum: 50, description: 'Max rader att returnera ur sidan, standard 20.' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'mail_read',
    title: 'Läs ett mejl',
    description: 'Hela mejlet för ett uid: från, till, datum, ämne, texten (citerad tidigare tråd bortklippt i `text`, allt i `helText`). Markerar INTE mejlet som läst. `ra` ger även råkällan med alla rubriker (Received, DKIM …).',
    inputSchema: {
      type: 'object',
      properties: {
        brand: BRAND_ARG,
        uid: { type: 'integer', minimum: 1, description: 'Mejlets uid ur mail_list eller mail_search.' },
        mapp: MAPP_ARG,
        ra: { type: 'boolean', description: 'true = returnera även råkällan (RFC 5322).' },
        maxTecken: { type: 'integer', minimum: 200, description: 'Klipp texten vid så många tecken (standard: oklippt).' },
      },
      required: ['uid'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'mail_search',
    title: 'Sök i brevlådan',
    description: 'Söker nyast först i ämne + avsändare (billigt) och, med `kropp: true`, även i mejltexten (hämtar varje mejl — dyrt, håll `sidor` lågt). Flera ord: alla måste finnas. Bra för "order 1042", en kundadress eller ett ord som "chargeback".',
    inputSchema: {
      type: 'object',
      properties: {
        brand: BRAND_ARG,
        fraga: { type: 'string', minLength: 1, description: 'Ett eller flera ord.' },
        mapp: MAPP_ARG,
        sidor: { type: 'integer', minimum: 1, maximum: 20, description: 'Hur många sidor (à ~50 mejl) bakåt, standard 4.' },
        kropp: { type: 'boolean', description: 'true = sök även i mejltexten.' },
        max: { type: 'integer', minimum: 1, maximum: 200, description: 'Max träffar, standard 50.' },
      },
      required: ['fraga'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'mail_reply',
    title: 'Svara i tråden (skickar!)',
    description: 'Svarar på mejlet med uid:t, i samma tråd (Roundcube sätter In-Reply-To/References själv). `text` är vårt svar; kundens mejl citeras under det. SKICKAR PÅ RIKTIGT och går inte att ångra — använd mail_draft för att se resultatet i Drafts först, eller `visa: true` här för att bara se mottagare, ämne och citat utan att skicka. Signatur ingår inte: skriv den i texten.',
    inputSchema: {
      type: 'object',
      properties: {
        brand: BRAND_ARG,
        uid: { type: 'integer', minimum: 1, description: 'Mejlet som besvaras (uid ur mail_list/mail_search).' },
        mapp: MAPP_ARG,
        text: { type: 'string', minLength: 1, description: 'Hela svaret, ren text (inte HTML). Kundens mejl citeras automatiskt efter en tom rad.' },
        amne: { type: 'string', description: 'Eget ämne. Utelämnat = Roundcubes "Re: …".' },
        utanCitat: { type: 'boolean', description: 'true = citera inte kundens mejl.' },
        visa: { type: 'boolean', description: 'true = skicka INTE, returnera bara vad svaret skulle bli (till, ämne, citat).' },
      },
      required: ['uid', 'text'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'mail_draft',
    title: 'Spara svar som utkast',
    description: 'Samma som mail_reply men sparar i mappen Drafts i stället för att skicka. Det är torrkörningen: VA:n eller Axel läser utkastet i webbmejlen och skickar själv. Returnerar utkastets uid i Drafts.',
    inputSchema: {
      type: 'object',
      properties: {
        brand: BRAND_ARG,
        uid: { type: 'integer', minimum: 1, description: 'Mejlet som besvaras.' },
        mapp: MAPP_ARG,
        text: { type: 'string', minLength: 1, description: 'Hela svaret, ren text.' },
        amne: { type: 'string', description: 'Eget ämne. Utelämnat = "Re: …".' },
        utanCitat: { type: 'boolean', description: 'true = citera inte kundens mejl.' },
      },
      required: ['uid', 'text'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
  {
    name: 'mail_flag',
    title: 'Flagga ett mejl',
    description: 'Sätter flaggan (\\Flagged — stjärnan i webbmejlen) på mejlet så VA:n ser det. `av: true` tar bort flaggan. Rör aldrig läst/oläst.',
    inputSchema: {
      type: 'object',
      properties: {
        brand: BRAND_ARG,
        uid: { type: 'integer', minimum: 1, description: 'Mejlet.' },
        mapp: MAPP_ARG,
        av: { type: 'boolean', description: 'true = ta bort flaggan.' },
      },
      required: ['uid'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
  },
  {
    name: 'mail_move',
    title: 'Flytta ett mejl till en mapp',
    description: 'Flyttar mejlet till mappen `till` (t.ex. "VA-PRIO"). Saknas mappen är det ett fel med mappnamnen i texten — skicka `skapa: true` för att skapa den. Mejlet får ett nytt uid i målmappen.',
    inputSchema: {
      type: 'object',
      properties: {
        brand: BRAND_ARG,
        uid: { type: 'integer', minimum: 1, description: 'Mejlet.' },
        mapp: MAPP_ARG,
        till: { type: 'string', minLength: 1, description: 'Målmappen, exakt som mail_folders skriver den.' },
        skapa: { type: 'boolean', description: 'true = skapa målmappen om den saknas.' },
      },
      required: ['uid', 'till'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
  },
];

/** Brands utan hemligheter — det mail_brands svarar. */
export function brandOversikt(env = process.env) {
  return upptackBrands().filter((b) => b.aktiv !== false).map((b) => {
    const k = korkonfig(b, env);
    return { id: k.id, brand: k.brand, user: k.mail.user || null, webmail: k.mail.webmail, lasbar: k.mail.konfigurerad, saknas: k.mail.saknas };
  });
}

/**
 * Servern som ett objekt utan I/O: `hantera(meddelande)` → svar (eller null
 * för notiser). Testbar utan stdio. `oppna(brandId)` ger en Brevlada — i
 * tester en med falsk fetch.
 */
export function skapaServer({ oppna = (id) => oppnaBrevlada(id, { logg }), logg = () => {}, env = process.env } = {}) {
  const brevlador = new Map();
  let protokoll = PROTOKOLL[0];

  function brevlada(brandId) {
    // Nyckeln är det VALDA brandets id, så "utelämnat" och "baverbutiken"
    // delar session när de är samma brevlåda.
    const konfig = valjBrevlada(brandId, { env });
    if (!brevlador.has(konfig.id)) brevlador.set(konfig.id, oppna(konfig.id));
    return brevlador.get(konfig.id);
  }

  async function korVerktyg(namn, arg = {}) {
    switch (namn) {
      case 'mail_brands': {
        const r = brandOversikt(env);
        return { text: r.map((b) => `${b.lasbar ? '✅' : '❌'} ${b.id} (${b.brand}) — ${b.user ?? 'ingen adress'}${b.lasbar ? '' : ` · saknar ${b.saknas.join(', ')}`}`).join('\n'), data: { brands: r } };
      }
      case 'mail_folders': {
        const b = brevlada(arg.brand);
        const r = { brand: b.id, mappar: await b.mappar() };
        return { text: skrivUt('mappar', r), data: r };
      }
      case 'mail_list': {
        const b = brevlada(arg.brand);
        const r = await b.lista({ mapp: arg.mapp, sida: arg.sida ?? 1, antal: arg.antal ?? 20 });
        return { text: skrivUt('lista', r), data: r };
      }
      case 'mail_read': {
        const b = brevlada(arg.brand);
        const r = await b.las(arg.uid, { mapp: arg.mapp, ra: Boolean(arg.ra), maxTecken: arg.maxTecken ?? 0 });
        return { text: skrivUt('las', r), data: r };
      }
      case 'mail_search': {
        const b = brevlada(arg.brand);
        const r = await b.sok(arg.fraga, { mapp: arg.mapp, maxSidor: arg.sidor ?? 4, kropp: Boolean(arg.kropp), max: arg.max ?? 50 });
        return { text: skrivUt('sok', r), data: r };
      }
      case 'mail_reply': {
        const b = brevlada(arg.brand);
        if (arg.visa) {
          const r = await b.forhandsgranskaSvar(arg.uid, { mapp: arg.mapp });
          return { text: skrivUt('visa', r), data: r };
        }
        const r = await b.svara(arg.uid, { mapp: arg.mapp, text: arg.text, amne: arg.amne ?? null, utkast: false, medCitat: !arg.utanCitat });
        return { text: skrivUt('svara', r), data: r };
      }
      case 'mail_draft': {
        const b = brevlada(arg.brand);
        const r = await b.utkast(arg.uid, { mapp: arg.mapp, text: arg.text, amne: arg.amne ?? null, medCitat: !arg.utanCitat });
        return { text: skrivUt('svara', r), data: r };
      }
      case 'mail_flag': {
        const b = brevlada(arg.brand);
        const r = await b.flagga(arg.uid, { mapp: arg.mapp, av: Boolean(arg.av) });
        return { text: skrivUt('flagga', r), data: r };
      }
      case 'mail_move': {
        const b = brevlada(arg.brand);
        const r = await b.flytta(arg.uid, { mapp: arg.mapp, till: arg.till, skapa: Boolean(arg.skapa) });
        return { text: skrivUt('flytta', r), data: r };
      }
      default:
        throw Object.assign(new Error(`Okänt verktyg: ${namn}`), { jsonrpc: -32602 });
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
          return svar(id, {
            protocolVersion: protokoll,
            capabilities: { tools: { listChanged: false } },
            serverInfo: SERVER_INFO,
            instructions: 'Supportbrevlådan över Loopias webbmejl. Börja med mail_list (nyast först) eller mail_search, läs sedan enskilda mejl med mail_read och uid:t. Skrivning: mail_draft sparar ett svar i Drafts (torrkörning), mail_reply SKICKAR i tråden och går inte att ångra — kör mail_draft först, eller mail_reply med visa: true. mail_flag flaggar, mail_move flyttar (skapa: true skapar mappen). Kundadresser i svaren är personuppgifter — maskera dem (ka***@gmail.com) innan något postas i Discord eller Notion.',
          });
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
          if (arNotis) return null;                       // notifications/initialized, notifications/cancelled …
          return fel(id, -32601, `Metoden finns inte: ${method}`);
      }
    } catch (e) {
      if (arNotis) return null;
      return fel(id, -32603, e.message);
    }
  }

  async function stang() {
    for (const b of brevlador.values()) { try { await b.loggaUt(); } catch { /* sessionen dör ändå */ } }
    brevlador.clear();
  }

  return { hantera, stang, verktyg: VERKTYG, get protokoll() { return protokoll; } };
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
    // Anropen körs parallellt: ett långsamt mail_search får inte blockera ett ping.
    const p = Promise.all((Array.isArray(m) ? m : [m]).map((x) => server.hantera(x))).then((svar) => { for (const x of svar) skriv(x); });
    pagaende.add(p);
    p.finally(() => pagaende.delete(p));
  }
  await Promise.allSettled([...pagaende]);
  await server.stang();
  logg('MCP: stdin stängd, loggade ut');
}

if (process.argv[1] && process.argv[1].endsWith('mail-mcp.mjs')) {
  // Proxyn: Nodes fetch läser inte HTTPS_PROXY själv i alla versioner. .mcp.json
  // sätter NODE_USE_ENV_PROXY=1; startas servern på annat sätt startas den om
  // här under flaggan, med stdio ärvt så JSON-RPC-rören går rakt igenom.
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
    process.exit(r.status ?? 1);
  }
  const logg = (s) => process.stderr.write(`· ${s}\n`);
  const server = skapaServer({ logg, oppna: (id) => oppnaBrevlada(id, { logg }) });
  logg(`${SERVER_INFO.name} ${SERVER_INFO.version}: ${VERKTYG.length} verktyg, brevlådor: ${brandOversikt().filter((b) => b.lasbar).map((b) => b.id).join(', ') || 'INGEN (nycklar saknas)'}`);
  startaStdio(server, { logg }).catch((e) => { logg(`✗ ${e.message}`); process.exit(1); });
}
