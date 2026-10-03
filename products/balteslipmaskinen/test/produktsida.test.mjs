// Bälteslipmaskinens produktsida: de rena delarna, utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { byggBeskrivning, kontrollera, stromRad, specBlock } from '../produktsida.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const TEXTER = JSON.parse(readFileSync(join(ROT, '..', 'texter.json'), 'utf8'));
const MEDIA = {
  hero_bild: 'https://cdn.example/hero.jpg', bruk_bild: 'https://cdn.example/bruk.jpg', stationer_bild: 'https://cdn.example/st.jpg', kok_bild: 'https://cdn.example/kok.jpg',
  hero_mp4: 'https://cdn.example/hero.mp4', hero_poster: 'https://cdn.example/hero-p.jpg',
  slipning_mp4: 'https://cdn.example/slip.mp4', slipning_poster: 'https://cdn.example/slip-p.jpg',
  tomat_mp4: 'https://cdn.example/tomat.mp4', tomat_poster: 'https://cdn.example/tomat-p.jpg',
};
const GAMMAL = '<h3>Slöa knivar</h3><p>Att slipa för hand kräver teknik.</p><p><img src="https://cdn.example/temu.gif" alt="x"></p><h3>Lösningen</h3><p>En mini-bälteslipmaskin.</p><p><img src="https://cdn.example/temu.webp" alt="y"></p><h3>Funktioner</h3><ul><li>Jämn egg</li></ul><h3>Ångerrätt</h3><p>Du har 14 dagars ångerrätt.</p>';
const VAL = { strom: 'vantar', watt: null, ladaBild: 'https://cdn.example/lada.webp', sprak: 'sv' };

test('gamla bildparagraferna tas bort och tre videor läggs in på rätt platser', () => {
  const ny = byggBeskrivning(GAMMAL, TEXTER.sv, MEDIA, VAL);
  assert.equal((ny.match(/<img/g) ?? []).length, 1, 'bara lådbilden kvar');
  assert.ok(!ny.includes('temu.gif') && !ny.includes('temu.webp'));
  assert.equal((ny.match(/<video/g) ?? []).length, 3);
  assert.ok(ny.indexOf('hero.mp4') < ny.indexOf('<h3>Lösningen'), 'hero-loopen efter första stycket');
  assert.ok(ny.indexOf('slip.mp4') > ny.indexOf('<h3>Lösningen') && ny.indexOf('slip.mp4') < ny.indexOf('<h3>Funktioner'));
  assert.ok(ny.indexOf('bs-spec') < ny.indexOf('<h3>Ångerrätt'), 'specblocket före garantin');
  assert.ok(ny.endsWith('<h3>Ångerrätt</h3><p>Du har 14 dagars ångerrätt.</p>'), 'garantin orörd sist');
});

test('en omkörning byter specblocket i stället för att dubbla det', () => {
  const forsta = byggBeskrivning(GAMMAL, TEXTER.sv, MEDIA, VAL);
  const andra = byggBeskrivning(forsta, TEXTER.sv, MEDIA, { ...VAL, strom: 'klar', watt: '96' });
  assert.equal((andra.match(/bs-spec/g) ?? []).length, 1);
  assert.equal((andra.match(/<video/g) ?? []).length, 3);
  assert.ok(andra.includes('Effekt: 96 W'));
  assert.ok(!andra.includes('Vi håller på att få bekräftat'));
});

test('ström-raden: vantar utan watt, klar och adapter kräver watt, okänt läge stoppar', () => {
  assert.ok(stromRad(TEXTER.sv, 'vantar', null).includes('bekräftat'));
  assert.ok(stromRad(TEXTER.sv, 'klar', 96).includes('230 V') && stromRad(TEXTER.sv, 'klar', 96).includes('96 W'));
  assert.ok(stromRad(TEXTER.sv, 'adapter', '120').includes('120 W'));
  assert.throws(() => stromRad(TEXTER.sv, 'klar', null), /--watt/);
  assert.throws(() => stromRad(TEXTER.sv, 'usb', 96), /Okänt/);
});

test('alla fyra språken bygger och klarar copy-kontrollen', () => {
  for (const sprak of ['sv', 'nb', 'da', 'fi']) {
    const ny = byggBeskrivning(GAMMAL, TEXTER[sprak], MEDIA, { ...VAL, sprak });
    assert.deepEqual(kontrollera(ny), [], sprak);
    for (const k of ['rubrik_spec', 'rubrik_strom', 'rubrik_passar', 'rad_band', 'bildtext_lada']) assert.ok(ny.includes(TEXTER[sprak][k].replace(/&/g, '&amp;')), `${sprak} saknar ${k}`);
  }
});

test('kontrollen stoppar pris, butiksnamn, långt tankstreck och ofyllt {{WATT}}', () => {
  const bas = specBlock(TEXTER.sv, MEDIA, VAL);
  assert.deepEqual(kontrollera(bas), []);
  assert.ok(kontrollera(bas.replace('Slipvinkel', 'Bara 909 kr. Slipvinkel')).some((f) => /pris/.test(f)));
  assert.ok(kontrollera(bas.replace('Slipvinkel', 'Bäverbutikens slipvinkel')).some((f) => /butikens namn/.test(f)));
  assert.ok(kontrollera(bas.replace('Slipvinkel', 'Vinkeln — fast')).some((f) => /tankstreck/.test(f)));
  assert.ok(kontrollera(bas.replace('Slipvinkel', 'Effekt: {{WATT}} W')).some((f) => /WATT/.test(f)));
  assert.ok(kontrollera('<p>inget block</p>').some((f) => /saknas/.test(f)));
});

test('finska sidans "steglös hastighet" rättas till sju steg', () => {
  const fi = '<h3>A</h3><p>Nopeus säätyy portaattomasti, joten sama kone käy.</p><p>b</p><ul><li>portaaton nopeussäätö</li></ul><h3>Takuumme</h3><p>x</p>';
  const ny = byggBeskrivning(fi, TEXTER.fi, MEDIA, { ...VAL, sprak: 'fi' });
  assert.ok(!ny.includes('portaattomasti') && !ny.includes('portaaton'));
  assert.ok(ny.includes('7 porrasta') && ny.includes('7 nopeutta'));
});

test('en beskrivning utan två stycken eller utan h3 byggs aldrig om blint', () => {
  assert.throws(() => byggBeskrivning('<p>ett</p>', TEXTER.sv, MEDIA, VAL), /färre än två/);
  assert.throws(() => byggBeskrivning('<p>ett</p><p>två</p>', TEXTER.sv, MEDIA, VAL), /saknar <h3>/);
});
