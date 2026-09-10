// Tester för kedjans steg 0 (token.mjs) och .env-parsern (env.mjs).
// Allt körs mot temp-kataloger och en fejkad fetch — ingen riktig .env,
// inget nätverk.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tolkaEnvRad, lasEnvFil } from '../env.mjs';
import {
  FORBJUDNA_DOMANER,
  normaliseraDoman,
  envSuffix,
  losNycklar,
  losStorefrontLosenord,
  tokenGiltig,
  spärrar,
  sparrar,
  skrivEnv,
  anslut,
} from '../token.mjs';

// --- hjälp -----------------------------------------------------------------

function tempMappar() {
  const rot = mkdtempSync(join(tmpdir(), 'ops-token-'));
  const stateMapp = join(rot, 'state');
  const butikerMapp = join(rot, 'butiker');
  const outputMapp = join(rot, 'output');
  for (const m of [stateMapp, butikerMapp, outputMapp]) mkdirSync(m, { recursive: true });
  const butik = (id, brand, doman, extra = '') =>
    writeFileSync(
      join(butikerMapp, `${id}.yaml`),
      `# Butikskonfig för ${brand} (${doman}).\nbutik:\n  id: ${id}\n  brand: "${brand}"\njudgeme:\n  shop_domain: "${doman}"\n${extra}`
    );
  const state = (id, produkt, data = {}) =>
    writeFileSync(join(stateMapp, `${id}--${produkt}.json`), JSON.stringify({ butik: id, produkt, steg: {}, ...data }));
  const stada = () => rmSync(rot, { recursive: true, force: true });
  return { rot, stateMapp, butikerMapp, outputMapp, butik, state, stada, alt: { stateMapp, butikerMapp, outputMapp } };
}

// Fejkad Shopify: svarar på token-mint och på graphql-frågan.
function fejkShopify({ namn = 'My Store', doman = 'ny1234-ab.myshopify.com', avvisa = () => false } = {}) {
  const anrop = [];
  const fetchFn = async (url, init) => {
    anrop.push({ url, init });
    if (url.endsWith('/admin/oauth/access_token')) {
      const body = JSON.parse(init.body);
      assert.equal(body.grant_type, 'client_credentials');
      return { ok: true, status: 200, json: async () => ({ access_token: `shpat_ny_${anrop.length}`, expires_in: 86399, scope: 'read_products,write_products' }), text: async () => '' };
    }
    const token = init.headers['X-Shopify-Access-Token'];
    if (avvisa(token)) return { ok: false, status: 401, json: async () => ({}), text: async () => 'Unauthorized' };
    return {
      ok: true,
      status: 200,
      text: async () => '',
      json: async () => ({
        data: {
          shop: { name: namn, myshopifyDomain: doman, currencyCode: 'SEK', email: 'x@y.se', primaryDomain: { host: 'ny.se' } },
          themes: { nodes: [{ id: 'gid://shopify/OnlineStoreTheme/1', name: 'Dawn', role: 'MAIN' }] },
          products: { nodes: [] },
        },
      }),
    };
  };
  return { fetchFn, anrop };
}

// --- env.mjs -----------------------------------------------------------------

test('tolkaEnvRad: kommentarer, tomma rader, citattecken', () => {
  assert.equal(tolkaEnvRad('# kommentar'), null);
  assert.equal(tolkaEnvRad('   '), null);
  assert.equal(tolkaEnvRad('UTAN_LIKAMED'), null);
  assert.deepEqual(tolkaEnvRad('A=1'), ['A', '1']);
  assert.deepEqual(tolkaEnvRad('B = "två ord" '), ['B', 'två ord']);
  assert.deepEqual(tolkaEnvRad("C='x=y'"), ['C', 'x=y']);
});

