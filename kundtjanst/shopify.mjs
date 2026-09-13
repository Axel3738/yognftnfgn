// shopify.mjs — läser ordrar och tvister ur ett brands Shopify. LÄS-BARA:
// ingenting skrivs, ingen status ändras. Noll beroenden (inbyggd fetch).
//
// Auth (per brand, ur kundtjanst/brands.mjs korkonfig):
//   • en färdig admin-token   SHOPIFY_ADMIN_TOKEN_<ID>   (custom app, read_orders)
//   • eller client credentials SHOPIFY_CLIENT_ID_<ID> + SHOPIFY_CLIENT_SECRET_<ID>
//     — samma app "Fabriken" som byggde butiken. Token mintas med
//     factory/token.mjs mintaToken (24 h) och sparas aldrig här.
//
// Scopes som behövs: read_orders (ordrar, fulfillments, refunds) och
// read_shopify_payments_disputes (tvister). Saknas det senare rapporteras
// tvisterna som "inte tillgängliga" — aldrig som noll.
//
// REST i stället för GraphQL här: tvisterna finns bara i REST
// (/shopify_payments/disputes.json), och ordrarnas fält är plattare att läsa.

import { mintaToken } from '../factory/token.mjs';

const API_VERSION = () => process.env.SHOPIFY_API_VERSION || '2025-07';

/** Shopifys Link-header → nästa sidas URL, eller null. */
export function nastaSida(link) {
  const m = String(link ?? '').match(/<([^>]+)>;\s*rel="next"/);
  return m ? m[1] : null;
}

