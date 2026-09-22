// Axels fyra krav på sammanfattningsvyn (2026-09-19), som körbara tester.
//
//   1. Ingen faktisk trackinghändelse får tas bort ur fullständig historik.
//   2. Finns ursprungsland eller transitland i transportörens rådata måste
//      kunden hitta det via "Mer information".
//   3. Sammanfattningen får förenkla ortnamn och transportörstexter, men
//      aldrig visa ett land, en plats eller en status som MOTSÄGER rådatan.
//   4. "Ankommit till Sverige" får aldrig visas utan en faktisk fysisk
//      skanning som stödjer det.
//
// ⚠️ Testerna körs mot RIKTIG rådata från butikens egna paket
// (test/fixturer/riktiga-paket.json — sju paket, 78 skanningar, hämtade ur
// 17TRACK 2026-09-19 och valda så att varje läge finns med: lång kedja
// Kina→Sverige, PostNords förhandsavisering, ett nyss bokat paket, ett i
// transit utomlands, ett hos ombud, ett med avvikelse och ett med
// dubbelrapport). En fixtur av påhittade rader hade inte bevisat något om de
// 11 206 skanningar sidan faktiskt bär.
//
// Sista testet går åt andra hållet: det MANIPULERAR datan så att den ljuger,
// och kräver att kontrollen fäller den. En kontroll som aldrig kan bli röd
// bevisar ingenting.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handelserUr, byggData } from '../paketdata.mjs';
import { oversattFras, stadaPlats, landFor } from '../sprak.mjs';
import { packaUppEtt, STEG } from '../uppacka.mjs';
import { kontrollera, kontrolleraFullstandighet, kontrolleraLander, kontrolleraSammanfattning } from '../kontroll.mjs';

const FIXTUR = JSON.parse(readFileSync(new URL('./fixturer/riktiga-paket.json', import.meta.url), 'utf8'));
const NU = Date.parse('2026-09-19T21:00:00Z');
const LAND = 'Sverige';

// Svenska texter vars innebörd ÄR ankomst till mottagarlandet, oavsett vad
// ortsfältet säger. Speglar I_LANDET-tabellen i sparning/steg.mjs.
const ANKOMSTFRASER = new Set([
  'Paketet har kommit till mottagarlandet',
  'Paketet är överlämnat till fraktbolaget i ditt land',
  'Paketet har kommit till en terminal i ditt land',
  'Paketet har kommit till terminalen',
  'Paketet har kommit till distributionsterminalen',
]);

// Rådatan tillbaka till formen 17TRACK lämnar den.
const somSvar = (p) => ({
  number: p.n,
  carrier: p.c,
  track_info: {
    tracking: {
      providers: [{
        events: p.ev.map((e) => ({
          time_iso: e.t, description: e.d, location: e.l, sub_status: e.s, stage: e.st,
        })),
      }],
    },
  },
});

function byggAllt(paketFixtur = FIXTUR) {
  const paket = paketFixtur.map((p) => ({
    nummer: p.n,
    bolag: p.c === 190008 ? 'YunExpress' : '4PX',
    statusKod: null,
    handelser: handelserUr(somSvar(p), { oversattFras, stadaPlats, landFor, nu: NU }),
  }));
  const { data, statistik } = byggData(paket, { nu: NU, mottagarland: LAND });
  return { paket, data, statistik };
}

// ---------------------------------------------------------------------------

test('fixturen är riktig data och täcker varje läge', () => {
  assert.ok(FIXTUR.length >= 7, 'för få paket i fixturen');
  const fall = new Set(FIXTUR.map((p) => p.fall));
  for (const v of ['levererat-lang-kedja', 'postnord-forhandsavi', 'bara-bestalld', 'hos-ombud', 'avvikelse', 'dubbelrapport']) {
    assert.ok(fall.has(v), `fixturen saknar fallet ${v}`);
  }
  // Riktiga spårningsnummer och riktiga tidsstämplar, inte påhittade.
  for (const p of FIXTUR) {
    assert.match(p.n, /^(YT|4PX)[A-Z0-9]+$/, 'inte ett riktigt spårningsnummer: ' + p.n);
    for (const e of p.ev) assert.ok(!Number.isNaN(Date.parse(e.t)), 'ogiltig tid i fixturen');
  }
});

