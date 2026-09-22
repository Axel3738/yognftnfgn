// kallor/shopify.mjs — försäljningen per butik, direkt ur Shopify. LÄS-BARA:
// bara GET, ingenting skapas eller ändras.
//
// Butikerna UPPTÄCKS, listas aldrig för hand (samma regel som rutinerna i
// CLAUDE.md): sparning/butiker.json + factory/butiker/*.yaml. En ny butik
// dyker upp i dashboarden i samma sekund som någon av de filerna finns.
//
// Nycklarna löses med sparning/butik.mjs losNycklarFor, så det finns EN väg
// till Shopify-nycklarna i repot. En butik utan nycklar rapporteras med
// variabelnamnet som saknas — aldrig som noll försäljning.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { lasYaml } from '../../factory/yaml.mjs';
import { losNycklarFor } from '../../sparning/butik.mjs';
import { normaliseraDoman, suffixForDoman } from '../../factory/token.mjs';
import { dagnyckel, sistaDagarna } from '../berakna.mjs';

const API = '2025-07';

/**
 * Alla butiker vi kan läsa försäljning ur. Dubbletter slås ihop på domän.
 *
 * Tre källor, i den ordningen:
 *   1. sparning/butiker.json  — butikerna spårningen redan kör för
 *   2. factory/butiker/*.yaml — fabrikens OPS-butiker
 *   3. MILJÖN — varje SHOPIFY_SHOP_<suffix> som har id + secret bredvid sig
 *
 * Punkt 3 är den som gör listan sann i stället för snygg: butiksfilerna bär
 * inte alltid myshopify-adressen (HeimGuard, TankGuard, DryTrek …), och VA:n
 * döper nycklarna efter adressen, inte efter butiks-id:t. Har vi nycklar till
 * en butik ska den synas — även om ingen skrivit in den någonstans.
 */
export function upptackButiker(rot, env = process.env) {
  const ut = new Map();
  const lagg = (b) => {
    const nyckel = String(b.myshopify || b.id).toLowerCase();
    const fanns = ut.get(nyckel);
    if (!fanns) { ut.set(nyckel, b); return; }
    // Kompletterar en känd butik med det miljön vet (suffix), aldrig tvärtom.
    ut.set(nyckel, { ...b, ...fanns, suffix: fanns.suffix ?? b.suffix });
  };

  const register = join(rot, 'sparning', 'butiker.json');
  if (existsSync(register)) {
    const r = JSON.parse(readFileSync(register, 'utf8'));
    for (const [id, v] of Object.entries(r)) {
      if (id === 'comment' || !v || typeof v !== 'object') continue;
      lagg({
        id, namn: v.namn ?? id, url: v.url ?? '', myshopify: v.myshopify ?? '',
        ops: Boolean(v.ops), env_suffix: v.env_suffix ?? '', land: v.land ?? '', kalla: 'sparning/butiker.json',
      });
    }
  }

  const butiker = join(rot, 'factory', 'butiker');
  if (existsSync(butiker)) {
    for (const fil of readdirSync(butiker).filter((f) => f.endsWith('.yaml'))) {
      const id = fil.replace(/\.yaml$/, '');
      if (id === 'testbutiken') continue; // fabrikens provbutik, ingen verksamhet
      let b;
      try { b = lasYaml(readFileSync(join(butiker, fil), 'utf8'))?.butik; } catch { continue; }
      if (!b?.myshopify) continue;
      lagg({
        id, namn: b.brand ?? id, url: b.doman ? `https://${b.doman}` : '', myshopify: b.myshopify,
        ops: true, land: b.land ?? '', kalla: `factory/butiker/${fil}`,
      });
    }
  }

  // Miljön: varje butik vi faktiskt har nycklar till.
  for (const [nyckel, varde] of Object.entries(env)) {
    const m = /^SHOPIFY_SHOP_(.+)$/.exec(nyckel);
    if (!m) continue;
    const suffix = m[1];
    const doman = normaliseraDoman(varde);
    if (!doman.endsWith('.myshopify.com')) continue;
    if (!env[`SHOPIFY_CLIENT_ID_${suffix}`] || !env[`SHOPIFY_CLIENT_SECRET_${suffix}`]) continue;
    lagg({
      id: suffix.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      namn: null, // Shopify får säga vad butiken heter — vi gissar inte
      url: '', myshopify: doman, suffix, kalla: `miljön (SHOPIFY_SHOP_${suffix})`,
    });
  }

  return [...ut.values()];
}

