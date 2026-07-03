// Orchestrator: bygg en hel våg av statics.
//   node run.mjs                 -> genererar bas via Higgsfield + lägger overlay
//   node run.mjs --dry           -> hoppar över Higgsfield, charcoal-bakgrund (förhandsgranska layout)
//   node run.mjs --wave=01       -> välj våg (default 01)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { compose } from './compose.mjs';
import { generateBase } from './higgsfield.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const waveArg = (args.find(a => a.startsWith('--wave=')) || '--wave=01').split('=')[1];
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
const onlyArg = args.find(a => a.startsWith('--only='));
const only = onlyArg ? onlyArg.split('=')[1] : null;

const outDir = new URL(`./output/wave-${waveArg}/`, import.meta.url);
await mkdir(outDir, { recursive: true });

const { ads: allAds } = await import(`./waves/wave-${waveArg}.mjs`);
let ads = only ? allAds.filter(a => a.name.includes(only)) : allAds;
ads = ads.slice(0, limit);
console.log(`Wave ${waveArg}: ${ads.length} statics ${dry ? '(DRY — ingen Higgsfield)' : ''}`);

async function fetchToBuffer(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Kunde inte hämta bild: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const results = [];
for (const ad of ads) {
  const out = new URL(`${ad.name}.png`, outDir).pathname;
  try {
    let baseInput = null;
    if (!dry) {
      const url = await generateBase(ad.basePrompt, { seed: ad.seed });
      baseInput = await fetchToBuffer(url);
    }
    await compose({ baseInput, ...ad.overlay, out });
    console.log(`  ✓ ${ad.name}`);
    results.push({ name: ad.name, status: 'ok', file: out });
  } catch (e) {
    console.log(`  ✗ ${ad.name} — ${e.message}`);
    results.push({ name: ad.name, status: 'error', error: e.message });
  }
}

await writeFile(new URL('./_manifest.json', outDir),
  JSON.stringify({ wave: waveArg, dry, generatedAt: null, results }, null, 2));
console.log(`Klart. ${results.filter(r => r.status === 'ok').length}/${ads.length} → pipeline/output/wave-${waveArg}/`);
