// Tester för OPS-registret: upptäckten, kontospärren, prefixfiltret och
// kördagsberäkningen. Inga nätanrop, inga skrivningar.
//
// Prefixfiltret är den dyraste regeln i hela fabriken: kontot MagiBorsten DK
// 915422744950975 bär alla OPS-butiker OCH Bäverbutikens danska kampanjer.
// Går filtret sönder rangordnas en annan verksamhets annonser mot den här
// butikens break-even — och det syns inte som ett fel, bara som konstig data.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  paraIhop, byggRegister, nastaOffset, dagnummer, arKordag,
  tillhorButiken, prefixFor, prefixEllerSkal, sakerstallKonto, sakerstallOpsKonto,
  hittaPost, laddaButik, lasRegister, upptackOps, upptackTest, redigerareFor,
  svenskDatum, veckodag, arBriefdag, normaliseraNotionId, lasDrift,
  OPS_ANNONSKONTO, BAVERBUTIKEN_ANNONSKONTO, CYKEL_DAGAR, TROSKEL,
  BRIEFDAGAR_STANDARD, BRIEF_IKAPP_DAGAR,
} from '../register.mjs';

const post = (extra = {}) => ({
  nyckel: 'hemvakten/overvakningskameran',
  lage: 'skala',
  butik: 'hemvakten',
  brand: 'HeimGuard',
  kampanjprefix: 'HEIMGUARD_',
  annonsprefix: 'HeimGuard',
  enprodukt: true,
  ad_account_id: OPS_ANNONSKONTO,
  ...extra,
});

// --------------------------------------------------------------- upptäckten

test('paraIhop kopplar butik och produkt via state-filen — beviset att bygget skett', () => {
  const par = paraIhop({
    butiker: [{ id: 'drytrek', brand: 'DryTrek' }, { id: 'tankguard', brand: 'TankGuard' }],
    produkter: [{ id: 'damasker', brand: 'DryTrek' }, { id: 'tankguard', brand: 'TankGuard' }],
    statenycklar: ['drytrek--damasker', 'drytrek--_butik'],
  });
  const damasker = par.find((p) => p.produkt.id === 'damasker');
  assert.equal(damasker.butik.id, 'drytrek');
  assert.equal(damasker.byggd, true);
  assert.equal(damasker.kalla, 'state');

  // Utan state-fil kopplas den ändå ihop via brandnamnet, men räknas som
  // INTE byggd — och en obyggd butik har inga annonser att läsa.
  const tank = par.find((p) => p.produkt.id === 'tankguard');
  assert.equal(tank.byggd, false);
  assert.equal(tank.kalla, 'brand');
});

test('paraIhop struntar i _butik-nyckeln och i produkter utan butik', () => {
  const par = paraIhop({
    butiker: [{ id: 'tacklebay', brand: 'TackleBay' }],
    produkter: [{ id: 'ensam', brand: 'IngenButik' }],
    statenycklar: ['tacklebay--_butik'],
  });
  assert.equal(par.length, 0, 'en produkt utan butik hör inte hemma i registret');
});

test('bara BYGGDA butiker kommer in i registret — testfixturen hamnar utanför', () => {
  const r = byggRegister({
    upptackta: [
      { nyckel: 'drytrek/damasker', lage: 'skala', byggd: true },
      { nyckel: 'testbutiken/nackmagneten', lage: 'skala', byggd: false },
    ],
  });
  assert.deepEqual(r.produkter.map((p) => p.nyckel), ['drytrek/damasker']);
  assert.deepEqual(r.ej_byggda, ['testbutiken/nackmagneten']);
});

test('driftläget får ändra läge och redigerare, aldrig identiteten', () => {
  const r = byggRegister({
    upptackta: [{ nyckel: 'drytrek/damasker', lage: 'skala', byggd: true, ad_account_id: OPS_ANNONSKONTO }],
    drift: { poster: { 'drytrek/damasker': { lage: 'skala', redigerare: 'Josh', kordag_offset: 2, senaste_korning: '2026-09-06' } } },
  });
  const p = r.produkter[0];
  assert.equal(p.redigerare, 'Josh');
  assert.equal(p.kordag_offset, 2);
  assert.equal(p.senaste_korning, '2026-09-06');
  assert.equal(p.ny_i_registret, false);
  assert.equal(p.ad_account_id, OPS_ANNONSKONTO, 'kontot kommer ur produktfilen, aldrig ur driftfilen');
});

