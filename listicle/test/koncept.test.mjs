// Tester för konceptlagret: tre koncept på samma mall, 5 eller 7 punkter,
// författarraden per koncept, rubrikkontrollerna. Inga nätanrop.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  lasMall, copyUrMall, byggSida, granskaCopy, granskaChecksummor, lasAvSida, allaElement, talText,
  lasKoncept, kandaKoncept, valjPunkter, konceptText, konceptHandle, platserForPunkter, utokaPunkter, ikonSvg, nyUid, brandProfil, OBRANDAD, butiksOrd,
} from '../gempages.mjs';
import { renderaHtml, mallBilder } from '../html.mjs';

const { mall, platser } = lasMall();
const MOTOR = { url: '/products/marin-motorholje-420d-universellt-skydd', kortTitel: 'Motorhölje', slug: 'motorholje', pris: 299, jamforpris: 367, prisText: '299 kr', jamforprisText: '367 kr' };

function copyMedPunkter(n, { rubrik } = {}) {
  const copy = copyUrMall(mall, platser);
  copy.lyckas.stycken[1] = copy.lyckas.stycken[1].replace('Bäverbutikens marina motorhölje', 'Det marina motorhöljet');
  for (let i = 6; i <= n; i += 1) copy.punkter.push({ rubrik: `${i}. Skäl nummer ${i}`, text: `Ett stycke om skäl ${i}. `.repeat(12).trim(), knapp: `Knapp ${i} →` });
  if (rubrik) copy.hero.rubrik = rubrik;
  copy.tre_fragor = [{ rad: 'x', visualisera: '✅', falsifiera: '✅', ingen_annan_kan_saga: '✅' }];
  return copy;
}

test('tre koncept finns och läses med rätt fält', () => {
  assert.deepEqual(kandaKoncept(), ['anledningar', 'lagerrensning', 'vi-testade']);
  const l = lasKoncept();
  assert.equal(l.id, 'lagerrensning');
  assert.deepEqual(l.punkter, [5]);
  assert.equal(l.forfattare_obrandad, 'Anders på lagret');
  assert.ok(l.rubrik.pris && l.rubrik.jamforpris && l.jamforpris_behovs);
  const v = lasKoncept('vi-testade');
  assert.equal(v.forfattare_obrandad, 'Anders, som testade den själv');
  assert.ok(v.rubrik.period && !v.jamforpris_behovs);
  const a = lasKoncept('anledningar');
  assert.deepEqual(a.punkter, [5, 7]);
  assert.equal(konceptText(a.sidnamn, { produkt: MOTOR, n: 7 }), 'Motorhölje – 7 anledningar (listicle)');
  assert.equal(konceptHandle('anledningar', MOTOR, 7), 'motorholje-7-anledningar');
  assert.equal(konceptHandle('anledningar', MOTOR, 5), 'motorholje-5-anledningar');
  assert.equal(konceptHandle('vi-testade', MOTOR), 'motorholje-vi-testade');
  assert.equal(konceptHandle('lagerrensning', MOTOR), 'motorholje-lagerrensning');
  assert.throws(() => lasKoncept('finns-inte'), /Okänt koncept "finns-inte"/);
  assert.throws(() => lasKoncept('../brand/baverbutiken'), /Okänt koncept/);
  assert.equal(lasKoncept(lasKoncept('vi-testade')).id, 'vi-testade', 'ett objekt går igenom');
});

test('valjPunkter: konceptets första som standard, bara tillåtna antal', () => {
  assert.equal(valjPunkter('lagerrensning'), 5);
  assert.equal(valjPunkter('anledningar'), 5);
  assert.equal(valjPunkter('anledningar', 7), 7);
  assert.equal(valjPunkter('anledningar', '7'), 7);
  assert.throws(() => valjPunkter('lagerrensning', 7), /tillåter 5 punkter, inte "7"/);
  assert.throws(() => valjPunkter('anledningar', 6), /5 eller 7 punkter/);
});

