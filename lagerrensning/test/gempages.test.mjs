// Tester för sidbygget. Inga nätanrop. Mallen (den riktiga GemPages-exporten)
// är fixturen — testerna bevisar formatantagandena i gempages.mjs:
// Go-serialisering, checksum-formeln, stora tal och rundturen copy → sida.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  lasMall, goJson, checksum, taggaStoraTal, avtaggaStoraTal, lasJson, skrivJson, talText,
  copyUrMall, byggSida, granskaCopy, granskaChecksummor, tillGempages, urGempages, lasAvSida,
  renderaText, textUrHtml, htmlAv, svensktDatum, priserI, bytIdn, lasCopy, sattCopy, MALL_FIL,
} from '../gempages.mjs';

const { mall, platser, manifest } = lasMall();
const MOTOR = {
  url: 'https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd',
  kortTitel: 'Motorhölje', slug: 'motorholje', pris: 299, jamforpris: 367, prisText: '299 kr', jamforprisText: '367 kr',
};

test('goJson skriver varje sektions component exakt som GemPages (Go) gjorde', () => {
  for (const s of mall.pageSections) assert.equal(goJson(JSON.parse(s.component)), s.component, s.cid);
});

test('checksum = sha256(themePageID + component) för alla tio sektioner', () => {
  for (const s of mall.pageSections) assert.equal(checksum(s.themePageID, s.component), s.checksum, s.cid);
  assert.equal(granskaChecksummor(mall).length, 0);
});

test('stora tal överlever läs/skriv tecken för tecken', () => {
  const original = readFileSync(MALL_FIL, 'utf8');
  assert.equal(skrivJson(lasJson(original)), original.trimEnd());
  assert.equal(talText(mall.id), '631451887748514611');
  assert.equal(taggaStoraTal('{"a":631451887748514611,"b":"x:631451887748514611","c":[1,2]}'), '{"a":"__stort_tal__:631451887748514611","b":"x:631451887748514611","c":[1,2]}');
  assert.equal(avtaggaStoraTal('{"a":"__stort_tal__:631451887748514611"}'), '{"a":631451887748514611}');
  assert.equal(taggaStoraTal('{"s":"a\\"b:1234567890123456"}'), '{"s":"a\\"b:1234567890123456"}');
});

test('copy ur mallen → byggSida ger tillbaka exakt samma sida (rundtur)', () => {
  const copy = copyUrMall(mall, platser);
  assert.equal(copy.punkter.length, 5);
  assert.match(copy.hero.rubrik, /^Vi beställde in för många motorhöljen/);
  assert.equal(copy.punkter[4].rubrik, '**5. Ett billigt hölje är dyrare än inget**');
  assert.deepEqual(copy.hero.sammanfattning.length, 2);
  const { sida, rapport } = byggSida({ mall, platser, produkt: MOTOR, copy, datum: '2026-08-04' });
  for (const s of sida.pageSections) {
    const o = mall.pageSections.find((x) => x.cid === s.cid);
    assert.equal(s.component, o.component, s.cid);
    assert.equal(s.checksum, o.checksum, s.cid);
  }
  assert.equal(sida.name, mall.name);
  assert.equal(sida.handle, mall.handle);
  assert.equal(rapport.lankar, 8);
  assert.equal(rapport.texter.length, Object.keys(platser.text).length);
  assert.deepEqual(granskaCopy(copy, MOTOR, platser).fel, []);
});

test('byggSida byter text, länk, datum, bilder och räknar om checksummorna', () => {
  const copy = copyUrMall(mall, platser);
  copy.hero.rubrik = 'Vi beställde in för många axelbälten och nu får du ditt för 599 kr istället för 789 kr så länge lagret räcker';
  copy.punkter[0].text = 'Första stycket med **fet** text.\n\nAndra stycket.';
  const produkt = { url: 'https://baverbutiken.se/products/axelbalte', kortTitel: 'Axelbälte för Trimmer', slug: 'axelbalte-for-trimmer', pris: 599, jamforpris: 789 };
  const bilder = { punkt1: { src: 'https://cdn.shopify.com/x/a.png', width: 1000, height: 800 }, lyckas: { src: 'https://cdn.shopify.com/x/b.jpg', width: 1500, height: 1500 } };
  const { sida, rapport } = byggSida({ mall, platser, produkt, copy, bilder, datum: '2026-09-16' });
  assert.equal(sida.name, 'Axelbälte för Trimmer – Lagerrensning (listicle)');
  assert.equal(sida.handle, 'axelbalte-for-trimmer-lagerrensning');
  assert.equal(sida.meta.find((m) => m.key === 'global-meta-title').value, sida.name);
  assert.equal(sida.meta.find((m) => m.key === 'capture_page').value, null);
  assert.equal(granskaChecksummor(sida).length, 0);
  const rader = lasAvSida(sida);
  assert.ok(rader.some((r) => r.tag === 'Heading' && r.text.startsWith('Vi beställde in för många axelbälten')));
  assert.ok(rader.some((r) => r.tag === 'Text' && r.text === 'Senast uppdaterad 16 september 2026.'));
  assert.ok(rader.filter((r) => r.tag === 'Button').every((r) => r.link === produkt.url));
  assert.equal(rader.filter((r) => r.tag === 'Button').length, 8);
  const p1 = rader.filter((r) => r.tag === 'Image' && r.src === 'https://cdn.shopify.com/x/a.png');
  assert.equal(p1.length, 2, 'punkt1 har desktop- och mobilbild');
  assert.ok(p1.every((r) => r.width === 1000 && r.height === 800));
  assert.equal(rader.filter((r) => r.tag === 'Image' && r.src === 'https://cdn.shopify.com/x/b.jpg').length, 1);
  assert.equal(rapport.bilder.length, 2);
  // fetstil och stycken i komponentsträngen, Go-escapat
  const s = sida.pageSections.find((x) => x.cid === 'gFUogNLoms').component;
  assert.ok(s.includes('\\u003cp\\u003eFörsta stycket med \\u003cstrong\\u003efet\\u003c/strong\\u003e text.\\u003c/p\\u003e\\u003cp\\u003e\\u0026nbsp;\\u003c/p\\u003e\\u003cp\\u003eAndra stycket.\\u003c/p\\u003e'));
  // mallen rördes inte
  assert.equal(granskaChecksummor(mall).length, 0);
  assert.equal(mall.name, 'Motorhölje – Lagerrensning (listicle)');
});

