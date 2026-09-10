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
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { tillCron, arSommartid, granska, byggForslag, connectorsFor, harIngaConnectors, INGA_CONNECTORS } from '../rutin.mjs';

const SOMMAR = new Date('2026-07-15T12:00:00Z');
const VINTER = new Date('2026-12-15T12:00:00Z');

// Tillfällig kommandokatalog. Den riktiga notionscalercs.md skrivs av en annan
// session och får aldrig vara testets facit — fixturen är det.
function fixturkatalog() {
  const katalog = mkdtempSync(join(tmpdir(), 'rutin-fixtur-'));
  writeFileSync(join(katalog, 'notionscalercs.md'), [
    '# /notionscalercs <butik> — nattvakten',
    `${INGA_CONNECTORS} — Notion via NOTION_TOKEN och REST, Meta via META_ACCESS_TOKEN, Discord via DISCORD_WEBHOOK_URL.`,
    'Läser Notion-hubben, skriver briefer, postar i Discord.',
  ].join('\n'));
  writeFileSync(join(katalog, 'med-notion.md'), '# /med-notion\nLäser Notion-hubben via mcp__Notion och Slack.\n');
  writeFileSync(join(katalog, 'notionkorning.md'), '# /notionkorning\nNotion.\n');
  writeFileSync(join(katalog, 'cs.md'), '# /cs\nCreative strategy.\n');
  return katalog;
}

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

test('nattvakten 00:01 blir 1 22 på sommaren och 1 23 på vintern — dagen före i UTC, med flit', () => {
  // Rutinen går varje natt; dagskiftet betyder bara att UTC-datumet är
  // gårdagens. Skriptet räknar svensk dag själv (register.mjs svenskDatum),
  // så cronen ska INTE "rättas".
  const s = tillCron('00:01', { datum: SOMMAR });
  assert.equal(s.cron, '1 22 * * *');
  assert.equal(s.cronSommar, '1 22 * * *');
  assert.equal(s.cronVinter, '1 23 * * *');
  assert.equal(s.dagskifte, -1);
  const v = tillCron('00:01', { datum: VINTER });
  assert.equal(v.cron, '1 23 * * *');
  assert.equal(v.dagskifte, -1);
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

test('dubblettspärren matchar kommandonamnet med ordgräns — "/cs" är inte "/notionscalercs"', () => {
  const katalog = fixturkatalog();
  const rutiner = [{ id: 'trig_1', name: 'Nattvakten: tankguard', prompt: '/notionscalercs tankguard' }];
  const cs = granska({ kommando: '/cs motorholjet', gren: 'main', rutiner, katalog });
  assert.ok(!cs.hinder.some((h) => /redan/.test(h)), '"/cs" får inte stoppas av en notionscalercs-rutin');

  // Exakt samma kommando är fortfarande en dubblett.
  const dubbel = granska({ kommando: '/notionscalercs tankguard', butik: 'tankguard', gren: 'main', rutiner, katalog });
  assert.ok(dubbel.hinder.some((h) => /redan/.test(h) && /Nattvakten: tankguard/.test(h)));
});

test('dubblettspärren med butik: butik A:s rutin stoppar inte butik B:s', () => {
  const katalog = fixturkatalog();
  const rutiner = [
    { id: 'trig_1', name: 'Nattvakten: tankguard', prompt: '/notionscalercs tankguard' },
    { id: 'trig_2', name: 'skalningskungen — drytrek', prompt: '/skalningskungen drytrek' },
  ];
  const drytrek = granska({ kommando: '/notionscalercs drytrek', butik: 'drytrek', gren: 'main', rutiner, katalog });
  assert.ok(!drytrek.hinder.some((h) => /redan/.test(h)), 'tankguards nattvakt är ingen dubblett av drytreks');

  const tank = granska({ kommando: '/notionscalercs tankguard', butik: 'tankguard', gren: 'main', rutiner, katalog });
  assert.ok(tank.hinder.some((h) => /redan/.test(h) && /trig_1/.test(h)));

  // Utan butik angiven räknas varje rutin med kommandot — hellre ett stopp för mycket.
  const utan = granska({ kommando: '/notionscalercs', gren: 'main', rutiner, katalog });
  assert.ok(utan.hinder.some((h) => /redan/.test(h)));
});

test('CONNECTORS: inga i kommandofilen ger noll connectors trots att Notion nämns', () => {
  const katalog = fixturkatalog();
  assert.equal(harIngaConnectors('notionscalercs', katalog), true);
  assert.deepEqual(connectorsFor('notionscalercs', { katalog }), []);
  // Kontrollen: en fil utan markören läses som förut.
  assert.equal(harIngaConnectors('med-notion', katalog), false);
  assert.deepEqual(connectorsFor('med-notion', { katalog }), ['Notion', 'Slack']);

  const r = granska({ kommando: '/notionscalercs tankguard', butik: 'tankguard', gren: 'main', katalog });
  assert.ok(r.varningar.some((v) => /INGA connectors/.test(v) && /env-nycklar/.test(v)));
  assert.ok(!r.varningar.some((v) => /ärvs INTE/.test(v)), 'ingen uppmaning att koppla connectors');
  assert.ok(!r.hinder.some((h) => /finns inte/.test(h)), 'kommandofilen finns i fixturen');
});

test('nattvakten får sitt eget namn, sessionstitel och taggar', () => {
  const katalog = fixturkatalog();
  const f = byggForslag({ kommando: '/notionscalercs tankguard', tid: '00:01', butik: 'tankguard', gren: 'main', datum: SOMMAR, katalog });
  assert.equal(f.rutinnamn, 'Nattvakten: tankguard');
  assert.equal(f.sessionstitel, 'Rutin: Nattvakten tankguard');
  assert.deepEqual(f.taggar, ['routine:notionscalercs', 'butik:tankguard']);
  assert.equal(f.cron, '1 22 * * *');
  assert.equal(f.dagskifte, -1);
  const skapa = f.steg.find((s) => s.verktyg === 'create_session');
  assert.equal(skapa.argument.title, 'Rutin: Nattvakten tankguard');
  assert.deepEqual(skapa.argument.tags, f.taggar);
  const trigger = f.steg.find((s) => s.verktyg === 'create_trigger');
  assert.equal(trigger.argument.name, 'Nattvakten: tankguard');
  assert.equal(trigger.argument.cron_expression, '1 22 * * *');
  // Andra kommandon namnges som förut.
  assert.equal(byggForslag({ kommando: '/skalningskungen tankguard', tid: '07:00', butik: 'tankguard', gren: 'main', datum: SOMMAR, katalog }).rutinnamn, 'skalningskungen — tankguard');
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
