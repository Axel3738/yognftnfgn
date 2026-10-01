import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, relative } from 'node:path';
import {
  UTMAPP, LAGEFIL, normaliseraTelefon, visaTelefon, koptillfallen, bygg, fragorFor, tillMarkdown, tillHtml, tidMellan, svDatum, dagSE, slumpa, komVia, leveranserUr, FRAGA,
} from '../ringlista.mjs';
import { naddaUrAnteckningar, valjMottagare, LOGG, BELOPP_TAK } from '../presentkort.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NU = new Date('2026-10-01T12:00:00Z');

// En order som Shopify ger den, med bara det ringlistan läser.
function order({ nr, kund, tid, rader, kalla = 'web', tel = null, epost = null, avbruten = false, belopp = 399, antalOrdrar = null }) {
  return {
    id: `gid://shopify/Order/${nr}`,
    name: `#${nr}`,
    createdAt: tid,
    cancelledAt: avbruten ? tid : null,
    sourceName: kalla,
    discountCodes: [],
    totalPriceSet: { shopMoney: { amount: String(belopp) } },
    customer: { id: `gid://shopify/Customer/${kund}`, displayName: `Kund ${kund}`, firstName: 'Kund', lastName: String(kund), email: epost ?? `Kund${kund}@Example.com`, phone: tel, numberOfOrders: antalOrdrar, defaultPhoneNumber: null, defaultAddress: { phone: null, city: 'Umeå' } },
    shippingAddress: { phone: null, city: 'Umeå', firstName: 'Kund', lastName: String(kund) },
    billingAddress: { phone: null },
    lineItems: { nodes: rader.map(([title, quantity, variant]) => ({ title, quantity, variant: { title: variant ?? 'Default Title' } })) },
  };
}
const sushi = (n = 2) => ['Sushi-Strumpor', n, '5 - Par / One Size'];
const donut = ['Donut-strumpor', 1];
const pinnar = ['Äkta ätpinnar i trä', 2];

