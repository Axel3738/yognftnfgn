// Tester för factory/slutkortskoll.py — detektorn som hittar slutkortet i en mp4.
//
// Riktigt material ligger inte i git (market-expansion/**/*.mp4 och .scratch/ är
// gitignorerade), så testet BYGGER sina videor med ffmpeg: fem sekunder rörelse
// följt av tre sekunders stillbild. Fyra fall, för att fånga de fyra sätt
// detektorn kan ha fel på:
//
//   vitt kort   — originalkortet är vitt                      → JA, från 5,0 s
//   svart kort  — Bäverbutikens kort är svart                 → JA, från 5,0 s
//   brokigt kort— kort med logga/produkt/pris, inte enfärgat  → JA, från 5,0 s
//   utan kort   — rörelse hela vägen                          → NEJ
//   fryst bild  — sista bildrutan fryser (ser still ut, men är ett foto) → OSÄKER
//
// Det sista fallet är hela poängen med att rörelsen är huvudsignal och färgen
// sekundär: en frusen slutbild rör sig lika lite som ett kort, och bara ytan
// skiljer dem åt. Detektorn får då INTE svara JA.
//
// Domen kollas dessutom som ren funktion (domslut) utan ffmpeg alls.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKRIPT = resolve(fileURLToPath(new URL('../slutkortskoll.py', import.meta.url)));

function finns(kommando) {
  return spawnSync(kommando, ['-version'], { encoding: 'utf8' }).status === 0;
}
const HAR_FFMPEG = finns('ffmpeg');
const HAR_PYTHON = spawnSync('python3', ['--version'], { encoding: 'utf8' }).status === 0;
const KAN = HAR_FFMPEG && HAR_PYTHON;

// Små videor: analysen skalar ändå ner till 64 px bredd, så mer upplösning
// kostar bara encode-tid i npm test.
const STORLEK = '240x426';
const FPS = 20;
const RORELSE = `testsrc2=size=${STORLEK}:rate=${FPS}:duration=5`;
// Brokigt kort: vit botten, textrader högt upp, produktruta i mitten, prisplatta
// nedtill. Ger platthet ~0,6 — samma härad som det riktiga kortet (0,76 mätt).
const BROKIGT = [
  `color=c=white:s=${STORLEK}:r=${FPS}:d=3`,
  'drawbox=x=26:y=40:w=188:h=18:color=black:t=fill',
  'drawbox=x=26:y=66:w=134:h=12:color=black:t=fill',
  'drawbox=x=26:y=84:w=160:h=12:color=black:t=fill',
  'drawbox=x=40:y=200:w=160:h=146:color=0x9aa3ad:t=fill',
  'drawbox=x=60:y=372:w=120:h=20:color=0xcc2222:t=fill',
].join(',');

let katalog = null;
const videor = {};

function bygg(namn, andraKallan) {
  const ut = join(katalog, `${namn}.mp4`);
  const argv = andraKallan
    ? ['-f', 'lavfi', '-i', RORELSE, '-f', 'lavfi', '-i', andraKallan,
       '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0']
    : ['-f', 'lavfi', '-i', `testsrc2=size=${STORLEK}:rate=${FPS}:duration=8`];
  const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...argv,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', ut], { encoding: 'utf8' });
  assert.equal(r.status, 0, `ffmpeg kunde inte bygga ${namn}: ${r.stderr}`);
  videor[namn] = ut;
}

function kolla(...filer) {
  const r = spawnSync('python3', [SKRIPT, ...filer, '--json'], { encoding: 'utf8' });
  assert.equal(r.status, 0, `slutkortskoll.py exit ${r.status}: ${r.stderr}`);
  return JSON.parse(r.stdout);
}

