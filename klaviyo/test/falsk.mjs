// Falsk Klaviyo med tillstånd, för testerna. Samma mönster som falskWebmail() i
// kundtjanst/test/webmail-skriv.test.mjs: returnerar { fetchFn, anrop, tillstand }.
// Kontrollerar de fält som specen 2026-07-15 kräver, så fel form ger 400 som på riktigt.

export const PUBLIK = 'TMFt7M';

const METRIKER_STANDARD = [
  ['M_PO', 'Placed Order'], ['M_SC', 'Started Checkout'], ['M_VP', 'Viewed Product'], ['M_AOS', 'Active on Site'],
  ['M_ATC', 'Added to Cart'], ['M_OP', 'Ordered Product'], ['M_OE', 'Opened Email'], ['M_CE', 'Clicked Email'], ['M_RE', 'Received Email'],
];

export function falskKlaviyo({
  publik = PUBLIK,
  metriker = METRIKER_STANDARD,
  rateLimit = 0,
  retryAfter = '2',
  serverfel = 0,
  sidstorlekMetriker = 4,
  avsandare = 'kundsupport@baverbutiken.se',
  floden = [],
  segment = [],
  mallar = [],
  kampanjer = [],
  listor = [],
  rapport = null,
} = {}) {
  const anrop = [];
  let nr = 0;
  const nyttId = (p) => `${p}${++nr}`;
  const res = (typ, id, attributes, extra = {}) => ({ type: typ, id, attributes, ...extra });
  const tillstand = {
    konto: res('account', 'ACC1', { public_api_key: publik, timezone: 'Europe/Stockholm', preferred_currency: 'SEK', contact_information: { default_sender_email: avsandare, default_sender_name: 'Bäverbutiken', organization_name: 'Stonebite Ecom AB', street_address: { address1: 'Gatan 1', city: 'Stockholm', country: 'SE', zip: '11111' } } }),
    metriker: metriker.map(([id, name]) => res('metric', id, { name, integration: { name: 'Shopify' } })),
    listor: listor.map((l) => res('list', l.id, { name: l.name, opt_in_process: 'single_opt_in' })),
    segment: segment.map((s) => res('segment', s.id, { name: s.name, definition: s.definition ?? { condition_groups: [] }, is_active: true })),
    mallar: mallar.map((m) => res('template', m.id, { name: m.name, editor_type: 'CODE', html: m.html ?? '' })),
    kampanjer: kampanjer.map((k) => res('campaign', k.id, { name: k.name, status: k.status ?? 'Draft' })),
    meddelanden: Object.fromEntries(kampanjer.map((k) => [`MSG_${k.id}`, { kampanj: k.id, definition: {}, mall: null }])),
    floden: floden.map((f) => res('flow', f.id, { name: f.name, status: f.status ?? 'draft', trigger_type: f.trigger_type ?? 'Metric', archived: false })),
    sendJobs: [],
    raderade: [],
    rateKvar: rateLimit,
    serverKvar: serverfel,
  };
  const svar = (status, obj, headers = {}) => ({
    status, ok: status >= 200 && status < 300,
    headers: { get: (n) => headers[n.toLowerCase()] ?? null },
    text: async () => (obj === null ? '' : JSON.stringify(obj)),
  });
  const fel400 = (detail, pointer) => svar(400, { errors: [{ id: 'e1', status: 400, code: 'invalid', title: 'Invalid input.', detail, source: { pointer } }] });
  const nekaSaknas = (v, pointer) => (v === undefined || v === null ? fel400(`'${pointer.split('/').pop()}' is a required field.`, pointer) : null);

  /** Lista med filter och paginering. */
  const lista = (samling, q, sidstorlek) => {
    let rader = samling;
    const f = q.get('filter') ?? '';
    const eq = /equals\(name,"((?:[^"\\]|\\.)*)"\)/.exec(f);
    const co = /contains\(name,"((?:[^"\\]|\\.)*)"\)/.exec(f);
    if (eq) rader = rader.filter((r) => r.attributes.name === eq[1]);
    if (co) rader = rader.filter((r) => r.attributes.name.includes(co[1]));
    const storlek = Number(q.get('page[size]') ?? sidstorlek);
    const start = Number(q.get('page[cursor]') ?? 0);
    const sida = rader.slice(start, start + storlek);
    const links = { self: 'x' };
    if (start + storlek < rader.length) links.next = `https://a.klaviyo.com${q.__sokvag}?${new URLSearchParams({ ...Object.fromEntries(q), 'page[cursor]': String(start + storlek) })}`;
    return svar(200, { data: sida, links });
  };

  const fetchFn = async (url, opts = {}) => {
    const u = new URL(url);
    const q = u.searchParams;
    q.__sokvag = u.pathname;
    const metod = opts.method ?? 'GET';
    const kropp = opts.body ? JSON.parse(opts.body) : null;
    anrop.push({ metod, url, sokvag: u.pathname, q, headers: opts.headers ?? {}, kropp });
    if (tillstand.rateKvar > 0) { tillstand.rateKvar--; return svar(429, { errors: [{ code: 'throttled', detail: 'Request was throttled.' }] }, { 'retry-after': retryAfter }); }
    if (tillstand.serverKvar > 0) { tillstand.serverKvar--; return svar(503, { errors: [{ code: 'error', detail: 'Service unavailable' }] }); }
    const h = opts.headers ?? {};
    if (!/^Klaviyo-API-Key /.test(h.Authorization ?? '')) return svar(401, { errors: [{ code: 'not_authenticated', detail: 'Missing key' }] });
    if (!h.revision) return svar(400, { errors: [{ code: 'invalid', detail: 'revision header required' }] });
    const p = u.pathname;
    const d = kropp?.data;
    const a = d?.attributes ?? {};

    if (p === '/api/accounts' && metod === 'GET') return svar(200, { data: [tillstand.konto], links: { self: 'x' } });
    if (p === '/api/metrics' && metod === 'GET') return lista(tillstand.metriker, q, sidstorlekMetriker);
    let m = /^\/api\/metrics\/([^/]+)\/metric-properties$/.exec(p);
    if (m) return svar(200, { data: [res('metric-property', 'P1', { property: 'ProductName', label: 'ProductName' }), res('metric-property', 'P2', { property: 'Quantity' })] });

    if (p === '/api/lists') {
      if (metod === 'GET') return lista(tillstand.listor, q, 10);
      if (metod === 'POST') { const x = nekaSaknas(a.name, '/data/attributes/name'); if (x) return x; const r = res('list', nyttId('L'), { name: a.name, opt_in_process: a.opt_in_process }); tillstand.listor.push(r); return svar(201, { data: r }); }
    }
    if (p === '/api/segments') {
      if (metod === 'GET') return lista(tillstand.segment, q, 10);
      if (metod === 'POST') {
        const x = nekaSaknas(a.name, '/data/attributes/name') ?? nekaSaknas(a.definition?.condition_groups, '/data/attributes/definition/condition_groups'); if (x) return x;
        const r = res('segment', nyttId('S'), { name: a.name, definition: a.definition, is_active: true }); tillstand.segment.push(r); return svar(201, { data: r });
      }
    }
    m = /^\/api\/segments\/([^/]+)$/.exec(p);
    if (m && metod === 'GET') { const r = tillstand.segment.find((s) => s.id === m[1]); return r ? svar(200, { data: r }) : svar(404, { errors: [{ code: 'not_found', detail: 'nope' }] }); }

    if (p === '/api/templates') {
      if (metod === 'GET') return lista(tillstand.mallar, q, 10);
      if (metod === 'POST') {
        const x = nekaSaknas(a.name, '/data/attributes/name') ?? nekaSaknas(a.editor_type, '/data/attributes/editor_type'); if (x) return x;
        const r = res('template', nyttId('T'), { name: a.name, editor_type: a.editor_type, html: a.html, text: a.text }); tillstand.mallar.push(r); return svar(201, { data: r });
      }
    }
    m = /^\/api\/templates\/([^/]+)$/.exec(p);
    if (m) {
      const i = tillstand.mallar.findIndex((t) => t.id === m[1]);
      if (i < 0) return svar(404, { errors: [{ code: 'not_found', detail: 'nope' }] });
      if (metod === 'PATCH') { Object.assign(tillstand.mallar[i].attributes, a); return svar(200, { data: tillstand.mallar[i] }); }
      if (metod === 'DELETE') { tillstand.raderade.push(tillstand.mallar[i]); tillstand.mallar.splice(i, 1); return svar(204, null); }
    }
    if (p === '/api/template-render' && metod === 'POST') {
      const t = tillstand.mallar.find((x) => x.id === d.id);
      const html = (t?.attributes.html ?? '').replace(/\{\{ first_name\|default:"" \}\}/, a.context?.first_name ?? '');
      return svar(201, { data: res('template', d.id, { html }) });
    }

    if (p === '/api/campaigns') {
      if (metod === 'GET') {
        if (!/messages\.channel/.test(q.get('filter') ?? '')) return fel400('A channel filter is required.', null);
        return lista(tillstand.kampanjer, q, 100);
      }
      if (metod === 'POST') {
        const x = nekaSaknas(a.name, '/data/attributes/name') ?? nekaSaknas(a.audiences?.included, '/data/attributes/audiences/included') ?? nekaSaknas(a['campaign-messages']?.data, '/data/attributes/campaign-messages/data'); if (x) return x;
        if (a.send_strategy && (a.send_strategy.method !== 'static' || !a.send_strategy.datetime)) return fel400('send_strategy invalid', '/data/attributes/send_strategy');
        const id = nyttId('C');
        const r = res('campaign', id, { name: a.name, status: 'Draft', audiences: a.audiences, send_strategy: a.send_strategy }, { relationships: { 'campaign-messages': { data: [{ type: 'campaign-message', id: `MSG_${id}` }] } } });
        tillstand.kampanjer.push(r);
        tillstand.meddelanden[`MSG_${id}`] = { kampanj: id, definition: a['campaign-messages'].data[0].attributes.definition, mall: null };
        return svar(201, { data: r });
      }
    }
    m = /^\/api\/campaigns\/([^/]+)(\/campaign-messages)?$/.exec(p);
    if (m) {
      const k = tillstand.kampanjer.find((x) => x.id === m[1]);
      if (!k) return svar(404, { errors: [{ code: 'not_found', detail: 'nope' }] });
      if (m[2] && metod === 'GET') {
        const mall = tillstand.meddelanden[`MSG_${k.id}`]?.mall;
        return svar(200, { data: [res('campaign-message', `MSG_${k.id}`, {}, { relationships: { template: { data: mall ? { type: 'template', id: mall } : null } } })] });
      }
      if (metod === 'PATCH') { Object.assign(k.attributes, a); return svar(200, { data: k }); }
    }
    m = /^\/api\/campaign-messages\/([^/]+)$/.exec(p);
    if (m && metod === 'PATCH') { tillstand.meddelanden[m[1]].definition = a.definition; return svar(200, { data: res('campaign-message', m[1], {}) }); }
    if (p === '/api/campaign-message-assign-template' && metod === 'POST') {
      const tid = d?.relationships?.template?.data?.id;
      if (!tillstand.meddelanden[d?.id]) return svar(404, { errors: [{ code: 'not_found', detail: 'message' }] });
      if (!tillstand.mallar.find((t) => t.id === tid)) return fel400('template not found', '/data/relationships/template/data/id');
      tillstand.meddelanden[d.id].mall = tid;
      return svar(200, { data: res('campaign-message', d.id, {}) });
    }
    if (p.startsWith('/api/campaign-send-jobs')) { tillstand.sendJobs.push(kropp); return svar(202, { data: {} }); }

    if (p === '/api/flows') {
      if (metod === 'GET') return lista(tillstand.floden, q, 50);
      if (metod === 'POST') {
        const def = a.definition;
        const x = nekaSaknas(a.name, '/data/attributes/name') ?? nekaSaknas(def?.triggers, '/data/attributes/definition/triggers') ?? nekaSaknas(def?.actions, '/data/attributes/definition/actions'); if (x) return x;
        if (!('entry_action_id' in def)) return fel400("'entry_action_id' is a required field.", '/data/attributes/definition/entry_action_id');
        const r = res('flow', nyttId('F'), { name: a.name, status: 'draft', trigger_type: def.triggers[0].type, definition: def, archived: false });
        tillstand.floden.push(r);
        return svar(201, { data: r });
      }
    }
    if (/^\/api\/flows\//.test(p) && metod === 'PATCH') { const f = tillstand.floden.find((x) => p.endsWith(x.id)); if (f) Object.assign(f.attributes, a); return svar(200, { data: f }); }

    if ((p === '/api/campaign-values-reports' || p === '/api/flow-values-reports') && metod === 'POST') {
      const x = nekaSaknas(a.conversion_metric_id, '/data/attributes/conversion_metric_id') ?? nekaSaknas(a.timeframe, '/data/attributes/timeframe'); if (x) return x;
      const kampanj = p.includes('campaign');
      const results = rapport ? (kampanj ? rapport.kampanj : rapport.flode) : [];
      return svar(200, { data: { type: kampanj ? 'campaign-values-report' : 'flow-values-report', attributes: { results } } });
    }
    return svar(404, { errors: [{ code: 'not_found', detail: `falsk Klaviyo känner inte ${metod} ${p}` }] });
  };
  return { fetchFn, anrop, tillstand };
}