/**
 * ALLA nyckeluppsättningar som pekar på butiken, i den ordning de ska provas.
 * En butik kan ha flera Shopify-appar med nycklar i miljön, och de får olika
 * saker: mätt 2026-09-22 på Bäverbutiken svarar appen bakom `SHOPIFY_*_SE`
 * 403 på ordrar ("requires merchant approval for read_orders") medan
 * spårningens app (`SHOPIFY_*_SE_BAVER_SE`, registrerad i sparning/butiker.json)
 * läser 900 ordrar i timmen. Därför provas de i tur och ordning, och 403 på
 * en app är aldrig slutet — bara nästa kandidat.
 *
 *   1. butikens registrerade suffix (sparning/butiker.json `env_suffix`) —
 *      den app spårningen redan läser ordrar med
 *   2. suffixet miljön bär för DOMÄNEN — det enda som är sant i varje
 *      container (Bäverbutikens nycklar heter `_SE_BAVER_SE` i rutinernas
 *      miljö och `_SE` i en vanlig session — samma butik, olika namn)
 *   3. varje annat suffix i miljön vars SHOPIFY_SHOP_ pekar på samma domän
 *   4. fabrikens nycklar (OPS-butikerna, listicle/butik.mjs)
 */
export async function kandidatNycklar(butik, env = process.env) {
  const ut = [];
  const sedda = new Set();
  const lagg = (k) => {
    if (!k?.shop || !k.clientId || !k.clientSecret) return;
    const id = `${k.shop}|${k.clientId}`;
    if (sedda.has(id)) return;
    sedda.add(id);
    ut.push(k);
  };
  const urSuffix = (suffix) => {
    if (!suffix || !env[`SHOPIFY_CLIENT_ID_${suffix}`] || !env[`SHOPIFY_CLIENT_SECRET_${suffix}`]) return null;
    return {
      shop: normaliseraDoman(env[`SHOPIFY_SHOP_${suffix}`] ?? butik.myshopify),
      clientId: env[`SHOPIFY_CLIENT_ID_${suffix}`],
      clientSecret: env[`SHOPIFY_CLIENT_SECRET_${suffix}`],
      via: `SHOPIFY_*_${suffix}`,
    };
  };

  if (butik.env_suffix) lagg(urSuffix(String(butik.env_suffix).trim()));
  const viaDoman = butik.myshopify ? suffixForDoman(butik.myshopify, env) : null;
  lagg(urSuffix(butik.suffix ?? viaDoman));
  const sokt = normaliseraDoman(butik.myshopify);
  if (sokt) {
    for (const [nyckel, varde] of Object.entries(env)) {
      const m = /^SHOPIFY_SHOP_(.+)$/.exec(nyckel);
      if (m && normaliseraDoman(varde) === sokt) lagg(urSuffix(m[1]));
    }
  }
  try {
    const k = await losNycklarFor(butik, env);
    if (k.shop && k.clientId && k.clientSecret) lagg({ ...k, shop: normaliseraDoman(k.shop), via: butik.ops ? 'fabrikens nycklar' : `SHOPIFY_*_${butik.env_suffix}` });
  } catch { /* inga fabriksnycklar — då finns de inte i listan */ }
  return ut;
}

/** Nycklarna för en butik: första kandidaten, eller tomma fält med `via: null`. */
export async function losNycklar(butik, env = process.env) {
  const [forsta] = await kandidatNycklar(butik, env);
  return forsta ?? { shop: butik.myshopify ?? '', clientId: '', clientSecret: '', via: null };
}

