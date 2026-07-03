// Tunn wrapper runt Higgsfield Soul (text2image). Returnerar en bild-URL.
// Kräver env: HF_API_KEY + HF_SECRET  (eller HF_CREDENTIALS="KEY_ID:KEY_SECRET").
let _client = null;

async function getClient() {
  if (_client) return _client;
  const { HiggsfieldClient } = await import('@higgsfield/client');
  const apiKey = process.env.HF_API_KEY;
  const apiSecret = process.env.HF_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error('Saknar HF_API_KEY / HF_SECRET i miljön. Kör med --dry för att förhandsgranska utan Higgsfield.');
  }
  _client = new HiggsfieldClient({ apiKey, apiSecret });
  return _client;
}

// Genererar en bas-bild och returnerar URL till första resultatet.
export async function generateBase(prompt, { seed: seedVal } = {}) {
  const client = await getClient();
  const mod = await import('@higgsfield/client'); // helpers exporteras från huvudmodulen
  const { SoulQuality, SoulSize, BatchSize, seed } = mod;
  const params = {
    prompt,
    width_and_height: SoulSize.PORTRAIT_1536x2048, // 3:4, croppas till 4:5 i compose
    quality: SoulQuality.HD,
    batch_size: BatchSize.SINGLE,
  };
  if (seedVal != null && seed) params.seed = seed(seedVal);
  const jobSet = await client.generate('/v1/text2image/soul', params, { withPolling: true });
  if (!jobSet.isCompleted) throw new Error('Higgsfield-jobbet blev inte klart.');
  const url = jobSet.jobs?.[0]?.results?.raw?.url;
  if (!url) throw new Error('Ingen bild-URL i svaret.');
  return url;
}
