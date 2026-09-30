// api.mjs — Spoks officiella API (Public API, version 2026-07): bibliotek + CLI.
//
// Axels beställning 2026-09-30: "Kan du bygga en cli ... så du kan interagera med
// allt ... och göra allt själv". Spoks-connectorn (MCP:n på claude.ai) skriver
// utkast, segment och avstängda flöden, men väljer aldrig publik. Det officiella
// API:t gör det (recipients.segmentIds på ett utkast), och det går med en nyckel
// i miljön, så även rutiner utan connectors når Spoks.
//
// Vad API:t INTE kan (specen https://api.spoks.com/openapi.json, läst
// 2026-09-30, 17 anrop): schemalägga, publicera, skicka, slå på flöden eller
// sändsteg, läsa segment eller flöden. Specens egen mening: "Campaigns are
// always created as drafts. Publishing and scheduling happen in the app." Det
// klicket är Axels eller Coworks. Spoks villkor (spoks.com/legal/terms, läst
// samma dag) förbjuder att "reverse-engineer the Services", så appens interna
// anrop används aldrig.
//
//   node klaviyo/spoks/api.mjs kolla
//   node klaviyo/spoks/api.mjs kampanjer --butik carashell [--status draft] [--antal 50]
//   node klaviyo/spoks/api.mjs kampanj <id> --butik baverbutiken
//   node klaviyo/spoks/api.mjs publik <id> --butik baverbutiken --segment <segment-id>[,<id>] [--ja]
//   node klaviyo/spoks/api.mjs amnesrad <id> --butik baverbutiken [--amne "…"] [--forhand "…"] [--ja]
//   node klaviyo/spoks/api.mjs kontakter --butik matstrumpor [--epost <adress>] [--antal 20]
//   node klaviyo/spoks/api.mjs produkter --butik carashell [--sok "<text>"] [--antal 20]
//   node klaviyo/spoks/api.mjs taggar --butik carashell
//   node klaviyo/spoks/api.mjs anrop <GET|POST|PATCH> <sökväg> --butik <id> [--data '<json>'] [--ja]
//
// Utan --ja skriver CLI:n ingenting: den visar före och efter. MCP-servern
// (api-mcp.mjs) skriver direkt, för där är verktygsanropet själva beslutet, men
// den har samma spärrar eftersom de sitter här.
//
// Spärrar i koden, alla testade i klaviyo/test/spoks-api.test.mjs:
//   • Nyckeln måste höra till RÄTT arbetsyta. GET /authorization jämförs med
//     api-konfig.json före första anropet. Fel nyckel = en annan butiks kunder.
//   • Skrivning bara mot en vitlista (vaktaAnrop): nytt utkast, ändra ett UTKAST,
//     avregistrera en kontakt. Aldrig skapa kontakter, aldrig ge samtycke
//     (MFL 19 §), aldrig sätta taggar (de kan starta flöden, alltså skicka),
//     aldrig skriva över produkter eller kollektioner (de synkas från Shopify).
//   • Ett utkast med block som API:t inte kan uttrycka (produktkort, kuponger …)
//     får aldrig nya block eller ny text. Det skulle radera dem (specen:
//     "sending blocks replaces it").
//   • If-Match med kampanjens hash: har någon sparat i appen efter läsningen blir
//     det 412 och inget skrivs. Varje ändring läses tillbaka.
//   • Takt: högst en förfrågan per 1,1 s (Spoks: 60 per minut, skurar över ~20
//     klipps). 429 väntar ut Retry-After. En skrivning görs aldrig om efter ett
//     5xx eller nätfel. Spoks egna råd är att först kolla om den gick igenom.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const KONFIG_FIL = join(ROT, 'api-konfig.json');
export const STATUSAR = ['draft', 'scheduled', 'published', 'failed'];
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const KAMPANJ_ID = /^[A-Za-z0-9_-]{1,64}$/;
export const AMNE_MAX = 45;        // specen: "Email subject line. Max 45 characters."
export const FORHAND_MAX = 130;    // specen: "Email preview text … Max 130 characters."
// Var nyckeln görs, ur appens egen kod och översättningsfil (lästa 2026-09-30).
// Appen har en nyckel per arbetsyta och ingen rättighetsväljare. Knappen syns
// bara när nyckeln saknas, och på Free-plan öppnar den "Uppgradera butiken".
export const VAR_NYCKELN = 'Nyckeln görs i Spoks-appen: Inställningar → Integrationer → rutan API-nyckel → GENERERA NYCKEL, och kräver betald plan. Den läggs sedan som miljövariabel (klaviyo/spoks/README.md → Spoks officiella API).';

export class SpoksFel extends Error {
  constructor(meddelande, { kod = 'SPOKS', status = null, traceId = null } = {}) {
    super(meddelande);
    this.name = 'SpoksFel';
    this.kod = kod;
    this.status = status;
    this.traceId = traceId;
  }
}

