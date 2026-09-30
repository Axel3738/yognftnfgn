// Tester för erbjudanden/ekonomi.mjs. Talen läses ur konfig.json och cogs.json
// vid körning — testerna räknar mot samma filer och mot linje() i
// matstrumpor/ekonomi.mjs, så de bevisar att motorn säger samma sak som ronden.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { linje, kostnadPerOrder } from '../../ekonomi.mjs';
import {
  kostnadsLage, orderEkonomi, scenarier, blandad, brytpunktAndel, rakna, tabell,
  enLadaUrKommentar, kursDatum, lasKonfig, lasCogs, SCENARIER, LAGEN,
} from '../ekonomi.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const CLI = join(ROT, '..', 'ekonomi.mjs');
const KONFIG = lasKonfig();
const COGS = lasCogs();
const r2 = (v) => Math.round(v * 100) / 100;

const konfigLage = () => kostnadsLage('konfig', { konfig: KONFIG, cogs: COGS });
const shopifyLage = () => kostnadsLage('shopify', { konfig: KONFIG, cogs: COGS });

test('baslinjen i konfig-läget på AOV 462,1 ger samma tb och break-even som kor.mjs --ekonomi (linje)', () => {
  const lage = konfigLage();
  const e = orderEkonomi({ lador: 2, prisTotalt: KONFIG.ekonomi.aov_sek, perLada: lage.perLada('sushi-5', 2), tullPerPaket: lage.tullPerPaket });
  const facit = linje(KONFIG.ekonomi.aov_sek, kostnadPerOrder(KONFIG.ekonomi), false);
  assert.equal(e.kostnad, kostnadPerOrder(KONFIG.ekonomi));
  assert.equal(e.tb, facit.tackningsbidrag);
  assert.equal(e.beRoas, facit.break_even_roas);
  assert.equal(e.beCpa, facit.break_even_cpa_sek);
  // De tal ronden visar 2026-09-21 — om konfigen ändras ändras de, och då ska testet ovan ändå hålla.
  assert.equal(e.tb, 308.48);
  assert.equal(e.beRoas, 1.498);
});

test('Shopify-läget på 2 lådor 399 kr: 399 − 2 × 80,23 − 2,9 × 11,275 = 205,84 kr', () => {
  const lage = shopifyLage();
  const e = orderEkonomi({ lador: 2, prisTotalt: 399, perLada: lage.perLada('sushi-5'), tullPerPaket: lage.tullPerPaket });
  const vantat = r2(399 - 2 * COGS.sverige.kostnad['sushi-5'] - KONFIG.ekonomi.tull_eur * KONFIG.ekonomi.eur_sek);
  assert.equal(e.tb, vantat);
  assert.equal(e.tb, 205.84);
  assert.equal(e.varukostnad, r2(2 * COGS.sverige.kostnad['sushi-5']));
  assert.equal(e.beRoas, Math.round((399 / 205.84) * 1000) / 1000);
  assert.equal(e.beCpa, e.tb);
});

test('tullen dras EN gång per paket — 4 lådor bär samma tull som 2', () => {
  const lage = shopifyLage();
  const tva = orderEkonomi({ lador: 2, prisTotalt: 399, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket });
  const fyra = orderEkonomi({ lador: 4, prisTotalt: 798, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket });
  assert.equal(fyra.tull, lage.tullPerPaket);
  assert.equal(fyra.tull, tva.tull);
  assert.equal(fyra.varukostnad, r2(4 * lage.perLada()));
  assert.equal(fyra.tb, r2(798 - 4 * lage.perLada() - lage.tullPerPaket));
});

test('kortavgift 2 % dras på det kunden betalar', () => {
  const lage = shopifyLage();
  const utan = orderEkonomi({ lador: 2, prisTotalt: 399, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket });
  const med = orderEkonomi({ lador: 2, prisTotalt: 399, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket, kortavgiftAndel: 0.02 });
  assert.equal(med.kortavgift, r2(0.02 * 399));
  assert.equal(med.kortavgift, 7.98);
  assert.equal(med.tb, r2(utan.tb - 7.98));
  // Med fraktintäkt dras avgiften på hela bruttot (pris + frakt).
  const medFrakt = orderEkonomi({ lador: 2, prisTotalt: 399, fraktIntakt: 29, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket, kortavgiftAndel: 0.02 });
  assert.equal(medFrakt.kortavgift, r2(0.02 * 428));
  assert.throws(() => orderEkonomi({ lador: 2, prisTotalt: 399, perLada: 80, tullPerPaket: 32, kortavgiftAndel: 2 }), /andel 0–1/);
});