/** Variabelnamnen som saknas för butikens registrerade app — tom lista om de finns eller inget suffix är registrerat. */
export function saknadeRegistreradeNycklar(butik, env = process.env) {
  const s = String(butik.env_suffix ?? '').trim();
  if (!s) return [];
  return [`SHOPIFY_SHOP_${s}`, `SHOPIFY_CLIENT_ID_${s}`, `SHOPIFY_CLIENT_SECRET_${s}`].filter((n) => !env[n]);
}

/**
 * Felet när INGEN kandidat fick läsa ordrarna — en mening som säger vad som
 * är fel och vad som fixar det, aldrig bara "403". `provade` är
 * [{ via, fel }] i provordning. Ordet read_orders står kvar med flit:
 * stonebite/forklaring.mjs känner igen det.
 */
export function forklaraNyckelfel(butik, provade, env = process.env) {
  const kunddata = provade.filter((p) => /403|read_orders/.test(p.fel));
  const ovriga = provade.filter((p) => !kunddata.includes(p));
  if (!kunddata.length) return provade.map((p) => `${p.via}: ${p.fel}`).join(' · ');
  const appar = kunddata.map((p) => p.via).join(', ');
  const saknas = saknadeRegistreradeNycklar(butik, env);
  const atgard = saknas.length
    ? `Spårningen läser samma butik med appen bakom SHOPIFY_*_${String(butik.env_suffix).trim()} — lägg in ${saknas.join(', ')} i miljön, eller godkänn kunddata (Protected customer data access) för appen i dev.shopify.com.`
    : 'Godkänn kunddata (Protected customer data access) för appen i dev.shopify.com, eller lägg in nycklarna till en app som får läsa ordrar.';
  const rest = ovriga.length ? ` Prövade också ${ovriga.map((p) => `${p.via} (${p.fel})`).join(', ')}.` : '';
  return `Shopify-appen bakom ${appar} får inte läsa ordrar (403: merchant approval for read_orders saknas). ${atgard}${rest}`;
}

