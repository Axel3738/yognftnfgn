import test from 'node:test';
import assert from 'node:assert/strict';
import { renderaRapport, actionSektion, saknadeFalt, MAXLANGD, TAK } from '../discord-rapport.mjs';
import { serUtSomSvenska } from '../lib/engelska.mjs';

const AXEL = '1469423029783236689';
const CARL = '1411720622484095089';

function budgetJobb(extra = {}) {
  return {
    brand: 'HeimGuard',
    butik: 'heimguard',
    datum: '2026-09-10',
    lage: 'budget',
    gjort: [
      'Budget on HeimGuard PD raised 800 → 1 000 SEK/day (ROAS 2.31 over 7 days)',
      'HeimGuard SO paused (ROAS 0.9, below break-even 1.45)',
      '3 new video briefs written and uploaded to Notion',
    ],
    siffror: { spend_7d: 4120, kop_7d: 17, roas_7d: 2.31, vinstbidrag_7d: 1380, briefs_nya: 3 },
    briefer: [
      { namn: 'HeimGuard_PD_4_H1', typ: 'video', url: 'https://notion.so/a1' },
      { namn: 'HeimGuard_PD_4_H2', typ: 'video', url: 'https://notion.so/a2' },
      { namn: 'HeimGuard_SP_2_1', typ: 'image', url: 'https://notion.so/a3' },
    ],
    action_axel: [],
    action_redigerare: [],
    nasta_korning: '2026-09-13',
    varningar: [],
    ...extra,
  };
}

test('budgetjobb utan action: fast mall, rätt ordning, ingen ping', () => {
  const text = renderaRapport(budgetJobb(), { axelId: AXEL });
  const rader = text.split('\n');
  assert.equal(rader[0], '🌙 HEIMGUARD night watch — 2026-09-10');
  const ordning = ['**Numbers (7 days)**', '**Done automatically**', '**New briefs (3)**', '✅ Nothing for you to do. Next run: 2026-09-13'];
  let sist = -1;
  for (const rubrik of ordning) {
    const i = text.indexOf(rubrik);
    assert.ok(i > sist, `${rubrik} saknas eller står i fel ordning`);
    sist = i;
  }
  assert.match(text, /Spend: 4 120 SEK/);
  assert.match(text, /Purchases: 17/);
  assert.match(text, /ROAS: 2\.31/);
  assert.match(text, /Profit contribution: 1 380 SEK/);
  assert.match(text, /• HeimGuard_PD_4_H1 \(video\) — <https:\/\/notion\.so\/a1>/);
  assert.equal(text.includes('<@'), false, 'ingen action ⇒ inga pingar');
  assert.equal(text.includes('ACTION NEEDED'), false);
  assert.equal(text.includes('Warnings'), false, 'tom sektion visas inte');
  assert.ok(text.endsWith('✅ Nothing for you to do. Next run: 2026-09-13'), 'sista raden');
  assert.ok(text.length <= MAXLANGD);
});

test('briefjobb: rubrik 📝, varningar, och ACTION sist med ping på Axel', () => {
  const text = renderaRapport({
    brand: 'TankGuard',
    datum: '2026-09-11',
    lage: 'brief',
    gjort: ['5 briefs written from the 3-day analysis'],
    briefer: [{ namn: 'TankGuard_PD_7_H1', typ: 'video', url: 'https://notion.so/t1' }],
    varningar: ['Shopify price (899 SEK) differs from the ad copy (799 SEK)'],
    action_axel: ['Approve the new price in Shopify → Products → TankGuard → Save'],
    nasta_korning: '2026-09-14',
  }, { axelId: AXEL });
  const rader = text.split('\n');
  assert.equal(rader[0], '📝 TANKGUARD brief day — 2026-09-11');
  assert.ok(text.indexOf('**⚠️ Warnings**') < text.indexOf('**🔴 ACTION NEEDED**'), 'ACTION är sist');
  assert.ok(text.indexOf('**🔴 ACTION NEEDED**') > text.indexOf('**New briefs (1)**'));
  assert.match(text, /<@1469423029783236689> — you:\n1\. Approve the new price/);
  // Axel pingas ENBART i ACTION-sektionen — aldrig i rubriken eller ovanför.
  const fore = text.slice(0, text.indexOf('**🔴 ACTION NEEDED**'));
  assert.equal(fore.includes('<@'), false, 'ingen ping före ACTION-sektionen');
  assert.equal(text.includes('Nothing for you to do'), false);
  assert.match(text, /Next run: 2026-09-14/);
});

test('redigerare med rader pingas tillsammans med Axel', () => {
  const text = renderaRapport(budgetJobb({
    action_redigerare: [
      { discord_id: CARL, namn: 'Carl', rader: ['Re-cut HeimGuard_PD_4_H2: product must be on screen before second 4'] },
      { discord_id: '999', namn: 'Josh', rader: [] },
    ],
  }), { axelId: AXEL });
  assert.match(text, new RegExp(`<@${CARL}> \\(Carl\\) \\+ <@${AXEL}>:\\n1\\. Re-cut`));
  assert.equal(text.includes('<@999>'), false, 'redigerare utan rader pingas inte');
  assert.equal((text.match(/<@1469423029783236689>/g) || []).length, 1, 'Axel pingas en gång, i ACTION');
});

