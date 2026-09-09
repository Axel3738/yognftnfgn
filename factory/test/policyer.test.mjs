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
  angerknappUrl,
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

// Förenat 2026-09-09 (KEDJAN.md): TankGuard lade till länderna i fraktraden,
// DryTrek tog bort "öppet köp" ur rubriken. Båda ska gälla.
test('fraktpolicyn namnger länderna när de står i konfigen: "Fri frakt till Sverige och Norge"', () => {
  const tva = fraktpolicy(medFrakt({ tid: '6–10 arbetsdagar', kostnad: 0, gratis_over: 0, lander: ['Sverige', 'Norge'] }));
  assert.ok(tva.includes('<li>Fri frakt till Sverige och Norge</li>'), tva);
  const tre = fraktpolicy(medFrakt({ kostnad: 0, gratis_over: 0, lander: ['Sverige', 'Norge', 'Danmark'] }));
  assert.ok(tre.includes('Fri frakt till Sverige, Norge och Danmark'));
  const en = fraktpolicy(medFrakt({ kostnad: 0, gratis_over: 0, lander: ['Sverige'] }));
  assert.ok(en.includes('<li>Fri frakt till Sverige</li>'));
  const betald = fraktpolicy(medFrakt({ kostnad: 49, gratis_over: 0, lander: ['Sverige', 'Norge'] }));
  assert.ok(betald.includes('<li>Frakt till Sverige och Norge: 49 kr</li>'));
  const utan = fraktpolicy(medFrakt({ kostnad: 0, gratis_over: 0 }));
  assert.ok(utan.includes('<li>Fri frakt</li>'));
});

test('länderna i fraktpolicyn kommer ur butikens marknader via sammanvävningen', () => {
  const p = dummy();
  assert.deepEqual(p.shipping.lander, ['Sverige']);
  assert.ok(fraktpolicy(p).includes('Fri frakt till Sverige'));
});

test('returpolicyns rubrik är "Ångerrätt" utan öppet köp när butiken bara ger lagens 14 dagar', () => {
  const html = returpolicy(dummy());
  assert.ok(html.includes('<h2>Ångerrätt</h2>'));
  assert.ok(!html.includes('öppet köp'));
});

test('ger butiken mer än lagen nämner rubriken öppet köp', () => {
  const p = { ...dummy(), retur: { oppet_kop_dagar: 30, angerratt_dagar: 14 } };
  const html = returpolicy(p);
  assert.ok(html.includes('<h2>Ångerrätt och öppet köp</h2>'));
  assert.ok(html.includes('30 dagars öppet köp'));
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

// -------------------------------------------------- EU:s ångerknapp
//
// Obligatorisk sedan 19 juni: en tydlig knapp kunden hittar, en
// tvåstegsbekräftelse och ett automatiskt bekräftelsemejl. Shopifys
// självbetjäningsreturer uppfyller alla tre när de är påslagna (VA:ns klick,
// checklistan 5b). Saknas knappen kan ångerfristen förlängas från 14 dagar
// till 12 månader och 14 dagar, och böterna når 4 % av årsomsättningen i
// vissa medlemsstater.

test('returpolicyn bär ångerknappen med en klickbar länk', () => {
  const p = byggPolicyer(dummy()).find((x) => x.type === 'REFUND_POLICY');
  assert.ok(p.body.includes('Ångra ditt köp'), 'rubriken saknas');
  assert.match(p.body, /<a href="\/account">/, 'länken ska vara klickbar, inte en instruktion');
  assert.ok(p.body.includes('Ångra köp'), 'knappens NAMN ska stå så kunden känner igen den i sidfoten');
  assert.ok(/bekräftelsemejl/.test(p.body), 'kunden ska veta att bekräftelsen kommer');
});

test('ångerknappen anger samma antal dagar som ångerrätten', () => {
  // Två olika tal i samma butik ger två svar på samma fråga, och det svar
  // som gäller är kundens fördel.
  const b = dummy();
  b.retur = { ...(b.retur ?? {}), angerratt_dagar: 30 };
  const p = byggPolicyer(b).find((x) => x.type === 'REFUND_POLICY');
  const i = p.body.indexOf('Ångra ditt köp');
  assert.ok(p.body.slice(i).includes('30 dagar'), 'knappens text ska följa butikens ångerrätt');
});

test('url:en går att styra per butik men har /account som default', () => {
  assert.equal(angerknappUrl({}), '/account');
  assert.equal(angerknappUrl({ butik: { angerknapp_url: 'https://shopify.com/123/account' } }), 'https://shopify.com/123/account');
});

test('ångerknappen bygger ALDRIG en egen inloggningsfri formulärsida', () => {
  // Shopifys eget utskick påstod att kunden inte får behöva logga in. Det
  // står ingenstans i direktivet — kravet är att ångra inte får vara
  // krångligare än att köpa, och ett klick i sitt konto är enklare än ett
  // köp med kort och BankID.
  const p = byggPolicyer(dummy()).find((x) => x.type === 'REFUND_POLICY');
  assert.ok(!/formulär|fyll i din e-post|utan att logga in/i.test(p.body),
    'policyn ska peka på kundkontot, inte på en egen returformulärsida');
});
