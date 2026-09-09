// Tester för källbutiksskanningen (Axels bakläxa 2026-09-09, DryTrek).
// Ingen nätverkstrafik. Sektionsgrupperna läses ur den riktiga bas-zip:en.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  skannaFil,
  skannaTema,
  rapport,
  normalisera,
  arKalltext,
  tackning,
  KALLORD,
  KALLSEKTIONER,
  KALLINSTALLNINGAR,
  KALLANNONSER,
  KANDA_SMITTADE,
  avbrandaSektionsgrupp,
  skannaSektionsgrupp,
} from '../kallskanning.mjs';

const ZIP = fileURLToPath(new URL('../tema/ops-tema.zip', import.meta.url));
const urZip = (fil) => execFileSync('unzip', ['-p', ZIP, fil], { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });

// Det SMUTSIGA bas-temat som fixtur. Källan rensades 2026-09-09
// (factory/rensa-kalla.mjs), så den bär inget att hitta längre — men de här
// testerna ska bevisa att funktionerna STÄDAR smutsig indata. Mot en ren zip
// hade de blivit gröna för att det inte fanns något att städa, vilket är
// samma falska grönt som gav "14 gröna, 0 fel" på en trasig butik.
const urSmutsigt = (fil) =>
  readFileSync(fileURLToPath(new URL(`./fixtur-smutsigt-tema/${fil}`, import.meta.url)), 'utf8');


test('hittar källbutikens hero-text i startsidemallen', () => {
  const traffar = skannaFil('templates/index.json', '"heading": "Strumpor som ser ut som mat"');
  assert.equal(traffar.length, 1);
  assert.ok(traffar[0].ord.includes('strumpor som ser ut som mat'));
});

test('hittar källbutikens supportmejl i produktmallen', () => {
  const traffar = skannaFil('templates/product.json', 'kundsupport@matstrumpor.se så hjälper vi dig');
  assert.equal(traffar.length, 1);
  assert.ok(traffar[0].ord.includes('matstrumpor'));
});

test('hittar källbutikens kollektionshandle', () => {
  const traffar = skannaFil('templates/index.json', '"collection": "shopify://collections/strumporna"');
  assert.equal(traffar.length, 1);
});

// Bugg 1 (AVBRANDNING.md): minifierad JSON escapar snedstrecken, så
// 'collections/strumporna' träffade aldrig i den riktiga index.json.
test('escapade snedstreck i minifierad JSON hindrar inte träffen', () => {
  const traffar = skannaFil('templates/index.json', '{"button_link_1":"shopify:\\/\\/collections\\/strumporna"}');
  assert.equal(traffar.length, 1);
  assert.ok(traffar[0].ord.includes('collections/strumporna'));
  assert.equal(normalisera('shopify:\\/\\/collections\\/strumporna'), 'shopify://collections/strumporna');
  assert.equal(normalisera('Matstrumpor \\u00e4r'), 'matstrumpor är');
});

test('zip:ens riktiga index.json ger träff på kollektionslänken', () => {
  const traffar = skannaFil('templates/index.json', urSmutsigt('templates/index.json'));
  assert.ok(traffar.some((t) => t.ord.includes('collections/strumporna')), 'kollektionslänken ska hittas i den riktiga filen');
});

test('citatet visar sammanhanget runt träffen, inte början av en 7 000-teckensrad', () => {
  const lang = `{"x":"${'a'.repeat(3000)}","heading":"Strumpor som ser ut som mat","y":"${'b'.repeat(3000)}"}`;
  const [t] = skannaFil('templates/index.json', lang);
  assert.ok(t.text.includes('Strumpor som ser ut som mat'));
  assert.ok(t.text.length <= 200);
});

test('hittar källbutikens hela hero-citat', () => {
  assert.equal(skannaFil('a.json', '"heading": "Strumpor man aldrig blandar ihop"').length, 1);
});

test('en ren fil ger inga träffar', () => {
  assert.deepEqual(skannaFil('templates/index.json', '"heading": "Damasker för vandring"'), []);
});