test('KRAV 1: ingen skanning försvinner ur den fullständiga historiken', () => {
  const { paket, data } = byggAllt();
  for (const p of paket) {
    const packat = packaUppEtt(data, p.nummer);
    assert.ok(packat, `${p.nummer} föll ur datan`);
    const rå = p.handelser.map((h) => ({ iso: h.tid, text: h.text, ra: h.ra, plats: h.plats, raPlats: h.plats }));
    assert.deepEqual(kontrolleraFullstandighet(rå, packat), [], `${p.nummer}: skanningar saknas`);
  }

  // Och räknat rakt av mot fraktbolagets rader: varje DISTINKT minut i
  // rådatan ska finnas i historiken. Dubbelrapporter räknas som en.
  for (const f of FIXTUR) {
    const packat = packaUppEtt(data, f.n);
    const råMinuter = new Set(f.ev.map((e) => new Date(e.t).toISOString().slice(0, 16)));
    const histMinuter = new Set(packat.handelser.map((h) => h.iso.slice(0, 16)));
    for (const m of råMinuter) assert.ok(histMinuter.has(m), `${f.n}: minuten ${m} finns hos fraktbolaget men inte i historiken`);
  }
});

test('KRAV 1: en skanning med okänd text behålls — med fraktbolagets egen text', () => {
  // Förut kastades raden när ordboken teg, och en skanning med tid och plats
  // försvann tyst. Ordboken låtsas tom här.
  const tyst = () => null;
  const p = FIXTUR.find((x) => x.fall === 'levererat-lang-kedja');
  const h = handelserUr(somSvar(p), { oversattFras: tyst, stadaPlats, landFor, nu: NU });
  const råMinuter = new Set(p.ev.map((e) => new Date(e.t).toISOString().slice(0, 16)));
  const kvarMinuter = new Set(h.map((x) => x.tid.slice(0, 16)));
  for (const m of råMinuter) assert.ok(kvarMinuter.has(m), `minuten ${m} försvann när ordboken teg`);
});

test('KRAV 2: ursprungsland och transitland går att hitta i historiken', () => {
  const { paket, data } = byggAllt();
  for (const p of paket) {
    const packat = packaUppEtt(data, p.nummer);
    const rå = p.handelser.map((h) => ({ iso: h.tid, text: h.text, ra: h.ra, plats: h.plats, raPlats: h.plats }));
    assert.deepEqual(kontrolleraLander(rå, packat), [], `${p.nummer}: ett land tappades`);
  }

  // Konkret på den långa kedjan: Kina är ursprung, Nederländerna transit,
  // Sverige destination. Alla tre ska gå att LÄSA i historiken.
  const lang = FIXTUR.find((x) => x.fall === 'levererat-lang-kedja');
  const packat = packaUppEtt(data, lang.n);
  const lastText = packat.handelser.map((h) => h.platsMedLand ?? '').join(' | ');
  const iRå = new Set();
  for (const e of lang.ev) { const l = landFor(e.l); if (l) iRå.add(l); }
  assert.ok(iRå.size >= 2, 'fixturen skulle ha minst två länder i rådatan');
  for (const l of iRå) assert.ok(lastText.includes(l), `landet ${l} går inte att läsa i historiken`);
});

test('KRAV 3: sammanfattningen motsäger aldrig rådatan', () => {
  const { paket, data } = byggAllt();
  for (const p of paket) {
    const packat = packaUppEtt(data, p.nummer);
    const rå = p.handelser.map((h) => ({ iso: h.tid, text: h.text, ra: h.ra, plats: h.plats, raPlats: h.plats }));
    assert.deepEqual(kontrolleraSammanfattning(rå, packat, { mottagarland: LAND }), [], `${p.nummer}: sammanfattningen ljuger`);
  }
});

test('KRAV 3: varje nått skede pekar på en skanning som finns i historiken', () => {
  const { data } = byggAllt();
  for (const f of FIXTUR) {
    const p = packaUppEtt(data, f.n);
    for (const s of p.sammanfattning.steg) {
      if (!s.nadd) continue;
      const bakom = p.handelser.find((h) => h.iso === s.iso && h.text === s.text);
      assert.ok(bakom, `${f.n}: skedet "${s.etikett}" saknar skanning`);
      assert.equal(bakom.avvikelse, false, `${f.n}: "${s.etikett}" bygger på en avvikelse`);
    }
    // Stegen får aldrig vara daterade bakvänt.
    const tider = p.sammanfattning.steg.filter((s) => s.nadd).map((s) => s.iso);
    assert.deepEqual(tider, [...tider].sort(), `${f.n}: skedena är daterade bakvänt`);
  }
});

