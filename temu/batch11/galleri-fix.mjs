// Förbereder galleribilderna enligt galleri.mjs: beskär (sharp), översätter text (KIE nano-banana-edit,
// källa = leverantörens CDN-URL ur manifest.json) och gör GIF av video (ffmpeg-static).
//   node temu/batch11/galleri-fix.mjs crop [id …]   # beskärningar + kopior + gif → <scratch>/galleri/<id>/
//   node temu/batch11/galleri-fix.mjs kie  [id …]   # KIE-översättningar (hoppar över redan gjorda)
//   node temu/batch11/galleri-fix.mjs ark  [id …]   # kontaktark per produkt av det färdiga galleriet
import '../miljo.mjs';
import { GALLERI } from './galleri.mjs';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const sharp = createRequire(import.meta.url)('sharp');
const SCRATCH = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad';
const SKORD = path.join(SCRATCH, 'skord'), UT = path.join(SCRATCH, 'galleri');
const FFMPEG = path.join(SCRATCH, 'ff/node_modules/ffmpeg-static/ffmpeg');
const BILDSKORD = '/home/user/yognftnfgn/temu/bildskord';
const [lage, ...bara] = process.argv.slice(2);
const K = process.env.KIE_API_KEY;
export const utfil = (id, b) => path.join(UT, id, `${b.ny || b.fil}${b.kie ? '-sv' : ''}.jpg`);

async function crop() {
  for (const [id, g] of Object.entries(GALLERI)) {
    if (bara.length && !bara.includes(id)) continue;
    mkdirSync(path.join(UT, id), { recursive: true });
    for (const b of g.bilder) {
      if (b.kie) continue;                                  // görs av kie-läget
      const src = path.join(SKORD, id, `${b.fil}.jpg`);
      let img = sharp(src); const m = await img.metadata();
      if (b.crop) img = img.extract({ left: Math.round(b.crop[0] * m.width), top: Math.round(b.crop[1] * m.height), width: Math.round(b.crop[2] * m.width), height: Math.round(b.crop[3] * m.height) });
      await img.resize(2000, 2000, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toFile(utfil(id, b));
    }
    if (g.gif) {
      const src = path.join(SCRATCH, 'gif', `${id}.mp4`); const ut = path.join(UT, id, 'video.gif');
      if (existsSync(src) && !existsSync(ut)) {
        execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-t', '8', '-i', src, '-vf', 'fps=8,scale=400:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3', '-loop', '0', ut]);
        console.log(`  gif ${id}: ${(readFileSync(ut).length / 1e6).toFixed(2)} MB`);
      }
    }
    console.log(`✔ ${id}: ${g.bilder.filter((b) => !b.kie).length} bilder${g.gif ? ' + gif' : ''}`);
  }
}

async function kie() {
  if (!K) throw new Error('KIE_API_KEY saknas');
  for (const [id, g] of Object.entries(GALLERI)) {
    if (bara.length && !bara.includes(id)) continue;
    if (!g.bilder.some((x) => x.kie)) continue;
    const manFil = path.join(BILDSKORD, id, 'manifest.json'); if (!existsSync(manFil)) { console.log(`! ${id}: ingen skörd (manifest saknas)`); continue; }
    const man = JSON.parse(readFileSync(manFil, 'utf8'));
    for (const b of g.bilder.filter((x) => x.kie)) {
      const ut = utfil(id, b); if (existsSync(ut)) { console.log(`= ${id}/${b.fil} finns`); continue; }
      const url = man.filer.find((f) => f.fil === `${b.fil}.avif`)?.url; if (!url) { console.log(`! ${id}/${b.fil}: ingen URL i manifestet`); continue; }
      const prompt = `${b.kie} Do not add, remove or change any other text, numbers, objects or colours. Output the same image with only the text replaced.`;
      const skapad = await (await fetch('https://api.kie.ai/api/v1/jobs/createTask', { method: 'POST', headers: { Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'google/nano-banana-edit', input: { prompt, image_urls: [url], image_size: 'auto' } }) })).json();
      if (skapad.code !== 200) { console.log(`! ${id}/${b.fil}: ${JSON.stringify(skapad).slice(0, 160)}`); continue; }
      let klar = false;
      for (let i = 0; i < 40 && !klar; i++) {
        await new Promise((r) => setTimeout(r, 6000));
        const d = await (await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${skapad.data.taskId}`, { headers: { Authorization: `Bearer ${K}` } })).json();
        if (d.data?.state === 'success') {
          const res = JSON.parse(d.data.resultJson).resultUrls[0];
          const buf = Buffer.from(await (await fetch(res)).arrayBuffer());
          mkdirSync(path.join(UT, id), { recursive: true });
          await sharp(buf).resize(2000, 2000, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toFile(ut);
          console.log(`✔ ${id}/${b.fil} → ${path.basename(ut)}`); klar = true;
        } else if (d.data?.state === 'fail') { console.log(`! ${id}/${b.fil}: FAIL ${JSON.stringify(d.data).slice(0, 160)}`); klar = true; }
      }
      if (!klar) console.log(`! ${id}/${b.fil}: timeout`);
    }
  }
}

async function ark() {
  const T = 300, COLS = 6;
  for (const [id, g] of Object.entries(GALLERI)) {
    if (bara.length && !bara.includes(id)) continue;
    const rutor = [];
    const filer = g.bilder.map((b) => [b, utfil(id, b)]).filter(([, f]) => existsSync(f));
    if (g.gif && existsSync(path.join(UT, id, 'video.gif'))) filer.push([{ fil: 'gif', alt: g.gif.alt }, path.join(UT, id, 'video.gif')]);
    for (const [b, f] of filer) {
      const th = await sharp(f, { pages: 1 }).resize(T, T, { fit: 'inside' }).toBuffer(); const tm = await sharp(th).metadata();
      const label = Buffer.from(`<svg width="${T}" height="${T}"><rect width="${T}" height="${T}" fill="#eee"/><text x="6" y="20" font-size="18" font-family="DejaVu Sans" font-weight="bold" fill="#c00">${b.ny || b.fil}${b.kie ? ' KIE' : ''}${b.crop ? ' crop' : ''}</text></svg>`);
      rutor.push(await sharp(label).composite([{ input: th, left: Math.round((T - tm.width) / 2), top: Math.round((T - tm.height) / 2) }]).png().toBuffer());
    }
    if (!rutor.length) continue;
    const rows = Math.ceil(rutor.length / COLS);
    await sharp({ create: { width: COLS * (T + 6), height: rows * (T + 6), channels: 3, background: '#888' } })
      .composite(rutor.map((r, i) => ({ input: r, left: (i % COLS) * (T + 6) + 3, top: Math.floor(i / COLS) * (T + 6) + 3 }))).jpeg({ quality: 85 }).toFile(path.join(UT, `${id}-galleri.jpg`));
    console.log(`ark ${id}: ${rutor.length}`);
  }
}
if (lage === 'crop') await crop(); else if (lage === 'kie') await kie(); else if (lage === 'ark') await ark();
else console.error('Användning: node temu/batch11/galleri-fix.mjs <crop|kie|ark> [id …]');
