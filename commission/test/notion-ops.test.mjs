// commission/notion.mjs: hittaHubbar ska aldrig räkna OPS-butikernas hubbar
// (annat konto, egen rutin). Sökningen mockas via fetchImpl — inga nätanrop.

import test from 'node:test';
import assert from 'node:assert/strict';
import { hittaHubbar, hubbarUrProdukter } from '../notion.mjs';
import { opsHubbarUrRegister } from '../../tools/lib/ops-hubbar.mjs';

const HEIM = '3cd270ab-908c-81bd-aab8-f19ec3e2d260';
const NY = '3ff270ab-908c-8000-aaaa-000000000001';

const svar = (json) => Promise.resolve({ ok: true, status: 200, json: async () => json });
const fetchImpl = async () => svar({ results: [
  { id: HEIM, title: [{ plain_text: 'Surveillance Camera creative hub' }], url: 'x' },
  { id: NY, title: [{ plain_text: 'Ny produkt creative hub' }], url: 'y' },
] });

test('hittaHubbar: OPS-hub per id försvinner, ny Bäverbutikshub och products.json-golvet är kvar', async () => {
  const opsKarta = opsHubbarUrRegister({ poster: {
    'hemvakten/overvakningskameran': { notion: { name: 'Surveillance Camera creative hub', database_id: HEIM } },
  } });
  const sparad = console.error;
  const loggat = [];
  console.error = (r) => loggat.push(String(r));
  let hubbar;
  try {
    hubbar = await hittaHubbar({ fetchImpl, env: { NOTION_TOKEN: 'test' }, opsKarta });
  } finally {
    console.error = sparad;
  }
  const ids = new Set(hubbar.map((h) => String(h.id).replace(/-/g, '')));
  assert.equal(ids.has(HEIM.replace(/-/g, '')), false, 'OPS-hubben ska bort — även om hubbar.json listar den');
  assert.ok(ids.has(NY.replace(/-/g, '')), 'nya Bäverbutikshubbar kommer med av sig själva');
  for (const p of hubbarUrProdukter()) assert.ok(ids.has(String(p.id).replace(/-/g, '')), `golvet saknar ${p.namn}`);
  assert.ok(loggat.some((r) => /OPS-hubbar undantagna: 1 \(Surveillance Camera creative hub\)/.test(r)));
});

test('hittaHubbar utan OPS-id:n i registret är en no-op med loggrad', async () => {
  const sparad = console.error;
  const loggat = [];
  console.error = (r) => loggat.push(String(r));
  let hubbar;
  try {
    hubbar = await hittaHubbar({ fetchImpl, env: { NOTION_TOKEN: 'test' }, opsKarta: new Map() });
  } finally {
    console.error = sparad;
  }
  assert.ok(hubbar.some((h) => String(h.id).replace(/-/g, '') === HEIM.replace(/-/g, '')));
  assert.ok(loggat.some((r) => /OPS-hubbar undantagna: 0/.test(r)));
});

test('arkiverade hubbar (nedlagda produkter, Axels besked 2026-09-22) läses inte och krävs inte', async () => {
  const { hubbarUrFil, hubbarUrProdukter, arkiveradeHubbar } = await import('../notion.mjs');
  const ark = arkiveradeHubbar();
  assert.equal(ark.size, 9);
  assert.ok(ark.has('3b0270ab908c80a78793fa11d8c0f6e4'), 'Boat cover 420D är arkiverad');
  const fil = hubbarUrFil().map((h) => String(h.id).replace(/-/g, ''));
  assert.ok(!fil.some((id) => ark.has(id)), 'ingen arkiverad hubb i golvet ur filen');
  const prod = hubbarUrProdukter().map((h) => String(h.id).replace(/-/g, ''));
  assert.ok(!prod.some((id) => ark.has(id)), 'ingen arkiverad hubb i golvet ur products.json');
  assert.ok(fil.length >= 14, `golvet ur filen är ${fil.length} hubbar`);
});
