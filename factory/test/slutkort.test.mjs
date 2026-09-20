// Test för factory/slutkort.py — slutkortsmotorn (endcard) per OPS-marknad.
//
// Två saker mäts, och de är olika sorters bevis:
//   1. BILDEN: att python3 + Pillow faktiskt skriver en PNG i rätt storlek,
//      720×1280 och 1080×1920 ur samma kod (sk = W/720).
//   2. TEXTBYGGAREN: att raderna (`--json-text`, alltså strängarna — inte
//      pixlarna) aldrig bär butikens namn eller domän. Det är Axels beslut
//      2026-09-18, och det är den regeln slutkortet finns för.
//
// ⚠️ Saknas python3 eller Pillow HOPPAS testet med NAMNGIVEN orsak — aldrig
// grönt på något som inte kördes (samma regel som factory/sjalvtest.mjs och
// bildbrand-riktig.test.mjs).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, '..', '..');
const SKRIPT = join(ROT, 'factory', 'slutkort.py');
const PRODUKT = join(ROT, 'factory', 'produkter', 'takskyddet.yaml');
const BUTIK = join(ROT, 'factory', 'butiker', 'carashell.yaml');

const kör = (exe, args) => spawnSync(exe, args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
const finns = (exe, args) => { const r = kör(exe, args); return !r.error && r.status === 0; };
const PYTHON = finns('python3', ['-c', 'import sys']);
const PILLOW = PYTHON && finns('python3', ['-c', 'import PIL']);

const HOPPA = !PYTHON
  ? { skip: 'python3 saknas i containern' }
  : !PILLOW
    ? { skip: 'Pillow saknas i containern (pip3 install pillow)' }
    : {};
// Textbyggaren behöver ingen Pillow — bara python3 och node.
const HOPPA_TEXT = PYTHON ? {} : { skip: 'python3 saknas i containern' };

const slutkort = (args) => kör('python3', [SKRIPT, '--rot', ROT, ...args]);

/** Raderna som JSON — samma väg rutinen använder för att granska texten. */
function texter(marknad, extra = []) {
  const r = slutkort(['--produkt', PRODUKT, '--butik', BUTIK, '--marknad', marknad, '--json-text', ...extra]);
  assert.equal(r.status, 0, `--json-text ${marknad} föll: ${r.stderr}`);
  return JSON.parse(r.stdout);
}

/** PNG-huvudets bredd och höjd, lästa ur filen (IHDR, byte 16–23). */
function pngMatt(fil) {
  const b = readFileSync(fil);
  assert.equal(b.subarray(1, 4).toString('latin1'), 'PNG', 'filen är ingen PNG');
  return { bredd: b.readUInt32BE(16), höjd: b.readUInt32BE(20) };
}

/** En liten produktbild — testet ska inte behöva någon fil ur repot. */
function produktbild(mapp) {
  const ut = join(mapp, 'produkt.png');
  const py = `
from PIL import Image, ImageDraw
im = Image.new("RGBA", (599, 341), (253, 253, 253, 255))
d = ImageDraw.Draw(im)
d.rounded_rectangle([40, 60, 560, 300], radius=30, fill=(40, 44, 50, 255))
im.save(${JSON.stringify(ut)})
`;
  const r = kör('python3', ['-c', py]);
  assert.equal(r.status, 0, `produktbilden kunde inte byggas: ${r.stderr}`);
  return ut;
}

// De strängar som ALDRIG får komma ur textbyggaren. ".se" och ".com" fångar
// domänen oavsett vilket butiksnamn som står före den.
const FÖRBJUDET = ['CaraShell', 'carashell', 'Bäverbutiken', 'baverbutiken', '.se', '.com'];

test('slutkort: DK-kortet byggs i 720×1280', HOPPA, () => {
  const mapp = mkdtempSync(join(tmpdir(), 'slutkort-dk-'));
  try {
    const ut = join(mapp, 'dk.png');
    const r = slutkort(['--produkt', PRODUKT, '--butik', BUTIK, '--marknad', 'DK',
      '--bredd', '720', '--produktbild', produktbild(mapp), '--ut', ut]);
    assert.equal(r.status, 0, `DK-kortet föll: ${r.stderr}`);
    assert.ok(existsSync(ut), 'ingen PNG skrevs');
    assert.deepEqual(pngMatt(ut), { bredd: 720, höjd: 1280 });
    // Utskriften ska säga vad som valdes — annars går domen inte att granska.
    assert.match(r.stdout, /variant\s+6,5 × 3 m/, 'referensvarianten redovisas inte');
  } finally { rmSync(mapp, { recursive: true, force: true }); }
});

test('slutkort: US-kortet byggs i 1080×1920 ur samma kod', HOPPA, () => {
  const mapp = mkdtempSync(join(tmpdir(), 'slutkort-us-'));
  try {
    const ut = join(mapp, 'us.png');
    const r = slutkort(['--produkt', PRODUKT, '--butik', BUTIK, '--marknad', 'US',
      '--bredd', '1080', '--produktbild', produktbild(mapp), '--ut', ut]);
    assert.equal(r.status, 0, `US-kortet föll: ${r.stderr}`);
    assert.deepEqual(pngMatt(ut), { bredd: 1080, höjd: 1920 });
  } finally { rmSync(mapp, { recursive: true, force: true }); }
});

test('slutkort: textbyggaren nämner aldrig butiken eller domänen', HOPPA_TEXT, () => {
  for (const marknad of ['SE', 'NO', 'DK', 'US']) {
    const { texter: t } = texter(marknad);
    for (const [fält, värde] of Object.entries(t)) {
      if (typeof värde !== 'string') continue;
      for (const ord of FÖRBJUDET) {
        assert.ok(
          !värde.toLowerCase().includes(ord.toLowerCase()),
          `${marknad}.${fält} = "${värde}" innehåller "${ord}"`,
        );
      }
    }
  }
});

test('slutkort: brandspärren fäller ett butiksnamn som smugit in', HOPPA_TEXT, () => {
  const r = slutkort(['--produkt', PRODUKT, '--butik', BUTIK, '--marknad', 'DK',
    '--titel', 'CaraShell tagbetræk', '--json-text']);
  assert.equal(r.status, 4, 'brandspärren släppte igenom butiksnamnet');
  assert.match(r.stderr, /BRANDORD I SLUTKORTET/);
  const d = slutkort(['--produkt', PRODUKT, '--butik', BUTIK, '--marknad', 'DK',
    '--titel', 'Tagbetræk fra carashell.se', '--json-text']);
  assert.equal(d.status, 4, 'brandspärren släppte igenom domänen');
});

test('slutkort: priset formateras enligt marknaden, aldrig ur koden', HOPPA_TEXT, () => {
  // Talen kommer ur factory/produkter/takskyddet.yaml → ekonomi.marknadspriser
  // och varianternas prisstege. Ändras prislistan ändras testet med den — det
  // är meningen: kortet får aldrig bära ett pris som inte står i filen.
  const dk = texter('DK').texter;
  assert.equal(dk.pris, '819 kr.');           // punkt som tusental, kr. EFTER talet
  assert.equal(dk.jamforpris, '1.069 kr.');
  assert.equal(texter('US').texter.pris, '$199');
  assert.equal(texter('NO').texter.pris, '1 106 kr');
  assert.equal(texter('SE').texter.pris, '1 129 kr');
});

test('slutkort: DK-kortet är danskt rakt igenom', HOPPA_TEXT, () => {
  const t = texter('DK').texter;
  assert.equal(t.sprak, 'da');
  assert.equal(t.valuta, 'DKK');
  assert.equal(t.badge, '14 DAGES FORTRYDELSESRET');
  assert.equal(t.rea, 'Tilbud');
  assert.match(t.fotrad, /^Gratis fragt til Danmark · .* · 5–10 hverdage$/);
  assert.match(t.recensioner, /^10 anmeldelser/);
});

test('slutkort: utan recensioner i repot utelämnas raden helt', HOPPA_TEXT, () => {
  const mapp = mkdtempSync(join(tmpdir(), 'slutkort-tom-'));
  try {
    const p = join(mapp, 'provprodukt.yaml');
    const b = join(mapp, 'provbutiken.yaml');
    writeFileSync(p, [
      'produkt:', '  namn: "Provprodukt"', '  id: "provprodukt"',
      'ekonomi:', '  pris: 100', '  jamforpris: 150',
      '  marknadspriser:', '    - valuta: DKK', '      pris: 79', '      jamforpris: 119', '',
    ].join('\n'));
    writeFileSync(b, [
      'butik:', '  id: provbutiken', '  brand: "Provbrandet"',
      '  supportmail: "hello@provbutiken.se"', '  valuta: SEK',
      '  marknader:', '    - land: DK', '      locale: da', '      valuta: DKK',
      'frakt:', '  fri_globalt: true', '  leveranstid: "3–5 arbetsdagar"',
      'retur:', '  oppet_kop_dagar: 30', '  angerratt_dagar: 14', '',
    ].join('\n'));
    const r = slutkort(['--produkt', p, '--butik', b, '--marknad', 'DK',
      '--titel', 'Tagbetræk 100 cm', '--json-text']);
    assert.equal(r.status, 0, `provkortet föll: ${r.stderr}`);
    const { texter: t, kallor } = JSON.parse(r.stdout);
    assert.equal(t.recensioner, '', 'en påhittad recensionsrad byggdes');
    assert.equal(t.stjarnor, '', 'stjärnor utan recensioner');
    assert.match(kallor.recensioner, /inga recensioner/);
    // Badgen och fraktraden byggs då ur butiksfilen + ORD-tabellen.
    assert.equal(t.badge, '30 DAGES ÅBENT KØB');
    assert.equal(t.fotrad, 'Gratis fragt til Danmark · 30 dages åbent køb · 3–5 hverdage');
    assert.equal(t.pris, '79 kr.');
  } finally { rmSync(mapp, { recursive: true, force: true }); }
});

test('slutkort: en svensk titel får aldrig stå på ett danskt kort', HOPPA_TEXT, () => {
  const mapp = mkdtempSync(join(tmpdir(), 'slutkort-titel-'));
  try {
    const p = join(mapp, 'p.yaml');
    const b = join(mapp, 'b.yaml');
    writeFileSync(p, ['produkt:', '  namn: "Taköverdrag"', '  id: "p"',
      'ekonomi:', '  pris: 100', '  marknadspriser:', '    - valuta: DKK', '      pris: 79', ''].join('\n'));
    writeFileSync(b, ['butik:', '  id: b', '  brand: "B"', '  supportmail: "hello@b-butik.se"', '  valuta: SEK',
      '  marknader:', '    - land: DK', '      locale: da', '      valuta: DKK',
      'frakt:', '  fri_globalt: true', '  leveranstid: "3–5 arbetsdagar"',
      'retur:', '  angerratt_dagar: 14', ''].join('\n'));
    const r = slutkort(['--produkt', p, '--butik', b, '--marknad', 'DK', '--json-text']);
    assert.equal(r.status, 4, 'den svenska titeln användes på det danska kortet');
    assert.match(r.stderr, /Ingen da-titel/);
  } finally { rmSync(mapp, { recursive: true, force: true }); }
});
