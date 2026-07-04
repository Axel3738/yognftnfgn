// Fristående voiceover-verktyg — ElevenLabs (Svensk Martin + eleven_v3).
//
// Manus ligger som .txt, en mapp per annons:  scripts/<annons>/<klipp>.txt
//   scripts/A_pain_ruinsgrill/H1.txt      -> en hook
//   scripts/A_pain_ruinsgrill/body.txt    -> brödtexten
// Varje .txt = ett klipp → mp3 i  output/<annons>/<klipp>.mp3.
//
//   node vo.mjs                                  -> generera ALLA annonser, alla klipp
//   node vo.mjs --ad=B_authority_specsheet       -> bara annonser vars mappnamn matchar
//   node vo.mjs --only=H1                         -> bara klipp vars filnamn matchar
//   node vo.mjs --dry                             -> visa manus + teckenantal, inget API
//   node vo.mjs --list-voices                     -> lista rösterna på kontot
//   node vo.mjs --text="Hej" --name=test          -> engångsklipp utan manus-fil
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { generateVoiceover, listVoices, DEFAULTS, MAX_CHARS } from './elevenlabs.mjs';

const args = process.argv.slice(2);
const has = (f) => args.includes(f);
const val = (f, d = null) => {
  const a = args.find((x) => x.startsWith(`${f}=`));
  return a ? a.split('=').slice(1).join('=') : d;
};

const dry = has('--dry');

if (has('--list-voices')) {
  const voices = await listVoices();
  console.log(`Röster på kontot (${voices.length}):`);
  for (const v of voices) console.log(`  ${v.name}  —  ${v.id}`);
  process.exit(0);
}

const scriptsDir = new URL('./scripts/', import.meta.url);
const outRoot = new URL('./output/', import.meta.url);
const adFilter = val('--ad');
const only = val('--only');

// Bygg listan av klipp: { ad, name, text }.
let clips = [];
if (val('--text')) {
  clips = [{ ad: val('--ad', 'adhoc'), name: val('--name', 'vo-adhoc'), text: val('--text') }];
} else {
  const ads = (await readdir(scriptsDir, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !adFilter || name.includes(adFilter))
    .sort();
  for (const ad of ads) {
    const files = (await readdir(new URL(`./scripts/${ad}/`, import.meta.url)))
      .filter((f) => f.endsWith('.txt'))
      .filter((f) => !only || f.includes(only))
      .sort();
    for (const file of files) {
      const name = file.replace(/\.txt$/, '');
      const text = (await readFile(new URL(`./scripts/${ad}/${file}`, import.meta.url), 'utf8')).trim();
      clips.push({ ad, name, text });
    }
  }
}

console.log(
  `Voiceover: ${clips.length} klipp · röst "${DEFAULTS.voiceName}" · ${DEFAULTS.modelId}` +
  `${dry ? ' (DRY — inget API-anrop)' : ''}`
);

const results = [];
let currentAd = null;
for (const clip of clips) {
  if (clip.ad !== currentAd) {
    currentAd = clip.ad;
    console.log(`\n  ${currentAd}`);
  }
  const chars = clip.text.length;
  const over = chars > MAX_CHARS ? `  ⚠️ över ${MAX_CHARS} tecken` : '';
  if (dry) {
    console.log(`    • ${clip.name}  (${chars} tecken)${over}`);
    console.log(`        "${clip.text.replace(/\s+/g, ' ').slice(0, 84)}${chars > 84 ? '…' : ''}"`);
    results.push({ ad: clip.ad, name: clip.name, status: 'dry', chars });
    continue;
  }
  const adOut = new URL(`./${clip.ad}/`, outRoot);
  await mkdir(adOut, { recursive: true });
  const out = new URL(`${clip.name}.mp3`, adOut).pathname;
  try {
    const audio = await generateVoiceover(clip.text);
    await writeFile(out, audio);
    console.log(`    ✓ ${clip.name}  (${chars} tecken → ${(audio.length / 1024).toFixed(0)} kB)`);
    results.push({ ad: clip.ad, name: clip.name, status: 'ok', file: out, chars });
  } catch (e) {
    console.log(`    ✗ ${clip.name} — ${e.message}`);
    results.push({ ad: clip.ad, name: clip.name, status: 'error', error: e.message });
  }
}

if (!dry) {
  await mkdir(outRoot, { recursive: true });
  await writeFile(
    new URL('./_manifest.json', outRoot),
    JSON.stringify({ voice: DEFAULTS.voiceName, model: DEFAULTS.modelId, results }, null, 2)
  );
}
const ok = results.filter((r) => r.status === 'ok').length;
console.log(`\n${dry ? 'Klart (dry).' : `Klart. ${ok}/${clips.length} → voiceover/output/`}`);
