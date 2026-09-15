// Kommentarskopplingen: redigerare utan Notion-konto. Inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sidId, kommentarPersoner, traff, raderAttKolla, berikaMedKommentarer } from '../kommentarer.mjs';

const PERSONER = [
  { id: 'josh', namn: 'Josh Naelga', notionUserId: '50fdc7d9-a491-45b9-bac4-5315788a616b', roll: 'editor' },
  { id: 'jerzee', namn: 'Jerzee', notionUserId: 'kommentar:jerzee', kommentarMonster: '\\bjerz', roll: 'editor' },
];

test('sidId plockar uuid ur en Notion-URL', () => {
  assert.equal(sidId('https://app.notion.com/3cf270ab908c81a09b0dc486f6467ce7'),
    '3cf270ab-908c-81a0-9b0d-c486f6467ce7');
  assert.equal(sidId('https://app.notion.com/3cf270ab-908c-81a0-9b0d-c486f6467ce7?v=1'),
    '3cf270ab-908c-81a0-9b0d-c486f6467ce7');
  assert.equal(sidId('inte en url'), null);
});

test('bara personer med mönster OCH syntetiskt id blir matchare', () => {
  const m = kommentarPersoner(PERSONER);
  assert.equal(m.length, 1);
  assert.equal(m[0].id, 'jerzee');
});

test('träff kräver exakt en person — två mönster ger null', () => {
  const m = kommentarPersoner([
    ...PERSONER,
    { id: 'jazz', namn: 'Jazz', notionUserId: 'kommentar:jazz', kommentarMonster: 'working on this' },
  ]);
  assert.equal(traff(['jerzee is working on this'], m), null);
  assert.equal(traff(['By Jerzee'], kommentarPersoner(PERSONER)).id, 'jerzee');
  assert.equal(traff(['good job'], kommentarPersoner(PERSONER)), null);
});

test('rader med Ansvarig kollas aldrig, och dokumentationsrader hoppas över', () => {
  const hubbar = [{
    namn: 'Hub',
    rader: [
      { namn: 'A_PD_1_H1', typ: 'Video - Pending Approval', ansvariga: [], url: 'https://app.notion.com/' + 'a'.repeat(32) },
      { namn: 'B_PD_2_H1', typ: 'Video - Pending Approval', ansvariga: ['någon'], url: 'https://app.notion.com/' + 'b'.repeat(32) },
      { namn: 'SOP', typ: 'SOP', ansvariga: [], url: 'https://app.notion.com/' + 'c'.repeat(32) },
      { namn: 'Utan url', typ: 'Image - Pending Approval', ansvariga: [], url: '' },
    ],
  }];
  const ut = raderAttKolla(hubbar);
  assert.deepEqual(ut.map((x) => x.rad.namn), ['A_PD_1_H1']);
});

test('berikning skriver Ansvarig på rätt rad och rör inte de andra', async () => {
  const hubbar = [{
    namn: 'Hub',
    rader: [
      { namn: 'A_PD_1_H1', typ: 'Video - Pending Approval', ansvariga: [], url: 'https://app.notion.com/' + 'a'.repeat(32) },
      { namn: 'B_PD_2_H1', typ: 'Video - Pending Approval', ansvariga: ['josh-id'], url: 'https://app.notion.com/' + 'b'.repeat(32) },
      { namn: 'C_PD_3_H1', typ: 'Video - Pending Approval', ansvariga: [], url: 'https://app.notion.com/' + 'c'.repeat(32) },
    ],
  }];
  const svar = {
    [`${'a'.repeat(8)}-${'a'.repeat(4)}-${'a'.repeat(4)}-${'a'.repeat(4)}-${'a'.repeat(12)}`]: ['jerzee is working on this'],
    [`${'c'.repeat(8)}-${'c'.repeat(4)}-${'c'.repeat(4)}-${'c'.repeat(4)}-${'c'.repeat(12)}`]: ['very clean'],
  };
  const fetchImpl = async (url) => {
    const id = new URL(url).searchParams.get('block_id');
    return { ok: true, json: async () => ({ results: (svar[id] ?? []).map((t) => ({ rich_text: [{ plain_text: t }] })) }) };
  };

  const s = await berikaMedKommentarer(hubbar, PERSONER, { fetchImpl, env: { NOTION_TOKEN: 'x' } });
  assert.equal(s.traffar, 1);
  assert.equal(s.lasta, 2);
  assert.deepEqual(hubbar[0].rader[0].ansvariga, ['kommentar:jerzee']);
  assert.equal(hubbar[0].rader[0].viaKommentar, 'jerzee');
  assert.deepEqual(hubbar[0].rader[1].ansvariga, ['josh-id'], 'en rad med Ansvarig får aldrig skrivas om');
  assert.deepEqual(hubbar[0].rader[2].ansvariga, []);
});

test('inga matchare = inga API-anrop alls', async () => {
  let anrop = 0;
  const s = await berikaMedKommentarer(
    [{ namn: 'Hub', rader: [{ namn: 'A', typ: 'Video - Pending Approval', ansvariga: [], url: 'https://app.notion.com/' + 'a'.repeat(32) }] }],
    [PERSONER[0]],
    { fetchImpl: async () => { anrop++; return { ok: true, json: async () => ({ results: [] }) }; }, env: { NOTION_TOKEN: 'x' } },
  );
  assert.equal(anrop, 0);
  assert.equal(s.traffar, 0);
});
