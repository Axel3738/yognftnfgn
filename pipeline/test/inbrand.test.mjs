// Tester för pipeline/omdubb/inbrand.mjs — steget som byter källans inbrända
// svenska text mot marknadens.
//
// Två halvor:
//   1. DOMEN som rena funktioner (klass, överlägg, roll, marknadens text,
//      efterkontroll). Snabbt, inga beroenden, körs alltid.
//   2. HELA KEDJAN mot riktig ffmpeg, riktig Pillow och riktig OCR: en
//      syntetisk video byggs med svensk text inbränd, steget körs, och
//      resultatet MÄTS igen. Plus en MUTATION — samma video renderad med en
//      suddruta som medvetet missar pillret — där efterkontrollen SKA larma.
//      Utan mutationen bevisar det gröna testet bara att koden inte kraschar.
//
// ⚠️ Saknas ffmpeg, Pillow eller rapidocr HOPPAS del 2 med orsak — aldrig
// grönt på något som inte kördes (samma regel som factory/sjalvtest.mjs).
//
// Kostar ~35 s med allt på plats (rapidocrs modell laddas om per anrop).

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  vik, svenskaTraffar, SVENSKA_MARKORER, klassificeraRad, arOverlagg,
  delaFotrad, kallpriser, mappaRad, foljVersaler, byggPillerband, byggPopblock,
  efterdom, lasSrt, brandspärr, mat, PILLER_MAX_H, MAX_DRIFT,
} from '../omdubb/inbrand.mjs';

const ROT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const FONT = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf';
const finns = (exe, args) => { const r = spawnSync(exe, args, { encoding: 'utf8' }); return !r.error && r.status === 0; };
const HAR_FFMPEG = finns('ffmpeg', ['-version']);
const HAR_PIL = finns('python3', ['-c', 'import PIL, numpy']);
const HAR_OCR = finns('python3', ['-c', 'import rapidocr_onnxruntime']);
const HAR_FONT = existsSync(FONT);

// Marknadens sanning, som `factory/slutkort.py --json-text` skriver den.
const DK = {
  marknad: 'DK', sprak: 'da', valuta: 'DKK',
  badge: '14 DAGES FORTRYDELSESRET',
  pris: '819 kr.', jamforpris: '1.069 kr.',
  fotrad: 'Gratis fragt til Danmark · 14 dages fortrydelsesret · 5–10 hverdage',
};
const PRISER = { pris: ['1129'], jamforpris: ['1469'] };

// --------------------------------------------------------------------------
// 1. Domen som rena funktioner
// --------------------------------------------------------------------------
test('vik viker å/ä/ö — OCR läser "ÖPPET KÖP" som "OPPET KOP"', () => {
  assert.equal(vik('30 DAGARS ÖPPET KÖP'), '30dagarsoppetkop');
  assert.equal(vik('30 DAGARS OPPET KOP'), '30dagarsoppetkop');
  assert.equal(vik('FRI FRAKT'), vik('FRIFRAKT'));
  assert.equal(vik('Søren'), 'soren');
});

test('svenska markörer hittar källspråket men inte marknadens egen text', () => {
  assert.ok(svenskaTraffar('30 dagars öppet köp.').includes('oppetkop'));
  assert.ok(svenskaTraffar('1129 kronor.').includes('kronor'));
  assert.ok(svenskaTraffar('Jag drar taket').includes('jag'));
  assert.ok(svenskaTraffar('och dragsko i kanten.').includes('och'));
  // Danskan i annonsen får ALDRIG larma — då blir efterkontrollen värdelös.
  for (const dansk of ['14 dages fortrydelsesret', 'Gratis fragt til Danmark',
    '5–10 hverdage', '819 kr.', '1.069 kr.', 'Tagbetræk campingvogn & autocamper']) {
    assert.deepEqual(svenskaTraffar(dansk), [], `dansk rad larmade: ${dansk}`);
  }
});