test('lasEnvFil: saknad fil → tomt objekt, annars alla rader', () => {
  const { rot, stada } = tempMappar();
  assert.deepEqual(lasEnvFil(join(rot, 'finns-inte')), {});
  writeFileSync(join(rot, '.env'), '# rubrik\nSHOPIFY_STORE_DOMAIN=a.myshopify.com\nSHOPIFY_ADMIN_TOKEN=shpat_1\n');
  assert.deepEqual(lasEnvFil(join(rot, '.env')), { SHOPIFY_STORE_DOMAIN: 'a.myshopify.com', SHOPIFY_ADMIN_TOKEN: 'shpat_1' });
  stada();
});

// --- rena hjälpfunktioner ----------------------------------------------------

test('normaliseraDoman och envSuffix', () => {
  assert.equal(normaliseraDoman(' https://Ny1234-AB.myshopify.com/admin '), 'ny1234-ab.myshopify.com');
  assert.equal(normaliseraDoman(undefined), '');
  assert.equal(envSuffix('tacklebay'), 'TACKLEBAY');
  assert.equal(envSuffix('my-shop.2'), 'MY_SHOP_2');
});

test('losNycklar: per-butik vinner, SHOPIFY_SHOP vinner över SHOPIFY_STORE_DOMAIN', () => {
  const env = {
    SHOPIFY_STORE_DOMAIN: 'gammal.myshopify.com',
    SHOPIFY_SHOP: 'ny.myshopify.com',
    SHOPIFY_CLIENT_ID: 'id-allman',
    SHOPIFY_CLIENT_ID_TACKLEBAY: 'id-tacklebay',
    SHOPIFY_CLIENT_SECRET: 'hemlig',
    SHOPIFY_ADMIN_TOKEN_TACKLEBAY: 'shpat_t',
  };
  const n = losNycklar('tacklebay', env);
  assert.equal(n.shop, 'ny.myshopify.com');
  assert.equal(n.clientId, 'id-tacklebay');
  assert.equal(n.clientSecret, 'hemlig');
  assert.equal(n.sparadToken, 'shpat_t');
  // Utan SHOPIFY_SHOP faller den tillbaka på .env-raden.
  const n2 = losNycklar('annan', { SHOPIFY_STORE_DOMAIN: 'https://gammal.myshopify.com/' });
  assert.equal(n2.shop, 'gammal.myshopify.com');
  assert.equal(n2.sparadToken, '');
});

test('losStorefrontLosenord: butikens egen nyckel vinner över den allmänna', () => {
  // Den allmänna skrivs över av varje nytt bygge (VA-checklistan steg 2), så
  // utan per-butik-varianten är kundvyn röd på varje ombyggnad av en äldre
  // butik. Mätt 2026-09-10 på TackleBay.
  const env = { SHOPIFY_STOREFRONT_PASSWORD: 'allman', SHOPIFY_STOREFRONT_PASSWORD_TACKLEBAY: 'egen' };
  assert.equal(losStorefrontLosenord('tacklebay', env), 'egen');
  assert.equal(losStorefrontLosenord('drytrek', env), 'allman');
  assert.equal(losStorefrontLosenord('drytrek', {}), '');
  assert.equal(losStorefrontLosenord('', { SHOPIFY_STOREFRONT_PASSWORD: 'allman' }), 'allman');
});

test('tokenGiltig: kräver utgångsdatum, rätt domän och ingen CLI-token', () => {
  const nu = Date.parse('2026-09-09T12:00:00Z');
  const bas = { sparadToken: 'shpat_x', sparadUtgar: '2026-09-10T11:00:00Z', sparadDoman: 'a.myshopify.com', shop: 'a.myshopify.com' };
  assert.equal(tokenGiltig(bas, nu), true);
  assert.equal(tokenGiltig({ ...bas, sparadUtgar: '' }, nu), false);
  assert.equal(tokenGiltig({ ...bas, sparadUtgar: '2026-09-09T12:03:00Z' }, nu), false, 'inom marginalen = utgången');
  assert.equal(tokenGiltig({ ...bas, sparadToken: 'atkn_cli' }, nu), false);
  assert.equal(tokenGiltig({ ...bas, sparadDoman: 'b.myshopify.com' }, nu), false);
  assert.equal(tokenGiltig({ ...bas, sparadToken: '' }, nu), false);
});

// --- spärrar -----------------------------------------------------------------