export function lasKonfig(fil = KONFIG_FIL) {
  return JSON.parse(readFileSync(fil, 'utf8'));
}

export function allaArbetsytor(konfig = lasKonfig()) {
  return Object.entries(konfig.arbetsytor ?? {}).map(([id, v]) => ({ id, ...v }));
}

export function arbetsyta(id, konfig = lasKonfig()) {
  const alla = allaArbetsytor(konfig);
  const y = alla.find((x) => x.id === id);
  if (!y) throw new SpoksFel(`Okänd butik "${id ?? ''}". Finns: ${alla.map((x) => x.id).join(', ')} (klaviyo/spoks/api-konfig.json).`, { kod: 'OKAND_BUTIK' });
  return y;
}

// ── Spärrarna (rena funktioner) ────────────────────────────────────────────

/** Segment-id:n: unika och alla UUID. En tom lista kräver tom: true (då får kampanjen ingen mottagare). */
export function vaktaSegment(segmentIds, { tom = false } = {}) {
  const lista = (Array.isArray(segmentIds) ? segmentIds : String(segmentIds ?? '').split(','))
    .map((s) => String(s).trim())
    .filter(Boolean);
  const unika = [...new Set(lista)];
  if (!unika.length && !tom) throw new SpoksFel('Inget segment angivet. En tom publik kräver tom: true (--tom), och då får kampanjen ingen mottagare.', { kod: 'SEGMENT' });
  const fel = unika.filter((s) => !UUID.test(s));
  if (fel.length) {
    throw new SpoksFel(`Inte ett segment-id: ${fel.join(', ')}. Namnet räcker inte. Id:t står i Spoks-connectorns get_segments eller i repots id-filer (t.ex. klaviyo/spoks/carashell/spoks-id.json).`, { kod: 'SEGMENT' });
  }
  return unika;
}

/** Ämnesrad (max 45 tecken) och förhandstext (max 130), en rad var. */
export function vaktaAmnesrad({ amne, forhand } = {}) {
  const ut = {};
  const kolla = (varde, falt, namn, max) => {
    if (varde === undefined || varde === null) return;
    const s = String(varde);
    if (!s.trim()) throw new SpoksFel(`${namn} är tom.`, { kod: 'AMNE' });
    if (/[\r\n]/.test(s)) throw new SpoksFel(`${namn} får inte ha radbrytningar.`, { kod: 'AMNE' });
    const langd = [...s].length;
    if (langd > max) throw new SpoksFel(`${namn} är ${langd} tecken. Spoks tar max ${max}.`, { kod: 'AMNE' });
    ut[falt] = s;
  };
  kolla(amne, 'emailTitle', 'Ämnesraden', AMNE_MAX);
  kolla(forhand, 'emailDescription', 'Förhandstexten', FORHAND_MAX);
  if (!Object.keys(ut).length) throw new SpoksFel('Ange ämnesrad och/eller förhandstext.', { kod: 'AMNE' });
  return ut;
}

/** En sökväg på api.spoks.com, aldrig en annan värd. */
export function renSokvag(sokvag) {
  const s = String(sokvag ?? '');
  return /^\/[A-Za-z0-9._~%\/-]*$/.test(s) && !s.startsWith('//') && !s.includes('..');
}

const LASNINGAR_POST = new Set(['/contacts-search', '/products-search']);

/**
 * Vitlistan. { ok, skriv, skal }. `nuvarande` = kampanjen som den ser ut nu
 * (krävs för PATCH /campaigns/{id}).
 */
