// Tester för kassabilden — den språklösa trygghetsstrippen till Shopifys kassa.
// Ren logik + spärren i renderaren. Inga nätanrop.
//
// Varför den ser ut som den gör (mätt 2026-09-21 på CaraShell): butiken
// ligger på planen "Shopify", och att anpassa kassan PER MARKNAD kräver
// Advanced eller Plus. Bilden blir alltså EN bild för fem marknader och fem
// språk samtidigt — därför får den inte bära ord.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { vagtBetyg, drift, DRIFTGRANS } from '../kassabild.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

test('vagtBetyg: viktat på antalet recensioner, produkter utan recensioner hoppas helt', () => {
  // Mätt i butiken 2026-09-21: takskyddet 5,0 på 16, termoskyddet 5,0 på 20.
  assert.deepEqual(
    vagtBetyg([{ betyg: 5, antal: 16 }, { betyg: 5, antal: 20 }]),
    { betyg: 5, antal: 36, antalProdukter: 2 },
  );
  // Medel av medel hade gett 4,5 här; viktat ger 4,8 — den med 200 recensioner
  // ska väga tyngre än den med 4.
  const v = vagtBetyg([{ betyg: 4.9, antal: 200 }, { betyg: 4.0, antal: 4 }]);
  assert.equal(v.betyg, 4.9);
  assert.equal(v.antal, 204);
  // En produkt utan recensioner får ALDRIG dra ner snittet till något som
  // inte står någonstans i butiken.
  assert.deepEqual(vagtBetyg([{ betyg: 5, antal: 16 }, { betyg: null, antal: 0 }]),
    { betyg: 5, antal: 16, antalProdukter: 1 });
  assert.equal(vagtBetyg([{ betyg: null, antal: 0 }]), null, 'inga recensioner = inget betyg att visa');
  assert.equal(vagtBetyg([]), null);
  assert.equal(vagtBetyg(null), null);
  // Fältet heter antalProdukter, inte produkter: med samma namn skrev
  // produktLISTAN över antalet i anroparens spread (mätt 2026-09-21,
  // rapporten skrev "[object Object],[object Object] produkter").
  assert.equal('produkter' in vagtBetyg([{ betyg: 5, antal: 1 }]), false);
});

test('drift: bilden är statisk, så ett glidet betyg måste upptäckas', () => {
  assert.equal(drift({ betyg: 5 }, { betyg: 5 }).glidit, false);
  assert.equal(drift({ betyg: 5 }, { betyg: 4.9 }).glidit, false, 'en recension ska inte larma');
  assert.equal(drift({ betyg: 5 }, { betyg: 4.7 }).glidit, true);
  assert.match(drift({ betyg: 5 }, { betyg: 4.7 }).orsak, /bygg om den och byt i admin/);
  assert.equal(drift(null, { betyg: 5 }).glidit, false, 'ingen tidigare mätning är inte drift');
  assert.equal(DRIFTGRANS, 0.2);
});

test('kassabild.py VÄGRAR skriva en bild med ord — den visas i fem marknader samtidigt', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'kassabild-'));
  const kor = (spec) => {
    const s = join(mapp, 'spec.json');
    writeFileSync(s, JSON.stringify(spec));
    return spawnSync('python3', [join(ROT, 'factory', 'kassabild.py'), '--spec', s, '--ut', join(mapp, 'ut.png')], { encoding: 'utf8' });
  };
  const bas = { namn: 'CaraShell', betyg: 5, bredd: 560 };

  // Ett ord som är rätt på svenska är fel i fyra av fem kassor — och det
  // syns inte i förhandsgranskningen, bara i en dansk kassa.
  for (const nyckel of ['rubrik', 'underrad', 'text', 'badge', 'botten']) {
    const r = kor({ ...bas, [nyckel]: 'Trygg betalning' });
    assert.notEqual(r.status, 0, `${nyckel} borde ha stoppats`);
    assert.match(r.stderr + r.stdout, /kassabilden får inte bära ord/);
  }
  // Ett omätt betyg får inte ritas: siffran ska komma ur Shopify.
  assert.notEqual(kor({ ...bas, betyg: 0 }).status, 0);
  assert.match(kor({ ...bas, betyg: 0 }).stderr + '', /är inte mätt/);
  // Butiksnamn + stjärnor + siffra går igenom.
  const ok = kor(bas);
  assert.equal(ok.status, 0, ok.stderr);
  assert.ok(existsSync(join(mapp, 'ut.png')));
});

test('kassabild.py: stjärnorna ritas som polygoner, aldrig som tecknet ★', async () => {
  const { readFileSync } = await import('node:fs');
  const kalla = readFileSync(join(ROT, 'factory', 'kassabild.py'), 'utf8');
  // Liberation Sans (containerns enda typsnitt med garanterat å/ä/ö) saknar
  // U+2605. Ett tecken som saknas blir en tom ruta — utan felmeddelande.
  assert.ok(kalla.includes('def stjarna('), 'stjärnan ska ritas som polygon');
  assert.ok(kalla.includes('rita.polygon('));
  assert.equal(/['"]★['"]/.test(kalla), false, 'tecknet ★ får inte användas i renderaren');
  // Bredden räknas ut ur det som är kvar — med en fast radie sköt femte
  // stjärnan och siffran utanför kanten (mätt 2026-09-21).
  assert.ok(kalla.includes('tillgangligt'), 'stjärnstorleken ska räknas, inte sättas');
});
