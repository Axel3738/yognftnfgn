// Tester för shopify.mjs — den rena logiken (temaval, mediamatchning, frakt,
// userErrors) och anropsformerna, med `fetch` utbytt mot en stubb som svarar
// ur en kö och bokför vad som skickades. Ingen nätverkstrafik.

import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  graphql,
  hittaUserErrors,
  valjArbetstema,
  hamtaArbetstema,
  filnamnUrUrl,
  filstamUrUrl,
  matchaProduktfiler,
  skapaProdukt,
  skrivSida,
  skrivMeny,
  skrivKollektion,
  tolkaMenyrader,
  tolkaFraktprofil,
  byggFraktprofilInput,
  tillampaFraktatgarder,
  verifieraTemafiler,
  publiceraIButiken,
} from '../shopify.mjs';

// ---- stubben ----

const riktigFetch = globalThis.fetch;
let skickat = [];
let ko = [];

function fejkaShopify(svar) {
  ko = [...svar];
  skickat = [];
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    skickat.push({ url, token: init.headers['X-Shopify-Access-Token'], ...body });
    const nasta = ko.shift();
    if (!nasta) throw new Error(`Stubben fick ett anrop den inte väntade sig: ${body.query.slice(0, 60)}`);
    if (nasta.http) return { ok: false, status: nasta.http, text: async () => nasta.text ?? '' };
    return { ok: true, status: 200, json: async () => nasta };
  };
}

beforeEach(() => {
  process.env.SHOPIFY_STORE_DOMAIN = 'testbutiken.myshopify.com';
  process.env.SHOPIFY_ADMIN_TOKEN = 'shpat_test';
});
afterEach(() => {
  globalThis.fetch = riktigFetch;
});

// ---- userErrors ----

test('hittaUserErrors plockar fel ur alla payloader, med fält, filnamn och kod', () => {
  const fel = hittaUserErrors({
    pageCreate: { page: null, userErrors: [{ field: ['page', 'handle'], message: 'upptaget' }] },
    themeFilesUpsert: { userErrors: [{ filename: 'a.liquid', message: 'trasig' }] },
    discountCodeBasicCreate: { userErrors: [{ code: 'TAKEN', message: 'finns' }] },
    shop: { name: 'x' },
    tomt: { userErrors: [] },
  });
  assert.equal(fel.length, 3);
  assert.deepEqual(fel[0], { operation: 'pageCreate', falt: 'page.handle', kod: null, meddelande: 'upptaget' });
  assert.equal(fel[1].falt, 'a.liquid');
  assert.equal(fel[2].kod, 'TAKEN');
  assert.deepEqual(hittaUserErrors({ shop: { name: 'x' } }), []);
  assert.deepEqual(hittaUserErrors(null), []);
});

test('graphql kastar på userErrors, släpper igenom rena svar och respekterar tillatUserErrors', async () => {
  fejkaShopify([
    { data: { pageCreate: { userErrors: [{ field: ['handle'], message: 'Handle already in use' }] } } },
    { data: { shop: { name: 'Butiken' } } },
    { data: { x: { userErrors: [{ message: 'mjukt' }] } } },
  ]);
  await assert.rejects(() => graphql('mutation { pageCreate }'), /pageCreate \(handle\): Handle already in use/);
  assert.deepEqual(await graphql('query { shop { name } }'), { shop: { name: 'Butiken' } });
  const mjukt = await graphql('mutation { x }', {}, { tillatUserErrors: true });
  assert.equal(mjukt.x.userErrors[0].message, 'mjukt');

  assert.equal(skickat[0].token, 'shpat_test');
  assert.match(skickat[0].url, /^https:\/\/testbutiken\.myshopify\.com\/admin\/api\/20\d\d-\d\d\/graphql\.json$/);
});

test('graphql kastar på HTTP-fel och GraphQL-fel', async () => {
  fejkaShopify([{ http: 401, text: 'Invalid token' }, { errors: [{ message: 'syntax' }] }]);
  await assert.rejects(() => graphql('{ shop { name } }'), /Shopify svarade 401: Invalid token/);
  await assert.rejects(() => graphql('{ shop { name } }'), /GraphQL-fel/);
});

// ---- arbetstemat ----

