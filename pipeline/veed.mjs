// Veeds Subtitle API via fal.ai (modell: veed/subtitles) — bränner in stylade captions.
// Kräver env: FAL_KEY (skapas på fal.ai → Dashboard → Keys).
// Prissättning per minut video (ca $0.10/min) — faktureras via fal.ai.
import { writeFile } from 'node:fs/promises';

const QUEUE = 'https://queue.fal.run';
const MODEL = 'veed/subtitles';

function falKey() {
  const k = process.env.FAL_KEY;
  if (!k) throw new Error('Saknar FAL_KEY i miljön. Skapa nyckeln på fal.ai → Dashboard → Keys.');
  return k;
}

async function call(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Key ${falKey()}`, ...(opts.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`fal ${url} → HTTP ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  return body;
}

// Startar ett subtitle-jobb. srtContent (från HeyGen/proofread) hoppar över
// auto-transkribering; utan den transkriberar Veed själv på `language`.
export async function submitSubtitles({ videoUrl, srtContent, preset, language }) {
  const body = await call(`${QUEUE}/${MODEL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_url: videoUrl,
      ...(srtContent ? { srtContent } : {}),
      ...(preset ? { preset } : {}),
      ...(language ? { language } : {}),
    }),
  });
  const id = body?.request_id;
  if (!id) throw new Error(`Inget request_id i svaret: ${JSON.stringify(body)}`);
  return id;
}

export async function getSubtitlesStatus(requestId) {
  return call(`${QUEUE}/${MODEL}/requests/${requestId}/status`);
}

// Hämtar resultatet när status är COMPLETED — returnerar URL till färdig mp4.
export async function getSubtitlesResult(requestId) {
  const body = await call(`${QUEUE}/${MODEL}/requests/${requestId}`);
  const url = body?.video?.url ?? body?.video_url ?? body?.output?.video?.url;
  if (!url) throw new Error(`Ingen video-URL i resultatet: ${JSON.stringify(body).slice(0, 300)}`);
  return url;
}

export async function downloadUrl(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Kunde inte hämta ${url}: HTTP ${res.status}`);
  await writeFile(outPath, Buffer.from(await res.arrayBuffer()));
  return outPath;
}
