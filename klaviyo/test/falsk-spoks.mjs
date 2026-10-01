// Falsk Spoks (Public API 2026-07) med tillstånd, för testerna av klaviyo/spoks/api.mjs.
// Härmar det som mätts mot riktiga api.spoks.com 2026-09-30 (403 med
// {statusCode, message: "Forbidden resource", traceId} på en fel nyckel) och
// specens regler: 409 på annat än utkast, 412 på fel If-Match, 429 med
// Retry-After, listor som { items, meta: { maxResults } }.

export const YTOR = {
  baverbutiken: 'f716ae36-68ae-4f1c-a45e-96c35d5637a0',
  carashell: '38f3d430-690c-4c0b-8419-8ec2e5272148',
};

const RATT = { posts: 'read-write', contacts: 'read-only', products: 'read-only', feeds: 'read-only' };

export function falskSpoks({
  nycklar = {
    'nyckel-bb': { feed: { id: YTOR.baverbutiken, name: 'Bäverbutiken' }, permissions: RATT },
    'nyckel-cs': { feed: { id: YTOR.carashell, name: 'Carashell' }, permissions: RATT },
  },
  kampanjer = [],
  kontakter = [],
  produkter = [],
  taggar = [],
  rateLimit = 0,
  retryAfter = '2',
  serverfel = 0,
  serverfelMetod = null,
  filterStods = true,
  bytHashForePatch = false,
} = {}) {
  const anrop = [];
  let nr = 0;
  const nyHash = () => `h${++nr}`;
  const normalisera = (k) => ({
    id: k.id,
    title: k.title ?? null,
    status: k.status ?? 'draft',
    publishDate: k.publishDate ?? null,
    deliveryChannel: 'email',
    smsTeaser: false,
    created: k.created ?? '2026-09-01T10:00:00.000Z',
    updated: k.updated ?? k.created ?? '2026-09-01T10:00:00.000Z',
    recipients: { segmentIds: [...(k.recipients?.segmentIds ?? [])] },
    notification: { smsText: null, emailTitle: k.notification?.emailTitle ?? k.title ?? null, emailDescription: k.notification?.emailDescription ?? null },
    blocks: k.blocks ?? [{ type: 'regular', text: 'Hej' }],
    text: 'Hej',
    editorUrl: `https://app.spoks.com/x/posts/${k.id}`,
    hash: nyHash(),
    feed: k.feed ?? YTOR.carashell,
  });
  const tillstand = {
    kampanjer: new Map(kampanjer.map((k) => [k.id, normalisera(k)])),
    rateKvar: rateLimit,
    serverKvar: serverfel,
  };

  const svar = (status, obj, headers = {}) => ({
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (n) => headers[String(n).toLowerCase()] ?? null },
    text: async () => (obj === null ? '' : JSON.stringify(obj)),
  });
  const felsvar = (status, message, path, headers = {}) => svar(status, { statusCode: status, timestamp: '2026-09-30T18:00:00.000Z', path, message, traceId: `t${status}` }, headers);
  const detalj = ({ feed, ...k }) => k;
  const listrad = ({ recipients, notification, blocks, text, editorUrl, hash, feed, ...rest }) => rest;
  const utanYta = ({ feed, ...r }) => r;

  const fetchFn = async (url, opts = {}) => {
    const u = new URL(url);
    const metod = opts.method ?? 'GET';
    const h = opts.headers ?? {};
    const kropp = opts.body ? JSON.parse(opts.body) : null;
    const p = u.pathname;
    anrop.push({ metod, sokvag: p, query: Object.fromEntries(u.searchParams), headers: h, kropp, host: u.host });

    if (tillstand.rateKvar > 0) {
      tillstand.rateKvar--;
      return felsvar(429, 'ThrottlerException: Too Many Requests', p, { 'retry-after': retryAfter });
    }
    if (tillstand.serverKvar > 0 && (!serverfelMetod || serverfelMetod === metod)) {
      tillstand.serverKvar--;
      return felsvar(503, 'Service Unavailable', p);
    }
    const nyckel = nycklar[h['x-api-key']];
    if (!nyckel) return felsvar(403, 'Forbidden resource', p);
    if (h['X-Api-Version'] && h['X-Api-Version'] !== '2026-07') return felsvar(400, `API version ${h['X-Api-Version']} is not supported.`, p);
    const yta = nyckel.feed.id;
    const far = (resurs, skriv = false) => {
      const r = nyckel.permissions?.[resurs];
      return skriv ? r === 'read-write' : Boolean(r);
    };

    if (metod === 'GET' && p === '/authorization') {
      return svar(200, { status: 'OK', feed: nyckel.feed, organization: { id: 'org1', name: 'Stonebite' }, permissions: nyckel.permissions });
    }

    if (p === '/campaigns' && metod === 'GET') {
      if (!far('posts')) return felsvar(403, 'Forbidden resource', p);
      const f = u.searchParams.get('$filter');
      if (f && !filterStods) return felsvar(400, 'property $filter should not exist', p);
      const m = f ? /^status eq '(\w+)'$/.exec(f) : null;
      if (f && !m) return felsvar(400, 'invalid $filter', p);
      let rader = [...tillstand.kampanjer.values()].filter((k) => k.feed === yta);
      if (m) rader = rader.filter((k) => k.status === m[1]);
      if (u.searchParams.get('$orderBy') === 'created desc') rader.sort((a, b) => b.created.localeCompare(a.created));
      const off = Number(u.searchParams.get('$offset') ?? 0);
      const lim = Number(u.searchParams.get('$limit') ?? 20);
      return svar(200, { items: rader.slice(off, off + lim).map(listrad), meta: { maxResults: rader.length } });
    }

    if (p === '/campaigns' && metod === 'POST') {
      if (!far('posts', true)) return felsvar(403, 'Forbidden resource', p);
      const id = `ny${nr + 1}`;
      const k = normalisera({ id, title: kropp?.title ?? null, feed: yta, recipients: kropp?.recipients, notification: kropp?.notification });
      tillstand.kampanjer.set(id, k);
      return svar(201, detalj(k), { etag: k.hash });
    }

    const km = /^\/campaigns\/([^/]+)$/.exec(p);
    if (km) {
      const k = tillstand.kampanjer.get(km[1]);
      if (!k || k.feed !== yta) return felsvar(404, 'Campaign not found', p);
      if (metod === 'GET') {
        if (!far('posts')) return felsvar(403, 'Forbidden resource', p);
        return svar(200, detalj(k), { etag: k.hash });
      }
      if (metod === 'PATCH') {
        if (!far('posts', true)) return felsvar(403, 'Forbidden resource', p);
        if (bytHashForePatch) k.hash = nyHash();
        if (k.status !== 'draft') return felsvar(409, 'Only draft campaigns can be updated', p);
        if (h['If-Match'] && h['If-Match'] !== k.hash) return felsvar(412, 'Precondition Failed', p);
        if (kropp?.recipients) k.recipients = { segmentIds: [...(kropp.recipients.segmentIds ?? [])] };
        if (kropp?.notification) k.notification = { ...k.notification, ...kropp.notification };
        if (kropp?.title !== undefined) k.title = kropp.title;
        if (kropp?.blocks !== undefined) k.blocks = kropp.blocks;
        k.hash = nyHash();
        k.updated = '2026-09-30T18:00:00.000Z';
        return svar(200, detalj(k), { etag: k.hash });
      }
    }

    if (metod === 'POST' && (p === '/contacts-search' || p === '/products-search')) {
      const resurs = p === '/contacts-search' ? 'contacts' : 'products';
      if (!far(resurs)) return felsvar(403, 'Forbidden resource', p);
      if (!(kropp?.limit >= 1 && kropp.limit <= 100) || !(kropp?.offset >= 0)) return felsvar(400, 'limit must not be greater than 100', p);
      let rader = (resurs === 'contacts' ? kontakter : produkter).filter((x) => (x.feed ?? YTOR.carashell) === yta);
      const f = kropp.filter;
      if (f?.type === 'filter' && f.operator === 'ilike') rader = rader.filter((x) => String(x[f.field] ?? '').toLowerCase().includes(String(f.value).toLowerCase()));
      if (kropp.prompt) rader = rader.filter((x) => String(x.title ?? '').toLowerCase().includes(String(kropp.prompt).toLowerCase()));
      return svar(200, { items: rader.slice(kropp.offset, kropp.offset + kropp.limit).map(utanYta), meta: { maxResults: rader.length } });
    }

    if (metod === 'GET' && p === '/contacts/contacts-tags') {
      if (!far('contacts')) return felsvar(403, 'Forbidden resource', p);
      return svar(200, { items: taggar, meta: { maxResults: taggar.length } });
    }

    if (metod === 'PATCH' && /^\/contacts\/[^/]+\/notification-settings$/.test(p)) {
      if (!far('contacts', true)) return felsvar(403, 'Forbidden resource', p);
      return svar(200, { id: 'c1', email: null, name: null, phone: null, image: null, state: 'unsubscribed', feedId: yta });
    }

    return felsvar(404, `Cannot ${metod} ${p}`, p);
  };

  return { fetchFn, anrop, tillstand };
}
