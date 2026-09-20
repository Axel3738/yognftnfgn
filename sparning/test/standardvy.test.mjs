// Axels krav 2026-09-20 på standardvyn, som körbara tester.
//
//   "Standardvyn ska bara visa leveransens milstolpar. Inga utländska
//    terminalnamn eller länder. Allt före Sverige är ett läge. Hela
//    fraktbolagets historik finns kvar bakom Mer information. Ingen rådata
//    raderas eller ändras."
//
// ⚠️ De här testerna finns för att HELA den ändringen kunde göras fel utan
// att en enda av de 115 gamla testerna blev röd (mätt 2026-09-20: både ett
// etikettbyte och en hopslagning 5→4 skeden gav 115/115 grönt). Skedenas
// antal, ordning och etiketter var opinnade, och sammanfattningsvyns
// innehåll testades inte alls — fixturen i sida.test.mjs är `v: 1` utan
// stegfält, så vyn kördes aldrig i sitt normalläge.
//
// Datan är RIKTIG: samma sju paket ur test/fixturer/riktiga-paket.json som
// kontroll.test.mjs använder, hämtade ur 17TRACK 2026-09-19.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { handelserUr, byggData } from '../paketdata.mjs';
import { oversattFras, stadaPlats, landFor } from '../sprak.mjs';
import { packaUppEtt, STEG, DELSTEG, I_LANDET_NR, sammanfattning } from '../uppacka.mjs';
import { kontrolleraStandardvyn, kontrollera } from '../kontroll.mjs';
import { delstegForFras, huvudskedeFor, klassificeraDelsteg } from '../delsteg.mjs';
import { sistaBiten } from '../sistabiten.mjs';
import { byggSidkropp } from '../sida.mjs';

const FIXTUR = JSON.parse(readFileSync(new URL('./fixturer/riktiga-paket.json', import.meta.url), 'utf8'));
const NU = Date.parse('2026-09-19T21:00:00Z');
const LAND = 'Sverige';
const KONFIG = { butik: { support: 'kundsupport@baverbutiken.se' }, frakt: { sparning_vaknar: '2–4 dagar' } };

const somSvar = (p) => ({
  number: p.n,
  carrier: p.c,
  track_info: { tracking: { providers: [{ events: p.ev.map((e) => ({ time_iso: e.t, description: e.d, location: e.l, sub_status: e.s, stage: e.st })) }] } },
});

function byggAllt() {
  const paket = FIXTUR.map((p) => ({
    nummer: p.n,
    bolag: p.c === 190008 ? 'YunExpress' : '4PX',
    statusKod: null,
    handelser: handelserUr(somSvar(p), { oversattFras, stadaPlats, landFor, nu: NU }),
  }));
  const { data } = byggData(paket, { nu: NU, mottagarland: LAND });
  return { paket, data };
}

// ⚠️ Den här fällan slog till TRE gånger under ändringen 2026-09-20.
// Sidans skript ligger i en String.raw-mall i sida.mjs, så ett bakåtfnutt
// var som helst i koden — även mitt i en kommentar — avslutar mallen och
// gör hela filen osyntaktisk. Felet pekar då på kommentarraden och ser ut
// att handla om något helt annat. Testet läser filen som text, för det är
// just som text felet uppstår.
test('sidans skriptmall bär inga bakåtfnuttar', () => {
  const kalla = readFileSync(new URL('../sida.mjs', import.meta.url), 'utf8');
  const start = kalla.indexOf('String.raw');
  assert.ok(start > 0, 'hittade inte skriptmallen — har den bytt form?');
  const fran = kalla.indexOf('`', start) + 1;
  const till = kalla.indexOf('\n`;', fran);
  assert.ok(till > fran, 'hittade inte slutet på skriptmallen');
  const inne = kalla.slice(fran, till);
  const rader = inne.split('\n');
  const traff = rader.map((r, i) => [i, r]).filter(([, r]) => r.includes('`'));
  assert.deepEqual(traff.map(([i, r]) => `rad ${i + 1}: ${r.trim()}`), [],
    'ett bakåtfnutt i skriptmallen stänger String.raw och river hela filen — skriv om raden utan det');
});

// ---------------------------------------------------------------- kontraktet