export function vaktaAnrop({ metod, sokvag, data = undefined, nuvarande = null } = {}) {
  const M = String(metod ?? '').toUpperCase();
  if (!renSokvag(sokvag)) return { ok: false, skriv: false, skal: 'sökvägen måste vara en ren sökväg på api.spoks.com, t.ex. /campaigns' };
  if (M === 'GET') return { ok: true, skriv: false };
  if (M === 'POST' && LASNINGAR_POST.has(sokvag)) return { ok: true, skriv: false };
  if (M === 'POST' && sokvag === '/campaigns') return { ok: true, skriv: true };
  if (M === 'PATCH' && /^\/campaigns\/[A-Za-z0-9_-]+$/.test(sokvag)) {
    if (!nuvarande) return { ok: false, skriv: true, skal: 'kampanjen måste läsas innan den ändras' };
    if (nuvarande.status !== 'draft') return { ok: false, skriv: true, skal: `kampanjen är ${nuvarande.status}, inte ett utkast. En schemalagd eller skickad kampanj ändras bara i appen.` };
    const nyttInnehall = data && (data.blocks !== undefined || data.text !== undefined);
    const okanda = (nuvarande.blocks ?? []).filter((b) => b?.type === 'unsupported');
    if (nyttInnehall && okanda.length) {
      const typer = [...new Set(okanda.map((b) => b.originalType ?? '?'))].join(', ');
      return { ok: false, skriv: true, skal: `utkastet har ${okanda.length} block som API:t inte kan uttrycka (${typer}). Nya block eller ny text skulle radera dem. Ändra innehållet med Spoks-connectorn (update_draft_campaign_blocks) i stället.` };
    }
    return { ok: true, skriv: true };
  }
  if (M === 'PATCH' && /^\/contacts\/[A-Za-z0-9_-]+\/notification-settings$/.test(sokvag)) {
    const varden = Object.values(data ?? {});
    if (!varden.length || varden.some((v) => v !== false)) {
      return { ok: false, skriv: true, skal: 'bara avregistrering (false) är tillåten. Samtycke ger kunden själv (MFL 19 §), aldrig ett API-anrop.' };
    }
    return { ok: true, skriv: true };
  }
  if (M === 'PATCH' && /^\/contacts\/[A-Za-z0-9_-]+\/tags$/.test(sokvag)) {
    return { ok: false, skriv: true, skal: 'taggar sätts inte härifrån. En tagg kan starta ett flöde (contact_tags_added) och därmed skicka mejl.' };
  }
  if (M === 'POST' && sokvag === '/contacts') {
    return { ok: false, skriv: true, skal: 'kontakter skapas aldrig via API:t. De kommer från Shopify-synken och kunden själv, och en kontakt som följer via e-post vore samtycke som kunden inte gett.' };
  }
  if (M === 'POST' && (sokvag === '/products' || sokvag === '/collections')) {
    return { ok: false, skriv: true, skal: 'produkterna och kollektionerna synkas från Shopify och skrivs aldrig över härifrån.' };
  }
  return { ok: false, skriv: M !== 'GET', skal: `${M} ${sokvag} står inte på listan över tillåtna anrop.` };
}

export function felText({ status, json = null, metod, sokvag, text = '' }) {
  const vad = {
    400: 'Spoks underkände anropet (fälten eller X-Api-Version).',
    403: 'Nyckeln saknas, är fel eller saknar rättigheten för just det här anropet (Spoks svarar 403 på alla tre).',
    404: 'Finns inte. Fel id eller fel sökväg.',
    409: 'Kampanjen är inte ett utkast längre. En schemalagd eller skickad kampanj ändras bara i appen.',
    412: 'Någon sparade kampanjen efter att den lästes (If-Match). Inget ändrat. Läs om och försök igen.',
    413: 'Kroppen är för stor (Spoks tar max 2 MB).',
    429: 'För många anrop (Spoks: 60 per minut och nyckel). Vänta en minut.',
  }[status] ?? (status >= 500 ? 'Fel hos Spoks.' : `Oväntat svar ${status}.`);
  const spoks = json?.message ? ` Spoks: "${String(json.message).slice(0, 300)}"` : (text && !json ? ` (${String(text).replace(/\s+/g, ' ').slice(0, 120)})` : '');
  const trace = json?.traceId ? ` traceId ${json.traceId}` : '';
  return `${metod} ${sokvag} → ${status}: ${vad}${spoks}${trace}`;
}

// ── Sammanfattningar ───────────────────────────────────────────────────────

const svTid = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export function kampanjKort(k = {}) {
  return {
    id: k.id ?? null,
    titel: k.title ?? null,
    status: k.status ?? null,
    publiceras: k.publishDate ?? null,
    publicerasSv: svTid(k.publishDate),
    kanal: k.deliveryChannel ?? null,
    skapad: k.created ?? null,
    andrad: k.updated ?? null,
  };
}

export function sammanfatta(d = {}) {
  const block = Array.isArray(d.blocks) ? d.blocks : [];
  const okanda = block.filter((b) => b?.type === 'unsupported').map((b) => b.originalType ?? '?');
  return {
    ...kampanjKort(d),
    amne: d.notification?.emailTitle ?? null,
    forhand: d.notification?.emailDescription ?? null,
    segment: [...(d.recipients?.segmentIds ?? [])],
    antalBlock: block.length,
    blockSomApiInteKan: okanda,
    redigera: d.editorUrl ?? null,
    hash: d.hash ?? null,
  };
}

const sorterade = (a) => [...(a ?? [])].map(String).sort();
const lika = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// ── Klienten ───────────────────────────────────────────────────────────────