test('läge avslutad tas ur registret — en produkt som fått egen butik bevakas inte längre', () => {
  const r = byggRegister({
    upptackta: [{ nyckel: 'baverbutiken/motorholjet', lage: 'test', byggd: true }],
    drift: { poster: { 'baverbutiken/motorholjet': { lage: 'avslutad' } } },
  });
  assert.equal(r.produkter.length, 0);
});

test('en post utan driftrad får offset ändå och märks ny — registret funkar direkt efter bygget', () => {
  const r = byggRegister({ upptackta: [{ nyckel: 'ny/butik', lage: 'skala', byggd: true }] });
  assert.equal(r.produkter[0].ny_i_registret, true);
  assert.ok([0, 1, 2].includes(r.produkter[0].kordag_offset));
});

// ------------------------------------------------------------- kördagarna

test('offseten går alltid till den minst använda dagen — butikerna sprids jämnt', () => {
  assert.equal(nastaOffset([]), 0);
  assert.equal(nastaOffset([0]), 1);
  assert.equal(nastaOffset([0, 1]), 2);
  assert.equal(nastaOffset([0, 1, 2]), 0, 'fjärde butiken börjar om — lägst nummer vid lika');
  assert.equal(nastaOffset([0, 0, 1, 2, 2]), 1);
  // Skräp i listan får inte flytta någon.
  assert.equal(nastaOffset([null, 'x', 7, 0]), 1);
});

test('fyra nya butiker fördelas 0,1,2,0 — aldrig alla på samma dag', () => {
  const upptackta = ['a/1', 'b/1', 'c/1', 'd/1'].map((nyckel) => ({ nyckel, lage: 'skala', byggd: true }));
  const offsets = byggRegister({ upptackta }).produkter.map((p) => p.kordag_offset);
  assert.deepEqual(offsets, [0, 1, 2, 0]);
  assert.equal(new Set(offsets).size, 3, 'alla tre dagarna används');
});

test('en ny butik flyttar aldrig en befintlig butiks kördag', () => {
  const drift = { poster: { 'b/1': { kordag_offset: 1 }, 'a/1': { kordag_offset: 0 } } };
  const upptackta = ['a/1', 'b/1', 'c/1'].map((nyckel) => ({ nyckel, lage: 'skala', byggd: true }));
  const r = byggRegister({ upptackta, drift });
  assert.equal(r.produkter.find((p) => p.nyckel === 'a/1').kordag_offset, 0);
  assert.equal(r.produkter.find((p) => p.nyckel === 'b/1').kordag_offset, 1);
  assert.equal(r.produkter.find((p) => p.nyckel === 'c/1').kordag_offset, 2, 'den nya tar dagen som är ledig');
});

test('dagnummer räknar i UTC och vägrar skräpdatum', () => {
  assert.equal(dagnummer('1970-01-01'), 0);
  assert.equal(dagnummer('1970-01-04') % CYKEL_DAGAR, 0);
  assert.equal(dagnummer('2026-09-10') - dagnummer('2026-09-09'), 1);
  assert.throws(() => dagnummer('9 september'), /Ogiltigt datum/);
  assert.throws(() => dagnummer(null), /Ogiltigt datum/);
});

test('en butik kör var tredje dag, på SIN dag', () => {
  const offset = dagnummer('2026-09-09') % CYKEL_DAGAR;
  const p = { kordag_offset: offset, senaste_korning: '2026-09-09' };
  assert.equal(arKordag(p, '2026-09-09').kordag, true);
  assert.equal(arKordag(p, '2026-09-10').kordag, false);
  assert.equal(arKordag(p, '2026-09-11').kordag, false);
  assert.equal(arKordag(p, '2026-09-12').kordag, true);
});

