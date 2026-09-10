// Kedjans steg 0 — anslutningen (KEDJAN.md, Axels beslut 2026-09-08):
// minta en Admin-token ur butikens EGEN app, köra spärrarna och rapportera
// "Connected: <domän> ✓" innan något annat läses eller skrivs.
//
//   node factory/token.mjs --butik <id>            # anslut + skriv factory/.env
//   node factory/token.mjs --butik <id> --kolla    # bara kontrollera, skriv ingenting
//   node factory/token.mjs --butik <id> --torr     # inga nätverksanrop: bara spärrarna
//
// ops.mjs anropar `anslut(butikId, { torr })` — den läser nycklarna ur miljön
// eller factory/.env (via env.mjs, den enda .env-parsern), mintar en token om
// den saknas eller gått ut, kör spärrarna, sätter SHOPIFY_STORE_DOMAIN +
// SHOPIFY_ADMIN_TOKEN i processen (det shopify.mjs läser) och skriver dem
// till factory/.env tillsammans med SHOPIFY_ADMIN_TOKEN_<BUTIK>, så varje
// butiks token finns kvar när nästa bygge skriver över de allmänna raderna.
//
// Nycklarna (VA:n lägger in dem, checklistans steg 2). Per-butik-varianten
// med butiks-id i VERSALER vinner över den allmänna:
//   SHOPIFY_SHOP[_<BUTIK>]            butikens myshopify-domän
//   SHOPIFY_CLIENT_ID[_<BUTIK>]       appen "Fabriken" → Settings → Client ID
//   SHOPIFY_CLIENT_SECRET[_<BUTIK>]   appen "Fabriken" → Settings → Client secret
//   SHOPIFY_STOREFRONT_PASSWORD[_<BUTIK>]  storefront-lösenordet (kundvyn, steg 18)
// Tokenen mintas med client credentials grant och gäller 24 h.
//
// ⚠️ De allmänna variablerna skrivs över vid VARJE nytt bygge (VA:ns steg 2).
// Mätt 2026-09-10 på TackleBay: miljön stod kvar på TankGuard (SHOPIFY_SHOP
// = y1sj1i-3d, app-nycklarna gav `app_not_installed` mot iahe0c-b1, inget
// storefront-lösenord). En ombyggnad av en äldre butik börjar därför med att
// hennes nycklar läggs tillbaka — helst som _<BUTIK>-varianter, som nästa
// bygge inte skriver över. Per-butik-lösenordet lyfts in i
// SHOPIFY_STOREFRONT_PASSWORD av anslut(), så kundvy-kor läser rätt butik.
//
// ⚠️ SPÄRRARNA (spärrar): fel butik stoppar FÖRE första skrivningen.
//   1. Förbjudna domäner: HeimGuard (live) och Bäverbutiken med marknader.
//   2. State-fil under factory/state/ för en ANNAN butik på samma domän —
//      miljön står kvar på förra bygget. Samma butik = resume, ok.
//   3. Butikens NAMN ur Shopify är ett brand som redan finns i
//      factory/butiker/ eller factory/output/ (ny-ops.md: state-filen ensam
//      räckte inte — mätt 2026-09-09, TankGuard saknade state-fil).
//
// Ingen hemlighet loggas eller returneras ur anslut(). Noll beroenden.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { laddaEnv, lasEnvFil, ENV_FIL } from './env.mjs';
import { lasYaml } from './yaml.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const STATE_MAPP = join(FACTORY_ROT, 'state');
const BUTIKER_MAPP = join(FACTORY_ROT, 'butiker');
const OUTPUT_MAPP = join(FACTORY_ROT, 'output');
const API_VERSION = () => process.env.SHOPIFY_API_VERSION || '2025-07';