export function skapaKlient(butikId, {
  env = process.env,
  fetchFn = globalThis.fetch,
  konfig = lasKonfig(),
  vanta = (ms) => new Promise((r) => setTimeout(r, ms)),
  nu = () => Date.now(),
  logg = () => {},
} = {}) {
  const yta = arbetsyta(butikId, konfig);
  const nyckel = String(env[yta.nyckel] ?? '').trim();
  if (!nyckel) {
    throw new SpoksFel(`${yta.namn}: ${yta.nyckel} saknas i miljön. ${VAR_NYCKELN}${yta.anteckning ? ` ${yta.anteckning}` : ''}`, { kod: 'NYCKEL_SAKNAS' });
  }
  const bas = new URL(konfig.bas ?? 'https://api.spoks.com');
  const version = konfig.version ?? '2026-07';
  const takt = Number(konfig.takt_ms ?? 1100);
  let senast = -Infinity;
  let verifierad = null;

  async function anrop(metod, sokvag, { data = undefined, query = undefined, ifMatch = null } = {}) {
    const M = String(metod).toUpperCase();
    if (!renSokvag(sokvag)) throw new SpoksFel(`Ogiltig sökväg "${sokvag}". Bara sökvägar på ${bas.host}, t.ex. /campaigns.`, { kod: 'SOKVAG' });
    const url = new URL(sokvag, bas);
    if (url.origin !== bas.origin) throw new SpoksFel(`Sökvägen lämnar ${bas.host}.`, { kod: 'SOKVAG' });
    for (const [k, v] of Object.entries(query ?? {})) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
    const lasning = M === 'GET' || (M === 'POST' && LASNINGAR_POST.has(url.pathname));
    const headers = { 'x-api-key': nyckel, 'X-Api-Version': version, Accept: 'application/json' };
    if (data !== undefined) headers['Content-Type'] = 'application/json';
    if (ifMatch) headers['If-Match'] = ifMatch;

    for (let forsok = 1; ; forsok++) {
      const vantan = senast + takt - nu();
      if (vantan > 0) await vanta(vantan);
      senast = nu();
      let svar;
      try {
        svar = await fetchFn(url.toString(), { method: M, headers, body: data === undefined ? undefined : JSON.stringify(data) });
      } catch (e) {
        if (lasning && forsok < 3) {
          logg(`Spoks: nätfel (${e.message}), försöker igen`);
          await vanta(2000 * forsok);
          continue;
        }
        throw new SpoksFel(`${M} ${url.pathname}: Spoks gick inte att nå (${e.message}).${lasning ? '' : ' Skrivningen görs inte om. Läs först om den gick igenom.'}`, { kod: 'NAT' });
      }
      const text = await svar.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch { json = null; }
      if (svar.status === 429 && forsok < 4) {
        const sek = Math.min(Math.max(Number(svar.headers?.get?.('retry-after')) || 5, 1), 90);
        logg(`Spoks: 429, väntar ${sek} s (Retry-After)`);
        await vanta(sek * 1000);
        continue;
      }
      if (svar.status >= 500 && lasning && forsok < 3) {
        logg(`Spoks: ${svar.status}, försöker igen`);
        await vanta(2000 * forsok);
        continue;
      }
      if (!svar.ok) {
        throw new SpoksFel(felText({ status: svar.status, json, metod: M, sokvag: url.pathname, text }), { kod: `HTTP_${svar.status}`, status: svar.status, traceId: json?.traceId ?? null });
      }
      return { status: svar.status, data: json, etag: svar.headers?.get?.('etag') ?? null };
    }
  }

  /** Nyckelns arbetsyta mot api-konfig.json. Körs före första riktiga anropet. */
  async function verifiera() {
    if (verifierad) return verifierad;
    const { data } = await anrop('GET', '/authorization');
    const faktisk = {
      butik: yta.id,
      arbetsytaId: data?.feed?.id ?? null,
      arbetsytaNamn: data?.feed?.name ?? null,
      organisation: data?.organization?.name ?? null,
      rattigheter: data?.permissions ?? {},
      status: data?.status ?? null,
    };
    if (!yta.arbetsyta_id) {
      throw new SpoksFel(`${yta.namn}: arbetsytans id saknas i api-konfig.json. Nyckeln hör till "${faktisk.arbetsytaNamn}" (${faktisk.arbetsytaId}). Skriv in det id:t om det är rätt butik.`, { kod: 'ID_SAKNAS' });
    }
    if (faktisk.arbetsytaId !== yta.arbetsyta_id) {
      throw new SpoksFel(`FEL ARBETSYTA: ${yta.nyckel} hör till "${faktisk.arbetsytaNamn}" (${faktisk.arbetsytaId}), inte ${yta.namn} (${yta.arbetsyta_id}). Inget anrop gjort. Byt nyckeln i miljön.`, { kod: 'FEL_ARBETSYTA' });
    }
    verifierad = faktisk;
    return faktisk;
  }

  async function kampanjer({ status = null, antal = 50 } = {}) {
    await verifiera();
    if (status && !STATUSAR.includes(status)) throw new SpoksFel(`Status måste vara ${STATUSAR.join(', ')}.`, { kod: 'STATUS' });
    const max = Math.max(1, Math.min(Number(antal) || 50, 500));
    const hamta = async (query) => {
      const rader = [];
      let offset = 0;
      let totalt = null;
      while (rader.length < max) {
        const limit = Math.min(100, max - rader.length);
        const { data } = await anrop('GET', '/campaigns', { query: { ...query, $offset: offset, $limit: limit } });
        const items = Array.isArray(data?.items) ? data.items : [];
        if (typeof data?.meta?.maxResults === 'number') totalt = data.meta.maxResults;
        rader.push(...items);
        offset += items.length;
        if (items.length < limit || (totalt !== null && offset >= totalt)) break;
      }
      return { rader, totalt };
    };
    // Beta-API: prova filter + sortering, backa till mindre om Spoks svarar 400.
    const varianter = [
      { $filter: status ? `status eq '${status}'` : undefined, $orderBy: 'created desc' },
      { $orderBy: 'created desc' },
      {},
    ];
    let r = null;
    let serverfiltrerat = false;
    for (const [i, q] of varianter.entries()) {
      try {
        r = await hamta(q);
        serverfiltrerat = Boolean(q.$filter);
        break;
      } catch (e) {
        if (e.status !== 400 || i === varianter.length - 1) throw e;
        logg(`Spoks tog inte ${Object.keys(q).join(' + ')} (${e.message}). Provar enklare.`);
      }
    }
    let rader = r.rader;
    if (status) rader = rader.filter((k) => k.status === status);
    rader.sort((a, b) => String(b.created ?? '').localeCompare(String(a.created ?? '')));
    const ofullstandig = r.rader.length >= max && (r.totalt === null || r.totalt > max);
    return { butik: yta.id, status, totalt: status && !serverfiltrerat ? null : r.totalt, ofullstandig, kampanjer: rader.map(kampanjKort) };
  }

  async function kampanj(id) {
    await verifiera();
    if (!KAMPANJ_ID.test(String(id ?? ''))) throw new SpoksFel(`Ogiltigt kampanj-id "${id ?? ''}".`, { kod: 'ID' });
    const { data, etag } = await anrop('GET', `/campaigns/${id}`);
    return { ...data, hash: data?.hash ?? etag ?? null };
  }

  async function sattPublik(id, segmentIds, { torr = false, tom = false } = {}) {
    const onskad = sorterade(vaktaSegment(segmentIds, { tom }));
    const fore = await kampanj(id);
    if (fore.status !== 'draft') {
      throw new SpoksFel(`"${fore.title}" är ${fore.status}, inte ett utkast. Publiken ändras bara i appen nu.`, { kod: 'INTE_UTKAST' });
    }
    const nuvarande = sorterade(fore.recipients?.segmentIds);
    if (lika(nuvarande, onskad)) return { butik: yta.id, torr, andrat: false, redanRatt: true, fore: nuvarande, efter: onskad, kampanj: sammanfatta(fore) };
    if (torr) return { butik: yta.id, torr: true, andrat: false, redanRatt: false, fore: nuvarande, efter: onskad, kampanj: sammanfatta(fore) };
    await anrop('PATCH', `/campaigns/${id}`, { data: { recipients: { segmentIds: onskad } }, ifMatch: fore.hash });
    const efter = await kampanj(id);
    const last = sorterade(efter.recipients?.segmentIds);
    if (!lika(last, onskad)) {
      throw new SpoksFel(`Tillbakaläsningen stämmer inte: bad om ${onskad.join(', ')}, Spoks visar ${last.join(', ') || 'ingen publik'}.`, { kod: 'TILLBAKALASNING' });
    }
    return { butik: yta.id, torr: false, andrat: true, redanRatt: false, fore: nuvarande, efter: last, kampanj: sammanfatta(efter) };
  }

  async function sattAmnesrad(id, { amne, forhand } = {}, { torr = false } = {}) {
    const notis = vaktaAmnesrad({ amne, forhand });
    const fore = await kampanj(id);
    if (fore.status !== 'draft') {
      throw new SpoksFel(`"${fore.title}" är ${fore.status}, inte ett utkast. Ämnesraden ändras bara i appen nu.`, { kod: 'INTE_UTKAST' });
    }
    const nu_ = { emailTitle: fore.notification?.emailTitle ?? null, emailDescription: fore.notification?.emailDescription ?? null };
    const samma = Object.entries(notis).every(([k, v]) => nu_[k] === v);
    if (samma || torr) return { butik: yta.id, torr, andrat: false, redanRatt: samma, fore: nu_, efter: { ...nu_, ...notis }, kampanj: sammanfatta(fore) };
    await anrop('PATCH', `/campaigns/${id}`, { data: { notification: notis }, ifMatch: fore.hash });
    const efter = await kampanj(id);
    const last = { emailTitle: efter.notification?.emailTitle ?? null, emailDescription: efter.notification?.emailDescription ?? null };
    const fel = Object.entries(notis).filter(([k, v]) => last[k] !== v);
    if (fel.length) throw new SpoksFel(`Tillbakaläsningen stämmer inte för ${fel.map(([k]) => k).join(', ')}.`, { kod: 'TILLBAKALASNING' });
    return { butik: yta.id, torr: false, andrat: true, redanRatt: false, fore: nu_, efter: last, kampanj: sammanfatta(efter) };
  }

  async function kontakter({ epost = null, filter = null, antal = 20, offset = 0, falt = null } = {}) {
    await verifiera();
    const kropp = { limit: Math.max(1, Math.min(Number(antal) || 20, 100)), offset: Math.max(0, Number(offset) || 0) };
    const adress = epost ? String(epost).trim() : null;
    if (adress) kropp.filter = { type: 'filter', field: 'email', operator: 'ilike', value: adress };
    else if (filter) kropp.filter = filter;
    if (Array.isArray(falt) && falt.length) kropp.fields = falt;
    const { data } = await anrop('POST', '/contacts-search', { data: kropp });
    let rader = Array.isArray(data?.items) ? data.items : [];
    // ilike är "innehåller" — en adress ska bara ge sig själv.
    if (adress) rader = rader.filter((k) => String(k.email ?? '').toLowerCase() === adress.toLowerCase());
    return { butik: yta.id, totalt: adress ? rader.length : (data?.meta?.maxResults ?? null), kontakter: rader };
  }

  async function produkter({ sok = null, filter = null, antal = 20, offset = 0 } = {}) {
    await verifiera();
    const kropp = { limit: Math.max(1, Math.min(Number(antal) || 20, 100)), offset: Math.max(0, Number(offset) || 0) };
    if (sok) kropp.prompt = String(sok);
    if (filter) kropp.filter = filter;
    const { data } = await anrop('POST', '/products-search', { data: kropp });
    return { butik: yta.id, totalt: data?.meta?.maxResults ?? null, produkter: Array.isArray(data?.items) ? data.items : [] };
  }

  async function taggar() {
    await verifiera();
    const { data } = await anrop('GET', '/contacts/contacts-tags');
    const rader = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
    return { butik: yta.id, taggar: rader };
  }

  /** Vilket anrop som helst ur specen, genom vitlistan. Skrivning + torr = visa bara. */
  async function fritt(metod, sokvag, { data = undefined, query = undefined, torr = false } = {}) {
    const M = String(metod ?? '').toUpperCase();
    if (!['GET', 'POST', 'PATCH'].includes(M)) throw new SpoksFel(`Metoden ${M || '(ingen)'} används inte. GET, POST eller PATCH.`, { kod: 'SPARRAT' });
    await verifiera();
    const m = /^\/campaigns\/([A-Za-z0-9_-]+)$/.exec(String(sokvag ?? ''));
    const nuvarande = M === 'PATCH' && m ? await kampanj(m[1]) : null;
    const dom = vaktaAnrop({ metod: M, sokvag, data, nuvarande });
    if (!dom.ok) throw new SpoksFel(`Spärrat: ${dom.skal}`, { kod: 'SPARRAT' });
    if (dom.skriv && torr) return { butik: yta.id, torr: true, metod: M, sokvag, data: data ?? null };
    const r = await anrop(M, sokvag, { data, query, ifMatch: nuvarande?.hash ?? null });
    return { butik: yta.id, torr: false, metod: M, sokvag, status: r.status, data: r.data };
  }

  return { yta, verifiera, anrop, kampanjer, kampanj, sattPublik, sattAmnesrad, kontakter, produkter, taggar, fritt };
}