test('en butik som aldrig körts kör direkt — den ska inte vänta två dygn', () => {
  const k = arKordag({ kordag_offset: 2, senaste_korning: '' }, '2026-09-09');
  assert.equal(k.kordag, true);
  assert.match(k.skal, /aldrig körts/);
  assert.equal(k.dagarSedan, null);
});

test('ikappkörning: tre dygn utan rond kör ändå, oavsett offset', () => {
  // Fångsten finns för att en butik aldrig ska svälta om en körning missas
  // eller om offseten ändras när registret växer.
  const offset = (dagnummer('2026-09-09') + 1) % CYKEL_DAGAR; // avsiktligt FEL dag
  const p = { kordag_offset: offset, senaste_korning: '2026-09-06' };
  const k = arKordag(p, '2026-09-09');
  assert.equal(k.kordag, true);
  assert.match(k.skal, /ikappkörning/);
  assert.equal(k.dagarSedan, 3);

  // Två dygn räcker inte — då är det inte butikens tur.
  assert.equal(arKordag({ kordag_offset: offset, senaste_korning: '2026-09-07' }, '2026-09-09').kordag, false);
});

test('nästa kördag pekar alltid framåt, aldrig på i dag', () => {
  const offset = dagnummer('2026-09-09') % CYKEL_DAGAR;
  const k = arKordag({ kordag_offset: offset, senaste_korning: '2026-09-09' }, '2026-09-09');
  assert.equal(k.nastaKordag, '2026-09-12');
  const nasta = arKordag({ kordag_offset: (offset + 1) % CYKEL_DAGAR, senaste_korning: '2026-09-09' }, '2026-09-09');
  assert.equal(nasta.nastaKordag, '2026-09-10');
});

// ------------------------------------------------------------- briefdagarna

test('svenskDatum räknar i Europe/Stockholm — 22:30 UTC i juli är redan nästa dag', () => {
  // Nattrutinen går 00:01 svensk tid = 22:01 UTC dagen före på sommaren.
  // toISOString() hade sagt lördag när det var söndag.
  assert.equal(svenskDatum(new Date('2026-07-04T22:30:00Z')), '2026-07-05');
  assert.equal(svenskDatum(new Date('2026-07-04T21:30:00Z')), '2026-07-04', 'strax före svensk midnatt');
  // Vintertid: UTC+1, så 23:30 UTC är nästa dag men 22:30 UTC är inte det.
  assert.equal(svenskDatum(new Date('2026-12-31T23:30:00Z')), '2027-01-01');
  assert.equal(svenskDatum(new Date('2026-12-31T22:30:00Z')), '2026-12-31');
  assert.match(svenskDatum(), /^\d{4}-\d{2}-\d{2}$/);
});

test('veckodag är ren och UTC-baserad: 2026-09-13 är söndag, 09-16 onsdag', () => {
  assert.equal(veckodag('2026-09-13'), 0);
  assert.equal(veckodag('2026-09-14'), 1);
  assert.equal(veckodag('2026-09-16'), 3);
  assert.equal(veckodag('2026-09-19'), 6);
  assert.throws(() => veckodag('söndag'), /Ogiltigt datum/);
});

test('standardbriefdagarna är söndag och onsdag', () => {
  assert.deepEqual([...BRIEFDAGAR_STANDARD], [0, 3]);
  assert.equal(BRIEF_IKAPP_DAGAR, 5);
});

test('briefdag väg 1: aldrig körd brief → första briefronden i dag, oavsett veckodag', () => {
  const b = arBriefdag({ senaste_brief: '' }, '2026-09-14'); // måndag
  assert.equal(b.briefdag, true);
  assert.match(b.skal, /första briefronden/);
  assert.equal(b.dagarSedan, null);
  assert.equal(b.nastaBriefdag, '2026-09-16', 'nästa är onsdagen');
});

