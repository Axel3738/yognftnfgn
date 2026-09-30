// Domen i pipeline/pratar-i-bild.py, prövad mot RIKTIGA mätvärden.
//
// Talen nedan är inte hittepå — de är mätta 2026-09-30 på Bäverbutikens egna
// videor. De två PRATAR-fallen är UGC-annonser där en människa pratar mot
// kameran; resten är produktvideor med voiceover. Ändrar någon trösklarna utan
// att mäta om, faller de här testerna.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const PY = new URL('../pratar-i-bild.py', import.meta.url).pathname;

function dom(matt) {
  const kod = `
import json, sys, importlib.util
spec = importlib.util.spec_from_file_location('p', ${JSON.stringify(PY)})
m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
d, skal = m.dom(json.loads(sys.argv[1]))
print(json.dumps({'dom': d, 'verktyg': m.verktyg(d), 'skal': skal}))`;
  return JSON.parse(execFileSync('python3', ['-c', kod, JSON.stringify(matt)], { encoding: 'utf8' }));
}

const m = (andel, yta, mun) => ({ andel_ansikte: andel, ansiktsyta: yta, munrorelse: mun });

test('UGC där någon pratar mot kameran ⇒ HeyGen (mätta värden)', () => {
  // Termoskydd_UG_1_H1 och Takoverdrag_UG_1_H1, hämtade med sidtoken.
  for (const [andel, yta, mun] of [[0.37, 0.031, 20.2], [0.52, 0.029, 20.8]]) {
    const r = dom(m(andel, yta, mun));
    assert.equal(r.dom, 'PRATAR');
    assert.equal(r.verktyg, 'heygen');
  }
});

test('produktvideo med voiceover ⇒ ElevenLabs, även när kaskaden ser "ansikten" ofta', () => {
  // Batmotortrekk RV_1_H1: ansikte i HALVA bildrutorna — men allihop är
  // falska träffar på tyg och gräs, 0,39 % av bildytan.
  const r = dom(m(0.50, 0.0039, 5.72));
  assert.equal(r.dom, 'VOICEOVER');
  assert.equal(r.verktyg, 'elevenlabs');
  assert.match(r.skal, /för litet/);
});

test('ytan är grinden — hög träfffrekvens räddar inte en liten fläck', () => {
  // Beltesliper PD_4_H1: andel 0,37 (över PRATAR-tröskeln) men yta 0,71 %.
  assert.equal(dom(m(0.37, 0.0071, 5.58)).dom, 'VOICEOVER');
});

test('ett stort ansikte som bara glimtar förbi är ingen talande person', () => {
  // NO_ibc_SP_1_H1: största ansiktsytan i hela materialet (4,1 %) men bara
  // i 3 % av bildrutorna.
  const r = dom(m(0.03, 0.0414, 0.0));
  assert.equal(r.dom, 'VOICEOVER');
  assert.match(r.skal, /glimtar/);
});

test('stort ansikte men still mun ⇒ voiceover över en person som inte pratar', () => {
  const r = dom(m(0.60, 0.05, 1.2));
  assert.equal(r.dom, 'VOICEOVER');
  assert.match(r.skal, /står still/);
});

test('gråzonen går till HeyGen, aldrig till ElevenLabs', () => {
  // Batmotortrekk_NO_TH_1_H1: yta 3,0 % men ansikte i bara 17 % av rutorna.
  const r = dom(m(0.17, 0.0299, 22.3));
  assert.equal(r.dom, 'OKAND');
  assert.equal(r.verktyg, 'heygen', 'osäkerhet får aldrig kosta läppsynken');
});

test('en video som inte gick att läsa blir OKAND med orsak, aldrig grön', () => {
  const r = dom({ fel: 'inget bildspår gick att läsa' });
  assert.equal(r.dom, 'OKAND');
  assert.equal(r.verktyg, 'heygen');
  assert.match(r.skal, /bildspår/);
});
