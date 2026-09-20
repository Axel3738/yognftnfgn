// Butiken spårningen kör för: konfiguration, filer och Shopify-klient.
//
// Axels order 2026-09-20 kväll: "lägg in spårningssystemet i alla" — CaraShell
// (OPS), beverbutikken.no, bæverbutiken.dk och majavakauppa.fi. Registret är
// sparning/butiker.json; Bäverbutiken är standard och bär sina filer i
// sparning/ precis som förut (rutinen på main pekar dit), de andra får
// sparning/butiker/<id>/.
//
//   node sparning/kor.mjs --butik carashell
//   node sparning/publicera.mjs --butik beverbutikken --torr
//
// Nycklarna: env_suffix ⇒ SHOPIFY_CLIENT_ID_<suffix> + SHOPIFY_CLIENT_SECRET_<suffix>
// (shop-domänen står i registret — SHOPIFY_SHOP_<suffix> finns inte för alla,
// Bäverbutikens id/secret heter _SE_BAVER_SE men domänen ligger under _SE);
// ops: true ⇒ fabrikens nycklar via listicle/butik.mjs losButik(id).
// Samma 17TRACK-konto och TRACK17_API_KEY för alla butiker — kvoten räknas
// per paket, inte per butik.
//
// Klienten mintar en token med client credentials (som mejl/shopify.mjs) och
// kastar på HTTP-fel, GraphQL-fel och userErrors. Ingen hemlighet loggas.

import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
const REGISTER = join(ROT, 'butiker.json');
const API_VERSION = '2025-07';

export const KRAVDA_SCOPES = ['read_orders', 'write_fulfillments', 'write_content'];

export function allaButiker(fil = REGISTER) {
  const r = JSON.parse(readFileSync(fil, 'utf8'));
  return Object.entries(r)
    .filter(([id, v]) => id !== 'comment' && v && typeof v === 'object')
    .map(([id, v]) => ({ id, ...v }));
}

// Butiks-id ur kommandoraden (--butik <id>), annars standardbutiken.
export function butikIdUr(arg = process.argv.slice(2)) {
  const ix = arg.indexOf('--butik');
  if (ix > -1) {
    const id = arg[ix + 1];
    if (!id || id.startsWith('--')) throw new Error('--butik vill ha ett butiks-id (node sparning/butik.mjs --lista).');
    return id;
  }
  return null;
}

export function lasButik(id = null, fil = REGISTER) {
  const alla = allaButiker(fil);
  const b = id ? alla.find((x) => x.id === id) : alla.find((x) => x.standard);
  if (!b) {
    throw new Error(`Okänd butik "${id}". Finns: ${alla.map((x) => x.id).join(', ')} (sparning/butiker.json).`);
  }
  return {
    ...b,
    sprak: b.sprak || 'sv',
    land: b.land || 'Sverige',
    prefix: b.prefix || 'BB-',
    handle: b.handle || 'spara',
    titel: b.titel || 'Spåra ditt paket',
    url: String(b.url || '').replace(/\/+$/, ''),
    standard: Boolean(b.standard),
  };
}

// Var butikens filer bor. Standardbutiken: sparning/ (oförändrat). Övriga:
// sparning/butiker/<id>/ — lage.json committas, output/ är gitignorerad.
export function filerFor(butik) {
  const mapp = butik.standard ? ROT : join(ROT, 'butiker', butik.id);
  return {
    mapp,
    lage: join(mapp, 'lage.json'),
    konfig: butik.standard ? join(ROT, 'konfig.json') : join(mapp, 'konfig.json'),
    output: join(mapp, 'output'),
    paketfil: join(mapp, 'output', 'paket.json'),
  };
}

export function skapaMappar(butik) {
  const f = filerFor(butik);
  mkdirSync(f.output, { recursive: true });
  return f;
}

// Nycklarna ur miljön — bara NAMNEN härleds här.
export function nyckelnamn(butik) {
  if (butik.ops) return { via: 'ops', beskrivning: `fabrikens nycklar för ${butik.id} (listicle/butik.mjs losButik)` };
  const s = String(butik.env_suffix || '').trim();
  return {
    via: 'env',
    id: `SHOPIFY_CLIENT_ID_${s}`,
    secret: `SHOPIFY_CLIENT_SECRET_${s}`,
    beskrivning: `SHOPIFY_CLIENT_ID_${s} + SHOPIFY_CLIENT_SECRET_${s}`,
  };
}