// ⚠️ Det här testet ska bli rött när någon ändrar skedena. Det är meningen.
// Är ändringen avsiktlig: rätta listan här i samma commit, och läs då också
// konstanterna i steg.mjs (BESTALLD…LEVERERAT) — de bär SAMMA ordning, och
// stegnumret ligger dessutom i varje redan byggd datafil.
test('skedenas nycklar, ordning och etiketter är låsta', () => {
  assert.deepEqual(STEG, [
    ['bestalld', 'Ordern är mottagen'],
    ['pa_vag', 'Paketet är på väg'],
    ['i_landet', 'Framme i {{land}}'],
    ['utkorning', 'Ute för leverans'],
    ['levererat', 'Levererat'],
  ]);
  assert.equal(I_LANDET_NR, 2, 'i_landet ska vara skede 2 — steg.mjs hårdkodar samma tal');
});

// ⚠️ MOTTAGARLANDET är tillåtet i en etikett — det är kundens eget land och
// hela poängen med raden ("På väg till Sverige"). Det som är förbjudet är
// ursprungs- och transitgeografin. Skillnaden är avsiktlig: `{{land}}` byts
// mot datans `land`, alltså alltid mottagarlandet, aldrig Kina.
test('ingen etikett bär utländsk geografi', () => {
  for (const [, etikett] of STEG) {
    assert.ok(!/kina|nederländerna|holland|belgien|shenzhen|hongqiao|rozenburg/i.test(etikett),
      `etiketten nämner utländsk geografi: ${etikett}`);
    assert.ok(!/sverige|norge|finland/i.test(etikett),
      `skriv {{land}} i stället för ett hårdkodat landsnamn: ${etikett}`);
  }
  for (const [, etikett] of DELSTEG) {
    assert.ok(!/kina|nederländerna|holland|belgien|europa|shenzhen|hongqiao|rozenburg/i.test(etikett),
      `delskedet nämner geografi: ${etikett}`);
    // Ett delskede får aldrig påstå ankomsten — det är i_landet:s jobb.
    assert.ok(!etikett.includes('{{land}}'), `delskedet påstår mottagarlandet: ${etikett}`);
  }
});

// ------------------------------------------------------------ orten i vyn

test('standardvyn visar aldrig en utländsk ort — mätt på riktig data', () => {
  const { paket, data } = byggAllt();
  const sedda = [];
  for (const p of paket) {
    const u = packaUppEtt(data, p.nummer);
    assert.deepEqual(kontrolleraStandardvyn(u, { mottagarland: LAND }), [], `${p.nummer}: krav 5 fälldes`);
    for (const s of u.sammanfattning.steg) if (s.nadd && s.plats) sedda.push(s.plats);
  }
  // De utländska orterna i just den här datan, namngivna så testet fäller
  // med ett begripligt besked om filtret glappar.
  for (const ort of ['Kina', 'Hongqiao', 'Nederländerna', 'Rozenburg', 'Belgien', 'Nancheng']) {
    assert.ok(!sedda.includes(ort), `"${ort}" nådde standardvyn`);
  }
  assert.ok(sedda.length > 0, 'ingen ort alls visas — då mäter testet ingenting');
});

test('svenska orter är kvar — ombudets namn är det kunden behöver', () => {
  const { paket, data } = byggAllt();
  const sedda = new Set();
  for (const p of paket) {
    for (const s of packaUppEtt(data, p.nummer).sammanfattning.steg) if (s.nadd && s.plats) sedda.add(s.plats);
  }
  assert.ok(sedda.has('Umeå'), 'leveransorten försvann ur standardvyn');
  assert.ok([...sedda].some((o) => /ICA|ombud|Gällö/i.test(o)), `utlämningsstället försvann: ${[...sedda].join(', ')}`);
});

test('orten filtreras på SKEDET, inte på landet', () => {
  // Mätt 2026-09-20: landFor() känner bara de orter som stått i datan, så
  // både "Luleå" (svensk) och "Hongqiao" (kinesisk) ger land = null. En ren
  // landsregel hade därför tystat den ena och släppt igenom den andra.
  assert.equal(landFor('LULEÅ PAKETTERMINAL LULEÅ'), null, 'mätningen har ändrats — läs om regeln i uppacka.ortFor');
  assert.equal(landFor('Hongqiao'), null, 'mätningen har ändrats — läs om regeln i uppacka.ortFor');

  const handelser = [
    { tid: null, iso: '2026-09-17T10:00', text: 'Levererat', plats: 'Luleå', land: null, steg: 4 },
    { tid: null, iso: '2026-09-12T10:00', text: 'Upphämtat', plats: 'Hongqiao', land: null, steg: 1 },
  ];
  const s = sammanfattning(handelser, LAND).steg;
  assert.equal(s[4].plats, 'Luleå', 'en svensk ort utan känt land ska visas');
  assert.equal(s[1].plats, null, 'en ort före ankomsten ska aldrig visas, känt land eller ej');
});

