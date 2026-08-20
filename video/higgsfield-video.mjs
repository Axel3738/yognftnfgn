// Tunn wrapper runt Higgsfields video-generering. Returnerar en video-URL per shot.
// Kräver env: HF_API_KEY + HF_SECRET (samma nycklar som static-pipelinen).
//
// ⚠️ VIKTIGT: Higgsfields exakta video-endpoint + parameternamn måste bekräftas mot
// din dashboard (cloud.higgsfield.ai → API). Två vanliga lägen stöds här:
//   - text2video: generera rörelse direkt ur en prompt
//   - image2video: animera en start-frame (t.ex. en Soul-still från static-pipelinen)
// Endpoint och fält läses från shot/config så du kan låsa dem på ett ställe utan att
// röra logiken. Kör alltid `--dry` först — då anropas ingenting av det här.
let _client = null;

async function getClient() {
  if (_client) return _client;
  const { HiggsfieldClient } = await import('@higgsfield/client');
  const apiKey = process.env.HF_API_KEY;
  const apiSecret = process.env.HF_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error('Saknar HF_API_KEY / HF_SECRET i miljön. Kör med --dry för att bygga storyboard utan generering.');
  }
  _client = new HiggsfieldClient({ apiKey, apiSecret });
  return _client;
}

// Default-endpoints. Bekräfta/ändra mot Higgsfield-docs innan live-körning.
const ENDPOINT = {
  text2video: process.env.HF_T2V_ENDPOINT || '/v1/text2video/dop',
  image2video: process.env.HF_I2V_ENDPOINT || '/v1/image2video/dop',
};

// shot: { prompt, motion?, startFrameUrl?, durationSec?, seed? }
// Om startFrameUrl finns → image2video, annars text2video.
export async function generateClip(shot, { durationSec } = {}) {
  const client = await getClient();
  const isI2V = Boolean(shot.startFrameUrl);
  const endpoint = isI2V ? ENDPOINT.image2video : ENDPOINT.text2video;

  const params = {
    prompt: [shot.prompt, shot.motion].filter(Boolean).join('. '),
    duration: shot.durationSec || durationSec || 5,
    aspect_ratio: '9:16',
  };
  if (isI2V) params.image_url = shot.startFrameUrl;
  if (shot.seed != null) params.seed = shot.seed;

  const jobSet = await client.generate(endpoint, params, { withPolling: true });
  if (!jobSet.isCompleted) throw new Error(`Higgsfield-video blev inte klar (${shot.id || '?'}).`);
  const url =
    jobSet.jobs?.[0]?.results?.raw?.url ||
    jobSet.jobs?.[0]?.results?.video?.url ||
    jobSet.jobs?.[0]?.results?.url;
  if (!url) throw new Error(`Ingen video-URL i svaret (${shot.id || '?'}).`);
  return url;
}
