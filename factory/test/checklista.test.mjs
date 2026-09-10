// Tester för VA-checklistan: butiksnivå, valutan först, alla produkter
// listade, inga hårdkodade butiksvärden. Ren logik — ingen fil skrivs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggChecklista, checklistaVarden } from '../checklista.mjs';
import { rabutik, raprodukt } from './hjalp.mjs';

const butik = () => ({
  ...rabutik(),
  butik: { ...rabutik().butik, id: 'testbutiken', brand: 'Nackmagneten', marknader: [{ land: 'NO', locale: 'nb', valuta: 'SEK' }] },
});
const produktB = () => ({ produkt: { namn: 'Nackkudden', id: 'nackkudden' }, brand: { domanideer: ['nackkudden.se'] } });

const pos = (md, s) => {
  const i = md.indexOf(s);
  assert.ok(i >= 0, `saknas i checklistan: ${s}`);
  return i;
};

test('valutan, huvudmarknaden och språket kommer FÖRE butiksnamnet i sektion 5', () => {
  const md = byggChecklista(butik(), [raprodukt()]);
  const valuta = pos(md, '**Store currency** says **SEK**');
  const marknad = pos(md, '**Sweden** is the primary market');
  const sprak = pos(md, '**Swedish** is the default');
  const namn = pos(md, 'Store name → **Nackmagneten**');
  assert.ok(valuta < marknad && marknad < sprak && sprak < namn, 'ordningen: valuta → marknad → språk → namn');
  assert.ok(pos(md, '## 5. Shopify – basics') < valuta, 'valutasteget ligger i sektion 5');
  assert.ok(pos(md, 'currency and language are set') < namn, 'VA:n säger till innan hon döper butiken');
});

test('registreringen kräver BOLAGETS adress — den avgör valutan', () => {
  // TackleBay 2026-09-09: VA:n sitter i Filippinerna och skrev sin egen
  // adress, så butiken föddes i PHP med engelska och Filippinerna som
  // hemmamarknad. Åtta rabattkoder skrevs i fel valuta innan någon märkte
  // det. Adressen står nu i steg 1, och steg 5 är en kontroll av utfallet.
  const md = byggChecklista(butik(), [raprodukt()]);
  const adress = pos(md, 'Exempelbolaget AB');
  assert.ok(adress > 0, 'bolagsnamnet ska stå i registreringssteget');
  assert.ok(pos(md, '## 1. Shopify – create the store') < adress);
  assert.ok(adress < pos(md, '## 2.'), 'adressen hör till steg 1, inte senare');
  assert.ok(md.includes('decides the currency'), 'varför adressen spelar roll ska stå där');
  // Kontrollen i steg 1 ska nämna både valutan och landet.
  const kontroll = md.slice(pos(md, '## 1.'), pos(md, '## 2.'));
  assert.ok(kontroll.includes('**SEK**') && kontroll.includes('**Sweden**'));
});