test('KRAV 4: "Ankommit till Sverige" kräver en fysisk skanning i Sverige', () => {
  const { data } = byggAllt();
  const iLandet = STEG.findIndex((r) => r[0] === 'i_landet');
  for (const f of FIXTUR) {
    const p = packaUppEtt(data, f.n);
    const steg = p.sammanfattning.steg[iLandet];
    if (!steg.nadd) continue;

    // Stödet får vara ett av två — båda är fysiska skanningar:
    //   a) en skanning vars PLATS ligger i Sverige, eller
    //   b) en skanning där fraktbolaget SJÄLV säger att paketet nått
    //      mottagarlandet ("THE SHIPMENT ITEM HAS ARRIVED AT THE COUNTRY OF
    //      DESTINATION."), vilket 4PX rapporterar utan att fylla i orten.
    // Det andra är starkare bevis än det första, inte svagare: fraktbolaget
    // påstår ankomsten rakt ut. Att kräva ortsfältet hade daterat steget ett
    // dygn för sent för varje 4PX-paket.
    const stod = p.handelser.filter((h) => !h.avvikelse && (h.land === LAND || ANKOMSTFRASER.has(h.text)));
    assert.ok(stod.length, `${f.n}: "${steg.etikett}" utan en enda skanning som stödjer den`);
    const aldst = stod.map((h) => h.iso).sort()[0];
    assert.ok(steg.iso >= aldst, `${f.n}: ankomsten daterad före första stödjande skanningen`);
  }
});

test('KRAV 4: PostNords förhandsavisering lyfter ALDRIG till "Ankommit till Sverige"', () => {
  // Den är det farligaste enskilda fallet: platsen säger SWEDEN men paketet
  // har inte lämnat Kina. Mätt 2026-09-19: 20 fall av 20 kom före de
  // utländska skanningarna.
  const { data } = byggAllt();
  const f = FIXTUR.find((x) => x.fall === 'postnord-forhandsavi');
  const p = packaUppEtt(data, f.n);
  const iLandet = STEG.findIndex((r) => r[0] === 'i_landet');

  const avi = f.ev.find((e) => /Vi har fått en beställning/.test(e.d ?? ''));
  assert.ok(avi, 'fixturen saknar förhandsaviseringen');
  assert.equal(landFor(avi.l), 'Sverige', 'förhandsaviseringen ska bära svensk plats — annars mäter testet inget');

  const raden = p.handelser.find((h) => h.iso.slice(0, 16) === new Date(avi.t).toISOString().slice(0, 16));
  assert.ok(raden, 'förhandsaviseringen ska finnas kvar i historiken');
  assert.ok(raden.steg < iLandet, `förhandsaviseringen lyfte till steg ${raden.steg} — den får aldrig nå ${iLandet}`);

  // Och om paketet ändå visar "Ankommit", ska det vila på en ANNAN skanning.
  const steg = p.sammanfattning.steg[iLandet];
  if (steg.nadd) assert.notEqual(steg.iso, raden.iso, 'ankomsten vilar på förhandsaviseringen');
});

test('hela kontrollen är grön på all riktig data', () => {
  const { paket, data } = byggAllt();
  const r = kontrollera(paket, data, { mottagarland: LAND, maxHandelser: 120 });
  assert.equal(r.ok, true, JSON.stringify(r.problem, null, 1));
  assert.equal(r.kollade, FIXTUR.length);
});

// ---------------------------------------------------------------------------
// Motprovet: kontrollen ska kunna bli RÖD
// ---------------------------------------------------------------------------

