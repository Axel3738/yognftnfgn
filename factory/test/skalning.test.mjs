// Tester för skalningsronden: ANALYSMETOD-räkningarna, klassificeringen,
// butiksfiltret, tröskeln och startskottet. Inga nätanrop.
//
// Två saker testas hårdare än resten, för att båda har kostat pengar förut:
//  • att rangordningen sker på VINSTBIDRAG och aldrig på ROAS eller CPA
//    ensamt (ANALYSMETOD steg 4 — en tidigare chatt dömde ut top spendern
//    som stod för ~50 % av all vinst),
//  • att en annons vars dom hänger på det obesvarade momsbeslutet får domen
//    "beror på momsbeslutet" i stället för ett godtyckligt kill.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalisera, trasigaRader, arBedombar, vinstbidrag, plockaAction,
  domlinjer, klassificera, vinstProcent, troskelkoll, filtreraPaPrefix,
  byggRapport, testrapport,
  GRIND_SPEND_SEK, GRIND_KOP, KILL_SPEND_SEK, PRELIMINAR_KOP,
} from '../skalning.mjs';
import {
  formateraStartskott, saknadeFalt, startskottHarGatt, byggLoggrad,
  STARTSKOTT_KOD, KALLA_URL_PLATSHALLARE,
} from '../startskott.mjs';
import { raknaEkonomi } from '../ekonomi.mjs';
import { tillhorButiken, prefixFor, TROSKEL, BAVERBUTIKEN_ANNONSKONTO } from '../register.mjs';

const rad = (o = {}) => normalisera({
  ad_id: '1', ad_name: 'HEIMGUARD_a', campaign_name: 'HEIMGUARD_SALES', adset_name: 'broad',
  spend: '1000', impressions: '50000', clicks: '500', ctr: '1', cpm: '20', frequency: '1.2',
  actions: [{ action_type: 'omni_purchase', value: '5' }],
  action_values: [{ action_type: 'omni_purchase', value: '4000' }],
  purchase_roas: [{ action_type: 'omni_purchase', value: '4' }],
  cost_per_action_type: [{ action_type: 'omni_purchase', value: '200' }],
  video_play_actions: [{ action_type: 'video_view', value: '25000' }],
  video_p50_watched_actions: [{ action_type: 'video_view', value: '10000' }],
  ...o,
});

// HeimGuards riktiga tal: break-even-CPA 378 med moms, 538 utan.
const obeslutat = raknaEkonomi({ pris: 799, inkopskostnad: 261 });
const utanMoms = raknaEkonomi({ pris: 799, inkopskostnad: 261, momsAntagen: false });

// ------------------------------------------------------- ANALYSMETOD-räkningar

test('normalisera plockar rätt fält ur Graphs actions-listor', () => {
  const r = rad();
  assert.equal(r.amount_spent, 1000);
  assert.equal(r.kop, 5);
  assert.equal(r.cpa, 200);
  assert.equal(r.purchase_roas, 4);
  assert.equal(r.intakt, 4000);      // spend × ROAS
  assert.equal(r.hook_rate, 0.5);    // 25000 / 50000
  assert.equal(r.hold, 0.4);         // 10000 / 25000
  assert.equal(r.cvr, 0.01);         // 5 / 500
});

test('plockaAction faller tillbaka på purchase när omni_purchase saknas', () => {
  assert.equal(plockaAction([{ action_type: 'purchase', value: '7' }], 'omni_purchase', 'purchase'), 7);
  assert.equal(plockaAction([], 'omni_purchase'), 0);
  assert.equal(plockaAction(undefined, 'omni_purchase'), 0);
});

test('steg 1: rader där omni_purchase_values inte stämmer med spend × ROAS flaggas', () => {
  // Det verkliga felet i Bäverbutiken 2026-08-05: fältet 100× för lågt.
  const trasig = rad({ action_values: [{ action_type: 'omni_purchase', value: '40' }] });
  assert.equal(trasigaRader([rad(), trasig]).length, 1);
  assert.equal(trasigaRader([rad()]).length, 0);
});

test('steg 2: signifikansgrinden kräver BÅDE spend och köp', () => {
  assert.equal(arBedombar(rad()), true);
  // ROAS 9,2 på 38 kr och 1 köp är brus, inte en vinnare.
  const brus = rad({
    spend: '38',
    actions: [{ action_type: 'omni_purchase', value: '1' }],
    purchase_roas: [{ action_type: 'omni_purchase', value: '9.22' }],
  });
  assert.equal(arBedombar(brus), false);
  assert.equal(arBedombar(rad({ spend: '5000', actions: [] })), false);
  assert.equal(GRIND_SPEND_SEK, 300);
  assert.equal(GRIND_KOP, 3);
});