const TEMAN = [
  { id: 'gid://shopify/OnlineStoreTheme/1', name: 'Horizon', role: 'UNPUBLISHED' },
  { id: 'gid://shopify/OnlineStoreTheme/2', name: 'DryTrek – CRO (utkast)', role: 'UNPUBLISHED' },
  { id: 'gid://shopify/OnlineStoreTheme/3', name: 'DryTrek – CRO', role: 'MAIN' },
];

test('valjArbetstema: id vinner, som fullt gid eller bara numret', () => {
  assert.equal(valjArbetstema(TEMAN, 'gid://shopify/OnlineStoreTheme/1').name, 'Horizon');
  assert.equal(valjArbetstema(TEMAN, '2').name, 'DryTrek – CRO (utkast)');
  assert.equal(valjArbetstema(TEMAN, 2).name, 'DryTrek – CRO (utkast)');
});

test('valjArbetstema: utan id tas CRO-temat som är MAIN före CRO-utkastet', () => {
  assert.equal(valjArbetstema(TEMAN).id, 'gid://shopify/OnlineStoreTheme/3');
  assert.equal(valjArbetstema(TEMAN.slice(0, 2)).id, 'gid://shopify/OnlineStoreTheme/2');
  // Ett id som inte finns längre faller tillbaka på CRO-regeln.
  assert.equal(valjArbetstema(TEMAN, '999').id, 'gid://shopify/OnlineStoreTheme/3');
});

test('valjArbetstema: "första UNPUBLISHED" gissas aldrig — utan CRO-tema blir det null', () => {
  assert.equal(valjArbetstema([TEMAN[0]]), null);
  assert.equal(valjArbetstema([{ id: 'x', name: 'Microscope', role: 'MAIN' }]), null);
  assert.equal(valjArbetstema([], null), null);
});

test('hamtaArbetstema kastar med temalistan när inget passar', async () => {
  fejkaShopify([{ data: { themes: { nodes: [TEMAN[0]] } } }]);
  await assert.rejects(() => hamtaArbetstema('7'), /id 7 finns inte.*Horizon \(UNPUBLISHED, 1\)/);
});

// ---- produkten ----

test('filnamnUrUrl och filstamUrUrl normaliserar som Shopify gör', () => {
  assert.equal(filnamnUrUrl('https://cdn.shopify.com/s/files/1/Foto%20A.JPG?v=12'), 'Foto A.JPG');
  assert.equal(filstamUrUrl('https://cdn.shopify.com/s/files/1/Foto%20A.JPG?v=12'), 'foto_a');
  assert.equal(filstamUrUrl('https://x/bild-1_abc123.png'), 'bild-1_abc123');
  assert.equal(filstamUrUrl(''), '');
});

test('matchaProduktfiler byter ut redan uppladdade bilder mot media-id, en gång var', () => {
  const media = [
    { id: 'gid://m/1', filnamn: 'front.jpg', filstam: 'front' },
    { id: 'gid://m/2', filnamn: 'sida_a1b2c3.jpg', filstam: 'sida_a1b2c3' },
    { id: 'gid://m/3', filnamn: null, filstam: null },
  ];
  const ut = matchaProduktfiler(
    [
      { originalSource: 'https://k/front.jpg', contentType: 'IMAGE', alt: '[SV] Fram' },
      { originalSource: 'https://k/sida.jpg', contentType: 'IMAGE', alt: 'Sidan' },
      { originalSource: 'https://k/front.jpg', contentType: 'IMAGE', alt: 'dubblett' },
      { originalSource: 'https://k/ny.jpg', contentType: 'IMAGE', alt: 'Ny' },
      { id: 'gid://m/9', alt: 'redan id' },
    ],
    media
  );
  assert.deepEqual(ut[0], { id: 'gid://m/1', alt: '[SV] Fram' });
  assert.deepEqual(ut[1], { id: 'gid://m/2', alt: 'Sidan' });
  assert.equal(ut[2].originalSource, 'https://k/front.jpg', 'media-id:t används bara en gång');
  assert.equal(ut[3].originalSource, 'https://k/ny.jpg');
  assert.deepEqual(ut[4], { id: 'gid://m/9', alt: 'redan id' });
  assert.equal(matchaProduktfiler(undefined, media), undefined);
});