test('platserForPunkter lägger till punkt6/7 med samma form som punkt4/5', () => {
  assert.equal(platserForPunkter(platser, 5), platser);
  const p7 = platserForPunkter(platser, 7);
  assert.equal(p7.text['punkt6.text'].form, 'p');
  assert.equal(p7.text['punkt7.knapp'].form, 'knapp');
  assert.equal(p7.text['punkt6.rubrik'].uid, '(klonas)');
  assert.deepEqual(p7.bilder_som_byts.slice(-2), ['punkt6', 'punkt7']);
  assert.equal(Object.keys(p7.text).length, Object.keys(platser.text).length + 6);
  assert.equal(Object.keys(platser.text).length, 27, 'mallen rördes inte');
});

test('byggSida med 7 punkter klonar punkt 4/5-sektionerna: nya id:n, nya uids, ikon 6/7, rätt ordning, rätt checksummor', () => {
  const copy = copyMedPunkter(7, { rubrik: '7 anledningar till att skaffa ett motorhölje för 299 kr' });
  const bilder = { punkt6: { src: 'https://cdn.shopify.com/x/6.png', width: 10, height: 10 }, punkt7: { src: 'https://cdn.shopify.com/x/7.png', width: 20, height: 20 } };
  const { sida, rapport } = byggSida({ mall, platser, produkt: MOTOR, copy, koncept: 'anledningar', punkter: 7, bilder, datum: '2026-09-16' });
  assert.equal(rapport.punkter, 7);
  assert.equal(sida.name, 'Motorhölje – 7 anledningar (listicle)');
  assert.equal(sida.handle, 'motorholje-7-anledningar');
  assert.equal(sida.pageSections.length, 12);
  assert.equal(sida.sectionPosition.length, 12);
  assert.equal(granskaChecksummor(sida).length, 0);
  assert.equal(mall.pageSections.length, 10, 'mallen rördes inte');
  const rader = lasAvSida(sida);
  const rubriker = rader.filter((r) => r.tag === 'Heading').map((r) => r.text);
  assert.ok(rubriker.some((r) => r.startsWith('6. Skäl nummer 6')) && rubriker.some((r) => r.startsWith('7. Skäl nummer 7')));
  assert.equal(rader.filter((r) => r.tag === 'Button').length, 10);
  assert.ok(rader.filter((r) => r.tag === 'Button').every((r) => r.link === MOTOR.url));
  assert.equal(rader.filter((r) => r.tag === 'Image' && r.src === 'https://cdn.shopify.com/x/6.png').length, 2, 'punkt 6 har desktop- + mobilbild');
  assert.equal(rader.filter((r) => r.tag === 'Image' && r.src === 'https://cdn.shopify.com/x/7.png').length, 2);
  // ordningen: … punkt5, punkt6, punkt7, slutblocket …
  const ordning = sida.sectionPosition.map((p) => sida.pageSections.find((s) => talText(s.id) === p).cid);
  const i5 = ordning.indexOf('gzr7fcjOKR');
  assert.equal(ordning[i5 + 3], 'gZwRqjNDfR', 'två klonade sektioner mellan punkt 5 och slutblocket');
  // klonerna: nya cid, nya sektions-id, inga av originalens uids kvar, rätt ikon
  const kloner = sida.pageSections.filter((s) => !mall.pageSections.some((m) => m.cid === s.cid));
  assert.equal(kloner.length, 2);
  const originalUids = new Set(['gpAnhUOKAB', 'gzr7fcjOKR'].flatMap((cid) => allaElement(JSON.parse(mall.pageSections.find((s) => s.cid === cid).component)).map((e) => e.uid)));
  for (const k of kloner) {
    assert.match(k.cid, /^g[A-Za-z0-9_-]{9}$/);
    assert.match(talText(k.id), /^\d{18}$/);
    assert.ok(!mall.pageSections.some((m) => talText(m.id) === talText(k.id)));
    for (const u of originalUids) assert.ok(!k.component.includes(`"${u}"`), `uid ${u} kvar i klonen ${k.cid}`);
    assert.equal(talText(k.themePageID), talText(sida.id));
  }
  assert.ok(kloner.some((k) => k.component.includes('number-circle-six-light')) && kloner.some((k) => k.component.includes('number-circle-seven-light')));
  // uids unika över hela sidan utom mallens egen dubblett (g8FQhJxsPM finns i två sektioner redan i exporten)
  const alla = sida.pageSections.flatMap((s) => allaElement(JSON.parse(s.component)).map((e) => e.uid));
  const dubbla = [...new Set(alla.filter((u, i) => alla.indexOf(u) !== i))];
  assert.deepEqual(dubbla, ['g8FQhJxsPM']);
});