test('byggSida kastar när copyn saknar en plats eller bildplatsen är okänd', () => {
  const copy = copyUrMall(mall, platser);
  delete copy.punkter[2].knapp;
  assert.throws(() => byggSida({ mall, platser, produkt: MOTOR, copy }), /punkt3\.knapp/);
  const hel = copyUrMall(mall, platser);
  assert.throws(() => byggSida({ mall, platser, produkt: MOTOR, copy: hel, bilder: { logga: { src: 'x', width: 1, height: 1 } } }), /Okänd bildplats/);
  assert.throws(() => byggSida({ mall, platser, produkt: MOTOR, copy: hel, bilder: { punkt1: { src: 'x' } } }), /bredd\/höjd/);
});

test('renderaText och textUrHtml är varandras motsatser', () => {
  assert.equal(renderaText('p', 'a **b** c'), '<p>a <strong>b</strong> c</p>');
  assert.equal(renderaText('p', ['x', 'y']), '<p>x</p><p>&nbsp;</p><p>y</p>');
  assert.equal(renderaText('ren', 'Rubrik <3 & co'), 'Rubrik &lt;3 &amp; co');
  assert.equal(renderaText('knapp', 'Ja tack → 599 kr'), '<p>Ja tack → 599 kr</p>');
  assert.equal(renderaText('sammanfattning', ['a', 'b']), '<p><span style="color:#000000;"><strong>Sammanfattning:</strong> a&nbsp;</span><br><span style="color:#000000;">b</span></p>');
  assert.equal(renderaText('sammanfattning', ['**Sammanfattning:** a']), '<p><span style="color:#000000;"><strong>Sammanfattning:</strong> a</span></p>');
  assert.deepEqual(textUrHtml('p', '<p>x</p><p>&nbsp;</p><p>y</p>'), ['x', 'y']);
  assert.equal(textUrHtml('p', '<p>a <strong>b</strong></p>'), 'a **b**');
  assert.deepEqual(textUrHtml('sammanfattning', renderaText('sammanfattning', ['a', 'b'])), ['a', 'b']);
  assert.equal(htmlAv('<script>'), '&lt;script&gt;');
  assert.throws(() => renderaText('hej', 'x'), /Okänd textform/);
});

test('lasCopy/sattCopy adresserar punkter och block', () => {
  const c = sattCopy(sattCopy({}, 'punkt2.rubrik', 'R'), 'hero.knapp', 'K');
  assert.equal(lasCopy(c, 'punkt2.rubrik'), 'R');
  assert.equal(lasCopy(c, 'hero.knapp'), 'K');
  assert.equal(lasCopy(c, 'punkt1.rubrik'), undefined);
});

test('granskaCopy stoppar fel pris, procent, HTML och förbjudna fraser', () => {
  const copy = copyUrMall(mall, platser);
  copy.punkter[1].text = 'Nu 249 kr i stället för 367 kr. Spara 20 % innan lagret tar slut. <b>fet</b>';
  const { fel } = granskaCopy(copy, MOTOR, platser);
  assert.ok(fel.some((f) => /punkt2\.text: priset 249 kr/.test(f)), fel.join('\n'));
  assert.ok(fel.some((f) => /procentsats/.test(f)));
  assert.ok(fel.some((f) => /innehåller HTML/.test(f)));
  assert.ok(fel.some((f) => /innan lagret tar slut/.test(f)));
  const utan = copyUrMall(mall, platser);
  utan.punkter = utan.punkter.slice(0, 4);
  assert.ok(granskaCopy(utan, MOTOR, platser).fel.some((f) => /punkt5\.rubrik: saknas/.test(f)));
  assert.ok(granskaCopy(utan, MOTOR, platser).fel.some((f) => /exakt 5/.test(f)));
  const varn = granskaCopy(copyUrMall(mall, platser), { ...MOTOR, pris: 349, jamforpris: 420 }, platser);
  assert.ok(varn.fel.length > 0, 'gamla priser mot ny produkt ska stoppa');
});

