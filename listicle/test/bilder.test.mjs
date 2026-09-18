import test from 'node:test';
import assert from 'node:assert/strict';
import { deflateSync } from 'node:zlib';
import { bilddimensioner, granskaBildplan, losBilder, cacheNyckel } from '../bilder.mjs';
import { lasMall } from '../gempages.mjs';

const { platser } = lasMall();
const PRODUKT = { kortTitel: 'Axelbälte', bilder: [
  { src: 'https://cdn.shopify.com/p1.jpg', width: 1240, height: 1240 },
  { src: 'https://cdn.shopify.com/p2.jpg', width: 1500, height: 1500 },
] };

function png(w, h) {
  const b = Buffer.alloc(33);
  b.write('\x89PNG\r\n\x1a\n', 0, 'binary');
  b.writeUInt32BE(13, 8); b.write('IHDR', 12, 'ascii'); b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
  return b;
}

test('bilddimensioner: PNG, JPEG, GIF, WebP, skräp', () => {
  assert.deepEqual(bilddimensioner(png(1024, 768)), { width: 1024, height: 768 });
  // JPEG: SOI, APP0-segment, SOF0 med höjd 600 bredd 800
  const jpg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x04, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x02, 0x58, 0x03, 0x20, 0x03]);
  assert.deepEqual(bilddimensioner(jpg), { height: 600, width: 800 });
  const gif = Buffer.concat([Buffer.from('GIF89a', 'ascii'), Buffer.from([0x20, 0x03, 0x58, 0x02, 0, 0, 0, 0])]);
  assert.deepEqual(bilddimensioner(gif), { width: 800, height: 600 });
  const webp = Buffer.alloc(30); webp.write('RIFF', 0, 'ascii'); webp.write('WEBP', 8, 'ascii'); webp.write('VP8 ', 12, 'ascii'); webp.writeUInt16LE(640, 26); webp.writeUInt16LE(480, 28);
  assert.deepEqual(bilddimensioner(webp), { width: 640, height: 480 });
  assert.equal(bilddimensioner(Buffer.from('hej')), null);
  assert.equal(bilddimensioner(deflateSync(Buffer.from('x'))), null);
});

test('granskaBildplan: alla sex platser krävs, index inom produkten, hero/sidfot byts aldrig', () => {
  const plan = { bilder: {
    punkt1: { kalla: 'produkt', index: 2 },
    punkt2: { kalla: 'kie', prompt: 'A worn trimmer strap on a garage floor, photo, no text, no people', referenser: ['https://cdn.shopify.com/p1.jpg'] },
    punkt3: { kalla: 'url', url: 'https://cdn.shopify.com/x.jpg', width: 800, height: 800 },
    punkt4: { kalla: 'mall' },
    punkt5: { kalla: 'produkt', index: 1 },
    lyckas: { kalla: 'produkt', index: 1 },
  } };
  const g = granskaBildplan(plan, PRODUKT, platser);
  assert.deepEqual(g.fel, []);
  assert.ok(g.varningar.some((v) => /punkt4: behåller mallens bild/.test(v)));
  assert.equal(g.poster.punkt2.format, '1:1');
  assert.equal(g.poster.punkt2.kalla, 'kie');

  const trasig = granskaBildplan({ bilder: { punkt1: { kalla: 'produkt', index: 9 }, punkt2: { kalla: 'kie', prompt: 'kort' }, punkt3: { kalla: 'url', url: 'http://x' }, hero: { kalla: 'mall' }, fel: { kalla: 'mall' } } }, PRODUKT, platser);
  assert.ok(trasig.fel.some((f) => /punkt1: index 9/.test(f)));
  assert.ok(trasig.fel.some((f) => /punkt2: kie-prompten är för kort/.test(f)));
  assert.ok(trasig.fel.some((f) => /punkt3: url måste vara https/.test(f)));
  assert.ok(trasig.fel.some((f) => /hero: byts aldrig/.test(f)));
  assert.ok(trasig.fel.some((f) => /fel: okänd bildplats/.test(f)));
  assert.ok(trasig.fel.some((f) => /punkt4: saknas/.test(f)));
  assert.ok(trasig.fel.some((f) => /lyckas: saknas/.test(f)));
  assert.equal(granskaBildplan({}, PRODUKT, platser).fel.length, 6);
});