test('briefdag väg 2: söndag och onsdag är briefdagar, måndag är det inte', () => {
  const p = { senaste_brief: '2026-09-13' };
  const son = arBriefdag(p, '2026-09-13');
  assert.equal(son.briefdag, true);
  assert.match(son.skal, /söndag är briefdag/);
  assert.equal(son.nastaBriefdag, '2026-09-16');

  const man = arBriefdag(p, '2026-09-14');
  assert.equal(man.briefdag, false);
  assert.match(man.skal, /måndag är ingen briefdag/);
  assert.equal(man.dagarSedan, 1);
  assert.equal(man.nastaBriefdag, '2026-09-16');

  const ons = arBriefdag(p, '2026-09-16');
  assert.equal(ons.briefdag, true);
  assert.equal(ons.nastaBriefdag, '2026-09-20', 'nästa pekar alltid framåt, aldrig på i dag');
});

test('briefdag väg 3: fem dygn utan brief kör ändå — ikappkörning', () => {
  // Söndag 09-13 missades; fredag 09-18 är ingen briefdag men fem dygn har gått.
  const b = arBriefdag({ senaste_brief: '2026-09-13' }, '2026-09-18');
  assert.equal(b.briefdag, true);
  assert.match(b.skal, /ikappkörning/);
  assert.equal(b.dagarSedan, 5);
  // Fyra dygn räcker inte — ons→sön är fyra dygn och helt normalt.
  assert.equal(arBriefdag({ senaste_brief: '2026-09-16' }, '2026-09-19').briefdag, false);
});

test('briefdagarna går att överstyra per post och per argument — skräp faller tillbaka på standard', () => {
  const p = { senaste_brief: '2026-09-13', briefdagar: [1] }; // bara måndag
  assert.equal(arBriefdag(p, '2026-09-14').briefdag, true);
  assert.equal(arBriefdag(p, '2026-09-16').briefdag, false, 'onsdag är inte briefdag när posten säger måndag');
  assert.equal(arBriefdag(p, '2026-09-16', [3]).briefdag, true, 'argumentet vinner över posten');
  assert.deepEqual(arBriefdag({ senaste_brief: '2026-09-13', briefdagar: ['x', 9] }, '2026-09-14').briefdagar, [0, 3]);
});

test('byggRegister väver in briefdagar: post > toppnivå > standard, och senaste_brief', () => {
  const upptackta = ['a/1', 'b/1', 'c/1'].map((nyckel) => ({ nyckel, lage: 'skala', byggd: true }));
  const r = byggRegister({
    upptackta,
    drift: {
      briefdagar: [2, 5],
      poster: {
        'a/1': { briefdagar: [1], senaste_brief: '2026-09-13' },
        'b/1': { senaste_brief: '' },
      },
    },
  });
  const hitta = (n) => r.produkter.find((p) => p.nyckel === n);
  assert.deepEqual(hitta('a/1').briefdagar, [1], 'posten överstyr');
  assert.equal(hitta('a/1').senaste_brief, '2026-09-13');
  assert.deepEqual(hitta('b/1').briefdagar, [2, 5], 'toppnivån i register.json');
  assert.deepEqual(hitta('c/1').briefdagar, [2, 5], 'ny post utan driftrad ärver toppnivån, inte standarden');
  assert.equal(hitta('c/1').senaste_brief, '');
  assert.equal(hitta('c/1').redigerare_discord_id, null);
  // Utan toppnivå alls: standarden.
  assert.deepEqual(byggRegister({ upptackta: [upptackta[0]] }).produkter[0].briefdagar, [0, 3]);
});

test('register.json bär briefdagarna på toppnivå med sin förklaring', () => {
  const drift = lasDrift();
  assert.deepEqual(drift.briefdagar, [0, 3]);
  assert.match(drift.kommentar_briefdagar, /2026-09-10/);
  assert.match(drift.kommentar_briefdagar, /aldrig i cron/i);
  for (const [nyckel, p] of Object.entries(drift.poster)) {
    assert.ok('senaste_brief' in p, `${nyckel} saknar senaste_brief`);
    assert.ok('redigerare_discord_id' in p, `${nyckel} saknar redigerare_discord_id`);
    assert.ok('foralder_page_id' in (p.notion ?? {}), `${nyckel}: notion saknar foralder_page_id`);
  }
});

