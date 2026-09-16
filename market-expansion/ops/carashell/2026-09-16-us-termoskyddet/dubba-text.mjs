// Uttalsformer för rösten (bara i VO-manuset) och tillbaka till skriftformen för captions.
// Scribe-mätt 2026-09-16 med ElevenLabs "Chris - Charming, Down-to-Earth" (eleven_v3):
//   "CaraShell" → hördes "Caroshell"; "Cara Shell" (två ord) → "Carashell" 8 av 8.
//   "Per" (namnet) → "pur"/"Para"; "Pair" → "Pair" 3 av 3 = det svenska uttalet.
export const voText = (t) => String(t).replace(/CaraShell/g, 'Cara Shell').replace(/\bPer writes\b/g, 'Pair writes').replace(/\bPer:/g, 'Pair:');
export const captionText = (t) => String(t).replace(/Cara Shell/g, 'CaraShell').replace(/\bPair writes\b/g, 'Per writes').replace(/\bPair:/g, 'Per:');