test('butikens egna markorer_sv läggs till markörlistan', () => {
  assert.deepEqual(svenskaTraffar('Handla tryggt'), []);
  assert.ok(svenskaTraffar('Handla tryggt', ['Handla tryggt']).length > 0);
});

test('markörlistan innehåller inga ord som stavas lika på danska', () => {
  for (const lika of ['med', 'som', 'aldrig', 'pa', 'fast', 'blir', 'rem']) {
    assert.ok(!SVENSKA_MARKORER.includes(lika), `"${lika}" stavas lika på danska`);
  }
});

test('klassificering: piller nederst med låg radhöjd, pop på höjden', () => {
  const H = 1280;
  const piller = { box: [232, 927, 492, 972], h_andel: 0.0352, cy_andel: 0.7418 };
  const pop = { box: [114, 332, 619, 513], h_andel: 0.1414, cy_andel: 0.3301 };
  const villkor = { box: [75, 518, 634, 598], h_andel: 0.0625, cy_andel: 0.4359 };
  assert.equal(klassificeraRad(piller, H).klass, 'piller');
  assert.equal(klassificeraRad(pop, H).klass, 'pop');
  assert.equal(klassificeraRad(villkor, H).klass, 'pop');
  // liten text mitt i bild är varken det ena eller det andra
  assert.equal(klassificeraRad({ box: [400, 607, 510, 663], h_andel: 0.0437, cy_andel: 0.4961 }, H).klass, 'ovrig');
  assert.ok(PILLER_MAX_H > 0.041 && PILLER_MAX_H < 0.061, 'gränsen ska ligga mellan de två uppmätta högarna');
});

test('överlägg står still; filmad text följer kameran', () => {
  assert.equal(arOverlagg({ rutor: 4, drift_px: 2 }).ja, true);           // ordcaption
  assert.equal(arOverlagg({ rutor: 3, drift_px: 9 }).ja, false);          // "Jayco" på husvagnen
  assert.equal(arOverlagg({ rutor: 4, drift_px: 13 }).ja, false);         // "PRO-TEC" på väggen
  assert.equal(arOverlagg({ rutor: 1, drift_px: 0 }).ja, false);          // en enda bildruta
  assert.match(arOverlagg({ rutor: 3, drift_px: MAX_DRIFT + 1 }).regel, /följer kameran/);
});

test('fotraden delas i frakt · garanti · leverans, annars fel', () => {
  assert.deepEqual(delaFotrad(DK.fotrad), {
    frakt: 'Gratis fragt til Danmark', garanti: '14 dages fortrydelsesret', leverans: '5–10 hverdage',
  });
  assert.throws(() => delaFotrad('Gratis fragt til Danmark'), /inte 3/);
});

test('kallpriser läser produktens och varianternas basvalutapris', () => {
  const p = kallpriser({ ekonomi: { pris: 1129, jamforpris: 1469 }, varianter: [{ pris: 1263, jamforpris: 1578.75 }] });
  assert.deepEqual(p.pris.sort(), ['1129', '1263']);
  assert.ok(p.jamforpris.includes('1469') && p.jamforpris.includes('1579'));
});

test('mappaRad: priset matchas på SIFFRORNA, inte på formatet', () => {
  for (const skrivsatt of ['1129 KR', '1129KR', '1 129 kr', '1.129 KR.']) {
    const m = mappaRad(skrivsatt, DK, PRISER);
    assert.equal(m.roll, 'pris', skrivsatt);
    assert.equal(m.ny, '819 kr.');
  }
  assert.equal(mappaRad('1469 KR', DK, PRISER).roll, 'jamforpris');
});

test('mappaRad: villkoren blir BUTIKENS EGNA, aldrig källans siffra översatt', () => {
  const m = mappaRad('30 DAGARS ÖPPET KÖP', DK, PRISER);
  assert.equal(m.roll, 'villkor');
  assert.equal(m.ny, '14 DAGES FORTRYDELSESRET');
  assert.ok(!String(m.ny).includes('30'), 'källbutikens 30 dagar får aldrig följa med');
  assert.equal(mappaRad('14 DAGARS ÅNGERRÄTT', DK, PRISER).ny, '14 DAGES FORTRYDELSESRET');
});

