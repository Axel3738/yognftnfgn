// klaviyo/stada.mjs: ersatta utkast tas bort — bara motorns, bara draft-flöden,
// bara när en nyare version finns. Inget nät: ersatta() är ren.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { ersatta, delaVersion } from '../stada.mjs';
import { laddaUpp } from '../ladda-upp.mjs';
import { BRAND } from './hjalp.mjs';

const MINNE = [{ id: 'F1' }, { id: 'F2' }, { id: 'T1' }, { id: 'T2' }, { id: 'F5' }];

test('delaVersion: namnet utan _v<n> och versionen', () => {
  assert.deepEqual(delaVersion('FLOW_lista_valkomst_v2'), { bas: 'FLOW_lista_valkomst', version: 2 });
  assert.deepEqual(delaVersion('TPL_f01-valkomst-e1_v1'), { bas: 'TPL_f01-valkomst-e1', version: 1 });
  assert.equal(delaVersion('Välkomst (gammalt)'), null);
});

test('ersatta: äldre draft-flöden och äldre mallar som motorn skapat tas bort, allt annat blir varningar', () => {
  const r = ersatta({
    floden: [
      { id: 'F1', namn: 'FLOW_lista_valkomst_v1', status: 'draft' },
      { id: 'F2', namn: 'FLOW_lista_valkomst_v2', status: 'draft' },
      { id: 'F3', namn: 'FLOW_order_efterkop_v1', status: 'live' },
      { id: 'F4', namn: 'FLOW_order_efterkop_v2', status: 'draft' },
      { id: 'F5', namn: 'FLOW_segment_sunset_v1', status: 'draft' },
      { id: 'F6', namn: 'FLOW_checkout_overgiven_v1', status: 'draft' },
      { id: 'F7', namn: 'FLOW_checkout_overgiven_v2', status: 'draft' },
      { id: 'F8', namn: 'Välkomst (handbyggt)', status: 'draft' },
    ],
    mallar: [
      { id: 'T1', namn: 'TPL_f01-valkomst-e1_v1' },
      { id: 'T2', namn: 'TPL_f01-valkomst-e1_v2' },
      { id: 'T3', namn: 'TPL_k01_v1' },
      { id: 'T4', namn: 'TPL_k02_v1' },
      { id: 'T5', namn: 'TPL_k02_v2' },
    ],
    minne: MINNE,
  });
  assert.deepEqual(r.bort, [
    { typ: 'flode', id: 'F1', namn: 'FLOW_lista_valkomst_v1', orsak: 'ersatt av FLOW_lista_valkomst_v2' },
    { typ: 'mall', id: 'T1', namn: 'TPL_f01-valkomst-e1_v1', orsak: 'ersatt av TPL_f01-valkomst-e1_v2' },
  ]);
  // F3 är live (rörs aldrig), F6 och T4 är inte motorns (varningar); F5 har ingen nyare version och T3 är ensam (tyst).
  assert.equal(r.varningar.length, 3, r.varningar.join('\n'));
  assert.match(r.varningar[0], /FLOW_order_efterkop_v1 \(F3\) är live, inte draft/);
  assert.match(r.varningar[1], /FLOW_checkout_overgiven_v1 \(F6\) är inte motorns/);
  assert.match(r.varningar[2], /TPL_k02_v1 \(T4\) är inte motorns/);
});

test('ladda-upp: ett namn vars senaste minnesrad är "raderad" räknas som borta (skapas igen, hoppas inte)', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'klaviyo-stada-'));
  const manifest = { brand: BRAND.id, mejl: [{ id: 'x1', version: 1, amnesrader: ['Hej'], forhandstext: 'p', html: '<p>{% unsubscribe %} {{ organization.full_address }}</p>', text: 'x' }], kampanjer: [], floden: [] };
  const rader = [
    { tid: '2026-09-25T10:00:00Z', brand: BRAND.id, typ: 'mall', namn: 'TPL_x1_v1', id: 'T9', atgard: 'skapad' },
    { tid: '2026-09-25T11:00:00Z', brand: BRAND.id, typ: 'mall', namn: 'TPL_x1_v1', id: 'T9', atgard: 'raderad' },
  ];
  fs.writeFileSync(path.join(dir, 'uppladdat.jsonl'), rader.map((r) => JSON.stringify(r)).join('\n') + '\n');
  const r = await laddaUpp({ brand: BRAND, manifest, klient: null, bara: 'mallar', kontoDir: dir, nu: () => new Date('2026-09-25T12:00:00Z') });
  assert.ok(r.plan.some((p) => p.startsWith('SKAPA mall TPL_x1_v1')), r.plan.join('\n'));
  assert.equal(r.hoppade.length, 0);
});
