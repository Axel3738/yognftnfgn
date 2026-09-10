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
  tokenGiltig,
  spärrar,
  sparrar,
  skrivEnv,
  anslut,
  tolkaMintfel,
  storefrontLosenord,
  suffixForDoman,
  KRAVDA_SCOPES,
  SCOPE_RAD,
  saknadeScopes,
  forklaraSaknadeScopes,
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
function fejkShopify({ namn = 'My Store', doman = 'ny1234-ab.myshopify.com', avvisa = () => false, scopes = KRAVDA_SCOPES.map(([s]) => s), appNamn = 'Fabriken ny1234' } = {}) {
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
    // Som Shopify på riktigt (mätt 2026-09-10): frågar man efter themes utan
    // read_themes blir HELA data null och errors bär ACCESS_DENIED.
    const fragarTeman = String(init.body).includes('themes(');
    const nekad = fragarTeman && !scopes.includes('write_themes');
    return {
      ok: true,
      status: 200,
      text: async () => '',
      json: async () =>
        nekad
          ? { data: null, errors: [{ message: 'Access denied for themes field. Required access: `read_themes` access scope.', extensions: { code: 'ACCESS_DENIED' }, path: ['themes'] }] }
          : {
              data: {
                shop: { name: namn, myshopifyDomain: doman, currencyCode: 'SEK', email: 'x@y.se', primaryDomain: { host: 'ny.se' } },
                currentAppInstallation: { app: { title: appNamn, handle: 'fabriken' }, accessScopes: scopes.map((handle) => ({ handle })) },
                ...(fragarTeman
                  ? { themes: { nodes: [{ id: 'gid://shopify/OnlineStoreTheme/1', name: 'Dawn', role: 'MAIN' }] }, products: { nodes: [] } }
                  : {}),
              },
            },
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

// -------------------------------------------------- app_not_installed
//
// TackleBay 2026-09-10: en session läste Shopifys `app_not_installed` som
// "appen är avinstallerad" och bad VA:n installera om en app som redan satt.
// Det verkliga felet var att miljön blandade två butiker: SHOPIFY_SHOP pekade
// på TackleBay medan SHOPIFY_CLIENT_ID (utan suffix) stod kvar på TankGuard.

test('app_not_installed förklarar blandade nycklar FÖRST, avinstallation sen', () => {
  const text = tolkaMintfel({
    status: 400,
    kropp: '{"error":"invalid_request","error_description":"Oauth error app_not_installed"}',
    doman: 'iahe0c-b1.myshopify.com',
    butikId: 'tacklebay',
  });
  assert.ok(text.includes('SHOPIFY_CLIENT_ID_TACKLEBAY'), 'ska namnge butikens egen variabel');
  const pktBlandat = text.indexOf('ANNAN butik');
  const pktAvinst = text.indexOf('faktiskt avinstallerad');
  assert.ok(pktBlandat > -1 && pktAvinst > -1);
  assert.ok(pktBlandat < pktAvinst, 'den vanligaste orsaken ska stå först');
  assert.ok(text.includes('Be aldrig någon installera om appen innan punkt 1'));
});

test('andra mintfel förklaras inte bort — råsvaret står kvar', () => {
  const text = tolkaMintfel({ status: 401, kropp: 'invalid_client', doman: 'x.myshopify.com', butikId: 'x' });
  assert.ok(text.includes('401'));
  assert.ok(text.includes('invalid_client'));
  assert.ok(!text.includes('ANNAN butik'));
});

// -------------------------------------------------- miljöfällorna
//
// 2026-09-10: nycklarna STOD i Environment, och tre sessioner i rad läste
// ändå den gamla butiken. Två orsaker, båda osynliga i menyn: miljön läses
// vid sessionsstart, och kontot hade två environments med samma namn.

test('varje "fel butik"-fel bär båda miljöfällorna', () => {
  const t = tempMappar();
  t.butik('tankguard', 'TankGuard', 'y1sj1i-3d.myshopify.com');
  t.state('tankguard', 'tankoverdraget');
  const r = spärrar('nybutik', 'y1sj1i-3d.myshopify.com', t.alt);
  assert.equal(r.ok, false);
  assert.ok(r.skal.includes('NY session'), 'ska tipsa om att miljön läses vid start');
  assert.ok(r.skal.includes('SAMMA namn'), 'ska tipsa om dubbla environments');
  t.stada();
});

test('utan butiksdomän står fällorna också med', () => {
  const t = tempMappar();
  const r = spärrar('nybutik', '', t.alt);
  assert.equal(r.ok, false);
  assert.ok(r.skal.includes('BÅDA'));
  t.stada();
});

test('en grön anslutning bär inga felsökningsrader', () => {
  const t = tempMappar();
  const r = spärrar('nybutik', 'ikf0tu-5e.myshopify.com', t.alt);
  assert.equal(r.ok, true);
  assert.equal(r.skal, '');
  t.stada();
});

// -------------------------------------------------- storefront-lösenordet
//
// Axel kör flera butiker i parallella sessioner ur SAMMA Environment
// (2026-09-10). Utan per-butik-uppslaget hämtar kundvyn grannens lösenord.

test('storefrontLosenord: butikens egen rad vinner över den allmänna', () => {
  const env = {
    SHOPIFY_STOREFRONT_PASSWORD: 'tankguards',
    SHOPIFY_STOREFRONT_PASSWORD_KALENDER: 'kalenderns',
  };
  assert.equal(storefrontLosenord('kalender', env), 'kalenderns');
  assert.equal(storefrontLosenord('tankguard', env), 'tankguards', 'utan egen rad gäller den allmänna');
  assert.equal(storefrontLosenord('kalender', {}), '');
});

// -------------------------------------------------- adressen är facit
//
// Axels beslut 2026-09-10: ingen ska behöva veta vad ett "butiks-id" är.
// VA:n sätter fyra rader med vilket suffix som helst och skriver
// butiksadressen i prompten; koden letar upp suffixet ur adressen.

test('suffixForDoman hittar butikens suffix ur adressen', () => {
  const env = {
    SHOPIFY_SHOP: 'y1sj1i-3d.myshopify.com',
    SHOPIFY_SHOP_TANKGUARD: 'y1sj1i-3d.myshopify.com',
    SHOPIFY_SHOP_IKF0TU_5E: 'https://IKF0TU-5E.myshopify.com/',
  };
  assert.equal(suffixForDoman('ikf0tu-5e.myshopify.com', env), 'IKF0TU_5E');
  assert.equal(suffixForDoman('y1sj1i-3d.myshopify.com', env), 'TANKGUARD');
  assert.equal(suffixForDoman('finns-inte.myshopify.com', env), null);
  assert.equal(suffixForDoman('', env), null);
});

test('anslut med onskadDoman läser rätt butik oavsett butiks-id', async () => {
  const t = tempMappar();
  const { fetchFn } = fejkShopify({ namn: 'Kalendern', doman: 'ikf0tu-5e.myshopify.com' });
  const env = {
    // De utan suffix står på TankGuard — precis som i verkligheten.
    SHOPIFY_SHOP: 'y1sj1i-3d.myshopify.com',
    SHOPIFY_CLIENT_ID: 'tankguard-id',
    SHOPIFY_CLIENT_SECRET: 'tankguard-hemlis',
    SHOPIFY_SHOP_IKF0TU_5E: 'ikf0tu-5e.myshopify.com',
    SHOPIFY_CLIENT_ID_IKF0TU_5E: 'kalender-id',
    SHOPIFY_CLIENT_SECRET_IKF0TU_5E: 'kalender-hemlis',
  };
  const b = await anslut('nagot-annat-id', {
    env,
    utanEnvFil: true,
    fetchFn,
    sparrAlternativ: t.alt,
    onskadDoman: 'ikf0tu-5e.myshopify.com',
  });
  assert.equal(b.domain, 'ikf0tu-5e.myshopify.com', 'adressen vinner över butiks-id:t');
  t.stada();
});

test('saknas adressen i miljön listas vad som FINNS, med färdiga rader att klistra', async () => {
  const t = tempMappar();
  const env = { SHOPIFY_SHOP: 'y1sj1i-3d.myshopify.com', SHOPIFY_SHOP_TANKGUARD: 'y1sj1i-3d.myshopify.com' };
  await assert.rejects(
    () => anslut('kalender', { env, utanEnvFil: true, sparrAlternativ: t.alt, onskadDoman: 'ikf0tu-5e.myshopify.com' }),
    (e) => {
      assert.ok(e.message.includes('finns inte i miljön'));
      assert.ok(e.message.includes('SHOPIFY_SHOP_TANKGUARD = y1sj1i-3d.myshopify.com'), 'ska visa vad som FINNS');
      assert.ok(e.message.includes('SHOPIFY_SHOP_IKF0TU_5E = ikf0tu-5e.myshopify.com'), 'ska ge raden att klistra in');
      assert.ok(e.message.includes('NY session'), 'miljöfällorna ska hänga med');
      return true;
    }
  );
  t.stada();
});

test('utan onskadDoman fungerar allt som förut — gamla butiker går inte sönder', async () => {
  const t = tempMappar();
  const { fetchFn } = fejkShopify({ namn: 'Kalendern', doman: 'ikf0tu-5e.myshopify.com' });
  const env = { SHOPIFY_SHOP: 'ikf0tu-5e.myshopify.com', SHOPIFY_CLIENT_ID: 'x', SHOPIFY_CLIENT_SECRET: 'y' };
  const b = await anslut('kalender', { env, utanEnvFil: true, fetchFn, sparrAlternativ: t.alt });
  assert.equal(b.domain, 'ikf0tu-5e.myshopify.com');
  t.stada();
});

// -------------------------------------------------- appens scopes
//
// TackleBay 2026-09-10: rätt butik, rätt nycklar, token mintad — och appen
// hade noll scopes. Steg 0 dog på en rå `read_themes`-text. Nu ska felet
// säga "Connected ✓" OCH exakt vad som ska klistras in på dev.shopify.com.

test('saknadeScopes: write_x täcker read_x, tom lista = allt saknas', () => {
  assert.equal(saknadeScopes(KRAVDA_SCOPES.map(([s]) => s)).length, 0);
  assert.equal(saknadeScopes([]).length, KRAVDA_SCOPES.length);
  assert.equal(saknadeScopes(null).length, KRAVDA_SCOPES.length);
  // read_locations täcks av write_locations
  const utanRead = KRAVDA_SCOPES.map(([s]) => (s === 'read_locations' ? 'write_locations' : s));
  assert.equal(saknadeScopes(utanRead).length, 0);
  // objektformen ur GraphQL ({ handle }) fungerar också
  assert.equal(saknadeScopes(KRAVDA_SCOPES.map(([handle]) => ({ handle }))).length, 0);
  const saknas = saknadeScopes(KRAVDA_SCOPES.map(([s]) => s).filter((s) => s !== 'write_themes'));
  assert.deepEqual(saknas.map(([s]) => s), ['write_themes']);
});

test('SCOPE_RAD är en kommaseparerad rad utan mellanslag — den ska gå att klistra rakt in', () => {
  assert.equal(SCOPE_RAD.split(',').length, KRAVDA_SCOPES.length);
  assert.ok(!/\s/.test(SCOPE_RAD));
  assert.ok(SCOPE_RAD.includes('write_themes') && SCOPE_RAD.includes('write_legal_policies'));
});

test('forklaraSaknadeScopes: börjar med Connected ✓, listar scopen och raden att klistra in', () => {
  const text = forklaraSaknadeScopes({ doman: 'iahe0c-b1.myshopify.com', namn: 'TackleBay', appNamn: 'Fabriken iahe0c', saknas: saknadeScopes([]) });
  assert.ok(text.startsWith('STOPP — Connected: iahe0c-b1.myshopify.com ✓ (TackleBay)'));
  assert.match(text, /"Fabriken iahe0c" har bara 0 av \d+ scopes/);
  assert.ok(text.includes(SCOPE_RAD));
  assert.ok(text.includes('dev.shopify.com'));
  assert.ok(text.includes('write_themes'));
  assert.ok(text.includes('Release'));
});

test('anslut: app utan scopes stoppar EFTER Connected, före skrivning, med raden att klistra in', async () => {
  const t = tempMappar();
  const envFil = join(t.rot, '.env');
  const { fetchFn } = fejkShopify({ namn: 'TackleBay', doman: 'iahe0c-b1.myshopify.com', scopes: [], appNamn: 'Fabriken iahe0c' });
  const env = { SHOPIFY_SHOP: 'iahe0c-b1.myshopify.com', SHOPIFY_CLIENT_ID: 'cid', SHOPIFY_CLIENT_SECRET: 'csec' };
  await assert.rejects(
    () => anslut('tacklebay', { env, envFil, fetchFn, sparrAlternativ: t.alt }),
    (e) => e.message.startsWith('STOPP — Connected: iahe0c-b1.myshopify.com ✓ (TackleBay)') && e.message.includes(SCOPE_RAD) && e.message.includes('Fabriken iahe0c')
  );
  assert.equal(env.SHOPIFY_ADMIN_TOKEN, undefined, 'ingen token i processen');
  assert.equal(Object.keys(lasEnvFil(envFil)).length, 0, 'ingen .env skriven');
  t.stada();
});

test('anslut: app med alla scopes går igenom och rapporterar dem', async () => {
  const t = tempMappar();
  const envFil = join(t.rot, '.env');
  const { fetchFn } = fejkShopify({ namn: 'My Store 3', appNamn: 'Fabriken ny1234' });
  const env = { SHOPIFY_SHOP: 'ny1234-ab.myshopify.com', SHOPIFY_CLIENT_ID: 'cid', SHOPIFY_CLIENT_SECRET: 'csec' };
  const b = await anslut('nybutik', { env, envFil, fetchFn, sparrAlternativ: t.alt });
  assert.equal(b.appNamn, 'Fabriken ny1234');
  assert.equal(b.scopes.length, KRAVDA_SCOPES.length);
  assert.equal(b.teman.length, 1);
  t.stada();
});

test('anslut: sparad token utan scopes → minta om EN gång innan stoppet (appen kan ha fått scopen efteråt)', async () => {
  const t = tempMappar();
  const envFil = join(t.rot, '.env');
  // Första läsningen (sparad token) svarar noll scopes, den nymintade svarar alla.
  let lasningar = 0;
  const alla = KRAVDA_SCOPES.map(([s]) => s);
  const fetchFn = async (url, init) => {
    if (url.endsWith('/admin/oauth/access_token')) {
      return { ok: true, status: 200, json: async () => ({ access_token: 'shpat_ny_1', expires_in: 86399 }), text: async () => '' };
    }
    lasningar += 1;
    const scopes = init.headers['X-Shopify-Access-Token'] === 'shpat_gammal' ? [] : alla;
    return fejkShopify({ scopes }).fetchFn(url, init);
  };
  const env = {
    SHOPIFY_SHOP: 'ny1234-ab.myshopify.com',
    SHOPIFY_CLIENT_ID: 'cid',
    SHOPIFY_CLIENT_SECRET: 'csec',
    SHOPIFY_ADMIN_TOKEN_NYBUTIK: 'shpat_gammal',
    SHOPIFY_ADMIN_TOKEN_UTGAR_NYBUTIK: new Date(Date.now() + 3_600_000).toISOString(),
    SHOPIFY_STORE_DOMAIN_NYBUTIK: 'ny1234-ab.myshopify.com',
  };
  const b = await anslut('nybutik', { env, envFil, fetchFn, sparrAlternativ: t.alt });
  assert.equal(b.tokenKalla, 'mintad');
  assert.equal(lasningar, 3, 'två läsningar med den gamla (full + scope-fri), en med den nya');
  assert.equal(env.SHOPIFY_ADMIN_TOKEN, 'shpat_ny_1');
  t.stada();
});

test('anslut: kravScopes=false hoppar över scope-spärren (bara för verktyg som enbart läser shop)', async () => {
  const t = tempMappar();
  const envFil = join(t.rot, '.env');
  const { fetchFn } = fejkShopify({ scopes: [] });
  const env = { SHOPIFY_SHOP: 'ny1234-ab.myshopify.com', SHOPIFY_CLIENT_ID: 'cid', SHOPIFY_CLIENT_SECRET: 'csec' };
  const b = await anslut('nybutik', { env, envFil, fetchFn, sparrAlternativ: t.alt, kravScopes: false });
  assert.equal(b.name, 'My Store');
  assert.deepEqual(b.teman, []);
  assert.equal(b.harProdukter, null);
  t.stada();
});