// Butiker fabriken ALDRIG får skriva i (ny-ops.md steg 1, CLAUDE.md).
// Källor: hemvakten.yaml (HeimGuard live), tools/kaching-cli/stores.json
// (Bäverbutiken SE), market-expansion/*/STATUS.md + docs/kaching-beverbutikken-
// byggmall.md (Bäverbutikens NO/DK/UK-butiker). Listan är en säkerhetsspärr,
// inte butikskonfig — nya OPS-butiker läggs aldrig till här.
export const FORBJUDNA_DOMANER = Object.freeze([
  'pzjagy-mz.myshopify.com', // HeimGuard (heimguard.se) — live OPS-butik
  '4snrw0-mg.myshopify.com', // Bäverbutiken (baverbutiken.se)
  '1acuam-s5.myshopify.com', // Beverbutikken NO
  'v0xqtk-tx.myshopify.com', // bæverbutiken.dk
  '1wucum-x0.myshopify.com', // BeaverShop UK
]);

// Marginal innan en token räknas som utgången (ms).
const UTGANGS_MARGINAL_MS = 5 * 60_000;

// ---------------------------------------------------------------------------
// Rena hjälpfunktioner (testbara utan nätverk)
// ---------------------------------------------------------------------------

export function normaliseraDoman(doman) {
  return String(doman ?? '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

// Butiks-id → suffix för miljövariabler: `tacklebay` → `TACKLEBAY`,
// `my-shop` → `MY_SHOP`.
export function envSuffix(butikId) {
  return String(butikId ?? '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_');
}

function perButik(env, namn, butikId) {
  if (!butikId) return undefined;
  return env[`${namn}_${envSuffix(butikId)}`] ?? env[`${namn}_${butikId}`];
}

const arCliToken = (t) => /^atkn_/i.test(String(t ?? ''));

// Vilka nycklar som gäller för butiken — ren funktion över ett env-objekt.
// Per-butik-variabeln vinner, sen den allmänna. SHOPIFY_SHOP (miljön, satt av
// VA:n för det NYA bygget) vinner över SHOPIFY_STORE_DOMAIN (factory/.env,
// kan vara kvar från förra bygget).
export function losNycklar(butikId, env = process.env) {
  const shop = normaliseraDoman(
    perButik(env, 'SHOPIFY_SHOP', butikId) || env.SHOPIFY_SHOP || env.SHOPIFY_STORE_DOMAIN || ''
  );
  const clientId = perButik(env, 'SHOPIFY_CLIENT_ID', butikId) || env.SHOPIFY_CLIENT_ID || '';
  const clientSecret = perButik(env, 'SHOPIFY_CLIENT_SECRET', butikId) || env.SHOPIFY_CLIENT_SECRET || '';
  const sparadToken = perButik(env, 'SHOPIFY_ADMIN_TOKEN', butikId) || '';
  const sparadUtgar = perButik(env, 'SHOPIFY_ADMIN_TOKEN_UTGAR', butikId) || '';
  const sparadDoman = normaliseraDoman(perButik(env, 'SHOPIFY_STORE_DOMAIN', butikId) || '');
  // Storefront-lösenordet: bara per-butik-varianten löses här. Den allmänna
  // läses av kundvy-kor själv — och kan vara förra butikens.
  const storefrontLosenord = perButik(env, 'SHOPIFY_STOREFRONT_PASSWORD', butikId) || '';
  return { shop, clientId, clientSecret, sparadToken, sparadUtgar, sparadDoman, storefrontLosenord };
}

// Är den sparade tokenen fortfarande brukbar för domänen? Kräver ett
// utgångsdatum — utan det vet vi inget och mintar om.
export function tokenGiltig({ sparadToken, sparadUtgar, sparadDoman, shop }, nu = Date.now()) {
  if (!sparadToken || arCliToken(sparadToken)) return false;
  if (sparadDoman && shop && sparadDoman !== shop) return false;
  const utgar = Date.parse(sparadUtgar);
  if (!Number.isFinite(utgar)) return false;
  return utgar - UTGANGS_MARGINAL_MS > nu;
}

function lasYamlTyst(sokvag) {
  try {
    return lasYaml(readFileSync(sokvag, 'utf8'));
  } catch {
    return null;
  }
}

// Kända butiker ur factory/butiker/*.yaml: id, brand och råtexten (domänen
// kan stå i en kommentar eller i judgeme.shop_domain — vi letar i hela filen).
function kandaButiker(butikerMapp) {
  if (!existsSync(butikerMapp)) return [];
  return readdirSync(butikerMapp)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => {
      const sokvag = join(butikerMapp, f);
      const text = readFileSync(sokvag, 'utf8').toLowerCase();
      const yaml = lasYamlTyst(sokvag);
      const id = String(yaml?.butik?.id ?? f.replace(/\.yaml$/, '')).toLowerCase();
      return { id, brand: String(yaml?.butik?.brand ?? '').trim(), text };
    });
}

// State-filer under factory/state/: { id, produkt, doman (om filen bär den) }.
function statefiler(stateMapp) {
  if (!existsSync(stateMapp)) return [];
  return readdirSync(stateMapp)
    .filter((f) => f.endsWith('.json') && f.includes('--'))
    .map((f) => {
      const [id, ...rest] = f.replace(/\.json$/, '').split('--');
      let doman = '';
      try {
        const data = JSON.parse(readFileSync(join(stateMapp, f), 'utf8'));
        const b = data?.butik;
        doman = normaliseraDoman(b?.['domän'] ?? b?.doman ?? b?.domain ?? '');
      } catch {
        // trasig statefil — spärren bygger då bara på filnamnet
      }
      return { fil: f, id: id.toLowerCase(), produkt: rest.join('--'), doman };
    });
}

const slug = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '');

