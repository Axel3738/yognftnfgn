// Tester för rutinbyggaren. Ingen nätverkstrafik, inget skapas.
// Kör: node --test factory/test/*.test.mjs
//
// De tre felen som testas här har alla hänt på riktigt:
//   1. cron satt i UTC utan att räkna om från svensk tid, och utan att
//      halvåret byttes vid omställningen
//   2. rutin skapad med "ny session varje gång" — kunde inte pusha
//   3. dubblett skapad av misstag (2026-09-08) och fick raderas

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tillCron, arSommartid, granska, byggForslag, connectorsFor } from '../rutin.mjs';

const SOMMAR = new Date('2026-07-15T12:00:00Z');
const VINTER = new Date('2026-12-15T12:00:00Z');

test('sommartiden börjar och slutar sista söndagen i mars och oktober', () => {
  assert.equal(arSommartid(SOMMAR), true);
  assert.equal(arSommartid(VINTER), false);
  // 2026: sista söndagen i mars är den 29:e, i oktober den 25:e.
  assert.equal(arSommartid(new Date('2026-03-29T00:59:00Z')), false, 'strax före omställningen');
  assert.equal(arSommartid(new Date('2026-03-29T01:00:00Z')), true, 'precis vid omställningen');
  assert.equal(arSommartid(new Date('2026-10-25T00:59:00Z')), true);
  assert.equal(arSommartid(new Date('2026-10-25T01:00:00Z')), false);
});

test('svensk tid räknas om till UTC — samma tal som husets sex rutiner', () => {
  // Facit är tabellen i CLAUDE.md, satt för CEST.
  const cest = (t) => tillCron(t, { datum: SOMMAR }).cron;
  assert.equal(cest('04:15'), '15 2 * * *');
  assert.equal(cest('05:30'), '30 3 * * *');
  assert.equal(cest('06:00'), '0 4 * * *');
  assert.equal(cest('13:20'), '20 11 * * *');
  assert.equal(cest('15:00'), '0 13 * * *');
  assert.equal(cest('20:00'), '0 18 * * *');
});

test('samma klockslag ger olika cron sommar och vinter', () => {
  // Regeln som är lätt att minnas fel: vid vintertid ÖKAS timmen, för
  // Sverige ligger då bara en timme före UTC.
  const t = tillCron('13:20', { datum: SOMMAR });
  assert.equal(t.cronSommar, '20 11 * * *');
  assert.equal(t.cronVinter, '20 12 * * *');
  assert.equal(t.cron, t.cronSommar, 'i juli gäller sommarcronen');
  assert.equal(t.maste_andras_vid_omstallning, true);

  const v = tillCron('13:20', { datum: VINTER });
  assert.equal(v.cron, '20 12 * * *', 'i december gäller vintercronen');
});

test('en tid som korsar midnatt vid omräkningen flaggas', () => {
  // 00:30 svensk tid är 22:30 UTC DAGEN FÖRE. Utan flaggan skulle en
  // veckodagsbunden rutin gå fel dag.
  const t = tillCron('00:30', { datum: SOMMAR });
  assert.equal(t.cron, '30 22 * * *');
  assert.equal(t.dagskifte, -1);
  // En tid mitt på dagen korsar ingenting.
  assert.equal(tillCron('13:20', { datum: SOMMAR }).dagskifte, 0);
});

test('veckodagar följer med i cronen', () => {
  assert.equal(tillCron('09:00', { dagar: '1-5', datum: SOMMAR }).cron, '0 7 * * 1-5');
});

test('en tid som inte går att läsa stoppar i stället för att gissa', () => {
  assert.throws(() => tillCron('kvart över sju'), /går inte att läsa/);
  assert.throws(() => tillCron('25:00'), /giltig tid/);
  assert.throws(() => tillCron('13:99'), /giltig tid/);
});

// -------------------------------------------------- spärrarna

test('en rutin får inte byggas från en gren — den klonar main', () => {
  const r = granska({ kommando: '/notionkorning', gren: 'claude/nagot' });
  assert.equal(r.ok, false);
  assert.ok(r.hinder.some((h) => /main/.test(h)), 'grenen ska stoppa bygget');

  const påMain = granska({ kommando: '/notionkorning', gren: 'main' });
  assert.ok(!påMain.hinder.some((h) => /main/.test(h)));
});

test('ett kommando som inte finns stoppar — rutinen hade inte hittat något', () => {
  const r = granska({ kommando: '/finns-inte-alls', gren: 'main' });
  assert.equal(r.ok, false);
  assert.ok(r.hinder.some((h) => /finns inte/.test(h)));
});

test('en dubblett stoppar i stället för att skapas', () => {
  // Hände 2026-09-08: en andra rutin för samma jobb byggdes av misstag och
  // fick raderas. Båda körde under tiden.
  const r = granska({
    kommando: '/notionkorning',
    gren: 'main',
    rutiner: [{ id: 'trig_1', name: 'Leveransrundan', prompt: '/notionkorning' }],
  });
  assert.equal(r.ok, false);
  assert.ok(r.hinder.some((h) => /redan/.test(h) && /Leveransrundan/.test(h)));
});

test('en butik som inte är byggd stoppar', () => {
  const r = granska({ kommando: '/skalningskungen', butik: 'finns-inte', gren: 'main' });
  assert.ok(r.hinder.some((h) => /butiker\/finns-inte/.test(h)));
});

test('connectors varnar men stoppar aldrig — de kopplas på rutinen', () => {
  const r = granska({ kommando: '/notionkorning', gren: 'main' });
  assert.ok(r.varningar.some((v) => /Notion/.test(v) && /ärvs INTE/.test(v)));
  assert.ok(!r.hinder.some((h) => /connector/i.test(h)), 'connectors är ingen blockad');
});

test('connectorsFor läser kommandofilen, den gissar inte', () => {
  assert.ok(connectorsFor('notionkorning').includes('Notion'));
  assert.deepEqual(connectorsFor('finns-inte-alls'), []);
});

// -------------------------------------------------- förslaget

test('förslaget binder rutinen till en fast session med main som utgren', () => {
  // Utan detta kan rutinen inte pusha, och allt den lär sig dör med
  // containern. Mätt tre gånger i rad.
  const f = byggForslag({ kommando: '/skalningskungen tankguard', tid: '07:00', butik: 'tankguard', gren: 'main', datum: SOMMAR });
  const skapa = f.steg.find((s) => s.verktyg === 'create_session');
  assert.equal(skapa.argument.outcome_branch, 'main');
  assert.ok(skapa.argument.source_url.includes('github.com'));

  const trigger = f.steg.find((s) => s.verktyg === 'create_trigger');
  assert.ok('persistent_session_id' in trigger.argument, 'triggern måste bindas till sessionen');
  assert.equal(trigger.argument.cron_expression, '0 5 * * *');
  assert.equal(trigger.argument.prompt, '/skalningskungen tankguard');
});

test('rutinen taggas med kommando och butik så den går att hitta igen', () => {
  const f = byggForslag({ kommando: '/skalningskungen tankguard', tid: '07:00', butik: 'tankguard', gren: 'main', datum: SOMMAR });
  assert.ok(f.taggar.includes('routine:skalningskungen'));
  assert.ok(f.taggar.includes('butik:tankguard'));
  assert.equal(f.rutinnamn, 'skalningskungen — tankguard');
});