test('losBilder: produkt/url/mall utan nät, kie via injicerade funktioner, cache och --igen', async () => {
  const poster = granskaBildplan({ bilder: {
    punkt1: { kalla: 'produkt', index: 2 },
    punkt2: { kalla: 'kie', prompt: 'A worn trimmer strap on a garage floor, photo, no text, no people', referenser: [] },
    punkt3: { kalla: 'url', url: 'https://cdn.shopify.com/x.png' },
    punkt4: { kalla: 'mall' },
    punkt5: { kalla: 'kie', prompt: 'The strap in use on a green lawn, morning light, no text, no faces', referenser: [] },
    lyckas: { kalla: 'produkt', index: 1 },
  } }, PRODUKT, platser).poster;

  const anrop = [];
  const generera = async ({ plats }) => { anrop.push(`gen:${plats}`); return { url: `https://kie/${plats}.png`, taskId: `t-${plats}` }; };
  const laddaUpp = async (url, { filnamn }) => { anrop.push(`upp:${filnamn}`); return { src: `https://cdn.shopify.com/${filnamn}`, width: 1024, height: 1024, via: 'bildarkiv' }; };
  const hamta = async (url) => { anrop.push(`hamta:${url}`); return png(900, 700); };
  const sparade = [];
  const sparaLokalt = (plats) => { sparade.push(plats); return `/tmp/${plats}.png`; };

  const { bilder, cache } = await losBilder(poster, PRODUKT, { generera, laddaUpp, hamta, sparaLokalt, filnamnBas: 'axel-lp' });
  assert.deepEqual(bilder.punkt1, { src: 'https://cdn.shopify.com/p2.jpg', width: 1500, height: 1500, kalla: 'produkt #2' });
  assert.deepEqual(bilder.punkt3, { src: 'https://cdn.shopify.com/x.png', width: 900, height: 700, kalla: 'url' });
  assert.equal(bilder.punkt4, undefined, 'mall = rörs inte');
  assert.equal(bilder.punkt2.src, 'https://cdn.shopify.com/axel-lp-punkt2.png');
  assert.equal(bilder.punkt2.kalla, 'kie → bildarkiv');
  assert.equal(cache.punkt2.nyckel, cacheNyckel(poster.punkt2));
  assert.equal(cache.punkt5.taskId, 't-punkt5');
  assert.deepEqual(sparade, ['punkt2', 'punkt5']);
  assert.ok(anrop.includes('gen:punkt2') && anrop.includes('upp:axel-lp-punkt5.png'));

  // Andra körningen: cachen används, inget genereras.
  const anrop2 = [];
  const igen = await losBilder(poster, PRODUKT, { cache, generera: async ({ plats }) => { anrop2.push(plats); return { url: 'https://kie/ny.png' }; }, laddaUpp, hamta, igen: ['punkt5'] });
  assert.deepEqual(anrop2, ['punkt5'], 'bara --igen-platsen genereras om');
  assert.equal(igen.bilder.punkt2.src, 'https://cdn.shopify.com/axel-lp-punkt2.png');
  assert.match(igen.bilder.punkt2.kalla, /cachad/);

  // Torr: inget nät alls.
  const torr = await losBilder(poster, PRODUKT, { torr: true });
  assert.equal(torr.bilder.punkt2.src, null);
  assert.equal(torr.bilder.punkt3.width, 0);
  await assert.rejects(losBilder(poster, PRODUKT, {}), /generera\/laddaUpp saknas/);
});
