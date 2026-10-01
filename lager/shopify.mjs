// lager/shopify.mjs — det lagerplanen behöver ur Shopify. LÄS-BARA.
//
//   • kostnad per vara (Cost per item) — så bundet kapital och orderkostnad blir kronor
//   • försäljning per vara senaste N dagar — för varor vars lager INTE står i CWD:s
//     ark (Matstrumpor 2026-10-01: sushilådan står på 0 där men skickas ändå)
//
// Nycklarna slås upp precis som sajten gör (stonebite/kallor/shopify.mjs): alla
// appar som pekar på butiken provas i tur och ordning.

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { upptackButiker, kandidatNycklar, mintaToken } from '../stonebite/kallor/shopify.mjs';
import { lasKostnader } from '../stonebite/kallor/vinst.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = '2025-07';

export const normNamn = (s) => String(s ?? '').toLowerCase().replace(/[–—-]/g, '-').replace(/\s+/g, ' ').trim();

async function token(butikId, env, fetchFn) {
  const butik = upptackButiker(ROT, env).find((b) => b.id === butikId);
  if (!butik) throw new Error(`butiken ${butikId} finns inte i sparning/butiker.json, factory/butiker eller miljön`);
  const fel = [];
  for (const nycklar of await kandidatNycklar(butik, env)) {
    try { return { ...(await mintaToken(butik, { env, fetchFn, nycklar })), via: nycklar.via }; } catch (e) { fel.push(`${nycklar.via}: ${e.message}`); }
  }
  throw new Error(`inga fungerande nycklar för ${butikId}${fel.length ? ` (${fel.join('; ')})` : ''}`);
}

/** Map(normaliserat "produkt|variant" → kostnad i butikens valuta). */
export async function kostnaderFor(butikId, { env = process.env, fetchFn = fetch } = {}) {
  const t = await token(butikId, env, fetchFn);
  const karta = await lasKostnader(t.shop, t.token, fetchFn);
  const ut = new Map();
  for (const [k, v] of karta) {
    if (!k.startsWith('namn:') || v.kostnad === null) continue;
    ut.set(normNamn(k.slice(5)), v.kostnad);
  }
  return { kostnader: ut, via: t.via };
}

/** CWD:s rad → kostnad ur någon av kartorna: först produkt + variant, sedan bara produkten. */
export function hittaKostnad(artikel, kartor) {
  const produkt = normNamn(artikel.namn);
  const variant = normNamn(artikel.spec);
  for (const { kostnader } of kartor) {
    if (variant && kostnader.has(`${produkt}|${variant}`)) return kostnader.get(`${produkt}|${variant}`);
    if (kostnader.has(`${produkt}|`)) return kostnader.get(`${produkt}|`);
    // Samma produkt med flera varianter men CWD anger ingen: ta varianten om alla kostar lika.
    const varianter = [...kostnader].filter(([k]) => k.startsWith(`${produkt}|`)).map(([, v]) => v);
    if (varianter.length && varianter.every((v) => v === varianter[0])) return varianter[0];
  }
  return null;
}

/**
 * Sålda enheter per produkt + variant och antal ordrar, `dagar` bakåt.
 * Avbrutna och test-ordrar räknas inte; återbetalda rader räknas med sin nuvarande mängd.
 */
export async function forsaljning(butikId, { dagar = 30, env = process.env, fetchFn = fetch, nu = new Date() } = {}) {
  const t = await token(butikId, env, fetchFn);
  const fran = new Date(nu.getTime() - dagar * 86_400_000).toISOString();
  let url = `https://${t.shop}/admin/api/${API}/orders.json?status=any&limit=250&created_at_min=${encodeURIComponent(fran)}&fields=created_at,cancelled_at,test,line_items`;
  const perVara = new Map();
  let ordrar = 0;
  for (let sida = 0; url && sida < 80; sida++) {
    const svar = await fetchFn(url, { headers: { 'X-Shopify-Access-Token': t.token } });
    if (svar.status === 429) { await new Promise((r) => setTimeout(r, 2000)); sida--; continue; }
    if (!svar.ok) throw new Error(`Shopify svarade ${svar.status} på ordrarna (${t.via})`);
    const j = await svar.json();
    for (const o of j.orders ?? []) {
      if (o.cancelled_at || o.test) continue;
      ordrar++;
      for (const li of o.line_items ?? []) {
        const antal = Number(li.current_quantity ?? li.quantity ?? 0);
        if (!antal) continue;
        const nyckel = `${li.title}${li.variant_title ? ` · ${li.variant_title}` : ''}`;
        const p = perVara.get(nyckel) ?? { vara: nyckel, produkt: li.title, variant: li.variant_title ?? '', enheter: 0, ordrar: 0 };
        p.enheter += antal;
        p.ordrar += 1;
        perVara.set(nyckel, p);
      }
    }
    const m = (svar.headers.get('link') ?? '').match(/<([^>]+)>;\s*rel="next"/);
    url = m ? m[1] : null;
  }
  return { butik: butikId, dagar, ordrar, varor: [...perVara.values()].sort((a, b) => b.enheter - a.enheter), via: t.via };
}