/** Alla arbetsytor: finns nyckeln, och hör den till rätt arbetsyta? Kastar aldrig. */
export async function kollaAlla({ env = process.env, konfig = lasKonfig(), bara = null, ...rest } = {}) {
  const ut = [];
  for (const y of allaArbetsytor(konfig)) {
    if (bara && y.id !== bara) continue;
    const rad = { butik: y.id, namn: y.namn, nyckel: y.nyckel, arbetsytaId: y.arbetsyta_id ?? null };
    if (!String(env[y.nyckel] ?? '').trim()) { ut.push({ ...rad, lage: 'saknas', anteckning: y.anteckning ?? null }); continue; }
    try {
      const v = await skapaKlient(y.id, { env, konfig, ...rest }).verifiera();
      ut.push({ ...rad, lage: 'ok', arbetsytaNamn: v.arbetsytaNamn, organisation: v.organisation, rattigheter: v.rattigheter });
    } catch (e) {
      ut.push({ ...rad, lage: 'fel', kod: e.kod ?? null, fel: e.message });
    }
  }
  return ut;
}

// ── Utskrift (CLI och MCP) ─────────────────────────────────────────────────

const rattText = (r = {}) => Object.entries(r).map(([k, v]) => `${k} ${v}`).join(', ') || 'inga';