const PRODUKTSVAR = (extra = {}) => ({
  data: {
    productSet: {
      product: {
        id: 'gid://shopify/Product/10',
        legacyResourceId: '10',
        handle: 'tanken',
        title: 'Tanken',
        status: 'ACTIVE',
        onlineStorePreviewUrl: 'https://x/products/tanken',
        variants: { nodes: [{ id: 'gid://shopify/ProductVariant/100' }] },
        ...extra,
      },
      userErrors: [],
    },
  },
});

test('skapaProdukt är idempotent: befintlig produkt får id, behåller status och återanvänder media', async () => {
  fejkaShopify([
    {
      data: {
        productByIdentifier: {
          id: 'gid://shopify/Product/10',
          handle: 'tanken',
          status: 'DRAFT',
          media: { nodes: [{ id: 'gid://m/1', image: { url: 'https://cdn/front_x1.jpg?v=1' } }] },
          variants: { nodes: [] },
        },
      },
    },
    PRODUKTSVAR({ status: 'DRAFT' }),
  ]);
  const ut = await skapaProdukt({
    handle: 'tanken',
    title: 'Tanken',
    status: 'ACTIVE',
    files: [{ originalSource: 'https://k/front.jpg', contentType: 'IMAGE', alt: 'Fram' }],
  });
  const input = skickat[1].variables.input;
  assert.equal(input.id, 'gid://shopify/Product/10');
  assert.equal(input.status, 'DRAFT', 'statusen i butiken bevaras vid omkörning');
  assert.deepEqual(input.files, [{ id: 'gid://m/1', alt: 'Fram' }]);
  assert.deepEqual(ut.variantIds, ['gid://shopify/ProductVariant/100']);
  assert.equal(ut.handle, 'tanken');
  assert.equal('variants' in ut, false);
});

test('skapaProdukt: status i andra argumentet tvingar, id hoppar inte över uppslagningen', async () => {
  fejkaShopify([
    { data: { productByIdentifier: { id: 'gid://shopify/Product/10', status: 'DRAFT', media: { nodes: [] }, variants: { nodes: [] } } } },
    PRODUKTSVAR(),
  ]);
  await skapaProdukt({ handle: 'tanken', title: 'Tanken', status: 'DRAFT' }, { status: 'ACTIVE' });
  assert.equal(skickat[1].variables.input.status, 'ACTIVE');
  assert.equal(skickat[1].variables.input.id, 'gid://shopify/Product/10');
});

test('skapaProdukt: ny produkt skickas utan id och med planens status', async () => {
  fejkaShopify([{ data: { productByIdentifier: null } }, PRODUKTSVAR()]);
  await skapaProdukt({ handle: 'tanken', title: 'Tanken', status: 'ACTIVE', files: [{ originalSource: 'https://k/a.jpg' }] });
  const input = skickat[1].variables.input;
  assert.equal('id' in input, false);
  assert.equal(input.status, 'ACTIVE');
  assert.deepEqual(input.files, [{ originalSource: 'https://k/a.jpg' }]);
});

test('skapaProdukt kastar begripligt när Shopify avvisar', async () => {
  fejkaShopify([
    { data: { productByIdentifier: null } },
    { data: { productSet: { product: null, userErrors: [{ field: ['input', 'handle'], message: 'Handle already in use' }] } } },
  ]);
  await assert.rejects(
    () => skapaProdukt({ handle: 'tanken', title: 'T' }),
    /Shopify avvisade produkten: .*productSet \(input\.handle\): Handle already in use/s
  );
});

// ---- sidor, menyer, kollektion: båda anropsformerna ----

test('skrivSida tar { title, body } och (title, body), uppdaterar på exakt handle-träff', async () => {
  fejkaShopify([
    { data: { pages: { nodes: [{ id: 'gid://p/1', handle: 'frakt-och-retur' }, { id: 'gid://p/2', handle: 'frakt' }] } } },
    { data: { pageUpdate: { page: { id: 'gid://p/2', handle: 'frakt' }, userErrors: [] } } },
    { data: { pages: { nodes: [] } } },
    { data: { pageCreate: { page: { id: 'gid://p/3', handle: 'kontakt' }, userErrors: [] } } },
  ]);
  const a = await skrivSida('frakt', { title: 'Frakt', body: '<p>a</p>' });
  assert.equal(a.id, 'gid://p/2');
  assert.deepEqual(skickat[1].variables, { id: 'gid://p/2', page: { title: 'Frakt', body: '<p>a</p>' } });

  const b = await skrivSida('kontakt', 'Kontakt', '<p>b</p>');
  assert.equal(b.handle, 'kontakt');
  assert.deepEqual(skickat[3].variables.page, { title: 'Kontakt', body: '<p>b</p>', handle: 'kontakt' });
});

