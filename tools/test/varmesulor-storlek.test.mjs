// Testar splitsningen i tools/varmesulor-storlek.mjs mot en kopia av värmesulornas
// riktiga beskrivning (2026-10-03) — utan nät, utan nycklar.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { byggBeskrivning, kontrollera } from '../varmesulor-storlek.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const TEXTER = JSON.parse(readFileSync(join(HAR, '..', 'varmesulor-storlek.json'), 'utf8'));

const BILD = '<p><img src="https://cdn.example/x.jpg" alt="bild"></p>';
const GAMMAL = `<h3>Kylan kryper uppåt innan passet ens är halvvägs</h3><p>Du står stilla timme efter timme på älgpasset.</p>${BILD}<h3>Tre värmelägen du styr utan att röra en fot</h3><p>Två sulor klipps efter din egen skostorlek längs de tryckta linjerna, 41–46, och styrs med en fjärrkontroll i nyckelringsformat. USB-kabeln laddar batteriet, 2000 mAh enligt leverantören.</p>${BILD}<h3>Funktioner</h3><ul>
<li>
<strong>Håller värmen i fötterna genom hela passet</strong> – tre lägen: hög, medel, låg</li>
<li>
<strong>Klipps efter din egen skostorlek</strong> – klipplinjer för 41–46 tryckta på sulan</li>
</ul><h3>Vår garanti</h3><p>Text.</p>`;

test('blocket läggs efter första stycket, före första bilden; stycke 2 och punkten byts', () => {
  const ny = byggBeskrivning(GAMMAL, TEXTER.sv);
  assert.deepEqual(kontrollera(ny, TEXTER.sv), []);
  assert.ok(ny.indexOf(`<h3>${TEXTER.sv.rubrik}</h3>`) < ny.indexOf('<img'), 'rubriken ska stå före första bilden');
  assert.ok(ny.indexOf('älgpasset.</p>') < ny.indexOf(`<h3>${TEXTER.sv.rubrik}</h3>`), 'rubriken ska stå efter första stycket');
  assert.ok(!ny.includes('linjerna, 41–46, och'), 'gamla stycke 2 ska vara borta');
  assert.ok(!ny.includes('klipplinjer för 41–46 tryckta på sulan'), 'gamla punkten ska vara borta');
  assert.ok(ny.includes('<h3>Vår garanti</h3><p>Text.</p>'), 'resten rörs inte');
});

test('idempotent: att köra igen ändrar ingenting', () => {
  const ny = byggBeskrivning(GAMMAL, TEXTER.sv);
  assert.equal(byggBeskrivning(ny, TEXTER.sv), ny);
});

test('saknas ankaret 41–46 stoppar bygget i stället för att gissa', () => {
  assert.throws(() => byggBeskrivning(GAMMAL.replace('41–46, och', '41-46 eller så, och').replace('för 41–46 tryckta', 'tryckta'), TEXTER.sv), /väntade 1/);
});

test('alla nio språk har de fem texterna och säger 41 och 46', () => {
  for (const [l, t] of Object.entries(TEXTER)) {
    if (l.startsWith('_')) continue;
    for (const k of ['rubrik', 'stycke', 'stycke2', 'punkt', 'meta_description']) {
      assert.ok(t[k] && t[k].trim(), `${l}.${k} saknas`);
      assert.ok(/41/.test(t[k]), `${l}.${k} nämner inte 41`);
    }
    assert.ok(/46/.test(t.stycke) && /35.{0,5}40/.test(t.stycke), `${l}.stycke ska nämna 46 och 35–40`);
    assert.ok(t.meta_description.length <= 160, `${l}.meta_description är ${t.meta_description.length} tecken`);
    assert.match(t.punkt, /^<strong>.+<\/strong> – .+$/, `${l}.punkt ska behålla <strong> och tankstrecket`);
    assert.ok(!/<(?!\/?strong)/.test(t.rubrik + t.stycke + t.stycke2 + t.meta_description), `${l}: inga taggar utom strong i punkten`);
  }
});