test('moms-linjen drar momsen ur intäkten precis som linje() — break-even-ROAS mot bruttot', () => {
  const lage = shopifyLage();
  const e = orderEkonomi({ lador: 2, prisTotalt: 399, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket, moms: true });
  const facit = linje(399, e.kostnad, true);
  assert.equal(e.intakt, r2(399 / 1.25));
  assert.equal(e.intaktBrutto, 399);
  assert.equal(e.tb, facit.tackningsbidrag);
  assert.equal(e.beRoas, facit.break_even_roas);
  assert.equal(e.moms, true);
  const utan = orderEkonomi({ lador: 2, prisTotalt: 399, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket });
  assert.ok(e.beRoas > utan.beRoas, 'med moms är break-even klart högre');
});

test('fraktintäkt höjer tb med exakt beloppet när fraktkostnaden är 0, och fraktkostnad sänker det lika exakt', () => {
  const lage = konfigLage();
  const bas = orderEkonomi({ lador: 2, prisTotalt: 399, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket });
  const frakt = orderEkonomi({ lador: 2, prisTotalt: 399, fraktIntakt: 29, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket });
  assert.equal(frakt.tb, r2(bas.tb + 29));
  assert.equal(frakt.intaktBrutto, 428);
  assert.equal(frakt.beRoas, Math.round((428 / frakt.tb) * 1000) / 1000);
  const kostar = orderEkonomi({ lador: 2, prisTotalt: 399, fraktKostnad: 45, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket });
  assert.equal(kostar.tb, r2(bas.tb - 45));
  assert.equal(kostar.fraktKostnad, 45);
});

test('orderEkonomi är ren: samma indata ger samma svar, indata rörs inte, negativt tb ger varning utan break-even', () => {
  const in1 = { lador: 2, prisTotalt: 399, perLada: 80.23, tullPerPaket: 32.7 };
  const kopia = { ...in1 };
  assert.deepEqual(orderEkonomi(in1), orderEkonomi(in1));
  assert.deepEqual(in1, kopia);
  const back = orderEkonomi({ lador: 2, prisTotalt: 100, perLada: 80.23, tullPerPaket: 32.7 });
  assert.equal(back.beRoas, null);
  assert.equal(back.beCpa, null);
  assert.match(back.varning, /går inte att annonsera lönsamt/);
  assert.throws(() => orderEkonomi({ lador: 0, prisTotalt: 399, perLada: 80, tullPerPaket: 32 }), /lador/);
});

test('blandad(): andel 0 = baslinjen, 1 = upsellet, 0,5 = mitt emellan; tar också orderEkonomi-objekt', () => {
  assert.equal(blandad({ andelUpsell: 0, tbBas: 205.84, tbUpsell: 364.38 }), 205.84);
  assert.equal(blandad({ andelUpsell: 1, tbBas: 205.84, tbUpsell: 364.38 }), 364.38);
  assert.equal(blandad({ andelUpsell: 0.5, tbBas: 200, tbUpsell: 300 }), 250);
  const lage = shopifyLage();
  const bas = orderEkonomi({ lador: 2, prisTotalt: 399, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket });
  const upsell = orderEkonomi({ lador: 4, prisTotalt: 718, perLada: lage.perLada(), tullPerPaket: lage.tullPerPaket });
  assert.equal(blandad({ andelUpsell: 0.2, bas, upsell }), r2(bas.tb + 0.2 * (upsell.tb - bas.tb)));
  assert.throws(() => blandad({ andelUpsell: 1.5, tbBas: 1, tbUpsell: 2 }), /0–1/);
});

test('brytpunktAndel(): faktorn B:s take-rate måste vara gånger A:s', () => {
  assert.equal(brytpunktAndel(100, 200, 180), 1.25);     // A lyfter 100, B 80 ⇒ B behöver 25 % fler
  assert.equal(brytpunktAndel(100, 150, 200), 0.5);      // B lyfter dubbelt ⇒ halva take-raten räcker
  assert.equal(brytpunktAndel(100, 100, 150), 0);        // A lyfter inget ⇒ B alltid bättre
  assert.equal(brytpunktAndel(100, 150, 100), Infinity); // B lyfter inget ⇒ aldrig bättre
  assert.equal(brytpunktAndel(100, 100, 100), 1);
  // Vid exakt faktorn är de lika: andel_A × lyftA = andel_B × lyftB.
  const f = brytpunktAndel(205.84, 364.38, 324.38);
  assert.equal(r2(0.1 * f * (324.38 - 205.84)), r2(0.1 * (364.38 - 205.84)));
});

