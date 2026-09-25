// Klaviyo-klienten: headers, paginering, 429/5xx, fel i klartext. Noll beroenden.
//
// Källa: Klaviyos OpenAPI-spec revision 2026-07-15 (läst 2026-09-24). Allt här
// följer specen; inget är provat mot ett riktigt konto än (ingen nyckel fanns
// 2026-09-24). Det som bara går att mäta med nyckel står i ARKITEKTUR.md →
// "Obekräftat" och mäts av `kolla.mjs --prov`.
//
// Klienten tar `fetchFn` i konstruktorn så testerna kan köra mot en falsk
// Klaviyo (klaviyo/test/falsk.mjs) — samma mönster som kundtjanst/webmail.mjs.
//
// ⛔ Järnregel 1 sitter HÄR, inte bara i uppladdaren: klienten vägrar varje
// anrop som skulle skicka ett mejl eller sätta ett flöde live (send-jobs,
// status "live" på flöden och flödesactions). Motorn skapar bara utkast.

export const BAS = 'https://a.klaviyo.com';
export const REVISION = '2026-07-15';
const JSONAPI = 'application/vnd.api+json';
const MAX_FORSOK = 5;

const vila = (ms) => new Promise((r) => setTimeout(r, ms));

/** Fel från Klaviyo (eller från klientens egna spärrar), i klartext på svenska. */
export class KlaviyoFel extends Error {
  constructor({ status, metod, sokvag, fel = [], kod = null, meddelande = null }) {
    const rader = fel.map((f) => {
      const plats = f.pointer ? ` (fält ${f.pointer})` : f.parameter ? ` (parameter ${f.parameter})` : '';
      return `[${f.code ?? 'okänd kod'}] ${f.detail ?? f.title ?? 'ingen detalj'}${plats}`;
    });
    const text = meddelande
      ?? `Klaviyo svarade ${status} på ${metod} ${sokvag}${rader.length ? ': ' + rader.join('; ') : ''}`;
    super(text);
    this.name = 'KlaviyoFel';
    this.status = status;
    this.metod = metod;
    this.sokvag = sokvag;
    this.fel = fel;
    this.kod = kod ?? (fel[0]?.code ?? null);
  }
}

/** JSON:API-felens form i specen: components.responses.ClientError → errors[]. */
function tolkaFel(json) {
  const lista = Array.isArray(json?.errors) ? json.errors : [];
  return lista.map((e) => ({
    code: e.code ?? null,
    title: e.title ?? null,
    detail: e.detail ?? null,
    pointer: e.source?.pointer ?? null,
    parameter: e.source?.parameter ?? null,
  }));
}

/** Bygger frågesträngen. Arrayer blir kommaseparerade (sparse fieldsets, include). */
export function frageStrang(params = {}) {
  const delar = [];
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v === undefined || v === null) continue;
    const varde = Array.isArray(v) ? v.join(',') : String(v);
    delar.push(`${encodeURIComponent(k)}=${encodeURIComponent(varde)}`);
  }
  return delar.length ? `?${delar.join('&')}` : '';
}

