import { test } from 'node:test';
import assert from 'node:assert/strict';
import { egenskaperFor, planera, MASKINKOLUMNER, MANNISKOKOLUMNER } from '../growthguide.mjs';

const rad = {
  namn: 'MATSTRUMP_sushi_gift_ugc_haikuh2_v1', id: '120251218171220023', marknad: 'SE', vinkel: 'gift', format: 'ugc',
  typ: 'okänd', koncept: null, foralder: null, playbook: null, kreator: null, adset: 'broad_advplus_purchase_nya16',
  d0: '2026-08-27', status: 'ACTIVE', etikett: 'LOSER', etiketter: [{ vecka: 1, etikett: 'LOSER', datum: '2026-09-24' }],
  lardom: 'L-x', senaste_matning: { datum: '2026-10-01', spend_sek: 4389.44, kop: 14, roas: 1.341, cpa_sek: 313.53, lpv: 437, konv_lpv: 0.032, hook_rate: 0.486, hold_rate: 0.113 },
  vinstbidrag_14d_sek: -459.92,
};

test('egenskaperna bär bara maskinkolumner, aldrig människornas', () => {
  const e = egenskaperFor(rad);
  for (const k of Object.keys(MANNISKOKOLUMNER)) assert.equal(k in e, false, `${k} får aldrig skrivas av koden`);
  for (const k of Object.keys(e)) assert.ok(k === 'Annons' || k in MASKINKOLUMNER, `${k} är ingen känd kolumn`);
});

test('talen avrundas och tomma fält blir null, inte text', () => {
  const e = egenskaperFor(rad);
  assert.equal(e['Spend kr'].number, 4389);
  assert.equal(e['CPA kr'].number, 314);
  assert.equal(e['Hook rate'].number, 0.486);
  assert.equal(e['Etikett v1'].select.name, 'LOSER');
  assert.equal(e['Etikett v2'].select, null);
  assert.equal(e.Kreatör.select, null);
  assert.equal(e.Playbook.rich_text.length, 0);
  assert.match(e['Ads Manager'].url, /selected_ad_ids=120251218171220023/);
});

test('en annons som inte startat saknar mätning utan att kasta', () => {
  const e = egenskaperFor({ namn: 'X', status: 'PAUSED', etiketter: [] });
  assert.equal(e['Spend kr'].number, null);
  assert.equal(e.Mätt.date, null);
  assert.equal(e['Ads Manager'].url, null);
});

test('planen skiljer nya, ändrade och oförändrade på etikett, status, mätdag och spend', () => {
  const bef = new Map([[rad.namn, { id: 'p1', etikett: 'LOSER', status: 'ACTIVE', matt: '2026-10-01', spend: 4389, adset: 'broad_advplus_purchase_nya16', adset_dom: null }]]);
  assert.deepEqual(planera([rad], bef), { nya: [], andrade: [], oandrade: 1 });
  // 3:2:2: en ny adsetdom (eller ett nytt adset) är en ändring — raden skrivs om.
  assert.equal(planera([{ ...rad, adset_dom: 'STANG' }], bef).andrade.length, 1);
  assert.equal(planera([{ ...rad, adset: 'MATSTRUMP_T065_gift_video' }], bef).andrade.length, 1);
  const bef2 = new Map([[rad.namn, { id: 'p1', etikett: 'LOSER', status: 'ACTIVE', matt: '2026-09-30', spend: 4000 }]]);
  assert.equal(planera([rad], bef2).andrade.length, 1);
  assert.equal(planera([{ ...rad, namn: 'NY' }], bef).nya.length, 1);
});

test('3:2:2-kolumnerna: Adset-id, Adset-roll och Adset-dom skrivs av koden, och de som saknas i schemat läggs till', async () => {
  const { saknadeKolumner } = await import('../growthguide.mjs');
  const e = egenskaperFor({ ...rad, adset_id: '120251591832340023', adset_roll: 'champions', adset_dom: 'CHAMPIONS' });
  assert.equal(e['Adset-id'].rich_text[0].text.content, '120251591832340023');
  assert.equal(e['Adset-roll'].select.name, 'champions');
  assert.equal(e['Adset-dom'].select.name, 'CHAMPIONS');
  const gammaltSchema = Object.fromEntries(Object.keys(MASKINKOLUMNER).filter((k) => !k.startsWith('Adset-')).map((k) => [k, {}]));
  assert.deepEqual(Object.keys(saknadeKolumner({ ...gammaltSchema, Anteckning: {} })).sort(), ['Adset-dom', 'Adset-id', 'Adset-roll']);
  assert.deepEqual(saknadeKolumner(Object.fromEntries(Object.keys(MASKINKOLUMNER).map((k) => [k, {}]))), {});
  for (const k of Object.keys(MANNISKOKOLUMNER)) assert.equal(k in saknadeKolumner({}), false, `${k} läggs aldrig till av koden`);
});
