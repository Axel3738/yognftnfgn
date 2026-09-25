// Riktiga Judge.me-recensioner till citatblocken. Copyn får aldrig hitta på en
// recension (ARKITEKTUR → citat), så det enda som visas är det kunden skrev:
// 4-5 stjärnor, publicerad, inte dold, inte spam, ordagrant (kortad vid
// ordgräns till högst 220 tecken), namnet som förnamn + initial.
//
// Två källor, valda per brand (`brand.recensioner.kalla`):
//   'judgeme-api'    (standard, Bäverbutiken): https://api.judge.me/api/v1/reviews
//                    med api_token + shop_domain (JUDGEME_API_TOKEN, JUDGEME_SHOP_DOMAIN
//                    — samma som bonus/kallor.mjs). /reviews filtrerar på Judge.me:s
//                    EGET produkt-id, så butikens recensioner läses sidvis och kopplas
//                    till handle via `product_external_id` = Shopifys produkt-id.
//   'judgeme-widget' (Matstrumpor, 2026-09-25): butiken har Judge.me men ingen egen
//                    API-nyckel i miljön. Widgetens publika JSON
//                    https://judge.me/reviews/reviews_for_widget?…&product_id=<Shopify-id>
//                    ger samma recensioner som visas på produktsidan (body_html, rating,
//                    reviewer_name, verified_buyer, created_at), en fråga per produkt.
//                    Mätt 2026-09-25: sushi-strumpor 8 recensioner, snitt 4,5.
//   'ingen'          citatblocken utgår med en varning.
//
// Cache: klaviyo/output/<brand>/recensioner.json. `offline` läser bara den.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { ROT } from './mallar.mjs';

export const MAX_TECKEN = 220;
export const PER_HANDLE = 5;
export const WIDGET_URL = 'https://judge.me/reviews/reviews_for_widget';

export function cacheSokvag(brandId, rot = ROT) {
  return join(rot, 'klaviyo', 'output', brandId, 'recensioner.json');
}

/** Källan för ett brand. Utan `recensioner` i brandfilen: Judge.me:s API med de delade miljövariablerna. */
export function recensionsKalla(brand) {
  const r = typeof brand === 'object' ? brand?.recensioner : null;
  if (!r) return { kalla: 'judgeme-api', token_env: 'JUDGEME_API_TOKEN', domain_env: 'JUDGEME_SHOP_DOMAIN' };
  if (r.kalla === 'ingen') return { kalla: 'ingen' };
  if (r.kalla === 'judgeme-widget') return { kalla: 'judgeme-widget', shop_domain: r.shop_domain ?? null };
  return { kalla: 'judgeme-api', token_env: r.token_env ?? 'JUDGEME_API_TOKEN', domain_env: r.domain_env ?? 'JUDGEME_SHOP_DOMAIN' };
}

// "Anna Berg" → "Anna B.", "anna" → "Anna". Tomt → "Verifierad kund".
export function kortNamn(namn) {
  const delar = String(namn ?? '').trim().split(/\s+/).filter(Boolean);
  if (!delar.length) return 'Verifierad kund';
  const stor = (s) => s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1);
  const fornamn = stor(delar[0]);
  const efter = delar[delar.length - 1];
  return delar.length > 1 ? `${fornamn} ${efter.charAt(0).toLocaleUpperCase('sv-SE')}.` : fornamn;
}

// Ordagrant, men kortat vid ordgräns. Radbrytningar blir mellanslag.
export function kortaText(text, max = MAX_TECKEN) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const klipp = t.slice(0, max - 1);
  const sista = klipp.lastIndexOf(' ');
  return `${(sista > max * 0.5 ? klipp.slice(0, sista) : klipp).replace(/[,.;:!?\s]+$/, '')}…`;
}