test('mappaRad: frakt och leverans ur butikens egen fotrad, okänt blir okänt', () => {
  assert.equal(mappaRad('FRI FRAKT', DK, PRISER).ny, 'Gratis fragt til Danmark');
  assert.equal(mappaRad('FRIFRAKT', DK, PRISER).ny, 'Gratis fragt til Danmark');
  assert.equal(mappaRad('5-10 ARBETSDAGAR', DK, PRISER).ny, '5–10 hverdage');
  const okand = mappaRad('210D VÄV', DK, PRISER);
  assert.equal(okand.roll, 'okand');
  assert.equal(okand.ny, null);
});

test('versalerna följer källan', () => {
  assert.equal(foljVersaler('1129 KR', '819 kr.'), '819 KR.');
  assert.equal(foljVersaler('1129 kronor.', '819 kr.'), '819 kr.');
});

test('byggPopblock: jämförprisraden hittas som grannrad när OCR läst skräp', () => {
  const matning = {
    W: 720, H: 1280,
    rodblock: [{
      t: [16.9, 19.5], box: [122, 236, 616, 635],
      rader: [
        { text: '1129KR', box: [114, 332, 619, 513], texter: ['1129KR'], rutor: 7 },
        { text: '1400 KR', box: [207, 527, 518, 630], texter: ['14', '1400 KR', 'TUUT'], rutor: 5 },
      ],
    }],
  };
  const [block] = byggPopblock(matning, DK, PRISER);
  assert.equal(block.rader[0].roll, 'pris');
  assert.equal(block.rader[0].ny, '819 KR.');
  assert.equal(block.rader[1].roll, 'jamforpris');
  assert.equal(block.rader[1].ny, '1.069 KR.');
  assert.match(block.rader[1].regel, /raden under prisraden/);
  // plattan täcker BÅDE det röda blocket och radernas rutor
  assert.ok(block.platta[1] <= 236 && block.platta[3] >= 630);
  assert.ok(block.platta[0] <= 114 && block.platta[2] >= 619);
});

test('byggPillerband: bara stabila rader får bestämma bandet', () => {
  const matning = {
    W: 720, H: 1280, fps: 3, till: 22.5,
    piller: { median_box: [150, 916, 479, 977], fonster: [{ t: [1.3, 5.5], box: [0, 916, 719, 994], rutor: 42 }] },
    rader: [
      { text: 'Jag drar taket', box: [232, 927, 492, 972], t: [3, 4.3], rutor: 4, drift_px: 2 },
      { text: 'Rymms i forvaringspasen', box: [130, 926, 588, 971], t: [11.7, 13.7], rutor: 6, drift_px: 2 },
      // "to" är ett fragment av husvagnens märke, en enda bildruta, 34 px under pillret
      { text: 'to', box: [331, 996, 352, 1011], t: [1, 1.3], rutor: 1, drift_px: 0 },
    ],
  };
  const band = byggPillerband(matning);
  assert.equal(band.rader.length, 2, 'engångsavläsningen "to" ska inte räknas');
  assert.ok(band.rect[3] < 1000, `bandet drogs ned till ${band.rect[3]} av ett filmat märke`);
  assert.equal(band.rect[0], 0, 'standard är ett band över hela bredden (no-captions.py:s facit)');
  const ruta = byggPillerband(matning, { helBredd: false });
  assert.ok(ruta.rect[0] > 100 && ruta.rect[2] < 620, 'med --pillerruta blir det en tight ruta');
  // tiderna klipps vid `till`
  assert.ok(band.tider.every(([, t1]) => t1 <= 22.5));
});

