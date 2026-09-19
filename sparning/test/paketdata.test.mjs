// Tester för sparning/paketdata.mjs. Inget nät, ingen klocka — `nu` skickas
// alltid in.
//
// Fixturerna nedan är RIKTIGA svar från 17TRACK, hämtade 2026-09-19 för tre
// av butikens paket (två YunExpress, ett 4PX) och inklistrade här i den form
// `sparning/17track.mjs` hamta() lämnar dem. De är oförändrade så när som på
// att `track_info.tracking.providers[0].events` bara bär de fält den här
// modulen läser. Syntetiska fixturer (taket, fönstret) är märkta som sådana.
//
// Kontraktsbeviset: allt som byggData() skriver packas upp igen med
// packaUppEtt() ur sparning/uppacka.mjs, och jämförs mot det som gick in.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { handelserUr, byggData, filtreraFonster, FONSTER_DAGAR, MAX_HANDELSER } from '../paketdata.mjs';
import { packaUpp, packaUppEtt, nyckel, isoTillMinut, minutTillIso, FORMAT, STATUSAR } from '../uppacka.mjs';

// --- Ordboken testerna skickar in ------------------------------------------
// Så lite som möjligt av det riktiga språklagret: bara de fraser fixturerna
// använder. Poängen är att paketdata.mjs inte ska KÄNNA ordboken.
const ORDBOK = {
  'THE SHIPMENT ITEM IS UNDER TRANSPORTATION.': 'Paketet är på väg',
  'THE SHIPMENT ITEM HAS ARRIVED AT THE COUNTRY OF DESTINATION.': 'Paketet har kommit fram till Sverige',
  'Parcel outbound from transit center': 'Paketet har lämnat terminalen',
  'Arrive in transit center': 'Paketet har kommit till terminalen',
  'Released from customs: customs cleared.': 'Klart i tullen',
  'Arrival to the destination airport': 'Framme på flygplatsen',
  'Departure from the original airport': 'Har lyft från avgångsflygplatsen',
  'Hand over to airline.': 'Överlämnat till flygbolaget',
  'SHIPPING INFORMATION RECEIVED': 'Vi har fått uppgifterna om paketet',
  'Depart from facility to service provider.': 'Har lämnat lagret',
  'Shipment arrived at facility and measured.': 'Inskannat och uppmätt på lagret',
  'Shipment picked up.': 'Paketet är upphämtat',
  'Parcel information received': 'Vi har fått uppgifterna om paketet',
  'Clearence processing completed - Export': 'Klart i exporttullen',
  'Arrived at the origin international airport': 'Framme på avgångsflygplatsen',
  'Shipment is in transit to next facility': 'På väg till nästa terminal',
  'The country of origin commences customs declaration.': 'Tulldeklarationen har påbörjats',
  'Departed from sort facility': 'Har lämnat sorteringsterminalen',
  'Arrived at origin facility': 'Framme på avgångsterminalen',
  'The booking of the delivery is completed.': 'Leveransen är bokad',
  'Shipment picked up': 'Paketet är upphämtat',
  'Shipment information received': 'Vi har fått uppgifterna om paketet',
};

function oversattFras(text) {
  const t = text == null ? '' : String(text).trim();
  return ORDBOK[t] ?? null;   // okänd fras ⇒ null ⇒ raden visas inte
}

// Platserna kommer i VERSALER från 4PX och som "Mainland China, CN" från
// YunExpress. Den här stubben gör bara det minsta: trimmar och ger null för
// tomt. Den riktiga städningen bor i sparning/sprak.mjs.
function stadaPlats(plats) {
  if (plats == null) return null;
  const s = String(plats).trim().replace(/\s+/g, ' ');
  return s.length ? s : null;
}

const SPRAK = { oversattFras, stadaPlats };

// --- Riktiga 17TRACK-poster (hämtade 2026-09-19) ---------------------------

function post(number, carrier, events) {
  return { number, carrier, track_info: { tracking: { providers: [{ events }] } } };
}