test('vanliga produktord larmar INTE — "torr strumpa" är giltig nytta för damasker', () => {
  assert.deepEqual(skannaFil('templates/index.json', '"heading": "Kilometer fyra. Fortfarande torr strumpa."'), []);
  assert.deepEqual(skannaFil('a.json', 'Håller strumporna torra i snö och väta'), []);
  // "Fri frakt i hela Sverige" är korrekt copy för en svensk butik — inget källord.
  assert.deepEqual(skannaFil('a.json', 'Fri frakt i hela Sverige'), []);
});

test('skanningen är skiftlägesokänslig', () => {
  assert.equal(skannaFil('a.json', 'MATSTRUMPOR.SE').length, 1);
});

test('arKalltext känner igen källbutikens logga utan att veta filnamnet på förhand', () => {
  assert.equal(arKalltext('shopify://shop_images/Namnlos_design_-_2026-03-19T120925.579.png'), true);
  assert.equal(arKalltext('shopify://shop_images/drytrek-logga.png'), false);
  assert.equal(arKalltext(''), false);
});

test('skannaTema är rent bara när varje fil är ren', () => {
  assert.equal(skannaTema({ 'a.json': 'Damasker', 'b.json': 'Torra fötter' }).rent, true);
  assert.equal(skannaTema({ 'a.json': 'Damasker', 'b.json': 'sushi-strumpor' }).rent, false);
  assert.equal(skannaTema({ 'a.json': 'torra strumpor i väta' }).rent, true);
});

test('rapporten namnger fil och radnummer', () => {
  const r = rapport(skannaTema({ 'templates/index.json': 'rad ett\nsushi-strumpor' }));
  assert.ok(r.includes('templates/index.json:2'));
  assert.ok(r.includes('får INTE lämnas för publicering'));
});

test('KALLORD täcker de kända smittade mallarna', () => {
  for (const ord of ['matstrumpor', 'collections/strumporna', 'sushi-strumpor', 'levereras presentklart']) {
    assert.ok(KALLORD.includes(ord), `saknar ${ord}`);
  }
});

test('KANDA_SMITTADE bär header-group och settings_data', () => {
  for (const f of ['sections/header-group.json', 'config/settings_data.json', 'sections/footer-group.json', 'templates/index.json', 'templates/product.json']) {
    assert.ok(KANDA_SMITTADE.includes(f), `saknar ${f}`);
  }
  const t = tackning({ 'templates/index.json': '', 'x.liquid': '' });
  assert.deepEqual(t.lasta, ['templates/index.json']);
  assert.ok(t.saknade.includes('config/settings_data.json'));
});

// --- Källsektionerna (Axels bakläxa 2026-09-09: skrapkortet dök upp igen) ---

test('avbrandaSektionsgrupp tar bort skrapkort och cookieruta', () => {
  const grupp = {
    sections: {
      footer: { type: 'footer', settings: {} },
      ms_cookies: { type: 'ms-cookies' },
      ms_skrapkort: { type: 'ms-skrapkort' },
    },
    order: ['footer', 'ms_cookies', 'ms_skrapkort'],
  };
  const { json, borttaget } = avbrandaSektionsgrupp(grupp);
  assert.deepEqual(Object.keys(json.sections), ['footer']);
  assert.deepEqual(json.order, ['footer']);
  assert.equal(borttaget.length, 2);
});

// Bugg 2 (AVBRANDNING.md): 'newsletter' är ingen sektionstyp — det är
// footer-sektionens inställning newsletter_enable.
test('nyhetsbrevet är en INSTÄLLNING på footern och slås av, inte en sektionstyp', () => {
  assert.ok(!KALLSEKTIONER.includes('newsletter'), "'newsletter' matchar aldrig som sektionstyp");
  assert.equal(KALLINSTALLNINGAR.footer.newsletter_enable, false);
  const grupp = { sections: { footer: { type: 'footer', settings: { newsletter_enable: true, newsletter_heading: 'Missa inga nyheter' } } }, order: ['footer'] };
  const { json, borttaget } = avbrandaSektionsgrupp(grupp);
  assert.equal(json.sections.footer.settings.newsletter_enable, false);
  assert.equal(json.sections.footer.settings.newsletter_heading, '');
  assert.equal(borttaget.length, 2);
  // Idempotent: andra varvet ändrar inget.
  assert.equal(avbrandaSektionsgrupp(json).borttaget.length, 0);
});

