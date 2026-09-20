// Bildmarknaden: källans svenska text i en BILDANNONS → marknadens.
// Kör: node --test factory/test/bildmarknad.test.mjs
//
// Två sorters test i samma fil:
//   1. domlogiken (ren funktion, inget nät, ingen bild)
//   2. hela kedjan mot en SYNTETISK bild som byggs här i testet — gradient +
//      text i en KÄND ruta, så mätningen, suddningen och efterkontrollen går
//      att pröva mot ett facit i stället för mot en åsikt.
//
// Testerna i grupp 2 kräver Pillow, numpy och rapidocr i containern. Saknas
// något HOPPAS de över med orsak — aldrig grönt för något som inte kördes.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mappaBildrad, harProsa, fotdelar, rabattTal, kallrabatt, tillatenBredd } from '../bildmarknad.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

// Marknadens sanning för DK, som factory/slutkort.py skriver den.
const MT = {
  pris: '819 kr.', jamforpris: '1.069 kr.', badge: '14 DAGES FORTRYDELSESRET',
  fotrad: 'Gratis fragt til Danmark · 14 dages fortrydelsesret · 5–10 hverdage',
};
const PRISER = { pris: ['1129'], jamforpris: ['1469'] };
const EXTRA = { rabatt: '250 kr.', kallrabatter: ['340'], markorer: [] };

describe('domen: vad en rad ska bli', () => {
  test('ett ensamt pris blir marknadens pris', () => {
    const m = mappaBildrad('1 129 kr', MT, PRISER, EXTRA);
    assert.equal(m.roll, 'pris');
    assert.equal(m.ny, '819 kr.');
  });

  test('en rad med BARA tal och en pil byter båda talen', () => {
    const m = mappaBildrad('1 469 kr → 1 129 kr', MT, PRISER, EXTRA);
    assert.equal(m.roll, 'prispar');
    assert.equal(m.ny, '1.069 kr. → 819 kr.');
  });

  test('RABATTEN räknas, den översätts aldrig', () => {
    // Hela poängen med verktyget: 1 069 − 819 = 250, inte 340.
    const m = mappaBildrad('340', MT, PRISER, EXTRA);
    assert.equal(m.roll, 'rabatt');
    assert.equal(m.ny, '250 kr.');
    assert.ok(!String(m.ny).includes('340'), 'källans rabatt får aldrig följa med');
  });

  test('"Beställ nu – spara 340 kr" får INGEN automatisk ersättning', () => {
    // ⚠️ Regressionstest. Före rättningen 2026-09-20 slog rabattregeln till på
    // radens siffror och skrev hela knapptexten till "250 kr." — budskapet
    // försvann ur annonsen utan att något larmade.
    const m = mappaBildrad('Beställ nu – spara 340 kr', MT, PRISER, EXTRA);
    assert.equal(m.roll, 'blandad');
    assert.equal(m.ny, null);
    assert.match(m.regel, /KÄLLPRIS/);
  });

  test('en fotrad med TVÅ löften ger båda, i källans ordning', () => {
    const m = mappaBildrad('Fri frakt · Leverans 5–10 arbetsdagar', MT, PRISER, EXTRA);
    assert.equal(m.roll, 'fotrad');
    assert.equal(m.ny, 'Gratis fragt til Danmark · 5–10 hverdage');
  });

  test('villkoren tas ur BUTIKEN, inte ur källans siffra', () => {
    // "30 dagars öppet köp" är källbutikens löfte. Danmark har 14 dages
    // fortrydelsesret — en översättning hade skrivit 30 dages.
    const m = mappaBildrad('30 dagars öppet köp', MT, PRISER, EXTRA);
    assert.equal(m.roll, 'villkor');
    assert.equal(m.ny, MT.badge);
    assert.ok(!String(m.ny).includes('30'));
  });

  test('ett procenttal är samma på båda språken och lämnas orört', () => {
    const m = mappaBildrad('−23 %', MT, PRISER, EXTRA);
    assert.equal(m.roll, 'sprakneutral');
    assert.equal(m.ny, null);
  });

  test('prosa utan siffror efterlyses som skriven rad', () => {
    const m = mappaBildrad('Täcker taket – inte hela vagnen', MT, PRISER, EXTRA);
    assert.equal(m.roll, 'prosa');
    assert.equal(m.ny, null);
  });

  test('harProsa skiljer tal med valuta från text', () => {
    assert.equal(harProsa('1 129 kr'), false);
    assert.equal(harProsa('1 469 kr → 1 129 kr'), false);
    assert.equal(harProsa('−23 %'), false);
    assert.equal(harProsa('spara 340 kr'), true);
    assert.equal(harProsa('Fri frakt'), true);
  });

  test('fotdelar hittar löftena i den ordning källan skrev dem', () => {
    const d = fotdelar('14 dagars ångerrätt · Fri frakt', MT);
    assert.deepEqual(d.map((x) => x.roll), ['villkor', 'frakt']);
  });
});

