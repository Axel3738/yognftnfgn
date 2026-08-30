import { test } from 'node:test';
import assert from 'node:assert/strict';
import { annonsbehov, annonskvot, bedomKampanj, breakEvenForPost, kontrolleraKonto, planera, rapport, rundkvot, TILLATET_KONTO } from '../rond.mjs';

const bas = () => ({
  hamtad: '2026-08-28T07:00:00Z',
  ad_account_id: TILLATET_KONTO,
  ad_account_namn: 'MagiBorsten',
  idag: '2026-08-28',
  kampanjer: [{ id: '1', namn: 'X | BE ROAS 1.50' }],
});

test('rätt konto släpps igenom', () => {
  assert.deepEqual(kontrolleraKonto(bas()), []);
  assert.deepEqual(kontrolleraKonto({ ...bas(), ad_account_id: `act_${TILLATET_KONTO}` }), []);
});

test('Grillklinikens konto stoppas', () => {
  // SnarkLös / Grillkliniken. Fel konto kostar riktiga pengar — CLAUDE.md.
  const fel = kontrolleraKonto({ ...bas(), ad_account_id: '1346450049878358', ad_account_namn: 'SnarkLös' });
  assert.ok(fel.length >= 1);
  assert.match(fel.join(' '), /Fel annonskonto/);
});

test('rätt konto-id men fel kontonamn stoppas också', () => {
  const fel = kontrolleraKonto({ ...bas(), ad_account_namn: 'SnarkLös' });
  assert.match(fel.join(' '), /Kontonamnet är/);
});

test('tom kampanjlista stoppas i stället för att ge en tom rapport', () => {
  assert.match(kontrolleraKonto({ ...bas(), kampanjer: [] }).join(' '), /Noll kampanjer/);
  assert.match(kontrolleraKonto({ ...bas(), kampanjer: undefined }).join(' '), /Noll kampanjer/);
});

test('data utan tidsstämpel stoppas', () => {
  const utan = { ...bas() };
  delete utan.hamtad;
  assert.match(kontrolleraKonto(utan).join(' '), /tidsstämpel/);
});

test('orimlig ROAS ger ingen dom alls', () => {
  const rad = bedomKampanj(
    {
      id: '1', namn: 'X | BE ROAS 1.50', daily_budget: '1 000,00 kr (SEK)',
      spend_3d: '1 000,00 kr', roas_3d: '412.5', kop_3d: 10,
    },
    { logg: [], idag: '2026-08-28', karta: {} },
  );
  assert.equal(rad.dom.kod, 'ORIMLIG_DATA');
  assert.equal(rad.dom.nyBudget, null);
});

test('kampanj utan post i produktkartan körs som testprodukt', () => {
  const rad = bedomKampanj(
    {
      id: '1', namn: 'X | BE ROAS 1.50', daily_budget: '1 000,00 kr (SEK)',
      spend_3d: '1 000,00 kr', roas_3d: '1.20', kop_3d: 10, spend_total: '900,00 kr',
    },
    { logg: [], idag: '2026-08-28', karta: {} },
  );
  assert.equal(rad.lage, 'test');
  assert.equal(rad.dom.kod, 'VANTA_TROSKEL');
});

test('produktkartan kan sätta läget till drift', () => {
  const rad = bedomKampanj(
    {
      id: '1', namn: 'X | BE ROAS 1.50', daily_budget: '2 000,00 kr (SEK)',
      spend_3d: '1 000,00 kr', roas_3d: '1.20', kop_3d: 10, spend_total: '90 000,00 kr',
    },
    { logg: [], idag: '2026-08-28', karta: { 1: { campaign_id: '1', lage: 'drift' } } },
  );
  assert.equal(rad.lage, 'drift');
  assert.equal(rad.dom.kod, 'HALVERA');
  assert.equal(rad.dom.nyBudget, 1000);
});

test('rapporten säger rakt ut när det inte finns något att göra', () => {
  const rader = [bedomKampanj(
    {
      id: '1', namn: 'X | BE ROAS 2.00', daily_budget: '1 000,00 kr (SEK)',
      spend_3d: '1 000,00 kr', roas_3d: '3.125', kop_3d: 10,
    },
    { logg: [], idag: '2026-08-28', karta: {} },
  )];
  const text = rapport(rader, { idag: '2026-08-28', hamtad: 'nyss', varningar: [] });
  assert.match(text, /Inget att göra idag/);
  assert.match(text, /Lämnas ifred \(1\)/);
  assert.match(text, /ändrar ingenting själv/);
});

