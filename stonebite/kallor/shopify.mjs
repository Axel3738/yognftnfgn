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
/**
 * Butiker Axel stängt med flit (stonebite/butiker-av.json): de ska varken
 * hämtas eller räknas som saknade. Tom karta om filen saknas.
 */
export function lasAvstangda(rot) {
  try {
    const r = JSON.parse(readFileSync(join(rot, 'stonebite', 'butiker-av.json'), 'utf8'));
    return new Map(Object.entries(r.av ?? {}).map(([id, v]) => [id.toLowerCase(), { ...v, id }]));
  } catch {
    return new Map();
  }
}

export function upptackButiker(rot, env = process.env) {
  const ut = new Map();
  const avstangda = lasAvstangda(rot);
  const lagg = (b) => {
    const nyckel = String(b.myshopify || b.id).toLowerCase();
    const fanns = ut.get(nyckel);
    if (!fanns) { ut.set(nyckel, b); return; }
    // Kompletterar en känd butik med det miljön vet (suffix), aldrig tvärtom.
    ut.set(nyckel, { ...b, ...fanns, suffix: fanns.suffix ?? b.suffix });
  };
  // Efter upptäckten: en butik i av-registret (på id ELLER domän) märks `av`
  // med orsaken — hamtaAlla hämtar den inte, sidan visar den som avstängd.
  const markAv = () => {
    for (const [nyckel, b] of ut) {
      const av = avstangda.get(String(b.id).toLowerCase())
        ?? [...avstangda.values()].find((v) => v.myshopify && normaliseraDoman(v.myshopify) === normaliseraDoman(b.myshopify));
      if (av) ut.set(nyckel, { ...b, namn: b.namn || av.namn || b.id, av: true, avOrsak: av.orsak ?? 'avstängd med flit' });
    }
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

  markAv();
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

export async function mintaToken(butik, { env = process.env, fetchFn = fetch, nycklar = null } = {}) {
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
    // Avstängd med flit (stonebite/butiker-av.json): inget anrop, ingen "saknas".
    if (b.av) {
      logg(`  ${b.id}: avstängd med flit — ${b.avOrsak}`);
      ut.push({ id: b.id, namn: b.namn || b.myshopify || b.id, url: b.url ?? '', shop: b.myshopify ?? '', valuta: null, land: b.land ?? '', dagar: [], ordrar: null, status: 'av', orsak: b.avOrsak });
      continue;
    }
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

// ------------------------------------------------------------------ tvister
//
// Tvisterna läses DIREKT ur Shopify vid varje hämtning (varje timme), inte ur
// kundtjänstens veckorapport. ⚠️ Mätt 2026-09-23: sajtens tvister kom ur
// `kundtjanst/korningar/<brand>/<vecka>.json`, och den enda rapport som fanns
// var Bäverbutikens från 2026-09-14 — rutinen "Kundtjänst veckorapport" stod
// `enabled: false` sedan 2026-09-15. Sajten visade alltså nio dagar gamla
// tvister för Bäverbutiken och "Inga öppna tvister" för CaraShell utan att ha
// frågat Shopify alls (det råkade vara sant: 290 ordrar, 0 tvister, läst samma
// dag). En tvist har en deadline; en veckogammal lista är en lista över
// deadlines som redan kan ha passerat.

/** Så långt bakåt tvisterna läses — samma som kundtjanst/tvistkoll.mjs. */
export const TVISTFONSTER_DAGAR = 180;
const OPPNA_TVISTER = ['needs_response', 'under_review'];

/**
 * En Shopify-tvist → sajtens rad. Samma form som bonus/kallor.mjs
 * kundtjanstMatningar så att allt som läser `snapshot.oppnaTvister` (larmet,
 * kalendern, varumärkessidan, bonusen, kundtjänstens rapportsida) fungerar
 * oförändrat. Status skrivs med mellanslag ("needs response") som i
 * veckorapporterna. Ren.
 */
export function tvistRad(d, { butikId, ordernamn = new Map(), hamtad = null } = {}) {
  const status = String(d.status ?? '');
  const namn = ordernamn.get(String(d.order_id)) ?? null;
  return {
    // Tvistens eget id: en order kan bära två tvister (mätt 2026-09-23:
    // Bäverbutiken #5053, 348 kr + 255 kr, samma deadline).
    tvistId: d.id ? String(d.id) : null,
    order: namn ?? (d.order_id ? String(d.order_id) : null),
    orderId: d.order_id ? String(d.order_id) : null,
    brand: butikId,
    typ: d.type ?? 'chargeback',
    orsak: d.reason ? String(d.reason).replace(/_/g, ' ') : null,
    belopp: Number(d.amount ?? 0),
    valuta: d.currency ?? null,
    deadline: d.evidence_due_by ? String(d.evidence_due_by).slice(0, 10) : null,
    initierad: d.initiated_at ? String(d.initiated_at).slice(0, 10) : null,
    status: status.replace(/_/g, ' '),
    // `under_review` = bevisen är inskickade och Shopify har låst svaret. Den
    // är öppen men inte VA:ns att göra något åt (tvistkoll.mjs BEHOVER_SVAR).
    besvarad: status !== 'needs_response',
    utfall: ['won', 'lost'].includes(status) ? status : null,
    oppen: OPPNA_TVISTER.includes(status),
    kalla: 'shopify',
    hamtad,
  };
}

/**
 * Alla tvister för EN butik. Provar apparna i samma ordning som försäljningen
 * (`kandidatNycklar`); 403 på tvisterna ⇒ nästa app. Returnerar alltid ett
 * läge — aldrig ett kast — så att en butik utan tvistbehörighet inte fäller
 * hela hämtningen:
 *   ok      — lästa (lista kan vara tom: då HAR butiken inga tvister)
 *   saknas  — 404: butiken kör inte Shopify Payments, tvisterna finns hos
 *             betalleverantören
 *   fel     — ingen app fick läsa, orsaken står i klartext
 *
 * ⚠️ Pagineras: Shopify ger 50 tvister per sida som standard. Mätt 2026-09-23
 * på Bäverbutiken: första sidan 50, hela listan 68 — tvistkollen läste bara 50.
 */
export async function hamtaTvister(butik, { env = process.env, fetchFn = fetch, nu = new Date(), fonsterDagar = TVISTFONSTER_DAGAR } = {}) {
  const hamtad = new Date(nu).toISOString();
  const kandidater = await kandidatNycklar(butik, env);
  if (!kandidater.length) {
    const suffix = butik.suffix || butik.env_suffix || '<suffix>';
    return { status: 'fel', orsak: `nycklarna saknas i miljön (SHOPIFY_SHOP_${suffix} + SHOPIFY_CLIENT_ID_${suffix} + SHOPIFY_CLIENT_SECRET_${suffix})`, via: null, lista: [], hamtad };
  }
  const provade = [];
  for (const nycklar of kandidater) {
    let shop; let token;
    try {
      ({ shop, token } = await mintaToken(butik, { env, fetchFn, nycklar }));
    } catch (e) {
      provade.push(`${nycklar.via}: ${e.message}`);
      continue;
    }
    let raa = [];
    try {
      let url = `https://${shop}/admin/api/${API}/shopify_payments/disputes.json?limit=250`;
      let sidor = 0;
      while (url && sidor++ < 20) {
        const { data, link } = await get(url, token, fetchFn);
        raa.push(...(data.disputes ?? []));
        url = nastaSida(link);
      }
    } catch (e) {
      if (e.status === 404) return { status: 'saknas', orsak: 'Butiken kör inte Shopify Payments — tvisterna finns bara hos betalleverantören.', via: nycklar.via, lista: [], hamtad };
      if (e.status === 403) { provade.push(`${nycklar.via}: 403 — appen får inte läsa tvister (read_shopify_payments_disputes)`); continue; }
      provade.push(`${nycklar.via}: ${e.message}`);
      continue;
    }

    // Fönstret: 180 dagar bakåt på startdatum — men en tvist som fortfarande
    // är öppen följer alltid med, hur gammal den än är.
    const grans = new Date(nu).getTime() - fonsterDagar * 86_400_000;
    raa = raa.filter((d) => OPPNA_TVISTER.includes(d.status) || !d.initiated_at || Date.parse(d.initiated_at) >= grans);

    // Ordernamnen (#5763) i EN fråga per 250 tvister. 403 (appen får inte läsa
    // ordrar) ⇒ id:t står kvar som order, det är fortfarande en nyckel.
    const ordernamn = new Map();
    const ids = [...new Set(raa.map((d) => d.order_id).filter(Boolean).map(String))];
    for (let i = 0; i < ids.length; i += 250) {
      try {
        const bit = ids.slice(i, i + 250).join(',');
        const { data } = await get(`https://${shop}/admin/api/${API}/orders.json?status=any&limit=250&ids=${bit}&fields=id,name`, token, fetchFn);
        for (const o of data.orders ?? []) ordernamn.set(String(o.id), o.name);
      } catch { break; }
    }

    const lista = raa.map((d) => tvistRad(d, { butikId: butik.id, ordernamn, hamtad }));
    return { status: 'ok', orsak: null, via: nycklar.via, lista, hamtad };
  }
  return { status: 'fel', orsak: provade.join(' · '), via: null, lista: [], hamtad };
}

/**
 * Tvisterna i alla butiker, en i taget. Avstängda med flit hoppas. Varje
 * butik får en rad i `butiker` (läget, antal, öppna, väntar på svar) och alla
 * lästa tvister hamnar i `lista`. Butiker vars tvister inte gick att läsa
 * rapporteras med orsak — aldrig som noll tvister.
 */
export async function hamtaAllaTvister(butiker, { env = process.env, fetchFn = fetch, nu = new Date(), logg = () => {} } = {}) {
  const rader = [];
  const lista = [];
  for (const b of butiker) {
    if (b.av) continue;
    const r = await hamtaTvister(b, { env, fetchFn, nu });
    const oppna = r.lista.filter((x) => x.oppen).length;
    const behoverSvar = r.lista.filter((x) => x.oppen && !x.besvarad).length;
    rader.push({ id: b.id, namn: b.namn || b.myshopify || b.id, status: r.status, orsak: r.orsak, via: r.via, antal: r.lista.length, oppna, behoverSvar, hamtad: r.hamtad });
    lista.push(...r.lista);
    logg(r.status === 'ok'
      ? `  ${b.id}: ${r.lista.length} tvister, ${oppna} öppna, ${behoverSvar} väntar på svar`
      : `  ${b.id}: tvisterna ${r.status === 'saknas' ? 'finns inte i Shopify' : 'okända'} — ${String(r.orsak).slice(0, 160)}`);
  }
  const lasta = rader.filter((r) => r.status === 'ok' || r.status === 'saknas');
  return {
    status: !rader.length ? 'saknas' : lasta.length === 0 ? 'fel' : lasta.length < rader.length ? 'delvis' : 'ok',
    orsak: lasta.length < rader.length ? `${rader.length - lasta.length} av ${rader.length} butiker gick inte att läsa tvisterna för` : null,
    hamtad: new Date(nu).toISOString(),
    fonsterDagar: TVISTFONSTER_DAGAR,
    butiker: rader,
    lista,
  };
}