test('scenarier(): baslinjen först med diff 0, alla åtta rader, en tull på varje 4-lådorspaket', () => {
  const lage = shopifyLage();
  const rader = scenarier(lage);
  assert.equal(rader.length, SCENARIER.length);
  assert.equal(rader[0].baslinje, true);
  assert.equal(rader[0].namn, '2 lådor 399 kr (Köp 1 – få 1)');
  assert.deepEqual(rader[0].diff, { tb: 0, beCpa: 0, beRoas: 0 });
  assert.ok(rader.every((r) => !r.saknas), 'Shopify-läget har kostnad för båda varianterna');
  for (const r of rader.filter((x) => x.lador === 4)) assert.equal(r.ekonomi.tull, lage.tullPerPaket, r.namn);
  const k2f2 = rader.find((r) => r.kod === 'SUSHI-K2F2');
  assert.equal(k2f2.diff.tb, r2(k2f2.ekonomi.tb - rader[0].ekonomi.tb));
  // Post-purchase 319 = 4 lådor 718 kr; 279 = 678 kr — samma varukostnad och tull som Köp 2 – få 2.
  const pp319 = rader.find((r) => r.upsell === 'pp319');
  assert.equal(pp319.ekonomi.intaktBrutto, 718);
  assert.equal(pp319.ekonomi.kostnad, k2f2.ekonomi.kostnad);
  assert.equal(rader.find((r) => r.upsell === 'pp279').ekonomi.intaktBrutto, 678);
  // En rad till i listan är en rad till i svaret — utan kod.
  const extra = scenarier(lage, { lista: [...SCENARIER, { namn: '3 lådor 549 kr', lador: 3, prisTotalt: 549, variant: 'sushi-5' }] });
  assert.equal(extra.at(-1).namn, '3 lådor 549 kr');
  assert.equal(extra.at(-1).ekonomi.varukostnad, r2(3 * lage.perLada()));
  assert.throws(() => scenarier(lage, { lista: [{ namn: 'x', lador: 1, prisTotalt: 1 }] }), /baslinje/);
});

test('konfig-läget: per låda = kostnad_per_order_sek ÷ 2, 1 låda ur kommentaren, 3-packen saknas med orsak', () => {
  const lage = konfigLage();
  assert.equal(lage.perLada('sushi-5', 2), r2(KONFIG.ekonomi.kostnad_per_order_sek / 2));
  assert.equal(lage.perLada('sushi-5', 4), r2(KONFIG.ekonomi.kostnad_per_order_sek / 2));
  const enLada = enLadaUrKommentar(KONFIG.ekonomi.kostnad_comment);
  assert.equal(enLada, 80.61, 'kommentaren i konfig.json bär talet för 1 låda');
  assert.equal(lage.perLada('sushi-5', 1), enLada);
  assert.equal(enLadaUrKommentar('ingen siffra här'), null);
  assert.equal(enLadaUrKommentar('55,5 kr för 1 låda'), 55.5);
  const tre = lage.lada('sushi-3', 2);
  assert.match(tre.saknas, /skiljer inte sushi-3/);
  assert.throws(() => lage.perLada('sushi-3'), /Kostnad saknas i läget konfig/);
  const rader = scenarier(lage);
  const trePack = rader.find((r) => r.variant === 'sushi-3');
  assert.ok(trePack.saknas);
  assert.equal(trePack.diff, null);
  assert.equal(rader.find((r) => r.lador === 1).ekonomi.varukostnad, enLada);
  assert.match(lage.kalla, /kostnad_per_order_sek/);
});

test('Shopify-läget: per låda ur cogs.json, en produkt utan Cost per item saknas med Shopifys orsak — aldrig noll', () => {
  const lage = shopifyLage();
  assert.equal(lage.perLada('sushi-5'), COGS.sverige.kostnad['sushi-5']);
  assert.equal(lage.perLada('sushi-3'), COGS.sverige.kostnad['sushi-3']);
  assert.equal(COGS.sverige.kostnad.donut, null, 'facit: donut saknar Cost per item i cogs.json 2026-09-27');
  assert.match(lage.lada('donut').saknas, /Cost per item/);
  assert.throws(() => lage.perLada('donut'), /Kostnad saknas i läget shopify/);
  assert.match(lage.lada('finns-inte').saknas, /finns inte i cogs.json/);
  assert.throws(() => kostnadsLage('gissning', { konfig: KONFIG, cogs: COGS }), /Okänt kostnadsläge/);
  assert.deepEqual(LAGEN, ['konfig', 'shopify']);
});

