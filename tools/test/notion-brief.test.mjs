// Tester för tools/notion-brief.mjs — inga nätanrop. Allt är rena funktioner.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
  tillBlock, delaBlock, delaText, richText, byggEgenskaper, hittaDubblett,
  lasManifest, beskrivHub, landningUrBrief, TYP_TAG, MAX_TECKEN,
} from '../notion-brief.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const BRIEF = join(ROT, 'products/motorholjet/batch-06/video-ads-briefs/Enginecover_PD_21_H1/brief.md');

const plain = (rt) => rt.map((t) => t.text.content).join('');
const block = (b) => b[b.type];

// Notions gränser, kontrollerade rekursivt: ≤2000 tecken per rich_text-element.
function kollaGranser(lista) {
  for (const b of lista) {
    for (const t of block(b).rich_text ?? []) assert.ok(t.text.content.length <= MAX_TECKEN, `${b.type}: ${t.text.content.length} tecken`);
    for (const rad of block(b).children ?? []) for (const cell of rad.table_row.cells) kollaGranser([{ type: 'x', x: { rich_text: cell } }]);
  }
}

test('tillBlock: en riktig brief ur products/ blir Notion-block', () => {
  const md = readFileSync(BRIEF, 'utf8');
  const b = tillBlock(md);
  assert.ok(b.length > 40, `bara ${b.length} block`);
  assert.equal(b[0].type, 'heading_1');
  assert.equal(plain(b[0].heading_1.rich_text), 'Enginecover_PD_21_H1');
  const typer = new Set(b.map((x) => x.type));
  for (const t of ['heading_2', 'heading_3', 'paragraph', 'bulleted_list_item', 'numbered_list_item', 'quote', 'table', 'divider']) {
    assert.ok(typer.has(t), `saknar ${t}`);
  }
  kollaGranser(b);
  // Manustabellen: 3 kolumner, huvudrad + 5 rader
  const manus = b.filter((x) => x.type === 'table').find((x) => plain(x.table.children[0].table_row.cells[1]).startsWith('Swedish'));
  assert.ok(manus, 'manustabellen saknas');
  assert.equal(manus.table.table_width, 3);
  assert.equal(manus.table.has_column_header, true);
  assert.equal(manus.table.children.length, 6);
  assert.equal(plain(manus.table.children[1].table_row.cells[1]), 'Motorn står ute vid bryggan, oskyddad mellan varje tur.');
  // Ingen tom rad blev ett block
  assert.ok(!b.some((x) => x.type === 'paragraph' && plain(x.paragraph.rich_text).trim() === ''));
});

test('tillBlock: copy-cardets citat behåller radbrytningarna, exakt text', () => {
  const md = readFileSync(BRIEF, 'utf8');
  const citat = tillBlock(md).filter((x) => x.type === 'quote').map((x) => plain(x.quote.rich_text));
  const primär = citat.find((c) => c.startsWith('Är din utombordare'));
  assert.ok(primär);
  assert.equal(primär.split('\n').length, 5);
  assert.ok(primär.endsWith('Hitta din storlek och skydda den. 👇'));
});

test('tillBlock: rubriker, listor, kod, divider, fet text', () => {
  const b = tillBlock([
    '# Ett', '## Två', '### Tre', '#### Fyra', '',
    'Ett stycke med **fet** text och `kod`.',
    'som fortsätter på nästa rad.', '',
    '- punkt ett', '* punkt två', '  fortsättning av två', '',
    '1. första', '2. andra', '',
    '---', '',
    '```json', '{"a":1}', '```',
  ].join('\n'));
  assert.deepEqual(b.map((x) => x.type), [
    'heading_1', 'heading_2', 'heading_3', 'heading_3', 'paragraph',
    'bulleted_list_item', 'bulleted_list_item', 'numbered_list_item', 'numbered_list_item', 'divider', 'code',
  ]);
  const p = b[4].paragraph.rich_text;
  assert.equal(plain(p), 'Ett stycke med fet text och kod. som fortsätter på nästa rad.');
  assert.equal(p.find((t) => t.text.content === 'fet').annotations.bold, true);
  assert.equal(p.find((t) => t.text.content === 'kod').annotations.code, true);
  assert.equal(plain(b[6].bulleted_list_item.rich_text), 'punkt två fortsättning av två');
  assert.equal(b[10].code.language, 'json');
  assert.equal(plain(b[10].code.rich_text), '{"a":1}');
});