test('rapporten listar det som kräver godkännande först', () => {
  const rader = [
    bedomKampanj(
      {
        id: '1', namn: 'Bra | BE ROAS 2.00', daily_budget: '1 000,00 kr (SEK)',
        spend_3d: '1 000,00 kr', roas_3d: '3.125', kop_3d: 10,
      },
      { logg: [], idag: '2026-08-28', karta: {} },
    ),
    bedomKampanj(
      {
        id: '2', namn: 'Dålig | BE ROAS 2.00', daily_budget: '1 000,00 kr (SEK)',
        spend_3d: '1 000,00 kr', roas_3d: '2.50', kop_3d: 10,
      },
      { logg: [], idag: '2026-08-28', karta: { 2: { campaign_id: '2', lage: 'drift' } } },
    ),
  ];
  const text = rapport(rader, { idag: '2026-08-28', hamtad: 'nyss', varningar: ['test'] });
  assert.match(text, /Att godkänna \(1\)/);
  assert.ok(text.indexOf('Att godkänna') < text.indexOf('Lämnas ifred'));
  assert.match(text, /Varningar/);
});

test('break-even räknas ur kostnadsblocket när det finns', () => {
  const fx = { usd_sek: 9.6, eur_sek: 11.09 };
  const post = { kostnad: { pris_sek: 259, usd: 8.9, eur: 2.9, kalla: 'kostnadsarket' } };
  const ur = breakEvenForPost(post, 'X | BE ROAS 9.99', fx);
  assert.equal(Math.round(ur.be * 100) / 100, 1.83);
  assert.equal(ur.kalla, 'kostnadsarket');
});

test('kostnadsblocket går före fast tal som går före kampanjnamnet', () => {
  const fx = { usd_sek: 9.6, eur_sek: 11.09 };
  assert.equal(breakEvenForPost({ break_even_roas: 1.25 }, 'X | BE ROAS 2.00', fx).be, 1.25);
  assert.equal(breakEvenForPost({}, 'X | BE ROAS 2.00', fx).be, 2);
  assert.equal(breakEvenForPost(undefined, 'X | BE ROAS 2.00', fx).be, 2);
});

test('utan valutakurser faller break-even tillbaka på kampanjnamnet i stället för att gissa', () => {
  const post = { kostnad: { pris_sek: 259, usd: 8.9, eur: 2.9 } };
  assert.equal(breakEvenForPost(post, 'X | BE ROAS 2.00', null).be, 2);
});

test('en anmärkning i produktkartan syns i rapportens varningar', () => {
  const rader = [bedomKampanj(
    {
      id: '1', namn: 'X | BE ROAS 2.00', daily_budget: '1 000,00 kr (SEK)',
      spend_3d: '1 000,00 kr', roas_3d: '3.125', kop_3d: 10,
    },
    { logg: [], idag: '2026-08-28', karta: {}, fx: null },
  )];
  const text = rapport(rader, { idag: '2026-08-28', hamtad: 'nyss', varningar: ['X: inköpspriset har höjts'] });
  assert.match(text, /inköpspriset har höjts/);
});

// --- planera: åtgärdslistan för autoläget ---

function radMedDom(id, budget, dom) {
  return { id, namn: `${id} | BE ROAS 2.00`, budget, dom: { naraGrans: false, ...dom } };
}

test('planera bygger budgetåtgärder med öre — Metas API tar öre, inte kronor', () => {
  const plan = planera([
    radMedDom('a', 1000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 1200, motivering: 'x' }),
    radMedDom('b', 1000, { kod: 'LAT_VARA', kraverGodkannande: false, nyBudget: null, motivering: 'x' }),
  ]);
  assert.equal(plan.sparrad, false);
  assert.equal(plan.atgarder.length, 1);
  assert.equal(plan.atgarder[0].typ, 'budget');
  assert.equal(plan.atgarder[0].till_sek, 1200);
  assert.equal(plan.atgarder[0].till_ore, 120000);
});

test('planera: STANG_AV blir paus och ATGARDSTRAPPAN blir trappa', () => {
  const plan = planera([
    radMedDom('a', 500, { kod: 'STANG_AV', kraverGodkannande: true, nyBudget: null, motivering: 'x' }),
    radMedDom('b', 1000, { kod: 'ATGARDSTRAPPAN', kraverGodkannande: true, nyBudget: null, motivering: 'x' }),
  ]);
  assert.deepEqual(plan.atgarder.map((a) => a.typ), ['paus_kampanj', 'trappa']);
});