test('steg 4: vinstbidrag rangordnar top spendern över den med högst ROAS', () => {
  // Motorhölje-fallet ur ANALYSMETOD, räknat med break-even-CPA 378.
  const topSpender = rad({
    spend: '12240',
    actions: [{ action_type: 'omni_purchase', value: '76' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '161' }],
    purchase_roas: [{ action_type: 'omni_purchase', value: '2.51' }],
  });
  const hogRoas = rad({
    spend: '712',
    actions: [{ action_type: 'omni_purchase', value: '8' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '89' }],
    purchase_roas: [{ action_type: 'omni_purchase', value: '4.53' }],
  });
  assert.ok(vinstbidrag(topSpender, 378) > vinstbidrag(hogRoas, 378) * 5,
    'annonsen med LÄGST ROAS tjänar klart mest pengar');
  // En annons över break-even-CPA ger negativt vinstbidrag — kill-signalen.
  assert.ok(vinstbidrag(rad({ cost_per_action_type: [{ action_type: 'omni_purchase', value: '500' }] }), 378) < 0);
});

test('vinstbidrag kastar utan break-even-linje i stället för att nolla tabellen', () => {
  // Ett tyst 0 hade gett en tabell full av nollor som läses som "ingen tjänade
  // något" i stället för "vi vet inte vad linjen är".
  assert.throws(() => vinstbidrag(rad(), null), /break-even-CPA saknas/);
  assert.throws(() => vinstbidrag(rad(), 0), /break-even-CPA saknas/);
});

// ------------------------------------------------------------ klassificeringen

test('domlinjer ger ETT tal när antagandet finns och TVÅ när det saknas', () => {
  const en = domlinjer(utanMoms);
  assert.equal(en.strang, 538);
  assert.equal(en.generos, 538);
  assert.equal(en.obeslutat, false);

  const tva = domlinjer(obeslutat);
  assert.equal(tva.strang, 378);
  assert.equal(tva.generos, 538);
  assert.equal(tva.obeslutat, true);
  // Skalningsförslag vilar på den STRÄNGASTE targeten när beslutet saknas.
  assert.equal(tva.target, 218);
});

test('en annons under break-even på BÅDA linjerna är en vinnare', () => {
  const r = rad({
    spend: '3000',
    actions: [{ action_type: 'omni_purchase', value: '20' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '150' }],
  });
  const d = klassificera(r, obeslutat);
  assert.equal(d.klass, 'vinnare');
  assert.equal(d.skalningskandidat, true, 'CPA 150 är under target 218 också');
  assert.ok(d.vinst_strang > 0 && d.vinst_generos > 0);
  assert.ok(d.vinst_generos > d.vinst_strang, 'den generösa linjen ger högre vinstbidrag');
});

test('en annons MELLAN linjerna får domen "beror på momsbeslutet" — aldrig kill', () => {
  // CPA 450 ligger över 378 (med moms) men under 538 (utan moms). Att välja
  // linje åt Axel här är precis vad BESLUT-VANTAR.md punkt 1 förbjuder.
  const r = rad({
    spend: '4500',
    actions: [{ action_type: 'omni_purchase', value: '10' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '450' }],
  });
  const d = klassificera(r, obeslutat);
  assert.equal(d.klass, 'beror_pa_moms');
  assert.match(d.motivering, /MELLAN linjerna/);
  assert.ok(d.vinst_strang < 0 && d.vinst_generos > 0, 'linjerna säger olika saker om vinsten');

  // Med antagandet satt försvinner tvetydigheten och domen blir en riktig dom.
  assert.equal(klassificera(r, utanMoms).klass, 'vinnare');
});

test('över break-even på båda linjerna: kill-kandidat först efter 500 kr spend', () => {
  const dyr = (spend, kop) => rad({
    spend: String(spend),
    actions: [{ action_type: 'omni_purchase', value: String(kop) }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: String(spend / kop) }],
  });
  // 400 kr spend, 4 köp, CPA 100 → vinnare. Vi vill ha CPA över 538.
  const knappt = klassificera(dyr(2100, 3), obeslutat);   // CPA 700, spend 2100
  assert.equal(knappt.klass, 'forlorare');

  // Samma CPA men under kill-grinden: bevaka, aldrig pausa.
  const litet = rad({
    spend: '450',
    actions: [{ action_type: 'omni_purchase', value: '4' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '700' }],
  });
  const d = klassificera(litet, obeslutat);
  assert.equal(d.klass, 'bevaka');
  assert.match(d.motivering, new RegExp(`≥${KILL_SPEND_SEK} kr`));
});

