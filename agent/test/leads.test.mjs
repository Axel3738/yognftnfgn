// agent/leads.mjs — kommentarsleadsen in i briefsteget (Axel 2026-09-30, alternativ A).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseLeads, oppnaLeads, anvandaLeads } from '../leads.mjs';
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
  assert.equal(l[3].briefbar, false, 'en lead som väntar på distansprodukten är ingen brief i dag');
});

test('oppnaLeads: prefix + speglade CaraShell-leads, bockade och använda försvinner', () => {
  const l = parseLeads(MD);
  const tak = oppnaLeads(l, 'Takoverdrag');
  assert.deepEqual(tak.map((x) => x.id), ['VOC-222_1', 'VOC-444_1'], 'CaraShellRoof speglas in, den bockade faller bort');
  assert.equal(tak[0].speglad, true);
  const logg = [{ kod: 'BRIEF', lead: 'VOC-222_1' }];
  assert.deepEqual(oppnaLeads(l, 'Takoverdrag', { logg }).map((x) => x.id), ['VOC-444_1']);
  assert.deepEqual(oppnaLeads(l, 'Takoverdrag', { spegel: false }).map((x) => x.id), ['VOC-444_1']);
  assert.ok(anvandaLeads(logg).has('VOC-222_1'));
});

test('provaBriefkvot: en brief på en kommentarslead är fri mot taket', () => {
  const r = provaBriefkvot([], 'K1', [{ namn: 'Taljset_OB_1_H1', lead: 'VOC-111_1' }], { idag: '2026-09-30' });
  assert.equal(r.ok, true, r.fel.join(' | '));
  assert.deepEqual(r.leads, ['Taljset_OB_1_H1']);
  const utan = provaBriefkvot([], 'K1', [{ namn: 'Taljset_OB_1_H1' }], { idag: '2026-09-30' });
  assert.equal(utan.ok, false, 'utan lead och utan lärdom finns ingen plats');
});

test('briefRad: lead= ersätter lardom=, id-formen prövas, kalla=voc förväntas', () => {
  const tagg = (x) => `# X\n\n**VARIABELTAGGAR:** typ=\`N\` · koncept=\`ob-demo\` · avatar=\`a\` · awareness=\`product\` · begar=\`b\` · mekanism=\`m\` · tro=\`t\` · urgency=\`none\` · hook-mekanik=\`none\` · ${x}\n`;
  const kampanj = { id: 'K1', namn: 'Täljsetet', ad_account_id: '1867947880635861' };
  const ok = briefRad({ namn: 'Taljset_OB_1_H1', typ: 'video', text: tagg('lead=`VOC-111_1` · kalla=`voc`') }, { logg: [], kampanj, idag: '2026-09-30' });
  assert.equal(ok.ok, true, ok.fel.join(' | '));
  assert.equal(ok.rad.lead, 'VOC-111_1');
  const felForm = briefRad({ namn: 'Taljset_OB_1_H1', typ: 'video', text: tagg('lead=`111_1` · kalla=`voc`') }, { logg: [], kampanj, idag: '2026-09-30' });
  assert.equal(felForm.ok, false);
  const felKalla = briefRad({ namn: 'Taljset_OB_1_H1', typ: 'video', text: tagg('lead=`VOC-111_1` · kalla=`egen-data`') }, { logg: [], kampanj, idag: '2026-09-30' });
  assert.ok(felKalla.varningar.some((v) => /kalla=voc/.test(v)));
});
