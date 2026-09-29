// akut/hamta.mjs — hämtarna. Allt som rör nätet ligger här, så domarna i
// kontroller.mjs kan testas utan det. Varje hämtare svarar alltid med ett
// läge — aldrig ett kast som fäller hela körningen: en sajt som inte svarar
// är själva mätvärdet.
//
// LÄS-BARA. Inget skapas, pausas eller ändras någonstans.

import { api as metaApi } from '../stonebite/kallor/meta.mjs';
import { kandidatNycklar, mintaToken } from '../stonebite/kallor/shopify.mjs';

const UA = 'Mozilla/5.0 (compatible; Akutlarmet/1.0; +https://www.stonebite.org)';
const paus = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET med tidsgräns. Svarar { ok, status, url, text, fel } — kastar aldrig. */
export async function hamtaMedTidsgrans(url, { fetchFn = fetch, timeout = 20_000, headers = {} } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetchFn(url, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA, Accept: 'text/html,application/json;q=0.9,*/*;q=0.8', ...headers } });
    const text = await r.text().catch(() => '');
    return { ok: r.ok, status: r.status, url: r.url || url, text, fel: null };
  } catch (e) {
    return { ok: false, status: null, url, text: '', fel: e.name === 'AbortError' ? `ingen respons på ${Math.round(timeout / 1000)} s` : e.message };
  } finally {
    clearTimeout(timer);
  }
}

/** Ser svaret ut som Shopifys lösenordssida? Adressen slutar på /password, eller sidan bär lösenordsformuläret. */
export function arLosenordssida(svar) {
  try { if (new URL(svar.url).pathname.replace(/\/$/, '').endsWith('/password')) return true; } catch { /* ingen url */ }
  return /template-password|id="password"[^>]*class=|action="\/password"|form-password/i.test(String(svar.text ?? '').slice(0, 20000));
}

/**
 * En sajt, `forsok` gånger med paus emellan tills den svarar. Svarar
 * { ok, status, slutUrl, fel, losenord, forsok, ms }. Ett 2xx/3xx som inte är
 * lösenordssidan är ok. 402 (Unavailable Shop) är aldrig ok.
 */
export async function hamtaSajt(url, { fetchFn = fetch, forsok = 3, pausMs = 10_000, timeout = 20_000 } = {}) {
  let sista = null;
  const t0 = Date.now();
  for (let i = 1; i <= forsok; i++) {
    const s = await hamtaMedTidsgrans(url, { fetchFn, timeout });
    const losenord = s.ok && arLosenordssida(s);
    sista = { ok: s.ok && !losenord, status: s.status, slutUrl: s.url, fel: s.fel, losenord, forsok: i, ms: Date.now() - t0 };
    if (sista.ok) break;
    if (i < forsok && pausMs) await paus(pausMs);
  }
  return sista;
}

/** Alla sajter parallellt. sajter: [{ id, namn, url, verksamhet }] → samma + resultat. */
export async function hamtaSajter(sajter, opt = {}) {
  return Promise.all(sajter.map(async (s) => ({ ...s, resultat: await hamtaSajt(s.url, opt) })));
}

/**
 * Meta: kontots status + dagens kampanjer, per konto i tur och ordning (det
 * delade OPS-kontot stryps lätt). Kod 190 = token död ⇒ resten hoppas, ett
 * fel räcker. Strypt (17/4/613) ⇒ kontot hoppas med orsak.
 * konton: [{ id, namn, verksamhet }] → [{ …, konto, kampanjer, fel }]
 */
export async function hamtaMetaKonton(konton, { env = process.env, fetchFn = fetch, logg = () => {} } = {}) {
  const ut = [];
  let tokenDod = null;
  for (const k of konton) {
    if (tokenDod) { ut.push({ ...k, konto: null, kampanjer: null, fel: tokenDod }); continue; }
    try {
      const konto = await metaApi(`act_${k.id}`, { fields: 'account_id,name,account_status,disable_reason,currency,spend_cap,amount_spent' }, { env, fetchFn });
      const j = await metaApi(`act_${k.id}/insights`, { level: 'campaign', date_preset: 'today', fields: 'campaign_id,campaign_name,spend,actions,purchase_roas', limit: 200 }, { env, fetchFn });
      // dag = Metas eget dygn (kontots tidszon, UK-kontot går på London). Nyckeln för
      // "pengar brinner" bär det, inte svenskt datum — annars blev samma dygn ett
      // nytt larm när svensk tid passerat midnatt (mätt 2026-09-28 00:29).
      const kampanjer = (j.data ?? []).map((r) => ({
        id: r.campaign_id, namn: r.campaign_name, spend: Number(r.spend) || 0, dag: r.date_start ?? null,
        kop: Number((r.actions ?? []).find((a) => a.action_type === 'omni_purchase')?.value) || 0,
        roas: (() => { const x = (r.purchase_roas ?? []).find((a) => a.action_type === 'omni_purchase'); return x ? Number(x.value) || 0 : null; })(),
      }));
      logg(`  Meta ${konto.name ?? k.namn} (${k.id}): status ${konto.account_status}, ${kampanjer.length} kampanjer med spend i dag`);
      ut.push({ ...k, namn: konto.name ?? k.namn, valuta: konto.currency ?? null, konto, kampanjer, fel: null });
    } catch (e) {
      const fel = { kod: e.kod ?? null, message: e.message, strypt: Boolean(e.strypt) };
      if (fel.kod === 190) tokenDod = fel;
      logg(`  Meta ${k.namn} (${k.id}): ${e.message}`);
      ut.push({ ...k, konto: null, kampanjer: null, fel });
    }
  }
  return ut;
}