test('Notion-id normaliseras till uuid med bindestreck — ur rått hex, uuid och båda url-formerna', () => {
  const vantat = '3cd270ab-908c-81bd-aab8-f19ec3e2d260';
  assert.equal(normaliseraNotionId('3cd270ab908c81bdaab8f19ec3e2d260'), vantat);
  assert.equal(normaliseraNotionId('3CD270AB908C81BDAAB8F19EC3E2D260'), vantat, 'skiftläget spelar ingen roll');
  assert.equal(normaliseraNotionId(vantat), vantat, 'redan rätt form lämnas som den är');
  assert.equal(normaliseraNotionId('https://app.notion.com/p/3cd270ab908c81bdaab8f19ec3e2d260'), vantat);
  assert.equal(normaliseraNotionId('https://www.notion.so/stonebite/TankGuard-creative-hub-3cd270ab908c81bdaab8f19ec3e2d260?v=abcdef1234567890abcdef1234567890'), vantat, 'id:t efter titeln, inte vyn efter ?v=');
  assert.throws(() => normaliseraNotionId('https://www.notion.so/stonebite'), /Hittar inget Notion-id/);
  assert.throws(() => normaliseraNotionId(''), /Hittar inget Notion-id/);
});

// ------------------------------------------------------------- kontospärren

test('kontospärren nekar Bäverbutikens konto i läge SKALA', () => {
  assert.throws(() => sakerstallKonto(post({ ad_account_id: BAVERBUTIKEN_ANNONSKONTO })), /Bäverbutikens konto/);
  assert.throws(() => sakerstallOpsKonto(post({ ad_account_id: BAVERBUTIKEN_ANNONSKONTO })), /Bäverbutikens konto/);
});

test('kontospärren nekar tomt och okänt konto', () => {
  assert.throws(() => sakerstallKonto(post({ ad_account_id: '' })), /OPS-kontot är/);
  assert.throws(() => sakerstallKonto(post({ ad_account_id: '429285600005902' })), /OPS-kontot är/);
  assert.equal(sakerstallKonto(post()), OPS_ANNONSKONTO);
});

test('läge TEST kräver Bäverbutikens konto — och OPS-kontot nekas där', () => {
  const t = { nyckel: 'baverbutiken/motorholjet', lage: 'test', ad_account_id: BAVERBUTIKEN_ANNONSKONTO };
  assert.equal(sakerstallKonto(t), BAVERBUTIKEN_ANNONSKONTO);
  assert.throws(() => sakerstallKonto({ ...t, ad_account_id: OPS_ANNONSKONTO }), /läge TEST/);
});

// ------------------------------------------------------------- prefixfiltret

test('filtret släpper igenom butikens egna annonser, oavsett skiftläge', () => {
  const prefix = prefixFor(post());
  assert.ok(tillhorButiken('HEIMGUARD_SALES_20260910', prefix));
  assert.ok(tillhorButiken('HeimGuard_kamera_pain_ugc_natt_v1', prefix));
  assert.ok(tillhorButiken('heimguard_kamera_benefit_lifestyle_mamma_v2', prefix));
});

test('filtret stoppar Bäverbutikens danska kampanjer i samma konto', () => {
  const prefix = prefixFor(post());
  // De sex riktiga kampanjnamnen, avlästa ur kontot 2026-09-08.
  for (const namn of [
    'Motorhöljet DK', 'Axelbältet DK', 'Sätesöverdraget DK', 'Strandtofflorna DK',
    'Tofflorna DK | BE-ROAS 1,64 | 2026-08-19',
    'Fiskespöhållaren DK | BE-ROAS 1,52 | 2026-08-20',
  ]) {
    assert.equal(tillhorButiken(namn, prefix), false, `${namn} skulle ha släppts igenom`);
  }
});

test('filtret stoppar en ANNAN OPS-butik i samma konto', () => {
  const prefix = prefixFor(post());
  assert.equal(tillhorButiken('TANKGUARD_SALES_20260910', prefix), false);
  assert.equal(tillhorButiken('TankGuard_ibc_pain_ugc_lack_v1', prefix), false);
});