/** Widgetens body_html → ren text (taggar bort, entiteter tillbaka). */
export function avHtml(html) {
  return String(html ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Widgetens recensioner → samma rader som Judge.me:s API ger (så sorteraRecensioner tar båda). */
export function widgetTillRader(svar, produktId) {
  return (svar?.reviews ?? []).map((r) => ({
    product_external_id: svar.product_external_id ?? produktId,
    rating: r.rating,
    body: avHtml(r.body_html ?? r.body),
    reviewer: { name: r.reviewer_name },
    published: true,
    hidden: false,
    verified_buyer: r.verified_buyer ?? null,
    created_at: r.created_at ?? null,
  }));
}

// Judge.me-rader → { handle: [{ namn, betyg, text, datum }] }, bästa först
// (5 stjärnor före 4, sedan nyast), högst PER_HANDLE per produkt.
export function sorteraRecensioner(rader, produkter) {
  const perId = new Map(produkter.map((p) => [String(p.id), p.handle]));
  const ut = {};
  for (const r of rader) {
    if (!r || r.published === false || r.hidden || r.curated === 'spam') continue;
    const betyg = Number(r.rating) || 0;
    if (betyg < 4) continue;
    const text = String(r.body ?? '').trim();
    if (text.length < 15) continue;
    const handle = perId.get(String(r.product_external_id)) ?? r.product_handle ?? null;
    if (!handle) continue;
    (ut[handle] ??= []).push({ namn: kortNamn(r.reviewer?.name), betyg, text: kortaText(text), datum: r.created_at ?? null });
  }
  for (const h of Object.keys(ut)) {
    ut[h] = ut[h].sort((a, b) => b.betyg - a.betyg || String(b.datum).localeCompare(String(a.datum))).slice(0, PER_HANDLE);
  }
  return ut;
}

async function hamtaAlla({ token, shop, fetchFn, maxSidor }) {
  const rader = [];
  for (let sida = 1; sida <= maxSidor; sida++) {
    const u = new URL('https://api.judge.me/api/v1/reviews');
    u.searchParams.set('api_token', token);
    u.searchParams.set('shop_domain', shop);
    u.searchParams.set('per_page', '100');
    u.searchParams.set('page', String(sida));
    const r = await fetchFn(u);
    if (!r.ok) throw new Error(`Judge.me svarade ${r.status}`);
    const j = await r.json();
    const sidan = j.reviews ?? [];
    rader.push(...sidan);
    if (sidan.length < 100) break;
  }
  return rader;
}

// En fråga per produkt mot widgetens publika JSON. Produkter utan Shopify-id hoppas.
export async function hamtaViaWidget({ shop, produkter, fetchFn, perProdukt = 10 }) {
  if (!shop) throw new Error('recensioner.shop_domain saknas i brandfilen (myshopify-domänen).');
  const rader = [];
  for (const p of produkter) {
    if (!p?.id) continue;
    const u = new URL(WIDGET_URL);
    u.searchParams.set('url', shop);
    u.searchParams.set('shop_domain', shop);
    u.searchParams.set('platform', 'shopify');
    u.searchParams.set('per_page', String(perProdukt));
    u.searchParams.set('product_id', String(p.id));
    const r = await fetchFn(u);
    if (!r.ok) throw new Error(`Judge.me-widgeten svarade ${r.status} för ${p.handle}`);
    rader.push(...widgetTillRader(await r.json(), p.id));
  }
  return rader;
}

// → { recensioner: { handle: [...] }, kalla: 'live'|'cache'|'saknas', varningar }
export async function hamtaRecensionerCache({ brand, produkter = [], offline = false, rot = ROT, env = process.env, fetchFn = fetch, maxSidor = 40 } = {}) {
  const id = typeof brand === 'string' ? brand : brand.id;
  const cache = cacheSokvag(id, rot);
  const varningar = [];
  const k = recensionsKalla(brand);
  if (k.kalla === 'ingen') {
    varningar.push('Brandet har inga recensioner att hämta (recensioner.kalla: ingen): citatblocken utgår.');
    return { recensioner: {}, kalla: 'saknas', varningar };
  }
  if (!offline) {
    try {
      let rader = null;
      if (k.kalla === 'judgeme-widget') {
        rader = await hamtaViaWidget({ shop: k.shop_domain, produkter, fetchFn });
      } else {
        const token = env[k.token_env];
        const shop = env[k.domain_env];
        if (!token || !shop) varningar.push(`${k.token_env} eller ${k.domain_env} saknas, recensionerna läses ur cachen.`);
        else rader = await hamtaAlla({ token, shop, fetchFn, maxSidor });
      }
      if (rader) {
        const recensioner = sorteraRecensioner(rader, produkter);
        mkdirSync(dirname(cache), { recursive: true });
        writeFileSync(cache, JSON.stringify({ hamtad: new Date().toISOString(), kalla: k.kalla, lasta: rader.length, recensioner }, null, 1) + '\n');
        return { recensioner, kalla: 'live', varningar };
      }
    } catch (e) {
      varningar.push(`Judge.me gick inte att läsa (${e.message}), recensionerna läses ur cachen.`);
    }
  }
  if (existsSync(cache)) {
    const d = JSON.parse(readFileSync(cache, 'utf8'));
    return { recensioner: d.recensioner ?? {}, kalla: 'cache', varningar };
  }
  varningar.push('Inga recensioner (ingen cache): citatblocken utgår.');
  return { recensioner: {}, kalla: 'saknas', varningar };
}