test('avbrandaSektionsgrupp på zip:ens riktiga footer-group: sektioner bort, nyhetsbrev av, giltig JSON', () => {
  const ra = urSmutsigt('sections/footer-group.json');
  const fore = skannaSektionsgrupp('sections/footer-group.json', ra);
  assert.ok(fore.some((t) => t.ord.includes('ms-skrapkort')));
  assert.ok(fore.some((t) => t.ord.includes('newsletter_enable')));
  const { json, borttaget } = avbrandaSektionsgrupp(ra);
  assert.deepEqual(json.order, ['footer']);
  assert.deepEqual(Object.keys(json.sections), ['footer']);
  assert.equal(json.sections.footer.settings.newsletter_enable, false);
  assert.ok(borttaget.some((x) => x.includes('ms-skrapkort')) && borttaget.some((x) => x.includes('ms-cookies')));
  // Skanningen efteråt hittar inga källsektioner.
  assert.deepEqual(skannaSektionsgrupp('sections/footer-group.json', json), []);
  JSON.parse(JSON.stringify(json));
});

test('avbrandaSektionsgrupp på zip:ens riktiga header-group: källbutikens tre annonsblock bort', () => {
  const ra = urSmutsigt('sections/header-group.json');
  const fore = skannaSektionsgrupp('sections/header-group.json', ra);
  assert.equal(fore.length, 3, 'tre källannonser i zip:en');
  const { json, borttaget } = avbrandaSektionsgrupp(ra);
  const bar = json.sections['announcement-bar'];
  assert.deepEqual(Object.keys(bar.blocks), []);
  assert.deepEqual(bar.block_order, []);
  assert.equal(borttaget.length, 3);
  assert.ok(borttaget.some((x) => x.includes('Levereras presentklart')));
  // Headern och ordningen är kvar — bara blocken åkte.
  assert.deepEqual(json.order, ['announcement-bar', 'header']);
  assert.deepEqual(skannaSektionsgrupp('sections/header-group.json', json), []);
});

test('butikens egna annonsrader tas aldrig bort, även om texten råkar vara en källannons', () => {
  const grupp = {
    sections: {
      'announcement-bar': {
        type: 'announcement-bar',
        blocks: {
          a1: { type: 'announcement', settings: { text: 'Levereras presentklart', link: '' } },
          opf_a1: { type: 'announcement', settings: { text: '30 dagars öppet köp', link: '' } },
          opf_a2: { type: 'announcement', settings: { text: 'Fri frakt – Sverige & Norge', link: '' } },
        },
        block_order: ['a1', 'opf_a1', 'opf_a2'],
        settings: {},
      },
    },
    order: ['announcement-bar'],
  };
  const { json } = avbrandaSektionsgrupp(grupp, { behall: ['30 dagars öppet köp'] });
  assert.deepEqual(json.sections['announcement-bar'].block_order, ['opf_a1', 'opf_a2']);
  assert.ok(KALLANNONSER.includes('levereras presentklart'));
});

test('avbrandaSektionsgrupp rör inte butikens egna sektioner', () => {
  const grupp = { sections: { footer: { type: 'footer', settings: { newsletter_enable: false } }, opf_usp: { type: 'opf-usp' } }, order: ['footer', 'opf_usp'] };
  const { borttaget } = avbrandaSektionsgrupp(grupp);
  assert.equal(borttaget.length, 0);
});

test('skannaSektionsgrupp hittar källsektioner utan att ändra', () => {
  const traffar = skannaSektionsgrupp('sections/footer-group.json', {
    sections: { ms_skrapkort: { type: 'ms-skrapkort' } },
  });
  assert.equal(traffar.length, 1);
  assert.ok(traffar[0].text.includes('ms-skrapkort'));
});

test('skannaTema skannar sektionsgrupperna strukturellt — zip:ens footer-group larmar för skrapkortet', () => {
  const res = skannaTema({ 'sections/footer-group.json': urSmutsigt('sections/footer-group.json') });
  assert.ok(res.traffar.some((t) => t.ord.includes('ms-skrapkort')));
  assert.ok(res.traffar.some((t) => t.ord.includes('newsletter_enable')));
});
