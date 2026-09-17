// Tester för butikspubliceringen — allt utan nät: nycklarna ur ett env-objekt,
// temafilerna, den publika granskningen, och tema/sida-stegen mot en låtsas-klient.

import test from 'node:test';
import assert from 'node:assert/strict';
import { losButik, temafiler, granskaPublikSida, installeraTema, publiceraSida, hittaSida, arBaverbutiken, MALLSUFFIX, skapaKlient } from '../butik.mjs';
import { CSS } from '../html.mjs';

const ENV = {
  SHOPIFY_SHOP_SE: '4snrw0-mg.myshopify.com', SHOPIFY_CLIENT_ID_SE: 'id-se', SHOPIFY_CLIENT_SECRET_SE: 'hemlig-se',
  SHOPIFY_SHOP_yitrbk_m3: 'yitrbk-m3.myshopify.com', SHOPIFY_CLIENT_ID_yitrbk_m3: 'id-cs', SHOPIFY_CLIENT_SECRET_yitrbk_m3: 'hemlig-cs', SHOPIFY_STOREFRONT_PASSWORD_yitrbk_m3: 'pw',
  SHOPIFY_SHOP_TACKLEBAY: 'j0p8qz-kp.myshopify.com', SHOPIFY_CLIENT_ID_TACKLEBAY: 'id-tb', SHOPIFY_CLIENT_SECRET_TACKLEBAY: 'hemlig-tb',
};

test('losButik: Bäverbutiken ur _SE, OPS-butik via butiksfilens domän, okänd stoppar', () => {
  assert.ok(arBaverbutiken('baverbutiken') && arBaverbutiken('SE') && arBaverbutiken('Bäverbutiken') && !arBaverbutiken('carashell'));
  const b = losButik('baverbutiken', ENV);
  assert.deepEqual(b, { id: 'baverbutiken', shop: '4snrw0-mg.myshopify.com', clientId: 'id-se', clientSecret: 'hemlig-se', losenord: '', kalla: 'SHOPIFY_*_SE' });
  const ny = losButik('se', { ...ENV, SHOPIFY_CLIENT_ID_SE_BAVER_SE: 'ny-id', SHOPIFY_CLIENT_SECRET_SE_BAVER_SE: 'ny-hemlig' });
  assert.equal(ny.clientId, 'ny-id', 'appen med alla scopes vinner när den finns');
  const cs = losButik('carashell', ENV);
  assert.equal(cs.shop, 'yitrbk-m3.myshopify.com');
  assert.equal(cs.losenord, 'pw');
  assert.equal(cs.kalla, 'SHOPIFY_*_yitrbk_m3');
  assert.throws(() => losButik('finns-inte', ENV), /ingen factory\/butiker\/finns-inte\.yaml/);
  assert.throws(() => losButik('carashell', { SHOPIFY_SHOP_SE: 'x' }), /för yitrbk-m3\.myshopify\.com/);
  assert.throws(() => losButik('baverbutiken', {}), /saknar SHOPIFY_SHOP_SE/);
  assert.throws(() => losButik('', ENV), /butik saknas/);
});

test('temafiler: layout utan header/footer, sidmall med layout-taggen, CSS:en är html.mjs CSS', () => {
  const f = temafiler();
  assert.deepEqual(Object.keys(f), ['layout/listicle.liquid', 'templates/page.listicle.liquid', 'assets/listicle.css']);
  const layout = f['layout/listicle.liquid'];
  assert.ok(layout.includes('{{ content_for_header }}') && layout.includes('{{ content_for_layout }}'));
  assert.ok(!/sections\s+'header|sections\s+'footer|section\s+'header|section\s+'footer/.test(layout), 'ingen header/footer i layouten');
  assert.ok(layout.includes("'listicle.css' | asset_url | stylesheet_tag") && layout.includes('fonts.googleapis.com/css2?family=Anton'));
  // Sidmallen läser page.content, byter prisplatserna (data-lp-produkt → all_products) och skriver ut resultatet.
  const sidmall = f['templates/page.listicle.liquid'];
  assert.ok(sidmall.includes("{% layout 'listicle' %}") && sidmall.includes('assign lp_innehall = page.content') && sidmall.trim().endsWith('{{ lp_innehall }}'));
  assert.ok(f['assets/listicle.css'].includes(CSS) && f['assets/listicle.css'].includes('body.listicle-sida{margin:0'));
  assert.equal(MALLSUFFIX, 'listicle');
});

test('granskaPublikSida: rätt sida är grön, header/footer/sektioner/meny är röda', () => {
  const ok = '<html><head><link href="//cdn/assets/listicle.css"></head><body class="listicle-sida"><div class="lr"><section class="lr-hero"></section><footer class="lr-sidfot"></footer></div></body></html>';
  assert.deepEqual(granskaPublikSida(ok), { ok: true, fel: [] });
  const fel = granskaPublikSida('<html><body><div id="shopify-section-header"><header class="site-header"><nav></nav></header></div><div class="lr"><footer class="lr-sidfot"></footer></div><div id="shopify-section-footer"><footer></footer></div></body></html>').fel;
  assert.ok(fel.some((f) => /temasektioner/.test(f)) && fel.some((f) => /<header>/.test(f)) && fel.some((f) => /1 främmande <footer>/.test(f)) && fel.some((f) => /listicle\.css/.test(f)) && fel.some((f) => /<nav>/.test(f)));
  assert.ok(granskaPublikSida('<html></html>').fel.some((f) => /listiclen saknas/.test(f)));
});