test('planera nära zongräns: HALVERA mildras till SANK, resten skjuts upp', () => {
  const plan = planera([
    radMedDom('a', 2500, { kod: 'HALVERA', kraverGodkannande: true, nyBudget: 1250, naraGrans: true, motivering: 'x' }),
    radMedDom('b', 1000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 1200, naraGrans: true, motivering: 'x' }),
    radMedDom('c', 500, { kod: 'STANG_AV', kraverGodkannande: true, nyBudget: null, naraGrans: true, motivering: 'x' }),
  ]);
  assert.equal(plan.atgarder.length, 1);
  assert.equal(plan.atgarder[0].kod, 'SANK');
  assert.equal(plan.atgarder[0].till_sek, 2000); // 2500 × 0,8
  assert.match(plan.atgarder[0].mildrad, /mildrad/);
  assert.equal(plan.uppskjutna.length, 2);
});

test('ett belopp utanför golv-tak utförs aldrig — det skjuts upp', () => {
  // En trasig dom med 100x-budget (enhetsfelet) fastnar i beloppsvalideringen.
  const plan = planera([
    radMedDom('a', 1000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 120000, motivering: 'trasig' }),
  ]);
  assert.equal(plan.atgarder.length, 0);
  assert.equal(plan.uppskjutna.length, 1);
  assert.match(plan.uppskjutna[0].orsak, /ogiltigt belopp/);
});

test('kontospärren kasserar hela planen vid orimlig total höjning', () => {
  // Belopp inom golv-tak men en absurd relativ höjning: hela planen kasseras.
  const plan = planera([
    radMedDom('a', 200, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 4000, motivering: 'trasig' }),
  ]);
  assert.equal(plan.sparrad, true);
  assert.equal(plan.atgarder.length, 0);
  assert.match(plan.orsak, /kasseras/);
});

test('en normal dags plan går genom kontospärren', () => {
  const plan = planera([
    radMedDom('a', 1000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 1200, motivering: 'x' }),
    radMedDom('b', 2500, { kod: 'HALVERA', kraverGodkannande: true, nyBudget: 1250, motivering: 'x' }),
    radMedDom('c', 1000, { kod: 'SANK', kraverGodkannande: true, nyBudget: 800, motivering: 'x' }),
  ]);
  assert.equal(plan.sparrad, false);
  assert.equal(plan.atgarder.length, 3);
  assert.ok(plan.nyTotal < plan.gammalTotal);
});

test('kontospärren släpper igenom raketernas del men stoppar samma höjning utan flagga', () => {
  // Raket 2 000 -> 3 600 på en total om 3 000: +53 % totalt, men förklarat av raketen.
  const medFlagga = planera([
    radMedDom('r', 2000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 3600, raket: true, motivering: 'raket' }),
    radMedDom('x', 1000, { kod: 'LAT_VARA', kraverGodkannande: false, motivering: 'x' }),
  ]);
  assert.equal(medFlagga.sparrad, false);
  assert.equal(medFlagga.atgarder.length, 1);
  // Exakt samma belopp UTAN raketflaggan är oförklarat: kasseras.
  const utanFlagga = planera([
    radMedDom('r', 2000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 3600, motivering: 'trasig' }),
    radMedDom('x', 1000, { kod: 'LAT_VARA', kraverGodkannande: false, motivering: 'x' }),
  ]);
  assert.equal(utanFlagga.sparrad, true);
});


test('en kampanj som redan ändrats idag rörs inte igen', () => {
  const logg = [{ kampanj_id: 'a', kod: 'SKALA', genomford: true, datum: '2026-08-29', ny_budget: 1200 }];
  const plan = planera(
    [radMedDom('a', 1200, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 1400, motivering: 'x' })],
    { logg, idag: '2026-08-29' },
  );
  assert.equal(plan.atgarder.length, 0);
  assert.match(plan.uppskjutna[0].orsak, /redan ändrad idag/);
});

