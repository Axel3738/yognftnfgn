import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mdTillBlock, delaText, richText, egenskaper, raknaBlock, TYP, MAX_TEXT } from '../notion-brief-upp.mjs';

const BRIEF = `# Takoverdrag_OB_4_H1 — objection: "it'll just trap the damp"

**Make:** a 20-second video that agrees with the objection before answering it.
**Why:** built on a documented belief barrier.

Landing page: https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan
Price: 1 129 kr (was 1 469 kr)

## Hooks

| # | Swedish (use this) | English meaning |
|---|---|---|
| H1 | Ja – ett helöverdrag blir tätt runt om. | Yes, a full cover does seal it in. |
| H2 | Tätt? Ja – om det var helöverdrag. | Sealed in? Yes, if it were a full cover. |

## Rules

- The ad never names the store.
- No numbers other than those listed above.

> ⚠️ En rättelse i citatform.
`;

test('mdTillBlock: namnet ur titelraden, landningssidan ur brödtexten', () => {
  const { namn, landing } = mdTillBlock(BRIEF);
  assert.equal(namn, 'Takoverdrag_OB_4_H1');
  assert.equal(landing, 'https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan');
});

test('mdTillBlock: stycken, rubriker, tabell med huvud, punkter och citat i ordning', () => {
  const { block } = mdTillBlock(BRIEF);
  const typer = block.map((b) => b.type);
  assert.deepEqual(typer, ['paragraph', 'paragraph', 'heading_2', 'table', 'heading_2', 'bulleted_list_item', 'bulleted_list_item', 'quote']);
  // Stycket "Make/Why" slås ihop till ETT stycke, och "Make:" behåller fetstilen.
  const p0 = block[0].paragraph.rich_text;
  assert.equal(p0[0].text.content, 'Make:');
  assert.equal(p0[0].annotations.bold, true);
  assert.match(p0.map((r) => r.text.content).join(''), /Why:.*belief barrier/);
  // Tabellen: separatorraden borta, tre kolumner, huvud + två rader, cellerna trimmade.
  const t = block[3].table;
  assert.equal(t.table_width, 3);
  assert.equal(t.has_column_header, true);
  assert.equal(t.children.length, 3);
  assert.equal(t.children[1].table_row.cells[1][0].text.content, 'Ja – ett helöverdrag blir tätt runt om.');
  assert.equal(t.children[2].table_row.cells[0][0].text.content, 'H2');
  // Punkterna och citatet.
  assert.equal(block[5].bulleted_list_item.rich_text[0].text.content, 'The ad never names the store.');
  assert.match(block[7].quote.rich_text[0].text.content, /rättelse/);
});

test('titelraden blir aldrig ett block, och en tabell utan innehåll hoppas', () => {
  const { block } = mdTillBlock('# Bara_Namn_1\n\n|---|---|\n');
  assert.deepEqual(block, []);
});

test('delaText håller Notions gräns på 2 000 tecken och bryter på ordgräns', () => {
  const lang = Array.from({ length: 500 }, (_, i) => `ord${i}`).join(' ');
  const bitar = delaText(lang);
  assert.ok(bitar.length >= 2);
  for (const b of bitar) assert.ok(b.length <= MAX_TEXT, `bit på ${b.length} tecken`);
  assert.equal(bitar.join(' ').replace(/\s+/g, ' '), lang);
  assert.deepEqual(delaText('kort'), ['kort']);
});

test('ett långt stycke blir flera paragraph-block i stället för ett avvisat anrop', () => {
  const md = `# X_Y_1\n\n${'a'.repeat(4500)}\n`;
  const { block } = mdTillBlock(md);
  assert.ok(block.length >= 3);
  assert.ok(block.every((b) => b.type === 'paragraph'));
});

test('richText: fet markering bara på **…**, resten ren', () => {
  const r = richText('**Make:** film it. **Why:** because.');
  assert.equal(r.filter((x) => x.annotations?.bold).length, 2);
  assert.equal(r.map((x) => x.text.content).join(''), 'Make: film it. Why: because.');
  assert.deepEqual(richText('')[0].text.content, '');
});

test('egenskaper: exakt NOTION-FORMAT.md — Draft, Pending Approval-typen, landningssida, Skapad', () => {
  const p = egenskaper({ namn: 'Takoverdrag_OB_4_H1', typ: 'video', landing: 'https://x.se/p', idag: '2026-09-22' });
  assert.equal(p.Namn.title[0].text.content, 'Takoverdrag_OB_4_H1');
  assert.equal(p.Status.status.name, 'Draft');
  assert.equal(p.Typ.select.name, TYP.video);
  assert.equal(p['Landing page'].rich_text[0].text.content, 'https://x.se/p');
  assert.equal(p.Skapad.date.start, '2026-09-22');
  // Ansvarig och Prioritet sätts ALDRIG av oss — de är managerns.
  assert.equal(p.Ansvarig, undefined);
  assert.equal(p.Prioritet, undefined);
  assert.equal(egenskaper({ namn: 'B_1_1', typ: 'bild' }).Typ.select.name, TYP.bild);
  assert.equal(egenskaper({ namn: 'B_1_1' })['Landing page'], undefined);
});

test('raknaBlock räknar tabellrader så tillbakaläsningen har något att jämföra mot', () => {
  const { block } = mdTillBlock(BRIEF);
  const n = raknaBlock(block);
  assert.equal(n.table, 1);
  assert.equal(n.table_row, 3);
  assert.equal(n.heading_2, 2);
  assert.equal(n.bulleted_list_item, 2);
});