test('efterdom: vår egen danska text är aldrig "kvar", källans svenska är det', () => {
  const skrivna = ['819 KR.', 'GRATIS FRAGT TIL DANMARK', '14 DAGES FORTRYDELSESRET'];
  const efter = {
    rader: [
      { text: 'GRATIS FRAGT TIL DANMARK', box: [61, 337, 659, 510], t: [19.6, 22.5], rutor: 9, drift_px: 1 },
      { text: '14 DAGES FORTRYDELSESRET', box: [75, 518, 634, 598], t: [20.7, 22.3], rutor: 5, drift_px: 1 },
      { text: '30 dagars oppet kop.', box: [168, 927, 546, 974], t: [20.3, 22.6], rutor: 7, drift_px: 3 },
    ],
  };
  const kvar = efterdom(efter, skrivna);
  assert.equal(kvar.length, 1);
  assert.equal(kvar[0].text, '30 dagars oppet kop.');
  assert.ok(kvar[0].markorer.includes('oppetkop'));
  assert.equal(efterdom({ rader: efter.rader.slice(0, 2) }, skrivna).length, 0);
});

test('brandspärren vägrar rita butikens namn eller domän', () => {
  assert.doesNotThrow(() => brandspärr(['819 KR.', 'GRATIS FRAGT TIL DANMARK']));
  assert.throws(() => brandspärr(['KØB PÅ BAVERBUTIKEN.SE']), /BRANDORD/);
  assert.throws(() => brandspärr(['Beverbutikken']), /BRANDORD/);
});

test('lasSrt läser tider och text', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'inbrand-srt-'));
  const fil = join(mapp, 'a.srt');
  writeFileSync(fil, '1\n00:00:01,500 --> 00:00:03,000\nOtte hundrede\nog nitten kroner.\n\n');
  const cues = lasSrt(fil);
  assert.equal(cues.length, 1);
  assert.equal(cues[0].t0, 1.5);
  assert.equal(cues[0].t1, 3);
  assert.equal(cues[0].text, 'Otte hundrede og nitten kroner.');
  rmSync(mapp, { recursive: true, force: true });
});

// --------------------------------------------------------------------------
// 2. Hela kedjan mot riktig ffmpeg + OCR, med mutation
// --------------------------------------------------------------------------
const hoppa = !HAR_FFMPEG ? 'ffmpeg saknas'
  : !HAR_PIL ? 'Pillow/numpy saknas'
    : !HAR_OCR ? 'rapidocr-onnxruntime saknas'
      : !HAR_FONT ? `typsnittet ${FONT} saknas` : null;

/** Syntetisk annons: rörlig bakgrund + vitt ordcaption-piller nederst +
 *  stor röd pop-text mitt i bild. Allt på svenska, precis som källorna. */
function byggKalla(mapp) {
  const py = `
import os
from PIL import Image, ImageDraw, ImageFont
M = ${JSON.stringify(mapp)}
W, H, N = 480, 854, 32
FET = ${JSON.stringify(FONT)}
stor = ImageFont.truetype(FET, 62)
liten = ImageFont.truetype(FET, 26)
for i in range(N):
    im = Image.new("RGB", (W, H), (20 + (i * 7) % 180, 90, 200 - (i * 5) % 150))
    d = ImageDraw.Draw(im)
    d.rectangle([(i * 13) % W, (i * 23) % H, (i * 13) % W + 190, (i * 23) % H + 260], fill=(245, 230, 40))
    d.ellipse([W - 170 - (i * 9) % 120, 60, W - 30 - (i * 9) % 120, 200], fill=(30, 200, 120))
    # ordcaption: vitt piller med mörk text, nederst (y ~ 0,74 av höjden)
    t = "30 dagars oppet kop."
    w = liten.getlength(t)
    d.rounded_rectangle([W/2 - w/2 - 14, 610, W/2 + w/2 + 14, 658], radius=8, fill=(252, 252, 252))
    d.text((W/2 - w/2, 618), t, font=liten, fill=(18, 18, 18))
    # pop-text: vit fet versal med röd kant, mitt i bild, från ruta 12
    if i >= 12:
        for rad, y in (("1129 KR", 250), ("FRI FRAKT", 340)):
            w = stor.getlength(rad)
            d.text((W/2 - w/2, y), rad, font=stor, fill=(255, 255, 255),
                   stroke_width=7, stroke_fill=(214, 30, 30))
    im.save(os.path.join(M, "k%03d.png" % i))
print("ok")
`;
  const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
  assert.equal(r.status, 0, `kunde inte bygga bildrutorna: ${r.stderr}`);
  const mp4 = join(mapp, 'kalla.mp4');
  const f = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '8', '-i', join(mapp, 'k%03d.png'),
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '16', mp4], { encoding: 'utf8' });
  assert.equal(f.status, 0, `ffmpeg: ${f.stderr}`);
  return mp4;
}

