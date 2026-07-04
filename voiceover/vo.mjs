// Fristående voiceover-verktyg — generera tal (mp3) med ElevenLabs.
//   node vo.mjs                  -> genererar alla klipp i manus-vågen (Svensk Martin + eleven_v3)
//   node vo.mjs --dry            -> hoppar över API:et, visar bara text + teckenantal
//   node vo.mjs --wave=01        -> välj manus-fil scripts/vo-01.mjs (default 01)
//   node vo.mjs --only=VO-101    -> bara klipp vars namn innehåller strängen
//   node vo.mjs --limit=2        -> ta bara N första
//   node vo.mjs --list-voices    -> lista rösterna på kontot (namn + id)
//   node vo.mjs --text="Hej" --name=test  -> engångsklipp utan manus-fil
import { writeFile, mkdir } from 'node:fs/promises';
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

const waveArg = val('--wave', '01');
const only = val('--only');
const limit = val('--limit') ? parseInt(val('--limit'), 10) : Infinity;

// Ladda klipp: antingen engångs-text eller en manus-fil.
let clips;
if (val('--text')) {
  clips = [{ name: val('--name', 'vo-adhoc'), text: val('--text') }];
} else {
  ({ clips } = await import(`./scripts/vo-${waveArg}.mjs`));
}

let selected = only ? clips.filter((c) => c.name.includes(only)) : clips;
selected = selected.slice(0, limit);

const outDir = new URL(`./output/vo-${waveArg}/`, import.meta.url);
if (!dry) await mkdir(outDir, { recursive: true });

console.log(
  `Voiceover ${waveArg}: ${selected.length} klipp · röst "${DEFAULTS.voiceName}" · ${DEFAULTS.modelId}` +
  `${dry ? ' (DRY — inget API-anrop)' : ''}`
);

const results = [];
for (const clip of selected) {
  const chars = clip.text.length;
  const over = chars > MAX_CHARS ? `  ⚠️ över ${MAX_CHARS} tecken` : '';
  if (dry) {
    console.log(`  • ${clip.name}  (${chars} tecken)${over}`);
    console.log(`      "${clip.text.replace(/\s+/g, ' ').slice(0, 90)}${chars > 90 ? '…' : ''}"`);
    results.push({ name: clip.name, status: 'dry', chars });
    continue;
  }
  const out = new URL(`${clip.name}.mp3`, outDir).pathname;
  try {
    const audio = await generateVoiceover(clip.text, {
      voiceName: clip.voice || DEFAULTS.voiceName,
      modelId: clip.model || DEFAULTS.modelId,
      ...(clip.voiceSettings ? { voiceSettings: clip.voiceSettings } : {}),
    });
    await writeFile(out, audio);
    console.log(`  ✓ ${clip.name}  (${chars} tecken → ${(audio.length / 1024).toFixed(0)} kB)`);
    results.push({ name: clip.name, status: 'ok', file: out, chars });
  } catch (e) {
    console.log(`  ✗ ${clip.name} — ${e.message}`);
    results.push({ name: clip.name, status: 'error', error: e.message });
  }
}

if (!dry) {
  await writeFile(
    new URL('./_manifest.json', outDir),
    JSON.stringify(
      { wave: waveArg, voice: DEFAULTS.voiceName, model: DEFAULTS.modelId, results }, null, 2
    )
  );
}
const ok = results.filter((r) => r.status === 'ok').length;
console.log(
  dry ? 'Klart (dry).' : `Klart. ${ok}/${selected.length} → voiceover/output/vo-${waveArg}/`
);
