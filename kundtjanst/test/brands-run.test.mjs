// Tester för brandupptäckten, miljöupplösningen och hela flödet mot fixturen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { upptackBrands, korkonfig, valjBrands, envNamn, brandUrEgenfil, STANDARD_TROSKLAR } from '../brands.mjs';
import { korBrand, maskeraAdress, maskeraText } from '../run.mjs';
import { brandstatus, rutinforslag } from '../setup.mjs';
import { lasYaml } from '../../factory/yaml.mjs';
import { readFileSync } from 'node:fs';

const FIXTUR = join(dirname(fileURLToPath(import.meta.url)), 'fixturer', 'demo');

function tillfalliga() {
  const rot = mkdtempSync(join(tmpdir(), 'kundtjanst-'));
  const fabrik = join(rot, 'butiker');
  const egna = join(rot, 'brands');
  mkdirSync(fabrik); mkdirSync(egna);
  writeFileSync(join(fabrik, 'alfa.yaml'), 'butik:\n  id: alfa\n  brand: "Alfa"\n  supportmail: "hello@alfa.se"\n  land: SE\n  valuta: SEK\njudgeme:\n  shop_domain: "alfa-1.myshopify.com"\n');
  writeFileSync(join(fabrik, 'testbutiken.yaml'), 'butik:\n  id: testbutiken\n  brand: "Test"\n');
  writeFileSync(join(egna, 'beta.yaml'), 'brand:\n  namn: "Beta"\n  supportmail: "hello@beta.se"\n  shop: "beta-2.myshopify.com"\nnotion:\n  sop_database_id: "abc"\n');
  writeFileSync(join(egna, 'alfa.yaml'), 'brand:\n  aktiv: false\nmail:\n  skickat: "INBOX.Sent"\ntrosklar:\n  obesvarad_timmar: 24\n');
  writeFileSync(join(egna, 'brand-mall.yaml'), 'brand:\n  namn: ""\n');
  return { fabrik, egna };
}

test('brands upptäcks ur båda källorna, egen fil lägger på och kan stänga av', () => {
  const alla = upptackBrands(tillfalliga());
  assert.deepEqual(alla.map((b) => b.id), ['alfa', 'beta'], 'testbutiken och mallen hoppas över');
  const alfa = alla[0];
  assert.equal(alfa.brand, 'Alfa');
  assert.equal(alfa.supportmail, 'hello@alfa.se');
  assert.equal(alfa.shop, 'alfa-1.myshopify.com');
  assert.equal(alfa.aktiv, false, 'egen fil stängde av');
  assert.equal(alfa.mail.skickat, 'INBOX.Sent');
  assert.equal(alfa.trosklar.obesvarad_timmar, 24);
  assert.equal(alfa.kalla, 'factory/butiker + kundtjanst/brands');
  assert.equal(alla[1].notion.sop_database_id, 'abc');
});

test('miljövariablerna heter samma sak för alla brands och löses per brand', () => {
  const n = envNamn('my-shop');
  assert.equal(n.mailPass, 'KUNDTJANST_MAIL_PASS_MY_SHOP');
  assert.equal(n.adminToken, 'SHOPIFY_ADMIN_TOKEN_MY_SHOP');
  const brand = brandUrEgenfil(lasYaml('brand:\n  namn: "Beta"\n  supportmail: "hello@beta.se"\n  shop: "beta-2.myshopify.com"\n'), 'beta');
  const utan = korkonfig(brand, {});
  assert.equal(utan.mail.konfigurerad, false);
  assert.deepEqual(utan.mail.saknas, ['KUNDTJANST_MAIL_PASS_BETA']);
  assert.equal(utan.mail.user, 'hello@beta.se', 'supportmailen är användarnamnet');
  assert.equal(utan.mail.host, 'mailcluster.loopia.se');
  assert.equal(utan.shopify.konfigurerad, false);
  assert.deepEqual(utan.trosklar, { ...STANDARD_TROSKLAR });
  const med = korkonfig(brand, { KUNDTJANST_MAIL_PASS_BETA: 'x', SHOPIFY_CLIENT_ID_BETA: 'id', SHOPIFY_CLIENT_SECRET_BETA: 'hemlig', SHOPIFY_SHOP: 'nagon-annan.myshopify.com', SHOPIFY_ADMIN_TOKEN: 'grannens' });
  assert.equal(med.mail.konfigurerad, true);
  assert.equal(med.shopify.vag, 'client_credentials');
  assert.equal(med.shopify.shop, 'beta-2.myshopify.com', 'den allmänna SHOPIFY_SHOP får inte läcka in');
  assert.equal(med.shopify.adminToken, '', 'grannens allmänna token används aldrig');
  const token = korkonfig(brand, { KUNDTJANST_MAIL_PASS_BETA: 'x', KUNDTJANST_MAIL_USER_BETA: 'annan@beta.se', SHOPIFY_ADMIN_TOKEN_BETA: 'shpat_1' });
  assert.equal(token.shopify.vag, 'token');
  assert.equal(token.mail.user, 'annan@beta.se');
});