test('landets eget namn är ingen ort', () => {
  const handelser = [{ tid: null, iso: '2026-09-17T10:00', text: 'Ankommit', plats: 'Sverige', land: 'Sverige', steg: 2 }];
  assert.equal(sammanfattning(handelser, LAND).steg[2].plats, null, '"Ankommit till Sverige · Sverige" hjälper ingen');
});

// ------------------------------------------------------ rörelsen syns ändå

test('det aktiva skedet bär den senaste skanningen, inte bara den första', () => {
  // 544 av 1 055 paket (51,6 %) stod i internationell transport när det
  // mättes 2026-09-19, och den sträckan tar 4–9 dygn. Utan den här raden
  // står sidan stilla hela tiden för varannan kund.
  const { paket, data } = byggAllt();
  const u = packaUppEtt(data, '4PX3003158126858CN');
  const aktivt = u.sammanfattning.steg[u.sammanfattning.nu];
  assert.ok(aktivt.nadd, 'det aktiva skedet ska vara nått');
  assert.ok(aktivt.senastIso > aktivt.iso, 'paketet har rört sig sedan skedet nåddes — då ska senastIso vara nyare');
  assert.equal(aktivt.iso, '2026-09-15T17:25:00.000Z', 'skedets egen tid ska vara oförändrad (kontroll.mjs krav 3 matchar på den)');
  assert.ok(paket.length > 0);
});

// --------------------------------------------------------------- sidan

test('sidan: knappen heter "Mer information" och historiken ligger kvar bakom den', () => {
  const { data } = byggAllt();
  const kropp = byggSidkropp(data, KONFIG);
  assert.ok(kropp.includes('<summary>Mer information</summary>'), 'knappens namn har ändrats');
  assert.ok(/<details[^>]*id="bbs-mer"/.test(kropp), 'historiken ska ligga bakom en <details>');
  assert.ok(kropp.includes('med ort och land'), 'hjälpraden som förklarar vad som finns bakom knappen är borta');
  assert.ok(kropp.includes('id="bbs-lista"'), 'historiklistan saknas');
});

test('sidan: datan bär fortfarande varje skanning, ort och land', () => {
  // Kravet "ingen rådata raderas" mäts på datan i sidan, inte på vyn.
  const { paket, data } = byggAllt();
  const kropp = byggSidkropp(data, KONFIG);
  for (const p of paket) {
    const u = packaUppEtt(data, p.nummer);
    assert.equal(u.handelser.length, p.handelser.length, `${p.nummer}: skanningar försvann`);
  }
  const u = packaUppEtt(data, 'YT2625400704778854');
  const lander = new Set(u.handelser.map((h) => h.land).filter(Boolean));
  for (const l of ['Kina', 'Nederländerna', 'Sverige']) {
    assert.ok(lander.has(l), `${l} går inte att hitta i historiken`);
  }
  assert.ok(kropp.includes('Rozenburg'), 'transitorten ska finnas kvar i sidans data');
});

test('hela kontrollen är grön på riktig data, med krav 5 inräknat', () => {
  const { paket, data } = byggAllt();
  const r = kontrollera(paket, data, { mottagarland: LAND });
  assert.equal(r.ok, true, `kontrollen fälldes:\n${r.problem.map((p) => `${p.nummer}: ${p.text}`).join('\n')}`);
  assert.ok(r.kollade >= 7, 'för få paket kollades');
});

// ⚠️ Motprov. En kontroll som aldrig kan bli röd bevisar ingenting.
// ----------------------------------------------------- delskedet på resan