export function skrivUt(typ, r) {
  switch (typ) {
    case 'kolla':
      return r.map((x) => {
        if (x.lage === 'saknas') return `❌ ${x.butik} (${x.namn}): ${x.nyckel} saknas i miljön${x.anteckning ? `. ${x.anteckning}` : ''}`;
        if (x.lage === 'fel') return `⛔ ${x.butik} (${x.namn}): ${x.fel}`;
        return `✅ ${x.butik}: nyckeln hör till "${x.arbetsytaNamn}". Rättigheter: ${rattText(x.rattigheter)}`;
      }).join('\n');
    case 'kampanjer': {
      const huvud = `${r.butik}: ${r.kampanjer.length} kampanjer${r.status ? ` med status ${r.status}` : ''}${r.totalt !== null && r.totalt !== undefined ? ` (Spoks räknar ${r.totalt})` : ''}${r.ofullstandig ? '. Fler finns, höj --antal.' : ''}`;
      return [huvud, ...r.kampanjer.map((k) => `${String(k.status).padEnd(9)} ${(k.publicerasSv ?? '—').padEnd(16)}  ${k.titel ?? '(utan titel)'}  [${k.id}]`)].join('\n');
    }
    case 'kampanj': {
      const s = r;
      return [
        `${s.titel ?? '(utan titel)'}  [${s.id}]`,
        `Status: ${s.status}${s.publicerasSv ? ` · publiceras ${s.publicerasSv} (svensk tid)` : ''}`,
        `Ämnesrad: ${s.amne ?? '—'}`,
        `Förhandstext: ${s.forhand ?? '—'}`,
        `Publik (segment-id): ${s.segment.length ? s.segment.join(', ') : 'INGEN'}`,
        `Block: ${s.antalBlock}${s.blockSomApiInteKan.length ? ` (varav ${s.blockSomApiInteKan.length} som API:t inte kan uttrycka: ${[...new Set(s.blockSomApiInteKan)].join(', ')})` : ''}`,
        s.redigera ? `Öppna i appen: ${s.redigera}` : null,
      ].filter(Boolean).join('\n');
    }
    case 'publik': {
      const t = `"${r.kampanj.titel}"`;
      if (r.redanRatt) return `✅ ${t} har redan den publiken: ${r.efter.join(', ')}`;
      if (r.torr) return `Torrt (inget ändrat). ${t}\n  nu:    ${r.fore.join(', ') || 'ingen publik'}\n  efter: ${r.efter.join(', ') || 'ingen publik'}\nKör med --ja för att spara.`;
      return `✅ Publiken sparad och tillbakaläst för ${t}: ${r.efter.join(', ') || 'ingen publik'}`;
    }
    case 'amnesrad': {
      const t = `"${r.kampanj.titel}"`;
      const rad = (o) => `ämne "${o.emailTitle ?? '—'}", förhandstext "${o.emailDescription ?? '—'}"`;
      if (r.redanRatt) return `✅ ${t} har redan ${rad(r.efter)}`;
      if (r.torr) return `Torrt (inget ändrat). ${t}\n  nu:    ${rad(r.fore)}\n  efter: ${rad(r.efter)}\nKör med --ja för att spara.`;
      return `✅ Sparat och tillbakaläst för ${t}: ${rad(r.efter)}`;
    }
    case 'kontakter':
      return [`${r.butik}: ${r.kontakter.length} kontakter${r.totalt !== null ? ` (Spoks räknar ${r.totalt})` : ''}`,
        ...r.kontakter.map((k) => `${k.email ?? '—'}  ${k.name ?? ''}  ${k.state ?? ''}  [${k.id}]`)].join('\n');
    case 'produkter':
      return [`${r.butik}: ${r.produkter.length} produkter${r.totalt !== null ? ` (Spoks räknar ${r.totalt})` : ''}`,
        ...r.produkter.map((p) => `${p.title ?? '—'}  ${p.price ?? ''} ${p.currency ?? ''}  ${p.url ?? ''}  [${p.id}]`)].join('\n');
    case 'taggar':
      return `${r.butik}: ${r.taggar.length} taggar\n${r.taggar.map((t) => (typeof t === 'string' ? t : JSON.stringify(t))).join('\n')}`;
    case 'anrop':
      if (r.torr) return `Torrt (inget skickat): ${r.metod} ${r.sokvag}\n${JSON.stringify(r.data, null, 2)}\nKör med --ja för att skicka.`;
      return `${r.metod} ${r.sokvag} → ${r.status}\n${JSON.stringify(r.data, null, 2).slice(0, 20000)}`;
    default:
      return JSON.stringify(r, null, 2);
  }
}