const FIXTUR = [
  // 1: riktig återköpare, sushi två gånger med tre veckor emellan, telefon i svenskt format.
  //    Presentkortet följer med "Köp 2 – få 2"-paketet och är ingen sort kunden valt.
  order({ nr: 1001, kund: 1, tid: '2025-12-02T18:43:00Z', rader: [sushi(), pinnar, ['Presentkort', 1]], tel: '070-123 45 67' }),
  order({ nr: 1050, kund: 1, tid: '2025-12-23T10:00:00Z', rader: [sushi(1)], belopp: 299 }),
  // 2: webborder + donut som draft fem minuter senare = tillägget på tacksidan — INTE återköp
  order({ nr: 1356, kund: 2, tid: '2025-12-02T18:43:00Z', rader: [sushi()] }),
  order({ nr: 1358, kund: 2, tid: '2025-12-02T18:48:00Z', rader: [donut], kalla: 'shopify_draft_order', belopp: 299 }),
  // 3: två identiska webbordrar samma minut — INTE återköp, men flaggas
  order({ nr: 4700, kund: 3, tid: '2026-09-10T16:09:00Z', rader: [pinnar, sushi(1), sushi(1)], tel: '+46701234568' }),
  order({ nr: 4701, kund: 3, tid: '2026-09-10T16:09:30Z', rader: [pinnar, sushi(1), sushi(1)], tel: '+46701234568' }),
  // 4: en enda order, gammal — inte med
  order({ nr: 2000, kund: 4, tid: '2026-01-05T08:00:00Z', rader: [sushi()] }),
  // 5: två Skrubbmattan-ordrar från Fixkliniken-tiden — inte Matstrumpor
  order({ nr: 1111, kund: 5, tid: '2025-08-20T20:04:00Z', rader: [['Skrubbmattan', 1]], belopp: 149 }),
  order({ nr: 1112, kund: 5, tid: '2025-08-20T20:07:00Z', rader: [['Skrubbmattan', 1]], belopp: 149 }),
  // 6: tre datum, bytte till pizza sista gången, ingen telefon
  order({ nr: 3001, kund: 6, tid: '2025-12-10T09:00:00Z', rader: [sushi()] }),
  order({ nr: 3100, kund: 6, tid: '2026-01-15T09:00:00Z', rader: [sushi()] }),
  order({ nr: 3200, kund: 6, tid: '2026-03-01T09:00:00Z', rader: [['Pizza-Strumpor', 1]], belopp: 449 }),
  // 7: annullerad andra order — räknas som en enda
  order({ nr: 5001, kund: 7, tid: '2026-02-01T09:00:00Z', rader: [sushi()] }),
  order({ nr: 5002, kund: 7, tid: '2026-02-20T09:00:00Z', rader: [sushi()], avbruten: true }),
  // 8: två ordrar 01:30 och 02:30 svensk tid den 3 dec — samma datum ⇒ ett tillfälle
  order({ nr: 6001, kund: 8, tid: '2025-12-02T23:30:00Z', rader: [sushi()] }),
  order({ nr: 6002, kund: 8, tid: '2025-12-03T00:30:00Z', rader: [sushi(1)], belopp: 299 }),
  // 9: återköpare med telefon vars SENASTE order är på väg (registrerad, inte levererad) ⇒ reserv
  order({ nr: 7101, kund: 9, tid: '2026-08-10T09:00:00Z', rader: [sushi()], tel: '0709999999' }),
  order({ nr: 7102, kund: 9, tid: '2026-09-25T09:00:00Z', rader: [sushi()], tel: '0709999999' }),
  // 10: återköpare med telefon, två datum, allt gammalt och framme ⇒ huvudlistan
  order({ nr: 7201, kund: 10, tid: '2026-01-10T09:00:00Z', rader: [sushi()], tel: '0701010101' }),
  order({ nr: 7202, kund: 10, tid: '2026-02-10T09:00:00Z', rader: [sushi()], tel: '0701010101' }),
  // nya kunder: 11–13 levererade med telefon, 14 levererad utan telefon, 15 på väg med telefon, 16 levererad för länge sedan, 17 inte förstagångs
  order({ nr: 7001, kund: 11, tid: '2026-09-15T10:00:00Z', rader: [sushi()], tel: '0701111111', antalOrdrar: 1 }),
  order({ nr: 7002, kund: 12, tid: '2026-09-16T10:00:00Z', rader: [sushi()], tel: '0702222222', antalOrdrar: 1 }),
  order({ nr: 7003, kund: 13, tid: '2026-09-17T10:00:00Z', rader: [sushi(1)], tel: '0703333333', antalOrdrar: 1, belopp: 299 }),
  order({ nr: 7004, kund: 14, tid: '2026-09-17T11:00:00Z', rader: [donut], antalOrdrar: 1, belopp: 299 }),
  order({ nr: 7005, kund: 15, tid: '2026-09-28T12:00:00Z', rader: [sushi()], tel: '0705555555', antalOrdrar: 1 }),
  order({ nr: 7006, kund: 16, tid: '2026-08-20T12:00:00Z', rader: [sushi()], tel: '0706666666', antalOrdrar: 1 }),
  order({ nr: 7007, kund: 17, tid: '2026-09-17T13:00:00Z', rader: [sushi()], tel: '0707777777', antalOrdrar: 3 }),
];

