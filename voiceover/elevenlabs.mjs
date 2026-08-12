// Tunn wrapper runt ElevenLabs Text-to-Speech. Returnerar en ljud-Buffer (mp3).
// Kräver env: ELEVENLABS_API_KEY  (alias: XI_API_KEY).
//
// Default: rösten "Svensk Martin" + modellen eleven_v3 (mest uttrycksfull, 70+ språk,
// stödjer audio-tags som [glad], [viskar]). Röst-ID slås upp på namn via /v1/voices
// så inget ID behöver hårdkodas — override med env ELEVEN_VOICE_ID vid behov.

const API_BASE = 'https://api.elevenlabs.io/v1';

export const DEFAULTS = {
  voiceName: 'Martin - Warm, Confident and Relatable',
  modelId: 'eleven_v3',
  outputFormat: 'mp3_44100_128',
  // eleven_v3 tolkar stability i steg: 0.0 (Creative), 0.5 (Natural), 1.0 (Robust).
  voiceSettings: { stability: 0.5, similarity_boost: 0.75, use_speaker_boost: true },
};

// Teckengräns per anrop skiljer sig mellan modellerna.
const MODEL_LIMITS = {
  eleven_v3: 3000,
  eleven_multilingual_v2: 10000,
  eleven_turbo_v2_5: 40000,
  eleven_flash_v2_5: 40000,
};
export const MAX_CHARS = MODEL_LIMITS.eleven_v3; // default
export const limitFor = (modelId) => MODEL_LIMITS[modelId] ?? MAX_CHARS;

function getApiKey() {
  const key = process.env.ELEVENLABS_API_KEY || process.env.XI_API_KEY;
  if (!key) {
    throw new Error(
      'Saknar ELEVENLABS_API_KEY (eller XI_API_KEY) i miljön. Kör med --dry för att förhandsgranska utan API.'
    );
  }
  return key;
}

async function api(path, { method = 'GET', body, accept = 'application/json' } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'xi-api-key': getApiKey(),
      accept,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch { detail = await res.text(); }
    throw new Error(`ElevenLabs ${res.status} ${res.statusText}: ${detail}`);
  }
  return res;
}

// Hämtar alla röster på kontot (namn + id).
export async function listVoices() {
  const res = await api('/voices');
  const { voices } = await res.json();
  return voices.map((v) => ({ id: v.voice_id, name: v.name, labels: v.labels }));
}

let _voiceIdCache = null;

// Slår upp röst-ID från namn (skiftlägesokänsligt). Cache:ar för att slippa flera anrop.
// ELEVEN_VOICE_ID i miljön vinner om satt.
export async function resolveVoiceId(voiceName = DEFAULTS.voiceName) {
  if (process.env.ELEVEN_VOICE_ID) return process.env.ELEVEN_VOICE_ID;
  if (_voiceIdCache) return _voiceIdCache;
  const voices = await listVoices();
  const match = voices.find((v) => v.name.toLowerCase() === voiceName.toLowerCase());
  if (!match) {
    const names = voices.map((v) => v.name).join(', ') || '(inga)';
    throw new Error(
      `Hittade ingen röst som heter "${voiceName}" på kontot. Tillgängliga: ${names}. ` +
      `Sätt ELEVEN_VOICE_ID manuellt eller lägg till rösten i ditt ElevenLabs-bibliotek.`
    );
  }
  _voiceIdCache = match.id;
  return match.id;
}

// Genererar voiceover och returnerar en mp3-Buffer.
export async function generateVoiceover(text, opts = {}) {
  const {
    voiceName = DEFAULTS.voiceName,
    modelId = DEFAULTS.modelId,
    outputFormat = DEFAULTS.outputFormat,
    voiceSettings = DEFAULTS.voiceSettings,
  } = opts;

  if (!text || !text.trim()) throw new Error('Tom text — inget att läsa upp.');
  const limit = limitFor(modelId);
  if (text.length > limit) {
    throw new Error(`Texten är ${text.length} tecken; ${modelId} tar max ${limit}. Dela upp den.`);
  }

  const voiceId = opts.voiceId || (await resolveVoiceId(voiceName));
  const res = await api(`/text-to-speech/${voiceId}?output_format=${encodeURIComponent(outputFormat)}`, {
    method: 'POST',
    accept: 'audio/mpeg',
    body: { text, model_id: modelId, voice_settings: voiceSettings },
  });
  return Buffer.from(await res.arrayBuffer());
}
