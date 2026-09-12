// Tester för trådning, riktning, obesvarat och svarstid.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tolkaMejl } from '../mime.mjs';
import { byggArenden, sammanfattaArenden, arEgen, arSystem, median } from '../arenden.mjs';

const FIXTUR = join(dirname(fileURLToPath(import.meta.url)), 'fixturer', 'demo', 'demobutiken');
const BRAND = { id: 'demobutiken', brand: 'Demobutiken', supportmail: 'hello@demobutiken.se' };
const NU = new Date('2026-09-14T12:00:00Z');
const lasMapp = (m) => readdirSync(join(FIXTUR, m)).sort().map((f, i) => tolkaMejl(readFileSync(join(FIXTUR, m, f), 'latin1'), { uid: i + 1, mapp: m }));

test('egen domän och systemavsändare känns igen', () => {
  assert.equal(arEgen('hello@demobutiken.se', BRAND), true);
  assert.equal(arEgen('Support@DemoButiken.se', BRAND), true);
  assert.equal(arEgen('kund@gmail.com', BRAND), false);
  assert.equal(arSystem('no-reply@shopify.com'), true);
  assert.equal(arSystem('noreply@klarna.com'), true);
  assert.equal(arSystem('kund@gmail.com'), false);
  assert.equal(arSystem('kund@gmail.com', 'Mail delivery failed'), true);
});

test('fixturen ger nio ärenden: autosvar, nyhetsbrev och Shopify-mejl filtreras', () => {
  const { arenden, bortfiltrerade, antalMejl } = byggArenden({ inkorg: lasMapp('inkorg'), skickat: lasMapp('skickat'), brand: BRAND, nu: NU, trosklar: { obesvarad_timmar: 48 } });
  assert.equal(antalMejl, 17);
  assert.equal(bortfiltrerade.autosvar, 1);
  assert.equal(bortfiltrerade.listmejl, 1);
  assert.equal(bortfiltrerade.system, 1);
  assert.equal(arenden.length, 9);
});

test('en tråd: kundens andra mejl (via In-Reply-To) gör ärendet obesvarat igen', () => {
  const { arenden } = byggArenden({ inkorg: lasMapp('inkorg'), skickat: lasMapp('skickat'), brand: BRAND, nu: NU });
  const anna = arenden.find((a) => a.kund.adress === 'anna.karlsson@gmail.com');
  assert.ok(anna);
  assert.equal(anna.antalInkommande, 2);
  assert.equal(anna.antalSvar, 1);
  assert.equal(anna.besvarad, false, 'sista inkommande saknar svar');
  assert.equal(anna.svarstidTimmar, 3.8, 'första svaret kom efter 3h45');
  assert.equal(anna.larmObesvarad, true, 'obesvarat sedan 12 sep 06:00 → > 48 h');
  assert.deepEqual(anna.ordernummer, ['1042']);
});

test('besvarade ärenden får svarstid, obesvarade under gränsen blir inte larm', () => {
  const { arenden } = byggArenden({ inkorg: lasMapp('inkorg'), skickat: lasMapp('skickat'), brand: BRAND, nu: NU });
  const borje = arenden.find((a) => a.kund.adress === 'borje.akesson@hotmail.com');
  assert.equal(borje.besvarad, true);
  assert.equal(borje.svarstidTimmar, 3.7);
  const lisa = arenden.find((a) => a.kund.adress === 'lisa.berg@icloud.com');
  assert.equal(lisa.besvarad, false);
  assert.equal(lisa.larmObesvarad, false, '40 h < 48 h');
  const james = arenden.find((a) => a.kund.adress === 'james.miller@outlook.com');
  assert.equal(james.kategori, 'chargeback_hot');
  assert.equal(james.larmObesvarad, true);
});

test('sammanfattningen räknar per kategori och median utan spam', () => {
  const { arenden } = byggArenden({ inkorg: lasMapp('inkorg'), skickat: lasMapp('skickat'), brand: BRAND, nu: NU });
  const s = sammanfattaArenden(arenden);
  assert.equal(s.antalArenden, 9);
  assert.equal(s.larmObesvarade, 4);
  assert.equal(s.topp[0].id, 'ej_levererad');
  assert.equal(s.topp[0].antal, 2);
  assert.equal(s.besvaradeMedTid, 4);
  assert.equal(median([1, 5, 3]), 3);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(median([]), null);
});

test('utan skickat-mapp räknas svar som ligger i inkorgen ändå', () => {
  const inkorg = lasMapp('inkorg');
  const skickat = lasMapp('skickat');
  const { arenden } = byggArenden({ inkorg: [...inkorg, ...skickat], skickat: [], brand: BRAND, nu: NU });
  const borje = arenden.find((a) => a.kund.adress === 'borje.akesson@hotmail.com');
  assert.equal(borje.besvarad, true, 'svaret från egen domän i inkorgen räknas som utgående');
});
