// Tester för kedjans steg 1 (tema-upload.mjs). Allt körs mot fejkad graphql
// och fejkad fetch — inget nätverk, ingen riktig butik.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  TEMA_ZIP,
  TEMA_FILNAMN,
  standardTemanamn,
  harCroINamnet,
  bedomUppackning,
  byggUppladdningsform,
  tolkaArgument,
  hittaTemaViaNamn,
  vantaPaUppackning,
  laddaUppTema,
} from '../tema-upload.mjs';

// --- hjälp -----------------------------------------------------------------

const GID = 'gid://shopify/OnlineStoreTheme/123';

// Fejkad graphql som svarar per operation och loggar anropen.
function fejkGraphql(svar) {
  const anrop = [];
  const g = async (query, variables) => {
    const op = query.match(/(?:mutation|query)\s+(\w+)/)[1];
    anrop.push({ op, variables });
    const s = svar[op];
    if (!s) throw new Error(`Oväntat anrop i testet: ${op}`);
    return typeof s === 'function' ? s(variables, anrop.filter((a) => a.op === op).length) : s;
  };
  return { g, anrop };
}

const staged = {
  stagedUploadsCreate: {
    stagedTargets: [
      { url: 'https://s3.example/bucket', resourceUrl: 'https://s3.example/bucket/ops-tema.zip', parameters: [{ name: 'key', value: 'k' }] },
    ],
    userErrors: [],
  },
};
const skapat = { themeCreate: { theme: { id: GID, name: 'Test – CRO v1', role: 'UNPUBLISHED', processing: true, processingFailed: false }, userErrors: [] } };
const ingaTeman = { themes: { nodes: [] } };
const klart = { theme: { id: GID, name: 'Test – CRO v1', role: 'UNPUBLISHED', processing: false, processingFailed: false, files: { nodes: [{ filename: 'layout/theme.liquid' }] } } };
const vantar = { theme: { id: GID, name: 'Test – CRO v1', role: 'UNPUBLISHED', processing: true, processingFailed: false, files: { nodes: [] } } };

function tempZip() {
  const rot = mkdtempSync(join(tmpdir(), 'ops-tema-'));
  const zip = join(rot, 'ops-tema.zip');
  writeFileSync(zip, Buffer.from('PKtestzip'));
  return { zip, stada: () => rmSync(rot, { recursive: true, force: true }) };
}

const fetchOk = async () => ({ ok: true, status: 204, text: async () => '' });
const ingenVantan = async () => {};

// --- ren logik -------------------------------------------------------------

test('TEMA_ZIP pekar på factory/tema/ops-tema.zip', () => {
  assert.ok(TEMA_ZIP.endsWith(join('factory', 'tema', 'ops-tema.zip')));
  assert.equal(TEMA_FILNAMN, 'ops-tema.zip');
});

test('standardTemanamn bär ordet CRO så hamtaArbetstema känner igen temat', () => {
  assert.equal(standardTemanamn('TackleBay'), 'TackleBay – CRO v1');
  assert.equal(standardTemanamn(''), 'OPS – CRO v1');
  assert.ok(harCroINamnet(standardTemanamn('DryTrek')));
  assert.equal(harCroINamnet('TackleBay v1'), false);
  assert.equal(harCroINamnet('Microphone'), false, 'CRO måste vara ett eget ord');
});

test('bedomUppackning: klart kräver processing=false och minst en fil', () => {
  assert.equal(bedomUppackning(klart.theme), 'klart');
  assert.equal(bedomUppackning(vantar.theme), 'vantar');
  assert.equal(bedomUppackning({ processing: false, processingFailed: false, files: { nodes: [] } }), 'vantar');
  assert.equal(bedomUppackning({ processing: false, processingFailed: true, files: { nodes: [{}] } }), 'misslyckat');
  assert.equal(bedomUppackning(null), 'vantar');
  // Äldre API utan processing-fält: filer räcker.
  assert.equal(bedomUppackning({ files: { nodes: [{ filename: 'x' }] } }), 'klart');
});

test('byggUppladdningsform lägger parametrarna före filen', () => {
  const form = byggUppladdningsform(staged.stagedUploadsCreate.stagedTargets[0], Buffer.from('zip'), 'a.zip');
  const nycklar = [...form.keys()];
  assert.deepEqual(nycklar, ['key', 'file']);
  assert.equal(form.get('key'), 'k');
  assert.equal(form.get('file').name, 'a.zip');
});