describe('talen kommer ur produktfilen', () => {
  const produkt = {
    ekonomi: {
      pris: 1129, jamforpris: 1469,
      marknadspriser: [{ valuta: 'DKK', pris: 819, jamforpris: 1069 }],
    },
    varianter: [{ pris: 1289, jamforpris: 1679 }],
  };

  test('rabatten i marknadens valuta räknas ur marknadens två priser', () => {
    assert.equal(rabattTal(produkt, 'DKK'), 250);
  });

  test('källans rabatter täcker varianterna också', () => {
    assert.deepEqual(kallrabatt(produkt).sort(), ['340', '390']);
  });

  test('en valuta produktfilen inte känner ger null, aldrig en gissning', () => {
    assert.equal(rabattTal(produkt, 'GBP'), null);
  });
});

describe('hur bred den nya raden får bli', () => {
  const rad = (justering, platta) => ({
    stil: { ink_box: [400, 100, 600, 150], justering },
    bakgrund: { platta },
  });

  test('en centrerad rad på en platta får plattans bredd, inte källtextens', () => {
    // ⚠️ Regressionstest: med källrutan som tak krympte danska rader i onödan
    // (mätt 2026-09-20: "210D-väv …" 32,5 → 25,5 px med 250 px ledigt kvar).
    const b = tillatenBredd(rad('center', [100, 80, 900, 170]), 1000);
    assert.ok(b > 400, `väntade mer än källans 200 px, fick ${b}`);
  });

  test('en vänsterställd rad mäts från sin egen vänsterkant till plattans slut', () => {
    const b = tillatenBredd(rad('vanster', [100, 80, 900, 170]), 1000);
    assert.ok(b > 250 && b < 500, `fick ${b}`);
  });

  test('utan platta är BILDEN gränsen', () => {
    const b = tillatenBredd(rad('center', null), 1000);
    assert.ok(b > 400, `fick ${b}`);
  });
});

// --------------------------------------------------------------------------
// Hela kedjan mot en syntetisk bild
// --------------------------------------------------------------------------
const py = (argv) => spawnSync('python3', argv, { encoding: 'utf8', maxBuffer: 1 << 28 });

const harBeroenden = () => {
  const r = py(['-c', 'import numpy, PIL, rapidocr_onnxruntime']);
  return r.status === 0;
};

// Bygger en bild som liknar källorna: lodrät gradient + en fet svart rad i en
// KÄND ruta. Facit är alltså ritat av testet självt.
const BYGG = `
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont
ut, text, storlek = sys.argv[1], sys.argv[2], int(sys.argv[3])
W, H = 900, 500
# Lutningen är vald för att likna källorna: CaraShellRoof_BOF_101_1.jpg mätte
# ringstd 10,5 kring "210D-väv"-raden 2026-09-20. En flackare gradient läses
# som en enfärgad platta — vilket är rätt, men prövar inte gradientvägen.
g = np.linspace(255, 95, H).astype(np.float32)
a = np.repeat(np.repeat(g[:, None], W, 1)[:, :, None], 3, 2)
im = Image.fromarray(a.astype(np.uint8), "RGB")
f = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf", storlek)
d = ImageDraw.Draw(im)
bb = f.getbbox(text)
x = (W - (bb[2] - bb[0])) / 2 - bb[0]
d.text((x, 200 - bb[1]), text, font=f, fill=(20, 20, 20))
im.save(ut, quality=98, subsampling=0)
print(int(x + bb[0]), 200, int(x + bb[2]), int(200 + bb[3] - bb[1]))
`;