test('spärrar: förbjudna domäner stoppar (HeimGuard + Bäverbutiken)', () => {
  const t = tempMappar();
  assert.ok(FORBJUDNA_DOMANER.includes('pzjagy-mz.myshopify.com'));
  assert.ok(FORBJUDNA_DOMANER.includes('4snrw0-mg.myshopify.com'));
  for (const d of FORBJUDNA_DOMANER) {
    const r = spärrar('nybutik', d, t.alt);
    assert.equal(r.ok, false);
    assert.match(r.skal, /förbjuden/);
  }
  assert.equal(sparrar, spärrar, 'ascii-alias');
  t.stada();
});

test('spärrar: tom domän eller tomt id stoppar', () => {
  const t = tempMappar();
  assert.equal(spärrar('nybutik', '', t.alt).ok, false);
  assert.equal(spärrar('', 'x.myshopify.com', t.alt).ok, false);
  t.stada();
});

test('spärrar: state-fil för ANNAN butik på samma domän = stopp (via yaml-domän)', () => {
  const t = tempMappar();
  t.butik('tankguard', 'TankGuard', 'y1sj1i-3d.myshopify.com');
  t.state('tankguard', 'tankoverdraget');
  const r = spärrar('nybutik', 'y1sj1i-3d.myshopify.com', t.alt);
  assert.equal(r.ok, false);
  assert.match(r.skal, /tankguard--tankoverdraget\.json/);
  t.stada();
});

test('spärrar: state-fil för ANNAN butik på samma domän = stopp (via domän i state-filen)', () => {
  const t = tempMappar();
  // Ingen yaml alls — bara state-filen bär domänen (DryTrek-formen).
  t.state('drytrek', 'damasker', { butik: { domän: 'i1da39-zd.myshopify.com', brand: 'DryTrek' } });
  const r = spärrar('nybutik', 'i1da39-zd.myshopify.com', t.alt);
  assert.equal(r.ok, false);
  assert.match(r.skal, /drytrek--damasker\.json/);
  t.stada();
});

test('spärrar: samma butik med state = resume, ok', () => {
  const t = tempMappar();
  t.butik('tacklebay', 'TackleBay', 'iahe0c-b1.myshopify.com');
  t.state('tacklebay', '_butik');
  t.state('tacklebay', 'fiskespohallare-4-pack');
  const r = spärrar('tacklebay', { domain: 'iahe0c-b1.myshopify.com', name: 'TackleBay' }, t.alt);
  assert.deepEqual(r, { ok: true, skal: '' });
  t.stada();
});

test('spärrar: annan butiks state på en ANNAN domän stör inte', () => {
  const t = tempMappar();
  t.butik('tankguard', 'TankGuard', 'y1sj1i-3d.myshopify.com');
  t.state('tankguard', 'tankoverdraget');
  assert.equal(spärrar('nybutik', 'ny1234-ab.myshopify.com', t.alt).ok, true);
  t.stada();
});

test('spärrar: butiksnamnet är ett känt brand (annan butik) = stopp — även utan state-fil', () => {
  const t = tempMappar();
  t.butik('tankguard', 'TankGuard', 'y1sj1i-3d.myshopify.com');
  // Ingen state-fil för tankguard — precis läget 2026-09-09.
  const r = spärrar('nybutik', { domain: 'y1sj1i-3d.myshopify.com', name: 'TankGuard' }, t.alt);
  assert.equal(r.ok, false);
  assert.match(r.skal, /"TankGuard".*tankguard/);
  // Samma brand men samma butik = ok.
  assert.equal(spärrar('tankguard', { domain: 'y1sj1i-3d.myshopify.com', name: 'TankGuard' }, t.alt).ok, true);
  // Ett free-trial-namn släpps igenom.
  assert.equal(spärrar('nybutik', { domain: 'y1sj1i-3d.myshopify.com', name: 'My Store 4' }, t.alt).ok, true);
  t.stada();
});