// Spärrarna. `shop` är en domän-sträng eller { domain, name }.
// → { ok, skal } där skal är en läsbar mening när ok = false.
export function spärrar(butikId, shop, { stateMapp = STATE_MAPP, butikerMapp = BUTIKER_MAPP, outputMapp = OUTPUT_MAPP } = {}) {
  const id = String(butikId ?? '').trim().toLowerCase();
  const doman = normaliseraDoman(typeof shop === 'string' ? shop : shop?.domain ?? shop?.myshopifyDomain);
  const namn = typeof shop === 'object' && shop ? String(shop.name ?? '').trim() : '';

  if (!id) return { ok: false, skal: 'Inget butiks-id — spärrarna kan inte veta vilken butik som byggs.' };
  if (!doman) return { ok: false, skal: 'Ingen butiksdomän — sätt SHOPIFY_SHOP (VA:ns steg 2).' };

  // 1. Förbjudna domäner.
  if (FORBJUDNA_DOMANER.includes(doman)) {
    return {
      ok: false,
      skal: `${doman} är en förbjuden butik (HeimGuard live eller Bäverbutiken) — fabriken rör den aldrig. Be VA:n skriva över SHOPIFY_SHOP/CLIENT_ID/CLIENT_SECRET för den nya butiken.`,
    };
  }

  // 2. State-fil för en ANNAN butik på samma domän.
  const butiker = kandaButiker(butikerMapp);
  const idnPaDomanen = new Set(butiker.filter((b) => b.text.includes(doman)).map((b) => b.id));
  const frammande = statefiler(stateMapp).filter(
    (s) => s.id !== id && (s.doman === doman || (!s.doman && idnPaDomanen.has(s.id)))
  );
  if (frammande.length > 0) {
    return {
      ok: false,
      skal: `${doman} har redan state för en annan butik (${frammande.map((s) => s.fil).join(', ')}). Miljön pekar på ett tidigare bygge — nya butiker byggs aldrig ovanpå en gammal. Be VA:n skriva över SHOPIFY_SHOP/CLIENT_ID/CLIENT_SECRET.`,
    };
  }

  // 3. Butikens namn är ett brand som redan finns (annan butik).
  if (namn) {
    const n = slug(namn);
    const brandTraff = butiker.find((b) => b.id !== id && b.brand && slug(b.brand) === n);
    if (brandTraff) {
      return {
        ok: false,
        skal: `Shopify svarar butiksnamnet "${namn}", som är brandet för butiken "${brandTraff.id}" i factory/butiker/. Miljön står kvar på en tidigare butik — en ny butik på free trial heter aldrig ett färdigt brand. Be VA:n skriva över de tre variablerna.`,
      };
    }
    const outputTraff = existsSync(outputMapp)
      ? readdirSync(outputMapp).find((m) => m.toLowerCase() !== id && slug(m) === n)
      : null;
    if (outputTraff) {
      return {
        ok: false,
        skal: `Shopify svarar butiksnamnet "${namn}", som redan har en mapp factory/output/${outputTraff}/. Miljön står kvar på en tidigare butik — be VA:n skriva över de tre variablerna.`,
      };
    }
  }

  return { ok: true, skal: '' };
}
export { spärrar as sparrar };

