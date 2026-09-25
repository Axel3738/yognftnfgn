// klaviyo/bilder.mjs + gallerier.mjs: bilderna i gallerierna. Inget nät — hämtaren
// får en falsk fetch. Bakgrund: artifact-visaren blockerar bilder från andra domäner,
// så varje mejl i gallerierna visade trasiga bilder 2026-09-25 ("WHATAHELL … fixa alla").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bygg, galleri, lasInnehall } from '../bygg.mjs';
import { bildUrlar, nyttRegister, medPlatshallare, hamtaBilder, bildSkript } from '../bilder.mjs';
import { galleriKampanjer, galleriFloden, galleriMallar, mejlUtUrManifest } from '../gallerier.mjs';
import { FIXTURER, PRODUKTER, RECENSIONER, BRAND } from './hjalp.mjs';

const nu = new Date('2026-09-24T12:00:00Z');
const A = 'https://cdn.example/a.jpg?v=1&w=2';
const B = 'https://cdn.example/b.png';
// Så ser en byggd mejlkropp ut: &amp; i attributet, samma bild två gånger, en data-URI som inte ska röras.
const HTML = '<img src="https://cdn.example/a.jpg?v=1&amp;w=2"><img src="https://cdn.example/b.png"><img src="https://cdn.example/a.jpg?v=1&amp;w=2"><img src="data:image/gif;base64,R0lGOD">';

const JSON_BLOCK = /<script id="bilder" type="application\/json">(.*?)<\/script>/s;
const bildJson = (html) => JSON.parse(html.match(JSON_BLOCK)[1]);

async function byggt() {
  const utDir = mkdtempSync(join(tmpdir(), 'klaviyo-galleri-'));
  const { manifest } = await bygg({ innehallDir: join(FIXTURER, 'innehall'), utDir, produkter: PRODUKTER, recensioner: RECENSIONER, nu });
  const htmlFor = (id) => readFileSync(join(utDir, `${id}.exempel.html`), 'utf8');
  const urlar = [...new Set(manifest.mejl.flatMap((m) => bildUrlar(htmlFor(m.id))))];
  // Låtsasbilder: en data-URI per URL, som hamtaBilder hade gett.
  const bilder = new Map(urlar.map((u) => [u, `data:image/png;base64,${Buffer.from(u).toString('base64')}`]));
  return { utDir, manifest, htmlFor, urlar, bilder };
}

test('bildUrlar: unika, avkodade (&amp; → &), aldrig data-URI:er', () => {
  assert.deepEqual(bildUrlar(HTML), [A, B]);
  assert.deepEqual(bildUrlar('<p>inga bilder</p>'), []);
});

test('medPlatshallare: samma URL får samma nummer, över flera mejl, och registret bär den avkodade URL:en', () => {
  const reg = nyttRegister();
  assert.equal(medPlatshallare(HTML, reg), '<img src="bild:0"><img src="bild:1"><img src="bild:0"><img src="data:image/gif;base64,R0lGOD">');
  assert.deepEqual(reg.lista, [A, B]);
  // Nästa mejl på samma sida återanvänder numren — det är det som gör att bilden ligger EN gång per sida.
  assert.equal(medPlatshallare('<img src="https://cdn.example/b.png"><img src="https://cdn.example/c.webp">', reg), '<img src="bild:1"><img src="bild:2">');
  assert.deepEqual(reg.lista, [A, B, 'https://cdn.example/c.webp']);
});

test('hamtaBilder: hämtar varje URL en gång, skriver cachen, återanvänder den och rapporterar det som saknas', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'klaviyo-bilder-'));
  const anrop = [];
  const svar = (typ, ok, status, byte) => ({ ok, status, headers: new Map([['content-type', typ]]), arrayBuffer: async () => Uint8Array.from(byte).buffer });
  const fetchFn = async (url) => {
    anrop.push(url);
    if (url === B) return svar('text/html', false, 404, []);
    if (url.endsWith('sida.html')) return svar('text/html; charset=utf-8', true, 200, [60, 62]);
    return svar('image/jpeg', true, 200, [1, 2, 3]);
  };
  const r1 = await hamtaBilder({ urlar: [A, B, 'https://cdn.example/sida.html', A], cacheDir: dir, fetchFn });
  assert.deepEqual(anrop, [A, B, 'https://cdn.example/sida.html'], 'dubbletten hämtas inte två gånger');
  assert.equal(r1.bilder.get(A), 'data:image/jpeg;base64,AQID');
  assert.equal(r1.bilder.has(B), false);
  assert.deepEqual(r1.saknas.map((s) => s.url), [B, 'https://cdn.example/sida.html']);
  assert.match(r1.saknas[0].orsak, /HTTP 404/);
  assert.match(r1.saknas[1].orsak, /inte en bild/);
  const index = JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8'));
  assert.equal(index[A].typ, 'image/jpeg');
  assert.match(index[A].fil, /^[0-9a-f]{16}\.jpg$/);
  assert.ok(existsSync(join(dir, index[A].fil)));
  assert.ok(!(B in index), 'en misslyckad hämtning skrivs aldrig in i cachen');
  // Andra körningen: fetch som kastar bevisar att cachen vinner.
  const r2 = await hamtaBilder({ urlar: [A], cacheDir: dir, fetchFn: async () => { throw new Error('nätet ska inte röras'); } });
  assert.equal(r2.bilder.get(A), 'data:image/jpeg;base64,AQID');
  assert.deepEqual(r2.saknas, []);
});

