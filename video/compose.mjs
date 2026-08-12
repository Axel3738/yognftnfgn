// Klistrar ihop de genererade shot-klippen, bränner in captions (.ass) och
// lägger ett endcard sist — allt via ffmpeg. Ingen text ber vi modellen rendera.
//
// Kräver ffmpeg + ffprobe i PATH. Kollar det och ger ett tydligt fel om det saknas.
import { writeFile, mkdir } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { dirname } from 'node:path';
import sharp from 'sharp';
import { VIDEO } from './brand.mjs';
import { buildAss, endcardSvg } from './storyboard.mjs';

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exit ${code}\n${err.slice(-800)}`))));
  });
}

async function hasFfmpeg() {
  try { await run('ffmpeg', ['-version']); return true; } catch { return false; }
}

// clips: [{ id, file }] i ordning · concept: hela konceptet · out: mp4-väg
export async function compose({ clips, concept, out }) {
  if (!(await hasFfmpeg())) {
    throw new Error('ffmpeg saknas i PATH. Installera ffmpeg för att stitcha video, eller kör --dry.');
  }
  const dir = dirname(out);
  await mkdir(dir, { recursive: true });

  // 1) endcard-still → 2.5s klipp
  const ecPng = `${out}.endcard.png`;
  await sharp(endcardSvg(concept)).png().toFile(ecPng);
  const ecClip = `${out}.endcard.mp4`;
  await run('ffmpeg', ['-y', '-loop', '1', '-t', '2.5', '-i', ecPng,
    '-vf', `scale=${VIDEO.w}:${VIDEO.h},format=yuv420p`, '-r', String(VIDEO.fps), ecClip]);

  // 2) concat-lista (shots + endcard), normaliserade till samma storlek/fps
  const norm = [];
  for (let i = 0; i < clips.length; i++) {
    const nf = `${out}.norm${i}.mp4`;
    await run('ffmpeg', ['-y', '-i', clips[i].file,
      '-vf', `scale=${VIDEO.w}:${VIDEO.h}:force_original_aspect_ratio=increase,crop=${VIDEO.w}:${VIDEO.h},format=yuv420p`,
      '-r', String(VIDEO.fps), '-an', nf]);
    norm.push(nf);
  }
  norm.push(ecClip);

  const listFile = `${out}.concat.txt`;
  await writeFile(listFile, norm.map((f) => `file '${f}'`).join('\n'));
  const stitched = `${out}.stitched.mp4`;
  await run('ffmpeg', ['-y', '-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', stitched]);

  // 3) bränn captions (.ass) på den ihopklistrade filmen
  const assFile = `${out}.captions.ass`;
  await writeFile(assFile, buildAss(concept));
  await run('ffmpeg', ['-y', '-i', stitched, '-vf', `ass=${assFile}`,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);

  return out;
}