const LAGE = { paket: {
  YT1: { order: '#7102', status: 'IN_TRANSIT', senast: '2026-10-01T10:00' },
  YT2: { order: '#7001', status: 'DELIVERED', levererad: '2026-09-26', senast: '2026-09-26T10:00' },
  YT3: { order: '#7002', status: 'DELIVERED', levererad: '2026-09-27', senast: '2026-09-27T10:00' },
  YT4: { order: '#7003', status: 'DELIVERED', levererad: '2026-09-28', senast: '2026-09-28T10:00' },
  YT4b: { order: '#7003', status: 'IN_TRANSIT', senast: '2026-09-29T10:00' },
  YT5: { order: '#7004', status: 'DELIVERED', levererad: '2026-09-28', senast: '2026-09-28T10:00' },
  YT6: { order: '#7005', status: 'IN_TRANSIT', senast: '2026-10-01T10:00' },
  YT7: { order: '#7006', status: 'DELIVERED', levererad: '2026-09-01', senast: '2026-09-01T10:00' },
  YT8: { order: '#7007', status: 'DELIVERED', levererad: '2026-09-28', senast: '2026-09-28T10:00' },
} };
const LEVERANSER = leveranserUr(LAGE);

const RESOR = new Map([
  ['7001', { lastVisit: { source: 'Facebook', referrerUrl: 'http://m.facebook.com/', landingPage: 'https://matstrumpor.se/products/sushi-strumpor', utmParameters: { source: 'facebook', medium: 'paid', campaign: '120251217860260023', content: '120251591832350023', term: '1' } } }],
  ['7002', { lastVisit: { source: 'Facebook', referrerUrl: 'http://m.facebook.com/', landingPage: 'https://matstrumpor.se/products/sushi-strumpor', utmParameters: { source: 'facebook', medium: 'paid', campaign: null, content: 'Facebook_UA', term: null } } }],
  ['7003', { lastVisit: { source: 'direct', referrerUrl: '', landingPage: 'https://matstrumpor.se/', utmParameters: null } }],
]);
const ANNONSNAMN = new Map([['120251591832350023', '09-17 Nathalie captions musik']]);
const ALLT = { nu: NU, resor: RESOR, annonsnamn: ANNONSNAMN, leveranser: LEVERANSER };

test('utdatan skrivs bara i matstrumpor/output, som är gitignorerad — kunduppgifter får aldrig in i repot', () => {
  assert.equal(relative(ROT, UTMAPP).replace(/\\/g, '/'), 'output/ringlista');
  assert.equal(relative(ROT, LOGG).replace(/\\/g, '/'), 'output/ringlista/presentkort-logg.jsonl');
  const ignore = readFileSync(join(ROT, '.gitignore'), 'utf8').split('\n').map((r) => r.trim());
  assert.ok(ignore.includes('output/'), 'matstrumpor/.gitignore ska bära raden output/');
  assert.match(LAGEFIL.replace(/\\/g, '/'), /sparning\/butiker\/matstrumpor\/lage\.json$/, 'levererat läses ur spårningsrutinens fil');
});

test('telefonnummer normaliseras till +46 och visas som 070-123 45 67; skräp blir null', () => {
  assert.equal(normaliseraTelefon('070-123 45 67'), '+46701234567');
  assert.equal(normaliseraTelefon('+46 70 123 45 67'), '+46701234567');
  assert.equal(normaliseraTelefon('0046701234567'), '+46701234567');
  assert.equal(normaliseraTelefon('46701234567'), '+46701234567');
  assert.equal(normaliseraTelefon('+4791234567'), '+4791234567', 'norskt nummer lämnas som det är');
  assert.equal(normaliseraTelefon(''), null);
  assert.equal(normaliseraTelefon('ring mig'), null);
  assert.equal(visaTelefon('+46701234567'), '070-123 45 67');
  assert.equal(visaTelefon('+4791234567'), '+4791234567');
});

test('köptillfällen går på kalenderdatum i svensk tid: samma dag är ett tillfälle, nästa dag är två', () => {
  const a = order({ nr: 1, kund: 9, tid: '2026-01-01T10:00:00Z', rader: [sushi()] });
  const b = order({ nr: 2, kund: 9, tid: '2026-01-01T20:00:00Z', rader: [donut] });
  const c = order({ nr: 3, kund: 9, tid: '2026-01-02T06:00:00Z', rader: [sushi()] });
  assert.equal(koptillfallen([a, b]).length, 1, 'tio timmar isär men samma datum');
  assert.equal(koptillfallen([a, b, c]).length, 2);
  assert.equal(dagSE('2025-12-02T23:30:00Z'), '2025-12-03', 'UTC-kvällen är nästa svenska dygn');
});

