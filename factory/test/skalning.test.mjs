// Tester för butiksfiltret på det DELADE annonskontot och för
// ANALYSMETOD-räkningarna i factory/skalning.mjs. Inga nätanrop.
//
// Filtret är den dyraste regeln i hela OPS-fabriken: kontot
// MagiBorsten DK 915422744950975 bär alla OPS-butiker OCH Bäverbutikens
// danska kampanjer (avläst 2026-09-08: 69 annonser, samtliga Bäverbutikens).
// Går filtret sönder rangordnas en annan verksamhets annonser mot den här
// butikens break-even — och det syns inte som ett fel, bara som konstig data.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalisera, trasigaRader, arBedombar, vinstbidrag, plockaAction,
  GRIND_SPEND_SEK, GRIND_KOP,
} from '../skalning.mjs';
import {
  tillhorButiken, prefixFor, sakerstallOpsKonto,
  OPS_ANNONSKONTO, BAVERBUTIKEN_ANNONSKONTO, hittaPost, laddaButik, lasRegister,
} from '../register.mjs';

const post = () => ({
  butik: 'hemvakten', brand: 'HeimGuard',
  kampanjprefix: 'HEIMGUARD_', annonsprefix: 'HeimGuard_',
  ad_account_id: OPS_ANNONSKONTO,
});

// ------------------------------------------------------------- butiksfiltret

test('filtret släpper igenom butikens egna annonser, oavsett skiftläge', () => {
  const prefix = prefixFor(post());
  assert.ok(tillhorButiken('HEIMGUARD_SALES_20260910', prefix));
  assert.ok(tillhorButiken('HeimGuard_kamera_TR_ugc_natt_v1', prefix));
  assert.ok(tillhorButiken('heimguard_kamera_SR_lifestyle_mamma_v2', prefix));
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
  // Alla OPS-butiker delar konto — grannbutikens annonser är lika farliga
  // som Bäverbutikens, och lika lätta att råka läsa.
  const prefix = prefixFor(post());
  assert.equal(tillhorButiken('TANKGUARD_SALES_20260910', prefix), false);
  assert.equal(tillhorButiken('TankGuard_ibc_PD_ugc_lack_v1', prefix), false);
});

test('brandprefixet kräver ordgräns — "Heim" läser inte HeimGuards annonser', () => {
  // Utan ordgräns matchar startsWith('heim') varje HeimGuard-annons, och de
  // två butikerna delar konto. Detta är den tystaste varianten av fel konto:
  // siffrorna ser helt rimliga ut.
  const heim = prefixFor({ butik: 'heim', brand: 'Heim', kampanjprefix: 'HEIM_', annonsprefix: 'Heim_' });
  assert.equal(tillhorButiken('HEIMGUARD_SALES_20260910', heim), false);
  assert.equal(tillhorButiken('HeimGuard_kamera_TR_ugc_v1', heim), false);
  // Men sina egna hittar den.
  assert.ok(tillhorButiken('HEIM_SALES_20260910', heim));
  assert.ok(tillhorButiken('Heim_lampa_PD_v1', heim));
  assert.ok(tillhorButiken('Heim', heim), 'exakt brandnamn är butikens');
  assert.ok(tillhorButiken('Heim - nya kampanjen', heim), 'mellanslag och bindestreck är gränser');
});

test('ordgränsen släpper igenom HeimGuards egna namnformer', () => {
  const prefix = prefixFor(post());
  for (const namn of [
    'HEIMGUARD_SALES_20260910',
    'HeimGuard_kamera_TR_ugc_natt_v1',
    'HEIMGUARD | BE-ROAS 2,11 | 2026-09-10',
    'HeimGuard',
  ]) {
    assert.ok(tillhorButiken(namn, prefix), `${namn} är butikens och ska släppas igenom`);
  }
});

test('filtret matchar bara i BÖRJAN av namnet', () => {
  // "Kopia av HEIMGUARD_…" är inte butikens kampanj förrän någon döpt om den.
  const prefix = prefixFor(post());
  assert.equal(tillhorButiken('Kopia av HEIMGUARD_SALES', prefix), false);
  assert.equal(tillhorButiken('DK HEIMGUARD test', prefix), false);
});

test('tomt eller saknat namn släpps aldrig igenom', () => {
  const prefix = prefixFor(post());
  for (const namn of ['', null, undefined]) {
    assert.equal(tillhorButiken(namn, prefix), false);
  }
});

test('en post utan prefix kastar i stället för att läsa hela kontot', () => {
  assert.throws(
    () => prefixFor({ butik: 'x', brand: '', kampanjprefix: '', annonsprefix: '' }),
    /inget brandprefix/
  );
});

// ------------------------------------------------------------- kontospärren

test('kontospärren nekar Bäverbutikens konto', () => {
  assert.throws(
    () => sakerstallOpsKonto({ ...post(), ad_account_id: BAVERBUTIKEN_ANNONSKONTO }),
    /Bäverbutikens konto/
  );
});