test('brandprefixet kräver ordgräns — "Heim" läser inte HeimGuards annonser', () => {
  // Utan ordgräns matchar startsWith('heim') varje HeimGuard-annons, och de två
  // butikerna delar konto. Det är den tystaste varianten av fel konto:
  // siffrorna ser helt rimliga ut.
  const heim = prefixFor(post({ brand: 'Heim', kampanjprefix: 'HEIM_', annonsprefix: 'Heim' }));
  assert.equal(tillhorButiken('HEIMGUARD_SALES_20260910', heim), false);
  assert.equal(tillhorButiken('HeimGuard_kamera_pain_ugc_v1', heim), false);
  assert.ok(tillhorButiken('HEIM_SALES_20260910', heim));
  assert.ok(tillhorButiken('Heim', heim), 'exakt brandnamn är butikens');
  assert.ok(tillhorButiken('Heim - nya kampanjen', heim), 'mellanslag och bindestreck är gränser');
});

test('i en FLERPRODUKTSBUTIK används brandnamnet aldrig som filter', () => {
  // FLERPRODUKT.md fällan 1: två produkter i samma butik delar brand, och ett
  // brandfilter hade rangordnat grannens annonser mot den här produktens
  // break-even. Bara produktens eget prefix får matcha.
  const spo = prefixFor(post({
    nyckel: 'tacklebay/fiskespohallare-4-pack', brand: 'TackleBay',
    annonsprefix: 'TackleBayRod', kampanjprefix: 'TACKLEBAYROD_', enprodukt: false,
  }));
  assert.equal(spo.includes('tacklebay'), false, 'brandet får inte vara ett filter i en flerproduktsbutik');
  assert.ok(tillhorButiken('TackleBayRod_holder_pain_ugc_v1', spo));
  assert.equal(tillhorButiken('TackleBayKalender_advent_offer_product_v1', spo), false);
  assert.equal(tillhorButiken('TackleBay_SALES_20260910', spo), false);
});

test('filtret matchar bara i BÖRJAN av namnet', () => {
  const prefix = prefixFor(post());
  assert.equal(tillhorButiken('Kopia av HEIMGUARD_SALES', prefix), false);
  assert.equal(tillhorButiken('DK HEIMGUARD test', prefix), false);
});

test('tomt eller saknat namn släpps aldrig igenom', () => {
  const prefix = prefixFor(post());
  for (const namn of ['', null, undefined]) assert.equal(tillhorButiken(namn, prefix), false);
});

test('en post utan prefix kastar i stället för att läsa hela kontot', () => {
  assert.throws(() => prefixFor(post({ brand: '', kampanjprefix: '', annonsprefix: '' })), /inget annonsprefix/);
  // prefixEllerSkal är den mjuka varianten: rapportera, kör inte.
  const mjuk = prefixEllerSkal(post({ brand: '', kampanjprefix: '', annonsprefix: '' }));
  assert.equal(mjuk.prefix, null);
  assert.match(mjuk.skal, /creative_prefix/);
});

// --------------------------------------------------------- riktiga registret

test('registret upptäcker de riktiga OPS-butikerna ur yaml + state', () => {
  const nycklar = upptackOps().filter((p) => p.byggd).map((p) => p.nyckel).sort();
  // Fem par har state-filer i repot 2026-09-09. Testet mäter att upptäckten
  // FUNGERAR, inte att antalet aldrig ändras — därför bara inklusion.
  for (const n of ['drytrek/damasker', 'hemvakten/overvakningskameran', 'tankguard/tankguard']) {
    assert.ok(nycklar.includes(n), `${n} skulle ha upptäckts ur state-filerna`);
  }
  assert.equal(nycklar.includes('testbutiken/nackmagneten'), false, 'testfixturen är inte en riktig butik');
});

test('Bäverbutikens produkter upptäcks som läge TEST med sitt eget konto', () => {
  const test = upptackTest();
  assert.ok(test.length > 0);
  for (const p of test) {
    assert.equal(p.lage, 'test');
    assert.equal(p.ad_account_id, BAVERBUTIKEN_ANNONSKONTO);
    // Linjerna kommer ur products.json och räknas ALDRIG om — det är Axels
    // COGS-beräkning för en annan verksamhet.
    assert.ok(p.linjer_ur_products_json, `${p.nyckel} saknar sina linjer`);
  }
});

