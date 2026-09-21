// Tester för körningen: registret, insatserna och kvittot som committas.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lasPersoner, sparaPerson, lasInsatser, skrivInsats, manadsperiod, spara, lasRegler } from '../kor.mjs';

const tmp = mkdtempSync(join(tmpdir(), 'bonus-test-'));
test.after(() => rmSync(tmp, { recursive: true, force: true }));

test('månadsperioden täcker hela månaden', () => {
  assert.deepEqual(manadsperiod('2026-09'), { namn: '2026-09', fran: '2026-09-01', till: '2026-09-30' });
  assert.deepEqual(manadsperiod('2026-02'), { namn: '2026-02', fran: '2026-02-01', till: '2026-02-28' });
  assert.equal(manadsperiod(null, new Date('2026-09-21T10:00:00Z')).namn, '2026-09');
});

test('personregistret slår ihop basen med sajtens tillägg', () => {
  const extra = join(tmp, 'personer-extra.json');
  sparaPerson({ id: 'maria', namn: 'Maria Santos', fornamn: 'Maria', roll: 'va', brands: ['baverbutiken'] }, extra);
  const alla = lasPersoner(undefined, extra);
  assert.ok(alla.some((p) => p.id === 'josh'), 'basregistret ska följa med');
  const maria = alla.find((p) => p.id === 'maria');
  assert.equal(maria.roll, 'va');
  assert.deepEqual(maria.brands, ['baverbutiken']);
});

test('tillägget vinner över basen vid samma id', () => {
  const extra = join(tmp, 'personer-extra.json');
  sparaPerson({ id: 'josh', namn: 'Josh Naelga', roll: 'redigerare', extraRoller: ['produkttest'] }, extra);
  const josh = lasPersoner(undefined, extra).find((p) => p.id === 'josh');
  assert.deepEqual(josh.extraRoller, ['produkttest']);
  assert.equal(josh.notionNamn, 'Josh Naelga', 'fält ur basen ska finnas kvar');
});

test('insatser: senaste raden per id vinner', () => {
  const fil = join(tmp, 'insatser.jsonl');
  skrivInsats({ id: 'a1', personId: 'maria', uppdrag: 'recension_med_namn', status: 'vantar', datum: '2026-09-10' }, fil);
  skrivInsats({ id: 'a1', personId: 'maria', uppdrag: 'recension_med_namn', status: 'godkand', datum: '2026-09-10', beslutAv: 'Hanna' }, fil);
  skrivInsats({ id: 'a2', personId: 'ella', uppdrag: 'tvist_vunnen', status: 'vantar', datum: '2026-09-11' }, fil);
  const i = lasInsatser(fil);
  assert.equal(i.length, 2);
  assert.equal(i.find((x) => x.id === 'a1').status, 'godkand');
});

test('en trasig rad i insatsfilen tar inte ner resten', () => {
  const fil = join(tmp, 'trasig.jsonl');
  writeFileSync(fil, '{"id":"ok1","status":"vantar"}\n{inte json\n{"id":"ok2","status":"godkand"}\n');
  const i = lasInsatser(fil);
  assert.equal(i.length, 2);
});

test('kvittot bär summan men inte varje recensionstext', () => {
  const utfall = {
    period: manadsperiod('2026-09'),
    valuta: 'USD',
    summa: 25,
    personer: [{
      id: 'maria', namn: 'Maria', roll: 'va', summa: 25,
      rader: [{
        uppdrag: 'recension_med_namn', namn: 'Recension', antal: 25, summa: 25,
        bevis: Array.from({ length: 25 }, (_, n) => ({ vad: `5★ ${n}`, datum: '2026-09-10', text: 'x'.repeat(200), lank: '' })),
      }],
    }],
    otilldelat: [
      ...Array.from({ length: 600 }, () => ({ uppdrag: 'recension_med_namn', orsak: 'inget (eller flera) namn i texten', bevis: { text: 'x'.repeat(200) } })),
      { uppdrag: 'produkt_godkand', orsak: '"Josh" har inget konto', summa: 5 },
    ],
    detaljer: { recensioner: { senaste: Array.from({ length: 60 }, () => ({ text: 'x'.repeat(200) })) } },
  };
  const fil = spara(utfall, tmp);
  const sparat = JSON.parse(readFileSync(fil, 'utf8'));

  assert.equal(sparat.summa, 25, 'summan är hela poängen med kvittot');
  assert.equal(sparat.personer[0].rader[0].antal, 25);
  assert.equal(sparat.personer[0].rader[0].bevis.length, 10, 'högst tio bevis per rad');
  assert.ok(sparat.personer[0].rader[0].bevis[0].text.length <= 80);
  assert.equal(sparat.otilldelat.length, 2, 'otilldelat grupperas per orsak');
  assert.equal(sparat.otilldelat[0].antal, 600);
  assert.equal(sparat.detaljer, undefined, 'detaljerna hör hemma i snapshoten');
  assert.ok(readFileSync(fil, 'utf8').length < 60_000, 'kvittot ska vara litet — det committas varje körning');
});

test('reglerna går att läsa och har fyra program', () => {
  const r = lasRegler();
  assert.deepEqual(Object.keys(r.program).sort(), ['produkttest', 'redigerare', 'support_chef', 'va']);
  assert.equal(r.valuta, 'USD');
});