test('delskedet läses ur fraktbolagets egna skanningar', () => {
  const { data } = byggAllt();
  // Lång kedja Kina → Nederländerna → Sverige: paketet gick hela vägen, så
  // dess sista delskede ska vara tullen, inte flyget.
  const lang = packaUppEtt(data, 'YT2625400704778854').sammanfattning.steg[1];
  assert.equal(lang.delstegEtikett, 'Genom tullen');
  assert.equal(lang.delstegIkon, 'stampel');
  // Nyss upphämtat, två skanningar: första delskedet och inget mer.
  const nyss = packaUppEtt(data, 'YT2626100708675887').sammanfattning.steg[1];
  assert.equal(nyss.delstegEtikett, 'Hämtat hos avsändaren');
  assert.equal(nyss.delstegIkon, 'lada');
  // Bara bokat, ingen rörelse: inget delskede alls ska påstås.
  const bokat = packaUppEtt(data, 'YT2626100708674690').sammanfattning.steg[1];
  assert.equal(bokat.delsteg, -1);
  assert.equal(bokat.delstegEtikett, '');
});

test('delskedet pekar alltid på en riktig skanning i historiken', () => {
  const { paket, data } = byggAllt();
  for (const p of paket) {
    const u = packaUppEtt(data, p.nummer);
    for (const s of u.sammanfattning.steg) {
      if (s.delsteg < 0) continue;
      const bakom = u.handelser.find((h) => h.iso === s.delstegIso && h.delsteg === s.delsteg);
      assert.ok(bakom, `${p.nummer}: delskedet "${s.delstegEtikett}" har ingen skanning bakom sig`);
      assert.ok(!bakom.avvikelse, `${p.nummer}: delskedet bygger på en avvikelse`);
    }
  }
});

// ⚠️ DET HÄR ÄR REGELN HELA DELSTEGSBYGGET VILAR PÅ.
// Ett delskede är bundet till sitt huvudskede. "Arrived at sort facility"
// händer både i Shenzhen och i Malmö; den står som "Sorteras" i skede 2 och
// är neutral i skede 1. Släpper bindningen blir 482 kinesiska skanningar
// "Sorteras" (mätt 2026-09-20 på den publicerade datan).
test('varje delskede hör till sitt eget huvudskede', () => {
  const { paket, data } = byggAllt();
  let sedda = 0;
  const skedenSedda = new Set();
  for (const p of paket) {
    const u = packaUppEtt(data, p.nummer);
    for (const h of u.handelser) {
      if (h.delsteg < 0) continue;
      sedda++;
      skedenSedda.add(h.steg);
      assert.equal(huvudskedeFor(h.delsteg), h.steg,
        `${p.nummer}: skanningen i skede ${h.steg} bär delskedet "${DELSTEG[h.delsteg][1]}" som hör till skede ${huvudskedeFor(h.delsteg)}`);
    }
    for (const s of u.sammanfattning.steg) {
      if (s.delsteg < 0) continue;
      assert.equal(huvudskedeFor(s.delsteg), s.nr,
        `${p.nummer}: skedet "${s.nyckel}" visar ett delskede från ett annat skede`);
    }
  }
  assert.ok(sedda > 20, 'för få delskeden för att testet ska betyda något');
  assert.ok(skedenSedda.size >= 3, `delskeden syns bara i skede ${[...skedenSedda]} — hela resan ska vara täckt`);
});

test('de svenska skedena har egna delskeden', () => {
  const { data } = byggAllt();
  // Levererat paket som gick hela vägen: skedet "Framme i Sverige" ska bära
  // ett svenskt delskede, inte tullen från resan hit.
  const u = packaUppEtt(data, 'YT2625400704778854');
  const iLandet = u.sammanfattning.steg[2];
  assert.ok(iLandet.nadd);
  assert.equal(huvudskedeFor(iLandet.delsteg), 2, 'ankomstskedet visar ett delskede från fel del av resan');
  assert.ok(['Hos fraktbolaget', 'På terminalen', 'Sorteras', 'På väg mot din ort'].includes(iLandet.delstegEtikett),
    `oväntat delskede i Sverige: ${iLandet.delstegEtikett}`);
  // Och utkörningen ska ha sitt eget.
  const utk = u.sammanfattning.steg[3];
  assert.ok(utk.nadd);
  assert.equal(huvudskedeFor(utk.delsteg), 3);
});

test('ett tvetydigt fraktbolagsord binds till ETT skede, aldrig två', () => {
  // "Arrived at sort facility" betyder "Sorteras" — men bara i skede 2.
  const sort = delstegForFras('Arrived at sort facility');
  assert.ok(sort >= 0, 'frasen ska ha ett delskede');
  assert.equal(huvudskedeFor(sort), 2, 'sorteringen hör till den svenska sträckan');
  assert.equal(DELSTEG[sort][1], 'Sorteras');

  // Klassificeraren släpper den i skede 1 och tar den i skede 2.
  const kedja = [
    { iso: '2026-09-15T10:00', ra: 'Arrived at sort facility', steg: 2, avvikelse: false },
    { iso: '2026-09-12T10:00', ra: 'Arrived at sort facility', steg: 1, avvikelse: false },
  ];
  const ut = klassificeraDelsteg(kedja);
  assert.equal(ut[0].delsteg, sort, 'i Sverige ska den räknas');
  assert.equal(ut[1].delsteg, -1, 'i utlandet ska samma fras vara neutral');
});