test('hela kedjan på en riktig video: mätning, byte, efterkontroll — och mutationen larmar', { skip: hoppa ? `HOPPAD: ${hoppa}` : false }, () => {
  const mapp = mkdtempSync(join(tmpdir(), 'inbrand-e2e-'));
  try {
    const kalla = byggKalla(mapp);

    // --- mätningen hittar båda sorterna -------------------------------
    const fore = mat(kalla, { fps: 4 });
    assert.equal(fore.W, 480);
    assert.ok(fore.piller.rutor_med_piller > 10, `pillret mättes i ${fore.piller.rutor_med_piller} bildrutor`);
    assert.ok(fore.rodblock.length >= 1, 'inget rött pop-block hittades');
    const poptexter = fore.rodblock.flatMap((b) => b.rader.map((r) => vik(r.text)));
    assert.ok(poptexter.some((t) => t.includes('1129')), `pop-raderna lästes som ${JSON.stringify(poptexter)}`);
    const pillertexter = fore.rader.filter((r) => klassificeraRad(r, fore.H).klass === 'piller').map((r) => vik(r.text));
    assert.ok(pillertexter.some((t) => t.includes('dagars')), `pillerraderna lästes som ${JSON.stringify(pillertexter)}`);

    // --- steget körs skarpt -------------------------------------------
    const ut = join(mapp, 'dk.mp4');
    const k = spawnSync('node', [join(ROT, 'pipeline', 'omdubb', 'inbrand.mjs'),
      `--kalla=${kalla}`, `--ut=${ut}`, '--marknad=DK',
      `--produkt=${join(ROT, 'factory', 'produkter', 'takskyddet.yaml')}`,
      `--butik=${join(ROT, 'factory', 'butiker', 'carashell.yaml')}`, '--fps=4'],
    { encoding: 'utf8' });
    assert.ok(existsSync(ut), `inbrand.mjs skrev ingen fil (kod ${k.status}):\n${k.stdout}\n${k.stderr}`);
    assert.match(k.stdout, /\[pris\]/, 'prisraden klassades inte som pris');
    assert.match(k.stdout, /\[frakt\]/, 'fraktraden klassades inte som frakt');
    assert.equal(k.status, 0, `domen blev inte REN:\n${k.stdout.slice(-1500)}`);

    const efter = mat(ut, { fps: 4 });
    const kvarText = efter.rader.map((r) => vik(r.text));
    assert.ok(!kvarText.some((t) => t.includes('dagars')), `svensk ordcaption kvar: ${JSON.stringify(kvarText)}`);
    assert.ok(!kvarText.some((t) => t.includes('1129')), `svenskt pris kvar: ${JSON.stringify(kvarText)}`);
    assert.equal(efterdom(efter, ['819 KR.', 'GRATIS FRAGT TIL DANMARK', '1.069 KR.', '14 DAGES FORTRYDELSESRET']).length, 0);

    // --- MUTATIONEN ----------------------------------------------------
    // Samma video, men suddrutan flyttas 300 px UPP så den missar pillret.
    // Går efterkontrollen igenom här är den värdelös.
    const trasig = join(mapp, 'trasig.mp4');
    const plan = {
      in: kalla, ut: trasig, W: fore.W, H: fore.H,
      produkt: join(ROT, 'factory', 'produkter', 'takskyddet.yaml'),
      butik: join(ROT, 'factory', 'butiker', 'carashell.yaml'), marknad: 'DK',
      atgarder: [{ typ: 'sudda', rect: [0, 300, fore.W, 380], t: [0, 99] }],
    };
    const planfil = join(mapp, 'mutation.json');
    writeFileSync(planfil, JSON.stringify(plan));
    const m = spawnSync('python3', [join(ROT, 'pipeline', 'omdubb', 'inbrand-rita.py'), planfil], { encoding: 'utf8' });
    assert.equal(m.status, 0, `rita.py: ${m.stderr}`);
    const muterad = mat(trasig, { fps: 4 });
    const larm = efterdom(muterad, ['819 KR.', 'GRATIS FRAGT TIL DANMARK']);
    assert.ok(larm.length > 0, 'efterkontrollen såg INTE den svenska texten som lämnades kvar');
    assert.ok(larm.some((l) => l.markorer.includes('oppetkop') || l.markorer.includes('dagars')),
      `larmet pekade inte på ordcaptionen: ${JSON.stringify(larm.map((l) => l.text))}`);
  } finally {
    rmSync(mapp, { recursive: true, force: true });
  }
});

