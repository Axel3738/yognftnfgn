// Tunn wrapper runt HeyGens Video Translate-API.
// Kräver env: HEYGEN_API_KEY (skapas på app.heygen.com → Settings → Subscriptions & API).
// OBS: proofread-redigeringen (lokaliseringssteget) görs i HeyGens UI — API:t täcker
// submit/status/nedladdning. Se docs/video-localization.md för hela processen.
import { readFile, writeFile } from 'node:fs/promises';

const API = 'https://api.heygen.com';
const UPLOAD = 'https://upload.heygen.com';

function apiKey() {
  const k = process.env.HEYGEN_API_KEY || process.env.KEY;
  if (!k) throw new Error('Saknar HEYGEN_API_KEY i miljön. Skapa nyckeln på app.heygen.com → Settings → API.');
  if (!process.env.HEYGEN_API_KEY) {
    console.warn('⚠️  Hittade nyckeln i env-variabeln KEY — döp om den till HEYGEN_API_KEY i environment-inställningarna.');
  }
  return k;
}

async function call(base, path, opts = {}) {
  const res = await fetch(`${base}${path}`, {
    ...opts,
    headers: { 'X-Api-Key': apiKey(), ...(opts.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`HeyGen ${path} → HTTP ${res.status}: ${JSON.stringify(body?.error ?? body)}`);
  }
  return body;
}

// Verifierar att nyckeln funkar — returnerar kontots kvar-kvot.
export async function checkQuota() {
  const body = await call(API, '/v1/user/remaining_quota');
  return body?.data ?? body;
}

// Målspråk som Video Translate stödjer (språknamn i klartext, t.ex. "Norwegian").
export async function listTargetLanguages() {
  const body = await call(API, '/v2/video_translate/target_languages');
  return body?.data?.languages ?? [];
}

// Laddar upp en lokal mp4 som asset och returnerar en URL som kan skickas till översättning.
export async function uploadAsset(filePath) {
  const buf = await readFile(filePath);
  const body = await call(UPLOAD, '/v1/asset', {
    method: 'POST',
    headers: { 'Content-Type': 'video/mp4' },
    body: buf,
  });
  const url = body?.data?.url;
  if (!url) throw new Error(`Ingen asset-URL i svaret: ${JSON.stringify(body)}`);
  return url;
}

// Startar en översättning. outputLanguage = klartextnamn från listTargetLanguages().
export async function submitTranslate({ videoUrl, outputLanguage, title }) {
  const body = await call(API, '/v2/video_translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ video_url: videoUrl, output_language: outputLanguage, title }),
  });
  const id = body?.data?.video_translate_id;
  if (!id) throw new Error(`Inget video_translate_id i svaret: ${JSON.stringify(body)}`);
  return id;
}

// status: 'pending' | 'running' | 'success' | 'failed' — vid success finns data.url.
export async function getTranslateStatus(id) {
  const body = await call(API, `/v2/video_translate/${id}`);
  return body?.data ?? {};
}

export async function downloadResult(id, outPath) {
  const data = await getTranslateStatus(id);
  if (data.status !== 'success') {
    throw new Error(`Jobbet är inte klart (status: ${data.status ?? 'okänd'}${data.message ? ` — ${data.message}` : ''}).`);
  }
  const res = await fetch(data.url);
  if (!res.ok) throw new Error(`Kunde inte hämta videon: HTTP ${res.status}`);
  await writeFile(outPath, Buffer.from(await res.arrayBuffer()));
  return outPath;
}