test('ett neutralt ord ärver aldrig över en skedesgräns', () => {
  // Utan spärren hade den svenska raden visat "Genom tullen" — alltså var
  // paketet var i Nederländerna, på skedet som säger att det är i Sverige.
  const kedja = [
    { iso: '2026-09-15T10:00', ra: 'Shipment is in transit to next facility', steg: 2, avvikelse: false },
    { iso: '2026-09-13T10:00', ra: 'Clearance processing completed - Import', steg: 1, avvikelse: false },
  ];
  const ut = klassificeraDelsteg(kedja);
  assert.equal(DELSTEG[ut[1].delsteg][1], 'Genom tullen');
  assert.equal(ut[0].delsteg, -1, 'skede 2 ärvde ett delskede från skede 1');
});

// ⚠️ Avvikelseraden ligger i STANDARDVYN, ovanför stegen, och undantas inte
// av filtret i sammanfattning() — den bygger på en skanning utan skede.
// Mätt 2026-09-20 på 4PX3003158126759CN: rutan skrev "Paketet skickas
// tillbaka till avsändaren (Hongqiao)" tills ortIVyn fick sitt stränga läge.
test('avvikelserutan bär ingen utländsk ort', () => {
  const { data } = byggAllt();
  const kropp = byggSidkropp(data, KONFIG);
  const kod = kropp.split('<script>').pop();
  assert.ok(/ortIVyn\(avv, p\.land, true\)/.test(kod),
    'avvikelseraden måste använda det stränga läget — annars läcker en ort utan känt land');
});

test('sidan: delskedet och stegikonerna ritas', () => {
  const { data } = byggAllt();
  const kropp = byggSidkropp(data, KONFIG);
  assert.ok(kropp.includes('bbs-stegdel'), 'delskederaden saknas');
  assert.ok(kropp.includes('bbs-stegikon'), 'stegikonen saknas');
  assert.ok(kropp.includes('bbs-resa'), 'paketet som färdas längs linjen saknas');
  assert.ok(kropp.includes('prefers-reduced-motion'), 'animationen måste gå att stänga av');
  // Ikonerna är ritade, inte hämtade.
  assert.ok(!/<img/i.test(kropp) && !/\.svg/i.test(kropp), 'ikonerna får inte laddas utifrån');
});

test('krav 5 FÄLLER en standardvy som visar en utländsk ort', () => {
  const { data } = byggAllt();
  const u = packaUppEtt(data, 'YT2625400704778854');
  // Peta in Kina på det internationella skedet, som om filtret glappat.
  u.sammanfattning.steg[1].plats = 'Kina';
  u.sammanfattning.steg[1].land = 'Kina';
  const problem = kontrolleraStandardvyn(u, { mottagarland: LAND });
  assert.equal(problem.length, 1, 'kontrollen märkte inte att Kina stod i standardvyn');
  assert.equal(problem[0].krav, 5);
  assert.match(problem[0].text, /Kina/);
});

// ------------------------------------------------- sista biten i Sverige