test('tre uppskjutningar i rad: nära-gräns-åtgärden körs ändå', () => {
  const uppskjuten = (datum) => ({ kampanj_id: 'a', kod: 'UPPSKJUTEN_GRANS', genomford: false, datum });
  const dom = { kod: 'SANK', kraverGodkannande: true, nyBudget: 800, naraGrans: true, motivering: 'x' };
  // Två uppskjutningar: skjuts upp igen.
  const plan2 = planera([radMedDom('a', 1000, dom)], { logg: [uppskjuten('2026-08-27'), uppskjuten('2026-08-28')], idag: '2026-08-29' });
  assert.equal(plan2.atgarder.length, 0);
  // Tre: signalen har stått i tre dagar — kör.
  const plan3 = planera([radMedDom('a', 1000, dom)], { logg: [uppskjuten('2026-08-26'), uppskjuten('2026-08-27'), uppskjuten('2026-08-28')], idag: '2026-08-29' });
  assert.equal(plan3.atgarder.length, 1);
  assert.equal(plan3.atgarder[0].till_sek, 800);
});

test('en budget som ser ut som öre ger ingen dom alls', () => {
  const rad = bedomKampanj(
    { id: '1', namn: 'X | BE ROAS 1.50', daily_budget: 250000, spend_3d: '1 000,00 kr', roas_3d: '1.20', kop_3d: 10 },
    { logg: [], idag: '2026-08-28', karta: {}, fx: null },
  );
  assert.equal(rad.dom.kod, 'ORIMLIG_DATA');
  assert.match(rad.dom.motivering, /felparsning/);
});

test('en fryst kampanj rörs inte alls före frys_till, och tinar efter', () => {
  const kampanj = {
    id: '1', namn: 'X | BE ROAS 1.68', daily_budget: '1 000,00 kr (SEK)',
    spend_3d: '1 500,00 kr', roas_3d: '2.14', kop_3d: 8, spend_total: '1 500,00 kr',
  };
  const karta = { 1: { campaign_id: '1', lage: 'drift', frys_till: '2026-08-31', frys_motivering: 'prishöjning på väg' } };
  const fryst = bedomKampanj(kampanj, { logg: [], idag: '2026-08-29', karta, fx: null });
  assert.equal(fryst.dom.kod, 'FRYST');
  assert.equal(fryst.dom.kraverGodkannande, false);
  const tinad = bedomKampanj(kampanj, { logg: [], idag: '2026-09-01', karta, fx: null });
  assert.notEqual(tinad.dom.kod, 'FRYST');
});

test('eskaleringen räknar dagar, inte rader — två körningar samma dag är en uppskjutning', () => {
  const u = (datum) => ({ kampanj_id: 'a', kod: 'UPPSKJUTEN_GRANS', genomford: false, datum });
  const dom = { kod: 'SANK', kraverGodkannande: true, nyBudget: 800, naraGrans: true, motivering: 'x' };
  // Fyra rader men bara två unika dagar: skjuts upp igen.
  const plan = planera([radMedDom('a', 1000, dom)],
    { logg: [u('2026-08-28'), u('2026-08-28'), u('2026-08-29'), u('2026-08-29')], idag: '2026-08-30' });
  assert.equal(plan.atgarder.length, 0);
});

test('minnet överlever tur och retur genom dashboardens HTML', async () => {
  const { bygg } = await import('../dashboard.mjs');
  const { extraheraLogg } = await import('../minne.mjs');
  const logg = [
    { datum: '2026-08-29', kampanj_id: '1', kod: 'SKALA', ny_budget: 1200, genomford: true, motivering: 'test </script> med farliga tecken' },
  ];
  const html = bygg({ rader: [], plan: { sparrad: false, atgarder: [], uppskjutna: [] }, logg, hamtad: '2026-08-29' });
  const tillbaka = extraheraLogg(html);
  assert.deepEqual(tillbaka, logg);
});

test('annons-triggern flaggar pausat material och snabbskalade vinnare', () => {
  const rader = [
    { id: 'a', namn: 'Trasig | BE ROAS 1.50', spendTotal: 900 },
    { id: 'b', namn: 'Vinnare | BE ROAS 1.50', spendTotal: 1400 },
    { id: 'c', namn: 'Lugn | BE ROAS 1.50', spendTotal: 500 },
  ];
  const logg = [
    { kampanj_id: 'a', kod: 'TRAPPA_STEG_1', genomford: true, datum: '2026-08-27' },
    { kampanj_id: 'b', kod: 'SKALA', genomford: true, datum: '2026-08-25', ny_budget: 1200 },
    { kampanj_id: 'b', kod: 'SKALA', genomford: true, datum: '2026-08-27', ny_budget: 1450 },
    { kampanj_id: 'c', kod: 'LAT_VARA', genomford: false, datum: '2026-08-28' },
  ];
  const behov = annonsbehov(rader, { logg, idag: '2026-08-29' });
  assert.equal(behov.length, 2);
  assert.match(behov.find((b) => b.kampanj_id === 'a').orsak, /pausat/);
  assert.match(behov.find((b) => b.kampanj_id === 'b').orsak, /skalats 2/);
});