test('en dom på 3–4 köp är PRELIMINÄR (ANALYSMETOD steg 2c)', () => {
  const tre = rad({
    spend: '450',
    actions: [{ action_type: 'omni_purchase', value: '3' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '150' }],
  });
  const d = klassificera(tre, obeslutat);
  assert.equal(d.preliminar, true);
  assert.match(d.motivering, /PRELIMINÄR/);
  assert.equal(PRELIMINAR_KOP, 5);

  const fem = rad({
    spend: '750',
    actions: [{ action_type: 'omni_purchase', value: '5' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '150' }],
  });
  assert.equal(klassificera(fem, obeslutat).preliminar, false);
});

test('under grinden faller ingen dom alls — och det står varför', () => {
  const brus = rad({
    spend: '38',
    actions: [{ action_type: 'omni_purchase', value: '1' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '38' }],
  });
  const d = klassificera(brus, obeslutat);
  assert.equal(d.klass, 'for_tidigt');
  assert.equal(d.vinst_generos, null, 'en rad utan dom får inget vinstbidrag att rangordnas på');
  assert.match(d.motivering, /under grinden/);
});

test('utan break-even blir domen "oklart", aldrig ett kill', () => {
  const d = klassificera(rad(), raknaEkonomi({ pris: 300, inkopskostnad: 310 }));
  assert.equal(d.klass, 'oklart');
  assert.match(d.motivering, /ingen dom kan avges/);
});

// ------------------------------------------------------------------ rapporten

const butik = (lage, ekonomi) => ({
  post: {
    nyckel: 'hemvakten/overvakningskameran', namn: 'HeimGuard-kameran', lage,
    ad_account_id: '915422744950975', produktfil: 'factory/produkter/overvakningskameran.yaml',
    troskel: TROSKEL, kordag_offset: 0, senaste_korning: '',
  },
  ekonomi,
});

const hamtning = (rader) => ({
  rader, totalt: rader.length, slangda: 0, slangdaKampanjer: [], behallnaKampanjer: ['HEIMGUARD_SALES'],
  baraAnnonsnamn: [], prefix: ['heimguard_'], period: 'last_14d',
});

test('rapporten rangordnar på vinstbidrag och grupperar klasserna', () => {
  const vinnare = rad({
    ad_name: 'vinnare', spend: '12000',
    actions: [{ action_type: 'omni_purchase', value: '80' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '150' }],
  });
  const liten = rad({
    ad_name: 'liten', spend: '600',
    actions: [{ action_type: 'omni_purchase', value: '5' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '120' }],
    purchase_roas: [{ action_type: 'omni_purchase', value: '9.2' }],
  });
  const r = byggRapport(butik('skala', utanMoms), hamtning([vinnare, liten]));
  assert.deepEqual(r.bedombara.map((x) => x.namn), ['vinnare', 'liten'],
    'top spendern rankas först — den tjänar mest pengar, trots lägst ROAS');
  assert.equal(r.vinnare.length, 2);
  assert.equal(r.forlorare.length, 0);
  assert.equal(r.totalSpend, 12600);
  assert.equal(r.totalKop, 85);
});

test('rapporten säger till när rangordningen inte är robust mot momsbeslutet', () => {
  // A tjänar mest utan moms, B tjänar mest med moms. Då är ordningen inte
  // robust, och en budgetflytt på den ronden vore en gissning.
  const a = rad({
    ad_name: 'A', spend: '5000',
    actions: [{ action_type: 'omni_purchase', value: '10' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '380' }],
  });
  const b = rad({
    ad_name: 'B', spend: '3000',
    actions: [{ action_type: 'omni_purchase', value: '20' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '150' }],
  });
  const r = byggRapport(butik('skala', obeslutat), hamtning([a, b]));
  assert.equal(r.linjer.obeslutat, true);
  assert.ok(r.totalVinstGeneros > r.totalVinstStrang);
  // Båda kolumnerna finns på varje rad — ingen linje är gömd.
  for (const x of r.bedombara) {
    assert.equal(typeof x.dom.vinst_strang, 'number');
    assert.equal(typeof x.dom.vinst_generos, 'number');
  }
});