test('utan Axel-id: ingen ping men klartext om varför', () => {
  const text = renderaRapport(budgetJobb({ action_axel: ['Check the ad account'] }), { axelId: null });
  assert.equal(text.includes('<@'), false);
  assert.match(text, /No Discord id for Axel \(set DISCORD_AXEL_ID\)/);
  assert.match(text, /Axel — you:\n1\. Check the ad account/);
});

test('actionSektion är tom utan rader', () => {
  assert.equal(actionSektion({ action_axel: [], action_redigerare: [{ discord_id: '1', rader: [] }] }, { axelId: AXEL }), '');
});

test('kapning vid 2000: listorna kapas, ACTION-sektionen aldrig', () => {
  const langRad = 'Budget raised on a campaign with a very long descriptive name that goes on and on and on '.repeat(2);
  const jobb = budgetJobb({
    gjort: Array.from({ length: 30 }, (_, i) => `${i + 1}: ${langRad}`),
    briefer: Array.from({ length: 30 }, (_, i) => ({ namn: `HeimGuard_PD_${i}_H1`, typ: 'video', url: `https://notion.so/${i}` })),
    varningar: Array.from({ length: 10 }, (_, i) => `Warning ${i}: ${langRad}`),
    action_axel: ['Open Ads Manager → HeimGuard PD → set the budget to 1 000 SEK/day', 'Reply in #ops-rapport when done'],
    action_redigerare: [{ discord_id: CARL, namn: 'Carl', rader: ['Deliver HeimGuard_PD_4_H2 by Friday 12:00 Manila'] }],
  });
  const text = renderaRapport(jobb, { axelId: AXEL });
  assert.ok(text.length <= MAXLANGD, `${text.length} tecken`);
  const action = actionSektion(jobb, { axelId: AXEL });
  assert.ok(text.endsWith(action), 'ACTION-sektionen är hel och sist');
  assert.match(text, /\+\d+ more/);
  assert.equal(text.split('\n')[0], '🌙 HEIMGUARD night watch — 2026-09-10');
});

test('listtak utan kapning: max 8 gjort och 10 briefer, sen "+N more"', () => {
  const text = renderaRapport(budgetJobb({
    gjort: Array.from({ length: 12 }, (_, i) => `Done ${i}`),
    briefer: Array.from({ length: 13 }, (_, i) => ({ namn: `B_${i}`, typ: 'image' })),
    siffror: { briefs_nya: 13 },
  }), { axelId: AXEL });
  assert.equal((text.match(/• Done \d+/g) || []).length, TAK.gjort);
  assert.match(text, /\+4 more/);
  assert.equal((text.match(/• B_\d+/g) || []).length, TAK.briefer);
  assert.match(text, /\+3 more/);
  assert.match(text, /\*\*New briefs \(13\)\*\*/);
});

test('saknade fält vägras', () => {
  assert.deepEqual(saknadeFalt({}), ['brand', 'datum', 'lage (budget | brief)']);
  assert.throws(() => renderaRapport({ brand: 'X', datum: '2026-09-10', lage: 'natt' }), /lage/);
});

test('den engelska mallen passerar språkspärren, svensk text i jobbet fångas', () => {
  const engelska = renderaRapport(budgetJobb({ action_axel: ['Approve the price change'] }), { axelId: AXEL });
  assert.equal(serUtSomSvenska(engelska), false, 'mallens egna ord får inte trigga spärren');
  const svenska = renderaRapport(budgetJobb({
    gjort: ['Budgeten höjdes på kampanjen och inga annonser pausades'],
    varningar: ['Priset saknas i annonsen, kolla Shopify'],
  }), { axelId: AXEL });
  assert.equal(serUtSomSvenska(svenska), true, 'svenska rader i jobbet ska stoppas');
});

test('valjButiksServer: exakt namn först, annars enda servern som börjar med brandet', async () => {
  const { valjButiksServer } = await import('../discord-rapport.mjs');
  const guilds = [
    { id: '1', name: 'Bäverbutiken' }, { id: '2', name: 'HeimGuard' },
    { id: '3', name: 'DryTrek — OPS' }, { id: '4', name: 'TackleBay — OPS' },
  ];
  assert.equal(valjButiksServer(guilds, 'HeimGuard').id, '2');
  assert.equal(valjButiksServer(guilds, 'drytrek').id, '3');
  assert.equal(valjButiksServer(guilds, '4').id, '4');
  assert.equal(valjButiksServer(guilds, 'Grillkliniken'), null);
  assert.equal(valjButiksServer([...guilds, { id: '5', name: 'DryTrek — test' }], 'DryTrek'), null, 'två träffar ⇒ null');
});