test('spärrar: butiksnamnet matchar en mapp i output/ = stopp', () => {
  const t = tempMappar();
  mkdirSync(join(t.outputMapp, 'tankguard'));
  const r = spärrar('nybutik', { domain: 'ny1234-ab.myshopify.com', name: 'Tank Guard' }, t.alt);
  assert.equal(r.ok, false);
  assert.match(r.skal, /output\/tankguard/);
  assert.equal(spärrar('tankguard', { domain: 'ny1234-ab.myshopify.com', name: 'TankGuard' }, t.alt).ok, true);
  t.stada();
});

// --- skrivEnv ----------------------------------------------------------------

test('skrivEnv: uppdaterar och lägger till utan att radera andra butikers rader', () => {
  const t = tempMappar();
  const fil = join(t.rot, '.env');
  writeFileSync(fil, '# rubrik\nKIE_API_KEY=kie\nSHOPIFY_STORE_DOMAIN=gammal.myshopify.com\nSHOPIFY_ADMIN_TOKEN=shpat_gammal\nSHOPIFY_ADMIN_TOKEN_TANKGUARD=shpat_tank\n\n');
  skrivEnv({ SHOPIFY_STORE_DOMAIN: 'ny.myshopify.com', SHOPIFY_ADMIN_TOKEN: 'shpat_ny', SHOPIFY_ADMIN_TOKEN_NYBUTIK: 'shpat_ny', HOPPAS_OVER: undefined }, { fil });
  const rader = readFileSync(fil, 'utf8').split('\n');
  assert.deepEqual(rader, [
    '# rubrik',
    'KIE_API_KEY=kie',
    'SHOPIFY_STORE_DOMAIN=ny.myshopify.com',
    'SHOPIFY_ADMIN_TOKEN=shpat_ny',
    'SHOPIFY_ADMIN_TOKEN_TANKGUARD=shpat_tank',
    'SHOPIFY_ADMIN_TOKEN_NYBUTIK=shpat_ny',
    '',
  ]);
  assert.deepEqual(lasEnvFil(fil).SHOPIFY_ADMIN_TOKEN_TANKGUARD, 'shpat_tank', 'gamla butikens token kvar');
  t.stada();
});

test('skrivEnv: ny fil får rubrikrad, och samma skrivning två gånger ger inga dubbletter', () => {
  const t = tempMappar();
  const fil = join(t.rot, '.env');
  skrivEnv({ SHOPIFY_STORE_DOMAIN: 'a.myshopify.com' }, { fil });
  skrivEnv({ SHOPIFY_STORE_DOMAIN: 'a.myshopify.com' }, { fil });
  const rader = readFileSync(fil, 'utf8').split('\n');
  assert.ok(rader[0].startsWith('#'));
  assert.equal(rader.filter((r) => r.startsWith('SHOPIFY_STORE_DOMAIN=')).length, 1);
  t.stada();
});

// --- anslut ------------------------------------------------------------------

test('anslut: mintar när token saknas, skriver .env, returnerar aldrig tokenen', async () => {
  const t = tempMappar();
  const envFil = join(t.rot, '.env');
  const { fetchFn, anrop } = fejkShopify({ namn: 'My Store 9' });
  const env = { SHOPIFY_SHOP: 'ny1234-ab.myshopify.com', SHOPIFY_CLIENT_ID: 'cid', SHOPIFY_CLIENT_SECRET: 'csec' };
  const b = await anslut('nybutik', { env, envFil, fetchFn, sparrAlternativ: t.alt });

  assert.equal(b.domain, 'ny1234-ab.myshopify.com');
  assert.equal(b.name, 'My Store 9');
  assert.equal(b.teman.length, 1);
  assert.equal(b.currencyCode, 'SEK');
  assert.equal(b.tokenKalla, 'mintad');
  assert.ok(!JSON.stringify(b).includes('shpat_'), 'ingen token i returvärdet');
  assert.equal(anrop.length, 2, 'ett mint + en läsning');

  assert.equal(env.SHOPIFY_STORE_DOMAIN, 'ny1234-ab.myshopify.com');
  assert.match(env.SHOPIFY_ADMIN_TOKEN, /^shpat_ny_/);
  const skrivet = lasEnvFil(envFil);
  assert.equal(skrivet.SHOPIFY_STORE_DOMAIN, 'ny1234-ab.myshopify.com');
  assert.equal(skrivet.SHOPIFY_ADMIN_TOKEN, env.SHOPIFY_ADMIN_TOKEN);
  assert.equal(skrivet.SHOPIFY_ADMIN_TOKEN_NYBUTIK, env.SHOPIFY_ADMIN_TOKEN);
  assert.ok(Date.parse(skrivet.SHOPIFY_ADMIN_TOKEN_UTGAR_NYBUTIK) > Date.now());
  assert.ok(!Object.values(skrivet).includes('csec'), 'client secret skrivs aldrig till .env');
  t.stada();
});