test('brandspärren stoppar renderingen innan en enda pixel skrivs', { skip: hoppa ? `HOPPAD: ${hoppa}` : false }, () => {
  const mapp = mkdtempSync(join(tmpdir(), 'inbrand-brand-'));
  try {
    const kalla = byggKalla(mapp);
    const ut = join(mapp, 'brand.mp4');
    const planfil = join(mapp, 'plan.json');
    writeFileSync(planfil, JSON.stringify({
      in: kalla, ut, W: 480, H: 854,
      produkt: join(ROT, 'factory', 'produkter', 'takskyddet.yaml'),
      butik: join(ROT, 'factory', 'butiker', 'carashell.yaml'), marknad: 'DK',
      atgarder: [{ typ: 'pop', t: [0, 99], platta: [40, 200, 440, 420], rader: [{ text: 'KØB PÅ CARASHELL.SE', box: [60, 240, 420, 300] }] }],
    }));
    const r = spawnSync('python3', [join(ROT, 'pipeline', 'omdubb', 'inbrand-rita.py'), planfil], { encoding: 'utf8' });
    assert.notEqual(r.status, 0, 'renderingen gick igenom med butikens domän i bilden');
    assert.match(r.stderr, /BRANDORD/);
    assert.ok(!existsSync(ut), 'filen skrevs trots brandordet');
  } finally {
    rmSync(mapp, { recursive: true, force: true });
  }
});

test('jämförpriset stryks över, priset gör det inte — källan visar ett streck genom 1 469 KR', async () => {
  // Mätt 2026-09-20 på KÄLLANS bildruta 17,6 s i CaraShellRoof_CO_101_H1:
  // "1 469 KR" bär ett tjockt streck rakt igenom, "1129 KR" gör det inte.
  // Utan strecket läses jämförpriset som ett andra pris och rabatten försvinner.
  const { byggPopblock, marknadstexter } = await import('../omdubb/inbrand.mjs');
  const matning = {
    W: 720, H: 1280,
    rodblock: [{
      t: [17.0, 19.4], box: [40, 236, 680, 640],
      rader: [
        { text: '1129KR', box: [124, 340, 605, 500], konf: 0.9, rutor: 7 },
        { text: '1469KR', box: [194, 528, 624, 618], konf: 0.6, rutor: 7 },
      ],
    }],
  };
  // Marknadstexten tas ur de RIKTIGA filerna — en handskriven fixtur hade
  // kunnat ha fel form och då mätt fel sak.
  const { texter } = marknadstexter({
    produkt: 'factory/produkter/takskyddet.yaml',
    butik: 'factory/butiker/carashell.yaml',
    marknad: 'DK',
  });
  const block = byggPopblock(matning, texter, { pris: ['1129'], jamforpris: ['1469'] });
  const rader = block.flatMap((b) => b.rader);
  const pris = rader.find((r) => r.roll === 'pris');
  const jamfor = rader.find((r) => r.roll === 'jamforpris');
  assert.ok(pris?.ny, 'priset ska bytas');
  assert.ok(jamfor?.ny, 'jämförpriset ska bytas');
  assert.equal(jamfor.stryk, true, 'jämförpriset MÅSTE strykas över');
  assert.equal(pris.stryk, false, 'priset får aldrig strykas över');
});