// 4PX, 15 händelser. Bär dubbelrapporten 15:39:01 / 15:39:00 i MALMÖ
// PAKETTERMINAL — samma skanning två gånger, en sekund isär.
const POST_4PX = post('4PX3003149907008CN', 190094, [
  { time_iso: '2026-09-18T15:39:01+00:00', description: 'THE SHIPMENT ITEM IS UNDER TRANSPORTATION.', location: 'MALMÖ PAKETTERMINAL MALMÖ', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-18T15:39:00+00:00', description: 'THE SHIPMENT ITEM IS UNDER TRANSPORTATION.', location: 'MALMÖ PAKETTERMINAL MALMÖ', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-18T11:10:00+00:00', description: 'THE SHIPMENT ITEM IS UNDER TRANSPORTATION.', location: 'MALMÖ PAKETTERMINAL MALMÖ', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-17T09:48:00+00:00', description: 'THE SHIPMENT ITEM HAS ARRIVED AT THE COUNTRY OF DESTINATION.', location: null, sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-16T11:21:07+02:00', description: 'Parcel outbound from transit center', location: null, sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-15T21:49:01+02:00', description: 'Arrive in transit center', location: 'BE', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-15T20:24:00+02:00', description: 'Released from customs: customs cleared.', location: null, sub_status: 'InTransit_CustomsProcessing', stage: null },
  { time_iso: '2026-09-15T18:24:00+02:00', description: 'Arrival to the destination airport', location: null, sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-15T07:22:00+08:00', description: 'Departure from the original airport', location: null, sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-14T21:29:13+08:00', description: 'Hand over to airline.', location: null, sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-13T14:23:55+02:00', description: 'SHIPPING INFORMATION RECEIVED', location: null, sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-13T06:06:01+08:00', description: 'Depart from facility to service provider.', location: 'Nancheng', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-11T22:44:30+08:00', description: 'Shipment arrived at facility and measured.', location: 'Hongqiao', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-11T22:44:28+08:00', description: 'Shipment picked up.', location: 'Hongqiao', sub_status: 'InTransit_PickedUp', stage: 'PickedUp' },
  { time_iso: '2026-09-11T11:34:25+08:00', description: 'Parcel information received', location: null, sub_status: 'InfoReceived', stage: 'InfoReceived' },
]);