/** Citerar ett värde för Klaviyos filtersträng: equals(name,"…"). */
export function citera(varde) {
  return `"${String(varde).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

/**
 * Spärren mot att skicka. Kastar om anropet skulle starta ett utskick eller
 * sätta något live. Returnerar inget annars.
 */
export function sparrSkicka(metod, sokvag, kropp, tillatLive = null) {
  const s = String(sokvag).replace(/^https?:\/\/[^/]+/, '').split('?')[0];
  // Undantaget: klaviyo/sla-pa.mjs slår på NAMNGIVNA flöden på Axels ord.
  // Bara exakt de flödes- och action-id:n som står i mängden, bara PATCH av
  // status, och aldrig något kampanjutskick.
  const liveId = /^\/api\/(?:flows|flow-actions)\/([^/]+)$/.exec(s)?.[1];
  const at = kropp?.data?.attributes ?? {};
  const baraLive = Object.keys(at).length === 1 && (at.status === 'live' || at.definition?.data?.status === 'live');
  if (tillatLive?.has?.(liveId) && metod === 'PATCH' && baraLive) return;
  const stopp = (varfor) => {
    throw new KlaviyoFel({ status: 0, metod, sokvag: s, kod: 'SPARR_SKICKA', meddelande: `Spärrat: ${varfor}. Motorn skapar bara utkast (ARKITEKTUR.md järnregel 1) — ett utskick är Axels beslut, i Klaviyo.` });
  };
  if (/^\/api\/campaign-send-jobs/.test(s)) stopp(`${metod} ${s} startar ett kampanjutskick`);
  if (/^\/api\/(flow-send|send-)/.test(s)) stopp(`${metod} ${s} skickar`);
  if (metod === 'GET' || !kropp) return;
  const attr = kropp?.data?.attributes ?? {};
  // Kampanj utan sändtid blir "Immediate" i Klaviyo (specen: send_strategy defaults
  // to Immediate). Ett klick på Send i Klaviyo skickar då direkt. Motorn sätter
  // alltid en planerad tid.
  if (/^\/api\/campaigns(\/[^/]+)?$/.test(s)) {
    const st = attr.send_strategy;
    if (metod === 'POST' && !st?.method) stopp('kampanjen saknar send_strategy — Klaviyo gör den då till "skicka direkt"');
    if (st && st.method !== 'static') stopp(`kampanjen skulle få send_strategy "${st.method}", motorn sätter bara "static" med en planerad tid`);
  }
  if (/^\/api\/flows(\/|$)/.test(s)) {
    if (attr.status && attr.status !== 'draft') stopp(`flödet skulle få status "${attr.status}"`);
    for (const a of attr.definition?.actions ?? []) {
      if (a?.data?.status && a.data.status !== 'draft') stopp(`flödesaction ${a.temporary_id ?? a.id ?? '?'} skulle få status "${a.data.status}"`);
    }
  }
  if (/^\/api\/flow-actions\//.test(s)) {
    const st = attr.status ?? attr.definition?.data?.status;
    if (st && st !== 'draft') stopp(`flödesaction skulle få status "${st}"`);
  }
}

export class KlaviyoKlient {
  /**
   * @param {object} o
   * @param {string} o.nyckel      privat API-nyckel (pk_…)
   * @param {Function} [o.fetchFn] fetch (injiceras i testerna)
   * @param {string} [o.bas]
   * @param {string} [o.revision]
   * @param {number} [o.paus]      ms mellan två SKRIVANDE anrop. Segment och flöden
   *                               har burst 1/s i specen, därför 1000 som standard.
   *                               Läsningar pausas inte; en 429 hanteras ändå.
   * @param {Function} [o.logg]
   * @param {Function} [o.sov]     sömnen (injiceras i testerna så 429 inte tar tid)
   */
  constructor({ nyckel, fetchFn = fetch, bas = BAS, revision = REVISION, paus = 1000, logg = () => {}, sov = vila, tillatLive = null } = {}) {
    this.tillatLive = tillatLive ? new Set(tillatLive) : null;
    if (!nyckel) throw new Error('KlaviyoKlient: nyckel saknas.');
    this.nyckel = nyckel;
    this.fetchFn = fetchFn;
    this.bas = String(bas).replace(/\/+$/, '');
    this.revision = revision;
    this.paus = paus;
    this.logg = logg;
    this.sov = sov;
    this.senasteSkrivning = 0;
    this.antalAnrop = 0;
  }

  headers(extra = {}) {
    return {
      Authorization: `Klaviyo-API-Key ${this.nyckel}`,
      revision: this.revision,
      accept: JSONAPI,
      'content-type': JSONAPI,
      ...extra,
    };
  }

  url(sokvag, params) {
    if (/^https?:\/\//.test(sokvag)) return sokvag + (params ? frageStrang(params).replace(/^\?/, sokvag.includes('?') ? '&' : '?') : '');
    return this.bas + (sokvag.startsWith('/') ? sokvag : `/${sokvag}`) + frageStrang(params);
  }

  async anrop(metod, sokvag, { params = null, kropp = null, headers = {} } = {}) {
    sparrSkicka(metod, sokvag, kropp, this.tillatLive);
    const url = this.url(sokvag, params);
    const kort = url.replace(this.bas, '').split('?')[0];
    if (metod !== 'GET' && this.paus) {
      const vanta = this.senasteSkrivning + this.paus - Date.now();
      if (vanta > 0) await this.sov(vanta);
    }
    let senasteFel = null;
    for (let forsok = 1; forsok <= MAX_FORSOK; forsok++) {
      let svar;
      try {
        this.antalAnrop++;
        svar = await this.fetchFn(url, { method: metod, headers: this.headers(headers), body: kropp ? JSON.stringify(kropp) : undefined });
      } catch (e) {
        // Nätfel behandlas som 5xx: vänta och försök igen.
        senasteFel = new KlaviyoFel({ status: 0, metod, sokvag: kort, kod: 'NATFEL', meddelande: `Nätfel mot Klaviyo (${metod} ${kort}): ${e.message}` });
        if (forsok < MAX_FORSOK) { await this.sov(1000 * 2 ** (forsok - 1)); continue; }
        throw senasteFel;
      }
      if (metod !== 'GET') this.senasteSkrivning = Date.now();
      const text = await svar.text();
      let json = null;
      if (text) { try { json = JSON.parse(text); } catch { json = null; } }

      if (svar.status === 429) {
        const ra = Number(svar.headers?.get?.('retry-after') ?? svar.headers?.get?.('Retry-After'));
        const sek = Number.isFinite(ra) && ra > 0 ? ra : 2 ** (forsok - 1);
        senasteFel = new KlaviyoFel({ status: 429, metod, sokvag: kort, fel: tolkaFel(json), kod: 'RATE_LIMIT' });
        this.logg(`Klaviyo 429 på ${metod} ${kort} — väntar ${sek} s (försök ${forsok} av ${MAX_FORSOK}).`);
        if (forsok < MAX_FORSOK) { await this.sov(sek * 1000); continue; }
        throw new KlaviyoFel({ status: 429, metod, sokvag: kort, fel: tolkaFel(json), kod: 'RATE_LIMIT', meddelande: `Klaviyo svarade 429 (för många anrop) på ${metod} ${kort} ${MAX_FORSOK} gånger i rad — gav upp. Dygnstaket kan vara nått.` });
      }
      if (svar.status >= 500) {
        senasteFel = new KlaviyoFel({ status: svar.status, metod, sokvag: kort, fel: tolkaFel(json) });
        this.logg(`Klaviyo ${svar.status} på ${metod} ${kort} — försöker igen (${forsok} av ${MAX_FORSOK}).`);
        if (forsok < MAX_FORSOK) { await this.sov(1000 * 2 ** (forsok - 1)); continue; }
        throw senasteFel;
      }
      if (svar.status >= 400) {
        const fel = tolkaFel(json);
        if (!fel.length && text) fel.push({ code: null, title: null, detail: text.slice(0, 300), pointer: null, parameter: null });
        if (svar.status === 401 || svar.status === 403) {
          throw new KlaviyoFel({ status: svar.status, metod, sokvag: kort, fel, meddelande: `Klaviyo nekade ${metod} ${kort} (${svar.status}): nyckeln är fel eller saknar behörighet. Skapa en Private API Key med Full Access (Klaviyo → Settings → API keys). ${fel.map((f) => f.detail).filter(Boolean).join('; ')}`.trim() });
        }
        throw new KlaviyoFel({ status: svar.status, metod, sokvag: kort, fel });
      }
      return json;
    }
    throw senasteFel;
  }

  get(sokvag, params, o = {}) { return this.anrop('GET', sokvag, { ...o, params }); }
  post(sokvag, kropp, o = {}) { return this.anrop('POST', sokvag, { ...o, kropp }); }
  patch(sokvag, kropp, o = {}) { return this.anrop('PATCH', sokvag, { ...o, kropp }); }
  delete(sokvag, o = {}) { return this.anrop('DELETE', sokvag, o); }

  /** Alla sidor av en lista: följer `links.next` tills den tar slut. Returnerar data[]. */
  async allaSidor(sokvag, params = {}) {
    const ut = [];
    let svar = await this.get(sokvag, params);
    let varv = 0;
    for (;;) {
      ut.push(...(svar?.data ?? []));
      const nasta = svar?.links?.next;
      if (!nasta) break;
      if (++varv > 1000) throw new Error(`allaSidor(${sokvag}): över 1000 sidor — avbryter.`);
      svar = await this.get(nasta);
    }
    return ut;
  }

  /**
   * Slår upp ett objekt på EXAKT namn. Returnerar resursen, null om den saknas,
   * och kastar om namnet finns mer än en gång (då vet ingen vilken som gäller).
   * Filterfälten ur specen (2026-07-15):
   *   templates  name equals, page[size] max 10
   *   segments   name equals, max 10
   *   lists      name equals, max 10
   *   flows      name equals, max 50
   *   campaigns  name BARA contains, och filtret messages.channel krävs
   */
  async hittaPaNamn(typ, namn) {
    const SOK = {
      template: ['/api/templates', { filter: `equals(name,${citera(namn)})`, 'page[size]': 10 }],
      segment: ['/api/segments', { filter: `equals(name,${citera(namn)})`, 'page[size]': 10 }],
      list: ['/api/lists', { filter: `equals(name,${citera(namn)})`, 'page[size]': 10 }],
      flow: ['/api/flows', { filter: `equals(name,${citera(namn)})`, 'page[size]': 50 }],
      campaign: ['/api/campaigns', { filter: `and(equals(messages.channel,'email'),contains(name,${citera(namn)}))` }],
    };
    const nyckel = typ.replace(/s$/, '');
    const sok = SOK[nyckel];
    if (!sok) throw new Error(`hittaPaNamn: okänd typ "${typ}" (templates, segments, lists, flows, campaigns).`);
    const alla = await this.allaSidor(...sok);
    const exakta = alla.filter((r) => r?.attributes?.name === namn);
    if (exakta.length > 1) {
      throw new KlaviyoFel({ status: 0, metod: 'GET', sokvag: sok[0], kod: 'DUBBLETT', meddelande: `Namnet "${namn}" finns ${exakta.length} gånger bland ${nyckel}s i Klaviyo (id ${exakta.map((r) => r.id).join(', ')}). Motorn vet inte vilken som gäller — döp om eller arkivera dubbletten i Klaviyo först.` });
    }
    return exakta[0] ?? null;
  }
}

/**
 * Nyckeln för ETT brand. Läser `brand.nyckel_env` i ordning och returnerar
 * { nyckel, variabel } eller null. Tar aldrig en annan brands nyckel och
 * gissar aldrig ett namn (järnregel 8).
 */
export function nyckelFranEnv(brand, env = process.env) {
  for (const variabel of brand?.nyckel_env ?? []) {
    const v = env[variabel];
    if (v && String(v).trim()) return { nyckel: String(v).trim(), variabel };
  }
  return null;
}

/**
 * Kontot bakom nyckeln måste vara brandets (public_api_key === public_id).
 * Kastar KlaviyoFel med kod FEL_KONTO annars — ingenting får skrivas då.
 */
export async function kontrolleraKonto(klient, brand) {
  const svar = await klient.get('/api/accounts');
  const konto = svar?.data?.[0];
  if (!konto) throw new KlaviyoFel({ status: 0, metod: 'GET', sokvag: '/api/accounts', kod: 'FEL_KONTO', meddelande: 'GET /api/accounts gav inget konto — kan inte kontrollera att nyckeln hör till rätt butik. STOPP.' });
  const pub = konto.attributes?.public_api_key;
  if (pub !== brand.public_id) {
    throw new KlaviyoFel({ status: 0, metod: 'GET', sokvag: '/api/accounts', kod: 'FEL_KONTO', meddelande: `STOPP: nyckeln hör till Klaviyo-kontot ${pub ?? '(okänt)'}, men ${brand.namn} är ${brand.public_id}. Fel butiks nyckel — ingenting skrivs.` });
  }
  return konto;
}
