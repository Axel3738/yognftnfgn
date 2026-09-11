// Tester för trippelkollens rena del: kraven byggs ur yaml (byggKrav) och
// tillbakaläsningen bedöms mot dem (bedomLage). Fixture-data i stället för
// API — ingen nätverkstrafik.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rabutik, dummy } from './hjalp.mjs';
import { byggKrav, bedomLage, sidhandlesUr, huvudlocale } from '../trippelkoll.mjs';

// Butiken som i butik-mall.yaml: SE + NO från start.
const butik = () => {
  const b = rabutik();
  return { ...b, butik: { ...b.butik, marknader: [{ land: 'NO', locale: 'nb', valuta: 'SEK' }] } };
};
const TEMA_ID = 'gid://shopify/OnlineStoreTheme/111';

// En grön butik, byggd ur kraven själva så fixturen följer konfigen.
function gronLage(krav, { temaRole = 'MAIN' } = {}) {
  const produkter = {};
  const metaobjects = [];
  const koder = [];
  for (const k of krav.produkter) {
    const gid = `gid://shopify/Product/${k.handle}`;
    produkter[k.handle] = {
      id: gid, title: k.handle, handle: k.handle, status: 'ACTIVE',
      variants: { nodes: [{ id: 'v1', title: 'Default', price: String(k.pris), inventoryPolicy: 'CONTINUE', inventoryItem: { tracked: false } }] },
      media: { nodes: [{ id: 'm1' }, { id: 'm2' }] },
      metafields: { nodes: k.metafalt.map((key) => ({ key })) },
    };
    for (const post of k.plan.poster) {
      metaobjects.push({ id: `mo-${post.handle}`, handle: post.handle, fields: [
        { key: 'produkt', value: gid }, { key: 'forvald', value: String(post.forvald) }, { key: 'ab_variant', value: post.variant },
      ] });
    }
    for (const kod of k.plan.koder) {
      koder.push({ id: `d-${kod.kod}`, codeDiscount: {
        status: 'ACTIVE', codes: { nodes: [{ code: kod.kod }] },
        customerGets: { value: { amount: { amount: String(kod.belopp) } } },
        minimumRequirement: { greaterThanOrEqualToQuantity: kod.minstAntal },
      } });
    }
  }
  return {
    shop: { name: 'Nackmagneten', myshopifyDomain: 'x.myshopify.com', currencyCode: 'SEK', primaryDomain: { host: 'nackmagneten.se' } },
    onlineStore: { passwordProtection: { enabled: false } },
    themes: [{ id: TEMA_ID, name: 'Nackmagneten v1 CRO', role: temaRole }, { id: 'gid://shopify/OnlineStoreTheme/2', name: 'Dawn', role: temaRole === 'MAIN' ? 'UNPUBLISHED' : 'MAIN' }],
    shopLocales: [{ locale: 'sv', primary: true, published: true }, { locale: 'nb', primary: false, published: true }],
    markets: [{ id: 'mk1', name: 'Norge', handle: 'no', status: 'ACTIVE', conditions: { regionsCondition: { regions: { nodes: [{ code: 'NO' }] } } } }],
    webPresences: [{ id: 'wp1', defaultLocale: { locale: 'sv' }, alternateLocales: [{ locale: 'nb' }] }],
    metaobjects,
    pages: krav.sidhandles.map((handle) => ({ handle, title: handle })),
    menus: [{ handle: 'main-menu', items: krav.produkter.map((k) => ({ title: k.handle, url: `/products/${k.handle}` })) }],
    codeDiscountNodes: koder,
    produkter,
  };
}

const namn = (lista) => lista.map((r) => r.namn);

test('byggKrav läser marknaderna ur yaml, aldrig hårdkodat', () => {
  const k = byggKrav(butik(), [dummy()], { arbetstemaId: TEMA_ID });
  assert.deepEqual(k.marknader, [{ land: 'NO', locale: 'nb', valuta: 'SEK' }]);
  assert.equal(k.huvudlocale, 'sv');
  assert.equal(k.arbetstemaId, TEMA_ID);
  const utan = byggKrav(rabutik(), [dummy()], {});
  assert.deepEqual(utan.marknader, []);
});