test('tolkaArgument: positionellt namn, --namn, --zip och --torr', () => {
  assert.deepEqual(tolkaArgument(['TackleBay – CRO v1']), { namn: 'TackleBay – CRO v1', zipSokvag: TEMA_ZIP, torr: false, butiksfil: null });
  assert.equal(tolkaArgument(['--namn', 'X CRO', '--torr']).torr, true);
  assert.equal(tolkaArgument(['--namn', 'X CRO', '--torr']).namn, 'X CRO');
  assert.equal(tolkaArgument(['X', '--zip', '/tmp/annan.zip']).zipSokvag, '/tmp/annan.zip');
  assert.equal(tolkaArgument([]).namn, null);
});

test('tolkaArgument: butiks-yaml ger standardnamnet ur brand', () => {
  const lasButik = (fil) => ({ butik: { id: 'dry', brand: 'DryTrek' } });
  const r = tolkaArgument(['factory/butiker/drytrek.yaml'], { lasButik });
  assert.equal(r.namn, 'DryTrek – CRO v1');
  assert.equal(r.butiksfil, 'factory/butiker/drytrek.yaml');
  // Eget namn vinner över brand.
  assert.equal(tolkaArgument(['factory/butiker/drytrek.yaml', 'Eget CRO'], { lasButik }).namn, 'Eget CRO');
});

// --- anrop mot fejkad Shopify ---------------------------------------------

test('hittaTemaViaNamn matchar exakt namn, oavsett roll', async () => {
  const { g } = fejkGraphql({
    opsFactoryTemanViaNamn: { themes: { nodes: [{ id: 'a', name: 'Horizon', role: 'MAIN' }, { id: 'b', name: 'X – CRO v1 ', role: 'UNPUBLISHED' }] } },
  });
  assert.equal((await hittaTemaViaNamn('X – CRO v1', { graphql: g }))?.id, 'b');
  assert.equal(await hittaTemaViaNamn('Y', { graphql: g }), null);
});

test('vantaPaUppackning pollar tills filerna finns', async () => {
  const { g, anrop } = fejkGraphql({ opsFactoryTemaStatus: (v, n) => (n < 3 ? vantar : klart) });
  const lage = await vantaPaUppackning(GID, { graphql: g, vanta: ingenVantan, forsok: 10 });
  assert.equal(lage.klart, true);
  assert.equal(lage.forsok, 3);
  assert.equal(anrop.length, 3);
});

test('vantaPaUppackning ger klart:false när tiden tar slut', async () => {
  const { g } = fejkGraphql({ opsFactoryTemaStatus: vantar });
  const lage = await vantaPaUppackning(GID, { graphql: g, vanta: ingenVantan, forsok: 4 });
  assert.deepEqual({ klart: lage.klart, forsok: lage.forsok }, { klart: false, forsok: 4 });
});

test('vantaPaUppackning kastar när Shopify säger processingFailed', async () => {
  const { g } = fejkGraphql({ opsFactoryTemaStatus: { theme: { ...vantar.theme, processing: false, processingFailed: true } } });
  await assert.rejects(() => vantaPaUppackning(GID, { graphql: g, vanta: ingenVantan }), /gick inte att packa upp/);
});

test('laddaUppTema: staged upload → POST → themeCreate UNPUBLISHED → väntar → { id, name }', async () => {
  const { zip, stada } = tempZip();
  const poster = [];
  const hamta = async (url, init) => {
    poster.push({ url, body: init.body });
    return fetchOk();
  };
  const { g, anrop } = fejkGraphql({
    opsFactoryTemanViaNamn: ingaTeman,
    opsFactoryStaged: staged,
    opsFactoryTemaSkapa: skapat,
    opsFactoryTemaStatus: (v, n) => (n < 2 ? vantar : klart),
  });
  try {
    const tema = await laddaUppTema('Test – CRO v1', { zipSokvag: zip, graphql: g, fetch: hamta, vanta: ingenVantan });
    assert.equal(tema.id, GID);
    assert.equal(tema.name, 'Test – CRO v1');
    assert.equal(tema.role, 'UNPUBLISHED');
    assert.equal(tema.redanUppe, false);
    assert.equal(tema.kontroller, 2);

    const st = anrop.find((a) => a.op === 'opsFactoryStaged').variables.input[0];
    assert.equal(st.resource, 'FILE', 'THEME finns inte som resurs i 2025-07');
    assert.equal(st.mimeType, 'application/zip');
    assert.equal(st.filename, 'ops-tema.zip');

    assert.equal(poster.length, 1);
    assert.equal(poster[0].url, 'https://s3.example/bucket');
    assert.deepEqual([...poster[0].body.keys()], ['key', 'file']);

    const sk = anrop.find((a) => a.op === 'opsFactoryTemaSkapa').variables;
    assert.equal(sk.source, 'https://s3.example/bucket/ops-tema.zip');
    assert.equal(sk.role, 'UNPUBLISHED', 'publicerar ALDRIG');
    assert.deepEqual(anrop.map((a) => a.op), ['opsFactoryTemanViaNamn', 'opsFactoryStaged', 'opsFactoryTemaSkapa', 'opsFactoryTemaStatus', 'opsFactoryTemaStatus']);
  } finally {
    stada();
  }
});