test('tid mellan köpen skrivs i ord; svDatum tar både ISO och YYYY-MM-DD', () => {
  assert.equal(tidMellan('2026-01-01T10:00:00Z', '2026-01-01T10:40:00Z'), '40 minuter');
  assert.equal(tidMellan('2026-01-01T10:00:00Z', '2026-01-04T10:00:00Z'), '3 dagar');
  assert.equal(tidMellan('2026-01-01T10:00:00Z', '2026-01-01T11:10:00Z'), '1 timme', 'singular');
  assert.equal(tidMellan('2025-12-02T18:43:00Z', '2025-12-23T10:00:00Z'), '3 veckor');
  assert.equal(tidMellan('2025-12-10T09:00:00Z', '2026-03-01T09:00:00Z'), '3 månader');
  assert.equal(svDatum('2025-12-02T23:30:00Z'), '3 dec 2025', 'svensk tid, inte UTC');
  assert.equal(svDatum('2026-09-28'), '28 sep 2026');
});

test('leveranserUr: ordernummer → status; DELIVERED vinner över ett senare paket på väg', () => {
  assert.equal(LEVERANSER.get('#7003').status, 'DELIVERED');
  assert.equal(LEVERANSER.get('#7003').levererad, '2026-09-28');
  assert.equal(LEVERANSER.get('#7102').status, 'IN_TRANSIT');
  assert.equal(LEVERANSER.get('#9999'), undefined);
  assert.equal(leveranserUr({}).size, 0);
});

test('bygg: återköpare = 2+ datum; tillägg, dubbel samma dag, annullerat och Fixkliniken räknas bort', () => {
  const l = bygg(FIXTUR, ALLT);
  assert.equal(l.stat.annullerade, 1);
  assert.equal(l.stat.ejMatstrumpor, 2, 'de två Skrubbmattan-ordrarna');
  assert.equal(l.stat.medFlerOrdrar, 7, 'kund 1, 2, 3, 6, 8, 9, 10; 7:s andra är annullerad');
  assert.equal(l.stat.tillagg, 1, 'kund 2');
  assert.equal(l.stat.dubbel, 2, 'kund 3 (samma minut) och kund 8 (samma svenska dygn)');
  assert.deepEqual(l.identiska, [['#4700', '#4701']], 'bara kund 3:s två ordrar är identiska');
  assert.equal(l.stat.aterkopare, 4, 'kund 1, 6, 9, 10');
});

test('bygg: huvudlistan = återköpare med telefon och framme paket, högst maxAterkop; resten reserv; utan telefon sist', () => {
  const l = bygg(FIXTUR, ALLT);
  assert.deepEqual(l.aterkopare.map((k) => k.namn), ['Kund 10', 'Kund 1', 'Kund 9', 'Kund 6'], 'telefon + framme först (kund 10 har högre summa än kund 1), sedan paket på väg, sedan utan telefon');
  assert.deepEqual(l.aterkopare.filter((k) => k.iHuvudlistan).map((k) => k.namn), ['Kund 10', 'Kund 1']);
  assert.deepEqual(l.reserv.map((k) => [k.namn, k.vantarPaket]), [['Kund 9', true]], 'kund 9:s senaste order är på väg');
  assert.equal(l.medTelefon, 3);
  assert.equal(l.utanTelefon, 1);
  const kort = bygg(FIXTUR, { ...ALLT, maxAterkop: 1 });
  assert.deepEqual(kort.aterkopare.filter((k) => k.iHuvudlistan).map((k) => k.namn), ['Kund 10']);
  assert.deepEqual(kort.reserv.map((k) => k.namn), ['Kund 1', 'Kund 9'], 'den som inte fick plats hamnar i reserven');
  const k1 = l.aterkopare.find((k) => k.namn === 'Kund 1');
  assert.equal(k1.mellanrum[0], '3 veckor');
  assert.equal(k1.bytteProdukt, false, 'presentkortet i paketet är ingen sort');
  assert.equal(l.aterkopare.at(-1).bytteProdukt, true, 'kund 6 bytte till pizza');
});