test('kursen: konfigens eur_sek med ECB-datum som standard, --eur-sek överstyr och tappar datumet', () => {
  const standard = shopifyLage();
  assert.equal(standard.kurs.eur_sek, KONFIG.ekonomi.eur_sek);
  assert.equal(standard.kurs.datum, kursDatum(KONFIG));
  assert.equal(standard.kurs.datum, '2026-09-21');
  assert.equal(standard.tullPerPaket, r2(KONFIG.ekonomi.tull_eur * KONFIG.ekonomi.eur_sek));
  const egen = kostnadsLage('shopify', { konfig: KONFIG, cogs: COGS, eurSek: 11.3 });
  assert.equal(egen.tullPerPaket, r2(2.9 * 11.3));
  assert.equal(egen.tullPerPaket, 32.77);
  assert.equal(egen.kurs.datum, null);
  assert.match(egen.kurs.kalla, /kommandoraden/);
  assert.throws(() => kostnadsLage('shopify', { konfig: KONFIG, cogs: COGS, eurSek: 'abc' }), /inget tal/);
  assert.throws(() => kostnadsLage('konfig', { konfig: { ekonomi: { kostnad_per_order_sek: 120.92, tull_eur: 2.9 } }, cogs: COGS }), /eur_sek saknas/);
});

test('rakna() med båda lägena säger att avläsningarna skiljer sig och att det är Axels fråga', () => {
  const r = rakna({ konfig: KONFIG, cogs: COGS });
  assert.equal(r.lagen.length, 2);
  assert.match(r.varning, /skiljer sig/);
  assert.match(r.varning, /Axels fråga/);
  assert.equal(r.parametrar.kortavgift, 'inte mätt, 0 %');
  assert.equal(r.parametrar.frakt, 'inte mätt, 0 kr');
  assert.equal(r.lagen[0].brytpunkt.faktor, brytpunktAndel(r.lagen[0].scenarier[0].ekonomi.tb, r.lagen[0].scenarier.find((s) => s.upsell === 'pp319').ekonomi.tb, r.lagen[0].scenarier.find((s) => s.upsell === 'pp279').ekonomi.tb));
  const ett = rakna({ kostnad: 'shopify', kortavgiftAndel: 0.02, konfig: KONFIG, cogs: COGS });
  assert.equal(ett.lagen.length, 1);
  assert.equal(ett.varning, null);
  assert.equal(ett.parametrar.kortavgift, '2 % av det kunden betalar');
  const text = tabell(r);
  assert.match(text, /kortavgift: inte mätt, 0 %/i);
  assert.match(text, /\[baslinje\]/);
  assert.match(text, /ECB 2026-09-21/);
});

test('CLI:n kör utan fel: --json ger båda lägena, fel --kostnad ger exit 1', () => {
  const ut = spawnSync(process.execPath, [CLI, '--json'], { encoding: 'utf8' });
  assert.equal(ut.status, 0, ut.stderr);
  const j = JSON.parse(ut.stdout);
  assert.deepEqual(j.lagen.map((l) => l.namn), ['konfig', 'shopify']);
  assert.ok(j.varning);
  assert.equal(j.lagen[1].scenarier[0].ekonomi.tb, 205.84);
  assert.equal(j.lagen[0].scenarier[0].baslinje, true);
  assert.equal(j.lagen[0].kurs.datum, '2026-09-21');
  const kort = spawnSync(process.execPath, [CLI, '--kostnad', 'shopify', '--kortavgift', '0.02', '--json'], { encoding: 'utf8' });
  assert.equal(kort.status, 0, kort.stderr);
  const k = JSON.parse(kort.stdout);
  assert.equal(k.lagen.length, 1);
  assert.equal(k.lagen[0].scenarier[0].ekonomi.kortavgift, 7.98);
  const text = spawnSync(process.execPath, [CLI], { encoding: 'utf8' });
  assert.equal(text.status, 0, text.stderr);
  assert.match(text.stdout, /Axels fråga/);
  const fel = spawnSync(process.execPath, [CLI, '--kostnad', 'gissning'], { encoding: 'utf8' });
  assert.equal(fel.status, 1);
  assert.match(fel.stderr, /--kostnad/);
});