test('tolkaMenyrader tål titel och title', () => {
  assert.deepEqual(tolkaMenyrader([{ titel: 'Hem', url: '/' }, { title: 'Frakt', url: '/pages/frakt' }]), [
    { titel: 'Hem', url: '/' },
    { titel: 'Frakt', url: '/pages/frakt' },
  ]);
});

test('skrivMeny(handle, rader) skapar med härledd titel; oförändrad meny rörs inte', async () => {
  fejkaShopify([
    { data: { menus: { nodes: [] } } },
    { data: { menuCreate: { menu: { id: 'gid://menu/1', handle: 'main-menu' }, userErrors: [] } } },
    { data: { menus: { nodes: [{ id: 'gid://menu/2', handle: 'footer', title: 'Footer menu', items: [{ title: 'Kontakt', url: '/pages/contact' }] }] } } },
  ]);
  const skapad = await skrivMeny('main-menu', [{ titel: 'Hem', url: '/' }]);
  assert.equal(skapad.handle, 'main-menu');
  assert.equal(skickat[1].variables.title, 'Main menu');
  assert.deepEqual(skickat[1].variables.items, [{ title: 'Hem', type: 'HTTP', url: '/' }]);

  const orord = await skrivMeny('footer', 'Footer menu', [{ titel: 'Kontakt', url: '/pages/contact' }]);
  assert.equal(orord.orord, true);
  assert.equal(skickat.length, 3, 'ingen mutation när menyn redan stämmer');
});

test('skrivKollektion tar ett input-objekt och uppdaterar befintlig kollektion med id', async () => {
  fejkaShopify([
    { data: { collections: { nodes: [{ id: 'gid://c/1', handle: 'sortiment', title: 'Gammal' }] } } },
    { data: { collectionUpdate: { collection: { id: 'gid://c/1', handle: 'sortiment', title: 'Sortimentet' }, userErrors: [] } } },
  ]);
  const ut = await skrivKollektion({ handle: 'sortiment', titel: 'Sortimentet', produktIds: ['gid://p/1'] });
  assert.equal(ut.skapad, false);
  assert.deepEqual(skickat[1].variables.input, {
    handle: 'sortiment',
    title: 'Sortimentet',
    descriptionHtml: '',
    products: ['gid://p/1'],
    sortOrder: 'MANUAL',
    id: 'gid://c/1',
  });
});

test('publiceraIButiken kastar aldrig — fel blir { publicerad:false, notis }', async () => {
  fejkaShopify([{ errors: [{ message: 'Access denied for publications' }] }]);
  const ut = await publiceraIButiken('gid://p/1');
  assert.equal(ut.publicerad, false);
  assert.match(ut.notis, /Access denied/);
});

// ---- teman ----

test('verifieraTemafiler svarar { ok, fel } och är samtidigt fel-listan', async () => {
  fejkaShopify([
    { data: { theme: { files: { nodes: [{ filename: 'assets/a.css', size: 3 }, { filename: 'assets/b.css', size: 99 }] } } } },
  ]);
  const ut = await verifieraTemafiler('gid://t/1', { 'assets/a.css': 'abc', 'assets/b.css': 'abc', 'assets/c.css': 'x' });
  assert.equal(ut.ok, false);
  assert.deepEqual(ut.fel, ['assets/b.css: 99 byte i temat, 3 lokalt', 'assets/c.css: saknas i temat']);
  assert.equal(ut.length, 2);
  assert.equal(ut.join('; '), ut.fel.join('; '));

  fejkaShopify([{ data: { theme: { files: { nodes: [{ filename: 'assets/a.css', size: 3 }] } } } }]);
  const gront = await verifieraTemafiler('gid://t/1', { 'assets/a.css': 'abc' });
  assert.equal(gront.ok, true);
  assert.equal(gront.length, 0);
});

// ---- frakt ----

