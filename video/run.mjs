// Orchestrator för video-vågen.
//   node run.mjs --dry            -> bygg storyboard + captions + shot-prompts (0 kr, 0 API)
//   node run.mjs                  -> generera klipp via Higgsfield + stitcha med ffmpeg
//   node run.mjs --wave=01        -> välj våg (default 01)
//   node run.mjs --only=specsheet -> filtrera på namn
//   node run.mjs --limit=1        -> ta bara N koncept
import { writeFile, mkdir } from 'node:fs/promises';
import { buildStoryboard, buildAss, totalDuration } from './storyboard.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const waveArg = (args.find((a) => a.startsWith('--wave=')) || '--wave=01').split('=')[1];
const onlyArg = args.find((a) => a.startsWith('--only='));
const only = onlyArg ? onlyArg.split('=')[1] : null;
const limitArg = args.find((a) => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

const outDir = new URL(`./output/wave-${waveArg}/`, import.meta.url);
await mkdir(outDir, { recursive: true });

const { ads: all } = await import(`./waves/wave-${waveArg}.mjs`);
let concepts = only ? all.filter((c) => c.name.includes(only)) : all;
concepts = concepts.slice(0, limit);
console.log(`Wave ${waveArg}: ${concepts.length} video-koncept ${dry ? '(DRY — storyboard, ingen generering)' : ''}`);

async function fetchToFile(url, path) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Kunde inte hämta klipp: ${res.status}`);
  await writeFile(path, Buffer.from(await res.arrayBuffer()));
}

const results = [];
for (const concept of concepts) {
  const base = new URL(`${concept.name}`, outDir).pathname;
  try {
    // Granskningsartefakter skrivs ALLTID (även live) — de är kvittot på kreativet.
    await writeFile(`${base}.storyboard.md`, buildStoryboard(concept));
    await writeFile(`${base}.captions.ass`, buildAss(concept));
    await writeFile(`${base}.shots.json`, JSON.stringify(concept.shots, null, 2));

    if (dry) {
      console.log(`  ✓ ${concept.name} — storyboard (${totalDuration(concept)}s, ${concept.shots.length} shots)`);
      results.push({ name: concept.name, status: 'storyboard', shots: concept.shots.length });
      continue;
    }

    // Live: lazy-importera generering/compose så dry inte drar in ffmpeg/nätverk.
    const { generateClip } = await import('./higgsfield-video.mjs');
    const { compose } = await import('./compose.mjs');
    const clips = [];
    for (const shot of concept.shots) {
      const url = await generateClip(shot, { durationSec: shot.endSec - shot.startSec });
      const file = `${base}.${shot.id}.mp4`;
      await fetchToFile(url, file);
      clips.push({ id: shot.id, file });
      console.log(`    · ${concept.name} ${shot.id} ✓`);
    }
    const out = `${base}.mp4`;
    await compose({ clips, concept, out });
    console.log(`  ✓ ${concept.name} → ${out}`);
    results.push({ name: concept.name, status: 'ok', file: out });
  } catch (e) {
    console.log(`  ✗ ${concept.name} — ${e.message}`);
    results.push({ name: concept.name, status: 'error', error: e.message });
  }
}

await writeFile(new URL('./_manifest.json', outDir),
  JSON.stringify({ wave: waveArg, dry, results }, null, 2));
const ok = results.filter((r) => r.status === 'ok' || r.status === 'storyboard').length;
console.log(`Klart. ${ok}/${concepts.length} → video/output/wave-${waveArg}/`);