test('bygg: e-postlistan bär alla återköpare en gång, gemener, även de utan telefon och i reserven', () => {
  const l = bygg(FIXTUR, ALLT);
  assert.deepEqual(l.epost, ['kund10@example.com', 'kund1@example.com', 'kund6@example.com', 'kund9@example.com']);
});

test('bygg: nya kunder = förstagångsköpare med telefon vars paket LEVERERATS de senaste 14 dagarna, lottade, med annonsen', () => {
  const l = bygg(FIXTUR, { ...ALLT, urval: 2 });
  assert.equal(l.nyaStat.levererade, 4, 'kund 11, 12, 13, 14; 15 är på väg, 16 levererades för länge sedan, 17 har tre ordrar');
  assert.equal(l.nyaStat.medTelefon, 3, 'kund 14 saknar telefon');
  assert.equal(l.nya.length, 2, 'urvalet');
  for (const k of l.nya) {
    assert.equal(k.grupp, 'ny');
    assert.ok(k.telefon);
    assert.equal(k.ordrar[0].paketStatus, 'DELIVERED');
    assert.deepEqual(k.fragor, [FRAGA.annonsen, FRAGA.vemTill, FRAGA.nastanInte]);
  }
  const igen = bygg(FIXTUR, { ...ALLT, urval: 2 });
  assert.deepEqual(igen.nya.map((k) => k.id), l.nya.map((k) => k.id), 'samma dag ⇒ samma lottning');
  const alla = bygg(FIXTUR, { ...ALLT, urval: 10 });
  assert.deepEqual(alla.nya.map((k) => k.namn), ['Kund 13', 'Kund 12', 'Kund 11'], 'senast levererad först');
  const per = Object.fromEntries(alla.nya.map((k) => [k.namn, k]));
  assert.equal(per['Kund 11'].komVia, 'Facebook-annons: 09-17 Nathalie captions musik');
  assert.equal(per['Kund 12'].komVia, 'Facebook/Instagram (Facebook_UA)');
  assert.equal(per['Kund 13'].komVia, 'direct, landade på /');
  assert.equal(per['Kund 11'].ordrar[0].levererad, '2026-09-26');
  const utanLage = bygg(FIXTUR, { nu: NU });
  assert.equal(utanLage.nya.length, 0, 'utan spårningsfil räknas ingen som levererad');
});