test('laddaUppTema återanvänder ett tema med samma namn (idempotent)', async () => {
  const { zip, stada } = tempZip();
  const { g, anrop } = fejkGraphql({
    opsFactoryTemanViaNamn: { themes: { nodes: [{ id: GID, name: 'Test – CRO v1', role: 'MAIN' }] } },
    opsFactoryTemaStatus: { theme: { ...klart.theme, role: 'MAIN' } },
  });
  try {
    const tema = await laddaUppTema('Test – CRO v1', { zipSokvag: zip, graphql: g, fetch: async () => { throw new Error('ingen POST ska ske'); }, vanta: ingenVantan });
    assert.equal(tema.redanUppe, true);
    assert.equal(tema.role, 'MAIN');
    assert.ok(!anrop.some((a) => a.op === 'opsFactoryStaged'));
  } finally {
    stada();
  }
});

test('laddaUppTema: aterAnvand:false laddar upp även om namnet finns', async () => {
  const { zip, stada } = tempZip();
  const { g, anrop } = fejkGraphql({ opsFactoryStaged: staged, opsFactoryTemaSkapa: skapat, opsFactoryTemaStatus: klart });
  try {
    const tema = await laddaUppTema('Test – CRO v1', { zipSokvag: zip, aterAnvand: false, graphql: g, fetch: fetchOk, vanta: ingenVantan });
    assert.equal(tema.redanUppe, false);
    assert.ok(!anrop.some((a) => a.op === 'opsFactoryTemanViaNamn'));
  } finally {
    stada();
  }
});

test('laddaUppTema kastar tydligt: tomt namn, saknad zip, userErrors, nekad POST, timeout', async () => {
  const { zip, stada } = tempZip();
  try {
    await assert.rejects(() => laddaUppTema('', { zipSokvag: zip, graphql: async () => ({}) }), /behöver ett namn/);
    await assert.rejects(() => laddaUppTema('X CRO', { zipSokvag: '/finns/inte.zip', graphql: async () => ({}) }), /Temazip saknas/);

    const avvisad = fejkGraphql({ opsFactoryTemanViaNamn: ingaTeman, opsFactoryStaged: { stagedUploadsCreate: { stagedTargets: [], userErrors: [{ message: 'för stor' }] } } });
    await assert.rejects(() => laddaUppTema('X CRO', { zipSokvag: zip, graphql: avvisad.g, fetch: fetchOk, vanta: ingenVantan }), /stagedUploadsCreate: för stor/);

    const nekad = fejkGraphql({ opsFactoryTemanViaNamn: ingaTeman, opsFactoryStaged: staged });
    await assert.rejects(
      () => laddaUppTema('X CRO', { zipSokvag: zip, graphql: nekad.g, fetch: async () => ({ ok: false, status: 403, text: async () => 'Access denied' }), vanta: ingenVantan }),
      /s3\.example nekades \(403\): Access denied/
    );

    const temaFel = fejkGraphql({ opsFactoryTemanViaNamn: ingaTeman, opsFactoryStaged: staged, opsFactoryTemaSkapa: { themeCreate: { theme: null, userErrors: [{ message: 'ogiltig zip' }] } } });
    await assert.rejects(() => laddaUppTema('X CRO', { zipSokvag: zip, graphql: temaFel.g, fetch: fetchOk, vanta: ingenVantan }), /themeCreate: ogiltig zip/);

    const aldrigKlar = fejkGraphql({ opsFactoryTemanViaNamn: ingaTeman, opsFactoryStaged: staged, opsFactoryTemaSkapa: skapat, opsFactoryTemaStatus: vantar });
    await assert.rejects(() => laddaUppTema('X CRO', { zipSokvag: zip, graphql: aldrigKlar.g, fetch: fetchOk, vanta: ingenVantan, forsok: 3 }), /aldrig färdigprocessat efter 3 kontroller/);
  } finally {
    stada();
  }
});

test('laddaUppTema varnar via logg när namnet saknar CRO', async () => {
  const { zip, stada } = tempZip();
  const rader = [];
  const { g } = fejkGraphql({ opsFactoryTemanViaNamn: ingaTeman, opsFactoryStaged: staged, opsFactoryTemaSkapa: skapat, opsFactoryTemaStatus: klart });
  try {
    await laddaUppTema('TackleBay v1', { zipSokvag: zip, graphql: g, fetch: fetchOk, vanta: ingenVantan, logg: (r) => rader.push(r) });
    assert.ok(rader.some((r) => /saknar ordet CRO/.test(r)));
  } finally {
    stada();
  }
});