test('huvudlocale följer landet och kan överstyras', () => {
  assert.equal(huvudlocale({ butik: { land: 'NO' } }), 'nb');
  assert.equal(huvudlocale({ butik: { land: 'SE', locale: 'en' } }), 'en');
  assert.equal(huvudlocale({ butik: {} }), null);
});

test('sidhandles kommer ur menyraderna (ctx först, annars meny.mjs + policyer)', () => {
  const urCtx = sidhandlesUr({ menylankar: [{ url: '/pages/returpolicy' }, { url: '/pages/contact' }], huvudmenylankar: [{ url: '/products/x' }] }, butik(), [dummy()]);
  assert.deepEqual(urCtx, ['returpolicy', 'contact']);
  const utanCtx = sidhandlesUr({}, butik(), [dummy()]);
  for (const h of ['returpolicy', 'fraktpolicy', 'kopvillkor', 'contact']) assert.ok(utanCtx.includes(h), h);
});

test('en butik som stämmer med yaml ger noll fel och bara mobilvyn manuell', () => {
  const krav = byggKrav(butik(), [dummy()], { arbetstemaId: TEMA_ID });
  const lage = bedomLage(gronLage(krav), krav);
  assert.deepEqual(lage.fel, []);
  assert.deepEqual(namn(lage.manuella), ['mobilvyn']);
  for (const n of ['produkt', 'priser', 'lagerpolicy', 'metafält', 'paketnivåer', 'förvald nivå', 'rabattkoder', 'OPS-temat', 'publicerat tema', 'locale nb', 'marknad NO', 'nb på domänen', 'sidor', 'huvudmeny']) {
    assert.ok(namn(lage.grona).includes(n), `${n} ska vara grön`);
  }
});

test('opublicerat OPS-tema är manuellt, utan påståendet att API:t är spärrat', () => {
  const krav = byggKrav(butik(), [dummy()], { arbetstemaId: TEMA_ID });
  const lage = bedomLage(gronLage(krav, { temaRole: 'UNPUBLISHED' }), krav);
  const rad = lage.manuella.find((r) => r.namn === 'publicerat tema');
  assert.ok(rad);
  assert.ok(!/spärrat/i.test(rad.detalj));
  assert.ok(/themePublish/.test(rad.detalj));
  assert.ok(namn(lage.grona).includes('OPS-temat'));
});

test('fel pris, DENY-lager, saknad locale och saknad sida blir fel', () => {
  const krav = byggKrav(butik(), [dummy()], { arbetstemaId: TEMA_ID });
  const d = gronLage(krav);
  d.produkter.nackmagneten.variants.nodes[0].price = '299';
  d.produkter.nackmagneten.variants.nodes[0].inventoryPolicy = 'DENY';
  d.shopLocales = d.shopLocales.filter((l) => l.locale !== 'nb');
  d.pages = d.pages.filter((s) => s.handle !== 'kopvillkor');
  const lage = bedomLage(d, krav);
  const fel = namn(lage.fel);
  for (const n of ['priser', 'lagerpolicy', 'locale nb', 'sidor']) assert.ok(fel.includes(n), n);
  assert.ok(lage.fel.find((r) => r.namn === 'sidor').detalj.includes('kopvillkor'));
});

test('rabattkod med fel belopp eller fel minsta antal blir fel', () => {
  const krav = byggKrav(butik(), [dummy()], { arbetstemaId: TEMA_ID });
  const d = gronLage(krav);
  d.codeDiscountNodes[0].codeDiscount.customerGets.value.amount.amount = '1.00';
  d.codeDiscountNodes[1].codeDiscount.minimumRequirement.greaterThanOrEqualToQuantity = 9;
  d.codeDiscountNodes.pop();
  const lage = bedomLage(d, krav);
  const rad = lage.fel.find((r) => r.namn === 'rabattkoder');
  assert.ok(rad);
  assert.ok(/ger −1/.test(rad.detalj));
  assert.ok(/kräver 9 varor/.test(rad.detalj));
  assert.ok(/finns inte/.test(rad.detalj));
});