// ── CLI ────────────────────────────────────────────────────────────────────

const BOOLESKA = new Set(['ja', 'json', 'tom']);

export function tolkaArg(argv) {
  const pos = [];
  const flaggor = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { pos.push(a); continue; }
    const namn = a.slice(2);
    if (BOOLESKA.has(namn)) { flaggor[namn] = true; continue; }
    const v = argv[i + 1];
    if (v === undefined || v.startsWith('--')) throw new SpoksFel(`--${namn} vill ha ett värde.`, { kod: 'ARG' });
    flaggor[namn] = v;
    i++;
  }
  return { pos, flaggor };
}

const HJALP = `Spoks officiella API. Läs först: klaviyo/spoks/README.md → Spoks officiella API.

  kolla                                   vilka nycklar finns, hör de till rätt arbetsyta
  kampanjer --butik <id> [--status draft|scheduled|published|failed] [--antal 50]
  kampanj <id> --butik <id>               ämne, förhandstext, publik, block, länk till appen
  publik <id> --butik <id> --segment <segment-id>[,<id>] [--ja]
  amnesrad <id> --butik <id> [--amne "…"] [--forhand "…"] [--ja]
  kontakter --butik <id> [--epost <adress>] [--antal 20]
  produkter --butik <id> [--sok "<text>"] [--antal 20]
  taggar --butik <id>
  anrop <GET|POST|PATCH> <sökväg> --butik <id> [--data '<json>'] [--ja]

Utan --ja skrivs ingenting. --json ger rådata. Schemaläggning, utskick och att
slå på flöden finns inte i Spoks API. Det görs i appen.`;

