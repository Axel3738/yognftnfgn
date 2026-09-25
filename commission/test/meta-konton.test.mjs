// commission/meta.mjs: hamtaKonton ska hitta konton som token:en NÅR men som
// `me/adaccounts` inte listar.
//
// Bakgrunden är mätt, inte tänkt (2026-09-25): listan gav fem konton, men
// `act_730973156224390` ("nya kungen", Matstrumpor) svarade 200 på ett
// direktanrop. Kontot föll alltså ur varje commission-körning utan att något
// syntes — inte för att behörigheten saknades, utan för att listningen är
// snävare än åtkomsten. Ett nekat konto ska däremot FORTSÄTTA saknas, så att
// kontospärren i run.mjs fyrar på det.

import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hamtaKonton } from '../meta.mjs';

const LISTAT = '1867947880635861';
const ONADDT_MEN_LASBART = '730973156224390';
const NEKAT = '1346450049878358';

/** En kanda-konton.json på disk, så testet inte är bundet till repots egen. */
function kandaKontonFil(konton) {
  const mapp = mkdtempSync(join(tmpdir(), 'kanda-'));
  const fil = join(mapp, 'kanda-konton.json');
  writeFileSync(fil, JSON.stringify({ konton }), 'utf8');
  return fil;
}

const env = { META_ACCESS_TOKEN: 'test' };

/** Härmar Graph: listan bär ett konto, direktanropen svarar olika. */
function fejkatMeta() {
  const anrop = [];
  const fetchImpl = async (url) => {
    anrop.push(url);
    if (url.includes('me%2Fadaccounts') || url.includes('me/adaccounts')) {
      return { json: async () => ({ data: [
        { account_id: LISTAT, name: 'MagiBorsten', currency: 'SEK', account_status: 1 },
      ] }) };
    }
    if (url.includes(`act_${ONADDT_MEN_LASBART}`)) {
      return { json: async () => ({
        account_id: ONADDT_MEN_LASBART, name: 'nya kungen', currency: 'SEK', account_status: 1,
      }) };
    }
    return { json: async () => ({ error: { message: '(#200) Ad account owner has NOT grant ads_read' } }) };
  };
  return { fetchImpl, anrop };
}

test('hamtaKonton: konto som listan missar men token:en når räknas med', async () => {
  const { fetchImpl } = fejkatMeta();
  const konton = await hamtaKonton({
    fetchImpl,
    env,
    kandaKontonFil: kandaKontonFil([
      { id: LISTAT, namn: 'MagiBorsten' },
      { id: ONADDT_MEN_LASBART, namn: 'nya kungen' },
    ]),
  });
  const ids = konton.map((k) => String(k.id));
  assert.deepEqual(ids.sort(), [LISTAT, ONADDT_MEN_LASBART].sort());
  const extra = konton.find((k) => String(k.id) === ONADDT_MEN_LASBART);
  assert.equal(extra.namn, 'nya kungen');
  assert.equal(extra.valuta, 'SEK', 'valutan måste följa med — SEK och USD summeras aldrig');
  assert.equal(extra.utanforListan, true, 'ska gå att se att kontot kom utanför listan');
});

test('hamtaKonton: nekat konto förblir saknat, så kontospärren fyrar på det', async () => {
  const { fetchImpl } = fejkatMeta();
  const konton = await hamtaKonton({
    fetchImpl,
    env,
    kandaKontonFil: kandaKontonFil([
      { id: LISTAT, namn: 'MagiBorsten' },
      { id: NEKAT, namn: 'SnarkLös' },
    ]),
  });
  assert.deepEqual(konton.map((k) => String(k.id)), [LISTAT]);
});

test('hamtaKonton: ett konto listan redan bär frågas aldrig en gång till', async () => {
  const { fetchImpl, anrop } = fejkatMeta();
  await hamtaKonton({
    fetchImpl,
    env,
    kandaKontonFil: kandaKontonFil([{ id: LISTAT, namn: 'MagiBorsten' }]),
  });
  assert.equal(anrop.filter((u) => u.includes(`act_${LISTAT}`)).length, 0);
});

test('hamtaKonton: utan kanda-konton.json blir det inga extra anrop', async () => {
  const { fetchImpl, anrop } = fejkatMeta();
  const konton = await hamtaKonton({
    fetchImpl,
    env,
    kandaKontonFil: join(tmpdir(), 'finns-inte-alls-4711.json'),
  });
  assert.deepEqual(konton.map((k) => String(k.id)), [LISTAT]);
  assert.equal(anrop.length, 1, 'bara listningen — filen är en komplettering, aldrig ett krav');
});