test('två förvalda nivåer i samma variant blir fel', () => {
  const krav = byggKrav(butik(), [dummy()], { arbetstemaId: TEMA_ID });
  const d = gronLage(krav);
  d.metaobjects.find((m) => m.handle === 'nackmagneten-a-1').fields.find((f) => f.key === 'forvald').value = 'true';
  const lage = bedomLage(d, krav);
  assert.ok(lage.fel.find((r) => r.namn === 'förvald nivå')?.detalj.includes('variant a: 2'));
});

test('saknad produkt, myshopify-domän och lösenordsskydd', () => {
  const krav = byggKrav(butik(), [dummy()], { arbetstemaId: TEMA_ID });
  const d = gronLage(krav);
  d.produkter.nackmagneten = null;
  d.shop.primaryDomain.host = 'x.myshopify.com';
  d.onlineStore.passwordProtection.enabled = true;
  const lage = bedomLage(d, krav);
  assert.ok(namn(lage.fel).includes('produkt'));
  assert.ok(namn(lage.manuella).includes('domän'));
  assert.ok(namn(lage.manuella).includes('lösenordsskydd'));
});

test('arbetstemat tas ur state-id:t — inte "första UNPUBLISHED"', () => {
  const krav = byggKrav(butik(), [dummy()], { arbetstemaId: 'gid://shopify/OnlineStoreTheme/999' });
  const d = gronLage(krav);
  d.themes = [{ id: 'gid://shopify/OnlineStoreTheme/5', name: 'Dawn', role: 'MAIN' }, { id: 'gid://shopify/OnlineStoreTheme/999', name: 'Eget', role: 'UNPUBLISHED' }];
  const lage = bedomLage(d, krav);
  assert.equal(lage.grona.find((r) => r.namn === 'OPS-temat')?.detalj, 'Eget (UNPUBLISHED)');
});

test('flera produkter prefixas med handle', () => {
  const p2 = dummy();
  p2.produkt = { ...p2.produkt, id: 'andra', namn: 'Andra' };
  const krav = byggKrav(butik(), [dummy(), p2], { arbetstemaId: TEMA_ID });
  const lage = bedomLage(gronLage(krav), krav);
  assert.deepEqual(lage.fel, []);
  assert.ok(namn(lage.grona).includes('andra: produkt'));
});

test('huvudmenyn kräver bara rad för produkter som ska stå där', () => {
  // Axels regel 2026-09-11 när AdventLane gick till tolv kalendrar: alla ska
  // finnas i kollektionen, bara ett urval i menyn. Utan filtret stod
  // trippelkollen röd på elva produkter som är precis rätt.
  const d = {
    menus: [{ handle: 'main-menu', items: [{ url: '/collections/kalendrarna' }, { url: '/products/racing' }] }],
  };
  const krav = {
    produkter: [
      { handle: 'racing', iMeny: true },
      { handle: 'dino', iMeny: false },
      { handle: 'golf', iMeny: false },
    ],
    sidhandles: [],
    marknader: [],
  };
  const rad = bedomLage(d, krav).rader.find((r) => r.namn === 'huvudmeny');
  assert.equal(rad.utfall, 'ok');
  assert.match(rad.detalj, /2 produkter står utanför menyn med flit/);

  const saknas = bedomLage(d, { ...krav, produkter: [{ handle: 'racing', iMeny: true }, { handle: 'dino', iMeny: true }] })
    .rader.find((r) => r.namn === 'huvudmeny');
  assert.equal(saknas.utfall, 'fel');
  assert.match(saknas.detalj, /saknar rad för: dino/);
});
