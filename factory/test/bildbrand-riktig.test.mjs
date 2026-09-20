// End-to-end-test för factory/bildbrand.mjs mot RIKTIG ffmpeg och RIKTIG OCR.
//
// bildbrand.test.mjs injicerar ffmpeg och OCR och mäter beslutet. Det testet
// är grönt även om ffmpeg-anropen är fel skrivna — därför finns det här: det
// bygger en riktig mp4 (rörlig film + ett stillastående slutkort med text),
// kör hela kedjan och kontrollerar att domen blir den rätta.
//
// ⚠️ Saknas ffmpeg, python3, Pillow eller rapidocr HOPPAS testet med orsak —
// aldrig grönt på något som inte kördes (factory/sjalvtest.mjs, samma regel).
//
// Kostar ~4 s (varav ~3 s är rapidocrs modelladdning, en gång per process).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { granskaSlutkort, DOMAR } from '../bildbrand.mjs';

const finns = (exe, args) => { const r = spawnSync(exe, args, { encoding: 'utf8' }); return !r.error && r.status === 0; };
const FFMPEG = finns('ffmpeg', ['-version']);
const PYTHON = finns('python3', ['-c', 'import PIL']);
const OCR = finns('python3', ['-c', 'import rapidocr_onnxruntime']);
const FONT = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf';

/** 3 s rörlig film + 3 s stillastående slutkort med `rader`, som en mp4. */
function byggVideo(mapp, rader) {
  const py = `
from PIL import Image, ImageDraw, ImageFont
import os
M = ${JSON.stringify(mapp)}
W, H = 360, 640
# 30 rutor film: ett mönster som flyttar sig rejält mellan varje ruta.
for i in range(30):
    im = Image.new("RGB", (W, H), (10 + i * 8 % 200, 40, 200 - i * 6 % 180))
    d = ImageDraw.Draw(im)
    d.rectangle([i * 11 % W, i * 19 % H, i * 11 % W + 160, i * 19 % H + 220], fill=(240, 240, 20))
    im.save(os.path.join(M, "film%03d.png" % i))
kort = Image.new("RGB", (W, H), (8, 8, 10))
d = ImageDraw.Draw(kort)
y = 160
for text, storlek in ${JSON.stringify(rader)}:
    f = ImageFont.truetype(${JSON.stringify(FONT)}, storlek)
    d.text(((W - f.getlength(text)) / 2, y), text, font=f, fill=(255, 255, 255))
    y += storlek + 30
kort.save(os.path.join(M, "kort.png"))
`;
  const r = spawnSync('python3', ['-c', py], { encoding: 'utf8' });
  assert.equal(r.status, 0, `bilderna kunde inte byggas: ${r.stderr}`);
  const ff = (args) => spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { encoding: 'utf8' });
  ff(['-framerate', '10', '-i', join(mapp, 'film%03d.png'), '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', join(mapp, 'film.mp4')]);
  ff(['-loop', '1', '-t', '3', '-i', join(mapp, 'kort.png'), '-r', '10', '-c:v', 'libx264', '-crf', '23', '-pix_fmt', 'yuv420p', join(mapp, 'kort.mp4')]);
  const lista = join(mapp, 'lista.txt');
  spawnSync('sh', ['-c', `printf "file '%s'\\nfile '%s'\\n" ${join(mapp, 'film.mp4')} ${join(mapp, 'kort.mp4')} > ${lista}`]);
  ff(['-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', join(mapp, 'annons.mp4')]);
  return join(mapp, 'annons.mp4');
}

async function medVideo(rader, kor) {
  const mapp = mkdtempSync(join(tmpdir(), 'bildbrand-e2e-'));
  try {
    const fil = byggVideo(mapp, rader);
    assert.ok(existsSync(fil), 'videon byggdes inte');
    return await kor(fil);
  } finally { rmSync(mapp, { recursive: true, force: true }); }
}

const hoppaOrsak = () => {
  if (!FFMPEG) return 'ffmpeg saknas';
  if (!PYTHON) return 'python3 + Pillow saknas';
  if (!existsSync(FONT)) return `typsnittet ${FONT} saknas`;
  if (!OCR) return 'rapidocr-onnxruntime saknas (installera: pip install rapidocr-onnxruntime)';
  return null;
};

test('riktig ffmpeg + riktig OCR: slutkort med butiksnamn stoppas', async (t) => {
  const orsak = hoppaOrsak();
  if (orsak) return t.skip(`HOPPAD: ${orsak}`);
  const g = await medVideo([['BAVERBUTIKEN', 34], ['1 129 kr', 42]], (fil) =>
    granskaSlutkort(fil, { butiksord: ['carashell', 'carashell.se'] }));
  assert.equal(g.dom, DOMAR.medBrand, `OCR läste: ${g.textrader.join(' | ')}`);
  assert.ok(g.fynd.length >= 1);
  assert.ok(g.langd_s > 5.5 && g.langd_s < 6.5, `längden lästes ur ffmpeg -i: ${g.langd_s}`);
});

test('riktig ffmpeg + riktig OCR: slutkort utan butiksnamn laddas upp men namnges', async (t) => {
  const orsak = hoppaOrsak();
  if (orsak) return t.skip(`HOPPAD: ${orsak}`);
  const g = await medVideo([['BEGRAENSET ANTAL', 30], ['FRI FRAKT', 34]], (fil) =>
    granskaSlutkort(fil, { butiksord: ['carashell', 'carashell.se'] }));
  assert.equal(g.dom, DOMAR.utanBrand, `OCR läste: ${g.textrader.join(' | ')}`);
  assert.deepEqual(g.fynd, []);
});