export async function losNycklarFor(butik, env = process.env) {
  if (butik.ops) {
    const { losButik } = await import('../listicle/butik.mjs');
    const k = losButik(butik.id, env);
    return { shop: k.shop || butik.myshopify, clientId: k.clientId, clientSecret: k.clientSecret };
  }
  const n = nyckelnamn(butik);
  return { shop: butik.myshopify, clientId: env[n.id] || '', clientSecret: env[n.secret] || '' };
}

// Klienten. `kolla()` läser appens scopes och butikens kontaktmejl.
export async function skapaKlient(butik, { env = process.env, fetchFn = fetch } = {}) {
  const k = await losNycklarFor(butik, env);
  const n = nyckelnamn(butik);
  if (!k.shop || !k.clientId || !k.clientSecret) {
    const saknas = [!k.shop && 'myshopify i sparning/butiker.json', !k.clientId && (n.id ?? 'client id'), !k.clientSecret && (n.secret ?? 'client secret')].filter(Boolean);
    throw new Error(`${butik.namn}: saknar ${saknas.join(', ')} i miljön (Environments på claude.ai — syns först i en ny container).`);
  }
  const tr = await fetchFn(`https://${k.shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: k.clientId, client_secret: k.clientSecret, grant_type: 'client_credentials' }),
  });
  const text = await tr.text();
  let t;
  try { t = JSON.parse(text); } catch {
    const m = /<title>([^<]*)<\/title>/i.exec(text);
    throw new Error(`${butik.namn} (${k.shop}): token-svaret var inte JSON (${tr.status}${m ? `, "${m[1]}"` : ''}). "app_not_installed" betyder att appen bakom ${n.beskrivning} inte är installerad i den butiken.`);
  }
  if (!t.access_token) throw new Error(`${butik.namn} (${k.shop}): kunde inte minta token: ${JSON.stringify(t).slice(0, 200)}`);
  const token = t.access_token;

  const graphql = async (query, variables = {}) => {
    const svar = await fetchFn(`https://${k.shop}/admin/api/${API_VERSION}/graphql.json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
      body: JSON.stringify({ query, variables }),
    });
    if (!svar.ok) throw new Error(`Shopify (${k.shop}) svarade ${svar.status}: ${(await svar.text()).slice(0, 400)}`);
    const j = await svar.json();
    if (j.errors) throw new Error(`GraphQL-fel (${k.shop}): ${JSON.stringify(j.errors).slice(0, 600)}`);
    for (const [op, payload] of Object.entries(j.data ?? {})) {
      const fel = payload?.userErrors;
      if (Array.isArray(fel) && fel.length) throw new Error(`Shopify avvisade ${op}: ${fel.map((f) => f.message).join('; ')}`);
    }
    return j.data;
  };

  const kolla = async () => {
    const d = await graphql('{ shop { name contactEmail email primaryDomain { url } } currentAppInstallation { app { title } accessScopes { handle } } }');
    const scopes = (d.currentAppInstallation?.accessScopes ?? []).map((s) => s.handle);
    return {
      namn: d.shop?.name ?? null,
      doman: d.shop?.primaryDomain?.url ?? null,
      kontaktmejl: d.shop?.contactEmail || d.shop?.email || null,
      app: d.currentAppInstallation?.app?.title ?? null,
      scopes,
      saknar: KRAVDA_SCOPES.filter((s) => !scopes.includes(s)),
    };
  };

  return { butik, shop: k.shop, graphql, kolla };
}

// --lista: skriv ut registret.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  for (const b of allaButiker()) {
    const n = nyckelnamn(b);
    console.log(`${b.id.padEnd(14)} ${b.namn.padEnd(14)} ${b.url.padEnd(28)} ${b.sprak} ${String(b.land).padEnd(8)} ${b.prefix} /pages/${b.handle}  nycklar: ${n.beskrivning}${b.standard ? '  (standard)' : ''}`);
  }
}