test('utokaPunkter med injicerade id:n är deterministisk; 5 punkter rör ingenting', () => {
  const sida = structuredClone(mall);
  assert.equal(utokaPunkter(sida, platser, 5), platser);
  let i = 0;
  const p = utokaPunkter(sida, platser, 6, { nyUidFn: () => `gTEST${String(i++).padStart(5, '0')}`, nyttIdFn: () => '__stort_tal__:640000000000000001', nu: '2026-09-16T00:00:00.000Z' });
  assert.equal(sida.pageSections.length, 11);
  assert.match(p.text['punkt6.rubrik'].uid, /^gTEST/);
  assert.equal(p.text['punkt6.rubrik'].cid, sida.pageSections[10].cid);
  assert.equal(sida.pageSections[10].createdAt, '2026-09-16T00:00:00.000Z');
  assert.equal(p.knappar.length, platser.knappar.length + 1);
  assert.match(ikonSvg(7), /number-circle-seven-light/);
  assert.throws(() => ikonSvg(8), /Ingen ikon för punkt 8/);
  assert.match(nyUid(), /^g[A-Za-z0-9_-]{9}$/);
});

test('granskaCopy per koncept: antal punkter, rubrikkontroller, numrering', () => {
  const fem = copyMedPunkter(5);
  assert.deepEqual(granskaCopy(fem, MOTOR, platser).fel, []);
  assert.ok(granskaCopy(copyMedPunkter(7), MOTOR, platser).fel.some((f) => /exakt 5 \(\/lagerrensning\), är 7/.test(f)));
  const femSomSju = granskaCopy(fem, MOTOR, platser, { koncept: 'anledningar', punkter: 7 }).fel;
  assert.ok(femSomSju.some((f) => /exakt 7 \(\/anledningar, --punkter 5\|7\), är 5/.test(f)));
  assert.ok(femSomSju.some((f) => /punkt6\.rubrik: saknas/.test(f)) && femSomSju.some((f) => /punkt7\.knapp: saknas/.test(f)));
  const sju = copyMedPunkter(7, { rubrik: '7 anledningar till att skaffa ett motorhölje för 299 kr' });
  const g7 = granskaCopy(sju, MOTOR, platser, { koncept: 'anledningar', punkter: 7 });
  assert.deepEqual(g7.fel, []);
  assert.ok(!g7.varningar.some((v) => /antalet/.test(v)));
  const utanAntal = copyMedPunkter(7, { rubrik: 'Skaffa ett motorhölje för 299 kr' });
  assert.ok(granskaCopy(utanAntal, MOTOR, platser, { koncept: 'anledningar', punkter: 7 }).varningar.some((v) => /nämner inte antalet \(7\/sju\)/.test(v)));
  const sjuOrd = copyMedPunkter(7, { rubrik: 'Sju anledningar att skaffa ett motorhölje' });
  assert.ok(!granskaCopy(sjuOrd, MOTOR, platser, { koncept: 'anledningar', punkter: 7 }).varningar.some((v) => /antalet/.test(v)));
  // vi-testade: perioden ska stå i rubriken, priset behöver inte
  const test1 = copyMedPunkter(5, { rubrik: 'Vi testade motorhöljet en hel vinter' });
  const gv = granskaCopy(test1, MOTOR, platser, { koncept: 'vi-testade' });
  assert.deepEqual(gv.fel, []);
  assert.ok(!gv.varningar.some((v) => /nämner inte priset|jämförpriset|testperioden/.test(v)));
  const test2 = copyMedPunkter(5, { rubrik: 'Vi testade motorhöljet' });
  assert.ok(granskaCopy(test2, MOTOR, platser, { koncept: 'vi-testade' }).varningar.some((v) => /saknar testperioden/.test(v)));
  // lagerrensning: priset och jämförpriset i rubriken (varning)
  const utanPris = copyMedPunkter(5, { rubrik: 'Vi beställde in för många motorhöljen' });
  const gl = granskaCopy(utanPris, MOTOR, platser);
  assert.ok(gl.varningar.some((v) => /nämner inte priset 299 kr/.test(v)) && gl.varningar.some((v) => /jämförpriset 367 kr/.test(v)));
  // numreringen
  const onumrerad = copyMedPunkter(5);
  onumrerad.punkter[2].rubrik = 'Tredje utan siffra';
  assert.ok(granskaCopy(onumrerad, MOTOR, platser).varningar.some((v) => /punkt3\.rubrik börjar inte med "3\."/.test(v)));
  // vi-testade-författaren är obrandad-profilens
  assert.equal(brandProfil(null, { forfattareObrandad: 'Anders, som testade den själv' }).forfattare, 'Anders, som testade den själv');
  assert.equal(brandProfil('baverbutiken', { forfattareObrandad: 'X' }).forfattare, 'Anders från Bäverbutiken', 'brandad sida behåller brandets författare');
  assert.deepEqual(brandProfil(brandProfil(null, { forfattareObrandad: 'Y' })), { ...OBRANDAD, forfattare: 'Y' }, 'idempotent med egen författare');
});