test('tillBlock: tabell → table med table_width och header, ojämna rader fylls ut', () => {
  const b = tillBlock('| a | b | c |\n|---|---|---|\n| 1 | **2** |\n| x | y | z |');
  assert.equal(b.length, 1);
  assert.equal(b[0].type, 'table');
  assert.equal(b[0].table.table_width, 3);
  assert.equal(b[0].table.has_column_header, true);
  assert.equal(b[0].table.children.length, 3);
  const rad2 = b[0].table.children[1].table_row.cells;
  assert.equal(rad2.length, 3);
  assert.equal(rad2[1][0].annotations.bold, true);
  assert.deepEqual(rad2[2], []);
});

test('tillBlock: tabell över 100 rader delas, huvudraden följer med', () => {
  const rader = ['| n | v |', '|---|---|', ...Array.from({ length: 250 }, (_, i) => `| ${i} | v${i} |`)];
  const b = tillBlock(rader.join('\n'));
  assert.ok(b.every((x) => x.type === 'table'));
  assert.equal(b.length, 3);
  for (const t of b) assert.ok(t.table.children.length <= 100);
  assert.equal(b.reduce((s, t) => s + t.table.children.length - 1, 0), 250);
  assert.equal(plain(b[2].table.children[0].table_row.cells[0]), 'n');
});

test('delaText / richText: 2000-teckengränsen delas vid blanksteg', () => {
  const ord = Array.from({ length: 900 }, (_, i) => `ord${i}`).join(' ');   // ~6 000 tecken
  const delar = delaText(ord);
  assert.ok(delar.length >= 3);
  for (const d of delar) { assert.ok(d.length <= MAX_TECKEN); assert.ok(!d.startsWith(' ')); }
  assert.equal(delar.join(' '), ord);
  // Ett fet-parti över gränsen behåller annotationen i varje bit
  const rt = richText(`**${'x'.repeat(4500)}**`);
  assert.equal(rt.length, 3);
  assert.ok(rt.every((t) => t.annotations.bold && t.text.content.length <= MAX_TECKEN));
  // Ett stycke i tillBlock delas också
  const b = tillBlock('a'.repeat(5000));
  assert.equal(b[0].paragraph.rich_text.length, 3);
  kollaGranser(b);
});

test('richText: länkar, kursiv, och asterisker inuti ord lämnas i fred', () => {
  const rt = richText('se [sidan](https://x.se/a) och *kursiv* men 2*3*4');
  assert.equal(rt.find((t) => t.text.content === 'sidan').text.link.url, 'https://x.se/a');
  assert.equal(rt.find((t) => t.text.content === 'kursiv').annotations.italic, true);
  assert.equal(plain(rt), 'se sidan och kursiv men 2*3*4');
});

test('delaBlock: max 100 toppnivåblock per anrop, nästlade räknas mot 1000', () => {
  const många = tillBlock(Array.from({ length: 250 }, (_, i) => `- rad ${i}`).join('\n'));
  const o = delaBlock(många);
  assert.deepEqual(o.map((x) => x.length), [100, 100, 50]);
  assert.equal(o.flat().length, 250);
  // 15 tabeller à 100 rader = 1515 block totalt → måste delas trots < 100 toppnivå
  const tab = tillBlock(['| a |', '|---|', ...Array.from({ length: 99 * 15 }, (_, i) => `| ${i} |`)].join('\n'));
  assert.equal(tab.length, 15);
  const o2 = delaBlock(tab);
  assert.ok(o2.length >= 2);
  for (const del of o2) assert.ok(del.reduce((s, b) => s + 1 + b.table.children.length, 0) <= 1000);
});

const SCHEMA_STATUS = {
  Namn: { type: 'title', title: {} },
  Status: { type: 'status', status: { options: [{ name: 'Draft' }, { name: 'In progress' }, { name: 'To be Reviewed' }] } },
  Typ: { type: 'select', select: { options: [{ name: 'Video - Pending Approval' }, { name: 'Image - Pending Approval' }, { name: 'SOP' }] } },
  'Landing page': { type: 'rich_text', rich_text: {} },
  Skapad: { type: 'date', date: {} },
};
const SCHEMA_SELECT = {
  ...SCHEMA_STATUS,
  Status: { type: 'select', select: { options: [{ name: 'Draft' }] } },
};

