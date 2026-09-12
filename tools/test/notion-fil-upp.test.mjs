// Tester för tools/notion-fil-upp.mjs — bara de rena funktionerna, inga nätanrop.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mimeFor, hittaFilfalt, byggFilerVarde, filSitter, hittaStatusfalt, STANDARD_FALT } from '../notion-fil-upp.mjs';

test('mimeFor: kända ändelser, okänd ger null', () => {
  assert.equal(mimeFor('DryTrek_Damasker_PD_14_1.png'), 'image/png');
  assert.equal(mimeFor('x.JPG'), 'image/jpeg');
  assert.equal(mimeFor('film.mp4'), 'video/mp4');
  assert.equal(mimeFor('okänd.xyz'), null);
  assert.equal(mimeFor(''), null);
});

test('hittaFilfalt: exakt namn först, annars första files-fältet, annars null', () => {
  const props = { Namn: { type: 'title' }, Bilagor: { type: 'files', files: [] }, [STANDARD_FALT]: { type: 'files', files: [] } };
  assert.equal(hittaFilfalt(props), STANDARD_FALT);
  assert.equal(hittaFilfalt({ Namn: { type: 'title' }, Bilagor: { type: 'files', files: [] } }), 'Bilagor');
  assert.equal(hittaFilfalt({ Namn: { type: 'title' } }), null);
  // Ett fält som heter rätt men inte är files räknas inte.
  assert.equal(hittaFilfalt({ [STANDARD_FALT]: { type: 'rich_text' } }), null);
});

test('byggFilerVarde: befintliga behålls utan expiry_time, nya sist som file_upload', () => {
  const befintliga = [
    { name: 'gammal.png', type: 'file', file: { url: 'https://s3/gammal.png', expiry_time: '2026-09-12T10:00:00Z' } },
    { name: 'extern.jpg', type: 'external', external: { url: 'https://cdn/extern.jpg' } },
    { name: 'trasig', type: 'file', file: {} },
  ];
  const v = byggFilerVarde(befintliga, 'fu_123', 'ny.png');
  assert.equal(v.files.length, 3, 'den trasiga (utan url) faller bort, de två andra + den nya blir tre');
  assert.deepEqual(v.files[0], { name: 'gammal.png', type: 'file', file: { url: 'https://s3/gammal.png' } });
  assert.deepEqual(v.files[1], { name: 'extern.jpg', type: 'external', external: { url: 'https://cdn/extern.jpg' } });
  assert.deepEqual(v.files[2], { type: 'file_upload', file_upload: { id: 'fu_123' }, name: 'ny.png' });
  assert.ok(!JSON.stringify(v).includes('expiry_time'));
});

test('byggFilerVarde: tomt fält ger bara den nya filen', () => {
  assert.deepEqual(byggFilerVarde([], 'fu_1', 'a.png').files, [{ type: 'file_upload', file_upload: { id: 'fu_1' }, name: 'a.png' }]);
  assert.deepEqual(byggFilerVarde(undefined, 'fu_1', 'a.png').files.length, 1);
});

test('byggFilerVarde: ersatt byter ut filen med samma namn, rör inte andra', () => {
  const befintliga = [
    { name: 'a.png', type: 'file', file: { url: 'https://s3/a-gammal.png' } },
    { name: 'b.png', type: 'file', file: { url: 'https://s3/b.png' } },
  ];
  const v = byggFilerVarde(befintliga, 'fu_2', 'a.png', { ersatt: true });
  assert.deepEqual(v.files.map((f) => f.name), ['b.png', 'a.png']);
  assert.equal(v.files[1].type, 'file_upload');
  // utan ersatt: båda kvar + den nya
  assert.equal(byggFilerVarde(befintliga, 'fu_2', 'a.png').files.length, 3);
});

test('filSitter: bara exakt namn räknas', () => {
  const props = { [STANDARD_FALT]: { type: 'files', files: [{ name: 'a.png' }, { name: 'b.png' }] } };
  assert.equal(filSitter(props, STANDARD_FALT, 'b.png'), true);
  assert.equal(filSitter(props, STANDARD_FALT, 'c.png'), false);
  assert.equal(filSitter({}, STANDARD_FALT, 'a.png'), false);
});

test('hittaStatusfalt: Status av typ status eller select, annars första status-fältet', () => {
  assert.equal(hittaStatusfalt({ Status: { type: 'status' } })[0], 'Status');
  assert.equal(hittaStatusfalt({ Status: { type: 'select' } })[0], 'Status');
  assert.equal(hittaStatusfalt({ Läge: { type: 'status' } })[0], 'Läge');
  assert.equal(hittaStatusfalt({ Namn: { type: 'title' } })[0], null);
});