describe('hela kedjan mot en syntetisk bild', { skip: harBeroenden() ? false : 'HOPPAD: numpy/Pillow/rapidocr saknas i containern' }, () => {
  const jobb = mkdtempSync(join(tmpdir(), 'bildmarknad-'));
  const bild = join(jobb, 'kalla.jpg');
  const byggfil = join(jobb, 'bygg.py');
  writeFileSync(byggfil, BYGG);
  // Texten är ett rent pris, så den automatiska mappningen kan döma den.
  const byggd = py([byggfil, bild, '1 129 kr', '64']);
  const facit = byggd.stdout.trim().split(/\s+/).map(Number);

  test('mätningen hittar texten i rutan vi själva ritade den i', () => {
    const r = py([join(ROT, 'factory', 'bildmarknad-mat.py'), bild]);
    assert.equal(r.status, 0, r.stderr);
    const d = JSON.parse(r.stdout);
    const rad = d.rader.find((x) => /1\s*129/.test(x.text));
    assert.ok(rad, `hittade ingen prisrad; OCR läste ${JSON.stringify(d.rader.map((x) => x.text))}`);
    // Rutan ska ligga över facit — några pixlars glapp är OCR:ens kantutjämning.
    assert.ok(Math.abs(rad.stil.ink_box[0] - facit[0]) < 12, `vänsterkant ${rad.stil.ink_box[0]} mot facit ${facit[0]}`);
    assert.ok(Math.abs(rad.stil.ink_box[1] - facit[1]) < 12, `överkant ${rad.stil.ink_box[1]} mot facit ${facit[1]}`);
    assert.equal(rad.stil.fet, true, 'texten ritades fet och ska mätas som fet');
    assert.ok(Math.abs(rad.stil.storlek - 64) <= 8, `storlek ${rad.stil.storlek} mot ritade 64`);
    assert.equal(rad.bakgrund.klass, 'gradient', `bakgrunden är en gradient, mättes som ${rad.bakgrund.klass}`);
  });

  // Mäter steget mellan pixlarna strax INNANFÖR och strax UTANFÖR rutans
  // över- och underkant. På en gradient ska det vara nära noll, eftersom
  // bakgrunden återskapas och inte suddas ut.
  //
  // ⚠️ Kanterna mäts VAR FÖR SIG och det största steget vinner. Första
  // versionen slog ihop över- och underkant i ett medelvärde, och då tog
  // felen ut varandra: en platt fyllning mitt i en gradient ligger för mörkt
  // upptill och lika mycket för ljust nedtill. Mätt 2026-09-20 på den
  // syntetiska bilden gav den hopslagna varianten 0,03 — och släppte igenom
  // en mutation som bytte interpolationen mot en platt färg. Var för sig
  // mäter samma fall 11,63.
  const matSkarv = (fil, ruta) => {
    const r = py(['-c', `
import sys, numpy as np
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(float)
x0, y0, x1, y1 = [int(v) for v in sys.argv[2:6]]
def steg(i0, i1, u0, u1):
    inn = a[i0:i1, x0:x1+1].reshape(-1,3).mean(axis=0)
    ut  = a[u0:u1, x0:x1+1].reshape(-1,3).mean(axis=0)
    return float(np.abs(inn - ut).max())
print(max(steg(y0+1, y0+4, y0-4, y0-1), steg(y1-3, y1, y1+2, y1+5)))
`, fil, ...ruta.map(String)]);
    assert.equal(r.status, 0, `skarvmätningen kraschade: ${r.stderr}`);
    const v = Number(r.stdout.trim());
    assert.ok(Number.isFinite(v), `skarvmätningen gav inget tal: "${r.stdout}"`);
    return v;
  };

  const planera = (namn, rad, ny_text) => {
    const plan = join(jobb, `${namn}.json`);
    const ut = join(jobb, `${namn}.jpg`);
    writeFileSync(plan, JSON.stringify({
      in: bild, ut,
      atgarder: [{ i: 0, ruta: rad.ruta, bakgrund: rad.bakgrund, stil: rad.stil, kalltext: rad.text, ny_text, stryk: false, maxbredd: 800 }],
    }));
    const rita = py([join(ROT, 'factory', 'bildmarknad-rita.py'), plan]);
    assert.equal(rita.status, 0, rita.stderr);
    assert.ok(existsSync(ut));
    return ut;
  };

  const prisraden = () => {
    const r = py([join(ROT, 'factory', 'bildmarknad-mat.py'), bild]);
    return JSON.parse(r.stdout).rader.find((x) => /1\s*129/.test(x.text));
  };

  test('SUDDNINGEN ENSAM tar bort källans text', () => {
    // ⚠️ Testas UTAN att skriva den nya texten. Med den nya raden ovanpå är
    // provet värdelöst: "819 kr." täcker "1 129 kr" och OCR:en läser den nya
    // raden även om suddningen inte gjort någonting alls. Mätt 2026-09-20 —
    // en mutation som tog bort hela gradientsuddningen passerade testet så
    // länge den nya texten ritades.
    const ut = planera('bara-sudd', prisraden(), null);
    const efter = JSON.parse(py([join(ROT, 'factory', 'bildmarknad-mat.py'), ut]).stdout);
    const texter = efter.rader.map((x) => x.text).join(' ');
    assert.ok(!/129/.test(texter), `källans pris står kvar efter suddningen: "${texter}"`);
  });

  test('SUDDNINGEN ÄR SKARP — ingen rektangel i gradienten', () => {
    const rad = prisraden();
    const ut = planera('bara-sudd2', rad, null);
    const steg = matSkarv(ut, rad.ruta);
    assert.ok(steg < 6, `suddningen lämnade ett steg på ${steg.toFixed(2)} nivåer vid rutans kant — det syns som en rektangel`);
  });

  test('den nya texten skrivs där den gamla stod', () => {
    const ut = planera('full', prisraden(), '819 kr.');
    const efter = JSON.parse(py([join(ROT, 'factory', 'bildmarknad-mat.py'), ut]).stdout);
    const texter = efter.rader.map((x) => x.text).join(' ');
    assert.ok(/819/.test(texter), `marknadens pris skrevs inte: ${texter}`);
    assert.ok(!/1\s*129/.test(texter), `källans pris står kvar: ${texter}`);
  });

  test('EFTERKONTROLLEN LARMAR när suddningen missar', () => {
    // MUTATION: planen pekar ut en ruta som ligger BREDVID texten, så
    // suddningen träffar tom bakgrund och källans pris står kvar. Larmar inte
    // testet här är efterkontrollen värdelös — den skulle godkänna en bild med
    // svensk text i.
    const plan = join(jobb, 'plan-fel.json');
    const ut = join(jobb, 'ut-fel.jpg');
    const r = py([join(ROT, 'factory', 'bildmarknad-mat.py'), bild]);
    const rad = JSON.parse(r.stdout).rader.find((x) => /1\s*129/.test(x.text));
    const bredvid = [10, rad.ruta[1], 120, rad.ruta[3]];
    writeFileSync(plan, JSON.stringify({
      in: bild, ut,
      atgarder: [{ i: 0, ruta: bredvid, bakgrund: rad.bakgrund, stil: { ...rad.stil, ink_box: [10, rad.stil.ink_box[1], 120, rad.stil.ink_box[3]] }, kalltext: rad.text, ny_text: '819 kr.', stryk: false, maxbredd: 110 }],
    }));
    py([join(ROT, 'factory', 'bildmarknad-rita.py'), plan]);
    const efter = JSON.parse(py([join(ROT, 'factory', 'bildmarknad-mat.py'), ut]).stdout);
    const texter = efter.rader.map((x) => x.text).join(' ');
    assert.ok(/1\s*129/.test(texter),
      `mutationen upptäcktes inte: källans pris skulle ha stått kvar men OCR:en läste "${texter}"`);
  });

  test('städar upp', () => { rmSync(jobb, { recursive: true, force: true }); });
});