const PROFIL = {
  id: 'gid://dp/1',
  profileLocationGroups: [
    {
      locationGroup: { id: 'gid://lg/1' },
      locationGroupZones: {
        nodes: [
          {
            zone: { id: 'gid://z/1', name: 'Sverige' },
            methodDefinitions: {
              nodes: [
                { id: 'gid://md/1', name: 'Normal', active: true, rateProvider: { id: 'gid://rd/1', price: { amount: '65.0' } } },
                { id: 'gid://md/1?source=RateRangeCondition&source_id=5', name: 'Normal', active: true, rateProvider: { id: 'gid://rd/1', price: { amount: '0.0' } } },
                { id: 'gid://md/2', name: 'Express', active: true, rateProvider: { id: 'gid://rd/2', price: { amount: '99.0' } } },
              ],
            },
          },
          { zone: { id: 'gid://z/2', name: 'Internationell' }, methodDefinitions: { nodes: [] } },
        ],
      },
    },
  ],
};

test('tolkaFraktprofil släpper villkorsraderna och märker basmetoden villkorad', () => {
  const lage = tolkaFraktprofil(PROFIL);
  assert.equal(lage.profilId, 'gid://dp/1');
  assert.equal(lage.gruppId, 'gid://lg/1');
  assert.deepEqual(lage.zoner[0].metoder, [
    { id: 'gid://md/1', namn: 'Normal', pris: 65, rateId: 'gid://rd/1', villkorad: true },
    { id: 'gid://md/2', namn: 'Express', pris: 99, rateId: 'gid://rd/2', villkorad: false },
  ]);
  assert.deepEqual(lage.zoner[1].metoder, []);
  assert.equal(tolkaFraktprofil(null), null);
});

test('byggFraktprofilInput river villkorade, skapar och uppdaterar — bara zoner med jobb tas med', () => {
  const lage = tolkaFraktprofil(PROFIL);
  const profile = byggFraktprofilInput(lage, {
    attTaBort: [{ zon: 'Sverige', id: 'gid://md/1', namn: 'Normal' }],
    attSkapa: [{ zon: 'Sverige', metod: { namn: 'Fri frakt', pris: 0, valuta: 'SEK' } }],
    attUppdatera: [{ zon: 'Sverige', id: 'gid://md/2', rateId: 'gid://rd/2', metod: { namn: 'Express', pris: 79, valuta: 'SEK' } }],
  });
  assert.deepEqual(profile.methodDefinitionsToDelete, ['gid://md/1']);
  const grupp = profile.locationGroupsToUpdate[0];
  assert.equal(grupp.id, 'gid://lg/1');
  assert.equal(grupp.zonesToUpdate.length, 1, 'Internationell har inget att göra');
  const z = grupp.zonesToUpdate[0];
  assert.equal(z.id, 'gid://z/1');
  assert.deepEqual(z.methodDefinitionsToCreate, [
    { name: 'Fri frakt', active: true, rateDefinition: { price: { amount: '0.0', currencyCode: 'SEK' } } },
  ]);
  assert.deepEqual(z.methodDefinitionsToUpdate, [
    { id: 'gid://md/2', name: 'Express', active: true, rateDefinition: { id: 'gid://rd/2', price: { amount: '79.0', currencyCode: 'SEK' } } },
  ]);
});

test('tillampaFraktatgarder(atgarder) läser läget själv; orört gör inget anrop', async () => {
  fejkaShopify([]);
  assert.deepEqual(await tillampaFraktatgarder({ orort: true, attSkapa: [], attUppdatera: [], attTaBort: [] }), { andrade: 0 });
  assert.equal(skickat.length, 0);

  fejkaShopify([
    { data: { deliveryProfiles: { nodes: [PROFIL] } } },
    { data: { deliveryProfileUpdate: { profile: { id: 'gid://dp/1' }, userErrors: [] } } },
  ]);
  const ut = await tillampaFraktatgarder({
    orort: false,
    attTaBort: [{ zon: 'Sverige', id: 'gid://md/1', namn: 'Normal' }],
    attSkapa: [{ zon: 'Sverige', metod: { namn: 'Fri frakt', pris: 0, valuta: 'SEK' } }],
    attUppdatera: [],
  });
  assert.deepEqual(ut, { andrade: 2 });
  assert.equal(skickat[1].variables.id, 'gid://dp/1');
  assert.deepEqual(skickat[1].variables.profile.methodDefinitionsToDelete, ['gid://md/1']);
});