test('kontrollen fäller en historik där en skanning tagits bort', () => {
  const { paket, data } = byggAllt();
  const offer = paket.find((p) => p.handelser.length > 3);
  const trasig = JSON.parse(JSON.stringify(data));
  // Ta bort en rad vars MINUT är unik. Plockas en rad som delar minut med en
  // annan märks inget — och då hade motprovet mätt sig självt, inte
  // kontrollen. (Första försöket gjorde just det och gick grönt.)
  const rader = trasig.k[offer.nummer][2];
  const antalPerMinut = new Map();
  for (const r of rader) antalPerMinut.set(r[0], (antalPerMinut.get(r[0]) ?? 0) + 1);
  const ix = rader.findIndex((r) => antalPerMinut.get(r[0]) === 1);
  assert.ok(ix >= 0, 'paketet saknar en rad med unik minut att ta bort');
  rader.splice(ix, 1);
  const r = kontrollera([offer], trasig, { mottagarland: LAND });
  assert.equal(r.ok, false, 'kontrollen missade en borttagen skanning');
  assert.ok(r.problem.some((p) => p.krav === 1), 'fel krav larmade');
});

test('kontrollen fäller en historik där landet tappats', () => {
  const { paket, data } = byggAllt();
  const offer = paket.find((p) => p.handelser.some((h) => h.land));
  const trasig = JSON.parse(JSON.stringify(data));
  for (const rad of trasig.k[offer.nummer][2]) rad[4] = -1;   // nolla landet
  trasig.p = trasig.p.map(() => 'Okänd plats');               // och orten
  const r = kontrollera([offer], trasig, { mottagarland: LAND });
  assert.equal(r.ok, false, 'kontrollen missade ett tappat land');
  assert.ok(r.problem.some((p) => p.krav === 2), 'fel krav larmade');
});

test('kontrollen fäller "Ankommit till Sverige" utan svensk skanning', () => {
  const { paket, data } = byggAllt();
  const iLandet = STEG.findIndex((r) => r[0] === 'i_landet');
  // Ett paket som ALDRIG varit i Sverige får steget påtvingat.
  const offer = paket.find((p) => !p.handelser.some((h) => h.land === LAND) && p.handelser.length);
  assert.ok(offer, 'fixturen saknar ett paket utan svenska skanningar');
  const trasig = JSON.parse(JSON.stringify(data));
  trasig.k[offer.nummer][2][0][3] = iLandet;
  const r = kontrollera([offer], trasig, { mottagarland: LAND });
  assert.equal(r.ok, false, 'kontrollen missade en påhittad ankomst');
  assert.ok(r.problem.some((p) => p.krav === 4), 'krav 4 larmade inte');
});

test('en avvikelse kan aldrig bli ett skede i sammanfattningen', () => {
  // Uppackaren hoppar över avvikelser när den bygger de fem punkterna, så en
  // störning kan inte visas som framsteg ens om datan påstår det. Motprovet
  // sätter en avvikelse till "levererat" och kräver att punkten ÄNDÅ inte
  // vilar på den.
  const { paket, data } = byggAllt();
  const offer = paket.find((p) => p.nummer === FIXTUR.find((f) => f.fall === 'avvikelse').n);
  const trasig = JSON.parse(JSON.stringify(data));
  const rader = trasig.k[offer.nummer][2];
  const avvIx = rader.findIndex((r) => (r[5] & 1) === 1);
  assert.ok(avvIx >= 0, 'fixturen saknar en avvikelse att pröva med');
  const levererat = STEG.findIndex((r) => r[0] === 'levererat');
  rader[avvIx][3] = levererat;
  const p = packaUppEtt(trasig, offer.nummer);
  const steg = p.sammanfattning.steg[levererat];
  if (steg.nadd) {
    assert.notEqual(steg.iso, p.handelser[avvIx].iso, 'en störning räknades som leverans');
  }
  // Avvikelsen ska fortfarande synas — som avvikelse, för sig.
  assert.ok(p.avvikelser.length, 'avvikelsen försvann helt');
});

test('kontrollen fäller "Levererat" som fraktbolaget aldrig rapporterat', () => {
  const { paket, data } = byggAllt();
  const offer = paket.find((p) => !p.handelser.some((h) => /levererat|delivered|uthämtat/i.test(h.text)) && p.handelser.length);
  assert.ok(offer, 'fixturen saknar ett paket utan leveransrad');
  const trasig = JSON.parse(JSON.stringify(data));
  trasig.k[offer.nummer][2][0][3] = STEG.findIndex((r) => r[0] === 'levererat');
  const r = kontrollera([offer], trasig, { mottagarland: LAND });
  assert.equal(r.ok, false, 'kontrollen lät en påhittad leverans passera');
  assert.ok(r.problem.some((p) => p.krav === 3), 'fel krav larmade');
});