/** En REST-order → den platta form chargeback.mjs läser. Ren. */
export function normaliseraOrder(o) {
  const fulfillments = Array.isArray(o.fulfillments) ? o.fulfillments : [];
  const sparning = fulfillments.some((f) => f.status !== 'cancelled' && ((f.tracking_numbers ?? []).length > 0 || f.tracking_number));
  const skapad = o.created_at ? new Date(o.created_at) : null;
  return {
    id: o.id,
    namn: o.name ?? (o.order_number ? `#${o.order_number}` : ''),
    nummer: String(o.order_number ?? String(o.name ?? '').replace(/^#/, '')),
    email: String(o.email ?? o.contact_email ?? '').toLowerCase(),
    skapad: skapad && !Number.isNaN(skapad.getTime()) ? skapad : null,
    betald: o.financial_status ?? null,
    fulfillment: o.fulfillment_status ?? null,
    sparning,
    leveransstatus: fulfillments.map((f) => f.shipment_status).filter(Boolean).pop() ?? null,
    aterbetald: ['refunded', 'partially_refunded'].includes(o.financial_status) || (Array.isArray(o.refunds) && o.refunds.length > 0),
    avbruten: Boolean(o.cancelled_at),
    total: Number(o.total_price ?? 0),
    valuta: o.currency ?? null,
    taggar: String(o.tags ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  };
}

/** En REST-dispute → platt form. Ren. */
export function normaliseraTvist(d, ordrar = []) {
  const order = ordrar.find((o) => String(o.id) === String(d.order_id));
  return {
    id: d.id,
    orderId: d.order_id,
    ordernamn: order?.namn ?? null,
    typ: d.type ?? 'chargeback',            // chargeback | inquiry
    orsak: d.reason ?? 'general',           // fraudulent | product_not_received | product_unacceptable | unrecognized | duplicate | credit_not_processed | subscription_canceled | general
    status: d.status ?? '',                 // needs_response | under_review | charge_refunded | accepted | won | lost
    belopp: Number(d.amount ?? 0),
    valuta: d.currency ?? null,
    initierad: d.initiated_at ? new Date(d.initiated_at) : null,
    evidensSenast: d.evidence_due_by ? String(d.evidence_due_by).slice(0, 10) : null,
  };
}

/** Ordrar mot ärenden: på ordernummer i mejlet, annars på kundens mejladress. Ren. */
export function kopplaOrdrar(arenden = [], ordrar = []) {
  const perNummer = new Map(ordrar.map((o) => [o.nummer, o]));
  const perEmail = new Map();
  for (const o of ordrar) if (o.email) (perEmail.get(o.email) ?? perEmail.set(o.email, []).get(o.email)).push(o);
  return arenden.map((a) => {
    const traffar = [];
    for (const n of a.ordernummer ?? []) if (perNummer.has(n)) traffar.push(perNummer.get(n));
    if (!traffar.length && a.kund?.adress && perEmail.has(a.kund.adress)) traffar.push(...perEmail.get(a.kund.adress));
    return { ...a, ordrar: traffar.map((o) => ({ namn: o.namn, betald: o.betald, fulfillment: o.fulfillment, sparning: o.sparning, skapad: o.skapad })) };
  });
}

/**
 * Ser värdet ut som en custom-apps "Admin API access token"? Custom-appen visar
 * tre olika strängar (API key, API secret key, Admin API access token) och
 * bara den sista fungerar som token — de andra två är lätta att klistra in av
 * misstag. Returnerar null när formen stämmer, annars en förklaring.
 * (Mätt 2026-09-12: Bäverbutikens första token gav 401 i en ny container.)
 */
export function granskaAdminToken(token) {
  const t = String(token ?? '').trim();
  if (!t) return 'tom';
  if (t !== String(token)) return 'har mellanslag eller radbrytning runt sig — klistra in bara själva strängen';
  if (t.startsWith('shpat_')) return null;
  if (t.startsWith('shpss_')) return 'är en "API secret key" (shpss_…), inte "Admin API access token" (shpat_…)';
  if (t.startsWith('atkn_') || t.startsWith('shpca_') || t.startsWith('shpua_')) return 'är en kortlivad CLI-/app-token, inte custom-appens "Admin API access token" (shpat_…)';
  if (/^[0-9a-f]{32}$/i.test(t)) return 'är en "API key" (32 hex-tecken), inte "Admin API access token" (shpat_…)';
  return 'börjar inte med shpat_ — inte en custom-apps "Admin API access token"';
}

export class ShopifyLasare {
  constructor({ shop, adminToken = '', clientId = '', clientSecret = '', butikId = null, fetchFn = fetch, logg = () => {} } = {}) {
    Object.assign(this, { shop, adminToken, clientId, clientSecret, butikId, fetchFn, logg });
    this.token = adminToken || null;
    this.scopes = null;
  }

  async token_() {
    if (this.token) return this.token;
    const m = await mintaToken({ shop: this.shop, clientId: this.clientId, clientSecret: this.clientSecret, butikId: this.butikId }, { fetchFn: this.fetchFn });
    this.token = m.token;
    this.scopes = m.scopes;
    this.logg(`Shopify-token mintad för ${this.shop} (${m.scopes.length} scopes)`);
    return this.token;
  }

  async get(url) {
    const token = await this.token_();
    for (let forsok = 0; forsok < 4; forsok++) {
      const svar = await this.fetchFn(url, { headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' } });
      if (svar.status === 429) {
        const vanta = Number(svar.headers.get('retry-after') || 2) * 1000;
        await new Promise((r) => setTimeout(r, vanta));
        continue;
      }
      if (!svar.ok) {
        let text = `Shopify ${this.shop} svarade ${svar.status}: ${(await svar.text()).slice(0, 300)}`;
        if (svar.status === 401 && this.adminToken) {
          const form = granskaAdminToken(this.adminToken);
          text = `Shopify ${this.shop} avvisade token (401). ${form ? `Värdet ${form}.` : 'Värdet har rätt form (shpat_…), så det är fel butik eller så är appen inte installerad.'}`
            + ` Rätt värde: custom-appen i just ${this.shop} → API credentials → "Admin API access token".`;
        }
        const fel = new Error(text);
        fel.status = svar.status;
        throw fel;
      }
      return { data: await svar.json(), link: svar.headers.get('link') };
    }
    throw new Error(`Shopify ${this.shop}: rate limit fyra gånger i rad.`);
  }

  /** Alla ordrar skapade sedan `sedan` (Date). Paginerar. */
  async hamtaOrdrar(sedan) {
    const falt = 'id,name,order_number,email,contact_email,created_at,financial_status,fulfillment_status,fulfillments,refunds,cancelled_at,total_price,currency,tags';
    let url = `https://${this.shop}/admin/api/${API_VERSION()}/orders.json?status=any&limit=250&created_at_min=${encodeURIComponent(new Date(sedan).toISOString())}&fields=${falt}`;
    const ut = [];
    while (url) {
      const { data, link } = await this.get(url);
      for (const o of data.orders ?? []) ut.push(normaliseraOrder(o));
      url = nastaSida(link);
    }
    return ut;
  }

  /** Tvister initierade sedan `sedan`. { tillganglig, lista, orsak }. */
  async hamtaTvister(sedan, ordrar = []) {
    const url = `https://${this.shop}/admin/api/${API_VERSION()}/shopify_payments/disputes.json`;
    try {
      const { data } = await this.get(url);
      const gr = new Date(sedan).getTime();
      const lista = (data.disputes ?? []).map((d) => normaliseraTvist(d, ordrar)).filter((d) => !d.initierad || d.initierad.getTime() >= gr);
      return { tillganglig: true, lista, orsak: null };
    } catch (e) {
      if (e.status === 401) return { tillganglig: false, lista: [], orsak: e.message };
      if (e.status === 403) return { tillganglig: false, lista: [], orsak: 'Shopify nekade tvisterna (403) — appen saknar scope read_shopify_payments_disputes' };
      if (e.status === 404) return { tillganglig: false, lista: [], orsak: 'Butiken använder inte Shopify Payments — tvister syns bara hos betalleverantören (Klarna/Stripe)' };
      throw e;
    }
  }
}