/** /halsa på sajten, med direktadressen som reserv. Svarar { url, svar, reserv, svarReserv }. */
export async function hamtaHalsa({ url, reserv }, { fetchFn = fetch, timeout = 20_000 } = {}) {
  const las = async (u) => {
    if (!u) return null;
    const s = await hamtaMedTidsgrans(u, { fetchFn, timeout, headers: { Accept: 'application/json' } });
    let json = null;
    if (s.ok) { try { json = JSON.parse(s.text); } catch { json = null; } }
    return { ok: s.ok && json?.ok === true, status: s.status, json, fel: s.fel ?? (s.ok && !json ? 'svaret var inte JSON' : null) };
  };
  const svar = await las(url);
  const svarReserv = svar?.ok ? null : await las(reserv);
  return { url, reserv, svar, svarReserv };
}

/** Notion: GET /v1/users/me. Svarar { status, fel }. */
export async function kollaNotion({ env = process.env, fetchFn = fetch, timeout = 20_000 } = {}) {
  if (!env.NOTION_TOKEN) return { status: null, fel: 'NOTION_TOKEN saknas i miljön' };
  const s = await hamtaMedTidsgrans('https://api.notion.com/v1/users/me', {
    fetchFn, timeout, headers: { Authorization: `Bearer ${env.NOTION_TOKEN}`, 'Notion-Version': '2022-06-28', Accept: 'application/json' },
  });
  return { status: s.status, fel: s.fel };
}

/**
 * Shopify Payments-utbetalningarna per butik, bäst-ansträngning: en app utan
 * read_shopify_payments_payouts svarar 403 ⇒ butiken hoppas med orsak.
 * butiker = upptackButiker() (inte avstängda). → [{ id, namn, verksamhet, status, orsak, payouts }]
 */
export async function hamtaUtbetalningar(butiker, { env = process.env, fetchFn = fetch, logg = () => {}, verksamhetFor = () => null } = {}) {
  const ut = [];
  for (const b of butiker) {
    if (b.av) continue;
    const rad = { id: b.id, namn: b.namn ?? b.id, verksamhet: verksamhetFor(b), status: 'hoppad', orsak: null, payouts: [] };
    try {
      const [nycklar] = await kandidatNycklar(b, env);
      if (!nycklar) { rad.orsak = 'inga Shopify-nycklar i miljön'; ut.push(rad); continue; }
      const { shop, token } = await mintaToken(b, { env, fetchFn, nycklar });
      const r = await fetchFn(`https://${shop}/admin/api/2025-07/shopify_payments/payouts.json?limit=10`, { headers: { 'X-Shopify-Access-Token': token, Accept: 'application/json' } });
      if (r.status === 403) { rad.orsak = 'appen får inte läsa utbetalningar (read_shopify_payments_payouts)'; ut.push(rad); continue; }
      if (r.status === 404) { rad.orsak = 'butiken kör inte Shopify Payments'; ut.push(rad); continue; }
      if (!r.ok) { rad.orsak = `Shopify svarade ${r.status}`; ut.push(rad); continue; }
      const j = await r.json();
      rad.status = 'ok';
      rad.payouts = (j.payouts ?? []).map((p) => ({ id: String(p.id), status: p.status, date: p.date, amount: Number(p.amount) || 0, currency: p.currency ?? null }));
      logg(`  utbetalningar ${b.id}: ${rad.payouts.length} lästa, ${rad.payouts.filter((p) => p.status === 'failed').length} misslyckade`);
    } catch (e) {
      rad.orsak = e.message;
    }
    ut.push(rad);
  }
  return ut;
}