test('anslut: sparad giltig token används utan mint', async () => {
  const t = tempMappar();
  const { fetchFn, anrop } = fejkShopify();
  const env = {
    SHOPIFY_SHOP: 'ny1234-ab.myshopify.com',
    SHOPIFY_ADMIN_TOKEN_NYBUTIK: 'shpat_sparad',
    SHOPIFY_ADMIN_TOKEN_UTGAR_NYBUTIK: new Date(Date.now() + 3600_000).toISOString(),
    SHOPIFY_STORE_DOMAIN_NYBUTIK: 'ny1234-ab.myshopify.com',
  };
  const b = await anslut('nybutik', { env, envFil: join(t.rot, '.env'), fetchFn, sparrAlternativ: t.alt, utanEnvFil: true });
  assert.equal(b.tokenKalla, 'sparad');
  assert.equal(anrop.length, 1);
  assert.equal(env.SHOPIFY_ADMIN_TOKEN, 'shpat_sparad');
  t.stada();
});

test('anslut: utgången sparad token → mint; avvisad sparad token → mint och nytt försök', async () => {
  const t = tempMappar();
  const { fetchFn, anrop } = fejkShopify({ avvisa: (tok) => tok === 'shpat_dod' });
  const env = {
    SHOPIFY_SHOP: 'ny1234-ab.myshopify.com',
    SHOPIFY_CLIENT_ID: 'cid',
    SHOPIFY_CLIENT_SECRET: 'csec',
    SHOPIFY_ADMIN_TOKEN_NYBUTIK: 'shpat_dod',
    SHOPIFY_ADMIN_TOKEN_UTGAR_NYBUTIK: new Date(Date.now() + 3600_000).toISOString(),
  };
  const b = await anslut('nybutik', { env, envFil: join(t.rot, '.env'), fetchFn, sparrAlternativ: t.alt, utanEnvFil: true });
  assert.equal(b.tokenKalla, 'mintad');
  assert.equal(anrop.length, 3, 'läsning (401) + mint + läsning');

  const env2 = { ...env, SHOPIFY_ADMIN_TOKEN_NYBUTIK: 'shpat_ok', SHOPIFY_ADMIN_TOKEN_UTGAR_NYBUTIK: '2020-01-01T00:00:00Z' };
  const f2 = fejkShopify();
  const b2 = await anslut('nybutik', { env: env2, envFil: join(t.rot, '.env'), fetchFn: f2.fetchFn, sparrAlternativ: t.alt, utanEnvFil: true });
  assert.equal(b2.tokenKalla, 'mintad');
  assert.equal(f2.anrop.length, 2);
  t.stada();
});

test('anslut: CLI-token (atkn_) ignoreras och utan client-nycklar blir det ett tydligt fel', async () => {
  const t = tempMappar();
  const { fetchFn, anrop } = fejkShopify();
  const env = { SHOPIFY_SHOP: 'ny1234-ab.myshopify.com', SHOPIFY_ADMIN_TOKEN_NYBUTIK: 'atkn_cli', SHOPIFY_ADMIN_TOKEN_UTGAR_NYBUTIK: '2099-01-01T00:00:00Z' };
  await assert.rejects(
    () => anslut('nybutik', { env, envFil: join(t.rot, '.env'), fetchFn, sparrAlternativ: t.alt }),
    /SHOPIFY_CLIENT_ID \+ SHOPIFY_CLIENT_SECRET/
  );
  assert.equal(anrop.length, 0);
  t.stada();
});