export async function main(argv = process.argv.slice(2), { ut = (s) => process.stdout.write(`${s}\n`), logg = (s) => process.stderr.write(`· ${s}\n`), ...opts } = {}) {
  const { pos, flaggor } = tolkaArg(argv);
  const [kommando, ...rest] = pos;
  if (!kommando || kommando === 'hjalp' || flaggor.hjalp) { ut(HJALP); return 0; }
  if (kommando === 'kolla') {
    const r = await kollaAlla({ bara: flaggor.butik ?? null, logg, ...opts });
    ut(flaggor.json ? JSON.stringify(r, null, 2) : skrivUt('kolla', r));
    return r.some((x) => x.lage === 'fel') ? 1 : 0;
  }
  if (!flaggor.butik) throw new SpoksFel('--butik krävs (baverbutiken, carashell, matstrumpor …).', { kod: 'ARG' });
  const k = skapaKlient(flaggor.butik, { logg, ...opts });
  const torr = !flaggor.ja;
  let r;
  switch (kommando) {
    case 'kampanjer': r = await k.kampanjer({ status: flaggor.status ?? null, antal: flaggor.antal }); break;
    case 'kampanj': r = sammanfatta(await k.kampanj(rest[0])); break;
    case 'publik': r = await k.sattPublik(rest[0], flaggor.segment ?? '', { torr, tom: Boolean(flaggor.tom) }); break;
    case 'amnesrad': r = await k.sattAmnesrad(rest[0], { amne: flaggor.amne, forhand: flaggor.forhand }, { torr }); break;
    case 'kontakter': r = await k.kontakter({ epost: flaggor.epost ?? null, antal: flaggor.antal }); break;
    case 'produkter': r = await k.produkter({ sok: flaggor.sok ?? null, antal: flaggor.antal }); break;
    case 'taggar': r = await k.taggar(); break;
    case 'anrop': {
      let data;
      if (flaggor.data !== undefined) {
        try { data = JSON.parse(flaggor.data); } catch { throw new SpoksFel('--data är inte giltig JSON.', { kod: 'ARG' }); }
      }
      r = await k.fritt(rest[0], rest[1], { data, torr });
      break;
    }
    default:
      throw new SpoksFel(`Okänt kommando "${kommando}". Kör utan argument för hjälpen.`, { kod: 'ARG' });
  }
  ut(flaggor.json ? JSON.stringify(r, null, 2) : skrivUt(kommando, r));
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  // Proxyn: Nodes fetch läser HTTPS_PROXY bara under NODE_USE_ENV_PROXY=1.
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
    process.exit(r.status ?? 1);
  }
  main().then((kod) => { process.exitCode = kod; }, (e) => {
    process.stderr.write(`✗ ${e.message}\n`);
    process.exitCode = e.kod === 'ARG' ? 2 : 1;
  });
}
