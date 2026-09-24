// AI-material via KIE efter Axels granskning 2026-09-24 ("Fixa allt det här nu"):
//   bild  = google/nano-banana-edit med en RIKTIG produktbild (SE:s CDN) som referens, 1:1
//   video = veo3_fast med samma referens (REFERENCE_2_VIDEO) → GIF 1:1, 6 s, 8 fps, 360 px, < 4 MB
// Reglerna i temu/ai-bild.mjs gäller: produkten hålls identisk, inga ansikten i närbild, allt märks
// som AI-illustration på sidan (beskrivning.mjs skriver raden när en alt-text innehåller "(AI").
//   node temu/batch11/ai-kor.mjs bilder [id …]   # skickar + väntar in alla bildjobb
//   node temu/batch11/ai-kor.mjs video  [id …]   # skickar + väntar in alla videojobb, gör GIF
//   node temu/batch11/ai-kor.mjs ark    [id …]   # kontaktark av AI-bilder + GIF-rutor
// Referensen slås upp i <scratch>/b11/media-karta.json (alt-text → CDN-URL i SE) — kör media-karta.mjs först.
import '../miljo.mjs';
import { AI } from './ai.mjs';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
const sharp = createRequire(import.meta.url)('sharp');
const SCRATCH = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad';
const UT = path.join(SCRATCH, 'ai'), GALLERI = path.join(SCRATCH, 'galleri');
const FF = path.join(SCRATCH, 'ff/node_modules/ffmpeg-static/ffmpeg');
const KARTA = JSON.parse(readFileSync(path.join(SCRATCH, 'b11/media-karta.json'), 'utf8'));
const K = process.env.KIE_API_KEY; if (!K) throw new Error('KIE_API_KEY saknas');
const h = { Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' };
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const [lage, ...bara] = process.argv.slice(2);
const GUARD_BILD = ' Keep the product exactly as in the reference image: same colours, same shape, same details, nothing added to the product. Photorealistic, natural light, no text, no logos, no watermarks, no close-up faces. Square 1:1 composition.';
const GUARD_VIDEO = ' Static camera. The product stays exactly as in the reference image; nothing is added to or removed from the product. Photorealistic, no text, no logos, no close-up faces.';

function ref(id, alt) {
  const p = KARTA[id]; if (!p) throw new Error(`${id}: saknas i media-kartan`);
  const m = p.media.find((x) => (x.alt || '').includes(alt)); if (!m?.url) throw new Error(`${id}: ingen bild med alt "${alt}"`);
  return m.url;
}
const kredit = async () => (await (await fetch('https://api.kie.ai/api/v1/chat/credit', { headers: h })).json()).data;

async function bilder() {
  const jobb = [];
  for (const [id, a] of Object.entries(AI)) {
    if (bara.length && !bara.includes(id)) continue;
    for (const b of a.bilder || []) {
      const ut = path.join(UT, id, `${b.namn}.jpg`); if (existsSync(ut)) { console.log(`= ${id}/${b.namn} finns`); continue; }
      const r = await (await fetch('https://api.kie.ai/api/v1/jobs/createTask', { method: 'POST', headers: h, body: JSON.stringify({ model: 'google/nano-banana-edit', input: { prompt: b.prompt + GUARD_BILD, image_urls: [ref(id, b.ref)], image_size: '1:1' } }) })).json();
      if (r.code !== 200) { console.log(`! ${id}/${b.namn}: ${JSON.stringify(r).slice(0, 160)}`); continue; }
      jobb.push({ id, namn: b.namn, task: r.data.taskId, ut }); console.log(`→ ${id}/${b.namn}`);
    }
  }
  for (let i = 0; i < 60 && jobb.some((j) => !j.klar); i++) {
    await sov(8000);
    for (const j of jobb.filter((x) => !x.klar)) {
      const d = await (await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${j.task}`, { headers: h })).json();
      if (d.data?.state === 'success') {
        const buf = Buffer.from(await (await fetch(JSON.parse(d.data.resultJson).resultUrls[0])).arrayBuffer());
        mkdirSync(path.dirname(j.ut), { recursive: true });
        await sharp(buf).resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toFile(j.ut);
        console.log(`✔ ${j.id}/${j.namn}`); j.klar = true;
      } else if (d.data?.state === 'fail') { console.log(`✖ ${j.id}/${j.namn}: ${JSON.stringify(d.data).slice(0, 200)}`); j.klar = true; }
    }
  }
  console.log('kvar:', jobb.filter((j) => !j.klar).map((j) => j.id).join(', ') || '—');
}

async function video() {
  const jobb = [];
  for (const [id, a] of Object.entries(AI)) {
    if (bara.length && !bara.includes(id)) continue;
    if (!a.video) continue;
    const mp4 = path.join(UT, id, 'video.mp4'); if (existsSync(mp4)) { console.log(`= ${id}/video finns`); await gif(id, mp4); continue; }
    const r = await (await fetch('https://api.kie.ai/api/v1/veo/generate', { method: 'POST', headers: h, body: JSON.stringify({ prompt: a.video.prompt + GUARD_VIDEO, imageUrls: [ref(id, a.video.ref)], model: 'veo3_fast', aspectRatio: '16:9', generationType: 'REFERENCE_2_VIDEO' }) })).json();
    if (r.code !== 200) { console.log(`! ${id}/video: ${JSON.stringify(r).slice(0, 200)}`); continue; }
    jobb.push({ id, task: r.data.taskId, mp4 }); console.log(`→ ${id}/video ${r.data.taskId}`);
    await sov(4000);   // KIE svarar 429 på tätare anrop
  }
  for (let i = 0; i < 100 && jobb.some((j) => !j.klar); i++) {
    await sov(15000);
    for (const j of jobb.filter((x) => !x.klar)) {
      const d = await (await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${j.task}`, { headers: h })).json();
      const st = d.data?.successFlag;
      if (st === 1) {
        const url = (d.data.response.resultUrls || d.data.response.result_urls)[0];
        mkdirSync(path.dirname(j.mp4), { recursive: true });
        writeFileSync(j.mp4, Buffer.from(await (await fetch(url)).arrayBuffer()));
        await gif(j.id, j.mp4); j.klar = true;
      } else if (st === 2 || st === 3) { console.log(`✖ ${j.id}/video: ${JSON.stringify(d.data).slice(0, 300)}`); j.klar = true; }
    }
  }
  console.log('kvar:', jobb.filter((j) => !j.klar).map((j) => j.id).join(', ') || '—');
}

