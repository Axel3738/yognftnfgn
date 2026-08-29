import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bedomKampanj, breakEvenForPost, kontrolleraKonto, planera, rapport, TILLATET_KONTO } from '../rond.mjs';

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
      { logg: [], idag: '2026-08-28', karta: {} },
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

test('kontospärren kasserar hela planen vid orimlig total höjning', () => {
  // En trasig dom med 100x-budget (enhetsfelet) ska stoppa allt, inte köras.
  const plan = planera([
    radMedDom('a', 1000, { kod: 'SKALA', kraverGodkannande: true, nyBudget: 120000, motivering: 'trasig' }),
    radMedDom('b', 1000, { kod: 'LAT_VARA', kraverGodkannande: false, nyBudget: null, motivering: 'x' }),
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