test('slutkortskoll', { skip: KAN ? false : 'kräver ffmpeg + python3' }, async (t) => {
  katalog = mkdtempSync(join(tmpdir(), 'slutkortskoll-'));
  t.after(() => rmSync(katalog, { recursive: true, force: true }));

  bygg('vitt', `color=c=white:s=${STORLEK}:r=${FPS}:d=3`);
  bygg('svart', `color=c=black:s=${STORLEK}:r=${FPS}:d=3`);
  bygg('brokigt', BROKIGT);
  bygg('utan', null);
  // Fryst sista bildruta: samma stillastående som ett kort, men ytan är ett foto.
  const fryst = join(katalog, 'fryst.mp4');
  const rf = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', RORELSE,
    '-vf', 'tpad=stop_mode=clone:stop_duration=3', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-y', fryst],
    { encoding: 'utf8' });
  assert.equal(rf.status, 0, `ffmpeg kunde inte bygga fryst: ${rf.stderr}`);
  videor.fryst = fryst;

  await t.test('vitt slutkort hittas på rätt sekund', () => {
    const [s] = kolla(videor.vitt);
    assert.equal(s.dom, 'JA');
    assert.ok(Math.abs(s.slutkort_fran_s - 5.0) <= 0.3,
      `slutkortet ska börja 5,0 s ±0,3, fick ${s.slutkort_fran_s}`);
    assert.equal(s.kortyta.kortton, 'ljust');
  });

  await t.test('svart slutkort hittas också — ljusheten får inte avgöra', () => {
    const [s] = kolla(videor.svart);
    assert.equal(s.dom, 'JA');
    assert.ok(Math.abs(s.slutkort_fran_s - 5.0) <= 0.3,
      `slutkortet ska börja 5,0 s ±0,3, fick ${s.slutkort_fran_s}`);
    assert.equal(s.kortyta.kortton, 'morkt');
  });

  await t.test('brokigt kort (logga + produkt + pris) räknas också som kort', () => {
    const [s] = kolla(videor.brokigt);
    assert.equal(s.dom, 'JA');
    assert.ok(Math.abs(s.slutkort_fran_s - 5.0) <= 0.3);
    const platt = s.matt.per_frame.at(-1).platt;
    assert.ok(platt > 0.35 && platt < 0.95,
      `kortet ska vara platt men inte enfärgat, platthet ${platt}`);
    assert.ok(['ovre', 'undre', 'jamn'].includes(s.kortyta.tyngdpunkt));
  });

  await t.test('video utan slutkort får NEJ och ingen starttid', () => {
    const [s] = kolla(videor.utan);
    assert.equal(s.dom, 'NEJ');
    assert.equal(s.slutkort_fran_s, null);
    assert.equal(s.slutkort_langd_s, null);
  });

  await t.test('fryst slutbild blir OSÄKER, aldrig JA', () => {
    const [s] = kolla(videor.fryst);
    assert.equal(s.dom, 'OSAKER', `fick ${s.dom}: ${s.skal}`);
    assert.match(s.skal, /platt/);
  });

  await t.test('svaret bär vad som mättes', () => {
    const [s] = kolla(videor.vitt);
    assert.ok(s.matt.frames >= 10, 'antal frames ska redovisas');
    // Tröskeln läses ur skriptet, inte skriven av hand här: en avstämning av
    // RORELSE_JA ska inte fälla ett test som handlar om att svaret REDOVISAR den.
    const troskel = Number(spawnSync('python3', ['-c',
      `import sys; sys.path.insert(0, ${JSON.stringify(resolve(SKRIPT, '..'))}); import slutkortskoll; print(slutkortskoll.RORELSE_JA)`,
    ], { encoding: 'utf8' }).stdout.trim());
    assert.ok(troskel > 0 && troskel < s.matt.trosklar.rorelse_kanske, `orimlig tröskel: ${troskel}`);
    assert.equal(s.matt.trosklar.rorelse_ja, troskel, 'svaret ska redovisa skriptets egen tröskel');
    assert.ok(s.matt.per_frame.length === s.matt.frames);
    assert.equal(s.matt.per_frame[0].rorelse, null, 'första framen har ingen föregångare');
    const sista = s.matt.per_frame.at(-1);
    assert.ok(typeof sista.rorelse === 'number' && sista.rorelse < troskel);
    // STORLEK, inte en handskriven kopia av den: ändrar någon testvideons
    // upplösning ska det här testet mäta att ffmpeg-avläsningen följer med,
    // inte falla på en siffra som ingen kom ihåg att ändra på två ställen.
    assert.equal(s.upplosning, STORLEK, 'upplösningen ska läsas ur videon');
  });

  await t.test('flera filer i samma anrop', () => {
    const svar = kolla(videor.vitt, videor.utan);
    assert.equal(svar.length, 2);
    assert.deepEqual(svar.map((s) => s.dom), ['JA', 'NEJ']);
  });

  await t.test('en fil som inte är en video stoppar inte resten', () => {
    const r = spawnSync('python3', [SKRIPT, join(katalog, 'finns-inte.mp4'), videor.vitt, '--json'],
      { encoding: 'utf8' });
    assert.equal(r.status, 1, 'exit 1 när någon fil inte gick att läsa');
    const svar = JSON.parse(r.stdout);
    assert.equal(svar[0].dom, 'FEL');
    assert.equal(svar[1].dom, 'JA');
  });
});