test('priserI läser svenska pristal', () => {
  assert.deepEqual(priserI('299 kr istället för 367 kr, 1 129 kr, 89:-, 12 st'), [299, 367, 1129, 89]);
  assert.deepEqual(priserI('ingen siffra'), []);
});

test('svensktDatum', () => {
  assert.equal(svensktDatum('2026-08-04'), '4 augusti 2026');
  assert.equal(svensktDatum('2026-12-24'), '24 december 2026');
  assert.throws(() => svensktDatum('igår'));
});

test('tillGempages → urGempages ger samma sida med rätt checksummor', () => {
  const copy = copyUrMall(mall, platser);
  const { sida } = byggSida({ mall, platser, produkt: MOTOR, copy, datum: '2026-08-04' });
  const zip = tillGempages(sida, manifest);
  const { manifest: m, info, sidor } = urGempages(zip);
  assert.equal(m.export_version, 'export_v2');
  assert.equal(sidor.length, 1);
  assert.equal(talText(info[0].id), talText(sida.id));
  assert.equal(info[0].name, sida.name);
  assert.equal(granskaChecksummor(sidor[0]).length, 0);
  assert.equal(sidor[0].pageSections.length, 10);
  assert.equal(skrivJson(sidor[0]), skrivJson(sida));
});

test('den riktiga exporten går att läsa och har rätt checksummor', () => {
  const { sidor, manifest: m } = urGempages(readFileSync(new URL('../mall/motorholje-lagerrensning.gempages', import.meta.url)));
  assert.equal(sidor.length, 1);
  assert.equal(sidor[0].name, 'Motorhölje – Lagerrensning (listicle)');
  assert.equal(granskaChecksummor(sidor[0]).length, 0);
  assert.equal(m.theme_page_count, 1);
});

test('Axels egen axelbältessida är en kopia av mallen: samma sektioner, samma element, rätt checksummor', () => {
  // Exporterad av Axel 2026-09-16 (sidan byggd 2026-08-16 genom att duplicera
  // motorhöljets sida i GemPages). Bevisar att platskartan gäller varje sida
  // som kopierats från mallen, och att checksumformeln håller på en andra export.
  const { sidor, manifest: m } = urGempages(readFileSync(new URL('../mall/exempel-axelbalte-2026-08-16.gempages', import.meta.url)));
  assert.equal(sidor.length, 1);
  const sida = sidor[0];
  assert.equal(sida.handle, 'axelbalte-trimmer-listicle');
  assert.equal(m.image_url_count, 2, 'exporten bär två mobilbilder i image_urls.txt');
  assert.equal(granskaChecksummor(sida).length, 0);
  assert.deepEqual(sida.pageSections.map((s) => s.cid).sort(), mall.pageSections.map((s) => s.cid).sort());
  const uids = (p) => new Set(p.pageSections.flatMap((s) => allaElementUids(JSON.parse(s.component))));
  const a = uids(sida); const b = uids(mall);
  assert.equal([...b].filter((u) => a.has(u)).length, b.size, 'alla element-uid ur mallen finns i axelbältessidan');
  const copy = copyUrMall(sida, platser);
  assert.equal(copy.punkter.length, 5);
  assert.match(copy.hero.rubrik, /^Vi beställde av misstag för många axelbälten/);
  assert.deepEqual(granskaCopy(copy, { pris: 599, jamforpris: 789 }, platser).fel, []);
});

function allaElementUids(o, acc = []) {
  if (Array.isArray(o)) { for (const x of o) allaElementUids(x, acc); return acc; }
  if (!o || typeof o !== 'object') return acc;
  if (o.uid) acc.push(o.uid);
  for (const v of Object.values(o)) if (v && typeof v === 'object') allaElementUids(v, acc);
  return acc;
}

test('bytIdn håller referenserna ihop', () => {
  const copy = copyUrMall(mall, platser);
  const { sida } = byggSida({ mall, platser, produkt: MOTOR, copy, nyaIdn: true });
  assert.notEqual(talText(sida.id), talText(mall.id));
  assert.match(talText(sida.id), /^\d{18}$/);
  for (const s of sida.pageSections) assert.equal(talText(s.themePageID), talText(sida.id));
  for (const m of sida.meta) assert.equal(talText(m.themePageID), talText(sida.id));
  const ids = new Set(sida.pageSections.map((s) => talText(s.id)));
  for (const p of sida.sectionPosition) assert.ok(ids.has(p), `sectionPosition ${p} pekar på en sektion`);
  assert.equal(granskaChecksummor(sida).length, 0, 'checksummorna räknas på det nya id:t');
  const igen = bytIdn(structuredClone(sida), { nytt: () => '__stort_tal__:111111111111111111' });
  assert.equal(talText(igen.id), '111111111111111111');
});
