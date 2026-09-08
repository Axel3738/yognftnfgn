// Tester för de genererade köpvillkoren. Ingen nätverkstrafik.
// Kör: node --test factory/test/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from '../yaml.mjs';
import {
  byggPolicyer,
  returpolicy,
  fraktpolicy,
  kopvillkor,
  kontaktsida,
  oppetKop,
  saknadeUppgifter,
} from '../policyer.mjs';
import { kontrolleraLaunch } from '../kontroll.mjs';
import { dummy, medButiksfrakt, raprodukt } from './hjalp.mjs';


test('tre policyer byggs med rätt Shopify-typer', () => {
  const typer = byggPolicyer(dummy()).map((x) => x.type);
  assert.deepEqual(typer, ['REFUND_POLICY', 'SHIPPING_POLICY', 'TERMS_OF_SERVICE']);
});

test('returpolicyn följer lagen: 14 dagars ångerrätt, inga egna löften', () => {
  assert.equal(oppetKop(dummy()), 14);
  const html = returpolicy(dummy());
  assert.ok(html.includes('14 dagars ångerrätt'));
  assert.ok(!html.includes('utöver'));
  assert.ok(html.includes('hello@nackmagneten.se'));
});

test('öppet köp kortare än ångerrätten presenteras inte som ett extra löfte', () => {
  const p = { ...dummy(), retur: { oppet_kop_dagar: 10, angerratt_dagar: 14 } };
  const html = returpolicy(p);
  assert.ok(html.includes('14 dagars ångerrätt'));
  assert.ok(!html.includes('utöver'));
});

test('returvillkoren kommer ur butikskonfigen, inte ur hårdkodade siffror', () => {
  const p = {
    ...dummy(),
    retur: {
      oppet_kop_dagar: 60,
      angerratt_dagar: 30,
      reklamation_ar: 2,
      aterbetalning_dagar: 7,
      returfrakt_betalas_av: 'butik',
    },
  };
  const html = returpolicy(p);
  assert.ok(html.includes('30 dagars ångerrätt'));
  assert.ok(html.includes('60 dagars öppet köp'));
  assert.ok(html.includes('upp till 2 år'));
  assert.ok(html.includes('inom 7 dagar'));
  assert.ok(html.includes('Vi betalar returfrakten'));
});

// Egen frakt-fixtur: testerna ska inte gå sönder när dummyproduktens
// fraktpriser ändras, bara när logiken gör det.
function medFrakt(shipping) {
  return { ...dummy(), shipping };
}

test('fraktpolicyn använder leveranstid, fraktpris och fri frakt-gräns', () => {
  const html = fraktpolicy(medFrakt({ tid: '5–8 arbetsdagar', kostnad: 39, gratis_over: 499 }));
  assert.ok(html.includes('5–8 arbetsdagar'));
  assert.ok(html.includes('39 kr'));
  assert.ok(html.includes('499 kr'));
});

test('gratis frakt skrivs ut som fri frakt, inte som 0 kr', () => {
  const html = fraktpolicy(medFrakt({ tid: '5–8 arbetsdagar', kostnad: 0, gratis_over: 0 }));
  assert.ok(html.includes('Fri frakt'));
  assert.ok(!html.includes('0 kr'));
});

test('köpvillkoren bär företagsnamn, orgnr och valuta', () => {
  const html = kopvillkor(dummy());
  assert.ok(html.includes('Exempelbolaget AB'));
  assert.ok(html.includes('556000-0000'));
  assert.ok(html.includes('SEK'));
});

test('kontaktsidan hänvisar till kundtjänstadressen', () => {
  assert.ok(kontaktsida(dummy()).includes('hello@nackmagneten.se'));
});

test('saknade företagsuppgifter blir [FYLL I] i stället för gissningar', () => {
  const p = dummy();
  delete p.brand.orgnr;
  delete p.brand.kontakt_epost;
  assert.deepEqual(saknadeUppgifter(p), ['brand.kontakt_epost', 'brand.orgnr']);
  assert.ok(kopvillkor(p).includes('[FYLL I]'));
});

// --- LAUNCH-spärren för villkor ---

const SHOP = {
  currencyCode: 'SEK',
  primaryDomain: { host: 'nackmagneten.se', sslEnabled: true },
};
const PRODUKT = {
  handle: 'nackmagneten',
  title: 'Nackmagneten',
  status: 'DRAFT',
  media: { nodes: [{ id: 'm1' }] },
  variants: {
    nodes: [
      { price: '399.00', compareAtPrice: '599.00' },
      { price: '399.00', compareAtPrice: '599.00' },
    ],
  },
};
const ALLA_POLICYER = [
  { type: 'REFUND_POLICY', body: '<p>retur</p>' },
  { type: 'SHIPPING_POLICY', body: '<p>frakt</p>' },
  { type: 'TERMS_OF_SERVICE', body: '<p>villkor</p>' },
  { type: 'PRIVACY_POLICY', body: '<p>integritet</p>' },
];

function medMeta() {
  const p = dummy();
  p.meta.pixel_id = '1';
  p.meta.ad_account_id = '915422744950975';
  p.meta.page_id = '3';
  return p;
}
const namn = (r) => r.kritiska.map((k) => k.namn);

test('saknad returpolicy stoppar launchen', () => {
  const policyer = ALLA_POLICYER.filter((x) => x.type !== 'REFUND_POLICY');
  const r = kontrolleraLaunch(medMeta(), { shop: SHOP, produkt: PRODUKT, policyer });
  assert.ok(namn(r).includes('villkor'));
});

test('[FYLL I] kvar i villkoren stoppar launchen', () => {
  const policyer = ALLA_POLICYER.map((x) =>
    x.type === 'TERMS_OF_SERVICE' ? { ...x, body: '<p>Org.nr [FYLL I]</p>' } : x
  );
  const r = kontrolleraLaunch(medMeta(), { shop: SHOP, produkt: PRODUKT, policyer });
  assert.ok(namn(r).includes('villkor'));
});

test('alla fyra policyer på plats ger grön launch', () => {
  const r = kontrolleraLaunch(medMeta(), { shop: SHOP, produkt: PRODUKT, policyer: ALLA_POLICYER });
  assert.equal(r.gron, true, `kritiska: ${JSON.stringify(namn(r))}`);
});

test('exempeluppgifter i villkoren stoppar launchen', () => {
  const policyer = ALLA_POLICYER.map((x) =>
    x.type === 'TERMS_OF_SERVICE' ? { ...x, body: '<p>Exempelbolaget AB, org.nr 556000-0000</p>' } : x
  );
  const r = kontrolleraLaunch(medMeta(), { shop: SHOP, produkt: PRODUKT, policyer });
  assert.ok(namn(r).includes('villkor'));
});

test('extra fraktsätt i kassan står också på fraktpolicyn', () => {
  const html = fraktpolicy(
    medFrakt({
      tid: '5–8 arbetsdagar',
      kostnad: 0,
      gratis_over: 0,
      alternativ: [{ namn: 'Express', pris: 99, tid: '1–2 arbetsdagar' }],
    })
  );
  assert.ok(html.includes('Express'));
  assert.ok(html.includes('99 kr'));
  assert.ok(html.includes('1–2 arbetsdagar'));
});