// YunExpress, 9 händelser. ⚠️ Ligger INTE i tidsordning i svaret:
// "The booking of the delivery is completed." står 2026-09-17T16:16:25+02:00
// (14:16 UTC) FÖRE "Shipment picked up" 2026-09-17T18:58:04+08:00 (10:58 UTC).
const POST_YT = post('YT2626000704561653', 190008, [
  { time_iso: '2026-09-19T16:53:13+08:00', description: 'Clearence processing completed - Export', location: 'CN', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-19T13:46:05+08:00', description: 'Arrived at the origin international airport', location: 'Mainland China, CN', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-19T08:46:05+08:00', description: 'Shipment is in transit to next facility', location: 'Mainland China, CN', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-18T19:46:18+08:00', description: 'The country of origin commences customs declaration.', location: 'Mainland China, CN', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-18T02:30:24+08:00', description: 'Departed from sort facility', location: 'Mainland China, CN', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-18T00:16:22+08:00', description: 'Arrived at origin facility', location: 'Mainland China, CN', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-17T16:16:25+02:00', description: 'The booking of the delivery is completed.', location: null, sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-17T18:58:04+08:00', description: 'Shipment picked up', location: 'Mainland China, CN', sub_status: 'InTransit_Other', stage: null },
  { time_iso: '2026-09-17T11:33:52+08:00', description: 'Shipment information received', location: null, sub_status: 'InfoReceived', stage: 'InfoReceived' },
]);

// YunExpress, nyss skickat: en enda händelse, ingen plats. Vanligaste fallet
// i kön (mätt 2026-09-19: 124 av 1 873 händelser var just den frasen).
const POST_NY = post('YT2626100708674690', 190008, [
  { time_iso: '2026-09-18T18:14:55+08:00', description: 'Shipment information received', location: null, sub_status: 'InfoReceived', stage: 'InfoReceived' },
]);

// En fast tidpunkt strax efter fixturernas senaste händelse.
const NU = Date.parse('2026-09-19T12:00:00Z');

// ---------------------------------------------------------------------------
// handelserUr()
// ---------------------------------------------------------------------------

test('handelserUr: dubbelrapporten i MALMÖ slås ihop, den 4,5 h tidigare står kvar', () => {
  const h = handelserUr(POST_4PX, { ...SPRAK, nu: NU });

  // 15 händelser in, 14 ut: 15:39:00 är samma skanning som 15:39:01.
  assert.equal(h.length, 14);

  const malmo = h.filter((x) => x.plats === 'MALMÖ PAKETTERMINAL MALMÖ');
  assert.equal(malmo.length, 2);
  assert.deepEqual(malmo.map((x) => x.tid), [
    '2026-09-18T15:39:01.000Z',
    '2026-09-18T11:10:00.000Z',
  ]);
  assert.equal(malmo[0].text, 'Paketet är på väg');
});

test('handelserUr: samma text på olika plats slås INTE ihop', () => {
  const p = post('TEST1', 190008, [
    { time_iso: '2026-09-18T10:00:00Z', description: 'Arrive in transit center', location: 'BE', sub_status: null, stage: null },
    { time_iso: '2026-09-18T10:05:00Z', description: 'Arrive in transit center', location: 'Nancheng', sub_status: null, stage: null },
  ]);
  const h = handelserUr(p, { ...SPRAK, nu: NU });
  assert.equal(h.length, 2);
  assert.deepEqual(h.map((x) => x.plats), ['Nancheng', 'BE']);
});

test('handelserUr: sorterar nyast först även när svaret är felordnat', () => {
  const h = handelserUr(POST_YT, { ...SPRAK, nu: NU });
  assert.equal(h.length, 9);

  const tider = h.map((x) => Date.parse(x.tid));
  for (let i = 1; i < tider.length; i++) assert.ok(tider[i - 1] >= tider[i], `händelse ${i} ligger fel i tid`);

  // De två som låg fel i svaret har bytt plats: bokningen (14:16 UTC) ska nu
  // ligga före upphämtningen (10:58 UTC).
  const boknIx = h.findIndex((x) => x.text === 'Leveransen är bokad');
  const hamtIx = h.findIndex((x) => x.text === 'Paketet är upphämtat');
  assert.ok(boknIx < hamtIx, 'bokningen ska ligga före upphämtningen efter sorteringen');
});

test('handelserUr: fras utan översättning BEHÅLLS med fraktbolagets egen text', () => {
  // Ändrat 2026-09-19 på Axels krav: "ingen faktisk trackinghändelse får tas
  // bort ur fullständig historik". Förut hoppades raden över och en skanning
  // med tid och plats försvann tyst. Nu står fraktbolagets text kvar — den
  // syns BARA i den fullständiga historiken, aldrig i sammanfattningen, så
  // kunden möter fortfarande inte engelska i standardvyn.
  const bara = (t) => (t === 'Shipment information received' ? 'Vi har fått uppgifterna om paketet' : null);
  const h = handelserUr(POST_YT, { oversattFras: bara, stadaPlats, nu: NU });
  assert.equal(h.length, POST_YT.track_info.tracking.providers[0].events.length);
  const oversatt = h.filter((x) => x.text === 'Vi har fått uppgifterna om paketet');
  assert.equal(oversatt.length, 1, 'den kända frasen översattes');
  // Varje rad bär fraktbolagets originaltext i `ra` — det kontrollen mäter mot.
  for (const x of h) assert.ok(x.ra, 'råtexten sparas för kontrollen');
  // Ingen rad tappade sin tid.
  for (const x of h) assert.ok(!Number.isNaN(Date.parse(x.tid)));
});

test('handelserUr: ogiltig och framtida tid hoppas över, time_utc duger som reserv', () => {
  const p = post('TEST2', 190008, [
    { time_iso: null, time_utc: '2026-09-18T09:00:00Z', description: 'Shipment picked up', location: 'Hongqiao', sub_status: null, stage: null },
    { time_iso: 'inte en tid alls', description: 'Shipment information received', location: null, sub_status: null, stage: null },
    { time_iso: null, time_utc: null, description: 'Shipment information received', location: null, sub_status: null, stage: null },
    // Mer än en timme fram i tiden ⇒ trasig stämpel, inte en skanning.
    { time_iso: '2026-09-19T18:00:00Z', description: 'Arrived at origin facility', location: null, sub_status: null, stage: null },
    // Precis innanför marginalen (NU + 30 min) ⇒ behålls.
    { time_iso: '2026-09-19T12:30:00Z', description: 'Departed from sort facility', location: null, sub_status: null, stage: null },
  ]);
  const h = handelserUr(p, { ...SPRAK, nu: NU });
  assert.deepEqual(h.map((x) => x.text), ['Har lämnat sorteringsterminalen', 'Paketet är upphämtat']);
});

test('handelserUr: taket är MAX_HANDELSER, de senaste behålls', () => {
  // Taket höjdes 30 → 120 2026-09-19 (Axels krav att ingen skanning får
  // försvinna), så 40 händelser ryms nu alla. Testet mäter båda sakerna: att
  // ett normalt paket INTE kapas, och att taket ändå biter när det ska.
  // Syntetisk fixtur: en händelse per dygn, med texter ur ordboken.
  const texter = Object.keys(ORDBOK);
  const events = [];
  for (let i = 0; i < 40; i++) {
    events.push({
      time_iso: new Date(Date.parse('2026-09-19T00:00:00Z') - i * 24 * 3600 * 1000).toISOString(),
      description: texter[i % texter.length],
      location: null,
      sub_status: null,
      stage: null,
    });
  }
  const h = handelserUr(post('TEST3', 190008, events), { ...SPRAK, nu: NU });
  assert.equal(h.length, 40, '40 händelser ryms under taket 120 — inget kapas');
  assert.equal(h[0].tid, '2026-09-19T00:00:00.000Z');

  // Och taket biter fortfarande: MAX_HANDELSER + 10 händelser ger MAX.
  const manga = [];
  for (let i = 0; i < MAX_HANDELSER + 10; i++) {
    manga.push({
      time_iso: new Date(Date.parse('2026-09-19T00:00:00Z') - i * 24 * 3600 * 1000).toISOString(),
      description: texter[i % texter.length],
      location: null, sub_status: null, stage: null,
    });
  }
  const t2 = handelserUr(post('TEST3B', 190008, manga), { ...SPRAK, nu: NU });
  assert.equal(t2.length, MAX_HANDELSER);
  assert.equal(t2[0].tid, '2026-09-19T00:00:00.000Z', 'de SENASTE behålls');
});

test('handelserUr: tomt eller trasigt svar ger tom lista, aldrig ett kast', () => {
  assert.deepEqual(handelserUr({}, { ...SPRAK, nu: NU }), []);
  assert.deepEqual(handelserUr(null, { ...SPRAK, nu: NU }), []);
  assert.deepEqual(handelserUr({ track_info: { tracking: { providers: [] } } }, { ...SPRAK, nu: NU }), []);
});

test('handelserUr: kräver att ordboken skickas in', () => {
  assert.throws(() => handelserUr(POST_NY, {}), /sprak\.mjs/);
});

test('handelserUr: ett `nu` som inte är ett tal kastar i stället för att tysta kedjan', () => {
  // Regressionstest. `nu: null` gav förut `null + 3 600 000 = 3 600 000` som
  // framtidsgräns, och då låg VARENDA verklig skanning "i framtiden": 15
  // händelser in, 0 ut, inget felmeddelande. Ett paket såg ut att sakna
  // skanningar för att en anropare skickat ett tomt konfigvärde.
  for (const trasigt of [null, NaN, Infinity, 'i går']) {
    assert.throws(() => handelserUr(POST_4PX, { ...SPRAK, nu: trasigt }), /nu/,
      `nu = ${String(trasigt)} ska kasta`);
  }

  // Utelämnat (eller undefined) `nu` är däremot tillåtet — då gäller
  // Date.now(), och fixturens händelser ligger alla bakåt i tiden.
  assert.equal(handelserUr(POST_4PX, SPRAK).length, 14);
  assert.equal(handelserUr(POST_4PX, { ...SPRAK, nu: undefined }).length, 14);
});

test('handelserUr: time_utc används när time_iso är tom eller oläsbar', () => {
  // `time_iso ?? time_utc` faller bara tillbaka på null/undefined. Ett tomt
  // `''` eller en sträng som inte går att tolka sänkte därför hela händelsen
  // fast reservtiden låg bredvid och var giltig.
  const p = post('TEST_TID', 190008, [
    { time_iso: '', time_utc: '2026-09-18T09:00:00Z', description: 'Shipment picked up', location: 'Hongqiao', sub_status: null, stage: null },
    { time_iso: 'inte en tid alls', time_utc: '2026-09-18T08:00:00Z', description: 'Shipment information received', location: null, sub_status: null, stage: null },
  ]);
  const h = handelserUr(p, { ...SPRAK, nu: NU });
  assert.deepEqual(h.map((x) => [x.tid, x.text]), [
    ['2026-09-18T09:00:00.000Z', 'Paketet är upphämtat'],
    ['2026-09-18T08:00:00.000Z', 'Vi har fått uppgifterna om paketet'],
  ]);
});

test('handelserUr: en zonlös time_utc läses som UTC, inte som maskinens lokaltid', () => {
  // 17TRACK skriver `time_utc` som "2026-09-18 09:00:00" — dokumenterad UTC,
  // men utan Z. Date.parse() läser en sådan sträng som LOKAL tid, så bygget
  // hade gett 09:00 i rutinens container (TZ=UTC) och 11:00 på en svensk
  // maskin i sommartid. Kunden ska se samma klockslag oavsett var filen byggs.
  const p = post('TEST_UTC', 190008, [
    { time_iso: null, time_utc: '2026-09-18 09:00:00', description: 'Shipment picked up', location: null, sub_status: null, stage: null },
  ]);
  assert.equal(handelserUr(p, { ...SPRAK, nu: NU })[0].tid, '2026-09-18T09:00:00.000Z');

  // Samma sak för formen med T men utan zon.
  const p2 = post('TEST_UTC2', 190008, [
    { time_iso: '2026-09-18T09:00:00', description: 'Shipment picked up', location: null, sub_status: null, stage: null },
  ]);
  assert.equal(handelserUr(p2, { ...SPRAK, nu: NU })[0].tid, '2026-09-18T09:00:00.000Z');

  // En stämpel MED offset räknas fortfarande om till UTC på riktigt.
  const p3 = post('TEST_UTC3', 190008, [
    { time_iso: '2026-09-18T11:00:00+02:00', description: 'Shipment picked up', location: null, sub_status: null, stage: null },
  ]);
  assert.equal(handelserUr(p3, { ...SPRAK, nu: NU })[0].tid, '2026-09-18T09:00:00.000Z');
});

test('handelserUr: providers eller events som inte är listor ger tom kedja, inget kast', () => {
  // `for...of` över ett objekt kastar "is not iterable". Ett trasigt svar
  // ska ge ett paket utan skanningar, inte en kraschad publicering.
  const fall = [
    { track_info: { tracking: { providers: {} } } },
    { track_info: { tracking: { providers: 'nej' } } },
    { track_info: { tracking: { providers: [{ events: {} }] } } },
    { track_info: { tracking: { providers: [null, { events: null }] } } },
    { track_info: { tracking: { providers: [{ events: ['inte ett objekt', null] }] } } },
  ];
  for (const f of fall) {
    assert.deepEqual(handelserUr(f, { ...SPRAK, nu: NU }), [], JSON.stringify(f));
  }
});

test('handelserUr: ordboken får svara med { text, kand } lika gärna som en sträng', () => {
  // Det är formen sparning/sprak.mjs lämnar: `kand` säger om frasen stod i
  // ordboken eller härleddes ur understatusen. Bygget bryr sig bara om
  // texten — men får aldrig visa "[object Object]" för kunden.
  const somObjekt = (text, understatus) => {
    const t = ORDBOK[String(text ?? '').trim()] ?? null;
    if (t) return { text: t, kand: true };
    if (understatus === 'InfoReceived') return { text: 'Vi har fått uppgifterna om paketet', kand: false };
    return { text: null, kand: false };
  };
  const h = handelserUr(POST_NY, { oversattFras: somObjekt, stadaPlats, nu: NU });
  assert.equal(h.length, 1);
  assert.equal(h[0].tid, '2026-09-18T10:14:55.000Z');
  assert.equal(h[0].text, 'Vi har fått uppgifterna om paketet');
  assert.equal(h[0].plats, null);
  assert.ok(!/\[object/.test(h[0].text), 'aldrig [object Object] till kunden');

  // { text: null } faller tillbaka på fraktbolagets egen text — raden får
  // inte försvinna (samma krav som testet ovan).
  const tomt = () => ({ text: null, kand: false });
  const utan = handelserUr(POST_YT, { oversattFras: tomt, stadaPlats, nu: NU });
  assert.equal(utan.length, POST_YT.track_info.tracking.providers[0].events.length);
  for (const x of utan) assert.equal(x.text, x.ra, 'råtexten används när ordboken tiger');
});

// ---------------------------------------------------------------------------
// byggData() — kontraktet mot uppacka.mjs
// ---------------------------------------------------------------------------

function byggTreFixturer() {
  const paket = [
    { nummer: POST_4PX.number, bolag: '4PX', statusKod: 'IN_TRANSIT', handelser: handelserUr(POST_4PX, { ...SPRAK, nu: NU }) },
    { nummer: POST_YT.number, bolag: 'YunExpress', statusKod: 'IN_TRANSIT', handelser: handelserUr(POST_YT, { ...SPRAK, nu: NU }) },
    { nummer: POST_NY.number, bolag: 'YunExpress', statusKod: 'CONFIRMED', handelser: handelserUr(POST_NY, { ...SPRAK, nu: NU }) },
  ];
  return { paket, byggd: byggData(paket, { nu: NU }) };
}

test('byggData → packaUppEtt: texter, platser, tider och ordning kommer tillbaka identiska', () => {
  const { paket, byggd } = byggTreFixturer();
  assert.equal(byggd.data.v, FORMAT);
  assert.equal(byggd.data.byggd, isoTillMinut(NU));

  for (const p of paket) {
    const ut = packaUppEtt(byggd.data, p.nummer);
    assert.ok(ut, `${p.nummer} saknas i datan`);
    assert.equal(ut.nummer, nyckel(p.nummer));
    assert.equal(ut.bolag, p.bolag);
    assert.equal(ut.statusKod, p.statusKod);
    assert.equal(ut.status, STATUSAR.find((r) => r[0] === p.statusKod)[1]);

    assert.equal(ut.handelser.length, p.handelser.length);
    p.handelser.forEach((in_, i) => {
      const ur = ut.handelser[i];
      assert.equal(ur.text, in_.text, `text ${i} på ${p.nummer}`);
      assert.equal(ur.plats, in_.plats, `plats ${i} på ${p.nummer}`);
      // Formatet lagrar hela minuter, så sekunderna rundas av. Det är den
      // enda förlusten — jämför därför mot samma avrundning.
      assert.equal(ur.iso, minutTillIso(isoTillMinut(in_.tid)), `tid ${i} på ${p.nummer}`);
      assert.ok(ur.tid instanceof Date);
    });
  }

  // Ordningen: nyast först, även efter upp- och nedpackning.
  const ut = packaUppEtt(byggd.data, POST_4PX.number);
  const tider = ut.handelser.map((h) => h.tid.getTime());
  for (let i = 1; i < tider.length; i++) assert.ok(tider[i - 1] >= tider[i]);
});

test('byggData: statistiken stämmer med datan', () => {
  const { paket, byggd } = byggTreFixturer();
  const s = byggd.statistik;
  assert.equal(s.paket, 3);
  assert.equal(s.handelser, paket.reduce((a, p) => a + p.handelser.length, 0));
  assert.equal(s.fraser, byggd.data.f.length);
  assert.equal(s.platser, byggd.data.p.length);
  assert.equal(s.tecken, JSON.stringify(byggd.data).length);
  assert.deepEqual(s.varningar, []);
  assert.deepEqual(byggd.data.b, ['4PX', 'YunExpress']);
});

test('byggData: varje fras och plats står EN gång, sorterade efter hur ofta de används', () => {
  const { paket, byggd } = byggTreFixturer();

  assert.equal(new Set(byggd.data.f).size, byggd.data.f.length, 'en fras får bara stå en gång');
  assert.equal(new Set(byggd.data.p).size, byggd.data.p.length, 'en plats får bara stå en gång');

  // Räkna om användningarna ur paketen och kontrollera fallande ordning.
  const antal = new Map();
  for (const p of paket) for (const h of p.handelser) antal.set(h.text, (antal.get(h.text) ?? 0) + 1);
  const serie = byggd.data.f.map((f) => antal.get(f) ?? 0);
  for (let i = 1; i < serie.length; i++) assert.ok(serie[i - 1] >= serie[i], `fraslistan är inte sorterad vid ${i}`);

  // "Vi har fått uppgifterna om paketet" används fyra gånger och ska därför
  // ligga först (den vanligaste frasen får det kortaste indexet). Fyra, inte
  // tre: 4PX skriver både "SHIPPING INFORMATION RECEIVED" och "Parcel
  // information received" på samma paket, och ordboken ger dem samma svenska
  // rad. Det är just sådana sammanslagningar ordboken finns för.
  assert.equal(byggd.data.f[0], 'Vi har fått uppgifterna om paketet');
  assert.equal(serie[0], 4);

  const platsAntal = new Map();
  for (const p of paket) for (const h of p.handelser) if (h.plats) platsAntal.set(h.plats, (platsAntal.get(h.plats) ?? 0) + 1);
  const pserie = byggd.data.p.map((x) => platsAntal.get(x) ?? 0);
  for (let i = 1; i < pserie.length; i++) assert.ok(pserie[i - 1] >= pserie[i], `platslistan är inte sorterad vid ${i}`);
  assert.equal(byggd.data.p[0], 'Mainland China, CN');   // 6 användningar i YT-posten
});

test('byggData: händelse utan plats får index -1 och packas upp som null', () => {
  const { byggd } = byggTreFixturer();
  const rader = byggd.data.k[nyckel(POST_NY.number)][2];
  assert.equal(rader.length, 1);
  assert.equal(rader[0][2], -1);
  assert.equal(packaUppEtt(byggd.data, POST_NY.number).handelser[0].plats, null);
});

test('byggData: en kedja i fel ordning skrivs ändå nyast först', () => {
  // Formatet säger "nyast först" (sparning/uppacka.mjs). handelserUr() lämnar
  // sorterat, men den andra vägen in — färdiga kedjor ur lage.json via
  // sparning/publicera.mjs — gör det inte. En osorterad kedja hade visat
  // kunden leveransen längst ned på sidan.
  const { data } = byggData([{
    nummer: 'YT2626100708674690',
    bolag: 'YunExpress',
    statusKod: 'DELIVERED',
    handelser: [
      { tid: '2026-09-15T08:00:00Z', text: 'Vi har fått uppgifterna om paketet', plats: null },
      { tid: '2026-09-18T11:00:00Z', text: 'Paketet är levererat', plats: 'Nässjö' },
      { tid: '2026-09-16T09:00:00Z', text: 'Paketet är på väg', plats: 'Malmö' },
    ],
  }], { nu: NU });

  const ut = packaUppEtt(data, 'YT2626100708674690');
  assert.deepEqual(ut.handelser.map((h) => h.text), [
    'Paketet är levererat', 'Paketet är på väg', 'Vi har fått uppgifterna om paketet',
  ]);
  const tider = ut.handelser.map((h) => h.tid.getTime());
  for (let i = 1; i < tider.length; i++) assert.ok(tider[i - 1] >= tider[i]);
});

test('byggData: paket utan händelser kommer med ändå', () => {
  const { data, statistik } = byggData([
    { nummer: 'YT2626100708674690', bolag: 'YunExpress', statusKod: 'CONFIRMED', handelser: [] },
  ], { nu: NU });

  const ut = packaUppEtt(data, 'YT2626100708674690');
  assert.ok(ut, 'numret ska finnas även utan skanningar');
  assert.deepEqual(ut.handelser, []);
  assert.equal(ut.status, 'Bekräftad');
  assert.equal(ut.bolag, 'YunExpress');
  assert.equal(statistik.paket, 1);
  assert.equal(statistik.handelser, 0);
  assert.deepEqual(statistik.varningar, []);
});

test('byggData: okänd statusKod blir CONFIRMED och noteras i varningarna', () => {
  const { data, statistik } = byggData([
    { nummer: 'YT2626100708674690', bolag: 'YunExpress', statusKod: 'HITTEPÅ', handelser: [] },
  ], { nu: NU });

  const ut = packaUppEtt(data, 'YT2626100708674690');
  assert.equal(ut.statusKod, 'CONFIRMED');
  assert.equal(ut.status, 'Bekräftad');
  assert.equal(statistik.varningar.length, 1);
  assert.match(statistik.varningar[0], /HITTEPÅ/);
});

test('byggData: nummer med blanksteg hittas via nyckel()', () => {
  const { byggd } = byggTreFixturer();

  // Kunden klistrar in numret som det står i mejlet — med mellanslag.
  assert.ok(packaUppEtt(byggd.data, 'YT26 2600 0704 561653'), 'numret ska hittas med mellanslag');
  assert.ok(packaUppEtt(byggd.data, 'yt2626000704561653'), 'och med gemener');
  assert.ok(packaUppEtt(byggd.data, ' 4px-3003149907008cn '), 'och med bindestreck och blanksteg');
  assert.equal(packaUppEtt(byggd.data, 'YT26 2600 0704 561653').nummer, 'YT2626000704561653');

  // Nyckeln i själva filen är alltid den normaliserade formen.
  assert.ok(Object.prototype.hasOwnProperty.call(byggd.data.k, 'YT2626000704561653'));

  // Numret ur uppgiftens exempel normaliseras likadant (ren strängfunktion —
  // paketet finns inte i butikens data, så det slås inte upp här).
  assert.equal(nyckel('YT26 2470 0707 772213'), 'YT2624700707772213');

  assert.equal(packaUppEtt(byggd.data, 'FINNS-INTE-123'), null);
});

test('byggData: packaUpp() ger alla paketen', () => {
  const { byggd } = byggTreFixturer();
  const alla = packaUpp(byggd.data);
  assert.equal(alla.length, 3);
  assert.deepEqual(alla.map((p) => p.nummer).sort(), [
    '4PX3003149907008CN', 'YT2626000704561653', 'YT2626100708674690',
  ]);
});

test('byggData: ordboken kortar filen rejält mot samma data utan ordbok', () => {
  const { paket, byggd } = byggTreFixturer();
  const s = byggd.statistik;

  // Samma innehåll rakt av, utan fras- och platsordbok.
  const ratt = JSON.stringify(paket.map((p) => ({
    n: p.nummer, b: p.bolag, s: p.statusKod,
    e: p.handelser.map((h) => [h.tid, h.text, h.plats]),
  }))).length;

  assert.ok(s.tecken < ratt, `komprimerat (${s.tecken}) ska vara mindre än rått (${ratt})`);
  // 24 händelser över tre paket: knappt hälften. Vinsten växer med antalet
  // paket, för ordboken delas — mätt 2026-09-19 gav 204 paket 75 fraser på
  // 1 873 händelser.
  assert.ok(s.tecken < ratt * 0.75, `komprimeringen ska ge minst 25 % (fick ${s.tecken} mot ${ratt})`);

  // En rimlighetskontroll på storleken: en händelse ska kosta några tiotal
  // tecken, inte hundratals.
  assert.ok(s.tecken / s.handelser < 100, 'mer än 100 tecken per händelse betyder att något inte komprimeras');
});

test('byggData: paket utan nummer hoppas över med en varning', () => {
  const { data, statistik } = byggData([
    { nummer: '   ', bolag: 'YunExpress', statusKod: 'CONFIRMED', handelser: [] },
    { nummer: 'YT2626100708674690', bolag: null, statusKod: 'DELIVERED', handelser: [] },
  ], { nu: NU });

  assert.equal(Object.keys(data.k).length, 1);
  assert.equal(statistik.varningar.length, 1);
  assert.match(statistik.varningar[0], /utan spårningsnummer/);
  assert.equal(packaUppEtt(data, 'YT2626100708674690').bolag, null);
});

test('byggData: kräver { nu } — bygget frågar aldrig klockan själv', () => {
  assert.throws(() => byggData([], {}), /nu/);
});

test('byggData: samma nummer två gånger räknas EN gång och lämnar inga döda ordboksrader', () => {
  // Numren i lage.json är fraktbolagens råa, så samma paket kan stå både som
  // "YT26 2600 0704 561653" och "YT2626000704561653" och falla ihop här.
  // Förut räknades den överskrivna postens fraser och platser ändå:
  // statistik.handelser sa 2 där datan bar 1 rad, och ordboken bar
  // "Paketet är på väg" och "Malmö" som ingen händelse pekade på.
  const { data, statistik } = byggData([
    {
      nummer: 'YT26 2600 0704 561653',
      bolag: 'YunExpress',
      statusKod: 'IN_TRANSIT',
      handelser: [{ tid: '2026-09-18T10:00:00Z', text: 'Paketet är på väg', plats: 'Malmö' }],
    },
    {
      nummer: 'YT2626000704561653',
      bolag: 'YunExpress',
      statusKod: 'DELIVERED',
      handelser: [{ tid: '2026-09-18T11:00:00Z', text: 'Paketet är levererat', plats: null }],
    },
  ], { nu: NU });

  assert.equal(statistik.paket, 1);
  assert.equal(statistik.handelser, 1, 'statistiken ska räkna raderna i datan, inte den överskrivna dubbletten');
  assert.equal(statistik.varningar.length, 1);
  assert.match(statistik.varningar[0], /Dubblett/);

  // Den senare posten vann, och bara dess fras och plats står i ordböckerna.
  const ut = packaUppEtt(data, 'YT2626000704561653');
  assert.equal(ut.statusKod, 'DELIVERED');
  assert.deepEqual(ut.handelser.map((h) => [h.text, h.plats]), [['Paketet är levererat', null]]);
  assert.deepEqual(data.f, ['Paketet är levererat']);
  assert.deepEqual(data.p, [], 'ingen plats används ⇒ platslistan ska vara tom');
  assert.deepEqual(data.b, ['YunExpress']);

  // Och statistiken ska stämma med datan, rad för rad.
  const iData = Object.values(data.k).reduce((a, post) => a + post[2].length, 0);
  assert.equal(statistik.handelser, iData);
});

test('byggData: en fras som bara en överhoppad händelse bar hamnar inte i ordboken', () => {
  // Händelser utan tid eller utan text hoppas över med en varning — då får
  // inte heller deras text ta plats i fraslistan.
  const { data, statistik } = byggData([{
    nummer: 'YT2626100708674690',
    bolag: 'YunExpress',
    statusKod: 'IN_TRANSIT',
    handelser: [
      { tid: 'inte en tid', text: 'Paketet är på väg', plats: 'Malmö' },
      { tid: '2026-09-18T10:00:00Z', text: '   ', plats: 'Göteborg' },
      { tid: '2026-09-18T11:00:00Z', text: 'Paketet är levererat', plats: 'Nässjö' },
    ],
  }], { nu: NU });

  assert.deepEqual(data.f, ['Paketet är levererat']);
  assert.deepEqual(data.p, ['Nässjö']);
  assert.equal(statistik.handelser, 1);
  assert.equal(statistik.fraser, 1);
  assert.equal(statistik.platser, 1);
  assert.equal(statistik.varningar.length, 2);
});

// ---------------------------------------------------------------------------
// filtreraFonster()
// ---------------------------------------------------------------------------

test('filtreraFonster: paket vars senaste händelse är äldre än fönstret faller bort', () => {
  const dygn = 24 * 3600 * 1000;
  const vid = (dagar) => new Date(NU - dagar * dygn).toISOString();

  const paket = [
    { nummer: 'FARSKT', handelser: [{ tid: vid(2), text: 'Paketet är på väg', plats: null }] },
    { nummer: 'PRECIS_INNANFOR', handelser: [{ tid: vid(FONSTER_DAGAR - 1), text: 'Paketet är levererat', plats: null }] },
    { nummer: 'GAMMALT', handelser: [{ tid: vid(FONSTER_DAGAR + 1), text: 'Paketet är levererat', plats: null }] },
    // Den senaste händelsen avgör, inte den äldsta.
    { nummer: 'GAMMAL_START', handelser: [
      { tid: vid(1), text: 'Paketet är levererat', plats: null },
      { tid: vid(90), text: 'Vi har fått uppgifterna om paketet', plats: null },
    ] },
    { nummer: 'UTAN_HANDELSER', handelser: [] },
  ];

  const kvar = filtreraFonster(paket, { nu: NU }).map((p) => p.nummer);
  assert.deepEqual(kvar, ['FARSKT', 'PRECIS_INNANFOR', 'GAMMAL_START', 'UTAN_HANDELSER']);
});

test('filtreraFonster: fönstret är 45 dagar och kräver { nu }', () => {
  assert.equal(FONSTER_DAGAR, 45);
  assert.throws(() => filtreraFonster([], {}), /nu/);
  assert.deepEqual(filtreraFonster(null, { nu: NU }), []);
});

test('filtreraFonster + byggData: ett filtrerat paket finns inte i filen', () => {
  const gammalt = { nummer: 'YT2600000000000001', bolag: 'YunExpress', statusKod: 'DELIVERED', handelser: [
    { tid: new Date(NU - 100 * 24 * 3600 * 1000).toISOString(), text: 'Paketet är levererat', plats: 'Malmö' },
  ] };
  const { paket } = byggTreFixturer();
  const { data, statistik } = byggData(filtreraFonster([...paket, gammalt], { nu: NU }), { nu: NU });

  assert.equal(statistik.paket, 3);
  assert.equal(packaUppEtt(data, gammalt.nummer), null);
});