// ⚠️ 17TRACK ger oss sista-bit-bolaget i `misc_info` — vi läste bara aldrig
// fältet förrän Axel sa till 2026-09-20. Mätt samma dag på butikens 1 055
// paket: CityMail 251, PostNord 189, Early Bird 101, DHL 68, Instabee 13.
test('sista biten läses ur misc_info och pekar bara på provade adresser', () => {
  const pn = sistaBiten({ local_provider: 'PostNord Sweden', local_number: 'UJ338439355SE', local_key: 19241 }, 'YT1');
  assert.equal(pn.namn, 'PostNord');
  assert.equal(pn.nummer, 'UJ338439355SE');
  assert.ok(pn.mall.includes('{nr}'), 'PostNord har en provad djuplänk');

  const cm = sistaBiten({ local_provider: 'CityMail', local_number: 'BCMYE004692786', local_key: 100405 }, 'YT1');
  assert.equal(cm.namn, 'CityMail');
  assert.ok(!cm.mall.includes('{nr}'), 'CityMail läser inte numret ur adressen — ingen djuplänk');

  // local_key är 0 för de här två, så uppslaget måste gå på namnet.
  assert.equal(sistaBiten({ local_provider: 'SE-U-DHL', local_number: 'X9', local_key: 0 }, 'YT1').namn, 'DHL');
  assert.equal(sistaBiten({ local_provider: 'SE-INSTABEE', local_number: 'X9', local_key: 0 }, 'YT1').namn, 'Instabee');

  // Okänt bolag: namnet visas, men ALDRIG en gissad länk.
  const okand = sistaBiten({ local_provider: 'Något Bolag AB', local_number: 'X9', local_key: 0 }, 'YT1');
  assert.equal(okand.namn, 'Något Bolag AB');
  assert.equal(okand.mall, null, 'en gissad länk som ger 404 är värre än ingen länk');

  // Inget bolag ⇒ ingen ruta. Och ett local_number som bara ekar huvudnumret
  // är ingen sista bit (mätt: 131 paket såg ut så).
  assert.equal(sistaBiten({ local_number: 'YT1' }, 'YT1'), null);
  assert.equal(sistaBiten({}, 'YT1'), null);
  assert.equal(sistaBiten({ local_provider: 'PostNord', local_number: 'yt-1' }, 'YT1').nummer, null);
});

test('sista biten överlever komprimeringen och blir en länk i uppackaren', () => {
  const NU2 = Date.parse('2026-09-19T21:00:00Z');
  const { data } = byggData([
    {
      nummer: 'YT111', bolag: 'YunExpress', statusKod: 'IN_TRANSIT',
      handelser: [{ tid: '2026-09-18T10:00:00Z', text: 'Paketet är på väg', plats: 'Malmö', land: 'Sverige' }],
      sistaBiten: { namn: 'PostNord', nummer: 'UJ338439355SE', mall: 'https://portal.postnord.com/tracking/details/{nr}' },
    },
    {
      nummer: 'YT222', bolag: 'YunExpress', statusKod: 'IN_TRANSIT',
      handelser: [{ tid: '2026-09-18T10:00:00Z', text: 'Paketet är på väg', plats: 'Malmö', land: 'Sverige' }],
      sistaBiten: { namn: 'CityMail', nummer: 'BCM1', mall: 'https://www.citymail.se/spara-paket/' },
    },
    {
      nummer: 'YT333', bolag: 'YunExpress', statusKod: 'IN_TRANSIT',
      handelser: [{ tid: '2026-09-18T10:00:00Z', text: 'Paketet är på väg', plats: null, land: null }],
    },
  ], { nu: NU2, mottagarland: LAND });

  const a = packaUppEtt(data, 'YT111').sistaBiten;
  assert.equal(a.namn, 'PostNord');
  assert.equal(a.lank, 'https://portal.postnord.com/tracking/details/UJ338439355SE');
  assert.equal(a.djuplank, true);

  const b = packaUppEtt(data, 'YT222').sistaBiten;
  assert.equal(b.lank, 'https://www.citymail.se/spara-paket/');
  assert.equal(b.djuplank, false, 'utan {nr} är det ingen djuplänk');
  assert.equal(b.nummer, 'BCM1', 'numret ska stå bredvid så kunden kan klistra in det');

  // Paket utan sista bit bär inget fält alls — de 432 som är på väg ska inte
  // kosta plats i filen.
  assert.equal(packaUppEtt(data, 'YT333').sistaBiten, null);
  assert.equal(data.k.YT333.length, 3, 'posten ska sakna fält 4');
  assert.equal(data.s.length, 2, 'bolagen ska ordbokas, inte upprepas per paket');
});

test('sidan ritar sista biten som en riktig länk', () => {
  const { data } = byggAllt();
  const kropp = byggSidkropp(data, KONFIG);
  assert.ok(kropp.includes('id="bbs-sista"'), 'rutan för sista biten saknas');
  assert.ok(kropp.includes('Sista biten i {{land}}'), 'rubriken saknas i texterna');
  // Länken öppnas i ny flik och lämnar ingen referrer-koppling.
  const kod = kropp.split('<script>').pop();
  assert.ok(kod.includes("a.setAttribute('rel', 'noopener')"), 'länken ska bära rel=noopener');
});