/** Låtsas-klient: svarar på de frågor butik.mjs ställer och loggar mutationerna. */
function latsasKlient({ filer = {}, sidor = [] } = {}) {
  const logg = [];
  const klient = {
    bas: 'https://baverbutiken.se', shop: '4snrw0-mg.myshopify.com', namn: 'Bäverbutiken', butik: { losenord: '' },
    async graphql(query, variables = {}) {
      if (/themes\(first/.test(query)) return { themes: { nodes: [{ id: 'gid://shopify/OnlineStoreTheme/1', name: 'Live', role: 'MAIN' }] } };
      if (/theme\(id: \$id\)/.test(query)) return { theme: { files: { nodes: (variables.namn ?? []).filter((n) => n in filer).map((n) => ({ filename: n, body: { content: filer[n] } })) } } };
      if (/themeFilesUpsert/.test(query)) { for (const f of variables.files) filer[f.filename] = f.body.value; logg.push(['tema', variables.files.map((f) => f.filename)]); return { themeFilesUpsert: { upsertedThemeFiles: variables.files.map((f) => ({ filename: f.filename })), userErrors: [] } }; }
      if (/pages\(first/.test(query)) return { pages: { nodes: sidor } };
      if (/pageCreate/.test(query)) { const s = { id: 'gid://shopify/Page/9', handle: variables.page.handle, templateSuffix: variables.page.templateSuffix, isPublished: variables.page.isPublished }; sidor.push(s); logg.push(['skapa', variables.page]); return { pageCreate: { page: s, userErrors: [] } }; }
      if (/pageUpdate/.test(query)) { logg.push(['uppdatera', variables.id, variables.page]); return { pageUpdate: { page: { id: variables.id, handle: sidor[0].handle, templateSuffix: variables.page.templateSuffix, isPublished: variables.page.isPublished }, userErrors: [] } }; }
      throw new Error(`oväntad fråga: ${query.slice(0, 60)}`);
    },
  };
  return { klient, logg, filer, sidor };
}

test('installeraTema skriver bara det som saknas eller ändrats, och läser tillbaka', async () => {
  const { klient, logg, filer } = latsasKlient();
  const r1 = await installeraTema(klient, { logg: () => {} });
  assert.deepEqual(r1.skrivna, ['layout/listicle.liquid', 'templates/page.listicle.liquid', 'assets/listicle.css']);
  assert.equal(r1.tema.name, 'Live');
  const r2 = await installeraTema(klient, { logg: () => {} });
  assert.deepEqual(r2.skrivna, []);
  assert.equal(r2.oforandrade.length, 3);
  filer['assets/listicle.css'] = '/* gammal */';
  const r3 = await installeraTema(klient, { logg: () => {} });
  assert.deepEqual(r3.skrivna, ['assets/listicle.css']);
  assert.equal(logg.filter((l) => l[0] === 'tema').length, 2);
  const torr = await installeraTema(latsasKlient().klient, { torr: true });
  assert.deepEqual(torr.skrivna, []);
  assert.equal(torr.attSkriva.length, 3);
});

test('publiceraSida skapar med mallen listicle, uppdaterar när handlen finns, stoppar på fel handle', async () => {
  const { klient, logg, sidor } = latsasKlient();
  const ny = await publiceraSida(klient, { handle: 'x-lagerrensning', titel: 'X', body: '<div class="lr"></div>', logg: () => {} });
  assert.deepEqual(ny, { id: 'gid://shopify/Page/9', handle: 'x-lagerrensning', url: 'https://baverbutiken.se/pages/x-lagerrensning', skapad: true, torr: false });
  assert.equal(logg[0][1].templateSuffix, 'listicle');
  assert.equal(logg[0][1].isPublished, true);
  const igen = await publiceraSida(klient, { handle: 'x-lagerrensning', titel: 'X2', body: '<div class="lr">2</div>', publicerad: false, logg: () => {} });
  assert.equal(igen.skapad, false);
  assert.equal(logg[1][0], 'uppdatera');
  assert.equal(logg[1][2].isPublished, false);
  assert.equal(await hittaSida(klient, 'x-lagerrensning'), sidor[0]);
  assert.equal(await hittaSida(klient, 'annan'), null);
  const torr = await publiceraSida(klient, { handle: 'ny', titel: 'N', body: 'b', torr: true });
  assert.deepEqual(torr, { id: null, handle: 'ny', url: 'https://baverbutiken.se/pages/ny', skapad: true, torr: true });
  await assert.rejects(publiceraSida(klient, { handle: '', titel: 'N', body: 'b' }), /handle, titel och body krävs/);
  // Shopify byter handle när den är upptagen → stopp
  const { klient: k2 } = latsasKlient();
  k2.graphql = async (q, v) => (/pages\(first/.test(q) ? { pages: { nodes: [] } } : { pageCreate: { page: { id: 'p', handle: `${v.page.handle}-1`, templateSuffix: 'listicle', isPublished: true }, userErrors: [] } });
  await assert.rejects(publiceraSida(k2, { handle: 'upptagen', titel: 'T', body: 'b' }), /handlen "upptagen-1"/);
});

test('skapaKlient stoppar när appen saknar write_themes/write_content', async () => {
  const fetchFn = async (url) => {
    if (/oauth\/access_token/.test(url)) return { ok: true, json: async () => ({ access_token: 't', expires_in: 3600, scope: 'write_products' }) };
    return { ok: true, json: async () => ({ data: { shop: { name: 'B', myshopifyDomain: 'b.myshopify.com', primaryDomain: { url: 'https://b.se' } }, currentAppInstallation: { app: { title: 'Appen' }, accessScopes: [{ handle: 'write_products' }] } } }) };
  };
  await assert.rejects(skapaKlient({ id: 'b', shop: 'b.myshopify.com', clientId: 'x', clientSecret: 'y' }, { fetchFn }), /saknar write_themes \+ write_content/);
});