test('valjBrands: alla aktiva, ett id, en lista, okänt id stoppar', () => {
  const alla = upptackBrands(tillfalliga());
  assert.deepEqual(valjBrands(alla, '--alla').map((b) => b.id), ['beta'], 'alfa är avstängd');
  assert.deepEqual(valjBrands(alla, 'alfa').map((b) => b.id), ['alfa'], 'uttryckligen vald körs ändå');
  assert.deepEqual(valjBrands(alla, 'Beta,alfa').map((b) => b.id), ['beta', 'alfa']);
  assert.throws(() => valjBrands(alla, 'gamma'), /finns inte/);
});

test('maskeringen lämnar igenkännbart men inte spridbart', () => {
  assert.equal(maskeraAdress('anna.karlsson@gmail.com'), 'an***@gmail.com');
  assert.equal(maskeraAdress('a@b.se'), 'a***@b.se');
  assert.equal(maskeraText('kontakta anna.karlsson@gmail.com eller ola@online.no idag'), 'kontakta an***@gmail.com eller ol***@online.no idag');
});

test('hela flödet mot fixturen: ärenden, risk, SOP-täckning, ranking-underlag', async () => {
  const brand = brandUrEgenfil(lasYaml(readFileSync(join(FIXTUR, 'demobutiken', 'brand.yaml'), 'utf8')), 'demobutiken');
  const r = await korBrand(brand, { nu: new Date('2026-09-14T12:00:00Z'), dagar: 7, torr: true, utanModell: true, fixtur: FIXTUR, env: {}, historik: [] });
  assert.equal(r.hoppad, false);
  assert.equal(r.vecka, '2026-W38');
  assert.equal(r.sammanfattning.antalArenden, 9);
  assert.equal(r.sammanfattning.larmObesvarade, 4);
  assert.equal(r.risk.niva.id, 'hog');
  assert.equal(r.tvister.lista.length, 1);
  assert.equal(r.risk.tvistgrad, 8.33);
  assert.equal(r.ordrar.antal, 12);
  assert.deepEqual(r.sop.tackta.map((x) => x.id), ['var_ar_ordern'].filter((id) => r.sammanfattning.topp.slice(0, 5).some((p) => p.id === id)));
  assert.ok(r.sop.saknas.includes('ej_levererad'));
  assert.equal(r.forra, null);
  assert.deepEqual(r.aterkommande, []);
  assert.equal(r.historikrad.topp[0], 'ej_levererad');
  assert.equal(r.modell.anvand, false);
  const james = r.arenden.find((a) => a.kund.adress === 'james.miller@outlook.com');
  assert.equal(james.ordrar[0].namn, '#1031');
  assert.equal(james.ordrar[0].fulfillment, null);
});

test('förra veckan och trend kommer ur historiken', async () => {
  const brand = brandUrEgenfil(lasYaml(readFileSync(join(FIXTUR, 'demobutiken', 'brand.yaml'), 'utf8')), 'demobutiken');
  const historik = [
    { vecka: '2026-W35', topp: ['var_ar_ordern', 'retur_angerratt'], antalArenden: 4, perKategori: { var_ar_ordern: 3 } },
    { vecka: '2026-W36', topp: ['var_ar_ordern'], antalArenden: 5, perKategori: { var_ar_ordern: 4 } },
    { vecka: '2026-W37', topp: ['var_ar_ordern', 'ej_levererad'], antalArenden: 6, perKategori: { var_ar_ordern: 5 } },
  ];
  const r = await korBrand(brand, { nu: new Date('2026-09-14T12:00:00Z'), torr: true, utanModell: true, fixtur: FIXTUR, env: {}, historik });
  assert.equal(r.forra.vecka, '2026-W37');
  assert.equal(r.historikVeckor, 4);
  assert.deepEqual(r.aterkommande.map((x) => x.id), ['var_ar_ordern']);
});

test('utan lösenord hoppas brandet över med namnet på variabeln', async () => {
  const brand = brandUrEgenfil(lasYaml('brand:\n  namn: "Beta"\n  supportmail: "hello@beta.se"\n'), 'beta');
  const r = await korBrand(brand, { env: {}, historik: [] });
  assert.equal(r.hoppad, true);
  assert.match(r.orsak, /KUNDTJANST_MAIL_PASS_BETA/);
});

test('setup: status per brand och rutinförslag för måndag med sommar/vinter-cron', () => {
  const brand = brandUrEgenfil(lasYaml('brand:\n  namn: "Beta"\n  supportmail: "hello@beta.se"\n'), 'beta');
  const s = brandstatus(brand, {});
  assert.equal(s.klar, false);
  assert.deepEqual(s.saknas, ['KUNDTJANST_MAIL_PASS_BETA']);
  const f = rutinforslag({ datum: new Date('2026-07-15T12:00:00Z') });
  assert.equal(f.cron, '0 5 * * 1');
  assert.equal(f.cronVinter, '0 6 * * 1');
  assert.equal(f.steg[1].argument.prompt, '/kundtjanst --alla --discord');
  assert.equal(f.steg[0].argument.outcome_branch, 'main');
});