test('kontospärren nekar tomt och okänt konto', () => {
  assert.throws(() => sakerstallOpsKonto({ ...post(), ad_account_id: '' }), /OPS-kontot är/);
  assert.throws(() => sakerstallOpsKonto({ ...post(), ad_account_id: '429285600005902' }), /OPS-kontot är/);
  assert.equal(sakerstallOpsKonto(post()), OPS_ANNONSKONTO);
});

// ------------------------------------------------------------- registret

test('registret slår upp på produkt-id, butiks-id och brandnamn', () => {
  for (const nyckel of ['overvakningskameran', 'hemvakten', 'HeimGuard', 'heimguard']) {
    assert.equal(hittaPost(nyckel).butik, 'hemvakten');
  }
  assert.throws(() => hittaPost('motorholjet'), /Okänd OPS-butik/);
});

test('varje post i registret pekar på OPS-kontot och har ekonomi i YAML:en, inte i registret', () => {
  for (const p of lasRegister().produkter) {
    assert.equal(sakerstallOpsKonto(p), OPS_ANNONSKONTO);
    // Ekonomin ska ha exakt ett hem. Står ett break-even-tal i registret
    // hinner det bli olikt produktfilens, och nästa körning dömer mot fel linje.
    for (const falt of ['break_even_roas', 'break_even_cpa_sek', 'target_roas', 'target_cpa_sek', 'aov_sek', 'pris']) {
      assert.equal(p[falt], undefined, `${p.id}: ${falt} hör hemma i produktfilen, inte i registret`);
    }
  }
});

test('registrets prefix och budget stämmer med produktfilens', () => {
  // De två fälten står med flit på två ställen (ops.mjs läser produktfilen,
  // skalningen läser registret). Testet finns för att de inte ska glida isär
  // tyst — ett prefix som bara ändrats på ett ställe gör butikens annonser
  // osynliga för nästa avläsning.
  for (const p of lasRegister().produkter) {
    const { produkt } = laddaButik(p.id);
    const iFil = produkt?.meta?.creative_prefix;
    if (iFil) {
      assert.equal(
        p.annonsprefix.replace(/_$/, '').toLowerCase(), iFil.replace(/_$/, '').toLowerCase(),
        `${p.id}: registrets annonsprefix och produktfilens creative_prefix skiljer sig`
      );
    }
    const budgetIFil = produkt?.meta?.testbudget_per_dag;
    if (budgetIFil) {
      assert.equal(p.daily_budget_sek, budgetIFil, `${p.id}: dagsbudgeten skiljer sig mellan register och produktfil`);
    }
  }
});

test('laddaButik ger butikens egna linjer, räknade ur butikens momsläge', () => {
  // HeimGuard säljer UTAN moms (Axels besked 2026-09-08) — marginalen rakt
  // på priset: 799 − 261 = 538 kr täckningsbidrag.
  const b = laddaButik('hemvakten');
  assert.equal(b.ekonomi.momsProcent, 0);
  assert.equal(b.ekonomi.breakEvenRoas, 1.49);
  assert.equal(b.ekonomi.breakEvenCpa, 538);
  assert.equal(b.ekonomi.targetRoas, 2.36);
  assert.equal(b.ekonomi.targetCpa, 338);
  // Talen ligger nära Bäverbutikens men är räknade härifrån. Skulle någon
  // sätta moms_i_pris av misstag hoppar break-even till 2,11 — det ska synas.
  assert.notEqual(b.ekonomi.breakEvenRoas, 2.11);
});

// ------------------------------------------------------- ANALYSMETOD-räkningar

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
  const mycketSpendUtanKop = rad({ spend: '5000', actions: [] });
  assert.equal(arBedombar(mycketSpendUtanKop), false);
  assert.equal(GRIND_SPEND_SEK, 300);
  assert.equal(GRIND_KOP, 3);
});

test('steg 4: vinstbidrag rangordnar top spendern över den med högst ROAS', () => {
  // Motorhölje-fallet ur ANALYSMETOD, med HeimGuards break-even-CPA 378.
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
  const vinstTop = vinstbidrag(topSpender, 378);
  const vinstHog = vinstbidrag(hogRoas, 378);
  assert.ok(vinstTop > vinstHog * 5, 'annonsen med LÄGST ROAS tjänar klart mest pengar');
  // En annons över break-even-CPA ger negativt vinstbidrag — det är kill-signalen.
  const forlust = rad({ cost_per_action_type: [{ action_type: 'omni_purchase', value: '500' }] });
  assert.ok(vinstbidrag(forlust, 378) < 0);
});

test('vinstbidrag kastar utan break-even-linje i stället för att nolla tabellen', () => {
  // Ett tyst 0 hade gett en tabell full av nollor som läses som "ingen tjänade
  // något" i stället för "vi vet inte vad linjen är".
  assert.throws(() => vinstbidrag(rad(), null), /break-even-CPA saknas/);
  assert.throws(() => vinstbidrag(rad(), 0), /break-even-CPA saknas/);
});