test('byggEgenskaper: status-typ ger {status:{name}}, select-typ ger {select:{name}}', () => {
  const a = byggEgenskaper(SCHEMA_STATUS, { namn: 'Enginecover_PD_21_H1', typ: 'video' });
  assert.deepEqual(a.fel, []);
  assert.deepEqual(a.properties.Status, { status: { name: 'Draft' } });
  assert.deepEqual(a.properties.Typ, { select: { name: TYP_TAG.video } });
  assert.equal(a.properties.Namn.title[0].text.content, 'Enginecover_PD_21_H1');

  const b = byggEgenskaper(SCHEMA_SELECT, { namn: 'X_1_H1', typ: 'bild', status: 'Draft', landning: 'https://x.se/p', datum: '2026-09-10' });
  assert.deepEqual(b.properties.Status, { select: { name: 'Draft' } });
  assert.deepEqual(b.properties.Typ, { select: { name: TYP_TAG.bild } });
  assert.equal(b.properties['Landing page'].rich_text[0].text.content, 'https://x.se/p');
  assert.deepEqual(b.properties.Skapad, { date: { start: '2026-09-10' } });
});

test('byggEgenskaper: status som inte finns i status-fältet är ett hårt fel, okänd typ likaså', () => {
  const a = byggEgenskaper(SCHEMA_STATUS, { namn: 'X', typ: 'video', status: 'Klar' });
  assert.ok(a.fel.some((f) => /Klar/.test(f)));
  const b = byggEgenskaper(SCHEMA_STATUS, { namn: 'X', typ: 'gif' });
  assert.ok(b.fel.some((f) => /Okänd typ/.test(f)));
  // I select-typen är ett nytt alternativ bara en varning (Notion skapar det)
  const c = byggEgenskaper(SCHEMA_SELECT, { namn: 'X', typ: 'video', status: 'Klar' });
  assert.deepEqual(c.fel, []);
  assert.ok(c.varningar.some((v) => /Klar/.test(v)));
});

test('hittaDubblett: samma namn (trimmat, skiftlägesokänsligt) = finns redan, arkiverad räknas inte', () => {
  const sida = (t, extra = {}) => ({ id: `id-${t}`, url: `https://notion.so/${t}`, properties: { Namn: { type: 'title', title: [{ plain_text: t }] } }, ...extra });
  const svar = [sida('Enginecover_PD_21_H1 '), sida('Enginecover_PD_22_H1')];
  assert.equal(hittaDubblett(svar, 'enginecover_pd_21_h1').id, 'id-Enginecover_PD_21_H1 ');
  assert.equal(hittaDubblett(svar, 'Enginecover_PD_23_H1'), null);
  assert.equal(hittaDubblett([sida('X', { archived: true })], 'X'), null);
  assert.equal(hittaDubblett([], 'X'), null);
});

test('lasManifest: löser sökvägar relativt manifestets mapp, stoppar dubbletter och fel typ', () => {
  const r = lasManifest(JSON.stringify([
    { namn: 'A_PD_1_H1', typ: 'video', brief: 'a/brief.md' },
    { namn: 'A_PD_1_1', typ: 'image', brief: '/abs/b.md' },
  ]), '/bas');
  assert.equal(r[0].brief, '/bas/a/brief.md');
  assert.equal(r[1].brief, '/abs/b.md');
  assert.equal(r[1].typ, 'bild');
  assert.throws(() => lasManifest([{ namn: 'A', typ: 'video', brief: 'x' }, { namn: 'a', typ: 'bild', brief: 'y' }]), /två gånger/);
  assert.throws(() => lasManifest([{ namn: 'A', typ: 'gif', brief: 'x' }]), /video eller bild/);
  assert.throws(() => lasManifest({ nej: 1 }), /lista/);
});

test('beskrivHub + landningUrBrief', () => {
  const h = beskrivHub({ id: 'db1', title: [{ plain_text: 'Surveillance Camera creative hub' }], properties: SCHEMA_STATUS });
  assert.equal(h.titel, 'Surveillance Camera creative hub');
  assert.equal(h.statusTyp, 'status');
  assert.equal(h.harVideoTag, true);
  assert.equal(h.harBildTag, true);
  const md = readFileSync(BRIEF, 'utf8');
  assert.equal(landningUrBrief(md), 'https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd');
  assert.equal(landningUrBrief('inget här'), null);
});
