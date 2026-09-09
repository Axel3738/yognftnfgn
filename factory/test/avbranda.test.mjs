// Tester för av-brandningen (Axels bakläxa 2026-09-09, DryTrek). Ren logik
// utan nätverk: reglerna, sektionsgrupperna, inställningarna — och hela
// bas-zip:en genom kedjan, som ska vara skanningsren efteråt.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { byggRegler, stadaSettings, byggFooterblock, tillampa, avbrandaFiler } from '../avbranda.mjs';
import { skannaTema, rapport, KALLORD } from '../kallskanning.mjs';
import { byggProduktTemplate, byggHeaderGroup } from '../tema.mjs';
import { rabutik } from './hjalp.mjs';

const ZIP = fileURLToPath(new URL('../tema/ops-tema.zip', import.meta.url));
const urZip = (fil) => execFileSync('unzip', ['-p', ZIP, fil], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
const BINAR = /\.(png|jpg|jpeg|gif|webp|svg|woff2?|eot|ttf|mp4|ico)$/i;

// Hela zip:en som { fil: innehåll }, som hamtaAllaTemafiler ger.
function helaZipen() {
  const mapp = mkdtempSync(join(tmpdir(), 'ops-tema-'));
  try {
    execFileSync('unzip', ['-o', '-q', ZIP, '-d', mapp]);
    const filer = {};
    const ga = (d) => {
      for (const n of readdirSync(d, { withFileTypes: true })) {
        const f = join(d, n.name);
        if (n.isDirectory()) ga(f);
        else if (!BINAR.test(f)) filer[relative(mapp, f)] = readFileSync(f, 'utf8');
      }
    };
    ga(mapp);
    return filer;
  } finally {
    rmSync(mapp, { recursive: true, force: true });
  }
}

const butik = () => {
  const b = rabutik();
  b.butik.marknader = [{ land: 'NO', locale: 'nb', valuta: 'SEK' }];
  return b;
};

test('mejlregeln kommer före domänregeln — annars äter domänen upp mejlen', () => {
  const b = butik();
  const ut = tillampa('snippets/x.liquid', 'Mejla kundsupport@matstrumpor.se eller besök matstrumpor.se', b).innehall;
  assert.equal(ut, 'Mejla hello@nackmagneten.se eller besök nackmagneten.se');
});

test('brandnamnet med "$" tolkas aldrig som replace-mall', () => {
  const b = butik();
  b.butik.brand = 'Dollar$hop';
  const ut = tillampa('snippets/x.liquid', 'Matstrumpor', b).innehall;
  assert.equal(ut, 'Dollar$hop');
});

test('produktorden skrivs om i Liquid men ALDRIG i JSON-mallarna — "torra strumpor" är DryTreks copy', () => {
  const b = butik();
  const liquid = tillampa('blocks/ms-size.liquid', '"default": "Strumporna är stretchiga — hamnar du mellan två storlekar fungerar båda."', b).innehall;
  assert.ok(!liquid.includes('Strumporna'));
  const json = tillampa('templates/index.json', '{"heading":"Håller strumporna torra. Torra strumpor hela dagen."}', b).innehall;
  assert.equal(json, '{"heading":"Håller strumporna torra. Torra strumpor hela dagen."}');
  assert.ok(byggRegler(b).liquid.length > 0 && byggRegler(b).alla.length > 0);
});

test('kollektionslänken pekar om till butikens kollektion (eller all) och behåller JSON-escapningen', () => {
  const b = butik();
  const en = tillampa('templates/index.json', '"button_link_1":"shopify:\\/\\/collections\\/strumporna","collection":"strumporna"', b).innehall;
  assert.equal(en, '"button_link_1":"shopify:\\/\\/collections\\/all","collection":"all"');
  b.butik.kollektion = { handle: 'sortimentet' };
  const flera = tillampa('templates/index.json', '"link":"shopify://collections/strumporna"', b).innehall;
  assert.equal(flera, '"link":"shopify://collections/sortimentet"');
});

test('presentbutikens löften plockas ur ikon-listor utan att lämna lösa pipe-tecken', () => {
  const b = butik();
  const usp = tillampa('sections/ms-usp-bar.liquid', '"default": "truck:Fri frakt i Sverige|refresh:30 dagars öppet köp|gift:Levereras presentklart|star:Älskad av tusentals svenskar"', b).innehall;
  assert.equal(usp, '"default": "truck:Fri frakt i Sverige|refresh:30 dagars öppet köp"');
  const marquee = tillampa('sections/ms-marquee.liquid', '"default": "Älskad av tusentals svenskar|Fri frakt i Sverige|30 dagars öppet köp|Levereras presentklart"', b).innehall;
  assert.equal(marquee, '"default": "Fri frakt i Sverige|30 dagars öppet köp"');
});

test('footerns bolagsblock är butikens juridiska text — samma rad som startsidan skriver', () => {
  const blk = byggFooterblock(butik());
  assert.ok(blk.includes('Nackmagneten drivs av<br/>Exempelbolaget AB<br/>Org.nr 556000-0000'));
  assert.ok(blk.includes('hello@nackmagneten.se'));
  assert.ok(!blk.includes('om-oss'));
});

test('zip:ens riktiga footer-group blir giltig JSON utan källsektioner, nyhetsbrev eller om-oss-länk', () => {
  const { innehall, borttaget } = tillampa('sections/footer-group.json', urZip('sections/footer-group.json'), butik());
  const j = JSON.parse(innehall);
  assert.deepEqual(j.order, ['footer']);
  assert.equal(j.sections.footer.settings.newsletter_enable, false);
  assert.ok(j.sections.footer.blocks.foretaget.settings.subtext.includes('Exempelbolaget AB'));
  assert.ok(!innehall.includes('om-oss') && !innehall.includes('matstrumpor'));
  assert.ok(borttaget.length >= 4, `borttaget: ${borttaget.join('; ')}`);
});

test('zip:ens riktiga header-group: källannonserna bort, fabrikens egna (opf_) kvar', () => {
  const b = butik();
  // Fabriken har redan skrivit sina egna rader (steget tema körs före avbrandning).
  const egen = byggHeaderGroup(b, { befintlig: urZip('sections/header-group.json') });
  const { innehall, borttaget } = tillampa('sections/header-group.json', egen, b);
  const bar = JSON.parse(innehall).sections['announcement-bar'];
  assert.deepEqual(bar.block_order, ['opf_a1', 'opf_a2', 'opf_a3']);
  assert.equal(borttaget.length, 0, 'inget av fabrikens eget ska tas bort');
  // Och den orörda zip-filen: alla tre källannonserna åker.
  const ra = tillampa('sections/header-group.json', urZip('sections/header-group.json'), b);
  assert.equal(ra.borttaget.length, 3);
  assert.deepEqual(JSON.parse(ra.innehall).sections['announcement-bar'].block_order, []);
});

test('stadaSettings på zip:ens riktiga settings_data: sociala länkar, logga, brand-text, Klaviyo och presetnamnet', () => {
  const b = butik();
  const ut = stadaSettings(urZip('config/settings_data.json'), b);
  const j = JSON.parse(ut);
  const c = j.current;
  assert.equal(c.social_facebook_link, '');
  assert.equal(c.social_instagram_link, '');
  assert.equal(c.logo, '');
  assert.equal(c.brand_image, '');
  assert.equal(c.brand_description, '<p>Nackmagneten</p>');
  assert.deepEqual(Object.keys(c.blocks), ['judgeme_karna']);
  assert.ok(!('Matstrumpor' in j.presets) && 'Nackmagneten' in j.presets);
  // Loggasteget kan ge en riktig logga i samma anrop.
  const med = JSON.parse(stadaSettings(ut, b, { logga: 'shopify://shop_images/nackmagneten-logga.png', favicon: 'shopify://shop_images/nackmagneten-favicon.png' })).current;
  assert.equal(med.logo, 'shopify://shop_images/nackmagneten-logga.png');
  assert.equal(med.favicon, 'shopify://shop_images/nackmagneten-favicon.png');
  // Och en riktig logga töms INTE av ett andra varv utan logga.
  assert.equal(JSON.parse(stadaSettings(JSON.stringify({ current: med, presets: {} }), b)).current.logo, 'shopify://shop_images/nackmagneten-logga.png');
});

test('tillampa är idempotent — andra varvet ändrar ingenting', () => {
  const b = butik();
  for (const fil of ['sections/footer-group.json', 'sections/header-group.json', 'config/settings_data.json', 'templates/product.json', 'snippets/ms-head.liquid']) {
    const forsta = tillampa(fil, urZip(fil), b).innehall;
    const andra = tillampa(fil, forsta, b).innehall;
    assert.equal(andra, forsta, `${fil} ändrades av andra varvet`);
  }
});

// Det avgörande testet: hela bas-zip:en genom av-brandningen (+ produktmallen
// och header-gruppen ur tema.mjs, som steget `tema` skriver) ska vara
// skanningsren. Varje nytt KALLORD utan regel faller här.
test('hela bas-zip:en är skanningsren efter av-brandningen', () => {
  const b = butik();
  const filer = helaZipen();
  assert.ok(Object.keys(filer).length > 250, 'zip:en ska packas upp helt');
  const fore = skannaTema(filer);
  assert.ok(fore.traffar.length >= 20, `zip:en bär källtext (${fore.traffar.length} träffar före)`);

  filer['templates/product.json'] = byggProduktTemplate(filer['templates/product.json'], { butik: b, produkt: { offer: { paket: { test: 'paket' } }, varianter: [] } });
  filer['sections/header-group.json'] = byggHeaderGroup(b, { befintlig: filer['sections/header-group.json'] });
  const { andrade, borttagnaSektioner } = avbrandaFiler(filer, b);
  const efter = skannaTema({ ...filer, ...andrade });
  assert.equal(efter.traffar.length, 0, rapport(efter));
  assert.ok(borttagnaSektioner.some((x) => x.includes('ms-skrapkort')));
  assert.ok(borttagnaSektioner.some((x) => x.includes('newsletter_enable')));
  // Varje omskriven JSON-fil ska fortfarande vara giltig JSON.
  for (const [namn, innehall] of Object.entries(andrade)) {
    if (namn.endsWith('.json')) JSON.parse(String(innehall).replace(/^\s*\/\*[\s\S]*?\*\//, ''));
  }
  // Och inget KALLORD står kvar i någon fil, oavsett escapning.
  const allt = Object.values({ ...filer, ...andrade }).join('\n').toLowerCase().replaceAll('\\/', '/');
  for (const ord of KALLORD) assert.ok(!allt.includes(ord), `"${ord}" finns kvar`);
});