test('granskaCopy stoppar källbutikens eget namn i en obrandad copy (OPS-butik utan brandprofil)', () => {
  // Porterat från sessionen som byggde takskyddets sida 2026-09-16.
  const CARA = { ...MOTOR, url: 'https://carashell.se/products/takskyddet', pris: 1129, jamforpris: 1469, prisText: '1 129 kr', jamforprisText: '1 469 kr' };
  const copy = copyMedPunkter(5);
  const byt = (s) => String(s).replace(/299 kr/g, '1 129 kr').replace(/367 kr/g, '1 469 kr');
  copy.hero.rubrik = 'Vi beställde in för många taköverdrag och nu får du ditt för 1 129 kr istället för 1 469 kr så länge lagret räcker';
  for (const p of copy.punkter) { p.text = byt(p.text); p.knapp = byt(p.knapp); }
  for (const k of ['hero', 'lyckas', 'riskfritt']) copy[k].knapp = byt(copy[k].knapp);
  copy.arlig.stycken = copy.arlig.stycken.map(byt);
  copy.hero.sammanfattning = copy.hero.sammanfattning.map(byt);
  assert.deepEqual(granskaCopy(copy, CARA, platser).fel, []);
  copy.lyckas.stycken[1] = 'Överdraget hittar du hos CaraShell, och det passar både husvagn och husbil med sina 6,5 × 3 m så att hela takytan täcks med marginal när vagnen står ute.';
  const fel = granskaCopy(copy, CARA, platser).fel;
  assert.equal(fel.length, 1, fel.join('\n'));
  assert.match(fel[0], /lyckas\.stycken: nämner "källbutiken carashell\.se" — sidan är obrandad/);
  copy.lyckas.stycken[1] = 'Överdraget hittar du på carashell.se, och det passar både husvagn och husbil med sina 6,5 × 3 m så att hela takytan täcks med marginal när vagnen står ute.';
  assert.match(granskaCopy(copy, CARA, platser).fel[0], /källbutiken carashell\.se/);
  // en uttrycklig lista stänger av källbutiksordet också; utan länk finns inget att stoppa
  assert.deepEqual(granskaCopy(copy, CARA, platser, { forbjudnaBrand: [] }).fel, []);
  assert.deepEqual(granskaCopy(copy, { ...CARA, url: undefined }, platser).fel, []);
});

