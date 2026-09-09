// Anslutningskontrollen — /ny-ops-kommandots FÖRSTA handling (Axels beslut
// 2026-09-08): minta en Admin-token ur butikens egen app och rapportera
// "Connected: <domän> ✓" innan något annat läses eller skrivs.
//
//   node factory/token.mjs            # minta + skriv factory/.env + rapportera
//   node factory/token.mjs --kolla    # bara kontrollera, skriv ingenting
//
// Läser SHOPIFY_SHOP + SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET ur miljön
// (VA:n lägger in dem per butik, checklistans steg 2). Tokenen mintas med
// client credentials grant och gäller 24 timmar — kör om skriptet i varje
// ny session. Skriver SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN (det
// fabriken läser) och SHOPIFY_ADMIN_TOKEN_<butiks-id> (så varje butiks
// token finns kvar när miljöns tre variabler skrivs över av nästa bygge).
//
// ⚠️ SPÄRR MOT GAMMAL MILJÖ: har butiken redan en state-fil under
// factory/state/ är miljön inte uppdaterad för den nya butiken — stoppa.
// Nya butiker byggs aldrig ovanpå en gammal. Noll beroenden.

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const ENV_FIL = join(FACTORY_ROT, '.env');

export async function mintaToken({ shop, clientId, clientSecret } = {}) {
  const domän = shop ?? process.env.SHOPIFY_SHOP;
  const id = clientId ?? process.env.SHOPIFY_CLIENT_ID;
  const hemlighet = clientSecret ?? process.env.SHOPIFY_CLIENT_SECRET;
  const saknas = [
    !domän && 'SHOPIFY_SHOP',
    !id && 'SHOPIFY_CLIENT_ID',
    !hemlighet && 'SHOPIFY_CLIENT_SECRET',
  ].filter(Boolean);
  if (saknas.length > 0) {
    throw new Error(
      `Saknar ${saknas.join(', ')} i miljön — VA:n lägger in dem i sessionens Environment (checklistans steg 2). Klistra aldrig nycklar i chatten.`
    );
  }
  const svar = await fetch(`https://${domän}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: id, client_secret: hemlighet, grant_type: 'client_credentials' }),
  });
  if (!svar.ok) {
    throw new Error(`Token-mint mot ${domän} misslyckades: ${svar.status} ${(await svar.text()).slice(0, 200)}`);
  }
  const data = await svar.json();
  return { domän, token: data.access_token, sekunder: data.expires_in, scopes: String(data.scope ?? '').split(',') };
}

// Läser butikens namn + domän med den nya tokenen — det som ska stå i "Connected".
export async function lasButik(domän, token) {
  const svar = await fetch(`https://${domän}/admin/api/2025-07/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: '{ shop { name myshopifyDomain currencyCode email primaryDomain { host } } themes(first: 20) { nodes { id name role } } products(first: 1) { nodes { id } } }',
    }),
  });
  const data = await svar.json();
  if (data.errors) throw new Error(`Shopify svarade fel: ${JSON.stringify(data.errors).slice(0, 300)}`);
  return data.data;
}

// State-filer vars butik matchar domänen = miljön pekar på en redan byggd butik.
export function statefilerForDomän(domän) {
  const mapp = join(FACTORY_ROT, 'state');
  if (!existsSync(mapp)) return [];
  const butiker = join(FACTORY_ROT, 'butiker');
  const idn = existsSync(butiker)
    ? readdirSync(butiker)
        .filter((f) => f.endsWith('.yaml'))
        .filter((f) => readFileSync(join(butiker, f), 'utf8').includes(domän))
        .map((f) => f.replace('.yaml', ''))
    : [];
  return readdirSync(mapp).filter((f) => idn.some((id) => f.startsWith(`${id}--`)));
}

export function skrivEnv(domän, token, butiksId) {
  const rader = existsSync(ENV_FIL) ? readFileSync(ENV_FIL, 'utf8').split(/\r?\n/) : [];
  const satt = (nyckel, varde) => {
    const i = rader.findIndex((r) => r.startsWith(`${nyckel}=`));
    if (i === -1) rader.push(`${nyckel}=${varde}`);
    else rader[i] = `${nyckel}=${varde}`;
  };
  if (rader.length === 0) {
    rader.push('# OPS Factory — skrivs av factory/token.mjs. Gitignorerad. Tokens gäller 24 h — kör om skriptet.');
  }
  satt('SHOPIFY_STORE_DOMAIN', domän);
  satt('SHOPIFY_ADMIN_TOKEN', token);
  if (butiksId) satt(`SHOPIFY_ADMIN_TOKEN_${butiksId}`, token);
  writeFileSync(ENV_FIL, `${rader.filter((r, i, a) => r !== '' || i < a.length - 1).join('\n')}\n`);
}

async function huvud() {
  const arg = process.argv.slice(2);
  const baraKolla = arg.includes('--kolla');
  const butiksId = arg.includes('--butik') ? arg[arg.indexOf('--butik') + 1] : null;

  const { domän, token, sekunder, scopes } = await mintaToken();
  const info = await lasButik(domän, token);
  const shop = info.shop;
  console.log(`Connected: ${shop.myshopifyDomain} ✓`);
  console.log(`   butik "${shop.name}" · ${shop.currencyCode} · primär domän ${shop.primaryDomain?.host ?? '—'} · ${shop.email ?? ''}`);
  console.log(`   ${info.products.nodes.length === 0 ? 'inga produkter' : 'har produkter'} · teman: ${info.themes.nodes.map((t) => `${t.name} (${t.role})`).join(', ')}`);
  console.log(`   token gäller ${Math.round(sekunder / 3600)} h · ${scopes.length} scopes`);

  const gamla = statefilerForDomän(shop.myshopifyDomain);
  if (gamla.length > 0) {
    console.error(`\n❌ STOPP — ${shop.myshopifyDomain} har redan state (${gamla.join(', ')}). Miljön pekar på en redan byggd butik: be VA:n skriva över SHOPIFY_SHOP/CLIENT_ID/CLIENT_SECRET för den nya.`);
    process.exit(2);
  }
  if (baraKolla) return;
  skrivEnv(shop.myshopifyDomain, token, butiksId);
  console.log(`✅ factory/.env skriven (SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN${butiksId ? ` + SHOPIFY_ADMIN_TOKEN_${butiksId}` : ''}).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