test('EN fil på butiksnivå listar alla produkter och en recensionsrad per produkt', () => {
  const md = byggChecklista(butik(), [raprodukt(), produktB()]);
  assert.ok(md.includes('* PRODUCT: **Nackmagneten** (nackmagneten)'));
  assert.ok(md.includes('* PRODUCT: **Nackkudden** (nackkudden)'));
  assert.ok(md.includes('several products – it is still ONE store'));
  assert.ok(md.includes('reviews file Claude gives you for **Nackmagneten**'));
  assert.ok(md.includes('reviews file Claude gives you for **Nackkudden**'));
  assert.equal((md.match(/# Store Launch Checklist/g) ?? []).length, 1, 'en rubrik = en fil');
});

test('de fyra env-variablerna bär en tagg, och ägare/inkorg är två adresser', () => {
  // Axels beslut 2026-09-10: varje butik får sina egna fyra rader, märkta med
  // en tagg. Alla sessioner på kontot delar EN Environment — utan tagg slåss
  // två parallella bygg om samma fyra rader och det ena skriver i fel butik.
  // VA:n behöver inte minnas taggen: hon skriver butikens ADRESS i
  // byggkommandot, och koden slår upp raderna ur den. (Fyra dagars stopp.)
  const md = byggChecklista(butik(), [raprodukt()]);
  const rad = md.split('\n').filter((r) => /`SHOPIFY_[A-Z0-9_]+(<TAG>)?`/.test(r));
  assert.deepEqual(
    rad.map((r) => r.match(/`(SHOPIFY_[A-Z0-9_<>]+)`/)[1]),
    ['SHOPIFY_SHOP_<TAG>', 'SHOPIFY_CLIENT_ID_<TAG>', 'SHOPIFY_CLIENT_SECRET_<TAG>', 'SHOPIFY_STOREFRONT_PASSWORD_<TAG>']
  );
  assert.ok(md.includes('you write the store ADDRESS in the'), 'adressen är gränssnittet, inte taggen');
  assert.ok(md.includes('Save the Environment BEFORE you start the session'));
  const v = checklistaVarden(butik(), [raprodukt()]);
  assert.notEqual(v.inkorg, v.agare, 'vidarebefordran och ägarbyte går till olika adresser');
  assert.ok(md.includes(`forward to **${v.inkorg}**`));
  assert.ok(md.includes(`**Transfer store ownership** → **${v.agare}**`));
});

test('Judge.me-importen sker i appen (originaldatum), aldrig via API-token', () => {
  const md = byggChecklista(butik(), [raprodukt()]);
  assert.ok(md.includes('Import from apps → **Judge.me format**'));
  assert.ok(md.includes('original dates (never "just now")'));
  assert.ok(!md.includes('copy **API Token**'), 'API-vägen sätter importögonblicket som datum');
});

test('pixel-id och temanamn skrivs in när de finns, annars "Claude gives you"', () => {
  const utan = byggChecklista(butik(), [raprodukt()]);
  assert.ok(utan.includes('paste the **pixel ID** Claude gives you'));
  assert.ok(utan.includes('the theme Claude names → **Publish**'));
  const med = byggChecklista(butik(), [raprodukt()], { pixelId: '987654321', temaNamn: 'OPS Nackmagneten v2' });
  assert.ok(med.includes('paste the **pixel ID**: **987654321**'));
  assert.ok(med.includes('Themes → **OPS Nackmagneten v2** → **Publish**'));
});

test('marknaderna kommer ur yaml, inte ur koden: NOK-steget bara när NO finns', () => {
  const med = byggChecklista(butik(), [raprodukt()]);
  assert.ok(med.includes('Settings → Markets → **Norway** → activate **NOK** → Save'));
  const b = butik();
  b.butik.marknader = [{ land: 'DK', locale: 'da', valuta: 'SEK' }];
  const dk = byggChecklista(b, [raprodukt()]);
  assert.ok(dk.includes('**Denmark** → activate **DKK**'));
  assert.ok(!dk.includes('Norway'), 'ingen norsk rad utan norsk marknad');
  delete b.butik.marknader;
  const ingen = byggChecklista(b, [raprodukt()]);
  assert.ok(!ingen.includes('activate **NOK**') && !ingen.includes('activate **DKK**'));
});

test('valuta och land följer butiksfilen — en NOK-butik i Norge får inte SEK/Sweden', () => {
  const b = butik();
  b.butik.valuta = 'NOK';
  b.butik.land = 'NO';
  b.butik.supportmail = 'hello@nakkemagnet.no';
  const md = byggChecklista(b, [raprodukt()]);
  assert.ok(md.includes('**Store currency** says **NOK**'));
  assert.ok(md.includes('**Norway** is the primary market'));
  assert.ok(md.includes('**Norwegian** is the default'));
  assert.ok(md.includes('Judge.me → Settings → Language → **Norwegian**'));
  assert.ok(!md.includes('**SEK**'), 'ingen SEK i en NOK-butik');
  assert.ok(md.includes('Buy **nakkemagnet.no**'), 'domänen ur supportmailen');
});

test('domänen härleds ur supportmail (hello@<domän>), annars ur produktens domänidé', () => {
  const v = checklistaVarden(butik(), [raprodukt()]);
  assert.equal(v.doman, 'nackmagneten.se');
  assert.equal(v.mail, 'hello@nackmagneten.se');
  const b = butik();
  delete b.butik.supportmail;
  const v2 = checklistaVarden(b, [produktB()]);
  assert.equal(v2.doman, 'nackkudden.se');
  assert.equal(v2.mail, 'hello@nackkudden.se');
});

test('stjärnfärgen kommer ur branding.mjs och butiks-id:t sitter i /ny-annonser-raden', () => {
  const md = byggChecklista(butik(), [raprodukt()]);
  assert.ok(md.includes('star color: **00B77F**'));
  assert.ok(md.includes('**/ny-annonser testbutiken**'));
});

test('bakåtkompatibel: den gamla ordningen (produkt, butik) ger samma fil', () => {
  const ny = byggChecklista(butik(), [raprodukt()]);
  const gammal = byggChecklista(raprodukt(), butik());
  assert.equal(gammal, ny);
});