test('bildSkript: JSON-blocket bär data-URI:n, eller den riktiga URL:en när bilden saknas, och "</" är ofarligt', () => {
  const reg = nyttRegister();
  medPlatshallare('<img src="https://cdn.example/a.jpg"><img src="https://cdn.example/x</script>.png">', reg);
  const s = bildSkript(reg, new Map([['https://cdn.example/a.jpg', 'data:image/jpeg;base64,AQID']]));
  const ra = s.match(JSON_BLOCK)[1];
  assert.ok(!ra.includes('</'), 'ett ograverat "</" hade stängt script-blocket');
  assert.deepEqual(JSON.parse(ra), ['data:image/jpeg;base64,AQID', 'https://cdn.example/x</script>.png']);
  assert.match(s, /iframe\[data-srcdoc\]/);
  assert.match(s, /f\.srcdoc = /);
});

test('mejlUtUrManifest: felen delas per mejl på "<id>: "-prefixet, resten är toppfel', () => {
  const manifest = { mejl: [{ id: 'k01' }, { id: 'f02-e1' }], fel: ['k01: priset saknas', 'k01: för lång ämnesrad', 'brandfilen saknar adress'], varningar: ['f02-e1: ingen bild'] };
  const ur = mejlUtUrManifest(manifest, (id) => `<p>${id}</p>`);
  assert.deepEqual(ur.mejlUt.map((x) => [x.post.id, x.fel, x.varningar, x.exempelHtml]), [
    ['k01', ['priset saknas', 'för lång ämnesrad'], [], '<p>k01</p>'],
    ['f02-e1', [], ['ingen bild'], '<p>f02-e1</p>'],
  ]);
  assert.deepEqual(ur.toppFel, ['brandfilen saknar adress']);
  assert.deepEqual(ur.toppVarningar, []);
});

test('gallerierna: ramarna är data-srcdoc med platshållare, och varje bild ligger EN gång i JSON-blocket', async () => {
  const { manifest, htmlFor, urlar, bilder } = await byggt();
  assert.ok(urlar.length > 0, 'fixturens mejl bär bilder');
  const innehall = lasInnehall(join(FIXTURER, 'innehall'));
  assert.deepEqual(innehall.fel, []);
  const sidor = {
    kampanjer: galleriKampanjer({ brand: BRAND, kampanjer: innehall.kampanjer, htmlFor, lankar: null, bilder }),
    floden: galleriFloden({ brand: BRAND, floden: innehall.floden, htmlFor, lankar: null, bilder }),
    mallar: galleriMallar({ brand: BRAND, manifest, htmlFor, lankar: null, bilder }),
  };
  for (const [namn, html] of Object.entries(sidor)) {
    assert.match(html, /<iframe [^>]*data-srcdoc="/, `${namn}: ramarna fylls av skriptet`);
    assert.doesNotMatch(html, /<iframe [^>]* srcdoc="/, `${namn}: ingen ram bär en färdig srcdoc`);
    assert.doesNotMatch(html, /src=&quot;https?:/, `${namn}: ingen ram pekar på nätet`);
    assert.match(html, /src=&quot;bild:\d+&quot;/, `${namn}: platshållare i ramarna`);
    const json = bildJson(html);
    // Varje sida bär bara de bilder dess egna mejl använder — kampanjsidan har inte flödenas.
    assert.ok(json.length > 0 && json.length <= urlar.length, `${namn}: bara sidans egna bilder i blocket`);
    for (const b of json) assert.match(b, /^data:image\//, namn);
    assert.equal((html.match(/data:image\/png;base64,/g) ?? []).length, json.length, `${namn}: en gång per sida, inte per ram`);
  }
  assert.equal(bildJson(sidor.mallar).length, urlar.length, 'mallgalleriet visar alla mejl och bär därför alla bilder');
  assert.match(sidor.floden, /vänta 1 timm/);
});

test('bygg galleri: utan bilder är ramarna srcdoc (offline som förut), med bilder data-srcdoc + JSON-blocket', async () => {
  const { manifest, htmlFor, bilder } = await byggt();
  const ur = mejlUtUrManifest(manifest, htmlFor);
  const grund = { brand: BRAND, manifest, mejlUt: ur.mejlUt, toppFel: ur.toppFel, toppVarningar: ur.toppVarningar, nu };
  const utan = galleri(grund);
  assert.match(utan, /<iframe [^>]* srcdoc="/);
  assert.doesNotMatch(utan, /data-srcdoc=|id="bilder"/);
  const med = galleri({ ...grund, bilder });
  assert.match(med, /<iframe [^>]*data-srcdoc="/);
  assert.doesNotMatch(med, /<iframe [^>]* srcdoc="/);
  assert.doesNotMatch(med, /src=&quot;https?:/);
  assert.match(med, /<script id="bilder" type="application\/json">/);
  assert.equal(bildJson(med).length, bilder.size);
  assert.match(med, /tis 29 sep kl 18:00/, 'resten av sidan är som förut');
});
