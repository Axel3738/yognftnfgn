import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ZONER,
  STILAR,
  SPARR_SENASTE,
  lasKoncept,
  granskaBibliotek,
  valjKoncept,
  promptSkelett,
  specSkelett,
  kontrolleraJobbfil,
  loggrader,
  produktUr,
} from '../koncept.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));
const TEXT_PY = readFileSync(path.join(HAR, '..', 'text.py'), 'utf8');

test('ZONER och STILAR speglar text.py', () => {
  const zonrad = TEXT_PY.match(/ZONER = \{([^}]+)\}/s)[1];
  const zoner = new Set([...zonrad.matchAll(/"([^"]+)"/g)].map((m) => m[1]));
  assert.deepEqual([...zoner].sort(), [...ZONER].sort());
  const stilblock = TEXT_PY.match(/STILAR = \{(.+?)\n\}/s)[1];
  const stilar = new Set([...stilblock.matchAll(/^\s*"([a-z]+)":\s*\{/gm)].map((m) => m[1]));
  assert.deepEqual([...stilar].sort(), [...STILAR].sort());
});

test('biblioteket på disk är giltigt och varje koncept pekar på en källa', () => {
  const bib = lasKoncept();
  assert.ok(bib.koncept.length >= 15);
  for (const k of bib.koncept) {
    assert.match(k.kalla, /Evolve|Kontots egen|ITERATIONS-PLAYBOOK/, `${k.id} saknar källa`);
    assert.ok(k.sa_ser_den_ut.length > 40, `${k.id} beskriver inte hur den ser ut`);
  }
  const klara = bib.koncept.filter((k) => k.status === 'klar');
  assert.ok(klara.length >= 12, 'minst tolv koncept ska gå att rendera i dag');
});

test('ett klart koncept får inte använda en zon text.py saknar', () => {
  const bib = {
    koncept: [{
      id: 'K99', namn: 'Test', kalla: 'Evolve', funnel: 'BOF', vinklar: ['CS'], status: 'klar',
      bildprompt: 'x', kraver: ['Headline'], block: [{ zon: 'rutnat-2x2', stil: 'etikett' }],
    }],
  };
  assert.throws(() => granskaBibliotek(bib), /kan inte vara "klar"/);
  bib.koncept[0].status = 'tillagg';
  assert.throws(() => granskaBibliotek(bib), /utan tillagg_text_py/);
  bib.koncept[0].tillagg_text_py = 'en rutnätszon';
  assert.ok(granskaBibliotek(bib));
});

test('en blocknyckel text.py inte läser stoppas', () => {
  const bib = {
    koncept: [{
      id: 'K98', namn: 'Test', kalla: 'Evolve', funnel: 'BOF', vinklar: ['CS'], status: 'klar',
      bildprompt: 'x', kraver: ['Headline'], block: [{ zon: 'topp', stil: 'rubrik', farg: '#FFFFFF' }],
    }],
  };
  assert.throws(() => granskaBibliotek(bib), /läses inte av text.py/);
});

const bib = () => ({
  koncept: [
    { id: 'K01', namn: 'Reabannern', kalla: 'Kontots egen', funnel: 'BOF', vinklar: ['CS', 'FD'], status: 'klar', bildprompt: 'A {PRODUKT} on white, {SCEN}.', kraver: ['Headline'], block: [{ zon: 'topp', stil: 'rubrik' }] },
    { id: 'K07', namn: 'Mekanismkortet', kalla: 'Evolve', funnel: 'BOF', vinklar: ['CS'], status: 'klar', bildprompt: 'B {PRODUKT}.', kraver: ['Headline'], block: [{ zon: 'botten', stil: 'rubrik' }] },
    { id: 'K17', namn: 'Textannonsen', kalla: 'Evolve', funnel: 'BOF', vinklar: ['CS'], status: 'klar', bildprompt: '(ingen generering — platta)', kraver: ['Headline'], block: [{ zon: 'mitt', stil: 'rubrik' }] },
    { id: 'K18', namn: 'Delad skärm', kalla: 'Evolve', funnel: 'BOF', vinklar: ['CS'], status: 'klar', bildprompt: 'D.', kraver: ['Headline'], block: [{ zon: 'hoger-mitt', stil: 'rubrik' }] },
    { id: 'K11', namn: 'Gåvorna', kalla: 'Evolve', funnel: 'BOF', vinklar: ['CS'], status: 'tillagg', tillagg_text_py: 'chips', bildprompt: 'E.', kraver: ['Headline'], block: [{ zon: 'chips', stil: 'etikett' }] },
  ],
});

test('väljaren tar ett klart koncept som bär vinkeln, det minst använda först', () => {
  const val = valjKoncept({ vinkel: 'CS', produkt: 'Takoverdrag', historik: [], bib: bib() });
  assert.equal(val.koncept.id, 'K01');
  assert.match(val.orsak, /aldrig använt/);
});

test('samma produkt får inte samma koncept som de tre senaste gångerna', () => {
  const historik = [
    { datum: '2026-10-01', produkt: 'Takoverdrag', koncept: 'K01' },
    { datum: '2026-10-02', produkt: 'Takoverdrag', koncept: 'K07' },
    { datum: '2026-10-03', produkt: 'Takoverdrag', koncept: 'K17' },
    { datum: '2026-10-03', produkt: 'Beltgrinder', koncept: 'K18' },
  ];
  assert.equal(SPARR_SENASTE, 3);
  const val = valjKoncept({ vinkel: 'CS', produkt: 'Takoverdrag', historik, bib: bib() });
  assert.equal(val.koncept.id, 'K18', 'det enda klara CS-konceptet produkten inte fått nyss');
  // Beltgrinders historik påverkar inte Takoverdrag.
  const val2 = valjKoncept({ vinkel: 'CS', produkt: 'Beltgrinder', historik, bib: bib() });
  assert.equal(val2.koncept.id, 'K01');
});

test('när spärren äter alla kandidater undviks bara det allra senaste', () => {
  const b = bib();
  b.koncept = b.koncept.filter((k) => ['K01', 'K07'].includes(k.id));
  const historik = [
    { datum: '2026-10-01', produkt: 'P', koncept: 'K01' },
    { datum: '2026-10-02', produkt: 'P', koncept: 'K07' },
  ];
  const val = valjKoncept({ vinkel: 'CS', produkt: 'P', historik, bib: b });
  assert.equal(val.koncept.id, 'K01');
});

test('en vinkel utan koncept faller tillbaka på hela biblioteket, aldrig på tomt', () => {
  const val = valjKoncept({ vinkel: 'XX', produkt: 'P', historik: [], bib: bib() });
  assert.ok(val.koncept);
  assert.match(val.orsak, /hela biblioteket/);
});

test('briefens eget val vinner, men ett koncept som kräver tillägg stoppas', () => {
  assert.equal(valjKoncept({ vinkel: 'CS', produkt: 'P', onskat: 'K07', bib: bib() }).koncept.id, 'K07');
  assert.equal(valjKoncept({ vinkel: 'CS', produkt: 'P', onskat: 'mekanismkortet', bib: bib() }).koncept.id, 'K07');
  assert.throws(() => valjKoncept({ vinkel: 'CS', produkt: 'P', onskat: 'K11', bib: bib() }), /kräver ett tillägg/);
  assert.throws(() => valjKoncept({ vinkel: 'CS', produkt: 'P', onskat: 'K42', bib: bib() }), /inte finns/);
});

test('promptskelettet fyller produkt och scen, och ett koncept utan generering ger null', () => {
  const b = bib();
  assert.equal(
    promptSkelett(b.koncept[0], { produktBeskrivning: 'black 420D cover', scen: 'on a trailer' }),
    'A black 420D cover on white, on a trailer.',
  );
  assert.equal(promptSkelett(b.koncept[2]), null);
});

test('specskelettet bär blocken med tomma textfält — raderna kommer ur briefen', () => {
  const spec = specSkelett(bib().koncept[0]);
  assert.deepEqual(spec, [{ zon: 'topp', stil: 'rubrik', text: '' }]);
});

test('jobbfilen stoppas när en produkt får samma koncept två gånger', () => {
  const data = {
    jobb: [
      { namn: 'Takoverdrag_CS_2_1', koncept: 'K01' },
      { namn: 'Takoverdrag_CS_3_1', koncept: 'K01' },
      { namn: 'Beltgrinder_CS_1_1', koncept: 'K01' },
      { namn: 'Beltgrinder_CS_2_1' },
      { namn: 'Beltgrinder_CS_3_1', koncept: 'K11' },
      { namn: 'Beltgrinder_CS_4_1', koncept: 'K42' },
    ],
  };
  const fel = kontrolleraJobbfil(data, bib());
  assert.equal(fel.length, 4);
  assert.match(fel[0], /Takoverdrag får K01 två gånger/);
  assert.match(fel[1], /saknar koncept/);
  assert.match(fel[2], /kräver ett tillägg/);
  assert.match(fel[3], /finns inte/);
});

test('en brief som uttryckligen ber om konceptet får upprepa det', () => {
  const data = {
    jobb: [
      { namn: 'Takoverdrag_CS_2_1', koncept: 'K01' },
      { namn: 'Takoverdrag_CS_3_1', koncept: 'K01', koncept_kalla: 'brief' },
    ],
  };
  assert.deepEqual(kontrolleraJobbfil(data, bib()), []);
});

test('loggraderna bär datum, produkt och koncept per jobb', () => {
  const rader = loggrader({ datum: '2026-10-03', jobb: [{ namn: 'Takoverdrag_CS_2_1', koncept: 'K01' }, { namn: 'X_1' }] });
  assert.deepEqual(rader, [{ datum: '2026-10-03', namn: 'Takoverdrag_CS_2_1', produkt: 'Takoverdrag', koncept: 'K01' }]);
  assert.equal(produktUr('Värmesulorna_PD_2_1V'), 'Värmesulorna');
});
