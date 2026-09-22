import { test } from 'node:test';
import assert from 'node:assert/strict';
import { annonsbehov, annonskvot, arAvstangd, attributionsvarning, bedomKampanj, bedomSurf, breakEvenForPost, cpaTrendRader, dygnsvarningar, efterMidnatt, kontrolleraKonto, planera, rapport, rundkvot, visningsvarning, visningsvarningar, TILLATET_KONTO } from '../rond.mjs';

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
  // Belopp inom golv-tak och under ×10-spärren, men en oförklarad ×3-höjning: hela planen kasseras.
  const plan = planera([
    radMedDom('a', 1000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 3000, motivering: 'trasig' }),
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
  assert.match(behov.find((b) => b.kampanj_id === 'a').orsak, /pausades i trappan/);
  assert.match(behov.find((b) => b.kampanj_id === 'b').orsak, /skalats 2/);
});

test('en avstängd kampanj får aldrig briefer — inte heller morgonen efter', () => {
  // Axels larm 2026-09-04: "den har börjat göra Notion-sidor för produkter
  // som den har pausat". Medicinasken och Kasta & Fånga stängdes av på
  // morgonen och fick 32 briefer och två nya hubbar samma körning.
  const rader = [{
    id: 'medicinasken', namn: 'Medicinasken i Fickformat | BE ROAS 1.60',
    spendTotal: 2025, budget: 700,
    // Dagen efter avstängningen landar domen på en helt annan kod än
    // STANG_AV — budgeten ändrades nyss, så kadensspärren slår till.
    dom: { kod: 'VANTA_KADENS', vinstProcent: -120 },
  }];
  const logg = [
    { kampanj_id: 'medicinasken', kod: 'STANG_AV', genomford: true, datum: '2026-09-04' },
  ];
  assert.equal(annonsbehov(rader, { logg, idag: '2026-09-05' }).length, 0);
  assert.equal(arAvstangd(logg, 'medicinasken'), true);

  // Startas den om igen lever den, och vanliga regler gäller.
  const igang = [...logg,
    { kampanj_id: 'medicinasken', kod: 'ATERAKTIVERA', genomford: true, datum: '2026-09-05' }];
  assert.equal(arAvstangd(igang, 'medicinasken'), false);

  // Samma datum, återstart skriven sist i loggen: kampanjen kör.
  const sammaDag = [
    { kampanj_id: 'x', kod: 'STANG_AV', genomford: true, datum: '2026-09-04' },
    { kampanj_id: 'x', kod: 'ATERAKTIVERA', genomford: true, datum: '2026-09-04' },
  ];
  assert.equal(arAvstangd(sammaDag, 'x'), false);

  // En STANG_AV som aldrig genomfördes räknas inte.
  const ejGjord = [{ kampanj_id: 'y', kod: 'STANG_AV', genomford: false, datum: '2026-09-04' }];
  assert.equal(arAvstangd(ejGjord, 'y'), false);
});

test('avstängning ger inget "ersätt"-behov — bara trappans förlängning gör det', () => {
  const rader = [
    { id: 'stangd', namn: 'Död | BE ROAS 1.50', spendTotal: 3000, dom: { kod: 'LAT_VARA' } },
    { id: 'forlangd', namn: 'Förlängd | BE ROAS 1.50', spendTotal: 3000, dom: { kod: 'LAT_VARA' } },
  ];
  const logg = [
    { kampanj_id: 'stangd', kod: 'STANG_AV', genomford: true, datum: '2026-09-03' },
    { kampanj_id: 'forlangd', kod: 'TRAPPA_FORLANGNING', genomford: true, datum: '2026-09-03' },
  ];
  const behov = annonsbehov(rader, { logg, idag: '2026-09-04' });
  assert.deepEqual(behov.map((b) => b.kampanj_id), ['forlangd']);
  assert.equal(behov[0].typ, 'ersatt');
});

test('annons-triggern glömmer det som är äldre än en vecka', () => {
  const rader = [{ id: 'a', namn: 'X | BE ROAS 1.50', spendTotal: 1000 }];
  const logg = [{ kampanj_id: 'a', kod: 'TRAPPA_STEG_2', genomford: true, datum: '2026-08-10' }];
  assert.equal(annonsbehov(rader, { logg, idag: '2026-08-29' }).length, 0);
  // En genomförd SKALA räcker inte — det krävs två inom veckan.
  const enSkala = [{ kampanj_id: 'a', kod: 'SKALA', genomford: true, datum: '2026-08-28', ny_budget: 1200 }];
  assert.equal(annonsbehov(rader, { logg: enSkala, idag: '2026-08-29' }).length, 0);
});