// Skriver nycklar till factory/.env utan att radera andra butikers rader.
//   skrivEnv({ SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_TOKEN, SHOPIFY_ADMIN_TOKEN_TACKLEBAY }, { fil })
// Gamla formen skrivEnv(domän, token, butikId) fungerar fortfarande.
export function skrivEnv(varden, ...rest) {
  let nycklar = varden;
  let fil = rest[0]?.fil ?? ENV_FIL;
  if (typeof varden === 'string') {
    const [token, butikId] = rest;
    nycklar = { SHOPIFY_STORE_DOMAIN: normaliseraDoman(varden), SHOPIFY_ADMIN_TOKEN: token };
    if (butikId) nycklar[`SHOPIFY_ADMIN_TOKEN_${envSuffix(butikId)}`] = token;
    fil = ENV_FIL;
  }
  const rader = existsSync(fil) ? readFileSync(fil, 'utf8').split(/\r?\n/) : [];
  while (rader.length > 0 && rader[rader.length - 1] === '') rader.pop();
  if (rader.length === 0) {
    rader.push('# OPS Factory — skrivs av factory/token.mjs. Gitignorerad. Tokens gäller 24 h — kör om anslutningen.');
  }
  for (const [nyckel, varde] of Object.entries(nycklar)) {
    if (varde === undefined || varde === null) continue;
    const i = rader.findIndex((r) => r.startsWith(`${nyckel}=`));
    const rad = `${nyckel}=${varde}`;
    if (i === -1) rader.push(rad);
    else rader[i] = rad;
  }
  writeFileSync(fil, `${rader.join('\n')}\n`);
  return Object.keys(nycklar);
}

// ---------------------------------------------------------------------------
// Nätverk (Shopify)
// ---------------------------------------------------------------------------

export async function mintaToken({ shop, clientId, clientSecret } = {}, { fetchFn = fetch } = {}) {
  const doman = normaliseraDoman(shop ?? process.env.SHOPIFY_SHOP);
  const id = clientId ?? process.env.SHOPIFY_CLIENT_ID;
  const hemlighet = clientSecret ?? process.env.SHOPIFY_CLIENT_SECRET;
  const saknas = [!doman && 'SHOPIFY_SHOP', !id && 'SHOPIFY_CLIENT_ID', !hemlighet && 'SHOPIFY_CLIENT_SECRET'].filter(Boolean);
  if (saknas.length > 0) {
    throw new Error(
      `Saknar ${saknas.join(', ')} i miljön — VA:n lägger in dem i sessionens Environment (checklistans steg 2). Klistra aldrig nycklar i chatten.`
    );
  }
  const svar = await fetchFn(`https://${doman}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: id, client_secret: hemlighet, grant_type: 'client_credentials' }),
  });
  if (!svar.ok) {
    throw new Error(`Token-mint mot ${doman} misslyckades: ${svar.status} ${(await svar.text()).slice(0, 200)}`);
  }
  const data = await svar.json();
  if (!data.access_token) throw new Error(`Token-mint mot ${doman} gav ingen access_token.`);
  const sekunder = Number(data.expires_in) || 86400;
  return {
    domän: doman,
    token: data.access_token,
    sekunder,
    expiresAt: new Date(Date.now() + sekunder * 1000).toISOString(),
    scopes: String(data.scope ?? '')
      .split(',')
      .filter(Boolean),
  };
}

// Läser butikens namn, domän och teman med tokenen — det som ska stå i "Connected".
export async function lasButik(shop, token, { fetchFn = fetch } = {}) {
  const doman = normaliseraDoman(shop);
  const svar = await fetchFn(`https://${doman}/admin/api/${API_VERSION()}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query:
        '{ shop { name myshopifyDomain currencyCode email primaryDomain { host } } themes(first: 20) { nodes { id name role } } products(first: 1) { nodes { id } } }',
    }),
  });
  if (svar.status === 401 || svar.status === 403) {
    const e = new Error(`Shopify avvisade tokenen mot ${doman} (${svar.status}).`);
    e.kod = 'TOKEN_AVVISAD';
    throw e;
  }
  if (!svar.ok) throw new Error(`Shopify svarade ${svar.status} mot ${doman}: ${(await svar.text()).slice(0, 200)}`);
  const data = await svar.json();
  if (data.errors) throw new Error(`Shopify svarade fel: ${JSON.stringify(data.errors).slice(0, 300)}`);
  const s = data.data?.shop ?? {};
  return {
    name: s.name ?? '',
    domain: normaliseraDoman(s.myshopifyDomain || doman),
    myshopifyDomain: normaliseraDoman(s.myshopifyDomain || doman),
    primaryDomain: s.primaryDomain?.host ?? null,
    currencyCode: s.currencyCode ?? null,
    email: s.email ?? null,
    teman: data.data?.themes?.nodes ?? [],
    harProdukter: (data.data?.products?.nodes ?? []).length > 0,
  };
}