test('domslut är en ren funktion — dömer utan ffmpeg', { skip: HAR_PYTHON ? false : 'kräver python3' }, () => {
  const kor = (tider, rorelser, plattor) => {
    const kod = [
      'import json,sys',
      `sys.path.insert(0, ${JSON.stringify(resolve(SKRIPT, '..'))})`,
      'from slutkortskoll import domslut',
      'a=json.loads(sys.stdin.read())',
      'print(json.dumps(domslut(a["t"], [None]+a["r"][1:], a["p"])))',
    ].join('\n');
    const r = spawnSync('python3', ['-c', kod],
      { encoding: 'utf8', input: JSON.stringify({ t: tider, r: rorelser, p: plattor }) });
    assert.equal(r.status, 0, r.stderr);
    return JSON.parse(r.stdout);
  };

  const tider = Array.from({ length: 20 }, (_, i) => +(i * 0.2).toFixed(2)); // 0,0–3,8 s
  // Rörelse i tio frames, sedan tio stilla: kortet börjar på frame 10 = 2,0 s.
  const rorelser = [null, ...Array.from({ length: 19 }, (_, i) => (i + 1 < 10 ? 0.04 : (i + 1 === 10 ? 0.30 : 0.0)))];
  const plattor = Array.from({ length: 20 }, (_, i) => (i < 10 ? 0.05 : 0.8));
  const ja = kor(tider, rorelser, plattor);
  assert.equal(ja.dom, 'JA');
  assert.equal(ja.fran_s, 2.0, 'övergångsframen hör till kortet, inte till filmen');

  // Samma rörelse, men ytan är ett foto → fryst bild, inte kort.
  const osaker = kor(tider, rorelser, plattor.map((p, i) => (i < 10 ? 0.05 : 0.08)));
  assert.equal(osaker.dom, 'OSAKER');

  // Rörelse hela vägen → NEJ.
  const nej = kor(tider, [null, ...Array(19).fill(0.04)], Array(20).fill(0.05));
  assert.equal(nej.dom, 'NEJ');
  assert.equal(nej.fran_s, null);

  // För få frames för att säga något.
  assert.equal(kor([0, 0.2], [null, 0.0], [0.9, 0.9]).dom, 'OSAKER');
});

// MIN_LANGD_S är den enda tröskeln koden själv kallar bärande ("Sänk inte under
// 0,8 s") — och den var otestad: en mutation till 0.0 överlevde hela sviten.
// Det den skyddar mot är mätt, inte tänkt: ffmpegs fps-filter dubblerar ofta
// videons sista bildruta, så 17 av repots 94 slutkortslösa videor har ett
// rörelsevärde under RORELSE_JA i just sin sista frame. Ligger filmens slut
// dessutom PLATT (uttoning mot svart, en ljus produktbild) faller plattheten
// bort som skydd, och en enda dubblerad frame räcker till ett falskt JA.
test('en kort lugn svans är inget kort — MIN_LANGD_S är spärren',
  { skip: HAR_PYTHON ? false : 'kräver python3' }, () => {
    // `lugna` = hur många frames allra sist som står still. Resten rör sig.
    // Ytan är PLATT i den lugna svansen — det är det farliga fallet: en film som
    // tonar ut mot svart eller slutar på en ljus produktbild har ingen platthet
    // kvar som skyddar, så bara längden skiljer den från ett riktigt slutkort.
    const kor = (lugna, minLangd) => {
      const kod = [
        'import json,sys',
        `sys.path.insert(0, ${JSON.stringify(resolve(SKRIPT, '..'))})`,
        'from slutkortskoll import domslut, MIN_LANGD_S',
        'a=json.loads(sys.stdin.read())',
        'm=a["min"] if a["min"] is not None else MIN_LANGD_S',
        'print(json.dumps(domslut(a["t"], [None]+a["r"][1:], a["p"], min_langd_s=m)))',
      ].join('\n');
      const n = 20;
      const r = spawnSync('python3', ['-c', kod], {
        encoding: 'utf8',
        input: JSON.stringify({
          t: Array.from({ length: n }, (_, i) => +(i * 0.2).toFixed(2)),
          r: [null, ...Array.from({ length: n - 1 },
            (_, i) => (i + 1 < n - lugna ? 0.04 : 0.00001))],
          p: Array.from({ length: n }, (_, i) => (i < n - lugna ? 0.05 : 0.9)),
          min: minLangd,
        }),
      });
      assert.equal(r.status, 0, r.stderr);
      return JSON.parse(r.stdout);
    };

    // 1 lugn frame = 0,2 s svans. Det är ffmpegs dubblerade slutframe, inget kort.
    const en = kor(1, null);
    assert.equal(en.dom, 'NEJ', `en lugn slutframe får aldrig bli ett kort: ${en.skal}`);
    assert.equal(en.fran_s, null);

    // 4 lugna frames = 0,6 s svans — fortfarande under 0,8 s, alltså fortfarande NEJ.
    // Det här fallet är det som fäller en SÄNKNING av MIN_LANGD_S till 0,4 eller
    // 0,2: 0,6 s ligger över båda och hade blivit ett falskt JA.
    // (Enframes-fallet ensamt räckte inte — 0,2 s mot tröskeln 0,2 avgjordes av
    // flyttalsbrus, 0,19999999999999973 < 0,2, alltså av tur och inte av design.)
    const fyra = kor(4, null);
    assert.equal(fyra.dom, 'NEJ', `0,6 s lugn svans är under 0,8 s: ${fyra.skal}`);
    assert.equal(fyra.fran_s, null);

    // Och beviset att det är spärren som gör jobbet, inte plattheten: utan den
    // blir exakt samma mätdata ett JA. Fälls det här påståendet har någon sänkt
    // MIN_LANGD_S — läs kommentaren vid konstanten innan du ändrar testet.
    assert.equal(kor(1, 0).dom, 'JA', 'utan MIN_LANGD_S ska samma mätdata ge ett falskt JA');
    assert.equal(kor(4, 0).dom, 'JA');
  });