test('butiksOrd läser värd och namn ur produktlänken', () => {
  assert.deepEqual(butiksOrd('https://carashell.se/products/takskyddet'), ['carashell.se', 'carashell']);
  assert.deepEqual(butiksOrd('https://www.baverbutiken.se/products/x?y=1'), ['baverbutiken.se', 'baverbutiken']);
  assert.deepEqual(butiksOrd('https://yitrbk-m3.myshopify.com/products/x'), ['yitrbk-m3.myshopify.com']);
  assert.deepEqual(butiksOrd('inte en länk'), []);
  assert.deepEqual(butiksOrd(null), []);
});

test('byggSida per koncept: författarraden och sidnamnet', () => {
  const copy = copyMedPunkter(5, { rubrik: 'Vi testade motorhöljet en hel vinter' });
  const { sida, rapport } = byggSida({ mall, platser, produkt: MOTOR, copy, koncept: 'vi-testade', datum: '2026-09-16' });
  assert.equal(sida.name, 'Motorhölje – Vi testade (listicle)');
  assert.equal(sida.handle, 'motorholje-vi-testade');
  assert.equal(rapport.koncept, 'vi-testade');
  assert.equal(rapport.brand.forfattare, 'Anders, som testade den själv');
  assert.ok(lasAvSida(sida).some((r) => r.tag === 'Text' && r.text === 'Av **Anders, som testade den själv.**'));
  const brandad = byggSida({ mall, platser, produkt: MOTOR, copy, koncept: 'vi-testade', brand: 'baverbutiken' });
  assert.equal(brandad.rapport.brand.forfattare, 'Anders från Bäverbutiken');
  assert.throws(() => byggSida({ mall, platser, produkt: MOTOR, copy, koncept: 'vi-testade', punkter: 7 }), /tillåter 5 punkter/);
});

test('renderaHtml: 7 punkter med ikon 6/7, stil "ingen" utan <style>, konceptets författare', () => {
  const copy = copyMedPunkter(7);
  const fasta = mallBilder(mall, platser);
  fasta.punkt6 = fasta.punkt4; fasta.punkt7 = fasta.punkt5;
  const html = renderaHtml({ copy, produkt: MOTOR, fasta, datum: '2026-09-16', koncept: 'anledningar', stil: 'ingen' });
  assert.equal((html.match(/<section class="lr-punkt/g) ?? []).length, 7);
  assert.equal((html.match(/<section class="lr-punkt lr-omvand"/g) ?? []).length, 3, 'punkt 2, 4 och 6 har bilden till höger');
  assert.equal((html.match(/class="lr-cta"/g) ?? []).length, 10);
  assert.ok(html.includes('id="lr-punkt-7"'));
  assert.ok(!html.includes('<style>') && !html.includes('fonts.googleapis'), 'stil "ingen" = bara fragmentet');
  assert.ok(html.startsWith('<!-- Listicle (anledningar)'));
  assert.ok(html.includes('<p>Av <strong>Anders på lagret.</strong></p>'));
  const test1 = renderaHtml({ copy: copyMedPunkter(5), produkt: MOTOR, fasta, datum: '2026-09-16', koncept: 'vi-testade' });
  assert.ok(test1.includes('<p>Av <strong>Anders, som testade den själv.</strong></p>') && test1.includes('<style>'));
  assert.throws(() => renderaHtml({ copy, produkt: MOTOR, fasta: mallBilder(mall, platser), datum: '2026-09-16', koncept: 'anledningar' }), /ingen bild för platsen "punkt6"/);
});