test('för tidigt-högen hamnar utanför rankingen', () => {
  const brus = rad({ ad_name: 'brus', spend: '38', actions: [{ action_type: 'omni_purchase', value: '1' }] });
  const r = byggRapport(butik('skala', utanMoms), hamtning([rad({ ad_name: 'ok' }), brus]));
  assert.deepEqual(r.forTidigt.map((x) => x.namn), ['brus']);
  assert.equal(r.bedombara.some((x) => x.namn === 'brus'), false);
});

// ------------------------------------------------------------------ filtret

test('filtret behåller butikens rader och redovisar vad som slängdes', () => {
  const prefix = prefixFor({ nyckel: 'h/o', brand: 'HeimGuard', annonsprefix: 'HeimGuard', kampanjprefix: 'HEIMGUARD_', enprodukt: true });
  const f = filtreraPaPrefix([
    { ad_name: 'HeimGuard_a', campaign_name: 'HEIMGUARD_SALES' },
    { ad_name: 'Motorhölje_PD_1_H3', campaign_name: 'Motorhöljet DK' },
    { ad_name: 'HeimGuard_b', campaign_name: 'Strandtofflorna DK' },
  ], prefix, tillhorButiken);
  assert.equal(f.behall.length, 2);
  assert.equal(f.slangda, 1);
  assert.deepEqual(f.slangdaKampanjer, ['Motorhöljet DK']);
  // En annons med butikens prefix i NÅGON ANNANS kampanj ska synas — den är
  // antingen felplacerad eller en felaktig träff.
  assert.deepEqual(f.baraAnnonsnamn, ['HeimGuard_b (i "Strandtofflorna DK")']);
});

// ------------------------------------------------------------------ tröskeln

test('vinstProcent är samma formel som den körande rutinen använder', () => {
  // agent/besked.mjs: (1/breakEven − 1/roas) × 100.
  assert.ok(Math.abs(vinstProcent(1.63, 2.51) - 21.5) < 0.2);
  assert.equal(vinstProcent(1.63, 0), null, 'ingen ROAS ⇒ ingen vinst att räkna');
  assert.equal(vinstProcent(null, 2.5), null);
  assert.equal(vinstProcent(1, 2.5), null, 'break-even 1 är inte en riktig linje');
});

test('tröskeln kräver BÅDE spend och vinst', () => {
  const bas = { spend: 4232, kop: 27, roas: 2.51, breakEvenRoas: 1.63 };
  const ok = troskelkoll(bas);
  assert.equal(ok.passerad, true);
  assert.ok(ok.vinstProcent > 20);

  assert.equal(troskelkoll({ ...bas, spend: 900 }).passerad, false, 'för lite spend');
  assert.equal(troskelkoll({ ...bas, roas: 1.7 }).passerad, false, 'för låg vinst');
  assert.equal(troskelkoll({ ...bas, spend: 900 }).spendOk, false);
});

test('utan break-even fälls ingen dom — och tröskeln säger det rakt ut', () => {
  const d = troskelkoll({ spend: 9000, kop: 40, roas: 3, breakEvenRoas: null });
  assert.equal(d.passerad, false);
  assert.match(d.skal, /Break-even-ROAS saknas/);
  const utanKop = troskelkoll({ spend: 9000, kop: 0, roas: 0, breakEvenRoas: 1.63 });
  assert.equal(utanKop.passerad, false);
  assert.match(utanKop.skal, /går inte att räkna/);
});

test('tröskelnivån kan överstyras per butik utan att koden ändras', () => {
  const bas = { spend: 1200, kop: 8, roas: 2.2, breakEvenRoas: 1.63 };
  assert.equal(troskelkoll(bas).passerad, false, 'standardtröskeln kräver 1500 kr');
  assert.equal(troskelkoll(bas, { spend_sek: 1000, vinst_procent: 10 }).passerad, true);
});

// ------------------------------------------------------------ läge TEST

const testbutik = {
  post: {
    nyckel: 'baverbutiken/motorholjet', namn: 'Motorhöljet (Bäverbutiken)', lage: 'test',
    ad_account_id: BAVERBUTIKEN_ANNONSKONTO, troskel: TROSKEL,
  },
  ekonomi: { breakEvenRoas: 1.63, breakEvenCpa: 210, brutto: 342, antagande: 'baverbutiken' },
};