test('språkneutral rad skrivs tillbaka oförändrad — ett mått är inte text att översätta', async () => {
  // ⚠️ Mätt 2026-09-20: CaraShellRoof_PD_107_H1 och RI_103_H1 fick en svart
  // platta över "6,5×3 m", eftersom ingen regel träffade. Storleken ser
  // likadan ut på svenska och danska.
  const { sprakneutral, mappaRad, marknadstexter } = await import('../omdubb/inbrand.mjs');
  assert.equal(sprakneutral('6,5×3 m'), true);
  assert.equal(sprakneutral('6,5 × 3 m'), true);
  assert.equal(sprakneutral('19,5 m²'), true);
  assert.equal(sprakneutral('210D-VÄV'), false, 'väv är ett ord, inte en enhet');
  assert.equal(sprakneutral('FRI FRAKT'), false);
  assert.equal(sprakneutral(''), false, 'tom rad är inte neutral');
  const { texter } = marknadstexter({
    produkt: 'factory/produkter/takskyddet.yaml',
    butik: 'factory/butiker/carashell.yaml',
    marknad: 'DK',
  });
  const m = mappaRad('6,5×3 m', texter, { pris: ['1129'], jamforpris: ['1469'] });
  assert.equal(m.roll, 'neutral');
  assert.equal(m.ny, '6,5×3 m', 'måttet skrivs tillbaka exakt som det stod');
});

test('specord hämtar ordet ur BUTIKENS egen marknadstext, aldrig ur en påhittad översättning', async () => {
  // "210D-VÄV" blev en svart platta i OB_101 och SP_104 (mätt 2026-09-20).
  // Butikens egen danska säger "210D Oxford-væv" i features — därifrån, och
  // ingen annanstans, kommer ordet.
  const { specord } = await import('../omdubb/inbrand.mjs');
  const mt = { features: ['Ni størrelser: 5,5 til 13,5 m langt', 'Sort 210D Oxford-væv, vandtæt og tåler sol'], fotrad: '', titel: '' };
  const s = specord('210D-VÄV', mt);
  assert.ok(s, 'koden 210D finns i butikens features');
  assert.equal(s.ny, '210D-VÆV', 'versalerna följer källan, ordet kommer ur butikens text');
  // Utan en features-rad med koden ska den hellre säga nej än hitta på.
  assert.equal(specord('210D-VÄV', { features: ['Sort væv, vandtæt'], fotrad: '', titel: '' }), null);
  assert.equal(specord('FRI FRAKT', mt), null, 'ingen teknisk kod i raden');
});

test('filmad text fäller aldrig videon — trycket på en t-shirt är inte vår svenska', async () => {
  // ⚠️ Mätt 2026-09-20: OCR läste "IN THE MEADOW" på en t-shirt i
  // CaraShellRoof_PD_3_H1 som "INTE MEADOW", markören "inte" slog till, och
  // två färdiga videor dömdes "SVENSK TEXT KVAR". Texten sitter på ett plagg.
  const { efterdom, MAX_DRIFT } = await import('../omdubb/inbrand.mjs');
  const overlagg = { text: 'INTE MEADOW', t: [2.6, 3.0], box: [10, 10, 100, 40], rutor: 4, drift_px: 1 };
  const filmad = { ...overlagg, drift_px: MAX_DRIFT + 5 };
  const a = efterdom({ rader: [overlagg] }, [], []);
  const b = efterdom({ rader: [filmad] }, [], []);
  assert.equal(a.length, 1); assert.equal(a[0].filmad, false, 'ett stillastående överlägg ÄR vårt');
  assert.equal(b.length, 1); assert.equal(b[0].filmad, true, 'text som följer kameran är filmad');
});