test('anslut: förbjuden domän stoppar FÖRE första nätverksanropet', async () => {
  const t = tempMappar();
  const { fetchFn, anrop } = fejkShopify();
  const env = { SHOPIFY_SHOP: 'pzjagy-mz.myshopify.com', SHOPIFY_CLIENT_ID: 'cid', SHOPIFY_CLIENT_SECRET: 'csec' };
  await assert.rejects(() => anslut('nybutik', { env, envFil: join(t.rot, '.env'), fetchFn, sparrAlternativ: t.alt }), /^Error: STOPP — .*förbjuden/);
  assert.equal(anrop.length, 0);
  assert.equal(env.SHOPIFY_ADMIN_TOKEN, undefined);
  t.stada();
});

test('anslut: saknad SHOPIFY_SHOP ger fel utan nätverk', async () => {
  const t = tempMappar();
  const { fetchFn, anrop } = fejkShopify();
  await assert.rejects(() => anslut('nybutik', { env: {}, envFil: join(t.rot, '.env'), fetchFn, sparrAlternativ: t.alt }), /SHOPIFY_SHOP/);
  assert.equal(anrop.length, 0);
  t.stada();
});

test('anslut: butiksnamn som är ett känt brand stoppar EFTER läsningen, före skrivning', async () => {
  const t = tempMappar();
  t.butik('tankguard', 'TankGuard', 'y1sj1i-3d.myshopify.com');
  const { fetchFn } = fejkShopify({ namn: 'TankGuard', doman: 'y1sj1i-3d.myshopify.com' });
  const envFil = join(t.rot, '.env');
  const env = { SHOPIFY_SHOP: 'y1sj1i-3d.myshopify.com', SHOPIFY_CLIENT_ID: 'cid', SHOPIFY_CLIENT_SECRET: 'csec' };
  await assert.rejects(() => anslut('nybutik', { env, envFil, fetchFn, sparrAlternativ: t.alt }), /STOPP — .*"TankGuard"/);
  assert.equal(env.SHOPIFY_ADMIN_TOKEN, undefined, 'processen pekas inte om');
  assert.deepEqual(lasEnvFil(envFil), {}, 'inget skrivet till .env');
  t.stada();
});

test('anslut --torr: bara spärrarna, inget nätverk, inget skrivet', async () => {
  const t = tempMappar();
  const { fetchFn, anrop } = fejkShopify();
  const envFil = join(t.rot, '.env');
  const b = await anslut('nybutik', { torr: true, env: { SHOPIFY_SHOP: 'ny1234-ab.myshopify.com' }, envFil, fetchFn, sparrAlternativ: t.alt });
  assert.equal(b.torr, true);
  assert.equal(b.domain, 'ny1234-ab.myshopify.com');
  assert.equal(anrop.length, 0);
  assert.deepEqual(lasEnvFil(envFil), {});
  t.stada();
});

test('anslut: nycklar i .env-filen används när miljön saknar dem', async () => {
  const t = tempMappar();
  const envFil = join(t.rot, '.env');
  writeFileSync(envFil, 'SHOPIFY_SHOP=ny1234-ab.myshopify.com\nSHOPIFY_CLIENT_ID=cid\nSHOPIFY_CLIENT_SECRET=csec\nKIE_API_KEY=kie\n');
  const { fetchFn } = fejkShopify();
  const b = await anslut('nybutik', { env: {}, envFil, fetchFn, sparrAlternativ: t.alt });
  assert.equal(b.tokenKalla, 'mintad');
  const skrivet = lasEnvFil(envFil);
  assert.equal(skrivet.KIE_API_KEY, 'kie', 'andra rader kvar');
  assert.equal(skrivet.SHOPIFY_CLIENT_SECRET, 'csec', 'befintlig rad rörs inte');
  assert.match(skrivet.SHOPIFY_ADMIN_TOKEN_NYBUTIK, /^shpat_ny_/);
  t.stada();
});