test('läge TEST skjuter startskottet när tröskeln passeras', () => {
  const r = byggRapport(testbutik, hamtning([rad({
    ad_name: 'Enginecover_PD_1_H3', campaign_name: 'Motorhöljet',
    spend: '4232',
    actions: [{ action_type: 'omni_purchase', value: '27' }],
    purchase_roas: [{ action_type: 'omni_purchase', value: '2.51' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '157' }],
  })]));
  const t = testrapport(r, { kallaUrl: 'https://bäverbutiken.se/products/motorholje' });
  assert.equal(t.koll.passerad, true);
  assert.match(t.startskott, /KLAR FÖR OPS: Motorhöljet \(Bäverbutiken\)/);
  assert.match(t.startskott, /\/ny-ops https:\/\/bäverbutiken\.se\/products\/motorholje/);
  assert.equal(t.saknas.length, 0);
});

test('läge TEST tiger när tröskeln inte är passerad — inga briefer, inget larm', () => {
  const r = byggRapport(testbutik, hamtning([rad({
    ad_name: 'Enginecover_PD_1_H3', spend: '600',
    actions: [{ action_type: 'omni_purchase', value: '3' }],
    purchase_roas: [{ action_type: 'omni_purchase', value: '1.4' }],
    cost_per_action_type: [{ action_type: 'omni_purchase', value: '200' }],
  })]));
  const t = testrapport(r);
  assert.equal(t.koll.passerad, false);
  assert.equal(t.startskott, null);
});

// --------------------------------------------------------------- startskottet

test('startskottet vägrar när ett tal saknas — hellre inget meddelande än ett hål', () => {
  assert.deepEqual(saknadeFalt({}).length > 0, true);
  assert.throws(() => formateraStartskott({ produkt: 'X' }), /saknade fält/);
  // 0 är ett tal, om än ett dåligt — det får inte räknas som saknat.
  assert.equal(saknadeFalt({
    produkt: 'X', kampanj_id: '1', spend_total: 0, kop: 0, cpa: 0,
    break_even_cpa: 210, roas: 0, vinst_procent: 0,
  }).length, 0);
});

test('startskottet skriver en platshållare för källänken i stället för att tiga', () => {
  // Grenen jlmcm5 krävde kalla_url. Utfallet blev tystnad när registret saknar
  // länken — och tystnad är det enda som är sämre än en lucka.
  const text = formateraStartskott({
    produkt: 'Motorhöljet', kampanj_id: '120249435814310291',
    spend_total: 4232, kop: 27, cpa: 157, break_even_cpa: 210, roas: 2.41, vinst_procent: 24.3,
  });
  assert.match(text, new RegExp(KALLA_URL_PLATSHALLARE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(text, /Källänken står inte i registret/);
  // Talen skrivs på svenskt format, en mening per rad (Axels svarsformat).
  // \s i mönstret: toLocaleString('sv-SE') använder ett hårt mellanslag (U+00A0).
  assert.match(text, /- Spend: 4\s232 kr/);
  assert.match(text, /- ROAS: 2,41/);
  assert.match(text, /- Vinst: 24,3 % av omsättningen/);
});

test('startskottet går bara en gång per kampanj', () => {
  // Ett larm som kommer varje rond slutar folk läsa.
  const logg = [{ kampanj_id: '120249435814310291', genomford: true, kod: STARTSKOTT_KOD }];
  assert.equal(startskottHarGatt(logg, '120249435814310291'), true);
  assert.equal(startskottHarGatt(logg, '999'), false);
  assert.equal(startskottHarGatt([{ kampanj_id: '1', genomford: false, kod: STARTSKOTT_KOD }], '1'), false);
  assert.equal(startskottHarGatt(null, '1'), false);
});

test('loggraden bär ALDRIG ny_budget — den skulle frysa kampanjen i tre dygn', () => {
  // agent/logg.mjs: dagarSedanAndring räknar rader med genomford: true OCH ett
  // ändligt ny_budget. Fältet här hade gjort startskottet till en
  // budgetändring i kadensspärrens ögon.
  const rad = byggLoggrad({
    produkt: 'Motorhöljet', kampanj_id: '1', spend_total: 4232, kop: 27,
    cpa: 157, break_even_cpa: 210, roas: 2.41, vinst_procent: 24.3,
  }, { datum: '2026-09-09' });
  assert.equal(rad.ny_budget, undefined);
  assert.equal(rad.kod, STARTSKOTT_KOD);
  assert.equal(rad.genomford, true);
  assert.equal(rad.datum, '2026-09-09');
  assert.throws(() => byggLoggrad({}, { datum: '2026-09-09' }), /saknade fält/);
  assert.throws(() => byggLoggrad({ produkt: 'X' }, {}), /kräver ett datum/);
});
