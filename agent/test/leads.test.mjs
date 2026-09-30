// agent/leads.mjs — kundernas kommentarer som underlag för strategin (Axel 2026-09-30).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLeads, oppnaLeads } from '../leads.mjs';
import { provaBriefkvot, briefRad } from '../lardom.mjs';

const MD = `# Leads

## 2026-09-30

- [ ] **Bäverbutiken · Taljset** · invändning — Fyra misstroende-kommentarer. → Egen demo-video av täljsetet i stället för lånat material
  - Källa: voc · \`kalla=voc\` · belägg: 111_1, 111_2 · status: väntar
- [ ] **CaraShell · CaraShellRoof** · fråga — Är det vattentätt? → Bild: 'Waterproof' som rubrik
  - Källa: voc · \`kalla=voc\` · belägg: 222_1 · status: väntar
- [x] **Bäverbutiken · Takoverdrag** · invändning — Temu-jämförelse. → SP/CS: material i närbild
  - Källa: voc · \`kalla=voc\` · belägg: 333_1 · status: använd i batch #4

## 2026-09-29

- [ ] **Bäverbutiken · Takoverdrag** · invändning — Fukt under duken. → När distansprodukten finns: en OB-annons. Fram till dess ingen annons som lovar torrt tak.
  - Källa: voc · \`kalla=voc\` · belägg: 444_1 · status: väntar
`;

test('parseLeads: id ur första belägget, datum, typ, förslag, bockad och briefbar', () => {
  const l = parseLeads(MD);
  assert.equal(l.length, 4);
  assert.deepEqual(l.map((x) => x.id), ['VOC-111_1', 'VOC-222_1', 'VOC-333_1', 'VOC-444_1']);
  assert.equal(l[0].prefix, 'Taljset');
  assert.equal(l[0].typ, 'invändning');
  assert.equal(l[0].datum, '2026-09-30');
  assert.equal(l[3].datum, '2026-09-29');
  assert.equal(l[2].bockad, true);
  assert.equal(l[0].briefbar, true);
  assert.equal(l[3].briefbar, false, 'en lead som väntar på distansprodukten hör till rapporten, inte annonsen');
});

test('oppnaLeads: prefix + speglade CaraShell-leads, bockade försvinner', () => {
  const l = parseLeads(MD);
  const tak = oppnaLeads(l, 'Takoverdrag');
  assert.deepEqual(tak.map((x) => x.id), ['VOC-222_1', 'VOC-444_1'], 'CaraShellRoof speglas in, den bockade faller bort');
  assert.equal(tak[0].speglad, true);
  assert.deepEqual(oppnaLeads(l, 'Takoverdrag', { spegel: false }).map((x) => x.id), ['VOC-444_1']);
});

test('provaBriefkvot: en lead ger ingen plats — kommentarerna är underlag, inte kvot', () => {
  const r = provaBriefkvot([], 'K1', [{ namn: 'Taljset_OB_1_H1', lead: 'VOC-111_1' }], { idag: '2026-09-30' });
  assert.equal(r.ok, false, 'utan lärdom finns ingen plats, lead= eller inte');
});

test('briefRad: lead= loggas som referens men ersätter aldrig lardom=', () => {
  const tagg = (x) => `# X

**VARIABELTAGGAR:** typ=\`N\` · koncept=\`ob-demo\` · avatar=\`a\` · awareness=\`product\` · begar=\`b\` · mekanism=\`m\` · tro=\`t\` · urgency=\`none\` · hook-mekanik=\`none\` · ${x}
`;
  const kampanj = { id: 'K1', namn: 'Täljsetet', ad_account_id: '1867947880635861' };
  const utanLardom = briefRad({ namn: 'Taljset_OB_1_H1', typ: 'video', text: tagg('lead=`VOC-111_1` · kalla=`voc`') }, { logg: [], kampanj, idag: '2026-09-30' });
  assert.equal(utanLardom.ok, false, 'lardom= krävs fortfarande');
  const logg = [{ kod: 'LARDOM', kampanj_id: 'K1', lardom_id: 'L-9', annons_id: '9', annons_namn: 'Taljset_PD_1', datum: '2026-09-29', genomford: true }];
  const med = briefRad({ namn: 'Taljset_OB_1_H1', typ: 'video', text: tagg('lardom=`L-9` · lead=`VOC-111_1` · kalla=`voc`') }, { logg, kampanj, idag: '2026-09-30' });
  assert.equal(med.rad.lead, 'VOC-111_1');
});