test('annons-triggern glömmer det som är äldre än en vecka', () => {
  const rader = [{ id: 'a', namn: 'X | BE ROAS 1.50', spendTotal: 1000 }];
  const logg = [{ kampanj_id: 'a', kod: 'TRAPPA_STEG_2', genomford: true, datum: '2026-08-10' }];
  assert.equal(annonsbehov(rader, { logg, idag: '2026-08-29' }).length, 0);
  // En genomförd SKALA räcker inte — det krävs två inom veckan.
  const enSkala = [{ kampanj_id: 'a', kod: 'SKALA', genomford: true, datum: '2026-08-28', ny_budget: 1200 }];
  assert.equal(annonsbehov(rader, { logg: enSkala, idag: '2026-08-29' }).length, 0);
});


test('klarat testet (1 500 kr + över break-even) utan batch flaggar första batchen', () => {
  const rader = [
    { id: 'stor', namn: 'Fiskespöhållaren | BE ROAS 1.50', spendTotal: 52000, dom: { vinstProcent: 21 } },
    { id: 'liten', namn: 'Ny | BE ROAS 1.50', spendTotal: 1200, dom: { vinstProcent: 30 } },
    { id: 'batchad', namn: 'Klar | BE ROAS 1.50', spendTotal: 9000, budget: 2000, dom: { vinstProcent: 18 } },
    { id: 'forlorare', namn: 'Back | BE ROAS 1.50', spendTotal: 5000, dom: { vinstProcent: -8 } },
  ];
  // batchad fick sin batch igår — inne i 3-dagarsfönstret, ska vara tyst.
  const logg = [{ kampanj_id: 'batchad', kod: 'FORSTA_BATCH_KLAR', genomford: true, datum: '2026-08-28' }];
  const behov = annonsbehov(rader, { logg, idag: '2026-08-29' });
  assert.equal(behov.length, 1);
  assert.equal(behov[0].kampanj_id, 'stor');
  assert.equal(behov[0].typ, 'forsta_batch');
});

test('3-dagarsrundan: tyst i tre dagar, sen brief_runda med fokus', () => {
  const rader = [{ id: 'a', namn: 'X | BE ROAS 1.50', spendTotal: 9000, budget: 2000, dom: { vinstProcent: 18 } }];
  const logg = [
    { kampanj_id: 'a', kod: 'FORSTA_BATCH_KLAR', genomford: true, datum: '2026-08-27' },
    { kampanj_id: 'a', kod: 'TRAPPA_STEG_1', genomford: true, datum: '2026-08-28' },
  ];
  // Dag 2 efter batchen: låt den landa.
  assert.equal(annonsbehov(rader, { logg, idag: '2026-08-29' }).length, 0);
  // Dag 3: rundan är förfallen, och pausningen blir rundans fokus.
  const behov = annonsbehov(rader, { logg, idag: '2026-08-30' });
  assert.equal(behov.length, 1);
  assert.equal(behov[0].typ, 'brief_runda');
  assert.equal(behov[0].dagarSedanBatch, 3);
  assert.equal(behov[0].rundaAntal, 2); // budget 2 000 → veckokvot 3 → runda 2
  assert.match(behov[0].orsak, /3 dagar sedan/);
  assert.match(behov[0].orsak, /ersätt det som pausats/);
});