test('varje post pekar på rätt konto och bär ingen ekonomi i registret', () => {
  for (const p of lasRegister().produkter) {
    assert.equal(sakerstallKonto(p), p.lage === 'test' ? BAVERBUTIKEN_ANNONSKONTO : OPS_ANNONSKONTO);
    // Ekonomin ska ha exakt ett hem. Står ett break-even-tal i registret
    // hinner det bli olikt produktfilens, och nästa rond dömer mot fel linje.
    for (const falt of ['break_even_roas', 'break_even_cpa_sek', 'target_roas', 'target_cpa_sek', 'pris']) {
      assert.equal(p[falt], undefined, `${p.nyckel}: ${falt} hör hemma i produktfilen, inte i registret`);
    }
  }
});

test('hittaPost slår upp på nyckel, produkt-id, butiks-id och brand', () => {
  for (const nyckel of ['hemvakten/overvakningskameran', 'overvakningskameran', 'hemvakten', 'HeimGuard', 'heimguard']) {
    assert.equal(hittaPost(nyckel).nyckel, 'hemvakten/overvakningskameran');
  }
  assert.throws(() => hittaPost('finns-inte'), /Okänd butik\/produkt/);
});

test('en flerproduktsbutik slås ALDRIG upp på butiks-id — den kastar', () => {
  // Två produkter i TackleBay. Att gissa vilken hade gett en rond mot fel
  // break-even, och det syns inte som ett fel.
  assert.throws(() => hittaPost('tacklebay'), /matchar 2 poster/);
  assert.equal(hittaPost('tacklebay/fiskespohallare-4-pack').id, 'fiskespohallare-4-pack');
});

test('laddaButik ger butikens egna linjer, räknade ur produktfilen — båda momsvägarna', () => {
  const b = laddaButik('hemvakten/overvakningskameran');
  assert.equal(b.ekonomi.utanMoms.breakEvenRoas, 1.49);
  assert.equal(b.ekonomi.medMoms.breakEvenRoas, 2.11);
  assert.deepEqual(b.prefix.sort(), ['heimguard', 'heimguard_']);
});

test('läge TEST laddar Bäverbutikens linjer utan att räkna om dem', () => {
  const b = laddaButik('baverbutiken/motorholjet');
  assert.equal(b.ekonomi.breakEvenRoas, 1.63);
  assert.equal(b.ekonomi.breakEvenCpa, 210);
  assert.equal(b.ekonomi.antagande, 'baverbutiken');
  assert.equal(b.butik, null, 'Bäverbutiken har ingen butikskonfig i factory/');
});

test('en testprodukt utan creative_prefix stoppar ronden i stället för att läsa hela kontot', () => {
  // ai-glasogon och vaggfastet saknar creative_prefix i products.json
  // (avläst 2026-09-09). Utan prefix läses HELA Bäverbutikens konto.
  const b = laddaButik('baverbutiken/ai-glasogon');
  assert.equal(b.prefix, null);
  assert.match(b.prefixfel, /creative_prefix/);
});

test('tröskeln bär sin källa och sitt öppna beslut med sig', () => {
  assert.equal(TROSKEL.spend_sek, 1500);
  assert.equal(TROSKEL.vinst_procent, 20);
  assert.match(TROSKEL.kalla, /agent\/rond\.mjs/);
  assert.match(TROSKEL.beslut, /TRAPPAN\.md/);
});

test('redigerareFor hittar aldrig på en person', () => {
  // factory/redigerare/standby.md har noll rader (avläst 2026-09-09), så det
  // finns ingen att peka ut. Tomt ska bli null, aldrig ett namn.
  assert.equal(redigerareFor({ redigerare: null }), null);
  assert.equal(redigerareFor({ redigerare: '   ' }), null);
  assert.equal(redigerareFor({}), null);
  assert.equal(redigerareFor({ redigerare: 'Josh' }), 'Josh');
});