async function gif(id, mp4) {
  mkdirSync(path.join(GALLERI, id), { recursive: true });
  const ut = path.join(GALLERI, id, 'video.gif');
  for (const [bredd, farger] of [[360, 96], [320, 64], [280, 48]]) {
    execFileSync(FF, ['-y', '-loglevel', 'error', '-t', '6', '-i', mp4, '-vf', `crop='min(iw,ih)':'min(iw,ih)',fps=8,scale=${bredd}:${bredd}:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${farger}[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4`, '-loop', '0', ut]);
    if (statSync(ut).size < 4e6) break;
  }
  execFileSync(FF, ['-y', '-loglevel', 'error', '-i', ut, '-vf', "select='not(mod(n\\,8))',scale=200:-1,tile=6x1", '-frames:v', '1', path.join(UT, `${id}-gifframes.jpg`)]);
  console.log(`✔ ${id}/video.gif ${(statSync(ut).size / 1e6).toFixed(2)} MB`);
}

async function ark() {
  const T = 300, COLS = 6; const rutor = [];
  for (const [id, a] of Object.entries(AI)) {
    if (bara.length && !bara.includes(id)) continue;
    for (const b of a.bilder || []) { const f = path.join(UT, id, `${b.namn}.jpg`); if (!existsSync(f)) continue;
      const th = await sharp(f).resize(T, T, { fit: 'inside' }).toBuffer();
      rutor.push(await sharp(Buffer.from(`<svg width="${T}" height="${T}"><rect width="${T}" height="${T}" fill="#eee"/><text x="4" y="18" font-size="15" font-family="DejaVu Sans" font-weight="bold" fill="#c00">${id.slice(0, 13)} ${b.namn}</text></svg>`)).composite([{ input: th, gravity: 'centre' }]).png().toBuffer()); }
  }
  if (!rutor.length) return console.log('inga AI-bilder');
  const rows = Math.ceil(rutor.length / COLS);
  await sharp({ create: { width: COLS * (T + 4), height: rows * (T + 4), channels: 3, background: '#888' } }).composite(rutor.map((r, i) => ({ input: r, left: (i % COLS) * (T + 4) + 2, top: Math.floor(i / COLS) * (T + 4) + 2 }))).jpeg({ quality: 85 }).toFile(path.join(UT, 'ALLA-ai.jpg'));
  console.log(rutor.length, 'AI-bilder → ALLA-ai.jpg');
}
console.log('KIE-kredit före:', await kredit());
if (lage === 'bilder') await bilder(); else if (lage === 'video') await video(); else if (lage === 'ark') await ark(); else console.error('Användning: node temu/batch11/ai-kor.mjs <bilder|video|ark> [id …]');
console.log('KIE-kredit efter:', await kredit());