test('slumpa är deterministisk per frö och blandar', () => {
  const a = slumpa([1, 2, 3, 4, 5, 6, 7, 8], '2026-10-01');
  assert.deepEqual(slumpa([1, 2, 3, 4, 5, 6, 7, 8], '2026-10-01'), a);
  assert.notDeepEqual(slumpa([1, 2, 3, 4, 5, 6, 7, 8], '2026-10-02'), a);
  assert.deepEqual([...a].sort((x, y) => x - y), [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('komVia: annons-id utan namn visas som id, aldrig som tomt', () => {
  assert.match(komVia(RESOR.get('7001')), /annons 120251591832350023 \(namnet gick inte att läsa\)/);
  assert.equal(komVia(null), 'okänt (ingen besöksdata)');
});

test('frågorna till återköparna: högst tre, den mest specifika först, alltid "vem fick dem" och "nästan inte köpa"', () => {
  const l = bygg(FIXTUR, ALLT);
  const per = Object.fromEntries(l.aterkopare.map((k) => [k.namn, k]));
  for (const k of l.aterkopare) {
    assert.ok(k.fragor.length >= 1 && k.fragor.length <= 3, `${k.namn}: ${k.fragor.length} frågor`);
    assert.ok(k.fragor.includes(FRAGA.vemFick));
    assert.ok(k.fragor.includes(FRAGA.nastanInte));
  }
  assert.match(per['Kund 1'].fragor[0], /Du beställde sushistrumporna i dec 2025 och igen 3 veckor senare/);
  assert.match(per['Kund 6'].fragor[0], /beställt 3 gånger/);
  const bytt = fragorFor({ ...per['Kund 6'], antalTillfallen: 2, bytteProdukt: true, tillfallen: per['Kund 6'].tillfallen.slice(0, 1).concat(per['Kund 6'].tillfallen.slice(2)), mellanrum: ['3 månader'] });
  assert.match(bytt[0], /Första gången tog du sushistrumporna, andra gången pizzastrumporna/);
});

test('markdown och html: huvudlistan, nya, reserven och utan-telefon i den ordningen; anteckningsfält bara på samtalen', () => {
  const l = bygg(FIXTUR, { ...ALLT, urval: 10 });
  const md = tillMarkdown(l);
  assert.match(md, /\*\*5 samtal:\*\* 2 återköpare och 3 nya kunder/);
  assert.match(md, /070-123 45 67/);
  assert.match(md, /Reserv — återköpare med telefon som inte fick plats \(1\)/);
  assert.match(md, /Kund 9 \| 070-999 99 99 \| 2 datum, 2 ordrar \| paketet inte framme än/);
  assert.match(md, /Återköpare som inte går att ringa — inget telefonnummer i Shopify \(1\)/);
  assert.match(md, /aterkopare-epost\.txt/);
  assert.match(md, /⚠️ Två identiska ordrar samma dag[^\n]*#4700\/#4701/);
  assert.match(md, /levererat 26 sep 2026 · kom via: Facebook-annons: 09-17 Nathalie captions musik/);
  assert.doesNotMatch(md, /Kund 2|Kund 3|Kund 5|Kund 15/, 'tillägg, dubbel, Fixkliniken och paket på väg står inte i listan');
  assert.ok(md.indexOf('Kund 10') < md.indexOf('Kund 13') && md.indexOf('Kund 13') < md.indexOf('Kund 9 '), 'återköpare, nya, reserv');
  const html = tillHtml(l);
  assert.match(html, /href="tel:\+46701234567"/);
  assert.equal((html.match(/<textarea/g) || []).length, 2 + 3, 'ett fält per samtal: 2 återköpare + 3 nya, inget för reserven');
  assert.match(html, /Kopiera anteckningar/);
  assert.doesNotMatch(html, /<script src=/, 'sidan är självbärande');
});

test('presentkort: nådda läses ur sidans export, loggen stoppar dubbletter, standard är ALLA återköpare (även reserv och utan telefon)', () => {
  const l = bygg(FIXTUR, ALLT);
  const alla = valjMottagare(l);
  assert.deepEqual(alla.mottagare.map((k) => k.namn), ['Kund 10', 'Kund 1', 'Kund 9', 'Kund 6']);
  const md = ['# Anteckningar', '', '## Kund 1 (#1001, #1050) — ATERKOP — Nådd', '', 'gav bort till mamma', '', '## Kund 10 (#7201, #7202) — ATERKOP — Inget svar', '', '(inga anteckningar)', '', '## Kund 11 (#7001) — NY — Nådd', ''].join('\n');
  const nadda = naddaUrAnteckningar(md);
  assert.equal(nadda.length, 3);
  const bara = valjMottagare(l, { nadda });
  assert.deepEqual(bara.mottagare.map((k) => k.namn), ['Kund 1'], 'bara den nådda återköparen — nya kunder får inget kort');
  assert.equal(bara.hoppade[0].skal, 'inte nådd enligt anteckningarna');
  const igen = valjMottagare(l, { redan: new Set(['1']) });
  assert.deepEqual(igen.mottagare.map((k) => k.namn), ['Kund 10', 'Kund 9', 'Kund 6']);
  assert.ok(BELOPP_TAK <= 300, 'taket ligger vid marginalen på en standardorder');
});