test('klarat testet (1 500 kr + minst 20 % vinst) utan batch flaggar första batchen', () => {
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

test('tunn vinst i testfasen får chilla — ingen batch under 20 %', () => {
  // Plyschtofflorna-fallet 2026-08-31: 2 859 kr spenderat, ROAS 1,545 mot
  // break-even 1,49 = 2,4 % vinst. Gamla regeln ("över break-even") byggde 12
  // briefer för den. Axels besked: under 20 % chillar produkten.
  const tunn = [{ id: 'p', namn: 'Plyschtofflorna | BE ROAS 1.49', spendTotal: 2859, dom: { vinstProcent: 2.4 } }];
  assert.equal(annonsbehov(tunn, { logg: [], idag: '2026-08-31' }).length, 0);

  // Precis på gränsen räknas som godkänd.
  const grans = [{ id: 'g', namn: 'Gräns | BE ROAS 1.49', spendTotal: 2859, dom: { vinstProcent: 20 } }];
  const behov = annonsbehov(grans, { logg: [], idag: '2026-08-31' });
  assert.equal(behov.length, 1);
  assert.equal(behov[0].typ, 'forsta_batch');
  assert.match(behov[0].orsak, /20,0 % vinst/);

  // Okänd vinst är inte godkänd. Förr passerade den, för villkoret var bara
  // "vet inte att den går back".
  const okand = [{ id: 'o', namn: 'Okänd | BE ROAS 1.49', spendTotal: 9000, dom: { vinstProcent: null } }];
  assert.equal(annonsbehov(okand, { logg: [], idag: '2026-08-31' }).length, 0);
});

test('Norge får aldrig briefer — bara Sverige bygger annonsbehov', () => {
  // Axels besked 2026-09-01: de norska annonserna är de svenska översatta i
  // ett eget flöde. I NO-kontot skalar ronden bara upp och ner. Utan spärren
  // byggde rutinen norska Notion-hubbar och lät dem äta briefplatserna.
  const rader = [{ id: 'no', namn: 'Kranbeskyttelse Frost NO | BE-ROAS 1,63', spendTotal: 2861, budget: 1000, dom: { vinstProcent: 32.6 } }];
  assert.equal(annonsbehov(rader, { logg: [], idag: '2026-09-01', marknad: 'NO' }).length, 0);

  // Samma rad på SE-kontot ska däremot flaggas — spärren får inte tysta Sverige.
  const se = annonsbehov(rader, { logg: [], idag: '2026-09-01', marknad: 'SE' });
  assert.equal(se.length, 1);
  assert.equal(se[0].typ, 'forsta_batch');

  // Utan angiven marknad gäller SE, så gamla anrop beter sig som förut.
  assert.equal(annonsbehov(rader, { logg: [], idag: '2026-09-01' }).length, 1);
});

test('3-dagarsrundan: tyst i tre dagar, sen brief_runda med fokus — och aldrig fler briefer än lärdomar (CS-KLART punkt 8)', () => {
  const rader = [{ id: 'a', namn: 'X | BE ROAS 1.50', spendTotal: 9000, budget: 2000, dom: { vinstProcent: 18 } }];
  const lardom = (n, datum) => ({ kampanj_id: 'a', kod: 'LARDOM', annons_id: `${n}`, lardom_id: `L-${n}`, genomford: true, datum });
  const logg = [
    { kampanj_id: 'a', kod: 'FORSTA_BATCH_KLAR', genomford: true, datum: '2026-08-27' },
    { kampanj_id: 'a', kod: 'TRAPPA_STEG_1', genomford: true, datum: '2026-08-28' },
    ...[1, 2, 3, 4, 5, 6, 7].map((n) => lardom(n, '2026-08-29')),
  ];
  // Dag 2 efter batchen: låt den landa.
  assert.equal(annonsbehov(rader, { logg, idag: '2026-08-29' }).length, 0);
  // Dag 3: rundan är förfallen, och pausningen blir rundans fokus.
  const behov = annonsbehov(rader, { logg, idag: '2026-08-30' });
  assert.equal(behov.length, 1);
  assert.equal(behov[0].typ, 'brief_runda');
  assert.equal(behov[0].dagarSedanBatch, 3);
  assert.equal(behov[0].rundaAntal, 6); // budget 2 000 → veckokvot 3 → runda 6 (dubbla, Axel 2026-09-02); 7 lärdomar räcker
  assert.equal(behov[0].budgetAntal, 6);
  assert.match(behov[0].orsak, /3 dagar sedan/);
  assert.match(behov[0].orsak, /ersätt det som pausats/);
  assert.match(behov[0].orsak, /Mix 20 % vidarebyggen \/ 80 % nya vinklar \(ingen levande breakthrough\)/);
  // Punkt 8: bara två lärdomar sedan batchen ⇒ två briefer, inte sex.
  const tva = annonsbehov(rader, { logg: logg.slice(0, 4), idag: '2026-08-30' });
  assert.equal(tva[0].rundaAntal, 2);
  assert.match(tva[0].orsak, /lärdomarna sedan förra batchen 2/);
  // Inga lärdomar sedan batchen ⇒ 0 briefer, och orsaken säger vad som ska göras först.
  const inga = annonsbehov(rader, { logg: logg.slice(0, 2), idag: '2026-08-30' });
  assert.equal(inga.length, 1);
  assert.equal(inga[0].rundaAntal, 0);
  assert.match(inga[0].orsak, /0 lärdomar skrivna sedan dess/);
  assert.match(inga[0].orsak, /node agent\/lardom\.mjs --skelett --kampanj a/);
});

test('vidarebygg (CS-KLART punkt 9): en levande breakthrough utan tre iterationer får ett behov med rang 0, samma morgon, i stället för brief_runda', () => {
  const rader = [
    { id: 'bt', namn: 'Vinnaren | BE ROAS 1.50', spendTotal: 30000, budget: 3000, dom: { vinstProcent: 40 } },
    { id: 'ny', namn: 'Ny | BE ROAS 1.50', spendTotal: 5000, dom: { vinstProcent: 30 } },
  ];
  const logg = [
    { kampanj_id: 'bt', kod: 'CS_BATCH_KLAR', genomford: true, datum: '2026-09-19' },
    { kampanj_id: 'bt', kod: 'ETIKETT', annons_id: '111', annons_namn: 'Vinnare_PD_1_H1', etikett: 'BREAKTHROUGH', datum: '2026-09-20', genomford: true, spend_ad: 4000, kop: 12 },
    { kampanj_id: 'bt', kod: 'LARDOM', annons_id: '111', lardom_id: 'L-111', datum: '2026-09-21', genomford: true },
    { kampanj_id: 'bt', kod: 'BRIEF', annons_namn: 'Vinnare_PD_1_H2', parent: 'Vinnare_PD_1_H1', koncept: 'PD', typ: 'I', lardom: 'L-111', datum: '2026-09-21', genomford: true },
  ];
  const behov = annonsbehov(rader, { logg, idag: '2026-09-21' });
  assert.deepEqual(behov.map((b) => b.typ), ['vidarebygg', 'forsta_batch'], 'vidarebygg går före första batchen i rangen (båda rang 0, sorterade på spend)');
  const v = behov[0];
  assert.equal(v.kampanj_id, 'bt');
  assert.equal(v.breakthroughs[0].iterationer, 1);
  assert.equal(v.breakthroughs[0].kvar, 2);
  assert.equal(v.rundaAntal, 1, 'två iterationer kvar men bara en lärdom sedan batchen ⇒ en brief');
  assert.match(v.orsak, /Vinnare_PD_1_H1: 1 av 3 iterationer, deadline 2026-10-04/);
  assert.match(v.orsak, /nya hookar → längre problemdel → in media res/);
  assert.equal(v.mix.vidarebyggen, 0.8);
  // Tre iterationer loggade ⇒ inget vidarebygg, och den vanliga 3-dagarsklockan gäller igen.
  const tre = [...logg, ...['H3', 'H4'].map((h) => ({ kampanj_id: 'bt', kod: 'BRIEF', annons_namn: `Vinnare_PD_1_${h}`, parent: 'Vinnare_PD_1_H1', koncept: 'PD', typ: 'I', datum: '2026-09-21', genomford: true }))];
  assert.ok(!annonsbehov(rader, { logg: tre, idag: '2026-09-21' }).some((b) => b.typ === 'vidarebygg'));
  // En avstängd kampanj får inget vidarebygg heller.
  const stangd = [...logg, { kampanj_id: 'bt', kod: 'STANG_AV', genomford: true, datum: '2026-09-21' }];
  assert.ok(!annonsbehov(rader, { logg: stangd, idag: '2026-09-21' }).some((b) => b.kampanj_id === 'bt'));
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

test('briefpaus stoppar bara briefkön — budgetronden rör produkten som vanligt', () => {
  // Axels besked 2026-09-15 om Övervakningskameran: "vi låter den köra lite och
  // så men inga nya grejer på ett tag". Skilt från FRYST, som lyfter bort
  // händerna helt — här fälls domen och budgeten ändras precis som vanligt,
  // det är bara briefkön som hoppar över produkten.
  const logg = [{ kampanj_id: 'a', kod: 'CS_BATCH_KLAR', genomford: true, datum: '2026-08-20' }];
  const pausad = [{
    id: 'a', namn: 'X | BE ROAS 1.50', spendTotal: 9000, budget: 2000,
    briefPausTill: '2026-10-15', dom: { kod: 'LAT_VARA', vinstProcent: 30 },
  }];
  assert.equal(annonsbehov(pausad, { logg, idag: '2026-08-29' }).length, 0);
  // Dagen efter att pausen gått ut är produkten tillbaka i kön.
  assert.equal(annonsbehov(pausad, { logg, idag: '2026-10-16' }).length, 1);
  // Utan fältet påverkas ingenting.
  const utanPaus = [{ ...pausad[0], briefPausTill: null }];
  assert.equal(annonsbehov(utanPaus, { logg, idag: '2026-08-29' }).length, 1);
  // Pausen stoppar också en FÖRSTA batch, inte bara rundorna.
  const nyUtanBatch = [{
    id: 'b', namn: 'Y | BE ROAS 1.50', spendTotal: 1850, budget: 1000,
    briefPausTill: '2026-10-15', dom: { kod: 'LAT_VARA', vinstProcent: 30 },
  }];
  assert.equal(annonsbehov(nyUtanBatch, { logg: [], idag: '2026-08-29' }).length, 0);
});

test('rundkvoten är dubbla veckokvoten, aldrig under fyra (Axel 2026-09-02)', () => {
  assert.equal(rundkvot(500), 4);   // veckokvot 1 → golvet 4
  assert.equal(rundkvot(1000), 4);  // veckokvot 2 → golvet 4
  assert.equal(rundkvot(2000), 6);  // veckokvot 3 → 6
  assert.equal(rundkvot(4000), 8);  // veckokvot 4 → 8
  assert.equal(rundkvot(0), 0);
  assert.equal(rundkvot(undefined), 0);
});

test('första batch-behoven sorteras först, sen rundor med äldst batch först', () => {
  const rader = [
    { id: 'v', namn: 'Vinnare | BE', spendTotal: 99000, budget: 4000, dom: { vinstProcent: 25 } },
    { id: 'g', namn: 'Gammal | BE', spendTotal: 20000, budget: 1000, dom: { vinstProcent: 20 } },
    { id: 'a', namn: 'A | BE', spendTotal: 4000, dom: { vinstProcent: 22 } },
    { id: 'b', namn: 'B | BE', spendTotal: 8000, dom: { vinstProcent: 24 } },
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

test('briefkvoten planar ut vid 3 000 kr — det höjda taket ger ALDRIG fler briefer', () => {
  // Axels beslut 2026-09-21, punkt 6: motorns tak gick 4 000 → 10 000, men
  // "mer budget ska inte ge fler briefer, det är kursens egen linje".
  // Testet finns för att en framtida takändring inte ska smyga upp kvoten.
  const vid3000 = annonskvot(3000);
  for (const budget of [3000, 4000, 6000, 8000, 10000, 16000]) {
    assert.deepEqual(annonskvot(budget), vid3000, `kvoten ändrades vid ${budget} kr`);
  }
  assert.deepEqual(vid3000, { antal: 4, nyaKoncept: 1 });
  // Och rundkvoten, som är dubbla veckokvoten, planar ut i samma punkt.
  const r3000 = rundkvot(3000);
  for (const budget of [3000, 10000, 16000]) assert.equal(rundkvot(budget), r3000);
});

test('ronden kör mot både SE- och NO-kontot, aldrig mot en annan verksamhet', () => {
  const bas = { kampanjer: [{ id: '1' }], hamtad: '2026-08-31T05:00:00Z' };
  const ok = (id, namn) => kontrolleraKonto({ ...bas, ad_account_id: id, ad_account_namn: namn });

  assert.deepEqual(ok('1867947880635861', 'MagiBorsten'), [], 'Sverige');
  assert.deepEqual(ok('1050941584152547', 'Magiborsten NO'), [], 'Norge');
  assert.deepEqual(ok('act_1050941584152547', 'Magiborsten NO'), [], 'act_-prefix');

  // Grillkliniken och Matstrumpor är andra verksamheter. Fel konto kostar
  // riktiga pengar och syns inte som ett felmeddelande, bara som konstig data.
  assert.ok(ok('1346450049878358', 'SnarkLös').length > 0, 'SnarkLös måste stoppas');
  assert.ok(ok('1418612340124566', 'Norge').length > 0, 'Matstrumpors Norge-konto måste stoppas');
  assert.ok(ok('915422744950975', 'Magiborsten DK').length > 0, 'DK är inte upplagt än');
});

test('rätt id med fel kontonamn stoppas — två lås, inte ett', () => {
  const bas = { kampanjer: [{ id: '1' }], hamtad: '2026-08-31T05:00:00Z' };
  const fel = kontrolleraKonto({ ...bas, ad_account_id: '1050941584152547', ad_account_namn: 'MagiBorsten' });
  assert.ok(fel.length > 0, 'SE-namn på NO-id ska inte släppas igenom');
});


test('en produkt som stängs av eller går trappan får aldrig briefer', () => {
  // Axels larm 2026-09-02: Kranskydd Frost 420D var PAUSAD och fick 9 briefer.
  const stangd = [{ id: 'a', namn: 'X | BE ROAS 1.50', spendTotal: 9000, budget: 1000, dom: { kod: 'STANG_AV', vinstProcent: -20 } }];
  assert.equal(annonsbehov(stangd, { logg: [], idag: '2026-09-02' }).length, 0);
  const trappa = [{ id: 'b', namn: 'Y | BE ROAS 1.50', spendTotal: 9000, budget: 1000, dom: { kod: 'ATGARDSTRAPPAN', vinstProcent: -10 } }];
  assert.equal(annonsbehov(trappa, { logg: [], idag: '2026-09-02' }).length, 0);
  // En frisk produkt påverkas inte.
  const frisk = [{ id: 'c', namn: 'Z | BE ROAS 1.50', spendTotal: 9000, budget: 1000, dom: { kod: 'SKALA', vinstProcent: 30 } }];
  assert.equal(annonsbehov(frisk, { logg: [], idag: '2026-09-02' }).length, 1);
});

// Inget tak (Axel 2026-09-22, ur Evolve: "Never by spend"). Den manuella zonen
// (2026-09-19–22: budget över motorns tak = Axels egen, rörs inte) finns inte
// längre — 16 000 kr/dag döms som vilken budget som helst, med högzonens tre
// spärrar hela vägen upp.
test('inget tak: 16 000 kr som går plus får en vanlig dom — 16–25 % vinst ⇒ låt vara, över target ⇒ skala 20 % (högzon)', () => {
  const stabil = bedomKampanj(
    {
      id: '1', namn: 'Taköverdraget | BE ROAS 1.63', daily_budget: '16 000,00 kr (SEK)',
      spend_3d: '40 000,00 kr', roas_3d: '2.40', kop_3d: 60, spend_total: '90 000,00 kr',
    },
    { logg: [], idag: '2026-09-19', karta: {} },
  );
  assert.equal(stabil.dom.kod, 'LAT_VARA');
  assert.equal(stabil.dom.nyBudget, null);
  assert.notEqual(stabil.dom.kod, 'MANUELL');
  // (1/1,63 − 1/2,40) × 100 = 19,7 % — under target 2,75 (25 % vinst).
  assert.ok(stabil.dom.vinstProcent > 16 && stabil.dom.vinstProcent < 25);
  // ROAS 3,3 ⇒ över target: 20 % (högzon), 16 000 → 19 200 — bara med en levande vinnare.
  const etikett = { kod: 'ETIKETT', kampanj_id: '1', annons_id: 'a', annons_namn: 'Tak_CS_2_1', etikett: 'BREAKTHROUGH', datum: '2026-09-15', genomford: true };
  const dygnBra = [{ datum: '2026-09-17', roas: 3.4, spend: 16000, kop: 40 }, { datum: '2026-09-18', roas: 3.2, spend: 16000, kop: 45 }];
  const stark = bedomKampanj(
    { id: '1', namn: 'Taköverdraget | BE ROAS 1.63', daily_budget: '16 000,00 kr (SEK)', spend_3d: '40 000,00 kr', roas_3d: '3.30', kop_3d: 100, spend_total: '90 000,00 kr', dygn: dygnBra },
    { logg: [etikett], idag: '2026-09-19', karta: { 1: { lage: 'drift' } } },
  );
  assert.equal(stark.dom.kod, 'SKALA');
  assert.equal(stark.dom.nyBudget, 19200);
  assert.equal(stark.dom.faktor, 1.2);
  const utanVinnare = bedomKampanj(
    { id: '1', namn: 'Taköverdraget | BE ROAS 1.63', daily_budget: '16 000,00 kr (SEK)', spend_3d: '40 000,00 kr', roas_3d: '3.30', kop_3d: 100, spend_total: '90 000,00 kr' },
    { logg: [], idag: '2026-09-19', karta: { 1: { lage: 'drift' } } },
  );
  assert.equal(utanVinnare.dom.kod, 'LAT_VARA');
  assert.match(utanVinnare.dom.motivering, /taket utan vinnare/);
});

test('inget tak: 16 000 kr som går back är högzon — en förlustmorgon rör ingenting, två ger −20 %, aldrig kapning', () => {
  const rad = bedomKampanj(
    {
      id: '1', namn: 'Taköverdraget | BE ROAS 1.63', daily_budget: '16 000,00 kr (SEK)',
      spend_3d: '40 000,00 kr', roas_3d: '1.20', kop_3d: 30, spend_total: '90 000,00 kr',
    },
    { logg: [], idag: '2026-09-20', karta: {} },
  );
  assert.equal(rad.dom.kod, 'HOGZON_AVVAKTA');
  assert.equal(rad.dom.nyBudget, null);
  const dygn2 = [{ datum: '2026-09-18', roas: 1.1, spend: 16000 }, { datum: '2026-09-19', roas: 1.2, spend: 16000 }];
  const tvaMorgnar = bedomKampanj(
    { id: '1', namn: 'Taköverdraget | BE ROAS 1.63', daily_budget: '16 000,00 kr (SEK)', spend_3d: '40 000,00 kr', roas_3d: '1.20', kop_3d: 30, spend_total: '90 000,00 kr', dygn: dygn2 },
    { logg: [], idag: '2026-09-20', karta: {} },
  );
  assert.equal(tvaMorgnar.dom.kod, 'SANK');
  assert.equal(tvaMorgnar.dom.nyBudget, 12800); // 16 000 × 0,8, jämna 50 kr
  // Planen utför den: inget motortak att stanna vid, bara rimlighetsspärren 50 000.
  const plan = planera([tvaMorgnar], { logg: [], idag: '2026-09-20' });
  assert.equal(plan.atgarder.length, 1);
  assert.equal(plan.atgarder[0].till_sek, 12800);
  assert.equal(plan.atgarder[0].till_ore, 1280000);
  // 4 500 kr ligger i högzonen. Utan dygnsserie är antalet förlustmorgnar
  // okänt, och då rörs ingenting: högzonen kapas aldrig.
  const nara = bedomKampanj(
    { id: '2', namn: 'X | BE ROAS 1.63', daily_budget: '4 500,00 kr (SEK)', spend_3d: '12 000,00 kr', roas_3d: '1.20', kop_3d: 30, spend_total: '90 000,00 kr' },
    { logg: [], idag: '2026-09-20', karta: {} },
  );
  assert.equal(nara.dom.kod, 'HOGZON_AVVAKTA');
  assert.equal(nara.dom.nyBudget, null);
  // Med två förlustmorgnar i rad: −20 %, men aldrig under 4 000 i ett steg.
  const dygn = [
    { datum: '2026-09-18', roas: 1.1, spend: 4500 },
    { datum: '2026-09-19', roas: 1.2, spend: 4500 },
  ];
  const tva = bedomKampanj(
    { id: '3', namn: 'X | BE ROAS 1.63', daily_budget: '4 500,00 kr (SEK)', spend_3d: '12 000,00 kr', roas_3d: '1.20', kop_3d: 30, spend_total: '90 000,00 kr', dygn },
    { logg: [], idag: '2026-09-20', karta: {} },
  );
  assert.equal(tva.dom.kod, 'SANK');
  assert.equal(tva.dom.nyBudget, 4000);
  // En gång per dygn: redan sänkt i dag ⇒ uppskjuten.
  const logg = [{ datum: '2026-09-20', kampanj_id: '1', kod: 'SANK', genomford: true, ny_budget: 12800 }];
  const igen = planera([tvaMorgnar], { logg, idag: '2026-09-20' });
  assert.equal(igen.atgarder.length, 0);
  assert.equal(igen.uppskjutna.length, 1);
});

test('hälsomåttet i bedomKampanj: dygnsserien ger CPA-trend, klickandel och konsekvens — räknat t.o.m. gårdagen', () => {
  // Taköverdraget 18–22/9: CPA 333 → 410 → 421 → 466, dagens 672 på ett halvt dygn räknas inte.
  const dygn = [
    { datum: '2026-09-17', roas: 3.5, spend: 7420, kop: 20, kop_visning: 0 },
    { datum: '2026-09-18', roas: 3.4, spend: 13301, kop: 40, kop_visning: 0 },
    { datum: '2026-09-19', roas: 3.1, spend: 15184, kop: 37, kop_visning: 3 },
    { datum: '2026-09-20', roas: 3.0, spend: 15990, kop: 38, kop_visning: 2 },
    { datum: '2026-09-21', roas: 2.9, spend: 13052, kop: 28, kop_visning: 6 },
    { datum: '2026-09-22', roas: 1.5, spend: 10749, kop: 16, kop_visning: 1 },
  ];
  const etikett = { kod: 'ETIKETT', kampanj_id: '1', annons_id: 'a', annons_namn: 'Tak_CS_2_1', etikett: 'BREAKTHROUGH', datum: '2026-09-15', genomford: true };
  const rad = bedomKampanj(
    { id: '1', namn: 'Taköverdraget | BE ROAS 1.63', daily_budget: '16 000,00 kr (SEK)', spend_3d: '44 186,07 kr', roas_3d: '2.99', kop_3d: 103, spend_total: '101 215,62 kr', dygn },
    { logg: [etikett], idag: '2026-09-22', karta: { 1: { lage: 'drift' } } },
  );
  assert.equal(rad.cpaTrend.dagar, 3);
  assert.equal(rad.cpaTrend.stiger, true);
  assert.ok(Math.abs(rad.klickandel.andel - 103 / 114) < 1e-9);
  assert.equal(rad.dagarOverTarget, 5, 'alla fem hela dygn ligger över target 2,75');
  assert.equal(rad.dom.kod, 'CPA_STIGER', 'ROAS 2,99 över target 2,75 — men CPA stiger tre dygn i rad');
  assert.equal(rad.dom.nyBudget, null);
  // Samma kampanj med fallande CPA: höjning 20 % (högzon), 16 000 → 19 200.
  const fall = dygn.map((d, i) => ({ ...d, kop: d.kop + i * 10 }));
  const ok = bedomKampanj(
    { id: '1', namn: 'Taköverdraget | BE ROAS 1.63', daily_budget: '16 000,00 kr (SEK)', spend_3d: '44 186,07 kr', roas_3d: '2.99', kop_3d: 103, spend_total: '101 215,62 kr', dygn: fall },
    { logg: [etikett], idag: '2026-09-22', karta: { 1: { lage: 'drift' } } },
  );
  assert.equal(ok.dom.kod, 'SKALA');
  assert.equal(ok.dom.nyBudget, 19200);
  // Eget target i produktkartan vinner.
  const eget = bedomKampanj(
    { id: '1', namn: 'Taköverdraget | BE ROAS 1.63', daily_budget: '16 000,00 kr (SEK)', spend_3d: '44 186,07 kr', roas_3d: '2.99', kop_3d: 103, spend_total: '101 215,62 kr', dygn: fall },
    { logg: [etikett], idag: '2026-09-22', karta: { 1: { lage: 'drift', target_roas: 3.5 } } },
  );
  assert.equal(eget.dom.kod, 'LAT_VARA');
  assert.match(eget.dom.motivering, /Target 3,50 \(produktens target_roas\) nås inte/);
});

test('surf-läget döms bara med --surf och surf.json: bedomSurf på dagens fönster', () => {
  const kampanj = { id: '1', namn: 'Taköverdraget | BE ROAS 1.63', daily_budget: '8 000,00 kr (SEK)', spend_idag: '3 000,00 kr', roas_idag: '4.10', kop_idag: 15, spend_igar: '14 000,00 kr', dygn: [] };
  const dubbla = bedomSurf(kampanj, { logg: [], idag: '2026-11-28', karta: {}, fx: null, surf: { efterMidnatt: false } });
  assert.equal(dubbla.dom.kod, 'SURF_DUBBLA');
  assert.equal(dubbla.dom.nyBudget, 16000);
  assert.equal(dubbla.surf, true);
  const reset = bedomSurf(kampanj, { logg: [], idag: '2026-11-28', karta: {}, fx: null, surf: { efterMidnatt: true } });
  assert.equal(reset.dom.kod, 'SURF_RESET');
  assert.equal(reset.dom.nyBudget, 7000);
  // Redan resettad i dag ⇒ ingen andra reset, fönstret döms i stället.
  const logg = [{ datum: '2026-11-28', kampanj_id: '1', kod: 'SURF_RESET', genomford: true, ny_budget: 7000 }];
  assert.equal(bedomSurf(kampanj, { logg, idag: '2026-11-28', karta: {}, fx: null, surf: { efterMidnatt: true } }).dom.kod, 'SURF_DUBBLA');
  // Planen utför surf-beloppen, och dubblingen förklaras för kontospärren.
  const plan = planera([dubbla], { logg: [], idag: '2026-11-28' });
  assert.equal(plan.sparrad, false);
  assert.equal(plan.atgarder[0].till_sek, 16000);
  assert.equal(plan.atgarder[0].faktor, 2);
  // efterMidnatt ur kontodatans timme: 0–5 efter reset_timme 0. Okänd timme ⇒ aldrig reset.
  assert.equal(efterMidnatt({ timme: 2 }, {}), true);
  assert.equal(efterMidnatt({ timme: 7 }, {}), false);
  assert.equal(efterMidnatt({ timme: 6 }, { reset_timme: 6 }), true);
  assert.equal(efterMidnatt({ timme: 23 }, {}), false);
  assert.equal(efterMidnatt({}, {}), false);
  assert.equal(efterMidnatt({ timme: null }, {}), false, 'null får aldrig bli midnatt');
  assert.equal(efterMidnatt({ timme: '' }, {}), false);
  // En SURF_RESET uppåt (budgeten sänkt under halva gårdagens spend) kasserar inte planen.
  const upp = planera([radMedDom('r', 2000, { kod: 'SURF_RESET', kraverGodkannande: true, nyBudget: 8000, motivering: 'reset' })], { logg: [], idag: '2026-11-28' });
  assert.equal(upp.sparrad, false);
  assert.equal(upp.atgarder[0].reset, true);
});

test('rapport(): CPA-trenden överst, stoppade = domar med CPA_STIGER, och dygnsvarningar när serien saknas', () => {
  const rader = [
    { id: '1', namn: 'Tre | BE ROAS 1.63', budget: 16000, cpaTrend: { stiger: true, dagar: 3, serie: [{ cpa: 333 }, { cpa: 410 }, { cpa: 421 }, { cpa: 466 }] }, dom: { kod: 'CPA_STIGER', rubrik: 'x', motivering: 'x', kraverGodkannande: false, vinstProcent: 27, nyBudget: null } },
    { id: '2', namn: 'Tva | BE ROAS 1.63', budget: 4000, cpaTrend: { stiger: false, dagar: 2, serie: [{ cpa: 161 }, { cpa: 218 }, { cpa: 427 }] }, dom: { kod: 'VANTA_KADENS', rubrik: 'x', motivering: 'x', kraverGodkannande: false, vinstProcent: 20, nyBudget: null } },
    { id: '3', namn: 'Tre-men-under | BE ROAS 1.63', budget: 1000, cpaTrend: { stiger: true, dagar: 3, serie: [{ cpa: 100 }, { cpa: 200 }, { cpa: 300 }, { cpa: 400 }] }, dom: { kod: 'LAT_VARA', rubrik: 'x', motivering: 'x', kraverGodkannande: false, vinstProcent: 18, nyBudget: null } },
    { id: '4', namn: 'Lugn | BE ROAS 1.63', budget: 1000, cpaTrend: { stiger: false, dagar: 0, serie: [] }, dom: { kod: 'LAT_VARA', rubrik: 'x', motivering: 'x', kraverGodkannande: false, vinstProcent: 18, nyBudget: null } },
  ];
  const text = rapport(rader, { idag: '2026-09-22', hamtad: 'nu', varningar: [] });
  assert.match(text, /## 🩺 CPA-trend — hälsomåttet \(1 stoppad höjning\)/, 'bara CPA_STIGER-domar räknas som stoppade');
  assert.match(text, /⛔ \*\*Tre\*\* — CPA 333 → 410 → 421 → 466 kr \(3 dygn i rad\) — höjning stoppad i dag/);
  assert.match(text, /👀 \*\*Tva\*\* — CPA 161 → 218 → 427 kr \(2 dygn i rad\) — ett dygn till/);
  assert.match(text, /⛔ \*\*Tre-men-under\*\*.*domen avgörs av annat/);
  assert.doesNotMatch(text, /\*\*Lugn\*\* — CPA/);
  assert.equal(text.indexOf('## 🩺 CPA-trend'), text.indexOf('## '), 'CPA-sektionen står först');
  assert.deepEqual(cpaTrendRader(rader).map((r) => r.namn.split(' ')[0]), ['Tre', 'Tre-men-under', 'Tva']);
  const varn = dygnsvarningar([
    { id: 'a', namn: 'Utan | x' },
    { id: 'b', namn: 'UtanKop | x', dygn: [{ datum: '2026-09-21', roas: 2, spend: 100 }] },
    { id: 'c', namn: 'Hel | x', dygn: [{ datum: '2026-09-21', roas: 2, spend: 100, kop: 3, kop_visning: 0, cpa: 33 }] },
  ]);
  assert.equal(varn.length, 3);
  assert.match(varn[0], /saknar dygnsserie.*Utan/);
  assert.match(varn[1], /utan kop\/cpa.*UtanKop/);
  assert.match(varn[2], /utan kop_visning.*UtanKop/);
});

test('attributionsvarning: bara 7d_click är tyst', () => {
  assert.equal(attributionsvarning({ attribution: '7d_click' }), null);
  assert.match(attributionsvarning({}), /saknar fältet attribution/);
  assert.match(attributionsvarning({ attribution: 'default' }), /inte "7d_click"/);
});

test('rimlighetstaket är 200 000 (felparsningsspärren, inte ett tak): 60 000 är en dom, 260 000 är felparsning', () => {
  const orimlig = bedomKampanj(
    { id: '1', namn: 'X | BE ROAS 1.50', daily_budget: '260 000,00 kr (SEK)', spend_3d: '1 000,00 kr', roas_3d: '2.0', kop_3d: 10 },
    { logg: [], idag: '2026-09-19', karta: {} },
  );
  assert.equal(orimlig.dom.kod, 'ORIMLIG_DATA');
  const stor = bedomKampanj(
    { id: '1', namn: 'X | BE ROAS 1.50', daily_budget: '60 000,00 kr (SEK)', spend_3d: '150 000,00 kr', roas_3d: '2.0', kop_3d: 300, spend_total: '900 000,00 kr' },
    { logg: [], idag: '2026-09-19', karta: {} },
  );
  assert.notEqual(stor.dom.kod, 'ORIMLIG_DATA');
  // Och planen: en SKALA 45 000 → 54 000 utförs (inget dolt tak), en ×100-budget skjuts upp.
  const plan = planera([radMedDom('a', 45000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 54000, motivering: 'x' })]);
  assert.equal(plan.atgarder.length, 1);
  const enhetsfel = planera([radMedDom('b', 1000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 100000, motivering: 'x' })]);
  assert.equal(enhetsfel.uppskjutna.length, 1);
  assert.match(enhetsfel.uppskjutna[0].orsak, /ogiltigt belopp/);
  // Precis på motorns tak är det fortfarande motorns zon — "taket nått", inte manuellt.
  const paTaket = bedomKampanj(
    { id: '2', namn: 'Y | BE ROAS 1.50', daily_budget: '4 000,00 kr (SEK)', spend_3d: '12 000,00 kr', roas_3d: '2.40', kop_3d: 30, spend_total: '50 000,00 kr' },
    { logg: [], idag: '2026-09-19', karta: { 2: { lage: 'drift' } } },
  );
  assert.notEqual(paTaket.dom.kod, 'MANUELL');
});

test('visningsköpsvarningen fångar Vandringskängor — fallet som motiverade regeln', () => {
  // Axels tröskel 2026-09-21 var "inom 15 procent från break-even". Läst på
  // KLICK-ROAS ensamt missar den hans eget exempel: 1,32 mot break-even 1,60
  // är 17,5 % ifrån. Med visningsköp inräknade ligger den 0,6 % från gränsen,
  // och det är just det som gör kampanjen farlig — den ser ut att gå jämnt ut.
  const v = visningsvarning({ id: '1', namn: 'Vandringskängor Herr', roas3d: 1.32, roas3dVisning: 1.61, breakEven: 1.60 });
  assert.ok(v, 'varningen ska fällas');
  assert.equal(v.vander, true);
  assert.match(v.text, /DOMEN VÄNDER/);
  assert.match(v.text, /22,0 %/);
});

test('visningsköpsvarningen tiger när felet inte kan vända en dom', () => {
  // Hög ROAS: 6 % visningsköp på 3,24 mot break-even 1,62 byter ingenting.
  assert.equal(visningsvarning({ namn: 'Båtmotorskyddet', roas3d: 3.24, roas3dVisning: 3.44, breakEven: 1.62 }), null);
  // Tunn marginal men nästan inga visningsköp.
  assert.equal(visningsvarning({ namn: 'Tunn', roas3d: 1.62, roas3dVisning: 1.64, breakEven: 1.60 }), null);
  // Inget visningstal alls ⇒ ingen varning, aldrig en gissning.
  assert.equal(visningsvarning({ namn: 'Utan tal', roas3d: 1.60, breakEven: 1.60 }), null);
  assert.equal(visningsvarning({ namn: 'Utan be', roas3d: 1.32, roas3dVisning: 1.61 }), null);
  // Tunn marginal OCH hög visningsandel ⇒ varning.
  assert.ok(visningsvarning({ namn: 'Farlig', roas3d: 1.55, roas3dVisning: 1.67, breakEven: 1.60 }));
});

test('visningsköpsvarningarna sorteras med de vändande domarna först', () => {
  const rader = [
    { id: '1', namn: 'Tunn men står sig', roas3d: 1.70, roas3dVisning: 1.85, dom: { breakEven: 1.60 } },
    { id: '2', namn: 'Vänder', roas3d: 1.50, roas3dVisning: 1.65, dom: { breakEven: 1.60 } },
    { id: '3', namn: 'Rör sig inte', roas3d: 4.00, roas3dVisning: 4.10, dom: { breakEven: 1.60 } },
  ];
  const v = visningsvarningar(rader);
  assert.equal(v.length, 2);
  assert.equal(v[0].namn, 'Vänder');
  assert.equal(v[0].vander, true);
});

test('rapporten skriver visningsköpsvarningen före åtgärderna', () => {
  const rad = bedomKampanj(
    { id: '9', namn: 'Vandringskängor | BE ROAS 1.60', daily_budget: '500,00 kr (SEK)', spend_3d: '2 000,00 kr', roas_3d: '1.32', roas_3d_visning: '1.61', kop_3d: 5, spend_total: '9 000,00 kr' },
    { logg: [], idag: '2026-09-22', karta: {} },
  );
  assert.equal(rad.roas3dVisning, 1.61);
  const text = rapport([rad], { idag: '2026-09-22', hamtad: '2026-09-22T05:00:00Z' });
  assert.match(text, /Visningsköp nära break-even/);
  assert.ok(text.indexOf('Visningsköp nära break-even') < text.indexOf('## Att'), 'varningen ska stå före åtgärderna');
});
