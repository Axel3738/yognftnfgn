import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { backDagarIRad, dagarSedanAndring, lasLogg, raknaTrasigaRader, skrivRad } from '../logg.mjs';

async function tempfil(innehall) {
  const mapp = await mkdtemp(join(tmpdir(), 'rond-'));
  const fil = join(mapp, 'budgetlogg.jsonl');
  if (innehall !== undefined) await writeFile(fil, innehall, 'utf8');
  return fil;
}

const rad = (extra = {}) => ({
  datum: '2026-08-20',
  kampanj_id: '111',
  kampanj_namn: 'Testprodukten | BE ROAS 1.50',
  ad_account_id: '1867947880635861',
  kod: 'SANK',
  ny_budget: 800,
  genomford: true,
  ...extra,
});

test('lasLogg på en fil som inte finns ger tom lista', async () => {
  assert.deepEqual(await lasLogg(join(tmpdir(), 'finns-inte-alls.jsonl')), []);
});

test('lasLogg hoppar över trasiga rader men behåller de hela', async () => {
  const fil = await tempfil(`${JSON.stringify(rad())}\ninte json alls\n\n${JSON.stringify(rad({ datum: '2026-08-22' }))}\n`);
  const logg = await lasLogg(fil);
  assert.equal(logg.length, 2);
  assert.equal(await raknaTrasigaRader(fil), 1);
});

test('dagarSedanAndring räknar hela dygn sedan senaste genomförda ändring', () => {
  const logg = [rad({ datum: '2026-08-20' }), rad({ datum: '2026-08-26' })];
  assert.equal(dagarSedanAndring(logg, '111', '2026-08-28'), 2);
  assert.equal(dagarSedanAndring(logg, '111', '2026-08-26'), 0);
});

test('ett förslag som aldrig godkändes bromsar inte nästa rond', () => {
  const logg = [
    rad({ datum: '2026-08-20', genomford: true }),
    rad({ datum: '2026-08-27', genomford: false }),
  ];
  assert.equal(dagarSedanAndring(logg, '111', '2026-08-28'), 8);
});

test('rader utan ny budget räknas inte som en ändring', () => {
  const logg = [
    rad({ datum: '2026-08-20', genomford: true }),
    rad({ datum: '2026-08-27', kod: 'LAT_VARA', ny_budget: null, genomford: true }),
  ];
  assert.equal(dagarSedanAndring(logg, '111', '2026-08-28'), 8);
});

test('en kampanj vi aldrig ändrat ger null, inte noll', () => {
  assert.equal(dagarSedanAndring([rad()], '999', '2026-08-28'), null);
  assert.equal(dagarSedanAndring([], '111', '2026-08-28'), null);
});

test('dagarSedanAndring vägrar ett trasigt datum', () => {
  assert.throws(() => dagarSedanAndring([], '111', 'igår'), /Ogiltigt datum/);
});

test('backDagarIRad räknar bakifrån och stannar vid första plusdygnet', () => {
  const dygn = [
    { datum: '2026-08-24', roas: 2.0 },
    { datum: '2026-08-25', roas: 1.2 },
    { datum: '2026-08-26', roas: 1.1 },
    { datum: '2026-08-27', roas: 1.3 },
  ];
  assert.equal(backDagarIRad(dygn, 1.5), 3);
  assert.equal(backDagarIRad(dygn, 1.0), 0);
});

test('backDagarIRad utan dygnsserie ger null, inte noll', () => {
  assert.equal(backDagarIRad(undefined, 1.5), null);
  assert.equal(backDagarIRad([], 1.5), null);
  assert.equal(backDagarIRad([{ datum: '2026-08-27', roas: 1.2 }], null), null);
});

test('skrivRad lägger till en rad utan att röra de gamla', async () => {
  const fil = await tempfil(`${JSON.stringify(rad())}\n`);
  await skrivRad(rad({ datum: '2026-08-28', ny_budget: 650 }), fil);
  const logg = await lasLogg(fil);
  assert.equal(logg.length, 2);
  assert.equal(logg[0].ny_budget, 800);
  assert.equal(logg[1].ny_budget, 650);
  assert.ok((await readFile(fil, 'utf8')).endsWith('\n'));
});

test('skrivRad vägrar en rad som inte går att tolka i efterhand', async () => {
  const fil = await tempfil('');
  await assert.rejects(() => skrivRad({ datum: '2026-08-28' }, fil), /saknar "kampanj_id"/);
  await assert.rejects(() => skrivRad(rad({ ad_account_id: '' }), fil), /saknar "ad_account_id"/);
});