async function mintaToken(butik, { env = process.env, fetchFn = fetch, nycklar = null } = {}) {
  const k = nycklar ?? await losNycklar(butik, env);
  if (!k.shop || !k.clientId || !k.clientSecret) {
    const suffix = butik.suffix || butik.env_suffix || '<suffix>';
    throw new Error(`nycklarna saknas i miljön (SHOPIFY_SHOP_${suffix} + SHOPIFY_CLIENT_ID_${suffix} + SHOPIFY_CLIENT_SECRET_${suffix})`);
  }
  const svar = await fetchFn(`https://${k.shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: k.clientId, client_secret: k.clientSecret, grant_type: 'client_credentials' }),
  });
  const text = await svar.text();
  let j;
  try { j = JSON.parse(text); } catch { throw new Error(`token-svaret var inte JSON (${svar.status}) — appen är troligen inte installerad i ${k.shop}`); }
  if (!j.access_token) throw new Error(`kunde inte minta token: ${String(j.error_description || j.error || JSON.stringify(j)).slice(0, 160)}`);
  return { shop: k.shop, token: j.access_token };
}

async function get(url, token, fetchFn = fetch) {
  for (let forsok = 0; forsok < 4; forsok++) {
    const svar = await fetchFn(url, { headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' } });
    if (svar.status === 429) {
      await new Promise((r) => setTimeout(r, Number(svar.headers.get('retry-after') || 2) * 1000));
      continue;
    }
    if (!svar.ok) {
      const fel = new Error(`Shopify svarade ${svar.status}: ${(await svar.text()).slice(0, 200)}`);
      fel.status = svar.status;
      throw fel;
    }
    return { data: await svar.json(), link: svar.headers.get('link') };
  }
  throw new Error('Shopify strypte anropet fyra gånger i rad.');
}

function nastaSida(link) {
  const m = String(link ?? '').match(/<([^>]+)>;\s*rel="next"/);
  return m ? m[1] : null;
}

/**
 * En butiks försäljning per dag, `dagar` dagar bakåt (svensk dygnsgräns).
 * Avbrutna och test-ordrar räknas aldrig. Beloppet är orderns NUVARANDE
 * summa, så en återbetald order sjunker av sig själv.
 */
export async function hamtaButik(butik, { dagar = 30, env = process.env, fetchFn = fetch, nu = new Date() } = {}) {
  const kandidater = await kandidatNycklar(butik, env);
  if (!kandidater.length) await mintaToken(butik, { env, fetchFn }); // kastar "nycklarna saknas …" med variabelnamnen

  // Varje kandidat provas hela vägen till första ordersidan. 403 på ordrarna
  // (kunddata ej godkänd för just den appen) ⇒ nästa app. Alla andra fel
  // kastas direkt — de säger något om butiken, inte om appen.
  const provade = [];
  for (const nycklar of kandidater) {
    let shop; let token;
    try {
      ({ shop, token } = await mintaToken(butik, { env, fetchFn, nycklar }));
    } catch (e) {
      provade.push({ via: nycklar.via, fel: e.message });
      continue;
    }
    try {
      return { ...(await lasForsaljning({ butik, shop, token, dagar, nu, fetchFn })), via: nycklar.via };
    } catch (e) {
      if (e.status !== 403) throw e;
      provade.push({ via: nycklar.via, fel: `403 — ${String(e.message).replace(/^Shopify svarade 403:\s*/, '').slice(0, 120)}` });
    }
  }
  throw new Error(forklaraNyckelfel(butik, provade, env));
}

async function lasForsaljning({ butik, shop, token, dagar, nu, fetchFn }) {
  const { data: shopdata } = await get(`https://${shop}/admin/api/${API}/shop.json?fields=name,currency,domain,myshopify_domain`, token, fetchFn);
  const valuta = shopdata?.shop?.currency ?? 'SEK';

  const fran = new Date(nu.getTime() - dagar * 86_400_000);
  const falt = 'id,created_at,cancelled_at,test,current_total_price,total_price,currency,financial_status';
  let url = `https://${shop}/admin/api/${API}/orders.json?status=any&limit=250&created_at_min=${encodeURIComponent(fran.toISOString())}&fields=${falt}`;

  const perDag = new Map();
  for (const d of sistaDagarna(dagar, { nu })) perDag.set(d, { datum: d, omsattning: 0, ordrar: 0 });
  let ordrar = 0;
  let sidor = 0;
  while (url && sidor++ < 40) {
    const { data, link } = await get(url, token, fetchFn);
    for (const o of data.orders ?? []) {
      if (o.cancelled_at || o.test) continue;
      const nyckel = dagnyckel(new Date(o.created_at));
      const rad = perDag.get(nyckel);
      if (!rad) continue; // äldre än fönstret (Shopify rundar på tidszon)
      rad.omsattning += Number(o.current_total_price ?? o.total_price ?? 0);
      rad.ordrar += 1;
      ordrar += 1;
    }
    url = nastaSida(link);
  }

  const serie = [...perDag.values()];
  return {
    id: butik.id,
    namn: shopdata?.shop?.name || butik.namn || butik.id,
    url: butik.url || (shopdata?.shop?.domain ? `https://${shopdata.shop.domain}` : ''),
    shop,
    valuta,
    land: butik.land ?? '',
    dagar: serie,
    ordrar,
    status: 'ok',
    orsak: null,
  };
}

/** Alla butiker, en i taget (Shopify stryper parallella anrop hårt). */
export async function hamtaAlla(butiker, { dagar = 30, env = process.env, fetchFn = fetch, nu = new Date(), logg = () => {} } = {}) {
  const ut = [];
  for (const b of butiker) {
    try {
      const rad = await hamtaButik(b, { dagar, env, fetchFn, nu });
      logg(`  ${b.id}: ${rad.ordrar} ordrar / ${dagar} dagar (${rad.valuta})`);
      ut.push(rad);
    } catch (e) {
      logg(`  ${b.id}: ${e.message}`);
      ut.push({
        // Utan svar från Shopify vet vi inte vad butiken HETER. Då visas
        // adressen — den går att känna igen. Ett miljösuffix gör det inte.
        id: b.id, namn: b.namn || b.myshopify || b.id, url: b.url ?? '', shop: b.myshopify ?? '', valuta: null,
        land: b.land ?? '', dagar: [], ordrar: null, status: 'fel', orsak: e.message,
      });
    }
  }
  return ut;
}