// ---------------------------------------------------------------------------
// anslut — det ops.mjs anropar som steg 0
// ---------------------------------------------------------------------------
//
// → { domain, name, teman, primaryDomain, currencyCode, email, harProdukter,
//     tokenKalla: 'sparad' | 'mintad' | 'ingen', torr }
// Kastar med läsbart skäl vid saknade nycklar, misslyckad mint eller spärr.
// Sätter process.env.SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN och skriver
// factory/.env (om inte torr/utanEnvFil). Returnerar aldrig tokenen.
export async function anslut(butikId, { torr = false, utanEnvFil = false, env = process.env, envFil = ENV_FIL, fetchFn = fetch, nu = Date.now(), sparrAlternativ = {} } = {}) {
  const id = String(butikId ?? '').trim().toLowerCase();
  if (!id) throw new Error('anslut: butiks-id saknas.');

  // Miljön först, sen factory/.env (laddaEnv sätter aldrig över miljön).
  if (env === process.env) laddaEnv(envFil);
  const n = losNycklar(id, env === process.env ? process.env : { ...lasEnvFil(envFil), ...env });

  if (!n.shop) {
    throw new Error('Saknar SHOPIFY_SHOP i miljön — VA:n lägger in den (checklistans steg 2).');
  }

  // Spärr på domänen FÖRE första nätverksanropet.
  const forspärr = spärrar(id, n.shop, sparrAlternativ);
  if (!forspärr.ok) throw new Error(`STOPP — ${forspärr.skal}`);

  // Butikens eget storefront-lösenord vinner över det allmänna (som kan vara
  // kvar från förra bygget) — kundvy-kor.mjs läser bara den allmänna nyckeln.
  // Sätts även torrt, så dry-run säger sanningen om kundvyn. Skrivs aldrig
  // till factory/.env och loggas aldrig.
  if (n.storefrontLosenord) env.SHOPIFY_STOREFRONT_PASSWORD = n.storefrontLosenord;

  if (torr) {
    return { domain: n.shop, name: null, teman: [], primaryDomain: null, currencyCode: null, email: null, harProdukter: null, tokenKalla: 'ingen', torr: true };
  }

  // Token: sparad och giltig → använd; annars minta.
  let token = '';
  let expiresAt = n.sparadUtgar;
  let tokenKalla = 'sparad';
  const kanMinta = Boolean(n.clientId && n.clientSecret);
  const minta = async () => {
    if (!kanMinta) {
      throw new Error(
        `Saknar SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET (eller _${envSuffix(id)}-varianten) i miljön — VA:n lägger in dem (checklistans steg 2). Klistra aldrig nycklar i chatten.`
      );
    }
    const m = await mintaToken({ shop: n.shop, clientId: n.clientId, clientSecret: n.clientSecret }, { fetchFn });
    token = m.token;
    expiresAt = m.expiresAt;
    tokenKalla = 'mintad';
  };

  if (arCliToken(n.sparadToken)) {
    // Shopify CLI:s token (atkn_) ger alltid 401 mot Admin API — ignorera, minta.
    await minta();
  } else if (tokenGiltig(n, nu)) {
    token = n.sparadToken;
  } else {
    await minta();
  }

  let butik;
  try {
    butik = await lasButik(n.shop, token, { fetchFn });
  } catch (e) {
    if (e.kod === 'TOKEN_AVVISAD' && tokenKalla === 'sparad') {
      await minta();
      butik = await lasButik(n.shop, token, { fetchFn });
    } else {
      throw e;
    }
  }

  // Spärr med butikens riktiga domän + namn (namnet är facit, ny-ops.md).
  const efterspärr = spärrar(id, { domain: butik.domain, name: butik.name }, sparrAlternativ);
  if (!efterspärr.ok) throw new Error(`STOPP — ${efterspärr.skal}`);

  // Processen: det shopify.mjs läser. Skrivs över med flit — hela poängen
  // med steg 0 är att peka fabriken på den NYA butiken.
  env.SHOPIFY_STORE_DOMAIN = butik.domain;
  env.SHOPIFY_ADMIN_TOKEN = token;

  if (!utanEnvFil) {
    const suffix = envSuffix(id);
    skrivEnv(
      {
        SHOPIFY_STORE_DOMAIN: butik.domain,
        SHOPIFY_ADMIN_TOKEN: token,
        [`SHOPIFY_ADMIN_TOKEN_${suffix}`]: token,
        [`SHOPIFY_ADMIN_TOKEN_UTGAR_${suffix}`]: expiresAt || '',
        [`SHOPIFY_STORE_DOMAIN_${suffix}`]: butik.domain,
      },
      { fil: envFil }
    );
  }

  return {
    domain: butik.domain,
    name: butik.name,
    teman: butik.teman,
    primaryDomain: butik.primaryDomain,
    currencyCode: butik.currencyCode,
    email: butik.email,
    harProdukter: butik.harProdukter,
    tokenKalla,
    torr: false,
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

async function huvud() {
  const arg = process.argv.slice(2);
  const baraKolla = arg.includes('--kolla');
  const torr = arg.includes('--torr') || arg.includes('--dry');
  const butikId = arg.includes('--butik') ? arg[arg.indexOf('--butik') + 1] : null;
  if (!butikId) {
    throw new Error('Ange butik: node factory/token.mjs --butik <id> [--kolla] [--torr]');
  }
  const b = await anslut(butikId, { torr, utanEnvFil: baraKolla });
  if (b.torr) {
    console.log(`Torr: spärrarna släpper ${b.domain} för butiken "${butikId}" (inget mintat, inget skrivet).`);
    return;
  }
  console.log(`Connected: ${b.domain} ✓`);
  console.log(`   butik "${b.name}" · ${b.currencyCode ?? '—'} · primär domän ${b.primaryDomain ?? '—'} · ${b.email ?? ''}`);
  console.log(
    `   ${b.harProdukter ? 'har produkter' : 'inga produkter'} · teman: ${b.teman.map((t) => `${t.name} (${t.role})`).join(', ') || '—'}`
  );
  console.log(`   token: ${b.tokenKalla === 'mintad' ? 'nymintad (24 h)' : 'sparad, fortfarande giltig'}`);
  if (baraKolla) return;
  console.log(`✅ factory/.env skriven (SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN + SHOPIFY_ADMIN_TOKEN_${envSuffix(butikId)}).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(e.message.startsWith('STOPP') ? 2 : 1);
  });
}
