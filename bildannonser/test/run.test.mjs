import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TILLATEN_TYP,
  granskaJobb,
  granskaJobbfil,
  tillFilnamn,
  tolkaArgument,
  koraIPuljer,
  koraJobb,
} from '../run.mjs';

const bildjobb = (extra = {}) => ({
  namn: 'Beltgrinder_PD_4_1',
  typ: TILLATEN_TYP,
  prompt: 'Ljus verkstad, mejsel mot slipbandet.',
  ...extra,
});

test('videorader stoppas i koden, inte bara i kommandofilen', () => {
  assert.throws(
    () => granskaJobb(bildjobb({ typ: 'Video - Pending Approval' }), 0),
    /Videoannonser görs av redigerarna/,
  );
  assert.throws(() => granskaJobb(bildjobb({ typ: undefined }), 0), /Typ är "saknas"/);
  assert.throws(() => granskaJobb(bildjobb({ typ: 'Winning Creative' }), 0), /får genereras/);
});

test('granskaJobb fyller i standardvärden för ett giltigt bildjobb', () => {
  const j = granskaJobb(bildjobb(), 0);
  assert.equal(j.bildformat, '4:5');
  assert.equal(j.filformat, 'png');
  assert.deepEqual(j.referens_bilder, []);
});

test('granskaJobb vägrar tom prompt och okänt bildformat', () => {
  assert.throws(() => granskaJobb(bildjobb({ prompt: '   ' }), 0), /tom prompt/);
  assert.throws(() => granskaJobb(bildjobb({ bildformat: '7:3' }), 0), /ogiltigt bildformat/);
});

test('felmeddelandet namnger annonsen så Axel ser vilken rad som strular', () => {
  assert.throws(() => granskaJobb(bildjobb({ prompt: '' }), 4), /Jobb #5 \(Beltgrinder_PD_4_1\)/);
});

test('granskaJobbfil fångar dubbletter och saknad jobblista', () => {
  assert.throws(() => granskaJobbfil({}), /saknar listan "jobb"/);
  assert.throws(
    () => granskaJobbfil({ jobb: [bildjobb(), bildjobb()] }),
    /Dubblett i jobbfilen/,
  );
  assert.equal(granskaJobbfil({ jobb: [bildjobb()] }).length, 1);
});

test('tillFilnamn gör annonsnamnet säkert på disk', () => {
  assert.equal(tillFilnamn('Beltgrinder_PD_4_1', 'png'), 'Beltgrinder_PD_4_1.png');
  assert.equal(tillFilnamn('Trimmerbelt PD/16 #1 ', 'jpeg'), 'Trimmerbelt_PD_16_1.jpeg');
});

test('tolkaArgument läser flaggorna', () => {
  const a = tolkaArgument(['--jobb=x.json', '--dry', '--ut=/tmp/u', '--samtidiga=3']);
  assert.deepEqual(a, { jobbfil: 'x.json', utMapp: '/tmp/u', dry: true, samtidiga: 3 });
});

test('--dry beskriver planen utan att röra kie.ai', async () => {
  const r = await koraJobb(granskaJobb(bildjobb({ hub: 'Belt grinder creative hub' }), 0), {
    utMapp: '/tmp/u',
    dry: true,
  });
  assert.equal(r.status, 'dry');
  assert.equal(r.fil, '/tmp/u/Beltgrinder_PD_4_1.png');
  assert.equal(r.hub, 'Belt grinder creative hub');
});

test('koraIPuljer kör allt men aldrig fler än tillåtet samtidigt', async () => {
  let aktiva = 0;
  let toppNotering = 0;
  const jobb = Array.from({ length: 7 }, (_, i) => i);
  const resultat = await koraIPuljer(
    jobb,
    async (n) => {
      aktiva += 1;
      toppNotering = Math.max(toppNotering, aktiva);
      await new Promise((r) => setTimeout(r, 1));
      aktiva -= 1;
      return n * 2;
    },
    2,
  );
  assert.deepEqual(resultat, [0, 2, 4, 6, 8, 10, 12]);
  assert.ok(toppNotering <= 2, `körde ${toppNotering} samtidigt, max var 2`);
});
