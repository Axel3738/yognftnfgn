// Bildverktyg för kalendrarnas gallerier (2026-09-29, Axel: "världens keffaste produktsida" — golfkalendern hade
// två bilder och ingen GIF, och det gällde alla nio kalendrar). Allt arbetar i <SCRATCH>/advent/:
//   kallor/<id>/        råa källbilder + manifest.json [{ fil, url, kalla }]  (url = publik adress, KIE behöver den)
//   galleri/<id>/       färdiga bilder som ska upp i butiken + video.gif
//
//   node temu/kalendrar/bild.mjs se-kallor [id …]                      live SE-bilderna → kallor/<id>/se-NN.jpg
//   node temu/kalendrar/bild.mjs hamta <id> <kalla> <url …>            ladda ner → kallor/<id>/<kalla>-NN.jpg
//   node temu/kalendrar/bild.mjs ark <id> [kallor|galleri]              kontaktark → <SCRATCH>/advent/<dir>-<id>-ark.jpg
//   node temu/kalendrar/bild.mjs crop <id> <källfil> <utnamn> <x> <y> <w> <h> [--pad]    bråkdelar 0–1
//   node temu/kalendrar/bild.mjs kopiera <id> <källfil> <utnamn> [--pad]
//   node temu/kalendrar/bild.mjs kie-rensa <id> <källfil> <utnamn> "<prompt>" [--pad]   KIE tar bort överlägg
//   node temu/kalendrar/bild.mjs kie-bild <id> <källfil> <utnamn> "<prompt>"            AI-miljöbild 1:1 (märks AI)
//   node temu/kalendrar/bild.mjs video <id> <källfil> "<prompt>" [--start s]            KIE veo → video.gif 1:1
//   node temu/kalendrar/bild.mjs gif <id> [--start s]                                   gör om GIF:en ur mp4:an
// <källfil> är ett filnamn i kallor/<id>/ (manifestet ger URL:en till KIE) eller en https-URL.
import '../miljo.mjs';
import { Butik } from '../api.mjs';
import { FAKTA } from './fakta.mjs';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const sharp = createRequire(import.meta.url)('sharp');
const SCRATCH = '/tmp/claude-0/-home-user-yognftnfgn/4034ad3c-cd7c-513c-944c-3efffa125d52/scratchpad';
const BAS = path.join(SCRATCH, 'advent');
const FF = path.join(SCRATCH, 'ff/node_modules/ffmpeg-static/ffmpeg');
const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const argv = process.argv.slice(2);
const flagga = (n) => argv.includes(n);
const värde = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
const pos = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && ['--start'].includes(argv[i - 1])));
const [läge, id] = pos;
const KD = (i) => path.join(BAS, 'kallor', i), GD = (i) => path.join(BAS, 'galleri', i);
const manifest = (i) => { const f = path.join(KD(i), 'manifest.json'); return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : []; };
const sparaManifest = (i, m) => { mkdirSync(KD(i), { recursive: true }); writeFileSync(path.join(KD(i), 'manifest.json'), JSON.stringify(m, null, 1)); };
const källUrl = (i, fil) => { if (/^https?:\/\//.test(fil)) return fil; const m = manifest(i).find((x) => x.fil === fil); if (!m) throw new Error(`${i}/${fil} saknas i manifestet`); return m.url; };
const källVäg = (i, fil) => { const p = path.join(KD(i), fil); if (!existsSync(p)) throw new Error(`finns inte: ${p}`); return p; };
const ut = (i, namn) => { mkdirSync(GD(i), { recursive: true }); return path.join(GD(i), namn.endsWith('.jpg') ? namn : `${namn}.jpg`); };
const kvadrat = async (buf) => { const m = await sharp(buf).metadata(); const s = Math.max(m.width, m.height);
  return sharp(buf).extend({ top: Math.floor((s - m.height) / 2), bottom: Math.ceil((s - m.height) / 2), left: Math.floor((s - m.width) / 2), right: Math.ceil((s - m.width) / 2), background: '#ffffff' }).toBuffer(); };
const sparaJpg = async (buf, fil, pad) => { let b = await sharp(buf).rotate().flatten({ background: '#ffffff' }).toBuffer(); if (pad) b = await kvadrat(b);
  await sharp(b).resize(2000, 2000, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toFile(fil); const m = await sharp(fil).metadata(); console.log(`✔ ${fil} ${m.width}×${m.height}`); };

// ── KIE ─────────────────────────────────────────────────────────────────────────────────────
const K = process.env.KIE_API_KEY;
const H = () => { if (!K) throw new Error('KIE_API_KEY saknas'); return { Authorization: `Bearer ${K}`, 'Content-Type': 'application/json' }; };
const GUARD_BILD = ' Keep the product exactly as in the reference image: same box print, same colours, same shape, same contents, nothing added to the product. Do not invent any packaging, labels, logos or text that are not in the reference. Photorealistic, natural light, no watermarks, no close-up faces. Square 1:1 composition.';
const GUARD_VIDEO = ' Static camera. The product is centered and fully in frame with a margin on all sides. The product stays exactly as in the reference image; its print and contents are not changed, nothing is added to or removed from the product. No new text, no logos, no captions, no close-up faces. Photorealistic. Silent scene.';
async function postKie(url, body) {   // KIE svarar 429 vid täta anrop — backa och försök igen
  for (let f = 0; f < 6; f++) {
    const r = await (await fetch(url, { method: 'POST', headers: H(), body: JSON.stringify(body) })).json();
    if (r.code === 200) return r.data.taskId;
    if (r.code === 429 || /frequen|rate/i.test(r.msg || '')) { await sov(5000 * (f + 1)); continue; }
    throw new Error(`KIE: ${JSON.stringify(r).slice(0, 200)}`);
  }
  throw new Error('KIE: 429 sex gånger');
}
async function kieBild(prompt, bildUrl, storlek) {
  const task = await postKie('https://api.kie.ai/api/v1/jobs/createTask', { model: 'google/nano-banana-edit', input: { prompt, image_urls: [bildUrl], image_size: storlek } });
  console.log(`→ KIE bild ${task}`);
  for (let i = 0; i < 60; i++) {
    await sov(7000);
    const d = await (await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${task}`, { headers: H() })).json();
    if (d.data?.state === 'success') return Buffer.from(await (await fetch(JSON.parse(d.data.resultJson).resultUrls[0])).arrayBuffer());
    if (d.data?.state === 'fail') throw new Error(`KIE bild misslyckades: ${JSON.stringify(d.data).slice(0, 200)}`);
  }
  throw new Error('KIE bild: timeout');
}
async function kieVideo(prompt, bildUrl) {
  for (let försök = 1; försök <= 4; försök++) {
    const task = await postKie('https://api.kie.ai/api/v1/veo/generate', { prompt, imageUrls: [bildUrl], model: 'veo3_fast', aspectRatio: '16:9', generationType: 'REFERENCE_2_VIDEO', enableFallback: true });
    console.log(`→ KIE video ${task} (försök ${försök})`);
    for (let i = 0; i < 80; i++) {
      await sov(15000);
      const d = await (await fetch(`https://api.kie.ai/api/v1/veo/record-info?taskId=${task}`, { headers: H() })).json();
      const st = d.data?.successFlag;
      if (st === 1) return Buffer.from(await (await fetch((d.data.response.resultUrls || d.data.response.result_urls)[0])).arrayBuffer());
      if (st === 2 || st === 3) { console.log(`✖ ${d.data.errorCode} ${d.data.errorMessage}`); break; }   // 500 "Internal Error" → nytt försök
    }
  }
  throw new Error('KIE video: fyra försök utan resultat');
}
function gif(i, start = 0) {
  const mp4 = path.join(KD(i), 'video.mp4'); if (!existsSync(mp4)) throw new Error(`ingen video: ${mp4}`);
  mkdirSync(GD(i), { recursive: true });
  const g = path.join(GD(i), 'video.gif');
  for (const [bredd, färger] of [[360, 96], [320, 64], [280, 48]]) {
    execFileSync(FF, ['-y', '-loglevel', 'error', '-ss', String(start), '-t', '6', '-i', mp4, '-vf', `crop='min(iw,ih)':'min(iw,ih)',fps=8,scale=${bredd}:${bredd}:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${färger}[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4`, '-loop', '0', g]);
    if (statSync(g).size < 4e6) break;
  }
  const rutor = path.join(BAS, `gifrutor-${i}.jpg`);
  execFileSync(FF, ['-y', '-loglevel', 'error', '-i', g, '-vf', "select='not(mod(n\\,8))',scale=240:-1,tile=6x1", '-frames:v', '1', rutor]);
  console.log(`✔ ${g} ${(statSync(g).size / 1e6).toFixed(2)} MB · bildrutor: ${rutor}`);
}

// ── lägen ───────────────────────────────────────────────────────────────────────────────────
if (läge === 'se-kallor') {
  const b = new Butik('se');
  for (const [i, f] of Object.entries(FAKTA)) {
    if (pos.length > 1 && !pos.slice(1).includes(i)) continue;
    const d = await b.fraga(`query($q:String!){products(first:1,query:$q){nodes{media(first:30){nodes{alt ... on MediaImage{image{url}}}}}}}`, { q: `sku:${f.sku}` });
    const m = manifest(i).filter((x) => x.kalla !== 'se');
    for (const [n, x] of (d.products.nodes[0]?.media.nodes || []).entries()) {
      if (!x.image?.url) continue;
      const fil = `se-${String(n + 1).padStart(2, '0')}.jpg`;
      mkdirSync(KD(i), { recursive: true });
      await sharp(Buffer.from(await (await fetch(x.image.url)).arrayBuffer())).flatten({ background: '#ffffff' }).jpeg({ quality: 92 }).toFile(path.join(KD(i), fil));
      m.push({ fil, url: x.image.url, kalla: 'se', alt: x.alt });
    }
    sparaManifest(i, m); console.log(`✔ ${i}: ${m.filter((x) => x.kalla === 'se').length} SE-bilder`);
  }
} else if (läge === 'hamta') {
  const [, , kalla, ...urls] = pos; const m = manifest(id);
  let n = m.filter((x) => x.kalla === kalla).length;
  for (const u of urls) {
    if (m.some((x) => x.url === u)) { console.log(`= finns redan: ${u}`); continue; }
    try {
      const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128' } });
      if (!r.ok) { console.log(`! ${r.status} ${u}`); continue; }
      const fil = `${kalla}-${String(++n).padStart(2, '0')}.jpg`;
      mkdirSync(KD(id), { recursive: true });
      await sharp(Buffer.from(await r.arrayBuffer())).flatten({ background: '#ffffff' }).jpeg({ quality: 92 }).toFile(path.join(KD(id), fil));
      m.push({ fil, url: u, kalla }); console.log(`✔ ${fil} ← ${u}`);
    } catch (e) { console.log(`! ${u}: ${e.message}`); }
  }
  sparaManifest(id, m);
} else if (läge === 'ark') {
  const dir = pos[2] === 'galleri' ? GD(id) : KD(id);
  const filer = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  const T = 360, C = 4, L = 26, rutor = [];
  for (const [n, f] of filer.entries()) {
    const buf = await sharp(path.join(dir, f)).resize(T, T, { fit: 'contain', background: '#ffffff' }).toBuffer();
    const m = await sharp(path.join(dir, f)).metadata();
    const lab = Buffer.from(`<svg width="${T}" height="${L}"><rect width="${T}" height="${L}" fill="#000"/><text x="6" y="19" font-size="15" font-family="DejaVu Sans" fill="#ff0">${f} ${m.width}×${m.height}</text></svg>`);
    rutor.push({ input: lab, left: (n % C) * T, top: Math.floor(n / C) * (T + L) }, { input: buf, left: (n % C) * T, top: Math.floor(n / C) * (T + L) + L });
  }
  const fil = path.join(BAS, `${pos[2] === 'galleri' ? 'galleri' : 'kallor'}-${id}-ark.jpg`);
  await sharp({ create: { width: C * T, height: Math.max(1, Math.ceil(filer.length / C)) * (T + L), channels: 3, background: '#888888' } }).composite(rutor).jpeg({ quality: 82 }).toFile(fil);
  console.log(`✔ ${fil} (${filer.length} bilder)`);
} else if (läge === 'crop') {
  const [, , fil, namn, x, y, w, h] = pos; const src = källVäg(id, fil); const m = await sharp(src).metadata();
  const r = { left: Math.round(+x * m.width), top: Math.round(+y * m.height), width: Math.round(+w * m.width), height: Math.round(+h * m.height) };
  r.width = Math.min(r.width, m.width - r.left); r.height = Math.min(r.height, m.height - r.top);
  await sparaJpg(await sharp(src).extract(r).toBuffer(), ut(id, namn), flagga('--pad'));
} else if (läge === 'kopiera') {
  const [, , fil, namn] = pos; await sparaJpg(readFileSync(källVäg(id, fil)), ut(id, namn), flagga('--pad'));
} else if (läge === 'kie-rensa') {
  const [, , fil, namn, prompt] = pos;
  const buf = await kieBild(`${prompt} Keep the product itself and its own printed design exactly as it is — same colours, same shapes, same contents. Do not add anything. Output the same photo with only the overlays removed.`, källUrl(id, fil), 'auto');
  await sparaJpg(buf, ut(id, namn), flagga('--pad'));
} else if (läge === 'kie-bild') {
  const [, , fil, namn, prompt] = pos;
  await sparaJpg(await kieBild(prompt + GUARD_BILD, källUrl(id, fil), '1:1'), ut(id, namn), false);
} else if (läge === 'video') {
  const [, , fil, prompt] = pos;
  const buf = await kieVideo(prompt + GUARD_VIDEO, källUrl(id, fil));
  mkdirSync(KD(id), { recursive: true }); writeFileSync(path.join(KD(id), 'video.mp4'), buf);
  gif(id, +(värde('--start') || 0));
} else if (läge === 'gif') {
  gif(id, +(värde('--start') || 0));
} else {
  console.error('Användning: se kommentaren överst i temu/kalendrar/bild.mjs'); process.exit(1);
}