test('frysta produkter ger inga behov alls — inte ens första batchen', () => {
  const logg = [{ kampanj_id: 'a', kod: 'CS_BATCH_KLAR', genomford: true, datum: '2026-08-20' }];
  const fryst = [{ id: 'a', namn: 'X | BE ROAS 1.50', spendTotal: 9000, budget: 2000, dom: { kod: 'FRYST', vinstProcent: null } }];
  assert.equal(annonsbehov(fryst, { logg, idag: '2026-08-29' }).length, 0);
  // Fryst UTAN batch och över tröskeln (Cykelshorts-fallet: prishöjning på
  // väg — en brief nu skulle bränna in fel pris): ingen forsta_batch.
  const frystUtanBatch = [{ id: 'b', namn: 'Y | BE ROAS 1.50', spendTotal: 1850, budget: 1000, dom: { kod: 'FRYST', vinstProcent: null } }];
  assert.equal(annonsbehov(frystUtanBatch, { logg: [], idag: '2026-08-29' }).length, 0);
  const utanBudget = [{ id: 'a', namn: 'X | BE ROAS 1.50', spendTotal: 9000, dom: { vinstProcent: 18 } }];
  assert.equal(annonsbehov(utanBudget, { logg, idag: '2026-08-29' }).length, 0);
});

test('rundkvoten är halva veckokvoten avrundad uppåt', () => {
  assert.equal(rundkvot(500), 1);   // veckokvot 1
  assert.equal(rundkvot(1000), 1);  // veckokvot 2
  assert.equal(rundkvot(2000), 2);  // veckokvot 3
  assert.equal(rundkvot(4000), 2);  // veckokvot 4
  assert.equal(rundkvot(0), 0);
  assert.equal(rundkvot(undefined), 0);
});

test('första batch-behoven sorteras först, sen rundor med äldst batch först', () => {
  const rader = [
    { id: 'v', namn: 'Vinnare | BE', spendTotal: 99000, budget: 4000, dom: { vinstProcent: 25 } },
    { id: 'g', namn: 'Gammal | BE', spendTotal: 20000, budget: 1000, dom: { vinstProcent: 20 } },
    { id: 'a', namn: 'A | BE', spendTotal: 4000, dom: { vinstProcent: 10 } },
    { id: 'b', namn: 'B | BE', spendTotal: 8000, dom: { vinstProcent: 12 } },
  ];
  const logg = [
    { kampanj_id: 'v', kod: 'FORSTA_BATCH_KLAR', genomford: true, datum: '2026-08-24' },
    { kampanj_id: 'v', kod: 'SKALA', genomford: true, datum: '2026-08-25', ny_budget: 1200 },
    { kampanj_id: 'v', kod: 'SKALA', genomford: true, datum: '2026-08-27', ny_budget: 1450 },
    { kampanj_id: 'g', kod: 'CS_BATCH_KLAR', genomford: true, datum: '2026-08-20' },
  ];
  const behov = annonsbehov(rader, { logg, idag: '2026-08-29' });
  // b och a saknar batch (forsta_batch, störst spend först), sen rundorna:
  // g:s batch är äldre (9 dagar) än v:s (5) — g före v trots mindre spend.
  assert.deepEqual(behov.map((b) => b.kampanj_id), ['b', 'a', 'g', 'v']);
  assert.equal(behov[2].typ, 'brief_runda');
  assert.match(behov[3].orsak, /mata vinnaren/);
});

test('filutkorgen överlever tur och retur och släpper inte igenom farliga sökvägar', async () => {
  const { bygg } = await import('../dashboard.mjs');
  const { extraheraFiler } = await import('../minne.mjs');
  const filer = {
    'products/lastnat/dna.md': '# DNA </script> med farliga tecken',
    '../../etc/passwd': 'nej',
    '/tmp/absolut': 'nej',
    'annat/otillatet.md': 'nej',
  };
  const html = bygg({ rader: [], plan: { sparrad: false, atgarder: [], uppskjutna: [] }, logg: [], hamtad: '2026-08-29', filer });
  const tillbaka = extraheraFiler(html);
  assert.deepEqual(Object.keys(tillbaka), ['products/lastnat/dna.md']);
  assert.equal(tillbaka['products/lastnat/dna.md'], filer['products/lastnat/dna.md']);
});

test('launchstrukturen: budget styr veckokvoten precis som Axels tabell', () => {
  assert.deepEqual(annonskvot(500), { antal: 1, nyaKoncept: 0 });
  assert.deepEqual(annonskvot(1000), { antal: 2, nyaKoncept: 1 });
  assert.deepEqual(annonskvot(2000), { antal: 3, nyaKoncept: 1 });
  assert.deepEqual(annonskvot(2500), { antal: 3, nyaKoncept: 1 });
  assert.deepEqual(annonskvot(4000), { antal: 4, nyaKoncept: 1 });
  assert.deepEqual(annonskvot(null), { antal: 0, nyaKoncept: 0 });
});
